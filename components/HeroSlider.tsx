
import React, { useState, useEffect } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const SLIDES = [
  {
    id: 1,
    title: "Galaxy S24 Ultra",
    subtitle: "Galaxy AI is Here",
    desc: "Experience the new era of mobile AI. Order now and get exclusive freebies worth 80 KWD.",
    cta: "Pre-Order Now",
    link: "/product/3",
    image: "https://picsum.photos/seed/103/800/800",
    bg: "from-slate-900 via-purple-900 to-slate-900",
    accent: "text-purple-400",
    button: "bg-purple-500 hover:bg-purple-600",
    tag: "New Arrival"
  },
  {
    id: 2,
    title: "iPhone 15 Pro",
    subtitle: "Titanium Strong",
    desc: "The lightest, most durable iPhone ever. Now available in all colors and capacities.",
    cta: "Buy Now",
    link: "/product/4",
    image: "https://picsum.photos/seed/104/800/800",
    bg: "from-zinc-900 via-stone-800 to-zinc-950",
    accent: "text-yellow-200",
    button: "bg-yellow-600 hover:bg-yellow-700",
    tag: "Best Seller"
  },
  {
    id: 3,
    title: "Summer Sound",
    subtitle: "Up to 40% Off",
    desc: "Premium noise cancelling headphones and earbuds on sale this week only.",
    cta: "View Offers",
    link: "/shop?category=Audio",
    image: "https://picsum.photos/seed/201/800/800",
    bg: "from-blue-900 via-blue-800 to-slate-900",
    accent: "text-cyan-400",
    button: "bg-cyan-500 hover:bg-cyan-600",
    tag: "Limited Offer"
  }
];

export const HeroSlider: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      handleNext();
    }, 6000);
    return () => clearInterval(timer);
  }, [current]);

  const handleNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrent(prev => (prev === SLIDES.length - 1 ? 0 : prev + 1));
    setTimeout(() => setIsAnimating(false), 500);
  };

  const handlePrev = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrent(prev => (prev === 0 ? SLIDES.length - 1 : prev - 1));
    setTimeout(() => setIsAnimating(false), 500);
  };

  return (
    <div className="relative w-full h-[600px] md:h-[650px] overflow-hidden bg-slate-900">
      {SLIDES.map((slide, index) => (
        <div 
          key={slide.id}
          className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${
            index === current ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          {/* Background & Patterns */}
          <div className={`absolute inset-0 bg-gradient-to-r ${slide.bg}`}></div>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          
          {/* Content Container */}
          <div className="absolute inset-0 flex items-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 w-full items-center gap-12 mt-10 md:mt-0">
                
                {/* Text Content */}
                <div className={`space-y-6 md:space-y-8 text-center md:text-left transition-all duration-700 delay-100 transform ${index === current ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                    <div>
                        <span className={`inline-block px-4 py-1.5 rounded-full border border-white/20 bg-white/10 backdrop-blur-md text-sm font-bold uppercase tracking-wider mb-4 ${slide.accent}`}>
                            {slide.tag}
                        </span>
                        <h2 className={`text-4xl sm:text-5xl md:text-7xl font-black text-white leading-tight mb-2 tracking-tight`}>
                            {slide.title}
                        </h2>
                        <h3 className={`text-2xl md:text-3xl font-bold ${slide.accent}`}>
                            {slide.subtitle}
                        </h3>
                    </div>
                    
                    <p className="text-gray-300 text-base md:text-xl leading-relaxed max-w-lg mx-auto md:mx-0">
                        {slide.desc}
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                        <Link 
                            to={slide.link}
                            className={`px-8 py-4 ${slide.button} text-white font-bold rounded-2xl transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 flex items-center justify-center gap-2`}
                        >
                            {slide.cta} <ArrowRight size={20} />
                        </Link>
                    </div>
                </div>

                {/* Hero Image */}
                <div className={`relative h-full flex items-center justify-center transition-all duration-1000 delay-300 transform ${index === current ? 'translate-x-0 opacity-100' : 'translate-x-20 opacity-0'}`}>
                    <div className={`absolute inset-0 bg-gradient-to-tr ${slide.accent.replace('text-', 'from-')}/20 to-transparent rounded-full blur-3xl animate-pulse`}></div>
                    <img 
                        src={slide.image} 
                        alt={slide.title}
                        className="relative z-10 w-full max-w-sm md:max-w-md lg:max-w-lg object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500"
                    />
                </div>
            </div>
          </div>
        </div>
      ))}

      {/* Controls */}
      <div className="absolute bottom-8 left-0 right-0 z-20 flex justify-center gap-4">
        {SLIDES.map((_, idx) => (
            <button
                key={idx}
                onClick={() => setCurrent(idx)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    idx === current ? 'bg-white w-10' : 'bg-white/30 hover:bg-white/50'
                }`}
            />
        ))}
      </div>

      <button 
        onClick={handlePrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all hidden md:block"
      >
        <ChevronLeft size={24} />
      </button>
      
      <button 
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all hidden md:block"
      >
        <ChevronRight size={24} />
      </button>
    </div>
  );
};
