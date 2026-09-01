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

  it('should input numbers correctly', () => {
    calc.inputDigit('5');
    calc.inputDigit('2');
    expect(calc.getState().currentValue).toBe('52');
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
});
