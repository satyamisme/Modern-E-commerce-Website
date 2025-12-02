
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

export interface Supplier {
  id: string;
  name: string;
  type: 'Wholesaler' | 'Retailer' | 'Individual' | 'Distributor';
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  notes?: string;
}

export interface InventoryItem {
  id: string;
  imei: string;
  serial?: string;
  costPrice: number;
  condition: 'New' | 'Used' | 'Open Box' | 'Refurbished';
  status: 'Available' | 'Sold' | 'Reserved' | 'Defective';
  purchaseDate?: string;
  supplierId?: string; // Linked to Supplier ID
  supplier?: string; // Deprecated, keeping for backward compatibility
  sourceType?: 'Wholesale' | 'Retailer' | 'Store Transfer' | 'Customer Trade-in';
  locationId?: string; // Track which warehouse this specific item is in
  purchaseOrderId?: string; // Link to the PO
  notes?: string;
}

export interface ProductVariant {
  id: string;
  color: string;
  storage: string;
  price: number;
  stock: number;
  sku?: string;
  barcode?: string;
  imeis?: string[]; // Deprecated in favor of inventory array, kept for backward compat
  inventory?: InventoryItem[]; // Detailed tracking
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
  barcode?: string;
  imeiTracking?: boolean; // Requires scanning IMEI/Serial upon sale
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
  scannedImeis?: string[]; // Track IMEIs for this cart item
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model' | 'system';
  text: string;
}

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export type RoleType = 'User' | 'Shop Admin' | 'Super Admin' | 'Sales' | 'Warehouse Staff';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  phone?: string;
  addresses: Address[];
}

export interface Order {
  id: string;
  date: string;
  total: number;
  status: 'New' | 'Fraud Scan' | 'Processing' | 'Picking' | 'QC' | 'Shipping' | 'Delivered' | 'Returned' | 'Cancelled';
  paymentStatus: 'Paid' | 'Pending' | 'Failed';
  paymentMethod: string;
  items: CartItem[];
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  fraudScore?: number;
}

export interface AppSettings {
  storeName: string;
  currency: string;
  supportEmail: string;
  supportPhone: string;
  taxRate: number;
  enableKnet: boolean;
  enableCreditCard: boolean;
  enableWhatsAppPayment: boolean;
  deliveryFee: number;
  freeShippingThreshold: number;
  aiProvider: 'google' | 'openai' | 'grok' | 'perplexity' | 'deepseek';
  socialLinks?: {
    instagram?: string;
    tiktok?: string;
    facebook?: string;
    twitter?: string;
  };
  hardwareConfig?: {
    defaultCameraId?: string;
    enableKeyboardListener?: boolean;
  };
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
  avatar: string;
  notes?: string;
}

export interface Warehouse {
  id: string;
  name: string;
  location: { address: string };
  capacity: number;
  utilization: number;
  type: 'Main Warehouse' | 'Retail Shop' | 'Online Fulfillment';
  managerId?: string;
  phone?: string;
  openingHours?: string;
}

export interface Permission {
  id: string;
  label: string;
  key: string;
  description: string;
}

export interface RoleDefinition {
  id: string;
  name: string;
  isSystem: boolean;
  description: string;
  permissions: string[];
}

export interface ReturnRequest {
  id: string;
  orderId: string;
  customerEmail: string;
  reason: 'Defective' | 'Wrong Item' | 'Changed Mind' | 'Other';
  condition: 'Sealed' | 'Opened';
  details: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Completed';
  date: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'info' | 'error';
  timestamp: number;
  read: boolean;
}

export interface TransferLog {
  id: string;
  productId: string;
  fromLocationId: string;
  toLocationId: string;
  quantity: number;
  userId: string;
  timestamp: string;
}

export interface PurchaseItem {
  id: string;
  productId: string;
  variantId?: string;
  productName: string;
  sku: string;
  quantity: number;
  costPrice: number;
  totalCost: number;
}

export interface PurchaseOrder {
  id: string;
  supplierId: string;
  warehouseId: string;
  referenceNumber: string; // Manual Ref / Invoice #
  date: string;
  status: 'Draft' | 'Ordered' | 'Received';
  items: PurchaseItem[];
  totalAmount: number;
  notes?: string;
  receivedDate?: string;
}

export enum SortOption {
  Recommended = 'Recommended',
  PriceLowHigh = 'Price: Low to High',
  PriceHighLow = 'Price: High to Low',
}
