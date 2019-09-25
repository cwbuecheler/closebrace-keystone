const keystone = require('keystone');

module.exports = (req, res) => {
  const view = new keystone.View(req, res);
  const locals = res.locals;

  // Set locals
  locals.section = 'home';

  view.render('newsletter/reconfirm');
};

exports = module.exports;
