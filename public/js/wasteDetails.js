import { auth, db } from './firebase.js';
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

function timeAgo(date) {
  if (!date) return "Unknown";
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

function startSharingLiveLocation(recyclerUID) {
  if (!navigator.geolocation) {
    alert("Geolocation not supported");
    return;
  }

  navigator.geolocation.watchPosition(
    async (position) => {
      const { latitude, longitude } = position.coords;
      const locationRef = doc(db, "recyclerLocations", recyclerUID);
      await setDoc(locationRef, {
        lat: latitude,
        lng: longitude,
        timestamp: Date.now()
      });
    },
    (err) => console.error("Error getting location", err),
    { enableHighAccuracy: true }
  );
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

    document.getElementById("wasteImage").src = data.imageUrl || "";
    document.getElementById("description").innerText = data.description || "No description";
    const timestamp = data.timestamp?.toDate?.() || null;
    document.getElementById("timestamp").innerText = timeAgo(timestamp);

    if (data.latitude && data.longitude) {
      document.getElementById("mapBtn").href = `https://www.google.com/maps?q=${data.latitude},${data.longitude}`;
    }

    const statusElem = document.getElementById("status");
    const btn = document.getElementById("pickBtn");

    if (data.status === "Picked") {
      statusElem.innerText = "🔴 Picked";
      statusElem.classList.add("picked");
      btn.disabled = true;
      btn.innerText = "Already Picked";
    } else {
      statusElem.innerText = "🟢 Available";
      statusElem.classList.add("available");
      btn.disabled = false;
      btn.innerText = "✅ Pick This";
    }

    const postedByUid = data.uid;
    const userDoc = await getDoc(doc(db, "users", postedByUid));

    if (userDoc.exists()) {
      const userData = userDoc.data();

      if (userData.userType === "wasteGenerator") {
        const genQuery = query(collection(db, "wasteGenerators"), where("uid", "==", postedByUid));
        const genSnap = await getDocs(genQuery);
        if (!genSnap.empty) {
          const g = genSnap.docs[0].data();
          document.getElementById("email").innerText = g.email || "N/A";
          document.getElementById("phone").innerText = g.phone || "N/A";
          document.getElementById("address").innerText = g.address || "N/A";
        }
      } else if (userData.userType === "recyclerFirm") {
        const firmQuery = query(collection(db, "recyclerFirms"), where("uid", "==", postedByUid));
        const firmSnap = await getDocs(firmQuery);
        if (!firmSnap.empty) {
          const f = firmSnap.docs[0].data();
          document.getElementById("email").innerText = f.email || "N/A";
          document.getElementById("phone").innerText = f.phone || "N/A";
          document.getElementById("address").innerText = f.address || "N/A";
        }
      }
    } 

    btn.onclick = async () => {
      if (confirm("Mark this waste as picked?")) {
        try {
          const currentUser = auth.currentUser;
          if (!currentUser) {
            alert("Login required.");
            return;
          }

          await updateDoc(docRef, {
            status: "Picked",
            pickedBy: currentUser.uid,
            pickupTime: new Date()
          });

          alert("Marked as Picked. Starting location sharing...");
          startSharingLiveLocation(currentUser.uid);
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
