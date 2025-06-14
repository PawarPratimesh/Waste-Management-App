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

const container = document.getElementById("pickupContainer");

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    container.innerHTML = "<p>Please login to view accepted pickups.</p>";
    return;
  }

  const q = query(
    collection(db, "wasteUploads"),
    where("pickedBy", "==", user.uid),
    where("status", "==", "Picked")
  );

  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    container.innerHTML = "<p>No accepted pickups found.</p>";
    return;
  }

  for (const docSnap of querySnapshot.docs) {
    const data = docSnap.data();

    // Get the user profile info of the person who posted the waste
    let userInfo = {};
    try {
      const userDoc = await getDoc(doc(db, "wasteGenerators", data.uid));
      if (userDoc.exists()) {
        userInfo = userDoc.data();
      }
    } catch (err) {
      console.error("Error fetching user profile:", err);
    }

    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="${data.imageUrl || ''}" alt="Waste Image" class="waste-img" />
      <h3>${data.description || "No Description"}</h3>
      <p><strong>Waste Type:</strong> ${data.wasteType || "N/A"}</p>
      <p><strong>Status:</strong> ${data.status || "N/A"}</p>
      <hr />
      <p><strong>Email:</strong> ${userInfo.email || "N/A"}</p>
      <p><strong>Phone:</strong> ${userInfo.phone || "N/A"}</p>
      <p><strong>Address:</strong> ${userInfo.address || "N/A"}</p>
    `;

    container.appendChild(card);
  }
});
