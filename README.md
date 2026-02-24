# n8n-nodes-sui

> **[Velocity BPA Licensing Notice]**
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

This n8n community node provides comprehensive integration with the Sui blockchain network, enabling automated interactions with 7 core resources including Transactions, Objects, Addresses, Validators, Packages, and System operations. Build powerful blockchain automation workflows with support for querying transaction history, managing digital objects, monitoring validator performance, and executing smart contract interactions.

![n8n Community Node](https://img.shields.io/badge/n8n-Community%20Node-blue)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![Sui Network](https://img.shields.io/badge/Sui-Blockchain-6FBCF0)
![Move Language](https://img.shields.io/badge/Move-Smart%20Contracts-FF6B35)
![Web3](https://img.shields.io/badge/Web3-Integration-4E9F3D)

## Features

- **Transaction Management** - Query, submit, and monitor Sui blockchain transactions with detailed status tracking
- **Object Operations** - Retrieve and manage Sui objects including NFTs, coins, and custom Move objects
- **Address Analytics** - Fetch address balances, transaction history, and owned objects for comprehensive wallet analysis  
- **Validator Monitoring** - Access validator information, staking details, and network performance metrics
- **Package Interaction** - Query Move packages, modules, and smart contract metadata for dApp integration
- **System Information** - Retrieve network status, epoch data, and blockchain configuration details
- **Flexible Authentication** - Secure API key-based authentication with support for multiple network endpoints
- **Error Handling** - Comprehensive error management with detailed blockchain-specific error messages

## Installation

### Community Nodes (Recommended)

1. Open n8n
2. Go to **Settings** → **Community Nodes**
3. Click **Install a community node**
4. Enter `n8n-nodes-sui`
5. Click **Install**

### Manual Installation

```bash
cd ~/.n8n
npm install n8n-nodes-sui
```

### Development Installation

```bash
git clone https://github.com/Velocity-BPA/n8n-nodes-sui.git
cd n8n-nodes-sui
npm install
npm run build
mkdir -p ~/.n8n/custom
ln -s $(pwd) ~/.n8n/custom/n8n-nodes-sui
n8n start
```

## Credentials Setup

| Field | Description | Required |
|-------|-------------|----------|
| API Key | Sui RPC API key for authenticated requests | Yes |
| Environment | Network environment (mainnet, testnet, devnet) | Yes |
| RPC Endpoint | Custom RPC endpoint URL (optional) | No |
| Timeout | Request timeout in milliseconds (default: 30000) | No |

## Resources & Operations

### 1. Transactions

| Operation | Description |
|-----------|-------------|
| Get Transaction | Retrieve transaction details by transaction digest |
| Get Transactions | Query multiple transactions with filtering options |
| Execute Transaction | Submit and execute a transaction on the Sui network |
| Get Transaction Block | Fetch transaction block data with execution details |
| Multi Get Transactions | Retrieve multiple transactions in a single request |
| Query Transaction Blocks | Search transaction blocks with advanced filtering |

### 2. Objects

| Operation | Description |
|-----------|-------------|
| Get Object | Retrieve object data by object ID |
| Get Objects | Fetch multiple objects in batch |
| Get Object Details | Get detailed object information including type and content |
| Query Objects | Search objects with filtering criteria |
| Get Dynamic Fields | Retrieve dynamic fields for a specific object |
| Get Dynamic Field Object | Fetch dynamic field object data |

### 3. Addresses

| Operation | Description |
|-----------|-------------|
| Get Address Balance | Retrieve balance information for a specific address |
| Get All Balances | Fetch all coin balances for an address |
| Get Coins | Get coin objects owned by an address |
| Get Objects Owned | Retrieve all objects owned by an address |
| Get Transaction Blocks | Get transaction history for an address |
| Get Stakes | Retrieve staking information for an address |

### 4. Validators

| Operation | Description |
|-----------|-------------|
| Get Validators | Retrieve current validator set information |
| Get Latest Sui System State | Fetch the latest system state including validator details |
| Get Stakes By IDs | Get stake information by validator IDs |
| Get Committee Info | Retrieve committee information for current epoch |

### 5. Packages

| Operation | Description |
|-----------|-------------|
| Get Package | Retrieve Move package information by package ID |
| Get Normalized Package | Get normalized package data with module information |
| Get Package Objects | Fetch all objects created from a specific package |
| Query Events | Query events emitted by package modules |

### 6. System

| Operation | Description |
|-----------|-------------|
| Get Chain Identifier | Retrieve the chain identifier for the network |
| Get Checkpoint | Get checkpoint data by sequence number |
| Get Latest Checkpoint | Fetch the most recent checkpoint information |
| Get Total Supply | Get total supply information for SUI tokens |
| Get Reference Gas Price | Retrieve current reference gas price |
| Get Protocol Config | Fetch protocol configuration parameters |

### 7. Unknown

| Operation | Description |
|-----------|-------------|
| Custom RPC Call | Execute custom RPC method calls not covered by standard operations |
| Raw Query | Send raw JSON-RPC requests to the Sui network |

## Usage Examples

```javascript
// Get transaction details
{
  "resource": "Transactions",
  "operation": "Get Transaction",
  "transactionDigest": "8VLFSDeAzWX7hFpuFqTHh4c3VJ4n1ckP5xPpKQMW2Rs8",
  "options": {
    "showInput": true,
    "showEffects": true,
    "showEvents": true
  }
}
```

```javascript
// Query address balance
{
  "resource": "Addresses", 
  "operation": "Get Address Balance",
  "address": "0xa1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456",
  "coinType": "0x2::sui::SUI"
}
```

```javascript
// Get validator information
{
  "resource": "Validators",
  "operation": "Get Validators",
  "epoch": "current"
}
```

```javascript
// Query Move package details
{
  "resource": "Packages",
  "operation": "Get Package", 
  "packageId": "0x1234567890abcdef1234567890abcdef12345678",
  "normalized": true
}
```

## Error Handling

| Error | Description | Solution |
|-------|-------------|----------|
| Invalid Transaction Digest | Transaction digest format is incorrect | Verify the transaction digest is a valid base58 encoded string |
| Object Not Found | Requested object ID does not exist | Check the object ID and ensure the object hasn't been deleted |
| Insufficient Gas | Transaction requires more gas than provided | Increase gas budget or optimize transaction structure |
| RPC Timeout | Request exceeded the configured timeout limit | Increase timeout value or check network connectivity |
| Invalid Address Format | Address format does not match Sui standards | Ensure address is properly formatted with 0x prefix and correct length |
| Epoch Not Found | Requested epoch data is not available | Use a valid epoch number or 'current' for latest epoch |

## Development

```bash
npm install
npm run build
npm test
npm run lint
npm run dev
```

## Author

**Velocity BPA**
- Website: [velobpa.com](https://velobpa.com)
- GitHub: [Velocity-BPA](https://github.com/Velocity-BPA)

## Licensing

This n8n community node is licensed under the **Business Source License 1.1**.

### Free Use
Permitted for personal, educational, research, and internal business use.

### Commercial Use
Use of this node within any SaaS, PaaS, hosted platform, managed service, or paid automation offering requires a commercial license.

For licensing inquiries: **licensing@velobpa.com**

See [LICENSE](LICENSE), [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md), and [LICENSING_FAQ.md](LICENSING_FAQ.md) for details.

## Contributing

Contributions are welcome! Please ensure:

1. Code follows existing style conventions
2. All tests pass (`npm test`)
3. Linting passes (`npm run lint`)
4. Documentation is updated for new features
5. Commit messages are descriptive

## Support

- **Issues**: [GitHub Issues](https://github.com/Velocity-BPA/n8n-nodes-sui/issues)
- **Sui Documentation**: [Sui Developer Docs](https://docs.sui.io/)
- **Sui Community**: [Sui Discord](https://discord.gg/sui)