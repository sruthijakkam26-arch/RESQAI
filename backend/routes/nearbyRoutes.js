const express = require("express");
const https = require("https");

const router = express.Router();
const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.nchc.org.tw/api/interpreter",
];
const cache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000;

function postForm(url, formData, timeout = 30000) {
  return new Promise((resolve, reject) => {
    const target = new URL(url);
    const body = new URLSearchParams(formData).toString();
    const request = https.request({
      hostname: target.hostname,
      path: `${target.pathname}${target.search}`,
      method: "POST",
      timeout,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": Buffer.byteLength(body),
        "User-Agent": "ResQAI emergency-help dashboard",
      },
    }, (response) => {
      let raw = "";
      response.setEncoding("utf8");
      response.on("data", (chunk) => { raw += chunk; });
      response.on("end", () => {
        if (response.statusCode < 200 || response.statusCode >= 300) {
          return reject(new Error(`${target.hostname} returned HTTP ${response.statusCode}`));
        }
        try { resolve(JSON.parse(raw)); } catch { reject(new Error("Invalid map-data response")); }
      });
    });
    request.on("error", reject);
    request.on("timeout", () => request.destroy(new Error("Map-data request timed out")));
    request.write(body);
    request.end();
  });
}

router.get("/", async (req, res) => {
  const lat = Number(req.query.lat);
  const lon = Number(req.query.lon);
  const radiusKm = Number(req.query.radius || 5);
  if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) {
    return res.status(400).json({ message: "Valid latitude and longitude are required" });
  }
  if (!Number.isFinite(radiusKm) || radiusKm < 1 || radiusKm > 25) {
    return res.status(400).json({ message: "Search radius must be between 1 and 25 km" });
  }

  const query = `[out:json][timeout:25];(
    nwr(around:${Math.round(radiusKm * 1000)},${lat},${lon})["amenity"~"^(hospital|clinic|pharmacy|shelter|fire_station|police)$"];
    nwr(around:${Math.round(radiusKm * 1000)},${lat},${lon})["social_facility"="shelter"];
  );out center tags;`;
  const cacheKey = `${lat.toFixed(3)},${lon.toFixed(3)},${radiusKm}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.savedAt < CACHE_TTL_MS) return res.json({ elements: cached.elements, cached: true });

  let lastError;
  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const data = await postForm(endpoint, { data: query });
      const elements = Array.isArray(data.elements) ? data.elements : [];
      cache.set(cacheKey, { elements, savedAt: Date.now() });
      return res.json({ elements, cached: false });
    } catch (error) {
      lastError = error;
      console.warn("Nearby help source failed:", error.message);
    }
  }
  res.status(503).json({ message: "Nearby map data is temporarily unavailable. Please try again in a moment.", detail: lastError?.message });
});

module.exports = router;
