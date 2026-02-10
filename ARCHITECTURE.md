# Architecture FitChek

## Vue d'ensemble

FitChek est construit avec une architecture moderne, modulaire et scalable pour une app mobile cross-platform.

## Principes de Design

1. **Offline-First** : L'app fonctionne même sans clés API grâce au MockAI provider
2. **Type-Safe** : TypeScript strict sur tout le codebase
3. **Modular** : Features isolées dans `/src/features`
4. **Provider-Agnostic** : Abstraction AI permet de changer de provider facilement

## Stack Détaillée

### Frontend (Mobile)

```
React Native (0.81.5)
├── Expo (54.0.33) - Build & Dev tooling
├── Expo Router (6.0.23) - File-based routing
├── NativeWind (4.2.1) - Tailwind CSS pour RN
├── Zustand (5.0.11) - State management
└── TanStack React Query (5.90.20) - Data fetching & caching
```

**Pourquoi ces choix ?**

- **Expo** : Rapid dev, easy deployment, cross-platform
- **Expo Router** : Type-safe routing, simple navigation
- **NativeWind** : Tailwind familier, DX rapide, design system cohérent
- **Zustand** : Lightweight, simple API, pas de boilerplate
- **React Query** : Cache management, optimistic updates, pagination facile

### Backend

```
Supabase
├── Auth - Email/password, session management
├── Postgres - Relational DB avec RLS
├── Storage - Images d'outfits et vêtements
└── Edge Functions (Deno) - Serverless compute pour IA
```

**Pourquoi Supabase ?**

- Open-source, self-hostable
- RLS natif pour sécurité multi-tenant
- Realtime optionnel pour features futures
- Edge Functions intégrées
- Generous free tier

### IA Architecture

```
AIProvider Interface
├── MockAIProvider (implémenté) - Offline, déterministe
├── OpenAIProvider (TODO) - GPT-4 Vision pour ratings
├── AnthropicProvider (TODO) - Claude pour conseils
└── ReplicateProvider (TODO) - Stable Diffusion pour images
```

**Abstraction :**

```typescript
interface AIProvider {
  rateOutfit(imageUrl, context, wardrobeItems?): Promise<RatingResult>
  generateOutfit(params): Promise<OutfitSelection>
  renderOutfitImage(outfit, items, labels): Promise<string>
}
```

## Data Flow

### Authentication Flow

```
User → Auth Screen → Supabase Auth
                      ↓
                   Session
                      ↓
              AuthProvider (hook)
                      ↓
                  AuthStore (Zustand)
                      ↓
              Check onboarding status
                      ↓
         Redirect: Onboarding | Tabs
```

### Onboarding Flow

```
5 Steps (file: app/onboarding/[step].tsx)
    ↓
OnboardingStore (Zustand) - collect answers
    ↓
Save to Supabase profiles table
    ↓
Update AuthStore.hasCompletedOnboarding
    ↓
Navigate to Home
```

### Wardrobe CRUD Flow

```
User action → useWardrobeItems (React Query)
                    ↓
              Fetch from Supabase
                    ↓
              Cache in React Query
                    ↓
              Render in UI

Add item → useAddWardrobeItem
             ↓
       Upload image to Storage (optional)
             ↓
       Insert into wardrobe_items
             ↓
       Invalidate query cache
             ↓
       UI auto-updates
```

### Rating Flow (TODO)

```
Photo upload → Supabase Storage
                    ↓
        Edge Function /ai-rate
                    ↓
         Check quota (free/premium)
                    ↓
            Call AI provider
                    ↓
        Save to outfit_ratings
                    ↓
        Display result screen
```

### Generator Flow (TODO)

```
User selects occasion → Fetch wardrobe items
                              ↓
                  Edge Function /ai-generate
                              ↓
                    Check quota
                              ↓
                  Select items (AI)
                              ↓
              Edge Function /ai-render
                              ↓
                  Generate image
                              ↓
            Save to generated_outfits
                              ↓
              Display outfit view
```

## State Management Strategy

### Local State (useState)
- Form inputs
- Modal visibility
- UI toggles

### Zustand (Global State)
- Auth state (`useAuthStore`)
- Onboarding data (`useOnboardingStore`)
- App-wide settings

### React Query (Server State)
- Wardrobe items
- Outfit ratings
- Generated outfits
- User profile

**Pourquoi cette séparation ?**

- `useState` : Ephemeral, component-scoped
- `Zustand` : Persistent, shared across app
- `React Query` : Server-synced, cached, auto-refetching

## Security

### Row Level Security (RLS)

Toutes les tables Supabase ont des policies RLS :

```sql
-- Example: wardrobe_items
CREATE POLICY "Users can view their own items"
  ON wardrobe_items FOR SELECT
  USING (auth.uid() = user_id);
```

**Garanties :**
- Un user ne peut jamais lire/modifier les données d'un autre
- Validation côté DB, pas seulement client
- Même si clé anon leakée, data protégée

### Edge Functions

Toutes les functions vérifient :
1. Auth token valide
2. User ID matching
3. Premium status si applicable
4. Usage quotas

## Freemium Logic

### Quota Tracking

```sql
-- Table usage_counters
user_id | week_start | ratings_used | generations_used
--------|------------|--------------|------------------
uuid    | 2026-02-10 | 2            | 1
```

**Flow :**

```
Edge Function request
    ↓
Get user profile (is_premium?)
    ↓
If not premium → Check usage_counters
    ↓
If over limit → Return 402 error
    ↓
If ok → Process request
    ↓
Increment counter (SQL function)
```

### Dev Premium Flag

```env
EXPO_PUBLIC_DEV_PREMIUM=true
```

Active le premium en dev sans paiement. Check dans `useAuthStore` :

```typescript
const isPremium = devFlag || profile?.is_premium
```

## File Organization

```
src/
├── components/          # Shared UI components
│   └── (à créer selon besoins)
│
├── features/           # Domain-specific modules
│   ├── wardrobe/      # Tout ce qui concerne le placard
│   │   ├── hooks.ts        # useWardrobeItems, useAddItem...
│   │   └── AddItemModal.tsx
│   ├── ratings/       # (TODO) Rating d'outfits
│   ├── generator/     # (TODO) Génération d'outfits
│   └── paywall/       # (TODO) Freemium UI
│
├── lib/               # Core libraries & config
│   ├── supabase.ts         # Client + types
│   ├── ai/
│   │   ├── types.ts        # Interfaces AI
│   │   ├── mockProvider.ts
│   │   └── index.ts        # Provider selector
│   └── AuthProvider.tsx
│
└── store/             # Global state (Zustand)
    ├── useAuthStore.ts
    └── useOnboardingStore.ts
```

**Convention :**

- `hooks.ts` : React Query hooks + utilities
- `types.ts` : TypeScript interfaces
- Components : PascalCase, un par fichier
- Stores : `use<Name>Store` pattern

## Styling avec NativeWind

### Approach

```tsx
// Tailwind classes comme props
<View className="flex-1 bg-white px-4">
  <Text className="text-2xl font-bold text-gray-900">
    Titre
  </Text>
</View>
```

### Custom Config

```js
// tailwind.config.js
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: { 500: '#0ea5e9' }
      }
    }
  }
}
```

### Responsive

NativeWind supporte breakpoints :

```tsx
<View className="w-full md:w-1/2">
```

Mais sur mobile, moins pertinent (pas de vraie responsive comme web).

## Performance Considerations

### Image Optimization

- Images compressées à 0.8 quality (ImagePicker)
- Supabase Storage CDN pour delivery
- `resizeMode="cover"` pour éviter stretching

### List Rendering

```tsx
<FlatList
  data={items}
  keyExtractor={(item) => item.id}
  renderItem={renderItem}
  // Optimizations
  initialNumToRender={10}
  maxToRenderPerBatch={5}
  windowSize={5}
/>
```

### Query Caching

React Query cache les résultats :

```typescript
useQuery({
  queryKey: ['wardrobe', userId],
  queryFn: fetchWardrobe,
  staleTime: 5 * 60 * 1000, // 5 min
})
```

## Testing Strategy (TODO)

### Unit Tests
- Pure functions (hash, utils)
- Zustand stores

### Integration Tests
- React Query hooks
- Component interactions

### E2E Tests
- Detox pour critical paths
- Auth flow
- Onboarding flow
- Add item to wardrobe

## Deployment

### Mobile

```bash
# Build iOS
eas build --platform ios

# Build Android
eas build --platform android

# Submit to stores
eas submit
```

### Edge Functions

```bash
supabase functions deploy ai-rate
supabase functions deploy ai-generate
supabase functions deploy ai-render
```

### Environment Variables

Production `.env` doit contenir :
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_AI_PROVIDER` (mock ou provider réel)
- API keys si provider réel

## Future Enhancements

### Phase 2
- Realtime collaboration (partage d'outfits)
- Social features (likes, comments)
- Recommendations "Explore"

### Phase 3
- AR try-on (avec mannequin virtuel si demandé)
- Shopping integration (affiliate links)
- Wardrobe analytics (stats d'utilisation)

### Tech Debt
- Implement real AI providers (OpenAI, Anthropic)
- Add comprehensive test suite
- Setup CI/CD pipeline
- Error tracking (Sentry)
- Analytics (Mixpanel, Amplitude)

---

**Dernière mise à jour :** 2026-02-10
