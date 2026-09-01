import './style.css';
import { CalculatorEngine } from './calculator';

const calc = new CalculatorEngine();

const mainDisplay = document.getElementById('main-display') as HTMLDivElement;
const historyDisplay = document.getElementById('history-display') as HTMLDivElement;
const displayContainer = document.getElementById('display-container') as HTMLElement;
const copyToast = document.getElementById('copy-toast') as HTMLDivElement;
const memoryIndicator = document.getElementById('memory-indicator') as HTMLSpanElement;
const angleBadge = document.getElementById('angle-badge') as HTMLSpanElement;
const angleBtnText = document.getElementById('angle-btn-text') as HTMLSpanElement;
const parenBadge = document.getElementById('paren-badge') as HTMLSpanElement;
const closeParenBtn = document.getElementById('close-paren-btn') as HTMLButtonElement;
const mcBtn = document.getElementById('mc-btn') as HTMLButtonElement;
const mrBtn = document.getElementById('mr-btn') as HTMLButtonElement;
const modeToggleBtn = document.getElementById('mode-toggle') as HTMLButtonElement;
const historyBtn = document.getElementById('history-btn') as HTMLButtonElement;
const historyModal = document.getElementById('history-modal') as HTMLDialogElement;
const closeHistoryBtn = document.getElementById('close-history-btn') as HTMLButtonElement;
const clearHistoryBtn = document.getElementById('clear-history-btn') as HTMLButtonElement;
const historyList = document.getElementById('history-list') as HTMLDivElement;
const soundToggleBtn = document.getElementById('sound-toggle') as HTMLButtonElement;
const themeToggleBtn = document.getElementById('theme-toggle') as HTMLButtonElement;
const aboutBtn = document.getElementById('about-btn') as HTMLButtonElement;
const aboutModal = document.getElementById('about-modal') as HTMLDialogElement;
const closeAboutBtn = document.getElementById('close-about-btn') as HTMLButtonElement;

// Load Persisted History
try {
  const savedHistory = localStorage.getItem('calc-history');
  if (savedHistory) {
    calc.loadHistory(JSON.parse(savedHistory));
  }
} catch {
  // Ignore parse errors
}

const SCIENTIFIC_ICON_SVG = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M3 21h18L3 3v18z"/>
  <path d="M7 21v-3"/>
  <path d="M11 21v-2"/>
  <path d="M15 21v-3"/>
  <path d="M3 11h2"/>
  <path d="M3 15h3"/>
  <path d="M3 7h3"/>
</svg>`;

const BASIC_ICON_SVG = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <rect x="4" y="2" width="16" height="20" rx="2"/>
  <line x1="8" y1="6" x2="16" y2="6"/>
  <line x1="16" y1="14" x2="16" y2="18"/>
  <path d="M16 10h.01"/>
  <path d="M12 10h.01"/>
  <path d="M8 10h.01"/>
  <path d="M12 14h.01"/>
  <path d="M8 14h.01"/>
  <path d="M12 18h.01"/>
  <path d="M8 18h.01"/>
</svg>`;

const SOUND_ON_SVG = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
  <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
  <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
</svg>`;

const SOUND_OFF_SVG = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
  <line x1="23" y1="9" x2="17" y2="15"/>
  <line x1="17" y1="9" x2="23" y2="15"/>
</svg>`;

const SUN_ICON_SVG = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="12" cy="12" r="4"/>
  <path d="M12 2v2"/>
  <path d="M12 20v2"/>
  <path d="m4.93 4.93 1.41 1.41"/>
  <path d="m17.66 17.66 1.41 1.41"/>
  <path d="M2 12h2"/>
  <path d="M20 12h2"/>
  <path d="m6.34 17.66-1.41 1.41"/>
  <path d="m19.07 4.93-1.41 1.41"/>
</svg>`;

const MOON_ICON_SVG = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
</svg>`;

const RETRO_ICON_SVG = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <rect x="4" y="2" width="16" height="20" rx="2"/>
  <line x1="8" y1="6" x2="16" y2="6"/>
  <circle cx="8" cy="11" r="1"/><circle cx="12" cy="11" r="1"/><circle cx="16" cy="11" r="1"/>
  <circle cx="8" cy="15" r="1"/><circle cx="12" cy="15" r="1"/><circle cx="16" cy="15" r="1"/>
  <circle cx="8" cy="19" r="1"/><circle cx="12" cy="19" r="1"/><circle cx="16" cy="19" r="1"/>
</svg>`;

const OLED_ICON_SVG = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
</svg>`;

const CYBERPUNK_ICON_SVG = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
</svg>`;

interface ThemeConfig {
  id: string;
  name: string;
  icon: string;
}

const THEMES: ThemeConfig[] = [
  { id: 'dark', name: 'Modern Dark', icon: SUN_ICON_SVG },
  { id: 'retro', name: 'Vintage 80s LCD', icon: RETRO_ICON_SVG },
  { id: 'light', name: 'Modern Light', icon: MOON_ICON_SVG },
  { id: 'oled', name: 'OLED Midnight', icon: OLED_ICON_SVG },
  { id: 'cyberpunk', name: 'Cyberpunk Neon', icon: CYBERPUNK_ICON_SVG }
];

// Mode State Management (Basic vs Scientific)
let currentMode = localStorage.getItem('calc-mode') || 'basic';
document.documentElement.setAttribute('data-mode', currentMode);

// Theme State Management
let currentTheme = localStorage.getItem('calc-theme') || 'dark';
document.documentElement.setAttribute('data-theme', currentTheme);

// Sound State Management
let soundEnabled = localStorage.getItem('calc-sound') !== 'off';

// Web Audio API Key Click Synthesizer
let audioCtx: AudioContext | null = null;

function playKeySound(): void {
  if (!soundEnabled) return;
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!audioCtx && AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
    if (audioCtx) {
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(900, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(140, audioCtx.currentTime + 0.03);

      gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.03);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.03);
    }
  } catch {
    // AudioContext ignored gracefully
  }
}

function triggerHaptic(): void {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(10);
    } catch {
      // Haptics ignored gracefully
    }
  }
}

// Toast Feedback Helper
let copyToastTimeout: number | undefined;

function showToast(msg: string): void {
  if (!copyToast) return;
  copyToast.textContent = msg;
  copyToast.classList.add('visible');
  if (copyToastTimeout) clearTimeout(copyToastTimeout);
  copyToastTimeout = window.setTimeout(() => {
    copyToast.classList.remove('visible');
  }, 1400);
}

function updateUI(): void {
  const state = calc.getState();
  mainDisplay.textContent = state.currentValue;

  // Dynamically shrink text if input is very long
  if (state.currentValue.length > 16) {
    mainDisplay.style.fontSize = '22px';
  } else if (state.currentValue.length > 13) {
    mainDisplay.style.fontSize = '28px';
  } else if (state.currentValue.length > 10) {
    mainDisplay.style.fontSize = '34px';
  } else {
    mainDisplay.style.fontSize = '38px';
  }

  if (state.expression) {
    historyDisplay.textContent = state.expression;
  } else if (state.previousValue !== null && state.operator !== null) {
    historyDisplay.textContent = `${state.previousValue} ${state.operator}`;
  } else if (state.history.length > 0) {
    historyDisplay.textContent = state.history[0];
  } else {
    historyDisplay.textContent = '';
  }

  // Memory UI state
  const hasMemory = state.memory !== null;
  if (memoryIndicator) {
    memoryIndicator.style.opacity = hasMemory ? '1' : '0';
  }
  if (mcBtn) mcBtn.disabled = !hasMemory;
  if (mrBtn) mrBtn.disabled = !hasMemory;

  // Parentheses Level Indicator & Close Button State
  const depth = state.parenthesesDepth;
  if (parenBadge) {
    parenBadge.textContent = depth > 1 ? `(${depth})` : `( )`;
    parenBadge.style.display = depth > 0 ? 'inline-block' : 'none';
  }
  if (closeParenBtn) {
    closeParenBtn.disabled = depth === 0;
  }

  // Scientific Mode UI state
  if (angleBadge) {
    angleBadge.textContent = state.angleMode.toUpperCase();
    angleBadge.style.display = currentMode === 'scientific' ? 'inline-block' : 'none';
  }
  if (angleBtnText) {
    angleBtnText.textContent = state.angleMode === 'deg' ? 'RAD' : 'DEG';
  }

  // Header Mode Toggle Icon (Shows Basic icon when in scientific, Scientific icon when in basic)
  if (modeToggleBtn) {
    if (currentMode === 'scientific') {
      modeToggleBtn.innerHTML = BASIC_ICON_SVG;
      modeToggleBtn.title = 'Switch to Basic Mode';
      modeToggleBtn.setAttribute('aria-label', 'Switch to Basic Mode');
    } else {
      modeToggleBtn.innerHTML = SCIENTIFIC_ICON_SVG;
      modeToggleBtn.title = 'Switch to Scientific Mode';
      modeToggleBtn.setAttribute('aria-label', 'Switch to Scientific Mode');
    }
  }

  // Header Sound Toggle Icon
  if (soundToggleBtn) {
    soundToggleBtn.innerHTML = soundEnabled ? SOUND_ON_SVG : SOUND_OFF_SVG;
    soundToggleBtn.title = soundEnabled ? 'Mute Key Sound' : 'Enable Key Sound';
    soundToggleBtn.setAttribute('aria-label', soundEnabled ? 'Mute Key Sound' : 'Enable Key Sound');
  }

  // Header Theme Toggle Icon
  if (themeToggleBtn) {
    const activeTheme = THEMES.find((t) => t.id === currentTheme) || THEMES[0];
    themeToggleBtn.innerHTML = activeTheme.icon;
    themeToggleBtn.title = `Theme: ${activeTheme.name} (Click to change)`;
    themeToggleBtn.setAttribute('aria-label', `Theme: ${activeTheme.name}`);
  }

  // Persist History
  try {
    localStorage.setItem('calc-history', JSON.stringify(state.history));
  } catch {
    // Ignore storage quota errors
  }
}

function renderHistoryList(): void {
  if (!historyList) return;
  const state = calc.getState();
  if (state.history.length === 0) {
    historyList.innerHTML = `
      <div class="history-empty">
        <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
        <span>No calculations yet</span>
      </div>
    `;
    return;
  }

  historyList.innerHTML = '';
  state.history.forEach((item, index) => {
    const parts = item.split('=');
    const eq = parts[0]?.trim() || item;
    const res = parts[1]?.trim() || '';

    const wrapperEl = document.createElement('div');
    wrapperEl.className = 'history-item-wrapper';

    wrapperEl.innerHTML = `
      <div class="history-item-delete-bg">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
        </svg>
      </div>
      <div class="history-item" title="Click to use result, or swipe left to delete">
        <button class="history-item-del-btn" title="Delete calculation" aria-label="Delete calculation">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
        <div class="history-item-body">
          <span class="history-item-eq">${eq} =</span>
          <span class="history-item-res">${res || eq}</span>
        </div>
      </div>
    `;

    const itemEl = wrapperEl.querySelector('.history-item') as HTMLElement;
    const delBtn = wrapperEl.querySelector('.history-item-del-btn') as HTMLElement;

    const performDelete = () => {
      triggerHaptic();
      playKeySound();
      wrapperEl.classList.add('deleting');
      setTimeout(() => {
        calc.deleteHistoryItem(index);
        updateUI();
        renderHistoryList();
      }, 220);
    };

    // Click delete button
    delBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      performDelete();
    });

    // Click body to load calculation
    itemEl.addEventListener('click', () => {
      triggerHaptic();
      playKeySound();
      const targetVal = res || eq;
      calc.clearAll();
      for (const char of targetVal) {
        if (char >= '0' && char <= '9') {
          calc.inputDigit(char);
        } else if (char === '.') {
          calc.inputDecimal();
        } else if (char === '-') {
          calc.toggleSign();
        }
      }
      updateUI();
      historyModal.close();
      showToast('Loaded: ' + targetVal);
    });

    // Touch Swipe-to-Delete Handling (Mobile)
    let startX = 0;
    let startY = 0;
    let currentDeltaX = 0;
    let isSwiping = false;

    itemEl.addEventListener('touchstart', (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      currentDeltaX = 0;
      isSwiping = false;
    }, { passive: true });

    itemEl.addEventListener('touchmove', (e: TouchEvent) => {
      const touch = e.touches[0];
      const diffX = touch.clientX - startX;
      const diffY = touch.clientY - startY;

      if (!isSwiping && Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 8) {
        isSwiping = true;
      }

      if (isSwiping && diffX < 0) {
        currentDeltaX = diffX;
        itemEl.classList.add('swiping');
        itemEl.style.transform = `translateX(${Math.max(diffX, -100)}px)`;
      }
    }, { passive: true });

    itemEl.addEventListener('touchend', () => {
      itemEl.classList.remove('swiping');
      if (isSwiping && currentDeltaX < -60) {
        itemEl.style.transform = 'translateX(-100%)';
        performDelete();
      } else {
        itemEl.style.transform = 'translateX(0)';
      }
      isSwiping = false;
      currentDeltaX = 0;
    });

    historyList.appendChild(wrapperEl);
  });
}

// Button Click Handling for Keypads and Memory Bar
document.querySelector('.calculator-card')?.addEventListener('click', (e) => {
  const target = (e.target as HTMLElement).closest('button');
  if (!target) return;

  const digit = target.getAttribute('data-digit');
  const action = target.getAttribute('data-action');

  if (digit !== null) {
    triggerHaptic();
    playKeySound();
    calc.inputDigit(digit);
  } else if (action) {
    triggerHaptic();
    playKeySound();
    handleAction(action);
  }

  updateUI();
});

function handleAction(action: string): void {
  switch (action) {
    case 'clear':
      calc.clearAll();
      break;
    case 'clear-entry':
      calc.clearEntry();
      break;
    case 'toggle-sign':
      calc.toggleSign();
      break;
    case 'percent':
      calc.percentage();
      break;
    case 'divide':
      calc.setOperator('÷');
      break;
    case 'multiply':
      calc.setOperator('×');
      break;
    case 'subtract':
      calc.setOperator('-');
      break;
    case 'add':
      calc.setOperator('+');
      break;
    case 'decimal':
      calc.inputDecimal();
      break;
    case 'backspace':
      calc.backspace();
      break;
    case 'equals':
      calc.calculateEquals();
      break;
    case 'memory-clear':
      calc.memoryClear();
      break;
    case 'memory-recall':
      calc.memoryRecall();
      break;
    case 'memory-add':
      calc.memoryAdd();
      break;
    case 'memory-subtract':
      calc.memorySubtract();
      break;
    case 'memory-store':
      calc.memoryStore();
      break;
    case 'toggle-angle':
      calc.toggleAngleMode();
      break;
    case 'sin':
      calc.sin();
      break;
    case 'cos':
      calc.cos();
      break;
    case 'tan':
      calc.tan();
      break;
    case 'pi':
      calc.inputPi();
      break;
    case 'e':
      calc.inputE();
      break;
    case 'ln':
      calc.ln();
      break;
    case 'log10':
      calc.log10();
      break;
    case 'square':
      calc.square();
      break;
    case 'cube':
      calc.cube();
      break;
    case 'power':
      calc.setOperator('^');
      break;
    case 'sqrt':
      calc.sqrt();
      break;
    case 'cbrt':
      calc.cbrt();
      break;
    case 'exp':
      calc.exp();
      break;
    case 'exp10':
      calc.exp10();
      break;
    case 'factorial':
      calc.factorial();
      break;
    case 'reciprocal':
      calc.reciprocal();
      break;
    case 'open-parenthesis':
      calc.openParenthesis();
      break;
    case 'close-parenthesis':
      calc.closeParenthesis();
      break;
    case 'abs':
      calc.abs();
      break;
    case 'random':
      calc.random();
      break;
  }
}

// Mode Toggle Button (Basic <-> Scientific)
modeToggleBtn?.addEventListener('click', () => {
  currentMode = currentMode === 'basic' ? 'scientific' : 'basic';
  document.documentElement.setAttribute('data-mode', currentMode);
  localStorage.setItem('calc-mode', currentMode);
  triggerHaptic();
  playKeySound();
  updateUI();
});

// Sound Toggle Button
soundToggleBtn?.addEventListener('click', () => {
  soundEnabled = !soundEnabled;
  localStorage.setItem('calc-sound', soundEnabled ? 'on' : 'off');
  triggerHaptic();
  if (soundEnabled) playKeySound();
  updateUI();
});

// Click to Copy Display Value
async function copyToClipboard(text: string): Promise<boolean> {
  // Method 1: Modern Async Clipboard API
  if (window.isSecureContext && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall through to fallback
    }
  }

  // Method 2: Synchronous Selection / ExecCommand Fallback (Works on iOS Safari & Android)
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.setAttribute('readonly', '');
    textArea.style.position = 'fixed';
    textArea.style.top = '-9999px';
    textArea.style.left = '-9999px';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);

    // Specific iOS Safari Range Selection Fix
    if (navigator.userAgent.match(/ipad|ipod|iphone/i)) {
      const editable = textArea.contentEditable;
      const readOnly = textArea.readOnly;
      textArea.contentEditable = 'true';
      textArea.readOnly = false;
      const range = document.createRange();
      range.selectNodeContents(textArea);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
      textArea.setSelectionRange(0, 999999);
      textArea.contentEditable = editable;
      textArea.readOnly = readOnly;
    } else {
      textArea.select();
      textArea.setSelectionRange(0, text.length);
    }

    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error('Clipboard copy failed: ', err);
    return false;
  }
}

async function handleCopyDisplay(): Promise<void> {
  const val = calc.getState().currentValue;
  if (val === 'Error') return;

  const success = await copyToClipboard(val);
  triggerHaptic();
  playKeySound();
  showToast(success ? 'Copied!' : 'Copied: ' + val);
}

// Click / Short Tap
displayContainer?.addEventListener('click', handleCopyDisplay);

// Long-Press Support for Mobile (e.g. 450ms hold)
let longPressTimer: number | undefined;

displayContainer?.addEventListener('touchstart', () => {
  if (longPressTimer) clearTimeout(longPressTimer);
  longPressTimer = window.setTimeout(() => {
    handleCopyDisplay();
  }, 450);
}, { passive: true });

displayContainer?.addEventListener('touchend', () => {
  if (longPressTimer) clearTimeout(longPressTimer);
});

displayContainer?.addEventListener('touchmove', () => {
  if (longPressTimer) clearTimeout(longPressTimer);
});

// Clipboard Paste Support (Ctrl+V / Cmd+V)
window.addEventListener('paste', (e: ClipboardEvent) => {
  if (aboutModal?.open) return;
  const pasted = e.clipboardData?.getData('text');
  if (!pasted) return;

  const sanitized = pasted.trim().replace(/,/g, '.').replace(/\s+/g, '');
  const num = parseFloat(sanitized);

  if (!isNaN(num) && isFinite(num)) {
    calc.clearAll();
    for (const char of sanitized) {
      if (char >= '0' && char <= '9') {
        calc.inputDigit(char);
      } else if (char === '.') {
        calc.inputDecimal();
      } else if (char === '-') {
        calc.toggleSign();
      }
    }
    triggerHaptic();
    playKeySound();
    updateUI();
    showToast('Pasted!');
  }
});

// Physical Keyboard Support (Crucial for Chromebooks & Linux)
window.addEventListener('keydown', (e: KeyboardEvent) => {
  if (aboutModal?.open) {
    if (e.key === 'Escape') {
      aboutModal.close();
    }
    return;
  }

  let handled = false;

  if (e.key >= '0' && e.key <= '9') {
    calc.inputDigit(e.key);
    handled = true;
  } else if (e.key === '.') {
    calc.inputDecimal();
    handled = true;
  } else if (e.key === '(') {
    calc.openParenthesis();
    handled = true;
  } else if (e.key === ')') {
    calc.closeParenthesis();
    handled = true;
  } else if (e.key === '^') {
    calc.setOperator('^');
    handled = true;
  } else if (e.key === '+') {
    calc.setOperator('+');
    handled = true;
  } else if (e.key === '-') {
    calc.setOperator('-');
    handled = true;
  } else if (e.key === '*' || e.key === 'x') {
    calc.setOperator('×');
    handled = true;
  } else if (e.key === '/') {
    e.preventDefault();
    calc.setOperator('÷');
    handled = true;
  } else if (e.key === '%') {
    calc.percentage();
    handled = true;
  } else if (e.key === 'Enter' || e.key === '=') {
    e.preventDefault();
    calc.calculateEquals();
    handled = true;
  } else if (e.key === 'Backspace') {
    calc.backspace();
    handled = true;
  } else if (e.key === 'Escape') {
    calc.clearAll();
    handled = true;
  }

  if (handled) {
    triggerHaptic();
    playKeySound();
    updateUI();
  }
});

// History Modal Event Listeners
historyBtn?.addEventListener('click', () => {
  renderHistoryList();
  historyModal.showModal();
  triggerHaptic();
  playKeySound();
});

closeHistoryBtn?.addEventListener('click', () => {
  historyModal.close();
  triggerHaptic();
  playKeySound();
});

clearHistoryBtn?.addEventListener('click', () => {
  calc.clearHistory();
  updateUI();
  renderHistoryList();
  triggerHaptic();
  playKeySound();
  showToast('History cleared');
});

historyModal?.addEventListener('click', (e) => {
  const dialogDimensions = historyModal.getBoundingClientRect();
  if (
    e.clientX < dialogDimensions.left ||
    e.clientX > dialogDimensions.right ||
    e.clientY < dialogDimensions.top ||
    e.clientY > dialogDimensions.bottom
  ) {
    historyModal.close();
  }
});

// About Modal Event Listeners
aboutBtn?.addEventListener('click', () => {
  aboutModal.showModal();
  triggerHaptic();
  playKeySound();
});

closeAboutBtn?.addEventListener('click', () => {
  aboutModal.close();
  triggerHaptic();
  playKeySound();
});

aboutModal?.addEventListener('click', (e) => {
  const dialogDimensions = aboutModal.getBoundingClientRect();
  if (
    e.clientX < dialogDimensions.left ||
    e.clientX > dialogDimensions.right ||
    e.clientY < dialogDimensions.top ||
    e.clientY > dialogDimensions.bottom
  ) {
    aboutModal.close();
  }
});

// Theme Toggle (Cycles through: Modern Dark -> Vintage 80s LCD -> Modern Light -> OLED Midnight -> Cyberpunk Neon)
themeToggleBtn?.addEventListener('click', () => {
  const currentIndex = THEMES.findIndex((t) => t.id === currentTheme);
  const nextTheme = THEMES[(currentIndex + 1) % THEMES.length];
  currentTheme = nextTheme.id;
  document.documentElement.setAttribute('data-theme', currentTheme);
  localStorage.setItem('calc-theme', currentTheme);
  triggerHaptic();
  playKeySound();
  updateUI();
  showToast(`Theme: ${nextTheme.name}`);
});

// Initial Render
updateUI();
