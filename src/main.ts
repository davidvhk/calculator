import './style.css';
import { CalculatorEngine } from './calculator';

const calc = new CalculatorEngine();

const mainDisplay = document.getElementById('main-display') as HTMLDivElement;
const historyDisplay = document.getElementById('history-display') as HTMLDivElement;
const memoryIndicator = document.getElementById('memory-indicator') as HTMLSpanElement;
const mcBtn = document.getElementById('mc-btn') as HTMLButtonElement;
const mrBtn = document.getElementById('mr-btn') as HTMLButtonElement;
const themeToggleBtn = document.getElementById('theme-toggle') as HTMLButtonElement;
const aboutBtn = document.getElementById('about-btn') as HTMLButtonElement;
const aboutModal = document.getElementById('about-modal') as HTMLDialogElement;
const closeAboutBtn = document.getElementById('close-about-btn') as HTMLButtonElement;

function updateUI(): void {
  const state = calc.getState();
  mainDisplay.textContent = state.currentValue;

  // Dynamically shrink text if input is very long
  if (state.currentValue.length > 10) {
    mainDisplay.style.fontSize = '24px';
  } else if (state.currentValue.length > 7) {
    mainDisplay.style.fontSize = '30px';
  } else {
    mainDisplay.style.fontSize = '38px';
  }

  if (state.previousValue !== null && state.operator !== null) {
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
}

// Button Click Handling for Keypad and Memory Bar
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
  }
}

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
let currentTheme = localStorage.getItem('calc-theme') || 'dark';
document.documentElement.setAttribute('data-theme', currentTheme);

themeToggleBtn?.addEventListener('click', () => {
  currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', currentTheme);
  localStorage.setItem('calc-theme', currentTheme);
});

// Initial Render
updateUI();
