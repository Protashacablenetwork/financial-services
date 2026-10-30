import { toBengaliNumber } from './formatters';
export { toBengaliNumber };

export interface DailyForecast {
  date: string; // YYYY-MM-DD
  dayNameBn: string;
  dayNameEn: string;
  weatherCode: number;
  conditionBn: string;
  conditionEn: string;
  conditionType: 'sun' | 'rain' | 'cloud' | 'thunder';
  tempMax: number;
  tempMin: number;
  precipitationProb: number;
  precipitationSum: number;
  sunrise?: string;
  sunset?: string;
}

export interface WeatherData {
  cityBn: string;
  cityEn: string;
  divisionBn?: string;
  currentTemp: number;
  apparentTemp: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  conditionBn: string;
  conditionEn: string;
  conditionType: 'sun' | 'rain' | 'cloud' | 'thunder';
  isDay: boolean;
  rainProbability: number;
  daily: DailyForecast[];
  lastUpdated: number;
  isAutoDetected?: boolean;
}

export interface DistrictInfo {
  nameBn: string;
  nameEn: string;
  divisionBn: string;
  lat: number;
  lon: number;
}

// All 64 Districts of Bangladesh with exact coordinates & divisions
export const ALL_BANGLADESH_DISTRICTS: DistrictInfo[] = [
  // Dhaka Division
  { nameBn: 'ঢাকা', nameEn: 'Dhaka', divisionBn: 'ঢাকা', lat: 23.8103, lon: 90.4125 },
  { nameBn: 'গাজীপুর', nameEn: 'Gazipur', divisionBn: 'ঢাকা', lat: 23.9999, lon: 90.4203 },
  { nameBn: 'নারায়ণগঞ্জ', nameEn: 'Narayanganj', divisionBn: 'ঢাকা', lat: 23.6238, lon: 90.5000 },
  { nameBn: 'টাঙ্গাইল', nameEn: 'Tangail', divisionBn: 'ঢাকা', lat: 24.2513, lon: 89.9167 },
  { nameBn: 'নরসিংদী', nameEn: 'Narsingdi', divisionBn: 'ঢাকা', lat: 23.9193, lon: 90.7202 },
  { nameBn: 'মুন্সীগঞ্জ', nameEn: 'Munshiganj', divisionBn: 'ঢাকা', lat: 23.5422, lon: 90.5305 },
  { nameBn: 'মানিকগঞ্জ', nameEn: 'Manikganj', divisionBn: 'ঢাকা', lat: 23.8617, lon: 90.0003 },
  { nameBn: 'ফরিদপুর', nameEn: 'Faridpur', divisionBn: 'ঢাকা', lat: 23.6070, lon: 89.8429 },
  { nameBn: 'গোপালগঞ্জ', nameEn: 'Gopalganj', divisionBn: 'ঢাকা', lat: 23.0051, lon: 89.8266 },
  { nameBn: 'মাদারীপুর', nameEn: 'Madaripur', divisionBn: 'ঢাকা', lat: 23.1641, lon: 90.1897 },
  { nameBn: 'রাজবাড়ী', nameEn: 'Rajbari', divisionBn: 'ঢাকা', lat: 23.7574, lon: 89.6445 },
  { nameBn: 'শরীয়তপুর', nameEn: 'Shariatpur', divisionBn: 'ঢাকা', lat: 23.2423, lon: 90.4348 },
  { nameBn: 'কিশোরগঞ্জ', nameEn: 'Kishoreganj', divisionBn: 'ঢাকা', lat: 24.4449, lon: 90.7766 },

  // Chattogram Division
  { nameBn: 'চট্টগ্রাম', nameEn: 'Chattogram', divisionBn: 'চট্টগ্রাম', lat: 22.3569, lon: 91.7832 },
  { nameBn: 'কক্সবাজার', nameEn: 'Cox\'s Bazar', divisionBn: 'চট্টগ্রাম', lat: 21.4272, lon: 92.0058 },
  { nameBn: 'কুমিল্লা', nameEn: 'Cumilla', divisionBn: 'চট্টগ্রাম', lat: 23.4682, lon: 91.1788 },
  { nameBn: 'ফেনী', nameEn: 'Feni', divisionBn: 'চট্টগ্রাম', lat: 23.0186, lon: 91.3966 },
  { nameBn: 'ব্রাহ্মণবাড়িয়া', nameEn: 'Brahmanbaria', divisionBn: 'চট্টগ্রাম', lat: 23.9571, lon: 91.1115 },
  { nameBn: 'নোয়াখালী', nameEn: 'Noakhali', divisionBn: 'চট্টগ্রাম', lat: 22.8696, lon: 91.0998 },
  { nameBn: 'চাঁদপুর', nameEn: 'Chandpur', divisionBn: 'চট্টগ্রাম', lat: 23.2333, lon: 90.6667 },
  { nameBn: 'লক্ষ্মীপুর', nameEn: 'Lakshmipur', divisionBn: 'চট্টগ্রাম', lat: 22.9425, lon: 90.8412 },
  { nameBn: 'রাঙ্গামাটি', nameEn: 'Rangamati', divisionBn: 'চট্টগ্রাম', lat: 22.6533, lon: 92.1753 },
  { nameBn: 'খাগড়াছড়ি', nameEn: 'Khagrachhari', divisionBn: 'চট্টগ্রাম', lat: 23.1193, lon: 91.9847 },
  { nameBn: 'বান্দরবান', nameEn: 'Bandarban', divisionBn: 'চট্টগ্রাম', lat: 22.1953, lon: 92.2184 },

  // Rajshahi Division
  { nameBn: 'রাজশাহী', nameEn: 'Rajshahi', divisionBn: 'রাজশাহী', lat: 24.3745, lon: 88.6042 },
  { nameBn: 'বগুড়া', nameEn: 'Bogura', divisionBn: 'রাজশাহী', lat: 24.8465, lon: 89.3777 },
  { nameBn: 'পাবনা', nameEn: 'Pabna', divisionBn: 'রাজশাহী', lat: 24.0064, lon: 89.2372 },
  { nameBn: 'সিরাজগঞ্জ', nameEn: 'Sirajganj', divisionBn: 'রাজশাহী', lat: 24.4534, lon: 89.7008 },
  { nameBn: 'নওগাঁ', nameEn: 'Naogaon', divisionBn: 'রাজশাহী', lat: 24.7936, lon: 88.9318 },
  { nameBn: 'নাটোর', nameEn: 'Natore', divisionBn: 'রাজশাহী', lat: 24.4206, lon: 89.0003 },
  { nameBn: 'চাঁপাইনবাবগঞ্জ', nameEn: 'Chapainawabganj', divisionBn: 'রাজশাহী', lat: 24.5965, lon: 88.2776 },
  { nameBn: 'জয়পুরহাট', nameEn: 'Joypurhat', divisionBn: 'রাজশাহী', lat: 25.1011, lon: 89.0267 },

  // Khulna Division
  { nameBn: 'খুলনা', nameEn: 'Khulna', divisionBn: 'খুলনা', lat: 22.8456, lon: 89.5403 },
  { nameBn: 'যশোর', nameEn: 'Jashore', divisionBn: 'খুলনা', lat: 23.1664, lon: 89.2081 },
  { nameBn: 'সাতক্ষীরা', nameEn: 'Satkhira', divisionBn: 'খুলনা', lat: 22.7185, lon: 89.0705 },
  { nameBn: 'ঝিনাইদহ', nameEn: 'Jhenaidah', divisionBn: 'খুলনা', lat: 23.5450, lon: 89.1526 },
  { nameBn: 'মাগুরা', nameEn: 'Magura', divisionBn: 'খুলনা', lat: 23.4873, lon: 89.4199 },
  { nameBn: 'নড়াইল', nameEn: 'Narail', divisionBn: 'খুলনা', lat: 23.1725, lon: 89.5127 },
  { nameBn: 'বাগেরহাট', nameEn: 'Bagerhat', divisionBn: 'খুলনা', lat: 22.6516, lon: 89.7859 },
  { nameBn: 'কুষ্টিয়া', nameEn: 'Kushtia', divisionBn: 'খুলনা', lat: 23.9013, lon: 89.1205 },
  { nameBn: 'চুয়াডাঙ্গা', nameEn: 'Chuadanga', divisionBn: 'খুলনা', lat: 23.6402, lon: 88.8418 },
  { nameBn: 'মেহেরপুর', nameEn: 'Meherpur', divisionBn: 'খুলনা', lat: 23.7622, lon: 88.6318 },

  // Barishal Division
  { nameBn: 'বরিশাল', nameEn: 'Barishal', divisionBn: 'বরিশাল', lat: 22.7010, lon: 90.3535 },
  { nameBn: 'ভোলা', nameEn: 'Bhola', divisionBn: 'বরিশাল', lat: 22.6859, lon: 90.6481 },
  { nameBn: 'পটুয়াখালী', nameEn: 'Patuakhali', divisionBn: 'বরিশাল', lat: 22.3596, lon: 90.3299 },
  { nameBn: 'পিরোজপুর', nameEn: 'Pirojpur', divisionBn: 'বরিশাল', lat: 22.5841, lon: 89.9720 },
  { nameBn: 'বরগুনা', nameEn: 'Barguna', divisionBn: 'বরিশাল', lat: 22.0953, lon: 90.0770 },
  { nameBn: 'ঝালকাঠি', nameEn: 'Jhalokathi', divisionBn: 'বরিশাল', lat: 22.6406, lon: 90.1987 },

  // Sylhet Division
  { nameBn: 'সিলেট', nameEn: 'Sylhet', divisionBn: 'সিলেট', lat: 24.8949, lon: 91.8687 },
  { nameBn: 'মৌলভীবাজার', nameEn: 'Moulvibazar', divisionBn: 'সিলেট', lat: 24.4829, lon: 91.7774 },
  { nameBn: 'হবিগঞ্জ', nameEn: 'Habiganj', divisionBn: 'সিলেট', lat: 24.3749, lon: 91.4155 },
  { nameBn: 'সুনামগঞ্জ', nameEn: 'Sunamganj', divisionBn: 'সিলেট', lat: 25.0658, lon: 91.4073 },

  // Rangpur Division
  { nameBn: 'রংপুর', nameEn: 'Rangpur', divisionBn: 'রংপুর', lat: 25.7439, lon: 89.2752 },
  { nameBn: 'দিনাজপুর', nameEn: 'Dinajpur', divisionBn: 'রংপুর', lat: 25.6217, lon: 88.6355 },
  { nameBn: 'গাইবান্ধা', nameEn: 'Gaibandha', divisionBn: 'রংপুর', lat: 25.3288, lon: 89.5408 },
  { nameBn: 'কুড়িগ্রাম', nameEn: 'Kurigram', divisionBn: 'রংপুর', lat: 25.8054, lon: 89.6362 },
  { nameBn: 'লালমনিরহাট', nameEn: 'Lalmonirhat', divisionBn: 'রংপুর', lat: 25.9923, lon: 89.2847 },
  { nameBn: 'নীলফামারী', nameEn: 'Nilphamari', divisionBn: 'রংপুর', lat: 25.9318, lon: 88.8560 },
  { nameBn: 'পঞ্চগড়', nameEn: 'Panchagarh', divisionBn: 'রংপুর', lat: 26.3411, lon: 88.5542 },
  { nameBn: 'ঠাকুরগাঁও', nameEn: 'Thakurgaon', divisionBn: 'রংপুর', lat: 26.0337, lon: 88.4617 },

  // Mymensingh Division
  { nameBn: 'ময়মনসিংহ', nameEn: 'Mymensingh', divisionBn: 'ময়মনসিংহ', lat: 24.7471, lon: 90.4203 },
  { nameBn: 'জামালপুর', nameEn: 'Jamalpur', divisionBn: 'ময়মনসিংহ', lat: 24.9375, lon: 89.9378 },
  { nameBn: 'নেত্রকোণা', nameEn: 'Netrokona', divisionBn: 'ময়মনসিংহ', lat: 24.8709, lon: 90.7279 },
  { nameBn: 'শেরপুর', nameEn: 'Sherpur', divisionBn: 'ময়মনসিংহ', lat: 25.0205, lon: 90.0153 }
];

export function findNearestDistrict(lat: number, lon: number): DistrictInfo {
  let nearest = ALL_BANGLADESH_DISTRICTS[0];
  let minDistance = Number.MAX_VALUE;

  for (const d of ALL_BANGLADESH_DISTRICTS) {
    const dist = Math.sqrt(Math.pow(lat - d.lat, 2) + Math.pow(lon - d.lon, 2));
    if (dist < minDistance) {
      minDistance = dist;
      nearest = d;
    }
  }
  return nearest;
}

export function interpretWeatherCode(code: number): {
  conditionBn: string;
  conditionEn: string;
  conditionType: 'sun' | 'rain' | 'cloud' | 'thunder';
} {
  switch (code) {
    case 0:
      return { conditionBn: 'রোদ ঝলমলে পরিষ্কার আকাশ', conditionEn: 'Clear Sky', conditionType: 'sun' };
    case 1:
      return { conditionBn: 'বেশিরভাগ সময় রোদ', conditionEn: 'Mainly Clear', conditionType: 'sun' };
    case 2:
      return { conditionBn: 'আংশিক মেঘলা আকাশ', conditionEn: 'Partly Cloudy', conditionType: 'cloud' };
    case 3:
      return { conditionBn: 'মেঘলা ও গুমোট আকাশ', conditionEn: 'Overcast', conditionType: 'cloud' };
    case 45:
    case 48:
      return { conditionBn: 'কুয়াশাচ্ছন্ন পরিবেশ', conditionEn: 'Foggy', conditionType: 'cloud' };
    case 51:
    case 53:
    case 55:
      return { conditionBn: 'গুঁড়ি গুঁড়ি বৃষ্টি', conditionEn: 'Drizzle', conditionType: 'rain' };
    case 61:
      return { conditionBn: 'হালকা বৃষ্টিপাত', conditionEn: 'Slight Rain', conditionType: 'rain' };
    case 63:
      return { conditionBn: 'মাঝারি বৃষ্টিপাত', conditionEn: 'Moderate Rain', conditionType: 'rain' };
    case 65:
      return { conditionBn: 'ভারী বৃষ্টিপাত ও দমকা হাওয়া', conditionEn: 'Heavy Rain', conditionType: 'rain' };
    case 80:
    case 81:
    case 82:
      return { conditionBn: 'বৃষ্টির ঝাপটা ও মেঘলা', conditionEn: 'Rain Showers', conditionType: 'rain' };
    case 95:
      return { conditionBn: 'বজ্রসহ তীব্র বৃষ্টিপাত', conditionEn: 'Thunderstorm', conditionType: 'thunder' };
    case 96:
    case 99:
      return { conditionBn: 'বজ্রঝড় ও শিলাবৃষ্টির সতর্কতা', conditionEn: 'Severe Thunderstorm & Hail', conditionType: 'thunder' };
    default:
      if (code >= 70 && code <= 77) {
        return { conditionBn: 'হালকা বৃষ্টি ও শীতল আবহাওয়া', conditionEn: 'Cold Rain / Sleet', conditionType: 'rain' };
      }
      return { conditionBn: 'রোদ ও মেঘের খেলা', conditionEn: 'Fair Weather', conditionType: 'cloud' };
  }
}

const daysBn = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
const daysEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Storage Keys
const PREFERRED_DISTRICT_KEY = 'protyasha_user_weather_district';
const CACHE_KEY = 'protyasha_live_weather_v2';
const CACHE_TIME_KEY = 'protyasha_live_weather_ts_v2';

export function getUserPreferredDistrict(): DistrictInfo | null {
  try {
    const raw = localStorage.getItem(PREFERRED_DISTRICT_KEY);
    if (raw) {
      const match = ALL_BANGLADESH_DISTRICTS.find(d => d.nameBn === raw || d.nameEn.toLowerCase() === raw.toLowerCase());
      if (match) return match;
    }
  } catch {}
  return null;
}

export function setUserPreferredDistrict(nameBn: string) {
  try {
    localStorage.setItem(PREFERRED_DISTRICT_KEY, nameBn);
    localStorage.removeItem(CACHE_KEY); // clear cache to fetch new location immediately
  } catch {}
}

export function clearUserPreferredDistrict() {
  try {
    localStorage.removeItem(PREFERRED_DISTRICT_KEY);
    localStorage.removeItem(CACHE_KEY);
  } catch {}
}

/**
 * Intelligent location detector:
 * 1. User manual preferred district
 * 2. High-precision GPS via navigator.geolocation
 * 3. Free public IP-based Geolocation fallback (ipapi.co / ipwho.is / bigdatacloud)
 */
export async function detectPreciseLocation(): Promise<{
  district: DistrictInfo;
  isAutoDetected: boolean;
}> {
  // 1. Check if user selected preferred district manually
  const preferred = getUserPreferredDistrict();
  if (preferred) {
    return { district: preferred, isAutoDetected: false };
  }

  // 2. High-precision browser GPS
  try {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 5000,
          maximumAge: 60000,
          enableHighAccuracy: true
        });
      });
      if (pos.coords && pos.coords.latitude && pos.coords.longitude) {
        const nearest = findNearestDistrict(pos.coords.latitude, pos.coords.longitude);
        return { district: nearest, isAutoDetected: true };
      }
    }
  } catch {
    // GPS fallback to IP geolocation APIs
  }

  // 3. Multi-endpoint Public IP Geolocation Fallback
  // Provider A: ipwho.is
  try {
    const ipRes = await fetch('https://ipwho.is/?fields=success,latitude,longitude', {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(3000)
    });
    if (ipRes.ok) {
      const ipData = await ipRes.json();
      if (ipData.success && ipData.latitude && ipData.longitude) {
        const nearest = findNearestDistrict(Number(ipData.latitude), Number(ipData.longitude));
        return { district: nearest, isAutoDetected: true };
      }
    }
  } catch {}

  // Provider B: BigDataCloud free client reverse geocode
  try {
    const bdcRes = await fetch('https://api.bigdatacloud.net/data/reverse-geocode-client', {
      signal: AbortSignal.timeout(3000)
    });
    if (bdcRes.ok) {
      const bdcData = await bdcRes.json();
      if (bdcData.latitude && bdcData.longitude) {
        const nearest = findNearestDistrict(Number(bdcData.latitude), Number(bdcData.longitude));
        return { district: nearest, isAutoDetected: true };
      }
    }
  } catch {}

  // Provider C: ipapi.co
  try {
    const ipapiRes = await fetch('https://ipapi.co/json/', {
      signal: AbortSignal.timeout(3000)
    });
    if (ipapiRes.ok) {
      const ipapiData = await ipapiRes.json();
      if (ipapiData.latitude && ipapiData.longitude) {
        const nearest = findNearestDistrict(Number(ipapiData.latitude), Number(ipapiData.longitude));
        return { district: nearest, isAutoDetected: true };
      }
    }
  } catch {}

  // Default to Dhaka if location resolution is unavailable
  return { district: ALL_BANGLADESH_DISTRICTS[0], isAutoDetected: false };
}

/**
 * Fetch real-time weather using Open-Meteo free API
 */
export async function fetchLiveWeather(forceRefresh = false): Promise<WeatherData> {
  // Check memory/local cache (valid for 10 minutes)
  if (!forceRefresh) {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      const cachedTs = localStorage.getItem(CACHE_TIME_KEY);
      if (cached && cachedTs) {
        const age = Date.now() - parseInt(cachedTs, 10);
        if (age < 10 * 60 * 1000) {
          return JSON.parse(cached);
        }
      }
    } catch {}
  }

  // Detect location
  const { district, isAutoDetected } = await detectPreciseLocation();
  const lat = district.lat;
  const lon = district.lon;

  try {
    // Public free Open-Meteo API endpoint
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(4)}&longitude=${lon.toFixed(4)}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,sunrise,sunset&timezone=Asia%2FDhaka`;

    const res = await fetch(url);
    if (!res.ok) throw new Error('Open-Meteo weather API error');
    const data = await res.json();

    const current = data.current || {};
    const daily = data.daily || {};

    const currentWeatherCode = current.weather_code ?? 1;
    const { conditionBn, conditionEn, conditionType } = interpretWeatherCode(currentWeatherCode);

    const dailyForecasts: DailyForecast[] = [];
    const timeArr = daily.time || [];
    const codeArr = daily.weather_code || [];
    const maxTempArr = daily.temperature_2m_max || [];
    const minTempArr = daily.temperature_2m_min || [];
    const precipProbArr = daily.precipitation_probability_max || [];
    const precipSumArr = daily.precipitation_sum || [];
    const sunriseArr = daily.sunrise || [];
    const sunsetArr = daily.sunset || [];

    for (let i = 0; i < Math.min(timeArr.length, 7); i++) {
      const dateStr = timeArr[i];
      const d = new Date(dateStr + 'T00:00:00');
      let dayNameBn = daysBn[d.getDay()];
      let dayNameEn = daysEn[d.getDay()];

      if (i === 0) {
        dayNameBn = 'আজ';
        dayNameEn = 'Today';
      } else if (i === 1) {
        dayNameBn = 'আগামীকাল';
        dayNameEn = 'Tomorrow';
      }

      const wCode = codeArr[i] ?? 1;
      const inter = interpretWeatherCode(wCode);

      let sunriseFormatted = '০৫:৫৬';
      let sunsetFormatted = '১৭:২৩';
      if (sunriseArr[i]) {
        try {
          const srTime = new Date(sunriseArr[i]);
          sunriseFormatted = toBengaliNumber(
            srTime.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit', hour12: false })
          );
        } catch {}
      }
      if (sunsetArr[i]) {
        try {
          const ssTime = new Date(sunsetArr[i]);
          sunsetFormatted = toBengaliNumber(
            ssTime.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit', hour12: false })
          );
        } catch {}
      }

      dailyForecasts.push({
        date: dateStr,
        dayNameBn,
        dayNameEn,
        weatherCode: wCode,
        conditionBn: inter.conditionBn,
        conditionEn: inter.conditionEn,
        conditionType: inter.conditionType,
        tempMax: Math.round(maxTempArr[i] ?? 32),
        tempMin: Math.round(minTempArr[i] ?? 23),
        precipitationProb: Math.round(precipProbArr[i] ?? 10),
        precipitationSum: Number((precipSumArr[i] ?? 0).toFixed(1)),
        sunrise: sunriseFormatted,
        sunset: sunsetFormatted
      });
    }

    const weatherResult: WeatherData = {
      cityBn: district.nameBn,
      cityEn: district.nameEn,
      divisionBn: district.divisionBn,
      currentTemp: Math.round(current.temperature_2m ?? 29),
      apparentTemp: Math.round(current.apparent_temperature ?? 31),
      humidity: Math.round(current.relative_humidity_2m ?? 65),
      windSpeed: Math.round(current.wind_speed_10m ?? 10),
      weatherCode: currentWeatherCode,
      conditionBn,
      conditionEn,
      conditionType,
      isDay: Boolean(current.is_day ?? 1),
      rainProbability: dailyForecasts[0]?.precipitationProb ?? 15,
      daily: dailyForecasts,
      lastUpdated: Date.now(),
      isAutoDetected
    };

    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(weatherResult));
      localStorage.setItem(CACHE_TIME_KEY, String(Date.now()));
    } catch {}

    return weatherResult;
  } catch (err) {
    console.warn('Weather API failed, using district defaults:', err);
    return {
      cityBn: district.nameBn,
      cityEn: district.nameEn,
      divisionBn: district.divisionBn,
      currentTemp: 29,
      apparentTemp: 32,
      humidity: 68,
      windSpeed: 12,
      weatherCode: 1,
      conditionBn: 'রোদ ঝলমলে আকাশ',
      conditionEn: 'Mainly Clear',
      conditionType: 'sun',
      isDay: true,
      rainProbability: 10,
      daily: [
        {
          date: new Date().toISOString().split('T')[0],
          dayNameBn: 'আজ',
          dayNameEn: 'Today',
          weatherCode: 1,
          conditionBn: 'রোদ ঝলমলে আকাশ',
          conditionEn: 'Mainly Clear',
          conditionType: 'sun',
          tempMax: 33,
          tempMin: 23,
          precipitationProb: 15,
          precipitationSum: 0.1,
          sunrise: '০৫:৫৬',
          sunset: '১৭:২৩'
        },
        {
          date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          dayNameBn: 'আগামীকাল',
          dayNameEn: 'Tomorrow',
          weatherCode: 2,
          conditionBn: 'আংশিক মেঘলা',
          conditionEn: 'Partly Cloudy',
          conditionType: 'cloud',
          tempMax: 32,
          tempMin: 24,
          precipitationProb: 25,
          precipitationSum: 0.5,
          sunrise: '০৫:৫৬',
          sunset: '১৭:২৩'
        }
      ],
      lastUpdated: Date.now(),
      isAutoDetected
    };
  }
}
