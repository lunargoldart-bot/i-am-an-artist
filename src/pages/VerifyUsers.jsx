import React from "react";
import { UserVerificationService } from "@/services";
import { functions } from "@/lib/firebase";
import { httpsCallable } from "firebase/functions";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Shield, Clock, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { toast } from "sonner";

export default function VerifyUsers() {
  const { data: verifications, isLoading, refetch } = useQuery({
    queryKey: ["pending-verifications"],
    queryFn: async () => {
      return UserVerificationService.filter({}, '-created_date', 100);
    },
  });

  const approveVerificationMutation = useMutation({
    mutationFn: async (params) => {
      const result = await httpsCallable(functions, 'approveVerification')(params);
      return result.data;
    },
    onSuccess: () => {
      refetch();
      toast.success("Verification approved");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to approve verification");
    },
  });

  const rejectVerificationMutation = useMutation({
    mutationFn: async (params) => {
      const result = await httpsCallable(functions, 'approveVerification')(params);
      return result.data;
    },
    onSuccess: () => {
      refetch();
      toast.success("Verification rejected");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to reject verification");
    },
  });

  const handleApprove = async (id, userEmail) => {
    approveVerificationMutation.mutate({
      verificationId: id,
      action: "approve",
    });
  };

  const handleReject = async (id, userEmail) => {
    const reason = prompt("Enter rejection reason:");
    if (!reason) return;
    
    rejectVerificationMutation.mutate({
      verificationId: id,
      action: "reject",
      notes: reason,
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card rounded-xl p-4 animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-6 h-6 text-primary" />
          <h1 className="font-display text-3xl font-bold">Identity Verifications</h1>
        </div>
        <p className="text-muted-foreground font-body">
          Review and approve user NRC verifications
        </p>
      </div>

      {verifications && verifications.length === 0 ? (
        <div className="text-center py-20">
          <div className="p-6 bg-muted/50 rounded-xl border border-border">
            <CheckCircle className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="font-display text-xl font-semibold mb-2">All Caught Up</h2>
            <p className="text-muted-foreground font-body">
              No pending verifications to review
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {verifications?.map((verification) => (
            <motion.div
              key={verification.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-xl p-6 border border-border"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-display font-semibold text-lg">{verification.full_name}</h3>
                    <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/30">
                      <Clock className="w-3 h-3 mr-1" />
                      Pending
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email:</span>
                      <span className="font-medium">{verification.user_email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">NRC:</span>
                      <span className="font-medium">{verification.nrc_number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Phone:</span>
                      <span className="font-medium">{verification.phone_number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Submitted:</span>
                      <span className="font-medium">
                        {format(new Date(verification.created_date), 'MMM d, yyyy HH:mm')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-2">
                    {verification.nrc_front_image && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">NRC Front</p>
                        <img 
                          src={verification.nrc_front_image} 
                          alt="NRC Front" 
                          className="w-full aspect-video object-cover rounded-lg border"
                        />
                      </div>
                    )}
                    {verification.nrc_back_image && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">NRC Back</p>
                        <img 
                          src={verification.nrc_back_image} 
                          alt="NRC Back" 
                          className="w-full aspect-video object-cover rounded-lg border"
                        />
                      </div>
                    )}
                    {verification.selfie_image && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Selfie</p>
                        <img 
                          src={verification.selfie_image} 
                          alt="Selfie" 
                          className="w-full aspect-video object-cover rounded-lg border"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={() => handleApprove(verification.id, verification.user_email)}
                      className="flex-1 rounded-full font-body"
                      size="sm"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleReject(verification.id, verification.user_email)}
                      variant="destructive"
                      className="flex-1 rounded-full font-body"
                      size="sm"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}