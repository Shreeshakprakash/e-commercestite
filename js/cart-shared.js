function getCart() {
    return JSON.parse(localStorage.getItem('cart')) || [];
}


function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
}


function addToCart(name, price, image = '') {
    const cart = getCart();
    const existingItem = cart.find(item => item.name === name && item.price === price && (item.image || '') === image);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            name: name,
            price: price,
            quantity: 1,
            image: image
        });
    }
    
    saveCart(cart);
    updateCartBadge();
    showNotification(`${name} added to cart!`, 'success');
    return cart;
}


function updateCartBadge() {

    const cartBadge = document.querySelector('.cart-count');
    if (cartBadge) {
        const cart = getCart();
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartBadge.textContent = totalItems;
        cartBadge.style.display = totalItems > 0 ? 'flex' : 'none';
    }
}


function showNotification(message, type = 'success') {
    
    const existingNotification = document.querySelector('.pixel-notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    const notification = document.createElement('div');
    notification.className = `pixel-notification notification-${type}`;
    

    const bgColor = type === 'error' ? '#93291E' : '#121212';
    const iconName = type === 'error' ? 'alert-circle-outline' : 'checkmark-outline';


    notification.style.cssText = `
        position: fixed;
        top: 30px;
        right: 30px;
        background: ${bgColor};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 2px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.15);
        z-index: 9999;
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-size: 0.85rem;
        font-weight: 500;
        letter-spacing: 0.5px;
        display: flex;
        align-items: center;
        gap: 12px;
        animation: slideInRight 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    `;
    
    notification.innerHTML = `
        <ion-icon name="${iconName}" style="font-size: 1.2rem;"></ion-icon>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(20px)';
            notification.style.transition = 'all 0.4s ease';
            setTimeout(() => notification.remove(), 400);
        }
    }, 3000);
}


if (!document.querySelector('#pixel-notif-styles')) {
    const style = document.createElement('style');
    style.id = 'pixel-notif-styles';
    style.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(40px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
}


document.addEventListener('DOMContentLoaded', function() {
    updateCartBadge();
});