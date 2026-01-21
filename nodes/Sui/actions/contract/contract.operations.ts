/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { Transaction } from '@mysten/sui/transactions';
import { initializeSuiFromContext, signAndExecuteTransaction, dryRunTransaction } from '../../transport/suiClient';

export const contractOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['contract'],
      },
    },
    options: [
      { name: 'Move Call', value: 'moveCall', description: 'Execute a Move function call', action: 'Execute Move call' },
      { name: 'Dry Run Move Call', value: 'dryRunMoveCall', description: 'Dry run a Move function call', action: 'Dry run Move call' },
      { name: 'Dev Inspect', value: 'devInspect', description: 'Inspect a transaction without executing', action: 'Dev inspect transaction' },
    ],
    default: 'moveCall',
  },
];

export const contractFields: INodeProperties[] = [
  {
    displayName: 'Package ID',
    name: 'packageId',
    type: 'string',
    required: true,
    default: '',
    placeholder: '0x2',
    description: 'The package ID containing the module',
    displayOptions: {
      show: {
        resource: ['contract'],
        operation: ['moveCall', 'dryRunMoveCall', 'devInspect'],
      },
    },
  },
  {
    displayName: 'Module Name',
    name: 'moduleName',
    type: 'string',
    required: true,
    default: '',
    placeholder: 'coin',
    description: 'The module name',
    displayOptions: {
      show: {
        resource: ['contract'],
        operation: ['moveCall', 'dryRunMoveCall', 'devInspect'],
      },
    },
  },
  {
    displayName: 'Function Name',
    name: 'functionName',
    type: 'string',
    required: true,
    default: '',
    placeholder: 'transfer',
    description: 'The function name to call',
    displayOptions: {
      show: {
        resource: ['contract'],
        operation: ['moveCall', 'dryRunMoveCall', 'devInspect'],
      },
    },
  },
  {
    displayName: 'Type Arguments',
    name: 'typeArguments',
    type: 'string',
    default: '',
    placeholder: '0x2::sui::SUI',
    description: 'Comma-separated type arguments',
    displayOptions: {
      show: {
        resource: ['contract'],
        operation: ['moveCall', 'dryRunMoveCall', 'devInspect'],
      },
    },
  },
  {
    displayName: 'Arguments',
    name: 'arguments',
    type: 'fixedCollection',
    typeOptions: {
      multipleValues: true,
    },
    default: {},
    description: 'Function arguments',
    displayOptions: {
      show: {
        resource: ['contract'],
        operation: ['moveCall', 'dryRunMoveCall', 'devInspect'],
      },
    },
    options: [
      {
        name: 'argumentValues',
        displayName: 'Argument',
        values: [
          {
            displayName: 'Type',
            name: 'type',
            type: 'options',
            options: [
              { name: 'Object ID', value: 'object' },
              { name: 'Pure Value', value: 'pure' },
              { name: 'Address', value: 'address' },
              { name: 'U64', value: 'u64' },
              { name: 'U128', value: 'u128' },
              { name: 'Bool', value: 'bool' },
              { name: 'String', value: 'string' },
            ],
            default: 'object',
            description: 'The argument type',
          },
          {
            displayName: 'Value',
            name: 'value',
            type: 'string',
            default: '',
            description: 'The argument value',
          },
        ],
      },
    ],
  },
  {
    displayName: 'Gas Budget (MIST)',
    name: 'gasBudget',
    type: 'number',
    default: 50000000,
    description: 'Gas budget in MIST',
    displayOptions: {
      show: {
        resource: ['contract'],
        operation: ['moveCall'],
      },
    },
  },
];

export async function executeContractOperation(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const operation = this.getNodeParameter('operation', index) as string;
  const { client, keypair, address } = await initializeSuiFromContext(this);

  const packageId = this.getNodeParameter('packageId', index) as string;
  const moduleName = this.getNodeParameter('moduleName', index) as string;
  const functionName = this.getNodeParameter('functionName', index) as string;
  const typeArgumentsStr = this.getNodeParameter('typeArguments', index) as string;
  const argumentsData = this.getNodeParameter('arguments', index) as {
    argumentValues?: Array<{ type: string; value: string }>;
  };

  const typeArguments = typeArgumentsStr
    ? typeArgumentsStr.split(',').map((t) => t.trim())
    : [];

  // Build transaction
  const tx = new Transaction();
  
  // Process arguments
  const processedArgs: Parameters<Transaction['moveCall']>[0]['arguments'] = [];
  if (argumentsData.argumentValues) {
    for (const arg of argumentsData.argumentValues) {
      switch (arg.type) {
        case 'object':
          processedArgs.push(tx.object(arg.value));
          break;
        case 'address':
          processedArgs.push(tx.pure.address(arg.value));
          break;
        case 'u64':
          processedArgs.push(tx.pure.u64(BigInt(arg.value)));
          break;
        case 'u128':
          processedArgs.push(tx.pure.u128(BigInt(arg.value)));
          break;
        case 'bool':
          processedArgs.push(tx.pure.bool(arg.value === 'true'));
          break;
        case 'string':
          processedArgs.push(tx.pure.string(arg.value));
          break;
        case 'pure':
        default:
          processedArgs.push(tx.pure.string(arg.value));
          break;
      }
    }
  }

  tx.moveCall({
    target: `${packageId}::${moduleName}::${functionName}`,
    typeArguments,
    arguments: processedArgs,
  });

  switch (operation) {
    case 'moveCall': {
      if (!keypair || !address) throw new Error('Private key is required for Move calls');
      
      const gasBudget = this.getNodeParameter('gasBudget', index) as number;
      tx.setGasBudget(BigInt(gasBudget));
      
      const result = await signAndExecuteTransaction(client, keypair, tx, {
        showEffects: true,
        showEvents: true,
        showObjectChanges: true,
      });
      
      return [{
        json: {
          digest: result.digest,
          status: result.effects?.status,
          gasUsed: result.effects?.gasUsed,
          events: result.events,
          objectChanges: result.objectChanges,
          target: `${packageId}::${moduleName}::${functionName}`,
        },
      }];
    }

    case 'dryRunMoveCall': {
      if (!address) throw new Error('Address is required for dry run');
      
      const result = await dryRunTransaction(client, tx, address);
      
      return [{
        json: {
          effects: result.effects,
          events: result.events,
          balanceChanges: result.balanceChanges,
          objectChanges: result.objectChanges,
          target: `${packageId}::${moduleName}::${functionName}`,
        },
      }];
    }

    case 'devInspect': {
      if (!address) throw new Error('Address is required for dev inspect');
      
      const txBytes = await tx.build({ client });
      const result = await client.devInspectTransactionBlock({
        transactionBlock: txBytes,
        sender: address,
      });
      
      return [{
        json: {
          effects: result.effects,
          events: result.events,
          results: result.results,
          error: result.error,
          target: `${packageId}::${moduleName}::${functionName}`,
        },
      }];
    }

    default:
      throw new Error(`Unknown operation: ${operation}`);
  }
}
