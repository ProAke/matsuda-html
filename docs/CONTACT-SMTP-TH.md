# ตั้งค่าฟอร์มติดต่อผ่าน Node.js / SMTP

## สิ่งที่เปลี่ยน

- Contact ทั้ง 4 ภาษา POST JSON ไป `/api/contact` บน Node server เดียวกับเว็บ
- ผู้รับถูกกำหนดที่ฝั่ง server เท่านั้น: **contact-ga@matsuda-sangyo.com**
- General matters เปลี่ยนทั้งข้อความและ mailto ครบ 29 หน้า โดยไม่เปลี่ยน layout
- From ใช้ `SMTP_FROM` ที่ผู้ให้บริการอนุญาต ส่วนอีเมลผู้กรอกเป็น Reply-To (ไม่ปลอม From)
- ตรวจข้อมูล, จำกัดขนาด request 20,000 bytes, honeypot, ตรวจ origin และจำกัด 5 ครั้งต่อ IP ต่อ 10 นาที
- แจ้งรับข้อความเฉพาะเมื่อ SMTP ยอมรับผู้รับแล้ว (HTTP 202) ไม่ได้รับรองว่าเข้า inbox; เมื่อผิดพลาดจะเก็บข้อมูลในฟอร์มไว้ให้ลองใหม่

## CC ทดสอบชั่วคราว

ตามคำขอผู้ดูแล เพิ่ม CC ไป **worapot.bhi@gmail.com** ใน `server/contact.mjs` (`CONTACT_TEST_CC`) โดยผู้รับหลักและอีเมลหน้าเว็บยังเป็นอีเมลบริษัท เมื่อ deploy เวอร์ชันนี้ ทุกข้อความจากฟอร์มจะมีสำเนาไป Gmail นี้ด้วย จึงควรใช้เฉพาะช่วงทดสอบที่ได้รับอนุญาต แล้วลบ constant และ field `cc` ทันทีหลังยืนยันผล พร้อมปรับ test ที่ตรวจ CC ให้ตรงกัน

ผล `MAIL_ACCEPTED` ยังตรวจผู้รับหลักเท่านั้น ไม่ยืนยันว่า Gmail ได้รับข้อความ ต้องตรวจกล่อง Gmail รวม spam ด้วย และยังต้องตั้งค่า SMTP จริงก่อนใช้งาน

## ตั้งค่าบน hosting

1. ใช้ Node.js 20.6 ขึ้นไปหากใช้ `--env-file` และติดตั้งด้วย `npm ci`
2. ขอรายละเอียด SMTP จากผู้ดูแลอีเมลบริษัท แล้วบันทึกใน **environment/secret settings ของ hosting เท่านั้น** ไม่ส่งรหัสผ่านในแชตและไม่ commit ลง Git
3. ตั้งค่าตาม `.env.example`:
   - `SMTP_HOST`: hostname ของ SMTP จริง
   - `SMTP_PORT`: ปกติ 587 พร้อม STARTTLS; หากใช้ 465 ให้ตั้ง `SMTP_SECURE=true`
   - `SMTP_SECURE`: `false` สำหรับ STARTTLS, `true` สำหรับ TLS ตั้งแต่เชื่อมต่อ ไม่รองรับ SMTP แบบไม่เข้ารหัส
   - `SMTP_USER` / `SMTP_PASS`: บัญชีที่ได้รับอนุญาต (ต้องมีทั้งคู่; เว้นทั้งคู่ได้เฉพาะบริษัทใช้ internal relay ที่อนุญาตอยู่แล้ว)
   - `SMTP_FROM`: อีเมลผู้ส่งที่บัญชี SMTP มีสิทธิ์ใช้งานและตั้งค่า SPF/DKIM/DMARC ถูกต้อง ไม่จำเป็นต้องเป็นอีเมลผู้รับ
   - `PUBLIC_ORIGIN`: URL เว็บไซต์จริง เช่น `https://matsuda-sangyothailand.com` ไม่ใส่ path; หากมี www ควร redirect ให้เป็น origin หลัก
   - `TRUST_PROXY`: ปกติ `false`; ตั้ง `true` ได้เฉพาะ reverse proxy ที่เขียนทับ X-Forwarded-For และไม่เปิดให้ผู้ใช้เข้าถึง Node โดยตรง มิฉะนั้นปลอม IP หลบ rate limit ได้
4. เริ่มด้วย `npm start` เมื่อ hosting inject environment ให้อยู่แล้ว จากนั้น restart process ทุกครั้งที่เปลี่ยนค่า
5. ถ้ารันบนเครื่อง/VM ด้วยไฟล์ `.env` (ไฟล์นี้ถูก gitignore และ server ไม่เปิดเผย):

   ```sh
   cp .env.example .env
   # กรอกค่าจริงใน .env อย่างปลอดภัย และจำกัดสิทธิ์ไฟล์
   node --env-file=.env scripts/serve.mjs
   ```

   `npm start` ไม่โหลด `.env` อัตโนมัติ
6. ให้ HTTPS reverse proxy ส่งทั้งหน้าเว็บและ `/api/contact` ไปยัง Node port เดียวกัน อย่านำขึ้น static-only hosting หากต้องใช้ฟอร์มส่งอีเมล อนุญาต outbound SMTP จาก hosting ไป mail server ด้วย

## ตรวจรับหลัง deploy

- ส่งข้อความทดสอบจากหน้า Contact และตรวจว่า API ตอบ `202 / MAIL_ACCEPTED`
- ให้เจ้าของกล่อง contact-ga ตรวจข้อความจริง รวม spam/quarantine และยืนยัน Reply-To/หัวข้อ/เนื้อหา
- ทดสอบเมื่อ SMTP ขัดข้อง: ต้องไม่แจ้งสำเร็จ และข้อมูลผู้กรอกยังอยู่
- ถ้า `503 / MAIL_NOT_CONFIGURED` ให้ตรวจ environment และ restart; ถ้า `MAIL_UNAVAILABLE` ตรวจ SMTP auth, TLS, firewall และสิทธิ์ From; ถ้า `MAIL_REJECTED` ตรวจนโยบายผู้รับ/relay
- ห้ามเก็บรหัสผ่านหรือเนื้อหาที่ลูกค้ากรอกใน log; server log เฉพาะรหัสข้อผิดพลาด
- rate limit เป็น in-memory ต่อ process รีเซ็ตเมื่อ restart; production หลาย instance/traffic สูงควรเพิ่ม shared rate limit และการป้องกัน spam ที่ reverse proxy/WAF

## ผลทดสอบใน repository

`npm test` ตรวจ API ด้วย SMTP mock เท่านั้น: การรับ/ปฏิเสธ/ล้มเหลว, ไม่มี config, validation, recipient override, origin, body size, rate limit และ footer/form ทั้ง 4 ภาษา ไม่ส่งอีเมลจริงและไม่มีข้อมูล SMTP บริษัทใน repository จึงยังไม่ถือว่ายืนยันการนำส่งบน production

เอกสารซ่อม static/layout ก่อนหน้านี้ที่ระบุว่าไม่มี mail backend เป็นประวัติของงานช่วงก่อนหน้า; เอกสารนี้และ README เป็นสถานะปัจจุบันของ Contact
