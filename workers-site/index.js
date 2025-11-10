import { getAssetFromKV, NotFoundError } from '@cloudflare/kv-asset-handler';

export default {
  async fetch(request, env) {
    try {
      return await getAssetFromKV(request, {
        mapRequestToAsset: req => {
          const url = new URL(req.url);
          // Serve index.html for root and paths without file extensions (SPA routing)
          if (url.pathname === '/' || !url.pathname.includes('.')) {
            return new Request(new URL('/index.html', req.url).toString(), req);
          }
          return req;
        }
      });
    } catch (e) {
      // Return 404 for missing assets
      if (e instanceof NotFoundError) {
        return new Response('Not Found', { status: 404 });
      }
      return new Response('Internal Server Error', { status: 500 });
    }
  }
};
