import React from 'react';
import { 
  ArrowRight, 
  Plus, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Calculator, 
  Sliders, 
  WalletCards 
} from 'lucide-react';
import { Language, Transaction, PaymentChannel, UserSession } from '../types';
import { formatCurrency } from '../utils/formatters';
import { sounds } from '../utils/audio';
import { SmartChannelIcon, getChannelGradient } from './SmartChannelIcon';

interface QuickChannelsProps {
  transactions: Transaction[];
  channels: PaymentChannel[];
  lang: Language;
  user: UserSession | null;
  onSelectMethod: (method: string) => void;
  onOpenChannelManager: () => void;
  onOpenIncome: () => void;
  onOpenExpense: () => void;
  onOpenLedger: () => void;
}

export const QuickChannels: React.FC<QuickChannelsProps> = ({
  transactions,
  channels,
  lang,
  user,
  onSelectMethod,
  onOpenChannelManager,
  onOpenIncome,
  onOpenExpense,
  onOpenLedger
}) => {
  const isBn = lang === 'bn';

  // Calculate live balances per method dynamically
  const balances: Record<string, number> = {};
  channels.forEach(ch => {
    balances[ch.name] = 0;
  });

  transactions.filter(trx => !trx.isDeleted).forEach(trx => {
    const m = trx.method;
    if (balances[m] === undefined) {
      balances[m] = 0;
    }
    if (trx.type === 'income') {
      balances[m] += trx.amount;
    } else {
      balances[m] -= trx.amount;
    }
  });

  const bankChannel = channels.find(c => c.name === 'ব্যাংক');
  const bankBalance = balances['ব্যাংক'] || 0;
  const nonBankChannels = channels.filter(c => c.name !== 'ব্যাংক');

  return (
    <div className="px-4 py-3 select-none">
      {/* Title & Add Channel Action */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
          <WalletCards className="w-4 h-4 text-[#E52E2E]" />
          <span>{isBn ? 'পেমেন্ট চ্যানেল ও ব্যালেন্স হিসাব' : 'Payment Channels & Balance'}</span>
        </h3>
        
        {user?.role === 'admin' ? (
          <button
            onClick={() => {
              sounds.playTap();
              onOpenChannelManager();
            }}
            className="flex items-center gap-1 text-[11px] font-bold text-[#E52E2E] dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 border border-rose-200/80 dark:border-rose-900/60 px-2.5 py-0.5 rounded-full transition-all active:scale-95 shadow-2xs"
          >
            <Plus className="w-3 h-3 stroke-[2.5]" />
            <span>{isBn ? 'চ্যানেল যোগ' : '+ Add Channel'}</span>
          </button>
        ) : (
          <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
            {isBn ? 'রিয়েল-টাইম ব্যালেন্স' : 'Live Balances'}
          </span>
        )}
      </div>

      {/* Control Panel (কন্ট্রোল প্যানেল সহ নিচে) */}
      {user?.role === 'admin' && (
        <div className="mb-3.5 p-3 rounded-3xl bg-slate-50/90 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-rose-500" />
              {isBn ? 'কন্ট্রোল প্যানেল ও এন্ট্রি' : 'Control Panel & Entries'}
            </span>
            <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
              {isBn ? 'অ্যাডমিন কন্ট্রোল' : 'Admin Control'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {/* জমা এন্ট্রি */}
            <button
              onClick={() => {
                sounds.playTap();
                onOpenIncome();
              }}
              className="flex flex-col items-center justify-center py-2 px-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-750 hover:border-emerald-400 shadow-2xs hover:shadow-xs active:scale-95 transition-all group"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 flex items-center justify-center text-emerald-600 mb-1 group-hover:scale-110 transition-transform">
                <ArrowDownLeft className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                {isBn ? 'জমা এন্ট্রি' : 'Income Entry'}
              </span>
            </button>

            {/* খরচ এন্ট্রি */}
            <button
              onClick={() => {
                sounds.playTap();
                onOpenExpense();
              }}
              className="flex flex-col items-center justify-center py-2 px-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-750 hover:border-rose-400 shadow-2xs hover:shadow-xs active:scale-95 transition-all group"
            >
              <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200/60 flex items-center justify-center text-rose-600 mb-1 group-hover:scale-110 transition-transform">
                <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                {isBn ? 'খরচ এন্ট্রি' : 'Expense Entry'}
              </span>
            </button>

            {/* হিসাব খাতা */}
            <button
              onClick={() => {
                sounds.playTap();
                onOpenLedger();
              }}
              className="flex flex-col items-center justify-center py-2 px-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-750 hover:border-blue-400 shadow-2xs hover:shadow-xs active:scale-95 transition-all group"
            >
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 flex items-center justify-center text-blue-600 mb-1 group-hover:scale-110 transition-transform">
                <Calculator className="w-4 h-4 stroke-[2.2]" />
              </div>
              <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                {isBn ? 'হিসাব খাতা' : 'Ledger Book'}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Featured Bank Account Card with Smart Modern Icon */}
      {bankChannel && (
        <div
          onClick={() => {
            sounds.playTap();
            onSelectMethod('ব্যাংক');
          }}
          className="mb-3 p-3.5 rounded-3xl bg-gradient-to-r from-blue-50/90 via-indigo-50/70 to-blue-50/90 dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-blue-950/40 border border-blue-200/80 dark:border-blue-900/50 shadow-xs cursor-pointer hover:shadow-md active:scale-[0.985] transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            {/* Smart Bank Gradient Tile */}
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${getChannelGradient('ব্যাংক')} group-hover:scale-105 transition-transform`}>
              <SmartChannelIcon method="ব্যাংক" className="w-6 h-6 text-white" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  {isBn ? 'ব্যাংক লেনদেন (সকল ব্যাংক)' : 'Bank Accounts'}
                </h4>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200 uppercase tracking-wider">
                  {isBn ? 'ব্যাংক' : 'Bank'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {isBn ? 'ব্র্যাক, ইসলামী ব্যাংক, ডাচ-বাংলা ইত্যাদি' : 'BRAC, IBBL, DBBL & other banks'}
              </p>
            </div>
          </div>

          <div className="text-right">
            <h4 className="text-base font-extrabold text-blue-700 dark:text-blue-400 tabular-nums">
              {formatCurrency(bankBalance, lang)}
            </h4>
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 flex items-center justify-end gap-0.5 mt-0.5 group-hover:text-blue-600 transition-colors">
              {isBn ? 'স্টেটমেন্ট' : 'Details'}
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>
        </div>
      )}

      {/* Grid Channels: বিকাশ হিসাব, নগদ হিসাব, রকেট হিসাব, ক্যাশ হিসাব ইত্যাদি */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {nonBankChannels.map((ch) => {
          const bal = balances[ch.name] || 0;
          const iconGradient = getChannelGradient(ch.name);

          return (
            <div
              key={ch.id || ch.name}
              onClick={() => {
                sounds.playTap();
                onSelectMethod(ch.name);
              }}
              className={`p-3.5 rounded-3xl ${ch.bg} border ${ch.border} shadow-2xs cursor-pointer hover:shadow-md active:scale-98 transition-all flex flex-col justify-between group`}
            >
              {/* Header row: Smart Modern Icon + Channel Pill */}
              <div className="flex items-center justify-between mb-2">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${iconGradient} group-hover:scale-105 transition-transform overflow-hidden`}>
                  <SmartChannelIcon method={ch.name} imageUrl={ch.imageUrl} className="w-5 h-5 text-white" />
                </div>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-white/95 dark:bg-slate-900/95 text-slate-800 dark:text-slate-200 shadow-2xs border border-slate-200/60 dark:border-slate-800">
                  {ch.name}
                </span>
              </div>

              {/* Subtitle & Balance */}
              <div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">
                  {isBn ? ch.labelBn : ch.labelEn}
                </p>
                <div className="flex items-center justify-between mt-1">
                  <h4 className={`text-base font-extrabold ${ch.color} tabular-nums leading-tight`}>
                    {formatCurrency(bal, lang)}
                  </h4>
                  <div className="w-6 h-6 rounded-full bg-white/80 dark:bg-slate-800/80 flex items-center justify-center text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-100 shadow-2xs transition-colors">
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
