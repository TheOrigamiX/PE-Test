/* ============================================================
   VoltRush — Character detail / profile screen
   อาวุธ/ของสวมใส่ จัดการที่นี่ทั้งหมดแล้ว (ไม่มีหน้าแยกอีกต่อไป)
   เลือกของแบบการ์ดเห็นรายละเอียดเต็ม ไม่ใช่ dropdown
============================================================ */

const CHAR_DETAIL_TABS = [
  { key: 'skill', icon: '⚡', label: 'สกิล' },
  { key: 'level', icon: '⬆️', label: 'เลเวล' },
  { key: 'weapon', icon: '🔧', label: 'อาวุธ' },
  { key: 'gear', icon: '🎒', label: 'ของสวมใส่' }
];
let charDetailCurrentId = null;
let charDetailTab = 'skill';
let charDetailGearActiveSlot = null;

function buildCharacterDetailUI() {
  if (document.getElementById('characterDetailScreen')) return;
  const screen = document.createElement('div');
  screen.id = 'characterDetailScreen';
  screen.className = 'screen hidden char-detail-screen';
  screen.innerHTML =
    '<button class="char-back-btn" onclick="closeCharacterDetail()">⬅</button>' +
    '<div class="char-switch-row" id="charSwitchRow"></div>' +
    '<div class="char-detail-layout">' +
      '<div class="char-tab-rail" id="charTabRail"></div>' +
      '<div class="char-info-card" id="charInfoCard"></div>' +
      '<div class="char-hero-art" id="charHeroArt"></div>' +
    '</div>' +
    '<div class="char-action-row" id="charActionRow"></div>';
  document.body.appendChild(screen);
}

function openEngineerProfile() {
  const ownedIds = gacha.owned.engineer || [];
  if (ownedIds.length === 0) { showToast('ยังไม่มีวิศวกรเลย ลองสุ่มที่ 🎰 ตู้กาชาก่อน'); return; }
  const id = gacha.equippedEngineer && ownedIds.indexOf(gacha.equippedEngineer) !== -1 ? gacha.equippedEngineer : ownedIds[0];
  showCharacterDetail(id);
}

function charDetailSwitchTo(id) { charDetailCurrentId = id; charDetailTab = 'skill'; renderCharacterDetail(); }
function charDetailSwitchTab(tab) { charDetailTab = tab; renderCharacterDetail(); }

function renderCharSwitchRow() {
  const owned = GACHA_ITEMS.engineer.filter(e => gacha.owned.engineer.indexOf(e.id) !== -1);
  document.getElementById('charSwitchRow').innerHTML = owned.map(e => {
    const active = e.id === charDetailCurrentId;
    const color = ALL_RARITY_COLORS[e.rarity];
    return '<button class="char-switch-avatar ' + (active ? 'active' : '') + '" style="--rarity-color:' + color + '" onclick="charDetailSwitchTo(\'' + e.id + '\')" title="' + e.name + '">👷</button>';
  }).join('');
}

function charDetailHeroArt(it, color) {
  return '<div class="char-hero-glow" style="--rarity-color:' + color + '">' +
    '<div class="char-hero-icon">👷</div>' +
    '<div class="char-hero-starline">' + '★'.repeat(it.rarity === 'r5' ? 5 : 4) + '</div>' +
    '</div>';
}

/* ---------- แท็บ: สกิล / เลเวล (ข้อความในการ์ดกลาง เหมือนเดิม) ---------- */
function charDetailInfoContent(it, level) {
  if (charDetailTab === 'skill') {
    return '<div class="char-card-section"><div class="char-card-label">พาสซีฟ — ' + it.skillName + '</div><div class="char-card-text">' + it.desc + '</div></div>' +
      '<div class="char-card-section"><div class="char-card-label">⚡ สกิลกดใช้ — ' + it.activeSkill.name + '</div><div class="char-card-text">' + it.activeSkill.desc + '</div><div class="char-card-sub">คูลดาวน์ ' + it.activeSkill.cooldownSec + ' วิ • ระยะเวลา ' + it.activeSkill.durationSec + ' วิ</div></div>';
  }
  if (charDetailTab === 'level') {
    const cost = gachaLevelUpCost(level);
    const maxed = level >= GACHA_MAX_LEVEL;
    return '<div class="char-card-section"><div class="char-card-label">เลเวลปัจจุบัน</div><div class="char-card-big">Lv.' + level + ' / ' + GACHA_MAX_LEVEL + '</div>' +
      '<div class="char-card-sub">' + (maxed ? 'ถึงเลเวลสูงสุดแล้ว' : 'ใช้ 🔩 ' + cost + ' ชิ้นส่วน เพื่ออัพเป็น Lv.' + (level + 1)) + '</div>' +
      '<div class="char-card-sub">มี 🔩 ชิ้นส่วนอยู่ ' + gacha.parts + ' ชิ้น</div></div>';
  }
  return '';
}

/* ---------- แท็บอาวุธ: การ์ดรายชื่ออาวุธที่มี พร้อมรายละเอียดเต็ม ---------- */
function charDetailWeaponList() {
  const owned = GACHA_ITEMS.weapon.filter(w => gacha.owned.weapon.indexOf(w.id) !== -1);
  if (owned.length === 0) return '<div class="char-card-section"><div class="char-card-text char-empty-text">ยังไม่มีอาวุธในคลัง ลองสุ่มที่ 🎰 ตู้กาชาก่อน</div></div>';
  return '<div class="char-pick-list">' + owned.map(w => {
    const color = ALL_RARITY_COLORS[w.rarity];
    const equipped = gacha.equippedWeapon === w.id;
    const level = gachaGetLevel('weapon', w.id);
    const cost = gachaLevelUpCost(level);
    const maxed = level >= GACHA_MAX_LEVEL;
    return '<div class="char-pick-card" style="--rarity-color:' + color + '">' +
      '<div class="char-pick-head"><span style="color:' + color + '">' + ALL_RARITY_LABELS[w.rarity] + '</span><span>Lv.' + level + '</span></div>' +
      '<div class="char-pick-name">' + w.name + '</div>' +
      '<div class="char-pick-sub"><b>' + w.skillName + '</b> — ' + w.desc + '</div>' +
      '<div class="char-pick-sub">⚡ ' + w.activeSkill.name + ': ' + w.activeSkill.desc + '</div>' +
      '<div class="char-pick-actions">' +
        '<button class="char-pick-btn ' + (equipped ? 'equipped' : '') + '" onclick="gachaEquipWeapon(\'' + w.id + '\'); renderCharacterDetail();">' + (equipped ? '✓ ติดตั้งอยู่' : 'ติดตั้ง') + '</button>' +
        '<button class="char-pick-btn" ' + (maxed ? 'disabled' : '') + ' onclick="gachaLevelUpUnit(\'weapon\',\'' + w.id + '\'); renderCharacterDetail();">' + (maxed ? 'MAX' : 'อัปเกรด 🔩' + cost) + '</button>' +
      '</div>' +
    '</div>';
  }).join('') + '</div>';
}

/* ---------- แท็บของสวมใส่: เลือกช่องก่อน แล้วโชว์การ์ดของทุกชิ้นในช่องนั้น ---------- */
function charDetailGearContent() {
  const slot = charDetailGearActiveSlot || GEAR_SLOTS[0];
  const equippedId = (gacha.equippedGear || {})[slot];
  const candidates = (gacha.gearInventory || []).filter(g => g.slot === slot);
  let html = '<div class="char-slot-picker">' +
    GEAR_SLOTS.map(s => '<button class="char-slot-chip ' + (s === slot ? 'active' : '') + '" onclick="charDetailGearActiveSlot=\'' + s + '\'; renderCharacterDetail();">' + GEAR_SLOT_ICONS[s] + '<span>' + GEAR_SLOT_LABELS[s] + '</span></button>').join('') +
    '</div>';
  if (candidates.length === 0) {
    html += '<div class="char-card-text char-empty-text">ช่องนี้ยังไม่มีของเลย — ดรอปได้ตอนจบเกม</div>';
    return html;
  }
  html += '<div class="char-pick-list">' + candidates.map(g => {
    const color = GACHA_RARITY_COLORS[g.rarity];
    const equipped = equippedId === g.id;
    const setDef = GEAR_SETS[g.set];
    return '<div class="char-pick-card" style="--rarity-color:' + color + '">' +
      '<div class="char-pick-head"><span style="color:' + color + '">' + GACHA_RARITY_LABELS[g.rarity] + '</span><span>' + setDef.icon + ' ' + setDef.name + '</span></div>' +
      '<div class="char-pick-sub"><b>' + gearStatLine(g.mainStat, g.mainValue) + '</b> (หลัก)</div>' +
      '<div class="char-pick-sub">' + g.substats.map(s => gearStatLine(s.stat, s.value)).join(' · ') + '</div>' +
      '<div class="char-pick-actions">' +
        '<button class="char-pick-btn ' + (equipped ? 'equipped' : '') + '" onclick="gachaEquipGear(\'' + g.id + '\'); renderCharacterDetail();">' + (equipped ? '✓ สวมอยู่' : 'สวมใส่') + '</button>' +
        '<button class="char-pick-btn danger" onclick="gachaDeleteGear(\'' + g.id + '\'); renderCharacterDetail();">ทิ้ง</button>' +
      '</div>' +
    '</div>';
  }).join('') + '</div>';
  return html;
}

function charDetailActionButtons(it, level) {
  if (charDetailTab === 'skill') {
    const equipped = gacha.equippedEngineer === it.id;
    return '<button class="char-action-btn primary" onclick="gachaEquipEngineer(\'' + it.id + '\'); renderCharacterDetail();">' + (equipped ? '✓ มอบหมายอยู่' : 'มอบหมายเป็นวิศวกรประจำ') + '</button>';
  }
  if (charDetailTab === 'level') {
    const maxed = level >= GACHA_MAX_LEVEL;
    return '<button class="char-action-btn primary" ' + (maxed ? 'disabled' : '') + ' onclick="gachaLevelUpUnit(\'engineer\',\'' + it.id + '\'); renderCharacterDetail();">' + (maxed ? 'เลเวลสูงสุดแล้ว' : 'อัปเกรด') + '</button>';
  }
  return ''; /* weapon/gear: ปุ่มอยู่ในการ์ดแต่ละใบแล้ว */
}

function renderCharacterDetail() {
  const id = charDetailCurrentId;
  const it = GACHA_ITEM_MAP[id];
  if (!it) return;
  const level = gachaGetLevel('engineer', id);
  const color = ALL_RARITY_COLORS[it.rarity];

  renderCharSwitchRow();

  document.getElementById('charTabRail').innerHTML = CHAR_DETAIL_TABS.map(t =>
    '<button class="char-tab-icon ' + (charDetailTab === t.key ? 'active' : '') + '" onclick="charDetailSwitchTab(\'' + t.key + '\')" title="' + t.label + '">' + t.icon + '</button>'
  ).join('');

  const isPickTab = (charDetailTab === 'weapon' || charDetailTab === 'gear');
  document.getElementById('charInfoCard').className = 'char-info-card' + (isPickTab ? ' char-info-card-wide' : '');
  document.getElementById('charInfoCard').innerHTML =
    '<div class="char-info-name">' + it.name + '</div>' +
    '<div class="char-info-meta"><span style="color:' + color + '">' + ALL_RARITY_LABELS[it.rarity] + '</span> • Lv.' + level + '</div>' +
    (charDetailTab === 'weapon' ? charDetailWeaponList() : charDetailTab === 'gear' ? charDetailGearContent() : charDetailInfoContent(it, level));

  document.getElementById('charHeroArt').innerHTML = charDetailHeroArt(it, color);
  document.getElementById('charHeroArt').style.display = isPickTab ? 'none' : '';
  document.getElementById('charActionRow').innerHTML = charDetailActionButtons(it, level);
}

function showCharacterDetail(id) {
  buildCharacterDetailUI();
  charDetailCurrentId = id;
  charDetailTab = 'skill';
  hideVoltrushHubScreens();
  renderCharacterDetail();
  document.getElementById('characterDetailScreen').classList.remove('hidden');
}
function closeCharacterDetail() {
  document.getElementById('characterDetailScreen').classList.add('hidden');
  showLobbyScreen();
}

buildCharacterDetailUI();
