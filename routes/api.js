const express = require('express');
const co = require('co-express');
const provider = require('../main');
const jade = require('jade');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const emailTemplate = fs.readFileSync(path.join(__dirname, '/../views/mail-template.jade'), 'utf8');
const confirmEmailTemplate = fs.readFileSync(path.join(__dirname, '/../views/replay-mail-template.jade'), 'utf8');
const notificationEmailTemplate = fs.readFileSync(path.join(__dirname, '/../views/notification-mail-template.jade'), 'utf8');

router.post('/notify-request', co(function * (req, res) {
  const formData = req.body;
  const query = {
    productUrl: formData.productUrl,
    customerEmail: formData.customerEmail
  };

  const restock = yield provider.db.restock.findOrCreate(query);

  if (restock.created) {
    provider.db.restock.updateAll(query, formData);

    const shopName = req.body.shop;
    const localShop = yield provider.db.shop.findByName(shopName);

    const emailTemplateData = {
      productImage: `https:${formData.imageUrl}`,
      productName: `${formData.productTitle} - ${formData.variant}`,
      promoLink: localShop.promoLink,
      promoImage: localShop.promoImage,
      storeLogo: localShop.storeLogo,
      replyP1: localShop.replyP1,
      replyP2: localShop.replyP2,
      replyP3: localShop.replyP3
    };

    const html = jade.compile(confirmEmailTemplate, { basedir: __dirname })({ emailTemplateData });

    const emailObj = {
      to: [formData.customerEmail],
      from: 'restocknotification@ghimicelli.com',
      subject: `Request Submited - ${formData.productTitle} - ${formData.variant}`,
      body: html
    };

    provider.mailer.send(emailObj)
      .then(() => {
        emailObj.to = [localShop.email];
        emailObj.from = formData.customerEmail;
        emailObj.subject = emailObj.subject;
        return provider.mailer.send(emailObj);
      });
  }

  res.send({ success: true, statusCode: 200 });
}));

router.get('/preview', (req, res) => {
  const emailTemplateData = {
    domain: provider.constants.SERVER_PUBLIC_URL_ROOT,
    productImage: 'https://cdn.shopify.com/s/files/1/0629/7769/products/70-Times-7--Shirt--Triblend-drk-gray-on-gray_300x.png?v=1529035427',
    promoLink: 'www.google.com',
    promoImage: '',
    storeLogo: ''
  };

  const html = jade.compile(emailTemplate, { basedir: __dirname })({ emailTemplateData });

  res.send(html);
});

router.get('/preview-confirmation', co(function * (req, res) {
  const shopName = req.query.shop.split('.')[0];
  const shop = yield provider.db.shop.findByName(shopName);

  const emailTemplateData = {
    storeLogo: shop.storeLogo,
    productImage: 'https://cdn.shopify.com/s/files/1/0629/7769/products/70-Times-7--Shirt--Triblend-drk-gray-on-gray_300x.png?v=1529035427',
    promoLink: shop.productLink,
    promoImage: shop.promoImage,
    replyP1: shop.replyP1,
    replyP2: shop.replyP2,
    replyP3: shop.replyP3,
    productName: 'product name - variant'
  };

  const html = jade.compile(confirmEmailTemplate, { basedir: __dirname })({ emailTemplateData });

  res.send(html);
}));

router.get('/preview-notification', co(function * (req, res) {
  const shopName = req.query.shop.split('.')[0];
  const shop = yield provider.db.shop.findByName(shopName);

  const emailTemplateData = {
    storeLogo: shop.storeLogo,
    productImage: 'https://cdn.shopify.com/s/files/1/0629/7769/products/70-Times-7--Shirt--Triblend-drk-gray-on-gray_300x.png?v=1529035427',
    notificationP1: shop.notificationP1,
    notificationP2: shop.notificationP2,
    productName: 'product name - variant',
    productLink: 'https://www.ghimicelli.com/products/anthologie-black-wy'
  };

  const html = jade.compile(notificationEmailTemplate, { basedir: __dirname })({ emailTemplateData });

  res.send(html);
}));

module.exports = router;
