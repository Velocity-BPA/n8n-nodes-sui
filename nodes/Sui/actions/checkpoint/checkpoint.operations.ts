/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { initializeSuiFromContext } from '../../transport/suiClient';

export const checkpointOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['checkpoint'],
      },
    },
    options: [
      { name: 'Get Checkpoint', value: 'getCheckpoint', description: 'Get checkpoint by sequence number', action: 'Get checkpoint' },
      { name: 'Get Latest Checkpoint', value: 'getLatestCheckpoint', description: 'Get the latest checkpoint sequence number', action: 'Get latest checkpoint' },
      { name: 'Get Checkpoints', value: 'getCheckpoints', description: 'Get a range of checkpoints', action: 'Get checkpoints range' },
    ],
    default: 'getLatestCheckpoint',
  },
];

export const checkpointFields: INodeProperties[] = [
  {
    displayName: 'Checkpoint Sequence Number',
    name: 'sequenceNumber',
    type: 'string',
    required: true,
    default: '',
    placeholder: '12345',
    description: 'The checkpoint sequence number',
    displayOptions: {
      show: {
        resource: ['checkpoint'],
        operation: ['getCheckpoint'],
      },
    },
  },
  {
    displayName: 'Start Sequence Number',
    name: 'startSequenceNumber',
    type: 'string',
    default: '',
    placeholder: '12345',
    description: 'Starting checkpoint sequence number (leave empty to start from the beginning)',
    displayOptions: {
      show: {
        resource: ['checkpoint'],
        operation: ['getCheckpoints'],
      },
    },
  },
  {
    displayName: 'Limit',
    name: 'limit',
    type: 'number',
    default: 10,
    description: 'Maximum number of checkpoints to return',
    displayOptions: {
      show: {
        resource: ['checkpoint'],
        operation: ['getCheckpoints'],
      },
    },
  },
  {
    displayName: 'Descending Order',
    name: 'descendingOrder',
    type: 'boolean',
    default: true,
    description: 'Whether to return checkpoints in descending order',
    displayOptions: {
      show: {
        resource: ['checkpoint'],
        operation: ['getCheckpoints'],
      },
    },
  },
];

export async function executeCheckpointOperation(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const operation = this.getNodeParameter('operation', index) as string;
  const { client } = await initializeSuiFromContext(this);

  switch (operation) {
    case 'getCheckpoint': {
      const sequenceNumber = this.getNodeParameter('sequenceNumber', index) as string;
      
      const checkpoint = await client.getCheckpoint({ id: sequenceNumber });
      
      return [{
        json: {
          sequenceNumber: checkpoint.sequenceNumber,
          digest: checkpoint.digest,
          epoch: checkpoint.epoch,
          timestampMs: checkpoint.timestampMs,
          networkTotalTransactions: checkpoint.networkTotalTransactions,
          previousDigest: checkpoint.previousDigest,
          epochRollingGasCostSummary: checkpoint.epochRollingGasCostSummary,
          transactionCount: checkpoint.transactions?.length || 0,
        },
      }];
    }

    case 'getLatestCheckpoint': {
      const checkpoint = await client.getLatestCheckpointSequenceNumber();
      
      return [{
        json: {
          latestCheckpointSequenceNumber: checkpoint,
        },
      }];
    }

    case 'getCheckpoints': {
      const startSequenceNumber = this.getNodeParameter('startSequenceNumber', index) as string;
      const limit = this.getNodeParameter('limit', index) as number;
      const descendingOrder = this.getNodeParameter('descendingOrder', index) as boolean;
      
      const checkpoints = await client.getCheckpoints({
        cursor: startSequenceNumber || undefined,
        limit,
        descendingOrder,
      });
      
      return checkpoints.data.map((checkpoint) => ({
        json: {
          sequenceNumber: checkpoint.sequenceNumber,
          digest: checkpoint.digest,
          epoch: checkpoint.epoch,
          timestampMs: checkpoint.timestampMs,
          networkTotalTransactions: checkpoint.networkTotalTransactions,
          transactionCount: checkpoint.transactions?.length || 0,
        },
      }));
    }

    default:
      throw new Error(`Unknown operation: ${operation}`);
  }
}
