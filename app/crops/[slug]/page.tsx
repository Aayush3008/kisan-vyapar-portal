'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  ShieldCheck, 
  ShoppingCart, 
  ChevronRight, 
  Truck, 
  Warehouse, 
  Check, 
  AlertCircle, 
  Calendar, 
  Layers, 
  Info, 
  Star,
  MessageSquare,
  Send,
  User
} from 'lucide-react';
import { MOCK_CROPS } from '@/lib/mock-data';
import { formatINR, calculateFreshness } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { CropCard } from '@/components/marketplace/CropCard';
import { useCrops } from '@/context/CropContext';
import { useRole } from '@/context/RoleContext';

export default function CropDetailPage({ params }: { params: { slug: string } }) {
  const { crops, getCropBySlug, feedbacks, addFeedback, getCropFeedbacks } = useCrops();
  const { currentUser, userLocation } = useRole();
  const crop = getCropBySlug(params.slug) || crops.find((c) => c.slug === params.slug) || crops[0] || MOCK_CROPS[0];
  const { addItem } = useCart();
  const { toast } = useToast();

  const [selectedImage, setSelectedImage] = useState<string>(crop.primary_image || crop.images?.[0] || '');
  const [quantity, setQuantity] = useState<number>(crop.min_order_quantity);
  const [deliveryChoice, setDeliveryChoice] = useState<'pickup' | 'delivery'>('pickup');
  const [activeTab, setActiveTab] = useState<'specs' | 'harvest' | 'soil' | 'feedback' | 'terms'>('specs');
  const [isAdded, setIsAdded] = useState(false);

  // New feedback form states
  const [reviewName, setReviewName] = useState(currentUser?.full_name || 'Buyer from Meerut');
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const freshness = calculateFreshness(crop.harvest_date);
  const isOutOfStock = crop.stock_quantity <= 0;

  // Pricing with farmer discount calculation
  const hasDiscount = Boolean(crop.discount_percentage && crop.discount_percentage > 0);
  const effectivePrice = hasDiscount
    ? (crop.discount_price_per_unit || crop.price_per_unit * (1 - (crop.discount_percentage || 0) / 100))
    : crop.price_per_unit;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addItem(crop, quantity, deliveryChoice);
    setIsAdded(true);
    toast(`Added ${quantity} ${crop.unit} of ${crop.title} to your cart!`, 'success');
    setTimeout(() => setIsAdded(false), 800);
  };

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) {
      toast('Please write your review/feedback for the farmer.', 'error');
      return;
    }
    setSubmittingReview(true);
    addFeedback({
      crop_id: crop.id,
      crop_title: crop.title,
      farmer_id: crop.farmer_id,
      user_name: reviewName.trim() || 'Verified Buyer',
      user_district: currentUser?.district || userLocation?.district || 'Meerut, Uttar Pradesh',
      rating: reviewRating,
      comment: reviewComment.trim(),
    });
    setReviewComment('');
    setSubmittingReview(false);
    toast('Feedback submitted successfully! Visible in Crop & Farmer Dashboard.', 'success');
  };

  const cropFeedbacks = getCropFeedbacks(crop.id);
  const relatedCrops = crops.filter((c) => c.id !== crop.id).slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 text-xs text-[#617064]">
        <Link href="/" className="hover:text-[#2D7A46]">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/crops" className="hover:text-[#2D7A46]">Marketplace</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-[#1E2A22] font-semibold truncate max-w-xs">{crop.title}</span>
      </nav>

      {/* Main PDP Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Image Gallery (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="group aspect-square w-full rounded-3xl overflow-hidden bg-stone-100 border border-black/5 shadow-subtle relative cursor-zoom-in">
            <AnimatePresence mode="wait">
              <motion.img
                key={selectedImage}
                src={selectedImage}
                alt={crop.title}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-125"
              />
            </AnimatePresence>
            <div className="absolute top-4 left-4 flex flex-col gap-1.5 pointer-events-none">
              <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm border ${freshness.badgeColor}`}>
                {freshness.label}
              </span>
              {hasDiscount && (
                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-red-600 text-white shadow-md animate-pulse">
                  ⚡ {crop.discount_percentage}% FARMER DISCOUNT
                </span>
              )}
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/90 text-[#1E2A22] backdrop-blur-xs border border-black/10">
                {crop.grade}
              </span>
            </div>
            <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-xs text-white text-[10px] font-medium px-2 py-1 rounded-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
              Hover to Zoom • Mobile Pinch-to-Zoom
            </div>
          </div>

          {/* Thumbnail Selector */}
          {crop.images && crop.images.length > 1 && (
            <div className="flex space-x-3 overflow-x-auto pb-2">
              {crop.images.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                    selectedImage === img ? 'border-[#2D7A46] scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Crop Details & Purchase Controls (7 cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center space-x-2 text-xs text-[#617064] mb-2">
              <span className="bg-[#F3FAF4] text-[#2D7A46] px-2.5 py-0.5 rounded-full font-semibold">
                {crop.category_name || "Grains & Produce"}
              </span>
              <span>•</span>
              <span className="flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-stone-400" />
                <span>{crop.district}, {crop.state}</span>
              </span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#1E2A22] leading-tight">
              {crop.title}
            </h1>
            <p className="text-sm text-[#617064] mt-1 font-medium">Cultivar / Variety: {crop.variety}</p>

            {/* Price display with unit breakdown and farmer discount */}
            <div className="mt-4 p-4 rounded-2xl bg-[#F3FAF4] border border-[#6FBF78]/40 flex items-center justify-between">
              <div>
                <div className="flex items-baseline space-x-3">
                  <div className="text-3xl font-bold text-[#2D7A46]">
                    {formatINR(effectivePrice)}
                    <span className="text-sm font-normal text-[#617064]"> / {crop.unit}</span>
                  </div>
                  {hasDiscount && (
                    <span className="text-base text-stone-400 line-through">
                      {formatINR(crop.price_per_unit)}
                    </span>
                  )}
                  {crop.market_price_per_unit && (
                    <span className="text-xs text-stone-400 line-through">
                      Govt Mandi: {formatINR(crop.market_price_per_unit)}
                    </span>
                  )}
                </div>

                {hasDiscount ? (
                  <div className="mt-1 flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded bg-red-600 text-white font-bold text-[11px]">
                      Special Farmer Discount: {crop.discount_percentage}% OFF
                    </span>
                    <span className="text-xs font-bold text-emerald-800">
                      You save {formatINR(crop.price_per_unit - effectivePrice)} / {crop.unit}!
                    </span>
                  </div>
                ) : crop.market_price_per_unit ? (
                  <p className="text-xs text-emerald-800 font-bold mt-0.5">
                    ✓ Guaranteed Below Mandi Value: You save {formatINR(crop.market_price_per_unit - crop.price_per_unit)} per {crop.unit}
                  </p>
                ) : null}

                <p className="text-xs text-[#617064] mt-1">
                  Approx. ₹{(effectivePrice / 100).toFixed(2)} per kg (Ex-farm price)
                </p>
              </div>

              <div className="text-right">
                <div className="text-xs font-semibold text-[#1E2A22]">Available Stock</div>
                <div className="text-lg font-bold text-[#1E2A22]">
                  {crop.stock_quantity} <span className="text-xs text-[#617064]">{crop.unit}s</span>
                </div>
                <span className="text-[11px] text-[#2D7A46] font-semibold">
                  {crop.reserved_quantity} {crop.unit}s reserved
                </span>
              </div>
            </div>

            {/* Farmer Trust Strip */}
            <div className="mt-4 p-4 rounded-2xl border border-black/5 bg-white shadow-xs flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl bg-[#2D7A46] text-white flex items-center justify-center font-bold text-lg">
                  {crop.farmer_name?.charAt(0) || "K"}
                </div>
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="font-serif text-base font-bold text-[#1E2A22]">{crop.farmer_name}</span>
                    <ShieldCheck className="w-4 h-4 text-[#2D7A46]" />
                  </div>
                  <p className="text-xs text-[#617064]">{crop.farm_name} • Verified Producer</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-1 text-amber-500 font-bold text-sm">
                  <Star className="w-4 h-4 fill-current" />
                  <span>{crop.farmer_rating || "4.9"}</span>
                </div>
                <span className="text-[10px] text-[#617064]">100% On-Time Fulfillment</span>
              </div>
            </div>

            {/* Fulfillment Selector */}
            <div className="mt-6 space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-[#617064] block">Fulfillment Method</label>
              <div className="grid grid-cols-2 gap-3">
                <div
                  onClick={() => setDeliveryChoice('pickup')}
                  className={`cursor-pointer p-3 rounded-xl border flex items-center space-x-3 transition-all ${
                    deliveryChoice === 'pickup'
                      ? 'border-[#2D7A46] bg-[#F3FAF4]'
                      : 'border-black/10 bg-white hover:bg-stone-50'
                  }`}
                >
                  <Warehouse className="w-5 h-5 text-[#2D7A46]" />
                  <div>
                    <div className="text-xs font-bold text-[#1E2A22]">Farm Gate Pickup</div>
                    <div className="text-[11px] text-[#617064]">Free (Self-arranged transport)</div>
                  </div>
                </div>

                <div
                  onClick={() => setDeliveryChoice('delivery')}
                  className={`cursor-pointer p-3 rounded-xl border flex items-center space-x-3 transition-all ${
                    deliveryChoice === 'delivery'
                      ? 'border-[#2D7A46] bg-[#F3FAF4]'
                      : 'border-black/10 bg-white hover:bg-stone-50'
                  }`}
                >
                  <Truck className="w-5 h-5 text-[#2D7A46]" />
                  <div>
                    <div className="text-xs font-bold text-[#1E2A22]">Farmer / Mandi Delivery</div>
                    <div className="text-[11px] text-[#617064]">+{formatINR(crop.delivery_fee_per_unit || 120)} / {crop.unit}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quantity Selector & Add to Cart */}
            <div className="mt-6 pt-6 border-t border-black/5 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <div className="flex items-center border border-black/10 rounded-xl bg-white px-3 py-2 justify-between sm:w-44">
                <button
                  onClick={() => setQuantity((q) => Math.max(crop.min_order_quantity, q - 1))}
                  disabled={quantity <= crop.min_order_quantity}
                  className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center font-bold text-stone-700 disabled:opacity-30"
                >
                  -
                </button>
                <div className="text-center px-2">
                  <span className="font-bold text-sm text-[#1E2A22]">{quantity}</span>
                  <span className="text-[11px] text-[#617064] block">{crop.unit}s</span>
                </div>
                <button
                  onClick={() => setQuantity((q) => Math.min(crop.stock_quantity, q + 1))}
                  disabled={quantity >= crop.stock_quantity}
                  className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center font-bold text-stone-700 disabled:opacity-30"
                >
                  +
                </button>
              </div>

              <Button
                size="lg"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="flex-1 flex items-center justify-center space-x-2"
              >
                {isAdded ? (
                  <>
                    <Check className="w-5 h-5" />
                    <span>Added to Cart!</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    <span>Add {quantity} {crop.unit} to Cart • {formatINR(quantity * effectivePrice)}</span>
                  </>
                )}
              </Button>
            </div>

            {/* Quality Guarantee & Report Strip */}
            <div className="mt-4 flex items-center justify-between text-xs text-[#617064] pt-3 border-t border-black/5">
              <span className="flex items-center gap-1 text-emerald-800 font-medium">
                <ShieldCheck className="w-4 h-4 text-[#2D7A46]" />
                100% Agmark &amp; Mandi Quality Verified • Cash on Delivery (COD) Supported
              </span>
              <button
                onClick={() => toast('Report received: Our agricultural audit team will inspect this listing within 2 hours.', 'info')}
                className="text-stone-400 hover:text-red-600 transition-colors flex items-center gap-1"
              >
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Report Discrepancy</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Accordions / Tabs with Live Reviews & Feedback */}
      <div className="rounded-3xl border border-black/5 bg-white p-6 sm:p-8 shadow-subtle">
        <div className="flex flex-wrap gap-4 border-b border-black/5 pb-4 text-sm font-bold">
          {(['specs', 'feedback', 'harvest', 'soil', 'terms'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`capitalize pb-2 transition-colors relative flex items-center gap-1.5 ${
                activeTab === tab ? 'text-[#2D7A46]' : 'text-stone-400 hover:text-stone-700'
              }`}
            >
              {tab === 'specs' ? 'Crop & Variety Specs' : 
               tab === 'feedback' ? `Buyer Feedback & Reviews (${cropFeedbacks.length})` :
               tab === 'harvest' ? 'Harvest & Moisture' : 
               tab === 'soil' ? 'Cultivation & Soil' : 'Terms & COD'}
              {tab === 'feedback' && (
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-bold">
                  ★ {crop.farmer_rating || "4.9"}
                </span>
              )}
              {activeTab === tab && (
                <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2D7A46]" />
              )}
            </button>
          ))}
        </div>

        <div className="pt-6 text-sm text-[#617064] leading-relaxed">
          {activeTab === 'specs' && (
            <div className="space-y-4">
              <p>{crop.description}</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
                <div className="p-3 bg-[#FAFCFA] rounded-xl border border-black/5">
                  <span className="text-xs text-stone-400 block">Quality Grade</span>
                  <span className="font-bold text-[#1E2A22]">{crop.grade}</span>
                </div>
                <div className="p-3 bg-[#FAFCFA] rounded-xl border border-black/5">
                  <span className="text-xs text-stone-400 block">Minimum Order (MOQ)</span>
                  <span className="font-bold text-[#1E2A22]">{crop.min_order_quantity} {crop.unit}</span>
                </div>
                <div className="p-3 bg-[#FAFCFA] rounded-xl border border-black/5">
                  <span className="text-xs text-stone-400 block">Farmer Discount</span>
                  <span className="font-bold text-[#2D7A46]">
                    {hasDiscount ? `${crop.discount_percentage}% Direct Cut` : 'Standard Direct APMC Rate'}
                  </span>
                </div>
                <div className="p-3 bg-[#FAFCFA] rounded-xl border border-black/5">
                  <span className="text-xs text-stone-400 block">Payment Options</span>
                  <span className="font-bold text-[#1E2A22]">Cash on Delivery (COD) &amp; Online</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'feedback' && (
            <div className="space-y-8">
              {/* Write Feedback Form */}
              <div className="p-5 rounded-2xl bg-[#FAFCFA] border border-black/5 space-y-4">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="w-5 h-5 text-[#2D7A46]" />
                  <h4 className="font-serif font-bold text-base text-[#1E2A22]">
                    Leave Buyer Feedback for {crop.farmer_name || 'Farmer'}
                  </h4>
                </div>
                <p className="text-xs text-[#617064]">
                  Your review directly helps the farmer build trust on Kisan Vyapar Portal and is visible on their personal dashboard.
                </p>

                <form onSubmit={handleFeedbackSubmit} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-[#1E2A22] block mb-1">Your Name / Trade Entity</label>
                      <input
                        type="text"
                        value={reviewName}
                        onChange={(e) => setReviewName(e.target.value)}
                        placeholder="e.g. Ramesh Kumar, Aggarwal Traders Meerut"
                        className="w-full text-xs rounded-xl border border-black/10 px-3 py-2 bg-white focus:outline-none focus:border-[#2D7A46]"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-[#1E2A22] block mb-1">Rating</label>
                      <div className="flex items-center space-x-1 py-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewRating(star)}
                            className="p-1 text-amber-400 hover:scale-110 transition-transform cursor-pointer"
                          >
                            <Star className={`w-5 h-5 ${star <= reviewRating ? 'fill-amber-400' : 'text-stone-300'}`} />
                          </button>
                        ))}
                        <span className="text-xs font-bold text-[#1E2A22] ml-2">{reviewRating} out of 5 stars</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#1E2A22] block mb-1">Feedback & Quality Experience</label>
                    <textarea
                      rows={3}
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Comment on grain moisture, packaging, weighment accuracy, and farmer communication..."
                      className="w-full text-xs rounded-xl border border-black/10 px-3 py-2 bg-white focus:outline-none focus:border-[#2D7A46]"
                    />
                  </div>

                  <Button type="submit" size="sm" isLoading={submittingReview} className="flex items-center space-x-1.5">
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Verified Feedback</span>
                  </Button>
                </form>
              </div>

              {/* Existing Reviews List */}
              <div className="space-y-4">
                <h4 className="font-serif font-bold text-base text-[#1E2A22]">
                  Recent Reviews from Wholesale &amp; Retail Buyers
                </h4>
                {cropFeedbacks.length === 0 ? (
                  <p className="text-xs text-[#617064] italic">
                    Be the first buyer to leave feedback on this fresh crop batch!
                  </p>
                ) : (
                  cropFeedbacks.map((fb) => (
                    <div key={fb.id} className="p-4 rounded-2xl border border-black/5 bg-[#FAFCFA] space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-7 h-7 rounded-full bg-[#2D7A46] text-white flex items-center justify-center font-bold text-xs">
                            {fb.user_name.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-xs text-[#1E2A22]">{fb.user_name}</span>
                            <span className="text-[10px] text-[#617064] block">{fb.user_district || 'Verified Buyer'}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 text-amber-500">
                          {Array.from({ length: fb.rating }).map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-current" />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-stone-700 leading-relaxed pt-1">
                        {fb.comment}
                      </p>
                      <span className="text-[10px] text-stone-400 block pt-1">
                        {new Date(fb.created_at).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'harvest' && (
            <div className="space-y-2">
              <p><strong>Harvest Date:</strong> {new Date(crop.harvest_date).toLocaleDateString('en-IN', { dateStyle: 'full' })}</p>
              <p><strong>Moisture Level:</strong> Hand-tested under 11.5% moisture at time of bagging to prevent mould and rancidity.</p>
              <p><strong>Storage Facility:</strong> Aerated covered farm shed with pallets raised 15cm from ground level.</p>
            </div>
          )}

          {activeTab === 'soil' && (
            <div className="space-y-2">
              <p><strong>Soil Topology:</strong> Upper Gangetic Alluvial Loam / Rich Deep Soil with organic carbon levels maintained above 0.8%.</p>
              <p><strong>Nutrient Protocol:</strong> Fortified with farm-made compost and organic bio-stimulants.</p>
            </div>
          )}

          {activeTab === 'terms' && (
            <div className="space-y-2">
              <p><strong>Cash on Delivery (COD):</strong> Full COD is enabled for this farmer item. Buyer can inspect crop at physical delivery point before giving cash.</p>
              <p><strong>Quality Inspection:</strong> Weighment and sample physical check permitted upon truck arrival at farm gate or warehouse.</p>
              <p><strong>Cancellation:</strong> Orders can be cancelled prior to dispatch. For COD orders, payment is due upon physical arrival.</p>
            </div>
          )}
        </div>
      </div>

      {/* Related Crops Carousel */}
      <div>
        <h3 className="font-serif text-2xl font-bold text-[#1E2A22] mb-6">
          More Harvested Crops from Similar Agricultural Districts
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {relatedCrops.map((c) => (
            <CropCard key={c.id} crop={c} />
          ))}
        </div>
      </div>
    </div>
  );
}
