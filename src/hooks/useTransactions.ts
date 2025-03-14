
import { useState, useEffect } from 'react';

export type TransactionType = 'income' | 'expense';
export type FrequencyType = 'once' | 'monthly' | 'quarterly' | 'biannual' | 'yearly' | 'custom';
export type CategoryType = 'salary' | 'rent' | 'groceries' | 'bills' | 'transportation' | 'entertainment' | 'health' | 'education' | 'loan' | 'other';

export interface Transaction {
  id: string;
  type: TransactionType;
  description: string;
  amount: number;
  category: CategoryType;
  date: string;
  frequency: FrequencyType;
  notes?: string;
  installmentCount?: number | null;
}

interface TransactionsHook {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateTransaction: (transaction: Transaction) => void;
  deleteTransaction: (id: string) => void;
  filteredTransactions: (startDate?: Date, endDate?: Date) => Transaction[];
  getIncome: (transactions: Transaction[]) => number;
  getExpense: (transactions: Transaction[]) => number;
  getBalance: (transactions: Transaction[]) => number;
  getCategoryName: (category: string) => string;
  getFrequencyName: (frequency: string, transaction: Transaction) => string;
  formatter: Intl.NumberFormat;
  dateFormatter: Intl.DateTimeFormat;
}

export const useTransactions = (): TransactionsHook => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Formatters
  const formatter = new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2
  });

  const dateFormatter = new Intl.DateTimeFormat('tr-TR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const storedTransactions = localStorage.getItem('transactions');
      if (storedTransactions) {
        setTransactions(JSON.parse(storedTransactions));
      }
    } catch (error) {
      console.error('Veriler yüklenirken hata:', error);
    }
  }, []);

  // Save to localStorage when transactions change
  useEffect(() => {
    try {
      localStorage.setItem('transactions', JSON.stringify(transactions));
    } catch (error) {
      console.error('Veriler kaydedilirken hata:', error);
    }
  }, [transactions]);

  // Add a new transaction
  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction = {
      ...transaction,
      id: Date.now().toString()
    };
    setTransactions(prev => [...prev, newTransaction]);
  };

  // Update an existing transaction
  const updateTransaction = (transaction: Transaction) => {
    setTransactions(prev => 
      prev.map(t => t.id === transaction.id ? transaction : t)
    );
  };

  // Delete a transaction
  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  // Filter transactions by date range
  const filteredTransactions = (startDate?: Date, endDate?: Date) => {
    if (!startDate || !endDate) return transactions;

    // Ensure end date includes the entire day
    const adjustedEndDate = new Date(endDate);
    adjustedEndDate.setHours(23, 59, 59, 999);

    return transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= startDate && transactionDate <= adjustedEndDate;
    });
  };

  // Calculate income
  const getIncome = (transactions: Transaction[]) => {
    return transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  // Calculate expenses
  const getExpense = (transactions: Transaction[]) => {
    return transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  // Calculate balance
  const getBalance = (transactions: Transaction[]) => {
    return getIncome(transactions) - getExpense(transactions);
  };

  // Get readable category name
  const getCategoryName = (category: string) => {
    const categories: Record<string, string> = {
      'salary': 'Maaş',
      'rent': 'Kira',
      'groceries': 'Market',
      'bills': 'Faturalar',
      'transportation': 'Ulaşım',
      'entertainment': 'Eğlence',
      'health': 'Sağlık',
      'education': 'Eğitim',
      'loan': 'Kredi',
      'other': 'Diğer'
    };

    return categories[category] || category;
  };

  // Get readable frequency name
  const getFrequencyName = (frequency: string, transaction: Transaction) => {
    const frequencies: Record<string, string> = {
      'once': 'Tek Seferlik',
      'monthly': 'Her Ay',
      'quarterly': '3 Ayda Bir',
      'biannual': '6 Ayda Bir',
      'yearly': 'Yıllık'
    };

    if (frequency === 'custom' && transaction.installmentCount) {
      const transactionDate = new Date(transaction.date);
      const now = new Date();
      const monthsDiff = (now.getFullYear() - transactionDate.getFullYear()) * 12 + (now.getMonth() - transactionDate.getMonth());
      const currentInstallment = Math.min(monthsDiff + 1, transaction.installmentCount);
      return `${currentInstallment}/${transaction.installmentCount} Taksit`;
    }

    return frequencies[frequency] || frequency;
  };

  return {
    transactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    filteredTransactions,
    getIncome,
    getExpense,
    getBalance,
    getCategoryName,
    getFrequencyName,
    formatter,
    dateFormatter
  };
};
