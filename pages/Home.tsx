
import React, { useState, useEffect } from 'react';
import { PRODUCTS } from '../data/products';
import { HeroSlider } from '../components/HeroSlider';
import { ProductRail } from '../components/ProductRail';
import { Smartphone, Headphones, Watch, Truck, ShieldCheck, CreditCard, Flame, Clock, ArrowRight, Star, ThumbsUp, TrendingUp, Tablet } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { Link, useNavigate } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';

export const Home: React.FC = () => {
  const { recentlyViewed } = useShop();
  const [timeLeft, setTimeLeft] = useState({ h: 8, m: 45, s: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
       setTimeLeft(prev => {
         if(prev.s > 0) return {...prev, s: prev.s - 1};
         if(prev.m > 0) return {...prev, m: prev.m - 1, s: 59};
         if(prev.h > 0) return {...prev, h: prev.h - 1, m: 59, s: 59};
         return prev;
       });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const categories = [
    { name: 'Apple iPhone', icon: Smartphone, query: 'Apple' },
    { name: 'Samsung Galaxy', icon: Smartphone, query: 'Samsung' },
    { name: 'Google Pixel', icon: Smartphone, query: 'Google' },
    { name: 'Tablets', icon: Tablet, query: 'Tablets' },
    { name: 'Wearables', icon: Watch, query: 'Wearables' },
    { name: 'Audio', icon: Headphones, query: 'Audio' }
  ];

  const newArrivals = PRODUCTS.slice().sort((a, b) => b.id.localeCompare(a.id)).slice(0, 4);
  const bestSellers = PRODUCTS.filter(p => p.rating >= 4.8).slice(0, 4);
  const recommended = PRODUCTS.filter(p => p.price > 200).slice(0, 4); 

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20 font-sans">
      
      {/* 1. HERO SECTION */}
      <div className="bg-slate-900 pb-20">
         <HeroSlider />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* 2. VALUE PROPOSITION */}
        {/* Negative margin pulls this section up to overlap the hero */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 -mt-24 md:-mt-32 relative z-20 mb-20">
            {[
                { icon: Truck, title: "Free Delivery", sub: "All over Kuwait" },
                { icon: ShieldCheck, title: "2-Year Warranty", sub: "Official Guarantee" },
                { icon: CreditCard, title: "KNET Installments", sub: "0% Interest Plans" },
                { icon: Headphones, title: "24/7 Support", sub: "Expert Assistance" },
            ].map((item, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl shadow-xl shadow-slate-900/10 flex flex-col items-center text-center border border-gray-100 hover:-translate-y-2 transition-transform duration-300 group">
                  <div className="p-4 bg-gray-50 text-primary rounded-full mb-4 group-hover:bg-primary group-hover:text-secondary transition-colors duration-300">
                      <item.icon size={28} />
                  </div>
                  <h4 className="font-bold text-gray-900 text-sm md:text-base mb-1">{item.title}</h4>
                  <p className="text-xs md:text-sm text-gray-500 font-medium">{item.sub}</p>
                </div>
            ))}
        </div>

        {/* 3. SMART CATEGORY GRID */}
        <div className="mb-20">
          <div className="flex flex-col sm:flex-row justify-between items-end mb-8 gap-4">
             <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Shop by Category</h2>
                <p className="text-gray-500 font-medium">Find your perfect device from our premium collections</p>
             </div>
             <Link to="/categories" className="text-primary font-bold text-sm flex items-center gap-1 hover:text-secondary transition-colors px-4 py-2 bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md whitespace-nowrap">
                View All <ArrowRight size={16}/>
             </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat, idx) => (
              <Link
                key={cat.name}
                to={`/shop?category=${cat.query === 'Audio' ? 'Audio' : cat.query === 'Wearables' ? 'Wearables' : cat.query === 'Tablets' ? 'Tablets' : 'Smartphones'}&brand=${['Apple', 'Samsung', 'Google'].includes(cat.query) ? cat.query : ''}`}
                className="group relative overflow-hidden rounded-2xl bg-white border border-gray-100 hover:border-primary/50 transition-all hover:shadow-xl aspect-[4/5] flex flex-col items-center justify-center p-6 text-center"
              >
                <div className="mb-4 p-5 bg-gray-50 rounded-full text-gray-600 group-hover:bg-primary group-hover:text-secondary transition-all duration-300 group-hover:scale-110 shadow-sm">
                  <cat.icon size={32} />
                </div>
                <span className="font-bold text-gray-900 group-hover:text-primary transition-colors leading-tight">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* 4. DEAL OF THE DAY */}
        <div className="mb-20">
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-[2.5rem] p-8 md:p-16 relative overflow-hidden text-white shadow-2xl">
             <div className="absolute top-0 right-0 p-6 bg-accent rounded-bl-[2.5rem] z-20 shadow-lg">
                <div className="flex items-center gap-3 font-black text-white text-lg tracking-wider">
                   <Flame size={24} className="fill-white animate-pulse" />
                   <span>DEAL OF THE DAY</span>
                </div>
             </div>
             
             {/* Background Decoration */}
             <div className="absolute top-0 right-0 -mr-32 -mt-32 w-[600px] h-[600px] bg-primary/30 rounded-full blur-[100px] mix-blend-screen pointer-events-none"></div>
             <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[80px] mix-blend-screen pointer-events-none"></div>

             <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16 relative z-10">
                <div className="w-full lg:w-5/12 flex justify-center order-2 lg:order-1">
                   <div className="relative group w-full max-w-sm lg:max-w-md">
                      <div className="absolute inset-0 bg-white/10 rounded-full blur-3xl transform group-hover:scale-110 transition-transform duration-700"></div>
                      <img src="https://picsum.photos/seed/103/500/500" className="w-full h-auto object-contain relative z-10 drop-shadow-2xl hover:scale-105 transition-transform duration-500" alt="Deal Product"/>
                   </div>
                </div>

                <div className="w-full lg:w-7/12 space-y-8 text-center lg:text-left order-1 lg:order-2">
                   <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full text-sm font-bold text-secondary border border-white/10 backdrop-blur-md shadow-sm">
                      <Star size={14} className="fill-secondary"/> #1 Best Selling Flagship
                   </div>
                   
                   <div className="space-y-4">
                       <h2 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight">Samsung Galaxy <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">S24 Ultra</span></h2>
                       <p className="text-gray-300 text-lg md:text-xl leading-relaxed max-w-xl mx-auto lg:mx-0">
                          Experience the new era of mobile AI. Live Translate, Note Assist, and the most powerful camera system on Galaxy.
                       </p>
                   </div>
                   
                   <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 md:gap-8 bg-white/5 p-6 rounded-2xl border border-white/5 backdrop-blur-sm w-fit mx-auto lg:mx-0">
                      <div className="flex flex-col items-center lg:items-start">
                         <span className="text-sm text-gray-400 font-bold line-through mb-1">450.000 KWD</span>
                         <span className="text-4xl md:text-5xl font-black text-white tracking-tight">390 <span className="text-xl text-secondary">KWD</span></span>
                      </div>
                      <div className="h-12 w-px bg-white/10 hidden md:block"></div>
                      <div className="flex flex-col gap-1 items-center lg:items-start">
                         <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">Offer Ends In</span>
                         <div className="flex items-center gap-3 font-mono font-bold text-accent text-2xl">
                            <Clock size={24} />
                            <span>{timeLeft.h}:{timeLeft.m}:{timeLeft.s}</span>
                         </div>
                      </div>
                   </div>

                   <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
                      <Link to="/product/3" className="px-10 py-4 bg-secondary text-primary font-black text-lg rounded-xl hover:bg-white hover:scale-105 transition-all shadow-lg shadow-secondary/20 flex items-center justify-center gap-2">
                         Buy Now <ArrowRight size={22}/>
                      </Link>
                      <Link to="/deals" className="px-10 py-4 bg-white/5 border border-white/20 text-white font-bold text-lg rounded-xl hover:bg-white/10 transition-all flex items-center justify-center backdrop-blur-sm">
                         View All Deals
                      </Link>
                   </div>
                   
                   <p className="text-sm text-gray-500 font-medium flex items-center justify-center lg:justify-start gap-2">
                      <ShieldCheck size={16} className="text-green-500"/> Official 1-Year Samsung Warranty Included
                   </p>
                </div>
             </div>
          </div>
       </div>

       {/* 5. PERSONALIZED SECTIONS */}
       <div className="space-y-24">
           {/* Recommended */}
           <section>
              <div className="flex items-center gap-3 mb-8">
                 <div className="p-3 bg-primary/10 rounded-xl text-primary"><ThumbsUp size={24}/></div>
                 <div>
                    <h2 className="text-3xl font-black text-gray-900">Recommended For You</h2>
                    <p className="text-gray-500 font-medium">Curated selections based on your interests</p>
                 </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                 {recommended.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
           </section>

           {/* Trending */}
           <section>
              <div className="flex justify-between items-end mb-8">
                 <div className="flex items-center gap-3">
                     <div className="p-3 bg-red-50 rounded-xl text-red-500"><TrendingUp size={24}/></div>
                     <div>
                        <h2 className="text-3xl font-black text-gray-900">Trending Now</h2>
                        <p className="text-gray-500 font-medium">What other customers are buying in Kuwait</p>
                     </div>
                 </div>
                 <Link to="/shop" className="text-primary font-bold text-sm flex items-center gap-2 hover:text-secondary transition-colors bg-white px-4 py-2 rounded-lg border border-gray-100 shadow-sm">See All <ArrowRight size={16}/></Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                 {bestSellers.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
           </section>
       </div>

       {/* 6. PROMO BANNER */}
       <div className="my-24">
           <div className="bg-primary rounded-[2.5rem] p-10 md:p-20 relative overflow-hidden flex flex-col md:flex-row items-center justify-between shadow-2xl">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
              
              <div className="relative z-10 max-w-xl text-center md:text-left text-white mb-10 md:mb-0">
                 <span className="text-secondary font-bold tracking-[0.2em] uppercase text-sm mb-4 block bg-white/10 w-fit px-3 py-1 rounded-md mx-auto md:mx-0">Premium Audio</span>
                 <h3 className="text-4xl md:text-6xl font-black mb-6 leading-none">Immerse Yourself <br/> in Pure Sound</h3>
                 <p className="text-blue-100 mb-10 text-xl leading-relaxed">Experience studio quality sound with our premium collection of noise-cancelling headphones from Sony, Bose & Apple.</p>
                 <button 
                  onClick={() => navigate('/shop?category=Audio')}
                  className="px-10 py-4 bg-white text-primary font-black text-lg rounded-full hover:bg-secondary hover:text-primary transition-all shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95"
                >
                  Shop Audio Collection
                </button>
              </div>
              <div className="relative z-10 w-full md:w-auto flex justify-center">
                 <div className="absolute inset-0 bg-secondary/30 rounded-full blur-3xl transform scale-75"></div>
                 <img src="https://picsum.photos/seed/201/500/500" className="w-64 md:w-80 lg:w-96 object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500 -rotate-12 hover:rotate-0" alt="Audio"/>
              </div>
           </div>
       </div>

        {/* 7. RECENTLY VIEWED RAIL */}
        {recentlyViewed.length > 0 && (
           <ProductRail title="Recently Viewed" products={recentlyViewed} bgColor="bg-white rounded-3xl border border-gray-100 shadow-sm px-4" />
        )}
      </div>
    </div>
  );
};
