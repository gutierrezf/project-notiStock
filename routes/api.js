const express = require('express');
const co = require('co-express');
const provider = require('../main');
const jade = require('jade');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const emailTemplate = fs.readFileSync(path.join(__dirname, '/../views/mail-template.jade'), 'utf8');

router.post('/notify-request', co(function * (req, res) {
  const shopName = req.query.shop;
  const formData = req.body;
  const html = jade.compile(emailTemplate, { basedir: __dirname })({ formData });
  const localShop = yield provider.db.shop.findByName(shopName);

  const emailObj = {
    to: localShop.email,
    subject: 'Price Request',
    body: html
  };

  provider.mailer.send(emailObj.to, emailObj.subject, emailObj.body)
    .then(() => {
      provider.mailer.send({
        to: [formData.email],
        subject: 'Price Request Submited',
        body: '<p>Thank you for your request, one of our sales representatives will be in touch as soon as possible.</p>'
      });
    });
  res.send('ok');
}));

router.get('/preview', (req, res) => {
  const data = {
    productImage: 'http://via.placeholder.com/250x300/ffffff/000000?text=productplaceholder',
    promoImage: 'http://via.placeholder.com/500x80/e8117f/ffffff?text=promo',
    promoLink: 'https://www.google.com/'
  };

  const html = jade.compile(emailTemplate, { basedir: __dirname })({ data });
  res.send(html);
});

module.exports = router;
