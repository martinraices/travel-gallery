import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { auth, db, storage } from './firebase';
import {
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
} from 'firebase/auth';
import {
  collection, addDoc, getDocs, deleteDoc, doc, updateDoc,
  query, where, orderBy, limit, serverTimestamp, getDoc, setDoc, writeBatch,
} from 'firebase/firestore';
import {
  ref, uploadBytes, getDownloadURL, deleteObject, listAll,
} from 'firebase/storage';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';

// ─── Country name → ISO 3166-1 numeric (for choropleth map) ───
const COUNTRY_ISO = {
  'Afghanistan': 4, 'Albania': 8, 'Algeria': 12, 'Andorra': 20, 'Angola': 24,
  'Antigua and Barbuda': 28, 'Argentina': 32, 'Armenia': 51, 'Australia': 36,
  'Austria': 40, 'Azerbaijan': 31, 'Bahamas': 44, 'Bahrain': 48, 'Bangladesh': 50,
  'Barbados': 52, 'Belarus': 112, 'Belgium': 56, 'Belize': 84, 'Benin': 204,
  'Bhutan': 64, 'Bolivia': 68, 'Bosnia and Herzegovina': 70, 'Botswana': 72,
  'Brazil': 76, 'Brunei': 96, 'Bulgaria': 100, 'Burkina Faso': 854, 'Burundi': 108,
  'Cabo Verde': 132, 'Cambodia': 116, 'Cameroon': 120, 'Canada': 124,
  'Central African Republic': 140, 'Chad': 148, 'Chile': 152, 'China': 156,
  'Colombia': 170, 'Comoros': 174, 'Congo': 178, 'Costa Rica': 188, 'Croatia': 191,
  'Cuba': 192, 'Cyprus': 196, 'Czech Republic': 203, 'Denmark': 208, 'Djibouti': 262,
  'Dominica': 212, 'Dominican Republic': 214, 'DR Congo': 180, 'Ecuador': 218,
  'Egypt': 818, 'El Salvador': 222, 'Equatorial Guinea': 226, 'Eritrea': 232,
  'Estonia': 233, 'Eswatini': 748, 'Ethiopia': 231, 'Fiji': 242, 'Finland': 246,
  'France': 250, 'Gabon': 266, 'Gambia': 270, 'Georgia': 268, 'Germany': 276,
  'Ghana': 288, 'Greece': 300, 'Grenada': 308, 'Guatemala': 320, 'Guinea': 324,
  'Guinea-Bissau': 624, 'Guyana': 328, 'Haiti': 332, 'Honduras': 340,
  'Hungary': 348, 'Iceland': 352, 'India': 356, 'Indonesia': 360, 'Iran': 364,
  'Iraq': 368, 'Ireland': 372, 'Israel': 376, 'Italy': 380, 'Jamaica': 388,
  'Japan': 392, 'Jordan': 400, 'Kazakhstan': 398, 'Kenya': 404, 'Kiribati': 296,
  'Kuwait': 414, 'Kyrgyzstan': 417, 'Laos': 418, 'Latvia': 428, 'Lebanon': 422,
  'Lesotho': 426, 'Liberia': 430, 'Libya': 434, 'Liechtenstein': 438,
  'Lithuania': 440, 'Luxembourg': 442, 'Madagascar': 450, 'Malawi': 454,
  'Malaysia': 458, 'Maldives': 462, 'Mali': 466, 'Malta': 470,
  'Marshall Islands': 584, 'Mauritania': 478, 'Mauritius': 480, 'Mexico': 484,
  'Micronesia': 583, 'Moldova': 498, 'Monaco': 492, 'Mongolia': 496,
  'Montenegro': 499, 'Morocco': 504, 'Mozambique': 508, 'Myanmar': 104,
  'Namibia': 516, 'Nauru': 520, 'Nepal': 524, 'Netherlands': 528,
  'New Zealand': 554, 'Nicaragua': 558, 'Niger': 562, 'Nigeria': 566,
  'North Korea': 408, 'North Macedonia': 807, 'Norway': 578, 'Oman': 512,
  'Pakistan': 586, 'Palau': 585, 'Palestine': 275, 'Panama': 591,
  'Papua New Guinea': 598, 'Paraguay': 600, 'Peru': 604, 'Philippines': 608,
  'Poland': 616, 'Portugal': 620, 'Qatar': 634, 'Romania': 642, 'Russia': 643,
  'Rwanda': 646, 'Saint Kitts and Nevis': 659, 'Saint Lucia': 662,
  'Saint Vincent and the Grenadines': 670, 'Samoa': 882, 'San Marino': 674,
  'Sao Tome and Principe': 678, 'Saudi Arabia': 682, 'Senegal': 686,
  'Serbia': 688, 'Seychelles': 690, 'Sierra Leone': 694, 'Singapore': 702,
  'Slovakia': 703, 'Slovenia': 705, 'Solomon Islands': 90, 'Somalia': 706,
  'South Africa': 710, 'South Korea': 410, 'South Sudan': 728, 'Spain': 724,
  'Sri Lanka': 144, 'Sudan': 729, 'Suriname': 740, 'Sweden': 752,
  'Switzerland': 756, 'Syria': 760, 'Taiwan': 158, 'Tajikistan': 762,
  'Tanzania': 834, 'Thailand': 764, 'Timor-Leste': 626, 'Togo': 768,
  'Tonga': 776, 'Trinidad and Tobago': 780, 'Tunisia': 788, 'Turkey': 792,
  'Turkmenistan': 795, 'Tuvalu': 798, 'Uganda': 800, 'Ukraine': 804,
  'United Arab Emirates': 784, 'United Kingdom': 826, 'United States': 840,
  'Uruguay': 858, 'Uzbekistan': 860, 'Vanuatu': 548, 'Vatican City': 336,
  'Venezuela': 862, 'Vietnam': 704, 'Yemen': 887, 'Zambia': 894, 'Zimbabwe': 716,
  'Scotland': 826,
};

const COUNTRY_NAMES = Object.keys(COUNTRY_ISO);
const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

// ─── All world countries (for datalist autocomplete) ───
const WORLD_COUNTRIES = [
  'Afghanistan','Albania','Algeria','Andorra','Angola','Antigua and Barbuda','Argentina',
  'Armenia','Australia','Austria','Azerbaijan','Bahamas','Bahrain','Bangladesh','Barbados',
  'Belarus','Belgium','Belize','Benin','Bhutan','Bolivia','Bosnia and Herzegovina','Botswana',
  'Brazil','Brunei','Bulgaria','Burkina Faso','Burundi','Cabo Verde','Cambodia','Cameroon',
  'Canada','Central African Republic','Chad','Chile','China','Colombia','Comoros','Congo',
  'Costa Rica','Croatia','Cuba','Cyprus','Czech Republic','Denmark','Djibouti','Dominica',
  'Dominican Republic','DR Congo','Ecuador','Egypt','El Salvador','Equatorial Guinea',
  'Eritrea','Estonia','Eswatini','Ethiopia','Fiji','Finland','France','Gabon','Gambia',
  'Georgia','Germany','Ghana','Greece','Grenada','Guatemala','Guinea','Guinea-Bissau',
  'Guyana','Haiti','Honduras','Hungary','Iceland','India','Indonesia','Iran','Iraq',
  'Ireland','Israel','Italy','Jamaica','Japan','Jordan','Kazakhstan','Kenya','Kiribati',
  'Kuwait','Kyrgyzstan','Laos','Latvia','Lebanon','Lesotho','Liberia','Libya','Liechtenstein',
  'Lithuania','Luxembourg','Madagascar','Malawi','Malaysia','Maldives','Mali','Malta',
  'Marshall Islands','Mauritania','Mauritius','Mexico','Micronesia','Moldova','Monaco',
  'Mongolia','Montenegro','Morocco','Mozambique','Myanmar','Namibia','Nauru','Nepal',
  'Netherlands','New Zealand','Nicaragua','Niger','Nigeria','North Korea','North Macedonia',
  'Norway','Oman','Pakistan','Palau','Palestine','Panama','Papua New Guinea','Paraguay',
  'Peru','Philippines','Poland','Portugal','Qatar','Romania','Russia','Rwanda',
  'Saint Kitts and Nevis','Saint Lucia','Saint Vincent and the Grenadines','Samoa',
  'San Marino','Sao Tome and Principe','Saudi Arabia','Senegal','Serbia','Seychelles',
  'Sierra Leone','Singapore','Slovakia','Slovenia','Solomon Islands','Somalia',
  'South Africa','South Korea','South Sudan','Spain','Sri Lanka','Sudan','Suriname',
  'Sweden','Switzerland','Syria','Taiwan','Tajikistan','Tanzania','Thailand','Timor-Leste',
  'Togo','Tonga','Trinidad and Tobago','Tunisia','Turkey','Turkmenistan','Tuvalu',
  'Uganda','Ukraine','United Arab Emirates','United Kingdom','United States','Uruguay',
  'Uzbekistan','Vanuatu','Vatican City','Venezuela','Vietnam','Yemen','Zambia','Zimbabwe',
];

// ─── ISO → country name reverse lookup ───
const ISO_COUNTRY = Object.fromEntries(Object.entries(COUNTRY_ISO).map(([n, i]) => [i, n]));

// ─── Country → continent mapping ───
const COUNTRY_CONTINENT = {
  'Antigua and Barbuda': 'North America', 'Bahamas': 'North America', 'Barbados': 'North America',
  'Belize': 'North America', 'Canada': 'North America', 'Costa Rica': 'North America',
  'Cuba': 'North America', 'Dominica': 'North America', 'Dominican Republic': 'North America',
  'El Salvador': 'North America', 'Grenada': 'North America', 'Guatemala': 'North America',
  'Haiti': 'North America', 'Honduras': 'North America', 'Jamaica': 'North America',
  'Mexico': 'North America', 'Nicaragua': 'North America', 'Panama': 'North America',
  'Saint Kitts and Nevis': 'North America', 'Saint Lucia': 'North America',
  'Saint Vincent and the Grenadines': 'North America', 'Trinidad and Tobago': 'North America',
  'United States': 'North America',
  'Argentina': 'South America', 'Bolivia': 'South America', 'Brazil': 'South America',
  'Chile': 'South America', 'Colombia': 'South America', 'Ecuador': 'South America',
  'Guyana': 'South America', 'Paraguay': 'South America', 'Peru': 'South America',
  'Suriname': 'South America', 'Uruguay': 'South America', 'Venezuela': 'South America',
  'Albania': 'Europe', 'Andorra': 'Europe', 'Austria': 'Europe', 'Belarus': 'Europe',
  'Belgium': 'Europe', 'Bosnia and Herzegovina': 'Europe', 'Bulgaria': 'Europe',
  'Croatia': 'Europe', 'Cyprus': 'Europe', 'Czech Republic': 'Europe', 'Denmark': 'Europe',
  'Estonia': 'Europe', 'Finland': 'Europe', 'France': 'Europe', 'Georgia': 'Europe',
  'Germany': 'Europe', 'Greece': 'Europe', 'Hungary': 'Europe', 'Iceland': 'Europe',
  'Ireland': 'Europe', 'Italy': 'Europe', 'Latvia': 'Europe', 'Liechtenstein': 'Europe',
  'Lithuania': 'Europe', 'Luxembourg': 'Europe', 'Malta': 'Europe', 'Moldova': 'Europe',
  'Monaco': 'Europe', 'Montenegro': 'Europe', 'Netherlands': 'Europe',
  'North Macedonia': 'Europe', 'Norway': 'Europe', 'Poland': 'Europe', 'Portugal': 'Europe',
  'Romania': 'Europe', 'Russia': 'Europe', 'San Marino': 'Europe', 'Scotland': 'Europe',
  'Serbia': 'Europe', 'Slovakia': 'Europe', 'Slovenia': 'Europe', 'Spain': 'Europe',
  'Sweden': 'Europe', 'Switzerland': 'Europe', 'Ukraine': 'Europe', 'United Kingdom': 'Europe',
  'Vatican City': 'Europe',
  'Afghanistan': 'Asia', 'Armenia': 'Asia', 'Azerbaijan': 'Asia', 'Bahrain': 'Asia',
  'Bangladesh': 'Asia', 'Bhutan': 'Asia', 'Brunei': 'Asia', 'Cambodia': 'Asia',
  'China': 'Asia', 'India': 'Asia', 'Indonesia': 'Asia', 'Iran': 'Asia', 'Iraq': 'Asia',
  'Israel': 'Asia', 'Japan': 'Asia', 'Jordan': 'Asia', 'Kazakhstan': 'Asia',
  'Kuwait': 'Asia', 'Kyrgyzstan': 'Asia', 'Laos': 'Asia', 'Lebanon': 'Asia',
  'Malaysia': 'Asia', 'Maldives': 'Asia', 'Mongolia': 'Asia', 'Myanmar': 'Asia',
  'Nepal': 'Asia', 'North Korea': 'Asia', 'Oman': 'Asia', 'Pakistan': 'Asia',
  'Palestine': 'Asia', 'Philippines': 'Asia', 'Qatar': 'Asia', 'Saudi Arabia': 'Asia',
  'Singapore': 'Asia', 'South Korea': 'Asia', 'Sri Lanka': 'Asia', 'Syria': 'Asia',
  'Taiwan': 'Asia', 'Tajikistan': 'Asia', 'Thailand': 'Asia', 'Timor-Leste': 'Asia',
  'Turkey': 'Asia', 'Turkmenistan': 'Asia', 'United Arab Emirates': 'Asia',
  'Uzbekistan': 'Asia', 'Vietnam': 'Asia', 'Yemen': 'Asia',
  'Algeria': 'Africa', 'Angola': 'Africa', 'Benin': 'Africa', 'Botswana': 'Africa',
  'Burkina Faso': 'Africa', 'Burundi': 'Africa', 'Cabo Verde': 'Africa', 'Cameroon': 'Africa',
  'Central African Republic': 'Africa', 'Chad': 'Africa', 'Comoros': 'Africa', 'Congo': 'Africa',
  'Djibouti': 'Africa', 'DR Congo': 'Africa', 'Egypt': 'Africa', 'Equatorial Guinea': 'Africa',
  'Eritrea': 'Africa', 'Eswatini': 'Africa', 'Ethiopia': 'Africa', 'Gabon': 'Africa',
  'Gambia': 'Africa', 'Ghana': 'Africa', 'Guinea': 'Africa', 'Guinea-Bissau': 'Africa',
  'Kenya': 'Africa', 'Lesotho': 'Africa', 'Liberia': 'Africa', 'Libya': 'Africa',
  'Madagascar': 'Africa', 'Malawi': 'Africa', 'Mali': 'Africa', 'Mauritania': 'Africa',
  'Mauritius': 'Africa', 'Morocco': 'Africa', 'Mozambique': 'Africa', 'Namibia': 'Africa',
  'Niger': 'Africa', 'Nigeria': 'Africa', 'Rwanda': 'Africa', 'Sao Tome and Principe': 'Africa',
  'Senegal': 'Africa', 'Seychelles': 'Africa', 'Sierra Leone': 'Africa', 'Somalia': 'Africa',
  'South Africa': 'Africa', 'South Sudan': 'Africa', 'Sudan': 'Africa', 'Tanzania': 'Africa',
  'Togo': 'Africa', 'Tunisia': 'Africa', 'Uganda': 'Africa', 'Zambia': 'Africa', 'Zimbabwe': 'Africa',
  'Australia': 'Oceania', 'Fiji': 'Oceania', 'Kiribati': 'Oceania', 'Marshall Islands': 'Oceania',
  'Micronesia': 'Oceania', 'Nauru': 'Oceania', 'New Zealand': 'Oceania', 'Palau': 'Oceania',
  'Papua New Guinea': 'Oceania', 'Samoa': 'Oceania', 'Solomon Islands': 'Oceania',
  'Tonga': 'Oceania', 'Tuvalu': 'Oceania', 'Vanuatu': 'Oceania',
};
const CONTINENT_ORDER = ['Europe', 'North America', 'South America', 'Asia', 'Africa', 'Oceania', 'Other'];

const ALLOWED_EMAILS = ['raicesm@gmail.com', 'elena.beccaro@gmail.com'];

const SPANISH_COUNTRIES = new Set(['ES','MX','AR','CO','CL','PE','VE','EC','GT','CU','BO','DO','HN','PY','SV','NI','CR','PA','UY','GQ','PR']);

// ─── Facebook import helpers ───
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

function parseFbAlbum(rawTitle) {
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
function compressImage(file, maxDim = 2000, quality = 0.82) {
  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        const ratio = Math.min(maxDim / width, maxDim / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      const canvas = document.createElement('canvas');
      canvas.width = width; canvas.height = height;
      canvas.getContext('2d').drawImage(img, 0, 0, width, height);
      canvas.toBlob((blob) => {
        URL.revokeObjectURL(objectUrl);
        resolve(blob);
      }, 'image/jpeg', quality);
    };
    img.src = objectUrl;
  });
}

async function uploadPhotoVariants(file, basePath, safeName) {
  const fullBlob = await compressImage(file);
  const thumbBlob = await compressImage(file, 520, 0.72);
  const storagePath = `${basePath}/${safeName}`;
  const thumbStoragePath = `${basePath}/thumbs/${safeName}`;
  const storageRef = ref(storage, storagePath);
  const thumbStorageRef = ref(storage, thumbStoragePath);
  await Promise.all([
    uploadBytes(storageRef, fullBlob),
    uploadBytes(thumbStorageRef, thumbBlob),
  ]);
  const [url, thumbUrl] = await Promise.all([
    getDownloadURL(storageRef),
    getDownloadURL(thumbStorageRef),
  ]);
  return { url, storagePath, thumbUrl, thumbStoragePath };
}

function formatDuration(ms) {
  if (!Number.isFinite(ms) || ms <= 0) return '';
  const totalMinutes = Math.max(1, Math.round(ms / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

export default function App() {
  // ─── Language (IP-based, falls back to browser language) ───
  const [isSpanish, setIsSpanish] = useState(() => (navigator.language || '').startsWith('es'));
  useEffect(() => {
    fetch('https://ipapi.co/json/')
      .then(r => r.json())
      .then(data => { if (data.country_code) setIsSpanish(SPANISH_COUNTRIES.has(data.country_code)); })
      .catch(() => {});
  }, []);
  const T = {
    // Header
    adminTools: isSpanish ? '⚙ Herramientas' : '⚙ Admin Tools',
    importFbMenu: isSpanish ? '↓ Importar desde Facebook' : '↓ Import from Facebook',
    generateThumbsMenu: isSpanish ? 'Generar miniaturas desde carpeta local' : 'Generate thumbnails from local folder',
    manageAccessesMenu: isSpanish ? '👥 Gestionar accesos' : '👥 Manage Accesses',
    newTrip: isSpanish ? '+ Nuevo viaje' : '+ New Trip',
    addPhotos: isSpanish ? '+ Agregar fotos' : '+ Add Photos',
    uploading: (d, t) => isSpanish ? `Subiendo ${d}/${t}…` : `Uploading ${d}/${t}…`,
    lightMode: isSpanish ? 'Modo claro' : 'Light mode',
    darkMode: isSpanish ? 'Modo oscuro' : 'Dark mode',
    signOut: isSpanish ? 'Cerrar sesión' : 'Sign out',
    // Stats panel
    selectAll: isSpanish ? 'Seleccionar todo' : 'Select all',
    allTrips: isSpanish ? 'Todos los viajes' : 'All Trips',
    shareAlbumsBtn: (n) => isSpanish ? `Compartir álbumes (${n})` : `Share Albums (${n})`,
    tripsLabel: isSpanish ? 'Viajes' : 'Trips',
    photosLabel: isSpanish ? 'Fotos' : 'Photos',
    countriesLabel: isSpanish ? 'Países' : 'Countries',
    wishlistLabel: isSpanish ? 'Lista de deseos' : 'Wishlist',
    countriesVisited: isSpanish ? 'Países visitados' : 'Countries Visited',
    // Migration
    migrateNow: isSpanish ? 'Migrar ahora' : 'Migrate now',
    migratingAlbums: isSpanish ? 'Migrando álbumes… no cierres esta pestaña.' : 'Migrating albums… do not close this tab.',
    migrationComplete: isSpanish ? '✓ Migración completa — todos los álbumes están ahora en la galería compartida.' : '✓ Migration complete — all albums are now in the shared gallery.',
    migrationFailed: isSpanish ? 'La migración falló:' : 'Migration failed:',
    retry: isSpanish ? 'Reintentar' : 'Retry',
    thumbMigrationTitle: isSpanish ? 'Generando miniaturas' : 'Generating thumbnails',
    thumbMigrationScanning: isSpanish ? 'Indexando carpeta local y buscando fotos sin miniatura…' : 'Indexing local folder and finding photos without thumbnails…',
    thumbMigrationProgress: (d, t) => isSpanish ? `${d} de ${t} miniaturas generadas` : `${d} of ${t} thumbnails generated`,
    thumbMigrationDone: (n) => isSpanish ? `Listo: ${n} miniatura${n !== 1 ? 's' : ''} generada${n !== 1 ? 's' : ''}.` : `Done: ${n} thumbnail${n !== 1 ? 's' : ''} generated.`,
    thumbMigrationNone: isSpanish ? 'Todas las fotos ya tienen miniatura.' : 'Every photo already has a thumbnail.',
    thumbMigrationMissing: (n) => isSpanish ? `${n} foto${n !== 1 ? 's' : ''} no encontrada${n !== 1 ? 's' : ''} en la carpeta local` : `${n} photo${n !== 1 ? 's' : ''} not found in the local folder`,
    thumbMigrationEta: (eta, rate) => isSpanish ? `Tiempo estimado: ${eta} · ${rate}/min` : `ETA: ${eta} · ${rate}/min`,
    calculatingEta: isSpanish ? 'Calculando tiempo…' : 'Calculating time…',
    // New trip form
    tripNameLabel: isSpanish ? 'Nombre del viaje' : 'Trip Name',
    dateOptional: isSpanish ? 'Fecha (opcional)' : 'Date (optional)',
    countryOptional: isSpanish ? 'País (opcional)' : 'Country (optional)',
    miroLinkOptional: isSpanish ? 'Enlace de Miro (opcional)' : 'Miro link (optional)',
    visibilityLabel: isSpanish ? 'Visibilidad' : 'Visibility',
    visShared: isSpanish ? '🌍 Compartido' : '🌍 Shared',
    visPrivate: isSpanish ? '🔒 Privado' : '🔒 Private',
    create: isSpanish ? 'Crear' : 'Create',
    cancel: isSpanish ? 'Cancelar' : 'Cancel',
    tripNamePlaceholder: isSpanish ? 'ej. Patagonia 2024' : 'e.g. Patagonia 2024',
    countryPlaceholder: isSpanish ? 'ej. Italia' : 'e.g. Italy',
    // Empty state
    noTripsYet: isSpanish ? 'Aún no hay viajes' : 'No trips yet',
    noTripsYetSub: isSpanish ? 'Crea tu primer viaje para empezar a subir fotos.' : 'Create your first trip to start uploading photos.',
    // Map
    wishlistTooltip: isSpanish ? '★ Lista de deseos' : '★ Wishlist',
    // Trip cards
    gridView: isSpanish ? 'Vista de cuadrícula' : 'Grid view',
    sortByDate: 'Sort by Date',
    sortAZ: 'Sort A-Z',
    privateTitle: isSpanish ? 'Privado' : 'Private',
    sharedTitle: isSpanish ? 'Compartido' : 'Shared',
    editTripBtn: isSpanish ? 'Editar viaje' : 'Edit trip',
    sharedSeeLink: isSpanish ? 'Compartido — clic para ver enlace' : 'Shared — click to see link',
    shareThisTrip: isSpanish ? 'Compartir este viaje' : 'Share this trip',
    createdBy: (u) => isSpanish ? `Creado por ${u}` : `Created by ${u}`,
    setCreator: isSpanish ? '+ Establecer creador' : '+ Set creator',
    whoCreated: isSpanish ? '¿Quién creó este álbum? (ingresa su usuario o email de Gmail)' : 'Who created this album? (enter their Gmail username or email)',
    couldNotSave: isSpanish ? 'No se pudo guardar: ' : 'Could not save: ',
    photoCount: (n) => isSpanish ? `${n} foto${n !== 1 ? 's' : ''}` : `${n} photo${n !== 1 ? 's' : ''}`,
    // Gallery header
    backToTrips: isSpanish ? '← Viajes' : '← Trips',
    noCityAssigned: isSpanish ? 'Sin ciudad asignada' : 'No city assigned',
    openInMiro: isSpanish ? 'Abrir en Miro' : 'Open in Miro',
    generating: isSpanish ? 'Generando…' : 'Generating…',
    sharedBtn: isSpanish ? '↗ Compartido' : '↗ Shared',
    shareBtn: isSpanish ? '↗ Compartir' : '↗ Share',
    saveChanges: (n) => isSpanish ? `Guardar cambios (${n})` : `Save Changes (${n})`,
    grid: isSpanish ? 'Cuadrícula' : 'Grid',
    list: isSpanish ? 'Lista' : 'List',
    editSubAlbumBtn: isSpanish ? 'Editar subálbum' : 'Edit sub-album',
    // Photo area
    dragDropPhotos: isSpanish ? 'Arrastra y suelta fotos aquí' : 'Drag & drop photos here',
    orClickToBrowse: isSpanish ? 'o haz clic para buscar' : 'or click to browse',
    noPhotosYet: isSpanish ? 'Aún no hay fotos en este álbum' : 'No photos in this album yet',
    uploadingPhotos: (d, t) => isSpanish ? `Subiendo ${d} de ${t} fotos…` : `Uploading ${d} of ${t} photos…`,
    clickToEditName: isSpanish ? 'Clic para editar el nombre' : 'Click to edit the name',
    insertEmoji: isSpanish ? 'Insertar emoji' : 'Insert emoji',
    miroLinkOptionalPh: isSpanish ? 'Enlace de Miro (opcional)' : 'Miro link (optional)',
    // Context menu
    useAsAlbumCover: isSpanish ? 'Usar como portada del álbum' : 'Use as album cover',
    useAsAppWallpaper: isSpanish ? 'Usar como fondo de pantalla' : 'Use as app wallpaper',
    deletePhotoMenu: isSpanish ? 'Eliminar foto' : 'Delete photo',
    // Lightbox
    addDescriptionPh: isSpanish ? 'Añadir una descripción…' : 'Add a description…',
    setAsAlbumCoverTitle: isSpanish ? 'Usar como portada del álbum' : 'Set as album cover',
    deletePhotoTitle: isSpanish ? 'Eliminar foto' : 'Delete photo',
    // Delete trip modal
    deleteTripQuestion: isSpanish ? '¿Eliminar este viaje?' : 'Delete this trip?',
    deleteTripWarn: isSpanish ? 'Todas las fotos serán eliminadas permanentemente del almacenamiento.' : 'All photos will be permanently deleted from storage.',
    deleteBtn: isSpanish ? 'Eliminar' : 'Delete',
    // Edit trip / sub-album modals
    editTripHeading: isSpanish ? 'Editar viaje' : 'Edit Trip',
    nameLabel: isSpanish ? 'Nombre' : 'Name',
    dateLabel: isSpanish ? 'Fecha' : 'Date',
    countryLabel: isSpanish ? 'País' : 'Country',
    miroLink: isSpanish ? 'Enlace de Miro' : 'Miro link',
    saving: isSpanish ? 'Guardando…' : 'Saving…',
    save: isSpanish ? 'Guardar' : 'Save',
    editSubAlbumHeading: isSpanish ? 'Editar subálbum' : 'Edit Sub-Album',
    // Assign city modal
    assignCityHeading: isSpanish ? 'Asignar ciudad' : 'Assign city',
    photosSelected: (n) => isSpanish
      ? `${n} foto${n !== 1 ? 's' : ''} seleccionada${n !== 1 ? 's' : ''}`
      : `${n} photo${n !== 1 ? 's' : ''} selected`,
    cityPlaceholder: isSpanish ? 'ej. Pekín' : 'e.g. Beijing',
    // Auto-date modal
    settingDates: isSpanish ? 'Estableciendo fechas de viaje…' : 'Setting travel dates…',
    scanningFbAlbums: isSpanish ? 'Escaneando álbumes de Facebook para fechas de fotos.' : 'Scanning Facebook albums for photo dates.',
    doneBtn: isSpanish ? 'Listo' : 'Done',
    autoDateUpdated: (u, s) => isSpanish
      ? `Se actualizaron ${u} viaje${u !== 1 ? 's' : ''} de ${s} álbum${s !== 1 ? 'es' : ''} escaneados.`
      : `Updated ${u} trip${u !== 1 ? 's' : ''} from ${s} album${s !== 1 ? 's' : ''} scanned.`,
    autoDateNoAlbums: isSpanish
      ? 'No se pudieron leer álbumes de Facebook. Verifica que hayas seleccionado la carpeta correcta.'
      : 'No Facebook albums could be read. Check that you selected the correct folder.',
    autoDateNoDates: (s) => isSpanish
      ? `Se escanearon ${s} álbum${s !== 1 ? 'es' : ''} pero no se encontraron fechas. El formato de exportación puede no incluir fechas de toma.`
      : `Scanned ${s} album${s !== 1 ? 's' : ''} but no dates were found in the photos. The export format may not include "taken" dates.`,
    close: isSpanish ? 'Cerrar' : 'Close',
    // Facebook import modal
    importFbTitle: isSpanish ? 'Importar desde Facebook' : 'Import from Facebook',
    fbFolderNote: isSpanish
      ? 'Selecciona tu carpeta your_facebook_activity (o su directorio padre) de tu exportación de datos de Facebook. Solo Chrome/Edge.'
      : 'Select your your_facebook_activity folder (or its parent) from your Facebook data export. Chrome/Edge only.',
    scanFolder: isSpanish ? 'Escanear carpeta…' : 'Scan folder…',
    selectCitiesToImport: isSpanish ? 'Seleccionar ciudades para importar' : 'Select cities to import',
    citiesAvail: isSpanish ? 'ciudades disponibles' : 'cities available',
    selectedLabel: isSpanish ? 'seleccionadas' : 'selected',
    albumsLabel: (n) => isSpanish ? `${n} álbum${n !== 1 ? 'es' : ''}` : `${n} album${n !== 1 ? 's' : ''}`,
    alreadyImported: isSpanish ? 'ya importadas' : 'already imported',
    filterByCityOrAlbum: isSpanish ? 'Filtrar por ciudad o álbum…' : 'Filter by city or album…',
    all: isSpanish ? 'Todos' : 'All',
    none: isSpanish ? 'Ninguno' : 'None',
    cityCol: isSpanish ? 'Ciudad' : 'City',
    albumCol: isSpanish ? 'Álbum' : 'Album',
    photosCol: isSpanish ? 'Fotos' : 'Photos',
    albumName: isSpanish ? 'Nombre del álbum' : 'Album name',
    importNCities: (n) => isSpanish
      ? `Importar ${n} ciudad${n !== 1 ? 'es' : ''}`
      : `Import ${n} cit${n !== 1 ? 'ies' : 'y'}`,
    importing: isSpanish ? 'Importando…' : 'Importing…',
    scanningAlbums: isSpanish ? 'Escaneando álbumes…' : 'Scanning albums…',
    remaining: isSpanish ? 'restante' : 'remaining',
    elapsed: isSpanish ? 'Transcurrido:' : 'Elapsed:',
    scanningEllipsis: isSpanish ? 'Escaneando…' : 'Scanning…',
    waiting: isSpanish ? 'Esperando…' : 'Waiting…',
    stopImport: isSpanish ? 'Detener importación' : 'Stop import',
    importComplete: isSpanish ? 'Importación completa' : 'Import complete',
    importedPhotos: (p, t) => isSpanish
      ? `${p} foto${p !== 1 ? 's' : ''} importada${p !== 1 ? 's' : ''} en ${t} viaje${t !== 1 ? 's' : ''}.`
      : `${p} photos imported into ${t} trip${t !== 1 ? 's' : ''}.`,
    // Share trip modal
    shareTripTitle: isSpanish ? 'Compartir viaje' : 'Share Trip',
    shareLinkNote: isSpanish
      ? 'Cualquiera con este enlace puede ver las fotos — sin necesidad de iniciar sesión.'
      : 'Anyone with this link can view the photos — no login required.',
    copy: isSpanish ? 'Copiar' : 'Copy',
    revokeLink: isSpanish ? 'Revocar enlace' : 'Revoke link',
    // Share albums modal
    shareAlbumsTitle: isSpanish ? 'Compartir álbumes' : 'Share Albums',
    albumSelected: (n) => isSpanish
      ? `${n} álbum${n !== 1 ? 'es' : ''} seleccionado${n !== 1 ? 's' : ''}:`
      : `${n} album${n !== 1 ? 's' : ''} selected:`,
    emailAddressesLabel: isSpanish ? 'Direcciones de email' : 'Email addresses',
    emailPlaceholder: isSpanish ? 'email1@ejemplo.com, email2@ejemplo.com' : 'email1@example.com, email2@example.com',
    emailNote: isSpanish
      ? 'Separa múltiples direcciones con comas. Al confirmar, se abrirá tu cliente de correo con la notificación lista para enviar.'
      : 'Separate multiple addresses with commas. Confirming will open your mail client with the notification ready to send.',
    sharing: isSpanish ? 'Compartiendo…' : 'Sharing…',
    shareAndNotify: isSpanish ? 'Compartir y notificar' : 'Share and notify',
    // Share success modal
    albumsSharedTitle: isSpanish ? '¡Álbumes compartidos!' : 'Albums shared!',
    accessGrantedTo: (emails) => isSpanish
      ? `Se otorgó acceso a ${emails} para:`
      : `Access granted to ${emails} for:`,
    emailClientNote: isSpanish
      ? 'Se abrió tu cliente de correo para enviar la notificación. Si no se abrió, revisa que tengas un cliente de correo configurado.'
      : 'Your mail client was opened to send the notification. If it did not open, check that you have a mail client configured.',
    accept: isSpanish ? 'Aceptar' : 'Accept',
    // Manage accesses modal
    manageAccessesTitle: isSpanish ? 'Gestionar accesos' : 'Manage Accesses',
    noAlbumsSharedYet: isSpanish ? 'Aún no se han compartido álbumes con nadie.' : 'No albums have been shared yet.',
    revoke: isSpanish ? 'Revocar' : 'Revoke',
    // Public share view
    sharedLinkInvalid: isSpanish ? 'Este enlace compartido ya no es válido.' : 'This shared link is no longer valid.',
    sharedGallery: isSpanish ? 'Galería compartida' : 'Shared gallery',
    // Login
    signInSub: isSpanish ? 'Inicia sesión para acceder a tu galería privada' : 'Sign in to access your private gallery',
    continueWithGoogle: isSpanish ? 'Continuar con Google' : 'Continue with Google',
    continueAsGuest: isSpanish ? 'Entrar como invitado' : 'Continue as Guest',
    signingIn: isSpanish ? 'Iniciando sesión…' : 'Signing in…',
    signInFailed: isSpanish ? 'Error al iniciar sesión — inténtalo de nuevo' : 'Sign-in failed — please try again',
    guestSignInFailed: isSpanish ? 'No se pudo entrar como invitado' : 'Guest access failed',
    guestModeLabel: isSpanish ? 'Invitado' : 'Guest',
    guestBannerTitle: isSpanish ? 'Has entrado como invitado' : 'You are browsing as a Guest',
    guestBannerText: isSpanish
      ? 'Modo solo lectura: puedes ver álbumes compartidos, fotos y el mapa. No puedes crear, editar, borrar, subir fotos, compartir álbumes ni cambiar ajustes.'
      : 'Read-only mode: you can view shared albums, photos, and the map. You cannot create, edit, delete, upload photos, share albums, or change settings.',
    // Access denied
    accessDenied: isSpanish ? 'Acceso denegado' : 'Access denied',
    appIsPrivate: isSpanish ? 'Esta aplicación es privada y solo accesible por invitación.' : 'This application is private and accessible by invitation only.',
    contactAdmin: isSpanish ? 'Si crees que deberías tener acceso, contacta al administrador.' : 'If you believe you should have access, contact the administrator.',
    backToLogin: isSpanish ? '← Volver al login' : '← Back to login',
  };
  // ─── Auth ───
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);
  const [guestLoggingIn, setGuestLoggingIn] = useState(false);
  const [guestMode, setGuestMode] = useState(false);
  const [creatorMap, setCreatorMap] = useState({}); // { [uid]: email }
  const isGuest = guestMode || !!user?.isAnonymous;
  const isReadOnly = isGuest;

  // ─── Core state ───
  const [trips, setTrips] = useState([]);
  const [activeTrip, setActiveTrip] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loadingTrips, setLoadingTrips] = useState(false);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadCount, setUploadCount] = useState({ done: 0, total: 0 });
  const [showNewTrip, setShowNewTrip] = useState(false);
  const [newTripName, setNewTripName] = useState('');
  const [newTripDate, setNewTripDate] = useState('');
  const [newTripCountry, setNewTripCountry] = useState('');
  const [newTripMiro, setNewTripMiro] = useState('');
  const [newTripVisibility, setNewTripVisibility] = useState('shared');
  const [lightbox, setLightbox] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [view, setView] = useState('grid');
  const [tripsView, setTripsView] = useState('grid');
  const [tripSort, setTripSort] = useState(null);
  const [appWallpaperUrl, setAppWallpaperUrl] = useState('');
  const [scrollFade, setScrollFade] = useState('');
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef();
  const lastScrollYRef = useRef(0);
  const scrollFadeTimerRef = useRef(null);

  // ─── Dark mode ───
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');

  // ─── Photo reorder ───
  const draggingIdx = useRef(null);
  const [dragOverIdx, setDragOverIdx] = useState(null);

  // ─── Map ───
  const [mapTooltip, setMapTooltip] = useState('');
  const [mapZoom, setMapZoom] = useState(1);
  const [mapCenter, setMapCenter] = useState([0, 10]);
  const [wishlist, setWishlist] = useState(new Set());

  // ─── Stat panels ───
  const [statPanel, setStatPanel] = useState(null);
  const [expandedContinents, setExpandedContinents] = useState(new Set());
  const [expandedCountries, setExpandedCountries] = useState(new Set());
  const [customPanelLabel, setCustomPanelLabel] = useState('');
  const [customPanelMiro, setCustomPanelMiro] = useState('');
  const [editingPanel, setEditingPanel] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const panelInputRef = useRef(null);
  const panelSaveTimer = useRef(null);

  // ─── Trip selection & album sharing ───
  const [selectedTrips, setSelectedTrips] = useState(new Set());
  const [shareAlbumsModal, setShareAlbumsModal] = useState(false);
  const [shareEmailsInput, setShareEmailsInput] = useState('');
  const [sharingAlbums, setSharingAlbums] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(null); // { emails, tripNames }

  // ─── Admin tools ───
  const [adminDropdown, setAdminDropdown] = useState(false);
  const [manageAccessesModal, setManageAccessesModal] = useState(false);
  const [albumShares, setAlbumShares] = useState([]);
  const [loadingShares, setLoadingShares] = useState(false);

  // ─── Access denied (non-whitelisted users) ───
  const [accessDenied, setAccessDenied] = useState(false);

  // ─── Edit trip ───
  const [editTrip, setEditTrip] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editCountry, setEditCountry] = useState('');
  const [editMiro, setEditMiro] = useState('');
  const [editVisibility, setEditVisibility] = useState('shared');
  const [editSaving, setEditSaving] = useState(false);

  // ─── Edit city sub-album ───
  const [editCity, setEditCity] = useState(null); // { tripId, cityName } | null
  const [editCityName, setEditCityName] = useState('');
  const [editCityVisibility, setEditCityVisibility] = useState('shared');
  const [editCitySaving, setEditCitySaving] = useState(false);

  // ─── Share ───
  const [shareModal, setShareModal] = useState(null);
  const [shareGenerating, setShareGenerating] = useState(null);

  // ─── Public share (for ?share=TOKEN URLs) ───
  const [publicShareData, setPublicShareData] = useState(null);
  const [publicShareLoading, setPublicShareLoading] = useState(false);
  const [publicLightbox, setPublicLightbox] = useState(null);
  const [publicLbIdx, setPublicLbIdx] = useState(-1);

  // ─── Lightbox description ───
  const [lbDesc, setLbDesc] = useState('');
  const [lbCoverSet, setLbCoverSet] = useState(false);

  // ─── Context menu (right-click on photo) ───
  const [contextMenu, setContextMenu] = useState(null); // { x, y, photo }

  // ─── Migration ───
  const [migration, setMigration] = useState(null); // null | 'needed' | 'running' | 'done' | 'error'
  const [migrationCount, setMigrationCount] = useState(0);
  const [migrationError, setMigrationError] = useState('');
  const [thumbMigration, setThumbMigration] = useState(null); // null | { status, done, total, error }

  // ─── Photo city selection ───
  const [selectedPhotos, setSelectedPhotos] = useState(new Set());
  const [cityModal, setCityModal] = useState(false);
  const [cityInput, setCityInput] = useState('');

  // ─── Active city sub-album ───
  const [activeCity, setActiveCity] = useState(null); // null | city-string | '__uncategorized__'

  // ─── Facebook import ───
  const [fbModal, setFbModal] = useState(false);
  const [fbStep, setFbStep] = useState('folder'); // 'folder' | 'select' | 'import' | 'done'
  const [fbDirHandle, setFbDirHandle] = useState(null); // posts/ folder handle (for album HTMLs)
  const [fbMediaBase, setFbMediaBase] = useState(null); // handle used as base for media path navigation
  const [fbPathPrefix, setFbPathPrefix] = useState(''); // prefix to strip from media paths before navigating from fbMediaBase
  const [fbTripGroups, setFbTripGroups] = useState([]); // [{tripName, country, albums:[{city,rawTitle,albumHref}]}]
  const [fbRows, setFbRows] = useState([]); // flat: [{id, city, country, rawTitle, albumHref}]
  const [fbAlbumNames, setFbAlbumNames] = useState({}); // {rowId: albumName} — user-editable
  const [fbSelected, setFbSelected] = useState(new Set()); // Set of row ids (albumHref)
  const [fbImportedSet, setFbImportedSet] = useState(new Set()); // "tripName::city" pairs already in Firestore
  const [fbProgress, setFbProgress] = useState({}); // {albumName: {done, total}}
  const [fbTotalDone, setFbTotalDone] = useState(0);
  const [fbFilter, setFbFilter] = useState('');
  const [fbError, setFbError] = useState('');
  const fbCancelRef = useRef(false);
  const fbImportStartRef = useRef(null);
  const pendingCityRef = useRef(null);

  // ─── Auto-set dates from Facebook ───
  const [autoDateModal, setAutoDateModal] = useState(false); // false | 'running' | 'done'
  const [autoDateUpdated, setAutoDateUpdated] = useState(0);
  const [autoDateScanned, setAutoDateScanned] = useState(0);

  // ─── Dark mode effect ───
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  // ─── Auth listener ───
  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      if (u && !u.isAnonymous && !ALLOWED_EMAILS.includes(u.email)) {
        signOut(auth).catch(() => {});
        setUser(null);
        setAuthLoading(false);
        setAccessDenied(true);
        return;
      }
      setAccessDenied(false);
      setUser(u);
      setAuthLoading(false);
      if (u?.email) {
        setDoc(doc(db, 'profiles', u.uid), { email: u.email, displayName: u.displayName || null }, { merge: true })
          .catch(() => {});
      }
    });
  }, []);

  // ─── Load panel label from per-user settings ───
  useEffect(() => {
    if (!user) { setCustomPanelLabel(''); setCustomPanelMiro(''); return; }
    if (isReadOnly) { setCustomPanelLabel(''); setCustomPanelMiro(''); return; }
    getDoc(doc(db, 'users', user.uid, 'profile', 'settings'))
      .then(snap => {
        if (snap.exists()) {
          setCustomPanelLabel(snap.data().panelLabel || '');
          setCustomPanelMiro(snap.data().panelMiro || '');
        }
      })
      .catch(() => {});
  }, [user, isReadOnly]);

  // ─── Public share: check URL on mount ───
  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get('share');
    if (!token) return;
    setPublicShareLoading(true);
    getDoc(doc(db, 'sharedLinks', token))
      .then(snap => setPublicShareData(snap.exists() ? snap.data() : { error: true }))
      .catch(() => setPublicShareData({ error: true }))
      .finally(() => setPublicShareLoading(false));
  }, []);

  useEffect(() => { if (!user && !guestMode) return; loadTrips(); }, [user, guestMode]);
  useEffect(() => { if (!activeTrip || (!user && !guestMode)) { setPhotos([]); return; } loadPhotos(activeTrip); setSelectedPhotos(new Set()); setActiveCity(pendingCityRef.current); pendingCityRef.current = null; }, [activeTrip, user, guestMode]);
  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const delta = currentY - lastScrollYRef.current;

      if (maxScroll > 0 && Math.abs(delta) > 2) {
        setScrollFade(delta > 0 ? 'down' : 'up');
        window.clearTimeout(scrollFadeTimerRef.current);
        scrollFadeTimerRef.current = window.setTimeout(() => setScrollFade(''), 360);
      }

      lastScrollYRef.current = currentY;
    };

    lastScrollYRef.current = window.scrollY;
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.clearTimeout(scrollFadeTimerRef.current);
    };
  }, []);

  // Auto-fix: trips with a broken/missing cover — list Storage files directly and get a real URL
  useEffect(() => {
    if (!user || isReadOnly || trips.length === 0) return;
    // Run for trips with no cover OR whose current cover returns 404 (we re-run on every load to heal broken covers)
    const needsFix = trips.filter(t => (t.photoCount || 0) > 0 && t.ownerId && !t.cover);
    needsFix.forEach(async (trip) => {
      try {
        const folder = ref(storage, `users/${trip.ownerId}/trips/${trip.id}`);
        const listed = await listAll(folder);
        if (listed.items.length === 0) return;
        const cover = await getDownloadURL(listed.items[0]);
        if (cover === trip.cover) return; // already correct
        await updateDoc(doc(db, 'trips', trip.id), { cover });
        setTrips(prev => prev.map(t => t.id === trip.id ? { ...t, cover } : t));
      } catch {}
    });
  }, [trips.length, user, isReadOnly]);

  // ─── Load wishlist from Firestore ───
  useEffect(() => {
    if (!user || isReadOnly) { setWishlist(new Set()); setAppWallpaperUrl(''); return; }
    getDoc(doc(db, 'users', user.uid, 'profile', 'map'))
      .then(snap => {
        if (!snap.exists()) return;
        const data = snap.data();
        setWishlist(new Set(data.wishlist || []));
        setAppWallpaperUrl(data.appWallpaperUrl || '');
      })
      .catch(() => {});
  }, [user, isReadOnly]);

  // ─── Check for data in old user-scoped path ───
  useEffect(() => {
    if (!user || isReadOnly) return;
    getDocs(collection(db, 'users', user.uid, 'trips'))
      .then(snap => { if (!snap.empty) { setMigration('needed'); setMigrationCount(snap.size); } })
      .catch(() => {});
  }, [user, isReadOnly]);

  // ─── Sync lightbox description ───
  useEffect(() => { setLbDesc(lightbox?.description || ''); setLbCoverSet(false); }, [lightbox?.id]);

  // ─── Keyboard nav ───
  useEffect(() => {
    const handler = (e) => {
      if (lightbox) {
        if (e.key === 'Escape') setLightbox(null);
        if (e.key === 'ArrowLeft') navLightbox(-1);
        if (e.key === 'ArrowRight') navLightbox(1);
        return;
      }
      if (publicLightbox && publicShareData?.photos) {
        if (e.key === 'Escape') setPublicLightbox(null);
        if (e.key === 'ArrowLeft' && publicLbIdx > 0) { const n = publicLbIdx - 1; setPublicLbIdx(n); setPublicLightbox(publicShareData.photos[n]); }
        if (e.key === 'ArrowRight' && publicLbIdx < publicShareData.photos.length - 1) { const n = publicLbIdx + 1; setPublicLbIdx(n); setPublicLightbox(publicShareData.photos[n]); }
        return;
      }
      if (e.key === 'Escape') {
        if (shareSuccess) { setShareSuccess(null); }
        else if (manageAccessesModal) { setManageAccessesModal(false); }
        else if (thumbMigration && thumbMigration.status !== 'running' && thumbMigration.status !== 'scanning') { setThumbMigration(null); }
        else if (shareAlbumsModal) { setShareAlbumsModal(false); }
        else if (adminDropdown) { setAdminDropdown(false); }
        else if (editTrip) { setEditTrip(null); }
        else if (editCity) { setEditCity(null); }
        else if (shareModal) { setShareModal(null); }
        else if (confirmDelete) { setConfirmDelete(null); }
        else if (cityModal) { setCityModal(false); }
        else if (fbModal && fbStep !== 'import') { setFbModal(false); }
        else if (activeCity) { setActiveCity(null); }
        else if (activeTrip) { setActiveTrip(null); setStatPanel(null); }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  });

  // ═══════════════════════════════════════
  // AUTH
  // ═══════════════════════════════════════
  const handleGoogleLogin = async () => {
    setLoginError('');
    setGuestMode(false);
    setLoggingIn(true);
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') setLoginError(T.signInFailed);
    }
    setLoggingIn(false);
  };

  const handleGuestLogin = async () => {
    setLoginError('');
    setGuestLoggingIn(true);
    setGuestMode(true);
    setAccessDenied(false);
    setUser(null);
    setGuestLoggingIn(false);
  };

  // ═══════════════════════════════════════
  // GLOBAL SETTINGS
  // ═══════════════════════════════════════
  const savePanelLabel = (label, miro) => {
    if (!user || isReadOnly) return;
    if (panelSaveTimer.current) clearTimeout(panelSaveTimer.current);
    panelSaveTimer.current = setTimeout(() => {
      setDoc(doc(db, 'users', user.uid, 'profile', 'settings'), { panelLabel: label, panelMiro: miro }, { merge: true }).catch(() => {});
    }, 800);
  };

  // ═══════════════════════════════════════
  // TRIPS
  // ═══════════════════════════════════════
  const tripsCol = () => collection(db, 'trips');

  const loadTrips = async () => {
    setLoadingTrips(true);
    try {
      const snaps = isReadOnly
        ? [await getDocs(query(tripsCol(), where('visibility', '==', 'shared')))]
        : await Promise.all([
            getDocs(query(tripsCol(), where('ownerId', '==', user.uid))),
            getDocs(query(tripsCol(), where('visibility', '==', 'shared'))),
            getDocs(query(tripsCol(), where('allowedEmails', 'array-contains', user.email))),
          ]);
      const seen = new Set();
      const merged = [];
      for (const snap of snaps) {
        for (const d of snap.docs) {
          if (!seen.has(d.id)) { seen.add(d.id); merged.push({ id: d.id, ...d.data() }); }
        }
      }
      merged.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setTrips(merged);

      // Fetch public profiles for all foreign trip owners
      const unknownUids = [...new Set(
        merged.map(t => t.ownerId).filter(uid => uid && uid !== user?.uid)
      )];
      if (!isReadOnly && unknownUids.length > 0) {
        const profileSnaps = await Promise.all(unknownUids.map(uid => getDoc(doc(db, 'profiles', uid))));
        const map = {};
        for (const snap of profileSnaps) {
          if (snap.exists()) map[snap.id] = snap.data().email || null;
        }
        setCreatorMap(map);
      }
    } catch (err) { console.error('Load trips error:', err); }
    setLoadingTrips(false);
  };

  const addTrip = async () => {
    if (isReadOnly) return;
    if (!newTripName.trim()) return;
    const tripData = {
      name: newTripName.trim(),
      date: newTripDate || null,
      country: newTripCountry.trim() || null,
      miroUrl: newTripMiro.trim() || null,
      ownerId: user.uid,
      ownerEmail: user.email,
      visibility: newTripVisibility,
      cover: null, photoCount: 0, createdAt: serverTimestamp(),
    };
    const docRef = await addDoc(tripsCol(), tripData);
    setTrips(prev => [{ id: docRef.id, ...tripData }, ...prev]);
    setNewTripName(''); setNewTripDate(''); setNewTripCountry(''); setNewTripMiro(''); setNewTripVisibility('shared'); setShowNewTrip(false);
  };

  const deleteTrip = async (tripId) => {
    if (isReadOnly) return;
    const trip = trips.find(t => t.id === tripId);
    if (trip?.shareToken) { try { await deleteDoc(doc(db, 'sharedLinks', trip.shareToken)); } catch {} }
    const photosSnap = await getDocs(photosCol(tripId));
    for (const photoDoc of photosSnap.docs) {
      const data = photoDoc.data();
      if (data.storagePath) { try { await deleteObject(ref(storage, data.storagePath)); } catch {} }
      await deleteDoc(photoDoc.ref);
    }
    await deleteDoc(doc(db, 'trips', tripId));
    setTrips(prev => prev.filter(t => t.id !== tripId));
    if (activeTrip === tripId) { setActiveTrip(null); setPhotos([]); }
    setConfirmDelete(null);
  };

  // ═══════════════════════════════════════
  // PHOTOS
  // ═══════════════════════════════════════
  const photosCol = (tripId) => collection(db, 'trips', tripId, 'photos');

  const loadPhotos = async (tripId) => {
    setLoadingPhotos(true);
    try {
      const snap = await getDocs(query(photosCol(tripId), orderBy('createdAt', 'asc')));
      let loaded = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      const trip = trips.find(t => t.id === tripId);
      if (trip?.photoOrder?.length) {
        const orderMap = new Map(trip.photoOrder.map((id, i) => [id, i]));
        loaded.sort((a, b) => (orderMap.has(a.id) ? orderMap.get(a.id) : 9999) - (orderMap.has(b.id) ? orderMap.get(b.id) : 9999));
      }
      setPhotos(loaded);
    } catch (err) { console.error('Load photos error:', err); }
    setLoadingPhotos(false);
  };

  const handleFiles = useCallback(async (files) => {
    if (isReadOnly) return;
    if (!activeTrip || !files.length) return;
    const imageFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (!imageFiles.length) return;
    setUploading(true);
    setUploadCount({ done: 0, total: imageFiles.length });
    const newPhotos = [];
    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];
      try {
        const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
        const uploaded = await uploadPhotoVariants(file, `users/${user.uid}/trips/${activeTrip}`, fileName);
        const photoData = { name: file.name, ...uploaded, createdAt: serverTimestamp() };
        const docRef = await addDoc(photosCol(activeTrip), photoData);
        newPhotos.push({ id: docRef.id, ...photoData });
      } catch (err) { console.error('Upload error:', err); }
      setUploadCount(prev => ({ ...prev, done: i + 1 }));
    }
    setPhotos(prev => [...prev, ...newPhotos]);
    const trip = trips.find(t => t.id === activeTrip);
    if (trip) {
      const updates = { photoCount: (trip.photoCount || 0) + newPhotos.length };
      if (!trip.cover && newPhotos.length) updates.cover = newPhotos[0].url;
      await updateDoc(doc(db, 'trips', activeTrip), updates);
      setTrips(prev => prev.map(t => t.id === activeTrip ? { ...t, ...updates } : t));
    }
    setUploading(false);
  }, [activeTrip, user, trips, isReadOnly]);

  const deletePhoto = async (photo) => {
    if (isReadOnly) return;
    if (photo.storagePath) { try { await deleteObject(ref(storage, photo.storagePath)); } catch {} }
    if (photo.thumbStoragePath) { try { await deleteObject(ref(storage, photo.thumbStoragePath)); } catch {} }
    await deleteDoc(doc(db, 'trips', activeTrip, 'photos', photo.id));
    setPhotos(prev => prev.filter(p => p.id !== photo.id));
    const trip = trips.find(t => t.id === activeTrip);
    if (trip) {
      const newCount = Math.max(0, (trip.photoCount || 1) - 1);
      const updates = { photoCount: newCount };
      if (trip.cover === photo.url) updates.cover = null;
      await updateDoc(doc(db, 'trips', activeTrip), updates);
      setTrips(prev => prev.map(t => t.id === activeTrip ? { ...t, ...updates } : t));
    }
    setLightbox(null);
  };

  const savePhotoDesc = async (photoId, desc) => {
    if (isReadOnly) return;
    const photo = photos.find(p => p.id === photoId);
    if (!photo || desc === (photo.description || '')) return;
    try {
      await updateDoc(doc(db, 'trips', activeTrip, 'photos', photoId), { description: desc });
      setPhotos(ps => ps.map(p => p.id === photoId ? { ...p, description: desc } : p));
    } catch (err) { console.error('Save desc error:', err); }
  };

  const setPhotoAsAlbumCover = async (photoUrl) => {
    if (isReadOnly) return;
    if (!activeTrip) return;
    try {
      await updateDoc(doc(db, 'trips', activeTrip), { cover: photoUrl });
      setTrips(prev => prev.map(t => t.id === activeTrip ? { ...t, cover: photoUrl } : t));
    } catch (err) { console.error('Set cover error:', err); }
  };

  const setPhotoAsAppWallpaper = async (photo) => {
    if (!user || isReadOnly) return;
    const wallpaperUrl = photo.thumbUrl || photo.url;
    setAppWallpaperUrl(wallpaperUrl);
    try {
      await setDoc(doc(db, 'users', user.uid, 'profile', 'map'), { appWallpaperUrl: wallpaperUrl }, { merge: true });
    } catch (err) { console.error('Set wallpaper error:', err); }
  };

  const openPhotoContextMenu = (e, photo, options = {}) => {
    if (isReadOnly) return;
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      x: Math.min(e.clientX, window.innerWidth - 220),
      y: Math.min(e.clientY, window.innerHeight - 120),
      photo,
      canSetAlbumCover: !!options.canSetAlbumCover,
      canManagePhoto: !!options.canManagePhoto,
    });
  };

  const saveCityToPhotos = async () => {
    if (isReadOnly) return;
    const city = cityInput.trim() || null;
    for (const photoId of selectedPhotos) {
      await updateDoc(doc(db, 'trips', activeTrip, 'photos', photoId), { city });
    }
    setPhotos(ps => ps.map(p => selectedPhotos.has(p.id) ? { ...p, city } : p));
    setSelectedPhotos(new Set());
    setCityModal(false);
    setCityInput('');
  };

  const groupPhotosByCity = (photoList) => {
    const groups = {};
    const uncategorized = [];
    for (const p of photoList) {
      if (p.city) {
        (groups[p.city] = groups[p.city] || []).push(p);
      } else {
        uncategorized.push(p);
      }
    }
    return { groups, uncategorized, hasCities: Object.keys(groups).length > 0 };
  };

  const togglePhotoSelection = (photoId) => {
    if (isReadOnly) return;
    setSelectedPhotos(prev => {
      const next = new Set(prev);
      next.has(photoId) ? next.delete(photoId) : next.add(photoId);
      return next;
    });
  };

  // ─── Auto-set dates from Facebook ───
  const autoSetDatesFromFb = async () => {
    if (isReadOnly) return;
    setAutoDateModal('running');
    setAutoDateUpdated(0);
    try {
      const rootHandle = await window.showDirectoryPicker({ mode: 'read' });
      const resolved = await resolveFbHandles(rootHandle);
      if (!resolved) { setAutoDateModal(false); return; }
      const { postsHandle } = resolved;

      const albumDirHandle = await postsHandle.getDirectoryHandle('album');
      // tripName → latest timestamp
      const dateMap = {};
      let scanned = 0;
      for await (const [name, handle] of albumDirHandle.entries()) {
        if (handle.kind !== 'file' || !name.endsWith('.html')) continue;
        try {
          const albumDoc = new DOMParser().parseFromString(await (await handle.getFile()).text(), 'text/html');
          const rawTitle = albumDoc.querySelector('h1')?.textContent?.trim()
            || albumDoc.querySelector('h2')?.textContent?.trim()
            || albumDoc.title?.trim()
            || name.replace('.html', '');
          const parsed = parseFbAlbum(rawTitle);
          if (!parsed) continue;
          scanned++;
          const tripName = parsed.trip;
          const updateDateMap = (ts) => {
            if (!dateMap[tripName] || ts > dateMap[tripName]) dateMap[tripName] = ts;
          };
          // Method 1: old Facebook export format (._a6-q class), English or Spanish "Taken" label
          const takenLabels = new Set(['Taken', 'Tomada', 'Tomado', 'Fecha de toma', 'Date taken']);
          albumDoc.querySelectorAll('._a6-q').forEach(el => {
            if (takenLabels.has(el.textContent.trim())) {
              let next = el.nextElementSibling;
              while (next) {
                const dateEl = next.querySelector('._a6-q');
                if (dateEl) {
                  const d = new Date(dateEl.textContent.trim());
                  if (!isNaN(d.getTime())) updateDateMap(d.getTime());
                  break;
                }
                next = next.nextElementSibling;
              }
            }
          });
          // Method 2: <time datetime="..."> elements (newer export formats)
          albumDoc.querySelectorAll('time[datetime]').forEach(el => {
            const d = new Date(el.getAttribute('datetime'));
            if (!isNaN(d.getTime()) && d.getFullYear() > 1990) updateDateMap(d.getTime());
          });
          // Method 3: date strings in English ("January 15, 2015") or Spanish ("15 de enero de 2015")
          if (!dateMap[tripName]) {
            const bodyText = albumDoc.body?.textContent || '';
            const enRe = /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},\s+\d{4}\b/g;
            const esRe = /\b\d{1,2}\s+de\s+(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\s+de\s+\d{4}\b/gi;
            const esMonths = { enero:0,febrero:1,marzo:2,abril:3,mayo:4,junio:5,julio:6,agosto:7,septiembre:8,octubre:9,noviembre:10,diciembre:11 };
            let m;
            while ((m = enRe.exec(bodyText)) !== null) {
              const d = new Date(m[0]);
              if (!isNaN(d.getTime()) && d.getFullYear() > 1990) updateDateMap(d.getTime());
            }
            while ((m = esRe.exec(bodyText)) !== null) {
              const parts = m[0].match(/(\d{1,2})\s+de\s+(\w+)\s+de\s+(\d{4})/i);
              if (parts) {
                const d = new Date(+parts[3], esMonths[parts[2].toLowerCase()], +parts[1]);
                if (!isNaN(d.getTime()) && d.getFullYear() > 1990) updateDateMap(d.getTime());
              }
            }
          }
        } catch {}
      }

      let updated = 0;
      const tripsWithoutDate = trips.filter(t => !t.date && (!t.ownerId || t.ownerId === user.uid));
      await Promise.all(tripsWithoutDate.map(async (trip) => {
        const ts = dateMap[trip.name];
        if (!ts) return;
        const isoDate = new Date(ts).toISOString().split('T')[0];
        try {
          await updateDoc(doc(db, 'trips', trip.id), { date: isoDate });
          setTrips(prev => prev.map(t => t.id === trip.id ? { ...t, date: isoDate } : t));
          updated++;
        } catch {}
      }));

      setAutoDateUpdated(updated);
      setAutoDateScanned(scanned);
      setAutoDateModal('done');
    } catch (err) {
      if (err.name !== 'AbortError') console.error('Auto-date error:', err);
      setAutoDateModal(false);
    }
  };

  // ─── Facebook import ───
  const buildFbTripGroups = async (albumEntries) => {
    const tripMap = {};
    for (const { rawTitle, albumHref, photoCount = 0 } of albumEntries) {
      if (!rawTitle) continue;
      const parsed = parseFbAlbum(rawTitle);
      if (!parsed) continue;
      if (!tripMap[parsed.trip]) {
        tripMap[parsed.trip] = { tripName: parsed.trip, country: parsed.country, albums: [] };
      }
      tripMap[parsed.trip].albums.push({ city: parsed.city, rawTitle, albumHref, photoCount });
    }
    const groups = Object.values(tripMap).sort((a, b) => a.tripName.localeCompare(b.tripName));
    const rows = [];
    const albumNames = {};
    for (const group of groups) {
      // Merge albums that share the same city within this trip (e.g. "Luxor Parte 1/2/3")
      // into a single row, summing photo counts and collecting all albumHrefs for import.
      const cityMap = {};
      for (const album of group.albums) {
        const city = album.city || album.rawTitle;
        if (!cityMap[city]) {
          cityMap[city] = {
            id: album.albumHref,
            city,
            country: group.country,
            rawTitle: album.rawTitle,
            albumHref: album.albumHref,
            albumHrefs: [],
            rawTitles: [],
            photoCount: 0,
          };
        }
        cityMap[city].photoCount += album.photoCount || 0;
        cityMap[city].albumHrefs.push(album.albumHref);
        cityMap[city].rawTitles.push(album.rawTitle);
      }
      for (const mergedRow of Object.values(cityMap)) {
        rows.push(mergedRow);
        albumNames[mergedRow.id] = group.tripName;
      }
    }

    // Collect all city names present in the local albums
    const allLocalCities = new Set(rows.map(r => r.city).filter(Boolean));

    // Also build album name set for fallback (trips without cities field yet)
    const neededAlbumNames = new Set(Object.values(albumNames));

    // Find Firebase trips to query:
    // Primary: trips whose stored `cities` array overlaps with our local cities
    //   (catches cases where Facebook album "Amsterdam 2004" was imported as city
    //    "Amsterdam" inside a differently-named trip like "Holland 2004")
    // Fallback: trips whose name matches a local album name but lack a `cities` field yet
    const tripsWithCities = trips.filter(t =>
      t.cities && t.cities.some(c => allLocalCities.has(c))
    );
    const tripsFallback = trips.filter(t =>
      !t.cities && neededAlbumNames.has(t.name)
    );
    const tripsToCheck = [...new Map(
      [...tripsWithCities, ...tripsFallback].map(t => [t.id, t])
    ).values()];

    // An album is considered already imported if the same city + photo count exists in Firebase.
    const importedSet = new Set();
    await Promise.all(tripsToCheck.map(async (trip) => {
      try {
        const snap = await getDocs(photosCol(trip.id));
        const cityCountMap = {};
        for (const d of snap.docs) {
          const city = d.data().city;
          if (city) cityCountMap[city] = (cityCountMap[city] || 0) + 1;
        }
        const cities = Object.keys(cityCountMap);
        if (cities.length > 0 && !trip.cities) {
          await updateDoc(doc(db, 'trips', trip.id), { cities });
          setTrips(prev => prev.map(t => t.id === trip.id ? { ...t, cities } : t));
        }
        for (const [city, count] of Object.entries(cityCountMap)) {
          importedSet.add(`${city}::${count}`);
        }
      } catch {}
    }));

    const availableIds = rows
      .filter(r => r.city === null || !importedSet.has(`${r.city}::${r.photoCount}`))
      .map(r => r.id);

    setFbTripGroups(groups);
    setFbRows(rows);
    setFbAlbumNames(albumNames);
    setFbImportedSet(importedSet);
    setFbSelected(new Set(availableIds));
    setFbStep('select');
  };

  // Resolve the handles needed for a folder the user selected.
  // Returns { postsHandle, mediaBase, pathPrefix } or null on failure.
  const resolveFbHandles = async (rootHandle) => {
    const name = rootHandle.name;

    // Case A: user selected the PARENT of the export root (e.g. Downloads/)
    // Structure: rootHandle/your_facebook_activity/posts/album/
    // Media paths in HTML: "your_facebook_activity/posts/media/..." → navigate from rootHandle, no stripping
    try {
      const yfaHandle = await rootHandle.getDirectoryHandle('your_facebook_activity');
      const ph = await yfaHandle.getDirectoryHandle('posts');
      await ph.getDirectoryHandle('album');
      console.log('[FB] Case A: root is parent of export folder');
      return { postsHandle: ph, mediaBase: rootHandle, pathPrefix: '' };
    } catch {}

    // Case B: user selected your_facebook_activity itself
    // Structure: rootHandle/posts/album/
    // Media paths: "your_facebook_activity/posts/media/..." → strip "name/posts/", navigate from rootHandle
    try {
      const ph = await rootHandle.getDirectoryHandle('posts');
      await ph.getDirectoryHandle('album');
      console.log('[FB] Case B: root is your_facebook_activity, prefix:', `${name}/posts/`);
      return { postsHandle: ph, mediaBase: rootHandle, pathPrefix: `${name}/posts/` };
    } catch {}

    // Case C: user selected posts/ itself
    // Structure: rootHandle/album/
    // Media paths: "your_facebook_activity/posts/media/..." → strip "your_facebook_activity/posts/", navigate from rootHandle
    try {
      await rootHandle.getDirectoryHandle('album');
      console.log('[FB] Case C: root is posts/, prefix: your_facebook_activity/posts/');
      return { postsHandle: rootHandle, mediaBase: rootHandle, pathPrefix: 'your_facebook_activity/posts/' };
    } catch {}

    return null;
  };

  const scanFbFolder = async () => {
    if (isReadOnly) return;
    try {
      const rootHandle = await window.showDirectoryPicker({ mode: 'read' });
      setFbError('');

      const resolved = await resolveFbHandles(rootHandle);
      if (!resolved) {
        setFbError('Could not find "album" subfolder. Try selecting the "your_facebook_activity" folder or the folder that contains it.');
        return;
      }
      const { postsHandle, mediaBase, pathPrefix } = resolved;

      const albumDirHandle = await postsHandle.getDirectoryHandle('album');
      const entries = [];
      for await (const [name, handle] of albumDirHandle.entries()) {
        if (handle.kind !== 'file' || !name.endsWith('.html')) continue;
        try {
          const text = await (await handle.getFile()).text();
          const albumDoc = new DOMParser().parseFromString(text, 'text/html');
          const rawTitle = albumDoc.querySelector('h1')?.textContent?.trim()
            || albumDoc.querySelector('h2')?.textContent?.trim()
            || albumDoc.title?.trim()
            || name.replace('.html', '');
          const seenPaths = new Set();
          const countPhoto = (raw) => {
            if (!raw) return;
            const clean = raw.split('?')[0].split('#')[0];
            if (!/\.(jpg|jpeg|png|gif|webp|bmp|tiff?)$/i.test(clean)) return;
            const resolved = clean.replace(/^(?:\.\.\/)+/, '').replace(/^\//, '');
            if (resolved) seenPaths.add(resolved);
          };
          albumDoc.querySelectorAll('[src]').forEach(el => countPhoto(el.getAttribute('src')));
          albumDoc.querySelectorAll('a[href]').forEach(el => countPhoto(el.getAttribute('href')));
          entries.push({ rawTitle, albumHref: `album/${name}`, photoCount: seenPaths.size });
        } catch {}
      }

      if (entries.length === 0) { setFbError('No album HTML files found in posts/album/.'); return; }

      setFbDirHandle(postsHandle);
      setFbMediaBase(mediaBase);
      setFbPathPrefix(pathPrefix);
      await buildFbTripGroups(entries);
    } catch (err) {
      if (err.name === 'AbortError') return;
      setFbError(`Error: ${err.message}`);
    }
  };

  const handleFbImportClick = async () => {
    if (isReadOnly) return;
    if (fbDirHandle) { startFbImport(fbDirHandle, fbMediaBase, fbPathPrefix); return; }
    try {
      const rootHandle = await window.showDirectoryPicker({ mode: 'read' });
      const resolved = await resolveFbHandles(rootHandle);
      if (!resolved) { setFbError('Could not find the posts/album folder. Select your_facebook_activity or its parent folder.'); return; }
      const { postsHandle, mediaBase, pathPrefix } = resolved;
      setFbDirHandle(postsHandle);
      setFbMediaBase(mediaBase);
      setFbPathPrefix(pathPrefix);
      startFbImport(postsHandle, mediaBase, pathPrefix);
    } catch (err) {
      if (err.name !== 'AbortError') setFbError(`Folder error: ${err.message}`);
    }
  };

  const startFbImport = async (postsHandle, mediaBase, pathPrefix) => {
    if (isReadOnly) return;
    fbCancelRef.current = false;
    setFbStep('import');
    setFbTotalDone(0);

    // Build import groups from row-level selection + user-edited album names.
    // Each row may represent multiple source albums (e.g. "Luxor Parte 1/2/3" merged into one row).
    const selectedRows = fbRows.filter(r => fbSelected.has(r.id));
    const albumGroupMap = {};
    for (const row of selectedRows) {
      const albumName = (fbAlbumNames[row.id] || row.rawTitle).trim();
      if (!albumGroupMap[albumName]) albumGroupMap[albumName] = { tripName: albumName, country: row.country, albums: [] };
      const hrefs = row.albumHrefs || [row.albumHref];
      const rawTitles = row.rawTitles || [row.rawTitle];
      hrefs.forEach((href, i) => {
        albumGroupMap[albumName].albums.push({ city: row.city, rawTitle: rawTitles[i] || row.rawTitle, albumHref: href });
      });
    }
    const toImport = Object.values(albumGroupMap);

    // ── Phase 1: Scan all album HTMLs to collect photo paths (so total is known for ETA) ──
    const initialProgress = {};
    for (const g of toImport) initialProgress[g.tripName] = { done: 0, total: 0, scanning: true };
    setFbProgress(initialProgress);

    const groupPaths = {}; // tripName → [{city, path}]
    const groupLatestDate = {}; // tripName → ISO date string (most recent Taken date)
    for (const { tripName, albums } of toImport) {
      const allPaths = [];
      let latestTs = null;
      for (const album of albums) {
        try {
          const parts = album.albumHref.split('/');
          let dh = postsHandle;
          for (let i = 0; i < parts.length - 1; i++) dh = await dh.getDirectoryHandle(parts[i]);
          const fh = await dh.getFileHandle(parts[parts.length - 1]);
          const albumDoc = new DOMParser().parseFromString(await (await fh.getFile()).text(), 'text/html');
          const seen = new Set();
          const addPath = (raw) => {
            if (!raw) return;
            const clean = raw.split('?')[0].split('#')[0];
            if (!/\.(jpg|jpeg|png|gif|webp|bmp|tiff?)$/i.test(clean)) return;
            const resolved = clean.replace(/^(?:\.\.\/)+/, '').replace(/^\//, '');
            if (resolved && !seen.has(resolved)) { seen.add(resolved); allPaths.push({ city: album.city, path: resolved }); }
          };
          albumDoc.querySelectorAll('[src]').forEach(el => addPath(el.getAttribute('src')));
          albumDoc.querySelectorAll('a[href]').forEach(el => addPath(el.getAttribute('href')));
          // Extract most recent "Taken" date from this album
          albumDoc.querySelectorAll('._a6-q').forEach(el => {
            if (el.textContent.trim() === 'Taken') {
              let next = el.nextElementSibling;
              while (next) {
                const dateEl = next.querySelector('._a6-q');
                if (dateEl) {
                  const d = new Date(dateEl.textContent.trim());
                  if (!isNaN(d.getTime()) && (latestTs === null || d.getTime() > latestTs)) latestTs = d.getTime();
                  break;
                }
                next = next.nextElementSibling;
              }
            }
          });
        } catch (err) { console.warn('Could not read album:', album.rawTitle, err); }
      }
      groupPaths[tripName] = allPaths;
      if (latestTs !== null) groupLatestDate[tripName] = new Date(latestTs).toISOString().split('T')[0];
      setFbProgress(prev => ({ ...prev, [tripName]: { done: 0, total: allPaths.length, scanning: false } }));
    }

    // ── Phase 2: Upload all photos with ETA tracking ──
    fbImportStartRef.current = Date.now();
    let totalUploaded = 0;

    for (const { tripName, country, albums } of toImport) {
      if (fbCancelRef.current) break;

      // Find or create Firestore trip
      let tripId;
      const autoDate = groupLatestDate[tripName] || null;
      const existing = trips.find(t => t.name === tripName);
      if (existing) {
        tripId = existing.id;
        if (autoDate && !existing.date) {
          try {
            await updateDoc(doc(db, 'trips', tripId), { date: autoDate });
            setTrips(prev => prev.map(t => t.id === tripId ? { ...t, date: autoDate } : t));
          } catch {}
        }
      } else {
        const tripData = {
          name: tripName, date: autoDate, country: country || null, miroUrl: null,
          ownerId: user.uid, ownerEmail: user.email, visibility: 'private', cover: null, photoCount: 0, createdAt: serverTimestamp(),
        };
        const docRef = await addDoc(tripsCol(), tripData);
        tripId = docRef.id;
        setTrips(prev => [{ id: docRef.id, ...tripData }, ...prev]);
      }

      const allPaths = groupPaths[tripName] || [];
      let doneCount = 0;
      let coverUrl = null;

      for (const { city, path } of allPaths) {
        if (fbCancelRef.current) break;
        try {
          const navPath = (pathPrefix && path.startsWith(pathPrefix)) ? path.slice(pathPrefix.length) : path;
          const pathParts = navPath.split('/');
          let handle = mediaBase;
          for (let i = 0; i < pathParts.length - 1; i++) handle = await handle.getDirectoryHandle(pathParts[i]);
          const fileHandle = await handle.getFileHandle(pathParts[pathParts.length - 1]);
          const file = await fileHandle.getFile();

          const safeName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
          const uploaded = await uploadPhotoVariants(file, `users/${user.uid}/trips/${tripId}`, safeName);
          const { url } = uploaded;
          if (!coverUrl) coverUrl = url;

          await addDoc(photosCol(tripId), { name: file.name, ...uploaded, city: city || null, createdAt: serverTimestamp() });
          doneCount++;
          totalUploaded++;
        } catch (err) {
          console.warn('Upload failed:', path, err);
          doneCount++;
        }
        setFbProgress(prev => ({ ...prev, [tripName]: { done: doneCount, total: allPaths.length, scanning: false } }));
        setFbTotalDone(totalUploaded);
      }

      if (doneCount > 0) {
        const newCities = [...new Set(albums.map(a => a.city).filter(Boolean))];
        const existingCities = trips.find(t => t.id === tripId)?.cities || [];
        const mergedCities = [...new Set([...existingCities, ...newCities])];
        const updates = { photoCount: doneCount, cities: mergedCities, ...(coverUrl ? { cover: coverUrl } : {}) };
        try {
          await updateDoc(doc(db, 'trips', tripId), updates);
          setTrips(prev => prev.map(t => t.id === tripId ? { ...t, ...updates } : t));
        } catch {}
      }
    }

    setFbStep('done');
  };

  // ─── Photo reorder ───
  const reorderPhotos = async (dropIdx) => {
    if (isReadOnly) return;
    const dragIdx = draggingIdx.current;
    if (dragIdx === null || dragIdx === dropIdx) return;
    draggingIdx.current = null;
    const newPhotos = [...photos];
    const [moved] = newPhotos.splice(dragIdx, 1);
    newPhotos.splice(dropIdx, 0, moved);
    setPhotos(newPhotos);
    const newOrder = newPhotos.map(p => p.id);
    try {
      await updateDoc(doc(db, 'trips', activeTrip), { photoOrder: newOrder });
      setTrips(prev => prev.map(t => t.id === activeTrip ? { ...t, photoOrder: newOrder } : t));
    } catch (err) { console.error('Reorder error:', err); }
  };

  const displayPhotos = activeCity === null ? photos
    : activeCity === '__uncategorized__' ? photos.filter(p => !p.city)
    : photos.filter(p => p.city === activeCity);
  const lbIndex = lightbox ? displayPhotos.findIndex(p => p.id === lightbox.id) : -1;
  const navLightbox = (dir) => { const next = lbIndex + dir; if (next >= 0 && next < displayPhotos.length) setLightbox(displayPhotos[next]); };

  // ─── File drag & drop (grid background) ───
  const onDragOver = (e) => { e.preventDefault(); if (draggingIdx.current === null) setDragging(true); };
  const onDragLeave = () => setDragging(false);
  const onDrop = (e) => {
    e.preventDefault(); setDragging(false);
    if (isReadOnly) return;
    if (draggingIdx.current !== null) return;
    handleFiles(e.dataTransfer.files);
  };

  // ═══════════════════════════════════════
  // EDIT TRIP
  // ═══════════════════════════════════════
  const openEditTrip = (trip) => {
    if (isReadOnly) return;
    setEditTrip(trip);
    setEditName(trip.name);
    setEditDate(trip.date || '');
    setEditCountry(trip.country || '');
    setEditMiro(trip.miroUrl || '');
    setEditVisibility(trip.visibility || 'shared');
  };

  const saveEditTrip = async () => {
    if (isReadOnly) return;
    if (!editName.trim() || !editTrip) return;
    setEditSaving(true);
    const updates = {
      name: editName.trim(),
      date: editDate || null,
      country: editCountry.trim() || null,
      miroUrl: editMiro.trim() || null,
      visibility: editVisibility,
    };
    try {
      await updateDoc(doc(db, 'trips', editTrip.id), updates);
      setTrips(prev => prev.map(t => t.id === editTrip.id ? { ...t, ...updates } : t));
      setEditTrip(null);
    } catch (err) { console.error('Edit trip error:', err); }
    setEditSaving(false);
  };

  // ═══════════════════════════════════════
  // EDIT CITY SUB-ALBUM
  // ═══════════════════════════════════════
  const openEditCity = (cityName) => {
    if (isReadOnly) return;
    const tripData = trips.find(t => t.id === activeTrip);
    const vis = tripData?.cityMetadata?.[cityName]?.visibility || tripData?.visibility || 'shared';
    setEditCity({ tripId: activeTrip, cityName });
    setEditCityName(cityName);
    setEditCityVisibility(vis);
  };

  const saveEditCity = async () => {
    if (isReadOnly) return;
    if (!editCityName.trim() || !editCity) return;
    setEditCitySaving(true);
    const { tripId, cityName } = editCity;
    const newName = editCityName.trim();
    const tripData = trips.find(t => t.id === tripId);
    try {
      const existingMeta = tripData?.cityMetadata || {};
      const newMeta = { ...existingMeta };
      if (cityName !== newName) delete newMeta[cityName];
      newMeta[newName] = { ...(newMeta[newName] || {}), visibility: editCityVisibility };

      const existingCities = tripData?.cities || [];
      const newCities = existingCities.map(c => c === cityName ? newName : c);
      if (!newCities.includes(newName)) newCities.push(newName);

      if (cityName !== newName) {
        const snap = await getDocs(photosCol(tripId));
        const batch = writeBatch(db);
        for (const d of snap.docs) {
          if (d.data().city === cityName) batch.update(d.ref, { city: newName });
        }
        await batch.commit();
        setPhotos(prev => prev.map(p => p.city === cityName ? { ...p, city: newName } : p));
      }

      await updateDoc(doc(db, 'trips', tripId), { cities: newCities, cityMetadata: newMeta });
      setTrips(prev => prev.map(t => t.id === tripId ? { ...t, cities: newCities, cityMetadata: newMeta } : t));
      if (activeCity === cityName) setActiveCity(newName);
      setEditCity(null);
    } catch (err) { console.error('Edit city error:', err); }
    setEditCitySaving(false);
  };

  // ═══════════════════════════════════════
  // SHARE
  // ═══════════════════════════════════════
  const generateShareLink = async (trip) => {
    if (isReadOnly) return;
    if (trip.shareToken) { setShareModal({ tripId: trip.id, url: `${window.location.origin}/?share=${trip.shareToken}` }); return; }
    setShareGenerating(trip.id);
    try {
      const snap = await getDocs(query(photosCol(trip.id), orderBy('createdAt', 'asc')));
      const photosData = snap.docs.map(d => ({ url: d.data().url, name: d.data().name }));
      const token = crypto.randomUUID();
      await setDoc(doc(db, 'sharedLinks', token), { tripName: trip.name, tripDate: trip.date || null, photos: photosData, createdAt: serverTimestamp() });
      await updateDoc(doc(db, 'trips', trip.id), { shareToken: token });
      setTrips(prev => prev.map(t => t.id === trip.id ? { ...t, shareToken: token } : t));
      setShareModal({ tripId: trip.id, url: `${window.location.origin}/?share=${token}` });
    } catch (err) { console.error('Share error:', err); }
    setShareGenerating(null);
  };

  const revokeShareLink = async (tripId, shareToken) => {
    if (isReadOnly) return;
    try {
      await deleteDoc(doc(db, 'sharedLinks', shareToken));
      await updateDoc(doc(db, 'trips', tripId), { shareToken: null });
      setTrips(prev => prev.map(t => t.id === tripId ? { ...t, shareToken: null } : t));
      setShareModal(null);
    } catch (err) { console.error('Revoke error:', err); }
  };

  // ═══════════════════════════════════════
  // WISHLIST
  // ═══════════════════════════════════════
  const toggleWishlist = async (iso) => {
    if (isReadOnly) return;
    const next = new Set(wishlist);
    if (next.has(iso)) next.delete(iso); else next.add(iso);
    setWishlist(next);
    try {
      await setDoc(doc(db, 'users', user.uid, 'profile', 'map'), { wishlist: [...next] }, { merge: true });
    } catch (err) { console.error('Wishlist error:', err); }
  };

  // ═══════════════════════════════════════
  // MIGRATION
  // ═══════════════════════════════════════
  const runMigration = async () => {
    if (isReadOnly) return;
    setMigration('running');
    setMigrationError('');
    try {
      const oldTripsSnap = await getDocs(collection(db, 'users', user.uid, 'trips'));
      for (const oldTripDoc of oldTripsSnap.docs) {
        const tripId = oldTripDoc.id;
        await setDoc(doc(db, 'trips', tripId), { ...oldTripDoc.data(), ownerId: user.uid, visibility: 'shared' });
        const oldPhotosSnap = await getDocs(collection(db, 'users', user.uid, 'trips', tripId, 'photos'));
        for (const oldPhotoDoc of oldPhotosSnap.docs) {
          await setDoc(doc(db, 'trips', tripId, 'photos', oldPhotoDoc.id), oldPhotoDoc.data());
        }
        for (const oldPhotoDoc of oldPhotosSnap.docs) await deleteDoc(oldPhotoDoc.ref);
        await deleteDoc(oldTripDoc.ref);
      }
      setMigration('done');
      loadTrips();
    } catch (err) {
      console.error('Migration error:', err);
      setMigrationError(err.message || String(err));
      setMigration('error');
    }
  };

  const getThumbStoragePath = (trip, photo) => {
    if (photo.storagePath && photo.storagePath.startsWith(`users/${user.uid}/`)) {
      const parts = photo.storagePath.split('/');
      const fileName = parts.pop();
      return `${parts.join('/')}/thumbs/${fileName}`;
    }
    return `users/${user.uid}/thumb-migrations/${trip.id}/${photo.id}.jpg`;
  };

  const findLocalMediaRoot = async (rootHandle) => {
    try {
      const yfa = await rootHandle.getDirectoryHandle('your_facebook_activity');
      const posts = await yfa.getDirectoryHandle('posts');
      return await posts.getDirectoryHandle('media');
    } catch {}
    try {
      const posts = await rootHandle.getDirectoryHandle('posts');
      return await posts.getDirectoryHandle('media');
    } catch {}
    try {
      return await rootHandle.getDirectoryHandle('media');
    } catch {}
    return rootHandle;
  };

  const indexLocalImagesByName = async (rootHandle) => {
    const mediaRoot = await findLocalMediaRoot(rootHandle);
    const index = new Map();
    const imageExt = /\.(jpe?g|png|webp|gif|bmp|heic|heif)$/i;

    const walk = async (dirHandle) => {
      for await (const [, handle] of dirHandle.entries()) {
        if (handle.kind === 'directory') {
          await walk(handle);
        } else if (imageExt.test(handle.name)) {
          const key = handle.name.toLowerCase();
          const list = index.get(key) || [];
          list.push(handle);
          index.set(key, list);
        }
      }
    };

    await walk(mediaRoot);
    return index;
  };

  const runThumbnailMigration = async () => {
    if (!user || isReadOnly) return;
    setAdminDropdown(false);
    setThumbMigration({ status: 'scanning', done: 0, total: 0, error: '' });
    try {
      const rootHandle = await window.showDirectoryPicker({ mode: 'read' });
      const localImages = await indexLocalImagesByName(rootHandle);
      const jobs = [];
      let missing = 0;
      for (const trip of trips) {
        const snap = await getDocs(photosCol(trip.id));
        snap.docs.forEach(photoDoc => {
          const photo = { id: photoDoc.id, ...photoDoc.data() };
          if (photo.thumbUrl) return;
          const localMatches = localImages.get((photo.name || '').toLowerCase());
          const fileHandle = localMatches?.shift();
          if (fileHandle) jobs.push({ trip, photoDoc, photo, fileHandle });
          else missing++;
        });
      }

      if (jobs.length === 0) {
        setThumbMigration({ status: 'done', done: 0, total: 0, error: missing ? T.thumbMigrationMissing(missing) : '' });
        return;
      }

      const startedAt = Date.now();
      setThumbMigration({ status: 'running', done: 0, total: jobs.length, error: missing ? T.thumbMigrationMissing(missing) : '', startedAt, etaMs: null, ratePerMin: 0 });
      let failed = 0;
      let done = 0;
      let nextJob = 0;
      const concurrency = Math.min(12, Math.max(4, navigator.hardwareConcurrency || 6));
      const reportProgress = () => {
        setThumbMigration({
          status: 'running',
          done,
          total: jobs.length,
          error: [
            missing ? T.thumbMigrationMissing(missing) : '',
            failed ? `${failed} ${failed === 1 ? 'photo failed' : 'photos failed'}` : '',
          ].filter(Boolean).join(' · '),
          startedAt,
          etaMs: done > 0 ? ((Date.now() - startedAt) / done) * (jobs.length - done) : null,
          ratePerMin: done > 0 ? Math.round(done / Math.max((Date.now() - startedAt) / 60000, 1 / 60)) : 0,
        });
      };

      const processJob = async ({ trip, photoDoc, photo, fileHandle }) => {
        try {
          const sourceBlob = await fileHandle.getFile();
          const thumbBlob = await compressImage(sourceBlob, 420, 0.68);
          const thumbStoragePath = getThumbStoragePath(trip, photo);
          const thumbStorageRef = ref(storage, thumbStoragePath);
          await uploadBytes(thumbStorageRef, thumbBlob);
          const thumbUrl = await getDownloadURL(thumbStorageRef);
          await updateDoc(photoDoc.ref, { thumbUrl, thumbStoragePath });
          if (activeTrip === trip.id) {
            setPhotos(prev => prev.map(p => p.id === photo.id ? { ...p, thumbUrl, thumbStoragePath } : p));
          }
        } catch (err) {
          failed++;
          console.warn('Thumbnail migration failed:', photo.id, err);
        }
        done++;
        reportProgress();
      };

      const worker = async () => {
        while (nextJob < jobs.length) {
          const job = jobs[nextJob++];
          await processJob(job);
        }
      };

      await Promise.all(Array.from({ length: concurrency }, worker));
      setThumbMigration({
        status: 'done',
        done: jobs.length - failed,
        total: jobs.length,
        error: [
          missing ? T.thumbMigrationMissing(missing) : '',
          failed ? `${failed} ${failed === 1 ? 'photo failed' : 'photos failed'}` : '',
        ].filter(Boolean).join(' · '),
        startedAt,
        etaMs: 0,
        ratePerMin: Math.round(jobs.length / Math.max((Date.now() - startedAt) / 60000, 1 / 60)),
      });
    } catch (err) {
      console.error('Thumbnail migration error:', err);
      setThumbMigration({ status: 'error', done: 0, total: 0, error: err.message || String(err) });
    }
  };

  // ═══════════════════════════════════════
  // ALBUM SHARING
  // ═══════════════════════════════════════
  const shareAlbums = async (emails) => {
    if (isReadOnly) return;
    if (!emails.length || !selectedTrips.size) return;
    setSharingAlbums(true);
    try {
      const tripIds = [...selectedTrips];
      const tripNames = {};
      tripIds.forEach(id => {
        const trip = trips.find(t => t.id === id);
        if (trip) tripNames[id] = trip.name;
      });

      await addDoc(collection(db, 'albumShares'), {
        tripIds,
        tripNames,
        emails,
        createdAt: serverTimestamp(),
        createdBy: user.email,
      });

      const batch = writeBatch(db);
      for (const tripId of tripIds) {
        const trip = trips.find(t => t.id === tripId);
        const existing = trip?.allowedEmails || [];
        const updated = [...new Set([...existing, ...emails])];
        batch.update(doc(db, 'trips', tripId), { allowedEmails: updated });
      }
      await batch.commit();

      setTrips(prev => prev.map(t => {
        if (!selectedTrips.has(t.id)) return t;
        const existing = t.allowedEmails || [];
        return { ...t, allowedEmails: [...new Set([...existing, ...emails])] };
      }));

      const tripList = tripIds.map(id => {
        const trip = trips.find(t => t.id === id);
        return `• ${trip?.name || id}${trip?.date ? ` (${trip.date})` : ''}`;
      }).join('\n');
      const appUrl = window.location.origin;
      const subject = encodeURIComponent('Album access granted — Pepini per il mondo');
      const body = encodeURIComponent(
        `Hola!\n\nSe te ha dado acceso a los siguientes álbumes de viaje:\n\n${tripList}\n\nHaz clic aquí para acceder:\n${appUrl}\n\nInicia sesión con tu cuenta de Google usando esta dirección de email para ver los álbumes.\n\n¡Bon voyage!\n— Pepini per il mondo`
      );
      window.location.href = `mailto:${emails.join(',')}?subject=${subject}&body=${body}`;

      const sharedTripNames = tripIds.map(id => trips.find(t => t.id === id)?.name).filter(Boolean);
      setSelectedTrips(new Set());
      setShareAlbumsModal(false);
      setShareEmailsInput('');
      setShareSuccess({ emails, tripNames: sharedTripNames });
    } catch (err) {
      console.error('Error sharing albums:', err);
    }
    setSharingAlbums(false);
  };

  const loadAlbumShares = async () => {
    if (isReadOnly) return;
    setLoadingShares(true);
    try {
      const snap = await getDocs(collection(db, 'albumShares'));
      const shares = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      shares.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setAlbumShares(shares);
    } catch (err) {
      console.error('Error loading album shares:', err);
    }
    setLoadingShares(false);
  };

  const revokeAlbumAccess = async (shareId, tripIds, email) => {
    if (isReadOnly) return;
    try {
      const batch = writeBatch(db);
      for (const tripId of tripIds) {
        const trip = trips.find(t => t.id === tripId);
        const existing = trip?.allowedEmails || [];
        batch.update(doc(db, 'trips', tripId), { allowedEmails: existing.filter(e => e !== email) });
      }
      const share = albumShares.find(s => s.id === shareId);
      if (share) {
        const updatedEmails = (share.emails || []).filter(e => e !== email);
        if (updatedEmails.length === 0) {
          batch.delete(doc(db, 'albumShares', shareId));
        } else {
          batch.update(doc(db, 'albumShares', shareId), { emails: updatedEmails });
        }
      }
      await batch.commit();

      setTrips(prev => prev.map(t => {
        if (!tripIds.includes(t.id)) return t;
        return { ...t, allowedEmails: (t.allowedEmails || []).filter(e => e !== email) };
      }));
      setAlbumShares(prev =>
        prev.map(s => {
          if (s.id !== shareId) return s;
          const updatedEmails = (s.emails || []).filter(e => e !== email);
          return updatedEmails.length === 0 ? null : { ...s, emails: updatedEmails };
        }).filter(Boolean)
      );
    } catch (err) {
      console.error('Error revoking access:', err);
    }
  };

  // ═══════════════════════════════════════
  // STATS
  // ═══════════════════════════════════════
  const sortedTrips = useMemo(() => {
    const tripTime = (trip) => {
      if (trip.date) {
        const parsed = Date.parse(trip.date);
        if (!Number.isNaN(parsed)) return parsed;
      }
      return trip.createdAt?.seconds ? trip.createdAt.seconds * 1000 : 0;
    };

    const nameCompare = (a, b) => (a.name || '').localeCompare(b.name || '', undefined, {
      sensitivity: 'base',
      numeric: true,
    });

    if (tripSort === 'date') {
      return [...trips].sort((a, b) => {
        const byDate = tripTime(b) - tripTime(a);
        return byDate || nameCompare(a, b);
      });
    }

    if (tripSort === 'az') {
      return [...trips].sort((a, b) => nameCompare(a, b));
    }

    return trips;
  }, [trips, tripSort]);

  const totalPhotos = trips.reduce((s, t) => s + (t.photoCount || 0), 0);
  const countriesVisited = new Set(trips.map(t => t.country).filter(Boolean)).size;
  const topTrip = trips.reduce((best, t) => (!best || (t.photoCount || 0) > (best.photoCount || 0)) ? t : best, null);

  // ─── Map: visited ISO set + lookup ───
  const visitedIsos = new Set(trips.map(t => COUNTRY_ISO[t.country]).filter(Boolean));
  const tripByIso = {};
  trips.forEach(t => { const iso = COUNTRY_ISO[t.country]; if (iso && !tripByIso[iso]) tripByIso[iso] = t; });
  const hasMapData = trips.some(t => COUNTRY_ISO[t.country]);

  // ─── Stat panel helpers ───
  const toggleContinent = (continent) => setExpandedContinents(prev => {
    const n = new Set(prev);
    n.has(continent) ? n.delete(continent) : n.add(continent);
    return n;
  });

  const toggleCountry = (country) => setExpandedCountries(prev => {
    const n = new Set(prev);
    n.has(country) ? n.delete(country) : n.add(country);
    return n;
  });

  const renderStatPanel = () => {
    if (!statPanel) return null;
    if (statPanel === 'trips') {
      const allSelected = sortedTrips.length > 0 && sortedTrips.every(t => selectedTrips.has(t.id));
      const someSelected = selectedTrips.size > 0 && !allSelected;
      return (
        <div className="stat-panel fade-in">
          <div className="stat-panel-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {!isReadOnly && (
                <input
                  type="checkbox"
                  className="trip-select-check"
                  checked={allSelected}
                  ref={el => { if (el) el.indeterminate = someSelected; }}
                  onChange={() => {
                    if (allSelected || someSelected) setSelectedTrips(new Set());
                    else setSelectedTrips(new Set(sortedTrips.map(t => t.id)));
                  }}
                  title={T.selectAll}
                />
              )}
              <span>{T.allTrips}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {!isReadOnly && selectedTrips.size > 0 && (
                <button className="btn btn-accent btn-sm" onClick={() => setShareAlbumsModal(true)}>
                  {T.shareAlbumsBtn(selectedTrips.size)}
                </button>
              )}
              <button className="stat-panel-close" onClick={() => { setStatPanel(null); setSelectedTrips(new Set()); }}>✕</button>
            </div>
          </div>
          <div className="stat-panel-body">
            {sortedTrips.map(trip => (
              <div
                key={trip.id}
                className={`stat-panel-row${selectedTrips.has(trip.id) ? ' stat-panel-row-selected' : ''}`}
                onClick={() => { setActiveTrip(trip.id); setStatPanel(null); setSelectedTrips(new Set()); }}
              >
                {!isReadOnly && (
                  <input
                    type="checkbox"
                    className="trip-select-check"
                    checked={selectedTrips.has(trip.id)}
                    onChange={e => {
                      e.stopPropagation();
                      setSelectedTrips(prev => {
                        const next = new Set(prev);
                        next.has(trip.id) ? next.delete(trip.id) : next.add(trip.id);
                        return next;
                      });
                    }}
                    onClick={e => e.stopPropagation()}
                  />
                )}
                <span className="stat-panel-name">{trip.name}</span>
                {trip.date && <span className="stat-panel-meta">{trip.date}</span>}
              </div>
            ))}
          </div>
        </div>
      );
    }
    const countryNames = statPanel === 'countries'
      ? [...new Set(trips.map(t => t.country).filter(Boolean))]
      : [...wishlist].map(iso => ISO_COUNTRY[iso]).filter(Boolean);
    const byContinent = {};
    countryNames.forEach(name => {
      const c = COUNTRY_CONTINENT[name] || 'Other';
      (byContinent[c] = byContinent[c] || []).push(name);
    });
    return (
      <div className="stat-panel fade-in">
        <div className="stat-panel-header">
          <span>{statPanel === 'countries' ? T.countriesVisited : T.wishlistLabel}</span>
          <button className="stat-panel-close" onClick={() => setStatPanel(null)}>✕</button>
        </div>
        <div className="stat-panel-body">
        {CONTINENT_ORDER.filter(c => byContinent[c]).map(continent => {
          const isExpanded = expandedContinents.has(continent);
          return (
            <div key={continent} className="continent-group">
              <div className="continent-header" onClick={() => toggleContinent(continent)}>
                <span className="continent-toggle">{isExpanded ? '−' : '+'}</span>
                <span>{continent} <span className="continent-count">({byContinent[continent].length})</span></span>
              </div>
              {isExpanded && byContinent[continent].sort().map(name => {
                const countryTrips = trips
                  .filter(t => t.country === name)
                  .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
                const cityItems = statPanel === 'countries'
                  ? countryTrips.flatMap(trip =>
                      (trip.cities && trip.cities.length > 0)
                        ? trip.cities.sort().map(city => ({ city, tripId: trip.id }))
                        : [{ city: trip.name, tripId: trip.id, isTrip: true }]
                    )
                  : [];
                const countryExpanded = expandedCountries.has(name);
                return (
                  <div key={name} className="country-group">
                    <div className="country-header" onClick={() => statPanel === 'countries' && cityItems.length > 0 && toggleCountry(name)}>
                      {statPanel === 'countries' && cityItems.length > 0 && (
                        <span className="country-toggle">{countryExpanded ? '−' : '+'}</span>
                      )}
                      <span className="stat-panel-country-name">{name}</span>
                    </div>
                    {countryExpanded && cityItems.map(({ city, tripId }, i) => (
                      <div key={`${tripId}-${city}-${i}`} className="country-city-link"
                        onClick={() => { pendingCityRef.current = city; setActiveTrip(tripId); setStatPanel(null); }}>
                        {city}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          );
        })}
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════
  // PUBLIC SHARE VIEW
  // ═══════════════════════════════════════
  if (publicShareLoading) return <div className="login-page"><span className="spinner" style={{ width: 28, height: 28 }} /></div>;

  if (publicShareData) {
    if (publicShareData.error) return (
      <div className="login-page"><div className="login-card">
        <img src="/logo.png" alt="Pepini per il mondo" className="login-logo-img" />
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{T.sharedLinkInvalid}</p>
      </div></div>
    );
    const pubPhotos = publicShareData.photos || [];
    return (
      <div>
        <header className="header">
          <div className="header-logo-wrap">
            <img src="/logo.png" alt="Pepini per il mondo" className="header-logo-img" />
            <span className="header-logo heading">Pepini per il mondo</span>
          </div>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{T.sharedGallery}</span>
        </header>
        <div className="content fade-in">
          <div className="gallery-header">
            <div>
              <span className="gallery-title heading">{publicShareData.tripName}</span>
              {publicShareData.tripDate && <span className="gallery-date">{publicShareData.tripDate}</span>}
            </div>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{T.photoCount(pubPhotos.length)}</span>
          </div>
          <div className="photo-grid">
            {pubPhotos.map((p, i) => (
              <div key={i} className="photo-thumb fade-in" style={{ animationDelay: `${i * 20}ms` }}
                onClick={() => { setPublicLightbox(p); setPublicLbIdx(i); }}>
                <img src={p.url} alt={p.name} loading="lazy" />
              </div>
            ))}
          </div>
        </div>
        {publicLightbox && (
          <div className="lightbox fade-scale" onClick={() => setPublicLightbox(null)}>
            <img src={publicLightbox.url} alt={publicLightbox.name} className="lightbox-img" onClick={e => e.stopPropagation()} />
            <button className="lb-close" onClick={() => setPublicLightbox(null)}>✕</button>
            {publicLbIdx > 0 && <button className="lb-arrow lb-arrow-left" onClick={e => { e.stopPropagation(); const n = publicLbIdx - 1; setPublicLbIdx(n); setPublicLightbox(pubPhotos[n]); }}>‹</button>}
            {publicLbIdx < pubPhotos.length - 1 && <button className="lb-arrow lb-arrow-right" onClick={e => { e.stopPropagation(); const n = publicLbIdx + 1; setPublicLbIdx(n); setPublicLightbox(pubPhotos[n]); }}>›</button>}
            <div className="lb-counter">{publicLbIdx + 1} / {pubPhotos.length}</div>
          </div>
        )}
      </div>
    );
  }

  if (authLoading) return <div className="login-page"><div className="spinner" style={{ width: 28, height: 28 }} /></div>;

  // ═══════════════════════════════════════
  // ACCESS DENIED
  // ═══════════════════════════════════════
  if (accessDenied) {
    return (
      <div className="login-page">
        <div className="login-card fade-scale">
          <img src="/logo.png" alt="Pepini per il mondo" className="login-logo-img" />
          <p className="login-sub" style={{ fontSize: 18, fontWeight: 600, color: 'var(--danger)', marginBottom: 8 }}>{T.accessDenied}</p>
          <p className="login-sub">{T.appIsPrivate}</p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8 }}>{T.contactAdmin}</p>
          <button className="btn btn-sm" onClick={() => setAccessDenied(false)} style={{ marginTop: 20 }}>{T.backToLogin}</button>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════
  // LOGIN SCREEN
  // ═══════════════════════════════════════
  if (!user && !guestMode) {
    return (
      <div className="login-page">
        <div className="login-card fade-scale">
          <img src="/logo.png" alt="Pepini per il mondo" className="login-logo-img" />
          <p className="login-sub">{T.signInSub}</p>
          <button onClick={handleGoogleLogin} className="btn-google" disabled={loggingIn}>
            {loggingIn
              ? <><span className="spinner" style={{ width: 16, height: 16 }} /> {T.signingIn}</>
              : <><svg width="20" height="20" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>{T.continueWithGoogle}</>
            }
          </button>
          <button onClick={handleGuestLogin} className="btn-guest" disabled={guestLoggingIn || loggingIn}>
            {guestLoggingIn
              ? <><span className="spinner" style={{ width: 16, height: 16 }} /> {T.signingIn}</>
              : T.continueAsGuest}
          </button>
          {loginError && <p className="login-error">{loginError}</p>}
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════
  // MAIN APP
  // ═══════════════════════════════════════
  const activeTripData = trips.find(t => t.id === activeTrip);
  const canManageActiveTrip = !isReadOnly && (!activeTripData?.ownerId || activeTripData?.ownerId === user?.uid);
  const { groups: cityGroups, uncategorized: cityUncategorized, hasCities } = groupPhotosByCity(photos);
  const showCityCards = hasCities && activeCity === null;

  return (
    <div
      className={`app-shell${appWallpaperUrl ? ' has-app-wallpaper' : ''}${scrollFade ? ` scroll-fade-${scrollFade}` : ''}`}
      style={appWallpaperUrl ? { '--app-wallpaper': `url(${appWallpaperUrl})` } : undefined}
    >
      {/* ─── Header ─── */}
      <header className="header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div className="header-logo-wrap" onClick={() => setActiveTrip(null)}>
            <img src="/logo.png" alt="Pepini per il mondo" className="header-logo-img" />
            <span className="header-logo heading">Pepini per il mondo</span>
          </div>
        </div>
        <div className="header-actions">
          {isGuest && <span className="guest-pill">{T.guestModeLabel}</span>}
          {!activeTrip && !isReadOnly && (
            <div style={{ position: 'relative' }}>
              <button className="btn btn-secondary" onClick={() => setAdminDropdown(d => !d)}>{T.adminTools}</button>
              {adminDropdown && (
                <>
                  <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setAdminDropdown(false)} />
                  <div className="admin-dropdown">
                    <button className="admin-dropdown-item" onClick={() => { setAdminDropdown(false); setFbStep('folder'); setFbError(''); setFbModal(true); }}>
                      {T.importFbMenu}
                    </button>
                    <button className="admin-dropdown-item" onClick={runThumbnailMigration}>
                      {T.generateThumbsMenu}
                    </button>
                    <button className="admin-dropdown-item" onClick={() => { setAdminDropdown(false); loadAlbumShares(); setManageAccessesModal(true); }}>
                      {T.manageAccessesMenu}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
          {!activeTrip && !isReadOnly && <button className="btn btn-accent" onClick={() => setShowNewTrip(true)}>{T.newTrip}</button>}
          {activeTrip && !isReadOnly && (
            <button className="btn btn-accent" onClick={() => fileRef.current?.click()} disabled={uploading}>
              {uploading ? T.uploading(uploadCount.done, uploadCount.total) : T.addPhotos}
            </button>
          )}
          <button className="btn-icon" onClick={() => setDarkMode(d => !d)} title={darkMode ? T.lightMode : T.darkMode}>
            {darkMode
              ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
              : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            }
          </button>
          <button className="btn-icon" onClick={() => { setGuestMode(false); signOut(auth).catch(() => {}); }} title={T.signOut}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
        <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }}
          onChange={e => { handleFiles(e.target.files); e.target.value = ''; }} />
      </header>
      {appWallpaperUrl && <div className="app-wallpaper" aria-hidden="true" />}

      <div className="content">

        {/* ═══ MIGRATION BANNER ═══ */}
        {!isReadOnly && (migration === 'needed' || migration === 'running' || migration === 'done' || migration === 'error') && !activeTrip && (
          <div className={`migration-banner fade-in ${migration}`}>
            {migration === 'needed' && (
              <>
                <span>
                  <strong>{migrationCount} {isSpanish ? (migrationCount !== 1 ? 'álbumes' : 'álbum') : (migrationCount !== 1 ? 'albums' : 'album')}</strong> {isSpanish ? `encontrado${migrationCount !== 1 ? 's' : ''} en tu biblioteca privada antigua. Mígralos a la galería compartida para que todos puedan verlos.` : 'found in your old private library. Migrate them to the shared gallery so everyone can see them.'}
                </span>
                <button className="btn btn-accent btn-sm" onClick={runMigration}>{T.migrateNow}</button>
              </>
            )}
            {migration === 'running' && (
              <><span className="spinner" style={{ width: 16, height: 16 }} /><span>{T.migratingAlbums}</span></>
            )}
            {migration === 'done' && (
              <><span>{T.migrationComplete}</span><button className="migration-dismiss" onClick={() => setMigration(null)}>✕</button></>
            )}
            {migration === 'error' && (
              <><span>{T.migrationFailed} {migrationError || (isSpanish ? 'error desconocido' : 'unknown error')}</span><button className="btn btn-sm" onClick={runMigration}>{T.retry}</button><button className="migration-dismiss" onClick={() => setMigration(null)}>✕</button></>
            )}
          </div>
        )}

        {/* ═══ TRIP LIST ═══ */}
        {!activeTrip && (
          <div className="fade-in">

            {/* ─ New Trip Form ─ */}
            {!isReadOnly && showNewTrip && (
              <div className="new-trip-form fade-scale">
                <div className="form-group">
                  <label>{T.tripNameLabel}</label>
                  <input value={newTripName} onChange={e => setNewTripName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addTrip()}
                    placeholder={T.tripNamePlaceholder} className="input" autoFocus />
                </div>
                <div className="form-group" style={{ flex: '0 0 160px' }}>
                  <label>{T.dateOptional}</label>
                  <input type="date" value={newTripDate} onChange={e => setNewTripDate(e.target.value)} className="input" />
                </div>
                <div className="form-group" style={{ flex: '0 0 180px' }}>
                  <label>{T.countryOptional}</label>
                  <input list="countries-list" value={newTripCountry} onChange={e => setNewTripCountry(e.target.value)} placeholder={T.countryPlaceholder} className="input" />
                  <datalist id="countries-list">{WORLD_COUNTRIES.map(c => <option key={c} value={c} />)}</datalist>
                </div>
                <div className="form-group" style={{ flex: '0 0 440px' }}>
                  <label>{T.miroLinkOptional}</label>
                  <input value={newTripMiro} onChange={e => setNewTripMiro(e.target.value)} placeholder="https://miro.com/…" className="input" />
                </div>
                <div className="form-group" style={{ flex: '0 0 auto' }}>
                  <label>{T.visibilityLabel}</label>
                  <div className="vis-toggle">
                    <button className={`vis-btn${newTripVisibility === 'shared' ? ' active' : ''}`} onClick={() => setNewTripVisibility('shared')}>{T.visShared}</button>
                    <button className={`vis-btn${newTripVisibility === 'private' ? ' active' : ''}`} onClick={() => setNewTripVisibility('private')}>{T.visPrivate}</button>
                  </div>
                </div>
                <button onClick={addTrip} className="btn btn-accent">{T.create}</button>
                <button onClick={() => { setShowNewTrip(false); setNewTripName(''); setNewTripDate(''); setNewTripCountry(''); setNewTripMiro(''); setNewTripVisibility('shared'); }} className="btn btn-sm">{T.cancel}</button>
              </div>
            )}

            {/* ─ Stats + View toggle ─ */}
            {trips.length > 0 && (
              <div className="sticky-header-zone">
                <div className="stats-bar fade-in">
                  <div className={`stat-card stat-card-btn${statPanel === 'trips' ? ' stat-active' : ''}`} onClick={() => setStatPanel(p => p === 'trips' ? null : 'trips')}>
                    <div className="stat-value">{trips.length}</div><div className="stat-label">{T.tripsLabel}</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">{totalPhotos}</div><div className="stat-label">{T.photosLabel}</div>
                  </div>
                  {countriesVisited > 0 && (
                    <div className={`stat-card stat-card-btn${statPanel === 'countries' ? ' stat-active' : ''}`} onClick={() => setStatPanel(p => p === 'countries' ? null : 'countries')}>
                      <div className="stat-value">{countriesVisited}</div><div className="stat-label">{T.countriesLabel}</div>
                    </div>
                  )}
                  {wishlist.size > 0 && (
                    <div className={`stat-card stat-card-btn${statPanel === 'wishlist' ? ' stat-active' : ''}`} onClick={() => setStatPanel(p => p === 'wishlist' ? null : 'wishlist')}>
                      <div className="stat-value">{wishlist.size}</div><div className="stat-label">{T.wishlistLabel}</div>
                    </div>
                  )}
                  {isReadOnly && (
                    <div className="stat-card stat-card-wide guest-info-card">
                      <div className="guest-info-title">{T.guestBannerTitle}</div>
                      <div className="guest-info-text">{T.guestBannerText}</div>
                    </div>
                  )}
                  {!isReadOnly && topTrip && topTrip.photoCount > 0 && (
                    <div
                      className="stat-card stat-card-wide stat-card-btn"
                      style={{ position: 'relative' }}
                      onClick={() => !isReadOnly && !editingPanel && setEditingPanel(true)}
                      title={T.clickToEditName}
                    >
                      {editingPanel ? (
                        <div className="panel-edit-wrap" style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%' }} onClick={e => e.stopPropagation()}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, position: 'relative' }}>
                            <input
                              ref={panelInputRef}
                              className="input"
                              style={{ fontSize: 15, fontFamily: "'Playfair Display', serif", fontWeight: 600, padding: '4px 8px', height: 'auto', flex: 1 }}
                              autoFocus
                              value={customPanelLabel}
                              placeholder={topTrip.name}
                              onChange={e => {
                                setCustomPanelLabel(e.target.value);
                                savePanelLabel(e.target.value, customPanelMiro);
                              }}
                              onBlur={e => {
                                if (!e.relatedTarget?.closest?.('.panel-edit-wrap')) {
                                  setEditingPanel(false);
                                  setShowEmojiPicker(false);
                                }
                              }}
                              onKeyDown={e => { if (e.key === 'Escape') { setEditingPanel(false); setShowEmojiPicker(false); } }}
                            />
                            <button
                              className="emoji-trigger-btn"
                              title={T.insertEmoji}
                              onMouseDown={e => { e.preventDefault(); setShowEmojiPicker(v => !v); }}
                            >😊</button>
                            {showEmojiPicker && (
                              <div className="emoji-picker-popover" onMouseDown={e => e.preventDefault()}>
                                {['😊','😄','😍','🥰','😎','🤩','🥳','😂','❤️','✨','🌟','⭐','🎉','🎊','🏖️','🏝️','🗺️','✈️','🌍','🌏','🌎','🏔️','🏕️','🌅','🌄','🌠','🌈','🍹','🍜','🍕','📸','🎒','🧳','🗼','🗽','🏯','🕌','🛫','🛬','🚢','🚂','🚗','🏄','🤿','🎭','🎨','🎵','🌺','🌸','🌻','🌿','🦋','🐬','🦜','🦁','🐘','🦒','🦓','🌴','🏞️','⛰️','🎑','🌊','🏜️','🏟️','🎠','💫','🔥','💎','🌙','☀️','⛅','🌤️'].map(em => (
                                  <button
                                    key={em}
                                    className="emoji-item-btn"
                                    onMouseDown={e => {
                                      e.preventDefault();
                                      const inp = panelInputRef.current;
                                      if (!inp) return;
                                      const start = inp.selectionStart;
                                      const end = inp.selectionEnd;
                                      const newVal = customPanelLabel.slice(0, start) + em + customPanelLabel.slice(end);
                                      setCustomPanelLabel(newVal);
                                      savePanelLabel(newVal, customPanelMiro);
                                      setShowEmojiPicker(false);
                                      requestAnimationFrame(() => {
                                        inp.focus();
                                        inp.setSelectionRange(start + em.length, start + em.length);
                                      });
                                    }}
                                  >{em}</button>
                                ))}
                              </div>
                            )}
                          </div>
                          <input
                            className="input"
                            style={{ fontSize: 12, padding: '4px 8px', height: 'auto' }}
                            value={customPanelMiro}
                            placeholder={T.miroLinkOptionalPh}
                            onChange={e => {
                              setCustomPanelMiro(e.target.value);
                              savePanelLabel(customPanelLabel, e.target.value);
                            }}
                            onBlur={e => {
                              if (!e.relatedTarget?.closest?.('.panel-edit-wrap')) {
                                setEditingPanel(false);
                                setShowEmojiPicker(false);
                              }
                            }}
                            onKeyDown={e => { if (e.key === 'Escape') { setEditingPanel(false); setShowEmojiPicker(false); } }}
                          />
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {customPanelMiro && (
                            <a
                              href={customPanelMiro}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={e => e.stopPropagation()}
                              title={T.openInMiro}
                              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, borderRadius: 5, background: '#FFD02F', color: '#1a1a1a', textDecoration: 'none', flexShrink: 0, fontWeight: 800, fontSize: 14, lineHeight: 1, fontFamily: 'system-ui, sans-serif' }}
                            >M</a>
                          )}
                          <div className="stat-value stat-value-sm">{customPanelLabel || topTrip.name}</div>
                        </div>
                      )}

                      {!isReadOnly && !editingPanel && <span style={{ position: 'absolute', top: 8, right: 10, fontSize: 12, opacity: 0.4 }}>✎</span>}
                    </div>
                  )}
                </div>
                {renderStatPanel()}
                <div className="trips-view-header">
                  <div className="sort-toggle" aria-label="Album sorting">
                    <button
                      className={`sort-btn ${tripSort === 'date' ? 'active' : ''}`}
                      onClick={() => setTripSort('date')}
                    >
                      {T.sortByDate}
                    </button>
                    <button
                      className={`sort-btn ${tripSort === 'az' ? 'active' : ''}`}
                      onClick={() => setTripSort('az')}
                    >
                      {T.sortAZ}
                    </button>
                  </div>
                  <div className="view-toggle">
                    <button className={`view-btn ${tripsView === 'grid' ? 'active' : ''}`} onClick={() => setTripsView('grid')} title={T.gridView}>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><rect x="0" y="0" width="6" height="6" rx="1"/><rect x="8" y="0" width="6" height="6" rx="1"/><rect x="0" y="8" width="6" height="6" rx="1"/><rect x="8" y="8" width="6" height="6" rx="1"/></svg>
                    </button>
                    {hasMapData && <button className={`view-btn ${tripsView === 'map' ? 'active' : ''}`} onClick={() => setTripsView('map')} title={isSpanish ? 'Vista de mapa' : 'Map view'}>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"><path d="M1 2.5l4-1.5 4 1.5 4-1.5v10l-4 1.5-4-1.5-4 1.5V2.5z"/><line x1="5" y1="1" x2="5" y2="11.5"/><line x1="9" y1="2.5" x2="9" y2="13"/></svg>
                    </button>}
                  </div>
                </div>
              </div>
            )}

            {loadingTrips && <div style={{ textAlign: 'center', padding: 60 }}><span className="spinner" /></div>}

            {!loadingTrips && trips.length === 0 && !showNewTrip && (
              <div className="empty">
                <div className="empty-icon">✈</div>
                <p className="empty-title heading">{T.noTripsYet}</p>
                <p className="empty-sub">{T.noTripsYetSub}</p>
                {!isReadOnly && <button className="btn btn-accent" onClick={() => setShowNewTrip(true)}>{T.newTrip}</button>}
              </div>
            )}

            {/* ─ Choropleth map ─ */}
            {tripsView === 'map' && hasMapData && (
              <div className="map-wrap fade-in">
                <div className="map-toolbar">
                  <div className="map-zoom-btns">
                    <button className="btn-map-zoom" onClick={() => setMapZoom(z => Math.min(z * 1.6, 8))} title="Zoom in">+</button>
                    <button className="btn-map-zoom" onClick={() => setMapZoom(z => Math.max(z / 1.6, 1))} title="Zoom out">−</button>
                  </div>
                </div>
                <ComposableMap
                  projectionConfig={{ rotate: [-10, 0, 0], scale: 153 }}
                  width={800}
                  height={380}
                >
                  <ZoomableGroup zoom={mapZoom} center={mapCenter} onMoveEnd={({ coordinates, zoom }) => { setMapCenter(coordinates); setMapZoom(zoom); }}>
                    <Geographies geography={GEO_URL}>
                      {({ geographies }) => geographies.map(geo => {
                        const iso = Number(geo.id);
                        const isVisited = visitedIsos.has(iso);
                        const isWished = !isVisited && wishlist.has(iso);
                        const trip = tripByIso[iso];
                        return (
                          <Geography
                            key={geo.rsmKey}
                            geography={geo}
                            onMouseEnter={() => setMapTooltip(
                              isVisited ? `${geo.properties.name} — ${trip.name}` :
                              isWished  ? `${geo.properties.name} — ${T.wishlistTooltip}` :
                              geo.properties.name
                            )}
                            onMouseLeave={() => setMapTooltip('')}
                            onClick={() => {
                              if (isVisited && trip) { setActiveTrip(trip.id); setTripsView('grid'); }
                              else if (!isReadOnly) toggleWishlist(iso);
                            }}
                            style={{
                              default: { fill: isVisited ? 'var(--accent)' : isWished ? '#e05252' : 'var(--map-land)', stroke: 'var(--map-border)', strokeWidth: 0.4, outline: 'none' },
                              hover:   { fill: isVisited ? 'var(--accent-hover)' : isWished ? '#c94040' : 'var(--map-hover)', stroke: 'var(--map-border)', strokeWidth: 0.4, outline: 'none', cursor: 'pointer' },
                              pressed: { fill: isVisited ? 'var(--accent-hover)' : isWished ? '#c94040' : 'var(--map-hover)', outline: 'none' },
                            }}
                          />
                        );
                      })}
                    </Geographies>
                  </ZoomableGroup>
                </ComposableMap>
                <div className="map-tooltip-bar">{mapTooltip || ' '}</div>
              </div>
            )}

            {/* ─ Grid view ─ */}
            {tripsView === 'grid' && (
              <div className="trips-grid">
                {sortedTrips.map((trip, i) => {
                  const isOwner = !isReadOnly && (!trip.ownerId || trip.ownerId === user.uid);
                  const creatorEmail = trip.ownerEmail
                    || creatorMap[trip.ownerId]
                    || (isOwner ? user.email : null);
                  const creatorUsername = creatorEmail ? creatorEmail.split('@')[0] : null;
                  return (
                  <div key={trip.id} className="trip-card fade-in" style={{ animationDelay: `${i * 60}ms` }} onClick={() => setActiveTrip(trip.id)}>
                    <div className={`trip-cover ${trip.cover ? '' : 'trip-cover-empty'}`}
                      style={trip.cover ? { backgroundImage: `url(${trip.cover})` } : {}}>
                      {!trip.cover && <span>🗺</span>}
                      {isOwner && <button className="trip-delete" onClick={e => { e.stopPropagation(); setConfirmDelete(trip.id); }}>✕</button>}
                      {isOwner && (
                        <button className={`trip-share ${trip.shareToken ? 'trip-share-active' : ''}`}
                          title={trip.shareToken ? T.sharedSeeLink : T.shareThisTrip}
                          disabled={shareGenerating === trip.id}
                          onClick={e => { e.stopPropagation(); generateShareLink(trip); }}>
                          {shareGenerating === trip.id ? '…' : '↗'}
                        </button>
                      )}
                    </div>
                    <div className="trip-info">
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                        <div className="trip-name">{trip.name}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                          <span className="trip-vis-icon" title={trip.visibility === 'private' ? T.privateTitle : T.sharedTitle}>
                            {trip.visibility === 'private' ? '🔒' : '🌍'}
                          </span>
                          {isOwner && <button className="trip-edit-btn" title={T.editTripBtn} onClick={e => { e.stopPropagation(); openEditTrip(trip); }}>✎</button>}
                        </div>
                      </div>
                      <div className="trip-meta">
                        {trip.country ? `${trip.country}${trip.date || trip.photoCount ? ' · ' : ''}` : ''}
                        {trip.date ? `${trip.date} · ` : ''}
                        {T.photoCount(trip.photoCount || 0)}
                      </div>
                      {creatorUsername
                        ? <div className="trip-creator">{T.createdBy(creatorUsername)}</div>
                        : !isReadOnly && !isOwner && (
                          <div className="trip-creator trip-creator-unknown"
                            onClick={async e => {
                              e.stopPropagation();
                              const name = window.prompt(T.whoCreated);
                              if (!name?.trim()) return;
                              const email = name.includes('@') ? name.trim() : `${name.trim()}@gmail.com`;
                              try {
                                await updateDoc(doc(db, 'trips', trip.id), { ownerEmail: email });
                                setTrips(prev => prev.map(t => t.id === trip.id ? { ...t, ownerEmail: email } : t));
                              } catch (err) { alert(T.couldNotSave + err.message); }
                            }}>
                            {T.setCreator}
                          </div>
                        )
                      }
                    </div>
                  </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ═══ PHOTO GALLERY ═══ */}
        {activeTrip && activeTripData && (
          <div className="fade-in">
            <div className="gallery-header">
              <div>
                <span className="gallery-title heading">{activeTripData.name}</span>
                {activeCity && (
                  <span className="gallery-city-sub">
                    {' / '}{activeCity === '__uncategorized__' ? T.noCityAssigned : activeCity}
                  </span>
                )}
                {activeTripData.date && <span className="gallery-date">{activeTripData.date}</span>}
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {activeCity !== null
                  ? <button className="btn btn-sm" onClick={() => { setActiveCity(null); setSelectedPhotos(new Set()); }}>← {activeTripData.name}</button>
                  : <button className="btn btn-sm" onClick={() => setActiveTrip(null)}>{T.backToTrips}</button>
                }
                {activeTripData.miroUrl && (
                  <a href={activeTripData.miroUrl} target="_blank" rel="noopener noreferrer" className="btn btn-sm miro-link">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                    Miro
                  </a>
                )}
                {!isReadOnly && (
                  <button className={`btn btn-sm ${activeTripData.shareToken ? 'btn-accent' : ''}`}
                    onClick={() => generateShareLink(activeTripData)} disabled={shareGenerating === activeTrip}>
                    {shareGenerating === activeTrip ? T.generating : activeTripData.shareToken ? T.sharedBtn : T.shareBtn}
                  </button>
                )}
                {!showCityCards && (
                  <>
                    {!isReadOnly && selectedPhotos.size > 0 && (
                      <button className="btn btn-accent btn-sm" onClick={() => { setCityInput(''); setCityModal(true); }}>
                        {T.saveChanges(selectedPhotos.size)}
                      </button>
                    )}
                    <div className="view-toggle">
                      <button className={`view-btn ${view === 'grid' ? 'active' : ''}`} onClick={() => { setView('grid'); setSelectedPhotos(new Set()); }}>{T.grid}</button>
                      <button className={`view-btn ${view === 'list' ? 'active' : ''}`} onClick={() => setView('list')}>{T.list}</button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* ─ City sub-album cards ─ */}
            {showCityCards && (
              <div className="trips-grid">
                {Object.keys(cityGroups).sort().map((city, i) => {
                  const coverUrl = cityGroups[city][0]?.url;
                  const isOwner = !isReadOnly && (!activeTripData?.ownerId || activeTripData?.ownerId === user?.uid);
                  const cityVis = activeTripData?.cityMetadata?.[city]?.visibility || activeTripData?.visibility || 'shared';
                  return (
                    <div key={city} className="trip-card fade-in" style={{ animationDelay: `${i * 60}ms` }}
                      onClick={() => setActiveCity(city)}>
                      <div className={`trip-cover ${coverUrl ? '' : 'trip-cover-empty'}`}
                        style={coverUrl ? { backgroundImage: `url(${coverUrl})` } : {}}>
                        {!coverUrl && <span>🏙</span>}
                      </div>
                      <div className="trip-info">
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                          <div className="trip-name">{city}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                            <span className="trip-vis-icon" title={cityVis === 'private' ? T.privateTitle : T.sharedTitle}>
                              {cityVis === 'private' ? '🔒' : '🌍'}
                            </span>
                            {isOwner && (
                              <button className="trip-edit-btn" title={T.editSubAlbumBtn}
                                onClick={e => { e.stopPropagation(); openEditCity(city); }}>✎</button>
                            )}
                          </div>
                        </div>
                        <div className="trip-meta">{T.photoCount(cityGroups[city].length)}</div>
                      </div>
                    </div>
                  );
                })}
                {cityUncategorized.length > 0 && (() => {
                  const coverUrl = cityUncategorized[0]?.url;
                  return (
                    <div className="trip-card fade-in" style={{ animationDelay: `${Object.keys(cityGroups).length * 60}ms` }}
                      onClick={() => setActiveCity('__uncategorized__')}>
                      <div className={`trip-cover ${coverUrl ? '' : 'trip-cover-empty'}`}
                        style={coverUrl ? { backgroundImage: `url(${coverUrl})` } : {}}>
                        {!coverUrl && <span>🏙</span>}
                      </div>
                      <div className="trip-info">
                        <div className="trip-name" style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>{T.noCityAssigned}</div>
                        <div className="trip-meta">{T.photoCount(cityUncategorized.length)}</div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* ─ Photo views (flat, inside a city or when no cities set) ─ */}
            {!showCityCards && (
              <>
                {uploading && <div className="upload-progress"><span className="spinner" />{T.uploadingPhotos(uploadCount.done, uploadCount.total)}</div>}
                {loadingPhotos && <div style={{ textAlign: 'center', padding: 60 }}><span className="spinner" /></div>}
                {!loadingPhotos && displayPhotos.length === 0 && !uploading && (
                  <div className={`drop-zone ${dragging ? 'dragging' : ''}`} onClick={() => !isReadOnly && fileRef.current?.click()}
                    onDragOver={!isReadOnly ? onDragOver : undefined} onDragLeave={!isReadOnly ? onDragLeave : undefined} onDrop={!isReadOnly ? onDrop : undefined}>
                    <div className="drop-zone-icon">📷</div>
                    <p style={{ fontSize: 15, marginBottom: 4 }}>{isReadOnly ? T.noPhotosYet : T.dragDropPhotos}</p>
                    {!isReadOnly && <p style={{ fontSize: 12 }}>{T.orClickToBrowse}</p>}
                  </div>
                )}

                {displayPhotos.length > 0 && view === 'grid' && (() => {
                  const canDrag = !isReadOnly && activeCity === null;
                  return (
                    <div className="photo-grid" onDragOver={canDrag ? onDragOver : undefined} onDragLeave={canDrag ? onDragLeave : undefined} onDrop={canDrag ? onDrop : undefined}>
                      {displayPhotos.map((p, i) => {
                        const flatIdx = photos.findIndex(x => x.id === p.id);
                        return (
                          <div key={p.id}
                            className={`photo-thumb fade-in${canDrag && dragOverIdx === flatIdx ? ' drag-over' : ''}`}
                            style={{ animationDelay: `${i * 30}ms` }}
                            draggable={canDrag}
                            onDragStart={canDrag ? () => { draggingIdx.current = flatIdx; } : undefined}
                            onDragEnd={canDrag ? () => { draggingIdx.current = null; setDragOverIdx(null); } : undefined}
                            onDragOver={canDrag ? e => { e.preventDefault(); e.stopPropagation(); setDragOverIdx(flatIdx); } : undefined}
                            onDragLeave={canDrag ? () => setDragOverIdx(null) : undefined}
                            onDrop={canDrag ? e => { e.preventDefault(); e.stopPropagation(); reorderPhotos(flatIdx); setDragOverIdx(null); } : undefined}
                            onClick={() => setLightbox(p)}
                            onContextMenu={!isReadOnly ? e => openPhotoContextMenu(e, p, { canSetAlbumCover: activeCity && canManageActiveTrip, canManagePhoto: canManageActiveTrip }) : undefined}>
                            <img src={p.thumbUrl || p.url} alt={p.name} loading="lazy" decoding="async" />
                            {canDrag && <div className="photo-drag-handle">⠿</div>}
                            {p.description && <div className="photo-desc-badge" title={p.description}>✎</div>}
                          </div>
                        );
                      })}
                      {canDrag && <div className="add-tile" onClick={() => fileRef.current?.click()}>+</div>}
                    </div>
                  );
                })()}

                {displayPhotos.length > 0 && view === 'list' && (
                  <div className="photo-list">
                    {displayPhotos.map((p, i) => (
                      <div key={p.id}
                        className={`photo-list-item fade-in${selectedPhotos.has(p.id) ? ' selected' : ''}`}
                        style={{ animationDelay: `${i * 25}ms` }}
                        onContextMenu={!isReadOnly ? e => openPhotoContextMenu(e, p, { canSetAlbumCover: activeCity && canManageActiveTrip, canManagePhoto: canManageActiveTrip }) : undefined}>
                        {!isReadOnly && (
                          <input type="checkbox" className="photo-list-check"
                            checked={selectedPhotos.has(p.id)}
                            onChange={() => togglePhotoSelection(p.id)}
                            onClick={e => e.stopPropagation()} />
                        )}
                        <img src={p.thumbUrl || p.url} alt={p.name} loading="lazy" decoding="async" onClick={() => setLightbox(p)} style={{ cursor: 'pointer' }} />
                        <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => setLightbox(p)}>
                          <div className="photo-list-name">{p.name}</div>
                          {p.description && <div className="photo-list-desc">{p.description}</div>}
                          {p.createdAt?.seconds && <div className="photo-list-date">{new Date(p.createdAt.seconds * 1000).toLocaleDateString()}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* ═══ LIGHTBOX ═══ */}
      {lightbox && (
        <div className="lightbox fade-scale" onClick={() => setLightbox(null)}>
          <img src={lightbox.url} alt={lightbox.name} className="lightbox-img" onClick={e => e.stopPropagation()} />
          <button className="lb-close" onClick={() => setLightbox(null)}>✕</button>
          {lbIndex > 0 && <button className="lb-arrow lb-arrow-left" onClick={e => { e.stopPropagation(); navLightbox(-1); }}>‹</button>}
          {lbIndex < displayPhotos.length - 1 && <button className="lb-arrow lb-arrow-right" onClick={e => { e.stopPropagation(); navLightbox(1); }}>›</button>}
          <div className="lb-counter">{lbIndex + 1} / {displayPhotos.length}</div>
          {!isReadOnly && (
            <div className="lb-desc-wrap" onClick={e => e.stopPropagation()}>
              <textarea
                className="lb-desc"
                placeholder={T.addDescriptionPh}
                value={lbDesc}
                onChange={e => setLbDesc(e.target.value)}
                onBlur={() => savePhotoDesc(lightbox.id, lbDesc)}
              />
            </div>
          )}
          {activeCity && !isReadOnly && (!activeTripData?.ownerId || activeTripData?.ownerId === user?.uid) && (
            <button
              className="lb-cover-btn"
              title={T.setAsAlbumCoverTitle}
              onClick={async e => {
                e.stopPropagation();
                await setPhotoAsAlbumCover(lightbox.url);
                setLbCoverSet(true);
                setTimeout(() => setLbCoverSet(false), 2000);
              }}
            >
              {lbCoverSet
                ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              }
            </button>
          )}
          {!isReadOnly && (
            <button className="lb-delete" onClick={e => { e.stopPropagation(); deletePhoto(lightbox); }} title={T.deletePhotoTitle}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
            </button>
          )}
        </div>
      )}

      {/* ═══ CONTEXT MENU ═══ */}
      {contextMenu && !isReadOnly && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 1099 }} onClick={() => setContextMenu(null)} onContextMenu={e => { e.preventDefault(); setContextMenu(null); }} />
          <div className="context-menu" style={{ top: contextMenu.y, left: contextMenu.x }} onClick={e => e.stopPropagation()}>
            {contextMenu.canSetAlbumCover && (
              <button onClick={async () => { await setPhotoAsAlbumCover(contextMenu.photo.url); setContextMenu(null); }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                {T.useAsAlbumCover}
              </button>
            )}
            <button onClick={async () => { await setPhotoAsAppWallpaper(contextMenu.photo); setContextMenu(null); }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="14" rx="2"/><path d="M8 21h8"/><path d="M12 18v3"/><circle cx="8.5" cy="9" r="1.5"/><path d="M21 15l-5-5-4 4-2-2-5 5"/></svg>
              {T.useAsAppWallpaper}
            </button>
            {contextMenu.canManagePhoto && (
              <button className="context-menu-danger" onClick={async () => { await deletePhoto(contextMenu.photo); setContextMenu(null); }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                {T.deletePhotoMenu}
              </button>
            )}
          </div>
        </>
      )}

      {/* ═══ DELETE TRIP ═══ */}
      {!isReadOnly && confirmDelete && (
        <div className="modal-overlay fade-scale" onClick={() => setConfirmDelete(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <p className="modal-title">{T.deleteTripQuestion}</p>
            <p className="modal-sub">{T.deleteTripWarn}</p>
            <div className="modal-actions">
              <button className="btn btn-sm" onClick={() => setConfirmDelete(null)}>{T.cancel}</button>
              <button className="btn btn-danger" onClick={() => deleteTrip(confirmDelete)}>{T.deleteBtn}</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ EDIT TRIP ═══ */}
      {!isReadOnly && editTrip && (
        <div className="modal-overlay fade-scale" onClick={() => setEditTrip(null)}>
          <div className="modal edit-modal" onClick={e => e.stopPropagation()}>
            <p className="modal-title" style={{ marginBottom: 16 }}>{T.editTripHeading}</p>
            <div className="edit-modal-fields">
              <div className="form-group">
                <label>{T.nameLabel}</label>
                <input value={editName} onChange={e => setEditName(e.target.value)} onKeyDown={e => e.key === 'Enter' && saveEditTrip()} className="input" autoFocus />
              </div>
              <div className="form-group" style={{ flex: '0 0 150px' }}>
                <label>{T.dateLabel}</label>
                <input type="date" value={editDate} onChange={e => setEditDate(e.target.value)} className="input" />
              </div>
              <div className="form-group" style={{ flex: '0 0 160px' }}>
                <label>{T.countryLabel}</label>
                <input list="countries-list-edit" value={editCountry} onChange={e => setEditCountry(e.target.value)} placeholder={T.countryPlaceholder} className="input" />
                <datalist id="countries-list-edit">{WORLD_COUNTRIES.map(c => <option key={c} value={c} />)}</datalist>
              </div>
              <div className="form-group" style={{ flex: '0 0 400px' }}>
                <label>{T.miroLink}</label>
                <input value={editMiro} onChange={e => setEditMiro(e.target.value)} placeholder="https://miro.com/…" className="input" />
              </div>
              <div className="form-group" style={{ flex: '0 0 auto' }}>
                <label>{T.visibilityLabel}</label>
                <div className="vis-toggle">
                  <button className={`vis-btn${editVisibility === 'shared' ? ' active' : ''}`} onClick={() => setEditVisibility('shared')}>{T.visShared}</button>
                  <button className={`vis-btn${editVisibility === 'private' ? ' active' : ''}`} onClick={() => setEditVisibility('private')}>{T.visPrivate}</button>
                </div>
              </div>
            </div>
            <div className="modal-actions" style={{ marginTop: 16 }}>
              <button className="btn btn-sm" onClick={() => setEditTrip(null)}>{T.cancel}</button>
              <button className="btn btn-accent" onClick={saveEditTrip} disabled={editSaving || !editName.trim()}>{editSaving ? T.saving : T.save}</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ EDIT CITY SUB-ALBUM MODAL ═══ */}
      {!isReadOnly && editCity && (
        <div className="modal-overlay fade-scale" onClick={() => setEditCity(null)}>
          <div className="modal edit-modal" onClick={e => e.stopPropagation()}>
            <p className="modal-title" style={{ marginBottom: 16 }}>{T.editSubAlbumHeading}</p>
            <div className="edit-modal-fields">
              <div className="form-group">
                <label>{T.nameLabel}</label>
                <input value={editCityName} onChange={e => setEditCityName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && saveEditCity()} className="input" autoFocus />
              </div>
              <div className="form-group" style={{ flex: '0 0 auto' }}>
                <label>{T.visibilityLabel}</label>
                <div className="vis-toggle">
                  <button className={`vis-btn${editCityVisibility === 'shared' ? ' active' : ''}`}
                    onClick={() => setEditCityVisibility('shared')}>{T.visShared}</button>
                  <button className={`vis-btn${editCityVisibility === 'private' ? ' active' : ''}`}
                    onClick={() => setEditCityVisibility('private')}>{T.visPrivate}</button>
                </div>
              </div>
            </div>
            <div className="modal-actions" style={{ marginTop: 16 }}>
              <button className="btn btn-sm" onClick={() => setEditCity(null)}>{T.cancel}</button>
              <button className="btn btn-accent" onClick={saveEditCity}
                disabled={editCitySaving || !editCityName.trim()}>
                {editCitySaving ? T.saving : T.save}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ CITY ASSIGN MODAL ═══ */}
      {!isReadOnly && cityModal && (
        <div className="modal-overlay fade-scale" onClick={() => setCityModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <p className="modal-title">{T.assignCityHeading}</p>
            <p className="modal-sub">{T.photosSelected(selectedPhotos.size)}</p>
            <input
              className="input"
              value={cityInput}
              onChange={e => setCityInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && saveCityToPhotos()}
              placeholder={T.cityPlaceholder}
              autoFocus
            />
            <div className="modal-actions" style={{ marginTop: 16 }}>
              <button className="btn btn-sm" onClick={() => setCityModal(false)}>{T.cancel}</button>
              <button className="btn btn-accent" onClick={saveCityToPhotos}>{T.save}</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ AUTO-DATE MODAL ═══ */}
      {!isReadOnly && autoDateModal && (
        <div className="modal-overlay fade-scale" onClick={() => autoDateModal === 'done' && setAutoDateModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            {autoDateModal === 'running' && (
              <>
                <p className="modal-title">{T.settingDates}</p>
                <div style={{ textAlign: 'center', padding: '20px 0' }}><span className="spinner" /></div>
                <p className="modal-sub">{T.scanningFbAlbums}</p>
              </>
            )}
            {autoDateModal === 'done' && (
              <>
                <p className="modal-title">{T.doneBtn}</p>
                <p className="modal-sub">
                  {autoDateUpdated > 0
                    ? T.autoDateUpdated(autoDateUpdated, autoDateScanned)
                    : autoDateScanned === 0
                      ? T.autoDateNoAlbums
                      : T.autoDateNoDates(autoDateScanned)}
                </p>
                <div className="modal-actions" style={{ marginTop: 16 }}>
                  <button className="btn btn-accent" onClick={() => setAutoDateModal(false)}>{T.close}</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ═══ THUMBNAIL MIGRATION ═══ */}
      {!isReadOnly && thumbMigration && (
        <div className="modal-overlay fade-scale" onClick={() => thumbMigration.status !== 'running' && thumbMigration.status !== 'scanning' && setThumbMigration(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <p className="modal-title">{T.thumbMigrationTitle}</p>
            <p className="modal-sub">
              {thumbMigration.status === 'scanning' && T.thumbMigrationScanning}
              {thumbMigration.status === 'running' && T.thumbMigrationProgress(thumbMigration.done, thumbMigration.total)}
              {thumbMigration.status === 'done' && (thumbMigration.total === 0 ? T.thumbMigrationNone : T.thumbMigrationDone(thumbMigration.done))}
              {thumbMigration.status === 'error' && `${T.migrationFailed} ${thumbMigration.error}`}
            </p>
            {thumbMigration.status === 'running' && (
              <p className="thumb-migration-eta">
                {thumbMigration.done > 0 && thumbMigration.etaMs
                  ? T.thumbMigrationEta(formatDuration(thumbMigration.etaMs), thumbMigration.ratePerMin || 0)
                  : T.calculatingEta}
              </p>
            )}
            {(thumbMigration.status === 'running' || thumbMigration.status === 'done') && thumbMigration.total > 0 && (
              <div className="thumb-migration-bar-wrap">
                <div className="thumb-migration-bar" style={{ width: `${Math.round((thumbMigration.done / thumbMigration.total) * 100)}%` }} />
              </div>
            )}
            {thumbMigration.error && thumbMigration.status === 'done' && (
              <p className="thumb-migration-note">{thumbMigration.error}</p>
            )}
            {(thumbMigration.status === 'done' || thumbMigration.status === 'error') && (
              <div className="modal-actions">
                {thumbMigration.status === 'error' && <button className="btn btn-sm" onClick={runThumbnailMigration}>{T.retry}</button>}
                <button className="btn btn-accent btn-sm" onClick={() => setThumbMigration(null)}>{T.doneBtn}</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══ FACEBOOK IMPORT MODAL ═══ */}
      {!isReadOnly && fbModal && (
        <div className="modal-overlay fade-scale" onClick={() => fbStep !== 'import' && setFbModal(false)}>
          <div className="modal fb-import-modal" onClick={e => e.stopPropagation()}>

            {fbStep === 'folder' && (
              <>
                <p className="modal-title">{T.importFbTitle}</p>
                <p className="modal-sub">{T.fbFolderNote}</p>
                {fbError && <p className="fb-error">{fbError}</p>}
                <div className="modal-actions" style={{ marginTop: 20 }}>
                  <button className="btn btn-sm" onClick={() => setFbModal(false)}>{T.cancel}</button>
                  <button className="btn btn-accent" onClick={scanFbFolder}>{T.scanFolder}</button>
                </div>
              </>
            )}

            {fbStep === 'select' && (() => {
              const availableRows = fbRows.filter(r =>
                r.city === null || !fbImportedSet.has(`${r.city}::${r.photoCount}`)
              );
              const hiddenCount = fbRows.length - availableRows.length;

              const filtered = availableRows.filter(r => {
                if (!fbFilter) return true;
                const q = fbFilter.toLowerCase();
                return (r.city || r.rawTitle).toLowerCase().includes(q)
                  || (fbAlbumNames[r.id] || '').toLowerCase().includes(q);
              });
              const selectedCount = fbSelected.size;
              const uniqueAlbums = new Set(availableRows.filter(r => fbSelected.has(r.id)).map(r => (fbAlbumNames[r.id] || r.rawTitle).trim())).size;
              return (
                <>
                  <p className="modal-title">{T.selectCitiesToImport}</p>
                  <p className="modal-sub">
                    {availableRows.length} {T.citiesAvail} · {selectedCount} {T.selectedLabel} · {T.albumsLabel(uniqueAlbums)}
                    {hiddenCount > 0 && <span style={{ color: 'var(--text-muted)', marginLeft: 6 }}>· {hiddenCount} {T.alreadyImported}</span>}
                  </p>
                  <div className="fb-filter-bar">
                    <input className="input" value={fbFilter} onChange={e => setFbFilter(e.target.value)} placeholder={T.filterByCityOrAlbum} />
                    <button className="btn btn-sm" onClick={() => setFbSelected(new Set(availableRows.map(r => r.id)))}>{T.all}</button>
                    <button className="btn btn-sm" onClick={() => setFbSelected(new Set())}>{T.none}</button>
                  </div>
                  <div className="fb-list-header">
                    <span className="fb-lh-check" />
                    <span className="fb-lh-city">{T.cityCol}</span>
                    <span className="fb-lh-album">{T.albumCol}</span>
                    <span className="fb-lh-photos">{T.photosCol}</span>
                  </div>
                  <div className="fb-album-list">
                    {filtered.map(r => (
                      <label key={r.id} className="fb-album-row">
                        <input type="checkbox" checked={fbSelected.has(r.id)}
                          onChange={() => setFbSelected(prev => {
                            const next = new Set(prev);
                            next.has(r.id) ? next.delete(r.id) : next.add(r.id);
                            return next;
                          })} />
                        <span className="fb-row-city">{r.city || r.rawTitle}</span>
                        <input
                          className="input fb-row-album-input"
                          value={fbAlbumNames[r.id] || ''}
                          onChange={e => setFbAlbumNames(prev => ({ ...prev, [r.id]: e.target.value }))}
                          onClick={e => e.preventDefault()}
                          placeholder={T.albumName}
                        />
                        <span className="fb-row-photos">{r.photoCount || '–'}</span>
                      </label>
                    ))}
                  </div>
                  <div className="modal-actions" style={{ marginTop: 12 }}>
                    <button className="btn btn-sm" onClick={() => setFbModal(false)}>{T.cancel}</button>
                    <button className="btn btn-accent" onClick={handleFbImportClick} disabled={selectedCount === 0}>
                      {T.importNCities(selectedCount)}
                    </button>
                  </div>
                </>
              );
            })()}

            {fbStep === 'import' && (() => {
              const totalPhotos = Object.values(fbProgress).reduce((s, p) => s + p.total, 0);
              const isScanning = Object.values(fbProgress).some(p => p.scanning);
              const elapsed = fbImportStartRef.current ? Date.now() - fbImportStartRef.current : 0;
              const rate = elapsed > 0 && fbTotalDone > 0 ? fbTotalDone / elapsed : 0;
              const remaining = totalPhotos - fbTotalDone;
              const etaMs = rate > 0 && remaining > 0 ? remaining / rate : 0;
              const formatTime = (ms) => {
                const s = Math.round(ms / 1000);
                if (s < 60) return `${s}s`;
                const m = Math.floor(s / 60), rs = s % 60;
                if (m < 60) return rs > 0 ? `${m}m ${rs}s` : `${m}m`;
                return `${Math.floor(m / 60)}h ${m % 60}m`;
              };
              return (
                <>
                  <p className="modal-title">{T.importing}</p>
                  <div className="fb-eta-bar">
                    <span>{fbTotalDone} / {totalPhotos || '?'} {T.photosCol.toLowerCase()}</span>
                    {isScanning && <span className="fb-eta-scanning">{T.scanningAlbums}</span>}
                    {!isScanning && etaMs > 0 && (
                      <span className="fb-eta-time">~{formatTime(etaMs)} {T.remaining}</span>
                    )}
                    {!isScanning && fbTotalDone > 0 && elapsed > 0 && (
                      <span className="fb-eta-elapsed">{T.elapsed} {formatTime(elapsed)}</span>
                    )}
                  </div>
                  <div className="fb-eta-total-bar-wrap">
                    <div className="fb-eta-total-bar" style={{ width: totalPhotos > 0 ? `${Math.round((fbTotalDone / totalPhotos) * 100)}%` : '0%' }} />
                  </div>
                  <div className="fb-album-list">
                    {Object.entries(fbProgress).map(([name, prog]) => {
                      const pct = prog.total > 0 ? Math.round((prog.done / prog.total) * 100) : 0;
                      return (
                        <div key={name} className="fb-progress-item">
                          <div className="fb-progress-name">{name}</div>
                          {prog.scanning
                            ? <div className="fb-progress-waiting">{T.scanningEllipsis}</div>
                            : prog.total > 0 ? (
                              <div className="fb-progress-bar-wrap">
                                <div className="fb-progress-bar" style={{ width: `${pct}%` }} />
                                <span className="fb-progress-label">{prog.done} / {prog.total}</span>
                              </div>
                            ) : <div className="fb-progress-waiting">{T.waiting}</div>}
                        </div>
                      );
                    })}
                  </div>
                  <div className="modal-actions" style={{ marginTop: 12 }}>
                    <button className="btn btn-sm btn-danger" onClick={() => { fbCancelRef.current = true; }}>{T.stopImport}</button>
                  </div>
                </>
              );
            })()}

            {fbStep === 'done' && (
              <>
                <p className="modal-title">{T.importComplete}</p>
                <p className="modal-sub">{T.importedPhotos(fbTotalDone, fbSelected.size)}</p>
                <div className="modal-actions" style={{ marginTop: 20 }}>
                  <button className="btn btn-accent" onClick={() => { setFbModal(false); loadTrips(); }}>{T.doneBtn}</button>
                </div>
              </>
            )}

          </div>
        </div>
      )}

      {/* ═══ SHARE MODAL ═══ */}
      {!isReadOnly && shareModal && (
        <div className="modal-overlay fade-scale" onClick={() => setShareModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 460 }}>
            <p className="modal-title">{T.shareTripTitle}</p>
            <p className="modal-sub">{T.shareLinkNote}</p>
            <div className="share-url-box">
              <span className="share-url-text">{shareModal.url}</span>
              <button className="btn btn-sm btn-accent" onClick={() => navigator.clipboard.writeText(shareModal.url)}>{T.copy}</button>
            </div>
            <div className="modal-actions" style={{ marginTop: 20 }}>
              <button className="btn btn-sm btn-danger" onClick={() => { const trip = trips.find(t => t.id === shareModal.tripId); if (trip?.shareToken) revokeShareLink(trip.id, trip.shareToken); }}>{T.revokeLink}</button>
              <button className="btn btn-sm" onClick={() => setShareModal(null)}>{T.close}</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ SHARE ALBUMS MODAL ═══ */}
      {!isReadOnly && shareAlbumsModal && (
        <div className="modal-overlay fade-scale" onClick={() => setShareAlbumsModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <p className="modal-title">{T.shareAlbumsTitle}</p>
            <p className="modal-sub">{T.albumSelected(selectedTrips.size)}</p>
            <ul className="share-albums-list">
              {[...selectedTrips].map(id => {
                const trip = trips.find(t => t.id === id);
                return trip ? (
                  <li key={id}>{trip.name}{trip.date ? ` (${trip.date})` : ''}</li>
                ) : null;
              })}
            </ul>
            <div className="form-group" style={{ marginTop: 16 }}>
              <label>{T.emailAddressesLabel}</label>
              <input
                className="input"
                value={shareEmailsInput}
                onChange={e => setShareEmailsInput(e.target.value)}
                placeholder={T.emailPlaceholder}
                autoFocus
              />
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                {T.emailNote}
              </p>
            </div>
            <div className="modal-actions" style={{ marginTop: 16 }}>
              <button className="btn btn-sm" onClick={() => setShareAlbumsModal(false)}>{T.cancel}</button>
              <button
                className="btn btn-accent"
                onClick={() => {
                  const emails = shareEmailsInput.split(',').map(e => e.trim()).filter(e => e.includes('@'));
                  if (emails.length > 0) shareAlbums(emails);
                }}
                disabled={sharingAlbums || !shareEmailsInput.trim()}
              >
                {sharingAlbums ? T.sharing : T.shareAndNotify}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ SHARE SUCCESS MODAL ═══ */}
      {!isReadOnly && shareSuccess && (
        <div className="modal-overlay fade-scale" onClick={() => setShareSuccess(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 440, textAlign: 'center' }}>
            <p style={{ fontSize: 32, marginBottom: 8 }}>✓</p>
            <p className="modal-title">{T.albumsSharedTitle}</p>
            <p className="modal-sub" style={{ marginBottom: 12 }}>
              {T.accessGrantedTo(shareSuccess.emails.join(', '))}
            </p>
            <ul className="share-albums-list" style={{ textAlign: 'left', marginBottom: 16 }}>
              {shareSuccess.tripNames.map(name => <li key={name}>{name}</li>)}
            </ul>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
              {T.emailClientNote}
            </p>
            <button className="btn btn-accent" onClick={() => setShareSuccess(null)}>{T.accept}</button>
          </div>
        </div>
      )}

      {/* ═══ MANAGE ACCESSES MODAL ═══ */}
      {!isReadOnly && manageAccessesModal && (
        <div className="modal-overlay fade-scale" onClick={() => setManageAccessesModal(false)}>
          <div className="modal manage-accesses-modal" onClick={e => e.stopPropagation()}>
            <p className="modal-title">{T.manageAccessesTitle}</p>
            {loadingShares ? (
              <div style={{ textAlign: 'center', padding: '32px 0' }}><span className="spinner" /></div>
            ) : albumShares.length === 0 ? (
              <p className="modal-sub">{T.noAlbumsSharedYet}</p>
            ) : (
              <div className="manage-shares-list">
                {albumShares.map(share => (
                  <div key={share.id} className="manage-share-item">
                    <div className="manage-share-header">
                      <span className="manage-share-albums">
                        {Object.values(share.tripNames || {}).join(', ') || (share.tripIds || []).join(', ')}
                      </span>
                      {share.createdAt?.seconds && (
                        <span className="manage-share-date">
                          {new Date(share.createdAt.seconds * 1000).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    {(share.emails || []).map(email => (
                      <div key={email} className="manage-share-email-row">
                        <span>{email}</span>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => revokeAlbumAccess(share.id, share.tripIds || [], email)}
                        >
                          {T.revoke}
                        </button>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
            <div className="modal-actions" style={{ marginTop: 16 }}>
              <button className="btn btn-sm" onClick={() => setManageAccessesModal(false)}>{T.close}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
