# 🚀 Quick Start - FitChek

## Ce qui est déjà fait ✅

- ✅ Projet Expo initialisé
- ✅ Toutes les dépendances installées
- ✅ Code TypeScript compilé sans erreurs
- ✅ Fichier `.env` créé
- ✅ Structure complète du projet
- ✅ MockAI provider (fonctionne sans clés API)

## 3 étapes pour lancer l'app

### Étape 1 : Configure Supabase (10 min)

Tu DOIS créer un projet Supabase (je ne peux pas le faire pour toi car tu as besoin d'un compte).

**Guide détaillé :** Ouvre [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)

**Version ultra-rapide :**
1. Va sur https://supabase.com → Crée un compte → Nouveau projet
2. Dans SQL Editor, copie/colle tout le fichier `supabase/migrations/20260210_initial_schema.sql` → RUN
3. Dans Storage, crée un bucket `outfit-images` (public)
4. Dans Settings → API, copie l'URL + clé anon
5. Mets-les dans le fichier `.env` (remplace `your-project-id` et `your_anon_key_here`)

### Étape 2 : Vérifie que tout est OK

```bash
# Sur Windows (Git Bash)
bash setup.sh

# Ou manuellement
npx tsc --noEmit
```

Si tout est vert ✅, passe à l'étape 3.

### Étape 3 : Lance l'app

```bash
npm start
```

Puis appuie sur :
- **`w`** → Web (le plus rapide pour tester)
- **`i`** → iOS (nécessite macOS + Xcode)
- **`a`** → Android (nécessite Android Studio)

---

## Test rapide

1. Crée un compte : `test@test.com` / `test1234`
2. Complète l'onboarding (5 écrans)
3. Arrive sur l'écran Home
4. Va dans Wardrobe → Ajoute un vêtement
5. Upload une photo (ou skip)
6. ✅ Vérifie qu'il apparaît dans la liste

---

## ⚠️ Je suis bloqué

### "Invalid API key" ou "Unauthorized"
→ Vérifie ton fichier `.env` :
- L'URL doit être `https://xxxxx.supabase.co` (remplace xxxxx)
- La clé anon est super longue (commence par `eyJ...`)
- Pas d'espaces avant/après

### "Row Level Security policy violation"
→ Retourne dans Supabase SQL Editor et re-exécute la migration complète

### "Bucket not found" quand j'upload une photo
→ Vérifie que le bucket `outfit-images` existe et est **Public**

### L'app crash au démarrage
→ Vérifie la console :
```bash
# Nettoie le cache
rm -rf node_modules/.cache .expo
npm start
```

---

## 📚 Ressources

- **README.md** : Vue d'ensemble complète
- **ARCHITECTURE.md** : Comment tout fonctionne
- **NEXT_STEPS.md** : Features à implémenter (Rating, Generator, etc.)
- **SUPABASE_SETUP.md** : Guide détaillé Supabase

---

## 🎯 Prochaines étapes (après que l'app tourne)

L'app fonctionne mais il manque encore :
- ⏳ Rating Flow (noter un outfit avec photo)
- ⏳ Generator Flow (générer un outfit depuis le placard)
- ⏳ Home Screen amélioré (score du jour + outfit du jour)
- ⏳ History (liste des ratings + outfits générés)
- ⏳ Paywall UI (blur + cadenas pour free users)

Voir **NEXT_STEPS.md** pour les implémenter (25-30h estimées).

---

**Besoin d'aide ?** Ouvre un fichier .md pertinent ou demande-moi !
