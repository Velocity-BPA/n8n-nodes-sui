/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

// Account operations
import {
  accountOperations,
  accountFields,
  executeAccountOperation,
} from './actions/account/account.operations';

// Transaction operations
import {
  transactionOperations,
  transactionFields,
  executeTransactionOperation,
} from './actions/transaction/transaction.operations';

// Coin operations
import {
  coinOperations,
  coinFields,
  executeCoinOperation,
} from './actions/coin/coin.operations';

// Object operations
import {
  objectOperations,
  objectFields,
  executeObjectOperation,
} from './actions/object/object.operations';

// NFT operations
import {
  nftOperations,
  nftFields,
  executeNftOperation,
} from './actions/nft/nft.operations';

// Move module operations
import {
  moveOperations,
  moveFields,
  executeMoveOperation,
} from './actions/move/move.operations';

// Smart contract operations
import {
  contractOperations,
  contractFields,
  executeContractOperation,
} from './actions/contract/contract.operations';

// Staking operations
import {
  stakingOperations,
  stakingFields,
  executeStakingOperation,
} from './actions/staking/staking.operations';

// DeFi operations
import {
  defiOperations,
  defiFields,
  executeDefiOperation,
} from './actions/defi/defi.operations';

// Checkpoint operations
import {
  checkpointOperations,
  checkpointFields,
  executeCheckpointOperation,
} from './actions/checkpoint/checkpoint.operations';

// Event operations
import {
  eventOperations,
  eventFields,
  executeEventOperation,
} from './actions/event/event.operations';

// Name Service operations
import {
  nameServiceOperations,
  nameServiceFields,
  executeNameServiceOperation,
} from './actions/nameService/nameService.operations';

// PTB operations
import {
  ptbOperations,
  ptbFields,
  executePtbOperation,
} from './actions/ptb/ptb.operations';

// Utility operations
import {
  utilityOperations,
  utilityFields,
  executeUtilityOperation,
} from './actions/utility/utility.operations';

export class Sui implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Sui',
    name: 'sui',
    icon: 'file:sui.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
    description: 'Interact with the Sui blockchain - transactions, objects, NFTs, staking, DeFi, and more',
    defaults: {
      name: 'Sui',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'suiNetwork',
        required: true,
      },
      {
        name: 'suiScan',
        required: false,
      },
    ],
    properties: [
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: [
          { name: 'Account', value: 'account', description: 'Manage accounts and balances' },
          { name: 'Checkpoint', value: 'checkpoint', description: 'Query checkpoints' },
          { name: 'Coin', value: 'coin', description: 'Manage coins and tokens' },
          { name: 'Contract', value: 'contract', description: 'Interact with smart contracts' },
          { name: 'DeFi', value: 'defi', description: 'DeFi protocol integrations' },
          { name: 'Event', value: 'event', description: 'Query blockchain events' },
          { name: 'Move Module', value: 'move', description: 'Query Move modules and functions' },
          { name: 'Name Service', value: 'nameService', description: 'SuiNS name resolution' },
          { name: 'NFT', value: 'nft', description: 'Manage NFTs' },
          { name: 'Object', value: 'object', description: 'Query and manage objects' },
          { name: 'PTB', value: 'ptb', description: 'Programmable Transaction Blocks' },
          { name: 'Staking', value: 'staking', description: 'Staking operations' },
          { name: 'Transaction', value: 'transaction', description: 'Send and manage transactions' },
          { name: 'Utility', value: 'utility', description: 'Utility functions and chain info' },
        ],
        default: 'account',
      },
      // Account operations
      ...accountOperations,
      ...accountFields,
      // Transaction operations
      ...transactionOperations,
      ...transactionFields,
      // Coin operations
      ...coinOperations,
      ...coinFields,
      // Object operations
      ...objectOperations,
      ...objectFields,
      // NFT operations
      ...nftOperations,
      ...nftFields,
      // Move operations
      ...moveOperations,
      ...moveFields,
      // Contract operations
      ...contractOperations,
      ...contractFields,
      // Staking operations
      ...stakingOperations,
      ...stakingFields,
      // DeFi operations
      ...defiOperations,
      ...defiFields,
      // Checkpoint operations
      ...checkpointOperations,
      ...checkpointFields,
      // Event operations
      ...eventOperations,
      ...eventFields,
      // Name Service operations
      ...nameServiceOperations,
      ...nameServiceFields,
      // PTB operations
      ...ptbOperations,
      ...ptbFields,
      // Utility operations
      ...utilityOperations,
      ...utilityFields,
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];
    const resource = this.getNodeParameter('resource', 0) as string;

    for (let i = 0; i < items.length; i++) {
      try {
        let results: INodeExecutionData[];

        switch (resource) {
          case 'account':
            results = await executeAccountOperation.call(this, i);
            break;
          case 'transaction':
            results = await executeTransactionOperation.call(this, i);
            break;
          case 'coin':
            results = await executeCoinOperation.call(this, i);
            break;
          case 'object':
            results = await executeObjectOperation.call(this, i);
            break;
          case 'nft':
            results = await executeNftOperation.call(this, i);
            break;
          case 'move':
            results = await executeMoveOperation.call(this, i);
            break;
          case 'contract':
            results = await executeContractOperation.call(this, i);
            break;
          case 'staking':
            results = await executeStakingOperation.call(this, i);
            break;
          case 'defi':
            results = await executeDefiOperation.call(this, i);
            break;
          case 'checkpoint':
            results = await executeCheckpointOperation.call(this, i);
            break;
          case 'event':
            results = await executeEventOperation.call(this, i);
            break;
          case 'nameService':
            results = await executeNameServiceOperation.call(this, i);
            break;
          case 'ptb':
            results = await executePtbOperation.call(this, i);
            break;
          case 'utility':
            results = await executeUtilityOperation.call(this, i);
            break;
          default:
            throw new NodeOperationError(this.getNode(), `Unknown resource: ${resource}`);
        }

        returnData.push(...results);
      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({
            json: {
              error: error instanceof Error ? error.message : 'Unknown error',
            },
            pairedItem: { item: i },
          });
          continue;
        }
        throw error;
      }
    }

    return [returnData];
  }
}
