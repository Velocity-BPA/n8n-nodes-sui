/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

export const SUI_COIN_TYPE = '0x2::sui::SUI';
export const SUI_DECIMALS = 9;
export const MIST_PER_SUI = 1_000_000_000;

export const COMMON_COINS = {
  SUI: {
    type: SUI_COIN_TYPE,
    decimals: 9,
    symbol: 'SUI',
    name: 'Sui',
  },
  USDC: {
    type: '0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN',
    decimals: 6,
    symbol: 'USDC',
    name: 'USD Coin',
  },
  USDT: {
    type: '0xc060006111016b8a020ad5b33834984a437aaa7d3c74c18e09a95d48aceab08c::coin::COIN',
    decimals: 6,
    symbol: 'USDT',
    name: 'Tether USD',
  },
  WETH: {
    type: '0xaf8cd5edc19c4512f4259f0bee101a40d41ebed738ade5874359610ef8eeced5::coin::COIN',
    decimals: 8,
    symbol: 'WETH',
    name: 'Wrapped Ether',
  },
  WBTC: {
    type: '0x027792d9fed7f9844eb4839566001bb6f6cb4804f66aa2da6fe1ee242d896881::coin::COIN',
    decimals: 8,
    symbol: 'WBTC',
    name: 'Wrapped Bitcoin',
  },
} as const;

export type CoinSymbol = keyof typeof COMMON_COINS;
