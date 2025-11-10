export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    let pathname = url.pathname;

    // If requesting root or a path without extension, serve index.html (SPA routing)
    if (pathname === '/' || (!pathname.includes('.') && !pathname.startsWith('/api'))) {
      pathname = '/index.html';
    }

    try {
      // Try to fetch the asset from KV
      const asset = await env.__STATIC_CONTENT.get(pathname);
      if (asset) {
        return new Response(asset, {
          headers: {
            'Content-Type': getContentType(pathname),
            'Cache-Control': 'public, max-age=3600'
          }
        });
      }
      // If not found and it's not index.html, try index.html (SPA fallback)
      if (pathname !== '/index.html') {
        const indexAsset = await env.__STATIC_CONTENT.get('/index.html');
        if (indexAsset) {
          return new Response(indexAsset, {
            headers: {
              'Content-Type': 'text/html',
              'Cache-Control': 'public, max-age=3600'
            }
          });
        }
      }
      return new Response('Not Found', { status: 404 });
    } catch (e) {
      console.error('Worker error:', e);
      return new Response('Internal Server Error', { status: 500 });
    }
  }
};

function getContentType(pathname) {
  if (pathname.endsWith('.html')) return 'text/html';
  if (pathname.endsWith('.css')) return 'text/css';
  if (pathname.endsWith('.js')) return 'application/javascript';
  if (pathname.endsWith('.json')) return 'application/json';
  if (pathname.endsWith('.png')) return 'image/png';
  if (pathname.endsWith('.jpg') || pathname.endsWith('.jpeg')) return 'image/jpeg';
  if (pathname.endsWith('.svg')) return 'image/svg+xml';
  if (pathname.endsWith('.ico')) return 'image/x-icon';
  if (pathname.endsWith('.woff')) return 'font/woff';
  if (pathname.endsWith('.woff2')) return 'font/woff2';
  return 'application/octet-stream';
}
