https://docs.google.com/spreadsheets/d/14GGSvBssRjjfYpIUCgrWbHIE6mnnSxIRthy4H8NPx8Q/edit?gid=0#gid=0

เพื่อให้คุณนำไปเขียน Logic ใน **.NET (C#)** และ Query ใน **SQL Server** ได้อย่างแม่นยำ ผมขอสรุปคำอธิบายของ `ConfigurationMask` และ `Status` ในตาราง `BagOutOrders` แบบละเอียดดังนี้ครับ

---

### 1. คำอธิบาย ConfigurationMask (Bitwise Logic)

`ConfigurationMask` คือการนำผลรวมของเลขฐาน 2 ของ Checkbox ที่เลือกมาเก็บเป็นเลขฐาน 10 เพียงตัวเดียว โดยแบ่งกลุ่มดังนี้:

| กลุ่มข้อมูล | รายการ (Item) | Bit | Weight (ฐาน 10) | เงื่อนไขการเลือก |
| --- | --- | --- | --- | --- |
| **Packaging** | **PACKAGE 25 KG.** | 0 | **1** | เลือกได้เพียง 1 อย่างในกลุ่มนี้ |
|  | **JUMBO 750 KG.** | 1 | **2** |  |
|  | **JUMBO 900 KG.** | 2 | **4** |  |
| **Special** | **PRODUCT LOCK** | 3 | **8** | เลือกหรือไม่ก็ได้ (Option) |
| **Pallet Type** | **1 MT/Pallet (Plastic)** | 4 | **16** | **ใช้เฉพาะกับ 25 KG เท่านั้น** |
| (เลือกได้ 1) | **1.5 MT/Pallet (Plastic)** | 5 | **32** | (ถ้าเป็น Jumbo กลุ่มนี้ต้องเป็น 0) |
|  | **1 MT/Pallet (Wood)** | 6 | **64** |  |
|  | **1.5 MT/Pallet (Wood)** | 7 | **128** |  |

**ตัวอย่างการคำนวณ:**

* **เลข 25:** มาจาก  (25kg + Lock + Plastic 1MT)
* **เลข 10:** มาจาก  (Jumbo 750kg + Lock)

---

### 2. คำอธิบาย Status (Workflow States)

สถานะเหล่านี้ใช้ควบคุมว่าใครสามารถทำอะไรกับใบงานได้บ้างในระบบ .NET:

| Status | ความหมาย | ผู้มีสิทธิ์จัดการ | Action ถัดไป |
| --- | --- | --- | --- |
| **Draft** | ใบงานที่กำลังร่าง ข้อมูลยังไม่ครบ | Boardman | ส่งให้ Shift Sup. ตรวจสอบ |
| **Approved** | อนุมัติแล้ว รอ Bagging มารับงาน | Shift Sup. | ระบบเริ่มนับเวลา Downtime |
| **InProgress** | Bagging รับงานไปผลิตแล้ว | Bagging | บรรจุสินค้าตามคำสั่ง |
| **Completed** | บรรจุเสร็จสิ้นปิดงาน | Bagging/System | เก็บเข้าประวัติ (History) |
| **Superseded** | ใบงานนี้ถูกยกเลิกเพราะมีใบใหม่มาแทน | System | ไม่อนุญาตให้ใช้งานอีกต่อไป |
| **Cancelled** | ใบงานถูกยกเลิกทิ้ง | Boardman/Sup | ยุติการทำงาน |

---

### 3. ตัวอย่างการเขียน Code ใน .NET (C#)

เพื่อให้การทำงานร่วมกับ SQL Server เป็นไปอย่างราบรื่น คุณสามารถใช้ `Enum` ใน C# เพื่อจัดการสถานะเหล่านี้ได้ครับ:

```csharp
public enum BagOutStatus
{
    Draft,
    Approved,
    InProgress,
    Completed,
    Superseded,
    Cancelled
}

// วิธีเช็คค่า Mask ใน Code
public bool IsProductLock(int mask) => (mask & 8) != 0;
public bool Is25kg(int mask) => (mask & 1) != 0;

```

---

### 4. สรุปภาพรวม Workflow ล่าสุด

1. **Boardman** สร้างใบงานสถานะ `Draft` (Mask เก็บค่า Checkbox ทั้งหมด)
2. **Shift Sup.** กำหนดวันที่ผลิตและเปลี่ยนสถานะเป็น `Approved` (Timestamp `ApprovedAt` บันทึกทันที)
3. **Bagging** เห็นงานที่ `Approved` แล้วกดรับงาน สถานะเปลี่ยนเป็น `InProgress` (Timestamp `ReceivedAt` บันทึก)
* **ถ้า (`ReceivedAt` - `ApprovedAt`) > 30 นาที:** ระบบบังคับให้บันทึกข้อมูลลงตาราง `BagOutRemarks`


4. **หากมีการแก้ไข:** ใบงานเดิมจะเปลี่ยนเป็น `Superseded` (IsLatest = 0) และสร้างใบงานใหม่เป็น `Draft/Approved` (IsLatest = 1)

**ขั้นตอนต่อไป:** คุณต้องการให้ผมเขียน **SQL Script สำหรับสร้าง View** เพื่อแปลงค่า Mask และ Status ออกมาเป็นตัวหนังสือให้อ่านง่ายๆ สำหรับทำ Report ไหมครับ?