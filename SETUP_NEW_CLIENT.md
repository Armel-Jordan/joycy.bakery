# 🏢 Configuration d'un Nouveau Client

Ce guide explique comment configurer ce projet pour un nouveau client de boulangerie/pâtisserie.

## 📋 Prérequis

- Un compte Firebase
- Node.js installé
- Git installé

## 🚀 Étapes de Configuration

### 1. Créer une Nouvelle Branche

```bash
# Depuis la branche main (template)
git checkout -b nom-du-client

# Exemple:
git checkout -b patisserie-dulac
```

### 2. Créer un Projet Firebase

1. Allez sur [Firebase Console](https://console.firebase.google.com/)
2. Cliquez sur "Ajouter un projet"
3. Nommez votre projet (ex: `patisserie-dulac`)
4. Activez Google Analytics (optionnel)
5. Créez le projet

### 3. Configurer Firebase

#### a) Activer les Services

Dans votre projet Firebase:

1. **Authentication**
   - Allez dans Authentication > Sign-in method
   - Activez "Email/Password"

2. **Firestore Database**
   - Allez dans Firestore Database
   - Cliquez "Créer une base de données"
   - Choisissez le mode "production"
   - Sélectionnez une région (ex: `us-central1`)

3. **Storage** (optionnel)
   - Allez dans Storage
   - Cliquez "Commencer"

#### b) Obtenir les Credentials

1. Allez dans Paramètres du projet (⚙️)
2. Faites défiler jusqu'à "Vos applications"
3. Cliquez sur l'icône Web `</>`
4. Enregistrez l'application (ex: "Patisserie Dulac Web")
5. Copiez les valeurs de `firebaseConfig`

### 4. Configurer les Variables d'Environnement

```bash
# Copiez le fichier template
cp .env.example .env

# Éditez .env avec vos valeurs Firebase
nano .env
```

Remplissez avec vos credentials Firebase:

```env
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=patisserie-dulac.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=patisserie-dulac
VITE_FIREBASE_STORAGE_BUCKET=patisserie-dulac.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456

# Informations du client
VITE_BUSINESS_NAME=Pâtisserie Dulac
VITE_BUSINESS_EMAIL=contact@patisseriedlac.com
VITE_BUSINESS_PHONE=+1 (514) 555-9999
VITE_BUSINESS_ADDRESS=Montréal, QC
```

### 5. Personnaliser le Branding

Éditez `src/config/branding.ts`:

```typescript
export const branding = {
  businessName: 'Pâtisserie Dulac',
  tagline: 'L\'art de la pâtisserie française',
  
  contact: {
    email: 'contact@patisseriedlac.com',
    phone: '+1 (514) 555-9999',
    // ... autres infos
  },
  
  // Personnalisez les heures d'ouverture
  hours: {
    weekdays: 'Mardi - Samedi: 8h - 19h',
    saturday: 'Dimanche: 9h - 17h',
    sunday: 'Lundi: Fermé'
  }
};

// Changez les couleurs du thème
export const theme = {
  colors: {
    primary: '#1E40AF',      // Bleu
    secondary: '#60A5FA',    // Bleu clair
    accent: '#EFF6FF',       // Bleu très clair
    // ...
  }
};

// Personnalisez les catégories de produits
export const productCategories = [
  { value: 'Macarons', label: 'Macarons', emoji: '🍬' },
  { value: 'Éclairs', label: 'Éclairs', emoji: '🥖' },
  { value: 'Tartes', label: 'Tartes', emoji: '🥧' }
];
```

### 6. Remplacer les Assets

```bash
# Remplacez le logo
cp /chemin/vers/nouveau-logo.png public/logo.png

# Remplacez le favicon
cp /chemin/vers/nouveau-favicon.ico public/favicon.ico

# Ajoutez les photos de produits
cp /chemin/vers/photos/* public/
```

### 7. Mettre à Jour les Couleurs CSS (Optionnel)

Si vous voulez changer complètement le thème, modifiez `src/App.css`:

```bash
# Remplacer toutes les occurrences de la couleur principale
# Exemple: remplacer #6E260E (marron) par #1E40AF (bleu)
sed -i '' 's/#6E260E/#1E40AF/g' src/App.css
sed -i '' 's/#D4A574/#60A5FA/g' src/App.css
sed -i '' 's/#F5EDE4/#EFF6FF/g' src/App.css
```

### 8. Installer et Tester

```bash
# Installer les dépendances
npm install

# Lancer en mode développement
npm run dev

# Tester l'application sur http://localhost:5173
```

### 9. Créer un Compte Admin

1. Allez sur `/admin`
2. Créez un compte avec votre email
3. Dans Firebase Console:
   - Allez dans Firestore Database
   - Créez une collection `users`
   - Ajoutez un document avec l'ID = votre UID d'authentification
   - Ajoutez le champ: `role: "admin"`

### 10. Ajouter les Produits

1. Connectez-vous à l'admin
2. Allez dans "Produits"
3. Ajoutez vos produits avec photos et descriptions

### 11. Déployer

```bash
# Build pour production
npm run build

# Déployer sur votre hébergeur (Netlify, Vercel, etc.)
```

## 🔄 Mise à Jour depuis le Template

Pour récupérer les nouvelles fonctionnalités du template:

```bash
# Depuis votre branche client
git checkout nom-du-client

# Récupérer les changements du template
git fetch origin main
git merge origin/main

# Résoudre les conflits si nécessaire
# Puis commit
git add .
git commit -m "Merge updates from main template"
```

## 📝 Checklist de Configuration

- [ ] Branche créée
- [ ] Projet Firebase créé
- [ ] Authentication activée
- [ ] Firestore Database créée
- [ ] Fichier `.env` configuré
- [ ] `branding.ts` personnalisé
- [ ] Logo et favicon remplacés
- [ ] Thème de couleurs ajusté
- [ ] Compte admin créé
- [ ] Produits ajoutés
- [ ] Application testée
- [ ] Déployée en production

## 🆘 Support

Pour toute question, contactez le développeur du template.

## 📚 Structure du Projet

```
react-firebase-app/
├── src/
│   ├── config/
│   │   └── branding.ts          ← Personnalisation client
│   ├── pages/                   ← Pages de l'application
│   ├── components/              ← Composants réutilisables
│   └── firebase.ts              ← Configuration Firebase
├── public/                      ← Assets statiques
├── .env                         ← Variables d'environnement (ne pas commit)
├── .env.example                 ← Template des variables
└── SETUP_NEW_CLIENT.md          ← Ce fichier
```
