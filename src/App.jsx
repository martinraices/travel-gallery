import { useState, useEffect, useRef, useCallback } from 'react';
import { auth, db, storage } from './firebase';
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from 'firebase/auth';
import {
  collection, addDoc, getDocs, deleteDoc, doc, updateDoc,
  query, orderBy, serverTimestamp,
} from 'firebase/firestore';
import {
  ref, uploadBytes, getDownloadURL, deleteObject,
} from 'firebase/storage';

// ─── Image compression helper ───
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
  // ─── Auth state ───
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  // ─── App state ───
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
  const [lightbox, setLightbox] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [view, setView] = useState('grid');
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef();

  // ─── Listen to auth ───
  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
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

  // ─── Keyboard nav for lightbox ───
  useEffect(() => {
    const handler = (e) => {
      if (!lightbox) return;
      if (e.key === 'Escape') setLightbox(null);
      if (e.key === 'ArrowLeft') navLightbox(-1);
      if (e.key === 'ArrowRight') navLightbox(1);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  });

  // ═══════════════════════════════════════
  // AUTH
  // ═══════════════════════════════════════
  const handleLogin = async () => {
    setLoginError('');
    setLoggingIn(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      const msg = err.code === 'auth/invalid-credential'
        ? 'Invalid email or password'
        : err.code === 'auth/too-many-requests'
        ? 'Too many attempts — try again later'
        : 'Login failed';
      setLoginError(msg);
    }
    setLoggingIn(false);
  };

  // ═══════════════════════════════════════
  // TRIPS (Firestore)
  // ═══════════════════════════════════════
  const tripsCol = () => collection(db, 'users', user.uid, 'trips');

  const loadTrips = async () => {
    setLoadingTrips(true);
    try {
      const q = query(tripsCol(), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setTrips(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) { console.error('Load trips error:', err); }
    setLoadingTrips(false);
  };

  const addTrip = async () => {
    if (!newTripName.trim()) return;
    const tripData = {
      name: newTripName.trim(),
      date: newTripDate || null,
      cover: null,
      photoCount: 0,
      createdAt: serverTimestamp(),
    };
    const docRef = await addDoc(tripsCol(), tripData);
    setTrips(prev => [{ id: docRef.id, ...tripData }, ...prev]);
    setNewTripName(''); setNewTripDate(''); setShowNewTrip(false);
  };

  const deleteTrip = async (tripId) => {
    // Delete all photos in storage + firestore subcollection
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
  // PHOTOS (Storage + Firestore)
  // ═══════════════════════════════════════
  const photosCol = (tripId) => collection(db, 'users', user.uid, 'trips', tripId, 'photos');

  const loadPhotos = async (tripId) => {
    setLoadingPhotos(true);
    try {
      const q = query(photosCol(tripId), orderBy('createdAt', 'asc'));
      const snap = await getDocs(q);
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

        const photoData = {
          name: file.name,
          url,
          storagePath,
          createdAt: serverTimestamp(),
        };
        const docRef = await addDoc(photosCol(activeTrip), photoData);
        newPhotos.push({ id: docRef.id, ...photoData });
      } catch (err) { console.error('Upload error:', err); }
      setUploadCount(prev => ({ ...prev, done: i + 1 }));
    }

    setPhotos(prev => [...prev, ...newPhotos]);

    // Update cover & count
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
    // Update count
    const trip = trips.find(t => t.id === activeTrip);
    if (trip) {
      const newCount = Math.max(0, (trip.photoCount || 1) - 1);
      await updateDoc(doc(db, 'users', user.uid, 'trips', activeTrip), { photoCount: newCount });
      setTrips(prev => prev.map(t => t.id === activeTrip ? { ...t, photoCount: newCount } : t));
    }
    setLightbox(null);
  };

  // ─── Lightbox helpers ───
  const lbIndex = lightbox ? photos.findIndex(p => p.id === lightbox.id) : -1;
  const navLightbox = (dir) => {
    const next = lbIndex + dir;
    if (next >= 0 && next < photos.length) setLightbox(photos[next]);
  };

  // ─── Drag & Drop ───
  const onDragOver = (e) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);
  const onDrop = (e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); };

  // ═══════════════════════════════════════
  // LOADING
  // ═══════════════════════════════════════
  if (authLoading) {
    return (
      <div className="login-page">
        <div className="spinner" style={{ width: 28, height: 28 }} />
      </div>
    );
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="Email" className="input" style={{ textAlign: 'center' }}
              autoComplete="email"
            />
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="Password" className="input" style={{ textAlign: 'center' }}
              autoComplete="current-password"
            />
            <button onClick={handleLogin} className="btn btn-accent" disabled={loggingIn}
              style={{ justifyContent: 'center', opacity: loggingIn ? .6 : 1 }}>
              {loggingIn ? <><span className="spinner" style={{ width: 14, height: 14 }} /> Signing in…</> : 'Unlock'}
            </button>
          </div>
          {loginError && <p className="login-error">{loginError}</p>}
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════
  // MAIN APP
  // ═══════════════════════════════════════
  const activeTripData = trips.find(t => t.id === activeTrip);

  return (
    <div>
      {/* ─── Header ─── */}
      <header className="header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {activeTrip && (
            <button className="btn btn-sm" onClick={() => setActiveTrip(null)}>
              ← Trips
            </button>
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
                  <input type="date" value={newTripDate} onChange={e => setNewTripDate(e.target.value)}
                    className="input" />
                </div>
                <button onClick={addTrip} className="btn btn-accent">Create</button>
                <button onClick={() => { setShowNewTrip(false); setNewTripName(''); setNewTripDate(''); }}
                  className="btn btn-sm">Cancel</button>
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

            <div className="trips-grid">
              {trips.map((trip, i) => (
                <div key={trip.id} className="trip-card fade-in"
                  style={{ animationDelay: `${i * 60}ms` }}
                  onClick={() => setActiveTrip(trip.id)}>
                  <div className={`trip-cover ${trip.cover ? '' : 'trip-cover-empty'}`}
                    style={trip.cover ? { backgroundImage: `url(${trip.cover})` } : {}}>
                    {!trip.cover && <span>🗺</span>}
                    <button className="trip-delete" onClick={e => { e.stopPropagation(); setConfirmDelete(trip.id); }}>✕</button>
                  </div>
                  <div className="trip-info">
                    <div className="trip-name">{trip.name}</div>
                    <div className="trip-meta">
                      {trip.date || ''}{trip.date ? ' · ' : ''}{trip.photoCount || 0} photo{(trip.photoCount || 0) !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
              <div className="view-toggle">
                <button className={`view-btn ${view === 'grid' ? 'active' : ''}`} onClick={() => setView('grid')}>Grid</button>
                <button className={`view-btn ${view === 'list' ? 'active' : ''}`} onClick={() => setView('list')}>List</button>
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
          <div onClick={e => e.stopPropagation()} style={{ position: 'relative' }}>
            <img src={lightbox.url} alt={lightbox.name} className="lightbox-img" />
            <div className="lightbox-bar">
              <span className="lightbox-name">{lightbox.name}</span>
              <div className="lightbox-nav">
                {lbIndex > 0 && <button className="btn btn-sm" onClick={() => navLightbox(-1)}>← Prev</button>}
                {lbIndex < photos.length - 1 && <button className="btn btn-sm" onClick={() => navLightbox(1)}>Next →</button>}
                <button className="btn btn-sm btn-danger" onClick={() => deletePhoto(lightbox)}>Delete</button>
              </div>
            </div>
          </div>
          <button className="lightbox-close" onClick={() => setLightbox(null)}>✕</button>
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
    </div>
  );
}
