
import React, { useState, useRef, useEffect } from 'react';
import { useShop } from '../../context/ShopContext';
import { Product, ProductVariant, InventoryItem } from '../../types';
import { 
   Edit, Trash2, Plus, Search, X, 
   FileText, DollarSign, ImageIcon, Layers, Globe, 
   Upload, RefreshCw, Box, CheckCircle, 
   Palette, ArrowLeft, ChevronRight, Wand2, ChevronLeft, Calculator, Tag, BrainCircuit, Filter, LayoutTemplate, Star, Check, FileSpreadsheet, Loader2, QrCode, Printer, ScanLine, Sparkles, Copy, Settings, ChevronDown, ChevronUp, Fingerprint, Barcode, Calendar, User, Save as SaveIcon, Truck, GripVertical, FileCheck, Lock, AlertTriangle, List, Copy as CopyIcon
} from 'lucide-react';
import { fetchPhoneSpecs, findProductImage, searchMobileModels, generateSEO } from '../../services/geminiService';
import Papa from 'papaparse';

export const ProductManager: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct, bulkUpsertProducts, uploadImage, appSettings, showToast, isOffline, warehouses, suppliers, customers } = useShop();
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
  
  // Label Print State
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printConfig, setPrintConfig] = useState({
      labelSize: 'standard', // standard (38x25), large (50x30), a4
      showPrice: true,
      showBarcode: true,
      showName: true,
      quantity: 1,
      specificItem: null as InventoryItem | null // If set, prints unique label for item
  });
  
  // Autocomplete State
  const [suggestions, setSuggestions] = useState<Array<{model: string, brand: string, variants: string[], year: string}>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionLoading, setSuggestionLoading] = useState(false);
  
  const autocompleteRef = useRef<HTMLDivElement>(null);

  // Variant Inputs
  const [colorInput, setColorInput] = useState('');
  const [storageInput, setStorageInput] = useState('');
  
  // Individual Item Tracking Input
  const [newItem, setNewItem] = useState<Partial<InventoryItem>>({
      imei: '',
      serial: '',
      costPrice: 0,
      condition: 'New',
      status: 'Available',
      purchaseDate: new Date().toISOString().split('T')[0],
      supplierId: '',
      sourceType: 'Wholesale',
      locationId: warehouses[0]?.id || '' // Default to first warehouse
  });
  
  // Bulk Paste State for Variants
  const [bulkPasteInput, setBulkPasteInput] = useState('');

  // Bulk Updates State
  const [bulkColorScope, setBulkColorScope] = useState<string>('all');
  const [bulkStorageScope, setBulkStorageScope] = useState<string>('all');
  const [bulkAction, setBulkAction] = useState<string>('price_set'); 
  const [bulkValue, setBulkValue] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-Recalculate Total Stock when Variants Change
  useEffect(() => {
      if (editingProduct.variants && editingProduct.variants.length > 0) {
          const calculatedTotal = editingProduct.variants.reduce((acc, v) => acc + (v.stock || 0), 0);
          if (calculatedTotal !== editingProduct.stock) {
              setEditingProduct(prev => ({ ...prev, stock: calculatedTotal }));
          }
      }
  }, [editingProduct.variants]);

  // Helper Functions
  const addColor = (e: any) => {
      if (e.type === 'keydown' && e.key !== 'Enter') return;
      e.preventDefault();
      if (colorInput && !editingProduct.colors?.includes(colorInput)) {
          setEditingProduct(prev => ({...prev, colors: [...(prev.colors || []), colorInput]}));
          setColorInput('');
      }
  };

  const addStorage = (e: any) => {
      if (e.type === 'keydown' && e.key !== 'Enter') return;
      e.preventDefault();
      if (storageInput && !editingProduct.storageOptions?.includes(storageInput)) {
          setEditingProduct(prev => ({...prev, storageOptions: [...(prev.storageOptions || []), storageInput]}));
          setStorageInput('');
      }
  };

  const duplicateProduct = (product: Product) => {
      const cloned = { ...product, id: '', name: `${product.name} (Copy)`, stock: 0 };
      // Deep clone variants to reset stock and IDs
      cloned.variants = cloned.variants?.map(v => ({ 
          ...v, 
          id: `var-${Date.now()}-${Math.floor(Math.random()*1000)}`, 
          stock: 0, 
          inventory: [] 
      }));
      setEditingProduct(cloned);
      setShowModal(true);
      setActiveTab('basic');
      showToast('Product cloned! Review details before saving.', 'info');
  };

  const generateVariants = () => {
      if (!editingProduct.colors?.length && !editingProduct.storageOptions?.length) {
          showToast('Please add at least one color or storage option.', 'error');
          return;
      }
      const newVariants: ProductVariant[] = [];
      const colors = editingProduct.colors && editingProduct.colors.length ? editingProduct.colors : ['Default'];
      const storages = editingProduct.storageOptions && editingProduct.storageOptions.length ? editingProduct.storageOptions : ['Default'];

      colors.forEach(color => {
          storages.forEach(storage => {
              const existing = editingProduct.variants?.find(v => v.color === color && v.storage === storage);
              if (existing) {
                  newVariants.push(existing);
              } else {
                  newVariants.push({
                      id: `var-${Date.now()}-${Math.floor(Math.random()*1000)}`,
                      color: color === 'Default' ? '' : color,
                      storage: storage === 'Default' ? '' : storage,
                      price: editingProduct.price || 0,
                      stock: 0,
                      sku: `${editingProduct.name?.substring(0,3).toUpperCase()}-${color.substring(0,3).toUpperCase()}-${storage}`,
                      inventory: []
                  });
              }
          });
      });
      setEditingProduct(prev => ({ ...prev, variants: newVariants }));
      showToast('Variants generated', 'success');
  };

  const applyBulkUpdate = () => {
      if (!bulkValue) return;
      const val = parseFloat(bulkValue);
      
      const newVariants = editingProduct.variants?.map(v => {
          // Scope Check
          if (bulkColorScope !== 'all' && v.color !== bulkColorScope) return v;
          if (bulkStorageScope !== 'all' && v.storage !== bulkStorageScope) return v;

          let newVal = 0;
          switch (bulkAction) {
              case 'price_set': return { ...v, price: val };
              case 'price_increase': return { ...v, price: v.price + val };
              case 'price_decrease': return { ...v, price: Math.max(0, v.price - val) };
              // Only allow stock updates if IMEI tracking is OFF
              case 'stock_set': return editingProduct.imeiTracking ? v : { ...v, stock: Math.floor(val) };
              case 'stock_increase': return editingProduct.imeiTracking ? v : { ...v, stock: v.stock + Math.floor(val) };
              default: return v;
          }
      });
      setEditingProduct(prev => ({ ...prev, variants: newVariants }));
      showToast('Bulk update applied', 'success');
  };

  const handlePrintItem = (item: InventoryItem) => {
      setPrintConfig(prev => ({ ...prev, quantity: 1, specificItem: item }));
      setShowPrintModal(true);
  };

  const handlePrintAllAvailable = (variant: ProductVariant) => {
      setPrintConfig(prev => ({ ...prev, quantity: variant.stock || 1, specificItem: null }));
      setShowPrintModal(true);
  };

  const handlePrintGRN = (variant: ProductVariant) => {
      // Goods Receipt Note Printing Logic
      const popup = window.open('', '_blank', 'width=800,height=600');
      if(!popup) return;
      
      const itemsHtml = variant.inventory?.map(i => `
        <tr>
            <td>${i.id}</td>
            <td>${i.imei}</td>
            <td>${i.sourceType}</td>
            <td>${i.costPrice} KWD</td>
            <td>${i.status}</td>
        </tr>
      `).join('');

      popup.document.write(`
        <html>
            <head><title>Goods Receipt Note</title>
            <style>body{font-family:sans-serif;padding:20px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:8px;text-align:left}</style>
            </head>
            <body>
                <h1>Goods Receipt Note</h1>
                <p><strong>Product:</strong> ${editingProduct.name} (${variant.color} ${variant.storage})</p>
                <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
                <table>
                    <thead><tr><th>ID</th><th>IMEI/SN</th><th>Source</th><th>Cost</th><th>Status</th></tr></thead>
                    <tbody>${itemsHtml}</tbody>
                </table>
            </body>
        </html>
      `);
      popup.document.close();
  };

  const handleRemoveItemFromVariant = (variantId: string, itemId: string) => {
      if(!confirm("Are you sure you want to remove this item?")) return;
      setEditingProduct(prev => ({
          ...prev,
          variants: prev.variants?.map(v => {
              if (v.id === variantId) {
                  const newInventory = v.inventory?.filter(i => i.id !== itemId) || [];
                  // Auto-recalculate stock based on inventory count
                  const available = newInventory.filter(i => i.status === 'Available').length;
                  return { ...v, inventory: newInventory, stock: available };
              }
              return v;
          })
      }));
      showToast('Item removed and stock updated', 'success');
  };

  const handleBulkPaste = (variantId: string) => {
      if (!bulkPasteInput.trim()) return;
      
      const imeis = bulkPasteInput.split(/[\n,]+/).map(s => s.trim()).filter(s => s.length > 0);
      const uniqueImeis = [...new Set(imeis)];
      
      if (uniqueImeis.length === 0) return;

      setEditingProduct(prev => ({
          ...prev,
          variants: prev.variants?.map(v => {
              if (v.id === variantId) {
                  const currentInventory = v.inventory || [];
                  const existingImeis = new Set(currentInventory.map(i => i.imei));
                  
                  const newItems: InventoryItem[] = uniqueImeis
                      .filter(imei => !existingImeis.has(imei))
                      .map((imei: string) => ({
                          id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                          imei,
                          costPrice: Number(newItem.costPrice) || 0,
                          condition: (newItem.condition || 'New') as InventoryItem['condition'],
                          status: 'Available',
                          purchaseDate: new Date().toISOString().split('T')[0],
                          locationId: warehouses[0]?.id || '',
                          sourceType: 'Wholesale'
                      }));
                  
                  const updatedInventory = [...currentInventory, ...newItems];
                  // Strict sync: Stock = Count of Available Items
                  const newStock = updatedInventory.filter(i => i.status === 'Available').length;
                  
                  return { ...v, inventory: updatedInventory, stock: newStock };
              }
              return v;
          })
      }));
      
      setBulkPasteInput('');
      showToast(`Added ${uniqueImeis.length} items to stock!`, 'success');
  };

  // Image Handling
  const handleFindImages = async () => {
      if (!imageSearchQuery) return;
      setAiLoading(true);
      const images = await findProductImage(imageSearchQuery);
      setFoundImages(images);
      setAiLoading(false);
  };

  const handleAddImage = (url: string) => {
      if (url && !editingProduct.images?.includes(url)) {
          setEditingProduct(prev => ({ ...prev, images: [...(prev.images || []), url] }));
      }
  };

  const handleRemoveImage = (index: number) => {
      setEditingProduct(prev => ({ ...prev, images: prev.images?.filter((_, i) => i !== index) }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setUploadingImage(true);
      const url = await uploadImage(file);
      if (url) {
          handleAddImage(url);
          showToast('Image uploaded', 'success');
      }
      setUploadingImage(false);
  };

  // SEO Handling
  const handleGenerateSEO = async () => {
      setAiLoading(true);
      const seoData = await generateSEO(
          editingProduct.name || '', 
          editingProduct.description || '', 
          editingProduct.price,
          editingProduct.brand,
          editingProduct.specs,
          editingProduct.colors
      );
      if (seoData) {
          setEditingProduct(prev => ({ ...prev, seo: seoData }));
          showToast('SEO Metadata Generated', 'success');
      } else {
          showToast('Failed to generate SEO', 'error');
      }
      setAiLoading(false);
  };

  // Specs Handling
  const handleSpecChange = (category: string, key: string, value: string) => {
      setEditingProduct(prev => ({
          ...prev,
          specs: {
              ...prev.specs,
              [category]: {
                  ...(prev.specs?.[category] || {}),
                  [key]: value
              }
          }
      }));
  };

  const renderSpecGroup = (category: string, data: any) => {
      return (
          <div key={category} className="mb-6 bg-gray-50 p-4 rounded-xl border border-gray-200">
              <div className="flex justify-between items-center mb-3">
                  <input 
                      type="text" 
                      value={category}
                      className="font-bold text-gray-800 bg-transparent border-none focus:ring-0 text-sm uppercase"
                      readOnly
                  />
                  <button onClick={() => {
                      const newSpecs = { ...editingProduct.specs };
                      delete newSpecs[category];
                      setEditingProduct({ ...editingProduct, specs: newSpecs });
                  }} className="text-red-400 hover:text-red-600"><Trash2 size={14}/></button>
              </div>
              <div className="space-y-2">
                  {Object.entries(data).map(([key, val]) => (
                      <div key={key} className="flex gap-2 items-center">
                          <input 
                              type="text" 
                              value={key}
                              onChange={(e) => {
                                  const newGroup = { ...data };
                                  const newVal = newGroup[key];
                                  delete newGroup[key];
                                  newGroup[e.target.value] = newVal;
                                  setEditingProduct({ ...editingProduct, specs: { ...editingProduct.specs, [category]: newGroup } });
                              }}
                              className="w-1/3 p-2 text-xs bg-white border border-gray-200 rounded-lg"
                          />
                          <input 
                              type="text" 
                              value={val as string}
                              onChange={(e) => handleSpecChange(category, key, e.target.value)}
                              className="flex-1 p-2 text-xs bg-white border border-gray-200 rounded-lg"
                          />
                          <button onClick={() => {
                              const newGroup = { ...data };
                              delete newGroup[key];
                              setEditingProduct({ ...editingProduct, specs: { ...editingProduct.specs, [category]: newGroup } });
                          }} className="text-gray-400 hover:text-red-500"><X size={14}/></button>
                      </div>
                  ))}
                  <button onClick={() => handleSpecChange(category, 'New Feature', '')} className="text-xs text-blue-600 font-bold flex items-center gap-1 mt-2 hover:underline">
                      <Plus size={12}/> Add Field
                  </button>
              </div>
          </div>
      );
  };

  // Deep Search & Filter Logic
  const filteredProducts = products.filter(p => {
     if (viewFilter === 'hero' && p.isHero !== true) return false;
     if (viewFilter === 'featured' && p.isFeatured !== true) return false;
     if (viewFilter === 'ticker' && p.isTicker !== true) return false;

     const query = searchTerm.toLowerCase();
     if (!query) return true;

     const matchesBasic = p.name.toLowerCase().includes(query) || 
                           p.brand.toLowerCase().includes(query) ||
                           (p.barcode && p.barcode.includes(searchTerm));
     
     const matchesDeep = p.variants?.some(v => 
        v.sku?.toLowerCase().includes(query) ||
        v.inventory?.some(i => i.imei.toLowerCase().includes(query) || i.serial?.toLowerCase().includes(query)) ||
        v.imeis?.some(imei => imei.toLowerCase().includes(query))
     );

     return matchesBasic || matchesDeep;
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
     // Ensure total stock matches variants if present
     let totalStock = Number(editingProduct.stock || 0);
     if (editingProduct.variants && editingProduct.variants.length > 0) {
         totalStock = editingProduct.variants.reduce((acc, v) => acc + (v.stock || 0), 0);
     }

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

  const handleAddItemToVariant = (variantId: string) => {
      if (!newItem.imei || !newItem.costPrice) {
          showToast('IMEI and Cost Price are required', 'error');
          return;
      }

      setEditingProduct(prev => ({
          ...prev,
          variants: prev.variants?.map(v => {
              if (v.id === variantId) {
                  const currentInventory = v.inventory || [];
                  if (currentInventory.some(i => i.imei === newItem.imei)) {
                      showToast('Item with this IMEI already exists', 'error');
                      return v;
                  }
                  
                  const itemToAdd: InventoryItem = {
                      id: `item-${Date.now()}`,
                      imei: newItem.imei!,
                      serial: newItem.serial || '',
                      costPrice: Number(newItem.costPrice),
                      condition: newItem.condition || 'New',
                      status: 'Available',
                      purchaseDate: newItem.purchaseDate,
                      supplierId: newItem.supplierId || '',
                      sourceType: newItem.sourceType || 'Wholesale',
                      locationId: newItem.locationId || warehouses[0]?.id || '', // Assign location
                      notes: newItem.notes || ''
                  };

                  const newInventory = [...currentInventory, itemToAdd];
                  const availableCount = newInventory.filter(i => i.status === 'Available').length;
                  
                  return { ...v, inventory: newInventory, stock: availableCount };
              }
              return v;
          })
      }));
      setNewItem({ 
          imei: '', serial: '', costPrice: newItem.costPrice, condition: 'New', 
          status: 'Available', purchaseDate: new Date().toISOString().split('T')[0], 
          supplierId: '', sourceType: 'Wholesale', locationId: warehouses[0]?.id || '' 
      });
      showToast('Inventory item added', 'success');
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
       {/* Actions Bar */}
       <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <div className="relative w-full md:w-96">
             <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
             <input 
               type="text" 
               placeholder="Search by name, SKU, or scan IMEI..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary transition-all font-medium"
             />
          </div>
          <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
             <div className="flex bg-gray-100 rounded-xl p-1">
                 {['all', 'hero', 'featured', 'ticker'].map((f) => (
                     <button
                        key={f}
                        onClick={() => setViewFilter(f as any)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${viewFilter === f ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                     >
                        {f}
                     </button>
                 ))}
             </div>
             <div className="w-px bg-gray-200 mx-2"></div>
             <button 
                onClick={() => setShowCSVModal(true)}
                className="px-4 py-2.5 bg-green-50 text-green-700 font-bold rounded-xl hover:bg-green-100 transition-colors text-xs flex items-center gap-2 border border-green-100 whitespace-nowrap"
             >
                <FileSpreadsheet size={16} /> Import CSV
             </button>
             <button 
                onClick={() => {
                    setEditingProduct({ name: '', brand: 'Apple', price: 0, category: 'Smartphones', stock: 0, description: '', specs: {}, images: [], seo: { metaTitle: '', metaDescription: '', keywords: [] }, colors: [], storageOptions: [], variants: [] });
                    setShowModal(true);
                    setActiveTab('basic');
                }}
                className="px-4 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-black transition-colors text-xs flex items-center gap-2 whitespace-nowrap shadow-lg"
             >
                <Plus size={16} /> Add Product
             </button>
          </div>
       </div>

       {/* Product List */}
       <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
             <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                <tr>
                   <th className="p-5">Product</th>
                   <th className="p-5">Category</th>
                   <th className="p-5">Price</th>
                   <th className="p-5">Stock</th>
                   <th className="p-5 text-right">Actions</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-gray-50">
                {filteredProducts.map(product => (
                   <React.Fragment key={product.id}>
                       <tr 
                          onClick={() => setExpandedProductId(expandedProductId === product.id ? null : product.id)}
                          className={`cursor-pointer transition-colors group ${expandedProductId === product.id ? 'bg-blue-50/30' : 'hover:bg-gray-50'}`}
                       >
                          <td className="p-5">
                             <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white rounded-xl border border-gray-200 p-1 flex-shrink-0">
                                   <img src={product.image || product.images?.[0]} className="w-full h-full object-contain" alt={product.name}/>
                                </div>
                                <div>
                                   <div className="flex items-center gap-2">
                                       <p className="font-bold text-gray-900 text-sm group-hover:text-primary transition-colors">{product.name}</p>
                                       {product.isHero && <span className="px-1.5 py-0.5 rounded text-[9px] bg-blue-100 text-blue-700 font-bold">HERO</span>}
                                       {product.isFeatured && <span className="px-1.5 py-0.5 rounded text-[9px] bg-purple-100 text-purple-700 font-bold">FEAT</span>}
                                   </div>
                                   <div className="flex items-center gap-2 mt-1">
                                      <span className="text-xs text-gray-500">{product.brand}</span>
                                      {product.variants && product.variants.length > 0 && (
                                          <div className="flex gap-1">
                                              {product.colors.map(c => (
                                                  <div key={c} className="w-2 h-2 rounded-full border border-gray-300" style={{backgroundColor: c}}></div>
                                              ))}
                                          </div>
                                      )}
                                   </div>
                                </div>
                             </div>
                          </td>
                          <td className="p-5">
                             <span className="text-xs font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded-md">{product.category}</span>
                          </td>
                          <td className="p-5">
                             <span className="font-bold text-gray-900">{product.price} KWD</span>
                          </td>
                          <td className="p-5">
                             <span className={`text-xs font-bold px-2 py-1 rounded-md ${product.stock > 10 ? 'bg-green-100 text-green-700' : product.stock > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                                {product.stock} Units
                             </span>
                          </td>
                          <td className="p-5 text-right">
                             <div className="flex justify-end gap-2" onClick={e => e.stopPropagation()}>
                                <button onClick={() => duplicateProduct(product)} className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-purple-50 hover:text-purple-600 transition-colors" title="Duplicate">
                                    <CopyIcon size={16} />
                                </button>
                                <button 
                                   onClick={() => { setEditingProduct(product); setShowModal(true); }}
                                   className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                >
                                   <Edit size={16} />
                                </button>
                                <button 
                                   onClick={() => { if(confirm('Delete product?')) deleteProduct(product.id); }}
                                   className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors"
                                >
                                   <Trash2 size={16} />
                                </button>
                                <ChevronDown 
                                    size={16} 
                                    className={`text-gray-400 transition-transform duration-300 ${expandedProductId === product.id ? 'rotate-180' : ''}`}
                                />
                             </div>
                          </td>
                       </tr>
                       
                       {/* Expanded View */}
                       {expandedProductId === product.id && (
                           <tr>
                               <td colSpan={5} className="p-0 bg-gray-50 border-b border-gray-100">
                                   <div className="p-6 space-y-4">
                                       <div className="flex items-center justify-between">
                                           <h4 className="font-bold text-gray-900 flex items-center gap-2"><Layers size={16}/> Variant Configuration & Stock</h4>
                                           <div className="flex gap-2">
                                               <button onClick={() => { setEditingProduct(product); setShowModal(true); setActiveTab('variants'); }} className="text-xs font-bold text-blue-600 hover:underline">Manage Variants</button>
                                           </div>
                                       </div>
                                       
                                       <div className="space-y-3">
                                           {product.variants?.map(variant => (
                                               <div key={variant.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                                                   <div 
                                                      className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                                                      onClick={() => setExpandedVariantId(expandedVariantId === variant.id ? null : variant.id)}
                                                   >
                                                       <div className="flex items-center gap-4">
                                                           <div className="w-8 h-8 rounded-full border border-gray-200 shadow-sm" style={{backgroundColor: variant.color}}></div>
                                                           <div>
                                                               <p className="font-bold text-gray-900 text-sm">{variant.storage} <span className="text-gray-400 font-normal">({variant.color})</span></p>
                                                               <p className="text-xs text-gray-500 font-mono">{variant.sku}</p>
                                                           </div>
                                                       </div>
                                                       <div className="flex items-center gap-8">
                                                           <div className="text-right">
                                                               <p className="text-[10px] text-gray-400 uppercase font-bold">Price</p>
                                                               <p className="font-bold text-gray-900 text-sm">{variant.price} KWD</p>
                                                           </div>
                                                           <div className="text-right">
                                                               <p className="text-[10px] text-gray-400 uppercase font-bold">Stock</p>
                                                               <span className={`font-bold text-sm px-2 py-0.5 rounded ${variant.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                                  {variant.stock}
                                                               </span>
                                                           </div>
                                                           <ChevronDown size={16} className={`text-gray-400 transition-transform ${expandedVariantId === variant.id ? 'rotate-180' : ''}`}/>
                                                       </div>
                                                   </div>

                                                   {/* Expanded Inventory Items */}
                                                   {expandedVariantId === variant.id && (
                                                       <div className="border-t border-gray-100 bg-gray-50 p-4">
                                                           <div className="flex justify-between items-center mb-4">
                                                               <h5 className="font-bold text-gray-800 text-xs uppercase flex items-center gap-2"><Fingerprint size={14}/> Tracked Items (IMEI/Serial)</h5>
                                                               <div className="flex gap-2">
                                                                   <button onClick={() => handlePrintAllAvailable(variant)} className="flex items-center gap-1 text-[10px] font-bold bg-white border border-gray-200 px-2 py-1 rounded hover:bg-gray-100"><Barcode size={12}/> Print All Labels</button>
                                                                   <button onClick={() => handlePrintGRN(variant)} className="flex items-center gap-1 text-[10px] font-bold bg-white border border-gray-200 px-2 py-1 rounded hover:bg-gray-100"><FileText size={12}/> Print GRN</button>
                                                               </div>
                                                           </div>

                                                           {/* Add Item Bar */}
                                                           <div className="flex flex-wrap gap-2 items-end mb-4 bg-white p-3 rounded-xl border border-gray-200">
                                                               <div className="flex-1 min-w-[150px]">
                                                                   <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">IMEI / Serial Scan</label>
                                                                   <div className="relative">
                                                                       <ScanLine size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400"/>
                                                                       <input 
                                                                          type="text" 
                                                                          placeholder="Scan..." 
                                                                          className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-primary font-mono"
                                                                          value={newItem.imei}
                                                                          onChange={e => setNewItem({...newItem, imei: e.target.value})}
                                                                          onKeyDown={e => e.key === 'Enter' && handleAddItemToVariant(variant.id)}
                                                                       />
                                                                   </div>
                                                               </div>
                                                               <div className="w-24">
                                                                   <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Cost Price</label>
                                                                   <input type="number" className="w-full p-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none" value={newItem.costPrice} onChange={e => setNewItem({...newItem, costPrice: parseFloat(e.target.value)})} />
                                                               </div>
                                                               <div className="w-32">
                                                                   <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Supplier</label>
                                                                   <select className="w-full p-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none" value={newItem.supplierId} onChange={e => setNewItem({...newItem, supplierId: e.target.value})}>
                                                                       <option value="">None</option>
                                                                       {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                                                   </select>
                                                               </div>
                                                               <button onClick={() => handleAddItemToVariant(variant.id)} className="px-4 py-1.5 bg-green-600 text-white font-bold rounded-lg text-xs hover:bg-green-700 shadow-sm h-[34px]">Add Stock</button>
                                                           </div>

                                                           {/* Inventory Table */}
                                                           {variant.inventory && variant.inventory.length > 0 ? (
                                                               <table className="w-full text-left text-xs">
                                                                   <thead className="text-gray-400 font-bold uppercase bg-gray-100">
                                                                       <tr>
                                                                           <th className="p-2 rounded-l-lg">IMEI / Serial</th>
                                                                           <th className="p-2">Status</th>
                                                                           <th className="p-2">Condition</th>
                                                                           <th className="p-2">Cost</th>
                                                                           <th className="p-2">Location</th>
                                                                           <th className="p-2 rounded-r-lg text-right">Actions</th>
                                                                       </tr>
                                                                   </thead>
                                                                   <tbody className="divide-y divide-gray-100">
                                                                       {variant.inventory.map(item => (
                                                                           <tr key={item.id} className="hover:bg-white transition-colors">
                                                                               <td className="p-2 font-mono text-gray-700 font-bold">{item.imei}</td>
                                                                               <td className="p-2"><span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${item.status === 'Available' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>{item.status}</span></td>
                                                                               <td className="p-2 text-gray-600">{item.condition}</td>
                                                                               <td className="p-2 text-gray-600">{item.costPrice} KWD</td>
                                                                               <td className="p-2 text-gray-500">{warehouses.find(w => w.id === item.locationId)?.name || '-'}</td>
                                                                               <td className="p-2 text-right flex justify-end gap-2">
                                                                                   <button onClick={() => handlePrintItem(item)} className="p-1 hover:bg-gray-200 rounded text-gray-500" title="Print Label"><Barcode size={14}/></button>
                                                                                   <button onClick={() => handleRemoveItemFromVariant(variant.id, item.id)} className="p-1 hover:bg-red-50 rounded text-red-500" title="Remove"><Trash2 size={14}/></button>
                                                                               </td>
                                                                           </tr>
                                                                       ))}
                                                                   </tbody>
                                                               </table>
                                                           ) : (
                                                               <p className="text-center text-gray-400 italic text-sm py-4">No individual items tracked for this variant.</p>
                                                           )}
                                                       </div>
                                                   )}
                                               </div>
                                           ))}
                                           {(!product.variants || product.variants.length === 0) && (
                                               <div className="text-center p-8 bg-white border border-dashed border-gray-300 rounded-xl">
                                                   <p className="text-gray-500 text-sm mb-2">No variants configured.</p>
                                                   <button onClick={() => { setEditingProduct(product); setShowModal(true); setActiveTab('variants'); }} className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-black">Configure Variants</button>
                                               </div>
                                           )}
                                       </div>
                                   </div>
                               </td>
                           </tr>
                       )}
                   </React.Fragment>
                ))}
             </tbody>
          </table>
       </div>

       {/* Edit Modal */}
       {showModal && (
          <div className="fixed inset-0 bg-slate-900/40 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
             <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                   <div>
                      <h2 className="text-xl font-bold text-gray-900">{editingProduct.id ? 'Edit Product' : 'New Product'}</h2>
                      <p className="text-sm text-gray-500">Manage catalog details and inventory.</p>
                   </div>
                   <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-200 rounded-full"><X size={24} className="text-gray-500"/></button>
                </div>
                
                <div className="flex border-b border-gray-100 bg-white sticky top-0 z-10 overflow-x-auto">
                   {[
                      { id: 'basic', label: 'Basic Info', icon: FileText },
                      { id: 'variants', label: 'Variants & Stock', icon: Layers },
                      { id: 'media', label: 'Media', icon: ImageIcon },
                      { id: 'specs', label: 'Specifications', icon: FileCheck },
                      { id: 'seo', label: 'SEO & Metadata', icon: Globe },
                      { id: 'storefront', label: 'Storefront', icon: LayoutTemplate },
                   ].map((tab) => (
                      <button
                         key={tab.id}
                         onClick={() => setActiveTab(tab.id as any)}
                         className={`px-6 py-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${activeTab === tab.id ? 'border-primary text-primary bg-blue-50/50' : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50'}`}
                      >
                         <tab.icon size={16} /> {tab.label}
                      </button>
                   ))}
                </div>

                <div className="flex-1 overflow-y-auto p-8 bg-gray-50/50 custom-scrollbar">
                   {/* Form Content Based on Tab */}
                   <form onSubmit={handleSave} className="space-y-8 max-w-3xl mx-auto">
                      
                      {activeTab === 'basic' && (
                         <div className="space-y-6">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div className="md:col-span-2 relative">
                                     <label className="block text-sm font-bold text-gray-700 mb-2">Product Name (Model)</label>
                                     <div className="flex gap-2">
                                         <input 
                                            name="productName"
                                            ref={fileInputRef as any}
                                            type="text" 
                                            required 
                                            value={editingProduct.name} 
                                            onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} 
                                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary outline-none font-bold text-lg"
                                            placeholder="e.g. iPhone 15 Pro Max"
                                            autoComplete="off"
                                         />
                                         <button 
                                            type="button"
                                            onClick={handleAutoFillBasicInfo}
                                            disabled={aiLoading}
                                            className="px-4 bg-purple-50 text-purple-700 border border-purple-200 rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-purple-100 whitespace-nowrap"
                                         >
                                            {aiLoading ? <Loader2 className="animate-spin" size={16}/> : <Sparkles size={16}/>} Auto-Fill with AI
                                         </button>
                                     </div>
                                     {/* Autocomplete Dropdown */}
                                     {showSuggestions && (
                                         <div ref={autocompleteRef} className="absolute z-50 top-full left-0 w-full bg-white border border-gray-200 rounded-xl shadow-xl mt-1 overflow-hidden">
                                             {suggestionLoading && <div className="p-3 text-center text-gray-400 text-xs">Searching models...</div>}
                                             {suggestions.map((s, i) => (
                                                 <div 
                                                    key={i} 
                                                    className="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-0 flex justify-between items-center"
                                                    onClick={() => handleModelSelect(s)}
                                                 >
                                                     <div>
                                                         <p className="text-sm font-bold text-gray-800">{s.model}</p>
                                                         <p className="text-xs text-gray-500">{s.brand} • {s.year}</p>
                                                     </div>
                                                     <div className="flex gap-1">
                                                         {s.variants.slice(0, 3).map(v => <span key={v} className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">{v}</span>)}
                                                     </div>
                                                 </div>
                                             ))}
                                         </div>
                                     )}
                                  </div>
                                  <div>
                                     <label className="block text-sm font-bold text-gray-700 mb-2">Brand</label>
                                     <input type="text" list="brands" value={editingProduct.brand} onChange={e => setEditingProduct({...editingProduct, brand: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary outline-none" />
                                     <datalist id="brands"><option value="Apple"/><option value="Samsung"/><option value="Xiaomi"/><option value="Google"/><option value="Sony"/></datalist>
                                  </div>
                                  <div>
                                     <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                                     <select value={editingProduct.category} onChange={e => setEditingProduct({...editingProduct, category: e.target.value as any})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary outline-none">
                                        <option value="Smartphones">Smartphones</option>
                                        <option value="Tablets">Tablets</option>
                                        <option value="Wearables">Wearables</option>
                                        <option value="Audio">Audio</option>
                                        <option value="Accessories">Accessories</option>
                                     </select>
                                  </div>
                                  <div>
                                     <label className="block text-sm font-bold text-gray-700 mb-2">Base Price (KWD)</label>
                                     <div className="relative">
                                        <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                                        <input type="number" required value={editingProduct.price} onChange={e => setEditingProduct({...editingProduct, price: parseFloat(e.target.value)})} className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary outline-none font-mono" />
                                     </div>
                                  </div>
                                  <div>
                                     <label className="block text-sm font-bold text-gray-700 mb-2">Cost Price (Avg)</label>
                                     <input type="number" value={editingProduct.costPrice || 0} onChange={e => setEditingProduct({...editingProduct, costPrice: parseFloat(e.target.value)})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary outline-none font-mono" />
                                  </div>
                               </div>
                               <div className="mt-6">
                                  <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                                  <textarea value={editingProduct.description} onChange={e => setEditingProduct({...editingProduct, description: e.target.value})} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary outline-none h-32 resize-none" placeholder="Product marketing copy..."></textarea>
                               </div>
                               
                               <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                                   <label className="flex items-center gap-3 cursor-pointer">
                                       <input 
                                          type="checkbox" 
                                          checked={editingProduct.imeiTracking} 
                                          onChange={e => setEditingProduct({...editingProduct, imeiTracking: e.target.checked})}
                                          className="w-5 h-5 rounded text-primary focus:ring-primary border-gray-300" 
                                       />
                                       <div>
                                           <span className="font-bold text-gray-900 block text-sm">Enable IMEI / Serial Tracking</span>
                                           <span className="text-xs text-gray-500">Require individual scanning for each unit in inventory. Essential for phones.</span>
                                       </div>
                                   </label>
                               </div>
                            </div>
                            
                            {/* Stock Snapshot */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                                <div>
                                    <h4 className="font-bold text-gray-900">Total Stock Level</h4>
                                    <p className="text-xs text-gray-500">Sum of all variants</p>
                                </div>
                                <div className="text-3xl font-black text-gray-900">
                                    {editingProduct.variants?.reduce((acc, v) => acc + (v.stock || 0), 0) || editingProduct.stock || 0}
                                </div>
                            </div>
                         </div>
                      )}

                      {/* Variants Tab */}
                      {activeTab === 'variants' && (
                         <div className="space-y-8">
                            {/* Attribute Builder */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Palette size={20}/> Attribute Builder</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Colors */}
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Colors</label>
                                        <div className="flex gap-2 mb-3 flex-wrap">
                                            {editingProduct.colors?.map(c => (
                                                <div key={c} className="flex items-center gap-2 bg-gray-100 pl-2 pr-1 py-1 rounded-lg border border-gray-200">
                                                    <div className="w-3 h-3 rounded-full border border-gray-300" style={{backgroundColor: c}}></div>
                                                    <span className="text-xs font-bold text-gray-700">{c}</span>
                                                    <button type="button" onClick={() => setEditingProduct(prev => ({...prev, colors: prev.colors?.filter(col => col !== c)}))} className="p-0.5 hover:bg-gray-200 rounded"><X size={12}/></button>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex gap-2">
                                            <input 
                                                type="text" 
                                                value={colorInput} 
                                                onChange={e => setColorInput(e.target.value)} 
                                                onKeyDown={addColor}
                                                placeholder="Type color (e.g. Blue)" 
                                                className="flex-1 p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none"
                                            />
                                            <button type="button" onClick={addColor} className="px-4 py-2 bg-gray-900 text-white rounded-lg font-bold text-xs">Add</button>
                                        </div>
                                    </div>

                                    {/* Storage */}
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Storage Options</label>
                                        <div className="flex gap-2 mb-3 flex-wrap">
                                            {editingProduct.storageOptions?.map(s => (
                                                <div key={s} className="flex items-center gap-2 bg-gray-100 pl-2 pr-1 py-1 rounded-lg border border-gray-200">
                                                    <span className="text-xs font-bold text-gray-700">{s}</span>
                                                    <button type="button" onClick={() => setEditingProduct(prev => ({...prev, storageOptions: prev.storageOptions?.filter(opt => opt !== s)}))} className="p-0.5 hover:bg-gray-200 rounded"><X size={12}/></button>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex gap-2">
                                            <input 
                                                type="text" 
                                                value={storageInput} 
                                                onChange={e => setStorageInput(e.target.value)} 
                                                onKeyDown={addStorage}
                                                placeholder="Type storage (e.g. 128GB)" 
                                                className="flex-1 p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none"
                                            />
                                            <button type="button" onClick={addStorage} className="px-4 py-2 bg-gray-900 text-white rounded-lg font-bold text-xs">Add</button>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-6 pt-6 border-t border-gray-100">
                                    <button 
                                        type="button"
                                        onClick={generateVariants}
                                        className="w-full py-3 bg-blue-50 text-blue-700 font-bold rounded-xl border border-blue-100 hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Wand2 size={18}/> Generate Variant Matrix
                                    </button>
                                </div>
                            </div>

                            {/* Matrix Table */}
                            {editingProduct.variants && editingProduct.variants.length > 0 && (
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase">
                                                <tr>
                                                    <th className="p-4">Variant</th>
                                                    <th className="p-4">SKU</th>
                                                    <th className="p-4">Price (KWD)</th>
                                                    <th className="p-4">Stock</th>
                                                    <th className="p-4"></th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {editingProduct.variants.map((v, idx) => (
                                                    <React.Fragment key={v.id}>
                                                        <tr className="hover:bg-gray-50 transition-colors group">
                                                            <td className="p-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-6 h-6 rounded-full border border-gray-200 shadow-sm" style={{backgroundColor: v.color}}></div>
                                                                    <div>
                                                                        <p className="font-bold text-gray-900 text-sm">{v.storage}</p>
                                                                        <p className="text-xs text-gray-500">{v.color}</p>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="p-4">
                                                                <input 
                                                                    type="text" 
                                                                    value={v.sku} 
                                                                    onChange={e => {
                                                                        const newVars = [...(editingProduct.variants || [])];
                                                                        newVars[idx] = { ...v, sku: e.target.value };
                                                                        setEditingProduct({...editingProduct, variants: newVars});
                                                                    }}
                                                                    className="w-32 p-1.5 bg-gray-50 border border-gray-200 rounded text-xs font-mono focus:border-primary outline-none"
                                                                />
                                                            </td>
                                                            <td className="p-4">
                                                                <input 
                                                                    type="number" 
                                                                    value={v.price} 
                                                                    onChange={e => {
                                                                        const newVars = [...(editingProduct.variants || [])];
                                                                        newVars[idx] = { ...v, price: parseFloat(e.target.value) };
                                                                        setEditingProduct({...editingProduct, variants: newVars});
                                                                    }}
                                                                    className={`w-24 p-1.5 border rounded text-sm font-bold focus:border-primary outline-none ${v.price !== editingProduct.price ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200'}`}
                                                                />
                                                            </td>
                                                            <td className="p-4">
                                                                {editingProduct.imeiTracking ? (
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="relative">
                                                                            <input 
                                                                                type="number" 
                                                                                value={v.stock} 
                                                                                readOnly
                                                                                className="w-20 p-1.5 bg-gray-100 border border-gray-200 rounded text-sm font-bold text-gray-500 cursor-not-allowed pl-7"
                                                                            />
                                                                            <Lock size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400"/>
                                                                        </div>
                                                                        <button 
                                                                            type="button" 
                                                                            onClick={() => setExpandedVariantId(expandedVariantId === v.id ? null : v.id)}
                                                                            className="px-2 py-1.5 bg-blue-50 text-blue-600 rounded text-xs font-bold border border-blue-100 hover:bg-blue-100"
                                                                        >
                                                                            Manage IMEIs
                                                                        </button>
                                                                    </div>
                                                                ) : (
                                                                    <input 
                                                                        type="number" 
                                                                        value={v.stock} 
                                                                        onChange={e => {
                                                                            const newVars = [...(editingProduct.variants || [])];
                                                                            newVars[idx] = { ...v, stock: parseInt(e.target.value) };
                                                                            setEditingProduct({...editingProduct, variants: newVars});
                                                                        }}
                                                                        className={`w-20 p-1.5 border rounded text-sm font-bold focus:border-primary outline-none ${v.stock > 0 ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}
                                                                    />
                                                                )}
                                                            </td>
                                                            <td className="p-4 text-right">
                                                                <button 
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const newVars = editingProduct.variants?.filter((_, i) => i !== idx);
                                                                        setEditingProduct({...editingProduct, variants: newVars});
                                                                    }}
                                                                    className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded transition-colors"
                                                                >
                                                                    <Trash2 size={16}/>
                                                                </button>
                                                            </td>
                                                        </tr>
                                                        {/* Expanded Inventory Logic */}
                                                        {expandedVariantId === v.id && editingProduct.imeiTracking && (
                                                            <tr>
                                                                <td colSpan={5} className="p-0 bg-blue-50/20 border-b border-gray-200">
                                                                    <div className="p-4 space-y-4">
                                                                        <div className="flex justify-between items-start">
                                                                            <h5 className="font-bold text-gray-800 text-xs uppercase flex items-center gap-2"><Fingerprint size={14}/> Unit Inventory ({v.inventory?.length || 0})</h5>
                                                                            <div className="flex gap-2">
                                                                                <button onClick={() => handlePrintAllAvailable(v)} className="flex items-center gap-1 text-[10px] font-bold bg-white border border-gray-200 px-2 py-1 rounded hover:bg-gray-100"><Barcode size={12}/> Labels</button>
                                                                            </div>
                                                                        </div>
                                                                        
                                                                        {/* Bulk Paste */}
                                                                        <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                                                                            <div className="flex justify-between mb-2">
                                                                                <label className="text-[10px] font-bold text-gray-500 uppercase">Bulk Add IMEIs</label>
                                                                                <span className="text-[10px] bg-blue-100 text-blue-700 px-2 rounded font-bold">Fast Entry</span>
                                                                            </div>
                                                                            <textarea 
                                                                                value={bulkPasteInput}
                                                                                onChange={e => setBulkPasteInput(e.target.value)}
                                                                                className="w-full p-2 border border-gray-300 rounded-lg text-xs font-mono mb-2 h-20 resize-none focus:border-primary outline-none"
                                                                                placeholder="Paste list of 50+ IMEIs here..."
                                                                            ></textarea>
                                                                            <div className="flex justify-end">
                                                                                <button 
                                                                                    type="button" 
                                                                                    onClick={() => handleBulkPaste(v.id)}
                                                                                    disabled={!bulkPasteInput}
                                                                                    className="px-4 py-1.5 bg-blue-600 text-white font-bold rounded-lg text-xs hover:bg-blue-700 disabled:opacity-50"
                                                                                >
                                                                                    Add Bulk Items
                                                                                </button>
                                                                            </div>
                                                                        </div>

                                                                        {/* List */}
                                                                        <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg bg-white">
                                                                            <table className="w-full text-left text-xs">
                                                                                <thead className="bg-gray-50 sticky top-0">
                                                                                    <tr><th className="p-2">IMEI</th><th className="p-2">Status</th><th className="p-2">Cost</th><th className="p-2 text-right">Action</th></tr>
                                                                                </thead>
                                                                                <tbody className="divide-y divide-gray-100">
                                                                                    {v.inventory?.map(i => (
                                                                                        <tr key={i.id}>
                                                                                            <td className="p-2 font-mono">{i.imei}</td>
                                                                                            <td className="p-2"><span className={`px-1 rounded ${i.status === 'Available' ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>{i.status}</span></td>
                                                                                            <td className="p-2">{i.costPrice}</td>
                                                                                            <td className="p-2 text-right"><button type="button" onClick={() => handleRemoveItemFromVariant(v.id, i.id)} className="text-red-500 hover:text-red-700"><Trash2 size={12}/></button></td>
                                                                                        </tr>
                                                                                    ))}
                                                                                </tbody>
                                                                            </table>
                                                                        </div>
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
                            )}
                         </div>
                      )}

                      {/* Media Tab */}
                      {activeTab === 'media' && (
                         <div className="space-y-6">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <div className="flex gap-4 mb-6">
                                    <button type="button" onClick={() => setImageTab('fetch')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${imageTab === 'fetch' ? 'bg-slate-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>AI Search</button>
                                    <button type="button" onClick={() => setImageTab('upload')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${imageTab === 'upload' ? 'bg-slate-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Upload File</button>
                                    <button type="button" onClick={() => setImageTab('url')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${imageTab === 'url' ? 'bg-slate-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Direct URL</button>
                                </div>
                                {imageTab === 'fetch' && (
                                    <div className="space-y-4">
                                        <div className="flex gap-2">
                                            <input 
                                                type="text" 
                                                value={imageSearchQuery}
                                                onChange={e => setImageSearchQuery(e.target.value)}
                                                placeholder="Enter product name + color..." 
                                                className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary"
                                            />
                                            <button 
                                                type="button"
                                                onClick={handleFindImages}
                                                disabled={aiLoading}
                                                className="px-6 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
                                            >
                                                {aiLoading ? <Loader2 className="animate-spin" size={18}/> : 'Search'}
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                                            {foundImages.map((url, i) => (
                                                <div 
                                                    key={i} 
                                                    onClick={() => handleAddImage(url)}
                                                    className={`group relative aspect-square bg-gray-50 rounded-xl border-2 cursor-pointer overflow-hidden transition-all ${editingProduct.images?.includes(url) ? 'border-green-500 ring-2 ring-green-200' : 'border-gray-200 hover:border-primary'}`}
                                                >
                                                    <img src={url} className="w-full h-full object-contain p-2" />
                                                    {editingProduct.images?.includes(url) && (
                                                        <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                                                            <CheckCircle className="text-green-600 drop-shadow-md" size={32} />
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {imageTab === 'upload' && (
                                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:bg-gray-50 transition-colors">
                                        <input type="file" className="hidden" id="file-upload" accept="image/*" onChange={handleFileUpload} />
                                        <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-4">
                                            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                                                {uploadingImage ? <Loader2 className="animate-spin" size={32}/> : <Upload size={32}/>}
                                            </div>
                                            <div><p className="font-bold text-gray-900">Click to upload</p></div>
                                        </label>
                                    </div>
                                )}
                                {imageTab === 'url' && (
                                    <div className="flex gap-2">
                                        <input type="text" value={imageUrlInput} onChange={e => setImageUrlInput(e.target.value)} placeholder="Paste image URL..." className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary"/>
                                        <button type="button" onClick={() => { handleAddImage(imageUrlInput); setImageUrlInput(''); }} className="px-6 bg-slate-900 text-white font-bold rounded-xl hover:bg-black transition-colors">Add</button>
                                    </div>
                                )}
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <h3 className="font-bold text-gray-900 mb-4">Gallery ({editingProduct.images?.length || 0})</h3>
                                <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                                    {editingProduct.images?.map((url, i) => (
                                        <div key={i} className="relative group aspect-square bg-gray-50 rounded-xl border border-gray-200 p-2">
                                            <img src={url} className="w-full h-full object-contain" />
                                            <button type="button" onClick={() => handleRemoveImage(i)} className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-md"><Trash2 size={14}/></button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                         </div>
                      )}

                      {/* Specs Tab */}
                      {activeTab === 'specs' && (
                         <div className="space-y-6">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                {Object.entries(editingProduct.specs || {}).map(([category, data]) => renderSpecGroup(category, data))}
                                <button type="button" onClick={() => setEditingProduct(prev => ({ ...prev, specs: { ...prev.specs, 'New Category': { 'Feature': '' } } }))} className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 font-bold hover:bg-gray-50 hover:border-gray-300 transition-colors">+ Add Category</button>
                            </div>
                         </div>
                      )}

                      {/* SEO Tab */}
                      {activeTab === 'seo' && (
                         <div className="space-y-6">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="font-bold text-gray-900">Search Engine Optimization</h3>
                                    <button type="button" onClick={handleGenerateSEO} disabled={aiLoading} className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:opacity-90 transition-opacity text-xs flex items-center gap-2">{aiLoading ? <Loader2 className="animate-spin" size={14}/> : <Sparkles size={14}/>} Generate with AI</button>
                                </div>
                                <div className="space-y-4">
                                    <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Meta Title</label><input type="text" value={editingProduct.seo?.metaTitle} onChange={e => setEditingProduct({...editingProduct, seo: {...editingProduct.seo, metaTitle: e.target.value}})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary outline-none" /></div>
                                    <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Meta Description</label><textarea value={editingProduct.seo?.metaDescription} onChange={e => setEditingProduct({...editingProduct, seo: {...editingProduct.seo, metaDescription: e.target.value}})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary outline-none h-24 resize-none"></textarea></div>
                                </div>
                            </div>
                         </div>
                      )}

                      {/* Storefront Tab */}
                      {activeTab === 'storefront' && (
                         <div className="space-y-6">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <h3 className="font-bold text-gray-900 mb-6">Homepage Display Settings</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                                    <label className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${editingProduct.isHero ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                                        <div className="flex justify-between items-start mb-2"><span className="font-bold text-gray-900">Hero Slider</span><input type="checkbox" checked={editingProduct.isHero} onChange={e => setEditingProduct({...editingProduct, isHero: e.target.checked})} className="w-5 h-5 accent-blue-600"/></div>
                                        <p className="text-xs text-gray-500">Feature in the main top banner.</p>
                                    </label>
                                    <label className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${editingProduct.isFeatured ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300'}`}>
                                        <div className="flex justify-between items-start mb-2"><span className="font-bold text-gray-900">Featured Rail</span><input type="checkbox" checked={editingProduct.isFeatured} onChange={e => setEditingProduct({...editingProduct, isFeatured: e.target.checked})} className="w-5 h-5 accent-purple-600"/></div>
                                        <p className="text-xs text-gray-500">Show in "Recommended" section.</p>
                                    </label>
                                    <label className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${editingProduct.isTicker ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}>
                                        <div className="flex justify-between items-start mb-2"><span className="font-bold text-gray-900">Live Ticker</span><input type="checkbox" checked={editingProduct.isTicker} onChange={e => setEditingProduct({...editingProduct, isTicker: e.target.checked})} className="w-5 h-5 accent-green-600"/></div>
                                        <p className="text-xs text-gray-500">Scroll in the marquee bar.</p>
                                    </label>
                                </div>
                            </div>
                         </div>
                      )}

                      {/* Sticky Footer Actions */}
                      <div className="sticky bottom-0 bg-white border-t border-gray-100 p-6 -mx-8 -mb-8 flex justify-end gap-3 z-20">
                         <button type="button" onClick={() => setShowModal(false)} className="px-8 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
                         <button type="submit" className="px-8 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-black transition-colors shadow-lg flex items-center gap-2">
                            <SaveIcon size={18} /> Save Product
                         </button>
                      </div>
                   </form>
                </div>
             </div>
          </div>
       )}

       {/* Label Print Modal */}
       {showPrintModal && (
           <div className="fixed inset-0 bg-slate-900/40 z-[70] flex items-center justify-center p-4 backdrop-blur-sm">
               <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
                   <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Printer size={20}/> Print Labels</h3>
                   <div className="space-y-4">
                       <div>
                           <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Label Size</label>
                           <select 
                               value={printConfig.labelSize}
                               onChange={e => setPrintConfig({...printConfig, labelSize: e.target.value})}
                               className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none"
                           >
                               <option value="standard">Standard (38x25mm)</option>
                               <option value="large">Large (50x30mm)</option>
                           </select>
                       </div>
                       <div className="space-y-2">
                           <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-50 rounded-lg">
                               <input type="checkbox" checked={printConfig.showPrice} onChange={e => setPrintConfig({...printConfig, showPrice: e.target.checked})} className="rounded text-primary"/>
                               <span className="text-sm font-medium">Show Price</span>
                           </label>
                           <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-50 rounded-lg">
                               <input type="checkbox" checked={printConfig.showBarcode} onChange={e => setPrintConfig({...printConfig, showBarcode: e.target.checked})} className="rounded text-primary"/>
                               <span className="text-sm font-medium">Show Barcode</span>
                           </label>
                       </div>
                       <div>
                           <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Quantity</label>
                           <input type="number" min="1" value={printConfig.quantity} onChange={e => setPrintConfig({...printConfig, quantity: parseInt(e.target.value)})} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none"/>
                       </div>
                   </div>
                   <div className="flex gap-3 mt-4">
                       <button onClick={() => setShowPrintModal(false)} className="flex-1 py-2.5 bg-gray-100 font-bold text-gray-600 rounded-xl hover:bg-gray-200">Cancel</button>
                       <button onClick={() => {
                           const w = window.open('', '_blank', 'width=600,height=600');
                           if(w) {
                               w.document.write(`<html><head><style>body{font-family:monospace;text-align:center}.label{border:1px dashed #ccc;padding:10px;margin:10px;display:inline-block;width:200px;height:120px}</style></head><body>`);
                               for(let i=0; i<printConfig.quantity; i++) {
                                   w.document.write(`<div class="label"><strong>${editingProduct.name}</strong><br/>${printConfig.specificItem?.imei || editingProduct.sku}<br/>${printConfig.showPrice ? editingProduct.price + ' KWD' : ''}</div>`);
                               }
                               w.document.write(`</body></html>`);
                               w.document.close();
                               w.print();
                           }
                           setShowPrintModal(false);
                       }} className="flex-1 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-black shadow-lg">Print Now</button>
                   </div>
               </div>
           </div>
       )}
    </div>
  );
};
