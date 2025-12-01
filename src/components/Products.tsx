"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useCart } from "@/context/CartContext";
import type { Product } from "@/types/database";

const categories = ["All", "Poultry", "Eggs", "Produce"];

// Fallback static products (used when Supabase is not configured)
const staticProducts: Product[] = [
  {
    id: "1",
    name: "Whole Chicken",
    category: "poultry" as const,
    price: 12.99,
    unit: "per kg",
    description: "Free-range, hormone-free whole chicken raised on organic feed.",
    emoji: "🐔",
    badge: "Best Seller",
    badge_color: "bg-terracotta",
    stock: 100,
    is_available: true,
    image_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Chicken Breast",
    category: "poultry" as const,
    price: 18.99,
    unit: "per kg",
    description: "Premium boneless, skinless chicken breast, perfect for healthy meals.",
    emoji: "🍗",
    badge: null,
    badge_color: null,
    stock: 75,
    is_available: true,
    image_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Farm Fresh Eggs",
    category: "eggs" as const,
    price: 6.99,
    unit: "dozen",
    description: "Free-range eggs from happy hens, rich in omega-3 and nutrients.",
    emoji: "🥚",
    badge: "Organic",
    badge_color: "bg-olive",
    stock: 200,
    is_available: true,
    image_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "4",
    name: "Duck Eggs",
    category: "eggs" as const,
    price: 9.99,
    unit: "half dozen",
    description: "Rich and creamy duck eggs, perfect for baking and cooking.",
    emoji: "🦆",
    badge: null,
    badge_color: null,
    stock: 50,
    is_available: true,
    image_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "5",
    name: "Whole Duck",
    category: "poultry" as const,
    price: 24.99,
    unit: "per kg",
    description: "Tender and flavorful whole duck, perfect for special occasions.",
    emoji: "🦆",
    badge: "Premium",
    badge_color: "bg-gold",
    stock: 30,
    is_available: true,
    image_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "6",
    name: "Organic Corn",
    category: "produce" as const,
    price: 4.99,
    unit: "per 6 ears",
    description: "Sweet and tender organic corn, freshly harvested from our fields.",
    emoji: "🌽",
    badge: null,
    badge_color: null,
    stock: 150,
    is_available: true,
    image_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "7",
    name: "Fresh Vegetables Box",
    category: "produce" as const,
    price: 29.99,
    unit: "per box",
    description: "Seasonal mix of farm-fresh vegetables, perfect for families.",
    emoji: "🥬",
    badge: "Popular",
    badge_color: "bg-sage",
    stock: 40,
    is_available: true,
    image_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "8",
    name: "Turkey",
    category: "poultry" as const,
    price: 19.99,
    unit: "per kg",
    description: "Heritage turkey raised naturally, ideal for holidays and gatherings.",
    emoji: "🦃",
    badge: null,
    badge_color: null,
    stock: 25,
    is_available: true,
    image_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export default function Products() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [products, setProducts] = useState<Product[]>(staticProducts);
  const [loading, setLoading] = useState(true);
  const [useSupabase, setUseSupabase] = useState(true);
  const [addedProductId, setAddedProductId] = useState<string | null>(null);
  const { addItem } = useCart();

  useEffect(() => {
    async function fetchProducts() {
      // Check if Supabase is configured
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        setUseSupabase(false);
        setLoading(false);
        return;
      }

      try {
        const supabase = createClient();
        
        let query = supabase
          .from('products')
          .select('*')
          .eq('is_available', true)
          .order('created_at', { ascending: false });
        
        if (activeCategory !== 'All') {
          query = query.eq('category', activeCategory.toLowerCase());
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        if (data && data.length > 0) {
          setProducts(data);
        }
      } catch (err) {
        console.log('Using static products:', err);
        setUseSupabase(false);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [activeCategory]);

  const filteredProducts = useSupabase 
    ? products 
    : activeCategory === "All" 
      ? staticProducts 
      : staticProducts.filter(p => p.category === activeCategory.toLowerCase());

  const handleAddToCart = (product: Product) => {
    addItem(product);
    setAddedProductId(product.id);
    
    // Reset the animation after a short delay
    setTimeout(() => {
      setAddedProductId(null);
    }, 1000);
  };

  return (
    <section id="products" className="py-24 bg-white relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 pattern-dots opacity-30" />
      
      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 bg-terracotta/10 text-terracotta text-sm font-semibold rounded-full mb-4">
            Our Products
          </span>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-bark mb-6">
            Fresh From the Farm
          </h2>
          <p className="text-lg text-charcoal/70 max-w-2xl mx-auto">
            Discover our selection of premium poultry, farm-fresh eggs, and organic produce. 
            All raised with love and delivered fresh to your door.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-6 py-2.5 rounded-full font-medium transition-all duration-300 ${
                activeCategory === category
                  ? "bg-olive text-cream shadow-lg shadow-olive/30"
                  : "bg-wheat text-charcoal hover:bg-olive/10"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-terracotta border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Products Grid */}
        {!loading && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product, index) => (
              <div
                key={product.id}
                className="group bg-cream rounded-3xl p-6 hover-lift cursor-pointer relative overflow-hidden"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Badge */}
                {product.badge && (
                  <span className={`absolute top-4 right-4 px-3 py-1 ${product.badge_color} text-cream text-xs font-semibold rounded-full`}>
                    {product.badge}
                  </span>
                )}

                {/* Product Image/Emoji */}
                <div className="relative mb-6">
                  <div className="w-full aspect-square bg-gradient-to-br from-wheat to-cream rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                    <span className="text-7xl">{product.emoji}</span>
                  </div>
                  
                  {/* Added to cart animation overlay */}
                  {addedProductId === product.id && (
                    <div className="absolute inset-0 bg-olive/90 rounded-2xl flex items-center justify-center animate-scale-in">
                      <div className="text-center text-cream">
                        <svg className="w-10 h-10 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <p className="font-semibold text-sm">Added to cart!</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="space-y-3">
                  <span className="text-xs font-semibold text-olive uppercase tracking-wider">
                    {product.category}
                  </span>
                  <h3 className="font-serif text-xl font-bold text-bark group-hover:text-terracotta transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-sm text-charcoal/60 line-clamp-2">
                    {product.description}
                  </p>
                  
                  {/* Price & Action */}
                  <div className="flex items-end justify-between pt-4 border-t border-charcoal/10">
                    <div>
                      <span className="font-serif text-2xl font-bold text-terracotta">
                        ${product.price}
                      </span>
                      <span className="text-sm text-charcoal/50 ml-1">
                        {product.unit}
                      </span>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(product);
                      }}
                      className="w-10 h-10 bg-olive rounded-full flex items-center justify-center text-cream hover:bg-terracotta transition-colors shadow-lg shadow-olive/30 active:scale-95"
                      aria-label={`Add ${product.name} to cart`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* View All Button */}
        <div className="text-center mt-12">
          <button className="inline-flex items-center gap-2 px-8 py-4 bg-transparent text-olive font-semibold rounded-full border-2 border-olive hover:bg-olive hover:text-cream transition-all duration-300">
            View All Products
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
