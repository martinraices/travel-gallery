import { WORLD_COUNTRIES } from '../data/countries';

const FB_SKIP_EXACT = new Set(['Photos', 'Cover photos', 'TANIA!', 'Timeline Photos']);
const FB_SKIP_CONTAINS = [
  'CamWow', 'InstaEdit', 'Instagram Photos', 'Mobile uploads',
  'Profile pictures', 'INGENIERO', 'Tania conoce',
];
const FB_OVERRIDES = {
  'Casablanca 2009': { trip: 'Marruecos 2009', city: 'Casablanca', country: 'Morocco' },
  'Casablanca 2009  - Parte 2': { trip: 'Marruecos 2009', city: 'Casablanca', country: 'Morocco' },
  'Fes 2009': { trip: 'Marruecos 2009', city: 'Fes', country: 'Morocco' },
  'Fes 2009 - Parte 2': { trip: 'Marruecos 2009', city: 'Fes', country: 'Morocco' },
  "D'Ozour 2009": { trip: 'Marruecos 2009', city: "D'Ozour", country: 'Morocco' },
  "D'Ozour 2009 Parte 2": { trip: 'Marruecos 2009', city: "D'Ozour", country: 'Morocco' },
  'Luxor 2007 - Parte 1': { trip: 'Egypt 2007', city: 'Luxor', country: 'Egypt' },
  'Luxor 2007 - Parte 2': { trip: 'Egypt 2007', city: 'Luxor', country: 'Egypt' },
  'Luxor 2007 - Parte 3': { trip: 'Egypt 2007', city: 'Luxor', country: 'Egypt' },
  'USA 2013 Part 1': { trip: 'USA 2013', city: null, country: 'United States' },
  'USA 2013 Part 2': { trip: 'USA 2013', city: null, country: 'United States' },
  'USA 2013 Part 3': { trip: 'USA 2013', city: null, country: 'United States' },
  'Panamá 2013 - daytrip': { trip: 'Panama 2013', city: null, country: 'Panama' },
  'Rascafria 2010 - Madrid': { trip: 'Spain 2010', city: 'Rascafria', country: 'Spain' },
  'Isla de San Andrés 2014 , Colombia': { trip: 'Colombia 2014', city: 'San Andres', country: 'Colombia' },
  'Cusco, Machu Pichu y Lima 2016': { trip: 'Peru 2016', city: 'Cusco, Machu Pichu y Lima', country: 'Peru' },
  'Copenhagen 2016,  Denmark': { trip: 'Denmark 2016', city: 'Copenhagen', country: 'Denmark' },
  'Cinque terre, Portofino and Genova': { trip: 'Italy 2008', city: 'Cinque terre, Portofino and Genova', country: 'Italy' },
};

export function parseFbAlbum(rawTitle) {
  const title = rawTitle.trim();
  if (FB_SKIP_EXACT.has(title)) return null;
  if (FB_SKIP_CONTAINS.some(s => title.includes(s))) return null;
  if (FB_OVERRIDES[title]) return { ...FB_OVERRIDES[title], rawTitle: title };

  // "City Year (Country)"
  const parenM = title.match(/^(.+?)\s+(\d{4})\s*\(([^)]+)\)$/);
  if (parenM) {
    const [, place, year, country] = parenM;
    return { trip: `${country.trim()} ${year}`, city: place.trim(), country: country.trim(), rawTitle: title };
  }

  // "City, Country Year"
  const commaM = title.match(/^(.+?),\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(\d{4})$/);
  if (commaM) {
    const [, place, country, year] = commaM;
    if (WORLD_COUNTRIES.includes(country.trim())) {
      return { trip: `${country.trim()} ${year}`, city: place.trim(), country: country.trim(), rawTitle: title };
    }
  }

  // "Place Year" (optional suffix after year)
  const yearM = title.match(/^(.+?)\s+(\d{4})(?:\s.*)?$/);
  if (yearM) {
    const place = yearM[1].trim(), year = yearM[2];
    if (WORLD_COUNTRIES.includes(place)) {
      return { trip: `${place} ${year}`, city: null, country: place, rawTitle: title };
    }
    return { trip: `${place} ${year}`, city: place, country: null, rawTitle: title };
  }

  return { trip: title, city: null, country: null, rawTitle: title };
}

// ─── Image compression ───
