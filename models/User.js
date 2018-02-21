var keystone = require('keystone');
var Types = keystone.Field.Types;
var md5 = require('js-md5');
var nodemailer = require('nodemailer');
var cbOptions = require('../options.js');
var stripe = require("stripe")(cbOptions.stripe.privateKey);

/**
 * User Model
 * ==========
 */
var User = new keystone.List('User');

User.add({
	name: { type: Types.Name, required: true, index: true },
	email: { type: Types.Email, initial: true, required: true, index: true },
  userName: { type: String, initial: true, required: true, index: true },
	password: { type: Types.Password, initial: true, required: true },
  userImage: { type: Types.CloudinaryImage },
  location: { type: String },
  website: { type: String },
  twitterUsername: { type: String },
  confirmHash: { type: String },
  resetPasswordKey: { type: String, hidden: true },
  score: { type: Number, default: 0 },
  stripeID: { type: String },
  stripeCardID: { type: String },
  stripeSubscriptionType: { type: String },
  stripeSubscriptionStart: { type: Date },
  stripeSubscriptionID: { type: String },
  dateJoined: { type: Types.Date, default: Date.now },
  courses: { type: Types.Relationship, ref: 'PostCategory', emptyOption: true },
}, 'Permissions', {
	isAdmin: { type: Boolean, label: 'Is an Administrator', index: true },
  isAuthor: { type: Boolean, label: 'Is a Post Author', index: true },
  isPro: { type: Boolean, label: 'Is a Pro User', index: true },
  isPlatinum: { type: Boolean, label: 'Is a Platinum User', index: true },
  isVerified: { type: Boolean, label: 'Has a verified email address' },
});

// Provide access to Keystone
User.schema.virtual('canAccessKeystone').get(function () {
	return this.isAdmin;
});

/**
 * Methods
 * =======
*/
User.schema.methods.resetPassword = function(callback) {
  var user = this;
  user.resetPasswordKey = md5(keystone.utils.randomString([16,24]));
  user.save(function(err) {
    if (err) return callback(err);

    // create reusable transporter object using the default SMTP transport
    const mailString = `smtps://CloseBrace:${cbOptions.mandrill.apiKey}@smtp.mandrillapp.com`;
    var transporter = nodemailer.createTransport(mailString);

    // setup e-mail data with unicode symbols
    var mailOptions = {
      from: '"CloseBrace" <contact@closebrace.com>', // sender address
      to: user.email, // list of receivers
      subject: 'Reset Your CloseBrace Password', // Subject line
      text: 'We\'ve received a request to reset your password. Please visit this URL to complete the password reset: https://closebrace.com/account/reset-password/' + user.resetPasswordKey + ' ... If you weren\'t the person who requested this change, don\'t worry - no changes can be made to your password without using that link. If you\'ve received this email repeatedly, you might be the target of a hacking attempt, and should email contact@closebrace immediately so that we can investigate. Thanks!', // plaintext body
      html: '<h3>Reset Your Password</h3><p>We\'ve received a request to reset your password.</p><p>Please visit this URL to complete the password reset: <a href="https://closebrace.com/account/reset-password/' + user.resetPasswordKey + '">https://closebrace.com/account/reset-password/' + user.resetPasswordKey + '</a></p><p>If you weren\'t the person who requested this change, don\'t worry - no changes can be made to your password without using that link. If you\'ve received this email repeatedly, you might be the target of a hacking attempt, and should email <a href="mailto:contact@closebrace.com">contact@closebrace.com</a> immediately so that we can investigate. Thanks!</p>' // html body
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, function(error, info){
      callback();
    });

  });
}

User.schema.methods.addStripeSubscription = function(data, callback) {
    var user = this;

    // Set user's StripeCardID
    user.stripeCardID = data.token.id;
    user.isPro = true;

    if(data.proPlan === 'closebrace-pro-platinum-yearly' || data.proPlan === 'closebrace-pro-platinum-monthly') {
      // if Platinum, set user to platinum
      user.isPlatinum = true;
    }

    // Check if the user already has a stripe customer id
    if (user.stripeID && user.stripeID !== '') {
        stripe.subscriptions.create({
          customer: user.stripeID,
          plan: data.proPlan,
        }, function(err, subscription) {
          if(err) {
            return callback(err);
          }
          // record user's sub type and sub id
          user.stripeSubscriptionID = subscription.id;
          user.stripeSubscriptionType = subscription.plan.id;
          user.stripeSubscriptionStart = Date.now();
          user.save(function(err) {
            if (err) return callback(err);
            return callback();
          });
        });
    }
    else {
      // Otherwise save the user as a Stripe customer
      var customer = stripe.customers.create({
        email: user.email,
        card: data.token.id,
      }, function(err, customer) {
        // record the user's stripe ID
        user.stripeID = customer.id;
        // Then subscribe the user to the Stripe plan
        stripe.subscriptions.create({
          customer: customer.id,
          plan: data.proPlan,
        }, function(err, subscription) {
          // record user's sub type and sub id
          user.stripeSubscriptionID = subscription.id;
          user.stripeSubscriptionType = subscription.plan.id;
          user.stripeSubscriptionStart = Date.now();
          user.save(function(err) {
            if (err) return callback(err);
            return callback();
          });
        });
      });
    }
}

User.schema.methods.updateStripeCard = function(data, callback) {
  var user = this;

  // Save the new card token id
  user.stripeCardID = data.stripeToken.id;

  user.save(function(err) {
    if (err) return callback(err);
    // create reusable transporter object using the default SMTP transport
    const mailString = `smtps://CloseBrace:${cbOptions.mandrill.apiKey}@smtp.mandrillapp.com`;
    var transporter = nodemailer.createTransport(mailString);

    // setup e-mail data with unicode symbols
    var mailOptions = {
      from: '"CloseBrace" <contact@closebrace.com>', // sender address
      to: user.email, // list of receivers
      subject: 'Card Updated', // Subject line
      text: 'We\'ve received and processed a request to update the credit card associated with your CloseBrace Pro subscription (either updating an existing card, or providing a new one for future billing). You should be all set. If you recently received a card failure email, there\'s nothing left to do -- your new card will be automatically billed when the system tries again to renew in a day or two. In the interim, all your CloseBrace Pro benefits remain active.', // plaintext body
      html: '<p>We\'ve received and processed a request to update the credit card associated with your CloseBrace Pro subscription (either updating an existing card, or providing a new one for future billing). You should be all set. If you recently received a card failure email, there\'s nothing left to do -- your new card will be automatically billed when the system tries again to renew in a day or two. In the interim, all your CloseBrace Pro benefits remain active.</p>' // html body
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, function(error, info){
      return callback();
    });
  });
}

User.schema.methods.stripeAlertCardFail = function(callback) {
  var user = this;

  // create reusable transporter object using the default SMTP transport
  const mailString = `smtps://CloseBrace:${cbOptions.mandrill.apiKey}@smtp.mandrillapp.com`;
  var transporter = nodemailer.createTransport(mailString);

  // setup e-mail data with unicode symbols
  var mailOptions = {
    from: '"CloseBrace" <contact@closebrace.com>', // sender address
    to: user.email, // list of receivers
    subject: 'Subscription Renewal Error', // Subject line
    text: 'Hello, we\`re trying to renew your subscription to CloseBrace Pro, but have encountered an unfortunate error: your card was declined. This could mean that your card has expired, or that you\'ve received a new card but haven\'t updated with our service. If you need to update your card information, you can do so at https://closebrace.com/account/profile ... we will try to bill your card three total times before cancelling your subscription (you will get this email each time if it continues to fail). If you want to stop those emails, you can also cancel your subscription at the previously-mentioned URL.', // plaintext body
    html: '<h3>Your Subscription Renewal Failed</h3><p>Hello, we\`re trying to renew your subscription to CloseBrace Pro, but have encountered an unfortunate error: your card was declined. This could mean that your card has expired, or that you\'ve received a new card but haven\'t updated with our service. If you need to update your card information, you can do so at https://closebrace.com/account/profile ... we will try to bill your card three total times before cancelling your subscription (you will get this email each time if it continues to fail). If you want to stop those emails, you can also cancel your subscription at the previously-mentioned URL.</p>' // html body
  };

  // send mail with defined transport object
  transporter.sendMail(mailOptions, function(error, info){
    return callback();
  });
}


User.schema.methods.cancelStripeSubscription = function(cancelType, callback) {
  var user = this;

  // On initial cancel, just send the emails, since there will still be time in the billing period
  if (cancelType === 'cancel-initial') {
    // create reusable transporter object using the default SMTP transport
    const mailString = `smtps://CloseBrace:${cbOptions.mandrill.apiKey}@smtp.mandrillapp.com`;
    var transporter = nodemailer.createTransport(mailString);

    // setup e-mail data with unicode symbols
    var mailOptions = {
      from: '"CloseBrace" <contact@closebrace.com>', // sender address
      to: user.email, // list of receivers
      subject: 'Subscription Cancelled', // Subject line
      text: 'We\'ve received a request to cancel your CloseBrace Pro subscription, and have done so. You will continue to enjoy Pro benefits until the end of your billing cycle. If you did not initiate this request, please email contact@closebrace immediately so that we can investigate. Thanks!', // plaintext body
      html: '<h3>Sorry to See You Go</h3><p>We\'ve received a request to cancel your CloseBrace Pro subscription, and have done so. You will continue to enjoy Pro benefits until the end of your billing cycle. If you did not initiate this request, please <a href="mailto:contact@closebrace.com">email contact@closebrace</a> immediately so that we can investigate. Thanks!</p>' // html body
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, function(error, info){
      return callback();
    });
  }

  // React to a final cancellation from Stripe
  if (cancelType === 'cancel-final') {
    user.stripeSubscriptionID = '';
    user.stripeSubscriptionType = '';
    user.stripeSubscriptionStart = '';
    user.isPro = false;
    user.isPlatinum = false;

    user.save(function(err) {
      if (err) return callback(err);
      return callback();
    });
  }
}

/**
 * Registration
 */
User.defaultColumns = 'name, email, isAdmin';
User.register();
