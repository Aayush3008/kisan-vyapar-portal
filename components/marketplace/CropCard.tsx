'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  ShieldCheck, 
  ShoppingCart, 
  Eye, 
  Clock, 
  Check 
} from 'lucide-react';
import { CropListing } from '@/types';
import { formatINR, calculateFreshness } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/components/ui/Toast';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

interface CropCardProps {
  crop: CropListing;
}

export function CropCard({ crop }: CropCardProps) {
  const { addItem } = useCart();
  const { toast } = useToast();
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const freshness = calculateFreshness(crop.harvest_date);
  const isOutOfStock = crop.stock_quantity <= 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (isOutOfStock) return;

    setIsAdding(true);
    addItem(crop, crop.min_order_quantity, 'pickup');
    toast(`Added ${crop.title} (${crop.min_order_quantity} ${crop.unit}) to cart!`, 'success');
    setTimeout(() => setIsAdding(false), 500);
  };

  return (
    <>
      <motion.div
        whileHover={{ y: -6, scale: 1.01 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className="group relative rounded-2xl liquid-glass-card overflow-hidden flex flex-col justify-between"
      >
        {/* Image & Badges */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-100">
          <img
            src={crop.primary_image || "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80"}
            alt={crop.title}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80";
            }}
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />

          {/* Freshness & Discount Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide shadow-xs border ${freshness.badgeColor}`}>
              {freshness.label}
            </span>
            {crop.grade === 'Organic Certified' && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide bg-emerald-600 text-white shadow-xs">
                Organic Certified
              </span>
            )}
          </div>

          {/* Farmer Discount Badge */}
          {crop.discount_percentage && crop.discount_percentage > 0 ? (
            <div className="absolute top-3 right-3 z-10">
              <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold tracking-wide bg-red-600 text-white shadow-md flex items-center gap-1 animate-pulse">
                <span>⚡ {crop.discount_percentage}% OFF</span>
              </span>
            </div>
          ) : null}

          {/* Quick View Button (Slides up from below) */}
          <div className="absolute inset-x-3 bottom-3 flex justify-center opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 z-10">
            <button
              onClick={(e) => {
                e.preventDefault();
                setQuickViewOpen(true);
              }}
              className="w-full py-2 bg-white/95 backdrop-blur-sm text-xs font-semibold text-[#1E2A22] rounded-xl shadow-md hover:bg-white flex items-center justify-center space-x-1.5 border border-black/10"
            >
              <Eye className="w-3.5 h-3.5 text-[#2D7A46]" />
              <span>Quick View</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col justify-between">
          <div>
            {/* Location & Grade */}
            <div className="flex items-center justify-between text-xs text-[#617064] mb-1.5">
              <span className="flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-stone-400" />
                <span>{crop.district}, {crop.state}</span>
              </span>
              <span className="font-semibold text-stone-500 text-[11px] uppercase tracking-wider">{crop.grade}</span>
            </div>

            {/* Title */}
            <Link href={`/crops/${crop.slug}`}>
              <h3 className="font-serif text-lg font-bold text-[#1E2A22] line-clamp-1 hover:text-[#2D7A46] transition-colors">
                {crop.title}
              </h3>
            </Link>
            <p className="text-xs text-[#617064] mt-0.5 line-clamp-1">Variety: {crop.variety}</p>

            {/* Farmer Trust snippet with Name & Rating */}
            <div className="mt-2.5 flex items-center justify-between text-xs bg-[#F3FAF4] p-2 rounded-xl border border-black/5">
              <div className="flex items-center space-x-1.5 min-w-0">
                <ShieldCheck className="w-3.5 h-3.5 text-[#2D7A46] shrink-0" />
                <span className="truncate font-semibold text-[#1E2A22]">{crop.farmer_name || "Verified Kisan"}</span>
              </div>
              <div className="flex items-center space-x-1 bg-white px-2 py-0.5 rounded-md border border-black/5 shrink-0">
                <span className="text-amber-500 font-bold text-[11px]">★ {crop.farmer_rating || "4.9"}</span>
              </div>
            </div>

            {/* Nearest Location & Distance */}
            {crop.distance_km && (
              <div className="mt-1.5 flex items-center justify-between text-[11px] text-[#617064]">
                <span className="flex items-center space-x-1">
                  <MapPin className="w-3 h-3 text-[#2D7A46]" />
                  <span>Nearest Farm Gate</span>
                </span>
                <span className="font-bold text-[#2D7A46] bg-emerald-50 px-2 py-0.5 rounded-full">
                  {crop.distance_km} km away
                </span>
              </div>
            )}
          </div>

          {/* Pricing & Market Value Comparison */}
          <div className="mt-3 pt-3 border-t border-black/5 flex items-center justify-between">
            <div>
              <div className="flex items-baseline space-x-2">
                {crop.discount_percentage && crop.discount_percentage > 0 ? (
                  <>
                    <div className="text-base font-bold text-[#2D7A46]">
                      {formatINR(crop.discount_price_per_unit || crop.price_per_unit * (1 - crop.discount_percentage / 100))}
                      <span className="text-xs font-normal text-[#617064]"> / {crop.unit}</span>
                    </div>
                    <span className="text-xs text-stone-400 line-through">
                      {formatINR(crop.price_per_unit)}
                    </span>
                  </>
                ) : (
                  <div className="text-base font-bold text-[#1E2A22]">
                    {formatINR(crop.price_per_unit)}
                    <span className="text-xs font-normal text-[#617064]"> / {crop.unit}</span>
                  </div>
                )}
              </div>

              {/* Farmer Special Discount Label */}
              {crop.discount_percentage && crop.discount_percentage > 0 ? (
                <div className="flex items-center space-x-1 text-[10px]">
                  <span className="text-red-600 font-bold bg-red-50 px-1.5 py-0.5 rounded">
                    Farmer Special: {crop.discount_percentage}% Direct Discount
                  </span>
                </div>
              ) : crop.market_price_per_unit ? (
                <div className="flex items-center space-x-1 text-[10px]">
                  <span className="text-stone-400 line-through">
                    Mkt: {formatINR(crop.market_price_per_unit)}
                  </span>
                  <span className="text-emerald-700 font-bold">
                    Save {Math.round(((crop.market_price_per_unit - crop.price_per_unit) / crop.market_price_per_unit) * 100)}%
                  </span>
                </div>
              ) : null}

              <div className="text-[10px] text-[#617064]">
                Min Order: {crop.min_order_quantity} {crop.unit}
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`p-2.5 rounded-xl flex items-center justify-center transition-all ${
                isOutOfStock
                  ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                  : 'bg-[#2D7A46] text-white hover:bg-[#236338] shadow-xs'
              }`}
              title="Add to Cart"
            >
              {isAdding ? (
                <Check className="w-4 h-4 text-white animate-scale" />
              ) : (
                <ShoppingCart className="w-4 h-4" />
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Quick View Modal */}
      <Modal isOpen={quickViewOpen} onClose={() => setQuickViewOpen(false)} maxWidth="lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="aspect-square rounded-2xl overflow-hidden bg-stone-100 border border-black/5">
            <img
              src={crop.primary_image || "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80"}
              alt={crop.title}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80";
              }}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${freshness.badgeColor}`}>
                  {freshness.label}
                </span>
                <span className="text-xs text-[#617064] font-medium">{crop.grade}</span>
              </div>

              <h3 className="font-serif text-2xl font-bold text-[#1E2A22] mb-1">{crop.title}</h3>
              <p className="text-xs text-[#617064] mb-3">Variety: {crop.variety}</p>

              <div className="text-2xl font-bold text-[#2D7A46] mb-3">
                {formatINR(crop.price_per_unit)}
                <span className="text-xs font-normal text-[#617064]"> / {crop.unit}</span>
              </div>

              <p className="text-xs text-[#617064] leading-relaxed mb-4 line-clamp-3">
                {crop.description}
              </p>

              <div className="bg-[#F3FAF4] p-3 rounded-xl border border-black/5 text-xs text-[#1E2A22] space-y-1 mb-4">
                <div className="flex justify-between">
                  <span className="text-[#617064]">Farm District:</span>
                  <span className="font-semibold">{crop.district}, {crop.state}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#617064]">Available Stock:</span>
                  <span className="font-semibold">{crop.stock_quantity} {crop.unit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#617064]">Minimum Order:</span>
                  <span className="font-semibold">{crop.min_order_quantity} {crop.unit}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Button
                className="w-full"
                onClick={(e) => {
                  handleAddToCart(e);
                  setQuickViewOpen(false);
                }}
                disabled={isOutOfStock}
              >
                Add {crop.min_order_quantity} {crop.unit} to Cart
              </Button>
              <Link href={`/crops/${crop.slug}`} className="block text-center text-xs text-[#2D7A46] font-semibold hover:underline">
                View Full Crop Specifications & Agronomic Profile →
              </Link>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
