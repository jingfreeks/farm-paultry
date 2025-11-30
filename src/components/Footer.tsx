import Link from "next/link";

const footerLinks = {
  products: [
    { name: "Fresh Poultry", href: "#products" },
    { name: "Farm Eggs", href: "#products" },
    { name: "Organic Produce", href: "#products" },
    { name: "Seasonal Items", href: "#products" },
  ],
  company: [
    { name: "About Us", href: "#about" },
    { name: "Our Farm", href: "#about" },
    { name: "Sustainability", href: "#about" },
    { name: "Careers", href: "#" },
  ],
  support: [
    { name: "Contact Us", href: "#contact" },
    { name: "FAQs", href: "#" },
    { name: "Shipping Info", href: "#" },
    { name: "Returns", href: "#" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-charcoal text-cream">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-olive rounded-full flex items-center justify-center">
                <svg className="w-7 h-7 text-cream" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C8.5 2 6 4.5 6 7c0 1.5.5 2.5 1.5 3.5-1 .5-2 1.5-2.5 3-.5 1.5 0 3 1 4 1 1 2.5 1.5 4 1.5h4c1.5 0 3-.5 4-1.5s1.5-2.5 1-4c-.5-1.5-1.5-2.5-2.5-3 1-1 1.5-2 1.5-3.5 0-2.5-2.5-5-6-5zm-2 6c-.5 0-1-.5-1-1s.5-1 1-1 1 .5 1 1-.5 1-1 1zm4 0c-.5 0-1-.5-1-1s.5-1 1-1 1 .5 1 1-.5 1-1 1zm-2 4l-1 3h-2l2-4h1zm0 0l1 3h2l-2-4h-1z"/>
                </svg>
              </div>
              <div>
                <h2 className="font-serif text-xl font-bold text-cream">Golden Harvest</h2>
                <p className="text-xs text-cream/60 tracking-widest uppercase">Farm & Poultry</p>
              </div>
            </div>
            
            <p className="text-cream/70 max-w-sm leading-relaxed">
              Three generations of farming excellence. We're committed to bringing you 
              the freshest, most ethically-raised products nature has to offer.
            </p>

            {/* Newsletter */}
            <div className="pt-4">
              <p className="text-sm font-semibold text-cream mb-3">Subscribe to our newsletter</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 bg-cream/10 rounded-xl border border-cream/10 focus:outline-none focus:border-terracotta text-cream placeholder:text-cream/40"
                />
                <button className="px-6 py-3 bg-terracotta text-cream font-semibold rounded-xl hover:bg-terracotta-dark transition-colors">
                  Join
                </button>
              </div>
            </div>
          </div>

          {/* Products Links */}
          <div>
            <h3 className="font-serif text-lg font-bold text-cream mb-6">Products</h3>
            <ul className="space-y-3">
              {footerLinks.products.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-cream/60 hover:text-terracotta transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-serif text-lg font-bold text-cream mb-6">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-cream/60 hover:text-terracotta transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="font-serif text-lg font-bold text-cream mb-6">Support</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-cream/60 hover:text-terracotta transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-cream/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-cream/50 text-sm">
              © {new Date().getFullYear()} Golden Harvest Farm. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link href="#" className="text-cream/50 text-sm hover:text-cream transition-colors">
                Privacy Policy
              </Link>
              <Link href="#" className="text-cream/50 text-sm hover:text-cream transition-colors">
                Terms of Service
              </Link>
              <Link href="#" className="text-cream/50 text-sm hover:text-cream transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

