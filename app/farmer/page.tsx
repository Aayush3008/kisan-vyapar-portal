'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Sprout, 
  TrendingUp, 
  Package, 
  AlertCircle, 
  Plus, 
  Check, 
  X, 
  Eye, 
  Clock,
  Star,
  MessageSquare,
  Truck,
  Banknote,
  Percent,
  CheckCircle2,
  MapPin
} from 'lucide-react';
import { formatINR } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { useRole } from '@/context/RoleContext';
import { useCrops } from '@/context/CropContext';

export default function FarmerDashboard() {
  const { currentUser, userLocation } = useRole();
  const { crops, farmerOrders, updateFarmerOrderStatus, feedbacks, updateCrop } = useCrops();
  
  const farmerName = currentUser?.role === 'farmer' ? currentUser.full_name : 'Rameshwar Patel (Farmer)';
  const farmName = currentUser?.farmer_profile?.farm_name || 'Kisan Agro Organics';
  const location = currentUser?.district 
    ? `${currentUser.district}, ${currentUser.state}` 
    : `${userLocation?.district || 'Meerut'}, ${userLocation?.state || 'Uttar Pradesh'}`;

  const pendingOrders = farmerOrders.filter((o) => o.fulfillmentStatus === 'new' || o.fulfillmentStatus === 'accepted');
  const totalSalesRevenue = farmerOrders
    .filter((o) => o.fulfillmentStatus !== 'cancelled')
    .reduce((acc, o) => acc + o.totalAmount, 0);

  const handleAccept = (orderId: string) => {
    updateFarmerOrderStatus(orderId, 'accepted');
  };

  const handleDispatch = (orderId: string) => {
    updateFarmerOrderStatus(orderId, 'dispatched', {
      vehicleNo: 'UP-15-BT-4821',
      trackingPhone: '+91 98971 44552',
    });
  };

  const handleReject = (orderId: string) => {
    updateFarmerOrderStatus(orderId, 'cancelled');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Farmer Greeting & CTA */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-black/5 gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs uppercase font-bold tracking-wider text-[#2D7A46]">Farmer Management Portal</span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
              Live Mandi Connected
            </span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#1E2A22]">
            Welcome Back, {farmerName}
          </h1>
          <p className="text-xs text-[#617064] mt-0.5 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#2D7A46]" />
            <span>{farmName} • {location} • Verified Direct Producer</span>
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link href="/farmer/orders">
            <Button variant="outline" size="sm" className="flex items-center space-x-1.5">
              <Package className="w-4 h-4 text-[#2D7A46]" />
              <span>Orders Queue ({farmerOrders.length})</span>
            </Button>
          </Link>
          <Link href="/farmer/listings/new">
            <Button size="sm" className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>List New Crop Produce</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-black/5 bg-white shadow-subtle">
          <div className="text-xs font-semibold text-[#617064]">Active Farm Crops</div>
          <div className="text-3xl font-bold text-[#1E2A22] mt-2">{crops.length} Batches</div>
          <div className="text-[11px] text-[#2D7A46] font-semibold mt-1">● Published in National Mandi</div>
        </div>

        <div className="p-5 rounded-2xl border border-black/5 bg-white shadow-subtle">
          <div className="text-xs font-semibold text-[#617064]">Total Farmer Sales</div>
          <div className="text-3xl font-bold text-[#2D7A46] mt-2">{formatINR(totalSalesRevenue || 428500)}</div>
          <div className="text-[11px] text-[#2D7A46] font-semibold mt-1">▲ 18.5% Direct-to-Buyer Margin</div>
        </div>

        <div className="p-5 rounded-2xl border border-black/5 bg-white shadow-subtle">
          <div className="text-xs font-semibold text-[#617064]">Live Incoming Orders</div>
          <div className="text-3xl font-bold text-amber-600 mt-2">{pendingOrders.length} Orders</div>
          <div className="text-[11px] text-amber-700 font-semibold mt-1">Cash on Delivery &amp; Escrow</div>
        </div>

        <div className="p-5 rounded-2xl border border-black/5 bg-white shadow-subtle">
          <div className="text-xs font-semibold text-[#617064]">Buyer Trust Rating</div>
          <div className="text-3xl font-bold text-[#1E2A22] mt-2 flex items-center gap-1">
            <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
            <span>4.9/5</span>
          </div>
          <div className="text-[11px] text-[#2D7A46] font-semibold mt-1">{feedbacks.length} Verified Buyer Reviews</div>
        </div>
      </div>

      {/* Real-Time Buyer Incoming Orders with COD & Details */}
      <div className="p-6 rounded-3xl border border-black/5 bg-white shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-black/5 gap-2">
          <div>
            <h3 className="font-serif text-xl font-bold text-[#1E2A22] flex items-center gap-2">
              <span>Real-Time Incoming Buyer Orders</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            </h3>
            <span className="text-xs text-[#617064]">Orders placed by users appear here immediately with full dispatch details</span>
          </div>
          <Link href="/farmer/orders" className="text-xs font-bold text-[#2D7A46] hover:underline">
            View All Orders Archive →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#1E2A22]">
            <thead className="bg-[#FAFCFA] text-stone-500 uppercase tracking-wider text-[10px] border-b border-black/5">
              <tr>
                <th className="p-3">Order Number</th>
                <th className="p-3">Buyer &amp; Delivery Destination</th>
                <th className="p-3">Crop Produce</th>
                <th className="p-3">Quantity</th>
                <th className="p-3">Amount &amp; Payment Mode</th>
                <th className="p-3">Fulfillment Status</th>
                <th className="p-3 text-right">Farmer Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {farmerOrders.slice(0, 5).map((o) => (
                <tr key={o.id} className="hover:bg-stone-50 transition-colors">
                  <td className="p-3 font-bold text-[#1E2A22]">
                    {o.orderNumber}
                    <span className="text-[10px] text-stone-400 block font-normal">{o.orderDate}</span>
                  </td>
                  <td className="p-3">
                    <span className="font-bold text-[#1E2A22] block">{o.buyerName}</span>
                    <span className="text-[11px] text-[#617064] block">{o.buyerPhone}</span>
                    <span className="text-[10px] text-stone-500 block max-w-xs truncate">{o.deliveryAddress}</span>
                  </td>
                  <td className="p-3">
                    <span className="font-semibold text-[#2D7A46] block">{o.cropTitle}</span>
                    <span className="text-[10px] text-[#617064]">{o.variety}</span>
                  </td>
                  <td className="p-3 font-bold">
                    {o.quantity} {o.unit}
                  </td>
                  <td className="p-3">
                    <div className="font-bold text-sm text-[#1E2A22]">{formatINR(o.totalAmount)}</div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        o.paymentMethod === 'cod' 
                          ? 'bg-amber-100 text-amber-900 border border-amber-200' 
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {o.paymentMethod === 'cod' ? '💵 Cash on Delivery (COD)' : '💳 Paid Online (Escrow)'}
                      </span>
                    </div>
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        o.fulfillmentStatus === 'accepted' || o.fulfillmentStatus === 'delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : o.fulfillmentStatus === 'dispatched'
                          ? 'bg-blue-100 text-blue-800'
                          : o.fulfillmentStatus === 'cancelled'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800 animate-pulse'
                      }`}
                    >
                      {o.fulfillmentStatus.toUpperCase()}
                    </span>
                    {o.transportVehicleNumber && (
                      <span className="text-[10px] text-stone-500 block mt-1">
                        Truck: {o.transportVehicleNumber}
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-right">
                    {o.fulfillmentStatus === 'new' ? (
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => handleAccept(o.id)}
                          className="px-2.5 py-1 bg-[#2D7A46] text-white rounded-lg font-semibold hover:bg-[#25663a] flex items-center space-x-1 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Accept</span>
                        </button>
                        <button
                          onClick={() => handleReject(o.id)}
                          className="px-2 py-1 bg-red-100 text-red-700 rounded-lg font-semibold hover:bg-red-200 flex items-center space-x-1 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </div>
                    ) : o.fulfillmentStatus === 'accepted' ? (
                      <button
                        onClick={() => handleDispatch(o.id)}
                        className="px-2.5 py-1 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 flex items-center space-x-1 cursor-pointer ml-auto"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>Dispatch Truck</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-stone-400 font-medium">Completed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* NEW FEATURE: Buyer Feedbacks & Reviews Dashboard */}
      <div className="p-6 rounded-3xl border border-black/5 bg-white shadow-card space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-black/5">
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5 text-[#2D7A46]" />
            <h3 className="font-serif text-xl font-bold text-[#1E2A22]">
              Buyer Feedback &amp; Ratings Received
            </h3>
          </div>
          <span className="text-xs text-[#617064]">
            Live testimonials left by buyers for your produce
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {feedbacks.map((fb) => (
            <div key={fb.id} className="p-4 rounded-2xl border border-black/5 bg-[#FAFCFA] flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-1 text-amber-500">
                    {Array.from({ length: fb.rating }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <span className="text-[10px] text-stone-400">
                    {new Date(fb.created_at).toLocaleDateString('en-IN', { dateStyle: 'short' })}
                  </span>
                </div>
                <h5 className="font-bold text-xs text-[#2D7A46] line-clamp-1">{fb.crop_title}</h5>
                <p className="text-xs text-stone-700 italic mt-1 leading-relaxed line-clamp-3">
                  &ldquo;{fb.comment}&rdquo;
                </p>
              </div>

              <div className="pt-2 border-t border-black/5 flex items-center justify-between text-[11px]">
                <span className="font-bold text-[#1E2A22]">{fb.user_name}</span>
                <span className="text-[#617064] text-[10px]">{fb.user_district || 'Buyer'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Crop Listings Overview & Fast Discount Controller */}
      <div className="p-6 rounded-3xl border border-black/5 bg-white shadow-card space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-black/5">
          <div>
            <h3 className="font-serif text-xl font-bold text-[#1E2A22]">
              Manage Crops &amp; Live Farmer Discounts
            </h3>
            <p className="text-xs text-[#617064]">
              Set or adjust instant discounts to attract more bulk buyers from your district
            </p>
          </div>
          <div className="flex items-center space-x-3 text-xs font-bold text-[#2D7A46]">
            <Link href="/farmer/listings" className="hover:underline">
              View Full Catalog
            </Link>
            <span>•</span>
            <Link href="/farmer/listings/new" className="hover:underline">
              + Add Another Crop
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {crops.slice(0, 6).map((c) => (
            <div key={c.id} className="p-4 rounded-xl border border-black/5 bg-[#FAFCFA] flex space-x-3">
              <img
                src={c.primary_image}
                alt={c.title}
                className="w-16 h-16 rounded-lg object-cover border border-black/5 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-serif font-bold text-sm text-[#1E2A22] truncate">{c.title}</h4>
                <p className="text-xs text-[#617064]">{c.stock_quantity} {c.unit}s in inventory</p>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-xs font-bold text-[#2D7A46]">{formatINR(c.price_per_unit)}</span>
                  <div className="flex items-center gap-1">
                    <Percent className="w-3 h-3 text-[#2D7A46]" />
                    <select
                      value={c.discount_percentage || 0}
                      onChange={(e) => updateCrop(c.id, { discount_percentage: Number(e.target.value) })}
                      className="text-[10px] font-bold py-0.5 px-1 bg-white border border-black/10 rounded"
                    >
                      <option value={0}>0%</option>
                      <option value={5}>5%</option>
                      <option value={10}>10%</option>
                      <option value={15}>15%</option>
                      <option value={20}>20%</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
