import React, { useState } from 'react';
import { 
  Package, 
  AlertTriangle, 
  Plus, 
  Minus, 
  Check, 
  Tag, 
  Sparkles, 
  ArrowRight, 
  Percent,
  SlidersHorizontal
} from 'lucide-react';

export default function DashboardPage({
  products,
  categories,
  selectedItems,
  onToggleSelectItem,
  onUpdateQuantity,
  onUpdateItemDiscount,
  onCreateOrder,
  activeCustomer,
  activeRep,
  activeMainShop,
  searchTerm
}) {
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [editingDiscountId, setEditingDiscountId] = useState(null);

  // Available brands / categories for horizontal sliding chips
  const brands = ['All', ...new Set(products.map(p => p.brand).filter(Boolean))];

  // Filter products by brand and search term
  const filteredProducts = products.filter(p => {
    const matchesBrand = selectedBrand === 'All' || p.brand === selectedBrand;
    const matchesSearch = !searchTerm || 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.batchId && p.batchId.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesBrand && matchesSearch;
  });

  // Calculate total selected count and approximate amount
  const selectedCount = Object.keys(selectedItems).length;
  const selectedTotal = Object.entries(selectedItems).reduce((sum, [id, itemData]) => {
    const prod = products.find(p => p.id === id);
    if (!prod) return sum;
    const discount = itemData.discount ?? prod.discount ?? 0;
    const discountedPrice = Math.max(0, prod.salePrice - (prod.salePrice * (discount / 100)));
    return sum + (discountedPrice * itemData.quantity);
  }, 0);

  return (
    <div className="pb-28 px-3 pt-2 space-y-3">
      
      {/* Session Breadcrumb Pill */}
      <div className="flex items-center justify-between bg-white px-3 py-2 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center space-x-2 truncate">
          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md uppercase">Order For</span>
          <span className="text-xs font-bold text-slate-800 truncate">{activeCustomer?.name}</span>
        </div>
        <span className="text-[10px] text-slate-400 font-medium">Rep: {activeRep?.name?.split(' ')[0]}</span>
      </div>

      {/* Brand / Category Horizontal Scrollable Chips ("brand name tika udin side karanna puluwan") */}
      <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-1">
        {brands.map((brand) => {
          const isSelected = selectedBrand === brand;
          return (
            <button
              key={brand}
              onClick={() => setSelectedBrand(brand)}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25 scale-102'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80 shadow-2xs'
              }`}
            >
              {brand}
            </button>
          );
        })}
      </div>

      {/* Products Inventory List */}
      <div className="space-y-2.5">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300 p-6">
            <Package className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-xs font-bold text-slate-700">No products found</p>
            <p className="text-[11px] text-slate-400 mt-1">Try another brand filter or add products in Product Manage</p>
          </div>
        ) : (
          filteredProducts.map((product) => {
            const isSelected = Boolean(selectedItems[product.id]);
            const currentQty = selectedItems[product.id]?.quantity || 1;
            const currentDiscount = selectedItems[product.id]?.discount ?? product.discount ?? 0;
            const isLowStock = product.stock <= (product.lowStockThreshold || 10);
            const discountedPrice = Math.round(product.salePrice * (1 - (currentDiscount / 100)));

            return (
              <div
                key={product.id}
                className={`relative bg-white rounded-2xl border transition-all duration-200 overflow-hidden shadow-2xs ${
                  isSelected
                    ? 'border-blue-500 ring-2 ring-blue-100 bg-blue-50/20 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Main Product Row */}
                <div className="p-3">
                  <div className="flex items-start space-x-3">
                    
                    {/* Tick Mark / Selection Checkbox */}
                    <button
                      type="button"
                      onClick={() => onToggleSelectItem(product)}
                      className={`mt-1 flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center border-2 transition-all duration-150 ${
                        isSelected
                          ? 'bg-blue-600 border-blue-600 text-white shadow-xs scale-105'
                          : 'border-slate-300 bg-slate-50 hover:border-blue-400'
                      }`}
                    >
                      {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                    </button>

                    {/* Product Image */}
                    <div className="relative flex-shrink-0">
                      <img
                        src={product.image || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=200&auto=format&fit=crop&q=60'}
                        alt={product.name}
                        className="w-16 h-16 rounded-xl object-cover border border-slate-100 shadow-2xs"
                      />
                      {currentDiscount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[9px] font-extrabold px-1.5 py-0.2 rounded-md shadow-2xs">
                          {currentDiscount}% OFF
                        </span>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                          {product.brand}
                        </span>
                        
                        {/* Stock status with RED Low Stock indicator */}
                        <div className="text-right">
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                            isLowStock 
                              ? 'bg-red-50 text-red-600 border border-red-200' 
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}>
                            Stock: {product.stock}
                          </span>
                        </div>
                      </div>

                      {/* Product Name */}
                      <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2">
                        {product.name}
                      </h4>

                      {/* Low Stock text in RED as required */}
                      {isLowStock && (
                        <div className="flex items-center gap-1 text-[10px] font-extrabold text-red-600 animate-pulse">
                          <AlertTriangle className="w-3 h-3 stroke-[2.5]" />
                          <span>LOW STOCK (Only {product.stock} left!)</span>
                        </div>
                      )}

                      {/* Prices & Adjustable Discount */}
                      <div className="flex items-center justify-between pt-1">
                        <div className="space-y-0.5">
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-xs font-extrabold text-slate-900">
                              Rs. {discountedPrice.toLocaleString()}
                            </span>
                            {currentDiscount > 0 && (
                              <span className="text-[10px] text-slate-400 line-through">
                                Rs. {product.salePrice.toLocaleString()}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 font-medium">
                            Cost: Rs. {product.costPrice?.toLocaleString() || 0}
                          </p>
                        </div>

                        {/* Adjustable Discount Button / Input */}
                        <div className="flex items-center gap-1">
                          {editingDiscountId === product.id ? (
                            <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-300">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={currentDiscount}
                                onChange={(e) => onUpdateItemDiscount(product.id, Math.min(100, Math.max(0, Number(e.target.value))))}
                                className="w-10 px-1 py-0.5 text-center text-xs font-bold bg-white rounded border border-slate-200 outline-none"
                              />
                              <span className="text-[10px] font-bold text-slate-500 px-1">%</span>
                              <button
                                onClick={() => setEditingDiscountId(null)}
                                className="text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded font-bold"
                              >
                                ✓
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setEditingDiscountId(product.id)}
                              className="flex items-center gap-0.5 px-2 py-1 text-[10px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-colors"
                              title="Adjust item discount"
                            >
                              <Percent className="w-3 h-3 text-amber-600" />
                              <span>{currentDiscount}% Disc</span>
                            </button>
                          )}
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Quantity Stepper (- qty +) - ACTIVATES WHEN ITEM IS TICKED / SELECTED */}
                  {isSelected && (
                    <div className="mt-3 pt-2.5 border-t border-blue-100 flex items-center justify-between bg-blue-50/40 -mx-3 -mb-3 px-3 py-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-extrabold text-blue-900">Order Qty:</span>
                        <span className="text-[11px] text-blue-700 font-medium">
                          (Subtotal: Rs. {(discountedPrice * currentQty).toLocaleString()})
                        </span>
                      </div>

                      <div className="flex items-center space-x-1.5 bg-white p-0.5 rounded-xl border border-blue-200 shadow-2xs">
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(product.id, Math.max(1, currentQty - 1))}
                          className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold transition-all active:scale-95"
                        >
                          <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                        <span className="w-8 text-center text-xs font-extrabold text-slate-900">
                          {currentQty}
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(product.id, currentQty + 1)}
                          disabled={currentQty >= product.stock}
                          className="w-7 h-7 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white flex items-center justify-center font-bold transition-all active:scale-95 shadow-2xs"
                        >
                          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Floating Sticky Bottom Bar: "Create Order" (when at least 1 item is ticked) */}
      {selectedCount > 0 && (
        <div className="fixed bottom-0 inset-x-0 z-40 p-3 max-w-md mx-auto">
          <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white p-3.5 rounded-2xl shadow-2xl border border-blue-400/40 flex items-center justify-between backdrop-blur-md">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-white text-blue-600 text-xs font-extrabold flex items-center justify-center">
                  {selectedCount}
                </span>
                <span className="text-xs font-bold text-blue-100">Items Selected</span>
              </div>
              <p className="text-sm font-extrabold text-white mt-0.5">
                Rs. {Math.round(selectedTotal).toLocaleString()}
              </p>
            </div>

            <button
              onClick={onCreateOrder}
              className="flex items-center gap-2 px-5 py-2.5 bg-white text-blue-700 hover:bg-blue-50 font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-95 group"
            >
              <span>Create Order</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
