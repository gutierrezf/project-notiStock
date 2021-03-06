const ShopifyAPI = require('shopify-node-api');
const constants = require('./constants');
const Promise = require('promise');
const MailHelper = require('sendgrid').mail;
const SendGrid = require('sendgrid')(constants.SENDGRID_API_KEY);
const ShopModel = require('./model/shop');
const RestockModel = require('./model/restock');

const mailer = {};
const service = {};
const db = {
  shop: ShopModel.ShopInterface,
  restock: RestockModel.RestockInterface
};

exports.mailer = mailer;
exports.db = db;
exports.service = service;
exports.constants = constants;

mailer.send = function (params) {
  const { to, subject, body, from } = params;
  const mail = new MailHelper.Mail();
  mail.setSubject(subject);
  mail.addContent(new MailHelper.Content('text/html', body));

  let email = new MailHelper.Email(from);
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

function getRandomCode () {
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
    shopify_shared_secret: constants.SHOPIFY_API_SECRET,
    verbose: false
  });
};

service.getAllShopifyProducts = (shop, filter = () => true) => {
  let allProducts = [];
  let Shopify = service.getShopifyObject(shop);
  return getProductPromise(Shopify);

  function getProductPromise(shop, page = 1) {
    return service.getProducts(shop, page, 'id,variants')
      .then((products) => {
        products = products || [];
        if (products.length > 0) {
          allProducts = [...allProducts, ...products.filter(filter)];
          return getProductPromise(shop, page + 1);
        } else {
          console.log(`${allProducts.length} results found`);
          return allProducts;
        }
      });
  }
};

service.getProducts = function (Shopify, page = 1, fields = '') {
  let url = `/admin/products.json?limit=240&published_status=published&page=${page}&fields=${fields}`;
  console.log(`fetching: ${url}`);

  return new Promise((success, reject) => {
    Shopify.get(url, (err, data) => {
      if (err) {
        reject(err);
      } else {
        success(data.products);
      }
    });
  });
};
