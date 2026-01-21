/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { MIST_PER_SUI, SUI_DECIMALS } from '../constants/coins';

/**
 * Convert SUI to MIST (smallest unit)
 * @param sui Amount in SUI
 * @returns Amount in MIST
 */
export function suiToMist(sui: number | string): bigint {
  const suiAmount = typeof sui === 'string' ? parseFloat(sui) : sui;
  return BigInt(Math.floor(suiAmount * MIST_PER_SUI));
}

/**
 * Convert MIST to SUI
 * @param mist Amount in MIST
 * @returns Amount in SUI as string
 */
export function mistToSui(mist: bigint | string | number): string {
  const mistAmount = BigInt(mist);
  const suiAmount = Number(mistAmount) / MIST_PER_SUI;
  return suiAmount.toFixed(SUI_DECIMALS);
}

/**
 * Convert token amount to smallest unit based on decimals
 * @param amount Human-readable amount
 * @param decimals Number of decimal places
 * @returns Amount in smallest unit
 */
export function toSmallestUnit(amount: number | string, decimals: number): bigint {
  const amountNum = typeof amount === 'string' ? parseFloat(amount) : amount;
  return BigInt(Math.floor(amountNum * Math.pow(10, decimals)));
}

/**
 * Convert from smallest unit to human-readable amount
 * @param amount Amount in smallest unit
 * @param decimals Number of decimal places
 * @returns Human-readable amount as string
 */
export function fromSmallestUnit(amount: bigint | string | number, decimals: number): string {
  const amountBigInt = BigInt(amount);
  const divisor = Math.pow(10, decimals);
  const result = Number(amountBigInt) / divisor;
  return result.toFixed(decimals);
}

/**
 * Format balance with proper decimals and optional symbol
 * @param balance Balance in smallest unit
 * @param decimals Number of decimal places
 * @param symbol Optional token symbol
 * @returns Formatted balance string
 */
export function formatBalance(
  balance: bigint | string | number,
  decimals: number,
  symbol?: string,
): string {
  const formatted = fromSmallestUnit(balance, decimals);
  return symbol ? `${formatted} ${symbol}` : formatted;
}

/**
 * Parse a balance string to bigint
 * @param balance Balance string (may include symbol)
 * @param decimals Number of decimal places
 * @returns Balance in smallest unit
 */
export function parseBalance(balance: string, decimals: number): bigint {
  // Remove any non-numeric characters except decimal point
  const cleanedBalance = balance.replace(/[^\d.]/g, '');
  return toSmallestUnit(cleanedBalance, decimals);
}
