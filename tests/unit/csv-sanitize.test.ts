/**
 * Tests for CSV sanitization
 * Verifies protection against formula injection
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  sanitizeCsvCell,
  sanitizeCsvRow,
  arrayToCsv,
} from '../../src/lib/utils/csv-sanitize';

describe('CSV Sanitization', () => {
  describe('sanitizeCsvCell', () => {
    it('should sanitize formula injection attempts', () => {
      assert.strictEqual(sanitizeCsvCell('=1+1'), "'=1+1");
      assert.strictEqual(sanitizeCsvCell('+1+1'), "'+1+1");
      assert.strictEqual(sanitizeCsvCell('-1'), "'-1");
      assert.strictEqual(sanitizeCsvCell('@SUM(A1:A10)'), "'@SUM(A1:A10)");
    });

    it('should not modify safe values', () => {
      assert.strictEqual(sanitizeCsvCell('Normal text'), 'Normal text');
      assert.strictEqual(sanitizeCsvCell('123'), '123');
      assert.strictEqual(sanitizeCsvCell(123), '123');
    });

    it('should handle null and undefined', () => {
      assert.strictEqual(sanitizeCsvCell(null), '');
      assert.strictEqual(sanitizeCsvCell(undefined), '');
    });

    it('should escape double quotes', () => {
      assert.strictEqual(sanitizeCsvCell('Say "hello"'), 'Say ""hello""');
    });

    it('should handle tab and carriage return', () => {
      assert.strictEqual(sanitizeCsvCell('\tTabbed'), "'\tTabbed");
      assert.strictEqual(sanitizeCsvCell('\rReturn'), "'\rReturn");
    });
  });

  describe('sanitizeCsvRow', () => {
    it('should sanitize entire row', () => {
      const row = ['=SUM(A1)', 'Normal', 123, null];
      const sanitized = sanitizeCsvRow(row);
      
      assert.strictEqual(sanitized[0], "'=SUM(A1)");
      assert.strictEqual(sanitized[1], 'Normal');
      assert.strictEqual(sanitized[2], '123');
      assert.strictEqual(sanitized[3], '');
    });
  });

  describe('arrayToCsv', () => {
    it('should convert array to CSV with sanitization', () => {
      const data = [
        { name: 'Alice', amount: '=1+1', note: 'Safe' },
        { name: 'Bob', amount: '100', note: '@ALERT' },
      ];

      const csv = arrayToCsv(data);
      
      // Should contain sanitized values
      assert.ok(csv.includes("'=1+1"));
      assert.ok(csv.includes("'@ALERT"));
      assert.ok(csv.includes('Safe'));
      assert.ok(csv.includes('100'));
    });

    it('should handle empty array', () => {
      const csv = arrayToCsv([]);
      assert.strictEqual(csv, '');
    });

    it('should use custom headers', () => {
      const data = [
        { name: 'Alice', age: 30 },
      ];

      const csv = arrayToCsv(data, ['name']);
      
      // Should only include name column
      assert.ok(csv.includes('name'));
      assert.ok(csv.includes('Alice'));
      assert.ok(!csv.includes('age'));
    });
  });

  describe('real-world attack vectors', () => {
    it('should prevent DDE attack', () => {
      const malicious = '=cmd|"/c calc"!A1';
      assert.strictEqual(sanitizeCsvCell(malicious), `'${malicious}`);
    });

    it('should prevent hyperlink injection', () => {
      const malicious = '=HYPERLINK("http://evil.com","Click")';
      assert.strictEqual(sanitizeCsvCell(malicious), `'${malicious}`);
    });

    it('should prevent cell reference manipulation', () => {
      const malicious = '+A1+B1';
      assert.strictEqual(sanitizeCsvCell(malicious), `'${malicious}`);
    });
  });
});
