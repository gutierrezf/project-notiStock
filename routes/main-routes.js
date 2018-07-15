const express = require('express');
const co = require('co-express');
const provider = require('../main');

const router = express.Router();

router.use((req, res, next) => {
  console.log('Time: ', Date.now());
  console.log(req.originalUrl);
  next();
});

/****

 HOME TEMPLATE

****/

router.get('/', co(function * (req, res, next) {
  const { shop } = req.query;

  if (!shop) {
    res.redirect('/new');
    return;
  }

  const shopName = shop.split('.')[0];
  const localShop = yield provider.db.shop.findByName(shopName);

  if (!localShop || localShop.accessToken.length <= 0) {
    res.redirect(`/install?shop=${shopName}`);
    return;
  }
  res.render('home', { shopName });
}));

/****

 INSTALL APP

****/
router.get('/install', co(function * (req, res, next) {
  // check for empty shop query???
  const shopName = req.query.shop;

  if (shopName === 'undefined') {
    res.redirect('/error');
    return;
  }

  yield provider.db.shop.findOrCreate({ companyName: shopName });
  const url = provider.service.authURL(shopName);
  // redirects to /authenticate
  res.redirect(url);
}));

/****

 AUTHENTICATE CALLBACK

****/
router.get('/authenticate', co(function * (req, res, next) {
  const token = yield provider.service.fetchAuthToken(req.query);
  const { shop } = req.query;
  const shopName = shop.split('.')[0];

  yield provider.db.shop.saveShopToken(token, shopName);

  res.redirect(`/?shop=${shopName}`);
}));

/****

 NEW TEMPLATE

****/

router.get('/new', (req, res, next) => {
  const shopName = req.query.shop;

  if (shopName) {
    res.redirect(`/?shop=${shopName}`);
  }

  res.render('install-form', { shopName });
});

module.exports = router;
