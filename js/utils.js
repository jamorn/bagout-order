// utils.js - Helper functions
export function pad(num, size = 2) {
    let s = num + "";
    while (s.length < size) s = "0" + s;
    return s;
}
export function generateOrderNo() {
    const now = new Date();
    const year = now.getFullYear();
    const yy = year.toString().slice(-2);
    
    // Get max running number from history table
    const historyData = JSON.parse(localStorage.getItem('bagoutOrderHistory') || '[]');
    let maxRunning = 0;
    
    historyData.forEach(row => {
        if (row.orderNo) {
            const parts = row.orderNo.split('/');
            if (parts.length === 2 && parts[1] === yy) {
                const num = parseInt(parts[0], 10);
                if (!isNaN(num) && num > maxRunning) {
                    maxRunning = num;
                }
            }
        }
    });
    
    const running = maxRunning + 1;
    return pad(running, 3) + '/' + yy;
}
export function handlePOInput(input) {
    input.value = input.value.replace(/[^0-9]/g, '');
    const count = input.value.length;
    const poCountEl = document.getElementById('poCount');
    if (poCountEl) poCountEl.textContent = count + '/9';
    const check = document.getElementById('poCheck');
    if (count === 9) {
        if (check) check.classList.remove('hidden');
        if (poCountEl) {
            poCountEl.classList.remove('text-purple-300');
            poCountEl.classList.add('text-green-600');
        }
    } else {
        if (check) check.classList.add('hidden');
        if (poCountEl) {
            poCountEl.classList.remove('text-green-600');
            poCountEl.classList.add('text-purple-300');
        }
    }
}
export function handleOrderNoInput(input) {
    input.value = input.value.replace(/[^0-9\/]/g, '');
}
export function handleQuantityInput(input) {
    let val = input.value;
    val = val.replace(/[^0-9.]/g, '');
    const parts = val.split('.');
    if (parts.length > 2) val = parts[0] + '.' + parts.slice(1).join('');
    if (parts[1]) val = parts[0] + '.' + parts[1].slice(0,2);
    input.value = val;
}
export function handleLotNoInput(input) {
    input.value = input.value.replace(/[^0-9]/g, '');
    const count = input.value.length;
    const lotNoCount = document.getElementById('lotNoCount');
    lotNoCount.textContent = count + '/10';
    const lotCheck = document.getElementById('lotCheck');
    if (count === 10) {
        if (lotNoCount) {
            lotNoCount.classList.remove('text-purple-300');
            lotNoCount.classList.add('text-green-600');
        }
        if (lotCheck) lotCheck.classList.remove('hidden');
    } else {
        if (lotNoCount) {
            lotNoCount.classList.remove('text-green-600');
            lotNoCount.classList.add('text-purple-300');
        }
        if (lotCheck) lotCheck.classList.add('hidden');
    }
}
