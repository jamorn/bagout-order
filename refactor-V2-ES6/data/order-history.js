// Mock order history for BAGOUT ORDER (30 rows, 15 per page)
// Bagging Line is read-only and determined by Bagging Silo selection
import siloData from './siloData.js';

const gradeList = [
  {"MATNR":"1126NK","type":"PREMIUM","category":"HOMO"},
  {"MATNR":"1105SC","type":"PREMIUM","category":"HOMO"},
  {"MATNR":"1100NK","type":"PREMIUM","category":"HOMO"},
  {"MATNR":"1102K","type":"PREMIUM","category":"HOMO"},
  {"MATNR":"1105RC","type":"PREMIUM","category":"HOMO"},
  {"MATNR":"1102H","type":"PREMIUM","category":"HOMO"},
  {"MATNR":"2500M","type":"PREMIUM","category":"BLOCK CO"},
  {"MATNR":"1150H","type":"PREMIUM","category":"HOMO"},
  {"MATNR":"1100RC","type":"PREMIUM","category":"HOMO"},
  {"MATNR":"2500H","type":"PREMIUM","category":"BLOCK CO"},
  {"MATNR":"2300K","type":"PREMIUM","category":"BLOCK CO"},
  {"MATNR":"1100NKSUB","type":"SUB-STANDARD","category":"HOMO"},
  {"MATNR":"3375RM","type":"PREMIUM","category":"RANDOM"},
  {"MATNR":"1140VC","type":"PREMIUM","category":"HOMO"},
  {"MATNR":"2300NCA","type":"PREMIUM","category":"BLOCK CO"},
  {"MATNR":"3340H","type":"PREMIUM","category":"RANDOM"},
  {"MATNR":"1100RCSUB","type":"SUB-STANDARD","category":"HOMO"},
  {"MATNR":"1032L","type":"PREMIUM","category":"HOMO"},
  {"MATNR":"1100S","type":"PREMIUM","category":"HOMO"},
  {"MATNR":"1120NK","type":"PREMIUM","category":"HOMO"}
];

function randomFromArray(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pad(num, size = 2) {
  let s = num + "";
  while (s.length < size) s = "0" + s;
  return s;
}

// Generate 30 mock orders
const orderHistory = Array.from({ length: 30 }, (_, i) => {
  const silo = randomFromArray(siloData);
  const grade = randomFromArray(gradeList);
  const orderDate = new Date(Date.now() - i * 86400000); // previous days
  // Random checkbox selection (binary 8421)
  const randomBinary = Math.floor(Math.random() * 128); // 0-127
  const selectedOpts = [];
  const optionNames = ['prod-lock', 'cover-plastic', 'mt1-wood', 'mt1-plastic', 'mt15-wood', 'mt15-plastic', 'other'];
  optionNames.forEach((name, idx) => {
    if (randomBinary & (1 << idx)) selectedOpts.push(name);
  });
  // Random remarks (0-2 items)
  const remarkCount = Math.floor(Math.random() * 3);
  const remarks = Array.from({ length: remarkCount }, (_, ri) => `หมายเหตุ ${ri + 1} สำหรับ Order ${pad(i + 1, 3)}/26`);
  
  return {
    id: i + 1,
    orderDate: orderDate.toISOString().slice(0, 16).replace('T', ' '),
    orderNo: pad(i + 1, 3) + '/26',
    orderPO: pad(100000000 + i, 9),
    bagSilo: silo.SiloName,
    bagLine: silo.LineName, // read-only, from Silo
    lotNo: pad(450000000 + i, 9),
    bagType: grade.MATNR,
    quantity: (Math.floor(Math.random() * 10) + 1) * 25,
    remarkType: grade.type,
    plant: silo.Plant,
    packageType: i % 3 === 0 ? 'pkg-custom' : 'pkg-25',
    packageValue: i % 3 === 0 ? ['750', '800', '900'][i % 3] : '25',
    binary8421: randomBinary,
    binaryString: randomBinary.toString(2).padStart(8, '0'),
    selectedOptions: selectedOpts.join(', '),
    remarks: remarks
  };
});

// Pagination utility
export function getOrderHistoryPage(page = 1, pageSize = 15) {
  const start = (page - 1) * pageSize;
  return {
    rows: orderHistory.slice(start, start + pageSize),
    total: orderHistory.length,
    page,
    pageSize
  };
}

export default orderHistory;
