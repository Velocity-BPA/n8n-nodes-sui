/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { initializeSuiFromContext, signAndExecuteTransaction } from '../../transport/suiClient';
import { buildMergeCoins, buildSplitCoins, fromSmallestUnit, toSmallestUnit } from '../../utils';
import { SUI_COIN_TYPE, SUI_DECIMALS } from '../../constants/coins';

export const coinOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['coin'],
      },
    },
    options: [
      { name: 'Get Coin Metadata', value: 'getCoinMetadata', description: 'Get metadata for a coin type', action: 'Get coin metadata' },
      { name: 'Get Total Supply', value: 'getTotalSupply', description: 'Get total supply of a coin', action: 'Get total supply' },
      { name: 'Merge Coins', value: 'mergeCoins', description: 'Merge multiple coins into one', action: 'Merge coins' },
      { name: 'Split Coin', value: 'splitCoin', description: 'Split a coin into multiple', action: 'Split coin' },
      { name: 'Get All Coin Balances', value: 'getAllCoinBalances', description: 'Get all coin balances for an address', action: 'Get all coin balances' },
    ],
    default: 'getCoinMetadata',
  },
];

export const coinFields: INodeProperties[] = [
  {
    displayName: 'Coin Type',
    name: 'coinType',
    type: 'string',
    required: true,
    default: SUI_COIN_TYPE,
    placeholder: '0x2::sui::SUI',
    description: 'The coin type',
    displayOptions: {
      show: {
        resource: ['coin'],
        operation: ['getCoinMetadata', 'getTotalSupply'],
      },
    },
  },
  {
    displayName: 'Address',
    name: 'address',
    type: 'string',
    default: '',
    placeholder: '0x...',
    description: 'The address to query. Leave empty to use credentials address.',
    displayOptions: {
      show: {
        resource: ['coin'],
        operation: ['getAllCoinBalances'],
      },
    },
  },
  {
    displayName: 'Destination Coin ID',
    name: 'destinationCoinId',
    type: 'string',
    required: true,
    default: '',
    placeholder: '0x...',
    description: 'The coin object ID to merge into',
    displayOptions: {
      show: {
        resource: ['coin'],
        operation: ['mergeCoins'],
      },
    },
  },
  {
    displayName: 'Source Coin IDs',
    name: 'sourceCoinIds',
    type: 'string',
    required: true,
    default: '',
    placeholder: '0x..., 0x...',
    description: 'Comma-separated list of coin object IDs to merge from',
    displayOptions: {
      show: {
        resource: ['coin'],
        operation: ['mergeCoins'],
      },
    },
  },
  {
    displayName: 'Coin ID to Split',
    name: 'coinId',
    type: 'string',
    required: true,
    default: '',
    placeholder: '0x...',
    description: 'The coin object ID to split',
    displayOptions: {
      show: {
        resource: ['coin'],
        operation: ['splitCoin'],
      },
    },
  },
  {
    displayName: 'Split Amounts',
    name: 'splitAmounts',
    type: 'string',
    required: true,
    default: '',
    placeholder: '1000000000, 2000000000',
    description: 'Comma-separated list of amounts to split into (in MIST)',
    displayOptions: {
      show: {
        resource: ['coin'],
        operation: ['splitCoin'],
      },
    },
  },
  {
    displayName: 'Gas Budget (MIST)',
    name: 'gasBudget',
    type: 'number',
    default: 10000000,
    description: 'Gas budget in MIST',
    displayOptions: {
      show: {
        resource: ['coin'],
        operation: ['mergeCoins', 'splitCoin'],
      },
    },
  },
];

export async function executeCoinOperation(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const operation = this.getNodeParameter('operation', index) as string;
  const { client, keypair, address } = await initializeSuiFromContext(this);

  switch (operation) {
    case 'getCoinMetadata': {
      const coinType = this.getNodeParameter('coinType', index) as string;
      const metadata = await client.getCoinMetadata({ coinType });
      
      return [{
        json: metadata ? { ...metadata } : { error: 'Metadata not found for coin type' },
      }];
    }

    case 'getTotalSupply': {
      const coinType = this.getNodeParameter('coinType', index) as string;
      const supply = await client.getTotalSupply({ coinType });
      
      return [{
        json: {
          coinType,
          totalSupply: supply.value,
        },
      }];
    }

    case 'getAllCoinBalances': {
      const queryAddress = (this.getNodeParameter('address', index) as string) || address;
      if (!queryAddress) throw new Error('Address is required');
      
      const balances = await client.getAllBalances({ owner: queryAddress });
      
      return balances.map((balance) => ({
        json: {
          address: queryAddress,
          coinType: balance.coinType,
          totalBalance: balance.totalBalance,
          coinObjectCount: balance.coinObjectCount,
        },
      }));
    }

    case 'mergeCoins': {
      if (!keypair) throw new Error('Private key is required for transactions');
      
      const destinationCoinId = this.getNodeParameter('destinationCoinId', index) as string;
      const sourceCoinIdsStr = this.getNodeParameter('sourceCoinIds', index) as string;
      const gasBudget = this.getNodeParameter('gasBudget', index) as number;
      
      const sourceCoinIds = sourceCoinIdsStr.split(',').map((id) => id.trim());
      
      const tx = buildMergeCoins(destinationCoinId, sourceCoinIds);
      tx.setGasBudget(BigInt(gasBudget));
      
      const result = await signAndExecuteTransaction(client, keypair, tx, {
        showEffects: true,
        showObjectChanges: true,
      });
      
      return [{
        json: {
          digest: result.digest,
          status: result.effects?.status,
          gasUsed: result.effects?.gasUsed,
          destinationCoinId,
          mergedCoins: sourceCoinIds,
        },
      }];
    }

    case 'splitCoin': {
      if (!keypair) throw new Error('Private key is required for transactions');
      
      const coinId = this.getNodeParameter('coinId', index) as string;
      const splitAmountsStr = this.getNodeParameter('splitAmounts', index) as string;
      const gasBudget = this.getNodeParameter('gasBudget', index) as number;
      
      const amounts = splitAmountsStr.split(',').map((a) => BigInt(a.trim()));
      
      const tx = buildSplitCoins(coinId, amounts);
      tx.setGasBudget(BigInt(gasBudget));
      
      const result = await signAndExecuteTransaction(client, keypair, tx, {
        showEffects: true,
        showObjectChanges: true,
      });
      
      return [{
        json: {
          digest: result.digest,
          status: result.effects?.status,
          gasUsed: result.effects?.gasUsed,
          originalCoinId: coinId,
          splitAmounts: amounts.map((a) => a.toString()),
        },
      }];
    }

    default:
      throw new Error(`Unknown operation: ${operation}`);
  }
}
