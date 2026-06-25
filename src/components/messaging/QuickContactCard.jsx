import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageCircle, Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function QuickContactCard({ artworkId, artworkTitle, artistEmail, artistName, onSuccess }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    base44.auth.isAuthenticated().then(async (authed) => {
      if (authed) {
        const me = await base44.auth.me();
        setUser(me);
      }
    });
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !user) return;

    setLoading(true);
    try {
      const conversationId = `${artworkId}-${user.email}-${artistEmail}`;
      
      await base44.entities.Message.create({
        conversation_id: conversationId,
        artwork_id: artworkId,
        artwork_title: artworkTitle,
        sender_email: user.email,
        sender_name: user.full_name,
        recipient_email: artistEmail,
        content: message,
        message_type: 'text'
      });

      toast.success('Message sent!');
      setMessage('');
      setOpen(false);
      onSuccess?.();
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <>
      <Button
        onClick={() => setOpen(!open)}
        variant="outline"
        className="w-full rounded-full gap-2 font-body"
      >
        <MessageCircle className="w-4 h-4" />
        Contact Artist
      </Button>

      {open && (
        <div className="mt-3 p-4 rounded-xl border border-border bg-secondary/30 space-y-3">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={`Message ${artistName} about ${artworkTitle}...`}
            rows={3}
            className="font-body text-sm"
          />
          <div className="flex gap-2">
            <Button
              onClick={handleSendMessage}
              disabled={loading || !message.trim()}
              className="flex-1 rounded-full gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Send Message
            </Button>
            <Button
              onClick={() => setOpen(false)}
              variant="outline"
              className="rounded-full"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </>
  );
}