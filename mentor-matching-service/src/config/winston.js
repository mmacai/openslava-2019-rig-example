const winston = require('winston');

const { combine, timestamp, label, printf, colorize } = winston.format;

const logFormat = printf(
  info => `${info.timestamp} [${info.label}] ${info.level}: ${info.message}`
);

const logger = winston.createLogger({
  format: combine(
    colorize(),
    label({ label: 'mentor-matching-service' }),
    timestamp(),
    logFormat
  ),
  transports: [
    new winston.transports.Console({
      level: 'debug'
    })
  ]
});

module.exports = logger;
