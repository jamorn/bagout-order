// toast.js - Toast notification
export function showToast(message) {
    let container = document.getElementById('toast-stack');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-stack';
        container.style.position = 'fixed';
        container.style.bottom = '32px';
        container.style.right = '32px';
        container.style.display = 'flex';
        container.style.flexDirection = 'column-reverse';
        container.style.gap = '10px';
        container.style.zIndex = 9999;
        document.body.appendChild(container);
    }
    let toast = document.createElement('div');
    toast.textContent = message;
    toast.className = 'toast-tmp';
    toast.style.position = 'static';
    toast.style.margin = '0';
    container.appendChild(toast);
    setTimeout(() => { toast.style.opacity = 1; }, 10);
    setTimeout(() => {
        toast.style.opacity = 0;
        setTimeout(() => {
            if (container.firstChild === toast) {
                container.removeChild(toast);
            }
        }, 400);
    }, 2200);
}
