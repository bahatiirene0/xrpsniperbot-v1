const api = require('./api');

exports.handler = async (event) => {
  return await api.handler(event);
};