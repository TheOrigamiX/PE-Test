/* ============================================================
   VoltRush — Gacha CORE (shared by skin.js / blueprint.js / engineer.js)
   ต้องโหลดหลังสคริปต์หลักของ index.html เสมอ เพราะใช้ตัวแปร/ฟังก์ชัน
   ร่วม เช่น PLANT_DEFS, showToast, sndBuy, sndError, sndUpgrade
   ทุกฟังก์ชัน hook เข้าเกมหลักจะเช็ค typeof ก่อนเสมอ (กันเกมพังถ้า
   ไฟล์นี้โหลดไม่สำเร็จ)

   ไฟล์นี้เก็บ "state + ลอจิก" เท่านั้น ไม่มี UI ของหน้าไหนอยู่ในนี้
   หน้ากาชาแต่ละแบบ (สกิน / พิมพ์เขียว / วิศวกร) แยกไฟล์ของตัวเอง
============================================================ */

const GACHA_PULL_COST = 100;
const GACHA_PULL10_COST = 900;
const GACHA_PITY_SOFT = 40;
const GACHA_PITY_HARD = 50;
const GACHA_RARITY_WEIGHTS = { common: 58, rare: 27, epic: 12, legendary: 3 };
const GACHA_RARITY_LABELS = { common: 'ธรรมดา', rare: 'หายาก', epic: 'เอปิก', legendary: 'ตำนาน' };
const GACHA_RARITY_COLORS = { common: '#9fb3d1', rare: '#38b6ff', epic: '#b388ff', legendary: '#ffd166' };
const GACHA_SHARD_GAIN = { common: 2, rare: 5, epic: 10, legendary: 20 };

/* เศษ (shards) จากของซ้ำ แลกคืนเป็น Volt Crystal ได้ทีละล็อต กันเศษค้างเก็บไว้เฉยๆ */
const GACHA_SHARD_EXCHANGE_RATE = 10;   // เศษต่อ 1 ล็อต
const GACHA_SHARD_EXCHANGE_CRYSTALS = 15; // คริสตัลที่ได้ต่อ 1 ล็อต

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

/* ---------- state: เก็บบน Supabase (player_state) ไม่แตะ localStorage ---------- */
function gachaDefaultState() {
  return {
    crystals: 300,
    pity: { style: 0, blueprint: 0, engineer: 0 },
    shards: { style: 0, blueprint: 0, engineer: 0 },
    owned: { style: [], blueprint: [], engineer: [] },
    equippedSkins: {},
    equippedEngineer: null
  };
}
function gachaMergeWithDefault(saved) {
  const def = gachaDefaultState();
  if (!saved) return def;
  return {
    crystals: typeof saved.crystals === 'number' ? saved.crystals : def.crystals,
    pity: Object.assign({}, def.pity, saved.pity || {}),
    shards: Object.assign({}, def.shards, saved.shards || {}),
    owned: Object.assign({}, def.owned, saved.owned || {}),
    equippedSkins: Object.assign({}, def.equippedSkins, saved.equippedSkins || {}),
    equippedEngineer: (saved.equippedEngineer !== undefined) ? saved.equippedEngineer : def.equippedEngineer
  };
}
let gacha = gachaDefaultState();

/* เรียกหลัง login สำเร็จ (จาก login.js) เพื่อดึงข้อมูลผู้เล่นจาก Supabase มาแทนค่า default */
async function gachaLoadFromCloud(userId) {
  if (!(typeof sb === 'object' && sb && sb.auth) || !userId) { gacha = gachaDefaultState(); return; }
  try {
    const { data, error } = await sb.from('player_state').select('gacha').eq('user_id', userId).maybeSingle();
    if (error) throw error;
    if (data && data.gacha) {
      gacha = gachaMergeWithDefault(data.gacha);
    } else {
      gacha = gachaDefaultState();
      const { error: insErr } = await sb.from('player_state').insert({ user_id: userId, gacha: gacha });
      if (insErr) throw insErr;
    }
  } catch (e) { console.error('โหลดข้อมูลผู้เล่นจาก Supabase ล้มเหลว:', e); gacha = gachaDefaultState(); }
}
async function saveGachaState() {
  if (!(typeof sb === 'object' && sb && sb.auth) || !(typeof voltrushCurrentUser === 'object' && voltrushCurrentUser)) {
    console.warn('ยังไม่ได้ login — ข้อมูลผู้เล่นจะไม่ถูกบันทึก');
    return;
  }
  try {
    const { error } = await sb.from('player_state').upsert({ user_id: voltrushCurrentUser.id, gacha: gacha, updated_at: new Date().toISOString() });
    if (error) throw error;
  } catch (e) { console.error('บันทึกข้อมูลผู้เล่นขึ้น Supabase ล้มเหลว:', e); }
}

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
  if (gacha.crystals < GACHA_PULL_COST) { showToast('💸 เพชรไม่พอ ต้องการ ' + GACHA_PULL_COST + ' 💎'); if (typeof sndError === 'function') sndError(); return null; }
  gacha.crystals -= GACHA_PULL_COST;
  const result = gachaRollOnce(banner);
  saveGachaState();
  if (typeof sndBuy === 'function') sndBuy();
  gachaShowReveal([result], banner);
  return result;
}
function gachaPullTen(banner) {
  if (gacha.crystals < GACHA_PULL10_COST) { showToast('💸 เพชรไม่พอ ต้องการ ' + GACHA_PULL10_COST + ' 💎'); if (typeof sndError === 'function') sndError(); return null; }
  gacha.crystals -= GACHA_PULL10_COST;
  const results = [];
  for (let i = 0; i < 10; i++) results.push(gachaRollOnce(banner));
  saveGachaState();
  if (typeof sndUpgrade === 'function') sndUpgrade();
  gachaShowReveal(results, banner);
  return results;
}

/* ---------- แลกเศษ (shard sink) ---------- */
function gachaRedeemShards(banner) {
  const batches = Math.floor(gacha.shards[banner] / GACHA_SHARD_EXCHANGE_RATE);
  if (batches <= 0) {
    showToast('เศษยังไม่พอแลก ต้องการอย่างน้อย ' + GACHA_SHARD_EXCHANGE_RATE + ' ชิ้น');
    if (typeof sndError === 'function') sndError();
    return 0;
  }
  const used = batches * GACHA_SHARD_EXCHANGE_RATE;
  const gained = batches * GACHA_SHARD_EXCHANGE_CRYSTALS;
  gacha.shards[banner] -= used;
  gacha.crystals += gained;
  saveGachaState();
  if (typeof sndBuy === 'function') sndBuy();
  showToast('💎 แลกเศษ ' + used + ' ชิ้น ได้ ' + gained + ' Volt Crystal!');
  return gained;
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

/* ---------- equip actions (shared by skin/engineer pages) ---------- */
function gachaEquipSkin(plantKey, skinId) {
  gacha.equippedSkins[plantKey] = skinId;
  saveGachaState();
  if (typeof renderSkinScreen === 'function') renderSkinScreen();
  showToast('✅ ใส่สกินแล้ว!');
}
function gachaEquipEngineer(id) {
  gacha.equippedEngineer = (gacha.equippedEngineer === id) ? null : id;
  saveGachaState();
  if (typeof renderEngineerScreen === 'function') renderEngineerScreen();
  showToast(gacha.equippedEngineer ? '✅ มอบหมายวิศวกรแล้ว!' : 'ยกเลิกการมอบหมายวิศวกรแล้ว');
}

/* ---------- reveal modal (shared, one instance reused by every page) ---------- */
function gachaShowReveal(results, banner) {
  const overlay = document.getElementById('gachaRevealOverlay');
  const container = document.getElementById('gachaRevealCards');
  container.innerHTML = results.map((r, i) => {
    const color = GACHA_RARITY_COLORS[r.rarity];
    const icon = r.item.icon || (banner === 'engineer' ? '👷' : (banner === 'blueprint' ? '⚡' : '🎁'));
    return '<div class="gacha-reveal-card" style="--rarity-color:' + color + ';animation-delay:' + (i * 0.12) + 's">' +
      '<div class="gacha-reveal-icon">' + icon + '</div>' +
      '<div class="gacha-reveal-rarity">' + GACHA_RARITY_LABELS[r.rarity] + '</div>' +
      '<div class="gacha-reveal-name">' + r.item.name + '</div>' +
      (r.isDup ? '<div class="gacha-reveal-dup">ซ้ำ → +เศษ</div>' : '<div class="gacha-reveal-new">ใหม่!</div>') +
      '</div>';
  }).join('');
  overlay.classList.remove('hidden');
}
function closeGachaReveal() {
  document.getElementById('gachaRevealOverlay').classList.add('hidden');
  /* ปิดหน้าผลสุ่มแล้วรีเฟรชกริดของหน้าปัจจุบัน ถ้ามี */
  if (typeof renderSkinScreen === 'function' && !document.getElementById('skinScreen').classList.contains('hidden')) renderSkinScreen();
  if (typeof renderBlueprintScreen === 'function' && !document.getElementById('blueprintScreen').classList.contains('hidden')) renderBlueprintScreen();
  if (typeof renderEngineerScreen === 'function' && !document.getElementById('engineerScreen').classList.contains('hidden')) renderEngineerScreen();
}

function initGachaRevealOverlay() {
  if (document.getElementById('gachaRevealOverlay')) return;
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
initGachaRevealOverlay();
