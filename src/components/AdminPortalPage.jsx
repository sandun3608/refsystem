import React, { useState, useMemo } from 'react';
import { 
  Shield, 
  LogOut, 
  BarChart3, 
  Store, 
  UserCheck, 
  Building2, 
  Calendar, 
  TrendingUp, 
  Package, 
  ShoppingBag, 
  DollarSign, 
  Trash2, 
  Edit3, 
  Plus, 
  Search, 
  Phone, 
  MapPin, 
  User, 
  ChevronDown, 
  ChevronUp, 
  Filter, 
  Check, 
  X, 
  Layers, 
  Sparkles,
  ArrowRight,
  Camera,
  Image as ImageIcon
} from 'lucide-react';

export default function AdminPortalPage({
  shops,
  reps,
  customers,
  orders,
  products,
  onUpdateShop,
  onDeleteShop,
  onAddShop,
  onUpdateRep,
  onDeleteRep,
  onAddRep,
  onUpdateCustomer,
  onDeleteCustomer,
  onAddCustomer,
  onExitAdmin
}) {
  // Navigation Tabs inside Admin:
  // 'refAnalysis' | 'shopManagement' | 'refManagement' | 'importerShopManagement'
  const [activeTab, setActiveTab] = useState('refAnalysis');

  // Search Terms
  const [searchTerm, setSearchTerm] = useState('');
  const [shopFilter, setShopFilter] = useState('All');

  // Date Filtering State for Analytics
  // 'all' | 'today' | 'yesterday' | '7days' | 'month' | 'custom'
  const [dateFilterPreset, setDateFilterPreset] = useState('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Expandable Reps in Analytics
  const [expandedRepId, setExpandedRepId] = useState(null);

  // Modals for Edit / Add
  const [editingShop, setEditingShop] = useState(null);
  const [isAddShopModal, setIsAddShopModal] = useState(false);

  const [editingRep, setEditingRep] = useState(null);
  const [isAddRepModal, setIsAddRepModal] = useState(false);

  const [editingCustomer, setEditingCustomer] = useState(null);
  const [isAddCustomerModal, setIsAddCustomerModal] = useState(false);

  // Helper to resolve Importer Shop Name
  const getShopName = (shopId) => {
    const s = shops.find(item => item.id === shopId);
    return s ? s.name : 'All / Unassigned';
  };

  // -------------------------------------------------------------
  // DATE FILTERING LOGIC
  // -------------------------------------------------------------
  const filteredOrders = useMemo(() => {
    if (dateFilterPreset === 'all') return orders;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const oneDay = 24 * 60 * 60 * 1000;

    return orders.filter(o => {
      const orderTime = new Date(o.orderDate || o.deliveryDate || Date.now()).getTime();

      if (dateFilterPreset === 'today') {
        return orderTime >= today;
      }
      if (dateFilterPreset === 'yesterday') {
        const yesterday = today - oneDay;
        return orderTime >= yesterday && orderTime < today;
      }
      if (dateFilterPreset === '7days') {
        const sevenDaysAgo = today - (7 * oneDay);
        return orderTime >= sevenDaysAgo;
      }
      if (dateFilterPreset === 'month') {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
        return orderTime >= startOfMonth;
      }
      if (dateFilterPreset === 'custom') {
        if (!customStartDate && !customEndDate) return true;
        const start = customStartDate ? new Date(customStartDate).setHours(0,0,0,0) : 0;
        const end = customEndDate ? new Date(customEndDate).setHours(23,59,59,999) : Infinity;
        return orderTime >= start && orderTime <= end;
      }
      return true;
    });
  }, [orders, dateFilterPreset, customStartDate, customEndDate]);

  // Overall System Stats based on filteredOrders
  const totalFilteredSales = useMemo(() => {
    return filteredOrders.reduce((sum, o) => sum + (Number(o.netTotal) || 0), 0);
  }, [filteredOrders]);

  const totalFilteredOrderCount = filteredOrders.length;

  const totalFilteredItemsCount = useMemo(() => {
    return filteredOrders.reduce((sum, o) => {
      const orderItemsCount = (o.items || []).reduce((iSum, item) => iSum + (Number(item.quantity) || 0), 0);
      return sum + orderItemsCount;
    }, 0);
  }, [filteredOrders]);

  const avgOrderValue = totalFilteredOrderCount > 0 ? Math.round(totalFilteredSales / totalFilteredOrderCount) : 0;

  // -------------------------------------------------------------
  // REF PERFORMANCE ANALYTICS (Hama Ref Kenekma Poduwe)
  // -------------------------------------------------------------
  const refStatsList = useMemo(() => {
    return reps.map(rep => {
      // Find orders belonging to this rep in filteredOrders
      const repOrders = filteredOrders.filter(o => o.repId === rep.id || (o.repName && o.repName.toLowerCase() === rep.name.toLowerCase()));
      
      const sales = repOrders.reduce((sum, o) => sum + (Number(o.netTotal) || 0), 0);
      const orderCount = repOrders.length;
      const itemCount = repOrders.reduce((sum, o) => {
        return sum + (o.items || []).reduce((iSum, item) => iSum + (Number(item.quantity) || 0), 0);
      }, 0);

      const assignedShop = shops.find(s => s.id === rep.shopId);

      return {
        ...rep,
        shopName: assignedShop ? assignedShop.name : (rep.shopId || 'Unassigned'),
        sales,
        orderCount,
        itemCount,
        orders: repOrders
      };
    }).sort((a, b) => b.sales - a.sales);
  }, [reps, filteredOrders, shops]);

  const maxRepSales = Math.max(...refStatsList.map(r => r.sales), 1);

  // -------------------------------------------------------------
  // CUSTOMER SHOP PERFORMANCE ANALYTICS (Shoputh Ehemayi)
  // -------------------------------------------------------------
  const customerStatsList = useMemo(() => {
    return customers.map(cust => {
      const custOrders = filteredOrders.filter(o => o.customerId === cust.id || (o.customerName && o.customerName.toLowerCase() === cust.name.toLowerCase()));
      const totalSpent = custOrders.reduce((sum, o) => sum + (Number(o.netTotal) || 0), 0);
      const orderCount = custOrders.length;
      const itemCount = custOrders.reduce((sum, o) => {
        return sum + (o.items || []).reduce((iSum, item) => iSum + (Number(item.quantity) || 0), 0);
      }, 0);
      const assignedShop = shops.find(s => s.id === cust.shopId);

      return {
        ...cust,
        shopName: assignedShop ? assignedShop.name : (cust.shopId || 'General'),
        totalSpent,
        orderCount,
        itemCount
      };
    }).sort((a, b) => b.totalSpent - a.totalSpent);
  }, [customers, filteredOrders, shops]);

  // -------------------------------------------------------------
  // IMPORTER SHOPS PERFORMANCE ANALYTICS (Importer Shoputh Ehemayi)
  // -------------------------------------------------------------
  const importerStatsList = useMemo(() => {
    return shops.map(shop => {
      const shopOrders = filteredOrders.filter(o => o.mainShopId === shop.id || (o.mainShopName && o.mainShopName.toLowerCase() === shop.name.toLowerCase()));
      const totalRev = shopOrders.reduce((sum, o) => sum + (Number(o.netTotal) || 0), 0);
      const orderCount = shopOrders.length;
      const itemCount = shopOrders.reduce((sum, o) => {
        return sum + (o.items || []).reduce((iSum, item) => iSum + (Number(item.quantity) || 0), 0);
      }, 0);
      const prodsCount = products.filter(p => p.shopId === shop.id).length;
      const repsCount = reps.filter(r => r.shopId === shop.id).length;
      const customersCount = customers.filter(c => c.shopId === shop.id).length;

      return {
        ...shop,
        totalRev,
        orderCount,
        itemCount,
        prodsCount,
        repsCount,
        customersCount
      };
    }).sort((a, b) => b.totalRev - a.totalRev);
  }, [shops, filteredOrders, products, reps, customers]);

  return (
    <div className="min-h-full pb-28 px-3 pt-2 space-y-3.5 max-w-md mx-auto">
      
      {/* ============================================================ */}
      {/* 1. TOP EXECUTIVE ADMIN HEADER */}
      {/* ============================================================ */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-4 shadow-xl border border-slate-700/60 relative overflow-hidden">
        
        {/* Glow decoration */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-400/50 flex items-center justify-center text-amber-400 shadow-inner flex-shrink-0">
              <Shield className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-black tracking-widest uppercase bg-amber-400 text-slate-900 px-2 py-0.5 rounded-full">
                  Admin Master
                </span>
                <span className="text-[10px] text-slate-400">All Importers</span>
              </div>
              <h2 className="text-base font-black tracking-tight text-white truncate mt-0.5">
                Executive Control Hub
              </h2>
            </div>
          </div>

          {/* EXIT ADMIN BUTTON - Returns to 1st page */}
          <button
            onClick={onExitAdmin}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-red-300 hover:text-white bg-red-500/20 hover:bg-red-600 rounded-xl border border-red-500/40 transition-all active:scale-95 shadow-xs flex-shrink-0"
            title="Exit Admin & Return to 1st Page"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="text-[11px] font-extrabold">Exit</span>
          </button>
        </div>

        {/* Quick summary strip */}
        <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-slate-700/60 text-center">
          <div>
            <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-semibold">Importers</span>
            <span className="text-sm font-black text-amber-400">{shops.length}</span>
          </div>
          <div>
            <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-semibold">All Reps</span>
            <span className="text-sm font-black text-emerald-400">{reps.length}</span>
          </div>
          <div>
            <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-semibold">Customers</span>
            <span className="text-sm font-black text-purple-400">{customers.length}</span>
          </div>
          <div>
            <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-semibold">All Orders</span>
            <span className="text-sm font-black text-blue-400">{orders.length}</span>
          </div>
        </div>

      </div>

      {/* ============================================================ */}
      {/* 2. ADMIN NAVIGATION TABS */}
      {/* ============================================================ */}
      <div className="grid grid-cols-4 gap-1.5 bg-slate-200/90 p-1.5 rounded-2xl shadow-inner text-[11px] font-bold">
        
        {/* Tab 1: Ref Analytics */}
        <button
          onClick={() => { setActiveTab('refAnalysis'); setSearchTerm(''); }}
          className={`py-2 px-1 rounded-xl transition-all flex flex-col items-center justify-center gap-0.5 ${
            activeTab === 'refAnalysis'
              ? 'bg-white text-blue-700 shadow-xs font-black ring-1 ring-blue-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span className="text-[10px] truncate leading-tight">Ref Analys</span>
        </button>

        {/* Tab 2: Importer Shop Management */}
        <button
          onClick={() => { setActiveTab('importerShopManagement'); setSearchTerm(''); }}
          className={`py-2 px-1 rounded-xl transition-all flex flex-col items-center justify-center gap-0.5 ${
            activeTab === 'importerShopManagement'
              ? 'bg-white text-blue-700 shadow-xs font-black ring-1 ring-blue-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span className="text-[10px] truncate leading-tight">Importer</span>
        </button>

        {/* Tab 3: Customer Shop Management */}
        <button
          onClick={() => { setActiveTab('shopManagement'); setSearchTerm(''); }}
          className={`py-2 px-1 rounded-xl transition-all flex flex-col items-center justify-center gap-0.5 ${
            activeTab === 'shopManagement'
              ? 'bg-white text-blue-700 shadow-xs font-black ring-1 ring-blue-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Store className="w-4 h-4" />
          <span className="text-[10px] truncate leading-tight">Customer</span>
        </button>

        {/* Tab 4: Ref Management */}
        <button
          onClick={() => { setActiveTab('refManagement'); setSearchTerm(''); }}
          className={`py-2 px-1 rounded-xl transition-all flex flex-col items-center justify-center gap-0.5 ${
            activeTab === 'refManagement'
              ? 'bg-white text-blue-700 shadow-xs font-black ring-1 ring-blue-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span className="text-[10px] truncate leading-tight">Ref Manage</span>
        </button>

      </div>

      {/* ============================================================ */}
      {/* 3. TAB CONTENT VIEWS */}
      {/* ============================================================ */}

      {/* ------------------------------------------------------------ */}
      {/* TAB 1: REF & SYSTEM ANALYTICS VIEW */}
      {/* ------------------------------------------------------------ */}
      {activeTab === 'refAnalysis' && (
        <div className="space-y-4">
          
          {/* Date Range Selector Bar */}
          <div className="p-3 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                <span>Filter By Sales Date</span>
              </div>
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                {filteredOrders.length} Orders in Range
              </span>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar py-0.5">
              {[
                { id: 'all', label: 'All Time' },
                { id: 'today', label: 'Today' },
                { id: 'yesterday', label: 'Yesterday' },
                { id: '7days', label: 'Last 7 Days' },
                { id: 'month', label: 'This Month' },
                { id: 'custom', label: 'Custom Date' }
              ].map(preset => (
                <button
                  key={preset.id}
                  onClick={() => setDateFilterPreset(preset.id)}
                  className={`flex-shrink-0 px-2.5 py-1 text-[11px] font-bold rounded-xl transition-all ${
                    dateFilterPreset === preset.id
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Custom Date Inputs if 'custom' is selected */}
            {dateFilterPreset === 'custom' && (
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 animate-in fade-in duration-150">
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase block mb-0.5">From Date</label>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="w-full text-xs font-bold text-slate-800 p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase block mb-0.5">To Date</label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="w-full text-xs font-bold text-slate-800 p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* KPI Metrics Cards (Sales, Order Gaana, Item Gaana) */}
          <div className="grid grid-cols-3 gap-2">
            
            {/* 1. Total Sales */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-3 rounded-2xl shadow-sm flex flex-col justify-between min-w-0">
              <span className="text-[9px] font-extrabold uppercase tracking-wider text-blue-200">
                Total Sales
              </span>
              <p className="text-sm font-black tracking-tight mt-1 truncate">
                Rs. {totalFilteredSales.toLocaleString()}
              </p>
              <span className="text-[9px] text-blue-200/90 font-medium mt-1">
                Avg: Rs. {avgOrderValue.toLocaleString()}
              </span>
            </div>

            {/* 2. Order Gaana (Total Orders) */}
            <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-3 rounded-2xl shadow-sm flex flex-col justify-between min-w-0">
              <span className="text-[9px] font-extrabold uppercase tracking-wider text-emerald-200">
                Order Gaana
              </span>
              <p className="text-sm font-black tracking-tight mt-1 truncate">
                {totalFilteredOrderCount} Orders
              </p>
              <span className="text-[9px] text-emerald-200/90 font-medium mt-1">
                Fulfillment: 100%
              </span>
            </div>

            {/* 3. Item Gaana (Total Items Delivered) */}
            <div className="bg-gradient-to-br from-purple-600 to-violet-700 text-white p-3 rounded-2xl shadow-sm flex flex-col justify-between min-w-0">
              <span className="text-[9px] font-extrabold uppercase tracking-wider text-purple-200">
                Item Gaana
              </span>
              <p className="text-sm font-black tracking-tight mt-1 truncate">
                {totalFilteredItemsCount} Units
              </p>
              <span className="text-[9px] text-purple-200/90 font-medium mt-1">
                Sold & Invoiced
              </span>
            </div>

          </div>

          {/* Section: Ref Analytics (Hama Ref Kenekma Poduwe) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  Reps Sales & Performance ({refStatsList.length})
                </h3>
              </div>
              <span className="text-[10px] text-slate-400 font-bold">Ranked by Sales</span>
            </div>

            {refStatsList.length === 0 ? (
              <div className="text-center py-8 bg-white rounded-2xl border border-dashed border-slate-300">
                <UserCheck className="w-8 h-8 mx-auto text-slate-300 mb-1.5" />
                <p className="text-xs font-bold text-slate-600">No representatives registered</p>
              </div>
            ) : (
              <div className="space-y-2">
                {refStatsList.map((rep, index) => {
                  const percentOfTop = Math.round((rep.sales / maxRepSales) * 100);
                  const isExpanded = expandedRepId === rep.id;

                  return (
                    <div 
                      key={rep.id}
                      className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden transition-all"
                    >
                      {/* Main Rep Header Row */}
                      <div 
                        onClick={() => setExpandedRepId(isExpanded ? null : rep.id)}
                        className="p-3 cursor-pointer hover:bg-slate-50/70 transition-colors"
                      >
                        <div className="flex items-center justify-between gap-2">
                          
                          {/* Left: Rank, Avatar & Details */}
                          <div className="flex items-center space-x-3 min-w-0">
                            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                              index === 0 ? 'bg-amber-400 text-slate-900 shadow-xs' :
                              index === 1 ? 'bg-slate-300 text-slate-800' :
                              index === 2 ? 'bg-amber-700/60 text-white' : 'bg-slate-100 text-slate-600'
                            }`}>
                              {index + 1}
                            </span>

                            <img
                              src={rep.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60'}
                              alt={rep.name}
                              className="w-10 h-10 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                            />

                            <div className="min-w-0">
                              <h4 className="text-xs font-extrabold text-slate-900 truncate">{rep.name}</h4>
                              <p className="text-[10px] font-semibold text-slate-400 truncate">
                                Shop: <span className="text-blue-600 font-bold">{rep.shopName}</span>
                              </p>
                              {rep.phone && (
                                <p className="text-[9px] text-slate-400 flex items-center gap-1">
                                  <Phone className="w-2.5 h-2.5 text-emerald-600" />
                                  <span>{rep.phone}</span>
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Right: Sales Amount & Order/Item Counts */}
                          <div className="text-right flex-shrink-0">
                            <span className="text-xs font-black text-slate-900 block">
                              Rs. {rep.sales.toLocaleString()}
                            </span>
                            <div className="flex items-center justify-end gap-1.5 text-[9px] font-bold text-slate-500 mt-0.5">
                              <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-100">
                                {rep.orderCount} Orders
                              </span>
                              <span className="text-purple-700 bg-purple-50 px-1.5 py-0.2 rounded border border-purple-100">
                                {rep.itemCount} Items
                              </span>
                            </div>
                          </div>

                        </div>

                        {/* Relative Visual Progress Bar */}
                        <div className="mt-2.5 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-500"
                            style={{ width: `${percentOfTop}%` }}
                          />
                        </div>
                      </div>

                      {/* Expandable Order List for this Rep */}
                      {isExpanded && (
                        <div className="p-3 bg-slate-50/90 border-t border-slate-100 space-y-2 text-xs animate-in slide-in-from-top-1">
                          <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            <span>Recent Orders Delivered ({rep.orders.length})</span>
                            <span>Date & Net Total</span>
                          </div>

                          {rep.orders.length === 0 ? (
                            <p className="text-[11px] text-slate-400 italic py-1">No orders delivered in this date range.</p>
                          ) : (
                            <div className="space-y-1.5 max-h-48 overflow-y-auto no-scrollbar">
                              {rep.orders.map(order => (
                                <div key={order.id} className="p-2 bg-white rounded-xl border border-slate-200/70 flex items-center justify-between shadow-2xs">
                                  <div className="min-w-0 pr-2">
                                    <span className="font-extrabold text-[11px] text-slate-800 block truncate">
                                      {order.customerName || 'Customer Shop'}
                                    </span>
                                    <span className="text-[9px] text-slate-400">
                                      {order.orderDate ? new Date(order.orderDate).toLocaleDateString() : 'N/A'} • {order.items?.length || 0} items
                                    </span>
                                  </div>
                                  <div className="text-right flex-shrink-0">
                                    <span className="font-black text-xs text-blue-700 block">
                                      Rs. {order.netTotal?.toLocaleString()}
                                    </span>
                                    <span className={`text-[8px] font-extrabold px-1.5 py-0.2 rounded ${
                                      order.isInstantPay || order.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                    }`}>
                                      {order.isInstantPay ? 'Instant Paid' : order.paymentMethod}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section: Importer Shop Stats Breakdown (Importer Shoputh Ehemayi) */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center gap-1.5 px-1">
              <Building2 className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                Importer Shops Overview ({importerStatsList.length})
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {importerStatsList.map(shop => (
                <div key={shop.id} className="p-3 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between gap-3">
                  <div className="flex items-center space-x-3 min-w-0">
                    <img
                      src={shop.image || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=100&auto=format&fit=crop&q=60'}
                      alt={shop.name}
                      className="w-10 h-10 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{shop.name}</h4>
                      <p className="text-[10px] text-slate-400">
                        {shop.prodsCount} products • {shop.repsCount} reps • {shop.customersCount} customer shops
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-xs font-black text-slate-900 block">
                      Rs. {shop.totalRev.toLocaleString()}
                    </span>
                    <span className="text-[10px] font-bold text-blue-600">
                      {shop.orderCount} orders • {shop.itemCount} items
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Customer Retail Outlets Performance (Shoputh Ehemayi) */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center gap-1.5 px-1">
              <Store className="w-4 h-4 text-purple-600" />
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                Customer Retail Outlets Ranking ({customerStatsList.length})
              </h3>
            </div>

            <div className="space-y-1.5 max-h-64 overflow-y-auto no-scrollbar">
              {customerStatsList.slice(0, 10).map((cust, idx) => (
                <div key={cust.id} className="p-2.5 bg-white rounded-xl border border-slate-200/70 shadow-2xs flex items-center justify-between">
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <span className="text-[10px] font-black text-slate-400 w-4">{idx + 1}.</span>
                    <div className="min-w-0">
                      <h4 className="text-xs font-extrabold text-slate-800 truncate">{cust.name}</h4>
                      <span className="text-[9px] text-slate-400 truncate block">
                        {cust.ownerName ? `Owner: ${cust.ownerName} • ` : ''}Shop: {cust.shopName}
                      </span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-xs font-black text-purple-700 block">
                      Rs. {cust.totalSpent.toLocaleString()}
                    </span>
                    <span className="text-[9px] font-bold text-slate-400">
                      {cust.orderCount} orders • {cust.itemCount} pcs
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ------------------------------------------------------------ */}
      {/* TAB 2: IMPORTER SHOP MANAGEMENT (Add, Edit, Delete) */}
      {/* ------------------------------------------------------------ */}
      {activeTab === 'importerShopManagement' && (
        <div className="space-y-3">
          
          <div className="flex items-center justify-between px-1">
            <div>
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                Importer Shops ({shops.length})
              </h3>
              <p className="text-[10px] text-slate-400">Edit or delete distribution centers</p>
            </div>
            
            <button
              onClick={() => setIsAddShopModal(true)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Importer</span>
            </button>
          </div>

          {/* List of Importer Shops */}
          <div className="space-y-2.5">
            {shops.map(shop => {
              const shopProdsCount = products.filter(p => p.shopId === shop.id).length;
              const shopRepsCount = reps.filter(r => r.shopId === shop.id).length;
              const shopCustsCount = customers.filter(c => c.shopId === shop.id).length;

              return (
                <div key={shop.id} className="p-3 bg-white rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between gap-3">
                  <div className="flex items-center space-x-3 min-w-0">
                    <img
                      src={shop.image || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=100&auto=format&fit=crop&q=60'}
                      alt={shop.name}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <span className="text-[9px] font-extrabold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-100">
                        {shop.id}
                      </span>
                      <h4 className="text-xs font-extrabold text-slate-900 truncate mt-0.5">{shop.name}</h4>
                      <p className="text-[10px] text-slate-400">
                        {shopProdsCount} products • {shopRepsCount} reps • {shopCustsCount} outlets
                      </p>
                    </div>
                  </div>

                  {/* Edit and Delete Actions */}
                  <div className="flex items-center space-x-1.5 flex-shrink-0">
                    <button
                      onClick={() => setEditingShop(shop)}
                      className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all border border-slate-200"
                      title="Edit Importer Shop"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`ADMIN CONFIRMATION:\nAre you sure you want to delete Importer Shop "${shop.name}"?\nAll its products, reps, and customer data will be deleted!`)) {
                          onDeleteShop(shop.id);
                        }
                      }}
                      className="p-2 text-red-500 hover:text-white hover:bg-red-600 rounded-xl transition-all border border-red-200"
                      title="Delete Importer Shop"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* ------------------------------------------------------------ */}
      {/* TAB 3: CUSTOMER SHOP MANAGEMENT (Add, Edit, Delete) */}
      {/* ------------------------------------------------------------ */}
      {activeTab === 'shopManagement' && (
        <div className="space-y-3">
          
          <div className="flex items-center justify-between px-1">
            <div>
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                Customer Retail Shops ({customers.length})
              </h3>
              <p className="text-[10px] text-slate-400">Edit or delete retail outlets</p>
            </div>
            
            <button
              onClick={() => setIsAddCustomerModal(true)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-xs transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Customer</span>
            </button>
          </div>

          {/* Filter by Importer Shop & Search */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search shop, owner, address..."
                className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl outline-none focus:border-purple-500 font-semibold"
              />
            </div>

            <select
              value={shopFilter}
              onChange={(e) => setShopFilter(e.target.value)}
              className="text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl p-2 outline-none focus:border-purple-500 max-w-[130px]"
            >
              <option value="All">All Importers</option>
              {shops.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* List of Customers */}
          <div className="space-y-2">
            {customers
              .filter(c => {
                const matchShop = shopFilter === 'All' || c.shopId === shopFilter;
                const matchSearch = !searchTerm ||
                  c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  (c.ownerName && c.ownerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                  (c.address && c.address.toLowerCase().includes(searchTerm.toLowerCase()));
                return matchShop && matchSearch;
              })
              .map(cust => (
                <div key={cust.id} className="p-3 bg-white rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between gap-2.5">
                  <div className="flex items-center space-x-3 min-w-0">
                    {cust.image ? (
                      <img src={cust.image} alt={cust.name} className="w-11 h-11 rounded-xl object-cover border border-slate-200 flex-shrink-0" />
                    ) : (
                      <div className="w-11 h-11 rounded-xl bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-xs flex-shrink-0">
                        {cust.name.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[8px] font-extrabold text-purple-700 bg-purple-50 px-1 py-0.2 rounded border border-purple-100">
                          {cust.id}
                        </span>
                        <span className="text-[9px] font-bold text-slate-400 truncate">
                          Shop: {getShopName(cust.shopId)}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 truncate mt-0.5">{cust.name}</h4>
                      <p className="text-[10px] text-slate-400 truncate">
                        {cust.ownerName ? `Owner: ${cust.ownerName} • ` : ''}{cust.phone || cust.address || 'Retail shop'}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-1 flex-shrink-0">
                    <button
                      onClick={() => setEditingCustomer(cust)}
                      className="p-1.5 text-slate-600 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all border border-slate-200"
                      title="Edit Customer Shop"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`ADMIN CONFIRMATION:\nAre you sure you want to delete customer shop "${cust.name}"?`)) {
                          onDeleteCustomer(cust.id);
                        }
                      }}
                      className="p-1.5 text-red-500 hover:text-white hover:bg-red-600 rounded-xl transition-all border border-red-200"
                      title="Delete Customer Shop"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
          </div>

        </div>
      )}

      {/* ------------------------------------------------------------ */}
      {/* TAB 4: REF MANAGEMENT (Add, Edit, Delete) */}
      {/* ------------------------------------------------------------ */}
      {activeTab === 'refManagement' && (
        <div className="space-y-3">
          
          <div className="flex items-center justify-between px-1">
            <div>
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                Delivery Representatives ({reps.length})
              </h3>
              <p className="text-[10px] text-slate-400">Edit or delete sales reps</p>
            </div>
            
            <button
              onClick={() => setIsAddRepModal(true)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Rep</span>
            </button>
          </div>

          {/* Filter by Importer Shop & Search */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search rep name, phone, id..."
                className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl outline-none focus:border-emerald-500 font-semibold"
              />
            </div>

            <select
              value={shopFilter}
              onChange={(e) => setShopFilter(e.target.value)}
              className="text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl p-2 outline-none focus:border-emerald-500 max-w-[130px]"
            >
              <option value="All">All Importers</option>
              {shops.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* List of Reps */}
          <div className="space-y-2">
            {reps
              .filter(r => {
                const matchShop = shopFilter === 'All' || r.shopId === shopFilter;
                const matchSearch = !searchTerm ||
                  r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  (r.phone && r.phone.includes(searchTerm)) ||
                  r.id.toLowerCase().includes(searchTerm.toLowerCase());
                return matchShop && matchSearch;
              })
              .map(rep => (
                <div key={rep.id} className="p-3 bg-white rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between gap-2.5">
                  <div className="flex items-center space-x-3 min-w-0">
                    <img
                      src={rep.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60'}
                      alt={rep.name}
                      className="w-11 h-11 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[8px] font-extrabold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-100">
                          {rep.id}
                        </span>
                        <span className="text-[9px] font-bold text-slate-400 truncate">
                          Shop: {getShopName(rep.shopId)}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 truncate mt-0.5">{rep.name}</h4>
                      <p className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Phone className="w-2.5 h-2.5 text-emerald-600" />
                        <span>{rep.phone || 'No phone'}</span>
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-1 flex-shrink-0">
                    <button
                      onClick={() => setEditingRep(rep)}
                      className="p-1.5 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all border border-slate-200"
                      title="Edit Rep"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`ADMIN CONFIRMATION:\nAre you sure you want to delete delivery rep "${rep.name}"?`)) {
                          onDeleteRep(rep.id);
                        }
                      }}
                      className="p-1.5 text-red-500 hover:text-white hover:bg-red-600 rounded-xl transition-all border border-red-200"
                      title="Delete Rep"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
          </div>

        </div>
      )}

      {/* ============================================================ */}
      {/* 4. MODALS FOR EDITING AND ADDING ENTITIES */}
      {/* ============================================================ */}

      {/* MODAL: EDIT IMPORTER SHOP */}
      {editingShop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-extrabold text-slate-900">Edit Importer Shop</h3>
              <button onClick={() => setEditingShop(null)}><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              onUpdateShop(editingShop.id, editingShop);
              setEditingShop(null);
            }} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">Shop Name</label>
                <input
                  type="text"
                  required
                  value={editingShop.name}
                  onChange={(e) => setEditingShop({ ...editingShop, name: e.target.value })}
                  className="w-full text-xs font-bold p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">Image URL</label>
                <input
                  type="text"
                  value={editingShop.image || ''}
                  onChange={(e) => setEditingShop({ ...editingShop, image: e.target.value })}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button type="button" onClick={() => setEditingShop(null)} className="flex-1 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-xl">Cancel</button>
                <button type="submit" className="flex-1 py-2 text-xs font-black text-white bg-blue-600 rounded-xl">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD IMPORTER SHOP */}
      {isAddShopModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-extrabold text-slate-900">Add New Importer Shop</h3>
              <button onClick={() => setIsAddShopModal(false)}><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const name = e.target.shopName.value.trim();
              if (!name) return;
              onAddShop({
                name,
                image: e.target.shopImage.value.trim() || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&auto=format&fit=crop&q=60'
              });
              setIsAddShopModal(false);
            }} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">Shop Name</label>
                <input
                  name="shopName"
                  type="text"
                  required
                  placeholder="e.g. Chocolate Express Wholesale"
                  className="w-full text-xs font-bold p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">Image URL (Optional)</label>
                <input
                  name="shopImage"
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button type="button" onClick={() => setIsAddShopModal(false)} className="flex-1 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-xl">Cancel</button>
                <button type="submit" className="flex-1 py-2 text-xs font-black text-white bg-blue-600 rounded-xl">Create Shop</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT REP */}
      {editingRep && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-extrabold text-slate-900">Edit Delivery Rep</h3>
              <button onClick={() => setEditingRep(null)}><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              onUpdateRep(editingRep.id, editingRep);
              setEditingRep(null);
            }} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">Rep Full Name</label>
                <input
                  type="text"
                  required
                  value={editingRep.name}
                  onChange={(e) => setEditingRep({ ...editingRep, name: e.target.value })}
                  className="w-full text-xs font-bold p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">Phone Number</label>
                <input
                  type="text"
                  value={editingRep.phone || ''}
                  onChange={(e) => setEditingRep({ ...editingRep, phone: e.target.value })}
                  className="w-full text-xs font-bold p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">Assigned Importer Shop</label>
                <select
                  value={editingRep.shopId || ''}
                  onChange={(e) => setEditingRep({ ...editingRep, shopId: e.target.value })}
                  className="w-full text-xs font-bold p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500"
                >
                  {shops.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">Photo URL</label>
                <input
                  type="text"
                  value={editingRep.image || ''}
                  onChange={(e) => setEditingRep({ ...editingRep, image: e.target.value })}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button type="button" onClick={() => setEditingRep(null)} className="flex-1 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-xl">Cancel</button>
                <button type="submit" className="flex-1 py-2 text-xs font-black text-white bg-emerald-600 rounded-xl">Save Rep</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD REP */}
      {isAddRepModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-extrabold text-slate-900">Add New Delivery Rep</h3>
              <button onClick={() => setIsAddRepModal(false)}><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const name = e.target.repName.value.trim();
              if (!name) return;
              onAddRep({
                name,
                phone: e.target.repPhone.value.trim(),
                shopId: e.target.repShopId.value,
                image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=60'
              });
              setIsAddRepModal(false);
            }} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">Rep Name</label>
                <input
                  name="repName"
                  type="text"
                  required
                  placeholder="e.g. Kasun Silva"
                  className="w-full text-xs font-bold p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">Phone</label>
                <input
                  name="repPhone"
                  type="text"
                  placeholder="077 123 4567"
                  className="w-full text-xs font-bold p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">Assign to Importer Shop</label>
                <select
                  name="repShopId"
                  className="w-full text-xs font-bold p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500"
                >
                  {shops.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex gap-2">
                <button type="button" onClick={() => setIsAddRepModal(false)} className="flex-1 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-xl">Cancel</button>
                <button type="submit" className="flex-1 py-2 text-xs font-black text-white bg-emerald-600 rounded-xl">Create Rep</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT CUSTOMER SHOP */}
      {editingCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-extrabold text-slate-900">Edit Customer Shop</h3>
              <button onClick={() => setEditingCustomer(null)}><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              onUpdateCustomer(editingCustomer.id, editingCustomer);
              setEditingCustomer(null);
            }} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">Outlet / Shop Name</label>
                <input
                  type="text"
                  required
                  value={editingCustomer.name}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, name: e.target.value })}
                  className="w-full text-xs font-bold p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">Owner Name</label>
                <input
                  type="text"
                  value={editingCustomer.ownerName || ''}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, ownerName: e.target.value })}
                  className="w-full text-xs font-bold p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">Phone Number</label>
                <input
                  type="text"
                  value={editingCustomer.phone || ''}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, phone: e.target.value })}
                  className="w-full text-xs font-bold p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">Address / Town</label>
                <input
                  type="text"
                  value={editingCustomer.address || ''}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, address: e.target.value })}
                  className="w-full text-xs font-bold p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">Assigned Importer Shop</label>
                <select
                  value={editingCustomer.shopId || ''}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, shopId: e.target.value })}
                  className="w-full text-xs font-bold p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-purple-500"
                >
                  {shops.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex gap-2">
                <button type="button" onClick={() => setEditingCustomer(null)} className="flex-1 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-xl">Cancel</button>
                <button type="submit" className="flex-1 py-2 text-xs font-black text-white bg-purple-600 rounded-xl">Save Shop</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD CUSTOMER SHOP */}
      {isAddCustomerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-extrabold text-slate-900">Add Customer Retail Shop</h3>
              <button onClick={() => setIsAddCustomerModal(false)}><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const name = e.target.custName.value.trim();
              if (!name) return;
              onAddCustomer({
                name,
                ownerName: e.target.custOwner.value.trim(),
                phone: e.target.custPhone.value.trim(),
                address: e.target.custAddress.value.trim(),
                shopId: e.target.custShopId.value,
                image: ''
              });
              setIsAddCustomerModal(false);
            }} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">Shop Name</label>
                <input
                  name="custName"
                  type="text"
                  required
                  placeholder="e.g. City Pharmacy & Beauty"
                  className="w-full text-xs font-bold p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">Owner Name</label>
                <input
                  name="custOwner"
                  type="text"
                  placeholder="e.g. Nimal Perera"
                  className="w-full text-xs font-bold p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">Phone</label>
                <input
                  name="custPhone"
                  type="text"
                  placeholder="071 987 6543"
                  className="w-full text-xs font-bold p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">Address / City</label>
                <input
                  name="custAddress"
                  type="text"
                  placeholder="e.g. Galle Road, Colombo 03"
                  className="w-full text-xs font-bold p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">Belongs to Importer Shop</label>
                <select
                  name="custShopId"
                  className="w-full text-xs font-bold p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-purple-500"
                >
                  {shops.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex gap-2">
                <button type="button" onClick={() => setIsAddCustomerModal(false)} className="flex-1 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-xl">Cancel</button>
                <button type="submit" className="flex-1 py-2 text-xs font-black text-white bg-purple-600 rounded-xl">Add Customer</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
