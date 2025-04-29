import { auth, db } from './firebase.js';
import {
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";

import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

const form = document.getElementById("loginForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  try {
    // Firebase sign-in
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Fetch userType from Firestore
    const userDocRef = doc(db, "users", user.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      const userData = userDocSnap.data();
      const userType = userData.userType;

      alert(`✅ Login successful as ${userType}`);

      // Redirect based on userType
      if (userType === "wasteGenerator") {
        // Redirect to waste generator dashboard
        window.location.href = "../HTML/dashboard.html";
      } else if (userType === "recyclerFirm") {
        // Redirect to recycler firm dashboard
        window.location.href = "../HTML/dashboard.html";
      } else {
        alert("⚠️ Unknown user type.");
      }

    } else {
      alert("🚫 User data not found in Firestore.");
    }

  } catch (error) {
    console.error("❌ Login error:", error);

    if (error.code === 'auth/user-not-found') {
      alert("🚫 No user found with this email.");
    } else if (error.code === 'auth/wrong-password') {
      alert("❌ Incorrect password.");
    } else {
      alert("❌ Login failed: " + error.message);
    }
  }
});
