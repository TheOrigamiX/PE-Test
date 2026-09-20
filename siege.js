/* ============================================================
   VoltRush — โหมดบุกเมือง (Siege Mode)
   ระบบใหม่: สุ่มโรงงานลงตาราง merge (แตะเลือก-แตะเป้าหมายเพื่อรวม/ย้าย
   แทนการลากเมาส์จริง เพื่อให้กดได้ทั้งจอสัมผัส/เมาส์เหมือนกัน)
   เจอของซ้ำชนิด+เลเวลเดียวกัน → รวมเป็นเลเวลถัดไป (เพดาน Lv.10)
   Wave ปกติสุ่มมอนหลายตัวพร้อมกัน ต้องเคลียร์หมดถึงขึ้น wave ถัดไป
   มินิบอส/บอส (ทุก wave ที่ 5/10) เป็นตัวเดี่ยวแต่แรงกว่ามาก
   ไม่แตะ state/ฟังก์ชันของโหมดคลาสสิกเลย
============================================================ */

const SIEGE_GRID_SIZE = 16; /* ตาราง 4x4 */
const SIEGE_MAX_TILE_LEVEL = 10;
const SIEGE_ROLL_COST = 30;
const SIEGE_PLANTS = [
  { key: 'coal', icon: '🏭', name: 'ถ่านหิน', output: 6, rarity: 'common' },
  { key: 'solar', icon: '☀️', name: 'โซลาร์เซลล์', output: 7, rarity: 'common' },
  { key: 'wind', icon: '💨', name: 'กังหันลม', output: 9, rarity: 'rare' },
  { key: 'hydro', icon: '🌊', name: 'พลังน้ำ', output: 11, rarity: 'rare' },
  { key: 'geothermal', icon: '🌋', name: 'ความร้อนใต้พิภพ', output: 15, rarity: 'epic' },
  { key: 'nuclear', icon: '☢️', name: 'นิวเคลียร์', output: 22, rarity: 'legendary' }
];
const SIEGE_RARITY_BASE_WEIGHTS = { common: 60, rare: 25, epic: 12, legendary: 3 };
const SIEGE_RARITY_COLORS = { common: '#9fb3d1', rare: '#38b6ff', epic: '#b388ff', legendary: '#ffd166' };

const SIEGE_MONSTERS = [
  { icon: '👻', name: 'ปีศาจดูดไฟ', baseHp: 40, baseDmg: 8, atkInterval: 6 },
  { icon: '🦴', name: 'โครงกระดูกช็อต', baseHp: 55, baseDmg: 10, atkInterval: 5 },
  { icon: '🐛', name: 'หนอนกัดสายไฟ', baseHp: 35, baseDmg: 6, atkInterval: 4 },
  { icon: '🕷️', name: 'แมงมุมไฟฟ้าสถิต', baseHp: 65, baseDmg: 12, atkInterval: 5 }
];
const SIEGE_MINIBOSSES = [
  { icon: '👹', name: 'ยักษ์ไฟดับ', baseHp: 220, baseDmg: 20, atkInterval: 7, kind: 'mini' },
  { icon: '🐉', name: 'มังกรโอเวอร์โหลด', baseHp: 260, baseDmg: 24, atkInterval: 6, kind: 'mini' }
];
const SIEGE_BOSSES = [
  { icon: '🧑‍💼', name: 'ผู้บริหารทรยศ', baseHp: 450, baseDmg: 30, atkInterval: 8, kind: 'boss', phases: 2 },
  { icon: '🕵️', name: 'สายลับบริษัทคู่แข่ง', baseHp: 500, baseDmg: 34, atkInterval: 7, kind: 'boss', phases: 2 }
];

let siege = null;
let siegeIntervalId = null;

function siegePlantDef(key) { return SIEGE_PLANTS.find(p => p.key === key); }

/* ---------- สุ่ม+รวมโรงงาน ---------- */
function siegeRollWeights() {
  const bonus = Math.min(45, siege.totalMerges * 2.5);
  return {
    common: Math.max(10, SIEGE_RARITY_BASE_WEIGHTS.common - bonus * 0.7),
    rare: SIEGE_RARITY_BASE_WEIGHTS.rare,
    epic: SIEGE_RARITY_BASE_WEIGHTS.epic + bonus * 0.35,
    legendary: SIEGE_RARITY_BASE_WEIGHTS.legendary + bonus * 0.35
  };
}
function siegeRollPlantKey() {
  const weights = siegeRollWeights();
  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  const order = ['legendary', 'epic', 'rare', 'common'];
  for (let i = 0; i < order.length; i++) {
    const rarity = order[i];
    if (r < weights[rarity]) {
      const options = SIEGE_PLANTS.filter(p => p.rarity === rarity);
      return options[Math.floor(Math.random() * options.length)].key;
    }
    r -= weights[rarity];
  }
  return 'coal';
}
function siegeRollTile() {
  const emptyIdx = siege.grid.findIndex(c => c === null);
  if (emptyIdx === -1) { showToast('ช่องเต็ม! รวมโรงงานให้มีที่ว่างก่อนถึงจะสุ่มต่อได้'); return; }
  if (siege.coins < SIEGE_ROLL_COST) { showToast('เหรียญไม่พอ ต้องการ 🪙' + SIEGE_ROLL_COST); return; }
  siege.coins -= SIEGE_ROLL_COST;
  siege.grid[emptyIdx] = { key: siegeRollPlantKey(), level: 1 };
  renderSiegeScreen();
}
/* แตะเลือกช่อง แล้วแตะช่องเป้าหมาย: ว่าง=ย้าย, ตรงกัน(ชนิด+เลเวลเดียวกัน)=รวม, ไม่ตรงกัน=สลับที่ */
function siegeTapCell(idx) {
  if (siege.selectedCell === null) {
    if (siege.grid[idx]) siege.selectedCell = idx;
    renderSiegeScreen();
    return;
  }
  if (siege.selectedCell === idx) { siege.selectedCell = null; renderSiegeScreen(); return; }
  const a = siege.grid[siege.selectedCell], b = siege.grid[idx];
  if (!a) { siege.selectedCell = null; renderSiegeScreen(); return; }
  if (!b) {
    siege.grid[idx] = a; siege.grid[siege.selectedCell] = null;
  } else if (a.key === b.key && a.level === b.level && a.level < SIEGE_MAX_TILE_LEVEL) {
    siege.grid[idx] = { key: a.key, level: a.level + 1 };
    siege.grid[siege.selectedCell] = null;
    siege.totalMerges++;
    showToast('🔗 รวมสำเร็จ! ' + siegePlantDef(a.key).name + ' Lv.' + (a.level + 1));
  } else {
    siege.grid[idx] = a; siege.grid[siege.selectedCell] = b;
  }
  siege.selectedCell = null;
  renderSiegeScreen();
}

function siegeSupply() {
  let s = 0;
  siege.grid.forEach(cell => { if (cell) s += siegePlantDef(cell.key).output * cell.level; });
  const mult = siege.activeSkillEffects.reduce((m, e) => m * e.supplyMult, 1);
  return Math.round(s * mult);
}
function siegeDemand() {
  const aliveCount = siege.monsters.filter(m => m.hp > 0).length || 1;
  const base = (18 + siege.wave * 3) * Math.pow(aliveCount, 0.6);
  const mult = siege.activeSkillEffects.reduce((m, e) => m * e.demandMult, 1);
  return Math.round(base * mult);
}

/* ---------- มอนสเตอร์: หลายตัวต่อ wave ปกติ, มินิบอส/บอสเดี่ยวแต่แรงกว่ามาก ---------- */
function siegeScaledMonster(base, wave, extraScale) {
  const scale = (1 + (wave - 1) * 0.12) * (extraScale || 1);
  const interval = Math.max(2.5, base.atkInterval - Math.floor(wave / 8) * 0.3);
  return {
    name: base.name, icon: base.icon,
    hpMax: Math.round(base.baseHp * scale), hp: Math.round(base.baseHp * scale),
    dmg: Math.round(base.baseDmg * scale),
    atkInterval: interval, atkTimer: interval,
    kind: base.kind || null, phase: 1, phases: base.phases || 1
  };
}
function siegeMonstersForWave(wave) {
  if (wave % 10 === 0) {
    const base = SIEGE_BOSSES[Math.floor(Math.random() * SIEGE_BOSSES.length)];
    return [siegeScaledMonster(base, wave)];
  }
  if (wave % 5 === 0) {
    const base = SIEGE_MINIBOSSES[Math.floor(Math.random() * SIEGE_MINIBOSSES.length)];
    return [siegeScaledMonster(base, wave)];
  }
  const count = Math.min(4, 1 + Math.floor((wave - 1) / 3));
  const list = [];
  for (let i = 0; i < count; i++) {
    const base = SIEGE_MONSTERS[Math.floor(Math.random() * SIEGE_MONSTERS.length)];
    list.push(siegeScaledMonster(base, wave, 0.85)); /* หลายตัวพร้อมกัน เลยลดสเกลตัวละนิดกันโหดเกิน */
  }
  return list;
}

function siegeNewState() {
  return {
    wave: 1, cityHp: 100, cityHpMax: 100, coins: 150,
    grid: new Array(SIEGE_GRID_SIZE).fill(null),
    selectedCell: null, totalMerges: 0,
    monsters: siegeMonstersForWave(1),
    activeSkillEffects: [], skillCooldowns: { engineer: 0, weapon: 0 },
    running: true
  };
}

/* ---------- สกิลกดใช้ระหว่างบุกเมือง (แยกจาก active-skills.js ของโหมดคลาสสิกโดยสิ้นเชิง) ---------- */
function siegeActivateSkill(which) {
  const unit = which === 'engineer' ? gachaEquippedEngineerItem() : gachaEquippedWeaponItem();
  if (!unit || !unit.activeSkill) { showToast('ยังไม่ได้ติดตั้ง' + (which === 'engineer' ? 'วิศวกร' : 'อาวุธ') + 'ที่มีสกิลนี้'); return; }
  if (siege.skillCooldowns[which] > 0) { showToast('สกิลกำลังคูลดาวน์อีก ' + siege.skillCooldowns[which] + ' วิ'); return; }
  const skill = unit.activeSkill;
  siege.activeSkillEffects.push({ timeLeft: skill.durationSec, demandMult: skill.demandMult, supplyMult: skill.supplyMult });
  siege.skillCooldowns[which] = skill.cooldownSec;
  if (typeof sndUpgrade === 'function') sndUpgrade();
  showToast('⚡ ใช้สกิล "' + skill.name + '"!');
  renderSiegeScreen();
}

function siegeTick() {
  if (!siege || !siege.running) return;
  siege.activeSkillEffects = siege.activeSkillEffects.filter(e => { e.timeLeft--; return e.timeLeft > 0; });
  ['engineer', 'weapon'].forEach(w => { if (siege.skillCooldowns[w] > 0) siege.skillCooldowns[w]--; });

  const supply = siegeSupply(), demand = siegeDemand();
  siege.monsters.forEach(m => {
    if (m.hp <= 0) return;
    m.atkTimer -= 1;
    if (m.atkTimer <= 0) {
      if (supply >= demand) {
        const dmg = Math.max(3, supply - demand);
        m.hp -= dmg;
        showToast('⚔️ โต้กลับ! ' + m.name + ' โดน ' + dmg + ' ดาเมจ');
      } else {
        siege.cityHp -= m.dmg;
        showToast('💥 ' + m.name + ' โจมตีเมือง! -' + m.dmg + ' HP');
      }
      m.atkTimer = m.atkInterval;
    }
  });

  siege.monsters.forEach(m => {
    if (m.hp <= 0 && m.phase < m.phases) {
      m.phase++;
      m.hp = m.hpMax;
      m.dmg = Math.round(m.dmg * 1.3);
      showToast('🔥 เข้าเฟส ' + m.phase + ' ของ ' + m.name + '!');
    }
  });

  if (siege.monsters.every(m => m.hp <= 0)) {
    siege.coins += 30 + siege.wave * 5;
    siege.wave++;
    siege.monsters = siegeMonstersForWave(siege.wave);
    showToast('✅ เคลียร์ wave สำเร็จ! เข้าสู่ Wave ' + siege.wave);
  }

  if (siege.cityHp <= 0) { siege.cityHp = 0; siege.running = false; siegeGameOver(); }
  renderSiegeScreen();
}

function siegeGameOver() {
  clearInterval(siegeIntervalId);
  const finalScore = siege.wave * 80;
  const snapshot = (typeof captureGachaSnapshot === 'function') ? captureGachaSnapshot() : null;
  if (typeof gachaAwardCrystals === 'function') gachaAwardCrystals(finalScore);
  if (typeof gachaAwardPartsDrop === 'function') gachaAwardPartsDrop(finalScore);
  if (typeof gachaAwardGearDrop === 'function') gachaAwardGearDrop(finalScore);
  if (typeof gachaAwardMaterialsFromGame === 'function') gachaAwardMaterialsFromGame(finalScore);
  if (typeof gachaAwardPlayerExpFromGame === 'function') gachaAwardPlayerExpFromGame(finalScore);

  document.getElementById('siegePlayArea').classList.add('hidden');
  const over = document.getElementById('siegeGameOver');
  over.classList.remove('hidden');
  document.getElementById('siegeWaveReached').textContent = siege.wave;
  if (typeof renderEndRewards === 'function') {
    renderEndRewards(snapshot);
    const box = document.getElementById('endRewardsBox');
    const list = document.getElementById('siegeRewardsList');
    if (box && list && !box.classList.contains('hidden')) {
      list.innerHTML = document.getElementById('endRewardsList').innerHTML;
      box.classList.add('hidden');
    }
  }
}

function siegeStart() {
  siege = siegeNewState();
  document.getElementById('siegeGameOver').classList.add('hidden');
  document.getElementById('siegeIntro').classList.add('hidden');
  document.getElementById('siegePlayArea').classList.remove('hidden');
  renderSiegeScreen();
  clearInterval(siegeIntervalId);
  siegeIntervalId = setInterval(siegeTick, 1000);
}
function siegeQuit() {
  clearInterval(siegeIntervalId);
  siege = null;
  closeSiegeScreen();
}

function buildSiegeScreenUI() {
  if (document.getElementById('siegeScreen')) return;
  const screen = document.createElement('div');
  screen.id = 'siegeScreen';
  screen.className = 'screen hidden';
  screen.innerHTML =
    '<div class="start-card gacha-page-card siege-card">' +
    '<div class="gacha-page-topbar">' +
      '<button class="secondary-btn" onclick="siegeQuit()">⬅ กลับล็อบบี้</button>' +
      '<h1 style="margin:0;font-size:1.2rem;">🐲 โหมดบุกเมือง</h1>' +
      '<span style="width:1px;"></span>' +
    '</div>' +

    '<div id="siegeIntro">' +
      '<p class="gacha-hint">สุ่มโรงงานลงตาราง แตะ 2 ชิ้นที่ชนิด+เลเวลตรงกันเพื่อรวมเป็นเลเวลสูงขึ้น (สูงสุด Lv.' + SIEGE_MAX_TILE_LEVEL + ') ผลิตไฟให้พอตอนมอนสเตอร์จะโจมตีเพื่อโต้กลับ เมือง HP หมด = จบเกม ทุก Wave ที่ 5/10 เจอมินิบอส/บอส(คน) ตัวเดียวแต่แรงกว่ามาก</p>' +
      '<button class="primary-btn" onclick="siegeStart()">🚀 เริ่มบุกเมือง</button>' +
    '</div>' +

    '<div id="siegePlayArea" class="hidden">' +
      '<div class="siege-top-row">' +
        '<div class="siege-wave-badge">Wave <span id="siegeWaveVal">1</span></div>' +
        '<div class="siege-hp-bar-wrap"><div class="siege-hp-label">เมือง HP</div><div class="siege-hp-bar"><div class="siege-hp-fill" id="siegeCityHpFill"></div></div></div>' +
        '<div class="siege-coin-badge">🪙 <span id="siegeCoinVal">0</span></div>' +
      '</div>' +

      '<div class="siege-monsters-row" id="siegeMonstersRow"></div>' +
      '<div class="siege-supply-row" id="siegeSupplyRow"></div>' +

      '<div class="siege-grid-section">' +
        '<div class="siege-grid" id="siegeGrid"></div>' +
        '<button class="primary-btn siege-roll-btn" onclick="siegeRollTile()">🎲 สุ่มโรงงาน (🪙' + SIEGE_ROLL_COST + ')</button>' +
      '</div>' +

      '<div class="siege-skill-row">' +
        '<button class="char-action-btn" id="siegeSkillEngBtn" onclick="siegeActivateSkill(\'engineer\')">👷 สกิลวิศวกร</button>' +
        '<button class="char-action-btn" id="siegeSkillWpnBtn" onclick="siegeActivateSkill(\'weapon\')">🔧 สกิลอาวุธ</button>' +
      '</div>' +
    '</div>' +

    '<div id="siegeGameOver" class="hidden">' +
      '<div class="siege-gameover-title">💀 เมืองแตกแล้ว!</div>' +
      '<div class="siege-gameover-wave">ไปถึง Wave <span id="siegeWaveReached">1</span></div>' +
      '<div class="end-rewards-box" id="siegeRewardsBox"><div class="end-rewards-title">🎁 ได้รับ</div><div class="end-rewards-list" id="siegeRewardsList"></div></div>' +
      '<button class="primary-btn" onclick="siegeStart()">🔁 เล่นอีกครั้ง</button>' +
      '<button class="secondary-btn" onclick="siegeQuit()">กลับล็อบบี้</button>' +
    '</div>' +
    '</div>';
  document.body.appendChild(screen);
}

function siegeMonsterCardHtml(m) {
  const kindClass = m.kind ? ' ' + m.kind : '';
  const nameSuffix = m.kind === 'boss' ? ' (บอส เฟส ' + m.phase + '/' + m.phases + ')' : m.kind === 'mini' ? ' (มินิบอส)' : '';
  const dead = m.hp <= 0;
  return '<div class="siege-monster-card' + kindClass + (dead ? ' dead' : '') + '">' +
    '<div class="siege-monster-icon">' + m.icon + '</div>' +
    '<div class="siege-monster-name">' + m.name + nameSuffix + '</div>' +
    '<div class="siege-hp-bar monster"><div class="siege-hp-fill monster" style="width:' + Math.max(0, (m.hp / m.hpMax) * 100) + '%"></div></div>' +
    '<div class="siege-monster-sub">HP ' + Math.max(0, m.hp) + ' / ' + m.hpMax + '</div>' +
    (dead ? '<div class="siege-atk-timer">💀 พ่ายแพ้แล้ว</div>' : '<div class="siege-atk-timer">⏱ โจมตีในอีก ' + Math.max(0, Math.ceil(m.atkTimer)) + ' วิ (ดาเมจ ' + m.dmg + ')</div>') +
    '</div>';
}

function renderSiegeScreen() {
  if (!siege) return;
  document.getElementById('siegeWaveVal').textContent = siege.wave;
  document.getElementById('siegeCoinVal').textContent = siege.coins;
  document.getElementById('siegeCityHpFill').style.width = Math.max(0, (siege.cityHp / siege.cityHpMax) * 100) + '%';

  document.getElementById('siegeMonstersRow').innerHTML = siege.monsters.map(siegeMonsterCardHtml).join('');

  const supply = siegeSupply(), demand = siegeDemand();
  document.getElementById('siegeSupplyRow').innerHTML =
    '<span class="' + (supply >= demand ? 'ok' : 'bad') + '">⚡ ผลิต ' + supply + '</span> / <span>ต้องการ ' + demand + '</span>';

  document.getElementById('siegeGrid').innerHTML = siege.grid.map((cell, idx) => {
    const selected = siege.selectedCell === idx;
    if (!cell) return '<button class="siege-cell empty ' + (selected ? 'selected' : '') + '" onclick="siegeTapCell(' + idx + ')"></button>';
    const def = siegePlantDef(cell.key);
    const color = SIEGE_RARITY_COLORS[def.rarity];
    return '<button class="siege-cell ' + (selected ? 'selected' : '') + '" style="--rarity-color:' + color + '" onclick="siegeTapCell(' + idx + ')">' +
      '<div class="siege-cell-icon">' + def.icon + '</div><div class="siege-cell-lv">Lv.' + cell.level + '</div>' +
      '</button>';
  }).join('');

  const engUnit = gachaEquippedEngineerItem(), wpnUnit = gachaEquippedWeaponItem();
  const engBtn = document.getElementById('siegeSkillEngBtn'), wpnBtn = document.getElementById('siegeSkillWpnBtn');
  engBtn.style.display = engUnit && engUnit.activeSkill ? '' : 'none';
  wpnBtn.style.display = wpnUnit && wpnUnit.activeSkill ? '' : 'none';
  if (engUnit && engUnit.activeSkill) { engBtn.disabled = siege.skillCooldowns.engineer > 0; engBtn.textContent = '👷 ' + engUnit.activeSkill.name + (siege.skillCooldowns.engineer > 0 ? ' (' + siege.skillCooldowns.engineer + 's)' : ''); }
  if (wpnUnit && wpnUnit.activeSkill) { wpnBtn.disabled = siege.skillCooldowns.weapon > 0; wpnBtn.textContent = '🔧 ' + wpnUnit.activeSkill.name + (siege.skillCooldowns.weapon > 0 ? ' (' + siege.skillCooldowns.weapon + 's)' : ''); }
}

function showSiegeScreen() {
  buildSiegeScreenUI();
  hideVoltrushHubScreens();
  document.getElementById('siegeIntro').classList.remove('hidden');
  document.getElementById('siegePlayArea').classList.add('hidden');
  document.getElementById('siegeGameOver').classList.add('hidden');
  document.getElementById('siegeScreen').classList.remove('hidden');
}
function closeSiegeScreen() {
  document.getElementById('siegeScreen').classList.add('hidden');
  showLobbyScreen();
}

buildSiegeScreenUI();
