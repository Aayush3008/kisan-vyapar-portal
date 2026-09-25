'use client';

import React from 'react';
import { WeatherWidget } from '@/components/marketplace/WeatherWidget';
import { CloudSun, Info, Compass, ShieldAlert } from 'lucide-react';

export default function WeatherHubPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div className="pb-6 border-b border-black/5">
        <div className="inline-flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-[#2D7A46] mb-1">
          <CloudSun className="w-4 h-4" />
          <span>Agricultural Microclimate Intelligence</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#1E2A22]">
          Kisan Weather & Mandi Advisory Hub
        </h1>
        <p className="text-sm text-[#617064] mt-1 max-w-3xl">
          Precision agro-meteorological forecasts, rainfall probability, relative humidity, and tailored planting & pesticide spraying windows.
        </p>
      </div>

      {/* Main Weather Widget */}
      <WeatherWidget initialDistrict="Meerut, Uttar Pradesh" />

      {/* Agronomic Decision Guidance Section */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl font-bold text-[#1E2A22]">
            Field Weather Advisory & Decision Rules
          </h2>
          <span className="text-xs bg-[#F3FAF4] text-[#2D7A46] font-bold px-3 py-1 rounded-full border border-black/5">
            ICAR & IMD Aligned
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl liquid-glass-card space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#F3FAF4] text-[#2D7A46] flex items-center justify-center font-bold">
              1
            </div>
            <h3 className="font-serif text-lg font-bold text-[#1E2A22]">
              Spraying & Pesticide Rules
            </h3>
            <p className="text-xs text-[#617064] leading-relaxed">
              Never spray systemic fungicides or foliar fertilizers when wind velocity exceeds 15 km/h or relative humidity exceeds 85%, to prevent chemical runoff and leaf scorch.
            </p>
          </div>

          <div className="p-6 rounded-2xl liquid-glass-card space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#F3FAF4] text-[#2D7A46] flex items-center justify-center font-bold">
              2
            </div>
            <h3 className="font-serif text-lg font-bold text-[#1E2A22]">
              Harvest & Combine Operation
            </h3>
            <p className="text-xs text-[#617064] leading-relaxed">
              Ensure clear skies for 36 consecutive hours prior to combine harvesting paddy or wheat. Moisture content at harvest must remain below 14% to prevent kernel cracking.
            </p>
          </div>

          <div className="p-6 rounded-2xl liquid-glass-card space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#F3FAF4] text-[#2D7A46] flex items-center justify-center font-bold">
              3
            </div>
            <h3 className="font-serif text-lg font-bold text-[#1E2A22]">
              Drip & Flood Irrigation Scheduling
            </h3>
            <p className="text-xs text-[#617064] leading-relaxed">
              If precipitation probability exceeds 50% within the next 48 hours, postpone canal water release to prevent soil waterlogging and root hypoxia in pulses.
            </p>
          </div>
        </div>
      </div>

      {/* Soil Quality & Organic Carbon Diagnostic Matrix */}
      <div className="p-8 rounded-3xl liquid-glass space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-black/5">
          <div>
            <span className="text-xs uppercase font-bold tracking-wider text-[#2D7A46]">Soil Quality Assessment</span>
            <h3 className="font-serif text-2xl font-bold text-[#1E2A22]">
              Regional Soil Topologies & Diagnostic Guidelines
            </h3>
            <p className="text-xs text-[#617064] mt-0.5">
              Calibrated for Northern & Western agricultural belts (Meerut Doab, Karnal Basin, Sehore Black Soil)
            </p>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
            Updated for Current Sowing Cycle
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          <div className="p-5 rounded-2xl bg-white/70 border border-black/5 space-y-2">
            <span className="font-bold text-sm text-[#1E2A22] block">Upper Gangetic Alluvial Loam (Meerut & Western UP)</span>
            <p className="text-[#617064]">
              <strong>pH:</strong> 7.1 - 7.5 (Balanced) • <strong>Organic Carbon:</strong> 0.74%
            </p>
            <p className="text-[#617064] leading-relaxed">
              Deep, permeable loam with exceptional silt content. Apply balanced Zinc Sulphate (25 kg/ha) and green manure (Dhaincha) after sugarcane harvest.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/70 border border-black/5 space-y-2">
            <span className="font-bold text-sm text-[#1E2A22] block">Deccan Black Regur Soil (Sehore & Malwa)</span>
            <p className="text-[#617064]">
              <strong>pH:</strong> 7.8 - 8.2 (Alkaline) • <strong>Organic Carbon:</strong> 0.78%
            </p>
            <p className="text-[#617064] leading-relaxed">
              Self-ploughing montmorillonite clay with tremendous moisture holding capacity. Ideal for rainfed Sharbati wheat and soybean rotations without deep ploughing.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/70 border border-black/5 space-y-2">
            <span className="font-bold text-sm text-[#1E2A22] block">Indo-Gangetic Clay Loam (Karnal & Punjab)</span>
            <p className="text-[#617064]">
              <strong>pH:</strong> 7.2 - 7.6 (Neutral) • <strong>Organic Carbon:</strong> 0.68%
            </p>
            <p className="text-[#617064] leading-relaxed">
              High fertility suited for Pusa 1121 Basmati. Practice laser land leveling and alternate wetting and drying (AWD) to arrest methane emissions and save 30% water.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
