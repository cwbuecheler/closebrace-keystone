var fs = require('fs');
var configPath = './options.json';
var parsed = JSON.parse(fs.readFileSync(configPath, 'UTF-8'));
exports.port = parsed.port;
exports.cloudinary = parsed.cloudinary;
exports.google = parsed.google;
exports.stripe = parsed.stripe;
exports.database = parsed.database;