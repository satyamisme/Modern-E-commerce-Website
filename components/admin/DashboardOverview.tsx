
import React, { useState, useEffect } from 'react';
import { DollarSign, ShoppingBag, Package, Users, TrendingUp, ArrowUpRight, Activity, Zap, AlertTriangle, Lightbulb, TrendingDown, Target, Database, ArrowRight, RefreshCw, CheckCircle, Server, Globe } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from 'recharts';
import { useShop } from '../../context/ShopContext';

const COLORS = ['#1e3a8a', '#d4af37', '#ff6b6b', '#10B981', '#8B5CF6'];

export const DashboardOverview: React.FC = () => {
  const { orders, products, appSettings, offlineReason, isOffline, retryConnection, connectionDetails } = useShop();
  const [isVerifying, setIsVerifying] = useState(false);

  // Metrics Calculation
  const totalRevenue = orders.reduce((acc, o) => acc + o.total, 0);
  const totalOrders = orders.length;
  const lowStock = products.filter(p => p.stock < 5).length;
  const totalCustomers = new Set(orders.map(o => o.customer.email)).size + 124;

  // AI Insights Data
  const insights = [
    { type: 'critical', icon: AlertTriangle, text: 'iPhone 15 Pro stock depleting 3x faster than forecast', color: 'bg-red-50 text-red-600 border-red-100' },
    { type: 'opportunity', icon: Lightbulb, text: 'Samsung A54 bundle increased AOV by 28%', color: 'bg-yellow-50 text-yellow-600 border-yellow-100' },
    { type: 'info', icon: Zap, text: 'Kuwait City delivery delays +45min avg due to traffic', color: 'bg-blue-50 text-blue-600 border-blue-100' },
  ];
  const [currentInsight, setCurrentInsight] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentInsight((prev) => (prev + 1) % insights.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Auto-Verify when Schema is missing
  useEffect(() => {
    let interval: any;
    if (isOffline && offlineReason === 'SCHEMA') {
        interval = setInterval(() => {
            retryConnection();
        }, 3000); // Check every 3 seconds to see if user ran the script
    }
    return () => clearInterval(interval);
  }, [isOffline, offlineReason, retryConnection]);

  const handleVerify = async () => {
      setIsVerifying(true);
      await retryConnection();
      setIsVerifying(false);
  };

  // Mock Predictive Data
  const revenueForecastData = [
    { name: 'Day 1', actual: 4000, forecast: 4100 },
    { name: 'Day 2', actual: 3000, forecast: 3200 },
    { name: 'Day 3', actual: 2000, forecast: 2500 },
    { name: 'Day 4', actual: 2780, forecast: 2800 },
    { name: 'Day 5', actual: 1890, forecast: 2200 },
    { name: 'Day 6', actual: 2390, forecast: 2600 },
    { name: 'Day 7', actual: 3490, forecast: 3500 },
    { name: 'Day 8', forecast: 3800 },
    { name: 'Day 9', forecast: 4200 },
    { name: 'Day 10', forecast: 4500 },
  ];

  const categoryData = [
    { name: 'Smartphones', value: 400 },
    { name: 'Tablets', value: 300 },
    { name: 'Audio', value: 300 },
    { name: 'Wearables', value: 200 },
  ];

  const StatCard = ({ title, value, icon: Icon, trend, color, subValue }: any) => (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden group">
      <div className={`absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity`}>
        <Icon size={48} />
      </div>
      <div className="flex justify-between items-start mb-3">
        <div className={`p-2.5 rounded-xl ${color}`}>
          <Icon size={20} />
        </div>
        <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-100">
           <ArrowUpRight size={10}/> {trend}
        </span>
      </div>
      <h3 className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">{title}</h3>
      <p className="text-2xl font-black text-slate-900 tracking-tight">{value}</p>
      {subValue && <p className="text-xs text-gray-500 mt-1 font-medium">{subValue}</p>}
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* SYSTEM HEALTH STATUS PANEL */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${isOffline ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                      {isOffline ? <AlertTriangle size={24}/> : <Server size={24}/>}
                  </div>
                  <div>
                      <h3 className="font-bold text-gray-900">System Status: {isOffline ? 'Offline Mode' : 'Online'}</h3>
                      <p className="text-xs text-gray-500 flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${isOffline ? 'bg-red-500' : 'bg-green-500'}`}></span>
                          {isOffline ? 'Using Local Browser Storage' : 'Connected to Supabase Cloud'}
                      </p>
                  </div>
              </div>
              
              {connectionDetails && (
                  <div className="flex flex-col text-right text-xs">
                      <p className="text-gray-400 font-mono">DB: {connectionDetails.url || 'N/A'}</p>
                      {connectionDetails.message && (
                          <p className={`font-bold ${isOffline ? 'text-red-600' : 'text-green-600'}`}>
                              {connectionDetails.message}
                          </p>
                      )}
                      {connectionDetails.syncError && (
                          <p className="text-red-500 font-bold max-w-md truncate">Error: {connectionDetails.syncError}</p>
                      )}
                  </div>
              )}

              <button 
                onClick={handleVerify}
                className="px-4 py-2 bg-gray-100 text-gray-600 font-bold rounded-lg hover:bg-gray-200 transition-colors text-xs flex items-center gap-2"
              >
                 <RefreshCw size={14} className={isVerifying ? "animate-spin" : ""} /> Re-check
              </button>
          </div>
      </div>

      {/* Schema Missing Alert */}
      {isOffline && offlineReason === 'SCHEMA' && (
          <div className="bg-red-600 rounded-2xl shadow-lg p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/10 rounded-xl relative">
                      <Database size={24} className="text-white"/>
                      <div className="absolute top-0 right-0 w-3 h-3 bg-yellow-400 rounded-full animate-ping"></div>
                  </div>
                  <div>
                      <h3 className="font-bold text-lg">Database Tables Created?</h3>
                      <p className="text-red-100 text-sm">We are checking for tables... Run the SQL script if this doesn't disappear.</p>
                  </div>
              </div>
              <div className="flex gap-3">
                  <button 
                    onClick={() => document.getElementById('settings')?.click()} 
                    className="px-6 py-2 bg-white/10 border border-white/20 text-white font-bold rounded-xl hover:bg-white/20 transition-colors flex items-center gap-2 text-sm"
                  >
                      View Script
                  </button>
                  <button 
                    onClick={handleVerify} 
                    className="px-6 py-2 bg-white text-red-600 font-bold rounded-xl shadow-lg hover:bg-red-50 transition-colors flex items-center gap-2 text-sm"
                  >
                      {isVerifying ? <RefreshCw className="animate-spin" size={16}/> : <CheckCircle size={16}/>} 
                      Verify Now
                  </button>
              </div>
          </div>
      )}

      {/* AI Insights Carousel */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-1">
        <div className={`flex items-center gap-4 p-4 rounded-xl transition-colors duration-500 ${insights[currentInsight].color}`}>
           <div className="bg-white/50 p-2 rounded-lg backdrop-blur-sm">
              {React.createElement(insights[currentInsight].icon, { size: 24 })}
           </div>
           <div className="flex-1">
              <span className="text-xs font-bold uppercase tracking-wider opacity-70 mb-0.5 block">{insights[currentInsight].type} INSIGHT</span>
              <p className="font-bold text-sm md:text-base">{insights[currentInsight].text}</p>
           </div>
           <div className="flex gap-1">
              {insights.map((_, idx) => (
                 <div key={idx} className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === currentInsight ? 'bg-current w-6' : 'bg-current opacity-30'}`}></div>
              ))}
           </div>
        </div>
      </div>

      {/* KPI Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Revenue Forecast" 
          value={`${totalRevenue.toLocaleString()} ${appSettings.currency}`}
          subValue="Predicted: 32,450 KWD (+15%)"
          icon={Target}
          trend="98% Accuracy"
          color="bg-indigo-50 text-indigo-600"
        />
        <StatCard 
          title="Order Throughput" 
          value={totalOrders}
          subValue="Avg Processing: 42m"
          icon={Package}
          trend="+5.2%"
          color="bg-blue-50 text-blue-600"
        />
        <StatCard 
          title="Inventory Health" 
          value="94/100"
          subValue={`${lowStock} SKU Reorder Alerts`}
          icon={Activity}
          trend="Healthy"
          color="bg-emerald-50 text-emerald-600"
        />
        <StatCard 
          title="Customer LTV" 
          value="245 KWD"
          subValue="Churn Probability: Low (2%)"
          icon={Users}
          trend="+18%"
          color="bg-purple-50 text-purple-600"
        />
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Predictive Revenue Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
           <div className="flex justify-between items-center mb-6">
              <div>
                 <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                    <TrendingUp size={20} className="text-primary"/> AI Revenue Forecast
                 </h3>
                 <p className="text-xs text-gray-400 font-medium">Actual vs Predicted Revenue (Next 3 Days)</p>
              </div>
              <div className="flex gap-2">
                 <span className="flex items-center gap-1 text-xs font-bold text-gray-500"><span className="w-2 h-2 rounded-full bg-blue-900"></span> Actual</span>
                 <span className="flex items-center gap-1 text-xs font-bold text-gray-500"><span className="w-2 h-2 rounded-full bg-blue-300 dashed"></span> Forecast</span>
              </div>
           </div>
           <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={revenueForecastData}>
                    <defs>
                       <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#1e3a8a" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#1e3a8a" stopOpacity={0}/>
                       </linearGradient>
                       <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#93c5fd" stopOpacity={0.5}/>
                          <stop offset="95%" stopColor="#93c5fd" stopOpacity={0}/>
                       </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                    <Tooltip 
                        contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} 
                        cursor={{stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4'}}
                    />
                    <Area type="monotone" dataKey="forecast" stroke="#93c5fd" strokeWidth={2} strokeDasharray="5 5" fillOpacity={1} fill="url(#colorForecast)" name="Forecast" />
                    <Area type="monotone" dataKey="actual" stroke="#1e3a8a" strokeWidth={3} fillOpacity={1} fill="url(#colorActual)" name="Actual" />
                 </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Category Performance */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col">
           <h3 className="font-bold text-lg text-gray-900 mb-2 flex items-center gap-2">
              <Activity size={20} className="text-secondary"/> Sales Mix
           </h3>
           <p className="text-xs text-gray-400 font-medium mb-6">Revenue distribution by category</p>
           
           <div className="h-56 w-full flex-1 relative">
              <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                    <Pie
                       data={categoryData}
                       cx="50%"
                       cy="50%"
                       innerRadius={50}
                       outerRadius={70}
                       paddingAngle={5}
                       dataKey="value"
                    >
                       {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                       ))}
                    </Pie>
                    <Tooltip />
                 </PieChart>
              </ResponsiveContainer>
              {/* Center Text */}
              <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                 <span className="text-xl font-black text-gray-900">4</span>
                 <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Cats</span>
              </div>
           </div>
           
           <div className="mt-4 space-y-3 overflow-y-auto custom-scrollbar pr-2 max-h-40">
              {categoryData.map((entry, index) => (
                 <div key={index} className="flex items-center justify-between text-sm group">
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full transition-all group-hover:scale-125" style={{backgroundColor: COLORS[index % COLORS.length]}}></div>
                       <span className="text-gray-600 font-medium text-xs">{entry.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{backgroundColor: COLORS[index % COLORS.length], width: `${(entry.value / 1200) * 100}%`}}></div>
                       </div>
                       <span className="font-bold text-gray-900 text-xs">{Math.round((entry.value / 1200) * 100)}%</span>
                    </div>
                 </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};
