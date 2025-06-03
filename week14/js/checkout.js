// Check user login status
function checkAuth() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const username = localStorage.getItem('username');
    const userStatus = document.getElementById('userStatus');
    
    if (!isLoggedIn) {
        window.location.href = 'index.html';
        return;
    }

    // Update user status display
    if (userStatus) {
        userStatus.textContent = username || 'Guest';
    }
}

// Display order confirmation
async function displayOrderConfirmation() {
    try {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        
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

        const orderConfirmation = document.getElementById('orderConfirmation');
        if (!orderConfirmation) return;

        if (cart.length === 0) {
            orderConfirmation.innerHTML = '<p class="error-message">Your cart is empty</p>';
            return;
        }

        let total = 0;
        const orderItems = cart.map(item => {
            const foundItem = allItems.find(i => i.id === item.id);
            
            if (foundItem && foundItem.price !== undefined) {
                const itemTotal = foundItem.price * item.quantity;
                total += itemTotal;
                const itemType = coursesData.courses.some(c => c.id === item.id) ? 'Course' : 'Resource';

                return `
                    <div class="order-item">
                        <h3>${foundItem.title}</h3>
                        <p>${itemType} ID: ${foundItem.id}</p>
                        <p>Quantity: ${item.quantity}</p>
                        <p>Price: A$${foundItem.price.toFixed(2)}</p>
                        <p>Subtotal: A$${itemTotal.toFixed(2)}</p>
                    </div>
                `;
            }
            return ''; // Return empty string for items not found or missing price
        }).join('');

        orderConfirmation.innerHTML = `
            ${orderItems}
            <div class="order-total">
                <h3>Total Amount: A$${total.toFixed(2)}</h3>
            </div>
        `;

    } catch (error) {
        console.error('Error displaying order confirmation:', error);
        const orderConfirmation = document.getElementById('orderConfirmation');
        if (orderConfirmation) {
            orderConfirmation.innerHTML = `
                <div class="error-message">
                    <p>Error loading order data: ${error.message}</p>
                    <p>Please try refreshing the page or contact support if the problem persists.</p>
                </div>
            `;
        }
    }
}

// Download orders as JSON
function downloadOrders() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
     if (cart.length === 0) {
         alert('No orders to download');
         return;
     }
    const dataStr = JSON.stringify(cart, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'orders.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

// Clear local storage
function clearStorage() {
    if (confirm('Are you sure you want to clear all cart and order data?')) {
        localStorage.removeItem('cart');
        displayOrderConfirmation();
        alert('Cart and order data have been cleared');
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    displayOrderConfirmation();
});
