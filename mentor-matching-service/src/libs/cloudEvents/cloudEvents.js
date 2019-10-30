const { v4 } = require('uuid');

const createMessage = ({
  type,
  source,
  data,
  extensions,
  contentType = 'text/plain'
}) => {
  return {
    eventID: v4(),
    eventTime: new Date().toISOString(),
    cloudEventsVersion: '0.1',
    eventType: type,
    source,
    contentType,
    data,
    ...extensions
  };
};

module.exports = {
  createMessage
};
