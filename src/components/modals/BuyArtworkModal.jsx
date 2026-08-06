import { useState } from 'react';
import { firebaseClient } from '@/api/firebaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, CheckCircle, Loader2, Lock } from 'lucide-react';
import { toast } from 'sonner';

const deliveryOptions = [
  { value: 'yango', label: 'Yango Delivery', desc: 'Fast delivery via Yango', icon: '🚗' },
  { value: 'other_courier', label: 'Other Courier', desc: "We'll connect you with a local courier", icon: '📦' },
  { value: 'self_collect', label: 'Self Collection', desc: 'Collect directly from the artist', icon: '🤝' },
];

const getPrice = (artwork) => Number(artwork?.price ?? artwork?.price_zmw ?? 0) || 0;
const getImage = (artwork) => artwork?.image_urls?.[0] || artwork?.images?.[0] || '';

export default function BuyArtworkModal({ artwork, onClose }) {
  const [deliveryOption, setDeliveryOption] = useState('other_courier');
  const [address, setAddress] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const price = getPrice(artwork);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const user = await firebaseClient.auth.me();
      if (!user) {
        firebaseClient.auth.redirectToLogin();
        return;
      }

      // Route through the production DPO hosted-checkout flow (same as Checkout page).
      const response = await firebaseClient.functions.invoke('createCheckoutSession', {
        artworkIds: [artwork.id],
        buyerName: name || user.full_name,
        deliveryMethod: deliveryOption,
        deliveryAddress: deliveryOption !== 'self_collect' ? address : '',
        deliveryPhone: phone,
      });
      const { redirectUrl } = response.data;
      if (!redirectUrl) throw new Error('Checkout could not be started');
      toast.success('Redirecting to secure payment...');
      window.location.href = redirectUrl;
    } catch (error) {
      toast.error(error.message || 'Failed to start checkout');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
           <div className="bg-card border border-border rounded-xl max-w-md w-full overflow-y-auto max-h-[90vh]">
         {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-playfair font-bold text-lg text-foreground">
            Purchase Artwork
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

          <div className="p-4 space-y-4">
            {/* Artwork preview */}
            <div className="flex gap-3 bg-secondary rounded-lg p-3">
              <img
                src={getImage(artwork) || 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100&h=100&fit=crop'}
                alt={artwork.title}
                className="w-16 h-16 rounded-md object-cover"
              />
              <div>
                <h3 className="font-playfair font-semibold text-foreground text-sm">{artwork.title}</h3>
                <p className="text-xs text-muted-foreground">{artwork.artist_name}</p>
                <p className="text-gold font-bold text-sm mt-1">ZMW {price.toLocaleString()}</p>
              </div>
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-2 block">Your Name</label>
              <Input 
                value={name} 
                onChange={e => setName(e.target.value)} 
                placeholder="Full name" 
                className="bg-background border-border" 
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-2 block">Mobile Money Number</label>
               <Input 
                 value={phone} 
                 onChange={e => setPhone(e.target.value)} 
                 placeholder="+260..." 
                 type="tel"
                 inputMode="telephone"
                 className="bg-background border-border" 
               />
              <p className="text-xs text-muted-foreground mt-1">
                Used for delivery contact
              </p>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-2 block">Choose Delivery</label>
              <div className="space-y-2">
                {deliveryOptions.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setDeliveryOption(opt.value)}
                    className={`w-full flex items-center gap-3 p-4 rounded-lg border text-left transition-all ${
                      deliveryOption === opt.value ? 'border-gold bg-gold/10' : 'border-border hover:border-gold/50'
                    }`}
                  >
                    <span className="text-xl">{opt.icon}</span>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{opt.label}</p>
                      <p className="text-xs text-muted-foreground">{opt.desc}</p>
                    </div>
                    {deliveryOption === opt.value && <CheckCircle className="w-4 h-4 text-gold ml-auto" />}
                  </button>
                ))}
              </div>
            </div>
            {deliveryOption !== 'self_collect' && (
              <div>
                <label className="text-xs text-muted-foreground mb-2 block">Delivery Address</label>
                <Input 
                  value={address} 
                  onChange={e => setAddress(e.target.value)} 
                  placeholder="Full address" 
                  className="bg-background border-border" 
                />
              </div>
            )}

            <div className="bg-secondary rounded-lg p-4">
              <div className="flex items-center gap-2 text-xs text-primary mb-2">
                <Lock className="w-3 h-3" /> 
                <strong>Secure Payment</strong>
              </div>
              <p className="text-xs text-muted-foreground mb-2">
                Payment is processed securely via DPO Pay. You will be redirected to complete checkout.
              </p>
              <div className="flex justify-between text-sm pt-2 border-t border-border">
                 <span className="font-semibold text-foreground">Total to Pay</span>
                 <span className="text-gold font-bold text-lg">ZMW {price.toLocaleString()}</span>
               </div>
            </div>

            <Button 
              className="gold-gradient text-background w-full font-semibold" 
              onClick={handleCheckout}
              disabled={!name || !phone || loading}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Pay with DPO'}
            </Button>
          </div>
      </div>
    </div>
  );
}