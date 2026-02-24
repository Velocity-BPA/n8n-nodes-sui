/**
 * Copyright (c) 2026 Velocity BPA
 * 
 * Licensed under the Business Source License 1.1 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     https://github.com/VelocityBPA/n8n-nodes-sui/blob/main/LICENSE
 * 
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeOperationError,
  NodeApiError,
} from 'n8n-workflow';

export class Sui implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Sui',
    name: 'sui',
    icon: 'file:sui.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
    description: 'Interact with the Sui API',
    defaults: {
      name: 'Sui',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'suiApi',
        required: true,
      },
    ],
    properties: [
      // Resource selector
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'Transactions',
            value: 'transactions',
          },
          {
            name: 'Objects',
            value: 'objects',
          },
          {
            name: 'Addresses',
            value: 'addresses',
          },
          {
            name: 'Validators',
            value: 'validators',
          },
          {
            name: 'unknown',
            value: 'unknown',
          },
          {
            name: 'Packages',
            value: 'packages',
          },
          {
            name: 'System',
            value: 'system',
          }
        ],
        default: 'transactions',
      },
      // Operation dropdowns per resource
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['transactions'],
    },
  },
  options: [
    {
      name: 'Get Transaction',
      value: 'getTransaction',
      description: 'Get transaction details by digest',
      action: 'Get transaction details',
    },
    {
      name: 'Get Multiple Transactions',
      value: 'multiGetTransactions',
      description: 'Get multiple transactions by digests',
      action: 'Get multiple transactions',
    },
    {
      name: 'Query Transaction Blocks',
      value: 'queryTransactionBlocks',
      description: 'Query transactions with filters',
      action: 'Query transaction blocks',
    },
    {
      name: 'Execute Transaction Block',
      value: 'executeTransactionBlock',
      description: 'Execute a transaction block',
      action: 'Execute transaction block',
    },
    {
      name: 'Dry Run Transaction Block',
      value: 'dryRunTransactionBlock',
      description: 'Simulate transaction execution',
      action: 'Dry run transaction block',
    },
    {
      name: 'Dev Inspect Transaction Block',
      value: 'devInspectTransactionBlock',
      description: 'Inspect transaction for debugging',
      action: 'Dev inspect transaction block',
    },
  ],
  default: 'getTransaction',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['objects'],
    },
  },
  options: [
    {
      name: 'Get Object',
      value: 'getObject',
      description: 'Get object details by ID',
      action: 'Get object details',
    },
    {
      name: 'Get Multiple Objects',
      value: 'multiGetObjects',
      description: 'Get multiple objects by IDs',
      action: 'Get multiple objects',
    },
    {
      name: 'Get Owned Objects',
      value: 'getOwnedObjects',
      description: 'Get objects owned by address',
      action: 'Get owned objects',
    },
    {
      name: 'Query Objects',
      value: 'queryObjects',
      description: 'Query objects with filters',
      action: 'Query objects',
    },
    {
      name: 'Get Dynamic Fields',
      value: 'getDynamicFields',
      description: 'Get dynamic fields of an object',
      action: 'Get dynamic fields',
    },
    {
      name: 'Get Dynamic Field Object',
      value: 'getDynamicFieldObject',
      description: 'Get dynamic field object',
      action: 'Get dynamic field object',
    },
  ],
  default: 'getObject',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['addresses'],
    },
  },
  options: [
    {
      name: 'Get Balance',
      value: 'getBalance',
      description: 'Get coin balance for address',
      action: 'Get balance',
    },
    {
      name: 'Get All Balances',
      value: 'getAllBalances',
      description: 'Get all coin balances for address',
      action: 'Get all balances',
    },
    {
      name: 'Get Coins',
      value: 'getCoins',
      description: 'Get coin objects owned by address',
      action: 'Get coins',
    },
    {
      name: 'Get All Coins',
      value: 'getAllCoins',
      description: 'Get all coin objects owned by address',
      action: 'Get all coins',
    },
    {
      name: 'Get Total Supply',
      value: 'getTotalSupply',
      description: 'Get total supply of coin type',
      action: 'Get total supply',
    },
  ],
  default: 'getBalance',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['validators'],
    },
  },
  options: [
    {
      name: 'Get Latest Sui System State',
      value: 'getLatestSuiSystemState',
      description: 'Get current validator set and staking info',
      action: 'Get latest Sui system state',
    },
    {
      name: 'Get Validators APY',
      value: 'getValidatorsApy',
      description: 'Get validator APY information',
      action: 'Get validators APY',
    },
    {
      name: 'Get Stakes',
      value: 'getStakes',
      description: 'Get staking information for address',
      action: 'Get stakes by owner',
    },
    {
      name: 'Get Stakes By IDs',
      value: 'getStakesByIds',
      description: 'Get stakes by staking pool IDs',
      action: 'Get stakes by IDs',
    },
  ],
  default: 'getLatestSuiSystemState',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['events'],
    },
  },
  options: [
    {
      name: 'Query Events',
      value: 'queryEvents',
      description: 'Query blockchain events with filters',
      action: 'Query events',
    },
    {
      name: 'Subscribe to Events',
      value: 'subscribeEvent',
      description: 'Subscribe to real-time blockchain events',
      action: 'Subscribe to events',
    },
    {
      name: 'Subscribe to Transactions',
      value: 'subscribeTransaction',
      description: 'Subscribe to transaction events',
      action: 'Subscribe to transactions',
    },
    {
      name: 'Unsubscribe from Events',
      value: 'unsubscribeEvent',
      description: 'Unsubscribe from event stream',
      action: 'Unsubscribe from events',
    },
  ],
  default: 'queryEvents',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['packages'],
    },
  },
  options: [
    {
      name: 'Get Move Function Argument Types',
      value: 'getMoveFunctionArgTypes',
      description: 'Get function argument types for a Move function',
      action: 'Get Move function argument types',
    },
    {
      name: 'Get Normalized Move Function',
      value: 'getNormalizedMoveFunction',
      description: 'Get normalized Move function information',
      action: 'Get normalized Move function',
    },
    {
      name: 'Get Normalized Move Module',
      value: 'getNormalizedMoveModule',
      description: 'Get normalized Move module information',
      action: 'Get normalized Move module',
    },
    {
      name: 'Get Normalized Move Struct',
      value: 'getNormalizedMoveStruct',
      description: 'Get normalized Move struct information',
      action: 'Get normalized Move struct',
    },
    {
      name: 'Get All Modules in Package',
      value: 'getNormalizedMoveModulesByPackage',
      description: 'Get all normalized Move modules in a package',
      action: 'Get all modules in package',
    },
  ],
  default: 'getMoveFunctionArgTypes',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['system'],
    },
  },
  options: [
    {
      name: 'Get Reference Gas Price',
      value: 'getReferenceGasPrice',
      description: 'Get the current reference gas price',
      action: 'Get reference gas price',
    },
    {
      name: 'Get Network Metrics',
      value: 'getNetworkMetrics',
      description: 'Get network performance metrics',
      action: 'Get network metrics',
    },
    {
      name: 'Get Epochs',
      value: 'getEpochs',
      description: 'Get epoch information with pagination',
      action: 'Get epochs',
    },
    {
      name: 'Get Current Epoch',
      value: 'getCurrentEpoch',
      description: 'Get current epoch information',
      action: 'Get current epoch',
    },
    {
      name: 'Get Checkpoints',
      value: 'getCheckpoints',
      description: 'Get checkpoint information with pagination',
      action: 'Get checkpoints',
    },
    {
      name: 'Get Latest Checkpoint Sequence Number',
      value: 'getLatestCheckpointSequenceNumber',
      description: 'Get the latest checkpoint sequence number',
      action: 'Get latest checkpoint sequence number',
    },
  ],
  default: 'getReferenceGasPrice',
},
      // Parameter definitions
{
  displayName: 'Transaction Digest',
  name: 'digest',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['transactions'],
      operation: ['getTransaction'],
    },
  },
  default: '',
  description: 'The transaction digest to retrieve',
},
{
  displayName: 'Options',
  name: 'options',
  type: 'json',
  required: false,
  displayOptions: {
    show: {
      resource: ['transactions'],
      operation: ['getTransaction'],
    },
  },
  default: '{}',
  description: 'Additional options for the transaction query',
},
{
  displayName: 'Transaction Digests',
  name: 'digests',
  type: 'json',
  required: true,
  displayOptions: {
    show: {
      resource: ['transactions'],
      operation: ['multiGetTransactions'],
    },
  },
  default: '[]',
  description: 'Array of transaction digests to retrieve',
},
{
  displayName: 'Options',
  name: 'options',
  type: 'json',
  required: false,
  displayOptions: {
    show: {
      resource: ['transactions'],
      operation: ['multiGetTransactions'],
    },
  },
  default: '{}',
  description: 'Additional options for the transaction query',
},
{
  displayName: 'Filter',
  name: 'filter',
  type: 'json',
  required: true,
  displayOptions: {
    show: {
      resource: ['transactions'],
      operation: ['queryTransactionBlocks'],
    },
  },
  default: '{}',
  description: 'Filter criteria for transaction query',
},
{
  displayName: 'Cursor',
  name: 'cursor',
  type: 'string',
  required: false,
  displayOptions: {
    show: {
      resource: ['transactions'],
      operation: ['queryTransactionBlocks'],
    },
  },
  default: '',
  description: 'Pagination cursor for query results',
},
{
  displayName: 'Limit',
  name: 'limit',
  type: 'number',
  required: false,
  displayOptions: {
    show: {
      resource: ['transactions'],
      operation: ['queryTransactionBlocks'],
    },
  },
  default: 50,
  description: 'Maximum number of results to return',
},
{
  displayName: 'Descending Order',
  name: 'descendingOrder',
  type: 'boolean',
  required: false,
  displayOptions: {
    show: {
      resource: ['transactions'],
      operation: ['queryTransactionBlocks'],
    },
  },
  default: false,
  description: 'Whether to return results in descending order',
},
{
  displayName: 'Transaction Bytes',
  name: 'txBytes',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['transactions'],
      operation: ['executeTransactionBlock'],
    },
  },
  default: '',
  description: 'Base64 encoded transaction bytes',
},
{
  displayName: 'Signatures',
  name: 'signatures',
  type: 'json',
  required: true,
  displayOptions: {
    show: {
      resource: ['transactions'],
      operation: ['executeTransactionBlock'],
    },
  },
  default: '[]',
  description: 'Array of signatures for the transaction',
},
{
  displayName: 'Options',
  name: 'options',
  type: 'json',
  required: false,
  displayOptions: {
    show: {
      resource: ['transactions'],
      operation: ['executeTransactionBlock'],
    },
  },
  default: '{}',
  description: 'Additional options for transaction execution',
},
{
  displayName: 'Request Type',
  name: 'requestType',
  type: 'options',
  required: false,
  displayOptions: {
    show: {
      resource: ['transactions'],
      operation: ['executeTransactionBlock'],
    },
  },
  options: [
    {
      name: 'Wait for Local Execution',
      value: 'WaitForLocalExecution',
    },
    {
      name: 'Wait for Effects Certificate',
      value: 'WaitForEffectsCert',
    },
  ],
  default: 'WaitForLocalExecution',
  description: 'Execution request type',
},
{
  displayName: 'Transaction Bytes',
  name: 'txBytes',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['transactions'],
      operation: ['dryRunTransactionBlock'],
    },
  },
  default: '',
  description: 'Base64 encoded transaction bytes for simulation',
},
{
  displayName: 'Sender Address',
  name: 'senderAddress',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['transactions'],
      operation: ['devInspectTransactionBlock'],
    },
  },
  default: '',
  description: 'The sender address for inspection',
},
{
  displayName: 'Transaction Bytes',
  name: 'txBytes',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['transactions'],
      operation: ['devInspectTransactionBlock'],
    },
  },
  default: '',
  description: 'Base64 encoded transaction bytes for inspection',
},
{
  displayName: 'Gas Price',
  name: 'gasPrice',
  type: 'string',
  required: false,
  displayOptions: {
    show: {
      resource: ['transactions'],
      operation: ['devInspectTransactionBlock'],
    },
  },
  default: '',
  description: 'Gas price for the transaction inspection',
},
{
  displayName: 'Epoch',
  name: 'epoch',
  type: 'string',
  required: false,
  displayOptions: {
    show: {
      resource: ['transactions'],
      operation: ['devInspectTransactionBlock'],
    },
  },
  default: '',
  description: 'Epoch for the transaction inspection',
},
{
  displayName: 'Object ID',
  name: 'objectId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['objects'],
      operation: ['getObject'],
    },
  },
  default: '',
  description: 'The ID of the object to retrieve',
},
{
  displayName: 'Options',
  name: 'options',
  type: 'json',
  displayOptions: {
    show: {
      resource: ['objects'],
      operation: ['getObject'],
    },
  },
  default: '{}',
  description: 'Additional options for the request',
},
{
  displayName: 'Object IDs',
  name: 'objectIds',
  type: 'json',
  required: true,
  displayOptions: {
    show: {
      resource: ['objects'],
      operation: ['multiGetObjects'],
    },
  },
  default: '[]',
  description: 'Array of object IDs to retrieve',
},
{
  displayName: 'Options',
  name: 'options',
  type: 'json',
  displayOptions: {
    show: {
      resource: ['objects'],
      operation: ['multiGetObjects'],
    },
  },
  default: '{}',
  description: 'Additional options for the request',
},
{
  displayName: 'Owner Address',
  name: 'owner',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['objects'],
      operation: ['getOwnedObjects'],
    },
  },
  default: '',
  description: 'The address of the owner',
},
{
  displayName: 'Query',
  name: 'query',
  type: 'json',
  displayOptions: {
    show: {
      resource: ['objects'],
      operation: ['getOwnedObjects'],
    },
  },
  default: '{}',
  description: 'Query parameters to filter objects',
},
{
  displayName: 'Cursor',
  name: 'cursor',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['objects'],
      operation: ['getOwnedObjects'],
    },
  },
  default: '',
  description: 'Cursor for pagination',
},
{
  displayName: 'Limit',
  name: 'limit',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['objects'],
      operation: ['getOwnedObjects'],
    },
  },
  default: 50,
  description: 'Maximum number of objects to return',
},
{
  displayName: 'Query',
  name: 'query',
  type: 'json',
  required: true,
  displayOptions: {
    show: {
      resource: ['objects'],
      operation: ['queryObjects'],
    },
  },
  default: '{}',
  description: 'Query parameters to filter objects',
},
{
  displayName: 'Cursor',
  name: 'cursor',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['objects'],
      operation: ['queryObjects'],
    },
  },
  default: '',
  description: 'Cursor for pagination',
},
{
  displayName: 'Limit',
  name: 'limit',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['objects'],
      operation: ['queryObjects'],
    },
  },
  default: 50,
  description: 'Maximum number of objects to return',
},
{
  displayName: 'Descending Order',
  name: 'descendingOrder',
  type: 'boolean',
  displayOptions: {
    show: {
      resource: ['objects'],
      operation: ['queryObjects'],
    },
  },
  default: false,
  description: 'Whether to return results in descending order',
},
{
  displayName: 'Parent Object ID',
  name: 'parentObjectId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['objects'],
      operation: ['getDynamicFields'],
    },
  },
  default: '',
  description: 'The ID of the parent object',
},
{
  displayName: 'Cursor',
  name: 'cursor',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['objects'],
      operation: ['getDynamicFields'],
    },
  },
  default: '',
  description: 'Cursor for pagination',
},
{
  displayName: 'Limit',
  name: 'limit',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['objects'],
      operation: ['getDynamicFields'],
    },
  },
  default: 50,
  description: 'Maximum number of fields to return',
},
{
  displayName: 'Parent Object ID',
  name: 'parentObjectId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['objects'],
      operation: ['getDynamicFieldObject'],
    },
  },
  default: '',
  description: 'The ID of the parent object',
},
{
  displayName: 'Field Name',
  name: 'name',
  type: 'json',
  required: true,
  displayOptions: {
    show: {
      resource: ['objects'],
      operation: ['getDynamicFieldObject'],
    },
  },
  default: '{}',
  description: 'The name of the dynamic field',
},
{
  displayName: 'Owner Address',
  name: 'owner',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['addresses'],
      operation: ['getBalance', 'getAllBalances', 'getCoins', 'getAllCoins'],
    },
  },
  default: '',
  description: 'The owner address',
},
{
  displayName: 'Coin Type',
  name: 'coinType',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['addresses'],
      operation: ['getBalance', 'getCoins'],
    },
  },
  default: '0x2::sui::SUI',
  description: 'The coin type (e.g., 0x2::sui::SUI for native SUI)',
},
{
  displayName: 'Coin Type',
  name: 'coinType',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['addresses'],
      operation: ['getTotalSupply'],
    },
  },
  default: '0x2::sui::SUI',
  description: 'The coin type to get total supply for',
},
{
  displayName: 'Cursor',
  name: 'cursor',
  type: 'string',
  required: false,
  displayOptions: {
    show: {
      resource: ['addresses'],
      operation: ['getCoins', 'getAllCoins'],
    },
  },
  default: '',
  description: 'Pagination cursor for results',
},
{
  displayName: 'Limit',
  name: 'limit',
  type: 'number',
  required: false,
  displayOptions: {
    show: {
      resource: ['addresses'],
      operation: ['getCoins', 'getAllCoins'],
    },
  },
  default: 50,
  description: 'Maximum number of results to return',
},
{
  displayName: 'Owner Address',
  name: 'owner',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['validators'],
      operation: ['getStakes'],
    },
  },
  default: '',
  description: 'The address to get staking information for',
},
{
  displayName: 'Staked Sui IDs',
  name: 'staked_sui_ids',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['validators'],
      operation: ['getStakesByIds'],
    },
  },
  default: '',
  description: 'Comma-separated list of staking pool IDs',
},
{
  displayName: 'Query Filter',
  name: 'query',
  type: 'json',
  required: true,
  displayOptions: {
    show: {
      resource: ['events'],
      operation: ['queryEvents'],
    },
  },
  default: '{}',
  description: 'Event query filter object',
},
{
  displayName: 'Cursor',
  name: 'cursor',
  type: 'string',
  required: false,
  displayOptions: {
    show: {
      resource: ['events'],
      operation: ['queryEvents'],
    },
  },
  default: '',
  description: 'Pagination cursor for query results',
},
{
  displayName: 'Limit',
  name: 'limit',
  type: 'number',
  required: false,
  displayOptions: {
    show: {
      resource: ['events'],
      operation: ['queryEvents'],
    },
  },
  default: 50,
  description: 'Maximum number of events to return',
},
{
  displayName: 'Descending Order',
  name: 'descendingOrder',
  type: 'boolean',
  required: false,
  displayOptions: {
    show: {
      resource: ['events'],
      operation: ['queryEvents'],
    },
  },
  default: false,
  description: 'Whether to return results in descending order',
},
{
  displayName: 'Event Filter',
  name: 'filter',
  type: 'json',
  required: true,
  displayOptions: {
    show: {
      resource: ['events'],
      operation: ['subscribeEvent', 'subscribeTransaction'],
    },
  },
  default: '{}',
  description: 'Event subscription filter object',
},
{
  displayName: 'Subscription ID',
  name: 'subscriptionId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['events'],
      operation: ['unsubscribeEvent'],
    },
  },
  default: '',
  description: 'ID of the subscription to unsubscribe from',
},
{
  displayName: 'Package ID',
  name: 'package',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['packages'],
      operation: ['getMoveFunctionArgTypes', 'getNormalizedMoveFunction', 'getNormalizedMoveModule', 'getNormalizedMoveStruct', 'getNormalizedMoveModulesByPackage'],
    },
  },
  default: '',
  description: 'The package object ID',
  placeholder: '0x2',
},
{
  displayName: 'Module Name',
  name: 'module',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['packages'],
      operation: ['getMoveFunctionArgTypes', 'getNormalizedMoveFunction', 'getNormalizedMoveModule', 'getNormalizedMoveStruct'],
    },
  },
  default: '',
  description: 'The module name',
  placeholder: 'coin',
},
{
  displayName: 'Function Name',
  name: 'function',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['packages'],
      operation: ['getMoveFunctionArgTypes', 'getNormalizedMoveFunction'],
    },
  },
  default: '',
  description: 'The function name',
  placeholder: 'transfer',
},
{
  displayName: 'Struct Name',
  name: 'struct',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['packages'],
      operation: ['getNormalizedMoveStruct'],
    },
  },
  default: '',
  description: 'The struct name',
  placeholder: 'Coin',
},
{
  displayName: 'Cursor',
  name: 'cursor',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['system'],
      operation: ['getEpochs', 'getCheckpoints'],
    },
  },
  default: '',
  description: 'Cursor for pagination - use the cursor from previous response to get next page',
},
{
  displayName: 'Limit',
  name: 'limit',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['system'],
      operation: ['getEpochs', 'getCheckpoints'],
    },
  },
  default: 50,
  description: 'Maximum number of items to return (default: 50, max: 100)',
  typeOptions: {
    minValue: 1,
    maxValue: 100,
  },
},
{
  displayName: 'Descending Order',
  name: 'descendingOrder',
  type: 'boolean',
  displayOptions: {
    show: {
      resource: ['system'],
      operation: ['getEpochs', 'getCheckpoints'],
    },
  },
  default: false,
  description: 'Whether to return results in descending order',
},
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const resource = this.getNodeParameter('resource', 0) as string;

    switch (resource) {
      case 'transactions':
        return [await executeTransactionsOperations.call(this, items)];
      case 'objects':
        return [await executeObjectsOperations.call(this, items)];
      case 'addresses':
        return [await executeAddressesOperations.call(this, items)];
      case 'validators':
        return [await executeValidatorsOperations.call(this, items)];
      case 'unknown':
        return [await executeunknownOperations.call(this, items)];
      case 'packages':
        return [await executePackagesOperations.call(this, items)];
      case 'system':
        return [await executeSystemOperations.call(this, items)];
      default:
        throw new NodeOperationError(this.getNode(), `The resource "${resource}" is not supported`);
    }
  }
}

// ============================================================
// Resource Handler Functions
// ============================================================

async function executeTransactionsOperations(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  const operation = this.getNodeParameter('operation', 0) as string;
  const credentials = await this.getCredentials('suiApi') as any;

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;

      switch (operation) {
        case 'getTransaction': {
          const digest = this.getNodeParameter('digest', i) as string;
          const options = this.getNodeParameter('options', i) as any;
          
          const requestBody: any = {
            jsonrpc: '2.0',
            id: 1,
            method: 'sui_getTransaction',
            params: [digest, options],
          };

          const httpOptions: any = {
            method: 'POST',
            url: credentials.baseUrl || 'https://fullnode.mainnet.sui.io:443',
            headers: {
              'Content-Type': 'application/json',
            },
            body: requestBody,
            json: true,
          };

          result = await this.helpers.httpRequest(httpOptions) as any;
          break;
        }

        case 'multiGetTransactions': {
          const digests = this.getNodeParameter('digests', i) as any[];
          const options = this.getNodeParameter('options', i) as any;
          
          const requestBody: any = {
            jsonrpc: '2.0',
            id: 1,
            method: 'sui_multiGetTransactions',
            params: [digests, options],
          };

          const httpOptions: any = {
            method: 'POST',
            url: credentials.baseUrl || 'https://fullnode.mainnet.sui.io:443',
            headers: {
              'Content-Type': 'application/json',
            },
            body: requestBody,
            json: true,
          };

          result = await this.helpers.httpRequest(httpOptions) as any;
          break;
        }

        case 'queryTransactionBlocks': {
          const filter = this.getNodeParameter('filter', i) as any;
          const cursor = this.getNodeParameter('cursor', i) as string;
          const limit = this.getNodeParameter('limit', i) as number;
          const descendingOrder = this.getNodeParameter('descendingOrder', i) as boolean;
          
          const params: any = {
            filter,
            cursor: cursor || null,
            limit,
            descending_order: descendingOrder,
          };

          const requestBody: any = {
            jsonrpc: '2.0',
            id: 1,
            method: 'sui_queryTransactionBlocks',
            params: [params],
          };

          const httpOptions: any = {
            method: 'POST',
            url: credentials.baseUrl || 'https://fullnode.mainnet.sui.io:443',
            headers: {
              'Content-Type': 'application/json',
            },
            body: requestBody,
            json: true,
          };

          result = await this.helpers.httpRequest(httpOptions) as any;
          break;
        }

        case 'executeTransactionBlock': {
          const txBytes = this.getNodeParameter('txBytes', i) as string;
          const signatures = this.getNodeParameter('signatures', i) as any[];
          const options = this.getNodeParameter('options', i) as any;
          const requestType = this.getNodeParameter('requestType', i) as string;
          
          const requestBody: any = {
            jsonrpc: '2.0',
            id: 1,
            method: 'sui_executeTransactionBlock',
            params: [txBytes, signatures, options, requestType],
          };

          const httpOptions: any = {
            method: 'POST',
            url: credentials.baseUrl || 'https://fullnode.mainnet.sui.io:443',
            headers: {
              'Content-Type': 'application/json',
            },
            body: requestBody,
            json: true,
          };

          result = await this.helpers.httpRequest(httpOptions) as any;
          break;
        }

        case 'dryRunTransactionBlock': {
          const txBytes = this.getNodeParameter('txBytes', i) as string;
          
          const requestBody: any = {
            jsonrpc: '2.0',
            id: 1,
            method: 'sui_dryRunTransactionBlock',
            params: [txBytes],
          };

          const httpOptions: any = {
            method: 'POST',
            url: credentials.baseUrl || 'https://fullnode.mainnet.sui.io:443',
            headers: {
              'Content-Type': 'application/json',
            },
            body: requestBody,
            json: true,
          };

          result = await this.helpers.httpRequest(httpOptions) as any;
          break;
        }

        case 'devInspectTransactionBlock': {
          const senderAddress = this.getNodeParameter('senderAddress', i) as string;
          const txBytes = this.getNodeParameter('txBytes', i) as string;
          const gasPrice = this.getNodeParameter('gasPrice', i) as string;
          const epoch = this.getNodeParameter('epoch', i) as string;
          
          const params: any[] = [senderAddress, txBytes];
          if (gasPrice) params.push(gasPrice);
          if (epoch) params.push(epoch);

          const requestBody: any = {
            jsonrpc: '2.0',
            id: 1,
            method: 'sui_devInspectTransactionBlock',
            params,
          };

          const httpOptions: any = {
            method: 'POST',
            url: credentials.baseUrl || 'https://fullnode.mainnet.sui.io:443',
            headers: {
              'Content-Type': 'application/json',
            },
            body: requestBody,
            json: true,
          };

          result = await this.helpers.httpRequest(httpOptions) as any;
          break;
        }

        default:
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`, {
            itemIndex: i,
          });
      }

      if (result.error) {
        throw new NodeApiError(this.getNode(), result, {
          message: result.error.message,
          description: result.error.data,
        });
      }

      returnData.push({
        json: result.result || result,
        pairedItem: { item: i },
      });
    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({
          json: { error: error.message },
          pairedItem: { item: i },
        });
      } else {
        throw error;
      }
    }
  }

  return returnData;
}

async function executeObjectsOperations(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  const operation = this.getNodeParameter('operation', 0) as string;
  const credentials = await this.getCredentials('suiApi') as any;

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;
      
      switch (operation) {
        case 'getObject': {
          const objectId = this.getNodeParameter('objectId', i) as string;
          const options = this.getNodeParameter('options', i, '{}') as string;
          
          let parsedOptions: any = {};
          try {
            parsedOptions = JSON.parse(options);
          } catch (error: any) {
            parsedOptions = {};
          }

          const requestOptions: any = {
            method: 'POST',
            url: credentials.baseUrl || 'https://fullnode.mainnet.sui.io:443',
            headers: {
              'Content-Type': 'application/json',
            },
            body: {
              jsonrpc: '2.0',
              id: 1,
              method: 'sui_getObject',
              params: [objectId, parsedOptions],
            },
            json: true,
          };
          
          result = await this.helpers.httpRequest(requestOptions) as any;
          break;
        }

        case 'multiGetObjects': {
          const objectIds = this.getNodeParameter('objectIds', i, '[]') as string;
          const options = this.getNodeParameter('options', i, '{}') as string;
          
          let parsedObjectIds: any = [];
          let parsedOptions: any = {};
          try {
            parsedObjectIds = JSON.parse(objectIds);
            parsedOptions = JSON.parse(options);
          } catch (error: any) {
            throw new NodeOperationError(this.getNode(), 'Invalid JSON format in parameters');
          }

          const requestOptions: any = {
            method: 'POST',
            url: credentials.baseUrl || 'https://fullnode.mainnet.sui.io:443',
            headers: {
              'Content-Type': 'application/json',
            },
            body: {
              jsonrpc: '2.0',
              id: 1,
              method: 'sui_multiGetObjects',
              params: [parsedObjectIds, parsedOptions],
            },
            json: true,
          };
          
          result = await this.helpers.httpRequest(requestOptions) as any;
          break;
        }

        case 'getOwnedObjects': {
          const owner = this.getNodeParameter('owner', i) as string;
          const query = this.getNodeParameter('query', i, '{}') as string;
          const cursor = this.getNodeParameter('cursor', i, '') as string;
          const limit = this.getNodeParameter('limit', i, 50) as number;
          
          let parsedQuery: any = {};
          try {
            parsedQuery = JSON.parse(query);
          } catch (error: any) {
            parsedQuery = {};
          }

          const params: any = [owner];
          if (Object.keys(parsedQuery).length > 0 || cursor || limit !== 50) {
            params.push(parsedQuery);
            if (cursor || limit !== 50) {
              params.push(cursor || null);
              params.push(limit);
            }
          }

          const requestOptions: any = {
            method: 'POST',
            url: credentials.baseUrl || 'https://fullnode.mainnet.sui.io:443',
            headers: {
              'Content-Type': 'application/json',
            },
            body: {
              jsonrpc: '2.0',
              id: 1,
              method: 'sui_getOwnedObjects',
              params: params,
            },
            json: true,
          };
          
          result = await this.helpers.httpRequest(requestOptions) as any;
          break;
        }

        case 'queryObjects': {
          const query = this.getNodeParameter('query', i) as string;
          const cursor = this.getNodeParameter('cursor', i, '') as string;
          const limit = this.getNodeParameter('limit', i, 50) as number;
          const descendingOrder = this.getNodeParameter('descendingOrder', i, false) as boolean;
          
          let parsedQuery: any = {};
          try {
            parsedQuery = JSON.parse(query);
          } catch (error: any) {
            throw new NodeOperationError(this.getNode(), 'Invalid JSON format in query parameter');
          }

          const params: any = [parsedQuery];
          if (cursor) {
            params.push(cursor);
          } else {
            params.push(null);
          }
          params.push(limit);
          if (descendingOrder) {
            params.push(descendingOrder);
          }

          const requestOptions: any = {
            method: 'POST',
            url: credentials.baseUrl || 'https://fullnode.mainnet.sui.io:443',
            headers: {
              'Content-Type': 'application/json',
            },
            body: {
              jsonrpc: '2.0',
              id: 1,
              method: 'sui_queryObjects',
              params: params,
            },
            json: true,
          };
          
          result = await this.helpers.httpRequest(requestOptions) as any;
          break;
        }

        case 'getDynamicFields': {
          const parentObjectId = this.getNodeParameter('parentObjectId', i) as string;
          const cursor = this.getNodeParameter('cursor', i, '') as string;
          const limit = this.getNodeParameter('limit', i, 50) as number;

          const params: any = [parentObjectId];
          if (cursor) {
            params.push(cursor);
          } else {
            params.push(null);
          }
          params.push(limit);

          const requestOptions: any = {
            method: 'POST',
            url: credentials.baseUrl || 'https://fullnode.mainnet.sui.io:443',
            headers: {
              'Content-Type': 'application/json',
            },
            body: {
              jsonrpc: '2.0',
              id: 1,
              method: 'sui_getDynamicFields',
              params: params,
            },
            json: true,
          };
          
          result = await this.helpers.httpRequest(requestOptions) as any;
          break;
        }

        case 'getDynamicFieldObject': {
          const parentObjectId = this.getNodeParameter('parentObjectId', i) as string;
          const name = this.getNodeParameter('name', i) as string;
          
          let parsedName: any = {};
          try {
            parsedName = JSON.parse(name);
          } catch (error: any) {
            throw new NodeOperationError(this.getNode(), 'Invalid JSON format in name parameter');
          }

          const requestOptions: any = {
            method: 'POST',
            url: credentials.baseUrl || 'https://fullnode.mainnet.sui.io:443',
            headers: {
              'Content-Type': 'application/json',
            },
            body: {
              jsonrpc: '2.0',
              id: 1,
              method: 'sui_getDynamicFieldObject',
              params: [parentObjectId, parsedName],
            },
            json: true,
          };
          
          result = await this.helpers.httpRequest(requestOptions) as any;
          break;
        }

        default:
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
      }

      if (result.error) {
        throw new NodeApiError(this.getNode(), result.error);
      }

      returnData.push({ 
        json: result.result || result, 
        pairedItem: { item: i } 
      });

    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({ 
          json: { error: error.message }, 
          pairedItem: { item: i } 
        });
      } else {
        throw error;
      }
    }
  }

  return returnData;
}

async function executeAddressesOperations(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  const operation = this.getNodeParameter('operation', 0) as string;
  const credentials = await this.getCredentials('suiApi') as any;

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;
      
      switch (operation) {
        case 'getBalance': {
          const owner = this.getNodeParameter('owner', i) as string;
          const coinType = this.getNodeParameter('coinType', i) as string;
          
          const requestBody = {
            jsonrpc: '2.0',
            id: 1,
            method: 'sui_getBalance',
            params: [owner, coinType]
          };

          const options: any = {
            method: 'POST',
            url: credentials.baseUrl || 'https://fullnode.mainnet.sui.io:443',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
            json: false,
          };

          const response = await this.helpers.httpRequest(options) as any;
          const parsedResponse = JSON.parse(response);
          
          if (parsedResponse.error) {
            throw new NodeApiError(this.getNode(), parsedResponse.error);
          }
          
          result = parsedResponse.result;
          break;
        }

        case 'getAllBalances': {
          const owner = this.getNodeParameter('owner', i) as string;
          
          const requestBody = {
            jsonrpc: '2.0',
            id: 1,
            method: 'sui_getAllBalances',
            params: [owner]
          };

          const options: any = {
            method: 'POST',
            url: credentials.baseUrl || 'https://fullnode.mainnet.sui.io:443',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
            json: false,
          };

          const response = await this.helpers.httpRequest(options) as any;
          const parsedResponse = JSON.parse(response);
          
          if (parsedResponse.error) {
            throw new NodeApiError(this.getNode(), parsedResponse.error);
          }
          
          result = parsedResponse.result;
          break;
        }

        case 'getCoins': {
          const owner = this.getNodeParameter('owner', i) as string;
          const coinType = this.getNodeParameter('coinType', i) as string;
          const cursor = this.getNodeParameter('cursor', i, '') as string;
          const limit = this.getNodeParameter('limit', i, 50) as number;
          
          const params: any[] = [owner, coinType];
          if (cursor) {
            params.push(cursor);
          }
          if (limit) {
            params.push(limit);
          }

          const requestBody = {
            jsonrpc: '2.0',
            id: 1,
            method: 'sui_getCoins',
            params: params
          };

          const options: any = {
            method: 'POST',
            url: credentials.baseUrl || 'https://fullnode.mainnet.sui.io:443',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
            json: false,
          };

          const response = await this.helpers.httpRequest(options) as any;
          const parsedResponse = JSON.parse(response);
          
          if (parsedResponse.error) {
            throw new NodeApiError(this.getNode(), parsedResponse.error);
          }
          
          result = parsedResponse.result;
          break;
        }

        case 'getAllCoins': {
          const owner = this.getNodeParameter('owner', i) as string;
          const cursor = this.getNodeParameter('cursor', i, '') as string;
          const limit = this.getNodeParameter('limit', i, 50) as number;
          
          const params: any[] = [owner];
          if (cursor) {
            params.push(cursor);
          }
          if (limit) {
            params.push(limit);
          }

          const requestBody = {
            jsonrpc: '2.0',
            id: 1,
            method: 'sui_getAllCoins',
            params: params
          };

          const options: any = {
            method: 'POST',
            url: credentials.baseUrl || 'https://fullnode.mainnet.sui.io:443',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
            json: false,
          };

          const response = await this.helpers.httpRequest(options) as any;
          const parsedResponse = JSON.parse(response);
          
          if (parsedResponse.error) {
            throw new NodeApiError(this.getNode(), parsedResponse.error);
          }
          
          result = parsedResponse.result;
          break;
        }

        case 'getTotalSupply': {
          const coinType = this.getNodeParameter('coinType', i) as string;
          
          const requestBody = {
            jsonrpc: '2.0',
            id: 1,
            method: 'sui_getTotalSupply',
            params: [coinType]
          };

          const options: any = {
            method: 'POST',
            url: credentials.baseUrl || 'https://fullnode.mainnet.sui.io:443',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
            json: false,
          };

          const response = await this.helpers.httpRequest(options) as any;
          const parsedResponse = JSON.parse(response);
          
          if (parsedResponse.error) {
            throw new NodeApiError(this.getNode(), parsedResponse.error);
          }
          
          result = parsedResponse.result;
          break;
        }

        default:
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
      }

      returnData.push({ json: result, pairedItem: { item: i } });
    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({ json: { error: error.message }, pairedItem: { item: i } });
      } else {
        throw error;
      }
    }
  }

  return returnData;
}

async function executeValidatorsOperations(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  const operation = this.getNodeParameter('operation', 0) as string;
  const credentials = await this.getCredentials('suiApi') as any;

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;

      switch (operation) {
        case 'getLatestSuiSystemState': {
          const options: any = {
            method: 'POST',
            url: credentials.baseUrl || 'https://fullnode.mainnet.sui.io:443',
            headers: {
              'Content-Type': 'application/json',
            },
            json: true,
            body: {
              jsonrpc: '2.0',
              id: 1,
              method: 'suix_getLatestSuiSystemState',
              params: [],
            },
          };
          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getValidatorsApy': {
          const options: any = {
            method: 'POST',
            url: credentials.baseUrl || 'https://fullnode.mainnet.sui.io:443',
            headers: {
              'Content-Type': 'application/json',
            },
            json: true,
            body: {
              jsonrpc: '2.0',
              id: 1,
              method: 'suix_getValidatorsApy',
              params: [],
            },
          };
          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getStakes': {
          const owner = this.getNodeParameter('owner', i) as string;
          if (!owner) {
            throw new NodeOperationError(this.getNode(), 'Owner address is required');
          }

          const options: any = {
            method: 'POST',
            url: credentials.baseUrl || 'https://fullnode.mainnet.sui.io:443',
            headers: {
              'Content-Type': 'application/json',
            },
            json: true,
            body: {
              jsonrpc: '2.0',
              id: 1,
              method: 'suix_getStakes',
              params: [owner],
            },
          };
          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getStakesByIds': {
          const stakedSuiIds = this.getNodeParameter('staked_sui_ids', i) as string;
          if (!stakedSuiIds) {
            throw new NodeOperationError(this.getNode(), 'Staked Sui IDs are required');
          }

          const idsArray = stakedSuiIds.split(',').map((id: string) => id.trim());
          
          const options: any = {
            method: 'POST',
            url: credentials.baseUrl || 'https://fullnode.mainnet.sui.io:443',
            headers: {
              'Content-Type': 'application/json',
            },
            json: true,
            body: {
              jsonrpc: '2.0',
              id: 1,
              method: 'suix_getStakesByIds',
              params: [idsArray],
            },
          };
          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        default:
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
      }

      if (result.error) {
        throw new NodeApiError(this.getNode(), result.error);
      }

      returnData.push({
        json: result.result || result,
        pairedItem: { item: i },
      });

    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({
          json: { error: error.message },
          pairedItem: { item: i },
        });
      } else {
        throw error;
      }
    }
  }

  return returnData;
}

async function executeEventsOperations(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  const operation = this.getNodeParameter('operation', 0) as string;
  const credentials = await this.getCredentials('suiApi') as any;

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;

      switch (operation) {
        case 'queryEvents': {
          const query = this.getNodeParameter('query', i) as any;
          const cursor = this.getNodeParameter('cursor', i, '') as string;
          const limit = this.getNodeParameter('limit', i, 50) as number;
          const descendingOrder = this.getNodeParameter('descendingOrder', i, false) as boolean;

          const requestBody: any = {
            jsonrpc: '2.0',
            id: 1,
            method: 'sui_queryEvents',
            params: [
              query,
              cursor || null,
              limit,
              descendingOrder,
            ].filter((param: any, index: number) => {
              if (index === 1) return cursor !== '';
              if (index === 2) return limit > 0;
              return param !== undefined;
            }),
          };

          const options: any = {
            method: 'POST',
            url: credentials.baseUrl || 'https://fullnode.mainnet.sui.io:443',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
            json: false,
          };

          const response = await this.helpers.httpRequest(options) as any;
          const responseData = JSON.parse(response);
          
          if (responseData.error) {
            throw new NodeApiError(this.getNode(), responseData.error);
          }

          result = responseData.result;
          break;
        }

        case 'subscribeEvent': {
          const filter = this.getNodeParameter('filter', i) as any;

          const requestBody: any = {
            jsonrpc: '2.0',
            id: 1,
            method: 'sui_subscribeEvent',
            params: [filter],
          };

          const options: any = {
            method: 'POST',
            url: credentials.baseUrl || 'https://fullnode.mainnet.sui.io:443',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
            json: false,
          };

          const response = await this.helpers.httpRequest(options) as any;
          const responseData = JSON.parse(response);
          
          if (responseData.error) {
            throw new NodeApiError(this.getNode(), responseData.error);
          }

          result = responseData.result;
          break;
        }

        case 'subscribeTransaction': {
          const filter = this.getNodeParameter('filter', i) as any;

          const requestBody: any = {
            jsonrpc: '2.0',
            id: 1,
            method: 'sui_subscribeTransaction',
            params: [filter],
          };

          const options: any = {
            method: 'POST',
            url: credentials.baseUrl || 'https://fullnode.mainnet.sui.io:443',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
            json: false,
          };

          const response = await this.helpers.httpRequest(options) as any;
          const responseData = JSON.parse(response);
          
          if (responseData.error) {
            throw new NodeApiError(this.getNode(), responseData.error);
          }

          result = responseData.result;
          break;
        }

        case 'unsubscribeEvent': {
          const subscriptionId = this.getNodeParameter('subscriptionId', i) as string;

          const requestBody: any = {
            jsonrpc: '2.0',
            id: 1,
            method: 'sui_unsubscribeEvent',
            params: [subscriptionId],
          };

          const options: any = {
            method: 'POST',
            url: credentials.baseUrl || 'https://fullnode.mainnet.sui.io:443',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
            json: false,
          };

          const response = await this.helpers.httpRequest(options) as any;
          const responseData = JSON.parse(response);
          
          if (responseData.error) {
            throw new NodeApiError(this.getNode(), responseData.error);
          }

          result = responseData.result;
          break;
        }

        default:
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
      }

      returnData.push({
        json: result,
        pairedItem: { item: i },
      });

    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({
          json: { error: error.message },
          pairedItem: { item: i },
        });
      } else {
        throw error;
      }
    }
  }

  return returnData;
}

async function executePackagesOperations(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  const operation = this.getNodeParameter('operation', 0) as string;
  const credentials = await this.getCredentials('suiApi') as any;

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;

      switch (operation) {
        case 'getMoveFunctionArgTypes': {
          const packageId = this.getNodeParameter('package', i) as string;
          const moduleName = this.getNodeParameter('module', i) as string;
          const functionName = this.getNodeParameter('function', i) as string;

          const requestBody: any = {
            jsonrpc: '2.0',
            id: 1,
            method: 'sui_getMoveFunctionArgTypes',
            params: [packageId, moduleName, functionName],
          };

          const options: any = {
            method: 'POST',
            url: credentials.baseUrl || 'https://fullnode.mainnet.sui.io:443',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
            json: false,
          };

          const response = await this.helpers.httpRequest(options) as any;
          const responseData = typeof response === 'string' ? JSON.parse(response) : response;
          
          if (responseData.error) {
            throw new NodeApiError(this.getNode(), responseData.error);
          }

          result = responseData.result;
          break;
        }

        case 'getNormalizedMoveFunction': {
          const packageId = this.getNodeParameter('package', i) as string;
          const moduleName = this.getNodeParameter('module', i) as string;
          const functionName = this.getNodeParameter('function', i) as string;

          const requestBody: any = {
            jsonrpc: '2.0',
            id: 1,
            method: 'sui_getNormalizedMoveFunction',
            params: [packageId, moduleName, functionName],
          };

          const options: any = {
            method: 'POST',
            url: credentials.baseUrl || 'https://fullnode.mainnet.sui.io:443',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
            json: false,
          };

          const response = await this.helpers.httpRequest(options) as any;
          const responseData = typeof response === 'string' ? JSON.parse(response) : response;
          
          if (responseData.error) {
            throw new NodeApiError(this.getNode(), responseData.error);
          }

          result = responseData.result;
          break;
        }

        case 'getNormalizedMoveModule': {
          const packageId = this.getNodeParameter('package', i) as string;
          const moduleName = this.getNodeParameter('module', i) as string;

          const requestBody: any = {
            jsonrpc: '2.0',
            id: 1,
            method: 'sui_getNormalizedMoveModule',
            params: [packageId, moduleName],
          };

          const options: any = {
            method: 'POST',
            url: credentials.baseUrl || 'https://fullnode.mainnet.sui.io:443',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
            json: false,
          };

          const response = await this.helpers.httpRequest(options) as any;
          const responseData = typeof response === 'string' ? JSON.parse(response) : response;
          
          if (responseData.error) {
            throw new NodeApiError(this.getNode(), responseData.error);
          }

          result = responseData.result;
          break;
        }

        case 'getNormalizedMoveStruct': {
          const packageId = this.getNodeParameter('package', i) as string;
          const moduleName = this.getNodeParameter('module', i) as string;
          const structName = this.getNodeParameter('struct', i) as string;

          const requestBody: any = {
            jsonrpc: '2.0',
            id: 1,
            method: 'sui_getNormalizedMoveStruct',
            params: [packageId, moduleName, structName],
          };

          const options: any = {
            method: 'POST',
            url: credentials.baseUrl || 'https://fullnode.mainnet.sui.io:443',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
            json: false,
          };

          const response = await this.helpers.httpRequest(options) as any;
          const responseData = typeof response === 'string' ? JSON.parse(response) : response;
          
          if (responseData.error) {
            throw new NodeApiError(this.getNode(), responseData.error);
          }

          result = responseData.result;
          break;
        }

        case 'getNormalizedMoveModulesByPackage': {
          const packageId = this.getNodeParameter('package', i) as string;

          const requestBody: any = {
            jsonrpc: '2.0',
            id: 1,
            method: 'sui_getNormalizedMoveModulesByPackage',
            params: [packageId],
          };

          const options: any = {
            method: 'POST',
            url: credentials.baseUrl || 'https://fullnode.mainnet.sui.io:443',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
            json: false,
          };

          const response = await this.helpers.httpRequest(options) as any;
          const responseData = typeof response === 'string' ? JSON.parse(response) : response;
          
          if (responseData.error) {
            throw new NodeApiError(this.getNode(), responseData.error);
          }

          result = responseData.result;
          break;
        }

        default:
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
      }

      returnData.push({
        json: result,
        pairedItem: { item: i },
      });

    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({
          json: { error: error.message },
          pairedItem: { item: i },
        });
      } else {
        throw error;
      }
    }
  }

  return returnData;
}

function generateJsonRpcId(): string {
  return Math.random().toString(36).substring(2, 15);
}

async function executeSystemOperations(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  const operation = this.getNodeParameter('operation', 0) as string;
  const credentials = await this.getCredentials('suiApi') as any;

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;

      switch (operation) {
        case 'getReferenceGasPrice': {
          const requestBody = {
            jsonrpc: '2.0',
            id: generateJsonRpcId(),
            method: 'sui_getReferenceGasPrice',
            params: []
          };

          const options: any = {
            method: 'POST',
            url: credentials.baseUrl || 'https://fullnode.mainnet.sui.io:443',
            body: requestBody,
            json: true,
            headers: {
              'Content-Type': 'application/json',
            },
          };

          const response = await this.helpers.httpRequest(options) as any;
          
          if (response.error) {
            throw new NodeApiError(this.getNode(), response.error, {
              message: `Sui RPC Error: ${response.error.message}`,
              description: response.error.data || 'Unknown error occurred',
            });
          }

          result = {
            referenceGasPrice: response.result,
            priceInMist: response.result,
            timestamp: new Date().toISOString(),
          };
          break;
        }

        case 'getNetworkMetrics': {
          const requestBody = {
            jsonrpc: '2.0',
            id: generateJsonRpcId(),
            method: 'sui_getNetworkMetrics',
            params: []
          };

          const options: any = {
            method: 'POST',
            url: credentials.baseUrl || 'https://fullnode.mainnet.sui.io:443',
            body: requestBody,
            json: true,
            headers: {
              'Content-Type': 'application/json',
            },
          };

          const response = await this.helpers.httpRequest(options) as any;
          
          if (response.error) {
            throw new NodeApiError(this.getNode(), response.error, {
              message: `Sui RPC Error: ${response.error.message}`,
              description: response.error.data || 'Unknown error occurred',
            });
          }

          result = {
            networkMetrics: response.result,
            timestamp: new Date().toISOString(),
          };
          break;
        }

        case 'getEpochs': {
          const cursor = this.getNodeParameter('cursor', i) as string;
          const limit = this.getNodeParameter('limit', i) as number;
          const descendingOrder = this.getNodeParameter('descendingOrder', i) as boolean;

          const params: any[] = [];
          if (cursor) {
            params.push(cursor);
          } else {
            params.push(null);
          }
          params.push(limit);
          params.push(descendingOrder);

          const requestBody = {
            jsonrpc: '2.0',
            id: generateJsonRpcId(),
            method: 'sui_getEpochs',
            params: params
          };

          const options: any = {
            method: 'POST',
            url: credentials.baseUrl || 'https://fullnode.mainnet.sui.io:443',
            body: requestBody,
            json: true,
            headers: {
              'Content-Type': 'application/json',
            },
          };

          const response = await this.helpers.httpRequest(options) as any;
          
          if (response.error) {
            throw new NodeApiError(this.getNode(), response.error, {
              message: `Sui RPC Error: ${response.error.message}`,
              description: response.error.data || 'Unknown error occurred',
            });
          }

          result = {
            epochs: response.result?.data || [],
            hasNextPage: response.result?.hasNextPage || false,
            nextCursor: response.result?.nextCursor || null,
            totalCount: response.result?.data?.length || 0,
            timestamp: new Date().toISOString(),
          };
          break;
        }

        case 'getCurrentEpoch': {
          const requestBody = {
            jsonrpc: '2.0',
            id: generateJsonRpcId(),
            method: 'sui_getCurrentEpoch',
            params: []
          };

          const options: any = {
            method: 'POST',
            url: credentials.baseUrl || 'https://fullnode.mainnet.sui.io:443',
            body: requestBody,
            json: true,
            headers: {
              'Content-Type': 'application/json',
            },
          };

          const response = await this.helpers.httpRequest(options) as any;
          
          if (response.error) {
            throw new NodeApiError(this.getNode(), response.error, {
              message: `Sui RPC Error: ${response.error.message}`,
              description: response.error.data || 'Unknown error occurred',
            });
          }

          result = {
            currentEpoch: response.result,
            epochInfo: response.result,
            timestamp: new Date().toISOString(),
          };
          break;
        }

        case 'getCheckpoints': {
          const cursor = this.getNodeParameter('cursor', i) as string;
          const limit = this.getNodeParameter('limit', i) as number;
          const descendingOrder = this.getNodeParameter('descendingOrder', i) as boolean;

          const params: any[] = [];
          if (cursor) {
            params.push(cursor);
          } else {
            params.push(null);
          }
          params.push(limit);
          params.push(descendingOrder);

          const requestBody = {
            jsonrpc: '2.0',
            id: generateJsonRpcId(),
            method: 'sui_getCheckpoints',
            params: params
          };

          const options: any = {
            method: 'POST',
            url: credentials.baseUrl || 'https://fullnode.mainnet.sui.io:443',
            body: requestBody,
            json: true,
            headers: {
              'Content-Type': 'application/json',
            },
          };

          const response = await this.helpers.httpRequest(options) as any;
          
          if (response.error) {
            throw new NodeApiError(this.getNode(), response.error, {
              message: `Sui RPC Error: ${response.error.message}`,
              description: response.error.data || 'Unknown error occurred',
            });
          }

          result = {
            checkpoints: response.result?.data || [],
            hasNextPage: response.result?.hasNextPage || false,
            nextCursor: response.result?.nextCursor || null,
            totalCount: response.result?.data?.length || 0,
            timestamp: new Date().toISOString(),
          };
          break;
        }

        case 'getLatestCheckpointSequenceNumber': {
          const requestBody = {
            jsonrpc: '2.0',
            id: generateJsonRpcId(),
            method: 'sui_getLatestCheckpointSequenceNumber',
            params: []
          };

          const options: any = {
            method: 'POST',
            url: credentials.baseUrl || 'https://fullnode.mainnet.sui.io:443',
            body: requestBody,
            json: true,
            headers: {
              'Content-Type': 'application/json',
            },
          };

          const response = await this.helpers.httpRequest(options) as any;
          
          if (response.error) {
            throw new NodeApiError(this.getNode(), response.error, {
              message: `Sui RPC Error: ${response.error.message}`,
              description: response.error.data || 'Unknown error occurred',
            });
          }

          result = {
            latestCheckpointSequenceNumber: response.result,
            sequenceNumber: response.result,
            timestamp: new Date().toISOString(),
          };
          break;
        }

        default:
          throw new NodeOperationError(
            this.getNode(),
            `Unknown operation: ${operation}`,
          );
      }

      returnData.push({
        json: result,
        pairedItem: { item: i },
      });
    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({
          json: { error: error.message },
          pairedItem: { item: i },
        });
      } else {
        throw error;
      }
    }
  }

  return returnData;
}
