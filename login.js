/* ============================================================
   VoltRush — Login (local profile, no password)
   เก็บชื่อ/อวตารผู้เล่นไว้ใน localStorage เครื่องนี้เท่านั้น ไม่มีระบบ
   รหัสผ่านหรือบัญชีกลาง (เกมนี้ไม่มี backend auth) ใช้เพื่อทักทาย,
   จำชื่อไว้กรอกอันดับคะแนนอัตโนมัติ และเป็นประตูเข้าสู่ล็อบบี้
============================================================ */

const VOLTRUSH_PROFILE_KEY = 'voltrushProfileV1';
const VOLTRUSH_AVATARS = ['👷', '🧑‍🔧', '👩‍🔬', '🧑‍🚀', '🦺', '⚡', '🌆', '🔋'];

function getVoltrushProfile() {
  try {
    const raw = localStorage.getItem(VOLTRUSH_PROFILE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw);
    if (!p || !p.name) return null;
    return p;
  } catch (e) { return null; }
}
function saveVoltrushProfile(profile) {
  localStorage.setItem(VOLTRUSH_PROFILE_KEY, JSON.stringify(profile));
}
function getVoltrushProfileName() {
  const p = getVoltrushProfile();
  return p ? p.name : '';
}
function logoutVoltrush() {
  localStorage.removeItem(VOLTRUSH_PROFILE_KEY);
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

function submitLogin() {
  const input = document.getElementById('loginNameInput');
  const name = input.value.trim();
  if (!name) {
    input.focus();
    showToast('พิมพ์ชื่อผู้เล่นก่อนนะ');
    return;
  }
  const existing = getVoltrushProfile();
  saveVoltrushProfile({
    name: name.slice(0, 16),
    avatar: loginSelectedAvatar,
    createdAt: existing ? existing.createdAt : Date.now()
  });
  showLobbyScreen();
}

function buildLoginScreenUI() {
  if (document.getElementById('loginScreen')) return;
  const screen = document.createElement('div');
  screen.id = 'loginScreen';
  screen.className = 'screen hidden';
  screen.innerHTML =
    '<div class="start-card login-card">' +
    '<h1>⚡ VoltRush</h1>' +
    '<p class="subtitle">ก่อนเข้าล็อบบี้ ตั้งชื่อผู้บริหารเมืองของคุณก่อน</p>' +
    '<div class="login-avatar-row" id="loginAvatarRow">' +
    VOLTRUSH_AVATARS.map((a, i) => '<button type="button" class="login-avatar-btn' + (i === 0 ? ' selected' : '') + '" data-avatar="' + a + '" onclick="selectLoginAvatar(\'' + a + '\')">' + a + '</button>').join('') +
    '</div>' +
    '<input type="text" id="loginNameInput" class="login-name-input" placeholder="ใส่ชื่อของคุณ..." maxlength="16">' +
    '<div class="start-actions" style="margin-top:14px;">' +
    '<button class="primary-btn" onclick="submitLogin()">🚀 เข้าสู่ล็อบบี้</button>' +
    '</div>' +
    '<p class="login-note">ไม่ต้องใช้รหัสผ่าน ข้อมูลนี้เก็บไว้ในเครื่องนี้เท่านั้น</p>' +
    '</div>';
  document.body.appendChild(screen);
}

function showLoginScreen() {
  buildLoginScreenUI();
  hideVoltrushHubScreens();
  const profile = getVoltrushProfile();
  const input = document.getElementById('loginNameInput');
  input.value = profile ? profile.name : '';
  loginSelectedAvatar = profile ? profile.avatar : VOLTRUSH_AVATARS[0];
  document.querySelectorAll('#loginAvatarRow .login-avatar-btn').forEach(b => {
    b.classList.toggle('selected', b.dataset.avatar === loginSelectedAvatar);
  });
  document.getElementById('loginScreen').classList.remove('hidden');
  input.focus();
}

buildLoginScreenUI();
