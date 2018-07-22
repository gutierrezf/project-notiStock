const mongoose = require('mongoose');
const findOrCreate = require('mongoose-findorcreate');
const DBInterfaceGenerator = require('./base-model');
const constants = require('../constants');

const { Schema } = mongoose;
mongoose.connect(constants.DB_URL, {
  keepAlive: 300000,
  connectTimeoutMS: 30000,
  reconnectTries: 30,
  useMongoClient: true
});

const shopSchema = new Schema({
  companyName: String,
  accessToken: { type: String, default: '' },
  email: { type: String, default: '' },
  storeLogo: { type: String, default: '' },
  promoLink: { type: String, default: '' },
  promoImage: { type: String, default: '' },
  uninstalledAt: Date,
  replyP1: { type: String, default: '' },
  replyP2: { type: String, default: '' },
  replyP3: { type: String, default: '' },
  notificationP1: { type: String, default: '' },
  notificationP2: { type: String, default: '' },
  created_at: { type: Date, default: Date.now }
});

shopSchema.plugin(findOrCreate);

const Shop = mongoose.model('Shop', shopSchema);
const ShopInterface = DBInterfaceGenerator.MongooseInterface(Shop);

ShopInterface.findByName = function (shopName) {
  return this.findOne({ companyName: shopName });
};

ShopInterface.saveShopToken = function (token, shopName) {
  return this.updateAll(
    { companyName: shopName },
    { accessToken: token }
  );
};

module.exports = {
  Shop,
  ShopInterface
};
