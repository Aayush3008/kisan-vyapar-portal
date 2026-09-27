'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { MOCK_CROPS } from '@/lib/mock-data';
import { CropListing } from '@/types';

export interface CropFeedback {
  id: string;
  crop_id: string;
  crop_title: string;
  farmer_id?: string;
  user_name: string;
  user_district?: string;
  rating: number; // 1 to 5
  comment: string;
  created_at: string;
}

export interface FarmerIncomingOrder {
  id: string;
  orderNumber: string;
  buyerId?: string;
  buyerName: string;
  buyerPhone: string;
  buyerEmail?: string;
  cropTitle: string;
  cropId?: string;
  farmerId?: string;
  farmerName?: string;
  variety: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  discountPercent?: number;
  discountAmount?: number;
  totalAmount: number;
  paymentMethod: 'cod' | 'razorpay';
  paymentStatus: 'pending' | 'paid' | 'escrow';
  fulfillmentStatus: 'new' | 'accepted' | 'packed' | 'dispatched' | 'delivered' | 'cancelled';
  deliveryType: 'Farm Pickup' | 'Farmer Door Delivery';
  deliveryAddress: string;
  orderDate: string;
  transportVehicleNumber?: string;
  trackingPhone?: string;
}

const INITIAL_FEEDBACK: CropFeedback[] = [
  {
    id: 'fb-1',
    crop_id: 'crop-1',
    crop_title: 'Certified Sharbati Wheat (Sehore Golden Grain)',
    farmer_id: 'farmer-1',
    user_name: 'Vikas Aggarwal (Flour Traders Meerut)',
    user_district: 'Meerut, Uttar Pradesh',
    rating: 5,
    comment: 'Exceptional golden lustre and zero moisture. Delivered right on time with full weighment accuracy. Best wheat batch in Western UP / MP region!',
    created_at: '2026-09-24T14:30:00Z',
  },
  {
    id: 'fb-2',
    crop_id: 'crop-2',
    crop_title: '1121 Pusa Basmati Paddy (Super Extra Long)',
    farmer_id: 'farmer-2',
    user_name: 'Rajesh Tyagi (Mandi Trader)',
    user_district: 'Meerut, Uttar Pradesh',
    rating: 5,
    comment: 'Grain length after milling is over 8.35mm. Great direct farmer discount provided for bulk procurement!',
    created_at: '2026-09-23T11:20:00Z',
  },
  {
    id: 'fb-3',
    crop_id: 'crop-3',
    crop_title: 'Devgad Alphonso Mangoes (GI Certified)',
    farmer_id: 'farmer-3',
    user_name: 'Pooja Singhal',
    user_district: 'Noida, Uttar Pradesh',
    rating: 5,
    comment: 'Crisp sweetness and genuine carbide-free ripening. Hay packing kept all crates in pristine export condition.',
    created_at: '2026-09-22T09:15:00Z',
  },
  {
    id: 'fb-4',
    crop_id: 'crop-13',
    crop_title: 'Co-0238 High-Brix Juicing Sugarcane',
    farmer_id: 'farmer-1',
    user_name: 'Suresh Chandra (Khandasari Processor)',
    user_district: 'Mawana, Meerut, UP',
    rating: 5,
    comment: 'Extremely sweet cane stalks with 21° brix. Farm-gate weighing at Partapur bypass was transparent and truck arrived within 2 hours.',
    created_at: '2026-09-25T16:00:00Z',
  },
  {
    id: 'fb-5',
    crop_id: 'crop-5',
    crop_title: 'Nashik Red Onions (Garwa Export Quality)',
    farmer_id: 'farmer-5',
    user_name: 'Anil Gupta (Wholesale Spices Delhi)',
    user_district: 'Azadpur Mandi, Delhi',
    rating: 5,
    comment: 'Uniform grading 55mm and completely dry outer peel. Zero rot in 40 quintals lot. Saved 15% compared to local mandi middlemen.',
    created_at: '2026-09-25T11:45:00Z',
  },
  {
    id: 'fb-6',
    crop_id: 'crop-15',
    crop_title: 'GI-Certified Pure Pampore Mongra Saffron',
    farmer_id: 'farmer-8',
    user_name: 'Chef Kabir Kapoor (Fine Dining)',
    user_district: 'Gurugram, Haryana',
    rating: 5,
    comment: 'Exquisite aroma and blood-red color release. Verified genuine Grade-1 Kashmiri harvest. Escrow delivery gave complete peace of mind.',
    created_at: '2026-09-24T18:10:00Z',
  }
];

const INITIAL_ORDERS: FarmerIncomingOrder[] = [
  {
    id: 'ord-1',
    orderNumber: 'ORD-KVP-10001',
    buyerId: 'demo-buyer-priya',
    buyerName: 'Priya Sundaram (Spice Export Trade)',
    buyerPhone: '+91 98450 12890',
    cropTitle: 'Guntur Teja Chillies (Stemless)',
    cropId: 'crop-4',
    farmerId: 'farmer-4',
    variety: 'Teja S17 Export Quality',
    quantity: 2,
    unit: 'Quintals',
    pricePerUnit: 19800,
    discountPercent: 5,
    discountAmount: 1980,
    totalAmount: 37620,
    paymentMethod: 'razorpay',
    paymentStatus: 'paid',
    fulfillmentStatus: 'new',
    deliveryType: 'Farmer Door Delivery',
    deliveryAddress: 'Plot 44, Food Processing Zone, Vijayawada, AP - 520007',
    orderDate: 'Today, 2:15 PM',
  },
  {
    id: 'ord-2',
    orderNumber: 'ORD-KVP-10002',
    buyerId: 'demo-buyer-apex',
    buyerName: 'Apex Flour Mills Ltd.',
    buyerPhone: '+91 94250 88712',
    cropTitle: 'Certified Sharbati Wheat',
    cropId: 'crop-1',
    farmerId: 'farmer-1',
    variety: 'C-306 Golden Grain',
    quantity: 25,
    unit: 'Quintals',
    pricePerUnit: 3450,
    discountPercent: 8,
    discountAmount: 6900,
    totalAmount: 79350,
    paymentMethod: 'cod',
    paymentStatus: 'pending',
    fulfillmentStatus: 'accepted',
    deliveryType: 'Farm Pickup',
    deliveryAddress: 'Farm Gate Pickup arranged by buyer (Truck MP-04-E-8821)',
    orderDate: 'Yesterday, 5:30 PM',
  },
];

interface CropContextType {
  crops: any[];
  addCrop: (cropData: any) => any;
  updateCrop: (id: string, updates: Partial<any>) => void;
  reduceCropStock: (cropId: string, quantityToDeduct: number) => void;
  deleteCrop: (id: string) => void;
  getCropBySlug: (slug: string) => any | undefined;
  // Feedback methods
  feedbacks: CropFeedback[];
  addFeedback: (feedback: Omit<CropFeedback, 'id' | 'created_at'>) => void;
  getCropFeedbacks: (cropId: string) => CropFeedback[];
  // Orders placed by users shown in farmer workspace
  farmerOrders: FarmerIncomingOrder[];
  addFarmerOrder: (order: Omit<FarmerIncomingOrder, 'id'>) => void;
  updateFarmerOrderStatus: (orderId: string, status: FarmerIncomingOrder['fulfillmentStatus'], dispatchInfo?: { vehicleNo?: string; trackingPhone?: string }) => void;
}

const CropContext = createContext<CropContextType | undefined>(undefined);

export function CropProvider({ children }: { children: React.ReactNode }) {
  const [crops, setCrops] = useState<any[]>(() => {
    return MOCK_CROPS.map((c: any, i: number) => ({
      ...c,
      discount_percentage: c.discount_percentage || (i % 2 === 0 ? 10 : 5), // default farm discount
      discount_price_per_unit: c.discount_price_per_unit || (c.price_per_unit * (1 - (i % 2 === 0 ? 0.10 : 0.05))),
    }));
  });

  const [feedbacks, setFeedbacks] = useState<CropFeedback[]>(INITIAL_FEEDBACK);
  const [farmerOrders, setFarmerOrders] = useState<FarmerIncomingOrder[]>(INITIAL_ORDERS);

  // ─── Fetch custom crops from Supabase on mount ───────────────
  const fetchSupabaseCrops = useCallback(async () => {
    try {
      const res = await fetch('/api/crops');
      if (!res.ok) return;
      const data = await res.json();
      if (data.crops && Array.isArray(data.crops) && data.crops.length > 0) {
        setCrops((prev) => {
          const supabaseIds = new Set(data.crops.map((c: any) => c.id));
          const baseCrops = prev.filter((c: any) => !supabaseIds.has(c.id));
          const supabaseCrops = data.crops.map((c: any) => ({ ...c, _is_custom: true }));
          return [...supabaseCrops, ...baseCrops];
        });
        console.log(`✅ Loaded ${data.crops.length} custom crops from Supabase`);
      }
    } catch (e) {
      console.warn('Could not fetch crops from Supabase, using local data:', e);
    }
  }, []);

  // ─── Fetch real orders from Supabase on mount ─────────────────
  const fetchSupabaseOrders = useCallback(async () => {
    try {
      const res = await fetch('/api/orders');
      if (!res.ok) return;
      const data = await res.json();
      if (data.orders && Array.isArray(data.orders) && data.orders.length > 0) {
        setFarmerOrders((prev) => {
          const existingIds = new Set(data.orders.map((o: any) => o.orderNumber || o.id));
          const remainingPrev = prev.filter((p) => !existingIds.has(p.orderNumber) && !existingIds.has(p.id));
          return [...data.orders, ...remainingPrev];
        });
        console.log(`✅ Loaded ${data.orders.length} real orders from Supabase`);
      }
    } catch (e) {
      console.warn('Could not fetch orders from Supabase:', e);
    }
  }, []);

  // ─── Fetch reviews from Supabase on mount ────────────────────
  const fetchSupabaseReviews = useCallback(async () => {
    try {
      const res = await fetch('/api/reviews');
      if (!res.ok) return;
      const data = await res.json();
      if (data.reviews && Array.isArray(data.reviews) && data.reviews.length > 0) {
        setFeedbacks((prev) => {
          const remoteIds = new Set(data.reviews.map((r: any) => r.id));
          const localOnly = prev.filter((f) => !remoteIds.has(f.id));
          return [...data.reviews, ...localOnly];
        });
      }
    } catch (e) {
      console.warn('Could not fetch reviews from Supabase:', e);
    }
  }, []);

  // Load custom persisted crops, orders, and reviews from Supabase on mount
  useEffect(() => {
    fetchSupabaseCrops();
    fetchSupabaseOrders();
    fetchSupabaseReviews();

    // Also load fallback localStorage if present
    try {
      const storedCrops = localStorage.getItem('kvp_crops');
      if (storedCrops) {
        const parsedC = JSON.parse(storedCrops);
        if (Array.isArray(parsedC) && parsedC.length > 0) {
          setCrops((prev) => {
            const storedMap = new Map(parsedC.map((c: any) => [c.id, c]));
            const mergedBase = prev.map((p) => {
              const stored = storedMap.get(p.id);
              return stored ? { ...p, ...stored } : p;
            });
            const customOnly = parsedC.filter((c: any) => !prev.some((p) => p.id === c.id));
            return [...customOnly, ...mergedBase];
          });
        }
      }

      const storedFeedbacks = localStorage.getItem('kvp_feedbacks');
      if (storedFeedbacks) {
        const parsedF = JSON.parse(storedFeedbacks);
        if (Array.isArray(parsedF) && parsedF.length > 0) {
          setFeedbacks((prev) => [...prev, ...parsedF.filter((f: any) => !prev.some(p => p.id === f.id))]);
        }
      }

      const storedOrders = localStorage.getItem('kvp_farmer_orders');
      if (storedOrders) {
        const parsedO = JSON.parse(storedOrders);
        if (Array.isArray(parsedO) && parsedO.length > 0) {
          setFarmerOrders((prev) => [...prev, ...parsedO.filter((o: any) => !prev.some(p => p.orderNumber === o.orderNumber))]);
        }
      }
    } catch (e) {
      console.error('Error loading data from storage:', e);
    }
  }, [fetchSupabaseCrops, fetchSupabaseOrders, fetchSupabaseReviews]);

  // ─── Add crop → save to local and Supabase ───────────────────
  const addCrop = (cropData: any) => {
    const slug = cropData.title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') + '-' + Math.floor(1000 + Math.random() * 9000);

    const price = Number(cropData.pricePerUnit || cropData.price_per_unit || 3000);
    const discountPercent = Number(cropData.discountPercentage ?? cropData.discount_percentage ?? 0);
    const discountPrice = discountPercent > 0 ? price * (1 - discountPercent / 100) : price;

    const newCrop = {
      id: `crop-${Date.now()}`,
      farmer_id: cropData.farmer_id || 'farmer-custom',
      farmer_name: cropData.farmer_name || 'Rameshwar Patel',
      farm_name: cropData.farm_name || 'Patel Organic Agro Farms',
      farmer_rating: 5.0,
      farmer_verified: true,
      category_id: cropData.category_id || 'cat-grains',
      category_name: cropData.category_name || cropData.category || 'Grains & Cereals',
      title: cropData.title,
      slug: slug,
      variety: cropData.variety || 'Certified Hybrid',
      grade: cropData.grade || 'Grade A',
      description: cropData.description || 'Freshly harvested agricultural produce direct from farm gate.',
      unit: cropData.unit || 'quintal',
      price_per_unit: price,
      discount_percentage: discountPercent,
      discount_price_per_unit: discountPrice,
      market_price_per_unit: Number(cropData.market_price_per_unit || (price * 1.08)),
      distance_km: cropData.distance_km || Math.floor(5 + Math.random() * 25),
      min_order_quantity: Number(cropData.minOrderQuantity || cropData.min_order_quantity || 1),
      stock_quantity: Number(cropData.totalQuantity || cropData.stock_quantity || 100),
      reserved_quantity: 0,
      harvest_date: cropData.harvestDate || cropData.harvest_date || new Date().toISOString().split('T')[0],
      district: cropData.district || 'Meerut',
      state: cropData.state || 'Uttar Pradesh',
      pickup_available: cropData.pickupAvailable ?? cropData.pickup_available ?? true,
      delivery_available: cropData.deliveryAvailable ?? cropData.delivery_available ?? true,
      delivery_fee_per_unit: Number(cropData.deliveryFee || cropData.delivery_fee_per_unit || 120),
      soil_type: cropData.soilType || 'Deep Alluvial Loam',
      farming_method: cropData.farmingMethod || 'Natural Organic',
      status: 'active',
      primary_image: cropData.imageUrl || cropData.primary_image || 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80',
      images: [
        cropData.imageUrl || cropData.primary_image || 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80',
      ],
      created_at: new Date().toISOString(),
      _is_custom: true,
    };

    // Optimistically add to local state and localStorage
    setCrops((prev) => {
      const updated = [newCrop, ...prev];
      try {
        localStorage.setItem('kvp_crops', JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to save new crop to storage:', e);
      }
      return updated;
    });

    // Save to API route
    fetch('/api/crops', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cropData),
    })
      .then((res) => {
        if (res.ok) {
          console.log(`✅ Crop "${cropData.title}" saved successfully`);
        }
      })
      .catch((err) => {
        console.warn('Failed to save crop via API:', err);
      });

    return newCrop;
  };

  const updateCrop = (id: string, updates: Partial<any>) => {
    setCrops((prev) => {
      const updated = prev.map((c) => {
        if (c.id === id) {
          const merged = { ...c, ...updates, _is_custom: true };
          if (updates.discount_percentage !== undefined || updates.price_per_unit !== undefined) {
            const disc = updates.discount_percentage !== undefined ? Number(updates.discount_percentage) : (c.discount_percentage || 0);
            const pr = updates.price_per_unit !== undefined ? Number(updates.price_per_unit) : c.price_per_unit;
            merged.discount_percentage = disc;
            merged.discount_price_per_unit = disc > 0 ? pr * (1 - disc / 100) : pr;
          }
          return merged;
        }
        return c;
      });
      try {
        localStorage.setItem('kvp_crops', JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to save updated crops:', e);
      }
      return updated;
    });

    // Update in backend
    fetch(`/api/crops/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    }).catch((err) => console.warn('Failed to update crop in backend:', err));
  };

  // Reduce crop stock after purchase
  const reduceCropStock = (cropId: string, quantityToDeduct: number) => {
    const qty = Number(quantityToDeduct || 0);
    if (qty <= 0) return;

    setCrops((prev) => {
      const updated = prev.map((c) => {
        if (c.id === cropId) {
          const currentStock = Number(c.stock_quantity ?? 0);
          const nextStock = Math.max(0, currentStock - qty);
          const nextStatus = nextStock === 0 ? 'sold_out' : c.status;
          return {
            ...c,
            stock_quantity: nextStock,
            status: nextStatus,
          };
        }
        return c;
      });
      try {
        localStorage.setItem('kvp_crops', JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to save crop stock:', e);
      }
      return updated;
    });

    // Sync stock reduction to backend API
    fetch(`/api/crops/${cropId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decrementStock: qty }),
    }).catch((err) => console.warn('Failed to sync stock reduction to API:', err));
  };

  const deleteCrop = (id: string) => {
    setCrops((prev) => {
      const filtered = prev.filter((c) => c.id !== id);
      try {
        localStorage.setItem('kvp_crops', JSON.stringify(filtered));
      } catch (e) {
        console.warn('Failed to save crops after delete:', e);
      }
      return filtered;
    });

    // Delete in backend
    fetch(`/api/crops/${id}`, { method: 'DELETE' })
      .catch((err) => console.warn('Failed to delete crop in backend:', err));
  };

  const getCropBySlug = (slug: string) => {
    return crops.find((c) => c.slug === slug);
  };

  // Feedback Handling
  const addFeedback = (feedback: Omit<CropFeedback, 'id' | 'created_at'>) => {
    const newFb: CropFeedback = {
      ...feedback,
      id: `fb-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      created_at: new Date().toISOString(),
    };
    setFeedbacks((prev) => {
      const updated = [newFb, ...prev];
      try {
        localStorage.setItem('kvp_feedbacks', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save feedback:', e);
      }
      return updated;
    });

    // Save to Supabase in background
    fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newFb),
    }).catch((err) => console.warn('Failed to save review in Supabase:', err));
  };

  const getCropFeedbacks = (cropId: string) => {
    return feedbacks.filter((f) => f.crop_id === cropId);
  };

  // Farmer Incoming Orders Handling
  const addFarmerOrder = (order: Omit<FarmerIncomingOrder, 'id'>) => {
    const newOrder: FarmerIncomingOrder = {
      ...order,
      id: `ord-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    setFarmerOrders((prev) => {
      const updated = [newOrder, ...prev];
      try {
        localStorage.setItem('kvp_farmer_orders', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save farmer order:', e);
      }
      return updated;
    });

    // Save order directly into Supabase orders & order_items
    fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newOrder),
    }).catch((err) => console.warn('Failed to save order in Supabase:', err));
  };

  const updateFarmerOrderStatus = (
    orderId: string, 
    status: FarmerIncomingOrder['fulfillmentStatus'],
    dispatchInfo?: { vehicleNo?: string; trackingPhone?: string }
  ) => {
    setFarmerOrders((prev) => {
      const updated = prev.map((o) => {
        if (o.id === orderId || o.orderNumber === orderId) {
          return {
            ...o,
            fulfillmentStatus: status,
            transportVehicleNumber: dispatchInfo?.vehicleNo || o.transportVehicleNumber,
            trackingPhone: dispatchInfo?.trackingPhone || o.trackingPhone,
          };
        }
        return o;
      });
      try {
        localStorage.setItem('kvp_farmer_orders', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to update farmer orders:', e);
      }
      return updated;
    });

    // Update in Supabase orders & timeline in background
    fetch(`/api/orders/${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status,
        vehicleNumber: dispatchInfo?.vehicleNo,
        trackingPhone: dispatchInfo?.trackingPhone,
      }),
    }).catch((err) => console.warn('Failed to update order in Supabase:', err));
  };

  return (
    <CropContext.Provider
      value={{
        crops,
        addCrop,
        updateCrop,
        reduceCropStock,
        deleteCrop,
        getCropBySlug,
        feedbacks,
        addFeedback,
        getCropFeedbacks,
        farmerOrders,
        addFarmerOrder,
        updateFarmerOrderStatus,
      }}
    >
      {children}
    </CropContext.Provider>
  );
}

export function useCrops() {
  const context = useContext(CropContext);
  if (!context) {
    throw new Error('useCrops must be used within a CropProvider');
  }
  return context;
}
