import React, { useState } from "react";
import { firebaseClient } from "@/api/firebaseClient";
import { useMutation } from "@tanstack/react-query";
import { X, Camera, FileText, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const artistCategories = [
  { value: "painting", label: "Painting" },
  { value: "sculpture", label: "Sculpture" },
  { value: "photography", label: "Photography" },
  { value: "music", label: "Music" },
  { value: "digital_art", label: "Digital Art" },
  { value: "mixed_media", label: "Mixed Media" },
  { value: "textile", label: "Textile" },
  { value: "pottery", label: "Pottery" },
  { value: "fashion", label: "Fashion" },
  { value: "graphic_design", label: "Graphic Design" },
  { value: "writing", label: "Writing" },
  { value: "film", label: "Film" },
  { value: "culinary", label: "Culinary" },
  { value: "illustration", label: "Illustration" },
  { value: "dance", label: "Dance" },
  { value: "architecture", label: "Architecture" },
  { value: "curators", label: "Curators" },
];

export default function ArtistVerificationForm({ onSuccess }) {
  const [step, setStep] = useState(1);
  const [identityForm, setIdentityForm] = useState({
    nrc_number: "",
    phone_number: "",
    full_name: "",
    date_of_birth: "",
  });
  const [portfolioForm, setPortfolioForm] = useState({
    artist_statement: "",
    years_experience: "",
    education: "",
    exhibitions: "",
    awards: "",
    website: "",
    instagram: "",
    categories: [],
  });
  const [images, setImages] = useState({
    nrc_front: null,
    nrc_back: null,
    selfie: null,
    portfolio_sample_1: null,
    portfolio_sample_2: null,
    portfolio_sample_3: null,
  });
  const [previews, setPreviews] = useState({
    nrc_front: null,
    nrc_back: null,
    selfie: null,
    portfolio_sample_1: null,
    portfolio_sample_2: null,
    portfolio_sample_3: null,
  });

  const uploadMutation = useMutation({
    mutationFn: async (file) => {
      const { file_url } = await firebaseClient.integrations.Core.UploadFile({ file, folder: 'verification' });
      return file_url;
    },
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      // Upload all images
      const imageUrls = {};
      const uploadPromises = [];

      if (images.nrc_front) uploadPromises.push(uploadMutation.mutateAsync(images.nrc_front).then(url => imageUrls.nrc_front_image = url));
      if (images.nrc_back) uploadPromises.push(uploadMutation.mutateAsync(images.nrc_back).then(url => imageUrls.nrc_back_image = url));
      if (images.selfie) uploadPromises.push(uploadMutation.mutateAsync(images.selfie).then(url => imageUrls.selfie_image = url));
      if (images.portfolio_sample_1) uploadPromises.push(uploadMutation.mutateAsync(images.portfolio_sample_1).then(url => imageUrls.portfolio_image_1 = url));
      if (images.portfolio_sample_2) uploadPromises.push(uploadMutation.mutateAsync(images.portfolio_sample_2).then(url => imageUrls.portfolio_image_2 = url));
      if (images.portfolio_sample_3) uploadPromises.push(uploadMutation.mutateAsync(images.portfolio_sample_3).then(url => imageUrls.portfolio_image_3 = url));

      await Promise.all(uploadPromises);

      // Submit identity verification
      await firebaseClient.functions.invoke('submitVerification', {
        ...identityForm,
        ...imageUrls,
      });

      // Update user profile with portfolio
      await firebaseClient.auth.updateMe({
        artist_statement: portfolioForm.artist_statement,
        years_experience: portfolioForm.years_experience,
        education: portfolioForm.education,
        exhibitions: portfolioForm.exhibitions,
        awards: portfolioForm.awards,
        website: portfolioForm.website,
        instagram: portfolioForm.instagram,
        artist_categories: portfolioForm.categories,
        role: "artist",
      });
    },
    onSuccess: () => {
      toast.success("Artist verification submitted successfully!");
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
    submitMutation.mutate();
  };

  const ImageUpload = ({ type, label, preview, required = false }) => (
    <div className="space-y-2">
      <Label className="font-body text-sm">{label} {required && <span className="text-destructive">*</span>}</Label>
      <label className={`flex flex-col items-center justify-center w-full aspect-square rounded-lg border-2 border-dashed cursor-pointer transition-colors ${
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
          <div className="flex flex-col items-center gap-2 p-4 text-muted-foreground">
            <Camera className="w-6 h-6" />
            <span className="font-body text-xs text-center">{label}</span>
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
      {/* Progress Steps */}
      <div className="flex items-center gap-2">
        <div className={`flex items-center gap-2 ${step >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
            step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted'
          }`}>1</div>
          <span className="text-sm font-body">Identity</span>
        </div>
        <div className={`w-12 h-0.5 ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
        <div className={`flex items-center gap-2 ${step >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
            step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted'
          }`}>2</div>
          <span className="text-sm font-body">Portfolio</span>
        </div>
      </div>

      {step === 1 && (
        <>
          <div className="p-4 bg-muted/50 rounded-lg border border-border">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="font-semibold font-body text-sm">Step 1: Identity Verification</p>
                <p className="text-xs text-muted-foreground font-body mt-1">
                  Verify your identity with your NRC to receive payments from artwork sales.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2 sm:col-span-2">
              <Label className="font-body text-sm">Full Name (as on NRC) *</Label>
              <Input
                value={identityForm.full_name}
                onChange={(e) => setIdentityForm({...identityForm, full_name: e.target.value})}
                placeholder="Enter your full legal name"
                className="font-body"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="font-body text-sm">Date of Birth *</Label>
              <Input
                type="date"
                value={identityForm.date_of_birth}
                onChange={(e) => setIdentityForm({...identityForm, date_of_birth: e.target.value})}
                className="font-body"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="font-body text-sm">Phone Number *</Label>
              <Input
                value={identityForm.phone_number}
                onChange={(e) => setIdentityForm({...identityForm, phone_number: e.target.value})}
                placeholder="+26097XXXXXXX"
                className="font-body"
                pattern="\+260\d{9}"
                required
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label className="font-body text-sm">NRC Number * (Format: 123456/11/1)</Label>
              <Input
                value={identityForm.nrc_number}
                onChange={(e) => setIdentityForm({...identityForm, nrc_number: e.target.value})}
                placeholder="123456/11/1"
                className="font-body"
                pattern="\d{6}/\d{2}/\d{1,2}"
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <Label className="font-body text-sm font-semibold">Upload Identity Documents</Label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <ImageUpload type="nrc_front" label="NRC Front" preview={previews.nrc_front} required />
              <ImageUpload type="nrc_back" label="NRC Back" preview={previews.nrc_back} required />
              <ImageUpload type="selfie" label="Selfie (holding NRC)" preview={previews.selfie} required />
            </div>
          </div>

          <Button 
            type="button" 
            size="lg" 
            onClick={() => setStep(2)}
            disabled={!identityForm.full_name || !identityForm.nrc_number || !identityForm.phone_number || !identityForm.date_of_birth}
            className="w-full rounded-full font-body"
          >
            Continue to Portfolio
          </Button>
        </>
      )}

      {step === 2 && (
        <>
          <div className="p-4 bg-muted/50 rounded-lg border border-border">
            <div className="flex items-start gap-3">
              <Briefcase className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="font-semibold font-body text-sm">Step 2: Professional Portfolio</p>
                <p className="text-xs text-muted-foreground font-body mt-1">
                  Share your artistic background and upload work samples to build your profile.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="font-body text-sm">Artist Categories *</Label>
              <div className="flex flex-wrap gap-2">
                {artistCategories.map((c) => {
                  const isSelected = portfolioForm.categories.includes(c.value);
                  const isMaxReached = portfolioForm.categories.length >= 3 && !isSelected;
                  return (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          setPortfolioForm({...portfolioForm, categories: portfolioForm.categories.filter(cat => cat !== c.value)});
                        } else if (!isMaxReached) {
                          setPortfolioForm({...portfolioForm, categories: [...portfolioForm.categories, c.value]});
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
              <p className="text-xs text-muted-foreground">
                Select up to 3 categories ({portfolioForm.categories.length}/3)
              </p>
            </div>

            <div className="space-y-2">
              <Label className="font-body text-sm">Artist Statement *</Label>
              <Textarea
                value={portfolioForm.artist_statement}
                onChange={(e) => setPortfolioForm({...portfolioForm, artist_statement: e.target.value})}
                placeholder="Tell us about your art, inspiration, and creative journey..."
                className="font-body"
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-body text-sm">Years of Experience</Label>
                <Input
                  value={portfolioForm.years_experience}
                  onChange={(e) => setPortfolioForm({...portfolioForm, years_experience: e.target.value})}
                  placeholder="e.g., 5 years"
                  className="font-body"
                />
              </div>

              <div className="space-y-2">
                <Label className="font-body text-sm">Education/Training</Label>
                <Input
                  value={portfolioForm.education}
                  onChange={(e) => setPortfolioForm({...portfolioForm, education: e.target.value})}
                  placeholder="e.g., Evelyn Hone College, Self-taught"
                  className="font-body"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="font-body text-sm">Exhibitions/Shows</Label>
              <Textarea
                value={portfolioForm.exhibitions}
                onChange={(e) => setPortfolioForm({...portfolioForm, exhibitions: e.target.value})}
                placeholder="List any exhibitions, shows, or public displays of your work..."
                className="font-body"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label className="font-body text-sm">Awards/Recognition</Label>
              <Textarea
                value={portfolioForm.awards}
                onChange={(e) => setPortfolioForm({...portfolioForm, awards: e.target.value})}
                placeholder="Any awards, grants, or recognition you've received..."
                className="font-body"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-body text-sm">Website</Label>
                <Input
                  value={portfolioForm.website}
                  onChange={(e) => setPortfolioForm({...portfolioForm, website: e.target.value})}
                  placeholder="https://yourwebsite.com"
                  className="font-body"
                />
              </div>

              <div className="space-y-2">
                <Label className="font-body text-sm">Instagram</Label>
                <Input
                  value={portfolioForm.instagram}
                  onChange={(e) => setPortfolioForm({...portfolioForm, instagram: e.target.value})}
                  placeholder="@yourhandle"
                  className="font-body"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Label className="font-body text-sm font-semibold">Portfolio Samples (Optional)</Label>
            <p className="text-xs text-muted-foreground">
              Upload up to 3 images of your best work to showcase on your profile
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <ImageUpload type="portfolio_sample_1" label="Sample 1" preview={previews.portfolio_sample_1} />
              <ImageUpload type="portfolio_sample_2" label="Sample 2" preview={previews.portfolio_sample_2} />
              <ImageUpload type="portfolio_sample_3" label="Sample 3" preview={previews.portfolio_sample_3} />
            </div>
          </div>

          <div className="flex gap-3">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => setStep(1)}
              className="flex-1 rounded-full font-body"
            >
              Back
            </Button>
            <Button 
              type="submit" 
              size="lg" 
              disabled={submitMutation.isPending || !portfolioForm.categories.length || !portfolioForm.artist_statement}
              className="flex-1 rounded-full font-body"
            >
              {submitMutation.isPending ? "Submitting..." : "Submit Verification"}
            </Button>
          </div>
        </>
      )}
    </form>
  );
}