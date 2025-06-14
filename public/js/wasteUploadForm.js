// Import Firestore utilities from your firebase.js setup
import { db } from "./firebase.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";

// Get Auth instance
const auth = getAuth();

// Elements
const uploadBtn = document.getElementById("uploadWidgetBtn");
const uploadStatus = document.getElementById("uploadStatus");
const imageUrlField = document.getElementById("uploadedImageUrl");
const form = document.getElementById("wasteUploadForm");
const formMessage = document.getElementById("formMessage");

// Cloudinary Upload Widget Setup
const myWidget = cloudinary.createUploadWidget(
  {
    cloudName: "drnzv49wl",
    uploadPreset: "wasteManagementApp",
  },
  (error, result) => {
    if (!error && result && result.event === "success") {
      console.log("Image uploaded:", result.info.secure_url);
      uploadStatus.innerText = "✅ Image uploaded successfully!";
      imageUrlField.value = result.info.secure_url;
      formMessage.innerText = "";
    } else if (error) {
      console.error("Upload Error:", error);
      uploadStatus.innerText = "❌ Upload failed.";
      formMessage.style.color = "red";
      formMessage.innerText = "Image upload failed, please try again.";
    }
  }
);

uploadBtn.addEventListener("click", () => {
  myWidget.open();
});

// Get user geolocation
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      document.getElementById("latitude").value = position.coords.latitude;
      document.getElementById("longitude").value = position.coords.longitude;
    },
    (error) => {
      console.warn("Geolocation blocked or failed:", error.message);
      formMessage.style.color = "orange";
      formMessage.innerText = "Location access denied or unavailable.";
    }
  );
} else {
  formMessage.style.color = "orange";
  formMessage.innerText = "Geolocation is not supported by this browser.";
}

// Handle form submission
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  formMessage.style.color = "green";
  formMessage.innerText = "";

  if (!imageUrlField.value) {
    alert("Please upload an image first.");
    return;
  }

  const user = auth.currentUser;
  if (!user) {
    alert("You must be logged in to submit waste data.");
    return;
  }

  const wasteType = form.wasteType.value;
  const pointsByType = {
    "Plastic": 10,
    "Organic": 5,
    "E-Waste": 20,
    "Metal": 15,
    "Glass": 12,
    "Other": 5
  };

  const formData = {
    imageUrl: imageUrlField.value,
    description: form.wasteDescription.value.trim(),
    wasteType: wasteType,
    latitude: form.latitude.value || null,
    longitude: form.longitude.value || null,
    timestamp: serverTimestamp(),
    uid: user.uid,
    status: "Pending"
  };

  try {
    await addDoc(collection(db, "wasteUploads"), formData);

    const earnedPoints = pointsByType[wasteType] || 0;
    localStorage.setItem("lastEarnedPoints", earnedPoints);
    
    // Store lastWasteType to trigger point update on rewards dashboard
    localStorage.setItem("lastWasteType", wasteType);

    formMessage.style.color = "green";
    formMessage.innerText = "✅ Waste data submitted successfully!";
    form.reset();
    imageUrlField.value = "";
    uploadStatus.innerText = "No image uploaded.";
  } catch (err) {
    console.error("Firestore submission failed:", err);
    formMessage.style.color = "red";
    formMessage.innerText = "❌ Submission failed. Please try again.";
  }
});