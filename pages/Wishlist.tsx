import React from 'react';
import { useShop } from '../context/ShopContext';
import { ProductCard } from '../components/ProductCard';
import { Heart, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Wishlist: React.FC = () => {
  const { wishlist } = useShop();

  if (wishlist.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
            <Heart size={40} className="text-red-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Wishlist is empty</h2>
        <p className="text-gray-500 mb-8">Save items you want to buy later!</p>
        <Link to="/" className="px-8 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 flex items-center gap-2">
          Start Shopping <ArrowRight size={18} />
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-8">
            <Heart className="text-red-500 fill-current" size={28} />
            <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
            <span className="text-gray-400 text-lg font-medium">({wishlist.length})</span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {wishlist.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
};
