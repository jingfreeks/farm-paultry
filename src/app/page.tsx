"use client";

import { useState } from "react";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Products from "@/components/Products";
import About from "@/components/About";
import Features from "@/components/Features";
import Testimonials from "@/components/Testimonials";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import Cart from "@/components/Cart";
import AuthModal from "@/components/AuthModal";

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  return (
    <AuthProvider>
      <CartProvider>
        <div className="min-h-screen bg-cream overflow-x-hidden">
          <Header 
            mobileMenuOpen={mobileMenuOpen} 
            setMobileMenuOpen={setMobileMenuOpen}
            onOpenAuth={() => setAuthModalOpen(true)}
          />
          <main>
            <Hero />
            <Products />
            <About />
            <Features />
            <Testimonials />
            <Contact />
          </main>
          <Footer />
          
          {/* Cart Drawer */}
          <Cart />
          
          {/* Auth Modal */}
          <AuthModal 
            isOpen={authModalOpen} 
            onClose={() => setAuthModalOpen(false)} 
          />
        </div>
      </CartProvider>
    </AuthProvider>
  );
}
