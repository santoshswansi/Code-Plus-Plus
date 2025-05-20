import { createProxyMiddleware } from 'http-proxy-middleware';
import { config } from '../config/config.ts';

export const authServiceProxy = createProxyMiddleware({
  target: config.authServiceUrl,
  changeOrigin: true,
  pathRewrite: {
    '^/': '/api/auth/',
  },
  cookieDomainRewrite: { 
    "*": "" 
  },
  on: {
    proxyRes: (proxyRes, req, res) => {
      const cookies = proxyRes.headers['set-cookie'];
    }
  }
});
