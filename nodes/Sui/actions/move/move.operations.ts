/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { initializeSuiFromContext } from '../../transport/suiClient';

export const moveOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['move'],
      },
    },
    options: [
      { name: 'Get Module', value: 'getModule', description: 'Get a Move module by package and name', action: 'Get module' },
      { name: 'Get All Modules', value: 'getAllModules', description: 'Get all modules in a package', action: 'Get all modules' },
      { name: 'Get Normalized Module', value: 'getNormalizedModule', description: 'Get normalized Move module', action: 'Get normalized module' },
      { name: 'Get Function', value: 'getFunction', description: 'Get function information', action: 'Get function info' },
      { name: 'Get Struct', value: 'getStruct', description: 'Get struct information', action: 'Get struct info' },
    ],
    default: 'getModule',
  },
];

export const moveFields: INodeProperties[] = [
  {
    displayName: 'Package ID',
    name: 'packageId',
    type: 'string',
    required: true,
    default: '',
    placeholder: '0x2',
    description: 'The package ID',
    displayOptions: {
      show: {
        resource: ['move'],
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
        resource: ['move'],
        operation: ['getModule', 'getNormalizedModule', 'getFunction', 'getStruct'],
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
    description: 'The function name',
    displayOptions: {
      show: {
        resource: ['move'],
        operation: ['getFunction'],
      },
    },
  },
  {
    displayName: 'Struct Name',
    name: 'structName',
    type: 'string',
    required: true,
    default: '',
    placeholder: 'Coin',
    description: 'The struct name',
    displayOptions: {
      show: {
        resource: ['move'],
        operation: ['getStruct'],
      },
    },
  },
];

export async function executeMoveOperation(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const operation = this.getNodeParameter('operation', index) as string;
  const { client } = await initializeSuiFromContext(this);
  const packageId = this.getNodeParameter('packageId', index) as string;

  switch (operation) {
    case 'getModule': {
      const moduleName = this.getNodeParameter('moduleName', index) as string;
      
      const module = await client.getNormalizedMoveModule({
        package: packageId,
        module: moduleName,
      });
      
      return [{
        json: JSON.parse(JSON.stringify(module)),
      }];
    }

    case 'getAllModules': {
      const modules = await client.getNormalizedMoveModulesByPackage({
        package: packageId,
      });
      
      return Object.entries(modules).map(([name, mod]) => ({
        json: JSON.parse(JSON.stringify({
          moduleName: name,
          ...mod,
        })),
      }));
    }

    case 'getNormalizedModule': {
      const moduleName = this.getNodeParameter('moduleName', index) as string;
      
      const module = await client.getNormalizedMoveModule({
        package: packageId,
        module: moduleName,
      });
      
      return [{
        json: JSON.parse(JSON.stringify(module)),
      }];
    }

    case 'getFunction': {
      const moduleName = this.getNodeParameter('moduleName', index) as string;
      const functionName = this.getNodeParameter('functionName', index) as string;
      
      const func = await client.getNormalizedMoveFunction({
        package: packageId,
        module: moduleName,
        function: functionName,
      });
      
      return [{
        json: JSON.parse(JSON.stringify({
          packageId,
          moduleName,
          functionName,
          ...func,
        })),
      }];
    }

    case 'getStruct': {
      const moduleName = this.getNodeParameter('moduleName', index) as string;
      const structName = this.getNodeParameter('structName', index) as string;
      
      const struct = await client.getNormalizedMoveStruct({
        package: packageId,
        module: moduleName,
        struct: structName,
      });
      
      return [{
        json: JSON.parse(JSON.stringify({
          packageId,
          moduleName,
          structName,
          ...struct,
        })),
      }];
    }

    default:
      throw new Error(`Unknown operation: ${operation}`);
  }
}
