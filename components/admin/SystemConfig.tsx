

import React, { useState } from 'react';
import { useShop } from '../../context/ShopContext';
import { Save, Globe, DollarSign, Truck, Cpu, Shield, CreditCard, Bell, RefreshCw, Smartphone, Share2 } from 'lucide-react';
import { AppSettings } from '../../types';
import { AIProvider } from '../../config';

export const SystemConfig: React.FC = () => {
  const { appSettings, updateSettings, showToast } = useShop();
  const [formData, setFormData] = useState<AppSettings>(appSettings);
  const [activeSection, setActiveSection] = useState<'general' | 'finance' | 'ai' | 'payments' | 'social'>('general');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (field: keyof AppSettings, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSocialChange = (field: string, value: string) => {
      setFormData(prev => ({
          ...prev,
          socialLinks: {
              ...prev.socialLinks,
              [field]: value
          }
      }));
  };

  const handleSave = () => {
    setIsLoading(true);
    // Simulate API save
    setTimeout(() => {
        updateSettings(formData);
        setIsLoading(false);
    }, 800);
  };

  const SectionButton = ({ id, icon: Icon, label }: any) => (
    <button
        onClick={() => setActiveSection(id)}
        className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-colors ${activeSection === id ? 'bg-primary text-white font-bold shadow-lg shadow-primary/20' : 'text-gray-500 hover:bg-gray-50 font-medium'}`}
    >
        <Icon size={18} /> {label}
    </button>
  );

  return (
    <div className="flex flex-col lg:flex-row gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Sidebar Nav */}
        <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 space-y-1 sticky top-24">
                <SectionButton id="general" icon={Globe} label="General Store" />
                <SectionButton id="finance" icon={DollarSign} label="Financials" />
                <SectionButton id="social" icon={Share2} label="Social & Contact" />
                <SectionButton id="ai" icon={Cpu} label="AI Intelligence" />
                <SectionButton id="payments" icon={CreditCard} label="Payments" />
            </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-100">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 capitalize">{activeSection} Settings</h2>
                        <p className="text-sm text-gray-500">Configure global parameters for your store.</p>
                    </div>
                    <button 
                        onClick={handleSave}
                        disabled={isLoading}
                        className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-slate-800 transition-all flex items-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-70"
                    >
                        {isLoading ? <RefreshCw className="animate-spin" size={18}/> : <Save size={18}/>} Save Changes
                    </button>
                </div>

                <div className="space-y-6">
                    {activeSection === 'general' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Store Name</label>
                                <input 
                                    type="text" 
                                    value={formData.storeName}
                                    onChange={e => handleChange('storeName', e.target.value)}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary outline-none font-bold text-gray-900" 
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Currency Code</label>
                                <input 
                                    type="text" 
                                    value={formData.currency}
                                    onChange={e => handleChange('currency', e.target.value)}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary outline-none font-bold text-gray-900" 
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Support Email</label>
                                <input 
                                    type="email" 
                                    value={formData.supportEmail}
                                    onChange={e => handleChange('supportEmail', e.target.value)}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary outline-none" 
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Support Phone (Intl Format)</label>
                                <input 
                                    type="text" 
                                    value={formData.supportPhone}
                                    onChange={e => handleChange('supportPhone', e.target.value)}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary outline-none"
                                    placeholder="+965 9999 9999" 
                                />
                                <p className="text-[10px] text-gray-400 mt-1">Used for WhatsApp integration. Include country code.</p>
                            </div>
                        </div>
                    )}

                    {activeSection === 'finance' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100 col-span-2">
                                <h3 className="font-bold text-blue-900 mb-2">Shipping Rules</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-blue-700/70 uppercase mb-1">Base Delivery Fee</label>
                                        <div className="relative">
                                            <input 
                                                type="number" 
                                                value={formData.deliveryFee}
                                                onChange={e => handleChange('deliveryFee', parseFloat(e.target.value))}
                                                className="w-full p-3 bg-white border border-blue-200 rounded-xl focus:border-blue-500 outline-none font-bold" 
                                            />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">{formData.currency}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-blue-700/70 uppercase mb-1">Free Shipping Threshold</label>
                                        <div className="relative">
                                            <input 
                                                type="number" 
                                                value={formData.freeShippingThreshold}
                                                onChange={e => handleChange('freeShippingThreshold', parseFloat(e.target.value))}
                                                className="w-full p-3 bg-white border border-blue-200 rounded-xl focus:border-blue-500 outline-none font-bold" 
                                            />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">{formData.currency}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tax Rate (%)</label>
                                <input 
                                    type="number" 
                                    value={formData.taxRate}
                                    onChange={e => handleChange('taxRate', parseFloat(e.target.value))}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary outline-none" 
                                />
                            </div>
                        </div>
                    )}

                    {activeSection === 'social' && (
                        <div className="grid grid-cols-1 gap-6">
                            <p className="text-sm text-gray-500 mb-2">These links will appear in the footer and contact page.</p>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Instagram URL</label>
                                <input 
                                    type="text" 
                                    value={formData.socialLinks?.instagram || ''}
                                    onChange={e => handleSocialChange('instagram', e.target.value)}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary outline-none" 
                                    placeholder="https://instagram.com/..."
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">TikTok URL</label>
                                <input 
                                    type="text" 
                                    value={formData.socialLinks?.tiktok || ''}
                                    onChange={e => handleSocialChange('tiktok', e.target.value)}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary outline-none" 
                                    placeholder="https://tiktok.com/@..."
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Facebook URL</label>
                                <input 
                                    type="text" 
                                    value={formData.socialLinks?.facebook || ''}
                                    onChange={e => handleSocialChange('facebook', e.target.value)}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary outline-none" 
                                    placeholder="https://facebook.com/..."
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Twitter (X) URL</label>
                                <input 
                                    type="text" 
                                    value={formData.socialLinks?.twitter || ''}
                                    onChange={e => handleSocialChange('twitter', e.target.value)}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary outline-none" 
                                    placeholder="https://twitter.com/..."
                                />
                            </div>
                        </div>
                    )}

                    {activeSection === 'ai' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {['google', 'openai', 'grok', 'deepseek', 'perplexity'].map((provider) => (
                                    <label key={provider} className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${appSettings.aiProvider === provider ? 'border-primary bg-blue-50' : 'border-gray-100 hover:border-gray-200'}`}>
                                        <div className="flex items-center gap-3">
                                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${appSettings.aiProvider === provider ? 'border-primary' : 'border-gray-300'}`}>
                                                {appSettings.aiProvider === provider && <div className="w-2 h-2 bg-primary rounded-full"></div>}
                                            </div>
                                            <input 
                                                type="radio" 
                                                name="aiProvider" 
                                                value={provider} 
                                                checked={appSettings.aiProvider === provider}
                                                onChange={() => {
                                                    // In a real app this would update config, here we just update local state visually
                                                    showToast(`Provider switched to ${provider} (Requires restart)`, 'info');
                                                }}
                                                className="hidden"
                                            />
                                            <span className="font-bold text-gray-900 capitalize">{provider}</span>
                                        </div>
                                    </label>
                                ))}
                            </div>

                            <div className="bg-gray-900 rounded-2xl p-6 text-white">
                                <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Cpu size={20}/> API Configuration</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">API Endpoint</label>
                                        <input type="text" disabled value="https://generativelanguage.googleapis.com" className="w-full p-3 bg-gray-800 border border-gray-700 rounded-xl text-gray-300 font-mono text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">API Key</label>
                                        <input type="password" value="************************" disabled className="w-full p-3 bg-gray-800 border border-gray-700 rounded-xl text-gray-300 font-mono text-sm" />
                                        <p className="text-xs text-gray-500 mt-2">API keys are securely loaded from environment variables.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'payments' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-white rounded-lg shadow-sm">
                                        <CreditCard className="text-blue-600" size={24}/>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">KNET Payment Gateway</h4>
                                        <p className="text-xs text-gray-500">Local debit cards (Kuwait)</p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" checked={formData.enableKnet} onChange={e => handleChange('enableKnet', e.target.checked)} className="sr-only peer"/>
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                </label>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-white rounded-lg shadow-sm">
                                        <Globe className="text-purple-600" size={24}/>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">Credit Cards</h4>
                                        <p className="text-xs text-gray-500">Visa, MasterCard, Amex</p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" checked={formData.enableCreditCard} onChange={e => handleChange('enableCreditCard', e.target.checked)} className="sr-only peer"/>
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                </label>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
};