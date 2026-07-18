import { useEffect, useState } from 'react';
import { firebaseClient } from '@/api/firebaseClient';
import { TrendingUp, ShoppingBag, Eye, Star, DollarSign, Package } from 'lucide-react';

export default function DashboardOverview({ user }) {
  const [artworks, setArtworks] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (!user) return;
    firebaseClient.entities.Artwork.filter({ artist_email: user.email }).then(setArtworks).catch(() => {});
    firebaseClient.entities.Order.filter({ seller_email: user.email }).then(setOrders).catch(() => {});
  }, [user]);

  const totalEarnings = orders.filter(o => o.delivery_status === 'delivered').reduce((s, o) => s + (o.amount_zmw || 0), 0);
  const pendingOrders = orders.filter(o => o.delivery_status === 'pending').length;
  const totalViews = artworks.reduce((s, a) => s + (a.views_count || 0), 0);
  const totalLikes = artworks.reduce((s, a) => s + (a.likes_count || 0), 0);

  const stats = [
    { label: 'Total Artworks', value: artworks.length, icon: Package, color: 'text-blue-400' },
    { label: 'Total Earnings (ZMW)', value: `K${totalEarnings.toLocaleString()}`, icon: DollarSign, color: 'text-gold' },
    { label: 'Pending Orders', value: pendingOrders, icon: ShoppingBag, color: 'text-amber-400' },
    { label: 'Total Views', value: totalViews.toLocaleString(), icon: Eye, color: 'text-purple-400' },
    { label: 'Total Likes', value: totalLikes.toLocaleString(), icon: Star, color: 'text-pink-400' },
    { label: 'All Orders', value: orders.length, icon: TrendingUp, color: 'text-green-400' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon className={`w-4 h-4 ${color}`} />
              <span className="text-xs text-muted-foreground">{label}</span>
            </div>
            <p className="font-playfair font-bold text-2xl text-foreground">{value}</p>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      {orders.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="font-playfair font-semibold text-foreground mb-3">Recent Orders</h3>
          <div className="space-y-2">
            {orders.slice(0, 5).map(order => (
              <div key={order.id} className="flex items-center justify-between p-2 bg-secondary rounded-lg">
                <div>
                  <p className="text-sm font-semibold text-foreground">{order.artwork_title}</p>
                  <p className="text-xs text-muted-foreground">{order.buyer_name} · {order.delivery_option?.replace('_', ' ')}</p>
                </div>
                <div className="text-right">
                  <p className="text-gold text-sm font-bold">ZMW {order.amount_zmw?.toLocaleString()}</p>
                  <span className={`text-xs ${
                    order.delivery_status === 'delivered' ? 'text-green-400' :
                    order.delivery_status === 'in_transit' ? 'text-blue-400' : 'text-amber-400'
                  }`}>{order.delivery_status?.replace('_', ' ')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}