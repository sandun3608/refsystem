import React from 'react';
import { Bell, ArrowLeft, Search, Smartphone, Monitor, LogOut } from 'lucide-react';

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
  onToggleFrame,
  onLogout,
  activeMainShop,
  activeRep,
  activeCustomer
}) {
  const showSearch = currentScreen === 'dashboard' || currentScreen === 'products' || currentScreen === 'orders';
  const showBack = !['mainShops', 'dashboard'].includes(currentScreen);
  const isSessionActive = Boolean(activeCustomer && (currentScreen === 'dashboard' || currentScreen === 'checkout'));

  return (
    <div className="sticky top-0 z-30 px-2 pt-1 pb-1 bg-gradient-to-b from-slate-100/90 to-transparent">
      <header className="rounded-2xl md:rounded-3xl bg-white/95 backdrop-blur-2xl border border-slate-200/90 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] overflow-hidden transition-all">
        {/* Top bar with curved aesthetic */}
        <div className="flex items-center justify-between px-3 py-2">
          
          {/* LEFT: Nav bar icon (3-lines menu) + Back button + Title + Small Avatar Circles on Home */}
          <div className="flex items-center space-x-2 min-w-0">
            
            {/* Modern 3-Lines Navigation Bar Menu Button on the LEFT */}
            <button
              onClick={onToggleSidebar}
              className="w-8 h-8 flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-sm shadow-blue-500/25 transition-all duration-200 active:scale-95 group focus:outline-none flex-shrink-0"
              title="Open Navigation Menu"
            >
              <div className="flex flex-col justify-center items-center gap-1 w-3.5">
                <span className="w-3.5 h-[2px] bg-white rounded-full transition-transform"></span>
                <span className="w-2.5 h-[2px] bg-white/90 rounded-full transition-all group-hover:w-3.5"></span>
                <span className="w-3 h-[2px] bg-white/90 rounded-full transition-all group-hover:w-3.5"></span>
              </div>
            </button>

            {/* Back button if in subpage */}
            {showBack && (
              <button
                onClick={onBack}
                className="w-8 h-8 flex items-center justify-center text-slate-700 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 rounded-xl transition-all active:scale-95 border border-slate-200/60 shadow-2xs flex-shrink-0"
                title="Go Back"
              >
                <ArrowLeft className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            )}

            {/* Title & Small Mini Circles on Home Page */}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="text-xs font-black text-slate-900 tracking-tight truncate">
                  {title}
                </h1>

                {/* 3 Small Mini Circles on Home Page (Shop, Rep, Customer) */}
                {isSessionActive && (
                  <div className="flex items-center -space-x-1.5 flex-shrink-0">
                    <img
                      src={activeMainShop?.image}
                      alt={activeMainShop?.name}
                      title={`Shop: ${activeMainShop?.name}`}
                      className="w-4 h-4 rounded-full object-cover border border-white ring-1 ring-blue-500"
                    />
                    <img
                      src={activeRep?.image}
                      alt={activeRep?.name}
                      title={`Rep: ${activeRep?.name}`}
                      className="w-4 h-4 rounded-full object-cover border border-white ring-1 ring-emerald-500"
                    />
                    <img
                      src={activeCustomer?.image || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=100&auto=format&fit=crop&q=60'}
                      alt={activeCustomer?.name}
                      title={`Customer: ${activeCustomer?.name}`}
                      className="w-4 h-4 rounded-full object-cover border border-white ring-1 ring-purple-500"
                    />
                  </div>
                )}
              </div>

              {subtitle && (
                <p className="text-[9px] font-semibold text-slate-400 truncate max-w-[150px] tracking-tight">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* RIGHT: Phone Toggle + Notification Icon + Log Out Icon on the right */}
          <div className="flex items-center space-x-1.5 flex-shrink-0">
            
            {/* Toggle Phone frame preview (for desktop view) */}
            <button
              onClick={onToggleFrame}
              className="hidden md:flex items-center gap-1 px-2 py-1 text-[10px] font-bold text-slate-600 hover:text-blue-600 bg-slate-100/80 hover:bg-blue-50 border border-slate-200/60 rounded-lg transition-all"
              title={isPhoneFrame ? "Switch to Fullscreen" : "Switch to iPhone 17 Pro View"}
            >
              {isPhoneFrame ? (
                <>
                  <Monitor className="w-3 h-3 text-slate-500" />
                  <span>Full</span>
                </>
              ) : (
                <>
                  <Smartphone className="w-3 h-3 text-blue-600" />
                  <span className="text-blue-600">17 Pro</span>
                </>
              )}
            </button>

            {/* Notifications button */}
            <button
              onClick={onOpenNotifications}
              className="relative w-8 h-8 flex items-center justify-center text-slate-700 hover:text-blue-600 bg-slate-100/90 hover:bg-blue-50 rounded-xl transition-all active:scale-95 border border-slate-200/60 shadow-2xs"
              title="Notifications"
            >
              <Bell className="w-4 h-4 stroke-[2.2]" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[8px] font-extrabold text-white shadow-xs ring-2 ring-white animate-bounce">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {/* LOG OUT ICON BUTTON - Placed right next to the Notification button */}
            {onLogout && isSessionActive && (
              <button
                onClick={() => {
                  if (confirm('Log out of this customer shop and return to first page?')) {
                    onLogout();
                  }
                }}
                className="w-8 h-8 flex items-center justify-center text-red-500 hover:text-white bg-red-50 hover:bg-red-600 rounded-xl transition-all active:scale-95 border border-red-200/70 shadow-2xs"
                title="Log Out to First Page"
              >
                <LogOut className="w-3.5 h-3.5 stroke-[2.2]" />
              </button>
            )}

          </div>
        </div>

        {/* Dynamic Search Bar if enabled inside curved navbar */}
        {showSearch && (
          <div className="px-3 pb-2 pt-0">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
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
                className="w-full pl-8 pr-7 py-1.5 text-xs bg-slate-100/80 hover:bg-slate-100 focus:bg-white text-slate-900 placeholder:text-slate-400 rounded-xl border border-slate-200/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              />
              {searchTerm && (
                <button 
                  onClick={() => onSearchChange('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center text-[9px]"
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
