import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { useNavigate } from 'react-router-dom';
import { Wallet, MapPin, CreditCard, CheckCircle, Package, ArrowRight, User, Truck, ShieldCheck, ChevronRight } from 'lucide-react';

export const Checkout: React.FC = () => {
  const { cart, totalAmount, appSettings, user } = useShop();
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  
  const [paymentMethod, setPaymentMethod] = useState<'knet' | 'credit'>('knet');
  const [formData, setFormData] = useState({
     fname: user?.name.split(' ')[0] || '', 
     lname: user?.name.split(' ').slice(1).join(' ') || '', 
     email: user?.email || '', 
     phone: user?.phone || '',
     governorate: 'Capital', area: '', block: '', street: ''
  });

  const finalTotal = totalAmount + (totalAmount >= appSettings.freeShippingThreshold ? 0 : appSettings.deliveryFee);

  const handleNextStep = (e: React.FormEvent) => {
     e.preventDefault();
     setStep(prev => prev < 3 ? prev + 1 as any : prev);
     window.scrollTo(0, 0);
  };

  const handlePlaceOrder = () => {
     // Construct full address string
     const fullAddress = `${formData.street}, Block ${formData.block}, ${formData.area}, ${formData.governorate}`;
     
     // Save checkout details to session storage
     const checkoutData = {
        customer: {
           name: `${formData.fname} ${formData.lname}`,
           email: formData.email,
           phone: formData.phone,
           address: fullAddress
        },
        paymentMethod
     };
     sessionStorage.setItem('pendingCheckout', JSON.stringify(checkoutData));

     const orderRef = `ORD-${Date.now()}`;
     navigate(`/knet-gateway?amount=${finalTotal}&ref=${orderRef}`);
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-center">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <Package size={40} className="text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-8">Add items to your cart to proceed with checkout.</p>
        <button onClick={() => navigate('/shop')} className="px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-slate-800 transition-colors">Start Shopping</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 py-12 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
         <h1 className="text-3xl font-black text-gray-900 mb-10 text-center">Secure Checkout</h1>

         {/* Progress Indicator */}
         <div className="mb-12 max-w-3xl mx-auto">
            <div className="flex items-center justify-between relative">
               <div className="absolute left-0 top-1/2 w-full h-1 bg-gray-200 -z-10 rounded-full"></div>
               <div className={`absolute left-0 top-1/2 h-1 bg-primary -z-10 transition-all duration-500 rounded-full`} style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}></div>
               
               {[
                  { num: 1, label: "Shipping Info", icon: MapPin },
                  { num: 2, label: "Payment", icon: Wallet },
                  { num: 3, label: "Confirmation", icon: CheckCircle }
               ].map((s) => (
                  <div key={s.num} className="flex flex-col items-center gap-3 bg-gray-50 px-4 rounded-full z-10">
                     <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold border-4 transition-all shadow-sm ${step >= s.num ? 'bg-primary border-primary text-white' : 'bg-white border-gray-200 text-gray-400'}`}>
                        {step > s.num ? <CheckCircle size={20}/> : <span>{s.num}</span>}
                     </div>
                     <span className={`text-xs font-bold uppercase tracking-wider ${step >= s.num ? 'text-primary' : 'text-gray-400'}`}>{s.label}</span>
                  </div>
               ))}
            </div>
         </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Form Area */}
          <div className="lg:col-span-8 space-y-6">
               
               {/* STEP 1: SHIPPING */}
               {step === 1 && (
                  <form onSubmit={handleNextStep} className="bg-white p-8 md:p-10 rounded-[2rem] shadow-sm border border-gray-100 animate-in slide-in-from-right-8 fade-in duration-300">
                     <div className="flex items-center gap-4 mb-8 pb-4 border-b border-gray-100">
                        <div className="p-3 bg-blue-50 text-primary rounded-xl"><User size={24}/></div>
                        <h2 className="text-2xl font-bold text-gray-900">Contact Information</h2>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                        <div>
                           <label className="block text-xs font-bold text-gray-500 uppercase mb-2">First Name</label>
                           <input required type="text" value={formData.fname} onChange={e => setFormData({...formData, fname: e.target.value})} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/5 outline-none transition-all font-medium" placeholder="John" />
                        </div>
                        <div>
                           <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Last Name</label>
                           <input required type="text" value={formData.lname} onChange={e => setFormData({...formData, lname: e.target.value})} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/5 outline-none transition-all font-medium" placeholder="Doe" />
                        </div>
                        <div className="md:col-span-2">
                           <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Email Address</label>
                           <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/5 outline-none transition-all font-medium" placeholder="john@example.com" />
                        </div>
                        <div className="md:col-span-2">
                           <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Phone Number (Kuwait)</label>
                           <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/5 outline-none transition-all font-medium" placeholder="+965 9999 9999" />
                        </div>
                     </div>

                     <div className="flex items-center gap-4 mb-8 pb-4 border-b border-gray-100">
                        <div className="p-3 bg-blue-50 text-primary rounded-xl"><Truck size={24}/></div>
                        <h2 className="text-2xl font-bold text-gray-900">Shipping Address</h2>
                     </div>
                     <div className="grid grid-cols-2 gap-6">
                        <div className="col-span-2 md:col-span-1">
                           <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Governorate</label>
                           <div className="relative">
                              <select 
                                 value={formData.governorate}
                                 onChange={e => setFormData({...formData, governorate: e.target.value})}
                                 className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/5 outline-none transition-all appearance-none font-medium cursor-pointer"
                              >
                                 <option value="Capital">Capital</option>
                                 <option value="Hawalli">Hawalli</option>
                                 <option value="Farwaniya">Farwaniya</option>
                                 <option value="Ahmadi">Ahmadi</option>
                                 <option value="Jahra">Jahra</option>
                                 <option value="Mubarak Al-Kabeer">Mubarak Al-Kabeer</option>
                              </select>
                              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500"><ChevronRight size={16} className="rotate-90"/></div>
                           </div>
                        </div>
                        <div className="col-span-2 md:col-span-1">
                           <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Area</label>
                           <input required type="text" value={formData.area} onChange={e => setFormData({...formData, area: e.target.value})} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/5 outline-none transition-all font-medium" />
                        </div>
                        <div>
                           <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Block</label>
                           <input required type="text" value={formData.block} onChange={e => setFormData({...formData, block: e.target.value})} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/5 outline-none transition-all font-medium" />
                        </div>
                        <div>
                           <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Street</label>
                           <input required type="text" value={formData.street} onChange={e => setFormData({...formData, street: e.target.value})} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/5 outline-none transition-all font-medium" />
                        </div>
                     </div>

                     <div className="mt-10 flex justify-end">
                        <button type="submit" className="px-10 py-4 bg-primary text-white font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-primary/20 flex items-center gap-2 hover:translate-x-1">
                           Continue to Payment <ArrowRight size={20} />
                        </button>
                     </div>
                  </form>
               )}

               {/* STEP 2: PAYMENT */}
               {step === 2 && (
                  <div className="bg-white p-8 md:p-10 rounded-[2rem] shadow-sm border border-gray-100 animate-in slide-in-from-right-8 fade-in duration-300">
                     <div className="flex items-center gap-4 mb-8 pb-4 border-b border-gray-100">
                        <div className="p-3 bg-blue-50 text-primary rounded-xl"><Wallet size={24}/></div>
                        <h2 className="text-2xl font-bold text-gray-900">Select Payment Method</h2>
                     </div>

                     <div className="space-y-4 mb-10">
                        {appSettings.enableKnet && (
                           <label 
                              onClick={() => setPaymentMethod('knet')}
                              className={`cursor-pointer p-6 border-2 rounded-2xl flex items-center justify-between transition-all group ${paymentMethod === 'knet' ? 'border-primary bg-blue-50/50' : 'border-gray-100 hover:border-gray-200'}`}
                           >
                              <div className="flex items-center gap-5">
                                 <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${paymentMethod === 'knet' ? 'border-primary' : 'border-gray-300'}`}>
                                    {paymentMethod === 'knet' && <div className="w-3 h-3 bg-primary rounded-full"></div>}
                                 </div>
                                 <div>
                                    <span className="font-bold text-lg text-gray-900 block mb-0.5">KNET Payment</span>
                                    <span className="text-sm text-gray-500">Secure local debit card payment</span>
                                 </div>
                              </div>
                              <span className="text-[10px] font-bold bg-green-100 text-green-700 px-3 py-1 rounded-full border border-green-200">Recommended</span>
                           </label>
                        )}
                        {appSettings.enableCreditCard && (
                           <label 
                              onClick={() => setPaymentMethod('credit')}
                              className={`cursor-pointer p-6 border-2 rounded-2xl flex items-center justify-between transition-all group ${paymentMethod === 'credit' ? 'border-primary bg-blue-50/50' : 'border-gray-100 hover:border-gray-200'}`}
                           >
                              <div className="flex items-center gap-5">
                                 <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${paymentMethod === 'credit' ? 'border-primary' : 'border-gray-300'}`}>
                                    {paymentMethod === 'credit' && <div className="w-3 h-3 bg-primary rounded-full"></div>}
                                 </div>
                                 <div>
                                    <span className="font-bold text-lg text-gray-900 block mb-0.5">Credit Card</span>
                                    <span className="text-sm text-gray-500">Visa / Mastercard</span>
                                 </div>
                              </div>
                              <CreditCard size={24} className="text-gray-400 group-hover:text-primary transition-colors" />
                           </label>
                        )}
                     </div>

                     <div className="flex justify-between mt-10">
                        <button onClick={() => setStep(1)} className="px-8 py-4 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-colors">
                           Back
                        </button>
                        <button onClick={() => setStep(3)} className="px-10 py-4 bg-primary text-white font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-primary/20 flex items-center gap-2 hover:translate-x-1">
                           Review Order <ArrowRight size={20} />
                        </button>
                     </div>
                  </div>
               )}

               {/* STEP 3: REVIEW */}
               {step === 3 && (
                  <div className="bg-white p-8 md:p-10 rounded-[2rem] shadow-sm border border-gray-100 animate-in slide-in-from-right-8 fade-in duration-300">
                     <div className="flex items-center gap-4 mb-8 pb-4 border-b border-gray-100">
                        <div className="p-3 bg-blue-50 text-primary rounded-xl"><CheckCircle size={24}/></div>
                        <h2 className="text-2xl font-bold text-gray-900">Review & Confirm</h2>
                     </div>

                     <div className="bg-gray-50 rounded-2xl p-6 mb-8 grid grid-cols-1 md:grid-cols-2 gap-8 border border-gray-100">
                        <div>
                           <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Shipping To</p>
                           <p className="font-bold text-gray-900 text-lg mb-1">{formData.fname} {formData.lname}</p>
                           <p className="text-sm text-gray-600 leading-relaxed">{formData.street}, Block {formData.block}</p>
                           <p className="text-sm text-gray-600 leading-relaxed">{formData.area}, {formData.governorate}</p>
                           <p className="text-sm text-gray-600 mt-2 font-medium">{formData.phone}</p>
                        </div>
                        <div>
                           <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Payment Method</p>
                           <div className="flex items-center gap-3 text-primary font-bold bg-white p-4 rounded-xl border border-gray-100 w-fit">
                              {paymentMethod === 'knet' ? <div className="w-3 h-3 bg-primary rounded-full"></div> : <CreditCard size={20}/>}
                              {paymentMethod === 'knet' ? 'KNET' : 'Credit Card'}
                           </div>
                        </div>
                     </div>

                     <div className="space-y-6 mb-10">
                        <h3 className="font-bold text-gray-900 text-lg">Order Items</h3>
                        <div className="space-y-4">
                           {cart.map(item => (
                              <div key={item.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:border-gray-200 transition-colors">
                                 <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-lg bg-gray-50 p-1 border border-gray-100">
                                       <img src={item.image || `https://picsum.photos/seed/${item.imageSeed}/100/100`} className="w-full h-full object-contain" alt={item.name}/>
                                    </div>
                                    <div>
                                       <p className="font-bold text-gray-900">{item.name}</p>
                                       <p className="text-xs text-gray-500 font-medium">Qty: {item.quantity}</p>
                                    </div>
                                 </div>
                                 <span className="font-bold text-gray-900">{item.price * item.quantity} {appSettings.currency}</span>
                              </div>
                           ))}
                        </div>
                     </div>

                     <div className="flex justify-between mt-10">
                        <button onClick={() => setStep(2)} className="px-8 py-4 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-colors">
                           Back
                        </button>
                        <button onClick={handlePlaceOrder} className="px-10 py-4 bg-primary text-white font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-primary/20 flex items-center gap-2 hover:-translate-y-1">
                           Pay {finalTotal} {appSettings.currency}
                        </button>
                     </div>
                  </div>
               )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-4">
             <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 h-fit sticky top-24">
               <h2 className="text-xl font-bold mb-8 flex items-center gap-2 text-gray-900">Order Summary</h2>
               
               <div className="space-y-4 mb-8">
                 <div className="flex justify-between text-sm text-gray-600 font-medium">
                   <span>Subtotal ({cart.length} items)</span>
                   <span className="text-gray-900">{totalAmount.toLocaleString()} {appSettings.currency}</span>
                 </div>
                 <div className="flex justify-between text-sm text-gray-600 font-medium">
                   <span>Shipping</span>
                   <span className={totalAmount >= appSettings.freeShippingThreshold ? "text-green-600 font-bold" : "text-gray-900"}>
                      {totalAmount >= appSettings.freeShippingThreshold ? 'FREE' : `${appSettings.deliveryFee} ${appSettings.currency}`}
                   </span>
                 </div>
                 <div className="flex justify-between text-2xl font-black text-gray-900 pt-6 border-t border-gray-100">
                   <span>Total</span>
                   <span>{finalTotal.toLocaleString()} {appSettings.currency}</span>
                 </div>
               </div>

               <div className="bg-blue-50 p-5 rounded-2xl flex gap-4 mb-6 border border-blue-100">
                  <ShieldCheck size={28} className="text-blue-600 flex-shrink-0 mt-0.5"/>
                  <div>
                     <p className="text-sm font-bold text-blue-800 uppercase tracking-wide mb-1">Buyer Protection</p>
                     <p className="text-xs text-blue-600 leading-relaxed">Secure payments. Data privacy. 100% Authentic products guaranteed.</p>
                  </div>
               </div>
               
               <div className="text-center text-xs text-gray-400 font-medium">
                  By placing order, you agree to our <a href="#" className="underline hover:text-primary">Terms of Service</a>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};