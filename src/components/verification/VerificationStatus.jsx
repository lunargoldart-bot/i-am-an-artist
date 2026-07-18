import React from "react";
import { firebaseClient } from "@/api/firebaseClient";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle, Clock, XCircle, Shield, Phone, CreditCard, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

export default function VerificationStatus({ onVerify }) {
  const { data: verification, isLoading } = useQuery({
    queryKey: ["user-verification"],
    queryFn: async () => {
      const user = await firebaseClient.auth.me();
      if (!user) return null;
      
      const verifications = await firebaseClient.entities.UserVerification.filter({ 
        user_email: user.email 
      }, "-created_date", 1);
      
      return verifications?.[0] || null;
    },
  });

  if (isLoading) {
    return (
      <div className="p-4 bg-muted/50 rounded-lg animate-pulse">
        <div className="h-4 bg-muted rounded w-1/2" />
      </div>
    );
  }

  if (!verification) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border border-primary/20"
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-display font-semibold text-lg">Verify Your Identity</h3>
            <p className="text-muted-foreground font-body text-sm mt-1">
              Complete NRC verification to access all platform features. Required for buying, selling, and auction participation.
            </p>
            <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <CreditCard className="w-3 h-3" />
                <span>Unique NRC</span>
              </div>
              <div className="flex items-center gap-1">
                <Phone className="w-3 h-3" />
                <span>One phone per user</span>
              </div>
            </div>
            <Button 
              onClick={onVerify}
              className="mt-4 rounded-full font-body text-sm"
              size="sm"
            >
              Start Verification
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  const statusConfig = {
    pending: {
      icon: Clock,
      color: "text-yellow-500",
      bg: "bg-yellow-500/10",
      border: "border-yellow-500/20",
      badge: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30",
      label: "Pending Review",
      message: "Your verification is being reviewed. This typically takes 24-48 hours.",
    },
    verified: {
      icon: CheckCircle,
      color: "text-green-500",
      bg: "bg-green-500/10",
      border: "border-green-500/20",
      badge: "bg-green-500/10 text-green-600 border-green-500/30",
      label: "Verified",
      message: "Your identity has been verified. You have full access to all platform features.",
    },
    rejected: {
      icon: XCircle,
      color: "text-destructive",
      bg: "bg-destructive/10",
      border: "border-destructive/20",
      badge: "bg-destructive/10 text-destructive border-destructive/30",
      label: "Not Approved",
      message: verification.rejection_reason || "Your verification was not approved.",
    },
  };

  const config = statusConfig[verification.verification_status];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-6 rounded-xl border ${config.bg} ${config.border}`}
    >
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-full ${config.bg} flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-6 h-6 ${config.color}`} />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-semibold text-lg">Identity Verification</h3>
            <Badge className={config.badge} variant="outline">
              {config.label}
            </Badge>
          </div>
          <p className="text-muted-foreground font-body text-sm mt-1">
            {config.message}
          </p>
          
          {verification.verification_status === "verified" && (
            <div className="space-y-3 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-background/50 rounded-lg">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <CreditCard className="w-3 h-3" />
                    <span>NRC Number</span>
                  </div>
                  <p className="font-semibold font-body text-sm">{verification.nrc_number}</p>
                </div>
                <div className="p-3 bg-background/50 rounded-lg">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <Phone className="w-3 h-3" />
                    <span>Phone Number</span>
                  </div>
                  <p className="font-semibold font-body text-sm">{verification.phone_number}</p>
                </div>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                <div className="flex items-center gap-2 text-xs text-primary mb-1">
                  <Briefcase className="w-3 h-3" />
                  <span>Artist Status</span>
                </div>
                <p className="font-semibold font-body text-sm">Verified Artist - Eligible for Payouts</p>
              </div>
            </div>
          )}

          {verification.verification_status === "rejected" && (
            <Button 
              onClick={onVerify}
              className="mt-4 rounded-full font-body text-sm"
              size="sm"
            >
              Resubmit Verification
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}