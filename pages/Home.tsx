
import React from 'react';
import { HeroSlider } from '../components/HeroSlider';
import { ProductRail } from '../components/ProductRail';
import { ProductTicker } from '../components/ProductTicker';
import { 
  Smartphone, Headphones, Watch, Tablet, BatteryCharging, 
  ArrowRight, Zap, Gamepad2, Layers, Tag, Cpu, ShieldCheck
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { Link, useNavigate } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';

export const Home: React.FC = () => {
  const { products, recentlyViewed } = useShop();
  const navigate = useNavigate();

  // Dynamic Product Collections
  const tickerProducts = products.filter(p => p.isTicker);
  const featuredProducts = products.filter(p => p.isFeatured);
  const appleProducts = products.filter(p => p.brand === 'Apple').slice(0, 10);
  const samsungProducts = products.filter(p => p.brand === 'Samsung').slice(0, 10);
  const budgetProducts = products.filter(p => p.price < 100).slice(0, 10);
  const audioProducts = products.filter(p => p.category === 'Audio').slice(0, 10);
  const newArrivals = [...products].sort((a, b) => b.price - a.price).slice(0, 12);
  
  const categories = [
    { name: 'Smartphones', icon: Smartphone, query: 'Smartphones' },
    { name: 'Tablets', icon: Tablet, query: 'Tablets' },
    { name: 'Wearables', icon: Watch, query: 'Wearables' },
    { name: 'Audio', icon: Headphones, query: 'Audio' },
    { name: 'Accessories', icon: BatteryCharging, query: 'Accessories' },
    { name: 'Gaming', icon: Gamepad2, query: 'Smartphones' }
  ];

  const brands = [
    { name: 'Apple', icon: Smartphone },
    { name: 'Samsung', icon: Smartphone },
    { name: 'Xiaomi', icon: Smartphone },
    { name: 'Google', icon: Smartphone },
    { name: 'Sony', icon: Headphones },
    { name: 'OnePlus', icon: Smartphone }
  ];

  const BrandPill = ({ name, icon: Icon }: { name: string, icon: any }) => (
      <Link to={`/shop?brand=${name}`} className="flex flex-col items-center gap-2 group min-w-[70px] cursor-pointer">
          <div className="w-14 h-14 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center group-hover:border-primary group-hover:shadow-md transition-all duration-300">
              <Icon size={24} className="text-gray-400 group-hover:text-primary transition-colors"/>
          </div>
          <span className="text-[10px] font-bold text-gray-600 group-hover:text-primary uppercase tracking-wide">{name}</span>
      </Link>
  );

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20 font-sans">
      
      {/* 1. HERO SECTION */}
      <div className="bg-slate-900">
         <HeroSlider />
      </div>

      {/* 2. SCROLLING TICKER */}
      {tickerProducts.length > 0 && (
         <ProductTicker products={tickerProducts} />
      )}

      {/* 3. CATEGORIES & BRANDS GRID */}
      <div className="bg-white py-4 border-b border-gray-100">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
              <div className="flex gap-4 sm:gap-8 overflow-x-auto no-scrollbar pb-2 items-center justify-start md:justify-center">
                 
                 {/* Brands Section */}
                 {brands.map((b) => (
                    <BrandPill key={b.name} name={b.name} icon={b.icon} />
                 ))}

                 <div className="w-px bg-gray-100 mx-2 h-10 self-center hidden md:block"></div>

                 {/* Categories Section */}
                 {categories.map((cat) => (
                    <Link key={cat.name} to={`/shop?category=${cat.query}`} className="flex flex-col items-center gap-2 group min-w-[70px]">
                        <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-500 group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-inner group-hover:shadow-lg">
                           <cat.icon size={22} />
                        </div>
                        <span className="text-[10px] font-bold text-gray-600 group-hover:text-primary uppercase tracking-wide">{cat.name}</span>
                    </Link>
                 ))}
              </div>
          </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 space-y-6 py-6">
        
        {/* 4. NEW ARRIVALS (High Density Grid) */}
        <section>
            <div className="flex justify-between items-end mb-4">
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                    <Zap size={20} className="text-yellow-500 fill-yellow-500" /> New Arrivals
                </h2>
                <Link to="/shop" className="text-xs font-bold text-primary hover:text-secondary flex items-center gap-1 uppercase tracking-wide bg-white px-3 py-1.5 rounded-full border border-gray-100 shadow-sm">
                    View All <ArrowRight size={14}/>
                </Link>
            </div>
            {/* DENSE GRID: 5 columns on MD, 6 on LG */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                {newArrivals.map(p => <ProductCard key={p.id} product={p}/>)}
            </div>
        </section>

        {/* 5. BRAND ZONES (Dual Banners) */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Apple Zone */}
            <div className="bg-gradient-to-br from-gray-100 to-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm relative group">
                <div className="p-6 relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                        <ShieldCheck size={16} className="text-gray-400"/>
                        <span className="text-[10px] font-bold bg-black text-white px-2 py-0.5 rounded uppercase">Official</span>
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 mb-1 tracking-tight">Apple Zone</h2>
                    <p className="text-gray-500 text-sm mb-4">iPhone 15 Pro & Titanium Series</p>
                    <button onClick={() => navigate('/shop?brand=Apple')} className="px-5 py-2 bg-black text-white text-xs font-bold rounded-xl hover:bg-gray-800 transition-all shadow-lg shadow-gray-200">Shop Apple</button>
                </div>
                <div className="absolute right-[-20px] bottom-[-20px] w-48 h-48 opacity-90 transition-transform group-hover:scale-105 duration-500">
                    <img src="https://images.unsplash.com/photo-1696446701796-da61225697cc?w=400&q=80" className="w-full h-full object-contain mix-blend-multiply" alt="iPhone"/>
                </div>
            </div>

            {/* Samsung Zone */}
            <div className="bg-gradient-to-br from-blue-900 to-slate-900 rounded-2xl border border-blue-800 overflow-hidden shadow-sm relative group text-white">
                <div className="p-6 relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                        <Cpu size={16} className="text-blue-300"/>
                        <span className="text-[10px] font-bold bg-blue-500 text-white px-2 py-0.5 rounded uppercase">Galaxy AI</span>
                    </div>
                    <h2 className="text-2xl font-black mb-1 tracking-tight">Samsung Galaxy</h2>
                    <p className="text-blue-200 text-sm mb-4">S24 Ultra & Z Fold Series</p>
                    <button onClick={() => navigate('/shop?brand=Samsung')} className="px-5 py-2 bg-white text-blue-900 text-xs font-bold rounded-xl hover:bg-blue-50 transition-all shadow-lg">Shop Samsung</button>
                </div>
                <div className="absolute right-[-20px] bottom-[-20px] w-48 h-48 opacity-90 transition-transform group-hover:scale-105 duration-500">
                    <img src="https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&q=80" className="w-full h-full object-contain" alt="Samsung"/>
                </div>
            </div>
        </section>

        {/* 6. RAILS */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
             <ProductRail title="Best Selling Audio" products={audioProducts} linkTo="/shop?category=Audio" />
        </section>

        {/* 7. BUDGET & VALUE */}
        <section>
            <div className="flex items-center gap-2 mb-4">
                 <Tag size={20} className="text-green-500"/>
                 <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Under 100 KWD</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                {budgetProducts.map(p => <ProductCard key={p.id} product={p}/>)}
            </div>
        </section>

        {/* 8. FEATURED / RECOMMENDED */}
        <section className="pt-4">
            <div className="flex items-center justify-center gap-3 mb-6">
                 <div className="h-px bg-gray-200 w-12"></div>
                 <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Recommended For You</h2>
                 <div className="h-px bg-gray-200 w-12"></div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                 {featuredProducts.length > 0 
                    ? featuredProducts.map(p => <ProductCard key={p.id} product={p} />) 
                    : products.slice(0, 12).map(p => <ProductCard key={p.id} product={p} />)
                 }
            </div>
            <div className="mt-8 text-center">
                <Link to="/shop" className="px-8 py-3 bg-white border border-gray-200 text-gray-900 font-bold rounded-full hover:bg-gray-50 hover:border-gray-300 transition-all inline-flex items-center gap-2 text-sm shadow-sm">
                    Load More Products <Layers size={14}/>
                </Link>
            </div>
        </section>

        {/* 9. RECENTLY VIEWED RAIL */}
        {recentlyViewed.length > 0 && (
           <div className="mt-8">
               <ProductRail title="Recently Viewed" products={recentlyViewed} bgColor="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-2" />
           </div>
        )}
      </div>
    </div>
  );
};
