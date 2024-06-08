// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY,
  authDomain: 'sideprojects-5eb57.firebaseapp.com',
  projectId: 'sideprojects-5eb57',
  storageBucket: 'sideprojects-5eb57.appspot.com',
  messagingSenderId: '836733549953',
  appId: '1:836733549953:web:5fb37b1d6886ec602e7c80',
  measurementId: 'G-99GJLVY6DY'
}
// Initialize Firebase
const app = initializeApp(firebaseConfig)

export {
  app
}
