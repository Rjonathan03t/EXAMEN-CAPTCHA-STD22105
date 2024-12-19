const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express();
const port = 3000;

// Proxy de l'API
app.use('/api', createProxyMiddleware({
  target: 'https://b82b1763d1c3.ef7ef6cc.eu-west-3.token.awswaf.com',
  changeOrigin: true,
  pathRewrite: {
    '^/api': '', // Rewrite /api vers le chemin correct de l'API
  },
}));

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
