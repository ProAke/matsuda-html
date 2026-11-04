/**
 * Language switching module for Matsuda static site.
 * Sets a lang class on <body> for CSS-based multilingual support.
 * Can be included via: <script src="js/language.js"></script>
 */

// Language function - toggle lang class on body for multilingual support
function fnc_lang(lang) {
    document.body.className = lang;
}

// Language configuration - can be fetched from server if needed
window.LANGUAGE_CONFIG = {
    // Language codes: en, jp, th, cn
    codes: ['en', 'jp', 'th', 'cn'],
    // Default language
    defaultLang: 'th',
    // Available languages
    available: {
        en: 'English',
        jp: '日本語',
        th: 'ไทย',
        cn: '中文'
    },
    // Initialize language from URL param or cookie if needed
    init: function() {
        // Can be extended to read from URL params, localStorage, etc.
        // e.g., fnc_lang(getQueryParam('lang') || this.defaultLang)
    }
};