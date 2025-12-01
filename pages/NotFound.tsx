
import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Search } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-[70vh] bg-gray-50 flex flex-col items-center justify-center p-4 text-center">
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100 max-w-lg">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Search size={40} className="text-gray-400" />
        </div>
        <h1 className="text-4xl font-black text-gray-900 mb-2">404</h1>
        <h2 className="text-xl font-bold text-gray-700 mb-4">Page Not Found</h2>
        <p className="text-gray-500 mb-8">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-gray-800 transition-colors"
        >
          <Home size={18} /> Back to Home
        </Link>
      </div>
    </div>
  );
};
