const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Determine the API URL:
  // 1. Use REACT_APP_API_URL if defined (allows specifying a custom API URL in production)
  // 2. In production, use relative URLs (empty string) which will be relative to the current host
  // 3. In development, use localhost:8000
  const API_URL = process.env.REACT_APP_API_URL || 
                 (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:8000');

  // Common proxy options
  const commonOptions = {
    target: API_URL,
    changeOrigin: true,
    secure: false,
    onProxyReq: function(proxyReq, req, res) {
      // Log the request for debugging
      console.log(`Proxying ${req.method} ${req.url} to ${proxyReq.path}`);
    },
    onError: function(err, req, res) {
      console.error('Proxy error:', err);
      res.writeHead(500, {
        'Content-Type': 'text/plain',
      });
      res.end('Proxy error: ' + err.message);
    }
  };

  // Common cookie options
  const cookieOptions = {
    cookieDomainRewrite: process.env.NODE_ENV === 'production' ? false : {
      'localhost': 'localhost',
    },
    cookiePathRewrite: { '/': '/' },
  };

  // Proxy all API requests - this is the main entry point for all API calls
  app.use(
    '/api',
    createProxyMiddleware({
      ...commonOptions,
      ...cookieOptions,
    })
  );

  // Proxy auth requests to /api/auth - for backward compatibility
  app.use(
    '/auth',
    createProxyMiddleware({
      ...commonOptions,
      ...cookieOptions,
      pathRewrite: {
        '^/auth': '/api/auth',  // Rewrite all /auth paths to /api/auth
      },
    })
  );

  // Proxy integrations requests to /api/integrations - for backward compatibility
  app.use(
    '/integrations',
    createProxyMiddleware({
      ...commonOptions,
      ...cookieOptions,
      pathRewrite: {
        '^/integrations': '/api/integrations',  // Rewrite all /integrations paths to /api/integrations
      },
    })
  );

  // Proxy WebSocket requests
  app.use(
    '/ws',
    createProxyMiddleware({
      ...commonOptions,
      ws: true,
    })
  );

  // Proxy static assets referenced in manifest.json
  app.use(
    '/logo.png',
    createProxyMiddleware({
      ...commonOptions,
      // No path rewrite needed, just forward the request as-is
      onProxyReq: function(proxyReq, req, res) {
        // Enhanced logging for logo requests
        console.log(`Proxying logo request ${req.method} ${req.url} to ${proxyReq.path}`);
      },
      onProxyRes: function(proxyRes, req, res) {
        // Log the response status code
        console.log(`Logo proxy response: ${proxyRes.statusCode} ${proxyRes.statusMessage}`);
        // Log the response headers
        console.log('Logo proxy response headers:', proxyRes.headers);
      },
      onError: function(err, req, res) {
        console.error('Logo proxy error:', err);
        res.writeHead(500, {
          'Content-Type': 'text/plain',
        });
        res.end('Logo proxy error: ' + err.message);
      }
    })
  );

  app.use(
    '/logo512.png',
    createProxyMiddleware({
      ...commonOptions,
      pathRewrite: {
        '^/logo512.png': '/logo.png', // Fallback to logo.png if logo512.png doesn't exist
      },
      onProxyReq: function(proxyReq, req, res) {
        // Enhanced logging for logo512 requests
        console.log(`Proxying logo512 request ${req.method} ${req.url} to ${proxyReq.path}`);
      },
    })
  );

  app.use(
    '/favicon.ico',
    createProxyMiddleware({
      ...commonOptions,
      // No path rewrite needed, just forward the request as-is
      onProxyReq: function(proxyReq, req, res) {
        // Enhanced logging for favicon requests
        console.log(`Proxying favicon request ${req.method} ${req.url} to ${proxyReq.path}`);
      },
    })
  );
};
