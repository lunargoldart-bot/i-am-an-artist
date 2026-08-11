import { Heart, Eye, MessageCircle, Zap } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const categoryColors = {
  breaking: 'bg-red-500/20 text-red-400',
  exhibition: 'bg-amber-500/20 text-amber-400',
  artist_spotlight: 'bg-primary/20 text-primary',
  auction: 'bg-purple-500/20 text-purple-400',
  community: 'bg-green-500/20 text-green-400',
  achievement: 'bg-blue-500/20 text-blue-400',
};

export default function NewsCard({ item, featured }) {
  const image = item.image || 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=600&h=400&fit=crop';

  if (featured) {
    return (
      <div className="gallery-card-hover bg-card border border-border rounded-lg overflow-hidden group relative">
        <div className="relative h-64 overflow-hidden">
          <img src={image} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
          {item.category === 'breaking' && (
            <div className="absolute top-3 left-3 flex items-center gap-1 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded">
              <Zap className="w-3 h-3" /> BREAKING
            </div>
          )}
          <div className="absolute bottom-4 left-4 right-4">
            <span className={`text-xs px-2 py-0.5 rounded font-medium ${categoryColors[item.category] || 'bg-muted text-muted-foreground'}`}>
              {item.category?.replace('_', ' ').toUpperCase()}
            </span>
            <h3 className="font-playfair font-bold text-white text-lg mt-1.5 line-clamp-2">{item.title}</h3>
          </div>
        </div>
        <div className="p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-muted overflow-hidden">
              {item.author_image ? <img src={item.author_image} alt="" className="w-full h-full object-cover" /> : null}
            </div>
            <span className="text-xs text-muted-foreground">{item.author_name}</span>
            <span className="text-xs text-muted-foreground">Â·</span>
            <span className="text-xs text-muted-foreground">{item.created_date ? formatDistanceToNow(new Date(item.created_date), { addSuffix: true }) : 'Recently'}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="flex items-center gap-0.5 text-xs"><Eye className="w-3 h-3" />{item.views_count || 0}</span>
            <span className="flex items-center gap-0.5 text-xs"><Heart className="w-3 h-3" />{item.likes_count || 0}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="gallery-card-hover bg-card border border-border rounded-lg overflow-hidden group flex gap-3 p-3">
      <div className="relative w-20 h-20 rounded-md overflow-hidden shrink-0">
        <img src={image} alt={item.title} className="w-full h-full object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${categoryColors[item.category] || 'bg-muted text-muted-foreground'}`}>
          {item.category?.replace('_', ' ')}
        </span>
        <h3 className="font-playfair font-semibold text-foreground text-sm mt-0.5 line-clamp-2">{item.title}</h3>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-muted-foreground">{item.author_name}</span>
          <span className="flex items-center gap-0.5 text-xs text-muted-foreground"><Eye className="w-3 h-3" />{item.views_count || 0}</span>
        </div>
      </div>
    </div>
  );
}