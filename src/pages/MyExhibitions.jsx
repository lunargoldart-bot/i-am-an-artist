import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ExhibitionCurator from '@/components/gallery/ExhibitionCurator';
import { ExhibitionService } from '@/services';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Palette, Calendar, Image as ImageIcon, Edit, Trash2, Loader2, X, Check } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function MyExhibitions() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', description: '' });
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [loading, setLoading] = useState(false);

  const { data: exhibitions = [], isLoading } = useQuery({
    queryKey: ['my-exhibitions', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return ExhibitionService.filter({ organizer_email: user.email }, '-created_date', 50);
    },
    enabled: !!user?.email
  });

  const updateExhibitionMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      return ExhibitionService.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-exhibitions'] });
      toast.success('Exhibition updated successfully');
    },
    onError: () => toast.error('Failed to update exhibition'),
  });

  const deleteExhibitionMutation = useMutation({
    mutationFn: async (id) => {
      return ExhibitionService.del(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-exhibitions'] });
      toast.success('Exhibition deleted successfully');
    },
    onError: () => toast.error('Failed to delete exhibition'),
  });

  const handleEditStart = (exhibition) => {
    setEditing(exhibition);
    setEditForm({ title: exhibition.title, description: exhibition.description || '' });
  };

  const handleEditCancel = () => {
    setEditing(null);
    setEditForm({ title: '', description: '' });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editForm.title.trim()) {
      toast.error('Exhibition title is required');
      return;
    }
    setLoading(true);
    try {
      await updateExhibitionMutation.mutateAsync({
        id: editing.id,
        data: {
          title: editForm.title,
          description: editForm.description,
          updated_date: new Date().toISOString(),
        },
      });
      handleEditCancel();
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirm = async (id) => {
    setLoading(true);
    try {
      await deleteExhibitionMutation.mutateAsync(id);
    } finally {
      setDeleteConfirm(null);
      setLoading(false);
    }
  };

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
                <Card key={exhibition.id} className="p-4 border-border hover:border-primary/50 transition-colors relative">
                  {editing?.id === exhibition.id ? (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-playfair font-semibold text-foreground">Edit Exhibition</h3>
                        <button 
                          onClick={handleEditCancel}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <form onSubmit={handleEditSubmit} className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-foreground mb-1 block">Title</label>
                          <input
                            type="text"
                            value={editForm.title}
                            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                            placeholder="Exhibition title"
                            className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-foreground mb-1 block">Description</label>
                          <textarea
                            value={editForm.description}
                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                            placeholder="Exhibition description"
                            rows={3}
                            className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground resize-none"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
                          >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                          </button>
                          <button
                            type="button"
                            onClick={handleEditCancel}
                            className="px-4 py-2 bg-secondary text-foreground rounded-md hover:bg-secondary/80 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  ) : deleteConfirm === exhibition.id ? (
                    <div className="space-y-4">
                      <h3 className="text-lg font-playfair font-semibold text-foreground">Confirm Deletion</h3>
                      <p className="text-sm text-muted-foreground">
                        Are you sure you want to delete <strong>{exhibition.title}</strong>? This action cannot be undone.
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDeleteConfirm(exhibition.id)}
                          disabled={loading}
                          className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors disabled:opacity-50"
                        >
                          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete'}
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="px-4 py-2 bg-secondary text-foreground rounded-md hover:bg-secondary/80 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
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
                            <Button size="sm" className="green-gradient text-primary-foreground">
                              View Gallery
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-border hover:border-primary"
                            onClick={() => handleEditStart(exhibition)}
                          >
                            <Edit className="w-3 h-3 mr-1" /> Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-destructive/50 text-destructive hover:border-destructive"
                            onClick={() => setDeleteConfirm(exhibition.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}

        {exhibitions.length === 0 && !isLoading && (
          <div className="text-center py-20">
            <div className="p-6 bg-muted/50 rounded-xl border border-border">
              <Palette className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="font-display text-xl font-semibold mb-2">No Virtual Exhibitions Yet</h2>
              <p className="text-muted-foreground font-body">
                Create your first virtual exhibition to showcase your artworks to the world.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}