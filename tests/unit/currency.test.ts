/**
 * Tests for currency utilities
 * Verifies precision and edge cases
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  eurosToCents,
  centsToEuros,
  formatCurrency,
  parseCurrency,
  addCents,
  subtractCents,
  multiplyCents,
  divideCents,
  percentageOf,
} from '../../src/lib/utils/currency';

describe('Currency Utils', () => {
  describe('eurosToCents', () => {
    it('should convert euros to cents', () => {
      assert.strictEqual(eurosToCents(1.00), 100);
      assert.strictEqual(eurosToCents(10.50), 1050);
      assert.strictEqual(eurosToCents(0.01), 1);
    });

    it('should handle floating point precision', () => {
      // Classic floating point problem: 0.1 + 0.2 = 0.30000000000000004
      const result = eurosToCents(0.1 + 0.2);
      assert.strictEqual(result, 30); // Should round correctly
    });

    it('should handle negative amounts', () => {
      assert.strictEqual(eurosToCents(-5.50), -550);
    });
  });

  describe('centsToEuros', () => {
    it('should convert cents to euros', () => {
      assert.strictEqual(centsToEuros(100), 1.00);
      assert.strictEqual(centsToEuros(1050), 10.50);
      assert.strictEqual(centsToEuros(1), 0.01);
    });
  });

  describe('formatCurrency', () => {
    it('should format cents as currency string', () => {
      const formatted = formatCurrency(1050, 'EUR', 'pt-PT');
      assert.ok(formatted.includes('10'));
      assert.ok(formatted.includes('50'));
    });
  });

  describe('parseCurrency', () => {
    it('should parse number to cents', () => {
      assert.strictEqual(parseCurrency(10.50), 1050);
    });

    it('should parse string to cents', () => {
      assert.strictEqual(parseCurrency('10.50'), 1050);
      assert.strictEqual(parseCurrency('10,50'), 1050);
      assert.strictEqual(parseCurrency('€10.50'), 1050);
    });

    it('should throw on invalid input', () => {
      assert.throws(() => parseCurrency('invalid'));
    });
  });

  describe('arithmetic operations', () => {
    it('should add cents correctly', () => {
      assert.strictEqual(addCents(100, 200), 300);
      assert.strictEqual(addCents(1, 2), 3);
    });

    it('should subtract cents correctly', () => {
      assert.strictEqual(subtractCents(300, 100), 200);
      assert.strictEqual(subtractCents(100, 200), -100);
    });

    it('should multiply cents correctly', () => {
      assert.strictEqual(multiplyCents(100, 2), 200);
      assert.strictEqual(multiplyCents(100, 1.5), 150);
      assert.strictEqual(multiplyCents(100, 0.5), 50);
    });

    it('should divide cents correctly', () => {
      assert.strictEqual(divideCents(100, 2), 50);
      assert.strictEqual(divideCents(100, 3), 33); // Rounds
    });

    it('should throw on division by zero', () => {
      assert.throws(() => divideCents(100, 0));
    });

    it('should calculate percentage correctly', () => {
      assert.strictEqual(percentageOf(1000, 10), 100); // 10% of 10.00€
      assert.strictEqual(percentageOf(1000, 15), 150); // 15% of 10.00€
    });
  });

  describe('precision edge cases', () => {
    it('should handle the classic 0.1 + 0.2 problem', () => {
      const a = eurosToCents(0.1);
      const b = eurosToCents(0.2);
      const sum = addCents(a, b);
      assert.strictEqual(sum, 30);
      assert.strictEqual(centsToEuros(sum), 0.30);
    });

    it('should handle very small amounts', () => {
      assert.strictEqual(eurosToCents(0.001), 0); // Rounds to 0 cents
      assert.strictEqual(eurosToCents(0.005), 1); // Rounds to 1 cent
    });

    it('should handle large amounts', () => {
      const million = eurosToCents(1000000);
      assert.strictEqual(million, 100000000);
      assert.strictEqual(centsToEuros(million), 1000000);
    });
  });
});
