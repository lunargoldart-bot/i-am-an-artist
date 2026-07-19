# I Am An Artist — Firebase Migration Master Plan

## Project Info
- **App:** I Am An Artist (Art Marketplace & Live Gallery)
- **Live URL:** https://zamba-art-vault.base44.app
- **GitHub:** https://github.com/lunargoldart-bot/i-am-an-artist
- **Stack:** React + Vite + Tailwind + shadcn/ui
- **Migration:** Base44 → Firebase

---

## Migration Phases

| Phase | File | Task | Priority |
|---|---|---|---|
| 0 | `00_MASTER_PLAN.md` | This file — overview | — |
| 1 | `01_AUDIT.md` | Analyse & audit full codebase | 🔴 First |
| 2 | `02_FIREBASE_SETUP.md` | Firebase init, env, package updates | 🔴 Second |
| 3 | `03_AUTH_MIGRATION.md` | Replace Base44 auth with Firebase Auth | 🔴 Third |
| 4 | `04_SERVICES.md` | Create Firestore service files per entity | 🔴 Fourth |
| 5 | `05_PAGES_MIGRATION.md` | Migrate all pages | 🔴 Fifth |
| 6 | `06_COMPONENTS_MIGRATION.md` | Migrate all components | 🔴 Sixth |
| 7 | `07_FUNCTIONS_MIGRATION.md` | Migrate all backend functions | 🔴 Seventh |
| 8 | `08_STORAGE_MIGRATION.md` | Replace Base44 file uploads with Firebase Storage | 🔴 Eighth |
| 9 | `09_REALTIME_MIGRATION.md` | Replace Base44 subscriptions with Firestore realtime | 🔴 Ninth |
| 10 | `10_FINAL_AUDIT.md` | Final sweep & cleanup | 🔴 Last |

---

## Scale of Work

| Category | Count |
|---|---|
| Database entities | 28 |
| Backend functions | 27 |
| Pages to migrate | 24 |
| Components to migrate | ~45 |
| File upload instances | 6 |
| Realtime subscriptions | 5 |
| auth.me() calls | 25+ |
| Total base44.* references | 150+ |

---

## Key Replacements

| Base44 API | Firebase API |
|---|---|
| `base44.auth.me()` | `auth.currentUser` + Firestore users doc |
| `base44.auth.isAuthenticated()` | `auth.currentUser !== null` |
| `base44.auth.redirectToLogin()` | `navigate('/login')` or signInWithRedirect |
| `base44.auth.logout()` | `signOut(auth)` |
| `base44.auth.updateMe()` | `updateProfile()` + Firestore doc update |
| `base44.entities.X.list()` | `getDocs(collection(db, 'X'))` |
| `base44.entities.X.filter()` | `getDocs(query(collection, where(...)))` |
| `base44.entities.X.get()` | `getDoc(doc(db, 'X', id))` |
| `base44.entities.X.create()` | `addDoc(collection(db, 'X'))` / `setDoc(doc(...))` |
| `base44.entities.X.update()` | `updateDoc(doc(db, 'X', id))` |
| `base44.entities.X.delete()` | `deleteDoc(doc(db, 'X', id))` |
| `base44.entities.X.subscribe()` | `onSnapshot(collection(db, 'X'), ...)` |
| `base44.functions.invoke()` | `httpsCallable(functions, 'name')()` |
| `base44.integrations.Core.UploadFile()` | `uploadBytes(storageRef, file)` + `getDownloadURL()` |
| `base44.integrations.Core.SendEmail()` | Firebase Extensions / Email API |
| `base44.integrations.Core.InvokeLLM()` | Direct OpenAI/Anthropic API call |
| `base44.asServiceRole.*` | Firebase Admin SDK (Cloud Functions) |

---

## Rules For All Phases
- NEVER break existing UI — keep all components, pages, routes as-is
- Keep Tailwind, Radix UI, shadcn untouched
- After each file migrated, confirm before moving on
- One phase at a time — do not start next phase until current is complete
