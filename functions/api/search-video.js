/**
 * Cloudflare Pages Function: Live YouTube Video Search Proxy
 * Route: GET /api/search-video?q=QUERY
 * Always responds with 200 OK (never 500 error)
 */

export async function onRequest(context) {
  if (context.request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400'
      }
    });
  }

  const url = new URL(context.request.url);
  const query = url.searchParams.get('q');

  if (!query || typeof query !== 'string') {
    return new Response(JSON.stringify({ query: '', results: [] }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }

  try {
    const q = encodeURIComponent(`${query.trim()} youtube tutorial`);
    const searchUrl = `https://duckduckgo.com/?q=${q}&t=h_&iax=videos&ia=videos`;

    const htmlRes = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept': 'text/html'
      }
    });

    if (!htmlRes.ok) {
      return new Response(JSON.stringify({ query: query, results: [] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    const htmlText = await htmlRes.text();
    const vqdMatch = htmlText.match(/vqd=([\d-]+)/);

    if (!vqdMatch) {
      return new Response(JSON.stringify({ query: query, results: [] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    const vqd = vqdMatch[1];
    const videoApiUrl = `https://duckduckgo.com/v.js?q=${q}&vqd=${vqd}&p=1`;

    const apiRes = await fetch(videoApiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept': 'application/json'
      }
    });

    if (!apiRes.ok) {
      return new Response(JSON.stringify({ query: query, results: [] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    const data = await apiRes.json();
    const candidates = [];

    if (data && Array.isArray(data.results)) {
      for (const item of data.results) {
        if (candidates.length >= 3) break;
        if (item.content && item.content.includes('youtube.com')) {
          const match = item.content.match(/(?:v=|\/embed\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
          if (match && match[1]) {
            const vid = match[1];
            if (!candidates.some(c => c.video_id === vid)) {
              candidates.push({
                video_id: vid,
                title: item.title || query
              });
            }
          }
        }
      }
    }

    return new Response(JSON.stringify({ query: query, results: candidates }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400'
      }
    });

  } catch (err) {
    return new Response(JSON.stringify({ query: query, results: [], message: err.message }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}
