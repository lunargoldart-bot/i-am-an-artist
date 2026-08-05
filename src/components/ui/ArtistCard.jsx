import { Link } from 'react-router-dom';
import { Star, Users, ShoppingBag, CheckCircle } from 'lucide-react';

const categoryIcons = {
  painting: '🎨',
  sculpture: '🗿',
  music: '🎵',
  photography: '📸',
  digital_art: '💻',
  crafts: '🧶',
  performance: '🎭',
};

export default function ArtistCard({ artist, rank }) {
  const avatar = artist.profile_image || `https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200&h=200&fit=crop&crop=face`;

  return (
    <Link to={`/artist/${artist.id}`} className="gallery-card-hover bg-card border border-border rounded-lg overflow-hidden group p-4 sm:p-5 flex items-center gap-4 cursor-pointer">
      {rank && (
        <div className={`text-xl font-playfair font-bold shrink-0 w-8 text-center ${rank <= 3 ? 'text-gold' : 'text-muted-foreground'}`}>
          {rank <= 3 ? ['🥇','🥈','🥉'][rank-1] : `#${rank}`}
        </div>
      )}

      <div className="relative shrink-0">
        <img src={avatar} alt={artist.display_name} className="w-12 h-12 rounded-full object-cover border-2 border-border group-hover:border-gold transition-colors" />
        <span className="absolute -bottom-1 -right-1 text-base">{categoryIcons[artist.category] || '🎨'}</span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <h3 className="font-playfair font-semibold text-sm text-foreground truncate">{artist.display_name}</h3>
          {artist.is_verified && <CheckCircle className="w-4 h-4 text-gold shrink-0" />}
        </div>
        <p className="text-xs text-muted-foreground capitalize">{artist.category?.replace('_',' ')} · {artist.location || 'Zambia'}</p>
        <div className="flex items-center gap-3 mt-1">
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="w-4 h-4" /> {(artist.followers_count || 0).toLocaleString()}
          </span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <ShoppingBag className="w-4 h-4" /> {(artist.total_sales || 0).toLocaleString()} sales
          </span>
        </div>
      </div>

      <div className="shrink-0 text-right">
        <div className="flex items-center gap-0.5 text-gold">
          <Star className="w-4 h-4 fill-gold" />
          <span className="text-xs font-semibold">{(artist.ranking_score || 0).toFixed(1)}</span>
        </div>
      </div>
    </Link>
  );
}