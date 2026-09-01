import { describe, it, expect, beforeEach } from 'vitest';
import { CalculatorEngine } from './calculator';

describe('CalculatorEngine', () => {
  let calc: CalculatorEngine;

  beforeEach(() => {
    calc = new CalculatorEngine();
  });

  it('should initialize with 0', () => {
    expect(calc.getState().currentValue).toBe('0');
  });

  it('should input numbers correctly and limit to 15 digits', () => {
    calc.inputDigit('5');
    calc.inputDigit('2');
    expect(calc.getState().currentValue).toBe('52');

    calc.clearAll();
    // Type 20 digits
    for (let i = 1; i <= 20; i++) {
      calc.inputDigit('1');
    }
    expect(calc.getState().currentValue).toBe('111111111111111');
    expect(calc.getState().currentValue.length).toBe(15);
  });

  it('should handle decimal points', () => {
    calc.inputDigit('3');
    calc.inputDecimal();
    calc.inputDigit('1');
    calc.inputDigit('4');
    expect(calc.getState().currentValue).toBe('3.14');

    // Should not allow duplicate decimal point
    calc.inputDecimal();
    expect(calc.getState().currentValue).toBe('3.14');
  });

  it('should perform basic addition correctly (including 0.1 + 0.2 precision)', () => {
    calc.inputDigit('0');
    calc.inputDecimal();
    calc.inputDigit('1');
    calc.setOperator('+');
    calc.inputDigit('0');
    calc.inputDecimal();
    calc.inputDigit('2');
    const state = calc.calculateEquals();
    expect(state.currentValue).toBe('0.3');
  });

  it('should perform subtraction correctly', () => {
    calc.inputDigit('1');
    calc.inputDigit('0');
    calc.setOperator('-');
    calc.inputDigit('4');
    const state = calc.calculateEquals();
    expect(state.currentValue).toBe('6');
  });

  it('should perform multiplication correctly', () => {
    calc.inputDigit('7');
    calc.setOperator('×');
    calc.inputDigit('8');
    const state = calc.calculateEquals();
    expect(state.currentValue).toBe('56');
  });

  it('should perform division correctly', () => {
    calc.inputDigit('1');
    calc.inputDigit('5');
    calc.setOperator('÷');
    calc.inputDigit('3');
    const state = calc.calculateEquals();
    expect(state.currentValue).toBe('5');
  });

  it('should handle division by zero as Error', () => {
    calc.inputDigit('9');
    calc.setOperator('÷');
    calc.inputDigit('0');
    const state = calc.calculateEquals();
    expect(state.currentValue).toBe('Error');
  });

  it('should toggle positive/negative sign', () => {
    calc.inputDigit('4');
    calc.inputDigit('2');
    calc.toggleSign();
    expect(calc.getState().currentValue).toBe('-42');
    calc.toggleSign();
    expect(calc.getState().currentValue).toBe('42');
  });

  it('should backspace correctly', () => {
    calc.inputDigit('1');
    calc.inputDigit('2');
    calc.inputDigit('3');
    calc.backspace();
    expect(calc.getState().currentValue).toBe('12');
    calc.backspace();
    expect(calc.getState().currentValue).toBe('1');
    calc.backspace();
    expect(calc.getState().currentValue).toBe('0');
  });

  it('should support chained operations', () => {
    calc.inputDigit('2');
    calc.setOperator('+');
    calc.inputDigit('3');
    calc.setOperator('×');
    expect(calc.getState().currentValue).toBe('5');
    calc.inputDigit('4');
    const state = calc.calculateEquals();
    expect(state.currentValue).toBe('20');
  });

  describe('Memory Functions', () => {
    it('should store and recall value', () => {
      calc.inputDigit('4');
      calc.inputDigit('2');
      calc.memoryStore();
      expect(calc.getState().memory).toBe(42);

      calc.clearAll();
      expect(calc.getState().currentValue).toBe('0');
      expect(calc.getState().memory).toBe(42); // AC should preserve memory

      calc.memoryRecall();
      expect(calc.getState().currentValue).toBe('42');
    });

    it('should clear memory with memoryClear', () => {
      calc.inputDigit('9');
      calc.memoryStore();
      expect(calc.getState().memory).toBe(9);

      calc.memoryClear();
      expect(calc.getState().memory).toBeNull();
    });

    it('should add to memory with memoryAdd', () => {
      calc.inputDigit('1');
      calc.inputDigit('0');
      calc.memoryStore(); // memory = 10

      calc.inputDigit('5');
      calc.memoryAdd(); // memory = 10 + 5 = 15
      expect(calc.getState().memory).toBe(15);

      calc.clearAll();
      calc.memoryRecall();
      expect(calc.getState().currentValue).toBe('15');
    });

    it('should subtract from memory with memorySubtract', () => {
      calc.inputDigit('2');
      calc.inputDigit('0');
      calc.memoryStore(); // memory = 20

      calc.inputDigit('7');
      calc.memorySubtract(); // memory = 20 - 7 = 13
      expect(calc.getState().memory).toBe(13);

      calc.clearAll();
      calc.memoryRecall();
      expect(calc.getState().currentValue).toBe('13');
    });

    it('should initialize memory on M+ or M- if memory is null', () => {
      calc.inputDigit('8');
      calc.memoryAdd();
      expect(calc.getState().memory).toBe(8);

      calc.memorySubtract();
      expect(calc.getState().memory).toBe(0);
    });
  });

  describe('Scientific Functions', () => {
    it('should toggle and set angle modes', () => {
      expect(calc.getState().angleMode).toBe('deg');
      calc.toggleAngleMode();
      expect(calc.getState().angleMode).toBe('rad');
      calc.setAngleMode('deg');
      expect(calc.getState().angleMode).toBe('deg');
    });

    it('should calculate trigonometric functions in degrees', () => {
      calc.inputDigit('9');
      calc.inputDigit('0');
      calc.sin();
      expect(calc.getState().currentValue).toBe('1');

      calc.clearAll();
      calc.inputDigit('1');
      calc.inputDigit('8');
      calc.inputDigit('0');
      calc.cos();
      expect(calc.getState().currentValue).toBe('-1');

      calc.clearAll();
      calc.inputDigit('4');
      calc.inputDigit('5');
      calc.tan();
      expect(calc.getState().currentValue).toBe('1');

      calc.clearAll();
      calc.inputDigit('9');
      calc.inputDigit('0');
      calc.tan();
      expect(calc.getState().currentValue).toBe('Error');
    });

    it('should calculate square, cube, sqrt, and cbrt', () => {
      calc.inputDigit('5');
      calc.square();
      expect(calc.getState().currentValue).toBe('25');

      calc.inputDigit('3');
      calc.cube();
      expect(calc.getState().currentValue).toBe('27');

      calc.inputDigit('1');
      calc.inputDigit('6');
      calc.sqrt();
      expect(calc.getState().currentValue).toBe('4');

      calc.inputDigit('6');
      calc.inputDigit('4');
      calc.cbrt();
      expect(calc.getState().currentValue).toBe('4');
    });

    it('should calculate power with ^ operator', () => {
      calc.inputDigit('2');
      calc.setOperator('^');
      calc.inputDigit('8');
      const state = calc.calculateEquals();
      expect(state.currentValue).toBe('256');
    });

    it('should calculate factorial correctly', () => {
      calc.inputDigit('5');
      calc.factorial();
      expect(calc.getState().currentValue).toBe('120');

      calc.clearAll();
      calc.inputDigit('0');
      calc.factorial();
      expect(calc.getState().currentValue).toBe('1');

      calc.inputDigit('3');
      calc.inputDecimal();
      calc.inputDigit('5');
      calc.factorial();
      expect(calc.getState().currentValue).toBe('Error');
    });

    it('should calculate logarithms and exponentials', () => {
      calc.inputDigit('1');
      calc.inputDigit('0');
      calc.inputDigit('0');
      calc.log10();
      expect(calc.getState().currentValue).toBe('2');

      calc.clearAll();
      calc.inputDigit('0');
      calc.exp();
      expect(calc.getState().currentValue).toBe('1');

      calc.clearAll();
      calc.inputDigit('3');
      calc.exp10();
      expect(calc.getState().currentValue).toBe('1000');
    });

    it('should handle reciprocal and absolute value', () => {
      calc.inputDigit('4');
      calc.reciprocal();
      expect(calc.getState().currentValue).toBe('0.25');

      calc.clearAll();
      calc.inputDigit('0');
      calc.reciprocal();
      expect(calc.getState().currentValue).toBe('Error');

      calc.inputDigit('5');
      calc.toggleSign();
      expect(calc.getState().currentValue).toBe('-5');
      calc.abs();
      expect(calc.getState().currentValue).toBe('5');
    });

    it('should input constants pi and e', () => {
      calc.inputPi();
      expect(calc.getState().currentValue.startsWith('3.14159')).toBe(true);

      calc.inputE();
      expect(calc.getState().currentValue.startsWith('2.71828')).toBe(true);
    });

    it('should generate valid random numbers without duplicate decimal points on repeated presses', () => {
      calc.random();
      const first = calc.getState().currentValue;
      expect(first.split('.').length).toBeLessThanOrEqual(2);
      expect(isNaN(parseFloat(first))).toBe(false);

      calc.random();
      const second = calc.getState().currentValue;
      expect(second.split('.').length).toBeLessThanOrEqual(2);
      expect(isNaN(parseFloat(second))).toBe(false);
    });
  });
});
