// checkboxGroup.js - Render and highlight checkbox/radio group
export const GROUP1 = [
    { id: 'pkg-25', label: 'Package 25 kg', type: 'radio', radioGroup: 'pkg', defaultChecked: true, 
      icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>' },
    { id: 'pkg-custom', label: 'Package', type: 'radio-dropdown', radioGroup: 'pkg', suffix: 'KG.', options: [750, 800, 900], defaultValue: 750,
      icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg>' }
];
export const GROUP2 = [
    { id: 'prod-lock', label: 'Product Lock', type: 'standard',
      icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>' }
];
export const GROUP3 = [
    { id: 'cover-plastic', label: 'Cover With Plastic Sheet/Film Hood', type: 'standard',
      icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5H9a2 2 0 00-2 2v10a4 4 0 004 4h6a2 2 0 002-2V7a2 2 0 00-2-2z"></path></svg>' },
    { id: 'mt1-wood', label: '1MT/Pallet (Wood Pallet)', type: 'standard',
      icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>' },
    { id: 'mt1-plastic', label: '1MT/Pallet (Plastic Pallet)', type: 'standard',
      icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>' },
    { id: 'mt15-wood', label: '1.5MT/Pallet (Wood Pallet)', type: 'standard',
      icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>' },
    { id: 'mt15-plastic', label: '1.5MT/Pallet (Plastic Pallet)', type: 'standard',
      icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>' },
    { id: 'other', label: 'Other', type: 'standard', isDashed: true,
      icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"></path></svg>' }
];
export function renderCheckboxes(containerId = 'checkboxGroup') {
    const group1 = GROUP1.map(item => {
        let contentHtml = '';
        if (item.type === 'radio-dropdown') {
            const optionsHtml = item.options.map(opt => `<option value="${opt}" ${opt === item.defaultValue ? 'selected' : ''}>${opt}</option>`).join('');
            contentHtml = `
                <div class="flex items-center">
                    ${item.icon || ''}
                    <span class="whitespace-nowrap ml-2">${item.label}</span>
                    <select id="select-${item.id}" class="bg-white/10 border border-purple-500/50 rounded px-2 py-1 text-white text-sm ml-2 focus:ring-2 focus:ring-purple-400">
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
                <input type="radio" id="${item.id}" name="${item.radioGroup}" class="w-5 h-5 flex-shrink-0 accent-purple-500 cursor-pointer" ${item.defaultChecked ? 'checked' : ''}>
                <label for="${item.id}" class="ml-3 text-white font-medium cursor-pointer flex-grow flex items-center">
                    ${contentHtml}
                </label>
            </div>
        `;
    }).join('');
    const group2 = GROUP2.map(item => {
        return `
            <div class="checkbox-item bg-white/5 hover:bg-white/10 border border-purple-500/30 rounded-lg p-4 transition-all cursor-pointer">
                <input type="checkbox" id="${item.id}" name="options" class="w-5 h-5 flex-shrink-0 accent-purple-500 cursor-pointer">
                <label for="${item.id}" class="ml-3 text-white font-medium cursor-pointer flex-grow flex items-center">
                    ${item.icon || ''}
                    <span class="whitespace-nowrap ml-2">${item.label}</span>
                </label>
            </div>
        `;
    }).join('');
    const group3 = GROUP3.map(item => {
        let contentHtml = `
            <div class="flex items-center">
                ${item.icon || ''}
                <span class="whitespace-nowrap ml-2">${item.label}</span>
            </div>
        `;
        return `
            <div class="checkbox-item bg-white/5 hover:bg-white/10 border ${item.isDashed ? 'border-dashed border-purple-400/50' : 'border-purple-500/30'} rounded-lg p-4 transition-all cursor-pointer">
                <input type="checkbox" id="${item.id}" name="options" class="w-5 h-5 flex-shrink-0 accent-purple-500 cursor-pointer">
                <label for="${item.id}" class="ml-3 text-white font-medium cursor-pointer flex-grow flex items-center">
                    ${contentHtml}
                </label>
            </div>
        `;
    }).join('');
    document.getElementById(containerId).innerHTML = `
        <div class="mb-4">${group1}</div>
        <hr class="my-4 border-purple-500/30">
        <div class="mb-4">${group2}</div>
        <hr class="my-4 border-purple-500/30">
        <div>${group3}</div>
    `;
}
export function updateActiveCheckboxItems() {
    // Handle all checkbox and radio items
    document.querySelectorAll('.checkbox-item').forEach(item => {
        const input = item.querySelector('input[type="checkbox"], input[type="radio"]');
        if (input && input.checked) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

// Get selected checkbox/radio data with binary 8421 encoding
export function getSelectedCheckboxRadioData() {
    const data = {};
    
    // Radio group (pkg)
    const pkgRadio = document.querySelector('input[name="pkg"]:checked');
    if (pkgRadio) {
        data.packageType = pkgRadio.id;
        if (pkgRadio.id === 'pkg-custom') {
            const selectEl = document.getElementById('select-pkg-custom');
            data.packageValue = selectEl ? selectEl.value : '';
        } else {
            data.packageValue = '25';
        }
    }
    
    // Checkboxes (GROUP2 + GROUP3) - Binary 8421 encoding
    const checkboxes = [
        'prod-lock',
        'cover-plastic',
        'mt1-wood',
        'mt1-plastic',
        'mt15-wood',
        'mt15-plastic',
        'other'
    ];
    
    const selected = [];
    let binaryValue = 0;
    checkboxes.forEach((id, index) => {
        const checkbox = document.getElementById(id);
        if (checkbox && checkbox.checked) {
            selected.push(id);
            // Binary 8421: assign weight based on position (2^index)
            binaryValue += Math.pow(2, index);
        }
    });
    
    data.selectedOptions = selected.join(', ');
    data.binary8421 = binaryValue;
    data.binaryString = binaryValue.toString(2).padStart(8, '0');
    
    return data;
}
