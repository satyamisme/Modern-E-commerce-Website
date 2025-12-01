import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { Navigate } from 'react-router-dom';
import { User, Package, MapPin, Settings, LogOut, ChevronRight, Box, Trash2, Home, Briefcase, Plus } from 'lucide-react';
import { Address } from '../types';

export const Account: React.FC = () => {
  const { user, logout, orders, addAddress, removeAddress } = useShop();
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'addresses'>('orders');
  
  // Address Form State
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState<Partial<Address>>({
     type: 'Home',
     street: '',
     city: '',
     zip: '',
     phone: ''
  });

  if (!user) return <Navigate to="/login" replace />;

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if(newAddress.street && newAddress.city && newAddress.zip && newAddress.phone) {
       addAddress(newAddress as Omit<Address, 'id'>);
       setShowAddressForm(false);
       setNewAddress({ type: 'Home', street: '', city: '', zip: '', phone: '' });
    }
  };

  const TabButton = ({ id, icon: Icon, label }: { id: typeof activeTab, icon: any, label: string }) => (
    <button
       onClick={() => setActiveTab(id)}
       className={`flex items-center gap-3 w-full px-4 py-3.5 rounded-xl text-sm font-medium transition-all ${
          activeTab === id 
             ? 'bg-primary text-white shadow-lg shadow-primary/20' 
             : 'text-gray-600 hover:bg-gray-50'
       }`}
    >
       <Icon size={18} /> {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">My Account</h1>
          
          <div className="flex flex-col lg:flex-row gap-8">
             {/* Sidebar */}
             <div className="lg:w-72 flex-shrink-0">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6 text-center">
                   <img src={user.avatar} alt={user.name} className="w-20 h-20 rounded-full mx-auto mb-4 border-4 border-gray-50" />
                   <h2 className="text-lg font-bold text-gray-900">{user.name}</h2>
                   <p className="text-sm text-gray-500">{user.email}</p>
                   {user.role !== 'User' && <span className="inline-block mt-2 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-bold rounded">{user.role}</span>}
                </div>
                
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-1">
                   <TabButton id="orders" icon={Package} label="My Orders" />
                   <TabButton id="profile" icon={User} label="Profile Details" />
                   <TabButton id="addresses" icon={MapPin} label="Addresses" />
                   
                   <div className="h-px bg-gray-100 my-2"></div>
                   
                   <button 
                      onClick={logout}
                      className="flex items-center gap-3 w-full px-4 py-3.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                   >
                      <LogOut size={18} /> Sign Out
                   </button>
                </div>
             </div>

             {/* Content Area */}
             <div className="flex-1">
                {activeTab === 'orders' && (
                   <div className="space-y-6">
                      <h2 className="text-xl font-bold text-gray-900">Order History</h2>
                      {orders.length === 0 ? (
                         <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
                            <Box size={48} className="mx-auto text-gray-300 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900">No orders yet</h3>
                            <p className="text-gray-500">When you place an order, it will appear here.</p>
                         </div>
                      ) : (
                         orders.map(order => (
                            <div key={order.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                               <div className="p-6 border-b border-gray-100 flex flex-wrap justify-between items-center gap-4 bg-gray-50/50">
                                  <div>
                                     <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Order ID</span>
                                     <p className="font-bold text-gray-900">{order.id}</p>
                                  </div>
                                  <div>
                                     <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Date</span>
                                     <p className="text-sm text-gray-700">{order.date}</p>
                                  </div>
                                  <div>
                                     <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Total Amount</span>
                                     <p className="font-bold text-primary">${order.total}</p>
                                  </div>
                                  <div className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-green-100 text-green-700 border border-green-200">
                                     {order.status}
                                  </div>
                               </div>
                               <div className="p-6 space-y-4">
                                  {order.items.map(item => (
                                     <div key={item.id} className="flex items-center gap-4">
                                        <div className="w-16 h-16 bg-gray-50 rounded-lg p-2 border border-gray-200">
                                           <img src={`https://picsum.photos/seed/${item.imageSeed}/100/100`} className="w-full h-full object-contain" alt={item.name}/>
                                        </div>
                                        <div className="flex-1">
                                           <h4 className="font-semibold text-gray-900">{item.name}</h4>
                                           <p className="text-sm text-gray-500">{item.brand}</p>
                                        </div>
                                        <div className="text-right">
                                           <p className="text-sm font-bold text-gray-900">${item.price}</p>
                                           <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                        </div>
                                     </div>
                                  ))}
                               </div>
                               <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                                  <button className="text-sm font-bold text-accent hover:text-primary transition-colors flex items-center gap-1">
                                     View Invoice <ChevronRight size={16} />
                                  </button>
                               </div>
                            </div>
                         ))
                      )}
                   </div>
                )}

                {activeTab === 'profile' && (
                   <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                      <h2 className="text-xl font-bold text-gray-900 mb-6">Profile Details</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                            <input type="text" defaultValue={user.name} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-accent" />
                         </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                            <input type="email" defaultValue={user.email} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-accent" disabled />
                         </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                            <input type="tel" placeholder="+1 (555) 000-0000" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-accent" />
                         </div>
                      </div>
                      <button className="mt-8 px-6 py-3 bg-primary text-white font-bold rounded-lg hover:bg-gray-800 transition-colors">
                         Save Changes
                      </button>
                   </div>
                )}

                {activeTab === 'addresses' && (
                   <div className="space-y-6">
                      <div className="flex justify-between items-center">
                         <h2 className="text-xl font-bold text-gray-900">Saved Addresses</h2>
                         <button 
                           onClick={() => setShowAddressForm(!showAddressForm)}
                           className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg font-bold text-sm hover:bg-blue-600 transition-colors"
                         >
                            <Plus size={16}/> Add New
                         </button>
                      </div>

                      {showAddressForm && (
                         <div className="bg-white rounded-2xl border border-gray-200 p-6 animate-fade-in-up">
                            <h3 className="font-bold text-gray-900 mb-4">Add New Address</h3>
                            <form onSubmit={handleAddAddress} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                               <div className="col-span-2 md:col-span-1">
                                  <label className="block text-sm text-gray-600 mb-1">Label</label>
                                  <select 
                                    value={newAddress.type} 
                                    onChange={e => setNewAddress({...newAddress, type: e.target.value as any})}
                                    className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-accent"
                                  >
                                     <option value="Home">Home</option>
                                     <option value="Work">Work</option>
                                     <option value="Other">Other</option>
                                  </select>
                               </div>
                               <div className="col-span-2 md:col-span-1">
                                  <label className="block text-sm text-gray-600 mb-1">Phone</label>
                                  <input 
                                    type="text" 
                                    required
                                    value={newAddress.phone}
                                    onChange={e => setNewAddress({...newAddress, phone: e.target.value})}
                                    className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-accent"
                                    placeholder="+1 234 567 890"
                                  />
                               </div>
                               <div className="col-span-2">
                                  <label className="block text-sm text-gray-600 mb-1">Street Address</label>
                                  <input 
                                    type="text"
                                    required 
                                    value={newAddress.street}
                                    onChange={e => setNewAddress({...newAddress, street: e.target.value})}
                                    className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-accent"
                                    placeholder="123 Main St, Apt 4B"
                                  />
                               </div>
                               <div>
                                  <label className="block text-sm text-gray-600 mb-1">City</label>
                                  <input 
                                    type="text"
                                    required 
                                    value={newAddress.city}
                                    onChange={e => setNewAddress({...newAddress, city: e.target.value})}
                                    className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-accent"
                                    placeholder="New York"
                                  />
                               </div>
                               <div>
                                  <label className="block text-sm text-gray-600 mb-1">ZIP Code</label>
                                  <input 
                                    type="text"
                                    required 
                                    value={newAddress.zip}
                                    onChange={e => setNewAddress({...newAddress, zip: e.target.value})}
                                    className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-accent"
                                    placeholder="10001"
                                  />
                               </div>
                               <div className="col-span-2 flex gap-3 mt-2">
                                  <button type="submit" className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-gray-800 transition-colors">Save Address</button>
                                  <button type="button" onClick={() => setShowAddressForm(false)} className="px-6 py-2 border border-gray-300 text-gray-600 font-bold rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
                               </div>
                            </form>
                         </div>
                      )}

                      {user.addresses.length === 0 && !showAddressForm ? (
                         <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center py-16">
                            <MapPin size={48} className="mx-auto text-gray-300 mb-4" />
                            <h3 className="text-lg font-bold text-gray-900 mb-2">No Saved Addresses</h3>
                            <p className="text-gray-500">Add a shipping address to speed up checkout.</p>
                         </div>
                      ) : (
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {user.addresses.map(addr => (
                               <div key={addr.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative group">
                                  <div className="flex items-center gap-3 mb-3">
                                     <div className="p-2 bg-gray-50 rounded-lg text-gray-600">
                                        {addr.type === 'Home' ? <Home size={18}/> : addr.type === 'Work' ? <Briefcase size={18}/> : <MapPin size={18}/>}
                                     </div>
                                     <span className="font-bold text-gray-900">{addr.type}</span>
                                     {addr.isDefault && <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-bold">Default</span>}
                                  </div>
                                  <p className="text-gray-600 text-sm mb-1">{addr.street}</p>
                                  <p className="text-gray-600 text-sm mb-1">{addr.city}, {addr.zip}</p>
                                  <p className="text-gray-500 text-xs mt-2">{addr.phone}</p>
                                  <button 
                                    onClick={() => removeAddress(addr.id)}
                                    className="absolute top-4 right-4 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                                  >
                                     <Trash2 size={16} />
                                  </button>
                               </div>
                            ))}
                         </div>
                      )}
                   </div>
                )}
             </div>
          </div>
       </div>
    </div>
  );
};