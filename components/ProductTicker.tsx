
import React from 'react';
import { Product } from '../types';
import { Link } from 'react-router-dom';

interface ProductTickerProps {
  products: Product[];
}

export const ProductTicker: React.FC<ProductTickerProps> = ({ products }) => {
  if (!products || products.length === 0) return null;

  // Duplicate items to ensure smooth infinite scroll even with few items
  const displayProducts = [...products, ...products, ...products];

  return (
    <div className="w-full bg-white border-y border-gray-100 overflow-hidden py-2 shadow-sm relative z-10">
       <div className="flex animate-marquee hover:[animation-play-state:paused] w-max gap-8 items-center">
          {displayProducts.map((p, idx) => (
             <Link 
                key={`${p.id}-${idx}`} 
                to={`/product/${p.id}`}
                className="flex items-center gap-3 group px-4 py-0.5 flex-shrink-0 border-r border-gray-50 last:border-0"
             >
                <div className="w-8 h-8 rounded bg-gray-50 p-0.5 border border-gray-100 flex items-center justify-center">
                   <img src={p.image} className="w-full h-full object-contain mix-blend-multiply" alt={p.name}/>
                </div>
                <div>
                   <p className="text-xs font-bold text-gray-800 group-hover:text-primary transition-colors whitespace-nowrap">{p.name}</p>
                   <div className="flex gap-2 items-center">
                       <p className="text-[10px] font-bold text-gray-500">{p.price} KWD</p>
                       {p.stock < 5 && p.stock > 0 && (
                        <span className="text-[9px] bg-red-50 text-red-600 px-1.5 rounded-full font-bold whitespace-nowrap">Low Stock</span>
                       )}
                   </div>
                </div>
             </Link>
          ))}
       </div>
    </div>
  );
};
