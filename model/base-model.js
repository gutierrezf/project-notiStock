const Promise = require('promise');

const Base = {};

exports.MongooseInterface = function (model) {
  const obj = Object.assign({}, Base);
  obj.model = model;
  return obj;
};

Base.getModel = function () {
  return this.model;
};

Base.findOrCreate = function (queryOptions) {
  const model = this.getModel();
  const query = queryOptions || {};
  return new Promise((resolve, reject) => {
    model.findOrCreate(query, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};

Base.save = function (query) {
  const model = this.getModel();
  return new Promise((resolve, reject) => {
    model.create(query, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};

Base.findOne = function (query) {
  const model = this.getModel();
  return new Promise((resolve, reject) => {
    model.findOne(query, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};

Base.findById = function (id) {
  const model = this.getModel();
  return new Promise((resolve, reject) => {
    model.findById(id, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};

Base.find = function (queryOptions, sortOptions) {
  const model = this.getModel();
  const query = queryOptions || {};
  const sort = sortOptions || { created_at: -1 };

  return new Promise((resolve, reject) => {
    const search = model.find(query);
    search.sort(sort);
    search.exec((err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};

Base.update = function (data) {
  const model = this.getModel();
  const id = data._id;
  return new Promise((resolve, reject) => {
    model.findByIdAndUpdate(id, data, { new: false }, (err, dataObj) => {
      if (err) {
        reject(err);
      } else {
        resolve(dataObj);
      }
    });
  });
};

Base.updateAll = function (queryOptions, newData) {
  const query = queryOptions || {};
  const data = newData || {};
  const model = this.getModel();
  return new Promise((resolve, reject) => {
    model.update(query, data, { multi: true }, (err, dataObj) => {
      if (err) {
        reject(err);
      } else {
        resolve(dataObj);
      }
    });
  });
};

Base.delete = function (query) {
  const model = this.getModel();
  return new Promise((resolve, reject) => {
    model.remove(query, (err, data) => {
      if (err) {
        reject(err);
      }
      resolve('sucess');
    });
  });
};
