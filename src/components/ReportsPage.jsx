import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Package, 
  Coins, 
  ShoppingBag, 
  DollarSign, 
  AlertTriangle, 
  CreditCard, 
  Banknote, 
  Layers, 
  Sparkles,
  ArrowUpRight
} from 'lucide-react';

export default function ReportsPage({ products, orders, customers }) {
  // 1. Calculations for Top KPI Cards
  const totalItemCount = products.reduce((acc, p) => acc + (Number(p.stock) || 0), 0);
  const totalCost = products.reduce((acc, p) => acc + ((Number(p.costPrice) || 0) * (Number(p.stock) || 0)), 0);
  const totalSaleValue = products.reduce((acc, p) => acc + ((Number(p.salePrice) || 0) * (Number(p.stock) || 0)), 0);
  const marginPercentage = totalCost > 0 ? Math.round(((totalSaleValue - totalCost) / totalCost) * 100) : 0;
  
  const totalOrdersCount = orders.length;
  
  // Realized Sales & Profit from orders
  const totalSalesRevenue = orders.reduce((acc, o) => acc + (Number(o.netTotal) || 0), 0);
  const totalOrdersCost = orders.reduce((acc, o) => {
    const orderCost = (o.items || []).reduce((sum, item) => sum + ((Number(item.costPrice) || 0) * (Number(item.quantity) || 0)), 0);
    return acc + orderCost;
  }, 0);
  const totalProfit = Math.max(0, totalSalesRevenue - totalOrdersCost);

  // 2. Brand Stock Breakdown
  const brandStockMap = {};
  products.forEach(p => {
    const b = p.brand || 'Other';
    brandStockMap[b] = (brandStockMap[b] || 0) + (Number(p.stock) || 0);
  });
  const brandStockList = Object.entries(brandStockMap).sort((a, b) => b[1] - a[1]);
  const maxBrandStock = Math.max(...brandStockList.map(b => b[1]), 1);

  // 3. Customer Shops ordered from LOW to HIGH ("customer shop walin order ganna widiya adu eke wadi ekata enakm bar dala")
  const customerOrdersMap = {};
  customers.forEach(c => {
    customerOrdersMap[c.name] = 0;
  });
  orders.forEach(o => {
    const name = o.customerName || 'Unknown';
    customerOrdersMap[name] = (customerOrdersMap[name] || 0) + (Number(o.netTotal) || 0);
  });
  const customerRankedLowToHigh = Object.entries(customerOrdersMap).sort((a, b) => a[1] - b[1]);
  const maxCustomerVal = Math.max(...customerRankedLowToHigh.map(c => c[1]), 1);

  // 4. Low stock products set ("low stock product set eka")
  const lowStockProducts = products.filter(p => p.stock <= (p.lowStockThreshold || 10));

  // 5. Brand Sales Breakdown ("brand walin product wikinena widiaya")
  const brandSalesMap = {};
  orders.forEach(o => {
    (o.items || []).forEach(item => {
      const b = item.brand || 'Other';
      brandSalesMap[b] = (brandSalesMap[b] || 0) + (Number(item.lineTotal) || 0);
    });
  });
  const brandSalesList = Object.entries(brandSalesMap).sort((a, b) => b[1] - a[1]);
  const maxBrandSales = Math.max(...brandSalesList.map(b => b[1]), 1);

  // 6. Cash & Instant vs Cheque Totals
  const cashTotal = orders.filter(o => o.paymentMethod === 'Cash' || o.paymentMethod === 'Instant Pay' || o.isInstantPay).reduce((sum, o) => sum + (Number(o.netTotal) || 0), 0);
  const chequeTotal = orders.filter(o => o.paymentMethod === 'Cheque').reduce((sum, o) => sum + (Number(o.netTotal) || 0), 0);
  const totalPayments = cashTotal + chequeTotal;
  const cashPercent = totalPayments > 0 ? Math.round((cashTotal / totalPayments) * 100) : 50;
  const chequePercent = totalPayments > 0 ? (100 - cashPercent) : 50;

  return (
    <div className="pb-28 px-3 pt-2 space-y-4 max-w-md mx-auto">
      
      {/* Top Header */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white rounded-3xl p-4 shadow-lg shadow-blue-500/10 space-y-1">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-[10px] font-bold">
            <BarChart3 className="w-3 h-3" />
            <span>Distribution Intelligence</span>
          </div>
          <span className="text-[10px] text-blue-200">Live Analytics</span>
        </div>
        <h2 className="text-base font-extrabold tracking-tight">Business Reports & Insights</h2>
        <p className="text-xs text-blue-100">Inventory valuation, order profits, and payment flows</p>
      </div>

      {/* 5 TOP KPI CARDS */}
      <div className="grid grid-cols-2 gap-2.5">
        
        {/* Total Items */}
        <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Stock Pcs</span>
            <Package className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-lg font-black text-slate-900">{totalItemCount.toLocaleString()}</p>
          <span className="text-[10px] text-slate-400 font-medium">{products.length} Unique SKUs</span>
        </div>

        {/* Total Stock Cost */}
        <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Inventory Cost</span>
            <Coins className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-lg font-black text-slate-900">Rs. {Math.round(totalCost / 1000)}k</p>
          <span className="text-[10px] text-slate-400 font-medium">Rs. {totalCost.toLocaleString()}</span>
        </div>

        {/* Inventory Value & Margin */}
        <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Sale Value</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-lg font-black text-slate-900">Rs. {Math.round(totalSaleValue / 1000)}k</p>
          <span className="text-[10px] text-emerald-600 font-bold">+{marginPercentage}% Profit Margin</span>
        </div>

        {/* Orders & Profit */}
        <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Realized Profit</span>
            <DollarSign className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-lg font-black text-indigo-700">Rs. {totalProfit.toLocaleString()}</p>
          <span className="text-[10px] text-slate-400 font-medium">{totalOrdersCount} Total Orders</span>
        </div>

      </div>

      {/* GRAPH 1: CASH VS CHEQUE BREAKDOWN ("chek walata keeayak gannwada , koccharak cash karanwada kiyalath ona") */}
      <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <CreditCard className="w-4 h-4 text-blue-600" />
            <span>Cash vs Cheque Collection Breakdown</span>
          </h3>
          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
            Rs. {totalPayments.toLocaleString()}
          </span>
        </div>

        {/* Multi-segmented Progress Bar */}
        <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
          <div 
            style={{ width: `${cashPercent}%` }} 
            className="bg-emerald-500 h-full transition-all duration-500 relative group"
            title={`Cash: Rs. ${cashTotal.toLocaleString()}`}
          />
          <div 
            style={{ width: `${chequePercent}%` }} 
            className="bg-blue-600 h-full transition-all duration-500 relative group"
            title={`Cheque: Rs. ${chequeTotal.toLocaleString()}`}
          />
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
          <div className="p-2.5 bg-emerald-50/70 border border-emerald-100 rounded-xl">
            <div className="flex items-center gap-1.5 text-emerald-800 font-bold mb-0.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>Cash ({cashPercent}%)</span>
            </div>
            <p className="text-sm font-extrabold text-emerald-900">Rs. {cashTotal.toLocaleString()}</p>
          </div>

          <div className="p-2.5 bg-blue-50/70 border border-blue-100 rounded-xl">
            <div className="flex items-center gap-1.5 text-blue-800 font-bold mb-0.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
              <span>Cheque ({chequePercent}%)</span>
            </div>
            <p className="text-sm font-extrabold text-blue-900">Rs. {chequeTotal.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* GRAPH 2: CUSTOMER SHOPS ORDER VOLUME (RANKED LOW TO HIGH) ("customer shop walin order ganna widiya adu eke wadi ekata enakm bar dala") */}
      <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <ArrowUpRight className="w-4 h-4 text-purple-600" />
            <span>Orders by Customer Shop (Low to High)</span>
          </h3>
          <span className="text-[10px] text-slate-400 font-medium">Ranked volume</span>
        </div>

        <div className="space-y-2.5 pt-1">
          {customerRankedLowToHigh.map(([custName, val], idx) => {
            const pct = Math.max(5, Math.round((val / maxCustomerVal) * 100));
            return (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-slate-800 truncate max-w-[200px]">{custName}</span>
                  <span className="font-extrabold text-purple-700">Rs. {val.toLocaleString()}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    style={{ width: `${pct}%` }}
                    className="h-full bg-gradient-to-r from-purple-400 to-indigo-600 rounded-full transition-all duration-500"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* GRAPH 3: BRAND STOCK DISTRIBUTION ("brand wala stock") */}
      <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-blue-600" />
            <span>Current Stock by Brand Category</span>
          </h3>
          <span className="text-[10px] text-slate-400 font-medium">In Warehouse</span>
        </div>

        <div className="space-y-2 pt-1">
          {brandStockList.map(([brand, stock], idx) => {
            const pct = Math.max(8, Math.round((stock / maxBrandStock) * 100));
            return (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-700 truncate">{brand}</span>
                  <span className="font-bold text-slate-900">{stock} units</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    style={{ width: `${pct}%` }}
                    className="h-full bg-blue-600 rounded-full transition-all duration-500"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* GRAPH 4: BRAND SALES DISTRIBUTION ("brand walin product wikinena widiaya") */}
      <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span>Product Sales Demand by Brand</span>
          </h3>
          <span className="text-[10px] text-slate-400 font-medium">Bestselling</span>
        </div>

        <div className="space-y-2 pt-1">
          {brandSalesList.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-2">No brand sales data yet</p>
          ) : (
            brandSalesList.map(([brand, rev], idx) => {
              const pct = Math.max(8, Math.round((rev / maxBrandSales) * 100));
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-700 truncate">{brand}</span>
                    <span className="font-extrabold text-emerald-700">Rs. {rev.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      style={{ width: `${pct}%` }}
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* SECTION 5: LOW STOCK PRODUCTS WATCHLIST ("low stock product set eka") */}
      <div className="p-4 bg-white rounded-3xl border border-red-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-extrabold text-red-600 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4" />
            <span>Low Stock Critical Watchlist ({lowStockProducts.length})</span>
          </h3>
          <span className="text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
            Re-order Needed
          </span>
        </div>

        {lowStockProducts.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-2">All product stocks are healthy!</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {lowStockProducts.map((p) => (
              <div key={p.id} className="py-2.5 flex items-center justify-between text-xs">
                <div className="min-w-0 pr-2">
                  <span className="text-[9px] font-bold text-red-500 uppercase">{p.brand}</span>
                  <p className="font-bold text-slate-900 truncate">{p.name}</p>
                  <p className="text-[10px] text-slate-400">Batch: {p.batchId} • Cost: Rs. {p.costPrice}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-xs font-black text-red-600 bg-red-50 px-2 py-1 rounded-lg border border-red-200 block">
                    {p.stock} Left
                  </span>
                  <span className="text-[9px] text-slate-400">Min: {p.lowStockThreshold || 10}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
