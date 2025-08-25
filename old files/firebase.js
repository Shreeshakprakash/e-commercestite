import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// Firebase configuration and initialization

// Replace the below config with your own Firebase project config
const firebaseConfig = {
  apiKey: "AIzaSyBrVZa9LRKYURVw8t7sqWGbQYuqlrnfEZ8",
  authDomain: "test-ecommerce-a7d42.firebaseapp.com",
  projectId: "test-ecommerce-a7d42",
  storageBucket: "test-ecommerce-a7d42.firebasestorage.app",
  messagingSenderId: "202120303178",
  appId: "1:202120303178:web:a80663199b8a4a78808cb3",
  measurementId: "G-FYPBLT6XDH"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
// You can now use `db` to interact with Firestore

// Example: Fetch products (to be implemented in products.js)
// db.collection('products').get().then(snapshot => { ... });
async function loadProducts() {
      const querySnapshot = await getDocs(collection(db, "products"));
      let container = document.getElementById("products");
      container.innerHTML = "";
      querySnapshot.forEach((doc) => {
        let p = doc.data();
        container.innerHTML += `
          <div class="product">
            <h3>${p.Name}</h3>
            <p>Price: $${p.Price}</p>
            <p>${p.Description || ""}</p>
          </div>
        `;
      });
    }

    loadProducts();