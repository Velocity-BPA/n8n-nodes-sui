/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
  normalizeObjectId,
  isValidObjectId,
  isValidSuiAddress,
  extractCoinType,
  buildCoinObjectType,
} from '../../nodes/Sui/utils/objectUtils';

describe('objectUtils', () => {
  describe('normalizeObjectId', () => {
    it('should pad short object IDs to 64 characters', () => {
      const shortId = '0x2';
      const normalized = normalizeObjectId(shortId);
      expect(normalized).toHaveLength(66); // 0x + 64 chars
      expect(normalized).toBe('0x0000000000000000000000000000000000000000000000000000000000000002');
    });

    it('should not modify already normalized IDs', () => {
      const fullId = '0x0000000000000000000000000000000000000000000000000000000000000002';
      expect(normalizeObjectId(fullId)).toBe(fullId);
    });

    it('should handle IDs without 0x prefix', () => {
      const noPrefix = '2';
      const normalized = normalizeObjectId(noPrefix);
      expect(normalized.startsWith('0x')).toBe(true);
    });
  });

  describe('isValidObjectId', () => {
    it('should return true for valid object IDs', () => {
      expect(isValidObjectId('0x0000000000000000000000000000000000000000000000000000000000000002')).toBe(true);
      expect(isValidObjectId('0x2')).toBe(true);
    });

    it('should return false for invalid object IDs', () => {
      expect(isValidObjectId('')).toBe(false);
      expect(isValidObjectId('invalid')).toBe(false);
      expect(isValidObjectId('0xGGG')).toBe(false);
    });
  });

  describe('isValidSuiAddress', () => {
    it('should return true for valid addresses', () => {
      const validAddress = '0x0000000000000000000000000000000000000000000000000000000000000002';
      expect(isValidSuiAddress(validAddress)).toBe(true);
    });

    it('should return false for short-form addresses (requires full 64 chars)', () => {
      // Note: isValidSuiAddress requires full 64-character format
      // Use normalizeObjectId first if you need to validate short-form addresses
      expect(isValidSuiAddress('0x2')).toBe(false);
    });

    it('should return false for invalid addresses', () => {
      expect(isValidSuiAddress('')).toBe(false);
      expect(isValidSuiAddress('not_an_address')).toBe(false);
    });
  });

  describe('extractCoinType', () => {
    it('should extract coin type from Coin<T> type string', () => {
      const coinType = '0x2::coin::Coin<0x2::sui::SUI>';
      expect(extractCoinType(coinType)).toBe('0x2::sui::SUI');
    });

    it('should return null for non-coin types', () => {
      expect(extractCoinType('0x2::object::Object')).toBeNull();
      expect(extractCoinType('invalid')).toBeNull();
    });
  });

  describe('buildCoinObjectType', () => {
    it('should build coin object type from coin type', () => {
      const coinType = '0x2::sui::SUI';
      expect(buildCoinObjectType(coinType)).toBe('0x2::coin::Coin<0x2::sui::SUI>');
    });
  });
});
