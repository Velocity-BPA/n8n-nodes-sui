/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { initializeSuiFromContext } from '../../transport/suiClient';

export const objectOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['object'],
      },
    },
    options: [
      { name: 'Get Object', value: 'getObject', description: 'Get object by ID', action: 'Get object' },
      { name: 'Get Multiple Objects', value: 'multiGetObjects', description: 'Get multiple objects by IDs', action: 'Get multiple objects' },
      { name: 'Get Dynamic Fields', value: 'getDynamicFields', description: 'Get dynamic fields of an object', action: 'Get dynamic fields' },
      { name: 'Get Dynamic Field Object', value: 'getDynamicFieldObject', description: 'Get a specific dynamic field object', action: 'Get dynamic field object' },
      { name: 'Get Past Object', value: 'getPastObject', description: 'Get object at a specific version', action: 'Get past object' },
    ],
    default: 'getObject',
  },
];

export const objectFields: INodeProperties[] = [
  {
    displayName: 'Object ID',
    name: 'objectId',
    type: 'string',
    required: true,
    default: '',
    placeholder: '0x...',
    description: 'The object ID',
    displayOptions: {
      show: {
        resource: ['object'],
        operation: ['getObject', 'getDynamicFields', 'getDynamicFieldObject', 'getPastObject'],
      },
    },
  },
  {
    displayName: 'Object IDs',
    name: 'objectIds',
    type: 'string',
    required: true,
    default: '',
    placeholder: '0x..., 0x...',
    description: 'Comma-separated list of object IDs',
    displayOptions: {
      show: {
        resource: ['object'],
        operation: ['multiGetObjects'],
      },
    },
  },
  {
    displayName: 'Version',
    name: 'version',
    type: 'number',
    required: true,
    default: 0,
    description: 'The object version',
    displayOptions: {
      show: {
        resource: ['object'],
        operation: ['getPastObject'],
      },
    },
  },
  {
    displayName: 'Dynamic Field Name Type',
    name: 'dynamicFieldNameType',
    type: 'string',
    required: true,
    default: '',
    placeholder: 'u64 or 0x1::string::String',
    description: 'The type of the dynamic field name',
    displayOptions: {
      show: {
        resource: ['object'],
        operation: ['getDynamicFieldObject'],
      },
    },
  },
  {
    displayName: 'Dynamic Field Name Value',
    name: 'dynamicFieldNameValue',
    type: 'string',
    required: true,
    default: '',
    description: 'The value of the dynamic field name',
    displayOptions: {
      show: {
        resource: ['object'],
        operation: ['getDynamicFieldObject'],
      },
    },
  },
  {
    displayName: 'Limit',
    name: 'limit',
    type: 'number',
    default: 50,
    description: 'Maximum number of dynamic fields to return',
    displayOptions: {
      show: {
        resource: ['object'],
        operation: ['getDynamicFields'],
      },
    },
  },
  {
    displayName: 'Show Content',
    name: 'showContent',
    type: 'boolean',
    default: true,
    description: 'Whether to include object content',
    displayOptions: {
      show: {
        resource: ['object'],
        operation: ['getObject', 'multiGetObjects', 'getPastObject'],
      },
    },
  },
  {
    displayName: 'Show Display',
    name: 'showDisplay',
    type: 'boolean',
    default: true,
    description: 'Whether to include display data',
    displayOptions: {
      show: {
        resource: ['object'],
        operation: ['getObject', 'multiGetObjects'],
      },
    },
  },
];

export async function executeObjectOperation(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const operation = this.getNodeParameter('operation', index) as string;
  const { client } = await initializeSuiFromContext(this);

  switch (operation) {
    case 'getObject': {
      const objectId = this.getNodeParameter('objectId', index) as string;
      const showContent = this.getNodeParameter('showContent', index) as boolean;
      const showDisplay = this.getNodeParameter('showDisplay', index) as boolean;
      
      const object = await client.getObject({
        id: objectId,
        options: {
          showType: true,
          showOwner: true,
          showContent,
          showDisplay,
        },
      });
      
      return [{
        json: object.data ? { ...object.data } : { error: 'Object not found', objectId },
      }];
    }

    case 'multiGetObjects': {
      const objectIdsStr = this.getNodeParameter('objectIds', index) as string;
      const showContent = this.getNodeParameter('showContent', index) as boolean;
      const showDisplay = this.getNodeParameter('showDisplay', index) as boolean;
      
      const objectIds = objectIdsStr.split(',').map((id) => id.trim());
      
      const objects = await client.multiGetObjects({
        ids: objectIds,
        options: {
          showType: true,
          showOwner: true,
          showContent,
          showDisplay,
        },
      });
      
      return objects.map((obj) => ({
        json: obj.data ? { ...obj.data } : { error: 'Object not found' },
      }));
    }

    case 'getDynamicFields': {
      const objectId = this.getNodeParameter('objectId', index) as string;
      const limit = this.getNodeParameter('limit', index) as number;
      
      const fields = await client.getDynamicFields({
        parentId: objectId,
        limit,
      });
      
      return fields.data.map((field) => ({
        json: field,
      }));
    }

    case 'getDynamicFieldObject': {
      const objectId = this.getNodeParameter('objectId', index) as string;
      const nameType = this.getNodeParameter('dynamicFieldNameType', index) as string;
      const nameValue = this.getNodeParameter('dynamicFieldNameValue', index) as string;
      
      const field = await client.getDynamicFieldObject({
        parentId: objectId,
        name: {
          type: nameType,
          value: nameValue,
        },
      });
      
      return [{
        json: field.data ? { ...field.data } : { error: 'Dynamic field not found' },
      }];
    }

    case 'getPastObject': {
      const objectId = this.getNodeParameter('objectId', index) as string;
      const version = this.getNodeParameter('version', index) as number;
      const showContent = this.getNodeParameter('showContent', index) as boolean;
      
      const object = await client.tryGetPastObject({
        id: objectId,
        version,
        options: {
          showType: true,
          showOwner: true,
          showContent,
        },
      });
      
      return [{
        json: object,
      }];
    }

    default:
      throw new Error(`Unknown operation: ${operation}`);
  }
}
