// modal.js - lightweight promise-based modal dialogs
export function showConfirm(message) {
    return new Promise((resolve) => {
        const existing = document.getElementById('app-modal-overlay');
        if (existing) existing.remove();

        const overlay = document.createElement('div');
        overlay.id = 'app-modal-overlay';
        overlay.className = 'modal-overlay';

        const dialog = document.createElement('div');
        dialog.className = 'modal-dialog';

        const body = document.createElement('div');
        body.className = 'modal-body';
        body.innerHTML = `<div class="modal-message">${escapeHtml(message)}</div>`;

        const actions = document.createElement('div');
        actions.className = 'modal-actions';

        const btnCancel = document.createElement('button');
        btnCancel.className = 'btn btn-secondary';
        btnCancel.textContent = 'Cancel';

        const btnOk = document.createElement('button');
        btnOk.className = 'btn btn-primary';
        btnOk.textContent = 'OK';

        actions.appendChild(btnCancel);
        actions.appendChild(btnOk);

        dialog.appendChild(body);
        dialog.appendChild(actions);
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);

        // focus OK by default
        btnOk.focus();

        function cleanup() {
            btnOk.removeEventListener('click', onOk);
            btnCancel.removeEventListener('click', onCancel);
            overlay.remove();
        }

        function onOk() { cleanup(); resolve(true); }
        function onCancel() { cleanup(); resolve(false); }

        btnOk.addEventListener('click', onOk);
        btnCancel.addEventListener('click', onCancel);
    });
}

export function showPrompt(message, defaultValue = '') {
    return new Promise((resolve) => {
        const existing = document.getElementById('app-modal-overlay');
        if (existing) existing.remove();

        const overlay = document.createElement('div');
        overlay.id = 'app-modal-overlay';
        overlay.className = 'modal-overlay';

        const dialog = document.createElement('div');
        dialog.className = 'modal-dialog';

        const body = document.createElement('div');
        body.className = 'modal-body';

        const msg = document.createElement('div');
        msg.className = 'modal-message';
        msg.innerHTML = escapeHtml(message);

        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'modal-input';
        input.value = defaultValue;

        const actions = document.createElement('div');
        actions.className = 'modal-actions';

        const btnCancel = document.createElement('button');
        btnCancel.className = 'btn btn-secondary';
        btnCancel.textContent = 'Cancel';

        const btnOk = document.createElement('button');
        btnOk.className = 'btn btn-primary';
        btnOk.textContent = 'OK';

        actions.appendChild(btnCancel);
        actions.appendChild(btnOk);

        body.appendChild(msg);
        body.appendChild(input);
        dialog.appendChild(body);
        dialog.appendChild(actions);
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);

        // focus input
        input.focus();

        function cleanup() {
            btnOk.removeEventListener('click', onOk);
            btnCancel.removeEventListener('click', onCancel);
            overlay.remove();
        }

        function onOk() { const v = input.value.trim(); cleanup(); resolve(v); }
        function onCancel() { cleanup(); resolve(null); }

        btnOk.addEventListener('click', onOk);
        btnCancel.addEventListener('click', onCancel);

        // allow Enter/Escape
        overlay.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') onOk();
            if (e.key === 'Escape') onCancel();
        });
    });
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
