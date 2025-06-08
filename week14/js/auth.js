// Security configuration
const SECURITY_CONFIG = {
    SALT: 'SydneyCloudSkills2024', // Should use environment variables in production
    TOKEN_EXPIRY: 30 * 60 * 1000, // 30 minutes
    PASSWORD_MIN_LENGTH: 8,
    PASSWORD_MAX_LENGTH: 128,
    USERNAME_MIN_LENGTH: 3,
    USERNAME_MAX_LENGTH: 20,
    EMAIL_MAX_LENGTH: 254
};

// Input validation function
function sanitizeInput(input) {
    if (typeof input !== 'string') return '';
    // Remove HTML tags and special characters
    return input.replace(/[<>'"]/g, '');
}

// Password encryption function
function encryptPassword459(password) {
   
    return CryptoJS.SHA256(password + SECURITY_CONFIG.SALT).toString();
}

// Generate security token
function generateToken459() {
    // Generate a more secure random token
    const array = new Uint32Array(8);
    window.crypto.getRandomValues(array);
    return Array.from(array, dec => ('0' + dec.toString(16)).substr(-2)).join('');
}

// Validate password strength
function validatePasswordStrength459(password) {
    if (!password || typeof password !== 'string') return false;
    
    if (password.length < SECURITY_CONFIG.PASSWORD_MIN_LENGTH || 
        password.length > SECURITY_CONFIG.PASSWORD_MAX_LENGTH) {
        return false;
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
}

// Validate username
function validateUsername459(username) {
    if (!username || typeof username !== 'string') return false;
    
    if (username.length < SECURITY_CONFIG.USERNAME_MIN_LENGTH || 
        username.length > SECURITY_CONFIG.USERNAME_MAX_LENGTH) {
        return false;
    }

    // Only allow alphanumeric characters and underscores
    return /^[a-zA-Z0-9_]+$/.test(username);
}

// Validate email
function validateEmail459(email) {
    if (!email || typeof email !== 'string') return false;
    
    if (email.length > SECURITY_CONFIG.EMAIL_MAX_LENGTH) return false;

    // RFC 5322 compliant email validation
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegex.test(email);
}

// Check user login status
function checkAuth459() {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
    const loginTime = sessionStorage.getItem('loginTime');
    const token = sessionStorage.getItem('token');
    
    if (!isLoggedIn || !loginTime || !token) {
        return false;
    }

    // Check if login time has expired
    const currentTime = new Date().getTime();
    if (currentTime - parseInt(loginTime) > SECURITY_CONFIG.TOKEN_EXPIRY) {
        logout459();
        return false;
    }

    // Validate token format
    if (!/^[0-9a-f]{16}$/.test(token)) {
        logout459();
        return false;
    }

    return true;
}

// Handle login
function handleLogin459(e) {
    e.preventDefault();
    
    const username = sanitizeInput(document.getElementById('loginUsername').value);
    const password = document.getElementById('loginPassword').value;

    console.log('Login information:', {
        username,
        passwordLength: password.length
    });

    // Validate input
    if (!validateUsername459(username)) {
        alert('Invalid username format');
        return;
    }

    // Get user data
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    console.log('Stored user data:', users);
    
    const encryptedPassword = encryptPassword459(password);
    console.log('Encrypted password:', encryptedPassword);
    
    // Verify username and password
    const user = users.find(u => {
        console.log('Comparing user:', {
            storedUsername: u.username,
            inputUsername: username,
            storedPassword: u.password,
            inputPassword: encryptedPassword,
            usernameMatch: u.username === username,
            passwordMatch: u.password === encryptedPassword
        });
        return u.username === username && u.password === encryptedPassword;
    });
    
    if (user) {
        const token = generateToken459();
        sessionStorage.setItem('isLoggedIn', 'true');
        sessionStorage.setItem('username', username);
        sessionStorage.setItem('loginTime', new Date().getTime().toString());
        sessionStorage.setItem('token', token);
        
        alert('Login successful!');
        window.location.href = 'cart.html';
    } else {
        alert('Invalid username or password');
    }
}

// Handle registration
function handleRegister459(e) {
    e.preventDefault();
    
    const username = sanitizeInput(document.getElementById('regUsername').value);
    const email = sanitizeInput(document.getElementById('regEmail').value);
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;

    console.log('Registration information:', {
        username,
        email,
        passwordLength: password.length
    });

    // Validate inputs
    if (!validateUsername459(username)) {
        alert('Username must be 3-20 characters long and contain only letters, numbers, and underscores');
        return;
    }

    if (!validatePasswordStrength459(password)) {
        alert('Password must be 8-128 characters long and include uppercase, lowercase, number and special character');
        return;
    }

    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }

    if (!validateEmail459(email)) {
        alert('Please enter a valid email address');
        return;
    }

    // Get existing user data
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    console.log('Current user list:', users);

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

    const encryptedPassword = encryptPassword459(password);
    console.log('Encrypted password:', encryptedPassword);

    // Add new user
    const newUser = {
        username,
        email,
        password: encryptedPassword,
        registrationDate: new Date().toISOString(),
        lastLogin: null,
        failedLoginAttempts: 0
    };

    users.push(newUser);
    console.log('Updated user list:', users);

    // Save user data
    localStorage.setItem('users', JSON.stringify(users));
    alert('Registration successful! Please login');
    
    // Clear form
    document.getElementById('registerForm').reset();
}

// Check login time and auto logout
function checkLoginTimeout459() {
    const loginTime = sessionStorage.getItem('loginTime');
    if (loginTime) {
        const currentTime = new Date().getTime();
        if (currentTime - parseInt(loginTime) > SECURITY_CONFIG.TOKEN_EXPIRY) {
            logout459();
            alert('You have been automatically logged out due to inactivity');
        }
    }
}

// Check login status every minute
setInterval(checkLoginTimeout459, 60 * 1000);

// Logout
function logout459() {
    sessionStorage.clear();
    localStorage.removeItem('users');
    localStorage.removeItem('orders');
    localStorage.removeItem('cart');
    window.location.href = 'index.html';
}

// User authentication functionality
document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    const loginForm = document.getElementById('loginForm');
    const userStatus = document.getElementById('userStatus');

    // Update user status display
    function updateUserStatus459() {
        const username = sessionStorage.getItem('username');
        if (userStatus) {
            userStatus.textContent = username || 'Guest';
        }
    }

    // Initialize user status
    updateUserStatus459();

    // Register form submission handler
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister459);
    }

    // Login form submission handler
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin459);
    }

    // Check user login status
    function checkAuth459() {
        const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
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
    checkAuth459();

    // Password validation functions
    function validatePassword459(password) {
        const requirements = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /[0-9]/.test(password),
            special: /[@$!%*?&]/.test(password)
        };

        // Update UI for each requirement
        Object.keys(requirements).forEach(req => {
            const element = document.getElementById(req);
            if (element) {
                if (requirements[req]) {
                    element.classList.add('valid');
                    element.classList.remove('invalid');
                } else {
                    element.classList.add('invalid');
                    element.classList.remove('valid');
                }
            }
        });

        return Object.values(requirements).every(Boolean);
    }

    // Add password validation event listener
    const passwordInput = document.getElementById('regPassword');
    if (passwordInput) {
        passwordInput.addEventListener('input', (e) => {
            validatePassword459(e.target.value);
        });
    }
}); 
