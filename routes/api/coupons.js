const keystone = require('keystone');
const sanitizer = require('sanitizer');

exports.check = (req, res) => {
  console.log('body: ', req.body);
}