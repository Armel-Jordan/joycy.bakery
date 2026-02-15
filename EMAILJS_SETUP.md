# 📧 Configuration EmailJS pour le Formulaire de Contact

Ce guide explique comment configurer EmailJS pour recevoir les emails du formulaire de contact.

## 🚀 Étapes de Configuration

### 1. Créer un Compte EmailJS

1. Allez sur [https://www.emailjs.com/](https://www.emailjs.com/)
2. Cliquez sur "Sign Up" (gratuit jusqu'à 200 emails/mois)
3. Créez votre compte avec votre email

### 2. Ajouter un Service Email

1. Dans le dashboard EmailJS, allez dans **"Email Services"**
2. Cliquez sur **"Add New Service"**
3. Choisissez votre fournisseur d'email :
   - **Gmail** (recommandé pour débuter)
   - Outlook
   - Yahoo
   - Ou autre service SMTP
4. Connectez votre compte email
5. Notez le **Service ID** (ex: `service_abc123`)

### 3. Créer un Template d'Email

1. Allez dans **"Email Templates"**
2. Cliquez sur **"Create New Template"**
3. Configurez le template :

**Template Settings :**
```
Template Name: Contact Form
Template ID: (sera généré automatiquement, ex: template_xyz789)
```

**Email Content :**

**Subject:**
```
Nouveau message de {{from_name}} - {{subject}}
```

**Body (HTML ou Text):**
```html
Vous avez reçu un nouveau message depuis le formulaire de contact :

Nom: {{from_name}}
Email: {{from_email}}
Téléphone: {{phone}}
Sujet: {{subject}}

Message:
{{message}}

---
Ce message a été envoyé depuis le formulaire de contact de votre site web.
```

4. Dans **"To Email"**, mettez l'email où vous voulez recevoir les messages (ex: `joycekeumogne1@gmail.com`)
5. Cliquez sur **"Save"**
6. Notez le **Template ID**

### 4. Obtenir la Clé Publique (Public Key)

1. Allez dans **"Account"** > **"General"**
2. Trouvez votre **Public Key** (ex: `abc123XYZ456`)
3. Copiez-la

### 5. Configurer les Variables d'Environnement

Créez ou modifiez votre fichier `.env` :

```env
# EmailJS Configuration
VITE_EMAILJS_SERVICE_ID=service_abc123
VITE_EMAILJS_TEMPLATE_ID=template_xyz789
VITE_EMAILJS_PUBLIC_KEY=abc123XYZ456
```

**Remplacez les valeurs** par celles que vous avez obtenues dans EmailJS.

### 6. Tester le Formulaire

1. Lancez votre application : `npm run dev`
2. Allez sur la page Contact
3. Remplissez le formulaire
4. Cliquez sur "Envoyer le message"
5. Vérifiez votre boîte email !

## 🔧 Template Variables Utilisées

Le formulaire envoie les variables suivantes à EmailJS :

| Variable | Description |
|----------|-------------|
| `from_name` | Nom du visiteur |
| `from_email` | Email du visiteur |
| `phone` | Téléphone (optionnel) |
| `subject` | Sujet du message |
| `message` | Message complet |

Assurez-vous d'utiliser ces **mêmes noms de variables** dans votre template EmailJS.

## ⚠️ Limites du Plan Gratuit

- **200 emails/mois** gratuits
- Au-delà : $7/mois pour 1000 emails

## 🔒 Sécurité

- La **Public Key** peut être exposée dans le code frontend (c'est normal)
- Ne partagez jamais votre **Private Key**
- EmailJS gère l'authentification côté serveur

## 🆘 Dépannage

### Le formulaire ne fonctionne pas

1. Vérifiez que les 3 variables d'environnement sont bien configurées dans `.env`
2. Redémarrez le serveur de développement après avoir modifié `.env`
3. Vérifiez la console du navigateur pour les erreurs
4. Vérifiez que le Service ID, Template ID et Public Key sont corrects

### Je ne reçois pas les emails

1. Vérifiez vos **spams/courrier indésirable**
2. Vérifiez que l'email de destination est correct dans le template EmailJS
3. Vérifiez le dashboard EmailJS pour voir si l'email a été envoyé
4. Si vous utilisez Gmail, vérifiez que l'accès aux applications moins sécurisées est activé

### Erreur "EmailJS not configured"

Cela signifie que les variables d'environnement ne sont pas définies. Vérifiez votre fichier `.env`.

## 📚 Documentation Officielle

Pour plus d'informations : [https://www.emailjs.com/docs/](https://www.emailjs.com/docs/)
