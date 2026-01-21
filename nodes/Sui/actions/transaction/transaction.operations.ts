/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { initializeSuiFromContext, signAndExecuteTransaction, dryRunTransaction, waitForTransaction, estimateGas } from '../../transport/suiClient';
import { suiToMist, mistToSui, buildTransferSui, buildMultiTransferSui, buildPayAllSui, buildTransferObject } from '../../utils';

export const transactionOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['transaction'],
      },
    },
    options: [
      { name: 'Transfer SUI', value: 'transferSui', description: 'Transfer SUI to an address', action: 'Transfer SUI' },
      { name: 'Transfer Object', value: 'transferObject', description: 'Transfer an object to an address', action: 'Transfer object' },
      { name: 'Pay SUI (Multi)', value: 'paySui', description: 'Transfer SUI to multiple recipients', action: 'Pay SUI to multiple recipients' },
      { name: 'Pay All SUI', value: 'payAllSui', description: 'Transfer all SUI to an address (drain wallet)', action: 'Pay all SUI' },
      { name: 'Get Transaction', value: 'getTransaction', description: 'Get transaction by digest', action: 'Get transaction' },
      { name: 'Dry Run', value: 'dryRun', description: 'Dry run a transaction to estimate gas', action: 'Dry run transaction' },
      { name: 'Wait For Transaction', value: 'waitForTransaction', description: 'Wait for a transaction to be confirmed', action: 'Wait for transaction' },
      { name: 'Estimate Gas', value: 'estimateGas', description: 'Estimate gas cost for a transfer', action: 'Estimate gas cost' },
    ],
    default: 'transferSui',
  },
];

export const transactionFields: INodeProperties[] = [
  {
    displayName: 'Recipient',
    name: 'recipient',
    type: 'string',
    required: true,
    default: '',
    placeholder: '0x...',
    description: 'The recipient address',
    displayOptions: {
      show: {
        resource: ['transaction'],
        operation: ['transferSui', 'transferObject', 'payAllSui', 'dryRun', 'estimateGas'],
      },
    },
  },
  {
    displayName: 'Amount (SUI)',
    name: 'amount',
    type: 'number',
    required: true,
    default: 0,
    description: 'Amount of SUI to transfer',
    displayOptions: {
      show: {
        resource: ['transaction'],
        operation: ['transferSui', 'dryRun', 'estimateGas'],
      },
    },
  },
  {
    displayName: 'Object ID',
    name: 'objectId',
    type: 'string',
    required: true,
    default: '',
    placeholder: '0x...',
    description: 'The object ID to transfer',
    displayOptions: {
      show: {
        resource: ['transaction'],
        operation: ['transferObject'],
      },
    },
  },
  {
    displayName: 'Recipients',
    name: 'recipients',
    type: 'fixedCollection',
    typeOptions: {
      multipleValues: true,
    },
    default: {},
    description: 'Recipients and amounts for multi-transfer',
    displayOptions: {
      show: {
        resource: ['transaction'],
        operation: ['paySui'],
      },
    },
    options: [
      {
        name: 'recipientValues',
        displayName: 'Recipient',
        values: [
          {
            displayName: 'Address',
            name: 'address',
            type: 'string',
            default: '',
            description: 'Recipient address',
          },
          {
            displayName: 'Amount (SUI)',
            name: 'amount',
            type: 'number',
            default: 0,
            description: 'Amount of SUI to send',
          },
        ],
      },
    ],
  },
  {
    displayName: 'Transaction Digest',
    name: 'digest',
    type: 'string',
    required: true,
    default: '',
    description: 'The transaction digest',
    displayOptions: {
      show: {
        resource: ['transaction'],
        operation: ['getTransaction', 'waitForTransaction'],
      },
    },
  },
  {
    displayName: 'Timeout (ms)',
    name: 'timeout',
    type: 'number',
    default: 60000,
    description: 'Timeout in milliseconds',
    displayOptions: {
      show: {
        resource: ['transaction'],
        operation: ['waitForTransaction'],
      },
    },
  },
  {
    displayName: 'Gas Budget (MIST)',
    name: 'gasBudget',
    type: 'number',
    default: 10000000,
    description: 'Gas budget in MIST (1 SUI = 1,000,000,000 MIST)',
    displayOptions: {
      show: {
        resource: ['transaction'],
        operation: ['transferSui', 'transferObject', 'paySui', 'payAllSui'],
      },
    },
  },
];

export async function executeTransactionOperation(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const operation = this.getNodeParameter('operation', index) as string;
  const { client, keypair, address } = await initializeSuiFromContext(this);

  switch (operation) {
    case 'transferSui': {
      if (!keypair || !address) throw new Error('Private key is required for transactions');
      
      const recipient = this.getNodeParameter('recipient', index) as string;
      const amount = this.getNodeParameter('amount', index) as number;
      const gasBudget = this.getNodeParameter('gasBudget', index) as number;
      
      const tx = buildTransferSui(recipient, amount);
      tx.setGasBudget(BigInt(gasBudget));
      
      const result = await signAndExecuteTransaction(client, keypair, tx, {
        showEffects: true,
        showEvents: true,
        showBalanceChanges: true,
      });
      
      return [{
        json: {
          digest: result.digest,
          status: result.effects?.status,
          gasUsed: result.effects?.gasUsed,
          from: address,
          to: recipient,
          amount: amount.toString(),
          amountMist: suiToMist(amount).toString(),
        },
      }];
    }

    case 'transferObject': {
      if (!keypair || !address) throw new Error('Private key is required for transactions');
      
      const recipient = this.getNodeParameter('recipient', index) as string;
      const objectId = this.getNodeParameter('objectId', index) as string;
      const gasBudget = this.getNodeParameter('gasBudget', index) as number;
      
      const tx = buildTransferObject(objectId, recipient);
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
          objectId,
          from: address,
          to: recipient,
        },
      }];
    }

    case 'paySui': {
      if (!keypair || !address) throw new Error('Private key is required for transactions');
      
      const recipientsData = this.getNodeParameter('recipients', index) as {
        recipientValues: Array<{ address: string; amount: number }>;
      };
      const gasBudget = this.getNodeParameter('gasBudget', index) as number;
      
      if (!recipientsData.recipientValues || recipientsData.recipientValues.length === 0) {
        throw new Error('At least one recipient is required');
      }
      
      const recipients = recipientsData.recipientValues.map((r) => r.address);
      const amounts = recipientsData.recipientValues.map((r) => r.amount);
      
      const tx = buildMultiTransferSui(recipients, amounts);
      tx.setGasBudget(BigInt(gasBudget));
      
      const result = await signAndExecuteTransaction(client, keypair, tx, {
        showEffects: true,
        showBalanceChanges: true,
      });
      
      return [{
        json: {
          digest: result.digest,
          status: result.effects?.status,
          gasUsed: result.effects?.gasUsed,
          from: address,
          recipients: recipientsData.recipientValues,
        },
      }];
    }

    case 'payAllSui': {
      if (!keypair || !address) throw new Error('Private key is required for transactions');
      
      const recipient = this.getNodeParameter('recipient', index) as string;
      const gasBudget = this.getNodeParameter('gasBudget', index) as number;
      
      const tx = buildPayAllSui(recipient);
      tx.setGasBudget(BigInt(gasBudget));
      
      const result = await signAndExecuteTransaction(client, keypair, tx, {
        showEffects: true,
        showBalanceChanges: true,
      });
      
      return [{
        json: {
          digest: result.digest,
          status: result.effects?.status,
          gasUsed: result.effects?.gasUsed,
          from: address,
          to: recipient,
          drainedWallet: true,
        },
      }];
    }

    case 'getTransaction': {
      const digest = this.getNodeParameter('digest', index) as string;
      
      const txBlock = await client.getTransactionBlock({
        digest,
        options: {
          showEffects: true,
          showEvents: true,
          showInput: true,
          showObjectChanges: true,
          showBalanceChanges: true,
        },
      });
      
      return [{
        json: JSON.parse(JSON.stringify(txBlock)),
      }];
    }

    case 'dryRun': {
      if (!address) throw new Error('Address is required for dry run');
      
      const recipient = this.getNodeParameter('recipient', index) as string;
      const amount = this.getNodeParameter('amount', index) as number;
      
      const tx = buildTransferSui(recipient, amount);
      const result = await dryRunTransaction(client, tx, address);
      
      return [{
        json: JSON.parse(JSON.stringify({
          effects: result.effects,
          events: result.events,
          balanceChanges: result.balanceChanges,
          objectChanges: result.objectChanges,
        })),
      }];
    }

    case 'waitForTransaction': {
      const digest = this.getNodeParameter('digest', index) as string;
      const timeout = this.getNodeParameter('timeout', index) as number;
      
      const result = await waitForTransaction(client, digest, { timeout });
      
      return [{
        json: JSON.parse(JSON.stringify(result)),
      }];
    }

    case 'estimateGas': {
      if (!address) throw new Error('Address is required for gas estimation');
      
      const recipient = this.getNodeParameter('recipient', index) as string;
      const amount = this.getNodeParameter('amount', index) as number;
      
      const tx = buildTransferSui(recipient, amount);
      const gasEstimate = await estimateGas(client, tx, address);
      
      return [{
        json: {
          gasEstimate: gasEstimate.toString(),
          gasEstimateSui: mistToSui(gasEstimate),
        },
      }];
    }

    default:
      throw new Error(`Unknown operation: ${operation}`);
  }
}
