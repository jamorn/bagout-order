// checkboxGroup.js - Render and highlight checkbox/radio group
export const GROUP1 = [
    { id: 'pkg-25', label: 'Package 25 kg', type: 'radio', radioGroup: 'pkg', defaultChecked: true },
    { id: 'pkg-custom', label: 'Package', type: 'radio-dropdown', radioGroup: 'pkg', suffix: 'KG.', options: [750, 800, 900], defaultValue: 750 }
];
export const GROUP2 = [
    { id: 'prod-lock', label: 'Product Lock', type: 'standard' }
];
export const GROUP3 = [
    { id: 'cover-plastic', label: 'Cover With Plastic Sheet/Film Hood', type: 'standard' },
    { id: 'mt1-wood', label: '1MT/Pallet (Wood Pallet)', type: 'standard' },
    { id: 'mt1-plastic', label: '1MT/Pallet (Plastic Pallet)', type: 'standard' },
    { id: 'mt15-wood', label: '1.5MT/Pallet (Wood Pallet)', type: 'standard' },
    { id: 'mt15-plastic', label: '1.5MT/Pallet (Plastic Pallet)', type: 'standard' },
    { id: 'other', label: 'Other', type: 'standard', isDashed: true }
];
export function renderCheckboxes(containerId = 'checkboxGroup') {
    const group1 = GROUP1.map(item => {
        let contentHtml = '';
        if (item.type === 'radio-dropdown') {
            const optionsHtml = item.options.map(opt => `<option value="${opt}" ${opt === item.defaultValue ? 'selected' : ''}>${opt}</option>`).join('');
            contentHtml = `
                <div class="flex items-center">
                    <span class="whitespace-nowrap">${item.label}</span>
                    <select id="select-${item.id}" class="my-0 h-8 ml-2">
                        ${optionsHtml}
                    </select>
                    ${item.suffix ? `<span class="whitespace-nowrap ml-1">${item.suffix}</span>` : ''}
                </div>
            `;
        } else {
            contentHtml = `<span class="whitespace-nowrap">${item.label}</span>`;
        }
        return `
            <div class="checkbox-item">
                <input type="radio" id="${item.id}" name="${item.radioGroup}" class="w-5 h-5 flex-shrink-0 text-blue-600 rounded border-gray-300 cursor-pointer" ${item.defaultChecked ? 'checked' : ''}>
                <label for="${item.id}" class="ml-3 text-gray-700 font-medium cursor-pointer flex-grow flex items-center">
                    ${contentHtml}
                </label>
            </div>
        `;
    }).join('');
    const group2 = GROUP2.map(item => {
        return `
            <div class="checkbox-item">
                <input type="checkbox" id="${item.id}" name="options" class="w-5 h-5 flex-shrink-0 text-blue-600 rounded border-gray-300 cursor-pointer">
                <label for="${item.id}" class="ml-3 text-gray-700 font-medium cursor-pointer flex-grow flex items-center">
                    <span class="whitespace-nowrap">${item.label}</span>
                </label>
            </div>
        `;
    }).join('');
    const group3 = GROUP3.map(item => {
        let contentHtml = `<span class=\"whitespace-nowrap\">${item.label}</span>`;
        return `
            <div class="checkbox-item ${item.isDashed ? 'border-dashed border-gray-300' : ''}">
                <input type="checkbox" id="${item.id}" name="options" class="w-5 h-5 flex-shrink-0 text-blue-600 rounded border-gray-300 cursor-pointer">
                <label for="${item.id}" class="ml-3 text-gray-700 font-medium cursor-pointer flex-grow flex items-center">
                    ${contentHtml}
                </label>
            </div>
        `;
    }).join('');
    document.getElementById(containerId).innerHTML = `
        <div class="mb-2">${group1}</div>
        <hr class="my-2 border-gray-300">
        <div class="mb-2">${group2}</div>
        <hr class="my-2 border-gray-300">
        <div>${group3}</div>
    `;
}
export function updateActiveCheckboxItems() {
    document.querySelectorAll('.checkbox-item input[type="checkbox"]').forEach(input => {
        if (input.checked) {
            input.closest('.checkbox-item').classList.add('active');
        } else {
            input.closest('.checkbox-item').classList.remove('active');
        }
    });
    const radioGroups = {};
    document.querySelectorAll('.checkbox-item input[type="radio"]').forEach(input => {
        const name = input.name;
        if (!radioGroups[name]) radioGroups[name] = [];
        radioGroups[name].push(input);
    });
    Object.values(radioGroups).forEach(group => {
        group.forEach(input => {
            if (input.checked) {
                input.closest('.checkbox-item').classList.add('active');
            } else {
                input.closest('.checkbox-item').classList.remove('active');
            }
        });
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
