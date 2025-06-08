// Load and display all items in the cart view
async function loadAndDisplayAllItems() {
    try {
        console.log('Starting loadAndDisplayAllItems function...');
        
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
        console.log('All available items (courses + resources):', allItems);

        const cartContainer = document.getElementById('cartItems');
        if (!cartContainer) {
            console.error('Cart items container not found');
            return;
        }
        console.log('Cart items container found:', cartContainer);

        if (allItems.length === 0) {
            cartContainer.innerHTML = '<p>No items available to display.</p>';
            document.getElementById('checkoutBtn').style.display = 'none';
            return;
        }

        cartContainer.innerHTML = allItems.map(item => {
            if (item.price !== undefined) {
                const itemType = coursesData.courses.some(c => c.id === item.id) ? 'courses' : 'resources';
                
                return `
                    <div class="cart-item" data-item-id="${item.id}">
                        <div class="cart-item-image">
                            <img src="${item.image}" alt="${item.title}" onerror="this.src='../images/placeholder.jpg'">
                        </div>
                        <div class="cart-item-details">
                            <h3>${item.title}</h3>
                            <p>${itemType.slice(0, -1).charAt(0).toUpperCase() + itemType.slice(0, -1).slice(1)} ID: ${item.id}</p>
                            ${item.duration ? `<p>Duration: ${item.duration}</p>` : ''}
                            ${item.description ? `<p>Description: ${item.description}</p>` : ''}
                            <p>Price: A$${item.price.toFixed(2)}</p>
                            <div class="quantity-control">
                                <button class="quantity-btn minus" data-item-id="${item.id}">-</button>
                                <input type="number" min="0" value="0" 
                                    data-item-id="${item.id}"
                                    class="quantity-input">
                                <button class="quantity-btn plus" data-item-id="${item.id}">+</button>
                            </div>
                            <p>Subtotal: A$<span class="item-subtotal">0.00</span></p>
                            <button class="remove-btn" data-item-id="${item.id}">Remove</button>
                        </div>
                    </div>
                `;
            }
            console.warn(`Item with ID ${item.id} missing price.`);
            return ''; // Return empty string for items without price
        }).join('');

        // Add event listeners for quantity controls and remove buttons
        setupCartEventListeners(allItems);

        // Calculate initial total
        updateCartTotal();

        // Show checkout button if items are available
        const checkoutBtn = document.getElementById('checkoutBtn');
        if (checkoutBtn) {
             checkoutBtn.style.display = allItems.length > 0 ? 'block' : 'none';
        }

        console.log('Finished loadAndDisplayAllItems function.');

    } catch (error) {
        console.error('Error loading and displaying items:', error);
        const cartContainer = document.getElementById('cartItems');
        if (cartContainer) {
            cartContainer.innerHTML = `
                <div class="error-message">
                    <p>Error loading items: ${error.message}</p>
                    <p>Please try refreshing the page or contact support if the problem persists.</p>
                </div>
            `;
        }
         document.getElementById('checkoutBtn').style.display = 'none';
    }
}

// Setup event listeners for quantity buttons and remove buttons
function setupCartEventListeners(allItems) {
    document.querySelectorAll('.quantity-btn.minus').forEach(button => {
        button.addEventListener('click', () => {
            const itemId = button.dataset.itemId;
            updateQuantity(itemId, -1);
        });
    });

    document.querySelectorAll('.quantity-btn.plus').forEach(button => {
        button.addEventListener('click', () => {
            const itemId = button.dataset.itemId;
            updateQuantity(itemId, 1);
        });
    });

    document.querySelectorAll('.quantity-input').forEach(input => {
        input.addEventListener('change', (e) => {
            const itemId = input.dataset.itemId;
            updateQuantity(itemId, parseInt(e.target.value) - parseInt(input.value)); // Calculate difference
        });
        input.addEventListener('keyup', (e) => {
             if (e.key === 'Enter') {
                const itemId = input.dataset.itemId;
                updateQuantity(itemId, parseInt(e.target.value) - parseInt(input.value));
             }
        });
         input.addEventListener('blur', (e) => {
            const itemId = input.dataset.itemId;
            updateQuantity(itemId, parseInt(e.target.value) - parseInt(input.value));
         });
    });

    document.querySelectorAll('.remove-btn').forEach(button => {
        button.addEventListener('click', () => {
            const itemId = button.dataset.itemId;
            removeItem(itemId);
        });
    });
}

// Update item quantity based on button click or input change
function updateQuantity(itemId, change) {
    const quantityInput = document.querySelector(`.quantity-input[data-item-id="${itemId}"]`);
    if (!quantityInput) return;

    let currentQuantity = parseInt(quantityInput.value);
    let newQuantity = currentQuantity + change;

    if (newQuantity < 0) newQuantity = 0;

    quantityInput.value = newQuantity;
    updateItemAndTotal(itemId, newQuantity);
}

// Remove item (set quantity to 0)
function removeItem(itemId) {
    const quantityInput = document.querySelector(`.quantity-input[data-item-id="${itemId}"]`);
    if (!quantityInput) return;

    quantityInput.value = 0;
    updateItemAndTotal(itemId, 0);
}

// Update item subtotal and recalculate total
async function updateItemAndTotal(itemId, quantity) {
     const [coursesResponse, resourcesResponse] = await Promise.all([
         fetch('./data/courses.json'),
         fetch('./data/resources.json')
     ]);

     if (!coursesResponse.ok) throw new Error(`HTTP error! status: ${coursesResponse.status} for courses.json`);
     if (!resourcesResponse.ok) throw new Error(`HTTP error! status: ${resourcesResponse.status} for resources.json`);

     const coursesData = await coursesResponse.json();
     const resourcesData = await resourcesResponse.json();
     const allItems = [...coursesData.courses, ...resourcesData.resources];

    const item = allItems.find(i => i.id === itemId);
    const subtotalElement = document.querySelector(`.cart-item[data-item-id="${itemId}"] .item-subtotal`);

    if (item && item.price !== undefined && subtotalElement) {
        const subtotal = item.price * quantity;
        subtotalElement.textContent = subtotal.toFixed(2);
    }

    updateCartTotal();
}

// Calculate and update the total price of all items in the cart view
function updateCartTotal() {
    let total = 0;
    document.querySelectorAll('.cart-item').forEach(itemElement => {
        const itemId = itemElement.dataset.itemId;
        const quantityInput = itemElement.querySelector('.quantity-input');
        const subtotalElement = itemElement.querySelector('.item-subtotal');

        if (quantityInput && subtotalElement) {
            const quantity = parseInt(quantityInput.value);
            const subtotal = parseFloat(subtotalElement.textContent);
            if (!isNaN(quantity) && !isNaN(subtotal)) {
                 // In this model, the subtotal is already calculated based on quantity * price in updateItemAndTotal
                 // So we just sum the subtotals.
                total += subtotal;
            }
        }
    });

    const totalElement = document.getElementById('cartTotal');
    if (totalElement) {
        totalElement.textContent = total.toFixed(2);
    }
}

// Check login status (retained for restricted access)
function isLoggedIn459() {
    return sessionStorage.getItem('isLoggedIn') === 'true';
}

// Proceed to checkout
function proceedToCheckout459() {
    if (!isLoggedIn459()) {
        alert('Please login to proceed to checkout');
        return;
    }
    // In this model, the 'cart' state is on the page, not in localStorage
    // We might need to gather the current quantities from the inputs to save to localStorage for checkout
    const currentCartState = [];
    document.querySelectorAll('.cart-item').forEach(itemElement => {
        const itemId = itemElement.dataset.itemId;
        const quantityInput = itemElement.querySelector('.quantity-input');
        const quantity = parseInt(quantityInput.value);
        if (!isNaN(quantity) && quantity > 0) {
            currentCartState.push({ id: itemId, quantity: quantity });
        }
    });

    if (currentCartState.length === 0) {
        alert('Your cart is empty. Please add items before proceeding to checkout.');
        return;
    }

    // Optionally save the current state to localStorage for the checkout page
    localStorage.setItem('cart', JSON.stringify(currentCartState));

    window.location.href = 'checkout.html';
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    loadAndDisplayAllItems();
    
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', proceedToCheckout459);
    }
});
