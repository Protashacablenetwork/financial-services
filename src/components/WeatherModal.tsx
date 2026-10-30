import React, { useState, useEffect, useMemo } from 'react';
import { 
  ArrowLeft, 
  MapPin, 
  RefreshCw, 
  Sun, 
  CloudRain, 
  Cloud, 
  CloudLightning, 
  Wind, 
  Droplets, 
  Sunrise, 
  Sunset, 
  Umbrella,
  ShieldAlert,
  Sparkles,
  Search,
  Check,
  Navigation,
  BellRing,
  X
} from 'lucide-react';
import { Language, NotificationItem } from '../types';
import { 
  WeatherData, 
  DailyForecast, 
  fetchLiveWeather, 
  ALL_BANGLADESH_DISTRICTS, 
  setUserPreferredDistrict,
  clearUserPreferredDistrict,
  getUserPreferredDistrict,
  DistrictInfo
} from '../utils/weatherService';
import { buildWeatherNotification, getCurrentSlot } from '../utils/weatherNotificationService';
import { toBengaliNumber } from '../utils/formatters';
import { sounds } from '../utils/audio';

interface WeatherModalProps {
  isOpen: boolean;
  lang: Language;
  onClose: () => void;
  isAdmin?: boolean;
  onSendWeatherNotification?: (notif: NotificationItem) => void;
  onLocationChanged?: () => void;
}

export const WeatherModal: React.FC<WeatherModalProps> = ({ 
  isOpen, 
  lang, 
  onClose,
  isAdmin = false,
  onSendWeatherNotification,
  onLocationChanged
}) => {
  const isBn = lang === 'bn';
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  
  // District Switcher Modal State
  const [isDistrictPickerOpen, setIsDistrictPickerOpen] = useState(false);
  const [districtSearch, setDistrictSearch] = useState('');
  const [selectedDivision, setSelectedDivision] = useState<string>('সব');
  const [notificationSentToast, setNotificationSentToast] = useState(false);

  const loadWeather = async (force = false) => {
    setIsLoading(true);
    try {
      const data = await fetchLiveWeather(force);
      setWeather(data);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadWeather(false);
    }
  }, [isOpen]);

  // Filter 64 districts by search and division with unicode normalization
  const filteredDistricts = useMemo(() => {
    const norm = (s: string) => (s || '').normalize('NFC').replace(/য়/g, 'য়').trim();
    const selDivNorm = norm(selectedDivision);
    return ALL_BANGLADESH_DISTRICTS.filter(d => {
      const matchDivision = selectedDivision === 'সব' || norm(d.divisionBn) === selDivNorm;
      const q = districtSearch.trim().toLowerCase();
      const matchSearch = !q || 
        d.nameBn.toLowerCase().includes(q) || 
        d.nameEn.toLowerCase().includes(q) || 
        norm(d.divisionBn).toLowerCase().includes(q);
      return matchDivision && matchSearch;
    });
  }, [districtSearch, selectedDivision]);

  const handleSelectDistrict = (district: DistrictInfo) => {
    sounds.playTap();
    setUserPreferredDistrict(district.nameBn);
    setIsDistrictPickerOpen(false);
    loadWeather(true);
    if (onLocationChanged) onLocationChanged();
  };

  const handleAutoDetect = () => {
    sounds.playTap();
    clearUserPreferredDistrict();
    setIsDistrictPickerOpen(false);
    loadWeather(true);
    if (onLocationChanged) onLocationChanged();
  };

  const handleBroadcastWeatherBulletin = () => {
    if (!weather || !onSendWeatherNotification) return;
    sounds.playSuccess();
    const nowHour = new Date().getHours();
    const slot = getCurrentSlot(nowHour);
    const notif = buildWeatherNotification(weather, slot, weather.conditionType === 'thunder' || (weather.conditionType === 'rain' && weather.rainProbability >= 65));
    onSendWeatherNotification(notif);
    setNotificationSentToast(true);
    setTimeout(() => setNotificationSentToast(false), 3500);
  };

  if (!isOpen) return null;

  const currentCondition = weather?.conditionType || 'sun';
  const activeDay: DailyForecast | undefined = weather?.daily[selectedDayIndex] || weather?.daily[0];
  const preferred = getUserPreferredDistrict();

  const divisions = ['সব', 'ঢাকা', 'চট্টগ্রাম', 'রাজশাহী', 'খুলনা', 'বরিশাল', 'সিলেট', 'রংপুর', 'ময়মনসিংহ'];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900 text-white select-none flex flex-col overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
      {/* Dynamic Animated Atmospheric Background */}
      <div className={`fixed inset-0 pointer-events-none transition-all duration-700 ${
        currentCondition === 'rain'
          ? 'bg-gradient-to-b from-slate-900 via-sky-950 to-slate-950'
          : currentCondition === 'thunder'
            ? 'bg-gradient-to-b from-slate-950 via-purple-950 to-slate-900'
            : currentCondition === 'cloud'
              ? 'bg-gradient-to-b from-slate-800 via-sky-900 to-slate-900'
              : 'bg-gradient-to-b from-amber-600/90 via-orange-600 to-sky-900'
      }`}>
        {/* Animated Sunbeam */}
        {currentCondition === 'sun' && (
          <div className="absolute inset-0 overflow-hidden opacity-30">
            <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-amber-400 blur-3xl animate-pulse" />
            <div className="absolute top-10 right-10 w-40 h-40 rounded-full bg-yellow-300/40 blur-2xl animate-spin [animation-duration:35s]" />
          </div>
        )}

        {/* Drifting Clouds */}
        {currentCondition === 'cloud' && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
            <div className="absolute top-12 left-[-20%] w-72 h-24 bg-white/20 rounded-full blur-xl animate-[cloudDrift_25s_linear_infinite]" />
            <div className="absolute top-36 left-[-30%] w-96 h-28 bg-white/15 rounded-full blur-2xl animate-[cloudDrift_40s_linear_infinite]" />
          </div>
        )}

        {/* CSS Raindrops & Lightning */}
        {(currentCondition === 'rain' || currentCondition === 'thunder') && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="rain-container">
              {Array.from({ length: 32 }).map((_, i) => (
                <div
                  key={i}
                  className="raindrop"
                  style={{
                    left: `${(i * 3.1).toFixed(1)}%`,
                    animationDelay: `${(i * 0.11).toFixed(2)}s`,
                    animationDuration: `${0.8 + (i % 5) * 0.1}s`
                  }}
                />
              ))}
            </div>
            {currentCondition === 'thunder' && (
              <div className="absolute inset-0 bg-white/10 animate-[lightning_5s_infinite] pointer-events-none" />
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes cloudDrift {
          0% { transform: translateX(0); }
          100% { transform: translateX(140vw); }
        }
        .rain-container {
          position: absolute;
          inset: 0;
          overflow: hidden;
        }
        .raindrop {
          position: absolute;
          top: -30px;
          width: 1.5px;
          height: 24px;
          background: linear-gradient(to bottom, rgba(255,255,255,0), rgba(186, 230, 253, 0.7));
          border-radius: 9999px;
          animation: rainFall 1s linear infinite;
        }
        @keyframes rainFall {
          0% { transform: translateY(-30px); opacity: 0; }
          30% { opacity: 0.8; }
          100% { transform: translateY(105vh); opacity: 0.2; }
        }
        @keyframes lightning {
          0%, 94%, 98%, 100% { opacity: 0; }
          95%, 97% { opacity: 0.45; }
        }
        @keyframes spinSlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* Top Header Bar */}
      <div className="relative z-10 flex items-center justify-between px-4 pt-4 pb-3 border-b border-white/10 backdrop-blur-md bg-black/25">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              sounds.playTap();
              onClose();
            }}
            className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 transition-all flex items-center justify-center text-white backdrop-blur-md border border-white/20"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          </button>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
              <h2 className="text-base font-black tracking-tight text-white drop-shadow-sm">
                {weather?.cityBn || 'ঢাকা'}
              </h2>
              {weather?.divisionBn && (
                <span className="text-[11px] text-white/70 font-semibold">
                  ({weather.divisionBn})
                </span>
              )}
              {/* Auto / Manual Badge */}
              <button
                onClick={() => {
                  sounds.playTap();
                  setIsDistrictPickerOpen(true);
                }}
                className={`text-[10px] px-2 py-0.5 rounded-full border font-bold flex items-center gap-1 active:scale-95 transition-all ${
                  preferred 
                    ? 'bg-amber-500/20 text-amber-200 border-amber-400/40'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                }`}
              >
                <Navigation className="w-2.5 h-2.5" />
                <span>{preferred ? (isBn ? 'বাছাইকৃত' : 'Selected') : (isBn ? 'লাইভ অটো' : 'Auto GPS/IP')}</span>
                <span className="underline ml-0.5">{isBn ? 'বদলান' : 'Change'}</span>
              </button>
            </div>
            <p className="text-[11px] text-white/75 font-medium">
              {isBn ? 'রিয়েল-টাইম ৭ দিনের আবহাওয়া বার্তা ও অটো বুলেটিন' : 'Real-time 7-day forecast & alerts'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Refresh Button */}
          <button
            onClick={() => {
              sounds.playTap();
              loadWeather(true);
            }}
            disabled={isLoading}
            className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 transition-all flex items-center justify-center text-white backdrop-blur-md border border-white/20"
            title={isBn ? 'রিফ্রেশ করুন' : 'Refresh'}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-rose-300' : ''}`} />
          </button>
        </div>
      </div>

      {/* Notification Broadcast Success Toast */}
      {notificationSentToast && (
        <div className="fixed top-18 left-4 right-4 z-50 mx-auto max-w-md p-3.5 rounded-2xl bg-emerald-600 text-white shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-4 duration-200">
          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <Check className="w-5 h-5" />
          </div>
          <div className="text-xs">
            <p className="font-bold">{isBn ? 'আবহাওয়া বার্তা অ্যাপ নোটিফিকেশনে পাঠানো হয়েছে!' : 'Weather bulletin sent to notifications!'}</p>
            <p className="text-emerald-100 text-[11px]">{isBn ? 'সকল ব্যবহারকারী ও নোটিফিকেশন সেন্টারে প্রদর্শিত হচ্ছে।' : 'Visible to all users in the notifications center.'}</p>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 px-4 py-4 max-w-2xl mx-auto w-full space-y-4 pb-20">
        
        {/* Hero Today Weather Card with Live Graphic Icon */}
        <div className="relative overflow-hidden rounded-3xl p-6 bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white/90 uppercase tracking-wider bg-white/15 px-3 py-1 rounded-full border border-white/15">
                  {isBn ? 'আজকের আবহাওয়া' : "Today's Weather"}
                </span>
                <button
                  onClick={() => {
                    sounds.playTap();
                    setIsDistrictPickerOpen(true);
                  }}
                  className="text-[11px] font-bold text-rose-300 hover:text-white flex items-center gap-1 bg-black/25 px-2.5 py-1 rounded-full border border-white/10 active:scale-95 transition-all"
                >
                  <MapPin className="w-3 h-3 text-rose-400" />
                  <span>{weather?.cityBn || 'জেলা পরিবর্তন'}</span>
                </button>
              </div>

              {/* Temperature */}
              <div className="flex items-baseline gap-1 mt-3">
                <span className="text-6xl sm:text-7xl font-black tracking-tighter text-white drop-shadow-lg">
                  {toBengaliNumber(weather?.currentTemp ?? 29)}
                </span>
                <span className="text-3xl sm:text-4xl font-bold text-rose-300">°C</span>
              </div>

              {/* Condition Title */}
              <p className="text-lg sm:text-xl font-bold text-white mt-1 drop-shadow-md">
                {weather?.conditionBn || 'রোদ ঝলমলে আকাশ'}
              </p>
              <p className="text-xs text-white/75 mt-0.5 font-medium">
                {isBn
                  ? `অনুভূত হচ্ছে ${toBengaliNumber(weather?.apparentTemp ?? 31)}°C • সর্বোচ্চ ${toBengaliNumber(weather?.daily[0]?.tempMax ?? 33)}° / সর্বনিম্ন ${toBengaliNumber(weather?.daily[0]?.tempMin ?? 23)}°`
                  : `Feels like ${weather?.apparentTemp ?? 31}°C • High ${weather?.daily[0]?.tempMax ?? 33}° / Low ${weather?.daily[0]?.tempMin ?? 23}°`}
              </p>
            </div>

            {/* Weather Condition Icon with Gentle Motion */}
            <div className="relative flex items-center justify-center p-3">
              {currentCondition === 'sun' ? (
                <div className="relative flex items-center justify-center">
                  <div className="absolute w-24 h-24 rounded-full bg-amber-400/30 blur-xl animate-pulse" />
                  <Sun className="w-20 h-20 text-amber-300 animate-[spinSlow_20s_linear_infinite] drop-shadow-lg" />
                </div>
              ) : currentCondition === 'rain' ? (
                <div className="relative flex items-center justify-center">
                  <div className="absolute w-24 h-24 rounded-full bg-sky-400/30 blur-xl" />
                  <CloudRain className="w-20 h-20 text-sky-200 animate-bounce [animation-duration:3s] drop-shadow-lg" />
                </div>
              ) : currentCondition === 'thunder' ? (
                <div className="relative flex items-center justify-center">
                  <div className="absolute w-24 h-24 rounded-full bg-purple-400/30 blur-xl animate-pulse" />
                  <CloudLightning className="w-20 h-20 text-yellow-300 animate-pulse drop-shadow-lg" />
                </div>
              ) : (
                <div className="relative flex items-center justify-center">
                  <div className="absolute w-24 h-24 rounded-full bg-white/20 blur-xl" />
                  <Cloud className="w-20 h-20 text-sky-100 animate-pulse drop-shadow-lg" />
                </div>
              )}
            </div>
          </div>

          {/* Key Metrics Grid (4 items) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-5 pt-4 border-t border-white/15">
            <div className="p-2.5 rounded-2xl bg-black/20 backdrop-blur-md border border-white/10 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center shrink-0">
                <Droplets className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-white/70 font-semibold">{isBn ? 'বাতাসে আর্দ্রতা' : 'Humidity'}</p>
                <p className="text-xs font-bold text-white">{toBengaliNumber(weather?.humidity ?? 68)}%</p>
              </div>
            </div>

            <div className="p-2.5 rounded-2xl bg-black/20 backdrop-blur-md border border-white/10 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-300 flex items-center justify-center shrink-0">
                <Wind className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-white/70 font-semibold">{isBn ? 'বাতাসের গতি' : 'Wind Speed'}</p>
                <p className="text-xs font-bold text-white">{toBengaliNumber(weather?.windSpeed ?? 11)} কিমি/ঘণ্টা</p>
              </div>
            </div>

            <div className="p-2.5 rounded-2xl bg-black/20 backdrop-blur-md border border-white/10 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center shrink-0">
                <Umbrella className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-white/70 font-semibold">{isBn ? 'বৃষ্টির সম্ভাবনা' : 'Rain Chance'}</p>
                <p className="text-xs font-bold text-white">{toBengaliNumber(weather?.rainProbability ?? 15)}%</p>
              </div>
            </div>

            <div className="p-2.5 rounded-2xl bg-black/20 backdrop-blur-md border border-white/10 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0">
                <Sunrise className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-white/70 font-semibold">{isBn ? 'সূর্যোদয় / সূর্যাস্ত' : 'Sun Times'}</p>
                <p className="text-[11px] font-bold text-white">{weather?.daily[0]?.sunrise || '০৫:৫৬'} • {weather?.daily[0]?.sunset || '১৭:২৩'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action: Weather Notification Broadcast - STRICTLY ADMIN CONTROLLED */}
        <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500 to-orange-500 flex items-center justify-center text-white shrink-0 shadow-md">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-bold text-white">{isBn ? 'স্বয়ংক্রিয় আবহাওয়া বুলেটিন' : 'Automated Weather Alerts'}</p>
                {isAdmin ? (
                  <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 border border-emerald-400/30">
                    {isBn ? 'অ্যাডমিন নিয়ন্ত্রণ' : 'Admin Control'}
                  </span>
                ) : (
                  <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-white/10 text-white/80">
                    {isBn ? 'অটো বার্তা সক্রিয়' : 'Auto Alert Active'}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-white/70 font-normal">
                {isAdmin
                  ? (isBn ? 'দিনে ৫-৬ বার ও প্রাকৃতিক দুর্যোগে স্বয়ংক্রিয় বার্তা যায়। আপনি এখনই ম্যানুয়াল বার্তা পাঠাতে পারেন।' : 'Auto updates sent 5-6 times daily & during severe weather. Admin can broadcast manually.')
                  : (isBn ? 'প্রতিদিন ৫-৬ বার এবং ঝড়-বৃষ্টিতে সিস্টেম স্বয়ংক্রিয়ভাবে নোটিফিকেশনে আবহাওয়া বার্তা পাঠায়।' : 'The system automatically broadcasts updates 5-6 times daily and during severe weather.')}
              </p>
            </div>
          </div>

          {isAdmin && (
            <button
              onClick={handleBroadcastWeatherBulletin}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 text-white font-bold text-xs shadow-md active:scale-95 transition-all shrink-0 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <BellRing className="w-3.5 h-3.5" />
              <span>{isBn ? 'সকলকে আবহাওয়া বার্তা পাঠান' : 'Broadcast to App Now'}</span>
            </button>
          )}
        </div>

        {/* Cable & Weather Advisory Banner */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-rose-500/20 backdrop-blur-md border border-amber-400/30 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />
          <div className="text-xs">
            <h4 className="font-bold text-amber-200">
              {isBn ? 'ক্যাবল নেটওয়ার্ক ও গ্রাহক সতর্কতা' : 'Service Notice'}
            </h4>
            <p className="text-white/80 mt-0.5 leading-relaxed font-medium">
              {currentCondition === 'rain' || currentCondition === 'thunder'
                ? (isBn 
                    ? 'বজ্রঝড় ও ভারী বৃষ্টির সময় টিভির ডিস লাইন ও বৈদ্যুতিক প্লাগ নিরাপদে খুলে রাখুন। কোনো লাইনের সমস্যা হলে আমাদের হেল্পলাইনে যোগাযোগ করুন।'
                    : 'During thunderstorms, please disconnect cable cords and delicate electronics safely.')
                : (isBn 
                    ? 'আজ ক্যাবল টিভি ও ইন্টারনেট সংযোগে চমৎকার সিগন্যাল রয়েছে। নিরবচ্ছিন্ন বিনোদন উপভোগ করুন।'
                    : 'Clear weather conditions. Optical & cable signals are running at optimal quality.')}
            </p>
          </div>
        </div>

        {/* 7-Day Forecast Section Header */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-rose-300" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                {isBn ? '৭ দিনের আবহাওয়া পূর্বাভাস' : '7-Day Forecast'}
              </h3>
            </div>
            <span className="text-xs text-white/60 font-semibold">
              {isBn ? 'প্রতিদিনের বিবরণ' : 'Daily details'}
            </span>
          </div>

          {/* 7-Day Cards List */}
          <div className="space-y-2">
            {weather?.daily.map((day, idx) => {
              const isSelected = selectedDayIndex === idx;
              return (
                <div
                  key={day.date}
                  onClick={() => {
                    sounds.playTap();
                    setSelectedDayIndex(idx);
                  }}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-white/20 border-white/40 shadow-lg scale-[1.01]'
                      : 'bg-black/25 hover:bg-black/35 border-white/10'
                  }`}
                >
                  {/* Day & Date */}
                  <div className="flex items-center gap-3 min-w-[110px]">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                      {day.conditionType === 'sun' ? (
                        <Sun className="w-5 h-5 text-amber-300" />
                      ) : day.conditionType === 'rain' ? (
                        <CloudRain className="w-5 h-5 text-sky-300" />
                      ) : day.conditionType === 'thunder' ? (
                        <CloudLightning className="w-5 h-5 text-yellow-300" />
                      ) : (
                        <Cloud className="w-5 h-5 text-slate-200" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white leading-tight">
                        {isBn ? day.dayNameBn : day.dayNameEn}
                      </p>
                      <p className="text-[11px] text-white/65 mt-0.5">
                        {day.conditionBn}
                      </p>
                    </div>
                  </div>

                  {/* Rain Probability Pill */}
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-sky-500/20 border border-sky-400/30 text-[11px] font-bold text-sky-200">
                    <Droplets className="w-3 h-3 text-sky-300" />
                    <span>{toBengaliNumber(day.precipitationProb)}%</span>
                  </div>

                  {/* Temperature Bar */}
                  <div className="flex items-center gap-2 text-right">
                    <div className="text-xs">
                      <span className="font-extrabold text-white text-sm">
                        {toBengaliNumber(day.tempMax)}°
                      </span>
                      <span className="text-white/50 ml-1 text-xs font-semibold">
                        / {toBengaliNumber(day.tempMin)}°
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Day Expanded Detail Card */}
        {activeDay && (
          <div className="p-4 rounded-3xl bg-black/40 backdrop-blur-md border border-white/15 mt-3 space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-white/10 text-xs">
              <span className="font-bold text-rose-300">
                {isBn ? `${activeDay.dayNameBn} বিস্তারিত` : `${activeDay.dayNameEn} Details`}
              </span>
              <span className="text-white/60 font-mono text-[11px]">
                {activeDay.date}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center pt-1 text-xs">
              <div className="p-2 rounded-xl bg-white/5">
                <span className="text-[10px] text-white/60 block">{isBn ? 'সর্বোচ্চ তাপমাত্রা' : 'Max Temp'}</span>
                <span className="font-bold text-amber-300 text-sm">{toBengaliNumber(activeDay.tempMax)}°C</span>
              </div>
              <div className="p-2 rounded-xl bg-white/5">
                <span className="text-[10px] text-white/60 block">{isBn ? 'বৃষ্টির পরিমাণ' : 'Rain Sum'}</span>
                <span className="font-bold text-sky-300 text-sm">{toBengaliNumber(activeDay.precipitationSum)} মিমি</span>
              </div>
              <div className="p-2 rounded-xl bg-white/5">
                <span className="text-[10px] text-white/60 block">{isBn ? 'সূর্যাস্তের সময়' : 'Sunset'}</span>
                <span className="font-bold text-rose-200 text-sm">{activeDay.sunset}</span>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* 64 Districts Picker Modal */}
      {isDistrictPickerOpen && (
        <div className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm flex flex-col justify-end sm:justify-center items-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-rose-500" />
                <div>
                  <h3 className="text-sm font-bold text-white">{isBn ? 'বাংলাদেশের জেলা নির্বাচন করুন' : 'Select District'}</h3>
                  <p className="text-[11px] text-slate-400">{isBn ? '৬৪ জেলার রিয়েল-টাইম আবহাওয়া ও পূর্বাভাস' : '64 Districts of Bangladesh'}</p>
                </div>
              </div>
              <button
                onClick={() => setIsDistrictPickerOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Auto-detect button */}
            <div className="p-3 bg-slate-800/50 border-b border-slate-800 flex gap-2">
              <button
                onClick={handleAutoDetect}
                className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <Navigation className="w-4 h-4" />
                <span>{isBn ? 'আমার বর্তমান লোকেশন অটো সনাক্ত করুন (IP/GPS)' : 'Auto Detect My Location'}</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="px-4 pt-3 pb-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder={isBn ? 'জেলার নাম দিয়ে খুঁজুন (যেমন: বগুড়া, রাজশাহী, ঢাকা)...' : 'Search district...'}
                  value={districtSearch}
                  onChange={(e) => setDistrictSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            {/* Division Filter Pills */}
            <div className="px-4 py-1.5 flex gap-1.5 overflow-x-auto scrollbar-none text-xs">
              {divisions.map(div => (
                <button
                  key={div}
                  onClick={() => setSelectedDivision(div)}
                  className={`px-3 py-1 rounded-full whitespace-nowrap font-bold text-[11px] transition-all ${
                    selectedDivision === div
                      ? 'bg-rose-600 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {div}
                </button>
              ))}
            </div>

            {/* Districts Grid */}
            <div className="p-4 overflow-y-auto flex-1 grid grid-cols-2 sm:grid-cols-3 gap-2">
              {filteredDistricts.map(d => {
                const isCurrent = weather?.cityBn === d.nameBn;
                return (
                  <button
                    key={d.nameEn}
                    onClick={() => handleSelectDistrict(d)}
                    className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all active:scale-95 cursor-pointer ${
                      isCurrent
                        ? 'bg-rose-500/20 border-rose-500 text-white font-bold'
                        : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700/60 text-slate-200'
                    }`}
                  >
                    <div>
                      <p className="text-xs font-bold">{d.nameBn}</p>
                      <p className="text-[10px] text-slate-400">{d.nameEn} • {d.divisionBn}</p>
                    </div>
                    {isCurrent && <Check className="w-4 h-4 text-rose-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
