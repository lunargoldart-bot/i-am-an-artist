# Phase 1: Codebase Audit

## Total base44.* References
- **src directory:** 182+ references across JSX files
- **base44/functions directory:** 174+ references across Deno functions
- **Total:** ~356 references

---

## Auth Patterns (55 occurrences)

### base44.auth.me() — 25+ occurrences in src, 16 in functions
Files using `auth.me()`:
- `src/lib/AuthContext.jsx`
- `src/lib/PageNotFound.jsx`
- `src/pages/Profile.jsx`, `Dashboard.jsx`, `Orders.jsx`, `SellArt.jsx`, `Messages.jsx`, `Wishlist.jsx`, `ArtistVerifications.jsx`
- `src/components/` — InventoryManager, EliteFeatureQueue, VerificationStatus, ArtistVerificationForm, RewardsDashboard, CollaborationManager, CollaborationRequestForm, ManageAds, ConversationThread, QuickContactCard, NegotiationPanel, BidModal, BuyArtworkModal, WalletButton
- `base44/functions/` — 16 functions

### base44.auth.isAuthenticated() — 8 occurrences
- `src/pages/Dashboard.jsx`, `Orders.jsx`, `ArtworkDetail.jsx` (×2), `ArtistVerifications.jsx`
- `src/components/` — InventoryManager, RewardsDashboard, CollaborationManager, ConversationThread, QuickContactCard, NegotiationPanel, ExhibitionCurator

### base44.auth.redirectToLogin() — 6 occurrences
- `src/lib/AuthContext.jsx`
- `src/pages/Dashboard.jsx`, `Wishlist.jsx`
- `src/components/layout/Navbar.jsx` (×2)
- `src/components/artwork/WishlistButton.jsx`
- `src/components/modals/BidModal.jsx`
- `src/components/modals/BuyArtworkModal.jsx`

### base44.auth.logout() — 4 occurrences
- `src/lib/AuthContext.jsx` (×2)
- `src/components/layout/Navbar.jsx` (×2)

### base44.auth.updateMe() — 3 occurrences
- `src/pages/Profile.jsx`, `ArtistVerifications.jsx`
- `src/components/verification/ArtistVerificationForm.jsx`
- `src/components/monetization/ProfileMonetization.jsx`
- `base44/functions/submitVerification/entry.ts`

---

## Database Entity Usage (28 entities)

### Entities used in src (frontend):
| Entity | Files Using It |
|---|---|
| Artwork | Explore, Gallery, Rankings, ArtistProfile, SellArt, Profile, ArtworkDetail, Inventory, ExhibitionCurator, EliteFeatureQueue, VirtualGalleryViewer, WishlistButton, ManageArtworks, DashboardOverview, ManageAds |
| Order | Orders, ArtworkDetail, BuyArtworkModal, ManageOrders, DashboardOverview, MyOrders |
| Message | Messages, ConversationThread, MessageThread, QuickContactCard |
| Bid | BidHistory, PlaceBidDialog, BidModal |
| Exhibition | Exhibitions, MyExhibitions, ExhibitionCurator, ManageExhibitions, VirtualGalleryViewer |
| UserVerification | VerifyUsers, ArtistVerifications, VerificationStatus, VerificationForm |
| User / Artist | Rankings, Artists, ArtistProfile |
| FeatureQueue | EliteFeatureQueue |
| SponsoredAd | ManageAds, SponsoredAdBanner, LipilaPaymentModal |
| Wishlist | Wishlist, WishlistButton |
| UserProgress | RewardsDashboard |
| Badge | RewardsDashboard |
| Tutorial | RewardsDashboard |
| CollaborationRequest | CollaborationManager, CollaborationRequestForm |
| Collaboration | CollaborationManager |
| CourierPayout | CourierPayoutDashboard |
| CourierReview | CourierRatingModal |
| DeliveryUpdate | OrderTrackingTimeline |
| PlatformRevenue | MonetizationDashboard, ProfileMonetization |
| NewsFeed | NewsFeed, ManageNews |
| NewsPost | News |
| ArtistRegistry | ArtistRegistry |
| Grievance | GrievanceSubmitForm |
| BuyerPreference | (used only in functions) |
| PaymentEscrow | (used only in functions) |
| Courier | (used only in functions) |
| ReferralReward | (not referenced yet) |

---

## Backend Functions (27)

| Function | Type | Auth |
|---|---|---|
| applyCommissionCashback | Service | Service Role |
| approveVerification | User | Admin |
| autoReleasePayments | Cron | Service Role |
| calculateCourierBonuses | Service | Service Role |
| confirmDelivery | User | Authenticated |
| escrowCallback | Webhook | Service Role |
| handleCollaborationRequest | User | Authenticated |
| handleGrievance | User | Authenticated |
| initiateEscrowPayment | User | Authenticated |
| lipila_callback | Webhook | Service Role |
| lipila_initiate | User | Authenticated |
| markMessagesRead | User | Authenticated |
| matchBuyerPreferences | Cron | Service Role |
| placeBid | User | Authenticated |
| processCourierPayout | Service | Service Role |
| processMonthlyCommissionCashback | Cron | Service Role |
| processReviews | Service | Service Role |
| recordRevenue | User | Admin |
| releasePayment | User/Service | Both |
| sendArtistRegistryReport | User | Admin |
| sendMessage | User | Authenticated |
| shareArtistInfo | User | Authenticated |
| submitVerification | User | Authenticated |
| suggestArtworkPrice | Service | Service Role |
| trackBuyerInterest | User | Authenticated |
| trackUserProgress | User | Authenticated |
| updateOrderStatus | Service | Service Role |

---

## File Upload Instances (6)
1. `src/pages/SellArt.jsx` — artwork image
2. `src/components/verification/VerificationForm.jsx` — NRC/selfie images
3. `src/components/verification/ArtistVerificationForm.jsx` — NRC/selfie images
4. `src/components/dashboard/ManageArtworks.jsx` — artwork image
5. `src/components/dashboard/ManageExhibitions.jsx` — exhibition image
6. `src/components/dashboard/ManageNews.jsx` — news image

---

## Realtime Subscriptions (5)
1. `src/pages/Messages.jsx` — `base44.entities.Message.subscribe()`
2. `src/components/messaging/ConversationThread.jsx` — `base44.entities.Message.subscribe()`
3. `src/components/messaging/MessageThread.jsx` — `base44.entities.Message.subscribe()`
4. `src/components/tracking/OrderTrackingTimeline.jsx` — `base44.entities.DeliveryUpdate.subscribe()`
5. `src/components/auction/BidHistory.jsx` — `base44.entities.Bid.subscribe()`

---

## Key Files to Create/Modify

### New files:
- `src/lib/firebase.js` — Firebase app initialization
- `src/lib/firestore.js` — Firestore CRUD utilities
- `src/lib/storage.js` — Firebase Storage utilities
- `src/lib/functions.js` — Firebase Cloud Functions client
- `.env` — Firebase config variables

### Files to delete:
- `src/api/base44Client.js`
- `base44/` directory (after migration)

### Files to modify:
- `src/lib/AuthContext.jsx` — Replace base44 auth with Firebase Auth
- `src/lib/app-params.js` — Remove base44-specific logic
- `vite.config.js` — Remove @base44/vite-plugin
- `package.json` — Remove @base44 dependencies
- All pages, components with base44 references
