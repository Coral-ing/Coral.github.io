// Load and display courses
async function loadCourses() {
    try {
        const container = document.getElementById('coursesContainer');
        if (!container) {
            return;
        }
        
        const response = await fetch('./data/courses.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const coursesData = await response.json();
        
        if (!coursesData.courses || !Array.isArray(coursesData.courses)) {
            throw new Error('Invalid courses data format');
        }

        container.innerHTML = coursesData.courses.map(course => `
            <div class="course-card">
                <div class="course-image">
                    <img src="${course.image}" alt="${course.title}" onerror="this.src='images/placeholder.jpg'">
                </div>
                <div class="course-content">
                    <h2>${course.title}</h2>
                    <span class="course-id">Course ID: ${course.id}</span>
                    <div class="duration">Duration: ${course.duration}</div>
                    <div class="assessments">
                        <h3>Assessments</h3>
                        <ul class="assessments-list">
                            ${course.assessments.map(assessment => `<li>${assessment}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="projects">
                        <h3>Projects</h3>
                        <ul class="projects-list">
                            ${course.projects.map(project => `<li>${project}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading courses:', error);
        const container = document.getElementById('coursesContainer');
        if (container) {
            container.innerHTML = `
                <div class="error-message">
                    <p>Error loading courses: ${error.message}</p>
                    <p>Please try refreshing the page or contact support if the problem persists.</p>
                </div>
            `;
        }
    }
}

// Load and display resources
async function loadResources() {
    try {
        const container = document.getElementById('resourcesContainer');
         if (!container) {
            return;
        }

        const response = await fetch('./data/resources.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const resourcesData = await response.json();
        
        if (!resourcesData.resources || !Array.isArray(resourcesData.resources)) {
            throw new Error('Invalid resources data format');
        }

        container.innerHTML = resourcesData.resources.map(resource => `
            <div class="resource-card">
                <div class="resource-image">
                    <img src="${resource.image}" alt="${resource.title}" onerror="this.src='images/placeholder.jpg'">
                </div>
                <div class="resource-content">
                    <h2>${resource.title}</h2>
                    <span class="resource-id">Resource ID: ${resource.id}</span>
                    <p class="description">${resource.description}</p>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading resources:', error);
        const container = document.getElementById('resourcesContainer');
        if (container) {
            container.innerHTML = `
                <div class="error-message">
                    <p>Error loading resources: ${error.message}</p>
                    <p>Please try refreshing the page or contact support if the problem persists.</p>
                </div>
            `;
        }
    }
}

// Add item to cart
function addToCart459(itemId) {
    if (!isLoggedIn459()) {
        alert('Please login to add items to cart');
        return;
    }
    
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find(item => item.id === itemId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ id: itemId, quantity: 1 });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    alert('Item added to cart!');
}

// Check login status
function isLoggedIn459() {
    return localStorage.getItem('isLoggedIn') === 'true';
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    loadCourses();
    loadResources();
}); 
