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
describe('Transaction Resource', () => {
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

	it('should get transaction block successfully', async () => {
		mockExecuteFunctions.getNodeParameter
			.mockReturnValueOnce('getTransactionBlock')
			.mockReturnValueOnce('test-digest')
			.mockReturnValueOnce({});

		const mockResponse = JSON.stringify({
			jsonrpc: '2.0',
			id: 1,
			result: { digest: 'test-digest', data: {} },
		});

		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

		const result = await executeTransactionOperations.call(
			mockExecuteFunctions,
			[{ json: {} }],
		);

		expect(result).toHaveLength(1);
		expect(result[0].json).toEqual({ digest: 'test-digest', data: {} });
	});

	it('should query transaction blocks successfully', async () => {
		mockExecuteFunctions.getNodeParameter
			.mockReturnValueOnce('queryTransactionBlocks')
			.mockReturnValueOnce({})
			.mockReturnValueOnce(null)
			.mockReturnValueOnce(50)
			.mockReturnValueOnce(false);

		const mockResponse = JSON.stringify({
			jsonrpc: '2.0',
			id: 1,
			result: { data: [], hasNextPage: false },
		});

		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

		const result = await executeTransactionOperations.call(
			mockExecuteFunctions,
			[{ json: {} }],
		);

		expect(result).toHaveLength(1);
		expect(result[0].json).toEqual({ data: [], hasNextPage: false });
	});

	it('should execute transaction block successfully', async () => {
		mockExecuteFunctions.getNodeParameter
			.mockReturnValueOnce('executeTransactionBlock')
			.mockReturnValueOnce('test-tx-bytes')
			.mockReturnValueOnce(['signature1'])
			.mockReturnValueOnce({});

		const mockResponse = JSON.stringify({
			jsonrpc: '2.0',
			id: 1,
			result: { digest: 'executed-digest', effects: {} },
		});

		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

		const result = await executeTransactionOperations.call(
			mockExecuteFunctions,
			[{ json: {} }],
		);

		expect(result).toHaveLength(1);
		expect(result[0].json).toEqual({ digest: 'executed-digest', effects: {} });
	});

	it('should handle API errors', async () => {
		mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('getTransactionBlock');
		mockExecuteFunctions.continueOnFail.mockReturnValue(true);

		const mockErrorResponse = JSON.stringify({
			jsonrpc: '2.0',
			id: 1,
			error: { code: -32602, message: 'Invalid params' },
		});

		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockErrorResponse);

		const result = await executeTransactionOperations.call(
			mockExecuteFunctions,
			[{ json: {} }],
		);

		expect(result).toHaveLength(1);
		expect(result[0].json.error).toBeDefined();
	});
});

describe('Object Resource', () => {
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

	test('getObject operation should retrieve object details', async () => {
		const mockResponse = {
			result: {
				data: {
					objectId: '0x123',
					version: '1',
					digest: 'abc123',
				},
			},
		};

		mockExecuteFunctions.getNodeParameter
			.mockReturnValueOnce('getObject')
			.mockReturnValueOnce('0x123')
			.mockReturnValueOnce({});

		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

		const result = await executeObjectOperations.call(mockExecuteFunctions, [{ json: {} }]);

		expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
			method: 'POST',
			url: 'https://fullnode.mainnet.sui.io:443',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				jsonrpc: '2.0',
				id: 1,
				method: 'sui_getObject',
				params: ['0x123', {
					showType: false,
					showContent: false,
					showOwner: false,
					showPreviousTransaction: false,
					showStorageRebate: false,
					showDisplay: false,
				}],
			}),
		});

		expect(result).toEqual([{
			json: mockResponse.result,
			pairedItem: { item: 0 },
		}]);
	});

	test('multiGetObjects operation should retrieve multiple objects', async () => {
		const mockResponse = {
			result: [
				{ data: { objectId: '0x123' } },
				{ data: { objectId: '0x456' } },
			],
		};

		mockExecuteFunctions.getNodeParameter
			.mockReturnValueOnce('multiGetObjects')
			.mockReturnValueOnce('0x123, 0x456')
			.mockReturnValueOnce({});

		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

		const result = await executeObjectOperations.call(mockExecuteFunctions, [{ json: {} }]);

		expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
			method: 'POST',
			url: 'https://fullnode.mainnet.sui.io:443',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				jsonrpc: '2.0',
				id: 1,
				method: 'sui_multiGetObjects',
				params: [['0x123', '0x456'], {
					showType: false,
					showContent: false,
					showOwner: false,
					showPreviousTransaction: false,
					showStorageRebate: false,
					showDisplay: false,
				}],
			}),
		});

		expect(result).toEqual([{
			json: mockResponse.result,
			pairedItem: { item: 0 },
		}]);
	});

	test('getOwnedObjects operation should retrieve objects owned by address', async () => {
		const mockResponse = {
			result: {
				data: [{ data: { objectId: '0x123' } }],
				hasNextPage: false,
			},
		};

		mockExecuteFunctions.getNodeParameter
			.mockReturnValueOnce('getOwnedObjects')
			.mockReturnValueOnce('0xowner123')
			.mockReturnValueOnce({})
			.mockReturnValueOnce('')
			.mockReturnValueOnce(50)
			.mockReturnValueOnce({});

		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

		const result = await executeObjectOperations.call(mockExecuteFunctions, [{ json: {} }]);

		expect(result).toEqual([{
			json: mockResponse.result,
			pairedItem: { item: 0 },
		}]);
	});

	test('getDynamicFields operation should retrieve dynamic fields', async () => {
		const mockResponse = {
			result: {
				data: [{ name: 'field1', type: 'string' }],
				hasNextPage: false,
			},
		};

		mockExecuteFunctions.getNodeParameter
			.mockReturnValueOnce('getDynamicFields')
			.mockReturnValueOnce('0xparent123')
			.mockReturnValueOnce('')
			.mockReturnValueOnce(50);

		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

		const result = await executeObjectOperations.call(mockExecuteFunctions, [{ json: {} }]);

		expect(result).toEqual([{
			json: mockResponse.result,
			pairedItem: { item: 0 },
		}]);
	});

	test('getDynamicFieldObject operation should retrieve dynamic field object', async () => {
		const mockResponse = {
			result: {
				data: { objectId: '0x123', content: { fields: {} } },
			},
		};

		mockExecuteFunctions.getNodeParameter
			.mockReturnValueOnce('getDynamicFieldObject')
			.mockReturnValueOnce('0xparent123')
			.mockReturnValueOnce('field1');

		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

		const result = await executeObjectOperations.call(mockExecuteFunctions, [{ json: {} }]);

		expect(result).toEqual([{
			json: mockResponse.result,
			pairedItem: { item: 0 },
		}]);
	});

	test('should handle API errors gracefully when continueOnFail is true', async () => {
		mockExecuteFunctions.getNodeParameter
			.mockReturnValueOnce('getObject')
			.mockReturnValueOnce('0x123')
			.mockReturnValueOnce({});

		mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));
		mockExecuteFunctions.continueOnFail.mockReturnValue(true);

		const result = await executeObjectOperations.call(mockExecuteFunctions, [{ json: {} }]);

		expect(result).toEqual([{
			json: { error: 'API Error' },
			pairedItem: { item: 0 },
		}]);
	});

	test('should throw error when continueOnFail is false', async () => {
		mockExecuteFunctions.getNodeParameter
			.mockReturnValueOnce('getObject')
			.mockReturnValueOnce('0x123')
			.mockReturnValueOnce({});

		mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));
		mockExecuteFunctions.continueOnFail.mockReturnValue(false);

		await expect(executeObjectOperations.call(mockExecuteFunctions, [{ json: {} }])).rejects.toThrow('API Error');
	});
});

describe('Coin Resource', () => {
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
			},
		};
	});

	describe('getCoins operation', () => {
		it('should get coins successfully', async () => {
			const mockResponse = JSON.stringify({
				jsonrpc: '2.0',
				result: {
					data: [{ coinType: '0x2::sui::SUI', balance: '1000000000' }],
					nextCursor: null,
					hasNextPage: false,
				},
			});

			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('getCoins')
				.mockReturnValueOnce('0x123')
				.mockReturnValueOnce('0x2::sui::SUI')
				.mockReturnValueOnce('')
				.mockReturnValueOnce(50);

			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeCoinOperations.call(
				mockExecuteFunctions,
				[{ json: {} }],
			);

			expect(result).toHaveLength(1);
			expect(result[0].json.data).toBeDefined();
		});

		it('should handle getCoins error', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('getCoins')
				.mockReturnValueOnce('invalid-address');

			mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Invalid address'));
			mockExecuteFunctions.continueOnFail.mockReturnValue(true);

			const result = await executeCoinOperations.call(
				mockExecuteFunctions,
				[{ json: {} }],
			);

			expect(result[0].json.error).toBe('Invalid address');
		});
	});

	describe('getAllCoins operation', () => {
		it('should get all coins successfully', async () => {
			const mockResponse = JSON.stringify({
				jsonrpc: '2.0',
				result: {
					data: [
						{ coinType: '0x2::sui::SUI', balance: '1000000000' },
						{ coinType: '0x2::coin::COIN', balance: '500000000' },
					],
				},
			});

			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('getAllCoins')
				.mockReturnValueOnce('0x123')
				.mockReturnValueOnce('')
				.mockReturnValueOnce(50);

			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeCoinOperations.call(
				mockExecuteFunctions,
				[{ json: {} }],
			);

			expect(result).toHaveLength(1);
			expect(result[0].json.data).toHaveLength(2);
		});
	});

	describe('getCoinMetadata operation', () => {
		it('should get coin metadata successfully', async () => {
			const mockResponse = JSON.stringify({
				jsonrpc: '2.0',
				result: {
					decimals: 9,
					name: 'Sui',
					symbol: 'SUI',
					description: 'The native token of Sui',
				},
			});

			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('getCoinMetadata')
				.mockReturnValueOnce('0x2::sui::SUI');

			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeCoinOperations.call(
				mockExecuteFunctions,
				[{ json: {} }],
			);

			expect(result[0].json.name).toBe('Sui');
			expect(result[0].json.symbol).toBe('SUI');
		});
	});

	describe('getTotalSupply operation', () => {
		it('should get total supply successfully', async () => {
			const mockResponse = JSON.stringify({
				jsonrpc: '2.0',
				result: {
					value: '10000000000000000000',
				},
			});

			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('getTotalSupply')
				.mockReturnValueOnce('0x2::sui::SUI');

			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeCoinOperations.call(
				mockExecuteFunctions,
				[{ json: {} }],
			);

			expect(result[0].json.value).toBeDefined();
		});
	});

	describe('getBalance operation', () => {
		it('should get balance successfully', async () => {
			const mockResponse = JSON.stringify({
				jsonrpc: '2.0',
				result: {
					coinType: '0x2::sui::SUI',
					coinObjectCount: 5,
					totalBalance: '1000000000',
				},
			});

			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('getBalance')
				.mockReturnValueOnce('0x123')
				.mockReturnValueOnce('0x2::sui::SUI');

			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeCoinOperations.call(
				mockExecuteFunctions,
				[{ json: {} }],
			);

			expect(result[0].json.totalBalance).toBe('1000000000');
		});
	});

	describe('getAllBalances operation', () => {
		it('should get all balances successfully', async () => {
			const mockResponse = JSON.stringify({
				jsonrpc: '2.0',
				result: [
					{
						coinType: '0x2::sui::SUI',
						coinObjectCount: 5,
						totalBalance: '1000000000',
					},
					{
						coinType: '0x2::coin::COIN',
						coinObjectCount: 2,
						totalBalance: '500000000',
					},
				],
			});

			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('getAllBalances')
				.mockReturnValueOnce('0x123');

			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeCoinOperations.call(
				mockExecuteFunctions,
				[{ json: {} }],
			);

			expect(result[0].json).toHaveLength(2);
		});
	});
});

describe('Validator Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-key',
        baseUrl: 'https://fullnode.mainnet.sui.io:443'
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: {
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn()
      },
    };
  });

  describe('getLatestSuiSystemState operation', () => {
    it('should get latest Sui system state successfully', async () => {
      const mockResponse = {
        jsonrpc: '2.0',
        id: 1,
        result: {
          epoch: '100',
          systemStateVersion: '1'
        }
      };

      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getLatestSuiSystemState');
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeValidatorOperations.call(
        mockExecuteFunctions,
        [{ json: {} }]
      );

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'POST',
        url: 'https://fullnode.mainnet.sui.io:443',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-key'
        },
        json: true,
        body: {
          jsonrpc: '2.0',
          id: 1,
          method: 'suix_getLatestSuiSystemState',
          params: []
        }
      });
    });

    it('should handle error in getLatestSuiSystemState', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getLatestSuiSystemState');
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);

      const result = await executeValidatorOperations.call(
        mockExecuteFunctions,
        [{ json: {} }]
      );

      expect(result).toHaveLength(1);
      expect(result[0].json.error).toBe('API Error');
    });
  });

  describe('getValidatorsApy operation', () => {
    it('should get validators APY successfully', async () => {
      const mockResponse = {
        jsonrpc: '2.0',
        id: 1,
        result: {
          apys: [
            { address: '0x123', apy: 0.05 }
          ]
        }
      };

      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getValidatorsApy');
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeValidatorOperations.call(
        mockExecuteFunctions,
        [{ json: {} }]
      );

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
    });
  });

  describe('getStakes operation', () => {
    it('should get stakes successfully', async () => {
      const mockResponse = {
        jsonrpc: '2.0',
        id: 1,
        result: {
          stakes: [
            { poolId: '0x123', amount: '1000000' }
          ]
        }
      };

      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getStakes')
        .mockReturnValueOnce('0xowner123');
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeValidatorOperations.call(
        mockExecuteFunctions,
        [{ json: {} }]
      );

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.objectContaining({
            method: 'suix_getStakes',
            params: ['0xowner123']
          })
        })
      );
    });
  });

  describe('getStakesByIds operation', () => {
    it('should get stakes by IDs successfully', async () => {
      const mockResponse = {
        jsonrpc: '2.0',
        id: 1,
        result: {
          stakes: [
            { poolId: '0x123', amount: '1000000' }
          ]
        }
      };

      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getStakesByIds')
        .mockReturnValueOnce(['0xstake1', '0xstake2']);
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeValidatorOperations.call(
        mockExecuteFunctions,
        [{ json: {} }]
      );

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.objectContaining({
            method: 'suix_getStakesByIds',
            params: [['0xstake1', '0xstake2']]
          })
        })
      );
    });
  });
});

describe('Network Resource', () => {
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
			},
		};
	});

	describe('getChainIdentifier operation', () => {
		it('should get chain identifier successfully', async () => {
			const mockResponse = {
				jsonrpc: '2.0',
				id: 1,
				result: 'mainnet',
			};

			mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('getChainIdentifier');
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValueOnce(mockResponse);

			const result = await executeNetworkOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
				method: 'POST',
				url: 'https://fullnode.mainnet.sui.io:443',
				headers: { 'Content-Type': 'application/json' },
				json: true,
				body: {
					jsonrpc: '2.0',
					id: 1,
					method: 'sui_getChainIdentifier',
					params: [],
				},
			});
			expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
		});

		it('should handle errors when getting chain identifier', async () => {
			mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('getChainIdentifier');
			mockExecuteFunctions.helpers.httpRequest.mockRejectedValueOnce(new Error('Network error'));
			mockExecuteFunctions.continueOnFail.mockReturnValueOnce(true);

			const result = await executeNetworkOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result).toEqual([{ json: { error: 'Network error' }, pairedItem: { item: 0 } }]);
		});
	});

	describe('getCheckpoint operation', () => {
		it('should get checkpoint successfully', async () => {
			const mockResponse = {
				jsonrpc: '2.0',
				id: 1,
				result: { sequenceNumber: '12345' },
			};

			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('getCheckpoint')
				.mockReturnValueOnce('12345');
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValueOnce(mockResponse);

			const result = await executeNetworkOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
				method: 'POST',
				url: 'https://fullnode.mainnet.sui.io:443',
				headers: { 'Content-Type': 'application/json' },
				json: true,
				body: {
					jsonrpc: '2.0',
					id: 1,
					method: 'sui_getCheckpoint',
					params: ['12345'],
				},
			});
			expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
		});
	});

	describe('getCheckpoints operation', () => {
		it('should get checkpoints successfully', async () => {
			const mockResponse = {
				jsonrpc: '2.0',
				id: 1,
				result: { data: [], hasNextPage: false },
			};

			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('getCheckpoints')
				.mockReturnValueOnce('')
				.mockReturnValueOnce(10)
				.mockReturnValueOnce(false);
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValueOnce(mockResponse);

			const result = await executeNetworkOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
				method: 'POST',
				url: 'https://fullnode.mainnet.sui.io:443',
				headers: { 'Content-Type': 'application/json' },
				json: true,
				body: {
					jsonrpc: '2.0',
					id: 1,
					method: 'sui_getCheckpoints',
					params: [null, 10, false],
				},
			});
			expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
		});
	});
});

describe('Event Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({ 
        baseUrl: 'https://fullnode.mainnet.sui.io:443' 
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: { 
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn() 
      },
    };
  });

  it('should query events successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('queryEvents')
      .mockReturnValueOnce({ EventType: 'MoveEvent' })
      .mockReturnValueOnce('')
      .mockReturnValueOnce(50)
      .mockReturnValueOnce(true);

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(
      JSON.stringify({
        jsonrpc: '2.0',
        result: { data: [], hasNextPage: false },
        id: 1
      })
    );

    const result = await executeEventOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json.result.data).toBeDefined();
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'POST',
      url: 'https://fullnode.mainnet.sui.io:443',
      headers: { 'Content-Type': 'application/json' },
      body: expect.stringContaining('suix_queryEvents'),
      json: false,
    });
  });

  it('should get events by digest successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getEvents')
      .mockReturnValueOnce('test-digest-123');

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(
      JSON.stringify({
        jsonrpc: '2.0',
        result: [{ id: { txDigest: 'test-digest-123' } }],
        id: 1
      })
    );

    const result = await executeEventOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json.result).toBeDefined();
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'POST',
      url: 'https://fullnode.mainnet.sui.io:443',
      headers: { 'Content-Type': 'application/json' },
      body: expect.stringContaining('sui_getEvents'),
      json: false,
    });
  });

  it('should handle API errors gracefully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('queryEvents');
    mockExecuteFunctions.continueOnFail.mockReturnValue(true);
    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));

    const result = await executeEventOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json.error).toBe('API Error');
  });
});

describe('Package Resource', () => {
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
			},
		};
	});

	it('should get package successfully', async () => {
		mockExecuteFunctions.getNodeParameter
			.mockReturnValueOnce('getPackage')
			.mockReturnValueOnce('0x1');

		const mockResponse = JSON.stringify({
			jsonrpc: '2.0',
			id: 1,
			result: { packageId: '0x1', modules: [] },
		});

		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

		const result = await executePackageOperations.call(mockExecuteFunctions, [{ json: {} }]);

		expect(result).toHaveLength(1);
		expect(result[0].json.result.packageId).toBe('0x1');
		expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
			method: 'POST',
			url: 'https://fullnode.mainnet.sui.io:443',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				jsonrpc: '2.0',
				id: 1,
				method: 'sui_getPackage',
				params: ['0x1'],
			}),
			json: false,
		});
	});

	it('should get normalized move modules by package successfully', async () => {
		mockExecuteFunctions.getNodeParameter
			.mockReturnValueOnce('getNormalizedMoveModulesByPackage')
			.mockReturnValueOnce('0x1');

		const mockResponse = JSON.stringify({
			jsonrpc: '2.0',
			id: 1,
			result: { modules: [] },
		});

		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

		const result = await executePackageOperations.call(mockExecuteFunctions, [{ json: {} }]);

		expect(result).toHaveLength(1);
		expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
			method: 'POST',
			url: 'https://fullnode.mainnet.sui.io:443',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				jsonrpc: '2.0',
				id: 1,
				method: 'sui_getNormalizedMoveModulesByPackage',
				params: ['0x1'],
			}),
			json: false,
		});
	});

	it('should get normalized move module successfully', async () => {
		mockExecuteFunctions.getNodeParameter
			.mockReturnValueOnce('getNormalizedMoveModule')
			.mockReturnValueOnce('0x1')
			.mockReturnValueOnce('test_module');

		const mockResponse = JSON.stringify({
			jsonrpc: '2.0',
			id: 1,
			result: { module: 'test_module' },
		});

		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

		const result = await executePackageOperations.call(mockExecuteFunctions, [{ json: {} }]);

		expect(result).toHaveLength(1);
		expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
			method: 'POST',
			url: 'https://fullnode.mainnet.sui.io:443',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				jsonrpc: '2.0',
				id: 1,
				method: 'sui_getNormalizedMoveModule',
				params: ['0x1', 'test_module'],
			}),
			json: false,
		});
	});

	it('should handle errors gracefully when continueOnFail is true', async () => {
		mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('getPackage');
		mockExecuteFunctions.continueOnFail.mockReturnValue(true);
		mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));

		const result = await executePackageOperations.call(mockExecuteFunctions, [{ json: {} }]);

		expect(result).toHaveLength(1);
		expect(result[0].json.error).toBe('API Error');
	});

	it('should throw error when continueOnFail is false', async () => {
		mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('getPackage');
		mockExecuteFunctions.continueOnFail.mockReturnValue(false);
		mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));

		await expect(executePackageOperations.call(mockExecuteFunctions, [{ json: {} }])).rejects.toThrow('API Error');
	});
});
});
