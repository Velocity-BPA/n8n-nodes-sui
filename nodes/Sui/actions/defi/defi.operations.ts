/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { initializeSuiFromContext } from '../../transport/suiClient';
import { DEX_PACKAGES } from '../../constants/packages';

export const defiOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['defi'],
      },
    },
    options: [
      { name: 'Get Protocol Info', value: 'getProtocolInfo', description: 'Get information about DEX protocols', action: 'Get protocol info' },
      { name: 'Get Pool Object', value: 'getPoolObject', description: 'Get pool object by ID', action: 'Get pool object' },
      { name: 'Query Pools', value: 'queryPools', description: 'Query pools by protocol', action: 'Query pools' },
    ],
    default: 'getProtocolInfo',
  },
];

export const defiFields: INodeProperties[] = [
  {
    displayName: 'Protocol',
    name: 'protocol',
    type: 'options',
    options: [
      { name: 'Cetus', value: 'cetus' },
      { name: 'Turbos', value: 'turbos' },
      { name: 'Kriya', value: 'kriya' },
      { name: 'FlowX', value: 'flowx' },
      { name: 'Aftermath', value: 'aftermath' },
    ],
    default: 'cetus',
    description: 'The DeFi protocol',
    displayOptions: {
      show: {
        resource: ['defi'],
        operation: ['getProtocolInfo', 'queryPools'],
      },
    },
  },
  {
    displayName: 'Pool Object ID',
    name: 'poolObjectId',
    type: 'string',
    required: true,
    default: '',
    placeholder: '0x...',
    description: 'The pool object ID',
    displayOptions: {
      show: {
        resource: ['defi'],
        operation: ['getPoolObject'],
      },
    },
  },
  {
    displayName: 'Limit',
    name: 'limit',
    type: 'number',
    default: 10,
    description: 'Maximum number of pools to return',
    displayOptions: {
      show: {
        resource: ['defi'],
        operation: ['queryPools'],
      },
    },
  },
];

export async function executeDefiOperation(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const operation = this.getNodeParameter('operation', index) as string;
  const { client, credentials } = await initializeSuiFromContext(this);

  switch (operation) {
    case 'getProtocolInfo': {
      const protocol = this.getNodeParameter('protocol', index) as string;
      const network = credentials.network === 'testnet' ? 'testnet' : 'mainnet';
      
      const protocolMap: Record<string, { mainnet: string; testnet: string }> = {
        cetus: DEX_PACKAGES.CETUS,
        turbos: DEX_PACKAGES.TURBOS,
        kriya: DEX_PACKAGES.KRIYA,
        flowx: DEX_PACKAGES.FLOWX,
        aftermath: DEX_PACKAGES.AFTERMATH,
      };
      
      const packageInfo = protocolMap[protocol];
      const packageId = packageInfo[network as 'mainnet' | 'testnet'];
      
      if (!packageId) {
        return [{
          json: {
            protocol,
            network,
            error: `${protocol} is not available on ${network}`,
          },
        }];
      }
      
      // Get package information
      const packageObj = await client.getObject({
        id: packageId,
        options: {
          showContent: true,
          showType: true,
        },
      });
      
      return [{
        json: {
          protocol,
          network,
          packageId,
          packageInfo: packageObj.data || { error: 'Package not found' },
        },
      }];
    }

    case 'getPoolObject': {
      const poolObjectId = this.getNodeParameter('poolObjectId', index) as string;
      
      const poolObj = await client.getObject({
        id: poolObjectId,
        options: {
          showContent: true,
          showType: true,
          showDisplay: true,
        },
      });
      
      return [{
        json: poolObj.data ? { ...poolObj.data } : { error: 'Pool not found', poolObjectId },
      }];
    }

    case 'queryPools': {
      const protocol = this.getNodeParameter('protocol', index) as string;
      const limit = this.getNodeParameter('limit', index) as number;
      const network = credentials.network === 'testnet' ? 'testnet' : 'mainnet';
      
      const protocolMap: Record<string, { mainnet: string; testnet: string }> = {
        cetus: DEX_PACKAGES.CETUS,
        turbos: DEX_PACKAGES.TURBOS,
        kriya: DEX_PACKAGES.KRIYA,
        flowx: DEX_PACKAGES.FLOWX,
        aftermath: DEX_PACKAGES.AFTERMATH,
      };
      
      const packageInfo = protocolMap[protocol];
      const packageId = packageInfo[network as 'mainnet' | 'testnet'];
      
      if (!packageId) {
        return [{
          json: {
            protocol,
            network,
            error: `${protocol} is not available on ${network}`,
            pools: [],
          },
        }];
      }
      
      // Query events to find pools (protocol-specific)
      const events = await client.queryEvents({
        query: { MoveModule: { package: packageId, module: 'pool' } },
        limit,
      });
      
      return [{
        json: {
          protocol,
          network,
          packageId,
          eventsFound: events.data.length,
          events: events.data,
        },
      }];
    }

    default:
      throw new Error(`Unknown operation: ${operation}`);
  }
}
