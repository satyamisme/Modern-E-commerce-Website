

import React, { useState } from 'react';
import { RefreshCcw, AlertCircle, CheckCircle, Package, ArrowRight, Upload } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { ReturnRequest } from '../types';

export const Returns: React.FC = () => {
  const { addReturnRequest, user } = useShop();
  const [step, setStep] = useState<1 | 2>(1);
  const [formData, setFormData] = useState({
     orderId: '',
     email: user?.email || '',
     reason: 'Defective',
     condition: 'Sealed',
     details: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
     e.preventDefault();
     addReturnRequest({
        orderId: formData.orderId,
        customerEmail: formData.email,
        reason: formData.reason as any,
        condition: formData.condition as any,
        details: formData.details
     });
     setStep(2);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
         <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8 md:p-12">
            
            {step === 1 ? (
               <>
                  <div className="flex items-center gap-4 mb-8">
                     <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                        <RefreshCcw size={32} />
                     </div>
                     <div>
                        <h1 className="text-3xl font-bold text-gray-900">Returns & Refund Center</h1>
                        <p className="text-gray-500 text-sm mt-1">Submit a return request in 30 seconds.</p>
                     </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                           <label className="block text-sm font-bold text-gray-700 mb-2">Order ID</label>
                           <div className="relative">
                              <Package className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                              <input 
                                required
                                type="text" 
                                value={formData.orderId}
                                onChange={e => setFormData({...formData, orderId: e.target.value})}
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary transition-all"
                                placeholder="ORD-1234-XX"
                              />
                           </div>
                        </div>
                        <div>
                           <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                           <input 
                              required
                              type="email" 
                              value={formData.email}
                              onChange={e => setFormData({...formData, email: e.target.value})}
                              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary transition-all"
                              placeholder="you@example.com"
                           />
                        </div>
                        <div>
                           <label className="block text-sm font-bold text-gray-700 mb-2">Reason for Return</label>
                           <select 
                              value={formData.reason}
                              onChange={e => setFormData({...formData, reason: e.target.value})}
                              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary transition-all"
                           >
                              <option value="Defective">Defective / Not Working</option>
                              <option value="Wrong Item">Received Wrong Item</option>
                              <option value="Changed Mind">Changed Mind</option>
                              <option value="Other">Other</option>
                           </select>
                        </div>
                        <div>
                           <label className="block text-sm font-bold text-gray-700 mb-2">Item Condition</label>
                           <select 
                              value={formData.condition}
                              onChange={e => setFormData({...formData, condition: e.target.value})}
                              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary transition-all"
                           >
                              <option value="Sealed">Brand New (Sealed)</option>
                              <option value="Opened">Opened (Box unsealed)</option>
                           </select>
                        </div>
                        <div className="md:col-span-2">
                           <label className="block text-sm font-bold text-gray-700 mb-2">Additional Details</label>
                           <textarea 
                              required
                              value={formData.details}
                              onChange={e => setFormData({...formData, details: e.target.value})}
                              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary transition-all h-32 resize-none"
                              placeholder="Please describe the issue or reason for return..."
                           />
                        </div>
                     </div>

                     <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg flex gap-3">
                        <AlertCircle className="text-yellow-600 flex-shrink-0" />
                        <p className="text-sm text-yellow-800 m-0">
                           <strong>Policy Note:</strong> Returns for "Changed Mind" are only accepted for sealed items within 14 days. Defective items are covered under warranty.
                        </p>
                     </div>

                     <button 
                        type="submit" 
                        className="w-full py-4 bg-primary text-white font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg flex items-center justify-center gap-2"
                     >
                        Submit Request <ArrowRight size={18} />
                     </button>
                  </form>
               </>
            ) : (
               <div className="text-center py-12 animate-in zoom-in-95 duration-300">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                     <CheckCircle size={40} className="text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Request Submitted</h2>
                  <p className="text-gray-500 mb-8 max-w-md mx-auto">
                     We have received your return request. Our team will review it and send you a shipping label via email within 24 hours.
                  </p>
                  <button 
                     onClick={() => setStep(1)}
                     className="px-8 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                  >
                     Return to Form
                  </button>
               </div>
            )}
         </div>
      </div>
    </div>
  );
};