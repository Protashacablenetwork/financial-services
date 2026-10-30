import React, { useState, useEffect, useRef, useCallback } from 'react';
import { db, auth, handleFirestoreError, OperationType } from './utils/firebase';
import { collection, doc, onSnapshot, setDoc, deleteDoc } from 'firebase/firestore';
import { 
  Language, 
  Transaction, 
  UserSession, 
  FooterConfig, 
  AuditLog, 
  NotificationItem, 
  PaymentChannel, 
  BannerAd,
  AppUser
} from './types';
import confetti from 'canvas-confetti';
import { 
  initialTransactions, 
  initialNotifications, 
  initialFooterConfig,
  initialBanners,
  initialPaymentChannels
} from './data/initialData';
import { sounds } from './utils/audio';
import { savePersistentImage, getPersistentImage, getSyncPersistentImage } from './utils/imageStorage';
import { ArrowLeft, ExternalLink, Trash2 } from 'lucide-react';

// Components
import { Header } from './components/Header';
import { BalanceCard } from './components/BalanceCard';
import { PrimaryFeatureCards } from './components/PrimaryFeatureCards';
import { PromoCarousel } from './components/PromoCarousel';
import { QuickChannels } from './components/QuickChannels';
import { TransactionList } from './components/TransactionList';
import { TransactionDetailPage } from './components/TransactionDetailPage';
import { ReceiptModal } from './components/ReceiptModal';
import { EntryModal } from './components/EntryModal';
import { NotificationsModal } from './components/NotificationsModal';
import { NotificationDetailModal } from './components/NotificationDetailModal';
import { ProfileView } from './components/ProfileView';
import { LoginView } from './components/LoginView';
import { BottomNav, TabId } from './components/BottomNav';
import { RecycleBinModal } from './components/RecycleBinModal';
import { AuditLogModal } from './components/AuditLogModal';
import { FooterSettingsModal } from './components/FooterSettingsModal';
import { ChangePinModal } from './components/ChangePinModal';
import { ReportModal } from './components/ReportModal';
import { BannerManagerModal } from './components/BannerManagerModal';
import { ChannelManagerModal } from './components/ChannelManagerModal';
import { UserManagementModal } from './components/UserManagementModal';
import { WeatherModal } from './components/WeatherModal';
import { fetchLiveWeather, WeatherData } from './utils/weatherService';
import { checkAndGenerateWeatherNotifications } from './utils/weatherNotificationService';

export default function App() {
  // Language
  const [lang, setLang] = useState<Language>(() => {
    return (localStorage.getItem('protyasha_lang') as Language) || 'bn';
  });

  // Theme
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('protyasha_theme') as 'light' | 'dark') || 'light';
  });

  // Active Tab (4 tabs: home, transactions, ledger, profile)
  const [activeTab, setActiveTab] = useState<TabId>('home');

  // User Session: Persistent from localStorage
  const [user, setUser] = useState<UserSession | null>(() => {
    const saved = localStorage.getItem('protyasha_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && (parsed.role === 'admin' || parsed.role === 'user')) {
          return parsed;
        }
      } catch {
        return null;
      }
    }
    return null;
  });

  // Show Login/Register page: If user is not logged in, show Login page by default!
  const [isLoginOpen, setIsLoginOpen] = useState(() => {
    const savedUser = localStorage.getItem('protyasha_user');
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        if (u && (u.role === 'admin' || u.role === 'user')) return false;
      } catch {}
    }
    return true; // Keep user on login page by default when not logged in
  });

  // Guard: If user is logged out (user === null), enforce login view always
  useEffect(() => {
    if (!user && !isLoginOpen) {
      setIsLoginOpen(true);
    }
  }, [user, isLoginOpen]);

  // User Management Modal State
  const [isUserManagementOpen, setIsUserManagementOpen] = useState(false);

  // Dynamic Payment Channels State (Default 5 channels + Admin custom channels)
  const [channels, setChannels] = useState<PaymentChannel[]>(() => {
    const saved = localStorage.getItem('protyasha_channels');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((ch: PaymentChannel) => {
          if (ch.name === 'বিকাশ') return { ...ch, imageUrl: ch.imageUrl || '62f92578037f0.png' };
          if (ch.name === 'রকেট') return { ...ch, imageUrl: ch.imageUrl || 'images২৪২৪.png' };
          if (ch.name === 'নগদ') return { ...ch, imageUrl: ch.imageUrl || '24334.jpg' };
          return ch;
        });
      } catch {
        return initialPaymentChannels;
      }
    }
    return initialPaymentChannels;
  });

  // Transactions State
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('protyasha_transactions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return initialTransactions;
      }
    }
    return initialTransactions;
  });

  // Dynamic Homepage Banners (Admin Controllable, 5-7 ads with Broadband Internet theme)
  const [banners, setBanners] = useState<BannerAd[]>(() => {
    const saved = localStorage.getItem('protyasha_banners');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        return initialBanners;
      } catch {
        return initialBanners;
      }
    }
    return initialBanners;
  });

  // Helper to filter out legacy dummy/demo notifications
  const cleanDemoNotifications = (list: NotificationItem[]): NotificationItem[] => {
    if (!Array.isArray(list)) return [];
    return list.filter(n => {
      const id = n.id || '';
      const titleBn = n.titleBn || '';
      const titleEn = n.titleEn || '';
      if (id === 'notif-1' || id === 'notif-2' || id === 'notif-3' || id.startsWith('demo-')) return false;
      if (titleBn.includes('স্বাগতম') || titleEn.toLowerCase().includes('welcome')) return false;
      if (titleBn.includes('ক্যাশব্যাক ৫০') || titleBn.includes('ডেমো')) return false;
      return true;
    });
  };

  // Notifications State (Sanitized to strictly remove demo notifications)
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('protyasha_notifications');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const cleaned = cleanDemoNotifications(parsed);
        if (cleaned.length !== parsed.length) {
          localStorage.setItem('protyasha_notifications', JSON.stringify(cleaned));
        }
        return cleaned;
      } catch {
        return cleanDemoNotifications(initialNotifications);
      }
    }
    return cleanDemoNotifications(initialNotifications);
  });

  // Per-User Notification Read Tracking
  const userKey = user ? (user.id || user.phone || user.role) : 'visitor';

  const [readNotifIds, setReadNotifIds] = useState<string[]>(() => {
    try {
      const key = `protyasha_read_notifs_${user ? (user.id || user.phone || user.role) : 'visitor'}`;
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      const key = `protyasha_read_notifs_${user ? (user.id || user.phone || user.role) : 'visitor'}`;
      const saved = localStorage.getItem(key);
      setReadNotifIds(saved ? JSON.parse(saved) : []);
    } catch {
      setReadNotifIds([]);
    }
  }, [user?.id, user?.phone, user?.role]);

  const isNotifReadForUser = useCallback((notif: NotificationItem) => {
    if (readNotifIds.includes(notif.id)) return true;
    if (userKey && Array.isArray(notif.readBy) && notif.readBy.includes(userKey)) return true;
    return false;
  }, [readNotifIds, userKey]);

  // Notification Detailed View (Opens when notification is clicked)
  const [selectedNotificationDetail, setSelectedNotificationDetail] = useState<NotificationItem | null>(null);

  // Footer Config
  const [footerConfig, setFooterConfig] = useState<FooterConfig>(() => {
    const saved = localStorage.getItem('protyasha_footer');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return initialFooterConfig;
      }
    }
    return initialFooterConfig;
  });

  // Audit Logs
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('protyasha_audit');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [
      {
        id: 'log-1',
        action: 'System Initialized',
        actionBn: 'সিস্টেম চালু হয়েছে',
        user: 'System',
        details: 'প্রত্যাশা ক্যাবল নেটওয়ার্ক হিসাব খাতা প্রস্তুত',
        time: Date.now() - 3600000
      }
    ];
  });

  const [adminAvatar, setAdminAvatar] = useState<string>(() => {
    const syncImg = getSyncPersistentImage('avatar_admin', 'protyasha_admin_avatar');
    // If it's a broken /uploads/ URL, discard it
    if (syncImg && !syncImg.startsWith('/uploads/')) return syncImg;
    const legacy = localStorage.getItem('protyasha_admin_avatar') || '';
    return legacy && !legacy.startsWith('/uploads/') ? legacy : '';
  });

  // Asynchronously retrieve avatar from IndexedDB on startup
  useEffect(() => {
    getPersistentImage('avatar_admin').then((savedImg) => {
      if (savedImg && savedImg.startsWith('data:image/') && !adminAvatar) {
        setAdminAvatar(savedImg);
      }
    });
  }, []);

  useEffect(() => {
    if (adminAvatar && adminAvatar.startsWith('data:image/')) {
      savePersistentImage('avatar_admin', adminAvatar);
      try {
        localStorage.setItem('protyasha_admin_avatar', adminAvatar);
      } catch (e) {
        console.warn('LocalStorage limit reached for admin avatar:', e);
      }
    }
  }, [adminAvatar]);

  // Initial Data Load from Server on Mount
  useEffect(() => {
    fetch('/api/data', {
      headers: { 'x-protasha-auth': 'protasha_secure_session_token_2026' }
    })
      .then(res => res.json())
      .then(data => {
        if (data.transactions) setTransactions(data.transactions);
        if (data.notifications) setNotifications(cleanDemoNotifications(data.notifications));
        if (data.banners && Array.isArray(data.banners) && data.banners.length > 0) {
          setBanners(data.banners);
        } else {
          setBanners(initialBanners);
        }
        if (data.channels) setChannels(data.channels);
        if (data.footerConfig) setFooterConfig(data.footerConfig);
        if (data.auditLogs) setAuditLogs(data.auditLogs);
        
        if (data.adminProfile) {
          const srvAvatar = data.adminProfile.avatarUrl;
          // Only adopt srvAvatar if it's a valid data URL
          if (srvAvatar && srvAvatar.startsWith('data:image/')) {
            setAdminAvatar(srvAvatar);
            savePersistentImage('avatar_admin', srvAvatar);
            localStorage.setItem('protyasha_admin_avatar', srvAvatar);
          } else if (adminAvatar && adminAvatar.startsWith('data:image/')) {
            // Server was empty or reset, restore server profile using client's permanent avatar
            fetch('/api/data', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ adminProfile: { ...data.adminProfile, avatarUrl: adminAvatar } })
            }).catch(() => {});
          }
          if (user?.role === 'admin') {
            setUser(prev => prev ? { 
              ...prev, 
              name: data.adminProfile.name, 
              avatarUrl: (srvAvatar && srvAvatar.startsWith('data:image/')) ? srvAvatar : (adminAvatar || prev.avatarUrl) 
            } : prev);
          }
        } else if (adminAvatar && adminAvatar.startsWith('data:image/')) {
          // If server has no adminProfile yet, initialize it
          fetch('/api/data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ adminProfile: { name: 'প্রত্যাশা অ্যাডমিন', phone: '01777877207', avatarUrl: adminAvatar } })
          }).catch(() => {});
        }
      })
      .catch(() => {});
  }, []);

  const handleUpdateAdminProfile = (name: string, avatarUrl: string) => {
    setAdminAvatar(avatarUrl);
    if (avatarUrl && avatarUrl.startsWith('data:image/')) {
      savePersistentImage('avatar_admin', avatarUrl);
      localStorage.setItem('protyasha_admin_avatar', avatarUrl);
    }
    if (user?.role === 'admin') {
      const updatedUser = { ...user, name, avatarUrl };
      setUser(updatedUser);
      localStorage.setItem('protyasha_user', JSON.stringify(updatedUser));
    }
    fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminProfile: { name, phone: '01777877207', avatarUrl } })
    }).catch(() => {});
  };

  // Self Profile Update Handler for Registered Members & Admin
  const handleUpdateUserProfile = async (updatedData: {
    name: string;
    phone: string;
    pin?: string;
    avatarUrl?: string;
  }): Promise<{ success: boolean; message?: string }> => {
    if (!user) return { success: false, message: 'অনুগ্রহ করে প্রথমে লগইন করুন' };

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user.id || (user.role === 'admin' ? 'admin-primary' : undefined),
          currentPhone: user.phone,
          name: updatedData.name,
          phone: updatedData.phone,
          pin: updatedData.pin,
          avatarUrl: updatedData.avatarUrl
        })
      });
      const data = await res.json();
      if (!data.success) {
        return { success: false, message: data.message || 'প্রোফাইল আপডেট ব্যর্থ হয়েছে' };
      }

      // Update Active Session User State
      const updatedSession: UserSession = {
        ...user,
        name: updatedData.name,
        phone: updatedData.phone,
        avatarUrl: updatedData.avatarUrl || user.avatarUrl
      };
      setUser(updatedSession);
      localStorage.setItem('protyasha_user', JSON.stringify(updatedSession));
      localStorage.setItem('protyasha_last_phone', updatedData.phone);

      if (updatedData.avatarUrl) {
        localStorage.setItem('protyasha_last_avatar', updatedData.avatarUrl);
        if (user.role === 'admin') {
          setAdminAvatar(updatedData.avatarUrl);
          savePersistentImage('avatar_admin', updatedData.avatarUrl);
          localStorage.setItem('protyasha_admin_avatar', updatedData.avatarUrl);
        } else if (user.id) {
          savePersistentImage(`avatar_user_${user.id}`, updatedData.avatarUrl);
        }
      }

      // Direct Cloud Firestore write
      const targetId = user.id || (user.role === 'admin' ? 'admin-primary' : 'usr_' + Date.now());
      setDoc(doc(db, 'users', targetId), {
        id: targetId,
        name: updatedData.name,
        phone: updatedData.phone,
        ...(updatedData.pin ? { pin: updatedData.pin } : {}),
        ...(updatedData.avatarUrl ? { avatarUrl: updatedData.avatarUrl } : {}),
        role: user.role,
        status: 'active',
        createdAt: new Date().toISOString()
      }, { merge: true }).catch(() => {});

      logAction('Updated Profile', 'প্রোফাইল ও পাসওয়ার্ড পরিবর্তন', `${updatedData.name} (${updatedData.phone})`);
      return { success: true };
    } catch (err: any) {
      console.error('Profile update error:', err);
      return { success: false, message: err.message || 'নেটওয়ার্ক সংযোগে সমস্যা হয়েছে' };
    }
  };

  // Modals & Navigation: selectedTransaction opens full page!
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [receiptTransaction, setReceiptTransaction] = useState<Transaction | null>(null);
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [entryType, setEntryType] = useState<'income' | 'expense'>('income');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [editingNotification, setEditingNotification] = useState<NotificationItem | null>(null);

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isRecycleBinOpen, setIsRecycleBinOpen] = useState(false);
  const [isAuditLogOpen, setIsAuditLogOpen] = useState(false);
  const [isFooterSettingsOpen, setIsFooterSettingsOpen] = useState(false);
  const [isChangePinOpen, setIsChangePinOpen] = useState(false);
  const [isBannerManagerOpen, setIsBannerManagerOpen] = useState(false);
  const [isChannelManagerOpen, setIsChannelManagerOpen] = useState(false);
  const [isWeatherOpen, setIsWeatherOpen] = useState(false);

  // Active External / Sub-Portal (Bill Management Pro & Income-Expense Accounts)
  const [activePortal, setActivePortal] = useState<'bill-manager' | 'ay-byay' | null>(null);

  // Weather data state
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);

  // Method Filter
  const [selectedMethodFilter, setSelectedMethodFilter] = useState<string | null>(null);

  // Delete Transaction Confirmation State
  const [deleteTrx, setDeleteTrx] = useState<Transaction | null>(null);

  // Automated 5-6 Daily Weather Bulletins & Extreme Weather / Storm Alerts
  useEffect(() => {
    let isSubscribed = true;

    const runWeatherMonitoring = async () => {
      try {
        const w = await fetchLiveWeather();
        if (w && isSubscribed) {
          setWeatherData(w);
          setNotifications(prevNotifications => {
            const { updatedNotifications, newlyAdded } = checkAndGenerateWeatherNotifications(w, prevNotifications);
            if (newlyAdded) {
              try {
                localStorage.setItem('protyasha_notifications', JSON.stringify(updatedNotifications));
              } catch (e) {
                console.warn('LocalStorage limit reached for notifications:', e);
              }
              fetch('/api/data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notifications: updatedNotifications })
              }).catch(() => {});

              if (newlyAdded.type === 'alert') {
                sounds.playSuccess();
              }
              return updatedNotifications;
            }
            return prevNotifications;
          });
        }
      } catch (err) {
        console.warn('Weather monitoring background error:', err);
      }
    };

    runWeatherMonitoring();
    // Check every 12 minutes for new scheduled time slots (morning dawn, mid morning, noon, afternoon, evening, night)
    const interval = setInterval(runWeatherMonitoring, 12 * 60 * 1000);
    return () => {
      isSubscribed = false;
      clearInterval(interval);
    };
  }, []);

  // Listen for iframe portal messages (e.g., in-app back button inside portal)
  useEffect(() => {
    const handlePortalMessage = (event: MessageEvent) => {
      if (event.data?.action === 'close_portal') {
        setActivePortal(null);
      }
    };
    window.addEventListener('message', handlePortalMessage);
    return () => window.removeEventListener('message', handlePortalMessage);
  }, []);

  // -------------------------------------------------------------
  // UNIVERSAL DEVICE HARDWARE / BROWSER BACK BUTTON SUPPORT
  // -------------------------------------------------------------
  const isNavigatingBackRef = useRef(false);

  const pushHistoryStep = useCallback(() => {
    if (!isNavigatingBackRef.current) {
      window.history.pushState({ appOverlay: true, time: Date.now() }, '');
    }
  }, []);

  // Initialize browser history on mount
  useEffect(() => {
    window.history.replaceState({ appRoot: true }, '');
  }, []);

  // Popstate Listener: Handlers respond to device back button
  useEffect(() => {
    const handlePopState = () => {
      isNavigatingBackRef.current = true;

      // Close top-most layer first
      if (activePortal) {
        setActivePortal(null);
      } else if (isUserManagementOpen) {
        setIsUserManagementOpen(false);
      } else if (selectedNotificationDetail) {
        setSelectedNotificationDetail(null);
      } else if (receiptTransaction) {
        setReceiptTransaction(null);
      } else if (isEntryModalOpen) {
        setIsEntryModalOpen(false);
        setEditingTransaction(null);
      } else if (isBannerManagerOpen) {
        setIsBannerManagerOpen(false);
      } else if (isChannelManagerOpen) {
        setIsChannelManagerOpen(false);
      } else if (isRecycleBinOpen) {
        setIsRecycleBinOpen(false);
      } else if (isAuditLogOpen) {
        setIsAuditLogOpen(false);
      } else if (isChangePinOpen) {
        setIsChangePinOpen(false);
      } else if (isFooterSettingsOpen) {
        setIsFooterSettingsOpen(false);
      } else if (isWeatherOpen) {
        setIsWeatherOpen(false);
      } else if (isNotificationsOpen) {
        setIsNotificationsOpen(false);
      } else if (isProfileOpen) {
        setIsProfileOpen(false);
      } else if (selectedTransaction) {
        setSelectedTransaction(null);
      } else if (isLoginOpen) {
        // If user is logged out (!user), DO NOT close login view into visitor mode!
        if (user && (user.role === 'admin' || user.role === 'user')) {
          setIsLoginOpen(false);
        } else {
          // Keep user locked on the login page
          window.history.pushState({ screen: 'login' }, '', window.location.pathname);
        }
      } else if (activeTab !== 'home') {
        setActiveTab('home');
      }

      setTimeout(() => {
        isNavigatingBackRef.current = false;
      }, 50);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [
    user,
    activePortal,
    isUserManagementOpen,
    selectedNotificationDetail,
    receiptTransaction,
    isEntryModalOpen,
    isBannerManagerOpen,
    isChannelManagerOpen,
    isRecycleBinOpen,
    isAuditLogOpen,
    isChangePinOpen,
    isFooterSettingsOpen,
    isWeatherOpen,
    isNotificationsOpen,
    isProfileOpen,
    selectedTransaction,
    isLoginOpen,
    activeTab
  ]);

  // Apply Theme & Lang to DOM
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('protyasha_theme', theme);
  }, [theme]);

  useEffect(() => {
    document.body.setAttribute('data-lang', lang);
    localStorage.setItem('protyasha_lang', lang);
  }, [lang]);

  // Real-time Cloud Synchronization with Google Cloud Firestore
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    try {
      unsubscribe = onSnapshot(
        doc(db, 'settings', 'server_data'),
        (snapshot) => {
          if (!snapshot.exists()) return;
          const cloudDoc = snapshot.data();
          if (!cloudDoc || !cloudDoc.data) return;
          const d = cloudDoc.data;

          if (Array.isArray(d.transactions) && d.transactions.length > 0) {
            setTransactions(d.transactions);
          }
          if (Array.isArray(d.banners) && d.banners.length > 0) {
            setBanners(d.banners);
          }
          if (Array.isArray(d.channels) && d.channels.length > 0) {
            setChannels(d.channels);
          }
          if (Array.isArray(d.notifications)) {
            setNotifications(cleanDemoNotifications(d.notifications));
          }
          if (d.footerConfig && Object.keys(d.footerConfig).length > 0) {
            setFooterConfig(d.footerConfig);
          }
          if (Array.isArray(d.auditLogs) && d.auditLogs.length > 0) {
            setAuditLogs(d.auditLogs);
          }
          if (d.adminProfile) {
            if (d.adminProfile.avatarUrl && d.adminProfile.avatarUrl.startsWith('data:image/')) {
              setAdminAvatar(d.adminProfile.avatarUrl);
            }
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, 'settings/server_data');
        }
      );
    } catch (e) {
      console.warn('Real-time Firestore listener init notice:', e);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Sync state to local storage with safety check
  useEffect(() => {
    try {
      localStorage.setItem('protyasha_transactions', JSON.stringify(transactions));
    } catch (e) {
      console.warn('LocalStorage limit reached for transactions:', e);
    }
  }, [transactions]);


  useEffect(() => {
    try {
      localStorage.setItem('protyasha_banners', JSON.stringify(banners));
    } catch (e) {
      console.warn('LocalStorage limit reached for banners:', e);
    }
  }, [banners]);

  useEffect(() => {
    try {
      localStorage.setItem('protyasha_notifications', JSON.stringify(notifications));
    } catch (e) {
      console.warn('LocalStorage limit reached for notifications:', e);
    }
  }, [notifications]);

  useEffect(() => {
    try {
      localStorage.setItem('protyasha_footer', JSON.stringify(footerConfig));
    } catch (e) {
      console.warn('LocalStorage limit reached for footer:', e);
    }
  }, [footerConfig]);

  useEffect(() => {
    try {
      localStorage.setItem('protyasha_audit', JSON.stringify(auditLogs));
    } catch (e) {
      console.warn('LocalStorage limit reached for audit logs:', e);
    }
  }, [auditLogs]);

  useEffect(() => {
    if (user) {
      try {
        localStorage.setItem('protyasha_user', JSON.stringify(user));
      } catch (e) {
        console.warn('LocalStorage limit reached for user session:', e);
      }
    } else {
      localStorage.removeItem('protyasha_user');
    }
  }, [user]);

  // Live total balance calculation across all channels
  const totalBalance = transactions
    .filter(t => !t.isDeleted)
    .reduce((acc, curr) => {
      return curr.type === 'income' ? acc + curr.amount : acc - curr.amount;
    }, 0);

  // Map notifications with active user's read status
  const userNotifications = notifications.map(n => ({
    ...n,
    isRead: isNotifReadForUser(n)
  }));

  const unreadNotificationsCount = userNotifications.filter(n => !n.isRead).length;

  const existingCustomers = Array.from(
    new Set(transactions.map(t => t.person).filter(Boolean))
  );

  // Helper to add audit log and persist
  const logAction = (action: string, actionBn: string, details: string) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      action,
      actionBn,
      user: user?.name || 'Admin',
      details,
      time: Date.now()
    };
    const updatedLogs = [newLog, ...auditLogs];
    setAuditLogs(updatedLogs);
    fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auditLogs: updatedLogs })
    }).catch(() => {});
  };

  // Notification Broadcast by Admin
  const handleSendNotification = (data: Omit<NotificationItem, 'id' | 'isRead'>) => {
    const newNotif: NotificationItem = {
      ...data,
      id: `notif-${Date.now()}`,
      isRead: false,
      readBy: []
    };
    const updatedNotifications = [newNotif, ...notifications];
    setNotifications(updatedNotifications);
    logAction('Sent Notification', 'নোটিফিকেশন পাঠানো হয়েছে', `${newNotif.titleBn}`);
    sounds.playSuccess();
    
    fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notifications: updatedNotifications })
    }).catch(() => {});

    try {
      confetti({
        particleCount: 30,
        spread: 60,
        origin: { y: 0.3 }
      });
    } catch {
      // ignore
    }
  };

  const handleMarkNotificationAsRead = (id: string) => {
    const key = `protyasha_read_notifs_${userKey}`;
    const newRead = Array.from(new Set([...readNotifIds, id]));
    setReadNotifIds(newRead);
    try {
      localStorage.setItem(key, JSON.stringify(newRead));
    } catch {}

    const updatedNotifications = notifications.map(n => {
      if (n.id === id) {
        const existingReadBy = Array.isArray(n.readBy) ? n.readBy : [];
        if (!existingReadBy.includes(userKey)) {
          return { ...n, readBy: [...existingReadBy, userKey] };
        }
      }
      return n;
    });
    setNotifications(updatedNotifications);
    fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notifications: updatedNotifications })
    }).catch(() => {});
  };

  const handleMarkAllAsRead = () => {
    const allIds = notifications.map(n => n.id);
    const key = `protyasha_read_notifs_${userKey}`;
    const newRead = Array.from(new Set([...readNotifIds, ...allIds]));
    setReadNotifIds(newRead);
    try {
      localStorage.setItem(key, JSON.stringify(newRead));
    } catch {}

    const updatedNotifications = notifications.map(n => {
      const existingReadBy = Array.isArray(n.readBy) ? n.readBy : [];
      if (!existingReadBy.includes(userKey)) {
        return { ...n, readBy: [...existingReadBy, userKey] };
      }
      return n;
    });
    setNotifications(updatedNotifications);
    fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notifications: updatedNotifications })
    }).catch(() => {});
  };

  const handleDeleteNotification = (id: string) => {
    sounds.playTap();
    const updatedNotifications = notifications.filter(n => n.id !== id);
    setNotifications(updatedNotifications);
    logAction('Deleted Notification', 'নোটিফিকেশন মুছে ফেলা হয়েছে', `ID: ${id}`);
    
    fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notifications: updatedNotifications })
    }).catch((e) => console.error('Delete failed', e));
  };


  const handleSaveEntry = (entryData: Omit<Transaction, 'id' | 'trxId' | 'created'> & { id?: string }) => {
    sounds.playSuccess();
    try {
      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore
    }

    let updatedTransactions;
    if (entryData.id) {
      // Update Existing Entry
      updatedTransactions = transactions.map(t => {
        if (t.id === entryData.id) {
          const updated = { ...t, ...entryData };
          if (selectedTransaction?.id === t.id) {
            setSelectedTransaction(updated);
          }
          return updated;
        }
        return t;
      });
      logAction('Updated Transaction', 'এন্ট্রি হালনাগাদ', `${entryData.person} (${entryData.method}) - ${entryData.amount} টাকা`);
    } else {
      // Create New Entry
      const randomHex = Math.random().toString(36).substring(2, 7).toUpperCase();
      const prefix = entryData.method === 'ব্যাংক' ? '765B' : '765M';
      const newTrx: Transaction = {
        ...entryData,
        id: `trx-${Date.now()}`,
        trxId: `${prefix}${randomHex}`,
        created: Date.now()
      };
      updatedTransactions = [...transactions, newTrx];
      logAction('Created Transaction', 'নতুন লেনদেন এন্ট্রি', `${newTrx.type === 'income' ? 'জমা' : 'খরচ'} [${newTrx.method}]: ${newTrx.person} - ${newTrx.amount} টাকা`);
    }
    
    setTransactions(updatedTransactions);
    fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transactions: updatedTransactions })
    }).catch(() => {});

    // Direct Cloud Firestore Sync - safely strip any undefined fields to prevent Firestore setDoc error
    try {
      const lastItem = updatedTransactions[updatedTransactions.length - 1];
      const docId = entryData.id || lastItem?.id;
      if (docId) {
        const rawObject = entryData.id ? { id: entryData.id, ...entryData } : lastItem;
        const cleanDoc: any = {};
        if (rawObject) {
          Object.keys(rawObject).forEach(key => {
            if ((rawObject as any)[key] !== undefined) {
              cleanDoc[key] = (rawObject as any)[key];
            }
          });
          setDoc(doc(db, 'transactions', docId), cleanDoc, { merge: true }).catch(err => {
            console.warn('Firestore setDoc warning:', err);
          });
        }
      }
    } catch (e) {
      console.warn('Firestore sync error safely caught:', e);
    }

    // Close form modal immediately
    setIsEntryModalOpen(false);
    setEditingTransaction(null);

    // Automatically navigate to 'transactions' statement view and filter by the selected method!
    if (entryData.method) {
      setSelectedMethodFilter(entryData.method);
      setActiveTab('transactions');
    }
  };

  const handleDeleteTransaction = (trx: Transaction) => {
    sounds.playTap();
    setDeleteTrx(trx);
  };

  const confirmDelete = () => {
    if (!deleteTrx) return;
    const updatedTransactions = transactions.map(t => (t.id === deleteTrx.id ? { ...t, isDeleted: true } : t));
    setTransactions(updatedTransactions);
    if (selectedTransaction?.id === deleteTrx.id) {
      setSelectedTransaction(null);
    }
    logAction('Moved to Trash', 'রিসাইকেল বিনে প্রেরণ', `${deleteTrx.person} - #${deleteTrx.trxId}`);
    
    fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transactions: updatedTransactions })
    }).catch(() => {});

    // Sync deletion to Cloud Firestore
    setDoc(doc(db, 'transactions', deleteTrx.id), { isDeleted: true }, { merge: true }).catch(() => {});
    setDeleteTrx(null);
  };

  const handleStartEdit = (trx: Transaction) => {
    sounds.playTap();
    setEditingTransaction(trx);
    setEntryType(trx.type);
    setIsEntryModalOpen(true);
    pushHistoryStep();
  };

  const handleRestore = (id: string) => {
    sounds.playSuccess();
    const updatedTransactions = transactions.map(t => (t.id === id ? { ...t, isDeleted: false } : t));
    setTransactions(updatedTransactions);
    fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transactions: updatedTransactions })
    }).catch(() => {});
    setDoc(doc(db, 'transactions', id), { isDeleted: false }, { merge: true }).catch(() => {});
    logAction('Restored Transaction', 'লেনদেন পুনরুদ্ধার', `ID: ${id}`);
  };

  const handlePermanentDelete = (id: string) => {
    sounds.playTap();
    if (confirm(lang === 'bn' ? 'স্থায়ীভাবে মুছে ফেলতে চান?' : 'Delete permanently?')) {
      const updatedTransactions = transactions.filter(t => t.id !== id);
      setTransactions(updatedTransactions);
      fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactions: updatedTransactions })
      }).catch(() => {});
      deleteDoc(doc(db, 'transactions', id)).catch(() => {});
      if (selectedTransaction?.id === id) {
        setSelectedTransaction(null);
      }
      logAction('Permanent Delete', 'স্থায়ীভাবে মুছে ফেলা', `ID: ${id}`);
    }
  };

  const handleEmptyTrash = () => {
    sounds.playTap();
    const updatedTransactions = transactions.filter(t => !t.isDeleted);
    setTransactions(updatedTransactions);
    fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transactions: updatedTransactions })
    }).catch(() => {});
    logAction('Emptied Trash', 'রিসাইকেল বিন সম্পূর্ণ খালি', 'All trash cleared');
  };

  const handleLoginSuccess = (loggedInUser: UserSession) => {
    setUser(loggedInUser);
    localStorage.setItem('protyasha_user', JSON.stringify(loggedInUser));
    if (loggedInUser.role !== 'visitor') {
      sessionStorage.setItem('protyasha_session_active', 'true');
    } else {
      sessionStorage.setItem('protyasha_session_active', 'false');
    }
    if (loggedInUser.avatarUrl) {
      localStorage.setItem('protyasha_last_avatar', loggedInUser.avatarUrl);
    } else {
      localStorage.removeItem('protyasha_last_avatar');
    }
    setIsLoginOpen(false);
    setIsProfileOpen(false);
    setActiveTab('home');
    logAction(
      'User Login',
      loggedInUser.role === 'admin' ? 'এডমিন লগইন' : loggedInUser.role === 'user' ? 'ইউজার লগইন' : 'ভিজিটর মোড',
      `${loggedInUser.name} (${loggedInUser.phone || 'N/A'})`
    );
  };

  const handleLogout = () => {
    sounds.playTap();
    if (user?.avatarUrl && user.role !== 'visitor') {
      localStorage.setItem('protyasha_last_avatar', user.avatarUrl);
    }
    localStorage.removeItem('protyasha_user');
    sessionStorage.removeItem('protyasha_session_active');
    setUser(null);
    setActiveTab('home');
    setIsProfileOpen(false);
    setSelectedTransaction(null);
    setActivePortal(null);
    setIsNotificationsOpen(false);
    setIsAuditLogOpen(false);
    setIsUserManagementOpen(false);
    setIsBannerManagerOpen(false);
    setIsChannelManagerOpen(false);
    setIsRecycleBinOpen(false);
    setIsChangePinOpen(false);
    setIsFooterSettingsOpen(false);
    setIsEntryModalOpen(false);
    setReceiptTransaction(null);
    setSelectedNotificationDetail(null);
    setIsLoginOpen(true);
    // Push fresh history state so back button cannot navigate back to visitor mode
    window.history.pushState({ screen: 'login' }, '', window.location.pathname);
    logAction('Logout', 'লগআউট', 'সেশন সমাপ্ত ও সরাসরি লগইন পেইজে স্থানান্তর');
  };

  const openLoginView = () => {
    sounds.playTap();
    setIsLoginOpen(true);
    setIsProfileOpen(false);
    pushHistoryStep();
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 flex flex-col w-full selection:bg-rose-500 selection:text-white">
      {/* Full Screen Responsive App Container for Mobile & Desktop PC */}
      <div className="relative w-full max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto bg-white dark:bg-slate-900 min-h-screen shadow-2xl flex flex-col transition-all">
        
        {/* If Login View is explicitly requested */}
        {isLoginOpen ? (
          <LoginView
            lang={lang}
            footerConfig={footerConfig}
            banners={banners}
            adminAvatar={adminAvatar}
            onLanguageChange={setLang}
            onLoginSuccess={handleLoginSuccess}
            onClose={() => {
              // Only allow closing login modal if user already has an active session
              if (user && (user.role === 'admin' || user.role === 'user')) {
                setIsLoginOpen(false);
                sessionStorage.setItem('protyasha_session_active', 'true');
              }
            }}
          />
        ) : selectedTransaction ? (
          /* CARD TAP OPENS NEW PAGE (NOT POPUP) */
          <TransactionDetailPage
            transaction={selectedTransaction}
            lang={lang}
            user={user}
            onBack={() => setSelectedTransaction(null)}
            onEdit={handleStartEdit}
            onDelete={handleDeleteTransaction}
            onViewReceipt={(trx) => {
              setReceiptTransaction(trx);
              pushHistoryStep();
            }}
            onOpenLogin={openLoginView}
          />
        ) : (
          <>
            {/* View Switcher by Tab */}
            {activeTab === 'home' && (
              <div className="flex-1 pb-24">
                {/* Header with scenic landscape and Notification Bell */}
                <Header
                  lang={lang}
                  user={user}
                  adminAvatar={adminAvatar}
                  unreadCount={unreadNotificationsCount}
                  weatherData={weatherData}
                  onOpenWeather={() => {
                    sounds.playTap();
                    setIsWeatherOpen(true);
                    pushHistoryStep();
                  }}
                  onOpenNotifications={() => {
                    sounds.playTap();
                    setIsNotificationsOpen(true);
                    pushHistoryStep();
                  }}
                  onOpenProfile={() => {
                    sounds.playTap();
                    setActiveTab('profile');
                    pushHistoryStep();
                  }}
                />

                {/* Tap to Check Balance Card */}
                <BalanceCard balance={totalBalance} lang={lang} />

                {/* 2 Primary Feature Cards:
                    1. বিল ম্যানেজমেন্ট প্রো (opens Bill Management Pro portal)
                    2. আয়-ব্যয় হিসাব (opens Income-Expense Smart Management portal) */}
                <PrimaryFeatureCards
                  lang={lang}
                  onOpenBillManager={() => {
                    sounds.playTap();
                    setActivePortal('bill-manager');
                    pushHistoryStep();
                  }}
                  onOpenAyByay={() => {
                    sounds.playTap();
                    setActivePortal('ay-byay');
                    pushHistoryStep();
                  }}
                />

                {/* Main Page Promotional Ads Carousel (Admin Controllable 5-7 ads) */}
                <PromoCarousel
                  banners={banners}
                  lang={lang}
                  user={user}
                  onExploreOffer={(banner) => {
                    if (!banner) return;
                    sounds.playTap();
                    const link = (banner.linkUrl || '').trim();
                    if (link === '#weather' || link === 'action:weather') {
                      setIsWeatherOpen(true);
                    } else if (link === '#notifications' || link === 'action:notifications') {
                      setIsNotificationsOpen(true);
                    } else if (link === '#home' || link === 'tab:home') {
                      setActiveTab('home');
                      setActivePortal(null);
                    } else if (link === '#transactions' || link === 'tab:transactions') {
                      setActiveTab('transactions');
                      setActivePortal(null);
                    } else if (link === '#ledger' || link === 'tab:ledger') {
                      setActiveTab('ledger');
                      setActivePortal(null);
                    } else if (link === '#profile' || link === 'tab:profile') {
                      setActiveTab('profile');
                      setActivePortal(null);
                    } else if (link.startsWith('#portal:') || link.startsWith('portal:')) {
                      const portal = link.replace(/^#?portal:/, '') as any;
                      setActivePortal(portal);
                    } else if (link.startsWith('#category:') || link.startsWith('category:')) {
                      const cat = link.replace(/^#?category:/, '');
                      setSelectedMethodFilter(cat === 'all' ? '' : cat);
                      setActiveTab('transactions');
                      setActivePortal(null);
                    } else if (link === '#offer' || link === '#store' || link === '#help' || link.startsWith('action:')) {
                      if (user?.role === 'admin') {
                        setIsFooterSettingsOpen(true);
                      } else {
                        // Open footer settings or show notifications
                        setIsNotificationsOpen(true);
                      }
                    } else if (link.startsWith('tel:')) {
                      window.location.href = link;
                    } else if (link.startsWith('http')) {
                      window.open(link, '_blank');
                    } else {
                      setActiveTab('transactions');
                    }
                    pushHistoryStep();
                  }}
                  onOpenBannerManager={() => {
                    if (user?.role === 'admin') {
                      setIsBannerManagerOpen(true);
                      pushHistoryStep();
                    } else {
                      openLoginView();
                    }
                  }}
                />

                {/* Payment Channels & Control Panel (বিকাশ, নগদ, ব্যাংক, রকেট, ক্যাশ + কন্ট্রোল প্যানেল) */}
                <QuickChannels
                  transactions={transactions}
                  channels={channels}
                  lang={lang}
                  user={user}
                  onSelectMethod={(m) => {
                    setSelectedMethodFilter(m);
                    setActiveTab('transactions');
                    pushHistoryStep();
                  }}
                  onOpenChannelManager={() => {
                    if (user?.role === 'admin') {
                      setIsChannelManagerOpen(true);
                      pushHistoryStep();
                    } else {
                      openLoginView();
                    }
                  }}
                  onOpenIncome={() => {
                    if (user?.role === 'admin') {
                      setEntryType('income');
                      setEditingTransaction(null);
                      setIsEntryModalOpen(true);
                      pushHistoryStep();
                    } else {
                      openLoginView();
                    }
                  }}
                  onOpenExpense={() => {
                    if (user?.role === 'admin') {
                      setEntryType('expense');
                      setEditingTransaction(null);
                      setIsEntryModalOpen(true);
                      pushHistoryStep();
                    } else {
                      openLoginView();
                    }
                  }}
                  onOpenLedger={() => {
                    setActiveTab('ledger');
                    pushHistoryStep();
                  }}
                />
              </div>
            )}

            {activeTab === 'transactions' && (
              <div className="flex-1 pb-24">
                {/* Header for Transactions Screen */}
                <div className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-4 h-14 flex items-center justify-between shadow-2xs">
                  <h1 className="text-base font-bold text-slate-900 dark:text-white mx-auto">
                    {lang === 'bn' ? 'সকল লেনদেন ও চ্যানেল স্টেটমেন্ট' : 'All Transactions & Statements'}
                  </h1>
                </div>

                <TransactionList
                  transactions={transactions}
                  lang={lang}
                  user={user}
                  onSelectTransaction={(trx) => {
                    setSelectedTransaction(trx);
                    pushHistoryStep();
                  }}
                  onEdit={handleStartEdit}
                  onDelete={handleDeleteTransaction}
                  selectedMethodFilter={selectedMethodFilter}
                  onClearMethodFilter={() => setSelectedMethodFilter(null)}
                />
              </div>
            )}

            {activeTab === 'ledger' && (
              <div className="flex-1 w-full pb-20">
                <ReportModal
                  isOpen={true}
                  transactions={transactions}
                  channels={channels}
                  lang={lang}
                  isTabMode={true}
                  onClose={() => setActiveTab('home')}
                />
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="flex-1 w-full pb-20">
                <ProfileView
                  user={user}
                  lang={lang}
                  theme={theme}
                  adminAvatar={adminAvatar}
                  isTabMode={true}
                  onToggleTheme={() => setTheme(prev => (prev === 'light' ? 'dark' : 'light'))}
                  onLanguageChange={setLang}
                  onUpdateAdminProfile={handleUpdateAdminProfile}
                  onUpdateUserProfile={handleUpdateUserProfile}
                  onOpenFooterSettings={() => {
                    if (user?.role === 'admin') {
                      setIsFooterSettingsOpen(true);
                      pushHistoryStep();
                    } else {
                      openLoginView();
                    }
                  }}
                  onOpenLogin={openLoginView}
                  onOpenChangePin={() => {
                    if (user?.role === 'admin') {
                      setIsChangePinOpen(true);
                      pushHistoryStep();
                    } else {
                      openLoginView();
                    }
                  }}
                  onOpenRecycleBin={() => {
                    if (user?.role === 'admin') {
                      setIsRecycleBinOpen(true);
                      pushHistoryStep();
                    } else {
                      openLoginView();
                    }
                  }}
                  onOpenAuditLog={() => {
                    setIsAuditLogOpen(true);
                    pushHistoryStep();
                  }}
                  onOpenBannerManager={() => {
                    if (user?.role === 'admin') {
                      setIsBannerManagerOpen(true);
                      pushHistoryStep();
                    } else {
                      alert(lang === 'bn' ? 'বিজ্ঞাপন নিয়ন্ত্রণ শুধুমাত্র অ্যাডমিনের জন্য' : 'Admin only access');
                      openLoginView();
                    }
                  }}
                  onOpenNotifications={() => {
                    setIsNotificationsOpen(true);
                    pushHistoryStep();
                  }}
                  onOpenUserManagement={() => {
                    if (user?.role === 'admin') {
                      setIsUserManagementOpen(true);
                      pushHistoryStep();
                    } else {
                      openLoginView();
                    }
                  }}
                  onLogout={handleLogout}
                  onClose={() => setActiveTab('home')}
                />
              </div>
            )}

            {/* Clean Bottom Navigation: 5 tabs */}
            <BottomNav
              activeTab={activeTab}
              lang={lang}
              onTabChange={(tab) => {
                if (tab === 'transactions') {
                  setSelectedMethodFilter(null);
                }
                setActiveTab(tab);
                pushHistoryStep();
              }}
            />
          </>
        )}

        {/* ================= MODALS & EDITORS ================= */}

        {/* Admin User Management Modal */}
        {user?.role === 'admin' && (
          <UserManagementModal
            isOpen={isUserManagementOpen}
            lang={lang}
            onClose={() => setIsUserManagementOpen(false)}
            onUserUpdated={(updatedUser) => {
              if (user && (user.id === updatedUser.id || user.phone === updatedUser.phone || (updatedUser.role === 'admin' && user.role === 'admin'))) {
                setUser(prev => prev ? {
                  ...prev,
                  name: updatedUser.name,
                  phone: updatedUser.phone,
                  avatarUrl: updatedUser.avatarUrl || prev.avatarUrl,
                  role: updatedUser.role
                } : null);
                if (updatedUser.role === 'admin' && updatedUser.avatarUrl) {
                  setAdminAvatar(updatedUser.avatarUrl);
                }
              }
            }}
          />
        )}

        {/* Admin Banner & Ads Manager Modal */}
        {user?.role === 'admin' && (
          <BannerManagerModal
            isOpen={isBannerManagerOpen}
            banners={banners}
            lang={lang}
            onClose={() => setIsBannerManagerOpen(false)}
            onSaveBanners={(updated) => {
              setBanners(updated);
              fetch('/api/data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ banners: updated })
              }).catch(() => {});
              logAction('Updated Banners', 'বিজ্ঞাপন ব্যানার পরিবর্তন', `সক্রিয় বিজ্ঞাপন সংখ্যা: ${updated.length}`);
            }}
          />
        )}

        {/* Admin Channel Manager Modal */}
        {user?.role === 'admin' && (
          <ChannelManagerModal
            isOpen={isChannelManagerOpen}
            channels={channels}
            lang={lang}
            onClose={() => setIsChannelManagerOpen(false)}
            onSaveChannels={(updated) => {
              setChannels(updated);
              fetch('/api/data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ channels: updated })
              }).catch(() => {});
              logAction('Updated Channels', 'পেমেন্ট চ্যানেল হালনাগাদ', `মোট চ্যানেল সংখ্যা: ${updated.length}`);
            }}
          />
        )}

        {/* Printable Thermal Receipt Modal */}
        <ReceiptModal
          transaction={receiptTransaction}
          lang={lang}
          onClose={() => setReceiptTransaction(null)}
        />

        {/* Income / Expense Entry & Edit Modal */}
        <EntryModal
          isOpen={isEntryModalOpen}
          type={entryType}
          editingTransaction={editingTransaction}
          existingCustomers={existingCustomers}
          channels={channels}
          lang={lang}
          onClose={() => {
            setIsEntryModalOpen(false);
            setEditingTransaction(null);
          }}
          onSave={handleSaveEntry}
        />

        {/* Notifications Modal (Red Bell Click / Broadcast) */}
        <NotificationsModal
          isOpen={isNotificationsOpen}
          notifications={userNotifications}
          lang={lang}
          user={user}
          onClose={() => {
            setIsNotificationsOpen(false);
            setEditingNotification(null);
          }}
          onSelectNotification={(notif) => {
            handleMarkNotificationAsRead(notif.id);
            setSelectedNotificationDetail(notif);
            pushHistoryStep();
          }}
          onMarkAllAsRead={handleMarkAllAsRead}
          onSendNotification={handleSendNotification}
          onEditNotification={(notif) => {
            const updatedNotifications = notifications.map(n => n.id === notif.id ? notif : n);
            setNotifications(updatedNotifications);
            fetch('/api/data', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ notifications: updatedNotifications })
            }).catch(() => {});
            setEditingNotification(null);
          }}
          initialEditingNotif={editingNotification}
        />

        {/* Notification Detail View Modal (Tapping any notification shows full details) */}
        <NotificationDetailModal
          notification={selectedNotificationDetail}
          lang={lang}
          user={user}
          onClose={() => setSelectedNotificationDetail(null)}
          onDelete={handleDeleteNotification}
          onMarkAsRead={handleMarkNotificationAsRead}
          onOpenWeather={() => {
            sounds.playTap();
            setIsWeatherOpen(true);
            pushHistoryStep();
          }}
          onEdit={(notif) => {
            setSelectedNotificationDetail(null);
            setEditingNotification(notif);
            setIsNotificationsOpen(true);
            pushHistoryStep();
          }}
        />

        {/* Profile Full View Modal */}
        {isProfileOpen && (
          <ProfileView
            user={user}
            lang={lang}
            theme={theme}
            adminAvatar={adminAvatar}
            onToggleTheme={() => setTheme(prev => (prev === 'light' ? 'dark' : 'light'))}
            onLanguageChange={setLang}
            onUpdateAdminProfile={handleUpdateAdminProfile}
            onUpdateUserProfile={handleUpdateUserProfile}
            onOpenLogin={openLoginView}
            onOpenChangePin={() => {
              if (user?.role === 'admin') {
                setIsChangePinOpen(true);
                pushHistoryStep();
              } else {
                openLoginView();
              }
            }}
            onOpenRecycleBin={() => {
              if (user?.role === 'admin') {
                setIsRecycleBinOpen(true);
                pushHistoryStep();
              } else {
                openLoginView();
              }
            }}
            onOpenAuditLog={() => {
              setIsAuditLogOpen(true);
              pushHistoryStep();
            }}
            onOpenBannerManager={() => {
              if (user?.role === 'admin') {
                setIsBannerManagerOpen(true);
                pushHistoryStep();
              } else {
                openLoginView();
              }
            }}
            onOpenFooterSettings={() => {
              if (user?.role === 'admin') {
                setIsFooterSettingsOpen(true);
                pushHistoryStep();
              } else {
                openLoginView();
              }
            }}
            onOpenNotifications={() => {
              setIsNotificationsOpen(true);
              pushHistoryStep();
            }}
            onOpenUserManagement={() => {
              if (user?.role === 'admin') {
                setIsUserManagementOpen(true);
                pushHistoryStep();
              } else {
                openLoginView();
              }
            }}
            onLogout={handleLogout}
            onClose={() => setIsProfileOpen(false)}
          />
        )}

        {/* Recycle Bin Modal */}
        <RecycleBinModal
          isOpen={isRecycleBinOpen}
          transactions={transactions}
          lang={lang}
          onClose={() => setIsRecycleBinOpen(false)}
          onRestore={handleRestore}
          onPermanentDelete={handlePermanentDelete}
          onEmptyTrash={handleEmptyTrash}
        />

        {/* Audit Log Modal */}
        <AuditLogModal
          isOpen={isAuditLogOpen}
          logs={auditLogs}
          lang={lang}
          onClose={() => setIsAuditLogOpen(false)}
        />

        {/* Footer Settings Modal */}
        <FooterSettingsModal
          isOpen={isFooterSettingsOpen}
          config={footerConfig}
          banners={banners}
          lang={lang}
          onClose={() => setIsFooterSettingsOpen(false)}
          onSave={(newCfg) => {
            setFooterConfig(newCfg);
            localStorage.setItem('protyasha_footer_config', JSON.stringify(newCfg));
            fetch('/api/data', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ footerConfig: newCfg })
            }).catch(() => {});
          }}
          onSaveBanners={(newBanners) => {
            setBanners(newBanners);
            localStorage.setItem('protyasha_banners', JSON.stringify(newBanners));
            fetch('/api/data', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ banners: newBanners })
            }).catch(() => {});
            logAction('Updated Offers', 'অফার ও বিজ্ঞাপন পরিবর্তন', `মোট অফার: ${newBanners.length}`);
          }}
        />

        {/* Change PIN Modal */}
        <ChangePinModal
          isOpen={isChangePinOpen}
          lang={lang}
          onClose={() => setIsChangePinOpen(false)}
          onPinChanged={() => {
            logAction('Changed PIN', 'পিন পরিবর্তন', 'Security PIN successfully updated');
          }}
        />

        {/* 7-Day Weather Forecast Modal with auto-location and animated conditions */}
        <WeatherModal
          isOpen={isWeatherOpen}
          lang={lang}
          isAdmin={user?.role === 'admin'}
          onClose={() => setIsWeatherOpen(false)}
          onSendWeatherNotification={(notif) => {
            handleSendNotification(notif);
          }}
          onLocationChanged={() => {
            fetchLiveWeather(true).then(w => {
              if (w) setWeatherData(w);
            });
          }}
        />

        {/* Full-screen in-app portal viewer for Bill Management Pro / Income-Expense accounts (Clean full-screen, no floating back button) */}
        {activePortal && (
          <div className="fixed inset-0 z-50 bg-black select-none animate-in fade-in duration-150">
            {/* Portal Content Frame */}
            <iframe
              src={activePortal === 'bill-manager' ? '/bill-manager-pro.html' : '/ay-byay.html'}
              title={activePortal === 'bill-manager' ? 'Bill Management Pro' : 'Income Expense Portal'}
              className="w-full h-full border-none bg-black"
              allow="clipboard-read; clipboard-write; fullscreen"
            />
          </div>
        )}
        {/* Custom Delete Confirmation Modal */}
        {deleteTrx && (
          <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-sm text-center shadow-2xl">
              <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-950 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-rose-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                {lang === 'bn' ? 'মুছে ফেলতে চান?' : 'Confirm Delete?'}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                {lang === 'bn' ? 'এই লেনদেনটি রিসাইকেল বিনে স্থানান্তর করা হবে।' : 'This transaction will be moved to the recycle bin.'}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteTrx(null)}
                  className="flex-1 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                >
                  {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 py-3 rounded-xl bg-[#E52E2E] text-white font-bold"
                >
                  {lang === 'bn' ? 'ঠিক আছে' : 'OK'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
