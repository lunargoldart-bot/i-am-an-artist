import React, { useState, useEffect } from "react";
import { authService, MessageService } from "@/services";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Mail, User, MessageSquare, Clock, DollarSign, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { format } from "date-fns";

export default function Messages() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all"); // all, unread, sent, received
  const [currentUser, setCurrentUser] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    authService.getCurrentUser().then(setCurrentUser).catch(() => setCurrentUser(null));
  }, []);

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["messages-all", currentUser?.email],
    queryFn: async () => {
      if (!currentUser?.email) return [];
      const [sent, received] = await Promise.all([
        MessageService.filter({ sender_email: currentUser.email }, "-created_date", 100),
        MessageService.filter({ recipient_email: currentUser.email }, "-created_date", 100),
      ]);
      return Array.from(new Map([...sent, ...received].map((message) => [message.id, message])).values())
        .sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    },
    enabled: Boolean(currentUser?.email),
  });

  useEffect(() => {
    if (!currentUser?.email) return undefined;
    const refresh = () => queryClient.invalidateQueries({ queryKey: ['messages-all', currentUser.email] });
    const unsubscribeSent = MessageService.subscribe(refresh, {
      where: { sender_email: currentUser.email },
      orderBy: '-created_date',
      limit: 100,
    });
    const unsubscribeReceived = MessageService.subscribe(refresh, {
      where: { recipient_email: currentUser.email },
      orderBy: '-created_date',
      limit: 100,
    });
    return () => {
      unsubscribeSent();
      unsubscribeReceived();
    };
  }, [currentUser?.email, queryClient]);

  // Group messages by conversation
  const conversations = React.useMemo(() => {
    if (!messages) return [];
    
    const grouped = {};
    messages.forEach(msg => {
      if (!grouped[msg.conversation_id]) {
        grouped[msg.conversation_id] = {
          conversation_id: msg.conversation_id,
          artwork_id: msg.artwork_id,
          artwork_title: msg.artwork_title,
          other_user_email: msg.sender_email === currentUser?.email ? msg.recipient_email : msg.sender_email,
          other_user_name: msg.sender_email === currentUser?.email ? (msg.recipient_name || msg.recipient_email) : (msg.sender_name || msg.sender_email),
          last_message: msg,
          unread_count: 0,
          messages: [],
        };
      }
      grouped[msg.conversation_id].messages.push(msg);
      if (msg.recipient_email === currentUser?.email && !msg.is_read) {
        grouped[msg.conversation_id].unread_count++;
      }
      // Keep the most recent message
      if (new Date(msg.created_date) > new Date(grouped[msg.conversation_id].last_message.created_date)) {
        grouped[msg.conversation_id].last_message = msg;
      }
    });
    
    return Object.values(grouped);
  }, [messages, currentUser?.email]);

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.artwork_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         conv.other_user_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === "unread") return matchesSearch && conv.unread_count > 0;
    if (filter === "sent") return matchesSearch && conv.last_message.sender_email === currentUser?.email;
    if (filter === "received") return matchesSearch && conv.last_message.sender_email !== currentUser?.email;
    return matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-card rounded-xl p-4 animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <Link to="/explore" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 font-body">
          <ArrowLeft className="w-4 h-4" /> Back to gallery
        </Link>
        <div className="flex items-center gap-2 mb-2">
          <Mail className="w-6 h-6 text-primary" />
          <h1 className="font-display text-3xl font-bold">Messages</h1>
        </div>
        <p className="text-muted-foreground font-body">
          Communicate with artists and collectors about artworks
        </p>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Search conversations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="font-body"
        />
        <div className="flex gap-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
            className="font-body text-xs"
          >
            All
          </Button>
          <Button
            variant={filter === "unread" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("unread")}
            className="font-body text-xs"
          >
            Unread
          </Button>
        </div>
      </div>

      {filteredConversations.length === 0 ? (
        <div className="text-center py-20">
          <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="font-display text-xl font-semibold mb-2">No conversations yet</h2>
          <p className="text-muted-foreground font-body mb-4">
            Start a conversation by contacting an artist about their artwork
          </p>
          <Link to="/explore">
            <Button className="rounded-full font-body">
              Browse Artworks
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredConversations.map((conv) => (
            <motion.div
              key={conv.conversation_id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-xl p-4 hover:bg-card/80 transition-colors cursor-pointer border border-border"
            >
              <Link to={`/artwork/${conv.artwork_id}?open_messages=true`} className="block">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold font-display truncate">{conv.other_user_name}</p>
                        {conv.unread_count > 0 && (
                          <Badge className="bg-primary text-primary-foreground text-xs">
                            {conv.unread_count} new
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {format(new Date(conv.last_message.created_date), 'MMM d, HH:mm')}
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground font-body truncate mb-1">
                      {conv.artwork_title && (
                        <span className="text-primary">About: {conv.artwork_title}</span>
                      )}
                    </p>
                    
                    <div className="flex items-center gap-2">
                      {conv.last_message.message_type === "offer" && (
                        <Badge variant="outline" className="text-xs">
                          <DollarSign className="w-3 h-3 mr-1" />
                          ZMW {conv.last_message.offer_amount?.toLocaleString()}
                        </Badge>
                      )}
                      <p className="text-sm text-muted-foreground font-body truncate flex-1">
                        {conv.last_message.content}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}