"use client";

import { useCart } from "@/context/CartContext";
import { useEffect } from "react";

export default function Cart() {
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice,
  } = useCart();

  // Close cart on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCart();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [closeCart]);

  // Prevent body scroll when cart is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-bark/50 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeCart}
      />

      {/* Cart Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-cream z-50 shadow-2xl transform transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-wheat">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-terracotta rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-cream" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h2 className="font-serif text-xl font-bold text-bark">Your Cart</h2>
                <p className="text-sm text-charcoal/60">
                  {totalItems} {totalItems === 1 ? "item" : "items"}
                </p>
              </div>
            </div>
            <button
              onClick={closeCart}
              className="w-10 h-10 rounded-full bg-wheat flex items-center justify-center text-charcoal hover:bg-terracotta hover:text-cream transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-6">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-24 h-24 bg-wheat rounded-full flex items-center justify-center mb-6">
                  <svg className="w-12 h-12 text-charcoal/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="font-serif text-xl font-bold text-bark mb-2">Your cart is empty</h3>
                <p className="text-charcoal/60 mb-6">Add some delicious farm-fresh products!</p>
                <button
                  onClick={closeCart}
                  className="px-6 py-3 bg-olive text-cream font-semibold rounded-full hover:bg-olive-dark transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex gap-4 p-4 bg-white rounded-2xl shadow-sm"
                  >
                    {/* Product Image */}
                    <div className="w-20 h-20 bg-gradient-to-br from-wheat to-cream rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-4xl">{item.product.emoji}</span>
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-serif font-bold text-bark truncate">
                        {item.product.name}
                      </h3>
                      <p className="text-sm text-charcoal/60">
                        ${item.product.price.toFixed(2)} {item.product.unit}
                      </p>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3 mt-2">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="w-7 h-7 rounded-full bg-wheat flex items-center justify-center text-charcoal hover:bg-terracotta hover:text-cream transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                        </button>
                        <span className="font-semibold text-bark w-8 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="w-7 h-7 rounded-full bg-wheat flex items-center justify-center text-charcoal hover:bg-olive hover:text-cream transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Price & Remove */}
                    <div className="flex flex-col items-end justify-between">
                      <button
                        onClick={() => removeItem(item.product.id)}
                        className="text-charcoal/40 hover:text-terracotta transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                      <span className="font-serif font-bold text-terracotta">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}

                {/* Clear Cart */}
                <button
                  onClick={clearCart}
                  className="w-full py-2 text-sm text-charcoal/60 hover:text-terracotta transition-colors"
                >
                  Clear Cart
                </button>
              </div>
            )}
          </div>

          {/* Footer - Checkout */}
          {items.length > 0 && (
            <div className="p-6 border-t border-wheat bg-white">
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-charcoal/70">
                  <span>Subtotal</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-charcoal/70">
                  <span>Shipping</span>
                  <span className="text-olive">Free</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-bark pt-3 border-t border-wheat">
                  <span>Total</span>
                  <span className="font-serif text-terracotta">${totalPrice.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  // Handle checkout
                  alert("Checkout functionality coming soon!");
                }}
                className="w-full py-4 bg-terracotta text-cream font-semibold rounded-full hover:bg-terracotta-dark transition-colors shadow-lg shadow-terracotta/30"
              >
                Proceed to Checkout
              </button>

              <p className="text-center text-xs text-charcoal/50 mt-4">
                🔒 Secure checkout powered by Stripe
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

