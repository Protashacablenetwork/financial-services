export type TransactionType = 'income' | 'expense';

export type PaymentMethod = string; // Supports 'নগদ', 'বিকাশ', 'রকেট', 'ব্যাংক', 'ক্যাশ' and custom admin-added channels (e.g. 'উপায়', 'সেলফিন', etc.)

export interface PaymentChannel {
  id: string;
  name: string;
  labelBn: string;
  labelEn: string;
  icon: string;
  imageUrl?: string;
  color: string;
  bg: string;
  border: string;
  isDefault?: boolean;
}

export interface Transaction {
  id: string;
  trxId: string;
  type: TransactionType;
  method: PaymentMethod;
  bankName?: string; // e.g. "ব্র্যাক ব্যাংক", "ইসলামী ব্যাংক", "ডাচ বাংলা ব্যাংক"
  amount: number;
  person: string;
  phone: string;
  date: string; // YYYY-MM-DD
  time: string; // e.g. "11:02 AM"
  note: string;
  category: string;
  isDeleted?: boolean;
  created: number;
}

export interface BannerAd {
  id: string;
  titleBn: string;
  titleEn: string;
  subtitleBn: string;
  subtitleEn: string;
  badgeBn: string;
  badgeEn: string;
  imageUrl: string;
  linkUrl: string;
  isActive: boolean;
  priority: number;
}

export interface AuditLog {
  id: string;
  action: string;
  actionBn: string;
  user: string;
  details: string;
  time: number;
}

export interface NotificationItem {
  id: string;
  titleBn: string;
  titleEn: string;
  bodyBn: string;
  bodyEn: string;
  messageBn?: string;
  messageEn?: string;
  date?: string;
  timeBn: string;
  timeEn: string;
  type: 'offer' | 'cashback' | 'trx' | 'info' | 'weather' | 'alert';
  amount?: number;
  image?: string;
  isRead?: boolean;
  readBy?: string[];
}

export interface FooterItem {
  bn: string;
  en: string;
  url: string;
  icon: string;
}

export interface FooterConfig {
  store: FooterItem;
  offer: FooterItem;
  help: FooterItem;
}

export type Language = 'bn' | 'en';

export type UserRole = 'admin' | 'user' | 'visitor';

export interface AppUser {
  id: string;
  name: string;
  phone: string;
  avatarUrl?: string;
  pin: string;
  role: 'admin' | 'user';
  createdAt: string;
  status: 'active' | 'suspended';
}

export interface UserSession {
  id?: string;
  email: string;
  role: UserRole;
  name: string;
  phone: string;
  avatarUrl?: string;
  virtualCardNumber: string;
  accountType: 'islamic' | 'general';
  profitPreference: boolean;
}
