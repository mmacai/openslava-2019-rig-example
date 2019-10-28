const express = require('express');
const bodyParser = require('body-parser');
const compress = require('compression');
const helmet = require('helmet');
const httpStatus = require('http-status');
const expressWinston = require('express-winston');

const logger = require('./winston');
const routes = require('../routes');

const app = express();

app.use(
  expressWinston.logger({
    msg: 'HTTP {{req.method}} {{req.url}} {{res.statusCode}} {{res.responseTime}}ms',
    statusLevels: true,
    winstonInstance: logger
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(compress());
app.use(helmet());

app.get('/health-check', (req, res) => {
  res.sendStatus(httpStatus.OK);
});

app.use('/api/rs', routes);

app.use((req, res, next) => {
  const err = new Error('API not found');
  return next(err);
});

module.exports = app;
