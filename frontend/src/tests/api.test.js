import axios from 'axios';
import { transactionAPI, categoryAPI } from '../services/api';

jest.mock('axios');

const mockAxios = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  create: jest.fn(() => mockAxios),
  interceptors: { request: { use: jest.fn() }, response: { use: jest.fn() } },
};
axios.create.mockReturnValue(mockAxios);

// Re-import after mocking axios.create
jest.resetModules();

describe('transactionAPI', () => {
  beforeEach(() => jest.clearAllMocks());

  test('getAll builds correct params with type filter', () => {
    mockAxios.get.mockResolvedValue({ data: {} });
    transactionAPI.getAll(0, 10, 'EXPENSE');
    expect(mockAxios.get).toHaveBeenCalledWith(
      '/transactions',
      expect.objectContaining({ params: expect.objectContaining({ type: 'EXPENSE' }) })
    );
  });

  test('getAll omits type param when null', () => {
    mockAxios.get.mockResolvedValue({ data: {} });
    transactionAPI.getAll(0, 10, null);
    const call = mockAxios.get.mock.calls[0];
    expect(call[1].params).not.toHaveProperty('type');
  });

  test('create posts to /transactions', () => {
    const payload = { description: 'Test', amount: 100 };
    mockAxios.post.mockResolvedValue({ data: {} });
    transactionAPI.create(payload);
    expect(mockAxios.post).toHaveBeenCalledWith('/transactions', payload);
  });

  test('delete calls correct endpoint', () => {
    mockAxios.delete.mockResolvedValue({ data: {} });
    transactionAPI.delete(42);
    expect(mockAxios.delete).toHaveBeenCalledWith('/transactions/42');
  });
});

describe('categoryAPI', () => {
  test('getAll without type sends empty params', () => {
    mockAxios.get.mockResolvedValue({ data: {} });
    categoryAPI.getAll();
    expect(mockAxios.get).toHaveBeenCalledWith('/categories', { params: {} });
  });

  test('getAll with type sends type param', () => {
    mockAxios.get.mockResolvedValue({ data: {} });
    categoryAPI.getAll('INCOME');
    expect(mockAxios.get).toHaveBeenCalledWith(
      '/categories', { params: { type: 'INCOME' } }
    );
  });
});
