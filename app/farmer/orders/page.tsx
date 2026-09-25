'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Package, 
  Clock, 
  CheckCircle2, 
  Truck, 
  MapPin, 
  Phone, 
  FileText, 
  Filter,
  Check,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { formatINR } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

interface FarmerOrder {
  id: string;
  orderNumber: string;
  buyerName: string;
  buyerPhone: string;
  cropTitle: string;
  variety: string;
  quantity: number;
  unit: string;
  totalAmount: number;
  paymentMethod: 'cod' | 'razorpay';
  paymentStatus: 'pending' | 'paid' | 'escrow';
  fulfillmentStatus: 'new' | 'accepted' | 'packed' | 'dispatched' | 'delivered';
  deliveryType: 'Farm Pickup' | 'Farmer Door Delivery';
  deliveryAddress: string;
  orderDate: string;
  transportVehicleNumber?: string;
  trackingPhone?: string;
}

const INITIAL_FARMER_ORDERS: FarmerOrder[] = [
  {
    id: 'ord-1',
    orderNumber: 'ORD-KVP-10001',
    buyerName: 'Priya Sundaram (Spice Export Trade)',
    buyerPhone: '+91 98450 12890',
    cropTitle: 'Guntur Teja Chillies (Stemless)',
    variety: 'Teja S17 Export Quality',
    quantity: 2,
    unit: 'Quintals',
    totalAmount: 39600,
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
    buyerName: 'Apex Flour Mills Ltd.',
    buyerPhone: '+91 94250 88712',
    cropTitle: 'Certified Sharbati Wheat',
    variety: 'C-306 Golden Grain',
    quantity: 25,
    unit: 'Quintals',
    totalAmount: 86250,
    paymentMethod: 'cod',
    paymentStatus: 'pending',
    fulfillmentStatus: 'accepted',
    deliveryType: 'Farm Pickup',
    deliveryAddress: 'Farm Gate Pickup arranged by buyer (Truck MP-04-E-8821)',
    orderDate: 'Yesterday, 5:30 PM',
  },
  {
    id: 'ord-3',
    orderNumber: 'ORD-KVP-9988',
    buyerName: 'FreshBasket Hypermarkets',
    buyerPhone: '+91 98230 44109',
    cropTitle: 'Nashik Red Onions (Garwa)',
    variety: 'Garwa Export Quality',
    quantity: 40,
    unit: 'Quintals',
    totalAmount: 96000,
    paymentMethod: 'razorpay',
    paymentStatus: 'paid',
    fulfillmentStatus: 'dispatched',
    deliveryType: 'Farmer Door Delivery',
    deliveryAddress: 'Distribution Hub 3, Bhiwandi Logistics Park, Mumbai - 421302',
    orderDate: '23 Sep 2026',
    transportVehicleNumber: 'MH-15-AG-4902',
    trackingPhone: '+91 91580 33219'
  }
];

import { useCrops } from '@/context/CropContext';

export default function FarmerOrdersPage() {
  const { toast } = useToast();
  const { farmerOrders, updateFarmerOrderStatus } = useCrops();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dispatchModalOrder, setDispatchModalOrder] = useState<any | null>(null);
  const [vehicleNo, setVehicleNo] = useState('');
  const [driverContact, setDriverContact] = useState('');

  const filteredOrders = farmerOrders.filter((o) => {
    if (statusFilter === 'all') return true;
    return o.fulfillmentStatus === statusFilter;
  });

  const handleUpdateStatus = (orderId: string, nextStatus: any) => {
    updateFarmerOrderStatus(orderId, nextStatus);
    toast(`Order status successfully updated to: ${nextStatus.toUpperCase()}`, 'success');
  };

  const handleConfirmDispatch = () => {
    if (!dispatchModalOrder) return;
    if (!vehicleNo.trim() || !driverContact.trim()) {
      toast('Please enter vehicle number and driver phone number.', 'error');
      return;
    }

    updateFarmerOrderStatus(dispatchModalOrder.id, 'dispatched', {
      vehicleNo,
      trackingPhone: driverContact,
    });
    setDispatchModalOrder(null);
    setVehicleNo('');
    setDriverContact('');
    toast(`Dispatched ${dispatchModalOrder.orderNumber}! Driver details shared with buyer.`, 'success');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header & Sub-navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-black/5 gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-[#617064] mb-1">
            <Link href="/farmer" className="hover:text-[#2D7A46]">Farmer Portal</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[#2D7A46]">Orders Management</span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-[#1E2A22]">
            Farmer Orders & Fulfillment Queue
          </h1>
          <p className="text-xs text-[#617064] mt-0.5">
            Accept incoming farm bids, mark produce as packed, and dispatch with real-time transport tracking
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link href="/farmer">
            <Button variant="outline" size="sm">
              Overview Dashboard
            </Button>
          </Link>
          <Link href="/farmer/listings/new">
            <Button size="sm">
              + List New Crop
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 border-b border-black/5 text-xs font-bold">
        {[
          { key: 'all', label: 'All Orders' },
          { key: 'new', label: 'New Requests' },
          { key: 'accepted', label: 'Accepted' },
          { key: 'packed', label: 'Packed' },
          { key: 'dispatched', label: 'In-Transit / Dispatched' },
          { key: 'delivered', label: 'Completed' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`px-4 py-2 rounded-xl transition-all capitalize whitespace-nowrap ${
              statusFilter === tab.key
                ? 'bg-[#2D7A46] text-white shadow-xs'
                : 'bg-white border border-black/5 text-[#617064] hover:bg-stone-50'
            }`}
          >
            {tab.label} ({farmerOrders.filter((o) => tab.key === 'all' || o.fulfillmentStatus === tab.key).length})
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-black/5">
            <p className="font-serif text-lg font-bold text-[#1E2A22]">No orders found in this status</p>
            <p className="text-xs text-[#617064] mt-1">Check other fulfillment tabs or promote your crop listings.</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order.id}
              className="p-6 rounded-3xl liquid-glass-card space-y-4"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-black/5">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-[#F3FAF4] text-[#2D7A46] flex items-center justify-center font-bold">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm text-[#1E2A22]">{order.orderNumber}</span>
                      <span className="text-[11px] text-[#617064]">• {order.orderDate}</span>
                    </div>
                    <div className="text-xs font-semibold text-[#2D7A46]">
                      {order.cropTitle} ({order.variety})
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      order.fulfillmentStatus === 'new'
                        ? 'bg-amber-100 text-amber-800 animate-pulse'
                        : order.fulfillmentStatus === 'accepted'
                        ? 'bg-blue-100 text-blue-800'
                        : order.fulfillmentStatus === 'packed'
                        ? 'bg-purple-100 text-purple-800'
                        : order.fulfillmentStatus === 'dispatched'
                        ? 'bg-indigo-100 text-indigo-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {order.fulfillmentStatus}
                  </span>

                  <span className="text-xs bg-stone-100 text-stone-700 px-2.5 py-1 rounded-full font-medium">
                    {order.paymentMethod.toUpperCase()} • {order.paymentStatus.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Order Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-stone-400 block text-[11px]">Buyer & Contact</span>
                  <span className="font-bold text-[#1E2A22] block mt-0.5">{order.buyerName}</span>
                  <span className="text-[#617064] flex items-center gap-1 mt-0.5">
                    <Phone className="w-3 h-3" /> {order.buyerPhone}
                  </span>
                </div>

                <div>
                  <span className="text-stone-400 block text-[11px]">Quantity & Settlement</span>
                  <span className="font-bold text-[#1E2A22] block mt-0.5">
                    {order.quantity} {order.unit}
                  </span>
                  <span className="font-bold text-[#2D7A46] block text-sm">
                    {formatINR(order.totalAmount)}
                  </span>
                </div>

                <div className="sm:col-span-2">
                  <span className="text-stone-400 block text-[11px]">Fulfillment & Destination</span>
                  <span className="font-semibold text-[#1E2A22] block mt-0.5">
                    {order.deliveryType}
                  </span>
                  <span className="text-[#617064] block mt-0.5 truncate">
                    {order.deliveryAddress}
                  </span>
                  {order.transportVehicleNumber && (
                    <span className="inline-block mt-1 text-[11px] bg-stone-100 text-stone-800 px-2 py-0.5 rounded font-mono">
                      Vehicle: {order.transportVehicleNumber} | Driver: {order.trackingPhone}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons based on status */}
              <div className="pt-3 border-t border-black/5 flex flex-wrap items-center justify-between gap-3">
                <div className="text-[11px] text-[#617064]">
                  {order.fulfillmentStatus === 'new' && 'Order received. Review buyer details and accept to lock harvest.'}
                  {order.fulfillmentStatus === 'accepted' && 'Order accepted. Prepare harvest and packing into designated crates/sacks.'}
                  {order.fulfillmentStatus === 'packed' && 'Produce packed and quality inspected. Ready to hand over to transporter.'}
                  {order.fulfillmentStatus === 'dispatched' && 'Produce in-transit with transport partner. Delivery receipt pending.'}
                  {order.fulfillmentStatus === 'delivered' && 'Order successfully delivered. Funds credited to farmer escrow payout.'}
                </div>

                <div className="flex items-center space-x-2">
                  {order.fulfillmentStatus === 'new' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleUpdateStatus(order.id, 'accepted')}
                        className="flex items-center space-x-1"
                      >
                        <Check className="w-4 h-4" />
                        <span>Accept Order</span>
                      </Button>
                    </>
                  )}

                  {order.fulfillmentStatus === 'accepted' && (
                    <Button
                      size="sm"
                      onClick={() => handleUpdateStatus(order.id, 'packed')}
                      className="bg-purple-700 hover:bg-purple-800 text-white flex items-center space-x-1"
                    >
                      <Package className="w-4 h-4" />
                      <span>Mark as Packed</span>
                    </Button>
                  )}

                  {order.fulfillmentStatus === 'packed' && (
                    <Button
                      size="sm"
                      onClick={() => setDispatchModalOrder(order)}
                      className="bg-indigo-700 hover:bg-indigo-800 text-white flex items-center space-x-1"
                    >
                      <Truck className="w-4 h-4" />
                      <span>Dispatch Order</span>
                    </Button>
                  )}

                  {order.fulfillmentStatus === 'dispatched' && (
                    <Button
                      size="sm"
                      onClick={() => handleUpdateStatus(order.id, 'delivered')}
                      className="bg-emerald-700 hover:bg-emerald-800 text-white flex items-center space-x-1"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirm Delivery</span>
                    </Button>
                  )}

                  <Link href={`/orders/${order.orderNumber}`} target="_blank">
                    <Button variant="outline" size="sm" className="flex items-center space-x-1">
                      <FileText className="w-3.5 h-3.5" />
                      <span>View Receipt</span>
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Dispatch Tracking Modal */}
      {dispatchModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-black/5">
              <div className="flex items-center space-x-2">
                <Truck className="w-5 h-5 text-[#2D7A46]" />
                <h3 className="font-serif text-lg font-bold text-[#1E2A22]">
                  Dispatch Produce
                </h3>
              </div>
              <button
                onClick={() => setDispatchModalOrder(null)}
                className="text-stone-400 hover:text-stone-700 font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#617064]">
              Dispatching <span className="font-bold text-[#1E2A22]">{dispatchModalOrder.cropTitle}</span> for{' '}
              <span className="font-bold text-[#1E2A22]">{dispatchModalOrder.buyerName}</span>. Please provide tracking particulars for delivery coordination.
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#1E2A22] block mb-1">
                  Transport Vehicle / Truck Registration No.
                </label>
                <input
                  type="text"
                  placeholder="e.g. MP-04-E-8821 or KA-01-AB-1234"
                  value={vehicleNo}
                  onChange={(e) => setVehicleNo(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-black/10 focus:outline-none focus:border-[#2D7A46]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#1E2A22] block mb-1">
                  Driver / Transporter Mobile Phone
                </label>
                <input
                  type="tel"
                  placeholder="e.g. +91 98765 43210"
                  value={driverContact}
                  onChange={(e) => setDriverContact(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-black/10 focus:outline-none focus:border-[#2D7A46]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-black/5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDispatchModalOrder(null)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleConfirmDispatch}
                className="bg-[#2D7A46] text-white"
              >
                Confirm Dispatch
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
