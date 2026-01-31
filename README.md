# 🧁 Joycy Bakery

Application web de boulangerie construite avec React, TypeScript, Vite et Firebase.

## 📋 Fonctionnalités

- ✅ Authentification Firebase (Email/Password)
- ✅ Base de données Firestore en temps réel
- ✅ TypeScript pour la sécurité des types
- ✅ Interface utilisateur moderne et responsive
- ✅ Vite pour un développement rapide

## 🚀 Installation

1. **Cloner le projet**
```bash
git clone https://github.com/Armel-Jordan/joycy.bakery.git
cd joycy.bakery
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer Firebase**

   - Créez un projet sur [Firebase Console](https://console.firebase.google.com/)
   - Activez Authentication (Email/Password)
   - Activez Firestore Database
   - Copiez vos identifiants Firebase

4. **Configurer les variables d'environnement**

   Créez un fichier `.env` à la racine du projet :
   ```bash
   cp .env.example .env
   ```

   Remplissez le fichier `.env` avec vos identifiants Firebase :
   ```env
   VITE_FIREBASE_API_KEY=votre_api_key
   VITE_FIREBASE_AUTH_DOMAIN=votre_projet.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=votre_projet_id
   VITE_FIREBASE_STORAGE_BUCKET=votre_projet.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=votre_sender_id
   VITE_FIREBASE_APP_ID=votre_app_id
   ```

5. **Lancer le serveur de développement**
```bash
npm run dev
```

## 📦 Scripts disponibles

- `npm run dev` - Lance le serveur de développement
- `npm run build` - Compile le projet pour la production
- `npm run preview` - Prévisualise la version de production
- `npm run lint` - Vérifie le code avec ESLint

## 🏗️ Structure du projet

```
src/
├── components/
│   ├── Auth.tsx          # Composant d'authentification
│   └── DataList.tsx      # Composant de gestion des données
├── firebase.ts           # Configuration Firebase
├── App.tsx              # Composant principal
├── main.tsx             # Point d'entrée
└── vite-env.d.ts        # Types TypeScript pour Vite
```

## 🔐 Sécurité

- Le fichier `.env` est ignoré par Git (voir `.gitignore`)
- Ne commitez jamais vos identifiants Firebase
- Utilisez `.env.example` comme modèle

## 📝 Configuration Firestore

Règles de sécurité recommandées pour Firestore :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /items/{itemId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 🌐 Déploiement sur GitHub

```bash
# Initialiser Git (si pas déjà fait)
git init
git add .
git commit -m "Initial commit"

# Ajouter votre repository GitHub
git remote add origin https://github.com/Armel-Jordan/joycy.bakery.git
git branch -M main
git push -u origin main
```

## 🛠️ Technologies utilisées

- [React](https://react.dev/) - Bibliothèque UI
- [TypeScript](https://www.typescriptlang.org/) - Typage statique
- [Vite](https://vitejs.dev/) - Build tool
- [Firebase](https://firebase.google.com/) - Backend as a Service
- [Firestore](https://firebase.google.com/docs/firestore) - Base de données NoSQL

## 📄 Licence

MIT
