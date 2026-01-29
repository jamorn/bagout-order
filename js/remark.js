// remark.js - Manage remark rows
import { showToast } from './toast.js';
export function updateRemarkIndices() {
    const rows = document.querySelectorAll('.remark-row');
    rows.forEach((row, index) => {
        const indexBadge = row.querySelector('.remark-addon');
        if (indexBadge) indexBadge.textContent = (index + 1).toString();
    });
}
export function addRemarkRow(val = '') {
    const list = document.getElementById('remarksList');
    const rows = list.querySelectorAll('.remark-row');
    if (rows.length >= 5) {
        showToast('เพิ่มหมายเหตุได้สูงสุด 5 แถวเท่านั้น');
        return;
    }
    if (rows.length > 0 && !val) {
        const lastInput = rows[rows.length - 1].querySelector('.remark-input');
        if (lastInput && !lastInput.value.trim()) {
            showToast('กรุณากรอกหมายเหตุในแถวก่อนหน้าก่อนเพิ่มใหม่');
            lastInput.focus();
            return;
        }
    }
    const rowId = 'remark-' + Date.now();
    const div = document.createElement('div');
    div.className = 'remark-row flex items-center gap-2 w-full bg-purple-900/30 backdrop-blur rounded-xl border border-purple-500/40 px-3 py-2 hover:bg-purple-800/40 transition-all shadow-lg shadow-purple-500/10';
    div.id = rowId;
    div.innerHTML = `
        <span class="remark-addon font-bold text-purple-100 bg-purple-600/40 px-2 py-1 rounded mr-2 shadow-sm">1</span>
        <input type="text" class="remark-input flex-1 bg-transparent border-0 outline-none text-base text-white placeholder-purple-200" value="${val}" placeholder="พิมพ์หมายเหตุเพิ่มเติมที่นี่..." />
        <button type="button" class="remark-delete-btn ml-2 text-purple-400 hover:text-red-300 transition-colors p-1 rounded hover:bg-red-500/20" aria-label="ลบ" data-id="${rowId}">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
        </button>`;
    list.appendChild(div);
    updateRemarkIndices();
}
export function removeRemarkRow(id) {
    const rows = document.querySelectorAll('.remark-row');
    if (rows.length > 1) {
        const row = document.getElementById(id);
        if (row) row.remove();
        updateRemarkIndices();
    } else {
        const input = document.querySelector(`#${id} .remark-input`);
        if (input) input.value = '';
    }
}
