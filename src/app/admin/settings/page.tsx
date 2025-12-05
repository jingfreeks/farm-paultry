"use client";

import { useState, useRef, useEffect } from "react";
import { useCompanySettings } from "@/hooks/useCompanySettings";
import { createClient } from "@/lib/supabase/client";
import { useAdminAuth } from "@/hooks/useAdminAuth";

export default function SettingsPage() {
  const { settings, loading, updateSettings } = useCompanySettings();
  const { user } = useAdminAuth();
  const [formData, setFormData] = useState({
    company_name: "",
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize form data when settings load
  useEffect(() => {
    if (settings) {
      setFormData({
        company_name: settings.company_name || "",
      });
    }
  }, [settings]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

      // Delete old logo if exists
      if (settings?.logo_url) {
        const oldPath = settings.logo_url.split('/').slice(-1)[0];
        await supabase.storage.from('avatars').remove([`company/${oldPath}`]);
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `company-logo-${Date.now()}.${fileExt}`;
      const filePath = `company/${fileName}`;

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
          throw new Error('Storage bucket "avatars" not found. Please create it in Supabase Dashboard → Storage.');
        }
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update settings with new logo URL
      const result = await updateSettings({
        logo_url: publicUrl,
      });

      if (result.success) {
        setSuccess('Company logo updated successfully!');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        throw new Error(result.error || 'Failed to update logo');
      }
    } catch (err) {
      let errorMsg = 'Failed to upload logo';
      if (err instanceof Error) {
        errorMsg = err.message;
        if (err.message.includes('Bucket not found') || err.message.includes('not found')) {
          errorMsg = 'Storage bucket not set up. Please create "avatars" bucket in Supabase Dashboard → Storage.';
        }
      }
      setError(errorMsg);
      console.error('Logo upload error:', err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveLogo = async () => {
    if (!settings?.logo_url) return;

    setUploading(true);
    setError(null);

    try {
      const supabase = createClient();

      // Delete from storage
      const oldPath = settings.logo_url.split('/').slice(-1)[0];
      await supabase.storage.from('avatars').remove([`company/${oldPath}`]);

      // Update settings to remove logo_url
      const result = await updateSettings({
        logo_url: null,
      });

      if (result.success) {
        setSuccess('Company logo removed successfully!');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        throw new Error(result.error || 'Failed to remove logo');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to remove logo';
      setError(errorMsg);
      console.error('Remove logo error:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await updateSettings({
        company_name: formData.company_name || null,
      });

      if (result.success) {
        setSuccess('Company settings updated successfully!');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const errorMsg = result.error || "Failed to update settings";
        setError(errorMsg);
        console.error("Settings update failed:", errorMsg);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMsg);
      console.error("Settings update error:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-terracotta border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl font-bold text-bark">Company Settings</h1>
        <p className="text-charcoal/60 mt-2">Manage your company information and branding</p>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-600">
          {success}
        </div>
      )}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
          {error}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Company Logo */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-wheat">
          <h2 className="font-serif text-xl font-bold text-bark mb-4">Company Logo</h2>
          
          <div className="space-y-4">
            {/* Logo Display */}
            <div className="flex items-center justify-center">
              {settings?.logo_url ? (
                <div className="relative">
                  <img
                    src={settings.logo_url}
                    alt={settings.company_name || "Company Logo"}
                    className="max-w-full max-h-48 object-contain"
                  />
                  {uploading && (
                    <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                      <div className="w-8 h-8 border-2 border-cream border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-48 h-48 bg-wheat rounded-lg flex items-center justify-center border-2 border-dashed border-charcoal/20">
                  <div className="text-center">
                    <svg className="w-12 h-12 text-charcoal/40 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm text-charcoal/60">No logo uploaded</p>
                  </div>
                </div>
              )}
            </div>

            {/* Upload/Remove Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex-1 px-4 py-2 bg-olive text-cream rounded-xl font-medium hover:bg-olive-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                {uploading ? 'Uploading...' : 'Upload Logo'}
              </button>
              {settings?.logo_url && (
                <button
                  onClick={handleRemoveLogo}
                  disabled={uploading}
                  className="px-4 py-2 bg-red-500 text-cream rounded-xl font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Remove
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />
            <p className="text-xs text-charcoal/60">
              Recommended: PNG or JPG, max 5MB. Logo will be displayed on your website.
            </p>
          </div>
        </div>

        {/* Company Information */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-wheat">
          <h2 className="font-serif text-xl font-bold text-bark mb-4">Company Information</h2>
          
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-bark mb-2">
                Company Name *
              </label>
              <input
                type="text"
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-wheat bg-white focus:border-olive focus:ring-2 focus:ring-olive/20 outline-none transition-all"
                placeholder="Golden Harvest Farm"
                required
              />
              <p className="text-xs text-charcoal/60 mt-1">
                This name will be displayed throughout your website.
              </p>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={saving}
                className="w-full px-4 py-3 bg-olive text-cream rounded-xl font-medium hover:bg-olive-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Preview Section */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-wheat">
        <h2 className="font-serif text-xl font-bold text-bark mb-4">Preview</h2>
        <div className="bg-cream/50 rounded-xl p-6 border border-wheat">
          <div className="flex items-center gap-4">
            {settings?.logo_url ? (
              <img
                src={settings.logo_url}
                alt={settings.company_name || "Company Logo"}
                className="h-12 object-contain"
              />
            ) : (
              <div className="w-12 h-12 bg-olive rounded-lg flex items-center justify-center text-cream font-bold">
                {(settings?.company_name || 'C').charAt(0)}
              </div>
            )}
            <div>
              <h3 className="font-serif text-2xl font-bold text-bark">
                {settings?.company_name || "Company Name"}
              </h3>
              <p className="text-sm text-charcoal/60">This is how your company appears</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

