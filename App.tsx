
import React from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ShopProvider } from './context/ShopContext';
import { Navbar } from './components/Navbar';
import { CartDrawer } from './components/CartDrawer';
import { Toast } from './components/Toast';
import { BottomNav } from './components/BottomNav';
import { Footer } from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Home } from './pages/Home';
import { ProductDetails } from './pages/ProductDetails';
import { Checkout } from './pages/Checkout';
import { Wishlist } from './pages/Wishlist';
import { Compare } from './pages/Compare';
import { Shop } from './pages/Shop';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Account } from './pages/Account';
import { AdminDashboard } from './pages/AdminDashboard';
import { Contact } from './pages/Contact';
import { Cart } from './pages/Cart';
import { About } from './pages/About';
import { FAQ } from './pages/FAQ';
import { Returns } from './pages/Returns';
import { Privacy } from './pages/Privacy';
import { TrackOrder } from './pages/TrackOrder';
import { CategoriesPage } from './pages/CategoriesPage';
import { DealsPage } from './pages/DealsPage';
import { KnetGateway } from './pages/KnetGateway';
import { OrderConfirmation } from './pages/OrderConfirmation';
import { NotFound } from './pages/NotFound';

const MainLayout: React.FC = () => {
  const location = useLocation();
  
  // Define routes that should NOT have the public navigation (Navbar, Footer, BottomNav)
  const isStandalonePage = 
    location.pathname.startsWith('/admin') || 
    location.pathname === '/login' || 
    location.pathname === '/register' ||
    location.pathname === '/checkout' ||
    location.pathname === '/knet-gateway';

  return (
    <div className={`flex flex-col min-h-screen font-sans ${isStandalonePage ? '' : 'pb-16 md:pb-0'}`}>
      {!isStandalonePage && <Navbar />}
      <CartDrawer />
      <Toast />
      
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/deals" element={<DealsPage />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/knet-gateway" element={<KnetGateway />} />
          <Route path="/order-confirmation" element={<OrderConfirmation />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/account" element={<Account />} />
          <Route path="/track-order" element={<TrackOrder />} />
          <Route path="/admin/*" element={<AdminDashboard />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/returns" element={<Returns />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      
      {!isStandalonePage && <Footer />}
      {!isStandalonePage && <BottomNav />}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <HashRouter>
        <ShopProvider>
          <ScrollToTop />
          <MainLayout />
        </ShopProvider>
      </HashRouter>
    </ErrorBoundary>
  );
};

export default App;
