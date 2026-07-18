# I Am An Artist

Firebase-backed marketplace and community platform for artists, buyers, exhibitions, auctions, collaborations, messaging, payments, verification, and administration.

## Stack

- React 18 + Vite (hosted on Vercel)
- Firebase Authentication
- Cloud Firestore
- Firebase Storage
- Firebase Cloud Functions (Node.js 22)
- OpenAI, SendGrid, and Lipila integrations through Cloud Functions

The frontend no longer requires the original hosted backend SDK. Authentication, data access, uploads, realtime listeners, and callable operations now use Firebase.

## Local setup

1. Install frontend and Function dependencies:

   ```bash
   npm install
   npm --prefix functions install
   ```

2. Create a Firebase project and enable Email/Password and Google Authentication, Firestore, Storage, Cloud Functions, and Hosting.

3. Copy `.env.example` to `.env` and add the Firebase web-app configuration.

4. Copy `.firebaserc.example` to `.firebaserc` and replace the project ID.

5. Configure backend environment variables from `functions/.env.example`. Do not commit real credentials. A project-specific file such as `functions/.env.<project-id>` can be used for deployment.

6. Start the frontend:

   ```bash
   npm run dev
   ```

Optional local Firebase emulators can be enabled with `VITE_USE_FIREBASE_EMULATORS=true` after starting the emulator suite.

## Validation

```bash
npm run lint
npm run typecheck
npm run build
node --check functions/index.js
```

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for Firebase setup, secret configuration, admin bootstrap, deployment order, callbacks, import guidance, and post-deployment checks.

See [MIGRATION_STATUS.md](MIGRATION_STATUS.md) for completed migration work and external items that still require account access.

## Important production controls

- Paid memberships, escrow, bids, orders, sponsored advertisements, verification, and revenue operations are server-authoritative.
- Payment state is activated only after verified backend callbacks.
- Private verification files and user uploads use owner-scoped Storage paths.
- Deploy Firestore and Storage rules before allowing users into the application.
- Enable Firebase App Check and add rate limiting before public launch.
