// checkboxGroup.js - Checkbox and Radio group management with binary 8421 encoding

/**
 * GROUP 1 - Package Options (Radio buttons with dropdown)
 */
export const GROUP1 = [
    { 
        id: 'pkg-25', 
        label: 'Package 25 kg', 
        type: 'radio', 
        radioGroup: 'pkg', 
        defaultChecked: true,
        icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>'
    },
    { 
        id: 'pkg-custom', 
        label: 'Package', 
        type: 'radio-dropdown', 
        radioGroup: 'pkg', 
        suffix: 'KG.', 
        options: [750, 800, 900], 
        defaultValue: 750,
        icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg>'
    }
];

/**
 * GROUP 2 - Product Lock (Checkbox)
 */
export const GROUP2 = [
    { 
        id: 'prod-lock', 
        label: 'Product Lock', 
        type: 'standard',
        icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>'
    }
];

/**
 * GROUP 3 - Pallet Options (Checkboxes)
 */
export const GROUP3 = [
    { 
        id: 'cover-plastic', 
        label: 'Cover With Plastic Sheet/Film Hood', 
        type: 'standard',
        icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5H9a2 2 0 00-2 2v10a4 4 0 004 4h6a2 2 0 002-2V7a2 2 0 00-2-2z"></path></svg>'
    },
    { 
        id: 'mt1-wood', 
        label: '1MT/Pallet (Wood Pallet)', 
        type: 'standard',
        icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>'
    },
    { 
        id: 'mt1-plastic', 
        label: '1MT/Pallet (Plastic Pallet)', 
        type: 'standard',
        icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>'
    },
    { 
        id: 'mt15-wood', 
        label: '1.5MT/Pallet (Wood Pallet)', 
        type: 'standard',
        icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>'
    },
    { 
        id: 'mt15-plastic', 
        label: '1.5MT/Pallet (Plastic Pallet)', 
        type: 'standard',
        icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>'
    },
    { 
        id: 'other', 
        label: 'Other', 
        type: 'standard', 
        isDashed: true,
        icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"></path></svg>'
    }
];

/**
 * Render all checkbox/radio groups into containers
 */
export function renderCheckboxes(containerId = 'checkboxGroup') {
    const group1Html = GROUP1.map(item => {
        let contentHtml = '';
        if (item.type === 'radio-dropdown') {
            const optionsHtml = item.options.map(opt => `<option value="${opt}" ${opt === item.defaultValue ? 'selected' : ''}>${opt}</option>`).join('');
            contentHtml = `
                <div class="flex items-center">
                    ${item.icon || ''}
                    <span class="whitespace-nowrap ml-2">${item.label}</span>
                    <select id="select-${item.id}" class="pkg-dropdown">
                        ${optionsHtml}
                    </select>
                    ${item.suffix ? `<span class="whitespace-nowrap ml-1">${item.suffix}</span>` : ''}
                </div>
            `;
        } else {
            contentHtml = `
                <div class="flex items-center">
                    ${item.icon || ''}
                    <span class="whitespace-nowrap ml-2">${item.label}</span>
                </div>
            `;
        }
        return `
            <div class="checkbox-item bg-white/5 hover:bg-white/10 border border-purple-500/30 rounded-lg p-4 transition-all cursor-pointer">
                <input type="${item.type === 'radio' || item.type === 'radio-dropdown' ? 'radio' : 'checkbox'}" 
                       id="${item.id}" 
                       name="${item.radioGroup || 'packaging'}" 
                       value="${item.id}"
                       ${item.defaultChecked ? 'checked' : ''}>
                ${contentHtml}
            </div>
        `;
    }).join('');
    
    const group2Html = GROUP2.map(item => `
        <div class="checkbox-item bg-white/5 hover:bg-white/10 border border-purple-500/30 rounded-lg p-4 transition-all cursor-pointer">
            <input type="checkbox" id="${item.id}" name="packaging" value="${item.id}">
            <div class="flex items-center">
                ${item.icon || ''}
                <span class="whitespace-nowrap ml-2">${item.label}</span>
            </div>
        </div>
    `).join('');
    
    const group3Html = GROUP3.map(item => `
        <div class="checkbox-item ${item.isDashed ? 'border-dashed' : ''} bg-white/5 hover:bg-white/10 border border-purple-500/30 rounded-lg p-4 transition-all cursor-pointer">
            <input type="checkbox" id="${item.id}" name="packaging" value="${item.id}">
            <div class="flex items-center">
                ${item.icon || ''}
                <span class="whitespace-nowrap ml-2">${item.label}</span>
            </div>
        </div>
    `).join('');
    
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div id="group1-container">
                    <h3 class="text-lg font-semibold text-purple-300 mb-3">Package Options</h3>
                    <div class="space-y-3">${group1Html}</div>
                </div>
                <div id="group2-container">
                    <h3 class="text-lg font-semibold text-purple-300 mb-3">Product Lock</h3>
                    <div class="space-y-3">${group2Html}</div>
                </div>
                <div id="group3-container">
                    <h3 class="text-lg font-semibold text-purple-300 mb-3">Other</h3>
                    <div class="space-y-3">${group3Html}</div>
                </div>
            </div>
        `;
        
        // Add event listeners for active state updates
        setTimeout(() => {
            document.querySelectorAll('.checkbox-item input[type="checkbox"], .checkbox-item input[type="radio"]').forEach(input => {
                input.addEventListener('change', updateActiveCheckboxItems);
            });
            // Initial update
            updateActiveCheckboxItems();
        }, 0);
    }
}

/**
 * Update active state of checkbox and radio items
 * Highlights checked checkboxes and radios with yellow gradient
 */
export function updateActiveCheckboxItems() {
    document.querySelectorAll('.checkbox-item').forEach(item => {
        const checkbox = item.querySelector('input[type="checkbox"]');
        const radio = item.querySelector('input[type="radio"]');
        
        if ((checkbox && checkbox.checked) || (radio && radio.checked)) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

/**
 * Get selected checkbox data with binary 8421 encoding
 * @returns {Object} Selected checkbox data
 */
export function getSelectedCheckboxRadioData() {
    // Get all checkbox IDs in order for binary encoding
    const optionIds = ['prod-lock', 'cover-plastic', 'mt1-wood', 'mt1-plastic', 'mt15-wood', 'mt15-plastic', 'other'];
    
    // Calculate binary value (8421 encoding)
    let binary8421 = 0;
    const selectedOptions = [];
    
    optionIds.forEach((id, index) => {
        const checkbox = document.getElementById(id);
        if (checkbox && checkbox.checked) {
            binary8421 |= (1 << index); // Set bit at position
            selectedOptions.push(id);
        }
    });
    
    // Convert to 7-bit binary string
    const binaryString = binary8421.toString(2).padStart(7, '0');
    
    // Get package type radio selection
    let packageType = '';
    let packageValue = '';
    
    const packageRadios = document.querySelectorAll('input[name="pkg"]');
    packageRadios.forEach(radio => {
        if (radio.checked) {
            packageType = radio.id;
            if (packageType === 'pkg-custom') {
                const customInput = document.getElementById('select-pkg-custom');
                packageValue = customInput ? customInput.value : '';
            }
        }
    });
    
    // Default to pkg-25 if nothing selected
    if (!packageType) {
        packageType = 'pkg-25';
    }
    
    return {
        binary8421,
        binaryString,
        selectedOptions: selectedOptions.join(', '),
        packageType,
        packageValue
    };
}

/**
 * Set checkbox states from binary 8421 value
 * @param {number} binary8421 - Binary value to decode
 */
export function setCheckboxesFromBinary(binary8421) {
    const optionIds = ['prod-lock', 'cover-plastic', 'mt1-wood', 'mt1-plastic', 'mt15-wood', 'mt15-plastic', 'other'];
    
    optionIds.forEach((id, index) => {
        const checkbox = document.getElementById(id);
        if (checkbox) {
            checkbox.checked = (binary8421 & (1 << index)) !== 0;
        }
    });
    
    updateActiveCheckboxItems();
}

/**
 * Clear all checkboxes
 */
export function clearAllCheckboxes() {
    const optionIds = ['prod-lock', 'cover-plastic', 'mt1-wood', 'mt1-plastic', 'mt15-wood', 'mt15-plastic', 'other'];
    
    optionIds.forEach(id => {
        const checkbox = document.getElementById(id);
        if (checkbox) {
            checkbox.checked = false;
        }
    });
    
    updateActiveCheckboxItems();
}
