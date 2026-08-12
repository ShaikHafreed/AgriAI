// worker/src/verifyAuth.js
// Verifies Firebase Authentication ID tokens (RS256 JWTs) on incoming requests,
// so this Worker stops being an open proxy. Works for anonymous, Google, and any
// other Firebase-linked sign-in method, since they all mint the same token shape.
//
// Firebase doesn't publish a JWKS endpoint for ID tokens — it publishes rotating
// X.509 certs keyed by `kid` instead — so certs are fetched and imported directly
// rather than using a standard JWKS client.

import { importX509, jwtVerify } from 'jose';

const CERTS_URL =
  'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com';
const FIREBASE_PROJECT_ID = 'create-a-project-9a9d1';
const ISSUER = `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`;

// Module-scope cache — persists across requests within the same Worker isolate.
let certsCache = null;
let certsCacheExpiry = 0;

async function getSigningCerts() {
  const now = Date.now();
  if (certsCache && now < certsCacheExpiry) return certsCache;

  const res = await fetch(CERTS_URL);
  if (!res.ok) throw new Error('Could not fetch Firebase signing certs');
  certsCache = await res.json(); // { [kid]: pemCertString }

  // Respect the endpoint's own cache lifetime when present; otherwise cache 1 hour.
  const cacheControl = res.headers.get('cache-control') || '';
  const maxAgeMatch = cacheControl.match(/max-age=(\d+)/);
  const maxAgeMs = maxAgeMatch ? Number(maxAgeMatch[1]) * 1000 : 60 * 60 * 1000;
  certsCacheExpiry = now + maxAgeMs;

  return certsCache;
}

function decodeJwtHeader(token) {
  const [headerB64] = token.split('.');
  if (!headerB64) throw new Error('Malformed token');
  const json = atob(headerB64.replace(/-/g, '+').replace(/_/g, '/'));
  return JSON.parse(json);
}

// Returns the verified token's payload (including `sub`, the Firebase uid) on
// success, or throws on any missing/invalid/expired/mis-signed token.
export async function verifyFirebaseToken(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Missing bearer token');
  }
  const token = authHeader.slice('Bearer '.length).trim();

  const header = decodeJwtHeader(token);
  if (header.alg !== 'RS256' || !header.kid) {
    throw new Error('Unsupported token algorithm');
  }

  const certs = await getSigningCerts();
  const pem = certs[header.kid];
  if (!pem) throw new Error('Unknown signing key — token may be stale or forged');

  const publicKey = await importX509(pem, 'RS256');

  const { payload } = await jwtVerify(token, publicKey, {
    issuer: ISSUER,
    audience: FIREBASE_PROJECT_ID,
  });

  if (!payload.sub) throw new Error('Token has no subject');
  return payload;
}
