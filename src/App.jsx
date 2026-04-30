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
  query, orderBy, serverTimestamp, getDoc, setDoc,
} from 'firebase/firestore';
import {
  ref, uploadBytes, getDownloadURL, deleteObject,
} from 'firebase/storage';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const pinIcon = L.divIcon({
  className: '',
  html: '<div class="map-pin"></div>',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -14],
});

const COUNTRY_COORDS = {
  'Argentina': [-34.61, -58.38],
  'Australia': [-25.27, 133.77],
  'Austria': [47.52, 14.55],
  'Belgium': [50.50, 4.47],
  'Bolivia': [-16.29, -63.59],
  'Brazil': [-14.24, -51.93],
  'Canada': [56.13, -106.35],
  'Chile': [-35.68, -71.54],
  'China': [35.86, 104.19],
  'Colombia': [4.57, -74.30],
  'Costa Rica': [9.75, -83.75],
  'Croatia': [45.10, 15.20],
  'Cuba': [21.52, -77.78],
  'Czech Republic': [49.82, 15.47],
  'Denmark': [56.26, 9.50],
  'Ecuador': [-1.83, -78.18],
  'Egypt': [26.82, 30.80],
  'Finland': [61.92, 25.75],
  'France': [46.23, 2.21],
  'Germany': [51.17, 10.45],
  'Greece': [39.07, 21.82],
  'Hungary': [47.16, 19.50],
  'Iceland': [64.96, -19.02],
  'India': [20.59, 78.96],
  'Indonesia': [-0.79, 113.92],
  'Ireland': [53.41, -8.24],
  'Israel': [31.05, 34.85],
  'Italy': [41.87, 12.57],
  'Japan': [36.20, 138.25],
  'Jordan': [30.59, 36.24],
  'Kenya': [-0.02, 37.91],
  'Mexico': [23.63, -102.55],
  'Morocco': [31.79, -7.09],
  'Netherlands': [52.13, 5.29],
  'New Zealand': [-40.90, 174.89],
  'Norway': [60.47, 8.47],
  'Panama': [8.54, -80.78],
  'Peru': [-9.19, -75.02],
  'Poland': [51.92, 19.15],
  'Portugal': [39.40, -8.22],
  'Romania': [45.94, 24.97],
  'Scotland': [56.82, -4.18],
  'South Africa': [-30.56, 22.94],
  'Spain': [40.46, -3.75],
  'Sweden': [60.13, 18.64],
  'Switzerland': [46.82, 8.23],
  'Thailand': [15.87, 100.99],
  'Turkey': [38.96, 35.24],
  'United Kingdom': [55.38, -3.44],
  'United States': [37.09, -95.71],
  'Uruguay': [-32.52, -55.77],
  'Vietnam': [14.06, 108.28],
};

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
      canvas.width = width;
      canvas.height = height;
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
  const [lightbox, setLightbox] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [view, setView] = useState('grid');
  const [tripsView, setTripsView] = useState('grid');
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef();

  // ─── Edit trip ───
  const [editTrip, setEditTrip] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editCountry, setEditCountry] = useState('');
  const [editSaving, setEditSaving] = useState(false);

  // ─── Share ───
  const [shareModal, setShareModal] = useState(null);
  const [shareGenerating, setShareGenerating] = useState(null);

  // ─── Public share view (for ?share=TOKEN URLs) ───
  const [publicShareData, setPublicShareData] = useState(null);
  const [publicShareLoading, setPublicShareLoading] = useState(false);
  const [publicLightbox, setPublicLightbox] = useState(null);
  const [publicLbIdx, setPublicLbIdx] = useState(-1);

  // ─── Auth listener ───
  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
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

  // ─── Load trips when authenticated ───
  useEffect(() => {
    if (!user) return;
    loadTrips();
  }, [user]);

  // ─── Load photos when trip selected ───
  useEffect(() => {
    if (!activeTrip || !user) { setPhotos([]); return; }
    loadPhotos(activeTrip);
  }, [activeTrip, user]);

  // ─── Keyboard nav for lightboxes ───
  useEffect(() => {
    const handler = (e) => {
      if (lightbox) {
        if (e.key === 'Escape') setLightbox(null);
        if (e.key === 'ArrowLeft') navLightbox(-1);
        if (e.key === 'ArrowRight') navLightbox(1);
      }
      if (publicLightbox && publicShareData?.photos) {
        if (e.key === 'Escape') setPublicLightbox(null);
        if (e.key === 'ArrowLeft' && publicLbIdx > 0) {
          const n = publicLbIdx - 1;
          setPublicLbIdx(n); setPublicLightbox(publicShareData.photos[n]);
        }
        if (e.key === 'ArrowRight' && publicLbIdx < publicShareData.photos.length - 1) {
          const n = publicLbIdx + 1;
          setPublicLbIdx(n); setPublicLightbox(publicShareData.photos[n]);
        }
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
      if (err.code !== 'auth/popup-closed-by-user') {
        setLoginError('Sign-in failed — please try again');
      }
    }
    setLoggingIn(false);
  };

  // ═══════════════════════════════════════
  // TRIPS
  // ═══════════════════════════════════════
  const tripsCol = () => collection(db, 'users', user.uid, 'trips');

  const loadTrips = async () => {
    setLoadingTrips(true);
    try {
      const snap = await getDocs(query(tripsCol(), orderBy('createdAt', 'desc')));
      setTrips(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) { console.error('Load trips error:', err); }
    setLoadingTrips(false);
  };

  const addTrip = async () => {
    if (!newTripName.trim()) return;
    const coords = COUNTRY_COORDS[newTripCountry.trim()] || null;
    const tripData = {
      name: newTripName.trim(),
      date: newTripDate || null,
      country: newTripCountry.trim() || null,
      lat: coords ? coords[0] : null,
      lng: coords ? coords[1] : null,
      cover: null,
      photoCount: 0,
      createdAt: serverTimestamp(),
    };
    const docRef = await addDoc(tripsCol(), tripData);
    setTrips(prev => [{ id: docRef.id, ...tripData }, ...prev]);
    setNewTripName(''); setNewTripDate(''); setNewTripCountry(''); setShowNewTrip(false);
  };

  const deleteTrip = async (tripId) => {
    const trip = trips.find(t => t.id === tripId);
    if (trip?.shareToken) {
      try { await deleteDoc(doc(db, 'sharedLinks', trip.shareToken)); } catch {}
    }
    const photosSnap = await getDocs(collection(db, 'users', user.uid, 'trips', tripId, 'photos'));
    for (const photoDoc of photosSnap.docs) {
      const data = photoDoc.data();
      if (data.storagePath) {
        try { await deleteObject(ref(storage, data.storagePath)); } catch {}
      }
      await deleteDoc(photoDoc.ref);
    }
    await deleteDoc(doc(db, 'users', user.uid, 'trips', tripId));
    setTrips(prev => prev.filter(t => t.id !== tripId));
    if (activeTrip === tripId) { setActiveTrip(null); setPhotos([]); }
    setConfirmDelete(null);
  };

  // ═══════════════════════════════════════
  // PHOTOS
  // ═══════════════════════════════════════
  const photosCol = (tripId) => collection(db, 'users', user.uid, 'trips', tripId, 'photos');

  const loadPhotos = async (tripId) => {
    setLoadingPhotos(true);
    try {
      const snap = await getDocs(query(photosCol(tripId), orderBy('createdAt', 'asc')));
      setPhotos(snap.docs.map(d => ({ id: d.id, ...d.data() })));
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
      await updateDoc(doc(db, 'users', user.uid, 'trips', activeTrip), updates);
      setTrips(prev => prev.map(t => t.id === activeTrip ? { ...t, ...updates } : t));
    }
    setUploading(false);
  }, [activeTrip, user, trips]);

  const deletePhoto = async (photo) => {
    if (photo.storagePath) {
      try { await deleteObject(ref(storage, photo.storagePath)); } catch {}
    }
    await deleteDoc(doc(db, 'users', user.uid, 'trips', activeTrip, 'photos', photo.id));
    setPhotos(prev => prev.filter(p => p.id !== photo.id));
    const trip = trips.find(t => t.id === activeTrip);
    if (trip) {
      const newCount = Math.max(0, (trip.photoCount || 1) - 1);
      await updateDoc(doc(db, 'users', user.uid, 'trips', activeTrip), { photoCount: newCount });
      setTrips(prev => prev.map(t => t.id === activeTrip ? { ...t, photoCount: newCount } : t));
    }
    setLightbox(null);
  };

  const lbIndex = lightbox ? photos.findIndex(p => p.id === lightbox.id) : -1;
  const navLightbox = (dir) => {
    const next = lbIndex + dir;
    if (next >= 0 && next < photos.length) setLightbox(photos[next]);
  };

  const onDragOver = (e) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);
  const onDrop = (e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); };

  // ═══════════════════════════════════════
  // EDIT TRIP METADATA
  // ═══════════════════════════════════════
  const openEditTrip = (trip) => {
    setEditTrip(trip);
    setEditName(trip.name);
    setEditDate(trip.date || '');
    setEditCountry(trip.country || '');
  };

  const saveEditTrip = async () => {
    if (!editName.trim() || !editTrip) return;
    setEditSaving(true);
    const coords = COUNTRY_COORDS[editCountry.trim()] || null;
    const updates = {
      name: editName.trim(),
      date: editDate || null,
      country: editCountry.trim() || null,
      lat: coords ? coords[0] : null,
      lng: coords ? coords[1] : null,
    };
    try {
      await updateDoc(doc(db, 'users', user.uid, 'trips', editTrip.id), updates);
      setTrips(prev => prev.map(t => t.id === editTrip.id ? { ...t, ...updates } : t));
      setEditTrip(null);
    } catch (err) { console.error('Edit trip error:', err); }
    setEditSaving(false);
  };

  // ═══════════════════════════════════════
  // SHARE A TRIP
  // ═══════════════════════════════════════
  const generateShareLink = async (trip) => {
    if (trip.shareToken) {
      setShareModal({ tripId: trip.id, url: `${window.location.origin}/?share=${trip.shareToken}` });
      return;
    }
    setShareGenerating(trip.id);
    try {
      const snap = await getDocs(query(photosCol(trip.id), orderBy('createdAt', 'asc')));
      const photosData = snap.docs.map(d => ({ url: d.data().url, name: d.data().name }));
      const token = crypto.randomUUID();
      await setDoc(doc(db, 'sharedLinks', token), {
        tripName: trip.name,
        tripDate: trip.date || null,
        photos: photosData,
        createdAt: serverTimestamp(),
      });
      await updateDoc(doc(db, 'users', user.uid, 'trips', trip.id), { shareToken: token });
      setTrips(prev => prev.map(t => t.id === trip.id ? { ...t, shareToken: token } : t));
      setShareModal({ tripId: trip.id, url: `${window.location.origin}/?share=${token}` });
    } catch (err) { console.error('Share error:', err); }
    setShareGenerating(null);
  };

  const revokeShareLink = async (tripId, shareToken) => {
    try {
      await deleteDoc(doc(db, 'sharedLinks', shareToken));
      await updateDoc(doc(db, 'users', user.uid, 'trips', tripId), { shareToken: null });
      setTrips(prev => prev.map(t => t.id === tripId ? { ...t, shareToken: null } : t));
      setShareModal(null);
    } catch (err) { console.error('Revoke error:', err); }
  };

  // ═══════════════════════════════════════
  // STATS
  // ═══════════════════════════════════════
  const totalPhotos = trips.reduce((s, t) => s + (t.photoCount || 0), 0);
  const countriesVisited = new Set(trips.map(t => t.country).filter(Boolean)).size;
  const topTrip = trips.reduce((best, t) =>
    (!best || (t.photoCount || 0) > (best.photoCount || 0)) ? t : best, null);

  // ═══════════════════════════════════════
  // PUBLIC SHARE VIEW
  // ═══════════════════════════════════════
  if (publicShareLoading) {
    return <div className="login-page"><span className="spinner" style={{ width: 28, height: 28 }} /></div>;
  }

  if (publicShareData) {
    if (publicShareData.error) {
      return (
        <div className="login-page">
          <div className="login-card">
            <img src="/logo.png" alt="Pepini per il mondo" className="login-logo-img" />
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>This shared link is no longer valid.</p>
          </div>
        </div>
      );
    }
    const photos = publicShareData.photos || [];
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
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{photos.length} photos</span>
          </div>
          <div className="photo-grid">
            {photos.map((p, i) => (
              <div key={i} className="photo-thumb fade-in" style={{ animationDelay: `${i * 20}ms` }}
                onClick={() => { setPublicLightbox(p); setPublicLbIdx(i); }}>
                <img src={p.url} alt={p.name} loading="lazy" />
              </div>
            ))}
          </div>
        </div>
        {publicLightbox && (
          <div className="lightbox fade-scale" onClick={() => setPublicLightbox(null)}>
            <img src={publicLightbox.url} alt={publicLightbox.name} className="lightbox-img"
              onClick={e => e.stopPropagation()} />
            <button className="lb-close" onClick={() => setPublicLightbox(null)}>✕</button>
            {publicLbIdx > 0 && (
              <button className="lb-arrow lb-arrow-left" onClick={e => {
                e.stopPropagation();
                const n = publicLbIdx - 1; setPublicLbIdx(n); setPublicLightbox(photos[n]);
              }}>‹</button>
            )}
            {publicLbIdx < photos.length - 1 && (
              <button className="lb-arrow lb-arrow-right" onClick={e => {
                e.stopPropagation();
                const n = publicLbIdx + 1; setPublicLbIdx(n); setPublicLightbox(photos[n]);
              }}>›</button>
            )}
            <div className="lb-counter">{publicLbIdx + 1} / {photos.length}</div>
          </div>
        )}
      </div>
    );
  }

  if (authLoading) {
    return <div className="login-page"><div className="spinner" style={{ width: 28, height: 28 }} /></div>;
  }

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
              : <>
                  <svg width="20" height="20" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                    <path fill="none" d="M0 0h48v48H0z"/>
                  </svg>
                  Continue with Google
                </>
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
  const mappableTrips = trips.filter(t => t.lat != null && t.lng != null);

  return (
    <div>
      {/* ─── Header ─── */}
      <header className="header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {activeTrip && (
            <button className="btn btn-sm" onClick={() => setActiveTrip(null)}>← Trips</button>
          )}
          <div className="header-logo-wrap" onClick={() => setActiveTrip(null)}>
            <img src="/logo.png" alt="Pepini per il mondo" className="header-logo-img" />
            <span className="header-logo heading">Pepini per il mondo</span>
          </div>
        </div>
        <div className="header-actions">
          {!activeTrip && (
            <button className="btn btn-accent" onClick={() => setShowNewTrip(true)}>+ New Trip</button>
          )}
          {activeTrip && (
            <button className="btn btn-accent" onClick={() => fileRef.current?.click()} disabled={uploading}>
              {uploading ? `Uploading ${uploadCount.done}/${uploadCount.total}…` : '+ Add Photos'}
            </button>
          )}
          <button className="btn btn-sm" onClick={() => signOut(auth)} title="Sign out">↪ Out</button>
        </div>
        <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }}
          onChange={e => { handleFiles(e.target.files); e.target.value = ''; }} />
      </header>

      <div className="content">

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
                <div className="form-group" style={{ flex: '0 0 190px' }}>
                  <label>Country (optional)</label>
                  <input
                    list="countries-list"
                    value={newTripCountry}
                    onChange={e => setNewTripCountry(e.target.value)}
                    placeholder="e.g. Italy"
                    className="input"
                  />
                  <datalist id="countries-list">
                    {Object.keys(COUNTRY_COORDS).map(c => <option key={c} value={c} />)}
                  </datalist>
                </div>
                <button onClick={addTrip} className="btn btn-accent">Create</button>
                <button onClick={() => { setShowNewTrip(false); setNewTripName(''); setNewTripDate(''); setNewTripCountry(''); }}
                  className="btn btn-sm">Cancel</button>
              </div>
            )}

            {/* ─ Stats ─ */}
            {trips.length > 0 && (
              <div className="stats-bar fade-in">
                <div className="stat-card">
                  <div className="stat-value">{trips.length}</div>
                  <div className="stat-label">Trips</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{totalPhotos}</div>
                  <div className="stat-label">Photos</div>
                </div>
                {countriesVisited > 0 && (
                  <div className="stat-card">
                    <div className="stat-value">{countriesVisited}</div>
                    <div className="stat-label">Countries</div>
                  </div>
                )}
                {topTrip && topTrip.photoCount > 0 && (
                  <div className="stat-card stat-card-wide">
                    <div className="stat-value stat-value-sm">{topTrip.name}</div>
                    <div className="stat-label">Most photos ({topTrip.photoCount})</div>
                  </div>
                )}
              </div>
            )}

            {/* ─ View toggle (grid / map) ─ */}
            {trips.length > 0 && (
              <div className="trips-view-header">
                <div className="view-toggle">
                  <button className={`view-btn ${tripsView === 'grid' ? 'active' : ''}`} onClick={() => setTripsView('grid')}>Grid</button>
                  {mappableTrips.length > 0 && (
                    <button className={`view-btn ${tripsView === 'map' ? 'active' : ''}`} onClick={() => setTripsView('map')}>Map</button>
                  )}
                </div>
              </div>
            )}

            {loadingTrips && (
              <div style={{ textAlign: 'center', padding: 60 }}><span className="spinner" /></div>
            )}

            {!loadingTrips && trips.length === 0 && !showNewTrip && (
              <div className="empty">
                <div className="empty-icon">✈</div>
                <p className="empty-title heading">No trips yet</p>
                <p className="empty-sub">Create your first trip to start uploading photos.</p>
                <button className="btn btn-accent" onClick={() => setShowNewTrip(true)}>+ New Trip</button>
              </div>
            )}

            {/* ─ Map view ─ */}
            {tripsView === 'map' && mappableTrips.length > 0 && (
              <div className="map-wrap fade-in">
                <MapContainer center={[20, 0]} zoom={2} scrollWheelZoom
                  style={{ height: 480, width: '100%', borderRadius: 'var(--radius-lg)' }}>
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {mappableTrips.map(trip => (
                    <Marker key={trip.id} position={[trip.lat, trip.lng]} icon={pinIcon}>
                      <Popup>
                        <div className="map-popup">
                          {trip.cover && <img src={trip.cover} alt={trip.name} className="map-popup-img" />}
                          <div className="map-popup-name">{trip.name}</div>
                          {trip.date && <div className="map-popup-meta">{trip.date}</div>}
                          <div className="map-popup-meta">{trip.photoCount || 0} photos</div>
                          <button className="btn btn-accent btn-sm" style={{ marginTop: 8, width: '100%', justifyContent: 'center' }}
                            onClick={() => { setActiveTrip(trip.id); setTripsView('grid'); }}>
                            Open trip →
                          </button>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
            )}

            {/* ─ Grid view ─ */}
            {tripsView === 'grid' && (
              <div className="trips-grid">
                {trips.map((trip, i) => (
                  <div key={trip.id} className="trip-card fade-in"
                    style={{ animationDelay: `${i * 60}ms` }}
                    onClick={() => setActiveTrip(trip.id)}>
                    <div className={`trip-cover ${trip.cover ? '' : 'trip-cover-empty'}`}
                      style={trip.cover ? { backgroundImage: `url(${trip.cover})` } : {}}>
                      {!trip.cover && <span>🗺</span>}
                      <button className="trip-delete"
                        onClick={e => { e.stopPropagation(); setConfirmDelete(trip.id); }}>✕</button>
                      <button
                        className={`trip-share ${trip.shareToken ? 'trip-share-active' : ''}`}
                        title={trip.shareToken ? 'Shared — click to see link' : 'Share this trip'}
                        disabled={shareGenerating === trip.id}
                        onClick={e => { e.stopPropagation(); generateShareLink(trip); }}>
                        {shareGenerating === trip.id ? '…' : '↗'}
                      </button>
                    </div>
                    <div className="trip-info">
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                        <div className="trip-name">{trip.name}</div>
                        <button className="trip-edit-btn" title="Edit trip"
                          onClick={e => { e.stopPropagation(); openEditTrip(trip); }}>✎</button>
                      </div>
                      <div className="trip-meta">
                        {trip.country ? `${trip.country}${trip.date || trip.photoCount ? ' · ' : ''}` : ''}
                        {trip.date ? `${trip.date} · ` : ''}
                        {trip.photoCount || 0} photo{(trip.photoCount || 0) !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                ))}
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
                {activeTripData.date && <span className="gallery-date">{activeTripData.date}</span>}
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button
                  className={`btn btn-sm ${activeTripData.shareToken ? 'btn-accent' : ''}`}
                  onClick={() => generateShareLink(activeTripData)}
                  disabled={shareGenerating === activeTrip}>
                  {shareGenerating === activeTrip ? 'Generating…' : activeTripData.shareToken ? '↗ Shared' : '↗ Share'}
                </button>
                <div className="view-toggle">
                  <button className={`view-btn ${view === 'grid' ? 'active' : ''}`} onClick={() => setView('grid')}>Grid</button>
                  <button className={`view-btn ${view === 'list' ? 'active' : ''}`} onClick={() => setView('list')}>List</button>
                </div>
              </div>
            </div>

            {uploading && (
              <div className="upload-progress">
                <span className="spinner" />
                Uploading {uploadCount.done} of {uploadCount.total} photos…
              </div>
            )}
            {loadingPhotos && (
              <div style={{ textAlign: 'center', padding: 60 }}><span className="spinner" /></div>
            )}
            {!loadingPhotos && photos.length === 0 && !uploading && (
              <div className={`drop-zone ${dragging ? 'dragging' : ''}`}
                onClick={() => fileRef.current?.click()}
                onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}>
                <div className="drop-zone-icon">📷</div>
                <p style={{ fontSize: 15, marginBottom: 4 }}>Drag & drop photos here</p>
                <p style={{ fontSize: 12 }}>or click to browse</p>
              </div>
            )}
            {photos.length > 0 && view === 'grid' && (
              <div className="photo-grid" onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}>
                {photos.map((p, i) => (
                  <div key={p.id} className="photo-thumb fade-in" style={{ animationDelay: `${i * 30}ms` }}
                    onClick={() => setLightbox(p)}>
                    <img src={p.url} alt={p.name} loading="lazy" />
                  </div>
                ))}
                <div className="add-tile" onClick={() => fileRef.current?.click()}>+</div>
              </div>
            )}
            {photos.length > 0 && view === 'list' && (
              <div className="photo-list" onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}>
                {photos.map((p, i) => (
                  <div key={p.id} className="photo-list-item fade-in" style={{ animationDelay: `${i * 25}ms` }}
                    onClick={() => setLightbox(p)}>
                    <img src={p.url} alt={p.name} loading="lazy" />
                    <div>
                      <div className="photo-list-name">{p.name}</div>
                      {p.createdAt?.seconds && (
                        <div className="photo-list-date">{new Date(p.createdAt.seconds * 1000).toLocaleDateString()}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ═══ LIGHTBOX ═══ */}
      {lightbox && (
        <div className="lightbox fade-scale" onClick={() => setLightbox(null)}>
          <img src={lightbox.url} alt={lightbox.name} className="lightbox-img"
            onClick={e => e.stopPropagation()} />

          {/* Close */}
          <button className="lb-close" onClick={() => setLightbox(null)} title="Close">✕</button>

          {/* Left arrow */}
          {lbIndex > 0 && (
            <button className="lb-arrow lb-arrow-left" onClick={e => { e.stopPropagation(); navLightbox(-1); }}>
              ‹
            </button>
          )}

          {/* Right arrow */}
          {lbIndex < photos.length - 1 && (
            <button className="lb-arrow lb-arrow-right" onClick={e => { e.stopPropagation(); navLightbox(1); }}>
              ›
            </button>
          )}

          {/* Counter */}
          <div className="lb-counter">{lbIndex + 1} / {photos.length}</div>

          {/* Delete */}
          <button className="lb-delete" onClick={e => { e.stopPropagation(); deletePhoto(lightbox); }} title="Delete photo">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </button>
        </div>
      )}

      {/* ═══ DELETE TRIP CONFIRM ═══ */}
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

      {/* ═══ EDIT TRIP MODAL ═══ */}
      {editTrip && (
        <div className="modal-overlay fade-scale" onClick={() => setEditTrip(null)}>
          <div className="modal edit-modal" onClick={e => e.stopPropagation()}>
            <p className="modal-title">Edit Trip</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
              <div className="form-group">
                <label>Trip Name</label>
                <input value={editName} onChange={e => setEditName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && saveEditTrip()}
                  className="input" autoFocus />
              </div>
              <div className="form-group">
                <label>Date (optional)</label>
                <input type="date" value={editDate} onChange={e => setEditDate(e.target.value)} className="input" />
              </div>
              <div className="form-group">
                <label>Country (optional)</label>
                <input list="countries-list-edit" value={editCountry}
                  onChange={e => setEditCountry(e.target.value)}
                  placeholder="e.g. Italy" className="input" />
                <datalist id="countries-list-edit">
                  {Object.keys(COUNTRY_COORDS).map(c => <option key={c} value={c} />)}
                </datalist>
              </div>
            </div>
            <div className="modal-actions" style={{ marginTop: 20 }}>
              <button className="btn btn-sm" onClick={() => setEditTrip(null)}>Cancel</button>
              <button className="btn btn-accent" onClick={saveEditTrip}
                disabled={editSaving || !editName.trim()}>
                {editSaving ? 'Saving…' : 'Save'}
              </button>
            </div>
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
              <button className="btn btn-sm btn-accent"
                onClick={() => navigator.clipboard.writeText(shareModal.url)}>
                Copy
              </button>
            </div>
            <div className="modal-actions" style={{ marginTop: 20 }}>
              <button className="btn btn-sm btn-danger"
                onClick={() => {
                  const trip = trips.find(t => t.id === shareModal.tripId);
                  if (trip?.shareToken) revokeShareLink(trip.id, trip.shareToken);
                }}>
                Revoke link
              </button>
              <button className="btn btn-sm" onClick={() => setShareModal(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
