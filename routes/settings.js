const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
  const shopName = req.query.shop.split('.')[0];

  res.render('settings', { shopName });
});

module.exports = router;
