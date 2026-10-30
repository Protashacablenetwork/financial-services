import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, ChevronLeft, Settings2, Sparkles, Plus } from 'lucide-react';
import { BannerAd, Language, UserSession } from '../types';
import { sounds } from '../utils/audio';

interface PromoCarouselProps {
  banners: BannerAd[];
  lang: Language;
  user: UserSession | null;
  onExploreOffer: (banner?: BannerAd) => void;
  onOpenBannerManager: () => void;
}

export const PromoCarousel: React.FC<PromoCarouselProps> = ({
  banners,
  lang,
  user,
  onExploreOffer,
  onOpenBannerManager
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartXRef = useRef<number | null>(null);

  const activeBanners = banners.filter(b => b.isActive);
  const displayList = activeBanners.length > 0 ? activeBanners : banners;

  // Auto rotate every 4.5s unless paused
  useEffect(() => {
    if (displayList.length <= 1 || isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % displayList.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [displayList.length, isPaused]);

  if (displayList.length === 0) return null;

  // Safe slide index
  const safeIndex = currentSlide >= displayList.length ? 0 : currentSlide;
  const current = displayList[safeIndex] || displayList[0];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    sounds.playTap();
    setCurrentSlide((prev) => (prev === 0 ? displayList.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    sounds.playTap();
    setCurrentSlide((prev) => (prev + 1) % displayList.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    setIsPaused(true);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setIsPaused(false);
    if (touchStartXRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartXRef.current - touchEndX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        // Swiped Left -> Next
        sounds.playTap();
        setCurrentSlide((prev) => (prev + 1) % displayList.length);
      } else {
        // Swiped Right -> Prev
        sounds.playTap();
        setCurrentSlide((prev) => (prev === 0 ? displayList.length - 1 : prev - 1));
      }
    }
    touchStartXRef.current = null;
  };

  return (
    <div className="px-4 py-1.5 select-none relative">
      {/* Admin Quick Control Badge (Only visible to admin) */}
      {user?.role === 'admin' && (
        <div className="flex items-center justify-between mb-1.5 px-0.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
            <Sparkles className="w-3.5 h-3.5 text-[#E52E2E]" />
            <span>{lang === 'bn' ? 'মেইন পেইজ বিজ্ঞাপন' : 'Homepage Featured Ads'}</span>
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-rose-100 dark:bg-rose-950 text-[#E52E2E] dark:text-rose-400">
              {displayList.length}টি
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                sounds.playTap();
                onOpenBannerManager();
              }}
              className="flex items-center gap-1 text-[10px] font-bold text-[#E52E2E] dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 border border-rose-200/80 dark:border-rose-900/60 px-2 py-0.5 rounded-full transition-all active:scale-95 shadow-2xs"
            >
              <Settings2 className="w-3 h-3" />
              <span>{lang === 'bn' ? 'বিজ্ঞাপন নিয়ন্ত্রণ' : 'Manage Ads'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Banner Card (Slim, Horizontal bKash App Style) */}
      <div 
        onClick={() => {
          sounds.playTap();
          onExploreOffer(current);
        }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="relative overflow-hidden rounded-2xl bg-slate-900 shadow-xs group cursor-pointer border border-slate-200/80 dark:border-slate-800"
      >
        <div className="relative h-24 sm:h-26 w-full overflow-hidden">
          <img
            key={current.id}
            src={current.imageUrl}
            alt={current.titleBn}
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
            className="w-full h-full object-cover object-center transition-all duration-700 ease-out group-hover:scale-105"
          />
          {/* Measured horizontal gradient scrim for bKash style readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-black/15" />

          {/* Slide Navigation Chevrons */}
          {displayList.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                aria-label="Previous Slide"
                className="absolute left-1 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
              >
                <ChevronLeft className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
              <button
                onClick={handleNext}
                aria-label="Next Slide"
                className="absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
              >
                <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </>
          )}

          {/* Banner Content (Compact & Sleek) */}
          <div className="absolute inset-0 px-3.5 py-2.5 flex items-center justify-between text-white pointer-events-none">
            <div className="flex-1 min-w-0 pr-2.5">
              {(current.badgeBn || current.badgeEn) && (
                <div className="mb-0.5">
                  <span className="inline-block text-[9px] font-extrabold px-1.5 py-0.2 rounded-full bg-[#E52E2E] text-white shadow-2xs">
                    {lang === 'bn' ? (current.badgeBn || 'অফার') : (current.badgeEn || 'Offer')}
                  </span>
                </div>
              )}

              <h4 className="text-xs sm:text-sm font-bold text-white leading-snug line-clamp-1 drop-shadow-sm">
                {lang === 'bn' ? current.titleBn : current.titleEn}
              </h4>

              <p className="text-[10px] sm:text-[11px] text-slate-200 line-clamp-1 opacity-90 mt-0.5">
                {lang === 'bn' ? current.subtitleBn : current.subtitleEn}
              </p>
            </div>

            <div className="shrink-0 flex items-center">
              <span className="flex items-center gap-0.5 text-[10px] sm:text-[11px] font-bold text-white bg-white/20 hover:bg-white/30 backdrop-blur-xs px-2.5 py-1 rounded-full shadow-2xs border border-white/25">
                <span>{lang === 'bn' ? 'বিস্তারিত' : 'Details'}</span>
                <ChevronRight className="w-3 h-3 stroke-[2.5]" />
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Dots Indicator */}
      {displayList.length > 1 && (
        <div className="flex justify-center items-center gap-1 mt-1.5">
          {displayList.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                sounds.playTap();
                setCurrentSlide(idx);
              }}
              className={`h-1 rounded-full transition-all duration-300 ${
                safeIndex === idx ? 'w-5 bg-[#E52E2E]' : 'w-1 bg-slate-300 dark:bg-slate-700'
              }`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
