
import React from 'react';
import { Link } from 'react-router-dom';
import { Smartphone, Tablet, Watch, Headphones, BatteryCharging, ArrowRight } from 'lucide-react';

export const CategoriesPage: React.FC = () => {
  const categories = [
    { name: 'Smartphones', icon: Smartphone, color: 'bg-blue-100 text-blue-600', desc: 'Latest flagships and budget phones' },
    { name: 'Tablets', icon: Tablet, color: 'bg-purple-100 text-purple-600', desc: 'iPads, Android tablets & e-readers' },
    { name: 'Wearables', icon: Watch, color: 'bg-green-100 text-green-600', desc: 'Smartwatches and fitness trackers' },
    { name: 'Audio', icon: Headphones, color: 'bg-red-100 text-red-600', desc: 'Headphones, earbuds & speakers' },
    { name: 'Accessories', icon: BatteryCharging, color: 'bg-yellow-100 text-yellow-600', desc: 'Chargers, cases & cables' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Browse Categories</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <Link 
              key={cat.name} 
              to={`/shop?category=${cat.name}`}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all group flex items-center gap-4"
            >
              <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${cat.color}`}>
                <cat.icon size={32} />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors">{cat.name}</h3>
                <p className="text-sm text-gray-500">{cat.desc}</p>
              </div>
              <div className="text-gray-300 group-hover:translate-x-1 transition-transform">
                <ArrowRight size={24} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
