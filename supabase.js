/**
 * ServisKu - Supabase Integration Module
 * Initializes window.supabaseClient for use by data.js and app.js
 * All data logic, WORKERS, SERVICE_META, DEFAULT_VENDORS, DEFAULT_JOBS are in data.js
 */

(function () {
  var SUPABASE_URL = 'https://nvzjjertcorclmbfrzkt.supabase.co';
  var SUPABASE_KEY = 'sb_publishable_F4cXB9nZH9KaFgHrkUgKnA_J91-3j7P';

  function tryInit() {
    if (
      window.supabase &&
      window.supabase.createClient &&
      SUPABASE_URL &&
      SUPABASE_KEY
    ) {
      try {
        window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        console.log('✅ Supabase Client initialized.');
      } catch (e) {
        console.error('❌ Supabase init error:', e);
        window.supabaseClient = null;
      }
    } else {
      window.supabaseClient = null;
      console.warn('⚠️ Supabase SDK belum siap, mode offline aktif.');
    }
  }

  // Run after all scripts are parsed to ensure window.supabase is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tryInit);
  } else {
    tryInit();
  }
})();
