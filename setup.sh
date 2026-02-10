#!/bin/bash
# FitChek Setup Script
# Ce script vérifie que tout est prêt pour lancer l'app

set -e

echo "🔥 FitChek - Setup Verification"
echo "================================"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
  echo "❌ node_modules not found"
  echo "▶️  Run: npm install"
  exit 1
fi
echo "✅ Dependencies installed"

# Check if .env exists
if [ ! -f ".env" ]; then
  echo "❌ .env file not found"
  echo "▶️  Run: cp .env.example .env"
  exit 1
fi
echo "✅ .env file exists"

# Check if Supabase URL is configured
if grep -q "your-project-id.supabase.co" .env; then
  echo "⚠️  Supabase URL not configured"
  echo "▶️  Follow SUPABASE_SETUP.md to get your credentials"
  echo ""
  echo "📝 Quick steps:"
  echo "   1. Go to https://supabase.com"
  echo "   2. Create a new project"
  echo "   3. Run the SQL migration (supabase/migrations/20260210_initial_schema.sql)"
  echo "   4. Create bucket 'outfit-images'"
  echo "   5. Copy your URL and anon key to .env"
  exit 1
fi
echo "✅ Supabase configured"

# TypeScript check
echo ""
echo "🔍 Checking TypeScript..."
npx tsc --noEmit
echo "✅ TypeScript OK"

echo ""
echo "🎉 Setup complete!"
echo ""
echo "▶️  To start the app, run:"
echo "   npm start"
echo ""
echo "Then press:"
echo "   - 'w' for web"
echo "   - 'i' for iOS (requires macOS + Xcode)"
echo "   - 'a' for Android (requires Android Studio)"
