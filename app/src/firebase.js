// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyC6JY-qziJJLzPDJHN987o5eBxbb_LjCjI",
    authDomain: "kuusi-f06ab.firebaseapp.com",
    projectId: "kuusi-f06ab",
    storageBucket: "kuusi-f06ab.appspot.com",
    messagingSenderId: "449520677447",
    appId: "1:449520677447:web:aef91f41cd6bd4187ff762",
    measurementId: "G-KMB89RW8QG"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);