# Next Steps - Features à Implémenter

Ce document détaille les étapes pour compléter FitChek. Les fondations sont en place, voici comment finaliser l'MVP.

## ✅ Ce qui est Déjà Fait

- [x] Setup Expo + TypeScript + Router + NativeWind
- [x] Supabase client + Auth
- [x] Migrations SQL complètes avec RLS
- [x] Onboarding complet (5 écrans)
- [x] Wardrobe CRUD fonctionnel
- [x] MockAI provider (offline mode)
- [x] Edge Functions templates
- [x] UI skeleton pour toutes les screens
- [x] Documentation complète

## 🚧 Priority 1: Rating Flow

**Objectif :** Permettre à l'user de prendre une photo de son outfit et recevoir un score + conseils.

### Fichiers à Créer

#### 1. `src/features/ratings/hooks.ts`

```typescript
import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { aiProvider } from '@/lib/ai';
import * as ImagePicker from 'expo-image-picker';

export function useRateOutfit() {
  return useMutation({
    mutationFn: async (imageUri: string) => {
      const user = // get from auth store

      // 1. Upload image to storage
      const fileName = `${user.id}/ratings/${Date.now()}.jpg`;
      const { data: uploadData } = await supabase.storage
        .from('outfit-images')
        .upload(fileName, { uri: imageUri });

      const { data: publicUrl } = supabase.storage
        .from('outfit-images')
        .getPublicUrl(uploadData.path);

      // 2. Call AI provider (local) or Edge Function
      const result = await aiProvider.rateOutfit(
        publicUrl.publicUrl,
        userContext,
        wardrobeItems
      );

      // 3. Save to DB
      await supabase.from('outfit_ratings').insert({
        user_id: user.id,
        image_url: publicUrl.publicUrl,
        ...result
      });

      return result;
    }
  });
}

export async function pickOutfitImage() {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== 'granted') return null;

  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    quality: 0.8,
  });

  return result.canceled ? null : result.assets[0].uri;
}
```

#### 2. `src/features/ratings/RatingModal.tsx`

Modal pour prendre/choisir la photo :
- Bouton "Prendre photo"
- Bouton "Choisir dans galerie"
- Preview de l'image
- Bouton "Noter cet outfit"
- Loading state pendant rating

#### 3. `src/features/ratings/RatingResult.tsx`

Écran résultat :
- Grand score /100 avec ring animé
- 3 cartes : Couleurs / Cohérence / Occasion (scores axes)
- Section "Ce qui marche" (strengths)
- Section "À tester" (improvements)
- Suggestions depuis wardrobe (si dispo)
- Bouton "Générer une version améliorée"

### Intégration

Ajouter dans `app/(tabs)/index.tsx` :

```tsx
const [showRatingModal, setShowRatingModal] = useState(false);

// Floating button ou action sheet
<RatingModal
  visible={showRatingModal}
  onClose={() => setShowRatingModal(false)}
/>
```

---

## 🚧 Priority 2: Generator Flow

**Objectif :** Générer un outfit basé sur le placard de l'user.

### Fichiers à Créer

#### 1. `src/features/generator/hooks.ts`

```typescript
export function useGenerateOutfit() {
  return useMutation({
    mutationFn: async (params: {
      occasion: string;
      comfortStyle: string;
    }) => {
      const user = // auth
      const wardrobeItems = // fetch

      // Call AI provider
      const outfit = await aiProvider.generateOutfit({
        wardrobeItems,
        userContext,
        ...params
      });

      // Render image
      const imageUrl = await aiProvider.renderOutfitImage(
        outfit,
        wardrobeItems,
        true // includeLabels
      );

      // Save to DB
      await supabase.from('generated_outfits').insert({
        user_id: user.id,
        selected_item_ids: [outfit.top_id, outfit.bottom_id, outfit.shoes_id],
        generated_image_url: imageUrl,
        description: outfit.description,
        estimated_score: outfit.estimated_score
      });

      return { outfit, imageUrl };
    }
  });
}
```

#### 2. `src/features/generator/GeneratorModal.tsx`

Form pour choisir paramètres :
- Occasion : dropdown (Cours, Sortir, Sport, Mariage, etc.)
- Slider Confort ↔ Style
- Bouton "Générer"
- Loading animation pendant génération

#### 3. `src/features/generator/GeneratedOutfitView.tsx`

Écran résultat :
- Grande image (floating clothes)
- Score estimé
- 3 mini cartes : Haut / Bas / Shoes
  - Photo du vêtement
  - Raison de sélection (1 phrase)
- Boutons :
  - "Regénérer" (différent outfit)
  - "Sauvegarder"
  - "Partager" (share natif avec watermark)

### Améliorer MockAI Image Rendering

Pour un meilleur rendu placeholder :

```typescript
// mockProvider.ts - renderOutfitImage
async renderOutfitImage(outfit, items, includeLabels) {
  // Fetch actual item images from items array
  const top = items.find(i => i.id === outfit.top_id);
  const bottom = items.find(i => i.id === outfit.bottom_id);
  const shoes = items.find(i => i.id === outfit.shoes_id);

  // Create SVG with colored rectangles matching item colors
  // Or return placeholder image URL

  return 'data:image/svg+xml,...';
}
```

---

## 🚧 Priority 3: Home Screen

**Objectif :** Dashboard principal avec score du jour + outfit du jour.

### Améliorer `app/(tabs)/index.tsx`

```typescript
export default function HomeScreen() {
  const { data: todayRating } = useQuery({
    queryKey: ['today-rating'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data } = await supabase
        .from('outfit_ratings')
        .select('*')
        .gte('created_at', today)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      return data;
    }
  });

  const { data: todayOutfit } = useQuery({
    queryKey: ['today-outfit'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data } = await supabase
        .from('generated_outfits')
        .select('*')
        .gte('created_at', today)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      return data;
    }
  });

  // Render score card
  // Render outfit image
  // Floating button → bottom sheet avec :
  //   - "Noter mon outfit"
  //   - "Générer un outfit"
}
```

### Bottom Sheet

Installer `@gorhom/bottom-sheet` :

```bash
npm install @gorhom/bottom-sheet
```

Ou créer un simple Modal avec 2 boutons.

---

## 🚧 Priority 4: Paywall UI

**Objectif :** Montrer éléments premium verrouillés + floutés pour free users.

### Fichiers à Créer

#### 1. `src/features/paywall/LockedCard.tsx`

```tsx
import { BlurView } from 'expo-blur';

export function LockedCard({
  children,
  isLocked
}: {
  children: React.ReactNode,
  isLocked: boolean
}) {
  if (!isLocked) return <>{children}</>;

  return (
    <View className="relative">
      <View className="opacity-40">
        {children}
      </View>
      <BlurView
        intensity={20}
        className="absolute inset-0 items-center justify-center"
      >
        <View className="bg-black/70 rounded-full p-3">
          <Text className="text-white text-2xl">🔒</Text>
        </View>
        <Pressable
          onPress={() => router.push('/upgrade')}
          className="mt-2 bg-blue-500 rounded-full px-4 py-2"
        >
          <Text className="text-white font-semibold">
            Débloque avec Premium
          </Text>
        </Pressable>
      </BlurView>
    </View>
  );
}
```

#### 2. Usage dans Rating Result

```tsx
<LockedCard isLocked={!isPremium}>
  <View className="p-4 bg-gray-50 rounded-xl">
    <Text className="font-semibold mb-2">Suggestions avancées</Text>
    <Text>Essaie un blazer noir pour élever le look...</Text>
  </View>
</LockedCard>
```

### Installer blur

```bash
npm install expo-blur
```

---

## 🚧 Priority 5: History Screen

**Objectif :** Liste de tous les ratings et outfits générés.

### Améliorer `app/(tabs)/history.tsx`

```typescript
export default function HistoryScreen() {
  const { data: ratings } = useQuery({
    queryKey: ['ratings-history'],
    queryFn: async () => {
      const { data } = await supabase
        .from('outfit_ratings')
        .select('*')
        .order('created_at', { ascending: false });
      return data;
    }
  });

  const { data: outfits } = useQuery({
    queryKey: ['outfits-history'],
    queryFn: async () => {
      const { data } = await supabase
        .from('generated_outfits')
        .select('*')
        .order('created_at', { ascending: false });
      return data;
    }
  });

  // Merge and sort by date
  const allItems = [
    ...ratings.map(r => ({ type: 'rating', ...r })),
    ...outfits.map(o => ({ type: 'outfit', ...o }))
  ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  return (
    <FlatList
      data={allItems}
      renderItem={({ item }) =>
        item.type === 'rating'
          ? <RatingCard data={item} />
          : <OutfitCard data={item} />
      }
    />
  );
}
```

---

## 🚧 Priority 6: Settings Improvements

### Améliorer `app/settings.tsx`

- Afficher vraies données profile (depuis Supabase)
- Permettre modification des préférences onboarding
- Bouton déconnexion fonctionnel :

```typescript
const handleSignOut = async () => {
  await useAuthStore.getState().signOut();
  router.replace('/auth');
};
```

---

## 🔧 Real AI Integration (Phase 2)

### OpenAI Provider

```typescript
// src/lib/ai/openaiProvider.ts
export class OpenAIProvider implements AIProvider {
  async rateOutfit(imageUrl, context) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4-vision-preview',
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: ratingPrompt },
            { type: 'image_url', image_url: { url: imageUrl } }
          ]
        }]
      })
    });

    const result = await response.json();
    return parseRatingResult(result);
  }
}
```

### Replicate for Image Generation

```typescript
// src/lib/ai/replicateProvider.ts
export class ReplicateProvider implements AIProvider {
  async renderOutfitImage(outfit, items) {
    const prompt = buildPromptFromOutfit(outfit, items);

    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        version: 'stable-diffusion-model-id',
        input: { prompt }
      })
    });

    // Poll for result
    const prediction = await response.json();
    return await pollPrediction(prediction.id);
  }
}
```

---

## 📱 Testing Checklist

Avant de considérer le MVP complet, tester :

### Auth Flow
- [ ] Signup crée un user + profile
- [ ] Login redirige vers tabs si onboarding complété
- [ ] Login redirige vers onboarding sinon
- [ ] Logout nettoie le state

### Onboarding
- [ ] Tous les 5 écrans s'affichent
- [ ] "Passer" fonctionne
- [ ] Données sauvegardées dans Supabase
- [ ] Navigation vers home après step 5

### Wardrobe
- [ ] Liste affiche les items
- [ ] Filtres fonctionnent
- [ ] Ajout manuel d'item fonctionne
- [ ] Ajout avec photo fonctionne
- [ ] Image uploadée visible dans liste

### Rating (quand implémenté)
- [ ] Photo uploadée
- [ ] Score affiché
- [ ] Conseils lisibles
- [ ] Sauvegardé dans history

### Generator (quand implémenté)
- [ ] Génération fonctionne (même sans items)
- [ ] Image placeholder affichée
- [ ] Description visible
- [ ] Sauvegardé dans history

### Freemium
- [ ] Free user voit quota (3/3)
- [ ] Free user bloqué après 3 actions
- [ ] Dev premium flag fonctionne
- [ ] Paywall modal s'affiche
- [ ] Upgrade screen accessible

### Settings
- [ ] Données profile affichées
- [ ] Premium status visible
- [ ] Déconnexion fonctionne

---

## 🚀 Launch Checklist

### Technique
- [ ] Toutes les features MVP complétées
- [ ] App testée sur iOS + Android
- [ ] Supabase en production (pas test project)
- [ ] Edge Functions déployées
- [ ] Environment variables en prod
- [ ] Icons & splash screen customisés
- [ ] Build release (EAS Build)

### Legal
- [ ] Privacy policy
- [ ] Terms of service
- [ ] Data handling (RGPD si Europe)

### Marketing
- [ ] App Store description
- [ ] Screenshots (5-8 par platform)
- [ ] Keywords / ASO
- [ ] Landing page (optionnel)

### Monetization
- [ ] RevenueCat / StoreKit configuré
- [ ] Subscriptions créées (App Store Connect / Play Console)
- [ ] Premium flow testé end-to-end
- [ ] Restore purchases fonctionnel

---

**Temps estimé pour compléter :**

- Rating Flow : ~4-6h
- Generator Flow : ~6-8h
- Home improvements : ~2-3h
- Paywall UI : ~3-4h
- History : ~2-3h
- Settings : ~1-2h
- Testing & polish : ~4-6h

**Total : ~22-32h de dev**

Bon courage ! 🔥
