import { cn } from '@/lib/utils';
import { statusFor } from '@/lib/adminData';

export default function StatusBadge({ value, className }) {
  const { label, className: tone } = statusFor(value);
  return (
    <span
      className={cn(
        'inline-flex items-center whitespace-nowrap rounded-full border px-2 py-0.5 text-xs font-medium capitalize',
        tone,
        className,
      )}
    >
      {label}
    </span>
  );
}