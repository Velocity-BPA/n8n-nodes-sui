/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { ObjectData } from '../constants/types';

/**
 * Normalize object ID to full 64-character hex format with 0x prefix
 * @param objectId Object ID to normalize
 * @returns Normalized object ID
 */
export function normalizeObjectId(objectId: string): string {
  // Remove 0x prefix if present
  const cleanId = objectId.startsWith('0x') ? objectId.slice(2) : objectId;
  // Pad to 64 characters
  const paddedId = cleanId.padStart(64, '0');
  return `0x${paddedId}`;
}

/**
 * Check if a string is a valid Sui object ID
 * @param objectId Object ID to validate
 * @returns True if valid
 */
export function isValidObjectId(objectId: string): boolean {
  if (!objectId) return false;
  const cleanId = objectId.startsWith('0x') ? objectId.slice(2) : objectId;
  return /^[a-fA-F0-9]{1,64}$/.test(cleanId);
}

/**
 * Check if a string is a valid Sui address
 * @param address Address to validate
 * @returns True if valid
 */
export function isValidSuiAddress(address: string): boolean {
  if (!address) return false;
  const cleanAddress = address.startsWith('0x') ? address.slice(2) : address;
  return /^[a-fA-F0-9]{64}$/.test(cleanAddress);
}

/**
 * Extract type from object data
 * @param object Object data
 * @returns Object type string
 */
export function getObjectType(object: ObjectData): string | undefined {
  return object.type || object.content?.type;
}

/**
 * Check if object is owned by an address
 * @param object Object data
 * @param address Address to check
 * @returns True if owned by the address
 */
export function isOwnedBy(object: ObjectData, address: string): boolean {
  if (!object.owner) return false;
  const normalizedAddress = normalizeObjectId(address);
  if (object.owner.AddressOwner) {
    return normalizeObjectId(object.owner.AddressOwner) === normalizedAddress;
  }
  return false;
}

/**
 * Check if object is shared
 * @param object Object data
 * @returns True if shared
 */
export function isSharedObject(object: ObjectData): boolean {
  return object.owner?.Shared !== undefined;
}

/**
 * Check if object is immutable
 * @param object Object data
 * @returns True if immutable
 */
export function isImmutableObject(object: ObjectData): boolean {
  return object.owner?.Immutable === true;
}

/**
 * Get object display data
 * @param object Object data
 * @returns Display data or null
 */
export function getObjectDisplay(object: ObjectData): Record<string, string> | null {
  return object.display?.data || null;
}

/**
 * Parse object fields
 * @param object Object data
 * @returns Object fields or empty object
 */
export function getObjectFields(object: ObjectData): Record<string, unknown> {
  return object.content?.fields || {};
}

/**
 * Extract coin type from a coin object type string
 * @param coinObjectType Full coin object type (e.g., "0x2::coin::Coin<0x2::sui::SUI>")
 * @returns The inner coin type (e.g., "0x2::sui::SUI")
 */
export function extractCoinType(coinObjectType: string): string | null {
  const match = coinObjectType.match(/0x2::coin::Coin<(.+)>/);
  return match ? match[1] : null;
}

/**
 * Build a Coin type string from a coin type
 * @param coinType The inner coin type
 * @returns Full coin object type string
 */
export function buildCoinObjectType(coinType: string): string {
  return `0x2::coin::Coin<${coinType}>`;
}
