/**
 * LocalStorage utility functions for CineWorld Cinema Management Website
 * Used for client-side data storage across sessions
 */

const StorageManager = {
    /**
     * Save data to localStorage
     * @param {string} key - Storage key
     * @param {any} data - Data to store (will be serialized)
     */
    save: function(key, data) {
        try {
            const serializedData = JSON.stringify(data);
            localStorage.setItem(key, serializedData);
            return true;
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            return false;
        }
    },
    
    /**
     * Get data from localStorage
     * @param {string} key - Storage key
     * @param {any} defaultValue - Default value if key doesn't exist
     * @return {any} The stored data or defaultValue
     */
    get: function(key, defaultValue = null) {
        try {
            const serializedData = localStorage.getItem(key);
            if (serializedData === null) {
                return defaultValue;
            }
            return JSON.parse(serializedData);
        } catch (error) {
            console.error('Error getting from localStorage:', error);
            return defaultValue;
        }
    },
    
    /**
     * Remove data from localStorage
     * @param {string} key - Storage key
     */
    remove: function(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error removing from localStorage:', error);
            return false;
        }
    },
    
    /**
     * Clear all data from localStorage
     */
    clear: function() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Error clearing localStorage:', error);
            return false;
        }
    },
    
    /**
     * Check if a key exists in localStorage
     * @param {string} key - Storage key
     * @return {boolean} Whether the key exists
     */
    exists: function(key) {
        return localStorage.getItem(key) !== null;
    },
    
    /**
     * User authentication functions
     */
    auth: {
        /**
         * Save user data to localStorage
         * @param {object} userData - User data to store
         * @param {string} token - Authentication token
         */
        saveUser: function(userData, token = null) {
            StorageManager.save('userData', userData);
            if (token) {
                StorageManager.save('userToken', token);
            }
        },
        
        /**
         * Get current user data
         * @return {object|null} User data or null if not logged in
         */
        getUser: function() {
            return StorageManager.get('userData');
        },
        
        /**
         * Get authentication token
         * @return {string|null} Token or null if not available
         */
        getToken: function() {
            return StorageManager.get('userToken');
        },
        
        /**
         * Check if user is logged in
         * @return {boolean} Whether user is logged in
         */
        isLoggedIn: function() {
            return StorageManager.exists('userData');
        },
        
        /**
         * Logout user by removing stored data
         */
        logout: function() {
            StorageManager.remove('userData');
            StorageManager.remove('userToken');
        }
    },
    
    /**
     * Movie booking functions
     */
    booking: {
        /**
         * Save selected theater
         * @param {object} theater - Theater data
         */
        saveTheater: function(theater) {
            StorageManager.save('selectedTheater', theater);
        },
        
        /**
         * Get selected theater
         * @return {object|null} Theater data or null
         */
        getTheater: function() {
            return StorageManager.get('selectedTheater');
        },
        
        /**
         * Save selected movie and showtime
         * @param {object} data - Movie and showtime data
         */
        saveMovieSelection: function(data) {
            StorageManager.save('movieSelection', data);
        },
        
        /**
         * Get selected movie and showtime
         * @return {object|null} Movie selection data or null
         */
        getMovieSelection: function() {
            return StorageManager.get('movieSelection');
        },
        
        /**
         * Save selected seats
         * @param {array} seats - Selected seats
         */
        saveSeats: function(seats) {
            StorageManager.save('selectedSeats', seats);
        },
        
        /**
         * Get selected seats
         * @return {array|null} Selected seats or null
         */
        getSeats: function() {
            return StorageManager.get('selectedSeats', []);
        },
        
        /**
         * Save booking information
         * @param {object} bookingInfo - Complete booking information
         */
        saveBooking: function(bookingInfo) {
            // Get existing bookings
            const bookings = StorageManager.get('bookings', []);
            
            // Add new booking with unique ID
            bookingInfo.id = Date.now().toString();
            bookingInfo.timestamp = new Date().toISOString();
            
            bookings.push(bookingInfo);
            StorageManager.save('bookings', bookings);
            
            // Return the booking ID
            return bookingInfo.id;
        },
        
        /**
         * Get all user bookings
         * @return {array} Array of bookings
         */
        getAllBookings: function() {
            return StorageManager.get('bookings', []);
        },
        
        /**
         * Get a specific booking by ID
         * @param {string} id - Booking ID
         * @return {object|null} Booking info or null
         */
        getBookingById: function(id) {
            const bookings = StorageManager.get('bookings', []);
            return bookings.find(booking => booking.id === id) || null;
        }
    }
};