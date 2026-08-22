/* CodeTantra Popup Blocker — content script
 * Runs on codetantra.com pages (including the course-content iframe).
 * Detects the SensAI assistant popups and hides them reversibly, so
 * turning the extension off instantly restores everything — no refresh.
 */

(function () {
  const STORAGE_KEY = 'ctblocker_settings';
  const DEFAULTS = { enabled: true, customSelectors: '', theme: 'auto' };
  const isTopFrame = window === window.top;

  const KEYWORDS = [
    'codetantra sensai',
    'assisting ',
    "ask about this question, your code or tests",
    "i'll walk you through step by step",
    'ask about your code, this question, or tests',
    'are you stuck',
    "you've been idle",
    "you have been idle",
    'yes, help me move forward',
    "no, i'm just thinking",
    'want some help'
  ];

  const EXACT_RULES = [
    {
      name: 'mascot-and-speech-bubble',
      selector: '.neodrag',
      validate: (el) =>
        !!el.querySelector(
          'button[title*="SensAI" i], img[src*="solidplasma/lms/assets"]'
        ),
    },
    {
      name: 'ai-tools-strip',
      selector: '.ai-tools-strip',
      validate: (el) => el.getAttribute('aria-label') === 'Question tools',
    },
    {
      name: 'assistant-chat-dialog',
      selector: 'div[role="dialog"]',
      validate: (el) => {
        const t = (el.innerText || '').toLowerCase();
        return (
          t.includes('sensai') ||
          t.includes('assisting') ||
          !!el.querySelector('textarea[placeholder*="Ask about your code" i]')
        );
      },
    },
    {
      name: 'mcq-choice-helper-dock',
      selector: '.mcq-dock-wrap, .mcq-dock',
      validate: () => true,
    },
  ];

  let settings = { ...DEFAULTS };
  let hiddenElements = new Set();
  const childCounts = new Map(); // top frame only: child window -> its count

  function getStorage() {
    return new Promise((resolve) => {
      chrome.storage.local.get([STORAGE_KEY], (res) => {
        resolve({ ...DEFAULTS, ...(res[STORAGE_KEY] || {}) });
      });
    });
  }

  function textOf(el) {
    return (el.innerText || el.textContent || '').trim().toLowerCase();
  }

  function looksLikeMatch(el) {
    const t = textOf(el);
    if (!t || t.length > 4000) return false;
    return KEYWORDS.some((k) => t.includes(k));
  }

  function findContainerToHide(el) {
    let node = el;
    let best = el;
    for (let i = 0; i < 8 && node && node !== document.body; i++) {
      const style = window.getComputedStyle(node);
      const rect = node.getBoundingClientRect();
      const isPositioned = style.position === 'fixed' || style.position === 'absolute';
      const isReasonablySized = rect.width > 40 && rect.height > 40 && rect.width < window.innerWidth * 0.95;
      if (isPositioned && isReasonablySized) best = node;
      node = node.parentElement;
    }
    return best;
  }

  function findBackdropSibling(container) {
    const parent = container.parentElement;
    if (!parent) return null;
    for (const sib of parent.children) {
      if (sib === container) continue;
      const style = window.getComputedStyle(sib);
      const rect = sib.getBoundingClientRect();
      const coversScreen = rect.width >= window.innerWidth * 0.8 && rect.height >= window.innerHeight * 0.8;
      const looksLikeBackdrop = (style.position === 'fixed' || style.position === 'absolute') && coversScreen;
      if (looksLikeBackdrop) return sib;
    }
    return null;
  }

  function broadcastCount() {
    if (!isTopFrame) {
      try {
        window.parent.postMessage({ __ctblocker: true, type: 'count', count: hiddenElements.size }, '*');
      } catch (e) {}
    }
  }

  function totalHiddenCount() {
    let total = hiddenElements.size;
    if (isTopFrame) {
      for (const c of childCounts.values()) total += c;
    }
    return total;
  }

  function hideElement(el) {
    if (!el || el.dataset.ctblockerHidden) return;
    el.style.setProperty('display', 'none', 'important');
    el.dataset.ctblockerHidden = 'true';
    hiddenElements.add(el);
    broadcastCount();
  }

  function showElement(el) {
    if (!el.dataset.ctblockerHidden) return;
    el.style.removeProperty('display');
    delete el.dataset.ctblockerHidden;
    hiddenElements.delete(el);
  }

  function restoreAll() {
    for (const el of Array.from(hiddenElements)) showElement(el);
    broadcastCount();
  }

  function applyCustomSelectors() {
    if (!settings.customSelectors) return;
    const selectors = settings.customSelectors.split('\n').map((s) => s.trim()).filter(Boolean);
    for (const sel of selectors) {
      try {
        document.querySelectorAll(sel).forEach(hideElement);
      } catch (e) {}
    }
  }

  function applyExactRules(root) {
    const scope = root || document;
    for (const rule of EXACT_RULES) {
      let matches;
      try {
        matches = scope.querySelectorAll(rule.selector);
      } catch (e) {
        continue;
      }
      for (const el of matches) {
        if (el.dataset.ctblockerHidden) continue;
        if (rule.validate(el)) hideElement(el);
      }
    }
  }

  function scan(root) {
    if (!settings.enabled) return;
    const scope = root || document.body;
    if (!scope) return;

    applyExactRules(scope === document.body ? document : scope);

    const candidates = scope.querySelectorAll('div, section, aside, article');
    for (const el of candidates) {
      if (el.dataset.ctblockerHidden) continue;
      if (el.children.length > 60) continue;
      if (looksLikeMatch(el)) {
        const container = findContainerToHide(el);
        hideElement(container);
        const backdrop = findBackdropSibling(container);
        if (backdrop) hideElement(backdrop);
      }
    }
    applyCustomSelectors();
  }

  function detectPageTheme() {
    try {
      const bodyStyle = window.getComputedStyle(document.body);
      const bg = bodyStyle.backgroundColor;
      const match = bg.match(/\d+/g);
      if (match && match.length >= 3) {
        const [r, g, b] = match.map(Number);
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        const theme = luminance < 0.5 ? 'dark' : 'light';
        chrome.storage.local.set({ ctblocker_page_theme: theme });
      }
    } catch (e) {}
  }

  let scheduled = false;
  function scheduleScan() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      scan();
    });
  }

  async function init() {
    settings = await getStorage();
    detectPageTheme();
    scan();

    if (isTopFrame) {
      window.addEventListener('message', (event) => {
        const data = event.data;
        if (data && data.__ctblocker && data.type === 'count') {
          childCounts.set(event.source, data.count);
        }
      });
    }

    const observer = new MutationObserver((mutations) => {
      let shouldScan = false;
      for (const m of mutations) {
        if (m.addedNodes && m.addedNodes.length) {
          shouldScan = true;
          break;
        }
      }
      if (shouldScan) scheduleScan();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });

    setInterval(() => {
      if (settings.enabled) scan();
    }, 2000);

    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'local' && changes[STORAGE_KEY]) {
        const wasEnabled = settings.enabled;
        settings = { ...DEFAULTS, ...changes[STORAGE_KEY].newValue };
        if (!settings.enabled && wasEnabled) {
          restoreAll();
        } else if (settings.enabled) {
          scan();
        }
      }
    });

    chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
      if (msg && msg.type === 'ctblocker_get_status') {
        if (isTopFrame) sendResponse({ hiddenCount: totalHiddenCount(), enabled: settings.enabled });
        return false;
      }
      if (msg && msg.type === 'ctblocker_rescan') {
        scan();
        if (isTopFrame) sendResponse({ hiddenCount: totalHiddenCount() });
        return false;
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
