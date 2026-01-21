/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import WebSocket from 'ws';
import { getNetworkConfig } from '../constants/networks';
import type { SuiCredentials, EventFilter } from '../constants/types';

export interface SubscriptionMessage {
  jsonrpc: '2.0';
  id: number;
  method: string;
  params: unknown[];
}

export interface SubscriptionResponse {
  jsonrpc: '2.0';
  id?: number;
  result?: unknown;
  error?: {
    code: number;
    message: string;
  };
  params?: {
    subscription: string;
    result: unknown;
  };
}

export type EventCallback = (event: unknown) => void;
export type ErrorCallback = (error: Error) => void;

/**
 * Create WebSocket URL from credentials
 */
export function getWsUrl(credentials: SuiCredentials): string {
  if (credentials.network === 'custom' && credentials.customRpcUrl) {
    return credentials.customRpcUrl.replace(/^https?/, 'wss').replace(/^http/, 'ws');
  }
  return getNetworkConfig(credentials.network).wsUrl;
}

/**
 * Sui WebSocket client for subscriptions
 */
export class SuiWebSocketClient {
  private ws: WebSocket | null = null;
  private subscriptionId: string | null = null;
  private messageId = 1;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isClosing = false;
  
  constructor(
    private wsUrl: string,
    private onEvent: EventCallback,
    private onError: ErrorCallback,
  ) {}
  
  /**
   * Connect to the WebSocket server
   */
  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.wsUrl);
        
        this.ws.on('open', () => {
          this.reconnectAttempts = 0;
          resolve();
        });
        
        this.ws.on('message', (data: WebSocket.Data) => {
          this.handleMessage(data);
        });
        
        this.ws.on('error', (error: Error) => {
          if (!this.isClosing) {
            this.onError(error);
          }
          reject(error);
        });
        
        this.ws.on('close', () => {
          if (!this.isClosing) {
            this.handleReconnect();
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }
  
  /**
   * Subscribe to events with a filter
   */
  async subscribeEvent(filter: EventFilter): Promise<string> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket not connected');
    }
    
    const message: SubscriptionMessage = {
      jsonrpc: '2.0',
      id: this.messageId++,
      method: 'suix_subscribeEvent',
      params: [filter],
    };
    
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Subscription timeout'));
      }, 10000);
      
      const handleResponse = (data: WebSocket.Data) => {
        try {
          const response: SubscriptionResponse = JSON.parse(data.toString());
          if (response.id === message.id - 1) {
            clearTimeout(timeout);
            this.ws?.off('message', handleResponse);
            if (response.error) {
              reject(new Error(response.error.message));
            } else {
              this.subscriptionId = response.result as string;
              resolve(this.subscriptionId);
            }
          }
        } catch {
          // Not our message, ignore
        }
      };
      
      this.ws?.on('message', handleResponse);
      this.ws?.send(JSON.stringify(message));
    });
  }
  
  /**
   * Subscribe to transactions for an address
   */
  async subscribeTransaction(address: string): Promise<string> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket not connected');
    }
    
    const message: SubscriptionMessage = {
      jsonrpc: '2.0',
      id: this.messageId++,
      method: 'suix_subscribeTransaction',
      params: [
        {
          filter: {
            FromAddress: address,
          },
        },
      ],
    };
    
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Subscription timeout'));
      }, 10000);
      
      const handleResponse = (data: WebSocket.Data) => {
        try {
          const response: SubscriptionResponse = JSON.parse(data.toString());
          if (response.id === message.id - 1) {
            clearTimeout(timeout);
            this.ws?.off('message', handleResponse);
            if (response.error) {
              reject(new Error(response.error.message));
            } else {
              this.subscriptionId = response.result as string;
              resolve(this.subscriptionId);
            }
          }
        } catch {
          // Not our message, ignore
        }
      };
      
      this.ws?.on('message', handleResponse);
      this.ws?.send(JSON.stringify(message));
    });
  }
  
  /**
   * Unsubscribe from current subscription
   */
  async unsubscribe(): Promise<boolean> {
    if (!this.ws || !this.subscriptionId) {
      return false;
    }
    
    const message: SubscriptionMessage = {
      jsonrpc: '2.0',
      id: this.messageId++,
      method: 'suix_unsubscribeEvent',
      params: [this.subscriptionId],
    };
    
    return new Promise((resolve) => {
      this.ws?.send(JSON.stringify(message));
      this.subscriptionId = null;
      resolve(true);
    });
  }
  
  /**
   * Close the WebSocket connection
   */
  close(): void {
    this.isClosing = true;
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
  
  /**
   * Handle incoming messages
   */
  private handleMessage(data: WebSocket.Data): void {
    try {
      const response: SubscriptionResponse = JSON.parse(data.toString());
      
      // Handle subscription notifications
      if (response.params?.subscription === this.subscriptionId) {
        this.onEvent(response.params.result);
      }
    } catch (error) {
      this.onError(error instanceof Error ? error : new Error(String(error)));
    }
  }
  
  /**
   * Handle reconnection logic
   */
  private async handleReconnect(): Promise<void> {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.onError(new Error('Max reconnection attempts reached'));
      return;
    }
    
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    await new Promise((resolve) => setTimeout(resolve, delay));
    
    try {
      await this.connect();
    } catch {
      // Will trigger another reconnect attempt
    }
  }
}

/**
 * Create a WebSocket client from credentials
 */
export function createWebSocketClient(
  credentials: SuiCredentials,
  onEvent: EventCallback,
  onError: ErrorCallback,
): SuiWebSocketClient {
  const wsUrl = getWsUrl(credentials);
  return new SuiWebSocketClient(wsUrl, onEvent, onError);
}
