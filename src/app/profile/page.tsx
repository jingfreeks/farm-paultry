"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading, updateProfile } = useUserProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize form data when profile loads
  useEffect(() => {
    if (profile && !isEditing) {
      setFormData({
        full_name: profile.full_name || "",
        phone: profile.phone || "",
      });
    }
  }, [profile, isEditing]);

  // Redirect if not authenticated
  if (!authLoading && !user) {
    router.push("/");
    return null;
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await updateProfile({
        full_name: formData.full_name || null,
        phone: formData.phone || null,
      });

      if (result.success) {
        setSuccess("Profile updated successfully!");
        setIsEditing(false);
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const errorMsg = result.error || "Failed to update profile";
        setError(errorMsg);
        console.error("Profile update failed:", errorMsg);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMsg);
      console.error("Profile update error:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || "",
        phone: profile.phone || "",
      });
    }
    setIsEditing(false);
    setError(null);
    setSuccess(null);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      setTimeout(() => setError(null), 3000);
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      setTimeout(() => setError(null), 3000);
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const supabase = createClient();

      // Delete old avatar if exists
      if (profile?.avatar_url) {
        const oldPath = profile.avatar_url.split('/').slice(-2).join('/');
        await supabase.storage.from('avatars').remove([oldPath]);
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        // Check if bucket doesn't exist
        if (uploadError.message?.includes('Bucket not found') || uploadError.message?.includes('not found')) {
          throw new Error('Storage bucket "avatars" not found. Please create it in Supabase Dashboard → Storage. See setup instructions in the migration file.');
        }
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile with new avatar URL
      const result = await updateProfile({
        avatar_url: publicUrl,
      });

      if (result.success) {
        setSuccess('Profile picture updated successfully!');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        throw new Error(result.error || 'Failed to update profile picture');
      }
    } catch (err) {
      let errorMsg = 'Failed to upload image';
      if (err instanceof Error) {
        errorMsg = err.message;
        // Provide helpful instructions for bucket not found
        if (err.message.includes('Bucket not found') || err.message.includes('not found')) {
          errorMsg = 'Storage bucket not set up. Please create "avatars" bucket in Supabase Dashboard → Storage, or run: node scripts/setup-avatar-bucket.js';
        }
      }
      setError(errorMsg);
      console.error('Image upload error:', err);
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveAvatar = async () => {
    if (!user || !profile?.avatar_url) return;

    setUploading(true);
    setError(null);

    try {
      const supabase = createClient();

      // Delete from storage
      const oldPath = profile.avatar_url.split('/').slice(-2).join('/');
      await supabase.storage.from('avatars').remove([oldPath]);

      // Update profile to remove avatar_url
      const result = await updateProfile({
        avatar_url: null,
      });

      if (result.success) {
        setSuccess('Profile picture removed successfully!');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        throw new Error(result.error || 'Failed to remove profile picture');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to remove image';
      setError(errorMsg);
      console.error('Remove avatar error:', err);
    } finally {
      setUploading(false);
    }
  };

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-olive border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-cream pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-olive hover:text-terracotta transition-colors mb-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
          <h1 className="font-serif text-3xl font-bold text-bark">My Profile</h1>
          <p className="text-charcoal/60 mt-2">Manage your account information and preferences</p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-600">
            {success}
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
              <div className="text-center">
                {/* Profile Picture */}
                <div className="relative inline-block mb-4">
                  {profile?.avatar_url ? (
                    <div className="relative">
                      <img
                        src={profile.avatar_url}
                        alt={profile?.full_name || "Profile"}
                        className="w-24 h-24 rounded-full object-cover border-4 border-olive"
                      />
                      {uploading && (
                        <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                          <div className="w-6 h-6 border-2 border-cream border-t-transparent rounded-full animate-spin" />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-24 h-24 bg-olive rounded-full flex items-center justify-center text-cream text-3xl font-bold">
                      {profile?.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase() || "U"}
                    </div>
                  )}
                  {/* Upload Button */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="absolute bottom-0 right-0 w-8 h-8 bg-olive text-cream rounded-full flex items-center justify-center hover:bg-olive-dark transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Upload profile picture"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
                {profile?.avatar_url && (
                  <button
                    onClick={handleRemoveAvatar}
                    disabled={uploading}
                    className="text-sm text-red-500 hover:text-red-700 mb-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Remove picture
                  </button>
                )}
                <h2 className="font-serif text-xl font-bold text-bark mb-1">
                  {profile?.full_name || "User"}
                </h2>
                <p className="text-sm text-charcoal/60 mb-4">{user.email}</p>
                <div className="inline-block px-3 py-1 bg-olive/10 text-olive rounded-full text-xs font-medium capitalize">
                  {profile?.role || "customer"}
                </div>
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-serif text-xl font-bold text-bark">Account Information</h3>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-olive text-cream rounded-xl font-medium hover:bg-olive-dark transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Profile
                  </button>
                )}
              </div>

              <form onSubmit={handleSave} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-bark mb-2">Email</label>
                  <input
                    type="email"
                    value={user.email || ""}
                    disabled
                    className="w-full px-4 py-3 rounded-xl border border-wheat bg-wheat/30 text-charcoal/60 outline-none cursor-not-allowed"
                  />
                  <p className="text-xs text-charcoal/40 mt-1">Email cannot be changed</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-bark mb-2">Full Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-wheat bg-white focus:border-olive focus:ring-2 focus:ring-olive/20 outline-none transition-all"
                      placeholder="John Doe"
                    />
                  ) : (
                    <div className="px-4 py-3 rounded-xl border border-wheat bg-cream/50 text-bark">
                      {profile?.full_name || "Not set"}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-bark mb-2">Phone Number</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-wheat bg-white focus:border-olive focus:ring-2 focus:ring-olive/20 outline-none transition-all"
                      placeholder="+1 (555) 123-4567"
                    />
                  ) : (
                    <div className="px-4 py-3 rounded-xl border border-wheat bg-cream/50 text-bark">
                      {profile?.phone || "Not set"}
                    </div>
                  )}
                </div>

                {isEditing && (
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="flex-1 px-4 py-3 bg-wheat text-charcoal rounded-xl font-medium hover:bg-wheat/70 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 px-4 py-3 bg-olive text-cream rounded-xl font-medium hover:bg-olive-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                )}
              </form>
            </div>

            {/* Account Stats */}
            <div className="mt-6 bg-white rounded-2xl shadow-sm p-6">
              <h3 className="font-serif text-xl font-bold text-bark mb-4">Account Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-wheat/50">
                  <span className="text-charcoal/60">Member Since</span>
                  <span className="text-bark font-medium">
                    {profile?.created_at
                      ? new Date(profile.created_at).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-wheat/50">
                  <span className="text-charcoal/60">Account Status</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    profile?.is_active
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}>
                    {profile?.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-charcoal/60">Last Updated</span>
                  <span className="text-bark font-medium">
                    {profile?.updated_at
                      ? new Date(profile.updated_at).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

