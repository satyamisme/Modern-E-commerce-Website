
import React, { useState } from 'react';
import { useShop } from '../../context/ShopContext';
import { Building2, Package, RefreshCw, AlertTriangle, ArrowRightLeft, Search } from 'lucide-react';
import { Product } from '../../types';

export const InventoryManager: React.FC = () => {
  const { warehouses, products, showToast } = useShop();
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleTransfer = (productId: string) => {
     showToast(`Stock transfer request initiated for ${productId}`, 'success');
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
       {/* Warehouses Overview */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {warehouses.map(wh => (
             <div key={wh.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-start mb-4">
                   <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                      <Building2 size={24} />
                   </div>
                   <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${wh.utilization > 80 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                      {wh.utilization}% Full
                   </span>
                </div>
                <h3 className="font-bold text-gray-900 text-lg">{wh.name}</h3>
                <p className="text-sm text-gray-500 mb-4">{wh.location.address}</p>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden mb-2">
                   <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${wh.utilization}%` }}></div>
                </div>
                <div className="flex justify-between text-xs font-medium text-gray-500">
                   <span>{wh.type}</span>
                   <span>Cap: {wh.capacity}</span>
                </div>
             </div>
          ))}
       </div>

       {/* Stock Matrix */}
       <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
             <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"><Package size={20}/> Stock Level Matrix</h2>
             <div className="relative w-full sm:w-64">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search SKU..." 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary"
                />
             </div>
          </div>
          
          <div className="overflow-x-auto">
             <table className="w-full text-left">
                <thead className="bg-gray-50/50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                   <tr>
                      <th className="p-5">Product</th>
                      <th className="p-5 text-center">Total Stock</th>
                      {warehouses.map(wh => <th key={wh.id} className="p-5 text-center">{wh.name}</th>)}
                      <th className="p-5 text-right">Actions</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                   {filteredProducts.slice(0, 10).map(p => {
                      // Mock distribution logic based on seed
                      const seed = p.imageSeed;
                      const w1 = Math.floor(p.stock * 0.6);
                      const w2 = Math.floor(p.stock * 0.3);
                      const w3 = p.stock - w1 - w2;

                      return (
                         <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="p-5">
                               <div className="flex items-center gap-3">
                                  <img src={`https://picsum.photos/seed/${p.imageSeed}/40/40`} className="w-10 h-10 rounded-lg border border-gray-200 bg-white object-contain" />
                                  <div>
                                     <p className="font-bold text-gray-900 text-sm">{p.name}</p>
                                     <p className="text-xs text-gray-400">{p.sku || `SKU-${p.id}`}</p>
                                  </div>
                               </div>
                            </td>
                            <td className="p-5 text-center">
                               <span className={`font-bold text-sm ${p.stock < 5 ? 'text-red-600 bg-red-50 px-2 py-1 rounded' : 'text-gray-900'}`}>
                                  {p.stock}
                               </span>
                            </td>
                            <td className="p-5 text-center text-sm text-gray-600">{w1}</td>
                            <td className="p-5 text-center text-sm text-gray-600">{w2}</td>
                            <td className="p-5 text-center text-sm text-gray-600">{w3}</td>
                            <td className="p-5 text-right">
                               <button 
                                 onClick={() => handleTransfer(p.id)}
                                 className="text-xs font-bold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg border border-transparent hover:border-blue-100 transition-colors flex items-center gap-1 ml-auto"
                               >
                                  <ArrowRightLeft size={14}/> Transfer
                               </button>
                            </td>
                         </tr>
                      );
                   })}
                </tbody>
             </table>
          </div>
       </div>
    </div>
  );
};
