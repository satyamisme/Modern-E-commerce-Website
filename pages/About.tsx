
import React from 'react';
import { Smartphone, ShieldCheck, Users, Globe } from 'lucide-react';

export const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-primary text-white py-20 relative overflow-hidden">
         <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-accent/20 rounded-full blur-3xl"></div>
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Connecting Kuwait to the Future</h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">LAKKI PHONES is Kuwait's premier destination for the latest mobile technology, offering authentic products with unmatched service.</p>
         </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
         <div className="bg-white rounded-2xl shadow-xl p-8 grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
               <div className="text-3xl font-bold text-accent mb-1">10k+</div>
               <div className="text-gray-500 text-sm">Happy Customers</div>
            </div>
            <div className="text-center">
               <div className="text-3xl font-bold text-accent mb-1">100%</div>
               <div className="text-gray-500 text-sm">Authentic Products</div>
            </div>
            <div className="text-center">
               <div className="text-3xl font-bold text-accent mb-1">24h</div>
               <div className="text-gray-500 text-sm">Delivery in Kuwait</div>
            </div>
            <div className="text-center">
               <div className="text-3xl font-bold text-accent mb-1">5★</div>
               <div className="text-gray-500 text-sm">Customer Rating</div>
            </div>
         </div>
      </div>

      {/* Values */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
         <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
               <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                  <ShieldCheck size={24} />
               </div>
               <h3 className="text-xl font-bold text-gray-900 mb-2">Official Warranty</h3>
               <p className="text-gray-600">We partner directly with brands like Apple, Samsung, and Xiaomi to guarantee 100% original products with official local warranties.</p>
            </div>
            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
               <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-4">
                  <Smartphone size={24} />
               </div>
               <h3 className="text-xl font-bold text-gray-900 mb-2">Latest Tech First</h3>
               <p className="text-gray-600">Our supply chain ensures that the newest releases land in our store the moment they launch globally.</p>
            </div>
            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
               <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-4">
                  <Users size={24} />
               </div>
               <h3 className="text-xl font-bold text-gray-900 mb-2">Customer First</h3>
               <p className="text-gray-600">From pre-purchase advice from our experts to after-sales support, your satisfaction is our priority.</p>
            </div>
         </div>
      </div>

      {/* Story */}
      <div className="bg-gray-50 py-20">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
               <img src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80" alt="Our Team" className="rounded-2xl shadow-lg" />
            </div>
            <div className="md:w-1/2">
               <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Story</h2>
               <p className="text-gray-600 mb-4 leading-relaxed">
                  Founded in 2020, LAKKI PHONES began with a simple mission: to make premium technology accessible and affordable for everyone in Kuwait. What started as a small online shop has grown into the region's most trusted electronics retailer.
               </p>
               <p className="text-gray-600 leading-relaxed">
                  We understand that a smartphone is more than just a device; it's your connection to the world. That's why we don't just sell phones—we help you find the perfect companion for your lifestyle.
               </p>
            </div>
         </div>
      </div>
    </div>
  );
};