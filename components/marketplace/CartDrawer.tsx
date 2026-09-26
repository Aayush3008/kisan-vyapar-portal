'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatINR } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export function CartDrawer() {
  const {
    items,
    isCartDrawerOpen,
    setIsCartDrawerOpen,
    removeItem,
    updateQuantity,
    subtotal,
    deliveryFeeTotal,
    platformFee,
    discountAmount,
    grandTotal,
  } = useCart();

  return (
    <AnimatePresence>
      {isCartDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartDrawerOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between"
            >
              {/* Header */}
              <div className="p-6 border-b border-black/5 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ShoppingBag className="w-5 h-5 text-[#2D7A46]" />
                  <h2 className="font-serif text-2xl font-bold text-[#1E2A22]">Your Cart</h2>
                  <span className="text-xs bg-[#F3FAF4] text-[#2D7A46] font-semibold px-2 py-0.5 rounded-full">
                    {items.length} {items.length === 1 ? 'item' : 'items'}
                  </span>
                </div>
                <button
                  onClick={() => setIsCartDrawerOpen(false)}
                  className="rounded-full p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Item List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {items.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                    <div className="w-16 h-16 rounded-full bg-[#F3FAF4] flex items-center justify-center text-[#2D7A46]">
                      <ShoppingBag className="w-8 h-8 opacity-60" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium text-[#1E2A22]">Your cart is empty</p>
                      <p className="text-xs text-[#617064]">Explore directly harvested farm crops in our marketplace.</p>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setIsCartDrawerOpen(false)}
                    >
                      Browse Marketplace
                    </Button>
                  </div>
                ) : (
                  <AnimatePresence>
                    {items.map((item) => (
                      <motion.div
                        key={item.listing_id}
                        layout
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0, x: 50, marginBottom: 0 }}
                        transition={{ duration: 0.25 }}
                        className="flex gap-4 p-3 rounded-xl border border-black/5 bg-[#FAFCFA] hover:bg-white transition-colors"
                      >
                        <img
                          src={item.crop.primary_image || "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=400&q=80"}
                          alt={item.crop.title}
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=400&q=80";
                          }}
                          className="w-20 h-20 object-cover rounded-lg shrink-0 border border-black/5"
                        />
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start">
                              <h4 className="font-semibold text-sm text-[#1E2A22] truncate">
                                {item.crop.title}
                              </h4>
                              <button
                                onClick={() => removeItem(item.listing_id)}
                                className="text-stone-400 hover:text-red-600 transition-colors p-1"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                            <p className="text-xs text-[#617064]">{item.crop.variety} • {item.crop.district}</p>
                            <p className="text-xs font-semibold text-[#2D7A46] mt-0.5">
                              {formatINR(item.price_per_unit)} / {item.crop.unit}
                            </p>
                          </div>

                          <div className="flex justify-between items-center mt-2">
                            {/* Quantity Adjuster */}
                            <div className="flex items-center border border-black/10 rounded-lg bg-white overflow-hidden shadow-xs">
                              <button
                                onClick={() => updateQuantity(item.listing_id, item.quantity - 1)}
                                disabled={item.quantity <= item.crop.min_order_quantity}
                                className="p-1 hover:bg-stone-100 disabled:opacity-30"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="px-2.5 text-xs font-semibold text-[#1E2A22]">
                                {item.quantity} {item.crop.unit}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.listing_id, item.quantity + 1)}
                                disabled={item.quantity >= item.crop.stock_quantity}
                                className="p-1 hover:bg-stone-100 disabled:opacity-30"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <span className="font-semibold text-sm text-[#1E2A22]">
                              {formatINR(item.line_total)}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>

              {/* Footer Summary */}
              {items.length > 0 && (
                <div className="p-6 border-t border-black/5 bg-white space-y-4 shadow-lg">
                  <div className="space-y-1.5 text-xs text-[#617064]">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="font-semibold text-[#1E2A22]">{formatINR(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery Fee</span>
                      <span className="font-semibold text-[#1E2A22]">
                        {deliveryFeeTotal === 0 ? 'Self Pickup (Free)' : formatINR(deliveryFeeTotal)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Mandi & Platform Fee</span>
                      <span className="font-semibold text-[#1E2A22]">{formatINR(platformFee)}</span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-[#2D7A46]">
                        <span>Discount (KISAN10)</span>
                        <span>-{formatINR(discountAmount)}</span>
                      </div>
                    )}
                    <div className="border-t border-black/5 pt-2 flex justify-between text-sm font-bold text-[#1E2A22]">
                      <span>Grand Total</span>
                      <span className="text-[#2D7A46] text-base">{formatINR(grandTotal)}</span>
                    </div>
                  </div>

                  <Link href="/checkout" onClick={() => setIsCartDrawerOpen(false)} className="block">
                    <Button className="w-full flex items-center justify-center space-x-2" size="lg">
                      <span>Proceed to Checkout</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
