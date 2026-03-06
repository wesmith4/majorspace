require('dotenv').config();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
let cookieSession = require('cookie-session');

var apiRouter = require('./routes/api');

var app = express();

app.root = (...args) => path.join(__dirname, ...args);

if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = app.get('env');
}

// Database setup
let Knex = require('knex');
let dbConfig = require(app.root('knexfile'));
let knex = Knex(dbConfig[process.env.NODE_ENV]);

let { Model } = require('objection');
Model.knex(knex);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Cookie session
if (process.env.SECRET) {
  app.set('session-secret', process.env.SECRET);
} else {
  app.set('session-secret', 'f3quq4930fdsi');
}

let sessionHandler = cookieSession({
  name: 'session',
  secret: app.get('session-secret')
});
app.use(sessionHandler);

let loadUser = require('./loadUser');
app.use(loadUser);

// API routes
app.use('/api', apiRouter);

// Serve static files from React build
let clientBuildPath = path.join(__dirname, 'client', 'dist');
app.use(express.static(clientBuildPath));

// Also serve legacy public assets (images, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// SPA fallback: serve React index.html for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(clientBuildPath, 'index.html'));
});

// error handler
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json({ error: err.message });
});

module.exports = app;
