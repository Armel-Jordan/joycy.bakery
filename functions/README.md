# Firebase Cloud Functions

This directory contains Firebase Cloud Functions for the bakery website.

## Functions

### `sendContactEmail`

Sends an email when a user submits the contact form.

**Trigger:** HTTPS Callable Function  
**Parameters:**
- `name` (string): Sender's name
- `email` (string): Sender's email
- `phone` (string, optional): Sender's phone
- `subject` (string): Email subject
- `message` (string): Email message

**Configuration Required:**
```bash
firebase functions:config:set email.user="your-email@gmail.com"
firebase functions:config:set email.pass="your-app-password"
firebase functions:config:set email.recipient="recipient@gmail.com"
```

## Development

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Deploy to Firebase
npm run deploy

# View logs
npm run logs
```

## Local Testing

```bash
# Start Firebase emulators
firebase emulators:start
```

See `EMAIL_SETUP.md` in the root directory for complete setup instructions.
