
import React, { useRef } from 'react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ProductRailProps {
  title: string;
  products: Product[];
  linkTo?: string;
  bgColor?: string;
}

export const ProductRail: React.FC<ProductRailProps> = ({ title, products, linkTo, bgColor = "bg-transparent" }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = 300;
      if (direction === 'left') {
        current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  return (
    <div className={`py-6 ${bgColor}`}>
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-end mb-4">
          <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">{title}</h2>
          {linkTo && (
            <Link to={linkTo} className="text-xs font-bold text-primary hover:text-accent flex items-center gap-1 transition-colors uppercase tracking-wide">
              View All <ArrowRight size={14} />
            </Link>
          )}
        </div>

        <div className="relative group/rail">
          {/* Scroll Buttons */}
          <button 
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 p-2 bg-white shadow-lg rounded-full text-gray-700 opacity-0 group-hover/rail:opacity-100 transition-opacity -ml-3 hidden md:block hover:bg-gray-50 border border-gray-100"
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 p-2 bg-white shadow-lg rounded-full text-gray-700 opacity-0 group-hover/rail:opacity-100 transition-opacity -mr-3 hidden md:block hover:bg-gray-50 border border-gray-100"
          >
            <ChevronRight size={20} />
          </button>

          {/* List */}
          <div 
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scroll-smooth"
          >
            {products.map((product) => (
              <div key={product.id} className="min-w-[180px] sm:min-w-[200px] max-w-[220px]">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
