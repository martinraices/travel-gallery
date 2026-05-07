export function getTranslations(isSpanish) {
  return {
    // Header
    adminTools: isSpanish ? 'Herramientas' : 'Admin Tools',
    importFbMenu: isSpanish ? '↓ Importar desde Facebook' : '↓ Import from Facebook',
    generateThumbsMenu: isSpanish ? 'Generar miniaturas desde carpeta local' : 'Generate thumbnails from local folder',
    manageAccessesMenu: isSpanish ? '👥 Gestionar accesos' : '👥 Manage Accesses',
    firebaseBillsUsageMenu: isSpanish ? 'Firebase Bills and Usage' : 'Firebase Bills and Usage',
    pendingRequestsMenu: isSpanish ? 'Pending Requests' : 'Pending Requests',
    usersMenu: isSpanish ? 'Users' : 'Users',
    notificationsMenu: isSpanish ? 'Notificaciones' : 'Notifications',
    peopleMenu: isSpanish ? 'Personas' : 'People',
    newTrip: isSpanish ? '+ Nuevo viaje' : '+ New Trip',
    addPhotos: isSpanish ? '+ Agregar fotos' : '+ Add Photos',
    uploading: (d, t) => isSpanish ? `Subiendo ${d}/${t}…` : `Uploading ${d}/${t}…`,
    lightMode: isSpanish ? 'Modo claro' : 'Light mode',
    darkMode: isSpanish ? 'Modo oscuro' : 'Dark mode',
    signOut: isSpanish ? 'Cerrar sesión' : 'Sign out',
    // Stats panel
    selectAll: isSpanish ? 'Seleccionar todo' : 'Select all',
    allTrips: isSpanish ? 'Todos los viajes' : 'All Trips',
    sharedToMeTitle: isSpanish ? 'Shared to me' : 'Shared to me',
    sharedToMeCount: (n) => isSpanish
      ? `${n} álbum${n !== 1 ? 'es' : ''} compartido${n !== 1 ? 's' : ''}`
      : `${n} shared album${n !== 1 ? 's' : ''}`,
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
    loadingTrips: isSpanish ? 'Cargando viajes' : 'Loading trips',
    loadingPhotos: isSpanish ? 'Cargando fotos' : 'Loading photos',
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
    createPersonFromPhoto: isSpanish ? 'Crear persona desde esta foto' : 'Create person from this photo',
    indexFacesInPhoto: isSpanish ? 'Indexar rostros de esta foto' : 'Index faces in this photo',
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
    linkCopied: isSpanish ? 'Enlace copiado.' : 'Link copied.',
    linkCopyFailed: isSpanish ? 'No se pudo copiar el enlace.' : 'Could not copy the link.',
    shareExpiryLabel: isSpanish ? 'Caducidad del enlace' : 'Link expiration',
    shareExpiryNever: isSpanish ? 'Sin caducidad' : 'Never expires',
    shareExpiry7: isSpanish ? '7 dias' : '7 days',
    shareExpiry30: isSpanish ? '30 dias' : '30 days',
    shareExpiry90: isSpanish ? '90 dias' : '90 days',
    shareExpirySaved: isSpanish ? 'Caducidad actualizada.' : 'Expiration updated.',
    shareExpiresOn: (date) => isSpanish ? `Caduca el ${date}` : `Expires on ${date}`,
    sharedLinkExpired: isSpanish ? 'Este enlace compartido ha caducado.' : 'This shared link has expired.',
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
    shareWithLabel: isSpanish ? 'Compartir con' : 'Share with',
    shareGuestsTitle: isSpanish ? 'Guests' : 'Guests',
    shareGuestsNote: isSpanish
      ? 'Visible para quienes entran como Guest.'
      : 'Visible to people browsing as Guest.',
    internalUsersLabel: isSpanish ? 'Usuarios internos' : 'Internal users',
    loadingUsers: isSpanish ? 'Cargando usuarios' : 'Loading users',
    noInternalUsers: isSpanish ? 'No hay otros usuarios internos disponibles.' : 'No other internal users are available.',
    selectShareAudience: isSpanish ? 'Selecciona Guests o al menos un usuario interno.' : 'Select Guests or at least one internal user.',
    sharing: isSpanish ? 'Compartiendo…' : 'Sharing…',
    shareAndNotify: isSpanish ? 'Compartir y notificar' : 'Share and notify',
    shareAlbumsConfirm: isSpanish ? 'Compartir álbumes' : 'Share albums',
    invalidEmails: (emails) => isSpanish
      ? `Email${emails.length !== 1 ? 's' : ''} no valido${emails.length !== 1 ? 's' : ''}: ${emails.join(', ')}`
      : `Invalid email${emails.length !== 1 ? 's' : ''}: ${emails.join(', ')}`,
    enterAtLeastOneEmail: isSpanish ? 'Ingresa al menos un email valido.' : 'Enter at least one valid email.',
    // Share success modal
    albumsSharedTitle: isSpanish ? '¡Álbumes compartidos!' : 'Albums shared!',
    accessGrantedTo: (emails) => isSpanish
      ? `Se otorgó acceso a ${emails} para:`
      : `Access granted to ${emails} for:`,
    emailClientNote: isSpanish
      ? 'Se abrió tu cliente de correo para enviar la notificación. Si no se abrió, revisa que tengas un cliente de correo configurado.'
      : 'Your mail client was opened to send the notification. If it did not open, check that you have a mail client configured.',
    accept: isSpanish ? 'Aceptar' : 'Accept',
    view: isSpanish ? 'Ver' : 'View',
    someone: isSpanish ? 'alguien' : 'someone',
    albumSharedNotificationTitle: isSpanish ? 'Album compartido contigo' : 'Album shared with you',
    albumSharedNotificationText: (album, sender) => isSpanish
      ? `${sender} compartio "${album}" contigo.`
      : `${sender} shared "${album}" with you.`,
    userRequestNotificationTitle: isSpanish ? 'Nuevo request de usuario' : 'New user request',
    userRequestNotificationText: (email) => isSpanish
      ? `${email} pidio acceso para crear usuario.`
      : `${email} requested access to create a user.`,
    // Manage accesses modal
    manageAccessesTitle: isSpanish ? 'Gestionar accesos' : 'Manage Accesses',
    noAlbumsSharedYet: isSpanish ? 'Aún no se han compartido álbumes con nadie.' : 'No albums have been shared yet.',
    revoke: isSpanish ? 'Revocar' : 'Revoke',
    pendingRequestsTitle: isSpanish ? 'Pending Requests' : 'Pending Requests',
    noPendingRequests: isSpanish ? 'No hay requests pendientes.' : 'There are no pending requests.',
    approveAccess: isSpanish ? 'Aprobar acceso' : 'Approve access',
    denyAccess: isSpanish ? 'Denegar acceso' : 'Deny access',
    usersTitle: isSpanish ? 'Users' : 'Users',
    noUsers: isSpanish ? 'No hay usuarios.' : 'There are no users.',
    userAlbumCount: (n) => isSpanish ? `${n} álbum${n !== 1 ? 'es' : ''}` : `${n} album${n !== 1 ? 's' : ''}`,
    userPhotoCount: (n) => isSpanish ? `${n} foto${n !== 1 ? 's' : ''}` : `${n} photo${n !== 1 ? 's' : ''}`,
    userPaused: isSpanish ? 'Acceso pausado' : 'Access paused',
    pauseAccess: isSpanish ? 'Pausar acceso' : 'Pause access',
    resumeAccess: isSpanish ? 'Reactivar acceso' : 'Resume access',
    removeUser: isSpanish ? 'Remover usuario' : 'Remove user',
    confirm: isSpanish ? 'Confirmar' : 'Confirm',
    confirmPauseUserTitle: isSpanish ? 'Pausar acceso' : 'Pause access',
    confirmPauseUserText: (email) => isSpanish
      ? `¿Seguro que quieres pausar el acceso de ${email}? No podrá entrar hasta que lo reactives.`
      : `Are you sure you want to pause access for ${email}? They will not be able to sign in until resumed.`,
    confirmResumeUserTitle: isSpanish ? 'Reactivar acceso' : 'Resume access',
    confirmResumeUserText: (email) => isSpanish
      ? `¿Seguro que quieres reactivar el acceso de ${email}?`
      : `Are you sure you want to resume access for ${email}?`,
    confirmRemoveUserTitle: isSpanish ? 'Remover usuario' : 'Remove user',
    confirmRemoveUserText: (email) => isSpanish
      ? `¿Seguro que quieres remover ${email}? Se borrarán sus datos de perfil y requests, y se quitará su acceso aprobado.`
      : `Are you sure you want to remove ${email}? Their profile data and requests will be deleted, and approved access will be removed.`,
    notificationsTitle: isSpanish ? 'Notificaciones' : 'Notifications',
    notificationsSub: isSpanish ? 'Habilita o deshabilita las notificaciones que apareceran en el dashboard.' : 'Enable or disable the notifications shown on the dashboard.',
    albumSharedNotificationType: isSpanish ? 'Album compartido' : 'Shared album',
    albumSharedNotificationTypeHelp: isSpanish ? 'Avisa cuando alguien comparte un album contigo.' : 'Notify users when someone shares an album with them.',
    userRequestNotificationType: isSpanish ? 'Request de creacion de usuario' : 'User creation request',
    userRequestNotificationTypeHelp: isSpanish ? 'Solo admins: avisa cuando hay requests pendientes.' : 'Admins only: notify when pending requests exist.',
    sharedByMePhotosLabel: isSpanish ? 'Compartidas por mi' : 'Shared by me',
    sharedWithMePhotosLabel: isSpanish ? 'Compartidas conmigo' : 'Shared with me',
    peopleTitle: isSpanish ? 'Personas' : 'People',
    personNameLabel: isSpanish ? 'Nombre' : 'Name',
    personNamePlaceholder: isSpanish ? 'ej. Elena' : 'e.g. Elena',
    noPeopleYet: isSpanish ? 'Aun no hay personas.' : 'No people yet.',
    personMatchCount: (n) => isSpanish ? `${n} coincidencia${n !== 1 ? 's' : ''}` : `${n} match${n !== 1 ? 'es' : ''}`,
    searchFaces: isSpanish ? 'Buscar' : 'Search',
    searchingFaces: isSpanish ? 'Buscando...' : 'Searching...',
    faceActionFailed: isSpanish ? 'No se pudo completar la accion de reconocimiento facial.' : 'Could not complete the face recognition action.',
    faceIndexComplete: (n) => isSpanish ? `${n} rostro${n !== 1 ? 's' : ''} indexado${n !== 1 ? 's' : ''}.` : `${n} face${n !== 1 ? 's' : ''} indexed.`,
    faceSearchComplete: (n) => isSpanish ? `${n} foto${n !== 1 ? 's' : ''} encontrada${n !== 1 ? 's' : ''}.` : `${n} matching photo${n !== 1 ? 's' : ''} found.`,
    personFilterLabel: (name, n) => isSpanish ? `${name}: ${n} foto${n !== 1 ? 's' : ''}` : `${name}: ${n} photo${n !== 1 ? 's' : ''}`,
    clearFilter: isSpanish ? 'Limpiar filtro' : 'Clear filter',
    viewMatches: isSpanish ? 'Ver matches' : 'View Matches',
    personMatchesTitle: (name) => isSpanish ? `Matches de ${name}` : `${name} matches`,
    noMatchesFound: isSpanish ? 'No se encontraron matches.' : 'No matches found.',
    viewAllMatches: isSpanish ? 'Ver todos los matches' : 'View all matches',
    allMatchesTitle: (name) => isSpanish ? `Todos los matches de ${name}` : `All ${name} matches`,
    deletePersonTitle: isSpanish ? 'Eliminar persona' : 'Delete person',
    deletePersonText: (name) => isSpanish
      ? `Seguro que quieres eliminar ${name}? Podras recrearla luego desde otra foto.`
      : `Are you sure you want to delete ${name}? You can recreate this person later from another photo.`,
    personDeleted: isSpanish ? 'Persona eliminada.' : 'Person deleted.',
    fullIndexation: isSpanish ? 'Indexacion completa' : 'Full indexation',
    fullIndexationTitle: isSpanish ? 'Indexar todas las caras' : 'Index every face',
    fullIndexationText: isSpanish
      ? 'Se revisaran todas las fotos visibles en tu perfil, incluyendo albums compartidos contigo. Las fotos ya indexadas se saltaran para evitar duplicados en Rekognition.'
      : 'This will scan every photo visible in your profile, including albums shared with you. Photos already indexed will be skipped to avoid Rekognition duplicates.',
    startIndexation: isSpanish ? 'Empezar' : 'Start',
    indexingFaces: isSpanish ? 'Indexando...' : 'Indexing...',
    preparingIndexation: isSpanish ? 'Preparando fotos...' : 'Preparing photos...',
    fullIndexationProgress: (done, total) => isSpanish ? `${done} de ${total} fotos procesadas` : `${done} of ${total} photos processed`,
    fullIndexationIndexed: (n) => isSpanish ? `${n} indexada${n !== 1 ? 's' : ''}` : `${n} indexed`,
    fullIndexationSkipped: (n) => isSpanish ? `${n} saltada${n !== 1 ? 's' : ''}` : `${n} skipped`,
    fullIndexationFaces: (n) => isSpanish ? `${n} rostro${n !== 1 ? 's' : ''}` : `${n} face${n !== 1 ? 's' : ''}`,
    fullIndexationFailed: (n) => isSpanish ? `${n} error${n !== 1 ? 'es' : ''}` : `${n} failed`,
    fullIndexationEta: (eta) => isSpanish ? `Tiempo estimado: ${eta}` : `Estimated time: ${eta}`,
    fullIndexationDone: isSpanish ? 'Indexacion completa finalizada.' : 'Full indexation finished.',
    fullIndexationCancelled: isSpanish ? 'Indexacion cancelada.' : 'Indexation cancelled.',
    cancelIndexation: isSpanish ? 'Cancelar indexacion' : 'Cancel indexation',
    // Public share view
    sharedLinkInvalid: isSpanish ? 'Este enlace compartido ya no es válido.' : 'This shared link is no longer valid.',
    sharedGallery: isSpanish ? 'Galería compartida' : 'Shared gallery',
    showMorePhotos: (n) => isSpanish ? `Mostrar ${n} fotos mas` : `Show ${n} more photos`,
    // Login
    signInSub: isSpanish ? 'Inicia sesión para acceder a tu galería privada' : 'Sign in to access your private gallery',
    continueWithGoogle: isSpanish ? 'Continuar con Google' : 'Continue with Google',
    continueAsGuest: isSpanish ? 'Entrar como invitado' : 'Continue as Guest',
    signingIn: isSpanish ? 'Iniciando sesión…' : 'Signing in…',
    signInFailed: isSpanish ? 'Error al iniciar sesión — inténtalo de nuevo' : 'Sign-in failed — please try again',
    accessRequestTitle: isSpanish ? 'Solicitud de acceso' : 'Access request',
    accessRequestMessage: (email) => isSpanish
      ? `La creación de nuevos usuarios debe ser autorizada por el Admin del sitio. ¿Deseas enviar una solicitud para ${email}?`
      : `New users must be authorized by the site Admin. Do you want to send an access request for ${email}?`,
    yesSendRequest: isSpanish ? 'Sí, enviar solicitud' : 'Yes, send request',
    no: isSpanish ? 'No' : 'No',
    sendingRequest: isSpanish ? 'Enviando solicitud…' : 'Sending request…',
    accessRequestSent: isSpanish ? 'Solicitud enviada. El Admin deberá aprobar tu acceso.' : 'Request sent. The Admin must approve your access.',
    accessRequestFailed: isSpanish ? 'No se pudo enviar la solicitud.' : 'Could not send the request.',
    accessPausedTitle: isSpanish ? 'Acceso pausado' : 'Access paused',
    accessPausedMessage: (email) => isSpanish
      ? `El acceso de ${email} está pausado. Contacta al Admin del sitio si necesitas reactivarlo.`
      : `Access for ${email} is paused. Contact the site Admin if you need it restored.`,
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
}
