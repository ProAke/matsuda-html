/* Static hosting adapters only. Content and visual assets remain from Drive. */
(function () {
  'use strict';
  // The source snapshots replaced this shared helper with a no-op. Reserve the
  // measured space for the fixed header (also when the original menu wraps).
  window.default_resize = function () {
    var header = document.getElementById('header');
    var spacer = document.getElementById('empty-header');
    if (header && spacer) spacer.style.height = header.offsetHeight + 'px';
  };
  window.addEventListener('load', window.default_resize);
  window.addEventListener('resize', window.default_resize);
  // Late font loading and wrapped translated labels can resize a fixed header
  // without a viewport resize. Keep its spacer measured, not hard-coded.
  document.addEventListener('DOMContentLoaded', function () {
    var header = document.getElementById('header');
    if (header && window.ResizeObserver) {
      var observer = new ResizeObserver(window.default_resize);
      observer.observe(header);
    }
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(window.default_resize);
    window.default_resize();
  });

  // No PHP/mail backend was included. Never submit personal data to a dead URL
  // or claim a message was sent. Keep the original form and explain this limit.
  document.addEventListener('submit', function (event) {
    if (event.target.id !== 'frm_check') return;
    event.preventDefault();
    event.stopImmediatePropagation();
    var filename = location.pathname;
    var message = /_th\.html$/.test(filename)
      ? 'เว็บไซต์ static นี้ยังไม่มีระบบส่งข้อความ กรุณาติดต่อทางโทรศัพท์หรืออีเมลที่ระบุบนหน้านี้ (ข้อความยังไม่ได้ถูกส่ง)'
      : /_jp\.html$/.test(filename)
        ? 'この静的サイトには送信機能がありません。記載の電話番号またはメールでお問い合わせください。メッセージは送信されていません。'
        : /_cn\.html$/.test(filename)
          ? '此静态网站尚无消息发送功能。请使用本页列出的电话或电子邮件联系。消息尚未发送。'
          : 'This static site has no message-delivery backend. Please contact us using the phone or email listed on this page. Your message has not been sent.';
    var warning = document.getElementById('warning_text');
    if (warning) {
      warning.textContent = message;
      warning.style.display = 'block';
      warning.setAttribute('role', 'status');
      warning.scrollIntoView({ block: 'center' });
    }
  }, true);
}());

// Restore the mobile menu and image gallery without a PHP or library backend.
document.addEventListener('DOMContentLoaded', function () {
  var ui = {
    en: { menu: 'Menu', navigation: 'Mobile navigation', gallery: 'Image gallery', previous: 'Previous image', next: 'Next image', close: 'Close gallery' },
    th: { menu: 'เมนู', navigation: 'เมนูนำทาง', gallery: 'แกลเลอรีรูปภาพ', previous: 'รูปก่อนหน้า', next: 'รูปถัดไป', close: 'ปิดแกลเลอรี' },
    ja: { menu: 'メニュー', navigation: 'ナビゲーション', gallery: '画像ギャラリー', previous: '前の画像', next: '次の画像', close: 'ギャラリーを閉じる' },
    'zh-Hans': { menu: '菜单', navigation: '导航菜单', gallery: '图片库', previous: '上一张图片', next: '下一张图片', close: '关闭图片库' }
  }[document.documentElement.lang];
  // Only interface controls are localized here; business copy stays in HTML.
  ui = ui || { menu: 'Menu', navigation: 'Mobile navigation', gallery: 'Image gallery', previous: 'Previous image', next: 'Next image', close: 'Close gallery' };
  document.querySelectorAll('#frm_check input[placeholder], #frm_check textarea[placeholder]').forEach(function (field) {
    field.setAttribute('aria-label', field.getAttribute('placeholder').replace(/\s*\*$/, ''));
  });
  document.querySelectorAll('a[target="_blank"]').forEach(function (link) { link.rel = 'noopener noreferrer'; });
  var navigation = document.querySelector('.mobile-navigation');
  var toggle = document.querySelector('.mobile-menu-toggle');
  if (toggle && navigation) {
    toggle.textContent = '☰ ' + ui.menu;
    navigation.setAttribute('aria-label', ui.navigation);
    toggle.addEventListener('click', function () {
      var open = navigation.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && navigation.classList.contains('is-open')) {
        navigation.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.focus();
      }
    });
  }
  if (navigation && toggle) {
    document.addEventListener('click', function (event) {
      if (!navigation.contains(event.target)) {
        navigation.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth >= 1024) {
        navigation.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }
  var links = Array.from(document.querySelectorAll('.div-awarded-d a[href^="uploads/awards/"], .div-contactus2 a[href^="uploads/contactus_photos/"]'));
  if (!links.length) return;
  var viewer = document.createElement('dialog');
  viewer.className = 'image-viewer';
  viewer.setAttribute('aria-label', ui.gallery);
  viewer.innerHTML = '<div class="viewer-toolbar"><button type="button" data-viewer="prev" aria-label="Previous image">‹</button><p class="viewer-caption"></p><button type="button" data-viewer="next" aria-label="Next image">›</button><button type="button" data-viewer="close" aria-label="Close gallery">×</button></div>';
  viewer.querySelector('[data-viewer="prev"]').setAttribute('aria-label', ui.previous);
  viewer.querySelector('[data-viewer="next"]').setAttribute('aria-label', ui.next);
  viewer.querySelector('[data-viewer="close"]').setAttribute('aria-label', ui.close);
  document.body.appendChild(viewer);
  var current = 0;
  function show(index) {
    current = (index + links.length) % links.length;
    var link = links[current];
    var image = viewer.querySelector('img');
    if (!image) { image = document.createElement('img'); viewer.appendChild(image); }
    image.src = link.href;
    image.alt = link.title || 'Document';
    viewer.querySelector('.viewer-caption').textContent = (current + 1) + ' / ' + links.length + ' — ' + image.alt;
    if (!viewer.open) viewer.showModal();
  }
  links.forEach(function (link, index) {
    link.addEventListener('click', function (event) {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault(); show(index);
    });
  });
  viewer.querySelector('[data-viewer="prev"]').onclick = function () { show(current - 1); };
  viewer.querySelector('[data-viewer="next"]').onclick = function () { show(current + 1); };
  viewer.querySelector('[data-viewer="close"]').onclick = function () { viewer.close(); };
  viewer.addEventListener('click', function (event) { if (event.target === viewer) viewer.close(); });
  viewer.addEventListener('keydown', function (event) {
    if (event.key === 'ArrowLeft') { event.preventDefault(); show(current - 1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); show(current + 1); }
  });
});
