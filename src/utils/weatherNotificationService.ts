import { NotificationItem, Language } from '../types';
import { WeatherData } from './weatherService';
import { toBengaliNumber } from './formatters';

/**
 * 6 Time slots for daily scheduled weather broadcasts
 */
export interface WeatherSlotConfig {
  id: 'morning_dawn' | 'mid_morning' | 'noon' | 'afternoon' | 'evening' | 'night';
  startHour: number;
  endHour: number;
  nameBn: string;
  nameEn: string;
  badgeBn: string;
  badgeEn: string;
}

export const WEATHER_DAILY_SLOTS: WeatherSlotConfig[] = [
  {
    id: 'morning_dawn',
    startHour: 5,
    endHour: 8,
    nameBn: 'ভোরের আবহাওয়া বার্তা',
    nameEn: 'Dawn Weather Bulletin',
    badgeBn: 'সকাল বার্তা',
    badgeEn: 'Morning'
  },
  {
    id: 'mid_morning',
    startHour: 9,
    endHour: 11,
    nameBn: 'সকালের আবহাওয়া আপডেট',
    nameEn: 'Mid-Morning Weather Update',
    badgeBn: 'সকাল আপডেট',
    badgeEn: 'Update'
  },
  {
    id: 'noon',
    startHour: 12,
    endHour: 15,
    nameBn: 'দুপুরের আবহাওয়া ও তাপদাহ বুলেটিন',
    nameEn: 'Noon Weather & Heat Bulletin',
    badgeBn: 'দুপুর বুলেটিন',
    badgeEn: 'Noon'
  },
  {
    id: 'afternoon',
    startHour: 15,
    endHour: 18,
    nameBn: 'বিকালের আবহাওয়া আপডেট',
    nameEn: 'Afternoon Weather Update',
    badgeBn: 'বিকাল বুলেটিন',
    badgeEn: 'Afternoon'
  },
  {
    id: 'evening',
    startHour: 18,
    endHour: 21,
    nameBn: 'সন্ধ্যার আবহাওয়া বুলেটিন',
    nameEn: 'Evening Weather Bulletin',
    badgeBn: 'সন্ধ্যা বুলেটিন',
    badgeEn: 'Evening'
  },
  {
    id: 'night',
    startHour: 21,
    endHour: 24,
    nameBn: 'রাতের আবহাওয়া ও আগামীকালের পূর্বাভাস',
    nameEn: 'Night Weather & Tomorrow Preview',
    badgeBn: 'রাতের বার্তা',
    badgeEn: 'Night'
  }
];

export function getCurrentSlot(hour: number): WeatherSlotConfig {
  const slot = WEATHER_DAILY_SLOTS.find(s => hour >= s.startHour && hour < s.endHour);
  return slot || WEATHER_DAILY_SLOTS[0];
}

/**
 * Generate beautifully formatted Bengali weather notifications
 */
export function buildWeatherNotification(
  weather: WeatherData,
  slot: WeatherSlotConfig,
  isAlert = false
): NotificationItem {
  const now = new Date();
  const timeFormatted = now.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit', hour12: true });
  const dateFormatted = `${toBengaliNumber(now.getDate())} ${now.toLocaleString('bn-BD', { month: 'short' })}`;

  const tempBn = `${toBengaliNumber(weather.currentTemp)}°C`;
  const highBn = `${toBengaliNumber(weather.daily[0]?.tempMax ?? weather.currentTemp + 3)}°C`;
  const lowBn = `${toBengaliNumber(weather.daily[0]?.tempMin ?? weather.currentTemp - 4)}°C`;
  const humidityBn = `${toBengaliNumber(weather.humidity)}%`;
  const windBn = `${toBengaliNumber(weather.windSpeed)} কিমি/ঘণ্টা`;
  const rainProbBn = `${toBengaliNumber(weather.rainProbability)}%`;

  if (isAlert) {
    const isThunder = weather.conditionType === 'thunder';
    const alertBodyBn = `এলাকা: ${weather.cityBn} | অবস্থা: ${weather.conditionBn}। বর্তমান তাপমাত্রা: ${tempBn}, বাতাসের গতি: ${windBn}, বৃষ্টির সম্ভাবনা: ${rainProbBn}। ক্যাবল নেটওয়ার্ক সতর্কতা: অপটিক্যাল ফাইবার ড্রপ ও বৈদ্যুতিক নোড সুরক্ষিত রাখুন এবং ঝড়ে সংযোগ বিচ্ছিন্ন এড়াতে কর্মীদের সতর্ক করুন।`;
    const alertBodyEn = `Location: ${weather.cityEn} | Condition: ${weather.conditionEn}. Temp: ${weather.currentTemp}°C, Wind: ${weather.windSpeed} km/h, Rain: ${weather.rainProbability}%. Cable network advisory: Protect optical nodes and overhead wire connections during stormy conditions.`;
    return {
      id: `weather-alert-${Date.now()}`,
      titleBn: isThunder 
        ? `⚡ জরুরি আবহাওয়া সতর্কতা: ${weather.cityBn}-তে বজ্রঝড়ের সম্ভাবনা!`
        : `🌧️ আবহাওয়া সতর্কবার্তা: ${weather.cityBn}-তে ভারী বৃষ্টিপাতের সম্ভাবনা!`,
      titleEn: isThunder 
        ? `⚡ Severe Weather Alert: Thunderstorm expected in ${weather.cityEn}!`
        : `🌧️ Weather Advisory: Heavy rain expected in ${weather.cityEn}!`,
      bodyBn: alertBodyBn,
      bodyEn: alertBodyEn,
      messageBn: alertBodyBn,
      messageEn: alertBodyEn,
      date: dateFormatted,
      timeBn: `${dateFormatted}, ${toBengaliNumber(timeFormatted)}`,
      timeEn: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
      type: 'alert',
      isRead: false
    };
  }

  // Regular scheduled daily broadcast
  let adviceBn = 'স্বাভাবিক আবহাওয়া বজায় থাকবে। নিয়মিত কাজের জন্য আবহাওয়া অনুকূল।';
  if (weather.conditionType === 'rain') {
    adviceBn = 'বৃষ্টিপাতের কারণে বাইরে চলাচルの সময় ছাতা সাথে রাখুন। ক্যাবল ওয়ার্কিংয়ে সতর্কতা জরুরি।';
  } else if (weather.conditionType === 'sun' && weather.currentTemp >= 33) {
    adviceBn = 'তীব্র রোদের কারণে প্রচুর পানি পান করুন ও রোদ থেকে সুরক্ষিত থাকুন।';
  } else if (weather.conditionType === 'cloud') {
    adviceBn = 'মেঘলা আকাশের কারণে মনোরম পরিবেশ থাকবে। ক্যাবল লাইনের মেরামত সম্পন্ন করার উত্তম সময়।';
  }

  const broadcastBodyBn = `【${weather.cityBn} আবহাওয়া বুলেটিন】\n• আকাশ: ${weather.conditionBn}\n• বর্তমান তাপমাত্রা: ${tempBn} (সর্বোচ্চ: ${highBn} / সর্বনিম্ন: ${lowBn})\n• বাতাসের বেগ: ${windBn} | আর্দ্রতা: ${humidityBn}\n• বৃষ্টির সম্ভাবনা: ${rainProbBn}\n\nপরামর্শ: ${adviceBn}`;
  const broadcastBodyEn = `【${weather.cityEn} Weather Bulletin】\nCondition: ${weather.conditionEn} | Temp: ${weather.currentTemp}°C (H: ${weather.daily[0]?.tempMax}°C / L: ${weather.daily[0]?.tempMin}°C) | Wind: ${weather.windSpeed} km/h | Humidity: ${weather.humidity}%.`;

  return {
    id: `weather-slot-${slot.id}-${now.toISOString().split('T')[0]}`,
    titleBn: `🌤️ ${slot.nameBn}: ${weather.cityBn} (${tempBn})`,
    titleEn: `🌤️ ${slot.nameEn}: ${weather.cityEn} (${weather.currentTemp}°C)`,
    bodyBn: broadcastBodyBn,
    bodyEn: broadcastBodyEn,
    messageBn: broadcastBodyBn,
    messageEn: broadcastBodyEn,
    date: dateFormatted,
    timeBn: `${dateFormatted}, ${toBengaliNumber(timeFormatted)}`,
    timeEn: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
    type: 'weather',
    isRead: false
  };
}

/**
 * Check and generate automated daily weather notifications without spamming
 */
export function checkAndGenerateWeatherNotifications(
  weather: WeatherData,
  currentNotifications: NotificationItem[]
): { updatedNotifications: NotificationItem[]; newlyAdded: NotificationItem | null } {
  const now = new Date();
  const currentHour = now.getHours();
  const todayStr = now.toISOString().split('T')[0];
  const slot = getCurrentSlot(currentHour);
  const citySlug = (weather.cityEn || 'dhaka').toLowerCase().replace(/[^a-z0-9]/g, '_');

  const slotKey = `notif_slot_${slot.id}_${citySlug}_${todayStr}`;
  const alertKey = `notif_alert_${citySlug}_${todayStr}_${Math.floor(currentHour / 3)}`; // max 1 alert per 3 hours per city

  // 1. Check if severe storm/rain alert is needed
  const isSevereWeather = weather.conditionType === 'thunder' || 
    (weather.conditionType === 'rain' && weather.rainProbability >= 65) ||
    (weather.windSpeed >= 28);

  const alreadySentAlert = localStorage.getItem(alertKey);

  if (isSevereWeather && !alreadySentAlert) {
    const alertNotif = buildWeatherNotification(weather, slot, true);
    localStorage.setItem(alertKey, '1');
    return {
      updatedNotifications: [alertNotif, ...currentNotifications],
      newlyAdded: alertNotif
    };
  }

  // 2. Check regular daily slot notifications per city
  const alreadySentSlot = localStorage.getItem(slotKey);
  const expectedId = `weather-slot-${slot.id}-${citySlug}-${todayStr}`;
  const existsInList = currentNotifications.some(n => n.id === expectedId);

  if (!alreadySentSlot && !existsInList) {
    const slotNotif = buildWeatherNotification(weather, slot, false);
    // Ensure the ID contains the citySlug
    slotNotif.id = expectedId;
    localStorage.setItem(slotKey, '1');
    return {
      updatedNotifications: [slotNotif, ...currentNotifications],
      newlyAdded: slotNotif
    };
  }

  return {
    updatedNotifications: currentNotifications,
    newlyAdded: null
  };
}
