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

const keystone = require('keystone');
const middleware = require('./middleware');
const RateLimit = require('express-rate-limit');

const importRoutes = keystone.importer(__dirname);
// const cbOptions = require('../options.js');

// Common Middleware
keystone.pre('routes', middleware.initLocals);
keystone.pre('render', middleware.flashMessages);

// Import Route Controllers
const routes = {
  views: importRoutes('./views'),
  api: importRoutes('./api'),
};

// Setup Route Bindings
module.exports = (app) => {
  // needed for rate limiter
  app.enable('trust proxy');

  const postLimiter = new RateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    delayMs: 0, // disabled
  });

  // Views
  // app.get('/', routes.views.index);
  app.get('/', routes.views.categories.categoriesIndex);
  app.get('/about', routes.views.about);
  app.all('/account/avatar-upload', postLimiter, routes.views.account.avatarUpload);
  app.all('/account/cancel-pro-subscription', postLimiter, routes.views.account.cancelProSubscription);
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
  app.get('/categories/test/:category', routes.views.categories.test);
  app.get('/cheatSheetThanks', routes.views.cheatSheetThanks);
  app.all('/comments/unsubscribe/:id', routes.views.comments.unsubscribe);
  app.get('/community-guidelines', routes.views.communityGuidelines);
  app.all('/contact', postLimiter, routes.views.contact);
  app.get('/courses/', routes.views.courses.coursesIndex);
  app.get('/courses/:course', routes.views.courses.courseList);
  app.get('/courses/:course/:slug', routes.views.courses.lessonPage);
  app.get('/emailThanks', routes.views.emailThanks);
  app.get('/expressjscheatsheet', routes.views.expressJSCheatSheet);
  // app.get('/go-pro', routes.views.goPro);
  // app.get('/go-pro-thanks', routes.views.goProThanks);
  app.get('/newsletter/reconfirm', routes.views.newsletter.reconfirm);
  app.get('/newsletter/sponsor', routes.views.newsletter.sponsor);
  app.get('/newsletter/sponsor-thanks', routes.views.newsletter.sponsorThanks);
  // app.get('/newsletter/subscribe', routes.views.newsletter.subscribe);
  app.get('/newsletter/subscribe', routes.views.categories.categoriesIndex);
  app.get('/newsletter/thanks', routes.views.newsletter.thanks);
  app.get('/privacy-policy', routes.views.privacyPolicy);
  app.all('/search', postLimiter, routes.views.searchResults);
  app.get('/terms-of-service', routes.views.termsOfService);
  app.get('/tutorials', routes.views.tutorials.tutorialsIndex);
  app.get('/tutorials/:date/:post', routes.views.tutorials.post);
  app.get('/tutorials/dead-simple-react-native-email-thanks', routes.views.tutorials.deadSimpleReactNativeEmailThanks);
  app.get('/tutorials/five-minute-react-email-thanks', routes.views.tutorials.fiveMinuteReactEmailThanks);
  app.get('/tutorials/five-minute-react-thanks', routes.views.tutorials.fiveMinuteReactThanks);
  app.get('/tutorials/list/:category/:code', routes.views.tutorials.list);
  app.get('/u/:username', routes.views.index);

  // API
  app.get('/api/comments/list', keystone.middleware.api, routes.api.comments.list);
  app.get('/api/comments/getByArticleId', keystone.middleware.api, routes.api.comments.getByArticleId);
  app.all('/api/comments/create', keystone.middleware.api, routes.api.comments.create);
  app.post('/api/comments/plusone', keystone.middleware.api, routes.api.comments.plusone);
  app.get('/api/comments/:id', keystone.middleware.api, routes.api.comments.get);
  app.post('/api/comments/:id/update', keystone.middleware.api, routes.api.comments.update);
  app.post('/api/comments/:id/remove', keystone.middleware.api, routes.api.comments.remove);
  app.all('/api/comments/flag', keystone.middleware.api, routes.api.comments.flag);
  app.all('/api/coupons/check', keystone.middleware.api, routes.api.coupons.check);
  app.all('/api/pro/register', keystone.middleware.api, routes.api.pro.register);
  app.post('/api/purchase', keystone.middleware.api, routes.api.purchase.course);
  app.post('/api/sponsor', keystone.middleware.api, routes.api.sponsor.purchase);
  // app.all('/api/stripe/events',  stripeWebhook.middleware, middleware.stripeEvents)
  app.post('/api/stripe/events', routes.api.stripe.stripeEvents);

  // NOTE: To protect a route so that only admins can see it, use the requireUser middleware:
  // app.get('/protected', middleware.requireUser, routes.views.protected);
};

exports = module.exports;
