
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { Star, Plus, ShieldCheck, Zap, Heart, Truck, Check, Share2, Info, ArrowRight, Minus, ArrowLeftRight, ShoppingBag, CheckCircle, AlertCircle, Package, Clock, CreditCard, ChevronRight, PlayCircle, Maximize2, MessageCircle, Layers, Cpu, Battery, Smartphone, ScanLine } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { SkeletonProductDetails } from '../components/SkeletonLoader';

export const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { products, addToCart, toggleWishlist, isInWishlist, addToRecentlyViewed, addReview, user, addToCompare, isInCompare, removeFromCompare, showToast, appSettings, isLoading } = useShop();
  const navigate = useNavigate();
  
  const product = products.find(p => p.id === id);
  
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedStorage, setSelectedStorage] = useState<string>('');
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [currentStock, setCurrentStock] = useState<number>(0);

  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  
  // IMEI Tracking State (For Admin/Sales only)
  const [imeiList, setImeiList] = useState<string[]>([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    setQuantity(1);
    if (product) {
      // Default to empty strings to force user selection if options exist
      // Only auto-select if there is exactly one option
      let initialColor = product.colors && product.colors.length === 1 ? product.colors[0] : '';
      let initialStorage = product.storageOptions && product.storageOptions.length === 1 ? product.storageOptions[0] : '';

      // If already has variants logic from before, respect it but prefer force selection for better UX on complex items
      if (initialColor && initialStorage) {
          updateVariantInfo(initialColor, initialStorage);
      } else {
          setCurrentPrice(product.price);
          setCurrentStock(product.stock);
      }
      
      setSelectedColor(initialColor);
      setSelectedStorage(initialStorage);
      
      addToRecentlyViewed(product);
    }
  }, [id, product]);

  // Sync IMEI input list size with quantity
  useEffect(() => {
      setImeiList(prev => {
          if (quantity > prev.length) return [...prev, ...Array(quantity - prev.length).fill('')];
          return prev.slice(0, quantity);
      });
  }, [quantity]);

  const updateVariantInfo = (color: string, storage: string) => {
      if(!product) return;

      // Find specific variant matching color AND storage
      if(product.variants && product.variants.length > 0) {
          const variant = product.variants.find(v => v.color === color && v.storage === storage);
          if (variant) {
              setCurrentPrice(variant.price);
              setCurrentStock(variant.stock);
          } else {
              // Combination doesn't exist in matrix (e.g. Pink 1TB)
              setCurrentPrice(product.price);
              setCurrentStock(0); 
          }
      } else {
          // No variants defined, use base product info
          setCurrentPrice(product.price);
          setCurrentStock(product.stock);
      }
  };

  const handleColorChange = (color: string) => {
      setSelectedColor(color);
      // Check if current storage is valid for new color, if not switch to first valid storage
      if (product?.variants && product.variants.length > 0) {
         const validForNewColor = isVariantValid(color, selectedStorage);
         if (!validForNewColor) {
             const firstValidStorage = product.storageOptions?.find(s => isVariantValid(color, s));
             if (firstValidStorage) {
                 setSelectedStorage(firstValidStorage);
                 updateVariantInfo(color, firstValidStorage);
                 return;
             }
         }
      }
      if (selectedStorage) updateVariantInfo(color, selectedStorage);
  };

  const handleStorageChange = (storage: string) => {
      setSelectedStorage(storage);
      if (selectedColor) updateVariantInfo(selectedColor, storage);
  };

  const isVariantValid = (color: string, storage: string) => {
     if (!product?.variants || product.variants.length === 0) return true;
     // Check if this combination exists in the matrix at all
     return product.variants.some(v => v.color === color && v.storage === storage);
  };

  const isVariantInStock = (color: string, storage: string) => {
     if (!product?.variants || product.variants.length === 0) return product && product.stock > 0;
     const variant = product.variants.find(v => v.color === color && v.storage === storage);
     return variant && variant.stock > 0;
  };

  const isSelectionComplete = () => {
      if (!product) return false;
      const needsColor = product.colors && product.colors.length > 0;
      const needsStorage = product.storageOptions && product.storageOptions.length > 0;
      
      if (needsColor && !selectedColor) return false;
      if (needsStorage && !selectedStorage) return false;
      return true;
  };

  const handleAddToCart = () => {
      if(!product) return;
      if (!isSelectionComplete()) {
          showToast('Please select Color and Storage first.', 'info');
          return;
      }
      if (quantity > currentStock) {
         showToast(`Only ${currentStock} units available for this selection.`, 'error');
         return;
      }
      
      // Pass the specific variant details to cart
      addToCart({
          ...product, 
          price: currentPrice,
          selectedColor, 
          selectedStorage,
          scannedImeis: imeiList.filter(i => i.trim() !== '') // Attach entered IMEIs
      });
  };

  const handleBuyNow = () => {
    if(!product) return;
    if (!isSelectionComplete()) {
        showToast('Please select Color and Storage first.', 'info');
        return;
    }
    if (quantity > currentStock) {
       showToast(`Only ${currentStock} available.`, 'error');
       return;
    }
    handleAddToCart();
    navigate('/checkout');
  };

  const handleWhatsAppBuy = () => {
      if (!product) return;
      if (!isSelectionComplete()) {
          showToast('Please select Color and Storage options.', 'info');
          return;
      }
      
      const phone = appSettings.supportPhone.replace(/[^0-9]/g, '');
      if (!phone) {
          showToast('Support phone number not configured', 'error');
          return;
      }

      const message = `Hi LAKKI PHONES, I'm interested in buying:
*${product.name}*
Color: ${selectedColor}
Storage: ${selectedStorage}
Price: ${currentPrice} KWD
Quantity: ${quantity}

Link: ${window.location.href}`;

      const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank');
  };

  const handleImeiChange = (index: number, val: string) => {
      const newList = [...imeiList];
      newList[index] = val;
      setImeiList(newList);
  };

  if (isLoading) return <SkeletonProductDetails />;
  
  if (!product) return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-4">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <ShoppingBag size={40} className="text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
          <p className="text-gray-500 mb-8">This item may have been removed or is unavailable.</p>
          <Link to="/shop" className="px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-slate-800 transition-colors">
              Back to Shop
          </Link>
      </div>
  );

  const inStock = currentStock > 0;
  const isStaff = user && (user.role === 'Admin' || user.role === 'Super Admin' || user.role === 'Sales');

  return (
    <div className="min-h-screen bg-gray-50/50 pb-24 md:pb-20 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
            
            {/* Gallery */}
            <div className="lg:col-span-5">
              <div className="sticky top-28 space-y-4">
                 <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative group">
                    <div className="aspect-square p-10 flex items-center justify-center bg-white relative">
                       <img 
                         src={product.images?.[selectedImageIndex] || product.image || `https://picsum.photos/seed/${product.imageSeed}/800/800`} 
                         alt={product.name}
                         className="w-full h-full object-contain hover:scale-105 transition-transform duration-700 ease-out" 
                       />
                    </div>
                 </div>
                 <div className="grid grid-cols-5 gap-3">
                    {product.images?.map((img, i) => (
                        <div 
                            key={i} 
                            onClick={() => setSelectedImageIndex(i)}
                            className={`aspect-square rounded-xl p-2 cursor-pointer transition-all bg-white border flex items-center justify-center ${selectedImageIndex === i ? 'border-primary ring-2 ring-primary/20' : 'border-gray-200 hover:border-gray-300'}`}
                        >
                            <img src={img} className="w-full h-full object-contain" />
                        </div>
                    ))}
                 </div>
              </div>
            </div>

            {/* Info */}
            <div className="lg:col-span-4 space-y-8">
               <div>
                  <h1 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight mb-2">{product.name}</h1>
                  <div className="flex items-center gap-4 text-sm">
                     <span className="text-xs font-bold text-primary bg-blue-50 px-2.5 py-1 rounded-md uppercase tracking-wider">{product.brand}</span>
                     <div className="flex items-center gap-1">
                        <Star size={16} className="fill-secondary text-secondary"/>
                        <span className="font-bold text-gray-900">{product.rating}</span>
                     </div>
                  </div>
               </div>

               <div className="h-px bg-gray-100"></div>

               {/* Dynamic Pricing Display */}
               <div className="flex flex-col">
                  <span className="text-sm text-gray-500 font-bold">Current Configuration Price</span>
                  <div className="flex items-baseline gap-3">
                     <span className="text-4xl font-black text-primary transition-all duration-300">{currentPrice.toLocaleString()} <span className="text-lg">KWD</span></span>
                     {product.originalPrice && <span className="text-lg text-gray-400 line-through font-medium">{product.originalPrice} KWD</span>}
                  </div>
                  {product.monthlyPrice && (
                      <p className="text-xs text-blue-600 font-medium mt-1 bg-blue-50 px-2 py-1 rounded-md inline-block w-fit">
                          Installments from {product.monthlyPrice} KWD/mo
                      </p>
                  )}
               </div>

               {/* Description Snippet */}
               <p className="text-gray-600 leading-relaxed text-sm">
                   {product.description}
               </p>

               {/* Configuration */}
               <div className="space-y-6 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  {/* Colors */}
                  {product.colors && product.colors.length > 0 && (
                     <div>
                        <div className="flex justify-between mb-3">
                            <span className="text-sm font-bold text-gray-900">Color: <span className="text-primary">{selectedColor || 'Select Color'}</span></span>
                        </div>
                        <div className="flex gap-3 flex-wrap">
                           {product.colors.map((color) => {
                              const valid = isVariantValid(color, selectedStorage);
                              const available = isVariantInStock(color, selectedStorage);
                              return (
                                <button
                                    key={color}
                                    onClick={() => handleColorChange(color)}
                                    className={`w-12 h-12 rounded-full shadow-sm flex items-center justify-center border-2 relative transition-all
                                    ${selectedColor === color ? 'border-primary ring-2 ring-primary/20 scale-110' : 'border-gray-200 hover:border-gray-300'}
                                    ${!available && valid ? 'opacity-50' : ''}
                                    `}
                                    style={{ backgroundColor: color }}
                                    title={color}
                                >
                                    {selectedColor === color && <Check size={18} className="text-white drop-shadow-md mix-blend-difference" />}
                                    {!available && valid && <div className="absolute inset-0 flex items-center justify-center"><div className="w-full h-0.5 bg-gray-500 rotate-45"></div></div>}
                                </button>
                              );
                           })}
                        </div>
                     </div>
                  )}

                  {/* Storage */}
                  {product.storageOptions && product.storageOptions.length > 0 && (
                      <div>
                         <div className="flex justify-between mb-3">
                            <span className="text-sm font-bold text-gray-900">Storage: <span className="text-primary">{selectedStorage || 'Select Storage'}</span></span>
                         </div>
                         <div className="grid grid-cols-3 gap-3">
                            {product.storageOptions.map((storage) => {
                               const valid = isVariantValid(selectedColor, storage);
                               const available = isVariantInStock(selectedColor, storage);
                               return (
                                <button 
                                    key={storage}
                                    onClick={() => handleStorageChange(storage)}
                                    disabled={!valid}
                                    className={`py-3 px-2 rounded-xl text-sm font-bold border transition-all relative overflow-hidden
                                    ${selectedStorage === storage ? 'border-primary bg-blue-50 text-primary ring-1 ring-primary/30' : 'border-gray-200 text-gray-600 hover:border-gray-300 bg-white'}
                                    ${!valid ? 'opacity-40 cursor-not-allowed bg-gray-50 decoration-slate-400' : ''}
                                    `}
                                >
                                    {storage}
                                    {(!available && valid) && <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full m-1"></span>}
                                </button>
                               );
                            })}
                         </div>
                      </div>
                  )}
               </div>
            </div>

            {/* Actions (Sticky) */}
            <div className="lg:col-span-3">
               <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 sticky top-28">
                  <div className="space-y-4 mb-8">
                     {inStock ? (
                        <div className="flex items-center gap-2 text-green-700 bg-green-50 p-3 rounded-xl border border-green-100">
                           <CheckCircle size={18} />
                           <div>
                               <p className="text-sm font-bold">In Stock</p>
                               <p className="text-xs">{currentStock} units available</p>
                           </div>
                        </div>
                     ) : (
                        <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-xl border border-red-100">
                           <AlertCircle size={18} />
                           <div>
                               <p className="text-sm font-bold">Sold Out</p>
                               <p className="text-xs">This configuration is unavailable</p>
                           </div>
                        </div>
                     )}
                  </div>

                  <div className="space-y-4">
                     <div className="flex items-center gap-4">
                        <span className="text-sm font-bold text-gray-700">Qty:</span>
                        <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50 w-full">
                           <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-l-xl transition-colors text-gray-600" disabled={!inStock}><Minus size={16}/></button>
                           <span className="flex-1 text-center font-bold text-gray-900 text-sm bg-white h-10 flex items-center justify-center border-x border-gray-200">{quantity}</span>
                           <button onClick={() => setQuantity(Math.min(currentStock, quantity + 1))} className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-r-xl transition-colors text-gray-600" disabled={!inStock}><Plus size={16}/></button>
                        </div>
                     </div>

                     {/* Staff Only: IMEI Entry */}
                     {isStaff && product.imeiTracking && (
                         <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                             <div className="flex items-center gap-2 mb-2 text-xs font-bold text-slate-700">
                                 <ScanLine size={14}/> Enter IMEIs (Staff Only)
                             </div>
                             <div className="space-y-2">
                                 {imeiList.map((imei, idx) => (
                                     <input 
                                        key={idx}
                                        type="text" 
                                        value={imei}
                                        onChange={(e) => handleImeiChange(idx, e.target.value)}
                                        className="w-full p-2 bg-white border border-gray-200 rounded-lg text-xs outline-none focus:border-primary font-mono"
                                        placeholder={`Device #${idx + 1} IMEI/SN`}
                                     />
                                 ))}
                             </div>
                         </div>
                     )}

                     <button onClick={handleBuyNow} disabled={!inStock || !isSelectionComplete()} className="w-full py-4 bg-secondary text-primary font-black rounded-xl hover:bg-amber-400 transition-all shadow-lg shadow-secondary/20 disabled:opacity-50 disabled:cursor-not-allowed">
                        {isSelectionComplete() ? 'Buy Now' : 'Select Options'}
                     </button>
                     <button onClick={handleAddToCart} disabled={!inStock || !isSelectionComplete()} className="w-full py-4 bg-primary text-white font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                        <ShoppingBag size={18}/> Add to Cart
                     </button>
                     
                     <div className="relative flex items-center justify-center py-2">
                        <div className="h-px bg-gray-200 w-full absolute"></div>
                        <span className="bg-white px-2 text-xs text-gray-400 relative font-medium">OR</span>
                     </div>

                     <button 
                        onClick={handleWhatsAppBuy}
                        className="w-full py-3 bg-[#25D366] text-white font-bold rounded-xl hover:bg-[#128c7e] transition-all shadow-lg shadow-green-200 flex items-center justify-center gap-2"
                     >
                        <MessageCircle size={20} /> Buy via WhatsApp
                     </button>
                  </div>
               </div>
            </div>
        </div>

        {/* Specifications Section */}
        {product.specs && Object.keys(product.specs).length > 0 && (
            <div className="max-w-5xl mx-auto mb-16">
                <div className="flex items-center gap-3 mb-8">
                    <Layers className="text-primary" size={28} />
                    <h2 className="text-2xl font-black text-gray-900">Technical Specifications</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {Object.entries(product.specs).map(([category, details]: [string, any]) => (
                        <div key={category} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                            <div className="bg-gray-50 px-6 py-3 border-b border-gray-100 flex items-center gap-2">
                                <span className="font-bold text-gray-800 uppercase text-xs tracking-wider">{category}</span>
                            </div>
                            <div className="divide-y divide-gray-50">
                                {Object.entries(details).map(([key, value]: [string, any]) => (
                                    <div key={key} className="flex px-6 py-3 text-sm hover:bg-blue-50/30 transition-colors">
                                        <span className="w-1/3 text-gray-500 font-medium">{key}</span>
                                        <span className="w-2/3 text-gray-900 font-semibold">{value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

      </div>
    </div>
  );
};
