
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem, ToastMessage, User, Order, Address, Review, AppSettings, CustomerProfile, Warehouse, RoleDefinition, Permission, RoleType, ReturnRequest, Notification, TransferLog, Supplier, PurchaseOrder, InventoryItem } from '../types';
import { PRODUCTS as INITIAL_PRODUCTS } from '../data/products';
import { APP_CONFIG } from '../config';
import { supabase, diagnoseConnection } from '../lib/supabaseClient';

// ... (KEEP ALL CONSTANTS AND INITIAL DATA THE SAME) ...
const DEFAULT_SETTINGS: AppSettings = {
  storeName: APP_CONFIG.storeName,
  currency: APP_CONFIG.currency,
  supportEmail: APP_CONFIG.supportEmail,
  supportPhone: APP_CONFIG.supportPhone,
  taxRate: APP_CONFIG.taxRate,
  enableKnet: true,
  enableCreditCard: true,
  enableWhatsAppPayment: true,
  deliveryFee: APP_CONFIG.deliveryFee,
  freeShippingThreshold: APP_CONFIG.freeShippingThreshold,
  aiProvider: APP_CONFIG.aiProvider,
  socialLinks: {
    instagram: 'https://instagram.com',
    tiktok: 'https://tiktok.com',
    facebook: 'https://facebook.com',
    twitter: 'https://twitter.com'
  },
  hardwareConfig: {
    defaultCameraId: '',
    enableKeyboardListener: false
  }
};

const INITIAL_WAREHOUSES: Warehouse[] = [
  { 
    id: 'WH-MAIN-SHU', 
    name: 'Shuwaikh Central Hub', 
    location: { address: 'Shuwaikh Industrial Area 1, Block 3' }, 
    capacity: 50000, 
    utilization: 85, 
    type: 'Main Warehouse',
    managerId: 'mgr-shuwaikh',
    phone: '+965 50430610',
    openingHours: '24/7'
  },
  { 
    id: 'SH-SAL-01', 
    name: 'Salmiya Flagship', 
    location: { address: 'Al Salam Mall, Salmiya' }, 
    capacity: 2000, 
    utilization: 65, 
    type: 'Retail Shop',
    managerId: 'mgr-salmiya',
    phone: '+965 55463597'
  },
];

const INITIAL_SUPPLIERS: Supplier[] = [
    { id: 'SUP-001', name: 'Global Tech Distribution', type: 'Distributor', contactPerson: 'John Smith', email: 'sales@globaltech.com', phone: '+965 2222 3333', address: 'Free Trade Zone, Kuwait' },
    { id: 'SUP-002', name: 'Al-Ghanim Electronics', type: 'Retailer', contactPerson: 'Ali Ahmed', email: 'b2b@alghanim.com', phone: '+965 1888 888', address: 'Rai, Kuwait' },
];

const INITIAL_ROLES: RoleDefinition[] = [
  { id: 'role-super', name: 'Super Admin', isSystem: true, description: 'Full system access', permissions: ['all'] },
  { id: 'role-shop-admin', name: 'Shop Admin', isSystem: true, description: 'Manage specific store operations', permissions: ['manage_orders', 'manage_inventory', 'view_reports', 'manage_customers'] },
  { id: 'role-sales', name: 'Sales', isSystem: true, description: 'POS and basic order handling', permissions: ['manage_orders', 'view_products'] },
  { id: 'role-warehouse', name: 'Warehouse Staff', isSystem: true, description: 'Inventory and stock transfer', permissions: ['manage_inventory'] }
];

const AVAILABLE_PERMISSIONS: Permission[] = [
  { id: 'p1', label: 'Full Access', key: 'all', description: 'Grant all permissions' },
  { id: 'p2', label: 'Manage Products', key: 'manage_products', description: 'Create, edit, delete products' },
  { id: 'p3', label: 'Manage Orders', key: 'manage_orders', description: 'Process and update orders' },
  { id: 'p4', label: 'Manage Inventory', key: 'manage_inventory', description: 'Stock adjustments and transfers' },
  { id: 'p5', label: 'Manage Users', key: 'manage_users', description: 'Manage customers and staff' },
  { id: 'p6', label: 'Manage Roles', key: 'manage_roles', description: 'Create and assign roles' },
  { id: 'p7', label: 'View Reports', key: 'view_reports', description: 'Access analytics dashboard' },
  { id: 'p8', label: 'System Settings', key: 'manage_settings', description: 'Configure global app settings' },
];

const INITIAL_CUSTOMERS: CustomerProfile[] = [
  { id: 'C-001', name: 'Abdullah Al-Salem', email: 'abdullah@example.com', phone: '+965 9999 1234', joinDate: '2023-01-15', totalSpent: 1450, ordersCount: 5, segment: 'VIP', lastOrderDate: '2024-02-10', avatar: 'https://ui-avatars.com/api/?name=Abdullah', notes: 'Prefers flagship Samsungs' },
  { id: 'C-002', name: 'Sarah Kuwaiti', email: 'sarah@example.com', phone: '+965 6666 5678', joinDate: '2023-11-20', totalSpent: 350, ordersCount: 2, segment: 'Regular', lastOrderDate: '2024-01-05', avatar: 'https://ui-avatars.com/api/?name=Sarah' },
];

interface ShopContextType {
  products: Product[];
  cart: CartItem[];
  wishlist: Product[];
  compareList: Product[];
  recentlyViewed: Product[];
  isCartOpen: boolean;
  searchQuery: string;
  user: User | null;
  orders: Order[];
  customers: CustomerProfile[];
  warehouses: Warehouse[];
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  appSettings: AppSettings;
  roles: RoleDefinition[];
  availablePermissions: Permission[];
  returns: ReturnRequest[];
  notifications: Notification[];
  transferLogs: TransferLog[];
  isOffline: boolean;
  offlineReason: 'NETWORK' | 'AUTH' | 'SCHEMA' | null;
  connectionDetails: any;
  isLoading: boolean;
  
  // Actions
  setSearchQuery: (query: string) => void;
  addToCart: (product: Product & { selectedColor?: string; selectedStorage?: string; scannedImeis?: string[] }) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  toggleCart: () => void;
  clearCart: () => void;
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
  addToCompare: (product: Product) => void;
  removeFromCompare: (productId: string) => void;
  isInCompare: (productId: string) => boolean;
  addToRecentlyViewed: (product: Product) => void;
  
  addReview: (productId: string, review: Omit<Review, 'id' | 'date'>) => void;
  addAddress: (address: Omit<Address, 'id'>) => void;
  removeAddress: (addressId: string) => void;
  createOrder: (orderData: Omit<Order, 'id' | 'date' | 'status' | 'paymentStatus'>) => Order;
  updateUserProfile: (data: Partial<User>) => void;
  
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  deleteOrder: (orderId: string) => void;
  deleteProduct: (productId: string) => void;
  updateProduct: (product: Product) => void;
  addProduct: (product: Product) => void;
  bulkUpsertProducts: (products: Product[]) => Promise<void>;
  uploadImage: (file: File) => Promise<string | null>;
  updateSettings: (settings: AppSettings) => void;
  updateCustomer: (customer: CustomerProfile) => void;
  deleteCustomer: (customerId: string) => void;
  
  addWarehouse: (warehouse: Warehouse) => void;
  updateWarehouse: (warehouse: Warehouse) => void;
  removeWarehouse: (id: string) => void;
  transferStock: (fromId: string, toId: string, productId: string, quantity: number) => void;

  addSupplier: (supplier: Supplier) => void;
  updateSupplier: (supplier: Supplier) => void;
  deleteSupplier: (id: string) => void;

  addPurchaseOrder: (po: PurchaseOrder) => void;
  receivePurchaseOrder: (poId: string, receivedInventory?: InventoryItem[]) => void;

  addRole: (role: RoleDefinition) => void;
  updateRole: (role: RoleDefinition) => void;
  deleteRole: (roleId: string) => void;
  checkPermission: (permissionKey: string) => boolean;
  seedRoles: () => Promise<void>;
  seedDatabase: () => Promise<void>;

  addReturnRequest: (request: Omit<ReturnRequest, 'id' | 'date' | 'status'>) => void;
  updateReturnStatus: (id: string, status: ReturnRequest['status']) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  retryConnection: () => Promise<void>;

  totalAmount: number;
  toast: ToastMessage | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  login: (email: string, password?: string) => Promise<void>;
  logout: () => void;
  register: (name: string, email: string, password?: string) => Promise<void>;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

// Helper to safely parse local storage
const getStoredData = <T,>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (error) {
    console.warn(`Error reading localStorage key "${key}":`, error);
    return fallback;
  }
};

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // ... (State Initialization same as before) ...
  const [isOffline, setIsOffline] = useState(() => {
      const forced = localStorage.getItem('lumina_force_offline');
      return forced === 'true' || APP_CONFIG.useMockData;
  });
  
  const [offlineReason, setOfflineReason] = useState<'NETWORK' | 'AUTH' | 'SCHEMA' | null>(null);
  const [connectionDetails, setConnectionDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [products, setProducts] = useState<Product[]>(() => getStoredData('lumina_products', APP_CONFIG.useMockData ? INITIAL_PRODUCTS : []));
  const [orders, setOrders] = useState<Order[]>(() => getStoredData('lumina_orders', []));
  const [customers, setCustomers] = useState<CustomerProfile[]>(() => getStoredData('lumina_customers', APP_CONFIG.useMockData ? INITIAL_CUSTOMERS : []));
  const [warehouses, setWarehouses] = useState<Warehouse[]>(() => getStoredData('lumina_warehouses', APP_CONFIG.useMockData ? INITIAL_WAREHOUSES : []));
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => getStoredData('lumina_suppliers', APP_CONFIG.useMockData ? INITIAL_SUPPLIERS : []));
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() => getStoredData('lumina_purchase_orders', []));
  const [roles, setRoles] = useState<RoleDefinition[]>(() => getStoredData('lumina_roles', INITIAL_ROLES));
  
  const [appSettings, setAppSettings] = useState<AppSettings>(() => {
      const stored = getStoredData<Partial<AppSettings>>('lumina_settings', {});
      return { ...DEFAULT_SETTINGS, ...stored };
  });

  const [returns, setReturns] = useState<ReturnRequest[]>(() => getStoredData('lumina_returns', []));
  const [notifications, setNotifications] = useState<Notification[]>(() => getStoredData('lumina_notifications', []));
  const [transferLogs, setTransferLogs] = useState<TransferLog[]>([]);

  const [cart, setCart] = useState<CartItem[]>(() => getStoredData('lumina_cart', []));
  const [wishlist, setWishlist] = useState<Product[]>(() => getStoredData('lumina_wishlist', []));
  const [compareList, setCompareList] = useState<Product[]>(() => getStoredData('lumina_compare', []));
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>(() => getStoredData('lumina_recent', []));
  const [user, setUser] = useState<User | null>(() => getStoredData('lumina_user', null));
  
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString();
    setToast({ id, message, type });
    setTimeout(() => setToast(current => current?.id === id ? null : current), 3000);
  };

  // ... (Auth & Data Sync Effects same as before) ...
  useEffect(() => {
    if (!isOffline) {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                const meta = session.user.user_metadata || {};
                setUser({
                    id: session.user.id,
                    name: meta.name || session.user.email?.split('@')[0] || 'User',
                    email: session.user.email || '',
                    role: meta.role || 'User',
                    avatar: meta.avatar || `https://ui-avatars.com/api/?name=${meta.name || 'U'}`,
                    addresses: []
                });
            } else {
                if (user?.id !== 'offline-admin') {
                    setUser(null);
                }
            }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' && session?.user) {
                const meta = session.user.user_metadata || {};
                setUser({
                    id: session.user.id,
                    name: meta.name || session.user.email?.split('@')[0] || 'User',
                    email: session.user.email || '',
                    role: meta.role || 'User',
                    avatar: meta.avatar || `https://ui-avatars.com/api/?name=${meta.name || 'U'}`,
                    addresses: []
                });
            } else if (event === 'SIGNED_OUT') {
                setUser(null);
            }
        });

        return () => subscription.unsubscribe();
    }
  }, [isOffline]);

  // ... (Sanitization & Seeding Functions same as before) ...
  const sanitizeProduct = (p: Product) => {
      const clean: any = { ...p };
      delete clean.selectedColor;
      delete clean.selectedStorage;
      delete clean.quantity;
      clean.originalPrice = clean.originalPrice || null;
      clean.costPrice = clean.costPrice || null;
      clean.monthlyPrice = clean.monthlyPrice || null;
      clean.imageSeed = clean.imageSeed || null;
      clean.reviews = clean.reviews || [];
      clean.variants = clean.variants || [];
      clean.specs = clean.specs || {};
      clean.seo = clean.seo || {};
      return clean;
  };

  const seedRoles = async () => {
      console.log("Seeding default roles...");
      setRoles(INITIAL_ROLES); 
      if (!isOffline) {
          const { error } = await supabase.from('roles').upsert(INITIAL_ROLES.map(r => ({
              id: r.id,
              name: r.name,
              permissions: r.permissions,
              "isSystem": r.isSystem,
              description: r.description
          })));
          if (error) console.error("Error seeding roles:", error);
      }
  };

  const seedDatabase = async () => {
      if (isOffline) {
          showToast('Cannot seed in offline mode', 'error');
          return;
      }
      setIsLoading(true);
      showToast('Seeding Database with Demo Data...', 'info');
      try {
          const cleanProducts = INITIAL_PRODUCTS.map(sanitizeProduct);
          const { error: prodError } = await supabase.from('products').upsert(cleanProducts);
          if (prodError) throw prodError;

          const { error: whError } = await supabase.from('warehouses').upsert(INITIAL_WAREHOUSES);
          if (whError) throw whError;

          const { error: supError } = await supabase.from('suppliers').upsert(INITIAL_SUPPLIERS);
          if (supError) throw supError;

          const { error: custError } = await supabase.from('customers').upsert(INITIAL_CUSTOMERS);
          if (custError) throw custError;

          await seedRoles();

          await checkOnlineStatus();
          showToast('Database Seeded Successfully!', 'success');
      } catch (err: any) {
          console.error("Seeding Error:", err);
          showToast(`Seeding Failed: ${err.message}`, 'error');
      } finally {
          setIsLoading(false);
      }
  };

  const checkOnlineStatus = async () => {
      setIsLoading(true);
      try {
          if (localStorage.getItem('lumina_force_offline') === 'true') {
              setIsOffline(true);
              setOfflineReason('NETWORK');
              setConnectionDetails({ status: 'Forced Offline Mode Active', message: 'You manually entered offline mode via login.' });
              return;
          }

          if (APP_CONFIG.useMockData) {
            setIsOffline(true);
            setOfflineReason(null);
            setConnectionDetails({ status: 'Mock Data Mode Enabled' });
            return;
          }

          const diagnosisPromise = diagnoseConnection();
          const timeoutPromise = new Promise<any>((resolve) => setTimeout(() => resolve({ success: false, code: 'TIMEOUT', message: 'Connection timed out' }), 5000));
          const status = await Promise.race([diagnosisPromise, timeoutPromise]);
          setConnectionDetails(status);
          
          if (status.success) {
            setIsOffline(false);
            setOfflineReason(null);
            try {
                const [prodRes, orderRes, custRes, whRes, supRes, poRes, roleRes, returnRes, settingRes, logRes] = await Promise.all([
                    supabase.from('products').select('*'),
                    supabase.from('orders').select('*'),
                    supabase.from('customers').select('*'),
                    supabase.from('warehouses').select('*'),
                    supabase.from('suppliers').select('*'),
                    supabase.from('purchase_orders').select('*'),
                    supabase.from('roles').select('*'),
                    supabase.from('returns').select('*'),
                    supabase.from('app_settings').select('*').maybeSingle(),
                    supabase.from('transfer_logs').select('*').order('timestamp', { ascending: false }).limit(50)
                ]);

                if (prodRes.data) { setProducts(prodRes.data); localStorage.setItem('lumina_products', JSON.stringify(prodRes.data)); }
                if (orderRes.data) { setOrders(orderRes.data); localStorage.setItem('lumina_orders', JSON.stringify(orderRes.data)); }
                if (custRes.data) { setCustomers(custRes.data); localStorage.setItem('lumina_customers', JSON.stringify(custRes.data)); }
                if (whRes.data) { setWarehouses(whRes.data); localStorage.setItem('lumina_warehouses', JSON.stringify(whRes.data)); }
                if (supRes.data) { setSuppliers(supRes.data); localStorage.setItem('lumina_suppliers', JSON.stringify(supRes.data)); }
                if (poRes.data) { setPurchaseOrders(poRes.data); localStorage.setItem('lumina_purchase_orders', JSON.stringify(poRes.data)); }
                if (roleRes.data && roleRes.data.length > 0) { setRoles(roleRes.data); localStorage.setItem('lumina_roles', JSON.stringify(roleRes.data)); }
                if (returnRes.data) { setReturns(returnRes.data); localStorage.setItem('lumina_returns', JSON.stringify(returnRes.data)); }
                if (settingRes.data) { 
                    const mergedSettings = { ...DEFAULT_SETTINGS, ...settingRes.data };
                    setAppSettings(mergedSettings);
                    localStorage.setItem('lumina_settings', JSON.stringify(mergedSettings));
                }
                if (logRes.data) { setTransferLogs(logRes.data); }
            } catch (err: any) {
                console.error("Data Sync Error:", err);
                setConnectionDetails((prev: any) => ({ ...prev, syncError: err.message }));
                showToast("Connected, but failed to sync some data.", "error");
            }
          } else {
            console.warn(`Connection failed: ${status.message} (${status.code})`);
            setIsOffline(true);
            if (status.code === 'NO_SCHEMA') { setOfflineReason('SCHEMA'); showToast("Database tables missing.", "info"); }
            else if (status.code === 'AUTH_FAIL') { setOfflineReason('AUTH'); showToast("API Credentials Invalid.", "error"); }
            else { setOfflineReason('NETWORK'); showToast("Offline Mode: Using local database", "info"); }
          }
      } catch (err) {
          console.error("Critical ShopContext Initialization Error", err);
          setIsOffline(true); 
      } finally {
          setIsLoading(false);
      }
  };

  // ... (Realtime Subs & Storage Effects same as before) ...
  useEffect(() => {
    if (isOffline) return;
    const channel = supabase.channel('realtime_global')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
         if (payload.eventType === 'INSERT') {
            const newOrder = payload.new as Order;
            setOrders(prev => [newOrder, ...prev]);
            showToast(`New Order Received: ${newOrder.id}`, 'info');
            setNotifications(prev => [{ id: `notif-${Date.now()}`, title: 'New Order', message: `Order ${newOrder.id} placed by ${newOrder.customer.name}`, type: 'success', timestamp: Date.now(), read: false }, ...prev]);
         } else if (payload.eventType === 'UPDATE') {
            setOrders(prev => prev.map(o => o.id === (payload.new as Order).id ? (payload.new as Order) : o));
         } else if (payload.eventType === 'DELETE') {
            setOrders(prev => prev.filter(o => o.id !== payload.old.id));
         }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, (payload) => {
         if (payload.eventType === 'INSERT') setProducts(prev => [payload.new as Product, ...prev]);
         else if (payload.eventType === 'UPDATE') setProducts(prev => prev.map(p => p.id === (payload.new as Product).id ? (payload.new as Product) : p));
         else if (payload.eventType === 'DELETE') setProducts(prev => prev.filter(p => p.id !== payload.old.id));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transfer_logs' }, (payload) => {
         if (payload.eventType === 'INSERT') setTransferLogs(prev => [payload.new as TransferLog, ...prev]);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [isOffline]);

  useEffect(() => { localStorage.setItem('lumina_cart', JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem('lumina_wishlist', JSON.stringify(wishlist)); }, [wishlist]);
  useEffect(() => { localStorage.setItem('lumina_compare', JSON.stringify(compareList)); }, [compareList]);
  useEffect(() => { localStorage.setItem('lumina_recent', JSON.stringify(recentlyViewed)); }, [recentlyViewed]);
  useEffect(() => { localStorage.setItem('lumina_warehouses', JSON.stringify(warehouses)); }, [warehouses]);
  useEffect(() => { localStorage.setItem('lumina_suppliers', JSON.stringify(suppliers)); }, [suppliers]);
  useEffect(() => { localStorage.setItem('lumina_purchase_orders', JSON.stringify(purchaseOrders)); }, [purchaseOrders]);
  useEffect(() => { if (user) localStorage.setItem('lumina_user', JSON.stringify(user)); }, [user]);
  useEffect(() => { checkOnlineStatus(); }, []);

  // --- Actions ---
  const retryConnection = async () => { await checkOnlineStatus(); };

  const uploadImage = async (file: File): Promise<string | null> => {
      if (isOffline) { showToast("Cannot upload images in Offline Mode", "error"); return null; }
      try {
          const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
          const { error } = await supabase.storage.from('product-images').upload(fileName, file);
          if (error) throw error;
          const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(fileName);
          return publicUrl;
      } catch (err: any) { console.error("Upload Error:", err); showToast(`Upload failed: ${err.message}`, "error"); return null; }
  };

  const bulkUpsertProducts = async (productsToImport: Product[]) => {
      if (productsToImport.length === 0) return;
      const sanitized = productsToImport.map(sanitizeProduct);
      setProducts(prev => {
          const newMap = new Map(prev.map(p => [p.id, p]));
          productsToImport.forEach(p => newMap.set(p.id, p));
          return Array.from(newMap.values());
      });
      if (!isOffline) {
          const { error } = await supabase.from('products').upsert(sanitized);
          if (error) showToast(`Import failed: ${error.message}`, 'error');
          else showToast(`Imported ${productsToImport.length} products!`, 'success');
      } else { showToast(`Imported ${productsToImport.length} products locally.`, 'info'); }
  };

  const addProduct = async (product: Product) => {
     setProducts(prev => [product, ...prev]);
     if (!isOffline) {
        const { error } = await supabase.from('products').insert([sanitizeProduct(product)]);
        if (error) showToast(`Cloud save failed: ${error.message}`, 'error');
     }
     showToast('Product added successfully', 'success');
  };

  const updateProduct = async (product: Product) => {
     setProducts(prev => prev.map(p => p.id === product.id ? product : p));
     if (!isOffline) {
        const { error } = await supabase.from('products').update(sanitizeProduct(product)).eq('id', product.id);
        if (error) showToast(`Update failed: ${error.message}`, 'error');
     }
     showToast('Product updated', 'success');
  };

  const deleteProduct = async (productId: string) => {
     setProducts(prev => prev.filter(p => p.id !== productId));
     if (!isOffline) await supabase.from('products').delete().eq('id', productId);
     showToast('Product deleted', 'info');
  };

  const createOrder = (orderData: Omit<Order, 'id' | 'date' | 'status' | 'paymentStatus'>) => {
    const newOrder: Order = {
      ...orderData,
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}-${Date.now().toString().slice(-4)}`,
      date: new Date().toISOString().split('T')[0],
      status: 'New',
      paymentStatus: orderData.paymentMethod === 'WhatsApp Checkout' ? 'Pending' : 'Paid',
      fraudScore: 5
    };
    setOrders(prev => [newOrder, ...prev]);
    setProducts(prev => prev.map(p => {
      const orderedItem = orderData.items.find(i => i.id === p.id);
      if(orderedItem) { 
         const newStock = Math.max(0, p.stock - orderedItem.quantity);
         if (!isOffline) supabase.from('products').update({ stock: newStock }).eq('id', p.id);
         return { ...p, stock: newStock }; 
      }
      return p;
    }));
    if (!isOffline) supabase.from('orders').insert([newOrder]);
    return newOrder;
  };

  const addToCart = (product: Product & { selectedColor?: string; selectedStorage?: string; scannedImeis?: string[] }) => {
    setCart(prev => {
      const cartItemId = `${product.id}-${product.selectedColor || ''}-${product.selectedStorage || ''}`;
      const existing = prev.find(item => `${item.id}-${item.selectedColor || ''}-${item.selectedStorage || ''}` === cartItemId);
      const currentStock = products.find(p => p.id === product.id)?.stock || 0;

      if (existing) {
        if (existing.quantity + 1 > currentStock) { showToast(`Only ${currentStock} units available`, 'error'); return prev; }
        showToast(`Updated quantity`, 'info');
        return prev.map(item => `${item.id}-${item.selectedColor || ''}-${item.selectedStorage || ''}` === cartItemId ? { ...item, quantity: item.quantity + 1 } : item);
      }
      if (currentStock < 1) { showToast('Item out of stock', 'error'); return prev; }
      showToast('Added to cart', 'success');
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string) => { setCart(prev => prev.filter(item => item.id !== productId)); showToast('Item removed', 'info'); };
  const updateQuantity = (productId: string, quantity: number) => { if (quantity < 1) { removeFromCart(productId); return; } setCart(prev => prev.map(item => item.id === productId ? { ...item, quantity } : item)); };
  const toggleCart = () => setIsCartOpen(!isCartOpen);
  const clearCart = () => setCart([]);
  const toggleWishlist = (product: Product) => setWishlist(prev => prev.find(p => p.id === product.id) ? prev.filter(p => p.id !== product.id) : [...prev, product]);
  const isInWishlist = (productId: string) => wishlist.some(p => p.id === productId);
  const addToCompare = (product: Product) => setCompareList(prev => prev.find(p => p.id === product.id) ? prev : prev.length >= 3 ? prev : [...prev, product]);
  const removeFromCompare = (productId: string) => setCompareList(prev => prev.filter(p => p.id !== productId));
  const isInCompare = (productId: string) => compareList.some(p => p.id === productId);
  const addToRecentlyViewed = (product: Product) => setRecentlyViewed(prev => [product, ...prev.filter(p => p.id !== product.id)].slice(0, 10));

  const login = async (email: string, password?: string) => {
    if (APP_CONFIG.useMockData) {
        let role: RoleType = 'User';
        if (email.includes('admin')) role = 'Shop Admin';
        if (email.includes('super')) role = 'Super Admin';
        setUser({ id: `u-${Date.now()}`, name: email.split('@')[0], email, avatar: `https://ui-avatars.com/api/?name=${email}`, role, addresses: [] });
        return;
    }
    try {
        const { error } = await supabase.auth.signInWithPassword({ email, password: password || 'password' });
        if (error) throw error;
        showToast('Logged in successfully', 'success');
    } catch (error: any) {
        if (localStorage.getItem('lumina_force_offline') === 'true') {
             setUser({ id: 'offline-admin', name: 'Offline Admin', email, avatar: `https://ui-avatars.com/api/?name=${email}`, role: 'Super Admin', addresses: [] });
             showToast('Logged in (Offline Mode)', 'info');
        } else {
             // Retry online first before forcing offline
             showToast(error.message, 'error');
        }
    }
  };

  const logout = async () => { localStorage.removeItem('lumina_force_offline'); if (!isOffline) await supabase.auth.signOut(); setUser(null); showToast('Logged out', 'info'); setTimeout(() => window.location.reload(), 500); };
  const register = async (name: string, email: string, password?: string) => {
     if (isOffline) { setUser({ id: `u-${Date.now()}`, name, email, avatar: `https://ui-avatars.com/api/?name=${name}`, role: 'User', addresses: [] }); return; }
     try {
         const { error } = await supabase.auth.signUp({ email, password: password || 'password', options: { data: { name, role: 'User' } } });
         if (error) throw error;
         showToast('Account created! Please sign in.', 'success');
     } catch (error: any) { showToast(error.message, 'error'); }
  };

  const checkPermission = (permissionKey: string): boolean => {
    if (!user) return false;
    if (user.role === 'Super Admin') return true;
    if (roles.length === 0 && (user.email.includes('admin') || user.email.includes('super'))) return true; 
    const roleDef = roles.find(r => r.name === user.role);
    if (!roleDef) return (user.email.includes('admin') || user.email.includes('super'));
    return roleDef.permissions.includes('all') || roleDef.permissions.includes(permissionKey);
  };

  const addReview = (productId: string, review: Omit<Review, 'id' | 'date'>) => { setProducts(prev => prev.map(p => p.id === productId ? { ...p, reviewsCount: (p.reviewsCount || 0) + 1 } : p)); showToast('Review submitted', 'success'); };
  const addAddress = (address: Omit<Address, 'id'>) => { if (user) setUser({ ...user, addresses: [...user.addresses, { ...address, id: `addr-${Date.now()}` }] }); };
  const removeAddress = (id: string) => { if (user) setUser({ ...user, addresses: user.addresses.filter(a => a.id !== id) }); };
  const updateUserProfile = (data: Partial<User>) => { if (user) { setUser({ ...user, ...data }); showToast('Profile updated', 'success'); } };
  
  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
     setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
     if (!isOffline) await supabase.from('orders').update({ status }).eq('id', orderId);
     showToast(`Order status updated to ${status}`, 'success');
  };
  const deleteOrder = async (orderId: string) => {
     setOrders(prev => prev.filter(o => o.id !== orderId));
     if (!isOffline) await supabase.from('orders').delete().eq('id', orderId);
     showToast('Order deleted', 'info');
  };
  const updateSettings = async (settings: AppSettings) => {
     setAppSettings(settings);
     if (!isOffline) await supabase.from('app_settings').upsert(settings);
     showToast('Settings saved', 'success');
  };
  const updateCustomer = async (customer: CustomerProfile) => {
     setCustomers(prev => prev.map(c => c.id === customer.id ? customer : c));
     if (!isOffline) await supabase.from('customers').upsert(customer);
     showToast('Customer updated', 'success');
  };
  const deleteCustomer = async (customerId: string) => {
     setCustomers(prev => prev.filter(c => c.id !== customerId));
     if (!isOffline) await supabase.from('customers').delete().eq('id', customerId);
     showToast('Customer deleted', 'info');
  };
  const addRole = async (role: RoleDefinition) => {
     setRoles(prev => [...prev, role]);
     if (!isOffline) await supabase.from('roles').insert({ id: role.id, name: role.name, permissions: role.permissions, "isSystem": role.isSystem, description: role.description });
     showToast('Role created', 'success');
  };
  const updateRole = async (role: RoleDefinition) => {
     setRoles(prev => prev.map(r => r.id === role.id ? role : r));
     if (!isOffline) await supabase.from('roles').update({ name: role.name, permissions: role.permissions, description: role.description }).eq('id', role.id);
     showToast('Role updated', 'success');
  };
  const deleteRole = async (roleId: string) => {
     setRoles(prev => prev.filter(r => r.id !== roleId));
     if (!isOffline) await supabase.from('roles').delete().eq('id', roleId);
     showToast('Role deleted', 'info');
  };
  const addWarehouse = async (warehouse: Warehouse) => { setWarehouses(prev => [...prev, warehouse]); if (!isOffline) await supabase.from('warehouses').insert(warehouse); showToast('Location added', 'success'); };
  const updateWarehouse = async (warehouse: Warehouse) => { setWarehouses(prev => prev.map(w => w.id === warehouse.id ? warehouse : w)); if (!isOffline) await supabase.from('warehouses').update(warehouse).eq('id', warehouse.id); showToast('Location updated', 'success'); };
  const removeWarehouse = async (id: string) => { if (warehouses.length <= 1) { showToast('Cannot remove last location', 'error'); return; } setWarehouses(prev => prev.filter(w => w.id !== id)); if (!isOffline) await supabase.from('warehouses').delete().eq('id', id); showToast('Location removed', 'info'); };
  const addSupplier = async (supplier: Supplier) => { setSuppliers(prev => [...prev, supplier]); if (!isOffline) await supabase.from('suppliers').insert(supplier); showToast('Supplier added', 'success'); };
  const updateSupplier = async (supplier: Supplier) => { setSuppliers(prev => prev.map(s => s.id === supplier.id ? supplier : s)); if (!isOffline) await supabase.from('suppliers').update(supplier).eq('id', supplier.id); showToast('Supplier updated', 'success'); };
  const deleteSupplier = async (id: string) => { setSuppliers(prev => prev.filter(s => s.id !== id)); if (!isOffline) await supabase.from('suppliers').delete().eq('id', id); showToast('Supplier deleted', 'info'); };
  
  const addPurchaseOrder = async (po: PurchaseOrder) => { setPurchaseOrders(prev => [po, ...prev]); if (!isOffline) await supabase.from('purchase_orders').insert(po); showToast('Purchase Order Created', 'success'); };
  
  const receivePurchaseOrder = async (poId: string, receivedInventory: InventoryItem[] = []) => {
      // 1. Find PO
      const po = purchaseOrders.find(p => p.id === poId);
      if (!po) return;

      // 2. Update PO Status
      setPurchaseOrders(prev => prev.map(p => p.id === poId ? { ...p, status: 'Received', receivedDate: new Date().toISOString() } : p));
      if (!isOffline) await supabase.from('purchase_orders').update({ status: 'Received', "receivedDate": new Date().toISOString() }).eq('id', poId);
      
      // 3. Attempt to auto-increment stock for NON-TRACKED items
      // For tracked items, we assume they must be scanned individually via Inventory Manager, 
      // but we can at least increment the base counts here if the user chooses "Quick Receive".
      // Note: In a strict system, we wouldn't do this for tracked items without scanning.
      // Here we will simply update the products to reflect the incoming quantity for simple items.
      
      const updates = new Map<string, Product>();
      
      po.items.forEach(item => {
          const product = products.find(p => p.id === item.productId);
          if (product && !product.imeiTracking) {
              // For non-tracked items, simply increase stock
              let p = updates.get(product.id) || product;
              if (item.variantId) {
                  const newVariants = p.variants?.map(v => v.id === item.variantId ? { ...v, stock: (v.stock || 0) + item.quantity } : v) || [];
                  p = { ...p, variants: newVariants };
              }
              p = { ...p, stock: (p.stock || 0) + item.quantity };
              updates.set(p.id, p);
          }
      });

      // Commit updates
      updates.forEach(async (p) => {
          setProducts(prev => prev.map(prod => prod.id === p.id ? p : prod));
          if (!isOffline) await supabase.from('products').update({ stock: p.stock, variants: p.variants }).eq('id', p.id);
      });

      showToast('Purchase Order marked as Received. Inventory updated for non-tracked items.', 'success');
  };

  const addReturnRequest = (req: Omit<ReturnRequest, 'id'|'date'|'status'>) => {
      const newReq: ReturnRequest = { ...req, id: `RET-${Date.now()}`, date: new Date().toISOString().split('T')[0], status: 'Pending' };
      setReturns(prev => [newReq, ...prev]);
      if (!isOffline) supabase.from('returns').insert(newReq);
  };
  const updateReturnStatus = async (id: string, status: ReturnRequest['status']) => {
      setReturns(prev => prev.map(r => r.id === id ? { ...r, status } : r));
      if (!isOffline) await supabase.from('returns').update({ status }).eq('id', id);
      
      if (status === 'Approved') {
          const req = returns.find(r => r.id === id);
          if (req) updateOrderStatus(req.orderId, 'Returned');
      }
      showToast(`Return ${status}`, 'success');
  };
  const markNotificationRead = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const clearNotifications = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  
  const transferStock = async (fromId: string, toId: string, productId: string, quantity: number) => {
      if (!user) return;
      const log: TransferLog = { id: `trf-${Date.now()}`, productId, fromLocationId: fromId, toLocationId: toId, quantity, userId: user.id, timestamp: new Date().toISOString() };
      setTransferLogs(prev => [log, ...prev]);
      if (!isOffline) await supabase.from('transfer_logs').insert(log);
      showToast('Stock transferred successfully', 'success');
  };

  const value = {
    products, cart, wishlist, compareList, recentlyViewed, isCartOpen, searchQuery, user, orders, customers, warehouses, suppliers, purchaseOrders, appSettings, roles, availablePermissions: AVAILABLE_PERMISSIONS, returns, notifications, transferLogs, isOffline, offlineReason, connectionDetails, isLoading,
    setSearchQuery, addToCart, removeFromCart, updateQuantity, toggleCart, clearCart, toggleWishlist, isInWishlist, addToCompare, removeFromCompare, isInCompare, addToRecentlyViewed, addReview, addAddress, removeAddress, createOrder, updateUserProfile, updateOrderStatus, deleteOrder, deleteProduct, updateProduct, addProduct, bulkUpsertProducts, uploadImage, updateSettings, updateCustomer, deleteCustomer, addWarehouse, updateWarehouse, removeWarehouse, transferStock, addSupplier, updateSupplier, deleteSupplier, addPurchaseOrder, receivePurchaseOrder, addRole, updateRole, deleteRole, checkPermission, seedRoles, seedDatabase, addReturnRequest, updateReturnStatus, markNotificationRead, clearNotifications, retryConnection,
    totalAmount: cart.reduce((total, item) => total + item.price * item.quantity, 0),
    toast, showToast, login, logout, register
  };

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) throw new Error('useShop must be used within a ShopProvider');
  return context;
};
