import React, { useState, useEffect, useRef } from 'react';
import { firebaseClient } from '@/api/firebaseClient';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Send, DollarSign, Check, CheckCheck, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function ConversationThread({ conversationId, otherUserEmail, otherUserName }) {
  const queryClient = useQueryClient();
  const [messageText, setMessageText] = useState('');
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [offerAmount, setOfferAmount] = useState('');
  const [user, setUser] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    firebaseClient.auth.isAuthenticated().then(async (authed) => {
      if (authed) {
        const me = await firebaseClient.auth.me();
        setUser(me);
      }
    });
  }, []);

  // Fetch messages for this conversation
  const { data: messages = [] } = useQuery({
    queryKey: ['conversation-messages', conversationId, user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const [sent, received] = await Promise.all([
        firebaseClient.entities.Message.filter(
          { conversation_id: conversationId, sender_email: user.email },
          'created_date',
          100
        ),
        firebaseClient.entities.Message.filter(
          { conversation_id: conversationId, recipient_email: user.email },
          'created_date',
          100
        ),
      ]);
      return Array.from(new Map([...sent, ...received].map((message) => [message.id, message])).values())
        .sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
    },
    enabled: Boolean(conversationId && user?.email),
  });

  // Subscribe to real-time message updates
  useEffect(() => {
    if (!conversationId || !user?.email) return undefined;
    const refresh = () => queryClient.invalidateQueries({ queryKey: ['conversation-messages', conversationId, user.email] });
    const unsubscribeSent = firebaseClient.entities.Message.subscribe(refresh, {
      where: { conversation_id: conversationId, sender_email: user.email },
      orderBy: 'created_date',
      limit: 100,
    });
    const unsubscribeReceived = firebaseClient.entities.Message.subscribe(refresh, {
      where: { conversation_id: conversationId, recipient_email: user.email },
      orderBy: 'created_date',
      limit: 100,
    });
    return () => {
      unsubscribeSent();
      unsubscribeReceived();
    };
  }, [conversationId, user?.email, queryClient]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark messages as read
  useEffect(() => {
    if (user && messages.length > 0) {
      const unreadMessages = messages.filter(
        m => m.recipient_email === user.email && !m.is_read
      );
      
      unreadMessages.forEach(msg => {
        firebaseClient.functions.invoke('markMessagesRead', { messageId: msg.id }).catch(() => {});
      });
    }
  }, [messages, user]);

  const sendMessageMutation = useMutation({
    mutationFn: async (data) => {
      await firebaseClient.entities.Message.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversation-messages', conversationId] });
      setMessageText('');
      setOfferAmount('');
      setShowOfferForm(false);
    },
    onError: (error) => {
      toast.error('Failed to send message');
    }
  });

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageText.trim() && !showOfferForm) return;

    const messageData = {
      conversation_id: conversationId,
      sender_email: user.email,
      sender_name: user.full_name,
      recipient_email: otherUserEmail,
      content: messageText,
      message_type: 'text'
    };

    sendMessageMutation.mutate(messageData);
  };

  const handleSendOffer = (e) => {
    e.preventDefault();
    if (!offerAmount || isNaN(offerAmount)) {
      toast.error('Please enter a valid amount');
      return;
    }

    const messageData = {
      conversation_id: conversationId,
      sender_email: user.email,
      sender_name: user.full_name,
      recipient_email: otherUserEmail,
      content: `Offering ZMW ${parseFloat(offerAmount).toLocaleString()}`,
      message_type: 'offer',
      offer_amount: parseFloat(offerAmount)
    };

    sendMessageMutation.mutate(messageData);
  };

  if (!user) return null;

  return (
    <div className="flex flex-col h-full bg-card rounded-xl border border-border">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground text-center">
              Start a conversation by sending a message
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.sender_email === user.email;
            return (
              <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs ${isOwn ? 'bg-primary text-primary-foreground' : 'bg-secondary'} rounded-xl p-3`}>
                  <p className="text-sm font-semibold mb-1">{msg.sender_name}</p>
                  
                  {msg.message_type === 'offer' ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 bg-black/10 rounded px-2 py-1">
                        <DollarSign className="w-4 h-4" />
                        <span className="font-bold">ZMW {msg.offer_amount.toLocaleString()}</span>
                      </div>
                      <p className="text-xs opacity-90">{msg.content}</p>
                    </div>
                  ) : (
                    <p className="text-sm break-words">{msg.content}</p>
                  )}
                  
                  <div className="flex items-center justify-between gap-2 mt-2 text-xs opacity-70">
                    <span>{format(new Date(msg.created_date), 'HH:mm')}</span>
                    {isOwn && (
                      msg.is_read ? (
                        <CheckCheck className="w-3 h-3" />
                      ) : (
                        <Check className="w-3 h-3" />
                      )
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area — sticky composer */}
      <div className="sticky bottom-0 bg-card border-t border-border p-4 space-y-3 sat-bottom">
        {showOfferForm ? (
          <form onSubmit={handleSendOffer} className="space-y-3">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground">Offer Amount (ZMW)</label>
              <Input
                type="number"
                min="0"
                step="100"
                value={offerAmount}
                onChange={(e) => setOfferAmount(e.target.value)}
                placeholder="Enter offer amount"
                className="font-body"
                autoFocus
              />
            </div>
            <Textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Add a message with your offer..."
              rows={2}
              className="font-body text-sm"
            />
            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={sendMessageMutation.isPending || !offerAmount}
                className="flex-1 rounded-full gap-2"
              >
                {sendMessageMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <DollarSign className="w-4 h-4" />
                )}
                Send Offer
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowOfferForm(false)}
                className="rounded-full"
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSendMessage} className="space-y-2">
            <Textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Type your message... (Shift+Enter for new line)"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
              rows={2}
              className="font-body text-sm resize-none"
            />
            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={sendMessageMutation.isPending || !messageText.trim()}
                className="flex-1 rounded-full gap-2"
              >
                {sendMessageMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Send
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowOfferForm(true)}
                className="rounded-full gap-2"
              >
                <DollarSign className="w-4 h-4" />
                Offer
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}