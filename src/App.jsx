import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { auth, db, functions as firebaseFunctions, storage } from './firebase';
import {
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
} from 'firebase/auth';
import {
  collection, addDoc, getDocs, deleteDoc, doc, updateDoc,
  query, where, orderBy, limit, serverTimestamp, getDoc, setDoc, writeBatch, arrayUnion, arrayRemove,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import {
  ref, uploadBytes, getDownloadURL, deleteObject, listAll,
} from 'firebase/storage';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import { ThemeToggle } from './components/ThemeToggle';
import { TravelLoader } from './components/TravelLoader';
import { getTranslations } from './i18n';
import {
  ADMIN_EMAILS, ALLOWED_EMAILS, CONTINENT_ORDER, COUNTRY_CONTINENT, COUNTRY_ISO, COUNTRY_NAMES,
  GEO_URL, ISO_COUNTRY, SPANISH_COUNTRIES, WORLD_COUNTRIES,
} from './data/countries';
import { parseFbAlbum } from './utils/facebookAlbums';
import { compressImage, uploadPhotoVariants } from './utils/imageUtils';
import { formatDuration } from './utils/format';
import { isValidHttpUrl } from './utils/validation';

function CrossfadeImage({ src, alt = '', className = '', currentClassName = '', incomingClassName = '', loading = 'lazy', decoding = 'async' }) {
  const [displaySrc, setDisplaySrc] = useState(src || '');
  const [incomingSrc, setIncomingSrc] = useState('');

  useEffect(() => {
    if (!src) {
      setDisplaySrc('');
      setIncomingSrc('');
      return undefined;
    }
    if (src === displaySrc || src === incomingSrc) return undefined;

    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      if (!cancelled) setIncomingSrc(src);
    };
    img.onerror = () => {
      if (!cancelled && !displaySrc) setDisplaySrc(src);
    };
    img.src = src;
    if (img.complete && img.naturalWidth > 0) setIncomingSrc(src);

    return () => { cancelled = true; };
  }, [src, displaySrc, incomingSrc]);

  const finishTransition = useCallback(() => {
    if (!incomingSrc) return;
    setDisplaySrc(incomingSrc);
    setIncomingSrc('');
  }, [incomingSrc]);

  useEffect(() => {
    if (!incomingSrc) return undefined;
    const timer = window.setTimeout(finishTransition, 260);
    return () => window.clearTimeout(timer);
  }, [incomingSrc, finishTransition]);

  if (!displaySrc && !incomingSrc) return null;

  return (
    <>
      {displaySrc && <img className={`${className} ${currentClassName}`.trim()} src={displaySrc} alt={alt} loading={loading} decoding={decoding} />}
      {incomingSrc && (
        <img
          className={`${className} ${incomingClassName}`.trim()}
          src={incomingSrc}
          alt={alt}
          loading="eager"
          decoding={decoding}
          onAnimationEnd={finishTransition}
        />
      )}
    </>
  );
}

function TripCoverImage({ src, alt = '' }) {
  return (
    <CrossfadeImage
      src={src}
      alt={alt}
      className="trip-cover-img"
      currentClassName="trip-cover-img-current"
      incomingClassName="trip-cover-img-incoming"
    />
  );
}

function TripCoverLoader({ label }) {
  return (
    <div className="trip-cover-loader">
      <TravelLoader label={label} />
    </div>
  );
}

const PHOTO_GRID_BATCH_SIZE = 24;
const PHOTO_LIST_BATCH_SIZE = 40;

function LazyPhotoImage({ src, alt = '', className = '', onLoad, onError, onClick, style }) {
  const [shouldLoad, setShouldLoad] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    setShouldLoad(false);
  }, [src]);

  useEffect(() => {
    const node = wrapRef.current;
    if (!node || shouldLoad) return undefined;
    if (!('IntersectionObserver' in window)) {
      setShouldLoad(true);
      return undefined;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setShouldLoad(true);
        observer.disconnect();
      }
    }, { rootMargin: '0px', threshold: 0.01 });

    observer.observe(node);
    return () => observer.disconnect();
  }, [shouldLoad, src]);

  return (
    <span ref={wrapRef} className={`lazy-photo-frame ${className}`.trim()} onClick={onClick} style={style}>
      {shouldLoad ? (
        <img src={src} alt={alt} loading="lazy" decoding="async" onLoad={onLoad} onError={onError} />
      ) : (
        <span className="lazy-photo-placeholder" aria-hidden="true" />
      )}
    </span>
  );
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
  const T = useMemo(() => getTranslations(isSpanish), [isSpanish]);

  // ─── Auth ───
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginError, setLoginError] = useState('');
  const [loginInfo, setLoginInfo] = useState('');
  const [pendingAccessUser, setPendingAccessUser] = useState(null);
  const [pausedAccessEmail, setPausedAccessEmail] = useState('');
  const [submittingAccessRequest, setSubmittingAccessRequest] = useState(false);
  const [appNotice, setAppNotice] = useState(null); // { type: 'success' | 'error', message }
  const [loggingIn, setLoggingIn] = useState(false);
  const [guestLoggingIn, setGuestLoggingIn] = useState(false);
  const [guestMode, setGuestMode] = useState(false);
  const [creatorMap, setCreatorMap] = useState({}); // { [uid]: email }
  const isGuest = guestMode || !!user?.isAnonymous;
  const isReadOnly = isGuest;
  const isAdminUser = !!user?.email && ADMIN_EMAILS.map(e => e.toLowerCase()).includes(user.email.toLowerCase());
  const canUseFaceRecognition = !!user && !isReadOnly;

  // ─── Core state ───
  const [trips, setTrips] = useState([]);
  const [activeTrip, setActiveTrip] = useState(null);
  const [activeSharedCollection, setActiveSharedCollection] = useState(false);
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
  const [photoRenderLimit, setPhotoRenderLimit] = useState(PHOTO_GRID_BATCH_SIZE);
  const [publicPhotoRenderLimit, setPublicPhotoRenderLimit] = useState(PHOTO_GRID_BATCH_SIZE);
  const [tripPreviewPhotos, setTripPreviewPhotos] = useState({});
  const [tripPreviewIndexes, setTripPreviewIndexes] = useState({});
  const [cityPreviewIndexes, setCityPreviewIndexes] = useState({});
  const [loadingTripPreviews, setLoadingTripPreviews] = useState(new Set());
  const [loadingTripCovers, setLoadingTripCovers] = useState(new Set());
  const [tripSort, setTripSort] = useState(null);
  const [albumSearch, setAlbumSearch] = useState('');
  const [appWallpaperUrl, setAppWallpaperUrl] = useState('');
  const [scrollFade, setScrollFade] = useState('');
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef();
  const photoLoadMoreRef = useRef(null);
  const publicPhotoLoadMoreRef = useRef(null);
  const lastScrollYRef = useRef(0);
  const scrollFadeTimerRef = useRef(null);
  const loadingTripCoversRef = useRef(new Set());

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
  const [shareAlbumsModal, setShareAlbumsModal] = useState(null); // { mode: 'bulk' | 'edit', tripIds: string[] }
  const [shareEmailError, setShareEmailError] = useState('');
  const [shareWithGuests, setShareWithGuests] = useState(false);
  const [selectedInternalEmails, setSelectedInternalEmails] = useState(new Set());
  const [internalUsers, setInternalUsers] = useState([]);
  const [loadingInternalUsers, setLoadingInternalUsers] = useState(false);
  const [sharingAlbums, setSharingAlbums] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(null); // { emails, guests, tripNames }

  // ─── Admin tools ───
  const [adminDropdown, setAdminDropdown] = useState(false);
  const [manageAccessesModal, setManageAccessesModal] = useState(false);
  const [albumShares, setAlbumShares] = useState([]);
  const [loadingShares, setLoadingShares] = useState(false);
  const [pendingRequestsModal, setPendingRequestsModal] = useState(false);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [selectedPendingRequests, setSelectedPendingRequests] = useState(new Set());
  const [loadingPendingRequests, setLoadingPendingRequests] = useState(false);
  const [savingPendingRequests, setSavingPendingRequests] = useState(false);
  const [usersModal, setUsersModal] = useState(false);
  const [appUsers, setAppUsers] = useState([]);
  const [loadingAppUsers, setLoadingAppUsers] = useState(false);
  const [savingAppUser, setSavingAppUser] = useState(null);
  const [confirmUserAction, setConfirmUserAction] = useState(null); // { type, user }
  const [notificationsModal, setNotificationsModal] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({ albumShared: true, userRequest: true });
  const [savingNotificationSettings, setSavingNotificationSettings] = useState(false);
  const [dashboardRequests, setDashboardRequests] = useState([]);
  const [peopleModal, setPeopleModal] = useState(false);
  const [people, setPeople] = useState([]);
  const [loadingPeople, setLoadingPeople] = useState(false);
  const [personName, setPersonName] = useState('');
  const [peopleReferencePhoto, setPeopleReferencePhoto] = useState(null);
  const [peopleReferenceFaces, setPeopleReferenceFaces] = useState([]);
  const [loadingReferenceFaces, setLoadingReferenceFaces] = useState(false);
  const [selectedReferenceFaceId, setSelectedReferenceFaceId] = useState('');
  const [savingPerson, setSavingPerson] = useState(false);
  const [faceAction, setFaceAction] = useState(null);
  const [activePersonFilter, setActivePersonFilter] = useState(null);
  const [personMatchPhotoIds, setPersonMatchPhotoIds] = useState(new Set());
  const [confirmDeletePerson, setConfirmDeletePerson] = useState(null);
  const [personMatchesModal, setPersonMatchesModal] = useState(null);
  const [personSlideshow, setPersonSlideshow] = useState(null);
  const [confirmFullIndexation, setConfirmFullIndexation] = useState(false);
  const [fullIndexation, setFullIndexation] = useState(null);
  const [faceClusterReport, setFaceClusterReport] = useState(null);
  const [faceClusterNames, setFaceClusterNames] = useState({});
  const [savingClusterPeople, setSavingClusterPeople] = useState(false);
  const [refreshAllPeople, setRefreshAllPeople] = useState(null);
  const fullIndexCancelRef = useRef(false);
  const [dismissedNotifications, setDismissedNotifications] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('dismissedNotifications') || '[]')); }
    catch { return new Set(); }
  });

  // ─── Access denied (non-whitelisted users) ───
  const [accessDenied, setAccessDenied] = useState(false);

  // ─── Edit trip ───
  const [editTrip, setEditTrip] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editCountry, setEditCountry] = useState('');
  const [editMiro, setEditMiro] = useState('');
  const [editShareWithGuests, setEditShareWithGuests] = useState(true);
  const [editAllowedEmails, setEditAllowedEmails] = useState([]);
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

  const dismissDashboardNotification = useCallback((id) => {
    setDismissedNotifications(prev => {
      const next = new Set(prev);
      next.add(id);
      localStorage.setItem('dismissedNotifications', JSON.stringify([...next]));
      return next;
    });
  }, []);

  const clearPersonFilter = useCallback(() => {
    setActivePersonFilter(null);
    setPersonMatchPhotoIds(new Set());
  }, []);

  const countryIsValid = useCallback((country) => {
    const trimmed = country.trim();
    return !trimmed || WORLD_COUNTRIES.includes(trimmed) || COUNTRY_NAMES.includes(trimmed);
  }, []);

  const tripIsShared = useCallback((trip) => (
    trip?.visibility === 'shared' || (trip?.allowedEmails || []).length > 0
  ), []);

  const isOwnTrip = useCallback((trip) => (
    !isReadOnly && (!trip.ownerId || trip.ownerId === user?.uid)
  ), [isReadOnly, user?.uid]);

  const isSharedToMeTrip = useCallback((trip) => {
    if (isOwnTrip(trip)) return false;
    if (isReadOnly) return trip?.visibility === 'shared';
    const email = user?.email?.toLowerCase();
    const allowedEmails = (trip?.allowedEmails || []).map(e => e.toLowerCase());
    return trip?.visibility === 'shared' || (!!email && allowedEmails.includes(email));
  }, [isOwnTrip, isReadOnly, user?.email]);

  const cityMetadataWithVisibility = useCallback((trip, visibility) => {
    const next = { ...(trip?.cityMetadata || {}) };
    (trip?.cities || []).forEach(city => {
      next[city] = { ...(next[city] || {}), visibility };
    });
    return next;
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

  useEffect(() => {
    if (!user || isReadOnly) {
      setNotificationSettings({ albumShared: true, userRequest: true });
      return;
    }
    getDoc(doc(db, 'globalSettings', 'notifications'))
      .then(snap => {
        if (!snap.exists()) return;
        setNotificationSettings(prev => ({ ...prev, ...snap.data() }));
      })
      .catch(() => {});
  }, [user, isReadOnly]);

  // ─── Dark mode effect ───
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  // ─── Auth listener ───
  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      if (u && !u.isAnonymous) {
        const email = (u.email || '').toLowerCase();
        let approvedEmails = [];
        let pausedEmails = [];
        try {
          const approvedSnap = await getDoc(doc(db, 'globalSettings', 'approvedUsers'));
          approvedEmails = approvedSnap.exists() ? (approvedSnap.data().emails || []).map(e => e.toLowerCase()) : [];
          pausedEmails = approvedSnap.exists() ? (approvedSnap.data().pausedUsers || []).map(e => e.toLowerCase()) : [];
        } catch {}

        if (pausedEmails.includes(email)) {
          setUser(null);
          setGuestMode(false);
          setAccessDenied(false);
          setPendingAccessUser(null);
          setPausedAccessEmail(email);
          setAuthLoading(false);
          await signOut(auth).catch(() => {});
          return;
        }

        if (![...ALLOWED_EMAILS.map(e => e.toLowerCase()), ...approvedEmails].includes(email)) {
          setUser(null);
          setGuestMode(false);
          setAccessDenied(false);
          setPendingAccessUser({ uid: u.uid, email, displayName: u.displayName || '' });
          setPausedAccessEmail('');
          setAuthLoading(false);
          return;
        }
      }

      setPendingAccessUser(null);
      setPausedAccessEmail('');
      setAccessDenied(false);
      setUser(u);
      setAuthLoading(false);
      if (u?.email && !u.isAnonymous) {
        setDoc(doc(db, 'profiles', u.uid), { email: u.email.toLowerCase(), displayName: u.displayName || null }, { merge: true })
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
    if (!user || !isAdminUser || !notificationSettings.userRequest) {
      setDashboardRequests([]);
      return;
    }
    getDocs(collection(db, 'accessRequests'))
      .then(snap => {
        const requests = snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .filter(r => (r.status || 'pending') === 'pending')
          .sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0));
        setDashboardRequests(requests);
      })
      .catch(() => setDashboardRequests([]));
  }, [user, isAdminUser, notificationSettings.userRequest]);
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

  const resolveMissingTripCovers = useCallback(async (sourceTrips) => {
    if (!user || isReadOnly || sourceTrips.length === 0) return;

    const needsFix = sourceTrips.filter(t =>
      (t.photoCount || 0) > 0
      && t.ownerId
      && !t.cover
      && !loadingTripCoversRef.current.has(t.id)
    );
    if (needsFix.length === 0) return;

    const ids = needsFix.map(t => t.id);
    ids.forEach(id => loadingTripCoversRef.current.add(id));
    setLoadingTripCovers(prev => new Set([...prev, ...ids]));

    await Promise.all(needsFix.map(async (trip) => {
      try {
        const folder = ref(storage, `users/${trip.ownerId}/trips/${trip.id}`);
        const listed = await listAll(folder);
        if (listed.items.length === 0) return;
        const cover = await getDownloadURL(listed.items[0]);
        if (cover === trip.cover) return;
        await updateDoc(doc(db, 'trips', trip.id), { cover });
        setTrips(prev => prev.map(t => t.id === trip.id ? { ...t, cover } : t));
      } catch (err) {
        console.warn('Cover load failed:', trip.id, err);
      } finally {
        loadingTripCoversRef.current.delete(trip.id);
        setLoadingTripCovers(prev => {
          const next = new Set(prev);
          next.delete(trip.id);
          return next;
        });
      }
    }));
  }, [user, isReadOnly]);

  // Auto-fix: trips with a broken/missing cover — list Storage files directly and get a real URL
  useEffect(() => {
    resolveMissingTripCovers(trips);
  }, [trips, resolveMissingTripCovers]);

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
        else if (confirmUserAction) { setConfirmUserAction(null); }
        else if (personSlideshow) { setPersonSlideshow(null); }
        else if (personMatchesModal) { setPersonMatchesModal(null); }
        else if (confirmDeletePerson) { setConfirmDeletePerson(null); }
        else if (peopleModal) { setPeopleModal(false); }
        else if (notificationsModal) { setNotificationsModal(false); }
        else if (usersModal) { setUsersModal(false); }
        else if (pendingRequestsModal) { setPendingRequestsModal(false); }
        else if (manageAccessesModal) { setManageAccessesModal(false); }
        else if (thumbMigration && thumbMigration.status !== 'running' && thumbMigration.status !== 'scanning') { setThumbMigration(null); }
        else if (shareAlbumsModal) { closeShareAlbumsModal(); }
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
        else if (activeSharedCollection) { setActiveSharedCollection(false); }
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
    setLoginInfo('');
    setPausedAccessEmail('');
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
    setLoginInfo('');
    setPausedAccessEmail('');
    setGuestLoggingIn(true);
    setGuestMode(true);
    setAccessDenied(false);
    setUser(null);
    setGuestLoggingIn(false);
  };

  const submitAccessRequest = async () => {
    if (!pendingAccessUser?.email || !auth.currentUser) return;
    setSubmittingAccessRequest(true);
    setLoginError('');
    try {
      await setDoc(doc(db, 'accessRequests', pendingAccessUser.email), {
        email: pendingAccessUser.email,
        displayName: pendingAccessUser.displayName || null,
        uid: pendingAccessUser.uid,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }, { merge: true });
      await signOut(auth);
      setPendingAccessUser(null);
      setLoginInfo(T.accessRequestSent);
    } catch (err) {
      console.error('Access request error:', err);
      setLoginError(T.accessRequestFailed);
    }
    setSubmittingAccessRequest(false);
  };

  const cancelAccessRequest = async () => {
    await signOut(auth).catch(() => {});
    setPendingAccessUser(null);
  };

  const closePausedAccessMessage = async () => {
    await signOut(auth).catch(() => {});
    setPausedAccessEmail('');
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
      await resolveMissingTripCovers(merged);
    } catch (err) {
      console.error('Load trips error:', err);
    } finally {
      setLoadingTrips(false);
    }
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

  const baseDisplayPhotos = activeCity === null ? photos
    : activeCity === '__uncategorized__' ? photos.filter(p => !p.city)
    : photos.filter(p => p.city === activeCity);
  const displayPhotos = activePersonFilter
    ? baseDisplayPhotos.filter(p => personMatchPhotoIds.has(p.id))
    : baseDisplayPhotos;
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
    setPhotoRenderLimit(view === 'list' ? PHOTO_LIST_BATCH_SIZE : PHOTO_GRID_BATCH_SIZE);
  }, [activeTrip, activeCity, view, photos.length]);

  useEffect(() => {
    setPublicPhotoRenderLimit(PHOTO_GRID_BATCH_SIZE);
  }, [publicShareData?.tripId, publicShareData?.photos?.length]);

  useEffect(() => {
    const node = photoLoadMoreRef.current;
    if (!node || photoRenderLimit >= displayPhotos.length) return undefined;

    const batchSize = view === 'list' ? PHOTO_LIST_BATCH_SIZE : PHOTO_GRID_BATCH_SIZE;
    if (!('IntersectionObserver' in window)) return undefined;

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setPhotoRenderLimit(limit => Math.min(displayPhotos.length, limit + batchSize));
    }, { rootMargin: '420px 0px', threshold: 0.01 });

    observer.observe(node);
    return () => observer.disconnect();
  }, [displayPhotos.length, photoRenderLimit, view]);

  useEffect(() => {
    const photoCount = publicShareData?.photos?.length || 0;
    const node = publicPhotoLoadMoreRef.current;
    if (!node || publicPhotoRenderLimit >= photoCount) return undefined;
    if (!('IntersectionObserver' in window)) return undefined;

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setPublicPhotoRenderLimit(limit => Math.min(photoCount, limit + PHOTO_GRID_BATCH_SIZE));
    }, { rootMargin: '420px 0px', threshold: 0.01 });

    observer.observe(node);
    return () => observer.disconnect();
  }, [publicShareData?.photos?.length, publicPhotoRenderLimit]);

  useEffect(() => {
    clearPersonFilter();
  }, [activeTrip, clearPersonFilter]);

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
    setEditShareWithGuests(trip.visibility === 'shared');
    setEditAllowedEmails(trip.allowedEmails || []);
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
      visibility: editShareWithGuests ? 'shared' : 'private',
      allowedEmails: editAllowedEmails,
      cityMetadata: cityMetadataWithVisibility(editTrip, tripIsShared({ visibility: editShareWithGuests ? 'shared' : 'private', allowedEmails: editAllowedEmails }) ? 'shared' : 'private'),
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
  const closeShareAlbumsModal = useCallback(() => {
    setShareAlbumsModal(null);
    setShareEmailError('');
  }, []);

  const loadInternalUsers = useCallback(async () => {
    if (isReadOnly) return;
    setLoadingInternalUsers(true);
    try {
      const snap = await getDocs(collection(db, 'profiles'));
      const profileEmails = snap.docs.map(d => d.data().email).filter(Boolean);
      const emails = [...new Set([...ALLOWED_EMAILS, ...profileEmails])]
        .map(email => email.toLowerCase())
        .filter(email => email !== user?.email?.toLowerCase())
        .sort((a, b) => a.localeCompare(b));
      setInternalUsers(emails.map(email => ({ email, label: email.split('@')[0] })));
    } catch (err) {
      console.error('Error loading internal users:', err);
      setInternalUsers(
        ALLOWED_EMAILS
          .map(email => email.toLowerCase())
          .filter(email => email !== user?.email?.toLowerCase())
          .sort((a, b) => a.localeCompare(b))
          .map(email => ({ email, label: email.split('@')[0] }))
      );
    }
    setLoadingInternalUsers(false);
  }, [isReadOnly, user?.email]);

  const openShareAlbumsModal = useCallback((tripIds, mode = 'bulk') => {
    const selected = tripIds.map(id => trips.find(t => t.id === id)).filter(Boolean);
    const allGuestShared = selected.length > 0 && selected.every(t => t.visibility === 'shared');
    const existingEmails = selected.flatMap(t => t.allowedEmails || []);

    setShareAlbumsModal({ mode, tripIds });
    setShareWithGuests(allGuestShared);
    setSelectedInternalEmails(new Set(existingEmails));
    setShareEmailError('');
    loadInternalUsers();
  }, [loadInternalUsers, trips]);

  const handleShareAlbumsClick = () => {
    const emails = [...selectedInternalEmails];
    if (!shareWithGuests && emails.length === 0) {
      setShareEmailError(T.selectShareAudience);
      return;
    }
    setShareEmailError('');
    shareAlbums({ emails, guests: shareWithGuests });
  };

  const shareAlbums = async ({ emails, guests }) => {
    if (isReadOnly) return;
    const tripIds = shareAlbumsModal?.tripIds || [];
    if ((!emails.length && !guests) || tripIds.length === 0) return;
    setSharingAlbums(true);
    clearNotice();
    try {
      const tripNames = {};
      tripIds.forEach(id => {
        const trip = trips.find(t => t.id === id);
        if (trip) tripNames[id] = trip.name;
      });

      await addDoc(collection(db, 'albumShares'), {
        tripIds,
        tripNames,
        emails,
        guests,
        createdAt: serverTimestamp(),
        createdBy: user.email,
      });

      const batch = writeBatch(db);
      for (const tripId of tripIds) {
        const trip = trips.find(t => t.id === tripId);
        const nextEmails = [...new Set(emails)];
        batch.update(doc(db, 'trips', tripId), {
          visibility: guests ? 'shared' : 'private',
          allowedEmails: nextEmails,
          cityMetadata: cityMetadataWithVisibility(trip, guests || nextEmails.length > 0 ? 'shared' : 'private'),
        });
      }
      await batch.commit();

      setTrips(prev => prev.map(t => {
        if (!tripIds.includes(t.id)) return t;
        const nextEmails = [...new Set(emails)];
        return {
          ...t,
          visibility: guests ? 'shared' : 'private',
          allowedEmails: nextEmails,
          cityMetadata: cityMetadataWithVisibility(t, guests || nextEmails.length > 0 ? 'shared' : 'private'),
        };
      }));

      if (shareAlbumsModal?.mode === 'edit') {
        setEditShareWithGuests(guests);
        setEditAllowedEmails([...new Set(emails)]);
      }

      const tripList = tripIds.map(id => {
        const trip = trips.find(t => t.id === id);
        return `• ${trip?.name || id}${trip?.date ? ` (${trip.date})` : ''}`;
      }).join('\n');
      if (emails.length > 0) {
        const appUrl = window.location.origin;
        const subject = encodeURIComponent('Album access granted — Pepini per il mondo');
        const body = encodeURIComponent(
          `Hola!\n\nSe te ha dado acceso a los siguientes álbumes de viaje:\n\n${tripList}\n\nHaz clic aquí para acceder:\n${appUrl}\n\nInicia sesión con tu cuenta de Google usando esta dirección de email para ver los álbumes.\n\n¡Bon voyage!\n— Pepini per il mondo`
        );
        window.location.href = `mailto:${emails.join(',')}?subject=${subject}&body=${body}`;
      }

      const sharedTripNames = tripIds.map(id => trips.find(t => t.id === id)?.name).filter(Boolean);
      setSelectedTrips(new Set());
      setShareAlbumsModal(null);
      setShareEmailError('');
      setShareSuccess({ emails, guests, tripNames: sharedTripNames });
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

  const loadPendingRequests = async () => {
    if (isReadOnly) return;
    setLoadingPendingRequests(true);
    setSelectedPendingRequests(new Set());
    try {
      const snap = await getDocs(collection(db, 'accessRequests'));
      const requests = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(r => (r.status || 'pending') === 'pending')
        .sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0));
      setPendingRequests(requests);
    } catch (err) {
      console.error('Error loading pending requests:', err);
      showNotice('error', validationText('accessLoadFailed'));
    }
    setLoadingPendingRequests(false);
  };

  const resolvePendingRequests = async (status) => {
    if (isReadOnly || selectedPendingRequests.size === 0) return;
    setSavingPendingRequests(true);
    try {
      const selectedIds = [...selectedPendingRequests];
      const selectedEmails = selectedIds
        .map(id => pendingRequests.find(r => r.id === id)?.email)
        .filter(Boolean)
        .map(email => email.toLowerCase());
      const batch = writeBatch(db);
      selectedIds.forEach(id => {
        batch.update(doc(db, 'accessRequests', id), {
          status,
          reviewedAt: serverTimestamp(),
          reviewedBy: user.email,
        });
      });
      if (status === 'approved' && selectedEmails.length > 0) {
        batch.set(doc(db, 'globalSettings', 'approvedUsers'), {
          emails: arrayUnion(...selectedEmails),
          updatedAt: serverTimestamp(),
          updatedBy: user.email,
        }, { merge: true });
      }
      await batch.commit();
      setPendingRequests(prev => prev.filter(r => !selectedPendingRequests.has(r.id)));
      setDashboardRequests(prev => prev.filter(r => !selectedPendingRequests.has(r.id)));
      setSelectedPendingRequests(new Set());
    } catch (err) {
      console.error('Error resolving pending requests:', err);
      showNotice('error', validationText('saveFailed'));
    }
    setSavingPendingRequests(false);
  };

  const loadAppUsers = async () => {
    if (isReadOnly) return;
    setLoadingAppUsers(true);
    try {
      const [profilesSnap, settingsSnap, tripsSnap] = await Promise.all([
        getDocs(collection(db, 'profiles')),
        getDoc(doc(db, 'globalSettings', 'approvedUsers')),
        getDocs(tripsCol()),
      ]);
      const approvedEmails = settingsSnap.exists() ? (settingsSnap.data().emails || []).map(e => e.toLowerCase()) : [];
      const pausedEmails = settingsSnap.exists() ? (settingsSnap.data().pausedUsers || []).map(e => e.toLowerCase()) : [];
      const profileRows = profilesSnap.docs.map(d => ({ id: d.id, ...d.data(), email: (d.data().email || '').toLowerCase() })).filter(p => p.email);
      const profileByEmail = Object.fromEntries(profileRows.map(p => [p.email, p]));
      const stats = {};
      tripsSnap.docs.forEach(d => {
        const trip = d.data();
        const email = (trip.ownerEmail || profileRows.find(p => p.id === trip.ownerId)?.email || '').toLowerCase();
        if (!email) return;
        stats[email] = stats[email] || { albums: 0, photos: 0 };
        stats[email].albums += 1;
        stats[email].photos += trip.photoCount || 0;
      });
      const emails = [...new Set([...ALLOWED_EMAILS.map(e => e.toLowerCase()), ...approvedEmails, ...profileRows.map(p => p.email), ...Object.keys(stats)])]
        .sort((a, b) => a.localeCompare(b));
      setAppUsers(emails.map(email => ({
        email,
        uid: profileByEmail[email]?.id || null,
        displayName: profileByEmail[email]?.displayName || email.split('@')[0],
        isAdmin: ADMIN_EMAILS.map(e => e.toLowerCase()).includes(email),
        isPaused: pausedEmails.includes(email),
        albums: stats[email]?.albums || 0,
        photos: stats[email]?.photos || 0,
      })));
    } catch (err) {
      console.error('Error loading users:', err);
      showNotice('error', validationText('accessLoadFailed'));
    }
    setLoadingAppUsers(false);
  };

  const togglePauseUser = async (appUser) => {
    if (isReadOnly || appUser.isAdmin) return;
    setSavingAppUser(appUser.email);
    try {
      await setDoc(doc(db, 'globalSettings', 'approvedUsers'), {
        pausedUsers: appUser.isPaused ? arrayRemove(appUser.email) : arrayUnion(appUser.email),
        updatedAt: serverTimestamp(),
        updatedBy: user.email,
      }, { merge: true });
      setAppUsers(prev => prev.map(u => u.email === appUser.email ? { ...u, isPaused: !u.isPaused } : u));
    } catch (err) {
      console.error('Error pausing user:', err);
      showNotice('error', validationText('saveFailed'));
    }
    setSavingAppUser(null);
  };

  const removeAppUser = async (appUser) => {
    if (isReadOnly || appUser.isAdmin) return;
    setSavingAppUser(appUser.email);
    try {
      const batch = writeBatch(db);
      batch.set(doc(db, 'globalSettings', 'approvedUsers'), {
        emails: arrayRemove(appUser.email),
        pausedUsers: arrayRemove(appUser.email),
        updatedAt: serverTimestamp(),
        updatedBy: user.email,
      }, { merge: true });
      batch.delete(doc(db, 'accessRequests', appUser.email));
      if (appUser.uid) batch.delete(doc(db, 'profiles', appUser.uid));
      await batch.commit();
      setAppUsers(prev => prev.filter(u => u.email !== appUser.email));
      setConfirmUserAction(null);
    } catch (err) {
      console.error('Error removing user:', err);
      showNotice('error', validationText('saveFailed'));
    }
    setSavingAppUser(null);
  };

  const loadPeople = async () => {
    if (!canUseFaceRecognition) return;
    setLoadingPeople(true);
    try {
      const snap = await getDocs(collection(db, 'people'));
      const rows = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      setPeople(rows);
    } catch (err) {
      console.error('Error loading people:', err);
      showNotice('error', validationText('accessLoadFailed'));
    }
    setLoadingPeople(false);
  };

  const loadReferenceFaces = async (referencePhoto) => {
    if (!canUseFaceRecognition || !activeTrip || !referencePhoto?.id) return;
    setLoadingReferenceFaces(true);
    setPeopleReferenceFaces([]);
    setSelectedReferenceFaceId('');
    try {
      const facesRef = collection(db, 'trips', activeTrip, 'photos', referencePhoto.id, 'faces');
      let snap = await getDocs(facesRef);
      let indexedFaceIds = [];
      if (snap.empty) {
        const indexFaces = httpsCallable(firebaseFunctions, 'indexPhotoFaces');
        const result = await indexFaces({ tripId: activeTrip, photoId: referencePhoto.id });
        indexedFaceIds = result.data?.faceIds || [];
        snap = await getDocs(facesRef);
      }
      let rows = snap.docs
        .map(faceDoc => ({ id: faceDoc.id, ...faceDoc.data() }))
        .filter(face => face.boundingBox)
        .sort((a, b) => {
          const boxA = a.boundingBox || {};
          const boxB = b.boundingBox || {};
          return ((boxB.Width || 0) * (boxB.Height || 0)) - ((boxA.Width || 0) * (boxA.Height || 0));
        });
      if (rows.length === 0 && indexedFaceIds.length > 0) {
        const faceDocs = await Promise.all(indexedFaceIds.map(faceId => getDoc(doc(db, 'faceIndex', faceId))));
        rows = faceDocs
          .filter(faceDoc => faceDoc.exists())
          .map(faceDoc => ({ id: faceDoc.id, ...faceDoc.data() }))
          .filter(face => face.tripId === activeTrip && face.photoId === referencePhoto.id && face.boundingBox)
          .sort((a, b) => {
            const boxA = a.boundingBox || {};
            const boxB = b.boundingBox || {};
            return ((boxB.Width || 0) * (boxB.Height || 0)) - ((boxA.Width || 0) * (boxA.Height || 0));
          });
      }
      setPeopleReferenceFaces(rows);
      setSelectedReferenceFaceId(rows[0]?.id || '');
      if (rows.length === 0) showNotice('error', T.noSelectableFaces);
    } catch (err) {
      console.error('Load reference faces error:', err);
      showNotice('error', err.message || T.faceActionFailed);
    }
    setLoadingReferenceFaces(false);
  };

  const openPeopleTools = (referencePhoto = null) => {
    if (!canUseFaceRecognition) return;
    setPeopleReferencePhoto(referencePhoto);
    setPeopleReferenceFaces([]);
    setSelectedReferenceFaceId('');
    setPersonName('');
    setPeopleModal(true);
    loadPeople();
    if (referencePhoto) loadReferenceFaces(referencePhoto);
  };

  const createPersonFromReference = async () => {
    if (!canUseFaceRecognition || !peopleReferencePhoto || !activeTrip || !personName.trim() || !selectedReferenceFaceId) return;
    setSavingPerson(true);
    try {
      const createPerson = httpsCallable(firebaseFunctions, 'createPersonFromPhoto');
      const result = await createPerson({
        name: personName.trim(),
        tripId: activeTrip,
        photoId: peopleReferencePhoto.id,
        referenceFaceId: selectedReferenceFaceId,
      });
      const personId = result.data?.personId;
      if (personId) {
        setPeople(prev => [{
          id: personId,
          name: personName.trim(),
          referencePhotoId: peopleReferencePhoto.id,
          referenceTripId: activeTrip,
          referenceImageUrl: peopleReferencePhoto.thumbUrl || peopleReferencePhoto.url,
          matchCount: 1,
        }, ...prev].sort((a, b) => (a.name || '').localeCompare(b.name || '')));
      } else {
        await loadPeople();
      }
      setPersonName('');
      setPeopleReferencePhoto(null);
      setPeopleReferenceFaces([]);
      setSelectedReferenceFaceId('');
    } catch (err) {
      console.error('Create person error:', err);
      showNotice('error', err.message || T.faceActionFailed);
    }
    setSavingPerson(false);
  };

  const indexCurrentPhotoFaces = async (photo = lightbox) => {
    if (!canUseFaceRecognition || !activeTrip || !photo?.id) return;
    setFaceAction(`index:${photo.id}`);
    try {
      const indexFaces = httpsCallable(firebaseFunctions, 'indexPhotoFaces');
      const result = await indexFaces({ tripId: activeTrip, photoId: photo.id });
      showNotice('success', T.faceIndexComplete(result.data?.faceCount || 0));
    } catch (err) {
      console.error('Index photo faces error:', err);
      showNotice('error', err.message || T.faceActionFailed);
    }
    setFaceAction(null);
  };

  const fetchPersonMatches = async (person, options = {}) => {
    if (!canUseFaceRecognition || !person?.id) return;
    const { silent = false } = options;
    if (!silent) setFaceAction(`search:${person.id}`);
    try {
      const searchMatches = httpsCallable(firebaseFunctions, 'searchPersonMatches');
      const result = await searchMatches({ personId: person.id, threshold: 90 });
      const matches = result.data?.matches || [];
      setPeople(prev => prev.map(p => p.id === person.id ? { ...p, matchCount: result.data?.matchCount || matches.length } : p));
      return matches;
    } catch (err) {
      console.error('Search person matches error:', err);
      if (!silent) showNotice('error', err.message || T.faceActionFailed);
      return null;
    } finally {
      if (!silent) setFaceAction(null);
    }
  };

  const refreshAllPersonMatches = async () => {
    if (!canUseFaceRecognition || refreshAllPeople?.status === 'running' || people.length === 0) return;
    let updated = 0;
    let failed = 0;
    setRefreshAllPeople({ status: 'running', done: 0, total: people.length, current: '', updated, failed });

    for (let index = 0; index < people.length; index++) {
      const person = people[index];
      setRefreshAllPeople({ status: 'running', done: index, total: people.length, current: person.name, updated, failed });
      const matches = await fetchPersonMatches(person, { silent: true });
      if (matches) updated++;
      else failed++;
      setRefreshAllPeople({ status: 'running', done: index + 1, total: people.length, current: person.name, updated, failed });
    }

    setRefreshAllPeople({ status: 'done', done: people.length, total: people.length, current: '', updated, failed });
    showNotice(failed > 0 ? 'error' : 'success', T.refreshAllComplete(updated, failed));
  };

  const searchPersonMatches = async (person) => {
    const matches = await fetchPersonMatches(person);
    if (!matches) return;
    if (activeTrip) {
      setActivePersonFilter(person);
      setPersonMatchPhotoIds(new Set(matches.filter(m => m.tripId === activeTrip).map(m => m.photoId)));
    }
    showNotice('success', T.faceSearchComplete(matches.length));
  };

  const hydratePersonMatches = async (matches) => {
    const hydrated = [];
    for (const match of matches) {
      try {
        const [tripSnap, photoSnap] = await Promise.all([
          getDoc(doc(db, 'trips', match.tripId)),
          getDoc(doc(db, 'trips', match.tripId, 'photos', match.photoId)),
        ]);
        if (!tripSnap.exists() || !photoSnap.exists()) continue;
        const trip = { id: tripSnap.id, ...tripSnap.data() };
        const photo = { id: photoSnap.id, ...photoSnap.data(), tripId: trip.id, tripName: trip.name };
        hydrated.push({ ...match, trip, photo });
      } catch (err) {
        console.warn('Could not hydrate match:', match, err);
      }
    }
    return hydrated;
  };

  const fetchStoredPersonMatches = async (person) => {
    if (!canUseFaceRecognition || !person?.id) return null;
    try {
      const snap = await getDocs(collection(db, 'people', person.id, 'matches'));
      return snap.docs.map(matchDoc => ({ id: matchDoc.id, ...matchDoc.data() }));
    } catch (err) {
      console.error('Load stored person matches error:', err);
      showNotice('error', err.message || T.faceActionFailed);
      return null;
    }
  };

  const openPersonMatches = async (person) => {
    if (!canUseFaceRecognition || !person?.id || (person.matchCount || 0) === 0) return;
    setPersonMatchesModal({ person, loading: true, matches: [], albums: [] });
    const rawMatches = await fetchStoredPersonMatches(person);
    if (!rawMatches) {
      setPersonMatchesModal({ person, loading: false, matches: [], albums: [] });
      return;
    }
    const matches = await hydratePersonMatches(rawMatches);
    const albumMap = new Map();
    matches.forEach(match => {
      const current = albumMap.get(match.trip.id) || { trip: match.trip, matches: [] };
      current.matches.push(match);
      albumMap.set(match.trip.id, current);
    });
    setPersonMatchesModal({
      person,
      loading: false,
      matches,
      albums: [...albumMap.values()].sort((a, b) => (a.trip.name || '').localeCompare(b.trip.name || '')),
    });
  };

  const openPersonSlideshow = (person, matches, title) => {
    if (!matches.length) return;
    setPersonSlideshow({
      person,
      title,
      photos: matches.map(match => match.photo),
      index: 0,
    });
  };

  const navigatePersonSlideshow = (dir) => {
    setPersonSlideshow(prev => {
      if (!prev) return prev;
      const next = prev.index + dir;
      if (next < 0 || next >= prev.photos.length) return prev;
      return { ...prev, index: next };
    });
  };

  const collectPhotosForFullIndexation = async () => {
    const jobs = [];
    for (const trip of trips) {
      try {
        const snap = await getDocs(query(photosCol(trip.id), orderBy('createdAt', 'asc')));
        snap.docs.forEach(photoDoc => {
          const photo = { id: photoDoc.id, ...photoDoc.data() };
          jobs.push({ tripId: trip.id, tripName: trip.name, photoId: photo.id, photo });
        });
      } catch (err) {
        console.warn('Could not load photos for face indexation:', trip.id, err);
      }
    }
    return jobs;
  };

  const estimateFaceClusterReport = (jobs, newlyIndexedFaces = 0) => {
    const indexedPhotos = (jobs || []).filter(job => job.photo.rekognition?.indexedAt);
    const knownFaces = indexedPhotos.reduce((sum, job) => sum + (job.photo.rekognition?.faceCount || 0), 0) + newlyIndexedFaces;
    if (knownFaces <= 0) {
      return { faceCount: 0, text: T.fullIndexationReportEtaUnknown };
    }
    const photoCount = Math.max(indexedPhotos.length, 1);
    const lowMs = Math.max(30000, (knownFaces * 220) + (photoCount * 5));
    const highMs = Math.max(lowMs + 60000, (knownFaces * 650) + (photoCount * 10));
    const hardLimitMs = 1800000;
    const text = T.fullIndexationReportEta(
      knownFaces,
      highMs > hardLimitMs
        ? `${formatDuration(lowMs)}-${formatDuration(hardLimitMs)}+`
        : `${formatDuration(lowMs)}-${formatDuration(highMs)}`
    );
    return { faceCount: knownFaces, text };
  };

  const loadFullIndexationClusters = async (jobs, newlyIndexedFaces = 0) => {
    const tripIds = [...new Set((jobs || []).map(job => job.tripId))];
    const estimate = estimateFaceClusterReport(jobs, newlyIndexedFaces);
    setFaceClusterReport({ status: 'loading', clusters: [], faceCount: estimate.faceCount, error: '', estimateText: estimate.text });
    setFaceClusterNames({});
    try {
      const getClusters = httpsCallable(firebaseFunctions, 'getIndexedFaceClusters', { timeout: 1800000 });
      const result = await getClusters({ tripIds, threshold: 90 });
      const clusters = result.data?.clusters || [];
      setFaceClusterReport({
        status: 'ready',
        clusters,
        faceCount: result.data?.faceCount || 0,
        error: '',
      });
      setFaceClusterNames(Object.fromEntries(clusters.map(cluster => [cluster.clusterId, ''])));
    } catch (err) {
      console.error('Face cluster report failed:', err);
      setFaceClusterReport({
        status: 'error',
        clusters: [],
        faceCount: estimate.faceCount,
        estimateText: estimate.text,
        error: err.message || T.faceActionFailed,
      });
    }
  };

  const createPeopleFromClusters = async () => {
    if (!faceClusterReport?.clusters?.length) return;
    const namedPeople = faceClusterReport.clusters
      .map(cluster => ({
        name: (faceClusterNames[cluster.clusterId] || '').trim(),
        faceIds: cluster.faceIds,
      }))
      .filter(item => item.name);
    if (namedPeople.length === 0) return;

    setSavingClusterPeople(true);
    try {
      const createPeople = httpsCallable(firebaseFunctions, 'createPeopleFromFaceClusters');
      const result = await createPeople({
        tripIds: [...new Set(trips.map(trip => trip.id))],
        people: namedPeople,
      });
      await loadPeople();
      setFaceClusterReport(null);
      setFullIndexation(null);
      showNotice('success', T.peopleCreatedFromClusters(result.data?.created?.length || 0));
    } catch (err) {
      console.error('Create people from clusters failed:', err);
      showNotice('error', err.message || T.faceActionFailed);
    }
    setSavingClusterPeople(false);
  };

  const startFullIndexation = async () => {
    if (!canUseFaceRecognition || fullIndexation?.status === 'scanning' || fullIndexation?.status === 'running') return;
    setConfirmFullIndexation(false);
    setFaceClusterReport(null);
    setFaceClusterNames({});
    fullIndexCancelRef.current = false;
    const startedAt = Date.now();
    setFullIndexation({
      status: 'scanning',
      done: 0,
      total: 0,
      skipped: 0,
      failed: 0,
      faces: 0,
      etaMs: null,
      startedAt,
      current: '',
    });

    const jobs = await collectPhotosForFullIndexation();
    if (fullIndexCancelRef.current) {
      setFullIndexation(prev => ({ ...prev, status: 'cancelled', etaMs: 0, current: '' }));
      return;
    }
    const pendingJobs = jobs.filter(job => !job.photo.rekognition?.indexedAt);
    const initiallySkipped = jobs.length - pendingJobs.length;
    let done = 0;
    let skipped = initiallySkipped;
    let failed = 0;
    let faces = 0;
    let nextJob = 0;
    const total = jobs.length;
    const indexFaces = httpsCallable(firebaseFunctions, 'indexPhotoFaces');
    const concurrency = 2;

    const report = (current = '') => {
      const processed = done + skipped + failed;
      const elapsed = Date.now() - startedAt;
      setFullIndexation({
        status: fullIndexCancelRef.current ? 'cancelled' : 'running',
        done,
        total,
        skipped,
        failed,
        faces,
        etaMs: processed > initiallySkipped ? (elapsed / Math.max(processed - initiallySkipped, 1)) * Math.max(total - processed, 0) : null,
        startedAt,
        current,
      });
    };

    report(T.preparingIndexation);

    const worker = async () => {
      while (nextJob < pendingJobs.length && !fullIndexCancelRef.current) {
        const job = pendingJobs[nextJob++];
        try {
          report(job.tripName);
          const result = await indexFaces({ tripId: job.tripId, photoId: job.photoId });
          if (result.data?.skipped) skipped++;
          else done++;
          faces += result.data?.faceCount || 0;
        } catch (err) {
          failed++;
          console.warn('Face indexation failed:', job.tripId, job.photoId, err);
        }
        report(job.tripName);
      }
    };

    await Promise.all(Array.from({ length: concurrency }, worker));
    const finalStatus = fullIndexCancelRef.current ? 'cancelled' : 'done';
    setFullIndexation(prev => ({ ...prev, status: finalStatus, etaMs: 0, current: '' }));
    if (finalStatus === 'done') await loadFullIndexationClusters(jobs, faces);
  };

  const cancelFullIndexation = () => {
    fullIndexCancelRef.current = true;
  };

  const deletePersonFromIndex = async (person) => {
    if (!isAdminUser || !person?.id) return;
    setFaceAction(`delete:${person.id}`);
    try {
      const deletePerson = httpsCallable(firebaseFunctions, 'deletePerson');
      await deletePerson({ personId: person.id });
      setPeople(prev => prev.filter(p => p.id !== person.id));
      if (activePersonFilter?.id === person.id) clearPersonFilter();
      setConfirmDeletePerson(null);
      showNotice('success', T.personDeleted);
    } catch (err) {
      console.error('Delete person error:', err);
      showNotice('error', err.message || T.faceActionFailed);
    }
    setFaceAction(null);
  };

  // ═══════════════════════════════════════
  // STATS
  // ═══════════════════════════════════════
  const saveNotificationSettings = async () => {
    if (!isAdminUser) return;
    setSavingNotificationSettings(true);
    try {
      await setDoc(doc(db, 'globalSettings', 'notifications'), {
        ...notificationSettings,
        updatedAt: serverTimestamp(),
        updatedBy: user.email,
      }, { merge: true });
      setNotificationsModal(false);
    } catch (err) {
      console.error('Error saving notification settings:', err);
      showNotice('error', validationText('saveFailed'));
    }
    setSavingNotificationSettings(false);
  };

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

  const ownTrips = useMemo(() => sortedTrips.filter(t => !isSharedToMeTrip(t)), [sortedTrips, isSharedToMeTrip]);
  const sharedToMeTrips = useMemo(() => sortedTrips.filter(t => isSharedToMeTrip(t)), [sortedTrips, isSharedToMeTrip]);
  const normalizeSearchText = useCallback((value) => String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase(), []);
  const albumSearchText = normalizeSearchText(albumSearch.trim());
  const tripMatchesAlbumSearch = useCallback((trip) => {
    if (!albumSearchText) return true;
    return [
      trip.name,
      trip.country,
      ...(trip.cities || []),
    ].some(value => normalizeSearchText(value).includes(albumSearchText));
  }, [albumSearchText, normalizeSearchText]);
  const visibleGridTrips = useMemo(() => {
    const source = activeSharedCollection ? sharedToMeTrips : albumSearchText ? sortedTrips : ownTrips;
    return source.filter(tripMatchesAlbumSearch);
  }, [activeSharedCollection, albumSearchText, sortedTrips, sharedToMeTrips, ownTrips, tripMatchesAlbumSearch]);
  const dashboardNotifications = useMemo(() => {
    if (!user || isReadOnly || activeTrip || activeSharedCollection) return [];
    const email = user.email?.toLowerCase();
    const albumNotifications = notificationSettings.albumShared
      ? sortedTrips
        .filter(trip => !isOwnTrip(trip) && (trip.allowedEmails || []).map(e => e.toLowerCase()).includes(email))
        .map(trip => ({
          id: `album:${trip.id}`,
          type: 'albumShared',
          title: T.albumSharedNotificationTitle,
          text: T.albumSharedNotificationText(trip.name, trip.ownerEmail || creatorMap[trip.ownerId] || T.someone),
          action: () => setActiveTrip(trip.id),
        }))
      : [];
    const requestNotifications = isAdminUser && notificationSettings.userRequest
      ? dashboardRequests.map(request => ({
        id: `request:${request.id}`,
        type: 'userRequest',
        title: T.userRequestNotificationTitle,
        text: T.userRequestNotificationText(request.email),
        action: () => {
          loadPendingRequests();
          setPendingRequestsModal(true);
        },
      }))
      : [];
    return [...albumNotifications, ...requestNotifications].filter(item => !dismissedNotifications.has(item.id));
  }, [
    user, isReadOnly, activeTrip, activeSharedCollection, notificationSettings,
    sortedTrips, isOwnTrip, creatorMap, T, isAdminUser, dashboardRequests,
    dismissedNotifications,
  ]);

  const totalPhotos = trips.reduce((s, t) => s + (t.photoCount || 0), 0);
  const sharedByMePhotos = ownTrips
    .filter(tripIsShared)
    .reduce((s, t) => s + (t.photoCount || 0), 0);
  const sharedWithMePhotos = sharedToMeTrips.reduce((s, t) => s + (t.photoCount || 0), 0);
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
                <button className="btn btn-accent btn-sm" onClick={() => openShareAlbumsModal([...selectedTrips], 'bulk')}>
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
    const renderedPubPhotos = pubPhotos.slice(0, publicPhotoRenderLimit);
    const hiddenPubPhotoCount = Math.max(0, pubPhotos.length - renderedPubPhotos.length);
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
            {renderedPubPhotos.map((p, i) => (
              <div key={i} className="photo-thumb fade-in" style={{ animationDelay: `${i * 20}ms` }}
                onClick={() => { setPublicLightbox(p); setPublicLbIdx(i); }}>
                <LazyPhotoImage src={p.thumbUrl || p.url} alt={p.name} />
              </div>
            ))}
            {hiddenPubPhotoCount > 0 && (
              <button ref={publicPhotoLoadMoreRef} className="load-more-photos" onClick={() => setPublicPhotoRenderLimit(n => Math.min(pubPhotos.length, n + PHOTO_GRID_BATCH_SIZE))}>
                {T.showMorePhotos(Math.min(hiddenPubPhotoCount, PHOTO_GRID_BATCH_SIZE))}
              </button>
            )}
          </div>
        </div>
        {publicLightbox && (
          <div className="lightbox fade-scale" role="dialog" aria-modal="true" onClick={() => setPublicLightbox(null)}>
            <div className="lightbox-img-wrap" onClick={e => e.stopPropagation()}>
              <CrossfadeImage
                src={publicLightbox.url}
                alt={publicLightbox.name}
                className="lightbox-img"
                incomingClassName="lightbox-img-incoming"
                loading="eager"
              />
            </div>
            <button className="lb-close" aria-label={T.close} onClick={() => setPublicLightbox(null)}>✕</button>
            {publicLbIdx > 0 && <button className="lb-arrow lb-arrow-left" aria-label={isSpanish ? 'Foto anterior' : 'Previous photo'} onClick={e => { e.stopPropagation(); const n = publicLbIdx - 1; setPublicLbIdx(n); setPublicLightbox(pubPhotos[n]); }}>&lt;</button>}
            {publicLbIdx < pubPhotos.length - 1 && <button className="lb-arrow lb-arrow-right" aria-label={isSpanish ? 'Foto siguiente' : 'Next photo'} onClick={e => { e.stopPropagation(); const n = publicLbIdx + 1; setPublicLbIdx(n); setPublicLightbox(pubPhotos[n]); }}>&gt;</button>}
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
          {loginInfo && <p className="field-success" style={{ textAlign: 'center', marginTop: 12 }}>{loginInfo}</p>}
        </div>
        {pendingAccessUser && (
          <div className="modal-overlay fade-scale" onClick={cancelAccessRequest}>
            <div {...modalProps} className="modal access-request-modal" onClick={e => e.stopPropagation()}>
              <p className="modal-title">{T.accessRequestTitle}</p>
              <p className="modal-sub">{T.accessRequestMessage(pendingAccessUser.email)}</p>
              <div className="modal-actions" style={{ marginTop: 18 }}>
                <button className="btn btn-sm" onClick={cancelAccessRequest} disabled={submittingAccessRequest}>{T.no}</button>
                <button className="btn btn-accent" onClick={submitAccessRequest} disabled={submittingAccessRequest}>
                  {submittingAccessRequest ? T.sendingRequest : T.yesSendRequest}
                </button>
              </div>
              {loginError && <p className="field-error" style={{ textAlign: 'center' }}>{loginError}</p>}
            </div>
          </div>
        )}
        {pausedAccessEmail && (
          <div className="modal-overlay fade-scale" onClick={closePausedAccessMessage}>
            <div {...modalProps} className="modal access-request-modal" onClick={e => e.stopPropagation()}>
              <p className="modal-title">{T.accessPausedTitle}</p>
              <p className="modal-sub">{T.accessPausedMessage(pausedAccessEmail)}</p>
              <div className="modal-actions" style={{ marginTop: 18 }}>
                <button className="btn btn-accent" onClick={closePausedAccessMessage}>{T.accept}</button>
              </div>
            </div>
          </div>
        )}
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
          <div className="header-logo-wrap" onClick={() => { setActiveTrip(null); setActiveSharedCollection(false); }}>
            <img src={logoSrc} alt="Pepini per il mondo" className="header-logo-img" />
            <span className="header-logo heading">Pepini per il mondo</span>
          </div>
        </div>
        <div className="header-actions">
          {isGuest && <span className="guest-pill">{T.guestModeLabel}</span>}
          {isAdminUser && (
            <div style={{ position: 'relative' }}>
              <button className="btn-icon" onClick={() => setAdminDropdown(d => !d)} title={T.adminTools} aria-label={T.adminTools}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1 1.56V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1-1.56 1.7 1.7 0 0 0-1.88.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.56-1H3a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.56-1 1.7 1.7 0 0 0-.34-1.88l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.56V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1 1.56 1.7 1.7 0 0 0 1.88-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 9c.14.5.65 1 1.56 1H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.51 1Z" />
                </svg>
              </button>
              {adminDropdown && (
                <>
                  <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setAdminDropdown(false)} />
                  <div className="admin-dropdown">
                    <button className="admin-dropdown-item" onClick={() => { setAdminDropdown(false); setFbStep('folder'); setFbError(''); setFbModal(true); }}>
                      {T.importFbMenu}
                    </button>
                    <button className="admin-dropdown-item" onClick={() => {
                      setAdminDropdown(false);
                      loadPendingRequests();
                      setPendingRequestsModal(true);
                    }}>
                      {T.pendingRequestsMenu}
                    </button>
                    <button className="admin-dropdown-item" onClick={() => {
                      setAdminDropdown(false);
                      loadAppUsers();
                      setUsersModal(true);
                    }}>
                      {T.usersMenu}
                    </button>
                    <button className="admin-dropdown-item" onClick={() => {
                      setAdminDropdown(false);
                      setNotificationsModal(true);
                    }}>
                      {T.notificationsMenu}
                    </button>
                    <button className="admin-dropdown-item" onClick={() => {
                      setAdminDropdown(false);
                      window.open('https://console.firebase.google.com/project/wanderlust-gallery/usage', 'firebase-bills-usage', 'noopener,noreferrer,width=1200,height=800');
                    }}>
                      {T.firebaseBillsUsageMenu}
                    </button>
                    <button className="admin-dropdown-item" onClick={() => {
                      setAdminDropdown(false);
                      window.open('https://us-east-1.console.aws.amazon.com/console/home?region=us-east-1', 'aws-console', 'noopener,noreferrer');
                    }}>
                      {T.awsConsoleMenu}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
          {canUseFaceRecognition && (
            <button className="btn-icon" onClick={() => openPeopleTools()} title={T.peopleMenu} aria-label={T.peopleMenu}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"/>
                <circle cx="10" cy="7" r="4"/>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </button>
          )}
          {!activeSharedCollection && (activeTrip ? canManageActiveTrip : !isReadOnly) && (
            <button
              className="btn-icon btn-new-trip"
              onClick={() => activeTrip ? fileRef.current?.click() : setShowNewTrip(true)}
              disabled={uploading}
              title={activeTrip ? T.addPhotos : T.newTrip}
              aria-label={activeTrip ? T.addPhotos : T.newTrip}
            >
              {uploading ? <span className="spinner header-upload-spinner" /> : '+'}
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
        {dashboardNotifications.length > 0 && (
          <div className="dashboard-notifications fade-in" role="status" aria-live="polite">
            {dashboardNotifications.map(notification => (
              <div key={notification.id} className={`dashboard-notification dashboard-notification-${notification.type}`}>
                <div className="dashboard-notification-icon">{notification.type === 'albumShared' ? '↗' : '!'}</div>
                <div className="dashboard-notification-copy">
                  <strong>{notification.title}</strong>
                  <span>{notification.text}</span>
                </div>
                <div className="dashboard-notification-actions">
                  <button className="btn btn-sm" onClick={notification.action}>{T.view}</button>
                  <button className="btn btn-accent btn-sm" onClick={() => dismissDashboardNotification(notification.id)}>{T.accept}</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isReadOnly && (migration === 'needed' || migration === 'running' || migration === 'done' || migration === 'error') && !activeTrip && !activeSharedCollection && (
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
            {!activeSharedCollection && !isReadOnly && showNewTrip && (
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
            {!activeSharedCollection && trips.length > 0 && (
              <div className="sticky-header-zone">
                <div className="stats-bar fade-in">
                  <div className={`stat-card stat-card-btn${statPanel === 'trips' ? ' stat-active' : ''}`} onClick={() => setStatPanel(p => p === 'trips' ? null : 'trips')}>
                    <div className="stat-value">{trips.length}</div><div className="stat-label">{T.tripsLabel}</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">{totalPhotos}</div><div className="stat-label">{T.photosLabel}</div>
                  </div>
                  {!isReadOnly && (
                    <div className="stat-card stat-card-shares">
                      <div className="stat-value">{sharedByMePhotos}</div><div className="stat-label">{T.sharedByMePhotosLabel}</div>
                    </div>
                  )}
                  {!isReadOnly && (
                    <div className="stat-card stat-card-shares">
                      <div className="stat-value">{sharedWithMePhotos}</div><div className="stat-label">{T.sharedWithMePhotosLabel}</div>
                    </div>
                  )}
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
                      className="stat-card stat-card-wide next-stop-card stat-card-btn"
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
                    <div className="album-search-wrap">
                      <input
                        className="album-search-input"
                        value={albumSearch}
                        onChange={e => setAlbumSearch(e.target.value)}
                        placeholder={T.albumSearchPlaceholder}
                        aria-label={T.albumSearchPlaceholder}
                      />
                      {albumSearch && (
                        <button
                          type="button"
                          className="album-search-clear"
                          onClick={() => setAlbumSearch('')}
                          title={T.clearSearch}
                          aria-label={T.clearSearch}
                        >
                          &times;
                        </button>
                      )}
                    </div>
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

            {activeSharedCollection && (
              <div className="shared-collection-header fade-in">
                <button className="btn btn-sm" onClick={() => setActiveSharedCollection(false)}>{T.backToTrips}</button>
                <div>
                  <h2 className="gallery-title heading">{T.sharedToMeTitle}</h2>
                  <p>{T.sharedToMeCount(sharedToMeTrips.length)}</p>
                </div>
              </div>
            )}

            {(loadingTrips || loadingTripCovers.size > 0) && <TravelLoader label={T.loadingTrips} />}

            {!loadingTrips && loadingTripCovers.size === 0 && trips.length === 0 && !showNewTrip && (
              <div className="empty">
                <div className="empty-icon">✈</div>
                <p className="empty-title heading">{T.noTripsYet}</p>
                <p className="empty-sub">{T.noTripsYetSub}</p>
                {!isReadOnly && <button className="btn btn-accent" onClick={() => setShowNewTrip(true)}>{T.newTrip}</button>}
              </div>
            )}

            {/* ─ Choropleth map ─ */}
            {!activeSharedCollection && tripsView === 'map' && hasMapData && (
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
                {!activeSharedCollection && sharedToMeTrips.length > 0 && !albumSearchText && (
                  <div className="trip-card shared-to-me-card fade-in" onClick={() => { setActiveSharedCollection(true); setTripsView('grid'); }}>
                    <div className="trip-cover shared-to-me-cover">
                      {sharedToMeTrips.slice(0, 4).map((trip, idx) => {
                        const thumb = trip.cover;
                        return thumb
                          ? <img key={trip.id} src={thumb} alt="" loading="lazy" decoding="async" style={{ gridArea: `p${idx + 1}` }} />
                          : <div key={trip.id} className="shared-to-me-empty" style={{ gridArea: `p${idx + 1}` }} />;
                      })}
                      <div className="shared-to-me-badge">{sharedToMeTrips.length}</div>
                    </div>
                    <div className="trip-info">
                      <div className="trip-name">{T.sharedToMeTitle}</div>
                      <div className="trip-meta">{T.sharedToMeCount(sharedToMeTrips.length)}</div>
                    </div>
                  </div>
                )}
                {visibleGridTrips.map((trip, i) => {
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
                  const coverLoading = loadingTripCovers.has(trip.id) || (!previewUrl && previewLoading);
                  return (
                  <div key={trip.id} className="trip-card fade-in" style={{ animationDelay: `${i * 60}ms` }} onClick={() => setActiveTrip(trip.id)}>
                    <div className={`trip-cover ${previewUrl || coverLoading ? '' : 'trip-cover-empty'}${coverLoading ? ' trip-cover-loading' : ''}`}>
                      {previewUrl && <TripCoverImage src={previewUrl} />}
                      {coverLoading && !previewUrl && <TripCoverLoader label={T.loadingTrips} />}
                      {!previewUrl && !coverLoading && <span>🗺</span>}
                      {isOwner && <button className="trip-delete" onClick={e => { e.stopPropagation(); setConfirmDelete(trip.id); }}>✕</button>}
                      {canSlide && (
                        <>
                          <button
                            className="trip-slider-btn trip-slider-prev"
                            onClick={e => navigateTripPreview(e, trip, -1)}
                            title={isSpanish ? 'Foto anterior' : 'Previous photo'}
                            aria-label={isSpanish ? 'Foto anterior' : 'Previous photo'}
                          >
                            &lt;
                          </button>
                          <button
                            className="trip-slider-btn trip-slider-next"
                            onClick={e => navigateTripPreview(e, trip, 1)}
                            title={isSpanish ? 'Foto siguiente' : 'Next photo'}
                            aria-label={isSpanish ? 'Foto siguiente' : 'Next photo'}
                          >
                            &gt;
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
                          <span className="trip-vis-icon" title={tripIsShared(trip) ? T.sharedTitle : T.privateTitle}>
                            {tripIsShared(trip) ? '🌍' : '🔒'}
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
                {visibleGridTrips.length === 0 && albumSearchText && (
                  <div className="album-search-empty fade-in">
                    {T.noAlbumSearchResults(albumSearch.trim())}
                  </div>
                )}
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
                {canUseFaceRecognition && (
                  <button className="btn btn-sm" onClick={() => openPeopleTools()}>{T.peopleMenu}</button>
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
            {activePersonFilter && (
              <div className="person-filter-bar fade-in">
                <span>{T.personFilterLabel(activePersonFilter.name, displayPhotos.length)}</span>
                <button className="btn btn-sm" onClick={clearPersonFilter}>{T.clearFilter}</button>
              </div>
            )}

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
                        {coverUrl && <TripCoverImage src={coverUrl} />}
                        {cityPhotos.length > 1 && (
                          <>
                            <button
                              className="trip-slider-btn trip-slider-prev"
                              onClick={e => navigateCityPreview(e, cityPreviewKey, cityPhotos.length, -1)}
                              title={isSpanish ? 'Foto anterior' : 'Previous photo'}
                              aria-label={isSpanish ? 'Foto anterior' : 'Previous photo'}
                            >
                              &lt;
                            </button>
                            <button
                              className="trip-slider-btn trip-slider-next"
                              onClick={e => navigateCityPreview(e, cityPreviewKey, cityPhotos.length, 1)}
                              title={isSpanish ? 'Foto siguiente' : 'Next photo'}
                              aria-label={isSpanish ? 'Foto siguiente' : 'Next photo'}
                            >
                              &gt;
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
                        {coverUrl && <TripCoverImage src={coverUrl} />}
                        {cityUncategorized.length > 1 && (
                          <>
                            <button
                              className="trip-slider-btn trip-slider-prev"
                              onClick={e => navigateCityPreview(e, cityPreviewKey, cityUncategorized.length, -1)}
                              title={isSpanish ? 'Foto anterior' : 'Previous photo'}
                              aria-label={isSpanish ? 'Foto anterior' : 'Previous photo'}
                            >
                              &lt;
                            </button>
                            <button
                              className="trip-slider-btn trip-slider-next"
                              onClick={e => navigateCityPreview(e, cityPreviewKey, cityUncategorized.length, 1)}
                              title={isSpanish ? 'Foto siguiente' : 'Next photo'}
                              aria-label={isSpanish ? 'Foto siguiente' : 'Next photo'}
                            >
                              &gt;
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
                      <div className="photo-grid" onDragOver={canDrag ? onDragOver : undefined} onDragLeave={canDrag ? onDragLeave : undefined} onDrop={canDrag ? onDrop : undefined}>
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
                            <LazyPhotoImage
                              src={p.thumbUrl || p.url}
                              alt={p.name}
                              onLoad={() => markPhotoImageLoaded(p.id)}
                              onError={() => markPhotoImageLoaded(p.id)}
                            />
                            {canDrag && <div className="photo-drag-handle">⠿</div>}
                            {p.description && <div className="photo-desc-badge" title={p.description}>✎</div>}
                          </div>
                        );
                      })}
                      {hiddenPhotoCount > 0 && (
                        <button ref={photoLoadMoreRef} className="load-more-photos" onClick={() => setPhotoRenderLimit(n => Math.min(displayPhotos.length, n + PHOTO_GRID_BATCH_SIZE))}>
                          {T.showMorePhotos(Math.min(hiddenPhotoCount, PHOTO_GRID_BATCH_SIZE))}
                        </button>
                      )}
                      {canDrag && <div className="add-tile" onClick={() => fileRef.current?.click()}>+</div>}
                      </div>
                    </div>
                  );
                })()}

                {displayPhotos.length > 0 && view === 'list' && (
                  <div className="photo-display-wrap">
                    <div className="photo-list">
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
                        <LazyPhotoImage
                          src={p.thumbUrl || p.url}
                          alt={p.name}
                          className="photo-list-img"
                          onLoad={() => markPhotoImageLoaded(p.id)}
                          onError={() => markPhotoImageLoaded(p.id)}
                          onClick={() => setLightbox(p)}
                          style={{ cursor: 'pointer' }}
                        />
                        <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => setLightbox(p)}>
                          <div className="photo-list-name">{p.name}</div>
                          {p.description && <div className="photo-list-desc">{p.description}</div>}
                          {p.createdAt?.seconds && <div className="photo-list-date">{new Date(p.createdAt.seconds * 1000).toLocaleDateString()}</div>}
                        </div>
                      </div>
                    ))}
                    {hiddenPhotoCount > 0 && (
                      <button ref={photoLoadMoreRef} className="load-more-list" onClick={() => setPhotoRenderLimit(n => Math.min(displayPhotos.length, n + PHOTO_LIST_BATCH_SIZE))}>
                        {T.showMorePhotos(Math.min(hiddenPhotoCount, PHOTO_LIST_BATCH_SIZE))}
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
          <div className="lightbox-img-wrap" onClick={e => e.stopPropagation()}>
            <CrossfadeImage
              src={lightbox.url}
              alt={lightbox.name}
              className="lightbox-img"
              incomingClassName="lightbox-img-incoming"
              loading="eager"
            />
          </div>
          <button className="lb-close" aria-label={T.close} onClick={() => setLightbox(null)}>✕</button>
          {lbIndex > 0 && <button className="lb-arrow lb-arrow-left" aria-label={isSpanish ? 'Foto anterior' : 'Previous photo'} onClick={e => { e.stopPropagation(); navLightbox(-1); }}>&lt;</button>}
          {lbIndex < displayPhotos.length - 1 && <button className="lb-arrow lb-arrow-right" aria-label={isSpanish ? 'Foto siguiente' : 'Next photo'} onClick={e => { e.stopPropagation(); navLightbox(1); }}>&gt;</button>}
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
          {canUseFaceRecognition && (
            <>
              <button
                className="lb-person-btn"
                onClick={e => { e.stopPropagation(); openPeopleTools(lightbox); }}
                title={T.createPersonFromPhoto}
                disabled={savingPerson}
              >
                +
              </button>
              <button
                className="lb-face-index-btn"
                onClick={e => { e.stopPropagation(); indexCurrentPhotoFaces(lightbox); }}
                title={T.indexFacesInPhoto}
                disabled={faceAction === `index:${lightbox.id}`}
              >
                {faceAction === `index:${lightbox.id}` ? <span className="spinner" style={{ width: 16, height: 16 }} /> : '◎'}
              </button>
            </>
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
                  <button
                    className={`vis-btn${editShareWithGuests || editAllowedEmails.length > 0 ? ' active' : ''}`}
                    onClick={() => openShareAlbumsModal([editTrip.id], 'edit')}
                  >
                    {T.visShared}
                  </button>
                  <button
                    className={`vis-btn${!editShareWithGuests && editAllowedEmails.length === 0 ? ' active' : ''}`}
                    onClick={() => { setEditShareWithGuests(false); setEditAllowedEmails([]); }}
                  >
                    {T.visPrivate}
                  </button>
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
        <div className="modal-overlay fade-scale" onClick={closeShareAlbumsModal}>
          <div {...modalProps} className="modal share-audience-modal" onClick={e => e.stopPropagation()}>
            <p className="modal-title">{T.shareAlbumsTitle}</p>
            <p className="modal-sub">{T.albumSelected(shareAlbumsModal.tripIds.length)}</p>
            <ul className="share-albums-list">
              {shareAlbumsModal.tripIds.map(id => {
                const trip = trips.find(t => t.id === id);
                return trip ? (
                  <li key={id}>{trip.name}{trip.date ? ` (${trip.date})` : ''}</li>
                ) : null;
              })}
            </ul>

            <div className="share-audience-section">
              <p className="share-audience-title">{T.shareWithLabel}</p>
              <label className="share-audience-row">
                <input
                  type="checkbox"
                  checked={shareWithGuests}
                  onChange={e => { setShareWithGuests(e.target.checked); setShareEmailError(''); }}
                />
                <span>
                  <strong>{T.shareGuestsTitle}</strong>
                  <small>{T.shareGuestsNote}</small>
                </span>
              </label>
            </div>

            <div className="share-audience-section">
              <p className="share-audience-title">{T.internalUsersLabel}</p>
              <div className="internal-users-list">
                {loadingInternalUsers ? (
                  <div className="share-audience-loading"><span className="spinner" /> {T.loadingUsers}</div>
                ) : internalUsers.length === 0 ? (
                  <p className="share-audience-empty">{T.noInternalUsers}</p>
                ) : internalUsers.map(internalUser => (
                  <label key={internalUser.email} className="share-audience-row">
                    <input
                      type="checkbox"
                      checked={selectedInternalEmails.has(internalUser.email)}
                      onChange={() => {
                        setSelectedInternalEmails(prev => {
                          const next = new Set(prev);
                          next.has(internalUser.email) ? next.delete(internalUser.email) : next.add(internalUser.email);
                          return next;
                        });
                        setShareEmailError('');
                      }}
                    />
                    <span>
                      <strong>{internalUser.label}</strong>
                      <small>{internalUser.email}</small>
                    </span>
                  </label>
                ))}
              </div>
              {shareEmailError && <p className="field-error">{shareEmailError}</p>}
            </div>

            <div className="modal-actions" style={{ marginTop: 16 }}>
              <button className="btn btn-sm" onClick={closeShareAlbumsModal}>{T.cancel}</button>
              <button
                className="btn btn-accent"
                onClick={handleShareAlbumsClick}
                disabled={sharingAlbums || loadingInternalUsers}
              >
                {sharingAlbums ? T.sharing : T.shareAlbumsConfirm}
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
              {T.accessGrantedTo([
                ...(shareSuccess.guests ? [T.shareGuestsTitle] : []),
                ...(shareSuccess.emails || []),
              ].join(', '))}
            </p>
            <ul className="share-albums-list" style={{ textAlign: 'left', marginBottom: 16 }}>
              {shareSuccess.tripNames.map(name => <li key={name}>{name}</li>)}
            </ul>
            {(shareSuccess.emails || []).length > 0 && <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
              {T.emailClientNote}
            </p>}
            <button className="btn btn-accent" onClick={() => setShareSuccess(null)}>{T.accept}</button>
          </div>
        </div>
      )}

      {/* ═══ MANAGE ACCESSES MODAL ═══ */}
      {canUseFaceRecognition && peopleModal && (
        <div className="modal-overlay fade-scale" onClick={() => setPeopleModal(false)}>
          <div {...modalProps} className="modal people-modal" onClick={e => e.stopPropagation()}>
            <p className="modal-title">{T.peopleTitle}</p>
            <div className="people-modal-actions">
              <button
                className="btn btn-accent"
                onClick={() => setConfirmFullIndexation(true)}
                disabled={refreshAllPeople?.status === 'running' || fullIndexation?.status === 'scanning' || fullIndexation?.status === 'running'}
              >
                {fullIndexation?.status === 'scanning' || fullIndexation?.status === 'running'
                  ? T.indexingFaces
                  : T.fullIndexation}
              </button>
              <button
                className="btn btn-accent"
                onClick={refreshAllPersonMatches}
                disabled={refreshAllPeople?.status === 'running' || loadingPeople || people.length === 0 || fullIndexation?.status === 'scanning' || fullIndexation?.status === 'running'}
              >
                {refreshAllPeople?.status === 'running' ? T.refreshingAll : T.refreshAll}
              </button>
            </div>
            {refreshAllPeople?.status === 'running' && (
              <p className="modal-sub refresh-all-status">
                {T.refreshAllProgress(refreshAllPeople.done, refreshAllPeople.total, refreshAllPeople.current)}
              </p>
            )}
            {peopleReferencePhoto && (
              <div className="person-reference-box">
                <div className="person-reference-preview">
                  <img src={peopleReferencePhoto.thumbUrl || peopleReferencePhoto.url} alt="" />
                  {peopleReferenceFaces.map(face => {
                    const box = face.boundingBox || {};
                    const active = selectedReferenceFaceId === face.id;
                    return (
                      <button
                        key={face.id}
                        type="button"
                        className={`person-face-box${active ? ' active' : ''}`}
                        style={{
                          left: `${(box.Left || 0) * 100}%`,
                          top: `${(box.Top || 0) * 100}%`,
                          width: `${(box.Width || 0) * 100}%`,
                          height: `${(box.Height || 0) * 100}%`,
                        }}
                        onClick={() => setSelectedReferenceFaceId(face.id)}
                        title={T.selectThisFace}
                        aria-label={T.selectThisFace}
                      />
                    );
                  })}
                  {loadingReferenceFaces && (
                    <div className="person-reference-loading">
                      <span className="spinner" />
                    </div>
                  )}
                </div>
                <div className="form-group">
                  <label>{T.personNameLabel}</label>
                  <input
                    className="input"
                    value={personName}
                    onChange={e => setPersonName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && createPersonFromReference()}
                    placeholder={T.personNamePlaceholder}
                    autoFocus
                  />
                  <small className="person-reference-hint">
                    {loadingReferenceFaces
                      ? T.loadingFaces
                      : peopleReferenceFaces.length > 0
                        ? T.selectFaceHint
                        : T.noSelectableFaces}
                  </small>
                </div>
                <button className="btn btn-accent" onClick={createPersonFromReference} disabled={savingPerson || !personName.trim() || !selectedReferenceFaceId}>
                  {savingPerson ? T.saving : T.create}
                </button>
              </div>
            )}
            {loadingPeople ? (
              <div style={{ textAlign: 'center', padding: '32px 0' }}><span className="spinner" /></div>
            ) : people.length === 0 ? (
              <p className="modal-sub">{T.noPeopleYet}</p>
            ) : (
              <div className="people-list">
                {people.map(person => (
                  <div key={person.id} className="person-row">
                    <div className="person-main">
                      {person.referenceImageUrl && <img src={person.referenceImageUrl} alt="" />}
                      <span>
                        <strong>{person.name}</strong>
                        <small>{T.personMatchCount(person.matchCount || 0)}</small>
                      </span>
                    </div>
                    <div className="person-actions">
                      <button
                        className="btn btn-sm"
                        onClick={e => { e.stopPropagation(); searchPersonMatches(person); }}
                        disabled={refreshAllPeople?.status === 'running' || faceAction === `search:${person.id}` || faceAction === `delete:${person.id}`}
                      >
                        {faceAction === `search:${person.id}` ? T.searchingFaces : T.searchFaces}
                      </button>
                      <button
                        className="btn btn-accent btn-sm"
                        onClick={() => openPersonMatches(person)}
                        disabled={refreshAllPeople?.status === 'running' || (person.matchCount || 0) === 0 || faceAction === `search:${person.id}` || faceAction === `delete:${person.id}`}
                      >
                        {T.viewMatches}
                      </button>
                      {isAdminUser && (
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={e => { e.stopPropagation(); setConfirmDeletePerson(person); }}
                          disabled={refreshAllPeople?.status === 'running' || faceAction === `delete:${person.id}`}
                        >
                          {faceAction === `delete:${person.id}` ? T.saving : T.deleteBtn}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="modal-actions" style={{ marginTop: 16 }}>
              <button className="btn btn-sm" onClick={() => setPeopleModal(false)}>{T.close}</button>
            </div>
          </div>
        </div>
      )}

      {canUseFaceRecognition && confirmFullIndexation && (
        <div className="modal-overlay fade-scale" onClick={() => setConfirmFullIndexation(false)}>
          <div {...modalProps} className="modal full-index-modal" onClick={e => e.stopPropagation()}>
            <p className="modal-title">{T.fullIndexationTitle}</p>
            <p className="modal-sub">{T.fullIndexationText}</p>
            <div className="modal-actions">
              <button className="btn btn-sm" onClick={() => setConfirmFullIndexation(false)}>{T.cancel}</button>
              <button className="btn btn-accent" onClick={startFullIndexation}>{T.startIndexation}</button>
            </div>
          </div>
        </div>
      )}

      {canUseFaceRecognition && fullIndexation && (
        <div className="modal-overlay fade-scale" onClick={() => {
          if ((fullIndexation.status === 'done' || fullIndexation.status === 'cancelled') && !faceClusterReport) setFullIndexation(null);
        }}>
          <div {...modalProps} className={`modal full-index-modal${faceClusterReport?.status === 'ready' ? ' full-index-report-modal' : ''}`} onClick={e => e.stopPropagation()}>
            <p className="modal-title">{T.fullIndexation}</p>
            <p className="modal-sub">
              {fullIndexation.status === 'scanning'
                ? T.preparingIndexation
                : fullIndexation.status === 'done'
                  ? T.fullIndexationDone
                  : fullIndexation.status === 'cancelled'
                    ? T.fullIndexationCancelled
                    : T.fullIndexationProgress(fullIndexation.done + fullIndexation.skipped + fullIndexation.failed, fullIndexation.total)}
            </p>
            <div className="full-index-bar-wrap" aria-hidden="true">
              <div
                className="full-index-bar"
                style={{ width: `${fullIndexation.total ? Math.min(100, ((fullIndexation.done + fullIndexation.skipped + fullIndexation.failed) / fullIndexation.total) * 100) : 0}%` }}
              />
            </div>
            {fullIndexation.current && <div className="full-index-current">{fullIndexation.current}</div>}
            <div className="full-index-stats">
              <span>{T.fullIndexationIndexed(fullIndexation.done)}</span>
              <span>{T.fullIndexationSkipped(fullIndexation.skipped)}</span>
              <span>{T.fullIndexationFaces(fullIndexation.faces)}</span>
              <span>{T.fullIndexationFailed(fullIndexation.failed)}</span>
            </div>
            {fullIndexation.etaMs !== null && fullIndexation.status === 'running' && (
              <p className="full-index-eta">{T.fullIndexationEta(formatDuration(fullIndexation.etaMs))}</p>
            )}
            {faceClusterReport?.status === 'loading' && (
              <>
                <div className="face-cluster-loading">
                  <span className="spinner" />
                  <span>{T.groupingFaces}</span>
                </div>
                {faceClusterReport.estimateText && <p className="full-index-eta">{faceClusterReport.estimateText}</p>}
              </>
            )}
            {faceClusterReport?.status === 'error' && (
              <>
                {faceClusterReport.estimateText && <p className="full-index-eta">{faceClusterReport.estimateText}</p>}
                <p className="field-error" style={{ textAlign: 'center' }}>{faceClusterReport.error}</p>
              </>
            )}
            {faceClusterReport?.status === 'ready' && (
              <div className="face-cluster-report">
                <p className="face-cluster-title">{T.faceClusterReportTitle(faceClusterReport.faceCount, faceClusterReport.clusters.length)}</p>
                {faceClusterReport.clusters.length === 0 ? (
                  <p className="modal-sub">{T.noFaceClustersFound}</p>
                ) : (
                  <div className="face-cluster-list">
                    {faceClusterReport.clusters.map((cluster, index) => (
                      <div key={cluster.clusterId} className="face-cluster-row">
                        {cluster.sample?.imageUrl && <img src={cluster.sample.imageUrl} alt="" />}
                        <div className="face-cluster-copy">
                          <strong>{T.personCandidate(index + 1)}</strong>
                          <small>{T.faceClusterCount(cluster.faceCount, cluster.photoCount)}</small>
                        </div>
                        <input
                          className="input"
                          value={faceClusterNames[cluster.clusterId] || ''}
                          onChange={e => setFaceClusterNames(prev => ({ ...prev, [cluster.clusterId]: e.target.value }))}
                          placeholder={T.personNamePlaceholder}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            <div className="modal-actions" style={{ marginTop: 16 }}>
              {fullIndexation.status === 'running' || fullIndexation.status === 'scanning' ? (
                <button className="btn btn-sm" onClick={cancelFullIndexation}>{T.cancelIndexation}</button>
              ) : faceClusterReport?.status === 'ready' && faceClusterReport.clusters.length > 0 ? (
                <>
                  <button className="btn btn-sm" onClick={() => { setFaceClusterReport(null); setFullIndexation(null); }} disabled={savingClusterPeople}>{T.close}</button>
                  <button
                    className="btn btn-accent"
                    onClick={createPeopleFromClusters}
                    disabled={savingClusterPeople || !Object.values(faceClusterNames).some(name => name.trim())}
                  >
                    {savingClusterPeople ? T.saving : T.createPeople}
                  </button>
                </>
              ) : (
                <button className="btn btn-accent" onClick={() => { setFaceClusterReport(null); setFullIndexation(null); }}>{T.close}</button>
              )}
            </div>
          </div>
        </div>
      )}

      {isAdminUser && confirmDeletePerson && (
        <div className="modal-overlay fade-scale" onClick={() => setConfirmDeletePerson(null)}>
          <div {...modalProps} className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 460, textAlign: 'center' }}>
            <p className="modal-title">{T.deletePersonTitle}</p>
            <p className="modal-sub">{T.deletePersonText(confirmDeletePerson.name)}</p>
            <div className="modal-actions">
              <button className="btn btn-sm" onClick={() => setConfirmDeletePerson(null)} disabled={faceAction === `delete:${confirmDeletePerson.id}`}>{T.cancel}</button>
              <button className="btn btn-danger" onClick={() => deletePersonFromIndex(confirmDeletePerson)} disabled={faceAction === `delete:${confirmDeletePerson.id}`}>
                {faceAction === `delete:${confirmDeletePerson.id}` ? T.saving : T.deleteBtn}
              </button>
            </div>
          </div>
        </div>
      )}

      {canUseFaceRecognition && personMatchesModal && (
        <div className="modal-overlay fade-scale" onClick={() => setPersonMatchesModal(null)}>
          <div {...modalProps} className="modal person-matches-modal" onClick={e => e.stopPropagation()}>
            <p className="modal-title">{T.personMatchesTitle(personMatchesModal.person.name)}</p>
            {personMatchesModal.loading ? (
              <div style={{ textAlign: 'center', padding: '32px 0' }}><span className="spinner" /></div>
            ) : personMatchesModal.matches.length === 0 ? (
              <p className="modal-sub">{T.noMatchesFound}</p>
            ) : (
              <>
                <div className="person-match-actions">
                  <button
                    className="btn btn-accent"
                    onClick={() => openPersonSlideshow(personMatchesModal.person, personMatchesModal.matches, T.allMatchesTitle(personMatchesModal.person.name))}
                  >
                    {T.viewAllMatches}
                  </button>
                </div>
                <div className="match-albums-list">
                  {personMatchesModal.albums.map(album => (
                    <button
                      key={album.trip.id}
                      className="match-album-row"
                      onClick={() => openPersonSlideshow(personMatchesModal.person, album.matches, album.trip.name)}
                    >
                      <span>
                        <strong>{album.trip.name}</strong>
                        <small>{T.personMatchCount(album.matches.length)}</small>
                      </span>
                      <span className="match-album-arrow">›</span>
                    </button>
                  ))}
                </div>
              </>
            )}
            <div className="modal-actions" style={{ marginTop: 16 }}>
              <button className="btn btn-sm" onClick={() => setPersonMatchesModal(null)}>{T.close}</button>
            </div>
          </div>
        </div>
      )}

      {canUseFaceRecognition && personSlideshow && (
        <div className="modal-overlay fade-scale" onClick={() => setPersonSlideshow(null)}>
          <div {...modalProps} className="modal person-slideshow-modal" onClick={e => e.stopPropagation()}>
            <p className="modal-title">{personSlideshow.title}</p>
            {(() => {
                  const photo = personSlideshow.photos[personSlideshow.index];
                  return (
                    <>
                      <div className="person-slide-frame">
                        <CrossfadeImage
                          src={photo.url || photo.thumbUrl}
                          alt={photo.name || ''}
                          className="person-slide-img"
                          incomingClassName="person-slide-img-incoming"
                          loading="eager"
                        />
                    {personSlideshow.index > 0 && (
                      <button className="person-slide-arrow person-slide-prev" onClick={() => navigatePersonSlideshow(-1)} aria-label={isSpanish ? 'Foto anterior' : 'Previous photo'}>&lt;</button>
                    )}
                    {personSlideshow.index < personSlideshow.photos.length - 1 && (
                      <button className="person-slide-arrow person-slide-next" onClick={() => navigatePersonSlideshow(1)} aria-label={isSpanish ? 'Foto siguiente' : 'Next photo'}>&gt;</button>
                    )}
                  </div>
                  <div className="person-slide-meta">
                    <span>{photo.tripName}</span>
                    <span>{personSlideshow.index + 1} / {personSlideshow.photos.length}</span>
                  </div>
                </>
              );
            })()}
            <div className="modal-actions" style={{ marginTop: 16 }}>
              <button className="btn btn-sm" onClick={() => setPersonSlideshow(null)}>{T.close}</button>
            </div>
          </div>
        </div>
      )}

      {isAdminUser && notificationsModal && (
        <div className="modal-overlay fade-scale" onClick={() => setNotificationsModal(false)}>
          <div {...modalProps} className="modal notifications-modal" onClick={e => e.stopPropagation()}>
            <p className="modal-title">{T.notificationsTitle}</p>
            <p className="modal-sub">{T.notificationsSub}</p>
            <div className="notification-settings-list">
              <label className="notification-setting-row">
                <input
                  type="checkbox"
                  checked={notificationSettings.albumShared}
                  onChange={e => setNotificationSettings(prev => ({ ...prev, albumShared: e.target.checked }))}
                />
                <span>
                  <strong>{T.albumSharedNotificationType}</strong>
                  <small>{T.albumSharedNotificationTypeHelp}</small>
                </span>
              </label>
              <label className="notification-setting-row">
                <input
                  type="checkbox"
                  checked={notificationSettings.userRequest}
                  onChange={e => setNotificationSettings(prev => ({ ...prev, userRequest: e.target.checked }))}
                />
                <span>
                  <strong>{T.userRequestNotificationType}</strong>
                  <small>{T.userRequestNotificationTypeHelp}</small>
                </span>
              </label>
            </div>
            <div className="modal-actions" style={{ marginTop: 16 }}>
              <button className="btn btn-sm" onClick={() => setNotificationsModal(false)} disabled={savingNotificationSettings}>{T.cancel}</button>
              <button className="btn btn-accent" onClick={saveNotificationSettings} disabled={savingNotificationSettings}>
                {savingNotificationSettings ? T.saving : T.save}
              </button>
            </div>
          </div>
        </div>
      )}

      {!isReadOnly && pendingRequestsModal && (
        <div className="modal-overlay fade-scale" onClick={() => setPendingRequestsModal(false)}>
          <div {...modalProps} className="modal pending-requests-modal" onClick={e => e.stopPropagation()}>
            <p className="modal-title">{T.pendingRequestsTitle}</p>
            {loadingPendingRequests ? (
              <div style={{ textAlign: 'center', padding: '32px 0' }}><span className="spinner" /></div>
            ) : pendingRequests.length === 0 ? (
              <p className="modal-sub">{T.noPendingRequests}</p>
            ) : (
              <>
                <label className="pending-request-row pending-request-all">
                  <input
                    type="checkbox"
                    checked={selectedPendingRequests.size === pendingRequests.length}
                    ref={el => { if (el) el.indeterminate = selectedPendingRequests.size > 0 && selectedPendingRequests.size < pendingRequests.length; }}
                    onChange={() => {
                      setSelectedPendingRequests(prev =>
                        prev.size === pendingRequests.length ? new Set() : new Set(pendingRequests.map(r => r.id))
                      );
                    }}
                  />
                  <span>{T.selectAll}</span>
                </label>
                <div className="pending-requests-list">
                  {pendingRequests.map(request => (
                    <label key={request.id} className="pending-request-row">
                      <input
                        type="checkbox"
                        checked={selectedPendingRequests.has(request.id)}
                        onChange={() => setSelectedPendingRequests(prev => {
                          const next = new Set(prev);
                          next.has(request.id) ? next.delete(request.id) : next.add(request.id);
                          return next;
                        })}
                      />
                      <span>
                        <strong>{request.email}</strong>
                        {request.displayName && <small>{request.displayName}</small>}
                      </span>
                    </label>
                  ))}
                </div>
              </>
            )}
            <div className="modal-actions" style={{ marginTop: 16 }}>
              <button className="btn btn-sm" onClick={() => setPendingRequestsModal(false)}>{T.close}</button>
              <button className="btn btn-sm btn-danger" onClick={() => resolvePendingRequests('denied')} disabled={savingPendingRequests || selectedPendingRequests.size === 0}>
                {T.denyAccess}
              </button>
              <button className="btn btn-accent" onClick={() => resolvePendingRequests('approved')} disabled={savingPendingRequests || selectedPendingRequests.size === 0}>
                {savingPendingRequests ? T.saving : T.approveAccess}
              </button>
            </div>
          </div>
        </div>
      )}

      {!isReadOnly && usersModal && (
        <div className="modal-overlay fade-scale" onClick={() => setUsersModal(false)}>
          <div {...modalProps} className="modal users-modal" onClick={e => e.stopPropagation()}>
            <p className="modal-title">{T.usersTitle}</p>
            {loadingAppUsers ? (
              <div style={{ textAlign: 'center', padding: '32px 0' }}><span className="spinner" /></div>
            ) : appUsers.length === 0 ? (
              <p className="modal-sub">{T.noUsers}</p>
            ) : (
              <div className="users-list">
                {appUsers.map(appUser => (
                  <div key={appUser.email} className={`user-admin-row${appUser.isPaused ? ' user-admin-row-paused' : ''}`}>
                    <div className="user-admin-main">
                      <strong>{appUser.displayName}</strong>
                      <span>{appUser.email}</span>
                      {appUser.isPaused && <small>{T.userPaused}</small>}
                    </div>
                    <div className="user-admin-stats">
                      <span>{T.userAlbumCount(appUser.albums)}</span>
                      <span>{T.userPhotoCount(appUser.photos)}</span>
                    </div>
                    <div className="user-admin-actions">
                      <button
                        className="btn btn-sm"
                        onClick={() => setConfirmUserAction({ type: appUser.isPaused ? 'resume' : 'pause', user: appUser })}
                        disabled={savingAppUser === appUser.email || appUser.isAdmin}
                      >
                        {appUser.isPaused ? T.resumeAccess : T.pauseAccess}
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => setConfirmUserAction({ type: 'remove', user: appUser })}
                        disabled={savingAppUser === appUser.email || appUser.isAdmin}
                      >
                        {T.removeUser}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="modal-actions" style={{ marginTop: 16 }}>
              <button className="btn btn-sm" onClick={() => setUsersModal(false)}>{T.close}</button>
            </div>
          </div>
        </div>
      )}

      {!isReadOnly && confirmUserAction && (
        <div className="modal-overlay fade-scale" onClick={() => setConfirmUserAction(null)}>
          <div {...modalProps} className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 460, textAlign: 'center' }}>
            <p className="modal-title">
              {confirmUserAction.type === 'remove' ? T.confirmRemoveUserTitle : confirmUserAction.type === 'pause' ? T.confirmPauseUserTitle : T.confirmResumeUserTitle}
            </p>
            <p className="modal-sub">
              {confirmUserAction.type === 'remove'
                ? T.confirmRemoveUserText(confirmUserAction.user.email)
                : confirmUserAction.type === 'pause'
                  ? T.confirmPauseUserText(confirmUserAction.user.email)
                  : T.confirmResumeUserText(confirmUserAction.user.email)}
            </p>
            <div className="modal-actions" style={{ marginTop: 18 }}>
              <button className="btn btn-sm" onClick={() => setConfirmUserAction(null)} disabled={savingAppUser === confirmUserAction.user.email}>{T.cancel}</button>
              <button
                className={`btn ${confirmUserAction.type === 'remove' ? 'btn-danger' : 'btn-accent'}`}
                onClick={async () => {
                  if (confirmUserAction.type === 'remove') {
                    await removeAppUser(confirmUserAction.user);
                  } else {
                    await togglePauseUser(confirmUserAction.user);
                    setConfirmUserAction(null);
                  }
                }}
                disabled={savingAppUser === confirmUserAction.user.email}
              >
                {savingAppUser === confirmUserAction.user.email ? T.saving : T.confirm}
              </button>
            </div>
          </div>
        </div>
      )}

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
