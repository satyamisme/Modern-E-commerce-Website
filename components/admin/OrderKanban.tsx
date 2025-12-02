
import React, { useState } from 'react';
import { useShop } from '../../context/ShopContext';
import { MoreHorizontal, Calendar, AlertTriangle, CheckCircle, Truck, Package, CreditCard, ShieldAlert, Printer } from 'lucide-react';
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

  const handleDragEnd = () => {
      setDraggedOrder(null);
  };

  const printInvoice = (order: Order) => {
      const popup = window.open('', '_blank', 'width=800,height=600');
      if (!popup) { alert('Popup blocked'); return; }
      
      const itemsHtml = order.items?.map(item => {
        const specs = [];
        if (item.selectedColor) specs.push(`Color: ${item.selectedColor}`);
        if (item.selectedStorage) specs.push(`Storage: ${item.selectedStorage}`);
        
        let imeiHtml = '';
        if (item.scannedImeis && item.scannedImeis.length > 0) {
            imeiHtml = `<div style="font-family: monospace; font-size: 10px; color: #555; margin-top: 4px;">
                <strong>IMEI/SN:</strong> ${item.scannedImeis.join(', ')}
            </div>`;
        }

        return `
        <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px;">
                <span style="font-weight: bold;">${item.name}</span>
                <div style="font-size: 11px; color: #666;">${specs.join(' | ')}</div>
                ${imeiHtml}
            </td>
            <td style="padding: 10px; text-align: center;">${item.quantity}</td>
            <td style="padding: 10px; text-align: right;">${item.price} KWD</td>
            <td style="padding: 10px; text-align: right;">${item.price * item.quantity} KWD</td>
        </tr>
      `}).join('') || '';

      popup.document.write(`
        <html>
          <head>
            <title>Invoice #${order.id}</title>
            <style>
              body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; color: #333; line-height: 1.5; }
              .header { display: flex; justify-content: space-between; margin-bottom: 40px; border-bottom: 2px solid #000; padding-bottom: 20px; }
              .logo { font-size: 24px; font-weight: 900; letter-spacing: -1px; text-transform: uppercase; }
              .invoice-title { font-size: 32px; font-weight: bold; color: #1e3a8a; text-align: right; }
              .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 40px; }
              .detail-box { background: #f9f9f9; padding: 15px; border-radius: 8px; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
              th { text-align: left; padding: 12px 10px; background: #f1f5f9; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-weight: bold; border-bottom: 2px solid #ddd; }
              .totals { float: right; width: 300px; }
              .total-row { display: flex; justify-content: space-between; padding: 5px 0; font-size: 14px; }
              .grand-total { font-size: 18px; font-weight: bold; border-top: 2px solid #000; padding-top: 10px; margin-top: 10px; }
              .footer { margin-top: 80px; text-align: center; font-size: 11px; color: #888; border-top: 1px solid #eee; padding-top: 20px; }
            </style>
          </head>
          <body onload="window.print()">
            <div class="header">
               <div>
                  <div class="logo">LAKKI PHONES</div>
                  <div style="font-size: 12px; margin-top: 5px;">Kuwait City, Al Hamra Tower<br/>Tel: 1800-LAKKI</div>
               </div>
               <div>
                  <div class="invoice-title">INVOICE</div>
                  <div style="text-align: right; margin-top: 5px; font-size: 14px;">
                     <strong>#${order.id}</strong><br/>
                     Date: ${order.date}
                  </div>
               </div>
            </div>

            <div class="details-grid">
               <div class="detail-box">
                  <strong style="display:block; margin-bottom: 5px; color: #666; font-size: 12px; text-transform: uppercase;">Bill To</strong>
                  <div style="font-weight: bold; font-size: 16px;">${order.customer.name}</div>
                  <div>${order.customer.phone}</div>
                  <div style="font-size: 13px; margin-top: 2px;">${order.customer.address}</div>
               </div>
               <div class="detail-box" style="text-align: right;">
                  <strong style="display:block; margin-bottom: 5px; color: #666; font-size: 12px; text-transform: uppercase;">Order Details</strong>
                  <div>Status: <strong>${order.status}</strong></div>
                  <div>Payment: <strong>${order.paymentMethod}</strong></div>
                  <div>Terms: <strong>Due on Receipt</strong></div>
               </div>
            </div>

            <table>
               <thead>
                  <tr>
                     <th>Item Description</th>
                     <th style="text-align: center;">Qty</th>
                     <th style="text-align: right;">Unit Price</th>
                     <th style="text-align: right;">Total</th>
                  </tr>
               </thead>
               <tbody>
                  ${itemsHtml}
               </tbody>
            </table>

            <div class="totals">
               <div class="total-row">
                  <span>Subtotal:</span>
                  <span>${order.total - appSettings.deliveryFee} KWD</span>
               </div>
               <div class="total-row">
                  <span>Delivery:</span>
                  <span>${appSettings.deliveryFee} KWD</span>
               </div>
               <div class="total-row grand-total">
                  <span>Total Due:</span>
                  <span>${order.total} KWD</span>
               </div>
            </div>
            
            <div style="clear: both;"></div>

            <div class="footer">
               Thank you for shopping with Lakki Phones.<br/>
               For support, contact support@lakkiphones.com<br/>
               This is a computer generated invoice.
            </div>
          </body>
        </html>
      `);
      popup.document.close();
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
                           onDragEnd={handleDragEnd}
                           className={`bg-white p-4 rounded-xl shadow-sm border border-gray-200 cursor-grab active:cursor-grabbing hover:shadow-md transition-all group ${draggedOrder === order.id ? 'opacity-50 scale-95 ring-2 ring-primary ring-offset-2' : 'opacity-100'}`}
                        >
                           <div className="flex justify-between items-start mb-3">
                              <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded font-mono">{order.id}</span>
                              <div className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${risk.color}`}>
                                 {risk.level}
                              </div>
                           </div>
                           
                           <div className="flex items-center gap-3 mb-4">
                              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                                 {order.customer?.name ? order.customer.name.charAt(0) : '?'}
                              </div>
                              <div className="overflow-hidden">
                                 <p className="text-sm font-bold text-gray-900 truncate">{order.customer?.name || 'Unknown'}</p>
                                 <p className="text-[10px] text-gray-500 truncate">{order.items?.length || 0} items • {order.paymentMethod}</p>
                              </div>
                           </div>

                           <div className="flex items-center justify-between pt-3 border-t border-gray-50 mt-2">
                              <div className="flex flex-col">
                                 <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Total</span>
                                 <span className="text-sm font-black text-slate-900">{order.total} {appSettings.currency}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                 <button onClick={() => printInvoice(order)} className="p-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors" title="Print Invoice">
                                    <Printer size={14} />
                                 </button>
                                 <div className="flex items-center gap-1 text-[10px] text-gray-400 font-medium bg-gray-50 px-2 py-1 rounded-lg">
                                    <Calendar size={12}/> {order.date}
                                 </div>
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
