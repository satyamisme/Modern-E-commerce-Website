

import React from 'react';
import { useShop } from '../../context/ShopContext';
import { RefreshCcw, CheckCircle, XCircle, Clock, Package } from 'lucide-react';

export const ReturnsManager: React.FC = () => {
  const { returns, updateReturnStatus } = useShop();

  const getStatusColor = (status: string) => {
     switch(status) {
        case 'Approved': return 'bg-green-100 text-green-700 border-green-200';
        case 'Rejected': return 'bg-red-100 text-red-700 border-red-200';
        case 'Completed': return 'bg-blue-100 text-blue-700 border-blue-200';
        default: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
     }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
       <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div>
             <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <RefreshCcw size={24} className="text-primary"/> Returns Management
             </h2>
             <p className="text-sm text-gray-500">Process refund requests and exchanges.</p>
          </div>
          <div className="flex gap-2">
             <div className="px-4 py-2 bg-yellow-50 text-yellow-700 rounded-lg text-sm font-bold border border-yellow-100">
                {returns.filter(r => r.status === 'Pending').length} Pending
             </div>
          </div>
       </div>

       <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          {returns.length === 0 ? (
             <div className="p-12 text-center text-gray-400">
                <Package size={48} className="mx-auto mb-4 opacity-20"/>
                <p>No return requests found.</p>
             </div>
          ) : (
             <table className="w-full text-left">
                <thead className="bg-gray-50/50 text-gray-400 text-xs uppercase font-bold tracking-wider">
                   <tr>
                      <th className="p-5">Request ID</th>
                      <th className="p-5">Order / Customer</th>
                      <th className="p-5">Reason & Details</th>
                      <th className="p-5">Condition</th>
                      <th className="p-5">Status</th>
                      <th className="p-5 text-right">Actions</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                   {returns.map(req => (
                      <tr key={req.id} className="hover:bg-gray-50/50 transition-colors">
                         <td className="p-5 font-mono text-xs font-bold text-gray-500">{req.id}</td>
                         <td className="p-5">
                            <p className="font-bold text-gray-900 text-sm">{req.orderId}</p>
                            <p className="text-xs text-gray-500">{req.customerEmail}</p>
                         </td>
                         <td className="p-5 max-w-xs">
                            <span className="font-bold text-gray-800 block text-xs mb-1">{req.reason}</span>
                            <p className="text-xs text-gray-500 truncate" title={req.details}>{req.details}</p>
                         </td>
                         <td className="p-5">
                            <span className={`text-[10px] font-bold px-2 py-1 rounded border ${req.condition === 'Sealed' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-orange-50 text-orange-700 border-orange-200'}`}>
                               {req.condition}
                            </span>
                         </td>
                         <td className="p-5">
                            <span className={`text-[10px] font-bold px-2 py-1 rounded border ${getStatusColor(req.status)}`}>
                               {req.status}
                            </span>
                         </td>
                         <td className="p-5 text-right">
                            {req.status === 'Pending' && (
                               <div className="flex items-center justify-end gap-2">
                                  <button 
                                     onClick={() => updateReturnStatus(req.id, 'Approved')}
                                     className="p-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                                     title="Approve Refund"
                                  >
                                     <CheckCircle size={18}/>
                                  </button>
                                  <button 
                                     onClick={() => updateReturnStatus(req.id, 'Rejected')}
                                     className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                     title="Reject Request"
                                  >
                                     <XCircle size={18}/>
                                  </button>
                               </div>
                            )}
                         </td>
                      </tr>
                   ))}
                </tbody>
             </table>
          )}
       </div>
    </div>
  );
};