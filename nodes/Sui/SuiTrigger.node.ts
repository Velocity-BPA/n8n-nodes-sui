/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
  ITriggerFunctions,
  INodeType,
  INodeTypeDescription,
  ITriggerResponse,
} from 'n8n-workflow';
import { createWebSocketClient } from './transport/websocketClient';
import { getSuiCredentials } from './transport/suiClient';
import type { EventFilter } from './constants/types';

export class SuiTrigger implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Sui Trigger',
    name: 'suiTrigger',
    icon: 'file:sui.svg',
    group: ['trigger'],
    version: 1,
    subtitle: '={{$parameter["triggerType"]}}',
    description: 'Listen for Sui blockchain events in real-time',
    defaults: {
      name: 'Sui Trigger',
    },
    inputs: [],
    outputs: ['main'],
    credentials: [
      {
        name: 'suiNetwork',
        required: true,
      },
    ],
    properties: [
      {
        displayName: 'Trigger Type',
        name: 'triggerType',
        type: 'options',
        options: [
          {
            name: 'Event',
            value: 'event',
            description: 'Listen for specific event types',
          },
          {
            name: 'Transaction',
            value: 'transaction',
            description: 'Listen for transactions matching a filter',
          },
        ],
        default: 'event',
        description: 'What type of activity to listen for',
      },
      // Event trigger options
      {
        displayName: 'Event Filter Type',
        name: 'eventFilterType',
        type: 'options',
        displayOptions: {
          show: {
            triggerType: ['event'],
          },
        },
        options: [
          {
            name: 'By Package',
            value: 'package',
            description: 'Filter events by package ID',
          },
          {
            name: 'By Module',
            value: 'module',
            description: 'Filter events by module',
          },
          {
            name: 'By Move Event Type',
            value: 'moveEventType',
            description: 'Filter by specific Move event type',
          },
          {
            name: 'By Sender',
            value: 'sender',
            description: 'Filter events by sender address',
          },
          {
            name: 'All Events',
            value: 'all',
            description: 'Listen for all events',
          },
        ],
        default: 'package',
      },
      {
        displayName: 'Package ID',
        name: 'packageId',
        type: 'string',
        displayOptions: {
          show: {
            triggerType: ['event'],
            eventFilterType: ['package', 'module'],
          },
        },
        default: '',
        placeholder: '0x...',
        description: 'The package ID to filter events by',
      },
      {
        displayName: 'Module Name',
        name: 'moduleName',
        type: 'string',
        displayOptions: {
          show: {
            triggerType: ['event'],
            eventFilterType: ['module'],
          },
        },
        default: '',
        description: 'The module name to filter events by',
      },
      {
        displayName: 'Move Event Type',
        name: 'moveEventType',
        type: 'string',
        displayOptions: {
          show: {
            triggerType: ['event'],
            eventFilterType: ['moveEventType'],
          },
        },
        default: '',
        placeholder: '0x2::coin::CoinDeposit<0x2::sui::SUI>',
        description: 'The full Move event type string',
      },
      {
        displayName: 'Sender Address',
        name: 'senderAddress',
        type: 'string',
        displayOptions: {
          show: {
            triggerType: ['event'],
            eventFilterType: ['sender'],
          },
        },
        default: '',
        placeholder: '0x...',
        description: 'The sender address to filter events by',
      },
      // Transaction trigger options
      {
        displayName: 'Transaction Filter Type',
        name: 'txFilterType',
        type: 'options',
        displayOptions: {
          show: {
            triggerType: ['transaction'],
          },
        },
        options: [
          {
            name: 'From Address',
            value: 'fromAddress',
            description: 'Transactions sent from a specific address',
          },
          {
            name: 'To Address',
            value: 'toAddress',
            description: 'Transactions sent to a specific address',
          },
          {
            name: 'Input Object',
            value: 'inputObject',
            description: 'Transactions that use a specific object as input',
          },
          {
            name: 'Changed Object',
            value: 'changedObject',
            description: 'Transactions that modified a specific object',
          },
        ],
        default: 'fromAddress',
      },
      {
        displayName: 'Address',
        name: 'filterAddress',
        type: 'string',
        displayOptions: {
          show: {
            triggerType: ['transaction'],
            txFilterType: ['fromAddress', 'toAddress'],
          },
        },
        default: '',
        placeholder: '0x...',
        description: 'The address to filter transactions by',
      },
      {
        displayName: 'Object ID',
        name: 'filterObjectId',
        type: 'string',
        displayOptions: {
          show: {
            triggerType: ['transaction'],
            txFilterType: ['inputObject', 'changedObject'],
          },
        },
        default: '',
        placeholder: '0x...',
        description: 'The object ID to filter transactions by',
      },
    ],
  };

  async trigger(this: ITriggerFunctions): Promise<ITriggerResponse> {
    const triggerType = this.getNodeParameter('triggerType') as string;
    const credentials = await getSuiCredentials(this);
    const self = this;
    
    // Define event handler
    const onEvent = (event: unknown) => {
      const eventData = event as Record<string, unknown>;
      self.emit([
        self.helpers.returnJsonArray([
          {
            eventType: triggerType === 'event' ? 'sui_event' : 'sui_transaction',
            ...eventData,
            receivedAt: new Date().toISOString(),
          },
        ]),
      ]);
    };
    
    // Define error handler
    const onError = (error: Error) => {
      self.logger.error(`Sui WebSocket error: ${error.message}`);
    };
    
    // Create WebSocket client
    const wsClient = createWebSocketClient(credentials, onEvent, onError);
    await wsClient.connect();
    
    const manualTriggerFunction = async () => {
      // For manual execution, return a sample event
      self.emit([
        self.helpers.returnJsonArray([
          {
            type: 'manual_trigger',
            message: 'This is a sample event for manual testing',
            timestamp: new Date().toISOString(),
          },
        ]),
      ]);
    };
    
    if (triggerType === 'event') {
      const eventFilterType = this.getNodeParameter('eventFilterType') as string;
      
      let filter: EventFilter;
      
      switch (eventFilterType) {
        case 'package': {
          const packageId = this.getNodeParameter('packageId') as string;
          filter = { Package: packageId };
          break;
        }
        case 'module': {
          const packageId = this.getNodeParameter('packageId') as string;
          const moduleName = this.getNodeParameter('moduleName') as string;
          filter = {
            MoveEventModule: {
              package: packageId,
              module: moduleName,
            },
          };
          break;
        }
        case 'moveEventType': {
          const moveEventType = this.getNodeParameter('moveEventType') as string;
          filter = { MoveEventType: moveEventType };
          break;
        }
        case 'sender': {
          const senderAddress = this.getNodeParameter('senderAddress') as string;
          filter = { Sender: senderAddress };
          break;
        }
        case 'all':
        default:
          // Use sender with wildcard or empty transaction filter
          filter = {};
          break;
      }
      
      await wsClient.subscribeEvent(filter);
    } else if (triggerType === 'transaction') {
      const txFilterType = this.getNodeParameter('txFilterType') as string;
      
      let address: string;
      
      switch (txFilterType) {
        case 'fromAddress':
        case 'toAddress': {
          address = this.getNodeParameter('filterAddress') as string;
          break;
        }
        case 'inputObject':
        case 'changedObject': {
          address = this.getNodeParameter('filterObjectId') as string;
          break;
        }
        default:
          throw new Error(`Unknown transaction filter type: ${txFilterType}`);
      }
      
      await wsClient.subscribeTransaction(address);
    }
    
    const closeFunction = async () => {
      wsClient.close();
    };
    
    return {
      closeFunction,
      manualTriggerFunction,
    };
  }
}
