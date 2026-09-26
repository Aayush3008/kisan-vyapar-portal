'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Check, 
  CreditCard, 
  Banknote, 
  MapPin, 
  ShieldCheck, 
  ArrowRight, 
  Lock, 
  Truck, 
  Warehouse 
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useCrops } from '@/context/CropContext';
import { useRole } from '@/context/RoleContext';
import { formatINR } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, deliveryFeeTotal, platformFee, discountAmount, grandTotal, clearCart } = useCart();
  const { addFarmerOrder } = useCrops();
  const { currentUser, userLocation } = useRole();
  const { toast } = useToast();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'razorpay'>('cod');
  const [isProcessing, setIsProcessing] = useState(false);

  // Form Fields defaulted to user's real profile or Meerut
  const [formData, setFormData] = useState({
    fullName: currentUser?.full_name || 'Rajeev Sharma',
    phone: currentUser?.phone || '9897123456',
    email: currentUser?.email || 'rajeev.sharma@example.com',
    addressLine1: 'Shop 12, Krishi Upaj Mandi Samiti',
    addressLine2: 'Delhi-Meerut Road',
    city: currentUser?.district || userLocation?.district || 'Meerut',
    district: currentUser?.district || userLocation?.district || 'Meerut',
    state: currentUser?.state || userLocation?.state || 'Uttar Pradesh',
    pincode: '250002',
  });

  const handleInputChange = (field: string, val: string) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handlePlaceOrder = () => {
    setIsProcessing(true);
    const orderNumber = `ORD-KVP-${Math.floor(10000 + Math.random() * 90000)}`;

    // Save orders into Farmer's Workspace in real-time
    items.forEach((item) => {
      addFarmerOrder({
        orderNumber,
        buyerName: formData.fullName,
        buyerPhone: formData.phone,
        cropTitle: item.crop.title,
        cropId: item.crop.id,
        farmerId: item.crop.farmer_id,
        variety: item.crop.variety,
        quantity: item.quantity,
        unit: item.crop.unit,
        pricePerUnit: item.price_per_unit,
        discountPercent: item.crop.discount_percentage || 0,
        discountAmount: (item.crop.discount_percentage || 0) > 0 ? (item.crop.price_per_unit - item.price_per_unit) * item.quantity : 0,
        totalAmount: item.line_total + (deliveryType === 'delivery' ? (item.crop.delivery_fee_per_unit || 0) * item.quantity : 0),
        paymentMethod,
        paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
        fulfillmentStatus: 'new',
        deliveryAddress: `${formData.addressLine1}, ${formData.addressLine2 ? formData.addressLine2 + ', ' : ''}${formData.city}, ${formData.state} - ${formData.pincode}`,
        orderDate: 'Just Now',
      });
    });

    // Sync address to Supabase addresses table for user
    if (currentUser?.id) {
      fetch('/api/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          fullName: formData.fullName,
          phone: formData.phone,
          addressLine1: formData.addressLine1,
          addressLine2: formData.addressLine2,
          city: formData.city,
          district: formData.district,
          state: formData.state,
          pincode: formData.pincode,
        }),
      }).catch(() => {});
    }

    setTimeout(() => {
      clearCart();
      toast(
        paymentMethod === 'cod'
          ? 'COD Order Placed! Dispatched details and farmer notification sent.'
          : 'Order placed successfully via Razorpay Escrow!',
        'success'
      );
      router.push(`/orders/${orderNumber}?method=${paymentMethod}`);
    }, 1200);
  };

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-serif text-3xl font-bold text-[#1E2A22]">Your Cart is Empty</h2>
        <p className="text-sm text-[#617064]">Please add fresh farm crops to your cart before proceeding to checkout.</p>
        <Link href="/crops">
          <Button>Browse Marketplace</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Steps Header */}
      <div className="pb-8 border-b border-black/5 mb-8">
        <h1 className="font-serif text-3xl font-bold text-[#1E2A22] mb-6">Direct Farm Checkout</h1>
        <div className="flex items-center space-x-4 max-w-xl">
          {[
            { num: 1, label: 'Fulfillment' },
            { num: 2, label: 'Contact Details' },
            { num: 3, label: 'Payment Method' },
            { num: 4, label: 'Review & Confirm' },
          ].map((s) => (
            <div key={s.num} className="flex-1 flex items-center space-x-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step === s.num
                    ? 'bg-[#2D7A46] text-white shadow-xs'
                    : step > s.num
                    ? 'bg-[#F3FAF4] text-[#2D7A46] border border-[#2D7A46]'
                    : 'bg-stone-100 text-stone-400'
                }`}
              >
                {step > s.num ? <Check className="w-4 h-4" /> : s.num}
              </div>
              <span className="text-xs font-semibold hidden sm:inline text-stone-700">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Step Panels (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Step 1: Fulfillment Selection */}
          {step === 1 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <h2 className="font-serif text-xl font-bold text-[#1E2A22]">Step 1: Choose Fulfillment Type</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                  onClick={() => setDeliveryType('delivery')}
                  className={`cursor-pointer p-4 rounded-2xl border-2 transition-all ${
                    deliveryType === 'delivery'
                      ? 'border-[#2D7A46] bg-[#F3FAF4]'
                      : 'border-black/10 bg-white hover:bg-stone-50'
                  }`}
                >
                  <Truck className="w-6 h-6 text-[#2D7A46] mb-2" />
                  <h4 className="font-serif font-bold text-base text-[#1E2A22]">Farmer / Mandi Transport</h4>
                  <p className="text-xs text-[#617064] mt-1">Direct freight dispatch directly to your warehouse or commercial address.</p>
                </div>

                <div
                  onClick={() => setDeliveryType('pickup')}
                  className={`cursor-pointer p-4 rounded-2xl border-2 transition-all ${
                    deliveryType === 'pickup'
                      ? 'border-[#2D7A46] bg-[#F3FAF4]'
                      : 'border-black/10 bg-white hover:bg-stone-50'
                  }`}
                >
                  <Warehouse className="w-6 h-6 text-[#2D7A46] mb-2" />
                  <h4 className="font-serif font-bold text-base text-[#1E2A22]">Direct Farm Gate Pickup</h4>
                  <p className="text-xs text-[#617064] mt-1">Free pickup arranged by buyer. Inspect quality directly at farm gate.</p>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={() => setStep(2)}>Continue to Contact Details</Button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Buyer Contact & Address */}
          {step === 2 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <h2 className="font-serif text-xl font-bold text-[#1E2A22]">Step 2: Buyer & Delivery Coordinates</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Full Buyer Name"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                />
                <Input
                  label="Verified Mobile Number (for Driver)"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                />
              </div>

              <Input
                label="Email Address for Receipt"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
              />

              <Input
                label="Commercial Address / Warehouse Location"
                value={formData.addressLine1}
                onChange={(e) => handleInputChange('addressLine1', e.target.value)}
              />

              <div className="grid grid-cols-3 gap-3">
                <Input
                  label="City / Mandi"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                />
                <Input
                  label="State"
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                />
                <Input
                  label="PIN Code"
                  value={formData.pincode}
                  onChange={(e) => handleInputChange('pincode', e.target.value)}
                />
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="secondary" onClick={() => setStep(1)}>Back</Button>
                <Button onClick={() => setStep(3)}>Continue to Payment</Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Payment Method */}
          {step === 3 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <h2 className="font-serif text-xl font-bold text-[#1E2A22]">Step 3: Choose Payment Mode</h2>
              <div className="space-y-3">
                {/* Cash on Delivery / Physical Gate Inspection */}
                <div
                  onClick={() => setPaymentMethod('cod')}
                  className={`cursor-pointer p-4 rounded-2xl border-2 flex items-start space-x-4 transition-all ${
                    paymentMethod === 'cod'
                      ? 'border-[#2D7A46] bg-[#F3FAF4]'
                      : 'border-black/10 bg-white hover:bg-stone-50'
                  }`}
                >
                  <Banknote className="w-6 h-6 text-[#2D7A46] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-serif font-bold text-base text-[#1E2A22]">
                      Cash on Delivery (COD) / Farm Inspection
                    </h4>
                    <p className="text-xs text-[#617064] mt-1">
                      Pay the farmer or logistics driver directly upon physical inspection and weight certification.
                    </p>
                  </div>
                </div>

                {/* Razorpay Online */}
                <div
                  onClick={() => setPaymentMethod('razorpay')}
                  className={`cursor-pointer p-4 rounded-2xl border-2 flex items-start space-x-4 transition-all ${
                    paymentMethod === 'razorpay'
                      ? 'border-[#2D7A46] bg-[#F3FAF4]'
                      : 'border-black/10 bg-white hover:bg-stone-50'
                  }`}
                >
                  <CreditCard className="w-6 h-6 text-[#2D7A46] shrink-0 mt-0.5" />
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-serif font-bold text-base text-[#1E2A22]">
                        Online Payment via Razorpay
                      </h4>
                      <span className="text-[10px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded-full">
                        Instant Escrow
                      </span>
                    </div>
                    <p className="text-xs text-[#617064] mt-1">
                      UPI (Google Pay, PhonePe, Paytm), NetBanking (SBI, HDFC, ICICI), Corporate Cards.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="secondary" onClick={() => setStep(2)}>Back</Button>
                <Button onClick={() => setStep(4)}>Review Order Summary</Button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Final Review */}
          {step === 4 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <h2 className="font-serif text-xl font-bold text-[#1E2A22]">Step 4: Final Order Review</h2>
              <div className="bg-[#FAFCFA] p-5 rounded-2xl border border-black/5 space-y-3 text-xs text-[#1E2A22]">
                <div className="flex justify-between pb-2 border-b border-black/5">
                  <span className="text-[#617064]">Delivery Destination:</span>
                  <span className="font-semibold text-right">
                    {formData.fullName} ({formData.phone})<br />
                    {formData.addressLine1}, {formData.city}, {formData.state} - {formData.pincode}
                  </span>
                </div>
                <div className="flex justify-between pb-2 border-b border-black/5">
                  <span className="text-[#617064]">Payment Choice:</span>
                  <span className="font-bold text-[#2D7A46] uppercase">
                    {paymentMethod === 'cod' ? 'Cash on Delivery (On Inspection)' : 'Razorpay Escrow Gateway'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#617064]">Fulfillment Guarantee:</span>
                  <span className="font-semibold">Direct Farm-Gate Weighment & Quality Assurance</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start space-x-2">
                <ShieldCheck className="w-5 h-5 shrink-0 text-amber-600" />
                <span>
                  By placing this order, stock quantities will be atomically reserved in the farmer's inventory. You will receive an SMS and WhatsApp tracking confirmation.
                </span>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="secondary" onClick={() => setStep(3)}>Back</Button>
                <Button
                  size="lg"
                  isLoading={isProcessing}
                  onClick={handlePlaceOrder}
                  className="flex items-center space-x-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>Confirm & Place Order ({formatINR(grandTotal)})</span>
                </Button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Right: Order Summary Sidebar (5 cols) */}
        <div className="lg:col-span-5">
          <div className="p-6 rounded-3xl border border-black/5 bg-white shadow-card space-y-4">
            <h3 className="font-serif text-lg font-bold text-[#1E2A22] pb-3 border-b border-black/5">
              Order Breakdown
            </h3>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.listing_id} className="flex justify-between items-center text-xs">
                  <div>
                    <h5 className="font-semibold text-[#1E2A22]">{item.crop.title}</h5>
                    <p className="text-[#617064]">
                      {item.quantity} {item.crop.unit} × {formatINR(item.price_per_unit)}
                    </p>
                  </div>
                  <span className="font-bold text-[#1E2A22]">{formatINR(item.line_total)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-black/5 pt-4 space-y-2 text-xs text-[#617064]">
              <div className="flex justify-between">
                <span>Produce Subtotal</span>
                <span className="font-semibold text-[#1E2A22]">{formatINR(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Transport & Delivery</span>
                <span className="font-semibold text-[#1E2A22]">
                  {deliveryType === 'pickup' ? 'Free (Farm Pickup)' : formatINR(deliveryFeeTotal)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Mandi & Platform Fee</span>
                <span className="font-semibold text-[#1E2A22]">{formatINR(platformFee)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-[#2D7A46]">
                  <span>Discount</span>
                  <span>-{formatINR(discountAmount)}</span>
                </div>
              )}
              <div className="border-t border-black/5 pt-3 flex justify-between text-base font-bold text-[#1E2A22]">
                <span>Total Amount</span>
                <span className="text-[#2D7A46] text-xl">{formatINR(grandTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
