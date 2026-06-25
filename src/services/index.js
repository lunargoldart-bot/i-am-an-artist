export { default as firebaseService } from '../lib/firebase.js';
export { default as authService } from './auth.js';

export * as ArtworkService from './ArtworkService.js';
export * as ArtistService from './ArtistService.js';
export * as ArtistRegistryService from './ArtistRegistryService.js';
export * as OrderService from './OrderService.js';
export * as BidService from './BidService.js';
export * as ExhibitionService from './ExhibitionService.js';
export * as MessageService from './MessageService.js';
export * as WishlistService from './WishlistService.js';
export * as UserVerificationService from './UserVerificationService.js';
export * as CollaborationService from './CollaborationService.js';
export * as CollaborationRequestService from './CollaborationRequestService.js';
export * as SponsoredAdService from './SponsoredAdService.js';
export * as CourierService from './CourierService.js';
export * as CourierPayoutService from './CourierPayoutService.js';
export * as CourierReviewService from './CourierReviewService.js';
export * as DeliveryUpdateService from './DeliveryUpdateService.js';
export * as NewsFeedService from './NewsFeedService.js';
export * as NewsPostService from './NewsPostService.js';
export * as GrievanceService from './GrievanceService.js';
export * as BadgeService from './BadgeService.js';
export * as TutorialService from './TutorialService.js';
export * as UserProgressService from './UserProgressService.js';
export * as FeatureQueueService from './FeatureQueueService.js';
export * as PaymentEscrowService from './PaymentEscrowService.js';
export * as PlatformRevenueService from './PlatformRevenueService.js';
export * as ReferralRewardService from './ReferralRewardService.js';
export * as ArtworkReviewService from './ArtworkReviewService.js';
export * as UserService from './UserService.js';
export * as BuyerPreferenceService from './BuyerPreferenceService.js';

const base44 = {
  auth: {
    me: () => firebaseService.auth.getCurrentUser(),
    isAuthenticated: () => firebaseService.auth.isAuthenticated(),
    logout: () => firebaseService.auth.logout(),
    redirectToLogin: (returnUrl) => firebaseService.auth.redirectToLogin(returnUrl),
    updateMe: (data) => firebaseService.auth.updateUserProfile(data),
  },
  entities: {
    Artwork: { list: ArtworkService.list, filter: ArtworkService.filter, get: ArtworkService.get, create: ArtworkService.create, update: ArtworkService.update, delete: ArtworkService.del, subscribe: ArtworkService.subscribe },
    Artist: { list: ArtistService.list, filter: ArtistService.filter, get: ArtistService.get, create: ArtistService.create, update: ArtistService.update, delete: ArtistService.del },
    ArtistRegistry: { list: ArtistRegistryService.list, filter: ArtistRegistryService.filter, get: ArtistRegistryService.get, create: ArtistRegistryService.create, update: ArtistRegistryService.update, delete: ArtistRegistryService.del },
    Order: { list: OrderService.list, filter: OrderService.filter, get: OrderService.get, create: OrderService.create, update: OrderService.update, delete: OrderService.del, subscribe: OrderService.subscribe },
    Bid: { list: BidService.list, filter: BidService.filter, get: BidService.get, create: BidService.create, update: BidService.update, delete: BidService.del, subscribe: BidService.subscribe },
    Exhibition: { list: ExhibitionService.list, filter: ExhibitionService.filter, get: ExhibitionService.get, create: ExhibitionService.create, update: ExhibitionService.update, delete: ExhibitionService.del },
    Message: { list: MessageService.list, filter: MessageService.filter, get: MessageService.get, create: MessageService.create, update: MessageService.update, delete: MessageService.del, subscribe: MessageService.subscribe },
    Wishlist: { list: WishlistService.list, filter: WishlistService.filter, get: WishlistService.get, create: WishlistService.create, update: WishlistService.update, delete: WishlistService.del },
    UserVerification: { list: UserVerificationService.list, filter: UserVerificationService.filter, get: UserVerificationService.get, create: UserVerificationService.create, update: UserVerificationService.update, delete: UserVerificationService.del },
    Collaboration: { list: CollaborationService.list, filter: CollaborationService.filter, get: CollaborationService.get, create: CollaborationService.create, update: CollaborationService.update, delete: CollaborationService.del },
    CollaborationRequest: { list: CollaborationRequestService.list, filter: CollaborationRequestService.filter, get: CollaborationRequestService.get, create: CollaborationRequestService.create, update: CollaborationRequestService.update, delete: CollaborationRequestService.del },
    SponsoredAd: { list: SponsoredAdService.list, filter: SponsoredAdService.filter, get: SponsoredAdService.get, create: SponsoredAdService.create, update: SponsoredAdService.update, delete: SponsoredAdService.del },
    Courier: { list: CourierService.list, filter: CourierService.filter, get: CourierService.get, create: CourierService.create, update: CourierService.update, delete: CourierService.del },
    CourierPayout: { list: CourierPayoutService.list, filter: CourierPayoutService.filter, get: CourierPayoutService.get, create: CourierPayoutService.create, update: CourierPayoutService.update, delete: CourierPayoutService.del, subscribe: CourierPayoutService.subscribe },
    CourierReview: { list: CourierReviewService.list, filter: CourierReviewService.filter, get: CourierReviewService.get, create: CourierReviewService.create, update: CourierReviewService.update, delete: CourierReviewService.del },
    DeliveryUpdate: { list: DeliveryUpdateService.list, filter: DeliveryUpdateService.filter, get: DeliveryUpdateService.get, create: DeliveryUpdateService.create, update: DeliveryUpdateService.update, delete: DeliveryUpdateService.del, subscribe: DeliveryUpdateService.subscribe },
    NewsFeed: { list: NewsFeedService.list, get: NewsFeedService.get, create: NewsFeedService.create, update: NewsFeedService.update, delete: NewsFeedService.del },
    NewsPost: { list: NewsPostService.list, get: NewsPostService.get, create: NewsPostService.create, update: NewsPostService.update, delete: NewsPostService.del },
    Grievance: { list: GrievanceService.list, filter: GrievanceService.filter, get: GrievanceService.get, create: GrievanceService.create, update: GrievanceService.update, delete: GrievanceService.del },
    Badge: { list: BadgeService.list, get: BadgeService.get, create: BadgeService.create, update: BadgeService.update, delete: BadgeService.del },
    Tutorial: { list: TutorialService.list, get: TutorialService.get, create: TutorialService.create, update: TutorialService.update, delete: TutorialService.del },
    UserProgress: { list: UserProgressService.list, filter: UserProgressService.filter, get: UserProgressService.get, create: UserProgressService.create, update: UserProgressService.update, delete: UserProgressService.del },
    FeatureQueue: { list: FeatureQueueService.list, filter: FeatureQueueService.filter, get: FeatureQueueService.get, create: FeatureQueueService.create, update: FeatureQueueService.update, delete: FeatureQueueService.del },
    PaymentEscrow: { list: PaymentEscrowService.list, filter: PaymentEscrowService.filter, get: PaymentEscrowService.get, create: PaymentEscrowService.create, update: PaymentEscrowService.update, delete: PaymentEscrowService.del, subscribe: PaymentEscrowService.subscribe },
    PlatformRevenue: { list: PlatformRevenueService.list, filter: PlatformRevenueService.filter, get: PlatformRevenueService.get, create: PlatformRevenueService.create, update: PlatformRevenueService.update, delete: PlatformRevenueService.del },
    ReferralReward: { list: ReferralRewardService.list, filter: ReferralRewardService.filter, get: ReferralRewardService.get, create: ReferralRewardService.create, update: ReferralRewardService.update, delete: ReferralRewardService.del },
    ArtworkReview: { list: ArtworkReviewService.list, filter: ArtworkReviewService.filter, get: ArtworkReviewService.get, create: ArtworkReviewService.create, update: ArtworkReviewService.update, delete: ArtworkReviewService.del },
    User: { list: UserService.list, filter: UserService.filter, get: UserService.get, create: UserService.create, update: UserService.update, delete: UserService.del },
    BuyerPreference: { list: BuyerPreferenceService.list, filter: BuyerPreferenceService.filter, get: BuyerPreferenceService.get, create: BuyerPreferenceService.create, update: BuyerPreferenceService.update, delete: BuyerPreferenceService.del },
  },
  functions: {
    invoke: (name, params) => {
      console.warn('Function invocation should be handled through dedicated function services');
      return Promise.reject(new Error('Function invocation not implemented'));
    },
  },
  integrations: {
    Core: {
      UploadFile: (options) => firebaseService.storage.uploadFile(options.file, options.path),
      SendEmail: (options) => {
        console.warn('Email sending should be implemented through dedicated services');
        return Promise.reject(new Error('Email sending not implemented'));
      },
      InvokeLLM: (options) => {
        console.warn('AI/LLM integration should be implemented through dedicated services');
        return Promise.reject(new Error('AI/LLM integration not implemented'));
      },
    },
  },
  asServiceRole: {
    entities: {},
    integrations: {},
  },
};

export default base44;