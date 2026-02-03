// customDropdown.js - Convert native <select> elements into custom dropdowns

export function initCustomDropdowns(root = document) {
    const selects = Array.from(root.querySelectorAll('select'));

    selects.forEach(select => {
        // Skip if already converted or if select has attribute data-native (explicitly keep native)
        if (select.dataset.customized === '1' || select.closest('.custom-dropdown-container')) return;

        // Hide the native select but keep it in DOM for form submission
        select.style.display = 'none';
        select.dataset.customized = '1';

        const container = document.createElement('div');
        container.className = 'custom-dropdown-container';
        container.id = `cd-${select.id || Math.random().toString(36).slice(2,8)}`;
        // Link select <-> container for refresh
        select.dataset.customContainerId = container.id;

        const trigger = document.createElement('button');
        trigger.type = 'button';
        trigger.className = 'dropdown-trigger';
        trigger.innerHTML = `<span class="selected-text">${getSelectedText(select) || select.querySelector('option')?.textContent || 'เลือก...'}</span><span class="dropdown-arrow">▾</span>`;

        const menu = document.createElement('div');
        menu.className = 'dropdown-menu';

        // Build menu items from select options
        buildMenuForSelect(select, menu, trigger, container);

        // Insert elements
        select.parentNode.insertBefore(container, select.nextSibling);
        container.appendChild(trigger);
        container.appendChild(menu);

        // Toggle handling
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            const isActive = container.classList.contains('active');
            closeAllDropdowns();
            if (!isActive) openDropdown(container);
        });

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.custom-dropdown-container')) closeAllDropdowns();
        });

        // ESC handler
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeAllDropdowns();
        });
    });

    function getSelectedText(selectEl) {
        const sel = selectEl.options[selectEl.selectedIndex];
        return sel ? sel.textContent : '';
    }

    function closeAllDropdowns() {
        document.querySelectorAll('.custom-dropdown-container.active').forEach(c => closeDropdown(c));
    }

    function openDropdown(container) {
        container.classList.add('active');
        container.querySelector('.dropdown-trigger')?.classList.add('active');
        container.querySelector('.dropdown-menu')?.classList.add('active');
    }

    function closeDropdown(container) {
        container.classList.remove('active');
        container.querySelector('.dropdown-trigger')?.classList.remove('active');
        container.querySelector('.dropdown-menu')?.classList.remove('active');
    }
}

/**
 * Rebuild menu for a specific native select element (useful when options change)
 * @param {HTMLSelectElement} select
 */
export function refreshCustomDropdown(select) {
    if (!select || !select.dataset.customized) return;
    const containerId = select.dataset.customContainerId;
    if (!containerId) return;
    const container = document.getElementById(containerId);
    if (!container) return;
    const trigger = container.querySelector('.dropdown-trigger');
    const menu = container.querySelector('.dropdown-menu');
    if (!menu || !trigger) return;

    // Clear existing menu
    menu.innerHTML = '';

    buildMenuForSelect(select, menu, trigger, container);

    // Update trigger text
    const selText = select.options[select.selectedIndex]?.textContent || select.querySelector('option')?.textContent || '';
    const txtEl = trigger.querySelector('.selected-text');
    if (txtEl) txtEl.textContent = selText;

    // Reflect disabled state
    if (select.disabled) {
        trigger.setAttribute('disabled', 'disabled');
        trigger.classList.add('disabled');
    } else {
        trigger.removeAttribute('disabled');
        trigger.classList.remove('disabled');
    }
}

// Module-level helpers so buildMenuForSelect can call them
function closeDropdown(container) {
    if (!container) return;
    container.classList.remove('active');
    container.querySelector('.dropdown-trigger')?.classList.remove('active');
    container.querySelector('.dropdown-menu')?.classList.remove('active');
}

function openDropdown(container) {
    if (!container) return;
    container.classList.add('active');
    container.querySelector('.dropdown-trigger')?.classList.add('active');
    container.querySelector('.dropdown-menu')?.classList.add('active');
}

function closeAllDropdowns() {
    document.querySelectorAll('.custom-dropdown-container.active').forEach(c => {
        closeDropdown(c);
    });
}

function buildMenuForSelect(select, menu, trigger, container) {
    Array.from(select.options).forEach(opt => {
        const item = document.createElement('div');
        item.className = 'dropdown-item';
        item.dataset.value = opt.value;
        item.textContent = opt.textContent;
        if (opt.disabled) item.classList.add('disabled');
        if (opt.selected) item.classList.add('selected');

        item.addEventListener('click', (e) => {
            e.stopPropagation();
            // Update native select
            select.value = opt.value;
            // Update trigger text
            const txt = item.textContent;
            trigger.querySelector('.selected-text').textContent = txt;

            // mark selected styles
            menu.querySelectorAll('.dropdown-item').forEach(i=>i.classList.remove('selected'));
            item.classList.add('selected');

            // close
            closeDropdown(container);

            // dispatch change event on native select
            select.dispatchEvent(new Event('change', { bubbles: true }));
        });

        menu.appendChild(item);
    });
}
