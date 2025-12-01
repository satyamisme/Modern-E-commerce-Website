import React, { useState } from 'react';
import { X, Minus, Plus, Trash2, ShoppingBag, Truck, Tag, ArrowRight } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { Link } from 'react-router-dom';

export const CartDrawer: React.FC = () => {
  const { isCartOpen, toggleCart, cart, updateQuantity, removeFromCart, totalAmount, showToast } = useShop();
  const [coupon, setCoupon] = useState('');
  
  // Free shipping threshold
  const FREE_SHIPPING_THRESHOLD = 50;
  const progress = Math.min((totalAmount / FREE_SHIPPING_THRESHOLD) * 100, 100);
  const remaining = FREE_SHIPPING_THRESHOLD - totalAmount;

  const handleApplyCoupon = () => {
    if (coupon.trim().toLowerCase() === 'lakki20') {
      showToast('Coupon applied! 20% discount', 'success');
    } else {
      showToast('Invalid coupon code', 'error');
    }
  };

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
        onClick={toggleCart}
      />
      
      <div className="absolute inset-y-0 right-0 max-w-full flex">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-300">
          
          <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-white z-10">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
               <ShoppingBag size={20}/> My Cart <span className="text-sm font-normal text-gray-500">({cart.length} items)</span>
            </h2>
            <button onClick={toggleCart} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
              <X size={24} />
            </button>
          </div>

          {/* Free Shipping Bar */}
          {cart.length > 0 && (
             <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
                <div className="flex items-center gap-2 mb-2 text-sm">
                   <div className="p-1 bg-blue-100 text-blue-600 rounded">
                      <Truck size={14} />
                   </div>
                   {remaining > 0 ? (
                      <span className="text-gray-700">Add <span className="font-bold text-gray-900">{remaining.toFixed(2)} KWD</span> for <span className="font-bold text-green-600">Free Shipping</span></span>
                   ) : (
                      <span className="text-green-600 font-bold">You've earned Free Shipping!</span>
                   )}
                </div>
                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                   <div 
                     className="h-full bg-green-500 transition-all duration-500 ease-out"
                     style={{ width: `${progress}%` }}
                   ></div>
                </div>
             </div>
          )}

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                <div className="p-6 bg-gray-50 rounded-full">
                  <ShoppingBag size={48} className="text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Your cart is empty</h3>
                <p className="text-gray-500">Looks like you haven't added anything yet.</p>
                <button 
                  onClick={toggleCart}
                  className="px-8 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors font-medium shadow-lg shadow-primary/20"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="flex gap-4 group">
                  <div className="w-24 h-24 flex-shrink-0 bg-white border border-gray-100 rounded-xl overflow-hidden p-2">
                    <img 
                      src={`https://picsum.photos/seed/${item.imageSeed}/200/200`} 
                      alt={item.name} 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                      <div className="flex justify-between items-start">
                         <h3 className="font-semibold text-gray-900 line-clamp-1">{item.name}</h3>
                         <span className="font-bold text-gray-900">{item.price * item.quantity} KWD</span>
                      </div>
                      <p className="text-xs text-gray-500">{item.brand}</p>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1 border border-gray-100">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center bg-white text-gray-600 hover:text-red-500 rounded shadow-sm transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="text-sm font-semibold w-4 text-center">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center bg-white text-gray-600 hover:text-green-500 rounded shadow-sm transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                        title="Remove Item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {cart.length > 0 && (
            <div className="border-t border-gray-100 p-6 space-y-6 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
              
              {/* Coupon Input */}
              <div className="relative">
                 <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                 <input 
                  type="text" 
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                  placeholder="Promo Code" 
                  className="w-full pl-9 pr-20 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                 />
                 <button 
                  onClick={handleApplyCoupon}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-primary hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors"
                 >
                    APPLY
                 </button>
              </div>

              <div className="space-y-2">
                 <div className="flex justify-between text-gray-600 text-sm">
                   <span>Subtotal</span>
                   <span>{totalAmount.toLocaleString()} KWD</span>
                 </div>
                 <div className="flex justify-between text-gray-600 text-sm">
                   <span>Shipping</span>
                   <span className={remaining <= 0 ? "text-green-600 font-bold" : ""}>
                     {remaining <= 0 ? "FREE" : "5.00 KWD"}
                   </span>
                 </div>
                 <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t border-dashed border-gray-200">
                   <span>Total</span>
                   <span>{(totalAmount + (remaining <= 0 ? 0 : 5)).toLocaleString()} KWD</span>
                 </div>
              </div>

              <div className="space-y-3">
                <Link
                  to="/checkout"
                  onClick={toggleCart}
                  className="flex items-center justify-center w-full px-6 py-4 text-base font-bold text-white bg-primary rounded-xl hover:bg-gray-800 transition-all shadow-lg shadow-primary/20 group"
                >
                  Proceed to Checkout <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform"/>
                </Link>
                <Link
                  to="/cart"
                  onClick={toggleCart}
                  className="flex items-center justify-center w-full px-6 py-3 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
                >
                  View Full Cart
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};