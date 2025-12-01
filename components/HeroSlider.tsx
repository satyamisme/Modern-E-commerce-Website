
import React, { useState, useEffect } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useShop } from '../context/ShopContext';

export const HeroSlider: React.FC = () => {
  const { products } = useShop();
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Filter products that should appear in the hero slider
  const heroProducts = products.filter(p => p.isHero).slice(0, 5);
  
  // Fallback slides if no products are marked as hero
  const slides = heroProducts.length > 0 ? heroProducts : products.slice(0, 3);

  useEffect(() => {
    const timer = setInterval(() => {
      handleNext();
    }, 6000);
    return () => clearInterval(timer);
  }, [current, slides.length]);

  const handleNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrent(prev => (prev === slides.length - 1 ? 0 : prev + 1));
    setTimeout(() => setIsAnimating(false), 500);
  };

  const handlePrev = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrent(prev => (prev === 0 ? slides.length - 1 : prev - 1));
    setTimeout(() => setIsAnimating(false), 500);
  };

  if (products.length === 0) {
      return <div className="w-full h-[380px] bg-slate-900 flex items-center justify-center text-white"><Loader2 className="animate-spin mr-2"/> Loading Store...</div>;
  }

  return (
    <div className="relative w-full h-[380px] md:h-[450px] overflow-hidden bg-slate-900 group">
      {slides.map((product, index) => {
        // Determine gradients based on product brand/index (simple logic for visual variety)
        const gradients = [
            "from-slate-900 via-purple-900 to-slate-900",
            "from-zinc-900 via-stone-800 to-zinc-950",
            "from-blue-900 via-blue-800 to-slate-900"
        ];
        const bgGradient = gradients[index % gradients.length];
        
        return (
            <div 
              key={product.id}
              className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${
                index === current ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              {/* Background & Patterns */}
              <div className={`absolute inset-0 bg-gradient-to-r ${bgGradient}`}></div>
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
              
              {/* Content Container */}
              <div className="absolute inset-0 flex items-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 w-full items-center gap-6 md:gap-12 mt-4 md:mt-0">
                    
                    {/* Text Content */}
                    <div className={`space-y-4 md:space-y-6 text-center md:text-left transition-all duration-700 delay-100 transform ${index === current ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                        <div>
                            <span className={`inline-block px-3 py-1 rounded-full border border-white/20 bg-white/10 backdrop-blur-md text-xs font-bold uppercase tracking-wider mb-3 text-yellow-300`}>
                                {product.brand} Feature
                            </span>
                            <h2 className={`text-3xl sm:text-4xl md:text-6xl font-black text-white leading-tight mb-1 tracking-tight`}>
                                {product.heroTitle || product.name}
                            </h2>
                            <h3 className={`text-xl md:text-2xl font-bold text-blue-200`}>
                                {product.heroSubtitle || `${product.price} KWD`}
                            </h3>
                        </div>
                        
                        <p className="text-gray-300 text-sm md:text-lg leading-relaxed max-w-lg mx-auto md:mx-0 line-clamp-2 hidden sm:block">
                            {product.description}
                        </p>
                        
                        <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start pt-2">
                            <Link 
                                to={`/product/${product.id}`}
                                className={`px-6 py-3 bg-white text-slate-900 font-bold rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 flex items-center justify-center gap-2 text-sm md:text-base`}
                            >
                                Buy Now <ArrowRight size={18} />
                            </Link>
                        </div>
                    </div>

                    {/* Hero Image */}
                    <div className={`relative h-full flex items-center justify-center transition-all duration-1000 delay-300 transform ${index === current ? 'translate-x-0 opacity-100' : 'translate-x-20 opacity-0'}`}>
                        <div className={`absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-transparent rounded-full blur-3xl animate-pulse`}></div>
                        <img 
                            src={product.heroImage || product.image || product.images?.[0]} 
                            alt={product.name}
                            className="relative z-10 w-full max-w-[280px] md:max-w-sm lg:max-w-md object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500 max-h-[300px] md:max-h-[400px]"
                        />
                    </div>
                </div>
              </div>
            </div>
        );
      })}

      {/* Controls */}
      <div className="absolute bottom-6 left-0 right-0 z-20 flex justify-center gap-3">
        {slides.map((_, idx) => (
            <button
                key={idx}
                onClick={() => setCurrent(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === current ? 'bg-white w-8' : 'bg-white/30 w-4 hover:bg-white/50'
                }`}
            />
        ))}
      </div>

      <button 
        onClick={handlePrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all hidden md:flex opacity-0 group-hover:opacity-100"
      >
        <ChevronLeft size={20} />
      </button>
      
      <button 
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all hidden md:flex opacity-0 group-hover:opacity-100"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
};
