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
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'Transaction',
            value: 'transaction',
          },
          {
            name: 'Object',
            value: 'object',
          },
          {
            name: 'Coin',
            value: 'coin',
          },
          {
            name: 'Validator',
            value: 'validator',
          },
          {
            name: 'Network',
            value: 'network',
          },
          {
            name: 'Event',
            value: 'event',
          },
          {
            name: 'Package',
            value: 'package',
          }
        ],
        default: 'transaction',
      },
{
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: { show: { resource: ['transaction'] } },
	options: [
		{
			name: 'Get Transaction Block',
			value: 'getTransactionBlock',
			description: 'Get transaction details by digest',
			action: 'Get transaction block',
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
			description: 'Execute a signed transaction',
			action: 'Execute transaction block',
		},
		{
			name: 'Dry Run Transaction Block',
			value: 'dryRunTransactionBlock',
			description: 'Simulate transaction execution',
			action: 'Dry run transaction block',
		},
		{
			name: 'Get Transaction Blocks In Range',
			value: 'getTransactionBlocksInRange',
			description: 'Get transactions in block range',
			action: 'Get transaction blocks in range',
		},
		{
			name: 'Get Multiple Transactions',
			value: 'multiGetTransactions',
			description: 'Get multiple transactions by digests',
			action: 'Get multiple transactions',
		},
		{
			name: 'Dev Inspect Transaction Block',
			value: 'devInspectTransactionBlock',
			description: 'Inspect transaction for debugging',
			action: 'Dev inspect transaction block',
		},
	],
	default: 'getTransactionBlock',
},
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
			name: 'Get Dynamic Fields',
			value: 'getDynamicFields',
			description: 'Get dynamic fields of object',
			action: 'Get dynamic fields',
		},
		{
			name: 'Get Dynamic Field Object',
			value: 'getDynamicFieldObject',
			description: 'Get dynamic field object',
			action: 'Get dynamic field object',
		},
		{
			name: 'Query Objects',
			value: 'queryObjects',
			description: 'Query objects with filters',
			action: 'Query objects',
		},
	],
	default: 'getObject',
},
{
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: { show: { resource: ['coin'] } },
	options: [
		{ name: 'Get Coins', value: 'getCoins', description: 'Get coins owned by address', action: 'Get coins owned by address' },
		{ name: 'Get All Coins', value: 'getAllCoins', description: 'Get all coins owned by address', action: 'Get all coins owned by address' },
		{ name: 'Get Coin Metadata', value: 'getCoinMetadata', description: 'Get coin metadata', action: 'Get coin metadata' },
		{ name: 'Get Total Supply', value: 'getTotalSupply', description: 'Get total supply of coin type', action: 'Get total supply of coin type' },
		{ name: 'Get Balance', value: 'getBalance', description: 'Get balance for specific coin type', action: 'Get balance for specific coin type' },
		{ name: 'Get All Balances', value: 'getAllBalances', description: 'Get all balances for address', action: 'Get all balances for address' },
	],
	default: 'getCoins',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: { show: { resource: ['validator'] } },
  options: [
    { name: 'Get Latest Sui System State', value: 'getLatestSuiSystemState', description: 'Get current system state', action: 'Get latest Sui system state' },
    { name: 'Get Validators APY', value: 'getValidatorsApy', description: 'Get validator APY information', action: 'Get validators APY' },
    { name: 'Get Stakes', value: 'getStakes', description: 'Get staking information for address', action: 'Get stakes' },
    { name: 'Get Stakes by IDs', value: 'getStakesByIds', description: 'Get stakes by staking pool IDs', action: 'Get stakes by IDs' }
  ],
  default: 'getLatestSuiSystemState',
},
{
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: { show: { resource: ['network'] } },
	options: [
		{
			name: 'Get Chain Identifier',
			value: 'getChainIdentifier',
			description: 'Get chain identifier',
			action: 'Get chain identifier',
		},
		{
			name: 'Get Checkpoint',
			value: 'getCheckpoint',
			description: 'Get checkpoint by sequence number',
			action: 'Get checkpoint by sequence number',
		},
		{
			name: 'Get Checkpoints',
			value: 'getCheckpoints',
			description: 'Get paginated checkpoints',
			action: 'Get paginated checkpoints',
		},
		{
			name: 'Get Latest Checkpoint Sequence Number',
			value: 'getLatestCheckpointSequenceNumber',
			description: 'Get latest checkpoint number',
			action: 'Get latest checkpoint sequence number',
		},
		{
			name: 'Get Total Transaction Blocks',
			value: 'getTotalTransactionBlocks',
			description: 'Get total transaction count',
			action: 'Get total transaction count',
		},
		{
			name: 'Get Reference Gas Price',
			value: 'getReferenceGasPrice',
			description: 'Get reference gas price',
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
	],
	default: 'getChainIdentifier',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: { show: { resource: ['event'] } },
  options: [
    { name: 'Query Events', value: 'queryEvents', description: 'Query events with filters', action: 'Query events' },
    { name: 'Get Events', value: 'getEvents', description: 'Get events by transaction digest', action: 'Get events by transaction digest' },
    { name: 'Subscribe to Events', value: 'subscribeEvent', description: 'Subscribe to real-time blockchain events', action: 'Subscribe to events' },
    { name: 'Subscribe to Transactions', value: 'subscribeTransaction', description: 'Subscribe to transaction events', action: 'Subscribe to transactions' },
    { name: 'Unsubscribe from Events', value: 'unsubscribeEvent', description: 'Unsubscribe from event stream', action: 'Unsubscribe from events' },
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
			resource: ['package'],
		},
	},
	options: [
		{
			name: 'Get Package',
			value: 'getPackage',
			description: 'Get Move package by ID',
			action: 'Get a package',
		},
		{
			name: 'Get Normalized Move Modules by Package',
			value: 'getNormalizedMoveModulesByPackage',
			description: 'Get normalized modules for a package',
			action: 'Get normalized modules by package',
		},
		{
			name: 'Get Normalized Move Module',
			value: 'getNormalizedMoveModule',
			description: 'Get specific normalized module',
			action: 'Get normalized module',
		},
		{
			name: 'Get Normalized Move Function',
			value: 'getNormalizedMoveFunction',
			description: 'Get normalized function',
			action: 'Get normalized function',
		},
		{
			name: 'Get Normalized Move Struct',
			value: 'getNormalizedMoveStruct',
			description: 'Get normalized struct',
			action: 'Get normalized struct',
		},
		{
			name: 'Get Move Function Argument Types',
			value: 'getMoveFunctionArgTypes',
			description: 'Get function argument types for a Move function',
			action: 'Get Move function argument types',
		},
	],
	default: 'getPackage',
},
{
	displayName: 'Digest',
	name: 'digest',
	type: 'string',
	required: true,
	displayOptions: {
		show: {
			resource: ['transaction'],
			operation: ['getTransactionBlock'],
		},
	},
	default: '',
	description: 'Transaction digest hash',
},
{
	displayName: 'Options',
	name: 'options',
	type: 'json',
	displayOptions: {
		show: {
			resource: ['transaction'],
			operation: ['getTransactionBlock'],
		},
	},
	default: '{}',
	description: 'Additional options for transaction query',
},
{
	displayName: 'Filter',
	name: 'filter',
	type: 'json',
	displayOptions: {
		show: {
			resource: ['transaction'],
			operation: ['queryTransactionBlocks'],
		},
	},
	default: '{}',
	description: 'Query filter criteria',
},
{
	displayName: 'Cursor',
	name: 'cursor',
	type: 'string',
	displayOptions: {
		show: {
			resource: ['transaction'],
			operation: ['queryTransactionBlocks'],
		},
	},
	default: '',
	description: 'Pagination cursor',
},
{
	displayName: 'Limit',
	name: 'limit',
	type: 'number',
	displayOptions: {
		show: {
			resource: ['transaction'],
			operation: ['queryTransactionBlocks'],
		},
	},
	default: 50,
	description: 'Maximum number of results',
},
{
	displayName: 'Descending Order',
	name: 'descendingOrder',
	type: 'boolean',
	displayOptions: {
		show: {
			resource: ['transaction'],
			operation: ['queryTransactionBlocks'],
		},
	},
	default: false,
	description: 'Whether to sort results in descending order',
},
{
	displayName: 'Transaction Bytes',
	name: 'txBytes',
	type: 'string',
	required: true,
	displayOptions: {
		show: {
			resource: ['transaction'],
			operation: ['executeTransactionBlock', 'dryRunTransactionBlock', 'devInspectTransactionBlock'],
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
			resource: ['transaction'],
			operation: ['executeTransactionBlock'],
		},
	},
	default: '[]',
	description: 'Array of signatures for the transaction',
},
{
	displayName: 'Execute Options',
	name: 'executeOptions',
	type: 'json',
	displayOptions: {
		show: {
			resource: ['transaction'],
			operation: ['executeTransactionBlock'],
		},
	},
	default: '{}',
	description: 'Additional options for transaction execution',
},
{
	displayName: 'Start Block',
	name: 'start',
	type: 'number',
	required: true,
	displayOptions: {
		show: {
			resource: ['transaction'],
			operation: ['getTransactionBlocksInRange'],
		},
	},
	default: 0,
	description: 'Starting block number',
},
{
	displayName: 'End Block',
	name: 'end',
	type: 'number',
	required: true,
	displayOptions: {
		show: {
			resource: ['transaction'],
			operation: ['getTransactionBlocksInRange'],
		},
	},
	default: 100,
	description: 'Ending block number',
},
{
  displayName: 'Transaction Digests',
  name: 'digests',
  type: 'json',
  required: true,
  displayOptions: {
    show: {
      resource: ['transaction'],
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
      resource: ['transaction'],
      operation: ['multiGetTransactions'],
    },
  },
  default: '{}',
  description: 'Additional options for the transaction query',
},
{
  displayName: 'Sender Address',
  name: 'senderAddress',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['transaction'],
      operation: ['devInspectTransactionBlock'],
    },
  },
  default: '',
  description: 'The sender address for inspection',
},
{
  displayName: 'Gas Price',
  name: 'gasPrice',
  type: 'string',
  required: false,
  displayOptions: {
    show: {
      resource: ['transaction'],
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
      resource: ['transaction'],
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
			resource: ['object'],
			operation: ['getObject'],
		},
	},
	default: '',
	description: 'The ID of the object to retrieve',
},
{
	displayName: 'Options',
	name: 'options',
	type: 'collection',
	placeholder: 'Add Option',
	default: {},
	displayOptions: {
		show: {
			resource: ['object'],
			operation: ['getObject'],
		},
	},
	options: [
		{
			displayName: 'Show Type',
			name: 'showType',
			type: 'boolean',
			default: false,
			description: 'Whether to show the type of the object',
		},
		{
			displayName: 'Show Content',
			name: 'showContent',
			type: 'boolean',
			default: false,
			description: 'Whether to show the content/fields of the object',
		},
		{
			displayName: 'Show Owner',
			name: 'showOwner',
			type: 'boolean',
			default: false,
			description: 'Whether to show the owner of the object',
		},
		{
			displayName: 'Show Previous Transaction',
			name: 'showPreviousTransaction',
			type: 'boolean',
			default: false,
			description: 'Whether to show the previous transaction digest',
		},
		{
			displayName: 'Show Storage Rebate',
			name: 'showStorageRebate',
			type: 'boolean',
			default: false,
			description: 'Whether to show the storage rebate',
		},
		{
			displayName: 'Show Display',
			name: 'showDisplay',
			type: 'boolean',
			default: false,
			description: 'Whether to show the display metadata',
		},
	],
},
{
	displayName: 'Object IDs',
	name: 'objectIds',
	type: 'string',
	required: true,
	displayOptions: {
		show: {
			resource: ['object'],
			operation: ['multiGetObjects'],
		},
	},
	default: '',
	description: 'Comma-separated list of object IDs to retrieve',
},
{
	displayName: 'Options',
	name: 'options',
	type: 'collection',
	placeholder: 'Add Option',
	default: {},
	displayOptions: {
		show: {
			resource: ['object'],
			operation: ['multiGetObjects'],
		},
	},
	options: [
		{
			displayName: 'Show Type',
			name: 'showType',
			type: 'boolean',
			default: false,
			description: 'Whether to show the type of the objects',
		},
		{
			displayName: 'Show Content',
			name: 'showContent',
			type: 'boolean',
			default: false,
			description: 'Whether to show the content/fields of the objects',
		},
		{
			displayName: 'Show Owner',
			name: 'showOwner',
			type: 'boolean',
			default: false,
			description: 'Whether to show the owner of the objects',
		},
		{
			displayName: 'Show Previous Transaction',
			name: 'showPreviousTransaction',
			type: 'boolean',
			default: false,
			description: 'Whether to show the previous transaction digest',
		},
		{
			displayName: 'Show Storage Rebate',
			name: 'showStorageRebate',
			type: 'boolean',
			default: false,
			description: 'Whether to show the storage rebate',
		},
		{
			displayName: 'Show Display',
			name: 'showDisplay',
			type: 'boolean',
			default: false,
			description: 'Whether to show the display metadata',
		},
	],
},
{
	displayName: 'Owner Address',
	name: 'owner',
	type: 'string',
	required: true,
	displayOptions: {
		show: {
			resource: ['object'],
			operation: ['getOwnedObjects'],
		},
	},
	default: '',
	description: 'The address of the object owner',
},
{
	displayName: 'Query Options',
	name: 'query',
	type: 'collection',
	placeholder: 'Add Query Option',
	default: {},
	displayOptions: {
		show: {
			resource: ['object'],
			operation: ['getOwnedObjects'],
		},
	},
	options: [
		{
			displayName: 'Match All',
			name: 'matchAll',
			type: 'json',
			default: '[]',
			description: 'Query conditions that must all match',
		},
		{
			displayName: 'Match Any',
			name: 'matchAny',
			type: 'json',
			default: '[]',
			description: 'Query conditions where any can match',
		},
		{
			displayName: 'Match None',
			name: 'matchNone',
			type: 'json',
			default: '[]',
			description: 'Query conditions that must not match',
		},
	],
},
{
	displayName: 'Cursor',
	name: 'cursor',
	type: 'string',
	default: '',
	displayOptions: {
		show: {
			resource: ['object'],
			operation: ['getOwnedObjects'],
		},
	},
	description: 'Pagination cursor for the next page of results',
},
{
	displayName: 'Limit',
	name: 'limit',
	type: 'number',
	default: 50,
	displayOptions: {
		show: {
			resource: ['object'],
			operation: ['getOwnedObjects'],
		},
	},
	description: 'Maximum number of objects to return',
},
{
	displayName: 'Options',
	name: 'options',
	type: 'collection',
	placeholder: 'Add Option',
	default: {},
	displayOptions: {
		show: {
			resource: ['object'],
			operation: ['getOwnedObjects'],
		},
	},
	options: [
		{
			displayName: 'Show Type',
			name: 'showType',
			type: 'boolean',
			default: false,
			description: 'Whether to show the type of the objects',
		},
		{
			displayName: 'Show Content',
			name: 'showContent',
			type: 'boolean',
			default: false,
			description: 'Whether to show the content/fields of the objects',
		},
		{
			displayName: 'Show Owner',
			name: 'showOwner',
			type: 'boolean',
			default: false,
			description: 'Whether to show the owner of the objects',
		},
		{
			displayName: 'Show Previous Transaction',
			name: 'showPreviousTransaction',
			type: 'boolean',
			default: false,
			description: 'Whether to show the previous transaction digest',
		},
		{
			displayName: 'Show Storage Rebate',
			name: 'showStorageRebate',
			type: 'boolean',
			default: false,
			description: 'Whether to show the storage rebate',
		},
		{
			displayName: 'Show Display',
			name: 'showDisplay',
			type: 'boolean',
			default: false,
			description: 'Whether to show the display metadata',
		},
	],
},
{
  displayName: 'Query',
  name: 'query',
  type: 'json',
  required: true,
  displayOptions: {
    show: {
      resource: ['object'],
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
      resource: ['object'],
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
      resource: ['object'],
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
      resource: ['object'],
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
			resource: ['object'],
			operation: ['getDynamicFields'],
		},
	},
	default: '',
	description: 'The ID of the parent object containing dynamic fields',
},
{
	displayName: 'Cursor',
	name: 'cursor',
	type: 'string',
	default: '',
	displayOptions: {
		show: {
			resource: ['object'],
			operation: ['getDynamicFields'],
		},
	},
	description: 'Pagination cursor for the next page of results',
},
{
	displayName: 'Limit',
	name: 'limit',
	type: 'number',
	default: 50,
	displayOptions: {
		show: {
			resource: ['object'],
			operation: ['getDynamicFields'],
		},
	},
	description: 'Maximum number of dynamic fields to return',
},
{
	displayName: 'Parent Object ID',
	name: 'parentObjectId',
	type: 'string',
	required: true,
	displayOptions: {
		show: {
			resource: ['object'],
			operation: ['getDynamicFieldObject'],
		},
	},
	default: '',
	description: 'The ID of the parent object containing the dynamic field',
},
{
	displayName: 'Field Name',
	name: 'fieldName',
	type: 'string',
	required: true,
	displayOptions: {
		show: {
			resource: ['object'],
			operation: ['getDynamicFieldObject'],
		},
	},
	default: '',
	description: 'The name of the dynamic field',
},
{
	displayName: 'Owner Address',
	name: 'owner',
	type: 'string',
	required: true,
	displayOptions: {
		show: {
			resource: ['coin'],
			operation: ['getCoins', 'getAllCoins', 'getBalance', 'getAllBalances'],
		},
	},
	default: '',
	description: 'The owner address to get coins for',
},
{
	displayName: 'Coin Type',
	name: 'coinType',
	type: 'string',
	required: true,
	displayOptions: {
		show: {
			resource: ['coin'],
			operation: ['getCoins', 'getCoinMetadata', 'getTotalSupply', 'getBalance'],
		},
	},
	default: '0x2::sui::SUI',
	description: 'The coin type to query (e.g., 0x2::sui::SUI)',
},
{
	displayName: 'Cursor',
	name: 'cursor',
	type: 'string',
	required: false,
	displayOptions: {
		show: {
			resource: ['coin'],
			operation: ['getCoins', 'getAllCoins'],
		},
	},
	default: '',
	description: 'Optional cursor for pagination',
},
{
	displayName: 'Limit',
	name: 'limit',
	type: 'number',
	required: false,
	displayOptions: {
		show: {
			resource: ['coin'],
			operation: ['getCoins', 'getAllCoins'],
		},
	},
	default: 50,
	description: 'Maximum number of items to return',
},
{
  displayName: 'Owner Address',
  name: 'owner',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['validator'],
      operation: ['getStakes']
    }
  },
  default: '',
  description: 'The address to get staking information for'
},
{
  displayName: 'Staked Sui IDs',
  name: 'staked_sui_ids',
  type: 'json',
  required: true,
  displayOptions: {
    show: {
      resource: ['validator'],
      operation: ['getStakesByIds']
    }
  },
  default: '[]',
  description: 'Array of staking pool IDs to query'
},
{
	displayName: 'Checkpoint ID',
	name: 'checkpoint_id',
	type: 'string',
	required: true,
	displayOptions: {
		show: {
			resource: ['network'],
			operation: ['getCheckpoint'],
		},
	},
	default: '',
	description: 'The sequence number of the checkpoint to retrieve',
},
{
	displayName: 'Cursor',
	name: 'cursor',
	type: 'string',
	displayOptions: {
		show: {
			resource: ['network'],
			operation: ['getCheckpoints', 'getEpochs'],
		},
	},
	default: '',
	description: 'Optional cursor for pagination',
},
{
	displayName: 'Limit',
	name: 'limit',
	type: 'number',
	displayOptions: {
		show: {
			resource: ['network'],
			operation: ['getCheckpoints', 'getEpochs'],
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
	name: 'descending_order',
	type: 'boolean',
	displayOptions: {
		show: {
			resource: ['network'],
			operation: ['getCheckpoints', 'getEpochs'],
		},
	},
	default: false,
	description: 'Whether to return results in descending order',
},
{
  displayName: 'Query',
  name: 'query',
  type: 'json',
  required: true,
  default: '{}',
  displayOptions: { show: { resource: ['event'], operation: ['queryEvents'] } },
  description: 'Query filters for events',
},
{
  displayName: 'Cursor',
  name: 'cursor',
  type: 'string',
  default: '',
  displayOptions: { show: { resource: ['event'], operation: ['queryEvents'] } },
  description: 'Cursor for pagination',
},
{
  displayName: 'Limit',
  name: 'limit',
  type: 'number',
  default: 50,
  displayOptions: { show: { resource: ['event'], operation: ['queryEvents'] } },
  description: 'Maximum number of events to return',
},
{
  displayName: 'Descending Order',
  name: 'descendingOrder',
  type: 'boolean',
  default: true,
  displayOptions: { show: { resource: ['event'], operation: ['queryEvents'] } },
  description: 'Whether to return events in descending order',
},
{
  displayName: 'Digest',
  name: 'digest',
  type: 'string',
  required: true,
  default: '',
  displayOptions: { show: { resource: ['event'], operation: ['getEvents'] } },
  description: 'Transaction digest to get events for',
},
{
  displayName: 'Event Filter',
  name: 'filter',
  type: 'json',
  required: true,
  displayOptions: {
    show: {
      resource: ['event'],
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
      resource: ['event'],
      operation: ['unsubscribeEvent'],
    },
  },
  default: '',
  description: 'ID of the subscription to unsubscribe from',
},
{
	displayName: 'Package ID',
	name: 'packageId',
	type: 'string',
	required: true,
	displayOptions: {
		show: {
			resource: ['package'],
			operation: ['getPackage', 'getNormalizedMoveModulesByPackage', 'getNormalizedMoveModule', 'getNormalizedMoveFunction', 'getNormalizedMoveStruct', 'getMoveFunctionArgTypes'],
		},
	},
	default: '',
	description: 'The ID of the Move package',
},
{
	displayName: 'Module Name',
	name: 'moduleName',
	type: 'string',
	required: true,
	displayOptions: {
		show: {
			resource: ['package'],
			operation: ['getNormalizedMoveModule', 'getNormalizedMoveFunction', 'getNormalizedMoveStruct', 'getMoveFunctionArgTypes'],
		},
	},
	default: '',
	description: 'The name of the module',
},
{
	displayName: 'Function Name',
	name: 'functionName',
	type: 'string',
	required: true,
	displayOptions: {
		show: {
			resource: ['package'],
			operation: ['getNormalizedMoveFunction', 'getMoveFunctionArgTypes'],
		},
	},
	default: '',
	description: 'The name of the function',
},
{
	displayName: 'Struct Name',
	name: 'structName',
	type: 'string',
	required: true,
	displayOptions: {
		show: {
			resource: ['package'],
			operation: ['getNormalizedMoveStruct'],
		},
	},
	default: '',
	description: 'The name of the struct',
},
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const resource = this.getNodeParameter('resource', 0) as string;

    switch (resource) {
      case 'transaction':
        return [await executeTransactionOperations.call(this, items)];
      case 'object':
        return [await executeObjectOperations.call(this, items)];
      case 'coin':
        return [await executeCoinOperations.call(this, items)];
      case 'validator':
        return [await executeValidatorOperations.call(this, items)];
      case 'network':
        return [await executeNetworkOperations.call(this, items)];
      case 'event':
        return [await executeEventOperations.call(this, items)];
      case 'package':
        return [await executePackageOperations.call(this, items)];
      default:
        throw new NodeOperationError(this.getNode(), `The resource "${resource}" is not supported`);
    }
  }
}

// ============================================================
// Resource Handler Functions
// ============================================================

async function executeTransactionOperations(
	this: IExecuteFunctions,
	items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
	const returnData: INodeExecutionData[] = [];
	const operation = this.getNodeParameter('operation', 0) as string;
	const credentials = await this.getCredentials('suiApi') as any;

	for (let i = 0; i < items.length; i++) {
		try {
			let result: any;
			let rpcParams: any[] = [];
			let method: string = '';

			switch (operation) {
				case 'getTransactionBlock': {
					const digest = this.getNodeParameter('digest', i) as string;
					const options = this.getNodeParameter('options', i, {}) as any;
					method = 'sui_getTransactionBlock';
					rpcParams = [digest, options];
					break;
				}

				case 'queryTransactionBlocks': {
					const filter = this.getNodeParameter('filter', i, {}) as any;
					const cursor = this.getNodeParameter('cursor', i, null) as string;
					const limit = this.getNodeParameter('limit', i, 50) as number;
					const descendingOrder = this.getNodeParameter('descendingOrder', i, false) as boolean;
					method = 'suix_queryTransactionBlocks';
					rpcParams = [filter, cursor, limit, descendingOrder];
					break;
				}

				case 'executeTransactionBlock': {
					const txBytes = this.getNodeParameter('txBytes', i) as string;
					const signatures = this.getNodeParameter('signatures', i) as any[];
					const executeOptions = this.getNodeParameter('executeOptions', i, {}) as any;
					method = 'sui_executeTransactionBlock';
					rpcParams = [txBytes, signatures, executeOptions];
					break;
				}

				case 'dryRunTransactionBlock': {
					const txBytes = this.getNodeParameter('txBytes', i) as string;
					method = 'sui_dryRunTransactionBlock';
					rpcParams = [txBytes];
					break;
				}

				case 'getTransactionBlocksInRange': {
					const start = this.getNodeParameter('start', i) as number;
					const end = this.getNodeParameter('end', i) as number;
					method = 'sui_getTransactionBlocksInRange';
					rpcParams = [start, end];
					break;
				}

        case 'multiGetTransactions': {
          const digests = this.getNodeParameter('digests', i) as any[];
          const options = this.getNodeParameter('options', i) as any;
          method = 'sui_multiGetTransactions';
          rpcParams = [digests, options];
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

          method = 'sui_devInspectTransactionBlock';
          rpcParams = params;
          break;
        }

				default:
					throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
			}

			const requestBody = {
				jsonrpc: '2.0',
				id: 1,
				method: method,
				params: rpcParams,
			};

			const options: any = {
				method: 'POST',
				url: credentials.baseUrl,
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
			returnData.push({ json: result, pairedItem: { item: i } });

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

async function executeObjectOperations(
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
          const options = this.getNodeParameter('options', i) as any;

          const showOptions: any = {
            showType: options.showType || false,
            showContent: options.showContent || false,
            showOwner: options.showOwner || false,
            showPreviousTransaction: options.showPreviousTransaction || false,
            showStorageRebate: options.showStorageRebate || false,
            showDisplay: options.showDisplay || false,
          };

          const requestOptions: any = {
            method: 'POST',
            url: credentials.baseUrl || 'https://fullnode.mainnet.sui.io:443',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              jsonrpc: '2.0',
              id: 1,
              method: 'sui_getObject',
              params: [objectId, showOptions],
            }),
          };
          
          result = await this.helpers.httpRequest(requestOptions) as any;
          break;
        }

        case 'multiGetObjects': {
          const objectIdsString = this.getNodeParameter('objectIds', i) as string;
          const objectIds = objectIdsString.split(',').map(id => id.trim());
          const options = this.getNodeParameter('options', i) as any;

          const showOptions: any = {
            showType: options.showType || false,
            showContent: options.showContent || false,
            showOwner: options.showOwner || false,
            showPreviousTransaction: options.showPreviousTransaction || false,
            showStorageRebate: options.showStorageRebate || false,
            showDisplay: options.showDisplay || false,
          };

          const requestOptions: any = {
            method: 'POST',
            url: credentials.baseUrl || 'https://fullnode.mainnet.sui.io:443',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              jsonrpc: '2.0',
              id: 1,
              method: 'sui_multiGetObjects',
              params: [objectIds, showOptions],
            }),
          };
          
          result = await this.helpers.httpRequest(requestOptions) as any;
          break;
        }

        case 'getOwnedObjects': {
          const owner = this.getNodeParameter('owner', i) as string;
          const query = this.getNodeParameter('query', i) as any;
          const cursor = this.getNodeParameter('cursor', i, '') as string;
          const limit = this.getNodeParameter('limit', i, 50) as number;
          const options = this.getNodeParameter('options', i) as any;

          const queryFilter: any = {};
          if (query.matchAll) {
            queryFilter.MatchAll = JSON.parse(query.matchAll);
          }
          if (query.matchAny) {
            queryFilter.MatchAny = JSON.parse(query.matchAny);
          }
          if (query.matchNone) {
            queryFilter.MatchNone = JSON.parse(query.matchNone);
          }

          const showOptions: any = {
            showType: options.showType || false,
            showContent: options.showContent || false,
            showOwner: options.showOwner || false,
            showPreviousTransaction: options.showPreviousTransaction || false,
            showStorageRebate: options.showStorageRebate || false,
            showDisplay: options.showDisplay || false,
          };

          const params: any[] = [owner];
          if (Object.keys(queryFilter).length > 0) {
            params.push(queryFilter);
          } else {
            params.push(null);
          }
          if (cursor) {
            params.push(cursor);
          } else {
            params.push(null);
          }
          params.push(limit);
          params.push(showOptions);

          const requestOptions: any = {
            method: 'POST',
            url: credentials.baseUrl || 'https://fullnode.mainnet.sui.io:443',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              jsonrpc: '2.0',
              id: 1,
              method: 'sui_getOwnedObjects',
              params: params,
            }),
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
          const cursor = this.getNodeParameter('cursor', i) as string;
          const limit = this.getNodeParameter('limit', i) as number;

          const params: any[] = [parentObjectId];
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
            body: JSON.stringify({
              jsonrpc: '2.0',
              id: 1,
              method: 'sui_getDynamicFields',
              params: params,
            }),
          };
          
          result = await this.helpers.httpRequest(requestOptions) as any;
          break;
        }

        case 'getDynamicFieldObject': {
          const parentObjectId = this.getNodeParameter('parentObjectId', i) as string;
          const fieldName = this.getNodeParameter('fieldName', i) as string;

          const requestOptions: any = {
            method: 'POST',
            url: credentials.baseUrl || 'https://fullnode.mainnet.sui.io:443',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              jsonrpc: '2.0',
              id: 1,
              method: 'sui_getDynamicFieldObject',
              params: [parentObjectId, { type: 'string', value: fieldName }],
            }),
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

async function executeCoinOperations(
	this: IExecuteFunctions,
	items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
	const returnData: INodeExecutionData[] = [];
	const operation = this.getNodeParameter('operation', 0) as string;
	const credentials = await this.getCredentials('suiApi') as any;

	for (let i = 0; i < items.length; i++) {
		try {
			let result: any;
			const rpcId = Math.floor(Math.random() * 10000);

			switch (operation) {
				case 'getCoins': {
					const owner = this.getNodeParameter('owner', i) as string;
					const coinType = this.getNodeParameter('coinType', i) as string;
					const cursor = this.getNodeParameter('cursor', i) as string;
					const limit = this.getNodeParameter('limit', i) as number;

					const params: any[] = [owner];
					if (coinType) params.push(coinType);
					if (cursor) params.push(cursor);
					if (limit) params.push(limit);

					const requestBody = {
						jsonrpc: '2.0',
						id: rpcId,
						method: 'suix_getCoins',
						params,
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
					const data = JSON.parse(response);
					result = data.result || data;
					break;
				}

				case 'getAllCoins': {
					const owner = this.getNodeParameter('owner', i) as string;
					const cursor = this.getNodeParameter('cursor', i) as string;
					const limit = this.getNodeParameter('limit', i) as number;

					const params: any[] = [owner];
					if (cursor) params.push(cursor);
					if (limit) params.push(limit);

					const requestBody = {
						jsonrpc: '2.0',
						id: rpcId,
						method: 'suix_getAllCoins',
						params,
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
					const data = JSON.parse(response);
					result = data.result || data;
					break;
				}

				case 'getCoinMetadata': {
					const coinType = this.getNodeParameter('coinType', i) as string;

					const requestBody = {
						jsonrpc: '2.0',
						id: rpcId,
						method: 'suix_getCoinMetadata',
						params: [coinType],
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
					const data = JSON.parse(response);
					result = data.result || data;
					break;
				}

				case 'getTotalSupply': {
					const coinType = this.getNodeParameter('coinType', i) as string;

					const requestBody = {
						jsonrpc: '2.0',
						id: rpcId,
						method: 'suix_getTotalSupply',
						params: [coinType],
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
					const data = JSON.parse(response);
					result = data.result || data;
					break;
				}

				case 'getBalance': {
					const owner = this.getNodeParameter('owner', i) as string;
					const coinType = this.getNodeParameter('coinType', i) as string;

					const requestBody = {
						jsonrpc: '2.0',
						id: rpcId,
						method: 'suix_getBalance',
						params: [owner, coinType],
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
					const data = JSON.parse(response);
					result = data.result || data;
					break;
				}

				case 'getAllBalances': {
					const owner = this.getNodeParameter('owner', i) as string;

					const requestBody = {
						jsonrpc: '2.0',
						id: rpcId,
						method: 'suix_getAllBalances',
						params: [owner],
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
					const data = JSON.parse(response);
					result = data.result || data;
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

async function executeValidatorOperations(
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
              params: []
            }
          };

          if (credentials.apiKey) {
            options.headers['Authorization'] = `Bearer ${credentials.apiKey}`;
          }

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
              params: []
            }
          };

          if (credentials.apiKey) {
            options.headers['Authorization'] = `Bearer ${credentials.apiKey}`;
          }

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getStakes': {
          const owner = this.getNodeParameter('owner', i) as string;

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
              params: [owner]
            }
          };

          if (credentials.apiKey) {
            options.headers['Authorization'] = `Bearer ${credentials.apiKey}`;
          }

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getStakesByIds': {
          const stakedSuiIds = this.getNodeParameter('staked_sui_ids', i) as any;
          const parsedIds = typeof stakedSuiIds === 'string' ? JSON.parse(stakedSuiIds) : stakedSuiIds;

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
              params: [parsedIds]
            }
          };

          if (credentials.apiKey) {
            options.headers['Authorization'] = `Bearer ${credentials.apiKey}`;
          }

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        default:
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
      }

      returnData.push({ json: result, pairedItem: { item: i } });
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

async function executeNetworkOperations(
	this: IExecuteFunctions,
	items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
	const returnData: INodeExecutionData[] = [];
	const operation