import {
  LayoutDashboard, Users, Palette, UserRound, ImageIcon, Layers, Tags,
  Gavel, ShoppingCart, CreditCard, Repeat, MessageSquare, Star, BarChart3,
  LifeBuoy, ShieldAlert, TrendingUp, Megaphone, Bell, Settings, SlidersHorizontal,
  ShieldCheck, ScrollText, Plug, Lock, DatabaseBackup,
} from 'lucide-react';

export const ADMIN_NAV = [
  { title: 'Overview', items: [{ label: 'Dashboard', href: '/admin', icon: LayoutDashboard }] },
  {
    title: 'Community',
    items: [
      { label: 'Users', href: '/admin/users', icon: Users },
      { label: 'Artists', href: '/admin/artists', icon: Palette },
      { label: 'Collectors', href: '/admin/collectors', icon: UserRound },
      { label: 'Admins', href: '/admin/admins', icon: ShieldCheck },
    ],
  },
  {
    title: 'Catalog',
    items: [
      { label: 'Artwork', href: '/admin/artwork', icon: ImageIcon },
      { label: 'Collections', href: '/admin/collections', icon: Layers },
      { label: 'Categories', href: '/admin/categories', icon: Tags },
    ],
  },
  {
    title: 'Commerce',
    items: [
      { label: 'Auctions', href: '/admin/auctions', icon: Gavel },
      { label: 'Orders', href: '/admin/orders', icon: ShoppingCart },
      { label: 'Payments', href: '/admin/payments', icon: CreditCard },
      { label: 'Subscriptions', href: '/admin/subscriptions', icon: Repeat },
    ],
  },
  {
    title: 'Engagement',
    items: [
      { label: 'Messages', href: '/admin/messages', icon: MessageSquare },
      { label: 'Reviews', href: '/admin/reviews', icon: Star },
      { label: 'Content Moderation', href: '/admin/moderation', icon: ShieldAlert },
      { label: 'Support Tickets', href: '/admin/support', icon: LifeBuoy },
    ],
  },
  {
    title: 'Intelligence',
    items: [
      { label: 'Analytics', href: '/admin/analytics', icon: TrendingUp },
      { label: 'Reports', href: '/admin/reports', icon: BarChart3 },
      { label: 'Marketing', href: '/admin/marketing', icon: Megaphone },
      { label: 'Notifications', href: '/admin/notifications', icon: Bell },
    ],
  },
  {
    title: 'System',
    items: [
      { label: 'System Status', href: '/admin/system', icon: Settings },
      { label: 'System Settings', href: '/admin/settings', icon: SlidersHorizontal },
      { label: 'Audit Logs', href: '/admin/audit-logs', icon: ScrollText },
      { label: 'API & Integrations', href: '/admin/api', icon: Plug },
      { label: 'Security', href: '/admin/security', icon: Lock },
      { label: 'Backups', href: '/admin/backups', icon: DatabaseBackup },
    ],
  },
];
