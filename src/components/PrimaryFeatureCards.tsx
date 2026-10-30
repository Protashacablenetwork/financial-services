import React from 'react';
import { ArrowRight, Zap, Layers } from 'lucide-react';
import { Language } from '../types';
import { sounds } from '../utils/audio';

interface PrimaryFeatureCardsProps {
  lang: Language;
  onOpenBillManager: () => void;
  onOpenAyByay: () => void;
}

export const PrimaryFeatureCards: React.FC<PrimaryFeatureCardsProps> = ({
  lang,
  onOpenBillManager,
  onOpenAyByay
}) => {
  const isBn = lang === 'bn';

  return (
    <div className="px-4 pt-1 pb-3 select-none">
      {/* 2 Main Feature Cards side by side in 1 single row (grid-cols-2) without '১ম ও ২য় সিস্টেম' text */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5">
        
        {/* Card 1: বিল ম্যানেজমেন্ট প্রো */}
        <div
          onClick={() => {
            sounds.playTap();
            onOpenBillManager();
          }}
          role="button"
          tabIndex={0}
          className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#FF4500] via-[#FF6A3D] to-[#FF8C00] p-3 sm:p-4 text-white shadow-md shadow-orange-500/20 cursor-pointer border border-white/20 active:scale-[0.98] transition-all hover:shadow-lg hover:shadow-orange-500/30 flex flex-col justify-between min-h-[105px] sm:min-h-[115px]"
        >
          {/* Subtle decorative background icon */}
          <div className="absolute right-2 -bottom-1 text-white/10 pointer-events-none group-hover:text-white/15 transition-colors">
            <Zap className="w-14 h-14 sm:w-18 sm:h-18 stroke-[1.2]" />
          </div>

          {/* Top row: Icon only (no system badge) */}
          <div className="flex items-center justify-between relative z-10">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
              <Zap className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center text-white group-hover:translate-x-0.5 transition-transform">
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
          </div>

          {/* Card Content */}
          <div className="relative z-10 mt-2">
            <h3 className="text-xs sm:text-sm md:text-base font-black tracking-tight drop-shadow-xs leading-snug">
              {isBn ? 'বিল ম্যানেজমেন্ট প্রো' : 'Bill Management Pro'}
            </h3>
            <p className="text-[10px] sm:text-[11px] text-white/90 font-medium mt-0.5 truncate">
              {isBn ? 'স্মার্ট বিলিং ও কালেকশন' : 'Smart Billing System'}
            </p>
          </div>
        </div>

        {/* Card 2: আয়-ব্যয় হিসাব */}
        <div
          onClick={() => {
            sounds.playTap();
            onOpenAyByay();
          }}
          role="button"
          tabIndex={0}
          className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0F172A] via-[#1E1B4B] to-[#0F766E] p-3 sm:p-4 text-white shadow-md shadow-teal-950/30 cursor-pointer border border-teal-500/30 active:scale-[0.98] transition-all hover:shadow-lg hover:shadow-teal-900/40 flex flex-col justify-between min-h-[105px] sm:min-h-[115px]"
        >
          {/* Subtle decorative background icon */}
          <div className="absolute right-2 -bottom-1 text-teal-400/10 pointer-events-none group-hover:text-teal-400/15 transition-colors">
            <Layers className="w-14 h-14 sm:w-18 sm:h-18 stroke-[1.2]" />
          </div>

          {/* Top row: Icon only (no system badge) */}
          <div className="flex items-center justify-between relative z-10">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-teal-500/20 backdrop-blur-md flex items-center justify-center text-teal-300 border border-teal-400/30">
              <Layers className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-teal-300 group-hover:translate-x-0.5 transition-transform">
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
          </div>

          {/* Card Content */}
          <div className="relative z-10 mt-2">
            <h3 className="text-xs sm:text-sm md:text-base font-black tracking-tight drop-shadow-xs leading-snug">
              <span className="text-emerald-400">{isBn ? 'আয়' : 'Income'}</span>
              <span className="text-slate-400">-</span>
              <span className="text-rose-400">{isBn ? 'ব্যয়' : 'Expense'}</span>
              <span className="text-white ml-1">{isBn ? 'হিসাব' : 'Ledger'}</span>
            </h3>
            <p className="text-[10px] sm:text-[11px] text-slate-300 font-medium mt-0.5 truncate">
              {isBn ? 'স্মার্ট দৈনন্দিন খাতা' : 'Daily Accounts'}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
