import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Truck, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function MyOrders({ user }) {
  const [purchases, setPurchases] = useState([]);
  const [sales, setSales] = useState([]);

  useEffect(() => {
    if (!user) return;
    base44.entities.Order.filter({ buyer_email: user.email }).then(setPurchases).catch(() => {});
    base44.entities.Order.filter({ seller_email: user.email }).then(setSales).catch(() => {});
  }, [user]);

  const markDelivered = async (order) => {
    await base44.entities.Order.update(order.id, { delivery_status: 'delivered', payment_status: 'released' });
    toast.success('Order marked as delivered! Payment released to seller.');
    base44.entities.Order.filter({ buyer_email: user.email }).then(setPurchases);
  };

  const statusColor = { pending: 'text-amber-400', courier_contacted: 'text-blue-400', in_transit: 'text-purple-400', delivered: 'text-green-400', cancelled: 'text-destructive' };

  const OrderRow = ({ order, isSeller }) => (
    <div className="bg-card border border-border rounded-lg p-4 flex items-center gap-3">
      <img src={order.artwork_image || 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=60&h=60&fit=crop'} alt={order.artwork_title} className="w-14 h-14 rounded-md object-cover shrink-0" />
      <div className="flex-1 min-w-0">
        <h4 className="font-playfair font-semibold text-foreground text-sm">{order.artwork_title}</h4>
        <p className="text-xs text-muted-foreground">{isSeller ? `Buyer: ${order.buyer_name}` : `Seller: ${order.seller_name}`}</p>
        <p className="text-xs text-muted-foreground">{order.delivery_option?.replace('_', ' ')}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-gold font-bold text-sm">ZMW {order.amount_zmw?.toLocaleString()}</p>
        <p className={`text-xs font-semibold ${statusColor[order.delivery_status] || 'text-muted-foreground'}`}>
          {order.delivery_status?.replace('_', ' ')}
        </p>
        {!isSeller && order.delivery_status === 'in_transit' && (
          <Button size="sm" className="text-xs mt-1 gold-gradient text-background" onClick={() => markDelivered(order)}>
            <CheckCircle className="w-3 h-3 mr-0.5" /> Confirm Delivery
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* My Purchases */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <ShoppingBag className="w-5 h-5 text-gold" />
          <h2 className="font-playfair font-bold text-xl text-foreground">My Purchases</h2>
        </div>
        {purchases.length === 0 ? (
          <p className="text-muted-foreground text-sm">No purchases yet</p>
        ) : (
          <div className="space-y-3">
            {purchases.map(order => <OrderRow key={order.id} order={order} isSeller={false} />)}
          </div>
        )}
      </div>

      {/* My Sales */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Truck className="w-5 h-5 text-gold" />
          <h2 className="font-playfair font-bold text-xl text-foreground">My Sales</h2>
        </div>
        {sales.length === 0 ? (
          <p className="text-muted-foreground text-sm">No sales yet — list your artworks to start selling</p>
        ) : (
          <div className="space-y-3">
            {sales.map(order => <OrderRow key={order.id} order={order} isSeller={true} />)}
          </div>
        )}
      </div>
    </div>
  );
}