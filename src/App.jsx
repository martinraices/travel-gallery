import { useState, useEffect, useRef, useCallback } from 'react';
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
      canvas.toBlob((blob) => resolve(blob), 'image/jpeg', quality);
    };
    img.src = URL.createObjectURL(file);
  });
}

export default function App() {
  // ─── Auth ───
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);
  const [creatorMap, setCreatorMap] = useState({}); // { [uid]: email }

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
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef();

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
  const [customPanelLabel, setCustomPanelLabel] = useState(() => localStorage.getItem('customPanelLabel') || '');
  const [customPanelMiro, setCustomPanelMiro] = useState(() => localStorage.getItem('customPanelMiro') || '');
  const [editingPanel, setEditingPanel] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const panelInputRef = useRef(null);

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

  // ─── Migration ───
  const [migration, setMigration] = useState(null); // null | 'needed' | 'running' | 'done' | 'error'
  const [migrationCount, setMigrationCount] = useState(0);
  const [migrationError, setMigrationError] = useState('');

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
      setUser(u);
      setAuthLoading(false);
      // Save email to public profiles/{uid} so other users can look up the creator name
      if (u?.email) {
        setDoc(doc(db, 'profiles', u.uid), { email: u.email, displayName: u.displayName || null }, { merge: true })
          .catch(() => {});
      }
    });
  }, []);

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

  useEffect(() => { if (!user) return; loadTrips(); }, [user]);
  useEffect(() => { if (!activeTrip || !user) { setPhotos([]); return; } loadPhotos(activeTrip); setSelectedPhotos(new Set()); setActiveCity(pendingCityRef.current); pendingCityRef.current = null; }, [activeTrip, user]);

  // Auto-fix: trips with a broken/missing cover — list Storage files directly and get a real URL
  useEffect(() => {
    if (!user || trips.length === 0) return;
    // Run for trips with no cover OR whose current cover returns 404 (we re-run on every load to heal broken covers)
    const needsFix = trips.filter(t => (t.photoCount || 0) > 0 && t.ownerId);
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
  }, [trips.length, user]);

  // ─── Load wishlist from Firestore ───
  useEffect(() => {
    if (!user) { setWishlist(new Set()); return; }
    getDoc(doc(db, 'users', user.uid, 'profile', 'map'))
      .then(snap => { if (snap.exists()) setWishlist(new Set(snap.data().wishlist || [])); })
      .catch(() => {});
  }, [user]);

  // ─── Check for data in old user-scoped path ───
  useEffect(() => {
    if (!user) return;
    getDocs(collection(db, 'users', user.uid, 'trips'))
      .then(snap => { if (!snap.empty) { setMigration('needed'); setMigrationCount(snap.size); } })
      .catch(() => {});
  }, [user]);

  // ─── Sync lightbox description ───
  useEffect(() => { setLbDesc(lightbox?.description || ''); }, [lightbox?.id]);

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
        if (editTrip) { setEditTrip(null); }
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
    setLoggingIn(true);
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') setLoginError('Sign-in failed — please try again');
    }
    setLoggingIn(false);
  };

  // ═══════════════════════════════════════
  // TRIPS
  // ═══════════════════════════════════════
  const tripsCol = () => collection(db, 'trips');

  const loadTrips = async () => {
    setLoadingTrips(true);
    try {
      const [mySnap, sharedSnap] = await Promise.all([
        getDocs(query(tripsCol(), where('ownerId', '==', user.uid))),
        getDocs(query(tripsCol(), where('visibility', '==', 'shared'))),
      ]);
      const seen = new Set();
      const merged = [];
      for (const snap of [mySnap, sharedSnap]) {
        for (const d of snap.docs) {
          if (!seen.has(d.id)) { seen.add(d.id); merged.push({ id: d.id, ...d.data() }); }
        }
      }
      merged.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setTrips(merged);

      // Fetch public profiles for all foreign trip owners
      const unknownUids = [...new Set(
        merged.map(t => t.ownerId).filter(uid => uid && uid !== user.uid)
      )];
      if (unknownUids.length > 0) {
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
    if (!activeTrip || !files.length) return;
    const imageFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (!imageFiles.length) return;
    setUploading(true);
    setUploadCount({ done: 0, total: imageFiles.length });
    const newPhotos = [];
    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];
      try {
        const compressed = await compressImage(file);
        const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
        const storagePath = `users/${user.uid}/trips/${activeTrip}/${fileName}`;
        const storageRef = ref(storage, storagePath);
        await uploadBytes(storageRef, compressed);
        const url = await getDownloadURL(storageRef);
        const photoData = { name: file.name, url, storagePath, createdAt: serverTimestamp() };
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
  }, [activeTrip, user, trips]);

  const deletePhoto = async (photo) => {
    if (photo.storagePath) { try { await deleteObject(ref(storage, photo.storagePath)); } catch {} }
    await deleteDoc(doc(db, 'trips', activeTrip, 'photos', photo.id));
    setPhotos(prev => prev.filter(p => p.id !== photo.id));
    const trip = trips.find(t => t.id === activeTrip);
    if (trip) {
      const newCount = Math.max(0, (trip.photoCount || 1) - 1);
      await updateDoc(doc(db, 'trips', activeTrip), { photoCount: newCount });
      setTrips(prev => prev.map(t => t.id === activeTrip ? { ...t, photoCount: newCount } : t));
    }
    setLightbox(null);
  };

  const savePhotoDesc = async (photoId, desc) => {
    const photo = photos.find(p => p.id === photoId);
    if (!photo || desc === (photo.description || '')) return;
    try {
      await updateDoc(doc(db, 'trips', activeTrip, 'photos', photoId), { description: desc });
      setPhotos(ps => ps.map(p => p.id === photoId ? { ...p, description: desc } : p));
    } catch (err) { console.error('Save desc error:', err); }
  };

  const saveCityToPhotos = async () => {
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
    setSelectedPhotos(prev => {
      const next = new Set(prev);
      next.has(photoId) ? next.delete(photoId) : next.add(photoId);
      return next;
    });
  };

  // ─── Auto-set dates from Facebook ───
  const autoSetDatesFromFb = async () => {
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

          const compressed = await compressImage(file);
          const safeName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
          const storagePath = `users/${user.uid}/trips/${tripId}/${safeName}`;
          const storageRef = ref(storage, storagePath);
          await uploadBytes(storageRef, compressed);
          const url = await getDownloadURL(storageRef);
          if (!coverUrl) coverUrl = url;

          await addDoc(photosCol(tripId), { name: file.name, url, storagePath, city: city || null, createdAt: serverTimestamp() });
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
    if (draggingIdx.current !== null) return;
    handleFiles(e.dataTransfer.files);
  };

  // ═══════════════════════════════════════
  // EDIT TRIP
  // ═══════════════════════════════════════
  const openEditTrip = (trip) => {
    setEditTrip(trip);
    setEditName(trip.name);
    setEditDate(trip.date || '');
    setEditCountry(trip.country || '');
    setEditMiro(trip.miroUrl || '');
    setEditVisibility(trip.visibility || 'shared');
  };

  const saveEditTrip = async () => {
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
    const tripData = trips.find(t => t.id === activeTrip);
    const vis = tripData?.cityMetadata?.[cityName]?.visibility || tripData?.visibility || 'shared';
    setEditCity({ tripId: activeTrip, cityName });
    setEditCityName(cityName);
    setEditCityVisibility(vis);
  };

  const saveEditCity = async () => {
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

  // ═══════════════════════════════════════
  // STATS
  // ═══════════════════════════════════════
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
      return (
        <div className="stat-panel fade-in">
          <div className="stat-panel-header">
            <span>All Trips</span>
            <button className="stat-panel-close" onClick={() => setStatPanel(null)}>✕</button>
          </div>
          {trips.map(trip => (
            <div key={trip.id} className="stat-panel-row" onClick={() => { setActiveTrip(trip.id); setStatPanel(null); }}>
              <span className="stat-panel-name">{trip.name}</span>
              {trip.date && <span className="stat-panel-meta">{trip.date}</span>}
            </div>
          ))}
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
          <span>{statPanel === 'countries' ? 'Countries Visited' : 'Wishlist'}</span>
          <button className="stat-panel-close" onClick={() => setStatPanel(null)}>✕</button>
        </div>
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
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>This shared link is no longer valid.</p>
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
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Shared gallery</span>
        </header>
        <div className="content fade-in">
          <div className="gallery-header">
            <div>
              <span className="gallery-title heading">{publicShareData.tripName}</span>
              {publicShareData.tripDate && <span className="gallery-date">{publicShareData.tripDate}</span>}
            </div>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{pubPhotos.length} photos</span>
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
  // LOGIN SCREEN
  // ═══════════════════════════════════════
  if (!user) {
    return (
      <div className="login-page">
        <div className="login-card fade-scale">
          <img src="/logo.png" alt="Pepini per il mondo" className="login-logo-img" />
          <p className="login-sub">Sign in to access your private gallery</p>
          <button onClick={handleGoogleLogin} className="btn-google" disabled={loggingIn}>
            {loggingIn
              ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Signing in…</>
              : <><svg width="20" height="20" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>Continue with Google</>
            }
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
  const { groups: cityGroups, uncategorized: cityUncategorized, hasCities } = groupPhotosByCity(photos);
  const showCityCards = hasCities && activeCity === null;

  return (
    <div>
      {/* ─── Header ─── */}
      <header className="header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div className="header-logo-wrap" onClick={() => setActiveTrip(null)}>
            <img src="/logo.png" alt="Pepini per il mondo" className="header-logo-img" />
            <span className="header-logo heading">Pepini per il mondo</span>
          </div>
        </div>
        <div className="header-actions">
          {!activeTrip && <button className="btn btn-facebook" onClick={() => { setFbStep('folder'); setFbError(''); setFbModal(true); }}>↓ Facebook</button>}
          {!activeTrip && <button className="btn btn-accent" onClick={() => setShowNewTrip(true)}>+ New Trip</button>}
          {activeTrip && (
            <button className="btn btn-accent" onClick={() => fileRef.current?.click()} disabled={uploading}>
              {uploading ? `Uploading ${uploadCount.done}/${uploadCount.total}…` : '+ Add Photos'}
            </button>
          )}
          <button className="btn-icon" onClick={() => setDarkMode(d => !d)} title={darkMode ? 'Light mode' : 'Dark mode'}>
            {darkMode
              ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
              : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            }
          </button>
          <button className="btn-icon" onClick={() => signOut(auth)} title="Sign out">
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

      <div className="content">

        {/* ═══ MIGRATION BANNER ═══ */}
        {(migration === 'needed' || migration === 'running' || migration === 'done' || migration === 'error') && !activeTrip && (
          <div className={`migration-banner fade-in ${migration}`}>
            {migration === 'needed' && (
              <>
                <span>
                  <strong>{migrationCount} album{migrationCount !== 1 ? 's' : ''}</strong> found in your old private library. Migrate them to the shared gallery so everyone can see them.
                </span>
                <button className="btn btn-accent btn-sm" onClick={runMigration}>Migrate now</button>
              </>
            )}
            {migration === 'running' && (
              <><span className="spinner" style={{ width: 16, height: 16 }} /><span>Migrating albums… do not close this tab.</span></>
            )}
            {migration === 'done' && (
              <><span>✓ Migration complete — all albums are now in the shared gallery.</span><button className="migration-dismiss" onClick={() => setMigration(null)}>✕</button></>
            )}
            {migration === 'error' && (
              <><span>Migration failed: {migrationError || 'unknown error'}</span><button className="btn btn-sm" onClick={runMigration}>Retry</button><button className="migration-dismiss" onClick={() => setMigration(null)}>✕</button></>
            )}
          </div>
        )}

        {/* ═══ TRIP LIST ═══ */}
        {!activeTrip && (
          <div className="fade-in">

            {/* ─ New Trip Form ─ */}
            {showNewTrip && (
              <div className="new-trip-form fade-scale">
                <div className="form-group">
                  <label>Trip Name</label>
                  <input value={newTripName} onChange={e => setNewTripName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addTrip()}
                    placeholder="e.g. Patagonia 2024" className="input" autoFocus />
                </div>
                <div className="form-group" style={{ flex: '0 0 160px' }}>
                  <label>Date (optional)</label>
                  <input type="date" value={newTripDate} onChange={e => setNewTripDate(e.target.value)} className="input" />
                </div>
                <div className="form-group" style={{ flex: '0 0 180px' }}>
                  <label>Country (optional)</label>
                  <input list="countries-list" value={newTripCountry} onChange={e => setNewTripCountry(e.target.value)} placeholder="e.g. Italy" className="input" />
                  <datalist id="countries-list">{WORLD_COUNTRIES.map(c => <option key={c} value={c} />)}</datalist>
                </div>
                <div className="form-group" style={{ flex: '0 0 440px' }}>
                  <label>Miro link (optional)</label>
                  <input value={newTripMiro} onChange={e => setNewTripMiro(e.target.value)} placeholder="https://miro.com/…" className="input" />
                </div>
                <div className="form-group" style={{ flex: '0 0 auto' }}>
                  <label>Visibility</label>
                  <div className="vis-toggle">
                    <button className={`vis-btn${newTripVisibility === 'shared' ? ' active' : ''}`} onClick={() => setNewTripVisibility('shared')}>🌍 Shared</button>
                    <button className={`vis-btn${newTripVisibility === 'private' ? ' active' : ''}`} onClick={() => setNewTripVisibility('private')}>🔒 Private</button>
                  </div>
                </div>
                <button onClick={addTrip} className="btn btn-accent">Create</button>
                <button onClick={() => { setShowNewTrip(false); setNewTripName(''); setNewTripDate(''); setNewTripCountry(''); setNewTripMiro(''); setNewTripVisibility('shared'); }} className="btn btn-sm">Cancel</button>
              </div>
            )}

            {/* ─ Stats ─ */}
            {trips.length > 0 && (
              <>
                <div className="stats-bar fade-in">
                  <div className={`stat-card stat-card-btn${statPanel === 'trips' ? ' stat-active' : ''}`} onClick={() => setStatPanel(p => p === 'trips' ? null : 'trips')}>
                    <div className="stat-value">{trips.length}</div><div className="stat-label">Trips</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">{totalPhotos}</div><div className="stat-label">Photos</div>
                  </div>
                  {countriesVisited > 0 && (
                    <div className={`stat-card stat-card-btn${statPanel === 'countries' ? ' stat-active' : ''}`} onClick={() => setStatPanel(p => p === 'countries' ? null : 'countries')}>
                      <div className="stat-value">{countriesVisited}</div><div className="stat-label">Countries</div>
                    </div>
                  )}
                  {wishlist.size > 0 && (
                    <div className={`stat-card stat-card-btn${statPanel === 'wishlist' ? ' stat-active' : ''}`} onClick={() => setStatPanel(p => p === 'wishlist' ? null : 'wishlist')}>
                      <div className="stat-value">{wishlist.size}</div><div className="stat-label">Wishlist</div>
                    </div>
                  )}
                  {topTrip && topTrip.photoCount > 0 && (
                    <div
                      className="stat-card stat-card-wide stat-card-btn"
                      style={{ position: 'relative' }}
                      onClick={() => !editingPanel && setEditingPanel(true)}
                      title="Clic para editar el nombre"
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
                                localStorage.setItem('customPanelLabel', e.target.value);
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
                              title="Insertar emoji"
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
                                      localStorage.setItem('customPanelLabel', newVal);
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
                            placeholder="Miro link (optional)"
                            onChange={e => {
                              setCustomPanelMiro(e.target.value);
                              localStorage.setItem('customPanelMiro', e.target.value);
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
                              title="Open in Miro"
                              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, borderRadius: 5, background: '#FFD02F', color: '#1a1a1a', textDecoration: 'none', flexShrink: 0, fontWeight: 800, fontSize: 14, lineHeight: 1, fontFamily: 'system-ui, sans-serif' }}
                            >M</a>
                          )}
                          <div className="stat-value stat-value-sm">{customPanelLabel || topTrip.name}</div>
                        </div>
                      )}

                      {!editingPanel && <span style={{ position: 'absolute', top: 8, right: 10, fontSize: 12, opacity: 0.4 }}>✎</span>}
                    </div>
                  )}
                </div>
                {renderStatPanel()}
              </>
            )}

            {/* ─ View toggle ─ */}
            {trips.length > 0 && (
              <div className="trips-view-header">
                <div className="view-toggle">
                  <button className={`view-btn ${tripsView === 'grid' ? 'active' : ''}`} onClick={() => setTripsView('grid')} title="Grid view">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><rect x="0" y="0" width="6" height="6" rx="1"/><rect x="8" y="0" width="6" height="6" rx="1"/><rect x="0" y="8" width="6" height="6" rx="1"/><rect x="8" y="8" width="6" height="6" rx="1"/></svg>
                  </button>
                  {hasMapData && <button className={`view-btn ${tripsView === 'map' ? 'active' : ''}`} onClick={() => setTripsView('map')} title="Map view">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"><path d="M1 2.5l4-1.5 4 1.5 4-1.5v10l-4 1.5-4-1.5-4 1.5V2.5z"/><line x1="5" y1="1" x2="5" y2="11.5"/><line x1="9" y1="2.5" x2="9" y2="13"/></svg>
                  </button>}
                </div>
              </div>
            )}

            {loadingTrips && <div style={{ textAlign: 'center', padding: 60 }}><span className="spinner" /></div>}

            {!loadingTrips && trips.length === 0 && !showNewTrip && (
              <div className="empty">
                <div className="empty-icon">✈</div>
                <p className="empty-title heading">No trips yet</p>
                <p className="empty-sub">Create your first trip to start uploading photos.</p>
                <button className="btn btn-accent" onClick={() => setShowNewTrip(true)}>+ New Trip</button>
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
                              isWished  ? `${geo.properties.name} — ★ Wishlist` :
                              geo.properties.name
                            )}
                            onMouseLeave={() => setMapTooltip('')}
                            onClick={() => {
                              if (isVisited && trip) { setActiveTrip(trip.id); setTripsView('grid'); }
                              else toggleWishlist(iso);
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
                {trips.map((trip, i) => {
                  const isOwner = !trip.ownerId || trip.ownerId === user.uid;
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
                          title={trip.shareToken ? 'Shared — click to see link' : 'Share this trip'}
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
                          <span className="trip-vis-icon" title={trip.visibility === 'private' ? 'Private' : 'Shared'}>
                            {trip.visibility === 'private' ? '🔒' : '🌍'}
                          </span>
                          {isOwner && <button className="trip-edit-btn" title="Edit trip" onClick={e => { e.stopPropagation(); openEditTrip(trip); }}>✎</button>}
                        </div>
                      </div>
                      <div className="trip-meta">
                        {trip.country ? `${trip.country}${trip.date || trip.photoCount ? ' · ' : ''}` : ''}
                        {trip.date ? `${trip.date} · ` : ''}
                        {trip.photoCount || 0} photo{(trip.photoCount || 0) !== 1 ? 's' : ''}
                      </div>
                      {creatorUsername
                        ? <div className="trip-creator">Created by {creatorUsername}</div>
                        : !isOwner && (
                          <div className="trip-creator trip-creator-unknown"
                            onClick={async e => {
                              e.stopPropagation();
                              const name = window.prompt('Who created this album? (enter their Gmail username or email)');
                              if (!name?.trim()) return;
                              const email = name.includes('@') ? name.trim() : `${name.trim()}@gmail.com`;
                              try {
                                await updateDoc(doc(db, 'trips', trip.id), { ownerEmail: email });
                                setTrips(prev => prev.map(t => t.id === trip.id ? { ...t, ownerEmail: email } : t));
                              } catch (err) { alert('Could not save: ' + err.message); }
                            }}>
                            + Set creator
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
                    {' / '}{activeCity === '__uncategorized__' ? 'No city assigned' : activeCity}
                  </span>
                )}
                {activeTripData.date && <span className="gallery-date">{activeTripData.date}</span>}
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {activeCity !== null
                  ? <button className="btn btn-sm" onClick={() => { setActiveCity(null); setSelectedPhotos(new Set()); }}>← {activeTripData.name}</button>
                  : <button className="btn btn-sm" onClick={() => setActiveTrip(null)}>← Trips</button>
                }
                {activeTripData.miroUrl && (
                  <a href={activeTripData.miroUrl} target="_blank" rel="noopener noreferrer" className="btn btn-sm miro-link">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                    Miro
                  </a>
                )}
                <button className={`btn btn-sm ${activeTripData.shareToken ? 'btn-accent' : ''}`}
                  onClick={() => generateShareLink(activeTripData)} disabled={shareGenerating === activeTrip}>
                  {shareGenerating === activeTrip ? 'Generating…' : activeTripData.shareToken ? '↗ Shared' : '↗ Share'}
                </button>
                {!showCityCards && (
                  <>
                    {selectedPhotos.size > 0 && (
                      <button className="btn btn-accent btn-sm" onClick={() => { setCityInput(''); setCityModal(true); }}>
                        Save Changes ({selectedPhotos.size})
                      </button>
                    )}
                    <div className="view-toggle">
                      <button className={`view-btn ${view === 'grid' ? 'active' : ''}`} onClick={() => { setView('grid'); setSelectedPhotos(new Set()); }}>Grid</button>
                      <button className={`view-btn ${view === 'list' ? 'active' : ''}`} onClick={() => setView('list')}>List</button>
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
                  const isOwner = !activeTripData?.ownerId || activeTripData?.ownerId === user?.uid;
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
                            <span className="trip-vis-icon" title={cityVis === 'private' ? 'Private' : 'Shared'}>
                              {cityVis === 'private' ? '🔒' : '🌍'}
                            </span>
                            {isOwner && (
                              <button className="trip-edit-btn" title="Edit sub-album"
                                onClick={e => { e.stopPropagation(); openEditCity(city); }}>✎</button>
                            )}
                          </div>
                        </div>
                        <div className="trip-meta">{cityGroups[city].length} photo{cityGroups[city].length !== 1 ? 's' : ''}</div>
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
                        <div className="trip-name" style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>No city assigned</div>
                        <div className="trip-meta">{cityUncategorized.length} photo{cityUncategorized.length !== 1 ? 's' : ''}</div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* ─ Photo views (flat, inside a city or when no cities set) ─ */}
            {!showCityCards && (
              <>
                {uploading && <div className="upload-progress"><span className="spinner" />Uploading {uploadCount.done} of {uploadCount.total} photos…</div>}
                {loadingPhotos && <div style={{ textAlign: 'center', padding: 60 }}><span className="spinner" /></div>}
                {!loadingPhotos && displayPhotos.length === 0 && !uploading && (
                  <div className={`drop-zone ${dragging ? 'dragging' : ''}`} onClick={() => fileRef.current?.click()}
                    onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}>
                    <div className="drop-zone-icon">📷</div>
                    <p style={{ fontSize: 15, marginBottom: 4 }}>Drag & drop photos here</p>
                    <p style={{ fontSize: 12 }}>or click to browse</p>
                  </div>
                )}

                {displayPhotos.length > 0 && view === 'grid' && (() => {
                  const canDrag = activeCity === null;
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
                            onClick={() => setLightbox(p)}>
                            <img src={p.url} alt={p.name} loading="lazy" />
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
                        style={{ animationDelay: `${i * 25}ms` }}>
                        <input type="checkbox" className="photo-list-check"
                          checked={selectedPhotos.has(p.id)}
                          onChange={() => togglePhotoSelection(p.id)}
                          onClick={e => e.stopPropagation()} />
                        <img src={p.url} alt={p.name} loading="lazy" onClick={() => setLightbox(p)} style={{ cursor: 'pointer' }} />
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
          <div className="lb-desc-wrap" onClick={e => e.stopPropagation()}>
            <textarea
              className="lb-desc"
              placeholder="Add a description…"
              value={lbDesc}
              onChange={e => setLbDesc(e.target.value)}
              onBlur={() => savePhotoDesc(lightbox.id, lbDesc)}
            />
          </div>
          <button className="lb-delete" onClick={e => { e.stopPropagation(); deletePhoto(lightbox); }} title="Delete photo">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </button>
        </div>
      )}

      {/* ═══ DELETE TRIP ═══ */}
      {confirmDelete && (
        <div className="modal-overlay fade-scale" onClick={() => setConfirmDelete(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <p className="modal-title">Delete this trip?</p>
            <p className="modal-sub">All photos will be permanently deleted from storage.</p>
            <div className="modal-actions">
              <button className="btn btn-sm" onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => deleteTrip(confirmDelete)}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ EDIT TRIP ═══ */}
      {editTrip && (
        <div className="modal-overlay fade-scale" onClick={() => setEditTrip(null)}>
          <div className="modal edit-modal" onClick={e => e.stopPropagation()}>
            <p className="modal-title" style={{ marginBottom: 16 }}>Edit Trip</p>
            <div className="edit-modal-fields">
              <div className="form-group">
                <label>Name</label>
                <input value={editName} onChange={e => setEditName(e.target.value)} onKeyDown={e => e.key === 'Enter' && saveEditTrip()} className="input" autoFocus />
              </div>
              <div className="form-group" style={{ flex: '0 0 150px' }}>
                <label>Date</label>
                <input type="date" value={editDate} onChange={e => setEditDate(e.target.value)} className="input" />
              </div>
              <div className="form-group" style={{ flex: '0 0 160px' }}>
                <label>Country</label>
                <input list="countries-list-edit" value={editCountry} onChange={e => setEditCountry(e.target.value)} placeholder="e.g. Italy" className="input" />
                <datalist id="countries-list-edit">{WORLD_COUNTRIES.map(c => <option key={c} value={c} />)}</datalist>
              </div>
              <div className="form-group" style={{ flex: '0 0 400px' }}>
                <label>Miro link</label>
                <input value={editMiro} onChange={e => setEditMiro(e.target.value)} placeholder="https://miro.com/…" className="input" />
              </div>
              <div className="form-group" style={{ flex: '0 0 auto' }}>
                <label>Visibility</label>
                <div className="vis-toggle">
                  <button className={`vis-btn${editVisibility === 'shared' ? ' active' : ''}`} onClick={() => setEditVisibility('shared')}>🌍 Shared</button>
                  <button className={`vis-btn${editVisibility === 'private' ? ' active' : ''}`} onClick={() => setEditVisibility('private')}>🔒 Private</button>
                </div>
              </div>
            </div>
            <div className="modal-actions" style={{ marginTop: 16 }}>
              <button className="btn btn-sm" onClick={() => setEditTrip(null)}>Cancel</button>
              <button className="btn btn-accent" onClick={saveEditTrip} disabled={editSaving || !editName.trim()}>{editSaving ? 'Saving…' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ EDIT CITY SUB-ALBUM MODAL ═══ */}
      {editCity && (
        <div className="modal-overlay fade-scale" onClick={() => setEditCity(null)}>
          <div className="modal edit-modal" onClick={e => e.stopPropagation()}>
            <p className="modal-title" style={{ marginBottom: 16 }}>Edit Sub-Album</p>
            <div className="edit-modal-fields">
              <div className="form-group">
                <label>Name</label>
                <input value={editCityName} onChange={e => setEditCityName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && saveEditCity()} className="input" autoFocus />
              </div>
              <div className="form-group" style={{ flex: '0 0 auto' }}>
                <label>Visibility</label>
                <div className="vis-toggle">
                  <button className={`vis-btn${editCityVisibility === 'shared' ? ' active' : ''}`}
                    onClick={() => setEditCityVisibility('shared')}>🌍 Shared</button>
                  <button className={`vis-btn${editCityVisibility === 'private' ? ' active' : ''}`}
                    onClick={() => setEditCityVisibility('private')}>🔒 Private</button>
                </div>
              </div>
            </div>
            <div className="modal-actions" style={{ marginTop: 16 }}>
              <button className="btn btn-sm" onClick={() => setEditCity(null)}>Cancel</button>
              <button className="btn btn-accent" onClick={saveEditCity}
                disabled={editCitySaving || !editCityName.trim()}>
                {editCitySaving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ CITY ASSIGN MODAL ═══ */}
      {cityModal && (
        <div className="modal-overlay fade-scale" onClick={() => setCityModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <p className="modal-title">Assign city</p>
            <p className="modal-sub">{selectedPhotos.size} photo{selectedPhotos.size !== 1 ? 's' : ''} selected</p>
            <input
              className="input"
              value={cityInput}
              onChange={e => setCityInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && saveCityToPhotos()}
              placeholder="e.g. Beijing"
              autoFocus
            />
            <div className="modal-actions" style={{ marginTop: 16 }}>
              <button className="btn btn-sm" onClick={() => setCityModal(false)}>Cancel</button>
              <button className="btn btn-accent" onClick={saveCityToPhotos}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ AUTO-DATE MODAL ═══ */}
      {autoDateModal && (
        <div className="modal-overlay fade-scale" onClick={() => autoDateModal === 'done' && setAutoDateModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            {autoDateModal === 'running' && (
              <>
                <p className="modal-title">Setting travel dates…</p>
                <div style={{ textAlign: 'center', padding: '20px 0' }}><span className="spinner" /></div>
                <p className="modal-sub">Scanning Facebook albums for photo dates.</p>
              </>
            )}
            {autoDateModal === 'done' && (
              <>
                <p className="modal-title">Done</p>
                <p className="modal-sub">
                  {autoDateUpdated > 0
                    ? `Updated ${autoDateUpdated} trip${autoDateUpdated !== 1 ? 's' : ''} from ${autoDateScanned} album${autoDateScanned !== 1 ? 's' : ''} scanned.`
                    : autoDateScanned === 0
                      ? 'No Facebook albums could be read. Check that you selected the correct folder.'
                      : `Scanned ${autoDateScanned} album${autoDateScanned !== 1 ? 's' : ''} but no dates were found in the photos. The export format may not include "taken" dates.`}
                </p>
                <div className="modal-actions" style={{ marginTop: 16 }}>
                  <button className="btn btn-accent" onClick={() => setAutoDateModal(false)}>Close</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ═══ FACEBOOK IMPORT MODAL ═══ */}
      {fbModal && (
        <div className="modal-overlay fade-scale" onClick={() => fbStep !== 'import' && setFbModal(false)}>
          <div className="modal fb-import-modal" onClick={e => e.stopPropagation()}>

            {fbStep === 'folder' && (
              <>
                <p className="modal-title">Import from Facebook</p>
                <p className="modal-sub">Select your <code>your_facebook_activity</code> folder (or its parent) from your Facebook data export. Chrome/Edge only.</p>
                {fbError && <p className="fb-error">{fbError}</p>}
                <div className="modal-actions" style={{ marginTop: 20 }}>
                  <button className="btn btn-sm" onClick={() => setFbModal(false)}>Cancel</button>
                  <button className="btn btn-accent" onClick={scanFbFolder}>Scan folder…</button>
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
                  <p className="modal-title">Select cities to import</p>
                  <p className="modal-sub">
                    {availableRows.length} cities available · {selectedCount} selected · {uniqueAlbums} album{uniqueAlbums !== 1 ? 's' : ''}
                    {hiddenCount > 0 && <span style={{ color: 'var(--text-muted)', marginLeft: 6 }}>· {hiddenCount} already imported</span>}
                  </p>
                  <div className="fb-filter-bar">
                    <input className="input" value={fbFilter} onChange={e => setFbFilter(e.target.value)} placeholder="Filter by city or album…" />
                    <button className="btn btn-sm" onClick={() => setFbSelected(new Set(availableRows.map(r => r.id)))}>All</button>
                    <button className="btn btn-sm" onClick={() => setFbSelected(new Set())}>None</button>
                  </div>
                  <div className="fb-list-header">
                    <span className="fb-lh-check" />
                    <span className="fb-lh-city">City</span>
                    <span className="fb-lh-album">Album</span>
                    <span className="fb-lh-photos">Photos</span>
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
                          placeholder="Album name"
                        />
                        <span className="fb-row-photos">{r.photoCount || '–'}</span>
                      </label>
                    ))}
                  </div>
                  <div className="modal-actions" style={{ marginTop: 12 }}>
                    <button className="btn btn-sm" onClick={() => setFbModal(false)}>Cancel</button>
                    <button className="btn btn-accent" onClick={handleFbImportClick} disabled={selectedCount === 0}>
                      Import {selectedCount} cit{selectedCount !== 1 ? 'ies' : 'y'}
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
                  <p className="modal-title">Importing…</p>
                  <div className="fb-eta-bar">
                    <span>{fbTotalDone} / {totalPhotos || '?'} photos</span>
                    {isScanning && <span className="fb-eta-scanning">Scanning albums…</span>}
                    {!isScanning && etaMs > 0 && (
                      <span className="fb-eta-time">~{formatTime(etaMs)} remaining</span>
                    )}
                    {!isScanning && fbTotalDone > 0 && elapsed > 0 && (
                      <span className="fb-eta-elapsed">Elapsed: {formatTime(elapsed)}</span>
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
                            ? <div className="fb-progress-waiting">Scanning…</div>
                            : prog.total > 0 ? (
                              <div className="fb-progress-bar-wrap">
                                <div className="fb-progress-bar" style={{ width: `${pct}%` }} />
                                <span className="fb-progress-label">{prog.done} / {prog.total}</span>
                              </div>
                            ) : <div className="fb-progress-waiting">Waiting…</div>}
                        </div>
                      );
                    })}
                  </div>
                  <div className="modal-actions" style={{ marginTop: 12 }}>
                    <button className="btn btn-sm btn-danger" onClick={() => { fbCancelRef.current = true; }}>Stop import</button>
                  </div>
                </>
              );
            })()}

            {fbStep === 'done' && (
              <>
                <p className="modal-title">Import complete</p>
                <p className="modal-sub">{fbTotalDone} photos imported into {fbSelected.size} trip{fbSelected.size !== 1 ? 's' : ''}.</p>
                <div className="modal-actions" style={{ marginTop: 20 }}>
                  <button className="btn btn-accent" onClick={() => { setFbModal(false); loadTrips(); }}>Done</button>
                </div>
              </>
            )}

          </div>
        </div>
      )}

      {/* ═══ SHARE MODAL ═══ */}
      {shareModal && (
        <div className="modal-overlay fade-scale" onClick={() => setShareModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 460 }}>
            <p className="modal-title">Share Trip</p>
            <p className="modal-sub">Anyone with this link can view the photos — no login required.</p>
            <div className="share-url-box">
              <span className="share-url-text">{shareModal.url}</span>
              <button className="btn btn-sm btn-accent" onClick={() => navigator.clipboard.writeText(shareModal.url)}>Copy</button>
            </div>
            <div className="modal-actions" style={{ marginTop: 20 }}>
              <button className="btn btn-sm btn-danger" onClick={() => { const trip = trips.find(t => t.id === shareModal.tripId); if (trip?.shareToken) revokeShareLink(trip.id, trip.shareToken); }}>Revoke link</button>
              <button className="btn btn-sm" onClick={() => setShareModal(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
