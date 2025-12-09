-- Add performance indexes for frequently queried columns

-- Indexes for orders table
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_status_created_at ON orders(status, created_at DESC);

-- Indexes for products table
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_category_available ON products(category, is_available) WHERE is_available = true;

-- Indexes for user_profiles table
CREATE INDEX IF NOT EXISTS idx_user_profiles_created_at ON user_profiles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);

-- Indexes for order_items table
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- Composite index for orders filtering by status and date
CREATE INDEX IF NOT EXISTS idx_orders_status_date ON orders(status, created_at DESC) WHERE status IN ('pending', 'confirmed', 'processing');

