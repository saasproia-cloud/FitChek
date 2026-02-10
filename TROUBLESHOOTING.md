# 🔧 Troubleshooting - FitChek

## ❌ Erreur : `ERR_UNSUPPORTED_ESM_URL_SCHEME` avec Node v24

### Symptôme
```
Error [ERR_UNSUPPORTED_ESM_URL_SCHEME]: Error loading Metro config
Only URLs with a scheme in: file, data, and node are supported
Received protocol 'd:'
```

### Cause
**Node.js v24** a des changements dans la gestion des modules ESM qui ne sont pas encore compatibles avec **Expo CLI** sur Windows avec des chemins absolus (ex: `d:\FITCHEK\metro.config.js`).

---

## ✅ Solution 1 : Downgrader vers Node 20 LTS (RECOMMANDÉ)

### Windows

1. **Désinstalle Node 24**
   - Panneau de configuration → Programmes → Désinstaller Node.js

2. **Installe Node 20 LTS**
   - Va sur https://nodejs.org
   - Télécharge la version **LTS** (Long Term Support) - actuellement v20.x.x
   - Installe normalement

3. **Vérifie l'installation**
   ```bash
   node --version
   # Devrait afficher: v20.x.x
   ```

4. **Relance Expo**
   ```bash
   npm start
   ```

### Alternative : Utiliser nvm-windows

Si tu veux gérer plusieurs versions de Node :

1. **Installe nvm-windows**
   - Télécharge depuis : https://github.com/coreybutler/nvm-windows/releases
   - Installe `nvm-setup.exe`

2. **Installe et utilise Node 20**
   ```bash
   nvm install 20
   nvm use 20
   node --version  # v20.x.x
   ```

3. **Relance Expo**
   ```bash
   npm start
   ```

---

## ✅ Solution 2 : Utiliser WSL (Windows Subsystem for Linux)

Si tu as WSL installé :

```bash
# Dans WSL
cd /mnt/d/FITCHEK
npm install
npm start
```

---

## ✅ Solution 3 : Attendre la mise à jour d'Expo

Expo va probablement corriger ce problème dans une future version. En attendant, utilise Node 20 LTS.

---

## 🐛 Autres problèmes courants

### "Invalid API key" ou "Unauthorized"
**Solution :** Vérifie ton fichier `.env` :
- L'URL doit être `https://xxxxx.supabase.co`
- La clé anon est super longue (commence par `eyJ...`)
- Pas d'espaces avant/après

### "Row Level Security policy violation"
**Solution :** Re-exécute la migration SQL complète dans Supabase SQL Editor

### "Bucket not found" lors de l'upload de photo
**Solution :**
1. Va dans Supabase → Storage
2. Vérifie que le bucket `outfit-images` existe
3. Vérifie qu'il est **Public**
4. Vérifie les policies (voir SUPABASE_SETUP.md)

### L'app crash au démarrage
**Solution :**
```bash
# Nettoie le cache
rm -rf node_modules/.cache .expo
npm start
```

### TypeScript errors dans l'IDE
**Solution :**
```bash
# Rebuild TypeScript
npx tsc --noEmit
```

### Images ne s'affichent pas
**Solution :**
- Vérifie que le bucket `outfit-images` est **Public**
- Vérifie les policies du bucket
- Vérifie que l'URL de l'image est accessible dans le navigateur

---

## 📱 Problèmes spécifiques iOS

### "Could not connect to development server"
**Solution :**
- Assure-toi que ton Mac et ton iPhone sont sur le même réseau WiFi
- Utilise Expo Go (télécharge depuis l'App Store)
- Scanne le QR code avec l'appareil photo

### Build errors avec Xcode
**Solution :**
```bash
cd ios
pod install
cd ..
npm run ios
```

---

## 📱 Problèmes spécifiques Android

### "SDK not found"
**Solution :**
- Installe Android Studio
- Ouvre Android Studio → More Actions → SDK Manager
- Installe Android SDK Platform-Tools et Android 13 (API 33)

### Emulator ne démarre pas
**Solution :**
- Ouvre Android Studio
- Tools → AVD Manager
- Create Virtual Device → Choisis un device récent
- Démarre l'émulateur avant `npm run android`

---

## 🆘 Besoin d'aide ?

1. Vérifie les fichiers de documentation :
   - [README.md](./README.md) - Vue d'ensemble
   - [QUICK_START.md](./QUICK_START.md) - Guide rapide
   - [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) - Setup Supabase
   - [ARCHITECTURE.md](./ARCHITECTURE.md) - Architecture

2. Vérifie que tu as bien :
   - ✅ Node 20 LTS (PAS v24)
   - ✅ Supabase configuré avec les bonnes clés
   - ✅ Migration SQL exécutée
   - ✅ Bucket `outfit-images` créé et public

3. Supprime et réinstalle les dépendances :
   ```bash
   rm -rf node_modules
   npm install
   ```

4. Nettoie le cache Expo :
   ```bash
   rm -rf .expo node_modules/.cache
   npm start -- --clear
   ```

---

## 📊 Versions testées

- ✅ Node.js v20.x.x (LTS) - **FONCTIONNE**
- ❌ Node.js v24.x.x - **NE FONCTIONNE PAS** (problème connu)
- ✅ Expo SDK 54.0.33
- ✅ React Native 0.81.5
- ✅ Windows 10/11
- ✅ macOS (tous les OS récents)

---

**En cas de problème persistant, ouvre une issue sur GitHub avec :**
- Version de Node (`node --version`)
- Version d'Expo (`npx expo --version`)
- OS et version
- Message d'erreur complet
