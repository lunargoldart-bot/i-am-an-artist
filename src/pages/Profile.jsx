import React, { useState, useEffect } from "react";
import { authService, ArtworkService } from "@/services";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Palette, Edit3, Diamond, Megaphone, Crown, Users, Plus, KeyRound, Trash2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Link } from "react-router-dom";
import ArtworkCard from "../components/artwork/ArtworkCard";
import EliteFeatureQueue from "../components/elite/EliteFeatureQueue";
import ManageAds from "../components/ads/ManageAds";
import VerificationStatus from "../components/verification/VerificationStatus";
import ProfileMonetization from "../components/monetization/ProfileMonetization";
import ArtistVerificationForm from "../components/verification/ArtistVerificationForm";
import CollaborationManager from "../components/collaboration/CollaborationManager";
import CollaborationRequestForm from "../components/collaboration/CollaborationRequestForm";
import { requestIntroReplay } from "@/lib/intro";
import { changePassword } from "@/lib/firebaseAuth";
import { useAuth } from "@/lib/AuthContext";
import { functions } from "@/lib/firebase";
import { httpsCallable } from "firebase/functions";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const artistCategories = [
  { value: "painting", label: "Painting" },
  { value: "sculpture", label: "Sculpture" },
  { value: "photography", label: "Photography" },
  { value: "music", label: "Music" },
  { value: "digital_art", label: "Digital Art" },
  { value: "mixed_media", label: "Mixed Media" },
  { value: "textile", label: "Textile" },
  { value: "performance", label: "Performance" },
  { value: "fashion", label: "Fashion" },
  { value: "curators", label: "Curators" },
];

export default function Profile() {
  const queryClient = useQueryClient();
  const { logout } = useAuth();
  const [editing, setEditing] = useState(false);
  const [verificationOpen, setVerificationOpen] = useState(false);
  const [collaborationFormOpen, setCollaborationFormOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: "", next: "", confirm: "" });
  const [passwordState, setPasswordState] = useState({ loading: false, error: "", done: false });
  const [deleteState, setDeleteState] = useState({ loading: false, error: "" });
  const [profileForm, setProfileForm] = useState({
    bio: "", location: "", phone: "", artist_categories: [],
    social_links: { instagram: "", facebook: "", twitter: "", tiktok: "", youtube: "" },
  });

  const { data: user } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        if (!currentUser) {
          return null;
        }
        return currentUser;
      } catch (error) {
        console.error('Failed to fetch user:', error);
        return null;
      }
    },
    retry: 1,
  });

  const { data: myArtworks = [], refetch: refetchArtworks } = useQuery({
    queryKey: ["my-artworks", user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return ArtworkService.filter({ artist_email: user.email }, "-created_date", 50);
    },
    enabled: !!user?.email,
    initialData: [],
  });

  useEffect(() => {
    if (user) {
      setProfileForm({
        bio: user.bio || "",
        location: user.location || "",
        phone: user.phone || "",
        artist_categories: user.artist_categories || [],
        social_links: user.social_links || { instagram: "", facebook: "", twitter: "", tiktok: "", youtube: "" },
      });
    }
  }, [user]);

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      return authService.updateUserProfile(data);
    },
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(["me"], updatedUser);
      setEditing(false);
      toast.success("Profile updated!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update profile");
    },
  });

  const handleSave = () => {
    updateMutation.mutate({ ...profileForm, role: "artist" });
  };

  const submitChangePassword = async (event) => {
    event.preventDefault();
    setPasswordState({ loading: true, error: "", done: false });
    try {
      if (passwordForm.next.length < 6) throw new Error("New password must be at least 6 characters.");
      if (passwordForm.next !== passwordForm.confirm) throw new Error("New passwords do not match.");
      await changePassword(passwordForm.current, passwordForm.next);
      setPasswordState({ loading: false, error: "", done: true });
      toast.success("Password updated!");
    } catch (err) {
      setPasswordState({ loading: false, error: err.message || "Failed to change password", done: false });
      toast.error(err.message || "Failed to change password");
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteState({ loading: true, error: "" });
    try {
      const callable = httpsCallable(functions, "deleteUserAccount");
      await callable({});
      toast.success("Account deleted. Goodbye!");
      await logout(true);
    } catch (err) {
      setDeleteState({ loading: false, error: err.message || "Failed to delete account. Please contact support." });
      toast.error(err.message || "Failed to delete account");
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-start gap-6 mb-8">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
          {user.profile_image ? (
            <img src={user.profile_image} alt={user.full_name} className="w-full h-full object-cover" />
          ) : (
            <User className="w-8 h-8 text-muted-foreground" />
          )}
        </div>
        <div className="flex-1">
          <h1 className="font-display text-2xl sm:text-3xl font-bold">{user.full_name}</h1>
          <p className="text-muted-foreground font-body text-sm">{user.email}</p>
          {user.artist_categories && user.artist_categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {user.artist_categories.map((cat) => (
                <span key={cat} className="text-primary font-body text-xs capitalize bg-primary/10 px-2 py-1 rounded-full">
                  {cat.replace(/_/g, " ")}
                </span>
              ))}
            </div>
          )}
          {user.artist_statement && <p className="text-muted-foreground font-body text-sm mt-2 italic">"{user.artist_statement}"</p>}
          {user.bio && <p className="text-muted-foreground font-body text-sm mt-2">{user.bio}</p>}
        </div>
        <Button variant="outline" size="sm" onClick={() => setEditing(!editing)} className="font-body gap-1">
          <Edit3 className="w-3 h-3" /> Edit
        </Button>
        <Button variant="ghost" size="sm" onClick={requestIntroReplay} className="font-body gap-1 text-muted-foreground" aria-label="Replay the cinematic intro">
          Replay intro
        </Button>
      </div>

      {/* Identity Verification Section */}
      <div className="mb-8">
        <VerificationStatus onVerify={() => setVerificationOpen(true)} />
      </div>

      {/* Verification Dialog */}
      <Dialog open={verificationOpen} onOpenChange={setVerificationOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Identity Verification</DialogTitle>
          </DialogHeader>
          <ArtistVerificationForm onSuccess={() => {
            setVerificationOpen(false);
            queryClient.invalidateQueries({ queryKey: ["user-verification", "me"] });
          }} />
        </DialogContent>
      </Dialog>

      {editing && (
        <div className="mb-8 p-6 rounded-xl border border-border bg-card space-y-4">
          <h3 className="font-display text-lg font-semibold">Edit Profile</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2 sm:col-span-2">
              <Label className="font-body">Bio</Label>
              <Textarea value={profileForm.bio} onChange={(e) => setProfileForm({...profileForm, bio: e.target.value})} placeholder="Tell us about yourself..." className="font-body" rows={3} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label className="font-body">Art Categories (max 3)</Label>
              <div className="flex flex-wrap gap-2">
                {artistCategories.map((c) => {
                  const isSelected = profileForm.artist_categories.includes(c.value);
                  const isMaxReached = profileForm.artist_categories.length >= 3 && !isSelected;
                  return (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          setProfileForm({...profileForm, artist_categories: profileForm.artist_categories.filter(cat => cat !== c.value)});
                        } else if (!isMaxReached) {
                          setProfileForm({...profileForm, artist_categories: [...profileForm.artist_categories, c.value]});
                        }
                      }}
                      disabled={isMaxReached}
                      className={`px-3 py-1.5 rounded-full text-xs font-body transition-all ${
                        isSelected 
                          ? 'bg-primary text-primary-foreground' 
                          : isMaxReached 
                            ? 'bg-muted text-muted-foreground cursor-not-allowed opacity-50'
                            : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                      }`}
                    >
                      {c.label}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {profileForm.artist_categories.length}/3 selected
              </p>
            </div>
            <div className="space-y-2">
              <Label className="font-body">Location</Label>
              <Input value={profileForm.location} onChange={(e) => setProfileForm({...profileForm, location: e.target.value})} placeholder="Lusaka, Zambia" className="font-body" />
            </div>
            <div className="space-y-2">
              <Label className="font-body">Phone</Label>
               <Input value={profileForm.phone} onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})} placeholder="+260..." type="tel" inputMode="telephone" className="font-body" />
            </div>
          </div>
          <h4 className="font-display font-semibold text-sm mt-4">Social Links</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {["instagram", "facebook", "twitter", "tiktok", "youtube"].map((platform) => (
              <div key={platform} className="space-y-1">
                <Label className="font-body text-xs capitalize">{platform}</Label>
                <Input
                  value={profileForm.social_links[platform] || ""}
                  onChange={(e) => setProfileForm({
                    ...profileForm,
                    social_links: { ...profileForm.social_links, [platform]: e.target.value }
                  })}
                  placeholder={`Your ${platform} link`}
                  className="font-body text-sm"
                />
              </div>
            ))}
          </div>
          <div className="flex gap-3 pt-2">
            <Button onClick={handleSave} disabled={updateMutation.isPending} className="font-body">
              {updateMutation.isPending ? "Saving..." : "Save Profile"}
            </Button>
            <Button variant="outline" onClick={() => setEditing(false)} className="font-body">Cancel</Button>
          </div>
        </div>
      )}

      {/* Account settings */}
      <div className="mb-8 p-6 rounded-xl border border-border bg-card space-y-4">
        <h3 className="font-display text-lg font-semibold flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-primary" /> Account
        </h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="outline" className="font-body" onClick={() => setChangePasswordOpen(true)}>
            <KeyRound className="w-4 h-4 mr-2" /> Change password
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="font-body text-destructive hover:text-destructive">
                <Trash2 className="w-4 h-4 mr-2" /> Delete account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="font-display text-xl">Delete your account?</AlertDialogTitle>
                <AlertDialogDescription className="font-body text-sm">
                  This permanently deletes your profile and personal data (wishlists, messages, preferences, verification submissions and other content you own). Sales, payment, transaction and payout records connected to your activity are retained but anonymised for legal and accounting reasons. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              {deleteState.error && <p className="text-sm text-destructive font-body">{deleteState.error}</p>}
              <AlertDialogFooter>
                <AlertDialogCancel className="font-body">Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteAccount} disabled={deleteState.loading} className="font-body bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  {deleteState.loading ? "Deleting..." : "Yes, delete my account"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        <p className="text-xs text-muted-foreground font-body">
          See how deletion is handled (including retention) on our{" "}
          <Link to="/delete-account" className="text-primary hover:underline inline-flex items-center gap-0.5">
            account deletion page <ExternalLink className="w-3 h-3" />
          </Link>. Read the{" "}
          <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link> and{" "}
          <Link to="/terms" className="text-primary hover:underline">Terms &amp; Conditions</Link>.
        </p>
      </div>

      {/* Change password dialog */}
      <Dialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Change password</DialogTitle>
            <DialogDescription className="font-body text-sm">
              Enter your current password and a new one. Available for email/password accounts.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submitChangePassword} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="font-body">Current password</Label>
              <Input type="password" value={passwordForm.current} onChange={(e) => setPasswordForm((p) => ({ ...p, current: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label className="font-body">New password</Label>
              <Input type="password" minLength={6} value={passwordForm.next} onChange={(e) => setPasswordForm((p) => ({ ...p, next: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label className="font-body">Confirm new password</Label>
              <Input type="password" minLength={6} value={passwordForm.confirm} onChange={(e) => setPasswordForm((p) => ({ ...p, confirm: e.target.value }))} required />
            </div>
            {passwordState.error && <p className="text-sm text-destructive font-body">{passwordState.error}</p>}
            <div className="flex justify-end gap-2">
              <Button variant="outline" className="font-body" onClick={() => setChangePasswordOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={passwordState.loading} className="font-body green-gradient text-primary-foreground">
                {passwordState.loading ? "Updating..." : "Update password"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Tabs defaultValue="monetize">
        <TabsList>
          <TabsTrigger value="monetize" className="font-body flex items-center gap-1">
            <Crown className="w-3 h-3" /> Monetize Profile
          </TabsTrigger>
          <TabsTrigger value="artworks" className="font-body">My Artworks ({myArtworks.length})</TabsTrigger>
          <TabsTrigger value="collaborate" className="font-body flex items-center gap-1">
            <Users className="w-3 h-3" /> Collaborate
          </TabsTrigger>
          {(user?.subscription_tier === 'pro' || user?.subscription_tier === 'elite') && (
            <TabsTrigger value="ads" className="font-body flex items-center gap-1">
              <Megaphone className="w-3 h-3" /> Sponsored Ads
            </TabsTrigger>
          )}
          {user?.subscription_tier === 'elite' && (
            <TabsTrigger value="feature_queue" className="font-body flex items-center gap-1">
              <Diamond className="w-3 h-3 text-primary" /> Feature Queue
            </TabsTrigger>
          )}
        </TabsList>
        <TabsContent value="monetize" className="mt-6">
          <ProfileMonetization />
        </TabsContent>
        <TabsContent value="artworks" className="mt-6">
          {myArtworks.length === 0 ? (
            <div className="text-center py-16">
              <Palette className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="font-display text-xl font-semibold">No artworks yet</h3>
              <p className="text-muted-foreground font-body text-sm mt-2">List your first artwork and start earning</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {myArtworks.map((art, i) => (
                <ArtworkCard key={art.id} artwork={art} index={i} />
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="collaborate" className="mt-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-playfair font-semibold text-lg text-foreground">Collaborations</h3>
            <Button onClick={() => setCollaborationFormOpen(true)} className="rounded-full gap-2 font-body">
              <Plus className="w-4 h-4" /> Invite Collaborator
            </Button>
          </div>
          <CollaborationManager />
        </TabsContent>
        {(user?.subscription_tier === 'pro' || user?.subscription_tier === 'elite') && (
          <TabsContent value="ads" className="mt-6">
            <ManageAds />
          </TabsContent>
        )}
        {user?.subscription_tier === 'elite' && (
          <TabsContent value="feature_queue" className="mt-6">
            <EliteFeatureQueue />
          </TabsContent>
        )}
      </Tabs>

      {collaborationFormOpen && (
        <CollaborationRequestForm
          onClose={() => setCollaborationFormOpen(false)}
          onSuccess={() => queryClient.invalidateQueries({ key: ['collaboration-requests'] })}
        />
      )}
    </div>
  );
}
