'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ShoppingBag, 
  Trash2, 
  ArrowRight, 
  ShieldCheck, 
  Truck, 
  Warehouse, 
  ChevronRight,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatINR } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

export default function CartPage() {
  const { 
    items, 
    removeItem, 
    updateQuantity, 
    clearCart, 
    subtotal, 
    deliveryFeeTotal: deliveryTotal, 
    platformFee, 
    grandTotal 
  } = useCart();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-xs font-semibold text-[#617064]">
        <Link href="/" className="hover:text-[#2D7A46]">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/crops" className="hover:text-[#2D7A46]">Marketplace</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-[#1E2A22]">Shopping Cart</span>
      </nav>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-black/5 gap-4">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#1E2A22]">
            Your Produce Cart
          </h1>
          <p className="text-xs text-[#617064] mt-0.5">
            Direct harvest reservations locked against farmer MOQ and physical stock
          </p>
        </div>

        {items.length > 0 && (
          <button
            onClick={clearCart}
            className="text-xs text-red-600 hover:text-red-700 font-semibold flex items-center space-x-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Empty Cart</span>
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-black/5 space-y-4 shadow-subtle max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-[#F3FAF4] text-[#2D7A46] mx-auto flex items-center justify-center font-bold">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#1E2A22]">
            Your cart is currently empty
          </h2>
          <p className="text-xs text-[#617064] leading-relaxed">
            Explore active harvests from verified Indian farmers across grains, pulses, fresh fruits, vegetables, and certified organic commodities.
          </p>
          <div className="pt-2">
            <Link href="/crops">
              <Button size="md" className="flex items-center justify-center space-x-2 mx-auto">
                <span>Browse All Crops</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Items List (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-2xl border border-black/5 bg-white shadow-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center space-x-4 min-w-0">
                  <img
                    src={item.crop.primary_image || "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=400&q=80"}
                    alt={item.crop.title}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=400&q=80";
                    }}
                    className="w-20 h-20 rounded-xl object-cover border border-black/5 shrink-0"
                  />
                  <div className="min-w-0">
                    <Link
                      href={`/crops/${item.crop.slug}`}
                      className="font-serif font-bold text-base text-[#1E2A22] hover:text-[#2D7A46] transition-colors truncate block"
                    >
                      {item.crop.title}
                    </Link>
                    <p className="text-xs text-[#617064]">
                      {item.crop.variety} • {item.crop.district}, {item.crop.state}
                    </p>
                    <div className="mt-1 flex items-center space-x-2 text-xs">
                      <span className="font-bold text-[#2D7A46]">
                        {formatINR(item.crop.price_per_unit)} / {item.crop.unit}
                      </span>
                      <span className="text-stone-300">•</span>
                      <span className="text-stone-500 font-medium capitalize">
                        {item.delivery_choice === 'delivery' ? 'Farmer Delivery' : 'Farm Pickup'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto space-x-4">
                  {/* Quantity Stepper */}
                  <div className="flex items-center border border-black/10 rounded-xl bg-white px-2 py-1 justify-between w-28">
                    <button
                      onClick={() => updateQuantity(item.listing_id, item.quantity - 1)}
                      disabled={item.quantity <= item.crop.min_order_quantity}
                      className="w-6 h-6 rounded bg-stone-100 flex items-center justify-center font-bold text-xs disabled:opacity-30"
                    >
                      -
                    </button>
                    <span className="text-xs font-bold text-[#1E2A22]">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.listing_id, item.quantity + 1)}
                      disabled={item.quantity >= item.crop.stock_quantity}
                      className="w-6 h-6 rounded bg-stone-100 flex items-center justify-center font-bold text-xs disabled:opacity-30"
                    >
                      +
                    </button>
                  </div>

                  <div className="text-right min-w-[90px]">
                    <div className="font-bold text-sm text-[#1E2A22]">
                      {formatINR(item.quantity * item.crop.price_per_unit)}
                    </div>
                    <span className="text-[10px] text-stone-400">
                      {item.quantity} {item.crop.unit}s
                    </span>
                  </div>

                  <button
                    onClick={() => removeItem(item.listing_id)}
                    className="p-1.5 rounded-lg border border-black/10 hover:bg-red-50 hover:border-red-200 text-stone-400 hover:text-red-600 transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Cart Summary (4 cols) */}
          <div className="lg:col-span-4 p-6 rounded-3xl border border-black/5 bg-white shadow-card space-y-5">
            <h3 className="font-serif text-lg font-bold text-[#1E2A22]">
              Order Summary
            </h3>

            <div className="space-y-3 text-xs text-[#617064] pb-4 border-b border-black/5">
              <div className="flex justify-between">
                <span>Crop Produce Subtotal</span>
                <span className="font-bold text-[#1E2A22]">{formatINR(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Transport / Farm Freight</span>
                <span className="font-bold text-[#1E2A22]">
                  {deliveryTotal > 0 ? formatINR(deliveryTotal) : 'Free (Farm Pickup)'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>APMC Platform Cess (1%)</span>
                <span className="font-bold text-[#1E2A22]">{formatINR(platformFee)}</span>
              </div>
            </div>

            <div className="flex justify-between items-baseline pt-1">
              <div>
                <span className="font-serif text-base font-bold text-[#1E2A22] block">Grand Total</span>
                <span className="text-[10px] text-stone-400">Incl. Mandi cess &amp; GST</span>
              </div>
              <div className="font-serif text-2xl font-bold text-[#2D7A46]">
                {formatINR(grandTotal)}
              </div>
            </div>

            <Link href="/checkout" className="block pt-2">
              <Button size="lg" className="w-full flex items-center justify-center space-x-2">
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>

            <div className="pt-3 border-t border-black/5 space-y-2 text-[11px] text-[#617064]">
              <div className="flex items-center space-x-2 text-emerald-800 font-medium">
                <ShieldCheck className="w-4 h-4 text-[#2D7A46]" />
                <span>100% Cash on Delivery &amp; Escrow Guarantee</span>
              </div>
              <p>
                Crops are dispatched directly from verified farm gates with certified moisture weighment slips.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
