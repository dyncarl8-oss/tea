export type UserRole = 'guest' | 'member' | 'affiliate' | 'admin';

export interface User {
  id: string;
  whopUserId: string;
  username: string;
  email?: string;
  avatarUrl?: string;
  role: 'guest' | 'member' | 'affiliate' | 'admin';
  affiliateId?: string;
  metadata?: Record<string, string>;
}

export interface Symptom {
  id: string;
  name: string;
  category: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  ingredients: string[];
  benefits: string[];
  tags: string[]; // e.g. "Sleep", "Digestion"
}

export interface Recommendation {
  product: Product;
  ritual: string;
  whyItWorks: string;
}

export interface Course {
  id: string;
  title: string;
  instructor: string;
  thumbnail: string;
  lessons: number;
  progress: number; // 0-100
  category: string;
}

export interface Asset {
  id: string;
  title: string;
  type: 'image' | 'video' | 'copy' | 'template';
  url: string;
  thumbnail: string;
}

export interface Stats {
  revenue: { date: string; amount: number }[];
  conversions: { date: string; count: number }[];
  totalEarnings: number;
  pendingPayout: number;
}
