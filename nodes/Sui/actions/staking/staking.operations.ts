/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { initializeSuiFromContext, signAndExecuteTransaction } from '../../transport/suiClient';
import { buildStakeSui, buildUnstakeSui, mistToSui } from '../../utils';

export const stakingOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['staking'],
      },
    },
    options: [
      { name: 'Get Stakes', value: 'getStakes', description: 'Get all stakes for an address', action: 'Get stakes' },
      { name: 'Get Validators', value: 'getValidators', description: 'Get list of validators', action: 'Get validators' },
      { name: 'Get Validator APY', value: 'getValidatorApy', description: 'Get APY for validators', action: 'Get validator APY' },
      { name: 'Get Current Epoch', value: 'getCurrentEpoch', description: 'Get current epoch information', action: 'Get current epoch' },
      { name: 'Stake SUI', value: 'stakeSui', description: 'Stake SUI with a validator', action: 'Stake SUI' },
      { name: 'Unstake SUI', value: 'unstakeSui', description: 'Withdraw staked SUI', action: 'Unstake SUI' },
    ],
    default: 'getStakes',
  },
];

export const stakingFields: INodeProperties[] = [
  {
    displayName: 'Address',
    name: 'address',
    type: 'string',
    default: '',
    placeholder: '0x...',
    description: 'The address to query stakes for. Leave empty to use credentials address.',
    displayOptions: {
      show: {
        resource: ['staking'],
        operation: ['getStakes'],
      },
    },
  },
  {
    displayName: 'Validator Address',
    name: 'validatorAddress',
    type: 'string',
    required: true,
    default: '',
    placeholder: '0x...',
    description: 'The validator address to stake with',
    displayOptions: {
      show: {
        resource: ['staking'],
        operation: ['stakeSui'],
      },
    },
  },
  {
    displayName: 'Amount (SUI)',
    name: 'amount',
    type: 'number',
    required: true,
    default: 1,
    description: 'Amount of SUI to stake (minimum 1 SUI)',
    displayOptions: {
      show: {
        resource: ['staking'],
        operation: ['stakeSui'],
      },
    },
  },
  {
    displayName: 'Staked SUI Object ID',
    name: 'stakedSuiId',
    type: 'string',
    required: true,
    default: '',
    placeholder: '0x...',
    description: 'The staked SUI object ID to withdraw',
    displayOptions: {
      show: {
        resource: ['staking'],
        operation: ['unstakeSui'],
      },
    },
  },
  {
    displayName: 'Gas Budget (MIST)',
    name: 'gasBudget',
    type: 'number',
    default: 50000000,
    description: 'Gas budget in MIST',
    displayOptions: {
      show: {
        resource: ['staking'],
        operation: ['stakeSui', 'unstakeSui'],
      },
    },
  },
];

export async function executeStakingOperation(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const operation = this.getNodeParameter('operation', index) as string;
  const { client, keypair, address } = await initializeSuiFromContext(this);

  switch (operation) {
    case 'getStakes': {
      const queryAddress = (this.getNodeParameter('address', index) as string) || address;
      if (!queryAddress) throw new Error('Address is required');
      
      const stakes = await client.getStakes({ owner: queryAddress });
      
      return stakes.map((stake) => ({
        json: {
          validatorAddress: stake.validatorAddress,
          stakingPool: stake.stakingPool,
          stakes: stake.stakes.map((s) => ({
            stakedSuiId: s.stakedSuiId,
            stakeRequestEpoch: s.stakeRequestEpoch,
            stakeActiveEpoch: s.stakeActiveEpoch,
            principal: s.principal,
            principalSui: mistToSui(s.principal),
            status: s.status,
            estimatedReward: 'estimatedReward' in s ? s.estimatedReward : null,
            estimatedRewardSui: 'estimatedReward' in s && s.estimatedReward ? mistToSui(s.estimatedReward) : null,
          })),
        },
      }));
    }

    case 'getValidators': {
      const systemState = await client.getLatestSuiSystemState();
      
      return systemState.activeValidators.map((validator) => ({
        json: {
          suiAddress: validator.suiAddress,
          name: validator.name,
          description: validator.description,
          imageUrl: validator.imageUrl,
          projectUrl: validator.projectUrl,
          commissionRate: validator.commissionRate,
          stakingPoolId: validator.stakingPoolId,
          votingPower: validator.votingPower,
          gasPrice: validator.gasPrice,
          nextEpochStake: validator.nextEpochStake,
          nextEpochGasPrice: validator.nextEpochGasPrice,
          nextEpochCommissionRate: validator.nextEpochCommissionRate,
        },
      }));
    }

    case 'getValidatorApy': {
      const apys = await client.getValidatorsApy();
      
      return apys.apys.map((apy) => ({
        json: {
          address: apy.address,
          apy: apy.apy,
          apyPercent: (apy.apy * 100).toFixed(2) + '%',
        },
      }));
    }

    case 'getCurrentEpoch': {
      const systemState = await client.getLatestSuiSystemState();
      
      return [{
        json: {
          epoch: systemState.epoch,
          epochStartTimestampMs: systemState.epochStartTimestampMs,
          epochDurationMs: systemState.epochDurationMs,
          stakeSubsidyStartEpoch: systemState.stakeSubsidyStartEpoch,
          totalStake: systemState.totalStake,
          totalStakeSui: mistToSui(systemState.totalStake),
          storageFundTotalObjectStorageRebates: systemState.storageFundTotalObjectStorageRebates,
          referenceGasPrice: systemState.referenceGasPrice,
          safeMode: systemState.safeMode,
        },
      }];
    }

    case 'stakeSui': {
      if (!keypair || !address) throw new Error('Private key is required for staking');
      
      const validatorAddress = this.getNodeParameter('validatorAddress', index) as string;
      const amount = this.getNodeParameter('amount', index) as number;
      const gasBudget = this.getNodeParameter('gasBudget', index) as number;
      
      if (amount < 1) throw new Error('Minimum stake amount is 1 SUI');
      
      const tx = buildStakeSui(validatorAddress, amount);
      tx.setGasBudget(BigInt(gasBudget));
      
      const result = await signAndExecuteTransaction(client, keypair, tx, {
        showEffects: true,
        showEvents: true,
        showObjectChanges: true,
      });
      
      return [{
        json: {
          digest: result.digest,
          status: result.effects?.status,
          gasUsed: result.effects?.gasUsed,
          from: address,
          validatorAddress,
          amount: amount.toString(),
          objectChanges: result.objectChanges,
        },
      }];
    }

    case 'unstakeSui': {
      if (!keypair || !address) throw new Error('Private key is required for unstaking');
      
      const stakedSuiId = this.getNodeParameter('stakedSuiId', index) as string;
      const gasBudget = this.getNodeParameter('gasBudget', index) as number;
      
      const tx = buildUnstakeSui(stakedSuiId);
      tx.setGasBudget(BigInt(gasBudget));
      
      const result = await signAndExecuteTransaction(client, keypair, tx, {
        showEffects: true,
        showEvents: true,
        showBalanceChanges: true,
      });
      
      return [{
        json: {
          digest: result.digest,
          status: result.effects?.status,
          gasUsed: result.effects?.gasUsed,
          from: address,
          stakedSuiId,
          balanceChanges: result.balanceChanges,
        },
      }];
    }

    default:
      throw new Error(`Unknown operation: ${operation}`);
  }
}
