// theme.js - simple theme switcher (ES6 module)
export function initTheme() {
    const select = document.getElementById('themeSelect');
    const stored = localStorage.getItem('bagout_theme') || 'purple';
    applyTheme(stored);
    if (select) {
        select.value = stored;
        select.addEventListener('change', (e) => {
            const v = e.target.value || 'purple';
            localStorage.setItem('bagout_theme', v);
            applyTheme(v);
        });
    }
}

function applyTheme(name) {
    const el = document.body || document.documentElement;
    if (!el) return;
    if (name === 'emerald') {
        // set attribute on body for CSS overrides
        document.body.setAttribute('data-theme', 'emerald');
    } else {
        document.body.removeAttribute('data-theme');
    }
}
