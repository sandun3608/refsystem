import React, { useState } from 'react';
import { 
  Settings, 
  UserCheck, 
  Store, 
  Trash2, 
  Database, 
  Download, 
  Upload, 
  RefreshCw, 
  ShieldCheck, 
  Check, 
  Phone, 
  MapPin, 
  Sparkles,
  Server
} from 'lucide-react';

export default function SettingsPage({
  shops,
  reps,
  customers,
  onDeleteShop,
  onDeleteRep,
  onDeleteCustomer,
  onResetDemo,
  onRestoreBackup
}) {
  const [activeTab, setActiveTab] = useState('reps'); // reps, customerShops, mainShops, database
  const [isResetting, setIsResetting] = useState(false);

  const handleBackupDownload = () => {
    window.open('/api/backup', '_blank');
  };

  const handleRestoreFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const parsed = JSON.parse(event.target.result);
          await onRestoreBackup(parsed);
          alert('Database restored successfully!');
        } catch (err) {
          alert('Invalid backup JSON file');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleDemoReset = async () => {
    if (confirm('Load fresh realistic cosmetics demo data? This will replenish test items, reps, and shops.')) {
      setIsResetting(true);
      await onResetDemo();
      setIsResetting(false);
    }
  };

  return (
    <div className="pb-28 px-3 pt-2 space-y-4 max-w-md mx-auto">
      
      {/* Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-4 shadow-lg space-y-1">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-800 text-[10px] font-bold text-blue-400">
            <Settings className="w-3 h-3" />
            <span>System Settings</span>
          </div>
          <span className="text-[10px] text-slate-400">LumiRep v2.0</span>
        </div>
        <h2 className="text-base font-extrabold tracking-tight">Configuration & Entity Management</h2>
        <p className="text-xs text-slate-400">Manage delivery reps, retail shops, importers and system backups</p>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-4 gap-1.5 bg-slate-200/80 p-1 rounded-2xl text-[11px] font-bold">
        <button
          onClick={() => setActiveTab('reps')}
          className={`py-2 rounded-xl transition-all ${
            activeTab === 'reps' ? 'bg-white text-emerald-700 shadow-2xs font-extrabold' : 'text-slate-600'
          }`}
        >
          Delivery Reps
        </button>

        <button
          onClick={() => setActiveTab('customerShops')}
          className={`py-2 rounded-xl transition-all ${
            activeTab === 'customerShops' ? 'bg-white text-purple-700 shadow-2xs font-extrabold' : 'text-slate-600'
          }`}
        >
          Customer Shops
        </button>

        <button
          onClick={() => setActiveTab('mainShops')}
          className={`py-2 rounded-xl transition-all ${
            activeTab === 'mainShops' ? 'bg-white text-blue-700 shadow-2xs font-extrabold' : 'text-slate-600'
          }`}
        >
          Main Shops
        </button>

        <button
          onClick={() => setActiveTab('database')}
          className={`py-2 rounded-xl transition-all ${
            activeTab === 'database' ? 'bg-white text-slate-900 shadow-2xs font-extrabold' : 'text-slate-600'
          }`}
        >
          VPS / Backup
        </button>
      </div>

      {/* TAB 1: DELIVERY REPS ("refla tika balaganna delete karanna") */}
      {activeTab === 'reps' && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <span>Registered Representatives ({reps.length})</span>
            </span>
          </div>

          <div className="space-y-2">
            {reps.map((rep) => (
              <div
                key={rep.id}
                className="flex items-center justify-between p-3 bg-white rounded-2xl border border-slate-200 shadow-2xs"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <img
                    src={rep.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60'}
                    alt={rep.name}
                    className="w-11 h-11 rounded-xl object-cover border border-slate-100 flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                      {rep.id}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 truncate">{rep.name}</h4>
                    {rep.phone && (
                      <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Phone className="w-2.5 h-2.5 text-emerald-600" />
                        <span>{rep.phone}</span>
                      </p>
                    )}
                  </div>
                </div>

                {reps.length > 1 && (
                  <button
                    onClick={() => {
                      if (confirm(`Delete delivery representative "${rep.name}"?`)) {
                        onDeleteRep(rep.id);
                      }
                    }}
                    className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    title="Delete Rep"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: CUSTOMER SHOPS ("shop tika balaganna delete karanna") */}
      {activeTab === 'customerShops' && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Store className="w-4 h-4 text-purple-600" />
              <span>Customer Retail Shops ({customers.length})</span>
            </span>
          </div>

          <div className="space-y-2">
            {customers.map((cust) => (
              <div
                key={cust.id}
                className="flex items-center justify-between p-3 bg-white rounded-2xl border border-slate-200 shadow-2xs"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  {cust.image ? (
                    <img
                      src={cust.image}
                      alt={cust.name}
                      className="w-11 h-11 rounded-xl object-cover border border-slate-100 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                      {cust.name.substring(0, 2).toUpperCase()}
                    </div>
                  )}

                  <div className="min-w-0">
                    <span className="text-[9px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.2 rounded">
                      {cust.id}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 truncate">{cust.name}</h4>
                    <p className="text-[10px] text-slate-500 truncate">
                      Owner: {cust.ownerName} • {cust.address}
                    </p>
                  </div>
                </div>

                {customers.length > 1 && (
                  <button
                    onClick={() => {
                      if (confirm(`Delete customer shop "${cust.name}"?`)) {
                        onDeleteCustomer(cust.id);
                      }
                    }}
                    className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    title="Delete Customer Shop"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: MAIN SHOPS ("main shop tika balaganna delete karanna") */}
      {activeTab === 'mainShops' && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Store className="w-4 h-4 text-blue-600" />
              <span>Main Importer Stores ({shops.length})</span>
            </span>
          </div>

          <div className="space-y-2">
            {shops.map((shop) => (
              <div
                key={shop.id}
                className="flex items-center justify-between p-3 bg-white rounded-2xl border border-slate-200 shadow-2xs"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <img
                    src={shop.image}
                    alt={shop.name}
                    className="w-11 h-11 rounded-xl object-cover border border-slate-100 flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="text-[9px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded">
                      {shop.id}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 truncate">{shop.name}</h4>
                  </div>
                </div>

                {onDeleteShop && (
                  <button
                    onClick={() => {
                      if (confirm(`Delete main shop "${shop.name}"?\nAll products and orders belonging to this shop will also be permanently deleted!`)) {
                        onDeleteShop(shop.id);
                      }
                    }}
                    className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    title="Delete Shop"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: DATABASE & VPS DEPLOYMENT */}
      {activeTab === 'database' && (
        <div className="space-y-3">
          {/* VPS Info Box */}
          <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-1.5">
            <div className="flex items-center gap-2 text-blue-800 font-bold text-xs">
              <Server className="w-4 h-4 text-blue-600" />
              <span>VPS Deployment Ready</span>
            </div>
            <p className="text-[11px] text-blue-900/80 leading-relaxed">
              This system is built with Node.js & Express. When deploying to a VPS (Ubuntu/Debian), run:
              <br />
              <code className="inline-block mt-1 p-1 bg-white rounded text-[10px] font-mono text-blue-700 border border-blue-200">
                npm run build &amp;&amp; npm start
              </code>
            </p>
          </div>

          {/* Backup Download */}
          <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-900">Download Database Backup</h4>
                <p className="text-[10px] text-slate-500">Exports all products, shops, reps, and orders as JSON</p>
              </div>
              <button
                onClick={handleBackupDownload}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export JSON</span>
              </button>
            </div>
          </div>

          {/* Restore JSON */}
          <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-900">Restore Database Backup</h4>
                <p className="text-[10px] text-slate-500">Upload a saved JSON backup to restore state</p>
              </div>
              <label className="cursor-pointer px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all active:scale-95">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload JSON</span>
                <input type="file" accept=".json" className="hidden" onChange={handleRestoreFile} />
              </label>
            </div>
          </div>

          {/* Reset Demo Data */}
          <div className="p-3.5 bg-white rounded-2xl border border-amber-200 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-amber-800">Reload Sample Demo Data</h4>
                <p className="text-[10px] text-amber-600">Resets to sample cosmetic items and test shops</p>
              </div>
              <button
                onClick={handleDemoReset}
                disabled={isResetting}
                className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
                <span>Reset Demo</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
