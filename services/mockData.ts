import { Product, Symptom, Course, Asset, Stats } from '../types';

export const SYMPTOMS: Symptom[] = [
  { id: '1', name: 'Bloating', category: 'Digestion' },
  { id: '2', name: 'Insomnia', category: 'Sleep' },
  { id: '3', name: 'Brain Fog', category: 'Focus' },
  { id: '4', name: 'Anxiety', category: 'Mental' },
  { id: '5', name: 'Low Energy', category: 'Fatigue' },
  { id: '6', name: 'Sore Throat', category: 'Immunity' },
];

export const PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Island Calm Blend',
    description: 'A soothing infusion of chamomile and Caribbean lemongrass to ease the mind.',
    price: 28,
    image: 'https://picsum.photos/400/400?random=1',
    ingredients: ['Chamomile', 'Lemongrass', 'Passionflower', 'Lavender'],
    benefits: ['Promotes deep sleep', 'Reduces anxiety', 'Relieves tension'],
    tags: ['Sleep', 'Mental', 'Anxiety']
  },
  {
    id: 'p2',
    name: 'Digestive Flow',
    description: 'Ginger and peppermint combine to soothe the gut and reduce inflammation.',
    price: 24,
    image: 'https://picsum.photos/400/400?random=2',
    ingredients: ['Ginger Root', 'Peppermint', 'Fennel Seed', 'Licorice'],
    benefits: ['Reduces bloating', 'Aids digestion', 'Calms stomach'],
    tags: ['Digestion', 'Bloating']
  },
  {
    id: 'p3',
    name: 'Sunrise Vitality',
    description: 'An energizing yerba mate blend with hibiscus for a morning boost without the crash.',
    price: 32,
    image: 'https://picsum.photos/400/400?random=3',
    ingredients: ['Yerba Mate', 'Hibiscus', 'Guayusa', 'Lemon Peel'],
    benefits: ['Boosts energy', 'High antioxidants', 'Improves focus'],
    tags: ['Fatigue', 'Low Energy', 'Focus', 'Brain Fog']
  },
  {
    id: 'p4',
    name: 'Immunity Shield',
    description: 'Elderberry and echinacea to protect your system during seasonal shifts.',
    price: 30,
    image: 'https://picsum.photos/400/400?random=4',
    ingredients: ['Elderberry', 'Echinacea', 'Astragalus', 'Rosehips'],
    benefits: ['Supports immune system', 'High Vitamin C', 'Soothing for throat'],
    tags: ['Immunity', 'Sore Throat', 'Cold']
  }
];

export const COURSES: Course[] = [
  {
    id: 'c1',
    title: 'Herbalism 101: Roots & Rituals',
    instructor: 'Dr. Althea Green',
    thumbnail: 'https://picsum.photos/600/300?random=5',
    lessons: 12,
    progress: 45,
    category: 'Education'
  },
  {
    id: 'c2',
    title: 'Business of Wellness: Monetize Your Influence',
    instructor: 'Sarah J.',
    thumbnail: 'https://picsum.photos/600/300?random=6',
    lessons: 8,
    progress: 0,
    category: 'Business'
  },
  {
    id: 'c3',
    title: 'Masterclass: Gut Health Protocols',
    instructor: 'Nutritionist Mike',
    thumbnail: 'https://picsum.photos/600/300?random=7',
    lessons: 5,
    progress: 100,
    category: 'Advanced'
  }
];

export const ASSETS: Asset[] = [
  { id: 'a1', title: 'Summer Campaign Story', type: 'image', url: '#', thumbnail: 'https://picsum.photos/200/300?random=8' },
  { id: 'a2', title: 'Benefits of Ginger (Reel)', type: 'video', url: '#', thumbnail: 'https://picsum.photos/200/300?random=9' },
  { id: 'a3', title: 'Email Swipe File', type: 'copy', url: '#', thumbnail: 'https://picsum.photos/200/200?random=10' },
  { id: 'a4', title: 'Product Mockups', type: 'template', url: '#', thumbnail: 'https://picsum.photos/200/200?random=11' },
];

export const MOCK_STATS: Stats = {
  totalEarnings: 1245.50,
  pendingPayout: 320.00,
  revenue: [
    { date: 'Mon', amount: 120 },
    { date: 'Tue', amount: 80 },
    { date: 'Wed', amount: 200 },
    { date: 'Thu', amount: 150 },
    { date: 'Fri', amount: 280 },
    { date: 'Sat', amount: 350 },
    { date: 'Sun', amount: 190 },
  ],
  conversions: [
    { date: 'Mon', count: 4 },
    { date: 'Tue', count: 2 },
    { date: 'Wed', count: 6 },
    { date: 'Thu', count: 5 },
    { date: 'Fri', count: 8 },
    { date: 'Sat', count: 12 },
    { date: 'Sun', count: 7 },
  ]
};