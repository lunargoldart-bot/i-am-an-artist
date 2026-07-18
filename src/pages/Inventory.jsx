import React from 'react';
import { useAuth } from '@/lib/AuthContext';
import InventoryManager from '@/components/inventory/InventoryManager';
import { Package } from 'lucide-react';

export default function Inventory() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <Package className="w-8 h-8 text-primary" />
            <h1 className="font-playfair text-4xl font-bold text-foreground">
              Inventory
            </h1>
          </div>
          <p className="text-muted-foreground max-w-2xl">
            Manage your artworks. Mark items as sold, out of stock, or reserved to control their visibility in the marketplace.
          </p>
        </div>

        {/* Inventory Manager */}
        <InventoryManager />
      </div>
    </div>
  );
}