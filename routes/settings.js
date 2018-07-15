const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
  const shopName = req.query.shop;

  res.render('settings', { shopName });
});

module.exports = router;
