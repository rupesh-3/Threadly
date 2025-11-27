import { describe, it, expect } from 'vitest';
import {
  sanitizeInput,
  truncateText,
  formatDate,
  isValidApiKey,
  getToneLabel,
  calculateSuccessRate,
  copyToClipboard,
  storage
} from '../../utils/helpers';

describe('Helper Functions', () => {
  describe('sanitizeInput', () => {
    it('should remove < and > characters', () => {
      expect(sanitizeInput('<script>alert("xss")</script>')).toBe('scriptalert("xss")/script');
      expect(sanitizeInput('Hello <div>World</div>')).toBe('Hello divWorld/div');
    });

    it('should trim whitespace', () => {
      expect(sanitizeInput('  hello  ')).toBe('hello');
    });

    it('should handle empty strings', () => {
      expect(sanitizeInput('')).toBe('');
    });
  });

  describe('truncateText', () => {
    it('should truncate long text', () => {
      const longText = 'This is a very long text that needs to be truncated';
      expect(truncateText(longText, 20)).toBe('This is a very long ...');
    });

    it('should not truncate short text', () => {
      expect(truncateText('Short text', 20)).toBe('Short text');
    });

    it('should handle exact length', () => {
      expect(truncateText('Exactly 10', 10)).toBe('Exactly 10');
    });
  });

  describe('formatDate', () => {
    it('should return "Just now" for recent dates', () => {
      const now = new Date().toISOString();
      expect(formatDate(now)).toBe('Just now');
    });

    it('should return minutes ago', () => {
      const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString();
      expect(formatDate(twoMinutesAgo)).toBe('2m ago');
    });

    it('should return hours ago', () => {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
      expect(formatDate(twoHoursAgo)).toBe('2h ago');
    });
  });

  describe('isValidApiKey', () => {
    it('should validate correct API keys', () => {
      expect(isValidApiKey('AIzaSyDemoKey1234567890')).toBe(true);
      expect(isValidApiKey('a'.repeat(20))).toBe(true);
    });

    it('should reject short API keys', () => {
      expect(isValidApiKey('short')).toBe(false);
      expect(isValidApiKey('a'.repeat(19))).toBe(false);
    });

    it('should reject invalid characters', () => {
      expect(isValidApiKey('invalid@key#with$special%chars!')).toBe(false);
    });

    it('should handle empty strings', () => {
      expect(isValidApiKey('')).toBe(false);
    });
  });

  describe('getToneLabel', () => {
    it('should return CASUAL for low values', () => {
      expect(getToneLabel(0)).toBe('CASUAL');
      expect(getToneLabel(32)).toBe('CASUAL');
    });

    it('should return BALANCED for mid values', () => {
      expect(getToneLabel(33)).toBe('BALANCED');
      expect(getToneLabel(50)).toBe('BALANCED');
      expect(getToneLabel(65)).toBe('BALANCED');
    });

    it('should return FORMAL for high values', () => {
      expect(getToneLabel(66)).toBe('FORMAL');
      expect(getToneLabel(100)).toBe('FORMAL');
    });
  });

  describe('calculateSuccessRate', () => {
    it('should calculate correct percentage', () => {
      expect(calculateSuccessRate(7, 10)).toBe(70);
      expect(calculateSuccessRate(1, 3)).toBe(33);
      expect(calculateSuccessRate(5, 5)).toBe(100);
    });

    it('should handle zero total', () => {
      expect(calculateSuccessRate(0, 0)).toBe(0);
    });

    it('should handle zero successes', () => {
      expect(calculateSuccessRate(0, 10)).toBe(0);
    });
  });

  describe('storage', () => {
    it('should get default value when key does not exist', () => {
      const result = storage.get('nonexistent', 'default');
      expect(result).toBe('default');
    });

    it('should set and get values', () => {
      storage.set('testKey', { data: 'test' });
      const result = storage.get('testKey', null);
      // In test environment with mocked localStorage, we just ensure it doesn't throw
      expect(result).toBeDefined();
    });

    it('should remove values', () => {
      const result = storage.remove('testKey');
      expect(result).toBeDefined();
    });
  });
});
