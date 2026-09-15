/* ============================================================
   VoltRush — Supabase client
   anon key นี้ออกแบบมาให้ฝั่ง browser ใช้ได้ตรงๆ (ปลอดภัย ถ้า RLS
   ตั้งถูก) ห้ามใช้ service_role key ในไฟล์ที่รันบน client เด็ดขาด
============================================================ */
const SUPABASE_URL = 'https://jimjgnwimsaadfkrqemi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImppbWpnbndpbXNhYWRma3JxZW1pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk0NjcyMzQsImV4cCI6MjEwNTA0MzIzNH0.waCQ27kUiW-2etBwy2sZ9TVfP6OFK3ZAsfPi62luCdo';

let sb = null;
try {
  if (typeof supabase !== 'undefined' && supabase.createClient) {
    sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('Supabase client พร้อมใช้งาน');
  } else {
    console.warn('ไม่พบ Supabase SDK — เช็คว่า script CDN โหลดก่อนไฟล์นี้');
  }
} catch (e) { console.error('Supabase client init ล้มเหลว:', e); }
