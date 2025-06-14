import { db } from './firebase.js';
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

const urlParams = new URLSearchParams(window.location.search);
const selectedWasteType = urlParams.get("wasteType") || "All";

const headingElem = document.getElementById("heading");
if (headingElem) headingElem.innerText = `${selectedWasteType} Posts`;

function timeAgo(date) {
  if (!date) return "Unknown";
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

async function fetchUserInfo(uid) {
  try {
    const userDocRef = doc(db, "wasteGenerators", uid);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      const userInfo = userDoc.data();
      return {
        email: userInfo.email || "N/A",
        contact: userInfo.phone || "N/A"
      };
    } else {
      console.warn("No user found for UID:", uid);
      return { email: "N/A", contact: "N/A" };
    }
  } catch (error) {
    console.error("Error fetching user info:", error);
    return { email: "N/A", contact: "N/A" };
  }
}

async function createCard(data, id) {
  const status = data.status === "Picked" ? "Picked" : "Available";
  const timestamp = data.timestamp?.toDate ? data.timestamp.toDate() : null;
  const time = timeAgo(timestamp);

  const { email, contact } = await fetchUserInfo(data.uid);

  const card = document.createElement("div");
  card.className = "card";

  card.innerHTML = `
    <div class="status ${status === "Picked" ? "red" : "green"}">
      ${status === "Picked" ? "🔴 Picked" : "🟢 Available"} &nbsp; ⏰ ${time}
    </div>
    <img src="${data.imageUrl || ''}" alt="Waste Image" class="waste-img" />
    <p>📝 ${data.description || "No description"}</p>
    <p>♻️ Waste Type: ${data.wasteType}</p>
    <p>📧 Email: ${email}</p>
    <p>📞 Contact: ${contact}</p>
    <a href="wasteDetails.html?id=${id}" class="viewBtn">View Details</a>
  `;

  return card;
}

async function loadPosts(type) {
  const container = document.getElementById("cardContainer");
  if (!container) return;

  container.innerHTML = "Loading...";

  const wasteRef = collection(db, "wasteUploads");
  let q;

  if (type === "All") {
    q = query(wasteRef, orderBy("timestamp", "desc"));
  } else {
    q = query(wasteRef, where("wasteType", "==", type), orderBy("timestamp", "desc"));
  }

  try {
    const snapshot = await getDocs(q);
    container.innerHTML = "";

    if (snapshot.empty) {
      container.innerHTML = "<p>No posts found for this category.</p>";
      return;
    }

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      const card = await createCard(data, docSnap.id);
      container.appendChild(card);
    }
  } catch (error) {
    console.error("Error fetching posts:", error);
    container.innerHTML = "<p>Error loading posts.</p>";
  }
}

loadPosts(selectedWasteType);
