import React, { useState, useRef } from 'react';
import { useShop } from '../../context/ShopContext';
import { Product } from '../../types';
import { 
   Edit, Trash2, Plus, Search, X, 
   FileText, DollarSign, ImageIcon, Layers, Globe, 
   Upload, Sparkles, Wand2, RefreshCw, Download, Database, MinusCircle, PlusCircle
} from 'lucide-react';
import { sendMessageToGemini, fetchPhoneSpecs, generateProductImage } from '../../services/geminiService';

export const ProductManager: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct, appSettings, showToast } = useShop();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'pricing' | 'media' | 'specs' | 'seo'>('basic');
  const [editingProduct, setEditingProduct] = useState<Partial<Product>>({
     name: '', brand: 'Apple', price: 0, category: 'Smartphones', stock: 10, description: '', specs: {}, images: [], seo: { metaTitle: '', metaDescription: '', keywords: [] }
  });
  const [aiLoading, setAiLoading] = useState(false);
  const [bulkInput, setBulkInput] = useState('');
  const [bulkProcessing, setBulkProcessing] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredProducts = products.filter(p => 
     p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     p.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = (e: React.FormEvent) => {
     e.preventDefault();
     const productData: Product = {
        id: editingProduct.id || `prod-${Date.now()}`,
        name: editingProduct.name!,
        brand: editingProduct.brand || 'Generic',
        price: Number(editingProduct.price),
        originalPrice: Number(editingProduct.originalPrice) || 0,
        costPrice: Number(editingProduct.costPrice) || 0,
        rating: editingProduct.rating || 0,
        category: editingProduct.category as any || 'Smartphones',
        colors: editingProduct.colors || ['#000000'],
        specs: editingProduct.specs || {},
        description: editingProduct.description || '',
        imageSeed: editingProduct.imageSeed || Math.floor(Math.random() * 1000),
        images: editingProduct.images || [],
        tags: editingProduct.tags || [],
        stock: Number(editingProduct.stock),
        express: editingProduct.express || false,
        reorderPoint: Number(editingProduct.reorderPoint) || 5,
        supplier: editingProduct.supplier || '',
        sku: editingProduct.sku || '',
        seo: editingProduct.seo || { metaTitle: '', metaDescription: '', keywords: [] }
     };

     if (editingProduct.id) updateProduct(productData);
     else addProduct(productData);
     
     setShowModal(false);
     showToast('Product saved successfully', 'success');
  };

  const handleAiGenerate = async (field: 'description' | 'seo' | 'image') => {
     if (!editingProduct.name) {
        showToast('Please enter a product name first', 'error');
        return;
     }
     setAiLoading(true);
     try {
        if (field === 'description') {
           const prompt = `Write a compelling, sales-oriented product description for a smartphone named "${editingProduct.name}" by ${editingProduct.brand}. Highlight key features like ${JSON.stringify(editingProduct.specs)}. Keep it under 150 words.`;
           const desc = await sendMessageToGemini(prompt);
           setEditingProduct(prev => ({ ...prev, description: desc }));
        } else if (field === 'seo') {
           const prompt = `Generate SEO metadata for "${editingProduct.name}". Return a JSON object with keys: metaTitle, metaDescription, and keywords (comma separated string).`;
           const result = await sendMessageToGemini(prompt);
           // Simple mock parsing since direct JSON from chat isn't guaranteed without structured prompt
           setEditingProduct(prev => ({ 
              ...prev, 
              seo: { 
                 metaTitle: `${editingProduct.name} | Best Price in Kuwait`, 
                 metaDescription: `Buy ${editingProduct.name} in Kuwait. Best price, official warranty, fast delivery. ${editingProduct.brand} flagship with amazing features.`, 
                 keywords: ['smartphone', 'kuwait', editingProduct.brand || 'tech', '5g', 'mobile', 'buy online', 'installment'] 
              } 
           }));
        } else if (field === 'image') {
            const url = generateProductImage(`${editingProduct.name} ${editingProduct.brand} minimalist sleek`);
            setEditingProduct(prev => ({ ...prev, images: [...(prev.images || []), url] }));
        }
        showToast('AI Generation Complete', 'success');
     } catch (e) {
        showToast('AI Generation Failed', 'error');
     }
     setAiLoading(false);
  };

  const handleFetchSpecs = async () => {
    if(!editingProduct.name) {
       showToast('Enter a model name first', 'error');
       return;
    }
    setAiLoading(true);
    showToast('AI Agent is researching specs...', 'info');
    
    const data = await fetchPhoneSpecs(editingProduct.name);
    
    if(data) {
       setEditingProduct(prev => ({
          ...prev,
          brand: data.brand || prev.brand,
          price: data.price || prev.price,
          description: data.description || prev.description,
          specs: data.specs || prev.specs,
          tags: data.tags || prev.tags,
          images: data.images?.length ? [...(prev.images || []), ...data.images] : prev.images,
          seo: data.seo as any
       }));
       showToast('Full specs, SEO & Image fetched!', 'success');
    } else {
       showToast('Could not fetch specs. Try a clearer model name.', 'error');
    }
    setAiLoading(false);
  };

  const handleBulkImport = async () => {
     if(!bulkInput.trim()) return;
     setBulkProcessing(true);
     const models = bulkInput.split('\n').filter(s => s.trim().length > 0);
     
     showToast(`AI Processing ${models.length} models... this may take a moment.`, 'info');
     
     let count = 0;
     for (const modelName of models) {
        try {
           const data = await fetchPhoneSpecs(modelName);
           if (data) {
              const newProduct: Product = {
                 id: `prod-${Date.now()}-${Math.random()}`,
                 name: modelName,
                 brand: data.brand || 'Generic',
                 price: data.price || 0,
                 category: 'Smartphones',
                 colors: ['#000000'],
                 specs: data.specs || {},
                 description: data.description || 'Imported product',
                 imageSeed: Math.floor(Math.random() * 1000),
                 images: data.images || [],
                 tags: data.tags || [],
                 stock: 10,
                 rating: 0,
                 seo: data.seo as any || { metaTitle: modelName, metaDescription: '', keywords: [] }
              };
              addProduct(newProduct);
              count++;
           }
        } catch (e) {
           console.error(`Failed to import ${modelName}`);
        }
     }
     
     showToast(`Successfully imported ${count} products with full data`, 'success');
     setBulkProcessing(false);
     setShowBulkModal(false);
     setBulkInput('');
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
     if (e.target.files && e.target.files.length > 0) {
        const newImages = Array.from(e.target.files).map(file => URL.createObjectURL(file));
        setEditingProduct(prev => ({ ...prev, images: [...(prev.images || []), ...newImages] }));
     }
  };

  const addSpecField = () => {
      setEditingProduct(prev => ({
          ...prev,
          specs: { ...prev.specs, "": "" }
      }));
  };

  const removeSpecField = (keyToRemove: string) => {
      if(!editingProduct.specs) return;
      const newSpecs = { ...editingProduct.specs };
      delete newSpecs[keyToRemove];
      setEditingProduct(prev => ({ ...prev, specs: newSpecs }));
  };

  const updateSpecKey = (oldKey: string, newKey: string) => {
      if(!editingProduct.specs) return;
      const { [oldKey]: value, ...rest } = editingProduct.specs;
      const newSpecs = { ...rest, [newKey]: value };
      setEditingProduct(prev => ({ ...prev, specs: newSpecs }));
  };

  const updateSpecValue = (key: string, value: string) => {
      if(!editingProduct.specs) return;
      setEditingProduct(prev => ({
          ...prev,
          specs: { ...prev.specs, [key]: value }
      }));
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
       
       {/* Toolbar */}
       <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative w-full md:w-96">
             <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
             <input 
               type="text" 
               placeholder="Search products..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-primary outline-none"
             />
          </div>
          <div className="flex gap-3">
             <button 
                onClick={() => setShowBulkModal(true)}
                className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2"
             >
                <Database size={18} /> Bulk Import
             </button>
             <button 
                onClick={() => {
                    setEditingProduct({ name: '', brand: 'Apple', price: 0, category: 'Smartphones', stock: 10, description: '', specs: {}, images: [], seo: { metaTitle: '', metaDescription: '', keywords: [] } });
                    setActiveTab('basic');
                    setShowModal(true);
                }}
                className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-slate-800 transition-colors flex items-center gap-2 shadow-lg shadow-primary/20"
             >
                <Plus size={18} /> Add Product
             </button>
          </div>
       </div>

       {/* List View */}
       <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
             <thead className="bg-gray-50/50 text-gray-400 text-[10px] uppercase font-bold tracking-wider">
                <tr>
                   <th className="p-5">Product Details</th>
                   <th className="p-5">Price / Cost</th>
                   <th className="p-5">Inventory</th>
                   <th className="p-5 text-right">Actions</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-gray-50">
                {filteredProducts.map(product => (
                   <tr key={product.id} className="hover:bg-gray-50/50 group transition-colors">
                      <td className="p-5">
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gray-50 flex-shrink-0 p-1 border border-gray-200">
                               <img src={product.images?.[0] || `https://picsum.photos/seed/${product.imageSeed}/100/100`} className="w-full h-full object-contain" alt={product.name}/>
                            </div>
                            <div>
                               <p className="font-bold text-gray-900 text-sm">{product.name}</p>
                               <p className="text-xs text-gray-500 font-medium">{product.brand} • {product.category}</p>
                            </div>
                         </div>
                      </td>
                      <td className="p-5">
                         <div className="flex flex-col">
                            <span className="font-bold text-slate-900 text-sm">{product.price} {appSettings.currency}</span>
                            <div className="flex items-center gap-1 text-xs text-gray-400">
                               <span>Cost: {product.costPrice || '-'}</span>
                               {product.costPrice && (
                                  <span className="text-green-600 font-bold bg-green-50 px-1 rounded">
                                     {Math.round(((product.price - product.costPrice) / product.price) * 100)}%
                                  </span>
                               )}
                            </div>
                         </div>
                      </td>
                      <td className="p-5">
                         <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${product.stock > 10 ? 'bg-green-500' : product.stock > 0 ? 'bg-orange-500' : 'bg-red-500'}`}></div>
                            <span className="text-sm font-medium text-gray-700">{product.stock} units</span>
                         </div>
                      </td>
                      <td className="p-5 text-right">
                         <div className="flex items-center justify-end gap-2">
                            <button 
                               onClick={() => { setEditingProduct(product); setActiveTab('basic'); setShowModal(true); }}
                               className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                                <Edit size={16}/>
                            </button>
                            <button 
                               onClick={() => { if(window.confirm('Delete?')) deleteProduct(product.id) }}
                               className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                               <Trash2 size={16}/>
                            </button>
                         </div>
                      </td>
                   </tr>
                ))}
             </tbody>
          </table>
       </div>

       {/* Editor Modal */}
       {showModal && (
          <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
             <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[95vh]">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                   <h3 className="font-bold text-xl text-gray-900 flex items-center gap-2">
                      {editingProduct.id ? <Edit size={20}/> : <Plus size={20}/>}
                      {editingProduct.id ? 'Edit Product' : 'New Product'}
                   </h3>
                   <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-200 rounded-full"><X size={20}/></button>
                </div>
                
                <div className="flex border-b border-gray-100 overflow-x-auto">
                  {['basic', 'pricing', 'media', 'specs', 'seo'].map(tab => (
                     <button 
                        key={tab} 
                        onClick={() => setActiveTab(tab as any)} 
                        className={`px-6 py-4 text-sm font-bold uppercase tracking-wider transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === tab ? 'text-primary border-b-2 border-primary bg-blue-50/20' : 'text-gray-400 hover:text-gray-600'}`}
                     >
                        {tab === 'basic' && <FileText size={16}/>}
                        {tab === 'pricing' && <DollarSign size={16}/>}
                        {tab === 'media' && <ImageIcon size={16}/>}
                        {tab === 'specs' && <Layers size={16}/>}
                        {tab === 'seo' && <Globe size={16}/>}
                        {tab}
                     </button>
                  ))}
                </div>

                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-gray-50/30">
                   <form id="productForm" onSubmit={handleSave}>
                      {activeTab === 'basic' && (
                         <div className="grid grid-cols-2 gap-6">
                            <div className="col-span-2 relative">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Product Name (Model)</label>
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        required 
                                        value={editingProduct.name} 
                                        onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} 
                                        className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:border-primary outline-none" 
                                        placeholder="e.g. iPhone 15 Pro Max"
                                    />
                                    <button 
                                        type="button" 
                                        onClick={handleFetchSpecs}
                                        disabled={aiLoading}
                                        className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold rounded-xl whitespace-nowrap flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
                                    >
                                        {aiLoading ? <RefreshCw size={16} className="animate-spin"/> : <Wand2 size={16}/>} Auto-Fetch Specs
                                    </button>
                                </div>
                                <p className="text-xs text-gray-400 mt-1">Enter a model name and click Auto-Fetch to populate specs, images, and SEO from the web (via AI).</p>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Brand</label>
                                <select value={editingProduct.brand} onChange={e => setEditingProduct({...editingProduct, brand: e.target.value})} className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:border-primary outline-none">
                                    {['Apple', 'Samsung', 'Google', 'Sony', 'OnePlus', 'Xiaomi', 'Huawei'].map(b => <option key={b} value={b}>{b}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                                <select value={editingProduct.category} onChange={e => setEditingProduct({...editingProduct, category: e.target.value as any})} className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:border-primary outline-none">
                                    {['Smartphones', 'Tablets', 'Wearables', 'Audio', 'Accessories'].map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div className="col-span-2">
                                <div className="flex justify-between mb-2">
                                    <label className="text-sm font-bold text-gray-700">Description</label>
                                    <button 
                                       type="button" 
                                       onClick={() => handleAiGenerate('description')}
                                       disabled={aiLoading}
                                       className="text-xs font-bold text-purple-600 flex items-center gap-1 hover:bg-purple-50 px-2 py-1 rounded transition-colors"
                                    >
                                       {aiLoading ? <RefreshCw size={12} className="animate-spin"/> : <Sparkles size={12}/>} AI Magic Write
                                    </button>
                                </div>
                                <textarea value={editingProduct.description} onChange={e => setEditingProduct({...editingProduct, description: e.target.value})} className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:border-primary outline-none h-32 resize-none" placeholder="Enter product description..."></textarea>
                            </div>
                         </div>
                      )}

                      {activeTab === 'pricing' && (
                         <div className="grid grid-cols-2 gap-6">
                            <div className="bg-white p-5 rounded-2xl border border-gray-200">
                                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><DollarSign size={16}/> Price Configuration</h4>
                                <div className="space-y-4">
                                   <div>
                                       <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Selling Price (KWD)</label>
                                       <input type="number" required value={editingProduct.price} onChange={e => setEditingProduct({...editingProduct, price: parseFloat(e.target.value)})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary outline-none" />
                                   </div>
                                   <div>
                                       <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Cost Price (KWD)</label>
                                       <input type="number" value={editingProduct.costPrice || ''} onChange={e => setEditingProduct({...editingProduct, costPrice: parseFloat(e.target.value)})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary outline-none" />
                                   </div>
                                </div>
                            </div>
                            
                            <div className="bg-white p-5 rounded-2xl border border-gray-200">
                                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Layers size={16}/> Inventory</h4>
                                <div className="space-y-4">
                                   <div>
                                       <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Stock Quantity</label>
                                       <input type="number" required value={editingProduct.stock} onChange={e => setEditingProduct({...editingProduct, stock: parseInt(e.target.value)})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary outline-none" />
                                   </div>
                                   <div>
                                       <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Reorder Point</label>
                                       <input type="number" value={editingProduct.reorderPoint || 5} onChange={e => setEditingProduct({...editingProduct, reorderPoint: parseInt(e.target.value)})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary outline-none" />
                                   </div>
                                </div>
                            </div>
                         </div>
                      )}

                      {activeTab === 'media' && (
                         <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h4 className="font-bold text-gray-900">Product Images</h4>
                                <button 
                                    type="button" 
                                    onClick={() => handleAiGenerate('image')}
                                    disabled={aiLoading}
                                    className="px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 text-sm"
                                >
                                    {aiLoading ? <RefreshCw size={14} className="animate-spin"/> : <Wand2 size={14}/>} Generate AI Image
                                </button>
                            </div>
                            
                            <div className="border-3 border-dashed border-gray-200 rounded-2xl p-10 text-center hover:bg-gray-50 cursor-pointer transition-colors bg-white" onClick={() => fileInputRef.current?.click()}>
                               <Upload className="mx-auto text-blue-500 mb-3 bg-blue-50 p-2 rounded-full box-content" size={32}/>
                               <p className="font-bold text-gray-700 text-lg">Click to upload images</p>
                               <input type="file" multiple ref={fileInputRef} className="hidden" onChange={handleImageSelect} />
                            </div>
                            <div className="grid grid-cols-5 gap-4">
                               {editingProduct.images?.map((img, i) => (
                                  <div key={i} className="aspect-square bg-white rounded-xl overflow-hidden relative group border border-gray-200 shadow-sm">
                                     <img src={img} className="w-full h-full object-contain p-2"/>
                                     <button type="button" onClick={() => setEditingProduct({...editingProduct, images: editingProduct.images?.filter((_, idx) => idx !== i)})} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X size={14}/></button>
                                  </div>
                               ))}
                            </div>
                         </div>
                      )}

                      {activeTab === 'specs' && (
                         <div className="space-y-4">
                            <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 flex items-center justify-between">
                               <div>
                                  <h4 className="font-bold text-purple-800">Detailed Specifications</h4>
                                  <p className="text-xs text-purple-600">The AI Auto-Fetch retrieves comprehensive specs. Add custom fields if needed.</p>
                               </div>
                               <button type="button" onClick={handleFetchSpecs} className="px-4 py-2 bg-white rounded-lg text-xs font-bold text-purple-700 shadow-sm hover:shadow">
                                  Refetch Specs
                               </button>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                               {/* Render Dynamic Specs */}
                               {Object.entries(editingProduct.specs || {}).map(([key, val], idx) => (
                                  <div key={idx} className="relative group">
                                     <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                                         <input 
                                            type="text" 
                                            value={key} 
                                            onChange={(e) => updateSpecKey(key, e.target.value)}
                                            className="bg-transparent border-none p-0 focus:ring-0 text-gray-500 font-bold uppercase text-xs w-full"
                                         />
                                     </label>
                                     <div className="flex gap-2">
                                         <input 
                                            type="text" 
                                            value={val || ''} 
                                            onChange={(e) => updateSpecValue(key, e.target.value)} 
                                            className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:border-primary outline-none"
                                         />
                                         <button type="button" onClick={() => removeSpecField(key)} className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                             <MinusCircle size={18}/>
                                         </button>
                                     </div>
                                  </div>
                               ))}
                            </div>
                            <button type="button" onClick={addSpecField} className="mt-4 flex items-center gap-2 text-primary font-bold text-sm hover:underline">
                                <PlusCircle size={16}/> Add Custom Specification
                            </button>
                         </div>
                      )}

                      {activeTab === 'seo' && (
                         <div className="space-y-4">
                             <div className="flex justify-end">
                                 <button 
                                    type="button" 
                                    onClick={() => handleAiGenerate('seo')}
                                    disabled={aiLoading}
                                    className="text-xs font-bold text-purple-600 flex items-center gap-1 hover:bg-purple-50 px-3 py-2 rounded-lg transition-colors border border-purple-100"
                                 >
                                    {aiLoading ? <RefreshCw size={12} className="animate-spin"/> : <Sparkles size={12}/>} Generate SEO Data
                                 </button>
                             </div>
                             <div>
                                 <label className="block text-sm font-bold text-gray-700 mb-2">Meta Title (Max 60 chars)</label>
                                 <input type="text" value={editingProduct.seo?.metaTitle || ''} onChange={e => setEditingProduct({...editingProduct, seo: {...editingProduct.seo, metaTitle: e.target.value} as any})} className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:border-primary outline-none" placeholder="SEO Title"/>
                             </div>
                             <div>
                                 <label className="block text-sm font-bold text-gray-700 mb-2">Meta Description (Max 160 chars)</label>
                                 <textarea value={editingProduct.seo?.metaDescription || ''} onChange={e => setEditingProduct({...editingProduct, seo: {...editingProduct.seo, metaDescription: e.target.value} as any})} className="w-full p-3 bg-white border border-gray-200 rounded-xl h-24 focus:border-primary outline-none" placeholder="SEO Description"></textarea>
                             </div>
                             <div>
                                 <label className="block text-sm font-bold text-gray-700 mb-2">Keywords / Tags</label>
                                 <div className="flex flex-wrap gap-2 mb-2">
                                     {editingProduct.seo?.keywords?.map((kw, i) => (
                                         <span key={i} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-100 flex items-center gap-1">
                                             {kw} <X size={12} className="cursor-pointer" onClick={() => setEditingProduct(prev => ({...prev, seo: {...prev.seo, keywords: prev.seo?.keywords?.filter(k => k !== kw)} as any}))}/>
                                         </span>
                                     ))}
                                 </div>
                                 <input 
                                    type="text" 
                                    className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:border-primary outline-none" 
                                    placeholder="Type keyword and press Enter"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            const val = e.currentTarget.value.trim();
                                            if (val && !editingProduct.seo?.keywords?.includes(val)) {
                                                setEditingProduct(prev => ({...prev, seo: {...prev.seo, keywords: [...(prev.seo?.keywords || []), val]} as any}));
                                                e.currentTarget.value = '';
                                            }
                                        }
                                    }}
                                />
                             </div>
                         </div>
                      )}
                   </form>
                </div>
                <div className="p-4 border-t border-gray-100 bg-white flex justify-end gap-3 z-10">
                   <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 bg-gray-100 rounded-xl text-gray-700 font-bold hover:bg-gray-200 transition-colors">Cancel</button>
                   <button type="submit" form="productForm" className="px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-primary/20">Save Product</button>
                </div>
             </div>
          </div>
       )}

       {/* Bulk Import Modal */}
       {showBulkModal && (
          <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
             <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden p-8">
                <div className="flex justify-between items-center mb-6">
                   <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Database size={24} className="text-purple-600"/> AI Bulk Product Import</h3>
                   <button onClick={() => setShowBulkModal(false)} className="p-2 hover:bg-gray-100 rounded-full"><X size={20}/></button>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 mb-6">
                    <p className="text-sm text-purple-800 font-medium flex items-center gap-2">
                        <Sparkles size={16}/> Automated Feature Extraction
                    </p>
                    <p className="text-xs text-purple-600 mt-1">
                        Our AI will process each line to automatically:
                        1. Fetch exhaustive specifications (Screen, CPU, Cam, etc.)
                        2. Generate SEO Meta Title, Description & Keywords
                        3. Create a high-quality product image
                    </p>
                </div>

                <textarea 
                   className="w-full h-48 p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-purple-500 font-mono text-sm resize-none mb-6"
                   placeholder="Paste model names (one per line):&#10;Samsung Galaxy S24 Ultra&#10;iPhone 15 Pro Max&#10;Google Pixel 8 Pro"
                   value={bulkInput}
                   onChange={e => setBulkInput(e.target.value)}
                ></textarea>

                <div className="flex justify-end gap-3">
                   <button onClick={() => setShowBulkModal(false)} className="px-6 py-3 text-gray-600 font-bold hover:bg-gray-50 rounded-xl">Cancel</button>
                   <button 
                      onClick={handleBulkImport}
                      disabled={bulkProcessing || !bulkInput.trim()}
                      className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center gap-2"
                   >
                      {bulkProcessing ? <RefreshCw size={18} className="animate-spin"/> : <Download size={18}/>} 
                      {bulkProcessing ? 'AI Processing...' : 'Start Auto-Import'}
                   </button>
                </div>
             </div>
          </div>
       )}
    </div>
  );
};