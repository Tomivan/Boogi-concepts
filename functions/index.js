const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
const { initializeApp } = require('firebase-admin/app');

// Initialize Firebase Admin
const app = initializeApp();
const firestore = admin.firestore();

// Email configuration
const mailTransport = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_EMAIL,
    pass: process.env.GMAIL_PASSWORD,
  },
});


exports.sendOrderConfirmation = functions
  .runWith({
    secrets: ['GMAIL_EMAIL', 'GMAIL_PASSWORD'],
    timeoutSeconds: 30
  })
  .https.onCall(async (data, context) => {
    // Authentication check
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'Only authenticated users can place orders'
      );
    }

    const { orderData } = data;
    
    // Input validation
    if (!orderData || typeof orderData !== 'object') {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Invalid order data'
      );
    }

    const requiredFields = ['email', 'firstName', 'lastName', 'items', 'total', 'transactionId'];
    for (const field of requiredFields) {
      if (!orderData[field]) {
        throw new functions.https.HttpsError(
          'invalid-argument',
          `Missing required field: ${field}`
        );
      }
    }

    if (!Array.isArray(orderData.items) || orderData.items.length === 0) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Order must contain at least one item'
      );
    }

    // Generate HTML email template
    const itemsHtml = orderData.items.map(item => `
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;">${item.name}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">₦${item.price.toLocaleString()}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">₦${(item.price * item.quantity).toLocaleString()}</td>
      </tr>
    `).join('');

    const htmlTemplate = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <div style="background-color: #4B0082; padding: 20px; color: white;">
          <h1 style="margin: 0;">BOGI NOIRE</h1>
          <p style="margin: 5px 0 0; font-size: 18px;">Order Confirmation</p>
        </div>
        
        <div style="padding: 20px;">
          <p>Hello ${orderData.firstName},</p>
          <p>Thank you for your order! Here are your details:</p>
          
          <h3 style="margin-bottom: 5px;">Shipping Information</h3>
          <p>
            ${orderData.firstName} ${orderData.lastName}<br>
            ${orderData.address}<br>
            ${orderData.city}, ${orderData.state}<br>
            ${orderData.lga}<br>
            Phone: ${orderData.phone}
          </p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr style="background-color: #f3f3f3;">
                <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Item</th>
                <th style="padding: 10px; text-align: center; border: 1px solid #ddd;">Qty</th>
                <th style="padding: 10px; text-align: right; border: 1px solid #ddd;">Price</th>
                <th style="padding: 10px; text-align: right; border: 1px solid #ddd;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          
          <div style="text-align: right; font-size: 16px;">
            <p><strong>Total: ₦${orderData.total.toLocaleString()}</strong></p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p><strong>Order #:</strong> ${orderData.transactionId.slice(0, 8)}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          
          <p style="margin-top: 30px;">
            We'll notify you when your order ships.<br>
            Contact <a href="mailto:gracejunkie20@gmail.com" style="color: #4B0082;">gracejunkie20@gmail.com</a> with questions.
          </p>
        </div>
      </div>
    `;

    try {
      // Send customer confirmation email
      await mailTransport.sendMail({
        from: `BOGI NOIRE <${process.env.GMAIL_EMAIL}>`,
        to: orderData.email,
        subject: `Your Order Confirmation #${orderData.transactionId.slice(0, 8)}`,
        html: htmlTemplate,
      });

      // Optionally send admin notification
      await mailTransport.sendMail({
        from: `BOGI NOIRE <${process.env.GMAIL_EMAIL}>`,
        to: 'bukunmiodugbesans@gmail.com',
        subject: `New Order #${orderData.transactionId.slice(0, 8)}`,
        html: htmlTemplate.replace('Hello', 'New order from'),
      });

      // Save to Firestore
      const orderRef = await firestore.collection('orders').add({
        userId: context.auth.uid,
        customerEmail: orderData.email,
        customerName: `${orderData.firstName} ${orderData.lastName}`,
        items: orderData.items.map(item => ({
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          imageUrl: item.imageUrl || '',
        })),
        total: orderData.total,
        transactionId: orderData.transactionId,
        status: 'paid',
        shippingAddress: {
          name: `${orderData.firstName} ${orderData.lastName}`,
          street: orderData.address,
          city: orderData.city,
          state: orderData.state,
          lga: orderData.lga,
          phone: orderData.phone,
        },
        specialInstructions: orderData.instructions || '',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return { 
        success: true,
        orderId: orderRef.id 
      };
    } catch (error) {
      console.error('Order processing error:', error);
      throw new functions.https.HttpsError(
        'internal',
        'Unable to process your order',
        { debugMessage: error.message }
      );
    }
  });
  