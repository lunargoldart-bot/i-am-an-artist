import React, { useState } from 'react';
import { firebaseClient } from '@/api/firebaseClient';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, ShoppingCart, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import BuyArtworkModal from '@/components/modals/BuyArtworkModal';
import SmartImage from '@/components/ui/SmartImage';
import ArtworkLightbox from '@/components/ui/ArtworkLightbox';
import { hapticLight } from '@/utils/native';

export default function VirtualGalleryViewer({ exhibitionId }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedArtwork, setSelectedArtwork] = useState(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [perspective, setPerspective] = useState({ x: 0, y: 0 });

  const { data: exhibition = {} } = useQuery({
    queryKey: ['exhibition', exhibitionId],
    queryFn: () => firebaseClient.entities.Exhibition.get(exhibitionId)
  });

  const { data: artworks = [] } = useQuery({
    queryKey: ['exhibition-artworks', exhibition.artwork_ids],
    queryFn: async () => {
      if (!exhibition.artwork_ids?.length) return [];
      const works = await Promise.all(
        exhibition.artwork_ids.map(id => firebaseClient.entities.Artwork.get(id))
      );
      return works.filter(Boolean);
    },
    enabled: !!exhibition.artwork_ids?.length
  });

  const currentArtwork = artworks[currentIndex];

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientY - rect.top) / rect.height - 0.5;
    const y = (e.clientX - rect.left) / rect.width - 0.5;
    setPerspective({ x: x * 15, y: y * 15 });
  };

  const handleMouseLeave = () => {
    setPerspective({ x: 0, y: 0 });
  };

  const handleNext = () => {
    hapticLight();
    setCurrentIndex((i) => (i + 1) % artworks.length);
  };

  const handlePrev = () => {
    hapticLight();
    setCurrentIndex((i) => (i - 1 + artworks.length) % artworks.length);
  };

  if (!currentArtwork) {
    return <div className="text-center py-12 text-muted-foreground">No artworks in this exhibition</div>;
  }

  return (
    <div className="w-full h-full bg-background">
      {/* Main Gallery Space */}
      <div 
        className="relative w-full h-96 md:h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-secondary to-background"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ perspective: '1200px' }}
      >
        {/* Wall grid pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="w-full h-full" style={{
            backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }} />
        </div>

        {/* 3D Artwork Display */}
        <div className="relative z-10">
          <div
            className="relative"
            style={{
              transformStyle: 'preserve-3d',
              transform: `rotateX(${perspective.x}deg) rotateY(${perspective.y}deg)`,
              transition: 'transform 0.1s ease-out'
            }}
          >
            <div className="relative max-w-2xl w-full aspect-square rounded-xl overflow-hidden shadow-2xl border-4 border-gold/20 bg-card">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentArtwork.id}
                  initial={{ opacity: 0, scale: 0.94, rotateY: 8 }}
                  animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                  exit={{ opacity: 0, scale: 1.04, rotateY: -8 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="absolute inset-0 cursor-pointer"
                  onClick={() => setLightboxOpen(true)}
                >
                  <SmartImage
                    src={currentArtwork.image_urls?.[0]}
                    alt={currentArtwork.title}
                    wrapperClassName="absolute inset-0"
                    eager
                  />
                </motion.div>
              </AnimatePresence>

              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white to-transparent opacity-10 pointer-events-none" />
            </div>

            {/* Info overlay */}
            <div className="absolute -bottom-24 left-0 right-0 text-center">
              <h2 className="font-playfair text-2xl font-bold text-foreground mb-1">
                {currentArtwork.title}
              </h2>
              <p className="text-gold font-semibold text-lg">
                ZMW {currentArtwork.price?.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation buttons */}
        <button
          onClick={handlePrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-gold/20 hover:bg-gold/30 transition-colors border border-gold/40"
        >
          <ChevronLeft className="w-6 h-6 text-gold" />
        </button>
        <button
          onClick={handleNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-gold/20 hover:bg-gold/30 transition-colors border border-gold/40"
        >
          <ChevronRight className="w-6 h-6 text-gold" />
        </button>

        {/* Progress indicator */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          {artworks.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-2 rounded-full transition-all ${
                idx === currentIndex ? 'w-8 bg-gold' : 'w-2 bg-gold/40'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Actions and Details */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={() => setSelectedArtwork(currentArtwork)}
            className="gold-gradient text-background font-semibold gap-2"
          >
            <ShoppingCart className="w-4 h-4" />
            Purchase
          </Button>
          <Button
            variant="outline"
            className="border-gold/50 text-gold hover:bg-gold/10 gap-2"
            onClick={() => setLightboxOpen(true)}
          >
            <Maximize2 className="w-4 h-4" />
            Fullscreen
          </Button>
        </div>

        {currentArtwork.description && (
          <div className="mt-6 p-4 bg-secondary rounded-lg border border-border">
            <p className="text-sm text-muted-foreground mb-2 font-semibold">About this piece</p>
            <p className="text-foreground">{currentArtwork.description}</p>
          </div>
        )}

        {/* Artist info */}
        <div className="mt-6 p-4 bg-card rounded-lg border border-border flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
            <span className="font-bold text-primary-foreground text-sm">
              {currentArtwork.artist_name?.charAt(0)}
            </span>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{currentArtwork.artist_name}</p>
            <p className="text-xs text-muted-foreground">{currentArtwork.category}</p>
          </div>
        </div>
      </div>

      {selectedArtwork && (
        <BuyArtworkModal
          artwork={selectedArtwork}
          onClose={() => setSelectedArtwork(null)}
        />
      )}

      {currentArtwork && (
        <ArtworkLightbox
          open={lightboxOpen}
          src={currentArtwork.image_urls?.[0]}
          alt={currentArtwork.title}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  );
}