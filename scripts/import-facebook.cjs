#!/usr/bin/env node
'use strict';

const admin = require('firebase-admin');
const fs    = require('fs');
const path  = require('path');
const crypto = require('crypto');

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const SERVICE_ACCOUNT = 'C:/Dev/Temp/wanderlust-gallery-firebase-adminsdk-fbsvc-d2882f4d19.json';
const FB_BASE         = 'C:/Dev/Temp/your_facebook_activity';
const PHOTOS_HTML     = path.join(FB_BASE, 'posts/your_photos.html');
const ALBUM_DIR       = path.join(FB_BASE, 'posts/album');
const STORAGE_BUCKET  = 'wanderlust-gallery.firebasestorage.app';
const OWNER_EMAIL     = 'raicesm@gmail.com';
const CONCURRENCY     = 5;
const PROGRESS_FILE   = path.join(__dirname, 'import-progress.json');

// ─── FIREBASE INIT ───────────────────────────────────────────────────────────
admin.initializeApp({
  credential:    admin.credential.cert(require(SERVICE_ACCOUNT)),
  storageBucket: STORAGE_BUCKET,
});
const db     = admin.firestore();
const bucket = admin.storage().bucket();

// ─── SKIP LIST ───────────────────────────────────────────────────────────────
const SKIP_CONTAINS = [
  'CamWow', 'InstaEdit', 'Instagram Photos', 'Mobile uploads',
  'Profile pictures', 'INGENIERO', 'Tania conoce',
];
const SKIP_EXACT = ['Photos', 'Cover photos', 'TANIA!'];

function shouldSkip(name) {
  if (SKIP_EXACT.includes(name)) return true;
  return SKIP_CONTAINS.some(s => name.includes(s));
}

// ─── HARDCODED OVERRIDES for edge cases ──────────────────────────────────────
const OVERRIDES = {
  // Morocco trip – merging Casablanca parts
  'Casablanca 2009':             { trip: 'Marruecos 2009', city: 'Casablanca',                    country: 'Morocco' },
  'Casablanca 2009  - Parte 2':  { trip: 'Marruecos 2009', city: 'Casablanca',                    country: 'Morocco' },
  // Morocco trip – merging Fes parts
  'Fes 2009':                    { trip: 'Marruecos 2009', city: 'Fes',                           country: 'Morocco' },
  'Fes 2009 - Parte 2':          { trip: 'Marruecos 2009', city: 'Fes',                           country: 'Morocco' },
  // Morocco trip – merging D'Ozour parts
  "D'Ozour 2009":                { trip: 'Marruecos 2009', city: "D'Ozour",                       country: 'Morocco' },
  "D'Ozour 2009 Parte 2":        { trip: 'Marruecos 2009', city: "D'Ozour",                       country: 'Morocco' },
  // Egypt trip – merging Luxor parts
  'Luxor 2007 - Parte 1':        { trip: 'Egypt 2007',     city: 'Luxor',                         country: 'Egypt' },
  'Luxor 2007 - Parte 2':        { trip: 'Egypt 2007',     city: 'Luxor',                         country: 'Egypt' },
  'Luxor 2007 - Parte 3':        { trip: 'Egypt 2007',     city: 'Luxor',                         country: 'Egypt' },
  // USA – merging 3 parts
  'USA 2013 Part 1':             { trip: 'USA 2013',        city: null,                            country: 'United States' },
  'USA 2013 Part 2':             { trip: 'USA 2013',        city: null,                            country: 'United States' },
  'USA 2013 Part 3':             { trip: 'USA 2013',        city: null,                            country: 'United States' },
  // Misc edge cases
  'Panamá 2013 - daytrip':       { trip: 'Panama 2013',    city: null,                            country: 'Panama' },
  'Rascafria 2010 - Madrid':     { trip: 'Spain 2010',     city: 'Rascafria',                     country: 'Spain' },
  'Isla de San Andrés 2014 , Colombia': { trip: 'Colombia 2014', city: 'San Andres',              country: 'Colombia' },
  'Cusco, Machu Pichu y Lima 2016':     { trip: 'Peru 2016',     city: 'Cusco, Machu Pichu y Lima', country: 'Peru' },
  'Copenhagen 2016,  Denmark':   { trip: 'Denmark 2016',   city: 'Copenhagen',                    country: 'Denmark' },
  'Cinque terre, Portofino and Genova': { trip: 'Italy 2008',    city: 'Cinque terre, Portofino and Genova', country: 'Italy' },
};

// ─── COUNTRY INFERENCE ───────────────────────────────────────────────────────
const COUNTRY_KEYWORDS = {
  'Australia': 'Australia', 'New Zealand': 'New Zealand', 'Israel': 'Israel',
  'Vietnam': 'Vietnam', 'Spain': 'Spain', 'Myanmar': 'Myanmar',
  'Thailand': 'Thailand', 'Malaysia': 'Malaysia', 'Norway': 'Norway',
  'Iceland': 'Iceland', 'Scotland': 'Scotland', 'Cyprus': 'Cyprus',
  'Brasil': 'Brazil', 'Brazil': 'Brazil', 'Marruecos': 'Morocco',
  'Morocco': 'Morocco', 'Egypt': 'Egypt', 'Colombia': 'Colombia',
  'Peru': 'Peru', 'Denmark': 'Denmark', 'Italy': 'Italy',
  'USA': 'United States', 'Panama': 'Panama', 'Bulgaria': 'Bulgaria',
  'Argentina': 'Argentina', 'Uruguay': 'Uruguay', 'Chile': 'Chile',
  'France': 'France', 'Paris': 'France', 'Germany': 'Germany',
  'Münich': 'Germany', 'Berlin': 'Germany', 'Portugal': 'Portugal',
  'Madeira': 'Portugal', 'Greece': 'Greece', 'Santorini': 'Greece',
  'Atenas': 'Greece', 'Irlanda': 'Ireland', 'Ireland': 'Ireland',
  'Galway': 'Ireland', 'Istanbul': 'Turkey', 'Dubai': 'Dubai',
  'Singapore': 'Singapore', 'Hong Kong': 'China',
  'London': 'United Kingdom', 'Londres': 'United Kingdom',
  'Oxford': 'United Kingdom', 'Bournemouth': 'United Kingdom',
  'Edinburgh': 'United Kingdom', 'Edimburgo': 'United Kingdom',
  'Budapest': 'Hungary', 'Praga': 'Czech Republic', 'Prague': 'Czech Republic',
  'Vienna': 'Austria', 'Warsaw': 'Poland', 'Kraków': 'Poland',
  'Riga': 'Latvia', 'Tallinn': 'Estonia', 'Vilnius': 'Lithuania',
  'Kiev': 'Ukraine', 'Ljubljana': 'Slovenia', 'Zagreb': 'Croatia',
  'Dubrovnik': 'Croatia', 'Malta': 'Malta', 'Lanzarote': 'Spain',
  'Mallorca': 'Spain', 'Tenerife': 'Spain', 'Ibiza': 'Spain',
  'Gran Canaria': 'Spain', 'Rio de Janeiro': 'Brazil', 'Mendoza': 'Argentina',
  'Rosario': 'Argentina', 'Buenos Aires': 'Argentina', 'Carlos Paz': 'Argentina',
  'Tandil': 'Argentina', 'Villa General Belgrano': 'Argentina',
  'Siem Reap': 'Cambodia', 'Luxembourg': 'Luxembourg', 'Helsinki': 'Finland',
  'Reykjavik': 'Iceland', 'Bergen': 'Norway', 'Kiev': 'Ukraine',
  'Aswan': 'Egypt', 'El Cairo': 'Egypt', 'Luxor': 'Egypt',
  'Essaouira': 'Morocco', 'Rabat': 'Morocco', 'Marrakesh': 'Morocco',
  'Fes': 'Morocco', 'Casablanca': 'Morocco', 'West Bank': 'Palestine',
  'Palestina': 'Palestine', 'Madrid': 'Spain', 'Barcelona': 'Spain',
  'Sevilla': 'Spain', 'Segovia': 'Spain', 'Toledo': 'Spain',
  'Malaga': 'Spain', 'Granada': 'Spain', 'Florencia': 'Italy',
  'Roma': 'Italy', 'Venezia': 'Italy', 'Napoli': 'Italy',
  'Padova': 'Italy', 'Brujas': 'Belgium', 'Amsterdam': 'Netherlands',
  'Ginebra': 'Switzerland', 'Gruyeres': 'Switzerland', 'Switzerland': 'Switzerland',
  'Niza': 'France', 'Cannes': 'France',
};

function inferCountry(name) {
  for (const [kw, country] of Object.entries(COUNTRY_KEYWORDS)) {
    if (name.includes(kw)) return country;
  }
  return null;
}

// ─── ALBUM NAME PARSER ───────────────────────────────────────────────────────
function parseAlbumTitle(rawTitle) {
  const name = rawTitle.replace(/&amp;/g, '&').replace(/&#039;/g, "'").trim();

  if (shouldSkip(name)) return null;
  if (OVERRIDES[name]) return { ...OVERRIDES[name], rawName: name };

  let m;

  // "City Year (Country)"
  m = name.match(/^(.+?)\s+(\d{4})\s+\(([^)]+)\)$/);
  if (m) {
    return { trip: `${m[3].trim()} ${m[2]}`, city: m[1].trim(), country: m[3].trim(), rawName: name };
  }

  // "City, Country Year"
  m = name.match(/^(.+?),\s+([A-Za-z ]+?)\s+(\d{4})$/);
  if (m) {
    return { trip: `${m[2].trim()} ${m[3]}`, city: m[1].trim(), country: m[2].trim(), rawName: name };
  }

  // "Name Year - Suffix"  →  trip=Name Year, city=Suffix (only if suffix looks like a place, not "Part N" etc.)
  m = name.match(/^(.+?)\s+(\d{4})\s+-\s+(.+)$/);
  if (m) {
    const suffix = m[3].trim();
    const tripBase = `${m[1].trim()} ${m[2]}`;
    return { trip: tripBase, city: suffix, country: inferCountry(tripBase) || inferCountry(suffix), rawName: name };
  }

  // "Name Year"
  m = name.match(/^(.+?)\s+(\d{4})$/);
  if (m) {
    return { trip: name, city: null, country: inferCountry(name), rawName: name };
  }

  // Fallback (no year)
  return { trip: name, city: null, country: inferCountry(name), rawName: name };
}

// ─── PARSE your_photos.html ──────────────────────────────────────────────────
function parsePhotosHTML() {
  const html = fs.readFileSync(PHOTOS_HTML, 'utf8');
  const albums = [];
  const sectionRe = /<section[^>]*>([\s\S]*?)<\/section>/g;
  let sm;
  while ((sm = sectionRe.exec(html)) !== null) {
    const sec = sm[1];
    const titleM = sec.match(/<h2[^>]*>([^<]*)<\/h2>/);
    const linkM  = sec.match(/href="your_facebook_activity\/posts\/album\/(\d+)\.html"/);
    if (!titleM || !linkM) continue;
    const rawTitle = titleM[1].replace(/ - \d+ photos?$/i, '').trim();
    albums.push({ rawTitle, albumIndex: parseInt(linkM[1]) });
  }
  return albums;
}

// ─── PARSE album/N.html ──────────────────────────────────────────────────────
function parseAlbumPhotos(albumIndex) {
  const file = path.join(ALBUM_DIR, `${albumIndex}.html`);
  if (!fs.existsSync(file)) return [];
  const html = fs.readFileSync(file, 'utf8');
  const photos = [];
  const re = /src="(your_facebook_activity\/posts\/media\/[^"]+\.jpg)"/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    // Base href is ../../ so real root is C:/Dev/Temp
    const mediaPath = path.join('C:/Dev/Temp', m[1]).replace(/\\/g, '/');
    photos.push({ mediaPath, fileName: path.basename(m[1]) });
  }
  return photos;
}

// ─── FIREBASE STORAGE UPLOAD ─────────────────────────────────────────────────
async function uploadPhoto(mediaPath, storagePath) {
  const buffer = fs.readFileSync(mediaPath);
  const file   = bucket.file(storagePath);
  const token  = crypto.randomUUID();

  await file.save(buffer, {
    contentType: 'image/jpeg',
    resumable:   false,
    metadata:    { metadata: { firebaseStorageDownloadTokens: token } },
  });

  // Construct permanent download URL (same format as Firebase client SDK)
  const encoded = encodeURIComponent(storagePath);
  return `https://firebasestorage.googleapis.com/v0/b/${STORAGE_BUCKET}/o/${encoded}?alt=media&token=${token}`;
}

// ─── CONCURRENCY HELPER ──────────────────────────────────────────────────────
async function inBatches(items, n, fn) {
  for (let i = 0; i < items.length; i += n) {
    await Promise.all(items.slice(i, i + n).map(fn));
  }
}

// ─── PROGRESS ────────────────────────────────────────────────────────────────
function loadProgress() {
  return fs.existsSync(PROGRESS_FILE)
    ? JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'))
    : { doneTrips: [], tripIds: {} };
}
function saveProgress(p) { fs.writeFileSync(PROGRESS_FILE, JSON.stringify(p, null, 2)); }

// ─── MAIN ────────────────────────────────────────────────────────────────────
async function main() {
  console.log('Facebook → Pepini per il mondo import\n');

  // Resolve owner UID
  const userRecord = await admin.auth().getUserByEmail(OWNER_EMAIL);
  const ownerId = userRecord.uid;
  console.log(`Owner: ${OWNER_EMAIL} → UID: ${ownerId}\n`);

  // Parse and group albums
  const rawAlbums = parsePhotosHTML();
  const parsed = rawAlbums.map(a => ({ ...parseAlbumTitle(a.rawTitle), albumIndex: a.albumIndex })).filter(Boolean);

  // Group into trips
  const tripMap = new Map();
  for (const a of parsed) {
    if (!tripMap.has(a.trip)) {
      tripMap.set(a.trip, { tripName: a.trip, country: a.country, albums: [] });
    }
    tripMap.get(a.trip).albums.push(a);
  }

  const trips = [...tripMap.values()];
  console.log(`Albums parsed: ${parsed.length}  →  Trips to create: ${trips.length}\n`);

  const progress = loadProgress();
  let tripIdx = 0;

  for (const { tripName, country, albums } of trips) {
    tripIdx++;
    const label = `[${tripIdx}/${trips.length}] ${tripName}`;

    if (progress.doneTrips.includes(tripName)) {
      console.log(`${label}  ✓ already imported`);
      continue;
    }

    console.log(`\n${label}`);

    // Extract year for the date field
    const yearMatch = tripName.match(/(\d{4})$/);
    const dateStr   = yearMatch ? `${yearMatch[1]}-01-01` : null;

    // Create or reuse Firestore trip document
    let tripId = progress.tripIds[tripName];
    if (!tripId) {
      const ref = await db.collection('trips').add({
        name:       tripName,
        date:       dateStr,
        country:    country || null,
        miroUrl:    null,
        ownerId,
        visibility: 'private',
        cover:      null,
        photoCount: 0,
        createdAt:  admin.firestore.FieldValue.serverTimestamp(),
      });
      tripId = ref.id;
      progress.tripIds[tripName] = tripId;
      saveProgress(progress);
    }

    let totalUploaded = 0;
    let coverUrl = null;
    let photoOrder = 1; // used to preserve order via createdAt offset

    for (const album of albums) {
      const photos = parseAlbumPhotos(album.albumIndex);
      const cityLabel = album.city ? `  [${album.city}]` : '  [no city]';
      process.stdout.write(`${cityLabel} 0/${photos.length}`);

      let done = 0;
      await inBatches(photos, CONCURRENCY, async ({ mediaPath, fileName }) => {
        if (!fs.existsSync(mediaPath)) {
          done++;
          return;
        }

        const storagePath = `users/${ownerId}/trips/${tripId}/${fileName}`;
        const url = await uploadPhoto(mediaPath, storagePath);

        await db.collection('trips').doc(tripId).collection('photos').add({
          name:      fileName,
          url,
          storagePath,
          city:      album.city || null,
          createdAt: admin.firestore.Timestamp.fromMillis(Date.now() + photoOrder * 100),
        });

        photoOrder++;
        if (!coverUrl) coverUrl = url;
        totalUploaded++;
        done++;
        process.stdout.write(`\r${cityLabel} ${done}/${photos.length}`);
      });

      console.log(`\r${cityLabel} ${photos.length}/${photos.length} ✓`);
    }

    // Update trip cover + photo count
    await db.collection('trips').doc(tripId).update({ cover: coverUrl, photoCount: totalUploaded });

    progress.doneTrips.push(tripName);
    saveProgress(progress);
    console.log(`  → ${totalUploaded} photos, cover set`);
  }

  console.log('\n✅  Import complete!');
  console.log(`Progress saved to: ${PROGRESS_FILE}`);
}

main().catch(err => { console.error('\n❌ Fatal error:', err.message); process.exit(1); });
