const keystone = require('keystone');

const Course = keystone.list('Course');
const Post = keystone.list('Post');

exports = (req, res) => {
  const view = new keystone.View(req, res);
  const locals = res.locals;

  // locals.section is used to set the currently selected
  // item in the header navigation.
  locals.section = 'lessons';

  // Get course information
  view.on('init', (next) => {
    const q = Course.model.findOne({
      slug: req.params.course,
    });

    q.exec((err, result) => {
      if (!result || !result.slug || result.slug !== req.params.course) {
        locals.error = 'We couldn\'t find this course. Please check the URL and try again.';
        return next(err);
      }

      locals.courseId = result._id.toString();
      locals.courseName = result.name;

      return next(err);
    });
  });

  // Load requested posts
  view.on('init', (next) => {
    // If the user's not logged in, reject the request
    if (!locals.user) {
      locals.error = 'Please log in to see your lessons';
      return next();
    }

    // If the user doesn't have access to this course, reject the request
    const userCourses = locals.user.courses.map(item => item.toString());
    console.log(userCourses);
    const userHasCourse = userCourses.includes(locals.courseId);
    console.log(userHasCourse);
    if (!userHasCourse) {
      locals.error = 'This user account does not currently have access to this course. If you think this is incorrect, please <a href="/contact">get in touch</a> and we\'ll be happy to help!';
      return next();
    }

    const q = Post.model.find({
      state: 'published',
      postType: 'Lesson',
      hideFromIndex: false,
      course: locals.courseId,
    })
    .sort('publishedAt')
    .populate('author categories');

    q.exec((err, results = []) => {
      // If no posts, move along
      if (results.length < 1) {
        locals.posts = null;
        return next(err);
      }

      locals.posts = results;

      return next(err);
    });
  });

  // Render the view
  view.render('courses/courseList');
};

module.exports = exports;
