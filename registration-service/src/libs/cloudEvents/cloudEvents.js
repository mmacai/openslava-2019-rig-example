const { v4 } = require('uuid');

const createMessage = ({
  type,
  source,
  data,
  extensions,
  contenttype = 'application/json'
}) => {
  return {
    id: v4(),
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
