import { useEffect, useState } from 'react';
import { Settings, Save, RotateCcw } from 'lucide-react';
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

const DEFAULTS = {
  platform_name: 'I Am An Artist',
  commission_rate: '10',
  currency: 'ZMW',
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
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Commission rate (%)</Label>
                  <Input type="number" value={values.commission_rate} onChange={(e) => set('commission_rate')(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Currency</Label>
                  <Input value={values.currency} onChange={(e) => set('currency')(e.target.value)} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Support email</Label>
                <Input value={values.support_email} onChange={(e) => set('support_email')(e.target.value)} />
              </div>
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