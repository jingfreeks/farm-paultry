const testimonials = [
  {
    id: 1,
    content: "The quality of their chicken is outstanding! You can really taste the difference compared to store-bought. My family won't eat anything else now.",
    author: "Sarah Mitchell",
    role: "Home Chef",
    rating: 5,
    avatar: "👩‍🍳",
  },
  {
    id: 2,
    content: "I've been ordering eggs from Golden Harvest for 3 years. The yolks are so rich and vibrant. It's like having a piece of the farm in my kitchen.",
    author: "Michael Chen",
    role: "Restaurant Owner",
    rating: 5,
    avatar: "👨‍💼",
  },
  {
    id: 3,
    content: "Fast delivery, excellent packaging, and the freshest produce I've ever had delivered. Their customer service is also top-notch!",
    author: "Emily Rodriguez",
    role: "Busy Mom of 3",
    rating: 5,
    avatar: "👩‍👧‍👦",
  },
];

export default function Testimonials() {
  return (
    <section className="py-24 bg-cream relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-terracotta/5 rounded-full blur-3xl" />
      
      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 bg-gold/20 text-bark text-sm font-semibold rounded-full mb-4">
            Testimonials
          </span>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-bark mb-6">
            What Our Customers Say
          </h2>
          <p className="text-lg text-charcoal/70 max-w-2xl mx-auto">
            Don't just take our word for it — hear from the families and 
            businesses that trust Golden Harvest.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className="bg-white p-8 rounded-3xl shadow-lg shadow-charcoal/5 hover-lift relative"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {/* Quote Icon */}
              <div className="absolute -top-4 left-8">
                <div className="w-8 h-8 bg-terracotta rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-cream" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                </div>
              </div>

              {/* Rating */}
              <div className="flex gap-1 mb-4 pt-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-gold" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>

              {/* Content */}
              <p className="text-charcoal/80 leading-relaxed mb-6 italic">
                &ldquo;{testimonial.content}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-4 pt-6 border-t border-charcoal/10">
                <div className="w-12 h-12 bg-wheat rounded-full flex items-center justify-center text-2xl">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="font-serif font-bold text-bark">{testimonial.author}</p>
                  <p className="text-sm text-charcoal/60">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="mt-16 flex flex-wrap justify-center items-center gap-8 md:gap-16">
          <div className="text-center">
            <p className="font-serif text-3xl font-bold text-terracotta">4.9/5</p>
            <p className="text-sm text-charcoal/60">Average Rating</p>
          </div>
          <div className="hidden md:block w-px h-12 bg-charcoal/20" />
          <div className="text-center">
            <p className="font-serif text-3xl font-bold text-terracotta">15,000+</p>
            <p className="text-sm text-charcoal/60">Happy Customers</p>
          </div>
          <div className="hidden md:block w-px h-12 bg-charcoal/20" />
          <div className="text-center">
            <p className="font-serif text-3xl font-bold text-terracotta">98%</p>
            <p className="text-sm text-charcoal/60">Would Recommend</p>
          </div>
        </div>
      </div>
    </section>
  );
}

