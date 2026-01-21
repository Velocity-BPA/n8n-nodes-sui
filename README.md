# n8n-nodes-sui

> **[Velocity BPA Licensing Notice]**
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

A comprehensive n8n community node for the Sui blockchain providing 13 resources and 80+ operations for transactions, objects, NFTs, staking, DeFi, and smart contracts. Includes real-time event triggers.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![n8n Version](https://img.shields.io/badge/n8n-%3E%3D1.23.0-green)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)

## Features

- **Multi-Network Support**: Mainnet, Testnet, Devnet, Localnet, and custom networks
- **Three Key Scheme Support**: Ed25519, Secp256k1, Secp256r1
- **13 Resource Categories**: Account, Transaction, Coin, Object, NFT, Move, Contract, Staking, DeFi, Checkpoint, Event, Name Service, PTB, Utility
- **80+ Operations**: Comprehensive coverage of Sui blockchain functionality
- **Real-Time Triggers**: WebSocket-based event and transaction monitoring
- **DeFi Protocol Support**: Cetus, Turbos, Kriya, FlowX, Aftermath

## Installation

### Community Nodes (Recommended)

1. Open n8n
2. Go to **Settings** > **Community Nodes**
3. Click **Install a community node**
4. Enter `n8n-nodes-sui`
5. Click **Install**

### Manual Installation

```bash
# Navigate to your n8n installation directory
cd ~/.n8n

# Install the package
npm install n8n-nodes-sui
```

### Development Installation

```bash
# Clone and build
git clone https://github.com/Velocity-BPA/n8n-nodes-sui.git
cd n8n-nodes-sui
npm install
npm run build

# Create symlink
./scripts/install-local.sh

# Restart n8n
```

## Credentials Setup

### Sui Network Credentials

| Field | Description |
|-------|-------------|
| Network | Select: Mainnet, Testnet, Devnet, Localnet, or Custom |
| Custom RPC URL | Required if Network is Custom |
| Private Key | Hex-encoded private key (optional, required for transactions) |
| Key Scheme | Ed25519, Secp256k1, or Secp256r1 |
| Faucet URL | Custom faucet URL for testnet/devnet |

### SuiScan Credentials (Optional)

| Field | Description |
|-------|-------------|
| API Key | SuiScan API key for enhanced queries |
| Network | Mainnet or Testnet |

## Resources & Operations

### Account
- Get Balance - Get SUI balance for an address
- Get All Balances - Get all coin balances
- Get Coins - Get coins by type
- Get Objects - Get owned objects
- Get Transaction History - Get transaction history
- Request Faucet - Request test tokens (testnet/devnet)
- Validate Address - Check if address is valid

### Transaction
- Transfer SUI - Send SUI to an address
- Transfer Object - Send an object to an address
- Pay SUI (Multi) - Send SUI to multiple recipients
- Pay All SUI - Drain wallet to an address
- Get Transaction - Get transaction details by digest
- Dry Run - Simulate a transaction
- Wait For Transaction - Wait for confirmation
- Estimate Gas - Estimate gas cost

### Coin
- Get Coin Metadata - Get metadata for a coin type
- Get Total Supply - Get total supply of a coin
- Get All Coin Balances - Get all balances for an address
- Merge Coins - Combine coins of the same type
- Split Coin - Split a coin into smaller amounts

### Object
- Get Object - Get object details by ID
- Multi Get Objects - Get multiple objects
- Get Dynamic Fields - List dynamic fields
- Get Dynamic Field Object - Get a specific dynamic field
- Get Past Object - Get object at a previous version

### NFT
- Get NFT Info - Get NFT details
- Get NFTs By Owner - List NFTs owned by an address
- Transfer NFT - Send an NFT to an address
- Get NFT Display - Get NFT display metadata

### Move
- Get Module - Get Move module details
- Get All Modules - List all modules in a package
- Get Normalized Module - Get normalized module data
- Get Function - Get function information
- Get Struct - Get struct information

### Contract
- Move Call - Execute a Move function
- Dry Run Move Call - Simulate a Move call
- Dev Inspect - Inspect a transaction

### Staking
- Get Stakes - Get staking positions
- Get Validators - List active validators
- Get Validator APY - Get validator APY
- Get Current Epoch - Get current epoch info
- Stake SUI - Stake SUI with a validator
- Unstake SUI - Unstake from a validator

### DeFi
- Get Protocol Info - Get DeFi protocol information
- Get Pool Object - Get liquidity pool details
- Query Pools - List pools for a protocol

### Checkpoint
- Get Checkpoint - Get checkpoint details
- Get Latest Checkpoint - Get most recent checkpoint
- Get Checkpoints - List checkpoints

### Event
- Query Events - Search for events
- Get Events By Transaction - Get events from a transaction

### Name Service (SuiNS)
- Resolve Name - Resolve a SuiNS name to address
- Get Names By Address - Get names owned by an address
- Get Name Object - Get SuiNS name object details

### PTB (Programmable Transaction Blocks)
- Build PTB - Build a programmable transaction
- Execute PTB - Execute a programmable transaction
- Dry Run PTB - Simulate a PTB

### Utility
- SUI to MIST - Convert SUI to MIST
- MIST to SUI - Convert MIST to SUI
- Get Chain Info - Get chain identifier
- Get Protocol Config - Get protocol configuration
- Get Reference Gas Price - Get current gas price
- Get Total Transactions - Get total transaction count
- Format Balance - Format a balance for display
- Get Common Coins - List common coin types

## Trigger Node

The **Sui Trigger** node enables real-time monitoring of blockchain events and transactions via WebSocket.

### Trigger Types

#### Event Trigger
Monitor events filtered by:
- Package ID
- Module
- Move Event Type
- Sender Address
- All Events

#### Transaction Trigger
Monitor transactions filtered by:
- From Address
- To Address
- Input Object
- Changed Object

## Usage Examples

### Transfer SUI

```json
{
  "nodes": [
    {
      "name": "Sui",
      "type": "n8n-nodes-sui.sui",
      "parameters": {
        "resource": "transaction",
        "operation": "transferSui",
        "recipient": "0x...",
        "amount": 1
      }
    }
  ]
}
```

### Get Account Balance

```json
{
  "nodes": [
    {
      "name": "Sui",
      "type": "n8n-nodes-sui.sui",
      "parameters": {
        "resource": "account",
        "operation": "getBalance",
        "address": "0x..."
      }
    }
  ]
}
```

## Sui Concepts

### MIST and SUI
- 1 SUI = 1,000,000,000 MIST (10^9)
- MIST is the smallest unit of SUI

### Object IDs
- 32-byte hex strings (64 characters + "0x" prefix)
- Represent objects, packages, and other on-chain entities

### Key Schemes
- **Ed25519**: Most common, fast signature verification
- **Secp256k1**: Bitcoin/Ethereum compatible
- **Secp256r1**: WebAuthn compatible

## Networks

| Network | RPC URL | Explorer |
|---------|---------|----------|
| Mainnet | https://fullnode.mainnet.sui.io:443 | https://suiscan.xyz |
| Testnet | https://fullnode.testnet.sui.io:443 | https://testnet.suiscan.xyz |
| Devnet | https://fullnode.devnet.sui.io:443 | https://devnet.suiscan.xyz |

## Error Handling

The node provides detailed error messages for common issues:

- **Invalid Address**: Check address format (0x + 64 hex characters)
- **Insufficient Balance**: Ensure enough SUI for transaction + gas
- **Object Not Found**: Verify object ID exists on the selected network
- **Transaction Failed**: Check effects status for detailed error
- **Private Key Required**: Transaction operations need a private key

## Security Best Practices

1. **Never share private keys** - Use environment variables or n8n credentials
2. **Use testnet for development** - Avoid mainnet until thoroughly tested
3. **Set appropriate gas budgets** - Prevent unexpected costs
4. **Validate addresses** - Use the validateAddress operation before transactions
5. **Dry run transactions** - Test transactions before execution

## Development

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run linting
npm run lint

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Format code
npm run format
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
Use of this node within any SaaS, PaaS, hosted platform, managed service,
or paid automation offering requires a commercial license.

For licensing inquiries:
**licensing@velobpa.com**

See [LICENSE](LICENSE), [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md), and [LICENSING_FAQ.md](LICENSING_FAQ.md) for details.

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Support

- **Documentation**: [GitHub Wiki](https://github.com/Velocity-BPA/n8n-nodes-sui/wiki)
- **Issues**: [GitHub Issues](https://github.com/Velocity-BPA/n8n-nodes-sui/issues)
- **Email**: support@velobpa.com

## Acknowledgments

- [Mysten Labs](https://mystenlabs.com/) - Sui blockchain
- [n8n](https://n8n.io/) - Workflow automation platform
- [@mysten/sui](https://www.npmjs.com/package/@mysten/sui) - Sui TypeScript SDK
