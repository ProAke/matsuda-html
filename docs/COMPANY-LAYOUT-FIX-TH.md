# ซ่อมตำแหน่งหน้า Company ตามภาษาจีน

ใช้ `https://matsuda-sangyothailand.com/company_cn.html` เป็น reference ตามที่ผู้ใช้ยืนยัน โดยไม่แก้ `company_cn.html` และไม่แก้ CSS ที่หน้าจีน/ส่วนอื่นใช้อยู่

## สาเหตุและการซ่อม

- TH/JP มี inline `margin-top: 70px` ซ้อนกับ spacer ของ fixed header ทำให้เนื้อหาเลื่อนลงเกินหน้าจีน 80 px เอา inline margin นี้ออกให้กลับไปใช้ `.content` เหมือน CN
- EN ย้ายชื่อบริษัทไปข้างรูปและซ่อนแถบสีฟ้า คืนชื่อบริษัทลง `.div-company2` และแสดงแถบเหมือน CN ไม่ย้าย/แก้ตารางข้อมูลและข้อความของแต่ละภาษา
- เมนู EN/TH ยาวกว่า CN ทำให้ header สูงเพิ่ม 28 px จัดเมนูใน flex slot บน desktop เพื่อคง header สูงเท่าหน้าจีน โดยยังแสดงทุกลิงก์และไม่ตัดข้อความ
- CSS ใหม่ `template/styles/company-layout.css` โหลดเฉพาะ Company EN/TH/JP และมีผลเฉพาะ desktop 1024 px ขึ้นไป เมนูมือถือเดิมยังทำงานตามเดิม

## ตรวจรับ

- `npm test`: 40/40 ผ่าน รวม regression tests ของ section order, visible company-name band, ไม่มี per-language offset และขอบเขต CSS
- Chromium: 4 ภาษา × 4 ขนาด 1280/1024/768/390 px = 16 กรณี ผ่าน HTTP 200 ไม่มี page JS errors หรือ horizontal overflow
- ตรวจตำแหน่ง header, รูป/หัวข้อ, แถบชื่อบริษัท และจุดเริ่ม section ตารางเทียบ CN ในแต่ละ viewport รวมถึงแนวคอลัมน์
- ที่ 1280 px ทั้ง 4 ภาษาเริ่มส่วนรูปที่ y=65, แถบชื่อบริษัท y=435.39 และส่วนตาราง y=530.39 เท่ากัน
- ความสูงของตารางและตำแหน่งเนื้อหาที่ต่อท้ายอาจต่างตามความยาวคำแปล โดยปล่อยให้ข้อความขึ้นบรรทัดตามธรรมชาติ ไม่บังคับความสูงจนตัดเนื้อหา
- หลักฐาน geometry: `docs/company-layout-checks.json` เป็นผลวัดเว็บ local ที่แก้แล้ว ไม่ใช่ pixel-diff ของเว็บ production

พรีวิว `npm start` พอร์ต 3000: `/company.html`, `/company_th.html`, `/company_jp.html` และ `/company_cn.html`
