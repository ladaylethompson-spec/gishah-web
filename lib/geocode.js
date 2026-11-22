// Turns a place name ("Charlotte, NC" or a ZIP code) into coordinates using
// OpenStreetMap's free Nominatim geocoder. No API key required, but it's a
// shared public service, so this is fine for beta-level traffic only — a
// paid geocoder (Mapbox, Google) would be worth switching to at real scale.
//
// Docs / usage policy: https://operations.osmfoundation.org/policies/nominatim/

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

export async function geocodeLocation(query) {
  if (!query || !query.trim()) return null;

  const params = new URLSearchParams({
    q: query.trim(),
    format: "json",
    limit: "1",
    countrycodes: "us",
  });

  const res = await fetch(`${NOMINATIM_URL}?${params.toString()}`, {
    headers: {
      // Nominatim's usage policy requires a descriptive User-Agent that
      // identifies the application and a way to contact its operator.
      "User-Agent": "Gishah-beta/1.0 (contact: admin@gishah.com)",
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`Geocoding request failed (${res.status})`);
  }

  const results = await res.json();
  if (!Array.isArray(results) || results.length === 0) return null;

  const match = results[0];
  return {
    lat: parseFloat(match.lat),
    lon: parseFloat(match.lon),
    label: match.display_name,
  };
}
