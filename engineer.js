/* ============================================================
   VoltRush — Engineer page (คอลเลกชันอย่างเดียว สุ่มแยกไปหน้าตู้กาชา)
============================================================ */
const ENGINEER_BANNER = 'engineer';

function buildEngineerScreenUI() {
  if (document.getElementById('engineerScreen')) return;
  const screen = document.createElement('div');
  screen.id = 'engineerScreen';
  screen.className = 'screen hidden';
  screen.innerHTML =
    '<div class="start-card gacha-page-card">' +
    '<div class="gacha-page-topbar">' +
      '<button class="secondary-btn" onclick="closeEngineerScreen()">⬅ กลับล็อบบี้</button>' +
      '<h1 style="margin:0;font-size:1.2rem;">👷 วิศวกรประจำโรงไฟฟ้า</h1>' +
      '<span style="width:1px;"></span>' +
    '</div>' +
    '<p class="gacha-hint">กด "เปิดโปรไฟล์" เพื่อมอบหมาย/เลเวลอัพ/จัดของ — สุ่มวิศวกรใหม่ได้ที่ 🎰 ตู้กาชา ในล็อบบี้</p>' +
    '<div class="gacha-collection-grid" id="engCollectionGrid"></div>' +
    '</div>';
  document.body.appendChild(screen);
}

function renderEngineerScreen() {
  const grid = document.getElementById('engCollectionGrid');
  const items = GACHA_ITEMS[ENGINEER_BANNER];
  grid.innerHTML = items.map(it => {
    const owned = gacha.owned[ENGINEER_BANNER].indexOf(it.id) !== -1;
    const color = ALL_RARITY_COLORS[it.rarity];
    let actionHtml = '';
    if (owned) {
      const equipped = gacha.equippedEngineer === it.id;
      const level = gachaGetLevel(ENGINEER_BANNER, it.id);
      actionHtml =
        '<div class="gacha-item-level">Lv.' + level + (equipped ? ' • มอบหมายอยู่' : '') + '</div>' +
        '<button class="gacha-equip-btn" onclick="showCharacterDetail(\'' + it.id + '\')">เปิดโปรไฟล์</button>';
    }
    return '<div class="gacha-item-card ' + (owned ? '' : 'locked') + '" style="--rarity-color:' + color + '">' +
      '<div class="gacha-item-icon">' + (owned ? '👷' : '🔒') + '</div>' +
      '<div class="gacha-item-name">' + it.name + '</div>' +
      '<div class="gacha-item-sub">' + (owned ? ('<b>' + it.skillName + '</b> — ' + it.desc) : '???') + '</div>' +
      '<div class="gacha-item-rarity">' + ALL_RARITY_LABELS[it.rarity] + '</div>' +
      actionHtml +
      '</div>';
  }).join('');
}

function showEngineerScreen() {
  buildEngineerScreenUI();
  hideVoltrushHubScreens();
  renderEngineerScreen();
  document.getElementById('engineerScreen').classList.remove('hidden');
}
function closeEngineerScreen() {
  document.getElementById('engineerScreen').classList.add('hidden');
  showLobbyScreen();
}

buildEngineerScreenUI();
