
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Firebase proje yapılandırması
// https://firebase.google.com/docs/web/setup adresinden kendi Firebase projenizi oluşturabilirsiniz
const firebaseConfig = {
  // Kullanıcının kendi Firebase yapılandırması
  apiKey: "AIzaSyAoWLmu35IMiPUOaKHpT2e4QMFAuTVbHls",
  authDomain: "scatrojbutce.firebaseapp.com",
  projectId: "scatrojbutce",
  storageBucket: "scatrojbutce.appspot.com", // Düzeltme: .appspot.com olmalı
  messagingSenderId: "300805995655",
  appId: "1:300805995655:web:1072d3d94e602aae5ecc22",
  measurementId: "G-H6JXX90TT4"
};

// Yerel depolama anahtarı
const FIREBASE_CONFIG_KEY = "firebaseConfig";

// Yerel depolamadan yapılandırmayı kontrol et
const savedConfig = localStorage.getItem(FIREBASE_CONFIG_KEY);
const configToUse = savedConfig ? JSON.parse(savedConfig) : firebaseConfig;

// Firebase'i başlat
const app = initializeApp(configToUse);

// Firestore referansını al
export const db = getFirestore(app);

// Auth referansını al
export const auth = getAuth(app);

// Analytics referansını al
export const analytics = getAnalytics(app);

// Firebase yapılandırmasını kaydet
export const saveFirebaseConfig = (config: typeof firebaseConfig) => {
  localStorage.setItem(FIREBASE_CONFIG_KEY, JSON.stringify(config));
  // Sayfayı yenile
  window.location.reload();
};

// Şu anki Firebase yapılandırmasını al
export const getCurrentFirebaseConfig = () => {
  return configToUse;
};
