import { db } from './firebase.js';
import {
  collection,
  query,
  where,
  orderBy,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

// Get selected category from URL query params (e.g. wasteType=Plastic)
const urlParams = new URLSearchParams(window.location.search);
const selectedWasteType = urlParams.get("wasteType") || "All";

// Set heading text
const headingElem = document.getElementById("heading");
if (headingElem) headingElem.innerText = `${selectedWasteType} Posts`;

// Helper: format timestamp to time ago string
function timeAgo(date) {
  if (!date) return "Unknown";
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

// Create card element for a post
function createCard(data, id) {
  const status = data.status === "Picked" ? "Picked" : "Available";
  const timestamp = data.timestamp && data.timestamp.toDate ? data.timestamp.toDate() : null;
  const time = timeAgo(timestamp);

  const postedByName = data.postedByName || "[unknown poster]";

  const card = document.createElement("div");
  card.className = "card";

  card.innerHTML = `
    <div class="status ${status === "Picked" ? "red" : "green"}">
      ${status === "Picked" ? "🔴 Picked" : "🟢 Available"} &nbsp; ⏰ ${time}
    </div>
    <img src="${data.imageUrl || ''}" alt="Waste Image" />
    <p>📝 ${data.description || "No description"}</p>
    <p>📍 Lat: ${data.latitude || "N/A"}, Lng: ${data.longitude || "N/A"}</p>
    <p>👤 Posted by: ${postedByName}</p>
    <a href="wasteDetails.html?id=${id}" class="viewBtn">View Details</a>
  `;

  return card;
}

// Load posts by waste type and show cards
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

    snapshot.forEach(doc => {
      const data = doc.data();
      const card = createCard(data, doc.id);
      container.appendChild(card);
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    container.innerHTML = "<p>Error loading posts.</p>";
  }
}

// Run on page load
loadPosts(selectedWasteType);
