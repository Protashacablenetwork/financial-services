import React from 'react';
import { WalletCards } from 'lucide-react';

interface SmartChannelIconProps {
  method: string;
  imageUrl?: string;
  className?: string;
}

export const SmartChannelIcon: React.FC<SmartChannelIconProps> = ({ method, imageUrl, className = "w-5 h-5" }) => {
  // If custom uploaded image is provided for the channel, render it directly!
  if (imageUrl) {
    return (
      <img 
        src={imageUrl} 
        alt={method} 
        referrerPolicy="no-referrer"
        className="w-full h-full object-cover rounded-xl shadow-xs" 
      />
    );
  }

  const norm = (method || '').trim();
  const lower = norm.toLowerCase();

  // 1. বিকাশ (bKash) - Official bKash Pink Logo SVG
  if (norm === 'বিকাশ' || lower.includes('bkash') || lower.includes('বিকাশ')) {
    return (
      <div className="w-full h-full rounded-xl bg-[#E2136E] text-white flex flex-col items-center justify-center p-1 shadow-sm relative overflow-hidden">
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mb-0.5">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.5 14.5v-3H8v-2.5h2.5V8h3v3H16v2.5h-2.5v3h-3z" fill="#fff" fillOpacity="0.2"/>
        </svg>
        <span className="font-black text-[10px] tracking-tighter leading-none text-white">bKash</span>
      </div>
    );
  }

  // 2. নগদ (Nagad) - Official Nagad Orange/Red Logo SVG
  if (norm === 'নগদ' || lower.includes('nagad') || lower.includes('নগদ')) {
    return (
      <div className="w-full h-full rounded-xl bg-[#F47920] text-white flex flex-col items-center justify-center p-1 shadow-sm relative overflow-hidden">
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mb-0.5">
          <circle cx="12" cy="12" r="10" fill="#fff" fillOpacity="0.25"/>
          <path d="M12 6C9 6 7 8 7 11c0 2.5 1.5 4.5 3.5 5.5V19h3v-2.5C15.5 15.5 17 13.5 17 11c0-3-2-5-5-5z" fill="#fff"/>
        </svg>
        <span className="font-black text-[9px] tracking-tighter leading-none text-white">নগদ</span>
      </div>
    );
  }

  // 3. রকেট (Rocket DBBL) - Rocket Purple Logo SVG
  if (norm === 'রকেট' || lower.includes('rocket') || lower.includes('রকেট')) {
    return (
      <div className="w-full h-full rounded-xl bg-[#8A2BE2] text-white flex flex-col items-center justify-center p-1 shadow-sm relative overflow-hidden">
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mb-0.5">
          <path d="M12 2.5s-4 4-4 9c0 3 1.5 5.5 4 7 2.5-1.5 4-4 4-7 0-5-4-9-4-9z" fill="#fff" fillOpacity="0.9"/>
          <circle cx="12" cy="10.5" r="1.5" fill="#8A2BE2"/>
        </svg>
        <span className="font-black text-[9px] tracking-tighter leading-none text-white">Rocket</span>
      </div>
    );
  }

  // 4. ব্যাংক (Bank) - Architectural Neoclassical Bank Facade
  if (norm === 'ব্যাংক' || lower.includes('bank') || lower.includes('ব্যাংক')) {
    return (
      <svg 
        viewBox="0 0 24 24" 
        fill="none" 
        className={className}
        stroke="currentColor" 
        strokeWidth="1.9" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <path d="M3 9.5L12 3L21 9.5V11H3V9.5Z" fill="currentColor" fillOpacity="0.25" />
        <path d="M5 11V18M9 11V18M15 11V18M19 11V18" strokeWidth="2.2" />
        <path d="M2 18H22V21H2V18Z" fill="currentColor" fillOpacity="0.35" />
        <circle cx="12" cy="7.5" r="1.2" fill="white" />
      </svg>
    );
  }

  // 5. ক্যাশ (Cash) - Currency Banknotes Stack
  if (norm === 'ক্যাশ' || lower.includes('cash') || lower.includes('ক্যাশ')) {
    return (
      <svg 
        viewBox="0 0 24 24" 
        fill="none" 
        className={className}
        stroke="currentColor" 
        strokeWidth="1.9" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <rect x="5" y="4" width="16" height="11" rx="2" strokeOpacity="0.4" fill="currentColor" fillOpacity="0.2" />
        <rect x="2" y="8" width="17" height="12" rx="2.5" fill="currentColor" fillOpacity="0.9" />
        <circle cx="10.5" cy="14" r="2.5" stroke="white" strokeWidth="1.6" fill="white" fillOpacity="0.2" />
        <path d="M5 11H6.5M14.5 17H16" stroke="white" strokeWidth="1.6" />
      </svg>
    );
  }

  return <WalletCards className={className} strokeWidth={2} />;
};

export function getChannelGradient(method: string): string {
  const norm = (method || '').trim().toLowerCase();
  if (norm.includes('নগদ')) return 'bg-gradient-to-tr from-orange-500 via-[#F47920] to-rose-600 text-white shadow-md shadow-orange-500/25';
  if (norm.includes('বিকাশ')) return 'bg-gradient-to-tr from-[#E91E63] via-[#E2136E] to-[#AD1457] text-white shadow-md shadow-pink-500/25';
  if (norm.includes('রকেট')) return 'bg-gradient-to-tr from-[#9C27B0] via-[#8A2BE2] to-[#4A148C] text-white shadow-md shadow-purple-500/25';
  if (norm.includes('ব্যাংক')) return 'bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/30';
  if (norm.includes('ক্যাশ')) return 'bg-gradient-to-tr from-[#15803D] via-[#16A34A] to-[#22C55E] text-white shadow-md shadow-emerald-500/25';
  return 'bg-gradient-to-tr from-slate-700 to-slate-900 text-white shadow-md shadow-slate-900/25';
}
