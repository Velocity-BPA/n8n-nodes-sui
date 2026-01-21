/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { Secp256k1Keypair } from '@mysten/sui/keypairs/secp256k1';
import { Secp256r1Keypair } from '@mysten/sui/keypairs/secp256r1';
import { Transaction } from '@mysten/sui/transactions';
import type { IExecuteFunctions, ILoadOptionsFunctions, ITriggerFunctions, ICredentialDataDecryptedObject } from 'n8n-workflow';
import { getNetworkConfig, type NetworkType } from '../constants/networks';
import type { SuiCredentials } from '../constants/types';

export type ContextWithCredentials = IExecuteFunctions | ILoadOptionsFunctions | ITriggerFunctions;

// Emit licensing notice once per session
let licenseNoticeEmitted = false;
function emitLicenseNotice() {
  if (!licenseNoticeEmitted) {
    console.warn(`[Velocity BPA Licensing Notice]

This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).

Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.

For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.`);
    licenseNoticeEmitted = true;
  }
}

/**
 * Get RPC URL based on credentials
 */
export function getRpcUrl(credentials: SuiCredentials): string {
  if (credentials.network === 'custom' && credentials.customRpcUrl) {
    return credentials.customRpcUrl;
  }
  return getNetworkConfig(credentials.network).rpcUrl;
}

/**
 * Create a Sui client from credentials
 */
export function createSuiClient(credentials: SuiCredentials): SuiClient {
  emitLicenseNotice();
  const rpcUrl = getRpcUrl(credentials);
  return new SuiClient({ url: rpcUrl });
}

/**
 * Create a keypair from private key and scheme
 */
export function createKeypair(
  privateKey: string,
  keyScheme: 'ed25519' | 'secp256k1' | 'secp256r1',
): Ed25519Keypair | Secp256k1Keypair | Secp256r1Keypair {
  // Remove 0x prefix if present
  const cleanKey = privateKey.startsWith('0x') ? privateKey.slice(2) : privateKey;
  const keyBytes = Buffer.from(cleanKey, 'hex');
  
  switch (keyScheme) {
    case 'secp256k1':
      return Secp256k1Keypair.fromSecretKey(keyBytes);
    case 'secp256r1':
      return Secp256r1Keypair.fromSecretKey(keyBytes);
    case 'ed25519':
    default:
      return Ed25519Keypair.fromSecretKey(keyBytes);
  }
}

/**
 * Get the address from a keypair
 */
export function getAddressFromKeypair(
  keypair: Ed25519Keypair | Secp256k1Keypair | Secp256r1Keypair,
): string {
  return keypair.getPublicKey().toSuiAddress();
}

/**
 * Sign and execute a transaction
 */
export async function signAndExecuteTransaction(
  client: SuiClient,
  keypair: Ed25519Keypair | Secp256k1Keypair | Secp256r1Keypair,
  transaction: Transaction,
  options?: {
    showEffects?: boolean;
    showEvents?: boolean;
    showObjectChanges?: boolean;
    showBalanceChanges?: boolean;
    showInput?: boolean;
  },
) {
  return client.signAndExecuteTransaction({
    signer: keypair,
    transaction,
    options: {
      showEffects: options?.showEffects ?? true,
      showEvents: options?.showEvents ?? true,
      showObjectChanges: options?.showObjectChanges ?? false,
      showBalanceChanges: options?.showBalanceChanges ?? false,
      showInput: options?.showInput ?? false,
    },
  });
}

/**
 * Dry run a transaction
 */
export async function dryRunTransaction(
  client: SuiClient,
  transaction: Transaction,
  sender?: string,
) {
  if (sender) {
    transaction.setSender(sender);
  }
  const txBytes = await transaction.build({ client });
  return client.dryRunTransactionBlock({
    transactionBlock: txBytes,
  });
}

/**
 * Get credentials from n8n execution context
 */
export async function getSuiCredentials(
  context: ContextWithCredentials,
  credentialsName = 'suiNetwork',
): Promise<SuiCredentials> {
  const credentials = await context.getCredentials(credentialsName) as ICredentialDataDecryptedObject;
  return {
    network: credentials.network as string,
    customRpcUrl: credentials.customRpcUrl as string | undefined,
    privateKey: credentials.privateKey as string | undefined,
    keyScheme: (credentials.keyScheme as 'ed25519' | 'secp256k1' | 'secp256r1') || 'ed25519',
    faucetUrl: credentials.faucetUrl as string | undefined,
  };
}

/**
 * Initialize Sui client and keypair from execution context
 */
export async function initializeSuiFromContext(
  context: ContextWithCredentials,
  credentialsName = 'suiNetwork',
): Promise<{
  client: SuiClient;
  keypair?: Ed25519Keypair | Secp256k1Keypair | Secp256r1Keypair;
  address?: string;
  credentials: SuiCredentials;
}> {
  const credentials = await getSuiCredentials(context, credentialsName);
  const client = createSuiClient(credentials);
  
  let keypair: Ed25519Keypair | Secp256k1Keypair | Secp256r1Keypair | undefined;
  let address: string | undefined;
  
  if (credentials.privateKey) {
    keypair = createKeypair(credentials.privateKey, credentials.keyScheme);
    address = getAddressFromKeypair(keypair);
  }
  
  return { client, keypair, address, credentials };
}

/**
 * Wait for a transaction to be confirmed
 */
export async function waitForTransaction(
  client: SuiClient,
  digest: string,
  options?: {
    timeout?: number;
    pollInterval?: number;
  },
) {
  const timeout = options?.timeout || 60000;
  const pollInterval = options?.pollInterval || 1000;
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    try {
      const result = await client.getTransactionBlock({
        digest,
        options: {
          showEffects: true,
          showEvents: true,
        },
      });
      return result;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, pollInterval));
    }
  }
  
  throw new Error(`Transaction ${digest} not confirmed within ${timeout}ms`);
}

/**
 * Estimate gas for a transaction
 */
export async function estimateGas(
  client: SuiClient,
  transaction: Transaction,
  sender: string,
): Promise<bigint> {
  const dryRunResult = await dryRunTransaction(client, transaction, sender);
  const gasUsed = dryRunResult.effects.gasUsed;
  const totalGas =
    BigInt(gasUsed.computationCost) +
    BigInt(gasUsed.storageCost) -
    BigInt(gasUsed.storageRebate);
  return totalGas > 0n ? totalGas : 0n;
}
