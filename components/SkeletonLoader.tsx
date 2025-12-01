
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

export const SkeletonProductDetails = () => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse">
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
       <div className="lg:col-span-5">
          <div className="bg-gray-100 rounded-3xl aspect-square mb-4"></div>
          <div className="grid grid-cols-5 gap-3">
             {[1,2,3,4,5].map(i => <div key={i} className="bg-gray-100 rounded-xl aspect-square"></div>)}
          </div>
       </div>
       <div className="lg:col-span-4 space-y-6">
          <div className="h-10 bg-gray-100 rounded-lg w-3/4"></div>
          <div className="h-6 bg-gray-100 rounded-lg w-1/4"></div>
          <div className="h-px bg-gray-100 my-4"></div>
          <div className="h-12 bg-gray-100 rounded-lg w-1/2"></div>
          <div className="space-y-3">
             <div className="h-16 bg-gray-100 rounded-xl"></div>
             <div className="h-16 bg-gray-100 rounded-xl"></div>
          </div>
       </div>
       <div className="lg:col-span-3">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 space-y-4">
             <div className="h-12 bg-gray-100 rounded-xl"></div>
             <div className="h-12 bg-gray-100 rounded-xl"></div>
             <div className="h-12 bg-gray-100 rounded-xl"></div>
          </div>
       </div>
    </div>
  </div>
);

export const SkeletonTable = () => (
  <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
     <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between">
        <div className="h-6 bg-gray-200 rounded w-32"></div>
        <div className="h-6 bg-gray-200 rounded w-24"></div>
     </div>
     <div className="p-0">
        {[1,2,3,4,5].map(i => (
           <div key={i} className="flex items-center gap-4 p-5 border-b border-gray-50 last:border-0">
              <div className="w-10 h-10 bg-gray-100 rounded-lg"></div>
              <div className="flex-1 space-y-2">
                 <div className="h-4 bg-gray-100 rounded w-1/3"></div>
                 <div className="h-3 bg-gray-100 rounded w-1/4"></div>
              </div>
              <div className="h-8 bg-gray-100 rounded w-20"></div>
           </div>
        ))}
     </div>
  </div>
);
