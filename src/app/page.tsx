"use client";

import { useState } from "react";
import { CartProvider } from "@/context/CartContext";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Products from "@/components/Products";
import About from "@/components/About";
import Features from "@/components/Features";
import Testimonials from "@/components/Testimonials";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import Cart from "@/components/Cart";

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <CartProvider>
      <div className="min-h-screen bg-cream overflow-x-hidden">
        <Header 
          mobileMenuOpen={mobileMenuOpen} 
          setMobileMenuOpen={setMobileMenuOpen} 
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
      </div>
    </CartProvider>
  );
}
