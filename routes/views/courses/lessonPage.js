const keystone = require('keystone');

exports = (req, res) => {
  const view = new keystone.View(req, res);
  const locals = res.locals;

  // locals.section is used to set the currently selected
  // item in the header navigation.
  locals.section = 'lessons';

  // Render the view
  view.render('courses/lessonPage');
};

module.exports = exports;
