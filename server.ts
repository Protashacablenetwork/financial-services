import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, 'server_data.json');

// Initialize Cloud Firestore on Server
const firebaseConfigPath = path.join(__dirname, 'firebase-applet-config.json');
let db: any = null;
if (fs.existsSync(firebaseConfigPath)) {
  try {
    const firebaseConfig = JSON.parse(fs.readFileSync(firebaseConfigPath, 'utf-8'));
    const firebaseApp = initializeApp(firebaseConfig, 'protasha-server-app');
    db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);
    console.log('[Server] Cloud Firestore connected database:', firebaseConfig.firestoreDatabaseId);
  } catch (err) {
    console.error('[Server] Failed to initialize Cloud Firestore:', err);
  }
}

interface AppUser {
  id: string;
  name: string;
  phone: string;
  avatarUrl?: string;
  pin: string;
  role: 'admin' | 'user';
  createdAt: string;
  status: 'active' | 'suspended';
}

interface ServerData {
  transactions?: any[];
  channels?: any[];
  adminProfile?: {
    name: string;
    phone: string;
    avatarUrl: string;
  };
  notifications?: any[];
  users?: AppUser[];
  footerConfig?: any;
  banners?: any[];
  auditLogs?: any[];
}

const DEFAULT_USERS: AppUser[] = [
  {
    id: 'admin-primary',
    name: 'প্রত্যাশা অ্যাডমিন',
    phone: '01777877207',
    avatarUrl: '',
    pin: '12588',
    role: 'admin',
    createdAt: new Date().toISOString(),
    status: 'active'
  },
  {
    id: 'user-demo-1',
    name: 'মো: রফিকুল ইসলাম',
    phone: '01884542812',
    avatarUrl: '',
    pin: '1234',
    role: 'user',
    createdAt: new Date().toISOString(),
    status: 'active'
  }
];

const DEFAULT_BROADBAND_BANNERS = [
  {
    id: 'banner-broadband-1',
    titleBn: 'সুপারফাস্ট ফাইবার অপটিক ইন্টারনেট সংযোগ',
    titleEn: 'Superfast Optical Fiber Broadband Internet',
    subtitleBn: 'বাফারিংহীন ইউটিউব, ফেসবুক ও ৪K আল্ট্রা এইচডি ভিডিও স্ট্রিমিং',
    subtitleEn: 'Bufferless YouTube, Facebook and 4K Ultra HD video streaming',
    badgeBn: '৫০ Mbps প্যাকেজ',
    badgeEn: '50 Mbps Package',
    imageUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1000&q=80',
    linkUrl: '#offer',
    isActive: true,
    priority: 1
  },
  {
    id: 'banner-broadband-2',
    titleBn: 'নতুন সংযোগে ফ্রি ডুয়াল-ব্যান্ড গিগাবিট রাউটার!',
    titleEn: 'Free Dual-Band Gigabit Router on New Connection!',
    subtitleBn: 'বিনা খরচে অপটিক্যাল ফাইবার ওয়্যারিং ও ইনস্টলেশন সুবিধা',
    subtitleEn: 'Free optical fiber line setup and home installation',
    badgeBn: 'ফ্রি রাউটার অফার',
    badgeEn: 'Free Router Offer',
    imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1000&q=80',
    linkUrl: '#offer',
    isActive: true,
    priority: 2
  },
  {
    id: 'banner-broadband-3',
    titleBn: 'ফ্রিল্যান্সিং ও অনলাইন গেমিংয়ে জিরো ল্যাগ পিং',
    titleEn: 'Dedicated Low-Latency Bandwidth for Gamers & Freelancers',
    subtitleBn: 'ডেডিকেটেড রিয়েল আইপি ও নিরবচ্ছিন্ন আল্ট্রা ফাস্ট আপলোড স্পিড',
    subtitleEn: 'Dedicated real IP with ultra-fast upload speed and zero latency',
    badgeBn: 'গেমিং ও ফ্রিল্যান্সিং',
    badgeEn: 'Gaming & Work',
    imageUrl: 'https://images.unsplash.com/photo-1520869562399-e772f142f422?auto=format&fit=crop&w=1000&q=80',
    linkUrl: '#portal:bill-manager',
    isActive: true,
    priority: 3
  },
  {
    id: 'banner-broadband-4',
    titleBn: 'আনলিমিটেড হোম ও কর্পোরেট ব্রডব্যান্ড ওয়াইফাই',
    titleEn: 'Unlimited Home & Office Broadband Wi-Fi',
    subtitleBn: 'কোনো ফেয়ার ইউসেজ লিমিট (FUP) নেই, ১০০% আনলিমিটেড ব্যবহার',
    subtitleEn: 'No FUP or data caps, 100% truly unlimited high-speed browsing',
    badgeBn: '১০০% আনলিমিটেড',
    badgeEn: '100% Unlimited',
    imageUrl: 'https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?auto=format&fit=crop&w=1000&q=80',
    linkUrl: '#store',
    isActive: true,
    priority: 4
  },
  {
    id: 'banner-broadband-5',
    titleBn: '২৪/৭ সার্বক্ষণিক টেকনিক্যাল সাপোর্ট ও দ্রুত সেবা',
    titleEn: '24/7 Dedicated Technical Support & Instant Fiber Service',
    subtitleBn: 'ইসলামপুর ও জামালপুর অঞ্চলে যে কোনো সমস্যায় তাৎক্ষণিক সমাধান',
    subtitleEn: 'Instant problem resolution in Islampur & Jamalpur coverage areas',
    badgeBn: '২৪/৭ হেল্পলাইন',
    badgeEn: '24/7 Support',
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1000&q=80',
    linkUrl: 'tel:01777877207',
    isActive: true,
    priority: 5
  },
  {
    id: 'banner-broadband-6',
    titleBn: 'বিকাশ ও নগদে মাসিক ইন্টারনেট বিল পরিশোধে ক্যাশব্যাক',
    titleEn: 'Instant Cashback on Monthly Bill Pay via bKash & Nagad',
    subtitleBn: 'ঘরে বসেই কয়েক সেকেন্ডে নিরাপদ ও দ্রুত ক্যাবল বিল জমা দিন',
    subtitleEn: 'Pay your monthly broadband cable bill instantly from home',
    badgeBn: 'ক্যাশব্যাক অফার',
    badgeEn: 'Cashback Offer',
    imageUrl: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=1000&q=80',
    linkUrl: '#category:bill',
    isActive: true,
    priority: 6
  }
];

let serverDataCache: ServerData | null = null;

// Persistent Cloud Syncing helper
async function syncToCloudFirestore(data: ServerData) {
  if (!db) return;
  try {
    const payload = {
      transactions: data.transactions || [],
      channels: data.channels || [],
      adminProfile: data.adminProfile || null,
      notifications: data.notifications || [],
      users: data.users || [],
      footerConfig: data.footerConfig || null,
      banners: data.banners || [],
      auditLogs: data.auditLogs || []
    };

    // Save full snapshot in settings collection
    await setDoc(doc(db, 'settings', 'server_data'), {
      id: 'server_data',
      data: payload,
      updatedAt: new Date().toISOString()
    });

    // Also individually persist users to /users/{id}
    if (data.users && Array.isArray(data.users)) {
      for (const u of data.users) {
        if (u.id && u.name && u.phone && u.pin) {
          await setDoc(doc(db, 'users', u.id), {
            id: u.id,
            name: u.name,
            phone: u.phone,
            avatarUrl: u.avatarUrl || '',
            pin: u.pin,
            role: u.role || 'user',
            createdAt: u.createdAt || new Date().toISOString(),
            status: u.status || 'active'
          }).catch(() => {});
        }
      }
    }

    // Also individually persist transactions to /transactions/{id}
    if (data.transactions && Array.isArray(data.transactions)) {
      for (const trx of data.transactions) {
        if (trx.id && trx.type && typeof trx.amount === 'number') {
          await setDoc(doc(db, 'transactions', trx.id), {
            id: trx.id,
            type: trx.type,
            amount: trx.amount,
            person: trx.person || 'সাধারণ গ্রাহক',
            date: trx.date || new Date().toISOString(),
            channel: trx.channel || 'নগদ',
            note: trx.note || '',
            trxId: trx.trxId || trx.id,
            method: trx.method || 'cash',
            isDeleted: !!trx.isDeleted,
            category: trx.category || ''
          }).catch(() => {});
        }
      }
    }
    console.log('[Server] Successfully synchronized state with Google Cloud Firestore');
  } catch (cloudErr) {
    console.error('[Server] Cloud Firestore sync warning:', cloudErr);
  }
}

// Load data with Cloud-First precedence
async function loadDataFromCloud(): Promise<ServerData> {
  if (serverDataCache) return serverDataCache;

  // 1. Try reading from Google Cloud Firestore
  if (db) {
    try {
      const snap = await getDoc(doc(db, 'settings', 'server_data'));
      if (snap.exists()) {
        const cloudDoc = snap.data();
        if (cloudDoc && cloudDoc.data) {
          const cloudData: ServerData = cloudDoc.data;
          if (!cloudData.users || cloudData.users.length === 0) {
            cloudData.users = DEFAULT_USERS;
          }
          if (!cloudData.banners || cloudData.banners.length === 0) {
            cloudData.banners = DEFAULT_BROADBAND_BANNERS;
          }
          serverDataCache = cloudData;
          try {
            fs.writeFileSync(DATA_FILE, JSON.stringify(cloudData, null, 2), 'utf-8');
          } catch {}
          console.log('[Server] Loaded persistent cloud data from Firestore successfully.');
          return cloudData;
        }
      }
    } catch (e) {
      console.warn('[Server] Notice reading Cloud Firestore, checking local backup:', e);
    }
  }

  // 2. Fallback to local file backup
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      if (content.trim()) {
        const data: ServerData = JSON.parse(content);
        if (!data.users || data.users.length === 0) data.users = DEFAULT_USERS;
        if (!data.banners || data.banners.length === 0) data.banners = DEFAULT_BROADBAND_BANNERS;
        serverDataCache = data;
        // Prime Cloud Firestore
        syncToCloudFirestore(data);
        return data;
      }
    }
  } catch (e) {
    console.error('Error loading server data, using fallback:', e);
  }

  // 3. Initial defaults
  serverDataCache = { users: DEFAULT_USERS, banners: DEFAULT_BROADBAND_BANNERS };
  syncToCloudFirestore(serverDataCache);
  return serverDataCache;
}

function loadData(): ServerData {
  if (serverDataCache) return serverDataCache;
  // Trigger async cloud load
  loadDataFromCloud().catch(() => {});
  return { users: DEFAULT_USERS, banners: DEFAULT_BROADBAND_BANNERS };
}

function saveData(data: ServerData) {
  try {
    serverDataCache = data;
    const tempFile = DATA_FILE + '.tmp';
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, DATA_FILE);
    console.log(`[Server] Data saved locally to ${DATA_FILE}`);
  } catch (e) {
    console.error('[Server] Error saving local server data:', e);
  }

  // Persist directly to Google Cloud Firestore
  syncToCloudFirestore(data);
}

async function startServer() {
  // Pre-load from Google Cloud Firestore
  await loadDataFromCloud();

  const app = express();
  app.use(express.json({ limit: '50mb' }));

  // Ensure uploads directory exists
  const uploadsDir = path.join(__dirname, 'public', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  app.use('/uploads', express.static(uploadsDir));

  // Image Upload Endpoint (Saves base64 or file data permanently to server disk)
  app.post('/api/upload', (req, res) => {
    try {
      const { image, filename } = req.body;
      if (!image || typeof image !== 'string') {
        return res.status(400).json({ success: false, message: 'No image provided' });
      }

      let buffer: Buffer;
      let ext = '.jpg';

      if (image.startsWith('data:')) {
        const commaIndex = image.indexOf(',');
        if (commaIndex === -1) {
          return res.status(400).json({ success: false, message: 'Invalid data URL' });
        }
        const header = image.substring(0, commaIndex).toLowerCase();
        const rawBase64 = image.substring(commaIndex + 1);
        if (header.includes('png')) ext = '.png';
        else if (header.includes('webp')) ext = '.webp';
        else ext = '.jpg';
        buffer = Buffer.from(rawBase64, 'base64');
      } else {
        buffer = Buffer.from(image, 'base64');
      }

      const uniqueName = `img_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`;
      const filePath = path.join(uploadsDir, uniqueName);
      try {
        fs.writeFileSync(filePath, buffer);
      } catch (writeErr) {
        console.warn('Could not write to local disk, returning dataUrl:', writeErr);
      }

      // Return a short relative server URL (e.g. /uploads/img_xxx.jpg) so data payload remains small and secure
      const shortUrl = `/uploads/${uniqueName}`;
      res.json({ success: true, url: shortUrl, dataUrl: shortUrl });
    } catch (e) {
      console.error('Error saving uploaded image:', e);
      res.status(500).json({ success: false, message: 'Failed to save image' });
    }
  });

  // Secure API Route: Require auth / admin check
  app.get('/api/data', async (req, res) => {
    // Check custom security header or session token to prevent public scraping
    const authHeader = req.headers['x-protasha-auth'] || req.query.auth;
    const data = await loadDataFromCloud();
    
    // Return sanitized public info (only channels & public banners) if unauthorized, or full data if authorized
    const isAuthorized = authHeader === 'protasha_secure_session_token_2026';
    if (!isAuthorized) {
      // Return minimal safe public payload
      return res.json({
        channels: data.channels || [],
        banners: data.banners || DEFAULT_BROADBAND_BANNERS,
        footerConfig: data.footerConfig || null,
        usersCount: (data.users || []).length
      });
    }

    res.json(data);
  });

  app.post('/api/data', async (req, res) => {
    const newData = req.body;
    const current = await loadDataFromCloud();
    
    // Safety check: Don't allow overwriting with an empty body
    if (!newData || Object.keys(newData).length === 0) {
        return res.json({ success: false, message: 'Empty data' });
    }

    // Merge data - specifically handle objects like adminProfile to avoid losing avatars
    const updated = { ...current };
    
    for (const key in newData) {
        if (key === 'adminProfile' && current.adminProfile && newData.adminProfile) {
            const mergedProfile = { ...current.adminProfile, ...newData.adminProfile };
            // Never overwrite a non-empty avatar with an empty string
            if (!newData.adminProfile.avatarUrl && current.adminProfile.avatarUrl) {
              mergedProfile.avatarUrl = current.adminProfile.avatarUrl;
            }
            updated.adminProfile = mergedProfile;
        } else {
            (updated as any)[key] = newData[key];
        }
    }

    saveData(updated);
    res.json({ success: true, data: updated });
  });

  app.get('/api/admin-profile', async (req, res) => {
    const data = await loadDataFromCloud();
    res.json(data.adminProfile || {
      name: 'প্রত্যাশা অ্যাডমিন',
      phone: '01777877207',
      avatarUrl: ''
    });
  });

  app.post('/api/admin-profile', async (req, res) => {
    const { name, phone, avatarUrl } = req.body;
    const data = await loadDataFromCloud();
    data.adminProfile = { name, phone, avatarUrl };
    saveData(data);
    res.json({ success: true, profile: data.adminProfile });
  });

  // User Management & Registration APIs
  app.get('/api/users', async (req, res) => {
    const data = await loadDataFromCloud();
    res.json({ success: true, users: data.users || [] });
  });

  app.post('/api/register', async (req, res) => {
    const { name, phone, avatarUrl, pin } = req.body;
    if (!name || !phone || !pin) {
      return res.status(400).json({ success: false, message: 'নাম, মোবাইল নাম্বার এবং পিন আবশ্যক' });
    }

    const cleanPhone = phone.trim();
    const data = await loadDataFromCloud();
    const users = data.users || [];

    // Check duplicate
    const exists = users.find(u => u.phone.trim() === cleanPhone);
    if (exists) {
      return res.status(400).json({ success: false, message: 'এই মোবাইল নাম্বার দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট রয়েছে' });
    }

    const newUser: AppUser = {
      id: 'usr_' + Date.now(),
      name: name.trim(),
      phone: cleanPhone,
      avatarUrl: avatarUrl || '',
      pin: pin.trim(),
      role: 'user',
      createdAt: new Date().toISOString(),
      status: 'active'
    };

    users.push(newUser);
    data.users = users;
    saveData(data);

    res.json({ success: true, user: newUser });
  });

  app.post('/api/login', async (req, res) => {
    const { identifier, pin } = req.body;
    if (!identifier || !pin) {
      return res.status(400).json({ success: false, message: 'আইডি/মোবাইল নাম্বার ও পিন প্রদান করুন' });
    }

    const cleanId = identifier.trim().toLowerCase();
    const cleanPin = pin.trim();
    const data = await loadDataFromCloud();
    const users = data.users || [];

    // Master Admin PIN Check (12588) or phone 01777877207
    if ((cleanPin === '12588' && (cleanId.includes('admin') || cleanId.includes('01777877207') || cleanId.length === 0)) ||
        (cleanId === '01777877207' && cleanPin === '12588')) {
      const adminProfile = data.adminProfile || { name: 'প্রত্যাশা অ্যাডমিন', phone: '01777877207', avatarUrl: '' };
      return res.json({
        success: true,
        user: {
          id: 'admin-master',
          name: adminProfile.name || 'প্রত্যাশা অ্যাডমিন',
          phone: '01777877207',
          avatarUrl: adminProfile.avatarUrl || '',
          role: 'admin',
          accountType: 'general',
          virtualCardNumber: '9856 0000 2932 9162'
        }
      });
    }

    // Check registered users
    const matched = users.find(u => 
      (u.phone.trim().toLowerCase() === cleanId || u.name.trim().toLowerCase() === cleanId) &&
      u.pin.trim() === cleanPin
    );

    if (matched) {
      if (matched.status === 'suspended') {
        return res.status(403).json({ success: false, message: 'আপনার অ্যাকাউন্টটি সাময়িকভাবে স্থগিত করা হয়েছে। অ্যাডমিনের সাথে যোগাযোগ করুন।' });
      }

      return res.json({
        success: true,
        user: {
          id: matched.id,
          name: matched.name,
          phone: matched.phone,
          avatarUrl: matched.avatarUrl || '',
          role: matched.role || 'user',
          accountType: 'general',
          virtualCardNumber: '9856 ' + matched.phone.slice(-4).padStart(4, '0') + ' 2932 9162'
        }
      });
    }

    return res.status(401).json({ success: false, message: 'ভুল মোবাইল নাম্বার বা পিন! অনুগ্রহ করে পুনরায় চেষ্টা করুন।' });
  });

  // Self Profile Update Endpoint for Registered Members and Admin
  app.put('/api/profile', async (req, res) => {
    try {
      const { id, currentPhone, name, phone, pin, avatarUrl } = req.body;
      const data = await loadDataFromCloud();
      const users: AppUser[] = data.users || [];

      // Find user by id, currentPhone, or fallback to matching phone
      let userIndex = -1;
      if (id) {
        userIndex = users.findIndex(u => u.id === id || (id === 'admin-master' && (u.id === 'admin-primary' || u.role === 'admin')));
      }
      if (userIndex === -1 && currentPhone) {
        userIndex = users.findIndex(u => u.phone.trim() === currentPhone.trim());
      }
      if (userIndex === -1 && phone) {
        userIndex = users.findIndex(u => u.phone.trim() === phone.trim());
      }

      // Check if new phone is taken by another account
      const cleanPhone = phone ? phone.trim() : '';
      if (cleanPhone && userIndex !== -1) {
        const duplicate = users.find((u, idx) => idx !== userIndex && u.phone.trim() === cleanPhone);
        if (duplicate) {
          return res.status(400).json({ success: false, message: 'এই মোবাইল নাম্বার দিয়ে ইতিমধ্যে অন্য একটি অ্যাকাউন্ট রয়েছে' });
        }
      }

      let updatedUser: AppUser;
      if (userIndex !== -1) {
        const u = users[userIndex];
        if (name && name.trim()) u.name = name.trim();
        if (cleanPhone) u.phone = cleanPhone;
        if (pin && pin.trim()) u.pin = pin.trim();
        if (avatarUrl && avatarUrl.trim()) u.avatarUrl = avatarUrl.trim();
        users[userIndex] = u;
        updatedUser = u;
      } else {
        // Fallback: create or update primary admin
        updatedUser = {
          id: id || 'usr_' + Date.now(),
          name: (name && name.trim()) || 'প্রত্যাশা গ্রাহক',
          phone: cleanPhone || '01777877207',
          pin: (pin && pin.trim()) || '1234',
          avatarUrl: avatarUrl || '',
          role: 'user',
          createdAt: new Date().toISOString(),
          status: 'active'
        };
        users.push(updatedUser);
      }

      data.users = users;

      // Sync Admin Profile if updated user is admin or primary admin
      if (updatedUser.role === 'admin' || updatedUser.id === 'admin-primary' || updatedUser.id === 'admin-master' || cleanPhone === '01777877207') {
        if (!data.adminProfile) {
          data.adminProfile = { name: updatedUser.name, phone: updatedUser.phone, avatarUrl: updatedUser.avatarUrl || '' };
        } else {
          data.adminProfile.name = updatedUser.name;
          data.adminProfile.phone = updatedUser.phone;
          if (updatedUser.avatarUrl) data.adminProfile.avatarUrl = updatedUser.avatarUrl;
        }
      }

      saveData(data);
      return res.json({ success: true, user: updatedUser });
    } catch (err) {
      console.error('Error updating profile in server:', err);
      return res.status(500).json({ success: false, message: 'প্রোফাইল আপডেট করতে সমস্যা হয়েছে' });
    }
  });

  app.put('/api/users/:id', async (req, res) => {
    const { id } = req.params;
    const { name, phone, pin, avatarUrl, status, role } = req.body;
    const data = await loadDataFromCloud();
    const users = data.users || [];
    let index = users.findIndex(u => u.id === id || (id === 'admin-master' && (u.id === 'admin-primary' || u.role === 'admin')));

    if (index === -1 && phone) {
      index = users.findIndex(u => u.phone.trim() === phone.trim());
    }

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'ব্যবহারকারী পাওয়া যায়নি' });
    }

    const user = users[index];
    if (name !== undefined && name.trim()) user.name = name.trim();
    if (phone !== undefined && phone.trim()) user.phone = phone.trim();
    if (pin !== undefined && pin.trim()) user.pin = pin.trim();
    if (avatarUrl !== undefined && avatarUrl !== '') user.avatarUrl = avatarUrl;
    if (status !== undefined) user.status = status;
    if (role !== undefined) user.role = role;

    users[index] = user;
    data.users = users;

    // Sync admin profile if this user is admin or primary admin
    if (id === 'admin-primary' || id === 'admin-master' || user.role === 'admin' || user.phone === '01777877207') {
      if (!data.adminProfile) {
        data.adminProfile = { name: user.name, phone: user.phone, avatarUrl: user.avatarUrl || '' };
      } else {
        data.adminProfile.name = user.name;
        data.adminProfile.phone = user.phone;
        if (user.avatarUrl) data.adminProfile.avatarUrl = user.avatarUrl;
      }
    }

    saveData(data);

    res.json({ success: true, user });
  });

  app.delete('/api/users/:id', async (req, res) => {
    const { id } = req.params;
    const data = await loadDataFromCloud();
    let users = data.users || [];
    
    // Prevent deleting primary master admin
    if (id === 'admin-primary') {
      return res.status(400).json({ success: false, message: 'প্রধান অ্যাডমিন অ্যাকাউন্ট ডিলিট করা যাবে না' });
    }

    const beforeLen = users.length;
    users = users.filter(u => u.id !== id);

    if (users.length === beforeLen) {
      return res.status(404).json({ success: false, message: 'ব্যবহারকারী পাওয়া যায়নি' });
    }

    data.users = users;
    saveData(data);

    if (db) {
      deleteDoc(doc(db, 'users', id)).catch(() => {});
    }

    res.json({ success: true, message: 'ব্যবহারকারী সফলভাবে ডিলিট করা হয়েছে' });
  });

  // Vite dev server integration
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });

  app.use(vite.middlewares);

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
