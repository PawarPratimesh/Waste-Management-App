// import { db } from './firebase.js';
// import {
//   doc,
//   getDoc,
//   updateDoc,
//   collection,
//   query,
//   where,
//   getDocs
// } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

// // Helper: format timestamp
// function timeAgo(date) {
//   if (!date) return "Unknown";
//   const now = new Date();
//   const seconds = Math.floor((now - date) / 1000);
//   if (seconds < 60) return ${seconds}s ago;
//   if (seconds < 3600) return ${Math.floor(seconds / 60)}m ago;
//   if (seconds < 86400) return ${Math.floor(seconds / 3600)}h ago;
//   return ${Math.floor(seconds / 86400)}d ago;
// }

// async function loadWasteDetails() {
//   const urlParams = new URLSearchParams(window.location.search);
//   const docId = urlParams.get("id");
//   if (!docId) {
//     alert("No waste post ID found in URL");
//     return;
//   }

//   const docRef = doc(db, "wasteUploads", docId);
//   try {
//     const docSnap = await getDoc(docRef);
//     if (!docSnap.exists()) {
//       alert("Waste post not found!");
//       return;
//     }

//     const data = docSnap.data();

//     // Fill page with post data
//     document.getElementById("wasteImage").src = data.imageUrl || "";
//     document.getElementById("description").innerText = data.description || "No description";
//     const timestamp = data.timestamp?.toDate?.() || null;
//     document.getElementById("timestamp").innerText = timeAgo(timestamp);

//     // Set Google Maps link
//     if (data.latitude && data.longitude) {
//       document.getElementById("mapBtn").href = https://www.google.com/maps?q=${data.latitude},${data.longitude};
//     }

//     // Set status
//     const statusElem = document.getElementById("status");
//     const btn = document.getElementById("pickBtn");
//     if (data.status === "Picked") {
//       statusElem.innerText = "🔴 Picked";
//       statusElem.classList.add("picked");
//       btn.disabled = true;
//       btn.innerText = "Already Picked";
//     } else {
//       statusElem.innerText = "🟢 Available";
//       statusElem.classList.add("available");
//       btn.disabled = false;
//       btn.innerText = "✅ Pick This";
//     }

//     // 🧠 FETCH POSTED BY USER INFO
//     const postedByUid = data.uid;
//     let userData = null;

//     const usersRef = collection(db, "users");
//     const userQuery = query(usersRef, where("uid", "==", postedByUid));
//     const userSnap = await getDocs(userQuery);

//     if (!userSnap.empty) {
//       userData = userSnap.docs[0].data();
//     }

//     if (userData?.userType === "wasteGenerator") {
//       const genRef = collection(db, "wasteGenerators");
//       const genQuery = query(genRef, where("uid", "==", postedByUid));
//       const genSnap = await getDocs(genQuery);
//       if (!genSnap.empty) {
//         const g = genSnap.docs[0].data();
//         document.getElementById("postedBy").innerText = g.name || "Unknown";
//         document.getElementById("email").innerText = g.email || "N/A";
//         document.getElementById("phone").innerText = g.phone || "N/A";
//         document.getElementById("address").innerText = g.address || "N/A";
//       }
//     } else if (userData?.userType === "recyclerFirm") {
//       const firmRef = collection(db, "recyclerFirms");
//       const firmQuery = query(firmRef, where("uid", "==", postedByUid));
//       const firmSnap = await getDocs(firmQuery);
//       if (!firmSnap.empty) {
//         const f = firmSnap.docs[0].data();
//         document.getElementById("postedBy").innerText = f.contactPerson || "Unknown";
//         document.getElementById("email").innerText = f.email || "N/A";
//         document.getElementById("phone").innerText = f.phone || "N/A";
//         document.getElementById("address").innerText = f.address || "N/A";
//       }
//     }

//     // Handle Pick button
//     btn.onclick = async () => {
//       if (confirm("Mark this waste as picked?")) {
//         try {
//           await updateDoc(docRef, { status: "Picked" });
//           alert("Marked as Picked!");
//           loadWasteDetails(); // reload data
//         } catch (err) {
//           alert("Error updating status: " + err.message);
//         }
//       }
//     };
//   } catch (error) {
//     console.error("Error loading waste details:", error);
//   }
// }

// loadWasteDetails();


import { db } from './firebase.js';
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

// Helper: format timestamp
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

    // Fill page with post data
    document.getElementById("wasteImage").src = data.imageUrl || "";
    document.getElementById("description").innerText = data.description || "No description";
    const timestamp = data.timestamp?.toDate?.() || null;
    document.getElementById("timestamp").innerText = timeAgo(timestamp);

    // Set Google Maps link
    if (data.latitude && data.longitude) {
      document.getElementById("mapBtn").href = `https://www.google.com/maps?q=${data.latitude},${data.longitude}`;
    }

    // Set status
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

    // 🧠 FETCH POSTED BY USER INFO
    const postedByUid = data.uid;

    // Step 1: Get userType from users collection (UID is doc ID)
    const userDoc = await getDoc(doc(db, "users", postedByUid));
    if (userDoc.exists()) {
      const userData = userDoc.data();

      if (userData.userType === "wasteGenerator") {
        const genQuery = query(
          collection(db, "wasteGenerators"),
          where("uid", "==", postedByUid)
        );
        const genSnap = await getDocs(genQuery);
        if (!genSnap.empty) {
          const g = genSnap.docs[0].data();
          document.getElementById("postedBy").innerText = g.name || "Unknown";
          document.getElementById("email").innerText = g.email || "N/A";
          document.getElementById("phone").innerText = g.phone || "N/A";
          document.getElementById("address").innerText = g.address || "N/A";
        }
      } else if (userData.userType === "recyclerFirm") {
        const firmQuery = query(
          collection(db, "recyclerFirms"),
          where("uid", "==", postedByUid)
        );
        const firmSnap = await getDocs(firmQuery);
        if (!firmSnap.empty) {
          const f = firmSnap.docs[0].data();
          document.getElementById("postedBy").innerText = f.contactPerson || "Unknown";
          document.getElementById("email").innerText = f.email || "N/A";
          document.getElementById("phone").innerText = f.phone || "N/A";
          document.getElementById("address").innerText = f.address || "N/A";
        }
      }
    } else {
      document.getElementById("postedBy").innerText = "Unknown";
    }

    // Handle Pick button
    btn.onclick = async () => {
      if (confirm("Mark this waste as picked?")) {
        try {
          await updateDoc(docRef, { status: "Picked" });
          alert("Marked as Picked!");
          loadWasteDetails(); // reload data
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
