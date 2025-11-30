const features = [
  {
    icon: "🌅",
    title: "Fresh Every Morning",
    description: "Our products are harvested and prepared at the break of dawn, ensuring you receive the freshest goods possible.",
  },
  {
    icon: "🔬",
    title: "Quality Tested",
    description: "Every batch undergoes rigorous quality checks to meet the highest food safety and nutrition standards.",
  },
  {
    icon: "📦",
    title: "Fast Delivery",
    description: "From our farm to your doorstep within 24 hours. We ensure your products arrive fresh and perfect.",
  },
  {
    icon: "💯",
    title: "Satisfaction Guaranteed",
    description: "Not happy with your order? We offer a 100% money-back guarantee on all our products.",
  },
  {
    icon: "🌿",
    title: "No Antibiotics",
    description: "Our poultry is raised without antibiotics or growth hormones, just natural, healthy farming.",
  },
  {
    icon: "👨‍🌾",
    title: "Family Owned",
    description: "Three generations of farming expertise dedicated to bringing you the best of nature.",
  },
];

export default function Features() {
  return (
    <section className="py-24 bg-wheat relative">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-terracotta/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-olive/5 rounded-full translate-x-1/2 translate-y-1/2" />
      
      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 bg-olive/10 text-olive text-sm font-semibold rounded-full mb-4">
            Why Choose Us
          </span>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-bark mb-6">
            The Golden Harvest Difference
          </h2>
          <p className="text-lg text-charcoal/70 max-w-2xl mx-auto">
            When you choose Golden Harvest, you're not just buying products — 
            you're supporting sustainable farming and joining our family.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group bg-cream p-8 rounded-3xl hover-lift border border-charcoal/5"
            >
              {/* Icon */}
              <div className="w-16 h-16 bg-gradient-to-br from-terracotta/20 to-gold/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-3xl">{feature.icon}</span>
              </div>
              
              {/* Content */}
              <h3 className="font-serif text-xl font-bold text-bark mb-3 group-hover:text-terracotta transition-colors">
                {feature.title}
              </h3>
              <p className="text-charcoal/60 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA Banner */}
        <div className="mt-20 bg-gradient-to-r from-terracotta to-terracotta-dark rounded-3xl p-8 md:p-12 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
          </div>
          
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <h3 className="font-serif text-2xl md:text-3xl font-bold text-cream mb-2">
                Ready to Taste the Difference?
              </h3>
              <p className="text-cream/80 max-w-lg">
                Join thousands of families who trust Golden Harvest for their farm-fresh products. 
                First order gets 15% off!
              </p>
            </div>
            <a
              href="#contact"
              className="shrink-0 inline-flex items-center gap-2 px-8 py-4 bg-cream text-terracotta font-semibold rounded-full hover:bg-bark hover:text-cream transition-all duration-300 shadow-xl"
            >
              Get Started
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

