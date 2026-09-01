import './style.css';
import { CalculatorEngine } from './calculator';

const calc = new CalculatorEngine();

const mainDisplay = document.getElementById('main-display') as HTMLDivElement;
const historyDisplay = document.getElementById('history-display') as HTMLDivElement;
const memoryIndicator = document.getElementById('memory-indicator') as HTMLSpanElement;
const angleBadge = document.getElementById('angle-badge') as HTMLSpanElement;
const angleBtnText = document.getElementById('angle-btn-text') as HTMLSpanElement;
const parenBadge = document.getElementById('paren-badge') as HTMLSpanElement;
const closeParenBtn = document.getElementById('close-paren-btn') as HTMLButtonElement;
const mcBtn = document.getElementById('mc-btn') as HTMLButtonElement;
const mrBtn = document.getElementById('mr-btn') as HTMLButtonElement;
const modeToggleBtn = document.getElementById('mode-toggle') as HTMLButtonElement;
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
    calc.inputDigit(digit);
  } else if (action) {
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
  updateUI();
});

// Physical Keyboard Support (Crucial for Chromebooks & Linux)
window.addEventListener('keydown', (e: KeyboardEvent) => {
  if (aboutModal?.open) {
    if (e.key === 'Escape') {
      aboutModal.close();
    }
    return;
  }

  if (e.key >= '0' && e.key <= '9') {
    calc.inputDigit(e.key);
    updateUI();
  } else if (e.key === '.') {
    calc.inputDecimal();
    updateUI();
  } else if (e.key === '(') {
    calc.openParenthesis();
    updateUI();
  } else if (e.key === ')') {
    calc.closeParenthesis();
    updateUI();
  } else if (e.key === '^') {
    calc.setOperator('^');
    updateUI();
  } else if (e.key === '+') {
    calc.setOperator('+');
    updateUI();
  } else if (e.key === '-') {
    calc.setOperator('-');
    updateUI();
  } else if (e.key === '*' || e.key === 'x') {
    calc.setOperator('×');
    updateUI();
  } else if (e.key === '/') {
    e.preventDefault();
    calc.setOperator('÷');
    updateUI();
  } else if (e.key === '%') {
    calc.percentage();
    updateUI();
  } else if (e.key === 'Enter' || e.key === '=') {
    e.preventDefault();
    calc.calculateEquals();
    updateUI();
  } else if (e.key === 'Backspace') {
    calc.backspace();
    updateUI();
  } else if (e.key === 'Escape') {
    calc.clearAll();
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
  updateUI();
});

// Initial Render
updateUI();
