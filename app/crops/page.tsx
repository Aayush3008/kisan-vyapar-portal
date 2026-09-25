'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Filter, 
  X, 
  Search, 
  SlidersHorizontal, 
  ArrowUpDown, 
  RotateCcw,
  Sparkles,
  MapPin
} from 'lucide-react';
import { MOCK_CATEGORIES } from '@/lib/mock-data';
import { CropCard } from '@/components/marketplace/CropCard';
import { Button } from '@/components/ui/Button';
import { useCrops } from '@/context/CropContext';

function MarketplaceContent() {
  const { crops } = useCrops();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('query') || '';
  const initialCat = searchParams.get('category') || 'all';
  const initialState = searchParams.get('state') || 'all';

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCat);
  const [selectedState, setSelectedState] = useState<string>(initialState);
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [selectedUnit, setSelectedUnit] = useState<string>('all');
  const [maxPrice, setMaxPrice] = useState<number>(25000);
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('nearest'); // Default to Nearest Location
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Sync state if URL query params change
  useEffect(() => {
    if (initialQuery) setSearchQuery(initialQuery);
    if (initialCat) setSelectedCategory(initialCat);
    if (initialState) setSelectedState(initialState);
  }, [initialQuery, initialCat, initialState]);

  // Filter & Sorting Logic
  const filteredCrops = useMemo(() => {
    return crops.filter((crop) => {
      // Query search: matches specific crop title, variety, or location
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase().trim();
        const matches =
          crop.title.toLowerCase().includes(query) ||
          crop.variety.toLowerCase().includes(query) ||
          crop.district.toLowerCase().includes(query) ||
          crop.state.toLowerCase().includes(query) ||
          crop.category_name?.toLowerCase().includes(query);
        if (!matches) return false;
      }

      // State filter
      if (selectedState !== 'all' && !crop.state.toLowerCase().includes(selectedState.toLowerCase())) {
        return false;
      }

      // Category filter (match id or slug)
      if (selectedCategory !== 'all') {
        if (crop.category_id !== selectedCategory && crop.category_name?.toLowerCase().replace(/\s+/g, '-').replace(/&/g, '') !== selectedCategory) {
          return false;
        }
      }

      // Grade filter
      if (selectedGrade !== 'all' && crop.grade !== selectedGrade) {
        return false;
      }

      // Unit filter
      if (selectedUnit !== 'all' && crop.unit !== selectedUnit) {
        return false;
      }

      // Max price
      if (crop.price_per_unit > maxPrice) {
        return false;
      }

      // Verified farmers only
      if (verifiedOnly && !crop.farmer_verified) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      // Nearest Location First
      if (sortBy === 'nearest') return (a.distance_km || 999) - (b.distance_km || 999);
      if (sortBy === 'discount-high') return (b.discount_percentage || 0) - (a.discount_percentage || 0);
      if (sortBy === 'price-low') return a.price_per_unit - b.price_per_unit;
      if (sortBy === 'price-high') return b.price_per_unit - a.price_per_unit;
      if (sortBy === 'stock-high') return b.stock_quantity - a.stock_quantity;
      if (sortBy === 'rating-high') return (b.farmer_rating || 0) - (a.farmer_rating || 0);
      // default: freshest (harvest date descending)
      return new Date(b.harvest_date).getTime() - new Date(a.harvest_date).getTime();
    });
  }, [crops, searchQuery, selectedCategory, selectedGrade, selectedUnit, maxPrice, verifiedOnly, sortBy]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedGrade('all');
    setSelectedUnit('all');
    setMaxPrice(25000);
    setVerifiedOnly(false);
    setSortBy('nearest');
  };

  const activeFilterCount = [
    selectedCategory !== 'all',
    selectedGrade !== 'all',
    selectedUnit !== 'all',
    maxPrice < 25000,
    verifiedOnly,
  ].filter(Boolean).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Title & Stats */}
      <div className="flex flex-col md:flex-row md:items-end justify-between pb-8 border-b border-black/5 gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-[#2D7A46] mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>National Agricultural Marketplace</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#1E2A22]">
            Browse Farm Produce
          </h1>
          <p className="text-sm text-[#617064] mt-1">
            {searchQuery ? (
              <span>Showing search results for &ldquo;<strong className="text-[#1E2A22]">{searchQuery}</strong>&rdquo; sorted by nearest farm proximity</span>
            ) : (
              <span>Showing {filteredCrops.length} verified agricultural batches ready for dispatch</span>
            )}
          </p>
        </div>

        {/* Sort & Mobile Filter Toggle */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="md:hidden flex items-center space-x-2 px-4 py-2.5 rounded-xl border border-black/10 bg-white text-xs font-semibold text-[#1E2A22]"
          >
            <Filter className="w-4 h-4 text-[#2D7A46]" />
            <span>Filters ({activeFilterCount})</span>
          </button>

          <div className="flex items-center space-x-2 border border-black/10 rounded-xl px-3 py-2 bg-white shadow-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-stone-400" />
            <span className="text-xs text-[#617064]">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs font-bold text-[#1E2A22] bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="nearest">Nearest Location (Proximity First)</option>
              <option value="discount-high">⚡ Highest Farmer Discount</option>
              <option value="freshest">Harvest Date (Freshest First)</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="stock-high">Highest Stock</option>
              <option value="rating-high">Highest Farmer Rating</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid with Sidebar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pt-8">
        {/* Desktop Filter Sidebar */}
        <div className="hidden md:block space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-black/5">
            <div className="flex items-center space-x-2 font-bold text-sm text-[#1E2A22]">
              <SlidersHorizontal className="w-4 h-4 text-[#2D7A46]" />
              <span>Filters</span>
            </div>
            {(activeFilterCount > 0 || searchQuery !== '') && (
              <button
                onClick={resetFilters}
                className="text-xs text-[#2D7A46] font-semibold hover:underline flex items-center space-x-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset All</span>
              </button>
            )}
          </div>

          {/* Search inside filters */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#617064] block mb-2">Search Specific Item</label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Crop, variety, or district..."
                className="w-full text-xs rounded-xl border border-black/10 px-3 py-2 text-[#1E2A22] focus:border-[#2D7A46] focus:outline-none bg-white shadow-2xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-2.5 text-stone-400 hover:text-stone-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Categories */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#617064] block mb-2">Mandi Category</label>
            <div className="space-y-1 text-xs">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors ${
                  selectedCategory === 'all' ? 'bg-[#F3FAF4] text-[#2D7A46] font-bold' : 'text-stone-700 hover:bg-stone-50'
                }`}
              >
                All Categories
              </button>
              {MOCK_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors ${
                    selectedCategory === cat.id ? 'bg-[#F3FAF4] text-[#2D7A46] font-bold' : 'text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Quality Grade */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#617064] block mb-2">Quality Grade</label>
            <div className="space-y-1.5 text-xs">
              {['all', 'Grade A', 'Grade B', 'Grade C', 'Organic Certified'].map((g) => (
                <label key={g} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="grade"
                    checked={selectedGrade === g}
                    onChange={() => setSelectedGrade(g)}
                    className="accent-[#2D7A46]"
                  />
                  <span className={selectedGrade === g ? 'font-bold text-[#2D7A46]' : 'text-stone-700'}>
                    {g === 'all' ? 'Any Grade' : g}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range Slider */}
          <div>
            <div className="flex justify-between items-center mb-1 text-xs">
              <label className="font-bold uppercase tracking-wider text-[#617064]">Max Price (₹)</label>
              <span className="font-bold text-[#2D7A46]">₹{maxPrice.toLocaleString('en-IN')}</span>
            </div>
            <input
              type="range"
              min="500"
              max="25000"
              step="500"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-[#2D7A46] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-stone-400 mt-1">
              <span>₹500</span>
              <span>₹25,000+</span>
            </div>
          </div>

          {/* Farmer Verification Toggle */}
          <div className="pt-2 border-t border-black/5">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs font-semibold text-[#1E2A22]">Govt-Verified Farmers Only</span>
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={(e) => setVerifiedOnly(e.target.checked)}
                className="w-4 h-4 accent-[#2D7A46] rounded"
              />
            </label>
          </div>
        </div>

        {/* Crops Listing Grid */}
        <div className="md:col-span-3">
          {/* Active Filter Chips */}
          {(activeFilterCount > 0 || searchQuery !== '') && (
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className="text-xs text-[#617064]">Active Filters:</span>
              {searchQuery && (
                <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-[#F3FAF4] text-[#2D7A46] text-xs font-bold border border-[#2D7A46]/20">
                  <span>Query: &ldquo;{searchQuery}&rdquo;</span>
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setSearchQuery('')} />
                </span>
              )}
              {selectedCategory !== 'all' && (
                <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-[#F3FAF4] text-[#2D7A46] text-xs font-semibold">
                  <span>Category: {selectedCategory}</span>
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedCategory('all')} />
                </span>
              )}
              {selectedGrade !== 'all' && (
                <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-[#F3FAF4] text-[#2D7A46] text-xs font-semibold">
                  <span>{selectedGrade}</span>
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedGrade('all')} />
                </span>
              )}
              {selectedState !== 'all' && (
                <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-[#F3FAF4] text-[#2D7A46] text-xs font-semibold">
                  <span>State: {selectedState}</span>
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedState('all')} />
                </span>
              )}
              {verifiedOnly && (
                <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-[#F3FAF4] text-[#2D7A46] text-xs font-semibold">
                  <span>Verified Farmers</span>
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setVerifiedOnly(false)} />
                </span>
              )}
              {maxPrice < 25000 && (
                <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-[#F3FAF4] text-[#2D7A46] text-xs font-semibold">
                  <span>Under ₹{maxPrice}</span>
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setMaxPrice(25000)} />
                </span>
              )}
            </div>
          )}

          {filteredCrops.length === 0 ? (
            <div className="rounded-3xl border border-black/5 bg-white p-12 text-center space-y-4 shadow-subtle">
              <p className="font-serif text-2xl font-bold text-[#1E2A22]">No crops match your search</p>
              <p className="text-xs text-[#617064] max-w-sm mx-auto">
                No items found for &ldquo;{searchQuery}&rdquo;. Try widening your price range, clearing specific grades, or searching for other agricultural produce.
              </p>
              <Button onClick={resetFilters} variant="secondary" size="sm">
                Reset All Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCrops.map((crop) => (
                <CropCard key={crop.id} crop={crop} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MarketplacePage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="w-10 h-10 border-4 border-[#2D7A46] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-semibold text-[#1E2A22]">Loading Kisan Marketplace...</p>
      </div>
    }>
      <MarketplaceContent />
    </Suspense>
  );
}
