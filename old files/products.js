// Fetch products from Firestore and render them
async function fetchProductsFromFirestore() {
    if (typeof firebase === 'undefined' || !firebase.firestore) {
        return [];
    }
    try {
        const snapshot = await firebase.firestore().collection('products').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
        console.warn('Firestore fetch failed.', e);
        return [];
    }
}

function renderProducts(products) {
    const productsList = document.getElementById('products-list');
    if (!products || products.length === 0) {
        productsList.innerHTML = '<p>No products found.</p>';
        return;
    }
    productsList.innerHTML = products.map(product => `
        <div class="product-card">
            <img src="images/logo_small.png" alt="${product.Name}">
            <div class="product-title">${product.Name || 'No Name'}</div>
            <div class="product-price">$${product.Price ? product.Price : 'N/A'}</div>
            <div class="product-desc">${product.Description || ''}</div>
            <button class="add-to-cart">Add to Cart</button>
        </div>
    `).join('');

    // Add event listeners for add-to-cart buttons
    const cartBadge = document.getElementById('cart-badge');
    let cartCount = 0;
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', function(e) {
            // Animation
            btn.classList.add('added');
            setTimeout(() => btn.classList.remove('added'), 500);
            // Update cart badge
            cartCount++;
            cartBadge.textContent = cartCount;
        });
    });
}

document.addEventListener('DOMContentLoaded', async function() {
    const products = await fetchProductsFromFirestore();
    renderProducts(products);
});
// ...existing code...

