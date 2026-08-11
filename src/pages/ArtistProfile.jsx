import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import StickyActionBar from "@/components/ui/StickyActionBar";
import { User, MapPin, Instagram, Twitter, Facebook, Youtube, Globe, Music2, ArrowLeft, Eye, Heart, MessageCircle, Send, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import ArtworkCard from "../components/artwork/ArtworkCard";
import { UserService, ArtworkService } from "@/services";
import { firebaseClient } from "@/api/firebaseClient";
import { hapticMedium } from "@/utils/native";

const categoryEmoji = {
  painting: "ðŸŽ¨", sculpture: "ðŸ—¿", photography: "ðŸ“·", music: "ðŸŽµ",
  digital_art: "ðŸ’»", mixed_media: "ðŸŽ­", textile: "ðŸ§µ", pottery: "ðŸº", performance: "ðŸŽ¬",
};

const socialIcons = {
  instagram: Instagram,
  twitter: Twitter,
  facebook: Facebook,
  youtube: Youtube,
  tiktok: Music2,
};

export default function ArtistProfile() {
  const { id } = useParams();
  const [contactOpen, setContactOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const { data: artist, isLoading: loadingArtist } = useQuery({
    queryKey: ["artist", id],
    queryFn: () => UserService.filter({ id }),
    select: (data) => data?.[0],
  });

  const { data: artworks = [], isLoading: loadingArtworks } = useQuery({
    queryKey: ["artist-artworks", artist?.email],
    queryFn: () => ArtworkService.filter({ artist_email: artist.email }, "-created_date", 50),
    enabled: !!artist?.email,
    initialData: [],
  });

  const handleContact = async () => {
    if (!message.trim()) return;
    const authed = await firebaseClient.auth.isAuthenticated();
    if (!authed) {
      firebaseClient.auth.redirectToLogin();
      return;
    }
    const me = await firebaseClient.auth.me();
    if (!me) {
      firebaseClient.auth.redirectToLogin();
      return;
    }
    const sample = artworks[0];
    setSending(true);
    try {
      await firebaseClient.entities.Message.create({
        conversation_id: `${sample?.id || 'artist'}-${me.email}-${artist.email}`,
        artwork_id: sample?.id || null,
        artwork_title: sample?.title || `${artist.full_name}'s profile`,
        sender_email: me.email,
        sender_name: me.full_name,
        recipient_email: artist.email,
        content: message,
        message_type: 'text',
      });
      toast.success('Message sent!');
      setMessage('');
      setContactOpen(false);
    } catch {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  if (loadingArtist) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 animate-pulse">
        <div className="h-40 bg-muted rounded-2xl mb-6" />
        <div className="h-6 bg-muted rounded w-48 mb-3" />
        <div className="h-4 bg-muted rounded w-72" />
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-24 text-center">
        <p className="text-muted-foreground text-lg">Artist not found.</p>
        <Link to="/artists"><Button variant="outline" className="mt-4">Browse Artists</Button></Link>
      </div>
    );
  }

  const socialLinks = artist.social_links || {};
  const hasSocials = Object.values(socialLinks).some(Boolean);
  const totalViews = artworks.reduce((sum, a) => sum + (a.views || 0), 0);
  const totalLikes = artworks.reduce((sum, a) => sum + (a.likes || 0), 0);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Back */}
      <Link to="/artists" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Artists
      </Link>

      {/* Hero */}
      <div className="relative rounded-2xl overflow-hidden bg-card border border-border mb-8">
        {/* Banner */}
        <div className="h-36 green-gradient opacity-20" />
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-12">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full bg-muted border-4 border-background flex items-center justify-center overflow-hidden flex-shrink-0 shadow-lg">
              {artist.profile_image ? (
                <img src={artist.profile_image} alt={artist.full_name} className="w-full h-full object-cover" />
              ) : (
                <User className="w-10 h-10 text-muted-foreground" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="font-playfair text-2xl sm:text-3xl font-bold text-foreground">{artist.full_name}</h1>
                {artist.artist_category && (
                  <Badge className="bg-primary/15 text-primary border-primary/30 text-xs">
                    {categoryEmoji[artist.artist_category]} {artist.artist_category.replace(/_/g, " ")}
                  </Badge>
                )}
              </div>
              {artist.location && (
                <p className="text-muted-foreground text-sm flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {artist.location}
                </p>
              )}
            </div>

            {/* Stats */}
            <div className="flex gap-5 text-center">
              <div>
                <p className="text-lg font-bold text-foreground">{artworks.length}</p>
                <p className="text-xs text-muted-foreground">Works</p>
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">{totalViews.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-0.5 justify-center"><Eye className="w-3 h-3" /> Views</p>
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">{totalLikes.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-0.5 justify-center"><Heart className="w-3 h-3" /> Likes</p>
              </div>
            </div>
          </div>

          {/* Bio */}
          {artist.bio && (
            <p className="mt-5 text-muted-foreground text-sm leading-relaxed max-w-2xl">{artist.bio}</p>
          )}

          {/* Socials */}
          {hasSocials && (
            <div className="flex flex-wrap gap-3 mt-5">
              {Object.entries(socialLinks).map(([platform, url]) => {
                if (!url) return null;
                const Icon = socialIcons[platform] || Globe;
                return (
                  <a
                    key={platform}
                    href={url.startsWith("http") ? url : `https://${url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors border border-border hover:border-primary/40 rounded-full px-3 py-1.5"
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="capitalize">{platform}</span>
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Gallery */}
      <div>
        <h2 className="font-playfair text-xl font-bold text-foreground mb-5">
          Gallery <span className="text-muted-foreground text-base font-normal">({artworks.length} works)</span>
        </h2>

        {loadingArtworks ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : artworks.length === 0 ? (
          <div className="text-center py-16 border border-border rounded-xl">
            <p className="text-muted-foreground text-sm">No artworks uploaded yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {artworks.map((art, i) => (
              <ArtworkCard key={art.id} artwork={art} index={i} />
            ))}
          </div>
        )}
      </div>

      {/* Mobile + desktop sticky contact bar */}
      <StickyActionBar>
        <div className="max-w-5xl mx-auto p-4 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="font-display font-bold text-lg truncate">{artist.full_name}</p>
            <p className="text-xs text-muted-foreground font-body">{artworks.length} works Â· {totalLikes} likes</p>
          </div>
          <Button
            onClick={() => { hapticMedium(); setContactOpen(true); }}
            className="rounded-full gap-2 flex-shrink-0"
          >
            <MessageCircle className="w-5 h-5" /> Contact Artist
          </Button>
        </div>
      </StickyActionBar>

      {/* Contact dialog */}
      <Dialog open={contactOpen} onOpenChange={setContactOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Message {artist.full_name}</DialogTitle>
            <DialogDescription className="font-body">
              Start a conversation about their work.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={`Hi ${artist.full_name.split(' ')[0]}, I'm interested in your work...`}
            rows={4}
            className="font-body text-base resize-none"
            autoFocus
          />
          <div className="flex gap-3">
            <Button
              onClick={handleContact}
              disabled={sending || !message.trim()}
              className="flex-1 rounded-full gap-2"
            >
              {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              Send Message
            </Button>
            <Button variant="outline" onClick={() => setContactOpen(false)} className="rounded-full">
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
