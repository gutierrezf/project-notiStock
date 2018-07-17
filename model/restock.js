const mongoose = require('mongoose');
const findOrCreate = require('mongoose-findorcreate');
const DBInterfaceGenerator = require('./base-model');

const { Schema } = mongoose;

const RestockSchema = new Schema({
  shop: String,
  productID: { type: String, default: '' },
  productUrl: { type: String, default: '' },
  variant: { type: String, default: '' },
  email: { type: String, default: '' },
  imageUrl: { type: String, default: '' },
  status: { type: Number, enum: [0, 1, 2], default: 0 },
  created_at: { type: Date, default: Date.now }
});

RestockSchema.plugin(findOrCreate);

RestockSchema.methods.isFinish = function () {
  return this.status == 1;
};

const Restock = mongoose.model('Restock', RestockSchema);
const RestockInterface = DBInterfaceGenerator.MongooseInterface(Restock);

module.exports = {
  Restock,
  RestockInterface
};
