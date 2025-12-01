
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, Smartphone, Heart, X, User, Menu, Phone, HelpCircle, ArrowLeftRight, ChevronDown, MapPin, Tablet, Watch, Headphones, Grid, LogOut, Package, LayoutDashboard, ChevronRight, Zap } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const Navbar: React.FC = () => {
  const { cart, toggleCart, wishlist, compareList, setSearchQuery, searchQuery, user, logout, products } = useShop();
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const wishlistCount = wishlist.length;
  const compareCount = compareList.length;
  const navigate = useNavigate();
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  
  // Search Suggestions State
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setShowSuggestions(true);
  };

  const handleSearchSubmit = () => {
    setShowSuggestions(false);
    if (window.location.hash !== '#/shop') {
      navigate('/shop');
    }
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
      setShowSuggestions(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filter suggestions
  const suggestions = searchQuery.length > 1 
    ? products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.brand.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5)
    : [];

  const locationText = user && user.addresses.length > 0 ? user.addresses[0].city : "Kuwait City";

  const MobileMenu = () => (
    <div className={`fixed inset-0 z-50 transition-all duration-300 ${isMobileMenuOpen ? 'visible' : 'invisible'}`}>
      <div 
        className={`absolute inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0'}`} 
        onClick={() => setIsMobileMenuOpen(false)}
      />
      <div 
        className={`absolute inset-y-0 left-0 w-[85%] max-w-xs bg-white shadow-2xl transform transition-transform duration-300 ease-out flex flex-col ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="p-6 bg-primary text-white flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Smartphone size={24} className="text-secondary"/>
            <span className="font-bold text-xl tracking-tight">LAKKI</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={24} /></button>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6">
          <div className="px-6 mb-8">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Shop Categories</p>
            <nav className="space-y-2">
              {[
                { name: 'All Products', icon: Grid, path: '/shop' },
                { name: 'Smartphones', icon: Smartphone, path: '/shop?category=Smartphones' },
                { name: 'Tablets', icon: Tablet, path: '/shop?category=Tablets' },
                { name: 'Wearables', icon: Watch, path: '/shop?category=Wearables' },
                { name: 'Audio', icon: Headphones, path: '/shop?category=Audio' },
                { name: 'Accessories', icon: Package, path: '/shop?category=Accessories' },
              ].map((item) => (
                <Link 
                  key={item.name}
                  to={item.path} 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 text-gray-700 font-medium transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <item.icon size={20} className="text-gray-400 group-hover:text-primary transition-colors"/>
                    {item.name}
                  </div>
                  <ChevronRight size={16} className="text-gray-300 group-hover:text-primary"/>
                </Link>
              ))}
            </nav>
          </div>

          <div className="px-6 mb-8">
             <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Support</p>
             <nav className="space-y-2">
                <Link to="/track-order" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 text-gray-700 font-medium transition-colors group">
                   <Package size={20} className="text-gray-400 group-hover:text-primary"/> Track Order
                </Link>
                <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 text-gray-700 font-medium transition-colors group">
                   <HelpCircle size={20} className="text-gray-400 group-hover:text-primary"/> Help Center
                </Link>
             </nav>
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50">
           {user ? (
              <div className="space-y-3">
                 <div className="flex items-center gap-3 mb-4">
                    <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full border-2 border-white shadow-sm" />
                    <div className="overflow-hidden">
                       <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
                       <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                 </div>
                 {user.role !== 'User' && (
                    <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center gap-2 w-full py-3 bg-slate-900 text-white text-sm font-bold rounded-xl shadow-lg">
                       <LayoutDashboard size={16}/> Admin Dashboard
                    </Link>
                 )}
                 <div className="grid grid-cols-2 gap-3">
                    <Link to="/account" onClick={() => setIsMobileMenuOpen(false)} className="py-3 bg-white border border-gray-200 text-center rounded-xl text-sm font-bold text-gray-700 hover:border-primary hover:text-primary transition-colors">Account</Link>
                    <button onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="py-3 bg-white border border-gray-200 text-red-600 text-center rounded-xl text-sm font-bold hover:bg-red-50 transition-colors">Sign Out</button>
                 </div>
              </div>
           ) : (
              <div className="grid grid-cols-2 gap-3">
                 <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="py-3 bg-white border border-gray-200 text-center rounded-xl text-sm font-bold text-gray-700 hover:border-primary hover:text-primary transition-colors">Log In</Link>
                 <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} className="py-3 bg-primary text-white text-center rounded-xl text-sm font-bold shadow-lg shadow-primary/30">Sign Up</Link>
              </div>
           )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="font-sans">
      <MobileMenu />
      
      {/* Top Strip */}
      <div className="bg-slate-900 text-gray-300 text-[11px] py-2 px-4 hidden sm:block border-b border-white/5 relative z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex gap-6">
             <span className="flex items-center gap-1.5 hover:text-secondary cursor-pointer transition-colors"><Phone size={12} className="text-secondary"/> 1800-LAKKI</span>
             <Link to="/contact" className="flex items-center gap-1.5 hover:text-secondary cursor-pointer transition-colors"><HelpCircle size={12} className="text-secondary"/> Help Center</Link>
          </div>
          <div className="flex gap-6 items-center">
             <Link to={user ? "/account" : "/login"} className="flex items-center gap-1.5 cursor-pointer hover:text-white transition-colors group">
                <MapPin size={12} className="text-secondary" />
                <span className="group-hover:text-secondary transition-colors">Deliver to: <span className="font-bold text-white group-hover:text-secondary">{locationText}</span></span>
             </Link>
             <span className="h-3 w-px bg-white/10"></span>
             <Link to="/track-order" className="hover:text-white cursor-pointer transition-colors">Track Order</Link>
             <span className="h-3 w-px bg-white/10"></span>
             <span className="hover:text-white cursor-pointer transition-colors flex items-center gap-1">English (KW) <ChevronDown size={10}/></span>
          </div>
        </div>
      </div>

      {/* Main Navbar - Sticky */}
      <div className={`bg-primary text-white shadow-xl sticky top-0 z-40 transition-all duration-300 ${isSticky ? 'py-0' : 'py-3'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 gap-8">
            
            {/* Logo */}
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <Menu size={24}/>
              </button>
              <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
                <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center text-primary shadow-lg shadow-secondary/20 group-hover:scale-105 transition-transform">
                  <Smartphone size={24} strokeWidth={2.5} />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-black tracking-tighter text-white leading-none">LAKKI</span>
                  <span className="text-[10px] text-secondary tracking-[0.3em] font-bold uppercase leading-none mt-1">PHONES</span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation & Search */}
            <div className="hidden md:flex flex-1 items-center gap-8">
               {/* Categories Menu */}
               <div 
                  className="flex items-center gap-2 font-bold text-sm cursor-pointer hover:text-secondary transition-colors relative h-16 group"
               >
                  <Grid size={18} /> Categories
                  <div className="absolute top-full left-0 w-64 bg-white shadow-xl rounded-b-2xl border-t border-gray-100 overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                     <div className="p-2">
                        {[
                           { name: 'Smartphones', icon: Smartphone },
                           { name: 'Tablets', icon: Tablet },
                           { name: 'Wearables', icon: Watch },
                           { name: 'Audio', icon: Headphones },
                           { name: 'Accessories', icon: Zap },
                        ].map(cat => (
                           <Link key={cat.name} to={`/shop?category=${cat.name}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 text-gray-700 hover:text-primary transition-colors">
                              <cat.icon size={18} className="text-gray-400" />
                              <span className="font-medium">{cat.name}</span>
                           </Link>
                        ))}
                     </div>
                  </div>
               </div>

               {/* Search Bar */}
               <div className="flex-1 max-w-xl" ref={searchRef}>
                 <div className="relative w-full group">
                   <input
                     type="text"
                     value={searchQuery}
                     onChange={handleSearchChange}
                     onFocus={() => setShowSuggestions(true)}
                     onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
                     placeholder="Search for products, brands..."
                     className="w-full pl-5 pr-5 py-2.5 bg-white/10 border border-white/10 rounded-full text-white placeholder-blue-200/60 focus:bg-white focus:text-gray-900 focus:placeholder-gray-400 focus:border-white transition-all duration-300 text-sm outline-none"
                   />

                   {/* Suggestions Dropdown */}
                   {showSuggestions && searchQuery.length > 1 && (
                      <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-left">
                         {suggestions.length > 0 ? (
                            <ul>
                               <li className="px-4 py-3 bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                  Products
                               </li>
                               {suggestions.map(p => (
                                  <li key={p.id} className="border-b border-gray-50 last:border-0">
                                     <Link 
                                       to={`/product/${p.id}`} 
                                       onClick={() => { setShowSuggestions(false); setSearchQuery(''); }}
                                       className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors group"
                                     >
                                        <div className="w-10 h-10 rounded-lg bg-gray-100 p-1 border border-gray-200 flex-shrink-0">
                                           <img src={`https://picsum.photos/seed/${p.imageSeed}/100/100`} className="w-full h-full object-contain mix-blend-multiply" alt={p.name}/>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                           <p className="text-sm font-bold text-gray-900 group-hover:text-primary transition-colors truncate">{p.name}</p>
                                           <div className="flex items-center gap-2 mt-0.5">
                                               <span className="text-xs text-gray-500 font-medium">{p.brand}</span>
                                               <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                               <span className="text-xs font-bold text-secondary">{p.price} KWD</span>
                                           </div>
                                        </div>
                                     </Link>
                                  </li>
                               ))}
                            </ul>
                         ) : (
                            <div className="p-8 text-center">
                               <Search size={24} className="mx-auto text-gray-300 mb-2" />
                               <p className="text-gray-500 text-sm">No results found</p>
                            </div>
                         )}
                      </div>
                   )}
                 </div>
               </div>
            </div>

            {/* Icons */}
            <div className="flex items-center gap-3 sm:gap-6">
              <button 
                onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
                className="p-2 hover:bg-white/10 rounded-full md:hidden text-white transition-colors"
              >
                <Search size={22} />
              </button>

              <Link to="/compare" className="hidden sm:flex flex-col items-center group relative text-blue-100 hover:text-secondary transition-colors">
                 <div className="relative p-1">
                    <ArrowLeftRight size={22} className="group-hover:-translate-y-1 transition-transform duration-300" />
                    {compareCount > 0 && (
                       <span className="absolute -top-1 -right-1 w-4 h-4 bg-secondary rounded-full text-[10px] text-primary flex items-center justify-center font-black border-2 border-primary">
                          {compareCount}
                       </span>
                    )}
                 </div>
              </Link>

              <Link to="/wishlist" className="hidden sm:flex flex-col items-center group relative text-blue-100 hover:text-accent transition-colors">
                <div className="relative p-1">
                  <Heart size={22} className="group-hover:-translate-y-1 transition-transform duration-300" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full text-[10px] text-white flex items-center justify-center font-black border-2 border-primary">
                      {wishlistCount}
                    </span>
                  )}
                </div>
              </Link>

              <div className="h-8 w-px bg-white/10 hidden sm:block"></div>

              {user ? (
                <div 
                  className="hidden sm:flex flex-col items-center group cursor-pointer relative"
                  onMouseEnter={() => setIsUserMenuOpen(true)}
                  onMouseLeave={() => setIsUserMenuOpen(false)}
                >
                   <div className="p-0.5 border-2 border-secondary/50 rounded-full hover:border-secondary transition-colors">
                      <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-full" />
                   </div>
                   
                   {/* User Dropdown */}
                   {isUserMenuOpen && (
                      <div className="absolute top-full right-0 pt-2 w-64 z-50">
                        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 animate-in fade-in zoom-in-95 duration-200">
                           <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                              <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
                              <p className="text-xs text-gray-500 truncate">{user.email}</p>
                           </div>
                           <div className="py-2">
                               {user.role !== 'User' && (
                                  <Link to="/admin" className="flex items-center gap-3 px-5 py-3 text-sm text-purple-700 hover:bg-purple-50 transition-colors font-bold">
                                     <LayoutDashboard size={18} /> Admin Dashboard
                                  </Link>
                               )}
                               <Link to="/account" className="flex items-center gap-3 px-5 py-3 text-sm text-gray-600 hover:bg-gray-50 hover:text-primary transition-colors font-medium">
                                  <User size={18} /> My Account
                               </Link>
                               <Link to="/account" className="flex items-center gap-3 px-5 py-3 text-sm text-gray-600 hover:bg-gray-50 hover:text-primary transition-colors font-medium">
                                  <Package size={18} /> My Orders
                               </Link>
                           </div>
                           <div className="border-t border-gray-100 mt-1 py-2">
                              <button 
                                onClick={logout}
                                className="w-full flex items-center gap-3 px-5 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left font-bold"
                              >
                                <LogOut size={18} /> Sign Out
                              </button>
                           </div>
                        </div>
                      </div>
                   )}
                </div>
              ) : (
                <Link to="/login" className="hidden sm:flex flex-col items-center group cursor-pointer relative text-blue-100 hover:text-white transition-colors">
                  <div className="p-1">
                    <User size={22} className="group-hover:-translate-y-1 transition-transform duration-300" />
                  </div>
                </Link>
              )}

              <button 
                onClick={toggleCart}
                className="flex flex-col items-center group text-blue-100 hover:text-white transition-colors"
              >
                <div className="relative p-1">
                  <ShoppingBag size={22} className="group-hover:-translate-y-1 transition-transform duration-300" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-secondary text-primary text-[10px] font-black flex items-center justify-center rounded-full border-2 border-primary shadow-sm">
                      {cartCount}
                    </span>
                  )}
                </div>
              </button>
            </div>
          </div>

          {/* Mobile Search Expand */}
          {isMobileSearchOpen && (
            <div className="md:hidden pb-4 animate-in slide-in-from-top-2">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
                  placeholder="Search products..."
                  className="w-full pl-4 pr-10 py-3 bg-white/10 text-white placeholder-blue-200 border border-white/10 rounded-xl focus:outline-none focus:bg-white/20 focus:border-secondary transition-all"
                  autoFocus
                />
                 {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-blue-200 hover:text-white"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
