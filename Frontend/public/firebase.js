// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCt2OzSF7JR6Euh7lPTgHZaQDpBigT0J6E",
  authDomain: "aaila-pasa-acbcb.firebaseapp.com",
  projectId: "aaila-pasa-acbcb",
  storageBucket: "aaila-pasa-acbcb.firebasestorage.app",
  messagingSenderId: "225067351400",
  appId: "1:225067351400:web:8d80a9ab3d20cbcaadaadd",
  measurementId: "G-Z0RSS4NLET"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Optional (works only on https / localhost)
export const analytics = getAnalytics(app);

// Services
export const db = getFirestore(app);
export const auth = getAuth(app);
