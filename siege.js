/* ============================================================
   VoltRush — โหมดบุกเมือง (Siege Mode): โหมดใหม่แยกจากคลาสสิกเดิม
   เล่นไปเรื่อยๆ ยากขึ้นทุก wave จนกว่าเมืองจะพัง (endless)
   มอนสเตอร์/มินิบอส/บอส(คน) มีหลอดเลือด+ไอคอนใหญ่ของตัวเอง
   ไม่แตะ state/ฟังก์ชันของโหมดคลาสสิกเลย — จำลองเศรษฐกิจแยกเป็นของตัวเอง
============================================================ */

const SIEGE_PLANTS = [
  { key: 'coal', icon: '🏭', name: 'ถ่านหิน', cost: 0, output: 12 },
  { key: 'solar', icon: '☀️', name: 'โซลาร์เซลล์', cost: 40, output: 10 },
  { key: 'wind', icon: '💨', name: 'กังหันลม', cost: 60, output: 12 },
  { key: 'hydro', icon: '🌊', name: 'พลังน้ำ', cost: 100, output: 16 },
  { key: 'geothermal', icon: '🌋', name: 'ความร้อนใต้พิภพ', cost: 140, output: 18 },
  { key: 'nuclear', icon: '☢️', name: 'นิวเคลียร์', cost: 220, output: 30 }
];
const SIEGE_MONSTERS = [
  { icon: '👻', name: 'ปีศาจดูดไฟ', baseHp: 40, baseDmg: 8, atkInterval: 6 },
  { icon: '🦴', name: 'โครงกระดูกช็อต', baseHp: 55, baseDmg: 10, atkInterval: 5 },
  { icon: '🐛', name: 'หนอนกัดสายไฟ', baseHp: 35, baseDmg: 6, atkInterval: 4 },
  { icon: '🕷️', name: 'แมงมุมไฟฟ้าสถิต', baseHp: 65, baseDmg: 12, atkInterval: 5 }
];
const SIEGE_MINIBOSSES = [
  { icon: '👹', name: 'ยักษ์ไฟดับ', baseHp: 180, baseDmg: 20, atkInterval: 7, kind: 'mini' },
  { icon: '🐉', name: 'มังกรโอเวอร์โหลด', baseHp: 220, baseDmg: 24, atkInterval: 6, kind: 'mini' }
];
const SIEGE_BOSSES = [
  { icon: '🧑‍💼', name: 'ผู้บริหารทรยศ', baseHp: 400, baseDmg: 30, atkInterval: 8, kind: 'boss', phases: 2 },
  { icon: '🕵️', name: 'สายลับบริษัทคู่แข่ง', baseHp: 450, baseDmg: 34, atkInterval: 7, kind: 'boss', phases: 2 }
];

let siege = null;
let siegeIntervalId = null;

function siegeMonsterForWave(wave) {
  let pool = SIEGE_MONSTERS, kind = null;
  if (wave % 10 === 0) { pool = SIEGE_BOSSES; kind = 'boss'; }
  else if (wave % 5 === 0) { pool = SIEGE_MINIBOSSES; kind = 'mini'; }
  const base = pool[Math.floor(Math.random() * pool.length)];
  const scale = 1 + (wave - 1) * 0.12;
  const interval = Math.max(2.5, base.atkInterval - Math.floor(wave / 8) * 0.3);
  return {
    name: base.name, icon: base.icon,
    hpMax: Math.round(base.baseHp * scale), hp: Math.round(base.baseHp * scale),
    dmg: Math.round(base.baseDmg * scale),
    atkInterval: interval, atkTimer: interval,
    kind: kind, phase: 1, phases: base.phases || 1
  };
}

function siegeNewState() {
  const owned = { coal: true };
  const on = { coal: true };
  return {
    wave: 1, cityHp: 100, cityHpMax: 100, coins: 100,
    owned: owned, on: on,
    monster: siegeMonsterForWave(1),
    activeSkillEffects: [], skillCooldowns: { engineer: 0, weapon: 0 },
    running: true
  };
}

function siegeSupply() {
  let s = 0;
  SIEGE_PLANTS.forEach(p => { if (siege.owned[p.key] && siege.on[p.key]) s += p.output; });
  const mult = siege.activeSkillEffects.reduce((m, e) => m * e.supplyMult, 1);
  return Math.round(s * mult);
}
function siegeDemand() {
  const base = 18 + siege.wave * 3;
  const mult = siege.activeSkillEffects.reduce((m, e) => m * e.demandMult, 1);
  return Math.round(base * mult);
}

function siegeBuyPlant(key) {
  if (siege.owned[key]) { siege.on[key] = !siege.on[key]; renderSiegeScreen(); return; }
  const def = SIEGE_PLANTS.find(p => p.key === key);
  if (siege.coins < def.cost) { showToast('เหรียญไม่พอ ต้องการ 🪙' + def.cost); return; }
  siege.coins -= def.cost;
  siege.owned[key] = true;
  siege.on[key] = true;
  renderSiegeScreen();
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

  siege.monster.atkTimer -= 1;
  if (siege.monster.atkTimer <= 0) {
    const supply = siegeSupply(), demand = siegeDemand();
    if (supply >= demand) {
      const dmg = Math.max(3, supply - demand);
      siege.monster.hp -= dmg;
      showToast('⚔️ โต้กลับ! ' + siege.monster.name + ' โดน ' + dmg + ' ดาเมจ');
    } else {
      siege.cityHp -= siege.monster.dmg;
      showToast('💥 ' + siege.monster.name + ' โจมตีเมือง! -' + siege.monster.dmg + ' HP');
    }
    siege.monster.atkTimer = siege.monster.atkInterval;
  }

  if (siege.monster.hp <= 0) {
    if (siege.monster.phase < siege.monster.phases) {
      siege.monster.phase++;
      siege.monster.hp = siege.monster.hpMax;
      siege.monster.dmg = Math.round(siege.monster.dmg * 1.3);
      showToast('🔥 เข้าเฟส ' + siege.monster.phase + ' ของ ' + siege.monster.name + '!');
    } else {
      siege.coins += 30 + siege.wave * 5;
      siege.wave++;
      siege.monster = siegeMonsterForWave(siege.wave);
      showToast('✅ ชนะ! เข้าสู่ Wave ' + siege.wave);
    }
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
    const box = document.getElementById('endRewardsBox');
    const list = document.getElementById('siegeRewardsList');
    /* ใช้กล่องสรุปแบบเดียวกับโหมดคลาสสิก แต่ inject ผลลงช่องของ siege เอง */
    renderEndRewards(snapshot);
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
      '<p class="gacha-hint">เล่นไปเรื่อยๆ ยากขึ้นทุก Wave — ผลิตไฟให้พอ (หรือเกิน) ความต้องการตอนมอนสเตอร์โจมตี เพื่อโต้กลับใส่มัน ถ้าเมือง HP หมด = จบเกม ทุก Wave ที่ 5 เจอมินิบอส ทุก Wave ที่ 10 เจอบอส (คน) หลายเฟส</p>' +
      '<button class="primary-btn" onclick="siegeStart()">🚀 เริ่มบุกเมือง</button>' +
    '</div>' +

    '<div id="siegePlayArea" class="hidden">' +
      '<div class="siege-top-row">' +
        '<div class="siege-wave-badge">Wave <span id="siegeWaveVal">1</span></div>' +
        '<div class="siege-hp-bar-wrap"><div class="siege-hp-label">เมือง HP</div><div class="siege-hp-bar"><div class="siege-hp-fill" id="siegeCityHpFill"></div></div></div>' +
        '<div class="siege-coin-badge">🪙 <span id="siegeCoinVal">0</span></div>' +
      '</div>' +

      '<div class="siege-monster-card" id="siegeMonsterCard">' +
        '<div class="siege-monster-icon" id="siegeMonsterIcon">👻</div>' +
        '<div class="siege-monster-name" id="siegeMonsterName"></div>' +
        '<div class="siege-hp-bar monster"><div class="siege-hp-fill monster" id="siegeMonsterHpFill"></div></div>' +
        '<div class="siege-monster-sub" id="siegeMonsterSub"></div>' +
        '<div class="siege-atk-timer" id="siegeAtkTimer"></div>' +
      '</div>' +

      '<div class="siege-supply-row" id="siegeSupplyRow"></div>' +

      '<div class="siege-plant-grid" id="siegePlantGrid"></div>' +

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

function renderSiegeScreen() {
  if (!siege) return;
  document.getElementById('siegeWaveVal').textContent = siege.wave;
  document.getElementById('siegeCoinVal').textContent = siege.coins;
  document.getElementById('siegeCityHpFill').style.width = Math.max(0, (siege.cityHp / siege.cityHpMax) * 100) + '%';

  const m = siege.monster;
  document.getElementById('siegeMonsterIcon').textContent = m.icon;
  document.getElementById('siegeMonsterName').textContent = m.name + (m.kind === 'boss' ? ' (บอส เฟส ' + m.phase + '/' + m.phases + ')' : m.kind === 'mini' ? ' (มินิบอส)' : '');
  document.getElementById('siegeMonsterHpFill').style.width = Math.max(0, (m.hp / m.hpMax) * 100) + '%';
  document.getElementById('siegeMonsterSub').textContent = 'HP ' + Math.max(0, m.hp) + ' / ' + m.hpMax;
  document.getElementById('siegeAtkTimer').textContent = '⏱ โจมตีในอีก ' + Math.max(0, Math.ceil(m.atkTimer)) + ' วิ (ดาเมจ ' + m.dmg + ')';
  document.getElementById('siegeMonsterCard').className = 'siege-monster-card' + (m.kind ? ' ' + m.kind : '');

  const supply = siegeSupply(), demand = siegeDemand();
  document.getElementById('siegeSupplyRow').innerHTML =
    '<span class="' + (supply >= demand ? 'ok' : 'bad') + '">⚡ ผลิต ' + supply + '</span> / <span>ต้องการ ' + demand + '</span>';

  document.getElementById('siegePlantGrid').innerHTML = SIEGE_PLANTS.map(p => {
    const owned = !!siege.owned[p.key];
    const on = owned && siege.on[p.key];
    return '<button class="siege-plant-btn ' + (on ? 'on' : '') + '" onclick="siegeBuyPlant(\'' + p.key + '\')">' +
      '<div>' + p.icon + '</div><div class="siege-plant-name">' + p.name + '</div>' +
      '<div class="siege-plant-sub">' + (owned ? ('+' + p.output + ' • ' + (on ? 'เปิดอยู่' : 'ปิดอยู่')) : ('🪙' + p.cost)) + '</div>' +
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
