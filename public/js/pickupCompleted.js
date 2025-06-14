import { db, auth } from './firebase.js';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";

onAuthStateChanged(auth, async (user) => {
  if (user) {
    const pickupQuery = query(collection(db, "wasteUploads"), where("status", "==", "Completed"));
    const snapshot = await getDocs(pickupQuery);
    const container = document.getElementById("completedPickups");

    if (snapshot.empty) {
      container.innerHTML = "<p>No completed pickups found.</p>";
      return;
    }

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      const card = document.createElement("div");
      card.className = "card";

      // Fetch generator details
      let userInfoHTML = "<p>User Info: N/A</p>";
      try {
        const userDoc = await getDoc(doc(db, "wasteGenerators", data.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          userInfoHTML = `
            <p><strong>Email:</strong> ${userData.email || "N/A"}</p>
            <p><strong>Phone:</strong> ${userData.phone || "N/A"}</p>
          `;
        }
      } catch (err) {
        console.error("Error fetching generator info:", err);
      }

      card.innerHTML = `
        <img src="${data.imageUrl}" alt="Waste Image">
        <h3>${data.description || "No Description"}</h3>
        <p><strong>Waste Type:</strong> ${data.wasteType}</p>
        <p class="status-completed">Status: Completed</p>
        ${userInfoHTML}
      `;

      container.appendChild(card);
    }
  }
});
