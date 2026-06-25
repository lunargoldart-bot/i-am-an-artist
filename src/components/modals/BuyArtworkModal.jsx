import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Truck, Shield, CheckCircle, Loader2, Smartphone } from 'lucide-react';
import { toast } from 'sonner';

const deliveryOptions = [
  { value: 'yango', label: 'Yango Delivery', desc: 'Fast delivery via Yango', icon: '🚗' },
  { value: 'other_courier', label: 'Other Courier', desc: "We'll connect you with a local courier", icon: '📦' },
  { value: 'self_collect', label: 'Self Collection', desc: 'Collect directly from the artist', icon: '🤝' },
];

export default function BuyArtworkModal({ artwork, onClose }) {
  const [step, setStep] = useState(1);
  const [deliveryOption, setDeliveryOption] = useState('other_courier');
  const [address, setAddress] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const handleCreateOrder = async () => {
    setLoading(true);
    try {
      const user = await base44.auth.me();
      if (!user) {
        base44.auth.redirectToLogin();
        return;
      }

      // Create order
      const order = await base44.entities.Order.create({
        artwork_id: artwork.id,
        artwork_title: artwork.title,
        buyer_email: user.email,
        buyer_name: name || user.full_name,
        seller_email: artwork.artist_email,
        seller_name: artwork.artist_name,
        amount: artwork.price_zmw,
        delivery_method: deliveryOption,
        delivery_address: deliveryOption !== 'self_collect' ? address : null,
        status: 'pending',
        payment_status: 'pending',
      });

      setOrderId(order.id);
      setStep(2);
    } catch (error) {
      toast.error(error.message || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  const handleInitiatePayment = async () => {
    setPaymentLoading(true);
    try {
      const user = await base44.auth.me();
      
      // Initiate Lipila escrow payment
      const response = await base44.functions.invoke('initiateEscrowPayment', {
        orderId,
        artworkId: artwork.id,
        amount: artwork.price_zmw,
        phone,
        artworkTitle: artwork.title,
      });

      if (response.data.success) {
        setStep(3);
        toast.success('Payment initiated! Check your phone to complete payment.');
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Payment initiation failed');
    } finally {
      setPaymentLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-playfair font-bold text-lg text-foreground">
            {step === 3 ? 'Complete Payment' : 'Purchase Artwork'}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === 3 ? (
          <div className="p-6">
            <div className="text-center mb-6">
              <Shield className="w-12 h-12 text-primary mx-auto mb-3" />
              <h3 className="font-playfair font-bold text-xl text-foreground mb-2">
                Secure Payment
              </h3>
              <p className="text-sm text-muted-foreground">
                Your payment is held securely in escrow and will only be released to the artist after you confirm delivery.
              </p>
            </div>

            <div className="bg-secondary rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-muted-foreground">Artwork</span>
                <span className="font-semibold text-foreground">{artwork.title}</span>
              </div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-muted-foreground">Amount</span>
                <span className="text-gold font-bold">ZMW {artwork.price_zmw?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Payment Method</span>
                <span className="text-foreground text-sm flex items-center gap-1">
                  <Smartphone className="w-4 h-4" /> Mobile Money
                </span>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                <span className="text-muted-foreground">
                  Payment held securely in escrow
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                <span className="text-muted-foreground">
                  Artist notified to prepare artwork
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                <span className="text-muted-foreground">
                  You confirm delivery to release payment
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                <span className="text-muted-foreground">
                  Instant payment release on delivery confirmation
                </span>
              </div>
            </div>

            <Button 
              className="gold-gradient text-background w-full mt-6" 
              onClick={onClose}
            >
              Done
            </Button>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {/* Artwork preview */}
            <div className="flex gap-3 bg-secondary rounded-lg p-3">
              <img
                src={artwork.images?.[0] || 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100&h=100&fit=crop'}
                alt={artwork.title}
                className="w-16 h-16 rounded-md object-cover"
              />
              <div>
                <h3 className="font-playfair font-semibold text-foreground text-sm">{artwork.title}</h3>
                <p className="text-xs text-muted-foreground">{artwork.artist_name}</p>
                <p className="text-gold font-bold text-sm mt-1">ZMW {artwork.price_zmw?.toLocaleString()}</p>
              </div>
            </div>

            {step === 1 && (
              <>
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
                    className="bg-background border-border" 
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    We'll send payment request to this number
                  </p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-2 block">Choose Delivery</label>
                  <div className="space-y-2">
                    {deliveryOptions.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => setDeliveryOption(opt.value)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
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
                <Button 
                  className="gold-gradient text-background w-full font-semibold" 
                  onClick={() => setStep(2)}
                  disabled={!name || !phone}
                >
                  Continue
                </Button>
              </>
            )}

            {step === 2 && (
              <>
                <div className="bg-secondary rounded-lg p-4">
                  <div className="flex items-center gap-2 text-xs text-primary mb-3">
                    <Shield className="w-3 h-3" /> 
                    <strong>Escrow Protection</strong>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">
                    Your payment is held securely and only released after you confirm delivery.
                  </p>
                  <div className="flex justify-between text-sm pt-2 border-t border-border">
                     <span className="font-semibold text-foreground">Total to Pay</span>
                     <span className="text-gold font-bold text-lg">ZMW {artwork.price_zmw?.toLocaleString()}</span>
                   </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1 border-border" 
                    onClick={() => setStep(1)}
                  >
                    Back
                  </Button>
                  <Button 
                    className="flex-1 gold-gradient text-background font-semibold" 
                    onClick={handleInitiatePayment}
                    disabled={paymentLoading}
                  >
                    {paymentLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Pay with Mobile Money'
                    )}
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}