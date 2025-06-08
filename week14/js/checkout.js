(function() {

// Security configuration
const SECURITY_CONFIG = {
    MAX_ORDER_ITEMS: 10,
    MAX_ORDER_QUANTITY: 99,
    MAX_ORDER_TOTAL: 10000, // Maximum order total in dollars
    MAX_ORDER_HISTORY: 100, // Maximum number of orders to keep in history
    ORDER_ID_LENGTH: 16
};

// Input validation function
function sanitizeInput459(input) {
    if (typeof input !== 'string') return '';
    // Remove HTML tags and special characters
    return input.replace(/[<>'"]/g, '');
}

// Generate order ID
function generateOrderId459() {
    const array = new Uint32Array(4);
    window.crypto.getRandomValues(array);
    return Array.from(array, dec => ('0' + dec.toString(16)).substr(-2)).join('');
}

// Validate order data
function validateOrderData459(order) {
    if (!order || !order.items || !Array.isArray(order.items)) {
        return false;
    }

    if (order.items.length > SECURITY_CONFIG.MAX_ORDER_ITEMS) {
        alert('Order exceeds maximum number of items');
        return false;
    }

    let totalPrice = 0;
    for (const item of order.items) {
        if (!item.id || !item.quantity || 
            item.quantity > SECURITY_CONFIG.MAX_ORDER_QUANTITY ||
            item.quantity < 1) {
            return false;
        }

        // Validate item price
        const foundItem = JSON.parse(localStorage.getItem('allItems') || '[]')
            .find(i => i.id === item.id);
        if (!foundItem || typeof foundItem.price !== 'number') {
            return false;
        }

        totalPrice += foundItem.price * item.quantity;
    }

    // Check total price limit
    if (totalPrice > SECURITY_CONFIG.MAX_ORDER_TOTAL) {
        alert('Order total exceeds maximum allowed amount');
        return false;
    }

    return true;
}

// Validate order history
function validateOrderHistory459(orders) {
    if (!Array.isArray(orders)) return false;
    
    // Limit order history size
    if (orders.length > SECURITY_CONFIG.MAX_ORDER_HISTORY) {
        orders = orders.slice(-SECURITY_CONFIG.MAX_ORDER_HISTORY);
    }

    return orders.every(order => 
        order && 
        typeof order === 'object' &&
        typeof order.orderId === 'string' &&
        order.orderId.length === SECURITY_CONFIG.ORDER_ID_LENGTH &&
        validateOrderData459(order)
    );
}

// Check user login status
function checkAuth() {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
    const username = sessionStorage.getItem('username');
    const userStatus = document.getElementById('userStatus');
    
    if (!isLoggedIn) {
        window.location.href = 'index.html';
        return;
    }

    // Update user status display
    if (userStatus) {
        userStatus.textContent = sanitizeInput459(username) || 'Guest';
    }
}

// Display order confirmation
async function displayOrderConfirmation() {
    try {
        console.log('--- displayOrderConfirmation Start ---');
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const orders = JSON.parse(localStorage.getItem('orders') || '[]');
        const username = sessionStorage.getItem('username');
        const orderConfirmation = document.getElementById('orderConfirmation');
        
        console.log('Cart data:', cart);
        console.log('Orders data before validation:', orders);

        if (!orderConfirmation) {
            console.error('Error: orderConfirmation element not found!');
            return;
        }
        console.log('orderConfirmation element found.', orderConfirmation);

        // Validate orders
        let validOrders = [];
        if (Array.isArray(orders)) {
            validOrders = orders.filter(order => validateOrderData459(order));
            if (validOrders.length !== orders.length) {
                console.warn('Invalid order data found in history. Removing invalid orders.');
                // Optionally clear invalid orders from localStorage
                // localStorage.setItem('orders', JSON.stringify(validOrders));
            }
        }
        console.log('Orders data after validation:', validOrders);

        // Get course and resource data
        const [coursesResponse, resourcesResponse] = await Promise.all([
            fetch('./data/courses.json'),
            fetch('./data/resources.json')
        ]);

        if (!coursesResponse.ok) throw new Error(`HTTP error! status: ${coursesResponse.status} for courses.json`);
        if (!resourcesResponse.ok) throw new Error(`HTTP error! status: ${resourcesResponse.status} for resources.json`);

        const coursesData = await coursesResponse.json();
        const resourcesData = await resourcesResponse.json();
        
        const allItems = [...coursesData.courses, ...resourcesData.resources];
        localStorage.setItem('allItems', JSON.stringify(allItems));

        let content = '';

        // Display current cart
        if (cart.length > 0) {
            console.log('Displaying current cart as order confirmation.');
            let total = 0;
            const currentOrderItems = cart.map(item => {
                const foundItem = allItems.find(i => i.id === item.id);
                
                if (foundItem && foundItem.price !== undefined) {
                    const itemTotal = foundItem.price * item.quantity;
                    total += itemTotal;
                    const itemType = coursesData.courses.some(c => c.id === item.id) ? 'Course' : 'Resource';

                    return `
                        <div class="order-item">
                            <h3>${sanitizeInput459(foundItem.title)}</h3>
                            <p>${itemType} ID: ${sanitizeInput459(foundItem.id)}</p>
                            <p>Quantity: ${item.quantity}</p>
                            <p>Price: A$${foundItem.price.toFixed(2)}</p>
                            <p>Subtotal: A$${itemTotal.toFixed(2)}</p>
                        </div>
                    `;
                }
                console.warn(`Item with ID ${item.id} not found in allItems or price is undefined.`);
                return '';
            }).join('');

            content += `
                <div class="current-order">
                    <h2>Order Confirmation</h2>
                    <div class="order-info">
                        <p>Customer: ${sanitizeInput459(username)}</p>
                        <p>Order Date: ${new Date().toLocaleString()}</p>
                    </div>
                    ${currentOrderItems}
                    <div class="order-total">
                        <h3>Total Amount: A$${total.toFixed(2)}</h3>
                    </div>
                    <div class="order-actions">
                        <button class="btn-warning" onclick="editOrder()">Edit Order</button>
                        <button class="btn-success" onclick="confirmOrder459()">Confirm Order</button>
                    </div>
                </div>
            `;
        }

        // Display order history
        if (validOrders.length > 0) {
            console.log('Displaying order history.');
            const orderHistoryHTML = validOrders.map(order => `
                <div class="order-item">
                    <div class="order-info">
                        <p>Order ID: ${sanitizeInput459(order.orderId)}</p>
                        <p>Order Date: ${new Date(order.orderDate).toLocaleString()}</p>
                        <p>Customer: ${sanitizeInput459(order.username)}</p>
                    </div>
                    <div class="order-items">
                        ${order.items.map(item => `
                            <div class="order-item-detail">
                                <p>Item ID: ${sanitizeInput459(item.id)}</p>
                                <p>Quantity: ${item.quantity}</p>
                            </div>
                        `).join('')}
                    </div>
                    <div class="order-total">
                        <p>Total Amount: A$${order.totalPrice.toFixed(2)}</p>
                    </div>
                </div>
            `).join('');

            content += `
                <div class="order-history">
                    <h2>Order History</h2>
                    ${orderHistoryHTML}
                </div>
            `;
        }

        // If both cart and orders are empty
        if (cart.length === 0 && validOrders.length === 0) {
            console.log('Cart and order history are empty.');
            content = '<p class="error-message">No orders found</p>';
        }

        orderConfirmation.innerHTML = content;
        console.log('--- displayOrderConfirmation End ---');

    } catch (error) {
        console.error('Error displaying order confirmation:', error);
        const orderConfirmation = document.getElementById('orderConfirmation');
        if (orderConfirmation) {
            orderConfirmation.innerHTML = `
                <div class="error-message">
                    <p>Error loading order data: ${sanitizeInput459(error.message)}</p>
                    <p>Please try refreshing the page or contact support if the problem persists.</p>
                </div>
            `;
        }
        console.log('--- displayOrderConfirmation End with Error ---');
    }
}

// Edit order - redirect to cart page
window.editOrder = function() {
    window.location.href = 'cart.html';
};

// Confirm order
window.confirmOrder459 = function() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const username = sessionStorage.getItem('username');
    
    if (cart.length === 0) {
        alert('Your cart is empty');
        return;
    }

    // Calculate total price
    let totalPrice = 0;
    const allItems = JSON.parse(localStorage.getItem('allItems')) || [];
    cart.forEach(item => {
        const foundItem = allItems.find(i => i.id === item.id);
        if (foundItem && foundItem.price !== undefined) {
            totalPrice += foundItem.price * item.quantity;
        }
    });

    // Create order object
    const order = {
        orderId: generateOrderId459(),
        username: username,
        items: cart,
        totalPrice: totalPrice,
        orderDate: new Date().toISOString()
    };

    // Validate order data
    if (!validateOrderData459(order)) {
        alert('Invalid order data');
        return;
    }

    // Get existing orders or initialize empty array
    let orders = JSON.parse(localStorage.getItem('orders') || '[]');
    orders.push(order);

    // Validate and clean order history
    if (!validateOrderHistory459(orders)) {
        console.error('Invalid order history data');
        localStorage.removeItem('orders');
        orders = [order];
    }

    // Save to localStorage
    localStorage.setItem('orders', JSON.stringify(orders));

    // Clear cart after successful order
    localStorage.removeItem('cart');
    
    alert('Order has been confirmed successfully!');
    window.location.href = 'checkout.html';
};

// Download orders as JSON
window.downloadOrders459 = function() {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    if (orders.length === 0) {
        alert('No order history to download');
        return;
    }

    // Validate order data
    if (!validateOrderHistory459(orders)) {
        alert('Invalid order data found');
        return;
    }

    const dataStr = JSON.stringify(orders, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'order_history.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
};

// Clear local storage
window.clearStorage459 = function() {
    if (confirm('Are you sure you want to clear all cart and order history data?')) {
        localStorage.removeItem('cart');
        localStorage.removeItem('orders');
        displayOrderConfirmation();
        alert('Cart and order history data have been cleared');
    }
};

// Save order to localStorage
window.saveOrder459 = function() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const username = sessionStorage.getItem('username');
    
    if (cart.length === 0) {
        alert('Your cart is empty');
        return;
    }

    // Calculate total price
    let totalPrice = 0;
    const allItems = JSON.parse(localStorage.getItem('allItems')) || [];
    cart.forEach(item => {
        const foundItem = allItems.find(i => i.id === item.id);
        if (foundItem && foundItem.price !== undefined) {
            totalPrice += foundItem.price * item.quantity;
        }
    });

    // Create order object
    const order = {
        orderId: generateOrderId459(),
        username: username,
        items: cart,
        totalPrice: totalPrice,
        orderDate: new Date().toISOString()
    };

    // Validate order data
    if (!validateOrderData459(order)) {
        alert('Invalid order data');
        return;
    }

    // Get existing orders or initialize empty array
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    orders.push(order);

    // Validate and clean order history
    if (!validateOrderHistory459(orders)) {
        console.error('Invalid order history data');
        localStorage.removeItem('orders');
        orders = [order];
    }

    // Save to localStorage
    localStorage.setItem('orders', JSON.stringify(orders));

    // Clear cart after successful order
    localStorage.removeItem('cart');
    
    alert('Order has been saved successfully!');
    displayOrderConfirmation();
};

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    displayOrderConfirmation();
    
    // Add save order button event listener
    const saveOrderButton = document.createElement('button');
    saveOrderButton.className = 'btn-primary';
    saveOrderButton.textContent = 'Save Order';
    saveOrderButton.onclick = saveOrder459;
    
    const checkoutButtons = document.querySelector('.checkout-buttons');
    if (checkoutButtons) {
        checkoutButtons.insertBefore(saveOrderButton, checkoutButtons.firstChild);
    }
});

})();
