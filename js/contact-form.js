/* The SMTP API, never the browser, decides the recipient and mail headers. */
(function () {
  'use strict';
  var copy = {
    en: {
      sending:'Sending…', accepted:'Your message has been accepted by our email server for contact-ga@matsuda-sangyo.com.',
      failed:'Your message has not been sent. Please try again or email contact-ga@matsuda-sangyo.com. Your details have been kept in the form.',
      unavailable:'The email service is not available yet. Your message has not been sent. Please email contact-ga@matsuda-sangyo.com directly.',
      invalid:'Please check all required fields and enter a valid email address and telephone number.',
      limited:'Too many attempts. Please wait 10 minutes before trying again, or email contact-ga@matsuda-sangyo.com.'
    },
    th: {
      sending:'กำลังส่ง…', accepted:'ระบบอีเมลรับข้อความเพื่อส่งถึง contact-ga@matsuda-sangyo.com แล้ว',
      failed:'ยังไม่ได้ส่งข้อความ กรุณาลองอีกครั้ง หรือติดต่อ contact-ga@matsuda-sangyo.com ข้อมูลที่กรอกยังอยู่ในฟอร์ม',
      unavailable:'ระบบส่งอีเมลยังไม่พร้อมใช้งาน ข้อความยังไม่ได้ถูกส่ง กรุณาติดต่อ contact-ga@matsuda-sangyo.com โดยตรง',
      invalid:'กรุณากรอกข้อมูลที่จำเป็นให้ครบ พร้อมตรวจสอบอีเมลและหมายเลขโทรศัพท์',
      limited:'ส่งคำขอถี่เกินไป กรุณารอ 10 นาทีแล้วลองใหม่ หรือติดต่อ contact-ga@matsuda-sangyo.com'
    },
    ja: {
      sending:'送信中…', accepted:'メールサーバーが contact-ga@matsuda-sangyo.com 宛てのメッセージを受け付けました。',
      failed:'メッセージは送信されていません。再試行するか、contact-ga@matsuda-sangyo.com へご連絡ください。入力内容は保持されています。',
      unavailable:'メールサービスは現在利用できません。メッセージは送信されていません。contact-ga@matsuda-sangyo.com へ直接ご連絡ください。',
      invalid:'必須項目とメールアドレス、電話番号をご確認ください。',
      limited:'試行回数が多すぎます。10分後に再試行するか、contact-ga@matsuda-sangyo.com へご連絡ください。'
    },
    'zh-Hans': {
      sending:'正在发送…', accepted:'邮件服务器已接受发送至 contact-ga@matsuda-sangyo.com 的消息。',
      failed:'消息尚未发送。请重试或联系 contact-ga@matsuda-sangyo.com。表单中的内容已保留。',
      unavailable:'邮件服务暂不可用，消息尚未发送。请直接联系 contact-ga@matsuda-sangyo.com。',
      invalid:'请填写所有必填项，并检查电子邮箱及电话号码。',
      limited:'尝试次数过多。请等待10分钟后重试，或联系 contact-ga@matsuda-sangyo.com。'
    }
  };
  document.addEventListener('DOMContentLoaded', function () {
    var form = document.getElementById('frm_check');
    if (!form) return;
    var text = copy[document.documentElement.lang] || copy.en;
    var status = document.getElementById('warning_text');
    var button = form.querySelector('[type="submit"]');
    var originalLabel = button.value;
    var pending = false;
    function show(message, state) {
      status.textContent = message;
      status.style.display = 'block';
      status.dataset.state = state;
      status.scrollIntoView({ block:'nearest' });
    }
    form.addEventListener('submit', async function (event) {
      event.preventDefault();
      if (pending) return;
      if (!form.reportValidity()) { show(text.invalid,'error'); return; }
      var data = new FormData(form);
      var payload = { language:document.documentElement.lang };
      ['name','email','phone','topic','detail','website'].forEach(function (key) { payload[key] = String(data.get(key) || '').trim(); });
      pending = true; button.disabled = true; button.value = text.sending;
      form.setAttribute('aria-busy','true');
      show(text.sending,'pending');
      try {
        var response = await fetch('/api/contact', {
          method:'POST', headers:{ 'Content-Type':'application/json', 'Accept':'application/json' },
          body:JSON.stringify(payload), credentials:'same-origin'
        });
        var result = await response.json();
        if (response.status === 202 && result.ok === true && result.code === 'MAIL_ACCEPTED') {
          form.reset();
          show(text.accepted,'success');
        } else if (response.status === 429) show(text.limited,'error');
        else if (response.status === 422) show(text.invalid,'error');
        else if (result.code === 'MAIL_NOT_CONFIGURED') show(text.unavailable,'error');
        else show(text.failed,'error');
      } catch (_) { show(text.failed,'error'); }
      finally {
        pending = false; button.disabled = false; button.value = originalLabel;
        form.removeAttribute('aria-busy');
      }
    });
  });
}());
