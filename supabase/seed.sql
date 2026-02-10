-- Development seed data (optional)
-- This file can be used to populate test data for development

-- Note: Replace 'your-test-user-id' with an actual user ID from auth.users
-- after creating a test account

-- Example wardrobe items (uncomment and modify after creating test user)
/*
INSERT INTO wardrobe_items (user_id, category, type, color_primary, style_tags, season_tags) VALUES
  ('your-test-user-id', 'top', 't-shirt', 'black', ARRAY['casual', 'streetwear'], ARRAY['all-season']),
  ('your-test-user-id', 'top', 'hoodie', 'gray', ARRAY['streetwear', 'casual'], ARRAY['fall', 'winter']),
  ('your-test-user-id', 'bottom', 'jeans', 'blue', ARRAY['casual'], ARRAY['all-season']),
  ('your-test-user-id', 'bottom', 'joggers', 'black', ARRAY['streetwear', 'sport'], ARRAY['all-season']),
  ('your-test-user-id', 'shoes', 'sneakers', 'white', ARRAY['casual', 'streetwear'], ARRAY['all-season']),
  ('your-test-user-id', 'shoes', 'boots', 'brown', ARRAY['chic'], ARRAY['fall', 'winter']);
*/

-- Example profile update (uncomment and modify after creating test user)
/*
UPDATE profiles
SET
  style_primary = ARRAY['streetwear', 'casual'],
  main_context = 'cours',
  preference_balance = 'balanced',
  improvement_goals = ARRAY['better_matching', 'use_wardrobe_better']
WHERE id = 'your-test-user-id';
*/
