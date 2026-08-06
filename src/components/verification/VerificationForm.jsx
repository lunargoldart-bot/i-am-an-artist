import React, { useState, useEffect } from "react";
import { firebaseClient } from "@/api/firebaseClient";
import { useMutation } from "@tanstack/react-query";
import { X, CheckCircle, Camera, FileText, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Stepper from "@/components/ui/Stepper";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const STEPS = [
  { id: "identity", label: "Identity" },
  { id: "documents", label: "Documents" },
  { id: "review", label: "Review" },
];

export default function VerificationForm({ onSuccess }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    nrc_number: "",
    phone_number: "",
    full_name: "",
    date_of_birth: "",
  });
  const [images, setImages] = useState({
    nrc_front: null,
    nrc_back: null,
    selfie: null,
  });
  const [previews, setPreviews] = useState({
    nrc_front: null,
    nrc_back: null,
    selfie: null,
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  const uploadMutation = useMutation({
    mutationFn: async (file) => {
      const { file_url } = await firebaseClient.integrations.Core.UploadFile({ file, folder: 'verification' });
      return file_url;
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (data) => {
      const imageUrls = {};
      if (images.nrc_front) {
        imageUrls.nrc_front_image = await uploadMutation.mutateAsync(images.nrc_front);
      }
      if (images.nrc_back) {
        imageUrls.nrc_back_image = await uploadMutation.mutateAsync(images.nrc_back);
      }
      if (images.selfie) {
        imageUrls.selfie_image = await uploadMutation.mutateAsync(images.selfie);
      }

      return await firebaseClient.functions.invoke('submitVerification', {
        ...data,
        ...imageUrls,
      });
    },
    onSuccess: (response) => {
      toast.success(response.data.message || "Verification submitted successfully!");
      onSuccess?.();
    },
    onError: (error) => {
      const errorMsg = error.response?.data?.error || "Failed to submit verification";
      toast.error(errorMsg);
    },
  });

  const handleImageUpload = (type, file) => {
    if (file) {
      setImages(prev => ({ ...prev, [type]: file }));
      setPreviews(prev => ({ ...prev, [type]: URL.createObjectURL(file) }));
    }
  };

  const validateStep = (s) => {
    if (s === 0) {
      if (!form.full_name.trim()) { toast.error("Full name is required"); return false; }
      if (!form.date_of_birth) { toast.error("Date of birth is required"); return false; }
      if (!/^\d{6}\/\d{2}\/\d{1,2}$/.test(form.nrc_number)) { toast.error("Enter a valid NRC number (e.g. 123456/11/1)"); return false; }
      if (!/^\+260\d{9}$/.test(form.phone_number)) { toast.error("Enter a valid phone number (+26097XXXXXXX)"); return false; }
      return true;
    }
    if (s === 1) {
      const missing = [];
      if (!images.nrc_front) missing.push("NRC Front");
      if (!images.nrc_back) missing.push("NRC Back");
      if (!images.selfie) missing.push("Selfie");
      if (missing.length) { toast.error(`Please upload: ${missing.join(", ")}`); return false; }
      return true;
    }
    return true;
  };

  const next = () => {
    if (!validateStep(step)) return;
    setStep(s => Math.min(s + 1, STEPS.length - 1));
  };

  const back = () => setStep(s => Math.max(s - 1, 0));

  const ImageUpload = ({ type, label, preview }) => (
    <div className="space-y-2">
      <Label className="font-body text-sm">{label}</Label>
      <label className={`flex flex-col items-center justify-center w-full aspect-video rounded-lg border-2 border-dashed cursor-pointer transition-colors ${
        preview ? 'border-primary/50 bg-primary/5' : 'border-border hover:border-primary/50'
      }`}>
        {preview ? (
          <div className="relative w-full h-full">
            <img src={preview} alt={label} className="w-full h-full object-cover rounded-lg" />
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setImages(prev => ({ ...prev, [type]: null }));
                setPreviews(prev => ({ ...prev, [type]: null }));
              }}
              className="absolute top-2 right-2 p-1 bg-destructive text-white rounded-full hover:bg-destructive/90"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 p-6 text-muted-foreground">
            <Camera className="w-8 h-8" />
            <span className="font-body text-sm text-center">{label}</span>
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleImageUpload(type, e.target.files?.[0])}
        />
      </label>
    </div>
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateStep(step)) return;
    submitMutation.mutate(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 bg-muted/50 rounded-lg border border-border">
        <div className="flex items-start gap-3">
          <FileText className="w-5 h-5 text-primary mt-0.5" />
          <div>
            <p className="font-semibold font-body text-sm">Identity Verification Required</p>
            <p className="text-xs text-muted-foreground font-body mt-1">
              To comply with Zambian regulations and ensure platform security, we require NRC verification.
              Each phone number and NRC can only be registered to one account.
            </p>
          </div>
        </div>
      </div>

      <Stepper steps={STEPS} currentIndex={step} onStepClick={(i) => { if (i < step) setStep(i); }} />

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
        >
          {step === 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-body text-sm">Full Name (as on NRC) *</Label>
                <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder="Enter your full legal name" className="font-body" required inputMode="text" />
              </div>
              <div className="space-y-2">
                <Label className="font-body text-sm">Date of Birth *</Label>
                <Input type="date" value={form.date_of_birth} onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })} className="font-body" required />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label className="font-body text-sm">NRC Number * (Format: 123456/11/1)</Label>
                <Input value={form.nrc_number} onChange={(e) => setForm({ ...form, nrc_number: e.target.value })} placeholder="123456/11/1" className="font-body" pattern="\d{6}/\d{2}/\d{1,2}" required inputMode="numeric" />
                <p className="text-xs text-muted-foreground">Enter your National Registration Card number as it appears on your card</p>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label className="font-body text-sm">Phone Number * (Format: +260...)</Label>
                <Input value={form.phone_number} onChange={(e) => setForm({ ...form, phone_number: e.target.value })} placeholder="+26097XXXXXXX" className="font-body" pattern="\+260\d{9}" required inputMode="tel" />
                <p className="text-xs text-muted-foreground">One mobile number per user - this must be unique to your account</p>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <Label className="font-body text-sm font-semibold">Upload Documents</Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <ImageUpload type="nrc_front" label="NRC Front" preview={previews.nrc_front} />
                <ImageUpload type="nrc_back" label="NRC Back" preview={previews.nrc_back} />
                <ImageUpload type="selfie" label="Selfie (holding NRC)" preview={previews.selfie} />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="rounded-xl border border-border bg-card p-5 space-y-3">
              <h3 className="font-display font-semibold text-lg">Review your details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm font-body">
                <ReviewRow label="Full name" value={form.full_name} />
                <ReviewRow label="Date of birth" value={form.date_of_birth} />
                <ReviewRow label="NRC number" value={form.nrc_number} />
                <ReviewRow label="Phone" value={form.phone_number} />
              </div>
              <div className="grid grid-cols-3 gap-3 mt-3">
                {['nrc_front', 'nrc_back', 'selfie'].map((type) => (
                  <div key={type} className="aspect-square rounded-lg overflow-hidden bg-muted">
                    {previews[type] ? (
                      <img src={previews[type]} alt={type} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">{type.replace('_', ' ')}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="p-4 bg-muted/50 rounded-lg border border-border">
        <div className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
          <div>
            <p className="font-semibold font-body text-sm">What happens next?</p>
            <ul className="text-xs text-muted-foreground font-body mt-1 space-y-1 list-disc list-inside">
              <li>Your documents will be reviewed within 24-48 hours</li>
              <li>You'll receive an email when verification is complete</li>
              <li>Once verified, you can buy, sell, and auction artworks</li>
              <li>Your NRC and phone number are securely stored and unique to your account</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        {step > 0 && (
          <Button type="button" size="lg" variant="outline" onClick={back} className="rounded-full gap-2 w-32">
            <ChevronLeft className="w-5 h-5" /> Back
          </Button>
        )}
        {step < STEPS.length - 1 ? (
          <Button type="button" size="lg" onClick={next} className="flex-1 rounded-full gap-2">
            Continue <ChevronRight className="w-5 h-5" />
          </Button>
        ) : (
          <Button type="submit" size="lg" disabled={submitMutation.isPending || uploadMutation.isPending} className="flex-1 rounded-full font-body">
            {submitMutation.isPending ? <><Loader2 className="w-5 h-5 animate-spin" /> Submitting...</> : uploadMutation.isPending ? <><Loader2 className="w-5 h-5 animate-spin" /> Uploading...</> : "Submit Verification"}
          </Button>
        )}
      </div>
    </form>
  );
}

function ReviewRow({ label, value }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border/50 pb-1.5">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right break-all">{value || "—"}</span>
    </div>
  );
}