// formData.js - CRUD for form data table
export function getFormDataFromStorage() {
    return JSON.parse(localStorage.getItem('formDataTable') || '[]');
}
export function saveFormDataToStorage(data) {
    localStorage.setItem('formDataTable', JSON.stringify(data));
}
export function renderFormDataTable({containerId = 'right-table-container', onEdit, onDelete} = {}) {
    const data = getFormDataFromStorage();
    const container = document.getElementById(containerId);
    if (!container) return;
    if (data.length === 0) {
        container.innerHTML = `
            <div class="w-full max-w-2xl mx-auto mt-8">
                <div class="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 flex flex-col items-center justify-center min-h-[180px]">
                    <div class="text-gray-400 text-center">ยังไม่มีข้อมูลที่บันทึก</div>
                </div>
            </div>
        `;
        return;
    }
    let html = '<div class="w-full max-w-2xl mx-auto mt-8">';
    html += '<table class="min-w-full border border-gray-200 rounded-xl overflow-hidden text-xs bg-white">';
    html += '<thead class="bg-gray-50"><tr>';
    html += '<th class="px-2 py-1">Field</th><th class="px-2 py-1">Value</th><th class="px-2 py-1">Actions</th>';
    html += '</tr></thead><tbody>';
    data.forEach((row, idx) => {
        Object.entries(row).forEach(([key, value], i) => {
            html += '<tr>';
            html += `<td class='px-2 py-1 font-bold text-blue-900'>${key}</td>`;
            html += `<td class='px-2 py-1'><input type='text' value='${value}' data-idx='${idx}' data-key='${key}' class='w-full bg-transparent border-b border-gray-200 form-table-edit'/></td>`;
            if (i === 0) {
                html += `<td class='px-2 py-1' rowspan='${Object.keys(row).length}'>`;
                html += `<button data-idx='${idx}' class='text-red-600 font-bold form-table-delete'>ลบ</button>`;
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
