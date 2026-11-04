# Matsuda Sangyo — Static HTML

**อัปเดตล่าสุด:** ไล่ซ่อม layout ครบ 7 หมวด 29 ไฟล์ ทุกภาษาแล้ว ดู [บันทึกการซ่อมทุกหน้า](docs/ALL-PAGES-LAYOUT-TH.md) และรายงาน `docs/all-pages-layout-checks.json` (145 กรณี + interaction/resize ครบทุกหน้า)

เว็บไซต์ HTML/CSS/JavaScript แบบ static แทนแอป Nuxt เดิม ตามคำขอวันที่ 4 พฤศจิกายน 2026

## ต้นฉบับที่ใช้

Google Drive: **`matsuda-html-02/matsuda-static/`**
Folder ID: `1ihxLPaNrBgaagDJ6_ZwBD6l8Wg4Iu-UK`

นำเข้า HTML หน้าเว็บ **29 ไฟล์**, รูปภาพ, ฟอนต์, CSS, JavaScript รวมทั้ง `report/` และ `screenshots/` ที่มากับโฟลเดอร์นี้ ไม่ใช้ Vue components, JSON เนื้อหา หรือ assets จากแอป Nuxt เดิม ไม่มี database และไม่มี build step

> `report/index.html` และ `screenshots/` เป็นเอกสารอ้างอิงที่มากับต้นฉบับ ไม่ใช่ผลตรวจรับของการย้ายครั้งนี้ ผลตรวจล่าสุดอยู่ใน [docs/STATIC-IMPORT-TH.md](docs/STATIC-IMPORT-TH.md)

## เปิดเว็บ

ต้องมี Node.js 20 ขึ้นไป ไม่ต้องติดตั้ง dependencies

```sh
npm start
# หรือ npm run dev
```

เปิด `http://localhost:3000` — server bind `0.0.0.0` รองรับ Arena preview host โดยไม่จำกัด hostname

เปลี่ยนพอร์ตได้ด้วย `PORT=8080 npm start` (macOS/Linux)
ทดสอบ: `npm test`

Browser QA (optional): `npm run test:browser` ต้องติดตั้ง Playwright/Chromium แยกและเปิดเว็บก่อน ดูวิธีในเอกสารการซ่อมทุกหน้า

สำหรับ production ให้อัปโหลดไฟล์เว็บไปยัง static hosting เช่น Apache, Nginx หรือ static file hosting ได้โดยตรง ใช้ `index.html` เป็นหน้าแรก ไม่ต้องใช้ Node server, Nuxt, Vue หรือ SPA fallback บน production

## โครงสร้าง

- `*.html` — หน้าเว็บ แก้เนื้อหาโดยตรงในไฟล์ HTML
- `template/styles/template.css` — CSS ต้นฉบับ
- `images/`, `uploads/`, `fonts/` — ไฟล์ประกอบจาก Drive
- `js/`, `module/`, `plugin/` — JavaScript ต้นฉบับ (โฟลเดอร์ `module/phpbe` มีเฉพาะไฟล์ JS ไม่ใช่ PHP backend)
- `js/static-compat.js` — ระยะ header ที่ติดตามฟอนต์/การ resize, เมนูมือถือ/แกลเลอรีแยกภาษา และคำเตือนฟอร์มไม่มี backend
- `template/styles/site-layout.css` — กฎ responsive ร่วมทุกหน้า โหลดผ่าน `reference-repairs.css`
- `scripts/serve.mjs` — development/preview static server แบบไม่มี dependencies
- `tests/` — ตรวจ HTML, ไฟล์ประกอบ, hash assets และ HTTP server
- `docs/source-manifest.json` — รายชื่อและ SHA-256 ของไฟล์ที่ connector ดาวน์โหลดก่อนปรับ compatibility

### ไฟล์ภาษา

- หน้าแรก: `index.html`, `index_th.html`, `index_jp.html`, `index_cn.html`
- บริษัท/รางวัล/นโยบาย/ติดต่อ: ชื่อปกติสำหรับ EN และ `_th`, `_jp`, `_cn`
- Related Links: `management_en.html`, `management.html` (TH), `management_jp.html`, `management_cn.html`
- ธุรกิจ: เก็บทั้ง `business.html`, `business_en.html`, `business_th.html`, `business_jp.html`, `business_cn.html` ตามต้นฉบับ

ไม่ได้แปลใหม่หรือรับรองความครบถ้วนของเนื้อหาทั้ง 4 ภาษา ดูข้อสังเกตต้นฉบับในเอกสารส่งต่องาน

## ข้อจำกัดสำคัญ

- **ฟอร์มติดต่อยังไม่ส่งข้อความ/อีเมล** เพราะไม่มี PHP/mail backend ฟอร์มจะไม่ POST ข้อมูลและแสดงคำเตือนว่าไม่ได้ส่ง กรุณาใช้ช่องทางติดต่อที่ระบุอยู่บนหน้าเว็บ
- ซ่อมลิงก์ footer และหน้าล้นจอบนมือถือแล้ว ยังต้องตรวจทานคำแปลทั้ง 4 ภาษา และยืนยัน email ที่แสดงกับ mailto บางรายการที่ไม่ตรงกัน ดูขอบเขตและข้อจำกัดในบันทึกการซ่อมล่าสุด
- การแก้จากแอป Nuxt ครั้งก่อน **ไม่ได้ยกมาใช้** ตามคำขอให้แทนด้วยต้นฉบับชุดใหม่

Git history และ `.git` ยังคงอยู่ ดูแอปก่อนการย้ายได้จาก commit `d6eb6632be28001f70ed981bc7b9f734146387c8` ไม่ได้แก้หรือลบต้นฉบับใน Google Drive
