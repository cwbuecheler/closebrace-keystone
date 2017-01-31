var keystone = require('keystone');

var Comment = keystone.list('Comment');

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
  item.getUpdateHandler(req).process(data, function(err) {
    if (err) { return res.apiError('error', err) };
    res.apiResponse({
      comment: item
    });
  });
}

/**
 * Get Comment by ID
 */
exports.update = function(req, res) {
  Comment.model.findById(req.params.id).exec(function(err, item) {
    if (err) { return res.apiError('database error', err) };
    if (!item) { return res.apiError('not found') };
    var data = (req.method == 'POST') ? req.body : req.query;
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