
import React from 'react';
import { useShop } from '../context/ShopContext';
import { ProductCard } from '../components/ProductCard';
import { Flame, Clock } from 'lucide-react';

export const DealsPage: React.FC = () => {
  const { products } = useShop();
  
  // Filter products with discounts
  const dealProducts = products.filter(p => p.originalPrice && p.originalPrice > p.price);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-2">
           <Flame className="text-red-500 fill-current animate-pulse" size={28} />
           <h1 className="text-3xl font-bold text-gray-900">Hot Deals</h1>
        </div>
        <p className="text-gray-500 mb-8">Limited time offers you can't miss.</p>
        
        {dealProducts.length === 0 ? (
           <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
              <Clock size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-bold text-gray-900">No active deals right now</h3>
              <p className="text-gray-500">Check back later for new offers!</p>
           </div>
        ) : (
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {dealProducts.map(product => (
                 <ProductCard key={product.id} product={product} />
              ))}
           </div>
        )}
      </div>
    </div>
  );
};
