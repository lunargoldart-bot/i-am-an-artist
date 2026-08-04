import { useState } from 'react';
import { Bell, ShieldAlert, PackageCheck, CircleDollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCollectionSnapshot } from '@/hooks/useCollectionSnapshot';
import { timeAgo } from '@/lib/adminData';

const priorityIcon = (status) => {
  if (['open', 'pending'].includes(String(status).toLowerCase())) return <ShieldAlert className="h-3.5 w-3.5 text-amber-500" />;
  if (['paid', 'delivered'].includes(String(status).toLowerCase())) return <PackageCheck className="h-3.5 w-3.5 text-emerald-500" />;
  return <CircleDollarSign className="h-3.5 w-3.5 text-sky-500" />;
};

export default function NotificationsPanel() {
  const [open, setOpen] = useState(false);
  const grievances = useCollectionSnapshot('grievances', { max: 8 });
  const orders = useCollectionSnapshot('orders', { max: 8 });
  const payments = useCollectionSnapshot('payments', { max: 8 });

  const items = [
    ...grievances.data.map((g) => ({ id: `g-${g.id}`, title: g.title || g.subject || 'New grievance', detail: `${g.user_email || ''} · ${timeAgo(g.created_date)}`, icon: priorityIcon(g.status), type: 'Support' })),
    ...payments.data.map((p) => ({ id: `p-${p.id}`, title: `${p.payment_status || 'Payment'} ${p.reference ? `#${p.reference}` : ''}`, detail: `${p.buyer_email || p.seller_email || ''} · ${timeAgo(p.created_date)}`, icon: priorityIcon(p.payment_status), type: 'Payment' })),
    ...orders.data.map((o) => ({ id: `o-${o.id}`, title: `Order ${o.artwork_title || o.id}`, detail: `${o.buyer_email || ''} · ${timeAgo(o.created_date)}`, icon: priorityIcon(o.delivery_status), type: 'Order' })),
  ]
    .sort((a, b) => b.detail.localeCompare(a.detail))
    .slice(0, 10);

  const unreadCount = grievances.data.filter((g) => String(g.status).toLowerCase() === 'open').length + payments.data.filter((p) => String(p.payment_status).toLowerCase() === 'pending').length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
          <p className="text-sm font-semibold text-foreground">Notifications</p>
          <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] text-muted-foreground">Realtime</span>
        </div>
        <ScrollArea className="h-80">
          {items.length === 0 ? (
            <p className="p-6 text-center text-sm text-muted-foreground">No recent notifications.</p>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex items-start gap-3 px-4 py-3 hover:bg-secondary/50">
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-secondary">
                  {item.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">{item.title}</p>
                  <p className="truncate text-xs text-muted-foreground">{item.detail}</p>
                </div>
              </div>
            ))
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}