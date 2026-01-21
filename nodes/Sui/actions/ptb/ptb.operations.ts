/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { initializeSuiFromContext, signAndExecuteTransaction, dryRunTransaction } from '../../transport/suiClient';
import { Transaction } from '@mysten/sui/transactions';
import { suiToMist } from '../../utils';

export const ptbOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['ptb'],
      },
    },
    options: [
      { name: 'Build and Execute', value: 'buildAndExecute', description: 'Build and execute a custom PTB', action: 'Build and execute PTB' },
      { name: 'Build and Dry Run', value: 'buildAndDryRun', description: 'Build and dry run a PTB without executing', action: 'Build and dry run PTB' },
      { name: 'Multi-Operation', value: 'multiOperation', description: 'Execute multiple operations in a single transaction', action: 'Multi operation PTB' },
    ],
    default: 'multiOperation',
  },
];

export const ptbFields: INodeProperties[] = [
  {
    displayName: 'Operations',
    name: 'operations',
    type: 'fixedCollection',
    typeOptions: {
      multipleValues: true,
    },
    default: {},
    placeholder: 'Add Operation',
    displayOptions: {
      show: {
        resource: ['ptb'],
        operation: ['multiOperation'],
      },
    },
    options: [
      {
        name: 'operationItems',
        displayName: 'Operation',
        values: [
          {
            displayName: 'Type',
            name: 'type',
            type: 'options',
            options: [
              { name: 'Transfer SUI', value: 'transferSui' },
              { name: 'Transfer Object', value: 'transferObject' },
              { name: 'Move Call', value: 'moveCall' },
              { name: 'Split Coins', value: 'splitCoins' },
              { name: 'Merge Coins', value: 'mergeCoins' },
            ],
            default: 'transferSui',
          },
          {
            displayName: 'Recipient',
            name: 'recipient',
            type: 'string',
            default: '',
            placeholder: '0x...',
            displayOptions: {
              show: {
                type: ['transferSui', 'transferObject'],
              },
            },
          },
          {
            displayName: 'Amount (SUI)',
            name: 'amount',
            type: 'number',
            default: 0,
            displayOptions: {
              show: {
                type: ['transferSui'],
              },
            },
          },
          {
            displayName: 'Object ID',
            name: 'objectId',
            type: 'string',
            default: '',
            placeholder: '0x...',
            displayOptions: {
              show: {
                type: ['transferObject'],
              },
            },
          },
          {
            displayName: 'Package ID',
            name: 'packageId',
            type: 'string',
            default: '',
            placeholder: '0x...',
            displayOptions: {
              show: {
                type: ['moveCall'],
              },
            },
          },
          {
            displayName: 'Module',
            name: 'module',
            type: 'string',
            default: '',
            displayOptions: {
              show: {
                type: ['moveCall'],
              },
            },
          },
          {
            displayName: 'Function',
            name: 'function',
            type: 'string',
            default: '',
            displayOptions: {
              show: {
                type: ['moveCall'],
              },
            },
          },
          {
            displayName: 'Arguments (JSON)',
            name: 'arguments',
            type: 'json',
            default: '[]',
            displayOptions: {
              show: {
                type: ['moveCall'],
              },
            },
          },
          {
            displayName: 'Type Arguments (JSON)',
            name: 'typeArguments',
            type: 'json',
            default: '[]',
            displayOptions: {
              show: {
                type: ['moveCall'],
              },
            },
          },
          {
            displayName: 'Coin Object ID',
            name: 'coinObjectId',
            type: 'string',
            default: '',
            placeholder: '0x...',
            displayOptions: {
              show: {
                type: ['splitCoins'],
              },
            },
          },
          {
            displayName: 'Amounts (JSON Array)',
            name: 'splitAmounts',
            type: 'json',
            default: '[]',
            placeholder: '[1000000000, 2000000000]',
            displayOptions: {
              show: {
                type: ['splitCoins'],
              },
            },
          },
          {
            displayName: 'Primary Coin ID',
            name: 'primaryCoinId',
            type: 'string',
            default: '',
            placeholder: '0x...',
            displayOptions: {
              show: {
                type: ['mergeCoins'],
              },
            },
          },
          {
            displayName: 'Coins to Merge (JSON Array)',
            name: 'coinsToMerge',
            type: 'json',
            default: '[]',
            placeholder: '["0x...", "0x..."]',
            displayOptions: {
              show: {
                type: ['mergeCoins'],
              },
            },
          },
        ],
      },
    ],
  },
  {
    displayName: 'Custom Transaction (JSON)',
    name: 'customTransaction',
    type: 'json',
    required: true,
    default: '{}',
    placeholder: '{ "moveCall": { "target": "0x2::coin::split", "arguments": [...] } }',
    description: 'Custom PTB definition in JSON format',
    displayOptions: {
      show: {
        resource: ['ptb'],
        operation: ['buildAndExecute', 'buildAndDryRun'],
      },
    },
  },
  {
    displayName: 'Gas Budget',
    name: 'gasBudget',
    type: 'number',
    default: 10000000,
    description: 'Maximum gas to spend on this transaction',
    displayOptions: {
      show: {
        resource: ['ptb'],
        operation: ['buildAndExecute', 'buildAndDryRun', 'multiOperation'],
      },
    },
  },
];

export async function executePtbOperation(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const operation = this.getNodeParameter('operation', index) as string;
  const { client, keypair, address } = await initializeSuiFromContext(this);
  const gasBudget = this.getNodeParameter('gasBudget', index) as number;

  switch (operation) {
    case 'multiOperation': {
      const operationsData = this.getNodeParameter('operations', index) as {
        operationItems?: Array<{
          type: string;
          recipient?: string;
          amount?: number;
          objectId?: string;
          packageId?: string;
          module?: string;
          function?: string;
          arguments?: string;
          typeArguments?: string;
          coinObjectId?: string;
          splitAmounts?: string;
          primaryCoinId?: string;
          coinsToMerge?: string;
        }>;
      };
      
      const items = operationsData.operationItems || [];
      if (items.length === 0) {
        throw new Error('At least one operation is required');
      }
      
      const tx = new Transaction();
      tx.setGasBudget(gasBudget);
      
      for (const item of items) {
        switch (item.type) {
          case 'transferSui': {
            if (!item.recipient) throw new Error('Recipient is required for transferSui');
            const amountMist = suiToMist(item.amount || 0);
            const [coin] = tx.splitCoins(tx.gas, [amountMist]);
            tx.transferObjects([coin], item.recipient);
            break;
          }
          case 'transferObject': {
            if (!item.objectId || !item.recipient) {
              throw new Error('Object ID and recipient are required for transferObject');
            }
            tx.transferObjects([tx.object(item.objectId)], item.recipient);
            break;
          }
          case 'moveCall': {
            if (!item.packageId || !item.module || !item.function) {
              throw new Error('Package ID, module, and function are required for moveCall');
            }
            const args = item.arguments ? JSON.parse(item.arguments) : [];
            const typeArgs = item.typeArguments ? JSON.parse(item.typeArguments) : [];
            tx.moveCall({
              target: `${item.packageId}::${item.module}::${item.function}`,
              arguments: args.map((arg: unknown) => {
                if (typeof arg === 'string' && arg.startsWith('0x')) {
                  return tx.object(arg);
                }
                return tx.pure.u64(arg as number);
              }),
              typeArguments: typeArgs,
            });
            break;
          }
          case 'splitCoins': {
            if (!item.coinObjectId) throw new Error('Coin object ID is required for splitCoins');
            const amounts = item.splitAmounts ? JSON.parse(item.splitAmounts) : [];
            tx.splitCoins(tx.object(item.coinObjectId), amounts.map((a: number) => tx.pure.u64(a)));
            break;
          }
          case 'mergeCoins': {
            if (!item.primaryCoinId) throw new Error('Primary coin ID is required for mergeCoins');
            const coinsToMerge = item.coinsToMerge ? JSON.parse(item.coinsToMerge) : [];
            tx.mergeCoins(
              tx.object(item.primaryCoinId),
              coinsToMerge.map((id: string) => tx.object(id)),
            );
            break;
          }
        }
      }
      
      if (!keypair) throw new Error('Private key is required to execute transactions');
      
      const result = await signAndExecuteTransaction(client, keypair, tx);
      
      return [{
        json: {
          digest: result.digest,
          effects: result.effects,
          events: result.events,
          objectChanges: result.objectChanges,
          balanceChanges: result.balanceChanges,
          operationCount: items.length,
        },
      }];
    }

    case 'buildAndExecute':
    case 'buildAndDryRun': {
      const customTransaction = this.getNodeParameter('customTransaction', index) as string;
      const txDef = JSON.parse(customTransaction);
      
      const tx = new Transaction();
      tx.setGasBudget(gasBudget);
      
      // Process the custom transaction definition
      if (txDef.moveCall) {
        const { target, arguments: args = [], typeArguments = [] } = txDef.moveCall;
        tx.moveCall({
          target,
          arguments: args.map((arg: unknown) => {
            if (typeof arg === 'object' && arg !== null && 'Object' in arg) {
              return tx.object((arg as { Object: string }).Object);
            }
            if (typeof arg === 'object' && arg !== null && 'Pure' in arg) {
              return tx.pure.u64((arg as { Pure: number }).Pure);
            }
            return tx.pure.u64(arg as number);
          }),
          typeArguments,
        });
      }
      
      if (txDef.transferObjects) {
        const { objects, recipient } = txDef.transferObjects;
        tx.transferObjects(
          objects.map((obj: string) => tx.object(obj)),
          recipient,
        );
      }
      
      if (operation === 'buildAndDryRun') {
        tx.setSender(address!);
        const result = await dryRunTransaction(client, tx);
        return [{
          json: {
            dryRun: true,
            effects: result.effects,
            events: result.events,
            objectChanges: result.objectChanges,
            balanceChanges: result.balanceChanges,
          },
        }];
      }
      
      if (!keypair) throw new Error('Private key is required to execute transactions');
      
      const result = await signAndExecuteTransaction(client, keypair, tx);
      
      return [{
        json: {
          digest: result.digest,
          effects: result.effects,
          events: result.events,
          objectChanges: result.objectChanges,
          balanceChanges: result.balanceChanges,
        },
      }];
    }

    default:
      throw new Error(`Unknown operation: ${operation}`);
  }
}
