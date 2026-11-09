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
import AdminPortalPage from './components/AdminPortalPage';
import AdminLoginModal from './components/AdminLoginModal';
import NotificationsModal from './components/NotificationsModal';
import BottomNav from './components/BottomNav';
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
  // 'mainShops' | 'reps' | 'customers' | 'dashboard' | 'checkout' | 'orders' | 'products' | 'reports' | 'settings' | 'shopDetails' | 'admin'
  const [currentScreen, setCurrentScreen] = useState('mainShops');
  
  // Navigation Sidebar & Modals
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Admin Security & Portal States
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);

  // Selected Products for Order: { [productId]: { quantity: number, discount: number } }
  const [selectedItems, setSelectedItems] = useState({});

  // iPhone 17 Pro Preview Frame Toggle (desktop feature)
  const [isPhoneFrame, setIsPhoneFrame] = useState(true);

  const STORAGE_KEY = 'lumicosmetics_client_store_v1';

  // Sanitize helper to purge any stale test entities ("Haj", "Bb", "Ahha")
  const sanitizeData = (data) => {
    if (!data) return data;
    if (Array.isArray(data.shops)) {
      data.shops = data.shops.filter(s => s.id !== 'MS001jaja' && s.name !== 'Haj');
    }
    if (Array.isArray(data.reps)) {
      data.reps = data.reps.filter(r => r.id !== 'REP-821' && r.name !== 'Bb');
    }
    if (Array.isArray(data.customers)) {
      data.customers = data.customers.filter(c => c.id !== 'CUST-01' && c.name !== 'Ahha');
    }
    return data;
  };

  // Synchronously commit database to browser persistent storage
  const saveToLocalStorage = (customState = {}) => {
    try {
      const dataToSave = {
        shops,
        reps,
        customers,
        categories,
        products,
        orders,
        updatedAt: Date.now(),
        ...customState
      };
      sanitizeData(dataToSave);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  };

  // Load Initial Data: Prioritize persistent device storage, then sync with server
  const loadData = async () => {
    setIsLoading(true);

    // Clean out legacy cache keys
    try {
      localStorage.removeItem('lumirep_cache');
    } catch (e) {}

    // 1. Read from persistent local storage first (instant 0ms response, immune to server restart)
    let localStore = null;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        localStore = sanitizeData(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('LocalStorage read error', e);
    }

    if (localStore) {
      setShops(localStore.shops || []);
      setReps(localStore.reps || []);
      setCustomers(localStore.customers || []);
      setCategories(localStore.categories || []);
      setProducts(localStore.products || []);
      setOrders(localStore.orders || []);
      setIsLoading(false);
    }

    // 2. Fetch from backend and sync
    try {
      let serverData = await api.getAllData();
      if (serverData) {
        serverData = sanitizeData(serverData);

        const localHasData = localStore && (
          (localStore.shops && localStore.shops.length > 0) ||
          (localStore.products && localStore.products.length > 0) ||
          (localStore.customers && localStore.customers.length > 0) ||
          (localStore.reps && localStore.reps.length > 0) ||
          (localStore.orders && localStore.orders.length > 0)
        );

        const serverIsEmpty = (!serverData.shops || serverData.shops.length === 0) &&
                              (!serverData.products || serverData.products.length === 0) &&
                              (!serverData.customers || serverData.customers.length === 0);

        if (localHasData && serverIsEmpty) {
          // Render free instance rebooted and lost disk data! Push local state to server:
          await api.restoreBackup({
            shops: localStore.shops || [],
            reps: localStore.reps || [],
            customers: localStore.customers || [],
            categories: localStore.categories || [],
            products: localStore.products || [],
            orders: localStore.orders || []
          });
        } else if (!localStore) {
          // New device: initialize state and local storage with server data
          setShops(serverData.shops || []);
          setReps(serverData.reps || []);
          setCustomers(serverData.customers || []);
          setCategories(serverData.categories || []);
          setProducts(serverData.products || []);
          setOrders(serverData.orders || []);
          saveToLocalStorage({
            shops: serverData.shops || [],
            reps: serverData.reps || [],
            customers: serverData.customers || [],
            categories: serverData.categories || [],
            products: serverData.products || [],
            orders: serverData.orders || []
          });
        }
      }
    } catch (err) {
      console.warn('Backend fetch failed, using local persistent data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Helper to check if an entity belongs to activeMainShop
  const isShopOwner = (itemShopId) => {
    if (!activeMainShop) return false;
    if (itemShopId === activeMainShop.id) return true;
    // Legacy support: if entity has no shopId, only associate with the very first shop
    if (!itemShopId && shops.length > 0 && activeMainShop.id === shops[0].id) return true;
    return false;
  };

  // Scoped Data for Active Main Shop (Complete Multi-Tenant Isolation)
  const currentShopProducts = React.useMemo(() => {
    if (!activeMainShop) return [];
    return products.filter(p => isShopOwner(p.shopId));
  }, [products, activeMainShop, shops]);

  const currentShopReps = React.useMemo(() => {
    if (!activeMainShop) return [];
    return reps.filter(r => isShopOwner(r.shopId));
  }, [reps, activeMainShop, shops]);

  const currentShopCustomers = React.useMemo(() => {
    if (!activeMainShop) return [];
    return customers.filter(c => isShopOwner(c.shopId));
  }, [customers, activeMainShop, shops]);

  const currentShopOrders = React.useMemo(() => {
    if (!activeMainShop) return [];
    return orders.filter(o => isShopOwner(o.mainShopId));
  }, [orders, activeMainShop, shops]);

  // Compute Unread Notification Count (Cheques & Cash due soon + low stock items for active shop)
  const unreadNotificationsCount = React.useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const paymentsDueCount = currentShopOrders.filter(o => {
      if (o.isInstantPay || o.paymentMethod === 'Instant Pay') return false;
      const dueDateStr = o.paymentDueDate || (o.paymentMethod === 'Cheque' ? o.chequeDetails?.chequeDate : null);
      if (!dueDateStr) return false;
      const dueDate = new Date(dueDateStr);
      dueDate.setHours(0, 0, 0, 0);
      const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
      return diffDays <= 3;
    }).length;

    const lowStockCount = currentShopProducts.filter(p => p.stock <= (p.lowStockThreshold || 10)).length;

    return paymentsDueCount + lowStockCount;
  }, [currentShopOrders, currentShopProducts]);

  // Screen Title & Subtitle
  const getScreenDetails = () => {
    const shopName = activeMainShop?.name || 'Inventory Catalog';
    switch (currentScreen) {
      case 'mainShops':
        return { title: 'Select Importer Shop', subtitle: 'Step 1: Choose distribution center' };
      case 'reps':
        return { title: 'Delivery Reps', subtitle: activeMainShop ? `${activeMainShop.name} • Step 2: Reps` : 'Step 2: Who is out for delivery today?' };
      case 'customers':
        return { title: 'Customer Retail Outlets', subtitle: activeMainShop ? `${activeMainShop.name} • Step 3: Customers` : 'Step 3: Select destination shop' };
      case 'dashboard':
        return { title: shopName, subtitle: activeCustomer?.name || 'Create Orders' };
      case 'checkout':
        return { title: 'Order Checkout', subtitle: 'Confirm batch & payment' };
      case 'orders':
        return { title: 'Order History & Invoices', subtitle: activeMainShop ? `${activeMainShop.name} • Orders` : 'Delivery fulfillment & bills' };
      case 'products':
        return { title: 'Product Catalog Management', subtitle: activeMainShop ? `${activeMainShop.name} • SKU & Pricing` : 'SKU, pricing, excel export' };
      case 'reports':
        return { title: 'Analytics & Reports', subtitle: activeMainShop ? `${activeMainShop.name} • Performance` : 'Stock valuation & profits' };
      case 'settings':
        return { title: 'System Settings', subtitle: 'Reps, shops, and backups' };
      case 'shopDetails':
        return { title: 'Active Session Route', subtitle: 'Current distribution path' };
      case 'admin':
        return { title: 'Executive Control Hub', subtitle: 'Global System Management' };
      default:
        return { title: activeMainShop?.name || 'LumiRep Pro', subtitle: 'Distribution System' };
    }
  };

  const { title, subtitle } = getScreenDetails();

  // Navigation Back Handlers
  const handleBack = () => {
    if (currentScreen === 'admin') {
      setCurrentScreen('mainShops');
    }
    else if (currentScreen === 'reps') {
      setActiveMainShop(null);
      setCurrentScreen('mainShops');
    }
    else if (currentScreen === 'customers') setCurrentScreen('reps');
    else if (currentScreen === 'dashboard') setCurrentScreen('customers');
    else if (currentScreen === 'checkout') setCurrentScreen('dashboard');
    else if (['orders', 'products', 'reports', 'settings', 'shopDetails', 'refManage', 'sales'].includes(currentScreen)) {
      if (activeCustomer) setCurrentScreen('dashboard');
      else if (activeMainShop) setCurrentScreen('reps');
      else setCurrentScreen('mainShops');
    }
    else setCurrentScreen('dashboard');
  };

  // Step 1: Select Main Shop -> Navigate to Step 2 (Reps)
  const handleSelectMainShop = (shop) => {
    setActiveMainShop(shop);
    setActiveRep(null);
    setActiveCustomer(null);
    setSelectedItems({});
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
      const newOrders = [savedOrder, ...orders];
      setOrders(newOrders);

      // Deduct stock locally
      const updatedProducts = products.map(p => {
        const item = orderPayload.items?.find(i => i.productId === p.id);
        if (item) {
          return { ...p, stock: Math.max(0, p.stock - (Number(item.quantity) || 0)) };
        }
        return p;
      });
      setProducts(updatedProducts);
      saveToLocalStorage({ orders: newOrders, products: updatedProducts });

      setSelectedItems({});
      setCurrentScreen('orders');
    } catch (err) {
      console.error('Failed to submit order:', err);
    }
  };

  // Update order status (Processing / Delivered)
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    const updated = orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
    setOrders(updated);
    saveToLocalStorage({ orders: updated });
    try {
      await api.updateOrderStatus(orderId, newStatus);
    } catch (err) {
      console.error('Failed to update order status:', err);
    }
  };

  // Add / Delete Entities (Synced with localStorage and backend)
  const handleAddShop = async (shopData) => {
    const newShop = {
      id: shopData.id || 'SHOP-' + Date.now().toString().slice(-4),
      name: shopData.name,
      image: shopData.image || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&auto=format&fit=crop&q=60',
      createdAt: new Date().toISOString()
    };
    const updated = [newShop, ...shops];
    setShops(updated);
    saveToLocalStorage({ shops: updated });
    try {
      const saved = await api.addShop(shopData);
      if (saved && saved.id) {
        const synced = updated.map((s, idx) => idx === 0 ? saved : s);
        setShops(synced);
        saveToLocalStorage({ shops: synced });
      }
    } catch (err) {
      console.warn('Backend sync failed, saved locally', err);
    }
  };

  const handleDeleteShop = async (shopId) => {
    const updated = shops.filter(s => s.id !== shopId);
    setShops(updated);
    const updatedProducts = products.filter(p => p.shopId !== shopId);
    const updatedReps = reps.filter(r => r.shopId !== shopId);
    const updatedCustomers = customers.filter(c => c.shopId !== shopId);
    const updatedOrders = orders.filter(o => o.mainShopId !== shopId);
    setProducts(updatedProducts);
    setReps(updatedReps);
    setCustomers(updatedCustomers);
    setOrders(updatedOrders);
    saveToLocalStorage({ 
      shops: updated, 
      products: updatedProducts, 
      reps: updatedReps, 
      customers: updatedCustomers, 
      orders: updatedOrders 
    });
    if (activeMainShop?.id === shopId) {
      setActiveMainShop(null);
      setActiveRep(null);
      setActiveCustomer(null);
      setSelectedItems({});
      setCurrentScreen('mainShops');
    }
    try {
      await api.deleteShop(shopId);
    } catch (err) {
      console.warn('Backend sync error on delete shop', err);
    }
  };

  const handleAddRep = async (repData) => {
    const shopId = repData.shopId || activeMainShop?.id || '';
    const newRep = {
      id: repData.id || 'REP-' + Date.now().toString().slice(-4),
      name: repData.name,
      phone: repData.phone || '',
      shopId,
      image: repData.image || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=60',
      createdAt: new Date().toISOString()
    };
    const updated = [newRep, ...reps];
    setReps(updated);
    saveToLocalStorage({ reps: updated });
    try {
      const saved = await api.addRep({ ...repData, shopId });
      if (saved && saved.id) {
        const synced = updated.map((r, idx) => idx === 0 ? saved : r);
        setReps(synced);
        saveToLocalStorage({ reps: synced });
      }
    } catch (err) {
      console.warn('Backend sync error on add rep', err);
    }
  };

  const handleDeleteRep = async (repId) => {
    const updated = reps.filter(r => r.id !== repId);
    setReps(updated);
    saveToLocalStorage({ reps: updated });
    if (activeRep?.id === repId) {
      setActiveRep(updated[0] || null);
    }
    try {
      await api.deleteRep(repId);
    } catch (err) {
      console.warn('Backend sync error on delete rep', err);
    }
  };

  const handleAddCustomer = async (custData) => {
    const shopId = custData.shopId || activeMainShop?.id || '';
    const newCust = {
      id: custData.id || 'CUST-' + Date.now().toString().slice(-4),
      name: custData.name,
      address: custData.address || '',
      ownerName: custData.ownerName || '',
      phone: custData.phone || '',
      shopId,
      image: custData.image || 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&auto=format&fit=crop&q=60',
      createdAt: new Date().toISOString()
    };
    const updated = [newCust, ...customers];
    setCustomers(updated);
    saveToLocalStorage({ customers: updated });
    try {
      const saved = await api.addCustomer({ ...custData, shopId });
      if (saved && saved.id) {
        const synced = updated.map((c, idx) => idx === 0 ? saved : c);
        setCustomers(synced);
        saveToLocalStorage({ customers: synced });
      }
    } catch (err) {
      console.warn('Backend sync error on add customer', err);
    }
  };

  const handleDeleteCustomer = async (custId) => {
    const updated = customers.filter(c => c.id !== custId);
    setCustomers(updated);
    saveToLocalStorage({ customers: updated });
    if (activeCustomer?.id === custId) {
      setActiveCustomer(updated[0] || null);
    }
    try {
      await api.deleteCustomer(custId);
    } catch (err) {
      console.warn('Backend sync error on delete customer', err);
    }
  };

  // Admin Management Handlers
  const handleUpdateShop = async (shopId, updatedData) => {
    const updated = shops.map(s => s.id === shopId ? { ...s, ...updatedData } : s);
    setShops(updated);
    saveToLocalStorage({ shops: updated });
    try {
      await api.updateShop(shopId, updatedData);
    } catch (err) {
      console.warn('Backend sync error on update shop', err);
    }
  };

  const handleUpdateRep = async (repId, updatedData) => {
    const updated = reps.map(r => r.id === repId ? { ...r, ...updatedData } : r);
    setReps(updated);
    saveToLocalStorage({ reps: updated });
    try {
      await api.updateRep(repId, updatedData);
    } catch (err) {
      console.warn('Backend sync error on update rep', err);
    }
  };

  const handleUpdateCustomer = async (custId, updatedData) => {
    const updated = customers.map(c => c.id === custId ? { ...c, ...updatedData } : c);
    setCustomers(updated);
    saveToLocalStorage({ customers: updated });
    try {
      await api.updateCustomer(custId, updatedData);
    } catch (err) {
      console.warn('Backend sync error on update customer', err);
    }
  };

  // Open & Exit Admin Portal
  const handleOpenAdmin = () => {
    if (isAdminAuthenticated) {
      setCurrentScreen('admin');
    } else {
      setIsAdminLoginOpen(true);
    }
  };

  const handleExitAdmin = () => {
    setIsAdminAuthenticated(false);
    setActiveMainShop(null);
    setActiveRep(null);
    setActiveCustomer(null);
    setCurrentScreen('mainShops');
  };

  // Products & Categories
  const handleAddProduct = async (productData) => {
    const shopId = productData.shopId || activeMainShop?.id || '';
    const newProduct = {
      id: 'PRD-' + Date.now().toString().slice(-5),
      ...productData,
      shopId,
      costPrice: Number(productData.costPrice) || 0,
      salePrice: Number(productData.salePrice) || 0,
      discount: 0,
      stock: Number(productData.stock) || 0,
      lowStockThreshold: Number(productData.lowStockThreshold) || 10,
      batchId: productData.batchId || 'BATCH-' + Date.now().toString().slice(-4),
      image: productData.image || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&auto=format&fit=crop&q=60',
      expiryDate: productData.expiryDate || '',
      createdAt: new Date().toISOString()
    };
    const updated = [newProduct, ...products];
    setProducts(updated);
    saveToLocalStorage({ products: updated });
    try {
      const saved = await api.addProduct({ ...productData, shopId });
      if (saved && saved.id) {
        const synced = updated.map((p, idx) => idx === 0 ? saved : p);
        setProducts(synced);
        saveToLocalStorage({ products: synced });
      }
    } catch (err) {
      console.warn('Backend sync error on add product', err);
    }
  };

  const handleUpdateProduct = async (productId, updatedData) => {
    const updated = products.map(p => p.id === productId ? { ...p, ...updatedData } : p);
    setProducts(updated);
    saveToLocalStorage({ products: updated });
    try {
      await api.updateProduct(productId, updatedData);
    } catch (err) {
      console.warn('Backend sync error on update product', err);
    }
  };

  const handleDeleteProduct = async (productId) => {
    const updated = products.filter(p => p.id !== productId);
    setProducts(updated);
    saveToLocalStorage({ products: updated });
    try {
      await api.deleteProduct(productId);
    } catch (err) {
      console.warn('Backend sync error on delete product', err);
    }
  };

  const handleBulkDeleteProducts = async (ids) => {
    const updated = products.filter(p => !ids.includes(p.id));
    setProducts(updated);
    saveToLocalStorage({ products: updated });
    try {
      await api.bulkDeleteProducts(ids);
    } catch (err) {
      console.warn('Backend sync error on bulk delete products', err);
    }
  };

  const handleBulkAddProducts = async (newProductsList) => {
    const shopId = activeMainShop?.id || '';
    const productsWithShop = newProductsList.map(p => ({
      ...p,
      shopId: p.shopId || shopId
    }));
    try {
      const res = await api.bulkAddProducts(productsWithShop);
      if (res && res.products) {
        setProducts(res.products);
        if (res.categories) setCategories(res.categories);
        saveToLocalStorage({ products: res.products, categories: res.categories });
        return { success: true, count: res.count };
      }
      throw new Error('Server returned invalid response');
    } catch (err) {
      // Local fallback
      const formatted = productsWithShop.map((p, idx) => ({
        id: 'PRD-' + Date.now().toString().slice(-4) + '-' + idx,
        name: p.name,
        brand: p.brand || 'General',
        shopId: p.shopId || shopId,
        costPrice: Number(p.costPrice) || 0,
        salePrice: Number(p.salePrice) || 0,
        discount: 0,
        stock: Number(p.stock) || 0,
        lowStockThreshold: Number(p.lowStockThreshold) || 10,
        batchId: p.batchId || 'BATCH-' + Date.now().toString().slice(-4),
        image: p.image || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&auto=format&fit=crop&q=60',
        expiryDate: p.expiryDate || '',
        createdAt: new Date().toISOString()
      }));
      const newProds = [...formatted, ...products];
      setProducts(newProds);
      const newCats = [...new Set([...categories, ...newProductsList.map(p => p.brand).filter(Boolean)])];
      setCategories(newCats);
      saveToLocalStorage({ products: newProds, categories: newCats });
      return { success: true, count: formatted.length };
    }
  };

  const handleAddCategory = async (name) => {
    const newCats = categories.includes(name) ? categories : [...categories, name];
    setCategories(newCats);
    saveToLocalStorage({ categories: newCats });
    try {
      const res = await api.addCategory(name);
      if (res.categories) {
        setCategories(res.categories);
        saveToLocalStorage({ categories: res.categories });
      }
    } catch (err) {
      console.warn('Backend sync error on add category', err);
    }
  };

  const handleDeleteCategory = async (name) => {
    const newCats = categories.filter(c => c !== name);
    setCategories(newCats);
    saveToLocalStorage({ categories: newCats });
    try {
      const res = await api.deleteCategory(name);
      if (res.categories) {
        setCategories(res.categories);
        saveToLocalStorage({ categories: res.categories });
      }
    } catch (err) {
      console.warn('Backend sync error on delete category', err);
    }
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
      saveToLocalStorage({
        shops: res.data.shops,
        reps: res.data.reps,
        customers: res.data.customers,
        categories: res.data.categories,
        products: res.data.products,
        orders: res.data.orders
      });
      setCurrentScreen('mainShops');
    }
  };

  // Restore Backup
  const handleRestoreBackup = async (data) => {
    const clean = sanitizeData(data);
    await api.restoreBackup(clean);
    setShops(clean.shops || []);
    setReps(clean.reps || []);
    setCustomers(clean.customers || []);
    setCategories(clean.categories || []);
    setProducts(clean.products || []);
    setOrders(clean.orders || []);
    saveToLocalStorage({
      shops: clean.shops || [],
      reps: clean.reps || [],
      customers: clean.customers || [],
      categories: clean.categories || [],
      products: clean.products || [],
      orders: clean.orders || []
    });
  };

  // Log Out / Reset to Step 1 (Main Shops)
  const handleLogout = () => {
    setActiveMainShop(null);
    setActiveRep(null);
    setActiveCustomer(null);
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
    <div className="min-h-screen bg-slate-200/90 flex items-center justify-center p-0 md:p-4 overflow-x-hidden">
      
      {/* 
        iPhone 17 Pro Frame Container:
        Target resolution: ~402px wide x 874px high on desktop, full width on real mobile.
      */}
      <div className={`w-full transition-all duration-300 ${
        isPhoneFrame 
          ? 'w-full max-w-full md:max-w-[420px] min-h-[100dvh] md:h-[915px] md:rounded-[50px] md:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35)] md:border-[10px] md:border-slate-800'
          : 'max-w-2xl min-h-[100dvh] md:min-h-[90vh] md:rounded-3xl shadow-xl border border-slate-300'
      } bg-[#f8fafc] flex flex-col overflow-x-hidden relative`}>

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
          onLogout={handleLogout}
          onOpenAdmin={handleOpenAdmin}
          activeMainShop={activeMainShop}
          activeRep={activeRep}
          activeCustomer={activeCustomer}
        />

        {/* Main Content View Container */}
        <main className="flex-1 overflow-y-auto no-scrollbar relative bg-[#f8fafc]">
          
          {/* Page 1: Main Importer Shop Selection (Delete is restricted to Admin Portal only) */}
          {currentScreen === 'mainShops' && (
            <MainShopPage
              shops={shops}
              onSelectShop={handleSelectMainShop}
              onAddShop={handleAddShop}
            />
          )}

          {/* Page 2: Delivery Reps Selection (Delete is restricted to Admin Portal only) */}
          {currentScreen === 'reps' && (
            <RepSelectionPage
              reps={currentShopReps}
              onSelectRep={handleSelectRep}
              onAddRep={handleAddRep}
              mainShop={activeMainShop}
            />
          )}

          {/* Page 3: Customer Shop Selection (Delete is restricted to Admin Portal only) */}
          {currentScreen === 'customers' && (
            <CustomerShopPage
              customers={currentShopCustomers}
              onSelectCustomer={handleSelectCustomer}
              onAddCustomer={handleAddCustomer}
              mainShop={activeMainShop}
              rep={activeRep}
            />
          )}

          {/* Page 4 & 6: Dashboard & Inventory & Ordering */}
          {currentScreen === 'dashboard' && (
            <DashboardPage
              products={currentShopProducts}
              categories={categories}
              selectedItems={selectedItems}
              onToggleSelectItem={handleToggleSelectItem}
              onUpdateQuantity={handleUpdateQuantity}
              onUpdateItemDiscount={handleUpdateItemDiscount}
              onCreateOrder={handleGoToCheckout}
              onClearSelected={() => setSelectedItems({})}
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
              products={currentShopProducts}
              orders={currentShopOrders}
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
              orders={currentShopOrders}
              onUpdateStatus={handleUpdateOrderStatus}
              searchTerm={searchTerm}
            />
          )}

          {/* Page 9: Product Manage, Categories, Excel Export */}
          {currentScreen === 'products' && (
            <ProductManagePage
              products={currentShopProducts}
              categories={categories}
              onAddProduct={handleAddProduct}
              onUpdateProduct={handleUpdateProduct}
              onDeleteProduct={handleDeleteProduct}
              onBulkDeleteProducts={handleBulkDeleteProducts}
              onBulkAddProducts={handleBulkAddProducts}
              onAddCategory={handleAddCategory}
              onDeleteCategory={handleDeleteCategory}
            />
          )}

          {/* Page 10: Reports & Visual Charts */}
          {currentScreen === 'reports' && (
            <ReportsPage
              products={currentShopProducts}
              orders={currentShopOrders}
              customers={currentShopCustomers}
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
              reps={currentShopReps}
              onSelectRep={handleSelectRep}
              onAddRep={handleAddRep}
              onDeleteRep={handleDeleteRep}
              mainShop={activeMainShop}
            />
          )}

          {/* Direct view for Sales Overview */}
          {currentScreen === 'sales' && (
            <ReportsPage
              products={currentShopProducts}
              orders={currentShopOrders}
              customers={currentShopCustomers}
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

          {/* Master Admin Portal Screen */}
          {currentScreen === 'admin' && (
            <AdminPortalPage
              shops={shops}
              reps={reps}
              customers={customers}
              orders={orders}
              products={products}
              onUpdateShop={handleUpdateShop}
              onDeleteShop={handleDeleteShop}
              onAddShop={handleAddShop}
              onUpdateRep={handleUpdateRep}
              onDeleteRep={handleDeleteRep}
              onAddRep={handleAddRep}
              onUpdateCustomer={handleUpdateCustomer}
              onDeleteCustomer={handleDeleteCustomer}
              onAddCustomer={handleAddCustomer}
              onExitAdmin={handleExitAdmin}
            />
          )}

        </main>

        {/* iPhone Home Indicator bar at bottom */}
        {isPhoneFrame && (
          <div className="hidden md:flex items-center justify-center py-1.5 bg-white border-t border-slate-100 z-40">
            <div className="w-32 h-1 bg-slate-300 rounded-full" />
          </div>
        )}

        {/* Modern Frosted Glass 5-Icon Bottom Tab Bar (hidden on mainShops, during Checkout, or when items are selected on Dashboard) */}
        {currentScreen !== 'mainShops' && currentScreen !== 'checkout' && !(currentScreen === 'dashboard' && Object.keys(selectedItems).length > 0) && (
          <BottomNav
            currentScreen={currentScreen}
            onNavigate={(screenId) => {
              setCurrentScreen(screenId);
              setSearchTerm('');
            }}
            activeMainShop={activeMainShop}
            activeRep={activeRep}
            activeCustomer={activeCustomer}
            unreadCount={unreadNotificationsCount}
          />
        )}

        {/* Side Navigation Drawer (the 3 lines hamburger menu - hidden on initial mainShops screen) */}
        {currentScreen !== 'mainShops' && (
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
        )}

        {/* Notifications Modal */}
        <NotificationsModal
          isOpen={isNotificationsOpen}
          onClose={() => setIsNotificationsOpen(false)}
          orders={currentShopOrders}
          products={currentShopProducts}
          onSelectOrder={handleSelectOrderFromNotifications}
        />

        {/* Master Admin Authentication Modal */}
        <AdminLoginModal
          isOpen={isAdminLoginOpen}
          onClose={() => setIsAdminLoginOpen(false)}
          onLoginSuccess={() => {
            setIsAdminAuthenticated(true);
            setCurrentScreen('admin');
          }}
        />

      </div>
    </div>
  );
}
