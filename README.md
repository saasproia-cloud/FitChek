# FitChek - Mobile App

**FitChek** est une application mobile iOS/Android B2C qui aide les jeunes et ados à noter leurs outfits et générer de nouveaux looks à partir de leur placard.

## 🎯 Fonctionnalités

### MVP Implémentées

- ✅ **Authentification** : Email/password via Supabase Auth
- ✅ **Onboarding** : 5 écrans pour définir le style, contexte, et préférences
- ✅ **Placard (Wardrobe)** : Ajouter, visualiser, filtrer ses vêtements
- ✅ **MockAI Provider** : Système fonctionnel offline sans clés API
- ✅ **Edge Functions** : Template avec quota guards pour premium/free
- ✅ **Migrations SQL** : Schema complet avec RLS policies
- ✅ **UI/UX** : Design minimal inspiré CalAI avec NativeWind

### À Compléter

- ⏳ **Rating Flow** : Upload photo outfit + écran résultat avec score
- ⏳ **Generator Flow** : Génération d'outfits + image floating clothes
- ⏳ **Paywall UI** : Éléments floutés + cadenas pour free users
- ⏳ **History** : Liste des ratings et outfits générés
- ⏳ **Home Screen** : Score du jour + outfit du jour + actions
- ⏳ **Settings** : Modifier profil et préférences

## 🛠️ Stack Technique

### Mobile
- **React Native** + **Expo** (SDK 54)
- **TypeScript**
- **Expo Router** (file-based routing)
- **NativeWind** (Tailwind CSS pour React Native)
- **Zustand** (state management)
- **TanStack React Query** (data fetching)

### Backend
- **Supabase** (Auth, Postgres, Storage, Edge Functions)
- **Row Level Security (RLS)** strict par user

### IA (Provider-Agnostic)
- Abstraction `AIProvider` pour supporter multiple providers
- **MockAI** implémenté (fonctionne offline)
- Support prévu : OpenAI, Anthropic, Replicate

## 📦 Installation

### Prérequis

- Node.js 18+
- npm ou yarn
- Expo CLI (`npm install -g expo-cli`)
- Compte Supabase (gratuit)

### 1. Clone et Install

```bash
git clone <repo-url>
cd FITCHEK
npm install
```

### 2. Configuration Supabase

1. Créer un projet sur [supabase.com](https://supabase.com)

2. Exécuter la migration SQL :
   - Aller dans SQL Editor
   - Copier/coller `supabase/migrations/20260210_initial_schema.sql`
   - Exécuter

3. Créer le bucket Storage :
   - Nom : `outfit-images`
   - Public : Oui
   - Ajouter les policies (voir `supabase/README.md`)

4. Récupérer les clés :
   - Project Settings → API
   - Copier `Project URL` et `anon public` key

### 3. Variables d'Environnement

Créer un fichier `.env` à la racine :

```env
# Supabase (OBLIGATOIRE)
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...

# AI Provider (OPTIONNEL - app fonctionne en mock par défaut)
EXPO_PUBLIC_AI_PROVIDER=mock

# Dev Flags
EXPO_PUBLIC_DEV_PREMIUM=false
```

### 4. Lancer l'App

```bash
# Dev server
npm start

# iOS (nécessite macOS + Xcode)
npm run ios

# Android (nécessite Android Studio)
npm run android

# Web (pour test rapide)
npm run web
```

## 🧪 Mode Mock (Sans Clés API)

**L'application est 100% fonctionnelle sans clés API.**

Le `MockAIProvider` :
- Génère des scores déterministes mais variés
- Simule des délais réseau réalistes
- Retourne des conseils/tips en français
- Crée des images SVG placeholder

Pour tester les features premium sans paiement, ajouter dans `.env` :
```
EXPO_PUBLIC_DEV_PREMIUM=true
```

## 🗂️ Structure du Projet

```
FITCHEK/
├── app/                      # Expo Router screens
│   ├── (tabs)/              # Tab navigation (Home, Wardrobe, History)
│   ├── onboarding/          # Onboarding flow
│   ├── auth.tsx             # Login/Signup
│   ├── settings.tsx         # Settings
│   └── upgrade.tsx          # Premium paywall
│
├── src/
│   ├── components/          # UI components réutilisables
│   ├── features/            # Features par domaine
│   │   ├── wardrobe/       # Wardrobe CRUD + hooks
│   │   ├── ratings/        # (À implémenter)
│   │   ├── generator/      # (À implémenter)
│   │   └── paywall/        # (À implémenter)
│   ├── lib/                # Libs & config
│   │   ├── supabase.ts     # Client Supabase
│   │   ├── ai/             # AI provider abstraction
│   │   └── AuthProvider.tsx
│   └── store/              # Zustand stores
│       ├── useAuthStore.ts
│       └── useOnboardingStore.ts
│
├── supabase/
│   ├── migrations/         # SQL schema + RLS
│   ├── functions/          # Edge Functions (Deno)
│   │   ├── ai-rate/
│   │   ├── ai-generate/
│   │   └── ai-render/
│   └── seed.sql           # Data de test (optionnel)
│
├── .env.example           # Template variables d'environnement
├── tailwind.config.js     # Config NativeWind
└── README.md
```

## 🎨 Design System

### Couleurs
- Primary: `#0ea5e9` (blue-500)
- Accent: Variable selon contexte
- Gris: Scale de gray-50 à gray-900

### Typography
- Titres: `font-bold`
- Body: `font-medium` ou regular
- Tailles: `text-3xl`, `text-xl`, `text-base`, `text-sm`

### Composants
- Cards: `rounded-2xl` avec `border border-gray-200`
- Buttons: `rounded-xl` ou `rounded-full`
- Spacing: Généreux, minimal clutter

## 🔐 Freemium & Premium

### Gratuit
- 3 ratings / semaine
- 3 générations / semaine
- Conseils basiques
- Images avec labels limités

### Premium (9,99€/mois ou 79,99€/an)
- Ratings illimités
- Générations illimitées
- Conseils avancés
- Suggestions shopping hors placard
- Images complètes avec labels détaillés

### Implémentation Paywall

**Status :** UI mockée, logique à compléter

Pour tester premium en dev :
```env
EXPO_PUBLIC_DEV_PREMIUM=true
```

Intégration paiement (à faire) :
- RevenueCat (recommandé)
- ou StoreKit/Google Play Billing direct

## 🧩 Compléter les Features Manquantes

### 1. Rating Flow

**Fichiers à créer :**
- `src/features/ratings/RatingModal.tsx`
- `src/features/ratings/RatingResult.tsx`
- `src/features/ratings/hooks.ts`

**Flow :**
1. User upload photo (ImagePicker)
2. Upload vers Supabase Storage
3. Appel Edge Function `/ai-rate`
4. Afficher résultat (score, axes, conseils)
5. Sauvegarder dans `outfit_ratings`

### 2. Generator Flow

**Fichiers à créer :**
- `src/features/generator/GeneratorModal.tsx`
- `src/features/generator/GeneratedOutfitView.tsx`
- `src/features/generator/hooks.ts`

**Flow :**
1. Récupérer wardrobe items
2. User choisit occasion + confort/style balance
3. Appel Edge Function `/ai-generate`
4. Appel `/ai-render` pour image
5. Afficher outfit (image + descriptions)
6. Sauvegarder dans `generated_outfits`

### 3. Home Screen

**Améliorer `app/(tabs)/index.tsx` :**
- Fetch dernier rating du jour
- Fetch outfit du jour (generated_outfits)
- Bouton flottant "+" → bottom sheet avec actions
- Cartes mini pour haut/bas/shoes

### 4. History

**Améliorer `app/(tabs)/history.tsx` :**
- Fetch `outfit_ratings` + `generated_outfits`
- Afficher en liste chronologique
- Tap pour revoir détails

### 5. Paywall UI

**Fichiers à créer :**
- `src/features/paywall/PaywallBanner.tsx`
- `src/features/paywall/LockedCard.tsx`

**Composants :**
- Carte floutée avec `BlurView` + icône 🔒
- CTA : "Débloque avec Premium"
- Navigation vers `/upgrade`

## 🚀 Déploiement Edge Functions

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref <your-project-ref>

# Deploy functions
supabase functions deploy ai-rate
supabase functions deploy ai-generate
supabase functions deploy ai-render
```

## 📝 TODOs Prioritaires

1. **Rating Flow** : Photo upload + résultat complet
2. **Generator Flow** : Sélection items + image floating clothes
3. **Home Screen** : Dashboard avec daily score
4. **Paywall** : Blur effect + locked cards
5. **History** : Liste complète ratings + outfits
6. **Real AI Integration** : Connecter OpenAI/Anthropic/Replicate

## 🤝 Contribuer

Ce projet suit les conventions :
- **TypeScript** strict
- **ESLint** + **Prettier** (à configurer)
- **Atomic commits**
- **Feature branches**

## 📄 License

Propriétaire - Tous droits réservés

---

**FitChek** - Ton assistant style perso 🔥
