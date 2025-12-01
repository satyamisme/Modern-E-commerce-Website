
import React from 'react';
import { RefreshCcw, AlertCircle, CheckCircle } from 'lucide-react';

export const Returns: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
         <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8 md:p-12">
            <div className="flex items-center gap-4 mb-8">
               <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                  <RefreshCcw size={32} />
               </div>
               <h1 className="text-3xl font-bold text-gray-900">Returns & Refund Policy</h1>
            </div>

            <div className="prose max-w-none text-gray-600">
               <p className="lead text-lg">
                  At LAKKI PHONES, we want you to be completely satisfied with your purchase. If you're not happy with your device, we're here to help.
               </p>

               <h3 className="text-gray-900 font-bold text-xl mt-8 mb-4">14-Day Return Policy</h3>
               <p>
                  You have 14 calendar days to return an item from the date you received it. To be eligible for a return, your item must be:
               </p>
               <ul className="space-y-2 mt-4 mb-6">
                  <li className="flex items-center gap-2"><CheckCircle size={16} className="text-green-500"/> Unused and in the same condition that you received it.</li>
                  <li className="flex items-center gap-2"><CheckCircle size={16} className="text-green-500"/> In the original packaging with all seals intact.</li>
                  <li className="flex items-center gap-2"><CheckCircle size={16} className="text-green-500"/> Accompanied by the receipt or proof of purchase.</li>
               </ul>

               <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-6 rounded-r-lg">
                  <div className="flex gap-3">
                     <AlertCircle className="text-yellow-600 flex-shrink-0" />
                     <p className="text-sm text-yellow-800 m-0">
                        <strong>Note:</strong> Opened software, headphones, and screen protectors cannot be returned for hygiene and copyright reasons unless defective.
                     </p>
                  </div>
               </div>

               <h3 className="text-gray-900 font-bold text-xl mt-8 mb-4">Refunds</h3>
               <p>
                  Once we receive your item, we will inspect it and notify you that we have received your returned item. We will immediately notify you on the status of your refund after inspecting the item.
               </p>
               <p>
                  If your return is approved, we will initiate a refund to your credit card (or original method of payment). You will receive the credit within a certain amount of days, depending on your card issuer's policies.
               </p>

               <h3 className="text-gray-900 font-bold text-xl mt-8 mb-4">Shipping</h3>
               <p>
                  You will be responsible for paying for your own shipping costs for returning your item. Shipping costs are non-refundable. If you receive a refund, the cost of return shipping will be deducted from your refund.
               </p>

               <h3 className="text-gray-900 font-bold text-xl mt-8 mb-4">Contact Us</h3>
               <p>If you have any questions on how to return your item to us, contact us at <span className="font-bold text-primary">support@lakkiphones.com</span>.</p>
            </div>
         </div>
      </div>
    </div>
  );
};
