import {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class SuiApi implements ICredentialType {
	name = 'suiApi';
	displayName = 'Sui API';
	documentationUrl = 'https://docs.sui.io/sui-jsonrpc';
	properties: INodeProperties[] = [
		{
			displayName: 'API Base URL',
			name: 'apiBaseUrl',
			type: 'string',
			default: 'https://fullnode.mainnet.sui.io:443',
			required: true,
			description: 'Base URL for the Sui JSON-RPC API endpoint',
		},
		{
			displayName: 'Private Key',
			name: 'privateKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			description: 'Ed25519 or Secp256k1 private key for signing transactions (optional, only needed for transaction submission)',
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
			description: 'Sui network to connect to',
		},
	];
}