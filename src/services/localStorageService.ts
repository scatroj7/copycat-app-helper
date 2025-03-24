
import { Transaction } from "@/hooks/useTransactions";

// LocalStorage anahtar adı
const TRANSACTIONS_STORAGE_KEY = "budget_transactions";

// Tüm işlemleri getir
export const fetchTransactions = (): Promise<Transaction[]> => {
  return new Promise((resolve) => {
    const storedData = localStorage.getItem(TRANSACTIONS_STORAGE_KEY);
    const transactions = storedData ? JSON.parse(storedData) : [];
    resolve(transactions);
  });
};

// Canlı veri akışı başlat (localStorage için sadece başlangıç verisini döndürür)
export const subscribeToTransactions = (
  onTransactionsUpdate: (transactions: Transaction[]) => void
) => {
  // İlk yükleme için verileri al
  const storedData = localStorage.getItem(TRANSACTIONS_STORAGE_KEY);
  const transactions = storedData ? JSON.parse(storedData) : [];
  onTransactionsUpdate(transactions);

  // Temizlik fonksiyonu
  return () => {
    // localStorage kullanıldığı için abonelik iptali gerekmiyor
  };
};

// Tüm işlemleri kaydet (özel yardımcı fonksiyon)
const saveAllTransactions = (transactions: Transaction[]): void => {
  localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(transactions));
};

// Yeni işlem ekle
export const addTransaction = async (transaction: Omit<Transaction, "id">): Promise<string> => {
  const transactions = await fetchTransactions();
  
  // Benzersiz ID oluştur
  const id = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Yeni işlemi ekle
  const newTransaction = { id, ...transaction };
  transactions.push(newTransaction);
  
  // Tüm işlemleri kaydet
  saveAllTransactions(transactions);
  
  return id;
};

// İşlem güncelle
export const updateTransaction = async (transaction: Transaction): Promise<void> => {
  const transactions = await fetchTransactions();
  
  // İşlemi güncelle
  const index = transactions.findIndex(t => t.id === transaction.id);
  if (index !== -1) {
    transactions[index] = transaction;
    saveAllTransactions(transactions);
  }
};

// İşlem sil
export const deleteTransaction = async (id: string): Promise<void> => {
  const transactions = await fetchTransactions();
  
  // İşlemi sil
  const filteredTransactions = transactions.filter(t => t.id !== id);
  saveAllTransactions(filteredTransactions);
};

// Cihazlar arası veri senkronizasyonu için QR kodu oluşturma
export const generateDataUrl = async (): Promise<string> => {
  const transactions = await fetchTransactions();
  const jsonData = JSON.stringify(transactions);
  return `data:text/json;charset=utf-8,${encodeURIComponent(jsonData)}`;
};
