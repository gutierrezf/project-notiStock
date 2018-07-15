exports.SERVER_PUBLIC_URL_ROOT = process.env.SERVER_PUBLIC_URL_ROOT || 'https://97bbe399.ngrok.io/';
exports.SERVER_ROOT_PATH = process.env.SERVER_ROOT_PATH || 'localhost';
exports.SENDGRID_USERNAME = process.env.SENDGRID_USERNAME || 'service@mailapp.com';

if (process.env.PROD) {
  exports.SHOPIFY_API_SECRET = process.env.SHOPIFY_API_SECRET;
  exports.SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY;
  exports.DB_URL = process.env.MONGODB_URI;
  exports.SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
} else {
  const local = require('./local');
  exports.SHOPIFY_API_SECRET = local.SHOPIFY_API_SECRET;
  exports.SHOPIFY_API_KEY = local.SHOPIFY_API_KEY;
  exports.DB_URL = local.DB_URL;
  exports.SENDGRID_API_KEY = local.SENDGRID_API_KEY;
}
