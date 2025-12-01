
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingBag, Smartphone, Watch, Tablet, Headphones, Zap, ImageOff } from 'lucide-react';
import { Product } from '../types';
import { useShop } from '../context/ShopContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useShop();
  const [imgError, setImgError] = useState(false);
  
  const discount = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const inStock = product.stock > 0;

  // Robust Image Selection Logic
  const displayImage = product.image || 
                       (product.images && product.images.length > 0 ? product.images[0] : null) || 
                       product.heroImage || 
                       (product.imageSeed ? `https://picsum.photos/seed/${product.imageSeed}/400/400` : null);

  // Reset error state if product changes
  useEffect(() => {
    setImgError(false);
  }, [product.id, displayImage]);

  const handleAddToCart = (e: React.MouseEvent) => {
     e.preventDefault();
     if (inStock) {
        addToCart(product);
     }
  };

  // Category Icon Fallback
  const getCategoryIcon = () => {
    switch(product.category) {
      case 'Smartphones': return <Smartphone size={32} className="text-gray-300"/>;
      case 'Wearables': return <Watch size={32} className="text-gray-300"/>;
      case 'Tablets': return <Tablet size={32} className="text-gray-300"/>;
      case 'Audio': return <Headphones size={32} className="text-gray-300"/>;
      default: return <ImageOff size={32} className="text-gray-300"/>;
    }
  };

  const showFallback = imgError || !displayImage;

  return (
    <div className="group bg-white rounded-xl border border-gray-200 hover:border-primary/50 hover:shadow-lg transition-all duration-300 flex flex-col relative h-full overflow-hidden">
      
      {/* Badges - Compact */}
      <div className="absolute top-2 left-2 z-20 flex flex-col gap-1 items-start">
        {discount > 0 && inStock && (
          <span className="bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-sm uppercase tracking-wide">
            -{discount}%
          </span>
        )}
        {!inStock && (
           <span className="bg-slate-900 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm uppercase tracking-wide">
              Sold Out
           </span>
        )}
      </div>

      {/* Image Area */}
      <Link to={`/product/${product.id}`} className="block relative p-4 aspect-[4/5] bg-white flex items-center justify-center overflow-hidden">
        {showFallback ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 rounded-lg">
             {getCategoryIcon()}
             <span className="text-[10px] text-gray-400 mt-2 font-medium">No Image</span>
          </div>
        ) : (
          <img
            src={displayImage!}
            alt={product.name}
            onError={(e) => {
              e.currentTarget.onerror = null; // Prevent infinite loop
              setImgError(true);
            }}
            className={`w-full h-full object-contain mix-blend-multiply transform transition-transform duration-500 ease-out ${inStock ? 'group-hover:scale-105' : 'grayscale opacity-50'}`}
            loading="lazy"
          />
        )}
        
        {/* Quick Actions Overlay */}
        <div className="absolute inset-x-0 bottom-0 p-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-full group-hover:translate-y-0 flex justify-center bg-gradient-to-t from-white/90 to-transparent">
            <button 
              onClick={handleAddToCart}
              disabled={!inStock}
              className="w-full py-2 bg-primary text-white text-xs font-bold rounded-lg shadow-lg hover:bg-slate-800 flex items-center justify-center gap-2 backdrop-blur-sm"
            >
               <ShoppingBag size={14} /> {inStock ? 'Add' : 'Out'}
            </button>
        </div>
      </Link>
      
      {/* Content Area */}
      <div className="p-3 flex flex-col flex-1 border-t border-gray-50 bg-white relative z-10">
        <div className="mb-1 flex justify-between items-start">
           <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider truncate pr-2">{product.brand}</span>
           <div className="flex items-center gap-0.5">
             <Star size={10} className="fill-secondary text-secondary" />
             <span className="text-[10px] font-bold text-gray-600">{product.rating}</span>
           </div>
        </div>

        <Link to={`/product/${product.id}`} className="mb-1 block flex-grow">
           <h3 className="text-sm font-bold text-gray-900 leading-tight group-hover:text-primary transition-colors line-clamp-2 min-h-[2.5em]" title={product.name}>
               {product.name}
           </h3>
        </Link>

        {/* Price Compact */}
        <div className="mt-auto flex items-end gap-2">
           <div className="flex items-baseline gap-1">
              <span className="text-lg font-black text-primary leading-none">{product.price}</span>
              <span className="text-[10px] font-bold text-gray-500">KWD</span>
           </div>
           {product.originalPrice && (
              <span className="text-[10px] text-gray-400 line-through font-medium mb-0.5">{product.originalPrice}</span>
           )}
        </div>
      </div>
    </div>
  );
};
