'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Check, 
  UploadCloud, 
  ArrowLeft, 
  AlertCircle,
  ShieldAlert,
  ImagePlus,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { useCrops } from '@/context/CropContext';
import { useRole } from '@/context/RoleContext';
import { createClient } from '@/lib/supabase/client';

export default function NewCropListingWizard() {
  const router = useRouter();
  const { toast } = useToast();
  const { addCrop } = useCrops();
  const { currentUser } = useRole();
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Grains & Cereals',
    variety: '',
    grade: 'Grade A',
    district: 'Sehore',
    state: 'Madhya Pradesh',
    totalQuantity: '' as unknown as number,
    unit: 'quintal',
    minOrderQuantity: '' as unknown as number,
    pricePerUnit: '' as unknown as number,
    discountPercentage: 0,
    harvestDate: '',
    pickupAvailable: true,
    deliveryAvailable: false,
    deliveryFee: '' as unknown as number,
    soilType: '',
    farmingMethod: '',
    description: '',
    imageUrl: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, val: any) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
    // Clear error for this field upon user typing
    if (errors[field]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  // Step 1 Validation
  const validateStep1 = () => {
    const errs: Record<string, string> = {};
    if (!formData.title.trim()) {
      errs.title = 'Crop listing title is required (e.g. Certified Sharbati Wheat).';
    } else if (formData.title.trim().length < 5) {
      errs.title = 'Title must be at least 5 characters.';
    }

    if (!formData.variety.trim()) {
      errs.variety = 'Cultivar or variety name is mandatory (e.g. C-306, Pusa 1121).';
    }

    if (!formData.district.trim()) {
      errs.district = 'Farm district is required for location tracking.';
    }

    if (!formData.state.trim()) {
      errs.state = 'State is required.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Step 2 Validation
  const validateStep2 = () => {
    const errs: Record<string, string> = {};
    const totalQty = Number(formData.totalQuantity);
    const moq = Number(formData.minOrderQuantity);
    const price = Number(formData.pricePerUnit);

    if (!formData.totalQuantity || isNaN(totalQty) || totalQty <= 0) {
      errs.totalQuantity = 'Please enter a valid total quantity greater than 0.';
    }

    if (!formData.minOrderQuantity || isNaN(moq) || moq <= 0) {
      errs.minOrderQuantity = 'Minimum order quantity (MOQ) must be at least 1.';
    } else if (totalQty && moq > totalQty) {
      errs.minOrderQuantity = 'MOQ cannot be greater than total available stock.';
    }

    // National APMC Mandi Benchmark Caps based on category/crop
    const benchmarkRates: Record<string, number> = {
      'Grains & Cereals': 4500,
      'Pulses & Legumes': 6500,
      'Fresh Fruits': 2500,
      'Vegetables': 3000,
      'Spices': 22000,
      'Oilseeds': 5800,
      'Organic Produce': 5000,
    };

    const maxAllowedMarketPrice = benchmarkRates[formData.category] || 5000;

    if (!formData.pricePerUnit || isNaN(price) || price <= 0) {
      errs.pricePerUnit = 'Please specify a fair unit price (in ₹).';
    } else if (price > maxAllowedMarketPrice) {
      errs.pricePerUnit = `Price cannot exceed national APMC market benchmark rate of ₹${maxAllowedMarketPrice.toLocaleString('en-IN')}/${formData.unit}. Fair direct pricing protects buyers.`;
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Step 3 Validation
  const validateStep3 = () => {
    const errs: Record<string, string> = {};
    if (!formData.harvestDate) {
      errs.harvestDate = 'Harvest date is required to certify crop freshness.';
    } else {
      const selected = new Date(formData.harvestDate);
      const now = new Date();
      if (selected > now) {
        errs.harvestDate = 'Harvest date cannot be in the future.';
      }
    }

    if (!formData.pickupAvailable && !formData.deliveryAvailable) {
      errs.fulfillment = 'You must enable at least one fulfillment option (Farm Pickup or Delivery).';
    }

    if (formData.deliveryAvailable) {
      const fee = Number(formData.deliveryFee);
      if (formData.deliveryFee === ('' as any) || isNaN(fee) || fee < 0) {
        errs.deliveryFee = 'Please enter a valid transport fee per unit (or 0 for free delivery).';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Step 4 Validation
  const validateStep4 = () => {
    const errs: Record<string, string> = {};
    if (!formData.soilType.trim()) {
      errs.soilType = 'Soil classification is required (e.g. Deep Alluvial Loam, Black Cotton).';
    }

    if (!formData.farmingMethod.trim()) {
      errs.farmingMethod = 'Cultivation protocol is required (e.g. 100% Organic, IPM Verified).';
    }

    if (!formData.description.trim() || formData.description.trim().length < 20) {
      errs.description = 'Please provide a detailed batch description (at least 20 characters).';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Step 5 Validation
  const validateStep5 = () => {
    const errs: Record<string, string> = {};
    if (!formData.imageUrl.trim()) {
      errs.imageUrl = 'Crop photo is required for visual quality inspection.';
    } else if (
      !formData.imageUrl.startsWith('http://') &&
      !formData.imageUrl.startsWith('https://') &&
      !formData.imageUrl.startsWith('data:image/') &&
      !formData.imageUrl.startsWith('/')
    ) {
      errs.imageUrl = 'Please enter a valid image URL or upload a photo.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = (currentStep: number) => {
    let isValid = false;
    if (currentStep === 1) isValid = validateStep1();
    if (currentStep === 2) isValid = validateStep2();
    if (currentStep === 3) isValid = validateStep3();
    if (currentStep === 4) isValid = validateStep4();

    if (isValid) {
      setStep((currentStep + 1) as any);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      toast('Please fill all required agronomic fields before proceeding.', 'error');
    }
  };

  const handleFinish = () => {
    // Thorough complete verification across all domains
    const s1 = validateStep1();
    const s2 = validateStep2();
    const s3 = validateStep3();
    const s4 = validateStep4();
    const s5 = validateStep5();

    if (!s1 || !s2 || !s3 || !s4 || !s5) {
      toast('Listing rejected: All crop specifications, dates, pricing and images are mandatory.', 'error');
      if (!s1) setStep(1);
      else if (!s2) setStep(2);
      else if (!s3) setStep(3);
      else if (!s4) setStep(4);
      else setStep(5);
      return;
    }

    const createdCrop = addCrop({
      ...formData,
      farmer_id: currentUser?.id || 'farmer-custom',
      farmer_name: currentUser?.full_name || 'Rameshwar Patel',
      farm_name: currentUser?.farmer_profile?.farm_name || 'Patel Organic Agro Farms',
      district: formData.district || currentUser?.district || 'Sehore',
      state: formData.state || currentUser?.state || 'Madhya Pradesh',
    });

    toast(`Crop listing "${createdCrop.title}" submitted and verified successfully!`, 'success');
    router.push('/farmer/listings');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Wizard Header */}
      <div className="pb-6 border-b border-black/5">
        <Link href="/farmer" className="inline-flex items-center space-x-1.5 text-xs text-[#2D7A46] font-semibold hover:underline mb-2">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Farmer Dashboard</span>
        </Link>
        <h1 className="font-serif text-3xl font-bold text-[#1E2A22]">
          List Harvested Crop Produce
        </h1>
        <p className="text-xs text-[#617064] mt-1">
          Complete mandatory specifications. All fields are verified by APMC guidelines to guarantee direct trade transparency.
        </p>

        {/* Step Indicators */}
        <div className="flex items-center space-x-2 pt-6">
          {[
            { num: 1, label: 'Identity' },
            { num: 2, label: 'Quantity & Price' },
            { num: 3, label: 'Harvest & Logistics' },
            { num: 4, label: 'Agronomy' },
            { num: 5, label: 'Photos' },
          ].map((s) => (
            <div key={s.num} className="flex-1 flex items-center space-x-2">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step === s.num
                    ? 'bg-[#2D7A46] text-white shadow-xs'
                    : step > s.num
                    ? 'bg-[#F3FAF4] text-[#2D7A46] border border-[#2D7A46]'
                    : 'bg-stone-100 text-stone-400'
                }`}
              >
                {step > s.num ? <Check className="w-3.5 h-3.5" /> : s.num}
              </div>
              <div className="h-1 flex-1 bg-stone-100 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${step >= s.num ? 'bg-[#2D7A46]' : 'bg-transparent'}`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Error Summary Banner if any */}
      {Object.keys(errors).length > 0 && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-start space-x-2 animate-shake">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Missing Information:</span>
            <ul className="list-disc pl-4 mt-1 space-y-0.5">
              {Object.values(errors).map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Step Content */}
      <div className="p-6 sm:p-8 rounded-3xl border border-black/5 bg-white shadow-card">
        {/* Step 1 */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-bold text-[#1E2A22]">
              Step 1: Crop Identity, Category & Variety
            </h3>
            <Input
              label="Listing Title *"
              placeholder="e.g. Certified Sharbati Golden Whole Wheat"
              value={formData.title}
              error={errors.title}
              onChange={(e) => handleChange('title', e.target.value)}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold uppercase text-[#617064] block mb-1">Mandi Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  className="w-full text-xs p-3 rounded-lg border border-black/10 focus:border-[#2D7A46] focus:outline-none bg-white"
                >
                  <option>Grains & Cereals</option>
                  <option>Pulses & Legumes</option>
                  <option>Fresh Fruits</option>
                  <option>Vegetables</option>
                  <option>Spices</option>
                  <option>Oilseeds</option>
                  <option>Organic Produce</option>
                </select>
              </div>
              <Input
                label="Variety / Cultivar Name *"
                placeholder="e.g. Sharbati C-306, Pusa Basmati 1121"
                value={formData.variety}
                error={errors.variety}
                onChange={(e) => handleChange('variety', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Farm District *"
                placeholder="e.g. Sehore, Karnal, Nashik"
                value={formData.district}
                error={errors.district}
                onChange={(e) => handleChange('district', e.target.value)}
              />
              <Input
                label="State *"
                placeholder="e.g. Madhya Pradesh, Haryana"
                value={formData.state}
                error={errors.state}
                onChange={(e) => handleChange('state', e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-[#617064] block mb-1">Quality Grade *</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {['Grade A', 'Grade B', 'Grade C', 'Organic Certified'].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => handleChange('grade', g)}
                    className={`p-2.5 rounded-lg border text-center font-semibold transition-all ${
                      formData.grade === g
                        ? 'border-[#2D7A46] bg-[#F3FAF4] text-[#2D7A46] shadow-xs'
                        : 'border-black/10 text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={() => handleNext(1)}>Next: Quantities & Pricing</Button>
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-bold text-[#1E2A22]">
              Step 2: Total Quantity, Minimum Order (MOQ) & Price
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                type="number"
                label="Total Quantity Available *"
                placeholder="e.g. 150"
                value={formData.totalQuantity || ''}
                error={errors.totalQuantity}
                onChange={(e) => handleChange('totalQuantity', e.target.value)}
              />
              <div>
                <label className="text-xs font-bold uppercase text-[#617064] block mb-1">Standard Unit *</label>
                <select
                  value={formData.unit}
                  onChange={(e) => handleChange('unit', e.target.value)}
                  className="w-full text-xs p-3 rounded-lg border border-black/10 focus:border-[#2D7A46] focus:outline-none bg-white"
                >
                  <option value="quintal">Quintal (100 kg)</option>
                  <option value="kg">Kilogram (kg)</option>
                  <option value="tonne">Metric Tonne (1,000 kg)</option>
                  <option value="crate">Crate / Box</option>
                  <option value="bag">Bag (50 kg)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                type="number"
                label="Minimum Order Quantity (MOQ) *"
                placeholder="e.g. 2"
                value={formData.minOrderQuantity || ''}
                error={errors.minOrderQuantity}
                onChange={(e) => handleChange('minOrderQuantity', e.target.value)}
              />
              <Input
                type="number"
                label="Base Price Per Unit (₹ in INR) *"
                placeholder="e.g. 3450"
                value={formData.pricePerUnit || ''}
                error={errors.pricePerUnit}
                onChange={(e) => handleChange('pricePerUnit', e.target.value)}
              />
            </div>

            {/* Farmer Discount Section */}
            <div className="p-4 rounded-2xl bg-[#F3FAF4] border border-[#6FBF78]/40 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-serif font-bold text-sm text-[#1E2A22]">
                    Offer Direct Farmer Discount (Optional)
                  </h4>
                  <p className="text-xs text-[#617064]">
                    Provide buyers with an attractive direct discount to sell your harvest faster.
                  </p>
                </div>
                <span className="text-xs font-extrabold text-[#2D7A46] bg-white px-2.5 py-1 rounded-full border border-black/5 shadow-2xs">
                  {formData.discountPercentage || 0}% Discount
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                <div>
                  <label className="text-xs font-semibold text-[#1E2A22] block mb-1">
                    Select Discount Percentage (%):
                  </label>
                  <select
                    value={formData.discountPercentage || 0}
                    onChange={(e) => handleChange('discountPercentage', Number(e.target.value))}
                    className="w-full text-xs p-3 rounded-lg border border-black/10 focus:border-[#2D7A46] focus:outline-none bg-white font-semibold"
                  >
                    <option value={0}>No Discount (0%)</option>
                    <option value={5}>5% Special Farmer Cut</option>
                    <option value={10}>10% Harvest Super Discount</option>
                    <option value={15}>15% Bulk Clearance Discount</option>
                    <option value={20}>20% Mandi Direct Special</option>
                  </select>
                </div>

                <div className="p-3 bg-white rounded-xl border border-black/5 text-xs space-y-1">
                  <div className="flex justify-between text-[#617064]">
                    <span>Buyer Discounted Price:</span>
                    <span className="font-bold text-[#2D7A46] text-sm">
                      {formData.pricePerUnit ? (
                        <>₹{Math.round(Number(formData.pricePerUnit) * (1 - (Number(formData.discountPercentage) || 0) / 100)).toLocaleString('en-IN')} / {formData.unit}</>
                      ) : (
                        '—'
                      )}
                    </span>
                  </div>
                  {Number(formData.discountPercentage) > 0 && formData.pricePerUnit && (
                    <div className="text-[11px] text-red-600 font-semibold">
                      ⚡ Buyer saves ₹{Math.round(Number(formData.pricePerUnit) * (Number(formData.discountPercentage) / 100)).toLocaleString('en-IN')} per {formData.unit}!
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="secondary" onClick={() => setStep(1)}>Back</Button>
              <Button onClick={() => handleNext(2)}>Next: Harvest & Logistics</Button>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-bold text-[#1E2A22]">
              Step 3: Harvest Schedule & Delivery Capabilities
            </h3>
            <Input
              type="date"
              label="Actual Harvest Date *"
              value={formData.harvestDate}
              error={errors.harvestDate}
              onChange={(e) => handleChange('harvestDate', e.target.value)}
            />

            <div className="p-4 rounded-xl border border-black/5 bg-[#FAFCFA] space-y-3">
              <label className="text-xs font-bold uppercase text-[#617064] block">Fulfillment Options *</label>
              <label className="flex items-center space-x-2 text-xs font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.pickupAvailable}
                  onChange={(e) => handleChange('pickupAvailable', e.target.checked)}
                  className="w-4 h-4 accent-[#2D7A46]"
                />
                <span>Farm Gate Pickup is available (Self-arranged truck/tempo)</span>
              </label>

              <label className="flex items-center space-x-2 text-xs font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.deliveryAvailable}
                  onChange={(e) => handleChange('deliveryAvailable', e.target.checked)}
                  className="w-4 h-4 accent-[#2D7A46]"
                />
                <span>Farmer / Mandi Delivery available via local freight network</span>
              </label>

              {errors.fulfillment && (
                <p className="text-xs text-red-600 font-medium">{errors.fulfillment}</p>
              )}
            </div>

            {formData.deliveryAvailable && (
              <Input
                type="number"
                label="Delivery Surcharge per Unit (₹ in INR) *"
                placeholder="e.g. 120"
                value={formData.deliveryFee || ''}
                error={errors.deliveryFee}
                onChange={(e) => handleChange('deliveryFee', e.target.value)}
              />
            )}

            <div className="flex justify-between pt-4">
              <Button variant="secondary" onClick={() => setStep(2)}>Back</Button>
              <Button onClick={() => handleNext(3)}>Next: Soil & Cultivation</Button>
            </div>
          </div>
        )}

        {/* Step 4 */}
        {step === 4 && (
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-bold text-[#1E2A22]">
              Step 4: Soil Profile & Agronomic Protocol
            </h3>
            <Input
              label="Soil Topology *"
              placeholder="e.g. Deep Alluvial Loam, Black Cotton Soil, Red Sandy Clay"
              value={formData.soilType}
              error={errors.soilType}
              onChange={(e) => handleChange('soilType', e.target.value)}
            />

            <Input
              label="Cultivation Protocol *"
              placeholder="e.g. 100% Desi Cow Dung Compost, Zero Synthetic Residue"
              value={formData.farmingMethod}
              error={errors.farmingMethod}
              onChange={(e) => handleChange('farmingMethod', e.target.value)}
            />

            <div>
              <label className="text-xs font-bold uppercase text-[#617064] block mb-1">
                Batch Description & Storage Characteristics *
              </label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Describe moisture percentage, drying method, grain color, kernel size, and packing type..."
                className={`w-full text-xs p-3 rounded-lg border focus:outline-none ${
                  errors.description ? 'border-red-500' : 'border-black/10 focus:border-[#2D7A46]'
                }`}
              />
              {errors.description && (
                <p className="mt-1 text-xs text-red-600 font-medium">{errors.description}</p>
              )}
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="secondary" onClick={() => setStep(3)}>Back</Button>
              <Button onClick={() => handleNext(4)}>Next: Crop Photos</Button>
            </div>
          </div>
        )}

        {/* Step 5 */}
        {step === 5 && (
          <div className="space-y-5">
            <div>
              <h3 className="font-serif text-lg font-bold text-[#1E2A22]">
                Step 5: Crop Photos & Batch Verification
              </h3>
              <p className="text-xs text-[#617064] mt-0.5">
                Upload a clear photo of your harvested lot, choose a verified produce preset, or provide an image link.
              </p>
            </div>

            {/* File Upload Zone with Drag & Drop */}
            <div
              className={`p-8 border-2 border-dashed rounded-2xl transition-all flex flex-col items-center justify-center space-y-3 cursor-pointer group ${
                uploadingImage 
                  ? 'border-[#2D7A46] bg-[#F3FAF4]' 
                  : 'border-[#2D7A46]/30 bg-[#FAFCFA] hover:bg-[#F3FAF4] hover:border-[#2D7A46]'
              }`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const file = e.dataTransfer.files?.[0];
                if (file) {
                  const input = fileInputRef.current;
                  if (input) {
                    const dataTransfer = new DataTransfer();
                    dataTransfer.items.add(file);
                    input.files = dataTransfer.files;
                    input.dispatchEvent(new Event('change', { bubbles: true }));
                  }
                }
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/jpg"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  if (file.size > 10 * 1024 * 1024) {
                    toast('Image must be under 10MB', 'error');
                    return;
                  }

                  setUploadingImage(true);

                  // 1. Instant local preview via FileReader
                  const reader = new FileReader();
                  reader.onload = (ev) => {
                    if (ev.target?.result) {
                      handleChange('imageUrl', ev.target.result as string);
                    }
                  };
                  reader.readAsDataURL(file);

                  // 2. Upload via API route
                  try {
                    const uploadBody = new FormData();
                    uploadBody.append('file', file);

                    const res = await fetch('/api/upload', {
                      method: 'POST',
                      body: uploadBody,
                    });

                    const resData = await res.json();
                    if (res.ok && resData.url) {
                      handleChange('imageUrl', resData.url);
                      toast('✅ Harvest photo attached successfully!', 'success');
                    } else {
                      // Even if server storage failed, preview is loaded as data URL
                      toast('Photo loaded locally for listing.', 'info');
                    }
                  } catch (err: any) {
                    console.warn('API upload error, using local image preview:', err);
                    toast('Photo loaded locally for listing.', 'info');
                  } finally {
                    setUploadingImage(false);
                  }
                }}
              />
              {uploadingImage ? (
                <>
                  <div className="w-10 h-10 border-2 border-[#2D7A46] border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs font-bold text-[#2D7A46]">Processing & uploading photo...</p>
                </>
              ) : (
                <>
                  <div className="w-14 h-14 rounded-2xl bg-[#F3FAF4] flex items-center justify-center group-hover:bg-[#2D7A46]/10 transition-colors">
                    <ImagePlus className="w-7 h-7 text-[#2D7A46]" />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-bold text-[#1E2A22]">Click or Drag & Drop harvest photo here</p>
                    <p className="text-[11px] text-[#617064]">JPG, PNG, WebP — up to 10MB</p>
                  </div>
                </>
              )}
            </div>

            {/* Selected Image Preview */}
            {formData.imageUrl && (
              <div className="relative aspect-video w-full max-w-sm mx-auto rounded-xl overflow-hidden border border-[#2D7A46]/20 bg-stone-100 shadow-sm group">
                <img
                  src={formData.imageUrl}
                  alt="Crop Preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleChange('imageUrl', '')}
                  title="Remove image"
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 shadow flex items-center justify-center hover:bg-red-50 transition-colors text-red-500"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-2 left-2 bg-[#2D7A46] text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs">
                  <Check className="w-3 h-3" /> Photo Attached
                </div>
              </div>
            )}

            {/* Quick Select Presets */}
            <div className="space-y-2 pt-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#617064] block">
                Or Quick-Select Standard Produce Photo:
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {[
                  { name: 'Wheat', url: 'https://rafxxtiuagdmvvkoauuw.supabase.co/storage/v1/object/public/crop-images/wheat-main.jpg' },
                  { name: 'Basmati', url: 'https://rafxxtiuagdmvvkoauuw.supabase.co/storage/v1/object/public/crop-images/tomato-main.jpg' },
                  { name: 'Mango', url: 'https://rafxxtiuagdmvvkoauuw.supabase.co/storage/v1/object/public/crop-images/onion-main.jpg' },
                  { name: 'Chana', url: 'https://rafxxtiuagdmvvkoauuw.supabase.co/storage/v1/object/public/crop-images/soybean-main.jpg' },
                  { name: 'Onion', url: 'https://rafxxtiuagdmvvkoauuw.supabase.co/storage/v1/object/public/crop-images/onion-main.jpg' },
                  { name: 'Sugarcane', url: 'https://rafxxtiuagdmvvkoauuw.supabase.co/storage/v1/object/public/crop-images/wheat-alt1.jpg' },
                ].map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => {
                      handleChange('imageUrl', preset.url);
                      toast(`Selected ${preset.name} photo preset`, 'info');
                    }}
                    className={`relative rounded-xl overflow-hidden border p-1 text-center transition-all ${
                      formData.imageUrl === preset.url
                        ? 'border-[#2D7A46] ring-2 ring-[#2D7A46]/20 bg-[#F3FAF4]'
                        : 'border-black/10 hover:border-[#2D7A46]/50 bg-white'
                    }`}
                  >
                    <div className="aspect-square w-full rounded-lg overflow-hidden bg-stone-100 mb-1">
                      <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-[10px] font-semibold text-[#1E2A22] block truncate">
                      {preset.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* OR paste URL fallback */}
            <div className="relative flex items-center gap-3 pt-2">
              <div className="flex-1 h-px bg-black/10" />
              <span className="text-[10px] font-semibold text-stone-400">OR enter an image URL</span>
              <div className="flex-1 h-px bg-black/10" />
            </div>

            <Input
              label="Image URL"
              placeholder="https://images.unsplash.com/... or public image link"
              value={formData.imageUrl}
              error={errors.imageUrl}
              onChange={(e) => handleChange('imageUrl', e.target.value)}
            />

            <div className="flex justify-between pt-6 border-t border-black/5">
              <Button variant="secondary" onClick={() => setStep(4)}>Back</Button>
              <Button onClick={handleFinish} disabled={uploadingImage} className="px-8 shadow-sm">
                Verify & Publish Crop Listing
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
