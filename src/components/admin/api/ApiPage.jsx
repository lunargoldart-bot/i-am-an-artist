import { useState } from 'react';
import { Plug, Copy, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { PageHeader } from '@/components/admin/ui';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import toast from 'react-hot-toast';

const ENDPOINTS = [
  { path: 'createCheckoutSession', method: 'POST', desc: 'Create a DPO Pay checkout session', auth: 'User' },
  { path: 'verifyDPOPayment', method: 'POST', desc: 'Verify a DPO payment token', auth: 'User' },
  { path: 'sendMessage', method: 'POST', desc: 'Send a message', auth: 'User' },
  { path: 'createOrder', method: 'POST', desc: 'Create an order', auth: 'User' },
  { path: 'placeBid', method: 'POST', desc: 'Place an auction bid', auth: 'User' },
  { path: 'approveVerification', method: 'POST', desc: 'Approve user/artist verification', auth: 'Admin' },
  { path: 'updateOrderStatus', method: 'POST', desc: 'Update an order status', auth: 'Admin' },
  { path: 'handleGrievance', method: 'POST', desc: 'Process a support ticket', auth: 'Admin' },
  { path: 'releasePayment', method: 'POST', desc: 'Release escrow to an artist', auth: 'Admin' },
  { path: 'sendEmail', method: 'POST', desc: 'Send a transactional email', auth: 'Internal' },
  { path: 'invokeLLM', method: 'POST', desc: 'AI moderation & pricing via OpenAI', auth: 'Internal' },
  { path: 'dpoCallback', method: 'POST (HTTP)', desc: 'DPO server callback endpoint', auth: 'Webhook' },
];

export default function ApiPage() {
  const [showKey, setShowKey] = useState(false);
  const [apiKey, setApiKey] = useState('iamanArtist_api_key_xxxxxxxxxxxxxxxx');

  const copy = (text, label) => { navigator.clipboard?.writeText(text); toast.success(`${label} copied`); };

  return (
    <div className="space-y-6">
      <PageHeader title="API & Integrations" description="Cloud Functions endpoints and platform connections" icon={Plug} />

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="font-playfair text-base text-foreground">API Key</CardTitle>
          <CardDescription className="text-xs">Used for server-to-server integrations.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-2">
          <code className="flex-1 rounded-lg bg-secondary px-3 py-2 font-mono text-sm text-foreground">
            {showKey ? apiKey : `${apiKey.slice(0, 8)}â€¦${apiKey.slice(-6)}`}
          </code>
          <Button variant="outline" size="icon" onClick={() => setShowKey((v) => !v)} aria-label="Toggle key visibility">
            {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
          <Button variant="outline" size="icon" onClick={() => copy(apiKey, 'API key')} aria-label="Copy key">
            <Copy className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => { setApiKey(`iamanArtist_api_key_${Math.random().toString(36).slice(2, 18)}`); toast.success('Key regenerated'); }}>
            <RefreshCw className="mr-2 h-3.5 w-3.5" /> Rotate
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="font-playfair text-base text-foreground">Cloud Functions Endpoints</CardTitle>
          <CardDescription className="text-xs">Callable HTTP endpoints exposed by the backend.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-2">
          {ENDPOINTS.map((ep) => (
            <div key={ep.path} className="flex items-center gap-3 rounded-lg bg-secondary/50 p-3">
              <Badge variant="outline" className="font-mono text-[10px] text-primary">{ep.method}</Badge>
              <div className="min-w-0 flex-1">
                <p className="truncate font-mono text-xs text-foreground">{ep.path}</p>
                <p className="truncate text-[11px] text-muted-foreground">{ep.desc}</p>
              </div>
              <Badge variant="secondary" className="text-[10px]">{ep.auth}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}