/* ============================================================
   VoltRush — Lobby (hub screen shown after login)
============================================================ */

function goToStartScreenFromLobby() {
  hideVoltrushHubScreens();
  document.getElementById('startScreen').classList.remove('hidden');
}

function openLobbyRules() { document.getElementById('lobbyRulesOverlay').classList.remove('hidden'); }
function closeLobbyRules() { document.getElementById('lobbyRulesOverlay').classList.add('hidden'); }

function openLeaderboardFromLobby() {
  document.getElementById('lobbyScreen').classList.add('hidden');
  openLeaderboard(false);
  lbReturnScreen = 'lobbyScreen';
}

function lobbyBannerCountLabel(banner) {
  const owned = (gacha.owned[banner] || []).length;
  const total = GACHA_ITEMS[banner].length;
  return owned + '/' + total + ' ชิ้น';
}

function refreshLobbyStats() {
  const profile = getVoltrushProfile();
  if (!profile) return;
  const avatarEl = document.getElementById('lobbyAvatar');
  const nameEl = document.getElementById('lobbyPlayerName');
  if (avatarEl) avatarEl.textContent = profile.avatar || '👷';
  if (nameEl) nameEl.textContent = profile.name;
  const crystalEl = document.getElementById('lobbyCrystalVal');
  if (crystalEl) crystalEl.textContent = gacha.crystals;
  const skinCountEl = document.getElementById('lobbySkinCount');
  const bpCountEl = document.getElementById('lobbyBlueprintCount');
  const engCountEl = document.getElementById('lobbyEngineerCount');
  if (skinCountEl) skinCountEl.textContent = lobbyBannerCountLabel('style');
  if (bpCountEl) bpCountEl.textContent = lobbyBannerCountLabel('blueprint');
  if (engCountEl) engCountEl.textContent = lobbyBannerCountLabel('engineer');
}

function buildLobbyScreenUI() {
  if (document.getElementById('lobbyScreen')) return;

  const screen = document.createElement('div');
  screen.id = 'lobbyScreen';
  screen.className = 'screen hidden';
  screen.innerHTML =
    '<div class="lobby-shell">' +
      '<div class="lobby-topline">' +
        '<div class="lobby-who"><span id="lobbyAvatar" class="lobby-avatar">👷</span><span id="lobbyPlayerName" class="lobby-name"></span></div>' +
        '<button class="lobby-logout-btn" onclick="logoutVoltrush()">ออกจากระบบ</button>' +
      '</div>' +

      '<div class="lobby-hero">' +
        '<div class="lobby-hero-grid" aria-hidden="true">' +
          '<div class="lobby-node n1"></div><div class="lobby-node n2"></div><div class="lobby-node n3"></div>' +
          '<div class="lobby-node n4"></div><div class="lobby-node n5"></div>' +
          '<div class="lobby-wire w1"></div><div class="lobby-wire w2"></div><div class="lobby-wire w3"></div>' +
        '</div>' +
        '<div class="lobby-hero-content">' +
          '<div class="lobby-hero-title">ศูนย์บัญชาการพลังงาน VoltRush</div>' +
          '<div class="lobby-crystal-pill">💎 <span id="lobbyCrystalVal">0</span> Volt Crystal</div>' +
          '<button class="primary-btn lobby-play-btn" onclick="goToStartScreenFromLobby()">🚀 เริ่มบริหารเมือง</button>' +
        '</div>' +
      '</div>' +

      '<div class="lobby-nav-grid">' +
        '<button class="lobby-nav-card" onclick="showSkinScreen()">' +
          '<div class="lobby-nav-icon">🎨</div><div class="lobby-nav-title">สกิน</div>' +
          '<div class="lobby-nav-sub" id="lobbySkinCount">0/0 ชิ้น</div>' +
        '</button>' +
        '<button class="lobby-nav-card" onclick="showBlueprintScreen()">' +
          '<div class="lobby-nav-icon">⚡</div><div class="lobby-nav-title">พิมพ์เขียว</div>' +
          '<div class="lobby-nav-sub" id="lobbyBlueprintCount">0/0 ชิ้น</div>' +
        '</button>' +
        '<button class="lobby-nav-card" onclick="showEngineerScreen()">' +
          '<div class="lobby-nav-icon">👷</div><div class="lobby-nav-title">วิศวกร</div>' +
          '<div class="lobby-nav-sub" id="lobbyEngineerCount">0/0 ชิ้น</div>' +
        '</button>' +
        '<button class="lobby-nav-card" onclick="openLeaderboardFromLobby()">' +
          '<div class="lobby-nav-icon">🏆</div><div class="lobby-nav-title">อันดับคะแนน</div>' +
          '<div class="lobby-nav-sub">ดูสถิติผู้เล่น</div>' +
        '</button>' +
      '</div>' +

      '<button class="secondary-btn lobby-rules-btn" onclick="openLobbyRules()">📋 กติกาเกม</button>' +
    '</div>';
  document.body.appendChild(screen);

  if (!document.getElementById('lobbyRulesOverlay')) {
    const overlay = document.createElement('div');
    overlay.id = 'lobbyRulesOverlay';
    overlay.className = 'modal-overlay hidden';
    overlay.onclick = function (e) { if (e.target === overlay) closeLobbyRules(); };
    overlay.innerHTML =
      '<div class="modal-card">' +
      '<div class="rules-box" style="margin-bottom:0;">' +
        '<h3>📋 กติกาเกม</h3>' +
        '<ul>' +
          '<li>เมื่อเริ่มเกม จะมี <b>บทเรียนพาชี้จุดจริงในเกม</b> ก่อน (ข้ามได้) แล้วมี <b>เวลาเตรียมตัว</b> ให้เปิด/ซื้อโรงไฟฟ้าล่วงหน้าก่อนนาฬิกาจริงเริ่มเดิน</li>' +
          '<li>เปิด/ปิดโรงไฟฟ้าด้วย <b>สวิตช์</b> ให้กำลังผลิตตามความต้องการของเมืองให้ทัน</li>' +
          '<li>แผงสถานะแสดงเหตุการณ์ปัจจุบัน → ถัดไป พร้อมนับถอยหลังตลอดเวลา และบางครั้งจะมี <b>เหตุการณ์พิเศษ</b> ทั้งดีและร้ายเกิดขึ้นแบบสุ่ม (ปรับความถี่ได้ตอนเริ่มเกม)</li>' +
          '<li>โรงไฟฟ้าขั้นสูงบางประเภทเสี่ยงเกิด<b>เหตุฉุกเฉิน</b> ต้องรีบปิดให้ทัน ไม่งั้นเกมจบทันที และโรงไฟฟ้าทุกประเภทอาจหยุดชั่วคราวหรือกำลังลดลงแบบสุ่มได้</li>' +
          '<li>เล่นจบเกมจะได้รับ <b>Volt Crystal</b> ตามคะแนน นำไปสุ่มกาชาที่หน้าสกิน/พิมพ์เขียว/วิศวกร เพื่อเสริมสถิติโรงไฟฟ้าได้</li>' +
          '<li>อันดับคะแนนแยกตามเวลาเล่น และแยกช่วง วันนี้ / สัปดาห์นี้ / ตลอดกาล</li>' +
        '</ul>' +
      '</div>' +
      '<button class="secondary-btn" style="margin-top:14px;" onclick="closeLobbyRules()">ปิด</button>' +
      '</div>';
    document.body.appendChild(overlay);
  }
}

function showLobbyScreen() {
  buildLobbyScreenUI();
  hideVoltrushHubScreens();
  refreshLobbyStats();
  document.getElementById('lobbyScreen').classList.remove('hidden');
}

buildLobbyScreenUI();
