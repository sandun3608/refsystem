import React, { useState } from 'react';
import { Store, Plus, Search, MapPin, User, ArrowRight, Trash2, Image, Sparkles } from 'lucide-react';

export default function CustomerShopPage({ 
  customers, 
  onSelectCustomer, 
  onAddCustomer, 
  onDeleteCustomer,
  mainShop,
  rep
}) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    id: `CUST-0${customers.length + 1}`,
    image: '', // optional as requested
    ownerName: '',
    phone: ''
  });

  const sampleStoreImages = [
    { label: 'Salon & Spa', url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&auto=format&fit=crop&q=60' },
    { label: 'Beauty Bar', url: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=400&auto=format&fit=crop&q=60' },
    { label: 'Cosmetics', url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&auto=format&fit=crop&q=60' }
  ];

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setFormError('');
    if (!formData.name || !formData.name.trim()) {
      setFormError('Please enter Customer Shop Name before saving');
      return;
    }
    const resolvedId = formData.id?.trim() || `CUST-0${customers.length + 1}`;
    onAddCustomer({ 
      ...formData, 
      id: resolvedId,
      name: formData.name.trim(),
      address: formData.address?.trim() || '',
      ownerName: formData.ownerName?.trim() || '',
      phone: formData.phone?.trim() || '',
      shopId: mainShop?.id 
    });
    setFormData({
      name: '',
      address: '',
      id: `CUST-0${customers.length + 2}`,
      image: '',
      ownerName: '',
      phone: ''
    });
    setFormError('');
    setIsFormOpen(false);
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.address && c.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (c.ownerName && c.ownerName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-3 space-y-3 pb-28 flex flex-col">
      
      {/* Active Session Hierarchy Banner */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600">
            Active Distribution Session
          </span>
          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-purple-600 text-white">
            Step 3
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center space-x-2 bg-white p-2 rounded-xl border border-slate-100 shadow-2xs">
            <img src={mainShop?.image} alt={mainShop?.name} className="w-6 h-6 rounded-lg object-cover" />
            <div className="truncate">
              <span className="block text-[9px] text-slate-400 font-bold uppercase">Main Shop</span>
              <span className="font-bold text-slate-800 text-[11px] truncate block">{mainShop?.name}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2 bg-white p-2 rounded-xl border border-slate-100 shadow-2xs">
            <img src={rep?.image} alt={rep?.name} className="w-6 h-6 rounded-lg object-cover" />
            <div className="truncate">
              <span className="block text-[9px] text-slate-400 font-bold uppercase">Delivery Rep</span>
              <span className="font-bold text-slate-800 text-[11px] truncate block">{rep?.name}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Page Title & Search Bar */}
      <div className="space-y-3">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
            Select Customer Retail Shop
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Select which retail cosmetics shop, salon, or pharmacy to supply
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Customer Shop, owner or address..."
            className="w-full pl-9 pr-4 py-2.5 text-xs bg-white text-slate-900 placeholder:text-slate-400 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none shadow-xs transition-all"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Add Customer Shop Button */}
      <button
        onClick={() => setIsFormOpen(true)}
        className="flex items-center justify-center gap-2.5 w-full py-3.5 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-2xl font-bold shadow-md shadow-purple-600/20 active:scale-98 transition-all duration-200 border border-purple-400/20"
      >
        <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
          <Plus className="w-5 h-5 stroke-[2.5]" />
        </div>
        <span className="text-sm font-bold">Add Customer Shop</span>
      </button>

      {/* Customer Shops List */}
      <div className="flex-1 space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Store className="w-4 h-4 text-purple-600" />
            Customer Retail Outlets ({filteredCustomers.length})
          </span>
        </div>

        {filteredCustomers.length === 0 ? (
          <div className="text-center py-10 px-4 bg-white rounded-2xl border border-dashed border-slate-300">
            <Store className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-xs font-semibold text-slate-600">No customer shops found</p>
            <p className="text-[11px] text-slate-400 mt-1">Click "Add Customer Shop" above to register an outlet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2.5">
            {filteredCustomers.map((cust) => (
              <div
                key={cust.id}
                onClick={() => onSelectCustomer(cust)}
                className="group relative flex items-center justify-between p-3.5 bg-white hover:bg-purple-50/40 rounded-2xl border border-slate-200 hover:border-purple-400 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer active:scale-99"
              >
                <div className="flex items-center space-x-3.5 min-w-0">
                  <div className="relative">
                    {cust.image ? (
                      <img
                        src={cust.image}
                        alt={cust.name}
                        className="w-14 h-14 rounded-2xl object-cover border border-slate-100 shadow-xs group-hover:ring-2 group-hover:ring-purple-500/30 transition-all"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-100 to-indigo-100 text-purple-700 flex items-center justify-center border border-purple-200 font-bold text-lg shadow-xs group-hover:ring-2 group-hover:ring-purple-500/30">
                        {cust.name.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-purple-600 text-white flex items-center justify-center text-[9px]">
                      ★
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <span className="inline-block text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md mb-0.5 border border-purple-100">
                      ID: {cust.id}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-purple-700 transition-colors truncate">
                      {cust.name}
                    </h4>
                    
                    {cust.ownerName && (
                      <p className="text-[11px] text-slate-600 flex items-center gap-1 mt-0.5 truncate">
                        <User className="w-3 h-3 text-purple-600" />
                        <span>Owner: <strong className="font-semibold text-slate-700">{cust.ownerName}</strong></span>
                      </p>
                    )}

                    {cust.address && (
                      <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span className="truncate">{cust.address}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2 pl-2">
                  {onDeleteCustomer && customers.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Are you sure you want to delete ${cust.name}?`)) {
                          onDeleteCustomer(cust.id);
                        }
                      }}
                      className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                      title="Delete Customer Shop"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <div className="w-8 h-8 rounded-xl bg-slate-100 group-hover:bg-purple-600 text-slate-500 group-hover:text-white flex items-center justify-center transition-all shadow-xs">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal / Form: Add Customer Shop */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                  <Store className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Add Customer Shop</h3>
                  <p className="text-[10px] text-purple-100">Register new customer cosmetic store/salon</p>
                </div>
              </div>
              <button
                onClick={() => setIsFormOpen(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate className="p-5 space-y-3.5 overflow-y-auto no-scrollbar">
              {/* Form Error Banner */}
              {formError && (
                <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                  <span className="text-red-500 font-bold">⚠️</span>
                  <span>{formError}</span>
                </div>
              )}

              {/* Shop Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Customer Shop Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rose Gold Salon & Cosmetics"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (formError) setFormError('');
                  }}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none transition-all font-medium text-slate-900"
                />
              </div>

              {/* Shop ID */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Shop ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. CUST-01"
                  value={formData.id}
                  onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none transition-all font-medium text-slate-900"
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  placeholder="e.g. No 45, Galle Road, Colombo 03"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-purple-500 outline-none transition-all font-medium text-slate-900"
                />
              </div>

              {/* Owner Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Owner Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mrs. Chandrika Fernando"
                  value={formData.ownerName}
                  onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-purple-500 outline-none transition-all font-medium text-slate-900"
                />
              </div>

              {/* Phone (optional) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Phone (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 011 234 5678"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-purple-500 outline-none"
                />
              </div>

              {/* Shop Image (OPTIONAL - as user requested: "(optional apita image ekk natath save karanna puluwwan wenna ona)") */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">
                    Shop Image
                  </label>
                  <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                    Optional
                  </span>
                </div>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Optional image URL or leave blank..."
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-purple-500 outline-none"
                  />
                  <label className="cursor-pointer px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl text-xs font-semibold flex items-center gap-1 border border-purple-200">
                    <Image className="w-3.5 h-3.5" />
                    <span>Upload</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageFileChange} />
                  </label>
                </div>

                {/* Optional presets */}
                <div className="grid grid-cols-3 gap-2">
                  {sampleStoreImages.map((s, i) => (
                    <button
                      type="button"
                      key={i}
                      onClick={() => setFormData({ ...formData, image: s.url })}
                      className={`relative rounded-xl overflow-hidden border-2 transition-all ${
                        formData.image === s.url ? 'border-purple-600 scale-102' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={s.url} alt={s.label} className="w-full h-11 object-cover" />
                      <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[8px] py-0.5 text-center">
                        {s.label}
                      </span>
                    </button>
                  ))}
                </div>
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
                  className="flex-1 py-2.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-md shadow-purple-600/20 transition-all active:scale-98"
                >
                  Save Customer Shop
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
