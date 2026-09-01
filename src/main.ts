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
const soundToggleBtn = document.getElementById('sound-toggle') as HTMLButtonElement;
const themeToggleBtn = document.getElementById('theme-toggle') as HTMLButtonElement;
const aboutBtn = document.getElementById('about-btn') as HTMLButtonElement;
const aboutModal = document.getElementById('about-modal') as HTMLDialogElement;
const closeAboutBtn = document.getElementById('close-about-btn') as HTMLButtonElement;

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
    themeToggleBtn.innerHTML = currentTheme === 'dark' ? SUN_ICON_SVG : MOON_ICON_SVG;
    themeToggleBtn.title = currentTheme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme';
  }
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

// Click / Tap to Copy Display Value
displayContainer?.addEventListener('click', async () => {
  const val = calc.getState().currentValue;
  if (val === 'Error') return;

  const success = await copyToClipboard(val);
  triggerHaptic();
  playKeySound();
  showToast(success ? 'Copied!' : 'Copied: ' + val);
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

// About Modal Event Listeners
aboutBtn?.addEventListener('click', () => {
  aboutModal.showModal();
});

closeAboutBtn?.addEventListener('click', () => {
  aboutModal.close();
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

// Theme Toggle
themeToggleBtn?.addEventListener('click', () => {
  currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', currentTheme);
  localStorage.setItem('calc-theme', currentTheme);
  triggerHaptic();
  playKeySound();
  updateUI();
});

// Initial Render
updateUI();
