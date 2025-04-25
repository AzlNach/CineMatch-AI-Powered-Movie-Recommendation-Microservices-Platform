/**
 * Main JavaScript file for CineWorld Cinema Management Website
 * Contains common functionality used across the site
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize mobile menu toggle functionality
    initMobileMenu();
    
    // Initialize any carousels on the page
    initCarousels();
    
    // Check if user is logged in
    checkAuthStatus();
});

/**
 * Initialize mobile menu toggle functionality
 */
function initMobileMenu() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileMenuToggle && navMenu) {
        mobileMenuToggle.addEventListener('click', function() {
            mobileMenuToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
            
            // Prevent scrolling when menu is open
            if (navMenu.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!navMenu.contains(event.target) && !mobileMenuToggle.contains(event.target) && navMenu.classList.contains('active')) {
                mobileMenuToggle.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }
}

/**
 * Initialize any carousels on the page
 * Simple carousel implementation for showcased movies or theaters
 */
function initCarousels() {
    // Simple carousel implementation if needed
    // This would be expanded for specific carousel components
}

/**
 * Check if user is authenticated and update UI accordingly
 */
function checkAuthStatus() {
    const userData = localStorage.getItem('userData');
    const authButtons = document.querySelector('.auth-buttons');
    
    if (userData && authButtons) {
        // Create user profile button when logged in
        const userObj = JSON.parse(userData);
        authButtons.innerHTML = `
            <div class="user-profile">
                <span class="user-greeting">Hi, ${userObj.fullName.split(' ')[0]}</span>
                <div class="user-menu">
                    <a href="pages/profile.html">Profil Saya</a>
                    <a href="pages/my-tickets.html">Tiket Saya</a>
                    <a href="#" id="logoutBtn">Keluar</a>
                </div>
            </div>
        `;
        
        // Add logout functionality
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function(e) {
                e.preventDefault();
                localStorage.removeItem('userData');
                localStorage.removeItem('userToken');
                window.location.href = 'index.html';
            });
        }
    }
}

/**
 * Format currency to Indonesian Rupiah
 * @param {number} amount - The amount to format
 * @return {string} Formatted currency string
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);
}

/**
 * Format date to Indonesian format
 * @param {string|Date} date - The date to format
 * @return {string} Formatted date string
 */
function formatDate(date) {
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    
    return new Date(date).toLocaleDateString('id-ID', options);
}

/**
 * Show toast notification
 * @param {string} message - The message to display
 * @param {string} type - The type of notification (success, error, warning)
 * @param {number} duration - How long to show the notification in ms
 */
function showNotification(message, type = 'success', duration = 3000) {
    // Remove any existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Add active class after a small delay to trigger animation
    setTimeout(() => {
        notification.classList.add('active');
    }, 10);
    
    // Auto-remove after duration
    setTimeout(() => {
        notification.classList.remove('active');
        setTimeout(() => {
            notification.remove();
        }, 300); // Wait for fade out animation
    }, duration);
}

/**
 * Validate form inputs
 * @param {string} type - Type of validation (email, password, phone, etc.)
 * @param {string} value - The value to validate
 * @return {boolean} Whether validation passed
 */
function validateInput(type, value) {
    switch(type) {
        case 'email':
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        case 'password':
            return value.length >= 6;
        case 'phone':
            return /^(\+62|62|0)[0-9]{9,12}$/.test(value);
        case 'required':
            return value.trim() !== '';
        default:
            return true;
    }
}

/**
 * Get URL parameters
 * @param {string} param - The parameter to retrieve
 * @return {string|null} The parameter value or null
 */
function getUrlParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}