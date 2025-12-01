import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { Star, Plus, ShieldCheck, Zap, Sparkles, Heart, Truck, Check, Share2, Info, ArrowRight, Minus, ArrowLeftRight, ShoppingBag, CheckCircle, AlertCircle, Package, Clock, CreditCard, ChevronRight, PlayCircle, Maximize2 } from 'lucide-react';
import { generateProductReview } from '../services/geminiService';
import { ProductCard } from '../components/ProductCard';

export const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { products, addToCart, toggleWishlist, isInWishlist, addToRecentlyViewed, addReview, user, addToCompare, isInCompare, removeFromCompare, showToast } = useShop();
  const navigate = useNavigate();
  
  const product = products.find(p => p.id === id);
  
  const [aiReview, setAiReview] = useState<string>('');
  const [loadingReview, setLoadingReview] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'specs' | 'reviews'>('overview');
  const [selectedColor, setSelectedColor] = useState<string>(product?.colors?.[0] || '');
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
    setAiReview('');
    setQuantity(1);
    if (product) {
      if (product.colors?.length) setSelectedColor(product.colors[0]);
      addToRecentlyViewed(product);
    }
  }, [id, product]);

  const handleGenerateReview = async () => {
    if (!product) return;
    setLoadingReview(true);
    const review = await generateProductReview(product);
    setAiReview(review);
    setLoadingReview(false);
  };

  const handleAddToCart = () => {
      if(!product) return;
      if (quantity > product.stock) {
         showToast(`Cannot add ${quantity} items. Only ${product.stock} available.`, 'error');
         return;
      }
      for(let i=0; i<quantity; i++) {
        addToCart(product);
      }
  };

  const handleBuyNow = () => {
    if(!product) return;
    if (quantity > product.stock) {
       showToast(`Cannot buy ${quantity} items. Only ${product.stock} available.`, 'error');
       return;
    }
    handleAddToCart();
    navigate('/checkout');
  };

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Product not found</h2>
          <Link to="/" className="text-accent hover:underline mt-4 block">Return Home</Link>
        </div>
      </div>
    );
  }

  const isWishlisted = isInWishlist(product.id);
  const isCompared = isInCompare(product.id);
  const discount = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;
  const inStock = product.stock > 0;
  const relatedProducts = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);

  // Sticky Header Logic
  const [isSticky, setIsSticky] = useState(false);
  useEffect(() => {
     const handleScroll = () => setIsSticky(window.scrollY > 400);
     window.addEventListener('scroll', handleScroll);
     return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50/50 pb-24 md:pb-20 font-sans">
      
      {/* Sticky Product Header */}
      <div className={`fixed top-0 left-0 right-0 bg-white shadow-lg z-30 transition-all duration-300 transform ${isSticky ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex justify-between items-center">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-lg border border-gray-100 p-1 bg-white">
                 <img src={`https://picsum.photos/seed/${product.imageSeed}/100/100`} className="w-full h-full object-contain" alt={product.name}/>
               </div>
               <div>
                  <h3 className="font-bold text-gray-900 text-sm line-clamp-1">{product.name}</h3>
                  <div className="flex items-center gap-2">
                     <span className="text-sm font-black text-primary">{product.price} KWD</span>
                     <span className="flex items-center gap-1 text-xs font-bold text-gray-500"><Star size={10} className="fill-secondary text-secondary"/> {product.rating}</span>
                  </div>
               </div>
            </div>
            <div className="flex items-center gap-3">
               <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"><Share2 size={20}/></button>
               <button onClick={handleAddToCart} disabled={!inStock} className="px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-lg hover:bg-slate-800 disabled:opacity-50 shadow-md">
                  Add to Cart
               </button>
            </div>
         </div>
      </div>

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100 hidden md:block">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center text-xs text-gray-500 gap-2 font-medium">
               <Link to="/" className="hover:text-primary transition-colors">Home</Link> 
               <ChevronRight size={12} className="text-gray-300"/>
               <span className="hover:text-primary cursor-pointer transition-colors">{product.category}</span> 
               <ChevronRight size={12} className="text-gray-300"/>
               <span className="text-gray-900 font-bold">{product.name}</span>
            </div>
         </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        
        {/* Main 3-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
            
            {/* 1. Gallery (Left - 5 cols) */}
            <div className="lg:col-span-5">
              <div className="sticky top-28 space-y-4">
                 <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative group">
                    <div className="aspect-square p-10 flex items-center justify-center bg-white relative">
                       {discount > 0 && <span className="absolute top-4 left-4 bg-accent text-white text-xs font-bold px-3 py-1.5 rounded-md z-10 shadow-sm">{discount}% OFF</span>}
                       <button className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md text-gray-400 hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                          <Maximize2 size={20}/>
                       </button>
                       <img 
                         src={`https://picsum.photos/seed/${product.imageSeed + selectedImageIndex}/800/800`} 
                         alt={product.name}
                         className="w-full h-full object-contain hover:scale-105 transition-transform duration-700 ease-out" 
                       />
                    </div>
                 </div>
                 
                 {/* Thumbnails */}
                 <div className="grid grid-cols-5 gap-3">
                    {[0, 1, 2, 3].map((i) => (
                      <div 
                        key={i} 
                        onClick={() => setSelectedImageIndex(i)}
                        className={`aspect-square rounded-xl p-2 cursor-pointer transition-all bg-white border flex items-center justify-center relative ${selectedImageIndex === i ? 'border-primary ring-2 ring-primary/20 shadow-md' : 'border-gray-200 hover:border-gray-300'}`}
                      >
                         <img src={`https://picsum.photos/seed/${product.imageSeed + i}/200/200`} className="w-full h-full object-contain" />
                         {selectedImageIndex === i && <div className="absolute inset-0 bg-primary/5 rounded-xl"></div>}
                      </div>
                    ))}
                    <div className="aspect-square rounded-xl bg-gray-50 border border-gray-200 flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:bg-gray-100 hover:text-primary transition-colors">
                        <PlayCircle size={24}/>
                        <span className="text-[10px] font-bold mt-1">Video</span>
                    </div>
                 </div>
              </div>
            </div>

            {/* 2. Product Info (Middle - 4 cols) */}
            <div className="lg:col-span-4 space-y-8">
               <div>
                  <div className="flex items-center gap-3 mb-3">
                     <span className="text-xs font-bold text-primary bg-blue-50 px-2.5 py-1 rounded-md uppercase tracking-wider border border-blue-100">{product.brand}</span>
                     {product.express && <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md flex items-center gap-1 border border-amber-100"><Zap size={12} className="fill-current"/> Express Delivery</span>}
                  </div>
                  <h1 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight mb-4">{product.name}</h1>
                  <div className="flex items-center gap-4 text-sm">
                     <div className="flex items-center gap-1">
                        <div className="flex text-secondary">
                            {[...Array(5)].map((_, i) => <Star key={i} size={16} className={i < Math.floor(product.rating) ? "fill-current" : "text-gray-200"} />)}
                        </div>
                        <span className="font-bold text-gray-900 ml-2">{product.rating}</span>
                     </div>
                     <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                     <a href="#reviews" className="text-gray-500 hover:text-primary underline decoration-gray-300 underline-offset-2 transition-colors font-medium">{product.reviewsCount} Verified Reviews</a>
                  </div>
               </div>

               <div className="h-px bg-gray-100"></div>

               {/* Price for Mobile (Usually visible here, but main price in sidebar for desktop) */}
               <div className="lg:hidden">
                  <div className="flex items-baseline gap-3">
                     <span className="text-4xl font-black text-primary">{product.price} <span className="text-lg">KWD</span></span>
                     {product.originalPrice && <span className="text-lg text-gray-400 line-through font-medium">{product.originalPrice} KWD</span>}
                  </div>
               </div>

               {/* Configuration */}
               <div className="space-y-6">
                  {product.colors && (
                     <div>
                        <span className="text-sm font-bold text-gray-900 mb-3 block">Select Color: <span className="text-primary">{selectedColor}</span></span>
                        <div className="flex gap-3">
                           {product.colors.map((color) => (
                              <button
                                 key={color}
                                 onClick={() => setSelectedColor(color)}
                                 className={`w-12 h-12 rounded-full shadow-sm focus:outline-none transition-all flex items-center justify-center border-2 relative ${selectedColor === color ? 'border-primary ring-2 ring-primary/20 scale-110' : 'border-gray-200 hover:border-gray-300'}`}
                                 style={{ backgroundColor: color }}
                                 title={color}
                              >
                                 {selectedColor === color && <Check size={18} className="text-white drop-shadow-md" />}
                              </button>
                           ))}
                        </div>
                     </div>
                  )}

                  {/* Storage Options (Mock) */}
                  <div>
                     <span className="text-sm font-bold text-gray-900 mb-3 block">Storage</span>
                     <div className="grid grid-cols-3 gap-3">
                        {['128GB', '256GB', '512GB'].map((storage, i) => (
                           <button 
                             key={storage}
                             className={`py-3 px-2 rounded-xl text-sm font-bold border transition-all ${i === 1 ? 'border-primary bg-blue-50 text-primary ring-1 ring-primary/30' : 'border-gray-200 text-gray-600 hover:border-gray-300 bg-white'}`}
                           >
                              {storage}
                              <span className="block text-[10px] font-normal opacity-70 mt-0.5">{i === 1 ? '+0 KWD' : i === 0 ? '-20 KWD' : '+40 KWD'}</span>
                           </button>
                        ))}
                     </div>
                  </div>
               </div>

               {/* Highlights */}
               <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                  <h4 className="font-bold text-gray-900 text-sm mb-3 uppercase tracking-wider">Product Highlights</h4>
                  <ul className="space-y-2">
                     {Object.entries(product.specs).slice(0, 4).map(([key, val]) => (
                        <li key={key} className="flex items-start gap-2 text-sm text-gray-700">
                           <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0"/>
                           <span><span className="font-bold capitalize">{key}:</span> {val}</span>
                        </li>
                     ))}
                  </ul>
               </div>

               {/* AI Insight */}
               <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100 p-5 rounded-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                     <Sparkles size={64}/>
                  </div>
                  <div className="flex items-center gap-2 mb-3 relative z-10">
                     <Sparkles size={18} className="text-purple-600 fill-purple-200" />
                     <span className="text-sm font-black text-purple-700 uppercase tracking-wide">AI Expert Summary</span>
                  </div>
                  {!aiReview ? (
                     <button onClick={handleGenerateReview} className="text-sm font-bold text-purple-700 hover:bg-purple-100 px-4 py-2 rounded-lg transition-colors border border-purple-200 bg-white/50">
                        Generate Review Summary →
                     </button>
                  ) : (
                     <p className="text-sm text-purple-900 leading-relaxed italic bg-white/40 p-3 rounded-lg border border-purple-100">"{aiReview}"</p>
                  )}
                  {loadingReview && <div className="flex items-center gap-2 text-sm text-purple-600"><span className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"></span> Analyzing...</div>}
               </div>
            </div>

            {/* 3. Purchase Sidebar (Right - 3 cols - Fixed/Sticky) */}
            <div className="lg:col-span-3">
               <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 sticky top-28">
                  <div className="mb-6 pb-6 border-b border-gray-50">
                     <div className="flex flex-col mb-1">
                        <span className="text-sm text-gray-500 font-bold">Total Price</span>
                        <div className="flex items-baseline gap-2">
                           <span className="text-4xl font-black text-slate-900">{product.price} <span className="text-lg text-gray-400">KWD</span></span>
                        </div>
                     </div>
                     {product.originalPrice && <div className="text-sm text-gray-400 line-through font-medium">Was: {product.originalPrice} KWD</div>}
                     {product.monthlyPrice && <div className="mt-3 text-xs font-bold text-blue-700 bg-blue-50 p-2 rounded-lg border border-blue-100 flex items-center gap-2"><CreditCard size={14}/> Installments from {product.monthlyPrice} KWD/mo</div>}
                  </div>

                  {/* Stock & Delivery */}
                  <div className="space-y-4 mb-8">
                     {inStock ? (
                        <>
                           <div className="flex items-start gap-3">
                              <Truck className="text-green-600 mt-0.5" size={18} />
                              <div>
                                 <p className="text-sm font-bold text-gray-900">Free Delivery</p>
                                 <p className="text-xs text-gray-500">Order now, receive by <span className="font-bold text-gray-700">Tomorrow, 6 PM</span></p>
                              </div>
                           </div>
                           <div className="flex items-start gap-3">
                              <ShieldCheck className="text-green-600 mt-0.5" size={18} />
                              <div>
                                 <p className="text-sm font-bold text-gray-900">2 Year Warranty</p>
                                 <p className="text-xs text-gray-500">Official local warranty included</p>
                              </div>
                           </div>
                        </>
                     ) : (
                        <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-xl border border-red-100">
                           <AlertCircle size={18} />
                           <p className="text-sm font-bold">Currently Unavailable</p>
                        </div>
                     )}
                  </div>

                  {/* Quantity & Actions */}
                  <div className="space-y-4">
                     <div className="flex items-center gap-4">
                        <span className="text-sm font-bold text-gray-700">Qty:</span>
                        <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50">
                           <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-l-xl transition-colors text-gray-600" disabled={!inStock}><Minus size={16}/></button>
                           <span className="w-8 text-center font-bold text-gray-900 text-sm bg-white h-10 flex items-center justify-center border-x border-gray-200">{quantity}</span>
                           <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-r-xl transition-colors text-gray-600" disabled={!inStock}><Plus size={16}/></button>
                        </div>
                        {product.stock < 10 && inStock && <span className="text-xs font-bold text-red-500">Only {product.stock} left!</span>}
                     </div>

                     <button onClick={handleBuyNow} disabled={!inStock} className="w-full py-4 bg-secondary text-primary font-black rounded-xl hover:bg-amber-400 border-b-4 border-amber-600 hover:border-amber-500 active:border-b-0 active:translate-y-1 transition-all shadow-lg shadow-secondary/20 disabled:opacity-50 disabled:cursor-not-allowed">
                        Buy Now
                     </button>
                     <button onClick={handleAddToCart} disabled={!inStock} className="w-full py-4 bg-primary text-white font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-primary/20 active:scale-95 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2">
                        <ShoppingBag size={18}/> Add to Cart
                     </button>
                  </div>

                  {/* Social Proof / Micro Actions */}
                  <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-2 gap-2">
                     <button onClick={() => toggleWishlist(product)} className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors ${isWishlisted ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>
                        <Heart size={14} className={isWishlisted ? "fill-current" : ""}/> {isWishlisted ? 'Saved' : 'Wishlist'}
                     </button>
                     <button onClick={() => isCompared ? removeFromCompare(product.id) : addToCompare(product)} className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors ${isCompared ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>
                        <ArrowLeftRight size={14}/> Compare
                     </button>
                  </div>
                  
                  {/* Live Viewers Mock */}
                  <div className="mt-4 flex items-center gap-2 justify-center text-xs text-gray-400 bg-gray-50 py-2 rounded-lg">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                      </span>
                      12 people viewing this product
                  </div>
               </div>
            </div>
        </div>

        {/* 4. Enhanced Tabs */}
        <div id="details" className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden mb-16">
           <div className="flex border-b border-gray-100 overflow-x-auto scrollbar-hide">
              {(['overview', 'specs', 'reviews', 'support'] as const).map((tab) => (
                 <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`flex-1 py-6 px-8 text-sm font-bold uppercase tracking-widest transition-all whitespace-nowrap border-b-2 ${activeTab === tab ? 'text-primary border-primary bg-blue-50/30' : 'text-gray-400 border-transparent hover:text-gray-600 hover:bg-gray-50'}`}
                 >
                    {tab === 'overview' ? 'Overview' : tab === 'specs' ? 'Specifications' : tab === 'reviews' ? `Reviews (${product.reviewsCount})` : 'Warranty & Support'}
                 </button>
              ))}
           </div>
           
           <div className="p-8 md:p-16 min-h-[400px] bg-white">
              {activeTab === 'overview' && (
                 <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">Product Description</h3>
                    <p className="text-lg leading-relaxed text-gray-600 mb-12 font-light">{product.description}</p>
                    
                    <div className="grid md:grid-cols-2 gap-8 mb-12">
                       <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100">
                          <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Zap size={20} className="text-amber-500"/> Performance</h4>
                          <p className="text-gray-600 text-sm leading-relaxed">Powered by the latest {product.specs.processor}, this device handles multitasking and heavy gaming with ease. Experience zero lag and maximum efficiency.</p>
                       </div>
                       <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100">
                          <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Maximize2 size={20} className="text-blue-500"/> Display</h4>
                          <p className="text-gray-600 text-sm leading-relaxed">Immerse yourself in the {product.specs.screen}. Vibrant colors, deep blacks, and a high refresh rate make every interaction smooth and visually stunning.</p>
                       </div>
                    </div>
                 </div>
              )}
              {activeTab === 'specs' && (
                 <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h3 className="font-bold text-2xl text-gray-900 mb-8">Technical Specifications</h3>
                    <div className="border border-gray-200 rounded-2xl overflow-hidden divide-y divide-gray-100">
                       {Object.entries(product.specs).map(([key, val], i) => (
                          <div key={key} className={`flex p-5 hover:bg-gray-50 transition-colors`}>
                             <div className="w-1/3 text-sm font-bold text-gray-500 capitalize flex items-center gap-2">
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                             </div>
                             <div className="w-2/3 text-sm font-semibold text-gray-900">{val}</div>
                          </div>
                       ))}
                    </div>
                 </div>
              )}
              {activeTab === 'reviews' && (
                 <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-gray-50 rounded-2xl p-8 mb-10 flex items-center justify-between border border-gray-100">
                       <div>
                          <div className="text-6xl font-black text-gray-900 mb-2">{product.rating}</div>
                          <div className="flex text-secondary gap-1 mb-2">
                             {[...Array(5)].map((_, i) => <Star key={i} size={24} className={i < Math.floor(product.rating) ? "fill-current" : "text-gray-200"} />)}
                          </div>
                          <p className="text-sm text-gray-500 font-bold">Based on {product.reviewsCount} verified ratings</p>
                       </div>
                       <button className="px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-lg">Write a Review</button>
                    </div>
                    {/* Placeholder for review list */}
                    <div className="text-center py-12">
                       <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                          <CheckCircle size={32}/>
                       </div>
                       <p className="text-gray-900 font-bold">No written reviews yet</p>
                       <p className="text-gray-500 text-sm">Be the first to share your thoughts on this product!</p>
                    </div>
                 </div>
              )}
           </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="border-t border-gray-200 pt-20">
            <div className="flex justify-between items-end mb-8">
               <h2 className="text-2xl font-black text-gray-900">You Might Also Like</h2>
               <Link to={`/shop?category=${product.category}`} className="text-primary font-bold text-sm flex items-center gap-1 hover:text-secondary transition-colors">See More <ArrowRight size={16}/></Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
               {relatedProducts.map(p => (
                 <ProductCard key={p.id} product={p} />
               ))}
            </div>
          </div>
        )}

      </div>

      {/* Mobile Sticky Action Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)] flex items-center gap-4 safe-area-bottom">
         <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Price</span>
            <span className="font-black text-xl text-primary">{product.price} KWD</span>
         </div>
         <div className="flex flex-1 gap-2">
            <button onClick={handleAddToCart} disabled={!inStock} className="flex-1 bg-gray-100 text-gray-900 font-bold py-3 rounded-xl active:scale-95 disabled:opacity-50">
               Add
            </button>
            <button onClick={handleBuyNow} disabled={!inStock} className="flex-[2] bg-primary text-white font-bold py-3 rounded-xl shadow-lg shadow-primary/20 active:scale-95 disabled:opacity-50">
               Buy Now
            </button>
         </div>
      </div>
    </div>
  );
};