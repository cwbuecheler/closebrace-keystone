const cbOptions = require('../options.js');
const keystone = require('keystone');
const nodemailer = require('nodemailer');

const Types = keystone.Field.Types;

/**
 * Enquiry Model
 * =============
 */

const Enquiry = new keystone.List('Enquiry', {
  nocreate: true,
  noedit: true,
});

Enquiry.add({
  name: { type: Types.Name, required: true },
  email: { type: Types.Email, required: true },
  enquiryType: {
    type: Types.Select,
    options: [
      { value: 'message', label: 'Just leaving a message' },
      { value: 'question', label: 'I\'ve got a question' },
      { value: 'other', label: 'Something else...' },
    ],
  },
  message: { type: Types.Markdown, required: true },
  createdAt: { type: Date, default: Date.now },
});

Enquiry.schema.methods.sendAlert = (name, callback) => {
  const enquiry = this;

  // create reusable transporter object using the default SMTP transport
  const mailString = `smtps://CloseBrace:${cbOptions.mandrill.apiKey}@smtp.mandrillapp.com`;
  const transporter = nodemailer.createTransport(mailString);

  // setup e-mail data with unicode symbols
  const mailOptions = {
    from: '"CloseBrace" <contact@closebrace.com>', // sender address
    to: 'contact@closebrace.com', // list of receivers
    subject: `New Enquiry from ${name}`, // Subject line
    text: 'A new enquiry was posted to CloseBrace. Go read it!', // plaintext body
    html: '<h3>New Enquiry</h3><p>A new enquiry was posted to CloseBrace. Go read it!</p>', // html body
  };

  // send mail with defined transport object
  transporter.sendMail(mailOptions, (error, info) => {
    callback();
  });
};

Enquiry.defaultSort = '-createdAt';
Enquiry.defaultColumns = 'name, email, enquiryType, createdAt';
Enquiry.register();
