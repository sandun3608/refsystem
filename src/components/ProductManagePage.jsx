import React, { useState, useRef, useEffect } from 'react';
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
  Square,
  Download,
  UploadCloud,
  CheckCircle2,
  Camera,
  Upload,
  ArrowLeft
} from 'lucide-react';
import * as XLSX from 'xlsx';

export default function ProductManagePage({
  products,
  categories,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onBulkDeleteProducts,
  onBulkAddProducts,
  onAddCategory,
  onDeleteCategory
}) {
  const fileInputRef = useRef(null);
  const addImageInputRef = useRef(null);
  const editImageInputRef = useRef(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Modals & Import state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isBulkDeleteMode, setIsBulkDeleteMode] = useState(false);
  const [bulkSelectedIds, setBulkSelectedIds] = useState([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importFeedback, setImportFeedback] = useState(null);
  const [formError, setFormError] = useState('');
  
  // Category search inside category modal
  const [categorySearchTerm, setCategorySearchTerm] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');

  // Lock background body scroll completely when modals are open
  useEffect(() => {
    if (isAddModalOpen || isEditModalOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [isAddModalOpen, isEditModalOpen]);

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
      'Expiry Date': p.expiryDate || '',
      'Image URL': p.image || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    worksheet['!cols'] = [
      { wch: 6 },
      { wch: 18 },
      { wch: 32 },
      { wch: 22 },
      { wch: 16 },
      { wch: 16 },
      { wch: 14 },
      { wch: 18 },
      { wch: 18 },
      { wch: 14 },
      { wch: 35 }
    ];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Cosmetics Inventory');
    XLSX.writeFile(workbook, `Cosmetics_Inventory_${Date.now()}.xlsx`);
  };

  // Download Sample Excel Template
  const handleDownloadTemplate = () => {
    const sampleData = [
      {
        'Product Name': 'Matte Velvet Lipstick #05 - Rose',
        'Brand / Category': 'Lipstick & Lip Care',
        'Cost Price (Rs.)': 1250,
        'Sale Price (Rs.)': 1950,
        'Current Stock': 50,
        'Low Stock Threshold': 10,
        'Batch ID': 'BATCH-2026-101',
        'Expiry Date': '2028-12-31',
        'Image URL': 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&auto=format&fit=crop&q=60'
      },
      {
        'Product Name': 'Hydrating Vitamin C Serum 30ml',
        'Brand / Category': 'Skincare',
        'Cost Price (Rs.)': 2800,
        'Sale Price (Rs.)': 4200,
        'Current Stock': 35,
        'Low Stock Threshold': 8,
        'Batch ID': 'BATCH-2026-102',
        'Expiry Date': '2028-06-30',
        'Image URL': 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&auto=format&fit=crop&q=60'
      },
      {
        'Product Name': 'Waterproof Volume Mascara Extra Black',
        'Brand / Category': 'Eye Makeup',
        'Cost Price (Rs.)': 950,
        'Sale Price (Rs.)': 1600,
        'Current Stock': 65,
        'Low Stock Threshold': 15,
        'Batch ID': 'BATCH-2026-103',
        'Expiry Date': '2027-10-15',
        'Image URL': 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400&auto=format&fit=crop&q=60'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    worksheet['!cols'] = [
      { wch: 36 },
      { wch: 24 },
      { wch: 16 },
      { wch: 16 },
      { wch: 14 },
      { wch: 18 },
      { wch: 18 },
      { wch: 14 },
      { wch: 40 }
    ];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');
    XLSX.writeFile(workbook, 'Cosmetics_Product_Import_Template.xlsx');
  };

  // Handle Import Excel File
  const handleImportExcel = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportFeedback(null);

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target.result;
        const workbook = XLSX.read(bstr, { type: 'binary', cellDates: true });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawRows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (!rawRows || rawRows.length === 0) {
          setIsImporting(false);
          setImportFeedback({ type: 'error', message: 'No data rows found in the uploaded file.' });
          return;
        }

        const cleanKey = (k) => String(k || '').toLowerCase().replace(/[^a-z0-9]/g, '');

        const parsedProducts = [];
        for (const row of rawRows) {
          const keys = Object.keys(row);
          const findVal = (possibleKeys) => {
            for (const pk of possibleKeys) {
              const match = keys.find(k => cleanKey(k) === cleanKey(pk));
              if (match !== undefined && row[match] !== '' && row[match] !== null) return row[match];
            }
            return undefined;
          };

          const name = findVal(['Product Name', 'Name', 'Product', 'Item Name', 'Item', 'Title', 'Description']);
          if (!name || !String(name).trim()) continue; // skip rows without product name

          const brand = String(findVal(['Brand / Category', 'Brand', 'Category', 'Cat', 'Group', 'Type']) || 'General').trim();
          const costPrice = Number(findVal(['Cost Price (Rs.)', 'Cost Price', 'Cost', 'CostPrice', 'Buy Price'])) || 0;
          const salePrice = Number(findVal(['Sale Price (Rs.)', 'Sale Price', 'Price', 'SalePrice', 'Selling Price'])) || 0;
          const stock = Number(findVal(['Current Stock', 'Stock', 'Quantity', 'Qty', 'Count', 'Units'])) || 0;
          const lowStockThreshold = Number(findVal(['Low Stock Threshold', 'Low Stock', 'Min Stock', 'Threshold', 'LowStockThreshold'])) || 10;
          const batchId = String(findVal(['Batch ID', 'Batch', 'Batch No', 'Batch Number', 'BatchId']) || `BATCH-2026-${Math.floor(100 + Math.random() * 900)}`).trim();
          
          let expiryDate = findVal(['Expiry Date', 'Expiry', 'Exp Date', 'EXP', 'ExpiryDate']) || '';
          if (expiryDate instanceof Date) {
            expiryDate = expiryDate.toISOString().split('T')[0];
          } else if (typeof expiryDate === 'number') {
            const jsDate = new Date(Math.round((expiryDate - 25569) * 86400 * 1000));
            expiryDate = !isNaN(jsDate.getTime()) ? jsDate.toISOString().split('T')[0] : '';
          } else {
            expiryDate = String(expiryDate).trim();
          }

          const image = String(findVal(['Image URL', 'Image', 'Photo', 'Picture', 'Img']) || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&auto=format&fit=crop&q=60').trim();

          parsedProducts.push({
            name: String(name).trim(),
            brand: brand || 'General',
            costPrice,
            salePrice,
            stock,
            lowStockThreshold,
            batchId,
            expiryDate,
            image
          });
        }

        if (parsedProducts.length === 0) {
          setIsImporting(false);
          setImportFeedback({ 
            type: 'error', 
            message: 'No valid products found! Make sure columns include "Product Name" or "Name".' 
          });
          return;
        }

        if (onBulkAddProducts) {
          const res = await onBulkAddProducts(parsedProducts);
          setIsImporting(false);
          if (res && res.success) {
            setImportFeedback({
              type: 'success',
              message: `✅ Successfully imported ${res.count || parsedProducts.length} products to inventory!`
            });
            setTimeout(() => setImportFeedback(null), 5000);
          } else {
            setImportFeedback({
              type: 'error',
              message: `Error importing: ${res?.error || 'Unknown server error'}`
            });
          }
        } else {
          // Fallback if prop not provided
          for (const prod of parsedProducts) {
            onAddProduct(prod);
          }
          setIsImporting(false);
          setImportFeedback({
            type: 'success',
            message: `✅ Imported ${parsedProducts.length} products!`
          });
          setTimeout(() => setImportFeedback(null), 5000);
        }

      } catch (err) {
        console.error('Excel parse error', err);
        setIsImporting(false);
        setImportFeedback({ type: 'error', message: 'Failed to read Excel file: ' + err.message });
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };

    reader.readAsBinaryString(file);
  };

  // Open Edit Modal
  const handleOpenEdit = (product) => {
    setFormError('');
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

  // Save Add Product (Robust validation without native form block)
  const handleSaveAdd = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setFormError('');

    if (!formData.name || !formData.name.trim()) {
      setFormError('Please enter a product name');
      return;
    }
    if (!formData.salePrice || Number(formData.salePrice) <= 0) {
      setFormError('Please enter a valid sale price (e.g. 1500)');
      return;
    }

    const payload = {
      ...formData,
      name: formData.name.trim(),
      brand: formData.brand || categories[0] || 'General',
      costPrice: Number(formData.costPrice) || 0,
      salePrice: Number(formData.salePrice) || 0,
      stock: Number(formData.stock) || 0,
      lowStockThreshold: Number(formData.lowStockThreshold) || 10,
      batchId: formData.batchId || `BATCH-2026-${Math.floor(100 + Math.random() * 900)}`,
      expiryDate: formData.expiryDate || '2028-12-31',
      image: formData.image || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&auto=format&fit=crop&q=60'
    };

    onAddProduct(payload);
    setFormData(initialFormState);
    setFormError('');
    setIsAddModalOpen(false);
  };

  // Save Edit Product
  const handleSaveEdit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setFormError('');

    if (!formData.name || !formData.name.trim()) {
      setFormError('Please enter a product name');
      return;
    }
    if (!formData.salePrice || Number(formData.salePrice) <= 0) {
      setFormError('Please enter a valid sale price (e.g. 1500)');
      return;
    }
    if (!editingProductId) return;

    const payload = {
      ...formData,
      name: formData.name.trim(),
      brand: formData.brand || categories[0] || 'General',
      costPrice: Number(formData.costPrice) || 0,
      salePrice: Number(formData.salePrice) || 0,
      stock: Number(formData.stock) || 0,
      lowStockThreshold: Number(formData.lowStockThreshold) || 10,
      batchId: formData.batchId || '',
      expiryDate: formData.expiryDate || '',
      image: formData.image || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&auto=format&fit=crop&q=60'
    };

    onUpdateProduct(editingProductId, payload);
    setIsEditModalOpen(false);
    setEditingProductId(null);
    setFormError('');
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
    <div className="pb-28 px-3 pt-2 space-y-3.5 max-w-md mx-auto">
      
      {/* Hidden File Input for Excel Import */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImportExcel}
        accept=".xlsx, .xls, .csv"
        className="hidden"
      />

      {/* Top Hero Action Buttons Grid */}
      <div className="grid grid-cols-2 gap-2">
        {/* Add New Product Button */}
        <button
          onClick={() => {
            setFormData(initialFormState);
            setIsAddModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 p-3.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-2xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add New Product</span>
        </button>

        {/* Import Excel Sheet Button ("product add eke enna one export ekk neme import excel sheet ekk") */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isImporting}
          className="flex items-center justify-center gap-2 p-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 disabled:opacity-70 text-white rounded-2xl text-xs font-bold shadow-md shadow-emerald-500/20 transition-all"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>{isImporting ? 'Importing Products...' : 'Import Excel Sheet'}</span>
        </button>
      </div>

      {/* Secondary Quick Action Row: Categories, Sample Template, Bulk Delete */}
      <div className="grid grid-cols-3 gap-2">
        {/* Manage Categories */}
        <button
          onClick={() => setIsCategoryModalOpen(true)}
          className="flex items-center justify-center gap-1.5 p-2.5 bg-white hover:bg-purple-50/50 text-slate-700 rounded-xl text-[11px] font-bold border border-slate-200/90 shadow-2xs transition-all"
        >
          <FolderPlus className="w-3.5 h-3.5 text-purple-600" />
          <span className="truncate">Categories ({categories.length})</span>
        </button>

        {/* Sample Excel Template */}
        <button
          onClick={handleDownloadTemplate}
          className="flex items-center justify-center gap-1.5 p-2.5 bg-white hover:bg-emerald-50 text-emerald-700 rounded-xl text-[11px] font-bold border border-emerald-200/90 shadow-2xs transition-all"
          title="Download Sample Excel Template to fill products"
        >
          <Download className="w-3.5 h-3.5 text-emerald-600" />
          <span className="truncate">Sample Excel</span>
        </button>

        {/* Bulk Delete Mode Toggle */}
        <button
          onClick={() => {
            setIsBulkDeleteMode(!isBulkDeleteMode);
            setBulkSelectedIds([]);
          }}
          className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl text-[11px] font-bold border transition-all ${
            isBulkDeleteMode
              ? 'bg-red-600 text-white border-red-600 shadow-xs'
              : 'bg-white hover:bg-red-50 text-red-600 border-red-200/90 shadow-2xs'
          }`}
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="truncate">{isBulkDeleteMode ? 'Cancel' : 'Bulk Delete'}</span>
        </button>
      </div>

      {/* Import Feedback Toast / Banner */}
      {importFeedback && (
        <div className={`p-3 rounded-2xl flex items-center justify-between text-xs font-semibold animate-in fade-in duration-200 ${
          importFeedback.type === 'success' 
            ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          <div className="flex items-center space-x-2">
            {importFeedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
            )}
            <span>{importFeedback.message}</span>
          </div>
          <button onClick={() => setImportFeedback(null)} className="text-slate-400 hover:text-slate-700 ml-2">✕</button>
        </div>
      )}

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

      {/* Search Input Box */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search products by name, brand, batch..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-white text-xs text-slate-900 border border-slate-200 rounded-xl outline-none focus:border-blue-500 shadow-2xs"
        />
      </div>

      {/* Categories Horizontal Filter Chips */}
      <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-0.5">
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
          {products.length > 0 && (
            <button
              onClick={handleExportExcel}
              className="text-[11px] font-bold text-slate-500 hover:text-emerald-700 flex items-center gap-1 transition-colors"
              title="Export current inventory to Excel"
            >
              <FileSpreadsheet className="w-3 h-3" />
              <span>Export</span>
            </button>
          )}
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

              {/* Edit & Recycle Bin Delete Icon at far right */}
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

      {/* Hidden File Input for Device / Camera Product Images */}
      <input
        type="file"
        accept="image/*"
        ref={addImageInputRef}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (evt) => {
              setFormData(prev => ({ ...prev, image: evt.target.result }));
            };
            reader.readAsDataURL(file);
          }
        }}
        className="hidden"
      />

      <input
        type="file"
        accept="image/*"
        ref={editImageInputRef}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (evt) => {
              setFormData(prev => ({ ...prev, image: evt.target.result }));
            };
            reader.readAsDataURL(file);
          }
        }}
        className="hidden"
      />

      {/* MODAL 1: ADD NEW PRODUCT (LOCKED, IMMOBILE, FULL-SCREEN APP VIEW) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#f8fafc] flex flex-col w-full max-w-md mx-auto h-[100dvh] overflow-hidden overscroll-none touch-pan-y animate-in fade-in duration-150">
          
          {/* Locked Top Header */}
          <div className="flex-shrink-0 px-4 py-3 bg-white border-b border-slate-200/90 flex items-center justify-between safe-top shadow-2xs">
            <div className="flex items-center space-x-2.5">
              <button
                type="button"
                onClick={() => {
                  setFormError('');
                  setIsAddModalOpen(false);
                }}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center active:scale-95 transition-all"
                title="Back to Products"
              >
                <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
              </button>
              <div>
                <h3 className="text-sm font-black text-slate-900 leading-tight">Add New Product</h3>
                <p className="text-[10px] text-slate-400 font-semibold">SKU Details & Inventory</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSaveAdd}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-xs shadow-blue-500/25 transition-all flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Save</span>
            </button>
          </div>

          {/* Locked Vertical Scroll Content (Zero Horizontal Drift) */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-3.5 space-y-3.5 overscroll-contain no-scrollbar">
            
            {/* Form Validation Error Banner */}
            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-2xl flex items-center gap-2 animate-in fade-in">
                <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* CARD 1: Basic Information */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider block">
                1. Product Information
              </span>

              {/* Product Name */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Product Name *</label>
                <input
                  type="text"
                  placeholder="e.g. L'Oreal Serum 30ml"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (formError) setFormError('');
                  }}
                  className="w-full px-3.5 py-2.5 text-[16px] sm:text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-blue-500 transition-colors font-medium text-slate-900"
                />
              </div>

              {/* Brand / Category */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Brand / Category</label>
                <select
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-[16px] sm:text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none font-semibold text-slate-800"
                >
                  {(categories.length > 0 ? categories : ['Skincare', 'Lipstick & Lip Care', 'General']).map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* CARD 2: Pricing & Stock */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider block">
                2. Pricing & Quantities
              </span>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-xs font-bold text-blue-700 block mb-1">Sale Price (Rs.) *</label>
                  <input
                    type="number"
                    placeholder="e.g. 3800"
                    value={formData.salePrice}
                    onChange={(e) => {
                      setFormData({ ...formData, salePrice: e.target.value });
                      if (formError) setFormError('');
                    }}
                    className="w-full px-3.5 py-2.5 text-[16px] sm:text-xs bg-blue-50/40 border border-blue-200 rounded-xl outline-none font-bold text-blue-700 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Cost Price (Rs.)</label>
                  <input
                    type="number"
                    placeholder="e.g. 2500"
                    value={formData.costPrice}
                    onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-[16px] sm:text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Current Stock</label>
                  <input
                    type="number"
                    placeholder="e.g. 50"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-[16px] sm:text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-red-600 block mb-1">Low Stock Alert Count</label>
                  <input
                    type="number"
                    placeholder="e.g. 10"
                    value={formData.lowStockThreshold}
                    onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-[16px] sm:text-xs bg-red-50/50 border border-red-200 rounded-xl outline-none font-bold text-red-700"
                  />
                </div>
              </div>
            </div>

            {/* CARD 3: Batch & Expiry */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider block">
                3. Batch & Expiry Date
              </span>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Batch ID</label>
                  <input
                    type="text"
                    value={formData.batchId}
                    onChange={(e) => setFormData({ ...formData, batchId: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-[16px] sm:text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-[16px] sm:text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium text-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* CARD 4: Product Image (Device Upload) */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider block">
                4. Product Photo
              </span>

              {/* Big Device Upload Button */}
              <button
                type="button"
                onClick={() => addImageInputRef.current?.click()}
                className="w-full py-3 px-3 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-blue-700 border border-blue-200/90 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 active:scale-95 transition-all shadow-xs"
              >
                <Camera className="w-4 h-4 text-blue-600" />
                <span>Choose Photo from Device / Gallery</span>
              </button>

              {/* Selected Preview Box */}
              <div className="flex items-center gap-2.5 p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                <img
                  src={formData.image || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&auto=format&fit=crop&q=60'}
                  alt="Preview"
                  className="w-13 h-13 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    placeholder="Or paste web image link..."
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="w-full px-2.5 py-2 text-[16px] sm:text-[11px] bg-white border border-slate-200 rounded-lg outline-none text-slate-700"
                  />
                  <span className="text-[9px] text-slate-400 block mt-1 truncate">
                    Photo from device or internet link
                  </span>
                </div>
              </div>

              {/* Quick cosmetic preset chips */}
              <div>
                <span className="text-[10px] text-slate-400 font-medium block mb-1.5">Quick Presets:</span>
                <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                  {[
                    { name: 'Lipstick', url: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&auto=format&fit=crop&q=60' },
                    { name: 'Serum', url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&auto=format&fit=crop&q=60' },
                    { name: 'Mascara', url: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400&auto=format&fit=crop&q=60' },
                    { name: 'Cream', url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&auto=format&fit=crop&q=60' },
                    { name: 'Perfume', url: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=400&auto=format&fit=crop&q=60' }
                  ].map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => setFormData({ ...formData, image: preset.url })}
                      className={`flex-shrink-0 px-2.5 py-1.5 rounded-xl text-[10px] font-bold border transition-all ${
                        formData.image === preset.url
                          ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* Locked Bottom Action Bar - Solid, Immobile */}
          <div className="flex-shrink-0 p-3 bg-white border-t border-slate-200 safe-bottom">
            <button
              type="button"
              onClick={handleSaveAdd}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold rounded-2xl shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>Save to Inventory</span>
            </button>
          </div>

        </div>
      )}

      {/* MODAL 2: EDIT PRODUCT (LOCKED, IMMOBILE, FULL-SCREEN APP VIEW) */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#f8fafc] flex flex-col w-full max-w-md mx-auto h-[100dvh] overflow-hidden overscroll-none touch-pan-y animate-in fade-in duration-150">
          
          {/* Locked Top Header */}
          <div className="flex-shrink-0 px-4 py-3 bg-slate-900 text-white flex items-center justify-between safe-top shadow-md">
            <div className="flex items-center space-x-2.5">
              <button
                type="button"
                onClick={() => {
                  setFormError('');
                  setIsEditModalOpen(false);
                }}
                className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center active:scale-95 transition-all"
                title="Back to Products"
              >
                <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
              </button>
              <div>
                <h3 className="text-sm font-black text-white leading-tight">Edit Product Details</h3>
                <p className="text-[10px] text-slate-400 font-semibold">Modify SKU & Stock</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSaveEdit}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-xs shadow-blue-500/25 transition-all flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Update</span>
            </button>
          </div>

          {/* Locked Vertical Scroll Content */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-3.5 space-y-3.5 overscroll-contain no-scrollbar">
            
            {/* Form Validation Error Banner */}
            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-2xl flex items-center gap-2 animate-in fade-in">
                <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* CARD 1: Basic Information */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider block">
                1. Product Information
              </span>

              {/* Product Name */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Product Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (formError) setFormError('');
                  }}
                  className="w-full px-3.5 py-2.5 text-[16px] sm:text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-blue-500 transition-colors font-medium text-slate-900"
                />
              </div>

              {/* Brand / Category */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Brand / Category</label>
                <select
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-[16px] sm:text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none font-semibold text-slate-800"
                >
                  {(categories.length > 0 ? categories : ['Skincare', 'Lipstick & Lip Care', 'General']).map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* CARD 2: Pricing & Stock */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider block">
                2. Pricing & Quantities
              </span>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-xs font-bold text-blue-700 block mb-1">Sale Price (Rs.) *</label>
                  <input
                    type="number"
                    value={formData.salePrice}
                    onChange={(e) => {
                      setFormData({ ...formData, salePrice: e.target.value });
                      if (formError) setFormError('');
                    }}
                    className="w-full px-3.5 py-2.5 text-[16px] sm:text-xs bg-blue-50/40 border border-blue-200 rounded-xl outline-none font-bold text-blue-700 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Cost Price (Rs.)</label>
                  <input
                    type="number"
                    value={formData.costPrice}
                    onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-[16px] sm:text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Current Stock</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-[16px] sm:text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-red-600 block mb-1">Low Stock Alert Count</label>
                  <input
                    type="number"
                    value={formData.lowStockThreshold}
                    onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-[16px] sm:text-xs bg-red-50/50 border border-red-200 rounded-xl outline-none font-bold text-red-700"
                  />
                </div>
              </div>
            </div>

            {/* CARD 3: Batch & Expiry */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider block">
                3. Batch & Expiry Date
              </span>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Batch ID</label>
                  <input
                    type="text"
                    value={formData.batchId}
                    onChange={(e) => setFormData({ ...formData, batchId: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-[16px] sm:text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-[16px] sm:text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium text-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* CARD 4: Product Image */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider block">
                4. Product Photo
              </span>

              {/* Big Device Upload Button */}
              <button
                type="button"
                onClick={() => editImageInputRef.current?.click()}
                className="w-full py-3 px-3 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-blue-700 border border-blue-200/90 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 active:scale-95 transition-all shadow-xs"
              >
                <Camera className="w-4 h-4 text-blue-600" />
                <span>Choose Photo from Device / Gallery</span>
              </button>

              {/* Selected Preview Box */}
              <div className="flex items-center gap-2.5 p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                <img
                  src={formData.image || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&auto=format&fit=crop&q=60'}
                  alt="Preview"
                  className="w-13 h-13 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    placeholder="Or paste web image link..."
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="w-full px-2.5 py-2 text-[16px] sm:text-[11px] bg-white border border-slate-200 rounded-lg outline-none text-slate-700"
                  />
                  <span className="text-[9px] text-slate-400 block mt-1 truncate">
                    Photo from device or internet link
                  </span>
                </div>
              </div>

              {/* Quick cosmetic preset chips */}
              <div>
                <span className="text-[10px] text-slate-400 font-medium block mb-1.5">Quick Presets:</span>
                <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                  {[
                    { name: 'Lipstick', url: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&auto=format&fit=crop&q=60' },
                    { name: 'Serum', url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&auto=format&fit=crop&q=60' },
                    { name: 'Mascara', url: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400&auto=format&fit=crop&q=60' },
                    { name: 'Cream', url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&auto=format&fit=crop&q=60' },
                    { name: 'Perfume', url: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=400&auto=format&fit=crop&q=60' }
                  ].map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => setFormData({ ...formData, image: preset.url })}
                      className={`flex-shrink-0 px-2.5 py-1.5 rounded-xl text-[10px] font-bold border transition-all ${
                        formData.image === preset.url
                          ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* Locked Bottom Action Bar */}
          <div className="flex-shrink-0 p-3 bg-white border-t border-slate-200 safe-bottom">
            <button
              type="button"
              onClick={handleSaveEdit}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold rounded-2xl shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>Update Product Details</span>
            </button>
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
