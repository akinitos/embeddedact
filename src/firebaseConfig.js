// src/firebaseConfig.js
// src/firebaseConfig.js
import firebase from 'firebase/app';
import 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDo0_EjWbtBkGYYcYhP0TRkfbGHOBScioY",
  authDomain: "pikosen-92002.firebaseapp.com",
  projectId: "pikosen-92002",
  storageBucket: "pikosen-92002.firebasestorage.app",
  messagingSenderId: "9964687323",
  appId: "1:9964687323:web:b5a5b6b8618118869be1fe",
  measurementId: "G-VTEXWHQLF7"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Export the Firestore instance
const db = firebase.firestore();
export { db };


