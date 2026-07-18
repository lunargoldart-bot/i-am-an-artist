import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { useQuery } from '@tanstack/react-query';
import ExhibitionCurator from '@/components/gallery/ExhibitionCurator';
import { ExhibitionService } from '@/services';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Palette, Calendar, Image as ImageIcon } from 'lucide-react';
import { format } from 'date-fns';

export default function MyExhibitions() {
  const { user } = useAuth();

  const { data: exhibitions = [] } = useQuery({
    queryKey: ['my-exhibitions', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return ExhibitionService.filter({ organizer_email: user.email }, '-created_date', 50);
    },
    enabled: !!user?.email
  });

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-3">
            <Palette className="w-8 h-8 text-primary" />
            <h1 className="font-playfair text-4xl font-bold text-foreground">
              My Virtual Exhibitions
            </h1>
          </div>
          <p className="text-muted-foreground max-w-2xl">
            Create immersive 3D digital galleries and curate your artworks into themed collections
          </p>
        </div>

        {/* Exhibition Curator */}
        <div className="mb-12">
          <ExhibitionCurator />
        </div>

        {/* Exhibition List */}
        {exhibitions.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-playfair font-bold text-foreground">Your Exhibitions</h2>
            <div className="grid gap-4">
              {exhibitions.map(exhibition => (
                <Card key={exhibition.id} className="p-4 border-border hover:border-gold/50 transition-colors">
                  <div className="flex gap-4">
                    {/* Cover Image */}
                    {exhibition.cover_image && (
                      <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-secondary">
                        <img
                          src={exhibition.cover_image}
                          alt={exhibition.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground text-lg mb-1">
                        {exhibition.title}
                      </h3>
                      {exhibition.description && (
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {exhibition.description}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <ImageIcon className="w-3 h-3" />
                          {exhibition.artwork_ids?.length || 0} artworks
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Created {format(new Date(exhibition.created_date), 'MMM d, yyyy')}
                        </span>
                      </div>

                      <div className="mt-3 flex gap-2">
                        <Link to={`/gallery/${exhibition.id}`}>
                          <Button size="sm" className="gold-gradient text-background">
                            View Gallery
                          </Button>
                        </Link>
                        <Button size="sm" variant="outline" className="border-border">
                          Edit
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}