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

exports.indexPhotoFaces = onCall(
  { secrets: [AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY], timeoutSeconds: 120, memory: '512MiB' },
  async (request) => {
    const email = assertSignedIn(request);
    const { tripId, photoId } = request.data || {};
    if (!tripId || !photoId) throw new HttpsError('invalid-argument', 'tripId and photoId are required.');

    const { photoRef, photo } = await readPhoto(tripId, photoId);
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

    const faceRecords = result.FaceRecords || [];
    await saveFaceIndex({ tripId, photoId, faceRecords, indexedBy: email });
    await photoRef.set({
      rekognition: {
        indexedAt: admin.firestore.FieldValue.serverTimestamp(),
        faceCount: faceRecords.length,
      },
    }, { merge: true });

    return { faceCount: faceRecords.length };
  }
);

exports.createPersonFromPhoto = onCall(
  { secrets: [AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY], timeoutSeconds: 120, memory: '512MiB' },
  async (request) => {
    const email = assertSignedIn(request);
    const { name, tripId, photoId } = request.data || {};
    const cleanName = String(name || '').trim();
    if (!cleanName) throw new HttpsError('invalid-argument', 'Person name is required.');
    if (!tripId || !photoId) throw new HttpsError('invalid-argument', 'tripId and photoId are required.');

    const { photo } = await readPhoto(tripId, photoId);
    const personRef = db.collection('people').doc();
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
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: email,
      referenceTripId: tripId,
      referencePhotoId: photoId,
      referenceImageUrl: photo.thumbUrl || photo.url || null,
      referenceFaceIds,
      matchCount: 0,
    });

    return { personId: personRef.id, referenceFaceIds };
  }
);

exports.searchPersonMatches = onCall(
  { secrets: [AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY], timeoutSeconds: 120, memory: '512MiB' },
  async (request) => {
    assertSignedIn(request);
    const { personId, threshold = 90 } = request.data || {};
    if (!personId) throw new HttpsError('invalid-argument', 'personId is required.');

    const personRef = db.collection('people').doc(personId);
    const personSnap = await personRef.get();
    if (!personSnap.exists) throw new HttpsError('not-found', 'Person not found.');
    const person = personSnap.data();
    const referenceFaceIds = person.referenceFaceIds || [];
    if (referenceFaceIds.length === 0) throw new HttpsError('failed-precondition', 'Person has no reference faces.');

    const client = rekognitionClient();
    const matches = new Map();
    for (const faceId of referenceFaceIds) {
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
        const matchedFaceId = match.Face?.FaceId;
        if (!matchedFaceId || referenceFaceIds.includes(matchedFaceId)) continue;
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

exports.deletePerson = onCall(
  { secrets: [AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY], timeoutSeconds: 60, memory: '256MiB' },
  async (request) => {
    assertAdmin(request);
    const { personId } = request.data || {};
    if (!personId) throw new HttpsError('invalid-argument', 'personId is required.');

    const personRef = db.collection('people').doc(personId);
    const personSnap = await personRef.get();
    if (!personSnap.exists) return { deleted: true };
    const referenceFaceIds = personSnap.data().referenceFaceIds || [];

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
