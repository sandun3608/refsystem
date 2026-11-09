import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MainShopPage from './components/MainShopPage';
import RepSelectionPage from './components/RepSelectionPage';
import CustomerShopPage from './components/CustomerShopPage';
import DashboardPage from './components/DashboardPage';
import CheckoutPage from './components/CheckoutPage';
import OrdersPage from './components/OrdersPage';
import ProductManagePage from './components/ProductManagePage';
import ReportsPage from './components/ReportsPage';
import SettingsPage from './components/SettingsPage';
import ShopDetailsPage from './components/ShopDetailsPage';
import NotificationsModal from './components/NotificationsModal';
import { api } from './api';

export default function App() {
  // Database States
  const [shops, setShops] = useState([]);
  const [reps, setReps] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Active Session Navigation Context
  const [activeMainShop, setActiveMainShop] = useState(null);
  const [activeRep, setActiveRep] = useState(null);
  const [activeCustomer, setActiveCustomer] = useState(null);

  // Current Screen
  // 'mainShops' | 'reps' | 'customers' | 'dashboard' | 'checkout' | 'orders' | 'products' | 'reports' | 'settings' | 'shopDetails'
  const [currentScreen, setCurrentScreen] = useState('mainShops');
  
  // Navigation Sidebar & Modals
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Selected Products for Order: { [productId]: { quantity: number, discount: number } }
  const [selectedItems, setSelectedItems] = useState({});

  // iPhone 17 Pro Preview Frame Toggle (desktop feature)
  const [isPhoneFrame, setIsPhoneFrame] = useState(true);

  // Load Initial Data from Backend
  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await api.getAllData();
      if (data) {
        setShops(data.shops || []);
        setReps(data.reps || []);
        setCustomers(data.customers || []);
        setCategories(data.categories || []);
        setProducts(data.products || []);
        setOrders(data.orders || []);

        // Default active selections if available
        if (data.shops?.length > 0 && !activeMainShop) {
          setActiveMainShop(data.shops[0]);
        }
        if (data.reps?.length > 0 && !activeRep) {
          setActiveRep(data.reps[0]);
        }
        if (data.customers?.length > 0 && !activeCustomer) {
          setActiveCustomer(data.customers[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute Unread Notification Count (Cheques due soon + low stock items)
  const unreadNotificationsCount = React.useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const chequesDueCount = orders.filter(o => {
      if (o.paymentMethod !== 'Cheque' || !o.chequeDetails?.chequeDate) return false;
      const dueDate = new Date(o.chequeDetails.chequeDate);
      dueDate.setHours(0, 0, 0, 0);
      const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
      return diffDays <= 3;
    }).length;

    const lowStockCount = products.filter(p => p.stock <= (p.lowStockThreshold || 10)).length;

    return chequesDueCount + lowStockCount;
  }, [orders, products]);

  // Screen Title & Subtitle
  const getScreenDetails = () => {
    switch (currentScreen) {
      case 'mainShops':
        return { title: 'Select Importer Shop', subtitle: 'Step 1: Choose distribution center' };
      case 'reps':
        return { title: 'Delivery Reps', subtitle: 'Step 2: Who is out for delivery today?' };
      case 'customers':
        return { title: 'Customer Retail Outlets', subtitle: 'Step 3: Select destination shop' };
      case 'dashboard':
        return { title: 'Cosmetics Inventory', subtitle: activeCustomer?.name || 'Create Orders' };
      case 'checkout':
        return { title: 'Order Checkout', subtitle: 'Confirm batch & payment' };
      case 'orders':
        return { title: 'Order History & Invoices', subtitle: 'Delivery fulfillment & bills' };
      case 'products':
        return { title: 'Product Catalog Management', subtitle: 'SKU, pricing, excel export' };
      case 'reports':
        return { title: 'Analytics & Reports', subtitle: 'Stock valuation & profits' };
      case 'settings':
        return { title: 'System Settings', subtitle: 'Reps, shops, and backups' };
      case 'shopDetails':
        return { title: 'Active Session Route', subtitle: 'Current distribution path' };
      default:
        return { title: 'LumiRep Pro', subtitle: 'Cosmetics Distribution' };
    }
  };

  const { title, subtitle } = getScreenDetails();

  // Navigation Back Handlers
  const handleBack = () => {
    if (currentScreen === 'reps') setCurrentScreen('mainShops');
    else if (currentScreen === 'customers') setCurrentScreen('reps');
    else if (currentScreen === 'dashboard') setCurrentScreen('customers');
    else if (currentScreen === 'checkout') setCurrentScreen('dashboard');
    else setCurrentScreen('dashboard');
  };

  // Step 1: Select Main Shop -> Navigate to Step 2 (Reps)
  const handleSelectMainShop = (shop) => {
    setActiveMainShop(shop);
    setCurrentScreen('reps');
  };

  // Step 2: Select Rep -> Navigate to Step 3 (Customer Shop)
  const handleSelectRep = (rep) => {
    setActiveRep(rep);
    setCurrentScreen('customers');
  };

  // Step 3: Select Customer Shop -> Navigate to Step 4 (Dashboard & Inventory)
  const handleSelectCustomer = (customer) => {
    setActiveCustomer(customer);
    setSelectedItems({});
    setCurrentScreen('dashboard');
  };

  // Order item selection toggles
  const handleToggleSelectItem = (product) => {
    setSelectedItems(prev => {
      const copy = { ...prev };
      if (copy[product.id]) {
        delete copy[product.id];
      } else {
        copy[product.id] = {
          quantity: 1,
          discount: product.discount || 0
        };
      }
      return copy;
    });
  };

  const handleUpdateQuantity = (productId, newQty) => {
    if (newQty <= 0) {
      handleRemoveItem(productId);
      return;
    }
    setSelectedItems(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        quantity: newQty
      }
    }));
  };

  const handleUpdateItemDiscount = (productId, discount) => {
    setSelectedItems(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        discount
      }
    }));
  };

  const handleRemoveItem = (productId) => {
    setSelectedItems(prev => {
      const copy = { ...prev };
      delete copy[productId];
      return copy;
    });
  };

  // Create Order from Dashboard -> Navigates to Checkout
  const handleGoToCheckout = () => {
    if (Object.keys(selectedItems).length === 0) return;
    setCurrentScreen('checkout');
  };

  // Place Order from Checkout -> Saves to DB & goes to Orders
  const handleSubmitOrder = async (orderPayload) => {
    try {
      const savedOrder = await api.createOrder(orderPayload);
      setOrders(prev => [savedOrder, ...prev]);

      // Deduct stock locally
      setProducts(prevProducts => {
        return prevProducts.map(p => {
          const item = orderPayload.items.find(i => i.productId === p.id);
          if (item) {
            return { ...p, stock: Math.max(0, p.stock - item.quantity) };
          }
          return p;
        });
      });

      setSelectedItems({});
      setCurrentScreen('orders');
    } catch (err) {
      console.error('Failed to submit order:', err);
    }
  };

  // Update order status (Processing / Delivered)
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.updateOrderStatus(orderId, newStatus);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (err) {
      console.error('Failed to update order status:', err);
    }
  };

  // Add / Delete Entities
  const handleAddShop = async (shopData) => {
    const saved = await api.addShop(shopData);
    setShops(prev => [saved, ...prev]);
  };

  const handleDeleteShop = async (shopId) => {
    await api.deleteShop(shopId);
    setShops(prev => prev.filter(s => s.id !== shopId));
    if (activeMainShop?.id === shopId) {
      setActiveMainShop(shops[1] || null);
    }
  };

  const handleAddRep = async (repData) => {
    const saved = await api.addRep(repData);
    setReps(prev => [saved, ...prev]);
  };

  const handleDeleteRep = async (repId) => {
    await api.deleteRep(repId);
    setReps(prev => prev.filter(r => r.id !== repId));
    if (activeRep?.id === repId) {
      setActiveRep(reps[1] || null);
    }
  };

  const handleAddCustomer = async (custData) => {
    const saved = await api.addCustomer(custData);
    setCustomers(prev => [saved, ...prev]);
  };

  const handleDeleteCustomer = async (custId) => {
    await api.deleteCustomer(custId);
    setCustomers(prev => prev.filter(c => c.id !== custId));
    if (activeCustomer?.id === custId) {
      setActiveCustomer(customers[1] || null);
    }
  };

  // Products & Categories
  const handleAddProduct = async (productData) => {
    const saved = await api.addProduct(productData);
    setProducts(prev => [saved, ...prev]);
  };

  const handleUpdateProduct = async (productId, updatedData) => {
    const saved = await api.updateProduct(productId, updatedData);
    setProducts(prev => prev.map(p => p.id === productId ? saved : p));
  };

  const handleDeleteProduct = async (productId) => {
    await api.deleteProduct(productId);
    setProducts(prev => prev.filter(p => p.id !== productId));
  };

  const handleBulkDeleteProducts = async (ids) => {
    await api.bulkDeleteProducts(ids);
    setProducts(prev => prev.filter(p => !ids.includes(p.id)));
  };

  const handleAddCategory = async (name) => {
    const res = await api.addCategory(name);
    setCategories(res.categories);
  };

  const handleDeleteCategory = async (name) => {
    const res = await api.deleteCategory(name);
    setCategories(res.categories);
  };

  // Reset Demo Data
  const handleResetDemo = async () => {
    const res = await api.resetDemo();
    if (res.data) {
      setShops(res.data.shops);
      setReps(res.data.reps);
      setCustomers(res.data.customers);
      setCategories(res.data.categories);
      setProducts(res.data.products);
      setOrders(res.data.orders);
      setActiveMainShop(res.data.shops[0]);
      setActiveRep(res.data.reps[0]);
      setActiveCustomer(res.data.customers[0]);
      setSelectedItems({});
      setCurrentScreen('mainShops');
    }
  };

  // Restore Backup
  const handleRestoreBackup = async (data) => {
    await api.restoreBackup(data);
    await loadData();
  };

  // Log Out / Reset to Step 1 (Main Shops)
  const handleLogout = () => {
    setSelectedItems({});
    setCurrentScreen('mainShops');
  };

  // Handle clicking an order from Notifications modal
  const handleSelectOrderFromNotifications = (orderId) => {
    setCurrentScreen('orders');
    setSearchTerm(orderId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-blue-600 flex items-center justify-center animate-bounce shadow-2xl shadow-blue-500/50">
          <span className="text-3xl">✨</span>
        </div>
        <div className="text-center">
          <h2 className="text-lg font-bold">LumiRep Pro</h2>
          <p className="text-xs text-blue-200 animate-pulse">Loading cosmetics inventory & reps...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-slate-200/90 flex items-center justify-center p-0 md:p-4 select-none`}>
      
      {/* 
        iPhone 17 Pro Frame Container:
        Target resolution: ~402px wide x 874px high on desktop, full width on real mobile.
      */}
      <div className={`w-full transition-all duration-300 ${
        isPhoneFrame 
          ? 'max-w-[420px] md:h-[915px] md:rounded-[50px] md:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35)] md:border-[10px] md:border-slate-800'
          : 'max-w-2xl min-h-screen md:min-h-[90vh] md:rounded-3xl shadow-xl border border-slate-300'
      } bg-[#f8fafc] flex flex-col overflow-hidden relative`}>

        {/* iPhone Dynamic Island & Speaker Notch (visible on phone frame on desktop) */}
        {isPhoneFrame && (
          <div className="hidden md:flex items-center justify-center pt-3 pb-1 bg-white border-b border-slate-100 z-40">
            <div className="w-28 h-6 bg-slate-900 rounded-full flex items-center justify-between px-3 text-[9px] text-white font-semibold shadow-inner">
              <span className="text-[10px] text-emerald-400">●</span>
              <span className="text-[9px] tracking-widest text-slate-400">LUMI</span>
              <span className="text-[10px] text-blue-400 font-mono">17 Pro</span>
            </div>
          </div>
        )}

        {/* App Main Header */}
        <Header
          currentScreen={currentScreen}
          title={title}
          subtitle={subtitle}
          onBack={handleBack}
          onToggleSidebar={() => setIsSidebarOpen(true)}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          unreadNotificationsCount={unreadNotificationsCount}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          isPhoneFrame={isPhoneFrame}
          onToggleFrame={() => setIsPhoneFrame(!isPhoneFrame)}
        />

        {/* Main Content View Container */}
        <main className="flex-1 overflow-y-auto no-scrollbar relative bg-[#f8fafc]">
          
          {/* Page 1: Main Importer Shop Selection */}
          {currentScreen === 'mainShops' && (
            <MainShopPage
              shops={shops}
              onSelectShop={handleSelectMainShop}
              onAddShop={handleAddShop}
              onDeleteShop={handleDeleteShop}
            />
          )}

          {/* Page 2: Delivery Reps Selection ("Ada delivery awe kawda?") */}
          {currentScreen === 'reps' && (
            <RepSelectionPage
              reps={reps}
              onSelectRep={handleSelectRep}
              onAddRep={handleAddRep}
              onDeleteRep={handleDeleteRep}
              mainShop={activeMainShop}
            />
          )}

          {/* Page 3: Customer Shop Selection ("Badu dana shop thoranna") */}
          {currentScreen === 'customers' && (
            <CustomerShopPage
              customers={customers}
              onSelectCustomer={handleSelectCustomer}
              onAddCustomer={handleAddCustomer}
              onDeleteCustomer={handleDeleteCustomer}
              mainShop={activeMainShop}
              rep={activeRep}
            />
          )}

          {/* Page 4 & 6: Dashboard & Inventory & Ordering */}
          {currentScreen === 'dashboard' && (
            <DashboardPage
              products={products}
              categories={categories}
              selectedItems={selectedItems}
              onToggleSelectItem={handleToggleSelectItem}
              onUpdateQuantity={handleUpdateQuantity}
              onUpdateItemDiscount={handleUpdateItemDiscount}
              onCreateOrder={handleGoToCheckout}
              activeCustomer={activeCustomer}
              activeRep={activeRep}
              activeMainShop={activeMainShop}
              searchTerm={searchTerm}
            />
          )}

          {/* Page 7: Checkout & Order Summary */}
          {currentScreen === 'checkout' && (
            <CheckoutPage
              selectedItems={selectedItems}
              products={products}
              activeCustomer={activeCustomer}
              activeRep={activeRep}
              activeMainShop={activeMainShop}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem}
              onSubmitOrder={handleSubmitOrder}
              onCancel={() => setCurrentScreen('dashboard')}
            />
          )}

          {/* Page 8: Orders History, Cheque Alerts, PDF & WhatsApp */}
          {currentScreen === 'orders' && (
            <OrdersPage
              orders={orders}
              onUpdateStatus={handleUpdateOrderStatus}
              searchTerm={searchTerm}
            />
          )}

          {/* Page 9: Product Manage, Categories, Excel Export */}
          {currentScreen === 'products' && (
            <ProductManagePage
              products={products}
              categories={categories}
              onAddProduct={handleAddProduct}
              onUpdateProduct={handleUpdateProduct}
              onDeleteProduct={handleDeleteProduct}
              onBulkDeleteProducts={handleBulkDeleteProducts}
              onAddCategory={handleAddCategory}
              onDeleteCategory={handleDeleteCategory}
            />
          )}

          {/* Page 10: Reports & Visual Charts */}
          {currentScreen === 'reports' && (
            <ReportsPage
              products={products}
              orders={orders}
              customers={customers}
            />
          )}

          {/* Page 11: Settings & Data Backups */}
          {currentScreen === 'settings' && (
            <SettingsPage
              shops={shops}
              reps={reps}
              customers={customers}
              onDeleteShop={handleDeleteShop}
              onDeleteRep={handleDeleteRep}
              onDeleteCustomer={handleDeleteCustomer}
              onResetDemo={handleResetDemo}
              onRestoreBackup={handleRestoreBackup}
            />
          )}

          {/* Direct view for Ref Manage */}
          {currentScreen === 'refManage' && (
            <RepSelectionPage
              reps={reps}
              onSelectRep={handleSelectRep}
              onAddRep={handleAddRep}
              onDeleteRep={handleDeleteRep}
              mainShop={activeMainShop}
            />
          )}

          {/* Direct view for Sales Overview */}
          {currentScreen === 'sales' && (
            <ReportsPage
              products={products}
              orders={orders}
              customers={customers}
            />
          )}

          {/* Direct view for Shop Details */}
          {currentScreen === 'shopDetails' && (
            <ShopDetailsPage
              activeMainShop={activeMainShop}
              activeRep={activeRep}
              activeCustomer={activeCustomer}
              onSwitchCustomer={() => setCurrentScreen('customers')}
              onSwitchRep={() => setCurrentScreen('reps')}
            />
          )}

        </main>

        {/* iPhone Home Indicator bar at bottom */}
        {isPhoneFrame && (
          <div className="hidden md:flex items-center justify-center py-1.5 bg-white border-t border-slate-100 z-40">
            <div className="w-32 h-1 bg-slate-300 rounded-full" />
          </div>
        )}

        {/* Side Navigation Drawer (the 3 lines hamburger menu) */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          currentScreen={currentScreen}
          onNavigate={(screenId) => {
            if (screenId === 'notifications') {
              setIsNotificationsOpen(true);
            } else {
              setCurrentScreen(screenId);
              setSearchTerm('');
            }
          }}
          activeMainShop={activeMainShop}
          activeRep={activeRep}
          activeCustomer={activeCustomer}
          onLogout={handleLogout}
          unreadCount={unreadNotificationsCount}
        />

        {/* Notifications Modal */}
        <NotificationsModal
          isOpen={isNotificationsOpen}
          onClose={() => setIsNotificationsOpen(false)}
          orders={orders}
          products={products}
          onSelectOrder={handleSelectOrderFromNotifications}
        />

      </div>
    </div>
  );
}
