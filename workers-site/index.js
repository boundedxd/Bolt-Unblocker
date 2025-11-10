import { getAssetFromKV, NotFoundError } from '@cloudflare/kv-asset-handler';

export default {
  async fetch(request, env, ctx) {
    try {
      return await getAssetFromKV(
        {
          request,
          waitUntil: ctx.waitUntil,
        },
        {
          ASSET_NAMESPACE: env.__STATIC_CONTENT,
          ASSET_MANIFEST: env.__STATIC_CONTENT_MANIFEST,
          mapRequestToAsset: req => {
            const url = new URL(req.url);
            // Serve index.html for root and paths without file extensions (SPA routing)
            if (url.pathname === '/' || !url.pathname.includes('.')) {
              return new Request(new URL('/index.html', req.url).toString(), req);
            }
            return req;
          }
        }
      );
    } catch (e) {
      // Return 404 for missing assets
      if (e instanceof NotFoundError) {
        return new Response('Not Found', { status: 404 });
      }
      console.error('Worker error:', e);
      return new Response('Internal Server Error: ' + e.message, { status: 500 });
    }
  }
};
