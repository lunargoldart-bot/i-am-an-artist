import React from 'react';
import { useParams } from 'react-router-dom';
import VirtualGalleryViewer from '@/components/gallery/VirtualGalleryViewer';

export default function VirtualGallery() {
  const { exhibitionId } = useParams();

  if (!exhibitionId) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Exhibition not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <VirtualGalleryViewer exhibitionId={exhibitionId} />
    </div>
  );
}