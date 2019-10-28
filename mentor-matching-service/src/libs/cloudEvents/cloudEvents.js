const uuid = require('uuid/v4');

const createMessage = ({
  type,
  source,
  data,
  extensions,
  contenttype = 'application/json'
}) => {
  return {
    id: uuid(),
    time: new Date().toISOString(),
    specversion: '0.2',
    type,
    source,
    contenttype,
    data,
    ...extensions
  };
};

module.exports = {
  createMessage
};
