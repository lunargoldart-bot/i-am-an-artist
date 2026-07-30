import { Link } from 'react-router-dom';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function OrderFailure() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-20 text-center">
      <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
        <XCircle className="w-10 h-10 text-red-500" />
      </div>
      <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2">Payment Cancelled</h1>
      <p className="text-muted-foreground font-body text-lg mb-8">
        Your payment was not completed. Your cart items are still saved.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link to="/checkout">
          <Button className="rounded-full gap-2"><RefreshCw className="w-4 h-4" /> Retry Payment</Button>
        </Link>
        <Link to="/">
          <Button variant="outline" className="rounded-full gap-2"><ArrowLeft className="w-4 h-4" /> Return Home</Button>
        </Link>
      </div>
      <p className="text-xs text-muted-foreground font-body mt-6">
        If you experienced an issue, please contact support at support@iamanartistapp.com
      </p>
    </div>
  );
}
