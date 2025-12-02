






import React, { useState, useEffect } from 'react';
import { useShop } from '../../context/ShopContext';
import { Save, Globe, DollarSign, Truck, Cpu, CreditCard, Share2, Database, AlertTriangle, CheckCircle, RefreshCw, RotateCcw, Copy, Code, Shield, MessageCircle, CloudDownload } from 'lucide-react';
import { AppSettings } from '../../types';
import { updateDatabaseConfig, getDatabaseConfig, resetDatabaseConfig, checkConnection } from '../../lib/supabaseClient';
import { MASTER_SCHEMA_SQL } from '../../lib/schemaDefinition';

export const SystemConfig: React.FC = () => {
  const { appSettings, updateSettings, showToast, isOffline, offlineReason, seedRoles, seedDatabase } = useShop();
  const [formData, setFormData] = useState<AppSettings>(appSettings);
  const [activeSection, setActiveSection] = useState<'general' | 'finance' | 'ai' | 'payments' | 'social' | 'database'>('general');
  const [isLoading, setIsLoading] = useState(false);

  // Database Config State
  const [dbConfig, setDbConfig] = useState(getDatabaseConfig());
  const [dbInput, setDbInput] = useState({ url: dbConfig.url, key: dbConfig.key });
  const [dbStatus, setDbStatus] = useState<'Checking' | 'Connected' | 'Error' | 'Missing Tables'>('Checking');

  useEffect(() => {
     // If global state says Missing Tables, use that. Otherwise check connection.
     if (offlineReason === 'SCHEMA') {
         setDbStatus('Missing Tables');
     } else {
         checkConnection().then(connected => setDbStatus(connected ? 'Connected' : 'Error'));
     }
  }, [offlineReason]);

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

  const handleSaveDatabase = () => {
      if (!dbInput.url || !dbInput.key) {
          showToast('URL and Key are required', 'error');
          return;
      }
      if (confirm("Changing database configuration will reload the application. Continue?")) {
          updateDatabaseConfig(dbInput.url, dbInput.key);
      }
  };

  const handleResetDatabase = () => {
      if (confirm("Reset to default configuration? Application will reload.")) {
          resetDatabaseConfig();
      }
  };

  const handleCopySQL = () => {
      navigator.clipboard.writeText(MASTER_SCHEMA_SQL);
      showToast('SQL Script copied to clipboard!', 'success');
  };

  const handleRepairRoles = async () => {
      if(confirm("This will attempt to re-insert default roles into the database. Use this if your dashboard is grayed out.")) {
          await seedRoles();
          showToast("Roles repaired. Refreshing...", "success");
          setTimeout(() => window.location.reload(), 1000);
      }
  };

  const handleSeedData = async () => {
      if (confirm("This will populate your database with 50+ demo products, customers, and warehouses. This is great for new setups but might duplicate data if run twice. Continue?")) {
          await seedDatabase();
      }
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
                <SectionButton id="database" icon={Database} label="Database" />
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
                    {activeSection !== 'database' && (
                        <button 
                            onClick={handleSave}
                            disabled={isLoading}
                            className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-slate-800 transition-all flex items-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-70"
                        >
                            {isLoading ? <RefreshCw className="animate-spin" size={18}/> : <Save size={18}/>} Save Changes
                        </button>
                    )}
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

                    {activeSection === 'database' && (
                        <div className="space-y-8">
                            {/* Connection Status */}
                            <div className={`p-4 rounded-xl border flex items-center gap-3 ${dbStatus === 'Connected' ? 'bg-green-50 border-green-100 text-green-700' : dbStatus === 'Missing Tables' ? 'bg-yellow-50 border-yellow-100 text-yellow-800' : 'bg-red-50 border-red-100 text-red-700'}`}>
                                {dbStatus === 'Connected' ? <CheckCircle size={20}/> : <AlertTriangle size={20}/>}
                                <div className="flex-1">
                                    <span className="font-bold text-sm block">Status: {dbStatus}</span>
                                    {dbStatus === 'Missing Tables' && <span className="text-xs">Connected to Supabase, but tables are missing. Run the script below.</span>}
                                </div>
                                {dbConfig.isCustom && <span className="text-xs bg-white/50 px-2 py-0.5 rounded font-bold border border-black/5">Custom Override Active</span>}
                            </div>

                            {/* Tools Section */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Role Repair Tool */}
                                <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-xl flex justify-between items-center">
                                    <div>
                                        <h4 className="font-bold text-yellow-900 text-sm flex items-center gap-2"><Shield size={16}/> Emergency Role Repair</h4>
                                        <p className="text-xs text-yellow-700 mt-1">Restore default permissions if dashboard is locked.</p>
                                    </div>
                                    <button 
                                        onClick={handleRepairRoles}
                                        className="px-3 py-2 bg-yellow-100 text-yellow-800 font-bold rounded-lg hover:bg-yellow-200 transition-colors text-xs border border-yellow-200"
                                    >
                                        Repair Roles
                                    </button>
                                </div>

                                {/* Seed Data Tool */}
                                <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex justify-between items-center">
                                    <div>
                                        <h4 className="font-bold text-blue-900 text-sm flex items-center gap-2"><CloudDownload size={16}/> Seed Demo Data</h4>
                                        <p className="text-xs text-blue-700 mt-1">Populate empty database with products & inventory.</p>
                                    </div>
                                    <button 
                                        onClick={handleSeedData}
                                        disabled={isOffline}
                                        className="px-3 py-2 bg-blue-100 text-blue-800 font-bold rounded-lg hover:bg-blue-200 transition-colors text-xs border border-blue-200 disabled:opacity-50"
                                    >
                                        Seed Data
                                    </button>
                                </div>
                            </div>

                            {/* Schema Setup Wizard */}
                            <div className="bg-gradient-to-r from-blue-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                                <div className="relative z-10">
                                    <h3 className="font-bold text-lg mb-2 flex items-center gap-2 text-white"><Code size={20} className="text-secondary"/> Database Initialization</h3>
                                    <p className="text-blue-200 text-sm mb-6 max-w-xl">
                                        To enable Online Mode, you must create the required tables in your Supabase project. 
                                        Copy the SQL below and run it in the <a href="https://supabase.com/dashboard/project/_/sql" target="_blank" className="underline text-white font-bold hover:text-secondary">Supabase SQL Editor</a>.
                                    </p>
                                    
                                    <div className="relative">
                                        <textarea 
                                            readOnly 
                                            value={MASTER_SCHEMA_SQL} 
                                            className="w-full h-48 bg-black/30 border border-white/10 rounded-xl p-4 font-mono text-xs text-blue-100 focus:outline-none resize-none"
                                        />
                                        <button 
                                            onClick={handleCopySQL}
                                            className="absolute top-2 right-2 px-3 py-1.5 bg-secondary text-primary text-xs font-bold rounded-lg hover:bg-white transition-colors flex items-center gap-1 shadow-md"
                                        >
                                            <Copy size={12} /> Copy SQL
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Config Form */}
                            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                                <h3 className="font-bold text-lg mb-6 flex items-center gap-2 text-gray-900"><Database size={20} className="text-gray-500"/> Connection Settings</h3>
                                
                                <div className="space-y-5">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Project URL</label>
                                        <input 
                                            type="text" 
                                            value={dbInput.url}
                                            onChange={(e) => setDbInput(prev => ({...prev, url: e.target.value}))}
                                            className="w-full p-3 bg-white border border-gray-200 rounded-xl text-gray-700 font-mono text-sm focus:border-primary outline-none transition-colors"
                                            placeholder="https://your-project.supabase.co"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Anon Public Key</label>
                                        <div className="relative">
                                            <input 
                                                type="text" 
                                                value={dbInput.key}
                                                onChange={(e) => setDbInput(prev => ({...prev, key: e.target.value}))}
                                                className="w-full p-3 bg-white border border-gray-200 rounded-xl text-gray-700 font-mono text-sm focus:border-primary outline-none transition-colors"
                                                placeholder="eyJhbGciOiJIUzI1NiIsIn..."
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4 mt-8">
                                    <button 
                                        onClick={handleSaveDatabase}
                                        className="flex-1 py-3 bg-primary text-white font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-lg shadow-primary/10 flex justify-center items-center gap-2"
                                    >
                                        <RefreshCw size={18}/> Update & Connect
                                    </button>
                                    {dbConfig.isCustom && (
                                        <button 
                                            onClick={handleResetDatabase}
                                            className="px-6 py-3 bg-white border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2"
                                        >
                                            <RotateCcw size={18}/> Reset
                                        </button>
                                    )}
                                </div>
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
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-white rounded-lg shadow-sm">
                                        <MessageCircle className="text-green-600" size={24}/>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">Pay via WhatsApp</h4>
                                        <p className="text-xs text-gray-500">Manual checkout & conversation</p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" checked={formData.enableWhatsAppPayment} onChange={e => handleChange('enableWhatsAppPayment', e.target.checked)} className="sr-only peer"/>
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