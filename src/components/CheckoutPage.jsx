import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Minus, 
  Plus, 
  Trash2, 
  Calendar, 
  CreditCard, 
  Banknote, 
  CheckCircle2, 
  Store, 
  User, 
  Layers, 
  Tag, 
  ArrowRight,
  Sparkles,
  Check,
  Clock
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function CheckoutPage({
  selectedItems,
  products,
  activeCustomer,
  activeRep,
  activeMainShop,
  onUpdateQuantity,
  onRemoveItem,
  onSubmitOrder,
  onCancel
}) {
  // Generate a realistic batch code for this customer shop delivery
  const defaultBatch = `BATCH-${activeCustomer?.id || 'CUST'}-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}`;

  const [batchNumber, setBatchNumber] = useState(defaultBatch);
  const [overallDiscount, setOverallDiscount] = useState(0); // in Rupees
  
  // Instant Pay: Customer paid today immediately -> no need to choose cash/cheque/dates!
  const [isInstantPay, setIsInstantPay] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Cash'); // Cash or Cheque
  const [cashDueDate, setCashDueDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // default 1 week
  );
  const [chequeDetails, setChequeDetails] = useState({
    chequeNumber: '',
    bankName: 'Commercial Bank',
    chequeDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // default 1 week
  });
  const [deliveryDate, setDeliveryDate] = useState(
    new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Map selected items to full product information
  const orderItems = Object.entries(selectedItems).map(([id, itemData]) => {
    const prod = products.find(p => p.id === id);
    if (!prod) return null;
    const discount = itemData.discount ?? prod.discount ?? 0;
    const unitPrice = Math.round(prod.salePrice * (1 - (discount / 100)));
    const lineTotal = unitPrice * itemData.quantity;
    return {
      productId: prod.id,
      name: prod.name,
      brand: prod.brand,
      image: prod.image,
      salePrice: prod.salePrice,
      costPrice: prod.costPrice,
      discount,
      quantity: itemData.quantity,
      lineTotal
    };
  }).filter(Boolean);

  // Subtotal of lines
  const subtotal = orderItems.reduce((acc, curr) => acc + curr.lineTotal, 0);
  const finalTotal = Math.max(0, subtotal - Number(overallDiscount || 0));

  const handlePlaceOrder = () => {
    if (orderItems.length === 0) return;
    setIsSubmitting(true);

    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch (e) {
      // ignore
    }

    const resolvedPaymentMethod = isInstantPay ? 'Instant Pay' : paymentMethod;
    const resolvedDueDate = isInstantPay 
      ? null 
      : (paymentMethod === 'Cheque' ? chequeDetails.chequeDate : cashDueDate);

    const orderPayload = {
      mainShopId: activeMainShop?.id || 'MS001',
      mainShopName: activeMainShop?.name || 'Main Shop',
      repId: activeRep?.id || 'REP-101',
      repName: activeRep?.name || 'Delivery Rep',
      customerId: activeCustomer?.id || 'CUST-01',
      customerName: activeCustomer?.name || 'Customer Shop',
      customerAddress: activeCustomer?.address || '',
      batchNumber: batchNumber.trim() || defaultBatch,
      items: orderItems,
      subtotal,
      overallDiscount: Number(overallDiscount) || 0,
      netTotal: finalTotal,
      isInstantPay: Boolean(isInstantPay),
      paymentMethod: resolvedPaymentMethod,
      paymentStatus: isInstantPay ? 'Paid' : 'Pending',
      paymentDueDate: resolvedDueDate,
      cashDueDate: !isInstantPay && paymentMethod === 'Cash' ? cashDueDate : null,
      chequeDetails: !isInstantPay && paymentMethod === 'Cheque' ? chequeDetails : null,
      deliveryDate,
      status: 'Processing',
      orderDate: new Date().toISOString()
    };

    setTimeout(() => {
      onSubmitOrder(orderPayload);
    }, 400);
  };

  return (
    <div className="pb-28 px-3 pt-2 space-y-4 max-w-md mx-auto">
      
      {/* Top Order Context Header */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white rounded-3xl p-4 shadow-lg shadow-blue-500/10 space-y-3">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-[10px] font-bold">
            <ShoppingBag className="w-3 h-3" />
            <span>Order Checkout Summary</span>
          </div>
          <span className="text-[10px] bg-white text-blue-700 font-extrabold px-2 py-0.5 rounded-full">
            {orderItems.length} Products
          </span>
        </div>

        <div>
          <h2 className="text-base font-extrabold">{activeCustomer?.name || 'Quick Customer Order'}</h2>
          <p className="text-xs text-blue-100 mt-0.5 truncate">{activeCustomer?.address || 'Direct counter sale'}</p>
          <div className="flex items-center gap-2 mt-2 text-[11px] text-blue-200">
            <span>Rep: <strong>{activeRep?.name || 'Direct / Store Rep'}</strong></span>
            <span>•</span>
            <span>Shop: <strong>{activeMainShop?.name?.split(' ')[0] || 'Lumi Cosmetics'}</strong></span>
          </div>
        </div>
      </div>

      {/* Product Summary List ("eke penna ona product eke name eka price eka quantity eka , e kelinma quantity adu wadi eka") */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Selected Products Breakdown
          </h3>
          <span className="text-[11px] text-slate-400 font-medium">Adjust quantity directly</span>
        </div>

        {orderItems.map((item) => (
          <div
            key={item.productId}
            className="flex items-center justify-between p-3 bg-white rounded-2xl border border-slate-200 shadow-2xs space-x-3"
          >
            <img
              src={item.image}
              alt={item.name}
              className="w-12 h-12 rounded-xl object-cover border border-slate-100 flex-shrink-0"
            />

            <div className="flex-1 min-w-0">
              <span className="text-[9px] font-bold text-blue-600 uppercase">{item.brand}</span>
              <h4 className="text-xs font-bold text-slate-900 truncate">{item.name}</h4>
              <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                <span>Rs. {Math.round(item.salePrice * (1 - (item.discount / 100))).toLocaleString()}</span>
                {item.discount > 0 && (
                  <span className="text-[10px] text-amber-600 font-semibold">({item.discount}% off)</span>
                )}
                <span>× {item.quantity}</span>
              </div>
            </div>

            {/* Stepper (- qty +) and Line Total */}
            <div className="flex flex-col items-end space-y-1.5 flex-shrink-0">
              <span className="text-xs font-extrabold text-blue-700">
                Rs. {item.lineTotal.toLocaleString()}
              </span>

              <div className="flex items-center space-x-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                <button
                  type="button"
                  onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)}
                  className="w-6 h-6 rounded bg-white hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold"
                >
                  <Minus className="w-3 h-3 stroke-[2.5]" />
                </button>
                <span className="w-6 text-center text-xs font-bold text-slate-800">
                  {item.quantity}
                </span>
                <button
                  type="button"
                  onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
                  className="w-6 h-6 rounded bg-blue-600 text-white flex items-center justify-center font-bold"
                >
                  <Plus className="w-3 h-3 stroke-[2.5]" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Manual Overall Order Discount ("ethanin manuale discount ekk product okkotama add karanna") */}
      <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-blue-600" />
            <span>Overall Order Discount (Rs.)</span>
          </label>
          <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
            Manual Deduction
          </span>
        </div>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Rs.</span>
          <input
            type="number"
            min="0"
            max={subtotal}
            value={overallDiscount || ''}
            onChange={(e) => setOverallDiscount(Math.max(0, Number(e.target.value)))}
            placeholder="0"
            className="w-full pl-10 pr-4 py-2 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none"
          />
        </div>
      </div>

      {/* Batch Number ("kadeta itema danata saren sareta batch number eka add wenna ona") */}
      <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
            <span>Delivery Batch Number</span>
          </label>
          <span className="text-[10px] text-slate-400">Unique for this drop</span>
        </div>
        <input
          type="text"
          value={batchNumber}
          onChange={(e) => setBatchNumber(e.target.value)}
          placeholder="e.g. BATCH-2026-01"
          className="w-full px-3.5 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none"
        />
      </div>

      {/* Payment Method Section with Instant Pay Tick Mark */}
      <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3 overflow-hidden">
        <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Banknote className="w-4 h-4 text-blue-600" />
            <span>Payment Method</span>
            <span className="text-red-500">*</span>
          </span>
          <span className="text-[10px] text-slate-400 font-medium">Select terms</span>
        </label>
        
        {/* Instant Pay Tick Mark Option ("eke uda tick mark danna instant pay kiyala. eken kiyawanne adama geuwa kiyala") */}
        <div 
          onClick={() => setIsInstantPay(!isInstantPay)}
          className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between select-none active:scale-[0.99] ${
            isInstantPay 
              ? 'border-emerald-500 bg-emerald-50/70 shadow-xs ring-2 ring-emerald-100' 
              : 'border-slate-200 bg-slate-50/70 hover:border-slate-300 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-3">
            <button
              type="button"
              className={`w-6 h-6 rounded-lg flex items-center justify-center border-2 transition-all flex-shrink-0 ${
                isInstantPay 
                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs' 
                  : 'border-slate-300 bg-white'
              }`}
            >
              {isInstantPay && <Check className="w-4 h-4 stroke-[3]" />}
            </button>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-slate-900">Instant Pay (අදම ගෙවීම් කළා)</span>
                {isInstantPay && <Sparkles className="w-3.5 h-3.5 text-emerald-600 fill-emerald-500" />}
              </div>
              <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                Paid in full today — no delayed due date or payment options needed
              </p>
            </div>
          </div>

          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider flex-shrink-0 ${
            isInstantPay
              ? 'bg-emerald-600 text-white shadow-2xs'
              : 'bg-slate-200/80 text-slate-500'
          }`}>
            {isInstantPay ? 'Settled' : 'Not Yet'}
          </span>
        </div>

        {/* If Instant Pay is CHECKED: Confirms payment is settled, no extra inputs */}
        {isInstantPay ? (
          <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl flex items-center gap-2.5 animate-in fade-in duration-200">
            <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-2xs">
              <Check className="w-4 h-4 stroke-[3]" />
            </div>
            <div>
              <p className="text-xs font-black text-emerald-900">Payment Settled in Full Today</p>
              <p className="text-[10px] text-emerald-700">Order will be saved as completed with immediate receipt.</p>
            </div>
          </div>
        ) : (
          /* If Instant Pay is UNCHECKED: Choose Cash or Cheque */
          <div className="space-y-3 animate-in fade-in duration-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Delayed / Scheduled Payment Method
            </span>

            <div className="grid grid-cols-2 gap-2">
              {/* Cash */}
              <button
                type="button"
                onClick={() => setPaymentMethod('Cash')}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 font-bold text-xs transition-all ${
                  paymentMethod === 'Cash'
                    ? 'border-emerald-500 bg-emerald-50/70 text-emerald-800 shadow-xs'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Banknote className="w-4 h-4 text-emerald-600" />
                <span>Cash Payment</span>
              </button>

              {/* Cheque */}
              <button
                type="button"
                onClick={() => setPaymentMethod('Cheque')}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 font-bold text-xs transition-all ${
                  paymentMethod === 'Cheque'
                    ? 'border-blue-600 bg-blue-50/70 text-blue-800 shadow-xs'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <CreditCard className="w-4 h-4 text-blue-600" />
                <span>Cheque Payment</span>
              </button>
            </div>

            {/* If Cash selected: Select Cash Payment Due Date ("ehema natnm cash daddith kawadda eya gewanne kiyala dinayak select karanna ona") */}
            {paymentMethod === 'Cash' && (
              <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 space-y-2 animate-in fade-in duration-200 overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1">
                    <Clock className="w-3 h-3 text-emerald-600" />
                    <span>Cash Payment Due Date (කවද්ද සල්ලි දෙන්නේ)</span>
                  </span>
                  <span className="text-[9px] bg-emerald-600 text-white font-extrabold px-1.5 py-0.2 rounded-md">
                    Triggers Alert
                  </span>
                </div>

                <div className="w-full min-w-0">
                  <input
                    type="date"
                    required
                    value={cashDueDate}
                    onChange={(e) => setCashDueDate(e.target.value)}
                    className="w-full max-w-full box-border min-w-0 text-[16px] sm:text-xs bg-white border border-emerald-200 rounded-xl px-3 py-2 outline-none font-bold text-slate-800 shadow-2xs"
                  />
                </div>
                <p className="text-[10px] text-emerald-700 font-medium">
                  🔔 Notifications will trigger in the app when this payment collection date arrives.
                </p>
              </div>
            )}

            {/* If Cheque selected: Cheque input details with date notification trigger (Fixed date row overflow!) */}
            {paymentMethod === 'Cheque' && (
              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 space-y-2.5 animate-in fade-in duration-200 overflow-hidden">
                <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block">
                  Cheque Information & Due Date
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="min-w-0">
                    <label className="text-[10px] font-bold text-slate-600 block mb-1">Cheque Number</label>
                    <input
                      type="text"
                      placeholder="e.g. CHQ-78601"
                      value={chequeDetails.chequeNumber}
                      onChange={(e) => setChequeDetails({ ...chequeDetails, chequeNumber: e.target.value })}
                      className="w-full max-w-full box-border min-w-0 px-3 py-2 text-[16px] sm:text-xs bg-white border border-slate-200 rounded-xl outline-none font-medium"
                    />
                  </div>

                  <div className="min-w-0">
                    <label className="text-[10px] font-bold text-slate-600 block mb-1">Bank Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Commercial Bank"
                      value={chequeDetails.bankName}
                      onChange={(e) => setChequeDetails({ ...chequeDetails, bankName: e.target.value })}
                      className="w-full max-w-full box-border min-w-0 px-3 py-2 text-[16px] sm:text-xs bg-white border border-slate-200 rounded-xl outline-none font-medium"
                    />
                  </div>
                </div>

                {/* Date Row - Fixed: box-border min-w-0 max-w-full ensures it never overflows container! */}
                <div className="w-full min-w-0">
                  <label className="text-[10px] font-bold text-slate-600 block mb-1">
                    Cheque Clearance / Due Date (Triggers Notifications)
                  </label>
                  <input
                    type="date"
                    required
                    value={chequeDetails.chequeDate}
                    onChange={(e) => setChequeDetails({ ...chequeDetails, chequeDate: e.target.value })}
                    className="w-full max-w-full box-border min-w-0 px-3 py-2 text-[16px] sm:text-xs bg-white border border-blue-200 rounded-xl outline-none font-bold text-slate-800 shadow-2xs"
                  />
                </div>
                <p className="text-[10px] text-blue-600 font-medium">
                  🔔 Notifications will trigger 3 days prior to cheque deposit date.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Required Delivery Date */}
      <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2 overflow-hidden">
        <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-blue-600" />
          <span>Target Delivery Date</span>
        </label>
        <div className="w-full min-w-0">
          <input
            type="date"
            required
            value={deliveryDate}
            onChange={(e) => setDeliveryDate(e.target.value)}
            className="w-full max-w-full box-border min-w-0 px-3.5 py-2 text-[16px] sm:text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none"
          />
        </div>
      </div>

      {/* Final Bill Calculation Card */}
      <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-2 shadow-lg">
        <div className="flex justify-between text-xs text-slate-300">
          <span>Items Subtotal:</span>
          <span>Rs. {subtotal.toLocaleString()}</span>
        </div>
        {overallDiscount > 0 && (
          <div className="flex justify-between text-xs text-emerald-400 font-bold">
            <span>Overall Discount:</span>
            <span>- Rs. {Number(overallDiscount).toLocaleString()}</span>
          </div>
        )}
        <div className="border-t border-slate-800 pt-2 flex justify-between items-baseline">
          <div>
            <span className="text-sm font-extrabold text-white block">Net Payable Total</span>
            <span className="text-[10px] text-slate-400">Method: {isInstantPay ? 'Instant Pay (Settled Today)' : paymentMethod}</span>
          </div>
          <span className="text-lg font-black text-blue-400">
            Rs. {finalTotal.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Place Order Sticky Bottom Action */}
      <div className="fixed bottom-0 inset-x-0 z-40 p-3 max-w-md mx-auto bg-white/90 backdrop-blur-md border-t border-slate-200">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="py-3 px-4 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handlePlaceOrder}
            disabled={isSubmitting || orderItems.length === 0}
            className="flex-1 py-3 px-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 active:scale-98 transition-all"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Confirm & Pass To Orders</span>
          </button>
        </div>
      </div>

    </div>
  );
}
