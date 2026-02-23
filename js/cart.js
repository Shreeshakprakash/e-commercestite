//Cart UI, storage, and order summary
document.addEventListener('DOMContentLoaded', function() {
    displayCartItems();
    updateOrderSummary();
    loadRecommendedProducts();
    initializeMenuToggle();
});

function displayCartItems() {
    const cart = getCart();
    const cartItemsContainer = document.querySelector('.cart-items');
    const emptyCartDiv = document.querySelector('.empty-cart');

    if (cart.length === 0) {
        if (emptyCartDiv) {
            emptyCartDiv.style.display = 'block';
        }
        if (cartItemsContainer) {
            Array.from(cartItemsContainer.children).forEach(child => {
                if (!child.classList || !child.classList.contains('empty-cart')) {
                    child.remove();
                }
            });
            cartItemsContainer.style.display = '';
        }
        return;
    }

    if (emptyCartDiv) {
        emptyCartDiv.style.display = 'none';
    }
    if (cartItemsContainer) {
        cartItemsContainer.style.display = 'flex';
    }

    if (cartItemsContainer) {
        cartItemsContainer.innerHTML = '';
        
        cart.forEach((item, index) => {
                const cartItemElement = createCartItemElement(item, index);
                cartItemsContainer.appendChild(cartItemElement);
            });
    }
}


function createCartItemElement(item, index) {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'cart-item';
    itemDiv.innerHTML = `
        <div class="item-image">
            ${item.image ? `<img src="${item.image}" alt="${item.name}" width="50">` : getProductIcon(item.name)}
        </div>
        <div class="item-details">
            <div class="item-name">${item.name}</div>
            <div class="item-price">₹${item.price.toFixed(2)}</div>
        </div>
        <div class="quantity-controls">
            <button class="quantity-btn" onclick="updateQuantity(${index}, ${item.quantity - 1})">
                -
            </button>
            <input type="number" class="quantity-input" value="${item.quantity}" 
                   min="1" onchange="updateQuantity(${index}, parseInt(this.value))">
            <button class="quantity-btn" onclick="updateQuantity(${index}, ${item.quantity + 1})">
                +
            </button>
        </div>
        <button class="remove-item" onclick="removeFromCart(${index})">Delete</button>
    `;
    return itemDiv;
}


function getProductIcon(productName) {
    const icons = {
        'Premium Laptop': '<img src="images/laptop.png" alt="Laptop" width="50">',
        'Smart Watch': '<img src="images/smartwatch.png" alt="watch" width="50">',
        'Smartphone': '<img src="images/mobile.png" alt="Mobile" width="50">',
        'Tablet': '<img src="images/tablet1.jpg" alt="Tablet" width="50">',
        'Premium Headphones': '<img src="images/headphone.png" alt="Headphone" width="50">',
        'Laptop': '<img src="images/laptop.png" alt="Laptop" width="50">'
    };
    return icons[productName] || '<i class="bx bx-package"></i>';
}


function updateQuantity(index, newQuantity) {
    const cart = getCart();
    if (newQuantity < 1) {
        removeFromCart(index);
        return;
    }
    
    cart[index].quantity = newQuantity;
    saveCart(cart);
    displayCartItems();
    updateOrderSummary();
    updateCartBadge();
}


function removeFromCart(index) {
    const cart = getCart();
    cart.splice(index, 1);
    saveCart(cart);
    displayCartItems();
    updateOrderSummary();
    updateCartBadge();
    
    
    showNotification('Item removed from cart', 'success');
}


function clearCart() {
    const cart = getCart();
    if (cart.length === 0) return;
    
    if (confirm('Are you sure you want to clear your cart?')) {
        saveCart([]);
        displayCartItems();
        updateOrderSummary();
        updateCartBadge();
        showNotification('Cart cleared', 'success');
    }
}


function updateOrderSummary() {
    const cart = getCart();
    const subtotalElement = document.querySelector('#subtotal');
    const shippingElement = document.querySelector('#shipping');
    const totalElement = document.querySelector('#total');
    const itemCountElement = document.querySelector('#item-count');
    const checkoutBtn = document.querySelector('.checkout-btn');

    if (!subtotalElement || !shippingElement || !totalElement) return;

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const shipping = subtotal > 1000 ? 0 : 99; 
    const total = subtotal + shipping; 

    subtotalElement.textContent = `₹${subtotal.toFixed(2)}`;
    shippingElement.textContent = shipping === 0 ? 'FREE' : `₹${shipping.toFixed(2)}`;
    totalElement.textContent = `₹${total.toFixed(2)}`;
    if (itemCountElement) itemCountElement.textContent = totalItems;

    
    if (checkoutBtn) {
        if (cart.length === 0) {
            checkoutBtn.disabled = true;
            checkoutBtn.innerHTML = '<i class="bx bx-lock"></i> Cart is Empty';
        } else {
            checkoutBtn.disabled = false;
            checkoutBtn.innerHTML = '<i class="bx bx-credit-card"></i> Proceed to Checkout';
        }
    }
}


function proceedToCheckout() {
    const cart = getCart();
    if (cart.length === 0) return;
    
    
    showPaymentMethodSelection();
}


function showPaymentMethodSelection() {
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'payment-method-overlay';
    modalOverlay.innerHTML = `
        <div class="payment-method-modal">
            <div class="payment-header">
                <h2>💳 Select Payment Method</h2>
                <p>Choose your preferred payment option to complete the order</p>
            </div>
            
            <div class="payment-options">
                <div class="payment-option" data-method="card">
                    <div class="payment-icon">
                        💳
                    </div>
                    <div class="payment-info">
                        <h4>Credit/Debit Card</h4>
                        <p>Visa, Mastercard, RuPay accepted</p>
                    </div>
                    <div class="payment-radio">
                        <input type="radio" name="payment" value="card" id="card">
                    </div>
                </div>
                
                <div class="payment-option" data-method="upi">
                    <div class="payment-icon">
                        🛜
                    </div>
                    <div class="payment-info">
                        <h4>UPI Payment</h4>
                        <p>Pay using Google Pay, PhonePe, Paytm</p>
                    </div>
                    <div class="payment-radio">
                        <input type="radio" name="payment" value="upi" id="upi">
                    </div>
                </div>
                
                <div class="payment-option" data-method="wallet">
                    <div class="payment-icon">
                        🗂️
                    </div>
                    <div class="payment-info">
                        <h4>Digital Wallet</h4>
                        <p>Paytm, Amazon Pay, JioMoney</p>
                    </div>
                    <div class="payment-radio">
                        <input type="radio" name="payment" value="wallet" id="wallet">
                    </div>
                </div>
                
                <div class="payment-option" data-method="netbanking">
                    <div class="payment-icon">
                        🏦
                    </div>
                    <div class="payment-info">
                        <h4>Net Banking</h4>
                        <p>All major banks supported</p>
                    </div>
                    <div class="payment-radio">
                        <input type="radio" name="payment" value="netbanking" id="netbanking">
                    </div>
                </div>
                
                <div class="payment-option" data-method="cod">
                    <div class="payment-icon">
                        💵
                    </div>
                    <div class="payment-info">
                        <h4>Cash on Delivery</h4>
                        <p>Pay when you receive the order</p>
                    </div>
                    <div class="payment-radio">
                        <input type="radio" name="payment" value="cod" id="cod">
                    </div>
                </div>
            </div>
            
            <div class="payment-actions">
                <button class="cancel-payment-btn" onclick="closePaymentModal()">
                    <i class='bx bx-x'></i>
                    Cancel
                </button>
                <button class="proceed-payment-btn" onclick="processPayment()" disabled>
                    <i class='bx bx-check'></i>
                    Proceed to Pay
                </button>
            </div>
        </div>
    `;
    
    
    document.body.appendChild(modalOverlay);
    
    
    setTimeout(() => {
        modalOverlay.classList.add('show');
    }, 10);
    
    
    document.querySelectorAll('.payment-option').forEach(option => {
        option.addEventListener('click', function() {
            
            document.querySelectorAll('.payment-option').forEach(opt => opt.classList.remove('selected'));
            
            
            this.classList.add('selected');
            const radio = this.querySelector('input[type="radio"]');
            radio.checked = true;
            
            
            document.querySelector('.proceed-payment-btn').disabled = false;
        });
    });
}


function closePaymentModal() {
    const modal = document.querySelector('.payment-method-overlay');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
}


function processPayment() {
    const selectedPayment = document.querySelector('input[name="payment"]:checked');
    if (!selectedPayment) return;
    
    const paymentMethod = selectedPayment.value;
    const paymentNames = {
        'card': 'Credit/Debit Card',
        'upi': 'UPI Payment',
        'wallet': 'Digital Wallet',
        'netbanking': 'Net Banking',
        'cod': 'Cash on Delivery'
    };
    
    
    closePaymentModal();
    
    
    showNotification(`Processing payment via ${paymentNames[paymentMethod]}...`, 'info');
    
    
    setTimeout(() => {
        const cart = getCart();
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shipping = subtotal > 1000 ? 0 : 99;
        const total = subtotal + shipping; 
        
        
        showOrderConfirmation(cart, subtotal, shipping, total, paymentMethod);
        
        
        saveCart([]);
        displayCartItems();
        updateOrderSummary();
        updateCartBadge();
    }, 2000);
}


function showOrderConfirmation(cart, subtotal, shipping, total, paymentMethod = 'card') {
    const paymentNames = {
        'card': 'Credit/Debit Card',
        'upi': 'UPI Payment',
        'wallet': 'Digital Wallet',
        'netbanking': 'Net Banking',
        'cod': 'Cash on Delivery'
    };
    
    const paymentIcons = {
        'card': 'bx-credit-card',
        'upi': 'bx-qr',
        'wallet': 'bx-wallet',
        'netbanking': 'bx-bank',
        'cod': 'bx-money'
    };

    
    window.lastOrderData = {
        cart,
        subtotal,
        shipping,
        total,
        paymentMethod: paymentNames[paymentMethod],
        orderId: generateOrderId(),
        orderDate: new Date(),
        estimatedDelivery: getEstimatedDelivery()
    };
    
    
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'order-confirmation-overlay';
    modalOverlay.innerHTML = `
        <div class="order-confirmation-modal">
            <div class="confirmation-header">
                <div class="success-icon">
                    <i class='bx bx-check-circle'></i>
                </div>
                <h2>Order Confirmed!</h2>
                <p>Thank you for your purchase. Your order has been successfully placed.</p>
            </div>
            
            <div class="order-details">
                <h3>Order Summary</h3>
                <div class="order-items">
                    ${cart.map(item => `
                        <div class="order-item">
                            <span class="item-name">${item.name} (x${item.quantity})</span>
                            <span class="item-total">₹${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                    `).join('')}
                </div>
                
                <div class="order-totals">
                    <div class="total-row">
                        <span>Subtotal:</span>
                        <span>₹${subtotal.toFixed(2)}</span>
                    </div>
                    <div class="total-row">
                        <span>Shipping:</span>
                        <span>${shipping === 0 ? 'FREE' : `₹${shipping.toFixed(2)}`}</span>
                    </div>
                    <div class="total-row final-total">
                        <span>Total Amount:</span>
                        <span>₹${total.toFixed(2)}</span>
                    </div>
                </div>
            </div>
            
            <div class="order-info">
                <div class="info-item">
                    <i class='bx bx-package'></i>
                    <div>
                        <strong>Order ID:</strong>
                        <span>#${window.lastOrderData.orderId}</span>
                    </div>
                </div>
                <div class="info-item">
                    <i class='bx ${paymentIcons[paymentMethod]}'></i>
                    <div>
                        <strong>Payment Method:</strong>
                        <span>${paymentNames[paymentMethod]}</span>
                    </div>
                </div>
                <div class="info-item">
                    <i class='bx bx-time'></i>
                    <div>
                        <strong>Estimated Delivery:</strong>
                        <span>${window.lastOrderData.estimatedDelivery}</span>
                    </div>
                </div>
                <div class="info-item">
                    <i class='bx bx-envelope'></i>
                    <div>
                        <strong>Confirmation Email:</strong>
                        <span>Sent to your registered email</span>
                    </div>
                </div>
            </div>
            
            <div class="confirmation-actions">
                <button class="continue-shopping-btn" onclick="closeOrderConfirmation()">
                    <i class='bx bx-shopping-bag'></i>
                    Continue Shopping
                </button>
                <button class="print-receipt-btn" onclick="printReceipt()">
                    <i class='bx bx-printer'></i>
                    Print Receipt
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modalOverlay);
    
    
    setTimeout(() => {
        modalOverlay.classList.add('show');
    }, 10);
}


function generateOrderId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `ECM${timestamp}${random}`.toUpperCase();
}


function getEstimatedDelivery() {
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 3); 
    return deliveryDate.toLocaleDateString('en-IN', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}


function closeOrderConfirmation() {
    const modal = document.querySelector('.order-confirmation-overlay');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
    
    window.location.href = 'products-live.html';
}


function printReceipt() {
    if (!window.lastOrderData) {
        showNotification('No order data available for printing', 'error');
        return;
    }

    const orderData = window.lastOrderData;
    const receiptWindow = window.open('', '_blank', 'width=800,height=600');
    
    const receiptHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Order Receipt - ${orderData.orderId}</title>
            <style>
                body {
                    font-family: 'Segoe UI', sans-serif;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    background: white;
                    color: black;
                }
                .receipt-header {
                    text-align: center;
                    border-bottom: 2px solid #000;
                    padding-bottom: 20px;
                    margin-bottom: 20px;
                }
                .company-name {
                    font-size: 24px;
                    font-weight: bold;
                    margin-bottom: 5px;
                }
                .receipt-title {
                    font-size: 18px;
                    margin-bottom: 10px;
                }
                .order-info {
                    margin-bottom: 20px;
                }
                .info-row {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 5px;
                }
                .items-section {
                    margin: 20px 0;
                }
                .item-header {
                    display: flex;
                    justify-content: space-between;
                    border-bottom: 1px solid #000;
                    padding-bottom: 5px;
                    margin-bottom: 10px;
                    font-weight: bold;
                }
                .item-row {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 5px;
                }
                .totals-section {
                    border-top: 2px solid #000;
                    padding-top: 10px;
                    margin-top: 20px;
                }
                .total-row {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 5px;
                }
                .final-total {
                    font-weight: bold;
                    font-size: 18px;
                    border-top: 1px solid #000;
                    padding-top: 10px;
                    margin-top: 10px;
                }
                .receipt-footer {
                    text-align: center;
                    margin-top: 30px;
                    padding-top: 20px;
                    border-top: 2px solid #000;
                    font-size: 12px;
                }
                @media print {
                    body { margin: 0; }
                    .no-print { display: none; }
                }
                .print-btn {
                    background: #007bff;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    cursor: pointer;
                    margin: 20px 0;
                    border-radius: 5px;
                }
            </style>
        </head>
        <body>
            <div class="receipt-header">
                <div class="company-name">PIXELPORT</div>
                <div class="receipt-title">ORDER RECEIPT</div>
                <div>Thank you for your purchase!</div>
            </div>

            <div class="order-info">
                <div class="info-row">
                    <span>Order ID:</span>
                    <span>#${orderData.orderId}</span>
                </div>
                <div class="info-row">
                    <span>Order Date:</span>
                    <span>${orderData.orderDate.toLocaleDateString('en-IN')} ${orderData.orderDate.toLocaleTimeString('en-IN')}</span>
                </div>
                <div class="info-row">
                    <span>Payment Method:</span>
                    <span>${orderData.paymentMethod}</span>
                </div>
                <div class="info-row">
                    <span>Estimated Delivery:</span>
                    <span>${orderData.estimatedDelivery}</span>
                </div>
            </div>

            <div class="items-section">
                <div class="item-header">
                    <span>ITEM</span>
                    <span>QTY</span>
                    <span>PRICE</span>
                    <span>TOTAL</span>
                </div>
                ${orderData.cart.map(item => `
                    <div class="item-row">
                        <span>${item.name}</span>
                        <span>${item.quantity}</span>
                        <span>₹${item.price.toFixed(2)}</span>
                        <span>₹${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                `).join('')}
            </div>

            <div class="totals-section">
                <div class="total-row">
                    <span>Subtotal:</span>
                    <span>₹${orderData.subtotal.toFixed(2)}</span>
                </div>
                <div class="total-row">
                    <span>Shipping:</span>
                    <span>${orderData.shipping === 0 ? 'FREE' : `₹${orderData.shipping.toFixed(2)}`}</span>
                </div>
                <div class="total-row final-total">
                    <span>TOTAL AMOUNT:</span>
                    <span>₹${orderData.total.toFixed(2)}</span>
                </div>
            </div>

            <div class="receipt-footer">
                <p>Contact: info@pixelport.com | +91 123-4567-890</p>
                <p>Visit us at: www.pixelport.com</p>
                <p>Thank you for choosing PixelPort!</p>
            </div>

            <button class="print-btn no-print" onclick="window.print()">🖨️ Print Receipt</button>
        </body>
        </html>
    `;
    
    receiptWindow.document.write(receiptHTML);
    receiptWindow.document.close();
    
    
    receiptWindow.focus();
    
    showNotification('Receipt opened in new window', 'success');
}


function loadRecommendedProducts() {
    const recommendedContainer = document.querySelector('.recommended-products');
    if (!recommendedContainer) return;

    const recommendedProducts = [
        { name: 'Premium Laptop', price: 120000, icon: '<i class="bx bx-laptop"></i>' },
        { name: 'Wireless Headphones', price: 25000, icon: '<i class="bx bx-headphone"></i>' },
        { name: 'Smart Watch', price: 40000, icon: '<i class="bx bx-time"></i>' },
        { name: 'Gaming Mouse', price: 8000, icon: '<i class="bx bx-mouse"></i>' }
    ];

    recommendedContainer.innerHTML = '';
    
    recommendedProducts.forEach((product, index) => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card-mini';
        productCard.innerHTML = `
            <div class="product-image">${product.icon}</div>
            <div class="product-info">
                <h4>${product.name}</h4>
                <span class="price">₹${product.price.toFixed(2)}</span>
                <button class="add-to-cart-mini" data-name="${product.name}" data-price="${product.price}">
                    Add to Cart
                </button>
            </div>
        `;
        recommendedContainer.appendChild(productCard);
    });
    
    
    document.querySelectorAll('.add-to-cart-mini').forEach(btn => {
        btn.addEventListener('click', function() {
            const productName = this.getAttribute('data-name');
            const productPrice = parseFloat(this.getAttribute('data-price'));
            addToCartFromRecommended(productName, productPrice);
        });
    });
}


function addToCartFromRecommended(productName, price) {
    const cart = getCart();
    const existingItem = cart.find(item => item.name === productName);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            name: productName,
            price: price,
            quantity: 1
        });
    }
    
    saveCart(cart);
    displayCartItems();
    updateOrderSummary();
    updateCartBadge();
    showNotification(`${productName} added to cart!`, 'success');
}


window.updateQuantity = updateQuantity;
window.removeFromCart = removeFromCart;
window.addToCartFromRecommended = addToCartFromRecommended;


document.addEventListener('DOMContentLoaded', function() {
    
    const clearCartBtn = document.querySelector('.clear-cart-btn');
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', clearCart);
    }
    
    
    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', proceedToCheckout);
    }
    
    
    const shopNowBtn = document.querySelector('.shop-now-btn');
    if (shopNowBtn) {
        shopNowBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = 'products-live.html';
        });
    }
});


const initHeaderScroll = () => {
    const header = document.getElementById('navbar');
    
    window.addEventListener('scroll', () => {

        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
};



document.addEventListener('DOMContentLoaded', () => {
    initHeaderScroll();
});

document.getElementById('backToTop').addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});
