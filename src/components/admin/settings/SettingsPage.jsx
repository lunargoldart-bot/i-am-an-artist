import { useEffect, useState } from 'react';
import { Settings, Save, RotateCcw, Plus, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/admin/ui';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { withToast } from '@/lib/adminActions';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const SETTINGS_ID = 'platform';

// Client-approved tiered fixed platform service charge (seller-paid, per piece).
// These values are the approved business schedule and the server-authoritative
// defaults used by the sale-finalisation cloud function when none are stored.
const DEFAULT_TIERS = [
  { min_amount: 1, max_amount: 250, fixed_charge: 2, currency: 'ZMW', active: true },
  { min_amount: 251, max_amount: 1000, fixed_charge: 5, currency: 'ZMW', active: true },
  { min_amount: 1001, max_amount: 2500, fixed_charge: 10, currency: 'ZMW', active: true },
  { min_amount: 2501, max_amount: 5000, fixed_charge: 20, currency: 'ZMW', active: true },
  { min_amount: 5001, max_amount: 10000, fixed_charge: 40, currency: 'ZMW', active: true },
  { min_amount: 10001, max_amount: null, fixed_charge: 75, currency: 'ZMW', active: true },
];

const DEFAULTS = {
  platform_name: 'I Am An Artist',
  currency: 'ZMW',
  service_charge_tiers: DEFAULT_TIERS,
  allow_registrations: true,
  allow_artwork_uploads: true,
  allow_auctions: true,
  require_artwork_approval: true,
  maintenance_mode: false,
  support_email: 'seantinashenyakutira@gmail.com',
};

export default function SettingsPage() {
  const [values, setValues] = useState(DEFAULTS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const snapshot = await getDoc(doc(db, 'app_settings', SETTINGS_ID));
        if (snapshot.exists()) setValues({ ...DEFAULTS, ...snapshot.data() });
      } catch (err) {
        console.error(err);
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  const set = (key) => (value) => setValues((prev) => ({ ...prev, [key]: value }));

  const save = () => withToast(
    setDoc(doc(db, 'app_settings', SETTINGS_ID), values, { merge: true }),
    'Settings saved',
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Settings"
        description="Global platform configuration"
        icon={Settings}
        actions={(
          <>
            <Button variant="outline" size="sm" onClick={() => setValues(DEFAULTS)}>
              <RotateCcw className="mr-2 h-3.5 w-3.5" /> Reset
            </Button>
            <Button size="sm" onClick={save} disabled={!loaded}>
              <Save className="mr-2 h-3.5 w-3.5" /> Save
            </Button>
          </>
        )}
      />

      {!loaded ? (
        <p className="py-10 text-center text-sm text-muted-foreground">Loading settings…</p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="font-playfair text-base text-foreground">Platform Identity</CardTitle>
              <CardDescription className="text-xs">Branding and marketplace economics.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>Platform name</Label>
                <Input value={values.platform_name} onChange={(e) => set('platform_name')(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Currency</Label>
                <Input value={values.currency} onChange={(e) => set('currency')(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Support email</Label>
                <Input value={values.support_email} onChange={(e) => set('support_email')(e.target.value)} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="font-playfair text-base text-foreground">Service Charge Tiers</CardTitle>
              <CardDescription className="text-xs">
                Fixed platform service charge per artwork piece (seller-paid, no percentage commission).
                Applied server-side at sale finalisation on new transactions only.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground px-1">
                <span className="col-span-3">Min (ZMW)</span>
                <span className="col-span-3">Max (ZMW)</span>
                <span className="col-span-2">Charge</span>
                <span className="col-span-2">Active</span>
                <span className="col-span-2" />
              </div>
              {(values.service_charge_tiers || []).map((tier, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-center">
                  <Input
                    type="number"
                    className="col-span-3 h-9"
                    value={tier.min_amount ?? ''}
                    onChange={(e) => {
                      const next = [...values.service_charge_tiers];
                      next[index] = { ...next[index], min_amount: Number(e.target.value) };
                      setValues((prev) => ({ ...prev, service_charge_tiers: next }));
                    }}
                  />
                  <Input
                    type="number"
                    className="col-span-3 h-9"
                    value={tier.max_amount ?? ''}
                    placeholder="unlimited"
                    onChange={(e) => {
                      const next = [...values.service_charge_tiers];
                      next[index] = { ...next[index], max_amount: e.target.value === '' ? null : Number(e.target.value) };
                      setValues((prev) => ({ ...prev, service_charge_tiers: next }));
                    }}
                  />
                  <Input
                    type="number"
                    step="0.01"
                    className="col-span-2 h-9"
                    value={tier.fixed_charge ?? ''}
                    onChange={(e) => {
                      const next = [...values.service_charge_tiers];
                      next[index] = { ...next[index], fixed_charge: Number(e.target.value) };
                      setValues((prev) => ({ ...prev, service_charge_tiers: next }));
                    }}
                  />
                  <div className="col-span-2 flex justify-center">
                    <Switch
                      checked={tier.active !== false}
                      onCheckedChange={(checked) => {
                        const next = [...values.service_charge_tiers];
                        next[index] = { ...next[index], active: checked };
                        setValues((prev) => ({ ...prev, service_charge_tiers: next }));
                      }}
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="col-span-2 h-9 w-9"
                    onClick={() => setValues((prev) => ({
                      ...prev,
                      service_charge_tiers: prev.service_charge_tiers.filter((_, i) => i !== index),
                    }))}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setValues((prev) => ({
                  ...prev,
                  service_charge_tiers: [...(prev.service_charge_tiers || []), {
                    min_amount: null,
                    max_amount: null,
                    fixed_charge: 0,
                    currency: 'ZMW',
                    active: true,
                  }],
                }))}
              >
                <Plus className="mr-2 h-3.5 w-3.5" /> Add tier
              </Button>
              <p className="text-xs text-muted-foreground">
                Wildcard top tier: leave the max field empty. The active schedule is applied to new sales only; historical records are not rewritten.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="font-playfair text-base text-foreground">Feature Toggles</CardTitle>
              <CardDescription className="text-xs">Enable or disable platform capabilities.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: 'allow_registrations', label: 'Allow new registrations' },
                { key: 'allow_artwork_uploads', label: 'Allow artwork uploads' },
                { key: 'allow_auctions', label: 'Allow auctions' },
                { key: 'require_artwork_approval', label: 'Require artwork approval' },
                { key: 'maintenance_mode', label: 'Maintenance mode (all visits see maintenance page)' },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between rounded-lg bg-secondary/50 p-3">
                  <span className="text-sm text-foreground">{label}</span>
                  <Switch checked={Boolean(values[key])} onCheckedChange={set(key)} />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}