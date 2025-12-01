
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { Smartphone, Mail, Lock, ArrowRight, Eye, EyeOff, ShieldCheck, Zap } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useShop();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performLogin(email);
  };

  const performLogin = (emailToUse: string) => {
    setIsLoading(true);
    // Simulate API delay
    setTimeout(() => {
       login(emailToUse);
       setIsLoading(false);
       if (emailToUse === 'admin@lakkiphones.com') {
          navigate('/admin');
       } else {
          navigate('/account');
       }
    }, 800);
  };

  const handleAdminShortcut = () => {
    // Fill credentials and auto-submit
    const adminEmail = 'admin@lakkiphones.com';
    setEmail(adminEmail);
    setPassword('admin123'); // Mock password visualization
    performLogin(adminEmail);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
       <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden border border-gray-100">
          <div className="p-8 text-center bg-primary text-white">
             <div className="mx-auto w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4 backdrop-blur-sm">
                <Smartphone size={24} className="text-white"/>
             </div>
             <h2 className="text-2xl font-bold mb-1">Welcome Back</h2>
             <p className="text-blue-200 text-sm">Sign in to continue to Lakki Phones</p>
          </div>

          <div className="p-8">
             <form onSubmit={handleSubmit} className="space-y-5">
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
                        type={showPassword ? "text" : "password"} 
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent/50 focus:border-accent outline-none transition-all"
                        placeholder="••••••••"
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                         {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                   </div>
                   <div className="flex justify-end mt-2">
                      <a href="#" className="text-xs font-semibold text-accent hover:text-blue-600">Forgot Password?</a>
                   </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-gray-800 transition-all shadow-lg shadow-gray-900/10 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                   {isLoading ? (
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                   ) : (
                      <>Sign In <ArrowRight size={18} /></>
                   )}
                </button>
             </form>

             {/* Admin Shortcut for Testing */}
             <div className="mt-6 pt-6 border-t border-gray-100">
                <button 
                  type="button"
                  onClick={handleAdminShortcut}
                  className="w-full py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm transform hover:scale-[1.02]"
                >
                   <ShieldCheck size={18} /> Quick Admin Login
                </button>
                <p className="text-center text-xs text-gray-400 mt-2">For testing purposes only</p>
             </div>

             <div className="mt-8 text-center">
                <p className="text-gray-500 text-sm">
                   Don't have an account? <Link to="/register" className="font-bold text-accent hover:underline">Create Account</Link>
                </p>
             </div>
          </div>
       </div>
    </div>
  );
};
