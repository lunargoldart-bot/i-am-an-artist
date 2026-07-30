import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, Loader2, ShoppingBag, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/AuthContext';
import { functions } from '@/lib/firebase';
import { httpsCallable } from 'firebase/functions';
import confetti from 'canvas-confetti';

export default function OrderSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('sessionId');
  const { isAuthenticated } = useAuth();
  const [status, setStatus] = useState('loading');
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (!sessionId) { setStatus('error'); return; }
    if (!isAuthenticated) return;

    const verify = async () => {
      try {
        const callable = httpsCallable(functions, 'verifyDPOPayment');
        const result = await callable({ sessionId });
        if (result.data.status === 'completed') {
          setStatus('completed');
          setOrders(result.data.orders || []);
          setTimeout(() => {
            confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
          }, 300);
        } else {
          setStatus('pending');
        }
      } catch (err) {
        setStatus('error');
      }
    };

    const timer = setTimeout(verify, 2000);
    return () => clearTimeout(timer);
  }, [sessionId, isAuthenticated]);

  if (status === 'loading') {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-20 text-center">
        <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
        <h2 className="font-display text-xl font-bold">Verifying your payment...</h2>
        <p className="text-muted-foreground font-body mt-2">Please wait while we confirm your payment.</p>
      </div>
    );
  }

  if (status === 'pending') {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-4">
          <Loader2 className="w-8 h-8 text-yellow-600 animate-spin" />
        </div>
        <h2 className="font-display text-2xl font-bold mb-2">Payment Pending</h2>
        <p className="text-muted-foreground font-body mb-6">Your payment is being processed. This page will update automatically once confirmed.</p>
        <Link to="/orders"><Button variant="outline" className="rounded-full">View My Orders</Button></Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-10">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2">Payment Successful!</h1>
        <p className="text-muted-foreground font-body text-lg">Thank you for your purchase. The artist will be notified.</p>
      </div>

      {orders.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-6 mb-8">
          <h2 className="font-display text-lg font-semibold mb-4">Order Summary</h2>
          <div className="space-y-3">
            {orders.map((order) => (
              <div key={order.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <div>
                  <p className="font-body font-medium">{order.artwork_title}</p>
                  <p className="text-xs text-muted-foreground font-body">Order ID: {order.id}</p>
                </div>
                <p className="font-display font-bold text-primary">ZMW {(order.amount || 0).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-muted/30 rounded-xl p-6 mb-8">
        <h3 className="font-display font-semibold mb-3">What happens next?</h3>
        <ol className="space-y-2 text-sm font-body text-muted-foreground">
          <li className="flex items-start gap-2"><span className="text-primary font-bold">1.</span> The artist will be notified of your purchase</li>
          <li className="flex items-start gap-2"><span className="text-primary font-bold">2.</span> They will prepare the artwork for delivery</li>
          <li className="flex items-start gap-2"><span className="text-primary font-bold">3.</span> You will receive shipping updates in your orders page</li>
        </ol>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link to="/orders"><Button className="rounded-full gap-2"><ShoppingBag className="w-4 h-4" /> View My Orders</Button></Link>
        <Link to="/explore"><Button variant="outline" className="rounded-full gap-2"><ArrowLeft className="w-4 h-4" /> Continue Shopping</Button></Link>
      </div>
    </div>
  );
}
