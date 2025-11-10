import { getAssetFromKV, NotFoundError } from '@cloudflare/kv-asset-handler';

export default {
  async fetch(request, env, ctx) {
    try {
      // Get the manifest from the environment variable set by Wrangler
      let manifest = {};
      if (typeof ASSET_MANIFEST !== 'undefined') {
        manifest = JSON.parse(ASSET_MANIFEST);
      }

      return await getAssetFromKV(
        {
          request,
          waitUntil: ctx.waitUntil,
        },
        {
          ASSET_NAMESPACE: env.__STATIC_CONTENT,
          ASSET_MANIFEST: manifest,
          mapRequestToAsset: req => {
            const url = new URL(req.url);
            // Serve index.html for root and paths without file extensions (SPA routing)
            if (url.pathname === '/' || (!url.pathname.includes('.') && !url.pathname.startsWith('/api'))) {
              return new Request(new URL('/index.html', req.url).toString(), req);
            }
            return req;
          }
        }
      );
    } catch (e) {
      // Return 404 for missing assets
      if (e instanceof NotFoundError) {
        return new Response('Not Found: ' + e.message, { status: 404 });
      }
      console.error('Worker error:', e);
      return new Response('Internal Server Error: ' + e.message, { status: 500 });
    }
  }
};
