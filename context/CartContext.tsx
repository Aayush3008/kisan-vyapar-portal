'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, CropListing } from '@/types';

interface CartContextType {
  items: CartItem[];
  addItem: (crop: CropListing, quantity?: number, deliveryChoice?: 'pickup' | 'delivery') => void;
  removeItem: (listingId: string) => void;
  updateQuantity: (listingId: string, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
  deliveryFeeTotal: number;
  platformFee: number;
  discountAmount: number;
  grandTotal: number;
  itemCount: number;
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
  appliedCoupon: string | null;
  applyCoupon: (code: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('kvp_cart');
      if (savedCart) {
        setItems(JSON.parse(savedCart));
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('kvp_cart', JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items]);

  const addItem = (crop: CropListing, quantity = crop.min_order_quantity || 1, deliveryChoice: 'pickup' | 'delivery' = 'pickup') => {
    const effectivePrice = (crop.discount_percentage && crop.discount_percentage > 0)
      ? (crop.discount_price_per_unit || crop.price_per_unit * (1 - crop.discount_percentage / 100))
      : crop.price_per_unit;

    setItems((prev) => {
      const existing = prev.find((item) => item.listing_id === crop.id);
      if (existing) {
        const newQty = Math.min(existing.quantity + quantity, crop.stock_quantity);
        return prev.map((item) =>
          item.listing_id === crop.id
            ? {
                ...item,
                quantity: newQty,
                price_per_unit: effectivePrice,
                line_total: newQty * effectivePrice,
                delivery_choice: deliveryChoice,
              }
            : item
        );
      }
      return [
        ...prev,
        {
          id: `cart-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          listing_id: crop.id,
          crop,
          quantity: Math.max(crop.min_order_quantity, Math.min(quantity, crop.stock_quantity)),
          delivery_choice: deliveryChoice,
          price_per_unit: effectivePrice,
          line_total: Math.max(crop.min_order_quantity, quantity) * effectivePrice,
        },
      ];
    });
  };

  const removeItem = (idOrListingId: string) => {
    setItems((prev) => prev.filter((item) => item.listing_id !== idOrListingId && item.id !== idOrListingId));
  };

  const updateQuantity = (idOrListingId: string, quantity: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.listing_id === idOrListingId || item.id === idOrListingId) {
          const constrainedQty = Math.max(item.crop.min_order_quantity, Math.min(quantity, item.crop.stock_quantity));
          return {
            ...item,
            quantity: constrainedQty,
            line_total: constrainedQty * item.price_per_unit,
          };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
  };

  const subtotal = items.reduce((acc, item) => acc + item.line_total, 0);
  
  const deliveryFeeTotal = items.reduce((acc, item) => {
    if (item.delivery_choice === 'delivery') {
      return acc + (item.crop.delivery_fee_per_unit || 0) * item.quantity;
    }
    return acc;
  }, 0);

  const platformFee = items.length > 0 ? 49 : 0;
  
  const [couponDiscount, setCouponDiscount] = useState<{ percent: number; fixed: number }>({ percent: 0, fixed: 0 });
  
  const discountAmount = couponDiscount.fixed > 0
    ? couponDiscount.fixed
    : couponDiscount.percent > 0
    ? (subtotal * couponDiscount.percent) / 100
    : appliedCoupon === 'KISAN10'
    ? subtotal * 0.1
    : 0;
  
  const grandTotal = Math.max(0, subtotal + deliveryFeeTotal + platformFee - discountAmount);
  
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const applyCoupon = (code: string) => {
    const clean = code.trim().toUpperCase();
    if (clean === 'KISAN10' || clean === 'KVPSPECIAL') {
      setAppliedCoupon(clean);
      setCouponDiscount({ percent: 10, fixed: 0 });
      return true;
    }
    if (clean === 'FARMER50') {
      setAppliedCoupon(clean);
      setCouponDiscount({ percent: 0, fixed: 500 });
      return true;
    }
    if (clean === 'HARVEST100') {
      setAppliedCoupon(clean);
      setCouponDiscount({ percent: 0, fixed: 1000 });
      return true;
    }

    // Also check Supabase coupons in background
    fetch(`/api/coupons?code=${clean}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.valid) {
          setAppliedCoupon(data.code);
          setCouponDiscount({ percent: data.discount_percent || 0, fixed: data.discount_fixed || 0 });
        }
      })
      .catch(() => {});

    return false;
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        subtotal,
        deliveryFeeTotal,
        platformFee,
        discountAmount,
        grandTotal,
        itemCount,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
        appliedCoupon,
        applyCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
