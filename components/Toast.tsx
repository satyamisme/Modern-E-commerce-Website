import React from 'react';
import { useShop } from '../context/ShopContext';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toast } = useShop();

  if (!toast) return null;

  const icons = {
    success: <CheckCircle className="text-green-500" size={20} />,
    error: <AlertCircle className="text-red-500" size={20} />,
    info: <Info className="text-blue-500" size={20} />
  };

  const bgColors = {
    success: 'bg-green-50 border-green-100',
    error: 'bg-red-50 border-red-100',
    info: 'bg-blue-50 border-blue-100'
  };

  return (
    <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className={`flex items-center gap-3 px-6 py-3 rounded-full shadow-lg border ${bgColors[toast.type]}`}>
        {icons[toast.type]}
        <span className="text-sm font-medium text-gray-800">{toast.message}</span>
      </div>
    </div>
  );
};
