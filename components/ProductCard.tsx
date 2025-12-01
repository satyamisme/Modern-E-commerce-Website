import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Plus, Heart, Zap, ArrowLeftRight, Eye, ShoppingBag, ShoppingCart } from 'lucide-react';
import { Product } from '../types';
import { useShop } from '../context/ShopContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, toggleWishlist, isInWishlist, addToCompare, isInCompare, removeFromCompare } = useShop();
  const isWishlisted = isInWishlist(product.id);
  const isCompared = isInCompare(product.id);
  
  const discount = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const imageUrl = product.image 
    ? product.image 
    : `https://picsum.photos/seed/${product.imageSeed}/500/600`;

  const inStock = product.stock > 0;

  const handleAddToCart = (e: React.MouseEvent) => {
     e.preventDefault();
     if (inStock) {
        addToCart(product);
     }
  };

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300 flex flex-col relative h-full overflow-hidden">
      
      {/* Badges */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 items-start">
        {discount > 0 && inStock && (
          <span className="bg-accent text-white text-[10px] font-black px-2.5 py-1 rounded-md shadow-sm uppercase tracking-wide">
            Save {discount}%
          </span>
        )}
        {product.express && inStock && (
           <span className="bg-white/90 backdrop-blur text-amber-600 border border-amber-100 text-[10px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1 shadow-sm uppercase tracking-wide">
             <Zap size={10} className="fill-current"/> Express
           </span>
        )}
        {!inStock && (
           <span className="bg-slate-900 text-white text-[10px] font-bold px-2.5 py-1 rounded-md shadow-sm uppercase tracking-wide">
              Sold Out
           </span>
        )}
      </div>

      {/* Floating Actions */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 ease-out">
         <button
            onClick={(e) => { e.preventDefault(); toggleWishlist(product); }}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-md ${
               isWishlisted 
               ? 'bg-accent text-white border-transparent' 
               : 'bg-white text-gray-400 hover:text-accent border border-gray-100 hover:border-accent'
            }`}
            title="Wishlist"
         >
            <Heart size={18} className={isWishlisted ? "fill-current" : ""} />
         </button>
         
         <button
            onClick={(e) => {
               e.preventDefault();
               isCompared ? removeFromCompare(product.id) : addToCompare(product);
            }}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-md ${
               isCompared
               ? 'bg-primary text-white border-transparent'
               : 'bg-white text-gray-400 hover:text-primary border border-gray-100 hover:border-primary'
            }`}
            title="Compare"
         >
            <ArrowLeftRight size={18} />
         </button>
      </div>

      {/* Image Area */}
      <Link to={`/product/${product.id}`} className="block relative p-8 aspect-[4/5] overflow-hidden bg-white">
        <div className="absolute inset-0 bg-gray-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <img
          src={imageUrl}
          alt={product.name}
          className={`w-full h-full object-contain mix-blend-multiply transform transition-transform duration-700 ease-out ${inStock ? 'group-hover:scale-110' : 'grayscale opacity-50'}`}
        />
        
        {/* Quick View Overlay Button */}
        <div className="absolute inset-x-0 bottom-6 flex justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
            <span className="bg-white text-gray-900 text-xs font-bold px-6 py-2.5 rounded-full shadow-lg border border-gray-100 flex items-center gap-2 hover:bg-gray-50 transition-colors">
               <Eye size={14}/> Quick View
            </span>
        </div>
      </Link>
      
      {/* Content Area */}
      <div className="p-5 flex flex-col flex-1 border-t border-gray-50 bg-white relative z-10">
        <div className="mb-2">
           <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{product.brand}</span>
        </div>

        <Link to={`/product/${product.id}`} className="mb-2 block flex-grow">
           <h3 className="text-base font-bold text-gray-900 leading-snug group-hover:text-primary transition-colors line-clamp-2 min-h-[2.5rem]">
               {product.name}
           </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-4">
           <div className="flex text-secondary">
             {[...Array(5)].map((_, i) => (
                <Star key={i} size={12} className={i < Math.floor(product.rating) ? "fill-current" : "text-gray-200"} />
             ))}
           </div>
           <span className="text-xs text-gray-400 font-medium">({product.reviewsCount})</span>
        </div>

        {/* Price & Cart Action */}
        <div className="mt-auto flex items-center justify-between">
          <div className="flex flex-col">
              {product.originalPrice && (
                 <span className="text-xs text-gray-400 line-through font-bold">{product.originalPrice} KWD</span>
              )}
              <div className="flex items-baseline gap-1">
                 <span className="text-xl font-black text-primary">{product.price}</span>
                 <span className="text-xs font-bold text-gray-500">KWD</span>
              </div>
          </div>
          
          <button 
            onClick={handleAddToCart}
            disabled={!inStock}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all shadow-sm group/btn ${
               inStock 
               ? 'bg-gray-50 text-gray-900 hover:bg-primary hover:text-white hover:shadow-lg hover:shadow-primary/20' 
               : 'bg-gray-50 text-gray-300 cursor-not-allowed'
            }`}
            title={inStock ? "Add to Cart" : "Out of Stock"}
          >
             {inStock ? <ShoppingBag size={20} className="group-hover/btn:scale-110 transition-transform"/> : <ShoppingBag size={20}/>}
          </button>
        </div>
      </div>
    </div>
  );
};