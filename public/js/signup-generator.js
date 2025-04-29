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

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Get form values
  const firstName = document.getElementById("firstName").value.trim();
  const lastName = document.getElementById("lastName").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const address = document.getElementById("address").value.trim();
  const gender = document.getElementById("gender").value;
  const dob = document.getElementById("dob").value;
  const nation = document.getElementById("nation").value.trim();
  const generatorType = document.getElementById("generatorType").value;
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  // Basic validation
  if (password !== confirmPassword) {
    alert("❌ Passwords do not match.");
    return;
  }

  if (!generatorType) {
    alert("⚠️ Please select a generator type.");
    return;
  }

  try {
    // Create user with Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Save basic info in 'users' collection
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      userType: "wasteGenerator",
      name: `${firstName} ${lastName}`,
      email
    });

    // Save extended info in 'wasteGenerators' collection
    await setDoc(doc(db, "wasteGenerators", user.uid), {
      uid: user.uid,
      firstName,
      lastName,
      email,
      phone,
      address,
      gender,
      dob,
      nation,
      generatorType,
      createdAt: serverTimestamp()
    });

    alert("✅ Signup successful!");
    window.location.href = "../HTML/login.html";

  } catch (error) {
    console.error("❌ Error during signup:", error);

    if (error.code === 'auth/email-already-in-use') {
      alert("🚫 Email already in use. Please log in or use a different email.");
    } else if (error.code === 'auth/invalid-email') {
      alert("⚠️ Invalid email format.");
    } else if (error.code === 'auth/weak-password') {
      alert("⚠️ Password should be at least 6 characters.");
    } else {
      alert("❌ Signup failed: " + error.message);
    }
  }
});
