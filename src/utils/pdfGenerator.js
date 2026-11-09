import jsPDF from 'jspdf';
import 'jspdf-autotable';

export function generateOrderPDF(order) {
  const doc = new jsPDF({
    unit: 'pt',
    format: 'a4'
  });

  // Colors
  const primaryBlue = [37, 99, 235]; // #2563eb
  const darkSlate = [15, 23, 42]; // #0f172a
  const lightGrey = [241, 245, 249]; // #f1f5f9

  // Header Background Banner
  doc.setFillColor(...primaryBlue);
  doc.rect(0, 0, 595, 90, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('LUMIREP PRO COSMETICS', 40, 42);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Cosmetics Importers & Distribution Delivery Invoice', 40, 62);

  // Invoice Meta (Right-aligned in header)
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`INVOICE: ${order.id}`, 555, 42, { align: 'right' });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Date: ${new Date(order.orderDate).toLocaleDateString()}`, 555, 60, { align: 'right' });

  // Bill To & Session Context Grid
  doc.setTextColor(...darkSlate);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('DELIVER TO CUSTOMER SHOP:', 40, 120);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text(order.customerName || 'Customer Shop', 40, 136);
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`Address: ${order.customerAddress || 'N/A'}`, 40, 150);
  doc.text(`Delivery ID: ${order.deliveryId || order.batchNumber || '000001'}`, 40, 164);

  // Delivery Rep & Importer Info (Right side)
  doc.setTextColor(...darkSlate);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('DISTRIBUTION DETAILS:', 340, 120);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`Importer: ${order.mainShopName || 'LumiCosmetics'}`, 340, 136);
  doc.text(`Delivery Rep: ${order.repName || 'N/A'}`, 340, 150);
  doc.text(`Delivery Target Date: ${order.deliveryDate || 'N/A'}`, 340, 164);
  const paymentText = order.isInstantPay 
    ? 'Instant Pay (Paid in Full Today)' 
    : `${order.paymentMethod}${order.chequeDetails ? ` (Chq: ${order.chequeDetails.chequeNumber}, Due: ${order.chequeDetails.chequeDate})` : (order.paymentDueDate ? ` (Due: ${order.paymentDueDate})` : '')}`;
  doc.text(`Payment: ${paymentText}`, 340, 178);

  // Items Table
  const tableRows = (order.items || []).map((item, index) => [
    index + 1,
    `${item.name}\n[Brand: ${item.brand}]`,
    `Rs. ${item.salePrice.toLocaleString()}`,
    item.discount ? `${item.discount}%` : '-',
    item.quantity,
    `Rs. ${item.lineTotal.toLocaleString()}`
  ]);

  doc.autoTable({
    startY: 200,
    head: [['#', 'Cosmetic Product Description', 'Unit Price', 'Disc', 'Qty', 'Line Total']],
    body: tableRows,
    theme: 'striped',
    headStyles: {
      fillColor: primaryBlue,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9
    },
    bodyStyles: {
      fontSize: 9,
      textColor: darkSlate
    },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 220 },
      2: { cellWidth: 70, halign: 'right' },
      3: { cellWidth: 45, halign: 'center' },
      4: { cellWidth: 45, halign: 'center' },
      5: { cellWidth: 80, halign: 'right' }
    },
    margin: { left: 40, right: 40 }
  });

  const finalY = doc.lastAutoTable.finalY + 20;

  // Totals Box (Right aligned)
  doc.setFillColor(...lightGrey);
  doc.roundedRect(320, finalY, 235, 75, 6, 6, 'F');

  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('Subtotal:', 340, finalY + 20);
  doc.text(`Rs. ${(order.subtotal || 0).toLocaleString()}`, 535, finalY + 20, { align: 'right' });

  if (order.overallDiscount > 0) {
    doc.text('Overall Discount:', 340, finalY + 35);
    doc.text(`- Rs. ${(order.overallDiscount || 0).toLocaleString()}`, 535, finalY + 35, { align: 'right' });
  }

  doc.setDrawColor(203, 213, 225);
  doc.line(340, finalY + 45, 535, finalY + 45);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryBlue);
  doc.text('Net Total:', 340, finalY + 62);
  doc.text(`Rs. ${(order.netTotal || 0).toLocaleString()}`, 535, finalY + 62, { align: 'right' });

  // Status Badge
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(order.status === 'Delivered' ? [16, 185, 129] : [245, 158, 11]);
  doc.text(`Status: ${order.status.toUpperCase()}`, 40, finalY + 30);

  // Footer notes & signatures
  const footerY = Math.min(finalY + 110, 760);
  doc.setTextColor(148, 163, 184);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Thank you for your business. Please inspect cosmetics batch upon receipt.', 40, footerY);

  doc.setDrawColor(203, 213, 225);
  doc.line(40, footerY + 35, 180, footerY + 35);
  doc.text('Customer Signature & Seal', 40, footerY + 47);

  doc.line(395, footerY + 35, 535, footerY + 35);
  doc.text('Delivery Rep Signature', 395, footerY + 47);

  // Save / Download PDF
  doc.save(`${order.id}_${order.customerName.replace(/\s+/g, '_')}.pdf`);
}
