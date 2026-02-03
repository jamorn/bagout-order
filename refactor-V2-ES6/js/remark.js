// remark.js - Remark row management (max 5 rows)

import { showWarning } from './toast.js';

const MAX_REMARKS = 5;
let remarkCounter = 0;

/**
 * Add a new remark row
 * @param {string} value - Optional initial value for the remark
 * @returns {boolean} True if added successfully
 */
export function addRemarkRow(value = '') {
    const remarksList = document.getElementById('remarksList');
    if (!remarksList) {
        console.error('remarksList element not found');
        return false;
    }
    
    const currentCount = remarksList.children.length;
    
    // Check max limit
    if (currentCount >= MAX_REMARKS) {
        console.warn(`Maximum ${MAX_REMARKS} remarks allowed`);
        return false;
    }
    
    // Check if last row is empty (only if adding without value)
    if (currentCount > 0 && !value) {
        const lastInput = remarksList.querySelector('.remark-row:last-child .remark-input');
        if (lastInput && !lastInput.value.trim()) {
            showWarning('กรุณากรอก Remark ล่าสุดก่อนเพิ่มแถวใหม่');
            lastInput.focus();
            return false;
        }
    }
    
    // Create remark row
    const remarkRow = document.createElement('div');
    remarkRow.className = 'remark-row';
    remarkRow.dataset.remarkId = `remark-${++remarkCounter}`;
    
    // Create index label
    const indexLabel = document.createElement('span');
    indexLabel.className = 'remark-index text-purple-300 font-semibold';
    indexLabel.textContent = `${currentCount + 1}.`;
    
    // Create input
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'remark-input';
    input.placeholder = `Remark ${currentCount + 1}`;
    input.value = value;
    
    // Create delete button (only if more than 1 row will exist)
    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'remark-delete-btn';
    deleteBtn.dataset.id = remarkRow.dataset.remarkId;
    deleteBtn.innerHTML = '<i class="fas fa-times"></i>';
    
    // Append elements
    remarkRow.appendChild(indexLabel);
    remarkRow.appendChild(input);
    remarkRow.appendChild(deleteBtn);
    
    remarksList.appendChild(remarkRow);
    
    // Update visibility of delete buttons
    updateDeleteButtonsVisibility();
    updateRemarkIndices();
    
    return true;
}

/**
 * Remove a remark row by ID
 * @param {string} remarkId - Remark row ID
 */
export function removeRemarkRow(remarkId) {
    const remarksList = document.getElementById('remarksList');
    if (!remarksList) return;
    
    const remarkRow = remarksList.querySelector(`[data-remark-id="${remarkId}"]`);
    if (!remarkRow) return;
    
    // Don't allow removing if it's the last row
    if (remarksList.children.length <= 1) {
        console.warn('Cannot remove the last remark row');
        return;
    }
    
    remarkRow.remove();
    
    updateDeleteButtonsVisibility();
    updateRemarkIndices();
}

/**
 * Update delete button visibility
 * Hide delete buttons if only 1 row exists
 */
function updateDeleteButtonsVisibility() {
    const remarksList = document.getElementById('remarksList');
    if (!remarksList) return;
    
    const deleteButtons = remarksList.querySelectorAll('.remark-delete-btn');
    const rowCount = remarksList.children.length;
    
    deleteButtons.forEach(btn => {
        if (rowCount <= 1) {
            btn.style.visibility = 'hidden';
        } else {
            btn.style.visibility = 'visible';
        }
    });
}

/**
 * Update remark indices after add/remove
 */
export function updateRemarkIndices() {
    const remarksList = document.getElementById('remarksList');
    if (!remarksList) return;
    
    const rows = remarksList.querySelectorAll('.remark-row');
    rows.forEach((row, index) => {
        const indexLabel = row.querySelector('.remark-index');
        const input = row.querySelector('.remark-input');
        
        if (indexLabel) {
            indexLabel.textContent = `${index + 1}.`;
        }
        
        if (input) {
            input.placeholder = `Remark ${index + 1}`;
        }
    });
}

/**
 * Get all remark values
 * @returns {Array<string>} Array of remark values (non-empty only)
 */
export function getRemarkValues() {
    const remarksList = document.getElementById('remarksList');
    if (!remarksList) return [];
    
    const values = [];
    const inputs = remarksList.querySelectorAll('.remark-input');
    
    inputs.forEach(input => {
        const value = input.value.trim();
        if (value) {
            values.push(value);
        }
    });
    
    return values;
}

/**
 * Set remark values from array
 * @param {Array<string>} remarks - Array of remark strings
 */
export function setRemarkValues(remarks) {
    const remarksList = document.getElementById('remarksList');
    if (!remarksList) return;
    
    // Clear existing remarks
    remarksList.innerHTML = '';
    remarkCounter = 0;
    
    // Add remarks
    if (remarks && remarks.length > 0) {
        remarks.forEach(remark => {
            addRemarkRow(remark);
        });
    } else {
        // Add at least one empty row
        addRemarkRow();
    }
}

/**
 * Clear all remark rows and add one empty row
 */
export function clearRemarks() {
    const remarksList = document.getElementById('remarksList');
    if (!remarksList) return;
    
    remarksList.innerHTML = '';
    remarkCounter = 0;
    addRemarkRow();
}

/**
 * Get remark count
 * @returns {number} Number of remark rows
 */
export function getRemarkCount() {
    const remarksList = document.getElementById('remarksList');
    if (!remarksList) return 0;
    return remarksList.children.length;
}

/**
 * Check if can add more remarks
 * @returns {boolean} True if can add more
 */
export function canAddMoreRemarks() {
    return getRemarkCount() < MAX_REMARKS;
}
