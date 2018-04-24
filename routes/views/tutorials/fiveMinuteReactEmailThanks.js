const keystone = require('keystone');

module.exports = (req, res) => {
  const view = new keystone.View(req, res);
  const locals = res.locals;

  // Set locals
  locals.section = 'tutorials';

  view.render('tutorials/fiveMinuteReactEmailThanks');
};

exports = module.exports;
