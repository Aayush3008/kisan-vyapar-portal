'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Package, 
  MapPin, 
  Heart, 
  User, 
  Plus, 
  RotateCcw, 
  XCircle, 
  ShieldCheck, 
  AlertCircle,
  CheckCircle2,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { formatINR } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';
import { useRole } from '@/context/RoleContext';
import { useCrops } from '@/context/CropContext';

export default function BuyerAccountPage() {
  const { toast } = useToast();
  const { currentUser } = useRole();
  const { farmerOrders } = useCrops();
  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'wishlist' | 'profile'>('orders');

  const [orders, setOrders] = useState<any[]>([]);

  // Sync logged in user's real purchases strictly scoped by user ID / phone / email
  React.useEffect(() => {
    if (!currentUser) {
      setOrders([]);
      return;
    }

    // Filter incoming real orders placed by this buyer
    const userPhoneClean = (currentUser.phone || '').replace(/\D/g, '');
    const userMatchingOrders = farmerOrders.filter((fo) => {
      if (fo.buyerId && currentUser.id && fo.buyerId === currentUser.id) return true;
      if (fo.buyerPhone && userPhoneClean) {
        const buyerPhoneClean = fo.buyerPhone.replace(/\D/g, '');
        if (buyerPhoneClean && buyerPhoneClean === userPhoneClean) return true;
      }
      if (fo.buyerEmail && currentUser.email) {
        if (fo.buyerEmail.toLowerCase() === currentUser.email.toLowerCase()) return true;
      }
      return false;
    });

    const mapped = userMatchingOrders.map((mo) => ({
      id: mo.orderNumber || mo.id,
      date: mo.orderDate || 'Recent',
      total: mo.totalAmount,
      status: mo.fulfillmentStatus === 'new' ? 'New Order (Awaiting Farmer Dispatch)' : mo.fulfillmentStatus.toUpperCase(),
      crop: mo.cropTitle,
      quantity: `${mo.quantity} ${mo.unit || 'Quintals'}`,
      farmer_name: mo.farmerName || 'Verified Producer',
      farmer_rating: 4.95,
      farm_name: 'Direct Farm Gate',
      canCancel: mo.fulfillmentStatus === 'new',
      canReplace: mo.fulfillmentStatus === 'delivered',
    }));

    setOrders(mapped);
  }, [currentUser, farmerOrders]);

  // Modal State for Cancellation / Replacement
  const [activeActionModal, setActiveActionModal] = useState<{
    type: 'cancel' | 'replace' | null;
    orderId: string | null;
  }>({ type: null, orderId: null });

  const [actionReason, setActionReason] = useState('Quality not matching specifications (moisture/foreign matter)');
  const [actionComments, setActionComments] = useState('');

  const handleOpenActionModal = (type: 'cancel' | 'replace', orderId: string) => {
    setActiveActionModal({ type, orderId });
    setActionComments('');
  };

  const handleConfirmAction = () => {
    const { type, orderId } = activeActionModal;
    if (!orderId || !type) return;

    if (type === 'cancel') {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? { ...o, status: 'Cancelled by Buyer (Full Refund/No Due)', canCancel: false, canReplace: false }
            : o
        )
      );
      toast(`Order ${orderId} cancelled. Farmer notified and inventory released.`, 'info');
    } else {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? { ...o, status: 'Batch Replacement Requested (Under Inspection)', canReplace: false }
            : o
        )
      );
      toast(`Replacement request submitted for ${orderId}. Farmer will coordinate exchange dispatch.`, 'success');
    }

    setActiveActionModal({ type: null, orderId: null });
  };

  const [addresses, setAddresses] = useState([
    {
      id: 'addr-1',
      title: 'Central Pune Mandi Warehouse',
      address: 'Plot 45, Mandi Commercial Hub, Near APMC Gate 2, Pune, Maharashtra - 411037',
      phone: '+91 9876543210',
      isDefault: true,
    },
  ]);

  React.useEffect(() => {
    if (!currentUser?.id) return;
    fetch(`/api/addresses?userId=${currentUser.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.addresses && Array.isArray(data.addresses) && data.addresses.length > 0) {
          setAddresses(data.addresses);
        }
      })
      .catch((err) => console.warn('Could not load addresses from Supabase:', err));
  }, [currentUser]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Account Header */}
      <div className="pb-6 border-b border-black/5">
        <span className="text-xs uppercase font-bold tracking-wider text-[#2D7A46]">Buyer Dashboard</span>
        <h1 className="font-serif text-3xl font-bold text-[#1E2A22]">
          {currentUser?.full_name || 'Ananya Sharma'}
        </h1>
        <p className="text-xs text-[#617064] mt-0.5">
          {currentUser?.role === 'farmer' ? 'Verified Farmer Producer' : 'Procurement Buyer Partner'} • {currentUser?.email || 'buyer@kisanvyapar.in'} • {currentUser?.phone || '+91 98765 43210'}
        </p>

        {/* Tab switcher */}
        <div className="flex space-x-4 pt-6 border-b border-black/5 text-xs font-bold">
          {[
            { id: 'orders', label: 'Order History & Tracking', icon: Package },
            { id: 'addresses', label: 'Saved Address Book', icon: MapPin },
            { id: 'wishlist', label: 'Favorite Farms', icon: Heart },
            { id: 'profile', label: 'Profile Settings', icon: User },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-1.5 pb-2.5 transition-all ${
                  activeTab === tab.id
                    ? 'text-[#2D7A46] border-b-2 border-[#2D7A46]'
                    : 'text-stone-400 hover:text-stone-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Panels */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-xl font-bold text-[#1E2A22]">Active &amp; Past Orders</h3>
            <span className="text-xs text-[#2D7A46] font-semibold bg-[#F3FAF4] px-3 py-1 rounded-full border border-black/5">
              100% Quality Guarantee • Easy Replacement &amp; Cancellation
            </span>
          </div>

          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-stone-50 border border-black/5 space-y-4">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-[#F3FAF4] flex items-center justify-center">
                  <Package className="w-8 h-8 text-[#2D7A46]" />
                </div>
                <div>
                  <h4 className="font-serif text-lg font-bold text-[#1E2A22]">No Orders Placed Yet</h4>
                  <p className="text-xs text-[#617064] max-w-sm mx-auto mt-1">
                    Your order history will appear here once you place an order. Fresh produce from verified farmers is waiting for you!
                  </p>
                </div>
                <Link href="/crops">
                  <Button size="sm">Browse Farm Marketplace</Button>
                </Link>
              </div>
            ) : (
              orders.map((o) => (
                <div key={o.id} className="p-6 rounded-3xl liquid-glass-card space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-black/5 gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm text-[#1E2A22]">{o.id}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        o.status.includes('Cancelled')
                          ? 'bg-red-100 text-red-800'
                          : o.status.includes('Replacement')
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {o.status}
                      </span>
                    </div>
                    <span className="text-xs text-[#617064]">Ordered on {o.date}</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    <div className="md:col-span-6 space-y-1">
                      <h4 className="font-serif font-bold text-base text-[#1E2A22]">{o.crop}</h4>
                      <p className="text-xs text-[#617064]">Batch Size: <strong>{o.quantity}</strong> • Total Paid/Due: <strong className="text-[#2D7A46]">{formatINR(o.total)}</strong></p>

                      {/* Farmer Identity & Rating Box */}
                      <div className="mt-2 inline-flex items-center space-x-2 bg-[#F3FAF4] px-3 py-1.5 rounded-xl border border-black/5 text-xs">
                        <ShieldCheck className="w-4 h-4 text-[#2D7A46]" />
                        <span className="text-[#617064]">Sold by:</span>
                        <span className="font-bold text-[#1E2A22]">{o.farmer_name}</span>
                        <span className="text-[10px] text-stone-400">({o.farm_name})</span>
                        <span className="bg-white px-1.5 py-0.5 rounded text-amber-600 font-bold text-[11px] border border-black/5">
                          ★ {o.farmer_rating}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons: Cancel, Replace Item, Timeline */}
                    <div className="md:col-span-6 flex flex-wrap items-center justify-end gap-2 pt-2 md:pt-0">
                      {/* Replace Item Option */}
                      {o.canReplace && (
                        <button
                          onClick={() => handleOpenActionModal('replace', o.id)}
                          className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Request Replacement</span>
                        </button>
                      )}

                      {/* Cancel Option */}
                      {o.canCancel && (
                        <button
                          onClick={() => handleOpenActionModal('cancel', o.id)}
                          className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Cancel Order</span>
                        </button>
                      )}

                      <Link href={`/orders/${o.id}`}>
                        <Button variant="secondary" size="sm">
                          Track Live Timeline
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Address & Wishlist Tab Panels */}
      {activeTab === 'addresses' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-xl font-bold text-[#1E2A22]">Delivery Addresses</h3>
            <Button size="sm" className="flex items-center space-x-1">
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Address</span>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map((a) => (
              <div key={a.id} className="p-5 rounded-2xl border border-black/5 bg-white shadow-subtle space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-serif font-bold text-sm text-[#1E2A22]">{a.title}</span>
                  {a.isDefault && (
                    <span className="text-[10px] bg-[#F3FAF4] text-[#2D7A46] font-bold px-2 py-0.5 rounded-full">
                      Default
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#617064] leading-relaxed">{a.address}</p>
                <p className="text-xs font-medium text-[#1E2A22]">Coordination Contact: {a.phone}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'wishlist' && (
        <div className="space-y-4">
          <h3 className="font-serif text-xl font-bold text-[#1E2A22]">Favorite Agro Producers</h3>
          <p className="text-xs text-[#617064]">Direct notifications when your bookmarked farms list fresh harvest batches.</p>
          <div className="p-6 rounded-2xl border border-black/5 bg-white shadow-subtle flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-[#2D7A46] text-white flex items-center justify-center font-bold">
                P
              </div>
              <div>
                <h4 className="font-serif font-bold text-sm text-[#1E2A22]">Patel Organic Agro Farms</h4>
                <p className="text-xs text-[#617064]">Sehore, Madhya Pradesh • Sharbati Wheat Specialists</p>
              </div>
            </div>
            <Link href="/crops">
              <Button size="sm" variant="secondary">View Fresh Listings</Button>
            </Link>
          </div>
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="max-w-xl space-y-4">
          <h3 className="font-serif text-xl font-bold text-[#1E2A22]">Profile Settings</h3>
          <Input label="Full Name" defaultValue="Ananya Sharma" />
          <Input label="Email Address" defaultValue="ananya.sharma@example.com" />
          <Input label="Contact Phone" defaultValue="+91 9876543210" />
          <Button size="sm">Save Changes</Button>
        </div>
      )}

      {/* Replacement / Cancellation Modal */}
      <Modal
        isOpen={activeActionModal.type !== null}
        onClose={() => setActiveActionModal({ type: null, orderId: null })}
        title={activeActionModal.type === 'cancel' ? 'Cancel Order & Release Stock' : 'Request Crop Batch Replacement'}
      >
        <div className="space-y-4 pt-2">
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
            <span>
              {activeActionModal.type === 'cancel'
                ? 'Orders can be cancelled before driver departure. Stock is instantly restored to the farmer.'
                : 'If harvested quality does not match the listed grade, moisture level, or specification, the farmer is bound to provide a fresh batch or refund.'}
            </span>
          </div>

          <div>
            <label className="text-xs font-bold uppercase text-[#617064] block mb-1">
              Select Primary Reason *
            </label>
            <select
              value={actionReason}
              onChange={(e) => setActionReason(e.target.value)}
              className="w-full text-xs p-3 rounded-lg border border-black/10 focus:border-[#2D7A46] focus:outline-none bg-white"
            >
              <option>Quality not matching specifications (moisture/foreign matter)</option>
              <option>Damaged or contaminated during transit</option>
              <option>Dispatch delay exceeding agreement window</option>
              <option>Incorrect weight or broken packing bags</option>
              <option>Procured alternative batch locally</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold uppercase text-[#617064] block mb-1">
              Inspection Notes / Evidence Details
            </label>
            <textarea
              rows={3}
              value={actionComments}
              onChange={(e) => setActionComments(e.target.value)}
              placeholder="Provide specific notes regarding quality or defect observed during weighment inspection..."
              className="w-full text-xs p-3 rounded-lg border border-black/10 focus:border-[#2D7A46] focus:outline-none"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2 border-t border-black/5">
            <Button
              variant="secondary"
              onClick={() => setActiveActionModal({ type: null, orderId: null })}
            >
              Back
            </Button>
            <Button
              onClick={handleConfirmAction}
              className={activeActionModal.type === 'cancel' ? 'bg-red-600 hover:bg-red-700' : ''}
            >
              {activeActionModal.type === 'cancel' ? 'Confirm Cancellation' : 'Submit Replacement Request'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
