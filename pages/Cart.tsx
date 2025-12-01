import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ArrowRight, Truck, ShoppingBag, Tag, AlertCircle } from 'lucide-react';

export const Cart: React.FC = () => {
  const { cart, updateQuantity, removeFromCart, totalAmount, showToast, appSettings, products } = useShop();
  const [coupon, setCoupon] = useState('');

  const progress = Math.min((totalAmount / appSettings.freeShippingThreshold) * 100, 100);
  const remaining = appSettings.freeShippingThreshold - totalAmount;

  const handleApplyCoupon = () => {
    if (coupon.trim().toLowerCase() === 'lakki20') {
      showToast('Coupon applied! 20% discount', 'success');
    } else {
      showToast('Invalid coupon code', 'error');
    }
  };

  const handleUpdateQuantity = (id: string, newQty: number) => {
     const product = products.find(p => p.id === id);
     if (product && newQty > product.stock) {
        showToast(`Sorry, only ${product.stock} units available in stock.`, 'error');
        return;
     }
     updateQuantity(id, newQty);
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-gray-100">
           <ShoppingBag size={40} className="text-gray-300" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-8 max-w-xs text-center">Looks like you haven't added anything yet. Explore our products to find something you like.</p>
        <Link to="/shop" className="px-8 py-3.5 bg-primary text-white rounded-xl hover:bg-gray-800 transition-all font-bold shadow-lg shadow-primary/20">Start Shopping</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 font-sans">
       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-black text-gray-900 mb-8 tracking-tight">Shopping Cart</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             {/* Cart Items */}
             <div className="lg:col-span-2 space-y-6">
                {/* Free Shipping Progress */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                   <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                         <Truck size={20} />
                      </div>
                      {remaining > 0 ? (
                         <span className="text-gray-700 font-medium">Add <span className="font-bold text-gray-900">{remaining.toFixed(2)} {appSettings.currency}</span> for <span className="font-bold text-green-600">Free Shipping</span></span>
                      ) : (
                         <span className="text-green-600 font-bold flex items-center gap-2">You've earned Free Shipping!</span>
                      )}
                   </div>
                   <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 transition-all duration-1000 ease-out" style={{ width: `${progress}%` }}></div>
                   </div>
                </div>

                <div className="space-y-4">
                   {cart.map(item => {
                      const currentStock = products.find(p => p.id === item.id)?.stock || 0;
                      return (
                         <div key={item.id} className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-6 transition-all hover:shadow-md">
                            <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-50 rounded-xl p-2 flex-shrink-0 border border-gray-200 flex items-center justify-center">
                               <img src={item.image || `https://picsum.photos/seed/${item.imageSeed}/200/200`} className="w-full h-full object-contain" alt={item.name}/>
                            </div>
                            <div className="flex-1 flex flex-col justify-between">
                               <div>
                                  <div className="flex justify-between items-start mb-1">
                                     <h3 className="font-bold text-gray-900 text-lg line-clamp-1">{item.name}</h3>
                                     <span className="font-bold text-gray-900 text-lg hidden sm:block">{item.price * item.quantity} {appSettings.currency}</span>
                                  </div>
                                  <p className="text-gray-500 text-sm mb-4 font-medium">{item.brand}</p>
                                  {currentStock < 5 && currentStock > 0 && (
                                     <p className="text-xs text-orange-600 font-bold mb-3 flex items-center gap-1"><AlertCircle size={12}/> Low Stock: Only {currentStock} left</p>
                                  )}
                               </div>
                               
                               <div className="flex justify-between items-end">
                                  <div className="flex items-center gap-4 bg-gray-50 rounded-xl p-1.5 border border-gray-100 w-fit">
                                     <button 
                                       onClick={() => updateQuantity(item.id, item.quantity - 1)} 
                                       className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm hover:text-red-500 text-gray-600 transition-colors"
                                     >
                                        <Minus size={16}/>
                                     </button>
                                     <span className="w-6 text-center font-bold text-gray-900">{item.quantity}</span>
                                     <button 
                                       onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)} 
                                       className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm hover:text-green-500 text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                       disabled={item.quantity >= currentStock}
                                     >
                                        <Plus size={16}/>
                                     </button>
                                  </div>
                                  <button onClick={() => removeFromCart(item.id)} className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all" title="Remove">
                                     <Trash2 size={20} />
                                  </button>
                               </div>
                               <div className="sm:hidden mt-4 pt-3 border-t border-gray-50 font-bold text-gray-900 text-right">{item.price * item.quantity} {appSettings.currency}</div>
                            </div>
                         </div>
                      );
                   })}
                </div>
             </div>

             {/* Summary */}
             <div className="lg:col-span-1">
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 sticky top-24">
                   <h2 className="font-bold text-xl text-gray-900 mb-6">Order Summary</h2>
                   
                   {/* Promo Code */}
                   <div className="relative mb-8">
                      <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input 
                       type="text" 
                       value={coupon}
                       onChange={(e) => setCoupon(e.target.value)}
                       placeholder="Promo Code" 
                       className="w-full pl-11 pr-24 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                      />
                      <button 
                       onClick={handleApplyCoupon}
                       className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-white bg-gray-900 hover:bg-black px-4 py-2 rounded-lg transition-colors"
                      >
                         APPLY
                      </button>
                   </div>

                   <div className="space-y-4 mb-8">
                      <div className="flex justify-between text-gray-600 font-medium">
                         <span>Subtotal</span>
                         <span>{totalAmount.toLocaleString()} {appSettings.currency}</span>
                      </div>
                      <div className="flex justify-between text-gray-600 font-medium">
                         <span>Shipping</span>
                         <span className={remaining <= 0 ? "text-green-600 font-bold" : ""}>
                            {remaining <= 0 ? "Free" : `${appSettings.deliveryFee} ${appSettings.currency}`}
                         </span>
                      </div>
                      <div className="border-t border-gray-100 pt-4 flex justify-between font-black text-2xl text-gray-900 items-baseline">
                         <span className="text-lg font-bold text-gray-900">Total</span>
                         <span>{(totalAmount + (remaining <= 0 ? 0 : appSettings.deliveryFee)).toLocaleString()} {appSettings.currency}</span>
                      </div>
                   </div>

                   <div className="space-y-3">
                      <Link 
                        to="/checkout" 
                        className="w-full py-4 bg-primary text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-gray-800 transition-all shadow-xl shadow-primary/20 active:scale-95"
                      >
                         Proceed to Checkout <ArrowRight size={20}/>
                      </Link>
                      <Link 
                        to="/shop" 
                        className="w-full py-3.5 bg-white border-2 border-gray-100 text-gray-600 font-bold rounded-xl flex items-center justify-center hover:bg-gray-50 hover:border-gray-200 transition-all"
                      >
                         Continue Shopping
                      </Link>
                   </div>
                   
                   <p className="text-center text-xs text-gray-400 mt-6 font-medium">Secure Checkout via KNET</p>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
};