import Link from "next/link";

export default function Hero() {
  return (
    <section id="home" className="relative min-h-screen flex items-center overflow-hidden grain-overlay">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-cream via-wheat/50 to-cream" />
      
      {/* Decorative Elements */}
      <div className="absolute top-20 right-10 w-64 h-64 bg-sage/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-terracotta/5 rounded-full blur-3xl" />
      
      {/* Floating Elements */}
      <div className="absolute top-40 left-[15%] animate-float delay-100">
        <div className="w-16 h-16 bg-gold/20 rounded-full flex items-center justify-center">
          <span className="text-2xl">🌾</span>
        </div>
      </div>
      <div className="absolute top-60 right-[20%] animate-float delay-300">
        <div className="w-14 h-14 bg-terracotta/20 rounded-full flex items-center justify-center">
          <span className="text-2xl">🥚</span>
        </div>
      </div>
      <div className="absolute bottom-40 right-[25%] animate-float delay-500">
        <div className="w-12 h-12 bg-olive/20 rounded-full flex items-center justify-center">
          <span className="text-xl">🌿</span>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-32 pt-40">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-8 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-olive/10 rounded-full border border-olive/20">
              <span className="w-2 h-2 bg-olive rounded-full animate-pulse" />
              <span className="text-sm font-medium text-olive">Family-owned since 1952</span>
            </div>
            
            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold text-bark leading-[1.1] tracking-tight">
              Farm Fresh
              <span className="block text-gradient">Goodness</span>
              <span className="block">To Your Table</span>
            </h1>
            
            <p className="text-lg md:text-xl text-charcoal/70 max-w-lg leading-relaxed">
              Experience the pure taste of nature with our premium poultry, farm-fresh eggs, 
              and organic produce. Raised with care, delivered with love.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="#products"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-terracotta text-cream font-semibold rounded-full hover:bg-terracotta-dark transition-all duration-300 shadow-xl shadow-terracotta/30 hover:shadow-terracotta/50 hover:-translate-y-1"
              >
                Explore Products
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                href="#about"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-transparent text-bark font-semibold rounded-full border-2 border-bark/20 hover:border-bark/40 hover:bg-bark/5 transition-all duration-300"
              >
                Our Story
              </Link>
            </div>
            
            {/* Stats */}
            <div className="flex flex-wrap gap-8 pt-8 border-t border-charcoal/10">
              <div className="animate-fade-in-up delay-200">
                <p className="font-serif text-4xl font-bold text-terracotta">70+</p>
                <p className="text-sm text-charcoal/60">Years of Experience</p>
              </div>
              <div className="animate-fade-in-up delay-300">
                <p className="font-serif text-4xl font-bold text-terracotta">15K+</p>
                <p className="text-sm text-charcoal/60">Happy Customers</p>
              </div>
              <div className="animate-fade-in-up delay-400">
                <p className="font-serif text-4xl font-bold text-terracotta">100%</p>
                <p className="text-sm text-charcoal/60">Organic Products</p>
              </div>
            </div>
          </div>
          
          {/* Right Content - Hero Image Composition */}
          <div className="relative lg:h-[600px] animate-scale-in delay-200">
            {/* Main Image Container */}
            <div className="relative w-full h-80 lg:h-full">
              {/* Background Shape */}
              <div className="absolute inset-0 bg-gradient-to-br from-olive/20 to-sage/30 rounded-[3rem] transform rotate-3" />
              
              {/* Main Circle */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 lg:w-96 lg:h-96 bg-gradient-to-br from-terracotta to-terracotta-dark rounded-full shadow-2xl flex items-center justify-center">
                <div className="text-center text-cream">
                  <span className="text-8xl lg:text-9xl">🐔</span>
                  <p className="font-serif text-xl font-semibold mt-2">Premium Poultry</p>
                </div>
              </div>
              
              {/* Floating Cards */}
              <div className="absolute top-10 right-0 bg-cream p-4 rounded-2xl shadow-xl animate-float delay-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gold/20 rounded-full flex items-center justify-center text-2xl">
                    🥚
                  </div>
                  <div>
                    <p className="font-serif font-bold text-bark">Fresh Eggs</p>
                    <p className="text-xs text-charcoal/60">Free-range daily</p>
                  </div>
                </div>
              </div>
              
              <div className="absolute bottom-10 left-0 bg-cream p-4 rounded-2xl shadow-xl animate-float delay-400">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-sage/30 rounded-full flex items-center justify-center text-2xl">
                    🌽
                  </div>
                  <div>
                    <p className="font-serif font-bold text-bark">Organic Feed</p>
                    <p className="text-xs text-charcoal/60">No chemicals</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V120Z" fill="white"/>
        </svg>
      </div>
    </section>
  );
}

