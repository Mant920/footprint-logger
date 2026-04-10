// ── API Client ─────────────────────────────────────────────────────────────
const API = {
  base: '/api',

  getToken() { return localStorage.getItem('fp_token'); },
  setToken(t) { localStorage.setItem('fp_token', t); },
  clearToken() { localStorage.removeItem('fp_token'); localStorage.removeItem('fp_user'); },

  getUser() {
    try { return JSON.parse(localStorage.getItem('fp_user')); } catch { return null; }
  },
  setUser(u) { localStorage.setItem('fp_user', JSON.stringify(u)); },

  isLoggedIn() { return !!this.getToken(); },

  async request(path, options = {}) {
    const token = this.getToken();
    const res = await fetch(this.base + path, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers
      },
      credentials: 'include',
      ...options,
      body: options.body ? JSON.stringify(options.body) : undefined
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Request failed');
    return data;
  },

  auth: {
    register: (body) => API.request('/auth/register', { method: 'POST', body }),
    login:    (body) => API.request('/auth/login',    { method: 'POST', body }),
    logout:   ()     => API.request('/auth/logout',   { method: 'POST' }),
    me:       ()     => API.request('/auth/me')
  },

  activities: {
    list:   (params = {}) => API.request('/activities?' + new URLSearchParams(params)),
    create: (body)        => API.request('/activities', { method: 'POST', body }),
    delete: (id)          => API.request(`/activities/${id}`, { method: 'DELETE' }),
    stats:  ()            => API.request('/activities/stats/summary')
  },

  users: {
    profile: ()     => API.request('/users/profile'),
    setGoal: (body) => API.request('/users/goal', { method: 'PATCH', body })
  }
};

// ── Toast Notifications ─────────────────────────────────────────────────────
const Toast = {
  container: null,
  init() {
    this.container = document.createElement('div');
    this.container.className = 'toast-container';
    document.body.appendChild(this.container);
  },
  show(message, type = 'success', duration = 3500) {
    if (!this.container) this.init();
    const icons = { success: '✓', error: '✕' };
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<span>${icons[type] || '●'}</span><span>${message}</span>`;
    this.container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },
  success: (m) => Toast.show(m, 'success'),
  error:   (m) => Toast.show(m, 'error')
};

// ── Activity Presets ────────────────────────────────────────────────────────
const ACTIVITIES = {
  transport: [
    { name: 'Car trip (petrol)',    co2: 0.21, unit: 'km',    icon: '🚗' },
    { name: 'Car trip (diesel)',    co2: 0.17, unit: 'km',    icon: '🚗' },
    { name: 'Motorbike',           co2: 0.11, unit: 'km',    icon: '🏍' },
    { name: 'Bus journey',         co2: 0.09, unit: 'km',    icon: '🚌' },
    { name: 'Train journey',       co2: 0.04, unit: 'km',    icon: '🚆' },
    { name: 'Short-haul flight',   co2: 255,  unit: 'trip',  icon: '✈️' },
    { name: 'Long-haul flight',    co2: 995,  unit: 'trip',  icon: '✈️' },
  ],
  food: [
    { name: 'Beef meal',           co2: 6.6,  unit: 'meal',  icon: '🥩' },
    { name: 'Pork meal',           co2: 2.4,  unit: 'meal',  icon: '🍖' },
    { name: 'Chicken meal',        co2: 1.5,  unit: 'meal',  icon: '🍗' },
    { name: 'Fish meal',           co2: 1.0,  unit: 'meal',  icon: '🐟' },
    { name: 'Vegetarian meal',     co2: 0.5,  unit: 'meal',  icon: '🥗' },
    { name: 'Vegan meal',          co2: 0.3,  unit: 'meal',  icon: '🌱' },
    { name: 'Dairy (milk/cheese)', co2: 2.1,  unit: 'day',   icon: '🧀' },
  ],
  energy: [
    { name: 'Electricity use',     co2: 0.23, unit: 'kWh',   icon: '⚡' },
    { name: 'Natural gas',         co2: 0.18, unit: 'kWh',   icon: '🔥' },
    { name: 'Home heating (oil)',   co2: 0.25, unit: 'kWh',   icon: '🏠' },
    { name: 'Streaming video',     co2: 0.036,unit: 'hour',  icon: '📺' },
    { name: 'AC / air con',        co2: 0.9,  unit: 'hour',  icon: '❄️' },
  ],
  other: [
    { name: 'Online shopping delivery', co2: 0.5, unit: 'parcel', icon: '📦' },
    { name: 'New clothing item',        co2: 5.5, unit: 'item',   icon: '👕' },
    { name: 'Smartphone usage',         co2: 0.008, unit: 'hour', icon: '📱' },
  ]
};

// ── Category colors for charts ──────────────────────────────────────────────
const CAT_COLORS = {
  transport: '#48cae4',
  food:      '#f4a261',
  energy:    '#52b788',
  other:     '#6b8f71'
};

// ── Format helpers ──────────────────────────────────────────────────────────
function fmtCO2(kg) {
  if (kg >= 1000) return (kg / 1000).toFixed(2) + ' t';
  if (kg >= 100)  return Math.round(kg) + ' kg';
  return kg.toFixed(1) + ' kg';
}
function fmtDate(d) {
  return new Date(d).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' });
}
function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

// ── Auth guard ──────────────────────────────────────────────────────────────
function requireAuth() {
  if (!API.isLoggedIn()) {
    window.location.href = '/login';
    return false;
  }
  return true;
}
function redirectIfLoggedIn() {
  if (API.isLoggedIn()) window.location.href = '/dashboard';
}

// ── Logout helper ───────────────────────────────────────────────────────────
async function logout() {
  try { await API.auth.logout(); } catch {}
  API.clearToken();
  window.location.href = '/';
}

// Apply logout to any [data-logout] elements after DOM ready
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-logout]').forEach(el => {
    el.addEventListener('click', (e) => { e.preventDefault(); logout(); });
  });
  Toast.init();
});
