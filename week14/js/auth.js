// Check user login status
function checkAuth() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const restrictedLinks = document.querySelectorAll('.restricted');
    
    restrictedLinks.forEach(link => {
        if (isLoggedIn) {
            link.classList.remove('restricted');
        } else {
            link.classList.add('restricted');
        }
    });
}

// Handle login
function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    // Get user data
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Verify username and password
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('username', username);
        // Record login time
        localStorage.setItem('loginTime', new Date().getTime());
        alert('Login successful!');
        window.location.href = 'cart.html';
    } else {
        alert('Invalid username or password');
    }
}

// Handle registration
function handleRegister(e) {
    e.preventDefault();
    
    const username = document.getElementById('registerUsername').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Validate password length
    if (password.length < 6) {
        alert('Password must be at least 6 characters long');
        return;
    }

    // Validate password match
    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Please enter a valid email address');
        return;
    }

    // Get existing user data
    const users = JSON.parse(localStorage.getItem('users') || '[]');

    // Check if username exists
    if (users.some(user => user.username === username)) {
        alert('Username already exists');
        return;
    }

    // Check if email exists
    if (users.some(user => user.email === email)) {
        alert('Email already registered');
        return;
    }

    // Add new user
    users.push({
        username,
        email,
        password // In real applications, password should be encrypted
    });

    // Save user data
    localStorage.setItem('users', JSON.stringify(users));
    alert('Registration successful! Please login');
    
    // Clear form
    document.getElementById('registerForm').reset();
}

// Check login time and auto logout
function checkLoginTimeout() {
    const loginTime = localStorage.getItem('loginTime');
    if (loginTime) {
        const currentTime = new Date().getTime();
        const timeDiff = currentTime - parseInt(loginTime);
        // 30 minutes = 30 * 60 * 1000 milliseconds
        if (timeDiff > 30 * 60 * 1000) {
            logout();
            alert('You have been automatically logged out due to inactivity');
        }
    }
}

// Check login status every minute
setInterval(checkLoginTimeout, 60 * 1000);

// Logout
function logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    localStorage.removeItem('loginTime');
    window.location.href = 'index.html';
}

// User authentication functionality
document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    const loginForm = document.getElementById('loginForm');
    const userStatus = document.getElementById('userStatus');

    // Update user status display
    function updateUserStatus() {
        const username = localStorage.getItem('username');
        if (userStatus) {
            userStatus.textContent = username || 'Guest';
        }
    }

    // Initialize user status
    updateUserStatus();

    // Register form submission handler
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('regUsername').value;
            const email = document.getElementById('regEmail').value;
            const password = document.getElementById('regPassword').value;
            const confirmPassword = document.getElementById('regConfirmPassword').value;

            if (password !== confirmPassword) {
                alert('Passwords do not match!');
                return;
            }

            // Get existing user data
            const users = JSON.parse(localStorage.getItem('users')) || [];

            // Check if username exists
            if (users.some(user => user.username === username)) {
                alert('Username already exists!');
                return;
            }

            // Add new user
            users.push({
                username,
                email,
                password
            });

            // Save user data
            localStorage.setItem('users', JSON.stringify(users));
            alert('Registration successful!');
            registerForm.reset();
        });
    }

    // Login form submission handler
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Check user login status
    function checkAuth() {
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        const restrictedLinks = document.querySelectorAll('.restricted');

        restrictedLinks.forEach(link => {
            if (!isLoggedIn) {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    alert('Please login first!');
                    window.location.href = 'index.html';
                });
            }
        });
    }

    // Initialize auth check
    checkAuth();
}); 
