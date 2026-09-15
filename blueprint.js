/* ============================================================
   VoltRush — Blueprint page (gacha banner: blueprint)
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
    '<div class="gacha-crystal-bar">💎 <span id="bpCrystalVal">0</span> Volt Crystal</div>' +
    '<div class="gacha-pity-row">' +
      '<span id="bpPityText"></span> • เศษสะสม: <span id="bpShardVal">0</span>' +
      '<button class="gacha-redeem-btn" onclick="gachaRedeemShards(BLUEPRINT_BANNER); renderBlueprintScreen();">แลกเศษ → 💎</button>' +
    '</div>' +
    '<div class="start-actions" style="margin:12px 0;">' +
      '<button class="primary-btn" style="padding:10px 22px;font-size:0.9rem;" onclick="gachaPullOne(BLUEPRINT_BANNER)">สุ่ม 1 ครั้ง (💎' + GACHA_PULL_COST + ')</button>' +
      '<button class="primary-btn" style="padding:10px 22px;font-size:0.9rem;" onclick="gachaPullTen(BLUEPRINT_BANNER)">สุ่ม 10 ครั้ง (💎' + GACHA_PULL10_COST + ')</button>' +
    '</div>' +
    '<p class="gacha-hint">พิมพ์เขียวที่ปลดล็อกแล้วจะใช้งานอัตโนมัติกับโรงไฟฟ้าที่ตรงกัน ไม่ต้องสวมใส่เอง</p>' +
    '<div class="gacha-collection-grid" id="bpCollectionGrid"></div>' +
    '</div>';
  document.body.appendChild(screen);
}

function renderBlueprintScreen() {
  document.getElementById('bpCrystalVal').textContent = gacha.crystals;
  const pityNow = gacha.pity[BLUEPRINT_BANNER];
  const left = GACHA_PITY_HARD - pityNow;
  document.getElementById('bpPityText').textContent = 'การันตีตำนานในอีก ' + left + ' ครั้ง (สะสม ' + pityNow + '/' + GACHA_PITY_HARD + ')';
  document.getElementById('bpShardVal').textContent = gacha.shards[BLUEPRINT_BANNER];

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
