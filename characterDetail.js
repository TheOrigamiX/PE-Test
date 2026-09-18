/* ============================================================
   VoltRush — Character detail / profile screen
   แท็บอาวุธ/ของสวมใส่ ตอนนี้เลย์เอาต์เหมือนหน้าอาวุธจริงของ WuWa:
   โชว์ชิ้นเดียวแบบเต็ม (ชื่อ/เลเวล/ดาว/stat/สกิล) + ปุ่ม "เปลี่ยน"
   กับ "อัปเกรด" ด้านล่าง ไม่ใช่กริดการ์ดเยอะๆ แล้ว
============================================================ */

const CHAR_DETAIL_TABS = [
  { key: 'skill', icon: '⚡', label: 'สกิล' },
  { key: 'level', icon: '⬆️', label: 'เลเวล' },
  { key: 'weapon', icon: '🔧', label: 'อาวุธ' },
  { key: 'gear', icon: '🎒', label: 'ของสวมใส่' }
];
const GACHA_STAT_LABELS_SHORT = { incomeBoost: 'ผลผลิต', upgradeDiscount: 'ลดค่าอัพเกรด', hazardReduce: 'ต้านเหตุฉุกเฉิน' };

let charDetailCurrentId = null;
let charDetailTab = 'skill';
let charDetailGearActiveSlot = null;
let charDetailWeaponMode = 'view'; /* view | switch */
let charDetailGearMode = 'view';   /* view | switch */

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
function charDetailSwitchTab(tab) { charDetailTab = tab; charDetailWeaponMode = 'view'; charDetailGearMode = 'view'; renderCharacterDetail(); }

function renderCharSwitchRow() {
  const owned = GACHA_ITEMS.engineer.filter(e => gacha.owned.engineer.indexOf(e.id) !== -1);
  document.getElementById('charSwitchRow').innerHTML = owned.map(e => {
    const active = e.id === charDetailCurrentId;
    const color = ALL_RARITY_COLORS[e.rarity];
    return '<button class="char-switch-avatar ' + (active ? 'active' : '') + '" style="--rarity-color:' + color + '" onclick="charDetailSwitchTo(\'' + e.id + '\')" title="' + e.name + '">👷</button>';
  }).join('');
}

function charHeroGlow(icon, rarity, color) {
  return '<div class="char-hero-glow" style="--rarity-color:' + color + '">' +
    '<div class="char-hero-icon">' + icon + '</div>' +
    '<div class="char-hero-starline">' + '★'.repeat(rarity === 'r5' || rarity === 'legendary' ? 5 : 4) + '</div>' +
    '</div>';
}

/* ---------- เนื้อหาแท็บเลเวล: EXP tome + ตื่นพลัง (ใช้ร่วมกันระหว่างวิศวกร/อาวุธ) ---------- */
function charDetailLevelBlock(banner, id) {
  const data = gachaGetUnitData(banner, id);
  const maxed = data.level >= GACHA_MAX_LEVEL;
  const pendingTier = gachaPendingAscendTier(banner, id);
  const matDefs = GACHA_XP_MATERIALS[banner];

  let html = '<div class="char-card-section"><div class="char-card-label">เลเวล</div><div class="char-card-big">Lv.' + data.level + ' / ' + GACHA_MAX_LEVEL + '</div>';
  html += maxed ? '<div class="char-card-sub">ถึงเลเวลสูงสุดแล้ว</div>' : '<div class="char-card-sub">EXP ' + data.xp + ' / ' + gachaXpNeeded(data.level) + (pendingTier > 0 ? ' • ติดจุดตื่นพลัง' : '') + '</div>';
  html += '</div>';

  if (!maxed) {
    if (pendingTier > 0) {
      const cost = gachaAscendCost(banner, pendingTier);
      const have = gacha.materials[cost.matKey] || 0;
      html += '<div class="char-card-section"><div class="char-card-label">ต้องตื่นพลังระดับ ' + pendingTier + ' ก่อน</div>' +
        '<div class="char-card-sub">ใช้ ' + GACHA_ASCEND_MAT_NAMES[banner] + ' ระดับ ' + pendingTier + ' x' + cost.qty + ' + 🪙' + cost.coins + ' (มี ' + have + ' ชิ้น)</div></div>';
    } else {
      html += '<div class="char-card-section"><div class="char-card-label">ใช้ตำราประสบการณ์</div><div class="char-mat-row">' +
        ['s', 'm', 'l'].map(size => {
          const md = matDefs[size];
          const have = gacha.materials[md.key] || 0;
          return '<button class="char-mat-btn" onclick="gachaUseExpTome(\'' + banner + '\',\'' + id + '\',\'' + size + '\'); renderCharacterDetail();"><span>' + md.label + '</span><span class="char-mat-sub">+' + md.exp + ' EXP • มี ' + have + '</span></button>';
        }).join('') + '</div></div>';
    }
  }
  return html;
}
function charDetailLevelActions(banner, id) {
  const pendingTier = gachaPendingAscendTier(banner, id);
  if (pendingTier === 0) return '';
  return '<button class="char-action-btn primary" onclick="gachaAscendUnit(\'' + banner + '\',\'' + id + '\'); renderCharacterDetail();">✨ ตื่นพลัง (ระดับ ' + pendingTier + ')</button>';
}

/* ---------- แท็บ: สกิล / เลเวล ---------- */
function charDetailInfoContent(it, level) {
  if (charDetailTab === 'skill') {
    return '<div class="char-card-section"><div class="char-card-label">พาสซีฟ — ' + it.skillName + '</div><div class="char-card-text">' + it.desc + '</div></div>' +
      '<div class="char-card-section"><div class="char-card-label">⚡ สกิลกดใช้ — ' + it.activeSkill.name + '</div><div class="char-card-text">' + it.activeSkill.desc + '</div><div class="char-card-sub">คูลดาวน์ ' + it.activeSkill.cooldownSec + ' วิ • ระยะเวลา ' + it.activeSkill.durationSec + ' วิ</div></div>';
  }
  return charDetailLevelBlock('engineer', it.id);
}

/* ---------- แท็บอาวุธ: อาวุธของ "ตัวละครนี้" เท่านั้น (1 ชิ้นต่อ 1 ตัว แยกกันจริง) ---------- */
function charDetailWeaponBlock() {
  const engineerId = charDetailCurrentId;
  const loadout = gachaGetLoadout(engineerId);
  const ownedWeapons = GACHA_ITEMS.weapon.filter(w => gacha.owned.weapon.indexOf(w.id) !== -1);

  if (charDetailWeaponMode === 'switch') {
    if (ownedWeapons.length === 0) {
      return { card: '<div class="char-card-text char-empty-text">ยังไม่มีอาวุธในคลัง ลองสุ่มที่ 🎰 ตู้กาชาก่อน</div>', hero: null, actions: '<button class="char-action-btn" onclick="charDetailWeaponMode=\'view\'; renderCharacterDetail();">ย้อนกลับ</button>' };
    }
    const card = '<div class="char-card-label" style="margin-bottom:8px;">เลือกอาวุธ (ติดตั้งได้คนละ 1 ชิ้น)</div>' +
      '<div class="char-switch-list">' +
      '<button class="char-switch-item" onclick="gachaUnequipWeaponFor(\'' + engineerId + '\'); charDetailWeaponMode=\'view\'; renderCharacterDetail();"><span>— ไม่ติดตั้งอาวุธ —</span>' + (!loadout.weapon ? '<span class="char-equipped-tag">ปัจจุบัน</span>' : '') + '</button>' +
      ownedWeapons.map(w => {
        const color = ALL_RARITY_COLORS[w.rarity];
        const eq = loadout.weapon === w.id;
        const wearer = !eq ? gachaFindWeaponWearer(w.id) : null;
        return '<button class="char-switch-item" style="--rarity-color:' + color + '" onclick="gachaEquipWeaponFor(\'' + engineerId + '\',\'' + w.id + '\'); charDetailWeaponMode=\'view\'; renderCharacterDetail();">' +
          '<span>' + w.name + '</span><span style="color:' + color + '">' + ALL_RARITY_LABELS[w.rarity] + '</span>' +
          (eq ? '<span class="char-equipped-tag">ติดตั้งอยู่</span>' : wearer ? '<span class="char-wearer-tag">ใส่อยู่ที่ ' + wearer + '</span>' : '') +
          '</button>';
      }).join('') + '</div>';
    return { card: card, hero: null, actions: '<button class="char-action-btn" onclick="charDetailWeaponMode=\'view\'; renderCharacterDetail();">ยกเลิก</button>' };
  }

  if (!loadout.weapon) {
    const actions = ownedWeapons.length > 0 ? '<button class="char-action-btn primary" onclick="charDetailWeaponMode=\'switch\'; renderCharacterDetail();">เลือกอาวุธ</button>' : '';
    return { card: '<div class="char-card-text char-empty-text">ยังไม่ได้ติดตั้งอาวุธ</div>', hero: null, actions: actions };
  }

  const w = GACHA_ITEM_MAP[loadout.weapon];
  const level = gachaGetLevel('weapon', w.id);
  const leveledValue = gachaLeveledValue('weapon', w);
  const color = ALL_RARITY_COLORS[w.rarity];
  const maxed = level >= GACHA_MAX_LEVEL;
  const statLines = w.perk === 'allRounder'
    ? [{ label: 'ผลผลิต', value: leveledValue }, { label: 'ลดค่าอัพเกรด', value: leveledValue }]
    : [{ label: GACHA_STAT_LABELS_SHORT[w.perk], value: leveledValue }];

  const card =
    '<div class="char-item-title-row"><span class="char-info-name">' + w.name + '</span><span class="char-equipped-tag">ติดตั้งอยู่</span></div>' +
    '<div class="char-item-level-row"><span class="char-card-big">Lv.' + level + ' / ' + GACHA_MAX_LEVEL + '</span>' + (maxed ? '<span class="char-max-tag">MAX</span>' : '') + '</div>' +
    '<div class="char-starline" style="color:' + color + '">' + '★'.repeat(w.rarity === 'r5' ? 5 : 4) + '</div>' +
    '<div class="char-stat-block">' + statLines.map(s => '<div class="char-stat-line"><span>' + s.label + '</span><span class="char-stat-value">+' + (s.value * 100).toFixed(1) + '%</span></div>').join('') + '</div>' +
    '<div class="char-card-section"><div class="char-card-label">' + w.skillName + '</div><div class="char-card-text">' + w.desc + '</div></div>' +
    '<div class="char-card-section"><div class="char-card-label">⚡ ' + w.activeSkill.name + '</div><div class="char-card-text">' + w.activeSkill.desc + '</div></div>' +
    charDetailLevelBlock('weapon', w.id);

  const actions = '<button class="char-action-btn" onclick="charDetailWeaponMode=\'switch\'; renderCharacterDetail();">เปลี่ยน</button>' + charDetailLevelActions('weapon', w.id);

  return { card: card, hero: charHeroGlow('🔧', w.rarity, color), actions: actions };
}

/* ---------- แท็บของสวมใส่: ของ "ตัวละครนี้" เท่านั้น (แยกกันจริงทีละคน) ---------- */
function charDetailGearBlock() {
  const engineerId = charDetailCurrentId;
  const loadout = gachaGetLoadout(engineerId);
  const slot = charDetailGearActiveSlot || GEAR_SLOTS[0];
  const slotPicker = '<div class="char-slot-picker">' +
    GEAR_SLOTS.map(s => '<button class="char-slot-chip ' + (s === slot ? 'active' : '') + '" onclick="charDetailGearActiveSlot=\'' + s + '\'; charDetailGearMode=\'view\'; renderCharacterDetail();">' + GEAR_SLOT_ICONS[s] + '<span>' + GEAR_SLOT_LABELS[s] + '</span></button>').join('') +
    '</div>';
  const candidates = (gacha.gearInventory || []).filter(g => g.slot === slot);
  const equippedId = loadout.gear[slot];

  if (charDetailGearMode === 'switch') {
    if (candidates.length === 0) {
      return { card: slotPicker + '<div class="char-card-text char-empty-text">ช่องนี้ยังไม่มีของเลย</div>', hero: null, actions: '<button class="char-action-btn" onclick="charDetailGearMode=\'view\'; renderCharacterDetail();">ย้อนกลับ</button>' };
    }
    const card = slotPicker + '<div class="char-card-label" style="margin:8px 0;">เลือกของสวมใส่ (ใส่ได้คนละ 1 ชิ้นต่อช่อง)</div>' +
      '<div class="char-switch-list">' +
      '<button class="char-switch-item" onclick="gachaUnequipGearFor(\'' + engineerId + '\',\'' + slot + '\'); charDetailGearMode=\'view\'; renderCharacterDetail();"><span>— ไม่สวมช่องนี้ —</span>' + (!equippedId ? '<span class="char-equipped-tag">ปัจจุบัน</span>' : '') + '</button>' +
      candidates.map(g => {
        const color = GACHA_RARITY_COLORS[g.rarity];
        const eq = equippedId === g.id;
        const wearer = !eq ? gachaFindGearWearer(g.id) : null;
        return '<button class="char-switch-item" style="--rarity-color:' + color + '" onclick="gachaEquipGearFor(\'' + engineerId + '\',\'' + g.id + '\'); charDetailGearMode=\'view\'; renderCharacterDetail();">' +
          '<span>' + gearStatLine(g.mainStat, gachaGearEffectiveMainValue(g)) + ' (Lv.' + (g.level || 0) + ')</span><span style="color:' + color + '">' + GACHA_RARITY_LABELS[g.rarity] + '</span>' +
          (eq ? '<span class="char-equipped-tag">สวมอยู่</span>' : wearer ? '<span class="char-wearer-tag">ใส่อยู่ที่ ' + wearer + '</span>' : '') +
          '</button>';
      }).join('') + '</div>';
    return { card: card, hero: null, actions: '<button class="char-action-btn" onclick="charDetailGearMode=\'view\'; renderCharacterDetail();">ยกเลิก</button>' };
  }

  if (!equippedId) {
    const actions = candidates.length > 0 ? '<button class="char-action-btn primary" onclick="charDetailGearMode=\'switch\'; renderCharacterDetail();">เลือกของสวมใส่</button>' : '';
    return { card: slotPicker + '<div class="char-card-text char-empty-text">ช่องนี้ว่างอยู่' + (candidates.length === 0 ? ' — ดรอปได้ตอนจบเกม' : '') + '</div>', hero: null, actions: actions };
  }

  const piece = candidates.find(g => g.id === equippedId);
  if (!piece) {
    /* กันเคสข้อมูลไม่ตรงกัน (ของถูกลบไปแล้วแต่ค่ายังค้าง) */
    return { card: slotPicker + '<div class="char-card-text char-empty-text">ช่องนี้ว่างอยู่</div>', hero: null, actions: candidates.length > 0 ? '<button class="char-action-btn primary" onclick="charDetailGearMode=\'switch\'; renderCharacterDetail();">เลือกของสวมใส่</button>' : '' };
  }
  const color = GACHA_RARITY_COLORS[piece.rarity];
  const setDef = GEAR_SETS[piece.set];

  const effMain = gachaGearEffectiveMainValue(piece);
  const gearLevel = piece.level || 0;
  const gearMaxed = gearLevel >= GACHA_GEAR_MAX_LEVEL;
  const levelUpCost = gachaGearLevelUpCost(piece);

  const card = slotPicker +
    '<div class="char-item-title-row"><span class="char-info-name">' + GEAR_SLOT_LABELS[slot] + '</span><span class="char-equipped-tag">สวมอยู่</span></div>' +
    '<div class="char-info-meta" style="color:' + color + ';">' + GACHA_RARITY_LABELS[piece.rarity] + ' • ' + setDef.icon + ' ' + setDef.name + ' • Lv.' + gearLevel + '/' + GACHA_GEAR_MAX_LEVEL + '</div>' +
    '<div class="char-stat-block">' +
      '<div class="char-stat-line"><span>' + GEAR_STAT_LABELS[piece.mainStat] + ' (หลัก)</span><span class="char-stat-value">+' + (effMain * 100).toFixed(1) + '%</span></div>' +
      piece.substats.map(s => '<div class="char-stat-line sub"><span>' + GEAR_STAT_LABELS[s.stat] + '</span><span class="char-stat-value">+' + (s.value * 100).toFixed(1) + '%</span></div>').join('') +
    '</div>' +
    '<div class="char-card-sub">อัพเกรดต้องใช้คริสตัลปรับแต่งระดับ ' + levelUpCost.tier + ' x' + levelUpCost.qty + ' + 🪙' + levelUpCost.coins + ' (มี ' + (gacha.materials[levelUpCost.matKey] || 0) + ' ชิ้น)</div>';

  const actions = '<button class="char-action-btn" onclick="charDetailGearMode=\'switch\'; renderCharacterDetail();">เปลี่ยน</button>' +
    '<button class="char-action-btn primary" ' + (gearMaxed ? 'disabled' : '') + ' onclick="gachaLevelUpGear(\'' + piece.id + '\'); renderCharacterDetail();">' + (gearMaxed ? 'MAX' : 'อัปเกรด') + '</button>' +
    '<button class="char-action-btn danger" onclick="gachaDeleteGear(\'' + piece.id + '\'); renderCharacterDetail();">ทิ้ง</button>';

  return { card: card, hero: charHeroGlow(GEAR_SLOT_ICONS[slot], piece.rarity, color), actions: actions };
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

  let block;
  if (charDetailTab === 'weapon') block = charDetailWeaponBlock();
  else if (charDetailTab === 'gear') block = charDetailGearBlock();
  else block = { card: '<div class="char-info-name">' + it.name + '</div><div class="char-info-meta"><span style="color:' + color + '">' + ALL_RARITY_LABELS[it.rarity] + '</span> • Lv.' + level + '</div>' + charDetailInfoContent(it, level), hero: charHeroGlow('👷', it.rarity, color), actions: charDetailTab === 'skill' ? ('<button class="char-action-btn primary" onclick="gachaEquipEngineer(\'' + it.id + '\'); renderCharacterDetail();">' + (gacha.equippedEngineer === it.id ? '✓ มอบหมายอยู่' : 'มอบหมายเป็นวิศวกรประจำ') + '</button>') : charDetailLevelActions('engineer', it.id) };

  document.getElementById('charInfoCard').className = 'char-info-card';
  document.getElementById('charInfoCard').innerHTML = block.card;
  document.getElementById('charHeroArt').innerHTML = block.hero || '';
  document.getElementById('charHeroArt').style.display = block.hero ? '' : 'none';
  document.getElementById('charActionRow').innerHTML = block.actions;
}

function showCharacterDetail(id) {
  buildCharacterDetailUI();
  charDetailCurrentId = id;
  charDetailTab = 'skill';
  charDetailWeaponMode = 'view';
  charDetailGearMode = 'view';
  hideVoltrushHubScreens();
  renderCharacterDetail();
  document.getElementById('characterDetailScreen').classList.remove('hidden');
}
function closeCharacterDetail() {
  document.getElementById('characterDetailScreen').classList.add('hidden');
  showLobbyScreen();
}

buildCharacterDetailUI();
