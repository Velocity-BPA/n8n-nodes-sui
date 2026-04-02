import type { ICredentialType, INodeProperties } from 'n8n-workflow';

export class SuiApi implements ICredentialType {
	name = 'suiApi';
	displayName = 'Sui API';
	documentationUrl = 'https://docs.sui.io/sui-api-ref';
	properties: INodeProperties[] = [
		{
			displayName: 'RPC Endpoint URL',
			name: 'rpcEndpoint',
			type: 'string',
			default: 'https://fullnode.mainnet.sui.io:443',
			required: true,
			description: 'The Sui RPC endpoint URL',
		},
		{
			displayName: 'Network',
			name: 'network',
			type: 'options',
			options: [
				{
					name: 'Mainnet',
					value: 'mainnet',
				},
				{
					name: 'Testnet',
					value: 'testnet',
				},
				{
					name: 'Devnet',
					value: 'devnet',
				},
				{
					name: 'Custom',
					value: 'custom',
				},
			],
			default: 'mainnet',
			description: 'The Sui network to connect to',
		},
		{
			displayName: 'Private Key',
			name: 'privateKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			description: 'Private key for signing transactions (required for write operations)',
		},
		{
			displayName: 'Request Timeout',
			name: 'timeout',
			type: 'number',
			default: 30000,
			description: 'Request timeout in milliseconds',
		},
	];
}