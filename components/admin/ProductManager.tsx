
import React, { useState, useRef, useEffect } from 'react';
import { useShop } from '../../context/ShopContext';
import { Product, ProductVariant } from '../../types';
import { 
   Edit, Trash2, Plus, Search, X, 
   FileText, DollarSign, ImageIcon, Layers, Globe, 
   Upload, RefreshCw, Box, CheckCircle, 
   Palette, ArrowLeft, ChevronRight, Wand2, ChevronLeft, Calculator, Tag, BrainCircuit, Filter, LayoutTemplate, Star, Check, FileSpreadsheet, Loader2, QrCode, Printer, ScanLine, Sparkles, Copy, Settings, ChevronDown, ChevronUp, Fingerprint, Barcode
} from 'lucide-react';
import { fetchPhoneSpecs, findProductImage, searchMobileModels, generateSEO } from '../../services/geminiService';
import Papa from 'papaparse';

export const ProductManager: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct, bulkUpsertProducts, uploadImage, appSettings, showToast, isOffline } = useShop();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'variants' | 'media' | 'specs' | 'seo' | 'storefront'>('basic');
  const [viewFilter, setViewFilter] = useState<'all' | 'hero' | 'featured' | 'ticker'>('all');
  
  const [editingProduct, setEditingProduct] = useState<Partial<Product>>({
     name: '', brand: 'Apple', price: 0, category: 'Smartphones', stock: 0, description: '', specs: {}, images: [], seo: { metaTitle: '', metaDescription: '', keywords: [] }, colors: [], storageOptions: [], variants: [], isHero: false, isFeatured: false, isTicker: false, barcode: '', imeiTracking: false
  });
  
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);
  const [expandedVariantId, setExpandedVariantId] = useState<string | null>(null);

  const [aiLoading, setAiLoading] = useState(false);
  const [imageTab, setImageTab] = useState<'fetch' | 'url' | 'upload'>('fetch');
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [imageSearchQuery, setImageSearchQuery] = useState('');
  const [foundImages, setFoundImages] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  // CSV Import State
  const [showCSVModal, setShowCSVModal] = useState(false);
  const csvInputRef = useRef<HTMLInputElement>(null);
  
  // Label Print State
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printConfig, setPrintConfig] = useState({
      labelSize: 'standard', // standard (38x25), large (50x30), a4
      showPrice: true,
      showBarcode: true,
      showName: true,
      quantity: 1
  });
  
  // Autocomplete State
  const [suggestions, setSuggestions] = useState<Array<{model: string, brand: string, variants: string[], year: string}>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionLoading, setSuggestionLoading] = useState(false);
  
  const autocompleteRef = useRef<HTMLDivElement>(null);

  // Variant Inputs
  const [colorInput, setColorInput] = useState('');
  const [storageInput, setStorageInput] = useState('');
  const [imeiInput, setImeiInput] = useState(''); // For entering IMEIs in variant view

  // Bulk Updates State
  const [bulkColorScope, setBulkColorScope] = useState<string>('all');
  const [bulkStorageScope, setBulkStorageScope] = useState<string>('all');
  const [bulkAction, setBulkAction] = useState<string>('price_set'); 
  const [bulkValue, setBulkValue] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredProducts = products.filter(p => {
     const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           p.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (p.barcode && p.barcode.includes(searchTerm));
     
     if (viewFilter === 'hero') return matchesSearch && p.isHero;
     if (viewFilter === 'featured') return matchesSearch && p.isFeatured;
     if (viewFilter === 'ticker') return matchesSearch && p.isTicker;
     
     return matchesSearch;
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (autocompleteRef.current && !autocompleteRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
      if (editingProduct.name && !imageSearchQuery) setImageSearchQuery(editingProduct.name);
  }, [editingProduct.name]);

  useEffect(() => {
      const delayDebounceFn = setTimeout(async () => {
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
  };

  const handleAutoFillBasicInfo = async () => {
      if (!editingProduct.name) {
          showToast('Please enter a model name first', 'error');
          return;
      }
      setAiLoading(true);
      showToast('Fetching product details...', 'info');
      
      const data = await fetchPhoneSpecs(editingProduct.name);
      
      if (data) {
          setEditingProduct(prev => ({
              ...prev,
              brand: data.brand || prev.brand,
              description: data.description || prev.description,
              category: data.category as any || prev.category,
              price: data.price || prev.price,
              colors: data.colors || prev.colors,
              storageOptions: data.storageOptions || prev.storageOptions,
              specs: data.specs || prev.specs,
              seo: data.seo || prev.seo
          }));
          showToast('Product details auto-filled!', 'success');
      } else {
          showToast('Could not fetch details. Try a more specific model name.', 'error');
      }
      setAiLoading(false);
  };

  const handleSave = (e: React.FormEvent) => {
     e.preventDefault();
     const totalStock = (editingProduct.variants && editingProduct.variants.length > 0)
        ? editingProduct.variants.reduce((acc, v) => acc + (v.stock || 0), 0)
        : Number(editingProduct.stock || 0);

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
        barcode: editingProduct.barcode || '',
        imeiTracking: editingProduct.imeiTracking || false,
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

  const generateBarcode = () => {
      const prefix = "890"; // LAKKI Prefix
      const timestamp = Date.now().toString().slice(-9);
      const code = prefix + timestamp;
      setEditingProduct(prev => ({ ...prev, barcode: code }));
  };

  const executePrintLabel = () => {
      const pName = editingProduct.name || "Product";
      const pPrice = editingProduct.price || 0;
      const pBarcode = editingProduct.barcode || editingProduct.sku || "000000";
      
      const popup = window.open('', '_blank', 'width=400,height=600');
      if (!popup) { showToast('Popup blocked', 'error'); return; }
      
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(window.location.origin + '/#/product/' + editingProduct.id)}`;
      const barcodeUrl = `https://bwipjs-api.metafloor.com/?bcid=code128&text=${pBarcode}&scale=2&height=10&includetext`;

      let cssSize = '';
      if (printConfig.labelSize === 'standard') cssSize = 'width: 38mm; height: 25mm;';
      else if (printConfig.labelSize === 'large') cssSize = 'width: 50mm; height: 30mm;';
      else cssSize = 'width: 60mm; height: 40mm;';

      const labelContent = `
        <div class="label" style="${cssSize}">
           <div class="info">
              ${printConfig.showName ? `<h1>${pName}</h1>` : ''}
              <p style="font-size: 8px; margin: 0;">LAKKI PHONES</p>
              ${printConfig.showPrice ? `<h2>${pPrice} KWD</h2>` : ''}
              ${printConfig.showBarcode ? `<div class="barcode-container"><img src="${barcodeUrl}" class="barcode-img" alt="Barcode"/></div>` : ''}
           </div>
           <img src="${qrUrl}" class="qr" alt="QR"/>
        </div>
      `;

      let fullHtml = '';
      for (let i = 0; i < printConfig.quantity; i++) {
          fullHtml += labelContent;
      }

      popup.document.write(`
        <html>
          <head>
            <title>Print Label - ${pName}</title>
            <style>
              body { font-family: 'Arial', sans-serif; text-align: center; margin: 0; padding: 0; }
              .label { border: 1px dashed #eee; display: flex; flex-direction: row; align-items: center; justify-content: space-between; padding: 5px; box-sizing: border-box; margin: 2px; page-break-inside: avoid; float: left; overflow: hidden; }
              .info { text-align: left; flex: 1; overflow: hidden; }
              h1 { font-size: 10px; margin: 0 0 2px; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100px; }
              h2 { font-size: 14px; font-weight: 900; margin: 0; }
              .qr { width: 40px; height: 40px; margin-left: 5px; }
              .barcode-container { margin-top: 2px; }
              .barcode-img { height: 20px; max-width: 100%; }
              @media print {
                  body { margin: 0; }
                  .label { border: none; margin: 0; }
              }
            </style>
          </head>
          <body onload="window.print()">
            ${fullHtml}
          </body>
        </html>
      `);
      popup.document.close();
      setShowPrintModal(false);
  };

  const handleFetchSpecs = async (modelOverride?: string) => {
      const model = modelOverride || editingProduct.name;
      if (!model) return;
      setAiLoading(true);
      const specs = await fetchPhoneSpecs(model);
      if (specs) {
          setEditingProduct(prev => ({
              ...prev,
              specs: specs.specs,
              description: specs.description || prev.description
          }));
          showToast('Specs auto-filled from AI', 'success');
      }
      setAiLoading(false);
  };

  const handleFetchImages = async (customQuery?: string) => {
      const query = customQuery || editingProduct.name;
      if (!query) return;
      setAiLoading(true);
      setFoundImages([]);
      const imgs = await findProductImage(query);
      setFoundImages(imgs);
      setAiLoading(false);
  };

  const toggleImageSelection = (url: string) => {
      setEditingProduct(prev => {
          const current = prev.images || [];
          if (current.includes(url)) {
              return { ...prev, images: current.filter(i => i !== url) };
          } else {
              return { ...prev, images: [...current, url] };
          }
      });
  };

  const handleAddImageUrl = () => {
      if (imageUrlInput) {
          setEditingProduct(prev => ({ ...prev, images: [...(prev.images || []), imageUrlInput] }));
          setImageUrlInput('');
      }
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          setUploadingImage(true);
          const url = await uploadImage(e.target.files[0]);
          if (url) {
              setEditingProduct(prev => ({ ...prev, images: [...(prev.images || []), url] }));
          }
          setUploadingImage(false);
      }
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          Papa.parse(e.target.files[0], {
              header: true,
              complete: (results) => {
                  const items: Product[] = results.data.map((row: any) => ({
                      id: row.id || `csv-${Date.now()}-${Math.random()}`,
                      name: row.name || 'Unknown',
                      brand: row.brand || 'Generic',
                      price: parseFloat(row.price) || 0,
                      category: row.category || 'Accessories',
                      stock: parseInt(row.stock) || 0,
                      specs: {},
                      images: row.image ? [row.image] : [],
                      tags: [],
                      colors: [],
                      description: row.description || ''
                  })).filter((p: Product) => p.name !== 'Unknown');
                  
                  bulkUpsertProducts(items);
                  setShowCSVModal(false);
              }
          });
      }
  };

  const addColor = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && colorInput) {
          e.preventDefault();
          setEditingProduct(prev => ({ ...prev, colors: [...(prev.colors || []), colorInput] }));
          setColorInput('');
      }
  };

  const addStorage = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && storageInput) {
          e.preventDefault();
          setEditingProduct(prev => ({ ...prev, storageOptions: [...(prev.storageOptions || []), storageInput] }));
          setStorageInput('');
      }
  };

  const generateVariants = () => {
      if (!editingProduct.colors?.length && !editingProduct.storageOptions?.length) return;
      
      const newVariants: ProductVariant[] = [];
      const colors = editingProduct.colors?.length ? editingProduct.colors : ['Standard'];
      const storages = editingProduct.storageOptions?.length ? editingProduct.storageOptions : ['Standard'];

      colors.forEach(color => {
          storages.forEach(storage => {
              const exists = editingProduct.variants?.find(v => v.color === color && v.storage === storage);
              if (!exists) {
                  newVariants.push({
                      id: `var-${Date.now()}-${Math.random()}`,
                      color,
                      storage,
                      price: editingProduct.price || 0,
                      stock: 0,
                      sku: `${editingProduct.name?.substring(0,3).toUpperCase()}-${color.substring(0,3).toUpperCase()}-${storage}`,
                      imeis: []
                  });
              } else {
                  newVariants.push(exists);
              }
          });
      });
      setEditingProduct(prev => ({ ...prev, variants: newVariants }));
  };

  const updateVariant = (id: string, field: keyof ProductVariant, value: any) => {
      setEditingProduct(prev => ({
          ...prev,
          variants: prev.variants?.map(v => v.id === id ? { ...v, [field]: value } : v)
      }));
  };

  const handleAddImeiToVariant = (variantId: string) => {
      if (!imeiInput.trim()) return;
      setEditingProduct(prev => ({
          ...prev,
          variants: prev.variants?.map(v => {
              if (v.id === variantId) {
                  const currentImeis = v.imeis || [];
                  if (currentImeis.includes(imeiInput.trim())) {
                      showToast('IMEI/Serial already exists in this variant', 'error');
                      return v;
                  }
                  const newImeis = [...currentImeis, imeiInput.trim()];
                  // If tracking is active, update stock count to match IMEI count
                  return { ...v, imeis: newImeis, stock: newImeis.length };
              }
              return v;
          })
      }));
      setImeiInput('');
      showToast('Identifier added', 'success');
  };

  const handleRemoveImeiFromVariant = (variantId: string, imei: string) => {
      setEditingProduct(prev => ({
          ...prev,
          variants: prev.variants?.map(v => {
              if (v.id === variantId) {
                  const newImeis = v.imeis?.filter(i => i !== imei) || [];
                  return { ...v, imeis: newImeis, stock: newImeis.length };
              }
              return v;
          })
      }));
  };

  const applySmartBulkUpdate = () => {
      if (!bulkValue) return;
      const val = parseFloat(bulkValue);
      if (isNaN(val)) return;

      setEditingProduct(prev => ({
          ...prev,
          variants: prev.variants?.map(v => {
              let match = true;
              if (bulkColorScope !== 'all' && v.color !== bulkColorScope) match = false;
              if (bulkStorageScope !== 'all' && v.storage !== bulkStorageScope) match = false;
              
              if (match) {
                  if (bulkAction === 'price_set') return { ...v, price: val };
                  if (bulkAction === 'price_inc') return { ...v, price: v.price + val };
                  if (bulkAction === 'price_dec') return { ...v, price: Math.max(0, v.price - val) };
                  
                  if (bulkAction === 'stock_set') return { ...v, stock: val };
                  if (bulkAction === 'stock_inc') return { ...v, stock: v.stock + val };
                  if (bulkAction === 'stock_dec') return { ...v, stock: Math.max(0, v.stock - val) };
              }
              return v;
          })
      }));
      showToast('Bulk update applied', 'success');
  };

  const handleGenerateSEO = async () => {
      if (!editingProduct.name) return;
      setAiLoading(true);
      const seo = await generateSEO(
          editingProduct.name, 
          editingProduct.description || '', 
          editingProduct.price,
          editingProduct.brand,
          editingProduct.specs,
          editingProduct.colors
      );
      if (seo) {
          setEditingProduct(prev => ({ ...prev, seo }));
          showToast('SEO Tags Generated', 'success');
      }
      setAiLoading(false);
  };

  const renderSpecGroup = (groupName: string, groupData: any) => {
      if (!groupData || typeof groupData !== 'object') return null;
      return (
          <div key={groupName} className="border border-gray-200 rounded-xl overflow-hidden mb-4 bg-white">
              <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex justify-between items-center">
                  <span className="font-bold text-gray-700 text-sm uppercase">{groupName}</span>
                  <button type="button" onClick={() => {
                      const newSpecs = { ...editingProduct.specs };
                      delete newSpecs[groupName];
                      setEditingProduct(prev => ({ ...prev, specs: newSpecs }));
                  }} className="text-red-500 hover:text-red-700"><Trash2 size={14}/></button>
              </div>
              <div className="p-4 space-y-2 bg-white">
                  {Object.entries(groupData).map(([key, val]) => (
                      <div key={key} className="flex gap-2 items-center">
                          <input 
                              className="w-1/3 text-xs font-bold text-gray-800 bg-white border border-gray-200 rounded p-2 focus:border-primary outline-none"
                              value={key}
                              onChange={(e) => {
                                  const newSpecs = { ...editingProduct.specs };
                                  const newGroup = { ...newSpecs[groupName] };
                                  const val = newGroup[key];
                                  delete newGroup[key];
                                  newGroup[e.target.value] = val;
                                  newSpecs[groupName] = newGroup;
                                  setEditingProduct(prev => ({ ...prev, specs: newSpecs }));
                              }}
                          />
                          <input 
                              className="flex-1 text-sm text-gray-900 border border-gray-200 rounded p-2 focus:border-primary outline-none bg-white"
                              value={val as string}
                              onChange={(e) => {
                                  const newSpecs = { ...editingProduct.specs };
                                  newSpecs[groupName] = { ...newSpecs[groupName], [key]: e.target.value };
                                  setEditingProduct(prev => ({ ...prev, specs: newSpecs }));
                              }}
                          />
                          <button type="button" onClick={() => {
                              const newSpecs = { ...editingProduct.specs };
                              const newGroup = { ...newSpecs[groupName] };
                              delete newGroup[key];
                              newSpecs[groupName] = newGroup;
                              setEditingProduct(prev => ({ ...prev, specs: newSpecs }));
                          }} className="text-gray-400 hover:text-red-500 p-2 hover:bg-red-50 rounded"><X size={16}/></button>
                      </div>
                  ))}
                  <button type="button" onClick={() => {
                      const newSpecs = { ...editingProduct.specs };
                      newSpecs[groupName] = { ...newSpecs[groupName], "New Feature": "" };
                      setEditingProduct(prev => ({ ...prev, specs: newSpecs }));
                  }} className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1 mt-2">+ Add Field</button>
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
      const currentIdx = tabs.indexOf(activeTab);
      if (currentIdx < tabs.length - 1) setActiveTab(tabs[currentIdx + 1]);
  };

  const handleBack = () => {
      const tabs: typeof activeTab[] = ['basic', 'variants', 'media', 'specs', 'seo', 'storefront'];
      const currentIdx = tabs.indexOf(activeTab);
      if (currentIdx > 0) setActiveTab(tabs[currentIdx - 1]);
  };

  const toggleExpand = (id: string) => {
      setExpandedProductId(prev => prev === id ? null : id);
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
                   placeholder="Search products by name, brand, barcode..." 
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-primary outline-none"
                 />
              </div>

              {/* ... Filters & Buttons ... */}
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
                 <button onClick={() => setShowCSVModal(true)} className="px-4 py-2.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors flex items-center gap-2 shadow-md"><FileSpreadsheet size={18} /> Import CSV</button>
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
                       <th className="p-5">Barcode</th>
                       <th className="p-5">Base Price</th>
                       <th className="p-5">Stock</th>
                       <th className="p-5 text-right">Actions</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-50">
                    {filteredProducts.map(product => {
                       const isExpanded = expandedProductId === product.id;
                       return (
                        <React.Fragment key={product.id}>
                           <tr className={`hover:bg-gray-50/50 group transition-colors ${isExpanded ? 'bg-gray-50' : ''}`}>
                              <td className="p-5">
                                 <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-gray-50 flex-shrink-0 p-1 border border-gray-200">
                                       <img src={product.images?.[0] || `https://picsum.photos/seed/${product.imageSeed}/100/100`} className="w-full h-full object-contain" alt={product.name}/>
                                    </div>
                                    <div className="flex-1">
                                       <div className="flex items-center gap-2 cursor-pointer" onClick={() => toggleExpand(product.id)}>
                                           <p className="font-bold text-gray-900 text-sm">{product.name}</p>
                                           {product.variants && product.variants.length > 0 && (
                                               <button className="text-gray-400 hover:text-primary transition-colors">
                                                   {isExpanded ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
                                               </button>
                                           )}
                                       </div>
                                       <p className="text-xs text-gray-500 font-medium">{product.brand} • {product.category}</p>
                                       
                                       {/* Compact Variant Indicators */}
                                       <div className="flex flex-wrap gap-1 mt-1">
                                           {product.colors?.map((c, i) => <div key={i} className="w-2.5 h-2.5 rounded-full border border-gray-300 shadow-sm" style={{backgroundColor: c}} title={c}></div>)}
                                           {product.storageOptions && product.storageOptions.length > 0 && <span className="text-[9px] bg-gray-100 text-gray-600 px-1.5 rounded ml-1">{product.storageOptions.join('/')}</span>}
                                       </div>
                                    </div>
                                 </div>
                              </td>
                              <td className="p-5">
                                 <div className="flex items-center gap-2">
                                    <ScanLine size={14} className="text-gray-400" />
                                    <span className="text-xs font-mono text-gray-600">{product.barcode || '-'}</span>
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
                                       onClick={() => { setEditingProduct(product); setShowPrintModal(true); }}
                                       className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                       title="Print Label"
                                    >
                                        <Printer size={16}/>
                                    </button>
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
                           {/* Expanded Variant Row */}
                           {isExpanded && product.variants && product.variants.length > 0 && (
                               <tr className="bg-gray-50/30">
                                   <td colSpan={5} className="p-0 border-b border-gray-100">
                                       <div className="px-5 pb-5 pt-2 shadow-inner bg-gray-50/50">
                                           <h5 className="font-bold text-[10px] text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                                               <Layers size={12}/> Variant Breakdown
                                           </h5>
                                           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                               {product.variants.map((variant) => (
                                                   <div key={variant.id} className="bg-white border border-gray-200 rounded-lg p-3 flex justify-between items-center shadow-sm">
                                                       <div className="flex items-center gap-3">
                                                           <div className="w-6 h-6 rounded-md border border-gray-200 shadow-sm flex-shrink-0" style={{backgroundColor: variant.color}}></div>
                                                           <div>
                                                               <p className="text-xs font-bold text-gray-900">{variant.color}</p>
                                                               <p className="text-[10px] text-gray-500">{variant.storage}</p>
                                                           </div>
                                                       </div>
                                                       <div className="text-right">
                                                           <p className="text-xs font-bold text-gray-900">{variant.price} KWD</p>
                                                           <p className={`text-[10px] font-bold ${variant.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>{variant.stock} Stock</p>
                                                       </div>
                                                   </div>
                                               ))}
                                           </div>
                                       </div>
                                   </td>
                               </tr>
                           )}
                        </React.Fragment>
                       );
                    })}
                 </tbody>
              </table>
           </div>
       )}

       {/* Label Print Modal */}
       {showPrintModal && (
           <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
               <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
                   <div className="flex justify-between items-center mb-6">
                       <h3 className="font-bold text-xl text-gray-900 flex items-center gap-2"><Printer size={20}/> Print Labels</h3>
                       <button onClick={() => setShowPrintModal(false)} className="p-2 hover:bg-gray-100 rounded-full"><X size={20}/></button>
                   </div>
                   
                   <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-6">
                       <p className="font-bold text-gray-900">{editingProduct.name}</p>
                       <p className="text-xs text-gray-500">{editingProduct.barcode || 'No Barcode'}</p>
                   </div>

                   <div className="space-y-4">
                       <div>
                           <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Label Size</label>
                           <select 
                               value={printConfig.labelSize} 
                               onChange={e => setPrintConfig({...printConfig, labelSize: e.target.value})}
                               className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-primary"
                           >
                               <option value="standard">Standard Tag (38x25mm)</option>
                               <option value="large">Inventory Label (50x30mm)</option>
                               <option value="xl">Box Label (60x40mm)</option>
                           </select>
                       </div>
                       
                       <div>
                           <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Quantity</label>
                           <input 
                               type="number" 
                               min="1"
                               value={printConfig.quantity}
                               onChange={e => setPrintConfig({...printConfig, quantity: parseInt(e.target.value)})}
                               className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-primary"
                           />
                       </div>

                       <div className="flex gap-4 pt-2">
                           <label className="flex items-center gap-2 text-sm cursor-pointer">
                               <input type="checkbox" checked={printConfig.showPrice} onChange={e => setPrintConfig({...printConfig, showPrice: e.target.checked})} className="rounded text-primary focus:ring-primary"/>
                               Show Price
                           </label>
                           <label className="flex items-center gap-2 text-sm cursor-pointer">
                               <input type="checkbox" checked={printConfig.showBarcode} onChange={e => setPrintConfig({...printConfig, showBarcode: e.target.checked})} className="rounded text-primary focus:ring-primary"/>
                               Show Barcode
                           </label>
                       </div>
                   </div>

                   <div className="mt-8 flex gap-3">
                       <button onClick={() => setShowPrintModal(false)} className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200">Cancel</button>
                       <button onClick={executePrintLabel} className="flex-1 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-black shadow-lg">Print Now</button>
                   </div>
               </div>
           </div>
       )}

       {/* Editor Modal */}
       {showModal && (
          <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
             <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl overflow-hidden flex flex-col h-[90vh]">
                {/* Header */}
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
                        {editingProduct.barcode && (
                            <button type="button" onClick={() => { setShowPrintModal(true); }} className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                                <Printer size={16}/> Print Sticker
                            </button>
                        )}
                        <button type="submit" form="productForm" className="px-6 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-slate-800 shadow-md">Save Changes</button>
                   </div>
                </div>
                
                {/* Tabs */}
                <div className="flex border-b border-gray-100 overflow-x-auto bg-white px-4">
                    <TabButton tab="basic" icon={FileText} label="Basic Info" />
                    <TabButton tab="variants" icon={Box} label="Variants & Stock" />
                    <TabButton tab="media" icon={ImageIcon} label="Media Manager" />
                    <TabButton tab="specs" icon={Layers} label="Detailed Specs" />
                    <TabButton tab="seo" icon={Globe} label="SEO" />
                    <TabButton tab="storefront" icon={LayoutTemplate} label="Storefront" />
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-gray-50/50">
                   <form id="productForm" onSubmit={handleSave}>
                      {activeTab === 'basic' && (
                         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-6">
                                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="font-bold text-gray-900 flex items-center gap-2"><FileText size={18}/> Product Identity</h4>
                                        <button 
                                            type="button" 
                                            onClick={handleAutoFillBasicInfo} 
                                            disabled={aiLoading}
                                            className="text-xs font-bold text-purple-600 bg-purple-50 px-3 py-1.5 rounded-lg border border-purple-100 hover:bg-purple-100 transition-colors flex items-center gap-1.5"
                                        >
                                            {aiLoading ? <RefreshCw className="animate-spin" size={14}/> : <Sparkles size={14}/>}
                                            {aiLoading ? 'Fetching Data...' : 'Auto-Fill with AI'}
                                        </button>
                                    </div>
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
                                                        <div key={i} onClick={() => handleModelSelect(item)} className="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-0 transition-colors">
                                                            <div className="font-bold text-gray-900">{item.model}</div>
                                                            <div className="text-xs text-gray-500 flex gap-2"><span>{item.brand}</span><span>•</span><span>{item.year}</span></div>
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
                                    <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><DollarSign size={18}/> Pricing & Tracking</h4>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Base Selling Price (KWD)</label>
                                            <input type="number" required value={editingProduct.price} onChange={e => setEditingProduct({...editingProduct, price: parseFloat(e.target.value)})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary outline-none font-bold text-lg" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Barcode / EAN</label>
                                            <div className="flex gap-2">
                                                <input type="text" value={editingProduct.barcode || ''} onChange={e => setEditingProduct({...editingProduct, barcode: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary outline-none" placeholder="Scan or Enter" />
                                                <button type="button" onClick={generateBarcode} className="px-3 bg-gray-200 rounded-xl hover:bg-gray-300" title="Generate Barcode"><QrCode size={18}/></button>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                                            <input type="checkbox" checked={editingProduct.imeiTracking || false} onChange={e => setEditingProduct({...editingProduct, imeiTracking: e.target.checked})} className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary" id="imeiTrack"/>
                                            <label htmlFor="imeiTrack" className="text-sm font-bold text-blue-900 cursor-pointer">Track IMEI / Serial Number</label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                         </div>
                      )}

                      {activeTab === 'variants' && (
                        /* Standard Variant Logic */
                        <div className="space-y-6">
                            {/* ... Color/Storage Inputs ... */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                    <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Palette size={18}/> Define Attributes</h4>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Colors</label>
                                            <div className="flex flex-wrap gap-2 mb-2">
                                                {editingProduct.colors?.map(color => (
                                                    <span key={color} className="px-3 py-1 bg-gray-100 rounded-lg text-sm font-bold flex items-center gap-2">
                                                        <span className="w-3 h-3 rounded-full border border-gray-300" style={{backgroundColor: color}}></span>
                                                        {color} <X size={14} className="cursor-pointer text-gray-400 hover:text-red-500" onClick={() => setEditingProduct(prev => ({...prev, colors: prev.colors?.filter(c => c !== color)}))}/>
                                                    </span>
                                                ))}
                                            </div>
                                            <input type="text" value={colorInput} onChange={e => setColorInput(e.target.value)} onKeyDown={addColor} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary outline-none" placeholder="e.g. #000000 or Black"/>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Storage</label>
                                            <div className="flex flex-wrap gap-2 mb-2">
                                                {editingProduct.storageOptions?.map(opt => (
                                                    <span key={opt} className="px-3 py-1 bg-gray-100 rounded-lg text-sm font-bold flex items-center gap-2">
                                                        {opt} <X size={14} className="cursor-pointer text-gray-400 hover:text-red-500" onClick={() => setEditingProduct(prev => ({...prev, storageOptions: prev.storageOptions?.filter(o => o !== opt)}))}/>
                                                    </span>
                                                ))}
                                            </div>
                                            <input type="text" value={storageInput} onChange={e => setStorageInput(e.target.value)} onKeyDown={addStorage} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary outline-none" placeholder="e.g. 256GB"/>
                                        </div>
                                        <button type="button" onClick={generateVariants} className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-black transition-colors flex items-center justify-center gap-2"><Wand2 size={16} /> Generate Matrix</button>
                                    </div>
                                </div>
                                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                    <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Calculator size={18}/> Smart Bulk Updates</h4>
                                    <div className="space-y-4">
                                        <div className="flex gap-2">
                                            <select value={bulkColorScope} onChange={e => setBulkColorScope(e.target.value)} className="flex-1 p-2 bg-white border border-gray-200 rounded-lg text-sm"><option value="all">All Colors</option>{editingProduct.colors?.map(c => <option key={c} value={c}>{c}</option>)}</select>
                                            <select value={bulkStorageScope} onChange={e => setBulkStorageScope(e.target.value)} className="flex-1 p-2 bg-white border border-gray-200 rounded-lg text-sm"><option value="all">All Storage</option>{editingProduct.storageOptions?.map(s => <option key={s} value={s}>{s}</option>)}</select>
                                        </div>
                                        <div className="flex gap-2">
                                            <select value={bulkAction} onChange={e => setBulkAction(e.target.value)} className="flex-[2] p-2 bg-white border border-gray-200 rounded-lg text-sm font-bold">
                                                <option value="price_set">Set Price</option>
                                                <option value="price_inc">Increase Price (+)</option>
                                                <option value="price_dec">Decrease Price (-)</option>
                                                <option value="stock_set">Set Stock</option>
                                                <option value="stock_inc">Add Stock (+)</option>
                                                <option value="stock_dec">Remove Stock (-)</option>
                                            </select>
                                            <input type="number" value={bulkValue} onChange={e => setBulkValue(e.target.value)} placeholder="Val" className="w-20 p-2 bg-white border border-gray-200 rounded-lg text-sm"/>
                                            <button type="button" onClick={applySmartBulkUpdate} className="px-3 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">Apply</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Variant Matrix Table */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                <div className="max-h-96 overflow-y-auto custom-scrollbar">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-white text-xs text-gray-500 uppercase font-bold sticky top-0 z-10 shadow-sm">
                                            <tr>
                                                <th className="p-4 bg-gray-50">Variant</th>
                                                <th className="p-4 bg-gray-50">Barcode / SKU</th>
                                                <th className="p-4 bg-gray-50 w-32">Price</th>
                                                <th className="p-4 bg-gray-50 w-32">Stock</th>
                                                <th className="p-4 bg-gray-50 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {(editingProduct.variants || []).map((variant) => (
                                                <React.Fragment key={variant.id}>
                                                    <tr className="hover:bg-blue-50/30 transition-colors">
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
                                                            <input type="text" value={variant.barcode || variant.sku} onChange={(e) => updateVariant(variant.id, 'barcode', e.target.value)} className="w-full bg-transparent border-b border-transparent hover:border-gray-300 focus:border-primary outline-none text-xs font-mono text-gray-600 transition-colors" placeholder="Scan Barcode" />
                                                        </td>
                                                        <td className="p-4">
                                                            <input type="number" value={variant.price} onChange={(e) => updateVariant(variant.id, 'price', parseFloat(e.target.value))} className="w-full p-2 bg-white border border-gray-200 rounded-lg focus:border-primary outline-none font-bold" />
                                                        </td>
                                                        <td className="p-4">
                                                            {editingProduct.imeiTracking ? (
                                                                <span className="font-bold text-gray-900">{variant.imeis?.length || 0} (Auto)</span>
                                                            ) : (
                                                                <input type="number" value={variant.stock} onChange={(e) => updateVariant(variant.id, 'stock', parseFloat(e.target.value))} className={`w-full p-2 border rounded-lg focus:border-primary outline-none font-bold ${variant.stock > 0 ? 'bg-white border-gray-200' : 'bg-red-50 border-red-200 text-red-600'}`} />
                                                            )}
                                                        </td>
                                                        <td className="p-4 text-right">
                                                            <div className="flex justify-end gap-2">
                                                                <button type="button" onClick={() => setExpandedVariantId(expandedVariantId === variant.id ? null : variant.id)} className="text-blue-600 hover:text-blue-800 transition-colors p-2 hover:bg-blue-50 rounded-lg" title="Manage IDs">
                                                                    <Fingerprint size={18}/>
                                                                </button>
                                                                <button type="button" onClick={() => setEditingProduct(prev => ({...prev, variants: prev.variants?.filter(v => v.id !== variant.id)}))} className="text-gray-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-lg">
                                                                    <X size={18}/>
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                    {expandedVariantId === variant.id && (
                                                        <tr className="bg-gray-50 border-b border-gray-200">
                                                            <td colSpan={5} className="p-4">
                                                                <div className="flex flex-col gap-4 animate-in slide-in-from-top-2">
                                                                    <div className="flex items-center gap-2">
                                                                        <ScanLine size={16} className="text-gray-500"/>
                                                                        <h5 className="text-xs font-bold uppercase text-gray-500">Manage Item Identifiers (IMEI / Serial)</h5>
                                                                    </div>
                                                                    
                                                                    <div className="flex gap-2">
                                                                        <div className="relative flex-1">
                                                                            <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16}/>
                                                                            <input 
                                                                                type="text" 
                                                                                value={imeiInput}
                                                                                onChange={e => setImeiInput(e.target.value)}
                                                                                onKeyDown={e => {
                                                                                    if(e.key === 'Enter') {
                                                                                        e.preventDefault();
                                                                                        handleAddImeiToVariant(variant.id);
                                                                                    }
                                                                                }}
                                                                                className="w-full pl-9 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-sm outline-none focus:border-primary font-mono"
                                                                                placeholder="Scan or Enter IMEI/SN"
                                                                            />
                                                                        </div>
                                                                        <button 
                                                                            type="button"
                                                                            onClick={() => handleAddImeiToVariant(variant.id)}
                                                                            className="px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-bold hover:bg-black transition-colors"
                                                                        >
                                                                            Add
                                                                        </button>
                                                                    </div>

                                                                    {variant.imeis && variant.imeis.length > 0 ? (
                                                                        <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                                                                            {variant.imeis.map(imei => (
                                                                                <span key={imei} className="px-2 py-1 bg-white border border-gray-200 rounded text-xs font-mono text-gray-700 flex items-center gap-2 shadow-sm">
                                                                                    {imei}
                                                                                    <X 
                                                                                        size={12} 
                                                                                        className="cursor-pointer text-gray-400 hover:text-red-500" 
                                                                                        onClick={() => handleRemoveImeiFromVariant(variant.id, imei)}
                                                                                    />
                                                                                </span>
                                                                            ))}
                                                                        </div>
                                                                    ) : (
                                                                        <p className="text-xs text-gray-400 italic">No identifiers added yet.</p>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </React.Fragment>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                      )}

                      {/* Media Tab */}
                      {activeTab === 'media' && (
                          <div className="space-y-6">
                              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                  <div className="flex gap-4 mb-6 border-b border-gray-100 pb-2">
                                      <button type="button" onClick={() => setImageTab('fetch')} className={`pb-2 px-2 text-sm font-bold ${imageTab === 'fetch' ? 'text-primary border-b-2 border-primary' : 'text-gray-400'}`}>AI Search</button>
                                      <button type="button" onClick={() => setImageTab('upload')} className={`pb-2 px-2 text-sm font-bold ${imageTab === 'upload' ? 'text-primary border-b-2 border-primary' : 'text-gray-400'}`}>Upload</button>
                                      <button type="button" onClick={() => setImageTab('url')} className={`pb-2 px-2 text-sm font-bold ${imageTab === 'url' ? 'text-primary border-b-2 border-primary' : 'text-gray-400'}`}>URL</button>
                                  </div>

                                  {imageTab === 'fetch' && (
                                      <div className="space-y-4">
                                          <div className="flex gap-2">
                                              <input 
                                                  type="text" 
                                                  value={imageSearchQuery} 
                                                  onChange={e => setImageSearchQuery(e.target.value)}
                                                  className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary outline-none" 
                                                  placeholder="Product name + color..."
                                              />
                                              <button type="button" onClick={() => handleFetchImages(imageSearchQuery)} className="px-6 bg-slate-900 text-white rounded-xl font-bold flex items-center gap-2">
                                                  {aiLoading ? <Loader2 className="animate-spin" /> : <Search size={18}/>} Search
                                              </button>
                                          </div>
                                          
                                          {/* Quick Search Buttons for Colors */}
                                          {editingProduct.colors && editingProduct.colors.length > 0 && (
                                              <div className="flex gap-2 flex-wrap">
                                                  {editingProduct.colors.map(color => (
                                                      <button 
                                                          key={color} 
                                                          type="button"
                                                          onClick={() => {
                                                              const query = `${editingProduct.name} ${color} official render`;
                                                              setImageSearchQuery(query);
                                                              handleFetchImages(query);
                                                          }}
                                                          className="px-3 py-1.5 bg-gray-100 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-200 flex items-center gap-2"
                                                      >
                                                          <div className="w-2 h-2 rounded-full border border-gray-300" style={{backgroundColor: color}}></div>
                                                          Search {color}
                                                      </button>
                                                  ))}
                                              </div>
                                          )}

                                          <div className="grid grid-cols-4 md:grid-cols-6 gap-4 max-h-60 overflow-y-auto p-2 bg-gray-50 rounded-xl">
                                              {foundImages.map((url, i) => (
                                                  <div key={i} onClick={() => toggleImageSelection(url)} className={`relative aspect-square bg-white rounded-lg border cursor-pointer overflow-hidden group ${editingProduct.images?.includes(url) ? 'border-primary ring-2 ring-primary/30' : 'border-gray-200'}`}>
                                                      <img src={url} className="w-full h-full object-contain" alt="found"/>
                                                      {editingProduct.images?.includes(url) && (
                                                          <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                                                              <CheckCircle className="text-primary fill-white" size={24} />
                                                          </div>
                                                      )}
                                                  </div>
                                              ))}
                                          </div>
                                      </div>
                                  )}

                                  {imageTab === 'upload' && (
                                      <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-primary transition-colors bg-gray-50">
                                          <input type="file" ref={fileInputRef} onChange={handleImageSelect} className="hidden" accept="image/*" />
                                          <Upload size={32} className="mx-auto text-gray-400 mb-2"/>
                                          <p className="text-sm text-gray-500 mb-4">Drag and drop or click to upload</p>
                                          <button type="button" onClick={() => fileInputRef.current?.click()} className="px-6 py-2 bg-white border border-gray-300 rounded-lg text-sm font-bold text-gray-700">Choose File</button>
                                          {uploadingImage && <p className="text-xs text-primary mt-2">Uploading...</p>}
                                      </div>
                                  )}

                                  {imageTab === 'url' && (
                                      <div className="flex gap-2">
                                          <input type="text" value={imageUrlInput} onChange={e => setImageUrlInput(e.target.value)} className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl" placeholder="https://example.com/image.jpg"/>
                                          <button type="button" onClick={handleAddImageUrl} className="px-6 bg-slate-900 text-white rounded-xl font-bold">Add</button>
                                      </div>
                                  )}
                              </div>

                              {/* Gallery Grid */}
                              <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
                                  {editingProduct.images?.map((url, i) => (
                                      <div key={i} className="relative aspect-square bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden group">
                                          <img src={url} className="w-full h-full object-contain" alt="prod"/>
                                          <button type="button" onClick={() => setEditingProduct(prev => ({...prev, images: prev.images?.filter(img => img !== url)}))} className="absolute top-1 right-1 p-1 bg-white rounded-full shadow text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><X size={14}/></button>
                                      </div>
                                  ))}
                              </div>
                          </div>
                      )}

                      {activeTab === 'specs' && (
                          <div className="space-y-6">
                              <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                                  <div>
                                      <h4 className="font-bold text-gray-900">Technical Specifications</h4>
                                      <p className="text-xs text-gray-500">Auto-fill using AI or enter manually</p>
                                  </div>
                                  <button type="button" onClick={() => handleFetchSpecs()} disabled={aiLoading} className="px-4 py-2 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 flex items-center gap-2 text-sm">{aiLoading ? 'Fetching...' : 'Auto-Fill with AI'}</button>
                              </div>
                              <div className="space-y-4">
                                  {Object.entries(editingProduct.specs || {}).map(([group, data]) => renderSpecGroup(group, data))}
                                  <div className="text-center">
                                      <button type="button" onClick={() => setEditingProduct(prev => ({ ...prev, specs: { ...(prev.specs || {}), "New Category": { "Feature": "" } } }))} className="px-6 py-2 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 text-sm">Add New Category</button>
                                  </div>
                              </div>
                          </div>
                      )}

                      {activeTab === 'seo' && (
                          <div className="space-y-6">
                              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                  <div className="flex justify-between items-center mb-6">
                                      <h4 className="font-bold text-gray-900 flex items-center gap-2"><Globe size={18}/> SEO Metadata</h4>
                                      <button type="button" onClick={handleGenerateSEO} disabled={aiLoading} className="px-4 py-2 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 flex items-center gap-2 text-sm">{aiLoading ? 'Generating...' : 'Generate with AI'}</button>
                                  </div>
                                  <div className="space-y-4">
                                      <div>
                                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Meta Title</label>
                                          <input type="text" value={editingProduct.seo?.metaTitle} onChange={e => setEditingProduct(prev => ({...prev, seo: {...prev.seo, metaTitle: e.target.value}}))} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary outline-none" />
                                      </div>
                                      <div>
                                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Meta Description</label>
                                          <textarea value={editingProduct.seo?.metaDescription} onChange={e => setEditingProduct(prev => ({...prev, seo: {...prev.seo, metaDescription: e.target.value}}))} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary outline-none h-24 resize-none" />
                                      </div>
                                      <div>
                                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Keywords</label>
                                          <input type="text" value={editingProduct.seo?.keywords?.join(', ')} onChange={e => setEditingProduct(prev => ({...prev, seo: {...prev.seo, keywords: e.target.value.split(',').map(s => s.trim())}}))} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary outline-none" placeholder="Comma separated" />
                                      </div>
                                  </div>
                              </div>

                              {/* Search Preview */}
                              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                  <h4 className="font-bold text-gray-900 mb-4 text-sm">Search Engine Preview</h4>
                                  <div className="p-4 bg-white rounded-lg border border-gray-100 max-w-xl">
                                      <div className="flex items-center gap-2 mb-1">
                                          <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-[10px] font-bold text-gray-600">L</div>
                                          <div>
                                              <p className="text-xs text-gray-800 font-medium">LAKKI PHONES</p>
                                              <p className="text-[10px] text-gray-500">lakkiphones.com {'>'} product {'>'} {editingProduct.id || 'new-product'}</p>
                                          </div>
                                      </div>
                                      <h3 className="text-xl text-[#1a0dab] font-medium hover:underline cursor-pointer truncate">
                                          {editingProduct.seo?.metaTitle || editingProduct.name || "Product Title"}
                                      </h3>
                                      <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                                          {editingProduct.seo?.metaDescription || editingProduct.description || "Product description will appear here..."}
                                      </p>
                                  </div>
                              </div>
                          </div>
                      )}

                      {activeTab === 'storefront' && (
                          <div className="space-y-6">
                              {/* Hero Slider Config */}
                              <div className={`p-6 rounded-2xl border transition-all ${editingProduct.isHero ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-100'}`}>
                                  <div className="flex justify-between items-start mb-4">
                                      <div>
                                          <h4 className="font-bold text-gray-900 text-lg">Hero Slider</h4>
                                          <p className="text-sm text-gray-500">Show this product in the main homepage carousel.</p>
                                      </div>
                                      <label className="relative inline-flex items-center cursor-pointer">
                                          <input type="checkbox" checked={editingProduct.isHero || false} onChange={e => setEditingProduct({...editingProduct, isHero: e.target.checked})} className="sr-only peer"/>
                                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                      </label>
                                  </div>
                                  
                                  {editingProduct.isHero && (
                                      <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                                          <div className="grid grid-cols-2 gap-4">
                                              <div>
                                                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Banner Title</label>
                                                  <input type="text" value={editingProduct.heroTitle || ''} onChange={e => setEditingProduct({...editingProduct, heroTitle: e.target.value})} className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm" placeholder="Overrides product name"/>
                                              </div>
                                              <div>
                                                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Subtitle / Tagline</label>
                                                  <input type="text" value={editingProduct.heroSubtitle || ''} onChange={e => setEditingProduct({...editingProduct, heroSubtitle: e.target.value})} className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm" placeholder="e.g. Titanium Power"/>
                                              </div>
                                          </div>
                                          <div>
                                              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Custom Hero Image URL (Optional)</label>
                                              <input type="text" value={editingProduct.heroImage || ''} onChange={e => setEditingProduct({...editingProduct, heroImage: e.target.value})} className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm" placeholder="Leave empty to use main product image"/>
                                          </div>
                                      </div>
                                  )}
                              </div>

                              {/* Other Storefront Toggles */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div className={`p-6 rounded-2xl border transition-all ${editingProduct.isFeatured ? 'bg-yellow-50 border-yellow-200' : 'bg-white border-gray-100'}`}>
                                      <div className="flex justify-between items-center">
                                          <div>
                                              <h4 className="font-bold text-gray-900">Featured Collection</h4>
                                              <p className="text-sm text-gray-500">Show in "Recommended" rail.</p>
                                          </div>
                                          <input type="checkbox" checked={editingProduct.isFeatured || false} onChange={e => setEditingProduct({...editingProduct, isFeatured: e.target.checked})} className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"/>
                                      </div>
                                  </div>
                                  <div className={`p-6 rounded-2xl border transition-all ${editingProduct.isTicker ? 'bg-green-50 border-green-200' : 'bg-white border-gray-100'}`}>
                                      <div className="flex justify-between items-center">
                                          <div>
                                              <h4 className="font-bold text-gray-900">Live Ticker</h4>
                                              <p className="text-sm text-gray-500">Show in scrolling marquee.</p>
                                          </div>
                                          <input type="checkbox" checked={editingProduct.isTicker || false} onChange={e => setEditingProduct({...editingProduct, isTicker: e.target.checked})} className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"/>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      )}
                   </form>
                </div>

                <div className="p-4 border-t border-gray-100 bg-white flex justify-between z-10">
                    <button type="button" onClick={handleBack} disabled={activeTab === 'basic'} className="px-6 py-3 bg-gray-100 rounded-xl text-gray-600 font-bold hover:bg-gray-200 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"><ChevronLeft size={18}/> Back</button>
                    <button type="button" onClick={handleNext} className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-black transition-colors flex items-center gap-2">Next Step <ChevronRight size={18}/></button>
                </div>
             </div>
          </div>
       )}
    </div>
  );
};
