// formData.js - Form data management and validation
import siloDataRaw from '../data/siloData.js';
import gradeDataRaw from '../data/grade_pp.js';
import rawGrades from '../data/raw_grades.js';
import { generateOrderNo, getCurrentDateTimeLocal, handlePOInput, handleLotNoInput, handleQuantityInput } from './utils.js';
import { addRemarkRow, updateRemarkIndices, canAddMoreRemarks } from './remark.js';
import { renderCheckboxes, updateActiveCheckboxItems, getSelectedCheckboxRadioData, clearAllCheckboxes } from './checkboxGroup.js';
import { refreshCustomDropdown } from './customDropdown.js';
import { showSuccess, showError, showWarning } from './toast.js';
import { addHistoryRecord, updateHistoryRecord, deleteHistoryRecord, renderHistoryTable, populateFormFromRow } from './historyTable.js';
import { showConfirm } from './modal.js';

let editingIndex = -1;

// Mock data for person selects
const mockIssuers = ['John', 'Jane', 'Mike', 'Sarah', 'Tom'];
const mockApprovers = ['Shift Sup.', 'Manager A', 'Manager B'];
const mockReceivers = ['Warehouse 1', 'Warehouse 2', 'Warehouse 3'];

/**
 * Initialize form with default values
 */
export function initForm() {
    // Set current datetime
    const orderDateEl = document.getElementById('orderDate');
    if (orderDateEl) {
        orderDateEl.value = getCurrentDateTimeLocal();
    }
    
    // Set order number
    const orderNoEl = document.getElementById('orderNo');
    if (orderNoEl) {
        orderNoEl.value = generateOrderNo();
    }
    
    // Set default quantity
    const quantityEl = document.getElementById('quantity');
    if (quantityEl) {
        quantityEl.value = '150';
    }
    
    // Populate dropdowns
    populateSiloDropdown();
    populatePersonSelect('issuerBy', mockIssuers);
    populatePersonSelect('approverBy', mockApprovers);
    
    // Setup autocomplete
    setupBagTypeAutocomplete();
    
    // Render checkboxes
    renderCheckboxes();
    
    // Add one remark row
    addRemarkRow();
    
    // Attach event listeners
    attachFormEvents();
    
    // Update active checkbox items
    setTimeout(() => updateActiveCheckboxItems(), 0);
}

/**
 * Populate Silo dropdown
 */
function populateSiloDropdown() {
    const siloSelect = document.getElementById('bagSilo');
    if (!siloSelect) return;
    
    siloSelect.innerHTML = '<option value="">-- เลือก Silo --</option>';
    
    siloDataRaw.forEach(silo => {
        const option = document.createElement('option');
        option.value = silo.SiloName;
        option.textContent = silo.SiloName;
        siloSelect.appendChild(option);
    });
}

/**
 * Populate Line dropdown based on selected Silo
 * @param {string} siloName - Selected silo name
 */
export function populateLineDropdown(siloName) {
    const lineSelect = document.getElementById('bagLine');
    if (!lineSelect) return;
    
    lineSelect.innerHTML = '<option value="">-- เลือก Line --</option>';
    
    if (!siloName) {
        lineSelect.disabled = true;
        return;
    }
    // The silo data uses `LineName` per entry (there may be multiple rows
    // with the same SiloName). Gather unique LineName values for the
    // selected silo and populate the Line select.
    const lines = siloDataRaw
        .filter(s => s.SiloName === siloName)
        .map(s => s.LineName)
        .filter(Boolean);

    const uniqueLines = Array.from(new Set(lines));

    if (uniqueLines.length > 0) {
        uniqueLines.forEach(line => {
            const option = document.createElement('option');
            option.value = line;
            option.textContent = line;
            lineSelect.appendChild(option);
        });
        lineSelect.disabled = false;
    } else {
        lineSelect.disabled = true;
    }

    // refresh custom dropdown UI if present
    try { refreshCustomDropdown(lineSelect); } catch (e) { /* ignore if not available */ }

    // Also update remarkType options based on the silo's plant (PP/PPC/HDPE/etc)
    const siloEntry = siloDataRaw.find(s => s.SiloName === siloName);
    const plant = siloEntry?.Plant || '';
    populateRemarkTypeOptions(plant);
}

/**
 * Populate the Remark Type select based on plant and grade data
 * @param {string} plant - Plant code (e.g., 'PP', 'PPC', 'HDPE')
 */
function populateRemarkTypeOptions(plant) {
    const remarkSelect = document.getElementById('remarkType');
    if (!remarkSelect) return;

    remarkSelect.innerHTML = '';

    // If plant is PP, derive options from grade_pp types
    if ((plant || '').toUpperCase() === 'PP') {
        const types = Array.from(new Set((gradeDataRaw || []).map(g => (g.type || '').toString().trim()).filter(Boolean)));
        // Ensure a predictable order: PREMIUM, SUB-STANDARD first if present
        const preferred = ['PREMIUM', 'SUB-STANDARD'];
        const ordered = [...preferred.filter(p => types.includes(p)), ...types.filter(t => !preferred.includes(t))];

        ordered.forEach(t => {
            const opt = document.createElement('option');
            opt.value = t;
            opt.textContent = t;
            remarkSelect.appendChild(opt);
        });
    } else {
        // For other plants (PPC/HDPE/PPE/etc) use a small default set.
        // If you have per-plant rule/data, we can load that instead.
        const defaults = ['PREMIUM', 'SUB-STANDARD', 'OGPH', 'OGPR'];
        defaults.forEach(t => {
            const opt = document.createElement('option');
            opt.value = t;
            opt.textContent = t;
            remarkSelect.appendChild(opt);
        });
    }

    // keep first option selected
    remarkSelect.selectedIndex = 0;

    // If custom dropdown UI is used, refresh it
    try { refreshCustomDropdown(remarkSelect); } catch (e) { /* ignore */ }
}

/**
 * Populate person select dropdown
 * @param {string} selectId - Select element ID
 * @param {Array} persons - Array of person names
 */
function populatePersonSelect(selectId, persons) {
    const select = document.getElementById(selectId);
    if (!select) return;
    
    select.innerHTML = '<option value="">-- เลือก --</option>';
    
    persons.forEach(person => {
        const option = document.createElement('option');
        option.value = person;
        option.textContent = person;
        select.appendChild(option);
    });
}

/**
 * Setup bag type autocomplete
 */
function setupBagTypeAutocomplete() {
    const input = document.getElementById('bagType');
    if (!input) return;
    
    let autocompleteResults = null;

    // Build PP material list (plant 1311 and 1312) deduped and sorted
    const ppMaterials = Array.from(new Set(
        (rawGrades || [])
            .filter(r => (r.plant || '').toString() === '1311' || (r.plant || '').toString() === '1312')
            .map(r => (r.material || '').toString().toUpperCase())
            .filter(Boolean)
    )).sort();

    input.addEventListener('input', (e) => {
        // Allow only alphanumeric characters (a-z, 0-9)
        let v = (e.target.value || '').toString();
        const sanitized = v.replace(/[^a-zA-Z0-9]/g, '');
        if (sanitized !== v) {
            const pos = e.target.selectionStart || sanitized.length;
            e.target.value = sanitized;
            try { e.target.setSelectionRange(pos - 1, pos - 1); } catch (er) {}
            v = sanitized;
        }
        const value = v.toUpperCase();

        // Remove existing results
        if (autocompleteResults) {
            autocompleteResults.remove();
            autocompleteResults = null;
        }

        if (value.length === 0) return;

        // Filter materials by prefix match for faster UX
        const matches = ppMaterials.filter(m => m.startsWith(value)).slice(0, 10);
        if (matches.length === 0) return;

        // Create results container
        autocompleteResults = document.createElement('div');
        autocompleteResults.className = 'autocomplete-results';

        matches.forEach((display, index) => {
            const item = document.createElement('div');
            item.className = 'autocomplete-item';
            if (index === 0) item.classList.add('active');
            item.textContent = display;

            item.addEventListener('click', () => {
                input.value = display;
                autocompleteResults.remove();
                autocompleteResults = null;
            });

            autocompleteResults.appendChild(item);
        });

        // Position results below input
        const inputRect = input.getBoundingClientRect();
        autocompleteResults.style.position = 'absolute';
        autocompleteResults.style.top = `${inputRect.bottom + window.scrollY}px`;
        autocompleteResults.style.left = `${inputRect.left + window.scrollX}px`;
        autocompleteResults.style.width = `${inputRect.width}px`;

        document.body.appendChild(autocompleteResults);
    });
    
    // Close on click outside
    document.addEventListener('click', (e) => {
        if (autocompleteResults && !input.contains(e.target) && !autocompleteResults.contains(e.target)) {
            autocompleteResults.remove();
            autocompleteResults = null;
        }
    });
}

/**
 * Attach form event listeners
 */
function attachFormEvents() {
    // Silo change event
    const siloSelect = document.getElementById('bagSilo');
    if (siloSelect) {
        siloSelect.addEventListener('change', (e) => {
            populateLineDropdown(e.target.value);
        });
    }
    
    // PO input counter
    const poInput = document.getElementById('orderPO');
    if (poInput) {
        poInput.addEventListener('input', (e) => handlePOInput(e.target));
        handlePOInput(poInput);
    }
    
    // Lot No input counter
    const lotNoInput = document.getElementById('lotNo');
    if (lotNoInput) {
        lotNoInput.addEventListener('input', (e) => handleLotNoInput(e.target));
        handleLotNoInput(lotNoInput);
    }
    
    // Quantity input validation
    const quantityInput = document.getElementById('quantity');
    if (quantityInput) {
        quantityInput.addEventListener('input', (e) => handleQuantityInput(e.target));
    }
    
    // Add remark button
    const addRemarkBtn = document.querySelector('.add-remark-btn');
    if (addRemarkBtn) {
        addRemarkBtn.addEventListener('click', () => {
            if (canAddMoreRemarks()) {
                addRemarkRow();
            } else {
                showWarning('สามารถเพิ่ม Remark ได้สูงสุด 5 รายการ');
            }
        });
    }
    
    // Remark delete button (event delegation)
    const remarksList = document.getElementById('remarksList');
    if (remarksList) {
        remarksList.addEventListener('click', (e) => {
            if (e.target.closest('.remark-delete-btn')) {
                const btn = e.target.closest('.remark-delete-btn');
                const remarkId = btn.dataset.id;
                const row = remarksList.querySelector(`[data-remark-id="${remarkId}"]`);
                if (row && remarksList.children.length > 1) {
                    row.remove();
                    updateRemarkIndices();
                }
            }
        });
        
        remarksList.addEventListener('input', updateRemarkIndices);
    }
    
    // Checkbox/radio change event
    document.addEventListener('change', (e) => {
        if (e.target.matches('input[type="checkbox"], input[type="radio"]')) {
            updateActiveCheckboxItems();
        }
    });
    
    // Form submit button
    const submitBtn = document.querySelector('.submit-form-btn');
    if (submitBtn) {
        submitBtn.addEventListener('click', handleFormSubmit);
    }
    
    // Cancel button
    const cancelBtn = document.querySelector('.cancel-edit-btn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', resetEditingMode);
    }
}

/**
 * Handle form submission
 */
function handleFormSubmit() {
    // Validate required fields
    const requiredFields = [
        { id: 'orderDate', label: 'Date/Time' },
        { id: 'orderNo', label: 'Order No.' },
        { id: 'orderPO', label: 'PO Number' },
        { id: 'bagSilo', label: 'Bagging Silo' },
        { id: 'bagLine', label: 'Bagging Line' },
        { id: 'lotNo', label: 'Lot No.' },
        { id: 'bagType', label: 'Type' },
        { id: 'quantity', label: 'Quantity' }
    ];
    
    for (const field of requiredFields) {
        const el = document.getElementById(field.id);
        if (!el) continue;
        const val = (el.value || '').toString().trim();
        if (!val) {
            showError(`กรุณากรอก: ${field.label}`);
            el.focus();
            return;
        }
    }
    
    // Collect form data
    const formData = {
        orderDate: document.getElementById('orderDate').value,
        orderNo: document.getElementById('orderNo').value,
        orderPO: document.getElementById('orderPO').value,
        issuerBy: document.getElementById('issuerBy')?.value || '',
        approverBy: document.getElementById('approverBy')?.value || '',
        // `receiveBy` is managed on the Bagging page; leave blank for PP
        receiveBy: '',
        bagSilo: document.getElementById('bagSilo').value,
        bagLine: document.getElementById('bagLine').value,
        lotNo: document.getElementById('lotNo').value,
        bagType: document.getElementById('bagType').value,
        quantity: document.getElementById('quantity').value,
        remarkType: document.getElementById('remarkType')?.value || 'NORMAL'
    };
    
    // Get checkbox/radio data
    const checkboxRadioData = getSelectedCheckboxRadioData();
    
    // Save or update
    if (editingIndex >= 0) {
        updateHistoryRecord(editingIndex, formData, checkboxRadioData);
        showSuccess(`แก้ไขสำเร็จ: ${formData.orderNo} (Binary: ${checkboxRadioData.binary8421})`);
        resetEditingMode();
    } else {
        addHistoryRecord(formData, checkboxRadioData);
        showSuccess(`บันทึกสำเร็จ: ${formData.orderNo} (Binary: ${checkboxRadioData.binary8421})`);
    }
    
    // Re-render history table
    renderHistoryTable(1, 'history-table-container');
    
    // Clear form
    clearForm();
}

/**
 * Clear form after submit
 */
function clearForm() {
    // Reset text inputs
    document.getElementById('orderPO').value = '';
    document.getElementById('lotNo').value = '';
    document.getElementById('quantity').value = '150';
    
    // Reset selects
    document.getElementById('bagSilo').selectedIndex = 0;
    document.getElementById('bagLine').selectedIndex = 0;
    document.getElementById('bagLine').disabled = true;
    document.getElementById('bagType').value = '';
    if (document.getElementById('remarkType')) {
        document.getElementById('remarkType').selectedIndex = 0;
    }
    
    // Reset person selects
    if (document.getElementById('issuerBy')) document.getElementById('issuerBy').selectedIndex = 0;
    if (document.getElementById('approverBy')) document.getElementById('approverBy').selectedIndex = 0;
    
    // Clear checkboxes
    clearAllCheckboxes();
    
    // Reset package radio
    const pkg25 = document.getElementById('pkg-25kg');
    if (pkg25) pkg25.checked = true;
    const customInput = document.getElementById('select-pkg-custom');
    if (customInput) customInput.value = '';
    
    // Clear remarks and add one empty row
    const remarksList = document.getElementById('remarksList');
    if (remarksList) remarksList.innerHTML = '';
    addRemarkRow();
    
    // Reset date and order number
    document.getElementById('orderDate').value = getCurrentDateTimeLocal();
    document.getElementById('orderNo').value = generateOrderNo();
    
    // Update counters
    handlePOInput(document.getElementById('orderPO'));
    handleLotNoInput(document.getElementById('lotNo'));
    
    // Update UI
    updateActiveCheckboxItems();
}

/**
 * Set edit mode
 * @param {number} idx - Record index
 */
export function setEditMode(idx) {
    editingIndex = idx;
    
    const submitBtn = document.querySelector('.submit-form-btn');
    const cancelBtn = document.querySelector('.cancel-edit-btn');
    
    if (submitBtn) {
        submitBtn.innerHTML = '<i class="fas fa-save mr-2"></i>บันทึกการแก้ไข';
        submitBtn.classList.remove('btn-primary');
        submitBtn.classList.add('bg-orange-600', 'hover:bg-orange-700');
    }
    
    if (cancelBtn) {
        cancelBtn.classList.remove('hidden');
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Reset editing mode
 */
function resetEditingMode() {
    editingIndex = -1;
    
    const submitBtn = document.querySelector('.submit-form-btn');
    const cancelBtn = document.querySelector('.cancel-edit-btn');
    
    if (submitBtn) {
        submitBtn.innerHTML = '<i class="fas fa-save mr-2"></i>บันทึกรายการ';
        submitBtn.classList.remove('bg-orange-600', 'hover:bg-orange-700');
        submitBtn.classList.add('btn-primary');
    }
    
    if (cancelBtn) {
        cancelBtn.classList.add('hidden');
    }
    
    clearForm();
}

/**
 * Attach history table action events
 * Call this after history table is rendered
 */
export function attachHistoryActions() {
    // Edit buttons
    document.querySelectorAll('.history-edit').forEach(btn => {
        btn.addEventListener('click', () => {
            const idx = parseInt(btn.dataset.idx, 10);
            const allData = JSON.parse(localStorage.getItem('bagoutOrderHistory') || '[]');
            if (idx >= 0 && idx < allData.length) {
                const row = allData[idx];
                populateFormFromRow(row, setEditMode);
            }
        });
    });
    
    // Delete buttons
    document.querySelectorAll('.history-delete').forEach(btn => {
        btn.addEventListener('click', async () => {
            const idx = parseInt(btn.dataset.idx, 10);
            const allData = JSON.parse(localStorage.getItem('bagoutOrderHistory') || '[]');
            if (idx >= 0 && idx < allData.length) {
                const row = allData[idx];
                const ok = await showConfirm(`ต้องการลบ Order ${row.orderNo} หรือไม่?`);
                if (ok) {
                    if (deleteHistoryRecord(idx)) {
                        showSuccess(`ลบ Order ${row.orderNo} แล้ว`);
                        renderHistoryTable(1, 'history-table-container');
                    }
                }
            }
        });
    });
    
    // Quick approve buttons
    document.querySelectorAll('.quick-approve').forEach(btn => {
        btn.addEventListener('click', () => {
            const idx = parseInt(btn.dataset.idx, 10);
            const allData = JSON.parse(localStorage.getItem('bagoutOrderHistory') || '[]');
            if (idx >= 0 && idx < allData.length) {
                const row = allData[idx];
                const currentStatus = row.docStatus || 'Draft';
                
                if (currentStatus === 'Approved') {
                    row.docStatus = 'Draft';
                    row.approverBy = '';
                    row.approverAt = '';
                    showWarning(`ยกเลิกการอนุมัติ Order ${row.orderNo}`);
                } else {
                    row.docStatus = 'Approved';
                    row.approverBy = 'Quick Approve';
                    row.approverAt = new Date().toISOString();
                    showSuccess(`อนุมัติ Order ${row.orderNo} แล้ว`);
                }
                
                localStorage.setItem('bagoutOrderHistory', JSON.stringify(allData));
                renderHistoryTable(1, 'history-table-container');
            }
        });
    });
}
