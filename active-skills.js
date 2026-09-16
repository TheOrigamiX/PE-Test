/* ============================================================
   VoltRush — Active skills (สกิลกดใช้งานได้) ระหว่างเล่นเกมจริง
   ผูกกับ state.activeSkillEffects / state.skillCooldowns ของเกมหลัก
   แบบ lazy-init (ไม่แก้ state object เดิมใน index.html เลย) เพื่อความ
   ปลอดภัย ถ้าไฟล์นี้โหลดไม่สำเร็จเกมหลักจะไม่พัง (ทุกจุดเช็ค typeof)
============================================================ */

function ensureSkillState() {
  if (typeof state === 'undefined' || !state) return null;
  if (!state.activeSkillEffects) state.activeSkillEffects = [];
  if (!state.skillCooldowns) state.skillCooldowns = { engineer: 0, weapon: 0 };
  return state;
}

/* เรียกจาก updateDemand()/computeSupply() ในเกมหลัก (typeof-guarded) */
function getActiveSkillDemandMult() {
  const s = ensureSkillState(); if (!s) return 1;
  return s.activeSkillEffects.reduce((m, e) => m * e.demandMult, 1);
}
function getActiveSkillSupplyMult() {
  const s = ensureSkillState(); if (!s) return 1;
  return s.activeSkillEffects.reduce((m, e) => m * e.supplyMult, 1);
}

/* เรียกทุกวินาทีจาก gameTick() (typeof-guarded) */
function tickActiveSkills() {
  const s = ensureSkillState(); if (!s) return;
  s.activeSkillEffects = s.activeSkillEffects.filter(e => { e.timeLeft--; return e.timeLeft > 0; });
  ['engineer', 'weapon'].forEach(which => { if (s.skillCooldowns[which] > 0) s.skillCooldowns[which]--; });
  renderSkillHud();
}

function getEquippedSkillUnit(which) {
  if (which === 'engineer') return (typeof gachaEquippedEngineerItem === 'function') ? gachaEquippedEngineerItem() : null;
  return (typeof gachaEquippedWeaponItem === 'function') ? gachaEquippedWeaponItem() : null;
}

function activateSkill(which) {
  const s = ensureSkillState(); if (!s) return;
  const unit = getEquippedSkillUnit(which);
  if (!unit || !unit.activeSkill) { showToast('ยังไม่ได้ติดตั้ง' + (which === 'engineer' ? 'วิศวกร' : 'อาวุธ') + 'ที่มีสกิลนี้'); return; }
  if (s.skillCooldowns[which] > 0) { showToast('สกิลกำลังคูลดาวน์อีก ' + s.skillCooldowns[which] + ' วิ'); return; }
  const skill = unit.activeSkill;
  const level = unit.level || 1;
  const durationSec = Math.round(skill.durationSec * (1 + (level - 1) * 0.05));
  s.activeSkillEffects.push({ source: which, timeLeft: durationSec, demandMult: skill.demandMult, supplyMult: skill.supplyMult });
  s.skillCooldowns[which] = skill.cooldownSec;
  if (typeof sndUpgrade === 'function') sndUpgrade();
  showToast('⚡ ใช้สกิล "' + skill.name + '" แล้ว! (' + skill.desc + ')');
  renderSkillHud();
}

/* ---------- HUD: ปุ่มสกิลลอยในหน้าเกม ---------- */
function buildSkillHud() {
  if (document.getElementById('activeSkillHud')) return;
  const gameScreen = document.getElementById('gameScreen');
  if (!gameScreen) return;
  const hud = document.createElement('div');
  hud.id = 'activeSkillHud';
  hud.innerHTML =
    '<button class="skill-hud-btn" id="skillBtnEngineer" onclick="activateSkill(\'engineer\')">' +
      '<span class="skill-hud-icon">👷</span><span class="skill-hud-label">-</span><span class="skill-hud-cd" id="skillCdEngineer"></span>' +
    '</button>' +
    '<button class="skill-hud-btn" id="skillBtnWeapon" onclick="activateSkill(\'weapon\')">' +
      '<span class="skill-hud-icon">🔧</span><span class="skill-hud-label">-</span><span class="skill-hud-cd" id="skillCdWeapon"></span>' +
    '</button>';
  gameScreen.appendChild(hud);
}
function renderSkillHud() {
  buildSkillHud();
  const hud = document.getElementById('activeSkillHud');
  if (!hud) return;
  const s = ensureSkillState();
  ['engineer', 'weapon'].forEach(which => {
    const cap = which === 'engineer' ? 'Engineer' : 'Weapon';
    const unit = getEquippedSkillUnit(which);
    const btn = document.getElementById('skillBtn' + cap);
    const label = btn.querySelector('.skill-hud-label');
    const cdEl = document.getElementById('skillCd' + cap);
    if (!unit || !unit.activeSkill) { btn.style.display = 'none'; return; }
    btn.style.display = '';
    label.textContent = unit.activeSkill.name;
    const cd = s ? s.skillCooldowns[which] : 0;
    if (cd > 0) { btn.disabled = true; btn.classList.add('on-cooldown'); cdEl.textContent = cd + 's'; }
    else { btn.disabled = false; btn.classList.remove('on-cooldown'); cdEl.textContent = 'พร้อมใช้'; }
  });
}
