const BASE_URL = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070';

export async function handleMarketPrices(url, env) {
  const state = url.searchParams.get('state');
  let apiUrl = `${BASE_URL}?api-key=${env.MARKET_API_KEY}&format=json&limit=100`;
  if (state && state !== 'All') apiUrl += `&filters[state]=${encodeURIComponent(state)}`;

  try {
    const res = await fetch(apiUrl);
    const headers = new Headers(res.headers);
    headers.set('Content-Type', 'application/json');
    return new Response(res.body, { status: res.status, headers });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: { code: 'upstream_error', message: 'Failed to reach data.gov.in' } }),
      { status: 502, headers: { 'Content-Type': 'application/json' } },
    );
  }
}
