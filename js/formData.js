// formData.js - CRUD for form data table
export function getFormDataFromStorage() {
    return JSON.parse(localStorage.getItem('formDataTable') || '[]');
}
export function saveFormDataToStorage(data) {
    localStorage.setItem('formDataTable', JSON.stringify(data));
}
export function renderFormDataTable(config = {}, containerId = 'right-table-container') {
    // Support both old and new parameter formats
    const { onEdit, onDelete } = typeof config === 'string' ? { onEdit: null, onDelete: null } : config;
    const actualContainerId = typeof config === 'string' ? config : containerId;
    
    const data = getFormDataFromStorage();
    const container = document.getElementById(actualContainerId);
    if (!container) return;
    if (data.length === 0) {
        container.innerHTML = `
            <div class="w-full mx-auto mt-4">
                <div class="bg-purple-900/20 backdrop-blur rounded-2xl border border-purple-500/30 p-8 flex flex-col items-center justify-center min-h-[180px]">
                    <div class="text-purple-300 text-center">ยังไม่มีข้อมูลที่บันทึก</div>
                </div>
            </div>
        `;
        return;
    }
    let html = '<div class="w-full mx-auto mt-4">';
    html += '<table class="min-w-full border border-purple-500/30 rounded-xl overflow-hidden text-xs bg-purple-900/20 backdrop-blur">';
    html += '<thead class="bg-purple-700/30"><tr>';
    html += '<th class="px-3 py-2 text-purple-200">Field</th><th class="px-3 py-2 text-purple-200">Value</th><th class="px-3 py-2 text-purple-200">Actions</th>';
    html += '</tr></thead><tbody>';
    data.forEach((row, idx) => {
        Object.entries(row).forEach(([key, value], i) => {
            html += '<tr class="hover:bg-purple-600/20">';
            html += `<td class='px-3 py-2 font-bold text-purple-300'>${key}</td>`;
            html += `<td class='px-3 py-2'><input type='text' value='${value}' data-idx='${idx}' data-key='${key}' class='w-full bg-white/10 border border-purple-500/30 rounded px-2 py-1 text-white form-table-edit focus:ring-2 focus:ring-purple-400'/></td>`;
            if (i === 0) {
                html += `<td class='px-3 py-2' rowspan='${Object.keys(row).length}'>`;
                html += `<button data-idx='${idx}' class='text-red-400 hover:text-red-300 font-bold form-table-delete px-3 py-1 bg-red-500/20 rounded hover:bg-red-500/30 transition'>ลบ</button>`;
                html += '</td>';
            }
            html += '</tr>';
        });
    });
    html += '</tbody></table></div>';
    container.innerHTML = html;
    // Attach events
    if (onEdit) {
        container.querySelectorAll('.form-table-edit').forEach(input => {
            input.addEventListener('change', e => {
                const idx = +input.dataset.idx;
                const key = input.dataset.key;
                onEdit(idx, key, input.value);
            });
        });
    }
    if (onDelete) {
        container.querySelectorAll('.form-table-delete').forEach(btn => {
            btn.addEventListener('click', e => {
                const idx = +btn.dataset.idx;
                onDelete(idx);
            });
        });
    }
}
export function editFormData(idx, key, value) {
    const data = getFormDataFromStorage();
    data[idx][key] = value;
    saveFormDataToStorage(data);
}
export function deleteFormData(idx) {
    const data = getFormDataFromStorage();
    data.splice(idx, 1);
    saveFormDataToStorage(data);
}
export function pushFormDataFromForm(formIds, checkboxRadioData = {}) {
    const data = getFormDataFromStorage();
    const obj = {};
    // Get form field values
    formIds.forEach(id => {
        const el = document.getElementById(id);
        obj[id] = el ? el.value : '';
    });
    // Merge checkbox/radio data
    Object.assign(obj, checkboxRadioData);
    data.push(obj);
    saveFormDataToStorage(data);
}
