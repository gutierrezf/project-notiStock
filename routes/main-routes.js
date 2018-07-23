const express = require('express');
const co = require('co-express');
const provider = require('../main');
const jade = require('jade');
const fs = require('fs');
const path = require('path');
const schedule = require('node-schedule');

const notificationEmailTemplate = fs.readFileSync(path.join(__dirname, '/../views/notification-mail-template.jade'), 'utf8');

const router = express.Router();

router.use((req, res, next) => {
  console.log('Time: ', Date.now());
  console.log(req.originalUrl);
  next();
});

const notificationSolver = co(function * (){
  const shopName = 'ghimicelli';
  const localShop = yield provider.db.shop.findByName(shopName);
  const requests = yield provider.db.restock.find({ shop: shopName, status: 0 });

  const extractProductIds = (items) => {
    const ids = {};
    items.forEach((item) => {
      ids[item.productID] = 1;
    });
    return Object.keys(ids);
  };

  const productIds = extractProductIds(requests);
  const filterCallback = product => productIds.includes(`${product.id}`);

  return yield provider.service.getAllShopifyProducts(localShop, filterCallback)
    .then((products) => {
      const restockNotifications = [];
      requests.forEach((restockObj) => {
        const product = products.find(p => p.id == restockObj.productID);
        const variant = product.variants.find(v => v.option1 == restockObj.variant);

        if (variant.inventory_quantity > 0) {
          restockNotifications.push(restockObj);
        }

      });
      return restockNotifications;
    })
    .then((notifications) => {
      const promiseArray = notifications.map((notification) => {
        const productName = `${notification.productTitle} - ${notification.variant}`;
        console.log(`sending restock email to: ${notification.customerEmail}, for ${productName}`);

        const emailTemplateData = {
          productImage: `https:${notification.imageUrl}`,
          productName: `${productName}`,
          productLink: `${notification.productUrl}`,
          storeLogo: localShop.storeLogo,
          notificationP1: localShop.notificationP1,
          notificationP2: localShop.notificationP2,
        };

        const html = jade.compile(notificationEmailTemplate, { basedir: __dirname })({ emailTemplateData });

        const emailObj = {
          to: [notification.customerEmail, localShop.email],
          from: 'restocknotification@ghimicelli.com',
          subject: `${productName} is back in stock!`,
          body: html
        };

        return provider.mailer.send(emailObj)
          .then(() => {
            notification.status = 1;
            notification.fulfilled_at = Date.now();
            return provider.db.restock.update(notification);
          });
      });

      return Promise.all(promiseArray);
    });
});

router.post('/sync', (req, res) => {
  notificationSolver();

  res.send({ success: true, statusCode: 200 });
});

schedule.scheduleJob('* 0 * * *', function() {
  console.log('schedule job started');
  console.log('Time: ', Date.now());
  notificationSolver()
    .then(()=> {
      console.log('schedule job finished');
    });
});

/****

 HOME TEMPLATE

****/

router.get('/', co(function * (req, res) {
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

  const notifications = yield provider.db.restock.find({ shop: shopName, status: 0 });

  res.render('home', { shopName, notifications });
}));

/****

 INSTALL APP

****/
router.get('/install', co(function * (req, res) {
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
router.get('/authenticate', co(function * (req, res) {
  const token = yield provider.service.fetchAuthToken(req.query);
  const { shop } = req.query;
  const shopName = shop.split('.')[0];

  yield provider.db.shop.saveShopToken(token, shopName);

  res.redirect(`/?shop=${shopName}`);
}));

/****

 NEW TEMPLATE

****/

router.get('/new', (req, res) => {
  const shopName = req.query.shop;

  if (shopName) {
    res.redirect(`/?shop=${shopName}`);
  }

  res.render('install-form', { shopName });
});

module.exports = router;
