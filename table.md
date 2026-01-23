# Table: SiloMaster (Master Data)
## ตารางนี้เก็บโครงสร้างของโรงงาน (ข้อมูล Plant จะอยู่ที่นี่)
SiloID,SiloName,LineName,LineType,Plant
1,11T060A,JUMBO B,JUMBO,PP
2,21T060D,C,SMALL,PP
3,21T061A,A,SMALL,PP
4,21T061A,JUMBO C,JUMBO,PP
5,21T061B,C,SMALL,PP

# Table: BagOutOrders (Transaction Data)
## ตารางหลักที่เก็บชื่อคนทำงานในแต่ละขั้นตอน (CreatedBy, ApprovedBy, ReceivedBy)
OrderID,OrderNo,Rev,CreatedBy (Boardman),ApprovedBy (Shift Sup),ReceivedBy (Bagging),Mask,Status,DocDate,ApprovedAt,ReceivedAt
1,50/2026,1,นายสมชาย,หน.สมพงษ์,นายวิชัย,17,Completed,20/01/26,23:50,00:05
2,51/2026,1,นายกมล,หน.สมพงษ์,NULL,2,Superseded,20/01/26,08:00,NULL
3,51/2026,2,นายกมล,หน.สุรชัย,NULL,10,Approved,21/01/26,09:15,NULL
4,52/2026,1,นายสมชาย,หน.สุรชัย,นายมานิต,137,InProgress,21/01/26,10:00,10:45
5,53/2026,1,นายธนา,NULL,NULL,25,Draft,NULL,NULL,NULL

# Table: BagOutRemarks (Log & Remark Data)
## เก็บหมายเหตุและเหตุผล Downtime โดยอ้างอิง ID ของใบสั่งผลิต
RemarkID,OrderID,RemarkText,CreatedBy (คนพิมพ์),CreatedAt
1,1,"""Urgent order for shipment""",นายสมชาย (PPC),20/01/26 23:40
2,2,"""Cancel: Change to Jumbo 750+Lock""",หน.สุรชัย (Sup),21/01/26 09:10
3,4,"""[Late]: Intercom failed, phone called at 10:40""",นายมานิต (Bagging),21/01/26 10:45
4,5,"""Plan for tomorrow morning""",นายธนา (PPC),21/01/26 15:00
5,4,"""Double check pallet seal""",หน.สุรชัย (Sup),21/01/26 10:05

สรุปความเชื่อมโยงของข้อมูล:
1. การหาชื่อ Plant: เมื่อดูที่ OrderID 1 คุณจะเห็น SiloID = 3 เมื่อนำไปเทียบกับตาราง SiloMaster จะรู้ทันทีว่าคือ Plant PP

2. การหาคนรับผิดชอบ:

- PPC: นายสมชาย เป็นคนเปิดใบงาน (CreatedBy)

- Sup: หน.สมพงษ์ เป็นคนตรวจสอบและอนุมัติ (ApprovedBy)

- Bagging: นายวิชัย เป็นคนรับงาน (ReceivedBy)

3. การวิเคราะห์ Downtime:

- ดูที่ OrderID 4: อนุมัติ (ApprovedAt) 10:00, รับงาน (ReceivedAt) 10:45

- Downtime = 45 นาที

- ระบบตรวจสอบพบว่าเกิน 30 นาที จึงไปดึง RemarkID 3 มาแสดงคู่กันเพื่อให้ทราบว่า "นายมานิต รับช้าเพราะ Intercom เสีย"

# การจัดกลุ่มข้อมูลแบบนี้จะทำให้คุณสร้าง Report ได้หลากหลายมากครับ เช่น:

- สรุปจำนวนใบสั่งผลิตแยกตาม Plant

- สรุป Average Downtime แยกตามเจ้าหน้าที่ Bagging

- ตรวจสอบประวัติการแก้ไข Revision ของแต่ละ PO_Number
# Table: BagOutOrders เขียนคำอธิบาย Mask Status
1. คำอธิบาย ConfigurationMask (Bitwise Logic)
ConfigurationMask คือการนำผลรวมของเลขฐาน 2 ของ Checkbox ที่เลือกมาเก็บเป็นเลขฐาน 10 เพียงตัวเดียว โดยแบ่งกลุ่มดังนี้:
กลุ่มข้อมูล,รายการ (Item),Bit,Weight (ฐาน 10),เงื่อนไขการเลือก
Packaging,PACKAGE 25 KG.,0,1,เลือกได้เพียง 1 อย่างในกลุ่มนี้
,JUMBO 750 KG.,1,2,
,JUMBO 900 KG.,2,4,
Special,PRODUCT LOCK,3,8,เลือกหรือไม่ก็ได้ (Option)
Pallet Type,1 MT/Pallet (Plastic),4,16,ใช้เฉพาะกับ 25 KG เท่านั้น
(เลือกได้ 1),1.5 MT/Pallet (Plastic),5,32,(ถ้าเป็น Jumbo กลุ่มนี้ต้องเป็น 0)
,1 MT/Pallet (Wood),6,64,
,1.5 MT/Pallet (Wood),7,128,

# ตัวอย่างการคำนวณ:
- เลข 25: มาจาก $1 + 8 + 16$ (25kg + Lock + Plastic 1MT)
- เลข 10: มาจาก $2 + 8$ (Jumbo 750kg + Lock)
2. คำอธิบาย Status (Workflow States)
สถานะเหล่านี้ใช้ควบคุมว่าใครสามารถทำอะไรกับใบงานได้บ้างในระบบ .NET:
Status,ความหมาย,ผู้มีสิทธิ์จัดการ,Action ถัดไป
Draft,ใบงานที่กำลังร่าง ข้อมูลยังไม่ครบ,Boardman,ส่งให้ Shift Sup. ตรวจสอบ
Approved,อนุมัติแล้ว รอ Bagging มารับงาน,Shift Sup.,ระบบเริ่มนับเวลา Downtime
InProgress,Bagging รับงานไปผลิตแล้ว,Bagging,บรรจุสินค้าตามคำสั่ง
Completed,บรรจุเสร็จสิ้นปิดงาน,Bagging/System,เก็บเข้าประวัติ (History)
Superseded,ใบงานนี้ถูกยกเลิกเพราะมีใบใหม่มาแทน,System,ไม่อนุญาตให้ใช้งานอีกต่อไป
Cancelled,ใบงานถูกยกเลิกทิ้ง,Boardman/Sup,ยุติการทำงาน

3. ตัวอย่างการเขียน Code ใน .NET (C#)
เพื่อให้การทำงานร่วมกับ SQL Server เป็นไปอย่างราบรื่น คุณสามารถใช้ Enum ใน C# เพื่อจัดการสถานะเหล่านี้
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

4. สรุปภาพรวม Workflow ล่าสุด
- Boardman สร้างใบงานสถานะ Draft (Mask เก็บค่า Checkbox ทั้งหมด)

- Shift Sup. กำหนดวันที่ผลิตและเปลี่ยนสถานะเป็น Approved (Timestamp ApprovedAt บันทึกทันที)

- Bagging เห็นงานที่ Approved แล้วกดรับงาน สถานะเปลี่ยนเป็น InProgress (Timestamp ReceivedAt บันทึก)

- ถ้า (ReceivedAt - ApprovedAt) > 30 นาที: ระบบบังคับให้บันทึกข้อมูลลงตาราง BagOutRemarks

หากมีการแก้ไข: ใบงานเดิมจะเปลี่ยนเป็น Superseded (IsLatest = 0) และสร้างใบงานใหม่เป็น Draft/Approved (IsLatest = 1)

# นี่คือ SQL Script ที่รวบรวมโครงสร้างตารางทั้งหมด (Tables), ความสัมพันธ์ (Constraints), และข้อมูลจำลอง (Seed Data) 5 แถว เพื่อให้คุณนำไปรันใน SQL Server Management Studio (SSMS)
-- 1. สร้างตาราง SiloMaster
CREATE TABLE SiloMaster (
    SiloID INT IDENTITY(1,1) PRIMARY KEY,
    SiloName NVARCHAR(20) NOT NULL,
    LineName NVARCHAR(20) NOT NULL,
    LineType NVARCHAR(10) NOT NULL CHECK (LineType IN ('SMALL', 'JUMBO')),
    Plant NVARCHAR(10) NOT NULL
);

-- 2. สร้างตาราง BagOutOrders
CREATE TABLE BagOutOrders (
    OrderID INT IDENTITY(1,1) PRIMARY KEY,
    OrderNo NVARCHAR(20) NOT NULL,
    Revision INT DEFAULT 1,
    PO_Number NVARCHAR(50),
    SiloID INT NOT NULL,
    ConfigurationMask INT NOT NULL, -- เก็บ Bitmask 0-255
    QuantityMT DECIMAL(18, 3),
    [Status] NVARCHAR(20) DEFAULT 'Draft',
    IsLatest BIT DEFAULT 1,
    DocumentDate DATE NULL,
    
    -- Workflow & User Tracking
    CreatedBy NVARCHAR(100) NULL,   -- ชื่อ Boardman
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    ApprovedBy NVARCHAR(100) NULL,  -- ชื่อ Shift Sup
    ApprovedAt DATETIME2 NULL,
    ReceivedBy NVARCHAR(100) NULL,  -- ชื่อ Bagging
    ReceivedAt DATETIME2 NULL,
    
    CONSTRAINT FK_Orders_Silo FOREIGN KEY (SiloID) REFERENCES SiloMaster(SiloID)
);

-- 3. สร้างตาราง BagOutRemarks
CREATE TABLE BagOutRemarks (
    RemarkID INT IDENTITY(1,1) PRIMARY KEY,
    OrderID INT NOT NULL,
    RemarkText NVARCHAR(MAX) NOT NULL,
    CreatedBy NVARCHAR(100) NOT NULL,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT FK_Remarks_Orders FOREIGN KEY (OrderID) REFERENCES BagOutOrders(OrderID)
);
# SQL Script สำหรับใส่ข้อมูลจำลอง (5 แถว)
-- INSERT Master Data
INSERT INTO SiloMaster (SiloName, LineName, LineType, Plant) VALUES 
('11T060A', 'JUMBO B', 'JUMBO', 'PP'),
('21T060D', 'C', 'SMALL', 'PP'),
('21T061A', 'A', 'SMALL', 'PP'),
('21T061A', 'JUMBO C', 'JUMBO', 'PP'),
('21T061B', 'C', 'SMALL', 'PP');

-- INSERT Orders (จำลองสถานะที่ต่างกัน)
-- 1. งานสำเร็จแล้ว (25kg + Plastic 1MT)
INSERT INTO BagOutOrders (OrderNo, Revision, PO_Number, SiloID, ConfigurationMask, QuantityMT, [Status], IsLatest, DocumentDate, CreatedBy, ApprovedBy, ApprovedAt, ReceivedBy, ReceivedAt)
VALUES ('50/2026', 1, '128006001', 3, 17, 150.000, 'Completed', 1, '2026-01-20', 'นายสมชาย', 'หน.สมพงษ์', '2026-01-20 23:50:00', 'นายวิชัย', '2026-01-21 00:05:00');

-- 2. งานที่ถูกแก้ (Superseded)
INSERT INTO BagOutOrders (OrderNo, Revision, PO_Number, SiloID, ConfigurationMask, QuantityMT, [Status], IsLatest, DocumentDate, CreatedBy, ApprovedBy, ApprovedAt)
VALUES ('51/2026', 1, '128006002', 1, 2, 75.000, 'Superseded', 0, '2026-01-20', 'นายกมล', 'หน.สมพงษ์', '2026-01-20 08:00:00');

-- 3. งานใบใหม่ที่มาแทน (Rev 2 ของใบเดิม)
INSERT INTO BagOutOrders (OrderNo, Revision, PO_Number, SiloID, ConfigurationMask, QuantityMT, [Status], IsLatest, DocumentDate, CreatedBy, ApprovedBy, ApprovedAt)
VALUES ('51/2026', 2, '128006002', 1, 10, 75.000, 'Approved', 1, '2026-01-21', 'นายกมล', 'หน.สุรชัย', '2026-01-21 09:15:00');

-- 4. งานที่รับสายเกิน 30 นาที (InProgress)
INSERT INTO BagOutOrders (OrderNo, Revision, PO_Number, SiloID, ConfigurationMask, QuantityMT, [Status], IsLatest, DocumentDate, CreatedBy, ApprovedBy, ApprovedAt, ReceivedBy, ReceivedAt)
VALUES ('52/2026', 1, '128006003', 2, 137, 200.500, 'InProgress', 1, '2026-01-21', 'นายสมชาย', 'หน.สุรชัย', '2026-01-21 10:00:00', 'นายมานิต', '2026-01-21 10:45:00');

-- 5. งานร่างใหม่ (Draft)
INSERT INTO BagOutOrders (OrderNo, Revision, PO_Number, SiloID, ConfigurationMask, QuantityMT, [Status], IsLatest, DocumentDate, CreatedBy)
VALUES ('53/2026', 1, '128006004', 5, 25, 120.000, 'Draft', 1, NULL, 'นายธนา');

-- INSERT Remarks
INSERT INTO BagOutRemarks (OrderID, RemarkText, CreatedBy, CreatedAt) VALUES 
(1, 'Urgent order for shipment', 'นายสมชาย', '2026-01-20 23:40:00'),
(2, 'Change to Jumbo 750 + Lock', 'หน.สุรชัย', '2026-01-21 09:10:00'),
(4, '[Late]: Intercom failed, phone called at 10:40', 'นายมานิต', '2026-01-21 10:45:00');

3. SQL สำหรับดึงข้อมูลมาดู (Report Style)
SELECT 
    o.OrderNo,
    o.Revision,
    s.SiloName,
    s.LineName,
    o.ConfigurationMask AS Mask,
    o.[Status],
    o.CreatedBy AS Boardman,
    o.ApprovedBy AS ShiftSup,
    o.ReceivedBy AS Bagging,
    DATEDIFF(MINUTE, o.ApprovedAt, o.ReceivedAt) AS Downtime_Mins,
    r.RemarkText
FROM BagOutOrders o
JOIN SiloMaster s ON o.SiloID = s.SiloID
LEFT JOIN BagOutRemarks r ON o.OrderID = r.OrderID AND r.RemarkText LIKE '[Late]%'
WHERE o.IsLatest = 1;