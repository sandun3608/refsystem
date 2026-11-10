import React, { useState } from 'react';
import { 
  ShoppingBag, 
  ChevronDown, 
  ChevronUp, 
  Calendar, 
  Clock, 
  CheckCircle, 
  CreditCard, 
  Banknote, 
  Download, 
  Printer, 
  AlertCircle, 
  Store, 
  User, 
  Check, 
  MessageCircle, 
  Truck, 
  Sparkles,
  MapPin,
  Tag,
  Percent,
  Share2
} from 'lucide-react';
import { generateOrderPDF, openPrintableInvoice } from '../utils/pdfGenerator';

export default function OrdersPage({ 
  orders = [], 
  onUpdateStatus, 
  searchTerm = '' 
}) {
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [selectedOrderIds, setSelectedOrderIds] = useState([]);
  const [filterStatus, setFilterStatus] = useState('All'); // All, Processing, Delivered
  const [downloadFeedback, setDownloadFeedback] = useState('');

  // Check if a payment due date is approaching (within 3 days or today or overdue)
  const isPaymentDueSoon = (order) => {
    if (order.isInstantPay || order.paymentMethod === 'Instant Pay') return false;
    const dueDateStr = order.paymentDueDate || (order.paymentMethod === 'Cheque' ? order.chequeDetails?.chequeDate : null);
    if (!dueDateStr) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(dueDateStr);
    dueDate.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
    return diffDays <= 3; // within 3 days or overdue
  };

  const getPaymentDueText = (order) => {
    const isCheque = order.paymentMethod === 'Cheque';
    const dueDateStr = order.paymentDueDate || (isCheque ? order.chequeDetails?.chequeDate : null);
    if (!dueDateStr) return '';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(dueDateStr);
    dueDate.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
    const prefix = isCheque ? 'Cheque Due' : 'Cash Due';
    if (diffDays < 0) return `${prefix} Overdue by ${Math.abs(diffDays)} days!`;
    if (diffDays === 0) return `${prefix} TODAY!`;
    if (diffDays === 1) return `${prefix} Tomorrow!`;
    return `${prefix} in ${diffDays} days (${dueDateStr})`;
  };

  // Toggle single order expand
  const toggleExpand = (id) => {
    setExpandedOrderId(prev => prev === id ? null : id);
  };

  // Toggle checkbox select for multi-select
  const toggleSelectOrder = (id, e) => {
    e.stopPropagation();
    setSelectedOrderIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // Select all / Deselect all
  const toggleSelectAll = () => {
    if (selectedOrderIds.length === filteredOrders.length) {
      setSelectedOrderIds([]);
    } else {
      setSelectedOrderIds(filteredOrders.map(o => o.id));
    }
  };

  // Helper date formatter: e.g. "Nov 10, 2026"
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (e) {
      return dateStr;
    }
  };

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesFilter = filterStatus === 'All' || order.status === filterStatus;
    const matchesSearch = !searchTerm ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.repName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.deliveryId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.batchNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Single order PDF download with visual feedback
  const handleSingleDownload = (order, e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    setDownloadFeedback(`Generating PDF invoice for ${order.id}...`);
    setTimeout(() => {
      generateOrderPDF(order);
      setDownloadFeedback(`✅ PDF Invoice for ${order.id} downloaded!`);
      setTimeout(() => setDownloadFeedback(''), 4000);
    }, 150);
  };

  // Bulk download
  const handleBulkDownload = () => {
    const ordersToDownload = orders.filter(o => selectedOrderIds.includes(o.id));
    if (ordersToDownload.length === 0) return;
    setDownloadFeedback(`Downloading ${ordersToDownload.length} Invoice PDFs...`);
    ordersToDownload.forEach((ord, index) => {
      setTimeout(() => {
        generateOrderPDF(ord);
      }, index * 400);
    });
    setTimeout(() => {
      setDownloadFeedback(`✅ ${ordersToDownload.length} Invoice PDFs downloaded!`);
      setTimeout(() => setDownloadFeedback(''), 4000);
    }, ordersToDownload.length * 400 + 400);
  };

  // Format WhatsApp Message
  const handleShareWhatsApp = (order, e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    const lines = [
      `*LUMI COSMETICS INVOICE* 💄`,
      `*Order ID:* ${order.id}`,
      `*Date:* ${formatDate(order.orderDate || order.deliveryDate)}`,
      `*Customer Shop:* ${order.customerName}`,
      `*Address:* ${order.customerAddress || 'N/A'}`,
      `*Delivery Rep:* ${order.repName || 'Direct'}`,
      `*Delivery ID:* ${order.deliveryId || order.batchNumber || '000001'}`,
      `*Delivery Date:* ${order.deliveryDate || 'N/A'}`,
      `*Payment:* ${order.isInstantPay ? 'Instant Pay (Paid in Full Today)' : order.paymentMethod}`,
      ...(order.chequeDetails ? [`*Cheque Due:* ${order.chequeDetails.chequeDate} (${order.chequeDetails.bankName})`] : []),
      ...(!order.isInstantPay && order.paymentMethod === 'Cash' && order.paymentDueDate ? [`*Cash Due:* ${order.paymentDueDate}`] : []),
      `----------------------------`,
      `*ITEMS:*`,
      ...(order.items || []).map(i => {
        const discountStr = i.discount > 0 ? ` (${i.discount}% off)` : '';
        return `• ${i.name} - Qty: ${i.quantity} @ Rs. ${i.salePrice?.toLocaleString()}${discountStr} = Rs. ${i.lineTotal?.toLocaleString()}`;
      }),
      `----------------------------`,
      `*Subtotal:* Rs. ${(order.subtotal || order.netTotal)?.toLocaleString()}`,
      ...(order.overallDiscount > 0 ? [`*Overall Discount:* -Rs. ${order.overallDiscount?.toLocaleString()}`] : []),
      `*TOTAL PAYABLE:* Rs. ${order.netTotal?.toLocaleString()}`,
      `*Status:* ${order.status?.toUpperCase()}`
    ];
    const encoded = encodeURIComponent(lines.join('\n'));
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  return (
    <div className="pb-28 px-3 pt-2 space-y-3.5 max-w-md mx-auto">
      
      {/* Top Filter Chips & Selection Bar */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-1.5 bg-slate-200/80 p-1 rounded-2xl">
          {['All', 'Processing', 'Delivered'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all duration-200 ${
                filterStatus === status
                  ? 'bg-white text-blue-700 shadow-xs scale-102'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {filteredOrders.length > 0 && (
          <button
            onClick={toggleSelectAll}
            className="text-[11px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200/80 transition-all active:scale-95"
          >
            {selectedOrderIds.length === filteredOrders.length && filteredOrders.length > 0
              ? 'Deselect All'
              : 'Select All'}
          </button>
        )}
      </div>

      {/* Download Status Toast / Alert */}
      {downloadFeedback && (
        <div className="p-3 bg-emerald-600 text-white text-xs font-bold rounded-2xl shadow-lg flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
            <span>{downloadFeedback}</span>
          </div>
          <button 
            onClick={() => setDownloadFeedback('')}
            className="text-white/80 hover:text-white text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Floating Action Bar when orders are ticked/selected */}
      {selectedOrderIds.length > 0 && (
        <div className="p-3 bg-gradient-to-r from-blue-700 to-indigo-700 text-white rounded-2xl shadow-xl flex items-center justify-between animate-in slide-in-from-top duration-200">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-white text-blue-700 text-xs font-extrabold flex items-center justify-center">
              {selectedOrderIds.length}
            </span>
            <span className="text-xs font-bold text-blue-100">Orders Selected</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleBulkDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-blue-700 rounded-xl text-xs font-bold shadow-xs hover:bg-blue-50 active:scale-95 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
          </div>
        </div>
      )}

      {/* Orders List */}
      <div className="space-y-3">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-300 p-6 shadow-xs">
            <ShoppingBag className="w-12 h-12 mx-auto text-slate-300 mb-2.5" />
            <h3 className="text-sm font-bold text-slate-800">No orders found</h3>
            <p className="text-xs text-slate-400 mt-1">
              {searchTerm ? 'No orders match your search criteria' : 'Create a new order from the Inventory page'}
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const isExpanded = expandedOrderId === order.id;
            const isSelected = selectedOrderIds.includes(order.id);
            const paymentAlert = isPaymentDueSoon(order);
            const isDelivered = order.status === 'Delivered';
            const orderDateStr = formatDate(order.orderDate || order.deliveryDate);
            const itemCount = order.items?.length || 0;

            return (
              <div
                key={order.id}
                className={`bg-white rounded-3xl border transition-all duration-300 overflow-hidden shadow-xs hover:shadow-md ${
                  isSelected 
                    ? 'border-blue-500 ring-2 ring-blue-100' 
                    : isExpanded 
                    ? 'border-blue-400/80 shadow-md ring-1 ring-blue-50' 
                    : 'border-slate-200/90 hover:border-slate-300'
                }`}
              >
                {/* 
                  INITIAL (COLLAPSED) VIEW:
                  User requirement:
                  "order id date , order stetus ,print icon, shop name saha total cost and items witarak mulinma penna one."
                */}
                <div 
                  onClick={() => toggleExpand(order.id)}
                  className="p-4 cursor-pointer select-none transition-colors hover:bg-slate-50/60 active:bg-slate-100/50"
                >
                  {/* Top Line: Order ID, Date, Order Status Badge, Print Icon */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    
                    {/* Left: Checkbox (optional multi-select), Order ID & Date */}
                    <div className="flex items-center space-x-2 min-w-0">
                      <button
                        type="button"
                        onClick={(e) => toggleSelectOrder(order.id, e)}
                        className={`w-4 h-4 rounded-md flex items-center justify-center border transition-all flex-shrink-0 ${
                          isSelected
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'border-slate-300 bg-slate-50 hover:border-blue-400'
                        }`}
                        title="Select order"
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </button>

                      {/* Order ID */}
                      <span className="text-[11px] font-black text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-100/80 font-mono tracking-tight">
                        {order.id}
                      </span>

                      {/* Date */}
                      <span className="text-[11px] font-semibold text-slate-500 truncate flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400 flex-shrink-0" />
                        <span>{orderDateStr}</span>
                      </span>
                    </div>

                    {/* Right: Order Status Badge & Quick Print Icon */}
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      
                      {/* Order Status Badge */}
                      <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 border ${
                        isDelivered
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isDelivered ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                        <span>{order.status}</span>
                      </span>

                      {/* Quick Print Icon ("print icon") */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openPrintableInvoice(order);
                        }}
                        className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-blue-600 text-slate-600 hover:text-white flex items-center justify-center transition-all duration-200 shadow-2xs active:scale-90"
                        title="Quick Print Invoice"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </div>

                  </div>

                  {/* Middle Line: Shop Name */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center space-x-2 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center flex-shrink-0">
                        <Store className="w-4 h-4 text-indigo-600" />
                      </div>
                      <h3 className="text-sm font-extrabold text-slate-900 truncate">
                        {order.customerName || order.mainShopName || 'Customer Outlet'}
                      </h3>
                    </div>

                    {/* Payment due alert pill if approaching */}
                    {paymentAlert && (
                      <span className="px-2 py-0.5 rounded-md bg-amber-500 text-white text-[9px] font-bold flex items-center gap-1 animate-pulse flex-shrink-0">
                        <AlertCircle className="w-3 h-3 stroke-[2.5]" />
                        <span>Due Soon</span>
                      </span>
                    )}
                  </div>

                  {/* Bottom Line: Total Cost & Total Items count */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <div className="flex items-baseline space-x-1.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total:</span>
                      <span className="text-base font-black text-slate-900 tracking-tight">
                        Rs. {order.netTotal?.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                        {itemCount} {itemCount === 1 ? 'Item' : 'Items'}
                      </span>
                      <div className={`w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 transition-transform duration-300 ${
                        isExpanded ? 'rotate-180 bg-blue-50 text-blue-600' : ''
                      }`}>
                        <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
                      </div>
                    </div>
                  </div>

                </div>

                {/* 
                  EXPANDED VIEW (When touched / clicked):
                  User requirement:
                  "ita passe eka toch karama me tika lassnata pallahata enna order dapu item eke name eka, quantity gaana, ekk watuna gaana , saha okkogema cost eka , okkogema discount eka wage deal ganna. ita passe adress ref details danna . ita passe print sahre button lassnata danna . lassnata pahadili aluth ui ekk ganna."
                */}
                {isExpanded && (
                  <div className="border-t border-slate-100 bg-[#f8fafc] p-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    
                    {/* 1. ORDERED ITEMS DETAILS LIST ("order dapu item eke name eka, quantity gaana, ekk watuna gaana...") */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between px-1">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                          <ShoppingBag className="w-3.5 h-3.5 text-blue-600" />
                          <span>Ordered Items ({order.items?.length || 0})</span>
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold">Qty & Unit Pricing</span>
                      </div>

                      <div className="space-y-2">
                        {(order.items || []).map((item, idx) => (
                          <div 
                            key={idx}
                            className="p-3 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-2 transition-all hover:border-blue-200"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0 flex-1">
                                <span className="text-[9px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md inline-block mb-1">
                                  {item.brand || 'General'}
                                </span>
                                <h4 className="text-xs font-extrabold text-slate-900 leading-snug">
                                  {item.name}
                                </h4>
                              </div>

                              {/* Line Total */}
                              <div className="text-right flex-shrink-0">
                                <span className="text-xs font-black text-slate-900">
                                  Rs. {item.lineTotal?.toLocaleString()}
                                </span>
                              </div>
                            </div>

                            {/* Item Price, Quantity & Discount row */}
                            <div className="flex items-center justify-between text-[11px] bg-slate-50 p-2 rounded-xl border border-slate-100">
                              <div className="text-slate-600 flex items-center gap-1.5">
                                <span className="text-slate-400">Unit Price:</span>
                                <strong className="font-semibold text-slate-800">Rs. {item.salePrice?.toLocaleString()}</strong>
                              </div>

                              <div className="text-slate-600 flex items-center gap-1.5">
                                <span className="text-slate-400">Qty:</span>
                                <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 font-bold text-slate-900">
                                  {item.quantity}
                                </span>
                              </div>

                              {item.discount > 0 ? (
                                <div className="text-emerald-700 font-bold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                  <Percent className="w-3 h-3 text-emerald-600" />
                                  <span>{item.discount}% Off</span>
                                </div>
                              ) : (
                                <span className="text-[10px] text-slate-400 font-medium">Standard</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 2. ORDER FINANCIAL SUMMARY & DEALS ("okkogema cost eka , okkogema discount eka") */}
                    <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
                      <div className="flex items-center justify-between text-xs text-slate-600">
                        <span className="text-slate-400">Items Subtotal:</span>
                        <span className="font-bold text-slate-800">
                          Rs. {(order.subtotal || order.netTotal)?.toLocaleString()}
                        </span>
                      </div>

                      {order.overallDiscount > 0 && (
                        <div className="flex items-center justify-between text-xs text-emerald-700 bg-emerald-50/70 p-2 rounded-xl border border-emerald-200/80">
                          <span className="flex items-center gap-1 font-bold">
                            <Tag className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Overall Deal / Discount:</span>
                          </span>
                          <span className="font-extrabold">
                            - Rs. {order.overallDiscount?.toLocaleString()}
                          </span>
                        </div>
                      )}

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wide">
                          Final Net Cost:
                        </span>
                        <span className="text-base font-black text-blue-700">
                          Rs. {order.netTotal?.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* 3. ADDRESS & REF DETAILS ("ita passe adress ref details danna") */}
                    <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2.5">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block px-0.5">
                        Address & Distribution Logistics
                      </span>

                      {/* Customer Address */}
                      <div className="flex items-start space-x-2.5 text-xs">
                        <div className="w-6 h-6 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-rose-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] text-slate-400 block font-bold uppercase">Customer Address</span>
                          <p className="font-semibold text-slate-800 text-xs leading-relaxed">
                            {order.customerAddress || 'Direct counter sale / Store pickup'}
                          </p>
                        </div>
                      </div>

                      {/* Delivery Rep Details */}
                      <div className="flex items-start space-x-2.5 text-xs pt-2 border-t border-slate-100">
                        <div className="w-6 h-6 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <User className="w-3.5 h-3.5 text-emerald-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] text-slate-400 block font-bold uppercase">Delivery Rep Details</span>
                          <p className="font-bold text-slate-800 text-xs">
                            {order.repName || 'Direct / Store Team'}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                            <span>Delivery ID: <strong className="font-mono text-blue-700">{order.deliveryId || order.batchNumber || '000001'}</strong></span>
                            {order.deliveryDate && (
                              <>
                                <span>•</span>
                                <span>Delivery Date: <strong>{order.deliveryDate}</strong></span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Payment Method / Terms */}
                      <div className="pt-2 border-t border-slate-100 space-y-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Payment Option:</span>
                          <span className="font-bold text-slate-800 flex items-center gap-1">
                            {order.isInstantPay ? (
                              <span className="text-emerald-700 font-extrabold flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-emerald-600" />
                                Instant Pay (Paid in Full)
                              </span>
                            ) : order.paymentMethod === 'Cash' ? (
                              <span className="text-emerald-700 flex items-center gap-1">
                                <Banknote className="w-3.5 h-3.5" />
                                Cash
                              </span>
                            ) : (
                              <span className="text-indigo-700 flex items-center gap-1">
                                <CreditCard className="w-3.5 h-3.5" />
                                Cheque
                              </span>
                            )}
                          </span>
                        </div>

                        {/* Due Date Particulars if applicable */}
                        {!order.isInstantPay && order.paymentMethod === 'Cash' && order.paymentDueDate && (
                          <div className="flex items-center justify-between text-[11px] text-amber-700 bg-amber-50 p-2 rounded-xl border border-amber-200">
                            <span>Cash Due Date:</span>
                            <strong className="font-mono">{order.paymentDueDate}</strong>
                          </div>
                        )}

                        {!order.isInstantPay && order.paymentMethod === 'Cheque' && order.chequeDetails && (
                          <div className="text-[11px] text-indigo-900 bg-indigo-50 p-2.5 rounded-xl border border-indigo-200 space-y-1">
                            <div className="flex justify-between">
                              <span className="text-indigo-600">Cheque Info:</span>
                              <strong>{order.chequeDetails.bankName} - #{order.chequeDetails.chequeNumber}</strong>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-indigo-600">Cheque Date:</span>
                              <strong className="text-amber-800">{order.chequeDetails.chequeDate}</strong>
                            </div>
                          </div>
                        )}
                      </div>

                    </div>

                    {/* 4. DELIVERY STATUS SWITCHER */}
                    <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block px-0.5">
                        Delivery Fulfillment Status
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => onUpdateStatus(order.id, 'Processing')}
                          className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95 ${
                            order.status === 'Processing'
                              ? 'bg-amber-500 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>Processing</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => onUpdateStatus(order.id, 'Delivered')}
                          className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95 ${
                            order.status === 'Delivered'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Delivered</span>
                        </button>
                      </div>
                    </div>

                    {/* 5. PRINT & SHARE ACTION BUTTONS ("ita passe print sahre button lassnata danna") */}
                    <div className="grid grid-cols-3 gap-2 pt-1">
                      
                      {/* Print Bill Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openPrintableInvoice(order);
                        }}
                        className="py-3 px-2 bg-slate-900 hover:bg-black text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-slate-900/15 active:scale-95 transition-all"
                        title="Print Order / View Printable Bill"
                      >
                        <Printer className="w-4 h-4 text-slate-200" />
                        <span>Print Bill</span>
                      </button>

                      {/* WhatsApp Share Button */}
                      <button
                        type="button"
                        onClick={(e) => handleShareWhatsApp(order, e)}
                        className="py-3 px-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
                        title="Share on WhatsApp"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>Share</span>
                      </button>

                      {/* Download PDF Button */}
                      <button
                        type="button"
                        onClick={(e) => handleSingleDownload(order, e)}
                        className="py-3 px-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/20 active:scale-95 transition-all"
                        title="Download PDF to Device"
                      >
                        <Download className="w-4 h-4" />
                        <span>PDF</span>
                      </button>

                    </div>

                  </div>
                )}

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
