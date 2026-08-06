import { useState } from "react";
import { firebaseClient } from "@/api/firebaseClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function MessageInput({ artworkId, recipientEmail, artworkTitle, onSuccess }) {
  const [content, setContent] = useState("");
  const [messageType, setMessageType] = useState("text");
  const [offerAmount, setOfferAmount] = useState("");
  const [showOfferInput, setShowOfferInput] = useState(false);
  const queryClient = useQueryClient();

  const sendMutation = useMutation({
    mutationFn: async (data) => {
      return await firebaseClient.functions.invoke('sendMessage', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
      setContent("");
      setOfferAmount("");
      setShowOfferInput(false);
      setMessageType("text");
      toast.success("Message sent!");
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || "Failed to send message");
    },
  });

  const handleSend = () => {
    if (!content.trim()) return;

    sendMutation.mutate({
      artwork_id: artworkId,
      recipient_email: recipientEmail,
      content: content.trim(),
      message_type: messageType,
      offer_amount: messageType === "offer" ? parseFloat(offerAmount) : null,
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-border p-4 bg-card sat-bottom">
      {showOfferInput && (
        <div className="mb-3 p-3 bg-muted rounded-lg">
          <label className="text-xs text-muted-foreground mb-1 block">Offer Amount (ZMW)</label>
          <Input
            type="number"
            inputMode="numeric"
            value={offerAmount}
            onChange={(e) => setOfferAmount(e.target.value)}
            placeholder="Enter your offer"
            className="font-body"
          />
        </div>
      )}
      
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={messageType === "offer" ? "Enter your offer message..." : "Type a message..."}
            className="w-full min-h-[60px] max-h-[200px] resize-y rounded-lg border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring font-body"
            rows={2}
          />
        </div>
        <Button 
          onClick={handleSend} 
          disabled={sendMutation.isPending || !content.trim()}
          size="icon"
          className="rounded-full"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="flex items-center gap-2 mt-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            if (messageType === "offer") {
              setMessageType("text");
              setShowOfferInput(false);
            } else {
              setMessageType("offer");
              setShowOfferInput(true);
            }
          }}
          className={`text-xs ${messageType === "offer" ? 'text-primary' : 'text-muted-foreground'}`}
        >
          💰 Make Offer
        </Button>
        <span className="text-xs text-muted-foreground">
          Press Enter to send
        </span>
      </div>
    </div>
  );
}