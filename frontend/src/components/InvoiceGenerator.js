import React from 'react';
import { motion } from 'framer-motion';
import { Download, Printer, QrCode } from 'lucide-react';
import QRCode from 'qrcode';

const InvoiceGenerator = ({ order, store, onClose }) => {
  const generateQRCode = async (data) => {
    try {
      const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify({
        orderId: order._id,
        orderNumber: order.orderNumber,
        amount: order.totalAmount,
        store: store.name,
        date: new Date(order.createdAt).toISOString()
      }));
      return qrCodeDataURL;
    } catch (error) {
      console.error('QR Code generation error:', error);
      return null;
    }
  };

  const downloadInvoice = async () => {
    const qrCode = await generateQRCode(order);
    
    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Invoice - ${order.orderNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333; }
          .invoice-container { max-width: 800px; margin: 0 auto; background: white; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #10B981; padding-bottom: 20px; margin-bottom: 30px; }
          .logo { font-size: 28px; font-weight: bold; color: #10B981; }
          .invoice-title { font-size: 24px; color: #666; }
          .invoice-info { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px; }
          .info-section h3 { margin: 0 0 10px 0; color: #10B981; font-size: 16px; }
          .info-section p { margin: 5px 0; font-size: 14px; }
          .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          .items-table th, .items-table td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
          .items-table th { background: #f8f9fa; font-weight: bold; color: #333; }
          .total-section { text-align: right; margin-bottom: 30px; }
          .total-row { display: flex; justify-content: space-between; margin: 5px 0; }
          .total-final { font-size: 18px; font-weight: bold; color: #10B981; border-top: 2px solid #10B981; padding-top: 10px; }
          .qr-section { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px; }
          @media print { body { margin: 0; } .no-print { display: none; } }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <div class="header">
            <div>
              <div class="logo">🌱 EcoZBite</div>
              <p style="margin: 5px 0; color: #666;">Save Food • Save Money • Save Planet</p>
            </div>
            <div class="invoice-title">INVOICE</div>
          </div>

          <div class="invoice-info">
            <div class="info-section">
              <h3>Store Information</h3>
              <p><strong>${store.name}</strong></p>
              <p>${store.address.street}</p>
              <p>${store.address.city}, ${store.address.state} ${store.address.zipCode}</p>
              <p>Phone: ${store.contact.phone}</p>
              <p>Email: ${store.contact.email}</p>
            </div>
            <div class="info-section">
              <h3>Invoice Details</h3>
              <p><strong>Invoice #:</strong> ${order.orderNumber}</p>
              <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
              <p><strong>Customer:</strong> ${order.user?.name || order.customerInfo?.name}</p>
              <p><strong>Email:</strong> ${order.user?.email || order.customerInfo?.email}</p>
              <p><strong>Status:</strong> ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</p>
            </div>
          </div>

          <table class="items-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Discount</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map(item => `
                <tr>
                  <td>${item.productName || item.product?.name}</td>
                  <td>${item.quantity}</td>
                  <td>₹${(item.originalPrice || item.price || 0).toFixed(2)}</td>
                  <td>₹${((item.originalPrice || item.price || 0) - (item.discountedPrice || item.price || 0)).toFixed(2)}</td>
                  <td>₹${(item.totalPrice || (item.price * item.quantity) || 0).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="total-section">
            <div class="total-row">
              <span>Subtotal:</span>
              <span>₹${(order.totalAmount + (order.totalSavings || 0)).toFixed(2)}</span>
            </div>
            ${order.totalSavings > 0 ? `
              <div class="total-row">
                <span>Discount:</span>
                <span>-₹${order.totalSavings.toFixed(2)}</span>
              </div>
            ` : ''}
            <div class="total-row total-final">
              <span>Total Amount:</span>
              <span>₹${order.totalAmount.toFixed(2)}</span>
            </div>
          </div>

          ${qrCode ? `
            <div class="qr-section">
              <h3>Scan for Order Details</h3>
              <img src="${qrCode}" alt="QR Code" style="width: 120px; height: 120px;">
            </div>
          ` : ''}

          <div class="footer">
            <p>Thank you for choosing EcoZBite! Together we're reducing food waste and saving the planet.</p>
            <p>This is a computer-generated invoice. No signature required.</p>
            <p>Generated on ${new Date().toLocaleString()}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([invoiceHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${order.orderNumber}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const printInvoice = async () => {
    const qrCode = await generateQRCode(order);
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Invoice - ${order.orderNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
          .invoice-container { max-width: 800px; margin: 0 auto; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #10B981; padding-bottom: 20px; margin-bottom: 30px; }
          .logo { font-size: 28px; font-weight: bold; color: #10B981; }
          .invoice-title { font-size: 24px; color: #666; }
          .invoice-info { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px; }
          .info-section h3 { margin: 0 0 10px 0; color: #10B981; font-size: 16px; }
          .info-section p { margin: 5px 0; font-size: 14px; }
          .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          .items-table th, .items-table td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
          .items-table th { background: #f8f9fa; font-weight: bold; }
          .total-section { text-align: right; margin-bottom: 30px; }
          .total-row { display: flex; justify-content: space-between; margin: 5px 0; }
          .total-final { font-size: 18px; font-weight: bold; color: #10B981; border-top: 2px solid #10B981; padding-top: 10px; }
          .qr-section { text-align: center; margin-top: 30px; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <div class="header">
            <div>
              <div class="logo">🌱 EcoZBite</div>
              <p style="margin: 5px 0; color: #666;">Save Food • Save Money • Save Planet</p>
            </div>
            <div class="invoice-title">INVOICE</div>
          </div>

          <div class="invoice-info">
            <div class="info-section">
              <h3>Store Information</h3>
              <p><strong>${store.name}</strong></p>
              <p>${store.address.street}</p>
              <p>${store.address.city}, ${store.address.state} ${store.address.zipCode}</p>
              <p>Phone: ${store.contact.phone}</p>
              <p>Email: ${store.contact.email}</p>
            </div>
            <div class="info-section">
              <h3>Invoice Details</h3>
              <p><strong>Invoice #:</strong> ${order.orderNumber}</p>
              <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
              <p><strong>Customer:</strong> ${order.user?.name || order.customerInfo?.name}</p>
              <p><strong>Email:</strong> ${order.user?.email || order.customerInfo?.email}</p>
              <p><strong>Status:</strong> ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</p>
            </div>
          </div>

          <table class="items-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Discount</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map(item => `
                <tr>
                  <td>${item.productName || item.product?.name}</td>
                  <td>${item.quantity}</td>
                  <td>₹${(item.originalPrice || item.price || 0).toFixed(2)}</td>
                  <td>₹${((item.originalPrice || item.price || 0) - (item.discountedPrice || item.price || 0)).toFixed(2)}</td>
                  <td>₹${(item.totalPrice || (item.price * item.quantity) || 0).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="total-section">
            <div class="total-row">
              <span>Subtotal:</span>
              <span>₹${(order.totalAmount + (order.totalSavings || 0)).toFixed(2)}</span>
            </div>
            ${order.totalSavings > 0 ? `
              <div class="total-row">
                <span>Discount:</span>
                <span>-₹${order.totalSavings.toFixed(2)}</span>
              </div>
            ` : ''}
            <div class="total-row total-final">
              <span>Total Amount:</span>
              <span>₹${order.totalAmount.toFixed(2)}</span>
            </div>
          </div>

          ${qrCode ? `
            <div class="qr-section">
              <h3>Scan for Order Details</h3>
              <img src="${qrCode}" alt="QR Code" style="width: 120px; height: 120px;">
            </div>
          ` : ''}

          <div class="footer">
            <p>Thank you for choosing EcoZBite! Together we're reducing food waste and saving the planet.</p>
            <p>This is a computer-generated invoice. No signature required.</p>
            <p>Generated on ${new Date().toLocaleString()}</p>
          </div>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="space-y-4">
      <div className="flex space-x-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={downloadInvoice}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Download className="w-4 h-4 mr-2" />
          Download Invoice
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={printInvoice}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Printer className="w-4 h-4 mr-2" />
          Print Invoice
        </motion.button>
      </div>
    </div>
  );
};

export default InvoiceGenerator;