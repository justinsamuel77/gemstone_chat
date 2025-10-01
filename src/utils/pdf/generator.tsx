// Custom PDF generation implementation without external dependencies
export interface OrderData {
  id: string;
  orderNumber: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    personalDetails: {
      address: string;
    };
  };
  orderStatus: string;
  paymentStatus: string;
  dealer: string;
  product: {
    name: string;
    metalType: string;
    netWeight: string;
    stones: string;
    purity: string;
    makingCharges: string;
    totalCharges: string;
    notes: string;
  };
  payment: {
    totalOrderValue: string;
    advancePaid: string;
    balanceDue: string;
    paymentMethod: string;
  };
  timeline: Array<{
    date: string;
    status: string;
    completed: boolean;
  }>;
}

// Simple HTML-based PDF generation alternative
export const generateInvoicePDF = (orderData: OrderData, returnBlob: boolean = false) => {
  const invoiceHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>GEMSTONE Invoice - ${orderData.orderNumber}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 20px;
          color: #333;
        }
        .header {
          text-align: center;
          border-bottom: 2px solid #1E5128;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .company-name {
          font-size: 24px;
          font-weight: bold;
          color: #1E5128;
          margin-bottom: 5px;
        }
        .invoice-title {
          font-size: 18px;
          color: #666;
        }
        .info-section {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
        }
        .info-block {
          width: 45%;
        }
        .info-block h3 {
          color: #1E5128;
          border-bottom: 1px solid #1E5128;
          padding-bottom: 5px;
        }
        .product-details {
          margin-bottom: 30px;
        }
        .product-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        .product-table th,
        .product-table td {
          border: 1px solid #ddd;
          padding: 10px;
          text-align: left;
        }
        .product-table th {
          background-color: #1E5128;
          color: white;
        }
        .payment-summary {
          margin-bottom: 30px;
        }
        .payment-table {
          width: 50%;
          margin-left: auto;
          border-collapse: collapse;
        }
        .payment-table td {
          border: 1px solid #ddd;
          padding: 10px;
        }
        .payment-table .total-row {
          background-color: #f5f5f5;
          font-weight: bold;
        }
        .timeline {
          margin-bottom: 30px;
        }
        .status-item {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #eee;
        }
        .status-completed {
          color: #1E5128;
          font-weight: bold;
        }
        .footer {
          text-align: center;
          color: #666;
          font-size: 12px;
          border-top: 1px solid #ddd;
          padding-top: 20px;
          margin-top: 50px;
        }
        @media print {
          body { margin: 0; }
          .info-section { display: block; }
          .info-block { width: 100%; margin-bottom: 20px; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-name">💎 GEMSTONE Fine Jewelry</div>
        <div class="invoice-title">Order Invoice - ${orderData.orderNumber}</div>
      </div>
      
      <div class="info-section">
        <div class="info-block">
          <h3>Customer Information</h3>
          <p><strong>Name:</strong> ${orderData.customer.name}</p>
          <p><strong>Email:</strong> ${orderData.customer.email}</p>
          <p><strong>Phone:</strong> ${orderData.customer.phone}</p>
          <p><strong>Address:</strong> ${orderData.customer.personalDetails.address}</p>
        </div>
        
        <div class="info-block">
          <h3>Order Information</h3>
          <p><strong>Order Number:</strong> ${orderData.orderNumber}</p>
          <p><strong>Order Status:</strong> ${orderData.orderStatus}</p>
          <p><strong>Payment Status:</strong> ${orderData.paymentStatus}</p>
          <p><strong>Dealer:</strong> ${orderData.dealer}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
        </div>
      </div>
      
      <div class="product-details">
        <h3>Product Details</h3>
        <table class="product-table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Product Name</td>
              <td>${orderData.product.name}</td>
            </tr>
            <tr>
              <td>Metal Type</td>
              <td>${orderData.product.metalType}</td>
            </tr>
            <tr>
              <td>Net Weight</td>
              <td>${orderData.product.netWeight}</td>
            </tr>
            <tr>
              <td>Stones</td>
              <td>${orderData.product.stones}</td>
            </tr>
            <tr>
              <td>Purity</td>
              <td>${orderData.product.purity}</td>
            </tr>
            <tr>
              <td>Making Charges</td>
              <td>₹${orderData.product.makingCharges}</td>
            </tr>
            <tr>
              <td>Total Charges</td>
              <td>₹${orderData.product.totalCharges}</td>
            </tr>
          </tbody>
        </table>
        ${orderData.product.notes ? `<p><strong>Notes:</strong> ${orderData.product.notes}</p>` : ''}
      </div>
      
      <div class="payment-summary">
        <h3>Payment Summary</h3>
        <table class="payment-table">
          <tr>
            <td>Total Order Value</td>
            <td>₹${orderData.payment.totalOrderValue}</td>
          </tr>
          <tr>
            <td>Advance Paid</td>
            <td>₹${orderData.payment.advancePaid}</td>
          </tr>
          <tr class="total-row">
            <td>Balance Due</td>
            <td>₹${orderData.payment.balanceDue}</td>
          </tr>
          <tr>
            <td>Payment Method</td>
            <td>${orderData.payment.paymentMethod}</td>
          </tr>
        </table>
      </div>
      
      <div class="timeline">
        <h3>Order Timeline</h3>
        ${orderData.timeline.map(item => `
          <div class="status-item">
            <span class="${item.completed ? 'status-completed' : ''}">${item.status}</span>
            <span>${item.date}</span>
          </div>
        `).join('')}
      </div>
      
      <div class="footer">
        <p>Thank you for choosing GEMSTONE Fine Jewelry</p>
        <p>For any queries, please contact us at info@gemstone.com</p>
      </div>
    </body>
    </html>
  `;

  if (returnBlob) {
    // Return as a data URI for sharing
    const dataUri = 'data:text/html;charset=utf-8,' + encodeURIComponent(invoiceHTML);
    return dataUri;
  } else {
    // Open in new window for printing/saving
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(invoiceHTML);
      printWindow.document.close();
      
      // Trigger print dialog after content loads
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  }
};

// Export for backward compatibility
export { generateInvoicePDF as default };