// utils/severityIndex.js
// Fully on-device, offline plant-disease severity estimate — no network call, no ML
// model. Decodes the compressed JPEG (already produced by CropDiseaseScreen) with a
// pure-JS decoder and classifies sampled pixels as healthy-green vs. affected
// (brown/yellow/necrotic) leaf tissue to estimate % of visible leaf area affected.
//
// This is a same-device visual heuristic, not a clinical measurement — it's meant to
// give an instant severity ballpark alongside the cloud-based disease name/treatment
// lookup, not replace it.

import jpeg from 'jpeg-js';
import { toByteArray } from 'base64-js';

const STRIDE = 2; // sample every Nth pixel for speed
const MIN_LEAF_PIXELS = 200; // below this, the photo likely isn't a usable leaf close-up

function classifyPixel(r, g, b) {
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
  if (luminance > 235 || luminance < 20) return null; // background / shadow, ignore

  const isHealthyGreen = g > r * 1.05 && g > b * 1.05 && g > 40;
  if (isHealthyGreen) return 'healthy';

  const isWarmToned = r >= g * 0.9 && r - b > 15; // brown / yellow / necrotic cast
  if (isWarmToned) return 'affected';

  return null; // not plant-tissue-like (sky, soil, hand, etc.) — ignore
}

function severityLabel(percent) {
  if (percent < 15) return 'Mild';
  if (percent < 40) return 'Moderate';
  return 'Severe';
}

// base64Jpeg: the same base64 string CropDiseaseScreen already produces via
// expo-image-manipulator. Returns null if too few leaf-like pixels were found
// (e.g. not a close-up of a plant), otherwise { percentAffected, severity }.
export function computeSeverityIndex(base64Jpeg) {
  const bytes = toByteArray(base64Jpeg);
  const { width, height, data } = jpeg.decode(bytes, { useTArray: true });

  let healthy = 0;
  let affected = 0;

  for (let y = 0; y < height; y += STRIDE) {
    for (let x = 0; x < width; x += STRIDE) {
      const i = (y * width + x) * 4;
      const cls = classifyPixel(data[i], data[i + 1], data[i + 2]);
      if (cls === 'healthy') healthy++;
      else if (cls === 'affected') affected++;
    }
  }

  const totalLeaf = healthy + affected;
  if (totalLeaf < MIN_LEAF_PIXELS) return null;

  const percentAffected = Math.round((affected / totalLeaf) * 100);
  return { percentAffected, severity: severityLabel(percentAffected) };
}
