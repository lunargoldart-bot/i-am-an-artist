import React from 'react';
import { firebaseClient } from '@/api/firebaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingDown, CheckCircle } from 'lucide-react';

export default function NegotiationPanel({ conversationId, messages = [], currentPrice }) {
  const [user, setUser] = React.useState(null);
  const [counteroffer, setCounteroffer] = React.useState('');

  React.useEffect(() => {
    firebaseClient.auth.isAuthenticated().then(async (authed) => {
      if (authed) {
        const me = await firebaseClient.auth.me();
        setUser(me);
      }
    });
  }, []);

  // Extract offer history from messages
  const offers = messages
    .filter(m => m.message_type === 'offer')
    .sort((a, b) => new Date(a.created_date) - new Date(b.created_date));

  if (offers.length === 0 || !user) return null;

  const lastOffer = offers[offers.length - 1];
  const isYourOffer = lastOffer.sender_email === user.email;
  const offerDifference = currentPrice - lastOffer.offer_amount;
  const discountPercentage = ((offerDifference / currentPrice) * 100).toFixed(1);

  return (
    <Card className="bg-primary/5 border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <DollarSign className="w-5 h-5 text-primary" />
          Price Negotiation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Offer History */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-muted-foreground">Offer History</h4>
          {offers.map((offer, idx) => (
            <div key={offer.id} className="flex items-center justify-between p-2 rounded bg-background/50">
              <div>
                <p className="text-sm font-semibold">{offer.sender_name}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(offer.created_date).toLocaleString()}
                </p>
              </div>
              <Badge className="bg-primary/10 text-primary">
                ZMW {offer.offer_amount.toLocaleString()}
              </Badge>
            </div>
          ))}
        </div>

        {/* Latest Offer Status */}
        <div className="p-3 rounded-lg bg-secondary/50 border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold">Latest Offer</span>
            <Badge variant="outline" className="gap-1">
              <TrendingDown className="w-3 h-3" />
              {discountPercentage}% below asking
            </Badge>
          </div>
          <p className="text-2xl font-bold text-primary">
            ZMW {lastOffer.offer_amount.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Original: ZMW {currentPrice.toLocaleString()}
          </p>
        </div>

        {/* Counter-offer Input */}
        {!isYourOffer && (
          <div className="space-y-2 pt-2 border-t border-border">
            <label className="text-xs font-semibold text-foreground">Your Counter-Offer</label>
            <div className="flex gap-2">
              <Input
                type="number"
                min="0"
                step="100"
                value={counteroffer}
                onChange={(e) => setCounteroffer(e.target.value)}
                placeholder="Enter amount"
                className="font-body text-sm"
              />
              <Button
                size="sm"
                className="rounded-full gap-1"
              >
                <CheckCircle className="w-4 h-4" />
                Offer
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}