/* CodeTantra Popup Blocker — content script
 * Runs on codetantra.com pages. Detects the SensAI assistant popups
 * ("Assisting <name>", "Are you stuck?", idle nag, etc.) and hides them.
 *
 * Detection is text-based (not tied to fragile class names), so it should
 * keep working even if CodeTantra changes their CSS. If a popup ever slips
 * through, open the extension popup and add its text or a CSS selector to
 * the "Custom rules" box — no code changes needed.
 */

(function () {
  const STORAGE_KEY = 'ctblocker_settings';
  const DEFAULTS = { enabled: true, customSelectors: '', theme: 'auto' };

  // Phrases seen in the SensAI popups. Matched case-insensitively against
  // the visible text of small-ish containers.
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

  // Exact rules built from real outerHTML the user inspected on the page.
  // Each rule hides every element matching `selector` that also passes
  // `validate` (a cheap sanity check so we never nuke an unrelated element
  // that happens to share a class/attribute).
  const EXACT_RULES = [
    {
      name: 'mascot-and-speech-bubble',
      // The floating draggable widget: mascot gif + whatever bubble is
      // currently attached to it (idle nag, tips, etc). Always hidden.
      selector: '.neodrag',
      validate: (el) =>
        !!el.querySelector(
          'button[title*="SensAI" i], img[src*="solidplasma/lms/assets"]'
        ),
    },
    {
      name: 'ai-tools-strip',
      // Vertical Summarize/Explain/Visualize/Concepts/Resources/Highlights toolbar
      selector: '.ai-tools-strip',
      validate: (el) => el.getAttribute('aria-label') === 'Question tools',
    },
    {
      name: 'assistant-chat-dialog',
      // The big "Assisting <name>" chat panel (auto-opens on submit /
      // next-question / manual click alike).
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
      // Simplify / Elaborate / Hint / 50-50 / Clear toolbar on MCQs.
      selector: '.mcq-dock-wrap, .mcq-dock',
      validate: () => true,
    },
  ];

  let settings = { ...DEFAULTS };
  let hiddenCount = 0;

  function log(...args) {
    // Uncomment for debugging:
    // console.log('[CTBlocker]', ...args);
  }

  function getStorage() {
    return new Promise((resolve) => {
      chrome.storage.sync.get([STORAGE_KEY], (res) => {
        resolve({ ...DEFAULTS, ...(res[STORAGE_KEY] || {}) });
      });
    });
  }

  function textOf(el) {
    return (el.innerText || el.textContent || '').trim().toLowerCase();
  }

  function looksLikeMatch(el) {
    const t = textOf(el);
    if (!t || t.length > 4000) return false; // skip huge page containers
    return KEYWORDS.some((k) => t.includes(k));
  }

  // Walk up from a matched element to find the smallest reasonable
  // "card" / overlay wrapper to hide, rather than hiding a single <span>.
  function findContainerToHide(el) {
    let node = el;
    let best = el;
    for (let i = 0; i < 8 && node && node !== document.body; i++) {
      const style = window.getComputedStyle(node);
      const rect = node.getBoundingClientRect();
      const isPositioned = style.position === 'fixed' || style.position === 'absolute';
      const isReasonablySized = rect.width > 40 && rect.height > 40 && rect.width < window.innerWidth * 0.95;
      if (isPositioned && isReasonablySized) {
        best = node;
      }
      node = node.parentElement;
    }
    return best;
  }

  function findBackdropSibling(container) {
    // Some modal libraries render a full-screen semi-transparent backdrop
    // as a sibling just before/after the modal card. Hide it too so the
    // page isn't left unclickable.
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

  function hideElement(el) {
    if (!el || el.dataset.ctblockerHidden) return;
    el.style.setProperty('display', 'none', 'important');
    el.dataset.ctblockerHidden = 'true';
    hiddenCount++;
    log('hid element', el);
  }

  function applyCustomSelectors() {
    if (!settings.customSelectors) return;
    const selectors = settings.customSelectors
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    for (const sel of selectors) {
      try {
        document.querySelectorAll(sel).forEach(hideElement);
      } catch (e) {
        // invalid selector, ignore
      }
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
      if (el.children.length > 60) continue; // skip huge page-level containers
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
    } catch (e) {
      // ignore
    }
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

    // Fallback periodic sweep in case a popup fades in via style changes
    // rather than being freshly added to the DOM.
    setInterval(() => {
      if (settings.enabled) scan();
    }, 2000);

    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'sync' && changes[STORAGE_KEY]) {
        settings = { ...DEFAULTS, ...changes[STORAGE_KEY].newValue };
        if (settings.enabled) scan();
      }
    });

    chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
      if (msg && msg.type === 'ctblocker_get_status') {
        sendResponse({ hiddenCount, enabled: settings.enabled });
      }
      if (msg && msg.type === 'ctblocker_rescan') {
        scan();
        sendResponse({ hiddenCount });
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
