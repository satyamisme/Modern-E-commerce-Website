
import React, { useState, useEffect, useRef } from 'react';
import { useShop } from '../../context/ShopContext';
import { Building2, Package, RefreshCw, ArrowRightLeft, Search, CheckCircle, Clock, X, AlertCircle, ArrowRight, Store, Plus, Trash2, ScanLine, Camera, ChevronLeft, MapPin, Eye, EyeOff, ShoppingCart, DollarSign, Calendar, Barcode, FileText, Clipboard, Printer } from 'lucide-react';
import { Product, Warehouse, InventoryItem, PurchaseOrder, PurchaseItem } from '../../types';
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode';

// Sub-Component for Bulk Stock Entry
const BulkStockEntry: React.FC = () => {
    // ... (Existing BulkStockEntry Code) ...
    const { products, warehouses, suppliers, updateProduct, showToast } = useShop();
    const [selectedProductId, setSelectedProductId] = useState('');
    const [selectedVariantId, setSelectedVariantId] = useState('');
    
    // Batch Settings
    const [warehouseId, setWarehouseId] = useState(warehouses[0]?.id || '');
    const [supplierId, setSupplierId] = useState('');
    const [costPrice, setCostPrice] = useState<number>(0);
    const [condition, setCondition] = useState<'New' | 'Used'>('New');
    
    // Input
    const [imeiInput, setImeiInput] = useState('');
    const [parsedItems, setParsedItems] = useState<string[]>([]);

    useEffect(() => {
        // Auto-parse IMEIs from textarea (split by newline or comma)
        const items = imeiInput
            .split(/[\n,]+/)
            .map(s => s.trim())
            .filter(s => s.length > 0);
        // Deduplicate locally
        setParsedItems([...new Set(items)]);
    }, [imeiInput]);

    const handleCommitBatch = () => {
        if (!selectedProductId) { showToast('Select a product', 'error'); return; }
        if (parsedItems.length === 0) { showToast('Enter at least one IMEI', 'error'); return; }
        
        const product = products.find(p => p.id === selectedProductId);
        if (!product) return;

        // If product has variants, variant ID is mandatory
        if (product.variants && product.variants.length > 0 && !selectedVariantId) {
            showToast('Select a variant', 'error');
            return;
        }

        // Determine target variant (or dummy if no variants)
        const targetVariant = product.variants?.find(v => v.id === selectedVariantId) 
                              || (product.variants && product.variants.length > 0 ? null : { id: 'default', inventory: [], stock: 0 }); 
        
        if (!targetVariant && product.variants?.length) return; 

        // Check for duplicates globally in this product
        const allExistingImeis = new Set<string>();
        product.variants?.forEach(v => v.inventory?.forEach(i => allExistingImeis.add(i.imei)));
        
        const duplicates = parsedItems.filter(imei => allExistingImeis.has(imei));
        if (duplicates.length > 0) {
            showToast(`${duplicates.length} IMEIs already exist (e.g. ${duplicates[0]})`, 'error');
            return;
        }

        // Create Items
        const newInventoryItems: InventoryItem[] = parsedItems.map(imei => ({
            id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            imei,
            costPrice,
            condition,
            status: 'Available',
            purchaseDate: new Date().toISOString().split('T')[0],
            supplierId,
            locationId: warehouseId,
            sourceType: 'Wholesale'
        }));

        // Update Product State
        let updatedVariants = product.variants || [];
        
        if (selectedVariantId) {
            updatedVariants = updatedVariants.map(v => {
                if (v.id === selectedVariantId) {
                    const newInv = [...(v.inventory || []), ...newInventoryItems];
                    return {
                        ...v,
                        inventory: newInv,
                        stock: newInv.filter(i => i.status === 'Available').length
                    };
                }
                return v;
            });
        } else {
            if (updatedVariants.length === 0) {
                 updatedVariants = [{
                     id: `var-${Date.now()}`,
                     color: 'Default',
                     storage: 'Standard',
                     price: product.price,
                     stock: newInventoryItems.length,
                     inventory: newInventoryItems
                 }];
            }
        }

        const newTotalStock = updatedVariants.reduce((acc, v) => acc + (v.stock || 0), 0);
        
        updateProduct({
            ...product,
            variants: updatedVariants,
            stock: newTotalStock
        });

        showToast(`Successfully added ${newInventoryItems.length} items!`, 'success');
        setImeiInput('');
    };

    const handlePrintBatch = () => {
        if (parsedItems.length === 0) return;
        const product = products.find(p => p.id === selectedProductId);
        const w = window.open('', '_blank', 'width=600,height=600');
        if(w && product) {
            w.document.write(`<html><head><style>body{font-family:monospace;text-align:center}.label{border:1px dashed #ccc;padding:5px;margin:5px;display:inline-block;width:200px;height:100px;overflow:hidden}.sku{font-size:10px}.barcode{font-size:24px;margin:5px 0}</style></head><body>`);
            parsedItems.forEach(imei => {
                w.document.write(`<div class="label"><strong>${product.name.substring(0,20)}</strong><br/><div class="barcode">||| |||| || |||</div>${imei}<br/>${costPrice > 0 ? 'Cost: ' + costPrice : ''}</div>`);
            });
            w.document.write(`</body></html>`);
            w.document.close();
            w.print();
        }
    };

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row gap-8 h-full">
            {/* Left Control Panel */}
            <div className="w-full md:w-1/3 space-y-6 flex flex-col">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2"><Clipboard size={20}/> Bulk Batch Entry</h3>
                    <p className="text-sm text-gray-500">Mass add tracked inventory items.</p>
                </div>

                <div className="space-y-4 flex-1 overflow-y-auto pr-2">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Product</label>
                        <select 
                            value={selectedProductId} 
                            onChange={e => { setSelectedProductId(e.target.value); setSelectedVariantId(''); }}
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-primary outline-none"
                        >
                            <option value="">Select Product...</option>
                            {products.filter(p => p.imeiTracking).map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>

                    {selectedProductId && products.find(p => p.id === selectedProductId)?.variants?.length ? (
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Variant</label>
                            <select 
                                value={selectedVariantId} 
                                onChange={e => setSelectedVariantId(e.target.value)}
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-primary outline-none"
                            >
                                <option value="">Select Variant...</option>
                                {products.find(p => p.id === selectedProductId)?.variants?.map(v => (
                                    <option key={v.id} value={v.id}>{v.color} - {v.storage}</option>
                                ))}
                            </select>
                        </div>
                    ) : null}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Warehouse</label>
                            <select value={warehouseId} onChange={e => setWarehouseId(e.target.value)} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm">
                                {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Supplier</label>
                            <select value={supplierId} onChange={e => setSupplierId(e.target.value)} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm">
                                <option value="">Unknown</option>
                                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Unit Cost</label>
                            <input type="number" value={costPrice} onChange={e => setCostPrice(parseFloat(e.target.value))} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"/>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Condition</label>
                            <select value={condition} onChange={e => setCondition(e.target.value as any)} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm">
                                <option value="New">New</option>
                                <option value="Used">Used</option>
                                <option value="Open Box">Open Box</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Input Area */}
            <div className="flex-1 flex flex-col h-full bg-gray-50 rounded-2xl border border-gray-200 p-4">
                <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold text-gray-500 uppercase">Paste IMEIs (One per line)</label>
                    <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md">{parsedItems.length} items detected</span>
                </div>
                <textarea 
                    value={imeiInput}
                    onChange={e => setImeiInput(e.target.value)}
                    placeholder="Scan or paste IMEIs here..."
                    className="flex-1 w-full p-4 border border-gray-300 rounded-xl font-mono text-sm focus:border-primary outline-none resize-none mb-4"
                ></textarea>
                
                <div className="flex gap-3">
                    <button 
                        onClick={() => setImeiInput('')}
                        className="px-6 py-3 bg-white border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-100"
                    >
                        Clear
                    </button>
                    <button 
                        onClick={handlePrintBatch}
                        disabled={parsedItems.length === 0}
                        className="px-6 py-3 bg-white border border-gray-200 text-blue-600 font-bold rounded-xl hover:bg-blue-50 flex items-center gap-2"
                    >
                        <Printer size={18}/> Print Batch Labels
                    </button>
                    <button 
                        onClick={handleCommitBatch}
                        className="flex-1 py-3 bg-primary text-white font-bold rounded-xl hover:bg-slate-800 shadow-lg flex justify-center items-center gap-2"
                    >
                        <CheckCircle size={18}/> Commit to Inventory
                    </button>
                </div>
            </div>
        </div>
    );
};

// Sub-Component for Purchase Order Management
const PurchaseManager: React.FC = () => {
    // ... (Existing PurchaseManager Code) ...
    const { suppliers, warehouses, products, purchaseOrders, addPurchaseOrder, receivePurchaseOrder, showToast } = useShop();
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    
    const [newPO, setNewPO] = useState<Partial<PurchaseOrder>>({
        supplierId: '', warehouseId: warehouses[0]?.id || '', referenceNumber: '', items: [], date: new Date().toISOString().split('T')[0]
    });
    
    const [selectedProduct, setSelectedProduct] = useState<string>('');
    const [selectedVariant, setSelectedVariant] = useState<string>('');
    const [qty, setQty] = useState(1);
    const [cost, setCost] = useState(0);

    const handleAddItem = () => {
        if (!selectedProduct || qty < 1) return;
        
        const prod = products.find(p => p.id === selectedProduct);
        if (!prod) return;

        let variantName = 'Standard';
        let sku = prod.sku || prod.barcode || 'N/A';
        
        if (selectedVariant) {
            const v = prod.variants?.find(v => v.id === selectedVariant);
            if (v) {
                variantName = `${v.color} - ${v.storage}`;
                sku = v.sku || sku;
            }
        }

        const newItem: PurchaseItem = {
            id: `po-item-${Date.now()}`,
            productId: prod.id,
            variantId: selectedVariant,
            productName: `${prod.name} (${variantName})`,
            sku,
            quantity: qty,
            costPrice: cost,
            totalCost: qty * cost
        };

        setNewPO(prev => ({ ...prev, items: [...(prev.items || []), newItem] }));
        setQty(1);
    };

    const handleRemoveItem = (id: string) => {
        setNewPO(prev => ({ ...prev, items: prev.items?.filter(i => i.id !== id) }));
    };

    const handleSubmit = () => {
        if (!newPO.supplierId || !newPO.warehouseId || !newPO.items?.length) return;
        const totalAmount = newPO.items.reduce((acc, i) => acc + i.totalCost, 0);
        const po: PurchaseOrder = {
            id: `PO-${Date.now()}`,
            supplierId: newPO.supplierId!,
            warehouseId: newPO.warehouseId!,
            referenceNumber: newPO.referenceNumber || `REF-${Date.now()}`,
            date: newPO.date!,
            status: 'Ordered',
            items: newPO.items!,
            totalAmount,
            notes: newPO.notes
        };
        addPurchaseOrder(po);
        setShowModal(false);
        setNewPO({ supplierId: '', warehouseId: warehouses[0]?.id || '', referenceNumber: '', items: [], date: new Date().toISOString().split('T')[0] });
    };

    const handleReceive = (po: PurchaseOrder) => {
        // Check for tracked items
        const hasTrackedItems = po.items.some(item => {
            const p = products.find(prod => prod.id === item.productId);
            return p?.imeiTracking;
        });

        if (hasTrackedItems) {
            if (confirm("This Purchase Order contains IMEI-tracked items. Clicking OK will mark it as Received, but you must manually scan IMEIs in 'Inventory View' or 'Bulk Entry' to add them to stock. Continue?")) {
                receivePurchaseOrder(po.id);
            }
        } else {
            if(confirm('Receive stock? Inventory will be auto-updated for non-tracked items.')) {
                receivePurchaseOrder(po.id);
            }
        }
    };

    const filteredPOs = purchaseOrders.filter(po => 
        po.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
        po.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <div className="relative w-64">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                    <input 
                        type="text" 
                        placeholder="Search POs..." 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-primary outline-none"
                    />
                </div>
                <button 
                    onClick={() => setShowModal(true)}
                    className="px-6 py-2 bg-primary text-white font-bold rounded-xl hover:bg-slate-800 transition-colors flex items-center gap-2 shadow-lg"
                >
                    <Plus size={18} /> New Purchase Order
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {filteredPOs.length === 0 ? (
                    <div className="p-12 text-center text-gray-400 bg-white rounded-3xl border border-dashed border-gray-200">
                        <ShoppingCart size={48} className="mx-auto mb-4 opacity-20"/>
                        <p>No purchase orders found.</p>
                    </div>
                ) : (
                    filteredPOs.map(po => (
                        <div key={po.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h3 className="font-bold text-gray-900 text-lg">{po.referenceNumber || po.id}</h3>
                                        <span className={`px-2 py-0.5 text-xs font-bold rounded ${po.status === 'Received' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                            {po.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {suppliers.find(s => s.id === po.supplierId)?.name || 'Unknown Supplier'} • {new Date(po.date).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-gray-900">{po.totalAmount} KWD</p>
                                    <p className="text-xs text-gray-500">{po.items.length} Items</p>
                                </div>
                            </div>
                            
                            <div className="bg-gray-50 rounded-xl p-3 mb-4 text-xs space-y-1">
                                {po.items.slice(0, 3).map((item, idx) => (
                                    <div key={idx} className="flex justify-between">
                                        <span className="text-gray-600">{item.quantity}x {item.productName}</span>
                                        <span className="font-mono text-gray-500">{item.costPrice} KWD</span>
                                    </div>
                                ))}
                                {po.items.length > 3 && <div className="text-gray-400 italic">+ {po.items.length - 3} more...</div>}
                            </div>

                            <div className="flex justify-end gap-3">
                                {po.status !== 'Received' && (
                                    <button 
                                        onClick={() => handleReceive(po)}
                                        className="px-4 py-2 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700 flex items-center gap-2"
                                    >
                                        <CheckCircle size={14} /> Receive Stock
                                    </button>
                                )}
                                <div className="text-xs text-gray-400 flex items-center gap-1 bg-gray-50 px-3 py-2 rounded-lg">
                                    <Building2 size={12}/> {warehouses.find(w => w.id === po.warehouseId)?.name}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-xl text-gray-900">Create Purchase Order</h3>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-200 rounded-full"><X size={20}/></button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Supplier</label>
                                    <select 
                                        value={newPO.supplierId} 
                                        onChange={e => setNewPO({...newPO, supplierId: e.target.value})}
                                        className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:border-primary outline-none bg-white"
                                    >
                                        <option value="">Select Supplier</option>
                                        {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Destination</label>
                                    <select 
                                        value={newPO.warehouseId} 
                                        onChange={e => setNewPO({...newPO, warehouseId: e.target.value})}
                                        className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:border-primary outline-none bg-white"
                                    >
                                        {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Ref Number</label>
                                    <input 
                                        type="text" 
                                        value={newPO.referenceNumber}
                                        onChange={e => setNewPO({...newPO, referenceNumber: e.target.value})}
                                        className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:border-primary outline-none"
                                        placeholder="INV-2024-001"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Date</label>
                                    <input 
                                        type="date" 
                                        value={newPO.date}
                                        onChange={e => setNewPO({...newPO, date: e.target.value})}
                                        className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:border-primary outline-none"
                                    />
                                </div>
                            </div>

                            <div className="border-t border-gray-100 pt-6">
                                <h4 className="font-bold text-gray-900 mb-4">Add Items</h4>
                                <div className="flex flex-wrap gap-2 items-end bg-blue-50 p-4 rounded-xl border border-blue-100">
                                    <div className="flex-1 min-w-[150px]">
                                        <label className="text-[10px] font-bold text-blue-800 uppercase mb-1">Product</label>
                                        <select 
                                            value={selectedProduct} 
                                            onChange={e => { setSelectedProduct(e.target.value); setSelectedVariant(''); }}
                                            className="w-full p-2 border border-blue-200 rounded-lg text-sm outline-none"
                                        >
                                            <option value="">Select Product</option>
                                            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="w-40">
                                        <label className="text-[10px] font-bold text-blue-800 uppercase mb-1">Variant</label>
                                        <select 
                                            value={selectedVariant} 
                                            onChange={e => setSelectedVariant(e.target.value)}
                                            className="w-full p-2 border border-blue-200 rounded-lg text-sm outline-none"
                                            disabled={!selectedProduct || !products.find(p => p.id === selectedProduct)?.variants?.length}
                                        >
                                            <option value="">Standard</option>
                                            {selectedProduct && products.find(p => p.id === selectedProduct)?.variants?.map(v => (
                                                <option key={v.id} value={v.id}>{v.color} - {v.storage}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="w-20">
                                        <label className="text-[10px] font-bold text-blue-800 uppercase mb-1">Qty</label>
                                        <input type="number" min="1" value={qty} onChange={e => setQty(parseInt(e.target.value))} className="w-full p-2 border border-blue-200 rounded-lg text-sm outline-none"/>
                                    </div>
                                    <div className="w-24">
                                        <label className="text-[10px] font-bold text-blue-800 uppercase mb-1">Unit Cost</label>
                                        <input type="number" value={cost} onChange={e => setCost(parseFloat(e.target.value))} className="w-full p-2 border border-blue-200 rounded-lg text-sm outline-none"/>
                                    </div>
                                    <button onClick={handleAddItem} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700">Add</button>
                                </div>

                                <div className="mt-4 border border-gray-200 rounded-xl overflow-hidden">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase">
                                            <tr>
                                                <th className="p-3">Product</th>
                                                <th className="p-3">Qty</th>
                                                <th className="p-3">Cost</th>
                                                <th className="p-3">Total</th>
                                                <th className="p-3 text-right"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {newPO.items?.map(item => (
                                                <tr key={item.id}>
                                                    <td className="p-3 font-medium text-gray-900">{item.productName} <span className="text-xs text-gray-400 block">{item.sku}</span></td>
                                                    <td className="p-3">{item.quantity}</td>
                                                    <td className="p-3">{item.costPrice}</td>
                                                    <td className="p-3 font-bold">{item.totalCost}</td>
                                                    <td className="p-3 text-right">
                                                        <button onClick={() => handleRemoveItem(item.id)} className="text-red-500 hover:bg-red-50 p-1 rounded"><Trash2 size={14}/></button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {(!newPO.items || newPO.items.length === 0) && (
                                                <tr><td colSpan={5} className="p-4 text-center text-gray-400">No items added.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
                            <div className="text-sm">
                                <span className="text-gray-500 mr-2">Total Amount:</span>
                                <span className="font-bold text-xl text-gray-900">{newPO.items?.reduce((a,b) => a+b.totalCost, 0)} KWD</span>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => setShowModal(false)} className="px-6 py-3 text-gray-600 font-bold hover:bg-gray-200 rounded-xl transition-colors">Cancel</button>
                                <button onClick={handleSubmit} disabled={!newPO.items?.length} className="px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-lg disabled:opacity-50">Create Order</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export const InventoryManager: React.FC = () => {
  const { warehouses, products, showToast, addWarehouse, removeWarehouse, transferStock, updateProduct, transferLogs, appSettings } = useShop();
  const [activeTab, setActiveTab] = useState<'inventory' | 'purchases' | 'bulk'>('inventory');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
  const [showCameraScanner, setShowCameraScanner] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const scannerRef = useRef<any>(null);
  const [transferModal, setTransferModal] = useState<{ isOpen: boolean, product: Product | null }>({ isOpen: false, product: null });
  const [transferData, setTransferData] = useState({ fromId: '', toId: '', qty: 1 });
  const [receiveModal, setReceiveModal] = useState<{ isOpen: boolean, product: Product | null }>({ isOpen: false, product: null });
  const [newItem, setNewItem] = useState<Partial<InventoryItem>>({ imei: '', costPrice: 0, condition: 'New' });
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [newLocation, setNewLocation] = useState<Partial<Warehouse>>({ name: '', type: 'Retail Shop', location: { address: '' }, capacity: 1000 });
  const [showAllProducts, setShowAllProducts] = useState(false);

  const filteredProducts = products.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (p.barcode && p.barcode.includes(searchTerm)) ||
      (p.sku && p.sku.includes(searchTerm))
  );

  useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
          if (!transferModal.isOpen && !showLocationModal && !receiveModal.isOpen && activeTab === 'inventory' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
              searchInputRef.current?.focus();
          }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
  }, [transferModal.isOpen, showLocationModal, receiveModal.isOpen, activeTab]);

  // Safer Scanner Implementation with Proper Cleanup
  useEffect(() => {
      let isMounted = true;
      if (showCameraScanner && !scannerRef.current) {
          setTimeout(() => {
              if(!isMounted) return;
              try {
                  const container = document.getElementById("reader");
                  if (container) {
                      // Use default camera ID if configured, otherwise use environment facing mode
                      const config = { 
                          fps: 10, 
                          qrbox: { width: 250, height: 250 }, 
                          verbose: false 
                      };
                      
                      // Note: Html5QrcodeScanner constructor doesn't take cameraId directly.
                      // Ideally we'd use Html5Qrcode class for specific camera ID, but for simplicity/consistency 
                      // we'll stick with the scanner widget which auto-selects or allows user selection.
                      // If the user REALLY needs a specific default, we can try to hint it or build custom UI.
                      // For now, we will use the standard scanner widget.
                      
                      const scanner = new Html5QrcodeScanner("reader", config, false);
                      scanner.render((decodedText) => {
                          setSearchTerm(decodedText); setShowCameraScanner(false); showToast(`Scanned: ${decodedText}`, 'success'); 
                          scanner.clear().catch(console.error);
                      }, (error) => {});
                      scannerRef.current = scanner;
                  }
              } catch (e) {
                  console.error("Scanner init failed:", e);
                  showToast("Camera not available", "error");
                  setShowCameraScanner(false);
              }
          }, 300); // Small delay to ensure DOM is ready
      }
      return () => { 
          isMounted = false;
          if (scannerRef.current) { 
              try {
                  scannerRef.current.clear().catch(() => {});
              } catch(e) {}
              scannerRef.current = null; 
          } 
      };
  }, [showCameraScanner]);

  const handleSync = () => { setSyncing(true); showToast('Connecting to ERP System...', 'info'); setTimeout(() => { setSyncing(false); showToast('Sync complete!', 'success'); }, 1500); };
  const openTransfer = (product: Product) => { setTransferModal({ isOpen: true, product }); setTransferData({ fromId: selectedWarehouse ? selectedWarehouse.id : warehouses[0]?.id || '', toId: warehouses.find(w => w.id !== (selectedWarehouse?.id || ''))?.id || '', qty: 1 }); };
  const openReceive = (product: Product) => { setReceiveModal({ isOpen: true, product }); setNewItem({ imei: '', costPrice: product.costPrice || 0, condition: 'New' }); };
  const executeTransfer = () => {
     if (!transferModal.product) return;
     if (transferData.fromId === transferData.toId) { showToast('Cannot transfer to same warehouse', 'error'); return; }
     transferStock(transferData.fromId, transferData.toId, transferModal.product.id, transferData.qty);
     setTransferModal({ isOpen: false, product: null });
  };
  const executeReceive = () => {
      if (!receiveModal.product || !selectedWarehouse) return;
      if (!newItem.imei) { showToast('IMEI/Serial is required', 'error'); return; }
      const product = receiveModal.product;
      
      // Smart logic: receive into first variant if product is complex but only has 1 variant (or user didn't pick, simplified for quick actions)
      // For more complex variant selection, user should use Product Manager. Here we assume adding to first variant for speed.
      let updatedVariants = product.variants || [];
      if (updatedVariants.length === 0) {
          // If no variants exist, create one
          updatedVariants = [{ id: `var-${Date.now()}`, color: 'Standard', storage: 'Standard', price: product.price, stock: 0, inventory: [] }];
      }

      // Add to first variant
      const targetVariant = updatedVariants[0];
      const itemToAdd: InventoryItem = { id: `item-${Date.now()}`, imei: newItem.imei, costPrice: Number(newItem.costPrice), condition: newItem.condition as any || 'New', status: 'Available', purchaseDate: new Date().toISOString().split('T')[0], sourceType: 'Wholesale', locationId: selectedWarehouse.id };
      
      updatedVariants = updatedVariants.map(v => {
          if (v.id === targetVariant.id) {
              return { ...v, inventory: [...(v.inventory || []), itemToAdd], stock: (v.stock || 0) + 1 };
          }
          return v;
      });

      const newTotalStock = updatedVariants.reduce((a, b) => a + (b.stock || 0), 0);
      updateProduct({ ...product, variants: updatedVariants, stock: newTotalStock });
      
      showToast('Stock Received Successfully', 'success');
      setReceiveModal({ isOpen: false, product: null });
  };
  const handleAddLocation = (e: React.FormEvent) => { e.preventDefault(); if(newLocation.name && newLocation.location?.address) { addWarehouse({ id: `WH-${Date.now()}`, name: newLocation.name, location: { address: newLocation.location.address }, capacity: newLocation.capacity || 1000, utilization: 0, type: newLocation.type as any || 'Retail Shop' }); setNewLocation({ name: '', type: 'Retail Shop', location: { address: '' }, capacity: 1000 }); showToast('New location created', 'success'); } };
  const getStockInWarehouse = (product: Product, warehouseId: string) => {
      let count = 0;
      product.variants?.forEach(v => { if (v.inventory) { count += v.inventory.filter(i => i.locationId === warehouseId && i.status === 'Available').length; } });
      
      // Fallback for non-tracked stock distribution (simulated)
      if (count === 0 && product.stock > 0 && !product.imeiTracking) { 
          const totalWarehouses = warehouses.length; 
          return Math.floor(product.stock / totalWarehouses); 
      }
      return count;
  };

  if (selectedWarehouse) {
      return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                  <button onClick={() => setSelectedWarehouse(null)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                      <ChevronLeft size={24} className="text-gray-600"/>
                  </button>
                  <div className="flex-1">
                      <h2 className="text-xl font-bold text-gray-900">{selectedWarehouse.name}</h2>
                      <p className="text-sm text-gray-500 flex items-center gap-2"><MapPin size={14}/> {selectedWarehouse.location.address}</p>
                  </div>
                  <div className="px-4 py-2 bg-blue-50 text-blue-700 font-bold rounded-lg text-sm border border-blue-100">
                      Capacity: {selectedWarehouse.capacity} units
                  </div>
              </div>

              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-center gap-4">
                      <div className="flex items-center gap-4">
                          <h3 className="font-bold text-gray-800">Inventory</h3>
                          <button 
                            onClick={() => setShowAllProducts(!showAllProducts)}
                            className={`text-xs font-bold px-3 py-1.5 rounded-lg border flex items-center gap-2 transition-all ${showAllProducts ? 'bg-primary text-white border-primary' : 'bg-white text-gray-600 border-gray-200'}`}
                          >
                              {showAllProducts ? <Eye size={14}/> : <EyeOff size={14}/>} 
                              {showAllProducts ? 'Showing Global Catalog' : 'Showing In-Stock Only'}
                          </button>
                      </div>
                      <input 
                        type="text" 
                        placeholder="Search items..." 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-primary w-full sm:w-64"
                      />
                  </div>
                  <table className="w-full text-left">
                      <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                          <tr>
                              <th className="p-4">Product</th>
                              <th className="p-4 text-center">Local Stock</th>
                              <th className="p-4 text-center">Global Stock</th>
                              <th className="p-4 text-right">Actions</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                          {filteredProducts.map(p => {
                              const localStock = getStockInWarehouse(p, selectedWarehouse.id);
                              if (!showAllProducts && localStock === 0 && searchTerm === '') return null;
                              return (
                                  <tr key={p.id} className="hover:bg-blue-50/30 transition-colors">
                                      <td className="p-4">
                                          <div className="flex items-center gap-3">
                                              <img src={p.image} className="w-10 h-10 rounded-lg border border-gray-200 object-contain bg-white" alt={p.name}/>
                                              <div>
                                                  <p className="font-bold text-gray-900 text-sm">{p.name}</p>
                                                  <p className="text-xs text-gray-500">{p.sku || p.barcode}</p>
                                              </div>
                                          </div>
                                      </td>
                                      <td className="p-4 text-center">
                                          <span className={`font-bold px-2 py-1 rounded text-sm ${localStock > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                                              {localStock}
                                          </span>
                                      </td>
                                      <td className="p-4 text-center text-sm text-gray-500">{p.stock}</td>
                                      <td className="p-4 text-right">
                                          <div className="flex justify-end gap-2">
                                              <button 
                                                onClick={() => openReceive(p)}
                                                className="text-xs font-bold text-green-600 border border-green-200 px-3 py-1.5 rounded-lg hover:bg-green-50 transition-colors flex items-center gap-1"
                                              >
                                                  <Plus size={12}/> Receive
                                              </button>
                                              <button 
                                                onClick={() => openTransfer(p)}
                                                className="text-xs font-bold text-blue-600 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                                                disabled={localStock === 0}
                                              >
                                                  Transfer Out
                                              </button>
                                          </div>
                                      </td>
                                  </tr>
                              );
                          })}
                      </tbody>
                  </table>
              </div>
              {receiveModal.isOpen && receiveModal.product && (
                  <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in zoom-in-95">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">Receive Stock</h3>
                          <p className="text-sm text-gray-500 mb-6">Adding to: <span className="font-bold text-primary">{selectedWarehouse.name}</span></p>
                          <div className="space-y-4 mb-6">
                              <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">IMEI / Serial</label><input type="text" autoFocus value={newItem.imei} onChange={e => setNewItem({...newItem, imei: e.target.value})} className="w-full p-3 border border-gray-200 rounded-xl focus:border-primary outline-none font-mono" placeholder="Scan..." /></div>
                              <div className="grid grid-cols-2 gap-4">
                                  <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Cost Price</label><input type="number" value={newItem.costPrice} onChange={e => setNewItem({...newItem, costPrice: parseFloat(e.target.value)})} className="w-full p-3 border border-gray-200 rounded-xl focus:border-primary outline-none" /></div>
                                  <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Condition</label><select value={newItem.condition} onChange={e => setNewItem({...newItem, condition: e.target.value as any})} className="w-full p-3 border border-gray-200 rounded-xl focus:border-primary outline-none"><option value="New">New</option><option value="Used">Used</option><option value="Open Box">Open Box</option></select></div>
                              </div>
                          </div>
                          <div className="flex gap-3"><button onClick={() => setReceiveModal({isOpen: false, product: null})} className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200">Cancel</button><button onClick={executeReceive} className="flex-1 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 shadow-lg shadow-green-200">Confirm Receive</button></div>
                      </div>
                  </div>
              )}
          </div>
      );
  }

  // --- MAIN OVERVIEW (Tabbed) ---
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
       {/* ... (Existing code) ... */}
       {/* Tab Switcher */}
       <div className="flex justify-center mb-2">
           <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-200 flex">
               <button onClick={() => setActiveTab('inventory')} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'inventory' ? 'bg-slate-900 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>Inventory View</button>
               <button onClick={() => setActiveTab('purchases')} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'purchases' ? 'bg-slate-900 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>Purchases & Receiving</button>
               <button onClick={() => setActiveTab('bulk')} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'bulk' ? 'bg-slate-900 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>Bulk Stock Entry</button>
           </div>
       </div>

       {activeTab === 'purchases' && <PurchaseManager />}
       {activeTab === 'bulk' && <BulkStockEntry />}

       {activeTab === 'inventory' && (
           <>
               <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                  <div><h2 className="text-xl font-bold text-gray-900">Inventory Operations</h2><p className="text-sm text-gray-500">Real-time stock across {warehouses.length} locations</p></div>
                  <div className="flex gap-3">
                     <button onClick={() => setShowLocationModal(true)} className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm"><Store size={18} /> Manage Stores</button>
                     <button onClick={handleSync} disabled={syncing} className="px-6 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-black transition-all flex items-center gap-2 shadow-lg disabled:opacity-70"><RefreshCw size={18} className={syncing ? "animate-spin" : ""} /> {syncing ? 'Syncing...' : 'Sync with ERP'}</button>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {warehouses.map(wh => (
                     <div key={wh.id} onClick={() => setSelectedWarehouse(wh)} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden group cursor-pointer hover:shadow-md hover:border-indigo-200 transition-all">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><Building2 size={64} /></div>
                        <div className="flex justify-between items-start mb-4 relative z-10">
                           <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-colors"><Building2 size={24} /></div>
                           <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${wh.utilization > 80 ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'}`}>{wh.utilization}% Load</span>
                        </div>
                        <h3 className="font-bold text-gray-900 text-lg relative z-10 group-hover:text-indigo-700 transition-colors">{wh.name}</h3>
                        <p className="text-sm text-gray-500 mb-4 relative z-10">{wh.location.address}</p>
                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden mb-2 relative z-10"><div className="h-full bg-indigo-500 rounded-full transition-all duration-1000" style={{ width: `${wh.utilization}%` }}></div></div>
                        <div className="flex justify-between text-xs font-medium text-gray-500 relative z-10"><span>{wh.type}</span><span>Tap to Manage</span></div>
                     </div>
                  ))}
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[500px]">
                     <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/50">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"><Package size={20}/> Global Stock Matrix</h2>
                        <div className="flex gap-2 w-full sm:w-auto">
                            <div className="relative flex-1"><ScanLine size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input ref={searchInputRef} type="text" placeholder="Scan Barcode / Search SKU" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary transition-all font-mono" autoFocus /></div>
                            <button onClick={() => setShowCameraScanner(!showCameraScanner)} className={`p-2 rounded-lg border ${showCameraScanner ? 'bg-red-50 text-red-600 border-red-200' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}><Camera size={20} /></button>
                        </div>
                     </div>
                     
                     {showCameraScanner && <div className="p-4 bg-black/5 border-b border-gray-200 flex justify-center"><div id="reader" className="w-[300px] h-[300px] bg-white rounded-xl overflow-hidden"></div></div>}
                     
                     <div className="flex-1 overflow-auto custom-scrollbar">
                        <table className="w-full text-left">
                           <thead className="bg-white text-xs font-bold text-gray-500 uppercase tracking-wider sticky top-0 z-10 shadow-sm">
                              <tr><th className="p-5 bg-gray-50">Product</th><th className="p-5 text-center bg-gray-50">Total</th>{warehouses.slice(0, 3).map(wh => <th key={wh.id} className="p-5 text-center bg-gray-50 hidden md:table-cell">{wh.name.split(' ')[0]}</th>)}<th className="p-5 text-right bg-gray-50">Actions</th></tr>
                           </thead>
                           <tbody className="divide-y divide-gray-50">
                              {filteredProducts.slice(0, 20).map(p => {
                                 return (
                                    <tr key={p.id} className="hover:bg-blue-50/30 transition-colors group">
                                       <td className="p-5"><div className="flex items-center gap-3"><img src={p.image || `https://picsum.photos/seed/${p.imageSeed}/40/40`} className="w-10 h-10 rounded-lg border border-gray-200 bg-white object-contain" alt={p.name}/><div><p className="font-bold text-gray-900 text-sm line-clamp-1">{p.name}</p><p className="text-xs text-gray-400 font-mono">{p.barcode || p.sku || `SKU-${p.id.substring(0,4)}`}</p></div></div></td>
                                       <td className="p-5 text-center"><span className={`font-bold text-sm px-2 py-1 rounded ${p.stock < 5 ? 'text-red-700 bg-red-50' : 'text-gray-900 bg-gray-100'}`}>{p.stock}</span></td>
                                       {warehouses.slice(0, 3).map(wh => <td key={wh.id} className="p-5 text-center text-sm text-gray-600 hidden md:table-cell">{getStockInWarehouse(p, wh.id)}</td>)}
                                       <td className="p-5 text-right"><button onClick={() => openTransfer(p)} className="text-xs font-bold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg border border-transparent hover:border-blue-100 transition-colors flex items-center gap-1 ml-auto opacity-0 group-hover:opacity-100"><ArrowRightLeft size={14}/> Transfer</button></td>
                                    </tr>
                                 );
                              })}
                           </tbody>
                        </table>
                     </div>
                  </div>

                  <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 flex flex-col h-[500px]">
                     <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2"><Clock size={20}/> Live Transfer Log</h3>
                     <div className="flex-1 overflow-y-auto custom-scrollbar space-y-6 pr-2">
                        {transferLogs.length === 0 ? <div className="text-center text-gray-400 text-sm pt-20">No recent activity</div> : transferLogs.map((log) => {
                                const fromName = warehouses.find(w => w.id === log.fromLocationId)?.name || 'Unknown';
                                const toName = warehouses.find(w => w.id === log.toLocationId)?.name || 'Unknown';
                                const prod = products.find(p => p.id === log.productId);
                                return (
                                   <div key={log.id} className="relative pl-6 pb-6 border-l border-gray-100 last:pb-0">
                                      <div className="absolute left-[-5px] top-0 w-2.5 h-2.5 rounded-full border-2 border-white shadow-sm bg-blue-500"></div>
                                      <div className="flex justify-between items-start mb-1"><span className="text-sm font-bold text-gray-900">Transfer</span><span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-bold">{log.quantity} Items</span></div>
                                      <p className="text-xs text-gray-600 mb-1 font-medium">{prod?.name || 'Item'}</p>
                                      <p className="text--[10px] text-gray-500 flex items-center gap-1">{fromName} <ArrowRight size={10}/> {toName}</p>
                                      <span className="text-[10px] text-gray-400 font-medium block mt-1">{new Date(log.timestamp).toLocaleString()}</span>
                                   </div>
                                );
                            })
                        }
                     </div>
                  </div>
               </div>
           </>
       )}

       {/* ... (Modals kept same) ... */}
       {/* Transfer Modal */}
       {transferModal.isOpen && transferModal.product && (
          <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
             <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 animate-in zoom-in-95">
                <div className="flex justify-between items-start mb-6"><div><h3 className="text-xl font-bold text-gray-900">Transfer Stock</h3><p className="text-sm text-gray-500">Move inventory between warehouses</p></div><button onClick={() => setTransferModal({isOpen: false, product: null})} className="p-2 hover:bg-gray-100 rounded-full"><X size={20}/></button></div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6 flex items-center gap-4"><img src={transferModal.product.image} className="w-12 h-12 object-contain bg-white rounded-lg border border-gray-200" alt="prod"/><div><p className="font-bold text-gray-900">{transferModal.product.name}</p><p className="text-xs text-gray-500">Total Stock: {transferModal.product.stock}</p></div></div>
                <div className="space-y-4 mb-8">
                   <div className="grid grid-cols-2 gap-4">
                      <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">From Location</label><select value={transferData.fromId} onChange={e => setTransferData({...transferData, fromId: e.target.value})} className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm focus:border-primary outline-none">{warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}</select></div>
                      <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">To Location</label><select value={transferData.toId} onChange={e => setTransferData({...transferData, toId: e.target.value})} className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm focus:border-primary outline-none">{warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}</select></div>
                   </div>
                   <div className="flex items-center gap-4 justify-center py-2"><div className="h-px bg-gray-200 flex-1"></div><ArrowRight size={16} className="text-gray-400"/><div className="h-px bg-gray-200 flex-1"></div></div>
                   <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Quantity</label><input type="number" min="1" max={transferModal.product.stock} value={transferData.qty} onChange={e => setTransferData({...transferData, qty: parseInt(e.target.value)})} className="w-full p-3 bg-white border border-gray-200 rounded-xl font-bold focus:border-primary outline-none" /></div>
                </div>
                <div className="flex gap-3"><button onClick={() => setTransferModal({isOpen: false, product: null})} className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors">Cancel</button><button onClick={executeTransfer} className="flex-1 py-3 bg-primary text-white font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-lg shadow-primary/20">Confirm Transfer</button></div>
             </div>
          </div>
       )}

       {/* Location Management Modal */}
       {showLocationModal && (
          <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
             <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col h-[80vh]">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50"><div><h3 className="font-bold text-xl text-gray-900">Manage Stores & Warehouses</h3><p className="text-sm text-gray-500">Add or remove locations from your network.</p></div><button onClick={() => setShowLocationModal(false)} className="p-2 hover:bg-gray-200 rounded-full"><X size={20}/></button></div>
                <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                   <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100"><h4 className="font-bold text-blue-900 mb-4 flex items-center gap-2"><Plus size={18}/> Add New Location</h4><form onSubmit={handleAddLocation} className="grid grid-cols-1 md:grid-cols-2 gap-4"><div><label className="block text-xs font-bold text-blue-800/70 uppercase mb-1">Name</label><input type="text" required placeholder="e.g. Jahra Branch" value={newLocation.name} onChange={e => setNewLocation({...newLocation, name: e.target.value})} className="w-full p-2.5 bg-white border border-blue-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"/></div><div><label className="block text-xs font-bold text-blue-800/70 uppercase mb-1">Type</label><select value={newLocation.type} onChange={e => setNewLocation({...newLocation, type: e.target.value as any})} className="w-full p-2.5 bg-white border border-blue-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"><option value="Retail Shop">Retail Shop</option><option value="Main Warehouse">Main Warehouse</option><option value="Online Fulfillment">Online Fulfillment</option></select></div><div className="md:col-span-2"><label className="block text-xs font-bold text-blue-800/70 uppercase mb-1">Address</label><input type="text" required placeholder="e.g. Block 4, Street 20, Building 5" value={newLocation.location?.address} onChange={e => setNewLocation({...newLocation, location: { address: e.target.value }})} className="w-full p-2.5 bg-white border border-blue-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"/></div><div className="md:col-span-2"><button type="submit" className="w-full py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-md">Create Location</button></div></form></div>
                   <div><h4 className="font-bold text-gray-900 mb-4">Active Locations ({warehouses.length})</h4><div className="space-y-3">{warehouses.map(wh => (<div key={wh.id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl group hover:border-gray-300 transition-colors shadow-sm"><div className="flex items-center gap-4"><div className={`p-2.5 rounded-lg ${wh.type === 'Main Warehouse' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}><Building2 size={20} /></div><div><h5 className="font-bold text-gray-900 text-sm">{wh.name}</h5><p className="text-xs text-gray-500">{wh.type} • {wh.location.address}</p></div></div><button onClick={() => { if(confirm(`Are you sure you want to remove ${wh.name}?`)) { removeWarehouse(wh.id); }}} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Remove Location"><Trash2 size={18} /></button></div>))}</div></div>
                </div>
             </div>
          </div>
       )}
    </div>
  );
};
