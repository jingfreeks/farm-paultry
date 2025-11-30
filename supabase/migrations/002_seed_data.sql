-- Seed initial products
INSERT INTO products (name, description, price, unit, category, emoji, badge, badge_color, stock, is_available) VALUES
('Whole Chicken', 'Free-range, hormone-free whole chicken raised on organic feed.', 12.99, 'per kg', 'poultry', '🐔', 'Best Seller', 'bg-terracotta', 100, true),
('Chicken Breast', 'Premium boneless, skinless chicken breast, perfect for healthy meals.', 18.99, 'per kg', 'poultry', '🍗', NULL, NULL, 75, true),
('Farm Fresh Eggs', 'Free-range eggs from happy hens, rich in omega-3 and nutrients.', 6.99, 'dozen', 'eggs', '🥚', 'Organic', 'bg-olive', 200, true),
('Duck Eggs', 'Rich and creamy duck eggs, perfect for baking and cooking.', 9.99, 'half dozen', 'eggs', '🦆', NULL, NULL, 50, true),
('Whole Duck', 'Tender and flavorful whole duck, perfect for special occasions.', 24.99, 'per kg', 'poultry', '🦆', 'Premium', 'bg-gold', 30, true),
('Organic Corn', 'Sweet and tender organic corn, freshly harvested from our fields.', 4.99, 'per 6 ears', 'produce', '🌽', NULL, NULL, 150, true),
('Fresh Vegetables Box', 'Seasonal mix of farm-fresh vegetables, perfect for families.', 29.99, 'per box', 'produce', '🥬', 'Popular', 'bg-sage', 40, true),
('Turkey', 'Heritage turkey raised naturally, ideal for holidays and gatherings.', 19.99, 'per kg', 'poultry', '🦃', NULL, NULL, 25, true),
('Quail Eggs', 'Delicate and nutritious quail eggs, a gourmet delicacy.', 8.99, 'dozen', 'eggs', '🥚', 'Gourmet', 'bg-gold', 60, true),
('Organic Tomatoes', 'Vine-ripened organic tomatoes bursting with flavor.', 5.99, 'per lb', 'produce', '🍅', NULL, NULL, 100, true);

-- Seed featured testimonials
INSERT INTO testimonials (content, author, role, avatar, rating, is_featured) VALUES
('The quality of their chicken is outstanding! You can really taste the difference compared to store-bought. My family won''t eat anything else now.', 'Sarah Mitchell', 'Home Chef', '👩‍🍳', 5, true),
('I''ve been ordering eggs from Golden Harvest for 3 years. The yolks are so rich and vibrant. It''s like having a piece of the farm in my kitchen.', 'Michael Chen', 'Restaurant Owner', '👨‍💼', 5, true),
('Fast delivery, excellent packaging, and the freshest produce I''ve ever had delivered. Their customer service is also top-notch!', 'Emily Rodriguez', 'Busy Mom of 3', '👩‍👧‍👦', 5, true);

