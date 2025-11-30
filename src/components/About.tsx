export default function About() {
  return (
    <section id="about" className="py-24 bg-olive relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50" />
      
      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left - Image Composition */}
          <div className="relative">
            {/* Main Image Container */}
            <div className="relative">
              {/* Background Shape */}
              <div className="absolute -inset-4 bg-cream/10 rounded-[3rem] transform -rotate-3" />
              
              {/* Main Image */}
              <div className="relative bg-gradient-to-br from-terracotta/80 to-gold/60 rounded-[2rem] aspect-[4/3] flex items-center justify-center overflow-hidden">
                <div className="text-center">
                  <span className="text-[8rem]">🌾</span>
                  <p className="font-serif text-2xl text-cream font-semibold">Since 1952</p>
                </div>
                
                {/* Decorative Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-bark/20 to-transparent" />
              </div>
              
              {/* Floating Stats Card */}
              <div className="absolute -bottom-8 -right-8 bg-cream p-6 rounded-2xl shadow-2xl">
                <div className="text-center">
                  <p className="font-serif text-4xl font-bold text-terracotta">500+</p>
                  <p className="text-sm text-charcoal/70">Acres of Farmland</p>
                </div>
              </div>
              
              {/* Small Accent Card */}
              <div className="absolute -top-6 -left-6 bg-gold p-4 rounded-xl shadow-lg">
                <span className="text-3xl">🏆</span>
              </div>
            </div>
          </div>

          {/* Right - Content */}
          <div className="space-y-8">
            <span className="inline-block px-4 py-1.5 bg-cream/10 text-cream text-sm font-semibold rounded-full">
              Our Story
            </span>
            
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-cream leading-tight">
              Three Generations of 
              <span className="text-gold"> Farming Excellence</span>
            </h2>
            
            <div className="space-y-4 text-cream/80 text-lg leading-relaxed">
              <p>
                Nestled in the heart of the countryside, Golden Harvest Farm has been 
                a beacon of sustainable agriculture for over seven decades. What started 
                as a small family homestead has grown into a thriving farm that supplies 
                fresh, organic produce to thousands of families.
              </p>
              <p>
                Our commitment to ethical farming practices means our animals roam freely, 
                our fields flourish without harmful chemicals, and every product that 
                leaves our farm carries the promise of quality and care.
              </p>
            </div>

            {/* Values */}
            <div className="grid sm:grid-cols-2 gap-6 pt-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-cream/10 rounded-xl flex items-center justify-center shrink-0">
                  <span className="text-2xl">🌱</span>
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-cream">100% Organic</h3>
                  <p className="text-sm text-cream/60">No pesticides or chemicals</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-cream/10 rounded-xl flex items-center justify-center shrink-0">
                  <span className="text-2xl">🐓</span>
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-cream">Free Range</h3>
                  <p className="text-sm text-cream/60">Happy, healthy animals</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-cream/10 rounded-xl flex items-center justify-center shrink-0">
                  <span className="text-2xl">🚛</span>
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-cream">Farm to Table</h3>
                  <p className="text-sm text-cream/60">Delivered fresh daily</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-cream/10 rounded-xl flex items-center justify-center shrink-0">
                  <span className="text-2xl">💚</span>
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-cream">Sustainable</h3>
                  <p className="text-sm text-cream/60">Eco-friendly practices</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

