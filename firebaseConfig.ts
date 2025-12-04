import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// As credenciais são carregadas de forma segura das variáveis de ambiente
// O Vite expõe variáveis de ambiente prefixadas com VITE_ para o código do cliente
const firebaseConfig = {
  apiKey: (import.meta as any).env.VITE_FIREBASE_API_KEY,
  authDomain: (import.meta as any).env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: (import.meta as any).env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: (import.meta as any).env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: (import.meta as any).env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: (import.meta as any).env.VITE_FIREBASE_APP_ID,
  measurementId: (import.meta as any).env.VITE_FIREBASE_MEASUREMENT_ID
};

// A VALIDAÇÃO FOI MOVIDA PARA O COMPONENTE EnvironmentCheck.tsx
// Isso previne que a aplicação quebre na importação deste arquivo.

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };