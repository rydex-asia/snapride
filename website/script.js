const STUDIO_PORT = 4010;
const BACKEND_PORT = 4000;
const AUTH_STORAGE_KEY = 'rydex-user-auth';
const PROFILE_STORAGE_PREFIX = 'rydex-user-profile:';
const DEFAULT_CONFIG = {
  shared: {
    brandName: 'RYDEX',
    profile: {
      name: 'Kiran',
      phone: '+91 99001 12233',
      email: 'kiran@example.com'
    }
  },
  websiteMode: {
    navLinks: [
      { label: 'Services', href: '#services' },
      { label: 'Book', href: '#booking' }
    ],
    hero: {
      eyebrow: 'City rides, parcels, travel',
      title: 'Rydex on web, built from your app flow.',
      subtitle: 'Suggestions, quick booking, stop management, profile controls, and smart route handoff to street maps.',
      primaryCta: 'Start a ride',
      secondaryCta: 'See services'
    },
    preview: {
      title: 'Current Ride',
      pickup: 'Pickup: Dilsukhnagar Metro',
      drop: 'Drop: HITEC City Junction',
      payLabel: 'Pay',
      cancelLabel: 'Cancel',
      etaLabel: 'ETA',
      etaValue: '12 min'
    },
    services: {
      heading: 'Suggestions',
      subtitle: 'Reference look from your mobile app with real graphics.',
      items: [
        { id: 'auto', title: 'Auto', image: 'https://img.icons8.com/color/96/auto-rickshaw.png' },
        { id: 'bike', title: 'Bike', image: 'https://img.icons8.com/color/96/motorcycle.png' },
        { id: 'trip', title: 'Trip', image: 'https://img.icons8.com/color/96/car--v1.png' },
        { id: 'parcel', title: 'Send parcels', image: 'https://img.icons8.com/color/96/delivery.png' },
        { id: 'rentals', title: 'Rentals', image: 'https://img.icons8.com/color/96/rent.png' },
        { id: 'intercity', title: 'Intercity', image: 'https://img.icons8.com/color/96/taxi.png' },
        { id: 'transit', title: 'Transit', image: 'https://img.icons8.com/color/96/train.png' },
        { id: 'reserve', title: 'Reserve', image: 'https://img.icons8.com/color/96/planner.png' }
      ]
    },
    banners: {
      heading: 'Highlights',
      subtitle: 'Sliding banners similar to app promotions.',
      items: [
        { id: 'ride-offer', tag: 'Ride Offer', title: '20% off on evening rides', image: 'https://images.unsplash.com/photo-1520262494112-9fe481d36ec3?auto=format&fit=crop&w=600&q=60' },
        { id: 'parcel-drop', tag: 'Parcel Drop', title: 'Fast pickup in 10 minutes', image: 'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?auto=format&fit=crop&w=600&q=60' },
        { id: 'intercity', tag: 'Intercity', title: 'Weekend routes now live', image: 'https://images.unsplash.com/photo-1503220317375-aaad61436b1b?auto=format&fit=crop&w=600&q=60' }
      ]
    },
    booking: {
      heading: 'Pickup and Drop',
      subtitle: 'Use current location, add stops, then preview the street route on the same page.',
      helperTitle: 'How Continue works',
      helperSteps: [
        'Pickup, stops, and drop are combined in order.',
        'The street route is drawn directly on the in-page map.',
        'Distance and ETA are calculated from the route preview.'
      ],
      continueLabel: 'Continue'
    },
    profile: {
      heading: 'Profile',
      subtitle: 'First-level options + editable user details, like app flow.',
      menuItems: ['Help', 'Payment', 'My Rides', 'Safety', 'Refer and Earn'],
      openLabel: 'Open',
      saveLabel: 'Save profile'
    }
  }
};

const addStopBtn = document.getElementById('addStopBtn');
const stopsContainer = document.getElementById('stopsContainer');
const bookingForm = document.getElementById('bookingForm');
const useCurrentBtn = document.getElementById('useCurrentBtn');
const bookingStatus = document.getElementById('bookingStatus');
const pickupAddressInput = document.getElementById('pickupAddress');
const dropAddressInput = document.getElementById('dropAddress');
const profileDetailsForm = document.getElementById('profileDetailsForm');
const openDetailsBtn = document.getElementById('openDetailsBtn');
const nameInput = document.getElementById('nameInput');
const phoneInput = document.getElementById('phoneInput');
const emailInput = document.getElementById('emailInput');
const menuName = document.getElementById('menuName');
const menuPhone = document.getElementById('menuPhone');
const profileStatus = document.getElementById('profileStatus');
const bannerTrack = document.getElementById('bannerTrack');
const routeSummary = document.getElementById('routeSummary');
const authActionBtn = document.getElementById('authActionBtn');
const headerProfileBtn = document.getElementById('headerProfileBtn');
const authModal = document.getElementById('authModal');
const authModalBackdrop = document.getElementById('authModalBackdrop');
const closeAuthModalBtn = document.getElementById('closeAuthModalBtn');
const authForm = document.getElementById('authForm');
const authPhoneInput = document.getElementById('authPhoneInput');
const authOtpInput = document.getElementById('authOtpInput');
const authBackendInput = document.getElementById('authBackendInput');
const authStatus = document.getElementById('authStatus');
const authOtpHint = document.getElementById('authOtpHint');
const requestOtpBtn = document.getElementById('requestOtpBtn');
const profileModal = document.getElementById('profileModal');
const profileModalBackdrop = document.getElementById('profileModalBackdrop');
const closeProfileModalBtn = document.getElementById('closeProfileModalBtn');

let stopCount = 0;
let bannerIndex = 0;
let bannerInterval = null;
let activeConfig = DEFAULT_CONFIG;
let activeConfigFingerprint = JSON.stringify(DEFAULT_CONFIG);
let studioPollTimer = null;
let bookingMap = null;
let routePolyline = null;
let routeMarkers = [];
let activeBackendUrl = '';
let activeAuth = null;
let pendingProfileOpen = false;

function studioCandidates() {
  const host = window.location.hostname || '127.0.0.1';
  return Array.from(new Set([
    `http://${host}:${STUDIO_PORT}/api/config`,
    `http://127.0.0.1:${STUDIO_PORT}/api/config`,
    `http://localhost:${STUDIO_PORT}/api/config`
  ]));
}

async function loadStudioConfig() {
  for (const candidate of studioCandidates()) {
    try {
      const url = new URL(candidate);
      url.searchParams.set('ts', String(Date.now()));
      const response = await fetch(url.toString(), { cache: 'no-store' });
      if (!response.ok) continue;
      return await response.json();
    } catch {}
  }
  return DEFAULT_CONFIG;
}

function backendCandidates(preferred = '') {
  const host = window.location.hostname || '127.0.0.1';
  return Array.from(new Set([
    preferred,
    activeBackendUrl,
    `http://${host}:${BACKEND_PORT}`,
    `http://127.0.0.1:${BACKEND_PORT}`,
    `http://localhost:${BACKEND_PORT}`
  ].filter(Boolean)));
}

function normalizePhoneNumber(value) {
  const trimmed = (value || '').trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('+')) {
    return `+${trimmed.slice(1).replace(/\D/g, '')}`;
  }
  const digits = trimmed.replace(/\D/g, '');
  if (digits.length === 10) {
    return `+91${digits}`;
  }
  if (digits.length > 10) {
    return `+${digits}`;
  }
  return digits;
}

function setAuthStatus(message, isError = false) {
  if (!authStatus) return;
  authStatus.textContent = message;
  authStatus.style.color = isError ? '#c93a3a' : '#3a5679';
}

function readStoredAuth() {
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.accessToken || !parsed?.user?.phoneNumber) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeStoredAuth(value) {
  if (!value) {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return;
  }
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(value));
}

function profileStorageKey(phoneNumber) {
  return `${PROFILE_STORAGE_PREFIX}${phoneNumber}`;
}

function readStoredProfile(phoneNumber) {
  if (!phoneNumber) return null;
  try {
    const raw = window.localStorage.getItem(profileStorageKey(phoneNumber));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeStoredProfile(phoneNumber, value) {
  if (!phoneNumber) return;
  window.localStorage.setItem(profileStorageKey(phoneNumber), JSON.stringify(value));
}

function buildEffectiveProfile(sharedProfile = {}) {
  const phoneNumber = activeAuth?.user?.phoneNumber || sharedProfile.phone || '';
  const storedProfile = readStoredProfile(phoneNumber) || {};
  return {
    ...sharedProfile,
    ...storedProfile,
    phone: phoneNumber || storedProfile.phone || sharedProfile.phone || ''
  };
}

function updateAuthUi() {
  const loggedIn = Boolean(activeAuth?.accessToken);
  if (authActionBtn) {
    authActionBtn.textContent = loggedIn ? 'Logout' : 'Login';
  }
  if (authPhoneInput) {
    authPhoneInput.value = activeAuth?.user?.phoneNumber || authPhoneInput.value || '';
  }
  if (authBackendInput) {
    authBackendInput.value = activeBackendUrl || authBackendInput.value || backendCandidates()[0];
  }
}

async function postToBackend(path, body, preferredBase = '') {
  let lastError = new Error('Network request failed');
  for (const base of backendCandidates(preferredBase)) {
    try {
      const response = await fetch(`${base}${path}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }
      activeBackendUrl = base;
      updateAuthUi();
      return data;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Network request failed');
    }
  }
  throw lastError;
}

function setBookingStatus(message, isError = false) {
  if (!bookingStatus) return;
  bookingStatus.textContent = message;
  bookingStatus.style.color = isError ? '#c93a3a' : '#3a5679';
}

function setRouteSummary(message, isError = false) {
  if (!routeSummary) return;
  routeSummary.textContent = message;
  routeSummary.style.color = isError ? '#c93a3a' : '#2f4058';
}

function openProfileModal(showDetails = true) {
  if (!profileModal) return;
  profileModal.classList.remove('hidden');
  if (showDetails) {
    profileDetailsForm?.classList.remove('hidden');
  }
}

function closeProfileModal() {
  profileModal?.classList.add('hidden');
}

function openAuthModal(message = '') {
  authModal?.classList.remove('hidden');
  if (message) {
    setAuthStatus(message, true);
  }
  authPhoneInput?.focus();
}

function closeAuthModal() {
  authModal?.classList.add('hidden');
  setAuthStatus('');
}

function createStopField(value = '') {
  stopCount += 1;

  const wrap = document.createElement('div');
  wrap.className = 'stop-item';

  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = `Stop ${stopCount} (optional)`;
  input.className = 'stop-input';
  input.value = value;

  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.className = 'remove-stop';
  removeBtn.textContent = '-';
  removeBtn.title = 'Remove stop';
  removeBtn.addEventListener('click', () => {
    wrap.remove();
  });

  wrap.appendChild(input);
  wrap.appendChild(removeBtn);
  stopsContainer.appendChild(wrap);
}

function ensureBookingMap() {
  if (bookingMap || !window.L || !document.getElementById('bookingMap')) return;

  bookingMap = window.L.map('bookingMap', {
    zoomControl: false,
    attributionControl: true
  }).setView([17.4374, 78.4482], 12);

  window.L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 19,
    subdomains: 'abcd',
    attribution: '&copy; OpenStreetMap &copy; CARTO'
  }).addTo(bookingMap);

  window.L.control.zoom({ position: 'bottomright' }).addTo(bookingMap);
}

function clearRoutePreview() {
  if (!bookingMap) return;
  if (routePolyline) {
    bookingMap.removeLayer(routePolyline);
    routePolyline = null;
  }
  routeMarkers.forEach((layer) => bookingMap.removeLayer(layer));
  routeMarkers = [];
}

function pinIcon(type) {
  return window.L.divIcon({
    className: `map-pin-marker map-pin-marker--${type}`,
    html: '<span class="map-pin-shell"></span>',
    iconSize: [24, 24],
    iconAnchor: [12, 22],
    popupAnchor: [0, -18]
  });
}

function addMapMarker(point, type, label) {
  if (!bookingMap) return;
  const marker = window.L.marker([point.latitude, point.longitude], {
    icon: pinIcon(type)
  })
    .addTo(bookingMap)
    .bindPopup(label || '');
  routeMarkers.push(marker);
}

async function geocodeAddress(query) {
  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('limit', '1');
  url.searchParams.set('q', query);

  const response = await fetch(url.toString(), {
    headers: {
      'Accept-Language': 'en'
    }
  });
  if (!response.ok) {
    throw new Error('Address lookup failed');
  }
  const data = await response.json();
  if (!data.length) {
    throw new Error(`Address not found: ${query}`);
  }
  return {
    latitude: Number(data[0].lat),
    longitude: Number(data[0].lon),
    label: data[0].display_name
  };
}

async function loadStreetRoute(points) {
  if (points.length !== 2) throw new Error('Backend routing currently supports pickup and destination');
  const apiBase = String(window.RYDEX_API_BASE_URL || '').replace(/\/$/, '');
  if (!apiBase) throw new Error('Routing service is not configured');
  const response = await fetch(`${apiBase}/api/v1/routing/route`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      originLatitude: points[0].latitude,
      originLongitude: points[0].longitude,
      destinationLatitude: points[1].latitude,
      destinationLongitude: points[1].longitude,
      travelMode: 'DRIVE'
    })
  });
  if (!response.ok) {
    throw new Error('Street route lookup failed');
  }
  const data = await response.json();
  if (!data.encodedPolyline) {
    throw new Error('No street route found');
  }
  return {
    coordinates: decodeGooglePolyline(data.encodedPolyline),
    distanceKm: data.distanceMeters / 1000,
    durationMin: data.durationSeconds / 60
  };
}

function decodeGooglePolyline(encoded) {
  const points = [];
  let index = 0;
  let latitude = 0;
  let longitude = 0;
  while (index < encoded.length) {
    let result = 0; let shift = 0; let byte;
    do { byte = encoded.charCodeAt(index++) - 63; result |= (byte & 0x1f) << shift; shift += 5; } while (byte >= 0x20);
    latitude += (result & 1) ? ~(result >> 1) : result >> 1;
    result = 0; shift = 0;
    do { byte = encoded.charCodeAt(index++) - 63; result |= (byte & 0x1f) << shift; shift += 5; } while (byte >= 0x20);
    longitude += (result & 1) ? ~(result >> 1) : result >> 1;
    points.push({ latitude: latitude / 1e5, longitude: longitude / 1e5 });
  }
  return points;
}

function renderRoutePreview(points, route) {
  ensureBookingMap();
  if (!bookingMap) return;

  clearRoutePreview();
  routePolyline = window.L.polyline(
    route.coordinates.map((point) => [point.latitude, point.longitude]),
    {
      color: '#111111',
      weight: 5,
      opacity: 0.9,
      lineCap: 'round',
      lineJoin: 'round'
    }
  ).addTo(bookingMap);

  addMapMarker(points[0], 'pickup', `Pickup: ${points[0].label || 'Pickup'}`);
  points.slice(1, -1).forEach((point, index) => {
    addMapMarker(point, 'stop', `Stop ${index + 1}: ${point.label || 'Stop'}`);
  });
  addMapMarker(points[points.length - 1], 'drop', `Drop: ${points[points.length - 1].label || 'Drop'}`);

  bookingMap.fitBounds(routePolyline.getBounds(), { padding: [30, 30] });
  setRouteSummary(
    `Street route ready: ${route.distanceKm.toFixed(1)} km${route.durationMin ? ` • ${Math.round(route.durationMin)} min` : ''}`
  );
}

function renderNavLinks(items) {
  const navLinks = document.getElementById('navLinks');
  navLinks.innerHTML = '';
  items
    .filter((item) => (item.label || '').trim().toLowerCase() !== 'profile')
    .forEach((item) => {
    const link = document.createElement('a');
    link.href = item.href || '#';
    link.textContent = item.label || 'Link';
    navLinks.appendChild(link);
    });
}

function renderServices(items) {
  const servicesGrid = document.getElementById('servicesGrid');
  servicesGrid.innerHTML = '';
  items.forEach((item) => {
    const card = document.createElement('article');
    card.className = 'service-card';
    card.innerHTML = `<img src="${item.image}" alt="${item.title}" /><h3>${item.title}</h3>`;
    servicesGrid.appendChild(card);
  });
}

function renderBanners(items) {
  bannerTrack.innerHTML = '';
  items.forEach((item) => {
    const card = document.createElement('article');
    card.className = 'banner';
    card.innerHTML = `
      <div>
        <p class="banner-tag">${item.tag || ''}</p>
        <h3>${item.title || ''}</h3>
      </div>
      <img src="${item.image}" alt="${item.title || 'Banner'}" />
    `;
    bannerTrack.appendChild(card);
  });

  bannerIndex = 0;
  bannerTrack.style.transform = 'translateX(0%)';
  if (bannerInterval) {
    window.clearInterval(bannerInterval);
    bannerInterval = null;
  }

  if (items.length > 1) {
    bannerInterval = window.setInterval(() => {
      bannerIndex = (bannerIndex + 1) % items.length;
      bannerTrack.style.transform = `translateX(-${bannerIndex * 100}%)`;
    }, 3500);
  }
}

function renderProfileMenu(items) {
  const profileMenuList = document.getElementById('profileMenuList');
  profileMenuList.innerHTML = '';
  items.forEach((item) => {
    const row = document.createElement('li');
    row.textContent = item;
    profileMenuList.appendChild(row);
  });
}

function renderBookingSteps(items) {
  const bookingHelperSteps = document.getElementById('bookingHelperSteps');
  bookingHelperSteps.innerHTML = '';
  items.forEach((item) => {
    const step = document.createElement('li');
    step.textContent = item;
    bookingHelperSteps.appendChild(step);
  });
}

function applyConfig(config) {
  const shared = config.shared || DEFAULT_CONFIG.shared;
  const website = config.websiteMode || DEFAULT_CONFIG.websiteMode;
  const effectiveProfile = buildEffectiveProfile(shared.profile || {});

  document.getElementById('siteBrand').textContent = shared.brandName || 'RYDEX';
  renderNavLinks(website.navLinks || DEFAULT_CONFIG.websiteMode.navLinks);
  document.getElementById('headerBookBtn').textContent = website.hero?.primaryCta || 'Book Now';

  document.getElementById('heroEyebrow').textContent = website.hero?.eyebrow || '';
  document.getElementById('heroTitle').textContent = website.hero?.title || '';
  document.getElementById('heroSubtitle').textContent = website.hero?.subtitle || '';
  document.getElementById('heroPrimaryBtn').textContent = website.hero?.primaryCta || 'Start a ride';
  document.getElementById('heroSecondaryBtn').textContent = website.hero?.secondaryCta || 'See services';

  document.getElementById('previewTitle').textContent = website.preview?.title || '';
  document.getElementById('previewPickup').textContent = website.preview?.pickup || '';
  document.getElementById('previewDrop').textContent = website.preview?.drop || '';
  document.getElementById('previewPayBtn').textContent = website.preview?.payLabel || 'Pay';
  document.getElementById('previewCancelBtn').textContent = website.preview?.cancelLabel || 'Cancel';
  document.getElementById('previewEtaLabel').textContent = website.preview?.etaLabel || 'ETA';
  document.getElementById('previewEtaValue').textContent = website.preview?.etaValue || '--';

  document.getElementById('servicesHeading').textContent = website.services?.heading || '';
  document.getElementById('servicesSubtitle').textContent = website.services?.subtitle || '';
  renderServices(website.services?.items || DEFAULT_CONFIG.websiteMode.services.items);

  document.getElementById('bannersHeading').textContent = website.banners?.heading || '';
  document.getElementById('bannersSubtitle').textContent = website.banners?.subtitle || '';
  renderBanners(website.banners?.items || DEFAULT_CONFIG.websiteMode.banners.items);

  document.getElementById('bookingHeading').textContent = website.booking?.heading || '';
  document.getElementById('bookingSubtitle').textContent = website.booking?.subtitle || '';
  document.getElementById('bookingHelperTitle').textContent = website.booking?.helperTitle || '';
  document.getElementById('continueBtn').textContent = website.booking?.continueLabel || 'Continue';
  renderBookingSteps(website.booking?.helperSteps || DEFAULT_CONFIG.websiteMode.booking.helperSteps);

  document.getElementById('profileHeading').textContent = website.profile?.heading || '';
  document.getElementById('profileSubtitle').textContent = website.profile?.subtitle || '';
  document.getElementById('openDetailsLabel').textContent = website.profile?.openLabel || 'Open';
  document.getElementById('profileSaveBtn').textContent = website.profile?.saveLabel || 'Save profile';
  renderProfileMenu(website.profile?.menuItems || DEFAULT_CONFIG.websiteMode.profile.menuItems);

  menuName.textContent = effectiveProfile.name || 'Rydex User';
  menuPhone.textContent = effectiveProfile.phone || 'No phone';
  nameInput.value = effectiveProfile.name || '';
  phoneInput.value = effectiveProfile.phone || '';
  emailInput.value = effectiveProfile.email || '';
  if (!authPhoneInput?.value) {
    authPhoneInput.value = effectiveProfile.phone || '';
  }
  updateAuthUi();
}

async function reverseGeocode(latitude, longitude) {
  const url = new URL('https://nominatim.openstreetmap.org/reverse');
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('lat', String(latitude));
  url.searchParams.set('lon', String(longitude));

  const response = await fetch(url.toString(), {
    headers: {
      'Accept-Language': 'en'
    }
  });
  if (!response.ok) {
    throw new Error('Could not resolve address');
  }
  const data = await response.json();
  return data.display_name || `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
}

function applyAuthSession(session) {
  activeAuth = session || null;
  if (activeAuth?.backendUrl) {
    activeBackendUrl = activeAuth.backendUrl;
  }
  writeStoredAuth(activeAuth);
  updateAuthUi();
  applyConfig(activeConfig);
}

function clearAuthSession() {
  activeAuth = null;
  writeStoredAuth(null);
  updateAuthUi();
  applyConfig(activeConfig);
  closeProfileModal();
}

if (addStopBtn) {
  addStopBtn.addEventListener('click', () => createStopField(''));
}

if (useCurrentBtn) {
  useCurrentBtn.addEventListener('click', async () => {
    if (!navigator.geolocation) {
      setBookingStatus('Geolocation is not supported in this browser.', true);
      return;
    }

    setBookingStatus('Detecting current location...');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const label = await reverseGeocode(position.coords.latitude, position.coords.longitude);
          pickupAddressInput.value = label;
          setBookingStatus('Pickup updated with current location.');
          ensureBookingMap();
          clearRoutePreview();
          addMapMarker(
            { latitude: position.coords.latitude, longitude: position.coords.longitude, label },
            'pickup',
            `Pickup: ${label}`
          );
          bookingMap?.setView([position.coords.latitude, position.coords.longitude], 15);
          setRouteSummary('Current pickup pinned on the map.');
        } catch {
          pickupAddressInput.value = `${position.coords.latitude.toFixed(5)}, ${position.coords.longitude.toFixed(5)}`;
          setBookingStatus('Current coordinates added as pickup.');
        }
      },
      () => {
        setBookingStatus('Location access denied. Please enter pickup manually.', true);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000
      }
    );
  });
}

if (bookingForm) {
  bookingForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const pickup = pickupAddressInput.value.trim();
    const drop = dropAddressInput.value.trim();

    if (!pickup || !drop) {
      setBookingStatus('Please enter both pickup and drop addresses.', true);
      return;
    }

    const stopFields = Array.from(document.querySelectorAll('.stop-input'));
    const stops = stopFields
      .map((field) => field.value.trim())
      .filter(Boolean);

    setBookingStatus('Detecting pickup and drop addresses...');
    setRouteSummary('Looking up street route...');

    try {
      const pickupResult = await geocodeAddress(pickup);
      const dropResult = await geocodeAddress(drop);
      const stopResults = [];

      for (let index = 0; index < stops.length; index += 1) {
        const stopResult = await geocodeAddress(stops[index]);
        stopResults.push(stopResult);
      }

      pickupAddressInput.value = pickupResult.label;
      dropAddressInput.value = dropResult.label;
      stopFields.forEach((field, index) => {
        if (stopResults[index]) {
          field.value = stopResults[index].label;
        }
      });

      const points = [pickupResult, ...stopResults, dropResult];
      const route = await loadStreetRoute(points);
      renderRoutePreview(points, route);
      setBookingStatus(
        `Route ready: ${route.distanceKm.toFixed(1)} km${route.durationMin ? ` • ${Math.round(route.durationMin)} min` : ''}`
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to detect route';
      setBookingStatus(message, true);
      setRouteSummary('Unable to detect pickup/drop route yet.', true);
    }
  });
}

if (openDetailsBtn) {
  openDetailsBtn.addEventListener('click', () => {
    profileDetailsForm.classList.toggle('hidden');
  });
}

if (authActionBtn) {
  authActionBtn.addEventListener('click', () => {
    if (activeAuth?.accessToken) {
      clearAuthSession();
      setAuthStatus('Logged out.');
      return;
    }
    pendingProfileOpen = false;
    openAuthModal();
  });
}

if (headerProfileBtn) {
  headerProfileBtn.addEventListener('click', () => {
    openProfileModal(true);
  });
}

if (authModalBackdrop) {
  authModalBackdrop.addEventListener('click', closeAuthModal);
}

if (closeAuthModalBtn) {
  closeAuthModalBtn.addEventListener('click', closeAuthModal);
}

if (profileModalBackdrop) {
  profileModalBackdrop.addEventListener('click', closeProfileModal);
}

if (closeProfileModalBtn) {
  closeProfileModalBtn.addEventListener('click', closeProfileModal);
}

if (profileDetailsForm) {
  profileDetailsForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const phoneNumber = activeAuth?.user?.phoneNumber || normalizePhoneNumber(phoneInput.value) || phoneInput.value.trim();
    const nextProfile = {
      name: nameInput.value.trim() || 'Rydex User',
      phone: phoneNumber || 'No phone',
      email: emailInput.value.trim()
    };
    writeStoredProfile(phoneNumber, nextProfile);
    menuName.textContent = nextProfile.name;
    menuPhone.textContent = nextProfile.phone;
    phoneInput.value = nextProfile.phone;
    profileStatus.textContent = 'Profile updated successfully.';
  });
}

if (requestOtpBtn) {
  requestOtpBtn.addEventListener('click', async () => {
    const phoneNumber = normalizePhoneNumber(authPhoneInput?.value || '');
    if (!phoneNumber) {
      setAuthStatus('Enter a valid phone number first.', true);
      return;
    }

    setAuthStatus('Requesting OTP...');
    authOtpHint.textContent = '';
    try {
      const data = await postToBackend('/auth/request-otp', { phoneNumber }, authBackendInput?.value.trim());
      authPhoneInput.value = phoneNumber;
      authOtpInput.value = data.devOtp || '';
      authOtpHint.textContent = data.devOtp ? `Dev OTP: ${data.devOtp}` : '';
      setAuthStatus('OTP sent. Enter the code to continue.');
    } catch (error) {
      setAuthStatus(error instanceof Error ? error.message : 'OTP request failed', true);
    }
  });
}

if (authForm) {
  authForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const phoneNumber = normalizePhoneNumber(authPhoneInput?.value || '');
    const otp = (authOtpInput?.value || '').trim();
    if (!phoneNumber || otp.length !== 6) {
      setAuthStatus('Enter a valid phone number and 6-digit OTP.', true);
      return;
    }

    setAuthStatus('Signing you in...');
    try {
      const data = await postToBackend(
        '/auth/verify-otp',
        { phoneNumber, otp, role: 'RIDER' },
        authBackendInput?.value.trim()
      );
      const storedProfile = readStoredProfile(phoneNumber) || {};
      applyAuthSession({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        backendUrl: activeBackendUrl,
        user: data.user,
        profile: {
          ...activeConfig.shared?.profile,
          ...storedProfile,
          phone: data.user?.phoneNumber || phoneNumber
        }
      });
      setAuthStatus('Login successful.');
      closeAuthModal();
      if (pendingProfileOpen) {
        pendingProfileOpen = false;
        openProfileModal(true);
      }
      setBookingStatus('Logged in successfully.');
    } catch (error) {
      setAuthStatus(error instanceof Error ? error.message : 'Login failed', true);
    }
  });
}

(async function init() {
  activeAuth = null;
  writeStoredAuth(null);
  activeBackendUrl = backendCandidates()[0];

  activeConfig = await loadStudioConfig();
  applyConfig(activeConfig);
  activeConfigFingerprint = JSON.stringify(activeConfig);
  ensureBookingMap();
  setRouteSummary('Set pickup and drop to preview the street route.');

  if (studioPollTimer) {
    window.clearInterval(studioPollTimer);
  }
  studioPollTimer = window.setInterval(async () => {
    const nextConfig = await loadStudioConfig();
    const nextFingerprint = JSON.stringify(nextConfig);
    if (nextFingerprint !== activeConfigFingerprint) {
      activeConfig = nextConfig;
      activeConfigFingerprint = nextFingerprint;
      applyConfig(activeConfig);
      setBookingStatus('Studio changes synced.');
    }
  }, 3000);
})();
