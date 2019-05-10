// const keystone = require('keystone');
const sanitizer = require('sanitizer');
const mailgun = require('mailgun-js');
const cbOptions = require('../../options.js');

const DOMAIN = cbOptions.mailgun.domain;
const apiKey = cbOptions.mailgun.apiKey;
const mg = mailgun({ apiKey, domain: DOMAIN });

const stripe = require('stripe')(cbOptions.stripe.privateKey);

/**
 * Process a sponsorship purchase
 */
exports.purchase = (req, res) => {
  const data = (req.method === 'POST') ? req.body : req.query;
  const { token, price } = data;

  // Submit the charge to Stripe
  stripe.charges.create({
    amount: price,
    currency: 'usd',
    source: token.id,
    description: `CloseBrace Newsletter Sponsorship Purchase - ${data.token.email}`,
  }, (err, charge) => {
    if (err || !charge) {
      return res.apiError('Problem processing card', err);
    }

    sendUserEmail(data);
    sendCloseBraceEmail(data);
    return res.apiResponse({ success: true, charge });
  });
};


// Email user function
const sendUserEmail = (data) => {
  const { token, price } = data;
  let plainText;
  let htmlText;

  // Change email text based on product type
  switch (price) {
    case 25000:
      plainText = 'Thank You for Your Purchase.\n\nYou purchased a one-week newsletter sponsorship from CloseBrace. Your card was charged $250.00.\n\nI\'ll contact you directly regarding your sponsorship. If you have any issues or questions about this transaction, you can reply directly to this email.\n\nThanks again!\n\n-CloseBrace';
      htmlText = '<p><strong>Thank You for Your Purchase</strong></p><p>You purchased a one-week newsletter sponsorship from CloseBrace. Your card was charged <strong>$250.00</strong>.</p><p>I\'ll contact you directly regarding your sponsorship. If you have any issues or questions about this transaction, you can reply directly to this email.</p><p>Thanks again!</p><p>&ndash;CloseBrace</p>';
      break;
    case 90000:
      plainText = 'Thank You for Your Purchase.\n\nYou purchased a four-week newsletter sponsorship from CloseBrace. Your card was charged $900.00.\n\nI\'ll contact you directly regarding your sponsorship. If you have any issues or questions about this transaction, you can reply directly to this email.\n\nThanks again!\n\n-CloseBrace';
      htmlText = '<p><strong>Thank You for Your Purchase</strong></p><p>You purchased a four-week newsletter sponsorship from CloseBrace. Your card was charged <strong>$900.00</strong>.</p><p>I\'ll contact you directly regarding your sponsorship. If you have any issues or questions about this transaction, you can reply directly to this email.</p><p>Thanks again!</p><p>&ndash;CloseBrace</p>';
      break;
    default:
      break;
  }

  // Email the user their information
  const mailOptions = {
    from: '"CloseBrace" <billing@closebrace.com>', // sender address
    to: token.email, // list of receivers
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
const sendCloseBraceEmail = (data) => {
  const { token, price } = data;
  const mailOptions = {
    from: '"CloseBrace" <billing@closebrace.com>', // sender address
    to: '"CloseBrace" <billing@closebrace.com>', // list of receivers
    subject: `New CloseBrace Sale to ${token.email}`, // Subject line
    text: `A new CloseBrace Weekly sponsorship sale occurred. It was the ${price} option.`, // plaintext body
    html: `<p>A new CloseBrace Weekly sponsorship sale occurred. It was the ${price} option.</p>`, // html body
  };

  // send mail
  mg.messages().send(mailOptions, (error, body) => {
    if (error) { return false; }
    return true;
  });
};

/**
 * Process a newsletter sponsorship purchase
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
