import React, { useState } from 'react';
import { 
  Plus, 
  FileSpreadsheet, 
  Trash2, 
  Edit3, 
  FolderPlus, 
  Search, 
  AlertTriangle, 
  Layers, 
  Image, 
  Check, 
  Calendar, 
  Tag, 
  SlidersHorizontal,
  CheckSquare,
  Square
} from 'lucide-react';
import * as XLSX from 'xlsx';

export default function ProductManagePage({
  products,
  categories,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onBulkDeleteProducts,
  onAddCategory,
  onDeleteCategory
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isBulkDeleteMode, setIsBulkDeleteMode] = useState(false);
  const [bulkSelectedIds, setBulkSelectedIds] = useState([]);
  
  // Category search inside category modal
  const [categorySearchTerm, setCategorySearchTerm] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');

  // Product Form state (Add & Edit)
  const initialFormState = {
    name: '',
    brand: categories[0] || 'Skincare',
    costPrice: '',
    salePrice: '',
    stock: '',
    lowStockThreshold: 10,
    batchId: `BATCH-2026-${Math.floor(100 + Math.random() * 900)}`,
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&auto=format&fit=crop&q=60',
    expiryDate: '2028-12-31'
  };

  const [formData, setFormData] = useState(initialFormState);
  const [editingProductId, setEditingProductId] = useState(null);

  // Filter products
  const filteredProducts = products.filter(p => {
    const matchesCat = selectedCategory === 'All' || p.brand === selectedCategory;
    const matchesSearch = !searchTerm ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.batchId?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Handle Export to Excel
  const handleExportExcel = () => {
    const exportData = products.map((p, idx) => ({
      '#': idx + 1,
      'Product ID': p.id,
      'Product Name': p.name,
      'Brand / Category': p.brand,
      'Cost Price (Rs.)': p.costPrice,
      'Sale Price (Rs.)': p.salePrice,
      'Current Stock': p.stock,
      'Low Stock Threshold': p.lowStockThreshold || 10,
      'Batch ID': p.batchId || '',
      'Expiry Date': p.expiryDate || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Cosmetics Inventory');
    XLSX.writeFile(workbook, `Cosmetics_Inventory_${Date.now()}.xlsx`);
  };

  // Open Edit Modal
  const handleOpenEdit = (product) => {
    setEditingProductId(product.id);
    setFormData({
      name: product.name,
      brand: product.brand,
      costPrice: product.costPrice,
      salePrice: product.salePrice,
      stock: product.stock,
      lowStockThreshold: product.lowStockThreshold || 10,
      batchId: product.batchId || '',
      image: product.image || '',
      expiryDate: product.expiryDate || ''
    });
    setIsEditModalOpen(true);
  };

  // Save Add
  const handleSaveAdd = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    onAddProduct(formData);
    setFormData(initialFormState);
    setIsAddModalOpen(false);
  };

  // Save Edit
  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !editingProductId) return;
    onUpdateProduct(editingProductId, formData);
    setIsEditModalOpen(false);
    setEditingProductId(null);
  };

  // Bulk Delete Toggle
  const toggleBulkItem = (id) => {
    setBulkSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleExecuteBulkDelete = () => {
    if (bulkSelectedIds.length === 0) return;
    if (confirm(`Are you sure you want to delete ${bulkSelectedIds.length} selected products?`)) {
      onBulkDeleteProducts(bulkSelectedIds);
      setBulkSelectedIds([]);
      setIsBulkDeleteMode(false);
    }
  };

  // Add Category Handler
  const handleCreateCategory = (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    onAddCategory(newCategoryName.trim());
    setNewCategoryName('');
  };

  const filteredCategoriesInModal = categories.filter(c => 
    c.toLowerCase().includes(categorySearchTerm.toLowerCase())
  );

  return (
    <div className="pb-28 px-3 pt-2 space-y-4 max-w-md mx-auto">
      
      {/* Top Action Buttons Grid */}
      <div className="grid grid-cols-2 gap-2">
        {/* Add New Product Button */}
        <button
          onClick={() => {
            setFormData(initialFormState);
            setIsAddModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-blue-500/20 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add New Product</span>
        </button>

        {/* Export Excel Button ("export exel file button") */}
        <button
          onClick={handleExportExcel}
          className="flex items-center justify-center gap-2 p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Export Excel</span>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {/* Manage Categories Button ("add new catagory enna ona, delete catagory enna ona") */}
        <button
          onClick={() => setIsCategoryModalOpen(true)}
          className="flex items-center justify-center gap-2 p-2.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 shadow-2xs transition-all"
        >
          <FolderPlus className="w-4 h-4 text-purple-600" />
          <span>Categories ({categories.length})</span>
        </button>

        {/* Bulk Delete Mode Toggle ("product delete button eka enna ona (delete eka ebuwama wenama product okkoma load wela tick mark dala delete karanna)") */}
        <button
          onClick={() => {
            setIsBulkDeleteMode(!isBulkDeleteMode);
            setBulkSelectedIds([]);
          }}
          className={`flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs font-bold border transition-all ${
            isBulkDeleteMode
              ? 'bg-red-600 text-white border-red-600 shadow-xs'
              : 'bg-white hover:bg-red-50 text-red-600 border-red-200'
          }`}
        >
          <Trash2 className="w-4 h-4" />
          <span>{isBulkDeleteMode ? 'Cancel Bulk Delete' : 'Bulk Delete Mode'}</span>
        </button>
      </div>

      {/* Bulk Delete Action Banner */}
      {isBulkDeleteMode && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-between animate-in fade-in duration-200">
          <div>
            <span className="text-xs font-extrabold text-red-700 block">
              {bulkSelectedIds.length} Products Selected
            </span>
            <span className="text-[10px] text-red-500">Tick items below to delete</span>
          </div>

          <button
            onClick={handleExecuteBulkDelete}
            disabled={bulkSelectedIds.length === 0}
            className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs active:scale-95 transition-all flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Selected</span>
          </button>
        </div>
      )}

      {/* Categories Horizontal Filter Chips */}
      <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-1">
        {['All', ...categories].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`flex-shrink-0 px-3 py-1 rounded-xl text-xs font-bold transition-all ${
              selectedCategory === cat
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200 shadow-2xs'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Products Inventory List */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-slate-700">
            Catalog Products ({filteredProducts.length})
          </span>
        </div>

        {filteredProducts.map((product) => {
          const isSelected = bulkSelectedIds.includes(product.id);
          const isLowStock = product.stock <= (product.lowStockThreshold || 10);

          return (
            <div
              key={product.id}
              className={`flex items-center justify-between p-3 bg-white rounded-2xl border transition-all ${
                isSelected ? 'border-red-500 bg-red-50/20' : 'border-slate-200 shadow-2xs'
              }`}
            >
              {/* If Bulk Delete Mode: show checkbox */}
              {isBulkDeleteMode && (
                <button
                  type="button"
                  onClick={() => toggleBulkItem(product.id)}
                  className="mr-2 text-slate-400 hover:text-red-600"
                >
                  {isSelected ? (
                    <CheckSquare className="w-5 h-5 text-red-600 fill-red-100" />
                  ) : (
                    <Square className="w-5 h-5" />
                  )}
                </button>
              )}

              <img
                src={product.image}
                alt={product.name}
                className="w-13 h-13 rounded-xl object-cover border border-slate-100 flex-shrink-0"
              />

              <div className="flex-1 min-w-0 px-3">
                <span className="text-[9px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                  {product.brand}
                </span>
                <h4 className="text-xs font-bold text-slate-900 truncate mt-0.5">{product.name}</h4>
                <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                  <span>Sale: <strong>Rs. {product.salePrice?.toLocaleString()}</strong></span>
                  <span>Cost: <strong>Rs. {product.costPrice?.toLocaleString()}</strong></span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-full ${
                    isLowStock ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    Stock: {product.stock}
                  </span>
                  <span className="text-[9px] text-slate-400">Batch: {product.batchId}</span>
                </div>
              </div>

              {/* Edit & Recycle Bin Delete Icon at far right ("delete product kiyala recycle bin ekk kerolen enna ona awasanetama") */}
              <div className="flex items-center space-x-1 pl-1 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(product)}
                  className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                  title="Edit Product"
                >
                  <Edit3 className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Delete product "${product.name}"?`)) {
                      onDeleteProduct(product.id);
                    }
                  }}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  title="Delete Product (Recycle Bin)"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* MODAL 1: ADD NEW PRODUCT */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[92vh]">
            <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Plus className="w-5 h-5" />
                <h3 className="text-sm font-bold">Add New Cosmetic Product</h3>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-xs font-bold">✕</button>
            </div>

            <form onSubmit={handleSaveAdd} className="p-4 space-y-3 overflow-y-auto no-scrollbar">
              {/* Product Name */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. L'Oreal Serum 30ml"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none"
                />
              </div>

              {/* Brand / Category (Dropdown from created categories) */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Brand / Category *</label>
                <select
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none font-semibold text-slate-800"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Cost Price & Sale Price */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Cost Price (Rs.) *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 2500"
                    value={formData.costPrice}
                    onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Sale Price (Rs.) *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 3800"
                    value={formData.salePrice}
                    onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-blue-700"
                  />
                </div>
              </div>

              {/* Stock & Low Stock Threshold Count ("methana thawa kotuwak danna low stock count kiyala") */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Current Stock *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 50"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-red-600 block mb-1">Low Stock Count *</label>
                  <input
                    type="number"
                    required
                    placeholder="Alert below e.g. 10"
                    value={formData.lowStockThreshold}
                    onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-red-50/50 border border-red-200 rounded-xl outline-none font-bold text-red-700"
                  />
                </div>
              </div>

              {/* Batch ID & Expiry Date */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Batch ID</label>
                  <input
                    type="text"
                    value={formData.batchId}
                    onChange={(e) => setFormData({ ...formData, batchId: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
              </div>

              {/* Product Image */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Product Image URL</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md"
                >
                  Save to Inventory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT PRODUCT */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[92vh]">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Edit3 className="w-5 h-5 text-blue-400" />
                <h3 className="text-sm font-bold">Edit Product Details</h3>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="text-xs font-bold">✕</button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-4 space-y-3 overflow-y-auto no-scrollbar">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Brand / Category</label>
                <select
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none font-semibold"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Cost Price</label>
                  <input
                    type="number"
                    value={formData.costPrice}
                    onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Sale Price</label>
                  <input
                    type="number"
                    value={formData.salePrice}
                    onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Stock</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-red-600 block mb-1">Low Stock Count</label>
                  <input
                    type="number"
                    value={formData.lowStockThreshold}
                    onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-red-50 border border-red-200 rounded-xl outline-none font-bold text-red-700"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Product Image URL</label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md"
                >
                  Update Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: CATEGORY MANAGER ("catagory button walath serch catagory add catagory delete catagory enna ona") */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[85vh]">
            <div className="p-4 bg-purple-700 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FolderPlus className="w-5 h-5" />
                <h3 className="text-sm font-bold">Manage Product Categories</h3>
              </div>
              <button onClick={() => setIsCategoryModalOpen(false)} className="text-xs font-bold">✕</button>
            </div>

            <div className="p-4 space-y-3 flex-1 overflow-y-auto no-scrollbar">
              {/* Add category form */}
              <form onSubmit={handleCreateCategory} className="flex gap-2">
                <input
                  type="text"
                  placeholder="New category/brand name..."
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold"
                >
                  Add
                </button>
              </form>

              {/* Search Category */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={categorySearchTerm}
                  onChange={(e) => setCategorySearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-100 rounded-xl outline-none"
                />
              </div>

              {/* Categories list with delete option */}
              <div className="space-y-1.5 pt-1">
                {filteredCategoriesInModal.map((cat) => (
                  <div
                    key={cat}
                    className="flex items-center justify-between p-2.5 bg-slate-50 hover:bg-purple-50/50 rounded-xl border border-slate-200/80 text-xs font-semibold text-slate-800"
                  >
                    <span>{cat}</span>
                    {categories.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Delete category "${cat}"?`)) {
                            onDeleteCategory(cat);
                          }
                        }}
                        className="text-slate-400 hover:text-red-600 p-1 rounded-lg"
                        title="Delete Category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 border-t border-slate-100 bg-slate-50">
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="w-full py-2 bg-slate-800 text-white rounded-xl text-xs font-bold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
