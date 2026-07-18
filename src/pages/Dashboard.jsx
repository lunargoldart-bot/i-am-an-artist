import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { authService } from '@/services';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutDashboard } from 'lucide-react';
import DashboardOverview from '@/components/dashboard/DashboardOverview';
import ManageArtworks from '@/components/dashboard/ManageArtworks';
import ManageExhibitions from '@/components/dashboard/ManageExhibitions';
import ManageNews from '@/components/dashboard/ManageNews';
import ArtistProfile from '@/components/dashboard/ArtistProfile';
import MyOrders from '@/components/dashboard/MyOrders';

export default function Dashboard() {
  const { user } = useOutletContext() || {};
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authService.isAuthenticated().then(async (authed) => {
      if (!authed) {
        authService.redirectToLogin('/dashboard');
        return;
      }
      const me = await authService.getCurrentUser();
      setCurrentUser(me);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-border border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="w-6 h-6 text-gold" />
            <div>
              <h1 className="font-playfair font-bold text-3xl text-foreground">Artist Dashboard</h1>
              <p className="text-muted-foreground text-sm">Welcome back, {currentUser?.full_name}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <Tabs defaultValue="overview">
          <TabsList className="bg-card border border-border mb-6 flex flex-wrap h-auto gap-1 p-1">
            {['overview', 'artworks', 'exhibitions', 'news', 'orders', 'profile'].map(tab => (
              <TabsTrigger key={tab} value={tab} className="capitalize data-[state=active]:bg-gold data-[state=active]:text-background">
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overview">
            <DashboardOverview user={currentUser} />
          </TabsContent>
          <TabsContent value="artworks">
            <ManageArtworks user={currentUser} />
          </TabsContent>
          <TabsContent value="exhibitions">
            <ManageExhibitions user={currentUser} />
          </TabsContent>
          <TabsContent value="news">
            <ManageNews user={currentUser} />
          </TabsContent>
          <TabsContent value="orders">
            <MyOrders user={currentUser} />
          </TabsContent>
          <TabsContent value="profile">
            <ArtistProfile user={currentUser} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}