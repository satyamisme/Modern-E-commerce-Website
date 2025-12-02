
import React, { useState } from 'react';
import { useShop } from '../../context/ShopContext';
import { Truck, Plus, Search, Edit, Trash2, Phone, Mail, MapPin, X, User } from 'lucide-react';
import { Supplier } from '../../types';

export const SupplierManager: React.FC = () => {
  const { suppliers, addSupplier, updateSupplier, deleteSupplier, showToast } = useShop();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Partial<Supplier>>({
      name: '', type: 'Distributor', contactPerson: '', email: '', phone: '', address: ''
  });

  const filteredSuppliers = suppliers.filter(s => 
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = (e: React.FormEvent) => {
      e.preventDefault();
      if (!editingSupplier.name) return;

      if (editingSupplier.id) {
          updateSupplier(editingSupplier as Supplier);
      } else {
          const newSup: Supplier = {
              id: `SUP-${Date.now()}`,
              name: editingSupplier.name!,
              type: editingSupplier.type as any || 'Distributor',
              contactPerson: editingSupplier.contactPerson || '',
              email: editingSupplier.email || '',
              phone: editingSupplier.phone || '',
              address: editingSupplier.address || '',
              notes: editingSupplier.notes || ''
          };
          addSupplier(newSup);
      }
      setShowModal(false);
      setEditingSupplier({ name: '', type: 'Distributor', contactPerson: '', email: '', phone: '', address: '' });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
       <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div>
             <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Truck className="text-primary" size={24}/> Supplier Management
             </h2>
             <p className="text-sm text-gray-500">Manage your vendors, wholesalers, and retailers.</p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
             <div className="relative flex-1 md:w-64">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                <input 
                   type="text" 
                   placeholder="Search suppliers..." 
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-primary outline-none"
                />
             </div>
             <button 
                onClick={() => { setEditingSupplier({}); setShowModal(true); }}
                className="px-4 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-slate-800 transition-colors flex items-center gap-2 shadow-lg"
             >
                <Plus size={18}/> Add New
             </button>
          </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSuppliers.map(supplier => (
             <div key={supplier.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                <div className="flex justify-between items-start mb-4">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 font-bold border border-blue-100">
                         {supplier.name.charAt(0)}
                      </div>
                      <div>
                         <h3 className="font-bold text-gray-900 text-sm">{supplier.name}</h3>
                         <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50 px-2 py-0.5 rounded">{supplier.type}</span>
                      </div>
                   </div>
                   <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setEditingSupplier(supplier); setShowModal(true); }} className="p-1.5 hover:bg-gray-100 rounded-lg text-blue-600">
                         <Edit size={16}/>
                      </button>
                      <button onClick={() => { if(confirm('Delete supplier?')) deleteSupplier(supplier.id); }} className="p-1.5 hover:bg-gray-100 rounded-lg text-red-600">
                         <Trash2 size={16}/>
                      </button>
                   </div>
                </div>
                
                <div className="space-y-3 text-sm text-gray-600">
                   <div className="flex items-center gap-3">
                      <User size={16} className="text-gray-400"/>
                      <span className="font-medium text-gray-900">{supplier.contactPerson}</span>
                   </div>
                   <div className="flex items-center gap-3">
                      <Phone size={16} className="text-gray-400"/>
                      <span>{supplier.phone}</span>
                   </div>
                   <div className="flex items-center gap-3">
                      <Mail size={16} className="text-gray-400"/>
                      <span className="truncate">{supplier.email}</span>
                   </div>
                   <div className="flex items-center gap-3">
                      <MapPin size={16} className="text-gray-400"/>
                      <span className="truncate">{supplier.address}</span>
                   </div>
                </div>
             </div>
          ))}
       </div>

       {showModal && (
          <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
             <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 animate-in zoom-in-95">
                <div className="flex justify-between items-center mb-6">
                   <h3 className="text-xl font-bold text-gray-900">{editingSupplier.id ? 'Edit Supplier' : 'Add New Supplier'}</h3>
                   <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-full"><X size={20}/></button>
                </div>
                
                <form onSubmit={handleSave} className="space-y-4">
                   <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                         <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Company Name</label>
                         <input type="text" required value={editingSupplier.name || ''} onChange={e => setEditingSupplier({...editingSupplier, name: e.target.value})} className="w-full p-3 border border-gray-200 rounded-xl focus:border-primary outline-none"/>
                      </div>
                      <div>
                         <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Type</label>
                         <select value={editingSupplier.type} onChange={e => setEditingSupplier({...editingSupplier, type: e.target.value as any})} className="w-full p-3 border border-gray-200 rounded-xl focus:border-primary outline-none bg-white">
                            <option value="Distributor">Distributor</option>
                            <option value="Wholesaler">Wholesaler</option>
                            <option value="Retailer">Retailer</option>
                            <option value="Individual">Individual</option>
                         </select>
                      </div>
                      <div>
                         <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Contact Person</label>
                         <input type="text" value={editingSupplier.contactPerson || ''} onChange={e => setEditingSupplier({...editingSupplier, contactPerson: e.target.value})} className="w-full p-3 border border-gray-200 rounded-xl focus:border-primary outline-none"/>
                      </div>
                      <div>
                         <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email</label>
                         <input type="email" value={editingSupplier.email || ''} onChange={e => setEditingSupplier({...editingSupplier, email: e.target.value})} className="w-full p-3 border border-gray-200 rounded-xl focus:border-primary outline-none"/>
                      </div>
                      <div>
                         <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone</label>
                         <input type="text" value={editingSupplier.phone || ''} onChange={e => setEditingSupplier({...editingSupplier, phone: e.target.value})} className="w-full p-3 border border-gray-200 rounded-xl focus:border-primary outline-none"/>
                      </div>
                      <div className="col-span-2">
                         <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Address</label>
                         <input type="text" value={editingSupplier.address || ''} onChange={e => setEditingSupplier({...editingSupplier, address: e.target.value})} className="w-full p-3 border border-gray-200 rounded-xl focus:border-primary outline-none"/>
                      </div>
                   </div>
                   <div className="pt-4 flex gap-3">
                      <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200">Cancel</button>
                      <button type="submit" className="flex-1 py-3 bg-primary text-white font-bold rounded-xl hover:bg-slate-800 shadow-lg">Save Supplier</button>
                   </div>
                </form>
             </div>
          </div>
       )}
    </div>
  );
};