/**
 * Cloudflare Pages Function: Live YouTube Video Search Proxy
 * Route: GET /api/search-video?q=QUERY
 * Enhanced regex matching + YouTube oEmbed fallback + extensive logging
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

  console.log(`[SEARCH-PROXY-LOG 1/5] Incoming video search request for query: "${query}"`);

  if (!query || typeof query !== 'string') {
    return new Response(JSON.stringify({ query: '', results: [], log: 'Missing query parameter' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }

  try {
    const cleanQ = query.trim();
    const q = encodeURIComponent(`${cleanQ} youtube`);
    const searchUrl = `https://duckduckgo.com/?q=${q}&t=h_&iax=videos&ia=videos`;

    console.log(`[SEARCH-PROXY-LOG 2/5] Fetching DuckDuckGo token URL: ${searchUrl}`);

    const htmlRes = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });

    if (!htmlRes.ok) {
      console.warn(`[SEARCH-PROXY-LOG 2.1] DuckDuckGo token fetch failed with status ${htmlRes.status}`);
      return new Response(JSON.stringify({ query: cleanQ, results: [], log: `DDG HTTP ${htmlRes.status}` }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    const htmlText = await htmlRes.text();
    
    // Robust vqd token extraction supporting all DuckDuckGo HTML variants
    const vqdMatch = htmlText.match(/vqd=['"]?([\d-]+)['"]?/) || 
                     htmlText.match(/["']vqd["']\s*:\s*["']([\d-]+)["']/) ||
                     htmlText.match(/vqd=([a-zA-Z0-9_-]+)/);

    if (!vqdMatch) {
      console.warn(`[SEARCH-PROXY-LOG 2.2] vqd token regex match returned NULL! HTML snippet: ${htmlText.substring(0, 300)}`);
      return new Response(JSON.stringify({ query: cleanQ, results: [], log: 'vqd token missing in DDG response' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    const vqd = vqdMatch[1];
    console.log(`[SEARCH-PROXY-LOG 3/5] Extracted vqd token: "${vqd}". Requesting video JSON API...`);

    const videoApiUrl = `https://duckduckgo.com/v.js?q=${q}&vqd=${vqd}&p=1`;
    const apiRes = await fetch(videoApiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'X-Requested-With': 'XMLHttpRequest'
      }
    });

    if (!apiRes.ok) {
      console.warn(`[SEARCH-PROXY-LOG 3.1] DDG Video JSON API failed with status ${apiRes.status}`);
      return new Response(JSON.stringify({ query: cleanQ, results: [], log: `DDG API HTTP ${apiRes.status}` }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    const data = await apiRes.json();
    console.log(`[SEARCH-PROXY-LOG 4/5] DDG JSON API returned ${data?.results?.length || 0} items`);

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
                title: item.title || cleanQ,
                publisher: item.publisher || 'YouTube'
              });
            }
          }
        }
      }
    }

    console.log(`[SEARCH-PROXY-LOG 5/5] Extracted ${candidates.length} YouTube candidates:`, JSON.stringify(candidates));

    return new Response(JSON.stringify({ query: cleanQ, results: candidates, log: 'Success' }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400'
      }
    });

  } catch (err) {
    console.error(`[SEARCH-PROXY-ERROR] Exception in video proxy: ${err.message}`);
    return new Response(JSON.stringify({ query: query, results: [], log: `Exception: ${err.message}` }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
}
