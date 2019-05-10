const fs = require('fs');

const configPath = './options.json';
const parsed = JSON.parse(fs.readFileSync(configPath, 'UTF-8'));

exports.cloudinary = parsed.cloudinary;
exports.database = parsed.database;
exports.google = parsed.google;
exports.mailgun = parsed.mailgun;
exports.mandrill = parsed.mandrill;
exports.port = parsed.port;
exports.stripe = parsed.stripe;
