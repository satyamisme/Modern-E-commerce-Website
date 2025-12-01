
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

export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  monthlyPrice?: number;
  rating: number;
  reviewsCount?: number;
  category: 'Smartphones' | 'Audio' | 'Wearables' | 'Accessories' | 'Tablets';
  colors: string[];
  specs: {
    screen?: string;
    processor?: string;
    ram?: string;
    storage?: string;
    camera?: string;
    battery?: string;
    batteryLife?: string;
    connectivity?: string;
    features?: string;
    [key: string]: string | undefined;
  };
  description: string;
  imageSeed: number;
  image?: string; // Custom image URL support
  images?: string[]; // Gallery images
  tags: string[];
  express?: boolean;
  stock: number;
  reviews?: Review[];
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  };
}

export interface CartItem extends Product {
  quantity: number;
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

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: 'user' | 'admin';
  addresses: Address[];
}

export interface Order {
  id: string;
  date: string;
  total: number;
  status: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  paymentStatus: 'Pending' | 'Paid' | 'Failed';
  paymentMethod: 'KNET' | 'Credit Card';
  items: CartItem[];
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
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
}
