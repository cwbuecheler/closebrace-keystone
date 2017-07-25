var express = require('express');
var app = express();
var helmet = require('helmet');
var Email = require('keystone-email')

// Simulate config options from your production environment by
// customising the .env file in your project's root folder.
require('dotenv').config();

// Require keystone
var keystone = require('keystone');
var handlebars = require('express-handlebars');
var cbOptions = require('./options.js');

// Initialise Keystone with your project's configuration.
// See http://keystonejs.com/guide/config for available options
// and documentation.

//Add your middleware
app.use(helmet());

keystone.init({
	'name': 'CloseBrace',
	'brand': 'CloseBrace',
	'port': cbOptions.port,
	'sass': 'public',
	'static': 'public',
	'favicon': 'public/favicon.ico',
	'views': 'templates/views',
	'view engine': 'hbs',

	'custom engine': handlebars.create({
		layoutsDir: 'templates/views/layouts',
		partialsDir: 'templates/views/partials',
		defaultLayout: 'default',
		helpers: new require('./templates/views/helpers')(),
		extname: '.hbs',
	}).engine,

	'auto update': true,
	'mongo': process.env.MONGO_URI,
	'session': true,
	'session store': 'mongo',
	'auth': true,
	'cloudinary': true,
	'user model': 'User',
});

// Cloudinary Config
var cloudinaryKeys = 'cloudinary://' + cbOptions.cloudinary.publicKey + ':' + cbOptions.cloudinary.privateKey + '@closebrace';
keystone.set('cloudinary config', cloudinaryKeys );
keystone.set('cloudinary secure', true);

// Load your project's Models
keystone.import('models');



// Setup common locals for your templates. The following are required for the
// bundled templates and layouts. Any runtime locals (that should be set uniquely
// for each request) should be added to ./routes/middleware.js
keystone.set('locals', {
	_: require('lodash'),
	env: keystone.get('env'),
	utils: keystone.utils,
	editable: keystone.content.editable,
});

// Load your project's Routes
keystone.set('routes', require('./routes'));

// Switch Keystone Email defaults to handlebars
// new Email(template, emailOptions)
// keystone.Email.defaults.templateExt = 'hbs';
// keystone.Email.defaults.templateEngine = require('handlebars');


// Configure the navigation bar in Keystone's Admin UI
keystone.set('nav', {
	Content: ['posts', 'tags', 'comments', 'PostCategory'],
	enquiries: 'enquiries',
	users: 'users',
});

// Start Keystone to connect to your database and initialise the web server

keystone.start();
