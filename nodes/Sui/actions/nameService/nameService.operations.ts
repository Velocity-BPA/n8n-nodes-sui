/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { initializeSuiFromContext } from '../../transport/suiClient';
import { SUINS_PACKAGE } from '../../constants/packages';

export const nameServiceOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['nameService'],
      },
    },
    options: [
      { name: 'Resolve Name', value: 'resolveName', description: 'Resolve a SuiNS name to an address', action: 'Resolve name to address' },
      { name: 'Lookup Address', value: 'lookupAddress', description: 'Get the primary SuiNS name for an address', action: 'Lookup address' },
      { name: 'Get Name Object', value: 'getNameObject', description: 'Get the full SuiNS name object details', action: 'Get name object' },
    ],
    default: 'resolveName',
  },
];

export const nameServiceFields: INodeProperties[] = [
  {
    displayName: 'Name',
    name: 'name',
    type: 'string',
    required: true,
    default: '',
    placeholder: 'myname.sui',
    description: 'The SuiNS name to resolve (e.g., myname.sui)',
    displayOptions: {
      show: {
        resource: ['nameService'],
        operation: ['resolveName', 'getNameObject'],
      },
    },
  },
  {
    displayName: 'Address',
    name: 'address',
    type: 'string',
    required: true,
    default: '',
    placeholder: '0x...',
    description: 'The address to lookup',
    displayOptions: {
      show: {
        resource: ['nameService'],
        operation: ['lookupAddress'],
      },
    },
  },
];

export async function executeNameServiceOperation(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const operation = this.getNodeParameter('operation', index) as string;
  const { client } = await initializeSuiFromContext(this);

  switch (operation) {
    case 'resolveName': {
      const name = this.getNodeParameter('name', index) as string;
      const normalizedName = name.endsWith('.sui') ? name : `${name}.sui`;
      
      try {
        const address = await client.resolveNameServiceAddress({ name: normalizedName });
        
        if (!address) {
          return [{
            json: {
              name: normalizedName,
              resolved: false,
              error: 'Name not found or not registered',
            },
          }];
        }
        
        return [{
          json: {
            name: normalizedName,
            resolved: true,
            address,
          },
        }];
      } catch (error) {
        return [{
          json: {
            name: normalizedName,
            resolved: false,
            error: error instanceof Error ? error.message : 'Failed to resolve name',
          },
        }];
      }
    }

    case 'lookupAddress': {
      const address = this.getNodeParameter('address', index) as string;
      
      try {
        const names = await client.resolveNameServiceNames({ address });
        
        return [{
          json: {
            address,
            primaryName: names.data[0] || null,
            allNames: names.data,
            hasName: names.data.length > 0,
          },
        }];
      } catch (error) {
        return [{
          json: {
            address,
            primaryName: null,
            allNames: [],
            hasName: false,
            error: error instanceof Error ? error.message : 'Failed to lookup address',
          },
        }];
      }
    }

    case 'getNameObject': {
      const name = this.getNodeParameter('name', index) as string;
      const normalizedName = name.endsWith('.sui') ? name : `${name}.sui`;
      
      try {
        // First resolve the name to get the address
        const address = await client.resolveNameServiceAddress({ name: normalizedName });
        
        if (!address) {
          return [{
            json: {
              name: normalizedName,
              found: false,
              error: 'Name not found or not registered',
            },
          }];
        }
        
        // Query the SuiNS registry for the name object
        const nameWithoutSuffix = normalizedName.replace('.sui', '');
        
        return [{
          json: {
            name: normalizedName,
            found: true,
            address,
            suinsPackage: SUINS_PACKAGE.mainnet,
            label: nameWithoutSuffix,
          },
        }];
      } catch (error) {
        return [{
          json: {
            name: normalizedName,
            found: false,
            error: error instanceof Error ? error.message : 'Failed to get name object',
          },
        }];
      }
    }

    default:
      throw new Error(`Unknown operation: ${operation}`);
  }
}
