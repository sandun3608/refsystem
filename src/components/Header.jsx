import React from 'react';
import { Bell, ArrowLeft, Search, Smartphone, Monitor } from 'lucide-react';

export default function Header({ 
  currentScreen, 
  title, 
  subtitle, 
  onBack, 
  onToggleSidebar, 
  onOpenNotifications, 
  unreadNotificationsCount = 0,
  searchTerm, 
  onSearchChange,
  isPhoneFrame,
  onToggleFrame
}) {
  const showSearch = currentScreen === 'dashboard' || currentScreen === 'products' || currentScreen === 'orders';
  const showBack = !['mainShops', 'dashboard'].includes(currentScreen);

  return (
    <div className="sticky top-2 z-30 px-2.5 pt-1 pb-1">
      <header className="rounded-2xl md:rounded-3xl bg-white/90 backdrop-blur-xl border border-slate-200/80 shadow-[0_8px_25px_-5px_rgba(0,0,0,0.06)] overflow-hidden transition-all">
        {/* Top bar with curved aesthetic */}
        <div className="flex items-center justify-between px-3.5 py-2.5">
          
          {/* LEFT: Nav bar icon (3-lines menu) + Back button + Title */}
          <div className="flex items-center space-x-2.5 min-w-0">
            
            {/* Modern 3-Lines Navigation Bar Menu Button on the LEFT */}
            <button
              onClick={onToggleSidebar}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-sm shadow-blue-500/25 transition-all duration-200 active:scale-95 group focus:outline-none flex-shrink-0"
              title="Open Navigation Menu"
            >
              <div className="flex flex-col justify-center items-center gap-1 w-4">
                <span className="w-4 h-[2px] bg-white rounded-full transition-transform"></span>
                <span className="w-3 h-[2px] bg-white/90 rounded-full transition-all group-hover:w-4"></span>
                <span className="w-3.5 h-[2px] bg-white/90 rounded-full transition-all group-hover:w-4"></span>
              </div>
            </button>

            {/* Back button if in subpage */}
            {showBack && (
              <button
                onClick={onBack}
                className="w-8 h-8 flex items-center justify-center text-slate-700 hover:text-blue-600 bg-slate-100/90 hover:bg-blue-50 rounded-xl transition-all active:scale-95 border border-slate-200/60 shadow-2xs flex-shrink-0"
                title="Go Back"
              >
                <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
              </button>
            )}

            {/* Title & Subtitle */}
            <div className="min-w-0">
              <h1 className="text-xs font-black text-slate-900 tracking-tight flex items-center gap-1.5 truncate">
                <span className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 ring-4 ring-blue-100 flex-shrink-0 animate-pulse"></span>
                <span className="truncate">{title}</span>
              </h1>
              {subtitle && (
                <p className="text-[10px] font-semibold text-slate-400 truncate max-w-[170px] tracking-tight">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* RIGHT: Phone Preview Toggle + Notification Icon on the RIGHT */}
          <div className="flex items-center space-x-1.5 flex-shrink-0">
            
            {/* Toggle Phone frame preview (for desktop view) */}
            <button
              onClick={onToggleFrame}
              className="hidden md:flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-bold text-slate-600 hover:text-blue-600 bg-slate-100/70 hover:bg-blue-50 border border-slate-200/60 rounded-xl transition-all shadow-2xs"
              title={isPhoneFrame ? "Switch to Fullscreen" : "Switch to iPhone 17 Pro View"}
            >
              {isPhoneFrame ? (
                <>
                  <Monitor className="w-3.5 h-3.5 text-slate-500" />
                  <span>Full</span>
                </>
              ) : (
                <>
                  <Smartphone className="w-3.5 h-3.5 text-blue-600" />
                  <span className="text-blue-600">17 Pro</span>
                </>
              )}
            </button>

            {/* Notifications button on the RIGHT */}
            <button
              onClick={onOpenNotifications}
              className="relative w-9 h-9 flex items-center justify-center text-slate-700 hover:text-blue-600 bg-slate-100/90 hover:bg-blue-50 rounded-xl transition-all active:scale-95 border border-slate-200/60 shadow-2xs"
              title="Notifications"
            >
              <Bell className="w-4 h-4 stroke-[2.2]" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-extrabold text-white shadow-xs ring-2 ring-white animate-bounce">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

          </div>
        </div>

        {/* Dynamic Search Bar if enabled inside curved navbar */}
        {showSearch && (
          <div className="px-3.5 pb-2.5 pt-0">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={
                  currentScreen === 'products'
                    ? 'Search cosmetics, brands, batch ID...'
                    : currentScreen === 'orders'
                    ? 'Search orders, shop name, batch...'
                    : 'Search cosmetics in inventory...'
                }
                className="w-full pl-9 pr-8 py-2 text-xs bg-slate-100/70 hover:bg-slate-100 focus:bg-white text-slate-900 placeholder:text-slate-400 rounded-xl border border-slate-200/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none shadow-2xs transition-all"
              />
              {searchTerm && (
                <button 
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center text-[10px]"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        )}
      </header>
    </div>
  );
}
