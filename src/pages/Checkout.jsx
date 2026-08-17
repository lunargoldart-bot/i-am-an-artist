import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, Shield, Truck, Loader2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import StickyActionBar from '@/components/ui/StickyActionBar';
import { useCart } from '@/lib/CartContext';
import { useAuth } from '@/lib/AuthContext';
import { functions } from '@/lib/firebase';
import { httpsCallable } from 'firebase/functions';
import { toast } from 'sonner';
import { hapticHeavy, hapticSuccess } from '@/utils/native';

export default function Checkout() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { items, total, clearCart, addItem } = useCart();
  const { user, isAuthenticated } = useAuth();
  const [itemsReady, setItemsReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState('courier');
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({ buyer_name: '', delivery_address: '', delivery_phone: '', delivery_notes: '' });

  useEffect(() => {
    if (!isAuthenticated) navigate('/login?redirect=/checkout');
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (user?.full_name && !form.buyer_name) setForm((f) => ({ ...f, buyer_name: user.full_name }));
  }, [user]);

  useEffect(() => {
    const quickBuyId = searchParams.get('quickBuy');
    if (quickBuyId && items.length === 0) {
      import('@/services/ArtworkService').then(async ({ get }) => {
        const artwork = await get(quickBuyId);
        if (artwork) addItem(artwork);
        setItemsReady(true);
      });
    } else {
      setItemsReady(true);
    }
  }, [searchParams, items.length]);

  if (!itemsReady) return null;
  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20 text-center">
        <ShoppingBag className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
        <h2 className="font-display text-2xl font-bold mb-2">Nothing to checkout</h2>
        <p className="text-muted-foreground font-body mb-6">Add some artwork to your cart first.</p>
        <Link to="/explore"><Button className="rounded-full">Browse Artwork</Button></Link>
      </div>
    );
  }

  const handleCheckout = async (e) => {
    e?.preventDefault();
    const nextErrors = {};
    if (!form.buyer_name.trim()) nextErrors.buyer_name = 'Please enter your full name';
    if (!form.delivery_phone.trim()) nextErrors.delivery_phone = 'Please enter your phone number';
    else if (!/^\+?\d[\d\s-]{8,}$/.test(form.delivery_phone.trim())) nextErrors.delivery_phone = 'Enter a valid phone number';
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length) {
      toast.error('Please fix the highlighted fields');
      return;
    }

    hapticHeavy();
    setLoading(true);
    try {
      const callable = httpsCallable(functions, 'createCheckoutSession');
      const result = await callable({
        artworkIds: items.map((i) => i.id),
        buyerName: form.buyer_name.trim(),
        deliveryMethod,
        deliveryAddress: form.delivery_address.trim(),
        deliveryPhone: form.delivery_phone.trim(),
        deliveryNotes: form.delivery_notes.trim(),
      });
      const { redirectUrl, sessionId } = result.data;
      hapticSuccess();
      clearCart();
      window.location.href = redirectUrl;
    } catch (err) {
      toast.error(err.message || 'Failed to start checkout');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <Link to="/cart" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 font-body">
        <ArrowLeft className="w-4 h-4" /> Back to Cart
      </Link>

      <h1 className="font-display text-3xl sm:text-4xl font-bold mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="font-display text-lg font-semibold mb-4">Shipping Information</h2>
            <div className="space-y-4">
              <div>
                <Label className="font-body text-sm">Full Name</Label>
                <Input value={form.buyer_name} onChange={(e) => setForm({ ...form, buyer_name: e.target.value })} placeholder="Your full name" className={`font-body ${errors.buyer_name ? 'border-destructive' : ''}`} required aria-invalid={!!errors.buyer_name} />
                {errors.buyer_name && <p className="text-xs text-destructive mt-1 font-body">{errors.buyer_name}</p>}
              </div>
               <div>
                 <Label className="font-body text-sm">Phone Number</Label>
                 <Input value={form.delivery_phone} onChange={(e) => setForm({ ...form, delivery_phone: e.target.value })} placeholder="+260..." type="tel" inputMode="telephone" className={`font-body ${errors.delivery_phone ? 'border-destructive' : ''}`} required aria-invalid={!!errors.delivery_phone} />
                 {errors.delivery_phone && <p className="text-xs text-destructive mt-1 font-body">{errors.delivery_phone}</p>}
               </div>
              <div>
                <Label className="font-body text-sm">Delivery Method</Label>
                 <RadioGroup value={deliveryMethod} onValueChange={setDeliveryMethod} className="grid grid-cols-1 gap-4 mt-2">
                   {['courier', 'yango', 'pickup'].map((method) => (
                     <label key={method} className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${deliveryMethod === method ? 'border-primary bg-primary/5' : 'border-border'}`}>
                       <RadioGroupItem value={method} className="w-6 h-6" />
                       <div className="font-body text-sm">
                         <p className="font-medium capitalize">{method === 'yango' ? 'Yango Delivery' : method === 'courier' ? 'Contact a Courier' : 'Pickup'}</p>
                         <p className="text-xs text-muted-foreground">{method === 'yango' ? 'Fast delivery via Yango' : method === 'courier' ? 'We will connect you with a courier' : 'Collect from the artist'}</p>
                       </div>
                     </label>
                   ))}
                 </RadioGroup>
              </div>
              <div>
                <Label className="font-body text-sm">Delivery Address</Label>
                <Input value={form.delivery_address} onChange={(e) => setForm({ ...form, delivery_address: e.target.value })} placeholder="Your delivery address" className="font-body" />
              </div>
              <div>
                <Label className="font-body text-sm">Notes (optional)</Label>
                <Textarea value={form.delivery_notes} onChange={(e) => setForm({ ...form, delivery_notes: e.target.value })} placeholder="Special instructions..." className="font-body" rows={2} />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm text-muted-foreground font-body p-4 rounded-xl bg-muted/30">
            <Shield className="w-5 h-5 text-green-primary flex-shrink-0" />
            <span>Your payment is processed securely via DPO Pay. We never store your card details.</span>
          </div>
        </div>

           <div className="lg:col-span-2 lg:sticky lg:top-24">
             <div className="rounded-xl border border-border bg-card p-6">
             <h2 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
               <Lock className="w-4 h-4 text-primary" /> Order Summary
             </h2>
             <div className="space-y-3 mb-4">
               {items.map((item) => (
                 <div key={item.id} className="flex items-center gap-3">
                   <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                     <img src={item.image} alt={item.title} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                   </div>
                   <div className="flex-1 min-w-0">
                     <p className="text-sm font-body font-medium truncate">{item.title}</p>
                     <p className="text-xs text-muted-foreground font-body">ZMW {(item.price || 0).toLocaleString()}</p>
                   </div>
                 </div>
               ))}
             </div>
             <div className="border-t border-border pt-4 space-y-2 text-sm font-body">
               <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>ZMW {total.toLocaleString()}</span></div>
               <div className="flex justify-between"><span className="text-muted-foreground">Delivery</span><span>Calculated later</span></div>
               <div className="flex justify-between font-bold text-base border-t border-border pt-2 mt-2">
                 <span>Total</span><span className="text-primary">ZMW {total.toLocaleString()}</span>
               </div>
             </div>
             <p className="text-xs text-muted-foreground text-center mt-4 font-body">You will be redirected to the DPO Pay portal to complete payment securely. We never store your card details.</p>
             <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/15 text-xs text-muted-foreground font-body">
               A fixed platform service charge applies to each sale (paid by the artist, not the buyer). You pay only the artwork price. See the <Link to="/terms" className="text-primary hover:underline">Terms &amp; Conditions</Link> for the current schedule.
             </div>
           </div>
           </div>
      </div>

      {/* Mobile + desktop sticky pay bar */}
      <StickyActionBar>
        <div className="max-w-4xl mx-auto p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[11px] text-muted-foreground font-body">Total due</p>
              <p className="font-display text-xl font-bold text-primary">ZMW {total.toLocaleString()}</p>
            </div>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground font-body">
              <Shield className="w-4 h-4 text-green-primary" /> Secure checkout
            </span>
          </div>
          <Button onClick={handleCheckout} disabled={loading} className="w-full rounded-full text-base gap-2">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</> : <>Pay with DPO <Truck className="w-4 h-4" /></>}
          </Button>
        </div>
      </StickyActionBar>
    </div>
  );
}
