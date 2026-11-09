import React from 'react';
import { Store, Package, ShoppingBag, FolderKanban, BarChart3, Settings } from 'lucide-react';

export default function BottomNav({ 
  currentScreen, 
  onNavigate, 
  activeMainShop, 
  activeRep, 
  activeCustomer,
  unreadCount = 0
}) {
  const tabs = [
    {
      id: activeCustomer ? 'dashboard' : 'mainShops',
      activeMatch: ['mainShops', 'reps', 'customers', 'dashboard'],
      label: 'Home',
      icon: Store,
      badge: null
    },
    {
      id: 'dashboard',
      activeMatch: ['dashboard', 'checkout'],
      label: 'Inventory',
      icon: Package,
      badge: null
    },
    {
      id: 'orders',
      activeMatch: ['orders'],
      label: 'Orders',
      icon: ShoppingBag,
      badge: unreadCount > 0 ? unreadCount : null
    },
    {
      id: 'products',
      activeMatch: ['products'],
      label: 'Products',
      icon: FolderKanban,
      badge: null
    },
    {
      id: 'reports',
      activeMatch: ['reports', 'sales'],
      label: 'Reports',
      icon: BarChart3,
      badge: null
    }
  ];

  return (
    <div className="fixed bottom-2.5 inset-x-2.5 z-40 max-w-md mx-auto pointer-events-none safe-bottom">
      <nav className="pointer-events-auto bg-white/92 backdrop-blur-2xl border border-slate-200/90 shadow-[0_12px_35px_-8px_rgba(0,0,0,0.14)] rounded-2xl md:rounded-3xl px-2 py-1.5 flex items-center justify-around transition-all">
        {tabs.map((tab, idx) => {
          const Icon = tab.icon;
          const isActive = tab.activeMatch.includes(currentScreen);

          return (
            <button
              key={idx}
              onClick={() => onNavigate(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 active:scale-92 ${
                isActive
                  ? 'text-blue-600 font-extrabold'
                  : 'text-slate-400 hover:text-slate-700 font-semibold'
              }`}
            >
              <div className={`relative p-1 rounded-xl transition-colors ${
                isActive ? 'bg-blue-50 text-blue-600 scale-105' : ''
              }`}>
                <Icon className={`w-5 h-5 stroke-[2.2] transition-transform ${
                  isActive ? 'scale-110' : ''
                }`} />

                {tab.badge && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center ring-2 ring-white animate-pulse">
                    {tab.badge}
                  </span>
                )}
              </div>

              <span className={`text-[10px] tracking-tight mt-0.5 ${
                isActive ? 'text-blue-700 font-bold' : 'text-slate-400'
              }`}>
                {tab.label}
              </span>

              {isActive && (
                <span className="w-1 h-1 bg-blue-600 rounded-full mt-0.5 animate-pulse" />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
