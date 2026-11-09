import React from 'react';
import { Store, User, MapPin, Phone, ShieldCheck, ArrowRight, RefreshCw } from 'lucide-react';

export default function ShopDetailsPage({ activeMainShop, activeRep, activeCustomer, onSwitchCustomer, onSwitchRep }) {
  return (
    <div className="pb-28 px-3 pt-2 space-y-4 max-w-md mx-auto">
      
      {/* Title */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-3xl p-4 shadow-lg space-y-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-200">Session Overview</span>
        <h2 className="text-base font-extrabold">Active Distribution Route</h2>
        <p className="text-xs text-blue-100">Details of current importer, rep, and delivery client</p>
      </div>

      {/* 1. Main Importer Shop */}
      <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
            Main Importer Warehouse
          </span>
          <ShieldCheck className="w-4 h-4 text-blue-600" />
        </div>

        <div className="flex items-center space-x-3.5">
          <img
            src={activeMainShop?.image}
            alt={activeMainShop?.name}
            className="w-16 h-16 rounded-2xl object-cover border border-slate-200"
          />
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-slate-400">ID: {activeMainShop?.id}</span>
            <h3 className="text-sm font-bold text-slate-900 truncate">{activeMainShop?.name}</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Primary distribution source</p>
          </div>
        </div>
      </div>

      {/* 2. Delivery Representative */}
      <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
            Assigned Delivery Rep
          </span>
          <button
            onClick={onSwitchRep}
            className="text-[11px] font-bold text-emerald-700 hover:underline flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Switch Rep</span>
          </button>
        </div>

        <div className="flex items-center space-x-3.5">
          <img
            src={activeRep?.image}
            alt={activeRep?.name}
            className="w-16 h-16 rounded-2xl object-cover border border-slate-200"
          />
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-slate-400">ID: {activeRep?.id}</span>
            <h3 className="text-sm font-bold text-slate-900 truncate">{activeRep?.name}</h3>
            {activeRep?.phone && (
              <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                <Phone className="w-3 h-3 text-emerald-600" />
                <span>{activeRep?.phone}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 3. Customer Retail Shop */}
      <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-100">
            Current Customer Destination
          </span>
          <button
            onClick={onSwitchCustomer}
            className="text-[11px] font-bold text-purple-700 hover:underline flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Switch Shop</span>
          </button>
        </div>

        <div className="flex items-center space-x-3.5">
          {activeCustomer?.image ? (
            <img
              src={activeCustomer?.image}
              alt={activeCustomer?.name}
              className="w-16 h-16 rounded-2xl object-cover border border-slate-200"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xl">
              {activeCustomer?.name?.substring(0, 2).toUpperCase()}
            </div>
          )}

          <div className="min-w-0">
            <span className="text-[10px] font-bold text-slate-400">ID: {activeCustomer?.id}</span>
            <h3 className="text-sm font-bold text-slate-900 truncate">{activeCustomer?.name}</h3>
            <p className="text-[11px] text-slate-600 mt-0.5">Owner: <strong>{activeCustomer?.ownerName}</strong></p>
            <p className="text-[10px] text-slate-400 truncate">{activeCustomer?.address}</p>
          </div>
        </div>
      </div>

    </div>
  );
}
