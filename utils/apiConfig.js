// Base URL for the AgriAI Cloudflare Worker proxy (see worker/ in the repo root).
// Update this after `wrangler deploy` if the Worker is deployed under a different name/domain.
export const WORKER_BASE_URL = 'https://agriai-api-proxy.shaikhafreeddth.workers.dev';

// Base URL for the separate GROQ/vision diagnosis Worker (recommend + diagnose routes),
// used by ChatScreen, CropDiseaseScreen, and CropRecommendationScreen. Its source isn't in
// this repo — only the deployed URL is referenced here, in one place instead of four.
export const DIAGNOSE_WORKER_BASE_URL = 'https://agriai-diagnose-v2.shaikhafreeddth.workers.dev';
export const GROQ_RECOMMEND_URL = `${DIAGNOSE_WORKER_BASE_URL}/recommend`;
export const GROQ_DIAGNOSE_URL = `${DIAGNOSE_WORKER_BASE_URL}/diagnose`;
