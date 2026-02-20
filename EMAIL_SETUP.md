# 📧 Configuration Email avec Firebase Functions

Ce guide explique comment configurer l'envoi d'emails depuis le formulaire de contact en utilisant Firebase Cloud Functions et Nodemailer.

## 🚀 Prérequis

1. **Firebase CLI installé** : `npm install -g firebase-tools`
2. **Plan Firebase Blaze** (pay-as-you-go) - Gratuit jusqu'à un certain seuil
3. **Compte Gmail** (ou autre service SMTP)

## 📝 Étapes de Configuration

### 1. Activer le Plan Blaze sur Firebase

1. Allez sur [Firebase Console](https://console.firebase.google.com/)
2. Sélectionnez votre projet
3. Allez dans **Settings** > **Usage and billing**
4. Cliquez sur **Modify plan** et sélectionnez **Blaze (Pay as you go)**
5. Configurez votre carte de crédit (ne sera pas facturée dans les limites gratuites)

**Limites gratuites :**
- 2 millions d'invocations/mois
- 400,000 GB-secondes/mois
- Largement suffisant pour un site de boulangerie

### 2. Configurer les Credentials Email

Vous avez besoin d'un email Gmail et d'un **App Password** (pas votre mot de passe Gmail normal).

#### Créer un App Password Gmail :

1. Allez sur [Google Account Security](https://myaccount.google.com/security)
2. Activez la **2-Step Verification** si ce n'est pas déjà fait
3. Allez dans **App passwords**
4. Sélectionnez **Mail** et **Other (Custom name)**
5. Nommez-le "Firebase Functions"
6. Copiez le mot de passe généré (16 caractères)

### 3. Configurer Firebase Functions

Dans votre terminal, à la racine du projet :

```bash
# Se connecter à Firebase
firebase login

# Initialiser le projet (si pas déjà fait)
firebase use --add
# Sélectionnez votre projet Firebase

# Configurer les variables d'environnement
firebase functions:config:set email.user="votre-email@gmail.com"
firebase functions:config:set email.pass="votre-app-password-16-chars"
firebase functions:config:set email.recipient="email-destinataire@gmail.com"
```

**Exemple :**
```bash
firebase functions:config:set email.user="joycekeumogne1@gmail.com"
firebase functions:config:set email.pass="abcd efgh ijkl mnop"
firebase functions:config:set email.recipient="joycekeumogne1@gmail.com"
```

### 4. Déployer les Cloud Functions

```bash
# Déployer les functions
firebase deploy --only functions
```

Attendez que le déploiement se termine (peut prendre 2-5 minutes).

### 5. Tester le Formulaire

1. Lancez votre application : `npm run dev`
2. Allez sur la page Contact
3. Remplissez le formulaire
4. Cliquez sur "Envoyer le message"
5. Vérifiez votre boîte email !

## 🔧 Configuration Locale (Développement)

Pour tester localement sans déployer :

```bash
# Dans le dossier functions/
cd functions
npm install

# Retour à la racine
cd ..

# Démarrer l'émulateur Firebase
firebase emulators:start
```

Puis dans votre code, configurez l'émulateur :

```typescript
import { connectFunctionsEmulator } from 'firebase/functions';

const functions = getFunctions();
if (import.meta.env.DEV) {
  connectFunctionsEmulator(functions, 'localhost', 5001);
}
```

## 📊 Structure des Fichiers

```
react-firebase-app/
├── functions/
│   ├── src/
│   │   └── index.ts          # Cloud Function sendContactEmail
│   ├── package.json
│   └── tsconfig.json
├── firebase.json              # Config Firebase
└── EMAIL_SETUP.md            # Ce fichier
```

## 🔒 Sécurité

- ✅ Les credentials email sont stockés dans Firebase Functions config (sécurisé)
- ✅ Pas de credentials dans le code frontend
- ✅ La fonction est appelable uniquement via Firebase SDK
- ✅ Validation des données côté serveur

## 🆘 Dépannage

### Erreur "Firebase Functions not configured"

Vérifiez que vous avez bien configuré les variables :

```bash
firebase functions:config:get
```

Vous devriez voir :
```json
{
  "email": {
    "user": "votre-email@gmail.com",
    "pass": "votre-app-password",
    "recipient": "destinataire@gmail.com"
  }
}
```

### Erreur "Invalid login"

- Vérifiez que vous utilisez un **App Password**, pas votre mot de passe Gmail normal
- Vérifiez que la 2-Step Verification est activée sur votre compte Google

### Erreur "Permission denied"

- Vérifiez que votre projet Firebase est sur le plan **Blaze**
- Vérifiez que les Functions sont bien déployées

### Je ne reçois pas les emails

1. Vérifiez vos **spams/courrier indésirable**
2. Vérifiez que `email.recipient` est correct
3. Consultez les logs Firebase :
   ```bash
   firebase functions:log
   ```

## 💰 Coûts

**Plan Blaze gratuit jusqu'à :**
- 2M invocations/mois
- 400,000 GB-secondes/mois
- 200,000 CPU-secondes/mois

Pour un site de boulangerie avec ~100 messages/mois, vous resterez **100% gratuit**.

Au-delà : ~$0.40 par million d'invocations supplémentaires.

## 🔄 Utiliser un Autre Service Email

Si vous ne voulez pas utiliser Gmail, modifiez `functions/src/index.ts` :

### Pour Outlook/Hotmail :
```typescript
const transporter = nodemailer.createTransport({
  service: "hotmail",
  auth: {
    user: emailConfig.user,
    pass: emailConfig.pass,
  },
});
```

### Pour un serveur SMTP personnalisé :
```typescript
const transporter = nodemailer.createTransport({
  host: "smtp.example.com",
  port: 587,
  secure: false,
  auth: {
    user: emailConfig.user,
    pass: emailConfig.pass,
  },
});
```

## 📚 Documentation Officielle

- [Firebase Functions](https://firebase.google.com/docs/functions)
- [Nodemailer](https://nodemailer.com/)
- [Gmail App Passwords](https://support.google.com/accounts/answer/185833)

## ✅ Checklist de Configuration

- [ ] Plan Blaze activé sur Firebase
- [ ] App Password Gmail créé
- [ ] Variables Firebase Functions configurées
- [ ] Functions déployées
- [ ] Test du formulaire réussi
- [ ] Email reçu dans la boîte de réception
