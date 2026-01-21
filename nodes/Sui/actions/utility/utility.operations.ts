/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { initializeSuiFromContext } from '../../transport/suiClient';
import { suiToMist, mistToSui, formatBalance } from '../../utils';
import { MIST_PER_SUI, COMMON_COINS } from '../../constants/coins';

export const utilityOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['utility'],
      },
    },
    options: [
      { name: 'Convert SUI to MIST', value: 'suiToMist', description: 'Convert SUI to MIST (smallest unit)', action: 'Convert SUI to MIST' },
      { name: 'Convert MIST to SUI', value: 'mistToSui', description: 'Convert MIST to SUI', action: 'Convert MIST to SUI' },
      { name: 'Get Chain Info', value: 'getChainInfo', description: 'Get chain identifier and protocol version', action: 'Get chain info' },
      { name: 'Get Protocol Config', value: 'getProtocolConfig', description: 'Get current protocol configuration', action: 'Get protocol config' },
      { name: 'Get Reference Gas Price', value: 'getReferenceGasPrice', description: 'Get the current reference gas price', action: 'Get reference gas price' },
      { name: 'Get Total Transactions', value: 'getTotalTransactions', description: 'Get total transaction count', action: 'Get total transactions' },
      { name: 'Format Balance', value: 'formatBalance', description: 'Format a balance with proper decimals', action: 'Format balance' },
      { name: 'Get Common Coins', value: 'getCommonCoins', description: 'Get list of common coin types', action: 'Get common coins' },
    ],
    default: 'getChainInfo',
  },
];

export const utilityFields: INodeProperties[] = [
  {
    displayName: 'Amount (SUI)',
    name: 'suiAmount',
    type: 'number',
    required: true,
    default: 1,
    description: 'Amount in SUI to convert',
    displayOptions: {
      show: {
        resource: ['utility'],
        operation: ['suiToMist'],
      },
    },
  },
  {
    displayName: 'Amount (MIST)',
    name: 'mistAmount',
    type: 'string',
    required: true,
    default: '1000000000',
    description: 'Amount in MIST to convert',
    displayOptions: {
      show: {
        resource: ['utility'],
        operation: ['mistToSui'],
      },
    },
  },
  {
    displayName: 'Balance (Raw)',
    name: 'rawBalance',
    type: 'string',
    required: true,
    default: '',
    placeholder: '1000000000',
    description: 'Raw balance to format',
    displayOptions: {
      show: {
        resource: ['utility'],
        operation: ['formatBalance'],
      },
    },
  },
  {
    displayName: 'Decimals',
    name: 'decimals',
    type: 'number',
    default: 9,
    description: 'Number of decimals for the coin (SUI = 9)',
    displayOptions: {
      show: {
        resource: ['utility'],
        operation: ['formatBalance'],
      },
    },
  },
  {
    displayName: 'Symbol',
    name: 'symbol',
    type: 'string',
    default: 'SUI',
    description: 'Symbol to append to formatted balance',
    displayOptions: {
      show: {
        resource: ['utility'],
        operation: ['formatBalance'],
      },
    },
  },
  {
    displayName: 'Protocol Version',
    name: 'protocolVersion',
    type: 'string',
    default: '',
    placeholder: 'Leave empty for latest',
    description: 'Specific protocol version to query (leave empty for latest)',
    displayOptions: {
      show: {
        resource: ['utility'],
        operation: ['getProtocolConfig'],
      },
    },
  },
];

export async function executeUtilityOperation(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const operation = this.getNodeParameter('operation', index) as string;

  switch (operation) {
    case 'suiToMist': {
      const suiAmount = this.getNodeParameter('suiAmount', index) as number;
      const mistAmount = suiToMist(suiAmount);
      
      return [{
        json: {
          sui: suiAmount,
          mist: mistAmount.toString(),
          mistPerSui: MIST_PER_SUI.toString(),
        },
      }];
    }

    case 'mistToSui': {
      const mistAmount = this.getNodeParameter('mistAmount', index) as string;
      const suiAmount = mistToSui(mistAmount);
      
      return [{
        json: {
          mist: mistAmount,
          sui: suiAmount,
          mistPerSui: MIST_PER_SUI.toString(),
        },
      }];
    }

    case 'getChainInfo': {
      const { client } = await initializeSuiFromContext(this);
      const chainId = await client.getChainIdentifier();
      
      return [{
        json: {
          chainId,
        },
      }];
    }

    case 'getProtocolConfig': {
      const { client } = await initializeSuiFromContext(this);
      const protocolVersion = this.getNodeParameter('protocolVersion', index) as string;
      
      const config = await client.getProtocolConfig({
        version: protocolVersion || undefined,
      });
      
      return [{
        json: {
          protocolVersion: config.protocolVersion,
          featureFlags: config.featureFlags,
          attributes: config.attributes,
        },
      }];
    }

    case 'getReferenceGasPrice': {
      const { client } = await initializeSuiFromContext(this);
      const gasPrice = await client.getReferenceGasPrice();
      
      return [{
        json: {
          referenceGasPrice: gasPrice.toString(),
          referenceGasPriceMist: gasPrice.toString(),
        },
      }];
    }

    case 'getTotalTransactions': {
      const { client } = await initializeSuiFromContext(this);
      const totalTx = await client.getTotalTransactionBlocks();
      
      return [{
        json: {
          totalTransactionBlocks: totalTx.toString(),
        },
      }];
    }

    case 'formatBalance': {
      const rawBalance = this.getNodeParameter('rawBalance', index) as string;
      const decimals = this.getNodeParameter('decimals', index) as number;
      const symbol = this.getNodeParameter('symbol', index) as string;
      
      const formatted = formatBalance(rawBalance, decimals, symbol);
      
      return [{
        json: {
          raw: rawBalance,
          formatted,
          decimals,
          symbol,
        },
      }];
    }

    case 'getCommonCoins': {
      const coins = Object.entries(COMMON_COINS).map(([symbol, info]) => ({
        symbol,
        type: info.type,
        decimals: info.decimals,
      }));
      
      return [{
        json: {
          coins,
          count: coins.length,
        },
      }];
    }

    default:
      throw new Error(`Unknown operation: ${operation}`);
  }
}
