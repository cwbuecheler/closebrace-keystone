var keystone = require('keystone');
var sanitizer = require('sanitizer');
var nodemailer = require('nodemailer');
var cbOptions = require('../../options.js');

var Comment = keystone.list('Comment');
var User = keystone.list('User');

/**
 * List Comments
 */
exports.list = function(req, res) {
  Comment.model.find(function(err, items) {
    if (err) { return res.apiError('database error', err) };
    res.apiResponse({
      comments: items
    });

  });
}

/**
 * Get Comment by ID
 */
exports.get = function(req, res) {
  Comment.model.findById(req.params.id).exec(function(err, item) {
    if (err) { return res.apiError('database error', err) };
    if (!item) { return res.apiError('not found') };
    res.apiResponse({
      comments: item
    });
  });
}

/**
 * Create a Comment
 */
exports.create = function(req, res) {
  var item = new Comment.model();
  var data = (req.method == 'POST') ? req.body : req.query;

  // sanitize form data
  for (var key in data) {
    // skip loop if the property is from prototype
    if (!data.hasOwnProperty(key)) continue;
    if (typeof data[key] === 'string') {
      data[key] = sanitizer.sanitize(data[key]);
    }
  }

  item.getUpdateHandler(req).process(data, function(err) {
    if (err) { return res.apiError('error', err) };
    res.apiResponse({
      comment: item
    });
  });
}

/**
 * Update Comment by ID
 */
exports.update = function(req, res) {
  Comment.model.findById(req.params.id).exec(function(err, item) {
    if (err) { return res.apiError('database error', err) };
    if (!item) { return res.apiError('not found') };
    var data = (req.method == 'POST') ? req.body : req.query;

    // Make sure the user requesting the update is the user who posted the comment
    if (String(item.author) !== String(data.userID)) {
      return res.apiResponse({ success: false });
    }

    item.getUpdateHandler(req).process(data, function(err) {
      if (err) return res.apiError('create error', err);
      res.apiResponse({
        comment: item
      });
    });
  });
}

/**
 * Delete Comment by ID
 */
exports.remove = function(req, res) {

  // Make sure the user requesting the delete is an admin
  User.model.findById(req.body.userID).exec(function (err, user) {
    if (err) { return res.apiError('database error', err) };
    if (!user) {
      return res.apiResponse({ success: false });
    }
  });

  Comment.model.findById(req.params.id).exec(function (err, item) {
    if (err) { return res.apiError('database error', err) };
    if (!item) { return res.apiError('not found') };
    item.remove(function (err) {
      if (err) { return res.apiError('database error', err) };
      return res.apiResponse({
        success: true
      });
    });
  });
}

/**
 * Flag Comment by ID
 */
exports.flag = function(req, res) {
  Comment.model.findById(req.body.id).exec(function (err, item) {
    if (err) { return res.apiError('database error', err) };
    if (!item) { return res.apiError('not found') };
    var flags = item.flags + 1;
    item.flaggers.push(req.body.flagger);
    var data = { isFlagged: true, flags: flags, flaggers: item.flaggers };
    if (flags > 2) {
      data.state = 'hidden';
    }
    item.getUpdateHandler(req).process(data, function(err) {
      if (err) return res.apiError('create error', err);

      // create reusable transporter object using the default SMTP transport
      var mailString = 'smtps://' + cbOptions.google.mailAddress + ':' + cbOptions.google.mailPassword + '@smtp.gmail.com';
      var transporter = nodemailer.createTransport(mailString);

      // setup e-mail data with unicode symbols
      var mailOptions = {
        from: '"CloseBrace" <contact@closebrace.com>', // sender address
        to: 'flags@closebrace.com', // list of receivers
        subject: 'Flagged Comment', // Subject line
        text: 'Moderate flagged comment: http://closebrace.com/keystone/comments/' + req.body.id, // plaintext body
        html: '<p>Moderate flagged comment: <a href="http://closebrace.com/keystone/comments/' + req.body.id + '">http://closebrace.com/keystone/comments/' + req.body.id + '</a>' // html body
      };

      // send mail with defined transport object
      transporter.sendMail(mailOptions, function(error, info){
        if(error) { console.log(error); }
      });

      res.apiResponse({
        comment: item
      });
    });
  });
}