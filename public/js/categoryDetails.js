// ✅ script.js
import { db } from './firebase.js';
import {
  collection,
  query,
  where,
  orderBy,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

// Get selected category from URL
const urlParams = new URLSearchParams(window.location.search);
const selectedWasteType = urlParams.get("wasteType") || "All";
document.getElementById("heading").innerText = selectedWasteType + " Posts";

// Fetch and display posts
async function loadPosts(type) {
  const container = document.getElementById("cardContainer");
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

    snapshot.forEach(doc => {
      const data = doc.data();
      const card = createCard(data);
      container.appendChild(card);
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    container.innerHTML = "<p>Error loading posts.</p>";
  }
}

function timeAgo(date) {
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

function createCard(data) {
  const status = "Available";
  const time = timeAgo(data.timestamp.toDate());

  const card = document.createElement("div");
  card.className = "card";

  card.innerHTML = `
    <div class="status green">🟢 ${status} &nbsp; ⏰ ${time}</div>
    <img src="${data.imageUrl}" alt="Waste Image" />
    <p>📝 ${data.description}</p>
    <p>📍 Lat: ${data.latitude}, Lng: ${data.longitude}</p>
    <p>👤 Posted by: [fetch from wasteGenerators later]</p>
    <button onclick="alert('Details coming soon')">View Details</button>
  `;

  return card;
}

loadPosts(selectedWasteType);
