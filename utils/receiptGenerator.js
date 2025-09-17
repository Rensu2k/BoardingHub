import { Alert } from "react-native";

// Mock PDF generation utility
// In a real app, you would use libraries like react-native-pdf-lib, react-native-html-to-pdf, or @react-pdf/renderer

export const generateReceiptPDF = async (payment) => {
  try {
    // Simulate PDF generation delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // In a real implementation, you would:
    // 1. Create HTML template with payment data
    // 2. Convert HTML to PDF
    // 3. Save to device storage
    // 4. Return file URI

    const receiptHTML = generateReceiptHTML(payment);

    // Mock PDF generation - in real app this would create actual PDF
    const mockPdfUri = `file://receipts/${payment.receiptId}.pdf`;

    console.log("Generated receipt HTML:", receiptHTML);
    console.log("Mock PDF URI:", mockPdfUri);

    // For demo purposes, return a mock URI
    return mockPdfUri;
  } catch (error) {
    console.error("Error generating PDF receipt:", error);
    throw new Error("Failed to generate receipt PDF");
  }
};

const generateReceiptHTML = (payment) => {
  const currentDate = new Date().toLocaleDateString();

  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Receipt ${payment.receiptId}</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 20px;
                background-color: #f5f5f5;
            }
            .receipt-container {
                max-width: 600px;
                margin: 0 auto;
                background-color: white;
                padding: 30px;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header {
                text-align: center;
                border-bottom: 2px solid #007AFF;
                padding-bottom: 20px;
                margin-bottom: 30px;
            }
            .header h1 {
                color: #007AFF;
                margin: 0;
                font-size: 28px;
            }
            .header h2 {
                color: #666;
                margin: 5px 0 0 0;
                font-size: 16px;
                font-weight: normal;
            }
            .receipt-info {
                display: flex;
                justify-content: space-between;
                margin-bottom: 30px;
            }
            .info-section h3 {
                color: #333;
                margin: 0 0 10px 0;
                font-size: 14px;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            .info-section p {
                margin: 5px 0;
                color: #666;
                font-size: 14px;
            }
            .payment-details {
                margin-bottom: 30px;
            }
            .payment-details h3 {
                color: #333;
                border-bottom: 1px solid #eee;
                padding-bottom: 10px;
                margin-bottom: 15px;
            }
            .detail-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 8px 0;
                border-bottom: 1px solid #f0f0f0;
            }
            .detail-row:last-child {
                border-bottom: none;
            }
            .detail-label {
                color: #666;
                font-size: 14px;
            }
            .detail-value {
                color: #333;
                font-weight: 500;
                font-size: 14px;
            }
            .breakdown-table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
            }
            .breakdown-table th,
            .breakdown-table td {
                padding: 12px;
                text-align: left;
                border-bottom: 1px solid #eee;
            }
            .breakdown-table th {
                background-color: #f8f9fa;
                color: #333;
                font-weight: 600;
            }
            .breakdown-table .total-row {
                background-color: #007AFF10;
                font-weight: 600;
                color: #007AFF;
            }
            .total-amount {
                font-size: 24px;
                font-weight: bold;
                color: #007AFF;
                text-align: center;
                margin: 20px 0;
                padding: 20px;
                background-color: #007AFF10;
                border-radius: 8px;
            }
            .status-section {
                text-align: center;
                margin: 30px 0;
                padding: 20px;
                background-color: #d4edda;
                border: 1px solid #c3e6cb;
                border-radius: 8px;
            }
            .status-section .status-icon {
                font-size: 48px;
                color: #28a745;
                margin-bottom: 10px;
            }
            .status-section h3 {
                color: #155724;
                margin: 0 0 5px 0;
            }
            .status-section p {
                color: #155724;
                margin: 0;
                font-size: 14px;
            }
            .footer {
                text-align: center;
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #eee;
                color: #999;
                font-size: 12px;
            }
            .notes {
                background-color: #f8f9fa;
                padding: 15px;
                border-radius: 8px;
                margin-bottom: 20px;
            }
            .notes h4 {
                margin: 0 0 10px 0;
                color: #333;
            }
            .notes p {
                margin: 0;
                color: #666;
                font-size: 14px;
                line-height: 1.5;
            }
            @media print {
                body { margin: 0; padding: 0; background-color: white; }
                .receipt-container { box-shadow: none; }
            }
        </style>
    </head>
    <body>
        <div class="receipt-container">
            <div class="header">
                <h1>PAYMENT RECEIPT</h1>
                <h2>BoardingHub - Digital Receipt</h2>
            </div>

            <div class="receipt-info">
                <div class="info-section">
                    <h3>Receipt Details</h3>
                    <p><strong>Receipt ID:</strong> ${payment.receiptId}</p>
                    <p><strong>Invoice ID:</strong> ${payment.invoiceId}</p>
                    <p><strong>Generated:</strong> ${currentDate}</p>
                </div>
                <div class="info-section">
                    <h3>Property Information</h3>
                    <p><strong>Property:</strong> ${payment.property}</p>
                    <p><strong>Room:</strong> ${payment.room}</p>
                    <p><strong>Period:</strong> ${payment.month}</p>
                </div>
            </div>

            <div class="payment-details">
                <h3>Payment Information</h3>
                <div class="detail-row">
                    <span class="detail-label">Payment Date:</span>
                    <span class="detail-value">${new Date(
                      payment.paymentDate
                    ).toLocaleDateString()}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Due Date:</span>
                    <span class="detail-value">${new Date(
                      payment.dueDate
                    ).toLocaleDateString()}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Payment Method:</span>
                    <span class="detail-value">${payment.paymentMethod}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Approved Date:</span>
                    <span class="detail-value">${new Date(
                      payment.approvedDate
                    ).toLocaleDateString()}</span>
                </div>
            </div>

            <div class="payment-details">
                <h3>Charge Breakdown</h3>
                <table class="breakdown-table">
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th style="text-align: right;">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${payment.breakdown
                          .map(
                            (item) => `
                            <tr>
                                <td>${item.item}</td>
                                <td style="text-align: right;">₱${item.amount.toLocaleString()}</td>
                            </tr>
                        `
                          )
                          .join("")}
                        <tr class="total-row">
                            <td><strong>Total Amount</strong></td>
                            <td style="text-align: right;"><strong>₱${payment.amount.toLocaleString()}</strong></td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="total-amount">
                TOTAL PAID: ₱${payment.amount.toLocaleString()}
            </div>

            <div class="status-section">
                <div class="status-icon">✓</div>
                <h3>Payment Approved & Verified</h3>
                <p>This payment has been approved and verified by the landlord on ${new Date(
                  payment.approvedDate
                ).toLocaleDateString()}</p>
            </div>

            ${
              payment.notes
                ? `
                <div class="notes">
                    <h4>Notes</h4>
                    <p>${payment.notes}</p>
                </div>
            `
                : ""
            }

            <div class="payment-details">
                <h3>Landlord Information</h3>
                <div class="detail-row">
                    <span class="detail-label">Name:</span>
                    <span class="detail-value">${payment.landlord.name}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Email:</span>
                    <span class="detail-value">${payment.landlord.email}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Phone:</span>
                    <span class="detail-value">${payment.landlord.phone}</span>
                </div>
            </div>

            <div class="footer">
                <p>This is a digitally generated receipt from BoardingHub.</p>
                <p>For any questions or concerns, please contact your landlord directly.</p>
                <p>Receipt generated on ${currentDate}</p>
            </div>
        </div>
    </body>
    </html>
  `;
};

// Alternative function to simulate immediate PDF download without actual generation
export const downloadReceipt = async (payment) => {
  try {
    // Simulate download delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    Alert.alert(
      "Receipt Downloaded",
      `Receipt ${payment.receiptId} has been downloaded to your device.`,
      [{ text: "OK" }]
    );

    return true;
  } catch (error) {
    console.error("Error downloading receipt:", error);
    throw new Error("Failed to download receipt");
  }
};

// Function to format receipt data for sharing
export const formatReceiptForSharing = (payment) => {
  return {
    title: `Receipt ${payment.receiptId}`,
    message: `Payment Receipt\n\nReceipt ID: ${
      payment.receiptId
    }\nInvoice ID: ${payment.invoiceId}\nProperty: ${payment.property} - ${
      payment.room
    }\nPeriod: ${
      payment.month
    }\nAmount: ₱${payment.amount.toLocaleString()}\nPaid: ${new Date(
      payment.paymentDate
    ).toLocaleDateString()}\nMethod: ${
      payment.paymentMethod
    }\n\nThis payment has been approved and verified.\n\nGenerated by BoardingHub`,
  };
};

// Function to validate payment data before receipt generation
export const validatePaymentData = (payment) => {
  const requiredFields = [
    "receiptId",
    "invoiceId",
    "amount",
    "paymentDate",
    "property",
    "room",
    "month",
    "paymentMethod",
    "status",
  ];

  const missingFields = requiredFields.filter((field) => !payment[field]);

  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
  }

  if (payment.status !== "approved") {
    throw new Error("Receipt can only be generated for approved payments");
  }

  return true;
};
