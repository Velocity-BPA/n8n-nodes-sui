/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { initializeSuiFromContext } from '../../transport/suiClient';
import { mistToSui, isValidSuiAddress } from '../../utils';
import { SUI_COIN_TYPE } from '../../constants/coins';
import axios from 'axios';

export const accountOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['account'],
      },
    },
    options: [
      { name: 'Get Balance', value: 'getBalance', description: 'Get SUI balance for an address', action: 'Get SUI balance' },
      { name: 'Get All Balances', value: 'getAllBalances', description: 'Get all coin balances for an address', action: 'Get all balances' },
      { name: 'Get Coins', value: 'getCoins', description: 'Get coins of a specific type owned by an address', action: 'Get coins by type' },
      { name: 'Get Objects', value: 'getObjects', description: 'Get objects owned by an address', action: 'Get owned objects' },
      { name: 'Get Transaction History', value: 'getTransactionHistory', description: 'Get transaction history for an address', action: 'Get transaction history' },
      { name: 'Request Faucet', value: 'requestFaucet', description: 'Request tokens from faucet (testnet/devnet)', action: 'Request faucet tokens' },
      { name: 'Validate Address', value: 'validateAddress', description: 'Check if an address is valid', action: 'Validate address' },
    ],
    default: 'getBalance',
  },
];

export const accountFields: INodeProperties[] = [
  {
    displayName: 'Address',
    name: 'address',
    type: 'string',
    required: true,
    default: '',
    placeholder: '0x...',
    description: 'The Sui address to query. Leave empty to use the address from credentials.',
    displayOptions: {
      show: {
        resource: ['account'],
        operation: ['getBalance', 'getAllBalances', 'getCoins', 'getObjects', 'getTransactionHistory', 'requestFaucet'],
      },
    },
  },
  {
    displayName: 'Address to Validate',
    name: 'addressToValidate',
    type: 'string',
    required: true,
    default: '',
    placeholder: '0x...',
    description: 'The address to validate',
    displayOptions: {
      show: {
        resource: ['account'],
        operation: ['validateAddress'],
      },
    },
  },
  {
    displayName: 'Coin Type',
    name: 'coinType',
    type: 'string',
    default: SUI_COIN_TYPE,
    placeholder: '0x2::sui::SUI',
    description: 'The coin type to query',
    displayOptions: {
      show: {
        resource: ['account'],
        operation: ['getCoins'],
      },
    },
  },
  {
    displayName: 'Limit',
    name: 'limit',
    type: 'number',
    default: 50,
    description: 'Maximum number of items to return',
    displayOptions: {
      show: {
        resource: ['account'],
        operation: ['getCoins', 'getObjects', 'getTransactionHistory'],
      },
    },
  },
];

export async function executeAccountOperation(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const operation = this.getNodeParameter('operation', index) as string;
  const { client, address: credentialAddress, credentials } = await initializeSuiFromContext(this);

  switch (operation) {
    case 'getBalance': {
      const address = (this.getNodeParameter('address', index) as string) || credentialAddress;
      if (!address) throw new Error('Address is required');
      
      const balance = await client.getBalance({
        owner: address,
        coinType: SUI_COIN_TYPE,
      });
      
      return [{
        json: {
          address,
          coinType: balance.coinType,
          totalBalance: balance.totalBalance,
          totalBalanceSui: mistToSui(balance.totalBalance),
          coinObjectCount: balance.coinObjectCount,
        },
      }];
    }

    case 'getAllBalances': {
      const address = (this.getNodeParameter('address', index) as string) || credentialAddress;
      if (!address) throw new Error('Address is required');
      
      const balances = await client.getAllBalances({ owner: address });
      
      return balances.map((balance) => ({
        json: {
          address,
          coinType: balance.coinType,
          totalBalance: balance.totalBalance,
          coinObjectCount: balance.coinObjectCount,
        },
      }));
    }

    case 'getCoins': {
      const address = (this.getNodeParameter('address', index) as string) || credentialAddress;
      if (!address) throw new Error('Address is required');
      
      const coinType = this.getNodeParameter('coinType', index) as string;
      const limit = this.getNodeParameter('limit', index) as number;
      
      const coins = await client.getCoins({
        owner: address,
        coinType,
        limit,
      });
      
      return coins.data.map((coin) => ({
        json: {
          coinObjectId: coin.coinObjectId,
          coinType: coin.coinType,
          balance: coin.balance,
          version: coin.version,
          digest: coin.digest,
        },
      }));
    }

    case 'getObjects': {
      const address = (this.getNodeParameter('address', index) as string) || credentialAddress;
      if (!address) throw new Error('Address is required');
      
      const limit = this.getNodeParameter('limit', index) as number;
      
      const objects = await client.getOwnedObjects({
        owner: address,
        options: {
          showType: true,
          showContent: true,
          showDisplay: true,
        },
        limit,
      });
      
      return objects.data.map((obj) => ({
        json: obj.data ? { ...obj.data } : { error: 'Object not found' },
      }));
    }

    case 'getTransactionHistory': {
      const address = (this.getNodeParameter('address', index) as string) || credentialAddress;
      if (!address) throw new Error('Address is required');
      
      const limit = this.getNodeParameter('limit', index) as number;
      
      const transactions = await client.queryTransactionBlocks({
        filter: { FromAddress: address },
        options: {
          showEffects: true,
          showEvents: true,
        },
        limit,
      });
      
      return transactions.data.map((tx) => ({
        json: {
          digest: tx.digest,
          timestampMs: tx.timestampMs,
          effects: tx.effects,
          events: tx.events,
        },
      }));
    }

    case 'requestFaucet': {
      const address = (this.getNodeParameter('address', index) as string) || credentialAddress;
      if (!address) throw new Error('Address is required');
      
      if (credentials.network === 'mainnet') {
        throw new Error('Faucet is not available on mainnet');
      }
      
      let faucetUrl = credentials.faucetUrl;
      if (!faucetUrl) {
        if (credentials.network === 'testnet') {
          faucetUrl = 'https://faucet.testnet.sui.io/gas';
        } else if (credentials.network === 'devnet') {
          faucetUrl = 'https://faucet.devnet.sui.io/gas';
        } else if (credentials.network === 'localnet') {
          faucetUrl = 'http://127.0.0.1:9123/gas';
        } else {
          throw new Error('Faucet URL is required for custom networks');
        }
      }
      
      const response = await axios.post(faucetUrl, {
        FixedAmountRequest: { recipient: address },
      }, {
        headers: { 'Content-Type': 'application/json' },
      });
      
      return [{
        json: {
          success: true,
          address,
          response: response.data,
        },
      }];
    }

    case 'validateAddress': {
      const addressToValidate = this.getNodeParameter('addressToValidate', index) as string;
      const isValid = isValidSuiAddress(addressToValidate);
      
      return [{
        json: {
          address: addressToValidate,
          isValid,
        },
      }];
    }

    default:
      throw new Error(`Unknown operation: ${operation}`);
  }
}
