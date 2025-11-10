import { getAssetFromKV } from '@cloudflare/kv-asset-handler';

addEventListener('fetch', event => {
  // Serve static assets uploaded by Wrangler. For SPA routing, map unknown requests to /index.html.
  const options = {
    mapRequestToAsset: req => {
      const url = new URL(req.url);
      // If requesting a directory or unknown asset, serve index.html so SPA routing works
      if (url.pathname === '/' || !url.pathname.includes('.') ) {
        return new Request('/index.html', req);
      }
      return req;
    }
  };

  try {
    event.respondWith(getAssetFromKV(event, options));
  } catch (e) {
    event.respondWith(new Response('Not found', { status: 404 }));
  }
});
