import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDHGXaNaIfD10yjuggbe9q-Xzug_pwJuo8",
  authDomain: "waste-management-app-90fa8.firebaseapp.com",
  projectId: "waste-management-app-90fa8",
  storageBucket: "waste-management-app-90fa8.appspot.com",
  messagingSenderId: "53803571707",
  appId: "1:53803571707:web:361c864857f0e2487e935e"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
