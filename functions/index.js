const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const admin = require('firebase-admin');
const {
  CreateCollectionCommand,
  DeleteFacesCommand,
  IndexFacesCommand,
  RekognitionClient,
  ResourceAlreadyExistsException,
  ResourceNotFoundException,
  SearchFacesCommand,
} = require('@aws-sdk/client-rekognition');

admin.initializeApp();

const db = admin.firestore();
const AWS_ACCESS_KEY_ID = defineSecret('AWS_ACCESS_KEY_ID');
const AWS_SECRET_ACCESS_KEY = defineSecret('AWS_SECRET_ACCESS_KEY');

const ADMIN_EMAIL = 'raicesm@gmail.com';
const DEFAULT_REGION = 'us-east-1';
const DEFAULT_COLLECTION_ID = 'travel-gallery-people';

function assertAdmin(request) {
  const email = request.auth?.token?.email?.toLowerCase();
  if (email !== ADMIN_EMAIL) {
    throw new HttpsError('permission-denied', 'Only the app admin can use face recognition.');
  }
  return email;
}

function assertSignedIn(request) {
  const email = request.auth?.token?.email?.toLowerCase();
  if (!email) {
    throw new HttpsError('unauthenticated', 'Sign in to use face recognition.');
  }
  return email;
}

function rekognitionClient() {
  return new RekognitionClient({
    region: process.env.AWS_REGION || DEFAULT_REGION,
    credentials: {
      accessKeyId: AWS_ACCESS_KEY_ID.value(),
      secretAccessKey: AWS_SECRET_ACCESS_KEY.value(),
    },
  });
}

function collectionId() {
  return process.env.REKOGNITION_COLLECTION_ID || DEFAULT_COLLECTION_ID;
}

function cleanExternalId(value) {
  return String(value || 'photo')
    .replace(/[^a-zA-Z0-9_.:-]/g, '_')
    .slice(0, 255);
}

async function ensureCollection(client) {
  try {
    await client.send(new CreateCollectionCommand({ CollectionId: collectionId() }));
  } catch (err) {
    if (!(err instanceof ResourceAlreadyExistsException) && err.name !== 'ResourceAlreadyExistsException') {
      throw err;
    }
  }
}

async function readPhoto(tripId, photoId) {
  const tripRef = db.collection('trips').doc(tripId);
  const photoRef = tripRef.collection('photos').doc(photoId);
  const [tripSnap, photoSnap] = await Promise.all([tripRef.get(), photoRef.get()]);
  if (!tripSnap.exists) throw new HttpsError('not-found', 'Trip not found.');
  if (!photoSnap.exists) throw new HttpsError('not-found', 'Photo not found.');
  return { tripRef, photoRef, trip: tripSnap.data(), photo: photoSnap.data() };
}

function canAccessTrip(request, trip) {
  const email = request.auth?.token?.email?.toLowerCase();
  const uid = request.auth?.uid;
  const allowedEmails = (trip.allowedEmails || []).map(item => String(item).toLowerCase());
  return trip.visibility === 'shared'
    || trip.ownerId === uid
    || !trip.ownerId
    || email === ADMIN_EMAIL
    || (!!email && allowedEmails.includes(email));
}

exports.initYouTubeUpload = onCall(
  { timeoutSeconds: 60, memory: '256MiB' },
  async (request) => {
    assertSignedIn(request);
    const { accessToken, metadata, contentType, contentLength } = request.data || {};
    if (!accessToken) throw new HttpsError('unauthenticated', 'Connect YouTube before uploading videos.');
    if (!metadata?.snippet?.title) throw new HttpsError('invalid-argument', 'Video metadata is required.');

    const response = await fetch('https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json; charset=UTF-8',
        'X-Upload-Content-Type': contentType || 'application/octet-stream',
        'X-Upload-Content-Length': String(contentLength || 0),
      },
      body: JSON.stringify(metadata),
    });

    const uploadUrl = response.headers.get('Location');
    if (!response.ok || !uploadUrl) {
      let details = '';
      try { details = await response.text(); } catch (_) {}
      const code = response.status === 401 || response.status === 403 ? 'permission-denied' : 'internal';
      throw new HttpsError(code, `YouTube upload init failed (${response.status}).`, { status: response.status, details });
    }

    return { uploadUrl };
  }
);

async function imageBytesFromUrl(url) {
  if (!url) throw new HttpsError('failed-precondition', 'Photo has no image URL.');
  const response = await fetch(url);
  if (!response.ok) throw new HttpsError('internal', `Could not fetch image: ${response.status}`);
  return new Uint8Array(await response.arrayBuffer());
}

async function saveFaceIndex({ tripId, photoId, faceRecords, indexedBy }) {
  const batch = db.batch();
  const now = admin.firestore.FieldValue.serverTimestamp();
  for (const record of faceRecords) {
    const face = record.Face;
    if (!face?.FaceId) continue;
    const data = {
      tripId,
      photoId,
      faceId: face.FaceId,
      imageId: face.ImageId || null,
      externalImageId: face.ExternalImageId || null,
      boundingBox: face.BoundingBox || null,
      confidence: face.Confidence || null,
      indexedBy,
      indexedAt: now,
    };
    batch.set(db.collection('faceIndex').doc(face.FaceId), data, { merge: true });
    batch.set(db.collection('trips').doc(tripId).collection('photos').doc(photoId).collection('faces').doc(face.FaceId), data, { merge: true });
  }
  await batch.commit();
}

function chunks(items, size) {
  const out = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

function makeUnionFind(ids) {
  const parent = new Map(ids.map(id => [id, id]));
  const find = (id) => {
    const current = parent.get(id);
    if (!current || current === id) return current || id;
    const root = find(current);
    parent.set(id, root);
    return root;
  };
  const union = (a, b) => {
    const rootA = find(a);
    const rootB = find(b);
    if (rootA !== rootB) parent.set(rootB, rootA);
  };
  return { find, union };
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function searchFacesWithRetry(client, faceId, threshold) {
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      return await client.send(new SearchFacesCommand({
        CollectionId: collectionId(),
        FaceId: faceId,
        FaceMatchThreshold: Number(threshold),
        MaxFaces: 4096,
      }));
    } catch (err) {
      if (err instanceof ResourceNotFoundException || err.name === 'ResourceNotFoundException') {
        return { FaceMatches: [] };
      }
      const retryable = [
        'ProvisionedThroughputExceededException',
        'ThrottlingException',
        'TooManyRequestsException',
        'InternalServerError',
      ].includes(err.name);
      if (!retryable || attempt === 3) throw err;
      await sleep(350 * Math.pow(2, attempt));
    }
  }
  return { FaceMatches: [] };
}

async function loadAccessibleTrips(request, tripIds) {
  const uniqueTripIds = [...new Set((tripIds || []).filter(Boolean))];
  if (uniqueTripIds.length === 0) throw new HttpsError('invalid-argument', 'tripIds are required.');
  const trips = new Map();
  await Promise.all(uniqueTripIds.map(async tripId => {
    const snap = await db.collection('trips').doc(tripId).get();
    if (!snap.exists) return;
    const trip = snap.data();
    if (canAccessTrip(request, trip)) trips.set(tripId, trip);
  }));
  if (trips.size === 0) throw new HttpsError('permission-denied', 'No accessible trips were found.');
  return trips;
}

async function readFaceIndexForTrips(tripIds) {
  const faces = new Map();
  for (const chunk of chunks(tripIds, 30)) {
    const snap = await db.collection('faceIndex').where('tripId', 'in', chunk).get();
    snap.docs.forEach(faceDoc => faces.set(faceDoc.id, { id: faceDoc.id, ...faceDoc.data() }));
  }
  return faces;
}

async function operationIsCancelled(request, operationId) {
  if (!operationId) return false;
  const snap = await db.collection('operationCancellations').doc(String(operationId)).get();
  if (!snap.exists) return false;
  const data = snap.data() || {};
  return data.uid === request.auth?.uid || data.email === request.auth?.token?.email?.toLowerCase();
}

async function throwIfOperationCancelled(request, operationId) {
  if (await operationIsCancelled(request, operationId)) {
    throw new HttpsError('cancelled', 'Operation cancelled.');
  }
}

async function enrichFaceCluster(root, faceIds, faces) {
  const faceRows = faceIds.map(faceId => faces.get(faceId)).filter(Boolean);
  const photoKeys = [...new Set(faceRows.map(face => `${face.tripId}:${face.photoId}`))];
  const firstFace = faceRows[0];
  let samplePhoto = null;
  if (firstFace) {
    const photoSnap = await db.collection('trips').doc(firstFace.tripId).collection('photos').doc(firstFace.photoId).get();
    if (photoSnap.exists) samplePhoto = { id: photoSnap.id, ...photoSnap.data() };
  }
  return {
    clusterId: root,
    faceIds,
    faceCount: faceIds.length,
    photoCount: photoKeys.length,
    sample: firstFace ? {
      tripId: firstFace.tripId,
      photoId: firstFace.photoId,
      imageUrl: samplePhoto?.thumbUrl || samplePhoto?.url || null,
    } : null,
  };
}

exports.indexPhotoFaces = onCall(
  { secrets: [AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY], timeoutSeconds: 120, memory: '512MiB' },
  async (request) => {
    const email = assertSignedIn(request);
    const { tripId, photoId, operationId } = request.data || {};
    if (!tripId || !photoId) throw new HttpsError('invalid-argument', 'tripId and photoId are required.');
    await throwIfOperationCancelled(request, operationId);

    const { photoRef, trip, photo } = await readPhoto(tripId, photoId);
    if (!canAccessTrip(request, trip)) {
      throw new HttpsError('permission-denied', 'You do not have access to this trip.');
    }
    if (photo.rekognition?.indexedAt) {
      return {
        skipped: true,
        faceCount: photo.rekognition.faceCount || 0,
        faceIds: photo.rekognition.faceIds || [],
      };
    }
    const client = rekognitionClient();
    await ensureCollection(client);

    const result = await client.send(new IndexFacesCommand({
      CollectionId: collectionId(),
      ExternalImageId: cleanExternalId(`photo_${tripId}_${photoId}`),
      Image: { Bytes: await imageBytesFromUrl(photo.url || photo.thumbUrl) },
      MaxFaces: 100,
      QualityFilter: 'AUTO',
      DetectionAttributes: [],
    }));
    await throwIfOperationCancelled(request, operationId);

    const faceRecords = result.FaceRecords || [];
    const faceIds = faceRecords.map(record => record.Face?.FaceId).filter(Boolean);
    await saveFaceIndex({ tripId, photoId, faceRecords, indexedBy: email });
    await photoRef.set({
      rekognition: {
        indexedAt: admin.firestore.FieldValue.serverTimestamp(),
        faceCount: faceRecords.length,
        faceIds,
        indexedBy: email,
      },
    }, { merge: true });

    return { skipped: false, faceCount: faceRecords.length, faceIds };
  }
);

exports.createPersonFromPhoto = onCall(
  { secrets: [AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY], timeoutSeconds: 120, memory: '512MiB' },
  async (request) => {
    const email = assertSignedIn(request);
    const { name, tripId, photoId, referenceFaceId } = request.data || {};
    const cleanName = String(name || '').trim();
    if (!cleanName) throw new HttpsError('invalid-argument', 'Person name is required.');
    if (!tripId || !photoId) throw new HttpsError('invalid-argument', 'tripId and photoId are required.');

    const { trip, photo } = await readPhoto(tripId, photoId);
    if (!canAccessTrip(request, trip)) {
      throw new HttpsError('permission-denied', 'You do not have access to this trip.');
    }
    const personRef = db.collection('people').doc();
    const now = admin.firestore.FieldValue.serverTimestamp();

    if (referenceFaceId) {
      const faceSnap = await db.collection('faceIndex').doc(referenceFaceId).get();
      if (!faceSnap.exists) {
        throw new HttpsError('failed-precondition', 'Selected face is not indexed yet.');
      }
      const face = faceSnap.data();
      if (face.tripId !== tripId || face.photoId !== photoId) {
        throw new HttpsError('invalid-argument', 'Selected face does not belong to this photo.');
      }

      const batch = db.batch();
      batch.set(personRef, {
        name: cleanName,
        createdAt: now,
        createdBy: email,
        referenceTripId: tripId,
        referencePhotoId: photoId,
        referenceImageUrl: photo.thumbUrl || photo.url || null,
        referenceFaceIds: [referenceFaceId],
        ownedReferenceFaceIds: [],
        referenceFaceSource: 'indexed',
        matchCount: 1,
        lastMatchedAt: now,
      });
      batch.set(personRef.collection('matches').doc(`${tripId}_${photoId}`), {
        tripId,
        photoId,
        faceId: referenceFaceId,
        boundingBox: face.boundingBox || null,
        similarity: 100,
        matchedAt: now,
      }, { merge: true });
      await batch.commit();

      return { personId: personRef.id, referenceFaceIds: [referenceFaceId] };
    }

    const client = rekognitionClient();
    await ensureCollection(client);

    const result = await client.send(new IndexFacesCommand({
      CollectionId: collectionId(),
      ExternalImageId: cleanExternalId(`person_${personRef.id}_${photoId}`),
      Image: { Bytes: await imageBytesFromUrl(photo.url || photo.thumbUrl) },
      MaxFaces: 1,
      QualityFilter: 'AUTO',
      DetectionAttributes: [],
    }));

    const faceRecords = result.FaceRecords || [];
    if (faceRecords.length === 0) {
      throw new HttpsError('failed-precondition', 'No usable face was found in the reference photo.');
    }

    const referenceFaceIds = faceRecords.map(record => record.Face.FaceId).filter(Boolean);
    await personRef.set({
      name: cleanName,
      createdAt: now,
      createdBy: email,
      referenceTripId: tripId,
      referencePhotoId: photoId,
      referenceImageUrl: photo.thumbUrl || photo.url || null,
      referenceFaceIds,
      ownedReferenceFaceIds: referenceFaceIds,
      referenceFaceSource: 'person',
      matchCount: 0,
    });

    return { personId: personRef.id, referenceFaceIds };
  }
);

exports.searchPersonMatches = onCall(
  { secrets: [AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY], timeoutSeconds: 120, memory: '512MiB' },
  async (request) => {
    assertSignedIn(request);
    const { personId, threshold = 90, operationId } = request.data || {};
    if (!personId) throw new HttpsError('invalid-argument', 'personId is required.');
    await throwIfOperationCancelled(request, operationId);

    const personRef = db.collection('people').doc(personId);
    const personSnap = await personRef.get();
    if (!personSnap.exists) throw new HttpsError('not-found', 'Person not found.');
    const person = personSnap.data();
    const referenceFaceIds = person.referenceFaceIds || [];
    if (referenceFaceIds.length === 0) throw new HttpsError('failed-precondition', 'Person has no reference faces.');

    const client = rekognitionClient();
    const matches = new Map();
    for (const faceId of referenceFaceIds) {
      await throwIfOperationCancelled(request, operationId);
      let result;
      try {
        result = await client.send(new SearchFacesCommand({
          CollectionId: collectionId(),
          FaceId: faceId,
          FaceMatchThreshold: Number(threshold),
          MaxFaces: 4096,
        }));
      } catch (err) {
        if (err instanceof ResourceNotFoundException || err.name === 'ResourceNotFoundException') continue;
        throw err;
      }

      for (const match of result.FaceMatches || []) {
        await throwIfOperationCancelled(request, operationId);
        const matchedFaceId = match.Face?.FaceId;
        if (!matchedFaceId) continue;
        if (person.referenceFaceSource !== 'indexed' && referenceFaceIds.includes(matchedFaceId)) continue;
        const indexSnap = await db.collection('faceIndex').doc(matchedFaceId).get();
        if (!indexSnap.exists) continue;
        const data = indexSnap.data();
        matches.set(`${data.tripId}:${data.photoId}`, {
          tripId: data.tripId,
          photoId: data.photoId,
          faceId: matchedFaceId,
          similarity: match.Similarity || null,
          boundingBox: data.boundingBox || null,
        });
      }
    }
    await throwIfOperationCancelled(request, operationId);

    const batch = db.batch();
    const now = admin.firestore.FieldValue.serverTimestamp();
    for (const match of matches.values()) {
      batch.set(personRef.collection('matches').doc(`${match.tripId}_${match.photoId}`), {
        ...match,
        matchedAt: now,
      }, { merge: true });
    }
    batch.set(personRef, {
      matchCount: matches.size,
      lastMatchedAt: now,
    }, { merge: true });
    await batch.commit();

    return { matchCount: matches.size, matches: [...matches.values()] };
  }
);

exports.getIndexedFaceClusters = onCall(
  { secrets: [AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY], timeoutSeconds: 1800, memory: '2GiB' },
  async (request) => {
    assertSignedIn(request);
    const { tripIds, threshold = 90, operationId } = request.data || {};
    await throwIfOperationCancelled(request, operationId);
    const accessibleTrips = await loadAccessibleTrips(request, tripIds);
    const faces = await readFaceIndexForTrips([...accessibleTrips.keys()]);
    const faceIds = [...faces.keys()];
    if (faceIds.length === 0) return { clusters: [], faceCount: 0 };

    try {
      const client = rekognitionClient();
      const uf = makeUnionFind(faceIds);
      const ungrouped = new Set(faceIds);
      for (const faceId of faceIds) {
        await throwIfOperationCancelled(request, operationId);
        if (!ungrouped.has(faceId)) continue;
        ungrouped.delete(faceId);
        const result = await searchFacesWithRetry(client, faceId, threshold);

        for (const match of result.FaceMatches || []) {
          const matchedFaceId = match.Face?.FaceId;
          if (!matchedFaceId || !faces.has(matchedFaceId)) continue;
          uf.union(faceId, matchedFaceId);
          ungrouped.delete(matchedFaceId);
        }
      }
      await throwIfOperationCancelled(request, operationId);

      const grouped = new Map();
      for (const faceId of faceIds) {
        const root = uf.find(faceId);
        if (!grouped.has(root)) grouped.set(root, []);
        grouped.get(root).push(faceId);
      }

      const clusters = await Promise.all([...grouped.entries()]
        .map(([root, ids]) => enrichFaceCluster(root, ids, faces)));

      return {
        faceCount: faceIds.length,
        clusters: clusters.sort((a, b) => b.faceCount - a.faceCount),
      };
    } catch (err) {
      console.error('Could not group indexed faces:', err);
      if ([
        'ProvisionedThroughputExceededException',
        'ThrottlingException',
        'TooManyRequestsException',
      ].includes(err.name)) {
        throw new HttpsError('resource-exhausted', 'AWS Rekognition is throttling face grouping. Please retry in a few minutes.');
      }
      throw new HttpsError('internal', err.message || 'Could not group indexed faces.');
    }
  }
);

exports.cancelOperation = onCall(
  { timeoutSeconds: 30, memory: '128MiB' },
  async (request) => {
    const email = assertSignedIn(request);
    const { operationId } = request.data || {};
    if (!operationId) throw new HttpsError('invalid-argument', 'operationId is required.');
    await db.collection('operationCancellations').doc(String(operationId)).set({
      operationId: String(operationId),
      uid: request.auth.uid,
      email,
      cancelledAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
    return { cancelled: true };
  }
);

exports.createPeopleFromFaceClusters = onCall(
  { secrets: [AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY], timeoutSeconds: 540, memory: '1GiB' },
  async (request) => {
    const email = assertSignedIn(request);
    const { people = [], tripIds = [] } = request.data || {};
    const accessibleTrips = await loadAccessibleTrips(request, tripIds);
    const faces = await readFaceIndexForTrips([...accessibleTrips.keys()]);
    const now = admin.firestore.FieldValue.serverTimestamp();
    const created = [];

    for (const item of people) {
      const name = String(item.name || '').trim();
      const faceIds = [...new Set(item.faceIds || [])].filter(faceId => faces.has(faceId));
      if (!name || faceIds.length === 0) continue;

      const faceRows = faceIds.map(faceId => faces.get(faceId)).filter(Boolean);
      const firstFace = faceRows[0];
      const photoSnap = firstFace
        ? await db.collection('trips').doc(firstFace.tripId).collection('photos').doc(firstFace.photoId).get()
        : null;
      const photo = photoSnap?.exists ? photoSnap.data() : {};
      const personRef = db.collection('people').doc();
      const uniqueMatches = new Map();
      faceRows.forEach(face => {
        uniqueMatches.set(`${face.tripId}_${face.photoId}`, {
          tripId: face.tripId,
          photoId: face.photoId,
          faceId: face.faceId,
          boundingBox: face.boundingBox || null,
          similarity: 100,
          matchedAt: now,
        });
      });

      const batch = db.batch();
      batch.set(personRef, {
        name,
        createdAt: now,
        createdBy: email,
        referenceTripId: firstFace?.tripId || null,
        referencePhotoId: firstFace?.photoId || null,
        referenceImageUrl: photo.thumbUrl || photo.url || null,
        referenceFaceIds: faceIds,
        ownedReferenceFaceIds: [],
        referenceFaceSource: 'indexed',
        matchCount: uniqueMatches.size,
        lastMatchedAt: now,
      });
      uniqueMatches.forEach((match, key) => {
        batch.set(personRef.collection('matches').doc(key), match, { merge: true });
      });
      await batch.commit();
      created.push({ personId: personRef.id, name, matchCount: uniqueMatches.size });
    }

    return { created };
  }
);

exports.deletePerson = onCall(
  { secrets: [AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY], timeoutSeconds: 60, memory: '256MiB' },
  async (request) => {
    assertAdmin(request);
    const { personId } = request.data || {};
    if (!personId) throw new HttpsError('invalid-argument', 'personId is required.');

    const personRef = db.collection('people').doc(personId);
    const personSnap = await personRef.get();
    if (!personSnap.exists) return { deleted: true };
    const person = personSnap.data();
    const referenceFaceIds = person.ownedReferenceFaceIds || (
      person.referenceFaceSource ? [] : (person.referenceFaceIds || [])
    );

    if (referenceFaceIds.length > 0) {
      const client = rekognitionClient();
      await client.send(new DeleteFacesCommand({
        CollectionId: collectionId(),
        FaceIds: referenceFaceIds,
      })).catch(() => {});
    }

    const matchesSnap = await personRef.collection('matches').get();
    const batch = db.batch();
    matchesSnap.docs.forEach(doc => batch.delete(doc.ref));
    batch.delete(personRef);
    await batch.commit();
    return { deleted: true };
  }
);
