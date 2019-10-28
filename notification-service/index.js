const { startKafka, consume, close } = require('./src/kafka');

const exitHandler = () => {
  close();
};

process.on('SIGINT', exitHandler.bind());
process.on('SIGTERM', exitHandler.bind());

const startApp = async () => {
  try {
    startKafka();
    await consume();
  } catch (error) {
    throw error;
  }
};

if (!module.parent) {
  startApp();
}
