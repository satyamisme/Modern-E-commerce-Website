import React, { useState, useRef, useEffect } from 'react';
import { useShop } from '../../context/ShopContext';
import { Product, ProductVariant } from '../../types';
import { 
   Edit, Trash2, Plus, Search, X, 
   FileText, DollarSign, ImageIcon, Layers, Globe, 
   Upload, RefreshCw, Box, CheckCircle, 
   Palette, ArrowLeft, ChevronRight, Wand2, ChevronLeft, Calculator, Tag, BrainCircuit, Filter, LayoutTemplate, Star
} from 'lucide-react';
import { fetchPhoneSpecs, findProductImage, searchMobileModels, generateSEO } from '../../services/geminiService';

export const ProductManager: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct, appSettings, showToast } = useShop();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'variants' | 'media' | 'specs' | 'seo' | 'storefront'>('basic');
  const [viewFilter, setViewFilter] = useState<'all' | 'hero' | 'featured' | 'ticker'>('all');
  
  const [editingProduct, setEditingProduct] = useState<Partial<Product>>({
     name: '', brand: 'Apple', price: 0, category: 'Smartphones', stock: 0, description: '', specs: {}, images: [], seo: { metaTitle: '', metaDescription: '', keywords: [] }, colors: [], storageOptions: [], variants: [], isHero: false, isFeatured: false, isTicker: false
  });
  
  const [aiLoading, setAiLoading] = useState(false);
  const [imageTab, setImageTab] = useState<'fetch' | 'url' | 'upload'>('fetch');
  const [imageUrlInput, setImageUrlInput] = useState('');
  
  // Autocomplete State
  const [suggestions, setSuggestions] = useState<Array<{model: string, brand: string, variants: string[], year: string}>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionLoading, setSuggestionLoading] = useState(false);
  
  // Ref for click outside to close autocomplete
  const autocompleteRef = useRef<HTMLDivElement>(null);

  // Variant Inputs
  const [colorInput, setColorInput] = useState('');
  const [storageInput, setStorageInput] = useState('');

  // Smart Bulk Updates State
  const [bulkColorScope, setBulkColorScope] = useState<string>('all');
  const [bulkStorageScope, setBulkStorageScope] = useState<string>('all');
  const [bulkAction, setBulkAction] = useState<string>('price_set'); // 'price_set', 'price_add', 'stock_set'
  const [bulkValue, setBulkValue] = useState<string>('');

  // Matrix View Filters
  const [matrixFilterColor, setMatrixFilterColor] = useState<string>('all');
  const [matrixFilterStorage, setMatrixFilterStorage] = useState<string>('all');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredProducts = products.filter(p => {
     const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           p.brand.toLowerCase().includes(searchTerm.toLowerCase());
     
     if (viewFilter === 'hero') return matchesSearch && p.isHero;
     if (viewFilter === 'featured') return matchesSearch && p.isFeatured;
     if (viewFilter === 'ticker') return matchesSearch && p.isTicker;
     
     return matchesSearch;
  });

  // Click Outside Handler for Autocomplete
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (autocompleteRef.current && !autocompleteRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced Model Search
  useEffect(() => {
      const delayDebounceFn = setTimeout(async () => {
        // Only search if user is typing and modal is open
        if (editingProduct.name && editingProduct.name.length > 2 && showModal && document.activeElement?.getAttribute('name') === 'productName') {
            setSuggestionLoading(true);
            const results = await searchMobileModels(editingProduct.name);
            setSuggestions(results);
            setSuggestionLoading(false);
            if(results.length > 0) setShowSuggestions(true);
        }
      }, 500);

      return () => clearTimeout(delayDebounceFn);
  }, [editingProduct.name, showModal]);

  const handleModelSelect = (model: any) => {
      setEditingProduct(prev => ({
          ...prev,
          name: model.model,
          brand: model.brand,
          tags: [...(prev.tags || []), ...model.variants, model.year]
      }));
      setShowSuggestions(false);
      handleFetchSpecs(model.model);
  };

  const handleSave = (e: React.FormEvent) => {
     e.preventDefault();
     
     // Calculate total stock from variants if they exist
     const totalStock = editingProduct.variants?.length 
        ? editingProduct.variants.reduce((acc, v) => acc + v.stock, 0)
        : Number(editingProduct.stock);

     const productData: Product = {
        id: editingProduct.id || `prod-${Date.now()}`,
        name: editingProduct.name!,
        brand: editingProduct.brand || 'Generic',
        price: Number(editingProduct.price),
        originalPrice: Number(editingProduct.originalPrice) || 0,
        costPrice: Number(editingProduct.costPrice) || 0,
        rating: editingProduct.rating || 0,
        category: editingProduct.category as any || 'Smartphones',
        colors: editingProduct.colors || [],
        storageOptions: editingProduct.storageOptions || [],
        variants: editingProduct.variants || [],
        specs: editingProduct.specs || {},
        description: editingProduct.description || '',
        imageSeed: editingProduct.imageSeed || Math.floor(Math.random() * 1000),
        images: editingProduct.images || [],
        tags: editingProduct.tags || [],
        stock: totalStock,
        express: editingProduct.express || false,
        reorderPoint: Number(editingProduct.reorderPoint) || 5,
        supplier: editingProduct.supplier || '',
        sku: editingProduct.sku || '',
        seo: editingProduct.seo || { metaTitle: '', metaDescription: '', keywords: [] },
        isHero: editingProduct.isHero || false,
        heroImage: editingProduct.heroImage || '',
        heroTitle: editingProduct.heroTitle || '',
        heroSubtitle: editingProduct.heroSubtitle || '',
        isFeatured: editingProduct.isFeatured || false,
        isTicker: editingProduct.isTicker || false
     };

     if (editingProduct.id) updateProduct(productData);
     else addProduct(productData);
     
     setShowModal(false);
     showToast('Product saved successfully', 'success');
  };

  const handleFetchSpecs = async (modelOverride?: string) => {
    const modelToFetch = modelOverride || editingProduct.name;
    if(!modelToFetch) {
       showToast('Enter a model name first', 'error');
       return;
    }
    setAiLoading(true);
    showToast(`Fetching full specs for ${modelToFetch}...`, 'info');
    
    const data = await fetchPhoneSpecs(modelToFetch);
    
    if(data) {
       setEditingProduct(prev => {
          const newColors = data.colors && data.colors.length > 0 ? data.colors : prev.colors || [];
          let newStorage = prev.storageOptions?.length ? prev.storageOptions : ['128GB', '256GB', '512GB'];
          
          if (data.specs && data.specs.Memory && typeof data.specs.Memory === 'object') {
             const internalMem = (data.specs.Memory as any)["Internal"];
             if (internalMem) {
                const extracted = internalMem.match(/(\d+(?:GB|TB))/g);
                if (extracted) {
                   newStorage = Array.from(new Set(extracted));
                }
             }
          }
          
          return {
            ...prev,
            brand: data.brand || prev.brand,
            price: data.price || prev.price,
            description: data.description || prev.description,
            specs: data.specs || prev.specs,
            colors: newColors,
            storageOptions: newStorage,
            seo: data.seo as any
          };
       });
       showToast('Full specs & Variants loaded! Check Variants tab.', 'success');
    } else {
       showToast('Could not fetch specs.', 'error');
    }
    setAiLoading(false);
  };

  const handleFetchImages = async () => {
      if(!editingProduct.name) {
          showToast('Please enter a product name first', 'error');
          return;
      }
      setAiLoading(true);
      showToast('Searching web for images...', 'info');
      const urls = await findProductImage(editingProduct.name);
      if (urls.length > 0) {
          setEditingProduct(prev => ({ ...prev, images: [...(prev.images || []), ...urls] }));
          showToast(`Found ${urls.length} images`, 'success');
      } else {
          showToast('No public images found. Try uploading or URL.', 'error');
      }
      setAiLoading(false);
  };

  const handleAddImageUrl = () => {
      if(imageUrlInput) {
          setEditingProduct(prev => ({ ...prev, images: [...(prev.images || []), imageUrlInput] }));
          setImageUrlInput('');
      }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
     if (e.target.files && e.target.files.length > 0) {
        // Fix: Explicitly case file to any or File to satisfy TS
        const newImages = Array.from(e.target.files).map((file: any) => URL.createObjectURL(file));
        setEditingProduct(prev => ({ ...prev, images: [...(prev.images || []), ...newImages] }));
     }
  };

  // --- Improved Variant Logic ---
  const addColor = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && colorInput.trim()) {
          e.preventDefault();
          if (!editingProduct.colors?.includes(colorInput.trim())) {
              setEditingProduct(prev => ({ ...prev, colors: [...(prev.colors || []), colorInput.trim()] }));
          }
          setColorInput('');
      }
  };

  const addStorage = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && storageInput.trim()) {
          e.preventDefault();
          if (!editingProduct.storageOptions?.includes(storageInput.trim())) {
              setEditingProduct(prev => ({ ...prev, storageOptions: [...(prev.storageOptions || []), storageInput.trim()] }));
          }
          setStorageInput('');
      }
  };

  const generateVariants = () => {
      const colors = editingProduct.colors?.length ? editingProduct.colors : ['Default'];
      const storages = editingProduct.storageOptions?.length ? editingProduct.storageOptions : ['Standard'];
      const basePrice = editingProduct.price || 0;
      const currentVariants = editingProduct.variants || [];

      const newVariants: ProductVariant[] = [];

      colors.forEach(color => {
          storages.forEach(storage => {
              const existing = currentVariants.find(v => v.color === color && v.storage === storage);

              if (existing) {
                 newVariants.push(existing);
              } else {
                 let priceMod = 0;
                 if (storage.includes('256')) priceMod = 20;
                 if (storage.includes('512')) priceMod = 50;
                 if (storage.includes('1TB')) priceMod = 100;

                 newVariants.push({
                    id: `var-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    color: color,
                    storage: storage,
                    price: basePrice + priceMod,
                    stock: 0,
                    sku: `${editingProduct.brand?.substring(0,3).toUpperCase()}-${editingProduct.name?.substring(0,3).toUpperCase().replace(/\s/g, '')}-${color.substring(0,3).toUpperCase()}-${storage}`
                 });
              }
          });
      });

      setEditingProduct(prev => ({ ...prev, variants: newVariants }));
      showToast(`Matrix updated. Total variants: ${newVariants.length}`, 'success');
  };

  const updateVariant = (id: string, field: keyof ProductVariant, value: any) => {
      setEditingProduct(prev => ({
          ...prev,
          variants: prev.variants?.map(v => v.id === id ? { ...v, [field]: value } : v)
      }));
  };

  // --- Smart Bulk Updates ---
  const applySmartBulkUpdate = () => {
      if (!bulkValue) return;
      const val = parseFloat(bulkValue);
      const stockVal = parseInt(bulkValue);

      setEditingProduct(prev => ({
          ...prev,
          variants: prev.variants?.map(v => {
             const matchColor = bulkColorScope === 'all' || v.color === bulkColorScope;
             const matchStorage = bulkStorageScope === 'all' || v.storage === bulkStorageScope;
             
             if (!matchColor || !matchStorage) return v;

             let newV = { ...v };
             switch(bulkAction) {
                case 'price_set': newV.price = val; break;
                case 'price_add': newV.price = v.price + val; break;
                case 'price_sub': newV.price = Math.max(0, v.price - val); break;
                case 'stock_set': newV.stock = stockVal; break;
                case 'stock_add': newV.stock = v.stock + stockVal; break;
             }
             return newV;
          })
      }));
      
      showToast('Bulk update applied successfully', 'success');
      setBulkValue('');
  };

  // AI SEO Generator
  const handleGenerateSEO = async () => {
      if(!editingProduct.name || !editingProduct.description) {
          showToast('Product name and description required for AI SEO', 'error');
          return;
      }
      setAiLoading(true);
      const result = await generateSEO(editingProduct.name, editingProduct.description);
      if(result) {
          setEditingProduct(prev => ({
              ...prev,
              seo: {
                  metaTitle: result.metaTitle,
                  metaDescription: result.metaDescription,
                  keywords: result.keywords
              }
          }));
          showToast('Sales-Optimized SEO Metadata Generated!', 'success');
      } else {
          showToast('Failed to generate SEO', 'error');
      }
      setAiLoading(false);
  };

  const renderSpecGroup = (groupName: string, groupData: any) => {
      return (
          <div key={groupName} className="mb-6 bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
              <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 font-bold text-gray-700 flex justify-between items-center text-sm">
                  <span>{groupName}</span>
                  <button type="button" onClick={() => {
                      const newSpecs = {...editingProduct.specs};
                      delete newSpecs[groupName];
                      setEditingProduct({...editingProduct, specs: newSpecs});
                  }} className="text-red-400 hover:text-red-600"><Trash2 size={14}/></button>
              </div>
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(groupData).map(([key, val]: any) => (
                      <div key={key} className="flex flex-col">
                          <label className="text-[10px] uppercase font-bold text-gray-400 mb-1 truncate" title={key}>{key}</label>
                          <input 
                              type="text" 
                              value={val} 
                              onChange={(e) => {
                                  const newGroup = {...groupData, [key]: e.target.value};
                                  setEditingProduct(prev => ({
                                      ...prev,
                                      specs: { ...prev.specs, [groupName]: newGroup }
                                  }));
                              }}
                              className="p-2 bg-white border border-gray-200 rounded-lg text-sm focus:border-primary outline-none"
                          />
                      </div>
                  ))}
                  <button type="button" className="flex items-center justify-center p-2 border border-dashed border-gray-300 rounded-lg text-gray-400 hover:text-primary hover:border-primary transition-colors text-xs font-bold" onClick={() => {
                       const newGroup = {...groupData, "New Feature": ""};
                       setEditingProduct(prev => ({ ...prev, specs: { ...prev.specs, [groupName]: newGroup } }));
                  }}>
                      <Plus size={14} className="mr-1"/> Add Field
                  </button>
              </div>
          </div>
      );
  };

  const TabButton = ({ tab, icon: Icon, label }: any) => (
    <button 
        type="button"
        onClick={() => setActiveTab(tab)} 
        className={`px-6 py-4 text-sm font-bold uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap border-b-2 ${activeTab === tab ? 'text-primary border-primary bg-blue-50/10' : 'text-gray-400 border-transparent hover:text-gray-600'}`}
    >
        <Icon size={16}/> {label}
    </button>
  );

  const handleNext = () => {
      const tabs: typeof activeTab[] = ['basic', 'variants', 'media', 'specs', 'seo', 'storefront'];
      const idx = tabs.indexOf(activeTab);
      if (idx < tabs.length - 1) setActiveTab(tabs[idx + 1]);
  };

  const handleBack = () => {
      const tabs: typeof activeTab[] = ['basic', 'variants', 'media', 'specs', 'seo', 'storefront'];
      const idx = tabs.indexOf(activeTab);
      if (idx > 0) setActiveTab(tabs[idx - 1]);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
       
       {/* Toolbar */}
       {!showModal && (
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

              {/* View Filters */}
              <div className="flex gap-2 items-center bg-gray-50 p-1 rounded-xl border border-gray-200">
                  <span className="text-xs font-bold text-gray-500 px-2">Show:</span>
                  <select 
                     value={viewFilter} 
                     onChange={(e) => setViewFilter(e.target.value as any)}
                     className="bg-transparent text-sm font-bold text-gray-700 outline-none cursor-pointer"
                  >
                     <option value="all">All Products</option>
                     <option value="hero">Hero Slider Only</option>
                     <option value="featured">Featured Rail</option>
                     <option value="ticker">Scrolling Ticker</option>
                  </select>
              </div>

              <div className="flex gap-3">
                 <button 
                    onClick={() => {
                        setEditingProduct({ name: '', brand: 'Apple', price: 0, category: 'Smartphones', stock: 0, description: '', specs: {}, images: [], seo: { metaTitle: '', metaDescription: '', keywords: [] }, colors: [], storageOptions: [], variants: [] });
                        setActiveTab('basic');
                        setShowModal(true);
                    }}
                    className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-slate-800 transition-colors flex items-center gap-2 shadow-lg shadow-primary/20"
                 >
                    <Plus size={18} /> Add Product
                 </button>
              </div>
           </div>
       )}

       {/* List View */}
       {!showModal && (
           <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full text-left">
                 <thead className="bg-gray-50/50 text-gray-400 text-[10px] uppercase font-bold tracking-wider">
                    <tr>
                       <th className="p-5">Product Details</th>
                       <th className="p-5">Display Settings</th>
                       <th className="p-5">Base Price</th>
                       <th className="p-5">Total Inventory</th>
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
                             <div className="flex gap-1 flex-wrap">
                                {product.isHero && <span className="text-[10px] font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded border border-purple-200">HERO</span>}
                                {product.isFeatured && <span className="text-[10px] font-bold bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded border border-yellow-200">FEATURED</span>}
                                {product.isTicker && <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded border border-blue-200">TICKER</span>}
                                {!product.isHero && !product.isFeatured && !product.isTicker && <span className="text-[10px] text-gray-400 italic">Standard</span>}
                             </div>
                          </td>
                          <td className="p-5">
                             <span className="font-bold text-slate-900 text-sm">{product.price} {appSettings.currency}</span>
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
       )}

       {/* Editor Modal */}
       {showModal && (
          <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
             <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl overflow-hidden flex flex-col h-[90vh]">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                   <div className="flex items-center gap-3">
                       <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-200 rounded-xl transition-colors">
                           <ArrowLeft size={20} className="text-gray-600"/>
                       </button>
                       <h3 className="font-bold text-xl text-gray-900 flex items-center gap-2">
                          {editingProduct.id ? 'Edit Product' : 'New Product'}
                       </h3>
                   </div>
                   <div className="flex gap-2">
                        <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50">Cancel</button>
                        <button type="submit" form="productForm" className="px-6 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-slate-800 shadow-md">Save Changes</button>
                   </div>
                </div>
                
                <div className="flex border-b border-gray-100 overflow-x-auto bg-white px-4">
                    <TabButton tab="basic" icon={FileText} label="Basic Info" />
                    <TabButton tab="variants" icon={Box} label="Variants & Stock" />
                    <TabButton tab="media" icon={ImageIcon} label="Media" />
                    <TabButton tab="specs" icon={Layers} label="Specifications" />
                    <TabButton tab="seo" icon={Globe} label="SEO" />
                    <TabButton tab="storefront" icon={LayoutTemplate} label="Storefront" />
                </div>

                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-gray-50/50">
                   <form id="productForm" onSubmit={handleSave}>
                      
                      {/* --- BASIC INFO TAB --- */}
                      {activeTab === 'basic' && (
                         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-6">
                                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                    <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><FileText size={18}/> Product Identity</h4>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="col-span-2 relative group" ref={autocompleteRef}>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Product Model Name</label>
                                            <input 
                                                type="text" 
                                                name="productName"
                                                required 
                                                value={editingProduct.name} 
                                                onChange={e => { 
                                                    setEditingProduct({...editingProduct, name: e.target.value}); 
                                                }}
                                                onFocus={() => {
                                                    if(editingProduct.name && editingProduct.name.length > 2) setShowSuggestions(true);
                                                }}
                                                className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:border-primary outline-none transition-all font-medium text-lg" 
                                                placeholder="e.g. iPhone 15 Pro Max"
                                                autoComplete="off"
                                            />
                                            {suggestionLoading && <div className="absolute right-3 top-9"><RefreshCw size={16} className="animate-spin text-gray-400"/></div>}
                                            
                                            {showSuggestions && suggestions.length > 0 && (
                                                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden max-h-60 overflow-y-auto custom-scrollbar">
                                                    {suggestions.map((item, i) => (
                                                        <div 
                                                            key={i} 
                                                            onClick={() => handleModelSelect(item)} 
                                                            className="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-0 transition-colors"
                                                        >
                                                            <div className="font-bold text-gray-900">{item.model}</div>
                                                            <div className="text-xs text-gray-500 flex gap-2">
                                                                <span>{item.brand}</span>
                                                                <span>•</span>
                                                                <span>{item.year}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Brand</label>
                                            <select value={editingProduct.brand} onChange={e => setEditingProduct({...editingProduct, brand: e.target.value})} className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:border-primary outline-none">
                                                {['Apple', 'Samsung', 'Google', 'Sony', 'OnePlus', 'Xiaomi', 'Huawei', 'Honor', 'Nebula', 'Nothing'].map(b => <option key={b} value={b}>{b}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Category</label>
                                            <select value={editingProduct.category} onChange={e => setEditingProduct({...editingProduct, category: e.target.value as any})} className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:border-primary outline-none">
                                                {['Smartphones', 'Tablets', 'Wearables', 'Audio', 'Accessories'].map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label>
                                            <textarea value={editingProduct.description} onChange={e => setEditingProduct({...editingProduct, description: e.target.value})} className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:border-primary outline-none h-32 resize-none" placeholder="Enter product description..."></textarea>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                    <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><DollarSign size={18}/> Base Pricing</h4>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Base Selling Price (KWD)</label>
                                            <input type="number" required value={editingProduct.price} onChange={e => setEditingProduct({...editingProduct, price: parseFloat(e.target.value)})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary outline-none font-bold text-lg" />
                                            <p className="text-[10px] text-gray-400 mt-1">This price applies if no variant specific price is set.</p>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Original Price (optional)</label>
                                            <input type="number" value={editingProduct.originalPrice || ''} onChange={e => setEditingProduct({...editingProduct, originalPrice: parseFloat(e.target.value)})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary outline-none text-gray-500" placeholder="0.00" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Reorder Point</label>
                                            <input type="number" value={editingProduct.reorderPoint || 5} onChange={e => setEditingProduct({...editingProduct, reorderPoint: parseFloat(e.target.value)})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary outline-none" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Enhanced Stock & Price Snapshot */}
                            <div className="col-span-1 lg:col-span-3 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                <div className="flex justify-between items-center mb-4">
                                   <h4 className="font-bold text-gray-900 flex items-center gap-2"><Box size={18}/> Stock & Price Snapshot</h4>
                                   <div className="text-xs font-bold text-gray-500 bg-gray-50 px-3 py-1 rounded-lg border border-gray-200">
                                      Total Variants: {editingProduct.variants?.length || 0}
                                   </div>
                                </div>
                                
                                {editingProduct.variants && editingProduct.variants.length > 0 ? (
                                   <div className="overflow-x-auto border border-gray-200 rounded-xl">
                                      <table className="w-full text-sm text-left">
                                         <thead className="bg-gray-50 text-xs text-gray-500 uppercase font-bold tracking-wider">
                                            <tr>
                                               <th className="p-3">Color</th>
                                               <th className="p-3">Storage</th>
                                               <th className="p-3">Price</th>
                                               <th className="p-3 text-right">Stock</th>
                                            </tr>
                                         </thead>
                                         <tbody className="divide-y divide-gray-100">
                                            {editingProduct.variants.map((v, i) => (
                                               <tr key={i} className="hover:bg-gray-50 transition-colors">
                                                  <td className="p-3 font-medium text-gray-900 flex items-center gap-2">
                                                     <div className="w-3 h-3 rounded-full border border-gray-200 shadow-sm" style={{backgroundColor: v.color}}></div>
                                                     {v.color}
                                                  </td>
                                                  <td className="p-3 text-gray-600 font-bold">{v.storage}</td>
                                                  <td className="p-3 font-medium">{v.price} KWD</td>
                                                  <td className="p-3 text-right">
                                                     <span className={`px-2 py-0.5 rounded text-xs font-bold ${v.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                        {v.stock}
                                                     </span>
                                                  </td>
                                               </tr>
                                            ))}
                                         </tbody>
                                      </table>
                                   </div>
                                ) : (
                                   <div className="text-center py-8 text-gray-400 text-sm bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                      No variants generated yet. Go to "Variants & Stock" tab to create them.
                                   </div>
                                )}
                            </div>
                         </div>
                      )}

                      {/* --- VARIANTS & STOCK TAB --- */}
                      {activeTab === 'variants' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                    <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Palette size={18}/> Define Attributes</h4>
                                    
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Colors (Press Enter)</label>
                                            <div className="flex flex-wrap gap-2 mb-2">
                                                {editingProduct.colors?.map(color => (
                                                    <span key={color} className="px-3 py-1 bg-gray-100 rounded-lg text-sm font-bold flex items-center gap-2">
                                                        <span className="w-3 h-3 rounded-full border border-gray-300" style={{backgroundColor: color}}></span>
                                                        {color} 
                                                        <X size={14} className="cursor-pointer text-gray-400 hover:text-red-500" onClick={() => setEditingProduct(prev => ({...prev, colors: prev.colors?.filter(c => c !== color)}))}/>
                                                    </span>
                                                ))}
                                            </div>
                                            <input 
                                                type="text" 
                                                value={colorInput}
                                                onChange={e => setColorInput(e.target.value)}
                                                onKeyDown={addColor}
                                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary outline-none"
                                                placeholder="e.g. #000000 or Black"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Storage Options (Press Enter)</label>
                                            <div className="flex flex-wrap gap-2 mb-2">
                                                {editingProduct.storageOptions?.map(opt => (
                                                    <span key={opt} className="px-3 py-1 bg-gray-100 rounded-lg text-sm font-bold flex items-center gap-2">
                                                        {opt}
                                                        <X size={14} className="cursor-pointer text-gray-400 hover:text-red-500" onClick={() => setEditingProduct(prev => ({...prev, storageOptions: prev.storageOptions?.filter(o => o !== opt)}))}/>
                                                    </span>
                                                ))}
                                            </div>
                                            <input 
                                                type="text" 
                                                value={storageInput}
                                                onChange={e => setStorageInput(e.target.value)}
                                                onKeyDown={addStorage}
                                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary outline-none"
                                                placeholder="e.g. 256GB"
                                            />
                                        </div>
                                        
                                        <button 
                                            type="button"
                                            onClick={generateVariants}
                                            className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-black transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Wand2 size={16} /> Generate Variant Matrix
                                        </button>
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                    <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Calculator size={18}/> Smart Bulk Updates</h4>
                                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-4 text-xs text-blue-800 leading-relaxed">
                                        Use this to quickly set prices or stock for specific groups (e.g. "Set all 512GB models to 400 KWD").
                                    </div>
                                    
                                    <div className="space-y-4">
                                        <div className="flex gap-2">
                                            <select value={bulkColorScope} onChange={e => setBulkColorScope(e.target.value)} className="flex-1 p-2 bg-white border border-gray-200 rounded-lg text-sm">
                                                <option value="all">All Colors</option>
                                                {editingProduct.colors?.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                            <select value={bulkStorageScope} onChange={e => setBulkStorageScope(e.target.value)} className="flex-1 p-2 bg-white border border-gray-200 rounded-lg text-sm">
                                                <option value="all">All Storage</option>
                                                {editingProduct.storageOptions?.map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        </div>
                                        
                                        <div className="flex gap-2">
                                            <select value={bulkAction} onChange={e => setBulkAction(e.target.value)} className="flex-1 p-2 bg-white border border-gray-200 rounded-lg text-sm font-bold">
                                                <option value="price_set">Set Price To</option>
                                                <option value="price_add">Increase Price By</option>
                                                <option value="price_sub">Decrease Price By</option>
                                                <option value="stock_set">Set Stock To</option>
                                                <option value="stock_add">Add to Stock</option>
                                            </select>
                                            <input 
                                                type="number" 
                                                value={bulkValue} 
                                                onChange={e => setBulkValue(e.target.value)} 
                                                placeholder="Value" 
                                                className="w-24 p-2 bg-white border border-gray-200 rounded-lg text-sm"
                                            />
                                            <button 
                                                type="button" 
                                                onClick={applySmartBulkUpdate}
                                                className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700"
                                            >
                                                Apply
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Matrix Table */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                                    <h4 className="font-bold text-gray-900">Variant Matrix</h4>
                                    <div className="flex gap-2">
                                        <select value={matrixFilterColor} onChange={e => setMatrixFilterColor(e.target.value)} className="text-xs p-1.5 border border-gray-200 rounded-lg bg-white">
                                            <option value="all">Filter Color</option>
                                            {editingProduct.colors?.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                        <select value={matrixFilterStorage} onChange={e => setMatrixFilterStorage(e.target.value)} className="text-xs p-1.5 border border-gray-200 rounded-lg bg-white">
                                            <option value="all">Filter Storage</option>
                                            {editingProduct.storageOptions?.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                </div>
                                
                                <div className="max-h-96 overflow-y-auto custom-scrollbar">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-white text-xs text-gray-500 uppercase font-bold sticky top-0 z-10 shadow-sm">
                                            <tr>
                                                <th className="p-4 bg-gray-50">Variant</th>
                                                <th className="p-4 bg-gray-50">SKU</th>
                                                <th className="p-4 bg-gray-50 w-32">Price (KWD)</th>
                                                <th className="p-4 bg-gray-50 w-32">Stock</th>
                                                <th className="p-4 bg-gray-50 w-10"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {editingProduct.variants?.filter(v => 
                                                (matrixFilterColor === 'all' || v.color === matrixFilterColor) && 
                                                (matrixFilterStorage === 'all' || v.storage === matrixFilterStorage)
                                            ).map((variant) => (
                                                <tr key={variant.id} className="hover:bg-blue-50/30 transition-colors">
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-lg border border-gray-200 shadow-sm" style={{backgroundColor: variant.color}}></div>
                                                            <div>
                                                                <p className="font-bold text-gray-900">{variant.color}</p>
                                                                <p className="text-xs text-gray-500">{variant.storage}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <input 
                                                            type="text" 
                                                            value={variant.sku}
                                                            onChange={(e) => updateVariant(variant.id, 'sku', e.target.value)}
                                                            className="w-full bg-transparent border-b border-transparent hover:border-gray-300 focus:border-primary outline-none text-xs font-mono text-gray-600 transition-colors"
                                                        />
                                                    </td>
                                                    <td className="p-4">
                                                        <input 
                                                            type="number" 
                                                            value={variant.price}
                                                            onChange={(e) => updateVariant(variant.id, 'price', parseFloat(e.target.value))}
                                                            className="w-full p-2 bg-white border border-gray-200 rounded-lg focus:border-primary outline-none font-bold"
                                                        />
                                                    </td>
                                                    <td className="p-4">
                                                        <input 
                                                            type="number" 
                                                            value={variant.stock}
                                                            onChange={(e) => updateVariant(variant.id, 'stock', parseFloat(e.target.value))}
                                                            className={`w-full p-2 border rounded-lg focus:border-primary outline-none font-bold ${variant.stock > 0 ? 'bg-white border-gray-200' : 'bg-red-50 border-red-200 text-red-600'}`}
                                                        />
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <button 
                                                            type="button"
                                                            onClick={() => setEditingProduct(prev => ({...prev, variants: prev.variants?.filter(v => v.id !== variant.id)}))}
                                                            className="text-gray-400 hover:text-red-500 transition-colors"
                                                        >
                                                            <X size={16}/>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                      )}

                      {/* --- MEDIA TAB --- */}
                      {activeTab === 'media' && (
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><ImageIcon size={18}/> Product Images</h4>
                                
                                <div className="flex gap-4 mb-4 border-b border-gray-100">
                                    <button type="button" onClick={() => setImageTab('fetch')} className={`pb-2 px-2 text-sm font-bold border-b-2 transition-colors ${imageTab === 'fetch' ? 'border-primary text-primary' : 'border-transparent text-gray-500'}`}>AI Search</button>
                                    <button type="button" onClick={() => setImageTab('upload')} className={`pb-2 px-2 text-sm font-bold border-b-2 transition-colors ${imageTab === 'upload' ? 'border-primary text-primary' : 'border-transparent text-gray-500'}`}>Upload</button>
                                    <button type="button" onClick={() => setImageTab('url')} className={`pb-2 px-2 text-sm font-bold border-b-2 transition-colors ${imageTab === 'url' ? 'border-primary text-primary' : 'border-transparent text-gray-500'}`}>Direct URL</button>
                                </div>

                                {imageTab === 'fetch' && (
                                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-center justify-between">
                                        <div className="text-sm text-blue-800">
                                            <strong>AI Image Search:</strong> We'll find official marketing images for <em>{editingProduct.name || 'this product'}</em>.
                                        </div>
                                        <button 
                                            type="button" 
                                            onClick={handleFetchImages} 
                                            disabled={aiLoading}
                                            className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                        >
                                            {aiLoading ? 'Searching...' : 'Find Images'}
                                        </button>
                                    </div>
                                )}

                                {imageTab === 'upload' && (
                                    <div 
                                        className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <Upload size={32} className="mx-auto text-gray-400 mb-2"/>
                                        <p className="text-sm font-bold text-gray-600">Click to Upload Images</p>
                                        <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP up to 5MB</p>
                                        <input 
                                            type="file" 
                                            ref={fileInputRef} 
                                            className="hidden" 
                                            multiple 
                                            accept="image/*"
                                            onChange={handleImageSelect} 
                                        />
                                    </div>
                                )}

                                {imageTab === 'url' && (
                                    <div className="flex gap-2">
                                        <input 
                                            type="text" 
                                            value={imageUrlInput}
                                            onChange={e => setImageUrlInput(e.target.value)}
                                            placeholder="https://example.com/image.jpg"
                                            className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary outline-none"
                                        />
                                        <button 
                                            type="button" 
                                            onClick={handleAddImageUrl}
                                            className="px-6 bg-gray-900 text-white font-bold rounded-xl hover:bg-black"
                                        >
                                            Add
                                        </button>
                                    </div>
                                )}

                                <div className="grid grid-cols-4 sm:grid-cols-6 gap-4 mt-6">
                                    {editingProduct.images?.map((img, idx) => (
                                        <div key={idx} className="relative group aspect-square rounded-xl border border-gray-200 overflow-hidden bg-gray-50">
                                            <img src={img} className="w-full h-full object-contain" alt="Product" />
                                            <button 
                                                type="button"
                                                onClick={() => setEditingProduct(prev => ({...prev, images: prev.images?.filter((_, i) => i !== idx)}))}
                                                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X size={12}/>
                                            </button>
                                            {idx === 0 && <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] font-bold px-1.5 rounded">Main</span>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                      )}

                      {/* --- SPECS TAB --- */}
                      {activeTab === 'specs' && (
                          <div className="space-y-6">
                              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                  <div className="flex justify-between items-center mb-6">
                                      <h4 className="font-bold text-gray-900 flex items-center gap-2"><Layers size={18}/> Technical Specifications</h4>
                                      <button 
                                          type="button" 
                                          onClick={() => handleFetchSpecs()}
                                          disabled={aiLoading}
                                          className="px-4 py-2 bg-purple-100 text-purple-700 font-bold rounded-lg hover:bg-purple-200 text-sm flex items-center gap-2"
                                      >
                                          {aiLoading ? <RefreshCw className="animate-spin" size={16}/> : <BrainCircuit size={16}/>}
                                          Auto-Fill with AI
                                      </button>
                                  </div>

                                  {editingProduct.specs && Object.keys(editingProduct.specs).length > 0 ? (
                                      Object.entries(editingProduct.specs).map(([group, data]) => renderSpecGroup(group, data))
                                  ) : (
                                      <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                          <p className="text-gray-500 text-sm mb-4">No specifications defined yet.</p>
                                          <button 
                                              type="button" 
                                              onClick={() => setEditingProduct(prev => ({...prev, specs: { "General": { "Model": "" } }}))}
                                              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-100 text-sm"
                                          >
                                              Add Manually
                                          </button>
                                      </div>
                                  )}
                                  
                                  {editingProduct.specs && Object.keys(editingProduct.specs).length > 0 && (
                                     <button 
                                          type="button" 
                                          onClick={() => {
                                              const name = prompt("Enter new group name (e.g. 'Display', 'Camera')");
                                              if(name) {
                                                  setEditingProduct(prev => ({...prev, specs: { ...prev.specs, [name]: { "Feature": "" } }}));
                                              }
                                          }}
                                          className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 font-bold hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
                                     >
                                          <Plus size={18}/> Add New Spec Group
                                     </button>
                                  )}
                              </div>
                          </div>
                      )}

                      {/* --- SEO TAB --- */}
                      {activeTab === 'seo' && (
                          <div className="space-y-6">
                              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                  <div className="flex justify-between items-center mb-6">
                                      <h4 className="font-bold text-gray-900 flex items-center gap-2"><Globe size={18}/> Search Engine Optimization</h4>
                                      <button 
                                          type="button" 
                                          onClick={handleGenerateSEO}
                                          disabled={aiLoading}
                                          className="px-4 py-2 bg-green-100 text-green-700 font-bold rounded-lg hover:bg-green-200 text-sm flex items-center gap-2"
                                      >
                                          <Wand2 size={16}/> Generate with AI
                                      </button>
                                  </div>

                                  <div className="space-y-6">
                                      <div>
                                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Meta Title</label>
                                          <div className="relative">
                                              <input 
                                                  type="text" 
                                                  value={editingProduct.seo?.metaTitle || ''}
                                                  onChange={e => setEditingProduct({...editingProduct, seo: {...editingProduct.seo, metaTitle: e.target.value}})}
                                                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary outline-none pr-12"
                                                  placeholder="Product Name | LAKKI PHONES"
                                                  maxLength={60}
                                              />
                                              <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold ${(editingProduct.seo?.metaTitle?.length || 0) > 60 ? 'text-red-500' : 'text-green-500'}`}>
                                                  {editingProduct.seo?.metaTitle?.length || 0}/60
                                              </span>
                                          </div>
                                      </div>
                                      
                                      <div>
                                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Meta Description</label>
                                          <div className="relative">
                                              <textarea 
                                                  value={editingProduct.seo?.metaDescription || ''}
                                                  onChange={e => setEditingProduct({...editingProduct, seo: {...editingProduct.seo, metaDescription: e.target.value}})}
                                                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary outline-none h-24 resize-none"
                                                  placeholder="Buy [Product Name] in Kuwait..."
                                                  maxLength={160}
                                              />
                                              <span className={`absolute right-3 bottom-3 text-xs font-bold ${(editingProduct.seo?.metaDescription?.length || 0) > 160 ? 'text-red-500' : 'text-green-500'}`}>
                                                  {editingProduct.seo?.metaDescription?.length || 0}/160
                                              </span>
                                          </div>
                                      </div>

                                      <div>
                                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Keywords</label>
                                          <input 
                                              type="text" 
                                              value={editingProduct.seo?.keywords?.join(', ') || ''}
                                              onChange={e => setEditingProduct({...editingProduct, seo: {...editingProduct.seo, keywords: e.target.value.split(',').map(s => s.trim())}})}
                                              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary outline-none"
                                              placeholder="mobile, kuwait, samsung, 5g"
                                          />
                                          <p className="text-[10px] text-gray-400 mt-1">Comma separated</p>
                                      </div>

                                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mt-4">
                                          <h5 className="text-xs font-bold text-gray-500 uppercase mb-3">Preview on Google</h5>
                                          <div className="font-sans">
                                              <div className="text-[#1a0dab] text-lg font-medium hover:underline cursor-pointer truncate">
                                                  {editingProduct.seo?.metaTitle || editingProduct.name || 'Product Title'}
                                              </div>
                                              <div className="text-[#006621] text-sm truncate">
                                                  https://lakkiphones.com/product/{editingProduct.id || '123'}
                                              </div>
                                              <div className="text-[#545454] text-sm line-clamp-2">
                                                  {editingProduct.seo?.metaDescription || editingProduct.description || 'Product description will appear here...'}
                                              </div>
                                          </div>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      )}

                      {/* --- STOREFRONT TAB --- */}
                      {activeTab === 'storefront' && (
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                <h4 className="font-bold text-gray-900 mb-6 flex items-center gap-2"><LayoutTemplate size={18}/> Homepage Visibility</h4>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* Hero Toggle */}
                                    <label className="flex items-start gap-4 p-5 border border-purple-100 bg-purple-50/30 rounded-2xl cursor-pointer hover:bg-purple-50 transition-colors">
                                        <div className="mt-1">
                                            <input 
                                                type="checkbox" 
                                                checked={editingProduct.isHero || false}
                                                onChange={e => setEditingProduct({...editingProduct, isHero: e.target.checked})}
                                                className="w-5 h-5 accent-purple-600"
                                            />
                                        </div>
                                        <div>
                                            <span className="block font-bold text-gray-900 mb-1">Hero Slider</span>
                                            <span className="text-xs text-gray-500 leading-relaxed">Display prominently at the very top of the homepage as a large slide.</span>
                                        </div>
                                    </label>

                                    {/* Featured Toggle */}
                                    <label className="flex items-start gap-4 p-5 border border-yellow-100 bg-yellow-50/30 rounded-2xl cursor-pointer hover:bg-yellow-50 transition-colors">
                                        <div className="mt-1">
                                            <input 
                                                type="checkbox" 
                                                checked={editingProduct.isFeatured || false}
                                                onChange={e => setEditingProduct({...editingProduct, isFeatured: e.target.checked})}
                                                className="w-5 h-5 accent-yellow-500"
                                            />
                                        </div>
                                        <div>
                                            <span className="block font-bold text-gray-900 mb-1">Featured Rail</span>
                                            <span className="text-xs text-gray-500 leading-relaxed">Show in the "Featured Collection" horizontal scroll section.</span>
                                        </div>
                                    </label>

                                    {/* Ticker Toggle */}
                                    <label className="flex items-start gap-4 p-5 border border-blue-100 bg-blue-50/30 rounded-2xl cursor-pointer hover:bg-blue-50 transition-colors">
                                        <div className="mt-1">
                                            <input 
                                                type="checkbox" 
                                                checked={editingProduct.isTicker || false}
                                                onChange={e => setEditingProduct({...editingProduct, isTicker: e.target.checked})}
                                                className="w-5 h-5 accent-blue-600"
                                            />
                                        </div>
                                        <div>
                                            <span className="block font-bold text-gray-900 mb-1">Scrolling Ticker</span>
                                            <span className="text-xs text-gray-500 leading-relaxed">Include in the auto-scrolling marquee animation strip.</span>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            {editingProduct.isHero && (
                                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4 animate-in fade-in slide-in-from-top-2">
                                    <h4 className="font-bold text-gray-900 mb-2">Hero Slider Customization</h4>
                                    
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Custom Title</label>
                                        <input 
                                            type="text" 
                                            value={editingProduct.heroTitle || editingProduct.name}
                                            onChange={e => setEditingProduct({...editingProduct, heroTitle: e.target.value})}
                                            className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:border-primary outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Custom Subtitle</label>
                                        <input 
                                            type="text" 
                                            value={editingProduct.heroSubtitle || ''}
                                            onChange={e => setEditingProduct({...editingProduct, heroSubtitle: e.target.value})}
                                            placeholder="e.g. New Arrival • Limited Offer"
                                            className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:border-primary outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Custom Banner Image URL (Wide)</label>
                                        <input 
                                            type="text" 
                                            value={editingProduct.heroImage || ''}
                                            onChange={e => setEditingProduct({...editingProduct, heroImage: e.target.value})}
                                            placeholder="https://..."
                                            className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:border-primary outline-none"
                                        />
                                        <p className="text-[10px] text-gray-400 mt-1">Leave empty to use default product image.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                      )}

                   </form>
                </div>

                {/* Bottom Navigation */}
                <div className="p-4 border-t border-gray-100 bg-white flex justify-between z-10">
                    <button 
                        type="button" 
                        onClick={handleBack}
                        disabled={activeTab === 'basic'}
                        className="px-6 py-3 bg-gray-100 rounded-xl text-gray-600 font-bold hover:bg-gray-200 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft size={18}/> Back
                    </button>
                    {activeTab === 'storefront' ? (
                        <button type="submit" form="productForm" className="px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-primary/20 flex items-center gap-2">
                            <CheckCircle size={18}/> Save Product
                        </button>
                    ) : (
                        <button 
                            type="button" 
                            onClick={handleNext}
                            className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-black transition-colors flex items-center gap-2"
                        >
                            Next Step <ChevronRight size={18}/>
                        </button>
                    )}
                </div>
             </div>
          </div>
       )}
    </div>
  );
};