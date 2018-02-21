const keystone = require('keystone');

const Enquiry = keystone.list('Enquiry');
const sanitizer = require('sanitizer');

module.exports = (req, res) => {
  const view = new keystone.View(req, res);
  const locals = res.locals;

  // Set locals
  locals.section = 'contact';
  locals.enquiryTypes = Enquiry.fields.enquiryType.ops;
  locals.formData = req.body || {};
  locals.validationErrors = {};
  locals.enquirySubmitted = false;

  // sanitize form data for obvious reasons
  for (const key in locals.formData) {
    // skip loop if the property is from prototype
    if (!locals.formData.hasOwnProperty(key)) continue;
    if (typeof locals.formData[key] === 'string') {
      locals.formData[key] = sanitizer.sanitize(locals.formData[key]);
    }
  }

  // On POST requests, add the Enquiry item to the database
  view.on('post', { action: 'contact' }, (next) => {

    // If no one's logged in, 404 dat bot!
    if (!req.user || req.user.length < 1 || req.user === '') {
      return res.status(404).send('Not found');
    }

    const newEnquiry = new Enquiry.model();
    const updater = newEnquiry.getUpdateHandler(req);

    updater.process(locals.formData, {
      flashErrors: true,
      fields: 'name, email, enquiryType, message',
      errorMessage: 'There was a problem submitting your enquiry:',
    }, (err) => {
      if (err) {
        locals.validationErrors = err.errors;
      }
      else {
        locals.enquirySubmitted = true;
      }
      newEnquiry.sendAlert(locals.formData['name.full'], next);
    });
  });

  view.render('contact');
};

exports = module.exports;
