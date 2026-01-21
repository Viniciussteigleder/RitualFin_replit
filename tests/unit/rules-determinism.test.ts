/**
 * Rules Engine Determinism Tests
 * Ensures consistent categorization behavior
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';

// Mock rule matching logic
interface Rule {
  id: string;
  priority: number;
  keywords: string[];
  negativeKeywords?: string[];
  leafId: string;
  strict: boolean;
}

function matchRule(description: string, rule: Rule): boolean {
  const descLower = description.toLowerCase();
  
  // Check negative keywords first
  if (rule.negativeKeywords) {
    for (const negKeyword of rule.negativeKeywords) {
      if (descLower.includes(negKeyword.toLowerCase())) {
        return false;
      }
    }
  }
  
  // Check positive keywords
  for (const keyword of rule.keywords) {
    if (descLower.includes(keyword.toLowerCase())) {
      return true;
    }
  }
  
  return false;
}

function findMatchingRules(description: string, rules: Rule[]): Rule[] {
  return rules
    .filter(rule => matchRule(description, rule))
    .sort((a, b) => b.priority - a.priority); // Higher priority first
}

describe('Rules Engine Determinism', () => {
  describe('Priority Resolution', () => {
    it('should select highest priority rule when multiple match', () => {
      const rules: Rule[] = [
        { id: '1', priority: 100, keywords: ['supermarket'], leafId: 'groceries', strict: false },
        { id: '2', priority: 200, keywords: ['lidl'], leafId: 'lidl-specific', strict: false },
      ];

      const matches = findMatchingRules('Lidl Supermarket', rules);
      
      assert.strictEqual(matches.length, 2);
      assert.strictEqual(matches[0].id, '2'); // Higher priority
      assert.strictEqual(matches[0].priority, 200);
    });

    it('should handle same priority consistently (first in list wins)', () => {
      const rules: Rule[] = [
        { id: '1', priority: 100, keywords: ['food'], leafId: 'food1', strict: false },
        { id: '2', priority: 100, keywords: ['food'], leafId: 'food2', strict: false },
      ];

      const matches = findMatchingRules('Food purchase', rules);
      
      assert.strictEqual(matches.length, 2);
      // Both have same priority, order preserved
      assert.strictEqual(matches[0].id, '1');
    });
  });

  describe('Negative Keywords', () => {
    it('should exclude matches with negative keywords', () => {
      const rules: Rule[] = [
        {
          id: '1',
          priority: 100,
          keywords: ['transfer'],
          negativeKeywords: ['internal'],
          leafId: 'external-transfer',
          strict: false,
        },
      ];

      const externalMatch = findMatchingRules('Bank transfer to John', rules);
      const internalMatch = findMatchingRules('Internal transfer between accounts', rules);
      
      assert.strictEqual(externalMatch.length, 1);
      assert.strictEqual(internalMatch.length, 0); // Excluded by negative keyword
    });

    it('should handle multiple negative keywords', () => {
      const rules: Rule[] = [
        {
          id: '1',
          priority: 100,
          keywords: ['payment'],
          negativeKeywords: ['refund', 'reversal', 'cancelled'],
          leafId: 'payment',
          strict: false,
        },
      ];

      assert.strictEqual(findMatchingRules('Payment to merchant', rules).length, 1);
      assert.strictEqual(findMatchingRules('Payment refund', rules).length, 0);
      assert.strictEqual(findMatchingRules('Payment reversal', rules).length, 0);
      assert.strictEqual(findMatchingRules('Cancelled payment', rules).length, 0);
    });
  });

  describe('Case Insensitivity', () => {
    it('should match regardless of case', () => {
      const rules: Rule[] = [
        { id: '1', priority: 100, keywords: ['Lidl'], leafId: 'groceries', strict: false },
      ];

      assert.strictEqual(findMatchingRules('LIDL', rules).length, 1);
      assert.strictEqual(findMatchingRules('lidl', rules).length, 1);
      assert.strictEqual(findMatchingRules('LiDl', rules).length, 1);
    });
  });

  describe('Conflict Detection', () => {
    it('should detect when multiple rules match with different categories', () => {
      const rules: Rule[] = [
        { id: '1', priority: 100, keywords: ['amazon'], leafId: 'shopping', strict: false },
        { id: '2', priority: 100, keywords: ['amazon'], leafId: 'books', strict: false },
      ];

      const matches = findMatchingRules('Amazon purchase', rules);
      
      // Conflict: same priority, different categories
      assert.strictEqual(matches.length, 2);
      assert.notStrictEqual(matches[0].leafId, matches[1].leafId);
    });
  });

  describe('Strict Mode', () => {
    it('should mark strict rules for auto-confirmation', () => {
      const rules: Rule[] = [
        { id: '1', priority: 100, keywords: ['salary'], leafId: 'income', strict: true },
        { id: '2', priority: 100, keywords: ['bonus'], leafId: 'income', strict: false },
      ];

      const salaryMatches = findMatchingRules('Monthly salary', rules);
      const bonusMatches = findMatchingRules('Year-end bonus', rules);
      
      assert.strictEqual(salaryMatches[0].strict, true);
      assert.strictEqual(bonusMatches[0].strict, false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty description', () => {
      const rules: Rule[] = [
        { id: '1', priority: 100, keywords: ['test'], leafId: 'test', strict: false },
      ];

      assert.strictEqual(findMatchingRules('', rules).length, 0);
    });

    it('should handle empty keywords', () => {
      const rules: Rule[] = [
        { id: '1', priority: 100, keywords: [], leafId: 'test', strict: false },
      ];

      assert.strictEqual(findMatchingRules('anything', rules).length, 0);
    });

    it('should handle special characters in keywords', () => {
      const rules: Rule[] = [
        { id: '1', priority: 100, keywords: ['café'], leafId: 'food', strict: false },
      ];

      assert.strictEqual(findMatchingRules('Café Central', rules).length, 1);
    });

    it('should handle partial word matches', () => {
      const rules: Rule[] = [
        { id: '1', priority: 100, keywords: ['market'], leafId: 'shopping', strict: false },
      ];

      // Should match "supermarket" because it contains "market"
      assert.strictEqual(findMatchingRules('Supermarket', rules).length, 1);
    });
  });

  describe('Real-World Scenarios', () => {
    it('should correctly categorize Lidl purchase', () => {
      const rules: Rule[] = [
        { id: '1', priority: 500, keywords: ['lidl'], leafId: 'groceries-lidl', strict: false },
        { id: '2', priority: 100, keywords: ['groceries'], leafId: 'groceries-general', strict: false },
      ];

      const matches = findMatchingRules('LIDL FILIALE 1234', rules);
      
      assert.strictEqual(matches[0].leafId, 'groceries-lidl'); // Specific rule wins
    });

    it('should exclude internal transfers', () => {
      const rules: Rule[] = [
        {
          id: '1',
          priority: 100,
          keywords: ['transfer', 'überweisung'],
          negativeKeywords: ['internal', 'intern', 'eigene'],
          leafId: 'external-transfer',
          strict: false,
        },
      ];

      assert.strictEqual(
        findMatchingRules('Überweisung an externe Bank', rules).length,
        1
      );
      assert.strictEqual(
        findMatchingRules('Interne Überweisung', rules).length,
        0
      );
    });
  });
});
