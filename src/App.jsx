import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import MaintenanceProvider from '@/lib/MaintenanceProvider'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { CartProvider } from '@/lib/CartContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import AppLayout from './components/layout/AppLayout';
import LandingPage from './landing/LandingPage';
import Explore from './pages/Explore';
import ArtworkDetail from './pages/ArtworkDetail';
import Rankings from './pages/Rankings';
import Exhibitions from './pages/Exhibitions';
import NewsFeed from './pages/NewsFeed';
import SellArt from './pages/SellArt';
import Orders from './pages/Orders';
import Profile from './pages/Profile';
import ArtistProfile from './pages/ArtistProfile';
import Wishlist from './pages/Wishlist';
import Messages from './pages/Messages';
import VerifyUsers from './pages/VerifyUsers';
import ArtistVerifications from './pages/ArtistVerifications';
import ArtistRegistry from './pages/ArtistRegistry';
import Rewards from './pages/Rewards';
import Monetization from './pages/Monetization';
import Inventory from './pages/Inventory';
import VirtualGallery from './pages/VirtualGallery';
import MyExhibitions from './pages/MyExhibitions';
import Login from './pages/Login';
import Artists from './pages/Artists';
import Gallery from './pages/Gallery';
import Dashboard from './pages/Dashboard';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import OrderFailure from './pages/OrderFailure';
import { ProtectedRoute, AdminRoute } from './components/auth/RouteGuards';

// Admin Dashboard
import AdminLayout from './components/admin/layout/AdminLayout';
import AdminHome from './components/admin/home/AdminHome';
import UsersPage from './components/admin/users/UsersPage';
import ArtistsPage from './components/admin/artists/ArtistsPage';
import CollectorsPage from './components/admin/collectors/CollectorsPage';
import AdminsPage from './components/admin/admins/AdminsPage';
import ArtworkPage from './components/admin/artwork/ArtworkPage';
import CollectionsPage from './components/admin/collections/CollectionsPage';
import CategoriesPage from './components/admin/categories/CategoriesPage';
import AuctionsPage from './components/admin/auctions/AuctionsPage';
import OrdersPage from './components/admin/orders/OrdersPage';
import PaymentsPage from './components/admin/payments/PaymentsPage';
import SubscriptionsPage from './components/admin/subscriptions/SubscriptionsPage';
import MessagesPage from './components/admin/messages/MessagesPage';
import ReviewsPage from './components/admin/reviews/ReviewsPage';
import ModerationPage from './components/admin/moderation/ModerationPage';
import SupportPage from './components/admin/support/SupportPage';
import AnalyticsPage from './components/admin/analytics/AnalyticsPage';
import ReportsPage from './components/admin/reports/ReportsPage';
import MarketingPage from './components/admin/marketing/MarketingPage';
import NotificationsPage from './components/admin/notifications/NotificationsPage';
import SystemPage from './components/admin/system/SystemPage';
import SettingsPage from './components/admin/settings/SettingsPage';
import AuditLogsPage from './components/admin/audit/AuditLogsPage';
import ApiPage from './components/admin/api/ApiPage';
import SecurityPage from './components/admin/security/SecurityPage';
import BackupsPage from './components/admin/backups/BackupsPage';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route element={<AppLayout />}>
        <Route path="/explore" element={<Explore />} />
        <Route path="/marketplace" element={<Explore />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/artists" element={<Artists />} />
        <Route path="/artwork/:id" element={<ArtworkDetail />} />
        <Route path="/rankings" element={<Rankings />} />
        <Route path="/exhibitions" element={<Exhibitions />} />
        <Route path="/news" element={<NewsFeed />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order/success" element={<OrderSuccess />} />
        <Route path="/order/failure" element={<OrderFailure />} />
        <Route path="/artist/:id" element={<ArtistProfile />} />
        <Route path="/gallery/:exhibitionId" element={<VirtualGallery />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/sell" element={<SellArt />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/messages" element={<Messages />} />
            <Route path="/rewards" element={<Rewards />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/exhibitions/my-exhibitions" element={<MyExhibitions />} />
        </Route>
        <Route element={<AdminRoute />}>
          <Route path="/admin/verify-users" element={<VerifyUsers />} />
          <Route path="/admin/artist-verifications" element={<ArtistVerifications />} />
          <Route path="/admin/artist-registry" element={<ArtistRegistry />} />
          <Route path="/admin/monetization" element={<Monetization />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminHome />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="artists" element={<ArtistsPage />} />
            <Route path="collectors" element={<CollectorsPage />} />
            <Route path="admins" element={<AdminsPage />} />
            <Route path="artwork" element={<ArtworkPage />} />
            <Route path="collections" element={<CollectionsPage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="auctions" element={<AuctionsPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="payments" element={<PaymentsPage />} />
            <Route path="subscriptions" element={<SubscriptionsPage />} />
            <Route path="messages" element={<MessagesPage />} />
            <Route path="reviews" element={<ReviewsPage />} />
            <Route path="moderation" element={<ModerationPage />} />
            <Route path="support" element={<SupportPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="marketing" element={<MarketingPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="system" element={<SystemPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="audit-logs" element={<AuditLogsPage />} />
            <Route path="api" element={<ApiPage />} />
            <Route path="security" element={<SecurityPage />} />
            <Route path="backups" element={<BackupsPage />} />
          </Route>
        </Route>
        <Route path="*" element={<PageNotFound />} />
      </Route>
    </Routes>
  );
};


function App() {

  return (
    <MaintenanceProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClientInstance}>
          <CartProvider>
            <Router>
              <AuthenticatedApp />
            </Router>
            <Toaster />
          </CartProvider>
        </QueryClientProvider>
      </AuthProvider>
    </MaintenanceProvider>
  )
}

export default App
