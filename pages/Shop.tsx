import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PRODUCTS } from '../data/products';
import { ProductCard } from '../components/ProductCard';
import { SlidersHorizontal, ChevronDown, Check, X, Filter, Search, Star } from 'lucide-react';
import { SortOption } from '../types';
import { useShop } from '../context/ShopContext';

export const Shop: React.FC = () => {
  const { searchQuery, setSearchQuery, products } = useShop();
  const [searchParams] = useSearchParams();
  
  // Local Filter States
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortOption, setSortOption] = useState<SortOption>(SortOption.Recommended);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [minRating, setMinRating] = useState<number>(0);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Spec Filters
  const [selectedRam, setSelectedRam] = useState<string[]>([]);
  const [selectedStorage, setSelectedStorage] = useState<string[]>([]);

  // Initialize from URL params
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
       setSelectedCategory(categoryParam);
    }
    const brandParam = searchParams.get('brand');
    if (brandParam) {
       setSelectedBrands([brandParam]);
    }
  }, [searchParams]);

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];
  const brands = Array.from(new Set(products.map(p => p.brand)));

  // Helper to get counts
  const getCount = (type: 'category' | 'brand', value: string) => {
    return products.filter(p => {
        if (type === 'category') return value === 'All' ? true : p.category === value;
        if (type === 'brand') return p.brand === value;
        return false;
    }).length;
  };

  const handleBrandToggle = (brand: string) => {
    setSelectedBrands(prev => 
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  };

  const clearFilters = () => {
    setSelectedCategory('All');
    setPriceRange([0, 2000]);
    setSelectedBrands([]);
    setMinRating(0);
    setSelectedRam([]);
    setSelectedStorage([]);
    setSearchQuery('');
  };

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.brand.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
      );
    }

    // Category
    if (selectedCategory !== 'All') {
      result = result.filter(p => p.category === selectedCategory);
    }

    // Brands
    if (selectedBrands.length > 0) {
      result = result.filter(p => selectedBrands.includes(p.brand));
    }

    // Price
    result = result.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    // Rating
    if (minRating > 0) {
      result = result.filter(p => p.rating >= minRating);
    }

    // Sort
    switch (sortOption) {
      case SortOption.PriceLowHigh: return result.sort((a, b) => a.price - b.price);
      case SortOption.PriceHighLow: return result.sort((a, b) => b.price - a.price);
      default: return result;
    }
  }, [selectedCategory, sortOption, searchQuery, selectedBrands, priceRange, minRating, selectedRam, selectedStorage, products]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
             
             {/* Sidebar Filters (Desktop) */}
             <div className={`lg:block w-72 flex-shrink-0 space-y-8 ${isMobileFilterOpen ? 'fixed inset-0 z-50 bg-white p-6 overflow-y-auto block animate-in slide-in-from-left duration-200' : 'hidden'}`}>
                <div className="flex justify-between items-center lg:hidden mb-6">
                   <h2 className="text-xl font-bold">Filters</h2>
                   <button onClick={() => setIsMobileFilterOpen(false)} className="p-2 bg-gray-100 rounded-full"><X size={20}/></button>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm sticky top-24">
                  <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
                    <h3 className="flex items-center gap-2 text-gray-900 font-bold"><SlidersHorizontal size={20} /> Filters</h3>
                    <button onClick={clearFilters} className="text-xs text-primary font-bold hover:underline">Reset All</button>
                  </div>
                  
                  {/* Categories */}
                  <div className="mb-8">
                    <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Categories</h3>
                    <div className="space-y-2">
                      {categories.map(cat => (
                        <label key={cat} className={`flex items-center justify-between cursor-pointer p-2 rounded-xl transition-all ${selectedCategory === cat ? 'bg-blue-50 border border-blue-100' : 'hover:bg-gray-50 border border-transparent'}`}>
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${selectedCategory === cat ? 'border-primary bg-primary' : 'border-gray-300 bg-white'}`}>
                               {selectedCategory === cat && <div className="w-2 h-2 bg-white rounded-full"></div>}
                            </div>
                            <input 
                              type="radio" 
                              name="category" 
                              className="hidden"
                              checked={selectedCategory === cat}
                              onChange={() => setSelectedCategory(cat)}
                            />
                            <span className={`text-sm font-medium ${selectedCategory === cat ? 'text-primary' : 'text-gray-600'}`}>{cat}</span>
                          </div>
                          <span className="text-xs text-gray-400 font-medium bg-gray-100 px-2 py-0.5 rounded-md">{getCount('category', cat)}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div className="mb-8">
                     <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Price Range</h3>
                     <div className="flex items-center gap-3 mb-4">
                        <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold w-full text-center text-gray-700">{priceRange[0]} KWD</div>
                        <span className="text-gray-400 text-xs font-medium">TO</span>
                        <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold w-full text-center text-gray-700">{priceRange[1]} KWD</div>
                     </div>
                     <input 
                        type="range" 
                        min="0" 
                        max="2000" 
                        step="50"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                        className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                     />
                  </div>

                  {/* Brands */}
                  <div className="mb-8">
                     <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Brands</h3>
                     <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                        {brands.map(brand => (
                           <label key={brand} className="flex items-center justify-between cursor-pointer group p-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                              <div className="flex items-center gap-3">
                                <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${selectedBrands.includes(brand) ? 'bg-primary border-primary' : 'border-gray-300 bg-white'}`}>
                                   {selectedBrands.includes(brand) && <Check size={12} className="text-white"/>}
                                </div>
                                <input 
                                   type="checkbox" 
                                   className="hidden"
                                   checked={selectedBrands.includes(brand)}
                                   onChange={() => handleBrandToggle(brand)}
                                />
                                <span className="text-sm text-gray-600 font-medium group-hover:text-primary transition-colors">{brand}</span>
                              </div>
                              <span className="text-xs text-gray-400 font-medium">{getCount('brand', brand)}</span>
                           </label>
                        ))}
                     </div>
                  </div>

                  {/* Rating */}
                  <div>
                     <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Rating</h3>
                     {[4, 3, 2].map(star => (
                        <label key={star} className="flex items-center gap-3 cursor-pointer mb-2 hover:bg-gray-50 p-2 rounded-lg transition-colors">
                           <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${minRating === star ? 'border-primary' : 'border-gray-300'}`}>
                              {minRating === star && <div className="w-2.5 h-2.5 bg-primary rounded-full"></div>}
                           </div>
                           <input type="radio" name="rating" className="hidden" checked={minRating === star} onChange={() => setMinRating(star)} />
                           <span className="text-sm text-gray-600 font-medium flex items-center gap-1">
                              {star}+ <span className="text-yellow-400 fill-current"><Star size={14}/></span> <span className="text-xs text-gray-400">& Up</span>
                           </span>
                        </label>
                     ))}
                  </div>
               </div>
             </div>

             {/* Main Content */}
             <div className="flex-1">
                {/* Top Toolbar */}
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm gap-4">
                   <div className="flex items-center gap-3 w-full sm:w-auto">
                      <button onClick={() => setIsMobileFilterOpen(true)} className="lg:hidden p-2.5 bg-gray-100 rounded-xl text-gray-600 hover:bg-gray-200 transition-colors">
                         <Filter size={20} />
                      </button>
                      <p className="text-sm font-medium text-gray-500">Found <span className="text-gray-900 font-bold">{filteredProducts.length}</span> items</p>
                   </div>

                   <div className="flex items-center gap-3 w-full sm:w-auto">
                      <span className="text-sm text-gray-500 font-medium whitespace-nowrap hidden sm:block">Sort by:</span>
                      <div className="relative w-full sm:w-48">
                         <select
                            value={sortOption}
                            onChange={(e) => setSortOption(e.target.value as SortOption)}
                            className="w-full p-2.5 pl-4 pr-10 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 outline-none focus:border-primary appearance-none cursor-pointer font-bold transition-all"
                          >
                            {Object.values(SortOption).map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                          <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
                      </div>
                   </div>
                </div>

                {/* Active Filters Row */}
                {(selectedCategory !== 'All' || selectedBrands.length > 0) && (
                   <div className="flex flex-wrap gap-2 mb-6">
                      {selectedCategory !== 'All' && (
                         <span className="text-xs font-bold bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-blue-100">
                            {selectedCategory} <X size={14} className="cursor-pointer hover:text-blue-800" onClick={() => setSelectedCategory('All')}/>
                         </span>
                      )}
                      {selectedBrands.map(b => (
                         <span key={b} className="text-xs font-bold bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-gray-200">
                            {b} <X size={14} className="cursor-pointer hover:text-gray-900" onClick={() => handleBrandToggle(b)}/>
                         </span>
                      ))}
                   </div>
                )}

                {filteredProducts.length === 0 ? (
                  <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-200 flex flex-col items-center justify-center">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                        <Search size={32} className="text-gray-300" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No products found</h3>
                    <p className="text-gray-500 mb-8 max-w-xs mx-auto">We couldn't find any products matching your current filters.</p>
                    <button 
                      onClick={clearFilters}
                      className="px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg shadow-primary/20"
                    >
                      Clear all filters
                    </button>
                  </div>
                ) : (
                  <>
                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                       {filteredProducts.map(product => (
                         <ProductCard key={product.id} product={product} />
                       ))}
                     </div>
                  </>
                )}
             </div>
          </div>
       </div>
    </div>
  );
};