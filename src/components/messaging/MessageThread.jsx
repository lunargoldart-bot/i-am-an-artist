import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Send, User, Clock, CheckCircle, DollarSign, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { format } from "date-fns";

export default function MessageThread({ artworkId, recipientEmail, currentUserEmail }) {
  const queryClient = useQueryClient();
  const [conversationId, setConversationId] = useState(null);

  // Generate conversation ID
  useEffect(() => {
    if (currentUserEmail) {
      const participants = [currentUserEmail, recipientEmail].sort();
      const convId = `${artworkId}_${participants[0]}_${participants[1]}`;
      setConversationId(convId);
    }
  }, [artworkId, recipientEmail, currentUserEmail]);

  const { data: messages, isLoading } = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: async () => {
      if (!conversationId) return [];
      const msgs = await base44.entities.Message.filter(
        { conversation_id: conversationId },
        "created_date",
        50
      );
      return msgs || [];
    },
    enabled: !!conversationId,
  });

  // Mark messages as read when viewing
  const markReadMutation = useMutation({
    mutationFn: async () => {
      if (conversationId) {
        await base44.functions.invoke('markMessagesRead', { conversation_id: conversationId });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
    },
  });

  useEffect(() => {
    if (messages && messages.length > 0) {
      markReadMutation.mutate();
    }
  }, [messages]);

  // Subscribe to new messages
  useEffect(() => {
    if (!conversationId) return;
    
    const unsubscribe = base44.entities.Message.subscribe((event) => {
      if (event.data?.conversation_id === conversationId) {
        queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
      }
    });

    return unsubscribe;
  }, [conversationId]);

  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
            <div className="bg-muted rounded-lg p-3 max-w-[70%] animate-pulse">
              <div className="h-4 w-32 bg-muted-foreground/20 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!messages || messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-center">
        <div>
          <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground font-body">No messages yet</p>
          <p className="text-xs text-muted-foreground mt-1">Start the conversation about this artwork</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-background">
      {messages.map((msg, index) => {
        const isOwn = msg.sender_email === currentUserEmail;
        const showAvatar = index === 0 || messages[index - 1]?.sender_email !== msg.sender_email;

        return (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex items-end gap-2 max-w-[80%] ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
              {showAvatar && !isOwn && (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-primary" />
                </div>
              )}
              {!showAvatar && !isOwn && <div className="w-8" />}

              <div>
                <div
                  className={`rounded-2xl px-4 py-2.5 ${
                    isOwn
                      ? 'bg-primary text-primary-foreground rounded-br-sm'
                      : 'bg-muted text-foreground rounded-bl-sm'
                  }`}
                >
                  {msg.message_type === "offer" && (
                    <div className="flex items-center gap-1 mb-1 text-xs font-semibold">
                      <DollarSign className="w-3 h-3" />
                      Offer: ZMW {msg.offer_amount?.toLocaleString()}
                    </div>
                  )}
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                </div>
                
                <div className={`flex items-center gap-2 mt-1 text-xs text-muted-foreground ${isOwn ? 'justify-end' : 'justify-start'}`}>
                  <span>{format(new Date(msg.created_date), 'HH:mm')}</span>
                  {isOwn && msg.is_read && (
                    <CheckCircle className="w-3 h-3 text-primary" />
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}