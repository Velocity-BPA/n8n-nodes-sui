/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

export interface SuiCredentials {
  network: string;
  customRpcUrl?: string;
  privateKey?: string;
  keyScheme: 'ed25519' | 'secp256k1' | 'secp256r1';
  faucetUrl?: string;
}

export interface SuiScanCredentials {
  apiKey: string;
  network: 'mainnet' | 'testnet';
}

export interface TransactionResult {
  digest: string;
  effects: {
    status: {
      status: string;
      error?: string;
    };
    gasUsed: {
      computationCost: string;
      storageCost: string;
      storageRebate: string;
    };
    created?: Array<{
      reference: {
        objectId: string;
      };
    }>;
    mutated?: Array<{
      reference: {
        objectId: string;
      };
    }>;
  };
  events?: Array<{
    type: string;
    parsedJson: Record<string, unknown>;
  }>;
}

export interface CoinBalance {
  coinType: string;
  totalBalance: string;
  coinObjectCount: number;
  lockedBalance: Record<string, string>;
}

export interface ObjectData {
  objectId: string;
  version: string;
  digest: string;
  type?: string;
  owner?: {
    AddressOwner?: string;
    ObjectOwner?: string;
    Shared?: {
      initial_shared_version: number;
    };
    Immutable?: boolean;
  };
  content?: {
    dataType: string;
    type: string;
    hasPublicTransfer: boolean;
    fields: Record<string, unknown>;
  };
  display?: {
    data: Record<string, string> | null;
    error: string | null;
  };
}

export interface StakeInfo {
  validatorAddress: string;
  stakingPool: string;
  stakeActivationEpoch: string;
  principal: string;
  estimatedReward?: string;
}

export interface ValidatorInfo {
  suiAddress: string;
  name: string;
  description: string;
  imageUrl: string;
  projectUrl: string;
  netAddress: string;
  p2pAddress: string;
  primaryAddress: string;
  workerAddress: string;
  stakingPoolId: string;
  commissionRate: string;
  poolTokenBalance: string;
  pendingStake: string;
  pendingTotalSuiWithdraw: string;
  pendingPoolTokenWithdraw: string;
  votingPower: string;
  gasPrice: string;
  nextEpochStake: string;
  nextEpochGasPrice: string;
  nextEpochCommissionRate: string;
  apy?: number;
}

export interface EventFilter {
  Package?: string;
  Module?: string;
  MoveEventType?: string;
  MoveEventModule?: {
    package: string;
    module: string;
  };
  MoveEventField?: {
    path: string;
    value: unknown;
  };
  Sender?: string;
  Transaction?: string;
  TimeRange?: {
    startTime: string;
    endTime: string;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  nextCursor?: string | null;
  hasNextPage: boolean;
}
