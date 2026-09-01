export type Operator = '+' | '-' | '×' | '÷' | '%' | '^';
export type AngleMode = 'deg' | 'rad';

export interface CalculatorState {
  currentValue: string;
  previousValue: string | null;
  operator: Operator | null;
  waitingForNewOperand: boolean;
  history: string[];
  memory: number | null;
  angleMode: AngleMode;
  parenthesesDepth: number;
  expression: string;
}

export class CalculatorEngine {
  private state: CalculatorState;
  private stack: Array<{ previousValue: string | null; operator: Operator | null }> = [];

  constructor() {
    this.state = this.getInitialState();
  }

  public getInitialState(): CalculatorState {
    return {
      currentValue: '0',
      previousValue: null,
      operator: null,
      waitingForNewOperand: false,
      history: [],
      memory: null,
      angleMode: 'deg',
      parenthesesDepth: 0,
      expression: ''
    };
  }

  public getExpression(): string {
    const parts: string[] = [];
    for (const frame of this.stack) {
      if (frame.previousValue !== null && frame.operator !== null) {
        parts.push(`${frame.previousValue} ${frame.operator} (`);
      } else {
        parts.push('(');
      }
    }
    if (this.state.previousValue !== null && this.state.operator !== null) {
      parts.push(`${this.state.previousValue} ${this.state.operator}`);
    }
    return parts.join(' ');
  }

  public getState(): CalculatorState {
    return {
      ...this.state,
      parenthesesDepth: this.stack.length,
      expression: this.getExpression()
    };
  }

  public clearAll(): CalculatorState {
    const currentMemory = this.state.memory;
    const currentHistory = this.state.history;
    this.stack = [];
    this.state = this.getInitialState();
    this.state.memory = currentMemory;
    this.state.history = currentHistory;
    return this.getState();
  }

  public clearHistory(): CalculatorState {
    this.state.history = [];
    return this.getState();
  }

  public deleteHistoryItem(index: number): CalculatorState {
    if (index >= 0 && index < this.state.history.length) {
      this.state.history.splice(index, 1);
    }
    return this.getState();
  }

  public loadHistory(items: string[]): CalculatorState {
    this.state.history = Array.isArray(items) ? items : [];
    return this.getState();
  }

  public openParenthesis(): CalculatorState {
    this.stack.push({
      previousValue: this.state.previousValue,
      operator: this.state.operator
    });

    if (this.state.operator !== null) {
      if (this.state.expression.trim().endsWith(this.state.operator)) {
        this.state.expression = `${this.state.expression.trim()} (`;
      } else {
        this.state.expression = this.state.expression
          ? `${this.state.expression.trim()} (`
          : `${this.state.previousValue} ${this.state.operator} (`;
      }
    } else {
      this.state.expression = this.state.expression
        ? `${this.state.expression.trim()} (`
        : '(';
    }

    this.state.previousValue = null;
    this.state.operator = null;
    this.state.waitingForNewOperand = true;
    this.state.parenthesesDepth = this.stack.length;
    return this.getState();
  }

  public closeParenthesis(): CalculatorState {
    if (this.stack.length === 0) {
      return this.getState();
    }

    if (this.state.operator && this.state.previousValue !== null) {
      const prev = parseFloat(this.state.previousValue);
      const curr = parseFloat(this.state.currentValue);
      const res = this.executeCalculation(prev, curr, this.state.operator);
      if (res === 'Error') {
        this.state.currentValue = 'Error';
        this.stack = [];
        this.state.previousValue = null;
        this.state.operator = null;
        this.state.parenthesesDepth = 0;
        this.state.expression = '';
        return this.getState();
      }

      if (this.state.expression.trim().endsWith('(')) {
        this.state.expression = `${this.state.expression.trim()} ${this.state.previousValue} ${this.state.operator} ${this.state.currentValue} )`;
      } else {
        this.state.expression = `${this.state.expression.trim()} ${this.state.currentValue} )`;
      }
      this.state.currentValue = res;
    } else {
      this.state.expression = `${this.state.expression.trim()} ${this.state.currentValue} )`;
    }

    const frame = this.stack.pop()!;
    this.state.previousValue = frame.previousValue;
    this.state.operator = frame.operator;
    this.state.waitingForNewOperand = true;
    this.state.parenthesesDepth = this.stack.length;
    return this.getState();
  }

  public memoryStore(): CalculatorState {
    const val = parseFloat(this.state.currentValue);
    if (!isNaN(val) && isFinite(val) && this.state.currentValue !== 'Error') {
      this.state.memory = val;
      this.state.waitingForNewOperand = true;
    }
    return this.getState();
  }

  public memoryRecall(): CalculatorState {
    if (this.state.memory !== null) {
      this.state.currentValue = this.formatNumber(this.state.memory);
      this.state.waitingForNewOperand = true;
    }
    return this.getState();
  }

  public memoryClear(): CalculatorState {
    this.state.memory = null;
    return this.getState();
  }

  public memoryAdd(): CalculatorState {
    const val = parseFloat(this.state.currentValue);
    if (!isNaN(val) && isFinite(val) && this.state.currentValue !== 'Error') {
      this.state.memory = (this.state.memory ?? 0) + val;
      this.state.waitingForNewOperand = true;
    }
    return this.getState();
  }

  public memorySubtract(): CalculatorState {
    const val = parseFloat(this.state.currentValue);
    if (!isNaN(val) && isFinite(val) && this.state.currentValue !== 'Error') {
      this.state.memory = (this.state.memory ?? 0) - val;
      this.state.waitingForNewOperand = true;
    }
    return this.getState();
  }

  public clearEntry(): CalculatorState {
    this.state.currentValue = '0';
    return this.getState();
  }

  public inputDigit(digit: string): CalculatorState {
    if (this.state.waitingForNewOperand) {
      this.state.currentValue = digit;
      this.state.waitingForNewOperand = false;
    } else {
      const digitsOnly = this.state.currentValue.replace(/[-.]/g, '');
      if (digitsOnly.length >= 15) {
        return this.getState();
      }
      this.state.currentValue =
        this.state.currentValue === '0' ? digit : this.state.currentValue + digit;
    }
    return this.getState();
  }

  public inputDecimal(): CalculatorState {
    if (this.state.waitingForNewOperand) {
      this.state.currentValue = '0.';
      this.state.waitingForNewOperand = false;
      return this.getState();
    }

    if (!this.state.currentValue.includes('.')) {
      this.state.currentValue += '.';
    }
    return this.getState();
  }

  public toggleSign(): CalculatorState {
    if (this.state.currentValue === '0' || this.state.currentValue === 'Error') {
      return this.getState();
    }
    const val = parseFloat(this.state.currentValue);
    this.state.currentValue = this.formatNumber(-val);
    return this.getState();
  }

  public backspace(): CalculatorState {
    if (this.state.waitingForNewOperand || this.state.currentValue === 'Error') {
      return this.getState();
    }

    if (
      this.state.currentValue.length === 1 ||
      (this.state.currentValue.length === 2 && this.state.currentValue.startsWith('-'))
    ) {
      this.state.currentValue = '0';
    } else {
      this.state.currentValue = this.state.currentValue.slice(0, -1);
    }
    return this.getState();
  }

  public percentage(): CalculatorState {
    const current = parseFloat(this.state.currentValue);
    if (isNaN(current)) return this.getState();

    if (this.state.previousValue && this.state.operator) {
      const prev = parseFloat(this.state.previousValue);
      // For addition/subtraction, percentage is relative to previous value
      if (this.state.operator === '+' || this.state.operator === '-') {
        this.state.currentValue = this.formatNumber((prev * current) / 100);
        return this.getState();
      }
    }

    this.state.currentValue = this.formatNumber(current / 100);
    return this.getState();
  }

  public setOperator(nextOperator: Operator): CalculatorState {
    const inputValue = parseFloat(this.state.currentValue);

    if (this.state.operator && this.state.waitingForNewOperand) {
      this.state.operator = nextOperator;
      return this.getState();
    }

    if (this.state.previousValue === null) {
      this.state.previousValue = this.state.currentValue;
    } else if (this.state.operator) {
      const prev = parseFloat(this.state.previousValue);
      const result = this.executeCalculation(prev, inputValue, this.state.operator);

      if (result === 'Error') {
        this.state.currentValue = 'Error';
        this.state.previousValue = null;
        this.state.operator = null;
        this.state.waitingForNewOperand = true;
        return this.getState();
      }

      this.state.currentValue = result;
      this.state.previousValue = result;
    }

    this.state.waitingForNewOperand = true;
    this.state.operator = nextOperator;
    return this.getState();
  }

  public calculateEquals(): CalculatorState {
    while (this.stack.length > 0) {
      this.closeParenthesis();
      if (this.state.currentValue === 'Error') {
        return this.getState();
      }
    }

    if (!this.state.operator || this.state.previousValue === null) {
      return this.getState();
    }

    const prev = parseFloat(this.state.previousValue);
    const current = parseFloat(this.state.currentValue);
    const op = this.state.operator;

    const result = this.executeCalculation(prev, current, op);
    if (result !== 'Error') {
      const historyItem = `${this.state.previousValue} ${op} ${this.state.currentValue} = ${result}`;
      this.state.history.unshift(historyItem);
      if (this.state.history.length > 20) this.state.history.pop();
    }

    this.state.currentValue = result;
    this.state.previousValue = null;
    this.state.operator = null;
    this.state.waitingForNewOperand = true;

    return this.getState();
  }

  public setAngleMode(mode: AngleMode): CalculatorState {
    this.state.angleMode = mode;
    return this.getState();
  }

  public toggleAngleMode(): CalculatorState {
    this.state.angleMode = this.state.angleMode === 'deg' ? 'rad' : 'deg';
    return this.getState();
  }

  public inputPi(): CalculatorState {
    this.state.currentValue = this.formatNumber(Math.PI);
    this.state.waitingForNewOperand = true;
    return this.getState();
  }

  public inputE(): CalculatorState {
    this.state.currentValue = this.formatNumber(Math.E);
    this.state.waitingForNewOperand = true;
    return this.getState();
  }

  public random(): CalculatorState {
    const rand = parseFloat(Math.random().toFixed(4));
    this.state.currentValue = this.formatNumber(rand);
    this.state.waitingForNewOperand = true;
    return this.getState();
  }

  public square(): CalculatorState {
    const val = parseFloat(this.state.currentValue);
    if (isNaN(val) || this.state.currentValue === 'Error') return this.getState();
    this.state.currentValue = this.formatNumber(val * val);
    this.state.waitingForNewOperand = true;
    return this.getState();
  }

  public cube(): CalculatorState {
    const val = parseFloat(this.state.currentValue);
    if (isNaN(val) || this.state.currentValue === 'Error') return this.getState();
    this.state.currentValue = this.formatNumber(val * val * val);
    this.state.waitingForNewOperand = true;
    return this.getState();
  }

  public sqrt(): CalculatorState {
    const val = parseFloat(this.state.currentValue);
    if (isNaN(val) || val < 0 || this.state.currentValue === 'Error') {
      this.state.currentValue = 'Error';
      this.state.waitingForNewOperand = true;
      return this.getState();
    }
    this.state.currentValue = this.formatNumber(Math.sqrt(val));
    this.state.waitingForNewOperand = true;
    return this.getState();
  }

  public cbrt(): CalculatorState {
    const val = parseFloat(this.state.currentValue);
    if (isNaN(val) || this.state.currentValue === 'Error') return this.getState();
    this.state.currentValue = this.formatNumber(Math.cbrt(val));
    this.state.waitingForNewOperand = true;
    return this.getState();
  }

  public sin(): CalculatorState {
    const val = parseFloat(this.state.currentValue);
    if (isNaN(val) || this.state.currentValue === 'Error') return this.getState();
    const rad = this.state.angleMode === 'deg' ? (val * Math.PI) / 180 : val;
    // Fix precision for 180, 360 deg
    const res = this.state.angleMode === 'deg' && val % 180 === 0 ? 0 : Math.sin(rad);
    this.state.currentValue = this.formatNumber(res);
    this.state.waitingForNewOperand = true;
    return this.getState();
  }

  public cos(): CalculatorState {
    const val = parseFloat(this.state.currentValue);
    if (isNaN(val) || this.state.currentValue === 'Error') return this.getState();
    const rad = this.state.angleMode === 'deg' ? (val * Math.PI) / 180 : val;
    // Fix precision for 90, 270 deg
    const res = this.state.angleMode === 'deg' && (val - 90) % 180 === 0 ? 0 : Math.cos(rad);
    this.state.currentValue = this.formatNumber(res);
    this.state.waitingForNewOperand = true;
    return this.getState();
  }

  public tan(): CalculatorState {
    const val = parseFloat(this.state.currentValue);
    if (isNaN(val) || this.state.currentValue === 'Error') return this.getState();
    if (this.state.angleMode === 'deg' && (val - 90) % 180 === 0) {
      this.state.currentValue = 'Error';
      this.state.waitingForNewOperand = true;
      return this.getState();
    }
    const rad = this.state.angleMode === 'deg' ? (val * Math.PI) / 180 : val;
    const res = this.state.angleMode === 'deg' && val % 180 === 0 ? 0 : Math.tan(rad);
    this.state.currentValue = this.formatNumber(res);
    this.state.waitingForNewOperand = true;
    return this.getState();
  }

  public ln(): CalculatorState {
    const val = parseFloat(this.state.currentValue);
    if (isNaN(val) || val <= 0 || this.state.currentValue === 'Error') {
      this.state.currentValue = 'Error';
      this.state.waitingForNewOperand = true;
      return this.getState();
    }
    this.state.currentValue = this.formatNumber(Math.log(val));
    this.state.waitingForNewOperand = true;
    return this.getState();
  }

  public log10(): CalculatorState {
    const val = parseFloat(this.state.currentValue);
    if (isNaN(val) || val <= 0 || this.state.currentValue === 'Error') {
      this.state.currentValue = 'Error';
      this.state.waitingForNewOperand = true;
      return this.getState();
    }
    this.state.currentValue = this.formatNumber(Math.log10(val));
    this.state.waitingForNewOperand = true;
    return this.getState();
  }

  public exp(): CalculatorState {
    const val = parseFloat(this.state.currentValue);
    if (isNaN(val) || this.state.currentValue === 'Error') return this.getState();
    this.state.currentValue = this.formatNumber(Math.exp(val));
    this.state.waitingForNewOperand = true;
    return this.getState();
  }

  public exp10(): CalculatorState {
    const val = parseFloat(this.state.currentValue);
    if (isNaN(val) || this.state.currentValue === 'Error') return this.getState();
    this.state.currentValue = this.formatNumber(Math.pow(10, val));
    this.state.waitingForNewOperand = true;
    return this.getState();
  }

  public factorial(): CalculatorState {
    const val = parseFloat(this.state.currentValue);
    if (isNaN(val) || val < 0 || !Number.isInteger(val) || val > 170 || this.state.currentValue === 'Error') {
      this.state.currentValue = 'Error';
      this.state.waitingForNewOperand = true;
      return this.getState();
    }
    let res = 1;
    for (let i = 2; i <= val; i++) {
      res *= i;
    }
    this.state.currentValue = this.formatNumber(res);
    this.state.waitingForNewOperand = true;
    return this.getState();
  }

  public reciprocal(): CalculatorState {
    const val = parseFloat(this.state.currentValue);
    if (isNaN(val) || val === 0 || this.state.currentValue === 'Error') {
      this.state.currentValue = 'Error';
      this.state.waitingForNewOperand = true;
      return this.getState();
    }
    this.state.currentValue = this.formatNumber(1 / val);
    this.state.waitingForNewOperand = true;
    return this.getState();
  }

  public abs(): CalculatorState {
    const val = parseFloat(this.state.currentValue);
    if (isNaN(val) || this.state.currentValue === 'Error') return this.getState();
    this.state.currentValue = this.formatNumber(Math.abs(val));
    this.state.waitingForNewOperand = true;
    return this.getState();
  }

  private executeCalculation(a: number, b: number, operator: Operator): string {
    let res: number;
    switch (operator) {
      case '+':
        res = a + b;
        break;
      case '-':
        res = a - b;
        break;
      case '×':
        res = a * b;
        break;
      case '÷':
        if (b === 0) return 'Error';
        res = a / b;
        break;
      case '%':
        res = a % b;
        break;
      case '^':
        res = Math.pow(a, b);
        break;
      default:
        return 'Error';
    }

    return this.formatNumber(res);
  }

  private formatNumber(num: number): string {
    if (isNaN(num) || !isFinite(num)) return 'Error';
    if (num === 0) return '0';
    const abs = Math.abs(num);
    if (abs >= 1e15 || (abs < 1e-6 && abs > 0)) {
      return parseFloat(num.toPrecision(10)).toString();
    }
    // Precision fix for floating points like 0.1 + 0.2
    const precisionRounded = parseFloat(num.toPrecision(12));
    return precisionRounded.toString();
  }
}
