# ส่งต่อทีม — ย้ายดีไซน์จาก HTML เดิม

## แหล่งข้อมูลที่อนุมัติ
- Google Drive folder: **matsuda-html** (`1vhA71nu58lRoA8D95t6lWvld9uf1-Dh-`)
- ใช้ HTML ทั้ง 28 ไฟล์ (7 หน้า × ไทย/อังกฤษ/ญี่ปุ่น/จีน) ไม่ใช้ archive PHP
- ใช้ `template/styles/template.css`, โลโก้ `images/logo.png`, ฟอนต์เดิม 3 ชุด และรูปเดิมจาก images/uploads
- รูปที่นำมาใช้เก็บใน `public/legacy/` แล้ว ไม่ต้องโหลดจากโดเมนเว็บเก่า
- ภาพอ้างอิง `screenshots/home.png` และ `01-home.png` อยู่ในชุด Drive (ไฟล์ดาวน์โหลดในเครื่องถูก ignore)

## สถาปัตยกรรม
- Nuxt 3 SSR/static generation, ไม่มีฐานข้อมูล
- หน้าแรก/เมนู/ท้ายเว็บใช้ Vue components; ส่วนเนื้อหาภายในเก็บ markup เดิมใน JSON เพื่อรักษาตารางและ inline typography
- `data/legacy/{lang}.json` คือเนื้อหาจริงที่นำเข้าจาก HTML; `data/locales/{lang}.json` คือ UI/SEO
- importer กรอง scripts, event handlers, Cloudflare runtime และ URL แบบ javascript ออก ไม่ใช้ jQuery/Prototype
- JSON เป็น trusted repository source เท่านั้น อย่าเปิด v-html ให้รับข้อมูลจากผู้ใช้โดยไม่ sanitize

## การแก้ error ที่จำเป็นโดยไม่ออกแบบใหม่
- ถอด hero ที่ซ้ำและ margin ติดลบจาก HTML export ซึ่งทำให้เนื้อหาถูกบัง
- ใช้สไลด์ Vue แทน slider script เดิมที่รอ loading ค้าง รองรับปุ่มก่อนหน้า/ถัดไปและ reduced motion
- แก้การอ้างอิงฟอนต์และรูปให้เป็น local paths
- ย้าย background รูปหน้า Related Links เข้า container ที่ถูกต้อง เพื่อไม่ให้บังเนื้อหาและท้ายเว็บ
- คืน class ของ gallery ที่ปกติสคริปต์เก่าเป็นตัวเพิ่ม
- แก้มือถือไม่ให้ตารางและเมนูทำให้เกิด horizontal overflow
- ถอด Cloudflare email masking โดย decode จาก href เดิม ไม่เดาที่อยู่อีเมล
- ลิงก์เอกสารเปิดรูปเต็มในแท็บใหม่แทน popup เก่า

## ข้อจำกัด / ต้องยืนยันก่อน production
1. **แบบฟอร์ม Feedback เดิมใช้ PHP**: ยังไม่ย้ายฟอร์มส่งข้อมูล ไม่มี backend หรือการแสดง success หลอก ติดต่อผ่านเบอร์และอีเมลในท้ายเว็บได้ หากต้องการฟอร์ม ให้เลือกบริการรับข้อความก่อน
2. **รางวัลใน HTML export มี 6 รายการ**: ไม่ใช่หลักฐานว่ามีเอกสารครบทุกหน้าของเว็บ live และไม่ใช่การรับรองว่าใบรับรองยังไม่หมดอายุ
3. **ไฟล์ตกแต่งบางไฟล์ไม่มีในชุด HTML**: ดู `data/legacy/import-report.json` เป็นรูป CSS ของ selector เก่า/ส่วน admin หรือ social ที่ไม่แสดงในเว็บนี้ ไม่สร้างภาพใหม่แทน ไม่มี missing asset ในหน้าที่ทดสอบ
4. **ภาษา**: ใช้ข้อความจาก HTML ตามแต่ละภาษาโดยตรง บางส่วนของต้นฉบับ (เช่นภาพ embedded text และเนื้อหาบางย่อหน้า) ยังเป็นอังกฤษแม้เปิดภาษาญี่ปุ่น/จีน ต้องให้บริษัทตรวจรับ ไม่แปลทับข้อความในรูปเดิมเอง
5. เทียบกับ HTML export ไม่อ้างว่าเหมือนเว็บ live ทุกพิกเซล เพราะ export มีส่วนที่ถูกแก้ไข/มี error มาก่อน ต้องให้เจ้าของเว็บตรวจรับภาพรวม
6. Google Maps เป็น external embed ต้องตรวจบนเครือข่ายจริงและจัดการ privacy/consent ตามนโยบายบริษัท Browser tests จำลอง Maps ไม่ได้ทดสอบบริการจริง
7. `npm audit` พบ 2 low / 9 moderate จาก dependency tree ให้ทีมตรวจและอัปเดตก่อนเปิดใช้งานจริง
8. static hosting ต้องตั้ง root redirect `/` → `/th` และ redirect URL `.html`/`.php` เดิม ส่วน Nuxt Node มี root redirect แล้ว

## การแบ่งงาน
- Frontend: shared components, carousel, accessibility และ compatibility CSS
- Content/Translation: JSON ใน data/legacy, metadata/UI ใน data/locales (ต้อง review markup)
- Assets: ตรวจรูป/โลโก้/ฟอนต์ใน public/legacy เทียบไฟล์ Drive
- QA: `npm test`, `npm run build`, `npm run generate`, `npm run test:browser` พร้อมตรวจด้วยสายตา
- DevOps: static/Node hosting, HTTPS, redirect และ privacy headers

## ตรวจแล้ว
- Unit/content tests: 10 tests
- Browser smoke: 28 routes, รูป local, overflow ที่ 1280/768/375 px, mobile menu, language switch, carousel, 404
- Browser test ไม่พบ console/hydration errors บนหน้าปกติ (404 ที่ตั้งใจทดสอบแยกต่างหาก)
