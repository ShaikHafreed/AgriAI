import { handleWeather, handleForecast } from './weather.js';
import { handleMarketPrices } from './market.js';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    const url = new URL(request.url);
    let response;
    try {
      switch (url.pathname) {
        case '/weather':
          response = await handleWeather(url, env);
          break;
        case '/forecast':
          response = await handleForecast(url, env);
          break;
        case '/market-prices':
          response = await handleMarketPrices(url, env);
          break;
        default:
          response = new Response(JSON.stringify({ error: { code: 'not_found', message: 'No such route' } }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' },
          });
      }
    } catch (e) {
      response = new Response(JSON.stringify({ error: { code: 'internal_error', message: 'Unexpected error' } }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const headers = new Headers(response.headers);
    for (const [k, v] of Object.entries(CORS_HEADERS)) headers.set(k, v);
    return new Response(response.body, { status: response.status, headers });
  },
};
