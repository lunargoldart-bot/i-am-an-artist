import { useState } from 'react';
import { firebaseClient } from '@/api/firebaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { CheckCircle2, Loader2, Smartphone, AlertCircle } from 'lucide-react';

// Ad pricing per duration
const PRICING = [
  { days: 7, amount: 150, label: '7 days — ZMW 150' },
  { days: 14, amount: 250, label: '14 days — ZMW 250' },
  { days: 30, amount: 400, label: '30 days — ZMW 400' },
];

export default function LipilaPaymentModal({ open, onClose, ad, onSuccess }) {
  const [phone, setPhone] = useState('');
  const [selectedPlan, setSelectedPlan] = useState(PRICING[0]);
  const [status, setStatus] = useState('idle'); // idle | loading | pending | success | error
  const [errorMsg, setErrorMsg] = useState('');

  const handlePay = async () => {
    if (!phone || phone.length < 10) { setErrorMsg('Please enter a valid Zambian mobile number (e.g. 260977123456)'); return; }
    setErrorMsg('');
    setStatus('loading');

    const res = await firebaseClient.functions.invoke('lipila_initiate', {
      phone,
      days: selectedPlan.days,
      adId: ad.id,
    });

    if (res.data?.success) {
      setStatus('pending');
    } else {
      setErrorMsg(res.data?.error || 'Payment initiation failed. Please try again.');
      setStatus('error');
    }
  };

  const handleClose = () => {
    setStatus('idle');
    setPhone('');
    setErrorMsg('');
    onClose();
    if (status === 'pending') onSuccess?.();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-playfair text-xl text-foreground">Pay for Ad Campaign</DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            Pay via mobile money to activate your sponsored ad on Zartia.
          </DialogDescription>
        </DialogHeader>

        {status === 'pending' ? (
          <div className="flex flex-col items-center py-8 text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center">
              <Smartphone className="w-8 h-8 text-gold animate-pulse" />
            </div>
            <div>
              <p className="font-semibold text-foreground text-lg">Check your phone!</p>
              <p className="text-muted-foreground text-sm mt-1">A mobile money prompt has been sent to <span className="text-foreground font-medium">{phone}</span>. Enter your PIN to confirm.</p>
              <p className="text-muted-foreground text-xs mt-3">MTN users: dial <span className="text-foreground font-mono">*115#</span> if no prompt arrives.</p>
            </div>
            <p className="text-xs text-muted-foreground bg-muted/40 rounded-lg px-4 py-2">Your ad will activate automatically once payment is confirmed.</p>
            <Button variant="outline" onClick={handleClose} className="w-full">Done</Button>
          </div>
        ) : status === 'success' ? (
          <div className="flex flex-col items-center py-8 text-center gap-4">
            <CheckCircle2 className="w-14 h-14 text-green-500" />
            <p className="font-semibold text-foreground text-lg">Ad is live!</p>
            <Button onClick={handleClose} className="gold-gradient text-background font-semibold w-full">Done</Button>
          </div>
        ) : (
          <div className="space-y-5 pt-2">
            {/* Ad preview */}
            <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-muted/20">
              {ad?.image_url && <img src={ad.image_url} alt="" className="w-12 h-12 rounded-lg object-cover" />}
              <div className="min-w-0">
                <p className="font-semibold text-sm text-foreground truncate">{ad?.headline}</p>
                <p className="text-xs text-muted-foreground truncate">{ad?.tagline}</p>
              </div>
            </div>

            {/* Duration picker */}
            <div>
              <p className="text-xs text-muted-foreground mb-2">Select campaign duration</p>
              <div className="grid grid-cols-3 gap-2">
                {PRICING.map((p) => (
                  <button
                    key={p.days}
                    onClick={() => setSelectedPlan(p)}
                    className={`rounded-lg border px-2 py-3 text-xs font-semibold transition-all ${
                      selectedPlan.days === p.days
                        ? 'border-gold bg-gold/10 text-gold'
                        : 'border-border text-muted-foreground hover:border-gold/40'
                    }`}
                  >
                    <span className="block text-sm font-bold">{p.days}d</span>
                    ZMW {p.amount}
                  </button>
                ))}
              </div>
            </div>

            {/* Phone input */}
            <div>
              <p className="text-xs text-muted-foreground mb-1.5">Mobile money number (MTN / Airtel / Zamtel)</p>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="260977123456"
                className="font-mono"
                type="tel"
              />
              <p className="text-xs text-muted-foreground mt-1">Include country code: 260XXXXXXXXX</p>
            </div>

            {errorMsg && (
              <div className="flex items-center gap-2 text-destructive text-xs bg-destructive/10 rounded-lg px-3 py-2">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {errorMsg}
              </div>
            )}

            <Button
              onClick={handlePay}
              disabled={status === 'loading'}
              className="gold-gradient text-background font-semibold w-full"
            >
              {status === 'loading' ? (
                <><Loader2 className="w-4 h-4 animate-spin mr-2" />Initiating…</>
              ) : (
                `Pay ZMW ${selectedPlan.amount} via Mobile Money`
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}