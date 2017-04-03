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
var cbOptions = require('../options.js');

// Common Middleware
keystone.pre('routes', middleware.initLocals);
keystone.pre('render', middleware.flashMessages);

// Import Route Controllers
var routes = {
	views: importRoutes('./views'),
  api: importRoutes('./api'),
};

// Setup Route Bindings
exports = module.exports = function (app) {

  // needed for rate limiter
  app.enable('trust proxy');

  var postLimiter = new RateLimit({
    windowMs: 15*60*1000, // 15 minutes 
    max: 100,
    delayMs: 0 // disabled 
  });

	// Views
	app.get('/', routes.views.index);
  app.get('/about', routes.views.about);
  app.all('/account/avatar-upload', postLimiter, routes.views.account.avatarUpload);
  app.all('/account/cancel-pro-subscription', postLimiter, routes.views.account.cancelProSubscription)
  app.get('/account/confirm', routes.views.account.confirm);
  app.all('/account/delete-account', postLimiter, routes.views.account.deleteAccount);
  app.all('/account/edit-profile', postLimiter, routes.views.account.editProfile);
  app.all('/account/forgot-password', postLimiter, routes.views.account.forgotPassword);
  app.all('/account/log-in', postLimiter, routes.views.account.login);
  app.get('/account/log-out', routes.views.account.logout);
  app.all('/account/profile', postLimiter, routes.views.account.profile);
  app.all('/account/register', postLimiter, routes.views.account.register);
  app.get('/account/registration-success', routes.views.account.registrationSuccess);
  app.all('/account/reset-password/:key', postLimiter, routes.views.account.resetPassword);
  app.get('/account/sendconfirm', routes.views.account.sendConfirm);
  app.all('/account/update-pro-subscription', routes.views.account.updateProSubscription);
  app.get('/articles', routes.views.articles.articlesIndex);
  app.get('/articles/:date/:post', routes.views.articles.post);
  app.get('/categories/:category', routes.views.categories.categoriesIndex);
  app.all('/contact', postLimiter, routes.views.contact);
  app.get('/community-guidelines', routes.views.communityGuidelines);
  app.get('/go-pro', routes.views.goPro);
  app.get('/go-pro-thanks', routes.views.goProThanks);
  app.get('/privacy-policy', routes.views.privacyPolicy);
  app.all('/search', postLimiter, routes.views.searchResults);
  app.get('/tags/:tag', routes.views.tags.tagsIndex);
  app.get('/terms-of-service', routes.views.termsOfService);
  app.get('/tutorials', routes.views.tutorials.tutorialsIndex);
  app.get('/tutorials/:date/:post', routes.views.tutorials.post);
  app.get('/u/:username', routes.views.publicProfile)

  // API
  app.get('/api/comments/list', keystone.middleware.api, routes.api.comments.list);
  app.all('/api/comments/create', keystone.middleware.api, routes.api.comments.create);
  app.get('/api/comments/:id', keystone.middleware.api, routes.api.comments.get);
  app.post('/api/comments/:id/update', keystone.middleware.api, routes.api.comments.update);
  app.post('/api/comments/:id/remove', keystone.middleware.api, routes.api.comments.remove);
  app.all('/api/comments/flag', keystone.middleware.api, routes.api.comments.flag);
  app.all('/api/pro/register', keystone.middleware.api, routes.api.pro.register);
  //app.all('/api/stripe/events',  stripeWebhook.middleware, middleware.stripeEvents)
  app.post('/api/stripe/events', routes.api.stripe.stripeEvents);

	// NOTE: To protect a route so that only admins can see it, use the requireUser middleware:
	// app.get('/protected', middleware.requireUser, routes.views.protected);

};
