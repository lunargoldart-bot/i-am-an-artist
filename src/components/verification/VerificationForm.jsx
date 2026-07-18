import React, { useState } from "react";
import { firebaseClient } from "@/api/firebaseClient";
import { useMutation } from "@tanstack/react-query";
import { X, CheckCircle, Camera, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function VerificationForm({ onSuccess }) {
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

  const uploadMutation = useMutation({
    mutationFn: async (file) => {
      const { file_url } = await firebaseClient.integrations.Core.UploadFile({ file, folder: 'verification' });
      return file_url;
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (data) => {
      // Upload images first
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

  const handleSubmit = (e) => {
    e.preventDefault();
    submitMutation.mutate(form);
  };

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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="font-body text-sm">Full Name (as on NRC) *</Label>
          <Input
            value={form.full_name}
            onChange={(e) => setForm({...form, full_name: e.target.value})}
            placeholder="Enter your full legal name"
            className="font-body"
            required
          />
        </div>

        <div className="space-y-2">
          <Label className="font-body text-sm">Date of Birth *</Label>
          <Input
            type="date"
            value={form.date_of_birth}
            onChange={(e) => setForm({...form, date_of_birth: e.target.value})}
            className="font-body"
            required
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label className="font-body text-sm">NRC Number * (Format: 123456/11/1)</Label>
          <Input
            value={form.nrc_number}
            onChange={(e) => setForm({...form, nrc_number: e.target.value})}
            placeholder="123456/11/1"
            className="font-body"
            pattern="\d{6}/\d{2}/\d{1,2}"
            required
          />
          <p className="text-xs text-muted-foreground">
            Enter your National Registration Card number as it appears on your card
          </p>
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label className="font-body text-sm">Phone Number * (Format: +260...)</Label>
          <Input
            value={form.phone_number}
            onChange={(e) => setForm({...form, phone_number: e.target.value})}
            placeholder="+26097XXXXXXX"
            className="font-body"
            pattern="\+260\d{9}"
            required
          />
          <p className="text-xs text-muted-foreground">
            One mobile number per user - this must be unique to your account
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <Label className="font-body text-sm font-semibold">Upload Documents</Label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <ImageUpload 
            type="nrc_front" 
            label="NRC Front" 
            preview={previews.nrc_front} 
          />
          <ImageUpload 
            type="nrc_back" 
            label="NRC Back" 
            preview={previews.nrc_back} 
          />
          <ImageUpload 
            type="selfie" 
            label="Selfie (holding NRC)" 
            preview={previews.selfie} 
          />
        </div>
      </div>

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

      <Button 
        type="submit" 
        size="lg" 
        disabled={submitMutation.isPending || uploadMutation.isPending}
        className="w-full rounded-full font-body"
      >
        {submitMutation.isPending ? "Submitting..." : uploadMutation.isPending ? "Uploading..." : "Submit Verification"}
      </Button>
    </form>
  );
}