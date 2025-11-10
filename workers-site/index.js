export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    let pathname = url.pathname;

    // If requesting root or a path without extension, serve index.html (SPA routing)
    if (pathname === '/' || (!pathname.includes('.') && !pathname.startsWith('/api'))) {
      pathname = '/index.html';
    }

    try {
      // Check if __STATIC_CONTENT binding exists
      if (!env.__STATIC_CONTENT) {
        return new Response('KV binding not configured', { status: 500 });
      }

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

      return new Response('Not Found: ' + pathname, { status: 404 });
    } catch (e) {
      console.error('Worker error:', e);
      return new Response('Internal Server Error: ' + e.message, { status: 500 });
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
  if (pathname.endsWith('.gif')) return 'image/gif';
  if (pathname.endsWith('.svg')) return 'image/svg+xml';
  if (pathname.endsWith('.ico')) return 'image/x-icon';
  if (pathname.endsWith('.woff')) return 'font/woff';
  if (pathname.endsWith('.woff2')) return 'font/woff2';
  if (pathname.endsWith('.ttf')) return 'font/ttf';
  if (pathname.endsWith('.otf')) return 'font/otf';
  return 'application/octet-stream';
}
