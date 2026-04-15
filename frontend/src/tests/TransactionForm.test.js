import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TransactionForm from '../components/TransactionForm';
import { transactionAPI, categoryAPI } from '../services/api';

// Mock API modules
jest.mock('../services/api');
jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error:   jest.fn(),
}));

const mockCategories = [
  { id: 1, name: 'Food',      color: '#FF6384', type: 'EXPENSE' },
  { id: 2, name: 'Transport', color: '#36A2EB', type: 'EXPENSE' },
];

beforeEach(() => {
  categoryAPI.getAll.mockResolvedValue({ data: { data: mockCategories } });
  transactionAPI.create.mockResolvedValue({ data: { data: { id: 1 } } });
  transactionAPI.update.mockResolvedValue({ data: { data: { id: 1 } } });
});

afterEach(() => jest.clearAllMocks());

describe('TransactionForm', () => {
  test('renders form fields correctly', async () => {
    render(<TransactionForm onSaved={jest.fn()} onCancel={jest.fn()} />);
    expect(screen.getByPlaceholderText(/grocery shopping/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/0.00/)).toBeInTheDocument();
    expect(screen.getByText(/Add Transaction/i)).toBeInTheDocument();
  });

  test('shows validation errors when submitting empty form', async () => {
    render(<TransactionForm onSaved={jest.fn()} onCancel={jest.fn()} />);
    fireEvent.click(screen.getByText(/Add Transaction/i));
    expect(await screen.findByText('Required')).toBeInTheDocument();
  });

  test('calls create API with correct data on valid submit', async () => {
    const onSaved = jest.fn();
    render(<TransactionForm onSaved={onSaved} onCancel={jest.fn()} />);

    await userEvent.type(screen.getByPlaceholderText(/grocery shopping/i), 'Lunch');
    await userEvent.clear(screen.getByPlaceholderText(/0.00/));
    await userEvent.type(screen.getByPlaceholderText(/0.00/), '250');

    fireEvent.click(screen.getByText(/Add Transaction/i));

    await waitFor(() => {
      expect(transactionAPI.create).toHaveBeenCalledWith(
        expect.objectContaining({ description: 'Lunch', amount: 250 })
      );
      expect(onSaved).toHaveBeenCalled();
    });
  });

  test('renders in edit mode with pre-filled values', async () => {
    const tx = {
      id: 5, description: 'Dinner', amount: '450.00',
      transactionDate: '2024-06-15', type: 'EXPENSE',
      category: { id: 1, name: 'Food' }, notes: 'Family dinner',
    };
    render(<TransactionForm initialData={tx} onSaved={jest.fn()} onCancel={jest.fn()} />);

    expect(screen.getByText(/Edit Transaction/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue('Dinner')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Family dinner')).toBeInTheDocument();
  });

  test('calls update API in edit mode', async () => {
    const tx = {
      id: 5, description: 'Dinner', amount: '450.00',
      transactionDate: '2024-06-15', type: 'EXPENSE',
      category: null, notes: '',
    };
    const onSaved = jest.fn();
    render(<TransactionForm initialData={tx} onSaved={onSaved} onCancel={jest.fn()} />);

    fireEvent.click(screen.getByText(/Update/i));

    await waitFor(() => {
      expect(transactionAPI.update).toHaveBeenCalledWith(5, expect.any(Object));
    });
  });

  test('cancel button calls onCancel', () => {
    const onCancel = jest.fn();
    render(<TransactionForm onSaved={jest.fn()} onCancel={onCancel} />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(onCancel).toHaveBeenCalled();
  });
});
