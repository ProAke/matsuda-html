# ซ่อม layout ครบทุกหน้าและทุกภาษา

วันที่ 4 พฤศจิกายน 2026 — สาขา `arena/cc7bc9b6-matsuda-html`

เอกสารนี้เป็นสถานะล่าสุด ต่อจากการแก้ Company ตามหน้าจีนที่ผู้ใช้ยืนยัน เอกสารนำเข้าและการซ่อมรอบก่อนเป็นบันทึกย้อนหลัง

## ขอบเขตครบ 29 ไฟล์

| หมวด | ไฟล์ที่ตรวจ |
|---|---|
| Home | `index.html`, `index_th.html`, `index_jp.html`, `index_cn.html` |
| Company | `company.html`, `company_th.html`, `company_jp.html`, `company_cn.html` |
| Related Links | `management_en.html`, `management.html` (TH), `management_jp.html`, `management_cn.html` |
| Our Business | `business.html`, `business_en.html`, `business_th.html`, `business_jp.html`, `business_cn.html` |
| Awards | `awarded.html`, `awarded_th.html`, `awarded_jp.html`, `awarded_cn.html` |
| Quality / Environment Policy | `career.html`, `career_th.html`, `career_jp.html`, `career_cn.html` |
| Contact | `contactus.html`, `contactus_th.html`, `contactus_jp.html`, `contactus_cn.html` |

28 หน้าหลัก 4 ภาษา + `business_en.html` ที่เก็บไว้ตามต้นฉบับ = 29 ไฟล์

## สิ่งที่แก้รอบนี้

1. รวมกฎ layout เป็น `template/styles/site-layout.css` ซึ่งโหลดผ่าน `reference-repairs.css` ทุกหน้า ไม่ใช้ patch เฉพาะ Company อีกต่อไป ลบ stylesheet เก่า `company-layout.css` และลิงก์ 3 หน้าที่เคยใช้
2. เมนู desktop ของภาษาที่ยาวใช้ช่อง flex ที่ตัดบรรทัดได้ภายในตัวเมนู ไม่ดัน header และทุก section ลงอีกแถว รักษา header desktop ภาษาจีนที่อนุมัติไว้ `company_cn.html` ไม่ได้ถูกแก้ไข
3. Spacer ของ fixed header ติดตามความสูงด้วย ResizeObserver และตรวจซ้ำหลังฟอนต์โหลดเสร็จ รองรับการเปลี่ยน desktop ↔ มือถือในหน้าเดิม ไม่ต้อง reload
4. Home JP มี `</div>` เกินหลังคอลัมน์ข้อความ ทำให้ส่วนถัดไปหลุดจาก `.content` แก้ให้ section order และ parent container ตรงกับภาษาอื่น
5. Related Links EN/JP/CN มี `</div>` เกินก่อน footer แก้ให้ balance เท่ากับหน้า TH
6. Home TH เคยเรียก `fnc_lang("en")` ตอนโหลดเสร็จ แก้เป็น `th`
7. กำหนด line boxes และ **minimum** text slots ของ Home ให้ภาษาที่ใช้ fallback font / มีจำนวนบรรทัดต่างกันไม่ดัน process graphics และสไลด์สินค้าออกจากแนวเดียวกัน ไม่ใช้ fixed height ที่ตัดข้อความ
8. Contact ใช้ minimum slot ของที่อยู่สำนักงานรองรับข้อความจีนที่มีบรรทัดรหัสไปรษณีย์เพิ่ม ทำให้ section แบบฟอร์มเริ่มตรงกันทุกภาษา แผนที่ iframe เป็น block ไม่มีช่อง baseline ส่วนเกิน
9. Policy และ Awards บนจอ 310 px รองรับหัวข้อ 2 บรรทัด ให้รูป/แกลเลอรีเริ่มตำแหน่งเดียวกัน ไม่ซ่อน overflow เพื่อหลอกผลตรวจ
10. ซ่อมเมนู TH ที่เคยเป็น EN และ Business EN ที่เคยใช้เมนู TH ใช้ **ข้อความเมนูเดิมที่มีอยู่แล้วในแต่ละภาษา** ให้ตรงกันทั้ง desktop / mobile / footer ไม่แปลข้อมูลธุรกิจใหม่
11. ปุ่มเมนูและชื่อปุ่มแกลเลอรีใช้ภาษาตามหน้า ปิดเมนูด้วย Escape, คลิกภายนอก หรือเปลี่ยนเป็น desktop ได้ เพิ่ม focus-visible และชื่อ accessible ของช่องกรอกตาม placeholder เดิม
12. รองรับ reduced-motion สำหรับภาพ process ที่เดิมเลื่อนเข้าจอ และเพิ่มการตัดคำ caption ของรูปเอกสารบนจอเล็ก

ไม่มี Nuxt/Vue, ไม่มี content renderer ใหม่, ไม่เปลี่ยนรูป/ฟอนต์ต้นฉบับ, ไม่คัดลอกเนื้อหาจีนไปทับภาษาอื่น และไม่แปลทับภาพนโยบายหรือเอกสารรับรอง

## ผลตรวจล่าสุด

- `npm test`: **46/46 ผ่าน** ตรวจ HTTP/ไฟล์อ้างอิง, hash ของ assets, inline JavaScript, โครงสร้างหลัก, เมนูแยกภาษา และ regression ที่เคยทำให้ layout เพี้ยน
- Chromium: **29 ไฟล์ × 5 viewport (310, 390, 768, 1024, 1280 px) = 145 กรณี**
- ไม่พบ page JavaScript error, HTTP error ของ local resources, ภาพโหลดไม่สำเร็จ, หัวข้อถูกตัดด้วย overflow หรือ horizontal overflow ในกรณีที่ตรวจ
- เทียบ landmark ของแต่ละหมวดกับไฟล์ CN ใน local: header, จุดเริ่ม content, section หลัก, รูป/แกลเลอรี, แบบฟอร์มและ footer ตามหมวด
- Company คงความสูงตารางตามข้อความจริง ไม่บังคับ footer ให้สูงเท่ากันจนต้องตัดคำแปล ส่วนจุดเริ่ม intro / แถบชื่อบริษัท / section ตารางยังตรงกัน
- ทุกหน้า 29 ไฟล์ทดสอบเมนูมือถือ, Escape, คลิกภายนอก, คลิกสลับภาษา และย่อ/ขยาย desktop ↔ มือถือ ↔ desktop โดยไม่ reload
- Home ทั้ง 4 ภาษา: next ของสไลด์ทั้งสองทำงาน
- Awards ทั้ง 4 ภาษา: เปิดดูภาพเต็มครบ 6 รูปต่อภาษา; Contact ทั้ง 4 ภาษา: แผนที่รูปภาพครบ 2 รูปต่อภาษา พร้อม ArrowLeft / ArrowRight / Escape
- Contact ทั้ง 4 ภาษา: กด Submit แล้วขึ้นคำเตือนว่าไม่ได้ส่ง ไม่เกิด POST และไม่เปลี่ยนหน้าไป PHP ที่ไม่มีอยู่
- รายงานวัดจริง: `docs/all-pages-layout-checks.json`

## รันทดสอบซ้ำ

เว็บไซต์และ unit tests ไม่ต้องติดตั้ง dependencies:

```sh
npm test
npm start
```

Browser QA ต้องมี Playwright และ Chromium แยกต่างหาก (ไม่ใช่ runtime dependency ของเว็บ):

```sh
npm install --no-save --package-lock=false playwright
npx playwright install chromium
# เปิด npm start ไว้ในอีก terminal ก่อน
npm run test:browser
```

CI ที่มี Chromium อยู่แล้วตั้ง `BROWSER_EXECUTABLE_PATH` ได้ ส่วน `PLAYWRIGHT_MODULE` และ `BROWSER_ARGS_JSON` รองรับการระบุ module/binary ของระบบ QA โดยไม่เพิ่ม dependencies ลงเว็บไซต์ `BASE_URL` ค่าเริ่มต้นคือ `http://127.0.0.1:3000` (ใช้เฉพาะ QA ในเครื่อง ไม่ใช่ URL ที่ browser ของผู้ใช้ต้องเรียก)

## ข้อจำกัดที่ยังคงตามจริง

- ผลเทียบ layout เป็น browser local ไม่ใช่ pixel-diff กับเว็บ production ทุกภาษา
- เนื้อหาภาษาต่างกันอาจมีความสูงตามจำนวนบรรทัด โดยเฉพาะตาราง Company อนุญาตให้ขยาย ไม่ crop เพื่อบังคับให้เหมือนกัน
- ต้นฉบับบางส่วนยังใช้ข้อความ/ภาพภาษาอังกฤษร่วมกัน ไม่ถือว่าการซ่อม layout เป็นการรับรองคำแปลหรือเอกสารนโยบาย 4 ภาษา
- Form ไม่มี backend ส่งอีเมล จึงแสดงคำเตือนตามจริง ไม่อ้างว่าส่งสำเร็จ
- Browser QA ปิด external requests เพื่อให้ทดสอบซ้ำได้แน่นอน จึงไม่ได้ยืนยันว่า Google Maps / external links / อีเมลปลายทางใช้งานได้บนเครือข่ายจริง
- ยังคงเอกสารรางวัลที่มีจริง 6 ฉบับ ไม่สร้างหน้า/เอกสารเพิ่มตามตัวเลข pagination ที่ยืนยันไม่ได้
