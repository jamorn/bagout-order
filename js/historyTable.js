// historyTable.js - Manage BAGOUT ORDER History Table (with localStorage and mock data)
import orderHistory from '../data/order-history.js';
import siloData from '../data/siloData.js';

const HISTORY_KEY = 'bagoutOrderHistory';
const pageSize = 15;
let currentSearchTerm = '';
let expandedRows = new Set(); // Track expanded rows by index

// Format timestamp (ISO or ms) to dd/MM/yyyy HH:mm
function formatTimestamp(ts) {
    if (!ts) return '';
    const d = new Date(ts);
    if (isNaN(d.getTime())) return '';
    const pad = n => n.toString().padStart(2, '0');
    return `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

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
    if (row.issuerBy) document.getElementById('issuerBy').value = row.issuerBy;
    if (row.approverBy) document.getElementById('approverBy').value = row.approverBy;
    if (row.receiveBy) document.getElementById('receiveBy').value = row.receiveBy;
    if (row.lotNo) document.getElementById('lotNo').value = row.lotNo;
    // Trigger input handlers to update counters and UI
    if (window.handlePOInput) {
        const poEl = document.getElementById('orderPO');
        if (poEl) window.handlePOInput(poEl);
    }
    if (window.handleLotNoInput) {
        const lotEl = document.getElementById('lotNo');
        if (lotEl) window.handleLotNoInput(lotEl);
    }
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
    // Ensure older records have workflow fields
    migrateHistoryDataIfNeeded();
    // Seed PP workflow statuses once for realism
    seedPPWorkflowIfNeeded();
    renderHistoryTable(1, containerId);
}

function migrateHistoryDataIfNeeded() {
    const data = getHistoryData() || [];
    let changed = false;
    data.forEach((row) => {
        if (!row.docStatus) {
            row.docStatus = 'Draft';
            changed = true;
        }
        if (!row.currentOwner) {
            row.currentOwner = row.issuerBy || row.approverBy || row.receiveBy || '';
            changed = true;
        }
        if (!row.stateHistory) {
            row.stateHistory = [{ state: row.docStatus || 'Draft', by: row.currentOwner || '', at: row.orderDate || new Date().toISOString() }];
            changed = true;
        }
    });
    if (changed) saveHistoryData(data);
}

// One-time seed to make PP queue more realistic: pick 5 PP items (newest first), mark 3 as Assigned (waiting approval) and 2 as Draft
function seedPPWorkflowIfNeeded() {
    try {
        console.debug('seedPPWorkflowIfNeeded: starting');
        if (localStorage.getItem('bagoutWorkflowSeeded') === '1') {
            console.debug('seedPPWorkflowIfNeeded: already seeded, skipping');
            return;
        }
        const data = getHistoryData() || [];
        // Filter by plant 'PP' (case-insensitive)
        const ppItems = data.filter(r => {
            const plant = (r.plant || '').toString().toUpperCase();
            if (plant === 'PP') return true;
            // fallback: infer plant from bagSilo using siloData
            if (r.bagSilo) {
                const s = siloData.find(s => s.SiloName === r.bagSilo);
                if (s && (s.Plant || '').toString().toUpperCase() === 'PP') return true;
            }
            return false;
        });
        console.debug('seedPPWorkflowIfNeeded: ppItems found =', ppItems.length);
        if (ppItems.length === 0) {
            // nothing to seed right now — keep flag unset so future attempts can run
            console.debug('seedPPWorkflowIfNeeded: no PP items to seed, leaving flag unset');
            return;
        }
        // Sort by Order No numeric desc (newest first on UI) — parse leading number before '/'
        ppItems.sort((a, b) => {
            const numA = parseInt((a.orderNo || '').toString().split('/')[0], 10) || 0;
            const numB = parseInt((b.orderNo || '').toString().split('/')[0], 10) || 0;
            return numB - numA;
        });
        const toSeed = ppItems.slice(0, 5);
        const changedRows = [];
        // Apply: first 3 -> Draft (newest), next 2 -> Assigned (older)
        toSeed.forEach((row, idx) => {
            // Prefer matching by `id` if present
            let actualIdx = -1;
            if (row.id !== undefined) {
                actualIdx = data.findIndex(r => r.id === row.id);
            }
            if (actualIdx === -1) {
                actualIdx = data.findIndex(r => r.orderNo === row.orderNo && r.orderPO === row.orderPO && r.orderDate === row.orderDate);
            }
            if (actualIdx === -1) return;
            if (idx < 3) {
                // Newest -> Draft (waiting)
                data[actualIdx].docStatus = 'Draft';
                if (!Array.isArray(data[actualIdx].stateHistory)) data[actualIdx].stateHistory = [];
                data[actualIdx].stateHistory.push({ state: 'Draft', by: data[actualIdx].currentOwner || '', at: new Date().toISOString() });
                changedRows.push({ idx: actualIdx, orderNo: data[actualIdx].orderNo, status: 'Draft' });
            } else {
                // Older within the 5 -> Assigned
                data[actualIdx].docStatus = 'Assigned';
                data[actualIdx].currentOwner = data[actualIdx].approverBy || data[actualIdx].currentOwner || 'Shift Sup.';
                if (!Array.isArray(data[actualIdx].stateHistory)) data[actualIdx].stateHistory = [];
                data[actualIdx].stateHistory.push({ state: 'Assigned', by: data[actualIdx].currentOwner, at: new Date().toISOString() });
                changedRows.push({ idx: actualIdx, orderNo: data[actualIdx].orderNo, status: 'Assigned' });
            }
        });
        if (changedRows.length > 0) {
            saveHistoryData(data);
            localStorage.setItem('bagoutWorkflowSeeded', '1');
            console.debug('seedPPWorkflowIfNeeded: applied seed to rows:', changedRows);
        } else {
            console.debug('seedPPWorkflowIfNeeded: nothing actually changed during seeding');
        }
    } catch (e) {
        console.error('seedPPWorkflowIfNeeded error', e);
    }
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
        remarks: remarks
        ,
        // workflow fields
        docStatus: formData.docStatus || 'Draft',
        currentOwner: formData.issuerBy || formData.approverBy || formData.receiveBy || '',
        stateHistory: [{ state: formData.docStatus || 'Draft', by: formData.issuerBy || '', at: new Date().toISOString() }]
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
        issuerBy: formData.issuerBy || '',
        approverBy: formData.approverBy || '',
        receiveBy: formData.receiveBy || '',
        // Preserve existing timestamp if present; otherwise set to now when the person field is present
        issuerAt: (historyData[index] && historyData[index].issuerAt) ? historyData[index].issuerAt : (formData.issuerBy ? new Date().toISOString() : ''),
        approverAt: (historyData[index] && historyData[index].approverAt) ? historyData[index].approverAt : (formData.approverBy ? new Date().toISOString() : ''),
        receiveAt: (historyData[index] && historyData[index].receiveAt) ? historyData[index].receiveAt : (formData.receiveBy ? new Date().toISOString() : ''),
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
        // ensure workflow fields exist
        if (!historyData[index].docStatus) historyData[index].docStatus = 'Draft';
        if (!historyData[index].currentOwner) historyData[index].currentOwner = historyData[index].issuerBy || historyData[index].approverBy || historyData[index].receiveBy || '';
        if (!Array.isArray(historyData[index].stateHistory)) historyData[index].stateHistory = [{ state: historyData[index].docStatus, by: historyData[index].currentOwner, at: new Date().toISOString() }];
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
    const allData = getHistoryData() || [];
    
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
    html += `<th class='px-3 py-3 text-center text-xs font-bold text-purple-200 uppercase tracking-wider'>Status</th>`;
    html += `<th class='px-3 py-3 text-center text-xs font-bold text-purple-200 uppercase tracking-wider'>Actions</th>`;
    html += `</tr></thead>`;
    html += `<tbody class='divide-y divide-purple-500/20'>`;
    
    if (rows.length === 0) {
        html += `<tr><td colspan='10' class='px-3 py-8 text-center text-purple-300'>`;
        html += searchTerm ? 'ไม่พบข้อมูลที่ค้นหา' : 'ยังไม่มีข้อมูล';
        html += `</td></tr>`;
    } else {
        rows.forEach((row, i) => {
            const actualIdx = allData.findIndex(r => r.orderNo === row.orderNo && r.orderPO === row.orderPO);
            const isExpanded = expandedRows.has(actualIdx);
            const status = row.docStatus || 'Draft';
            // Use inline colors for badges to avoid Tailwind JIT missing dynamic classes
            let statusBg = '#374151'; // gray-700
            if (status === 'Approved') statusBg = '#10B981';
            else if (status === 'Assigned' || status === 'In Progress') statusBg = '#3B82F6';
            else if (status === 'Rejected') statusBg = '#EF4444';
            
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
            // Status column
            html += `<td class='px-3 py-3 text-sm text-center'><span class='inline-block px-2 py-1 text-xs font-semibold rounded' style='background:${statusBg};color:#fff'>${status}</span></td>`;
            html += `<td class='px-3 py-3 text-sm text-center'>`;
            // Quick approve/unapprove button (Shift Sup shortcut)
            const quickIcon = status === 'Approved' ? 'fa-solid fa-circle-check' : 'fa-regular fa-circle-check';
            html += `<button class='text-yellow-400 hover:text-yellow-300 mr-2 transition-colors quick-approve bg-transparent border-none p-1 rounded hover:bg-yellow-500/10' data-idx='${actualIdx}' title='Quick Approve/Unapprove (Shift Sup)'><i class="${quickIcon} text-sm"></i></button>`;
            html += `<button class='text-blue-400 hover:text-blue-300 mr-3 transition-colors history-edit bg-transparent border-none p-1 rounded hover:bg-blue-500/20' data-idx='${actualIdx}' title='นำข้อมูลไปยังฟอร์ม'>`;
            html += `<i class="fas fa-pencil-alt text-sm"></i>`;
            html += `</button>`;
            html += `<button class='text-red-400 hover:text-red-300 transition-colors history-delete bg-transparent border-none p-1 rounded hover:bg-red-500/20' data-idx='${actualIdx}' aria-label='ลบรายการนี้'>`;
            html += `<i class="fas fa-eraser text-sm"></i>`;
            html += `</button>`;
            html += `</td>`;
            html += `</tr>`;
            
            // Detail subrow (expanded)
            if (isExpanded) {
                html += `<tr class='bg-purple-800/30 border-b border-purple-500/20'>`;
                html += `<td colspan='10' class='px-12 py-4'>`;
                html += `<div class='grid grid-cols-2 gap-4 text-sm'>`;
                // Left column
                html += `<div><span class='font-semibold text-purple-300'>Line:</span> <span class='text-purple-200'>${row.bagLine}</span></div>`;
                // Right column: Lot No
                html += `<div><span class='font-semibold text-purple-300'>Lot No:</span> <span class='text-purple-200'>${row.lotNo || '-'}</span></div>`;
                // Left column second row: Remark Type
                html += `<div><span class='font-semibold text-purple-300'>Remark Type:</span> <span class='px-2 py-1 text-xs font-medium rounded-full ${row.remarkType === 'PREMIUM' ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}'>${row.remarkType}</span></div>`;
                // Left column: Selected Options (moved up beside Package/People)
                html += `<div><span class='font-semibold text-purple-300'>Selected Options:</span> <span class='text-purple-200'>${row.selectedOptions || '-'}</span></div>`;
                // Right column second row: Package + People box underneath
                html += `<div>`;
                html += `<div><span class='font-semibold text-purple-300'>Package:</span> <span class='text-purple-200'>${row.packageType === 'pkg-25' ? 'Package 25 kg' : `Package ${row.packageValue} KG`}</span></div>`;
                html += `<div class='mt-3 p-4 bg-purple-900/10 rounded min-h-[120px]'>`;
                html += `<div class='text-sm text-purple-200 space-y-1'>`;
                // Person badges with clearer, distinct background colors
                html += `<div><span class='font-semibold text-purple-300'>Issuer:</span> <span class='inline-flex items-center'>` +
                        (row.issuerBy ? `<span class='px-2 py-0.5 rounded text-xs font-medium bg-teal-500 text-white'>${row.issuerBy}</span>` : `<span class='px-2 py-0.5 rounded text-xs font-medium bg-gray-600 text-white'>-</span>`) +
                        (row.issuerAt ? `<span class='ml-2 text-purple-300 text-xs'>• ${formatTimestamp(row.issuerAt)}</span>` : '') +
                    `</span></div>`;

                html += `<div><span class='font-semibold text-purple-300'>Approver:</span> <span class='inline-flex items-center'>` +
                        (row.approverBy ? `<span class='px-2 py-0.5 rounded text-xs font-medium bg-amber-400 text-purple-900'>${row.approverBy}</span>` : `<span class='px-2 py-0.5 rounded text-xs font-medium bg-gray-600 text-white'>-</span>`) +
                        (row.approverAt ? `<span class='ml-2 text-purple-300 text-xs'>• ${formatTimestamp(row.approverAt)}</span>` : '') +
                    `</span></div>`;

                html += `<div><span class='font-semibold text-purple-300'>Receiver:</span> <span class='inline-flex items-center'>` +
                        (row.receiveBy ? `<span class='px-2 py-0.5 rounded text-xs font-medium bg-sky-500 text-white'>${row.receiveBy}</span>` : `<span class='px-2 py-0.5 rounded text-xs font-medium bg-gray-600 text-white'>-</span>`) +
                        (row.receiveAt ? `<span class='ml-2 text-purple-300 text-xs'>• ${formatTimestamp(row.receiveAt)}</span>` : '') +
                    `</span></div>`;
                html += `</div></div>`;
                // Action buttons (workflow)
                html += `<div class='flex justify-end items-center gap-2'>`;
                html += `<button class='px-3 py-1 text-xs rounded bg-blue-600 hover:bg-blue-500 workflow-action' data-idx='${actualIdx}' data-action='assign'>Assign to me</button>`;
                html += `<button class='px-3 py-1 text-xs rounded bg-green-500 hover:bg-green-400 workflow-action' data-idx='${actualIdx}' data-action='approve'>Approve</button>`;
                html += `<button class='px-3 py-1 text-xs rounded bg-red-500 hover:bg-red-400 workflow-action' data-idx='${actualIdx}' data-action='reject'>Reject</button>`;
                html += `</div>`;

                html += `</div>`;
                // Full width details below
                html += `<div><span class='font-semibold text-purple-300'>Binary 8421:</span> <span class='text-purple-100 font-mono'>${row.binary8421} (${row.binaryString})</span></div>`;
                if (row.remarks && row.remarks.length > 0) {
                    html += `<div class='col-span-2'><span class='font-semibold text-purple-300'>Remarks:</span><ul class='mt-1 ml-4 list-disc text-purple-200'>`;
                    row.remarks.forEach(remark => {
                        html += `<li>${remark}</li>`;
                    });
                    html += `</ul></div>`;
                }
                // Timeline (stateHistory)
                if (Array.isArray(row.stateHistory) && row.stateHistory.length > 0) {
                    html += `<div class='col-span-2 mt-4'><span class='font-semibold text-purple-300'>Timeline:</span><div class='mt-2 space-y-2 text-sm'>`;
                    row.stateHistory.forEach(entry => {
                        html += `<div class='flex items-center gap-3'><span class='text-purple-300 w-36'>${formatTimestamp(entry.at)}</span><span class='text-purple-200'>${entry.state} ${entry.by ? `• by ${entry.by}` : ''}</span></div>`;
                    });
                    html += `</div></div>`;
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
        // Workflow action handlers (Assign / Approve / Reject)
        const applyWorkflowAction = (idx, action) => {
            const data = getHistoryData();
            if (!data || !data[idx]) return;
            const row = data[idx];
            let by = '';
            if (action === 'assign') {
                by = prompt('ชื่อผู้รับผิดชอบ (มอบหมายให้):', '') || 'Me';
                row.currentOwner = by;
                row.docStatus = 'Assigned';
            } else if (action === 'approve') {
                by = row.approverBy || prompt('ชื่อผู้อนุมัติ:', '') || 'Approver';
                row.docStatus = 'Approved';
            } else if (action === 'reject') {
                by = row.approverBy || prompt('ชื่อผู้อนุมัติ (reject):', '') || 'Approver';
                row.docStatus = 'Rejected';
            }
            if (!Array.isArray(row.stateHistory)) row.stateHistory = [];
            row.stateHistory.push({ state: row.docStatus, by: by, at: new Date().toISOString() });
            saveHistoryData(data);
            renderHistoryTable(page, containerId, searchTerm);
        };

        container.querySelectorAll('.workflow-action').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const idx = +btn.dataset.idx;
                const action = btn.dataset.action;
                applyWorkflowAction(idx, action);
            });
        });
                // Quick-approve modal helpers (replaces native confirm)
                const ensureQuickApproveModal = () => {
                        if (document.getElementById('quick-approve-modal')) return;
                        const modalHtml = `
                        <div id="quick-approve-modal" class="fixed inset-0 z-50 hidden items-center justify-center px-4" aria-hidden="true">
                            <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" data-close="backdrop"></div>
                            <div class="relative w-full max-w-md mx-auto bg-purple-900/95 border border-purple-600/30 rounded-lg shadow-lg overflow-hidden"> 
                                <div class="p-4 border-b border-purple-700/30 flex items-start gap-3">
                                    <div class="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center text-purple-900 font-bold">OK</div>
                                    <div class="flex-1">
                                        <h3 class="text-lg font-semibold text-white">Quick Approve</h3>
                                        <p class="text-sm text-purple-300 mt-1">ยืนยันการอนุมัติหรือยกเลิกอย่างรวดเร็ว โดย Shift Sup.</p>
                                    </div>
                                    <button class="ml-2 text-purple-300 hover:text-white close-qa" aria-label="ปิด">✕</button>
                                </div>
                                <div class="p-4 space-y-3">
                                    <div class="text-sm text-purple-200">Order: <span id="qa-order-no" class="font-semibold text-white">-</span></div>
                                    <div class="text-sm text-purple-200">Current Status: <span id="qa-current-status" class="font-semibold text-white">-</span></div>
                                    <div>
                                        <label class="block text-xs text-purple-300 mb-1">ชื่อผู้อนุมัติ / ชื่อผู้ยกเลิก</label>
                                        <input id="qa-approver-name" class="w-full px-3 py-2 rounded bg-purple-800/40 border border-purple-700 text-white placeholder-purple-400 focus:outline-none" placeholder="Shift Sup." />
                                    </div>
                                    <div>
                                        <label class="block text-xs text-purple-300 mb-1">หมายเหตุ (ไม่บังคับ)</label>
                                        <textarea id="qa-comment" rows="3" class="w-full px-3 py-2 rounded bg-purple-800/40 border border-purple-700 text-white placeholder-purple-400 focus:outline-none" placeholder="เหตุผล / หมายเหตุ"></textarea>
                                    </div>
                                </div>
                                <div class="p-4 bg-purple-800/20 flex justify-end gap-3">
                                    <button class="px-4 py-2 rounded bg-transparent border border-purple-600 text-purple-200 hover:bg-purple-700/40 close-qa">ยกเลิก</button>
                                    <button id="qa-confirm-btn" class="px-4 py-2 rounded bg-yellow-400 text-purple-900 font-semibold hover:brightness-95">ยืนยัน</button>
                                </div>
                            </div>
                        </div>`;
                        const wrapper = document.createElement('div');
                        wrapper.innerHTML = modalHtml;
                        document.body.appendChild(wrapper.firstElementChild);

                        // Attach handlers
                        const modal = document.getElementById('quick-approve-modal');
                        modal.querySelectorAll('.close-qa').forEach(b => b.addEventListener('click', () => closeQuickApproveModal()));
                        modal.querySelector('[data-close="backdrop"]').addEventListener('click', () => closeQuickApproveModal());
                        modal.querySelector('#qa-confirm-btn').addEventListener('click', () => {
                                const idx = +modal.dataset.idx;
                                const name = (modal.querySelector('#qa-approver-name').value || 'Shift Sup.').trim();
                                const comment = modal.querySelector('#qa-comment').value || '';
                                // perform toggle
                                const data = getHistoryData();
                                if (!data || !data[idx]) return closeQuickApproveModal();
                                const row = data[idx];
                                const isApproved = (row.docStatus === 'Approved');
                                if (isApproved) {
                                        row.docStatus = 'Draft';
                                        if (!Array.isArray(row.stateHistory)) row.stateHistory = [];
                                        row.stateHistory.push({ state: 'Draft', by: name, at: new Date().toISOString(), note: comment });
                                } else {
                                        row.docStatus = 'Approved';
                                        row.approverBy = row.approverBy || name;
                                        row.approverAt = new Date().toISOString();
                                        row.currentOwner = row.currentOwner || row.approverBy;
                                        if (!Array.isArray(row.stateHistory)) row.stateHistory = [];
                                        row.stateHistory.push({ state: 'Approved', by: row.approverBy, at: row.approverAt, note: comment });
                                }
                                saveHistoryData(data);
                                closeQuickApproveModal();
                                renderHistoryTable(page, containerId, searchTerm);
                                try { renderBaggingTable(1, 'bagging-history-table'); } catch (e) {}
                        });
                        // ESC to close
                        document.addEventListener('keydown', (e) => {
                                if (e.key === 'Escape') closeQuickApproveModal();
                        });
                };

                const openQuickApproveModal = (idx) => {
                        ensureQuickApproveModal();
                        const modal = document.getElementById('quick-approve-modal');
                        if (!modal) return;
                        const data = getHistoryData();
                        const row = data && data[idx] ? data[idx] : null;
                        modal.dataset.idx = idx;
                        modal.querySelector('#qa-order-no').textContent = row ? (row.orderNo || '-') : '-';
                        modal.querySelector('#qa-current-status').textContent = row ? (row.docStatus || 'Draft') : '-';
                        modal.querySelector('#qa-approver-name').value = 'Shift Sup.';
                        modal.querySelector('#qa-comment').value = '';
                        modal.classList.remove('hidden');
                        modal.setAttribute('aria-hidden', 'false');
                        // focus input
                        setTimeout(() => modal.querySelector('#qa-approver-name').focus(), 50);
                };

                const closeQuickApproveModal = () => {
                        const modal = document.getElementById('quick-approve-modal');
                        if (!modal) return;
                        modal.classList.add('hidden');
                        modal.setAttribute('aria-hidden', 'true');
                };

                container.querySelectorAll('.quick-approve').forEach(btn => {
                        btn.addEventListener('click', (e) => {
                                e.stopPropagation();
                                const idx = +btn.dataset.idx;
                                openQuickApproveModal(idx);
                        });
                });
    }
}

// Render a Bagging-focused table (uses shared bagoutOrderHistory)
export function renderBaggingTable(page = 1, containerId = 'bagging-history-table') {
    const allData = getHistoryData() || [];
    // Show records ready for bagging: Approved / Assigned / In Progress / Received
    const data = allData.filter(r => {
        const s = (r.docStatus || 'Draft');
        return s === 'Approved' || s === 'Assigned' || s === 'In Progress' || s === 'Received';
    });
    const total = data.length;
    const start = (page - 1) * pageSize;
    const rows = data.slice(start, start + pageSize);
    const container = document.getElementById(containerId);
    if (!container) return;

    let html = `<div class='w-full mx-auto history-table-container'>`;
    html += `<div class='mb-4'><h3 class='text-lg font-semibold text-purple-200'>Bagging Queue</h3></div>`;
    html += `<div class='overflow-x-auto rounded-lg border border-purple-500/30 shadow-lg'>`;
    html += `<table class='min-w-full divide-y divide-purple-500/20 bg-purple-900/20'>`;
    html += `<thead class='bg-purple-700/20'><tr>`;
    html += `<th class='px-3 py-3 text-left text-xs font-bold text-purple-200 uppercase'>#</th>`;
    html += `<th class='px-3 py-3 text-left text-xs font-bold text-purple-200 uppercase'>Plant</th>`;
    html += `<th class='px-3 py-3 text-left text-xs font-bold text-purple-200 uppercase'>Date</th>`;
    html += `<th class='px-3 py-3 text-left text-xs font-bold text-purple-200 uppercase'>PO</th>`;
    html += `<th class='px-3 py-3 text-left text-xs font-bold text-purple-200 uppercase'>Silo</th>`;
    html += `<th class='px-3 py-3 text-left text-xs font-bold text-purple-200 uppercase'>Type</th>`;
    html += `<th class='px-3 py-3 text-right text-xs font-bold text-purple-200 uppercase'>Qty</th>`;
    html += `<th class='px-3 py-3 text-left text-xs font-bold text-purple-200 uppercase'>Status</th>`;
    html += `<th class='px-3 py-3 text-center text-xs font-bold text-purple-200 uppercase'>Action</th>`;
    html += `</tr></thead><tbody class='divide-y divide-purple-500/20'>`;

    if (rows.length === 0) {
        html += `<tr><td colspan='9' class='px-3 py-8 text-center text-purple-300'>No items in bagging queue</td></tr>`;
    } else {
        rows.forEach((row, i) => {
            const actualIdx = allData.findIndex(r => r.orderNo === row.orderNo && r.orderPO === row.orderPO && r.orderDate === row.orderDate);
            const status = row.docStatus || 'Draft';
            let statusBg = '#374151';
            if (status === 'Approved') statusBg = '#10B981';
            else if (status === 'Assigned' || status === 'In Progress') statusBg = '#3B82F6';
            else if (status === 'Rejected') statusBg = '#EF4444';

            html += `<tr class='hover:bg-purple-600/10'>`;
            html += `<td class='px-3 py-3 text-sm text-purple-200'>${start + i + 1}</td>`;
            html += `<td class='px-3 py-3 text-sm text-purple-200'>${row.plant || '-'}</td>`;
            html += `<td class='px-3 py-3 text-sm text-purple-200'>${row.orderDate}</td>`;
            html += `<td class='px-3 py-3 text-sm text-purple-200'>${row.orderPO}</td>`;
            html += `<td class='px-3 py-3 text-sm text-purple-200'>${row.bagSilo}</td>`;
            html += `<td class='px-3 py-3 text-sm text-purple-200'>${row.bagType}</td>`;
            html += `<td class='px-3 py-3 text-sm text-white text-right font-semibold'>${row.quantity}</td>`;
            html += `<td class='px-3 py-3 text-sm text-center'><span style='background:${statusBg};color:#fff;padding:4px 8px;border-radius:6px;font-size:12px'>${status}</span></td>`;
            html += `<td class='px-3 py-3 text-center'><button class='px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white bagging-receive' data-idx='${actualIdx}'>รับ</button></td>`;
            html += `</tr>`;
        });
    }

    html += `</tbody></table></div></div>`;
    container.innerHTML = html;

    // attach events to receive buttons
    container.querySelectorAll('.bagging-receive').forEach(btn => {
        btn.addEventListener('click', () => {
            const idx = +btn.dataset.idx;
            // open modal via window helper (defined in index.html)
            if (window.openReceiveModal) window.openReceiveModal(idx);
        });
    });
}

// Confirm receive action invoked from modal (index.html will import and call this)
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
    try { renderHistoryTable(1, 'main-history-table'); } catch (e) {}
    return true;
}
