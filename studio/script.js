const loginView = document.getElementById('loginView');
const studioShell = document.getElementById('studioShell');
const loginForm = document.getElementById('loginForm');
const loginAdminId = document.getElementById('loginAdminId');
const loginPassword = document.getElementById('loginPassword');
const loginStatus = document.getElementById('loginStatus');
const modeTabs = document.getElementById('modeTabs');
const appModePanel = document.getElementById('appModePanel');
const websiteModePanel = document.getElementById('websiteModePanel');
const modeSummary = document.getElementById('modeSummary');
const saveBtn = document.getElementById('saveBtn');
const resetBtn = document.getElementById('resetBtn');
const exportBtn = document.getElementById('exportBtn');
const authBadge = document.getElementById('authBadge');
const logoutBtn = document.getElementById('logoutBtn');
const saveStatus = document.getElementById('saveStatus');
const studioSearch = document.getElementById('studioSearch');
const clearSearchBtn = document.getElementById('clearSearchBtn');
const importBtn = document.getElementById('importBtn');
const importFile = document.getElementById('importFile');
const appStatCount = document.getElementById('appStatCount');
const websiteStatCount = document.getElementById('websiteStatCount');
const profileStatCount = document.getElementById('profileStatCount');
const appStatMeta = document.getElementById('appStatMeta');
const websiteStatMeta = document.getElementById('websiteStatMeta');
const profileStatMeta = document.getElementById('profileStatMeta');
const studioHealthText = document.getElementById('studioHealthText');
const previewEyebrow = document.getElementById('previewEyebrow');
const previewTitle = document.getElementById('previewTitle');
const previewBody = document.getElementById('previewBody');

const clone = (value) => JSON.parse(JSON.stringify(value));

const simpleBindings = [
  { id: 'sharedBrandName', get: () => state.shared.brandName, set: (value) => { state.shared.brandName = value; } },
  { id: 'sharedProfileName', get: () => state.shared.profile.name, set: (value) => { state.shared.profile.name = value; } },
  { id: 'sharedProfilePhone', get: () => state.shared.profile.phone, set: (value) => { state.shared.profile.phone = value; } },
  { id: 'sharedProfileEmail', get: () => state.shared.profile.email, set: (value) => { state.shared.profile.email = value; } },
  { id: 'sharedProfileMemberSince', get: () => state.shared.profile.memberSince, set: (value) => { state.shared.profile.memberSince = value; } },
  { id: 'sharedProfileWalletBalance', get: () => state.shared.profile.walletBalance, set: (value) => { state.shared.profile.walletBalance = value; } },
  { id: 'sharedProfileTotalRides', get: () => state.shared.profile.totalRides, set: (value) => { state.shared.profile.totalRides = value; } },
  { id: 'sharedProfileRewards', get: () => state.shared.profile.rewards, set: (value) => { state.shared.profile.rewards = value; } },
  { id: 'appBrandTagline', get: () => state.appMode.brandTagline, set: (value) => { state.appMode.brandTagline = value; } },
  { id: 'appSearchPlaceholder', get: () => state.appMode.searchPlaceholder, set: (value) => { state.appMode.searchPlaceholder = value; } },
  { id: 'appParcelHeading', get: () => state.appMode.parcel.heading, set: (value) => { state.appMode.parcel.heading = value; } },
  { id: 'appParcelSubheading', get: () => state.appMode.parcel.subheading, set: (value) => { state.appMode.parcel.subheading = value; } },
  { id: 'appParcelCourierHeading', get: () => state.appMode.parcel.courierHeading, set: (value) => { state.appMode.parcel.courierHeading = value; } },
  { id: 'webHeroEyebrow', get: () => state.websiteMode.hero.eyebrow, set: (value) => { state.websiteMode.hero.eyebrow = value; } },
  { id: 'webHeroTitle', get: () => state.websiteMode.hero.title, set: (value) => { state.websiteMode.hero.title = value; } },
  { id: 'webHeroSubtitle', get: () => state.websiteMode.hero.subtitle, set: (value) => { state.websiteMode.hero.subtitle = value; } },
  { id: 'webHeroPrimaryCta', get: () => state.websiteMode.hero.primaryCta, set: (value) => { state.websiteMode.hero.primaryCta = value; } },
  { id: 'webHeroSecondaryCta', get: () => state.websiteMode.hero.secondaryCta, set: (value) => { state.websiteMode.hero.secondaryCta = value; } },
  { id: 'webPreviewTitle', get: () => state.websiteMode.preview.title, set: (value) => { state.websiteMode.preview.title = value; } },
  { id: 'webPreviewEtaValue', get: () => state.websiteMode.preview.etaValue, set: (value) => { state.websiteMode.preview.etaValue = value; } },
  { id: 'webPreviewPickup', get: () => state.websiteMode.preview.pickup, set: (value) => { state.websiteMode.preview.pickup = value; } },
  { id: 'webPreviewDrop', get: () => state.websiteMode.preview.drop, set: (value) => { state.websiteMode.preview.drop = value; } },
  { id: 'webPreviewPayLabel', get: () => state.websiteMode.preview.payLabel, set: (value) => { state.websiteMode.preview.payLabel = value; } },
  { id: 'webPreviewCancelLabel', get: () => state.websiteMode.preview.cancelLabel, set: (value) => { state.websiteMode.preview.cancelLabel = value; } },
  { id: 'webServicesHeading', get: () => state.websiteMode.services.heading, set: (value) => { state.websiteMode.services.heading = value; } },
  { id: 'webServicesSubtitle', get: () => state.websiteMode.services.subtitle, set: (value) => { state.websiteMode.services.subtitle = value; } },
  { id: 'webBannersHeading', get: () => state.websiteMode.banners.heading, set: (value) => { state.websiteMode.banners.heading = value; } },
  { id: 'webBannersSubtitle', get: () => state.websiteMode.banners.subtitle, set: (value) => { state.websiteMode.banners.subtitle = value; } },
  { id: 'webBookingHeading', get: () => state.websiteMode.booking.heading, set: (value) => { state.websiteMode.booking.heading = value; } },
  { id: 'webBookingSubtitle', get: () => state.websiteMode.booking.subtitle, set: (value) => { state.websiteMode.booking.subtitle = value; } },
  { id: 'webBookingHelperTitle', get: () => state.websiteMode.booking.helperTitle, set: (value) => { state.websiteMode.booking.helperTitle = value; } },
  { id: 'webBookingContinueLabel', get: () => state.websiteMode.booking.continueLabel, set: (value) => { state.websiteMode.booking.continueLabel = value; } },
  { id: 'webProfileHeading', get: () => state.websiteMode.profile.heading, set: (value) => { state.websiteMode.profile.heading = value; } },
  { id: 'webProfileSubtitle', get: () => state.websiteMode.profile.subtitle, set: (value) => { state.websiteMode.profile.subtitle = value; } },
  { id: 'webProfileOpenLabel', get: () => state.websiteMode.profile.openLabel, set: (value) => { state.websiteMode.profile.openLabel = value; } },
  { id: 'webProfileSaveLabel', get: () => state.websiteMode.profile.saveLabel, set: (value) => { state.websiteMode.profile.saveLabel = value; } }
];

const collectionSpecs = [
  {
    key: 'appTabs',
    containerId: 'appTabsEditor',
    title: 'Bottom Tabs',
    description: 'Names shown in the app bottom navigation.',
    addLabel: 'Add tab',
    getItems: () => state.appMode.tabs,
    createItem: (count) => ({ key: `Tab${count + 1}`, label: '' }),
    itemLabel: (item, index) => item.label || item.key || `Tab ${index + 1}`,
    itemSubtitle: (item) => item.key || 'Tab item',
    fields: [
      { key: 'key', label: 'Tab key' },
      { key: 'label', label: 'Display label', placeholder: 'Optional override' }
    ]
  },
  {
    key: 'appSuggestions',
    containerId: 'appSuggestionsEditor',
    title: 'Suggestions',
    description: 'Cards shown in the Ride home suggestions grid. The live app currently uses Auto, Bike, and Send parcels.',
    addLabel: 'Add suggestion',
    getItems: () => state.appMode.suggestions,
    createItem: (count) => ({ id: `suggestion_${count + 1}`, title: `Suggestion ${count + 1}`, image: '' }),
    itemLabel: (item, index) => item.title || `Suggestion ${index + 1}`,
    itemSubtitle: (item) => item.id || 'Suggestion card',
    fields: [
      { key: 'id', label: 'ID' },
      { key: 'title', label: 'Title' },
      { key: 'image', label: 'Image URL', full: true }
    ]
  },
  {
    key: 'appBanners',
    containerId: 'appBannersEditor',
    title: 'Home Banners',
    description: 'Slides shown in the app highlights carousel.',
    addLabel: 'Add banner',
    getItems: () => state.appMode.banners,
    createItem: (count) => ({ id: `banner_${count + 1}`, section: 'Highlights', title: `Banner ${count + 1}`, subtitle: '', cta: 'Tap now', image: '' }),
    itemLabel: (item, index) => item.title || `Banner ${index + 1}`,
    itemSubtitle: (item) => item.section || 'App banner',
    fields: [
      { key: 'id', label: 'ID' },
      { key: 'section', label: 'Section tag' },
      { key: 'title', label: 'Title', full: true },
      { key: 'subtitle', label: 'Subtitle', type: 'textarea', full: true },
      { key: 'cta', label: 'CTA label' },
      { key: 'image', label: 'Image URL', full: true }
    ]
  },
  {
    key: 'appParcelTop',
    containerId: 'appParcelTopEditor',
    title: 'Services Top Cards',
    description: 'First row in the Services tab.',
    addLabel: 'Add top card',
    getItems: () => state.appMode.parcel.top,
    createItem: (count) => ({ id: `parcel_top_${count + 1}`, title: `Card ${count + 1}`, image: '', badge: '' }),
    itemLabel: (item, index) => item.title || `Card ${index + 1}`,
    itemSubtitle: (item) => item.id || 'Parcel card',
    fields: [
      { key: 'id', label: 'ID' },
      { key: 'title', label: 'Title' },
      { key: 'badge', label: 'Badge', placeholder: 'Optional' },
      { key: 'image', label: 'Image URL', full: true }
    ]
  },
  {
    key: 'appParcelMid',
    containerId: 'appParcelMidEditor',
    title: 'Services Middle Cards',
    description: 'Second row in the Services tab.',
    addLabel: 'Add middle card',
    getItems: () => state.appMode.parcel.mid,
    createItem: (count) => ({ id: `parcel_mid_${count + 1}`, title: `Card ${count + 1}`, image: '', badge: '' }),
    itemLabel: (item, index) => item.title || `Card ${index + 1}`,
    itemSubtitle: (item) => item.id || 'Parcel card',
    fields: [
      { key: 'id', label: 'ID' },
      { key: 'title', label: 'Title' },
      { key: 'badge', label: 'Badge', placeholder: 'Optional' },
      { key: 'image', label: 'Image URL', full: true }
    ]
  },
  {
    key: 'appParcelBottom',
    containerId: 'appParcelBottomEditor',
    title: 'Services Bottom Cards',
    description: 'Third row in the Services tab.',
    addLabel: 'Add bottom card',
    getItems: () => state.appMode.parcel.bottom,
    createItem: (count) => ({ id: `parcel_bottom_${count + 1}`, title: `Card ${count + 1}`, image: '', badge: '' }),
    itemLabel: (item, index) => item.title || `Card ${index + 1}`,
    itemSubtitle: (item) => item.id || 'Parcel card',
    fields: [
      { key: 'id', label: 'ID' },
      { key: 'title', label: 'Title' },
      { key: 'badge', label: 'Badge', placeholder: 'Optional' },
      { key: 'image', label: 'Image URL', full: true }
    ]
  },
  {
    key: 'appParcelCourier',
    containerId: 'appParcelCourierEditor',
    title: 'Featured Service Cards',
    description: 'Cards shown under the featured service section.',
    addLabel: 'Add courier card',
    getItems: () => state.appMode.parcel.courier,
    createItem: (count) => ({ id: `parcel_courier_${count + 1}`, title: `Courier ${count + 1}`, image: '', badge: '' }),
    itemLabel: (item, index) => item.title || `Courier ${index + 1}`,
    itemSubtitle: (item) => item.id || 'Courier card',
    fields: [
      { key: 'id', label: 'ID' },
      { key: 'title', label: 'Title' },
      { key: 'badge', label: 'Badge', placeholder: 'Optional' },
      { key: 'image', label: 'Image URL', full: true }
    ]
  },
  {
    key: 'appProfileDetails',
    containerId: 'appProfileDetailsEditor',
    title: 'Profile Detail Rows',
    description: 'Fallback fields used by the user Profile tab for identity and membership details.',
    addLabel: 'Add detail row',
    getItems: () => state.appMode.profile.details,
    createItem: (count) => ({ key: `detail_${count + 1}`, label: `Detail ${count + 1}`, value: '', clickable: false }),
    itemLabel: (item, index) => item.label || `Detail ${index + 1}`,
    itemSubtitle: (item) => item.key || 'Profile detail',
    fields: [
      { key: 'key', label: 'Key' },
      { key: 'label', label: 'Label' },
      { key: 'value', label: 'Value', full: true },
      { key: 'clickable', label: 'Clickable row', type: 'checkbox', hint: 'Show as editable/clickable in app' }
    ]
  },
  {
    key: 'webNavLinks',
    containerId: 'webNavLinksEditor',
    title: 'Navigation Links',
    description: 'Top navigation used in the website header.',
    addLabel: 'Add link',
    getItems: () => state.websiteMode.navLinks,
    createItem: (count) => ({ label: `Link ${count + 1}`, href: '#' }),
    itemLabel: (item, index) => item.label || `Link ${index + 1}`,
    itemSubtitle: (item) => item.href || 'Website nav link',
    fields: [
      { key: 'label', label: 'Label' },
      { key: 'href', label: 'Link target' }
    ]
  },
  {
    key: 'webServices',
    containerId: 'webServicesEditor',
    title: 'Website Service Cards',
    description: 'Cards shown under the website suggestions/services grid.',
    addLabel: 'Add service card',
    getItems: () => state.websiteMode.services.items,
    createItem: (count) => ({ id: `service_${count + 1}`, title: `Service ${count + 1}`, image: '' }),
    itemLabel: (item, index) => item.title || `Service ${index + 1}`,
    itemSubtitle: (item) => item.id || 'Website service card',
    fields: [
      { key: 'id', label: 'ID' },
      { key: 'title', label: 'Title' },
      { key: 'image', label: 'Image URL', full: true }
    ]
  },
  {
    key: 'webBanners',
    containerId: 'webBannersEditor',
    title: 'Website Banner Cards',
    description: 'Slides used in the website highlights section.',
    addLabel: 'Add website banner',
    getItems: () => state.websiteMode.banners.items,
    createItem: (count) => ({ id: `web_banner_${count + 1}`, tag: 'Offer', title: `Banner ${count + 1}`, image: '' }),
    itemLabel: (item, index) => item.title || `Banner ${index + 1}`,
    itemSubtitle: (item) => item.tag || 'Website banner',
    fields: [
      { key: 'id', label: 'ID' },
      { key: 'tag', label: 'Tag' },
      { key: 'title', label: 'Title', full: true },
      { key: 'image', label: 'Image URL', full: true }
    ]
  },
  {
    key: 'webBookingSteps',
    containerId: 'webBookingStepsEditor',
    title: 'Booking Helper Steps',
    description: 'Short helper steps shown beside the booking form.',
    addLabel: 'Add step',
    getItems: () => state.websiteMode.booking.helperSteps,
    createItem: (count) => `New step ${count + 1}`,
    itemLabel: (item, index) => item || `Step ${index + 1}`,
    itemSubtitle: () => 'Booking helper step',
    fields: [
      { key: 'value', label: 'Step text', full: true }
    ],
    itemType: 'string'
  },
  {
    key: 'webProfileMenu',
    containerId: 'webProfileMenuEditor',
    title: 'Website Profile Menu',
    description: 'Profile options listed on the website profile section.',
    addLabel: 'Add profile option',
    getItems: () => state.websiteMode.profile.menuItems,
    createItem: (count) => `Menu option ${count + 1}`,
    itemLabel: (item, index) => item || `Option ${index + 1}`,
    itemSubtitle: () => 'Website profile option',
    fields: [
      { key: 'value', label: 'Menu item text', full: true }
    ],
    itemType: 'string'
  }
];

let activeMode = 'app';
let state = null;
let defaultState = null;
let authUser = null;
let isDirty = false;

function setStatus(message, isError = false) {
  saveStatus.textContent = message;
  saveStatus.style.color = isError ? '#c93a3a' : '#0f1723';
  if (studioHealthText) {
    studioHealthText.textContent = isError ? 'Needs attention' : isDirty ? 'Unsaved' : 'Ready';
  }
}

function setLoginStatus(message, isError = false) {
  loginStatus.textContent = message;
  loginStatus.style.color = isError ? '#c93a3a' : '#0f1723';
}

function showLoginView() {
  loginView.classList.remove('hidden');
  studioShell.classList.add('hidden');
  authUser = null;
  authBadge.classList.add('hidden');
  authBadge.textContent = '';
}

function showStudio(user) {
  authUser = user || null;
  loginView.classList.add('hidden');
  studioShell.classList.remove('hidden');
  authBadge.textContent = user?.adminId ? `Signed in as ${user.adminId}` : '';
  authBadge.classList.toggle('hidden', !user?.adminId);
}

function markDirty() {
  isDirty = true;
  setStatus('Unsaved changes');
}

async function requestJson(path, options) {
  const response = await fetch(path, options);
  const data = await response.json();
  if (!response.ok) {
    if (response.status === 401) {
      showLoginView();
      setLoginStatus('Session expired. Sign in again.', true);
    }
    throw new Error(data.message || 'Request failed');
  }
  return data;
}

async function loadStudio() {
  const [current, defaults] = await Promise.all([
    requestJson('/api/config'),
    requestJson('/api/default-config')
  ]);
  defaultState = mergeState(defaults, defaults);
  state = mergeState(current, defaultState);
  isDirty = false;
  renderAll();
  setMode('app');
  setStatus('Studio loaded.');
}

function safeArray(value, fallback) {
  return Array.isArray(value) ? clone(value) : clone(fallback);
}

function mergeState(source, fallback) {
  const base = clone(fallback);
  const input = source && typeof source === 'object' ? source : {};

  return {
    shared: {
      ...base.shared,
      ...(input.shared || {}),
      profile: {
        ...base.shared.profile,
        ...(input.shared?.profile || {})
      }
    },
    appMode: {
      ...base.appMode,
      ...(input.appMode || {}),
      tabs: safeArray(input.appMode?.tabs, base.appMode.tabs),
      suggestions: safeArray(input.appMode?.suggestions, base.appMode.suggestions),
      banners: safeArray(input.appMode?.banners, base.appMode.banners),
      parcel: {
        ...base.appMode.parcel,
        ...(input.appMode?.parcel || {}),
        top: safeArray(input.appMode?.parcel?.top, base.appMode.parcel.top),
        mid: safeArray(input.appMode?.parcel?.mid, base.appMode.parcel.mid),
        bottom: safeArray(input.appMode?.parcel?.bottom, base.appMode.parcel.bottom),
        courier: safeArray(input.appMode?.parcel?.courier, base.appMode.parcel.courier)
      },
      profile: {
        ...base.appMode.profile,
        ...(input.appMode?.profile || {}),
        menuItems: safeArray(input.appMode?.profile?.menuItems, base.appMode.profile.menuItems),
        details: safeArray(input.appMode?.profile?.details, base.appMode.profile.details)
      }
    },
    websiteMode: {
      ...base.websiteMode,
      ...(input.websiteMode || {}),
      navLinks: safeArray(input.websiteMode?.navLinks, base.websiteMode.navLinks),
      hero: {
        ...base.websiteMode.hero,
        ...(input.websiteMode?.hero || {})
      },
      preview: {
        ...base.websiteMode.preview,
        ...(input.websiteMode?.preview || {})
      },
      services: {
        ...base.websiteMode.services,
        ...(input.websiteMode?.services || {}),
        items: safeArray(input.websiteMode?.services?.items, base.websiteMode.services.items)
      },
      banners: {
        ...base.websiteMode.banners,
        ...(input.websiteMode?.banners || {}),
        items: safeArray(input.websiteMode?.banners?.items, base.websiteMode.banners.items)
      },
      booking: {
        ...base.websiteMode.booking,
        ...(input.websiteMode?.booking || {}),
        helperSteps: safeArray(input.websiteMode?.booking?.helperSteps, base.websiteMode.booking.helperSteps)
      },
      profile: {
        ...base.websiteMode.profile,
        ...(input.websiteMode?.profile || {}),
        menuItems: safeArray(input.websiteMode?.profile?.menuItems, base.websiteMode.profile.menuItems)
      }
    }
  };
}

function bindSimpleInputs() {
  simpleBindings.forEach((binding) => {
    const element = document.getElementById(binding.id);
    if (!element || element.dataset.bound === 'true') return;
    element.addEventListener('input', () => {
      binding.set(element.value);
      markDirty();
    });
    element.dataset.bound = 'true';
  });
}

function syncSimpleInputs() {
  simpleBindings.forEach((binding) => {
    const element = document.getElementById(binding.id);
    if (!element) return;
    const nextValue = binding.get() ?? '';
    if (element.value !== nextValue) {
      element.value = nextValue;
    }
  });
}

function getItemFieldValue(spec, item, field) {
  if (spec.itemType === 'string') {
    return item;
  }
  return item?.[field.key] ?? '';
}

function setItemFieldValue(spec, items, index, field, value) {
  if (spec.itemType === 'string') {
    items[index] = value;
    return;
  }
  items[index][field.key] = value;
}

function renderField(spec, items, item, index, field) {
  if (field.type === 'checkbox') {
    const label = document.createElement('label');
    label.className = field.full ? 'checkbox-field full-row' : 'checkbox-field';

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = Boolean(getItemFieldValue(spec, item, field));
    input.addEventListener('change', () => {
      setItemFieldValue(spec, items, index, field, input.checked);
      markDirty();
    });

    const copy = document.createElement('div');
    copy.className = 'checkbox-copy';
    const title = document.createElement('strong');
    title.textContent = field.label;
    copy.appendChild(title);
    if (field.hint) {
      const hint = document.createElement('span');
      hint.textContent = field.hint;
      copy.appendChild(hint);
    }

    label.append(input, copy);
    return label;
  }

  const label = document.createElement('label');
  if (field.full) {
    label.classList.add('full-row');
  }

  const title = document.createElement('span');
  title.textContent = field.label;
  label.appendChild(title);

  const input = document.createElement(field.type === 'textarea' ? 'textarea' : 'input');
  if (field.type && field.type !== 'textarea') {
    input.type = field.type;
  }
  if (field.placeholder) {
    input.placeholder = field.placeholder;
  }
  input.value = getItemFieldValue(spec, item, field) ?? '';
  input.addEventListener('input', () => {
    setItemFieldValue(spec, items, index, field, input.value);
    markDirty();
    const heading = input.closest('.collection-card')?.querySelector('.collection-title');
    if (heading) {
      heading.textContent = spec.itemLabel(items[index], index);
    }
  });

  label.appendChild(input);
  return label;
}

function moveItem(items, index, direction) {
  const target = index + direction;
  if (target < 0 || target >= items.length) return;
  const next = items[index];
  items[index] = items[target];
  items[target] = next;
}

function renderCollection(spec) {
  const container = document.getElementById(spec.containerId);
  if (!container) return;

  const items = spec.getItems();
  const block = document.createElement('section');
  block.className = 'editor-block';

  const head = document.createElement('div');
  head.className = 'editor-head';

  const headingWrap = document.createElement('div');
  const heading = document.createElement('h3');
  heading.textContent = spec.title;
  const description = document.createElement('p');
  description.className = 'muted';
  description.textContent = spec.description;
  headingWrap.append(heading, description);

  const addButton = document.createElement('button');
  addButton.type = 'button';
  addButton.className = 'add-btn';
  addButton.textContent = spec.addLabel;
  addButton.addEventListener('click', () => {
    items.push(spec.createItem(items.length));
    renderCollection(spec);
    markDirty();
  });

  head.append(headingWrap, addButton);
  block.appendChild(head);

  const surface = document.createElement('div');
  surface.className = 'editor-surface';
  const list = document.createElement('div');
  list.className = 'collection-list';

  if (!items.length) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.textContent = 'No items yet. Add one from the top right.';
    surface.appendChild(empty);
  } else {
    items.forEach((item, index) => {
      const card = document.createElement('article');
      card.className = 'collection-card';

      const cardHead = document.createElement('div');
      cardHead.className = 'collection-card-head';

      const titleWrap = document.createElement('div');
      const title = document.createElement('h4');
      title.className = 'collection-title';
      title.textContent = spec.itemLabel(item, index);
      const subtitle = document.createElement('p');
      subtitle.className = 'collection-subtitle';
      subtitle.textContent = spec.itemSubtitle(item, index);
      titleWrap.append(title, subtitle);

      const actions = document.createElement('div');
      actions.className = 'card-actions';

      const upButton = document.createElement('button');
      upButton.type = 'button';
      upButton.className = 'mini-btn';
      upButton.textContent = 'Up';
      upButton.disabled = index === 0;
      upButton.addEventListener('click', () => {
        moveItem(items, index, -1);
        renderCollection(spec);
        markDirty();
      });

      const downButton = document.createElement('button');
      downButton.type = 'button';
      downButton.className = 'mini-btn';
      downButton.textContent = 'Down';
      downButton.disabled = index === items.length - 1;
      downButton.addEventListener('click', () => {
        moveItem(items, index, 1);
        renderCollection(spec);
        markDirty();
      });

      const removeButton = document.createElement('button');
      removeButton.type = 'button';
      removeButton.className = 'mini-btn';
      removeButton.textContent = 'Remove';
      removeButton.addEventListener('click', () => {
        items.splice(index, 1);
        renderCollection(spec);
        markDirty();
      });

      actions.append(upButton, downButton, removeButton);
      cardHead.append(titleWrap, actions);
      card.appendChild(cardHead);

      const fieldGrid = document.createElement('div');
      fieldGrid.className = 'collection-fields';
      spec.fields.forEach((field) => {
        fieldGrid.appendChild(renderField(spec, items, item, index, field));
      });
      card.appendChild(fieldGrid);
      list.appendChild(card);
    });

    surface.appendChild(list);
  }

  block.appendChild(surface);
  container.replaceChildren(block);
}

function renderCollections() {
  collectionSpecs.forEach(renderCollection);
}

function countItems(items) {
  return Array.isArray(items) ? items.length : 0;
}

function updateDashboard() {
  if (!state) return;

  const appTotal =
    countItems(state.appMode.tabs) +
    countItems(state.appMode.suggestions) +
    countItems(state.appMode.banners) +
    countItems(state.appMode.parcel?.top) +
    countItems(state.appMode.parcel?.mid) +
    countItems(state.appMode.parcel?.bottom) +
    countItems(state.appMode.parcel?.courier);

  const websiteTotal =
    countItems(state.websiteMode.navLinks) +
    countItems(state.websiteMode.services?.items) +
    countItems(state.websiteMode.banners?.items) +
    countItems(state.websiteMode.booking?.helperSteps) +
    countItems(state.websiteMode.profile?.menuItems);

  const profileTotal = Object.keys(state.shared?.profile || {}).length + countItems(state.appMode.profile?.details);

  if (appStatCount) appStatCount.textContent = String(appTotal);
  if (websiteStatCount) websiteStatCount.textContent = String(websiteTotal);
  if (profileStatCount) profileStatCount.textContent = String(profileTotal);
  if (appStatMeta) appStatMeta.textContent = `${countItems(state.appMode.tabs)} tabs, ${countItems(state.appMode.banners)} banners`;
  if (websiteStatMeta) websiteStatMeta.textContent = `${countItems(state.websiteMode.services?.items)} services, ${countItems(state.websiteMode.banners?.items)} banners`;
  if (profileStatMeta) profileStatMeta.textContent = `${state.shared?.profile?.name || 'Rider'} profile source`;
  if (studioHealthText) studioHealthText.textContent = isDirty ? 'Unsaved' : 'Ready';
}

function updateModePreview() {
  if (!state || !previewTitle || !previewBody || !previewEyebrow) return;

  if (activeMode === 'app') {
    previewEyebrow.textContent = 'App preview';
    previewTitle.textContent = state.appMode.brandTagline || 'Ride app';
    previewBody.textContent = `${countItems(state.appMode.suggestions)} home cards, ${countItems(state.appMode.parcel?.top) + countItems(state.appMode.parcel?.mid) + countItems(state.appMode.parcel?.bottom)} service cards, ${countItems(state.appMode.profile?.details)} profile rows.`;
    return;
  }

  previewEyebrow.textContent = 'Website preview';
  previewTitle.textContent = state.websiteMode.hero?.title || 'Website hero';
  previewBody.textContent = `${countItems(state.websiteMode.navLinks)} nav links, ${countItems(state.websiteMode.services?.items)} service cards, ${countItems(state.websiteMode.booking?.helperSteps)} booking helper steps.`;
}

function applyEditorSearch() {
  const query = (studioSearch?.value || '').trim().toLowerCase();
  const blocks = document.querySelectorAll('.mode-content .editor-block');

  blocks.forEach((block) => {
    if (!query) {
      block.classList.remove('search-hidden');
      return;
    }
    const haystack = block.textContent.toLowerCase();
    block.classList.toggle('search-hidden', !haystack.includes(query));
  });
}

function renderAll() {
  bindSimpleInputs();
  syncSimpleInputs();
  renderCollections();
  updateDashboard();
  updateModePreview();
  applyEditorSearch();
}

function setMode(mode) {
  activeMode = mode === 'website' ? 'website' : 'app';
  appModePanel.classList.toggle('hidden', activeMode !== 'app');
  websiteModePanel.classList.toggle('hidden', activeMode !== 'website');
  modeSummary.textContent =
    activeMode === 'app'
      ? 'Editing app-facing ride home, services, profile, and bottom-tab content.'
      : 'Editing website-facing hero, services, booking, banners, and profile content.';

  Array.from(modeTabs.querySelectorAll('[data-mode]')).forEach((button) => {
    button.classList.toggle('active', button.dataset.mode === activeMode);
  });
  updateModePreview();
  applyEditorSearch();
}

modeTabs.addEventListener('click', (event) => {
  const button = event.target.closest('[data-mode]');
  if (!button) return;
  setMode(button.dataset.mode);
});

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const adminId = loginAdminId.value.trim();
  const password = loginPassword.value;

  if (!adminId || !password) {
    setLoginStatus('Enter your admin ID and password.', true);
    return;
  }

  setLoginStatus('Signing in...');

  try {
    const data = await requestJson('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminId, password })
    });
    loginPassword.value = '';
    await loadStudio();
    showStudio(data.user);
  } catch (error) {
    setLoginStatus(error.message || 'Login failed', true);
  }
});

logoutBtn.addEventListener('click', async () => {
  try {
    await requestJson('/api/auth/logout', { method: 'POST' });
  } catch {}
  showLoginView();
  setLoginStatus('Signed out.');
});

saveBtn.addEventListener('click', async () => {
  try {
    await requestJson('/api/config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state)
    });
    isDirty = false;
    updateDashboard();
    setStatus('Saved. App Mode and Website Mode are updated.');
  } catch (error) {
    setStatus(error.message || 'Save failed', true);
  }
});

resetBtn.addEventListener('click', async () => {
  try {
    const nextDefault = await requestJson('/api/default-config');
    defaultState = mergeState(nextDefault, nextDefault);
    state = clone(defaultState);
    isDirty = true;
    renderAll();
    setStatus('Reset to default values. Save to apply them.');
  } catch (error) {
    setStatus(error.message || 'Reset failed', true);
  }
});

exportBtn.addEventListener('click', () => {
  try {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'rydex-studio-config.json';
    link.click();
    URL.revokeObjectURL(url);
    setStatus('Config exported.');
  } catch (error) {
    setStatus(error.message || 'Export failed', true);
  }
});

studioSearch?.addEventListener('input', applyEditorSearch);

clearSearchBtn?.addEventListener('click', () => {
  if (!studioSearch) return;
  studioSearch.value = '';
  applyEditorSearch();
});

importBtn?.addEventListener('click', () => {
  importFile?.click();
});

importFile?.addEventListener('change', async () => {
  const [file] = importFile.files || [];
  if (!file) return;

  try {
    const parsed = JSON.parse(await file.text());
    state = mergeState(parsed, defaultState || parsed);
    isDirty = true;
    renderAll();
    setMode(activeMode);
    setStatus('Imported JSON. Review it, then save changes.');
  } catch (error) {
    setStatus(error.message || 'Import failed', true);
  } finally {
    importFile.value = '';
  }
});

window.addEventListener('beforeunload', (event) => {
  if (!isDirty) return;
  event.preventDefault();
  event.returnValue = '';
});

(async function init() {
  try {
    const session = await requestJson('/api/session');
    if (!session.authenticated) {
      showLoginView();
      setLoginStatus('Enter your Studio credentials.');
      return;
    }
    await loadStudio();
    showStudio(session.user);
  } catch (error) {
    showLoginView();
    setLoginStatus(error.message || 'Failed to load Studio session', true);
  }
})();
