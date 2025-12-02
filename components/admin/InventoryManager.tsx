
import React, { useState, useEffect, useRef } from 'react';
import { useShop } from '../../context/ShopContext';
import { Building2, Package, RefreshCw, ArrowRightLeft, Search, CheckCircle, Clock, X, AlertCircle, ArrowRight, Store, Plus, Trash2, ScanLine, Camera } from 'lucide-react';
import { Product, Warehouse } from '../../types';
import { Html5QrcodeScanner } from 'html5-qrcode';

export const InventoryManager: React.FC = () => {
  const { warehouses, products, showToast, addWarehouse, removeWarehouse, transferStock, updateProduct, transferLogs } = useShop();
  const [searchTerm, setSearchTerm] = useState('');
  const [syncing, setSyncing] = useState(false);
  
  // Scanner State
  const [showCameraScanner, setShowCameraScanner] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  // Transfer Modal State
  const [transferModal, setTransferModal] = useState<{ isOpen: boolean, product: Product | null }>({ isOpen: false, product: null });
  const [transferData, setTransferData] = useState({ fromId: '', toId: '', qty: 1 });
  
  // Location Management Modal State
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [newLocation, setNewLocation] = useState<Partial<Warehouse>>({
     name: '',
     type: 'Retail Shop',
     location: { address: '' },
     capacity: 1000
  });

  const filteredProducts = products.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (p.barcode && p.barcode.includes(searchTerm)) ||
      (p.sku && p.sku.includes(searchTerm))
  );

  // Focus Search for USB Scanner
  useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
          // If scanner sends Enter and we aren't in a modal input, refocus search
          if (!transferModal.isOpen && !showLocationModal && document.activeElement?.tagName !== 'INPUT') {
              searchInputRef.current?.focus();
          }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
  }, [transferModal.isOpen, showLocationModal]);

  // Init Camera Scanner
  useEffect(() => {
      if (showCameraScanner && !scannerRef.current) {
          const scanner = new Html5QrcodeScanner(
              "reader", 
              { fps: 10, qrbox: { width: 250, height: 250 } },
              false
          );
          scanner.render((decodedText) => {
              setSearchTerm(decodedText);
              setShowCameraScanner(false);
              showToast(`Scanned: ${decodedText}`, 'success');
              scanner.clear();
          }, (error) => {
              // Ignore scan errors usually
          });
          scannerRef.current = scanner;
      }
      
      return () => {
          if (!showCameraScanner && scannerRef.current) {
              scannerRef.current.clear().catch(err => console.error("Scanner clear error", err));
              scannerRef.current = null;
          }
      };
  }, [showCameraScanner]);

  const handleSync = () => {
     setSyncing(true);
     showToast('Connecting to ERP System...', 'info');
     
     // Simulate fetching updated stock from external source
     setTimeout(() => {
        // Randomly update a few products to simulate external changes
        const updatedCount = Math.floor(Math.random() * 5) + 1;
        const shuffled = [...products].sort(() => 0.5 - Math.random()).slice(0, updatedCount);
        
        shuffled.forEach(p => {
            const variation = Math.floor(Math.random() * 10) - 3; // -3 to +6 change
            if (variation !== 0) {
                updateProduct({ ...p, stock: Math.max(0, p.stock + variation) });
            }
        });

        setSyncing(false);
        showToast(`Sync complete! Updated ${updatedCount} products from ERP.`, 'success');
     }, 2000);
  };

  const openTransfer = (product: Product) => {
     setTransferModal({ isOpen: true, product });
     setTransferData({ 
        fromId: warehouses[0]?.id || '', 
        toId: warehouses[1]?.id || '', 
        qty: 1 
     });
  };

  const executeTransfer = () => {
     if (!transferModal.product) return;
     if (transferData.fromId === transferData.toId) {
        showToast('Cannot transfer to same warehouse', 'error');
        return;
     }
     
     transferStock(transferData.fromId, transferData.toId, transferModal.product.id, transferData.qty);
     setTransferModal({ isOpen: false, product: null });
  };

  const handleAddLocation = (e: React.FormEvent) => {
     e.preventDefault();
     if(newLocation.name && newLocation.location?.address) {
        addWarehouse({
           id: `WH-${Date.now()}`,
           name: newLocation.name,
           location: { address: newLocation.location.address },
           capacity: newLocation.capacity || 1000,
           utilization: 0,
           type: newLocation.type as any || 'Retail Shop'
        });
        setNewLocation({ name: '', type: 'Retail Shop', location: { address: '' }, capacity: 1000 });
        showToast('New location created', 'success');
     }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
       
       {/* Header Actions */}
       <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <div>
             <h2 className="text-xl font-bold text-gray-900">Inventory Operations</h2>
             <p className="text-sm text-gray-500">Real-time stock across {warehouses.length} locations</p>
          </div>
          <div className="flex gap-3">
             <button 
                onClick={() => setShowLocationModal(true)}
                className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm"
             >
                <Store size={18} /> Manage Stores
             </button>
             <button 
                onClick={handleSync}
                disabled={syncing}
                className="px-6 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-black transition-all flex items-center gap-2 shadow-lg disabled:opacity-70"
             >
                <RefreshCw size={18} className={syncing ? "animate-spin" : ""} /> 
                {syncing ? 'Syncing...' : 'Sync with ERP'}
             </button>
          </div>
       </div>

       {/* Warehouses Overview */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {warehouses.slice(0, 3).map(wh => (
             <div key={wh.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                   <Building2 size={64} />
                </div>
                <div className="flex justify-between items-start mb-4 relative z-10">
                   <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                      <Building2 size={24} />
                   </div>
                   <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${wh.utilization > 80 ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
                      {wh.utilization}% Load
                   </span>
                </div>
                <h3 className="font-bold text-gray-900 text-lg relative z-10">{wh.name}</h3>
                <p className="text-sm text-gray-500 mb-4 relative z-10">{wh.location.address}</p>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden mb-2 relative z-10">
                   <div className="h-full bg-indigo-500 rounded-full transition-all duration-1000" style={{ width: `${wh.utilization}%` }}></div>
                </div>
                <div className="flex justify-between text-xs font-medium text-gray-500 relative z-10">
                   <span>{wh.type}</span>
                   <span>Cap: {wh.capacity}</span>
                </div>
             </div>
          ))}
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Stock Matrix */}
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[500px]">
             <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/50">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"><Package size={20}/> Global Stock Matrix</h2>
                <div className="flex gap-2 w-full sm:w-auto">
                    <div className="relative flex-1">
                        <ScanLine size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                            ref={searchInputRef}
                            type="text" 
                            placeholder="Scan Barcode / Search SKU" 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary transition-all font-mono"
                            autoFocus
                        />
                    </div>
                    <button 
                        onClick={() => setShowCameraScanner(!showCameraScanner)}
                        className={`p-2 rounded-lg border ${showCameraScanner ? 'bg-red-50 text-red-600 border-red-200' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                    >
                        <Camera size={20} />
                    </button>
                </div>
             </div>
             
             {showCameraScanner && (
                 <div className="p-4 bg-black/5 border-b border-gray-200 flex justify-center">
                     <div id="reader" className="w-[300px] h-[300px] bg-white rounded-xl overflow-hidden"></div>
                 </div>
             )}
             
             <div className="flex-1 overflow-auto custom-scrollbar">
                <table className="w-full text-left">
                   <thead className="bg-white text-xs font-bold text-gray-500 uppercase tracking-wider sticky top-0 z-10 shadow-sm">
                      <tr>
                         <th className="p-5 bg-gray-50">Product</th>
                         <th className="p-5 text-center bg-gray-50">Total</th>
                         {warehouses.slice(0, 3).map(wh => <th key={wh.id} className="p-5 text-center bg-gray-50 hidden md:table-cell">{wh.name.split(' ')[0]}</th>)}
                         <th className="p-5 text-right bg-gray-50">Actions</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-50">
                      {filteredProducts.slice(0, 15).map(p => {
                         const w1 = Math.floor(p.stock * 0.6);
                         const w2 = Math.floor(p.stock * 0.3);
                         const w3 = Math.max(0, p.stock - w1 - w2);

                         return (
                            <tr key={p.id} className="hover:bg-blue-50/30 transition-colors group">
                               <td className="p-5">
                                  <div className="flex items-center gap-3">
                                     <img src={p.image || `https://picsum.photos/seed/${p.imageSeed}/40/40`} className="w-10 h-10 rounded-lg border border-gray-200 bg-white object-contain" alt={p.name}/>
                                     <div>
                                        <p className="font-bold text-gray-900 text-sm line-clamp-1">{p.name}</p>
                                        <p className="text-xs text-gray-400 font-mono">{p.barcode || p.sku || `SKU-${p.id.substring(0,4)}`}</p>
                                     </div>
                                  </div>
                               </td>
                               <td className="p-5 text-center">
                                  <span className={`font-bold text-sm px-2 py-1 rounded ${p.stock < 5 ? 'text-red-700 bg-red-50' : 'text-gray-900 bg-gray-100'}`}>
                                     {p.stock}
                                  </span>
                               </td>
                               <td className="p-5 text-center text-sm text-gray-600 hidden md:table-cell">{w1}</td>
                               <td className="p-5 text-center text-sm text-gray-600 hidden md:table-cell">{w2}</td>
                               <td className="p-5 text-center text-sm text-gray-600 hidden md:table-cell">{w3}</td>
                               <td className="p-5 text-right">
                                  <button 
                                    onClick={() => openTransfer(p)}
                                    className="text-xs font-bold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg border border-transparent hover:border-blue-100 transition-colors flex items-center gap-1 ml-auto opacity-0 group-hover:opacity-100"
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

          {/* Activity Log (Real DB Data) */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 flex flex-col h-[500px]">
             <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2"><Clock size={20}/> Live Transfer Log</h3>
             <div className="flex-1 overflow-y-auto custom-scrollbar space-y-6 pr-2">
                {transferLogs.length === 0 ? (
                    <div className="text-center text-gray-400 text-sm pt-20">No recent activity</div>
                ) : (
                    transferLogs.map((log) => {
                        const fromName = warehouses.find(w => w.id === log.fromLocationId)?.name || 'Unknown';
                        const toName = warehouses.find(w => w.id === log.toLocationId)?.name || 'Unknown';
                        const prod = products.find(p => p.id === log.productId);
                        
                        return (
                           <div key={log.id} className="relative pl-6 pb-6 border-l border-gray-100 last:pb-0">
                              <div className="absolute left-[-5px] top-0 w-2.5 h-2.5 rounded-full border-2 border-white shadow-sm bg-blue-500"></div>
                              <div className="flex justify-between items-start mb-1">
                                 <span className="text-sm font-bold text-gray-900">Transfer</span>
                                 <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-bold">{log.quantity} Items</span>
                              </div>
                              <p className="text-xs text-gray-600 mb-1 font-medium">{prod?.name || 'Item'}</p>
                              <p className="text-[10px] text-gray-500 flex items-center gap-1">
                                 {fromName} <ArrowRight size={10}/> {toName}
                              </p>
                              <span className="text-[10px] text-gray-400 font-medium block mt-1">
                                 {new Date(log.timestamp).toLocaleString()}
                              </span>
                           </div>
                        );
                    })
                )}
             </div>
          </div>
       </div>

       {/* Transfer Modal */}
       {transferModal.isOpen && transferModal.product && (
          <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
             <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 animate-in zoom-in-95">
                <div className="flex justify-between items-start mb-6">
                   <div>
                      <h3 className="text-xl font-bold text-gray-900">Transfer Stock</h3>
                      <p className="text-sm text-gray-500">Move inventory between warehouses</p>
                   </div>
                   <button onClick={() => setTransferModal({isOpen: false, product: null})} className="p-2 hover:bg-gray-100 rounded-full"><X size={20}/></button>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6 flex items-center gap-4">
                    <img src={transferModal.product.image} className="w-12 h-12 object-contain bg-white rounded-lg border border-gray-200" alt="prod"/>
                    <div>
                        <p className="font-bold text-gray-900">{transferModal.product.name}</p>
                        <p className="text-xs text-gray-500">Total Stock: {transferModal.product.stock}</p>
                    </div>
                </div>

                <div className="space-y-4 mb-8">
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                         <label className="block text-xs font-bold text-gray-500 uppercase mb-1">From Location</label>
                         <select 
                            value={transferData.fromId} 
                            onChange={e => setTransferData({...transferData, fromId: e.target.value})}
                            className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm focus:border-primary outline-none"
                         >
                            {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                         </select>
                      </div>
                      <div>
                         <label className="block text-xs font-bold text-gray-500 uppercase mb-1">To Location</label>
                         <select 
                            value={transferData.toId} 
                            onChange={e => setTransferData({...transferData, toId: e.target.value})}
                            className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm focus:border-primary outline-none"
                         >
                            {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                         </select>
                      </div>
                   </div>
                   
                   <div className="flex items-center gap-4 justify-center py-2">
                       <div className="h-px bg-gray-200 flex-1"></div>
                       <ArrowRight size={16} className="text-gray-400"/>
                       <div className="h-px bg-gray-200 flex-1"></div>
                   </div>

                   <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Quantity</label>
                      <input 
                         type="number" 
                         min="1" 
                         max={transferModal.product.stock}
                         value={transferData.qty}
                         onChange={e => setTransferData({...transferData, qty: parseInt(e.target.value)})}
                         className="w-full p-3 bg-white border border-gray-200 rounded-xl font-bold focus:border-primary outline-none"
                      />
                   </div>
                </div>

                <div className="flex gap-3">
                   <button onClick={() => setTransferModal({isOpen: false, product: null})} className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
                   <button onClick={executeTransfer} className="flex-1 py-3 bg-primary text-white font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-lg shadow-primary/20">Confirm Transfer</button>
                </div>
             </div>
          </div>
       )}

       {/* Location Management Modal */}
       {showLocationModal && (
          <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
             <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col h-[80vh]">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                   <div>
                      <h3 className="font-bold text-xl text-gray-900">Manage Stores & Warehouses</h3>
                      <p className="text-sm text-gray-500">Add or remove locations from your network.</p>
                   </div>
                   <button onClick={() => setShowLocationModal(false)} className="p-2 hover:bg-gray-200 rounded-full"><X size={20}/></button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                   {/* Add New Form */}
                   <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                      <h4 className="font-bold text-blue-900 mb-4 flex items-center gap-2"><Plus size={18}/> Add New Location</h4>
                      <form onSubmit={handleAddLocation} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                            <label className="block text-xs font-bold text-blue-800/70 uppercase mb-1">Name</label>
                            <input 
                               type="text" 
                               required
                               placeholder="e.g. Jahra Branch"
                               value={newLocation.name}
                               onChange={e => setNewLocation({...newLocation, name: e.target.value})}
                               className="w-full p-2.5 bg-white border border-blue-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                            />
                         </div>
                         <div>
                            <label className="block text-xs font-bold text-blue-800/70 uppercase mb-1">Type</label>
                            <select 
                               value={newLocation.type}
                               onChange={e => setNewLocation({...newLocation, type: e.target.value as any})}
                               className="w-full p-2.5 bg-white border border-blue-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                            >
                               <option value="Retail Shop">Retail Shop</option>
                               <option value="Main Warehouse">Main Warehouse</option>
                               <option value="Online Fulfillment">Online Fulfillment</option>
                            </select>
                         </div>
                         <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-blue-800/70 uppercase mb-1">Address</label>
                            <input 
                               type="text" 
                               required
                               placeholder="e.g. Block 4, Street 20, Building 5"
                               value={newLocation.location?.address}
                               onChange={e => setNewLocation({...newLocation, location: { address: e.target.value }})}
                               className="w-full p-2.5 bg-white border border-blue-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                            />
                         </div>
                         <div className="md:col-span-2">
                            <button type="submit" className="w-full py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-md">
                               Create Location
                            </button>
                         </div>
                      </form>
                   </div>

                   {/* List Locations */}
                   <div>
                      <h4 className="font-bold text-gray-900 mb-4">Active Locations ({warehouses.length})</h4>
                      <div className="space-y-3">
                         {warehouses.map(wh => (
                            <div key={wh.id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl group hover:border-gray-300 transition-colors shadow-sm">
                               <div className="flex items-center gap-4">
                                  <div className={`p-2.5 rounded-lg ${wh.type === 'Main Warehouse' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                                     <Building2 size={20} />
                                  </div>
                                  <div>
                                     <h5 className="font-bold text-gray-900 text-sm">{wh.name}</h5>
                                     <p className="text-xs text-gray-500">{wh.type} • {wh.location.address}</p>
                                  </div>
                               </div>
                               <button 
                                  onClick={() => {
                                     if(confirm(`Are you sure you want to remove ${wh.name}?`)) {
                                        removeWarehouse(wh.id);
                                     }
                                  }}
                                  className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Remove Location"
                               >
                                  <Trash2 size={18} />
                               </button>
                            </div>
                         ))}
                      </div>
                   </div>
                </div>
             </div>
          </div>
       )}
    </div>
  );
};
