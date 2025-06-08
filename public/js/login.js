import { auth, db } from './firebase.js';
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

// LOGIN
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const userDocRef = doc(db, "users", user.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      const userData = userDocSnap.data();
      const userType = userData.userType;

      // 🔁 Redirect based on user type
      if (userType === "wasteGenerator") {
        window.location.href = "../HTML/wasteGeneratorDashboard.html";
      } else if (userType === "recyclerFirm") {
        window.location.href = "../HTML/recyclerDashboard.html";
      } else {
        alert("⚠ Unknown user type.");
      }

    } else {
      alert("🚫 User data not found.");
    }

  } catch (error) {
    console.error("Login error:", error);
    if (error.code === 'auth/user-not-found') {
      alert("No user found with this email.");
    } else if (error.code === 'auth/wrong-password') {
      alert("Incorrect password.");
    } else {
      alert("Login failed: " + error.message);
    }
  }
});

// FORGOT PASSWORD
document.addEventListener("DOMContentLoaded", () => {
  const forgotBtn = document.getElementById("forgotPasswordBtn");
  if (forgotBtn) {
    forgotBtn.addEventListener("click", async () => {
      const email = document.getElementById("loginEmail").value.trim();
      if (!email) {
        alert("Enter your email to reset password.");
        return;
      }

      try {
        await sendPasswordResetEmail(auth, email);
        alert("Password reset email sent.");
      } catch (error) {
        alert("Error: " + error.message);
      }
    });
  }
});
