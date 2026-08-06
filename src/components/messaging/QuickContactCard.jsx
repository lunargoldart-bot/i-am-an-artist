import React, { useState } from 'react';
import { firebaseClient } from '@/api/firebaseClient';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageCircle, Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function QuickContactCard({ artworkId, artworkTitle, artistEmail, artistName, onSuccess, open: controlledOpen, onOpenChange }) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = React.useState(null);

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = (v) => {
    if (controlledOpen === undefined) setInternalOpen(v);
    onOpenChange?.(v);
  };

  React.useEffect(() => {
    firebaseClient.auth.isAuthenticated().then(async (authed) => {
      if (authed) {
        const me = await firebaseClient.auth.me();
        setUser(me);
      }
    });
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !user) return;

    setLoading(true);
    try {
      // Match the conversation_id scheme used by sendMessage/MessageThread:
      // `${artwork_id || 'general'}_${participantA}_${participantB}` with emails sorted.
      const participants = [user.email, artistEmail].sort();
      const conversationId = `${artworkId || 'general'}_${participants[0]}_${participants[1]}`;

      await firebaseClient.entities.Message.create({
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
        className="w-full rounded-full gap-2 font-body h-11"
      >
        <MessageCircle className="w-5 h-5" />
        Contact Artist
      </Button>

      {open && (
        <div className="mt-3 p-4 rounded-xl border border-border bg-secondary/30 space-y-4">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={`Message ${artistName} about ${artworkTitle}...`}
            rows={3}
            className="font-body text-base"
          />
          <div className="flex gap-3">
            <Button
              onClick={handleSendMessage}
              disabled={loading || !message.trim()}
              className="flex-1 rounded-full gap-2 h-11"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
              Send Message
            </Button>
            <Button
              onClick={() => setOpen(false)}
              variant="outline"
              className="rounded-full h-11"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </>
  );
}