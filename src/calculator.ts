export type Operator = '+' | '-' | '×' | '÷' | '%';

export interface CalculatorState {
  currentValue: string;
  previousValue: string | null;
  operator: Operator | null;
  waitingForNewOperand: boolean;
  history: string[];
  memory: number | null;
}

export class CalculatorEngine {
  private state: CalculatorState;

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
      memory: null
    };
  }

  public getState(): CalculatorState {
    return { ...this.state };
  }

  public clearAll(): CalculatorState {
    const currentMemory = this.state.memory;
    this.state = this.getInitialState();
    this.state.memory = currentMemory;
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
      default:
        return 'Error';
    }

    return this.formatNumber(res);
  }

  private formatNumber(num: number): string {
    if (isNaN(num) || !isFinite(num)) return 'Error';
    // Precision fix for floating points like 0.1 + 0.2
    const precisionRounded = parseFloat(num.toPrecision(12));
    return precisionRounded.toString();
  }
}
