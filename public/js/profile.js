function saveUserProfile() {
    const user = firebase.auth().currentUser;
    if (!user) {
      alert("You must be logged in to save your profile.");
      return;
    }
  
    const name = document.getElementById("name").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const address = document.getElementById("address").value.trim();
    const role = document.querySelector('input[name="role"]:checked').value;
  
    if (!name || !role) {
      alert("Please fill out required fields.");
      return;
    }
  
    let profileData = {
      uid: user.uid,
      email: user.email,
      name: name,
      phone: phone,
      address: address,
      role: role,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    };
  
    // Role-specific fields
    if (role === "generator") {
      profileData.wasteType = document.getElementById("wasteType").value.trim();
      profileData.quantity = parseFloat(document.getElementById("quantity").value);
    } else if (role === "recycler") {
      profileData.materialsAccepted = document.getElementById("materialsAccepted").value.split(',').map(x => x.trim());
      profileData.capacity = parseFloat(document.getElementById("capacity").value);
    }
  
    // Save to Firestore under 'profiles' collection
    firebase.firestore().collection("profiles").doc(user.uid).set(profileData)
      .then(() => {
        alert("Profile saved successfully!");
        window.location.href = "dashboard.html"; // Redirect to dashboard
      })
      .catch((error) => {
        console.error("Error saving profile:", error);
        alert("Failed to save profile. Try again.");
      });
  }
  