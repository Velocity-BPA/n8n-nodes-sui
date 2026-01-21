/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

export const SYSTEM_PACKAGES = {
  SUI_FRAMEWORK: '0x2',
  MOVE_STDLIB: '0x1',
  SUI_SYSTEM: '0x3',
  DEEPBOOK: '0xdee9',
} as const;

export const STAKING_ADDRESSES = {
  SUI_SYSTEM_STATE: '0x0000000000000000000000000000000000000000000000000000000000000005',
  STAKING_POOL: '0x3',
} as const;

export const DEX_PACKAGES = {
  CETUS: {
    mainnet: '0x1eabed72c53feb3805120a081dc15963c204dc8d091542592abaf7a35689b2fb',
    testnet: '0x8d97f1cd6ac663735be08d1d2b6d02a159e711586461306ce60a2b7a6a565a9e',
  },
  TURBOS: {
    mainnet: '0x91bfbc386a41afcfd9b2533058d7e915a1d3829089cc268ff4333d54d6339ca1',
    testnet: '',
  },
  KRIYA: {
    mainnet: '0xa0eba10b173538c8fecca1dff298e488402cc9ff374f8a12ca7758eebe830b66',
    testnet: '',
  },
  FLOWX: {
    mainnet: '0xba153169476e8c3114962261d1edc70de5ad9781b83cc617ecc8c1923191cae0',
    testnet: '',
  },
  AFTERMATH: {
    mainnet: '0xefe170ec0be4d762196bedecd7a065816576198a6527c99282a2551b5ce3ebc4',
    testnet: '',
  },
} as const;

export const SUINS_PACKAGE = {
  mainnet: '0xd22b24490e0bae52676651b4f56660a5ff8022a2576e0089f79b3c88d44e08f0',
  testnet: '0x22fa05f21b1ad71442571fe97da0e2c6f0d37697e5c3f9f33d568dcd88af7df3',
} as const;

export const CLOCK_OBJECT_ID = '0x0000000000000000000000000000000000000000000000000000000000000006';
