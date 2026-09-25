'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit3, 
  PauseCircle, 
  PlayCircle, 
  Trash2, 
  ExternalLink,
  ChevronRight,
  TrendingDown,
  ShieldCheck,
  Package
} from 'lucide-react';
import { MOCK_CROPS } from '@/lib/mock-data';
import { formatINR } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { useCrops } from '@/context/CropContext';

export default function FarmerListingsPage() {
  const { toast } = useToast();
  const { crops, updateCrop, deleteCrop } = useCrops();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [search, setSearch] = useState('');

  const filteredCrops = crops.filter((c) => {
    if (filterStatus === 'active' && c.stock_quantity === 0) return false;
    if (filterStatus === 'sold_out' && c.stock_quantity > 0) return false;
    if (search.trim() !== '') {
      const q = search.toLowerCase();
      return c.title.toLowerCase().includes(q) || c.variety.toLowerCase().includes(q);
    }
    return true;
  });

  const handleToggleStatus = (id: string) => {
    const crop = crops.find((c) => c.id === id);
    if (!crop) return;
    const nextStock = crop.stock_quantity > 0 ? 0 : 50;
    updateCrop(id, { stock_quantity: nextStock });
    toast(`Listing status updated for ${crop.title}`, 'info');
  };

  const handleDeleteListing = (id: string, title: string) => {
    deleteCrop(id);
    toast(`Listing "${title}" deleted from farm catalog.`, 'error');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-black/5 gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-[#617064] mb-1">
            <Link href="/farmer" className="hover:text-[#2D7A46]">Farmer Portal</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[#2D7A46]">Listings Catalog</span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-[#1E2A22]">
            My Farm Crop Listings
          </h1>
          <p className="text-xs text-[#617064] mt-0.5">
            Manage your harvested produce batches, adjust pricing against APMC rates, and pause or restock inventory
          </p>
        </div>

        <Link href="/farmer/listings/new">
          <Button className="flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>List New Harvested Crop</span>
          </Button>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-2 overflow-x-auto text-xs font-bold">
          {['all', 'active', 'sold_out'].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-4 py-2 rounded-xl transition-all capitalize whitespace-nowrap ${
                filterStatus === s
                  ? 'bg-[#2D7A46] text-white shadow-xs'
                  : 'bg-white border border-black/5 text-[#617064] hover:bg-stone-50'
              }`}
            >
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="relative sm:w-72">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search crop or variety..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-black/10 bg-white focus:outline-none focus:border-[#2D7A46]"
          />
        </div>
      </div>

      {/* Listings Table */}
      <div className="p-6 rounded-3xl border border-black/5 bg-white shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#1E2A22]">
            <thead className="bg-[#FAFCFA] text-stone-500 uppercase tracking-wider text-[10px] border-b border-black/5">
              <tr>
                <th className="p-3">Produce</th>
                <th className="p-3">Quality & Grade</th>
                <th className="p-3">Base Price</th>
                <th className="p-3">Farmer Discount</th>
                <th className="p-3">Govt Mandi Rate</th>
                <th className="p-3">Available Stock</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {filteredCrops.map((crop) => (
                <tr key={crop.id} className="hover:bg-stone-50/80 transition-colors">
                  <td className="p-3">
                    <div className="flex items-center space-x-3">
                      <img
                        src={crop.primary_image}
                        alt={crop.title}
                        className="w-12 h-12 rounded-xl object-cover border border-black/5 shrink-0"
                      />
                      <div>
                        <Link
                          href={`/crops/${crop.slug}`}
                          className="font-bold text-sm text-[#1E2A22] hover:text-[#2D7A46] flex items-center gap-1"
                        >
                          <span>{crop.title}</span>
                          <ExternalLink className="w-3 h-3 text-stone-400" />
                        </Link>
                        <p className="text-[11px] text-[#617064]">
                          {crop.variety} • Harvested {crop.harvest_date}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="p-3">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#F3FAF4] text-[#2D7A46] border border-[#6FBF78]/30">
                      {crop.grade}
                    </span>
                  </td>

                  <td className="p-3 font-bold text-sm text-[#1E2A22]">
                    {formatINR(crop.price_per_unit)} / {crop.unit}
                  </td>

                  <td className="p-3">
                    <div className="flex items-center space-x-1.5">
                      <select
                        value={crop.discount_percentage || 0}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          updateCrop(crop.id, { discount_percentage: val });
                          toast(`Updated discount for ${crop.title} to ${val}%`, 'success');
                        }}
                        className="text-[11px] font-bold py-1 px-2 rounded-lg border border-black/10 bg-[#F3FAF4] text-[#2D7A46] focus:outline-none cursor-pointer"
                      >
                        <option value={0}>0% (None)</option>
                        <option value={5}>5% Cut</option>
                        <option value={10}>10% Special</option>
                        <option value={15}>15% Offer</option>
                        <option value={20}>20% Direct</option>
                      </select>
                      {crop.discount_percentage && crop.discount_percentage > 0 ? (
                        <span className="text-[10px] text-red-600 font-bold block">
                          Buyer: {formatINR(crop.discount_price_per_unit || crop.price_per_unit * (1 - crop.discount_percentage / 100))}
                        </span>
                      ) : null}
                    </div>
                  </td>

                  <td className="p-3">
                    <span className="text-stone-400 line-through">
                      {formatINR(crop.market_price_per_unit || crop.price_per_unit + 300)}
                    </span>
                    <span className="block text-[10px] text-emerald-800 font-semibold">
                      Under APMC Cap ✓
                    </span>
                  </td>

                  <td className="p-3">
                    <span className="font-bold text-[#1E2A22]">
                      {crop.stock_quantity} {crop.unit}s
                    </span>
                    <span className="block text-[10px] text-[#617064]">
                      MOQ: {crop.min_order_quantity} {crop.unit}
                    </span>
                  </td>

                  <td className="p-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        crop.stock_quantity > 0
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-stone-100 text-stone-600'
                      }`}
                    >
                      {crop.stock_quantity > 0 ? 'ACTIVE' : 'SOLD OUT / PAUSED'}
                    </span>
                  </td>

                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleToggleStatus(crop.id)}
                        title={crop.stock_quantity > 0 ? 'Pause Listing' : 'Re-activate Listing'}
                        className="p-1.5 rounded-lg border border-black/10 hover:bg-stone-100 text-stone-600 transition-colors"
                      >
                        {crop.stock_quantity > 0 ? (
                          <PauseCircle className="w-4 h-4 text-amber-600" />
                        ) : (
                          <PlayCircle className="w-4 h-4 text-emerald-600" />
                        )}
                      </button>

                      <button
                        onClick={() => handleDeleteListing(crop.id, crop.title)}
                        title="Delete Listing"
                        className="p-1.5 rounded-lg border border-red-200 hover:bg-red-50 text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
