# ส่งต่องาน: เปลี่ยน Nuxt เป็น Static HTML

> บันทึกนี้เป็นผล ณ ตอนนำเข้า ดู `REFERENCE-REPAIRS-TH.md` สำหรับการซ่อมต่อภายหลัง โดยรายการ footer links, hero banners และ mobile overflow ด้านล่างได้รับการแก้แล้ว

วันที่: 4 พฤศจิกายน 2026
สาขา: `arena/e5eaf122-matsuda-html`

## ขอบเขตที่ทำ

ใช้เฉพาะต้นฉบับ Google Drive **`matsuda-html-02/matsuda-static/`**, folder ID `1ihxLPaNrBgaagDJ6_ZwBD6l8Wg4Iu-UK` ไม่ใช่ Drive ชุดเก่า ไม่ใช้เนื้อหา Vue/JSON หรือ `public/legacy` จาก Nuxt

ดาวน์โหลดและทดสอบใน staging ก่อนล้างแอปเก่า นำเข้า **123 ไฟล์** จาก Drive (ไม่รวม `.DS_Store`): หน้าเว็บ HTML 29 ไฟล์, รายงานต้นฉบับ 1 ไฟล์, screenshots ต้นฉบับ 14 ไฟล์ และไฟล์ประกอบ ส่วน `.git` และประวัติยังอยู่ตามเดิม ไม่แก้หรือลบข้อมูลใน Drive

แอปเดิมที่เอาออก: `app.vue`, `error.vue`, `nuxt.config.ts`, `pages/`, `components/`, `composables/`, `assets/`, `data/`, `public/`, scripts/tests/docs เก่า, dependencies และ Nuxt build/cache เปลี่ยน package scripts เป็น static server ที่ไม่มี dependencies

## การปรับเฉพาะเพื่อให้รันแบบ static ได้

1. เปลี่ยน script type ที่มี hash ของ Cloudflare ให้เป็น `text/javascript` และเอา script จาก `/cdn-cgi/` ออก เพราะไม่มี Cloudflare runtime บน static hosting
2. ซ่อมแท็ก `<script>` ที่เปิดซ้อนในต้นฉบับ และเอา Cloudflare guard ใน click handlers ออก
3. แปลง email ที่เข้ารหัสไว้เป็นข้อความและ `mailto:` โดยถอดรหัสค่าที่อยู่ในแต่ละ attribute ของต้นฉบับ ไม่เดาหรือเปลี่ยนปลายทาง email
4. แก้ลิงก์ไป `index_en.html`, `company_en.html`, `awarded_en.html`, `career_en.html`, `contactus_en.html` ให้ใช้ไฟล์ EN ที่มีจริง; `management_th.html` ใช้ `management.html`
5. แก้ relative URL ฟอนต์ใน `template/styles/template.css` จาก `../fonts/` เป็น `../../fonts/` และทำ SVG alias ที่ไม่มี fragment (`#fontN` ไม่ใช่ส่วนหนึ่งของ HTTP path) เก็บไฟล์ฟอนต์เดิมทั้งหมดไว้ด้วย
6. เอา JavaScript popup ที่เรียก `div-dad`, `img-dad` และปุ่มปิดที่ไม่มี markup อยู่จริงออกจากหน้าแรก 4 ภาษา เพื่อไม่ให้เกิด null-reference error
7. เพิ่ม `js/static-compat.js` วัดความสูงของ fixed header ให้ spacer และกันการ POST ฟอร์มไป PHP ที่ไม่มีอยู่ พร้อมแสดงข้อความว่า **ยังไม่ได้ส่ง** ทั้ง 4 ภาษา
8. เพิ่ม README, server สำหรับ preview, tests, manifest และเอกสารนี้ โดยไม่เพิ่ม framework/build step

ไม่ได้ปรับดีไซน์ใหม่ ไม่เปลี่ยนรูปภาพ ไม่แก้คำแปล/เนื้อหาธุรกิจ และไม่ยกการแก้เนื้อหาจาก Nuxt กลับมาใช้

`source-manifest.json` บันทึก SHA-256 และขนาดของ **ไฟล์ที่ connector บันทึกให้** ก่อนปรับ compatibility ขนาด HTML ที่ connector ส่งกลับไม่ตรงกับ metadata ของ Drive จึงไม่อ้างว่า byte-identical กับ metadata; ไฟล์ที่ไม่ใช่ HTML/CSS ตรวจ SHA-256 ตรงกับไฟล์ดาวน์โหลดครบ

## ผลทดสอบการย้าย

- `npm test`: **34/34 ผ่าน** — หน้า HTML 29 ไฟล์, inline JS syntax, local href/src, hash ของ assets, server HTTP/HEAD/MIME, preview hostname, 404 แทน SPA fallback, ปิดการอ่าน `.git`/`.env`, และปฏิเสธ POST
- Chromium: หน้าเว็บ **29 ไฟล์ × 3 ขนาด 1280/768/390 px = 87 การเปิดหน้า** ไม่มี page JavaScript error หรือรูป `<img>` โหลดไม่สำเร็จในเส้นทางทดสอบ; ที่ 1280 px ไม่พบ HTTP 4xx/5xx จากหน้าและ resources ที่โหลด
- ทดสอบปุ่ม next ของสไลด์ทั้ง 2 ตัว: index เปลี่ยนจริง
- ทดสอบเลือกภาษา EN → TH บนหน้าแรก: ไป `index_th.html` จริง
- ฟอร์มติดต่อ 4 ภาษา: แสดงคำเตือนว่าไม่มี backend และไม่เกิด POST/ไม่เปลี่ยนหน้า
- รายละเอียด browser checks: `verification-browser.json`

การตรวจนี้ไม่ใช่การรับรองว่าเนื้อหาต้นฉบับแปลครบหรือ layout ปราศจากปัญหา และไม่ได้ตรวจปลายทาง external links/Google Maps เพราะการเชื่อมต่อภายนอกมีข้อจำกัด

## ข้อสังเกตจากต้นฉบับที่ยังไม่ได้เปลี่ยน

เพื่อไม่ให้การนำเข้า HTML กลายเป็นการ redesign หรือแก้เนื้อหาโดยไม่ได้ตกลง รายการต่อไปนี้คงไว้และต้องพิจารณาแยก:

- ที่ viewport 390 px หน้าบริษัททั้ง 4 ภาษา document กว้าง 519 px; หน้าติดต่อและ Related Links กว้าง 395 px — ยังมี horizontal overflow จาก layout ต้นฉบับ ไม่ได้แก้ด้วยการซ่อน overflow
- เมนู footer หลายรายการชี้กลับหน้าเดียวกัน และเมนูบางหน้าพากลับหน้าภาษาหลัก แม้ไฟล์ปลายทางมีอยู่และไม่ 404 แต่ยังไม่ใช่ navigation ตามชื่อเมนู/ภาษาที่ถูกต้องทั้งหมด
- บางหน้ามีข้อความภาษาอังกฤษ/ไทยปะปนกัน และ footer มีข้อมูลซ้ำ ไม่ได้แปลหรือยืนยันความถูกต้องใหม่
- บาง email แสดงชื่อหนึ่งแต่ mailto ไปอีกที่หนึ่งตามข้อมูลเข้ารหัสเดิม เช่น `sales1@…com` กับ `sale1@…co.th` ต้องให้ผู้รับผิดชอบยืนยันก่อนแก้
- `.hero-banner`/`.content` มี negative margins และส่วนเนื้อหาบางช่วงมีพื้นที่ว่างมากตาม CSS/HTML ที่ได้รับ ยังไม่ได้จัดวางใหม่
- CSS/Lightwindow มี URL ของรูปเก่าบางชื่อที่ไม่อยู่ใน Drive และไม่ได้ถูกเรียกในเส้นทาง browser ที่ตรวจ จึงไม่สร้างภาพทดแทนหรือดึงจาก Nuxt เก่ามาปะปน
- ใช้ JavaScript libraries เก่าที่มากับต้นฉบับ ควรทำ security/accessibility review ก่อนใช้งาน production
- รายงานและ screenshots ใต้ `report/`/`screenshots/` มาจาก Drive ไม่ใช่ผลตรวจใหม่ และคำกล่าวในรายงานเดิมไม่ได้ถือว่าผ่านโดยอัตโนมัติ
- **ไม่มี backend ส่งฟอร์ม** ไม่ได้อ้างว่ามีการส่งอีเมลสำเร็จ

## การพัฒนาต่อ

แก้ไฟล์ `.html`/CSS/JS โดยตรง จากนั้นรัน `npm test` และเปิดเว็บด้วย `npm start` ที่พอร์ต 3000 การ deploy ใช้ static hosting ได้โดยตรง โดยไม่ต้อง compile หรือรัน Nuxt

โค้ดก่อนย้ายดูได้จาก Git commit `d6eb6632be28001f70ed981bc7b9f734146387c8` (ก่อนเริ่มงานสาขานี้) ไม่ได้ลบ Git history หรือเปลี่ยน branch
