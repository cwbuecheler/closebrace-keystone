/**
 * This file is where you define your application routes and controllers.
 *
 * Start by including the middleware you want to run for every request;
 * you can attach middleware to the pre('routes') and pre('render') events.
 *
 * For simplicity, the default setup for route controllers is for each to be
 * in its own file, and we import all the files in the /routes/views directory.
 *
 * Each of these files is a route controller, and is responsible for all the
 * processing that needs to happen for the route (e.g. loading data, handling
 * form submissions, rendering the view template, etc).
 *
 * Bind each route pattern your application should respond to in the function
 * that is exported from this module, following the examples below.
 *
 * See the Express application routing documentation for more information:
 * http://expressjs.com/api.html#app.VERB
 */

var keystone = require('keystone');
var middleware = require('./middleware');
var importRoutes = keystone.importer(__dirname);
var RateLimit = require('express-rate-limit');

// Common Middleware
keystone.pre('routes', middleware.initLocals);
keystone.pre('render', middleware.flashMessages);

// Import Route Controllers
var routes = {
	views: importRoutes('./views'),
};

// Setup Route Bindings
exports = module.exports = function (app) {

  // needed for rate limiter
  app.enable('trust proxy');

  var apiLimiter = new RateLimit({
    windowMs: 15*60*1000, // 15 minutes 
    max: 100,
    delayMs: 0 // disabled 
  });

	// Views
	app.get('/', routes.views.index);
  app.get('/about', routes.views.about);
  app.all('/account/avatar-upload', apiLimiter, routes.views.account.avatarUpload);
  app.get('/account/confirm', routes.views.account.confirm);
  app.all('/account/delete-account', apiLimiter, routes.views.account.deleteAccount);
  app.all('/account/edit-profile', apiLimiter, routes.views.account.editProfile);
  app.all('/account/forgot-password', apiLimiter, routes.views.account.forgotPassword);
  app.all('/account/log-in', apiLimiter, routes.views.account.login);
  app.get('/account/log-out', routes.views.account.logout);
  app.all('/account/profile', apiLimiter, routes.views.account.profile);
  app.all('/account/register', apiLimiter, routes.views.account.register);
  app.get('/account/registration-success', routes.views.account.registrationSuccess);
  app.all('/account/reset-password/:key', apiLimiter, routes.views.account.resetPassword);
  app.get('/articles', routes.views.articles.articlesIndex);
  app.get('/articles/:post', routes.views.articles.post);
  app.all('/contact', apiLimiter, routes.views.contact);
  app.get('/community-guidelines', routes.views.communityGuidelines);
  app.get('/privacy-policy', routes.views.privacyPolicy);
  app.get('/tags/:tag', routes.views.tags.tagsIndex);
  app.get('/terms-of-service', routes.views.termsOfService);
  app.get('/tutorials', routes.views.tutorials.tutorialsIndex);
  app.get('/tutorials/:post', routes.views.tutorials.post);
  app.get('/u/:username', routes.views.publicProfile)

	// NOTE: To protect a route so that only admins can see it, use the requireUser middleware:
	// app.get('/protected', middleware.requireUser, routes.views.protected);

};
