import React, { useState } from 'react';
import { firebaseClient } from '@/api/firebaseClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Plus, Check, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function ExhibitionCurator() {
  const queryClient = useQueryClient();
  const [user, setUser] = React.useState(null);
  const [selectedArtworks, setSelectedArtworks] = React.useState([]);
  const [showForm, setShowForm] = React.useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'virtual'
  });
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    firebaseClient.auth.isAuthenticated().then(async (authed) => {
      if (authed) {
        const me = await firebaseClient.auth.me();
        setUser(me);
      }
    });
  }, []);

  const { data: myArtworks = [] } = useQuery({
    queryKey: ['my-artworks-curator', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return firebaseClient.entities.Artwork.filter({ 
        artist_email: user.email,
        status: 'available'
      }, '-created_date', 100);
    },
    enabled: !!user?.email
  });

  const createExhibitionMutation = useMutation({
    mutationFn: async (data) => {
      const startDate = new Date();
      const endDate = new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000);
      
      return firebaseClient.entities.Exhibition.create({
        title: data.title,
        description: data.description,
        type: 'virtual',
        category: 'digital_art',
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        organizer_name: user.full_name,
        organizer_email: user.email,
        status: 'live',
        artwork_ids: data.artwork_ids,
        cover_image: myArtworks.find(a => a.id === data.artwork_ids[0])?.image_urls?.[0]
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exhibitions'] });
      toast.success('Virtual exhibition created!');
      setShowForm(false);
      setSelectedArtworks([]);
      setFormData({ title: '', description: '', type: 'virtual' });
    },
    onError: () => toast.error('Failed to create exhibition')
  });

  const handleCreateExhibition = async () => {
    if (!formData.title || selectedArtworks.length === 0) {
      toast.error('Add a title and select at least 1 artwork');
      return;
    }

    setLoading(true);
    try {
      await createExhibitionMutation.mutateAsync({
        title: formData.title,
        description: formData.description,
        artwork_ids: selectedArtworks
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleArtwork = (id) => {
    setSelectedArtworks(prev =>
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-playfair font-bold text-foreground">Create Virtual Exhibition</h2>
          <p className="text-sm text-muted-foreground mt-1">Curate your artworks into a 3D digital gallery</p>
        </div>
        {!showForm && (
          <Button
            onClick={() => setShowForm(true)}
            className="gold-gradient text-background font-semibold gap-2"
          >
            <Plus className="w-4 h-4" />
            New Exhibition
          </Button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <Card className="p-6 border-border bg-card">
          <div className="space-y-4 mb-6">
            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">
                Exhibition Title
              </label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., 'My Summer Collection'"
                className="bg-background border-border"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">
                Description (Optional)
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Tell visitors about this collection..."
                className="h-20 bg-background border-border"
              />
            </div>
          </div>

          {/* Artwork Selection */}
          <div className="mb-6">
            <p className="text-sm font-semibold text-foreground mb-3">
              Select Artworks ({selectedArtworks.length})
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-64 overflow-y-auto p-2">
              {myArtworks.length === 0 ? (
                <div className="col-span-full text-center py-6">
                  <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No available artworks</p>
                </div>
              ) : (
                myArtworks.map(artwork => (
                  <button
                    key={artwork.id}
                    onClick={() => toggleArtwork(artwork.id)}
                    className={`relative rounded-lg overflow-hidden border-2 transition-all ${
                      selectedArtworks.includes(artwork.id)
                        ? 'border-gold ring-2 ring-gold/50'
                        : 'border-border hover:border-gold/50'
                    }`}
                  >
                    <img
                      src={artwork.image_urls?.[0]}
                      alt={artwork.title}
                      className="w-full aspect-square object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Check className="w-6 h-6 text-gold" />
                    </div>
                    {selectedArtworks.includes(artwork.id) && (
                      <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-gold flex items-center justify-center">
                        <Check className="w-4 h-4 text-background" />
                      </div>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              onClick={handleCreateExhibition}
              className="flex-1 gold-gradient text-background font-semibold"
              disabled={loading || !formData.title || selectedArtworks.length === 0}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                'Create Exhibition'
              )}
            </Button>
            <Button
              onClick={() => setShowForm(false)}
              variant="outline"
              className="border-border"
            >
              Cancel
            </Button>
          </div>
        </Card>
      )}

      {/* Info Box */}
      {!showForm && myArtworks.length === 0 && (
        <Card className="p-4 border-yellow-500/50 bg-yellow-500/5">
          <p className="text-sm text-yellow-700">
            You need available artworks to create an exhibition. Upload your first piece in the Inventory section.
          </p>
        </Card>
      )}
    </div>
  );
}