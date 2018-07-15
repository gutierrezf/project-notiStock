const express = require('express');
const co = require('co-express');
const provider = require('../main');
const jade = require('jade');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const emailTemplate = fs.readFileSync(path.join(__dirname, '/../views/mail-template.jade'), 'utf8');

router.post('/price-submit', co(function * (req, res, next) {
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

router.post('/add-contractors', (req, res, next) => {
  const data = JSON.parse(req.body.json);
  data.map(clientData => provider.db.contractor.findOrCreate(clientData));

  res.send('ok');
});

router.get('/contractors', co(function * (req, res, next) {
  const { query } = req;
  console.log(query);
  let data = yield provider.db.contractor.find(query);
  data = data.map((item, index) => ({
    index,
    name: item.name,
    email: item.email,
    phone: item.phone,
    address: item.address,
    website: item.website,
    source: item.source
  }));

  res.send(JSON.stringify(data));
}));

router.get('/email-view-test', (req, res, next) => {
  const formData = {
    'product-id': '766583472224',
    'product-title': 'AC1321',
    fullname: 'name test',
    email: 'email@test.com',
    message: 'atalog Number AC1321, Brand General Electric, Bus Plugs Fusible , Volts 240, Amps 30, Ground Stab No.'
  };

  const html = jade.compile(emailTemplate, { basedir: __dirname })({ formData });
  res.send(html);
});

module.exports = router;
