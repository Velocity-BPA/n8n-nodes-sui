/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { initializeSuiFromContext } from '../../transport/suiClient';

export const eventOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['event'],
      },
    },
    options: [
      { name: 'Query Events', value: 'queryEvents', description: 'Query events by various filters', action: 'Query events' },
      { name: 'Get Events by Transaction', value: 'getEventsByTransaction', description: 'Get all events for a transaction', action: 'Get events by transaction' },
    ],
    default: 'queryEvents',
  },
];

export const eventFields: INodeProperties[] = [
  {
    displayName: 'Filter Type',
    name: 'filterType',
    type: 'options',
    required: true,
    options: [
      { name: 'By Sender', value: 'sender', description: 'Filter by sender address' },
      { name: 'By Package', value: 'package', description: 'Filter by package ID' },
      { name: 'By Module', value: 'module', description: 'Filter by module' },
      { name: 'By Move Event Type', value: 'moveEventType', description: 'Filter by Move event type' },
      { name: 'By Transaction', value: 'transaction', description: 'Filter by transaction digest' },
    ],
    default: 'sender',
    displayOptions: {
      show: {
        resource: ['event'],
        operation: ['queryEvents'],
      },
    },
  },
  {
    displayName: 'Sender Address',
    name: 'senderAddress',
    type: 'string',
    required: true,
    default: '',
    placeholder: '0x...',
    description: 'The sender address to filter by',
    displayOptions: {
      show: {
        resource: ['event'],
        operation: ['queryEvents'],
        filterType: ['sender'],
      },
    },
  },
  {
    displayName: 'Package ID',
    name: 'packageId',
    type: 'string',
    required: true,
    default: '',
    placeholder: '0x...',
    description: 'The package ID to filter by',
    displayOptions: {
      show: {
        resource: ['event'],
        operation: ['queryEvents'],
        filterType: ['package', 'module'],
      },
    },
  },
  {
    displayName: 'Module Name',
    name: 'moduleName',
    type: 'string',
    required: true,
    default: '',
    placeholder: 'my_module',
    description: 'The module name to filter by',
    displayOptions: {
      show: {
        resource: ['event'],
        operation: ['queryEvents'],
        filterType: ['module'],
      },
    },
  },
  {
    displayName: 'Move Event Type',
    name: 'moveEventType',
    type: 'string',
    required: true,
    default: '',
    placeholder: '0x2::coin::CoinCreated<0x2::sui::SUI>',
    description: 'The full Move event type',
    displayOptions: {
      show: {
        resource: ['event'],
        operation: ['queryEvents'],
        filterType: ['moveEventType'],
      },
    },
  },
  {
    displayName: 'Transaction Digest',
    name: 'transactionDigest',
    type: 'string',
    required: true,
    default: '',
    placeholder: 'ABC123...',
    description: 'The transaction digest',
    displayOptions: {
      show: {
        resource: ['event'],
        operation: ['queryEvents', 'getEventsByTransaction'],
        filterType: ['transaction'],
      },
    },
  },
  {
    displayName: 'Transaction Digest',
    name: 'txDigest',
    type: 'string',
    required: true,
    default: '',
    placeholder: 'ABC123...',
    description: 'The transaction digest to get events for',
    displayOptions: {
      show: {
        resource: ['event'],
        operation: ['getEventsByTransaction'],
      },
    },
  },
  {
    displayName: 'Limit',
    name: 'limit',
    type: 'number',
    default: 50,
    description: 'Maximum number of events to return',
    displayOptions: {
      show: {
        resource: ['event'],
        operation: ['queryEvents'],
      },
    },
  },
  {
    displayName: 'Descending Order',
    name: 'descendingOrder',
    type: 'boolean',
    default: true,
    description: 'Whether to return events in descending order',
    displayOptions: {
      show: {
        resource: ['event'],
        operation: ['queryEvents'],
      },
    },
  },
];

export async function executeEventOperation(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const operation = this.getNodeParameter('operation', index) as string;
  const { client } = await initializeSuiFromContext(this);

  switch (operation) {
    case 'queryEvents': {
      const filterType = this.getNodeParameter('filterType', index) as string;
      const limit = this.getNodeParameter('limit', index) as number;
      const descendingOrder = this.getNodeParameter('descendingOrder', index) as boolean;
      
      let filter: Record<string, unknown>;
      
      switch (filterType) {
        case 'sender': {
          const senderAddress = this.getNodeParameter('senderAddress', index) as string;
          filter = { Sender: senderAddress };
          break;
        }
        case 'package': {
          const packageId = this.getNodeParameter('packageId', index) as string;
          filter = { Package: packageId };
          break;
        }
        case 'module': {
          const packageId = this.getNodeParameter('packageId', index) as string;
          const moduleName = this.getNodeParameter('moduleName', index) as string;
          filter = { MoveModule: { package: packageId, module: moduleName } };
          break;
        }
        case 'moveEventType': {
          const moveEventType = this.getNodeParameter('moveEventType', index) as string;
          filter = { MoveEventType: moveEventType };
          break;
        }
        case 'transaction': {
          const transactionDigest = this.getNodeParameter('transactionDigest', index) as string;
          filter = { Transaction: transactionDigest };
          break;
        }
        default:
          throw new Error(`Unknown filter type: ${filterType}`);
      }
      
      const events = await client.queryEvents({
        query: filter as Parameters<typeof client.queryEvents>[0]['query'],
        limit,
        order: descendingOrder ? 'descending' : 'ascending',
      });
      
      return events.data.map((event) => ({
        json: {
          id: { ...event.id },
          packageId: event.packageId,
          transactionModule: event.transactionModule,
          sender: event.sender,
          type: event.type,
          parsedJson: event.parsedJson as Record<string, unknown> || {},
          bcs: event.bcs,
          timestampMs: event.timestampMs,
        },
      }));
    }

    case 'getEventsByTransaction': {
      const txDigest = this.getNodeParameter('txDigest', index) as string;
      
      const transaction = await client.getTransactionBlock({
        digest: txDigest,
        options: { showEvents: true },
      });
      
      const events = transaction.events || [];
      
      return events.map((event) => ({
        json: {
          id: { ...event.id },
          packageId: event.packageId,
          transactionModule: event.transactionModule,
          sender: event.sender,
          type: event.type,
          parsedJson: event.parsedJson as Record<string, unknown> || {},
          bcs: event.bcs,
          timestampMs: event.timestampMs,
        },
      }));
    }

    default:
      throw new Error(`Unknown operation: ${operation}`);
  }
}
