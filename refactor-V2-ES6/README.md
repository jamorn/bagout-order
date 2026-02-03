# BAGOUT ORDER - ES6 Modules Version

## 📁 โครงสร้างโปรเจกต์

```
refactor-V2-ES6/
├── index.html              # หน้าหลัก (ES6 module imports)
├── css/
│   └── style.css          # Stylesheet หลัก
├── js/                    # ES6 Modules
│   ├── utils.js           # Utility functions
│   ├── toast.js           # Toast notification system
│   ├── checkboxGroup.js   # Checkbox management + Binary 8421 encoding
│   ├── remark.js          # Remark row management (max 5 rows)
│   ├── historyTable.js    # History table with localStorage
│   └── formData.js        # Form data management (main controller)
└── data/                  # Data files (shared from root)
    ├── siloData.js        # Silo และ Line mappings
    ├── grade_pp.js        # PP Grade list สำหรับ autocomplete
    └── order-history.js   # Mock history data
```

## ⚡ คุณสมบัติหลัก

### 1. **ES6 Modules**
- ใช้ `import/export` แบบ Native ES6
- แยก module ตามหน้าที่การทำงาน
- ไม่ต้องใช้ build tools (webpack, vite)

### 2. **Binary 8421 Encoding**
- เข้ารหัส checkbox 7 ตัวเป็น binary number
- ค่าตั้งแต่ 0-127
- แสดง binary string 7 หลัก (เช่น `0001101`)

### 3. **Form Features**
- ✅ Auto-generate Order Number
- ✅ PO Number counter (max 9 ตัวอักษร)
- ✅ Lot Number counter (max 10 ตัวอักษร)
- ✅ Silo → Line dependency dropdown
- ✅ Autocomplete สำหรับ Bag Type (แสดง 5 รายการ)
- ✅ Person selection (Issuer, Approver, Receiver)
- ✅ Checkbox highlighting เมื่อเลือก
- ✅ Package type selection (JUMBO, 25KG, 50KG, Custom)
- ✅ Remark management (max 5 rows)

### 4. **History Table**
- ✅ Pagination (15 รายการต่อหน้า)
- ✅ Search/Filter
- ✅ Expand/Collapse details
- ✅ Quick Approve button
- ✅ Edit และ Delete record
- ✅ localStorage persistence

### 5. **Validation**
- Required fields checking
- Character limits
- Number range validation
- Toast notifications สำหรับ feedback

## 🚀 วิธีใช้งาน

### 1. เปิดด้วย Live Server
```bash
# ต้องใช้ web server เพราะ ES6 modules ต้องทำงานผ่าน HTTP
# ไม่สามารถเปิด file:// ได้

# ใช้ VS Code Live Server หรือ
python -m http.server 5500
# แล้วเปิด http://localhost:5500/
```

### 2. กรอกฟอร์ม
1. **Date/Time** และ **Order No.** จะถูกสร้างอัตโนมัติ
2. กรอก **PO Number** (ดูตัวนับ x/9)
3. เลือก **Issuer, Approver, Receiver**
4. เลือก **Silo** → **Line** จะเปิดให้เลือก
5. กรอก **Lot No.** (ดูตัวนับ x/10)
6. พิมพ์ **Type** → จะมี autocomplete
7. กรอก **Quantity**
8. เลือก **Remark Type**
9. เลือก **Checkboxes** → จะ highlight สีเหลือง
10. เลือก **Package Type**
11. เพิ่ม **Remarks** (ถ้าต้องการ)
12. กด **บันทึกรายการ**

### 3. ดูตาราง History
- กดลูกศรเปิด/ปิด รายละเอียด
- ค้นหาด้วย search box
- กด Quick Approve (👍) เพื่ออนุมัติเร็ว
- กด Edit (✏️) เพื่อแก้ไข
- กด Delete (🗑️) เพื่อลบ

## 📦 Dependencies

### External
- **Tailwind CSS** (CDN) - Utility-first CSS framework
- **Font Awesome 6** (CDN) - Icons

### Data Files (ต้องมีในโฟลเดอร์ `data/`)
- `siloData.js` - Export array of silo objects
- `grade_pp.js` - Export array of grade strings  
- `order-history.js` - Export array of order objects

## 🔧 Module Details

### `utils.js`
- `generateOrderNo()` - สร้างเลข Order XXX/YYYY
- `formatTimestamp()` - แปลง ISO date เป็น dd/MM/yyyy HH:mm
- `getCurrentDateTimeLocal()` - สร้าง datetime-local string
- `handlePOInput()` - จัดการ PO counter
- `handleLotNoInput()` - จัดการ Lot counter
- `handleQuantityInput()` - Validate quantity
- `debounce()` - Debounce function
- และอื่นๆ

### `toast.js`
- `showToast(message, type, duration)` - แสดง toast
- `showSuccess()` - Success toast
- `showError()` - Error toast
- `showWarning()` - Warning toast
- `showInfo()` - Info toast

### `checkboxGroup.js`
- `renderCheckboxes()` - สร้าง checkbox groups
- `updateActiveCheckboxItems()` - Highlight checkboxes
- `getSelectedCheckboxRadioData()` - รวบรวมข้อมูล + Binary 8421
- `setCheckboxesFromBinary()` - กำหนด checkboxes จาก binary
- `clearAllCheckboxes()` - ล้าง checkboxes ทั้งหมด

### `remark.js`
- `addRemarkRow(value)` - เพิ่มแถว remark
- `removeRemarkRow(remarkId)` - ลบแถว remark
- `updateRemarkIndices()` - อัพเดทเลขลำดับ
- `getRemarkValues()` - ดึงค่า remarks ทั้งหมด
- `setRemarkValues(remarks)` - กำหนดค่า remarks
- `clearRemarks()` - ล้าง remarks
- `canAddMoreRemarks()` - เช็คว่าเพิ่มได้หรือไม่

### `historyTable.js`
- `initHistoryTable()` - Initialize ด้วย mock data
- `getHistoryData()` - ดึงข้อมูลจาก localStorage
- `saveHistoryData(data)` - บันทึกลง localStorage
- `addHistoryRecord()` - เพิ่ม record ใหม่
- `updateHistoryRecord()` - แก้ไข record
- `deleteHistoryRecord()` - ลบ record
- `renderHistoryTable()` - แสดงตาราง
- `populateFormFromRow()` - โหลดข้อมูลเข้าฟอร์ม

### `formData.js` (Main Controller)
- `initForm()` - Initialize form ทั้งหมด
- `populateLineDropdown()` - เติม Line ตาม Silo
- `setEditMode()` - ตั้งค่าโหมดแก้ไข
- `attachHistoryActions()` - ผูก event handlers ให้ history table

## 🎨 CSS Variables

```css
:root {
    --primary-purple: #a855f7;
    --purple-dark: #7c3aed;
    --purple-light: #c084fc;
    --bg-dark: #1e1b4b;
    --bg-darker: #0f172a;
    --text-light: #e9d5ff;
    --checkbox-font-size: 1.2rem;
    --border-radius: 0.5rem;
}
```

## 💾 localStorage Keys

- `bagoutOrderHistory` - Array of order records
- `orderCounter_YYYY` - Running number for each year
- `bagoutWorkflowSeeded` - Workflow seed flag

## 🔍 Binary 8421 Encoding

Checkbox order (7 bits):
1. **Bit 0** (1): prod-lock (ผลิตล็อค)
2. **Bit 1** (2): cover-plastic (ผ้าใบพลาสติก)
3. **Bit 2** (4): mt1-wood (MT 1.0 ไม้)
4. **Bit 3** (8): mt1-plastic (MT 1.0 พลาสติก)
5. **Bit 4** (16): mt15-wood (MT 1.5 ไม้)
6. **Bit 5** (32): mt15-plastic (MT 1.5 พลาสติก)
7. **Bit 6** (64): other (อื่นๆ)

ตัวอย่าง:
- Binary: `0001101` = 13 (decimal) = prod-lock + cover-plastic + mt1-plastic
- Binary: `1000001` = 65 (decimal) = prod-lock + other

## 🌐 Browser Support

ต้องการ browser ที่รองรับ:
- ES6 Modules (`import/export`)
- Arrow functions
- Template literals
- `const`/`let`
- Spread operator
- Array methods (map, filter, find)

รองรับ:
- ✅ Chrome 61+
- ✅ Firefox 60+
- ✅ Safari 11+
- ✅ Edge 16+

## 📝 Notes

1. **ต้องใช้ Web Server** - ไม่สามารถเปิด `file://` ได้เพราะ ES6 modules ต้อง HTTP/HTTPS
2. **Data Files** - ตรวจสอบว่า data files อยู่ที่ `./data/` และ export ถูกต้อง
3. **CORS** - ถ้าใช้ CDN อาจมีปัญหา CORS ในบาง browser
4. **localStorage** - ข้อมูลจะหายถ้าล้าง browser data

## 🎯 ข้อดีของ ES6 Version

1. **โครงสร้างชัดเจน** - แยก module ตามหน้าที่
2. **Reusable** - import ได้หลายที่
3. **Maintainable** - แก้ไขง่าย ไม่กระทบส่วนอื่น
4. **Type Safety** - รู้ว่า import อะไรมาจากไหน
5. **Performance** - Browser optimize ES6 modules
6. **No Build Step** - ไม่ต้อง compile/bundle

## 🚧 Future Improvements

- [ ] Add TypeScript
- [ ] Add unit tests
- [ ] Add form validation library
- [ ] Add date picker library
- [ ] Add export to Excel
- [ ] Add print functionality
- [ ] Add user authentication
- [ ] Add API integration

---

**Created by:** AI Assistant  
**Version:** 1.0.0  
**Date:** January 30, 2026
