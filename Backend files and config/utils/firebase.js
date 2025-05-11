// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBiR4kdQv7KDzaRxXhBwUCs-NoQEY3N5kM",
  authDomain: "try0001-fd82b.firebaseapp.com",
  projectId: "try0001-fd82b",
  storageBucket: "try0001-fd82b.firebasestorage.app",
  messagingSenderId: "853167588011",
  appId: "1:853167588011:web:4545e32eb9d3ea1a5bedee",
  measurementId: "G-H8V591EQ07"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);