
import React, { useState } from 'react';
import { useShop } from '../../context/ShopContext';
import { MoreHorizontal, Calendar, AlertTriangle, CheckCircle, Truck, Package, CreditCard, ShieldAlert } from 'lucide-react';
import { Order } from '../../types';

const COLUMNS = [
  { id: 'New', label: 'New Orders', color: 'bg-blue-100 text-blue-700', icon: Package },
  { id: 'Fraud Scan', label: 'Fraud Check', color: 'bg-orange-100 text-orange-700', icon: ShieldAlert },
  { id: 'Processing', label: 'Processing', color: 'bg-yellow-100 text-yellow-700', icon: CheckCircle },
  { id: 'Picking', label: 'Picking', color: 'bg-indigo-100 text-indigo-700', icon: Package },
  { id: 'QC', label: 'Quality Check', color: 'bg-pink-100 text-pink-700', icon: CheckCircle },
  { id: 'Shipping', label: 'Shipping', color: 'bg-purple-100 text-purple-700', icon: Truck },
  { id: 'Delivered', label: 'Delivered', color: 'bg-green-100 text-green-700', icon: CheckCircle }
];

export const OrderKanban: React.FC = () => {
  const { orders, updateOrderStatus, appSettings } = useShop();
  const [draggedOrder, setDraggedOrder] = useState<string | null>(null);

  const getOrdersByStatus = (status: string) => orders.filter(o => {
     if (status === 'New') return o.status === 'New' || !o.status; 
     return o.status === status;
  });

  const handleDragStart = (e: React.DragEvent, orderId: string) => {
    setDraggedOrder(orderId);
    e.dataTransfer.setData('orderId', orderId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, status: Order['status']) => {
    e.preventDefault();
    const orderId = e.dataTransfer.getData('orderId');
    if (orderId) {
       updateOrderStatus(orderId, status);
    }
    setDraggedOrder(null);
  };

  const getFraudRisk = (order: Order) => {
     const score = order.fraudScore || Math.floor(Math.random() * 100);
     if (score > 80) return { level: 'High Risk', color: 'text-red-600 bg-red-50 border-red-100' };
     if (score > 50) return { level: 'Medium Risk', color: 'text-orange-600 bg-orange-50 border-orange-100' };
     return { level: 'Low Risk', color: 'text-green-600 bg-green-50 border-green-100' };
  };

  return (
    <div className="h-[calc(100vh-200px)] overflow-x-auto overflow-y-hidden pb-4">
      <div className="flex gap-4 h-full min-w-[2000px]">
        {COLUMNS.map(col => {
           const colOrders = getOrdersByStatus(col.id);
           
           return (
             <div 
               key={col.id} 
               className="w-80 flex-shrink-0 flex flex-col bg-gray-50 rounded-2xl border border-gray-200/60"
               onDragOver={handleDragOver}
               onDrop={(e) => handleDrop(e, col.id as Order['status'])}
             >
               {/* Column Header */}
               <div className="p-4 flex items-center justify-between border-b border-gray-200/50 bg-white/50 rounded-t-2xl backdrop-blur-sm sticky top-0 z-10">
                  <div className="flex items-center gap-2">
                     <div className={`p-1.5 rounded-lg ${col.color}`}>
                        {React.createElement(col.icon, { size: 14 })}
                     </div>
                     <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wide">{col.label}</h3>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white border border-gray-200 text-gray-600 shadow-sm">
                     {colOrders.length}
                  </span>
               </div>

               {/* Droppable Area */}
               <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                  {colOrders.map(order => {
                     const risk = getFraudRisk(order);
                     return (
                        <div 
                           key={order.id}
                           draggable
                           onDragStart={(e) => handleDragStart(e, order.id)}
                           className={`bg-white p-4 rounded-xl shadow-sm border border-gray-200 cursor-grab active:cursor-grabbing hover:shadow-md transition-all group ${draggedOrder === order.id ? 'opacity-50 scale-95' : 'opacity-100'}`}
                        >
                           <div className="flex justify-between items-start mb-3">
                              <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded font-mono">{order.id}</span>
                              <div className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${risk.color}`}>
                                 {risk.level}
                              </div>
                           </div>
                           
                           <div className="flex items-center gap-3 mb-4">
                              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                                 {order.customer.name.charAt(0)}
                              </div>
                              <div className="overflow-hidden">
                                 <p className="text-sm font-bold text-gray-900 truncate">{order.customer.name}</p>
                                 <p className="text-[10px] text-gray-500 truncate">{order.items.length} items • {order.paymentMethod}</p>
                              </div>
                           </div>

                           <div className="flex items-center justify-between pt-3 border-t border-gray-50 mt-2">
                              <div className="flex flex-col">
                                 <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Total</span>
                                 <span className="text-sm font-black text-slate-900">{order.total} {appSettings.currency}</span>
                              </div>
                              <div className="flex items-center gap-1 text-[10px] text-gray-400 font-medium bg-gray-50 px-2 py-1 rounded-lg">
                                 <Calendar size={12}/> {order.date}
                              </div>
                           </div>
                        </div>
                     );
                  })}
                  {colOrders.length === 0 && (
                     <div className="h-24 flex flex-col items-center justify-center text-gray-300 border-2 border-dashed border-gray-200 rounded-xl m-2 bg-gray-50/50">
                        <span className="text-xs font-medium">No Orders</span>
                     </div>
                  )}
               </div>
             </div>
           );
        })}
      </div>
    </div>
  );
};
