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
import { ThemeToggle } from './components/ThemeToggle';
import { TravelLoader } from './components/TravelLoader';
import { getTranslations } from './i18n';
import {
  ALLOWED_EMAILS, CONTINENT_ORDER, COUNTRY_CONTINENT, COUNTRY_ISO, COUNTRY_NAMES,
  GEO_URL, ISO_COUNTRY, SPANISH_COUNTRIES, WORLD_COUNTRIES,
} from './data/countries';
import { parseFbAlbum } from './utils/facebookAlbums';
import { compressImage, uploadPhotoVariants } from './utils/imageUtils';
import { formatDuration } from './utils/format';
import { isValidHttpUrl, parseEmailList } from './utils/validation';

export default function App() {
  // ─── Language (IP-based, falls back to browser language) ───
  const [isSpanish, setIsSpanish] = useState(() => (navigator.language || '').startsWith('es'));
  useEffect(() => {
    fetch('https://ipapi.co/json/')
      .then(r => r.json())
      .then(data => { if (data.country_code) setIsSpanish(SPANISH_COUNTRIES.has(data.country_code)); })
      .catch(() => {});
  }, []);
  const T = useMemo(() => getTranslations(isSpanish), [isSpanish]);

  // ─── Auth ───
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginError, setLoginError] = useState('');
  const [appNotice, setAppNotice] = useState(null); // { type: 'success' | 'error', message }
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
  const [loadedPhotoImages, setLoadedPhotoImages] = useState(new Set());
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
  const [signOutConfirm, setSignOutConfirm] = useState(null);
  const [view, setView] = useState('grid');
  const [tripsView, setTripsView] = useState('grid');
  const [photoRenderLimit, setPhotoRenderLimit] = useState(80);
  const [tripPreviewPhotos, setTripPreviewPhotos] = useState({});
  const [tripPreviewIndexes, setTripPreviewIndexes] = useState({});
  const [cityPreviewIndexes, setCityPreviewIndexes] = useState({});
  const [loadingTripPreviews, setLoadingTripPreviews] = useState(new Set());
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
  const [shareEmailError, setShareEmailError] = useState('');
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
  const [shareCopyStatus, setShareCopyStatus] = useState('');
  const [shareExpirySaving, setShareExpirySaving] = useState(false);

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

  const showNotice = useCallback((type, message) => {
    setAppNotice({ type, message });
  }, []);

  const clearNotice = useCallback(() => setAppNotice(null), []);

  const countryIsValid = useCallback((country) => {
    const trimmed = country.trim();
    return !trimmed || WORLD_COUNTRIES.includes(trimmed) || COUNTRY_NAMES.includes(trimmed);
  }, []);

  const validationText = useCallback((key, value) => {
    const messages = {
      tripNameRequired: isSpanish ? 'El nombre del viaje es obligatorio.' : 'Trip name is required.',
      invalidCountry: isSpanish ? 'El pais debe coincidir con la lista de paises.' : 'Country must match the country list.',
      invalidMiroUrl: isSpanish ? 'El enlace de Miro debe empezar con http:// o https://.' : 'The Miro link must start with http:// or https://.',
      tripCreateFailed: isSpanish ? 'No se pudo crear el viaje.' : 'Could not create the trip.',
      tripDeleteFailed: isSpanish ? 'No se pudo eliminar el viaje completo.' : 'Could not delete the trip completely.',
      noImageFiles: isSpanish ? 'Selecciona archivos de imagen validos.' : 'Select valid image files.',
      uploadFailedAll: isSpanish ? 'No se pudo subir ninguna foto.' : 'No photos could be uploaded.',
      saveFailed: isSpanish ? 'No se pudieron guardar los cambios.' : 'Could not save changes.',
      shareFailed: isSpanish ? 'No se pudo compartir el album.' : 'Could not share the album.',
      accessLoadFailed: isSpanish ? 'No se pudieron cargar los accesos.' : 'Could not load accesses.',
    };
    if (key === 'uploadFailedSome') {
      return isSpanish
        ? `${value} foto${value !== 1 ? 's' : ''} no se pudo subir.`
        : `${value} photo${value !== 1 ? 's' : ''} could not be uploaded.`;
    }
    return messages[key] || key;
  }, [isSpanish]);

  useEffect(() => {
    if (!appNotice) return undefined;
    const timer = window.setTimeout(() => setAppNotice(null), appNotice.type === 'success' ? 2600 : 5200);
    return () => window.clearTimeout(timer);
  }, [appNotice]);

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
  const handleSignOut = useCallback(() => {
    const messages = isSpanish
      ? [
          'Seguro que quieres cerrar sesion? Tus fotos prometen no montar una fiesta mientras no estas.',
          'Ultima llamada: si sales ahora, el mapa se queda mirando dramaticamente al horizonte. Continuar?',
          'Cerrar sesion? Los pepini viajeros haran guardia, pero no saben mucho de seguridad digital.',
          'Confirmemos esto con solemnidad absurda: abandonas la galeria por ahora?',
          'Te vas? Perfecto, pero que conste que el boton de logout empezo esto.',
        ]
      : [
          'Are you sure you want to sign out? Your photos promise not to throw a party while you are gone.',
          'Last call: if you leave now, the map will stare dramatically into the distance. Continue?',
          'Sign out? The traveling pepini will stand guard, but they are not cybersecurity experts.',
          'Let us confirm this with absurd solemnity: are you leaving the gallery for now?',
          'Leaving? Fine, but for the record, the logout button started it.',
        ];
    const message = messages[Math.floor(Math.random() * messages.length)];
    setSignOutConfirm(message);
  }, [isSpanish]);

  const confirmSignOut = useCallback(() => {
    setSignOutConfirm(null);
    setGuestMode(false);
    signOut(auth).catch(() => {});
  }, []);

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
      .then(async snap => {
        if (!snap.exists()) {
          setPublicShareData({ error: true });
          return;
        }
        const data = snap.data();
        if (data.expiresAt?.seconds && data.expiresAt.seconds * 1000 < Date.now()) {
          setPublicShareData({ error: true, expired: true });
          return;
        }
        // New links keep tripId for future dynamic reads when allowed by rules; legacy/snapshot links keep working.
        if (data.tripId) {
          try {
            const tripSnap = await getDoc(doc(db, 'trips', data.tripId));
            if (tripSnap.exists()) {
              const photosSnap = await getDocs(query(collection(db, 'trips', data.tripId, 'photos'), orderBy('createdAt', 'asc')));
              const photos = photosSnap.docs.map(d => {
                const p = d.data();
                return { url: p.url, thumbUrl: p.thumbUrl || null, name: p.name, description: p.description || '' };
              });
              setPublicShareData({
                ...data,
                tripName: tripSnap.data().name || data.tripName,
                tripDate: tripSnap.data().date || data.tripDate || null,
                photos,
              });
              return;
            }
          } catch {}
        }
        setPublicShareData(data);
      })
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
        else if (signOutConfirm) { setSignOutConfirm(null); }
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
    clearNotice();
    if (!newTripName.trim()) {
      showNotice('error', validationText('tripNameRequired'));
      return;
    }
    if (!countryIsValid(newTripCountry)) {
      showNotice('error', validationText('invalidCountry'));
      return;
    }
    if (!isValidHttpUrl(newTripMiro)) {
      showNotice('error', validationText('invalidMiroUrl'));
      return;
    }
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
    try {
      const docRef = await addDoc(tripsCol(), tripData);
      setTrips(prev => [{ id: docRef.id, ...tripData }, ...prev]);
      setNewTripName(''); setNewTripDate(''); setNewTripCountry(''); setNewTripMiro(''); setNewTripVisibility('shared'); setShowNewTrip(false);
    } catch (err) {
      console.error('Create trip error:', err);
      showNotice('error', validationText('tripCreateFailed'));
    }
  };

  const deleteTrip = async (tripId) => {
    if (isReadOnly) return;
    try {
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
    } catch (err) {
      console.error('Delete trip error:', err);
      showNotice('error', validationText('tripDeleteFailed'));
    }
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

  const loadTripPreviewPhotos = useCallback(async (tripId) => {
    if (tripPreviewPhotos[tripId]) return tripPreviewPhotos[tripId];
    setLoadingTripPreviews(prev => new Set(prev).add(tripId));
    try {
      const snap = await getDocs(query(photosCol(tripId), orderBy('createdAt', 'asc')));
      const loaded = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      const trip = trips.find(t => t.id === tripId);
      if (trip?.photoOrder?.length) {
        const orderMap = new Map(trip.photoOrder.map((id, i) => [id, i]));
        loaded.sort((a, b) => (orderMap.has(a.id) ? orderMap.get(a.id) : 9999) - (orderMap.has(b.id) ? orderMap.get(b.id) : 9999));
      }
      setTripPreviewPhotos(prev => ({ ...prev, [tripId]: loaded }));
      return loaded;
    } catch (err) {
      console.error('Load trip preview photos error:', err);
      return [];
    } finally {
      setLoadingTripPreviews(prev => {
        const next = new Set(prev);
        next.delete(tripId);
        return next;
      });
    }
  }, [tripPreviewPhotos, trips]);

  const navigateTripPreview = useCallback(async (e, trip, dir) => {
    e.stopPropagation();
    if ((trip.photoCount || 0) < 2) return;
    const loaded = tripPreviewPhotos[trip.id] || await loadTripPreviewPhotos(trip.id);
    if (!loaded.length) return;
    setTripPreviewIndexes(prev => {
      const coverIdx = loaded.findIndex(p => p.url === trip.cover || p.thumbUrl === trip.cover);
      const current = prev[trip.id] ?? (coverIdx >= 0 ? coverIdx : 0);
      return { ...prev, [trip.id]: (current + dir + loaded.length) % loaded.length };
    });
  }, [loadTripPreviewPhotos, tripPreviewPhotos]);

  const navigateCityPreview = useCallback((e, key, count, dir) => {
    e.stopPropagation();
    if (count < 2) return;
    setCityPreviewIndexes(prev => {
      const current = prev[key] ?? 0;
      return { ...prev, [key]: (current + dir + count) % count };
    });
  }, []);

  const handleFiles = useCallback(async (files) => {
    if (isReadOnly) return;
    if (!activeTrip || !files.length) return;
    const imageFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (!imageFiles.length) {
      showNotice('error', validationText('noImageFiles'));
      return;
    }
    clearNotice();
    setUploading(true);
    setUploadCount({ done: 0, total: imageFiles.length });
    const newPhotos = [];
    let failed = 0;
    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];
      try {
        const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
        const uploaded = await uploadPhotoVariants(file, `users/${user.uid}/trips/${activeTrip}`, fileName);
        const photoData = { name: file.name, ...uploaded, createdAt: serverTimestamp() };
        const docRef = await addDoc(photosCol(activeTrip), photoData);
        newPhotos.push({ id: docRef.id, ...photoData });
      } catch (err) {
        failed++;
        console.error('Upload error:', err);
      }
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
    if (failed > 0) {
      showNotice('error', failed === imageFiles.length ? validationText('uploadFailedAll') : validationText('uploadFailedSome', failed));
    }
    setUploading(false);
  }, [activeTrip, user, trips, isReadOnly, showNotice, clearNotice, validationText]);

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
    const wallpaperUrl = photo.url;
    if (!wallpaperUrl) return;
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
  const renderedDisplayPhotos = displayPhotos.slice(0, photoRenderLimit);
  const hiddenPhotoCount = Math.max(0, displayPhotos.length - renderedDisplayPhotos.length);
  const visiblePhotoLoadTarget = displayPhotos.slice(0, Math.min(displayPhotos.length, view === 'list' ? 8 : 12));
  const visiblePhotosLoaded = visiblePhotoLoadTarget.length === 0 ||
    visiblePhotoLoadTarget.every(p => loadedPhotoImages.has(p.id));
  const lbIndex = lightbox ? displayPhotos.findIndex(p => p.id === lightbox.id) : -1;
  const navLightbox = (dir) => { const next = lbIndex + dir; if (next >= 0 && next < displayPhotos.length) setLightbox(displayPhotos[next]); };

  useEffect(() => {
    setLoadedPhotoImages(new Set());
  }, [activeTrip, activeCity, view, photos.length]);

  useEffect(() => {
    setPhotoRenderLimit(view === 'list' ? 120 : 80);
  }, [activeTrip, activeCity, view, photos.length]);

  const markPhotoImageLoaded = (photoId) => {
    setLoadedPhotoImages(prev => {
      if (prev.has(photoId)) return prev;
      const next = new Set(prev);
      next.add(photoId);
      return next;
    });
  };

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
    if (!editTrip) return;
    clearNotice();
    if (!editName.trim()) {
      showNotice('error', validationText('tripNameRequired'));
      return;
    }
    if (!countryIsValid(editCountry)) {
      showNotice('error', validationText('invalidCountry'));
      return;
    }
    if (!isValidHttpUrl(editMiro)) {
      showNotice('error', validationText('invalidMiroUrl'));
      return;
    }
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
    } catch (err) {
      console.error('Edit trip error:', err);
      showNotice('error', validationText('saveFailed'));
    }
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
    } catch (err) {
      console.error('Edit city error:', err);
      showNotice('error', validationText('saveFailed'));
    }
    setEditCitySaving(false);
  };

  // ═══════════════════════════════════════
  // SHARE
  // ═══════════════════════════════════════
  const generateShareLink = async (trip) => {
    if (isReadOnly) return;
    if (trip.shareToken) {
      setShareCopyStatus('');
      setShareModal({
        tripId: trip.id,
        token: trip.shareToken,
        url: `${window.location.origin}/?share=${trip.shareToken}`,
        expiresAt: trip.shareExpiresAt || null,
      });
      return;
    }
    setShareGenerating(trip.id);
    clearNotice();
    try {
      const snap = await getDocs(query(photosCol(trip.id), orderBy('createdAt', 'asc')));
      const photosData = snap.docs.map(d => ({ url: d.data().url, thumbUrl: d.data().thumbUrl || null, name: d.data().name, description: d.data().description || '' }));
      const token = crypto.randomUUID();
      const linkData = {
        tripId: trip.id,
        ownerId: trip.ownerId || user?.uid || null,
        tripName: trip.name,
        tripDate: trip.date || null,
        photos: photosData,
        expiresAt: null,
        createdAt: serverTimestamp(),
      };
      await setDoc(doc(db, 'sharedLinks', token), linkData);
      await updateDoc(doc(db, 'trips', trip.id), { shareToken: token, shareExpiresAt: null });
      setTrips(prev => prev.map(t => t.id === trip.id ? { ...t, shareToken: token, shareExpiresAt: null } : t));
      setShareCopyStatus('');
      setShareModal({ tripId: trip.id, token, url: `${window.location.origin}/?share=${token}`, expiresAt: null });
    } catch (err) {
      console.error('Share error:', err);
      showNotice('error', validationText('shareFailed'));
    }
    setShareGenerating(null);
  };

  const revokeShareLink = async (tripId, shareToken) => {
    if (isReadOnly) return;
    try {
      await deleteDoc(doc(db, 'sharedLinks', shareToken));
      await updateDoc(doc(db, 'trips', tripId), { shareToken: null, shareExpiresAt: null });
      setTrips(prev => prev.map(t => t.id === tripId ? { ...t, shareToken: null, shareExpiresAt: null } : t));
      setShareModal(null);
    } catch (err) {
      console.error('Revoke error:', err);
      showNotice('error', validationText('shareFailed'));
    }
  };

  const updateShareExpiry = async (days) => {
    if (!shareModal?.token || isReadOnly) return;
    setShareExpirySaving(true);
    setShareCopyStatus('');
    try {
      const expiresAt = days ? new Date(Date.now() + Number(days) * 24 * 60 * 60 * 1000) : null;
      await updateDoc(doc(db, 'sharedLinks', shareModal.token), { expiresAt });
      await updateDoc(doc(db, 'trips', shareModal.tripId), { shareExpiresAt: expiresAt });
      setShareModal(prev => ({ ...prev, expiresAt }));
      setTrips(prev => prev.map(t => t.id === shareModal.tripId ? { ...t, shareExpiresAt: expiresAt } : t));
      showNotice('success', T.shareExpirySaved);
    } catch (err) {
      console.error('Share expiry error:', err);
      showNotice('error', validationText('shareFailed'));
    }
    setShareExpirySaving(false);
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
  const handleShareAlbumsClick = () => {
    const { valid, invalid } = parseEmailList(shareEmailsInput);
    if (invalid.length > 0) {
      setShareEmailError(T.invalidEmails(invalid));
      return;
    }
    if (valid.length === 0) {
      setShareEmailError(T.enterAtLeastOneEmail);
      return;
    }
    setShareEmailError('');
    shareAlbums(valid);
  };

  const shareAlbums = async (emails) => {
    if (isReadOnly) return;
    if (!emails.length || !selectedTrips.size) return;
    setSharingAlbums(true);
    clearNotice();
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
      setShareEmailError('');
      setShareSuccess({ emails, tripNames: sharedTripNames });
    } catch (err) {
      console.error('Error sharing albums:', err);
      showNotice('error', validationText('shareFailed'));
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
      showNotice('error', validationText('accessLoadFailed'));
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
      showNotice('error', validationText('saveFailed'));
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
  const logoSrc = darkMode ? '/logo-dark.png' : '/logo.png';
  const themeToggleProps = {
    darkMode,
    onToggle: () => setDarkMode(d => !d),
    lightLabel: T.lightMode,
    darkLabel: T.darkMode,
  };
  const modalProps = { role: 'dialog', 'aria-modal': 'true', tabIndex: -1 };


  if (publicShareLoading) return <div className="login-page"><span className="spinner" style={{ width: 28, height: 28 }} /></div>;

  if (publicShareData) {
    if (publicShareData.error) return (
      <div className="login-page"><div className="login-card">
        <ThemeToggle {...themeToggleProps} className="login-theme-toggle" />
        <img src={logoSrc} alt="Pepini per il mondo" className="login-logo-img" />
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{publicShareData.expired ? T.sharedLinkExpired : T.sharedLinkInvalid}</p>
      </div></div>
    );
    const pubPhotos = publicShareData.photos || [];
    return (
      <div>
        <header className="header">
          <div className="header-logo-wrap">
            <img src={logoSrc} alt="Pepini per il mondo" className="header-logo-img" />
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
                <img src={p.thumbUrl || p.url} alt={p.name} loading="lazy" />
              </div>
            ))}
          </div>
        </div>
        {publicLightbox && (
          <div className="lightbox fade-scale" role="dialog" aria-modal="true" onClick={() => setPublicLightbox(null)}>
            <img src={publicLightbox.url} alt={publicLightbox.name} className="lightbox-img" onClick={e => e.stopPropagation()} />
            <button className="lb-close" aria-label={T.close} onClick={() => setPublicLightbox(null)}>✕</button>
            {publicLbIdx > 0 && <button className="lb-arrow lb-arrow-left" aria-label={isSpanish ? 'Foto anterior' : 'Previous photo'} onClick={e => { e.stopPropagation(); const n = publicLbIdx - 1; setPublicLbIdx(n); setPublicLightbox(pubPhotos[n]); }}>‹</button>}
            {publicLbIdx < pubPhotos.length - 1 && <button className="lb-arrow lb-arrow-right" aria-label={isSpanish ? 'Foto siguiente' : 'Next photo'} onClick={e => { e.stopPropagation(); const n = publicLbIdx + 1; setPublicLbIdx(n); setPublicLightbox(pubPhotos[n]); }}>›</button>}
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
          <ThemeToggle {...themeToggleProps} className="login-theme-toggle" />
          <img src={logoSrc} alt="Pepini per il mondo" className="login-logo-img" />
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
          <ThemeToggle {...themeToggleProps} className="login-theme-toggle" />
          <img src={logoSrc} alt="Pepini per il mondo" className="login-logo-img" />
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
            <img src={logoSrc} alt="Pepini per il mondo" className="header-logo-img" />
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
          <ThemeToggle {...themeToggleProps} />
          <button className="btn-icon" onClick={handleSignOut} title={T.signOut}>
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
        {appNotice && (
          <div className={`app-notice app-notice-${appNotice.type} fade-scale`} role="status" aria-live="polite">
            <span>{appNotice.message}</span>
            <button type="button" className="app-notice-close" onClick={clearNotice} aria-label={T.close}>×</button>
          </div>
        )}

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

            {loadingTrips && <TravelLoader label={T.loadingTrips} />}

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
                  const previewPhotos = tripPreviewPhotos[trip.id] || [];
                  const previewIndex = tripPreviewIndexes[trip.id] ?? 0;
                  const previewPhoto = previewPhotos[previewIndex];
                  const previewUrl = previewPhoto?.thumbUrl || previewPhoto?.url || trip.cover;
                  const canSlide = (trip.photoCount || 0) > 1;
                  const previewLoading = loadingTripPreviews.has(trip.id);
                  return (
                  <div key={trip.id} className="trip-card fade-in" style={{ animationDelay: `${i * 60}ms` }} onClick={() => setActiveTrip(trip.id)}>
                    <div className={`trip-cover ${previewUrl ? '' : 'trip-cover-empty'}`}>
                      {previewUrl && <img key={previewUrl} className="trip-cover-img" src={previewUrl} alt="" loading="lazy" decoding="async" />}
                      {!previewUrl && <span>🗺</span>}
                      {isOwner && <button className="trip-delete" onClick={e => { e.stopPropagation(); setConfirmDelete(trip.id); }}>✕</button>}
                      {canSlide && (
                        <>
                          <button
                            className="trip-slider-btn trip-slider-prev"
                            onClick={e => navigateTripPreview(e, trip, -1)}
                            title={isSpanish ? 'Foto anterior' : 'Previous photo'}
                            aria-label={isSpanish ? 'Foto anterior' : 'Previous photo'}
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                          </button>
                          <button
                            className="trip-slider-btn trip-slider-next"
                            onClick={e => navigateTripPreview(e, trip, 1)}
                            title={isSpanish ? 'Foto siguiente' : 'Next photo'}
                            aria-label={isSpanish ? 'Foto siguiente' : 'Next photo'}
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                          </button>
                          <div className="trip-slider-indicator">
                            {previewLoading
                              ? <span className="trip-slider-spinner" />
                              : `${previewPhotos.length ? previewIndex + 1 : 1}/${trip.photoCount || previewPhotos.length}`}
                          </div>
                        </>
                      )}
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
                  const cityPhotos = cityGroups[city];
                  const cityPreviewKey = `${activeTripData.id}::${city}`;
                  const cityPreviewIndex = cityPreviewIndexes[cityPreviewKey] ?? 0;
                  const cityPreviewPhoto = cityPhotos[cityPreviewIndex] || cityPhotos[0];
                  const coverUrl = cityPreviewPhoto?.thumbUrl || cityPreviewPhoto?.url;
                  const isOwner = !isReadOnly && (!activeTripData?.ownerId || activeTripData?.ownerId === user?.uid);
                  const cityVis = activeTripData?.cityMetadata?.[city]?.visibility || activeTripData?.visibility || 'shared';
                  return (
                    <div key={city} className="trip-card fade-in" style={{ animationDelay: `${i * 60}ms` }}
                      onClick={() => setActiveCity(city)}>
                      <div className={`trip-cover ${coverUrl ? '' : 'trip-cover-empty'}`}>
                        {coverUrl && <img key={coverUrl} className="trip-cover-img" src={coverUrl} alt="" loading="lazy" decoding="async" />}
                        {cityPhotos.length > 1 && (
                          <>
                            <button
                              className="trip-slider-btn trip-slider-prev"
                              onClick={e => navigateCityPreview(e, cityPreviewKey, cityPhotos.length, -1)}
                              title={isSpanish ? 'Foto anterior' : 'Previous photo'}
                              aria-label={isSpanish ? 'Foto anterior' : 'Previous photo'}
                            >
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                            </button>
                            <button
                              className="trip-slider-btn trip-slider-next"
                              onClick={e => navigateCityPreview(e, cityPreviewKey, cityPhotos.length, 1)}
                              title={isSpanish ? 'Foto siguiente' : 'Next photo'}
                              aria-label={isSpanish ? 'Foto siguiente' : 'Next photo'}
                            >
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                            </button>
                            <div className="trip-slider-indicator">{`${cityPreviewIndex + 1}/${cityPhotos.length}`}</div>
                          </>
                        )}
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
                  const cityPreviewKey = `${activeTripData.id}::__uncategorized__`;
                  const cityPreviewIndex = cityPreviewIndexes[cityPreviewKey] ?? 0;
                  const cityPreviewPhoto = cityUncategorized[cityPreviewIndex] || cityUncategorized[0];
                  const coverUrl = cityPreviewPhoto?.thumbUrl || cityPreviewPhoto?.url;
                  return (
                    <div className="trip-card fade-in" style={{ animationDelay: `${Object.keys(cityGroups).length * 60}ms` }}
                      onClick={() => setActiveCity('__uncategorized__')}>
                      <div className={`trip-cover ${coverUrl ? '' : 'trip-cover-empty'}`}>
                        {coverUrl && <img key={coverUrl} className="trip-cover-img" src={coverUrl} alt="" loading="lazy" decoding="async" />}
                        {cityUncategorized.length > 1 && (
                          <>
                            <button
                              className="trip-slider-btn trip-slider-prev"
                              onClick={e => navigateCityPreview(e, cityPreviewKey, cityUncategorized.length, -1)}
                              title={isSpanish ? 'Foto anterior' : 'Previous photo'}
                              aria-label={isSpanish ? 'Foto anterior' : 'Previous photo'}
                            >
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                            </button>
                            <button
                              className="trip-slider-btn trip-slider-next"
                              onClick={e => navigateCityPreview(e, cityPreviewKey, cityUncategorized.length, 1)}
                              title={isSpanish ? 'Foto siguiente' : 'Next photo'}
                              aria-label={isSpanish ? 'Foto siguiente' : 'Next photo'}
                            >
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                            </button>
                            <div className="trip-slider-indicator">{`${cityPreviewIndex + 1}/${cityUncategorized.length}`}</div>
                          </>
                        )}
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
                {loadingPhotos && <TravelLoader label={T.loadingPhotos} />}
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
                    <div className="photo-display-wrap">
                      {!visiblePhotosLoaded && <div className="photo-image-loader"><TravelLoader label={T.loadingPhotos} /></div>}
                      <div className={`photo-grid${!visiblePhotosLoaded ? ' photos-loading' : ''}`} onDragOver={canDrag ? onDragOver : undefined} onDragLeave={canDrag ? onDragLeave : undefined} onDrop={canDrag ? onDrop : undefined}>
                      {renderedDisplayPhotos.map((p, i) => {
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
                            <img src={p.thumbUrl || p.url} alt={p.name} loading="lazy" decoding="async" onLoad={() => markPhotoImageLoaded(p.id)} onError={() => markPhotoImageLoaded(p.id)} />
                            {canDrag && <div className="photo-drag-handle">⠿</div>}
                            {p.description && <div className="photo-desc-badge" title={p.description}>✎</div>}
                          </div>
                        );
                      })}
                      {hiddenPhotoCount > 0 && (
                        <button className="load-more-photos" onClick={() => setPhotoRenderLimit(n => n + 80)}>
                          {T.showMorePhotos(Math.min(hiddenPhotoCount, 80))}
                        </button>
                      )}
                      {canDrag && <div className="add-tile" onClick={() => fileRef.current?.click()}>+</div>}
                      </div>
                    </div>
                  );
                })()}

                {displayPhotos.length > 0 && view === 'list' && (
                  <div className="photo-display-wrap">
                    {!visiblePhotosLoaded && <div className="photo-image-loader"><TravelLoader label={T.loadingPhotos} /></div>}
                    <div className={`photo-list${!visiblePhotosLoaded ? ' photos-loading' : ''}`}>
                    {renderedDisplayPhotos.map((p, i) => (
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
                        <img src={p.thumbUrl || p.url} alt={p.name} loading="lazy" decoding="async" onLoad={() => markPhotoImageLoaded(p.id)} onError={() => markPhotoImageLoaded(p.id)} onClick={() => setLightbox(p)} style={{ cursor: 'pointer' }} />
                        <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => setLightbox(p)}>
                          <div className="photo-list-name">{p.name}</div>
                          {p.description && <div className="photo-list-desc">{p.description}</div>}
                          {p.createdAt?.seconds && <div className="photo-list-date">{new Date(p.createdAt.seconds * 1000).toLocaleDateString()}</div>}
                        </div>
                      </div>
                    ))}
                    {hiddenPhotoCount > 0 && (
                      <button className="load-more-list" onClick={() => setPhotoRenderLimit(n => n + 120)}>
                        {T.showMorePhotos(Math.min(hiddenPhotoCount, 120))}
                      </button>
                    )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* ═══ LIGHTBOX ═══ */}
      {lightbox && (
        <div className="lightbox fade-scale" role="dialog" aria-modal="true" onClick={() => setLightbox(null)}>
          <img src={lightbox.url} alt={lightbox.name} className="lightbox-img" onClick={e => e.stopPropagation()} />
          <button className="lb-close" aria-label={T.close} onClick={() => setLightbox(null)}>✕</button>
          {lbIndex > 0 && <button className="lb-arrow lb-arrow-left" aria-label={isSpanish ? 'Foto anterior' : 'Previous photo'} onClick={e => { e.stopPropagation(); navLightbox(-1); }}>‹</button>}
          {lbIndex < displayPhotos.length - 1 && <button className="lb-arrow lb-arrow-right" aria-label={isSpanish ? 'Foto siguiente' : 'Next photo'} onClick={e => { e.stopPropagation(); navLightbox(1); }}>›</button>}
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
      {signOutConfirm && (
        <div className="modal-overlay fade-scale" onClick={() => setSignOutConfirm(null)}>
          <div {...modalProps} className="modal signout-modal" onClick={e => e.stopPropagation()}>
            <div className="signout-icon" aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </div>
            <p className="modal-title">{isSpanish ? 'Antes de salir...' : 'Before you go...'}</p>
            <p className="modal-sub signout-message">{signOutConfirm}</p>
            <div className="modal-actions">
              <button className="btn btn-sm" onClick={() => setSignOutConfirm(null)}>{T.cancel}</button>
              <button className="btn btn-accent" onClick={confirmSignOut}>{T.signOut}</button>
            </div>
          </div>
        </div>
      )}

      {!isReadOnly && confirmDelete && (
        <div className="modal-overlay fade-scale" onClick={() => setConfirmDelete(null)}>
          <div {...modalProps} className="modal" onClick={e => e.stopPropagation()}>
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
          <div {...modalProps} className="modal edit-modal" onClick={e => e.stopPropagation()}>
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
          <div {...modalProps} className="modal edit-modal" onClick={e => e.stopPropagation()}>
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
          <div {...modalProps} className="modal" onClick={e => e.stopPropagation()}>
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
          <div {...modalProps} className="modal" onClick={e => e.stopPropagation()}>
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
          <div {...modalProps} className="modal" onClick={e => e.stopPropagation()}>
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
          <div {...modalProps} className="modal fb-import-modal" onClick={e => e.stopPropagation()}>

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
        <div className="modal-overlay fade-scale" onClick={() => { setShareModal(null); setShareCopyStatus(''); }}>
          <div {...modalProps} className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 460 }}>
            <p className="modal-title">{T.shareTripTitle}</p>
            <p className="modal-sub">{T.shareLinkNote}</p>
            <div className="share-url-box">
              <span className="share-url-text">{shareModal.url}</span>
              <button
                className="btn btn-sm btn-accent"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(shareModal.url);
                    setShareCopyStatus('success');
                  } catch {
                    setShareCopyStatus('error');
                  }
                }}
              >
                {T.copy}
              </button>
            </div>
            {shareCopyStatus && (
              <p className={`field-${shareCopyStatus === 'success' ? 'success' : 'error'}`}>
                {shareCopyStatus === 'success' ? T.linkCopied : T.linkCopyFailed}
              </p>
            )}
            <div className="share-expiry-control">
              <label>{T.shareExpiryLabel}</label>
              <select
                className="input share-expiry-select"
                value={shareModal.expiresAt ? 'custom' : 'never'}
                onChange={e => updateShareExpiry(e.target.value === 'never' ? null : e.target.value)}
                disabled={shareExpirySaving}
              >
                {shareModal.expiresAt && <option value="custom">{T.shareExpiresOn(new Date(shareModal.expiresAt.seconds ? shareModal.expiresAt.seconds * 1000 : shareModal.expiresAt).toLocaleDateString())}</option>}
                <option value="never">{T.shareExpiryNever}</option>
                <option value="7">{T.shareExpiry7}</option>
                <option value="30">{T.shareExpiry30}</option>
                <option value="90">{T.shareExpiry90}</option>
              </select>
              {shareModal.expiresAt && (
                <p className="share-expiry-note">
                  {T.shareExpiresOn(new Date(shareModal.expiresAt.seconds ? shareModal.expiresAt.seconds * 1000 : shareModal.expiresAt).toLocaleDateString())}
                </p>
              )}
            </div>
            <div className="modal-actions" style={{ marginTop: 20 }}>
              <button className="btn btn-sm btn-danger" onClick={() => { const trip = trips.find(t => t.id === shareModal.tripId); if (trip?.shareToken) revokeShareLink(trip.id, trip.shareToken); }}>{T.revokeLink}</button>
              <button className="btn btn-sm" onClick={() => { setShareModal(null); setShareCopyStatus(''); }}>{T.close}</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ SHARE ALBUMS MODAL ═══ */}
      {!isReadOnly && shareAlbumsModal && (
        <div className="modal-overlay fade-scale" onClick={() => { setShareAlbumsModal(false); setShareEmailError(''); }}>
          <div {...modalProps} className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
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
                onChange={e => { setShareEmailsInput(e.target.value); setShareEmailError(''); }}
                placeholder={T.emailPlaceholder}
                autoFocus
              />
              {shareEmailError && <p className="field-error">{shareEmailError}</p>}
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                {T.emailNote}
              </p>
            </div>
            <div className="modal-actions" style={{ marginTop: 16 }}>
              <button className="btn btn-sm" onClick={() => { setShareAlbumsModal(false); setShareEmailError(''); }}>{T.cancel}</button>
              <button
                className="btn btn-accent"
                onClick={handleShareAlbumsClick}
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
          <div {...modalProps} className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 440, textAlign: 'center' }}>
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
          <div {...modalProps} className="modal manage-accesses-modal" onClick={e => e.stopPropagation()}>
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
