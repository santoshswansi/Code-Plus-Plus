import { createProxyMiddleware } from 'http-proxy-middleware';
import { config } from '../config/config.ts';

export const projectServiceProxy = createProxyMiddleware({
  target: config.projectServiceUrl,
  changeOrigin: true,
  pathRewrite: {
    '^/': '/api/projects/',
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
