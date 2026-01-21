/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
  suiToMist,
  mistToSui,
  toSmallestUnit,
  fromSmallestUnit,
  formatBalance,
  parseBalance,
} from '../../nodes/Sui/utils/unitConverter';

describe('unitConverter', () => {
  describe('suiToMist', () => {
    it('should convert whole SUI to MIST', () => {
      expect(suiToMist(1)).toBe(BigInt(1_000_000_000));
      expect(suiToMist(10)).toBe(BigInt(10_000_000_000));
    });

    it('should convert fractional SUI to MIST', () => {
      expect(suiToMist(0.5)).toBe(BigInt(500_000_000));
      expect(suiToMist(1.5)).toBe(BigInt(1_500_000_000));
    });

    it('should handle string input', () => {
      expect(suiToMist('1')).toBe(BigInt(1_000_000_000));
      expect(suiToMist('0.001')).toBe(BigInt(1_000_000));
    });

    it('should handle zero', () => {
      expect(suiToMist(0)).toBe(BigInt(0));
    });
  });

  describe('mistToSui', () => {
    it('should convert MIST to SUI string', () => {
      expect(mistToSui(BigInt(1_000_000_000))).toBe('1.000000000');
      expect(mistToSui(BigInt(10_000_000_000))).toBe('10.000000000');
    });

    it('should convert fractional MIST', () => {
      expect(mistToSui(BigInt(500_000_000))).toBe('0.500000000');
      expect(mistToSui(BigInt(1_500_000_000))).toBe('1.500000000');
    });

    it('should handle string and number input', () => {
      expect(mistToSui('1000000000')).toBe('1.000000000');
      expect(mistToSui(1000000000)).toBe('1.000000000');
    });

    it('should handle zero', () => {
      expect(mistToSui(BigInt(0))).toBe('0.000000000');
    });
  });

  describe('toSmallestUnit', () => {
    it('should convert to smallest unit with various decimals', () => {
      expect(toSmallestUnit(1, 6)).toBe(BigInt(1_000_000)); // USDC-style
      expect(toSmallestUnit(1, 9)).toBe(BigInt(1_000_000_000)); // SUI-style
      expect(toSmallestUnit(1, 18)).toBe(BigInt('1000000000000000000')); // ETH-style
    });

    it('should handle fractional amounts', () => {
      expect(toSmallestUnit(0.5, 6)).toBe(BigInt(500_000));
      expect(toSmallestUnit(1.5, 9)).toBe(BigInt(1_500_000_000));
    });
  });

  describe('fromSmallestUnit', () => {
    it('should convert from smallest unit', () => {
      expect(fromSmallestUnit(BigInt(1_000_000), 6)).toBe('1.000000');
      expect(fromSmallestUnit(BigInt(1_000_000_000), 9)).toBe('1.000000000');
    });

    it('should handle fractional results', () => {
      expect(fromSmallestUnit(BigInt(500_000), 6)).toBe('0.500000');
      expect(fromSmallestUnit(BigInt(1_500_000_000), 9)).toBe('1.500000000');
    });
  });

  describe('formatBalance', () => {
    it('should format balance without symbol', () => {
      expect(formatBalance(BigInt(1_000_000_000), 9)).toBe('1.000000000');
    });

    it('should format balance with symbol', () => {
      expect(formatBalance(BigInt(1_000_000_000), 9, 'SUI')).toBe('1.000000000 SUI');
      expect(formatBalance(BigInt(1_000_000), 6, 'USDC')).toBe('1.000000 USDC');
    });
  });

  describe('parseBalance', () => {
    it('should parse numeric string', () => {
      expect(parseBalance('1.5', 9)).toBe(BigInt(1_500_000_000));
    });

    it('should parse string with symbol', () => {
      expect(parseBalance('1.5 SUI', 9)).toBe(BigInt(1_500_000_000));
      expect(parseBalance('100 USDC', 6)).toBe(BigInt(100_000_000));
    });
  });
});
