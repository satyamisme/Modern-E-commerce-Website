
import React, { useState, useEffect } from 'react';
import { useShop } from '../../context/ShopContext';
import { Save, Globe, DollarSign, Truck, Cpu, CreditCard, Share2, Database, AlertTriangle, CheckCircle, RefreshCw, RotateCcw, Copy, Code, Shield, MessageCircle, CloudDownload, Monitor, Camera, ScanLine, HardDrive, ArrowRightLeft, Upload, Download, Server, Cloud, Lock } from 'lucide-react';
import { AppSettings } from '../../types';
import { updateDatabaseConfig, getDatabaseConfig, resetDatabaseConfig, checkConnection } from '../../lib/supabaseClient';
import { MASTER_SCHEMA_SQL } from '../../lib/schemaDefinition';
import { getStorageEngine } from '../../lib/offlineStorage';

export const SystemConfig: React.FC = () => {
  const { appSettings, updateSettings, showToast, isOffline, offlineReason, seedRoles, seedDatabase, migrateToEngine } = useShop();
  const [formData, setFormData] = useState<AppSettings>(appSettings);
  const [activeSection, setActiveSection] = useState<'general' | 'finance' | 'ai' | 'payments' | 'social' | 'database' | 'hardware'>('general');
  const [isLoading, setIsLoading] = useState(false);

  // Database Config State
  const [dbConfig, setDbConfig] = useState(getDatabaseConfig());
  const [dbInput, setDbInput] = useState({ url: dbConfig.url, key: dbConfig.key });
  const [dbStatus, setDbStatus] = useState<'Checking' | 'Connected' | 'Error' | 'Missing Tables'>('Checking');

  // Camera State
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [scanningTest, setScanningTest] = useState('');

  // Migration State
  const [isMigrating, setIsMigrating] = useState(false);

  useEffect(() => {
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

  const handleHardwareChange = (field: string, value: any) => {
      setFormData(prev => ({
          ...prev,
          hardwareConfig: {
              ...prev.hardwareConfig,
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

  const handleMigration = async (target: 'localstorage' | 'indexeddb') => {
      if (target === appSettings.storageEngine) return;
      if (confirm(`Migrate all data to ${target}? This will overwrite existing data in the target engine.`)) {
          setIsMigrating(true);
          await migrateToEngine(target);
          setFormData(prev => ({ ...prev, storageEngine: target }));
          setIsMigrating(false);
      }
  };

  // Generic Export/Import for any provider
  const handleExportData = async () => {
      try {
          const engine = getStorageEngine(appSettings.storageEngine);
          const json = await engine.exportData();
          const blob = new Blob([json], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `lakki-backup-${new Date().toISOString().split('T')[0]}.json`;
          a.click();
          showToast("Backup downloaded successfully", "success");
      } catch (e) {
          console.error(e);
          showToast("Export failed", "error");
      }
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      
      if (confirm("This will OVERWRITE your current local database with the backup file. Are you sure?")) {
          const reader = new FileReader();
          reader.onload = async (ev) => {
              try {
                  const json = ev.target?.result as string;
                  const engine = getStorageEngine(appSettings.storageEngine);
                  await engine.importData(json);
                  showToast("Data imported successfully! Reloading...", "success");
                  setTimeout(() => window.location.reload(), 1500);
              } catch (err) {
                  showToast("Invalid backup file", "error");
              }
          };
          reader.readAsText(file);
      }
  };

  const detectCameras = async () => {
      if (!window.isSecureContext) {
          showToast('Camera access requires HTTPS or Localhost.', 'error');
          return;
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          showToast('Camera API not supported in this browser.', 'error');
          return;
      }

      try {
          // Explicitly request permission stream to trigger browser prompt
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          
          // Stop stream immediately as we only needed permission/enumeration
          stream.getTracks().forEach(track => track.stop());

          const devices = await navigator.mediaDevices.enumerateDevices();
          const videoDevices = devices.filter(d => d.kind === 'videoinput');
          setCameras(videoDevices);
          
          if (videoDevices.length === 0) {
              showToast('No cameras found on this device.', 'info');
          } else {
              showToast(`Found ${videoDevices.length} cameras`, 'success');
          }
      } catch (e: any) {
          if (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError') {
              showToast('Access denied. Click the lock icon in your address bar to enable the camera.', 'error');
          } else if (e.name === 'NotFoundError' || e.name === 'DevicesNotFoundError') {
              showToast('No camera hardware found.', 'error');
          } else if (e.name === 'NotReadableError' || e.name === 'TrackStartError') {
              showToast('Camera is busy or in use by another app.', 'error');
          } else {
              console.error("Camera detection error:", e);
              showToast(`Camera Error: ${e.message}`, 'error');
          }
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
                <SectionButton id="database" icon={Database} label="Data Architecture" />
                <SectionButton id="hardware" icon={Monitor} label="Hardware & Devices" />
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

                    {activeSection === 'hardware' && (
                        <div className="space-y-8">
                            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Camera size={20}/> Camera & Scanner Config</h3>
                                
                                <div className="space-y-4">
                                    <div className="flex items-end gap-4">
                                        <div className="flex-1">
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Default Scanner Camera</label>
                                            <select 
                                                value={formData.hardwareConfig?.defaultCameraId || ''}
                                                onChange={e => handleHardwareChange('defaultCameraId', e.target.value)}
                                                className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm focus:border-primary outline-none"
                                            >
                                                <option value="">-- Auto-Select (Default) --</option>
                                                {cameras.map(cam => (
                                                    <option key={cam.deviceId} value={cam.deviceId}>
                                                        {cam.label || `Camera ${cam.deviceId.slice(0,5)}...`}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <button 
                                            onClick={detectCameras}
                                            className="px-4 py-3 bg-blue-50 text-blue-600 font-bold rounded-xl border border-blue-100 hover:bg-blue-100 transition-colors flex items-center gap-2"
                                        >
                                            <RefreshCw size={18}/> Detect
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        Select the preferred camera to use when scanning barcodes in Inventory Manager.
                                    </p>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><ScanLine size={20}/> USB Scanner Test</h3>
                                <p className="text-sm text-gray-500 mb-4">
                                    Click the box below and scan a barcode with your handheld scanner to verify it works.
                                    Most scanners act as keyboards and press "Enter" after scanning.
                                </p>
                                <input 
                                    type="text" 
                                    placeholder="Click here and scan..."
                                    value={scanningTest}
                                    onChange={e => setScanningTest(e.target.value)}
                                    className="w-full p-4 bg-white border border-gray-300 rounded-xl text-lg font-mono focus:border-green-500 focus:ring-4 focus:ring-green-100 outline-none transition-all"
                                />
                                {scanningTest && (
                                    <div className="mt-4 p-4 bg-green-50 text-green-800 rounded-xl border border-green-100 flex items-center gap-2">
                                        <CheckCircle size={20}/> Scanned: <span className="font-mono font-bold">{scanningTest}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeSection === 'database' && (
                        <div className="space-y-8">
                            {/* Provider Switcher */}
                            <div className="bg-white p-4 rounded-xl border border-gray-200 mb-6">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-3">Database Provider</label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    <button 
                                        onClick={() => handleChange('dbProvider', 'supabase')}
                                        className={`p-3 rounded-lg border text-sm font-bold flex flex-col items-center gap-2 transition-all ${formData.dbProvider === 'supabase' ? 'border-green-500 bg-green-50 text-green-800 ring-2 ring-green-200' : 'border-gray-200 hover:border-gray-300'}`}
                                    >
                                        <Cloud size={20} /> Supabase (SQL)
                                    </button>
                                    <button 
                                        onClick={() => handleChange('dbProvider', 'local')}
                                        className={`p-3 rounded-lg border text-sm font-bold flex flex-col items-center gap-2 transition-all ${formData.dbProvider === 'local' ? 'border-blue-500 bg-blue-50 text-blue-800 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300'}`}
                                    >
                                        <HardDrive size={20} /> Local (Offline)
                                    </button>
                                    {/* Placeholders for future expansion */}
                                    <button disabled className="p-3 rounded-lg border border-dashed border-gray-200 text-gray-400 text-sm font-bold flex flex-col items-center gap-2 cursor-not-allowed">
                                        <Database size={20} /> MongoDB
                                    </button>
                                    <button disabled className="p-3 rounded-lg border border-dashed border-gray-200 text-gray-400 text-sm font-bold flex flex-col items-center gap-2 cursor-not-allowed">
                                        <Server size={20} /> Firebase
                                    </button>
                                </div>
                            </div>

                            {/* SUPABASE CONFIG */}
                            {formData.dbProvider === 'supabase' && (
                                <div className="bg-green-50/50 rounded-2xl p-6 border border-green-100">
                                    <h3 className="font-bold text-lg mb-6 flex items-center gap-2 text-green-900"><Database size={20}/> Cloud Connection Settings</h3>
                                    
                                    {/* Connection Status */}
                                    <div className={`p-4 rounded-xl border flex items-center gap-3 mb-6 ${dbStatus === 'Connected' ? 'bg-green-100 border-green-200 text-green-800' : dbStatus === 'Missing Tables' ? 'bg-yellow-50 border-yellow-100 text-yellow-800' : 'bg-red-50 border-red-100 text-red-700'}`}>
                                        {dbStatus === 'Connected' ? <CheckCircle size={20}/> : <AlertTriangle size={20}/>}
                                        <div className="flex-1">
                                            <span className="font-bold text-sm block">Status: {dbStatus}</span>
                                            {dbStatus === 'Missing Tables' && <span className="text-xs">Connected, but tables are missing. Run the SQL Script below.</span>}
                                        </div>
                                    </div>

                                    <div className="space-y-5">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Project URL</label>
                                            <input 
                                                type="text" 
                                                value={dbInput.url}
                                                onChange={(e) => setDbInput(prev => ({...prev, url: e.target.value}))}
                                                className="w-full p-3 bg-white border border-gray-200 rounded-xl text-gray-700 font-mono text-sm focus:border-green-500 outline-none"
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
                                                    className="w-full p-3 bg-white border border-gray-200 rounded-xl text-gray-700 font-mono text-sm focus:border-green-500 outline-none"
                                                    placeholder="eyJhbGciOiJIUzI1NiIsIn..."
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-4 mt-8">
                                        <button 
                                            onClick={handleSaveDatabase}
                                            className="flex-1 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors shadow-lg flex justify-center items-center gap-2"
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

                                    {/* Schema Wizard */}
                                    <div className="mt-8 pt-8 border-t border-green-200">
                                        <div className="flex justify-between items-center mb-4">
                                            <h4 className="font-bold text-green-900 text-sm">Database Initialization Script</h4>
                                            <button onClick={handleCopySQL} className="text-xs bg-green-100 text-green-800 px-3 py-1.5 rounded-lg font-bold hover:bg-green-200 flex items-center gap-1"><Copy size={12}/> Copy SQL</button>
                                        </div>
                                        <textarea 
                                            readOnly 
                                            value={MASTER_SCHEMA_SQL} 
                                            className="w-full h-32 bg-slate-900 border border-slate-700 rounded-xl p-4 font-mono text-[10px] text-green-400 focus:outline-none resize-none"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* LOCAL / OFFLINE CONFIG */}
                            {formData.dbProvider === 'local' && (
                                <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
                                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><HardDrive size={20}/> Offline Storage Engine</h3>
                                    <p className="text-sm text-gray-500 mb-6">Select where data is stored within the browser.</p>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                        <label className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${formData.storageEngine === 'indexeddb' ? 'border-blue-500 bg-blue-100' : 'border-gray-200 hover:border-gray-300 bg-white'}`}>
                                            <div className="flex items-center gap-3 mb-2">
                                                <input type="radio" checked={formData.storageEngine === 'indexeddb'} onChange={() => handleChange('storageEngine', 'indexeddb')} className="hidden" />
                                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${formData.storageEngine === 'indexeddb' ? 'border-blue-500' : 'border-gray-300'}`}>
                                                    {formData.storageEngine === 'indexeddb' && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                                                </div>
                                                <span className="font-bold text-gray-900">IndexedDB (Recommended)</span>
                                            </div>
                                            <p className="text-xs text-gray-500 pl-7">High performance, unlimited storage. Best for images & large catalogs.</p>
                                        </label>

                                        <label className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${formData.storageEngine === 'localstorage' ? 'border-blue-500 bg-blue-100' : 'border-gray-200 hover:border-gray-300 bg-white'}`}>
                                            <div className="flex items-center gap-3 mb-2">
                                                <input type="radio" checked={formData.storageEngine === 'localstorage'} onChange={() => handleChange('storageEngine', 'localstorage')} className="hidden" />
                                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${formData.storageEngine === 'localstorage' ? 'border-blue-500' : 'border-gray-300'}`}>
                                                    {formData.storageEngine === 'localstorage' && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                                                </div>
                                                <span className="font-bold text-gray-900">Local Storage</span>
                                            </div>
                                            <p className="text-xs text-gray-500 pl-7">Legacy mode. Limited to ~5MB. Only for very small shops.</p>
                                        </label>
                                    </div>

                                    {/* Internal Migration */}
                                    <div className="pt-4 border-t border-blue-200 flex items-center justify-between">
                                        <span className="text-xs text-blue-900 font-bold uppercase">Internal Migration</span>
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => handleMigration('indexeddb')}
                                                disabled={isMigrating || formData.storageEngine === 'indexeddb'}
                                                className="px-3 py-1.5 bg-white border border-blue-200 rounded-lg text-xs font-bold text-blue-700 hover:bg-blue-50 disabled:opacity-50 flex items-center gap-1"
                                            >
                                                {isMigrating ? <RefreshCw className="animate-spin" size={12}/> : <ArrowRightLeft size={12}/>} To IndexedDB
                                            </button>
                                            <button 
                                                onClick={() => handleMigration('localstorage')}
                                                disabled={isMigrating || formData.storageEngine === 'localstorage'}
                                                className="px-3 py-1.5 bg-white border border-blue-200 rounded-lg text-xs font-bold text-blue-700 hover:bg-blue-50 disabled:opacity-50 flex items-center gap-1"
                                            >
                                                {isMigrating ? <RefreshCw className="animate-spin" size={12}/> : <ArrowRightLeft size={12}/>} To LocalStorage
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* GLOBAL TOOLS */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Migration Tool */}
                                <div className="bg-purple-50 border border-purple-100 p-4 rounded-xl">
                                    <h4 className="font-bold text-purple-900 text-sm flex items-center gap-2 mb-2"><ArrowRightLeft size={16}/> Migration Center</h4>
                                    <p className="text-xs text-purple-700 mb-3">Move data between devices or backup your store.</p>
                                    <div className="flex gap-2">
                                        <button onClick={handleExportData} className="flex-1 py-2 bg-white text-purple-700 font-bold rounded-lg border border-purple-200 hover:bg-purple-100 text-xs flex items-center justify-center gap-1">
                                            <Download size={14}/> Backup (JSON)
                                        </button>
                                        <label className="flex-1 py-2 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 text-xs flex items-center justify-center gap-1 cursor-pointer shadow-sm">
                                            <Upload size={14}/> Import Data
                                            <input type="file" accept=".json" onChange={handleImportData} className="hidden"/>
                                        </label>
                                    </div>
                                </div>

                                {/* Emergency Tools */}
                                <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-xl flex flex-col justify-between">
                                    <div>
                                        <h4 className="font-bold text-yellow-900 text-sm flex items-center gap-2"><Shield size={16}/> Admin Tools</h4>
                                        <p className="text-xs text-yellow-700 mt-1 mb-2">Fix permissions or seed demo data.</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={handleRepairRoles} className="flex-1 px-3 py-2 bg-yellow-100 text-yellow-800 font-bold rounded-lg hover:bg-yellow-200 transition-colors text-xs border border-yellow-200">
                                            Repair Roles
                                        </button>
                                        <button onClick={handleSeedData} className="flex-1 px-3 py-2 bg-blue-100 text-blue-800 font-bold rounded-lg hover:bg-blue-200 transition-colors text-xs border border-blue-200">
                                            Seed Data
                                        </button>
                                    </div>
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