// utils.js - Utility functions for BAGOUT ORDER system

/**
 * Generate Order Number based on current date
 * Format: XXX/YYYY where XXX is running number, YYYY is year
 */
export function generateOrderNo() {
    const now = new Date();
    const year = now.getFullYear();
    
    // Get running number from localStorage
    const key = `orderCounter_${year}`;
    let counter = parseInt(localStorage.getItem(key) || '0', 10);
    counter++;
    localStorage.setItem(key, counter.toString());
    
    const orderNo = String(counter).padStart(3, '0') + '/' + year;
    return orderNo;
}

/**
 * Format timestamp to dd/MM/yyyy HH:mm
 * @param {string|number|Date} ts - Timestamp (ISO string, milliseconds, or Date object)
 * @returns {string} Formatted date string
 */
export function formatTimestamp(ts) {
    if (!ts) return '';
    const d = new Date(ts);
    if (isNaN(d.getTime())) return '';
    
    const pad = n => n.toString().padStart(2, '0');
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * Get current datetime in local format (YYYY-MM-DDTHH:mm)
 * @returns {string} Local datetime string
 */
export function getCurrentDateTimeLocal() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * Validate PO Number format and length
 * @param {string} po - PO number to validate
 * @returns {boolean} True if valid
 */
export function validatePONumber(po) {
    if (!po || po.trim().length === 0) return false;
    // PO must be exactly 9 characters to be considered complete/valid
    return po.trim().length === 9;
}

/**
 * Validate Lot Number format and length
 * @param {string} lotNo - Lot number to validate
 * @returns {boolean} True if valid
 */
export function validateLotNumber(lotNo) {
    if (!lotNo || lotNo.trim().length === 0) return false;
    // Lot No must be exactly 10 characters to be considered complete/valid
    return lotNo.trim().length === 10;
}

/**
 * Handle PO input with character counter
 * @param {HTMLInputElement} element - Input element
 */
export function handlePOInput(element) {
    // sanitize: allow digits only
    let value = (element.value || '').toString();
    const sanitized = value.replace(/[^0-9]/g, '');
    if (sanitized !== value) {
        const pos = element.selectionStart || sanitized.length;
        element.value = sanitized;
        try { element.setSelectionRange(pos - 1, pos - 1); } catch (e) {}
        value = sanitized;
    }
    const counter = document.getElementById('poCount');
    const check = document.getElementById('poCheck');
    
    if (counter) {
        counter.textContent = `${value.length}/9`;
    }
    
    if (check) {
        // Show green check only when PO is complete (exactly 9 chars)
        if (validatePONumber(value)) {
            check.classList.remove('hidden');
        } else {
            check.classList.add('hidden');
        }
    }

    // Visual counter color: green when valid, muted when not
    if (counter) {
        if (validatePONumber(value)) {
            counter.classList.remove('text-purple-300');
            counter.classList.add('text-green-600');
        } else {
            counter.classList.remove('text-green-600');
            counter.classList.add('text-purple-300');
        }
    }
}

/**
 * Handle Lot No input with character counter
 * @param {HTMLInputElement} element - Input element
 */
export function handleLotNoInput(element) {
    // sanitize: allow digits only
    let value = (element.value || '').toString();
    const sanitized = value.replace(/[^0-9]/g, '');
    if (sanitized !== value) {
        const pos = element.selectionStart || sanitized.length;
        element.value = sanitized;
        try { element.setSelectionRange(pos - 1, pos - 1); } catch (e) {}
        value = sanitized;
    }
    const counter = document.getElementById('lotNoCount');
    const check = document.getElementById('lotCheck');
    
    if (counter) {
        counter.textContent = `${value.length}/10`;
    }
    
    if (check) {
        // Show green check only when Lot No is complete (exactly 10 chars)
        if (validateLotNumber(value)) {
            check.classList.remove('hidden');
        } else {
            check.classList.add('hidden');
        }
    }

    // Visual counter color: green when valid, muted when not
    if (counter) {
        if (validateLotNumber(value)) {
            counter.classList.remove('text-purple-300');
            counter.classList.add('text-green-600');
        } else {
            counter.classList.remove('text-green-600');
            counter.classList.add('text-purple-300');
        }
    }
}

/**
 * Handle Quantity input validation
 * @param {HTMLInputElement} element - Input element
 */
export function handleQuantityInput(element) {
    let value = (element.value || '').toString();
    // allow digits and decimal point only
    value = value.replace(/[^0-9.]/g, '');
    // collapse multiple dots
    const parts = value.split('.');
    if (parts.length > 2) {
        value = parts.shift() + '.' + parts.join('');
    }
    let num = parseFloat(value);
    if (isNaN(num) || num < 0) num = 0;
    if (num > 9999) num = 9999;
    // snap to nearest 0.05 and display two decimals
    const step = 0.05;
    num = Math.round(num / step) * step;
    element.value = num.toFixed(2);
}

/**
 * Debounce function to limit function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Deep clone an object
 * @param {Object} obj - Object to clone
 * @returns {Object} Cloned object
 */
export function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

/**
 * Check if element is in viewport
 * @param {HTMLElement} element - Element to check
 * @returns {boolean} True if in viewport
 */
export function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

/**
 * Scroll element into view smoothly
 * @param {HTMLElement|string} element - Element or selector
 */
export function scrollToElement(element) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}
