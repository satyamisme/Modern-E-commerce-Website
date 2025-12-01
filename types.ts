

export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Address {
  id: string;
  type: 'Home' | 'Work' | 'Other';
  street: string;
  city: string;
  zip: string;
  phone: string;
  isDefault?: boolean;
}

export interface ProductVariant {
  id: string;
  color: string;
  storage: string;
  price: number;
  stock: number;
  sku?: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number; // Base price (displayed in lists)
  originalPrice?: number;
  costPrice?: number;
  monthlyPrice?: number;
  rating: number;
  reviewsCount?: number;
  category: 'Smartphones' | 'Audio' | 'Wearables' | 'Accessories' | 'Tablets';
  colors: string[];
  storageOptions?: string[];
  variants?: ProductVariant[]; // Detailed combinations
  // Allow nested objects for grouped specs
  specs: {
    [key: string]: any;
  };
  description: string;
  imageSeed: number;
  image?: string;
  images?: string[];
  tags: string[];
  express?: boolean;
  stock: number; // Total stock (sum of variants or simple number)
  reorderPoint?: number;
  supplier?: string;
  sku?: string;
  reviews?: Review[];
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  };
  
  // Storefront / Hero Settings
  isHero?: boolean;
  heroImage?: string; // Optional override for banner
  heroTitle?: string;
  heroSubtitle?: string;
  
  // New Storefront Flags
  isFeatured?: boolean; // For "Featured Collection" rail
  isTicker?: boolean;   // For "Live Ticker" marquee
}

export interface CartItem extends Product {
  quantity: number;
  selectedColor?: string;
  selectedStorage?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isLoading?: boolean;
}

export enum SortOption {
  Recommended = 'Recommended',
  PriceLowHigh = 'Price: Low to High',
  PriceHighLow = 'Price: High to Low',
}

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export type RoleType = 'Super Admin' | 'Shop Admin' | 'Sales' | 'Warehouse Staff' | 'User' | string;

export interface Permission {
  id: string;
  label: string;
  key: string;
  description?: string;
}

export interface RoleDefinition {
  id: string;
  name: string;
  permissions: string[]; // Array of permission keys
  isSystem?: boolean; // Cannot be deleted if true
  description?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: RoleType;
  shopId?: string; // If assigned to a specific shop
  addresses: Address[];
}

export interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  joinDate: string;
  totalSpent: number;
  ordersCount: number;
  segment: 'VIP' | 'Regular' | 'New' | 'At-Risk';
  lastOrderDate: string;
  notes?: string;
  avatar: string;
}

export interface Warehouse {
  id: string;
  name: string;
  location: {
    lat?: number;
    lng?: number;
    address: string;
  };
  capacity: number;
  utilization: number;
  type: 'Main Warehouse' | 'Retail Shop' | 'Online Fulfillment';
  managerId?: string;
  phone?: string;
  openingHours?: string;
}

export interface Order {
  id: string;
  date: string;
  total: number;
  status: 'New' | 'Fraud Scan' | 'Processing' | 'Picking' | 'QC' | 'Shipping' | 'Delivered' | 'Cancelled' | 'Returned';
  paymentStatus: 'Pending' | 'Paid' | 'Failed';
  paymentMethod: 'KNET' | 'Credit Card';
  items: CartItem[];
  fraudScore?: number;
  shopId?: string; // Fulfilled by
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
    segment?: 'VIP' | 'Regular' | 'New' | 'At-Risk';
  };
}

export interface AppSettings {
  storeName: string;
  currency: string;
  supportEmail: string;
  supportPhone: string;
  taxRate: number;
  enableKnet: boolean;
  enableCreditCard: boolean;
  deliveryFee: number;
  freeShippingThreshold: number;
  aiProvider?: 'google' | 'openai' | 'grok' | 'perplexity' | 'deepseek';
  socialLinks?: {
    instagram?: string;
    tiktok?: string;
    facebook?: string;
    twitter?: string;
  };
}