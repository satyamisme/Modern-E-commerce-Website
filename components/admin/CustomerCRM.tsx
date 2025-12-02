
import React, { useState } from 'react';
import { useShop } from '../../context/ShopContext';
import { Search, User, Mail, Phone, Calendar, DollarSign, ShoppingBag, Edit, ShieldCheck, Star, X, Plus, Trash2 } from 'lucide-react';
import { CustomerProfile } from '../../types';

export const CustomerCRM: React.FC = () => {
  const { customers, updateCustomer, deleteCustomer, showToast } = useShop();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerProfile | null>(null);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCustomer, setNewCustomer] = useState<Partial<CustomerProfile>>({
      name: '', email: '', phone: '', segment: 'New'
  });

  const filteredCustomers = customers.filter(c => 
    (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSegmentChange = (segment: CustomerProfile['segment']) => {
    if (selectedCustomer) {
      const updated = { ...selectedCustomer, segment };
      updateCustomer(updated);
      setSelectedCustomer(updated);
      showToast(`Moved customer to ${segment}`, 'success');
    }
  };

  const handleCreateCustomer = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newCustomer.name || !newCustomer.email) return;
      
      const customer: CustomerProfile = {
          id: `C-${Date.now()}`,
          name: newCustomer.name,
          email: newCustomer.email,
          phone: newCustomer.phone || '',
          joinDate: new Date().toISOString().split('T')[0],
          totalSpent: 0,
          ordersCount: 0,
          segment: 'New',
          lastOrderDate: '',
          avatar: `https://ui-avatars.com/api/?name=${newCustomer.name}`,
          notes: 'Manually added by Admin'
      };
      
      updateCustomer(customer);
      setShowAddModal(false);
      setNewCustomer({ name: '', email: '', phone: '', segment: 'New' });
      showToast('Customer created successfully', 'success');
  };

  const handleDelete = () => {
      if (selectedCustomer && confirm(`Are you sure you want to delete ${selectedCustomer.name}? This cannot be undone.`)) {
          deleteCustomer(selectedCustomer.id);
          setSelectedCustomer(null);
      }
  };

  return (
    <div className="flex h-[calc(100vh-140px)] gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      
      {/* List View */}
      <div className={`flex-1 bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col overflow-hidden transition-all ${selectedCustomer ? 'hidden md:flex md:w-1/2 lg:w-2/5' : 'w-full'}`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex justify-between items-center gap-4">
           <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
              <input 
                 type="text" 
                 placeholder="Search customers..." 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-primary outline-none"
              />
           </div>
           <button 
              onClick={() => setShowAddModal(true)}
              className="p-2.5 bg-primary text-white rounded-xl hover:bg-slate-800 transition-colors shadow-lg"
           >
              <Plus size={20} />
           </button>
        </div>
        
        {/* List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
           {filteredCustomers.map(customer => (
              <div 
                key={customer.id} 
                onClick={() => setSelectedCustomer(customer)}
                className={`p-4 border-b border-gray-50 cursor-pointer transition-colors hover:bg-gray-50 flex items-center gap-4 ${selectedCustomer?.id === customer.id ? 'bg-blue-50/50 border-l-4 border-l-primary' : ''}`}
              >
                 <img src={customer.avatar} alt={customer.name} className="w-10 h-10 rounded-full border border-gray-200" />
                 <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                       <h4 className="font-bold text-gray-900 text-sm truncate">{customer.name}</h4>
                       <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          customer.segment === 'VIP' ? 'bg-purple-100 text-purple-700' : 
                          customer.segment === 'New' ? 'bg-green-100 text-green-700' : 
                          customer.segment === 'At-Risk' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                       }`}>
                          {customer.segment}
                       </span>
                    </div>
                    <p className="text-xs text-gray-500 truncate">{customer.email}</p>
                 </div>
                 <div className="text-right hidden sm:block">
                    <p className="font-bold text-gray-900 text-sm">{customer.totalSpent} KWD</p>
                    <p className="text-[10px] text-gray-400">{customer.ordersCount} Orders</p>
                 </div>
              </div>
           ))}
        </div>
      </div>

      {/* Detail View (Customer 360) */}
      {selectedCustomer ? (
         <div className="flex-[2] bg-white rounded-3xl shadow-sm border border-gray-100 overflow-y-auto custom-scrollbar">
            <div className="p-8">
               {/* Header Info */}
               <div className="flex justify-between items-start mb-8">
                  <div className="flex items-center gap-6">
                     <img src={selectedCustomer.avatar} alt={selectedCustomer.name} className="w-24 h-24 rounded-full border-4 border-gray-50 shadow-sm" />
                     <div>
                        <h2 className="text-2xl font-black text-gray-900 mb-1">{selectedCustomer.name}</h2>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                           <span className="flex items-center gap-1"><Mail size={14}/> {selectedCustomer.email}</span>
                           <span className="flex items-center gap-1"><Phone size={14}/> {selectedCustomer.phone}</span>
                        </div>
                        <div className="flex gap-2">
                           {['VIP', 'Regular', 'New', 'At-Risk'].map((seg) => (
                              <button
                                 key={seg}
                                 onClick={() => handleSegmentChange(seg as any)}
                                 className={`text-[10px] font-bold px-3 py-1 rounded-lg border transition-all ${selectedCustomer.segment === seg ? 'bg-primary text-white border-primary' : 'bg-white text-gray-400 border-gray-200 hover:border-primary hover:text-primary'}`}
                              >
                                 {seg}
                              </button>
                           ))}
                        </div>
                     </div>
                  </div>
                  <div className="flex gap-2">
                      <button onClick={handleDelete} className="p-2 hover:bg-red-50 text-red-500 rounded-full" title="Delete Customer">
                         <Trash2 size={20} />
                      </button>
                      <button onClick={() => setSelectedCustomer(null)} className="p-2 hover:bg-gray-100 rounded-full md:hidden">
                         <X size={20} />
                      </button>
                  </div>
               </div>

               {/* Stats Grid */}
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                     <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Spend</p>
                     <p className="text-xl font-black text-gray-900 flex items-center gap-1"><DollarSign size={16} className="text-green-500"/> {selectedCustomer.totalSpent}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                     <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Orders</p>
                     <p className="text-xl font-black text-gray-900 flex items-center gap-1"><ShoppingBag size={16} className="text-blue-500"/> {selectedCustomer.ordersCount}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                     <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Join Date</p>
                     <p className="text-lg font-bold text-gray-900 flex items-center gap-1"><Calendar size={16} className="text-purple-500"/> {selectedCustomer.joinDate}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                     <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Risk Score</p>
                     <p className="text-lg font-bold text-gray-900 flex items-center gap-1"><ShieldCheck size={16} className="text-orange-500"/> Low</p>
                  </div>
               </div>

               {/* Activity & Notes */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                     <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Edit size={18}/> Admin Notes</h3>
                     <textarea 
                        className="w-full h-32 p-4 bg-yellow-50/50 border border-yellow-100 rounded-2xl text-sm text-gray-700 focus:outline-none focus:border-yellow-300 resize-none"
                        placeholder="Add internal notes about this customer..."
                        defaultValue={selectedCustomer.notes}
                        onBlur={(e) => updateCustomer({...selectedCustomer, notes: e.target.value})}
                     ></textarea>
                  </div>
                  <div>
                     <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Star size={18}/> Insights</h3>
                     <div className="space-y-3">
                        <div className="p-3 bg-blue-50 rounded-xl text-xs text-blue-700 border border-blue-100">
                           <strong>High LTV Potential:</strong> Customer consistently buys flagship models.
                        </div>
                        <div className="p-3 bg-green-50 rounded-xl text-xs text-green-700 border border-green-100">
                           <strong>Loyal:</strong> Has referred 2 other customers.
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      ) : (
         <div className="hidden md:flex flex-[2] bg-white rounded-3xl shadow-sm border border-gray-100 items-center justify-center text-center p-8">
            <div>
               <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                  <User size={40} />
               </div>
               <h3 className="text-xl font-bold text-gray-900 mb-2">Select a Customer</h3>
               <p className="text-gray-500 max-w-xs mx-auto">Click on a customer from the list to view their 360° profile and history.</p>
            </div>
         </div>
      )}

      {/* Add Customer Modal */}
      {showAddModal && (
          <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-gray-900">Add New Customer</h3>
                      <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded-full"><X size={20}/></button>
                  </div>
                  <form onSubmit={handleCreateCustomer} className="space-y-4">
                      <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
                          <input 
                              type="text" 
                              required
                              value={newCustomer.name}
                              onChange={e => setNewCustomer({...newCustomer, name: e.target.value})}
                              className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-primary"
                              placeholder="Ahmed Al-Sabah"
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
                          <input 
                              type="email" 
                              required
                              value={newCustomer.email}
                              onChange={e => setNewCustomer({...newCustomer, email: e.target.value})}
                              className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-primary"
                              placeholder="ahmed@example.com"
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">Phone</label>
                          <input 
                              type="tel" 
                              value={newCustomer.phone}
                              onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})}
                              className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-primary"
                              placeholder="+965 9999 9999"
                          />
                      </div>
                      <div className="pt-4">
                          <button type="submit" className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-lg">
                              Create Profile
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};
