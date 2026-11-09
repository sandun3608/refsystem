import React, { useState } from 'react';
import { Store, Plus, Sparkles, ArrowRight, Trash2, Image, ShieldCheck } from 'lucide-react';
import { compressImage } from '../utils/imageHelper';

export default function MainShopPage({ shops, onSelectShop, onAddShop, onDeleteShop }) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formError, setFormError] = useState('');
  
  const generateNewShopId = () => {
    return `MS-${Math.floor(1000 + Math.random() * 9000)}`;
  };

  const [formData, setFormData] = useState({
    name: '',
    id: generateNewShopId(),
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&auto=format&fit=crop&q=60'
  });

  const sampleImages = [
    { label: 'Beauty Hub', url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&auto=format&fit=crop&q=60' },
    { label: 'Glow Luxury', url: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&auto=format&fit=crop&q=60' },
    { label: 'Cosmetic Store', url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&auto=format&fit=crop&q=60' },
    { label: 'Modern Boutique', url: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=400&auto=format&fit=crop&q=60' }
  ];

  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file, 600, 600, 0.7);
        if (compressed) {
          setFormData(prev => ({ ...prev, image: compressed }));
        }
      } catch (err) {
        console.warn('Image compression error', err);
      }
    }
  };

  const handleOpenAddModal = () => {
    setFormData({
      name: '',
      id: generateNewShopId(),
      image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&auto=format&fit=crop&q=60'
    });
    setFormError('');
    setIsFormOpen(true);
  };

  const handleSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setFormError('');
    if (!formData.name || !formData.name.trim()) {
      setFormError('Please enter Importer Shop Name before saving');
      return;
    }
    const resolvedId = formData.id?.trim() || generateNewShopId();
    onAddShop({
      ...formData,
      id: resolvedId,
      name: formData.name.trim()
    });
    setFormData({
      name: '',
      id: generateNewShopId(),
      image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&auto=format&fit=crop&q=60'
    });
    setFormError('');
    setIsFormOpen(false);
  };

  return (
    <div className="p-3 space-y-3 pb-28">
      
      {/* Top Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-4 text-white shadow-lg shadow-blue-500/10 text-center flex flex-col items-center justify-center">
        <div className="relative z-10 space-y-1 max-w-xs mx-auto">
          <h2 className="text-2xl font-black tracking-tight text-white drop-shadow-xs">
            Welcome
          </h2>
          <p className="text-[11px] text-blue-100/90 leading-relaxed font-medium">
            Manage your imported cosmetics inventory, delivery representatives, customer shop orders, and billing in one smooth workflow.
          </p>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-blue-400/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -left-8 -top-8 w-36 h-36 bg-indigo-400/20 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Main Center Action: "Add Your Shop" Button */}
      <div className="flex flex-col items-center justify-center space-y-1.5">
        <button
          onClick={handleOpenAddModal}
          className="group relative flex items-center justify-center gap-3 w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl font-bold shadow-md shadow-blue-500/20 active:scale-98 transition-all duration-200 border border-blue-400/30"
        >
          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div className="text-left">
            <span className="block text-[9px] font-extrabold tracking-wide uppercase text-blue-100">Step 1</span>
            <span className="text-sm font-bold">Add Your Shop</span>
          </div>
        </button>
        <p className="text-[10px] text-slate-400 text-center font-medium">
          Add your main cosmetic distribution shop or importer warehouse to begin
        </p>
      </div>

      {/* Shops List Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Store className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-800">Available Importer Shops</h3>
          </div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            {shops.length} {shops.length === 1 ? 'Shop' : 'Shops'}
          </span>
        </div>

        {shops.length === 0 ? (
          <div className="text-center py-10 px-4 bg-white rounded-2xl border border-dashed border-slate-300">
            <Store className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-xs font-semibold text-slate-600">No importer shops added yet</p>
            <p className="text-[11px] text-slate-400 mt-1">Click "Add Your Shop" above to add your first distribution store</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {shops.map((shop) => (
              <div
                key={shop.id}
                onClick={() => onSelectShop(shop)}
                className="group relative flex items-center justify-between p-3.5 bg-white hover:bg-blue-50/50 rounded-2xl border border-slate-200 hover:border-blue-400 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer active:scale-99"
              >
                <div className="flex items-center space-x-3.5 min-w-0">
                  <div className="relative">
                    <img
                      src={shop.image || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=200&auto=format&fit=crop&q=60'}
                      alt={shop.name}
                      className="w-14 h-14 rounded-2xl object-cover border border-slate-100 shadow-xs group-hover:ring-2 group-hover:ring-blue-500/30 transition-all"
                    />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">
                      <ShieldCheck className="w-3 h-3" />
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <span className="inline-block text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md mb-1 border border-blue-100">
                      ID: {shop.id}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors truncate">
                      {shop.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <span>Click to select & choose delivery Rep</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 pl-2">
                  {onDeleteShop && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Are you sure you want to delete "${shop.name}"?\nAll products and orders belonging to this shop will also be permanently deleted!`)) {
                          onDeleteShop(shop.id);
                        }
                      }}
                      className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                      title="Delete Shop"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <div className="w-8 h-8 rounded-xl bg-slate-100 group-hover:bg-blue-600 text-slate-500 group-hover:text-white flex items-center justify-center transition-all shadow-xs">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal / Form: Add Your Shop */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                  <Store className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Add Your Shop</h3>
                  <p className="text-[10px] text-blue-100">Enter Main Importer Shop Details</p>
                </div>
              </div>
              <button
                onClick={() => setIsFormOpen(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSubmit} noValidate className="p-5 space-y-4 overflow-y-auto no-scrollbar">
              {/* Form Error Banner */}
              {formError && (
                <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                  <span className="text-red-500 font-bold">⚠️</span>
                  <span>{formError}</span>
                </div>
              )}

              {/* Shop Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Shop Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. LumiCosmetics Wholesale"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (formError) setFormError('');
                  }}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-medium text-slate-900"
                />
              </div>

              {/* Shop ID */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Shop ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. MS-5421"
                  value={formData.id}
                  onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-medium text-slate-900"
                />
              </div>

              {/* Shop Image URL or File Upload */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Shop Image (URL or Upload)
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Paste image URL..."
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none"
                  />
                  <label className="cursor-pointer px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-semibold flex items-center gap-1 border border-blue-200">
                    <Image className="w-3.5 h-3.5" />
                    <span>Upload</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageFileChange} />
                  </label>
                </div>

                {/* Quick Preset Images */}
                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-400 font-medium">Or choose quick sample preset:</span>
                  <div className="grid grid-cols-4 gap-2">
                    {sampleImages.map((img, i) => (
                      <button
                        type="button"
                        key={i}
                        onClick={() => setFormData({ ...formData, image: img.url })}
                        className={`relative rounded-xl overflow-hidden border-2 transition-all ${
                          formData.image === img.url ? 'border-blue-600 scale-102 shadow-xs' : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={img.url} alt={img.label} className="w-full h-12 object-cover" />
                        <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[8px] py-0.5 text-center truncate px-0.5">
                          {img.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preview */}
                {formData.image && (
                  <div className="mt-3 flex items-center gap-3 p-2 bg-slate-50 rounded-xl border border-slate-200/60">
                    <img src={formData.image} alt="Preview" className="w-12 h-12 rounded-lg object-cover" />
                    <span className="text-[11px] text-slate-500 font-medium truncate">Selected Image Preview</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setFormError('');
                    setIsFormOpen(false);
                  }}
                  className="flex-1 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="flex-1 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20 transition-all active:scale-98"
                >
                  Save & Add Shop
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
