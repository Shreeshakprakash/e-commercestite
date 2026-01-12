const params = new URLSearchParams(window.location.search);
const productId = params.get('id');

if (!productId) {
	document.querySelector('.product-detail').innerHTML = "<p>Product not found.</p>";
} else {
	const db = firebase.firestore();
	db.collection('products').doc(productId).get().then(doc => {
		if (doc.exists) {
			const product = doc.data();
			document.title = product.Name || "Product Details";
			document.getElementById('Name').textContent = product.Name || "";
			const imageElem = document.getElementById('Image');
			imageElem.src = product.Image || "";
			imageElem.alt = product.Name || "Product Image";
			imageElem.width = 200;
			// Fallback to logo_small.png if image fails to load
			imageElem.onerror = function() {
				this.onerror = null;
				this.src = '../images/logo_small.png';
			};
			document.getElementById('Description').textContent = product.Description || "";
			document.getElementById('Price').textContent = product.Price ? `₹${product.Price}` : "";
		} else {
			document.querySelector('.product-detail').innerHTML = "<p>Product not found.</p>";
		}
	}).catch(error => {
		document.querySelector('.product-detail').innerHTML = "<p>Error loading product.</p>";
		console.error(error);
	});
}

// Function to handle header appearance on scroll
const initHeaderScroll = () => {
    const header = document.getElementById('navbar');
    
    window.addEventListener('scroll', () => {
        // If user scrolls more than 50px, add the 'scrolled' class
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
};

// Simple log to confirm scripts are loaded
console.log("PixelPort Navigation Initialized");

// Initialize functions
document.addEventListener('DOMContentLoaded', () => {
    initHeaderScroll();
});

document.getElementById('backToTop').addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});