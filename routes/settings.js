const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
  const shopName = req.query.shop.split('.')[0];
  const settings = {
    email: 'admin@email.com',
    storeLogo: ''
  };

  res.render('settings', { shopName, settings });
});

router.post('/', (req, res) => {
  console.log(req.body);

  res.send({ success: true, statusCode: 200 });
});

module.exports = router;
