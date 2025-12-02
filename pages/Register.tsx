

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { Smartphone, Mail, Lock, User, ArrowRight } from 'lucide-react';

export const Register: React.FC = () => {
  const { register } = useShop();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await register(name, email, password);
    setIsLoading(false);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
       <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden border border-gray-100">
          <div className="p-8 text-center bg-white border-b border-gray-100">
             <h2 className="text-2xl font-bold text-gray-900 mb-1">Create Account</h2>
             <p className="text-gray-500 text-sm">Join Lumina Mobile for exclusive deals</p>
          </div>

          <div className="p-8">
             <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                   <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input 
                        type="text" 
                        required 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent/50 focus:border-accent outline-none transition-all"
                        placeholder="John Doe"
                      />
                   </div>
                </div>

                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                   <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input 
                        type="email" 
                        required 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent/50 focus:border-accent outline-none transition-all"
                        placeholder="you@example.com"
                      />
                   </div>
                </div>

                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                   <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input 
                        type="password" 
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent/50 focus:border-accent outline-none transition-all"
                        placeholder="Create a strong password"
                      />
                   </div>
                </div>

                <div className="flex items-start gap-2">
                   <input type="checkbox" required className="mt-1 rounded border-gray-300 text-accent focus:ring-accent" />
                   <span className="text-xs text-gray-500">I agree to the <a href="#" className="text-accent underline">Terms of Service</a> and <a href="#" className="text-accent underline">Privacy Policy</a>.</span>
                </div>

                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-gray-800 transition-all shadow-lg shadow-gray-900/10 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                   {isLoading ? (
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                   ) : (
                      <>Create Account <ArrowRight size={18} /></>
                   )}
                </button>
             </form>

             <div className="mt-8 text-center">
                <p className="text-gray-500 text-sm">
                   Already have an account? <Link to="/login" className="font-bold text-accent hover:underline">Sign In</Link>
                </p>
             </div>
          </div>
       </div>
    </div>
  );
};