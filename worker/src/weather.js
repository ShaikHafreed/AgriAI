const WEATHER_API = 'https://api.openweathermap.org/data/2.5/weather';
const FORECAST_API = 'https://api.openweathermap.org/data/2.5/forecast';

const badRequest = (message) =>
  new Response(JSON.stringify({ error: { code: 'bad_request', message } }), {
    status: 400,
    headers: { 'Content-Type': 'application/json' },
  });

const badGateway = (message) =>
  new Response(JSON.stringify({ error: { code: 'upstream_error', message } }), {
    status: 502,
    headers: { 'Content-Type': 'application/json' },
  });

async function proxy(upstreamUrl) {
  try {
    const res = await fetch(upstreamUrl);
    const headers = new Headers(res.headers);
    headers.set('Content-Type', 'application/json');
    return new Response(res.body, { status: res.status, headers });
  } catch (e) {
    return badGateway('Failed to reach OpenWeatherMap');
  }
}

export async function handleWeather(url, env) {
  const lat = url.searchParams.get('lat');
  const lon = url.searchParams.get('lon');
  if (!lat || !lon) return badRequest('lat and lon query params are required');
  return proxy(`${WEATHER_API}?lat=${lat}&lon=${lon}&appid=${env.OPENWEATHER_KEY}&units=metric`);
}

export async function handleForecast(url, env) {
  const lat = url.searchParams.get('lat');
  const lon = url.searchParams.get('lon');
  if (!lat || !lon) return badRequest('lat and lon query params are required');
  const cnt = url.searchParams.get('cnt') || '6';
  return proxy(`${FORECAST_API}?lat=${lat}&lon=${lon}&appid=${env.OPENWEATHER_KEY}&units=metric&cnt=${cnt}`);
}
