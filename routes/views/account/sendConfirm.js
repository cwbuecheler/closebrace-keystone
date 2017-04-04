var keystone = require('keystone');
var nodemailer = require('nodemailer');
var cbOptions = require('../../../options.js');

exports = module.exports = function (req, res) {

  var view = new keystone.View(req, res);
  var locals = res.locals;
  locals.section = 'account';

  // Turn off ads on this page
  locals.hideAds = true;

  view.on('init', function(next) {

    // create reusable transporter object using the default SMTP transport
    var mailString = 'smtps://' + cbOptions.google.mailAddress + ':' + cbOptions.google.mailPassword + '@smtp.gmail.com';
    var transporter = nodemailer.createTransport(mailString);
    var userConfirm = req.user.confirmHash;

    // setup e-mail data with unicode symbols
    var mailOptions = {
      from: '"CloseBrace" <contact@closebrace.com>', // sender address
      to: req.user.email, // list of receivers
      subject: 'Please Confirm Your CloseBrace Account', // Subject line
      text: 'Thanks for registering with CloseBrace. You can confirm your account by visiting the following URL: https://closebrace.com/account/confirm?conf=' + userConfirm + ' ... If you did not sign up for CloseBrace and someone has used your email address by mistake, you don\'t need to do anything. This account will not be emailed again (unless a re-send of this confirmation email is requested), and will be automatically deleted in ten days.', // plaintext body
      html: '<h3>Welcome to CloseBrace</h3><p>Thanks for registering with CloseBrace, the tutorial and resource site for JavaScript developers, by JavaScript developers.</p><p>You can confirm your account by visiting the following URL: <a href="https://closebrace.com/account/confirm?conf=' + userConfirm + '" target="_blank">https://closebrace.com/account/confirm?conf=' + userConfirm + '</a></p><p>If you did not sign up for CloseBrace and someone has used your email address by mistake, you don\'t need to do anything. This account will not be emailed again (unless a re-send of this confirmation email is requested), and will be automatically deleted in ten days.</p>' // html body
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, function(error, info){
      if(error){
        req.flash('error', { title: 'Unable to send email', detail: error });
        return next();
      }
      req.flash('success', { detail: 'We\'ve re-sent your confirmation. Please check your email and click or copy-n-paste the provided link, which will make the notice below go away.'})
      res.redirect('/account/profile');
    });

  });

  view.render('account/profile');

};
