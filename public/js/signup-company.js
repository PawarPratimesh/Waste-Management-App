import { auth, db } from './firebase.js';
import {
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";

import {
  doc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

const form = document.getElementById("signupForm");

form.addEventListener("submit", async function (e) {
  e.preventDefault();

  // Validation checks
  const checkboxes = document.querySelectorAll('input[name="wasteType"]:checked');
  const selectedWasteTypes = Array.from(checkboxes).map(cb => cb.value);

  if (selectedWasteTypes.length === 0) {
    alert("⚠️ Please select at least one type of waste collected.");
    return;
  }

  const firmName = document.getElementById("firmName").value.trim();
  const email = document.getElementById("email").value.trim();
  const contactPerson = document.getElementById("contactPerson").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const address = document.getElementById("address").value.trim();
  const serviceAreas = document.getElementById("serviceAreas").value.trim();
  const operatingHours = document.getElementById("operatingHours").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  if (password !== confirmPassword) {
    alert("❌ Passwords do not match.");
    return;
  }

  try {
    // 1. Create user with Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // 2. Save basic user info in `users` collection
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      userType: "recyclerFirm",
      firmName,
      email
    });

    // 3. Save detailed firm info in `firms` collection
    await setDoc(doc(db, "recyclerFirms", user.uid), {
      uid: user.uid,
      firmName,
      email,
      contactPerson,
      phone,
      address,
      wasteTypes: selectedWasteTypes,
      serviceAreas,
      operatingHours,
      createdAt: serverTimestamp()
    });

    alert("✅ Firm account created successfully!");
    window.location.href = "../HTML/login.html";

  } catch (error) {
    console.error("❌ Error during signup:", error);

    if (error.code === 'auth/email-already-in-use') {
      alert("🚫 Email already in use. Please login or use another.");
    } else if (error.code === 'auth/invalid-email') {
      alert("⚠️ Invalid email format.");
    } else if (error.code === 'auth/weak-password') {
      alert("⚠️ Password should be at least 6 characters.");
    } else {
      alert("❌ Signup failed: " + error.message);
    }
  }
});
