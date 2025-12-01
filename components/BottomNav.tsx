import React from 'react';
import { Home, Grid, Heart, ShoppingBag, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useShop } from '../context/ShopContext';

export const BottomNav: React.FC = () => {
  const { cart, wishlist, toggleCart } = useShop();
  const location = useLocation();
  const path = location.pathname;

  const isActive = (p: string) => path === p ? 'text-primary' : 'text-gray-400';
  const cartCount = cart.reduce((a,c) => a + c.quantity, 0);

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 pb-[env(safe-area-inset-bottom)] px-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-40 h-16 flex justify-between items-center">
      <Link to="/" className={`flex flex-col items-center gap-1 ${isActive('/')}`}>
        <Home size={20} className={path === '/' ? 'fill-current' : ''} />
        <span className="text-[10px] font-medium">Home</span>
      </Link>
      
      {/* Scroll to categories or go to separate page. For now, simple anchor behavior via Home */}
      <a href="#categories" className={`flex flex-col items-center gap-1 text-gray-400`}>
        <Grid size={20} />
        <span className="text-[10px] font-medium">Catalog</span>
      </a>

      <Link to="/wishlist" className={`flex flex-col items-center gap-1 relative ${isActive('/wishlist')}`}>
        <div className="relative">
          <Heart size={20} className={path === '/wishlist' ? 'fill-current' : ''} />
          {wishlist.length > 0 && <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-white"></span>}
        </div>
        <span className="text-[10px] font-medium">Wishlist</span>
      </Link>

      <button onClick={toggleCart} className={`flex flex-col items-center gap-1 ${cart.length > 0 ? 'text-primary' : 'text-gray-400'}`}>
        <div className="relative">
          <ShoppingBag size={20} className={cart.length > 0 ? 'fill-gray-200' : ''}/>
          {cartCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-[14px] h-[14px] bg-accent text-white text-[9px] flex items-center justify-center rounded-full border border-white px-0.5">
              {cartCount}
            </span>
          )}
        </div>
        <span className="text-[10px] font-medium">Cart</span>
      </button>

      <div className="flex flex-col items-center gap-1 text-gray-400 cursor-pointer hover:text-primary transition-colors">
        <User size={20} />
        <span className="text-[10px] font-medium">Account</span>
      </div>
    </div>
  );
};