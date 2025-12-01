

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem, ToastMessage, User, Order, Address, Review, AppSettings, CustomerProfile, Warehouse, RoleDefinition, Permission, RoleType, ReturnRequest, Notification } from '../types';
import { PRODUCTS as INITIAL_PRODUCTS } from '../data/products';
import { APP_CONFIG } from '../config';
import { supabase, diagnoseConnection } from '../lib/supabaseClient';

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
  appSettings: AppSettings;
  roles: RoleDefinition[];
  availablePermissions: Permission[];
  returns: ReturnRequest[];
  notifications: Notification[];
  isOffline: boolean;
  offlineReason: 'NETWORK' | 'AUTH' | 'SCHEMA' | null;
  
  // Actions
  setSearchQuery: (query: string) => void;
  addToCart: (product: Product & { selectedColor?: string; selectedStorage?: string }) => void;
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
  updateSettings: (settings: AppSettings) => void;
  updateCustomer: (customer: CustomerProfile) => void;
  
  addWarehouse: (warehouse: Warehouse) => void;
  updateWarehouse: (warehouse: Warehouse) => void;
  removeWarehouse: (id: string) => void;

  addRole: (role: RoleDefinition) => void;
  updateRole: (role: RoleDefinition) => void;
  deleteRole: (roleId: string) => void;
  checkPermission: (permissionKey: string) => boolean;
  seedRoles: () => Promise<void>;

  addReturnRequest: (request: Omit<ReturnRequest, 'id' | 'date' | 'status'>) => void;
  updateReturnStatus: (id: string, status: ReturnRequest['status']) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  retryConnection: () => Promise<void>;

  totalAmount: number;
  toast: ToastMessage | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  login: (email: string) => void;
  logout: () => void;
  register: (name: string, email: string) => void;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State Initialization
  const [isOffline, setIsOffline] = useState(APP_CONFIG.useMockData);
  const [offlineReason, setOfflineReason] = useState<'NETWORK' | 'AUTH' | 'SCHEMA' | null>(null);

  const [products, setProducts] = useState<Product[]>(APP_CONFIG.useMockData ? INITIAL_PRODUCTS : []);
  const [cart, setCart] = useState<CartItem[]>(() => JSON.parse(localStorage.getItem('lumina_cart') || '[]'));
  const [wishlist, setWishlist] = useState<Product[]>(() => JSON.parse(localStorage.getItem('lumina_wishlist') || '[]'));
  const [compareList, setCompareList] = useState<Product[]>(() => JSON.parse(localStorage.getItem('lumina_compare') || '[]'));
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>(() => JSON.parse(localStorage.getItem('lumina_recent') || '[]'));
  const [user, setUser] = useState<User | null>(() => JSON.parse(localStorage.getItem('lumina_user') || 'null'));
  const [appSettings, setAppSettings] = useState<AppSettings>(() => JSON.parse(localStorage.getItem('lumina_settings') || JSON.stringify(DEFAULT_SETTINGS)));
  const [roles, setRoles] = useState<RoleDefinition[]>(() => JSON.parse(localStorage.getItem('lumina_roles') || JSON.stringify(INITIAL_ROLES)));
  const [orders, setOrders] = useState<Order[]>(() => {
     if (APP_CONFIG.useMockData) return JSON.parse(localStorage.getItem('lumina_orders') || '[]');
     return [];
  });
  const [customers, setCustomers] = useState<CustomerProfile[]>(APP_CONFIG.useMockData ? INITIAL_CUSTOMERS : []);
  const [warehouses, setWarehouses] = useState<Warehouse[]>(APP_CONFIG.useMockData ? INITIAL_WAREHOUSES : []);
  const [returns, setReturns] = useState<ReturnRequest[]>(() => JSON.parse(localStorage.getItem('lumina_returns') || '[]'));
  const [notifications, setNotifications] = useState<Notification[]>(() => JSON.parse(localStorage.getItem('lumina_notifications') || '[]'));
  
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString();
    setToast({ id, message, type });
    setTimeout(() => setToast(current => current?.id === id ? null : current), 3000);
  };

  const loadOfflineData = () => {
      console.log("Initializing Offline Database...");
      
      const storedProds = localStorage.getItem('lumina_products');
      setProducts(storedProds ? JSON.parse(storedProds) : INITIAL_PRODUCTS);

      const storedOrders = localStorage.getItem('lumina_orders');
      setOrders(storedOrders ? JSON.parse(storedOrders) : []);

      const storedCustomers = localStorage.getItem('lumina_customers');
      setCustomers(storedCustomers ? JSON.parse(storedCustomers) : INITIAL_CUSTOMERS);

      const storedWarehouses = localStorage.getItem('lumina_warehouses');
      setWarehouses(storedWarehouses ? JSON.parse(storedWarehouses) : INITIAL_WAREHOUSES);

      const storedRoles = localStorage.getItem('lumina_roles');
      setRoles(storedRoles ? JSON.parse(storedRoles) : INITIAL_ROLES);
  };

  const seedRoles = async () => {
      console.log("Seeding default roles...");
      setRoles(INITIAL_ROLES); 
      if (!isOffline) {
          await supabase.from('roles').upsert(INITIAL_ROLES.map(r => ({
              id: r.id,
              name: r.name,
              permissions: r.permissions,
              is_system: r.isSystem,
              description: r.description
          })));
      }
  };

  const checkOnlineStatus = async () => {
      // 1. Explicit Mock Mode
      if (APP_CONFIG.useMockData) {
        setIsOffline(true);
        setOfflineReason(null);
        return;
      }

      // 2. Try Connecting with Diagnostics
      const status = await diagnoseConnection();
      
      if (status.success) {
        setIsOffline(false);
        setOfflineReason(null);
        // Fetch Real Data from Supabase
        const { data: prodData } = await supabase.from('products').select('*');
        if (prodData && prodData.length > 0) setProducts(prodData);

        const { data: orderData } = await supabase.from('orders').select('*');
        if (orderData) setOrders(orderData);

        const { data: custData } = await supabase.from('customers').select('*');
        if (custData) setCustomers(custData);

        const { data: whData } = await supabase.from('warehouses').select('*');
        if (whData) setWarehouses(whData);

        // Fetch Roles - Auto Seed if Empty
        const { data: roleData } = await supabase.from('roles').select('*');
        if (roleData && roleData.length > 0) {
            setRoles(roleData);
        } else {
            console.log("Empty roles table detected.");
            setRoles(INITIAL_ROLES); // Use initial roles in memory while waiting for seed
        }

        const { data: settingData } = await supabase.from('app_settings').select('*').single();
        if (settingData) setAppSettings(prev => ({...prev, ...settingData}));

        showToast("Connected to Online Database", "success");

      } else {
        // 3. Fallback to Offline with specific error
        console.warn(`Connection failed: ${status.message} (${status.code})`);
        setIsOffline(true);
        loadOfflineData();
        
        // Show informative toast about WHY we are offline
        if (status.code === 'NO_SCHEMA') {
            setOfflineReason('SCHEMA');
            showToast("Database connected but tables missing. Setup required.", "info");
        } else if (status.code === 'AUTH_FAIL') {
            setOfflineReason('AUTH');
            showToast("API Credentials Invalid. Using local mode.", "error");
        } else {
            setOfflineReason('NETWORK');
            showToast("Offline Mode: Using local database", "info");
        }
      }
  };

  // --- Initialization ---
  useEffect(() => {
    checkOnlineStatus();
  }, []);

  // --- Persistence & Sync ---
  // User data always persists locally
  useEffect(() => { localStorage.setItem('lumina_cart', JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem('lumina_wishlist', JSON.stringify(wishlist)); }, [wishlist]);
  useEffect(() => { localStorage.setItem('lumina_compare', JSON.stringify(compareList)); }, [compareList]);
  useEffect(() => { localStorage.setItem('lumina_recent', JSON.stringify(recentlyViewed)); }, [recentlyViewed]);
  
  // Admin Data Persistence (Only if Offline)
  useEffect(() => { if (isOffline) localStorage.setItem('lumina_products', JSON.stringify(products)); }, [products, isOffline]);
  useEffect(() => { if (isOffline) localStorage.setItem('lumina_orders', JSON.stringify(orders)); }, [orders, isOffline]);
  useEffect(() => { if (isOffline) localStorage.setItem('lumina_roles', JSON.stringify(roles)); }, [roles, isOffline]);
  useEffect(() => { if (isOffline) localStorage.setItem('lumina_warehouses', JSON.stringify(warehouses)); }, [warehouses, isOffline]);
  useEffect(() => { if (isOffline) localStorage.setItem('lumina_settings', JSON.stringify(appSettings)); }, [appSettings, isOffline]);
  useEffect(() => { if (isOffline) localStorage.setItem('lumina_customers', JSON.stringify(customers)); }, [customers, isOffline]);

  useEffect(() => { 
    if(user) localStorage.setItem('lumina_user', JSON.stringify(user));
    else localStorage.removeItem('lumina_user');
  }, [user]);

  // --- Actions with Backend Integration ---

  const addProduct = async (product: Product) => {
     setProducts(prev => [product, ...prev]);
     if (!isOffline) {
        const { error } = await supabase.from('products').insert([product]);
        if (error) {
           console.error('Supabase Error:', error);
           showToast('Failed to save to cloud (Saved locally)', 'error');
        }
     }
     showToast('Product added successfully', 'success');
  };

  const updateProduct = async (product: Product) => {
     setProducts(prev => prev.map(p => p.id === product.id ? product : p));
     if (!isOffline) {
        await supabase.from('products').update(product).eq('id', product.id);
     }
     showToast('Product updated', 'success');
  };

  const deleteProduct = async (productId: string) => {
     setProducts(prev => prev.filter(p => p.id !== productId));
     if (!isOffline) {
        await supabase.from('products').delete().eq('id', productId);
     }
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
    
    // Reduce Stock
    setProducts(prev => prev.map(p => {
      const orderedItem = orderData.items.find(i => i.id === p.id);
      if(orderedItem) { 
         const newStock = Math.max(0, p.stock - orderedItem.quantity);
         if (!isOffline) {
             supabase.from('products').update({ stock: newStock }).eq('id', p.id);
         }
         return { ...p, stock: newStock }; 
      }
      return p;
    }));

    if (!isOffline) {
       supabase.from('orders').insert([newOrder]);
    }

    return newOrder;
  };

  // Standard Context Actions
  const addToCart = (product: Product & { selectedColor?: string; selectedStorage?: string }) => {
    setCart(prev => {
      const cartItemId = `${product.id}-${product.selectedColor || ''}-${product.selectedStorage || ''}`;
      const existing = prev.find(item => {
          const existingId = `${item.id}-${item.selectedColor || ''}-${item.selectedStorage || ''}`;
          return existingId === cartItemId;
      });
      const currentStock = products.find(p => p.id === product.id)?.stock || 0;

      if (existing) {
        if (existing.quantity + 1 > currentStock) {
          showToast(`Only ${currentStock} units available`, 'error');
          return prev;
        }
        showToast(`Updated quantity`, 'info');
        return prev.map(item => {
           const itemId = `${item.id}-${item.selectedColor || ''}-${item.selectedStorage || ''}`;
           return itemId === cartItemId ? { ...item, quantity: item.quantity + 1 } : item;
        });
      }
      if (currentStock < 1) {
        showToast('Item out of stock', 'error');
        return prev;
      }
      showToast('Added to cart', 'success');
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
    showToast('Item removed', 'info');
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) { removeFromCart(productId); return; }
    setCart(prev => prev.map(item => item.id === productId ? { ...item, quantity } : item));
  };

  const toggleCart = () => setIsCartOpen(!isCartOpen);
  const clearCart = () => setCart([]);

  const toggleWishlist = (product: Product) => {
    setWishlist(prev => {
      const exists = prev.find(p => p.id === product.id);
      if (exists) { showToast('Removed from wishlist', 'info'); return prev.filter(p => p.id !== product.id); }
      showToast('Added to wishlist', 'success'); return [...prev, product];
    });
  };

  const isInWishlist = (productId: string) => wishlist.some(p => p.id === productId);

  const addToCompare = (product: Product) => {
    setCompareList(prev => {
      if (prev.find(p => p.id === product.id)) return prev;
      if (prev.length >= 3) { showToast('Max 3 items for comparison', 'error'); return prev; }
      showToast('Added to compare', 'success'); return [...prev, product];
    });
  };

  const removeFromCompare = (productId: string) => setCompareList(prev => prev.filter(p => p.id !== productId));
  const isInCompare = (productId: string) => compareList.some(p => p.id === productId);

  const addToRecentlyViewed = (product: Product) => {
    setRecentlyViewed(prev => [product, ...prev.filter(p => p.id !== product.id)].slice(0, 10));
  };

  // Auth & User
  const login = (email: string) => {
    let role: RoleType = 'User';
    if (email.includes('admin')) role = 'Shop Admin';
    if (email.includes('super')) role = 'Super Admin';
    
    setUser({
      id: `u-${Date.now()}`,
      name: email.split('@')[0],
      email,
      avatar: `https://ui-avatars.com/api/?name=${email}`,
      role,
      addresses: []
    });
    showToast(`Welcome back!`, 'success');
  };

  const logout = () => { setUser(null); showToast('Logged out', 'info'); };
  const register = (name: string, email: string) => {
     setUser({ id: `u-${Date.now()}`, name, email, avatar: `https://ui-avatars.com/api/?name=${name}`, role: 'User', addresses: [] });
     showToast('Account created', 'success');
  };

  const checkPermission = (permissionKey: string): boolean => {
    if (!user) return false;
    
    // FAILSAFE 1: Super Admin always has access, even if Roles table is empty/missing
    if (user.role === 'Super Admin') return true;

    // FAILSAFE 2: If roles are not loaded yet (empty array), and user is an admin, allow access to settings/system
    if (roles.length === 0 && (user.email.includes('admin') || user.email.includes('super'))) {
        return true; 
    }

    const roleDef = roles.find(r => r.name === user.role);
    if (!roleDef) {
       // If role is defined in User object but missing in DB roles table, allow if email looks like admin
       if (user.email.includes('admin') || user.email.includes('super')) return true;
       return false;
    }
    if (roleDef.permissions.includes('all')) return true;
    return roleDef.permissions.includes(permissionKey);
  };

  // Other Actions
  const addReview = (productId: string, review: Omit<Review, 'id' | 'date'>) => {
     setProducts(prev => prev.map(p => {
        if (p.id === productId) {
           return { ...p, reviewsCount: (p.reviewsCount || 0) + 1 };
        }
        return p;
     }));
     showToast('Review submitted', 'success');
  };

  const addAddress = (address: Omit<Address, 'id'>) => {
     if (user) setUser({ ...user, addresses: [...user.addresses, { ...address, id: `addr-${Date.now()}` }] });
  };
  
  const removeAddress = (id: string) => {
     if (user) setUser({ ...user, addresses: user.addresses.filter(a => a.id !== id) });
  };

  const updateUserProfile = (data: Partial<User>) => {
     if (user) {
        setUser({ ...user, ...data });
        showToast('Profile updated', 'success');
     }
  };

  // Admin Actions (Optimistic + DB)
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

  const addRole = async (role: RoleDefinition) => {
     setRoles(prev => [...prev, role]);
     if (!isOffline) await supabase.from('roles').insert(role);
     showToast('Role created', 'success');
  };

  const updateRole = async (role: RoleDefinition) => {
     setRoles(prev => prev.map(r => r.id === role.id ? role : r));
     if (!isOffline) await supabase.from('roles').update(role).eq('id', role.id);
     showToast('Role updated', 'success');
  };

  const deleteRole = async (roleId: string) => {
     setRoles(prev => prev.filter(r => r.id !== roleId));
     if (!isOffline) await supabase.from('roles').delete().eq('id', roleId);
     showToast('Role deleted', 'info');
  };

  const addWarehouse = async (warehouse: Warehouse) => {
     setWarehouses(prev => [...prev, warehouse]);
     if (!isOffline) await supabase.from('warehouses').insert(warehouse);
     showToast('Location added', 'success');
  };

  const updateWarehouse = async (warehouse: Warehouse) => {
     setWarehouses(prev => prev.map(w => w.id === warehouse.id ? warehouse : w));
     if (!isOffline) await supabase.from('warehouses').update(warehouse).eq('id', warehouse.id);
     showToast('Location updated', 'success');
  };

  const removeWarehouse = async (id: string) => {
     if (warehouses.length <= 1) { showToast('Cannot remove last location', 'error'); return; }
     setWarehouses(prev => prev.filter(w => w.id !== id));
     if (!isOffline) await supabase.from('warehouses').delete().eq('id', id);
     showToast('Location removed', 'info');
  };

  const addReturnRequest = (request: Omit<ReturnRequest, 'id' | 'date' | 'status'>) => {
     const newReturn = { ...request, id: `RET-${Date.now()}`, date: new Date().toISOString().split('T')[0], status: 'Pending' as const };
     setReturns(prev => [newReturn, ...prev]);
     if (!isOffline) supabase.from('returns').insert(newReturn);
     showToast('Return requested', 'success');
  };

  const updateReturnStatus = (id: string, status: ReturnRequest['status']) => {
     setReturns(prev => prev.map(r => r.id === id ? { ...r, status } : r));
     if (!isOffline) supabase.from('returns').update({ status }).eq('id', id);
     showToast('Return status updated', 'success');
  };

  const markNotificationRead = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const clearNotifications = () => setNotifications([]);

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <ShopContext.Provider value={{
      products, cart, wishlist, compareList, recentlyViewed, isCartOpen, searchQuery, user, orders, customers, warehouses, appSettings, roles, availablePermissions: AVAILABLE_PERMISSIONS, returns, notifications, isOffline, offlineReason,
      setSearchQuery, addToCart, removeFromCart, updateQuantity, toggleCart, clearCart, toggleWishlist, isInWishlist, addToCompare, removeFromCompare, isInCompare, addToRecentlyViewed,
      totalAmount, toast, showToast, login, logout, register, addReview, addAddress, removeAddress, createOrder, updateUserProfile,
      updateOrderStatus, deleteOrder, deleteProduct, updateProduct, addProduct, updateSettings, updateCustomer, addRole, updateRole, deleteRole, checkPermission, seedRoles,
      addWarehouse, updateWarehouse, removeWarehouse, addReturnRequest, updateReturnStatus, markNotificationRead, clearNotifications, retryConnection: checkOnlineStatus
    }}>
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (context === undefined) { throw new Error('useShop must be used within a ShopProvider'); }
  return context;
};