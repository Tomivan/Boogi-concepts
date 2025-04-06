import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as nodemailer from 'nodemailer';

admin.initializeApp();

const gmailEmail = functions.config().gmail.email;
const gmailPassword = functions.config().gmail.password;

const mailTransport = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: gmailEmail,
    pass: gmailPassword,
  },
});

export const sendOrderConfirmation = functions.https.onCall(async (data, context) => {
  // Verify user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Only authenticated users can send orders'
    );
  }

  const { orderData } = data;
  const { email, firstName, items, total } = orderData;

  // Format order items for email
  const itemsList = items.map((item) => `
    <li>
      ${item.name} - ₦${item.price.toLocaleString()} × ${item.quantity}
    </li>
  `).join('');

  const mailOptions = {
    from: `BOGI NOIRE <${gmailEmail}>`,
    to: email,
    subject: `Your Order Confirmation #${orderData.transactionId}`,
    html: `
      <h2>Thank you for your order, ${firstName}!</h2>
      <p>Here are your order details:</p>
      <ul>${itemsList}</ul>
      <p><strong>Total: ₦${total.toLocaleString()}</strong></p>
      <p>Transaction ID: ${orderData.transactionId}</p>
      <p>We'll notify you when your order ships.</p>
    `,
  };

  try {
    await mailTransport.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Unable to send confirmation email'
    );
  }
});