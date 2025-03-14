
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Firebase proje yapılandırması
// https://firebase.google.com/docs/web/setup adresinden kendi Firebase projenizi oluşturabilirsiniz
const firebaseConfig = {
  // Aşağıdaki değerleri kendi Firebase projenizden alınan değerlerle değiştirin
  apiKey: "AIzaSyDFU2kHZ7A_aHLHHeDDUn4yEcMJIRsXMtM",
  authDomain: "lovable-budget-app.firebaseapp.com",
  projectId: "lovable-budget-app",
  storageBucket: "lovable-budget-app.appspot.com",
  messagingSenderId: "383333388856",
  appId: "1:383333388856:web:44d0e8b7a9a87de1b01f11"
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
