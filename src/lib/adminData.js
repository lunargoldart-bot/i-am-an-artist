export const ZMW = new Intl.NumberFormat('en-ZM', { style: 'currency', currency: 'ZMW', maximumFractionDigits: 0 });

export const formatCurrency = (value = 0) => ZMW.format(Number(value) || 0);

export const formatNumber = (value = 0) => new Intl.NumberFormat().format(Number(value) || 0);

export const formatCompact = (value = 0) =>
  new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(Number(value) || 0);

export const timeAgo = (iso) => {
  if (!iso) return '—';
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
};

export const formatDate = (iso) => {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return String(iso);
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const formatDateTime = (iso) => {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return String(iso);
  return date.toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

export const sumBy = (rows, key) => rows.reduce((sum, row) => sum + (Number(row[key]) || 0), 0);

export const countBy = (rows, key) => {
  const counts = {};
  rows.forEach((row) => {
    const bucket = String(row[key] ?? 'unknown');
    counts[bucket] = (counts[bucket] || 0) + 1;
  });
  return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
};

export const bucketByDate = (rows, { dateKey = 'created_date', days = 30 } = {}) => {
  const now = new Date();
  const buckets = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);
    buckets.push({ date, label: date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }), count: 0 });
  }
  const map = new Map(buckets.map((b) => [b.date.toDateString(), b]));
  rows.forEach((row) => {
    const iso = row[dateKey];
    if (!iso) return;
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return;
    const bucket = map.get(date.toDateString());
    if (bucket) bucket.count += 1;
  });
  return buckets.map(({ label, count }) => ({ name: label, value: count }));
};

export const bucketRevenueByDate = (rows, { dateKey = 'created_date', amountKey = 'amount_zmw', days = 30 } = {}) => {
  const now = new Date();
  const buckets = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);
    buckets.push({ date, label: date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }), value: 0 });
  }
  const map = new Map(buckets.map((b) => [b.date.toDateString(), b]));
  rows.forEach((row) => {
    const iso = row[dateKey];
    if (!iso) return;
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return;
    const bucket = map.get(date.toDateString());
    if (bucket) bucket.value += Number(row[amountKey]) || 0;
  });
  return buckets.map(({ label, value }) => ({ name: label, value: Math.round(value) }));
};

export const monthSeries = (rows, { dateKey = 'created_date', valueKey, months = 12 } = {}) => {
  const now = new Date();
  const buckets = [];
  for (let i = months - 1; i >= 0; i -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({ date, label: date.toLocaleDateString('en-GB', { month: 'short' }), value: 0, count: 0 });
  }
  const map = new Map(buckets.map((b) => [`${b.date.getFullYear()}-${b.date.getMonth()}`, b]));
  rows.forEach((row) => {
    const iso = row[dateKey];
    if (!iso) return;
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return;
    const bucket = map.get(`${date.getFullYear()}-${date.getMonth()}`);
    if (!bucket) return;
    bucket.count += 1;
    if (valueKey) bucket.value += Number(row[valueKey]) || 0;
  });
  return buckets.map(({ label, value, count }) => ({ name: label, value: Math.round(value || count) }));
};

export const percentChange = (current, previous) => {
  if (!previous) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 1000) / 10;
};

export const isToday = (iso) => {
  if (!iso) return false;
  const date = new Date(iso);
  const now = new Date();
  return date.toDateString() === now.toDateString();
};

export const isThisMonth = (iso) => {
  if (!iso) return false;
  const date = new Date(iso);
  const now = new Date();
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
};

export const topBy = (rows, key, max = 10) =>
  [...rows]
    .sort((a, b) => (Number(b[key]) || 0) - (Number(a[key]) || 0))
    .slice(0, max);

export const STATUS_GROUPS = {
  pending: { label: 'Pending', className: 'bg-amber-500/15 text-amber-500 border-amber-500/30' },
  approved: { label: 'Approved', className: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30' },
  rejected: { label: 'Rejected', className: 'bg-rose-500/15 text-rose-500 border-rose-500/30' },
  active: { label: 'Active', className: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30' },
  inactive: { label: 'Inactive', className: 'bg-slate-500/15 text-slate-400 border-slate-500/30' },
  suspended: { label: 'Suspended', className: 'bg-rose-500/15 text-rose-500 border-rose-500/30' },
  delivered: { label: 'Delivered', className: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30' },
  paid: { label: 'Paid', className: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30' },
  unpaid: { label: 'Unpaid', className: 'bg-amber-500/15 text-amber-500 border-amber-500/30' },
  refunded: { label: 'Refunded', className: 'bg-sky-500/15 text-sky-500 border-sky-500/30' },
  failed: { label: 'Failed', className: 'bg-rose-500/15 text-rose-500 border-rose-500/30' },
  success: { label: 'Success', className: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30' },
  completed: { label: 'Completed', className: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30' },
  cancelled: { label: 'Cancelled', className: 'bg-slate-500/15 text-slate-400 border-slate-500/30' },
  verified: { label: 'Verified', className: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30' },
  closed: { label: 'Closed', className: 'bg-slate-500/15 text-slate-400 border-slate-500/30' },
  open: { label: 'Open', className: 'bg-sky-500/15 text-sky-500 border-sky-500/30' },
  in_transit: { label: 'In Transit', className: 'bg-blue-500/15 text-blue-500 border-blue-500/30' },
  admin: { label: 'Admin', className: 'bg-violet-500/15 text-violet-500 border-violet-500/30' },
  artist: { label: 'Artist', className: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30' },
  buyer: { label: 'Buyer', className: 'bg-sky-500/15 text-sky-500 border-sky-500/30' },
  courier: { label: 'Courier', className: 'bg-orange-500/15 text-orange-500 border-orange-500/30' },
  user: { label: 'User', className: 'bg-slate-500/15 text-slate-400 border-slate-500/30' },
  free: { label: 'Free', className: 'bg-slate-500/15 text-slate-400 border-slate-500/30' },
  basic: { label: 'Basic', className: 'bg-sky-500/15 text-sky-500 border-sky-500/30' },
  premium: { label: 'Premium', className: 'bg-violet-500/15 text-violet-500 border-violet-500/30' },
};

export const statusFor = (value) => {
  const key = String(value ?? 'unknown').toLowerCase();
  return (
    STATUS_GROUPS[key] || {
      label: key,
      className: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
    }
  );
};