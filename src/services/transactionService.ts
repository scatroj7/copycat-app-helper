
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Transaction } from "@/hooks/useTransactions";

// Firestore koleksiyon referansı
const transactionsRef = collection(db, "transactions");

// Verileri getir
export const fetchTransactions = async (): Promise<Transaction[]> => {
  try {
    const snapshot = await getDocs(transactionsRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
  } catch (error) {
    console.error("Veriler getirilirken hata oluştu:", error);
    throw error;
  }
};

// Canlı veri akışı başlat
export const subscribeToTransactions = (
  onTransactionsUpdate: (transactions: Transaction[]) => void
) => {
  return onSnapshot(transactionsRef, (snapshot) => {
    const transactions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
    onTransactionsUpdate(transactions);
  });
};

// Yeni işlem ekle
export const addTransaction = async (transaction: Omit<Transaction, "id">): Promise<string> => {
  try {
    const docRef = await addDoc(transactionsRef, transaction);
    return docRef.id;
  } catch (error) {
    console.error("İşlem eklenirken hata oluştu:", error);
    throw error;
  }
};

// İşlem güncelle
export const updateTransaction = async (transaction: Transaction): Promise<void> => {
  try {
    const { id, ...data } = transaction;
    await updateDoc(doc(transactionsRef, id), data);
  } catch (error) {
    console.error("İşlem güncellenirken hata oluştu:", error);
    throw error;
  }
};

// İşlem sil
export const deleteTransaction = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(transactionsRef, id));
  } catch (error) {
    console.error("İşlem silinirken hata oluştu:", error);
    throw error;
  }
};
