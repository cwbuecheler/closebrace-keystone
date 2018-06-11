const keystone = require('keystone');
const sanitizer = require('sanitizer');

const Coupon = keystone.list('Coupon');

/**
 * Check Coupon Code
 */
exports.check = (req, res) => {
  // avoid injection nonsense
  sanitizer.sanitize(req.body.couponCode);

  const query = Coupon.model.findOne({
    code: req.body.couponCode,
  });

  query.exec((err, results) => {
    // Catch errors
    if (err) {
      return res.apiError('error', err);
    }

    // Catch no result
    if (!results || results.length < 1) {
      return res.apiError('error', 'Coupon Code Not Found');
    }

    // Catch non-matching courses
    const resultCourses = JSON.parse(JSON.stringify(results.courses));
    let match = false;
    req.body.courses.forEach((course) => {
      if (resultCourses.includes(course)) {
        match = true;
      }
    });
    if (!match) {
      return res.apiError('error', 'Coupon does not match course');
    }

    // Catch expired coupons
    const expiration = new Date(results.expiration);
    const now = Date.now();
    if (expiration < now) {
      return res.apiError('error', 'Sorry, that coupon has expired');
    }

    return res.json(results);
  });
};
