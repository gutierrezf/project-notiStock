const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const mainRoutes = require('./routes/main-routes');
const apiRoutes = require('./routes/api');

/****

 APP SETUP

****/

const app = express();
app.use(cors());

app.use(bodyParser.urlencoded({
  parameterLimit: 100000,
  limit: '50mb',
  extended: true
}));

app.use('/favicon.ico', express.static(path.join(__dirname, '/public/favicon.ico')));
app.set('json spaces', 40);
app.use(bodyParser.json({
  limit: '50mb'
}));

app.use('/public', express.static(path.join(__dirname, '/public')));

app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'jade');

const port = process.env.PORT || 9000;

app.listen(port, () => {
  console.log('RUNNING IN', port);
});

/****

ROUTERS

****/

app.use('/', mainRoutes);
app.use('/api', apiRoutes);
