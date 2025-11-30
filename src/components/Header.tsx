"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";

interface HeaderProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

const navigation = [
  { name: "Home", href: "#home" },
  { name: "Products", href: "#products" },
  { name: "About", href: "#about" },
  { name: "Contact", href: "#contact" },
];

export default function Header({ mobileMenuOpen, setMobileMenuOpen }: HeaderProps) {
  const { toggleCart, totalItems } = useCart();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-cream/90 backdrop-blur-md border-b border-wheat">
      <nav className="mx-auto max-w-7xl px-6 lg:px-8" aria-label="Top">
        <div className="flex w-full items-center justify-between py-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-olive rounded-full flex items-center justify-center">
              <svg className="w-7 h-7 text-cream" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.5 2 6 4.5 6 7c0 1.5.5 2.5 1.5 3.5-1 .5-2 1.5-2.5 3-.5 1.5 0 3 1 4 1 1 2.5 1.5 4 1.5h4c1.5 0 3-.5 4-1.5s1.5-2.5 1-4c-.5-1.5-1.5-2.5-2.5-3 1-1 1.5-2 1.5-3.5 0-2.5-2.5-5-6-5zm-2 6c-.5 0-1-.5-1-1s.5-1 1-1 1 .5 1 1-.5 1-1 1zm4 0c-.5 0-1-.5-1-1s.5-1 1-1 1 .5 1 1-.5 1-1 1zm-2 4l-1 3h-2l2-4h1zm0 0l1 3h2l-2-4h-1z"/>
              </svg>
            </div>
            <div>
              <h1 className="font-serif text-xl font-bold text-bark tracking-tight">
                Golden Harvest
              </h1>
              <p className="text-xs text-olive font-medium tracking-widest uppercase">
                Farm & Poultry
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm font-medium text-charcoal hover:text-terracotta transition-colors duration-200 relative group"
              >
                {item.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-terracotta transition-all duration-200 group-hover:w-full" />
              </Link>
            ))}
            
            {/* Cart Button */}
            <button
              onClick={toggleCart}
              className="relative p-2 text-charcoal hover:text-terracotta transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-terracotta text-cream text-xs font-bold rounded-full flex items-center justify-center animate-scale-in">
                  {totalItems > 99 ? "99+" : totalItems}
                </span>
              )}
            </button>

            <Link
              href="#contact"
              className="ml-4 px-6 py-2.5 bg-terracotta text-cream text-sm font-semibold rounded-full hover:bg-terracotta-dark transition-all duration-200 shadow-lg shadow-terracotta/20 hover:shadow-terracotta/40"
            >
              Order Now
            </Link>
          </div>

          {/* Mobile: Cart & Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            {/* Cart Button - Mobile */}
            <button
              onClick={toggleCart}
              className="relative p-2 text-charcoal hover:text-terracotta transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-terracotta text-cream text-xs font-bold rounded-full flex items-center justify-center">
                  {totalItems > 99 ? "99+" : totalItems}
                </span>
              )}
            </button>

            {/* Menu Button */}
            <button
              type="button"
              className="p-2 text-charcoal"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Toggle menu</span>
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-wheat">
            <div className="flex flex-col gap-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-base font-medium text-charcoal hover:text-terracotta transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <Link
                href="#contact"
                className="mt-2 px-6 py-3 bg-terracotta text-cream text-center font-semibold rounded-full"
                onClick={() => setMobileMenuOpen(false)}
              >
                Order Now
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
