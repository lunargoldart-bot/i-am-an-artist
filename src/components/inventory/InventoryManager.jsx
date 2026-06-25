import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { 
  Eye, EyeOff, Package, AlertCircle, Loader2, Check, 
  Grid, DollarSign 
} from 'lucide-react';
import { toast } from 'sonner';

const STATUS_CONFIG = {
  available: { label: 'Available', color: 'bg-green-500/10 text-green-700', icon: Eye },
  sold: { label: 'Sold', color: 'bg-red-500/10 text-red-700', icon: EyeOff },
  reserved: { label: 'Reserved', color: 'bg-yellow-500/10 text-yellow-700', icon: AlertCircle },
  auction: { label: 'Auction', color: 'bg-blue-500/10 text-blue-700', icon: Package }
};

export default function InventoryManager() {
  const queryClient = useQueryClient();
  const [user, setUser] = React.useState(null);

  useEffect(() => {
    base44.auth.isAuthenticated().then(async (authed) => {
      if (authed) {
        const me = await base44.auth.me();
        setUser(me);
      }
    });
  }, []);

  const { data: artworks = [], isLoading } = useQuery({
    queryKey: ['my-artworks', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return base44.entities.Artwork.filter({ artist_email: user.email }, '-created_date', 100);
    },
    enabled: !!user?.email
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ artworkId, newStatus }) => 
      base44.entities.Artwork.update(artworkId, { status: newStatus }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-artworks'] });
      toast.success('Status updated successfully');
    },
    onError: () => toast.error('Failed to update status')
  });

  const handleStatusChange = (artworkId, newStatus) => {
    updateStatusMutation.mutate({ artworkId, newStatus });
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (artworks.length === 0) {
    return (
      <Card className="p-8 text-center border-border">
        <Package className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
        <p className="text-muted-foreground">No artworks yet. Start by uploading your first piece!</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        {artworks.map(artwork => (
          <Card key={artwork.id} className="p-4 border-border hover:border-border/70 transition-colors">
            <div className="flex gap-4">
              {/* Image */}
              <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-secondary">
                {artwork.image_urls?.[0] ? (
                  <img 
                    src={artwork.image_urls[0]} 
                    alt={artwork.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Grid className="w-6 h-6 text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="font-semibold text-foreground truncate">{artwork.title}</h3>
                    <p className="text-xs text-muted-foreground">{artwork.category}</p>
                  </div>
                  <Badge className={STATUS_CONFIG[artwork.status].color}>
                    {STATUS_CONFIG[artwork.status].label}
                  </Badge>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    ZMW {artwork.price?.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {artwork.views || 0} views
                  </span>
                </div>

                {/* Status Controls */}
                <div className="flex flex-wrap gap-2">
                  {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                    <Button
                      key={status}
                      onClick={() => handleStatusChange(artwork.id, status)}
                      variant={artwork.status === status ? 'default' : 'outline'}
                      size="sm"
                      className="text-xs"
                      disabled={updateStatusMutation.isPending}
                    >
                      {updateStatusMutation.isPending && updateStatusMutation.variables?.artworkId === artwork.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <>
                          {artwork.status === status && <Check className="w-3 h-3 mr-1" />}
                          {config.label}
                        </>
                      )}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}