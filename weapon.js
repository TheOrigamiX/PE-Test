/* ============================================================
   VoltRush — Weapon page (คอลเลกชันอย่างเดียว สุ่มแยกไปหน้าตู้กาชา)
============================================================ */
const WEAPON_BANNER = 'weapon';

function buildWeaponScreenUI() {
  if (document.getElementById('weaponScreen')) return;
  const screen = document.createElement('div');
  screen.id = 'weaponScreen';
  screen.className = 'screen hidden';
  screen.innerHTML =
    '<div class="start-card gacha-page-card">' +
    '<div class="gacha-page-topbar">' +
      '<button class="secondary-btn" onclick="closeWeaponScreen()">⬅ กลับล็อบบี้</button>' +
      '<h1 style="margin:0;font-size:1.2rem;">🔧 อาวุธประจำตัว</h1>' +
      '<span style="width:1px;"></span>' +
    '</div>' +
    '<p class="gacha-hint">ติดตั้งอาวุธได้ 1 ชิ้น (ใช้ร่วมกับวิศวกรที่มอบหมายอยู่) — สุ่มอาวุธใหม่ได้ที่ 🎰 ตู้กาชา ในล็อบบี้</p>' +
    '<div class="gacha-collection-grid" id="wpnCollectionGrid"></div>' +
    '</div>';
  document.body.appendChild(screen);
}

function renderWeaponScreen() {
  const grid = document.getElementById('wpnCollectionGrid');
  const items = GACHA_ITEMS[WEAPON_BANNER];
  grid.innerHTML = items.map(it => {
    const owned = gacha.owned[WEAPON_BANNER].indexOf(it.id) !== -1;
    const color = ALL_RARITY_COLORS[it.rarity];
    let actionHtml = '';
    if (owned) {
      const equipped = gacha.equippedWeapon === it.id;
      const level = gachaGetLevel(WEAPON_BANNER, it.id);
      const cost = gachaLevelUpCost(level);
      const maxed = level >= GACHA_MAX_LEVEL;
      actionHtml =
        '<div class="gacha-item-level">Lv.' + level + (maxed ? ' (สูงสุด)' : '') + '</div>' +
        '<div class="gacha-item-skill"><b>⚡ ' + it.activeSkill.name + '</b> — ' + it.activeSkill.desc + '</div>' +
        '<button class="gacha-equip-btn ' + (equipped ? 'equipped' : '') + '" onclick="gachaEquipWeapon(\'' + it.id + '\')">' + (equipped ? '✓ ติดตั้งอยู่' : 'ติดตั้ง') + '</button>' +
        (maxed ? '' : '<button class="gear-discard-btn" style="background:rgba(110,231,168,0.15);color:#6ee7a8;margin-top:4px;width:100%;" onclick="gachaLevelUpUnit(\'' + WEAPON_BANNER + '\',\'' + it.id + '\')">เลเวลอัพ (🔩' + cost + ')</button>');
    }
    return '<div class="gacha-item-card ' + (owned ? '' : 'locked') + '" style="--rarity-color:' + color + '">' +
      '<div class="gacha-item-icon">' + (owned ? '🔧' : '🔒') + '</div>' +
      '<div class="gacha-item-name">' + it.name + '</div>' +
      '<div class="gacha-item-sub">' + (owned ? ('<b>' + it.skillName + '</b> — ' + it.desc) : '???') + '</div>' +
      '<div class="gacha-item-rarity">' + ALL_RARITY_LABELS[it.rarity] + '</div>' +
      actionHtml +
      '</div>';
  }).join('');
}

function showWeaponScreen() {
  buildWeaponScreenUI();
  hideVoltrushHubScreens();
  renderWeaponScreen();
  document.getElementById('weaponScreen').classList.remove('hidden');
}
function closeWeaponScreen() {
  document.getElementById('weaponScreen').classList.add('hidden');
  showLobbyScreen();
}

buildWeaponScreenUI();
