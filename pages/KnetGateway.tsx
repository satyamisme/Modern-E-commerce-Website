
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, ChevronLeft, CreditCard } from 'lucide-react';

export const KnetGateway: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const amount = searchParams.get('amount');
  const ref = searchParams.get('ref');
  const [pin, setPin] = useState('');
  const [bank, setBank] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!amount || !ref) {
      alert("Invalid payment session");
      navigate('/');
    }
  }, [amount, ref, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Simulate network delay
    setTimeout(() => {
      // Success Redirect
      const successParams = new URLSearchParams();
      successParams.append('ref', ref || '');
      successParams.append('status', 'success');
      successParams.append('txId', `TXN-${Date.now()}`);
      navigate(`/order-confirmation?${successParams.toString()}`);
    }, 2000);
  };

  const handleCancel = () => {
    navigate('/checkout');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden border border-gray-300">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 to-blue-800 p-4 flex justify-between items-center text-white">
           <div className="flex items-center gap-2">
              <div className="bg-white/10 p-1.5 rounded">
                 <span className="font-bold tracking-widest text-lg">KNET</span>
              </div>
              <div className="h-6 w-px bg-white/20"></div>
              <span className="text-sm font-medium">Payment Gateway</span>
           </div>
           <ShieldCheck size={20} className="text-green-400" />
        </div>

        {/* Merchant Info */}
        <div className="bg-blue-50 p-4 border-b border-blue-100 flex justify-between items-center">
           <div>
              <p className="text-xs text-blue-600 font-bold uppercase tracking-wide">Merchant</p>
              <p className="text-sm font-bold text-gray-800">LAKKI PHONES STORE</p>
           </div>
           <div className="text-right">
              <p className="text-xs text-blue-600 font-bold uppercase tracking-wide">Amount</p>
              <p className="text-xl font-black text-gray-900">{amount} KWD</p>
           </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
           
           <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Select Bank</label>
              <select 
                required 
                value={bank}
                onChange={e => setBank(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50"
              >
                 <option value="">-- Select Your Bank --</option>
                 <option value="NBK">National Bank of Kuwait (NBK)</option>
                 <option value="CBK">Commercial Bank of Kuwait</option>
                 <option value="GULF">Gulf Bank</option>
                 <option value="KFH">Kuwait Finance House</option>
                 <option value="BOUBYAN">Boubyan Bank</option>
                 <option value="BURGAN">Burgan Bank</option>
              </select>
           </div>

           <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Card Number</label>
              <div className="relative">
                 <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                 <input 
                   required
                   type="text" 
                   maxLength={19}
                   placeholder="XXXX XXXX XXXX XXXX"
                   value={cardNumber}
                   onChange={e => setCardNumber(e.target.value.replace(/\D/g,'').replace(/(.{4})/g, '$1 ').trim())}
                   className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                 />
              </div>
           </div>

           <div className="grid grid-cols-2 gap-4">
              <div>
                 <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Expiration Date</label>
                 <input 
                   required
                   type="text" 
                   placeholder="MM / YY"
                   maxLength={5}
                   value={expiry}
                   onChange={e => setExpiry(e.target.value)}
                   className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none font-mono text-center"
                 />
              </div>
              <div>
                 <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Pin Code</label>
                 <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16}/>
                    <input 
                      required
                      type="password" 
                      placeholder="****"
                      maxLength={4}
                      value={pin}
                      onChange={e => setPin(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none font-mono text-center"
                    />
                 </div>
              </div>
           </div>

           <div className="pt-4 flex gap-3">
              <button 
                type="submit"
                disabled={isProcessing}
                className="flex-1 bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition-colors shadow-md disabled:opacity-70 flex justify-center items-center gap-2"
              >
                 {isProcessing ? 'Processing...' : 'Submit Payment'}
              </button>
              <button 
                type="button"
                onClick={handleCancel}
                disabled={isProcessing}
                className="px-6 py-3 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300 transition-colors"
              >
                 Cancel
              </button>
           </div>
        </form>

        <div className="bg-gray-50 p-3 text-center border-t border-gray-200">
           <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
              <Lock size={10} /> 128-bit SSL Encrypted Transaction
           </p>
        </div>
      </div>
    </div>
  );
};
