import React, { useState, useEffect, useRef } from 'react';
import { Store, Package, ShoppingBag, FolderKanban, BarChart3, ChevronUp, ChevronDown } from 'lucide-react';

export default function BottomNav({ 
  currentScreen, 
  onNavigate, 
  activeMainShop, 
  activeRep, 
  activeCustomer,
  unreadCount = 0
}) {
  const [isOpen, setIsOpen] = useState(false);
  const navRef = useRef(null);

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

  // Auto-hide when user scrolls or moves touch anywhere on the page
  useEffect(() => {
    if (!isOpen) return;

    let startY = 0;
    const handleTouchStart = (e) => {
      startY = e.touches ? e.touches[0].clientY : 0;
    };

    const handleScrollOrMove = (e) => {
      if (e.touches) {
        const currentY = e.touches[0].clientY;
        if (Math.abs(currentY - startY) < 10) return; // ignore slight jitter
      }
      setIsOpen(false);
    };

    window.addEventListener('scroll', handleScrollOrMove, { capture: true, passive: true });
    window.addEventListener('touchstart', handleTouchStart, { capture: true, passive: true });
    window.addEventListener('touchmove', handleScrollOrMove, { capture: true, passive: true });

    return () => {
      window.removeEventListener('scroll', handleScrollOrMove, { capture: true });
      window.removeEventListener('touchstart', handleTouchStart, { capture: true });
      window.removeEventListener('touchmove', handleScrollOrMove, { capture: true });
    };
  }, [isOpen]);

  // Click outside to collapse
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    const timer = setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="fixed bottom-3 inset-x-2.5 z-40 max-w-md mx-auto pointer-events-none safe-bottom flex flex-col items-center">
      
      {isOpen ? (
        <div 
          ref={navRef}
          className="w-full flex flex-col items-center gap-1.5 animate-in slide-in-from-bottom-3 duration-200"
        >
          {/* Cute Round Collapse Button with Down Arrow */}
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="pointer-events-auto w-8 h-8 rounded-full bg-white/95 text-blue-600 hover:text-blue-700 border border-slate-200 shadow-md flex items-center justify-center backdrop-blur-xl active:scale-90 transition-all cursor-pointer hover:bg-blue-50"
            title="Hide navigation menu"
          >
            <ChevronDown className="w-4 h-4 stroke-[2.5]" />
          </button>

          {/* 5-Icon Navigation Bar */}
          <nav className="pointer-events-auto w-full bg-white/95 backdrop-blur-2xl border border-slate-200/90 shadow-[0_12px_35px_-8px_rgba(0,0,0,0.16)] rounded-2xl md:rounded-3xl px-2 py-1.5 flex items-center justify-around transition-all">
            {tabs.map((tab, idx) => {
              const Icon = tab.icon;
              const isActive = tab.activeMatch.includes(currentScreen);

              return (
                <button
                  key={idx}
                  onClick={() => {
                    onNavigate(tab.id);
                    setIsOpen(false);
                  }}
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
      ) : (
        /* Cute Round Floating Arrow Button (lassana chuty raum ithalaya) */
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="pointer-events-auto relative w-11 h-11 rounded-full bg-white/95 hover:bg-blue-50 text-blue-600 border border-slate-200/90 shadow-[0_8px_30px_rgba(0,0,0,0.14)] flex items-center justify-center backdrop-blur-2xl active:scale-90 hover:scale-105 transition-all group cursor-pointer animate-in fade-in zoom-in-90 duration-200"
          title="Open navigation menu"
        >
          <ChevronUp className="w-5 h-5 stroke-[2.5] text-blue-600 group-hover:-translate-y-0.5 transition-transform" />

          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center ring-2 ring-white animate-pulse">
              {unreadCount}
            </span>
          )}
        </button>
      )}

    </div>
  );
}
