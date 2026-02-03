// historyTable.js - History table management with localStorage
import orderHistory from '../data/order-history.js';
import { formatTimestamp } from './utils.js';
import { setRemarkValues } from './remark.js';
import { setCheckboxesFromBinary, updateActiveCheckboxItems } from './checkboxGroup.js';
import { showPrompt, showConfirm } from './modal.js';

const HISTORY_KEY = 'bagoutOrderHistory';
const PAGE_SIZE = 15;
let currentPage = 1;
let currentSearchTerm = '';
let expandedRows = new Set();

/**
 * Initialize history table with mock data if empty
 * @param {string} containerId - Container element ID
 */
export function initHistoryTable(containerId = 'history-table-container') {
    // Load mock data on first run
    if (!localStorage.getItem(HISTORY_KEY)) {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(orderHistory));
    }
    // Normalize existing history data to ensure `stateHistory` exists
    const data = getHistoryData();
    let changed = false;
    data.forEach(rec => {
        if (!Array.isArray(rec.stateHistory)) {
            rec.stateHistory = [];
            if (rec.createdAt) {
                rec.stateHistory.push({ state: rec.docStatus || 'Draft', by: rec.issuerBy || '', at: rec.createdAt });
            }
            if (rec.approverAt) {
                rec.stateHistory.push({ state: 'Approved', by: rec.approverBy || '', at: rec.approverAt });
            }
            if (rec.receiveAt) {
                rec.stateHistory.push({ state: 'Received', by: rec.receiveBy || '', at: rec.receiveAt });
            }
            changed = true;
        }
    });
    if (changed) saveHistoryData(data);

    renderHistoryTable(1, containerId);
}

/**
 * Get history data from localStorage
 * @returns {Array} History data array
 */
export function getHistoryData() {
    const data = localStorage.getItem(HISTORY_KEY);
    return data ? JSON.parse(data) : [];
}

/**
 * Save history data to localStorage
 * @param {Array} data - History data array
 */
export function saveHistoryData(data) {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(data));
}

/**
 * Add new history record
 * @param {Object} formData - Form data object
 * @param {Object} checkboxRadioData - Checkbox and radio data
 */
export function addHistoryRecord(formData, checkboxRadioData) {
    const historyData = getHistoryData();
    
    // Collect remarks
    const remarks = [];
    document.querySelectorAll('#remarksList .remark-input').forEach(input => {
        const val = input.value.trim();
        if (val) remarks.push(val);
    });
    
    const newRecord = {
        orderDate: formData.orderDate || '',
        orderNo: formData.orderNo || '',
        orderPO: formData.orderPO || '',
        issuerBy: formData.issuerBy || '',
        approverBy: formData.approverBy || '',
        receiveBy: formData.receiveBy || '',
        issuerAt: formData.issuerBy ? new Date().toISOString() : '',
        approverAt: formData.approverBy ? new Date().toISOString() : '',
        receiveAt: formData.receiveBy ? new Date().toISOString() : '',
        bagSilo: formData.bagSilo || '',
        bagLine: formData.bagLine || '',
        lotNo: formData.lotNo || '',
        bagType: formData.bagType || '',
        quantity: formData.quantity || '',
        remarkType: formData.remarkType || '',
        packageType: checkboxRadioData.packageType || '',
        packageValue: checkboxRadioData.packageValue || '',
        binary8421: checkboxRadioData.binary8421 || 0,
        binaryString: checkboxRadioData.binaryString || '0000000',
        selectedOptions: checkboxRadioData.selectedOptions || '',
        remarks: remarks,
        docStatus: 'Draft',
        currentOwner: formData.issuerBy || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        // stateHistory keeps chronological state changes for Timeline UI
        stateHistory: [ { state: 'Draft', by: formData.issuerBy || '', at: new Date().toISOString() } ]
    };
    
    historyData.push(newRecord);
    saveHistoryData(historyData);
}

/**
 * Update existing history record
 * @param {number} index - Record index
 * @param {Object} formData - Form data object
 * @param {Object} checkboxRadioData - Checkbox and radio data
 */
export function updateHistoryRecord(index, formData, checkboxRadioData) {
    const historyData = getHistoryData();
    
    if (index < 0 || index >= historyData.length) {
        console.error('Invalid index:', index);
        return;
    }
    
    const existing = historyData[index];
    
    // Collect remarks
    const remarks = [];
    document.querySelectorAll('#remarksList .remark-input').forEach(input => {
        const val = input.value.trim();
        if (val) remarks.push(val);
    });
    
    const updatedRecord = {
        orderDate: formData.orderDate || '',
        orderNo: formData.orderNo || '',
        orderPO: formData.orderPO || '',
        issuerBy: formData.issuerBy || '',
        approverBy: formData.approverBy || '',
        receiveBy: formData.receiveBy || '',
        issuerAt: existing.issuerAt || (formData.issuerBy ? new Date().toISOString() : ''),
        approverAt: existing.approverAt || (formData.approverBy ? new Date().toISOString() : ''),
        receiveAt: existing.receiveAt || (formData.receiveBy ? new Date().toISOString() : ''),
        bagSilo: formData.bagSilo || '',
        bagLine: formData.bagLine || '',
        lotNo: formData.lotNo || '',
        bagType: formData.bagType || '',
        quantity: formData.quantity || '',
        remarkType: formData.remarkType || '',
        packageType: checkboxRadioData.packageType || '',
        packageValue: checkboxRadioData.packageValue || '',
        binary8421: checkboxRadioData.binary8421 || 0,
        binaryString: checkboxRadioData.binaryString || '0000000',
        selectedOptions: checkboxRadioData.selectedOptions || '',
        remarks: remarks,
        docStatus: existing.docStatus || 'Draft',
        currentOwner: existing.currentOwner || formData.issuerBy || '',
        createdAt: existing.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        // preserve existing stateHistory or carry forward an initial Draft entry
        stateHistory: Array.isArray(existing.stateHistory) ? existing.stateHistory : (existing.createdAt ? [ { state: existing.docStatus || 'Draft', by: existing.issuerBy || '', at: existing.createdAt } ] : [])
    };
    
    historyData[index] = updatedRecord;
    saveHistoryData(historyData);
}

/**
 * Delete history record
 * @param {number} index - Record index
 * @returns {boolean} True if deleted successfully
 */
export function deleteHistoryRecord(index) {
    const historyData = getHistoryData();
    
    if (index < 0 || index >= historyData.length) {
        return false;
    }
    
    historyData.splice(index, 1);
    saveHistoryData(historyData);
    return true;
}

/**
 * Filter data by search term
 * @param {Array} data - Data array
 * @param {string} searchTerm - Search term
 * @returns {Array} Filtered data
 */
function filterData(data, searchTerm) {
    if (!searchTerm) return data;
    const term = searchTerm.toLowerCase();
    return data.filter(row =>
        (row.orderNo?.toLowerCase().includes(term)) ||
        (row.orderDate?.toLowerCase().includes(term)) ||
        (row.orderPO?.toLowerCase().includes(term)) ||
        (row.bagSilo?.toLowerCase().includes(term)) ||
        (row.bagLine?.toLowerCase().includes(term)) ||
        (row.bagType?.toLowerCase().includes(term)) ||
        (row.quantity?.toString().includes(term)) ||
        (row.remarkType?.toLowerCase().includes(term))
    );
}

/**
 * Render history table
 * @param {number} page - Page number
 * @param {string} containerId - Container element ID
 * @param {string} searchTerm - Search term (optional)
 */
export function renderHistoryTable(page = 1, containerId = 'history-table-container', searchTerm = currentSearchTerm) {
    currentPage = page;
    currentSearchTerm = searchTerm;
    
    const allData = getHistoryData();
    
    // Sort by Order No DESC (newest first)
    const sortedData = [...allData].sort((a, b) => {
        const orderNoA = a.orderNo || '';
        const orderNoB = b.orderNo || '';
        return orderNoB.localeCompare(orderNoA, undefined, { numeric: true });
    });
    
    const filteredData = filterData(sortedData, searchTerm);
    const total = filteredData.length;
    const start = (page - 1) * PAGE_SIZE;
    const rows = filteredData.slice(start, start + PAGE_SIZE);
    
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container ${containerId} not found`);
        return;
    }
    
    let html = `<div class="history-table-container">`;
    
    // Add header with title and search on the right
    html += `<div class="flex justify-between items-center mb-6">`;
    html += `<h2 class="text-2xl font-bold flex items-center gap-2">`;
    html += `<i class="fas fa-history text-green-400"></i>`;
    html += `BAGOUT ORDER HISTORY`;
    html += `</h2>`;
    html += `<div class="flex items-center gap-4">`;
    html += `<input type="text" id="history-search" value="${searchTerm}" placeholder="ค้นหา Order No, PO, Silo, Type..." class="form-control w-80" />`;
    if (searchTerm) {
        html += `<span class="text-xs header-text-muted">พบ ${total} รายการจากทั้งหมด ${allData.length} รายการ</span>`;
    }
    html += `</div>`;
    html += `</div>`;
    
    // Table
    html += `<div class="overflow-x-auto">`;
    html += `<table>`;
    html += `<thead>`;
    html += `<tr>`;
    html += `<th class="text-center w-10"></th>`;
    html += `<th>#</th>`;
    html += `<th>Order No</th>`;
    html += `<th>Date</th>`;
    html += `<th>PO</th>`;
    html += `<th>Silo</th>`;
    html += `<th>Type</th>`;
    html += `<th class="text-right">Qty</th>`;
    html += `<th class="text-center">Status</th>`;
    html += `<th class="text-center">Actions</th>`;
    html += `</tr></thead>`;
    html += `<tbody>`;
    
    if (rows.length === 0) {
        html += `<tr><td colspan="10" class="text-center py-8">`;
        html += searchTerm ? 'ไม่พบข้อมูลที่ค้นหา' : 'ยังไม่มีข้อมูล';
        html += `</td></tr>`;
    } else {
        rows.forEach((row, i) => {
            const actualIdx = allData.findIndex(r => 
                r.orderNo === row.orderNo && 
                r.orderPO === row.orderPO && 
                r.orderDate === row.orderDate
            );
            const isExpanded = expandedRows.has(actualIdx);
            const status = row.docStatus || 'Draft';
            
            // Main row
            html += `<tr class="hover:bg-purple-600/20 transition-colors ${isExpanded ? 'expanded-row' : ''}">`;
            html += `<td class="text-center">`;
            html += `<button class="expand-toggle" data-idx="${actualIdx}">`;
            html += isExpanded 
                ? `<i class="fas fa-chevron-down"></i>`
                : `<i class="fas fa-chevron-right"></i>`;
            html += `</button></td>`;
            html += `<td class="text-center font-medium">${start + i + 1}</td>`;
            html += `<td class="font-semibold">${row.orderNo}</td>`;
            html += `<td>${row.orderDate}</td>`;
            html += `<td class="font-medium">${row.orderPO}</td>`;
            html += `<td>${row.bagSilo}</td>`;
            html += `<td>${row.bagType}</td>`;
            html += `<td class="text-right font-semibold">${row.quantity}</td>`;
            html += `<td class="text-center"><span class="px-2 py-1 text-xs font-semibold rounded ${getStatusClass(status)}">${status}</span></td>`;
            html += `<td class="text-center">`;
            html += `<button class="text-yellow-400 hover:text-yellow-300 mr-2 quick-approve" data-idx="${actualIdx}" title="Quick Approve"><i class="fas fa-check-circle"></i></button>`;
            html += `<button class="text-blue-400 hover:text-blue-300 mr-2 history-edit" data-idx="${actualIdx}" title="แก้ไข"><i class="fas fa-pencil-alt"></i></button>`;
            html += `<button class="text-red-400 hover:text-red-300 history-delete" data-idx="${actualIdx}" title="ลบ"><i class="fas fa-eraser"></i></button>`;
            html += `</td>`;
            html += `</tr>`;
            
            // Detail row (expanded)
            if (isExpanded) {
                html += renderDetailRow(row);
            }
        });
    }
    
    html += `</tbody></table></div>`;
    
    // Pagination
    const totalPages = Math.ceil(total / PAGE_SIZE);
    html += `<div class="flex justify-between items-center mt-4">`;
    html += `<button class="btn btn-secondary history-prev" ${page === 1 ? 'disabled' : ''}>`;
    html += `<i class="fas fa-chevron-left mr-2"></i>ก่อนหน้า</button>`;
    html += `<span class="text-sm">หน้า <strong>${page}</strong> / <strong>${totalPages || 1}</strong> (${total} รายการ)</span>`;
    html += `<button class="btn btn-secondary history-next" ${start + PAGE_SIZE >= total ? 'disabled' : ''}>`;
    html += `ถัดไป<i class="fas fa-chevron-right ml-2"></i></button>`;
    html += `</div></div>`;
    
    container.innerHTML = html;
    attachHistoryTableEvents(containerId);
}

/**
 * Render detail row (expanded content)
 * @param {Object} row - Data row
 * @returns {string} HTML string
 */
function renderDetailRow(row) {
    let html = `<tr class="bg-purple-800/30">`;
    html += `<td colspan="10" class="px-12 py-4">`;
    html += `<div class="grid grid-cols-2 gap-4 history-detail">`;
    // Left column
    html += `<div><span class="font-semibold text-purple-300">Line:</span> <span class="text-purple-200">${row.bagLine || '-'}</span></div>`;
    // Right column: Lot No
    html += `<div><span class="font-semibold text-purple-300">Lot No:</span> <span class="text-purple-200">${row.lotNo || '-'}</span></div>`;
    // Remark Type
    html += `<div><span class="font-semibold text-purple-300">Remark Type:</span> <span class="px-2 py-1 text-xs font-medium rounded-full ${row.remarkType === 'PREMIUM' ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}">${row.remarkType}</span></div>`;
    // Selected Options
    html += `<div><span class="font-semibold text-purple-300">Selected Options:</span> <span class="text-purple-200">${row.selectedOptions || '-'}</span></div>`;
    // Package + People box
    html += `<div>`;
    html += `<div><span class="font-semibold text-purple-300">Package:</span> <span class="text-purple-200">${getPackageLabel(row.packageType, row.packageValue)}</span></div>`;
    html += `<div class="mt-3 p-4 bg-purple-900/10 rounded min-h-[120px]">`;
    html += `<div class="text-sm text-purple-200 space-y-1">`;
    // Person badges
    html += `<div><span class="font-semibold text-purple-300">Issuer:</span> <span class="inline-flex items-center">` +
            (row.issuerBy ? `<span class="px-2 py-0.5 rounded text-xs font-medium bg-teal-500 text-white">${row.issuerBy}</span>` : `<span class="px-2 py-0.5 rounded text-xs font-medium bg-gray-600 text-white">-</span>`) +
            (row.issuerAt ? `<span class="ml-2 text-purple-300 text-xs">• ${formatTimestamp(row.issuerAt)}</span>` : '') +
        `</span></div>`;
    html += `<div><span class="font-semibold text-purple-300">Approver:</span> <span class="inline-flex items-center">` +
            (row.approverBy ? `<span class="px-2 py-0.5 rounded text-xs font-medium bg-amber-400 text-purple-900">${row.approverBy}</span>` : `<span class="px-2 py-0.5 rounded text-xs font-medium bg-gray-600 text-white">-</span>`) +
            (row.approverAt ? `<span class="ml-2 text-purple-300 text-xs">• ${formatTimestamp(row.approverAt)}</span>` : '') +
        `</span></div>`;
    html += `<div><span class="font-semibold text-purple-300">Receiver:</span> <span class="inline-flex items-center">` +
            (row.receiveBy ? `<span class="px-2 py-0.5 rounded text-xs font-medium bg-sky-500 text-white">${row.receiveBy}</span>` : `<span class="px-2 py-0.5 rounded text-xs font-medium bg-gray-600 text-white">-</span>`) +
            (row.receiveAt ? `<span class="ml-2 text-purple-300 text-xs">• ${formatTimestamp(row.receiveAt)}</span>` : '') +
        `</span></div>`;
    html += `</div></div>`;
    // Workflow Action buttons
    const actualIdx = getHistoryData().findIndex(r => 
        r.orderNo === row.orderNo && 
        r.orderPO === row.orderPO && 
        r.orderDate === row.orderDate
    );
    html += `<div class="flex justify-end items-center gap-2 mt-2">`;
    html += `<button class="px-3 py-1 text-xs rounded bg-blue-600 hover:bg-blue-500 workflow-action" data-idx="${actualIdx}" data-action="assign">Assign to me</button>`;
    html += `<button class="px-3 py-1 text-xs rounded bg-green-500 hover:bg-green-400 workflow-action" data-idx="${actualIdx}" data-action="approve">Approve</button>`;
    html += `<button class="px-3 py-1 text-xs rounded bg-red-500 hover:bg-red-400 workflow-action" data-idx="${actualIdx}" data-action="reject">Reject</button>`;
    html += `</div>`;
    html += `</div>`;
    // Binary 8421
    html += `<div><span class="font-semibold text-purple-300">Binary 8421:</span> <span class="text-purple-100 font-mono">${row.binary8421} (${row.binaryString})</span></div>`;
    
    if (row.remarks && row.remarks.length > 0) {
        html += `<div class="col-span-2"><span class="font-semibold text-purple-300">Remarks:</span><ul class="mt-1 ml-4 list-disc text-purple-200">`;
        row.remarks.forEach(remark => {
            html += `<li>${remark}</li>`;
        });
        html += `</ul></div>`;
    }
    
    // Timeline section (show created/updated timestamps)
    html += `<div class="col-span-2 mt-4 timeline">`;
    html += `<h3 class="font-semibold text-purple-300 mb-2">Timeline:</h3>`;
    // Prefer detailed stateHistory when available
    if (Array.isArray(row.stateHistory) && row.stateHistory.length > 0) {
        row.stateHistory.forEach(entry => {
            html += `<div class="time-entry text-purple-200">${formatTimestamp(entry.at)} ${entry.state}${entry.by ? ` • by ${entry.by}` : ''}</div>`;
        });
    } else {
        if (row.createdAt) {
            html += `<div class="time-entry text-purple-200">${formatTimestamp(row.createdAt)} ${row.docStatus || 'Draft'}</div>`;
        }
        if (row.updatedAt && row.updatedAt !== row.createdAt) {
            html += `<div class="time-entry text-purple-200 mt-1">${formatTimestamp(row.updatedAt)} ${row.docStatus || 'Draft'}</div>`;
        }
    }
    html += `</div>`;

    html += `</div></td></tr>`;
    return html;
}

/**
 * Get status badge class
 * @param {string} status - Status string
 * @returns {string} CSS class
 */
function getStatusClass(status) {
    switch (status) {
        case 'Approved': return 'bg-green-500/20 text-green-300';
        case 'Assigned':
        case 'In Progress': return 'bg-blue-500/20 text-blue-300';
        case 'Rejected': return 'bg-red-500/20 text-red-300';
        default: return 'bg-gray-500/20 text-gray-300';
    }
}

/**
 * Get package label text
 * @param {string} packageType - Package type ID
 * @param {string} packageValue - Custom package value
 * @returns {string} Package label
 */
function getPackageLabel(packageType, packageValue) {
    switch (packageType) {
        case 'pkg-jumbo': return 'JUMBO';
        case 'pkg-25kg': return '25 KG';
        case 'pkg-50kg': return '50 KG';
        case 'pkg-custom': return `Custom ${packageValue} KG`;
        default: return '-';
    }
}

/**
 * Attach event handlers to history table
 * @param {string} containerId - Container element ID
 */
function attachHistoryTableEvents(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Search event
    const searchInput = container.querySelector('#history-search');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const cursorPosition = e.target.selectionStart;
            const searchValue = e.target.value;
            
            // Use setTimeout to maintain focus after re-render
            setTimeout(() => {
                renderHistoryTable(1, containerId, searchValue);
                // Restore focus and cursor position
                const newSearchInput = document.querySelector('#history-search');
                if (newSearchInput) {
                    newSearchInput.focus();
                    newSearchInput.setSelectionRange(cursorPosition, cursorPosition);
                }
            }, 0);
        });
    }
    
    // Expand/collapse toggle
    container.querySelectorAll('.expand-toggle').forEach(btn => {
        btn.addEventListener('click', () => {
            const idx = parseInt(btn.dataset.idx, 10);
            if (expandedRows.has(idx)) {
                expandedRows.delete(idx);
            } else {
                expandedRows.add(idx);
            }
            renderHistoryTable(currentPage, containerId, currentSearchTerm);
        });
    });
    
    // Pagination
    container.querySelector('.history-prev')?.addEventListener('click', () => {
        if (currentPage > 1) {
            renderHistoryTable(currentPage - 1, containerId, currentSearchTerm);
        }
    });
    
    container.querySelector('.history-next')?.addEventListener('click', () => {
        const allData = getHistoryData();
        const filteredData = filterData(allData, currentSearchTerm);
        const totalPages = Math.ceil(filteredData.length / PAGE_SIZE);
        if (currentPage < totalPages) {
            renderHistoryTable(currentPage + 1, containerId, currentSearchTerm);
        }
    });
    
    // Workflow action buttons
    container.querySelectorAll('.workflow-action').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const idx = parseInt(btn.dataset.idx, 10);
            const action = btn.dataset.action;
            applyWorkflowAction(idx, action, containerId);
        });
    });
}

/**
 * Apply workflow action (Assign, Approve, Reject)
 * @param {number} idx - Record index
 * @param {string} action - Action type
 * @param {string} containerId - Container ID for re-render
 */
async function applyWorkflowAction(idx, action, containerId) {
    const data = getHistoryData();
    if (!data || !data[idx]) return;
    
    const row = data[idx];
    let by = '';
    
    if (action === 'assign') {
        by = await showPrompt('ชื่อผู้รับผิดชอบ (มอบหมายให้):', '') || 'Me';
        row.currentOwner = by;
        row.docStatus = 'Assigned';
        if (!Array.isArray(row.stateHistory)) row.stateHistory = [];
        row.stateHistory.push({ state: 'Assigned', by: by, at: new Date().toISOString() });
    } else if (action === 'approve') {
        by = row.approverBy || (await showPrompt('ชื่อผู้อนุมัติ:', '')) || 'Approver';
        row.docStatus = 'Approved';
        row.approverBy = by;
        row.approverAt = new Date().toISOString();
        if (!Array.isArray(row.stateHistory)) row.stateHistory = [];
        row.stateHistory.push({ state: 'Approved', by: by, at: row.approverAt });
    } else if (action === 'reject') {
        by = row.approverBy || (await showPrompt('ชื่อผู้อนุมัติ (reject):', '')) || 'Approver';
        row.docStatus = 'Rejected';
        if (!Array.isArray(row.stateHistory)) row.stateHistory = [];
        row.stateHistory.push({ state: 'Rejected', by: by, at: new Date().toISOString() });
    }
    
    saveHistoryData(data);
    renderHistoryTable(currentPage, containerId, currentSearchTerm);
}

/**
 * Populate form from history record
 * @param {Object} row - History record
 * @param {Function} setEditMode - Callback to set edit mode
 */
export function populateFormFromRow(row, setEditMode) {
    // Populate basic fields
    if (row.orderDate) {
        document.getElementById('orderDate').value = row.orderDate.replace(' ', 'T');
    }
    if (row.orderNo) document.getElementById('orderNo').value = row.orderNo;
    if (row.orderPO) document.getElementById('orderPO').value = row.orderPO;
    if (row.bagSilo) document.getElementById('bagSilo').value = row.bagSilo;
    if (row.bagLine) {
        setTimeout(() => {
            document.getElementById('bagLine').value = row.bagLine;
        }, 100);
    }
    if (row.issuerBy) document.getElementById('issuerBy').value = row.issuerBy;
    if (row.approverBy) document.getElementById('approverBy').value = row.approverBy;
    const _rEl = document.getElementById('receiveBy');
    if (_rEl && row.receiveBy) _rEl.value = row.receiveBy;
    if (row.lotNo) document.getElementById('lotNo').value = row.lotNo;
    if (row.bagType) document.getElementById('bagType').value = row.bagType;
    if (row.quantity) document.getElementById('quantity').value = row.quantity;
    if (row.remarkType) document.getElementById('remarkType').value = row.remarkType;
    
    // Package radio
    if (row.packageType) {
        const pkgRadio = document.getElementById(row.packageType);
        if (pkgRadio) pkgRadio.checked = true;
        if (row.packageType === 'pkg-custom' && row.packageValue) {
            const customInput = document.getElementById('select-pkg-custom');
            if (customInput) customInput.value = row.packageValue;
        }
    }
    
    // Checkboxes
    if (row.binary8421 !== undefined) {
        setCheckboxesFromBinary(row.binary8421);
    }
    
    // Remarks
    if (row.remarks && Array.isArray(row.remarks)) {
        setRemarkValues(row.remarks);
    }
    
    // Trigger UI updates
    setTimeout(() => updateActiveCheckboxItems(), 0);
    
    // Call set edit mode callback
    if (typeof setEditMode === 'function') {
        const allData = getHistoryData();
        const idx = allData.findIndex(r => 
            r.orderNo === row.orderNo && 
            r.orderPO === row.orderPO && 
            r.orderDate === row.orderDate
        );
        setEditMode(idx);
    }
}

/**
 * Render bagging-specific view (alias to renderHistoryTable but different container)
 */
export function renderBaggingTable(page = 1, containerId = 'bagging-history-table') {
    const allData = getHistoryData() || [];
    // Show records ready for bagging: Approved / Assigned / In Progress / Received
    const data = allData.filter(r => {
        const s = (r.docStatus || 'Draft');
        return s === 'Approved' || s === 'Assigned' || s === 'In Progress' || s === 'Received';
    });
    const total = data.length;
    const start = (page - 1) * PAGE_SIZE;
    const rows = data.slice(start, start + PAGE_SIZE);
    const container = document.getElementById(containerId);
    if (!container) return;

    let html = `<div class="history-table-container">`;
    html += `<div class="mb-4"><h3 class="text-lg font-semibold text-purple-200">Bagging Queue</h3></div>`;
    html += `<div class="overflow-x-auto rounded-lg border border-purple-500/30 shadow-lg">`;
    html += `<table class="min-w-full divide-y divide-purple-500/20 bg-purple-900/20">`;
    html += `<thead class="bg-purple-700/20"><tr>`;
    html += `<th class="px-3 py-3 text-left text-xs font-bold text-purple-200 uppercase">#</th>`;
    html += `<th class="px-3 py-3 text-left text-xs font-bold text-purple-200 uppercase">Plant</th>`;
    html += `<th class="px-3 py-3 text-left text-xs font-bold text-purple-200 uppercase">Date</th>`;
    html += `<th class="px-3 py-3 text-left text-xs font-bold text-purple-200 uppercase">PO</th>`;
    html += `<th class="px-3 py-3 text-left text-xs font-bold text-purple-200 uppercase">Silo</th>`;
    html += `<th class="px-3 py-3 text-left text-xs font-bold text-purple-200 uppercase">Type</th>`;
    html += `<th class="px-3 py-3 text-right text-xs font-bold text-purple-200 uppercase">Qty</th>`;
    html += `<th class="px-3 py-3 text-left text-xs font-bold text-purple-200 uppercase">Status</th>`;
    html += `<th class="px-3 py-3 text-center text-xs font-bold text-purple-200 uppercase">Action</th>`;
    html += `</tr></thead><tbody class="divide-y divide-purple-500/20">`;

    if (rows.length === 0) {
        html += `<tr><td colspan="9" class="px-3 py-8 text-center text-purple-300">No items in bagging queue</td></tr>`;
    } else {
        rows.forEach((row, i) => {
            const actualIdx = allData.findIndex(r => r.orderNo === row.orderNo && r.orderPO === row.orderPO && r.orderDate === row.orderDate);
            const status = row.docStatus || 'Draft';
            let statusBg = '#374151';
            if (status === 'Approved') statusBg = '#10B981';
            else if (status === 'Assigned' || status === 'In Progress') statusBg = '#3B82F6';
            else if (status === 'Rejected') statusBg = '#EF4444';

            html += `<tr class="hover:bg-purple-600/10">`;
            html += `<td class="px-3 py-3 text-sm text-purple-200">${start + i + 1}</td>`;
            html += `<td class="px-3 py-3 text-sm text-purple-200">${row.plant || '-'}</td>`;
            html += `<td class="px-3 py-3 text-sm text-purple-200">${row.orderDate}</td>`;
            html += `<td class="px-3 py-3 text-sm text-purple-200">${row.orderPO}</td>`;
            html += `<td class="px-3 py-3 text-sm text-purple-200">${row.bagSilo}</td>`;
            html += `<td class="px-3 py-3 text-sm text-purple-200">${row.bagType}</td>`;
            html += `<td class="px-3 py-3 text-sm text-white text-right font-semibold">${row.quantity}</td>`;
            html += `<td class="px-3 py-3 text-sm text-center"><span style="background:${statusBg};color:#fff;padding:4px 8px;border-radius:6px;font-size:12px">${status}</span></td>`;
            html += `<td class="px-3 py-3 text-center"><button class="px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white bagging-receive" data-idx="${actualIdx}">รับ</button></td>`;
            html += `</tr>`;
        });
    }

    html += `</tbody></table></div></div>`;
    container.innerHTML = html;

    // attach events to receive buttons
    container.querySelectorAll('.bagging-receive').forEach(btn => {
        btn.addEventListener('click', () => {
            const idx = +btn.dataset.idx;
            if (window.openReceiveModal) window.openReceiveModal(idx);
        });
    });
}

/**
 * Confirm receive for a record index and set receiver name
 * @param {number} idx
 * @param {string} receiverName
 */
export function confirmReceive(idx, receiverName) {
    const data = getHistoryData();
    if (!data || !data[idx]) return false;
    const row = data[idx];
    row.receiveBy = receiverName || row.receiveBy || 'Receiver';
    row.receiveAt = new Date().toISOString();
    row.docStatus = 'Received';
    if (!Array.isArray(row.stateHistory)) row.stateHistory = [];
    row.stateHistory.push({ state: 'Received', by: row.receiveBy, at: row.receiveAt });
    saveHistoryData(data);
    // re-render both views if present
    try { renderBaggingTable(1, 'bagging-history-table'); } catch (e) {}
    try { renderHistoryTable(1, 'history-table-container', ''); } catch (e) {}
    return true;
}
