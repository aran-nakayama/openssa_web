const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  console.log('Setting up proxy middleware');
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://backend:8000',
      changeOrigin: true,
      pathRewrite: {
        '^/api': '',
      },
      onError: (err, req, res) => {
        console.error('Proxy Error:', err);
      },
    })
  );
}; 