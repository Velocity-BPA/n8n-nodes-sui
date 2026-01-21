/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { initializeSuiFromContext, signAndExecuteTransaction } from '../../transport/suiClient';
import { buildTransferObject } from '../../utils';

export const nftOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['nft'],
      },
    },
    options: [
      { name: 'Get NFT Info', value: 'getNftInfo', description: 'Get NFT information by object ID', action: 'Get NFT info' },
      { name: 'Get NFTs by Owner', value: 'getNftsByOwner', description: 'Get all NFTs owned by an address', action: 'Get NFTs by owner' },
      { name: 'Transfer NFT', value: 'transferNft', description: 'Transfer an NFT to another address', action: 'Transfer NFT' },
      { name: 'Get NFT Display', value: 'getNftDisplay', description: 'Get NFT display data', action: 'Get NFT display' },
    ],
    default: 'getNftInfo',
  },
];

export const nftFields: INodeProperties[] = [
  {
    displayName: 'NFT Object ID',
    name: 'nftObjectId',
    type: 'string',
    required: true,
    default: '',
    placeholder: '0x...',
    description: 'The NFT object ID',
    displayOptions: {
      show: {
        resource: ['nft'],
        operation: ['getNftInfo', 'transferNft', 'getNftDisplay'],
      },
    },
  },
  {
    displayName: 'Owner Address',
    name: 'ownerAddress',
    type: 'string',
    default: '',
    placeholder: '0x...',
    description: 'The owner address. Leave empty to use credentials address.',
    displayOptions: {
      show: {
        resource: ['nft'],
        operation: ['getNftsByOwner'],
      },
    },
  },
  {
    displayName: 'Recipient',
    name: 'recipient',
    type: 'string',
    required: true,
    default: '',
    placeholder: '0x...',
    description: 'The recipient address for the NFT transfer',
    displayOptions: {
      show: {
        resource: ['nft'],
        operation: ['transferNft'],
      },
    },
  },
  {
    displayName: 'Limit',
    name: 'limit',
    type: 'number',
    default: 50,
    description: 'Maximum number of NFTs to return',
    displayOptions: {
      show: {
        resource: ['nft'],
        operation: ['getNftsByOwner'],
      },
    },
  },
  {
    displayName: 'Gas Budget (MIST)',
    name: 'gasBudget',
    type: 'number',
    default: 10000000,
    description: 'Gas budget in MIST',
    displayOptions: {
      show: {
        resource: ['nft'],
        operation: ['transferNft'],
      },
    },
  },
];

export async function executeNftOperation(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const operation = this.getNodeParameter('operation', index) as string;
  const { client, keypair, address } = await initializeSuiFromContext(this);

  switch (operation) {
    case 'getNftInfo': {
      const nftObjectId = this.getNodeParameter('nftObjectId', index) as string;
      
      const object = await client.getObject({
        id: nftObjectId,
        options: {
          showType: true,
          showOwner: true,
          showContent: true,
          showDisplay: true,
        },
      });
      
      const data = object.data;
      if (!data) {
        return [{ json: { error: 'NFT not found', nftObjectId } }];
      }
      
      return [{
        json: {
          objectId: data.objectId,
          version: data.version,
          digest: data.digest,
          type: data.type,
          owner: data.owner,
          content: data.content,
          display: data.display?.data || null,
        },
      }];
    }

    case 'getNftsByOwner': {
      const ownerAddress = (this.getNodeParameter('ownerAddress', index) as string) || address;
      if (!ownerAddress) throw new Error('Owner address is required');
      
      const limit = this.getNodeParameter('limit', index) as number;
      
      // Get all objects with display data (likely NFTs)
      const objects = await client.getOwnedObjects({
        owner: ownerAddress,
        options: {
          showType: true,
          showContent: true,
          showDisplay: true,
        },
        limit,
      });
      
      // Filter to only objects with display data (NFTs typically have display)
      const nfts = objects.data.filter(
        (obj) => obj.data?.display?.data && Object.keys(obj.data.display.data).length > 0,
      );
      
      return nfts.map((nft) => ({
        json: {
          objectId: nft.data?.objectId,
          version: nft.data?.version,
          type: nft.data?.type,
          display: nft.data?.display?.data,
          content: nft.data?.content,
        },
      }));
    }

    case 'transferNft': {
      if (!keypair || !address) throw new Error('Private key is required for NFT transfer');
      
      const nftObjectId = this.getNodeParameter('nftObjectId', index) as string;
      const recipient = this.getNodeParameter('recipient', index) as string;
      const gasBudget = this.getNodeParameter('gasBudget', index) as number;
      
      const tx = buildTransferObject(nftObjectId, recipient);
      tx.setGasBudget(BigInt(gasBudget));
      
      const result = await signAndExecuteTransaction(client, keypair, tx, {
        showEffects: true,
        showObjectChanges: true,
      });
      
      return [{
        json: {
          digest: result.digest,
          status: result.effects?.status,
          gasUsed: result.effects?.gasUsed,
          nftObjectId,
          from: address,
          to: recipient,
        },
      }];
    }

    case 'getNftDisplay': {
      const nftObjectId = this.getNodeParameter('nftObjectId', index) as string;
      
      const object = await client.getObject({
        id: nftObjectId,
        options: {
          showDisplay: true,
        },
      });
      
      return [{
        json: {
          objectId: nftObjectId,
          display: object.data?.display?.data || null,
          error: object.data?.display?.error || null,
        },
      }];
    }

    default:
      throw new Error(`Unknown operation: ${operation}`);
  }
}
