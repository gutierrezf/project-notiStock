const express = require('express');
const co = require('co-express');
const provider = require('../main');

const router = express.Router();

router.get('/', co(function * (req, res) {
  const shopName = req.query.shop.split('.')[0];
  const settings = yield provider.db.shop.findByName(shopName);

  res.render('settings', { shopName, settings });
}));

router.post('/', (req, res) => {
  const { shopName } = req.body;
  delete req.body.shopName;

  provider.db.shop.updateAll({ companyName: shopName }, req.body )
    .then(() => {
      res.send({ success: true, statusCode: 200 });
    })
    .catch(() => {
      res.send({ success: false, statusCode: 400 });
    });
});

module.exports = router;
