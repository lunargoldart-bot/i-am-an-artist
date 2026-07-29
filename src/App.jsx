import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
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
import { ProtectedRoute, AdminRoute } from './components/auth/RouteGuards';

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
        </Route>
        <Route path="*" element={<PageNotFound />} />
      </Route>
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
