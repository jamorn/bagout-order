// historyTable.js - Manage BAGOUT ORDER History Table (with localStorage and mock data)
import orderHistory from '../data/order-history.js';

const HISTORY_KEY = 'bagoutOrderHistory';
const pageSize = 15;
let currentSearchTerm = '';
let expandedRows = new Set(); // Track expanded rows by index

function populateFormFromRow(row) {
    // Populate basic form fields
    if (row.orderDate) {
        const dt = row.orderDate.replace(' ', 'T');
        document.getElementById('orderDate').value = dt;
    }
    if (row.orderNo) document.getElementById('orderNo').value = row.orderNo;
    if (row.orderPO) document.getElementById('orderPO').value = row.orderPO;
    if (row.bagSilo) {
        document.getElementById('bagSilo').value = row.bagSilo;
        // Trigger line dropdown population after setting silo
        if (window.populateLineDropdown) {
            window.populateLineDropdown(row.bagSilo);
        }
    }
    if (row.bagLine) {
        // Set bagLine after silo dropdown is populated
        setTimeout(() => {
            document.getElementById('bagLine').value = row.bagLine;
        }, 10);
    }
    if (row.lotNo) document.getElementById('lotNo').value = row.lotNo;
    if (row.bagType) document.getElementById('bagType').value = row.bagType;
    if (row.quantity) document.getElementById('quantity').value = row.quantity;
    if (row.remarkType) document.getElementById('remarkType').value = row.remarkType;
    
    // Populate package radio
    if (row.packageType) {
        const pkgRadio = document.getElementById(row.packageType);
        if (pkgRadio) pkgRadio.checked = true;
        if (row.packageType === 'pkg-custom' && row.packageValue) {
            const selectEl = document.getElementById('select-pkg-custom');
            if (selectEl) selectEl.value = row.packageValue;
        }
    }
    
    // Decode binary 8421 and check checkboxes
    if (row.binary8421 !== undefined) {
        const optionIds = ['prod-lock', 'cover-plastic', 'mt1-wood', 'mt1-plastic', 'mt15-wood', 'mt15-plastic', 'other'];
        optionIds.forEach((id, index) => {
            const checkbox = document.getElementById(id);
            if (checkbox) {
                checkbox.checked = (row.binary8421 & (1 << index)) !== 0;
            }
        });
    }
    
    // Clear existing remark rows first
    const remarksList = document.getElementById('remarksList');
    if (remarksList) {
        remarksList.innerHTML = '';
    }
    
    // Populate remarks (trigger addRemarkRow via global scope)
    if (row.remarks && Array.isArray(row.remarks) && row.remarks.length > 0) {
        row.remarks.forEach(remarkText => {
            if (window.addRemarkRowWithValue) {
                window.addRemarkRowWithValue(remarkText);
            }
        });
    } else {
        // Add at least one empty remark row
        if (window.addRemarkRowWithValue) {
            window.addRemarkRowWithValue('');
        }
    }
    
    // Trigger UI update for active checkbox items
    if (window.updateActiveCheckboxItems) {
        setTimeout(() => window.updateActiveCheckboxItems(), 0);
    }
}

export function initHistoryTable(containerId = 'right-table-container') {
    // On first load, if no local data, copy mock to localStorage
    if (!localStorage.getItem(HISTORY_KEY)) {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(orderHistory));
    }
    renderHistoryTable(1, containerId);
}

export function getHistoryData() {
    return JSON.parse(localStorage.getItem(HISTORY_KEY));
}
export function saveHistoryData(data) {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(data));
}

export function addHistoryRecord(formData, checkboxRadioData) {
    const historyData = getHistoryData();
    
    // Collect remarks from remarksList
    const remarks = [];
    document.querySelectorAll('#remarksList input[type="text"]').forEach(input => {
        const val = input.value.trim();
        if (val) remarks.push(val);
    });
    
    const newRecord = {
        orderDate: formData.orderDate || '',
        orderNo: formData.orderNo || '',
        orderPO: formData.orderPO || '',
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
        remarks: remarks
    };
    
    historyData.push(newRecord);
    saveHistoryData(historyData);
}

export function updateHistoryRecord(index, formData, checkboxRadioData) {
    const historyData = getHistoryData();
    
    // Collect remarks from remarksList
    const remarks = [];
    document.querySelectorAll('#remarksList input[type="text"]').forEach(input => {
        const val = input.value.trim();
        if (val) remarks.push(val);
    });
    
    const updatedRecord = {
        orderDate: formData.orderDate || '',
        orderNo: formData.orderNo || '',
        orderPO: formData.orderPO || '',
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
        remarks: remarks
    };
    
    historyData[index] = updatedRecord;
    saveHistoryData(historyData);
}

function filterData(data, searchTerm) {
    if (!searchTerm) return data;
    const term = searchTerm.toLowerCase();
    return data.filter(row => 
        row.orderNo?.toLowerCase().includes(term) ||
        row.orderDate?.toLowerCase().includes(term) ||
        row.orderPO?.toLowerCase().includes(term) ||
        row.bagSilo?.toLowerCase().includes(term) ||
        row.bagLine?.toLowerCase().includes(term) ||
        row.bagType?.toLowerCase().includes(term) ||
        row.quantity?.toString().includes(term) ||
        row.remarkType?.toLowerCase().includes(term)
    );
}

export function renderHistoryTable(page = 1, containerId = 'right-table-container', searchTerm = currentSearchTerm) {
    currentSearchTerm = searchTerm;
    const allData = getHistoryData();
    
    // Sort by Order No DESC (newest first)
    const sortedData = [...allData].sort((a, b) => {
        const orderNoA = a.orderNo || '';
        const orderNoB = b.orderNo || '';
        return orderNoB.localeCompare(orderNoA, undefined, { numeric: true });
    });
    
    const data = filterData(sortedData, searchTerm);
    const total = data.length;
    const start = (page - 1) * pageSize;
    const rows = data.slice(start, start + pageSize);
    const container = document.getElementById(containerId);
    if (!container) return;
    
    let html = `<div class='w-full mx-auto history-table-container'>`;
    
    // Search bar
    html += `<div class='mb-4'>`;
    html += `<div class='relative'>`;
    html += `<input type='text' id='history-search' value='${searchTerm}' placeholder='ค้นหา Order No, PO, Silo, Type...' class='w-full px-4 py-2 pl-10 pr-4 text-sm bg-white/10 border border-purple-500/30 rounded-lg text-white placeholder-purple-300 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all' />`;
    html += `<svg class='absolute left-3 top-2.5 w-5 h-5 text-purple-300' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'></path></svg>`;
    html += `</div>`;
    if (searchTerm) {
        html += `<p class='text-xs text-purple-300 mt-2'>พบ ${total} รายการจากทั้งหมด ${allData.length} รายการ</p>`;
    }
    html += `</div>`;
    
    // Table
    html += `<div class='overflow-x-auto rounded-lg border border-purple-500/30 shadow-lg'>`;
    html += `<table class='min-w-full divide-y divide-purple-500/20 bg-purple-900/20 backdrop-blur'>`;
    html += `<thead class='bg-purple-700/30'>`;
    html += `<tr>`;
    html += `<th class='px-3 py-3 text-center text-xs font-bold text-purple-200 uppercase tracking-wider w-10'></th>`;
    html += `<th class='px-3 py-3 text-left text-xs font-bold text-purple-200 uppercase tracking-wider'>#</th>`;
    html += `<th class='px-3 py-3 text-left text-xs font-bold text-purple-200 uppercase tracking-wider'>Order No</th>`;
    html += `<th class='px-3 py-3 text-left text-xs font-bold text-purple-200 uppercase tracking-wider'>Date</th>`;
    html += `<th class='px-3 py-3 text-left text-xs font-bold text-purple-200 uppercase tracking-wider'>PO</th>`;
    html += `<th class='px-3 py-3 text-left text-xs font-bold text-purple-200 uppercase tracking-wider'>Silo</th>`;
    html += `<th class='px-3 py-3 text-left text-xs font-bold text-purple-200 uppercase tracking-wider'>Type</th>`;
    html += `<th class='px-3 py-3 text-right text-xs font-bold text-purple-200 uppercase tracking-wider'>Qty</th>`;
    html += `<th class='px-3 py-3 text-center text-xs font-bold text-purple-200 uppercase tracking-wider'>Actions</th>`;
    html += `</tr></thead>`;
    html += `<tbody class='divide-y divide-purple-500/20'>`;
    
    if (rows.length === 0) {
        html += `<tr><td colspan='9' class='px-3 py-8 text-center text-purple-300'>`;
        html += searchTerm ? 'ไม่พบข้อมูลที่ค้นหา' : 'ยังไม่มีข้อมูล';
        html += `</td></tr>`;
    } else {
        rows.forEach((row, i) => {
            const actualIdx = allData.findIndex(r => r.orderNo === row.orderNo && r.orderPO === row.orderPO);
            const isExpanded = expandedRows.has(actualIdx);
            
            // Main row
            html += `<tr class='hover:bg-purple-600/20 transition-colors border-b border-purple-500/10'>`;
            html += `<td class='px-3 py-3 text-center'>`;
            html += `<button class='expand-toggle text-purple-300 hover:text-purple-100 transition-colors' data-idx='${actualIdx}'>`;
            html += isExpanded 
                ? `<svg class='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'></path></svg>`
                : `<svg class='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M9 5l7 7-7 7'></path></svg>`;
            html += `</button></td>`;
            html += `<td class='px-3 py-3 text-sm text-purple-200 text-center font-medium'>${start + i + 1}</td>`;
            html += `<td class='px-3 py-3 text-sm text-purple-100 font-semibold'>${row.orderNo}</td>`;
            html += `<td class='px-3 py-3 text-sm text-purple-200'>${row.orderDate}</td>`;
            html += `<td class='px-3 py-3 text-sm text-purple-100 font-medium'>${row.orderPO}</td>`;
            html += `<td class='px-3 py-3 text-sm text-purple-200'>${row.bagSilo}</td>`;
            html += `<td class='px-3 py-3 text-sm text-purple-100'>${row.bagType}</td>`;
            html += `<td class='px-3 py-3 text-sm text-white text-right font-semibold'>${row.quantity}</td>`;
            html += `<td class='px-3 py-3 text-sm text-center'>`;
            html += `<button class='text-blue-400 hover:text-blue-300 mr-3 transition-colors history-edit bg-transparent border-none p-1 rounded hover:bg-blue-500/20' data-idx='${actualIdx}' title='นำข้อมูลไปยังฟอร์ม'>`;
            html += `<i class="fas fa-pencil-alt text-sm"></i>`;
            html += `</button>`;
            html += `<button class='text-red-400 hover:text-red-300 transition-colors history-delete bg-transparent border-none p-1 rounded hover:bg-red-500/20' data-idx='${actualIdx}' title='ลบรายการนี้'>`;
            html += `<i class="fas fa-eraser text-sm"></i>`;
            html += `</button>`;
            html += `</td>`;
            html += `</tr>`;
            
            // Detail subrow (expanded)
            if (isExpanded) {
                html += `<tr class='bg-purple-800/30 border-b border-purple-500/20'>`;
                html += `<td colspan='9' class='px-12 py-4'>`;
                html += `<div class='grid grid-cols-2 gap-4 text-sm'>`;
                html += `<div><span class='font-semibold text-purple-300'>Line:</span> <span class='text-purple-200'>${row.bagLine}</span></div>`;
                html += `<div><span class='font-semibold text-purple-300'>Lot No:</span> <span class='text-purple-200'>${row.lotNo || '-'}</span></div>`;
                html += `<div><span class='font-semibold text-purple-300'>Remark Type:</span> <span class='px-2 py-1 text-xs font-medium rounded-full ${row.remarkType === 'PREMIUM' ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}'>${row.remarkType}</span></div>`;
                html += `<div><span class='font-semibold text-purple-300'>Package:</span> <span class='text-purple-200'>${row.packageType === 'pkg-25' ? 'Package 25 kg' : `Package ${row.packageValue} KG`}</span></div>`;
                html += `<div class='col-span-2'><span class='font-semibold text-purple-300'>Selected Options:</span> <span class='text-purple-200'>${row.selectedOptions || '-'}</span></div>`;
                html += `<div><span class='font-semibold text-purple-300'>Binary 8421:</span> <span class='text-purple-100 font-mono'>${row.binary8421} (${row.binaryString})</span></div>`;
                if (row.remarks && row.remarks.length > 0) {
                    html += `<div class='col-span-2'><span class='font-semibold text-purple-300'>Remarks:</span><ul class='mt-1 ml-4 list-disc text-purple-200'>`;
                    row.remarks.forEach(remark => {
                        html += `<li>${remark}</li>`;
                    });
                    html += `</ul></div>`;
                }
                html += `</div>`;
                html += `</td>`;
                html += `</tr>`;
            }
        });
    }
    html += `</tbody></table></div>`;
    
    // Pagination controls
    const totalPages = Math.ceil(total / pageSize);
    html += `<div class='flex justify-between items-center mt-4'>`;
    html += `<button class='px-4 py-2 text-sm font-medium text-purple-200 bg-purple-800/30 border border-purple-500/30 rounded-lg hover:bg-purple-700/40 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all history-prev' ${page === 1 ? 'disabled' : ''}>`;
    html += `<svg class='w-4 h-4 inline mr-1' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M15 19l-7-7 7-7'></path></svg>`;
    html += `ก่อนหน้า</button>`;
    html += `<span class='text-sm text-purple-200'>หน้า <span class='font-semibold text-purple-100'>${page}</span> / <span class='font-semibold text-purple-100'>${totalPages || 1}</span> <span class='text-purple-300'>(${total} รายการ)</span></span>`;
    html += `<button class='px-4 py-2 text-sm font-medium text-purple-200 bg-purple-800/30 border border-purple-500/30 rounded-lg hover:bg-purple-700/40 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all history-next' ${start + pageSize >= total ? 'disabled' : ''}>`;
    html += `ถัดไป<svg class='w-4 h-4 inline ml-1' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M9 5l7 7-7 7'></path></svg>`;
    html += `</button>`;
    html += `</div></div>`;
    
    container.innerHTML = html;
    
    // Attach events
    if (container) {
        // Search event
        const searchInput = container.querySelector('#history-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                renderHistoryTable(1, containerId, e.target.value);
            });
        }
        
        // Expand/collapse toggle
        container.querySelectorAll('.expand-toggle').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const idx = +btn.dataset.idx;
                if (expandedRows.has(idx)) {
                    expandedRows.delete(idx);
                } else {
                    expandedRows.add(idx);
                }
                renderHistoryTable(page, containerId, searchTerm);
            });
        });
        
        container.querySelectorAll('.history-edit').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = +btn.dataset.idx;
                const data = getHistoryData();
                const row = data[idx];
                populateFormFromRow(row);
                // Set edit mode
                if (window.setEditMode) {
                    window.setEditMode(idx);
                }
                // Scroll to form
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        });
        container.querySelectorAll('.history-delete').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = +btn.dataset.idx;
                let data = getHistoryData();
                if (!confirm('ลบรายการนี้?')) return;
                data.splice(idx, 1);
                saveHistoryData(data);
                const filteredData = filterData(data, searchTerm);
                const maxPage = Math.max(1, Math.ceil(filteredData.length / pageSize));
                let newPage = page;
                if (newPage > maxPage) newPage = maxPage;
                renderHistoryTable(newPage, containerId, searchTerm);
            });
        });
        container.querySelector('.history-prev')?.addEventListener('click', () => {
            if (page > 1) renderHistoryTable(page - 1, containerId, searchTerm);
        });
        container.querySelector('.history-next')?.addEventListener('click', () => {
            const filteredData = filterData(getHistoryData(), searchTerm);
            if ((page - 1) * pageSize + pageSize < filteredData.length) renderHistoryTable(page + 1, containerId, searchTerm);
        });
    }
}
