const STORAGE_KEY = 'ctblocker_settings';
const DEFAULTS = { enabled: true, customSelectors: '', theme: 'auto' };

const enabledToggle = document.getElementById('enabledToggle');
const themeOptions = document.getElementById('themeOptions');
const statusText = document.getElementById('statusText');
const hiddenCountEl = document.getElementById('hiddenCount');
const rescanBtn = document.getElementById('rescan');

function getSettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.get([STORAGE_KEY], (res) => {
      resolve({ ...DEFAULTS, ...(res[STORAGE_KEY] || {}) });
    });
  });
}

function saveSettings(partial) {
  return getSettings().then((current) => {
    const next = { ...current, ...partial };
    return new Promise((resolve) => {
      chrome.storage.sync.set({ [STORAGE_KEY]: next }, () => resolve(next));
    });
  });
}

function applyThemeToDocument(theme) {
  if (theme === 'auto') {
    chrome.storage.local.get(['ctblocker_page_theme'], (res) => {
      const resolved = res.ctblocker_page_theme || 'dark';
      document.documentElement.setAttribute('data-theme', resolved);
    });
  } else {
    document.documentElement.setAttribute('data-theme', theme);
  }
}

function highlightThemeButton(theme) {
  [...themeOptions.children].forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.theme === theme);
  });
}

async function getActiveTab() {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => resolve(tabs[0]));
  });
}

async function refreshStatus() {
  const tab = await getActiveTab();
  if (!tab || !tab.id) return;
  chrome.tabs.sendMessage(tab.id, { type: 'ctblocker_get_status' }, (res) => {
    if (chrome.runtime.lastError) {
      statusText.textContent = 'Open a CodeTantra page to activate';
      hiddenCountEl.textContent = '—';
      return;
    }
    if (res) {
      hiddenCountEl.textContent = `${res.hiddenCount} popup${res.hiddenCount === 1 ? '' : 's'} blocked this session`;
      statusText.textContent = res.enabled
        ? 'Hides "Are you stuck?" and assistant popups'
        : 'Currently paused';
    }
  });
}

async function init() {
  const settings = await getSettings();
  enabledToggle.checked = settings.enabled;
  applyThemeToDocument(settings.theme);
  highlightThemeButton(settings.theme);
  refreshStatus();
}

enabledToggle.addEventListener('change', async () => {
  await saveSettings({ enabled: enabledToggle.checked });
  refreshStatus();
});

themeOptions.addEventListener('click', async (e) => {
  const btn = e.target.closest('.theme-btn');
  if (!btn) return;
  const theme = btn.dataset.theme;
  await saveSettings({ theme });
  applyThemeToDocument(theme);
  highlightThemeButton(theme);
});

rescanBtn.addEventListener('click', async () => {
  const tab = await getActiveTab();
  if (!tab || !tab.id) return;
  chrome.tabs.sendMessage(tab.id, { type: 'ctblocker_rescan' }, () => refreshStatus());
});

init();
