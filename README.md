# n8n-nodes-sui

> **[Velocity BPA Licensing Notice]**
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

An n8n community node for interacting with the Sui blockchain ecosystem. This node provides access to 7 key resources including transactions, objects, coins, validators, network information, events, and packages, enabling comprehensive blockchain automation workflows.

![n8n Community Node](https://img.shields.io/badge/n8n-Community%20Node-blue)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![Blockchain](https://img.shields.io/badge/Blockchain-Sui-6fbcf0)
![Web3](https://img.shields.io/badge/Web3-Compatible-orange)
![DeFi](https://img.shields.io/badge/DeFi-Enabled-green)

## Features

- **Transaction Management** - Create, submit, and query blockchain transactions with full lifecycle support
- **Object Operations** - Retrieve and interact with on-chain objects, including dynamic object fields
- **Coin Management** - Handle coin transfers, balance queries, and multi-coin operations
- **Validator Monitoring** - Access validator information, staking data, and network governance details
- **Network Analytics** - Retrieve network statistics, protocol configuration, and system state information
- **Event Tracking** - Query and filter blockchain events with advanced search capabilities
- **Package Interaction** - Access Move package data, module information, and smart contract interfaces
- **Real-time Integration** - Enable automated workflows triggered by blockchain state changes

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
| API Key | Your Sui RPC endpoint API key for authenticated requests | Yes |
| RPC URL | Custom RPC endpoint URL (defaults to Sui mainnet if not specified) | No |
| Network | Target network (mainnet, testnet, devnet) | No |

## Resources & Operations

### 1. Transaction

| Operation | Description |
|-----------|-------------|
| Get Transaction | Retrieve transaction details by digest |
| Submit Transaction | Submit a signed transaction to the network |
| Execute Transaction | Execute a transaction with automatic signing |
| Get Transaction Block | Get detailed transaction block information |
| Multi Get Transactions | Retrieve multiple transactions in batch |
| Query Transactions | Query transactions with filters and pagination |

### 2. Object

| Operation | Description |
|-----------|-------------|
| Get Object | Retrieve object data by ID |
| Multi Get Objects | Get multiple objects in a single request |
| Get Objects Owned By Address | List all objects owned by a specific address |
| Get Dynamic Fields | Retrieve dynamic fields of an object |
| Get Dynamic Field Object | Get specific dynamic field object data |
| Try Get Past Object | Attempt to retrieve historical object state |

### 3. Coin

| Operation | Description |
|-----------|-------------|
| Get Coins | List coins owned by an address |
| Get All Coins | Retrieve all coin types for an address |
| Get Coin Metadata | Get metadata for a specific coin type |
| Get Total Supply | Retrieve total supply information for a coin |
| Select Coins | Select optimal coins for transaction input |
| Get Balance | Get balance for specific coin types |
| Get All Balances | Retrieve balances for all coin types |

### 4. Validator

| Operation | Description |
|-----------|-------------|
| Get Validators | Retrieve current validator set information |
| Get Latest Sui System State | Get current system state and validator data |
| Get Validator APY | Retrieve validator annual percentage yield |
| Get Committee Info | Get committee information for current epoch |
| Get Stakes | List staking information for an address |
| Get Stakes By IDs | Get specific stake objects by IDs |

### 5. Network

| Operation | Description |
|-----------|-------------|
| Get Chain Identifier | Retrieve the chain identifier |
| Get Checkpoint | Get checkpoint data by sequence number |
| Get Latest Checkpoint Sequence Number | Retrieve the most recent checkpoint number |
| Get Protocol Config | Get current protocol configuration |
| Get Reference Gas Price | Retrieve current reference gas price |
| Get Network Metrics | Get network performance and usage metrics |

### 6. Event

| Operation | Description |
|-----------|-------------|
| Query Events | Search and filter blockchain events |
| Get Events | Retrieve events by transaction digest |
| Subscribe To Events | Set up event subscription for real-time monitoring |
| Get Events By Module | Query events emitted by specific modules |
| Get Events By Package | Retrieve events from specific packages |
| Get Events By Object | Get events related to specific objects |

### 7. Package

| Operation | Description |
|-----------|-------------|
| Get Package | Retrieve Move package information |
| Get Normalized Move Modules | Get normalized module data from a package |
| Get Normalized Move Module | Retrieve specific normalized module |
| Get Move Function | Get details of a specific Move function |
| Get Normalized Move Function | Retrieve normalized Move function data |
| Resolve Name Service Address | Resolve SuiNS names to addresses |

## Usage Examples

```javascript
// Get account balance for SUI tokens
{
  "operation": "Get All Balances",
  "address": "0x1234567890abcdef1234567890abcdef12345678",
  "returnOnlyCoins": true
}
```

```javascript
// Query recent transactions for an address
{
  "operation": "Query Transactions",
  "filter": {
    "FromAddress": "0x1234567890abcdef1234567890abcdef12345678"
  },
  "options": {
    "limit": 10,
    "descendingOrder": true
  }
}
```

```javascript
// Get validator information and staking APY
{
  "operation": "Get Validator APY",
  "epoch": null,
  "includeValidatorInfo": true
}
```

```javascript
// Monitor events from a specific package
{
  "operation": "Query Events",
  "query": {
    "Package": "0x2::coin"
  },
  "cursor": null,
  "limit": 50,
  "descendingOrder": true
}
```

## Error Handling

| Error | Description | Solution |
|-------|-------------|----------|
| Invalid Address Format | Address format is incorrect or malformed | Ensure address follows Sui format (0x + 64 hex characters) |
| Object Not Found | Requested object ID does not exist | Verify object ID and check if object was deleted |
| Insufficient Gas | Transaction gas budget is too low | Increase gas budget or optimize transaction structure |
| RPC Connection Failed | Unable to connect to Sui RPC endpoint | Check network connectivity and RPC URL configuration |
| Invalid Transaction Digest | Transaction digest format is incorrect | Verify transaction digest is valid base64 string |
| Package Not Found | Move package does not exist at specified address | Confirm package address and deployment status |

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
- **Sui Documentation**: [docs.sui.io](https://docs.sui.io)
- **Sui RPC API Reference**: [docs.sui.io/sui-api-ref](https://docs.sui.io/sui-api-ref)