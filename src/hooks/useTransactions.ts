
import { useState, useEffect } from 'react';
import { 
  fetchTransactions, 
  subscribeToTransactions, 
  addTransaction as addTransactionToStorage, 
  updateTransaction as updateTransactionInStorage,
  deleteTransaction as deleteTransactionFromStorage,
  generateDataUrl
} from '@/services/localStorageService';

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
  exportTransactions: () => void;
  importTransactions: (file: File) => Promise<void>;
  loading: boolean;
  error: string | null;
  generateSharingLink: () => Promise<string>;
}

export const useTransactions = (): TransactionsHook => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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

  // Verileri yükle
  useEffect(() => {
    // İlk veri yüklemesi
    setLoading(true);
    fetchTransactions()
      .then(data => {
        setTransactions(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Veri yükleme hatası:", err);
        setError("Veriler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.");
        setLoading(false);
      });

    // localStorage'dan ilk yükleme ve sonrasında değişiklik dinlemesi
    const unsubscribe = subscribeToTransactions((updatedTransactions) => {
      setTransactions(updatedTransactions);
    });

    // Temizlik fonksiyonu
    return () => unsubscribe();
  }, []);

  // Yeni işlem ekle
  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    try {
      const newId = await addTransactionToStorage(transaction);
      // localStorage'dan tekrar verileri almaya gerek yok, useEffect ile güncellenir
      
      // Manuel olarak state'i güncelle (kullanıcı deneyimi için)
      setTransactions(prev => [...prev, { id: newId, ...transaction }]);
    } catch (error) {
      console.error("İşlem eklenirken hata:", error);
      setError("İşlem eklenirken bir hata oluştu.");
    }
  };

  // Mevcut işlemi güncelle
  const updateTransaction = async (transaction: Transaction) => {
    try {
      await updateTransactionInStorage(transaction);
      
      // Manuel olarak state'i güncelle (kullanıcı deneyimi için)
      setTransactions(prev => prev.map(t => t.id === transaction.id ? transaction : t));
    } catch (error) {
      console.error("İşlem güncellenirken hata:", error);
      setError("İşlem güncellenirken bir hata oluştu.");
    }
  };

  // İşlemi sil
  const deleteTransaction = async (id: string) => {
    try {
      await deleteTransactionFromStorage(id);
      
      // Manuel olarak state'i güncelle (kullanıcı deneyimi için)
      setTransactions(prev => prev.filter(t => t.id !== id));
    } catch (error) {
      console.error("İşlem silinirken hata:", error);
      setError("İşlem silinirken bir hata oluştu.");
    }
  };

  // Tarih aralığına göre işlemleri filtrele
  const filteredTransactions = (startDate?: Date, endDate?: Date) => {
    if (!startDate || !endDate) return transactions;

    // Bitiş tarihinin tüm günü içermesini sağla
    const adjustedEndDate = new Date(endDate);
    adjustedEndDate.setHours(23, 59, 59, 999);

    return transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= startDate && transactionDate <= adjustedEndDate;
    });
  };

  // Gelir hesapla
  const getIncome = (transactions: Transaction[]) => {
    return transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  // Gider hesapla
  const getExpense = (transactions: Transaction[]) => {
    return transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  // Bakiye hesapla
  const getBalance = (transactions: Transaction[]) => {
    return getIncome(transactions) - getExpense(transactions);
  };

  // Okunabilir kategori adı al
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

  // Okunabilir frekans adı al
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

  // İşlemleri JSON dosyasına dışa aktar
  const exportTransactions = () => {
    try {
      const dataStr = JSON.stringify(transactions, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const downloadLink = document.createElement('a');
      downloadLink.href = URL.createObjectURL(dataBlob);
      
      // Dosya adına tarih ekle
      const date = new Date();
      const formattedDate = date.toISOString().split('T')[0]; // YYYY-MM-DD formatı
      
      downloadLink.download = `butce-verilerim-${formattedDate}.json`;
      downloadLink.click();
      
      URL.revokeObjectURL(downloadLink.href);
    } catch (error) {
      console.error('Veri dışa aktarılırken hata:', error);
      throw new Error('Veriler dışa aktarılamadı: ' + (error as Error).message);
    }
  };

  // JSON dosyasından işlemleri içe aktar
  const importTransactions = async (file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        const reader = new FileReader();
        
        reader.onload = async (e) => {
          try {
            if (!e.target?.result) {
              throw new Error('Dosya okunamadı');
            }
            
            const importedData = JSON.parse(e.target.result as string) as Transaction[];
            
            // İçe aktarılan veriyi doğrula
            if (!Array.isArray(importedData)) {
              throw new Error('Geçersiz veri formatı, dizi bekleniyor');
            }
            
            // Doğrulanmış veriyi localStorage'a kaydet
            await Promise.all(importedData.map(async (transaction) => {
              if (transaction.id) {
                // Varolan ID'yi koru
                await updateTransactionInStorage(transaction);
              } else {
                // Yeni ID oluştur
                const { id, ...data } = transaction;
                await addTransactionToStorage(data);
              }
            }));
            
            // State'i güncelle
            const updatedTransactions = await fetchTransactions();
            setTransactions(updatedTransactions);
            
            resolve();
          } catch (parseError) {
            console.error('Veri ayrıştırılırken hata:', parseError);
            reject(new Error('Dosya geçerli bir JSON formatında değil'));
          }
        };
        
        reader.onerror = () => {
          reject(new Error('Dosya okuma hatası'));
        };
        
        reader.readAsText(file);
      } catch (error) {
        console.error('Veri içe aktarılırken hata:', error);
        reject(new Error('Veriler içe aktarılamadı: ' + (error as Error).message));
      }
    });
  };

  // Paylaşım linki oluştur
  const generateSharingLink = async (): Promise<string> => {
    return generateDataUrl();
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
    dateFormatter,
    exportTransactions,
    importTransactions,
    loading,
    error,
    generateSharingLink
  };
};
