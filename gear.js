/* ============================================================
   VoltRush — Gear / ของสวมใส่ภาคสนาม page (เฟส 4)
   ได้จากดรอปท้ายเกมเท่านั้น ไม่มีในกาชา
============================================================ */

function gearStatLine(stat, value) {
  return GEAR_STAT_LABELS[stat] + ' +' + (value * 100).toFixed(1) + '%';
}

function buildGearScreenUI() {
  if (document.getElementById('gearScreen')) return;
  const screen = document.createElement('div');
  screen.id = 'gearScreen';
  screen.className = 'screen hidden';
  screen.innerHTML =
    '<div class="start-card gacha-page-card">' +
    '<div class="gacha-page-topbar">' +
      '<button class="secondary-btn" onclick="closeGearScreen()">⬅ กลับล็อบบี้</button>' +
      '<h1 style="margin:0;font-size:1.2rem;">🎒 ของสวมใส่ภาคสนาม</h1>' +
      '<span style="width:1px;"></span>' +
    '</div>' +
    '<p class="gacha-hint">ได้จากดรอปหลังจบเกมตามคะแนน (ไม่มีขายในกาชา) สวมได้ 4 ช่อง ใส่ครบ 2/4 ชิ้นจาก "ชุด" เดียวกันได้โบนัสเพิ่ม</p>' +
    '<div class="gear-equip-row" id="gearEquipRow"></div>' +
    '<div class="gear-bonus-summary" id="gearBonusSummary"></div>' +
    '<h3 class="gear-inv-title">คลังของสวมใส่</h3>' +
    '<div class="gear-inventory-grid" id="gearInventoryGrid"></div>' +
    '</div>';
  document.body.appendChild(screen);
}

function gearPieceCardHtml(g, equippedInSlot) {
  const color = GACHA_RARITY_COLORS[g.rarity];
  const setDef = GEAR_SETS[g.set];
  const isEquipped = equippedInSlot === g.id;
  return '<div class="gear-item-card" style="--rarity-color:' + color + '">' +
    '<div class="gear-item-top">' +
      '<span class="gear-item-icon">' + GEAR_SLOT_ICONS[g.slot] + '</span>' +
      '<span class="gear-item-rarity" style="color:' + color + '">' + GACHA_RARITY_LABELS[g.rarity] + '</span>' +
    '</div>' +
    '<div class="gear-item-name">' + GEAR_SLOT_LABELS[g.slot] + '</div>' +
    '<div class="gear-item-set">' + setDef.icon + ' ' + setDef.name + '</div>' +
    '<div class="gear-item-main">' + gearStatLine(g.mainStat, g.mainValue) + ' (หลัก)</div>' +
    '<div class="gear-item-subs">' + g.substats.map(s => gearStatLine(s.stat, s.value)).join(' · ') + '</div>' +
    '<div class="gear-item-actions">' +
      '<button class="gacha-equip-btn ' + (isEquipped ? 'equipped' : '') + '" onclick="gachaEquipGear(\'' + g.id + '\')">' + (isEquipped ? '✓ สวมอยู่' : 'สวมใส่') + '</button>' +
      '<button class="gear-discard-btn" onclick="gachaDeleteGear(\'' + g.id + '\')">ทิ้ง</button>' +
    '</div>' +
  '</div>';
}

function renderGearScreen() {
  const equipped = gacha.equippedGear || {};
  const inventory = gacha.gearInventory || [];

  const equipRow = document.getElementById('gearEquipRow');
  equipRow.innerHTML = GEAR_SLOTS.map(slot => {
    const id = equipped[slot];
    const piece = id ? inventory.find(g => g.id === id) : null;
    if (!piece) {
      return '<div class="gear-slot-box gear-slot-empty">' +
        '<div class="gear-slot-icon">' + GEAR_SLOT_ICONS[slot] + '</div>' +
        '<div class="gear-slot-label">' + GEAR_SLOT_LABELS[slot] + '</div>' +
        '<div class="gear-slot-empty-text">ว่าง</div>' +
      '</div>';
    }
    const color = GACHA_RARITY_COLORS[piece.rarity];
    return '<div class="gear-slot-box" style="--rarity-color:' + color + '">' +
      '<div class="gear-slot-icon">' + GEAR_SLOT_ICONS[slot] + '</div>' +
      '<div class="gear-slot-label">' + GEAR_SLOT_LABELS[slot] + '</div>' +
      '<div class="gear-slot-main">' + gearStatLine(piece.mainStat, piece.mainValue) + '</div>' +
      '<div class="gear-slot-rarity" style="color:' + color + '">' + GACHA_RARITY_LABELS[piece.rarity] + '</div>' +
    '</div>';
  }).join('');

  const totals = gachaGearBonusTotals();
  const summary = document.getElementById('gearBonusSummary');
  const lines = Object.keys(totals).filter(k => totals[k] > 0).map(k => gearStatLine(k, totals[k]));
  summary.innerHTML = lines.length
    ? '<b>โบนัสรวมจากของที่สวมอยู่:</b> ' + lines.join(' • ')
    : '<span style="color:#6d8099;">ยังไม่ได้สวมของชิ้นไหนเลย</span>';

  const grid = document.getElementById('gearInventoryGrid');
  if (inventory.length === 0) {
    grid.innerHTML = '<p style="color:#6d8099;font-size:0.8rem;text-align:center;padding:20px;">ยังไม่มีของสวมใส่ — เล่นจบเกมเพื่อลุ้นดรอป (คะแนนยิ่งสูง ยิ่งมีโอกาสได้ของหายากขึ้น)</p>';
    return;
  }
  const sorted = inventory.slice().sort((a, b) => {
    const order = { legendary: 0, epic: 1, rare: 2, common: 3 };
    return order[a.rarity] - order[b.rarity];
  });
  grid.innerHTML = sorted.map(g => gearPieceCardHtml(g, equipped[g.slot])).join('');
}

function showGearScreen() {
  buildGearScreenUI();
  hideVoltrushHubScreens();
  renderGearScreen();
  document.getElementById('gearScreen').classList.remove('hidden');
}
function closeGearScreen() {
  document.getElementById('gearScreen').classList.add('hidden');
  showLobbyScreen();
}

buildGearScreenUI();
