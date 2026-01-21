/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

export const NETWORKS = {
  mainnet: {
    rpcUrl: 'https://fullnode.mainnet.sui.io:443',
    wsUrl: 'wss://fullnode.mainnet.sui.io',
    faucetUrl: '',
    explorerUrl: 'https://suiscan.xyz/mainnet',
  },
  testnet: {
    rpcUrl: 'https://fullnode.testnet.sui.io:443',
    wsUrl: 'wss://fullnode.testnet.sui.io',
    faucetUrl: 'https://faucet.testnet.sui.io/gas',
    explorerUrl: 'https://suiscan.xyz/testnet',
  },
  devnet: {
    rpcUrl: 'https://fullnode.devnet.sui.io:443',
    wsUrl: 'wss://fullnode.devnet.sui.io',
    faucetUrl: 'https://faucet.devnet.sui.io/gas',
    explorerUrl: 'https://suiscan.xyz/devnet',
  },
  localnet: {
    rpcUrl: 'http://127.0.0.1:9000',
    wsUrl: 'ws://127.0.0.1:9000',
    faucetUrl: 'http://127.0.0.1:9123/gas',
    explorerUrl: '',
  },
} as const;

export type NetworkType = keyof typeof NETWORKS;

export function getNetworkConfig(network: string, customRpcUrl?: string) {
  if (network === 'custom' && customRpcUrl) {
    return {
      rpcUrl: customRpcUrl,
      wsUrl: customRpcUrl.replace(/^https?/, 'wss').replace(/^http/, 'ws'),
      faucetUrl: '',
      explorerUrl: '',
    };
  }
  return NETWORKS[network as NetworkType] || NETWORKS.mainnet;
}
