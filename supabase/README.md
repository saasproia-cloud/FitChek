# FitChek Supabase Setup

## Initial Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)

2. Run the migration file to create all tables and policies:
   - Go to SQL Editor in Supabase Dashboard
   - Copy and paste the contents of `migrations/20260210_initial_schema.sql`
   - Run the migration

3. Configure Storage bucket for outfit images:
   - Go to Storage in Supabase Dashboard
   - Create a new bucket named `outfit-images`
   - Set the bucket to **public** (for easy image access)
   - Add the following policy for authenticated uploads:

   ```sql
   CREATE POLICY "Users can upload their own outfit images"
   ON storage.objects FOR INSERT
   WITH CHECK (
     bucket_id = 'outfit-images' AND
     auth.uid()::text = (storage.foldername(name))[1]
   );

   CREATE POLICY "Users can view all outfit images"
   ON storage.objects FOR SELECT
   USING (bucket_id = 'outfit-images');

   CREATE POLICY "Users can update their own outfit images"
   ON storage.objects FOR UPDATE
   USING (
     bucket_id = 'outfit-images' AND
     auth.uid()::text = (storage.foldername(name))[1]
   );

   CREATE POLICY "Users can delete their own outfit images"
   ON storage.objects FOR DELETE
   USING (
     bucket_id = 'outfit-images' AND
     auth.uid()::text = (storage.foldername(name))[1]
   );
   ```

4. Get your Supabase credentials:
   - Go to Project Settings → API
   - Copy `Project URL` and `anon public` key
   - Create a `.env` file in the project root (see `.env.example`)

## Testing the Setup

1. Test authentication by creating a user via Supabase Auth
2. Verify that a profile is automatically created (check `profiles` table)
3. Test RLS by trying to insert a wardrobe item via SQL Editor (should work only for authenticated user)

## Edge Functions Setup (for AI features)

Edge functions will be deployed separately. See `/supabase/functions/README.md` for details.

## Development Seed Data

To populate test data:
1. Create a test user account
2. Copy the user's ID from `auth.users` table
3. Uncomment and modify the seed data in `seed.sql`
4. Run the seed file in SQL Editor
