var keystone = require('keystone');
var Types = keystone.Field.Types;
var md5 = require('js-md5');
var nodemailer = require('nodemailer');
var cbOptions = require('../options.js');

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
  confirmHash: { type: String, noedit: true },
  resetPasswordKey: { type: String, hidden: true },
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
    var mailString = 'smtps://' + cbOptions.google.mailAddress + ':' + cbOptions.google.mailPassword + '@smtp.gmail.com';
    var transporter = nodemailer.createTransport(mailString);

    // setup e-mail data with unicode symbols
    var mailOptions = {
      from: '"CloseBrace" <contact@closebrace.com>', // sender address
      to: user.email, // list of receivers
      subject: 'Reset Your CloseBrace Password', // Subject line
      text: 'We\'ve received a request to reset your password. Please visit this URL to complete the password reset: https://dev.closebrace.com/account/reset-password/' + user.resetPasswordKey + ' ... If you weren\'t the person who requested this change, don\'t worry - no changes can be made to your password without using that link. If you\'ve received this email repeatedly, you might be the target of a hacking attempt, and should email contact@closebrace immediately so that we can investigate. Thanks!', // plaintext body
      html: '<h3>Reset Your Password</h3><p>We\'ve received a request to reset your password.</p><p>Please visit this URL to complete the password reset: <a href="https://dev.closebrace.com/account/reset-password/' + user.resetPasswordKey + '">https://dev.closebrace.com/account/reset-password/' + user.resetPasswordKey + '</a></p><p>If you weren\'t the person who requested this change, don\'t worry - no changes can be made to your password without using that link. If you\'ve received this email repeatedly, you might be the target of a hacking attempt, and should email <a href="mailto:contact@closebrace.com">contact@closebrace.com</a> immediately so that we can investigate. Thanks!</p>' // html body
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, function(error, info){
      callback();
    });

  });
}

/**
 * Registration
 */
User.defaultColumns = 'name, email, isAdmin';
User.register();
