/* ============================================================
   VoltRush — Gacha System (separate module)
   ต้องโหลดหลังสคริปต์หลักของ index.html เสมอ เพราะใช้ตัวแปร/ฟังก์ชัน
   ร่วม เช่น PLANT_DEFS, showToast, sndBuy, sndError, sndUpgrade
   ทุกฟังก์ชัน hook เข้าเกมหลักจะเช็ค typeof ก่อนเสมอ (กันเกมพังถ้า
   ไฟล์นี้โหลดไม่สำเร็จ)
============================================================ */

const GACHA_STATE_KEY = 'voltrushGachaStateV1';
const GACHA_PULL_COST = 100;
const GACHA_PULL10_COST = 900;
const GACHA_PITY_SOFT = 40;
const GACHA_PITY_HARD = 50;
const GACHA_RARITY_WEIGHTS = { common: 58, rare: 27, epic: 12, legendary: 3 };
const GACHA_RARITY_LABELS = { common: 'ธรรมดา', rare: 'หายาก', epic: 'เอปิก', legendary: 'ตำนาน' };
const GACHA_RARITY_COLORS = { common: '#9fb3d1', rare: '#38b6ff', epic: '#b388ff', legendary: '#ffd166' };
const GACHA_SHARD_GAIN = { common: 2, rare: 5, epic: 10, legendary: 20 };

const GACHA_ITEMS = {
  style: [
    { id: 'sty_coal_c', rarity: 'common', plantKey: 'coal', icon: '🏭', accent: '#8d99ae', name: 'ถ่านหินสีเทาวินเทจ' },
    { id: 'sty_wind_c', rarity: 'common', plantKey: 'wind', icon: '🎐', accent: '#48cae4', name: 'กังหันลมกระดิ่งลม' },
    { id: 'sty_solar_r', rarity: 'rare', plantKey: 'solar', icon: '🌻', accent: '#ffb703', name: 'โซลาร์ทานตะวัน' },
    { id: 'sty_hydro_r', rarity: 'rare', plantKey: 'hydro', icon: '🐬', accent: '#00b4d8', name: 'พลังน้ำโลมาเริงร่า' },
    { id: 'sty_geo_e', rarity: 'epic', plantKey: 'geothermal', icon: '🌋', accent: '#ff6d00', name: 'ภูเขาไฟลาวาทอง' },
    { id: 'sty_nuclear_e', rarity: 'epic', plantKey: 'nuclear', icon: '💎', accent: '#7b2cbf', name: 'นิวเคลียร์คริสตัล' },
    { id: 'sty_fusion_l', rarity: 'legendary', plantKey: 'fusion', icon: '🌟', accent: '#ff4fd8', name: 'ฟิวชันดาวตก' },
    { id: 'sty_hydrogen_l', rarity: 'legendary', plantKey: 'hydrogen', icon: '🦄', accent: '#4cc9f0', name: 'ไฮโดรเจนยูนิคอร์น' }
  ],
  blueprint: [
    { id: 'bp_coal', rarity: 'common', plantKey: 'coal', statBonusPct: 8, name: 'พิมพ์เขียวถ่านหินปรับปรุง' },
    { id: 'bp_solar', rarity: 'common', plantKey: 'solar', statBonusPct: 8, name: 'พิมพ์เขียวโซลาร์ประสิทธิภาพสูง' },
    { id: 'bp_gas', rarity: 'rare', plantKey: 'gas', statBonusPct: 15, name: 'พิมพ์เขียวก๊าซเทอร์โบ' },
    { id: 'bp_wind', rarity: 'rare', plantKey: 'wind', statBonusPct: 15, name: 'พิมพ์เขียวกังหันแอโรไดนามิก' },
    { id: 'bp_hydro', rarity: 'rare', plantKey: 'hydro', statBonusPct: 15, name: 'พิมพ์เขียวเขื่อนรุ่นใหม่' },
    { id: 'bp_geo', rarity: 'epic', plantKey: 'geothermal', statBonusPct: 25, name: 'พิมพ์เขียวความร้อนใต้พิภพขั้นสูง' },
    { id: 'bp_bio', rarity: 'epic', plantKey: 'biomass', statBonusPct: 25, name: 'พิมพ์เขียวชีวมวลอัดแน่น' },
    { id: 'bp_tidal', rarity: 'epic', plantKey: 'tidal', statBonusPct: 25, name: 'พิมพ์เขียวกังหันคลื่นล้ำยุค' },
    { id: 'bp_hydrogen', rarity: 'epic', plantKey: 'hydrogen', statBonusPct: 25, name: 'พิมพ์เขียวเซลล์เชื้อเพลิงบริสุทธิ์' },
    { id: 'bp_nuclear', rarity: 'legendary', plantKey: 'nuclear', statBonusPct: 40, name: 'พิมพ์เขียวเตาปฏิกรณ์รุ่นถัดไป' },
    { id: 'bp_fusion', rarity: 'legendary', plantKey: 'fusion', statBonusPct: 40, name: 'พิมพ์เขียวฟิวชันสมบูรณ์แบบ' }
  ],
  engineer: [
    { id: 'eng_common', rarity: 'common', name: 'ช่างฝึกหัด', perk: 'upgradeDiscount', value: 0.05, desc: 'ลดค่าอัพเกรดโรงไฟฟ้า 5%' },
    { id: 'eng_rare', rarity: 'rare', name: 'วิศวกรพลังงานสะอาด', perk: 'incomeBoost', value: 0.10, desc: 'เพิ่มรายได้จากทุกโรงไฟฟ้า 10%' },
    { id: 'eng_epic', rarity: 'epic', name: 'หัวหน้าฝ่ายความปลอดภัย', perk: 'hazardReduce', value: 0.35, desc: 'ลดโอกาสเกิดเหตุฉุกเฉิน 35%' },
    { id: 'eng_legendary', rarity: 'legendary', name: 'ผู้อำนวยการโรงไฟฟ้าในตำนาน', perk: 'allRounder', value: 0.15, desc: 'เพิ่มรายได้ 15% และลดค่าอัพเกรด 15%' }
  ]
};
const GACHA_ITEM_MAP = {};
Object.keys(GACHA_ITEMS).forEach(banner => GACHA_ITEMS[banner].forEach(it => { GACHA_ITEM_MAP[it.id] = Object.assign({ banner: banner }, it); }));

let gacha = loadGachaState();
function loadGachaState() {
  try {
    const raw = localStorage.getItem(GACHA_STATE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return {
    crystals: 300,
    pity: { style: 0, blueprint: 0, engineer: 0 },
    shards: { style: 0, blueprint: 0, engineer: 0 },
    owned: { style: [], blueprint: [], engineer: [] },
    equippedSkins: {},
    equippedEngineer: null
  };
}
function saveGachaState() { localStorage.setItem(GACHA_STATE_KEY, JSON.stringify(gacha)); }

/* ---------- roll logic ---------- */
function gachaRollRarity(banner) {
  gacha.pity[banner]++;
  if (gacha.pity[banner] >= GACHA_PITY_HARD) { gacha.pity[banner] = 0; return 'legendary'; }
  const weights = Object.assign({}, GACHA_RARITY_WEIGHTS);
  if (gacha.pity[banner] >= GACHA_PITY_SOFT) {
    const boost = (gacha.pity[banner] - GACHA_PITY_SOFT + 1) * 5;
    weights.legendary += boost;
    weights.common = Math.max(5, weights.common - boost);
  }
  const total = weights.common + weights.rare + weights.epic + weights.legendary;
  let r = Math.random() * total;
  const order = ['legendary', 'epic', 'rare', 'common'];
  for (let i = 0; i < order.length; i++) {
    const tier = order[i];
    if (r < weights[tier]) { if (tier === 'legendary') gacha.pity[banner] = 0; return tier; }
    r -= weights[tier];
  }
  return 'common';
}
function gachaPickItem(banner, rarity) {
  const pool = GACHA_ITEMS[banner].filter(it => it.rarity === rarity);
  if (pool.length === 0) return GACHA_ITEMS[banner][0];
  return pool[Math.floor(Math.random() * pool.length)];
}
function gachaRollOnce(banner) {
  const rarity = gachaRollRarity(banner);
  const item = gachaPickItem(banner, rarity);
  const isDup = gacha.owned[banner].indexOf(item.id) !== -1;
  if (isDup) { gacha.shards[banner] += GACHA_SHARD_GAIN[rarity]; }
  else { gacha.owned[banner].push(item.id); }
  return { item: item, rarity: rarity, isDup: isDup };
}

function gachaPullOne(banner) {
  if (gacha.crystals < GACHA_PULL_COST) { showToast('💸 เพชรไม่พอ ต้องการ ' + GACHA_PULL_COST + ' 💎'); if (typeof sndError === 'function') sndError(); return; }
  gacha.crystals -= GACHA_PULL_COST;
  const result = gachaRollOnce(banner);
  saveGachaState();
  if (typeof sndBuy === 'function') sndBuy();
  gachaShowReveal([result], banner);
  gachaRenderScreen();
}
function gachaPullTen(banner) {
  if (gacha.crystals < GACHA_PULL10_COST) { showToast('💸 เพชรไม่พอ ต้องการ ' + GACHA_PULL10_COST + ' 💎'); if (typeof sndError === 'function') sndError(); return; }
  gacha.crystals -= GACHA_PULL10_COST;
  const results = [];
  for (let i = 0; i < 10; i++) results.push(gachaRollOnce(banner));
  saveGachaState();
  if (typeof sndUpgrade === 'function') sndUpgrade();
  gachaShowReveal(results, banner);
  gachaRenderScreen();
}

/* ---------- effects applied to the main game ---------- */
function getGachaBlueprintBonus(plantKey) {
  const owned = gacha.owned.blueprint.map(id => GACHA_ITEM_MAP[id]).filter(it => it && it.plantKey === plantKey);
  if (owned.length === 0) return 0;
  return Math.max.apply(null, owned.map(it => it.statBonusPct)) / 100;
}
function gachaEquippedEngineerItem() {
  if (!gacha.equippedEngineer) return null;
  return GACHA_ITEM_MAP[gacha.equippedEngineer] || null;
}
function getGachaUpgradeDiscount() {
  const e = gachaEquippedEngineerItem();
  if (!e) return 0;
  if (e.perk === 'upgradeDiscount' || e.perk === 'allRounder') return e.value;
  return 0;
}
function getGachaHazardMult() {
  const e = gachaEquippedEngineerItem();
  if (e && e.perk === 'hazardReduce') return 1 - e.value;
  return 1;
}
function getGachaIncomeMult() {
  const e = gachaEquippedEngineerItem();
  if (e && (e.perk === 'incomeBoost' || e.perk === 'allRounder')) return 1 + e.value;
  return 1;
}
function getSkinIcon(def) {
  const skinId = gacha.equippedSkins[def.key];
  if (skinId && gacha.owned.style.indexOf(skinId) !== -1) { const it = GACHA_ITEM_MAP[skinId]; if (it) return it.icon; }
  return def.icon;
}
function getSkinAccent(def) {
  const skinId = gacha.equippedSkins[def.key];
  if (skinId && gacha.owned.style.indexOf(skinId) !== -1) { const it = GACHA_ITEM_MAP[skinId]; if (it) return it.accent; }
  return def.accent;
}
function gachaAwardCrystals(finalScore) {
  const amt = Math.max(10, Math.floor(finalScore / 40));
  gacha.crystals += amt;
  saveGachaState();
  showToast('💎 ได้รับ ' + amt + ' Volt Crystal จากผลงานครั้งนี้!');
  return amt;
}

/* ---------- UI ---------- */
let gachaCurrentBanner = 'style';
const GACHA_RARITY_RANK = { common: 0, rare: 1, epic: 2, legendary: 3 };
function gachaEquipSkin(plantKey, skinId) {
  gacha.equippedSkins[plantKey] = skinId;
  saveGachaState();
  gachaRenderScreen();
  showToast('✅ ใส่สกินแล้ว!');
}
function gachaEquipEngineer(id) {
  gacha.equippedEngineer = (gacha.equippedEngineer === id) ? null : id;
  saveGachaState();
  gachaRenderScreen();
  showToast(gacha.equippedEngineer ? '✅ มอบหมายวิศวกรแล้ว!' : 'ยกเลิกการมอบหมายวิศวกรแล้ว');
}
function switchGachaBanner(banner) {
  gachaCurrentBanner = banner;
  document.querySelectorAll('.gacha-banner-tab').forEach(b => b.classList.toggle('active', b.dataset.banner === banner));
  gachaRenderScreen();
}
function openGachaScreen() {
  document.getElementById('startScreen').classList.add('hidden');
  document.getElementById('gachaScreen').classList.remove('hidden');
  gachaRenderScreen();
}
function closeGachaScreen() {
  document.getElementById('gachaScreen').classList.add('hidden');
  document.getElementById('startScreen').classList.remove('hidden');
  gachaUpdateStartBadge();
}

function gachaRenderScreen() {
  document.getElementById('gachaCrystalVal').textContent = gacha.crystals;

  document.querySelectorAll('.gacha-banner-tab').forEach(b => {
    const banner = b.dataset.banner;
    b.classList.toggle('active', banner === gachaCurrentBanner);
    const countEl = b.querySelector('.gacha-tab-count');
    if (countEl) countEl.textContent = gacha.owned[banner].length + '/' + GACHA_ITEMS[banner].length;
  });

  const pityNow = gacha.pity[gachaCurrentBanner];
  const left = GACHA_PITY_HARD - pityNow;
  const pityPct = Math.min(100, Math.round((pityNow / GACHA_PITY_HARD) * 100));
  const ring = document.getElementById('gachaPityRing');
  if (ring) ring.style.setProperty('--pity-pct', pityPct);
  const ringVal = document.getElementById('gachaPityRingVal');
  if (ringVal) ringVal.textContent = pityNow + '/' + GACHA_PITY_HARD;
  document.getElementById('gachaPityText').textContent = 'การันตีตำนานในอีก ' + left + ' ครั้ง';
  document.getElementById('gachaShardVal').textContent = gacha.shards[gachaCurrentBanner];

  const btn1 = document.getElementById('gachaPullBtn1');
  const btn10 = document.getElementById('gachaPullBtn10');
  if (btn1) { const afford = gacha.crystals >= GACHA_PULL_COST; btn1.classList.toggle('disabled', !afford); btn1.disabled = !afford; }
  if (btn10) { const afford = gacha.crystals >= GACHA_PULL10_COST; btn10.classList.toggle('disabled', !afford); btn10.disabled = !afford; }

  const grid = document.getElementById('gachaCollectionGrid');
  const items = GACHA_ITEMS[gachaCurrentBanner];
  grid.innerHTML = items.map(it => {
    const owned = gacha.owned[gachaCurrentBanner].indexOf(it.id) !== -1;
    const color = GACHA_RARITY_COLORS[it.rarity];
    let actionHtml = '';
    if (owned && gachaCurrentBanner === 'style') {
      const equipped = gacha.equippedSkins[it.plantKey] === it.id;
      actionHtml = '<button class="gacha-equip-btn ' + (equipped ? 'equipped' : '') + '" onclick="gachaEquipSkin(\'' + it.plantKey + '\',\'' + it.id + '\')">' + (equipped ? '✓ ใช้อยู่' : 'ใช้สกินนี้') + '</button>';
    } else if (owned && gachaCurrentBanner === 'engineer') {
      const equipped = gacha.equippedEngineer === it.id;
      actionHtml = '<button class="gacha-equip-btn ' + (equipped ? 'equipped' : '') + '" onclick="gachaEquipEngineer(\'' + it.id + '\')">' + (equipped ? '✓ มอบหมายอยู่' : 'มอบหมาย') + '</button>';
    } else if (owned && gachaCurrentBanner === 'blueprint') {
      actionHtml = '<div class="gacha-owned-tag">ปลดล็อกแล้ว (ใช้อัตโนมัติ)</div>';
    }
    const icon = it.icon || '⚡';
    const sub = gachaCurrentBanner === 'blueprint' ? ('+' + it.statBonusPct + '%') : (gachaCurrentBanner === 'engineer' ? it.desc : GACHA_RARITY_LABELS[it.rarity]);
    return '<div class="gacha-item-card ' + (owned ? '' : 'locked') + '" style="--rarity-color:' + color + '">' +
      '<div class="gacha-item-icon">' + (owned ? icon : '❔') + '</div>' +
      '<div class="gacha-item-name">' + it.name + '</div>' +
      '<div class="gacha-item-sub">' + sub + '</div>' +
      '<div class="gacha-item-rarity">' + GACHA_RARITY_LABELS[it.rarity] + '</div>' +
      actionHtml +
      '</div>';
  }).join('');
}

function gachaShowReveal(results, banner) {
  const overlay = document.getElementById('gachaRevealOverlay');
  const modal = overlay.querySelector('.gacha-reveal-modal');
  const container = document.getElementById('gachaRevealCards');

  let topRarity = 'common';
  results.forEach(r => { if (GACHA_RARITY_RANK[r.rarity] > GACHA_RARITY_RANK[topRarity]) topRarity = r.rarity; });
  modal.classList.remove('tier-common', 'tier-rare', 'tier-epic', 'tier-legendary');
  modal.classList.add('tier-' + topRarity);
  modal.style.setProperty('--flash-color', GACHA_RARITY_COLORS[topRarity]);

  container.innerHTML = results.map(r => {
    const color = GACHA_RARITY_COLORS[r.rarity];
    const icon = r.item.icon || (banner === 'engineer' ? '👷' : (banner === 'blueprint' ? '⚡' : '🎁'));
    return '<div class="gacha-reveal-card" style="--rarity-color:' + color + '">' +
      '<div class="gacha-flip"><div class="gacha-flip-inner">' +
        '<div class="gacha-flip-face gacha-flip-back"><span class="gacha-flip-bolt">⚡</span></div>' +
        '<div class="gacha-flip-face gacha-flip-front">' +
          '<div class="gacha-reveal-icon">' + icon + '</div>' +
          '<div class="gacha-reveal-rarity">' + GACHA_RARITY_LABELS[r.rarity] + '</div>' +
          '<div class="gacha-reveal-name">' + r.item.name + '</div>' +
          (r.isDup ? '<div class="gacha-reveal-dup">ซ้ำ → +เศษ</div>' : '<div class="gacha-reveal-new">ใหม่!</div>') +
        '</div>' +
      '</div></div>' +
    '</div>';
  }).join('');

  overlay.classList.remove('hidden');

  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  container.querySelectorAll('.gacha-reveal-card').forEach((card, i) => {
    if (reduceMotion) card.classList.add('revealed');
    else setTimeout(() => card.classList.add('revealed'), 220 + i * 130);
  });
}
function closeGachaReveal() { document.getElementById('gachaRevealOverlay').classList.add('hidden'); }

function gachaUpdateStartBadge() {
  const el = document.getElementById('gachaStartCrystalVal');
  if (el) el.textContent = gacha.crystals;
}

/* ---------- inject UI into the page (so index.html barely needs edits) ---------- */
function initGachaUI() {
  const startCard = document.querySelector('#startScreen .start-card');
  if (startCard && !document.getElementById('gachaEntryRow')) {
    const row = document.createElement('div');
    row.className = 'start-actions';
    row.id = 'gachaEntryRow';
    row.style.marginTop = '10px';
    row.innerHTML = '<button class="secondary-btn" onclick="openGachaScreen()">⚡ ห้องนิรภัย (<span id="gachaStartCrystalVal">' + gacha.crystals + '</span> 💎)</button>';
    startCard.appendChild(row);
  }

  if (!document.getElementById('gachaScreen')) {
    const bannerDefs = [
      { key: 'style', icon: '🎨', label: 'สกิน' },
      { key: 'blueprint', icon: '⚡', label: 'พิมพ์เขียว' },
      { key: 'engineer', icon: '👷', label: 'วิศวกร' }
    ];
    const tabsHtml = bannerDefs.map((b, i) =>
      '<button class="gacha-banner-tab' + (i === 0 ? ' active' : '') + '" data-banner="' + b.key + '" onclick="switchGachaBanner(\'' + b.key + '\')">' +
        '<span class="gacha-tab-icon">' + b.icon + '</span>' +
        '<span class="gacha-tab-label">' + b.label + '</span>' +
        '<span class="gacha-tab-count">0/0</span>' +
      '</button>'
    ).join('');

    const screen = document.createElement('div');
    screen.id = 'gachaScreen';
    screen.className = 'screen hidden';
    screen.innerHTML =
      '<div class="start-card gacha-card">' +
      '<h1>⚡ ห้องนิรภัยพลังงาน</h1>' +
      '<p class="gacha-subtitle">ปลดปล่อยประจุคริสตัล เพื่อสุ่มรับของรางวัล</p>' +
      '<div class="gacha-hud">' +
        '<div class="gacha-hud-crystal">' +
          '<span class="gacha-crystal-icon">💎</span>' +
          '<span id="gachaCrystalVal">0</span>' +
          '<span class="gacha-hud-label">Volt Crystal</span>' +
        '</div>' +
        '<div class="gacha-hud-pity">' +
          '<div class="gacha-pity-ring" id="gachaPityRing" style="--pity-pct:0">' +
            '<div class="gacha-pity-ring-inner"><span id="gachaPityRingVal">0/' + GACHA_PITY_HARD + '</span></div>' +
          '</div>' +
          '<div class="gacha-hud-pity-text">' +
            '<span id="gachaPityText"></span>' +
            '<span class="gacha-shard-text">เศษสะสม: <b id="gachaShardVal">0</b></span>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div id="gachaBannerTabs">' + tabsHtml + '</div>' +
      '<div class="gacha-pull-row">' +
        '<button class="gacha-pull-btn" id="gachaPullBtn1" onclick="gachaPullOne(gachaCurrentBanner)">สุ่ม 1 ครั้ง<span class="gacha-pull-cost">💎 ' + GACHA_PULL_COST + '</span></button>' +
        '<button class="gacha-pull-btn ten" id="gachaPullBtn10" onclick="gachaPullTen(gachaCurrentBanner)">สุ่ม 10 ครั้ง<span class="gacha-pull-cost">💎 ' + GACHA_PULL10_COST + '</span></button>' +
      '</div>' +
      '<div class="gacha-collection-grid" id="gachaCollectionGrid"></div>' +
      '<button class="secondary-btn" style="margin-top:14px;" onclick="closeGachaScreen()">⬅ กลับ</button>' +
      '</div>';
    document.body.appendChild(screen);
  }

  if (!document.getElementById('gachaRevealOverlay')) {
    const overlay = document.createElement('div');
    overlay.id = 'gachaRevealOverlay';
    overlay.className = 'modal-overlay hidden';
    overlay.onclick = function (e) { if (e.target === overlay) closeGachaReveal(); };
    overlay.innerHTML =
      '<div class="modal-card gacha-reveal-modal">' +
      '<h2 style="color:#ffd166;">✨ ผลการสุ่ม</h2>' +
      '<div class="gacha-reveal-grid" id="gachaRevealCards"></div>' +
      '<button class="primary-btn" style="margin-top:14px;padding:10px 24px;" onclick="closeGachaReveal()">ปิด</button>' +
      '</div>';
    document.body.appendChild(overlay);
  }

  gachaUpdateStartBadge();
}

initGachaUI();
