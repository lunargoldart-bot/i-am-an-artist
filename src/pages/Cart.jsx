import { Link } from 'react-router-dom';
import { ShoppingBag, Trash2, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StickyActionBar from '@/components/ui/StickyActionBar';
import { useCart } from '@/lib/CartContext';
import { hapticLight } from '@/utils/native';

export default function Cart() {
  const { items, removeItem, total, count } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20 text-center">
        <ShoppingBag className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
        <h2 className="font-display text-2xl font-bold mb-2">Your cart is empty</h2>
        <p className="text-muted-foreground font-body mb-6">Browse the marketplace and add artwork you love.</p>
        <Link to="/explore">
          <Button className="rounded-full">Explore Artwork</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <Link to="/explore" className="inline-flex items-center gap-2 text-base text-muted-foreground hover:text-foreground mb-6 font-body">
        <ArrowLeft className="w-5 h-5" /> Continue Browsing
      </Link>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold">Shopping Cart</h1>
          <p className="text-muted-foreground font-body mt-1">{count} {count === 1 ? 'item' : 'items'}</p>
        </div>
      </div>

      <div className="space-y-4 mb-8">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card">
            <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
              <img src={item.image} alt={item.title} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
            </div>
            <div className="flex-1 min-w-0">
              <Link to={`/artwork/${item.id}`} className="font-display font-semibold hover:text-primary transition-colors truncate block">{item.title}</Link>
              <p className="text-sm text-muted-foreground font-body">{item.artist_name}</p>
              <p className="font-display font-bold text-primary mt-1">ZMW {(item.price || 0).toLocaleString()}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => { hapticLight(); removeItem(item.id); }} className="text-muted-foreground hover:text-destructive flex-shrink-0">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>

      {/* Mobile + desktop sticky checkout bar */}
      <StickyActionBar>
        <div className="max-w-4xl mx-auto p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="font-display text-lg font-bold">Total</span>
            <span className="font-display text-xl font-bold text-primary">ZMW {total.toLocaleString()}</span>
          </div>
          <Link to="/checkout">
            <Button size="lg" className="w-full rounded-full text-base gap-3">
              Proceed to Checkout <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </StickyActionBar>
    </div>
  );
}
