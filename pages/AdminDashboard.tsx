
import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import { Navigate, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { 
   LayoutDashboard, Package, ShoppingBag, Settings as SettingsIcon, 
   LogOut, Bell, Search, RefreshCw, BarChart2, MessageSquare, Users, Shield, RefreshCcw, Check, X, Menu, Loader2, Printer, Truck
} from 'lucide-react';

// Import Modular Components
import { DashboardOverview } from '../components/admin/DashboardOverview';
import { ProductManager } from '../components/admin/ProductManager';
import { OrderKanban } from '../components/admin/OrderKanban';
import { CustomerCRM } from '../components/admin/CustomerCRM';
import { InventoryManager } from '../components/admin/InventoryManager';
import { RoleManager } from '../components/admin/RoleManager';
import { SystemConfig } from '../components/admin/SystemConfig';
import { ReturnsManager } from '../components/admin/ReturnsManager';
import { SupplierManager } from '../components/admin/SupplierManager';
import { PrintingCenter } from '../components/admin/PrintingCenter';

export const AdminDashboard: React.FC = () => {
  const { user, logout, checkPermission, notifications, markNotificationRead, clearNotifications, isLoading } = useShop();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Sync tab with URL query param, defaulting to dashboard
  const currentTab = searchParams.get('tab') || 'dashboard';

  // Redirect if user accesses a subpath like /admin/products directly to avoid 404s
  // We normalize everything to query params: /admin?tab=products
  useEffect(() => {
      if (location.pathname !== '/admin') {
          // If trying to access /admin/products, redirect to /admin?tab=products
          const pathSegment = location.pathname.split('/admin/')[1];
          if (pathSegment) {
              navigate(`/admin?tab=${pathSegment}`, { replace: true });
          } else {
              navigate('/admin', { replace: true });
          }
      }
  }, [location.pathname, navigate]);

  const setActiveTab = (tab: string) => {
      navigate(`/admin?tab=${tab}`);
  };

  const [showNotifications, setShowNotifications] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [lang, setLang] = useState<'EN' | 'AR'>('EN');
  
  // Safety timeout for loading
  const [forceShow, setForceShow] = useState(false);
  useEffect(() => {
      const timer = setTimeout(() => {
          if (isLoading) setForceShow(true);
      }, 8000); // Force show after 8s if still loading
      return () => clearTimeout(timer);
  }, [isLoading]);

  // 1. Loading State Check (Prevents "Refresh to View" bug)
  if (isLoading && !forceShow) {
      return (
          <div className="min-h-screen bg-slate-50 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                  <Loader2 className="animate-spin text-primary" size={32} />
                  <p className="text-gray-500 font-medium">Loading Dashboard...</p>
                  <button onClick={() => setForceShow(true)} className="text-xs text-blue-500 underline mt-2">Force Load</button>
              </div>
          </div>
      );
  }

  // 2. Auth Check
  if (!user || (user.role === 'User')) {
     return <Navigate to="/login" replace />;
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  const NavItem = ({ id, icon: Icon, label, permission }: any) => {
     // Force allow if it's settings and user is an admin (Emergency Access)
     const forceAccess = id === 'settings' && (user.email.includes('admin') || user.email.includes('super'));
     
     if(!forceAccess && permission && !checkPermission(permission)) return null;

     return (
         <button
            onClick={() => { setActiveTab(id); setIsSidebarOpen(false); }}
            className={`flex items-center gap-3 w-full px-4 py-3.5 rounded-xl text-sm font-bold transition-all relative group ${
               currentTab === id 
                  ? 'bg-primary text-white shadow-lg shadow-slate-950/20' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
         >
            <Icon size={18} className={currentTab === id ? "text-secondary" : "group-hover:text-white transition-colors"}/> 
            {label}
            {currentTab === id && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-secondary rounded-r-full"></div>}
         </button>
     );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans overflow-hidden">
       
       {/* Mobile Sidebar Overlay */}
       {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          ></div>
       )}

       {/* Sidebar */}
       <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 text-white flex flex-col transition-transform duration-300 ease-in-out shadow-2xl md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="p-6 border-b border-gray-800 flex justify-between items-center">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center text-primary shadow-lg shadow-secondary/20">
                   <LayoutDashboard size={20} strokeWidth={3} />
                </div>
                <div>
                   <h1 className="font-black text-xl tracking-tight">LAKKI ADMIN</h1>
                   <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Enterprise v2.0</p>
                </div>
             </div>
             <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-400 hover:text-white">
                <X size={24} />
             </button>
          </div>

          <div className="p-4 space-y-1 flex-1 overflow-y-auto custom-scrollbar">
             <div className="text-[10px] font-bold text-gray-500 uppercase px-4 py-2 tracking-wider mt-2">Intelligence</div>
             <NavItem id="dashboard" icon={BarChart2} label="Master Dashboard" permission="view_reports" />
             
             <div className="text-[10px] font-bold text-gray-500 uppercase px-4 py-2 tracking-wider mt-6">Operations</div>
             <NavItem id="products" icon={Package} label="Products & AI" permission="manage_products" />
             <NavItem id="orders" icon={ShoppingBag} label="Order Processing" permission="manage_orders" />
             <NavItem id="inventory" icon={RefreshCw} label="Inventory Sync" permission="manage_inventory" />
             <NavItem id="suppliers" icon={Truck} label="Suppliers & Retailers" permission="manage_inventory" />
             <NavItem id="returns" icon={RefreshCcw} label="Returns & Refunds" permission="manage_orders" />
             
             <div className="text-[10px] font-bold text-gray-500 uppercase px-4 py-2 tracking-wider mt-6">Tools</div>
             <NavItem id="printing" icon={Printer} label="Printing Center" permission="manage_inventory" />
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
       <main className="flex-1 flex flex-col min-w-0 overflow-hidden md:ml-72 transition-all duration-300 h-screen">
          
          {/* Global Header */}
          <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-8 sticky top-0 z-30 shadow-sm">
             <div className="flex items-center gap-4">
                <button 
                  onClick={() => setIsSidebarOpen(true)}
                  className="md:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                   <Menu size={24} />
                </button>
                <h2 className="text-xl md:text-2xl font-black text-slate-900 capitalize tracking-tight truncate">{currentTab.replace('-', ' ')}</h2>
                <span className="hidden sm:inline-block bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-1 rounded-full border border-blue-100 uppercase tracking-wide">Live Mode</span>
             </div>
             
             <div className="flex items-center gap-2 md:gap-4">
                {/* AI Search */}
                <div className="relative group hidden md:block">
                   <input 
                     type="text"
                     placeholder="Ask Lakki AI or search..."
                     className="pl-4 pr-4 py-2.5 w-64 lg:w-80 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm" 
                   />
                   <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400 border border-gray-200 rounded px-1.5 bg-white">⌘K</div>
                </div>
                
                <div className="h-8 w-px bg-gray-100 mx-2 hidden sm:block"></div>

                <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setLang(l => l === 'EN' ? 'AR' : 'EN')}
                      className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-50 text-gray-500 font-bold text-xs border border-transparent hover:border-gray-200 transition-all"
                    >
                       {lang}
                    </button>
                    
                    {/* Notification Dropdown */}
                    <div className="relative">
                        <button 
                           onClick={() => setShowNotifications(!showNotifications)}
                           className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-50 text-gray-500 border border-transparent hover:border-gray-200 transition-all relative"
                        >
                           <Bell size={20} />
                           {unreadCount > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>}
                        </button>

                        {showNotifications && (
                           <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                 <h4 className="font-bold text-gray-900">Notifications</h4>
                                 {unreadCount > 0 && <button onClick={clearNotifications} className="text-xs text-primary font-bold hover:underline">Mark all read</button>}
                              </div>
                              <div className="max-h-80 overflow-y-auto">
                                 {notifications.length === 0 ? (
                                    <div className="p-8 text-center text-gray-400 text-sm">No new alerts</div>
                                 ) : (
                                    notifications.map(n => (
                                       <div key={n.id} className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors ${!n.read ? 'bg-blue-50/30' : ''}`} onClick={() => markNotificationRead(n.id)}>
                                          <div className="flex gap-3">
                                             <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${!n.read ? 'bg-primary' : 'bg-gray-300'}`}></div>
                                             <div>
                                                <p className="text-xs font-bold text-gray-900 mb-1">{n.title}</p>
                                                <p className="text-xs text-gray-500 leading-relaxed">{n.message}</p>
                                                <span className="text-[10px] text-gray-400 mt-2 block">{new Date(n.timestamp).toLocaleTimeString()}</span>
                                             </div>
                                          </div>
                                       </div>
                                    ))
                                 )}
                              </div>
                           </div>
                        )}
                    </div>
                </div>
             </div>
          </header>

          {/* Dynamic Content */}
          <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
             {isLoading && !forceShow ? (
                 <div className="flex items-center justify-center h-full text-gray-400">
                     <Loader2 className="animate-spin" size={32} />
                 </div>
             ) : (
               <>
                 {currentTab === 'dashboard' && <DashboardOverview />}
                 {currentTab === 'products' && <ProductManager />}
                 {currentTab === 'orders' && <OrderKanban />}
                 {currentTab === 'customers' && <CustomerCRM />}
                 {currentTab === 'inventory' && <InventoryManager />}
                 {currentTab === 'suppliers' && <SupplierManager />}
                 {currentTab === 'printing' && <PrintingCenter />}
                 {currentTab === 'roles' && <RoleManager />}
                 {currentTab === 'settings' && <SystemConfig />}
                 {currentTab === 'returns' && <ReturnsManager />}
               </>
             )}
          </div>
       </main>
    </div>
  );
};
