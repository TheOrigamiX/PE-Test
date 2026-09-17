/* ============================================================
   VoltRush — Skin page (คอลเลกชันอย่างเดียว สุ่มแยกไปหน้าตู้กาชา)
============================================================ */
const SKIN_BANNER = 'style';

function buildSkinScreenUI() {
  if (document.getElementById('skinScreen')) return;
  const screen = document.createElement('div');
  screen.id = 'skinScreen';
  screen.className = 'screen hidden';
  screen.innerHTML =
    '<div class="start-card gacha-page-card">' +
    '<div class="gacha-page-topbar">' +
      '<button class="secondary-btn" onclick="closeSkinScreen()">⬅ กลับล็อบบี้</button>' +
      '<h1 style="margin:0;font-size:1.2rem;">🎨 สกินโรงไฟฟ้า</h1>' +
      '<span style="width:1px;"></span>' +
    '</div>' +
    '<p class="gacha-hint">ดูสกินที่มี/ยังไม่มี — สุ่มสกินใหม่ได้ที่ 🎰 ตู้กาชา ในล็อบบี้</p>' +
    '<div class="gacha-collection-grid" id="skinCollectionGrid"></div>' +
    '</div>';
  document.body.appendChild(screen);
}

function renderSkinScreen() {
  const grid = document.getElementById('skinCollectionGrid');
  const items = GACHA_ITEMS[SKIN_BANNER];
  grid.innerHTML = items.map(it => {
    const owned = gacha.owned[SKIN_BANNER].indexOf(it.id) !== -1;
    const color = GACHA_RARITY_COLORS[it.rarity];
    let actionHtml = '';
    if (owned) {
      const equipped = gacha.equippedSkins[it.plantKey] === it.id;
      actionHtml = '<button class="gacha-equip-btn ' + (equipped ? 'equipped' : '') + '" onclick="gachaEquipSkin(\'' + it.plantKey + '\',\'' + it.id + '\')">' + (equipped ? '✓ ใช้อยู่' : 'ใช้สกินนี้') + '</button>';
    }
    const icon = it.icon || '⚡';
    return '<div class="gacha-item-card ' + (owned ? '' : 'locked') + '" style="--rarity-color:' + color + '">' +
      '<div class="gacha-item-icon">' + (owned ? icon : '🔒') + '</div>' +
      '<div class="gacha-item-name">' + it.name + '</div>' +
      '<div class="gacha-item-sub">' + GACHA_RARITY_LABELS[it.rarity] + '</div>' +
      '<div class="gacha-item-rarity">' + GACHA_RARITY_LABELS[it.rarity] + '</div>' +
      actionHtml +
      '</div>';
  }).join('');
}

function showSkinScreen() {
  buildSkinScreenUI();
  hideVoltrushHubScreens();
  renderSkinScreen();
  document.getElementById('skinScreen').classList.remove('hidden');
}
function closeSkinScreen() {
  document.getElementById('skinScreen').classList.add('hidden');
  showLobbyScreen();
}

buildSkinScreenUI();
