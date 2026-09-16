/* ============================================================
   VoltRush — Login (Supabase Auth: email + password)
   ชื่อ/อวตารเก็บใน user_metadata ของบัญชี Supabase (auth.users) ไม่ใช่
   localStorage แล้ว ข้ามเครื่องได้ตราบใด login ด้วยอีเมลเดิม
============================================================ */

const VOLTRUSH_AVATARS = ['👷', '🧑‍🔧', '👩‍🔬', '🧑‍🚀', '🦺', '⚡', '🌆', '🔋'];

/* ล้าง localStorage ของระบบ login เก่า (ก่อนย้ายมา Supabase Auth) ไม่ใช้แล้ว */
try { localStorage.removeItem('voltrushProfileV1'); } catch (e) {}

/* cache ผู้ใช้ปัจจุบันไว้ในตัวแปร sync เพราะ Supabase session check เป็น async
   แต่โค้ดหลายจุด (เช่น prefill ชื่อท้ายเกม) ต้องอ่านค่าแบบ sync */
let voltrushCurrentUser = null;

function getVoltrushProfile() {
  if (!voltrushCurrentUser) return null;
  const meta = voltrushCurrentUser.user_metadata || {};
  return { name: meta.display_name || voltrushCurrentUser.email, avatar: meta.avatar || VOLTRUSH_AVATARS[0] };
}
function getVoltrushProfileName() {
  const p = getVoltrushProfile();
  return p ? p.name : '';
}
async function logoutVoltrush() {
  if (typeof gachaFlushPendingSave === 'function') await gachaFlushPendingSave();
  if (typeof sb === 'object' && sb && sb.auth) {
    try { await sb.auth.signOut(); } catch (e) { console.error('ออกจากระบบล้มเหลว:', e); }
  }
  voltrushCurrentUser = null;
  if (typeof gachaDefaultState === 'function') gacha = gachaDefaultState(); /* เคลียร์ของในหน่วยความจำ ไม่มีอะไรค้างในเครื่อง */
  showLoginScreen();
}

/* หน้าจอหลักของเกม/ล็อบบี้ ทุกใบต้องซ่อนก่อนสลับไปหน้าอื่นเสมอ */
const VOLTRUSH_HUB_SCREENS = ['loginScreen', 'lobbyScreen', 'startScreen', 'skinScreen', 'blueprintScreen', 'engineerScreen'];
function hideVoltrushHubScreens() {
  VOLTRUSH_HUB_SCREENS.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.add('hidden');
  });
}

let loginSelectedAvatar = VOLTRUSH_AVATARS[0];
function selectLoginAvatar(emoji) {
  loginSelectedAvatar = emoji;
  document.querySelectorAll('#loginAvatarRow .login-avatar-btn').forEach(b => {
    b.classList.toggle('selected', b.dataset.avatar === emoji);
  });
}

function setLoginBusy(busy, msg) {
  const btnA = document.getElementById('loginSignInBtn');
  const btnB = document.getElementById('loginSignUpBtn');
  if (btnA) btnA.disabled = busy;
  if (btnB) btnB.disabled = busy;
  const status = document.getElementById('loginStatusMsg');
  if (status) status.textContent = msg || '';
}

function readLoginFields() {
  return {
    email: document.getElementById('loginEmailInput').value.trim(),
    password: document.getElementById('loginPasswordInput').value,
    name: document.getElementById('loginNameInput').value.trim()
  };
}

async function submitSignUp() {
  if (!(typeof sb === 'object' && sb && sb.auth)) { showToast('ยังเชื่อมต่อ Supabase ไม่ได้ ลองรีเฟรชหน้า'); return; }
  const f = readLoginFields();
  if (!f.name) { showToast('พิมพ์ชื่อผู้เล่นก่อนนะ'); return; }
  if (!f.email || !f.password) { showToast('กรอกอีเมลกับรหัสผ่านก่อนนะ'); return; }
  if (f.password.length < 6) { showToast('รหัสผ่านต้องยาวอย่างน้อย 6 ตัวอักษร'); return; }
  const username = f.name.slice(0, 16);
  setLoginBusy(true, 'กำลังสมัครสมาชิก...');
  try {
    const { data: taken } = await sb.from('usernames').select('username').eq('username', username).maybeSingle();
    if (taken) { showToast('ชื่อผู้ใช้นี้ถูกใช้แล้ว ลองตั้งชื่ออื่น'); return; }

    const { data, error } = await sb.auth.signUp({
      email: f.email,
      password: f.password,
      options: { data: { display_name: username, avatar: loginSelectedAvatar } }
    });
    if (error) throw error;
    if (!data.session) {
      showToast('สมัครสำเร็จ! แต่ยังลงทะเบียนชื่อผู้ใช้ไม่ได้จนกว่าจะยืนยันอีเมลก่อน (แนะนำปิด "Confirm email" ใน Supabase ถ้าไม่อยากรอ) หลังยืนยันแล้ว เข้าสู่ระบบด้วยอีเมลครั้งแรกเพื่อให้ระบบลงทะเบียนชื่อผู้ใช้ให้อัตโนมัติ');
      return;
    }

    const { error: mapErr } = await sb.from('usernames').insert({ username: username, user_id: data.user.id, email: f.email });
    if (mapErr) { console.error('ลงทะเบียนชื่อผู้ใช้ล้มเหลว:', mapErr); showToast('สมัครสำเร็จ แต่ลงชื่อผู้ใช้ไม่สำเร็จ — เข้าสู่ระบบด้วยอีเมลไปก่อนได้'); }

    voltrushCurrentUser = data.user;
    if (typeof gachaLoadFromCloud === 'function') await gachaLoadFromCloud(data.user.id);
    showLobbyScreen();
  } catch (e) {
    const msg = e && e.message ? e.message : '';
    if (/already registered/i.test(msg)) {
      showToast('อีเมลนี้เคยสมัครไว้แล้ว (อาจค้างรอยืนยันจากก่อนหน้า) — ลองพิมพ์อีเมลนี้ในช่องชื่อผู้ใช้แล้วกด "เข้าสู่ระบบ" แทน ถ้ายังเข้าไม่ได้ให้ไปลบบัญชีนี้ใน Supabase Dashboard → Authentication → Users แล้วสมัครใหม่');
    } else {
      showToast('สมัครไม่สำเร็จ: ' + (msg || 'ลองใหม่อีกครั้ง'));
    }
  } finally { setLoginBusy(false, ''); }
}

async function submitSignIn() {
  if (!(typeof sb === 'object' && sb && sb.auth)) { showToast('ยังเชื่อมต่อ Supabase ไม่ได้ ลองรีเฟรชหน้า'); return; }
  const f = readLoginFields();
  if (!f.name || !f.password) { showToast('กรอกชื่อผู้ใช้กับรหัสผ่านก่อนนะ'); return; }
  setLoginBusy(true, 'กำลังเข้าสู่ระบบ...');
  try {
    const { data: mapped } = await sb.from('usernames').select('email').eq('username', f.name).maybeSingle();
    let email = mapped ? mapped.email : null;
    if (!email) {
      if (f.name.indexOf('@') === -1) {
        showToast('ไม่พบชื่อผู้ใช้นี้ ถ้าเพิ่งสมัครและรอยืนยันอีเมล ให้พิมพ์อีเมลแทนชื่อผู้ใช้ในการเข้าสู่ระบบครั้งแรก');
        return;
      }
      email = f.name; /* เผื่อบัญชีที่ยังไม่ได้ลงทะเบียนชื่อผู้ใช้ (รอยืนยันอีเมลตอนสมัคร) */
    }
    const { data, error } = await sb.auth.signInWithPassword({ email: email, password: f.password });
    if (error) throw error;
    voltrushCurrentUser = data.user;

    if (!mapped) {
      const meta = data.user.user_metadata || {};
      const uname = meta.display_name || email.split('@')[0];
      const { error: mapErr } = await sb.from('usernames').insert({ username: uname, user_id: data.user.id, email: email });
      if (mapErr) console.warn('ลงทะเบียนชื่อผู้ใช้อัตโนมัติไม่สำเร็จ:', mapErr);
    }

    if (typeof gachaLoadFromCloud === 'function') await gachaLoadFromCloud(data.user.id);
    showLobbyScreen();
  } catch (e) {
    const msg = e && e.message ? e.message : '';
    if (/not confirmed/i.test(msg)) {
      showToast('บัญชีนี้ยังไม่ได้ยืนยันอีเมล — เช็คอีเมล (รวมโฟลเดอร์ spam) แล้วกดลิงก์ยืนยันก่อน หรือปิด "Confirm email" ใน Supabase แล้วลบบัญชีนี้สมัครใหม่');
    } else {
      showToast('เข้าสู่ระบบไม่สำเร็จ: ' + (msg || 'ตรวจชื่อผู้ใช้/รหัสผ่านอีกครั้ง'));
    }
  } finally { setLoginBusy(false, ''); }
}

function buildLoginScreenUI() {
  if (document.getElementById('loginScreen')) return;
  const screen = document.createElement('div');
  screen.id = 'loginScreen';
  screen.className = 'screen hidden';
  screen.innerHTML =
    '<div class="start-card login-card">' +
    '<h1>⚡ VoltRush</h1>' +
    '<p class="subtitle">เข้าสู่ระบบด้วย <b>ชื่อผู้ใช้ + รหัสผ่าน</b> หรือสมัครสมาชิกใหม่ด้วยชื่อ+อีเมล+รหัสผ่าน</p>' +
    '<div class="login-avatar-row" id="loginAvatarRow">' +
    VOLTRUSH_AVATARS.map((a, i) => '<button type="button" class="login-avatar-btn' + (i === 0 ? ' selected' : '') + '" data-avatar="' + a + '" onclick="selectLoginAvatar(\'' + a + '\')">' + a + '</button>').join('') +
    '</div>' +
    '<input type="text" id="loginNameInput" class="login-name-input" placeholder="ชื่อผู้ใช้ (ใช้ตอนเข้าสู่ระบบด้วย)" maxlength="16">' +
    '<input type="email" id="loginEmailInput" class="login-name-input" placeholder="อีเมล (กรอกเฉพาะตอนสมัครสมาชิก)" style="margin-top:8px;">' +
    '<input type="password" id="loginPasswordInput" class="login-name-input" placeholder="รหัสผ่าน (อย่างน้อย 6 ตัว)" style="margin-top:8px;">' +
    '<div class="start-actions" style="margin-top:14px;">' +
    '<button class="primary-btn" id="loginSignInBtn" onclick="submitSignIn()">🚀 เข้าสู่ระบบ</button>' +
    '<button class="secondary-btn" id="loginSignUpBtn" onclick="submitSignUp()">✨ สมัครสมาชิกใหม่</button>' +
    '</div>' +
    '<p class="login-note" id="loginStatusMsg"></p>' +
    '</div>';
  document.body.appendChild(screen);
}

function showLoginScreen() {
  buildLoginScreenUI();
  hideVoltrushHubScreens();
  document.getElementById('loginScreen').classList.remove('hidden');
  document.getElementById('loginEmailInput').focus();
}

/* เรียกจาก index.html ตอนโหลดหน้าเสร็จ เช็ค session ที่ล็อกอินค้างไว้ก่อน
   ค่อยตัดสินใจว่าจะโชว์ล็อบบี้ (login ค้างอยู่) หรือหน้า login */
async function initVoltrushAuthBootstrap() {
  buildLoginScreenUI();
  if (!(typeof sb === 'object' && sb && sb.auth)) { showLoginScreen(); return; }
  try {
    const { data } = await sb.auth.getSession();
    if (data && data.session && data.session.user) {
      voltrushCurrentUser = data.session.user;
      if (typeof gachaLoadFromCloud === 'function') await gachaLoadFromCloud(data.session.user.id);
      showLobbyScreen();
    } else {
      showLoginScreen();
    }
  } catch (e) {
    console.error('เช็ค session ล้มเหลว:', e);
    showLoginScreen();
  }
  if (sb && sb.auth && sb.auth.onAuthStateChange) {
    sb.auth.onAuthStateChange((event, session) => {
      voltrushCurrentUser = session ? session.user : null;
    });
  }
}

buildLoginScreenUI();
