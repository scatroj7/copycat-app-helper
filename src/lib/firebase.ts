
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Firebase projenizin yapılandırması - bu değerleri kendi Firebase projenizden almalısınız
const firebaseConfig = {
  apiKey: "AIzaSyDFU2kHZ7A_aHLHHeDDUn4yEcMJIRsXMtM",
  authDomain: "lovable-budget-app.firebaseapp.com",
  projectId: "lovable-budget-app",
  storageBucket: "lovable-budget-app.appspot.com",
  messagingSenderId: "383333388856",
  appId: "1:383333388856:web:44d0e8b7a9a87de1b01f11"
};

// Firebase'i başlat
const app = initializeApp(firebaseConfig);

// Firestore referansını al
export const db = getFirestore(app);

// Auth referansını al
export const auth = getAuth(app);
