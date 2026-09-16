/* ============================================================
   VoltRush — Engineer page (gacha banner: engineer, ระบบ 4★/5★)
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
    '<div class="gacha-crystal-bar">💎 <span id="engCrystalVal">0</span> Volt Crystal</div>' +
    '<div class="gacha-pity-row">' +
      '<span id="engPityText"></span> • เศษสะสม: <span id="engShardVal">0</span>' +
      '<button class="gacha-redeem-btn" onclick="gachaRedeemShards(ENGINEER_BANNER); renderEngineerScreen();">แลกเศษ → 💎</button>' +
    '</div>' +
    '<div class="start-actions" style="margin:12px 0;">' +
      '<button class="primary-btn" style="padding:10px 22px;font-size:0.9rem;" onclick="gachaPullOne(ENGINEER_BANNER)">สุ่ม 1 ครั้ง (💎' + GACHA_PULL_COST + ')</button>' +
      '<button class="primary-btn" style="padding:10px 22px;font-size:0.9rem;" onclick="gachaPullTen(ENGINEER_BANNER)">สุ่ม 10 ครั้ง (💎' + GACHA_PULL10_COST + ')</button>' +
    '</div>' +
    '<p class="gacha-hint">มอบหมายวิศวกร 1 คนต่อรอบ เพื่อรับสกิลประจำตัว กดซ้ำเพื่อยกเลิกมอบหมาย — ตัวที่ขึ้นเวท (5★): <b>' + GACHA_ITEM_MAP[GACHA_FEATURED.engineer].name + '</b></p>' +
    '<div class="gacha-collection-grid" id="engCollectionGrid"></div>' +
    '</div>';
  document.body.appendChild(screen);
}

function renderEngineerScreen() {
  document.getElementById('engCrystalVal').textContent = gacha.crystals;
  const pityNow = gacha.pity[ENGINEER_BANNER];
  const left = STAR_PITY_HARD - pityNow;
  document.getElementById('engPityText').textContent = 'การันตี 5★ ในอีก ' + left + ' ครั้ง (สะสม ' + pityNow + '/' + STAR_PITY_HARD + ')';
  document.getElementById('engShardVal').textContent = gacha.shards[ENGINEER_BANNER];

  const grid = document.getElementById('engCollectionGrid');
  const items = GACHA_ITEMS[ENGINEER_BANNER];
  grid.innerHTML = items.map(it => {
    const owned = gacha.owned[ENGINEER_BANNER].indexOf(it.id) !== -1;
    const color = ALL_RARITY_COLORS[it.rarity];
    let actionHtml = '';
    if (owned) {
      const equipped = gacha.equippedEngineer === it.id;
      actionHtml = '<button class="gacha-equip-btn ' + (equipped ? 'equipped' : '') + '" onclick="gachaEquipEngineer(\'' + it.id + '\')">' + (equipped ? '✓ มอบหมายอยู่' : 'มอบหมาย') + '</button>';
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
