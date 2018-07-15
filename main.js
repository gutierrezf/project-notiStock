const ShopifyAPI = require('shopify-node-api');
const constants = require('./constants');
const Promise = require('promise');
const MailHelper = require('sendgrid').mail;
const SendGrid = require('sendgrid')(constants.SENDGRID_API_KEY);
const ShopModel = require('./model/shop');

const mailer = {};
const service = {};
const db = {
  shop: ShopModel.ShopInterface
};

exports.mailer = mailer;
exports.db = db;
exports.service = service;

mailer.send = function (to, subject, body) {
  const mail = new MailHelper.Mail();
  mail.setSubject(subject);
  mail.addContent(new MailHelper.Content('text/html', body));

  let email = new MailHelper.Email(constants.SENDGRID_USERNAME);
  mail.setFrom(email);

  const personalization = new MailHelper.Personalization();
  to.forEach((sendTo) => {
    email = new MailHelper.Email(sendTo);
    personalization.addTo(email);
  });
  mail.addPersonalization(personalization);

  const mailRequest = SendGrid.emptyRequest({
    method: 'POST',
    path: '/v3/mail/send',
    body: mail.toJSON(),
  });

  return new Promise((resolve, reject) => {
    SendGrid.API(mailRequest, (error, response) => {
      if (error) {
        console.error('error', error.response.body.errors);
        reject(error);
      } else {
        console.log(response.statusCode, 'mail send');
        resolve(response);
      }
    });
  });
};

function getRandomCode (length) {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 20; i += 1) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

service.authURL = function (shopName) {
  console.log(constants.TAGGER_PUBLIC_URL_ROOT);
  const Shopify = new ShopifyAPI({
    shop: shopName, // MYSHOP.myshopify.com
    shopify_api_key: constants.SHOPIFY_API_KEY,
    shopify_shared_secret: constants.SHOPIFY_API_SECRET, // Your Shared Secret
    shopify_scope: ['read_products'],
    redirect_uri: `${constants.SERVER_PUBLIC_URL_ROOT}authenticate`,
    // you must provide a randomly selected value unique for each authorization request
    nonce: getRandomCode(20),
    verbose: false
  });

  return Shopify.buildAuthURL();
};

service.fetchAuthToken = function (query) {
  return new Promise((resolve, reject) => {
    const Shopify = new ShopifyAPI({
      code: query.code,
      hmac: query.hmac,
      shop: query.shop,
      shopify_api_key: constants.SHOPIFY_API_KEY,
      shopify_shared_secret: constants.SHOPIFY_API_SECRET,
      nonce: query.state,
      timestamp: query.timestamp
    });

    Shopify.exchange_temporary_token(query, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data.access_token);
      }
    });
  });
};

service.getShopifyObject = function (shop) {
  return new ShopifyAPI({
    shop: shop.companyName, // MYSHOP.myshopify.com
    shopify_api_key: constants.SHOPIFY_API_KEY, // Your API key
    access_token: shop.accessToken, // Your API password
    shopify_shared_secret: constants.SHOPIFY_API_SECRET
  });
};
