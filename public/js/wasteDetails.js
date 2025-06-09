import { db } from './firebase.js';
import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

function timeAgo(date) {
  if (!date) return "Unknown";
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

async function loadWasteDetails() {
  const urlParams = new URLSearchParams(window.location.search);
  const docId = urlParams.get("id");
  if (!docId) {
    alert("No waste post ID found in URL");
    return;
  }

  const docRef = doc(db, "wasteUploads", docId);
  try {
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      alert("Waste post not found!");
      return;
    }

    const data = docSnap.data();

    // Fill page with data
    document.getElementById("wasteImage").src = data.imageUrl || "";
    document.getElementById("description").innerText = data.description || "No description";
    const timestamp = data.timestamp && data.timestamp.toDate ? data.timestamp.toDate() : null;
    document.getElementById("timestamp").innerText = timeAgo(timestamp);
    document.getElementById("postedBy").innerText = data.postedByName || "Unknown";
    document.getElementById("email").innerText = data.email || "N/A";
    document.getElementById("phone").innerText = data.phone || "N/A";
    document.getElementById("address").innerText = data.address || "N/A";

    // Update status display
    const statusElem = document.getElementById("status");
    if (data.status === "Picked") {
      statusElem.innerText = "🔴 Picked";
      statusElem.classList.add("red");
      statusElem.classList.remove("green");
      const btn = document.getElementById("pickBtn");
      btn.disabled = true;
      btn.innerText = "Already Picked";
    } else {
      statusElem.innerText = "🟢 Available";
      statusElem.classList.add("green");
      statusElem.classList.remove("red");
      const btn = document.getElementById("pickBtn");
      btn.disabled = false;
      btn.innerText = "✅ Pick This";
    }

    // Set Google Map link
    if (data.latitude && data.longitude) {
      const mapBtn = document.getElementById("mapBtn");
      mapBtn.href = `https://www.google.com/maps?q=${data.latitude},${data.longitude}`;
    }

    // Pick button click handler
    document.getElementById("pickBtn").onclick = async () => {
      if (confirm("Mark this waste as picked?")) {
        try {
          await updateDoc(docRef, { status: "Picked" });
          alert("Marked as Picked!");
          // Reload to update UI
          loadWasteDetails();
        } catch (err) {
          alert("Error updating status: " + err.message);
        }
      }
    };

  } catch (error) {
    console.error("Error loading waste details:", error);
  }
}

loadWasteDetails();
