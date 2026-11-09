import React, { useState } from 'react';
import { UserCheck, Plus, Search, Phone, ArrowRight, Trash2, Image, Shield } from 'lucide-react';

export default function RepSelectionPage({ reps, onSelectRep, onAddRep, onDeleteRep, mainShop }) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    id: `REP-${Math.floor(100 + Math.random() * 900)}`,
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=60',
    phone: ''
  });

  const presetAvatars = [
    { label: 'Rep 1', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=60' },
    { label: 'Rep 2', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=60' },
    { label: 'Rep 3', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=60' },
    { label: 'Rep 4', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=60' }
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
    e.preventDefault();
    if (!formData.name.trim()) return;
    onAddRep({ ...formData, shopId: mainShop?.id });
    setFormData({
      name: '',
      id: `REP-${Math.floor(100 + Math.random() * 900)}`,
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=60',
      phone: ''
    });
    setIsFormOpen(false);
  };

  const filteredReps = reps.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.phone && r.phone.includes(searchTerm))
  );

  return (
    <div className="p-3 space-y-3 pb-28 flex flex-col">
      
      {/* Top Banner showing Active Main Shop context */}
      <div className="flex items-center justify-between p-3 bg-blue-50/80 border border-blue-200/80 rounded-2xl">
        <div className="flex items-center space-x-3">
          <img
            src={mainShop?.image || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=100&auto=format&fit=crop&q=60'}
            alt={mainShop?.name}
            className="w-10 h-10 rounded-xl object-cover border border-blue-200"
          />
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Selected Main Shop</span>
            <h3 className="text-xs font-bold text-slate-900 truncate max-w-[200px]">{mainShop?.name}</h3>
          </div>
        </div>
        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-600 text-white">
          Step 2
        </span>
      </div>

      {/* Page Title & Search Bar */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
              Who is Out for Delivery Today?
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Select the sales representative handling distribution today
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Ref by name, ID or phone..."
            className="w-full pl-9 pr-4 py-2.5 text-xs bg-white text-slate-900 placeholder:text-slate-400 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none shadow-xs transition-all"
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

      {/* Add Ref Button */}
      <button
        onClick={() => setIsFormOpen(true)}
        className="flex items-center justify-center gap-2.5 w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-2xl font-bold shadow-md shadow-emerald-600/20 active:scale-98 transition-all duration-200 border border-emerald-400/20"
      >
        <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
          <Plus className="w-5 h-5 stroke-[2.5]" />
        </div>
        <span className="text-sm font-bold">Add Delivery Ref</span>
      </button>

      {/* Reps Cards List */}
      <div className="flex-1 space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-emerald-600" />
            Registered Representatives ({filteredReps.length})
          </span>
        </div>

        {filteredReps.length === 0 ? (
          <div className="text-center py-10 px-4 bg-white rounded-2xl border border-dashed border-slate-300">
            <UserCheck className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-xs font-semibold text-slate-600">No delivery reps found</p>
            <p className="text-[11px] text-slate-400 mt-1">Click "Add Delivery Ref" above to add a sales representative</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2.5">
            {filteredReps.map((rep) => (
              <div
                key={rep.id}
                onClick={() => onSelectRep(rep)}
                className="group relative flex items-center justify-between p-3 bg-white hover:bg-emerald-50/40 rounded-2xl border border-slate-200 hover:border-emerald-400 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer active:scale-99"
              >
                <div className="flex items-center space-x-3.5 min-w-0">
                  <div className="relative">
                    <img
                      src={rep.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=60'}
                      alt={rep.name}
                      className="w-13 h-13 rounded-2xl object-cover border border-slate-100 shadow-xs group-hover:ring-2 group-hover:ring-emerald-500/30 transition-all"
                    />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px]">
                      ✓
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <span className="inline-block text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md mb-0.5 border border-emerald-100">
                      ID: {rep.id}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors truncate">
                      {rep.name}
                    </h4>
                    {rep.phone ? (
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-emerald-600" />
                        <span>{rep.phone}</span>
                      </p>
                    ) : (
                      <p className="text-[10px] text-slate-400">Ready for distribution</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2 pl-2">
                  {onDeleteRep && reps.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Are you sure you want to delete ${rep.name}?`)) {
                          onDeleteRep(rep.id);
                        }
                      }}
                      className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                      title="Delete Ref"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <div className="w-8 h-8 rounded-xl bg-slate-100 group-hover:bg-emerald-600 text-slate-500 group-hover:text-white flex items-center justify-center transition-all shadow-xs">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal / Form: Add Rep */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Add Delivery Ref</h3>
                  <p className="text-[10px] text-emerald-100">Register a new sales representative</p>
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
            <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto no-scrollbar">
              {/* Rep Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Ref Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kamal Perera"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                />
              </div>

              {/* Rep ID */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Ref ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. REP-101"
                  value={formData.id}
                  onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Phone Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. 077 123 4567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-none"
                />
              </div>

              {/* Rep Image */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Ref Photo (URL or Upload)
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Paste image URL..."
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-none"
                  />
                  <label className="cursor-pointer px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-semibold flex items-center gap-1 border border-emerald-200">
                    <Image className="w-3.5 h-3.5" />
                    <span>Upload</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageFileChange} />
                  </label>
                </div>

                {/* Preset Avatars */}
                <div className="grid grid-cols-4 gap-2">
                  {presetAvatars.map((av, i) => (
                    <button
                      type="button"
                      key={i}
                      onClick={() => setFormData({ ...formData, image: av.url })}
                      className={`relative rounded-xl overflow-hidden border-2 transition-all ${
                        formData.image === av.url ? 'border-emerald-600 scale-102 shadow-xs' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={av.url} alt={av.label} className="w-full h-12 object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="flex-1 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/20 transition-all active:scale-98"
                >
                  Save & Add Ref
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
