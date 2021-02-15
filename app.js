var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');

var indexRouter = require('./src/routes/index-router');
var roombieRouter = require('./src/routes/roombie-router');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(cors());
app.use('/', indexRouter);
app.use('/api', roombieRouter);

app.use((err, req, res, next) => {
  res.status(500).send(err.message);
});

module.exports = app;
