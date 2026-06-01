const { proxyApi } = require('../_proxy');

module.exports = (req, res) => proxyApi(req, res, 'questions');
