# บันทึกผลอ่านต้นฉบับ live

วันที่ตรวจ: 2026-11-04 (Asia/Bangkok)
วิธี: เครื่องมือ fetch_page อ่านเว็บเป็นข้อความ/Markdown ไม่ใช่ screenshot หรือ raw HTML DOM และไม่ส่ง session/cookie ของผู้ใช้ ผลที่อ่านได้ของทุก default URL ด้านล่างเป็นภาษาอังกฤษ

บันทึกนี้เป็นสรุปผลอ่านที่ใช้ในรายงาน ไม่ใช่สำเนา raw response และไม่ใช่ checksum ของเว็บต้นฉบับ

## Default pages ที่อ่านสำเร็จ

| URL | สิ่งที่อ่านได้และใช้เป็นหลักฐาน |
|---|---|
| https://hi.matsuda-sangyothailand.com/ | For Prosperity And A Beautiful Earth; ข้อความธุรกิจโลหะมีค่า; สไลด์ 152_1726731437.jpg / 610_1726731429.jpg / 612_1726731399.jpg; แผนผัง line-index3-1.png / img-index3-1_en.png / img-index3-2.png; คำอธิบายทรัพยากร; รูป slides_2 จำนวน 6 ชื่อไฟล์; bg-index4.png |
| https://hi.matsuda-sangyothailand.com/company.php | Corporate Introduction; Matsuda Sangyo (Thailand) Co., Ltd.; COMPANY PROFILE; ผู้ถือหุ้น Matsuda Sangyo Co., Ltd. 100%; ทุน 240,000,000 Thai Baht; ที่อยู่/โทร/แฟกซ์ของอยุธยาและชลบุรี; รูป 11903812.jpg / companies/696_1691038676.jpg / companies/300_1445940288.png |
| https://hi.matsuda-sangyothailand.com/management.php | Related Links; ลิงก์ http://www.matsuda-sangyo.co.jp/en/index.html; uploads/Untitled2.jpg; images/bg-management2.png; ไม่พบหัวข้อ Management Message หรือ 2 ย่อหน้าที่มีใน local ในผลอ่านเนื้อหานี้ |
| https://hi.matsuda-sangyothailand.com/business.php | รูป images/img-business1_en.png และ images/business_en.png; ไม่พบบทความโลจิสติกส์พร้อม bullet ที่มีใน local ในผลอ่านเนื้อหานี้ |
| https://hi.matsuda-sangyothailand.com/awarded.php | Awards and Certifications; 6 thumbnail/full-image คู่; Page 1 from 11; ไม่ได้อ่าน pagination หน้า 2–11 ในรอบนี้ |
| https://hi.matsuda-sangyothailand.com/career.php | Quality & Environment Policy; uploads/Untitled7.jpg; page title ของผลอ่านคือ Career Opportunity ซึ่งไม่ใช่เหตุให้เปลี่ยนเนื้อหาเป็นสมัครงาน |
| https://hi.matsuda-sangyothailand.com/contactus.php | ข้อมูล Maps ฝังจำนวนมาก; เนื้อหา Contact Information อยู่ chunk 3 (0-based) จาก 4 chunks; ที่อยู่/โทร/แฟกซ์ 2 สำนักงาน; แผนที่ tmp_837_1750140747.jpg และ tmp_673_1750212565.jpg พร้อมลิงก์รูปเต็ม; Feedback; Invalid information please check again |

Copyright และรายการเมนู 7 หน้าแสดงในผลอ่าน แต่ข้อความ expanded footer/ฟอร์ม input/iframe ทุกส่วนไม่ถูกแสดงครบ จึงไม่ใช้ความเงียบของผลอ่านเป็นหลักฐานว่าส่วนเหล่านั้นไม่มี

## การเข้าถึงภาษาอื่นที่ลองแล้ว แต่ยังไม่ใช้รับรองต้นฉบับ

| URL ที่ลอง | ผล |
|---|---|
| https://hi.matsuda-sangyothailand.com/management.php?lang=th | ยังอ่านได้ Related Links ภาษาอังกฤษ และรูปชุดเดียวกับ default |
| https://hi.matsuda-sangyothailand.com/management.php?lang=jp | ยังอ่านได้ภาษาอังกฤษ |
| https://hi.matsuda-sangyothailand.com/management.php?lang=cn | ยังอ่านได้ภาษาอังกฤษ |
| https://hi.matsuda-sangyothailand.com/management.php?language=th | ยังอ่านได้ภาษาอังกฤษ |
| https://hi.matsuda-sangyothailand.com/index.php?lang=th | ยังอ่านได้หน้าแรกภาษาอังกฤษ |
| https://hi.matsuda-sangyothailand.com/management_jp.php | เนื้อหาตอบกลับเป็น 404 Not Found (แม้เครื่องมือรายงาน transport success) ไม่ใช่หน้าญี่ปุ่นที่ตรวจได้ |
| https://hi.matsuda-sangyothailand.com/js/language.js | เนื้อหาตอบกลับเป็น 404 Not Found ไม่ได้ค้นพบกลไกสลับภาษาจาก URL นี้ |

ดังนั้นไม่อ้างว่าพารามิเตอร์ lang/language เป็นกลไกสลับภาษาที่ถูกต้อง และไม่แปลว่าเว็บเดิมไม่มีอีก 3 ภาษา ต้องใช้ลิงก์จริง/session หรือ export จาก live ที่ยืนยันภาษาแล้วก่อนตรวจ parity อีก 21 หน้า

## ข้อจำกัดของหลักฐานภาพ/เอกสาร

- URL หรือชื่อภาพตรงกันไม่รับรองว่าไฟล์ live และ local มีไบต์เหมือนกัน ณ วันนี้
- ตรวจรูปนโยบาย local Untitled7.jpg และ Untitledth.jpg ด้วยสายตา และเทียบ hash local Untitled7.jpg กับ Untitled8.jpg เท่านั้น
- ไม่ได้ตรวจข้อความในใบรับรองทั้ง 6 ฉบับหรือรับรองวันหมดอายุ และยังไม่ได้ inventory เอกสารจากหน้ารางวัลถัดไป
- ไม่ได้ทำ browser interaction หรือทดสอบส่งฟอร์ม/อีเมลในเว็บ live
