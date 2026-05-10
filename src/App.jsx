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
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from 'react-simple-maps';
import { ThemeToggle } from './components/ThemeToggle';
import { TravelLoader } from './components/TravelLoader';
import { getTranslations } from './i18n';
import {
  ADMIN_EMAILS, ALLOWED_EMAILS, CONTINENT_ORDER, COUNTRY_CONTINENT, COUNTRY_ISO, COUNTRY_NAMES,
  GEO_URL, ISO_COUNTRY, MAP_TERRITORY_MARKERS, SPANISH_COUNTRIES, WORLD_COUNTRIES,
} from './data/countries';
import { parseFbAlbum } from './utils/facebookAlbums';
import { compressImage, uploadPhotoVariants } from './utils/imageUtils';
import { formatDuration } from './utils/format';
import { isValidHttpUrl } from './utils/validation';

const PUBLIC_APP_ORIGIN = 'https://pepiniperilmondo.web.app';
const YOUTUBE_UPLOAD_SCOPE = 'https://www.googleapis.com/auth/youtube.upload';
const YOUTUBE_DELETE_SCOPE = 'https://www.googleapis.com/auth/youtube.force-ssl';

const emptyProfileForm = {
  firstName: '',
  lastName: '',
  country: '',
  birthDate: '',
  sex: '',
};

function youtubeThumbUrl(videoId) {
  return videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : '';
}

function isVideoMedia(item) {
  return item?.type === 'video' || !!item?.youtubeId || item?.videoProvider === 'youtube';
}

function mediaCounts(items = []) {
  return items.reduce((counts, item) => {
    if (isVideoMedia(item)) counts.videos += 1;
    else counts.photos += 1;
    return counts;
  }, { photos: 0, videos: 0 });
}

function createVideoThumbnailBlob(file) {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const objectUrl = URL.createObjectURL(file);
    const cleanup = () => {
      URL.revokeObjectURL(objectUrl);
      video.removeAttribute('src');
      video.load();
    };
    video.muted = true;
    video.playsInline = true;
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      video.currentTime = Math.min(1, Math.max(0, (video.duration || 1) / 4));
    };
    video.onseeked = () => {
      try {
        const canvas = document.createElement('canvas');
        const maxWidth = 960;
        const ratio = video.videoWidth && video.videoHeight ? video.videoHeight / video.videoWidth : 9 / 16;
        canvas.width = Math.min(maxWidth, video.videoWidth || maxWidth);
        canvas.height = Math.round(canvas.width * ratio);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          cleanup();
          blob ? resolve(blob) : reject(new Error('Could not create video thumbnail'));
        }, 'image/jpeg', 0.82);
      } catch (err) {
        cleanup();
        reject(err);
      }
    };
    video.onerror = () => {
      cleanup();
      reject(new Error('Could not read video for thumbnail'));
    };
    video.src = objectUrl;
  });
}

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

function PhotoSliderOverlay({
  item,
  items = [],
  index = 0,
  onClose,
  onNavigate,
  title = '',
  subtitle = '',
  closeLabel = 'Close',
  previousLabel = 'Previous photo',
  nextLabel = 'Next photo',
  className = '',
  stageClassName = '',
  imageClassName = 'lightbox-img',
  incomingClassName = 'lightbox-img-incoming',
  isPlaying = false,
  onTogglePlay,
  children,
  footer,
}) {
  const total = items.length || (item ? 1 : 0);
  const current = item || items[index];
  if (!current) return null;

  const hasPrevious = total > 1 && index > 0;
  const hasNext = total > 1 && index < total - 1;
  const visibleDots = total <= 18
    ? items.map((_, dotIndex) => ({ key: dotIndex, index: dotIndex }))
    : Array.from({ length: 18 }, (_, dotIndex) => {
      const mappedIndex = Math.round(dotIndex * (total - 1) / 17);
      return { key: `${dotIndex}-${mappedIndex}`, index: mappedIndex };
    });

  return (
    <div className={`lightbox trip-photo-slider fade-scale ${className}`.trim()} role="dialog" aria-modal="true" onClick={onClose}>
      <div className={`lightbox-img-wrap trip-photo-slider-stage ${stageClassName}`.trim()} onClick={e => e.stopPropagation()}>
        {(current.type === 'video' || current.youtubeId) ? (
          <iframe
            className="lightbox-video"
            src={current.embedUrl || `https://www.youtube.com/embed/${current.youtubeId}`}
            title={current.name || title || 'Video'}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <CrossfadeImage
            src={current.url || current.thumbUrl}
            alt={current.name || title || ''}
            className={imageClassName}
            incomingClassName={incomingClassName}
            loading="eager"
          />
        )}
        {(title || subtitle) && (
          <div className="trip-photo-slider-caption">
            {title && <strong>{title}</strong>}
            {subtitle && <span>{subtitle}</span>}
          </div>
        )}
        {onTogglePlay && (
          <button
            type="button"
            className={`trip-photo-slider-play${isPlaying ? ' is-playing' : ''}`}
            onClick={e => { e.stopPropagation(); onTogglePlay(); }}
            aria-label={isPlaying ? 'Pause presentation' : 'Play presentation'}
          >
            {isPlaying ? (
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14M16 5v14" /></svg>
            ) : (
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 5 11 7-11 7Z" /></svg>
            )}
          </button>
        )}
      </div>
      <button className="lb-close trip-photo-slider-close" aria-label={closeLabel} onClick={e => { e.stopPropagation(); onClose(); }}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" /></svg>
      </button>
      {hasPrevious && (
        <button className="lb-arrow lb-arrow-left trip-photo-slider-arrow" aria-label={previousLabel} onClick={e => { e.stopPropagation(); onNavigate(-1); }}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>
        </button>
      )}
      {hasNext && (
        <button className="lb-arrow lb-arrow-right trip-photo-slider-arrow" aria-label={nextLabel} onClick={e => { e.stopPropagation(); onNavigate(1); }}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg>
        </button>
      )}
      {total > 1 && (
        <div className="trip-photo-slider-progress" onClick={e => e.stopPropagation()}>
          <span className="lb-counter trip-photo-slider-counter">{index + 1} / {total}</span>
          <div className="trip-photo-slider-dots" aria-hidden="true">
            {visibleDots.map(dot => (
              <span key={dot.key} className={dot.index === index ? 'active' : ''} />
            ))}
          </div>
        </div>
      )}
      {children}
      {footer && <div className="trip-photo-slider-footer" onClick={e => e.stopPropagation()}>{footer}</div>}
    </div>
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

function HelpGuide({ type, T }) {
  const isFacebook = type === 'facebook';
  const steps = isFacebook ? T.fbHelpSteps : T.peopleHelpSteps;

  return (
    <div className={`help-guide help-guide-${type}`}>
      <div className="help-visual" aria-hidden="true">
        {isFacebook ? (
          <>
            <div className="help-folder">
              <span />
              <strong>your_facebook_activity</strong>
            </div>
            <div className="help-arrow" />
            <div className="help-album-stack">
              <span />
              <span />
              <span />
            </div>
            <div className="help-import-dot" />
          </>
        ) : (
          <>
            <div className="help-photo-frame">
              <div className="help-face-marker" />
            </div>
            <div className="help-arrow" />
            <div className="help-person-chip">
              <span />
              <strong>Elena</strong>
            </div>
            <div className="help-match-pulse" />
          </>
        )}
      </div>
      <ol className="help-steps">
        {steps.map(step => <li key={step}>{step}</li>)}
      </ol>
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

function PrivacyPolicyPage({ logoSrc }) {
  return (
    <div className="public-doc-page">
      <header className="header">
        <a className="header-logo-wrap" href="/" aria-label="Pepini per il mondo">
          <img src={logoSrc} alt="Pepini per il mondo" className="header-logo-img" />
          <span className="header-logo heading">Pepini per il mondo</span>
        </a>
      </header>
      <main className="public-doc-content fade-in">
        <p className="public-doc-kicker">Privacy Policy</p>
        <h1 className="heading">Pepini per il mondo Privacy Policy</h1>
        <p className="public-doc-updated">Last updated: May 10, 2026</p>

        <section>
          <h2>Overview</h2>
          <p>
            Pepini per il mondo is a private travel gallery used to organize, upload, and share travel photos and
            videos. The app is operated by Martin Raices and is intended for invited users and guests with shared links.
          </p>
        </section>

        <section>
          <h2>Information We Collect</h2>
          <p>
            When you sign in with Google, we receive basic account information such as your email address, display
            name, and Google user identifier. Inside the app, users may add profile details, album metadata, photos,
            videos, descriptions, city labels, and sharing preferences.
          </p>
        </section>

        <section>
          <h2>Google and YouTube API Use</h2>
          <p>
            If you choose to connect YouTube, the app requests YouTube permissions for uploading private videos
            (https://www.googleapis.com/auth/youtube.upload) and, when you explicitly choose it, deleting those uploaded
            videos from YouTube (https://www.googleapis.com/auth/youtube.force-ssl).
          </p>
          <p>
            The app does not read your YouTube channel content, does not publish videos publicly, and does not sell or
            share YouTube API data with third parties. If you choose to delete an uploaded video from YouTube inside
            the app, the app uses your permission only for that requested deletion. YouTube access tokens are kept in
            browser session storage and are used only during the active upload flow.
          </p>
          <p>
            Pepini per il mondo's use and transfer of information received from Google APIs adheres to the Google API
            Services User Data Policy, including the Limited Use requirements.
          </p>
        </section>

        <section>
          <h2>How We Use Information</h2>
          <p>
            We use app data to provide the travel gallery experience: authentication, album creation, media upload,
            private or shared album access, profile settings, notifications, and optional YouTube private video upload.
          </p>
        </section>

        <section>
          <h2>Sharing</h2>
          <p>
            Albums are shared only according to the settings selected in the app, such as guest visibility, specific
            invited email addresses, or public share links. We do not sell personal information.
          </p>
        </section>

        <section>
          <h2>Storage and Security</h2>
          <p>
            Photos, videos, album data, and profile settings are stored using Firebase services. Access is controlled
            by Firebase Authentication and security rules that limit users to the albums and files they own or have
            been granted access to.
          </p>
        </section>

        <section>
          <h2>Revoking Access</h2>
          <p>
            You can disconnect the app from your Google account at any time from your Google Account permissions page:
            {' '}
            <a href="https://myaccount.google.com/permissions" target="_blank" rel="noreferrer">
              https://myaccount.google.com/permissions
            </a>
            .
          </p>
        </section>

        <section>
          <h2>Contact</h2>
          <p>
            For privacy questions or access requests, contact:
            {' '}
            <a href="mailto:raicesm@gmail.com">raicesm@gmail.com</a>.
          </p>
        </section>
      </main>
    </div>
  );
}

function TermsOfServicePage({ logoSrc }) {
  return (
    <div className="public-doc-page">
      <header className="header">
        <a className="header-logo-wrap" href="/" aria-label="Pepini per il mondo">
          <img src={logoSrc} alt="Pepini per il mondo" className="header-logo-img" />
          <span className="header-logo heading">Pepini per il mondo</span>
        </a>
      </header>
      <main className="public-doc-content fade-in">
        <p className="public-doc-kicker">Terms of Service</p>
        <h1 className="heading">Pepini per il mondo Terms of Service</h1>
        <p className="public-doc-updated">Last updated: May 10, 2026</p>

        <section>
          <h2>Use of the App</h2>
          <p>
            Pepini per il mondo is a private travel gallery for invited users. By using the app, you agree to use it
            only for lawful personal photo and video organization, upload, and sharing.
          </p>
        </section>

        <section>
          <h2>User Content</h2>
          <p>
            You are responsible for the photos, videos, descriptions, album details, and other content you upload or
            share through the app. You should only upload content you own or have permission to use.
          </p>
        </section>

        <section>
          <h2>YouTube Uploads</h2>
          <p>
            If you connect YouTube, Pepini per il mondo may upload videos you explicitly select to your own YouTube
            account as private videos. If you choose the delete-from-YouTube option, the app may also delete that video
            from your YouTube account. You remain responsible for your YouTube account, uploaded videos, and compliance
            with YouTube's Terms of Service.
          </p>
        </section>

        <section>
          <h2>Sharing and Access</h2>
          <p>
            Album owners control whether albums are private, shared with invited users, visible to guests, or available
            through a share link. Do not share links or content with people who should not have access.
          </p>
        </section>

        <section>
          <h2>Availability</h2>
          <p>
            The app is provided as a private service and may change, pause, or become unavailable without notice. We do
            not guarantee uninterrupted operation or permanent storage of uploaded content.
          </p>
        </section>

        <section>
          <h2>Contact</h2>
          <p>
            Questions about these terms can be sent to:
            {' '}
            <a href="mailto:raicesm@gmail.com">raicesm@gmail.com</a>.
          </p>
        </section>
      </main>
    </div>
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
  const [confirmDeleteMedia, setConfirmDeleteMedia] = useState(null);
  const [deletingMedia, setDeletingMedia] = useState(false);
  const [signOutConfirm, setSignOutConfirm] = useState(null);
  const [profileModal, setProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState(emptyProfileForm);
  const [savingProfile, setSavingProfile] = useState(false);
  const [youtubeConnecting, setYoutubeConnecting] = useState(false);
  const [youtubeHelpOpen, setYoutubeHelpOpen] = useState(false);
  const [youtubeAccessToken, setYoutubeAccessToken] = useState(() => sessionStorage.getItem('youtubeAccessToken') || '');
  const [youtubeConnectedEmail, setYoutubeConnectedEmail] = useState(() => sessionStorage.getItem('youtubeConnectedEmail') || '');
  const [youtubeTokenExpiresAt, setYoutubeTokenExpiresAt] = useState(() => Number(sessionStorage.getItem('youtubeTokenExpiresAt') || 0));
  const [youtubeTokenNow, setYoutubeTokenNow] = useState(() => Date.now());
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
  const [tripSortDirection, setTripSortDirection] = useState('desc');
  const [albumSearch, setAlbumSearch] = useState('');
  const [personSearchPhotos, setPersonSearchPhotos] = useState([]);
  const [personSearchLoading, setPersonSearchLoading] = useState(false);
  const [personSearchNames, setPersonSearchNames] = useState([]);
  const [mobileStatsCollapsed, setMobileStatsCollapsed] = useState(() => window.matchMedia?.('(max-width: 640px)').matches ?? false);
  const [appWallpaperUrl, setAppWallpaperUrl] = useState('');
  const [scrollFade, setScrollFade] = useState('');
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef();
  const photoLoadMoreRef = useRef(null);
  const publicPhotoLoadMoreRef = useRef(null);
  const uiHistoryRef = useRef([]);
  const lastUiSnapshotRef = useRef(null);
  const restoringUiRef = useRef(false);
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
  const [peopleHelpOpen, setPeopleHelpOpen] = useState(true);
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
  const [personPresentation, setPersonPresentation] = useState(null);
  const [exportingPresentation, setExportingPresentation] = useState(false);
  const [presentationExportProgress, setPresentationExportProgress] = useState(null);
  const [confirmFullIndexation, setConfirmFullIndexation] = useState(false);
  const [fullIndexation, setFullIndexation] = useState(null);
  const [faceClusterReport, setFaceClusterReport] = useState(null);
  const [faceClusterNames, setFaceClusterNames] = useState({});
  const [savingClusterPeople, setSavingClusterPeople] = useState(false);
  const [refreshAllPeople, setRefreshAllPeople] = useState(null);
  const [selectedMatchPersonIds, setSelectedMatchPersonIds] = useState(new Set());
  const fullIndexCancelRef = useRef(false);
  const fullIndexDismissedRef = useRef(false);
  const fullIndexOperationRef = useRef(null);
  const refreshAllCancelRef = useRef(false);
  const refreshAllOperationRef = useRef(null);
  const presentationExportCancelRef = useRef(false);
  const thumbMigrationCancelRef = useRef(false);
  const autoDateCancelRef = useRef(false);
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
  const [publicPresentationIndex, setPublicPresentationIndex] = useState(0);
  const [publicPresentationPlaying, setPublicPresentationPlaying] = useState(true);

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
  const [fbHelpOpen, setFbHelpOpen] = useState(true);
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
  const fbAbortControllerRef = useRef(null);
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

  const createOperationId = useCallback((prefix) => (
    `${prefix}_${Date.now()}_${window.crypto?.randomUUID?.() || Math.random().toString(36).slice(2)}`
  ), []);

  const cancelRemoteOperation = useCallback(async (operationId) => {
    if (!operationId) return;
    try {
      const cancelOperation = httpsCallable(firebaseFunctions, 'cancelOperation');
      await cancelOperation({ operationId });
    } catch (err) {
      console.warn('Could not mark operation as cancelled:', err);
    }
  }, []);

  const cancelFacebookImport = useCallback(() => {
    fbCancelRef.current = true;
    fbAbortControllerRef.current?.abort();
    setFbStep(step => step === 'import' ? 'cancelled' : step);
  }, []);

  const closeFacebookModal = useCallback(() => {
    setFbHelpOpen(true);
    setFbModal(false);
  }, []);

  const returnFromAdminToolToProfile = useCallback((closeAdminTool) => {
    closeAdminTool();
    setProfileModal(true);
  }, []);

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

  useEffect(() => {
    if (!youtubeAccessToken) return undefined;
    const timer = window.setInterval(() => setYoutubeTokenNow(Date.now()), 60000);
    return () => window.clearInterval(timer);
  }, [youtubeAccessToken]);

  const youtubeTokenStatus = useMemo(() => {
    if (youtubeAccessToken && youtubeTokenExpiresAt > 0) {
      if (youtubeTokenExpiresAt <= youtubeTokenNow) return T.youtubeTokenExpired;
      return T.youtubeTokenExpiresAt(new Date(youtubeTokenExpiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }
    if (youtubeAccessToken) return T.youtubeTokenExpiryUnknown;
    if (youtubeConnectedEmail) return T.youtubeTokenSessionMissing;
    return '';
  }, [T, youtubeAccessToken, youtubeConnectedEmail, youtubeTokenExpiresAt, youtubeTokenNow]);

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
    sessionStorage.removeItem('youtubeAccessToken');
    sessionStorage.removeItem('youtubeConnectedEmail');
    sessionStorage.removeItem('youtubeTokenExpiresAt');
    setYoutubeAccessToken('');
    setYoutubeConnectedEmail('');
    setYoutubeTokenExpiresAt(0);
    signOut(auth).catch(() => {});
  }, []);

  const saveUserProfile = useCallback(async () => {
    if (!user || isReadOnly) return;
    setSavingProfile(true);
    try {
      await setDoc(doc(db, 'users', user.uid, 'profile', 'settings'), {
        profile: profileForm,
        youtubeConnectedEmail: youtubeConnectedEmail || null,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      showNotice('success', T.profileSaved);
      setProfileModal(false);
    } catch (err) {
      console.error('Save profile error:', err);
      showNotice('error', T.profileSaveFailed);
    } finally {
      setSavingProfile(false);
    }
  }, [T.profileSaveFailed, T.profileSaved, isReadOnly, profileForm, showNotice, user, youtubeConnectedEmail]);

  const connectYouTube = useCallback(async () => {
    if (!user || isReadOnly) return;
    setYoutubeConnecting(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope(YOUTUBE_UPLOAD_SCOPE);
      provider.addScope(YOUTUBE_DELETE_SCOPE);
      provider.setCustomParameters({
        prompt: 'consent',
        login_hint: user.email || '',
      });
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken || '';
      if (!token) throw new Error('Missing YouTube access token');
      const email = result.user?.email || user.email || '';
      const tokenExpiresAt = Date.now() + (55 * 60 * 1000);
      setYoutubeAccessToken(token);
      setYoutubeConnectedEmail(email);
      setYoutubeTokenExpiresAt(tokenExpiresAt);
      sessionStorage.setItem('youtubeAccessToken', token);
      sessionStorage.setItem('youtubeConnectedEmail', email);
      sessionStorage.setItem('youtubeTokenExpiresAt', String(tokenExpiresAt));
      await setDoc(doc(db, 'users', user.uid, 'profile', 'settings'), {
        youtubeConnectedEmail: email,
        youtubeConnectedAt: serverTimestamp(),
      }, { merge: true });
      showNotice('success', T.youtubeConnectedNotice);
    } catch (err) {
      console.error('YouTube connect error:', err);
      showNotice('error', T.youtubeConnectFailed);
    } finally {
      setYoutubeConnecting(false);
    }
  }, [T.youtubeConnectFailed, T.youtubeConnectedNotice, isReadOnly, showNotice, user]);

  useEffect(() => {
    if (!user) {
      setCustomPanelLabel('');
      setCustomPanelMiro('');
      setProfileForm(emptyProfileForm);
      setYoutubeConnectedEmail('');
      setYoutubeTokenExpiresAt(0);
      return;
    }
    if (isReadOnly) {
      setCustomPanelLabel('');
      setCustomPanelMiro('');
      setProfileForm(emptyProfileForm);
      setYoutubeConnectedEmail('');
      setYoutubeTokenExpiresAt(0);
      return;
    }
    getDoc(doc(db, 'users', user.uid, 'profile', 'settings'))
      .then(snap => {
        if (snap.exists()) {
          const data = snap.data();
          setCustomPanelLabel(data.panelLabel || '');
          setCustomPanelMiro(data.panelMiro || '');
          setProfileForm({ ...emptyProfileForm, ...(data.profile || {}) });
          setYoutubeConnectedEmail(data.youtubeConnectedEmail || sessionStorage.getItem('youtubeConnectedEmail') || '');
        }
      })
      .catch(() => {});
  }, [user, isReadOnly]);

  // ─── Public share: check URL on mount ───
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const presentationToken = params.get('presentation');
    const token = params.get('share');
    if (!token && !presentationToken) return;
    setPublicShareLoading(true);
    if (presentationToken) {
      getDoc(doc(db, 'sharedLinks', presentationToken))
        .then(snap => {
          if (!snap.exists()) {
            setPublicShareData({ error: true });
            return;
          }
          const data = snap.data();
          setPublicShareData({
            type: 'presentation',
            ...data,
            title: data.title || data.tripName,
            personName: data.personName || data.tripName,
          });
          setPublicPresentationIndex(0);
          setPublicPresentationPlaying(true);
        })
        .catch(() => setPublicShareData({ error: true }))
        .finally(() => setPublicShareLoading(false));
      return;
    }
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

  const refreshTripMediaCounts = useCallback(async (sourceTrips) => {
    if (!sourceTrips.length) return;
    const refreshed = await Promise.all(sourceTrips.map(async (trip) => {
      try {
        const snap = await getDocs(photosCol(trip.id));
        const media = snap.docs.map(d => d.data());
        const counts = mediaCounts(media);
        const firstVideo = media.find(item => item.youtubeId);
        const cover = firstVideo && counts.photos === 0 ? youtubeThumbUrl(firstVideo.youtubeId) : trip.cover;
        const next = { ...trip, photoCount: counts.photos, videoCount: counts.videos, cover };
        const updates = {};
        if ((trip.photoCount || 0) !== counts.photos) updates.photoCount = counts.photos;
        if ((trip.videoCount || 0) !== counts.videos) updates.videoCount = counts.videos;
        if (cover && cover !== trip.cover) updates.cover = cover;
        if (Object.keys(updates).length) {
          updateDoc(doc(db, 'trips', trip.id), updates).catch(() => {});
        }
        return next;
      } catch (err) {
        console.warn('Could not refresh media counts:', trip.id, err);
        return { ...trip, videoCount: trip.videoCount || 0 };
      }
    }));
    setTrips(prev => {
      const byId = new Map(refreshed.map(trip => [trip.id, trip]));
      return prev.map(trip => byId.get(trip.id) || trip);
    });
  }, []);

  const resolveMissingTripCovers = useCallback(async (sourceTrips) => {
    if (!user || isReadOnly || sourceTrips.length === 0) return;

    const needsFix = sourceTrips.filter(t =>
      ((t.photoCount || 0) + (t.videoCount || 0)) > 0
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

  const closeThumbMigration = useCallback(() => {
    if (thumbMigration?.status === 'running' || thumbMigration?.status === 'scanning') {
      thumbMigrationCancelRef.current = true;
    }
    setThumbMigration(null);
  }, [thumbMigration?.status]);

  const closeFullIndexation = useCallback(() => {
    if (fullIndexation?.status === 'running' || fullIndexation?.status === 'scanning' || faceClusterReport?.status === 'loading') {
      fullIndexCancelRef.current = true;
      cancelRemoteOperation(fullIndexOperationRef.current);
    }
    fullIndexDismissedRef.current = true;
    setFaceClusterReport(null);
    setFullIndexation(null);
  }, [cancelRemoteOperation, faceClusterReport?.status, fullIndexation?.status]);

  const closeAutoDateModal = useCallback(() => {
    if (autoDateModal === 'running') autoDateCancelRef.current = true;
    setAutoDateModal(false);
  }, [autoDateModal]);

  const buildUiSnapshot = useCallback(() => ({
    activeTrip,
    activeCity,
    activeSharedCollection,
    statPanel,
    tripsView,
    view,
    showNewTrip,
  }), [activeTrip, activeCity, activeSharedCollection, statPanel, tripsView, view, showNewTrip]);

  const restoreUiSnapshot = useCallback((snapshot) => {
    restoringUiRef.current = true;
    setActiveTrip(snapshot.activeTrip);
    setActiveCity(snapshot.activeCity);
    setActiveSharedCollection(snapshot.activeSharedCollection);
    setStatPanel(snapshot.statPanel);
    setTripsView(snapshot.tripsView);
    setView(snapshot.view);
    setShowNewTrip(snapshot.showNewTrip);
  }, []);

  const restorePreviousUiSnapshot = useCallback(() => {
    const snapshot = uiHistoryRef.current.pop();
    if (!snapshot) return false;
    restoreUiSnapshot(snapshot);
    return true;
  }, [restoreUiSnapshot]);

  useEffect(() => {
    const snapshot = buildUiSnapshot();
    const snapshotKey = JSON.stringify(snapshot);
    const lastSnapshot = lastUiSnapshotRef.current;
    const lastSnapshotKey = lastSnapshot ? JSON.stringify(lastSnapshot) : '';

    if (!lastSnapshot) {
      lastUiSnapshotRef.current = snapshot;
      return;
    }

    if (snapshotKey === lastSnapshotKey) return;

    if (restoringUiRef.current) {
      restoringUiRef.current = false;
      lastUiSnapshotRef.current = snapshot;
      return;
    }

    uiHistoryRef.current.push(lastSnapshot);
    if (uiHistoryRef.current.length > 40) uiHistoryRef.current.shift();
    lastUiSnapshotRef.current = snapshot;
  }, [buildUiSnapshot]);

  // ─── Keyboard nav ───
  useEffect(() => {
    const handler = (e) => {
      if (confirmDeleteMedia) {
        if (e.key === 'Escape') setConfirmDeleteMedia(null);
        return;
      }
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
      if (personPresentation?.photos?.length) {
        if (e.key === 'Escape') closePersonPresentation();
        if (e.key === 'ArrowLeft') navigatePersonPresentation(-1);
        if (e.key === 'ArrowRight') navigatePersonPresentation(1);
        return;
      }
      if (personSlideshow?.photos?.length) {
        if (e.key === 'Escape') setPersonSlideshow(null);
        if (e.key === 'ArrowLeft') navigatePersonSlideshow(-1);
        if (e.key === 'ArrowRight') navigatePersonSlideshow(1);
        return;
      }
      if (e.key === 'Escape') {
        if (shareSuccess) { setShareSuccess(null); }
        else if (confirmUserAction) { setConfirmUserAction(null); }
        else if (personPresentation) { closePersonPresentation(); }
        else if (personSlideshow) { setPersonSlideshow(null); }
        else if (personMatchesModal) { setPersonMatchesModal(null); }
        else if (confirmDeletePerson) { setConfirmDeletePerson(null); }
        else if (peopleModal) { closePeopleTools(); }
        else if (notificationsModal) { returnFromAdminToolToProfile(() => setNotificationsModal(false)); }
        else if (usersModal) { returnFromAdminToolToProfile(() => setUsersModal(false)); }
        else if (pendingRequestsModal) { returnFromAdminToolToProfile(() => setPendingRequestsModal(false)); }
        else if (manageAccessesModal) { setManageAccessesModal(false); }
        else if (profileModal) { setProfileModal(false); }
        else if (thumbMigration) { closeThumbMigration(); }
        else if (shareAlbumsModal) { closeShareAlbumsModal(); }
        else if (autoDateModal) { closeAutoDateModal(); }
        else if (adminDropdown) { setAdminDropdown(false); }
        else if (editTrip) { setEditTrip(null); }
        else if (editCity) { setEditCity(null); }
        else if (shareModal) { setShareModal(null); }
        else if (signOutConfirm) { setSignOutConfirm(null); }
        else if (confirmDelete) { setConfirmDelete(null); }
        else if (cityModal) { setCityModal(false); }
        else if (fbModal) {
          returnFromAdminToolToProfile(() => {
            if (fbStep === 'import') cancelFacebookImport();
            closeFacebookModal();
          });
        }
        else if (restorePreviousUiSnapshot()) {}
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
      refreshTripMediaCounts(merged);

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
      cover: null, photoCount: 0, videoCount: 0, createdAt: serverTimestamp(),
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
    if (((trip.photoCount || 0) + (trip.videoCount || 0)) < 2) return;
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

  const uploadVideoToYouTube = useCallback(async (file, trip) => {
    if (!youtubeAccessToken) throw new Error('YOUTUBE_NOT_CONNECTED');
    const clearYouTubeSession = () => {
      sessionStorage.removeItem('youtubeAccessToken');
      sessionStorage.removeItem('youtubeTokenExpiresAt');
      setYoutubeAccessToken('');
      setYoutubeTokenExpiresAt(0);
    };
    const readYouTubeError = async (response) => {
      let detail = '';
      try {
        const payload = await response.clone().json();
        detail = payload?.error?.message || payload?.error_description || '';
      } catch (_) {
        try { detail = await response.text(); } catch (__) {}
      }
      return detail ? `YouTube upload failed (${response.status}): ${detail}` : `YouTube upload failed (${response.status})`;
    };
    const cleanName = file.name.replace(/\.[^.]+$/, '') || file.name;
    const metadata = {
      snippet: {
        title: cleanName,
        description: `Uploaded privately from Pepini per il mondo${trip?.name ? ` - ${trip.name}` : ''}.`,
        categoryId: '22',
      },
      status: {
        privacyStatus: 'private',
        selfDeclaredMadeForKids: false,
      },
    };
    const initResponse = await fetch('https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${youtubeAccessToken}`,
        'Content-Type': 'application/json; charset=UTF-8',
        'X-Upload-Content-Type': file.type || 'application/octet-stream',
        'X-Upload-Content-Length': String(file.size),
      },
      body: JSON.stringify(metadata),
    });
    if (initResponse.status === 401 || initResponse.status === 403) {
      clearYouTubeSession();
      throw new Error('YOUTUBE_RECONNECT');
    }
    if (!initResponse.ok) throw new Error(await readYouTubeError(initResponse));

    const uploadUrl = initResponse.headers.get('Location');
    if (!uploadUrl) throw new Error('YouTube upload URL missing');

    try {
      const uploaded = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${youtubeAccessToken}`,
          'Content-Type': file.type || 'application/octet-stream',
        },
        body: file,
      });
      if (uploaded.status === 401 || uploaded.status === 403) {
        clearYouTubeSession();
        throw new Error('YOUTUBE_RECONNECT');
      }
      if (!uploaded.ok) throw new Error(await readYouTubeError(uploaded));
      const data = await uploaded.json();
      const youtubeId = data.id;
      if (!youtubeId) throw new Error('YouTube video id missing');
      return {
        type: 'video',
        videoProvider: 'youtube',
        youtubeId,
        url: `https://www.youtube.com/watch?v=${youtubeId}`,
        embedUrl: `https://www.youtube.com/embed/${youtubeId}`,
        thumbUrl: youtubeThumbUrl(youtubeId),
        privacyStatus: 'private',
      };
    } catch (err) {
      console.error('YouTube media upload failed:', err);
      throw err;
    }
  }, [youtubeAccessToken]);

  const handleFiles = useCallback(async (files) => {
    if (isReadOnly) return;
    if (!activeTrip || !files.length) return;
    const mediaFiles = Array.from(files).filter(f => f.type.startsWith('image/') || f.type.startsWith('video/'));
    if (!mediaFiles.length) {
      showNotice('error', T.noSupportedMediaFiles);
      return;
    }
    clearNotice();
    setUploading(true);
    setUploadCount({ done: 0, total: mediaFiles.length });
    const newPhotos = [];
    let failed = 0;
    let youtubeUploadBlocked = false;
    const trip = trips.find(t => t.id === activeTrip);
    for (let i = 0; i < mediaFiles.length; i++) {
      const file = mediaFiles[i];
      try {
        const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
        let uploaded = file.type.startsWith('video/')
          ? await uploadVideoToYouTube(file, trip)
          : await uploadPhotoVariants(file, `users/${user.uid}/trips/${activeTrip}`, fileName);
        if (file.type.startsWith('video/')) {
          try {
            const thumbBlob = await createVideoThumbnailBlob(file);
            const thumbStoragePath = `users/${user.uid}/trips/${activeTrip}/video-thumbs/${fileName}.jpg`;
            const thumbStorageRef = ref(storage, thumbStoragePath);
            await uploadBytes(thumbStorageRef, thumbBlob);
            const thumbUrl = await getDownloadURL(thumbStorageRef);
            uploaded = { ...uploaded, thumbUrl, thumbStoragePath };
          } catch (thumbErr) {
            console.warn('Video thumbnail generation failed:', thumbErr);
          }
        }
        const photoData = { name: file.name, ...uploaded, createdAt: serverTimestamp() };
        const docRef = await addDoc(photosCol(activeTrip), photoData);
        newPhotos.push({ id: docRef.id, ...photoData });
      } catch (err) {
        failed++;
        console.error('Upload error:', err);
        if (err.message === 'YOUTUBE_NOT_CONNECTED' || err.message === 'YOUTUBE_RECONNECT') {
          youtubeUploadBlocked = true;
          showNotice('error', err.message === 'YOUTUBE_RECONNECT' ? T.youtubeReconnectRequired : T.connectYouTubeBeforeVideo);
          setProfileModal(true);
        } else if (file.type.startsWith('video/')) {
          youtubeUploadBlocked = true;
          showNotice('error', T.youtubeUploadFailed(err.message || ''));
        }
      }
      setUploadCount(prev => ({ ...prev, done: i + 1 }));
    }
    setPhotos(prev => [...prev, ...newPhotos]);
    if (trip) {
      const addedCounts = mediaCounts(newPhotos);
      const updates = {
        photoCount: (trip.photoCount || 0) + addedCounts.photos,
        videoCount: (trip.videoCount || 0) + addedCounts.videos,
      };
      if (!trip.cover && newPhotos.length) updates.cover = newPhotos[0].thumbUrl || newPhotos[0].url;
      await updateDoc(doc(db, 'trips', activeTrip), updates);
      setTrips(prev => prev.map(t => t.id === activeTrip ? { ...t, ...updates } : t));
    }
    if (failed > 0 && !youtubeUploadBlocked) {
      showNotice('error', failed === mediaFiles.length ? validationText('uploadFailedAll') : validationText('uploadFailedSome', failed));
    }
    setUploading(false);
  }, [T.connectYouTubeBeforeVideo, T.noSupportedMediaFiles, T.youtubeReconnectRequired, activeTrip, clearNotice, isReadOnly, showNotice, trips, uploadVideoToYouTube, user, validationText]);

  const isYouTubeVideo = (photo) => !!photo?.youtubeId || photo?.videoProvider === 'youtube';

  const clearYouTubeSession = () => {
    sessionStorage.removeItem('youtubeAccessToken');
    sessionStorage.removeItem('youtubeTokenExpiresAt');
    setYoutubeAccessToken('');
    setYoutubeTokenExpiresAt(0);
  };

  const deleteVideoFromYouTube = async (photo) => {
    if (!photo?.youtubeId) return;
    if (!youtubeAccessToken) throw new Error('YOUTUBE_RECONNECT');
    const response = await fetch(`https://www.googleapis.com/youtube/v3/videos?id=${encodeURIComponent(photo.youtubeId)}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${youtubeAccessToken}` },
    });
    if (response.status === 401 || response.status === 403) {
      clearYouTubeSession();
      throw new Error('YOUTUBE_RECONNECT');
    }
    if (!response.ok) {
      let detail = '';
      try {
        const payload = await response.clone().json();
        detail = payload?.error?.message || '';
      } catch (_) {
        try { detail = await response.text(); } catch (__) {}
      }
      throw new Error(detail || `YouTube delete failed (${response.status})`);
    }
  };

  const requestDeletePhoto = (photo) => {
    if (isReadOnly || !photo) return;
    if (isYouTubeVideo(photo)) {
      setConfirmDeleteMedia(photo);
      return;
    }
    deletePhoto(photo);
  };

  const deletePhoto = async (photo, options = {}) => {
    if (isReadOnly) return;
    setDeletingMedia(true);
    try {
    if (options.deleteFromYouTube) await deleteVideoFromYouTube(photo);
    if (photo.storagePath) { try { await deleteObject(ref(storage, photo.storagePath)); } catch {} }
    if (photo.thumbStoragePath) { try { await deleteObject(ref(storage, photo.thumbStoragePath)); } catch {} }
    await deleteDoc(doc(db, 'trips', activeTrip, 'photos', photo.id));
    setPhotos(prev => prev.filter(p => p.id !== photo.id));
    const trip = trips.find(t => t.id === activeTrip);
    if (trip) {
      const deletingVideo = isVideoMedia(photo);
      const updates = deletingVideo
        ? { videoCount: Math.max(0, (trip.videoCount || 1) - 1) }
        : { photoCount: Math.max(0, (trip.photoCount || 1) - 1) };
      if (trip.cover === photo.url || trip.cover === photo.thumbUrl) updates.cover = null;
      await updateDoc(doc(db, 'trips', activeTrip), updates);
      setTrips(prev => prev.map(t => t.id === activeTrip ? { ...t, ...updates } : t));
    }
    setLightbox(null);
    setConfirmDeleteMedia(null);
    } catch (err) {
      if (err.message === 'YOUTUBE_RECONNECT') {
        showNotice('error', T.deleteFromYouTubeNeedsReconnect);
        setProfileModal(true);
      } else {
        showNotice('error', T.youtubeVideoDeleteFailed(err.message || ''));
      }
      console.error('Delete media error:', err);
    } finally {
      setDeletingMedia(false);
    }
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
    autoDateCancelRef.current = false;
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
        if (autoDateCancelRef.current) return;
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
        if (autoDateCancelRef.current) return;
        const ts = dateMap[trip.name];
        if (!ts) return;
        const isoDate = new Date(ts).toISOString().split('T')[0];
        try {
          await updateDoc(doc(db, 'trips', trip.id), { date: isoDate });
          setTrips(prev => prev.map(t => t.id === trip.id ? { ...t, date: isoDate } : t));
          updated++;
        } catch {}
      }));

      if (autoDateCancelRef.current) return;
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
    fbAbortControllerRef.current?.abort();
    fbAbortControllerRef.current = new AbortController();
    const { signal } = fbAbortControllerRef.current;
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
      if (fbCancelRef.current || signal.aborted) break;
      const allPaths = [];
      let latestTs = null;
      for (const album of albums) {
        if (fbCancelRef.current || signal.aborted) break;
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
      if (!fbCancelRef.current && !signal.aborted) {
        setFbProgress(prev => ({ ...prev, [tripName]: { done: 0, total: allPaths.length, scanning: false } }));
      }
    }

    if (fbCancelRef.current || signal.aborted) {
      setFbStep('cancelled');
      fbAbortControllerRef.current = null;
      return;
    }

    // ── Phase 2: Upload all photos with ETA tracking ──
    fbImportStartRef.current = Date.now();
    let totalUploaded = 0;

    for (const { tripName, country, albums } of toImport) {
      if (fbCancelRef.current || signal.aborted) break;

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
            ownerId: user.uid, ownerEmail: user.email, visibility: 'private', cover: null, photoCount: 0, videoCount: 0, createdAt: serverTimestamp(),
        };
        const docRef = await addDoc(tripsCol(), tripData);
        tripId = docRef.id;
        setTrips(prev => [{ id: docRef.id, ...tripData }, ...prev]);
      }

      const allPaths = groupPaths[tripName] || [];
      let doneCount = 0;
      let coverUrl = null;

      for (const { city, path } of allPaths) {
        if (fbCancelRef.current || signal.aborted) break;
        try {
          const navPath = (pathPrefix && path.startsWith(pathPrefix)) ? path.slice(pathPrefix.length) : path;
          const pathParts = navPath.split('/');
          let handle = mediaBase;
          for (let i = 0; i < pathParts.length - 1; i++) handle = await handle.getDirectoryHandle(pathParts[i]);
          const fileHandle = await handle.getFileHandle(pathParts[pathParts.length - 1]);
          const file = await fileHandle.getFile();
          if (fbCancelRef.current || signal.aborted) break;

          const safeName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
          const uploaded = await uploadPhotoVariants(file, `users/${user.uid}/trips/${tripId}`, safeName, { signal });
          if (fbCancelRef.current || signal.aborted) break;
          const { url } = uploaded;
          if (!coverUrl) coverUrl = url;

          await addDoc(photosCol(tripId), { name: file.name, ...uploaded, city: city || null, createdAt: serverTimestamp() });
          doneCount++;
          totalUploaded++;
        } catch (err) {
          if (err.name === 'AbortError' || fbCancelRef.current || signal.aborted) break;
          console.warn('Upload failed:', path, err);
          doneCount++;
        }
        setFbProgress(prev => ({ ...prev, [tripName]: { done: doneCount, total: allPaths.length, scanning: false } }));
        setFbTotalDone(totalUploaded);
      }

      if (!fbCancelRef.current && !signal.aborted && doneCount > 0) {
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

    setFbStep(fbCancelRef.current || signal.aborted ? 'cancelled' : 'done');
    fbAbortControllerRef.current = null;
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
    if (publicShareData?.type !== 'presentation' || !publicPresentationPlaying || (publicShareData.photos || []).length <= 1) return undefined;
    const timer = window.setInterval(() => {
      setPublicPresentationIndex(index => (index + 1) % publicShareData.photos.length);
    }, 4200);
    return () => window.clearInterval(timer);
  }, [publicShareData?.type, publicShareData?.photos, publicPresentationPlaying]);

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
    thumbMigrationCancelRef.current = false;
    setThumbMigration({ status: 'scanning', done: 0, total: 0, error: '' });
    try {
      const rootHandle = await window.showDirectoryPicker({ mode: 'read' });
      const localImages = await indexLocalImagesByName(rootHandle);
      if (thumbMigrationCancelRef.current) return;
      const jobs = [];
      let missing = 0;
      for (const trip of trips) {
        if (thumbMigrationCancelRef.current) return;
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
        if (thumbMigrationCancelRef.current) return;
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
        if (thumbMigrationCancelRef.current) return;
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
        if (!thumbMigrationCancelRef.current) {
          done++;
          reportProgress();
        }
      };

      const worker = async () => {
        while (nextJob < jobs.length && !thumbMigrationCancelRef.current) {
          const job = jobs[nextJob++];
          await processJob(job);
        }
      };

      await Promise.all(Array.from({ length: concurrency }, worker));
      if (thumbMigrationCancelRef.current) {
        setThumbMigration(null);
        return;
      }
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
      setSelectedMatchPersonIds(new Set());
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
    setPeopleHelpOpen(true);
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
    const { silent = false, operationId = null } = options;
    if (!silent) setFaceAction(`search:${person.id}`);
    try {
      const searchMatches = httpsCallable(firebaseFunctions, 'searchPersonMatches');
      const result = await searchMatches({ personId: person.id, threshold: 90, operationId });
      const matches = result.data?.matches || [];
      setPeople(prev => prev.map(p => p.id === person.id ? { ...p, matchCount: result.data?.matchCount || matches.length } : p));
      return matches;
    } catch (err) {
      if (err.code === 'functions/cancelled') return null;
      console.error('Search person matches error:', err);
      if (!silent) showNotice('error', err.message || T.faceActionFailed);
      return null;
    } finally {
      if (!silent) setFaceAction(null);
    }
  };

  const selectedMatchPeople = people.filter(person => selectedMatchPersonIds.has(person.id));
  const allMatchPeopleSelected = people.length > 0 && people.every(person => selectedMatchPersonIds.has(person.id));
  const someMatchPeopleSelected = selectedMatchPersonIds.size > 0 && !allMatchPeopleSelected;

  const togglePersonForMatches = (personId) => {
    setSelectedMatchPersonIds(prev => {
      const next = new Set(prev);
      if (next.has(personId)) next.delete(personId);
      else next.add(personId);
      return next;
    });
  };

  const toggleAllPeopleForMatches = () => {
    if (allMatchPeopleSelected || someMatchPeopleSelected) {
      setSelectedMatchPersonIds(new Set());
    } else {
      setSelectedMatchPersonIds(new Set(people.map(person => person.id)));
    }
  };

  const closePeopleTools = () => {
    if (refreshAllPeople?.status === 'running') {
      refreshAllCancelRef.current = true;
      cancelRemoteOperation(refreshAllOperationRef.current);
      setRefreshAllPeople(null);
    }
    setPeopleHelpOpen(true);
    setPeopleModal(false);
  };

  const cancelRefreshAllPeople = () => {
    refreshAllCancelRef.current = true;
    cancelRemoteOperation(refreshAllOperationRef.current);
    refreshAllOperationRef.current = null;
    setRefreshAllPeople(prev => prev ? { ...prev, status: 'cancelled', current: '' } : prev);
  };

  const refreshAllPersonMatches = async () => {
    if (!canUseFaceRecognition || refreshAllPeople?.status === 'running' || selectedMatchPeople.length === 0) return;
    refreshAllCancelRef.current = false;
    const operationId = createOperationId('find_matches');
    refreshAllOperationRef.current = operationId;
    let updated = 0;
    let failed = 0;
    setRefreshAllPeople({ status: 'running', done: 0, total: selectedMatchPeople.length, current: '', updated, failed });

    for (let index = 0; index < selectedMatchPeople.length && !refreshAllCancelRef.current; index++) {
      const person = selectedMatchPeople[index];
      setRefreshAllPeople({ status: 'running', done: index, total: selectedMatchPeople.length, current: person.name, updated, failed });
      const matches = await fetchPersonMatches(person, { silent: true, operationId });
      if (refreshAllCancelRef.current) {
        refreshAllOperationRef.current = null;
        return;
      }
      if (matches) updated++;
      else failed++;
      setRefreshAllPeople({ status: 'running', done: index + 1, total: selectedMatchPeople.length, current: person.name, updated, failed });
    }

    if (refreshAllCancelRef.current) {
      refreshAllOperationRef.current = null;
      return;
    }
    setRefreshAllPeople({ status: 'done', done: selectedMatchPeople.length, total: selectedMatchPeople.length, current: '', updated, failed });
    refreshAllOperationRef.current = null;
    showNotice(failed > 0 ? 'error' : 'success', T.refreshAllComplete(updated, failed));
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
        const photo = { id: photoSnap.id, ...photoSnap.data(), tripId: trip.id, tripName: trip.name, tripDate: trip.date || null };
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

  const openPersonPresentation = async (person) => {
    if (!canUseFaceRecognition || !person?.id || (person.matchCount || 0) === 0) return;
    setFaceAction(`presentation:${person.id}`);
    setPersonPresentation({ person, loading: true, photos: [], index: 0, playing: true });
    const rawMatches = await fetchStoredPersonMatches(person);
    if (!rawMatches) {
      setPersonPresentation({ person, loading: false, photos: [], index: 0, playing: false });
      setFaceAction(null);
      return;
    }
    const matches = await hydratePersonMatches(rawMatches);
    const photos = matches
      .map(match => match.photo)
      .filter(photo => photo?.url || photo?.thumbUrl)
      .sort((a, b) => {
        const aDate = a.tripDate ? Date.parse(a.tripDate) : (a.createdAt?.seconds || 0) * 1000;
        const bDate = b.tripDate ? Date.parse(b.tripDate) : (b.createdAt?.seconds || 0) * 1000;
        return (Number.isNaN(bDate) ? 0 : bDate) - (Number.isNaN(aDate) ? 0 : aDate);
      });
    setPersonPresentation({ person, loading: false, photos, index: 0, playing: photos.length > 1 });
    setFaceAction(null);
  };

  const closePersonPresentation = () => {
    if (exportingPresentation) presentationExportCancelRef.current = true;
    setPersonPresentation(null);
  };

  const navigatePersonPresentation = (dir) => {
    setPersonPresentation(prev => {
      if (!prev || prev.photos.length === 0) return prev;
      const next = (prev.index + dir + prev.photos.length) % prev.photos.length;
      return { ...prev, index: next };
    });
  };

  useEffect(() => {
    if (!personPresentation?.playing || personPresentation.photos.length <= 1) return undefined;
    const timer = window.setInterval(() => navigatePersonPresentation(1), 4200);
    return () => window.clearInterval(timer);
  }, [personPresentation?.playing, personPresentation?.photos?.length]);

  const downloadPersonPresentation = () => {
    if (!personPresentation?.photos?.length) return;
    const escapeHtml = (value) => String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
    const jsString = (value) => JSON.stringify(String(value || ''));
    const photos = personPresentation.photos.map(photo => ({
      src: photo.url || photo.thumbUrl,
      title: photo.tripName || '',
      subtitle: [photo.tripDate, photo.city].filter(Boolean).join(' · '),
    }));
    const title = T.presentationTitle(personPresentation.person.name);
    const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; min-height: 100vh; background: #111; color: #f6f1e8; font-family: Arial, sans-serif; overflow: hidden; }
    .stage { position: fixed; inset: 0; display: grid; place-items: center; background: radial-gradient(circle at 50% 20%, #2d281f, #090909 70%); }
    img { max-width: 100vw; max-height: 100vh; object-fit: contain; filter: drop-shadow(0 24px 60px rgba(0,0,0,.65)); animation: photo 5s ease-in-out both; }
    .caption { position: fixed; left: 0; right: 0; bottom: 0; padding: 28px 34px; background: linear-gradient(to top, rgba(0,0,0,.72), transparent); text-shadow: 0 2px 12px rgba(0,0,0,.7); }
    h1 { margin: 0 0 6px; font-size: clamp(26px, 4vw, 58px); }
    p { margin: 0; color: rgba(246,241,232,.78); font-size: clamp(14px, 1.6vw, 20px); }
    @keyframes photo { from { opacity: 0; transform: scale(1.04); } 12%, 88% { opacity: 1; } to { opacity: 0; transform: scale(1); } }
  </style>
</head>
<body>
  <main class="stage">
    <img id="photo" alt="" />
    <section class="caption">
      <h1 id="title"></h1>
      <p id="subtitle"></p>
    </section>
  </main>
  <script>
    const slides = ${JSON.stringify(photos)};
    let index = 0;
    const photo = document.getElementById('photo');
    const title = document.getElementById('title');
    const subtitle = document.getElementById('subtitle');
    function show() {
      const slide = slides[index];
      photo.style.animation = 'none';
      void photo.offsetWidth;
      photo.src = slide.src;
      title.textContent = ${jsString(title)} + (slide.title ? ' · ' + slide.title : '');
      subtitle.textContent = slide.subtitle || '';
      photo.style.animation = '';
      index = (index + 1) % slides.length;
    }
    show();
    setInterval(show, 5000);
  </script>
</body>
</html>`;
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${String(personPresentation.person.name || 'presentation').replace(/[^a-z0-9_-]+/gi, '-').replace(/^-|-$/g, '') || 'presentation'}-presentation.html`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const sharePersonPresentationVideo = async () => {
    if (!personPresentation?.photos?.length) return;
    if (!window.MediaRecorder || !HTMLCanvasElement.prototype.captureStream) {
      showNotice('error', T.videoShareUnsupported);
      return;
    }

    const mimeType = [
      'video/webm;codecs=vp9',
      'video/webm;codecs=vp8',
      'video/webm',
      'video/mp4;codecs=h264',
      'video/mp4',
    ].find(type => MediaRecorder.isTypeSupported(type));

    if (!mimeType) {
      showNotice('error', T.videoShareUnsupported);
      return;
    }

    presentationExportCancelRef.current = false;
    setExportingPresentation(true);
    setPresentationExportProgress({ done: 0, total: personPresentation.photos.length });
    const canvas = document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 720;
    const ctx = canvas.getContext('2d');
    const stream = canvas.captureStream(30);
    const chunks = [];
    let recorder;
    try {
      recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 2_500_000 });
    } catch (err) {
      stream.getTracks().forEach(track => track.stop());
      setExportingPresentation(false);
      setPresentationExportProgress(null);
      showNotice('error', T.videoShareUnsupported);
      return;
    }
    const wait = (ms) => new Promise(resolve => window.setTimeout(resolve, ms));
    const loadImage = (src) => new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
    const drawSlide = (img, photo, progress) => {
      const w = canvas.width;
      const h = canvas.height;
      const zoom = 1.04 - (progress * 0.04);
      ctx.fillStyle = '#111';
      ctx.fillRect(0, 0, w, h);
      const bg = ctx.createRadialGradient(w / 2, h * .2, 0, w / 2, h * .2, w);
      bg.addColorStop(0, '#2d281f');
      bg.addColorStop(1, '#080808');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      const scale = Math.min(w / img.naturalWidth, h / img.naturalHeight) * zoom;
      const dw = img.naturalWidth * scale;
      const dh = img.naturalHeight * scale;
      ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);

      const gradient = ctx.createLinearGradient(0, h * .58, 0, h);
      gradient.addColorStop(0, 'rgba(0,0,0,0)');
      gradient.addColorStop(1, 'rgba(0,0,0,.78)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, h * .58, w, h * .42);

      ctx.fillStyle = '#f6f1e8';
      ctx.font = '700 34px Arial, sans-serif';
      ctx.fillText(photo.tripName || personPresentation.person.name, 42, h - 70);
      const subtitle = [photo.tripDate, photo.city].filter(Boolean).join(' - ');
      ctx.fillStyle = 'rgba(246,241,232,.78)';
      ctx.font = '18px Arial, sans-serif';
      ctx.fillText(subtitle || T.personMatchCount(personPresentation.photos.length), 42, h - 38);
    };

    try {
      recorder.ondataavailable = event => {
        if (event.data?.size) chunks.push(event.data);
      };
      const stopped = new Promise(resolve => { recorder.onstop = resolve; });
      recorder.start(250);

      let exported = 0;
      for (const photo of personPresentation.photos) {
        if (presentationExportCancelRef.current) break;
        let img;
        try {
          img = await loadImage(photo.url || photo.thumbUrl);
        } catch (err) {
          console.warn('Skipping presentation image export:', photo, err);
          setPresentationExportProgress(prev => prev ? { ...prev, done: prev.done + 1 } : prev);
          continue;
        }
        for (let frame = 0; frame < 75 && !presentationExportCancelRef.current; frame++) {
          drawSlide(img, photo, frame / 74);
          await wait(1000 / 30);
        }
        if (presentationExportCancelRef.current) break;
        exported++;
        setPresentationExportProgress(prev => prev ? { ...prev, done: prev.done + 1 } : prev);
      }

      recorder.stop();
      await stopped;
      stream.getTracks().forEach(track => track.stop());
      if (presentationExportCancelRef.current) return;

      const blob = new Blob(chunks, { type: mimeType });
      if (!exported || blob.size === 0) {
        showNotice('error', T.videoExportFailed);
        return;
      }
      const ext = mimeType.includes('mp4') ? 'mp4' : 'webm';
      const filename = `${String(personPresentation.person.name || 'presentation').replace(/[^a-z0-9_-]+/gi, '-').replace(/^-|-$/g, '') || 'presentation'}-presentation.${ext}`;
      const file = new File([blob], filename, { type: mimeType });
      const title = T.presentationTitle(personPresentation.person.name);
      const text = T.sharePresentationText(personPresentation.person.name);

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ title, text, files: [file] });
      } else if (navigator.share) {
        await navigator.share({ title, text, url: window.location.href });
      } else {
        showNotice('error', T.videoShareUnsupported);
      }
    } catch (err) {
      if (err?.name === 'AbortError') return;
      if (presentationExportCancelRef.current) return;
      console.error('Presentation video export failed:', err);
      showNotice('error', T.videoShareFailed);
      stream.getTracks().forEach(track => track.stop());
    } finally {
      setExportingPresentation(false);
      setPresentationExportProgress(null);
      presentationExportCancelRef.current = false;
    }
  };

  const publicAppOrigin = () => (
    ['localhost', '127.0.0.1'].includes(window.location.hostname)
      ? PUBLIC_APP_ORIGIN
      : window.location.origin
  );

  const makeToken = () => {
    const bytes = new Uint8Array(18);
    window.crypto?.getRandomValues?.(bytes);
    return [...bytes].map(byte => byte.toString(16).padStart(2, '0')).join('') || `${Date.now()}${Math.random().toString(16).slice(2)}`;
  };

  const ensurePresentationShareLink = async () => {
    if (!personPresentation?.person || !personPresentation?.photos?.length) return '';
    if (personPresentation.shareUrl) return personPresentation.shareUrl;

    const token = makeToken();
    const title = T.presentationTitle(personPresentation.person.name);
    const photos = personPresentation.photos.map(photo => ({
      url: photo.url || photo.thumbUrl || '',
      thumbUrl: photo.thumbUrl || photo.url || '',
      name: photo.name || '',
      tripName: photo.tripName || '',
      tripDate: photo.tripDate || null,
      city: photo.city || null,
    })).filter(photo => photo.url);
    await setDoc(doc(db, 'sharedLinks', token), {
      tripName: title,
      tripDate: null,
      photos,
      createdAt: serverTimestamp(),
    });
    const shareUrl = `${publicAppOrigin()}/?presentation=${token}`;
    setPersonPresentation(prev => prev ? { ...prev, shareToken: token, shareUrl } : prev);
    return shareUrl;
  };

  const sharePresentationToPlatform = async (platform) => {
    if (!personPresentation?.person) return;
    const popup = window.open('about:blank', '_blank');
    if (popup) {
      popup.document.write(`<p style="font-family:system-ui,sans-serif;padding:24px">Preparing share link...</p>`);
      popup.document.close();
    }
    try {
      const shareUrl = await ensurePresentationShareLink();
      if (!shareUrl) return;
      const url = encodeURIComponent(shareUrl);
      const text = encodeURIComponent(T.sharePresentationText(personPresentation.person.name));
      const links = {
        whatsapp: `https://wa.me/?text=${text}%20${url}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
        x: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
        telegram: `https://t.me/share/url?url=${url}&text=${text}`,
      };
      if (popup) popup.location.href = links[platform];
      else window.open(links[platform], '_blank', 'noopener,noreferrer');
    } catch (err) {
      console.error('Create presentation share link failed:', err);
      if (popup) popup.close();
      showNotice('error', T.presentationShareFailed);
    }
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
      if (fullIndexCancelRef.current) break;
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

  const loadFullIndexationClusters = async (jobs, newlyIndexedFaces = 0, operationId = null) => {
    const tripIds = [...new Set((jobs || []).map(job => job.tripId))];
    const estimate = estimateFaceClusterReport(jobs, newlyIndexedFaces);
    setFaceClusterReport({ status: 'loading', clusters: [], faceCount: estimate.faceCount, error: '', estimateText: estimate.text });
    setFaceClusterNames({});
    try {
      const getClusters = httpsCallable(firebaseFunctions, 'getIndexedFaceClusters', { timeout: 1800000 });
      const result = await getClusters({ tripIds, threshold: 90, operationId });
      if (fullIndexCancelRef.current) {
        setFaceClusterReport(null);
        if (!fullIndexDismissedRef.current) setFullIndexation(prev => ({ ...prev, status: 'cancelled', etaMs: 0, current: '' }));
        return;
      }
      const clusters = result.data?.clusters || [];
      setFaceClusterReport({
        status: 'ready',
        clusters,
        faceCount: result.data?.faceCount || 0,
        error: '',
      });
      setFaceClusterNames(Object.fromEntries(clusters.map(cluster => [cluster.clusterId, ''])));
    } catch (err) {
      if (err.code === 'functions/cancelled' || fullIndexCancelRef.current) {
        setFaceClusterReport(null);
        if (!fullIndexDismissedRef.current) setFullIndexation(prev => ({ ...prev, status: 'cancelled', etaMs: 0, current: '' }));
        return;
      }
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
    fullIndexDismissedRef.current = false;
    const operationId = createOperationId('full_index');
    fullIndexOperationRef.current = operationId;
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
      if (!fullIndexDismissedRef.current) setFullIndexation(prev => ({ ...prev, status: 'cancelled', etaMs: 0, current: '' }));
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
    const concurrency = 1;

    const report = (current = '') => {
      const processed = done + skipped + failed;
      const elapsed = Date.now() - startedAt;
      if (fullIndexDismissedRef.current) return;
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
          const result = await indexFaces({ tripId: job.tripId, photoId: job.photoId, operationId });
          if (result.data?.skipped) skipped++;
          else done++;
          faces += result.data?.faceCount || 0;
        } catch (err) {
          if (err.code === 'functions/cancelled' || fullIndexCancelRef.current) break;
          failed++;
          console.warn('Face indexation failed:', job.tripId, job.photoId, err);
        }
        report(job.tripName);
      }
    };

    await Promise.all(Array.from({ length: concurrency }, worker));
    const finalStatus = fullIndexCancelRef.current ? 'cancelled' : 'done';
    if (!fullIndexDismissedRef.current) setFullIndexation(prev => ({ ...prev, status: finalStatus, etaMs: 0, current: '' }));
    if (finalStatus === 'done' && !fullIndexDismissedRef.current) await loadFullIndexationClusters(jobs, faces, operationId);
    if (fullIndexOperationRef.current === operationId) fullIndexOperationRef.current = null;
  };

  const cancelFullIndexation = () => {
    fullIndexCancelRef.current = true;
    cancelRemoteOperation(fullIndexOperationRef.current);
    setFullIndexation(prev => prev ? ({ ...prev, status: 'cancelled', etaMs: 0, current: '' }) : prev);
    setFaceClusterReport(null);
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
        const byDate = tripSortDirection === 'asc'
          ? tripTime(a) - tripTime(b)
          : tripTime(b) - tripTime(a);
        return byDate || nameCompare(a, b);
      });
    }

    if (tripSort === 'az') {
      return [...trips].sort((a, b) => (
        tripSortDirection === 'asc' ? nameCompare(a, b) : nameCompare(b, a)
      ));
    }

    return trips;
  }, [trips, tripSort, tripSortDirection]);

  const ownTrips = useMemo(() => sortedTrips.filter(t => !isSharedToMeTrip(t)), [sortedTrips, isSharedToMeTrip]);
  const sharedToMeTrips = useMemo(() => sortedTrips.filter(t => isSharedToMeTrip(t)), [sortedTrips, isSharedToMeTrip]);
  const normalizeSearchText = useCallback((value) => String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase(), []);
  const albumSearchText = normalizeSearchText(albumSearch.trim());
  const matchingSearchPeople = useMemo(() => {
    if (!albumSearchText || !canUseFaceRecognition) return [];
    return people.filter(person => normalizeSearchText(person.name).includes(albumSearchText));
  }, [albumSearchText, canUseFaceRecognition, people, normalizeSearchText]);
  const isPersonSearch = matchingSearchPeople.length > 0;
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
    return isPersonSearch ? [] : source.filter(tripMatchesAlbumSearch);
  }, [activeSharedCollection, albumSearchText, sortedTrips, sharedToMeTrips, ownTrips, tripMatchesAlbumSearch, isPersonSearch]);
  const updateTripSort = (sortType) => {
    if (tripSort === sortType) {
      setTripSortDirection(direction => direction === 'asc' ? 'desc' : 'asc');
      return;
    }
    setTripSort(sortType);
    setTripSortDirection(sortType === 'date' ? 'desc' : 'asc');
  };
  const sortArrow = (sortType) => (
    tripSort === sortType
      ? (tripSortDirection === 'asc' ? '↑' : '↓')
      : '↕'
  );
  const sortedPersonSearchPhotos = useMemo(() => {
    const photoTime = (photo) => {
      if (photo.tripDate) {
        const parsed = Date.parse(photo.tripDate);
        if (!Number.isNaN(parsed)) return parsed;
      }
      return photo.createdAt?.seconds ? photo.createdAt.seconds * 1000 : 0;
    };
    const textCompare = (a, b) => String(a || '').localeCompare(String(b || ''), undefined, {
      sensitivity: 'base',
      numeric: true,
    });

    if (tripSort === 'date') {
      return [...personSearchPhotos].sort((a, b) => {
        const byDate = tripSortDirection === 'asc'
          ? photoTime(a) - photoTime(b)
          : photoTime(b) - photoTime(a);
        return byDate || textCompare(a.tripName, b.tripName) || textCompare(a.name, b.name);
      });
    }

    if (tripSort === 'az') {
      return [...personSearchPhotos].sort((a, b) => (
        tripSortDirection === 'asc'
          ? textCompare(a.tripName, b.tripName) ||
            textCompare(a.personName, b.personName) ||
            textCompare(a.name, b.name)
          : textCompare(b.tripName, a.tripName) ||
            textCompare(b.personName, a.personName) ||
            textCompare(b.name, a.name)
      ));
    }

    return personSearchPhotos;
  }, [personSearchPhotos, tripSort, tripSortDirection]);

  useEffect(() => {
    if (!albumSearchText || !canUseFaceRecognition) {
      setPersonSearchPhotos([]);
      setPersonSearchNames([]);
      setPersonSearchLoading(false);
      return;
    }
    if (people.length === 0 && !loadingPeople) {
      loadPeople();
      return;
    }
    if (matchingSearchPeople.length === 0) {
      setPersonSearchPhotos([]);
      setPersonSearchNames([]);
      setPersonSearchLoading(false);
      return;
    }

    let cancelled = false;
    setPersonSearchLoading(true);
    setPersonSearchNames(matchingSearchPeople.map(person => person.name));
    (async () => {
      const uniquePhotos = new Map();
      for (const person of matchingSearchPeople) {
        const rawMatches = await fetchStoredPersonMatches(person);
        if (!rawMatches || cancelled) continue;
        const hydrated = await hydratePersonMatches(rawMatches);
        if (cancelled) return;
        hydrated.forEach(match => {
          if (!match.photo?.id) return;
          uniquePhotos.set(`${match.tripId}:${match.photoId}`, {
            ...match.photo,
            personName: person.name,
            personId: person.id,
          });
        });
      }
      if (!cancelled) setPersonSearchPhotos([...uniquePhotos.values()]);
    })().finally(() => {
      if (!cancelled) setPersonSearchLoading(false);
    });

    return () => { cancelled = true; };
  }, [albumSearchText, canUseFaceRecognition, people.length, loadingPeople, matchingSearchPeople]);

  useEffect(() => {
    if (isPersonSearch && tripsView !== 'grid') setTripsView('grid');
  }, [isPersonSearch, tripsView]);
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
  const ownVideos = ownTrips.reduce((s, t) => s + (t.videoCount || 0), 0);
  const sharedByMePhotos = ownTrips
    .filter(tripIsShared)
    .reduce((s, t) => s + (t.photoCount || 0), 0);
  const sharedWithMePhotos = sharedToMeTrips.reduce((s, t) => s + (t.photoCount || 0), 0);
  const countriesVisited = new Set(trips.map(t => t.country).filter(Boolean)).size;
  const topTrip = trips.reduce((best, t) => (!best || ((t.photoCount || 0) + (t.videoCount || 0)) > ((best.photoCount || 0) + (best.videoCount || 0))) ? t : best, null);

  // ─── Map: visited ISO set + lookup ───
  const visitedIsos = new Set(trips.map(t => COUNTRY_ISO[t.country]).filter(Boolean));
  const tripByIso = {};
  trips.forEach(t => { const iso = COUNTRY_ISO[t.country]; if (iso && !tripByIso[iso]) tripByIso[iso] = t; });
  const hasMapData = trips.some(t => COUNTRY_ISO[t.country]);
  const mapTerritoryMarkers = MAP_TERRITORY_MARKERS
    .map(marker => ({
      ...marker,
      isVisited: visitedIsos.has(marker.iso),
      isWished: !visitedIsos.has(marker.iso) && wishlist.has(marker.iso),
      trip: tripByIso[marker.iso],
    }))
    .filter(marker => marker.isVisited || marker.isWished);
  const getGeoIso = (geo) => {
    const id = Number(geo.id);
    if (Number.isFinite(id)) return id;
    const isoN3 = Number(geo.properties?.ISO_N3 || geo.properties?.iso_n3);
    return Number.isFinite(isoN3) ? isoN3 : null;
  };
  const getGeoName = (geo) => geo.properties?.name || geo.properties?.NAME || geo.properties?.NAME_LONG || geo.properties?.ADMIN || '';

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

  if (window.location.pathname === '/privacy') {
    return <PrivacyPolicyPage logoSrc={logoSrc} />;
  }
  if (window.location.pathname === '/terms') {
    return <TermsOfServicePage logoSrc={logoSrc} />;
  }

  if (publicShareLoading) return <div className="login-page"><span className="spinner" style={{ width: 28, height: 28 }} /></div>;

  if (publicShareData) {
    if (publicShareData.error) return (
      <div className="login-page"><div className="login-card">
        <ThemeToggle {...themeToggleProps} className="login-theme-toggle" />
        <img src={logoSrc} alt="Pepini per il mondo" className="login-logo-img" />
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{publicShareData.expired ? T.sharedLinkExpired : T.sharedLinkInvalid}</p>
      </div></div>
    );
    if (publicShareData.type === 'presentation') {
      const presentationPhotos = publicShareData.photos || [];
      const photo = presentationPhotos[publicPresentationIndex] || presentationPhotos[0];
      return (
        <div>
          <header className="header">
            <div className="header-logo-wrap">
              <img src={logoSrc} alt="Pepini per il mondo" className="header-logo-img" />
              <span className="header-logo heading">Pepini per il mondo</span>
            </div>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{T.sharedPresentation}</span>
          </header>
          <div className="public-presentation-page fade-in">
            <div
              className={`presentation-stage public-presentation-stage${publicPresentationPlaying ? '' : ' presentation-paused'}`}
              onClick={() => setPublicPresentationPlaying(v => !v)}
              role="button"
              tabIndex={0}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setPublicPresentationPlaying(v => !v);
                }
              }}
            >
              {photo && (
                <>
                  <CrossfadeImage
                    src={photo.url || photo.thumbUrl}
                    alt={photo.name || ''}
                    className="presentation-img"
                    incomingClassName="presentation-img-incoming"
                    loading="eager"
                  />
                  <div className="presentation-caption">
                    <strong>{photo.tripName || publicShareData.personName || publicShareData.title}</strong>
                    <span>{[photo.tripDate, photo.city].filter(Boolean).join(' · ') || T.personMatchCount(presentationPhotos.length)}</span>
                  </div>
                  {presentationPhotos.length > 1 && (
                    <>
                      <button className="person-slide-arrow person-slide-prev" onClick={e => { e.stopPropagation(); setPublicPresentationIndex(i => (i - 1 + presentationPhotos.length) % presentationPhotos.length); }} aria-label={isSpanish ? 'Foto anterior' : 'Previous photo'}>&lt;</button>
                      <button className="person-slide-arrow person-slide-next" onClick={e => { e.stopPropagation(); setPublicPresentationIndex(i => (i + 1) % presentationPhotos.length); }} aria-label={isSpanish ? 'Foto siguiente' : 'Next photo'}>&gt;</button>
                    </>
                  )}
                </>
              )}
            </div>
            <div className="presentation-footer">
              <span>{presentationPhotos.length ? `${publicPresentationIndex + 1} / ${presentationPhotos.length}` : T.noMatchesFound}</span>
              <strong>{publicShareData.title || T.presentationTitle(publicShareData.personName || '')}</strong>
            </div>
          </div>
        </div>
      );
    }
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
          <PhotoSliderOverlay
            item={publicLightbox}
            items={pubPhotos}
            index={publicLbIdx}
            onClose={() => setPublicLightbox(null)}
            onNavigate={dir => {
              const n = publicLbIdx + dir;
              if (n < 0 || n >= pubPhotos.length) return;
              setPublicLbIdx(n);
              setPublicLightbox(pubPhotos[n]);
            }}
            closeLabel={T.close}
            previousLabel={isSpanish ? 'Foto anterior' : 'Previous photo'}
            nextLabel={isSpanish ? 'Foto siguiente' : 'Next photo'}
          />
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
          <div className="login-legal-links" aria-label="Legal links">
            <a href="https://pepiniperilmondo.web.app/privacy">Privacy Policy</a>
            <span aria-hidden="true">.</span>
            <a href="https://pepiniperilmondo.web.app/terms">Terms of Service</a>
          </div>
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
          <div className="login-legal-links" aria-label="Legal links">
            <a href="https://pepiniperilmondo.web.app/privacy">Privacy Policy</a>
            <span aria-hidden="true">.</span>
            <a href="https://pepiniperilmondo.web.app/terms">Terms of Service</a>
          </div>
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
          <ThemeToggle {...themeToggleProps} />
          {!isReadOnly && (
            <button className="btn-icon" onClick={() => setProfileModal(true)} title={T.myProfile} aria-label={T.myProfile}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M20 21a8 8 0 1 0-16 0"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </button>
          )}
          {isReadOnly && (
            <button className="btn-icon" onClick={handleSignOut} title={T.signOut} aria-label={T.signOut}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </button>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*,video/*" multiple style={{ display: 'none' }}
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
              <div className={`sticky-header-zone${mobileStatsCollapsed ? ' stats-mobile-collapsed' : ''}`}>
                <div className="stats-mobile-shell fade-in">
                  <button
                    type="button"
                    className="stats-mobile-toggle"
                    onClick={() => setMobileStatsCollapsed(v => !v)}
                    aria-expanded={!mobileStatsCollapsed}
                  >
                    <span>{T.dashboardStatsTitle}</span>
                    <strong>{mobileStatsCollapsed ? '+' : '−'}</strong>
                  </button>
                  <div className="stats-mobile-body">
                    <div className="stats-bar">
                  <div className={`stat-card stat-card-btn${statPanel === 'trips' ? ' stat-active' : ''}`} onClick={() => setStatPanel(p => p === 'trips' ? null : 'trips')}>
                    <div className="stat-value">{trips.length}</div><div className="stat-label">{T.tripsLabel}</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">{totalPhotos}</div><div className="stat-label">{T.photosLabel}</div>
                  </div>
                  {!isReadOnly && (
                    <div className="stat-card">
                      <div className="stat-value">{ownVideos}</div><div className="stat-label">{T.videosLabel}</div>
                    </div>
                  )}
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
                  {!isGuest && !isReadOnly && topTrip && ((topTrip.photoCount || 0) + (topTrip.videoCount || 0)) > 0 && (
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
                  </div>
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
                      onClick={() => updateTripSort('date')}
                    >
                      {T.sortByDate} <span className="sort-arrow">{sortArrow('date')}</span>
                    </button>
                    <button
                      className={`sort-btn ${tripSort === 'az' ? 'active' : ''}`}
                      onClick={() => updateTripSort('az')}
                    >
                      {T.sortAZ} <span className="sort-arrow">{sortArrow('az')}</span>
                    </button>
                  </div>
                  <div className="view-toggle">
                    {!activeSharedCollection && !isReadOnly && (
                      <button
                        className="view-btn btn-new-trip trip-toolbar-add"
                        onClick={() => setShowNewTrip(true)}
                        title={T.newTrip}
                        aria-label={T.newTrip}
                      >
                        +
                      </button>
                    )}
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
                    <button className="btn-map-reset" onClick={() => { setMapZoom(1); setMapCenter([0, 10]); }} title="Reset map">Reset</button>
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
                        const iso = getGeoIso(geo);
                        const name = getGeoName(geo);
                        const isVisited = visitedIsos.has(iso);
                        const isWished = !isVisited && wishlist.has(iso);
                        const trip = tripByIso[iso];
                        return (
                          <Geography
                            key={geo.rsmKey}
                            geography={geo}
                            onMouseEnter={() => setMapTooltip(
                              isVisited ? `${name} — ${trip.name}` :
                              isWished  ? `${name} — ${T.wishlistTooltip}` :
                              name
                            )}
                            onMouseLeave={() => setMapTooltip('')}
                            onClick={() => {
                              if (isVisited && trip) { setActiveTrip(trip.id); setTripsView('grid'); }
                              else if (!isReadOnly && iso) toggleWishlist(iso);
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
                    {mapTerritoryMarkers.map(marker => (
                      <Marker key={marker.name} coordinates={marker.coordinates}>
                        <circle
                          r={marker.isVisited ? 4.6 : 3.8}
                          className={`map-territory-dot${marker.isVisited ? ' visited' : ''}${marker.isWished ? ' wished' : ''}`}
                          onMouseEnter={() => setMapTooltip(
                            marker.isVisited ? `${marker.name} — ${marker.trip.name}` :
                            marker.isWished ? `${marker.name} — ${T.wishlistTooltip}` :
                            marker.name
                          )}
                          onMouseLeave={() => setMapTooltip('')}
                          onClick={() => {
                            if (marker.isVisited && marker.trip) { setActiveTrip(marker.trip.id); setTripsView('grid'); }
                            else if (!isReadOnly) toggleWishlist(marker.iso);
                          }}
                        />
                      </Marker>
                    ))}
                  </ZoomableGroup>
                </ComposableMap>
                <div className="map-tooltip-bar">{mapTooltip || ' '}</div>
              </div>
            )}

            {/* ─ Grid view ─ */}
            {tripsView === 'grid' && (
              isPersonSearch ? (
                <div className="photo-grid person-search-grid">
                  {personSearchLoading && personSearchPhotos.length === 0 && (
                    <div className="album-search-empty fade-in">
                      <span className="spinner" style={{ width: 16, height: 16 }} /> {T.searchingFaces}
                    </div>
                  )}
                  {sortedPersonSearchPhotos.map((photo, i) => (
                    <div
                      key={`${photo.tripId}:${photo.id}`}
                      className="photo-thumb person-search-thumb fade-in"
                      style={{ animationDelay: `${i * 20}ms` }}
                      onClick={() => setPersonSlideshow({
                        person: { name: personSearchNames.join(', ') },
                        title: T.personSearchResultsTitle(personSearchNames.join(', ')),
                        photos: sortedPersonSearchPhotos,
                        index: i,
                      })}
                    >
                      <LazyPhotoImage src={photo.thumbUrl || photo.url} alt={photo.name} />
                      <div className="person-search-photo-meta">
                        <strong>{photo.personName}</strong>
                        <span>{photo.tripName}</span>
                      </div>
                    </div>
                  ))}
                  {!personSearchLoading && personSearchPhotos.length === 0 && (
                    <div className="album-search-empty fade-in">
                      {T.noPersonPhotoResults(personSearchNames.join(', '))}
                    </div>
                  )}
                </div>
              ) : (
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
                  const previewUrl = (previewPhoto?.youtubeId ? youtubeThumbUrl(previewPhoto.youtubeId) : '') || previewPhoto?.thumbUrl || previewPhoto?.url || trip.cover;
                  const tripMediaCount = (trip.photoCount || 0) + (trip.videoCount || 0);
                  const canSlide = tripMediaCount > 1;
                  const previewIsVideo = isVideoMedia(previewPhoto) || (!!trip.cover && previewUrl === trip.cover && (trip.videoCount || 0) > 0 && (trip.photoCount || 0) === 0);
                  const previewLoading = loadingTripPreviews.has(trip.id);
                  const coverLoading = loadingTripCovers.has(trip.id) || (!previewUrl && previewLoading);
                  return (
                  <div key={trip.id} className="trip-card fade-in" style={{ animationDelay: `${i * 60}ms` }} onClick={() => setActiveTrip(trip.id)}>
                    <div className={`trip-cover ${previewUrl || coverLoading ? '' : 'trip-cover-empty'}${coverLoading ? ' trip-cover-loading' : ''}`}>
                      {previewUrl && <TripCoverImage src={previewUrl} />}
                      {previewIsVideo && (
                        <>
                          <div className="media-play-badge trip-video-play-badge" aria-hidden="true">▶</div>
                          <div className="youtube-video-badge" aria-label="YouTube">YouTube</div>
                        </>
                      )}
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
                            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>
                          </button>
                          <button
                            className="trip-slider-btn trip-slider-next"
                            onClick={e => navigateTripPreview(e, trip, 1)}
                            title={isSpanish ? 'Foto siguiente' : 'Next photo'}
                            aria-label={isSpanish ? 'Foto siguiente' : 'Next photo'}
                          >
                            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg>
                          </button>
                          <div className="trip-slider-indicator">
                            {previewLoading
                              ? <span className="trip-slider-spinner" />
                              : `${previewPhotos.length ? previewIndex + 1 : 1}/${tripMediaCount || previewPhotos.length}`}
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
                        {trip.country ? `${trip.country}${trip.date || tripMediaCount ? ' · ' : ''}` : ''}
                        {trip.date ? `${trip.date} · ` : ''}
                        {T.mediaCount(trip.photoCount || 0, trip.videoCount || 0)}
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
              )
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
                              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>
                            </button>
                            <button
                              className="trip-slider-btn trip-slider-next"
                              onClick={e => navigateCityPreview(e, cityPreviewKey, cityPhotos.length, 1)}
                              title={isSpanish ? 'Foto siguiente' : 'Next photo'}
                              aria-label={isSpanish ? 'Foto siguiente' : 'Next photo'}
                            >
                              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg>
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
                        <div className="trip-meta">{T.mediaCount(mediaCounts(cityGroups[city]).photos, mediaCounts(cityGroups[city]).videos)}</div>
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
                              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>
                            </button>
                            <button
                              className="trip-slider-btn trip-slider-next"
                              onClick={e => navigateCityPreview(e, cityPreviewKey, cityUncategorized.length, 1)}
                              title={isSpanish ? 'Foto siguiente' : 'Next photo'}
                              aria-label={isSpanish ? 'Foto siguiente' : 'Next photo'}
                            >
                              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg>
                            </button>
                            <div className="trip-slider-indicator">{`${cityPreviewIndex + 1}/${cityUncategorized.length}`}</div>
                          </>
                        )}
                        {!coverUrl && <span>🏙</span>}
                      </div>
                      <div className="trip-info">
                        <div className="trip-name" style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>{T.noCityAssigned}</div>
                        <div className="trip-meta">{T.mediaCount(mediaCounts(cityUncategorized).photos, mediaCounts(cityUncategorized).videos)}</div>
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
                            onContextMenu={!isReadOnly ? e => openPhotoContextMenu(e, p, { canSetAlbumCover: canManageActiveTrip, canManagePhoto: canManageActiveTrip }) : undefined}>
                            <LazyPhotoImage
                              src={(p.youtubeId ? youtubeThumbUrl(p.youtubeId) : '') || p.thumbUrl || p.url}
                              alt={p.name}
                              onLoad={() => markPhotoImageLoaded(p.id)}
                              onError={() => markPhotoImageLoaded(p.id)}
                            />
                            {isVideoMedia(p) && <div className="media-play-badge" aria-hidden="true">▶</div>}
                            {p.youtubeId && <div className="youtube-video-badge photo-youtube-badge" aria-label="YouTube">YouTube</div>}
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
                        onContextMenu={!isReadOnly ? e => openPhotoContextMenu(e, p, { canSetAlbumCover: canManageActiveTrip, canManagePhoto: canManageActiveTrip }) : undefined}>
                        {!isReadOnly && (
                          <input type="checkbox" className="photo-list-check"
                            checked={selectedPhotos.has(p.id)}
                            onChange={() => togglePhotoSelection(p.id)}
                            onClick={e => e.stopPropagation()} />
                        )}
                        <div className="photo-list-media" onClick={() => setLightbox(p)}>
                          <LazyPhotoImage
                            src={(p.youtubeId ? youtubeThumbUrl(p.youtubeId) : '') || p.thumbUrl || p.url}
                            alt={p.name}
                            className="photo-list-img"
                            onLoad={() => markPhotoImageLoaded(p.id)}
                            onError={() => markPhotoImageLoaded(p.id)}
                            style={{ cursor: 'pointer' }}
                          />
                          {isVideoMedia(p) && <div className="media-play-badge media-play-badge-sm" aria-hidden="true">▶</div>}
                          {p.youtubeId && <div className="youtube-video-badge photo-youtube-badge" aria-label="YouTube">YouTube</div>}
                        </div>
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
        <PhotoSliderOverlay
          item={lightbox}
          items={displayPhotos}
          index={lbIndex}
          onClose={() => setLightbox(null)}
          onNavigate={navLightbox}
          closeLabel={T.close}
          previousLabel={isSpanish ? 'Foto anterior' : 'Previous photo'}
          nextLabel={isSpanish ? 'Foto siguiente' : 'Next photo'}
        >
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
                await setPhotoAsAlbumCover(lightbox.thumbUrl || lightbox.url);
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
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M19 8v6M22 11h-6" /></svg>
              </button>
              <button
                className="lb-face-index-btn"
                onClick={e => { e.stopPropagation(); indexCurrentPhotoFaces(lightbox); }}
                title={T.indexFacesInPhoto}
                disabled={faceAction === `index:${lightbox.id}`}
              >
                {faceAction === `index:${lightbox.id}` ? <span className="spinner" style={{ width: 16, height: 16 }} /> : (
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><path d="M9 9h.01M15 9h.01" /></svg>
                )}
              </button>
            </>
          )}
          {!isReadOnly && (
            <button className="lb-delete" onClick={e => { e.stopPropagation(); requestDeletePhoto(lightbox); }} title={isYouTubeVideo(lightbox) ? T.deleteVideoTitle : T.deletePhotoTitle}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
            </button>
          )}
        </PhotoSliderOverlay>
      )}

      {/* ═══ CONTEXT MENU ═══ */}
      {contextMenu && !isReadOnly && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 1099 }} onClick={() => setContextMenu(null)} onContextMenu={e => { e.preventDefault(); setContextMenu(null); }} />
          <div className="context-menu" style={{ top: contextMenu.y, left: contextMenu.x }} onClick={e => e.stopPropagation()}>
            {contextMenu.canSetAlbumCover && (
              <button onClick={async () => { await setPhotoAsAlbumCover(contextMenu.photo.thumbUrl || contextMenu.photo.url); setContextMenu(null); }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                {T.useAsAlbumCover}
              </button>
            )}
            <button onClick={async () => { await setPhotoAsAppWallpaper(contextMenu.photo); setContextMenu(null); }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="14" rx="2"/><path d="M8 21h8"/><path d="M12 18v3"/><circle cx="8.5" cy="9" r="1.5"/><path d="M21 15l-5-5-4 4-2-2-5 5"/></svg>
              {T.useAsAppWallpaper}
            </button>
            {contextMenu.canManagePhoto && (
              <button className="context-menu-danger" onClick={() => { requestDeletePhoto(contextMenu.photo); setContextMenu(null); }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                {isYouTubeVideo(contextMenu.photo) ? T.deleteVideoMenu : T.deletePhotoMenu}
              </button>
            )}
          </div>
        </>
      )}

      {/* ═══ DELETE TRIP ═══ */}
      {!isReadOnly && confirmDeleteMedia && (
        <div className="modal-overlay fade-scale" onClick={() => !deletingMedia && setConfirmDeleteMedia(null)}>
          <div {...modalProps} className="modal confirm-modal media-delete-modal" onClick={e => e.stopPropagation()}>
            <p className="modal-title">{T.deleteYouTubeVideoQuestion}</p>
            <p className="modal-sub">{T.deleteYouTubeVideoWarn}</p>
            <div className="modal-actions">
              <button className="btn btn-sm" onClick={() => setConfirmDeleteMedia(null)} disabled={deletingMedia}>{T.cancel}</button>
              <button className="btn btn-sm" onClick={() => deletePhoto(confirmDeleteMedia, { deleteFromYouTube: false })} disabled={deletingMedia}>
                {deletingMedia ? T.saving : T.deleteOnlyFromApp}
              </button>
              <button className="btn btn-danger" onClick={() => deletePhoto(confirmDeleteMedia, { deleteFromYouTube: true })} disabled={deletingMedia}>
                {deletingMedia ? T.saving : T.deleteFromAppAndYouTube}
              </button>
            </div>
          </div>
        </div>
      )}

      {profileModal && (
        <div className="modal-overlay fade-scale" onClick={() => setProfileModal(false)}>
          <div {...modalProps} className="modal profile-modal" onClick={e => e.stopPropagation()}>
            <p className="modal-title">{T.myProfile}</p>
            <div className="profile-form">
              <div className="form-group">
                <label>{T.firstNameLabel}</label>
                <input className="input" value={profileForm.firstName} onChange={e => setProfileForm(prev => ({ ...prev, firstName: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>{T.lastNameLabel}</label>
                <input className="input" value={profileForm.lastName} onChange={e => setProfileForm(prev => ({ ...prev, lastName: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>{T.countryLabel}</label>
                <input list="profile-countries-list" className="input" value={profileForm.country} onChange={e => setProfileForm(prev => ({ ...prev, country: e.target.value }))} />
                <datalist id="profile-countries-list">{WORLD_COUNTRIES.map(c => <option key={c} value={c} />)}</datalist>
              </div>
              <div className="form-group">
                <label>{T.birthDateLabel}</label>
                <input type="date" className="input" value={profileForm.birthDate} onChange={e => setProfileForm(prev => ({ ...prev, birthDate: e.target.value }))} />
              </div>
              <div className="form-group profile-form-full">
                <label>{T.sexLabel}</label>
                <select className="input" value={profileForm.sex} onChange={e => setProfileForm(prev => ({ ...prev, sex: e.target.value }))}>
                  <option value="">{T.selectOption}</option>
                  <option value="female">{T.sexFemale}</option>
                  <option value="male">{T.sexMale}</option>
                  <option value="nonBinary">{T.sexNonBinary}</option>
                  <option value="preferNotSay">{T.sexPreferNotSay}</option>
                </select>
              </div>
            </div>
            <div className="youtube-profile-box">
              <div className="youtube-profile-main">
                <div className="youtube-profile-header">
                  <strong>{T.youtubeAccount}</strong>
                  <button
                    type="button"
                    className={`help-toggle youtube-help-toggle${youtubeHelpOpen ? ' active' : ''}`}
                    onClick={() => setYoutubeHelpOpen(open => !open)}
                    title={T.helpLabel}
                    aria-label={T.helpLabel}
                    aria-expanded={youtubeHelpOpen}
                  >
                    ?
                  </button>
                </div>
                <p>{youtubeConnectedEmail ? T.youtubeConnectedAs(youtubeConnectedEmail) : T.youtubeNotConnected}</p>
                {youtubeTokenStatus && <span>{youtubeTokenStatus}</span>}
                {youtubeHelpOpen && (
                  <div className="youtube-help-copy">
                    <span>{T.youtubePrivateUploadNote}</span>
                    <span>{T.youtubeVerificationNote}</span>
                  </div>
                )}
              </div>
              <button className="btn" onClick={connectYouTube} disabled={youtubeConnecting}>
                {youtubeConnecting ? T.connecting : T.connectYouTube}
              </button>
            </div>
            {isAdminUser && (
              <div className="profile-tools-box">
                <div className="profile-tools-heading">
                  <span className="profile-tools-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1 1.56V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1-1.56 1.7 1.7 0 0 0-1.88.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.56-1H3a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.56-1 1.7 1.7 0 0 0-.34-1.88l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.56V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1 1.56 1.7 1.7 0 0 0 1.88-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 9c.14.5.65 1 1.56 1H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.51 1Z" /></svg>
                  </span>
                  <strong>{T.adminTools}</strong>
                </div>
                <div className="profile-tools-grid">
                  <button className="profile-tool-btn" onClick={() => { setProfileModal(false); setFbStep('folder'); setFbError(''); setFbHelpOpen(true); setFbModal(true); }}>
                    {T.importFbMenu}
                  </button>
                  <button className="profile-tool-btn" onClick={() => { setProfileModal(false); loadPendingRequests(); setPendingRequestsModal(true); }}>
                    {T.pendingRequestsMenu}
                  </button>
                  <button className="profile-tool-btn" onClick={() => { setProfileModal(false); loadAppUsers(); setUsersModal(true); }}>
                    {T.usersMenu}
                  </button>
                  <button className="profile-tool-btn" onClick={() => { setProfileModal(false); setNotificationsModal(true); }}>
                    {T.notificationsMenu}
                  </button>
                  <button className="profile-tool-btn" onClick={() => window.open('https://console.firebase.google.com/project/wanderlust-gallery/usage', 'firebase-bills-usage', 'noopener,noreferrer,width=1200,height=800')}>
                    {T.firebaseBillsUsageMenu}
                  </button>
                  <button className="profile-tool-btn" onClick={() => window.open('https://us-east-1.console.aws.amazon.com/console/home?region=us-east-1', 'aws-console', 'noopener,noreferrer,width=1200,height=800')}>
                    {T.awsConsoleMenu}
                  </button>
                </div>
              </div>
            )}
            <button className="profile-signout-btn" onClick={() => { setProfileModal(false); handleSignOut(); }}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              <span>{T.signOut}</span>
            </button>
            <div className="modal-actions">
              <button className="btn btn-sm" onClick={() => setProfileModal(false)}>{T.cancel}</button>
              <button className="btn btn-accent" onClick={saveUserProfile} disabled={savingProfile}>
                {savingProfile ? T.saving : T.save}
              </button>
            </div>
          </div>
        </div>
      )}

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
        <div className="modal-overlay fade-scale" onClick={closeAutoDateModal}>
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
                  <button className="btn btn-accent" onClick={closeAutoDateModal}>{T.close}</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ═══ THUMBNAIL MIGRATION ═══ */}
      {!isReadOnly && thumbMigration && (
        <div className="modal-overlay fade-scale" onClick={closeThumbMigration}>
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
                <button className="btn btn-accent btn-sm" onClick={closeThumbMigration}>{T.doneBtn}</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══ FACEBOOK IMPORT MODAL ═══ */}
      {!isReadOnly && fbModal && (
        <div className="modal-overlay fade-scale" onClick={() => { if (fbStep === 'import') cancelFacebookImport(); else closeFacebookModal(); }}>
          <div {...modalProps} className="modal fb-import-modal" onClick={e => e.stopPropagation()}>

            {fbStep === 'folder' && (
              <>
                <div className="modal-title-row">
                  <p className="modal-title">{T.importFbTitle}</p>
                  <button
                    type="button"
                    className={`help-toggle${fbHelpOpen ? ' active' : ''}`}
                    onClick={() => setFbHelpOpen(open => !open)}
                    title={T.helpLabel}
                    aria-label={T.helpLabel}
                    aria-expanded={fbHelpOpen}
                  >
                    ?
                  </button>
                </div>
                <p className="modal-sub">{T.fbFolderNote}</p>
                {fbHelpOpen && <HelpGuide type="facebook" T={T} />}
                {fbError && <p className="fb-error">{fbError}</p>}
                <div className="modal-actions" style={{ marginTop: 20 }}>
                  <button className="btn btn-sm" onClick={closeFacebookModal}>{T.cancel}</button>
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
                  <div className="modal-title-row">
                    <p className="modal-title">{T.selectCitiesToImport}</p>
                    <button
                      type="button"
                      className={`help-toggle${fbHelpOpen ? ' active' : ''}`}
                      onClick={() => setFbHelpOpen(open => !open)}
                      title={T.helpLabel}
                      aria-label={T.helpLabel}
                      aria-expanded={fbHelpOpen}
                    >
                      ?
                    </button>
                  </div>
                  <p className="modal-sub">
                    {availableRows.length} {T.citiesAvail} · {selectedCount} {T.selectedLabel} · {T.albumsLabel(uniqueAlbums)}
                    {hiddenCount > 0 && <span style={{ color: 'var(--text-muted)', marginLeft: 6 }}>· {hiddenCount} {T.alreadyImported}</span>}
                  </p>
                  {fbHelpOpen && <HelpGuide type="facebook" T={T} />}
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
                    <button className="btn btn-sm" onClick={closeFacebookModal}>{T.cancel}</button>
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
                    <button className="btn btn-sm btn-danger" onClick={cancelFacebookImport}>{T.stopImport}</button>
                  </div>
                </>
              );
            })()}

            {fbStep === 'cancelled' && (
              <>
                <p className="modal-title">{T.importCancelled}</p>
                <p className="modal-sub">{T.importCancelledText}</p>
                <div className="modal-actions" style={{ marginTop: 20 }}>
                  <button className="btn btn-accent" onClick={() => { closeFacebookModal(); loadTrips(); }}>{T.doneBtn}</button>
                </div>
              </>
            )}

            {fbStep === 'done' && (
              <>
                <p className="modal-title">{T.importComplete}</p>
                <p className="modal-sub">{T.importedPhotos(fbTotalDone, fbSelected.size)}</p>
                <div className="modal-actions" style={{ marginTop: 20 }}>
                  <button className="btn btn-accent" onClick={() => { closeFacebookModal(); loadTrips(); }}>{T.doneBtn}</button>
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
        <div className="modal-overlay fade-scale" onClick={closePeopleTools}>
          <div {...modalProps} className="modal people-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title-row">
              <p className="modal-title">{T.peopleTitle}</p>
              <button
                type="button"
                className={`help-toggle${peopleHelpOpen ? ' active' : ''}`}
                onClick={() => setPeopleHelpOpen(open => !open)}
                title={T.helpLabel}
                aria-label={T.helpLabel}
                aria-expanded={peopleHelpOpen}
              >
                ?
              </button>
            </div>
            {peopleHelpOpen && <HelpGuide type="people" T={T} />}
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
                disabled={refreshAllPeople?.status === 'running' || loadingPeople || selectedMatchPeople.length === 0 || fullIndexation?.status === 'scanning' || fullIndexation?.status === 'running'}
              >
                {refreshAllPeople?.status === 'running' ? T.refreshingAll : T.refreshAll}
              </button>
            </div>
            {(refreshAllPeople?.status === 'running' || refreshAllPeople?.status === 'cancelled') && (
              <div className="refresh-all-status">
                <p className="modal-sub">
                  {refreshAllPeople.status === 'cancelled'
                    ? T.refreshAllCancelled
                    : T.refreshAllProgress(refreshAllPeople.done, refreshAllPeople.total, refreshAllPeople.current)}
                </p>
                {refreshAllPeople.status === 'running' && (
                  <button className="btn btn-sm btn-danger" onClick={cancelRefreshAllPeople}>{T.cancelMatches}</button>
                )}
              </div>
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
                <div className={`person-row person-select-all-row${allMatchPeopleSelected ? ' person-row-selected' : ''}`}>
                  <div className="person-main">
                    <input
                      type="checkbox"
                      className="person-select-check"
                      checked={allMatchPeopleSelected}
                      ref={el => { if (el) el.indeterminate = someMatchPeopleSelected; }}
                      onChange={toggleAllPeopleForMatches}
                      disabled={refreshAllPeople?.status === 'running' || loadingPeople || people.length === 0}
                      aria-label={T.checkAll}
                    />
                    <span>
                      <strong>{T.checkAll}</strong>
                    </span>
                  </div>
                </div>
                {people.map(person => (
                  <div key={person.id} className={`person-row${selectedMatchPersonIds.has(person.id) ? ' person-row-selected' : ''}`}>
                    <div className="person-main">
                      <input
                        type="checkbox"
                        className="person-select-check"
                        checked={selectedMatchPersonIds.has(person.id)}
                        onChange={() => togglePersonForMatches(person.id)}
                        disabled={refreshAllPeople?.status === 'running' || faceAction === `delete:${person.id}`}
                        aria-label={T.selectPersonForMatches(person.name)}
                      />
                      {person.referenceImageUrl && <img src={person.referenceImageUrl} alt="" />}
                      <span>
                        <strong>{person.name}</strong>
                        <small>{T.personMatchCount(person.matchCount || 0)}</small>
                      </span>
                    </div>
                    <div className="person-actions">
                      <button
                        className="btn btn-sm"
                        onClick={e => { e.stopPropagation(); openPersonPresentation(person); }}
                        disabled={refreshAllPeople?.status === 'running' || faceAction === `presentation:${person.id}` || faceAction === `delete:${person.id}` || (person.matchCount || 0) === 0}
                      >
                        {faceAction === `presentation:${person.id}` ? T.loadingPresentation : T.createPresentation}
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
              <button className="btn btn-sm" onClick={closePeopleTools}>{T.close}</button>
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
        <div className="modal-overlay fade-scale" onClick={closeFullIndexation}>
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
              {fullIndexation.status === 'running' || fullIndexation.status === 'scanning' || faceClusterReport?.status === 'loading' ? (
                <button className="btn btn-sm" onClick={cancelFullIndexation}>{T.cancelIndexation}</button>
              ) : faceClusterReport?.status === 'ready' && faceClusterReport.clusters.length > 0 ? (
                <>
                  <button className="btn btn-sm" onClick={closeFullIndexation} disabled={savingClusterPeople}>{T.close}</button>
                  <button
                    className="btn btn-accent"
                    onClick={createPeopleFromClusters}
                    disabled={savingClusterPeople || !Object.values(faceClusterNames).some(name => name.trim())}
                  >
                    {savingClusterPeople ? T.saving : T.createPeople}
                  </button>
                </>
              ) : (
                <button className="btn btn-accent" onClick={closeFullIndexation}>{T.close}</button>
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

      {canUseFaceRecognition && personPresentation && !personPresentation.loading && personPresentation.photos.length > 0 && (
        <PhotoSliderOverlay
          item={personPresentation.photos[personPresentation.index] || personPresentation.photos[0]}
          items={personPresentation.photos}
          index={personPresentation.index}
          onClose={closePersonPresentation}
          onNavigate={navigatePersonPresentation}
          closeLabel={T.close}
          previousLabel={isSpanish ? 'Foto anterior' : 'Previous photo'}
          nextLabel={isSpanish ? 'Foto siguiente' : 'Next photo'}
          title={(personPresentation.photos[personPresentation.index] || personPresentation.photos[0])?.tripName || personPresentation.person.name}
          subtitle={[(personPresentation.photos[personPresentation.index] || personPresentation.photos[0])?.tripDate, (personPresentation.photos[personPresentation.index] || personPresentation.photos[0])?.city].filter(Boolean).join(' · ') || T.personMatchCount(personPresentation.photos.length)}
          className="presentation-overlay"
          imageClassName="presentation-img"
          incomingClassName="presentation-img-incoming"
          isPlaying={personPresentation.playing}
          onTogglePlay={() => setPersonPresentation(prev => prev ? { ...prev, playing: !prev.playing } : prev)}
          footer={(
            <>
              <span>
                {exportingPresentation && presentationExportProgress
                  ? T.presentationExportProgress(presentationExportProgress.done, presentationExportProgress.total)
                  : T.presentationTitle(personPresentation.person.name)}
              </span>
              <div className="presentation-share-buttons" aria-label={T.shareOnSocial}>
                <span>{T.shareOnSocial}</span>
                <button type="button" className="social-share-btn whatsapp" onClick={() => sharePresentationToPlatform('whatsapp')} title="WhatsApp" aria-label="WhatsApp">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.76.46 3.47 1.34 4.98L2 22l5.25-1.38a9.86 9.86 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.51 2 12.04 2Zm0 18.15h-.01a8.2 8.2 0 0 1-4.18-1.14l-.3-.18-3.11.82.83-3.03-.2-.31a8.18 8.18 0 1 1 6.97 3.84Zm4.49-6.13c-.25-.12-1.46-.72-1.69-.8-.23-.08-.39-.12-.56.12-.16.25-.64.8-.78.96-.14.16-.29.18-.53.06-.25-.12-1.04-.38-1.98-1.22-.73-.65-1.23-1.46-1.37-1.7-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.14.16-.25.25-.41.08-.16.04-.31-.02-.43-.06-.12-.56-1.35-.76-1.85-.2-.48-.41-.42-.56-.43h-.48c-.16 0-.43.06-.66.31-.23.25-.86.84-.86 2.05s.88 2.38 1 2.54c.12.16 1.73 2.64 4.19 3.7.59.25 1.04.4 1.4.52.59.19 1.12.16 1.54.1.47-.07 1.46-.6 1.66-1.17.21-.57.21-1.06.14-1.17-.06-.1-.23-.16-.47-.29Z"/></svg>
                </button>
                <button type="button" className="social-share-btn facebook" onClick={() => sharePresentationToPlatform('facebook')} title="Facebook" aria-label="Facebook">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.2 8.4V6.7c0-.82.55-1.01.94-1.01h2.39V2.05L14.24 2C10.59 2 9.76 4.74 9.76 6.49V8.4H7v3.75h2.76V22h4.44v-9.85h3.01l.45-3.75H14.2Z"/></svg>
                </button>
                <button type="button" className="social-share-btn x" onClick={() => sharePresentationToPlatform('x')} title="X" aria-label="X">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.68 10.62 20.24 3h-1.55l-5.7 6.62L8.44 3H3.2l6.88 10.01L3.2 21h1.55l6.02-6.99L15.56 21h5.24l-7.12-10.38Zm-2.13 2.47-.7-1L5.31 4.17H7.7l4.48 6.41.7 1 5.81 8.31H16.3l-4.75-6.8Z"/></svg>
                </button>
                <button type="button" className="social-share-btn telegram" onClick={() => sharePresentationToPlatform('telegram')} title="Telegram" aria-label="Telegram">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21.54 3.6 18.2 19.36c-.25 1.12-.91 1.4-1.84.87l-5.08-3.75-2.45 2.36c-.27.27-.5.5-1.02.5l.36-5.17 9.4-8.49c.41-.36-.09-.56-.63-.2L5.32 12.8.31 11.23c-1.09-.34-1.11-1.09.23-1.61L20.13 2.08c.91-.34 1.7.2 1.41 1.52Z"/></svg>
                </button>
              </div>
            </>
          )}
        />
      )}

      {canUseFaceRecognition && personPresentation && (personPresentation.loading || personPresentation.photos.length === 0) && (
        <div className="modal-overlay fade-scale presentation-overlay" onClick={closePersonPresentation}>
          <div {...modalProps} className="modal presentation-modal" onClick={e => e.stopPropagation()}>
            <div className="presentation-header">
              <p className="modal-title">{T.presentationTitle(personPresentation.person.name)}</p>
              <button className="stat-panel-close" onClick={closePersonPresentation} aria-label={T.close}>✕</button>
            </div>
            {personPresentation.loading ? (
              <div className="presentation-loading">
                <span className="spinner" />
                <span>{T.loadingPresentation}</span>
              </div>
            ) : personPresentation.photos.length === 0 ? (
              <p className="modal-sub">{T.noMatchesFound}</p>
            ) : (
              <>
                {(() => {
                  const photo = personPresentation.photos[personPresentation.index] || personPresentation.photos[0];
                  return (
                    <div
                      className={`presentation-stage${personPresentation.playing ? '' : ' presentation-paused'}`}
                      onClick={() => setPersonPresentation(prev => prev ? { ...prev, playing: !prev.playing } : prev)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setPersonPresentation(prev => prev ? { ...prev, playing: !prev.playing } : prev);
                        }
                      }}
                      title={personPresentation.playing ? T.pausePresentation : T.playPresentation}
                    >
                      <CrossfadeImage
                        src={photo.url || photo.thumbUrl}
                        alt={photo.name || ''}
                        className="presentation-img"
                        incomingClassName="presentation-img-incoming"
                        loading="eager"
                      />
                      <div className="presentation-caption">
                        <strong>{photo.tripName || personPresentation.person.name}</strong>
                        <span>{[photo.tripDate, photo.city].filter(Boolean).join(' · ') || T.personMatchCount(personPresentation.photos.length)}</span>
                      </div>
                      {personPresentation.photos.length > 1 && (
                        <>
                          <button className="person-slide-arrow person-slide-prev" onClick={e => { e.stopPropagation(); navigatePersonPresentation(-1); }} aria-label={isSpanish ? 'Foto anterior' : 'Previous photo'}>&lt;</button>
                          <button className="person-slide-arrow person-slide-next" onClick={e => { e.stopPropagation(); navigatePersonPresentation(1); }} aria-label={isSpanish ? 'Foto siguiente' : 'Next photo'}>&gt;</button>
                        </>
                      )}
                    </div>
                  );
                })()}
                <div className="presentation-footer">
                  <span>
                    {exportingPresentation && presentationExportProgress
                      ? T.presentationExportProgress(presentationExportProgress.done, presentationExportProgress.total)
                      : `${personPresentation.index + 1} / ${personPresentation.photos.length}`}
                  </span>
                </div>
                <div className="presentation-share-buttons" aria-label={T.shareOnSocial}>
                  <span>{T.shareOnSocial}</span>
                  <button type="button" className="social-share-btn whatsapp" onClick={() => sharePresentationToPlatform('whatsapp')} title="WhatsApp" aria-label="WhatsApp">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.76.46 3.47 1.34 4.98L2 22l5.25-1.38a9.86 9.86 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.51 2 12.04 2Zm0 18.15h-.01a8.2 8.2 0 0 1-4.18-1.14l-.3-.18-3.11.82.83-3.03-.2-.31a8.18 8.18 0 1 1 6.97 3.84Zm4.49-6.13c-.25-.12-1.46-.72-1.69-.8-.23-.08-.39-.12-.56.12-.16.25-.64.8-.78.96-.14.16-.29.18-.53.06-.25-.12-1.04-.38-1.98-1.22-.73-.65-1.23-1.46-1.37-1.7-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.14.16-.25.25-.41.08-.16.04-.31-.02-.43-.06-.12-.56-1.35-.76-1.85-.2-.48-.41-.42-.56-.43h-.48c-.16 0-.43.06-.66.31-.23.25-.86.84-.86 2.05s.88 2.38 1 2.54c.12.16 1.73 2.64 4.19 3.7.59.25 1.04.4 1.4.52.59.19 1.12.16 1.54.1.47-.07 1.46-.6 1.66-1.17.21-.57.21-1.06.14-1.17-.06-.1-.23-.16-.47-.29Z"/></svg>
                  </button>
                  <button type="button" className="social-share-btn facebook" onClick={() => sharePresentationToPlatform('facebook')} title="Facebook" aria-label="Facebook">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.2 8.4V6.7c0-.82.55-1.01.94-1.01h2.39V2.05L14.24 2C10.59 2 9.76 4.74 9.76 6.49V8.4H7v3.75h2.76V22h4.44v-9.85h3.01l.45-3.75H14.2Z"/></svg>
                  </button>
                  <button type="button" className="social-share-btn x" onClick={() => sharePresentationToPlatform('x')} title="X" aria-label="X">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.68 10.62 20.24 3h-1.55l-5.7 6.62L8.44 3H3.2l6.88 10.01L3.2 21h1.55l6.02-6.99L15.56 21h5.24l-7.12-10.38Zm-2.13 2.47-.7-1L5.31 4.17H7.7l4.48 6.41.7 1 5.81 8.31H16.3l-4.75-6.8Z"/></svg>
                  </button>
                  <button type="button" className="social-share-btn telegram" onClick={() => sharePresentationToPlatform('telegram')} title="Telegram" aria-label="Telegram">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21.54 3.6 18.2 19.36c-.25 1.12-.91 1.4-1.84.87l-5.08-3.75-2.45 2.36c-.27.27-.5.5-1.02.5l.36-5.17 9.4-8.49c.41-.36-.09-.56-.63-.2L5.32 12.8.31 11.23c-1.09-.34-1.11-1.09.23-1.61L20.13 2.08c.91-.34 1.7.2 1.41 1.52Z"/></svg>
                  </button>
                </div>
              </>
            )}
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
        <PhotoSliderOverlay
          item={personSlideshow.photos[personSlideshow.index]}
          items={personSlideshow.photos}
          index={personSlideshow.index}
          onClose={() => setPersonSlideshow(null)}
          onNavigate={navigatePersonSlideshow}
          closeLabel={T.close}
          previousLabel={isSpanish ? 'Foto anterior' : 'Previous photo'}
          nextLabel={isSpanish ? 'Foto siguiente' : 'Next photo'}
          title={personSlideshow.title}
          subtitle={personSlideshow.photos[personSlideshow.index]?.tripName || ''}
        />
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
