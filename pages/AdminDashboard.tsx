
import React, { useState, useMemo } from 'react';
import { useShop } from '../context/ShopContext';
import { Navigate } from 'react-router-dom';
import { 
   LayoutDashboard, Package, ShoppingBag, Users, Trash2, Edit, Plus, 
   Settings as SettingsIcon, TrendingUp, DollarSign, X, Search, Filter,
   ArrowRight, AlertCircle, RefreshCw, BarChart2, Bell, Truck,
   FileText, ChevronRight, Download, Upload, Image as ImageIcon, Globe, Share2, Layers, Minimize, Loader2,
   LogOut, Sparkles, CheckCircle, Menu, MoreVertical
} from 'lucide-react';
import { Product, Order } from '../types';

export const AdminDashboard: React.FC = () => {
  const { 
    user, 
    products, 
    orders, 
    deleteProduct, 
    updateOrderStatus, 
    addProduct, 
    updateProduct,
    appSettings,
    updateSettings,
    showToast,
    logout
  } = useShop();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'orders' | 'customers' | 'inventory' | 'settings'>('dashboard');
  
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All');

  // Product Form State
  const [showProductModal, setShowProductModal] = useState(false);
  const [productFormTab, setProductFormTab] = useState<'basic' | 'pricing' | 'media' | 'specs' | 'seo'>('basic');
  const [editingProduct, setEditingProduct] = useState<Partial<Product>>({
     name: '', brand: 'Apple', price: 0, category: 'Smartphones', stock: 10, description: '', specs: {}, images: [], seo: { metaTitle: '', metaDescription: '', keywords: [] }
  });
  
  // Bulk processing state
  const [isProcessingImages, setIsProcessingImages] = useState(false);

  if (!user || user.role !== 'admin') {
     return <Navigate to="/login" replace />;
  }

  // --- DERIVED DATA & ANALYTICS ---
  const totalRevenue = orders.reduce((acc, order) => acc + order.total, 0);
  const totalOrders = orders.length;
  const pendingOrdersCount = orders.filter(o => o.status === 'Processing').length;
  const lowStockProductsList = products.filter(p => p.stock < 5 && p.stock > 0);
  const lowStockProducts = lowStockProductsList.length;
  const outOfStockProducts = products.filter(p => p.stock === 0).length;

  // Derive Customers from Orders
  const customers = useMemo(() => {
     const uniqueCustomers = new Map();
     orders.forEach(order => {
        if (!uniqueCustomers.has(order.customer.email)) {
           uniqueCustomers.set(order.customer.email, {
              id: order.customer.email,
              name: order.customer.name,
              email: order.customer.email,
              phone: order.customer.phone,
              totalSpent: 0,
              ordersCount: 0,
              lastOrder: order.date,
              status: 'Active'
           });
        }
        const customer = uniqueCustomers.get(order.customer.email);
        customer.totalSpent += order.total;
        customer.ordersCount += 1;
        if (new Date(order.date) > new Date(customer.lastOrder)) {
           customer.lastOrder = order.date;
        }
     });
     return Array.from(uniqueCustomers.values());
  }, [orders]);

  // --- FILTERED LISTS ---
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategoryFilter === 'All' || p.category === selectedCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  const filteredOrders = orders.filter(o => 
    o.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    o.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCustomers = customers.filter((c: any) => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  );

  // --- ACTIONS ---

  const handleSaveProduct = (e: React.FormEvent) => {
     e.preventDefault();
     if (!editingProduct.name || !editingProduct.price) {
        showToast('Please fill in required fields', 'error');
        return;
     }

     const productData: Product = {
        id: editingProduct.id || `prod-${Date.now()}`,
        name: editingProduct.name!,
        brand: editingProduct.brand || 'Generic',
        price: Number(editingProduct.price),
        originalPrice: editingProduct.originalPrice ? Number(editingProduct.originalPrice) : undefined,
        monthlyPrice: editingProduct.monthlyPrice ? Number(editingProduct.monthlyPrice) : undefined,
        rating: editingProduct.rating || 0,
        reviewsCount: editingProduct.reviewsCount || 0,
        category: editingProduct.category as any || 'Smartphones',
        colors: editingProduct.colors || ['#000000'],
        specs: editingProduct.specs || {},
        description: editingProduct.description || '',
        imageSeed: editingProduct.imageSeed || Math.floor(Math.random() * 1000),
        images: editingProduct.images || [],
        tags: editingProduct.tags || [],
        stock: Number(editingProduct.stock),
        express: editingProduct.express || false,
        seo: editingProduct.seo || { metaTitle: '', metaDescription: '', keywords: [] }
     };

     if (editingProduct.id) {
        updateProduct(productData);
     } else {
        addProduct(productData);
     }
     setShowProductModal(false);
     setEditingProduct({ name: '', brand: 'Apple', price: 0, category: 'Smartphones', stock: 10, description: '', specs: {}, images: [], seo: { metaTitle: '', metaDescription: '', keywords: [] } });
  };

  const handleQuickStockUpdate = (product: Product, amount: number) => {
     updateProduct({ ...product, stock: Math.max(0, product.stock + amount) });
     showToast(`Stock updated for ${product.name}`, 'success');
  };

  const handleOrderStatusChange = (orderId: string, currentStatus: Order['status']) => {
     let nextStatus: Order['status'] = currentStatus;
     if (currentStatus === 'Processing') nextStatus = 'Shipped';
     else if (currentStatus === 'Shipped') nextStatus = 'Delivered';
     
     if (nextStatus !== currentStatus) {
        updateOrderStatus(orderId, nextStatus);
     }
  };
  
  // Image Upload Handling
  const handleImageSelect = (files: FileList | null) => {
    if (files && files.length > 0) {
       const newImages = Array.from(files).map(file => URL.createObjectURL(file));
       setEditingProduct(prev => ({
          ...prev,
          images: [...(prev.images || []), ...newImages]
       }));
       showToast(`${files.length} images added`, 'success');
    }
  };

  const handleImageDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleImageSelect(e.dataTransfer.files);
  };

  const handleMockBulkProcess = (type: string) => {
     setIsProcessingImages(true);
     setTimeout(() => {
        setIsProcessingImages(false);
        showToast(`${type} completed successfully`, 'success');
     }, 1500);
  };
  
  const handleSpecChange = (key: string, value: string) => {
     setEditingProduct(prev => ({
        ...prev,
        specs: { ...prev.specs, [key]: value }
     }));
  };

  const removeSpec = (key: string) => {
     if(!editingProduct.specs) return;
     const newSpecs = { ...editingProduct.specs };
     delete newSpecs[key];
     setEditingProduct(prev => ({ ...prev, specs: newSpecs }));
  };

  const exportToCSV = (data: any[], filename: string) => {
    if (!data.length) {
        showToast('No data to export', 'error');
        return;
    }
    
    // Flatten data slightly for better CSV output (handling objects)
    const flattenedData = data.map(row => {
        const flatRow: any = { ...row };
        // Simplify nested objects for CSV
        if (flatRow.specs) flatRow.specs = JSON.stringify(flatRow.specs).replace(/,/g, ';');
        if (flatRow.images) flatRow.images = flatRow.images.length;
        if (flatRow.customer && typeof flatRow.customer === 'object') {
             flatRow.customerName = flatRow.customer.name;
             flatRow.customerEmail = flatRow.customer.email;
             delete flatRow.customer;
             delete flatRow.items; // Too complex for simple CSV
        }
        return flatRow;
    });

    const headers = Object.keys(flattenedData[0]).join(',');
    const rows = flattenedData.map(row => Object.values(row).map(v => `"${v}"`).join(',')).join('\n');
    const csvContent = "data:text/csv;charset=utf-8," + headers + '\n' + rows;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`${filename} downloaded`, 'success');
  };

  // --- RENDER HELPERS ---
  const StatCard = ({ icon: Icon, color, label, value, subValue, subLabel, trend }: any) => (
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all group">
         <div className="flex justify-between items-start mb-4">
            <div className={`p-3.5 ${color.bg} ${color.text} rounded-2xl group-hover:scale-110 transition-transform`}>
               <Icon size={24} />
            </div>
            {trend && (
               <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full border border-green-100">
                  <TrendingUp size={12}/> {trend}
               </span>
            )}
         </div>
         <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">{label}</h3>
         <p className="text-3xl font-black text-slate-900 tracking-tight">{value}</p>
         {subValue && (
            <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between text-xs text-gray-500 font-medium">
               <span>{subLabel}</span>
               <span className="font-bold text-gray-900">{subValue}</span>
            </div>
         )}
      </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
       
       {/* Sidebar */}
       <aside className="w-72 bg-slate-900 text-white flex-shrink-0 flex flex-col fixed inset-y-0 left-0 z-20 transition-all duration-300">
          <div className="p-6 border-b border-gray-800">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center text-primary shadow-lg shadow-secondary/20">
                   <LayoutDashboard size={20} strokeWidth={3} />
                </div>
                <div>
                   <h1 className="font-black text-xl tracking-tight">LAKKI ADMIN</h1>
                   <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Control Center</p>
                </div>
             </div>
          </div>

          <div className="p-4 space-y-1 flex-1 overflow-y-auto custom-scrollbar">
             <div className="text-[10px] font-bold text-gray-500 uppercase px-4 py-2 tracking-wider mt-2">Main Menu</div>
             
             {[
               { id: 'dashboard', icon: BarChart2, label: 'Dashboard' },
               { id: 'products', icon: Package, label: 'Products' },
               { id: 'orders', icon: ShoppingBag, label: 'Orders', badge: pendingOrdersCount },
               { id: 'customers', icon: Users, label: 'Customers' },
               { id: 'inventory', icon: RefreshCw, label: 'Inventory', badge: lowStockProducts, badgeColor: 'bg-red-500' },
             ].map((item) => (
               <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`flex items-center gap-3 w-full px-4 py-3.5 rounded-xl text-sm font-bold transition-all relative group ${
                     activeTab === item.id 
                        ? 'bg-primary text-white shadow-lg shadow-slate-950/20' 
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
               >
                  <item.icon size={18} className={activeTab === item.id ? "text-secondary" : "group-hover:text-white transition-colors"}/> 
                  {item.label}
                  {item.badge ? (
                     <span className={`ml-auto text-[10px] px-2 py-0.5 rounded-full text-white font-bold ${item.badgeColor || 'bg-blue-600'}`}>
                        {item.badge}
                     </span>
                  ) : null}
                  {activeTab === item.id && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-secondary rounded-r-full"></div>}
               </button>
             ))}
             
             <div className="text-[10px] font-bold text-gray-500 uppercase px-4 py-2 tracking-wider mt-6">System</div>
             <button 
               onClick={() => setActiveTab('settings')}
               className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'settings' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
             >
                <SettingsIcon size={18} /> Settings
             </button>
             <button 
               onClick={logout}
               className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-bold text-red-400 hover:text-white hover:bg-red-900/20 transition-all mt-2"
             >
                <LogOut size={18} /> Logout
             </button>
          </div>

          <div className="p-4 border-t border-gray-800">
             <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700">
                <img src={user.avatar} className="w-9 h-9 rounded-full border-2 border-slate-600" alt="Admin" />
                <div className="flex-1 min-w-0">
                   <p className="text-sm font-bold text-white truncate">{user.name}</p>
                   <p className="text-xs text-gray-400">Super Admin</p>
                </div>
             </div>
          </div>
       </aside>

       {/* Main Content */}
       <main className="flex-1 ml-72 p-8 overflow-y-auto">
          
          {/* Top Bar */}
          <header className="flex justify-between items-center mb-10 sticky top-0 bg-slate-50/95 backdrop-blur z-10 py-2">
             <div>
                <h2 className="text-3xl font-black text-slate-900 capitalize tracking-tight mb-1">{activeTab}</h2>
                <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                   <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> System Online
                </div>
             </div>
             
             <div className="flex items-center gap-4 relative">
                <div className="relative group">
                   <input 
                     type="text"
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                     placeholder={`Search ${activeTab}...`}
                     className="pl-10 pr-4 py-2.5 w-64 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm group-hover:shadow-md" 
                   />
                   <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-primary transition-colors" />
                </div>
                
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-500 hover:text-primary hover:border-primary relative transition-all shadow-sm hover:shadow-md"
                >
                   <Bell size={20} />
                   {(pendingOrdersCount > 0 || lowStockProducts > 0) && (
                      <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                   )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                   <div className="absolute top-14 right-0 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                      <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                         <span className="font-bold text-gray-900 text-sm">Notifications</span>
                         <button onClick={() => setShowNotifications(false)} className="text-xs text-gray-500 hover:text-gray-900">Close</button>
                      </div>
                      <div className="max-h-80 overflow-y-auto custom-scrollbar">
                           {lowStockProductsList.map(p => (
                              <div key={`alert-${p.id}`} className="p-4 border-b border-gray-50 hover:bg-gray-50 flex gap-3 transition-colors">
                                 <div className="p-2 bg-red-50 text-red-500 rounded-lg h-fit"><AlertCircle size={16}/></div>
                                 <div>
                                    <p className="text-sm font-bold text-gray-900">Low Stock Alert</p>
                                    <p className="text-xs text-gray-500">{p.name} has only <span className="font-bold text-red-600">{p.stock}</span> units left.</p>
                                 </div>
                              </div>
                           ))}
                           {orders.slice(0, 3).map(o => (
                              <div key={`notif-${o.id}`} className="p-4 border-b border-gray-50 hover:bg-gray-50 flex gap-3 transition-colors">
                                 <div className="p-2 bg-blue-50 text-blue-500 rounded-lg h-fit"><ShoppingBag size={16}/></div>
                                 <div>
                                    <p className="text-sm font-bold text-gray-900">New Order Received</p>
                                    <p className="text-xs text-gray-500">{o.customer.name} placed order #{o.id}</p>
                                    <p className="text-[10px] text-gray-400 mt-1">{o.date}</p>
                                 </div>
                              </div>
                           ))}
                           {lowStockProducts === 0 && orders.length === 0 && (
                              <div className="p-8 text-center text-gray-500 text-sm">No new notifications</div>
                           )}
                      </div>
                   </div>
                )}
             </div>
          </header>

          {activeTab === 'dashboard' && (
             <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                   <StatCard 
                      icon={DollarSign} 
                      color={{bg: 'bg-blue-50', text: 'text-primary'}} 
                      label="Total Revenue" 
                      value={`${totalRevenue.toLocaleString()} ${appSettings.currency}`}
                      trend="+12.5%"
                      subLabel="Monthly Target"
                      subValue="65%"
                   />
                   <StatCard 
                      icon={ShoppingBag} 
                      color={{bg: 'bg-purple-50', text: 'text-purple-600'}} 
                      label="Total Orders" 
                      value={totalOrders}
                      subLabel="Processing"
                      subValue={pendingOrdersCount}
                   />
                   <StatCard 
                      icon={Package} 
                      color={{bg: 'bg-orange-50', text: 'text-orange-600'}} 
                      label="Low Stock" 
                      value={lowStockProducts}
                      subLabel="Out of Stock"
                      subValue={outOfStockProducts}
                   />
                   <StatCard 
                      icon={Users} 
                      color={{bg: 'bg-green-50', text: 'text-green-600'}} 
                      label="Total Customers" 
                      value={customers.length}
                      trend="+5"
                      subLabel="Active Now"
                      subValue="3"
                   />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Recent Orders */}
                    <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-lg text-slate-900">Recent Orders</h3>
                                <p className="text-xs text-gray-500 mt-1">Latest transaction activity</p>
                            </div>
                            <button onClick={() => setActiveTab('orders')} className="px-4 py-2 bg-gray-50 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-100 transition-colors">View All</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50/50 text-gray-400 text-[10px] uppercase font-bold tracking-wider">
                                    <tr>
                                        <th className="p-5">Order ID</th>
                                        <th className="p-5">Customer</th>
                                        <th className="p-5">Status</th>
                                        <th className="p-5">Amount</th>
                                        <th className="p-5 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {orders.slice(0, 5).map(order => (
                                        <tr key={order.id} className="hover:bg-gray-50/80 transition-colors">
                                            <td className="p-5 font-bold text-slate-900 text-sm">{order.id}</td>
                                            <td className="p-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                                                        {order.customer.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-900">{order.customer.name}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-5">
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                                                    order.status === 'Delivered' ? 'bg-green-50 text-green-700 border-green-100' :
                                                    order.status === 'Processing' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                                    'bg-gray-50 text-gray-600 border-gray-100'
                                                }`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="p-5 font-bold text-slate-900 text-sm">{order.total} {appSettings.currency}</td>
                                            <td className="p-5 text-right">
                                                <button onClick={() => setActiveTab('orders')} className="p-2 text-gray-400 hover:text-primary hover:bg-blue-50 rounded-lg transition-colors"><ChevronRight size={16}/></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
             </div>
          )}

          {activeTab === 'products' && (
             <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Product Command Toolbar */}
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row flex-wrap gap-4 justify-between items-center">
                   <div className="flex gap-2">
                      <button 
                        onClick={() => setShowFilterMenu(!showFilterMenu)}
                        className={`px-4 py-2.5 border rounded-xl text-sm font-bold flex items-center gap-2 transition-colors ${showFilterMenu ? 'bg-blue-50 border-blue-200 text-primary' : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'}`}
                      >
                         <Filter size={16}/> Filter
                      </button>
                      <button 
                        onClick={() => exportToCSV(filteredProducts, 'products_export.csv')}
                        className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-100 flex items-center gap-2 transition-colors"
                      >
                         <Download size={16}/> Export
                      </button>
                   </div>
                   
                   <div className="flex gap-3">
                       <button 
                         onClick={() => {
                            setEditingProduct({ name: '', brand: 'Apple', price: 0, category: 'Smartphones', stock: 10, description: '', specs: {}, images: [], seo: { metaTitle: '', metaDescription: '', keywords: [] } });
                            setProductFormTab('basic');
                            setShowProductModal(true);
                         }}
                         className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-slate-800 transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
                       >
                          <Plus size={18} /> Add Product
                       </button>
                   </div>
                </div>

                {/* Filter Menu */}
                {showFilterMenu && (
                   <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex gap-4 animate-in slide-in-from-top-2">
                      <div>
                         <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Category</label>
                         <select 
                            value={selectedCategoryFilter}
                            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                            className="p-2 border border-gray-200 rounded-lg text-sm bg-gray-50 outline-none focus:border-primary"
                         >
                            <option value="All">All Categories</option>
                            <option value="Smartphones">Smartphones</option>
                            <option value="Tablets">Tablets</option>
                            <option value="Wearables">Wearables</option>
                            <option value="Audio">Audio</option>
                            <option value="Accessories">Accessories</option>
                         </select>
                      </div>
                      <div className="flex items-end">
                         <button 
                           onClick={() => setSelectedCategoryFilter('All')}
                           className="text-xs text-red-500 font-bold hover:underline mb-2"
                         >
                            Reset Filters
                         </button>
                      </div>
                   </div>
                )}

                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                   <table className="w-full text-left">
                      <thead className="bg-gray-50/50 text-gray-400 text-[10px] uppercase font-bold tracking-wider">
                         <tr>
                            <th className="p-5 w-10"><input type="checkbox" className="rounded border-gray-300"/></th>
                            <th className="p-5">Product Details</th>
                            <th className="p-5">Category</th>
                            <th className="p-5">Price</th>
                            <th className="p-5">Stock Status</th>
                            <th className="p-5 text-right">Actions</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                         {filteredProducts.map(product => (
                            <tr key={product.id} className="hover:bg-gray-50/80 group transition-colors">
                               <td className="p-5"><input type="checkbox" className="rounded border-gray-300"/></td>
                               <td className="p-5">
                                  <div className="flex items-center gap-4">
                                     <div className="w-12 h-12 rounded-xl bg-gray-50 flex-shrink-0 p-1 border border-gray-200">
                                        <img src={product.images && product.images.length > 0 ? product.images[0] : `https://picsum.photos/seed/${product.imageSeed}/100/100`} className="w-full h-full object-contain mix-blend-multiply" alt={product.name}/>
                                     </div>
                                     <div>
                                        <p className="font-bold text-gray-900 text-sm">{product.name}</p>
                                        <p className="text-xs text-gray-500 font-medium">{product.brand}</p>
                                     </div>
                                  </div>
                               </td>
                               <td className="p-5 text-sm text-gray-600 font-medium">
                                   <span className="px-2 py-1 bg-gray-100 rounded-lg text-xs">{product.category}</span>
                               </td>
                               <td className="p-5 font-bold text-slate-900 text-sm">{product.price} {appSettings.currency}</td>
                               <td className="p-5">
                                  <div className="flex items-center gap-2">
                                     <div className={`w-2 h-2 rounded-full ${product.stock > 10 ? 'bg-green-500' : product.stock > 0 ? 'bg-orange-500' : 'bg-red-500 animate-pulse'}`}></div>
                                     <div className="flex flex-col">
                                         <span className={`text-xs font-bold ${product.stock > 10 ? 'text-green-700' : product.stock > 0 ? 'text-orange-700' : 'text-red-700'}`}>
                                             {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                                         </span>
                                         <span className="text-[10px] text-gray-400">{product.stock} units</span>
                                     </div>
                                  </div>
                               </td>
                               <td className="p-5 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                     <button 
                                        onClick={() => {
                                           setEditingProduct(product);
                                           setProductFormTab('basic');
                                           setShowProductModal(true);
                                        }}
                                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                     >
                                         <Edit size={16}/>
                                     </button>
                                     <button 
                                       onClick={() => { if(window.confirm('Delete this product?')) deleteProduct(product.id) }}
                                       className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                     >
                                        <Trash2 size={16}/>
                                     </button>
                                  </div>
                               </td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </div>
          )}

          {activeTab === 'orders' && (
             <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 h-[calc(100vh-140px)]">
                <div className="flex gap-6 overflow-x-auto pb-6 h-full">
                    {['Processing', 'Shipped', 'Delivered', 'Cancelled'].map((status) => {
                        const statusOrders = filteredOrders.filter(o => o.status === status);
                        return (
                           <div key={status} className="min-w-[320px] flex-1 flex flex-col h-full">
                              <div className="flex items-center justify-between mb-4 px-2">
                                    <h3 className="font-bold text-slate-900">{status}</h3>
                                    <span className="bg-gray-200 text-gray-600 text-xs font-bold px-2 py-0.5 rounded-full">
                                       {statusOrders.length}
                                    </span>
                              </div>
                              
                              <div className="bg-gray-100/50 rounded-2xl p-3 flex-1 overflow-y-auto border border-gray-100/50 space-y-3 custom-scrollbar">
                                    {statusOrders.length === 0 && (
                                       <div className="h-24 flex items-center justify-center text-gray-400 text-sm italic border-2 border-dashed border-gray-200 rounded-xl">
                                          {searchTerm ? 'No matches' : 'No orders'}
                                       </div>
                                    )}
                                    {statusOrders.map(order => (
                                       <div key={order.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                          <div className="flex justify-between items-start mb-3">
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{order.id}</span>
                                                <span className="text-[10px] text-gray-400">{order.date}</span>
                                          </div>
                                          <div className="flex items-center gap-3 mb-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs border border-blue-100">
                                                   {order.customer.name.charAt(0)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                   <p className="text-sm font-bold text-gray-900 truncate">{order.customer.name}</p>
                                                   <p className="text-[10px] text-gray-500 truncate">{order.customer.address}</p>
                                                </div>
                                          </div>
                                          <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                                                <span className="text-sm font-black text-slate-900">{order.total} {appSettings.currency}</span>
                                                {status !== 'Delivered' && status !== 'Cancelled' && (
                                                   <button 
                                                      onClick={() => handleOrderStatusChange(order.id, order.status)}
                                                      className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                                                   >
                                                      Next Stage <ArrowRight size={12}/>
                                                   </button>
                                                )}
                                          </div>
                                       </div>
                                    ))}
                              </div>
                           </div>
                        );
                    })}
                </div>
             </div>
          )}

          {activeTab === 'customers' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                     <h3 className="font-bold text-lg text-gray-900">Customer Database</h3>
                     <button 
                        onClick={() => exportToCSV(filteredCustomers, 'customers_export.csv')}
                        className="px-4 py-2 bg-gray-50 text-gray-600 text-sm font-bold rounded-lg hover:bg-gray-100 flex items-center gap-2"
                     >
                        <Download size={16}/> Export List
                     </button>
                  </div>
                  <table className="w-full text-left">
                     <thead className="bg-gray-50/50 text-gray-400 text-[10px] uppercase font-bold tracking-wider">
                        <tr>
                           <th className="p-5">Customer Name</th>
                           <th className="p-5">Contact Info</th>
                           <th className="p-5">Total Spent</th>
                           <th className="p-5">Orders</th>
                           <th className="p-5">Last Active</th>
                           <th className="p-5 text-right">Segment</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-50">
                        {filteredCustomers.map((cust: any) => (
                           <tr key={cust.id} className="hover:bg-gray-50/50">
                              <td className="p-5">
                                 <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-sm">
                                       {cust.name.charAt(0)}
                                    </div>
                                    <span className="font-bold text-gray-900">{cust.name}</span>
                                 </div>
                              </td>
                              <td className="p-5">
                                 <div className="flex flex-col">
                                    <span className="text-sm text-gray-900">{cust.email}</span>
                                    <span className="text-xs text-gray-500">{cust.phone}</span>
                                 </div>
                              </td>
                              <td className="p-5 font-bold text-slate-900">{cust.totalSpent} {appSettings.currency}</td>
                              <td className="p-5 text-sm text-gray-600">{cust.ordersCount} Orders</td>
                              <td className="p-5 text-sm text-gray-500">{cust.lastOrder}</td>
                              <td className="p-5 text-right">
                                 <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                    cust.totalSpent > 1000 ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-blue-50 text-blue-600 border border-blue-100'
                                 }`}>
                                    {cust.totalSpent > 1000 ? 'VIP' : 'Active'}
                                 </span>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
          )}

          {activeTab === 'inventory' && (
             <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                 <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                     <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                         <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Inventory Value</h3>
                         <p className="text-3xl font-black text-slate-900">{(products.reduce((acc, p) => acc + (p.price * p.stock), 0)).toLocaleString()} <span className="text-sm text-gray-400">{appSettings.currency}</span></p>
                     </div>
                     <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-red-500">
                         <h3 className="text-red-500 text-xs font-bold uppercase tracking-wider mb-2">Out of Stock</h3>
                         <p className="text-3xl font-black text-slate-900">{outOfStockProducts} <span className="text-sm text-gray-400">Items</span></p>
                     </div>
                 </div>

                 <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                     <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                         <h3 className="font-bold text-lg text-slate-900">Stock Management</h3>
                         {searchTerm && <span className="text-xs text-primary font-bold bg-blue-50 px-2 py-1 rounded-full">Searching: "{searchTerm}"</span>}
                     </div>
                     <div className="divide-y divide-gray-100">
                         {filteredProducts.map(p => (
                             <div key={p.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                                 <div className="flex items-center gap-4">
                                     <div className={`p-2 rounded-lg ${p.stock === 0 ? 'bg-red-50 text-red-600' : p.stock < 5 ? 'bg-orange-50 text-orange-600' : 'bg-gray-50 text-gray-400'}`}>
                                         <Package size={20}/>
                                     </div>
                                     <div>
                                         <p className="font-bold text-sm text-slate-900">{p.name}</p>
                                         <p className="text-xs text-gray-500">SKU: {p.id}</p>
                                     </div>
                                 </div>
                                 <div className="flex items-center gap-6">
                                     <div className="text-right">
                                         <p className="text-xs text-gray-400 uppercase font-bold">Current Stock</p>
                                         <p className={`text-lg font-black ${p.stock < 5 ? 'text-red-600' : 'text-slate-900'}`}>{p.stock}</p>
                                     </div>
                                     <div className="flex gap-2">
                                         <button onClick={() => handleQuickStockUpdate(p, 10)} className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-bold rounded hover:bg-gray-200">+10</button>
                                         <button onClick={() => handleQuickStockUpdate(p, 50)} className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-bold rounded hover:bg-gray-200">+50</button>
                                         <button 
                                            onClick={() => handleQuickStockUpdate(p, -p.stock)} // Set to 0
                                            className="px-3 py-1.5 bg-red-50 text-red-600 text-xs font-bold rounded hover:bg-red-100"
                                         >
                                            Clear
                                         </button>
                                     </div>
                                 </div>
                             </div>
                         ))}
                     </div>
                 </div>
             </div>
          )}

          {activeTab === 'settings' && (
             <div className="max-w-3xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                   <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2"><SettingsIcon className="text-primary"/> Store Settings</h2>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Existing settings fields... */}
                      <div>
                         <label className="block text-sm font-bold text-gray-700 mb-2">Store Name</label>
                         <input 
                           type="text" 
                           value={appSettings.storeName}
                           onChange={e => updateSettings({...appSettings, storeName: e.target.value})}
                           className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary outline-none" 
                        />
                      </div>
                      {/* ... other settings inputs same as before ... */}
                      <div>
                         <label className="block text-sm font-bold text-gray-700 mb-2">Currency Symbol</label>
                         <input 
                           type="text" 
                           value={appSettings.currency}
                           onChange={e => updateSettings({...appSettings, currency: e.target.value})}
                           className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary outline-none" 
                        />
                      </div>
                      <div>
                         <label className="block text-sm font-bold text-gray-700 mb-2">Support Email</label>
                         <input 
                           type="email" 
                           value={appSettings.supportEmail}
                           onChange={e => updateSettings({...appSettings, supportEmail: e.target.value})}
                           className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary outline-none" 
                        />
                      </div>
                      <div>
                         <label className="block text-sm font-bold text-gray-700 mb-2">Support Phone</label>
                         <input 
                           type="text" 
                           value={appSettings.supportPhone}
                           onChange={e => updateSettings({...appSettings, supportPhone: e.target.value})}
                           className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary outline-none" 
                        />
                      </div>
                   </div>
                </div>
             </div>
          )}

       </main>

       {/* Add/Edit Product Modal - Tabbed Interface */}
       {showProductModal && (
          <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
             <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[90vh]">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                   <h3 className="font-bold text-xl text-gray-900 flex items-center gap-2">
                      <Package className="text-primary"/> {editingProduct.id ? 'Edit Product' : 'Add New Product'}
                   </h3>
                   <button onClick={() => setShowProductModal(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><X size={20}/></button>
                </div>

                {/* Tab Navigation */}
                <div className="flex border-b border-gray-100 overflow-x-auto">
                  {['basic', 'pricing', 'media', 'specs', 'seo'].map(tab => (
                     <button 
                        key={tab} 
                        onClick={() => setProductFormTab(tab as any)} 
                        className={`px-6 py-4 text-sm font-bold uppercase tracking-wider transition-colors flex items-center gap-2 ${productFormTab === tab ? 'text-primary border-b-2 border-primary bg-blue-50/20' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
                     >
                        {tab === 'basic' && <FileText size={16}/>}
                        {tab === 'pricing' && <DollarSign size={16}/>}
                        {tab === 'media' && <ImageIcon size={16}/>}
                        {tab === 'specs' && <Layers size={16}/>}
                        {tab === 'seo' && <Globe size={16}/>}
                        {tab}
                     </button>
                  ))}
                </div>
                
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                   <form id="productForm" onSubmit={handleSaveProduct}>
                       {/* 1. BASIC INFO TAB */}
                       {productFormTab === 'basic' && (
                          <div className="grid grid-cols-2 gap-6 animate-in fade-in duration-300">
                             <div className="col-span-2">
                                 <label className="block text-sm font-bold text-gray-700 mb-2">Product Title</label>
                                 <input 
                                    type="text" 
                                    required
                                    value={editingProduct.name}
                                    onChange={e => setEditingProduct({...editingProduct, name: e.target.value})}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary outline-none font-medium" 
                                    placeholder="e.g. iPhone 15 Pro Max"
                                 />
                             </div>
                             <div>
                                 <label className="block text-sm font-bold text-gray-700 mb-2">Brand</label>
                                 <select 
                                    value={editingProduct.brand}
                                    onChange={e => setEditingProduct({...editingProduct, brand: e.target.value})}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary outline-none font-medium text-gray-600"
                                 >
                                     {['Apple', 'Samsung', 'Google', 'Sony', 'OnePlus', 'Generic'].map(b => <option key={b} value={b}>{b}</option>)}
                                 </select>
                             </div>
                             <div>
                                 <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                                 <select 
                                    value={editingProduct.category}
                                    onChange={e => setEditingProduct({...editingProduct, category: e.target.value as any})}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary outline-none font-medium text-gray-600"
                                 >
                                     {['Smartphones', 'Tablets', 'Wearables', 'Audio', 'Accessories'].map(c => <option key={c} value={c}>{c}</option>)}
                                 </select>
                             </div>
                             <div className="col-span-2">
                                 <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                                 <textarea 
                                    value={editingProduct.description}
                                    onChange={e => setEditingProduct({...editingProduct, description: e.target.value})}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary outline-none font-medium h-48 resize-none" 
                                    placeholder="Detailed product description..."
                                 ></textarea>
                             </div>
                          </div>
                       )}

                       {/* 2. PRICING TAB */}
                       {productFormTab === 'pricing' && (
                          <div className="grid grid-cols-2 gap-6 animate-in fade-in duration-300">
                             <div>
                                 <label className="block text-sm font-bold text-gray-700 mb-2">Selling Price ({appSettings.currency})</label>
                                 <input 
                                    type="number" 
                                    required
                                    min="0"
                                    value={editingProduct.price}
                                    onChange={e => setEditingProduct({...editingProduct, price: parseFloat(e.target.value)})}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary outline-none font-medium text-lg" 
                                 />
                             </div>
                             <div>
                                 <label className="block text-sm font-bold text-gray-700 mb-2">Original Price (for Discounts)</label>
                                 <input 
                                    type="number" 
                                    min="0"
                                    value={editingProduct.originalPrice || ''}
                                    onChange={e => setEditingProduct({...editingProduct, originalPrice: parseFloat(e.target.value)})}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary outline-none font-medium" 
                                 />
                             </div>
                             <div>
                                 <label className="block text-sm font-bold text-gray-700 mb-2">Stock Quantity</label>
                                 <input 
                                    type="number" 
                                    required
                                    min="0"
                                    value={editingProduct.stock}
                                    onChange={e => setEditingProduct({...editingProduct, stock: parseInt(e.target.value)})}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary outline-none font-medium" 
                                 />
                             </div>
                             <div className="flex items-end">
                                <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-xl w-full bg-gray-50 hover:bg-white hover:shadow-sm transition-all">
                                   <input 
                                     type="checkbox" 
                                     checked={editingProduct.express || false}
                                     onChange={e => setEditingProduct({...editingProduct, express: e.target.checked})}
                                     className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                                   />
                                   <span className="font-bold text-gray-700 flex items-center gap-2"><Truck size={16}/> Express Delivery Eligible</span>
                                </label>
                             </div>
                          </div>
                       )}

                       {/* 3. MEDIA TAB (New) */}
                       {productFormTab === 'media' && (
                          <div className="space-y-8 animate-in fade-in duration-300">
                             {/* Drag & Drop Area */}
                             <div 
                               onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
                               onDrop={handleImageDrop}
                               className="border-3 border-dashed border-gray-200 rounded-2xl p-10 text-center hover:border-primary hover:bg-blue-50/30 transition-all cursor-pointer group"
                             >
                                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-100 transition-colors">
                                   <Upload className="text-primary" size={32}/>
                                </div>
                                <h4 className="text-lg font-bold text-gray-900 mb-1">Drag & Drop Product Images</h4>
                                <p className="text-sm text-gray-500 mb-4">or click to browse files</p>
                                <label className="inline-block px-6 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-700 shadow-sm hover:bg-gray-50 cursor-pointer">
                                   Select Files
                                   <input type="file" multiple className="hidden" onChange={(e) => handleImageSelect(e.target.files)}/>
                                </label>
                             </div>

                             {/* Image Grid */}
                             <div>
                                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><ImageIcon size={18}/> Product Gallery</h4>
                                <div className="grid grid-cols-5 gap-4">
                                   {editingProduct.images && editingProduct.images.length > 0 ? (
                                      editingProduct.images.map((img, idx) => (
                                         <div key={idx} className="aspect-square bg-gray-50 rounded-xl border border-gray-200 relative group overflow-hidden">
                                            <img src={img} className="w-full h-full object-contain" alt={`Product ${idx}`}/>
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                <button type="button" onClick={() => {
                                                   const newImages = editingProduct.images?.filter((_, i) => i !== idx);
                                                   setEditingProduct({...editingProduct, images: newImages});
                                                }} className="p-2 bg-white rounded-full text-red-500 hover:bg-red-50"><Trash2 size={16}/></button>
                                            </div>
                                         </div>
                                      ))
                                   ) : (
                                      <div className="col-span-5 py-8 text-center text-gray-400 bg-gray-50 rounded-xl border border-gray-100 border-dashed">
                                         No images uploaded yet
                                      </div>
                                   )}
                                </div>
                             </div>

                             {/* Bulk Processing */}
                             <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Sparkles size={18} className="text-secondary"/> Bulk Processing</h4>
                                <div className="flex gap-3">
                                   <button 
                                     type="button"
                                     onClick={() => handleMockBulkProcess('Resize for Web')}
                                     disabled={isProcessingImages}
                                     className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50 flex items-center gap-2"
                                   >
                                      {isProcessingImages ? <Loader2 size={14} className="animate-spin"/> : <Minimize size={14}/>} Resize for Web
                                   </button>
                                   <button 
                                     type="button"
                                     onClick={() => handleMockBulkProcess('Generate Thumbnails')}
                                     disabled={isProcessingImages}
                                     className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50 flex items-center gap-2"
                                   >
                                      {isProcessingImages ? <Loader2 size={14} className="animate-spin"/> : <Layers size={14}/>} Generate Thumbnails
                                   </button>
                                </div>
                             </div>
                          </div>
                       )}
                       
                       {/* 4. SPECS TAB */}
                       {productFormTab === 'specs' && (
                          <div className="space-y-6 animate-in fade-in duration-300">
                              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-sm text-blue-700 flex items-center gap-3">
                                 <AlertCircle size={20}/>
                                 Technical specifications help customers compare products. Add as many details as possible.
                              </div>
                              
                              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                 <table className="w-full">
                                    <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase">
                                       <tr>
                                          <th className="p-4 text-left">Specification Key</th>
                                          <th className="p-4 text-left">Value</th>
                                          <th className="p-4 w-10"></th>
                                       </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                       {Object.entries(editingProduct.specs || {}).map(([key, val]) => (
                                          <tr key={key}>
                                             <td className="p-3">
                                                <input type="text" className="w-full bg-transparent font-bold text-gray-700 focus:outline-none" value={key} readOnly/>
                                             </td>
                                             <td className="p-3">
                                                <input 
                                                   type="text" 
                                                   className="w-full bg-gray-50 p-2 rounded border border-transparent focus:bg-white focus:border-primary focus:outline-none transition-colors"
                                                   value={val as string}
                                                   onChange={(e) => handleSpecChange(key, e.target.value)}
                                                />
                                             </td>
                                             <td className="p-3 text-right">
                                                <button type="button" onClick={() => removeSpec(key)} className="text-gray-400 hover:text-red-500"><X size={16}/></button>
                                             </td>
                                          </tr>
                                       ))}
                                       {/* Add New Spec Row */}
                                       <tr className="bg-gray-50">
                                          <td className="p-3">
                                             <input 
                                                id="newSpecKey"
                                                type="text" 
                                                className="w-full bg-white p-2 rounded border border-gray-200 focus:border-primary outline-none" 
                                                placeholder="e.g. Battery"
                                             />
                                          </td>
                                          <td className="p-3">
                                             <input 
                                                id="newSpecVal"
                                                type="text" 
                                                className="w-full bg-white p-2 rounded border border-gray-200 focus:border-primary outline-none" 
                                                placeholder="e.g. 5000mAh"
                                             />
                                          </td>
                                          <td className="p-3 text-right">
                                             <button type="button" onClick={() => {
                                                const keyInput = document.getElementById('newSpecKey') as HTMLInputElement;
                                                const valInput = document.getElementById('newSpecVal') as HTMLInputElement;
                                                if(keyInput.value && valInput.value) {
                                                   handleSpecChange(keyInput.value, valInput.value);
                                                   keyInput.value = '';
                                                   valInput.value = '';
                                                }
                                             }} className="p-1 bg-primary text-white rounded-md hover:bg-slate-800"><Plus size={16}/></button>
                                          </td>
                                       </tr>
                                    </tbody>
                                 </table>
                              </div>
                          </div>
                       )}

                       {/* 5. SEO TAB (New) */}
                       {productFormTab === 'seo' && (
                          <div className="space-y-8 animate-in fade-in duration-300">
                             <div className="grid grid-cols-1 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Meta Title</label>
                                    <input 
                                       type="text" 
                                       value={editingProduct.seo?.metaTitle || editingProduct.name}
                                       onChange={e => setEditingProduct({ ...editingProduct, seo: { ...editingProduct.seo, metaTitle: e.target.value } as any })}
                                       className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary outline-none font-medium" 
                                       placeholder="SEO Title"
                                    />
                                    <p className="text-xs text-gray-400 mt-1">Recommended length: 50-60 characters</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Meta Description</label>
                                    <textarea 
                                       value={editingProduct.seo?.metaDescription || editingProduct.description}
                                       onChange={e => setEditingProduct({ ...editingProduct, seo: { ...editingProduct.seo, metaDescription: e.target.value } as any })}
                                       className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary outline-none font-medium h-24 resize-none" 
                                       placeholder="SEO Description"
                                    ></textarea>
                                    <p className="text-xs text-gray-400 mt-1">Recommended length: 150-160 characters</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Keywords (Comma separated)</label>
                                    <input 
                                       type="text" 
                                       value={editingProduct.seo?.keywords?.join(', ') || ''}
                                       onChange={e => setEditingProduct({ ...editingProduct, seo: { ...editingProduct.seo, keywords: e.target.value.split(',').map(s => s.trim()) } as any })}
                                       className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary outline-none font-medium" 
                                       placeholder="smartphone, 5g, android"
                                    />
                                </div>
                             </div>

                             {/* SEO Previews */}
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-gray-100">
                                {/* Google Preview */}
                                <div>
                                   <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Globe size={18} className="text-blue-500"/> Search Engine Preview</h4>
                                   <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                      <div className="flex items-center gap-2 mb-1">
                                          <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-[10px] font-bold">L</div>
                                          <div>
                                             <div className="text-xs text-gray-800">LAKKI PHONES</div>
                                             <div className="text-[10px] text-gray-500">https://lakkiphones.com/product/{editingProduct.id || 'new'}</div>
                                          </div>
                                      </div>
                                      <h3 className="text-xl text-blue-700 hover:underline cursor-pointer font-medium truncate">
                                         {editingProduct.seo?.metaTitle || editingProduct.name || 'Product Title'}
                                      </h3>
                                      <p className="text-sm text-gray-600 line-clamp-2">
                                         {editingProduct.seo?.metaDescription || editingProduct.description || 'Product description will appear here...'}
                                      </p>
                                   </div>
                                </div>

                                {/* Social Preview */}
                                <div>
                                   <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Share2 size={18} className="text-blue-600"/> Social Share Preview</h4>
                                   <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden max-w-sm mx-auto">
                                      <div className="h-40 bg-gray-100 flex items-center justify-center overflow-hidden">
                                         {editingProduct.images && editingProduct.images.length > 0 ? (
                                            <img src={editingProduct.images[0]} className="w-full h-full object-cover" alt="Preview"/>
                                         ) : (
                                            <ImageIcon className="text-gray-300" size={40}/>
                                         )}
                                      </div>
                                      <div className="p-3 bg-gray-50">
                                         <p className="text-xs text-gray-500 uppercase font-bold mb-1">LAKKI PHONES</p>
                                         <h3 className="font-bold text-gray-900 leading-tight mb-1 truncate">
                                            {editingProduct.seo?.metaTitle || editingProduct.name || 'Product Title'}
                                         </h3>
                                         <p className="text-xs text-gray-600 line-clamp-2">
                                            {editingProduct.seo?.metaDescription || editingProduct.description || 'Description...'}
                                         </p>
                                      </div>
                                   </div>
                                </div>
                             </div>
                          </div>
                       )}
                   </form>
                </div>

                <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                   <button onClick={() => setShowProductModal(false)} className="px-6 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50">Cancel</button>
                   <button form="productForm" type="submit" className="px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-slate-800 shadow-lg shadow-primary/20">
                      {editingProduct.id ? 'Update Product' : 'Save Product'}
                   </button>
                </div>
             </div>
          </div>
       )}
    </div>
  );
};
