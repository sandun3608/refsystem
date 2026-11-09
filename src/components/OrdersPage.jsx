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
  Share2, 
  Download, 
  Printer, 
  AlertCircle, 
  Store, 
  User, 
  Layers, 
  Check, 
  Send,
  MessageCircle,
  Truck,
  Sparkles
} from 'lucide-react';
import { generateOrderPDF, openPrintableInvoice } from '../utils/pdfGenerator';

export default function OrdersPage({ 
  orders, 
  onUpdateStatus, 
  searchTerm 
}) {
  const [expandedOrderId, setExpandedOrderId] = useState(orders[0]?.id || null);
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
  const handleSingleDownload = (order) => {
    setDownloadFeedback(`Generating PDF invoice for ${order.id}...`);
    setTimeout(() => {
      generateOrderPDF(order);
      setDownloadFeedback(`✅ PDF Invoice for ${order.id} downloaded!`);
      setTimeout(() => setDownloadFeedback(''), 4000);
    }, 150);
  };

  // Bulk actions
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
  const handleShareWhatsApp = (order) => {
    const lines = [
      `*LUMI COSMETICS INVOICE* 💄`,
      `*Order ID:* ${order.id}`,
      `*Customer Shop:* ${order.customerName}`,
      `*Address:* ${order.customerAddress}`,
      `*Delivery Rep:* ${order.repName}`,
      `*Delivery ID:* ${order.deliveryId || order.batchNumber}`,
      `*Delivery Date:* ${order.deliveryDate}`,
      `*Payment:* ${order.isInstantPay ? 'Instant Pay (Paid in Full Today)' : order.paymentMethod}`,
      ...(order.chequeDetails ? [`*Cheque Due:* ${order.chequeDetails.chequeDate} (${order.chequeDetails.bankName})`] : []),
      ...(!order.isInstantPay && order.paymentMethod === 'Cash' && order.paymentDueDate ? [`*Cash Due:* ${order.paymentDueDate}`] : []),
      `----------------------------`,
      `*ITEMS:*`,
      ...(order.items || []).map(i => `• ${i.name} (${i.brand}) - ${i.quantity} pcs @ Rs. ${i.salePrice} = Rs. ${i.lineTotal.toLocaleString()}`),
      `----------------------------`,
      ...(order.overallDiscount > 0 ? [`*Discount:* -Rs. ${order.overallDiscount.toLocaleString()}`] : []),
      `*TOTAL PAYABLE:* Rs. ${order.netTotal.toLocaleString()}`,
      `*Status:* ${order.status.toUpperCase()}`
    ];
    const encoded = encodeURIComponent(lines.join('\n'));
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  return (
    <div className="pb-28 px-3 pt-2 space-y-3.5 max-w-md mx-auto">
      
      {/* Top Filter Chips */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-1.5 bg-slate-200/80 p-1 rounded-xl">
          {['All', 'Processing', 'Delivered'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                filterStatus === status
                  ? 'bg-white text-blue-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        <button
          onClick={toggleSelectAll}
          className="text-[11px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200"
        >
          {selectedOrderIds.length === filteredOrders.length && filteredOrders.length > 0
            ? 'Deselect All'
            : 'Select All'}
        </button>
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

      {/* Floating Action Bar when orders are ticked/selected ("tick mark eka damma share and down load button enna ona") */}
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
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300 p-6">
            <ShoppingBag className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-xs font-bold text-slate-700">No orders found</p>
            <p className="text-[11px] text-slate-400 mt-1">Create an order from the Inventory page</p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const isExpanded = expandedOrderId === order.id;
            const isSelected = selectedOrderIds.includes(order.id);
            const paymentAlert = isPaymentDueSoon(order);
            const isDelivered = order.status === 'Delivered';

            return (
              <div
                key={order.id}
                className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden shadow-2xs ${
                  isSelected ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-200'
                }`}
              >
                {/* Order Summary Header Card */}
                <div 
                  onClick={() => toggleExpand(order.id)}
                  className="p-3.5 cursor-pointer hover:bg-slate-50/70 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    
                    {/* Left: Checkbox & Basic Order Info */}
                    <div className="flex items-start space-x-2.5 min-w-0">
                      
                      {/* Selection Checkbox */}
                      <button
                        type="button"
                        onClick={(e) => toggleSelectOrder(order.id, e)}
                        className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                          isSelected
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'border-slate-300 bg-slate-50 hover:border-blue-400'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>

                      <div className="min-w-0">
                        {/* Payment / Cheque Approaching Notification Alert Icon */}
                        {paymentAlert && (
                          <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500 text-white text-[10px] font-extrabold mb-1 shadow-2xs animate-pulse">
                            <AlertCircle className="w-3 h-3 stroke-[2.5]" />
                            <span>{getPaymentDueText(order)}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                            {order.id}
                          </span>
                          
                          {/* Payment Option badge */}
                          {order.isInstantPay ? (
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-300">
                              <Sparkles className="w-3 h-3 text-emerald-600" />
                              <span>Instant Pay</span>
                            </span>
                          ) : (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                              order.paymentMethod === 'Cash'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            }`}>
                              {order.paymentMethod === 'Cash' ? (
                                <Banknote className="w-3 h-3" />
                              ) : (
                                <CreditCard className="w-3 h-3" />
                              )}
                              <span>{order.paymentMethod}</span>
                            </span>
                          )}

                          {/* Status Badge */}
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            isDelivered
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {order.status}
                          </span>
                        </div>

                        {/* Customer Shop Name */}
                        <h4 className="text-xs font-bold text-slate-900 mt-1 truncate">
                          {order.customerName}
                        </h4>
                        
                        <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <User className="w-3 h-3 text-slate-400" />
                          <span>Rep: <strong>{order.repName}</strong></span>
                          <span>•</span>
                          <span>Delivery ID: <strong className="font-mono text-blue-700">{order.deliveryId || order.batchNumber}</strong></span>
                        </p>
                      </div>
                    </div>

                    {/* Right: Price & Expand Icon */}
                    <div className="flex flex-col items-end flex-shrink-0">
                      <span className="text-sm font-black text-slate-900">
                        Rs. {order.netTotal?.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-slate-400 mt-0.5">
                        {order.items?.length || 0} items
                      </span>

                      <div className="mt-2 text-slate-400">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>

                  </div>
                </div>

                {/* EXPANDABLE ACCORDION CONTENT ("diga arinna puluwna widiyata") */}
                {isExpanded && (
                  <div className="border-t border-slate-100 bg-slate-50/70 p-3.5 space-y-3 animate-in fade-in duration-200">
                    
                    {/* Delivery & Shop Details Grid */}
                    <div className="bg-white p-3 rounded-xl border border-slate-200/80 space-y-2 text-xs">
                      <div className="flex justify-between text-slate-600">
                        <span className="text-slate-400">Customer Address:</span>
                        <span className="font-semibold text-slate-800 text-right truncate max-w-[200px]">
                          {order.customerAddress || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span className="text-slate-400">Main Importer Shop:</span>
                        <span className="font-semibold text-slate-800">{order.mainShopName}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span className="text-slate-400">Target Delivery Date:</span>
                        <span className="font-semibold text-blue-600">{order.deliveryDate}</span>
                      </div>

                      {order.isInstantPay ? (
                        <div className="pt-1.5 border-t border-slate-100 flex justify-between text-[11px]">
                          <span className="text-slate-500">Payment Status:</span>
                          <span className="font-bold text-emerald-700">Instant Pay (Settled Today)</span>
                        </div>
                      ) : !order.isInstantPay && order.paymentMethod === 'Cash' && order.paymentDueDate ? (
                        <div className="pt-1.5 border-t border-slate-100 space-y-1">
                          <span className="text-[10px] font-bold text-emerald-700 uppercase">Cash Collection Details:</span>
                          <div className="flex justify-between text-[11px]">
                            <span className="text-slate-500">Payment Due Date:</span>
                            <span className="font-bold text-amber-700">{order.paymentDueDate}</span>
                          </div>
                        </div>
                      ) : order.chequeDetails ? (
                        <div className="pt-1.5 border-t border-slate-100 space-y-1">
                          <span className="text-[10px] font-bold text-indigo-700 uppercase">Cheque Particulars:</span>
                          <div className="flex justify-between text-[11px]">
                            <span className="text-slate-500">Bank / Cheque #:</span>
                            <span className="font-bold text-slate-800">
                              {order.chequeDetails.bankName} - {order.chequeDetails.chequeNumber}
                            </span>
                          </div>
                          <div className="flex justify-between text-[11px]">
                            <span className="text-slate-500">Cheque Due Date:</span>
                            <span className="font-bold text-amber-700">{order.chequeDetails.chequeDate}</span>
                          </div>
                        </div>
                      ) : null}
                    </div>

                    {/* Products in this order */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">
                        Ordered Cosmetics Items
                      </span>
                      <div className="bg-white rounded-xl border border-slate-200/80 divide-y divide-slate-100 overflow-hidden">
                        {(order.items || []).map((item, idx) => (
                          <div key={idx} className="p-2.5 flex items-center justify-between text-xs">
                            <div className="min-w-0 pr-2">
                              <span className="text-[9px] font-bold text-blue-600 block">{item.brand}</span>
                              <p className="font-bold text-slate-900 truncate">{item.name}</p>
                              <p className="text-[10px] text-slate-400">
                                Rs. {item.salePrice?.toLocaleString()} × {item.quantity}
                                {item.discount > 0 && ` (${item.discount}% off)`}
                              </p>
                            </div>
                            <span className="font-extrabold text-slate-900 text-xs">
                              Rs. {item.lineTotal?.toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Status Toggle Button: Processing vs Delivered */}
                    <div className="p-3 bg-white rounded-xl border border-slate-200/80 space-y-2">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">
                        Delivery Fulfillment State
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => onUpdateStatus(order.id, 'Processing')}
                          className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                            order.status === 'Processing'
                              ? 'bg-amber-500 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>Processing (Out for Delivery)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => onUpdateStatus(order.id, 'Delivered')}
                          className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                            order.status === 'Delivered'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Delivered (Order Completed)</span>
                        </button>
                      </div>
                    </div>

                    {/* Action Buttons: WhatsApp Share, Download PDF, Print */}
                    <div className="grid grid-cols-3 gap-2 pt-1">
                      {/* WhatsApp Share */}
                      <button
                        type="button"
                        onClick={() => handleShareWhatsApp(order)}
                        className="py-2.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 shadow-xs transition-all active:scale-95"
                        title="Share on WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </button>

                      {/* Download PDF ("download dunama pdf ekk hadila 4n ekata download wenna ona") */}
                      <button
                        type="button"
                        onClick={() => handleSingleDownload(order)}
                        className="py-2.5 px-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 shadow-xs transition-all active:scale-95"
                        title="Download Invoice PDF"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>PDF Invoice</span>
                      </button>

                      {/* Print / Save PDF View */}
                      <button
                        type="button"
                        onClick={() => openPrintableInvoice(order)}
                        className="py-2.5 px-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 shadow-xs transition-all active:scale-95"
                        title="Print Order / Clean PDF View"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print Bill</span>
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
