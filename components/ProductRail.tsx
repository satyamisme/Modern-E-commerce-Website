
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
    <div className={`py-10 ${bgColor}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          {linkTo && (
            <Link to={linkTo} className="text-sm font-semibold text-primary hover:text-accent flex items-center gap-1 transition-colors">
              View All <ArrowRight size={16} />
            </Link>
          )}
        </div>

        <div className="relative group/rail">
          {/* Scroll Buttons */}
          <button 
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 p-3 bg-white shadow-lg rounded-full text-gray-700 opacity-0 group-hover/rail:opacity-100 transition-opacity -ml-4 hidden md:block hover:bg-gray-50 border border-gray-100"
          >
            <ChevronLeft size={24} />
          </button>
          <button 
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 p-3 bg-white shadow-lg rounded-full text-gray-700 opacity-0 group-hover/rail:opacity-100 transition-opacity -mr-4 hidden md:block hover:bg-gray-50 border border-gray-100"
          >
            <ChevronRight size={24} />
          </button>

          {/* List */}
          <div 
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto no-scrollbar pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 scroll-smooth"
          >
            {products.map((product) => (
              <div key={product.id} className="min-w-[280px] sm:min-w-[260px] max-w-[280px]">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
