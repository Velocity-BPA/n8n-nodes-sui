/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { Transaction } from '@mysten/sui/transactions';
import { suiToMist } from './unitConverter';
import { SUI_COIN_TYPE } from '../constants/coins';

/**
 * Build a simple SUI transfer transaction
 * @param recipient Recipient address
 * @param amount Amount in SUI
 * @returns Transaction object
 */
export function buildTransferSui(recipient: string, amount: number | string): Transaction {
  const tx = new Transaction();
  const [coin] = tx.splitCoins(tx.gas, [suiToMist(amount)]);
  tx.transferObjects([coin], recipient);
  return tx;
}

/**
 * Build a multi-recipient SUI transfer transaction
 * @param recipients Array of recipient addresses
 * @param amounts Array of amounts in SUI (same order as recipients)
 * @returns Transaction object
 */
export function buildMultiTransferSui(
  recipients: string[],
  amounts: (number | string)[],
): Transaction {
  const tx = new Transaction();
  const amountsInMist = amounts.map((a) => suiToMist(a));
  const coins = tx.splitCoins(tx.gas, amountsInMist);
  
  recipients.forEach((recipient, index) => {
    tx.transferObjects([coins[index]], recipient);
  });
  
  return tx;
}

/**
 * Build a pay all SUI transaction (drain wallet)
 * @param recipient Recipient address
 * @returns Transaction object
 */
export function buildPayAllSui(recipient: string): Transaction {
  const tx = new Transaction();
  tx.transferObjects([tx.gas], recipient);
  return tx;
}

/**
 * Build an object transfer transaction
 * @param objectId Object ID to transfer
 * @param recipient Recipient address
 * @returns Transaction object
 */
export function buildTransferObject(objectId: string, recipient: string): Transaction {
  const tx = new Transaction();
  tx.transferObjects([tx.object(objectId)], recipient);
  return tx;
}

/**
 * Build a multi-object transfer transaction
 * @param objectIds Array of object IDs to transfer
 * @param recipient Recipient address
 * @returns Transaction object
 */
export function buildMultiTransferObjects(objectIds: string[], recipient: string): Transaction {
  const tx = new Transaction();
  const objects = objectIds.map((id) => tx.object(id));
  tx.transferObjects(objects, recipient);
  return tx;
}

/**
 * Build a coin merge transaction
 * @param destinationCoinId The coin to merge into
 * @param sourceCoinIds The coins to merge from
 * @returns Transaction object
 */
export function buildMergeCoins(
  destinationCoinId: string,
  sourceCoinIds: string[],
): Transaction {
  const tx = new Transaction();
  tx.mergeCoins(
    tx.object(destinationCoinId),
    sourceCoinIds.map((id) => tx.object(id)),
  );
  return tx;
}

/**
 * Build a coin split transaction
 * @param coinId The coin to split
 * @param amounts The amounts to split into (in smallest unit)
 * @returns Transaction object
 */
export function buildSplitCoins(coinId: string, amounts: bigint[]): Transaction {
  const tx = new Transaction();
  tx.splitCoins(tx.object(coinId), amounts);
  return tx;
}

/**
 * Build a Move call transaction
 * @param packageId Package ID
 * @param module Module name
 * @param functionName Function name
 * @param typeArguments Type arguments
 * @param args Function arguments
 * @returns Transaction object
 */
export function buildMoveCall(
  packageId: string,
  module: string,
  functionName: string,
  typeArguments: string[] = [],
  args: unknown[] = [],
): Transaction {
  const tx = new Transaction();
  tx.moveCall({
    target: `${packageId}::${module}::${functionName}`,
    typeArguments,
    arguments: args.map((arg) => {
      if (typeof arg === 'string' && arg.startsWith('0x')) {
        return tx.object(arg);
      }
      return tx.pure(arg as Parameters<Transaction['pure']>[0]);
    }),
  });
  return tx;
}

/**
 * Build a staking transaction
 * @param validatorAddress Validator address to stake with
 * @param amount Amount to stake in SUI
 * @returns Transaction object
 */
export function buildStakeSui(validatorAddress: string, amount: number | string): Transaction {
  const tx = new Transaction();
  const [stakeCoin] = tx.splitCoins(tx.gas, [suiToMist(amount)]);
  tx.moveCall({
    target: '0x3::sui_system::request_add_stake',
    arguments: [
      tx.object('0x5'),
      stakeCoin,
      tx.pure.address(validatorAddress),
    ],
  });
  return tx;
}

/**
 * Build an unstaking transaction
 * @param stakedSuiId The staked SUI object ID
 * @returns Transaction object
 */
export function buildUnstakeSui(stakedSuiId: string): Transaction {
  const tx = new Transaction();
  tx.moveCall({
    target: '0x3::sui_system::request_withdraw_stake',
    arguments: [tx.object('0x5'), tx.object(stakedSuiId)],
  });
  return tx;
}

/**
 * Set transaction gas budget
 * @param tx Transaction object
 * @param budget Gas budget in MIST
 * @returns Modified transaction object
 */
export function setGasBudget(tx: Transaction, budget: bigint | number): Transaction {
  tx.setGasBudget(BigInt(budget));
  return tx;
}

/**
 * Set transaction sender
 * @param tx Transaction object
 * @param sender Sender address
 * @returns Modified transaction object
 */
export function setSender(tx: Transaction, sender: string): Transaction {
  tx.setSender(sender);
  return tx;
}
