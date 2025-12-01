-- Add RLS policies for checkout functionality

-- Allow anyone to create orders (for guest checkout)
CREATE POLICY "Anyone can create orders" ON orders
  FOR INSERT WITH CHECK (true);

-- Allow anyone to create order items (for guest checkout)
CREATE POLICY "Anyone can create order items" ON order_items
  FOR INSERT WITH CHECK (true);

-- Make product_id nullable for static product support
ALTER TABLE order_items ALTER COLUMN product_id DROP NOT NULL;

-- Drop the foreign key constraint to allow null values
ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_product_id_fkey;

-- Re-add foreign key that allows NULL
ALTER TABLE order_items 
  ADD CONSTRAINT order_items_product_id_fkey 
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL;

-- Also allow authenticated users to create orders
CREATE POLICY "Authenticated users can create orders" ON orders
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow users to update their own orders
CREATE POLICY "Users can update their own orders" ON orders
  FOR UPDATE USING (customer_email = auth.jwt()->>'email');

