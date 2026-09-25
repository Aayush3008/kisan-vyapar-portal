'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Check, 
  Clock, 
  Package, 
  Truck, 
  MapPin, 
  Printer, 
  ArrowRight, 
  MessageCircle, 
  ShieldCheck 
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function OrderConfirmationPage({ 
  params, 
  searchParams 
}: { 
  params: { orderNumber: string }; 
  searchParams: { method?: string } 
}) {
  const orderNumber = params.orderNumber || 'ORD-KVP-10001';
  const method = searchParams.method || 'cod';

  const timelineSteps = [
    { id: 1, title: 'Order Placed & Verified', desc: 'Reserved in farmer stock', done: true, current: false },
    { id: 2, title: 'Accepted by Farmer', desc: 'Farmer confirmed quality & packing schedule', done: true, current: true },
    { id: 3, title: 'Harvested / Packed', desc: 'Graded in jute sacks with QR tag', done: false, current: false },
    { id: 4, title: 'Dispatched / Ready for Pickup', desc: 'Truck assignment & driver contact', done: false, current: false },
    { id: 5, title: 'Delivered / Completed', desc: 'Physical weighment & final receipt', done: false, current: false },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Animated SVG Path Checkmark Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#F3FAF4] text-[#2D7A46] border border-[#6FBF78]/40 shadow-sm">
          <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none">
            <motion.path
              d="M5 13l4 4L19 7"
              stroke="#2D7A46"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </svg>
        </div>

        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-[#2D7A46]">Order Confirmed</span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#1E2A22] mt-1">
            Thank You for Your Order!
          </h1>
          <p className="text-sm text-[#617064] mt-1">
            Your reference number is <strong className="text-[#1E2A22]">{orderNumber}</strong>
          </p>
        </div>
      </div>

      {/* Farm-to-Buyer Order Timeline */}
      <div className="p-6 sm:p-8 rounded-3xl border border-black/5 bg-white shadow-card space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-black/5">
          <h3 className="font-serif text-xl font-bold text-[#1E2A22]">
            Live Farm-to-Buyer Timeline
          </h3>
          <span className="text-xs bg-[#F3FAF4] text-[#2D7A46] font-semibold px-3 py-1 rounded-full border border-black/5">
            {method === 'cod' ? 'Payment: Cash on Delivery' : 'Payment: Paid via Razorpay'}
          </span>
        </div>

        <div className="space-y-6">
          {timelineSteps.map((step, idx) => (
            <div key={step.id} className="relative flex items-start space-x-4">
              {idx < timelineSteps.length - 1 && (
                <div
                  className={`absolute left-4 top-8 w-0.5 h-12 -ml-px ${
                    step.done ? 'bg-[#2D7A46]' : 'bg-stone-200'
                  }`}
                />
              )}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold transition-all ${
                  step.done
                    ? 'bg-[#2D7A46] text-white shadow-xs'
                    : 'bg-stone-100 text-stone-400'
                }`}
              >
                {step.done ? <Check className="w-4 h-4" /> : step.id}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h4 className={`text-sm font-bold ${step.done ? 'text-[#1E2A22]' : 'text-stone-400'}`}>
                    {step.title}
                  </h4>
                  {step.current && (
                    <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                      In Progress
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#617064] mt-0.5">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
        <button
          onClick={() => window.print()}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl border border-black/10 bg-white text-xs font-semibold text-[#1E2A22] hover:bg-stone-50"
        >
          <Printer className="w-4 h-4" />
          <span>Print Tax Invoice & Gate Pass</span>
        </button>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <Link href="/crops" className="flex-1 sm:flex-initial">
            <Button variant="secondary" className="w-full">Continue Shopping</Button>
          </Link>
          <Link href="/account" className="flex-1 sm:flex-initial">
            <Button className="w-full">View Order in Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
