import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// City to lat/lng lookup (top cities)
const CITY_COORDS = {
  tokyo: [35.67, 139.65],
  'new york': [40.71, -74.0],
  newyork: [40.71, -74.0],
  london: [51.5, -0.12],
  oslo: [59.91, 10.75],
  lagos: [6.52, 3.37],
  'são paulo': [-23.55, -46.63],
  saopaulo: [-23.55, -46.63],
  sydney: [-33.86, 151.2],
  dubai: [25.2, 55.27],
  mumbai: [19.07, 72.87],
  berlin: [52.52, 13.4],
  paris: [48.85, 2.35],
  seoul: [37.56, 126.97],
  cairo: [30.04, 31.23],
  toronto: [43.65, -79.38],
  singapore: [1.35, 103.82],
  stockholm: [59.33, 18.06],
  'buenos aires': [-34.6, -58.38],
  buenosaires: [-34.6, -58.38],
  'cape town': [-33.92, 18.42],
  capetown: [-33.92, 18.42],
  bangkok: [13.75, 100.52],
  'mexico city': [19.43, -99.13],
  mexicocity: [19.43, -99.13],
  moscow: [55.75, 37.62],
  beijing: [39.91, 116.39],
  shanghai: [31.23, 121.47],
  'los angeles': [34.05, -118.24],
  losangeles: [34.05, -118.24],
  chicago: [41.88, -87.63],
  miami: [25.77, -80.19],
  amsterdam: [52.37, 4.9],
  barcelona: [41.39, 2.15],
  rome: [41.9, 12.5],
  madrid: [40.42, -3.7],
  vienna: [48.21, 16.37],
  zurich: [47.38, 8.54],
  nairobi: [-1.29, 36.82],
  johannesburg: [-26.2, 28.04],
  jakarta: [-6.21, 106.84],
  manila: [14.6, 120.98],
  karachi: [24.86, 67.01],
  dhaka: [23.72, 90.41],
  istanbul: [41.01, 28.95],
  tehran: [35.69, 51.39],
  riyadh: [24.69, 46.72],
  bodø: [67.28, 14.38],
  bodo: [67.28, 14.38],
  bergen: [60.39, 5.32],
  trondheim: [63.43, 10.39],
  reykjavik: [64.13, -21.93],
  helsinki: [60.17, 24.94],
  copenhagen: [55.68, 12.57],
  lisbon: [38.72, -9.14],
  athens: [37.98, 23.73],
  warsaw: [52.23, 21.01],
  prague: [50.08, 14.43],
  budapest: [47.5, 19.04],
  'ho chi minh city': [10.82, 106.63],
  hochiminhcity: [10.82, 106.63],
  'kuala lumpur': [3.14, 101.69],
  kualalumpur: [3.14, 101.69],
  melbourne: [-37.81, 144.96],
  auckland: [-36.86, 174.77],
  lima: [-12.05, -77.04],
  bogota: [4.71, -74.07],
  santiago: [-33.45, -70.67],
  montreal: [45.5, -73.57],
  vancouver: [49.25, -123.12],
  seattle: [47.61, -122.33],
  'san francisco': [37.77, -122.42],
  sanfrancisco: [37.77, -122.42],
  denver: [39.74, -104.98],
  dallas: [32.78, -96.8],
  houston: [29.76, -95.37],
  atlanta: [33.75, -84.39],
  boston: [42.36, -71.06],
  'washington dc': [38.91, -77.04],
  washingtondc: [38.91, -77.04]
};

/**
 * Get lat/lng from city name, with randomization within ±3 degrees for privacy.
 */
export function cityToCoords(city) {
  if (!city) return [Math.random() * 140 - 70, Math.random() * 360 - 180];

  const key = city.toLowerCase().replace(/\s+/g, '');
  const fullKey = city.toLowerCase().trim();

  const coords = CITY_COORDS[key] || CITY_COORDS[fullKey];

  if (coords) {
    // Small random offset within city
    const latOffset = (Math.random() - 0.5) * 1.5;
    const lngOffset = (Math.random() - 0.5) * 1.5;
    return [coords[0] + latOffset, coords[1] + lngOffset];
  }

  // Unknown city — random position
  return [Math.random() * 120 - 60, Math.random() * 360 - 180];
}

export default supabase;
