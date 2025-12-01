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
    image: "https://picsum.photos/seed/103/800/800",
    bg: "from-slate-900 via-purple-900 to-slate-900",
    accent: "text-purple-400",
    tag: "New Arrival"
  },
  {
    id: 2,
    title: "iPhone 15 Pro",
    subtitle: "Titanium Strong",
    desc: "The lightest, most durable iPhone ever. Now available in all colors and capacities.",
    cta: "Buy Now",
    image: "https://picsum.photos/seed/104/800/800",
    bg: "from-zinc-900 via-stone-800 to-zinc-950",
    accent: "text-yellow-200",
    tag: "Best Seller"
  },
  {
    id: 3,
    title: "Summer Sound",
    subtitle: "Up to 40% Off",
    desc: "Premium noise cancelling headphones and earbuds on sale this week only.",
    cta: "View Offers",
    image: "https://picsum.photos/seed/201/800/800",
    bg: "from-blue-900 via-blue-800 to-slate-900",
    accent: "text-white",
    tag: "Limited Offer"
  }
];

export const HeroSlider: React.FC = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(prev => (prev === SLIDES.length - 1 ? 0 : prev + 1));
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrent(prev => (prev === SLIDES.length - 1 ? 0 : prev + 1));
  const prevSlide = () => setCurrent(prev => (prev === 0 ? SLIDES.length - 1 : prev - 1));

  return (
    <div className="relative w-full h-[500px] md:h-[600px] overflow-hidden rounded-[2.5rem] shadow-2xl mx-auto group">
      {SLIDES.map((slide, index) => (
        <div 
          key={slide.id}
          className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
            index === current ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          {/* Background */}
          <div className={`absolute inset-0 bg-gradient-to-r ${slide.bg}`}></div>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          
          {/* Content */}
          <div className="absolute inset-0 flex items-center max-w-7xl mx-auto px-6 md:px-16">
            <div className="grid grid-cols-