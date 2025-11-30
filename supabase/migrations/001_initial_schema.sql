-- Create custom types
CREATE TYPE product_category AS ENUM ('poultry', 'eggs', 'produce');
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled');

-- Products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  unit VARCHAR(50) NOT NULL,
  category product_category NOT NULL,
  image_url TEXT,
  emoji VARCHAR(10),
  badge VARCHAR(50),
  badge_color VARCHAR(50),
  stock INTEGER DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customers table
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  zip_code VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50),
  shipping_address TEXT NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  status order_status DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order items table
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  product_name VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contact submissions table
CREATE TABLE contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Testimonials table
CREATE TABLE testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  author VARCHAR(255) NOT NULL,
  role VARCHAR(255),
  avatar VARCHAR(10),
  rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_available ON products(is_available);
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_contact_submissions_is_read ON contact_submissions(is_read);
CREATE INDEX idx_testimonials_is_featured ON testimonials(is_featured);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- Products: Anyone can read, only authenticated users can modify
CREATE POLICY "Products are viewable by everyone" ON products
  FOR SELECT USING (true);

CREATE POLICY "Products are editable by authenticated users" ON products
  FOR ALL USING (auth.role() = 'authenticated');

-- Testimonials: Anyone can read featured ones
CREATE POLICY "Featured testimonials are viewable by everyone" ON testimonials
  FOR SELECT USING (is_featured = true);

-- Contact submissions: Anyone can insert
CREATE POLICY "Anyone can submit contact form" ON contact_submissions
  FOR INSERT WITH CHECK (true);

-- Orders: Users can view their own orders
CREATE POLICY "Users can view their own orders" ON orders
  FOR SELECT USING (customer_email = auth.jwt()->>'email');

-- Order items: Users can view items from their orders
CREATE POLICY "Users can view their order items" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.customer_email = auth.jwt()->>'email'
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

