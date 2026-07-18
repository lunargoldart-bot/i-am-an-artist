import { httpsCallable } from 'firebase/functions';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { auth, functions, storage } from '@/lib/firebase';
import authService from '@/services/auth';
import * as ArtworkService from '@/services/ArtworkService';
import * as ArtistService from '@/services/ArtistService';
import * as ArtistRegistryService from '@/services/ArtistRegistryService';
import * as OrderService from '@/services/OrderService';
import * as BidService from '@/services/BidService';
import * as ExhibitionService from '@/services/ExhibitionService';
import * as MessageService from '@/services/MessageService';
import * as WishlistService from '@/services/WishlistService';
import * as UserVerificationService from '@/services/UserVerificationService';
import * as CollaborationService from '@/services/CollaborationService';
import * as CollaborationRequestService from '@/services/CollaborationRequestService';
import * as SponsoredAdService from '@/services/SponsoredAdService';
import * as CourierService from '@/services/CourierService';
import * as CourierPayoutService from '@/services/CourierPayoutService';
import * as CourierReviewService from '@/services/CourierReviewService';
import * as DeliveryUpdateService from '@/services/DeliveryUpdateService';
import * as NewsFeedService from '@/services/NewsFeedService';
import * as NewsPostService from '@/services/NewsPostService';
import * as GrievanceService from '@/services/GrievanceService';
import * as BadgeService from '@/services/BadgeService';
import * as TutorialService from '@/services/TutorialService';
import * as UserProgressService from '@/services/UserProgressService';
import * as FeatureQueueService from '@/services/FeatureQueueService';
import * as PaymentEscrowService from '@/services/PaymentEscrowService';
import * as PlatformRevenueService from '@/services/PlatformRevenueService';
import * as ReferralRewardService from '@/services/ReferralRewardService';
import * as ArtworkReviewService from '@/services/ArtworkReviewService';
import * as UserService from '@/services/UserService';
import * as BuyerPreferenceService from '@/services/BuyerPreferenceService';

const entity = (service) => ({
  list: service.list,
  filter: service.filter,
  get: service.get,
  create: service.create,
  update: service.update,
  delete: service.del,
  subscribe: service.subscribe,
});

const safeFileName = (name = 'upload') => name.replace(/[^a-zA-Z0-9._-]/g, '_');

const uploadFile = async ({ file, path, folder = 'uploads' }) => {
  if (!file) throw new Error('No file selected');
  if (!auth.currentUser) throw new Error('Authentication required to upload files');
  if (file.size > 15 * 1024 * 1024) throw new Error('File exceeds the 15 MB upload limit');

  const allowedFolders = new Set(['uploads', 'verification', 'artworks']);
  const safeFolder = allowedFolders.has(folder) ? folder : 'uploads';
  const objectPath = path || `${safeFolder}/${auth.currentUser.uid}/${crypto.randomUUID()}-${safeFileName(file.name)}`;
  const objectRef = ref(storage, objectPath);
  await uploadBytes(objectRef, file, { contentType: file.type || 'application/octet-stream' });
  return { file_url: await getDownloadURL(objectRef), path: objectPath };
};

const invoke = async (name, params = {}) => {
  const callable = httpsCallable(functions, name);
  return callable(params);
};

export const firebaseClient = {
  auth: {
    me: authService.getCurrentUser,
    isAuthenticated: authService.isAuthenticated,
    logout: authService.logout,
    redirectToLogin: authService.redirectToLogin,
    updateMe: authService.updateUserProfile,
  },
  entities: {
    Artwork: entity(ArtworkService),
    Artist: entity(ArtistService),
    ArtistRegistry: entity(ArtistRegistryService),
    Order: entity(OrderService),
    Bid: entity(BidService),
    Exhibition: entity(ExhibitionService),
    Message: entity(MessageService),
    Wishlist: entity(WishlistService),
    UserVerification: entity(UserVerificationService),
    Collaboration: entity(CollaborationService),
    CollaborationRequest: entity(CollaborationRequestService),
    SponsoredAd: entity(SponsoredAdService),
    Courier: entity(CourierService),
    CourierPayout: entity(CourierPayoutService),
    CourierReview: entity(CourierReviewService),
    DeliveryUpdate: entity(DeliveryUpdateService),
    NewsFeed: entity(NewsFeedService),
    NewsPost: entity(NewsPostService),
    Grievance: entity(GrievanceService),
    Badge: entity(BadgeService),
    Tutorial: entity(TutorialService),
    UserProgress: entity(UserProgressService),
    FeatureQueue: entity(FeatureQueueService),
    PaymentEscrow: entity(PaymentEscrowService),
    PlatformRevenue: entity(PlatformRevenueService),
    ReferralReward: entity(ReferralRewardService),
    ArtworkReview: entity(ArtworkReviewService),
    User: entity(UserService),
    BuyerPreference: entity(BuyerPreferenceService),
  },
  functions: { invoke },
  integrations: {
    Core: {
      UploadFile: uploadFile,
      async SendEmail(options) {
        const response = await invoke('sendEmail', options);
        return response.data;
      },
      async InvokeLLM(options) {
        const response = await invoke('invokeLLM', options);
        return response.data?.text ?? response.data;
      },
    },
  },
};

export default firebaseClient;
