/* ============================================================
   VoltRush — Skin page (gacha banner: style)
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
    '<div class="gacha-crystal-bar">💎 <span id="skinCrystalVal">0</span> Volt Crystal</div>' +
    '<div class="gacha-pity-row">' +
      '<span id="skinPityText"></span> • เศษสะสม: <span id="skinShardVal">0</span>' +
      '<button class="gacha-redeem-btn" onclick="gachaRedeemShards(SKIN_BANNER); renderSkinScreen();">แลกเศษ → 💎</button>' +
    '</div>' +
    '<div class="start-actions" style="margin:12px 0;">' +
      '<button class="primary-btn" style="padding:10px 22px;font-size:0.9rem;" onclick="gachaPullOne(SKIN_BANNER)">สุ่ม 1 ครั้ง (💎' + GACHA_PULL_COST + ')</button>' +
      '<button class="primary-btn" style="padding:10px 22px;font-size:0.9rem;" onclick="gachaPullTen(SKIN_BANNER)">สุ่ม 10 ครั้ง (💎' + GACHA_PULL10_COST + ')</button>' +
    '</div>' +
    '<div class="gacha-collection-grid" id="skinCollectionGrid"></div>' +
    '</div>';
  document.body.appendChild(screen);
}

function renderSkinScreen() {
  document.getElementById('skinCrystalVal').textContent = gacha.crystals;
  const pityNow = gacha.pity[SKIN_BANNER];
  const left = GACHA_PITY_HARD - pityNow;
  document.getElementById('skinPityText').textContent = 'การันตีตำนานในอีก ' + left + ' ครั้ง (สะสม ' + pityNow + '/' + GACHA_PITY_HARD + ')';
  document.getElementById('skinShardVal').textContent = gacha.shards[SKIN_BANNER];

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
