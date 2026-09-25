'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Users, 
  Package, 
  AlertTriangle, 
  Check, 
  X, 
  AlertCircle,
  FileCheck
} from 'lucide-react';
import { formatINR } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { useRole } from '@/context/RoleContext';

export default function AdminDashboardPage() {
  const { toast } = useToast();
  const { currentUser } = useRole();
  const [activeTab, setActiveTab] = useState<'overview' | 'listings' | 'users' | 'orders'>('overview');

  const [pendingListings, setPendingListings] = useState([
    {
      id: 'lst-101',
      title: 'Certified Sharbati Wheat (Sehore)',
      farmer: 'Rameshwar Patel',
      quantity: '120 Quintals',
      price: 3450,
      district: 'Sehore, MP',
      status: 'pending',
      isComplete: true,
      missingFields: [],
    },
    {
      id: 'lst-102',
      title: '1121 Pusa Basmati Paddy',
      farmer: 'Gurpreet Singh',
      quantity: '240 Quintals',
      price: 4200,
      district: 'Karnal, Haryana',
      status: 'pending',
      isComplete: true,
      missingFields: [],
    },
    {
      id: 'lst-103',
      title: 'Desi Red Onions (Incomplete Draft)',
      farmer: 'Suresh Patil',
      quantity: '0 Quintals',
      price: 0,
      district: 'Nashik',
      status: 'rejected',
      isComplete: false,
      missingFields: ['Price per unit missing', 'Zero quantity specified', 'Harvest moisture not certified'],
    },
  ]);

  const handleApproveListing = (listing: typeof pendingListings[0]) => {
    if (!listing.isComplete) {
      toast('Cannot approve: Listing is missing mandatory agronomic and pricing details!', 'error');
      return;
    }
    setPendingListings((prev) => prev.filter((l) => l.id !== listing.id));
    toast('Listing verified, approved, and published to national marketplace!', 'success');
  };

  const handleRejectListing = (id: string, reason = 'Incomplete farmer information') => {
    setPendingListings((prev) => prev.filter((l) => l.id !== id));
    toast(`Listing rejected (${reason}). Rejection notice sent to farmer.`, 'info');
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1E2A22]">
      {/* Admin Top Header */}
      <header className="bg-white border-b border-black/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-[#2D7A46] text-white flex items-center justify-center font-bold">
            KV
          </div>
          <div>
            <h1 className="font-serif text-lg font-bold text-[#1E2A22] leading-tight">
              Kisan Vyapar Admin Console
            </h1>
            <span className="text-[10px] text-stone-500 font-semibold tracking-wider uppercase">
              Platform Moderation &amp; Verification
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Link href="/">
            <Button variant="secondary" size="sm">
              View Storefront
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Admin Workspace */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Navigation Tabs */}
        <div className="flex space-x-2 border-b border-black/5 pb-2 text-xs font-bold">
          {[
            { id: 'overview', label: 'Platform Metrics & Trends' },
            { id: 'listings', label: 'Listing Moderation Queue' },
            { id: 'users', label: 'Farmer Verification & Users' },
            { id: 'orders', label: 'Dispute & Orders Oversight' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-[#2D7A46] shadow-xs border border-black/5'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-white border border-black/5 shadow-xs">
                <span className="text-xs text-stone-500 font-semibold">Total Gross Merchandise (GMV)</span>
                <div className="text-2xl font-bold text-[#2D7A46] mt-2">₹1,48,92,400</div>
                <span className="text-[11px] text-stone-400">▲ 24% this Kharif cycle</span>
              </div>
              <div className="p-5 rounded-2xl bg-white border border-black/5 shadow-xs">
                <span className="text-xs text-stone-500 font-semibold">Active Verified Farmers</span>
                <div className="text-2xl font-bold text-[#1E2A22] mt-2">1,280 Producers</div>
                <span className="text-[11px] text-[#2D7A46]">98.2% KYC Completed</span>
              </div>
              <div className="p-5 rounded-2xl bg-white border border-black/5 shadow-xs">
                <span className="text-xs text-stone-500 font-semibold">Wholesale Buyers</span>
                <div className="text-2xl font-bold text-[#1E2A22] mt-2">3,450 Companies</div>
                <span className="text-[11px] text-stone-400">Mills, Exporters &amp; Retailers</span>
              </div>
              <div className="p-5 rounded-2xl bg-white border border-black/5 shadow-xs">
                <span className="text-xs text-stone-500 font-semibold">Moderation Queue</span>
                <div className="text-2xl font-bold text-amber-600 mt-2">{pendingListings.length} In Review</div>
                <span className="text-[11px] text-amber-700">Strict completeness checks</span>
              </div>
            </div>

            {/* Performance Visualizer Card */}
            <div className="p-6 rounded-3xl bg-white border border-black/5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-black/5">
                <h3 className="font-serif text-lg font-bold text-[#1E2A22]">
                  Daily Mandi Trade Volume &amp; Turnout (Past 30 Days)
                </h3>
                <span className="text-xs bg-[#F3FAF4] text-[#2D7A46] px-3 py-1 rounded-full font-bold">
                  Peak Kharif Procurement Season
                </span>
              </div>
              <div className="h-44 w-full flex items-end justify-between gap-2 pt-6 px-4 bg-[#FAFCFA] rounded-2xl border border-black/5">
                {[45, 62, 55, 78, 90, 85, 95, 110, 105, 120, 135, 125, 140, 150, 145].map((val, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                    <div
                      style={{ height: `${(val / 160) * 100}%` }}
                      className="w-full bg-[#2D7A46]/80 group-hover:bg-[#2D7A46] rounded-t-md transition-all relative"
                    >
                      <span className="opacity-0 group-hover:opacity-100 absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-[#2D7A46] bg-white px-1 rounded shadow-xs">
                        ₹{val}L
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Listings Moderation Tab */}
        {activeTab === 'listings' && (
          <div className="p-6 rounded-3xl bg-white border border-black/5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-black/5">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#1E2A22]">
                  Crop Listing Moderation Queue
                </h3>
                <p className="text-xs text-[#617064]">
                  Incomplete submissions lacking pricing, photos, or valid quantities cannot be approved.
                </p>
              </div>
              <span className="text-xs bg-amber-100 text-amber-800 font-bold px-3 py-1 rounded-full">
                Strict Quality Gate Active
              </span>
            </div>

            {pendingListings.length === 0 ? (
              <p className="text-xs text-stone-400 py-6 text-center">
                All submitted crop listings have been reviewed and approved!
              </p>
            ) : (
              <div className="divide-y divide-black/5">
                {pendingListings.map((l) => (
                  <div key={l.id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-serif font-bold text-base text-[#1E2A22]">{l.title}</h4>
                        {l.isComplete ? (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            <span>All Information Complete</span>
                          </span>
                        ) : (
                          <span className="text-[10px] bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            <span>Incomplete Details (Blocked)</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#617064]">
                        Farmer: {l.farmer} • Location: {l.district} • Stock: {l.quantity} {l.price > 0 ? `@ ${formatINR(l.price)}/quintal` : '(Price Unspecified)'}
                      </p>
                      {!l.isComplete && l.missingFields.length > 0 && (
                        <div className="text-[11px] text-red-600 font-medium">
                          Issues: {l.missingFields.join(' • ')}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        disabled={!l.isComplete}
                        onClick={() => handleApproveListing(l)}
                        className={`flex items-center space-x-1 ${!l.isComplete ? 'opacity-40 cursor-not-allowed' : ''}`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve Listing</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleRejectListing(l.id, l.isComplete ? 'Quality audit rejection' : 'Incomplete information')}
                        className="flex items-center space-x-1 text-red-700 hover:bg-red-50"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="p-6 rounded-3xl bg-white border border-black/5 shadow-xs space-y-4">
            <h3 className="font-serif text-lg font-bold text-[#1E2A22]">
              Farmer Verification &amp; User Directory
            </h3>
            <div className="divide-y divide-black/5 text-xs text-[#1E2A22]">
              {currentUser && (
                <div className="py-3 flex justify-between items-center bg-[#F3FAF4]/60 px-3 rounded-xl border border-[#6FBF78]/30 mb-2">
                  <div>
                    <span className="font-bold text-[#2D7A46]">{currentUser.full_name}</span> ({currentUser.farmer_profile?.farm_name || (currentUser.role === 'farmer' ? 'Farm Registered' : 'Wholesale Procurement')})
                    <p className="text-[#617064]">
                      Phone: {currentUser.phone} • {currentUser.district}, {currentUser.state} • Live Database Record
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-600 text-white shadow-xs">
                    {currentUser.role.toUpperCase()} (ACTIVE SESSION)
                  </span>
                </div>
              )}
              <div className="py-3 flex justify-between items-center">
                <div>
                  <span className="font-bold">Rameshwar Patel</span> (Patel Organic Agro)
                  <p className="text-[#617064]">Aadhaar &amp; Land Record Khatauni: Verified • Sehore, MP</p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  Verified Producer
                </span>
              </div>
              <div className="py-3 flex justify-between items-center">
                <div>
                  <span className="font-bold">Gurpreet Singh Dhillon</span> (Dhillon Agro)
                  <p className="text-[#617064]">Aadhaar &amp; Soil Health Card: Verified • Karnal, Haryana</p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  Verified Producer
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Orders & Disputes Tab */}
        {activeTab === 'orders' && (
          <div className="p-6 rounded-3xl bg-white border border-black/5 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-black/5">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#1E2A22]">
                  Platform Order Disputes &amp; Oversight
                </h3>
                <p className="text-xs text-[#617064]">
                  Review buyer replacement requests, cancellation claims, and trigger escrow refunds or mediation
                </p>
              </div>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full">
                Escrow Guarantee Active
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#1E2A22]">
                <thead className="bg-[#FAFCFA] text-stone-500 uppercase tracking-wider text-[10px] border-b border-black/5">
                  <tr>
                    <th className="p-3">Order Number</th>
                    <th className="p-3">Buyer &amp; Farm</th>
                    <th className="p-3">Produce &amp; Value</th>
                    <th className="p-3">Dispute / Claim Type</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Moderator Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  <tr className="hover:bg-stone-50 transition-colors">
                    <td className="p-3 font-bold">ORD-KVP-10001</td>
                    <td className="p-3">
                      <div>Priya Sundaram</div>
                      <span className="text-[11px] text-[#617064]">Seller: Guntur Spice Farms</span>
                    </td>
                    <td className="p-3">
                      <div>2 Quintals Teja Chillies</div>
                      <span className="font-bold text-[#2D7A46]">₹39,600 (Paid Razorpay)</span>
                    </td>
                    <td className="p-3">
                      <span className="font-semibold text-amber-700">Moisture Content High</span>
                      <span className="block text-[11px] text-[#617064]">Buyer requested replacement batch</span>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                        Under Investigation
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => toast('Dispute resolved: Replacement order dispatched to buyer.', 'success')}
                          className="px-2.5 py-1 bg-[#2D7A46] text-white rounded-lg font-semibold hover:bg-[#236338]"
                        >
                          Approve Replace
                        </button>
                        <button
                          onClick={() => toast('Escrow refund of ₹39,600 initiated back to buyer bank account.', 'info')}
                          className="px-2.5 py-1 bg-red-100 text-red-700 rounded-lg font-semibold hover:bg-red-200"
                        >
                          Refund Escrow
                        </button>
                      </div>
                    </td>
                  </tr>

                  <tr className="hover:bg-stone-50 transition-colors">
                    <td className="p-3 font-bold">ORD-KVP-9982</td>
                    <td className="p-3">
                      <div>Apex Flour Mills</div>
                      <span className="text-[11px] text-[#617064]">Seller: Patel Organic Agro</span>
                    </td>
                    <td className="p-3">
                      <div>25 Quintals Sharbati Wheat</div>
                      <span className="font-bold text-[#2D7A46]">₹86,250 (COD Confirmed)</span>
                    </td>
                    <td className="p-3">
                      <span className="font-semibold text-emerald-800">Quality Verified</span>
                      <span className="block text-[11px] text-[#617064]">Dispatch completed with truck receipt</span>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Closed Satisfied
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <span className="text-[11px] text-stone-400 font-medium">Audit Cleared</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
