
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem, ToastMessage, User, Order, Address, Review, AppSettings } from '../types';
import { PRODUCTS as INITIAL_PRODUCTS } from '../data/products';

const DEFAULT_SETTINGS: AppSettings = {
  storeName: 'LAKKI PHONES',
  currency: 'KWD',
  supportEmail: 'support@lakkiphones.com',
  supportPhone: '1800-LAKKI',
  taxRate: 0,
  enableKnet: true,
  enableCreditCard: true,
  deliveryFee: 5,
  freeShippingThreshold: 50
};

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
  appSettings: AppSettings;
  
  // Actions
  setSearchQuery: (query: string) => void;
  addToCart: (product: Product) => void;
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
  
  // Admin
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  deleteOrder: (orderId: string) => void;
  deleteProduct: (productId: string) => void;
  updateProduct: (product: Product) => void;
  addProduct: (product: Product) => void;
  updateSettings: (settings: AppSettings) => void;

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
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
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

  // Orders (Persisted)
  const [orders, setOrders] = useState<Order[]>(() => {
     const saved = localStorage.getItem('lumina_orders');
     if (saved) return JSON.parse(saved);
     
     // Default Mock Orders
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
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Persistence Effects
  useEffect(() => { localStorage.setItem('lumina_products', JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem('lumina_cart', JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem('lumina_wishlist', JSON.stringify(wishlist)); }, [wishlist]);
  useEffect(() => { localStorage.setItem('lumina_compare', JSON.stringify(compareList)); }, [compareList]);
  useEffect(() => { localStorage.setItem('lumina_recent', JSON.stringify(recentlyViewed)); }, [recentlyViewed]);
  useEffect(() => { localStorage.setItem('lumina_settings', JSON.stringify(appSettings)); }, [appSettings]);
  useEffect(() => { localStorage.setItem('lumina_orders', JSON.stringify(orders)); }, [orders]);
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

  // Cart Logic with Inventory Check
  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      const currentStock = products.find(p => p.id === product.id)?.stock || 0;

      if (existing) {
        if (existing.quantity + 1 > currentStock) {
          showToast(`Sorry, only ${currentStock} units available`, 'error');
          return prev;
        }
        showToast(`Updated quantity for ${product.name}`, 'info');
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
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
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }

    const product = products.find(p => p.id === productId);
    if (!product) return;

    if (quantity > product.stock) {
      showToast(`Cannot add more. Max stock available: ${product.stock}`, 'error');
      return;
    }

    setCart(prev => prev.map(item => 
      item.id === productId ? { ...item, quantity } : item
    ));
  };

  const toggleCart = () => setIsCartOpen(!isCartOpen);
  const clearCart = () => setCart([]);

  // Wishlist Logic
  const toggleWishlist = (product: Product) => {
    setWishlist(prev => {
      const exists = prev.find(p => p.id === product.id);
      if (exists) {
        showToast(`Removed ${product.name} from wishlist`, 'info');
        return prev.filter(p => p.id !== product.id);
      }
      showToast(`Added ${product.name} to wishlist`, 'success');
      return [...prev, product];
    });
  };

  const isInWishlist = (productId: string) => wishlist.some(p => p.id === productId);

  // Compare Logic
  const addToCompare = (product: Product) => {
    setCompareList(prev => {
      if (prev.find(p => p.id === product.id)) {
        showToast('Already in comparison list', 'info');
        return prev;
      }
      if (prev.length >= 3) {
        showToast('You can compare max 3 products', 'error');
        return prev;
      }
      showToast('Added to comparison', 'success');
      return [...prev, product];
    });
  };

  const removeFromCompare = (productId: string) => {
    setCompareList(prev => prev.filter(p => p.id !== productId));
    showToast('Removed from comparison', 'info');
  };

  const isInCompare = (productId: string) => compareList.some(p => p.id === productId);

  // Recently Viewed Logic
  const addToRecentlyViewed = (product: Product) => {
    setRecentlyViewed(prev => {
      const filtered = prev.filter(p => p.id !== product.id);
      return [product, ...filtered].slice(0, 10); // Keep last 10
    });
  };

  // Auth Logic
  const login = (email: string) => {
    const isAdmin = email === 'admin@lakkiphones.com';
    setUser({
      id: isAdmin ? 'admin-1' : 'u-123',
      name: isAdmin ? 'Admin User' : email.split('@')[0],
      email: email,
      avatar: `https://ui-avatars.com/api/?name=${email.split('@')[0]}&background=random`,
      role: isAdmin ? 'admin' : 'user',
      addresses: []
    });
    showToast(`Welcome back, ${isAdmin ? 'Admin' : email.split('@')[0]}!`, 'success');
  };

  const register = (name: string, email: string) => {
    setUser({
      id: `u-${Date.now()}`,
      name,
      email,
      avatar: `https://ui-avatars.com/api/?name=${name}&background=random`,
      role: 'user',
      addresses: []
    });
    showToast('Account created successfully!', 'success');
  }

  const logout = () => {
    setUser(null);
    showToast('You have been logged out', 'info');
  };

  // Review Logic
  const addReview = (productId: string, review: Omit<Review, 'id' | 'date'>) => {
    const newReview: Review = {
      ...review,
      id: `rev-${Date.now()}`,
      date: new Date().toLocaleDateString()
    };
    
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        const reviews = [...(p.reviews || []), newReview];
        // Recalculate average rating
        const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
        const newRating = Number((totalRating / reviews.length).toFixed(1));
        return { ...p, reviews, rating: newRating, reviewsCount: reviews.length };
      }
      return p;
    }));
    
    showToast('Review submitted successfully!', 'success');
  };

  // Address Logic
  const addAddress = (address: Omit<Address, 'id'>) => {
    if (!user) return;
    const newAddress: Address = { ...address, id: `addr-${Date.now()}` };
    setUser(prev => prev ? { ...prev, addresses: [...prev.addresses, newAddress] } : null);
    showToast('Address added successfully', 'success');
  };

  const removeAddress = (addressId: string) => {
    if (!user) return;
    setUser(prev => prev ? { ...prev, addresses: prev.addresses.filter(a => a.id !== addressId) } : null);
    showToast('Address removed', 'info');
  };

  // Order Logic
  const createOrder = (orderData: Omit<Order, 'id' | 'date' | 'status' | 'paymentStatus'>) => {
    const newOrder: Order = {
      ...orderData,
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}-${Date.now().toString().slice(-4)}`,
      date: new Date().toISOString().split('T')[0],
      status: 'Processing',
      paymentStatus: 'Paid'
    };
    setOrders(prev => [newOrder, ...prev]);
    
    // Update Stock Logic
    setProducts(prev => prev.map(p => {
      const orderedItem = orderData.items.find(i => i.id === p.id);
      if(orderedItem) {
        // Decrease stock
        return { ...p, stock: Math.max(0, p.stock - orderedItem.quantity) };
      }
      return p;
    }));

    return newOrder;
  };

  // Admin Logic
  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    showToast(`Order ${orderId} updated to ${status}`, 'success');
  };

  const deleteOrder = (orderId: string) => {
    setOrders(prev => prev.filter(o => o.id !== orderId));
    showToast('Order deleted successfully', 'info');
  };

  const deleteProduct = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
    showToast('Product deleted from inventory', 'info');
  };

  const updateProduct = (product: Product) => {
    setProducts(prev => prev.map(p => p.id === product.id ? product : p));
    setCart(prev => prev.map(item => item.id === product.id ? { ...item, ...product, quantity: item.quantity } : item));
    showToast('Product updated successfully', 'success');
  };

  const addProduct = (product: Product) => {
     setProducts(prev => [product, ...prev]);
     showToast('Product added to inventory', 'success');
  };

  const updateSettings = (settings: AppSettings) => {
    setAppSettings(settings);
    showToast('Store settings updated', 'success');
  };

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <ShopContext.Provider value={{
      products,
      cart,
      wishlist,
      compareList,
      recentlyViewed,
      isCartOpen,
      searchQuery,
      user,
      orders,
      appSettings,
      setSearchQuery,
      addToCart,
      removeFromCart,
      updateQuantity,
      toggleCart,
      clearCart,
      toggleWishlist,
      isInWishlist,
      addToCompare,
      removeFromCompare,
      isInCompare,
      addToRecentlyViewed,
      totalAmount,
      toast,
      showToast,
      login,
      logout,
      register,
      addReview,
      addAddress,
      removeAddress,
      createOrder,
      updateOrderStatus,
      deleteOrder,
      deleteProduct,
      updateProduct,
      addProduct,
      updateSettings
    }}>
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) throw new Error("useShop must be used within ShopProvider");
  return context;
};
