
import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, Navigate } from 'react-router-dom';
import { CheckCircle, Package, ArrowRight, Download } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const OrderConfirmation: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { clearCart, createOrder, cart, user, appSettings, totalAmount } = useShop();
  const [orderId, setOrderId] = useState<string | null>(null);
  const [processed, setProcessed] = useState(false);

  const ref = searchParams.get('ref');
  const status = searchParams.get('status');
  const txId = searchParams.get('txId');

  useEffect(() => {
    if (status === 'success' && ref && !processed && cart.length > 0) {
       // Retrieve customer info from session storage
       const savedCheckout = sessionStorage.getItem('pendingCheckout');
       const checkoutData = savedCheckout ? JSON.parse(savedCheckout) : null;

       // Create the order in system
       const newOrder = createOrder({
          total: totalAmount + (totalAmount >= appSettings.freeShippingThreshold ? 0 : appSettings.deliveryFee),
          paymentMethod: checkoutData?.paymentMethod === 'credit' ? 'Credit Card' : 'KNET',
          items: [...cart],
          customer: checkoutData?.customer || {
             name: user?.name || 'Guest',
             email: user?.email || 'guest@example.com',
             phone: '99999999',
             address: 'Kuwait City'
          }
       });
       setOrderId(newOrder.id);
       clearCart();
       sessionStorage.removeItem('pendingCheckout'); // Clean up
       setProcessed(true);
    }
  }, [status, ref, processed, cart]);

  if (!ref || status !== 'success') {
     return <Navigate to="/" />;
  }

  if (!processed && cart.length === 0) {
     // Safety net if page refreshed
     return <Navigate to="/account" />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl text-center max-w-lg w-full border border-gray-100 animate-in zoom-in-95 duration-300">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
          <CheckCircle className="text-green-500" size={48} />
        </div>
        
        <h1 className="text-3xl font-black text-gray-900 mb-2">Payment Successful!</h1>
        <p className="text-gray-500 mb-8 text-lg">Thank you for your purchase. Your order has been confirmed.</p>
        
        <div className="bg-gray-50 p-6 rounded-2xl mb-8 text-left border border-gray-200">
           <div className="flex justify-between mb-3 pb-3 border-b border-gray-200">
              <span className="text-gray-500">Order Reference</span>
              <span className="font-bold text-gray-900 font-mono">{orderId || ref}</span>
           </div>
           <div className="flex justify-between mb-3">
              <span className="text-gray-500">Transaction ID</span>
              <span className="font-medium text-gray-900 font-mono text-sm">{txId}</span>
           </div>
           <div className="flex justify-between items-center">
              <span className="text-gray-500">Payment Method</span>
              <span className="font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded text-xs">KNET</span>
           </div>
        </div>

        <div className="space-y-3">
           <Link to="/account" className="w-full flex items-center justify-center gap-2 py-4 bg-primary text-white rounded-xl font-bold hover:bg-gray-800 transition-colors shadow-lg shadow-gray-900/20">
              <Package size={20} /> Track Order
           </Link>
           <Link to="/" className="w-full flex items-center justify-center gap-2 py-4 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors">
              Continue Shopping <ArrowRight size={20} />
           </Link>
        </div>
      </div>
    </div>
  );
};
