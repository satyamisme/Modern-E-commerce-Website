
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem, ToastMessage, User, Order, Address, Review, AppSettings, CustomerProfile, Warehouse, RoleDefinition, Permission, RoleType, ReturnRequest, Notification } from '../types';
import { PRODUCTS as INITIAL_PRODUCTS } from '../data/products';
import { APP_CONFIG } from '../config';

const DEFAULT_SETTINGS: AppSettings = {
  storeName: APP_CONFIG.storeName,
  currency: APP_CONFIG.currency,
  supportEmail: APP_CONFIG.supportEmail,
  supportPhone: APP_CONFIG.supportPhone,
  taxRate: APP_CONFIG.taxRate,
  enableKnet: true,
  enableCreditCard: true,
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
  { 
    id: 'SH-KHA-02', 
    name: 'Khaitan HQ Store', 
    location: { address: 'Fahd Al-Dabbous Mall, Khaitan' }, 
    capacity: 1500, 
    utilization: 50, 
    type: 'Retail Shop',
    managerId: 'mgr-khaitan',
    phone: '+965 50430606'
  },
  { 
    id: 'SH-FAH-03', 
    name: 'Fahaheel Branch', 
    location: { address: 'The Avenues Phase 4, Fahaheel' }, 
    capacity: 1800, 
    utilization: 70, 
    type: 'Retail Shop',
    managerId: 'mgr-fahaheel',
    phone: '+965 55463598'
  },
  { 
    id: 'SH-HAW-04', 
    name: 'Hawally Center', 
    location: { address: 'Mubarak Al-Kabeer St, Hawally' }, 
    capacity: 1500, 
    utilization: 45, 
    type: 'Retail Shop',
    managerId: 'mgr-hawally',
    phone: '+965 50430607'
  },
  { 
    id: 'SH-MUB-05', 
    name: 'Mubarak Al-Kabeer', 
    location: { address: 'Mubarak Al-Kabeer Co-op' }, 
    capacity: 1200, 
    utilization: 60, 
    type: 'Retail Shop',
    managerId: 'mgr-mubarak',
    phone: '+965 55463599'
  },
  { 
    id: 'SH-JAH-06', 
    name: 'Al Jahra Store', 
    location: { address: 'Al Jahra Commercial Area' }, 
    capacity: 1600, 
    utilization: 55, 
    type: 'Retail Shop',
    managerId: 'mgr-jahra',
    phone: '+965 50430608'
  },
  { 
    id: 'SH-FAR-07', 
    name: 'Farwaniya Pop-up', 
    location: { address: 'Farwaniya Co-op Mall' }, 
    capacity: 1000, 
    utilization: 40, 
    type: 'Retail Shop',
    managerId: 'mgr-farwaniya',
    phone: '+965 55463600'
  },
  { 
    id: 'SH-ONL-08', 
    name: 'Online Fulfillment', 
    location: { address: 'Shuwaikh Industrial Area 2' }, 
    capacity: 5000, 
    utilization: 30, 
    type: 'Online Fulfillment',
    managerId: 'mgr-online',
    phone: '+965 50430609',
    openingHours: '24/7'
  },
];

const INITIAL_ROLES: RoleDefinition[] = [
  { 
    id: 'role-super', 
    name: 'Super Admin', 
    isSystem: true,
    description: 'Full system access',
    permissions: ['all'] 
  },
  { 
    id: 'role-shop-admin', 
    name: 'Shop Admin', 
    isSystem: true,
    description: 'Manage specific store operations',
    permissions: ['manage_orders', 'manage_inventory', 'view_reports', 'manage_customers'] 
  },
  { 
    id: 'role-sales', 
    name: 'Sales', 
    isSystem: true,
    description: 'POS and basic order handling',
    permissions: ['manage_orders', 'view_products'] 
  },
  { 
    id: 'role-warehouse', 
    name: 'Warehouse Staff', 
    isSystem: true,
    description: 'Inventory and stock transfer',
    permissions: ['manage_inventory'] 
  }
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
  { id: 'C-003', name: 'Jassim Tech', email: 'jassim@example.com', phone: '+965 5555 9876', joinDate: '2022-05-10', totalSpent: 4200, ordersCount: 12, segment: 'VIP', lastOrderDate: '2024-02-28', avatar: 'https://ui-avatars.com/api/?name=Jassim' },
  { id: 'C-004', name: 'New User', email: 'new@example.com', phone: '+965 9876 5432', joinDate: '2024-02-25', totalSpent: 0, ordersCount: 0, segment: 'New', lastOrderDate: '-', avatar: 'https://ui-avatars.com/api/?name=New' },
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
  
  // Features
  addReview: (productId: string, review: Omit<Review, 'id' | 'date'>) => void;
  addAddress: (address: Omit<Address, 'id'>) => void;
  removeAddress: (addressId: string) => void;
  createOrder: (orderData: Omit<Order, 'id' | 'date' | 'status' | 'paymentStatus'>) => Order;
  updateUserProfile: (data: Partial<User>) => void;
  
  // Admin
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  deleteOrder: (orderId: string) => void;
  deleteProduct: (productId: string) => void;
  updateProduct: (product: Product) => void;
  addProduct: (product: Product) => void;
  updateSettings: (settings: AppSettings) => void;
  updateCustomer: (customer: CustomerProfile) => void;
  
  // Warehouse Management
  addWarehouse: (warehouse: Warehouse) => void;
  updateWarehouse: (warehouse: Warehouse) => void;
  removeWarehouse: (id: string) => void;

  // Role Management
  addRole: (role: RoleDefinition) => void;
  updateRole: (role: RoleDefinition) => void;
  deleteRole: (roleId: string) => void;
  checkPermission: (permissionKey: string) => boolean;

  // Returns & Notifications
  addReturnRequest: (request: Omit<ReturnRequest, 'id' | 'date' | 'status'>) => void;
  updateReturnStatus: (id: string, status: ReturnRequest['status']) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;

  totalAmount: number;
  toast: ToastMessage | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  login: (email: string) => void;
  logout: () => void;
  register: (name: string, email: string) => void;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Products State (Persisted)
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('lumina_products');
    if (saved) return JSON.parse(saved);
    // Respect configuration for initial data load
    return APP_CONFIG.useMockData ? INITIAL_PRODUCTS : [];
  });

  // Cart State
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('lumina_cart');
    return saved ? JSON.parse(saved) : [];
  });
  
  // Wishlist State
  const [wishlist, setWishlist] = useState<Product[]>(() => {
    const saved = localStorage.getItem('lumina_wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  // Compare State
  const [compareList, setCompareList] = useState<Product[]>(() => {
     const saved = localStorage.getItem('lumina_compare');
     return saved ? JSON.parse(saved) : [];
  });

  // Recently Viewed State
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>(() => {
    const saved = localStorage.getItem('lumina_recent');
    return saved ? JSON.parse(saved) : [];
  });

  // User State
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('lumina_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Settings State
  const [appSettings, setAppSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('lumina_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  // Roles State
  const [roles, setRoles] = useState<RoleDefinition[]>(() => {
     const saved = localStorage.getItem('lumina_roles');
     return saved ? JSON.parse(saved) : INITIAL_ROLES;
  });

  // Orders (Persisted)
  const [orders, setOrders] = useState<Order[]>(() => {
     const saved = localStorage.getItem('lumina_orders');
     if (saved) return JSON.parse(saved);
     
     if (APP_CONFIG.useMockData) {
        return [
           {
             id: 'ORD-7782-XJ',
             date: '2023-11-15',
             total: 1299,
             status: 'Delivered',
             paymentStatus: 'Paid',
             paymentMethod: 'KNET',
             items: [
               { ...INITIAL_PRODUCTS[0], quantity: 1 },
               { ...INITIAL_PRODUCTS[7], quantity: 1 }
             ],
             customer: { name: 'John Doe', email: 'john@example.com', phone: '99999999', address: 'Kuwait City' }
           }
        ];
     }
     return [];
  });

  // CRM & Inventory State
  const [customers, setCustomers] = useState<CustomerProfile[]>(APP_CONFIG.useMockData ? INITIAL_CUSTOMERS : []);
  
  // Warehouses State
  const [warehouses, setWarehouses] = useState<Warehouse[]>(() => {
    const saved = localStorage.getItem('lumina_warehouses');
    return saved ? JSON.parse(saved) : INITIAL_WAREHOUSES;
  });

  // Returns State
  const [returns, setReturns] = useState<ReturnRequest[]>(() => {
    const saved = localStorage.getItem('lumina_returns');
    return saved ? JSON.parse(saved) : [];
  });

  // Notifications State
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem('lumina_notifications');
    return saved ? JSON.parse(saved) : [];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // --- Live Data Simulator & Alerts ---
  useEffect(() => {
    // Check for Low Stock and generate notifications
    const lowStockItems = products.filter(p => p.stock < 5);
    lowStockItems.forEach(p => {
       const alertId = `low-stock-${p.id}`;
       setNotifications(prev => {
          if (prev.some(n => n.id === alertId)) return prev;
          return [{
             id: alertId,
             title: 'Low Stock Alert',
             message: `${p.name} is running low (${p.stock} units left).`,
             type: 'warning',
             timestamp: Date.now(),
             read: false
          }, ...prev];
       });
    });
  }, [products]);

  // Persistence Effects
  useEffect(() => { localStorage.setItem('lumina_products', JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem('lumina_cart', JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem('lumina_wishlist', JSON.stringify(wishlist)); }, [wishlist]);
  useEffect(() => { localStorage.setItem('lumina_compare', JSON.stringify(compareList)); }, [compareList]);
  useEffect(() => { localStorage.setItem('lumina_recent', JSON.stringify(recentlyViewed)); }, [recentlyViewed]);
  useEffect(() => { localStorage.setItem('lumina_settings', JSON.stringify(appSettings)); }, [appSettings]);
  useEffect(() => { localStorage.setItem('lumina_orders', JSON.stringify(orders)); }, [orders]);
  useEffect(() => { localStorage.setItem('lumina_roles', JSON.stringify(roles)); }, [roles]);
  useEffect(() => { localStorage.setItem('lumina_warehouses', JSON.stringify(warehouses)); }, [warehouses]);
  useEffect(() => { localStorage.setItem('lumina_returns', JSON.stringify(returns)); }, [returns]);
  useEffect(() => { localStorage.setItem('lumina_notifications', JSON.stringify(notifications)); }, [notifications]);
  
  useEffect(() => { 
    if(user) localStorage.setItem('lumina_user', JSON.stringify(user));
    else localStorage.removeItem('lumina_user');
  }, [user]);

  // Toast Logic
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString();
    setToast({ id, message, type });
    setTimeout(() => {
      setToast(current => current?.id === id ? null : current);
    }, 3000);
  };

  // --- Cart & User Logic ---
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
          showToast(`Sorry, only ${currentStock} units available`, 'error');
          return prev;
        }
        showToast(`Updated quantity for ${product.name}`, 'info');
        return prev.map(item => {
           const itemId = `${item.id}-${item.selectedColor || ''}-${item.selectedStorage || ''}`;
           return itemId === cartItemId ? { ...item, quantity: item.quantity + 1 } : item;
        });
      }

      if (currentStock < 1) {
        showToast('Sorry, this item is out of stock', 'error');
        return prev;
      }

      showToast(`Added ${product.name} to cart`, 'success');
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
    showToast('Removed item from cart', 'info');
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
      if (exists) { showToast(`Removed ${product.name} from wishlist`, 'info'); return prev.filter(p => p.id !== product.id); }
      showToast(`Added ${product.name} to wishlist`, 'success'); return [...prev, product];
    });
  };

  const isInWishlist = (productId: string) => wishlist.some(p => p.id === productId);

  const addToCompare = (product: Product) => {
    setCompareList(prev => {
      if (prev.find(p => p.id === product.id)) { showToast('Already in comparison list', 'info'); return prev; }
      if (prev.length >= 3) { showToast('You can compare max 3 products', 'error'); return prev; }
      showToast('Added to comparison', 'success'); return [...prev, product];
    });
  };

  const removeFromCompare = (productId: string) => {
    setCompareList(prev => prev.filter(p => p.id !== productId));
    showToast('Removed from comparison', 'info');
  };

  const isInCompare = (productId: string) => compareList.some(p => p.id === productId);

  const addToRecentlyViewed = (product: Product) => {
    setRecentlyViewed(prev => {
      const filtered = prev.filter(p => p.id !== product.id);
      return [product, ...filtered].slice(0, 10);
    });
  };

  // Auth
  const login = (email: string) => {
    let role: RoleType = 'User';
    let name = email.split('@')[0];
    if (email.includes('super') || email.includes('ahmed')) { role = 'Super Admin'; name = 'Ahmed (Admin)'; }
    else if (email.includes('admin')) { role = 'Shop Admin'; name = 'Shop Manager'; }
    else if (email.includes('sales')) { role = 'Sales'; name = 'Sales Agent'; }
    else if (email.includes('warehouse')) { role = 'Warehouse Staff'; name = 'Stock Manager'; }

    setUser({
      id: role !== 'User' ? `staff-${Date.now()}` : 'u-123',
      name: name,
      email: email,
      avatar: `https://ui-avatars.com/api/?name=${name}&background=random`,
      role: role,
      addresses: []
    });
    showToast(`Welcome back, ${name}! (${role})`, 'success');
  };

  const register = (name: string, email: string) => {
    setUser({ id: `u-${Date.now()}`, name, email, avatar: `https://ui-avatars.com/api/?name=${name}&background=random`, role: 'User', addresses: [] });
    showToast('Account created successfully!', 'success');
  }

  const logout = () => { setUser(null); showToast('You have been logged out', 'info'); };

  const checkPermission = (permissionKey: string): boolean => {
    if (!user) return false;
    const roleDef = roles.find(r => r.name === user.role);
    if (!roleDef) return false;
    if (roleDef.permissions.includes('all')) return true;
    return roleDef.permissions.includes(permissionKey);
  };

  const addReview = (productId: string, review: Omit<Review, 'id' | 'date'>) => {
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        const reviews = [...(p.reviews || []), { ...review, id: `rev-${Date.now()}`, date: new Date().toLocaleDateString() }];
        const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
        return { ...p, reviews, rating: Number((totalRating / reviews.length).toFixed(1)), reviewsCount: reviews.length };
      }
      return p;
    }));
    showToast('Review submitted!', 'success');
  };

  const addAddress = (address: Omit<Address, 'id'>) => {
    if (!user) return;
    setUser(prev => prev ? { ...prev, addresses: [...prev.addresses, { ...address, id: `addr-${Date.now()}` }] } : null);
    showToast('Address added successfully', 'success');
  };

  const removeAddress = (addressId: string) => {
    if (!user) return;
    setUser(prev => prev ? { ...prev, addresses: prev.addresses.filter(a => a.id !== addressId) } : null);
    showToast('Address removed', 'info');
  };

  const updateUserProfile = (data: Partial<User>) => {
      if (!user) return;
      setUser(prev => prev ? { ...prev, ...data } : null);
      showToast('Profile updated successfully', 'success');
  };

  const createOrder = (orderData: Omit<Order, 'id' | 'date' | 'status' | 'paymentStatus'>) => {
    const newOrder: Order = {
      ...orderData,
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}-${Date.now().toString().slice(-4)}`,
      date: new Date().toISOString().split('T')[0],
      status: 'New',
      paymentStatus: 'Paid',
      fraudScore: 5
    };
    setOrders(prev => [newOrder, ...prev]);
    
    // Create Notification
    setNotifications(prev => [{
        id: `notif-${Date.now()}`,
        title: 'New Order Received',
        message: `Order #${newOrder.id} placed by ${newOrder.customer.name}`,
        type: 'success',
        timestamp: Date.now(),
        read: false
    }, ...prev]);

    setProducts(prev => prev.map(p => {
      const orderedItem = orderData.items.find(i => i.id === p.id);
      if(orderedItem) { return { ...p, stock: Math.max(0, p.stock - orderedItem.quantity) }; }
      return p;
    }));

    return newOrder;
  };

  // Admin Actions
  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    if(!checkPermission('manage_orders')) { showToast('Permission denied', 'error'); return; }
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    showToast(`Order ${orderId} updated to ${status}`, 'success');
  };

  const deleteOrder = (orderId: string) => {
    if(!checkPermission('manage_orders')) { showToast('Permission denied', 'error'); return; }
    setOrders(prev => prev.filter(o => o.id !== orderId));
    showToast('Order deleted successfully', 'info');
  };

  const deleteProduct = (productId: string) => {
    if(!checkPermission('manage_products')) { showToast('Permission denied', 'error'); return; }
    setProducts(prev => prev.filter(p => p.id !== productId));
    showToast('Product deleted from inventory', 'info');
  };

  const updateProduct = (product: Product) => {
    if(!checkPermission('manage_products')) { showToast('Permission denied', 'error'); return; }
    setProducts(prev => prev.map(p => p.id === product.id ? product : p));
    showToast('Product updated successfully', 'success');
  };

  const addProduct = (product: Product) => {
     if(!checkPermission('manage_products')) { showToast('Permission denied', 'error'); return; }
     setProducts(prev => [product, ...prev]);
     showToast('Product added to inventory', 'success');
  };

  const updateSettings = (settings: AppSettings) => {
    if(!checkPermission('manage_settings')) { showToast('Permission denied', 'error'); return; }
    setAppSettings(settings);
    showToast('Store settings updated', 'success');
  };

  const updateCustomer = (customer: CustomerProfile) => {
    if(!checkPermission('manage_users')) { showToast('Permission denied', 'error'); return; }
    setCustomers(prev => prev.map(c => c.id === customer.id ? customer : c));
    showToast('Customer profile updated', 'success');
  };

  const addRole = (role: RoleDefinition) => {
    if(!checkPermission('manage_roles')) { showToast('Permission denied', 'error'); return; }
    setRoles(prev => [...prev, role]);
    showToast('Role created', 'success');
  }

  const updateRole = (role: RoleDefinition) => {
    if(!checkPermission('manage_roles')) { showToast('Permission denied', 'error'); return; }
    setRoles(prev => prev.map(r => r.id === role.id ? role : r));
    showToast('Role updated', 'success');
  }

  const deleteRole = (roleId: string) => {
    if(!checkPermission('manage_roles')) { showToast('Permission denied', 'error'); return; }
    setRoles(prev => prev.filter(r => r.id !== roleId));
    showToast('Role deleted', 'info');
  }

  const addWarehouse = (warehouse: Warehouse) => {
    if(!checkPermission('manage_inventory')) { showToast('Permission denied', 'error'); return; }
    setWarehouses(prev => [...prev, warehouse]);
    showToast('Location added successfully', 'success');
  };

  const updateWarehouse = (warehouse: Warehouse) => {
    if(!checkPermission('manage_inventory')) { showToast('Permission denied', 'error'); return; }
    setWarehouses(prev => prev.map(w => w.id === warehouse.id ? warehouse : w));
    showToast('Location updated', 'success');
  };

  const removeWarehouse = (id: string) => {
    if(!checkPermission('manage_inventory')) { showToast('Permission denied', 'error'); return; }
    if(warehouses.length <= 1) { showToast('Cannot remove last location', 'error'); return; }
    setWarehouses(prev => prev.filter(w => w.id !== id));
    showToast('Location removed', 'success');
  };

  // --- Returns & Notifications ---
  const addReturnRequest = (request: Omit<ReturnRequest, 'id' | 'date' | 'status'>) => {
      const newReturn: ReturnRequest = {
          ...request,
          id: `RET-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          status: 'Pending'
      };
      setReturns(prev => [newReturn, ...prev]);
      
      // Notify Admin
      setNotifications(prev => [{
          id: `notif-${Date.now()}`,
          title: 'New Return Request',
          message: `Return request for order #${request.orderId}`,
          type: 'warning',
          timestamp: Date.now(),
          read: false
      }, ...prev]);
      
      showToast('Return request submitted successfully', 'success');
  };

  const updateReturnStatus = (id: string, status: ReturnRequest['status']) => {
      if(!checkPermission('manage_orders')) { showToast('Permission denied', 'error'); return; }
      setReturns(prev => prev.map(r => r.id === id ? { ...r, status } : r));
      showToast(`Return status updated to ${status}`, 'success');
  };

  const markNotificationRead = (id: string) => {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearNotifications = () => {
      setNotifications([]);
  };

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <ShopContext.Provider value={{
      products, cart, wishlist, compareList, recentlyViewed, isCartOpen, searchQuery, user, orders, customers, warehouses, appSettings, roles, availablePermissions: AVAILABLE_PERMISSIONS, returns, notifications,
      setSearchQuery, addToCart, removeFromCart, updateQuantity, toggleCart, clearCart, toggleWishlist, isInWishlist, addToCompare, removeFromCompare, isInCompare, addToRecentlyViewed,
      totalAmount, toast, showToast, login, logout, register, addReview, addAddress, removeAddress, createOrder, updateUserProfile,
      updateOrderStatus, deleteOrder, deleteProduct, updateProduct, addProduct, updateSettings, updateCustomer, addRole, updateRole, deleteRole, checkPermission,
      addWarehouse, updateWarehouse, removeWarehouse, addReturnRequest, updateReturnStatus, markNotificationRead, clearNotifications
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
