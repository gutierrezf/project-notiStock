const express = require('express');
const co = require('co-express');
const provider = require('../main');
const jade = require('jade');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const emailTemplate = fs.readFileSync(path.join(__dirname, '/../views/mail-template.jade'), 'utf8');

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
      domain: provider.constants.SERVER_PUBLIC_URL_ROOT,
      productImage: `https:${formData.imageUrl}`,
      productName: `${formData.productTitle} - ${formData.variant}`,
      promoLink: localShop.promoLink,
      promoImage: localShop.promoImage,
      storeLogo: localShop.storeLogo,
    };

    const html = jade.compile(emailTemplate, { basedir: __dirname })({ emailTemplateData });

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

  // const emailObj = {
  //   to: ['ingutierrez.u@gmail.com'],
  //   from: 'ghimicelli-restock@service.com',
  //   subject: 'Restock Notification Request Submited - preview',
  //   body: html
  // };

  // provider.mailer.send(emailObj.to, emailObj.subject, emailObj.body);


  res.send(html);
});

module.exports = router;
