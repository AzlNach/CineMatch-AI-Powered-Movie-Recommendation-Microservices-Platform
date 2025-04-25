/**
 * Validation utility functions for CineWorld Cinema Management Website
 * Used for validating form inputs across the site
 */

/**
 * Object containing validation methods
 */
const Validator = {
    /**
     * Check if value is not empty
     * @param {string} value - The value to validate
     * @return {boolean} Whether validation passed
     */
    required: function(value) {
        return value.trim() !== '';
    },
    
    /**
     * Validate email format
     * @param {string} email - The email to validate
     * @return {boolean} Whether validation passed
     */
    email: function(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    },
    
    /**
     * Validate password strength
     * @param {string} password - The password to validate
     * @param {object} options - Options for validation (min length, require numbers, etc.)
     * @return {boolean} Whether validation passed
     */
    password: function(password, options = {}) {
        const defaults = {
            minLength: 6,
            requireUppercase: false,
            requireNumbers: false,
            requireSpecial: false
        };
        
        const config = { ...defaults, ...options };
        
        if (password.length < config.minLength) {
            return false;
        }
        
        if (config.requireUppercase && !/[A-Z]/.test(password)) {
            return false;
        }
        
        if (config.requireNumbers && !/[0-9]/.test(password)) {
            return false;
        }
        
        if (config.requireSpecial && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            return false;
        }
        
        return true;
    },
    
    /**
     * Validate phone number (Indonesian format)
     * @param {string} phone - The phone number to validate
     * @return {boolean} Whether validation passed
     */
    phone: function(phone) {
        // Supports formats: +62812345678, 62812345678, 0812345678
        const regex = /^(\+62|62|0)[0-9]{9,12}$/;
        return regex.test(phone.replace(/\s|-/g, ''));
    },
    
    /**
     * Check if value matches a specific pattern
     * @param {string} value - The value to validate
     * @param {RegExp} pattern - The regex pattern to match
     * @return {boolean} Whether validation passed
     */
    pattern: function(value, pattern) {
        return pattern.test(value);
    },
    
    /**
     * Check if value is a number within range
     * @param {string|number} value - The value to validate
     * @param {object} options - Options for validation (min, max)
     * @return {boolean} Whether validation passed
     */
    number: function(value, options = {}) {
        const num = parseFloat(value);
        
        if (isNaN(num)) {
            return false;
        }
        
        if (options.min !== undefined && num < options.min) {
            return false;
        }
        
        if (options.max !== undefined && num > options.max) {
            return false;
        }
        
        return true;
    },
    
    /**
     * Check if two values match (e.g., password confirmation)
     * @param {string} value1 - First value
     * @param {string} value2 - Second value to compare
     * @return {boolean} Whether values match
     */
    match: function(value1, value2) {
        return value1 === value2;
    },
    
    /**
     * Validate Indonesian ID (KTP) number
     * @param {string} idNumber - The ID number to validate
     * @return {boolean} Whether validation passed
     */
    ktpNumber: function(idNumber) {
        // KTP is 16 digits
        return /^\d{16}$/.test(idNumber.trim());
    }
};

/**
 * Form validator class for handling form validation
 */
class FormValidator {
    /**
     * Create a new form validator
     * @param {HTMLFormElement} form - The form element to validate
     * @param {object} rules - Validation rules
     * @param {object} messages - Custom error messages
     */
    constructor(form, rules, messages = {}) {
        this.form = form;
        this.rules = rules;
        this.messages = messages;
        this.errors = {};
        
        this.defaultMessages = {
            required: 'Kolom ini harus diisi',
            email: 'Masukkan alamat email yang valid',
            password: 'Password harus minimal 6 karakter',
            phone: 'Masukkan nomor telepon yang valid',
            match: 'Kolom ini harus sama',
            pattern: 'Format tidak valid',
            number: 'Masukkan angka yang valid',
            ktpNumber: 'Nomor KTP harus 16 digit'
        };
        
        this.setupForm();
    }
    
    /**
     * Set up the form with event listeners
     */
    setupForm() {
        this.form.addEventListener('submit', (e) => {
            if (!this.validateAll()) {
                e.preventDefault();
                this.showErrors();
            }
        });
        
        // Add input event listeners for real-time validation
        for (const field in this.rules) {
            const element = this.form.querySelector(`[name="${field}"]`);
            if (element) {
                element.addEventListener('input', () => {
                    this.validateField(field, element.value);
                    this.showFieldError(field);
                });
                
                element.addEventListener('blur', () => {
                    this.validateField(field, element.value);
                    this.showFieldError(field);
                });
            }
        }
    }
    
    /**
     * Validate a specific field
     * @param {string} field - Field name
     * @param {string} value - Field value
     * @return {boolean} Whether validation passed
     */
    validateField(field, value) {
        const fieldRules = this.rules[field];
        
        if (!fieldRules) {
            return true;
        }
        
        // Reset error for this field
        delete this.errors[field];
        
        // Check each rule for the field
        for (const rule in fieldRules) {
            if (rule === 'match') {
                const matchField = fieldRules[rule];
                const matchValue = this.form.querySelector(`[name="${matchField}"]`).value;
                
                if (!Validator.match(value, matchValue)) {
                    this.errors[field] = this.getMessage(field, rule);
                    return false;
                }
            } else if (Validator[rule]) {
                const ruleValue = fieldRules[rule];
                const isValid = typeof ruleValue === 'object' 
                    ? Validator[rule](value, ruleValue) 
                    : ruleValue === true 
                        ? Validator[rule](value) 
                        : true;
                
                if (!isValid) {
                    this.errors[field] = this.getMessage(field, rule);
                    return false;
                }
            }
        }
        
        return true;
    }
    
    /**
     * Validate all form fields
     * @return {boolean} Whether all validations passed
     */
    validateAll() {
        let isValid = true;
        
        // Reset all errors
        this.errors = {};
        
        // Validate each field
        for (const field in this.rules) {
            const element = this.form.querySelector(`[name="${field}"]`);
            
            if (element) {
                const fieldValid = this.validateField(field, element.value);
                isValid = isValid && fieldValid;
            }
        }
        
        return isValid;
    }
    
    /**
     * Get error message for a field and rule
     * @param {string} field - Field name
     * @param {string} rule - Rule name
     * @return {string} Error message
     */
    getMessage(field, rule) {
        // Check for custom field-specific message
        if (this.messages[field] && this.messages[field][rule]) {
            return this.messages[field][rule];
        }
        
        // Check for custom rule message
        if (this.messages[rule]) {
            return this.messages[rule];
        }
        
        // Return default message
        return this.defaultMessages[rule] || 'Input tidak valid';
    }
    
    /**
     * Show errors for all fields
     */
    showErrors() {
        // Clear all previous error messages
        const errorElements = this.form.querySelectorAll('.form-error');
        errorElements.forEach(el => el.textContent = '');
        
        // Show new error messages
        for (const field in this.errors) {
            this.showFieldError(field);
        }
    }
    
    /**
     * Show error for a specific field
     * @param {string} field - Field name
     */
    showFieldError(field) {
        const element = this.form.querySelector(`[name="${field}"]`);
        const errorElement = this.form.querySelector(`#${field}-error`) || 
                             this.form.querySelector(`.${field}-error`);
        
        if (element && errorElement) {
            if (this.errors[field]) {
                element.classList.add('error');
                errorElement.textContent = this.errors[field];
            } else {
                element.classList.remove('error');
                errorElement.textContent = '';
            }
        }
    }
    
    /**
     * Get all current validation errors
     * @return {object} Error messages by field
     */
    getErrors() {
        return this.errors;
    }
}

// Export the validator for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Validator, FormValidator };
}