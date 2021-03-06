// const keystone = require('keystone');
const sanitizer = require('sanitizer');
const nodemailer = require('nodemailer');
const mailgun = require('mailgun-js');
const cbOptions = require('../../options.js');

const DOMAIN = cbOptions.mailgun.domain;
const apiKey = cbOptions.mailgun.apiKey;
const mg = mailgun({ apiKey, domain: DOMAIN });

const stripe = require('stripe')(cbOptions.stripe.privateKey);

// Email user function
const sendUserEmail = (stripeToken, data) => {
  let plainText;
  let htmlText;

  const price = data.purchasePrice.toString().substr(0, data.purchasePrice.toString().length - 2);

  // Change email text based on product type
  switch (data.purchaseType) {
    case '5mr-react-only':
      plainText = `Thank You for Your Purchase.\n\nYou purchased Five Minute React (React-Only) from CloseBrace. Your card was charged $${price}. Here's the link to your content: https://closebrace.com/tutorials/list/five-minute-react/3xWbVULhnTR3F0HgVX\n\nDon't forget to download the zip file of code and instructions, here: https://closebrace-videos.nyc3.digitaloceanspaces.com/five-minute-react/setup.zip\n\nIf you have any issues or questions about this transaction, you can reply directly to this email.\n\nThanks again!\n\n-CloseBrace`;
      htmlText = `<p><strong>Thank You for Your Purchase</strong></p><p>You purchased Five Minute React (React-Only) from CloseBrace. Your card was charged <strong>$${price}</strong>. Here's the link to your content: https://closebrace.com/tutorials/list/five-minute-react/3xWbVULhnTR3F0HgVX</p><p>Don't forget to download the zip file of code and instructions, here: https://closebrace-videos.nyc3.digitaloceanspaces.com/five-minute-react/setup.zip</p><p>If you have any issues or questions about this transaction, you can reply directly to this email.</p><p>Thanks again!</p><p>&ndash;CloseBrace</p>`;
      break;
    case '5mr-full-stack':
      plainText = `Thank You for Your Purchase.\n\nYou purchased Five Minute React (Full-Stack) from CloseBrace. Your card was charged $${price}. Here's the link to your content: https://closebrace.com/tutorials/list/five-minute-react/XFuAXn6WV8cdfGYXbT\n\nYou'll be invited to the CloseBrace Slack channel within one business day.\n\nIf you have any issues or questions about this transaction, you can reply directly to this email.\n\nThanks again!\n\n-CloseBrace`;
      htmlText = `<p><strong>Thank You for Your Purchase</strong></p><p>You purchased Five Minute React (Full-Stack) from CloseBrace. You card was charged <strong>$${price}</strong>. Here's the link to your content: https://closebrace.com/tutorials/list/five-minute-react/XFuAXn6WV8cdfGYXbT</p><p>You'll be invited to the CloseBrace Slack channel within one business day.</p><p>If you have any issues or questions about this transaction, you can reply directly to this email.</p><p>Thanks again!</p><p>&ndash;CloseBrace</p>`;
      break;
    default:
      break;
  }

  // Email the user their information
  const mailOptions = {
    from: '"CloseBrace" <billing@closebrace.com>', // sender address
    to: stripeToken.email, // list of receivers
    subject: 'Receipt for Your Purchase - CloseBrace', // Subject line
    text: plainText, // plaintext body
    html: htmlText, // html body
  };

  // send mail
  mg.messages().send(mailOptions, (error, body) => {
    if (error) { return false; }
    return true;
  });
};

// Email CloseBrace function
const sendCloseBraceEmail = (stripeToken, data) => {
  const mailOptions = {
    from: '"CloseBrace" <billing@closebrace.com>', // sender address
    to: '"CloseBrace" <billing@closebrace.com>', // list of receivers
    subject: `New CloseBrace Sale to ${stripeToken.email}`, // Subject line
    text: `A new ${data.purchaseType} sale occurred.`, // plaintext body
    html: `<p>A new ${data.purchaseType} sale occurred.</p>`, // html body
  };

  // send mail
  mg.messages().send(mailOptions, (error, body) => {
    if (error) { return false; }
    return true;
  });
};

/**
 * Process a course purchase
 */
exports.course = (req, res) => {
  const data = (req.method === 'POST') ? req.body : req.query;
  const stripeToken = data.token;

  // Submit the charge to Stripe
  stripe.charges.create({
    amount: data.purchasePrice,
    currency: 'usd',
    source: stripeToken.id,
    description: `CloseBrace Course Purchase - ${data.token.email} - ${data.purchaseType}`,
  }, (err, charge) => {
    if (err || !charge) {
      return res.apiError('Problem processing card', err);
    }

    sendUserEmail(stripeToken, data);
    sendCloseBraceEmail(stripeToken, data);
    return res.apiResponse({ success: true, charge });
  });
};
