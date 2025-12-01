
import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { Navigate } from 'react-router-dom';
import { 
   LayoutDashboard, Package, ShoppingBag, Settings as SettingsIcon, 
   LogOut, Bell, Search, RefreshCw, BarChart2, MessageSquare, Users, Shield
} from 'lucide-react';

// Import Modular Components
import { DashboardOverview } from '../components/admin/DashboardOverview';
import { ProductManager } from '../components/admin/ProductManager';
import { OrderKanban } from '../components/admin/OrderKanban';
import { CustomerCRM } from '../components/admin/CustomerCRM';
import { InventoryManager } from '../components/admin/InventoryManager';
import { RoleManager } from '../components/admin/RoleManager';
import { SystemConfig } from '../components/admin/SystemConfig';

export const AdminDashboard: React.FC = () => {
  const { user, logout, checkPermission } = useShop();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'orders' | 'customers' | 'inventory' | 'roles' | 'settings'>('dashboard');
  const [showNotifications, setShowNotifications] = useState(false);
  const [lang, setLang] = useState<'EN' | 'AR'>('EN');

  if (!user || (user.role === 'User')) {
     return <Navigate to="/login" replace />;
  }

  const NavItem = ({ id, icon: Icon, label, permission }: any) => {
     if(permission && !checkPermission(permission)) return null;

     return (
         <button
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-3 w-full px-4 py-3.5 rounded-xl text-sm font-bold transition-all relative group ${
               activeTab === id 
                  ? 'bg-primary text-white shadow-lg shadow-slate-950/20' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
         >
            <Icon size={18} className={activeTab === id ? "text-secondary" : "group-hover:text-white transition-colors"}/> 
            {label}
            {activeTab === id && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-secondary rounded-r-full"></div>}
         </button>
     );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans overflow-hidden">
       
       {/* Sidebar */}
       <aside className="w-72 bg-slate-900 text-white flex-shrink-0 flex flex-col fixed inset-y-0 left-0 z-20 transition-all duration-300 shadow-2xl">
          <div className="p-6 border-b border-gray-800">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center text-primary shadow-lg shadow-secondary/20">
                   <LayoutDashboard size={20} strokeWidth={3} />
                </div>
                <div>
                   <h1 className="font-black text-xl tracking-tight">LAKKI ADMIN</h1>
                   <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Enterprise v2.0</p>
                </div>
             </div>
          </div>

          <div className="p-4 space-y-1 flex-1 overflow-y-auto custom-scrollbar">
             <div className="text-[10px] font-bold text-gray-500 uppercase px-4 py-2 tracking-wider mt-2">Intelligence</div>
             <NavItem id="dashboard" icon={BarChart2} label="Master Dashboard" permission="view_reports" />
             
             <div className="text-[10px] font-bold text-gray-500 uppercase px-4 py-2 tracking-wider mt-6">Operations</div>
             <NavItem id="products" icon={Package} label="Products & AI" permission="manage_products" />
             <NavItem id="orders" icon={ShoppingBag} label="Order Processing" permission="manage_orders" />
             <NavItem id="inventory" icon={RefreshCw} label="Inventory Sync" permission="manage_inventory" />
             
             <div className="text-[10px] font-bold text-gray-500 uppercase px-4 py-2 tracking-wider mt-6">CRM</div>
             <NavItem id="customers" icon={Users} label="Customer 360" permission="manage_users" />
             
             <div className="text-[10px] font-bold text-gray-500 uppercase px-4 py-2 tracking-wider mt-6">System</div>
             <NavItem id="roles" icon={Shield} label="Roles & Users" permission="manage_roles" />
             <NavItem id="settings" icon={SettingsIcon} label="Configuration" permission="manage_settings" />
          </div>

          <div className="p-4 border-t border-gray-800">
             <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700 mb-2">
                <img src={user.avatar} className="w-9 h-9 rounded-full border-2 border-slate-600" alt="Admin" />
                <div className="flex-1 min-w-0">
                   <p className="text-sm font-bold text-white truncate">{user.name}</p>
                   <p className="text-xs text-green-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-400"></span> Online ({user.role})</p>
                </div>
             </div>
             <button 
               onClick={logout}
               className="flex items-center justify-center gap-2 w-full px-4 py-2 rounded-xl text-xs font-bold text-red-400 hover:text-white hover:bg-red-900/20 transition-all"
             >
                <LogOut size={14} /> Sign Out
             </button>
          </div>
       </aside>

       {/* Main Content Area */}
       <main className="flex-1 ml-72 flex flex-col h-screen">
          
          {/* Global Header */}
          <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-30 shadow-sm">
             <div className="flex items-center gap-4">
                <h2 className="text-2xl font-black text-slate-900 capitalize tracking-tight">{activeTab.replace('-', ' ')}</h2>
                <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-1 rounded-full border border-blue-100 uppercase tracking-wide">Live Mode</span>
             </div>
             
             <div className="flex items-center gap-4">
                {/* AI Search */}
                <div className="relative group hidden md:block">
                   <input 
                     type="text"
                     placeholder="Ask Lakki AI or search..."
                     className="pl-10 pr-4 py-2.5 w-80 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm" 
                   />
                   <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-primary transition-colors" />
                   <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400 border border-gray-200 rounded px-1.5 bg-white">⌘K</div>
                </div>
                
                <div className="h-8 w-px bg-gray-100 mx-2"></div>

                <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setLang(l => l === 'EN' ? 'AR' : 'EN')}
                      className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-50 text-gray-500 font-bold text-xs border border-transparent hover:border-gray-200 transition-all"
                    >
                       {lang}
                    </button>
                    <button className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-50 text-gray-500 hover:text-primary transition-all">
                       <MessageSquare size={20} />
                    </button>
                    <button 
                      onClick={() => setShowNotifications(!showNotifications)}
                      className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-50 text-gray-500 hover:text-primary relative transition-all"
                    >
                       <Bell size={20} />
                       <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                    </button>
                </div>
             </div>
          </header>

          {/* Dynamic Content Scrollable */}
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-50/50">
            {activeTab === 'dashboard' && <DashboardOverview />}
            {activeTab === 'products' && <ProductManager />}
            {activeTab === 'orders' && <OrderKanban />}
            {activeTab === 'customers' && <CustomerCRM />}
            {activeTab === 'inventory' && <InventoryManager />}
            {activeTab === 'roles' && <RoleManager />}
            {activeTab === 'settings' && <SystemConfig />}
          </div>

       </main>
    </div>
  );
};
