# ส่งต่อทีม / Migration checklist

## ทำแล้ว
- Nuxt SSR และรองรับ static generation ทั้ง 28 หน้า (7 ส่วน × 4 ภาษา)
- แยก JSON ภาษา ข้อมูลบริษัท และ manifest รูปภาพ ไม่ใช้ฐานข้อมูล
- หน้าแรก บริษัท ธุรกิจ รางวัล นโยบายคุณภาพ/สิ่งแวดล้อม ลิงก์ และติดต่อ
- สลับภาษาคงหน้าปัจจุบัน เมนูมือถือ ลิงก์โทรศัพท์และแผนที่
- ตรวจ route ที่ไม่ถูกต้องเป็น 404, แสดง fallback เมื่อรูปโหลดไม่ได้
- SEO title/description ตามภาษา, skip link, focus style, reduced motion

## ข้อจำกัดที่ต้องปิดก่อน production
1. **รูปยังเป็น remote URL**: binary download ถูกจำกัดใน sandbox ใช้ `scripts/sync-assets.mjs` จาก network ที่เข้าถึงเว็บเดิมได้ แล้วตรวจว่าไฟล์ตรงต้นฉบับ ไม่มีการสร้างรูปทดแทน
2. **ยังไม่ใช่การย้ายสื่อทุกไฟล์ครบถ้วน**: ดึงรูปที่พบจากหน้าหลักและหน้าเนื้อหาที่อ่านได้ รางวัลเดิมมี 11 หน้า ปัจจุบันมี 6 รายการจากหน้าแรก ต้องรวบรวมที่เหลือและตรวจรูป/ไฟล์ทั้งหมดกับเจ้าของเว็บ รวมถึง slides_2 ที่เหลือและกราฟิกตกแต่งเดิม
3. **โลโก้**: wordmark ในหัวเว็บเป็นข้อความและตัว M ชั่วคราว ไม่ใช่ไฟล์โลโก้ต้นฉบับ ต้องให้ทีมส่งโลโก้จริงและแทนก่อนเปิดใช้
4. **คำแปล**: เนื้อหา EN อ้างอิงเว็บเดิมและเรียบเรียงใหม่ ส่วน TH/JA/ZH เป็นร่าง ต้องให้เจ้าของภาษาและฝ่ายกฎหมายอนุมัติ ชื่อใบรับรอง ที่อยู่ และข้อความในภาพยังคงต้นฉบับ
5. ตรวจวันหมดอายุและความถูกต้องของใบรับรอง ไม่ถือว่าการแสดงเอกสารยืนยันสถานะปัจจุบัน
6. ไม่เพิ่มฟอร์มส่งข้อมูลหลอก: ติดต่อผ่านโทรศัพท์และแผนที่จริง หากต้องการแบบฟอร์มให้กำหนดบริการรับข้อความและนโยบายความเป็นส่วนตัว
7. ตรวจ redirect ของ URL PHP เดิมที่ hosting (company.php → /en/company, business.php → /en/business, awarded.php → /en/awards, career.php → /en/environment, management.php → /en/links, contactus.php → /en/contact) ค่า 301 เมื่อเปิดใช้จริง

## QA ก่อนเปิดใช้งาน
- `npm ci && npm test && npm run generate`
- ตรวจครบ 28 routes, refresh deep links, route ผิดได้ 404 และ URL root ไป /en
- ตรวจทุกภาษาใน desktop/tablet/mobile, keyboard menu และ screen reader
- ตรวจ browser console/network, รูป local ทุกไฟล์, ความคมชัดและ crop เทียบต้นฉบับ
- ยืนยันที่อยู่ เบอร์โทร ทุน และลิงก์แผนที่กับบริษัท
- ตรวจ dependency audit และ security updates ก่อน deploy

## การแบ่งงาน
Frontend: layout/components/responsive · Content: site.json + inventory · Translation: locale JSON · QA: routes/accessibility/assets · DevOps: static/Node hosting, HTTPS, redirects.
