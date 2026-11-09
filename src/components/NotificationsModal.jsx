import React from 'react';
import { Bell, AlertCircle, AlertTriangle, Clock, X, Check, ArrowRight } from 'lucide-react';

export default function NotificationsModal({
  isOpen,
  onClose,
  orders,
  products,
  onSelectOrder
}) {
  if (!isOpen) return null;

  // 1. Cheque payment alerts (within 3 days or today or overdue)
  const chequeAlerts = orders.filter(o => {
    if (o.paymentMethod !== 'Cheque' || !o.chequeDetails?.chequeDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(o.chequeDetails.chequeDate);
    dueDate.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
    return diffDays <= 3;
  }).map(o => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(o.chequeDetails.chequeDate);
    dueDate.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
    let urgency = 'Due Soon';
    if (diffDays < 0) urgency = `Overdue by ${Math.abs(diffDays)}d`;
    else if (diffDays === 0) urgency = 'DUE TODAY';
    else if (diffDays === 1) urgency = 'Due Tomorrow';
    return { ...o, urgency, diffDays };
  });

  // 2. Low stock items
  const lowStockAlerts = products.filter(p => p.stock <= (p.lowStockThreshold || 10));

  // 3. Pending processing orders
  const pendingOrders = orders.filter(o => o.status === 'Processing');

  const totalAlerts = chequeAlerts.length + lowStockAlerts.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold">Action Notifications</h3>
              <p className="text-[10px] text-blue-100">
                {totalAlerts} items requiring attention
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs font-bold"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 overflow-y-auto flex-1 no-scrollbar">
          
          {/* CHEQUE PAYMENT DUE NOTIFICATIONS */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-700 flex items-center gap-1.5 uppercase tracking-wider">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                <span>Cheque Clearance Due ({chequeAlerts.length})</span>
              </span>
            </div>

            {chequeAlerts.length === 0 ? (
              <p className="text-[11px] text-slate-400 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                No cheques due in the next 3 days.
              </p>
            ) : (
              chequeAlerts.map(order => (
                <div
                  key={order.id}
                  onClick={() => {
                    onSelectOrder(order.id);
                    onClose();
                  }}
                  className="p-3 bg-amber-50/70 border border-amber-200 rounded-2xl cursor-pointer hover:bg-amber-100/70 transition-all flex items-start justify-between gap-2"
                >
                  <div className="min-w-0">
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-amber-500 text-white uppercase inline-block mb-1">
                      {order.urgency}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 truncate">{order.customerName}</h4>
                    <p className="text-[10px] text-slate-600 mt-0.5">
                      Cheque: {order.chequeDetails.chequeNumber} ({order.chequeDetails.bankName})
                    </p>
                    <p className="text-[10px] text-amber-800 font-semibold">
                      Due: {order.chequeDetails.chequeDate} • Amount: Rs. {order.netTotal?.toLocaleString()}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-amber-600 flex-shrink-0 mt-1" />
                </div>
              ))
            )}
          </div>

          {/* LOW STOCK ALERTS */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-red-600 flex items-center gap-1.5 uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span>Low Stock Critical ({lowStockAlerts.length})</span>
              </span>
            </div>

            {lowStockAlerts.length === 0 ? (
              <p className="text-[11px] text-slate-400 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                All inventory stock counts are healthy.
              </p>
            ) : (
              lowStockAlerts.slice(0, 4).map(prod => (
                <div
                  key={prod.id}
                  className="p-2.5 bg-red-50/60 border border-red-200 rounded-2xl flex items-center justify-between text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <p className="font-bold text-slate-900 truncate">{prod.name}</p>
                    <p className="text-[10px] text-red-600 font-semibold">{prod.brand} • Batch: {prod.batchId}</p>
                  </div>
                  <span className="px-2 py-0.5 bg-red-600 text-white font-extrabold rounded-lg text-xs flex-shrink-0">
                    {prod.stock} Left
                  </span>
                </div>
              ))
            )}
          </div>

          {/* PENDING PROCESSING DELIVERIES */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-blue-700 flex items-center gap-1.5 uppercase tracking-wider">
              <Clock className="w-4 h-4 text-blue-500" />
              <span>Pending Deliveries ({pendingOrders.length})</span>
            </span>

            {pendingOrders.slice(0, 3).map(order => (
              <div
                key={order.id}
                onClick={() => {
                  onSelectOrder(order.id);
                  onClose();
                }}
                className="p-2.5 bg-blue-50/50 border border-blue-200 rounded-2xl cursor-pointer hover:bg-blue-100/50 text-xs flex items-center justify-between"
              >
                <div className="truncate">
                  <span className="font-bold text-slate-900 truncate block">{order.customerName}</span>
                  <span className="text-[10px] text-slate-500">Target Delivery: {order.deliveryDate}</span>
                </div>
                <span className="font-extrabold text-blue-700">Rs. {order.netTotal?.toLocaleString()}</span>
              </div>
            ))}
          </div>

        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-800 text-white text-xs font-bold rounded-xl"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
