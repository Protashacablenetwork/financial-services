import React from 'react';
import { 
  Home, 
  Receipt, 
  Calculator, 
  Menu 
} from 'lucide-react';
import { Language } from '../types';
import { sounds } from '../utils/audio';

export type TabId = 'home' | 'transactions' | 'ledger' | 'profile';

interface BottomNavProps {
  activeTab: TabId;
  lang: Language;
  onTabChange: (tab: TabId) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  lang,
  onTabChange
}) => {
  const isBn = lang === 'bn';

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 w-full max-w-4xl mx-auto select-none pointer-events-none">
      <div className="pointer-events-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/90 dark:border-slate-800 px-2 sm:px-4 pb-safe pt-1 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        <div className="grid grid-cols-4 items-center h-14">
          {/* Tab 1: Home */}
          <button
            onClick={() => {
              sounds.playTap();
              onTabChange('home');
            }}
            className={`flex flex-col items-center justify-center py-1 transition-all ${
              activeTab === 'home'
                ? 'text-[#E52E2E] dark:text-rose-500 scale-105 font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Home className="w-5 h-5 stroke-[2.2]" />
            <span className="text-[11px] font-semibold mt-1 tracking-tight truncate">
              {isBn ? 'হোম' : 'Home'}
            </span>
          </button>

          {/* Tab 2: Transactions */}
          <button
            onClick={() => {
              sounds.playTap();
              onTabChange('transactions');
            }}
            className={`flex flex-col items-center justify-center py-1 transition-all ${
              activeTab === 'transactions'
                ? 'text-[#E52E2E] dark:text-rose-500 scale-105 font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Receipt className="w-5 h-5 stroke-[2.2]" />
            <span className="text-[11px] font-semibold mt-1 tracking-tight truncate">
              {isBn ? 'লেনদেন' : 'History'}
            </span>
          </button>

          {/* Tab 3: Ledger / Report */}
          <button
            onClick={() => {
              sounds.playTap();
              onTabChange('ledger');
            }}
            className={`flex flex-col items-center justify-center py-1 transition-all ${
              activeTab === 'ledger'
                ? 'text-[#E52E2E] dark:text-rose-500 scale-105 font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Calculator className="w-5 h-5 stroke-[2.2]" />
            <span className="text-[11px] font-semibold mt-1 tracking-tight truncate">
              {isBn ? 'হিসাব খাতা' : 'Ledger'}
            </span>
          </button>

          {/* Tab 4: Profile / Menu */}
          <button
            onClick={() => {
              sounds.playTap();
              onTabChange('profile');
            }}
            className={`flex flex-col items-center justify-center py-1 transition-all ${
              activeTab === 'profile'
                ? 'text-[#E52E2E] dark:text-rose-500 scale-105 font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Menu className="w-5 h-5 stroke-[2.2]" />
            <span className="text-[11px] font-semibold mt-1 tracking-tight truncate">
              {isBn ? 'মেনু' : 'Menu'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
