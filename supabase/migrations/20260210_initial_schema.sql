-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  style_primary TEXT[] DEFAULT '{}',
  main_context TEXT,
  preference_balance TEXT,
  improvement_goals TEXT[] DEFAULT '{}',
  is_premium BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create wardrobe_items table
CREATE TABLE wardrobe_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  type TEXT NOT NULL,
  color_primary TEXT NOT NULL,
  color_secondary TEXT,
  style_tags TEXT[] DEFAULT '{}',
  season_tags TEXT[] DEFAULT '{}',
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create outfit_ratings table
CREATE TABLE outfit_ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  axes JSONB DEFAULT '{}',
  strengths TEXT[] DEFAULT '{}',
  improvements TEXT[] DEFAULT '{}',
  wardrobe_suggestions JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create generated_outfits table
CREATE TABLE generated_outfits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  selected_item_ids UUID[] DEFAULT '{}',
  generated_image_url TEXT,
  description TEXT,
  estimated_score INTEGER CHECK (estimated_score >= 0 AND estimated_score <= 100),
  occasion TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create usage_counters table
CREATE TABLE usage_counters (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  ratings_used INTEGER DEFAULT 0,
  generations_used INTEGER DEFAULT 0,
  PRIMARY KEY (user_id, week_start)
);

-- Create indexes for performance
CREATE INDEX idx_wardrobe_items_user_id ON wardrobe_items(user_id);
CREATE INDEX idx_wardrobe_items_category ON wardrobe_items(category);
CREATE INDEX idx_outfit_ratings_user_id ON outfit_ratings(user_id);
CREATE INDEX idx_outfit_ratings_created_at ON outfit_ratings(created_at DESC);
CREATE INDEX idx_generated_outfits_user_id ON generated_outfits(user_id);
CREATE INDEX idx_generated_outfits_created_at ON generated_outfits(created_at DESC);
CREATE INDEX idx_usage_counters_user_week ON usage_counters(user_id, week_start);

-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE wardrobe_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE outfit_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_outfits ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_counters ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- RLS Policies for wardrobe_items
CREATE POLICY "Users can view their own wardrobe items"
  ON wardrobe_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wardrobe items"
  ON wardrobe_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wardrobe items"
  ON wardrobe_items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wardrobe items"
  ON wardrobe_items FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for outfit_ratings
CREATE POLICY "Users can view their own outfit ratings"
  ON outfit_ratings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own outfit ratings"
  ON outfit_ratings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own outfit ratings"
  ON outfit_ratings FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for generated_outfits
CREATE POLICY "Users can view their own generated outfits"
  ON generated_outfits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own generated outfits"
  ON generated_outfits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own generated outfits"
  ON generated_outfits FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for usage_counters
CREATE POLICY "Users can view their own usage counters"
  ON usage_counters FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own usage counters"
  ON usage_counters FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own usage counters"
  ON usage_counters FOR UPDATE
  USING (auth.uid() = user_id);

-- Create function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to get current week's usage
CREATE OR REPLACE FUNCTION get_current_week_usage(p_user_id UUID)
RETURNS TABLE (
  ratings_used INTEGER,
  generations_used INTEGER
) AS $$
DECLARE
  v_week_start DATE;
BEGIN
  -- Get Monday of current week
  v_week_start := DATE_TRUNC('week', CURRENT_DATE)::DATE;

  RETURN QUERY
  SELECT
    COALESCE(uc.ratings_used, 0) AS ratings_used,
    COALESCE(uc.generations_used, 0) AS generations_used
  FROM usage_counters uc
  WHERE uc.user_id = p_user_id
    AND uc.week_start = v_week_start;

  -- If no record exists, return 0s
  IF NOT FOUND THEN
    RETURN QUERY SELECT 0, 0;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment usage counter
CREATE OR REPLACE FUNCTION increment_usage_counter(
  p_user_id UUID,
  p_counter_type TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_week_start DATE;
BEGIN
  v_week_start := DATE_TRUNC('week', CURRENT_DATE)::DATE;

  IF p_counter_type = 'rating' THEN
    INSERT INTO usage_counters (user_id, week_start, ratings_used, generations_used)
    VALUES (p_user_id, v_week_start, 1, 0)
    ON CONFLICT (user_id, week_start)
    DO UPDATE SET ratings_used = usage_counters.ratings_used + 1;
  ELSIF p_counter_type = 'generation' THEN
    INSERT INTO usage_counters (user_id, week_start, ratings_used, generations_used)
    VALUES (p_user_id, v_week_start, 0, 1)
    ON CONFLICT (user_id, week_start)
    DO UPDATE SET generations_used = usage_counters.generations_used + 1;
  ELSE
    RETURN FALSE;
  END IF;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
