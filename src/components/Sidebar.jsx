import React from 'react';
import { 
  X, 
  Package, 
  BarChart3, 
  Settings, 
  UserCheck, 
  TrendingUp, 
  Bell, 
  FolderKanban, 
  ShoppingBag, 
  Store, 
  LogOut,
  ChevronRight
} from 'lucide-react';

export default function Sidebar({
  isOpen,
  onClose,
  currentScreen,
  onNavigate,
  activeMainShop,
  activeRep,
  activeCustomer,
  onLogout,
  unreadCount = 0
}) {
  const menuItems = [
    { id: 'dashboard', label: 'Inventory', icon: Package, badge: null },
    { id: 'reports', label: 'Reports', icon: BarChart3, badge: 'Insights' },
    { id: 'settings', label: 'Settings', icon: Settings, badge: null },
    { id: 'refManage', label: 'Ref Manage', icon: UserCheck, badge: null },
    { id: 'sales', label: 'Sales Overview', icon: TrendingUp, badge: null },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadCount > 0 ? `${unreadCount}` : null },
    { id: 'products', label: 'Product Manage', icon: FolderKanban, badge: 'Manage' },
    { id: 'orders', label: 'Orders', icon: ShoppingBag, badge: null },
    { id: 'shopDetails', label: 'Shop Details', icon: Store, badge: null }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Drawer content */}
      <div className="relative w-full max-w-[320px] bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-300 ease-out border-r border-slate-100">
        
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-xs">
              <span className="text-xl">✨</span>
            </div>
            <div>
              <h2 className="text-base font-extrabold tracking-tight">Distribution Hub</h2>
              <p className="text-[11px] text-blue-100/90 font-medium">Cosmetics Rep System</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Menu List */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1 no-scrollbar">
          <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            System Menu
          </p>

          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 shadow-xs border border-blue-200/60'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-1.5 rounded-lg transition-colors ${
                    isActive ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600'
                  }`}>
                    <Icon className="w-4 h-4 stroke-[2.2]" />
                  </div>
                  <span>{item.label}</span>
                </div>

                <div className="flex items-center space-x-1.5">
                  {item.badge && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      item.id === 'notifications' && unreadCount > 0
                        ? 'bg-red-500 text-white animate-pulse'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                  <ChevronRight className={`w-3.5 h-3.5 transition-transform ${
                    isActive ? 'text-blue-600 translate-x-0.5' : 'text-slate-300'
                  }`} />
                </div>
              </button>
            );
          })}
        </div>

        {/* Bottom Profile / Identity Section (Visible ONLY when on Dashboard / Home Page during an active session) */}
        {['dashboard', 'checkout', 'shopDetails'].includes(currentScreen) && activeMainShop && activeRep && activeCustomer && (
          <div className="p-3.5 border-t border-slate-100 bg-slate-50/70">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2.5 px-1">
              Active Session Context
            </p>
            
            <div className="space-y-2">
              {/* 1. Main Shop Circle */}
              <div className="flex items-center space-x-2.5 bg-white p-2 rounded-xl border border-slate-200/70 shadow-xs">
                <div className="relative">
                  <img
                    src={activeMainShop?.image || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=100&auto=format&fit=crop&q=60'}
                    alt={activeMainShop?.name || 'Shop'}
                    className="w-8 h-8 rounded-full object-cover border-2 border-blue-600 ring-2 ring-blue-100"
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-blue-600 rounded-full border-2 border-white"></span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-blue-600 font-bold uppercase tracking-tight">Main Shop</p>
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {activeMainShop?.name || 'Not Selected'}
                  </p>
                </div>
              </div>

              {/* 2. Rep Circle */}
              <div className="flex items-center space-x-2.5 bg-white p-2 rounded-xl border border-slate-200/70 shadow-xs">
                <div className="relative">
                  <img
                    src={activeRep?.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60'}
                    alt={activeRep?.name || 'Rep'}
                    className="w-8 h-8 rounded-full object-cover border-2 border-emerald-500 ring-2 ring-emerald-100"
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white"></span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-tight">Delivery Rep</p>
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {activeRep?.name || 'Not Selected'}
                  </p>
                </div>
              </div>

              {/* 3. Customer Shop Circle */}
              <div className="flex items-center space-x-2.5 bg-white p-2 rounded-xl border border-slate-200/70 shadow-xs">
                <div className="relative">
                  <img
                    src={activeCustomer?.image || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=100&auto=format&fit=crop&q=60'}
                    alt={activeCustomer?.name || 'Customer'}
                    className="w-8 h-8 rounded-full object-cover border-2 border-purple-500 ring-2 ring-purple-100"
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-purple-500 rounded-full border-2 border-white"></span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-purple-600 font-bold uppercase tracking-tight">Customer Shop</p>
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {activeCustomer?.name || 'Not Selected'}
                  </p>
                </div>
              </div>
            </div>

            {/* Log Out button (returns to Page 1: Main Shop selection) */}
            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="mt-3 w-full flex items-center justify-center space-x-2 px-3 py-2 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100/80 rounded-xl transition-all border border-red-200/60 active:scale-98"
            >
              <LogOut className="w-4 h-4" />
              <span>Switch / Log Out to First Page</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
