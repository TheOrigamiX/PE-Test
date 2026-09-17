/* ============================================================
   VoltRush — Blueprint page (คอลเลกชันอย่างเดียว สุ่มแยกไปหน้าตู้กาชา)
============================================================ */
const BLUEPRINT_BANNER = 'blueprint';

function buildBlueprintScreenUI() {
  if (document.getElementById('blueprintScreen')) return;
  const screen = document.createElement('div');
  screen.id = 'blueprintScreen';
  screen.className = 'screen hidden';
  screen.innerHTML =
    '<div class="start-card gacha-page-card">' +
    '<div class="gacha-page-topbar">' +
      '<button class="secondary-btn" onclick="closeBlueprintScreen()">⬅ กลับล็อบบี้</button>' +
      '<h1 style="margin:0;font-size:1.2rem;">⚡ พิมพ์เขียวโรงไฟฟ้า</h1>' +
      '<span style="width:1px;"></span>' +
    '</div>' +
    '<p class="gacha-hint">พิมพ์เขียวที่ปลดล็อกแล้วใช้งานอัตโนมัติ ไม่ต้องสวมใส่เอง — สุ่มพิมพ์เขียวใหม่ได้ที่ 🎰 ตู้กาชา ในล็อบบี้</p>' +
    '<div class="gacha-collection-grid" id="bpCollectionGrid"></div>' +
    '</div>';
  document.body.appendChild(screen);
}

function renderBlueprintScreen() {
  const grid = document.getElementById('bpCollectionGrid');
  const items = GACHA_ITEMS[BLUEPRINT_BANNER];
  grid.innerHTML = items.map(it => {
    const owned = gacha.owned[BLUEPRINT_BANNER].indexOf(it.id) !== -1;
    const color = GACHA_RARITY_COLORS[it.rarity];
    const actionHtml = owned ? '<div class="gacha-owned-tag">ปลดล็อกแล้ว (ใช้อัตโนมัติ)</div>' : '';
    return '<div class="gacha-item-card ' + (owned ? '' : 'locked') + '" style="--rarity-color:' + color + '">' +
      '<div class="gacha-item-icon">' + (owned ? '⚡' : '🔒') + '</div>' +
      '<div class="gacha-item-name">' + it.name + '</div>' +
      '<div class="gacha-item-sub">+' + it.statBonusPct + '%</div>' +
      '<div class="gacha-item-rarity">' + GACHA_RARITY_LABELS[it.rarity] + '</div>' +
      actionHtml +
      '</div>';
  }).join('');
}

function showBlueprintScreen() {
  buildBlueprintScreenUI();
  hideVoltrushHubScreens();
  renderBlueprintScreen();
  document.getElementById('blueprintScreen').classList.remove('hidden');
}
function closeBlueprintScreen() {
  document.getElementById('blueprintScreen').classList.add('hidden');
  showLobbyScreen();
}

buildBlueprintScreenUI();
