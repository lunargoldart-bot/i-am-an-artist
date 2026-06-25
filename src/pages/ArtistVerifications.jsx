import React, { useState, useEffect } from "react";
import { authService, UserVerificationService } from "@/services";
import { functions } from "@/lib/firebase";
import { httpsCallable } from "firebase/functions";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle, XCircle, Clock, User, CreditCard, Phone, 
  Mail, Briefcase, Palette, Award, ExternalLink, Image 
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function ArtistVerifications() {
  const queryClient = useQueryClient();
  const [selectedVerification, setSelectedVerification] = React.useState(null);
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    authService.isAuthenticated().then(async (authed) => {
      if (authed) {
        const me = await authService.getCurrentUser();
        setUser(me);
      }
    });
  }, []);

  const { data: verifications = [], isLoading } = useQuery({
    queryKey: ["artist-verifications"],
    queryFn: () => UserVerificationService.filter({}, "-createdAt", 50),
    initialData: [],
  });

  const approveMutation = useMutation({
    mutationFn: async ({ verificationId, verificationData }) => {
      // Update verification status
      await UserVerificationService.update(verificationId, {
        verification_status: "verified",
        verification_date: new Date().toISOString(),
      });

      // Update user role and artist status
      const currentUser = await authService.getCurrentUser();
      if (currentUser) {
        await authService.updateUserProfile({
          role: "artist",
          is_verified_artist: true,
        });
      }

      // Send approval email via cloud function
      await httpsCallable(functions, 'sendEmail')({
        to: verificationData.user_email,
        subject: "Artist Verification Approved - Welcome to Zartia!",
        body: `Dear ${verificationData.full_name},\n\nCongratulations! Your artist verification has been approved.\n\nYou now have full access to:\n- Sell artworks with secure escrow payments\n- Instant payment release upon delivery confirmation\n- Professional artist profile\n- Access to Pro and Elite membership tiers\n\nStart listing your artworks today!\n\nBest regards,\nZartia Team`
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["artist-verifications"] });
      setSelectedVerification(null);
      toast.success("Artist verification approved!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to approve verification");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ verificationId, reason }) => {
      await UserVerificationService.update(verificationId, {
        verification_status: "rejected",
        rejection_reason: reason,
      });
    },
    onSuccess: (_, { verificationId }) => {
      queryClient.invalidateQueries({ queryKey: ["artist-verifications"] });
      setSelectedVerification(null);
      toast.success("Verification rejected");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to reject verification");
    },
  });

  const handleApprove = (verification) => {
    if (window.confirm(`Approve verification for ${verification.full_name}?`)) {
      approveMutation.mutate({ 
        verificationId: verification.id, 
        verificationData: verification 
      });
    }
  };

  const handleReject = (verification) => {
    const reason = prompt("Enter rejection reason:");
    if (reason) {
      rejectMutation.mutate({ verificationId: verification.id, reason });
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 text-center">
        <XCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
        <h3 className="font-display text-xl font-semibold">Access Denied</h3>
        <p className="text-muted-foreground font-body text-sm mt-2">
          Only administrators can access this page
        </p>
      </div>
    );
  }

  const pendingVerifications = verifications.filter(v => v.verification_status === 'pending');

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-10">
        <h1 className="font-display text-3xl sm:text-4xl font-bold">Artist Verifications</h1>
        <p className="text-muted-foreground font-body mt-2">
          Review and approve artist verification submissions
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="h-32 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : pendingVerifications.length === 0 ? (
        <div className="text-center py-20">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h3 className="font-display text-xl font-semibold">All Caught Up!</h3>
          <p className="text-muted-foreground font-body text-sm mt-2">
            No pending verifications
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingVerifications.map((verification) => (
            <div key={verification.id} className="p-5 rounded-xl border border-border bg-card">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-display font-semibold text-lg">{verification.full_name}</h3>
                    <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/30">
                      <Clock className="w-3 h-3 mr-1" />
                      Pending
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3 h-3" />
                      <span>{verification.user_email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3 h-3" />
                      <span>{verification.phone_number}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-3 h-3" />
                      <span>NRC: {verification.nrc_number}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-3 h-3" />
                      <span>DOB: {verification.date_of_birth}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedVerification(verification)}
                    className="font-body"
                  >
                    <Image className="w-4 h-4 mr-2" />
                    Review
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleApprove(verification)}
                    disabled={approveMutation.isPending}
                    className="font-body bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleReject(verification)}
                    disabled={rejectMutation.isPending}
                    className="font-body"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Verification Detail Dialog */}
      <Dialog open={!!selectedVerification} onOpenChange={() => setSelectedVerification(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              Verification Review - {selectedVerification?.full_name}
            </DialogTitle>
          </DialogHeader>

          {selectedVerification && (
            <div className="space-y-6">
              {/* Identity Section */}
              <div>
                <h3 className="font-display font-semibold text-lg mb-3 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Identity Documents
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {selectedVerification.nrc_front_image && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">NRC Front</p>
                      <img
                        src={selectedVerification.nrc_front_image}
                        alt="NRC Front"
                        className="w-full rounded-lg border border-border"
                      />
                    </div>
                  )}
                  {selectedVerification.nrc_back_image && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">NRC Back</p>
                      <img
                        src={selectedVerification.nrc_back_image}
                        alt="NRC Back"
                        className="w-full rounded-lg border border-border"
                      />
                    </div>
                  )}
                  {selectedVerification.selfie_image && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Selfie</p>
                      <img
                        src={selectedVerification.selfie_image}
                        alt="Selfie"
                        className="w-full rounded-lg border border-border"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Artist Portfolio Section */}
              <div>
                <h3 className="font-display font-semibold text-lg mb-3 flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  Artist Portfolio
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="font-body text-sm">{selectedVerification.user_email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Phone</p>
                      <p className="font-body text-sm">{selectedVerification.phone_number}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">NRC Number</p>
                      <p className="font-body text-sm">{selectedVerification.nrc_number}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Full Name</p>
                      <p className="font-body text-sm">{selectedVerification.full_name}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-border">
                <Button
                  onClick={() => handleApprove(selectedVerification)}
                  disabled={approveMutation.isPending}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {approveMutation.isPending ? "Approving..." : "Approve Verification"}
                </Button>
                <Button
                  onClick={() => handleReject(selectedVerification)}
                  disabled={rejectMutation.isPending}
                  variant="destructive"
                  className="flex-1"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  {rejectMutation.isPending ? "Rejecting..." : "Reject"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}