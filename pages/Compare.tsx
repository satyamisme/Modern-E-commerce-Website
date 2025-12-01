
import React from 'react';
import { useShop } from '../context/ShopContext';
import { Link } from 'react-router-dom';
import { X, ArrowRight, ShoppingBag, ArrowLeftRight } from 'lucide-react';

export const Compare: React.FC = () => {
  const { compareList, removeFromCompare, addToCart } = useShop();

  if (compareList.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6 text-blue-500">
            <ArrowLeftRight size={40} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Compare Products</h2>
        <p className="text-gray-500 mb-8 max-w-md text-center">Add products to comparison to see their differences side-by-side.</p>
        <Link to="/" className="px-8 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 flex items-center gap-2">
          Browse Products <ArrowRight size={18} />
        </Link>
      </div>
    );
  }

  // Collect all unique spec keys
  const allSpecKeys = Array.from(new Set(compareList.flatMap(p => Object.keys(p.specs))));

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Product Comparison</h1>
          <span className="text-gray-500">{compareList.length} items selected</span>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-x-auto">
           <table className="w-full min-w-[800px] table-fixed">
              <thead>
                 <tr>
                    <th className="w-48 p-6 text-left bg-gray-50 border-b border-r border-gray-100 text-sm font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                    {compareList.map(product => (
                       <th key={product.id} className="w-64 p-6 border-b border-gray-100 relative align-top">
                          <button 
                             onClick={() => removeFromCompare(product.id)}
                             className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                          >
                             <X size={18} />
                          </button>
                          <div className="flex flex-col items-center text-center">
                             <img src={`https://picsum.photos/seed/${product.imageSeed}/200/200`} className="w-32 h-32 object-contain mb-4" alt={product.name}/>
                             <Link to={`/product/${product.id}`} className="font-bold text-gray-900 hover:text-blue-600 mb-1">{product.name}</Link>
                             <span className="text-xs text-gray-500 mb-3">{product.brand}</span>
                             <div className="text-xl font-bold text-gray-900 mb-4">${product.price}</div>
                             <button 
                               onClick={() => addToCart(product)}
                               className="w-full py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                             >
                                <ShoppingBag size={14} /> Add to Cart
                             </button>
                          </div>
                       </th>
                    ))}
                    {/* Empty slots filler */}
                    {[...Array(3 - compareList.length)].map((_, i) => (
                       <th key={i} className="w-64 p-6 border-b border-gray-100 bg-gray-50/30">
                          <div className="h-full flex flex-col items-center justify-center text-gray-300 border-2 border-dashed border-gray-200 rounded-xl p-8">
                             <span className="text-sm font-medium">Empty Slot</span>
                          </div>
                       </th>
                    ))}
                 </tr>
              </thead>
              <tbody>
                 {allSpecKeys.map(key => (
                    <tr key={key}>
                       <td className="p-4 border-b border-r border-gray-100 font-medium text-gray-600 capitalize bg-gray-50/50">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                       </td>
                       {compareList.map(product => (
                          <td key={`${product.id}-${key}`} className="p-4 border-b border-gray-100 text-center text-gray-800 text-sm">
                             {product.specs[key as keyof typeof product.specs] || '-'}
                          </td>
                       ))}
                       {[...Array(3 - compareList.length)].map((_, i) => (
                          <td key={i} className="p-4 border-b border-gray-100 bg-gray-50/30"></td>
                       ))}
                    </tr>
                 ))}
                 
                 {/* Rating Row */}
                 <tr>
                    <td className="p-4 border-r border-gray-100 font-medium text-gray-600 bg-gray-50/50">Rating</td>
                    {compareList.map(product => (
                       <td key={product.id} className="p-4 border-gray-100 text-center">
                          <div className="inline-flex items-center gap-1 bg-yellow-50 text-yellow-700 px-2 py-1 rounded text-sm font-bold">
                             {product.rating} / 5
                          </div>
                       </td>
                    ))}
                    {[...Array(3 - compareList.length)].map((_, i) => (
                       <td key={i} className="p-4 bg-gray-50/30"></td>
                    ))}
                 </tr>
              </tbody>
           </table>
        </div>
      </div>
    </div>
  );
};
