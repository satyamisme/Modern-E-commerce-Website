import React from 'react';

export const SkeletonCard = () => (
  <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 animate-pulse">
    <div className="w-full aspect-[4/5] bg-gray-100 rounded-xl mb-4"></div>
    <div className="h-4 bg-gray-100 rounded w-3/4 mb-2"></div>
    <div className="h-3 bg-gray-100 rounded w-1/2 mb-4"></div>
    <div className="flex justify-between items-center">
       <div className="h-6 bg-gray-100 rounded w-1/3"></div>
       <div className="h-8 bg-gray-100 rounded w-8"></div>
    </div>
  </div>
);

export const SkeletonRow = () => (
  <div className="flex items-center gap-4 p-4 border-b border-gray-50 animate-pulse">
     <div className="w-12 h-12 bg-gray-100 rounded-xl"></div>
     <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-100 rounded w-1/3"></div>
        <div className="h-3 bg-gray-100 rounded w-1/4"></div>
     </div>
     <div className="h-4 bg-gray-100 rounded w-16"></div>
  </div>
);

export const SkeletonDashboard = () => (
   <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {[1,2,3,4].map(i => (
         <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 h-32 animate-pulse">
            <div className="flex justify-between mb-4">
               <div className="w-8 h-8 bg-gray-100 rounded-lg"></div>
               <div className="w-12 h-4 bg-gray-100 rounded-full"></div>
            </div>
            <div className="w-24 h-8 bg-gray-100 rounded mb-1"></div>
            <div className="w-16 h-3 bg-gray-100 rounded"></div>
         </div>
      ))}
   </div>
);
