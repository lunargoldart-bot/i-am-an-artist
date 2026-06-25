import { Calendar, MapPin, Ticket, Radio, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

const typeColors = {
  solo: 'bg-amber-500/20 text-amber-400',
  group: 'bg-blue-500/20 text-blue-400',
  auction: 'bg-gold/20 text-gold',
  live_performance: 'bg-pink-500/20 text-pink-400',
  virtual: 'bg-cyan-500/20 text-cyan-400',
};

export default function ExhibitionCard({ exhibition, onRegister }) {
  const cover = exhibition.cover_image || 'https://images.unsplash.com/photo-1531058020387-3be344556be6?w=600&h=400&fit=crop';
  const isLive = exhibition.status === 'live';

  return (
    <div className="gallery-card-hover bg-card border border-border rounded-lg overflow-hidden group">
      <div className="relative overflow-hidden h-48">
        <img src={cover} alt={exhibition.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        
        {isLive && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-red-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
            <Radio className="w-3 h-3 animate-pulse" /> LIVE NOW
          </div>
        )}

        <div className="absolute bottom-3 left-3 right-3">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeColors[exhibition.type] || 'bg-muted text-muted-foreground'}`}>
            {exhibition.type?.replace('_', ' ').toUpperCase()}
          </span>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-playfair font-semibold text-foreground mb-1 line-clamp-1">{exhibition.title}</h3>
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{exhibition.description}</p>

        <div className="space-y-1.5 mb-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="w-3 h-3 text-gold shrink-0" />
            {exhibition.start_date ? format(new Date(exhibition.start_date), 'MMM d, yyyy · h:mm a') : 'TBD'}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <MapPin className="w-3 h-3 text-gold shrink-0" />
            {exhibition.is_virtual ? 'Virtual Event' : (exhibition.venue || 'Venue TBD')}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Users className="w-3 h-3 text-gold shrink-0" />
            {exhibition.attendees_count || 0} registered
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            {exhibition.ticket_price_zmw > 0 ? (
              <p className="text-gold font-semibold text-sm">ZMW {exhibition.ticket_price_zmw.toLocaleString()}</p>
            ) : (
              <p className="text-green-400 text-sm font-semibold">Free Entry</p>
            )}
          </div>
          <Button size="sm" className="gold-gradient text-background font-semibold" onClick={() => onRegister?.(exhibition)}>
            <Ticket className="w-3 h-3 mr-1" />
            {isLive ? 'Watch Live' : 'Register'}
          </Button>
        </div>
      </div>
    </div>
  );
}