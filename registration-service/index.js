const config = require('./src/config/config');
const logger = require('./src/config/winston');
const app = require('./src/config/express');
const { startKafka, close } = require('./src/kafka');

let server;

const exitHandler = () => {
  close();
  server.close();
};

process.on('SIGINT', exitHandler.bind());
process.on('SIGTERM', exitHandler.bind());

const startApp = async () => {
  try {
    startKafka();

    server = app.listen(config.port, () => {
      logger.info(`Registration service running and listening on port ${config.port}`);
    });
  } catch (error) {
    throw error;
  }
};

if (!module.parent) {
  startApp();
}
