
import React from 'react';
import { Smartphone, Mail, Facebook, Twitter, Instagram, CreditCard, Link as LinkIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-white pt-20 pb-10 mt-12 mb-16 md:mb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Newsletter Strip */}
        <div className="bg-primary rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 mb-16 relative overflow-hidden shadow-2xl">
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
           <div className="relative z-10">
              <h3 className="text-3xl font-black mb-2 tracking-tight">Join the LAKKI Club</h3>
              <p className="text-blue-200 text-lg">Get 10% off your first order when you subscribe.</p>
           </div>
           <div className="flex w-full md:w-auto gap-2 relative z-10">
              <input type="email" placeholder="Your email address" className="flex-1 md:w-80 px-5 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-blue-200/50 outline-none focus:bg-white/20 focus:border-secondary transition-all" />
              <button className="px-8 py-4 bg-secondary text-primary font-bold rounded-xl hover:bg-white transition-colors shadow-lg">Subscribe</button>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 border-b border-white/10 pb-12">
          <div className="col-span-1 md:col-span-2 space-y-6">
            <div className="flex items-center gap-3">
               <div className="p-2.5 bg-white/10 rounded-xl text-secondary border border-white/10">
                  <Smartphone size={24} />
               </div>
               <span className="text-2xl font-black tracking-tight">LAKKI <span className="text-secondary">PHONES</span></span>
            </div>
            <p className="text-gray-400 max-w-sm text-sm leading-relaxed">
              Kuwait's #1 destination for premium electronics. We partner directly with global brands to bring you the latest technology with official warranty and unmatchable service.
            </p>
            <div className="flex gap-4 pt-2">
               <a href="https://linktr.ee/lakkiphones" target="_blank" rel="noreferrer" className="p-3 bg-white/5 rounded-full text-gray-400 hover:bg-secondary hover:text-primary transition-all hover:scale-110 flex items-center gap-2 pr-4">
                  <LinkIcon size={18} /> <span className="text-xs font-bold">Connect with us</span>
               </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold text-white mb-6 uppercase tracking-wider text-sm">Shop</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li><Link to="/shop" className="hover:text-secondary transition-colors block">Smartphones</Link></li>
              <li><Link to="/shop" className="hover:text-secondary transition-colors block">Tablets & Pads</Link></li>
              <li><Link to="/shop" className="hover:text-secondary transition-colors block">Audio & Sound</Link></li>
              <li><Link to="/deals" className="hover:text-secondary transition-colors block font-bold text-accent">Flash Deals</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-white mb-6 uppercase tracking-wider text-sm">Support</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li><Link to="/track-order" className="hover:text-secondary transition-colors block">Track Order</Link></li>
              <li><Link to="/returns" className="hover:text-secondary transition-colors block">Returns Policy</Link></li>
              <li><Link to="/faq" className="hover:text-secondary transition-colors block">FAQs</Link></li>
              <li><Link to="/contact" className="hover:text-secondary transition-colors block">Contact Us</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-gray-500 font-medium">
           <p>© {new Date().getFullYear()} LAKKI PHONES General Trading Co. All rights reserved.</p>
           <div className="flex items-center gap-6">
              <span className="flex items-center gap-2"><CreditCard size={14} className="text-gray-400"/> Secure Payments</span>
              <span className="text-gray-300 font-bold">KNET</span>
              <span className="text-gray-300 font-bold">VISA</span>
              <span className="text-gray-300 font-bold">MasterCard</span>
           </div>
        </div>
      </div>
    </footer>
  );
};