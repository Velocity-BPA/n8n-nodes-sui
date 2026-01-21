/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { bcs } from '@mysten/sui/bcs';

/**
 * Serialize a string to BCS bytes
 * @param value String to serialize
 * @returns Uint8Array of BCS bytes
 */
export function serializeString(value: string): Uint8Array {
  return bcs.string().serialize(value).toBytes();
}

/**
 * Serialize a u64 to BCS bytes
 * @param value Number to serialize
 * @returns Uint8Array of BCS bytes
 */
export function serializeU64(value: bigint | number): Uint8Array {
  return bcs.u64().serialize(BigInt(value)).toBytes();
}

/**
 * Serialize a u128 to BCS bytes
 * @param value Number to serialize
 * @returns Uint8Array of BCS bytes
 */
export function serializeU128(value: bigint | number): Uint8Array {
  return bcs.u128().serialize(BigInt(value)).toBytes();
}

/**
 * Serialize a boolean to BCS bytes
 * @param value Boolean to serialize
 * @returns Uint8Array of BCS bytes
 */
export function serializeBool(value: boolean): Uint8Array {
  return bcs.bool().serialize(value).toBytes();
}

/**
 * Serialize an address to BCS bytes
 * @param value Address string (with or without 0x prefix)
 * @returns Uint8Array of BCS bytes
 */
export function serializeAddress(value: string): Uint8Array {
  const cleanAddress = value.startsWith('0x') ? value : `0x${value}`;
  return bcs.Address.serialize(cleanAddress).toBytes();
}

/**
 * Serialize a vector of u8 (bytes) to BCS
 * @param bytes Bytes to serialize
 * @returns Uint8Array of BCS bytes
 */
export function serializeBytes(bytes: Uint8Array | number[]): Uint8Array {
  const bytesArray = bytes instanceof Uint8Array ? Array.from(bytes) : bytes;
  return bcs.vector(bcs.u8()).serialize(bytesArray).toBytes();
}

/**
 * Serialize a vector of addresses to BCS
 * @param addresses Array of address strings
 * @returns Uint8Array of BCS bytes
 */
export function serializeAddressVector(addresses: string[]): Uint8Array {
  const cleanAddresses = addresses.map((addr) =>
    addr.startsWith('0x') ? addr : `0x${addr}`,
  );
  return bcs.vector(bcs.Address).serialize(cleanAddresses).toBytes();
}

/**
 * Serialize a vector of u64 to BCS
 * @param values Array of numbers
 * @returns Uint8Array of BCS bytes
 */
export function serializeU64Vector(values: (bigint | number)[]): Uint8Array {
  return bcs.vector(bcs.u64()).serialize(values.map(BigInt)).toBytes();
}

/**
 * Serialize an optional value to BCS
 * @param value Value to serialize or null/undefined
 * @param serializer Serializer function for the value type
 * @returns Uint8Array of BCS bytes
 */
export function serializeOption<T>(
  value: T | null | undefined,
  serializer: (v: T) => Uint8Array,
): Uint8Array {
  if (value === null || value === undefined) {
    return new Uint8Array([0]); // None variant
  }
  const serialized = serializer(value);
  return new Uint8Array([1, ...serialized]); // Some variant
}

/**
 * Convert hex string to Uint8Array
 * @param hex Hex string (with or without 0x prefix)
 * @returns Uint8Array
 */
export function hexToBytes(hex: string): Uint8Array {
  const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex;
  const bytes = new Uint8Array(cleanHex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(cleanHex.substr(i * 2, 2), 16);
  }
  return bytes;
}

/**
 * Convert Uint8Array to hex string
 * @param bytes Uint8Array to convert
 * @param prefix Whether to include 0x prefix
 * @returns Hex string
 */
export function bytesToHex(bytes: Uint8Array, prefix = true): string {
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return prefix ? `0x${hex}` : hex;
}
