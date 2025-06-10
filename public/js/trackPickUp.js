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

let map, marker;

onAuthStateChanged(auth, async (user) => {
  if (user) {
    const uid = user.uid;
    const wasteQuery = query(collection(db, "wasteUploads"), where("uid", "==", uid));
    const snap = await getDocs(wasteQuery);
    const wasteList = document.getElementById("wasteList");

    if (snap.empty) {
      wasteList.innerHTML = "<p>No waste submissions found.</p>";
      return;
    }

    snap.forEach(async (docSnap) => {
      const data = docSnap.data();
      const card = document.createElement("div");
      card.className = "card";

      const status = data.status || "Pending";

      card.innerHTML = `
        <img src="${data.imageUrl}" alt="Waste Image" class="waste-img"/>
        <h3>${data.description || "No Description"}</h3>
        <p><strong>Waste Type:</strong> ${data.wasteType || "Unknown"}</p>
        <p class="status ${status === "Picked" ? "picked" : "pending"}">
          <strong>Status:</strong> ${status}
        </p>
        ${status === "Picked" && data.pickedBy ? `<div class="recycler-info">Loading recycler info...</div>` : ""}
        ${status === "Picked" && data.pickedBy ? `<button class="map-btn" onclick="trackLocation('${data.pickedBy}')">📍 Track Recycler on Map</button>` : ""}
      `;
      wasteList.appendChild(card);

      // Fetch recycler details if picked
      if (status === "Picked" && data.pickedBy) {
        const recyclerDoc = await getDoc(doc(db, "recyclerFirms", data.pickedBy));
        if (recyclerDoc.exists()) {
          const info = recyclerDoc.data();
          const infoBox = card.querySelector(".recycler-info");
          infoBox.innerHTML = `
            <p><strong>Picked By:</strong> ${info.companyName || info.contactPerson || "N/A"}</p>
            <p><strong>Phone:</strong> ${info.phone || "N/A"}</p>
            <p><strong>Email:</strong> ${info.email || "N/A"}</p>
          `;
        }
      }
    });
  }
});

window.trackLocation = async function (recyclerUid) {
  const locRef = doc(db, "recyclerLocations", recyclerUid);
  const locSnap = await getDoc(locRef);

  if (!locSnap.exists()) {
    alert("Location not found.");
    return;
  }

  const { lat, lng } = locSnap.data();

  document.getElementById("mapPopup").classList.remove("hidden");

  if (!map) {
    map = L.map("map").setView([lat, lng], 15);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors"
    }).addTo(map);

    marker = L.marker([lat, lng]).addTo(map).bindPopup("Recycler Location").openPopup();
  } else {
    map.setView([lat, lng]);
    marker.setLatLng([lat, lng]);
  }

  // Live update every 10 seconds
  setInterval(async () => {
    const updateSnap = await getDoc(locRef);
    if (updateSnap.exists()) {
      const { lat, lng } = updateSnap.data();
      marker.setLatLng([lat, lng]);
    }
  }, 10000);
};

window.closeMap = () => {
  document.getElementById("mapPopup").classList.add("hidden");
};
