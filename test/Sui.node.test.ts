/**
 * Copyright (c) 2026 Velocity BPA
 * Licensed under the Business Source License 1.1
 */

import { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { Sui } from '../nodes/Sui/Sui.node';

// Mock n8n-workflow
jest.mock('n8n-workflow', () => ({
  ...jest.requireActual('n8n-workflow'),
  NodeApiError: class NodeApiError extends Error {
    constructor(node: any, error: any) { super(error.message || 'API Error'); }
  },
  NodeOperationError: class NodeOperationError extends Error {
    constructor(node: any, message: string) { super(message); }
  },
}));

describe('Sui Node', () => {
  let node: Sui;

  beforeAll(() => {
    node = new Sui();
  });

  describe('Node Definition', () => {
    it('should have correct basic properties', () => {
      expect(node.description.displayName).toBe('Sui');
      expect(node.description.name).toBe('sui');
      expect(node.description.version).toBe(1);
      expect(node.description.inputs).toContain('main');
      expect(node.description.outputs).toContain('main');
    });

    it('should define 7 resources', () => {
      const resourceProp = node.description.properties.find(
        (p: any) => p.name === 'resource'
      );
      expect(resourceProp).toBeDefined();
      expect(resourceProp!.type).toBe('options');
      expect(resourceProp!.options).toHaveLength(7);
    });

    it('should have operation dropdowns for each resource', () => {
      const operations = node.description.properties.filter(
        (p: any) => p.name === 'operation'
      );
      expect(operations.length).toBe(7);
    });

    it('should require credentials', () => {
      expect(node.description.credentials).toBeDefined();
      expect(node.description.credentials!.length).toBeGreaterThan(0);
      expect(node.description.credentials![0].required).toBe(true);
    });

    it('should have parameters with proper displayOptions', () => {
      const params = node.description.properties.filter(
        (p: any) => p.displayOptions?.show?.resource
      );
      for (const param of params) {
        expect(param.displayOptions.show.resource).toBeDefined();
        expect(Array.isArray(param.displayOptions.show.resource)).toBe(true);
      }
    });
  });

  // Resource-specific tests
describe('Transactions Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-api-key',
        baseUrl: 'https://fullnode.mainnet.sui.io:443',
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: {
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn(),
      },
    };
  });

  test('should get transaction details successfully', async () => {
    const mockResponse = {
      result: {
        digest: 'test-digest',
        transaction: {
          data: {
            messageVersion: 'v1',
            transaction: {
              kind: 'ProgrammableTransaction',
            },
          },
        },
      },
    };

    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      switch (param) {
        case 'operation': return 'getTransaction';
        case 'digest': return 'test-digest';
        case 'options': return {};
        default: return undefined;
      }
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeTransactionsOperations.call(
      mockExecuteFunctions,
      [{ json: {} }]
    );

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse.result);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'POST',
      url: 'https://fullnode.mainnet.sui.io:443',
      headers: {
        'Content-Type': 'application/json',
      },
      body: {
        jsonrpc: '2.0',
        id: 1,
        method: 'sui_getTransaction',
        params: ['test-digest', {}],
      },
      json: true,
    });
  });

  test('should get multiple transactions successfully', async () => {
    const mockResponse = {
      result: [
        { digest: 'digest1' },
        { digest: 'digest2' },
      ],
    };

    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      switch (param) {
        case 'operation': return 'multiGetTransactions';
        case 'digests': return ['digest1', 'digest2'];
        case 'options': return {};
        default: return undefined;
      }
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeTransactionsOperations.call(
      mockExecuteFunctions,
      [{ json: {} }]
    );

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse.result);
  });

  test('should query transaction blocks successfully', async () => {
    const mockResponse = {
      result: {
        data: [{ digest: 'test-digest' }],
        hasNextPage: false,
      },
    };

    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      switch (param) {
        case 'operation': return 'queryTransactionBlocks';
        case 'filter': return { FromAddress: '0x123' };
        case 'cursor': return '';
        case 'limit': return 50;
        case 'descendingOrder': return false;
        default: return undefined;
      }
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeTransactionsOperations.call(
      mockExecuteFunctions,
      [{ json: {} }]
    );

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse.result);
  });

  test('should execute transaction block successfully', async () => {
    const mockResponse = {
      result: {
        digest: 'executed-digest',
        effects: {
          status: { status: 'success' },
        },
      },
    };

    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      switch (param) {
        case 'operation': return 'executeTransactionBlock';
        case 'txBytes': return 'base64-encoded-tx';
        case 'signatures': return ['signature1'];
        case 'options': return { showEffects: true };
        case 'requestType': return 'WaitForLocalExecution';
        default: return undefined;
      }
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeTransactionsOperations.call(
      mockExecuteFunctions,
      [{ json: {} }]
    );

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse.result);
  });

  test('should handle API errors properly', async () => {
    const mockErrorResponse = {
      error: {
        message: 'Transaction not found',
        data: 'Invalid digest',
      },
    };

    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      switch (param) {
        case 'operation': return 'getTransaction';
        case 'digest': return 'invalid-digest';
        case 'options': return {};
        default: return undefined;
      }
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockErrorResponse);

    await expect(executeTransactionsOperations.call(
      mockExecuteFunctions,
      [{ json: {} }]
    )).rejects.toThrow();
  });

  test('should continue on fail when enabled', async () => {
    mockExecuteFunctions.continueOnFail.mockReturnValue(true);
    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      switch (param) {
        case 'operation': return 'getTransaction';
        case 'digest': return 'test-digest';
        case 'options': return {};
        default: return undefined;
      }
    });

    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Network error'));

    const result = await executeTransactionsOperations.call(
      mockExecuteFunctions,
      [{ json: {} }]
    );

    expect(result).toHaveLength(1);
    expect(result[0].json.error).toBe('Network error');
  });
});

describe('Objects Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-api-key',
        baseUrl: 'https://fullnode.mainnet.sui.io:443',
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: {
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn(),
      },
    };
  });

  test('should get object successfully', async () => {
    const mockResponse = {
      jsonrpc: '2.0',
      result: { objectId: '0x123', version: '1' },
      id: 1,
    };

    mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string, index: number) => {
      switch (paramName) {
        case 'operation':
          return 'getObject';
        case 'objectId':
          return '0x123';
        case 'options':
          return '{}';
        default:
          return '';
      }
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeObjectsOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse.result);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'POST',
      url: 'https://fullnode.mainnet.sui.io:443',
      headers: { 'Content-Type': 'application/json' },
      body: {
        jsonrpc: '2.0',
        id: 1,
        method: 'sui_getObject',
        params: ['0x123', {}],
      },
      json: true,
    });
  });

  test('should get multiple objects successfully', async () => {
    const mockResponse = {
      jsonrpc: '2.0',
      result: [{ objectId: '0x123' }, { objectId: '0x456' }],
      id: 1,
    };

    mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string, index: number) => {
      switch (paramName) {
        case 'operation':
          return 'multiGetObjects';
        case 'objectIds':
          return '["0x123", "0x456"]';
        case 'options':
          return '{}';
        default:
          return '';
      }
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeObjectsOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse.result);
  });

  test('should get owned objects successfully', async () => {
    const mockResponse = {
      jsonrpc: '2.0',
      result: { data: [{ objectId: '0x123' }], hasNextPage: false },
      id: 1,
    };

    mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string, index: number) => {
      switch (paramName) {
        case 'operation':
          return 'getOwnedObjects';
        case 'owner':
          return '0xowner123';
        case 'query':
          return '{}';
        case 'cursor':
          return '';
        case 'limit':
          return 50;
        default:
          return '';
      }
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeObjectsOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse.result);
  });

  test('should query objects successfully', async () => {
    const mockResponse = {
      jsonrpc: '2.0',
      result: { data: [{ objectId: '0x123' }], hasNextPage: false },
      id: 1,
    };

    mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string, index: number) => {
      switch (paramName) {
        case 'operation':
          return 'queryObjects';
        case 'query':
          return '{"filter": {"Package": "0x2"}}';
        case 'cursor':
          return '';
        case 'limit':
          return 50;
        case 'descendingOrder':
          return false;
        default:
          return '';
      }
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeObjectsOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse.result);
  });

  test('should get dynamic fields successfully', async () => {
    const mockResponse = {
      jsonrpc: '2.0',
      result: { data: [{ name: 'field1' }], hasNextPage: false },
      id: 1,
    };

    mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string, index: number) => {
      switch (paramName) {
        case 'operation':
          return 'getDynamicFields';
        case 'parentObjectId':
          return '0x123';
        case 'cursor':
          return '';
        case 'limit':
          return 50;
        default:
          return '';
      }
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeObjectsOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse.result);
  });

  test('should get dynamic field object successfully', async () => {
    const mockResponse = {
      jsonrpc: '2.0',
      result: { objectId: '0x456', value: 'test' },
      id: 1,
    };

    mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string, index: number) => {
      switch (paramName) {
        case 'operation':
          return 'getDynamicFieldObject';
        case 'parentObjectId':
          return '0x123';
        case 'name':
          return '{"type": "0x1::string::String", "value": "field1"}';
        default:
          return '';
      }
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeObjectsOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse.result);
  });

  test('should handle API errors', async () => {
    const mockErrorResponse = {
      jsonrpc: '2.0',
      error: { code: -32602, message: 'Invalid params' },
      id: 1,
    };

    mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string, index: number) => {
      switch (paramName) {
        case 'operation':
          return 'getObject';
        case 'objectId':
          return 'invalid-id';
        case 'options':
          return '{}';
        default:
          return '';
      }
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockErrorResponse);

    await expect(
      executeObjectsOperations.call(mockExecuteFunctions, [{ json: {} }])
    ).rejects.toThrow();
  });

  test('should handle invalid JSON in parameters', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string, index: number) => {
      switch (paramName) {
        case 'operation':
          return 'multiGetObjects';
        case 'objectIds':
          return 'invalid-json';
        case 'options':
          return '{}';
        default:
          return '';
      }
    });

    await expect(
      executeObjectsOperations.call(mockExecuteFunctions, [{ json: {} }])
    ).rejects.toThrow('Invalid JSON format in parameters');
  });
});

describe('Addresses Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        baseUrl: 'https://fullnode.mainnet.sui.io:443',
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: {
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn(),
      },
    };
  });

  describe('getBalance operation', () => {
    it('should get coin balance for address successfully', async () => {
      const mockResponse = JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        result: {
          coinType: '0x2::sui::SUI',
          coinObjectCount: 5,
          totalBalance: '1000000000',
          lockedBalance: {}
        }
      });

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        switch (param) {
          case 'operation': return 'getBalance';
          case 'owner': return '0x123456';
          case 'coinType': return '0x2::sui::SUI';
          default: return undefined;
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeAddressesOperations.call(
        mockExecuteFunctions,
        [{ json: {} }]
      );

      expect(result).toHaveLength(1);
      expect(result[0].json.coinType).toBe('0x2::sui::SUI');
      expect(result[0].json.totalBalance).toBe('1000000000');
    });

    it('should handle API errors for getBalance', async () => {
      const mockErrorResponse = JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        error: { code: -32602, message: 'Invalid params' }
      });

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        switch (param) {
          case 'operation': return 'getBalance';
          case 'owner': return 'invalid-address';
          case 'coinType': return '0x2::sui::SUI';
          default: return undefined;
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockErrorResponse);

      await expect(executeAddressesOperations.call(
        mockExecuteFunctions,
        [{ json: {} }]
      )).rejects.toThrow();
    });
  });

  describe('getAllBalances operation', () => {
    it('should get all coin balances for address successfully', async () => {
      const mockResponse = JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        result: [
          {
            coinType: '0x2::sui::SUI',
            coinObjectCount: 5,
            totalBalance: '1000000000',
            lockedBalance: {}
          },
          {
            coinType: '0x123::token::TOKEN',
            coinObjectCount: 2,
            totalBalance: '500000000',
            lockedBalance: {}
          }
        ]
      });

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        switch (param) {
          case 'operation': return 'getAllBalances';
          case 'owner': return '0x123456';
          default: return undefined;
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeAddressesOperations.call(
        mockExecuteFunctions,
        [{ json: {} }]
      );

      expect(result).toHaveLength(1);
      expect(Array.isArray(result[0].json)).toBe(true);
      expect(result[0].json).toHaveLength(2);
    });
  });

  describe('getCoins operation', () => {
    it('should get coin objects owned by address successfully', async () => {
      const mockResponse = JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        result: {
          data: [
            {
              coinType: '0x2::sui::SUI',
              coinObjectId: '0xabc123',
              version: '1',
              digest: 'digest123',
              balance: '100000000'
            }
          ],
          nextCursor: 'cursor123',
          hasNextPage: false
        }
      });

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string, i: number, defaultValue?: any) => {
        switch (param) {
          case 'operation': return 'getCoins';
          case 'owner': return '0x123456';
          case 'coinType': return '0x2::sui::SUI';
          case 'cursor': return defaultValue || '';
          case 'limit': return defaultValue || 50;
          default: return defaultValue;
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeAddressesOperations.call(
        mockExecuteFunctions,
        [{ json: {} }]
      );

      expect(result).toHaveLength(1);
      expect(result[0].json.data).toBeDefined();
      expect(result[0].json.data).toHaveLength(1);
    });
  });

  describe('getTotalSupply operation', () => {
    it('should get total supply of coin type successfully', async () => {
      const mockResponse = JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        result: {
          value: '10000000000000000000'
        }
      });

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        switch (param) {
          case 'operation': return 'getTotalSupply';
          case 'coinType': return '0x2::sui::SUI';
          default: return undefined;
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeAddressesOperations.call(
        mockExecuteFunctions,
        [{ json: {} }]
      );

      expect(result).toHaveLength(1);
      expect(result[0].json.value).toBe('10000000000000000000');
    });
  });
});

describe('Validators Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        baseUrl: 'https://fullnode.mainnet.sui.io:443',
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: {
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn(),
      },
    };
  });

  test('should get latest Sui system state successfully', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string, itemIndex: number) => {
      if (paramName === 'operation') return 'getLatestSuiSystemState';
      return undefined;
    });

    const mockResponse = {
      result: {
        epoch: '123',
        protocolVersion: '1',
        systemStateVersion: '1',
        validators: [],
        totalStake: '1000000000000',
      },
    };

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const items = [{ json: {} }];
    const result = await executeValidatorsOperations.call(mockExecuteFunctions, items);

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse.result);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'POST',
      url: 'https://fullnode.mainnet.sui.io:443',
      headers: { 'Content-Type': 'application/json' },
      json: true,
      body: {
        jsonrpc: '2.0',
        id: 1,
        method: 'suix_getLatestSuiSystemState',
        params: [],
      },
    });
  });

  test('should get validators APY successfully', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string, itemIndex: number) => {
      if (paramName === 'operation') return 'getValidatorsApy';
      return undefined;
    });

    const mockResponse = {
      result: {
        apys: [
          { address: '0x123', apy: 0.05 },
          { address: '0x456', apy: 0.048 },
        ],
        epoch: '123',
      },
    };

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const items = [{ json: {} }];
    const result = await executeValidatorsOperations.call(mockExecuteFunctions, items);

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse.result);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'POST',
      url: 'https://fullnode.mainnet.sui.io:443',
      headers: { 'Content-Type': 'application/json' },
      json: true,
      body: {
        jsonrpc: '2.0',
        id: 1,
        method: 'suix_getValidatorsApy',
        params: [],
      },
    });
  });

  test('should get stakes by owner successfully', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string, itemIndex: number) => {
      if (paramName === 'operation') return 'getStakes';
      if (paramName === 'owner') return '0x1234567890abcdef';
      return undefined;
    });

    const mockResponse = {
      result: [
        {
          stakedSuiId: '0x123',
          stakeRequestEpoch: '100',
          stakeActiveEpoch: '101',
          principal: '1000000000',
          status: 'Active',
        },
      ],
    };

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const items = [{ json: {} }];
    const result = await executeValidatorsOperations.call(mockExecuteFunctions, items);

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse.result);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'POST',
      url: 'https://fullnode.mainnet.sui.io:443',
      headers: { 'Content-Type': 'application/json' },
      json: true,
      body: {
        jsonrpc: '2.0',
        id: 1,
        method: 'suix_getStakes',
        params: ['0x1234567890abcdef'],
      },
    });
  });

  test('should get stakes by IDs successfully', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string, itemIndex: number) => {
      if (paramName === 'operation') return 'getStakesByIds';
      if (paramName === 'staked_sui_ids') return '0x123,0x456,0x789';
      return undefined;
    });

    const mockResponse = {
      result: [
        {
          stakedSuiId: '0x123',
          stakeRequestEpoch: '100',
          principal: '1000000000',
          status: 'Active',
        },
        {
          stakedSuiId: '0x456',
          stakeRequestEpoch: '101',
          principal: '2000000000',
          status: 'Active',
        },
      ],
    };

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const items = [{ json: {} }];
    const result = await executeValidatorsOperations.call(mockExecuteFunctions, items);

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse.result);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'POST',
      url: 'https://fullnode.mainnet.sui.io:443',
      headers: { 'Content-Type': 'application/json' },
      json: true,
      body: {
        jsonrpc: '2.0',
        id: 1,
        method: 'suix_getStakesByIds',
        params: [['0x123', '0x456', '0x789']],
      },
    });
  });

  test('should handle API errors', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string, itemIndex: number) => {
      if (paramName === 'operation') return 'getLatestSuiSystemState';
      return undefined;
    });

    const mockError = {
      error: {
        code: -32602,
        message: 'Invalid params',
      },
    };

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockError);

    const items = [{ json: {} }];

    await expect(executeValidatorsOperations.call(mockExecuteFunctions, items)).rejects.toThrow();
  });

  test('should handle missing owner parameter', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string, itemIndex: number) => {
      if (paramName === 'operation') return 'getStakes';
      if (paramName === 'owner') return '';
      return undefined;
    });

    const items = [{ json: {} }];

    await expect(executeValidatorsOperations.call(mockExecuteFunctions, items)).rejects.toThrow('Owner address is required');
  });

  test('should continue on fail when enabled', async () => {
    mockExecuteFunctions.continueOnFail.mockReturnValue(true);
    mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string, itemIndex: number) => {
      if (paramName === 'operation') return 'getLatestSuiSystemState';
      return undefined;
    });

    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Network error'));

    const items = [{ json: {} }];
    const result = await executeValidatorsOperations.call(mockExecuteFunctions, items);

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual({ error: 'Network error' });
  });
});

describe('Events Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        baseUrl: 'https://fullnode.mainnet.sui.io:443',
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: {
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn(),
      },
    };
  });

  test('should query events successfully', async () => {
    const mockResponse = JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      result: {
        data: [
          {
            id: {
              txDigest: 'test-digest',
              eventSeq: '0',
            },
            packageId: 'test-package',
            transactionModule: 'test-module',
            sender: 'test-sender',
            type: 'test-type',
            parsedJson: {},
            timestampMs: '1234567890',
          },
        ],
        nextCursor: null,
        hasNextPage: false,
      },
    });

    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      switch (param) {
        case 'operation':
          return 'queryEvents';
        case 'query':
          return { All: [] };
        case 'cursor':
          return '';
        case 'limit':
          return 50;
        case 'descendingOrder':
          return false;
        default:
          return undefined;
      }
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeEventsOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json.data).toHaveLength(1);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'POST',
      url: 'https://fullnode.mainnet.sui.io:443',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'sui_queryEvents',
        params: [{ All: [] }, 50, false],
      }),
      json: false,
    });
  });

  test('should subscribe to events successfully', async () => {
    const mockResponse = JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      result: 'subscription-id-123',
    });

    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      switch (param) {
        case 'operation':
          return 'subscribeEvent';
        case 'filter':
          return { EventType: 'MoveEvent' };
        default:
          return undefined;
      }
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeEventsOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json).toBe('subscription-id-123');
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'POST',
      url: 'https://fullnode.mainnet.sui.io:443',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'sui_subscribeEvent',
        params: [{ EventType: 'MoveEvent' }],
      }),
      json: false,
    });
  });

  test('should handle API errors', async () => {
    const mockResponse = JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      error: {
        code: -32602,
        message: 'Invalid params',
      },
    });

    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      switch (param) {
        case 'operation':
          return 'queryEvents';
        case 'query':
          return {};
        default:
          return undefined;
      }
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    await expect(
      executeEventsOperations.call(mockExecuteFunctions, [{ json: {} }])
    ).rejects.toThrow();
  });

  test('should unsubscribe from events successfully', async () => {
    const mockResponse = JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      result: true,
    });

    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      switch (param) {
        case 'operation':
          return 'unsubscribeEvent';
        case 'subscriptionId':
          return 'subscription-id-123';
        default:
          return undefined;
      }
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeEventsOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json).toBe(true);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'POST',
      url: 'https://fullnode.mainnet.sui.io:443',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'sui_unsubscribeEvent',
        params: ['subscription-id-123'],
      }),
      json: false,
    });
  });
});

describe('Packages Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-api-key',
        baseUrl: 'https://fullnode.mainnet.sui.io:443',
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: {
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn(),
      },
    };
  });

  test('should get Move function argument types successfully', async () => {
    const mockResponse = {
      jsonrpc: '2.0',
      result: [
        'Object(&0x2::coin::Coin<T0>)',
        'Address',
        'U64',
      ],
      id: 1,
    };

    mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
      switch (paramName) {
        case 'operation': return 'getMoveFunctionArgTypes';
        case 'package': return '0x2';
        case 'module': return 'coin';
        case 'function': return 'transfer';
        default: return '';
      }
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(JSON.stringify(mockResponse));

    const result = await executePackagesOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse.result);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'POST',
      url: 'https://fullnode.mainnet.sui.io:443',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'sui_getMoveFunctionArgTypes',
        params: ['0x2', 'coin', 'transfer'],
      }),
      json: false,
    });
  });

  test('should get normalized Move function successfully', async () => {
    const mockResponse = {
      jsonrpc: '2.0',
      result: {
        visibility: 'Public',
        isEntry: false,
        typeParameters: [
          {
            constraints: {
              abilities: ['Copy', 'Drop', 'Store'],
            },
          },
        ],
        parameters: ['&mut Coin<T0>', 'u64', 'address'],
        return: [],
      },
      id: 1,
    };

    mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
      switch (paramName) {
        case 'operation': return 'getNormalizedMoveFunction';
        case 'package': return '0x2';
        case 'module': return 'coin';
        case 'function': return 'transfer';
        default: return '';
      }
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(JSON.stringify(mockResponse));

    const result = await executePackagesOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse.result);
  });

  test('should get normalized Move module successfully', async () => {
    const mockResponse = {
      jsonrpc: '2.0',
      result: {
        fileFormatVersion: 6,
        address: '0x2',
        name: 'coin',
        friends: [],
        structs: {
          Coin: {
            abilities: {
              abilities: ['Store', 'Key'],
            },
            typeParameters: [
              {
                constraints: {
                  abilities: [],
                },
                isPhantom: true,
              },
            ],
            fields: {
              id: {
                type: {
                  Struct: {
                    address: '0x2',
                    module: 'object',
                    name: 'UID',
                    typeArguments: [],
                  },
                },
              },
              balance: {
                type: {
                  Struct: {
                    address: '0x2',
                    module: 'balance',
                    name: 'Balance',
                    typeArguments: [
                      {
                        TypeParameter: 0,
                      },
                    ],
                  },
                },
              },
            },
          },
        },
        exposedFunctions: {},
      },
      id: 1,
    };

    mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
      switch (paramName) {
        case 'operation': return 'getNormalizedMoveModule';
        case 'package': return '0x2';
        case 'module': return 'coin';
        default: return '';
      }
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(JSON.stringify(mockResponse));

    const result = await executePackagesOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse.result);
  });

  test('should handle API errors', async () => {
    const mockErrorResponse = {
      jsonrpc: '2.0',
      error: {
        code: -32602,
        message: 'Invalid params',
      },
      id: 1,
    };

    mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
      switch (paramName) {
        case 'operation': return 'getMoveFunctionArgTypes';
        case 'package': return 'invalid-package';
        case 'module': return 'invalid-module';
        case 'function': return 'invalid-function';
        default: return '';
      }
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(JSON.stringify(mockErrorResponse));

    await expect(
      executePackagesOperations.call(mockExecuteFunctions, [{ json: {} }])
    ).rejects.toThrow();
  });

  test('should handle continue on fail', async () => {
    mockExecuteFunctions.continueOnFail.mockReturnValue(true);
    mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
      switch (paramName) {
        case 'operation': return 'getMoveFunctionArgTypes';
        case 'package': return '0x2';
        case 'module': return 'coin';
        case 'function': return 'transfer';
        default: return '';
      }
    });

    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Network error'));

    const result = await executePackagesOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json.error).toBe('Network error');
  });
});

describe('System Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        baseUrl: 'https://fullnode.mainnet.sui.io:443',
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: {
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn(),
      },
    };
  });

  describe('getReferenceGasPrice', () => {
    it('should successfully get reference gas price', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((key: string, index: number) => {
        if (key === 'operation') return 'getReferenceGasPrice';
        return undefined;
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
        jsonrpc: '2.0',
        result: '1000',
        id: 'test-id',
      });

      const result = await executeSystemOperations.call(
        mockExecuteFunctions,
        [{ json: {} }],
      );

      expect(result).toHaveLength(1);
      expect(result[0].json).toHaveProperty('referenceGasPrice', '1000');
      expect(result[0].json).toHaveProperty('priceInMist', '1000');
      expect(result[0].json).toHaveProperty('timestamp');
    });

    it('should handle RPC errors for getReferenceGasPrice', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((key: string, index: number) => {
        if (key === 'operation') return 'getReferenceGasPrice';
        return undefined;
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
        jsonrpc: '2.0',
        error: { code: -32602, message: 'Invalid params' },
        id: 'test-id',
      });

      await expect(
        executeSystemOperations.call(mockExecuteFunctions, [{ json: {} }]),
      ).rejects.toThrow('Sui RPC Error: Invalid params');
    });
  });

  describe('getNetworkMetrics', () => {
    it('should successfully get network metrics', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((key: string, index: number) => {
        if (key === 'operation') return 'getNetworkMetrics';
        return undefined;
      });

      const mockMetrics = {
        currentTps: 100,
        peakTps: 200,
        currentCheckpoint: 1000,
        currentEpoch: 50,
      };

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
        jsonrpc: '2.0',
        result: mockMetrics,
        id: 'test-id',
      });

      const result = await executeSystemOperations.call(
        mockExecuteFunctions,
        [{ json: {} }],
      );

      expect(result).toHaveLength(1);
      expect(result[0].json).toHaveProperty('networkMetrics', mockMetrics);
      expect(result[0].json).toHaveProperty('timestamp');
    });
  });

  describe('getEpochs', () => {
    it('should successfully get epochs with pagination', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((key: string, index: number) => {
        if (key === 'operation') return 'getEpochs';
        if (key === 'cursor') return 'test-cursor';
        if (key === 'limit') return 10;
        if (key === 'descendingOrder') return true;
        return undefined;
      });

      const mockEpochs = {
        data: [
          { epoch: '100', startTimestamp: '1000000', endTimestamp: '2000000' },
          { epoch: '99', startTimestamp: '900000', endTimestamp: '1000000' },
        ],
        hasNextPage: true,
        nextCursor: 'next-cursor',
      };

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
        jsonrpc: '2.0',
        result: mockEpochs,
        id: 'test-id',
      });

      const result = await executeSystemOperations.call(
        mockExecuteFunctions,
        [{ json: {} }],
      );

      expect(result).toHaveLength(1);
      expect(result[0].json).toHaveProperty('epochs', mockEpochs.data);
      expect(result[0].json).toHaveProperty('hasNextPage', true);
      expect(result[0].json).toHaveProperty('nextCursor', 'next-cursor');
      expect(result[0].json).toHaveProperty('totalCount', 2);
    });
  });

  describe('getCurrentEpoch', () => {
    it('should successfully get current epoch', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((key: string, index: number) => {
        if (key === 'operation') return 'getCurrentEpoch';
        return undefined;
      });

      const mockEpoch = {
        epoch: '100',
        startTimestamp: '1000000',
        endTimestamp: null,
      };

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
        jsonrpc: '2.0',
        result: mockEpoch,
        id: 'test-id',
      });

      const result = await executeSystemOperations.call(
        mockExecuteFunctions,
        [{ json: {} }],
      );

      expect(result).toHaveLength(1);
      expect(result[0].json).toHaveProperty('currentEpoch', mockEpoch);
      expect(result[0].json).toHaveProperty('epochInfo', mockEpoch);
      expect(result[0].json).toHaveProperty('timestamp');
    });
  });

  describe('getCheckpoints', () => {
    it('should successfully get checkpoints with pagination', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((key: string, index: number) => {
        if (key === 'operation') return 'getCheckpoints';
        if (key === 'cursor') return '';
        if (key === 'limit') return 50;
        if (key === 'descendingOrder') return false;
        return undefined;
      });

      const mockCheckpoints = {
        data: [
          { sequenceNumber: '1000', digest: 'checkpoint-digest-1' },
          { sequenceNumber: '1001', digest: 'checkpoint-digest-2' },
        ],
        hasNextPage: false,
        nextCursor: null,
      };

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
        jsonrpc: '2.0',
        result: mockCheckpoints,
        id: 'test-id',
      });

      const result = await executeSystemOperations.call(
        mockExecuteFunctions,
        [{ json: {} }],
      );

      expect(result).toHaveLength(1);
      expect(result[0].json).toHaveProperty('checkpoints', mockCheckpoints.data);
      expect(result[0].json).toHaveProperty('hasNextPage', false);
      expect(result[0].json).toHaveProperty('nextCursor', null);
      expect(result[0].json).toHaveProperty('totalCount', 2);
    });
  });

  describe('getLatestCheckpointSequenceNumber', () => {
    it('should successfully get latest checkpoint sequence number', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((key: string, index: number) => {
        if (key === 'operation') return 'getLatestCheckpointSequenceNumber';
        return undefined;
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
        jsonrpc: '2.0',
        result: '123456',
        id: 'test-id',
      });

      const result = await executeSystemOperations.call(
        mockExecuteFunctions,
        [{ json: {} }],
      );

      expect(result).toHaveLength(1);
      expect(result[0].json).toHaveProperty('latestCheckpointSequenceNumber', '123456');
      expect(result[0].json).toHaveProperty('sequenceNumber', '123456');
      expect(result[0].json).toHaveProperty('timestamp');
    });
  });

  describe('error handling', () => {
    it('should handle unknown operations', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((key: string, index: number) => {
        if (key === 'operation') return 'unknownOperation';
        return undefined;
      });

      await expect(
        executeSystemOperations.call(mockExecuteFunctions, [{ json: {} }]),
      ).rejects.toThrow('Unknown operation: unknownOperation');
    });

    it('should continue on fail when configured', async () => {
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);
      mockExecuteFunctions.getNodeParameter.mockImplementation((key: string, index: number) => {
        if (key === 'operation') return 'getReferenceGasPrice';
        return undefined;
      });

      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(
        new Error('Network error'),
      );

      const result = await executeSystemOperations.call(
        mockExecuteFunctions,
        [{ json: {} }],
      );

      expect(result).toHaveLength(1);
      expect(result[0].json).toHaveProperty('error', 'Network error');
    });
  });
});
});
