
import React, { useState } from 'react';
import { Package, Search, AlertCircle, CheckCircle, ArrowRight, Truck } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { Order } from '../types';
import { Link } from 'react-router-dom';

export const TrackOrder: React.FC = () => {
  const { orders } = useShop();
  const [orderId, setOrderId] = useState('');
  const [email, setEmail] = useState('');
  const [searchResult, setSearchResult] = useState<{ found: boolean; order?: Order; searched: boolean }>({ found: false, searched: false });

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    const order = orders.find(o => o.id === orderId.trim() && o.customer.email.toLowerCase() === email.trim().toLowerCase());
    setSearchResult({ found: !!order, order, searched: true });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
           <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Truck size={32} />
           </div>
           <h1 className="text-3xl font-bold text-gray-900 mb-2">Track Your Order</h1>
           <p className="text-gray-500">Enter your order details below to check the latest status.</p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8 md:p-12 mb-8">
           <form onSubmit={handleTrack} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-1 md:col-span-2">
                 <label className="block text-sm font-medium text-gray-700 mb-2">Order ID</label>
                 <div className="relative">
                    <Package className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="text" 
                      required
                      value={orderId}
                      onChange={(e) => setOrderId(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent/50 focus:border-accent outline-none transition-all"
                      placeholder="e.g. ORD-7782-XJ"
                    />
                 </div>
              </div>
              <div className="col-span-1 md:col-span-2">
                 <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                 <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="email" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent/50 focus:border-accent outline-none transition-all"
                      placeholder="Enter billing email"
                    />
                 </div>
              </div>
              <div className="col-span-1 md:col-span-2">
                 <button 
                   type="submit" 
                   className="w-full py-4 bg-primary text-white font-bold rounded-xl hover:bg-gray-800 transition-colors shadow-lg shadow-gray-900/10 flex items-center justify-center gap-2"
                 >
                    Track Order <ArrowRight size={18} />
                 </button>
              </div>
           </form>
        </div>

        {searchResult.searched && (
           <div className="animate-in slide-in-from-bottom-5 fade-in">
              {searchResult.found && searchResult.order ? (
                 <div className="bg-white rounded-3xl shadow-lg border border-green-100 overflow-hidden">
                    <div className="bg-green-50 p-6 border-b border-green-100 flex items-center gap-3">
                       <CheckCircle className="text-green-600" size={24} />
                       <div>
                          <h3 className="font-bold text-gray-900">Order Found</h3>
                          <p className="text-sm text-green-700">Updated just now</p>
                       </div>
                    </div>
                    <div className="p-8 space-y-6">
                       <div className="flex flex-wrap justify-between items-center gap-4 pb-6 border-b border-gray-100">
                          <div>
                             <p className="text-sm text-gray-500">Current Status</p>
                             <p className="text-2xl font-bold text-primary">{searchResult.order.status}</p>
                          </div>
                          <div className="text-right">
                             <p className="text-sm text-gray-500">Estimated Delivery</p>
                             <p className="text-lg font-bold text-gray-900">Tomorrow, 8 PM</p>
                          </div>
                       </div>
                       
                       <div>
                          <h4 className="font-bold text-gray-900 mb-4">Order Items</h4>
                          <div className="space-y-4">
                             {searchResult.order.items.map(item => (
                                <div key={item.id} className="flex items-center gap-4 bg-gray-50 p-3 rounded-xl">
                                   <img src={`https://picsum.photos/seed/${item.imageSeed}/50/50`} className="w-12 h-12 rounded-lg bg-white border border-gray-200 object-contain" alt={item.name}/>
                                   <div className="flex-1">
                                      <p className="font-bold text-gray-900 text-sm">{item.name}</p>
                                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                   </div>
                                   <span className="font-bold text-gray-900 text-sm">{item.price * item.quantity} KWD</span>
                                </div>
                             ))}
                          </div>
                       </div>
                    </div>
                 </div>
              ) : (
                 <div className="bg-white rounded-3xl shadow-sm border border-red-100 p-8 text-center">
                    <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                       <AlertCircle size={24} />
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg mb-2">Order Not Found</h3>
                    <p className="text-gray-500 mb-6">We couldn't find an order with these details. Please check your input and try again.</p>
                    <Link to="/contact" className="text-primary font-bold hover:underline">Contact Support</Link>
                 </div>
              )}
           </div>
        )}
      </div>
    </div>
  );
};
