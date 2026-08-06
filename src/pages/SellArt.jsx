import React, { useState, useEffect } from "react";
import { authService, ArtworkService } from "@/services";
import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Stepper from "@/components/ui/Stepper";
import { ImagePlus, Sparkles, ShoppingBag, Gavel, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import PriceSuggestion from "@/components/artwork/PriceSuggestion";
import { hapticSelection } from "@/utils/native";

const categories = [
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

const STEPS = [
  { id: "image", label: "Image" },
  { id: "details", label: "Details" },
  { id: "pricing", label: "Pricing" },
];

export default function SellArt() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    title: "", description: "", category: "", price: "",
    medium: "", dimensions: "", year_created: "", artist_name: "",
    is_auction: false, auction_duration: "7",
  });
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Auto scroll to top between steps
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const createMutation = useMutation({
    mutationFn: async (data) => {
      setUploading(true);
      let image_urls = [];
      if (imageFile) {
        const currentUser = await authService.getCurrentUser();
        if (!currentUser?.uid) throw new Error('Authentication required');
        const storageRef = ref(storage, `artworks/${currentUser.uid}/${crypto.randomUUID()}-${imageFile.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`);
        const snap = await uploadBytes(storageRef, imageFile);
        const file_url = await getDownloadURL(snap.ref);
        image_urls = [file_url];
      }

      const user = await authService.getCurrentUser();
      const auctionEndDate = data.is_auction
        ? new Date(Date.now() + parseInt(data.auction_duration) * 24 * 60 * 60 * 1000).toISOString()
        : null;

      await ArtworkService.create({
        ...data,
        price: parseFloat(data.price),
        image_urls,
        artist_email: user.email,
        artist_name: data.artist_name || user.full_name,
        status: data.is_auction ? "auction" : "available",
        auction_end_date: auctionEndDate,
      });

      return { is_auction: data.is_auction };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["artworks-explore"] });
      toast.success(result.is_auction ? "Auction started! Collectors can now bid." : "Artwork listed! It's now available for collectors.");
      navigate("/explore");
    },
    onSettled: () => setUploading(false),
  });

  const validateStep = (s) => {
    if (s === 0) {
      if (!imageFile) { toast.error("Please add an image of your artwork"); return false; }
      return true;
    }
    if (s === 1) {
      if (!form.title.trim()) { toast.error("Title is required"); return false; }
      if (!form.artist_name.trim()) { toast.error("Artist name is required"); return false; }
      if (!form.category) { toast.error("Please choose a category"); return false; }
      return true;
    }
    if (s === 2) {
      if (!form.price || parseFloat(form.price) <= 0) { toast.error("Please set a valid price"); return false; }
      return true;
    }
    return true;
  };

  const next = () => {
    hapticSelection();
    if (!validateStep(step)) return;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const back = () => {
    hapticSelection();
    setStep((s) => Math.max(s - 1, 0));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateStep(2)) return;
    createMutation.mutate(form);
  };

  const inputClass = "font-body";
  const field = (label, children, helper) => (
    <div className="space-y-2">
      <Label className="font-body">{label}</Label>
      {children}
      {helper && <p className="text-xs text-muted-foreground font-body">{helper}</p>}
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h1 className="font-display text-3xl font-bold">List Your Work</h1>
        </div>
        <p className="text-muted-foreground font-body">
          Sell your <strong className="text-foreground">artwork, creative products or professional services</strong> to Zambia's growing community of collectors and clients. Set your price in ZMW and start earning.
        </p>
        <div className="mt-3 p-3 rounded-lg bg-muted/60 border border-border text-xs text-muted-foreground font-body">
          <strong className="text-foreground">Community Standards:</strong> This platform is for creative professionals listing art, products and legitimate services. Adult or sexual content of any kind is strictly prohibited and will result in immediate removal.
        </div>
      </div>

      <div className="mb-8">
        <Stepper steps={STEPS} currentIndex={step} onStepClick={(i) => { if (i < step) { hapticSelection(); setStep(i); } }} />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
          >
            {step === 0 && (
              <div className="space-y-4">
                {field(
                  "Artwork Image",
                  <label className="flex flex-col items-center justify-center w-full aspect-[4/3] rounded-xl border-2 border-dashed border-border hover:border-primary/50 cursor-pointer transition-colors bg-muted/30 overflow-hidden">
                    {previewUrl ? (
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <ImagePlus className="w-10 h-10" />
                        <span className="font-body text-sm">Tap to upload image</span>
                        <span className="font-body text-xs">JPG or PNG — this becomes your artwork's cover</span>
                      </div>
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                  </label>
                )}
                {previewUrl && (
                  <Button type="button" variant="ghost" className="w-full rounded-full" onClick={() => { setImageFile(null); setPreviewUrl(null); }}>
                    Remove image
                  </Button>
                )}
              </div>
            )}

            {step === 1 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  {field("Title *",
                    <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Name of your artwork" className={inputClass} required />
                  )}
                </div>
                <div>
                  {field("Artist Name *",
                    <Input value={form.artist_name} onChange={(e) => setForm({ ...form, artist_name: e.target.value })} placeholder="Your artist name" className={inputClass} required />
                  )}
                </div>
                <div>
                  {field("Category *",
                    <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                      <SelectTrigger className={inputClass}><SelectValue placeholder="Select category" /></SelectTrigger>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                <div>
                  {field("Medium",
                    <Input value={form.medium} onChange={(e) => setForm({ ...form, medium: e.target.value })} placeholder="Oil, acrylic, digital..." className={inputClass} />
                  )}
                </div>
                <div>
                  {field("Dimensions",
                    <Input value={form.dimensions} onChange={(e) => setForm({ ...form, dimensions: e.target.value })} placeholder="e.g. 60cm x 80cm" className={inputClass} />
                  )}
                </div>
                <div>
                  {field("Year Created",
                    <Input value={form.year_created} onChange={(e) => setForm({ ...form, year_created: e.target.value })} placeholder="2024" type="number" inputMode="numeric" className={inputClass} />
                  )}
                </div>
                <div className="sm:col-span-2">
                  {field("Description",
                    <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Tell the story behind this piece..." className={inputClass} rows={4} />
                  )}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                {field("Price (ZMW) *",
                  <Input type="number" min="0" step="0.01" inputMode="numeric" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="0.00" className={inputClass} required />,
                  <PriceSuggestion category={form.category} currentPrice={parseFloat(form.price) || 0} />
                )}

                {field("Listing Type",
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, is_auction: false })}
                      className={`p-4 rounded-xl border-2 transition-all ${!form.is_auction ? 'border-primary bg-primary/5' : 'border-border'}`}
                    >
                      <ShoppingBag className={`w-6 h-6 mx-auto mb-2 ${!form.is_auction ? 'text-primary' : 'text-muted-foreground'}`} />
                      <p className={`text-sm font-semibold ${!form.is_auction ? 'text-foreground' : 'text-muted-foreground'}`}>Fixed Price</p>
                      <p className="text-xs text-muted-foreground mt-1">Direct sale at set price</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, is_auction: true })}
                      className={`p-4 rounded-xl border-2 transition-all ${form.is_auction ? 'border-primary bg-primary/5' : 'border-border'}`}
                    >
                      <Gavel className={`w-6 h-6 mx-auto mb-2 ${form.is_auction ? 'text-primary' : 'text-muted-foreground'}`} />
                      <p className={`text-sm font-semibold ${form.is_auction ? 'text-foreground' : 'text-muted-foreground'}`}>Auction</p>
                      <p className="text-xs text-muted-foreground mt-1">Collectors bid competitively</p>
                    </button>
                  </div>
                )}

                {form.is_auction && (
                  field("Auction Duration",
                    <Select value={form.auction_duration} onValueChange={(v) => setForm({ ...form, auction_duration: v })}>
                      <SelectTrigger className={inputClass}><SelectValue placeholder="Select duration" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3 Days</SelectItem>
                        <SelectItem value="5">5 Days</SelectItem>
                        <SelectItem value="7">7 Days</SelectItem>
                        <SelectItem value="14">14 Days</SelectItem>
                        <SelectItem value="30">30 Days</SelectItem>
                      </SelectContent>
                    </Select>,
                    <>Auction will end on {new Date(Date.now() + parseInt(form.auction_duration || 7) * 24 * 60 * 60 * 1000).toLocaleDateString()}</>
                  )
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Step navigation */}
        <div className="flex gap-3 pt-2">
          {step > 0 && (
            <Button type="button" variant="outline" size="lg" onClick={back} className="rounded-full gap-2 w-32">
              <ChevronLeft className="w-5 h-5" /> Back
            </Button>
          )}
          {step < STEPS.length - 1 ? (
            <Button type="button" size="lg" onClick={next} className="flex-1 rounded-full gap-2">
              Continue <ChevronRight className="w-5 h-5" />
            </Button>
          ) : (
            <Button type="submit" size="lg" disabled={createMutation.isPending || uploading} className="flex-1 rounded-full font-body">
              {uploading ? <><Loader2 className="w-5 h-5 animate-spin" /> Uploading...</> : createMutation.isPending ? <><Loader2 className="w-5 h-5 animate-spin" /> Listing...</> : (form.is_auction ? "Start Auction" : "List Artwork for Sale")}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
