import React, { useState, useRef } from 'react';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Edit3, 
  Eye, 
  EyeOff, 
  Image as ImageIcon, 
  Sparkles, 
  Check, 
  Upload,
  AlertCircle,
  X,
  RefreshCw
} from 'lucide-react';
import { BannerAd, Language } from '../types';
import { sounds } from '../utils/audio';
import { compressImage } from '../utils/imageCompressor';
import promoFestival from '../assets/images/protyasha_promo_festival_banner_1792226649161.jpg';
import promoWeekend from '../assets/images/protyasha_weekend_add_money_banner_1792226649420.jpg';

interface BannerManagerModalProps {
  isOpen: boolean;
  banners: BannerAd[];
  lang: Language;
  onClose: () => void;
  onSaveBanners: (updated: BannerAd[]) => void;
}

const MAX_BANNERS = 7;
const MIN_RECOMMENDED_BANNERS = 5;

export const BannerManagerModal: React.FC<BannerManagerModalProps> = ({
  isOpen,
  banners,
  lang,
  onClose,
  onSaveBanners
}) => {
  if (!isOpen) return null;

  const [bannerList, setBannerList] = useState<BannerAd[]>(banners);

  React.useEffect(() => {
    if (banners && banners.length > 0) {
      setBannerList(banners);
    }
  }, [banners, isOpen]);
  const [editingBanner, setEditingBanner] = useState<BannerAd | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');

  // Form fields
  const [badgeBn, setBadgeBn] = useState('');
  const [badgeEn, setBadgeEn] = useState('');
  const [titleBn, setTitleBn] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [subtitleBn, setSubtitleBn] = useState('');
  const [subtitleEn, setSubtitleEn] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [selectedLinkType, setSelectedLinkType] = useState<'internal' | 'custom'>('internal');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const internalLinks = [
    { id: '#home', bn: '🏠 হোম (ড্যাশবোর্ড)', en: '🏠 Home Dashboard' },
    { id: '#weather', bn: '🌦️ ৭ দিনের লাইভ আবহাওয়া', en: '🌦️ 7-Day Weather' },
    { id: '#transactions', bn: '📊 লেনদেন তালিকা ও চ্যানেল', en: '📊 All Transactions' },
    { id: '#ledger', bn: '🧾 হিসাব খাতা (রিপোর্ট)', en: '🧾 Accounts Ledger' },
    { id: '#profile', bn: '👤 প্রোফাইল ও সেটিংস', en: '👤 User Profile' },
    { id: '#category:bill', bn: '📡 ইন্টারনেট বিল কালেকশন', en: '📡 Internet Bill Collection' },
    { id: '#category:bKash', bn: '📱 বিকাশ লেনদেন', en: '📱 bKash Trx' },
    { id: '#category:Nagad', bn: '💵 নগদ লেনদেন', en: '💵 Nagad Trx' },
    { id: '#portal:bill-manager', bn: '⚡ বিল ম্যানেজমেন্ট প্রো', en: '⚡ Bill Management Pro' },
    { id: '#portal:ay-byay', bn: '💰 আয়-ব্যয় হিসাব খাতা', en: '💰 Income-Expense accounts' },
    { id: '#notifications', bn: '🔔 নোটিফিকেশন সেন্টার', en: '🔔 Notifications' },
    { id: '#offer', bn: '🏷️ অফার পেইজ', en: '🏷️ Current Offers' },
    { id: '#store', bn: '📍 স্টোর লোকেশন', en: '📍 Branch/Store' },
    { id: '#help', bn: '❓ হেল্পলাইন ও সাপোর্ট', en: '❓ Help & Support' },
    { id: 'tel:01777877207', bn: '📞 হেল্পলাইন কল (01777877207)', en: '📞 Call 01777877207' },
  ];

  // 8 High Quality Curated Presets
  const imagePresets = [
    { 
      label: 'উৎসব ও ফ্যামিলি অফার', 
      labelEn: 'Family TV Offer',
      url: promoFestival 
    },
    { 
      label: 'উইকেন্ড ও কার্নিভাল অফার', 
      labelEn: 'Weekend Carnival',
      url: promoWeekend 
    },
    { 
      label: 'ফাইবার অপটিক ও ক্যাবল নেটওয়ার্ক', 
      labelEn: 'Fiber Optic Cable',
      url: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80' 
    },
    { 
      label: 'অনলাইন পেমেন্ট ও ক্যাশব্যাক', 
      labelEn: 'Digital Cash Rebate',
      url: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80' 
    },
    {
      label: 'লাইভ খেলা ও ক্রিকেট এইচডি',
      labelEn: 'Live Sports & Cricket',
      url: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=80'
    },
    {
      label: 'সিনেমা ও প্রিমিয়াম বিনোদন',
      labelEn: 'Cinema & 4K Movies',
      url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80'
    },
    {
      label: 'আল্ট্রা হাই-স্পিড ব্রডব্যান্ড',
      labelEn: 'High Speed Bandwidth',
      url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80'
    },
    {
      label: '২৪/৭ কাস্টমার সাপোর্ট ও হেল্পলাইন',
      labelEn: '24/7 Helpline Support',
      url: 'https://images.unsplash.com/photo-1534536281715-e28d76689b4d?auto=format&fit=crop&w=800&q=80'
    }
  ];

  const quickBadges = [
    { bn: 'ধামাকা অফার', en: 'Mega Offer' },
    { bn: 'ক্যাশব্যাক বোনাস', en: 'Cashback' },
    { bn: 'উইকেন্ড স্পেশাল', en: 'Weekend Deal' },
    { bn: 'ফাইবার কম্বো', en: 'Fiber Combo' },
    { bn: 'জরুরি সেবা', en: 'Helpline' }
  ];

  // Device file upload
  const handleDeviceFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    try {
      // Compress client-side to clean 900x500 ~60KB image
      const compressedDataUrl = await compressImage(file, 900, 500, 0.85);
      setImageUrl(compressedDataUrl);
      sounds.playSuccess();

      // Also send to server in background
      fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: compressedDataUrl, filename: file.name })
      }).catch(() => {});
    } catch (err) {
      console.error('Error uploading banner image:', err);
    }
  };

  const handleStartEdit = (b: BannerAd) => {
    sounds.playTap();
    setEditingBanner(b);
    setIsCreating(false);
    setBadgeBn(b.badgeBn);
    setBadgeEn(b.badgeEn);
    setTitleBn(b.titleBn);
    setTitleEn(b.titleEn);
    setSubtitleBn(b.subtitleBn);
    setSubtitleEn(b.subtitleEn);
    setImageUrl(b.imageUrl);
    setLinkUrl(b.linkUrl);
    const isInternal = internalLinks.some(l => l.id === b.linkUrl);
    setSelectedLinkType(isInternal ? 'internal' : 'custom');
    setUploadedFileName(b.imageUrl.startsWith('data:') ? 'ডিভাইসের ছবি' : '');
  };

  const handleStartCreate = () => {
    if (bannerList.length >= MAX_BANNERS) {
      setValidationError(lang === 'bn' 
        ? `বিজ্ঞাপন ৫ থেকে ৭টি পর্যন্ত রাখা যাবে। বর্তমানে সর্বোচ্চ ${MAX_BANNERS}টি বিজ্ঞাপন রয়েছে!` 
        : `Maximum limit of ${MAX_BANNERS} ads reached!`);
      return;
    }
    sounds.playTap();
    setEditingBanner(null);
    setIsCreating(true);
    setBadgeBn('ধামাকা অফার');
    setBadgeEn('Special Offer');
    setTitleBn('ক্যাবল ও ইন্টারনেট বিল পেমেন্টে আকর্ষণীয় ক্যাশব্যাক নিশ্চিত');
    setTitleEn('Guaranteed Cashback on Cable & Net Bill Payments');
    setSubtitleBn('বিকাশ, নগদ, রকেট ও ব্যাংক ট্রান্সফারে ছাড় উপভোগ করুন');
    setSubtitleEn('Enjoy rebate via bKash, Nagad, Rocket & Bank transfer');
    setImageUrl(promoFestival);
    setLinkUrl('tab:home');
    setSelectedLinkType('internal');
    setUploadedFileName('');
  };

  const handleToggleActive = (id: string) => {
    sounds.playTap();
    const updated = bannerList.map(b => (b.id === id ? { ...b, isActive: !b.isActive } : b));
    setBannerList(updated);
    onSaveBanners(updated);
  };

  const handleDelete = (id: string) => {
    sounds.playTap();
    if (bannerList.length <= 1) {
      setValidationError(lang === 'bn' ? 'কমপক্ষে একটি বিজ্ঞাপন সক্রিয় থাকা প্রয়োজন' : 'At least one ad is required');
      return;
    }
    setDeleteConfirmId(id);
  };

  const confirmDelete = () => {
    if (!deleteConfirmId) return;
    const updated = bannerList.filter(b => b.id !== deleteConfirmId);
    setBannerList(updated);
    onSaveBanners(updated);
    setDeleteConfirmId(null);
    sounds.playSuccess();
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleBn.trim()) {
      setValidationError(lang === 'bn' ? 'বিজ্ঞাপনের মূল শিরোনাম দিন' : 'Please enter ad title');
      return;
    }

    sounds.playSuccess();

    if (editingBanner) {
      // Update
      const updated = bannerList.map(b => {
        if (b.id === editingBanner.id) {
          return {
            ...b,
            badgeBn: badgeBn.trim() || 'অফার',
            badgeEn: badgeEn.trim() || 'Offer',
            titleBn: titleBn.trim(),
            titleEn: titleEn.trim() || titleBn.trim(),
            subtitleBn: subtitleBn.trim(),
            subtitleEn: subtitleEn.trim() || subtitleBn.trim(),
            imageUrl: imageUrl || promoFestival,
            linkUrl: linkUrl.trim() || '#'
          };
        }
        return b;
      });
      setBannerList(updated);
      onSaveBanners(updated);
    } else {
      // Create
      const newBanner: BannerAd = {
        id: `banner-${Date.now()}`,
        badgeBn: badgeBn.trim() || 'অফার',
        badgeEn: badgeEn.trim() || 'Offer',
        titleBn: titleBn.trim(),
        titleEn: titleEn.trim() || titleBn.trim(),
        subtitleBn: subtitleBn.trim(),
        subtitleEn: subtitleEn.trim() || subtitleBn.trim(),
        imageUrl: imageUrl || promoFestival,
        linkUrl: linkUrl.trim() || '#',
        isActive: true,
        priority: bannerList.length + 1
      };
      const updated = [newBanner, ...bannerList];
      setBannerList(updated);
      onSaveBanners(updated);
    }

    setEditingBanner(null);
    setIsCreating(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-100 dark:bg-slate-950 flex flex-col select-none animate-in slide-in-from-right duration-200">
      {/* Top App Bar */}
      <div className="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 h-14 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              sounds.playTap();
              onClose();
            }}
            className="w-9 h-9 rounded-full flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
          </button>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#E52E2E]" />
              <span>{lang === 'bn' ? 'বিজ্ঞাপন নিয়ন্ত্রণ (অ্যাডমিন প্যানেল)' : 'Ads Control (Admin Only)'}</span>
            </h2>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
              {lang === 'bn' 
                ? `বিজ্ঞাপন স্লট: ${bannerList.length}/${MAX_BANNERS} টি (৫-৭ টি রাখা যাবে)` 
                : `Slots: ${bannerList.length}/${MAX_BANNERS} (5-7 recommended)`}
            </span>
          </div>
        </div>

        {!isCreating && !editingBanner && (
          <button
            onClick={handleStartCreate}
            disabled={bannerList.length >= MAX_BANNERS}
            className={`h-9 px-3 rounded-xl text-white text-xs font-bold flex items-center gap-1 shadow-sm active:scale-95 transition-all ${
              bannerList.length >= MAX_BANNERS 
                ? 'bg-slate-400 cursor-not-allowed opacity-60' 
                : 'bg-[#E52E2E] hover:bg-rose-700'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>{lang === 'bn' ? 'নতুন বিজ্ঞাপন' : 'Add Ad'}</span>
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-28">
        {/* Banner Slots Notice Bar */}
        <div className="p-3 rounded-2xl bg-gradient-to-r from-rose-50 to-orange-50 dark:from-rose-950/30 dark:to-orange-950/30 border border-rose-200 dark:border-rose-900/40 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
            <span className="w-2 h-2 rounded-full bg-[#E52E2E] animate-ping" />
            <span className="font-semibold text-[11px]">
              {lang === 'bn' 
                ? 'মেইন পেইজে ৫ থেকে ৭ টি বিজ্ঞাপন স্লাইডার হিসেবে প্রদর্শন হবে।' 
                : '5 to 7 ads can be displayed in homepage showcase.'}
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-white dark:bg-slate-900 font-extrabold text-[#E52E2E] text-xs shadow-2xs">
            {bannerList.length} / {MAX_BANNERS}
          </span>
        </div>

        {/* Editor Form if creating or editing */}
        {(isCreating || editingBanner) ? (
          <form onSubmit={handleSaveForm} className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#E52E2E]" />
                <span>
                  {editingBanner 
                    ? (lang === 'bn' ? 'বিজ্ঞাপন সম্পাদনা' : 'Edit Banner Ad') 
                    : (lang === 'bn' ? 'নতুন বিজ্ঞাপন ব্যানার যোগ' : 'Add New Banner Ad')}
                </span>
              </h3>
              <button
                type="button"
                onClick={() => {
                  setEditingBanner(null);
                  setIsCreating(false);
                }}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              >
                {lang === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>
            </div>

            {/* Live Visual Preview */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                {lang === 'bn' ? 'লাইভ প্রিভিউ (মেইন পেইজে যেভাবে দেখাবে)' : 'Live Preview'}
              </label>
              <div className="relative h-38 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-900 shadow-inner">
                <img
                  src={imageUrl || promoFestival}
                  alt="Preview"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/20 p-3.5 flex flex-col justify-end text-white">
                  <span className="self-start text-[9px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#E52E2E] text-white uppercase mb-1">
                    {badgeBn || 'অফার'}
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold leading-tight line-clamp-2 drop-shadow-sm">
                    {titleBn || 'বিজ্ঞাপনের মূল শিরোনাম'}
                  </h4>
                  <p className="text-[11px] text-slate-200 line-clamp-1 mt-0.5">
                    {subtitleBn || 'বিস্তারিত বিবরণ ও শর্তাবলী'}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Badge Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {lang === 'bn' ? 'দ্রুত অফার ব্যাজ পছন্দ করুন:' : 'Quick Badges:'}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {quickBadges.map((qb, i) => (
                  <button
                    type="button"
                    key={i}
                    onClick={() => {
                      sounds.playTap();
                      setBadgeBn(qb.bn);
                      setBadgeEn(qb.en);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                      badgeBn === qb.bn
                        ? 'bg-[#E52E2E] text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {qb.bn}
                  </button>
                ))}
              </div>
            </div>

            {/* Device File Upload + Image Presets */}
            <div className="space-y-2.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                {lang === 'bn' ? 'বিজ্ঞাপনের ছবি (ডিভাইস থেকে ফাইল সিলেক্ট বা প্রিসেট) *' : 'Ad Image (Upload from device or preset) *'}
              </label>

              {/* Upload from Device button */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleDeviceFileUpload}
                className="hidden"
              />

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 h-12 px-3 rounded-2xl border-2 border-dashed border-[#E52E2E] bg-rose-50/70 dark:bg-rose-950/20 text-[#E52E2E] dark:text-rose-400 font-bold text-xs flex items-center justify-center gap-2 hover:bg-rose-100 active:scale-98 transition-all"
                >
                  <Upload className="w-4 h-4 stroke-[2.2]" />
                  <span>{lang === 'bn' ? '📁 ডিভাইস থেকে ছবি নির্বাচন করুন (Phone / PC)' : '📁 Choose Image from Device'}</span>
                </button>
              </div>

              {uploadedFileName && (
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span className="font-semibold truncate max-w-[220px]">
                      {uploadedFileName}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setUploadedFileName('');
                      setImageUrl(promoFestival);
                    }}
                    className="text-slate-400 hover:text-rose-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Curated Presets Grid */}
              <div className="pt-1">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1.5">
                  {lang === 'bn' ? 'অথবা নিচের ছবি প্রিসেট থেকে নির্বাচন করুন:' : 'Or pick from preset images:'}
                </span>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {imagePresets.map((preset, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => {
                        sounds.playTap();
                        setImageUrl(preset.url);
                        setUploadedFileName('');
                      }}
                      className={`p-1.5 rounded-xl border text-left text-[11px] font-medium transition-all flex items-center gap-2 overflow-hidden ${
                        imageUrl === preset.url
                          ? 'border-[#E52E2E] bg-rose-50 text-[#E52E2E] dark:bg-rose-950/50 shadow-xs'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 bg-slate-900">
                        <img 
                          src={preset.url} 
                          alt={preset.label} 
                          referrerPolicy="no-referrer" 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <span className="truncate leading-tight">{preset.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Badge Input */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  ব্যাজ (বাংলা)
                </label>
                <input
                  type="text"
                  value={badgeBn}
                  onChange={(e) => setBadgeBn(e.target.value)}
                  placeholder="যেমন: ধামাকা অফার"
                  className="w-full h-10 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Badge (English)
                </label>
                <input
                  type="text"
                  value={badgeEn}
                  onChange={(e) => setBadgeEn(e.target.value)}
                  placeholder="e.g. Mega Deal"
                  className="w-full h-10 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Title Fields */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                বিজ্ঞাপনের মূল শিরোনাম (বাংলা) *
              </label>
              <input
                type="text"
                required
                value={titleBn}
                onChange={(e) => setTitleBn(e.target.value)}
                placeholder="যেমন: ক্যাবল ও ইন্টারনেট বিল পরিশোধে ১০০ টাকা ইনস্ট্যান্ট ক্যাশব্যাক"
                className="w-full h-10 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Ad Title (English)
              </label>
              <input
                type="text"
                value={titleEn}
                onChange={(e) => setTitleEn(e.target.value)}
                placeholder="e.g. Instant Cashback on Cable & Net Bills"
                className="w-full h-10 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            {/* Subtitle / Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                বিবরণ / সাবটাইটেল (বাংলা)
              </label>
              <input
                type="text"
                value={subtitleBn}
                onChange={(e) => setSubtitleBn(e.target.value)}
                placeholder="যেমন: অফারটি নগদ, বিকাশ, রকেট ও ব্যাংক একাউন্টে প্রযোজ্য"
                className="w-full h-10 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            {/* Action Link / Dropdown */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {lang === 'bn' ? 'অ্যাকশন লিংক বা গন্তব্য পেইজ পছন্দ করুন' : 'Action Link or Destination Page'}
              </label>
              
              <div className="flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 mb-2 border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedLinkType('internal');
                    setLinkUrl(internalLinks[0].id);
                  }}
                  className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                    selectedLinkType === 'internal' 
                      ? 'bg-white dark:bg-slate-900 text-[#E52E2E] shadow-sm' 
                      : 'text-slate-500'
                  }`}
                >
                  {lang === 'bn' ? 'অ্যাপ পেইজ সিলেক্ট' : 'App Pages'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedLinkType('custom');
                    setLinkUrl('#');
                  }}
                  className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                    selectedLinkType === 'custom' 
                      ? 'bg-white dark:bg-slate-900 text-[#E52E2E] shadow-sm' 
                      : 'text-slate-500'
                  }`}
                >
                  {lang === 'bn' ? 'কাস্টম লিংক (URL)' : 'Custom Link'}
                </button>
              </div>

              {selectedLinkType === 'internal' ? (
                <div className="relative">
                  <select
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    className="w-full h-11 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white appearance-none focus:outline-none focus:border-[#E52E2E]"
                  >
                    {internalLinks.map(link => (
                      <option key={link.id} value={link.id}>
                        {lang === 'bn' ? link.bn : link.en}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
                    <RefreshCw className="w-3.5 h-3.5" />
                  </div>
                </div>
              ) : (
                <input
                  type="text"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder={lang === 'bn' ? 'লিংক লিখুন (https://...)' : 'Enter link (https://...)'}
                  className="w-full h-11 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-[#E52E2E]"
                />
              )}
            </div>

            <button
              type="submit"
              className="w-full h-12 rounded-2xl bg-gradient-to-r from-[#D32F2F] to-[#E52E2E] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-rose-600/30 active:scale-98 transition-all"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>{lang === 'bn' ? 'সংরক্ষণ করুন ও হোমপেজে প্রকাশ করুন' : 'Save & Publish to Homepage'}</span>
            </button>
          </form>
        ) : (
          /* List of Active & Inactive Banners (Up to 7) */
          <div className="space-y-3">
            {bannerList.map((banner, index) => (
              <div
                key={banner.id}
                className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-col gap-2.5"
              >
                <div className="flex items-start gap-3">
                  <div className="relative w-24 h-16 rounded-xl overflow-hidden bg-slate-900 shrink-0 border border-slate-200 dark:border-slate-700">
                    <img
                      src={banner.imageUrl}
                      alt={banner.titleBn}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-1 left-1 px-1.5 py-0.2 rounded-md bg-black/70 text-white text-[9px] font-bold">
                      #{index + 1}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-[#E52E2E] dark:bg-rose-950/40">
                        {lang === 'bn' ? banner.badgeBn : banner.badgeEn}
                      </span>
                      {banner.isActive ? (
                        <span className="text-[9px] font-bold text-emerald-600">● সক্রিয় (Live)</span>
                      ) : (
                        <span className="text-[9px] font-semibold text-slate-400">○ নিষ্ক্রিয়</span>
                      )}
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                      {lang === 'bn' ? banner.titleBn : banner.titleEn}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                      {lang === 'bn' ? banner.subtitleBn : banner.subtitleEn}
                    </p>
                  </div>
                </div>

                {/* Banner Actions Bar */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <button
                    onClick={() => handleToggleActive(banner.id)}
                    className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors ${
                      banner.isActive
                        ? 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40'
                        : 'text-slate-500 bg-slate-100 dark:bg-slate-800'
                    }`}
                  >
                    {banner.isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span>{banner.isActive ? (lang === 'bn' ? 'হোমপেজে দৃশ্যমান' : 'Live') : (lang === 'bn' ? 'লুকানো' : 'Hidden')}</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleStartEdit(banner)}
                      className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-[11px] flex items-center gap-1"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>{lang === 'bn' ? 'এডিট' : 'Edit'}</span>
                    </button>
                    <button
                      onClick={() => handleDelete(banner.id)}
                      className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-[#E52E2E] hover:bg-rose-100 flex items-center justify-center transition-colors"
                      title="মুছুন"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Custom Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs flex items-center justify-center p-5 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center mx-auto mb-4 border border-rose-100 dark:border-rose-900/40">
              <Trash2 className="w-8 h-8 text-rose-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              {lang === 'bn' ? 'বিজ্ঞাপনটি মুছে ফেলতে চান?' : 'Confirm Delete?'}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              {lang === 'bn' 
                ? 'এই বিজ্ঞাপন ব্যানারটি হোমপেজ স্লাইডার থেকে স্থায়ীভাবে সরিয়ে ফেলা হবে।' 
                : 'This banner will be permanently removed from the homepage slider.'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-sm active:scale-95 transition-all"
              >
                {lang === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-3 rounded-xl bg-[#E52E2E] text-white font-bold text-sm shadow-md shadow-rose-600/20 active:scale-95 transition-all"
              >
                {lang === 'bn' ? 'ঠিক আছে' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Styled Validation Alert Modal */}
      {validationError && (
        <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-xs flex items-center justify-center p-5 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-orange-50 dark:bg-orange-950/40 flex items-center justify-center mx-auto mb-4 border border-orange-100 dark:border-orange-900/40">
              <AlertCircle className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              {lang === 'bn' ? 'সতর্কতা' : 'Attention'}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              {validationError}
            </p>
            <button
              onClick={() => setValidationError(null)}
              className="w-full py-3 rounded-xl bg-[#E52E2E] text-white font-bold text-sm shadow-md shadow-rose-600/20 active:scale-95 transition-all"
            >
              {lang === 'bn' ? 'ঠিক আছে' : 'OK'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
