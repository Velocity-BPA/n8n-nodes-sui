/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
  IAuthenticateGeneric,
  ICredentialTestRequest,
  ICredentialType,
  INodeProperties,
} from 'n8n-workflow';

export class SuiNetwork implements ICredentialType {
  name = 'suiNetwork';
  displayName = 'Sui Network';
  documentationUrl = 'https://docs.sui.io';
  properties: INodeProperties[] = [
    {
      displayName: 'Network',
      name: 'network',
      type: 'options',
      options: [
        { name: 'Mainnet', value: 'mainnet' },
        { name: 'Testnet', value: 'testnet' },
        { name: 'Devnet', value: 'devnet' },
        { name: 'Localnet', value: 'localnet' },
        { name: 'Custom', value: 'custom' },
      ],
      default: 'mainnet',
      description: 'Select the Sui network to connect to',
    },
    {
      displayName: 'Custom RPC URL',
      name: 'customRpcUrl',
      type: 'string',
      default: '',
      placeholder: 'https://your-custom-rpc.example.com',
      description: 'Custom RPC endpoint URL',
      displayOptions: {
        show: {
          network: ['custom'],
        },
      },
    },
    {
      displayName: 'Private Key',
      name: 'privateKey',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
      description: 'Private key in hex format (with or without 0x prefix) or Bech32 format',
    },
    {
      displayName: 'Key Scheme',
      name: 'keyScheme',
      type: 'options',
      options: [
        { name: 'Ed25519', value: 'ed25519' },
        { name: 'Secp256k1', value: 'secp256k1' },
        { name: 'Secp256r1', value: 'secp256r1' },
      ],
      default: 'ed25519',
      description: 'The key scheme used for the private key',
    },
    {
      displayName: 'Faucet URL',
      name: 'faucetUrl',
      type: 'string',
      default: '',
      placeholder: 'https://faucet.testnet.sui.io/gas',
      description: 'Faucet URL for testnet/devnet (optional)',
      displayOptions: {
        show: {
          network: ['testnet', 'devnet', 'localnet', 'custom'],
        },
      },
    },
  ];

  authenticate: IAuthenticateGeneric = {
    type: 'generic',
    properties: {},
  };

  test: ICredentialTestRequest = {
    request: {
      baseURL: '={{$credentials.network === "custom" ? $credentials.customRpcUrl : ($credentials.network === "mainnet" ? "https://fullnode.mainnet.sui.io:443" : ($credentials.network === "testnet" ? "https://fullnode.testnet.sui.io:443" : ($credentials.network === "devnet" ? "https://fullnode.devnet.sui.io:443" : "http://127.0.0.1:9000")))}}',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'sui_getLatestCheckpointSequenceNumber',
        params: [],
      }),
    },
  };
}
