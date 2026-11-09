import jsPDF from 'jspdf';
import autoTable, { applyPlugin } from 'jspdf-autotable';

// Ensure autotable plugin is applied to jsPDF constructor
try {
  applyPlugin(jsPDF);
} catch (e) {
  console.warn('jsPDF autotable applyPlugin:', e);
}

/**
 * Generate and download a high-quality PDF Invoice for an order
 * @param {Object} order - Full order object with customer, rep, items, and totals
 */
export function generateOrderPDF(order) {
  if (!order) return;

  try {
    const doc = new jsPDF({
      unit: 'pt',
      format: 'a4',
      orientation: 'portrait'
    });

    const pageWidth = doc.internal.pageSize.getWidth(); // 595.28 pt

    // Color Palette
    const primaryNavy = [30, 58, 138];    // #1e3a8a
    const headerBlue = [37, 99, 235];     // #2563eb
    const darkSlate = [15, 23, 42];       // #0f172a
    const mutedSlate = [100, 116, 139];   // #64748b
    const cardBg = [248, 250, 252];       // #f8fafc
    const borderColor = [226, 232, 240];  // #e2e8f0

    // -------------------------------------------------------------
    // 1. TOP HEADER BANNER
    // -------------------------------------------------------------
    doc.setFillColor(...primaryNavy);
    doc.rect(0, 0, pageWidth, 90, 'F');

    // Accent line below banner
    doc.setFillColor(...headerBlue);
    doc.rect(0, 90, pageWidth, 4, 'F');

    // Importer Company Title
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    const shopName = (order.mainShopName || 'LUMI COSMETICS IMPORTERS').toUpperCase();
    doc.text(shopName, 36, 40);

    // Subtitle
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(219, 234, 254);
    doc.text('OFFICIAL DISTRIBUTION INVOICE & DELIVERY BILL', 36, 58);
    doc.text('Cosmetics & Beauty Care Wholesale Distribution System', 36, 72);

    // Right-aligned Invoice Header Details
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(255, 255, 255);
    doc.text(`INVOICE: ${order.id || 'ORD-0000'}`, pageWidth - 36, 38, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(219, 234, 254);
    
    const deliveryIdStr = order.deliveryId || order.batchNumber || '000001';
    doc.text(`Delivery ID: ${deliveryIdStr}`, pageWidth - 36, 54, { align: 'right' });
    
    const dateStr = order.orderDate ? new Date(order.orderDate).toLocaleDateString() : new Date().toLocaleDateString();
    doc.text(`Issue Date: ${dateStr}`, pageWidth - 36, 70, { align: 'right' });

    // -------------------------------------------------------------
    // 2. CLIENT & LOGISTICS SPECIFICATION CARDS
    // -------------------------------------------------------------
    const startY = 110;
    const cardWidth = (pageWidth - 72 - 16) / 2; // two cards side by side
    const cardHeight = 88;

    // CARD 1: Customer Retail Shop
    doc.setFillColor(...cardBg);
    doc.roundedRect(36, startY, cardWidth, cardHeight, 6, 6, 'F');
    doc.setDrawColor(...borderColor);
    doc.roundedRect(36, startY, cardWidth, cardHeight, 6, 6, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(...headerBlue);
    doc.text('BILL TO / SHIP TO (CUSTOMER SHOP):', 46, startY + 16);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(...darkSlate);
    const custName = order.customerName || 'Retail Customer';
    doc.text(custName.length > 32 ? custName.substring(0, 32) + '...' : custName, 46, startY + 32);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...mutedSlate);
    if (order.customerOwner) {
      doc.text(`Owner: ${order.customerOwner}`, 46, startY + 46);
    }
    const custAddr = order.customerAddress ? `Address: ${order.customerAddress}` : 'Address: Store Delivery';
    doc.text(custAddr.length > 40 ? custAddr.substring(0, 40) + '...' : custAddr, 46, startY + 59);
    if (order.customerPhone) {
      doc.text(`Contact: ${order.customerPhone}`, 46, startY + 72);
    }

    // CARD 2: Delivery & Logistics Details
    const card2X = 36 + cardWidth + 16;
    doc.setFillColor(...cardBg);
    doc.roundedRect(card2X, startY, cardWidth, cardHeight, 6, 6, 'F');
    doc.setDrawColor(...borderColor);
    doc.roundedRect(card2X, startY, cardWidth, cardHeight, 6, 6, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(...headerBlue);
    doc.text('ORDER & LOGISTICS SPECIFICATIONS:', card2X + 10, startY + 16);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...mutedSlate);

    doc.text(`Delivery Rep:`, card2X + 10, startY + 31);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...darkSlate);
    doc.text(`${order.repName || 'Company Representative'}`, card2X + 78, startY + 31);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...mutedSlate);
    doc.text(`Target Date:`, card2X + 10, startY + 45);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...darkSlate);
    doc.text(`${order.deliveryDate || 'On Delivery'}`, card2X + 78, startY + 45);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...mutedSlate);
    doc.text(`Payment:`, card2X + 10, startY + 59);
    doc.setFont('helvetica', 'bold');
    
    // Resolve payment text
    let payText = 'Cash on Delivery';
    if (order.isInstantPay || order.paymentMethod === 'Instant Pay') {
      payText = 'Instant Pay (Paid in Full Today)';
      doc.setTextColor(16, 185, 129); // emerald
    } else if (order.paymentMethod === 'Cheque') {
      const chqNum = order.chequeDetails?.chequeNumber ? `#${order.chequeDetails.chequeNumber}` : '';
      const chqDate = order.chequeDetails?.chequeDate ? `(${order.chequeDetails.chequeDate})` : '';
      payText = `Cheque ${chqNum} ${chqDate}`.trim();
      doc.setTextColor(217, 119, 6); // amber
    } else if (order.paymentMethod === 'Cash') {
      payText = order.paymentDueDate ? `Cash (Due: ${order.paymentDueDate})` : 'Cash on Delivery';
      doc.setTextColor(...darkSlate);
    } else {
      payText = order.paymentMethod || 'Standard Payment';
      doc.setTextColor(...darkSlate);
    }
    doc.text(payText.length > 28 ? payText.substring(0, 28) + '...' : payText, card2X + 78, startY + 59);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...mutedSlate);
    doc.text(`Status:`, card2X + 10, startY + 73);
    doc.setFont('helvetica', 'bold');
    const isDelivered = (order.status || '').toLowerCase() === 'delivered';
    doc.setTextColor(isDelivered ? 16 : 217, isDelivered ? 185 : 119, isDelivered ? 129 : 6);
    doc.text((order.status || 'PROCESSING').toUpperCase(), card2X + 78, startY + 73);

    // -------------------------------------------------------------
    // 3. TABLE OF ORDER ITEMS
    // -------------------------------------------------------------
    const items = order.items || [];
    const tableRows = items.map((item, index) => {
      const unitPrice = Number(item.salePrice || 0);
      const discount = Number(item.discount || 0);
      const qty = Number(item.quantity || 0);
      const lineTotal = Number(item.lineTotal || (unitPrice * (1 - discount / 100) * qty));

      return [
        index + 1,
        `${item.name || 'Cosmetic Product'}\nCategory: ${item.brand || 'General'}`,
        `Rs. ${unitPrice.toLocaleString()}`,
        discount > 0 ? `${discount}%` : '-',
        qty,
        `Rs. ${lineTotal.toLocaleString()}`
      ];
    });

    const tableConfig = {
      startY: 212,
      head: [['#', 'Cosmetic Product Description', 'Unit Price', 'Disc', 'Qty', 'Line Total']],
      body: tableRows,
      theme: 'grid',
      headStyles: {
        fillColor: primaryNavy,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8.5,
        halign: 'left',
        cellPadding: 6
      },
      bodyStyles: {
        fontSize: 8.5,
        textColor: darkSlate,
        cellPadding: 5.5,
        valign: 'middle'
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      columnStyles: {
        0: { cellWidth: 26, halign: 'center' },
        1: { cellWidth: 230 },
        2: { cellWidth: 75, halign: 'right' },
        3: { cellWidth: 44, halign: 'center' },
        4: { cellWidth: 42, halign: 'center' },
        5: { cellWidth: 106, halign: 'right', fontStyle: 'bold' }
      },
      margin: { left: 36, right: 36 }
    };

    // Invoke autotable safely with dual compatibility
    if (typeof doc.autoTable === 'function') {
      doc.autoTable(tableConfig);
    } else {
      autoTable(doc, tableConfig);
    }

    const finalY = (doc.lastAutoTable?.finalY || 350) + 16;

    // -------------------------------------------------------------
    // 4. FINANCIAL SUMMARY (SUBTOTAL, DISCOUNT, NET TOTAL)
    // -------------------------------------------------------------
    const summaryWidth = 230;
    const summaryX = pageWidth - 36 - summaryWidth;
    const summaryHeight = order.overallDiscount > 0 ? 84 : 70;

    doc.setFillColor(...cardBg);
    doc.roundedRect(summaryX, finalY, summaryWidth, summaryHeight, 6, 6, 'F');
    doc.setDrawColor(...borderColor);
    doc.roundedRect(summaryX, finalY, summaryWidth, summaryHeight, 6, 6, 'S');

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...mutedSlate);
    doc.text('Items Subtotal:', summaryX + 14, finalY + 18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...darkSlate);
    doc.text(`Rs. ${(Number(order.subtotal) || 0).toLocaleString()}`, summaryX + summaryWidth - 14, finalY + 18, { align: 'right' });

    let netYOffset = 36;
    if (order.overallDiscount > 0) {
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(220, 38, 38);
      doc.text('Overall Order Discount:', summaryX + 14, finalY + 34);
      doc.setFont('helvetica', 'bold');
      doc.text(`- Rs. ${(Number(order.overallDiscount) || 0).toLocaleString()}`, summaryX + summaryWidth - 14, finalY + 34, { align: 'right' });
      netYOffset = 52;
    }

    // Divider line
    doc.setDrawColor(...borderColor);
    doc.line(summaryX + 14, finalY + netYOffset - 4, summaryX + summaryWidth - 14, finalY + netYOffset - 4);

    // Net Total
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryNavy);
    doc.text('Net Total Payable:', summaryX + 14, finalY + netYOffset + 14);
    doc.text(`Rs. ${(Number(order.netTotal) || 0).toLocaleString()}`, summaryX + summaryWidth - 14, finalY + netYOffset + 14, { align: 'right' });

    // -------------------------------------------------------------
    // 5. SIGNATURES & VERIFICATION SECTION
    // -------------------------------------------------------------
    const footerY = Math.max(finalY + summaryHeight + 35, 720);

    // Terms & Conditions Notice
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...mutedSlate);
    doc.text('• Please verify all cosmetic seal packs, batch numbers, and expiry dates upon handover.', 36, footerY - 14);
    doc.text('• Returns are accepted only within 7 days with valid wholesale distribution invoice.', 36, footerY - 4);

    // Signatures lines
    const sigLineY = footerY + 35;
    const sigWidth = 160;

    // Customer Signature Line
    doc.setDrawColor(...borderColor);
    doc.line(36, sigLineY, 36 + sigWidth, sigLineY);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...darkSlate);
    doc.text('Customer Seal & Signature', 36, sigLineY + 12);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...mutedSlate);
    doc.text('Goods received in satisfactory condition', 36, sigLineY + 22);

    // Delivery Rep Signature Line
    const repSigX = pageWidth - 36 - sigWidth;
    doc.setDrawColor(...borderColor);
    doc.line(repSigX, sigLineY, repSigX + sigWidth, sigLineY);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...darkSlate);
    doc.text('Delivery Rep Signature', repSigX, sigLineY + 12);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...mutedSlate);
    doc.text('Handover verified by representative', repSigX, sigLineY + 22);

    // -------------------------------------------------------------
    // 6. SAVE & DOWNLOAD TRIGGER (Mobile & Desktop Safe)
    // -------------------------------------------------------------
    const cleanCustomer = (order.customerName || 'Customer').replace(/[^a-zA-Z0-9]/g, '_');
    const fileName = `${order.id || 'ORDER'}_${cleanCustomer}_Invoice.pdf`;

    try {
      doc.save(fileName);
      return { success: true, fileName };
    } catch (saveErr) {
      console.warn('doc.save failed, falling back to Blob download:', saveErr);
      const blob = doc.output('blob');
      const blobUrl = URL.createObjectURL(blob);
      const downloadLink = document.createElement('a');
      downloadLink.href = blobUrl;
      downloadLink.download = fileName;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      setTimeout(() => {
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(blobUrl);
      }, 1500);
      return { success: true, fileName };
    }

  } catch (error) {
    console.error('Critical PDF generation error:', error);
    // Fallback: Open printable invoice in new tab if PDF engine throws
    openPrintableInvoice(order);
    return { success: false, error };
  }
}

/**
 * Open an immaculate, printable HTML invoice in a new window/tab
 * Provides 100% device compatibility across iPhone Safari, Android Chrome, and Desktop
 * @param {Object} order - Full order object
 */
export function openPrintableInvoice(order) {
  if (!order) return;

  const dateStr = order.orderDate ? new Date(order.orderDate).toLocaleDateString() : new Date().toLocaleDateString();
  const deliveryIdStr = order.deliveryId || order.batchNumber || '000001';
  const shopName = order.mainShopName || 'LUMI COSMETICS IMPORTERS';
  const custName = order.customerName || 'Retail Customer';
  const custAddress = order.customerAddress || 'Direct Store Delivery';
  const custPhone = order.customerPhone || 'N/A';
  const repName = order.repName || 'Company Representative';
  const targetDate = order.deliveryDate || 'On Delivery';
  
  let payMethodText = order.paymentMethod || 'Cash on Delivery';
  if (order.isInstantPay || order.paymentMethod === 'Instant Pay') {
    payMethodText = 'Instant Pay (Settled Today)';
  } else if (order.paymentMethod === 'Cheque' && order.chequeDetails) {
    payMethodText = `Cheque #${order.chequeDetails.chequeNumber || ''} (Due: ${order.chequeDetails.chequeDate || ''}, ${order.chequeDetails.bankName || ''})`;
  } else if (order.paymentMethod === 'Cash' && order.paymentDueDate) {
    payMethodText = `Cash on Delivery (Due: ${order.paymentDueDate})`;
  }

  const itemsHtml = (order.items || []).map((item, idx) => {
    const unitPrice = Number(item.salePrice || 0);
    const disc = Number(item.discount || 0);
    const qty = Number(item.quantity || 0);
    const total = Number(item.lineTotal || (unitPrice * (1 - disc / 100) * qty));

    return `
      <tr style="border-bottom: 1px solid #e2e8f0; font-size: 13px;">
        <td style="padding: 10px 8px; text-align: center; color: #64748b;">${idx + 1}</td>
        <td style="padding: 10px 8px;">
          <div style="font-weight: 700; color: #0f172a;">${item.name || 'Cosmetic Item'}</div>
          <div style="font-size: 11px; color: #64748b;">Category: ${item.brand || 'General'}</div>
        </td>
        <td style="padding: 10px 8px; text-align: right; color: #334155;">Rs. ${unitPrice.toLocaleString()}</td>
        <td style="padding: 10px 8px; text-align: center; color: #334155;">${disc > 0 ? disc + '%' : '-'}</td>
        <td style="padding: 10px 8px; text-align: center; font-weight: 700; color: #0f172a;">${qty}</td>
        <td style="padding: 10px 8px; text-align: right; font-weight: 700; color: #1e3a8a;">Rs. ${total.toLocaleString()}</td>
      </tr>
    `;
  }).join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Invoice_${order.id}_${custName.replace(/\s+/g, '_')}</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
        body { background: #f1f5f9; color: #0f172a; padding: 20px 10px; display: flex; flex-direction: column; align-items: center; }
        .invoice-card { background: #ffffff; width: 100%; max-width: 800px; padding: 36px; border-radius: 16px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1); border: 1px solid #e2e8f0; }
        .top-action-bar { width: 100%; max-width: 800px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; }
        .btn-print { background: #2563eb; color: #ffffff; border: none; padding: 10px 20px; border-radius: 10px; font-weight: 700; font-size: 14px; cursor: pointer; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 12px rgba(37,99,235,0.25); }
        .btn-print:hover { background: #1d4ed8; }
        .btn-close { background: #e2e8f0; color: #475569; border: none; padding: 10px 16px; border-radius: 10px; font-weight: 600; font-size: 13px; cursor: pointer; }
        .header-banner { background: #1e3a8a; color: white; padding: 24px; border-radius: 12px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-start; }
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
        .info-card { background: #f8fafc; border: 1px solid #e2e8f0; padding: 16px; border-radius: 12px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
        th { background: #1e3a8a; color: white; padding: 10px 8px; font-size: 12px; font-weight: 700; text-transform: uppercase; }
        .summary-box { float: right; width: 300px; background: #f8fafc; border: 1px solid #e2e8f0; padding: 18px; border-radius: 12px; margin-bottom: 30px; }
        .sig-section { clear: both; display: flex; justify-content: space-between; margin-top: 40px; padding-top: 20px; }
        .sig-box { width: 220px; border-top: 1px solid #94a3b8; text-align: center; padding-top: 8px; font-size: 12px; font-weight: 600; color: #334155; }
        @media print {
          body { background: #ffffff; padding: 0; }
          .invoice-card { box-shadow: none; border: none; max-width: 100%; padding: 10px; }
          .top-action-bar { display: none !important; }
        }
      </style>
    </head>
    <body>
      <div class="top-action-bar">
        <button class="btn-print" onclick="window.print()">
          🖨️ Print Invoice / Save as PDF
        </button>
        <button class="btn-close" onclick="window.close()">✕ Close</button>
      </div>

      <div class="invoice-card">
        <div class="header-banner">
          <div>
            <h1 style="font-size: 22px; font-weight: 800; margin-bottom: 4px;">${shopName}</h1>
            <p style="font-size: 12px; color: #bfdbfe;">Wholesale Distribution Invoice & Delivery Bill</p>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 16px; font-weight: 800;">INVOICE: ${order.id}</div>
            <div style="font-size: 12px; color: #bfdbfe; margin-top: 2px;">Delivery ID: ${deliveryIdStr}</div>
            <div style="font-size: 12px; color: #bfdbfe;">Date: ${dateStr}</div>
          </div>
        </div>

        <div class="grid-2">
          <div class="info-card">
            <div style="font-size: 10px; font-weight: 800; color: #2563eb; text-transform: uppercase; margin-bottom: 6px;">BILL TO / SHIP TO:</div>
            <div style="font-size: 14px; font-weight: 800; color: #0f172a;">${custName}</div>
            <div style="font-size: 12px; color: #475569; margin-top: 4px;">${custAddress}</div>
            <div style="font-size: 12px; color: #64748b; margin-top: 2px;">Contact: ${custPhone}</div>
          </div>

          <div class="info-card">
            <div style="font-size: 10px; font-weight: 800; color: #2563eb; text-transform: uppercase; margin-bottom: 6px;">DELIVERY & PAYMENT:</div>
            <div style="font-size: 12px; color: #334155;"><strong>Delivery Rep:</strong> ${repName}</div>
            <div style="font-size: 12px; color: #334155; margin-top: 3px;"><strong>Target Date:</strong> ${targetDate}</div>
            <div style="font-size: 12px; color: #334155; margin-top: 3px;"><strong>Payment:</strong> ${payMethodText}</div>
            <div style="font-size: 12px; margin-top: 3px;">
              <strong>Status:</strong> 
              <span style="font-weight: 800; color: ${(order.status || '').toLowerCase() === 'delivered' ? '#16a34a' : '#d97706'};">
                ${(order.status || 'PROCESSING').toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 35px; text-align: center;">#</th>
              <th style="text-align: left;">Product Description</th>
              <th style="text-align: right; width: 110px;">Unit Price</th>
              <th style="text-align: center; width: 70px;">Disc</th>
              <th style="text-align: center; width: 60px;">Qty</th>
              <th style="text-align: right; width: 130px;">Line Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div class="summary-box">
          <div style="display: flex; justify-content: space-between; font-size: 13px; color: #64748b; margin-bottom: 6px;">
            <span>Subtotal:</span>
            <span style="font-weight: 700; color: #0f172a;">Rs. ${(Number(order.subtotal) || 0).toLocaleString()}</span>
          </div>
          ${order.overallDiscount > 0 ? `
            <div style="display: flex; justify-content: space-between; font-size: 13px; color: #dc2626; margin-bottom: 6px;">
              <span>Overall Discount:</span>
              <span style="font-weight: 700;">- Rs. ${(Number(order.overallDiscount) || 0).toLocaleString()}</span>
            </div>
          ` : ''}
          <div style="border-top: 1px solid #cbd5e1; padding-top: 8px; margin-top: 8px; display: flex; justify-content: space-between; align-items: baseline;">
            <span style="font-size: 14px; font-weight: 800; color: #1e3a8a;">Net Total:</span>
            <span style="font-size: 18px; font-weight: 900; color: #1e3a8a;">Rs. ${(Number(order.netTotal) || 0).toLocaleString()}</span>
          </div>
        </div>

        <div class="sig-section">
          <div class="sig-box">
            Customer Signature & Seal
          </div>
          <div class="sig-box">
            Delivery Rep Signature
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  } else {
    // If pop-up was blocked, fallback to creating an iframe
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);
    iframe.contentDocument.write(htmlContent);
    iframe.contentDocument.close();
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
    setTimeout(() => document.body.removeChild(iframe), 2000);
  }
}
