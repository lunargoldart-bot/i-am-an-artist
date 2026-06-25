import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { X, Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const categories = [
  "painting", "sculpture", "photography", "music", "digital_art",
  "mixed_media", "textile", "pottery", "fashion", "graphic_design",
  "writing", "film", "culinary", "illustration", "dance", "architecture"
];

export default function CollaborationRequestForm({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    collaborator_email: '',
    project_title: '',
    project_description: '',
    category: '',
    initiator_commission: 50,
    collaborator_commission: 50,
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = await base44.auth.me();
      
      await base44.entities.CollaborationRequest.create({
        ...form,
        initiator_email: user.email,
        initiator_name: user.full_name,
        initiator_commission: form.initiator_commission,
        collaborator_commission: form.collaborator_commission
      });

      toast.success('Collaboration request sent!');
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error(error.message || 'Failed to send request');
    } finally {
      setLoading(false);
    }
  };

  const totalCommission = form.initiator_commission + form.collaborator_commission;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-playfair font-bold text-lg text-foreground">
            Invite Collaborator
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label className="font-body text-sm">Collaborator Email *</Label>
            <Input
              type="email"
              placeholder="collaborator@example.com"
              value={form.collaborator_email}
              onChange={(e) => setForm({ ...form, collaborator_email: e.target.value })}
              required
              className="font-body"
            />
          </div>

          <div className="space-y-2">
            <Label className="font-body text-sm">Project Title *</Label>
            <Input
              placeholder="e.g. 'Spring Collection 2026'"
              value={form.project_title}
              onChange={(e) => setForm({ ...form, project_title: e.target.value })}
              required
              className="font-body"
            />
          </div>

          <div className="space-y-2">
            <Label className="font-body text-sm">Category *</Label>
            <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
              <SelectTrigger className="font-body">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat.replace(/_/g, ' ').charAt(0).toUpperCase() + cat.slice(1).replace(/_/g, ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="font-body text-sm">Project Description</Label>
            <Textarea
              placeholder="Tell them about the project vision..."
              value={form.project_description}
              onChange={(e) => setForm({ ...form, project_description: e.target.value })}
              rows={3}
              className="font-body text-sm"
            />
          </div>

          <div className="space-y-4 p-4 bg-secondary/50 rounded-lg border border-border">
            <div>
              <div className="flex justify-between items-center mb-2">
                <Label className="font-body text-sm">Your Commission: {form.initiator_commission}%</Label>
              </div>
              <Slider
                value={[form.initiator_commission]}
                onValueChange={(v) => setForm({
                  ...form,
                  initiator_commission: v[0],
                  collaborator_commission: 100 - v[0]
                })}
                min={10}
                max={90}
                step={5}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <Label className="font-body text-sm">Their Commission: {form.collaborator_commission}%</Label>
              </div>
              <div className="text-xs text-muted-foreground">
                Total: {totalCommission}% {totalCommission === 100 ? '✓' : `(set to 100%)`}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="font-body text-sm">Personal Message</Label>
            <Textarea
              placeholder="Why you'd like to collaborate with them..."
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              rows={2}
              className="font-body text-sm"
            />
          </div>

          <Button
            type="submit"
            disabled={loading || !form.collaborator_email || !form.project_title || !form.category || totalCommission !== 100}
            className="w-full rounded-full font-body gap-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Send Request
          </Button>
        </form>
      </div>
    </div>
  );
}