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

  if (!isOpen || currentScreen === 'mainShops') return null;

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
            <div className="min-w-0 max-w-[190px]">
              <h2 className="text-base font-extrabold tracking-tight truncate">{activeMainShop?.name || 'Distribution Hub'}</h2>
              <p className="text-[11px] text-blue-100/90 font-medium truncate">{activeMainShop ? 'Active Importer Shop' : 'Multi-Shop Distribution'}</p>
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

        {/* Bottom Profile / Identity Section & Switch Shop */}
        {activeMainShop && (
          <div className="p-2.5 border-t border-slate-100 bg-slate-50/70">
            {activeRep && activeCustomer && (
              <>
                <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 px-0.5">
                  Active Session
                </p>
                
                <div className="grid grid-cols-3 gap-1.5 mb-2">
                  {/* 1. Main Shop Small Circle */}
                  <div className="flex flex-col items-center bg-white p-1.5 rounded-xl border border-slate-200/70 shadow-2xs text-center min-w-0">
                    <img
                      src={activeMainShop?.image}
                      alt={activeMainShop?.name}
                      className="w-6 h-6 rounded-full object-cover border border-blue-500 mb-1 shadow-2xs"
                    />
                    <span className="text-[8px] font-bold text-blue-600 uppercase block leading-none">Shop</span>
                    <span className="text-[9px] font-bold text-slate-800 truncate w-full block mt-0.5">{activeMainShop?.name?.split(' ')[0]}</span>
                  </div>

                  {/* 2. Rep Small Circle */}
                  <div className="flex flex-col items-center bg-white p-1.5 rounded-xl border border-slate-200/70 shadow-2xs text-center min-w-0">
                    <img
                      src={activeRep?.image}
                      alt={activeRep?.name}
                      className="w-6 h-6 rounded-full object-cover border border-emerald-500 mb-1 shadow-2xs"
                    />
                    <span className="text-[8px] font-bold text-emerald-600 uppercase block leading-none">Rep</span>
                    <span className="text-[9px] font-bold text-slate-800 truncate w-full block mt-0.5">{activeRep?.name?.split(' ')[0]}</span>
                  </div>

                  {/* 3. Customer Small Circle */}
                  <div className="flex flex-col items-center bg-white p-1.5 rounded-xl border border-slate-200/70 shadow-2xs text-center min-w-0">
                    {activeCustomer?.image ? (
                      <img
                        src={activeCustomer?.image}
                        alt={activeCustomer?.name}
                        className="w-6 h-6 rounded-full object-cover border border-purple-500 mb-1 shadow-2xs"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-[8px] mb-1">
                        {activeCustomer?.name?.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    <span className="text-[8px] font-bold text-purple-600 uppercase block leading-none">Client</span>
                    <span className="text-[9px] font-bold text-slate-800 truncate w-full block mt-0.5">{activeCustomer?.name?.split(' ')[0]}</span>
                  </div>
                </div>
              </>
            )}

            {/* Switch Importer Shop button */}
            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="w-full flex items-center justify-center space-x-1.5 py-2 px-2 text-[11px] font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-all border border-red-200/70 active:scale-98 shadow-2xs"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Switch Importer Shop</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
