const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
const { initializeApp } = require('firebase-admin/app');

// Initialize Firebase Admin SDK
admin.initializeApp();
const firestore = admin.firestore();

// Email transporter configuration using environment secrets
const configureMailTransport = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_EMAIL,
      pass: process.env.GMAIL_PASSWORD,
    },
    pool: true,
    maxConnections: 1,
    rateDelta: 20000, // 20 seconds delay between messages
    rateLimit: 5 // Max 5 messages per rateDelta
  });
};

exports.initializeShippingFees = functions.https.onCall(async (data, context) => {
  // Verify admin privileges
  if (!context.auth || !context.auth.token.admin) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Only admins can initialize shipping fees'
    );
  }

  const defaultShippingFees = {
    'default': 5000,
    'abule egba, iyana ipaja, ikotun, igando, lasu, agege, berger, ketu': 4000,
    'maruwa, lekki, ikate, chisco': 3500,
    'iyanaworo, gbagada, bariga': 3000,
    'mushin, oshodi, yaba, surulere, illupeju, maryland, ikeja': 2500,
    'sangotedo, abraham adesanya, ogombo, ibeju lekki': 5000,
    'osapa, agungi, jakande, ilasan, salem': 3000,
    'ajah': 4000,
    'victoria island': 2500,
    'ikota, oral estate, eleganza, vgc, chevron, orchid, egbon': 5000
  };

  try {
    await admin.firestore()
      .doc('config/shippingFees')
      .set({ areas: defaultShippingFees });
    
    return { success: true, message: 'Shipping fees initialized' };
  } catch (error) {
    throw new functions.https.HttpsError(
      'internal',
      'Failed to initialize shipping fees',
      error.message
    );
  }
});

// ========================
// ORDER CONFIRMATION FUNCTION
// ========================
exports.sendOrderConfirmation = functions
  .runWith({
    secrets: ['GMAIL_EMAIL', 'GMAIL_PASSWORD'],
    timeoutSeconds: 60,
    memory: '1GB'
  })
  .https.onCall(async (data, context) => {
    functions.logger.log('Order confirmation triggered', { data });

    // Authentication check
    if (!context.auth) {
      functions.logger.error('Unauthenticated order attempt');
      throw new functions.https.HttpsError(
        'unauthenticated',
        'Authentication required to place orders'
      );
    }

    // Input validation
    if (!data || typeof data !== 'object' || !data.orderData) {
      functions.logger.error('Invalid order data structure');
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Invalid order data format'
      );
    }

    const { orderData } = data;
    const requiredFields = [
      'email', 'firstName', 'lastName', 
      'items', 'total', 'transactionId',
      'address', 'city', 'state', 'phone'
    ];

    for (const field of requiredFields) {
      if (!orderData[field]) {
        functions.logger.error(`Missing required field: ${field}`);
        throw new functions.https.HttpsError(
          'invalid-argument',
          `Missing required field: ${field}`
        );
      }
    }

    if (!Array.isArray(orderData.items) || orderData.items.length === 0) {
      functions.logger.error('Empty items array');
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Order must contain at least one item'
      );
    }

    // Process order items
    const itemsHtml = orderData.items.map(item => `
      <tr>
        <td style="padding: 12px; border: 1px solid #e0e0e0;">${item.name}</td>
        <td style="padding: 12px; border: 1px solid #e0e0e0; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border: 1px solid #e0e0e0; text-align: right;">₦${item.price.toLocaleString()}</td>
        <td style="padding: 12px; border: 1px solid #e0e0e0; text-align: right;">₦${(item.price * item.quantity).toLocaleString()}</td>
      </tr>
    `).join('');

    // Email template
    const htmlTemplate = `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 650px; margin: 0 auto; color: #333;">
        <!-- Header -->
        <div style="background-color: #4B0082; padding: 25px; color: white; text-align: center;">
          <h1 style="margin: 0; font-weight: 300;">BOGI NOIRE</h1>
          <p style="margin: 8px 0 0; font-size: 18px; letter-spacing: 1px;">ORDER CONFIRMATION</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 25px; background-color: #fafafa;">
          <p style="font-size: 16px;">Hello ${orderData.firstName},</p>
          <p style="font-size: 16px; line-height: 1.6;">Thank you for your order! We're preparing your items and will notify you when they ship.</p>
          
          <!-- Shipping Info -->
          <div style="margin: 25px 0; padding: 20px; background-color: white; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
            <h3 style="margin-top: 0; color: #4B0082;">SHIPPING INFORMATION</h3>
            <p style="margin: 8px 0;">
              <strong>${orderData.firstName} ${orderData.lastName}</strong><br>
              ${orderData.address}<br>
              ${orderData.city}, ${orderData.state}<br>
              Phone: ${orderData.phone}
            </p>
          </div>
          
          <!-- Order Items -->
          <table style="width: 100%; border-collapse: collapse; margin: 25px 0; background-color: white; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
            <thead>
              <tr style="background-color: #f5f5f5;">
                <th style="padding: 12px; text-align: left; border: 1px solid #e0e0e0;">ITEM</th>
                <th style="padding: 12px; text-align: center; border: 1px solid #e0e0e0;">QTY</th>
                <th style="padding: 12px; text-align: right; border: 1px solid #e0e0e0;">PRICE</th>
                <th style="padding: 12px; text-align: right; border: 1px solid #e0e0e0;">SUBTOTAL</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          
          <!-- Order Total -->
          <div style="text-align: right; margin-bottom: 25px;">
            <p style="font-size: 18px; font-weight: bold;">
              ORDER TOTAL: ₦${orderData.total.toLocaleString()}
            </p>
          </div>
          
          <!-- Order Details -->
          <div style="padding: 20px; background-color: white; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
            <h3 style="margin-top: 0; color: #4B0082;">ORDER DETAILS</h3>
            <p style="margin: 8px 0;"><strong>Order Number:</strong> ${orderData.transactionId.slice(0, 8).toUpperCase()}</p>
            <p style="margin: 8px 0;"><strong>Date:</strong> ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            ${orderData.instructions ? `<p style="margin: 8px 0;"><strong>Special Instructions:</strong> ${orderData.instructions}</p>` : ''}
          </div>
          
          <!-- Footer -->
          <p style="margin-top: 30px; font-size: 15px; line-height: 1.6; color: #666;">
            Need help? Contact us at <a href="mailto:okwuchidavida@gmail.com" style="color: #4B0082; text-decoration: none;">okwuchidavida@gmail.com</a> or call 07068899614.
          </p>
        </div>
      </div>
    `;

    try {
      const mailTransport = configureMailTransport();
      const dateString = new Date().toISOString().split('T')[0];

      // Send customer confirmation
      await mailTransport.sendMail({
        from: `BOGI NOIRE <${process.env.GMAIL_EMAIL}>`,
        to: orderData.email,
        subject: `Your Order #${orderData.transactionId.slice(0, 8)} Confirmation`,
        html: htmlTemplate,
        attachments: [{
          filename: `invoice-${dateString}.html`,
          content: htmlTemplate,
          contentType: 'text/html'
        }]
      });

      // Send admin notification
      await mailTransport.sendMail({
        from: `BOGI NOIRE Orders <${process.env.GMAIL_EMAIL}>`,
        to: 'okwuchidavida@gmail.com',
        subject: `[ADMIN] New Order #${orderData.transactionId.slice(0, 8)}`,
        html: htmlTemplate.replace('Hello', 'New order from'),
        attachments: [{
          filename: `order-${dateString}.html`,
          content: htmlTemplate,
          contentType: 'text/html'
        }]
      });

      // Save to Firestore
      const orderRef = await firestore.collection('orders').add({
        userId: context.auth.uid,
        customerEmail: orderData.email,
        customerName: `${orderData.firstName} ${orderData.lastName}`,
        items: orderData.items.map(item => ({
          id: item.id || null,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          imageUrl: item.imageUrl || '',
          brand: item.brand || null
        })),
        total: orderData.total,
        subtotal: orderData.subtotal || orderData.total,
        shippingFee: orderData.shippingFee || 0,
        transactionId: orderData.transactionId,
        status: 'paid',
        paymentMethod: orderData.paymentMethod || 'unknown',
        shippingAddress: {
          name: `${orderData.firstName} ${orderData.lastName}`,
          street: orderData.address,
          city: orderData.city,
          state: orderData.state,
          lga: orderData.lga || '',
          phone: orderData.phone
        },
        specialInstructions: orderData.instructions || '',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      functions.logger.log('Order processed successfully', { orderId: orderRef.id });
      return { 
        success: true,
        orderId: orderRef.id,
        transactionId: orderData.transactionId
      };

    } catch (error) {
      functions.logger.error('Order processing failed', { error });
      throw new functions.https.HttpsError(
        'internal',
        'Order processing failed',
        {
          errorDetails: error.message,
          stackTrace: error.stack
        }
      );
    }
  });

// ========================
// CONTACT FORM FUNCTION
// ========================
exports.sendContactEmail = functions
  .runWith({
    secrets: ['GMAIL_EMAIL', 'GMAIL_PASSWORD'],
    timeoutSeconds: 30,
    memory: '512MB'
  })
  .https.onCall(async (data, context) => {
    functions.logger.log('Contact form submission received', { data });

    // Input validation
    const requiredFields = ['name', 'email', 'message'];
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
      functions.logger.error('Missing required fields', { missingFields });
      throw new functions.https.HttpsError(
        'invalid-argument',
        `Missing required fields: ${missingFields.join(', ')}`
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      functions.logger.error('Invalid email format', { email: data.email });
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Please provide a valid email address'
      );
    }

    // Prepare email content
    const contactHtml = `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 650px; margin: 0 auto; color: #333;">
        <!-- Header -->
        <div style="background-color: #4B0082; padding: 25px; color: white; text-align: center;">
          <h1 style="margin: 0; font-weight: 300;">BOGI NOIRE</h1>
          <p style="margin: 8px 0 0; font-size: 18px; letter-spacing: 1px;">NEW CONTACT MESSAGE</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 25px; background-color: #fafafa;">
          <h3 style="margin-top: 0; color: #4B0082;">CONTACT DETAILS</h3>
          <p style="margin: 12px 0;"><strong>Name:</strong> ${data.name}</p>
          <p style="margin: 12px 0;"><strong>Email:</strong> <a href="mailto:${data.email}">${data.email}</a></p>
          ${data.phone ? `<p style="margin: 12px 0;"><strong>Phone:</strong> <a href="tel:${data.phone}">${data.phone}</a></p>` : ''}
          
          <h3 style="color: #4B0082; margin-top: 25px;">MESSAGE</h3>
          <div style="background-color: white; padding: 20px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
            ${data.message.replace(/\n/g, '<br>')}
          </div>
          
          <p style="margin-top: 25px; font-size: 14px; color: #666;">
            Received at: ${new Date().toLocaleString('en-US', { 
              weekday: 'short', 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
      </div>
    `;

    const confirmationHtml = `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 650px; margin: 0 auto; color: #333;">
        <!-- Header -->
        <div style="background-color: #4B0082; padding: 25px; color: white; text-align: center;">
          <h1 style="margin: 0; font-weight: 300;">BOGI NOIRE</h1>
        </div>
        
        <!-- Content -->
        <div style="padding: 25px; background-color: #fafafa;">
          <p style="font-size: 16px;">Hello ${data.name.split(' ')[0]},</p>
          <p style="font-size: 16px; line-height: 1.6;">Thank you for contacting BOGI NOIRE! We've received your message and will respond within 24-48 hours.</p>
          
          <div style="margin: 25px 0; padding: 20px; background-color: white; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
            <h3 style="margin-top: 0; color: #4B0082;">YOUR MESSAGE</h3>
            <div style="padding: 15px; background-color: #f9f9f9; border-radius: 3px;">
              ${data.message.replace(/\n/g, '<br>')}
            </div>
          </div>
          
          <p style="font-size: 16px; line-height: 1.6;">
            For urgent inquiries, please call us at <a href="tel:+2341234567890" style="color: #4B0082; text-decoration: none;">+234 123 456 7890</a>.
          </p>
          
          <p style="margin-top: 30px; font-size: 15px; color: #666;">
            This is an automated message. Please do not reply directly to this email.
          </p>
        </div>
      </div>
    `;

    try {
      const mailTransport = configureMailTransport();
      const timestamp = new Date().toISOString();

      // Send to admin
      await mailTransport.sendMail({
        from: `BOGI NOIRE Contact Form <${process.env.GMAIL_EMAIL}>`,
        to: 'okwuchidavida@gmail.com',
        subject: `New Contact: ${data.name}`,
        html: contactHtml,
        attachments: [{
          filename: `contact-${timestamp}.html`,
          content: contactHtml,
          contentType: 'text/html'
        }]
      });

      // Send confirmation to user
      await mailTransport.sendMail({
        from: `BOGI NOIRE <${process.env.GMAIL_EMAIL}>`,
        to: data.email,
        subject: 'We Received Your Message',
        html: confirmationHtml
      });

      // Save to Firestore
      const contactRef = await firestore.collection('contactSubmissions').add({
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        message: data.message,
        ipAddress: context.rawRequest.ip || null,
        userAgent: context.rawRequest.get('user-agent') || null,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        status: 'new',
        handled: false
      });

      functions.logger.log('Contact form processed successfully', { contactId: contactRef.id });
      return {
        success: true,
        submissionId: contactRef.id
      };

    } catch (error) {
      functions.logger.error('Contact form processing failed', { 
        error: error.message,
        stack: error.stack
      });

      throw new functions.https.HttpsError(
        'internal',
        'Failed to process contact form',
        {
          errorCode: error.code,
          errorMessage: error.message
        }
      );
    }
  });