# 🚀 Guide de Configuration Supabase - FitChek

**Temps estimé : 10 minutes**

## Étape 1 : Créer un Compte Supabase

1. Va sur [https://supabase.com](https://supabase.com)
2. Clique sur "Start your project"
3. Connecte-toi avec GitHub (recommandé) ou email

## Étape 2 : Créer un Nouveau Projet

1. Clique sur "New project"
2. Choisis une organisation (ou crée-en une)
3. Remplis les informations :
   - **Name** : `FitChek` (ou ce que tu veux)
   - **Database Password** : Génère un mot de passe fort (sauvegarde-le !)
   - **Region** : `West EU (Frankfurt)` (proche de la France)
   - **Pricing Plan** : `Free` (largement suffisant pour commencer)
4. Clique sur "Create new project"
5. ⏳ Attends 1-2 minutes que le projet se crée

## Étape 3 : Exécuter la Migration SQL

1. Dans ton projet Supabase, va dans le menu de gauche → **SQL Editor**
2. Clique sur "New query" (bouton +)
3. Copie TOUT le contenu du fichier `supabase/migrations/20260210_initial_schema.sql`
4. Colle-le dans l'éditeur SQL
5. Clique sur **RUN** (en bas à droite)
6. ✅ Tu devrais voir "Success. No rows returned"

**Ce que cette migration fait :**
- Crée la table `profiles` (infos utilisateur + préférences)
- Crée la table `wardrobe_items` (vêtements)
- Crée la table `outfit_ratings` (notes d'outfits)
- Crée la table `generated_outfits` (outfits générés)
- Crée la table `usage_counters` (quotas freemium)
- Configure les Row Level Security (RLS) policies
- Crée les triggers et fonctions SQL

## Étape 4 : Créer le Bucket Storage

1. Dans le menu de gauche → **Storage**
2. Clique sur "Create a new bucket"
3. Remplis les informations :
   - **Name** : `outfit-images`
   - **Public bucket** : ✅ COCHER (important pour afficher les images)
4. Clique sur "Create bucket"

### Configurer les Policies du Bucket

1. Clique sur le bucket `outfit-images` que tu viens de créer
2. Va dans l'onglet **Policies**
3. Clique sur "New policy" puis "For full customization"

**Policy 1 : Upload (INSERT)**
- Policy name : `Users can upload their own images`
- Target roles : `authenticated`
- Colle cette policy :
```sql
((bucket_id = 'outfit-images'::text) AND ((auth.uid())::text = (storage.foldername(name))[1]))
```

**Policy 2 : Read (SELECT)**
- Clique à nouveau sur "New policy"
- Policy name : `Public can view images`
- Target roles : `public`
- Colle cette policy :
```sql
(bucket_id = 'outfit-images'::text)
```

**Policy 3 : Delete**
- Clique à nouveau sur "New policy"
- Policy name : `Users can delete their own images`
- Target roles : `authenticated`
- Colle cette policy :
```sql
((bucket_id = 'outfit-images'::text) AND ((auth.uid())::text = (storage.foldername(name))[1]))
```

## Étape 5 : Récupérer les Clés API

1. Dans le menu de gauche → **Settings** (icône engrenage)
2. Clique sur **API**
3. Tu verras deux sections importantes :

### Project URL
```
https://xxxxxxxxxxxxx.supabase.co
```
→ Copie cette URL

### Project API keys
- **anon public** : `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
→ Copie cette clé (la longue !)

⚠️ **ATTENTION** : Ne copie PAS la clé "service_role" (elle est dangereuse et ne doit jamais être exposée côté client)

## Étape 6 : Mettre à Jour le Fichier .env

1. Ouvre le fichier `.env` à la racine du projet
2. Remplace les valeurs :

```env
EXPO_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Laisse le reste tel quel :**
```env
EXPO_PUBLIC_AI_PROVIDER=mock
EXPO_PUBLIC_DEV_PREMIUM=false
```

## Étape 7 : Vérifier que Tout Fonctionne

1. Dans le terminal, lance l'app :
```bash
npm start
```

2. Appuie sur `w` pour ouvrir dans le navigateur (plus rapide pour tester)

3. Crée un compte :
   - Email : `test@test.com`
   - Password : `test1234`

4. Si tout fonctionne :
   - ✅ Tu es redirigé vers l'onboarding
   - ✅ Tu peux compléter les 5 étapes
   - ✅ Tu arrives sur l'écran Home

## Étape 8 : Vérifier les Données dans Supabase

1. Retourne dans ton projet Supabase
2. Menu de gauche → **Table Editor**
3. Clique sur la table `profiles`
4. Tu devrais voir ton profil avec tes réponses d'onboarding !

---

## 🐛 Problèmes Courants

### Erreur "Invalid API key"
- Vérifie que tu as bien copié la clé **anon public** (pas service_role)
- Vérifie qu'il n'y a pas d'espaces avant/après dans le .env

### Erreur "Row Level Security policy violation"
- Retourne à l'Étape 3 et re-exécute la migration SQL
- Vérifie dans Table Editor → profiles → Policies que tu as bien 4 policies

### Les images ne s'affichent pas
- Vérifie que le bucket `outfit-images` est bien **Public**
- Vérifie les policies du bucket (Étape 4)

### "Failed to create user"
- Va dans Authentication → Settings → Email Auth
- Vérifie que "Enable email signups" est activé
- Désactive "Enable email confirmations" (pour le dev)

---

## 🎉 C'est Tout !

Ton backend Supabase est maintenant configuré et prêt à l'emploi.

**Ce qui fonctionne maintenant :**
- ✅ Authentification (signup/login)
- ✅ Onboarding (sauvegarde des préférences)
- ✅ Wardrobe (ajout/suppression de vêtements avec photos)
- ✅ Upload d'images vers le Storage
- ✅ Mode mock pour l'IA (pas besoin de clés API)

**Prochaines étapes :**
- Implémenter le Rating Flow
- Implémenter le Generator Flow
- Voir `NEXT_STEPS.md` pour la suite
