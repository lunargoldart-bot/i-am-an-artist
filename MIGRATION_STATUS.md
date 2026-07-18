# Firebase Migration Status

Updated: 17 July 2026

## Completed in this repository

- Firebase Authentication replaces the previous authentication layer.
- Firestore service modules cover the application entities and realtime listeners.
- Firebase Storage handles artwork, profile, exhibition, verification, and related uploads.
- Firebase Cloud Functions implement callable, webhook, scheduled, payment, auction, messaging, verification, collaboration, escrow, order, advertising, rewards, and reporting operations.
- Firestore rules, Storage rules, indexes, Hosting configuration, emulator configuration, and environment templates are included.
- User and administrator route guards are present.
- Orders, bids, escrow values, paid memberships, sponsored advertisements, verification decisions, and revenue mutations are server-authoritative.
- Social and payment credentials are kept out of public profile documents.
- Messaging, orders, collaborations, exhibitions, delivery updates, and courier payouts use queries aligned with security rules.
- Source imports and runtime dependencies no longer reference the original hosted SDK.

## Validation completed

- `npm run lint` — passed
- `npm run typecheck` — passed
- `npm run build` — passed
- `node --check functions/index.js` — passed
- Cloud Function module import — passed with 33 exports

The production bundle currently reports a Vite chunk-size warning. It does not prevent a successful build, but route-level code splitting is recommended later.

## Requires external account access

The repository is code-complete for Firebase configuration, but these actions cannot be completed from the source archive alone:

- Create or select the real Firebase project and add its web configuration.
- Enable Authentication providers, Firestore, Storage, Functions, Hosting, and billing required by Cloud Functions.
- Configure OpenAI, SendGrid, Lipila, callback URLs, webhook secrets, and administrator email settings.
- Deploy rules, indexes, Functions, and Hosting to the real Firebase project.
- Create the first administrator profile securely in Firestore.
- Export production records and files from the original platform and import them into Firestore and Storage.
- Verify payment and webhook behavior using provider sandbox accounts.
- Configure Firebase App Check, monitoring, budget alerts, backups, and rate limits.

## Data migration limitation

No original production database export or file export was supplied. Therefore this delivery migrates the application code and backend architecture, but it does not contain the original users, artworks, orders, messages, images, or payment history. Use a controlled export/import process before switching production traffic.

## Rules validation limitation

Frontend builds and Function syntax/import checks passed. A local Firebase rules/emulator run could not finish because the environment was unable to download the Firestore emulator binary. Deploy first to a non-production Firebase project and run the emulator/rules test suite before production release.
