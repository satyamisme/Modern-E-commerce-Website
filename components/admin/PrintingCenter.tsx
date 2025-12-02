
import React, { useState } from 'react';
import { useShop } from '../../context/ShopContext';
import { Printer, Search, Package, FileText, Barcode, Tag, ArrowRight, Check, ChevronDown, ChevronRight, Hash, Layers } from 'lucide-react';
import { Product, InventoryItem } from '../../types';

export const PrintingCenter: React.FC = () => {
  const { products, orders, showToast } = useShop();
  const [activeTab, setActiveTab] = useState<'labels' | 'invoices'>('labels');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Selection State
  // For tracked items: Set of InventoryItem IDs
  // For non-tracked items: Map of ProductID -> Quantity
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());
  const [genericQuantities, setGenericQuantities] = useState<{[productId: string]: number}>({});
  
  // UI Expansion State
  const [expandedProductIds, setExpandedProductIds] = useState<Set<string>>(new Set());

  // Label Config
  const [labelConfig, setLabelConfig] = useState({
      size: '38x25',
      showPrice: true,
      showBarcode: true,
      showMeta: true // IMEI/Serial text
  });

  const filteredProducts = products.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.variants?.some(v => v.inventory?.some(i => i.imei.includes(searchTerm)))
  );
  
  const filteredOrders = orders.filter(o => o.id.toLowerCase().includes(searchTerm.toLowerCase()) || o.customer.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const toggleExpand = (productId: string) => {
      const newSet = new Set(expandedProductIds);
      if (newSet.has(productId)) newSet.delete(productId);
      else newSet.add(productId);
      setExpandedProductIds(newSet);
  };

  const toggleItemSelection = (itemId: string) => {
      const newSet = new Set(selectedItemIds);
      if (newSet.has(itemId)) newSet.delete(itemId);
      else newSet.add(itemId);
      setSelectedItemIds(newSet);
  };

  const selectAllVariantItems = (items: InventoryItem[]) => {
      const newSet = new Set(selectedItemIds);
      const allSelected = items.every(i => newSet.has(i.id));
      
      items.forEach(i => {
          if (allSelected) newSet.delete(i.id);
          else newSet.add(i.id);
      });
      setSelectedItemIds(newSet);
  };

  const updateGenericQty = (productId: string, qty: number) => {
      setGenericQuantities(prev => ({ ...prev, [productId]: qty }));
  };

  const handlePrintLabels = () => {
      const itemsToPrint: Array<{ name: string, subName?: string, code: string, price: number, meta?: string }> = [];

      // 1. Collect Tracked Items
      products.forEach(p => {
          if (p.imeiTracking) {
              p.variants?.forEach(v => {
                  v.inventory?.forEach(item => {
                      if (selectedItemIds.has(item.id)) {
                          itemsToPrint.push({
                              name: p.name,
                              subName: `${v.storage} (${v.color})`,
                              code: item.imei, // Barcode is the IMEI
                              price: v.price,
                              meta: `IMEI: ${item.imei}${item.serial ? ` / SN: ${item.serial}` : ''}`
                          });
                      }
                  });
              });
          } else {
              // 2. Collect Generic Items
              const qty = genericQuantities[p.id] || 0;
              if (qty > 0) {
                  for (let i = 0; i < qty; i++) {
                      itemsToPrint.push({
                          name: p.name,
                          code: p.barcode || p.sku || p.id,
                          price: p.price
                      });
                  }
              }
          }
      });

      if (itemsToPrint.length === 0) {
          showToast('Select items to print', 'error');
          return;
      }
      
      const popup = window.open('', '_blank', 'width=800,height=600');
      if (!popup) return;

      const labelsHtml = itemsToPrint.map(item => `
        <div class="label">
            <div class="name">${item.name.substring(0, 30)}</div>
            ${item.subName ? `<div class="variant">${item.subName}</div>` : ''}
            ${labelConfig.showBarcode ? `<div class="barcode">||| |||| || |||</div>` : ''}
            <div class="code-text">${item.code}</div>
            ${item.meta && labelConfig.showMeta ? `<div class="meta">${item.meta}</div>` : ''}
            ${labelConfig.showPrice ? `<div class="price">${item.price} KWD</div>` : ''}
        </div>
      `).join('');

      popup.document.write(`
        <html>
            <head>
                <style>
                    body { font-family: 'Courier New', monospace; padding: 20px; }
                    .label { 
                        width: ${labelConfig.size === '38x25' ? '140px' : '180px'}; 
                        height: ${labelConfig.size === '38x25' ? '90px' : '110px'};
                        border: 1px dashed #ccc; 
                        display: inline-flex; 
                        flex-direction: column;
                        align-items: center; 
                        justify-content: center;
                        margin: 5px;
                        padding: 4px;
                        text-align: center;
                        page-break-inside: avoid;
                        overflow: hidden;
                    }
                    .name { font-weight: bold; font-size: 10px; line-height: 1.1; margin-bottom: 2px; max-height: 22px; overflow: hidden; }
                    .variant { font-size: 9px; font-weight: bold; }
                    .barcode { font-family: 'Libre Barcode 39'; font-size: 24px; height: 24px; overflow: hidden; margin: 1px 0; }
                    .code-text { font-size: 8px; letter-spacing: 1px; }
                    .meta { font-size: 7px; white-space: nowrap; margin-top: 1px; transform: scale(0.9); }
                    .price { font-size: 12px; font-weight: bold; margin-top: 2px; }
                    @media print {
                        .label { border: none; }
                    }
                </style>
                <link href="https://fonts.googleapis.com/css2?family=Libre+Barcode+39+Text&display=swap" rel="stylesheet">
            </head>
            <body onload="window.print()">
                ${labelsHtml}
            </body>
        </html>
      `);
      popup.document.close();
  };

  const printInvoice = (orderId: string) => {
      // Logic handled in OrderKanban usually, simulated here
      showToast(`Printing Invoice for ${orderId}`, 'success');
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Header Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 flex">
            <button 
                onClick={() => setActiveTab('labels')}
                className={`flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'labels' ? 'bg-primary text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}
            >
                <Tag size={18}/> Product Labels
            </button>
            <button 
                onClick={() => setActiveTab('invoices')}
                className={`flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'invoices' ? 'bg-primary text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}
            >
                <FileText size={18}/> Invoices & Docs
            </button>
        </div>

        {activeTab === 'labels' && (
            <div className="flex flex-col lg:flex-row gap-6">
                {/* List Section */}
                <div className="flex-1 bg-white rounded-3xl shadow-sm border border-gray-100 p-6 flex flex-col h-[600px]">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="relative flex-1">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                            <input 
                                type="text" 
                                placeholder="Search products..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-primary outline-none"
                            />
                        </div>
                        <div className="text-xs font-bold text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
                            {selectedItemIds.size + Object.values(genericQuantities).reduce((a: number, b: number) => a + b, 0)} to Print
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
                        {filteredProducts.map(p => {
                            const isExpanded = expandedProductIds.has(p.id);
                            const availableStock = p.stock;
                            
                            return (
                                <div key={p.id} className={`rounded-xl border transition-all ${isExpanded ? 'bg-blue-50/20 border-primary shadow-sm' : 'bg-white border-gray-100'}`}>
                                    {/* Product Header Row */}
                                    <div className="p-3 flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-3 flex-1 overflow-hidden">
                                            <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-200 flex-shrink-0">
                                                <img src={p.image} className="w-full h-full object-contain" alt={p.name}/>
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-bold text-gray-900 text-sm truncate">{p.name}</p>
                                                <p className="text-xs text-gray-500">{p.sku || 'No SKU'}</p>
                                            </div>
                                        </div>

                                        {p.imeiTracking ? (
                                            <button 
                                                onClick={() => toggleExpand(p.id)}
                                                className={`text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors ${isExpanded ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                            >
                                                {isExpanded ? <ChevronDown size={14}/> : <ChevronRight size={14}/>}
                                                {isExpanded ? 'Close' : 'Select Units'}
                                            </button>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-gray-400">Qty:</span>
                                                <input 
                                                    type="number" 
                                                    min="0" 
                                                    value={genericQuantities[p.id] || ''} 
                                                    onChange={e => updateGenericQty(p.id, parseInt(e.target.value) || 0)}
                                                    className="w-14 p-1.5 border border-gray-200 rounded-lg text-sm text-center font-bold focus:border-primary outline-none" 
                                                    placeholder="0"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* Expanded IMEI/Serial List */}
                                    {isExpanded && p.imeiTracking && (
                                        <div className="border-t border-blue-100 p-3 pl-16 space-y-4 bg-blue-50/10">
                                            {p.variants?.map(v => (
                                                <div key={v.id}>
                                                    <div className="flex justify-between items-center mb-2">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-3 h-3 rounded-full border border-gray-300" style={{backgroundColor: v.color}}></div>
                                                            <span className="text-xs font-bold text-gray-700">{v.storage} - {v.color}</span>
                                                        </div>
                                                        <button 
                                                            onClick={() => selectAllVariantItems(v.inventory || [])}
                                                            className="text-[10px] font-bold text-blue-600 hover:underline"
                                                        >
                                                            Toggle All
                                                        </button>
                                                    </div>
                                                    
                                                    {v.inventory && v.inventory.length > 0 ? (
                                                        <div className="grid grid-cols-1 gap-2">
                                                            {v.inventory.filter(i => i.status === 'Available').map(item => (
                                                                <label key={item.id} className="flex items-center gap-3 p-2 bg-white rounded-lg border border-gray-200 cursor-pointer hover:border-primary transition-colors">
                                                                    <input 
                                                                        type="checkbox" 
                                                                        checked={selectedItemIds.has(item.id)}
                                                                        onChange={() => toggleItemSelection(item.id)}
                                                                        className="w-4 h-4 rounded text-primary focus:ring-0 cursor-pointer"
                                                                    />
                                                                    <div className="flex-1">
                                                                        <div className="flex items-center gap-2">
                                                                            <Hash size={12} className="text-gray-400"/>
                                                                            <span className="text-xs font-mono font-bold text-gray-800">{item.imei}</span>
                                                                        </div>
                                                                        {item.serial && <div className="text-[10px] text-gray-500 ml-5">SN: {item.serial}</div>}
                                                                    </div>
                                                                </label>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <p className="text-xs text-gray-400 italic ml-5">No stock available.</p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Settings Section */}
                <div className="w-full lg:w-80 bg-white rounded-3xl shadow-sm border border-gray-100 p-6 h-fit sticky top-6">
                    <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2"><Printer size={20}/> Print Settings</h3>
                    
                    <div className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Label Size</label>
                            <select 
                                value={labelConfig.size}
                                onChange={(e) => setLabelConfig({...labelConfig, size: e.target.value})}
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary"
                            >
                                <option value="38x25">Standard (38x25mm)</option>
                                <option value="50x30">Large (50x30mm)</option>
                            </select>
                        </div>

                        <div className="space-y-3">
                            <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-50 rounded-lg transition-colors">
                                <input type="checkbox" checked={labelConfig.showPrice} onChange={e => setLabelConfig({...labelConfig, showPrice: e.target.checked})} className="w-5 h-5 accent-primary rounded"/>
                                <span className="text-sm font-medium text-gray-700">Show Price</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-50 rounded-lg transition-colors">
                                <input type="checkbox" checked={labelConfig.showBarcode} onChange={e => setLabelConfig({...labelConfig, showBarcode: e.target.checked})} className="w-5 h-5 accent-primary rounded"/>
                                <span className="text-sm font-medium text-gray-700">Show Barcode</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-50 rounded-lg transition-colors">
                                <input type="checkbox" checked={labelConfig.showMeta} onChange={e => setLabelConfig({...labelConfig, showMeta: e.target.checked})} className="w-5 h-5 accent-primary rounded"/>
                                <span className="text-sm font-medium text-gray-700">Show IMEI / Serial</span>
                            </label>
                        </div>

                        <div className="pt-4 border-t border-gray-100">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-sm text-gray-500">Items Selected:</span>
                                <span className="text-xl font-black text-primary">
                                    {selectedItemIds.size + Object.values(genericQuantities).reduce((a: number, b: number) => a + b, 0)}
                                </span>
                            </div>
                            <button 
                                onClick={handlePrintLabels}
                                className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-black transition-colors shadow-lg flex items-center justify-center gap-2"
                            >
                                <Barcode size={20}/> Print Now
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'invoices' && (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Same Invoice Table Logic */}
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-gray-900">Recent Orders</h3>
                    <div className="relative w-64">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                        <input 
                            type="text" 
                            placeholder="Find Order ID..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:border-primary outline-none"
                        />
                    </div>
                </div>
                <table className="w-full text-left">
                    <thead className="bg-white text-xs font-bold text-gray-500 uppercase border-b border-gray-100">
                        <tr>
                            <th className="p-4">Order ID</th>
                            <th className="p-4">Customer</th>
                            <th className="p-4">Total</th>
                            <th className="p-4 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filteredOrders.map(order => (
                            <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                <td className="p-4 font-mono text-sm font-bold text-gray-700">{order.id}</td>
                                <td className="p-4 text-sm text-gray-600">{order.customer.name}</td>
                                <td className="p-4 font-bold text-gray-900">{order.total} KWD</td>
                                <td className="p-4 text-right">
                                    <button 
                                        onClick={() => printInvoice(order.id)}
                                        className="text-xs bg-blue-50 text-blue-700 font-bold px-3 py-1.5 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors inline-flex items-center gap-1"
                                    >
                                        <Printer size={12}/> Invoice
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
    </div>
  );
};
