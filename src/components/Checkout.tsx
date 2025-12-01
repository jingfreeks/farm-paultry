"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useCheckout, CheckoutFormData } from "@/hooks/useCheckout";

interface CheckoutProps {
  isOpen: boolean;
  onClose: () => void;
}

type CheckoutStep = "contact" | "shipping" | "review" | "success";

const initialFormData: CheckoutFormData = {
  email: "",
  fullName: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  zipCode: "",
  notes: "",
};

export default function Checkout({ isOpen, onClose }: CheckoutProps) {
  const [step, setStep] = useState<CheckoutStep>("contact");
  const [formData, setFormData] = useState<CheckoutFormData>(initialFormData);
  const [orderId, setOrderId] = useState<string | null>(null);
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const { submitOrder, loading, error } = useCheckout();

  // Pre-fill form with user data if logged in
  useEffect(() => {
    if (user && isOpen) {
      setFormData(prev => ({
        ...prev,
        email: user.email || "",
        fullName: user.user_metadata?.full_name || "",
      }));
    }
  }, [user, isOpen]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStep("contact");
        setFormData(initialFormData);
        setOrderId(null);
      }, 300);
    }
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && step !== "success") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose, step]);

  const updateField = (field: keyof CheckoutFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmitOrder = async () => {
    const result = await submitOrder(formData, items, totalPrice);
    if (result.success) {
      setOrderId(result.orderId || null);
      setStep("success");
      clearCart();
    }
  };

  const canProceedContact = formData.email && formData.fullName;
  const canProceedShipping = formData.address && formData.city && formData.state && formData.zipCode;

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-bark/60 backdrop-blur-sm z-[60] transition-opacity duration-300"
        onClick={step !== "success" ? onClose : undefined}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 overflow-y-auto">
        <div
          className="bg-cream rounded-3xl shadow-2xl w-full max-w-2xl my-8 overflow-hidden animate-scale-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative bg-gradient-to-br from-olive to-olive-dark p-6">
            {step !== "success" && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-cream hover:bg-white/30 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}

            <h2 className="font-serif text-2xl font-bold text-cream">
              {step === "contact" && "Contact Information"}
              {step === "shipping" && "Shipping Address"}
              {step === "review" && "Review Your Order"}
              {step === "success" && "Order Confirmed!"}
            </h2>

            {/* Progress Steps */}
            {step !== "success" && (
              <div className="flex items-center gap-2 mt-4">
                {["contact", "shipping", "review"].map((s, i) => (
                  <div key={s} className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                        step === s
                          ? "bg-cream text-olive"
                          : ["contact", "shipping", "review"].indexOf(step) > i
                          ? "bg-cream/80 text-olive"
                          : "bg-white/20 text-cream/60"
                      }`}
                    >
                      {["contact", "shipping", "review"].indexOf(step) > i ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        i + 1
                      )}
                    </div>
                    {i < 2 && (
                      <div
                        className={`w-12 h-1 mx-1 rounded ${
                          ["contact", "shipping", "review"].indexOf(step) > i
                            ? "bg-cream/80"
                            : "bg-white/20"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                {error}
              </div>
            )}

            {/* Step 1: Contact Information */}
            {step === "contact" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-bark mb-2">
                    Email Address <span className="text-terracotta">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-wheat bg-white focus:border-olive focus:ring-2 focus:ring-olive/20 outline-none transition-all"
                    placeholder="you@example.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-bark mb-2">
                    Full Name <span className="text-terracotta">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => updateField("fullName", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-wheat bg-white focus:border-olive focus:ring-2 focus:ring-olive/20 outline-none transition-all"
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-bark mb-2">
                    Phone Number <span className="text-charcoal/50">(Optional)</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-wheat bg-white focus:border-olive focus:ring-2 focus:ring-olive/20 outline-none transition-all"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <button
                  onClick={() => setStep("shipping")}
                  disabled={!canProceedContact}
                  className="w-full py-3 bg-terracotta text-cream font-semibold rounded-xl hover:bg-terracotta-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                >
                  Continue to Shipping
                </button>
              </div>
            )}

            {/* Step 2: Shipping Address */}
            {step === "shipping" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-bark mb-2">
                    Street Address <span className="text-terracotta">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => updateField("address", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-wheat bg-white focus:border-olive focus:ring-2 focus:ring-olive/20 outline-none transition-all"
                    placeholder="123 Farm Lane"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-bark mb-2">
                      City <span className="text-terracotta">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => updateField("city", e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-wheat bg-white focus:border-olive focus:ring-2 focus:ring-olive/20 outline-none transition-all"
                      placeholder="Springfield"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-bark mb-2">
                      State <span className="text-terracotta">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => updateField("state", e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-wheat bg-white focus:border-olive focus:ring-2 focus:ring-olive/20 outline-none transition-all"
                      placeholder="CA"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-bark mb-2">
                    ZIP Code <span className="text-terracotta">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.zipCode}
                    onChange={(e) => updateField("zipCode", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-wheat bg-white focus:border-olive focus:ring-2 focus:ring-olive/20 outline-none transition-all"
                    placeholder="90210"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-bark mb-2">
                    Order Notes <span className="text-charcoal/50">(Optional)</span>
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => updateField("notes", e.target.value)}
                    rows={2}
                    className="w-full px-4 py-3 rounded-xl border border-wheat bg-white focus:border-olive focus:ring-2 focus:ring-olive/20 outline-none transition-all resize-none"
                    placeholder="Any special delivery instructions..."
                  />
                </div>

                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => setStep("contact")}
                    className="flex-1 py-3 bg-wheat text-charcoal font-semibold rounded-xl hover:bg-wheat/70 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep("review")}
                    disabled={!canProceedShipping}
                    className="flex-1 py-3 bg-terracotta text-cream font-semibold rounded-xl hover:bg-terracotta-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Review Order
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Review Order */}
            {step === "review" && (
              <div className="space-y-6">
                {/* Order Items */}
                <div>
                  <h3 className="font-semibold text-bark mb-3">Order Items</h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {items.map((item) => (
                      <div
                        key={item.product.id}
                        className="flex items-center justify-between p-3 bg-white rounded-xl"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{item.product.emoji}</span>
                          <div>
                            <p className="font-medium text-bark">{item.product.name}</p>
                            <p className="text-sm text-charcoal/60">Qty: {item.quantity}</p>
                          </div>
                        </div>
                        <span className="font-semibold text-terracotta">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Contact & Shipping Summary */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-white rounded-xl">
                    <h4 className="font-semibold text-bark mb-2 flex items-center gap-2">
                      <svg className="w-4 h-4 text-olive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Contact
                    </h4>
                    <p className="text-sm text-charcoal/70">{formData.fullName}</p>
                    <p className="text-sm text-charcoal/70">{formData.email}</p>
                    {formData.phone && <p className="text-sm text-charcoal/70">{formData.phone}</p>}
                  </div>
                  <div className="p-4 bg-white rounded-xl">
                    <h4 className="font-semibold text-bark mb-2 flex items-center gap-2">
                      <svg className="w-4 h-4 text-olive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Shipping
                    </h4>
                    <p className="text-sm text-charcoal/70">{formData.address}</p>
                    <p className="text-sm text-charcoal/70">
                      {formData.city}, {formData.state} {formData.zipCode}
                    </p>
                  </div>
                </div>

                {/* Order Total */}
                <div className="p-4 bg-olive/10 rounded-xl">
                  <div className="flex justify-between text-charcoal/70 mb-2">
                    <span>Subtotal</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-charcoal/70 mb-2">
                    <span>Shipping</span>
                    <span className="text-olive font-medium">Free</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-bark pt-2 border-t border-olive/20">
                    <span>Total</span>
                    <span className="font-serif text-terracotta">${totalPrice.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep("shipping")}
                    disabled={loading}
                    className="flex-1 py-3 bg-wheat text-charcoal font-semibold rounded-xl hover:bg-wheat/70 transition-colors disabled:opacity-50"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleSubmitOrder}
                    disabled={loading}
                    className="flex-1 py-3 bg-terracotta text-cream font-semibold rounded-xl hover:bg-terracotta-dark transition-colors shadow-lg shadow-terracotta/30 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      "Place Order"
                    )}
                  </button>
                </div>

                <p className="text-center text-xs text-charcoal/50">
                  🔒 Your information is secure and encrypted
                </p>
              </div>
            )}

            {/* Step 4: Success */}
            {step === "success" && (
              <div className="text-center py-6">
                <div className="w-20 h-20 bg-olive/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-scale-in">
                  <svg className="w-10 h-10 text-olive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>

                <h3 className="font-serif text-2xl font-bold text-bark mb-2">
                  Thank You for Your Order!
                </h3>
                <p className="text-charcoal/70 mb-4">
                  Your order has been successfully placed.
                </p>

                {orderId && (
                  <div className="inline-block px-4 py-2 bg-wheat rounded-xl mb-6">
                    <p className="text-sm text-charcoal/60">Order ID</p>
                    <p className="font-mono font-bold text-bark">{orderId}</p>
                  </div>
                )}

                <div className="p-4 bg-olive/10 rounded-xl text-left mb-6">
                  <h4 className="font-semibold text-bark mb-2">What&apos;s Next?</h4>
                  <ul className="space-y-2 text-sm text-charcoal/70">
                    <li className="flex items-start gap-2">
                      <span className="text-olive mt-0.5">✓</span>
                      You&apos;ll receive an email confirmation at {formData.email}
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-olive mt-0.5">✓</span>
                      We&apos;ll prepare your fresh farm products
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-olive mt-0.5">✓</span>
                      Your order will be delivered within 2-3 business days
                    </li>
                  </ul>
                </div>

                <button
                  onClick={onClose}
                  className="w-full py-3 bg-terracotta text-cream font-semibold rounded-xl hover:bg-terracotta-dark transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

