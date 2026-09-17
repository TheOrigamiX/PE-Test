/* ============================================================
   VoltRush — Character detail / profile screen (เลย์เอาต์ใหม่ อิงหน้า
   ตัวละคร/อาวุธของ Wuthering Waves): ไอคอนแท็บซ้าย, อาร์ตใหญ่ขวา,
   การ์ดข้อมูลลอยไล่เฉด, แถบสลับตัวละครมุมบน, ปุ่ม action แค่ 1-2 ปุ่มล่าง
============================================================ */

const CHAR_DETAIL_TABS = [
  { key: 'skill', icon: '⚡', label: 'สกิล' },
  { key: 'level', icon: '⬆️', label: 'เลเวล' },
  { key: 'weapon', icon: '🔧', label: 'อาวุธ' },
  { key: 'gear', icon: '🎒', label: 'ของสวมใส่' }
];
let charDetailCurrentId = null;
let charDetailTab = 'skill';

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

function charDetailSwitchTo(id) {
  charDetailCurrentId = id;
  charDetailTab = 'skill';
  renderCharacterDetail();
}
function charDetailSwitchTab(tab) {
  charDetailTab = tab;
  renderCharacterDetail();
}

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

function charDetailTabContent(it, level) {
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
  if (charDetailTab === 'weapon') {
    const weapon = gachaEquippedWeaponItem();
    return '<div class="char-card-section"><div class="char-card-label">อาวุธที่ติดตั้ง</div>' +
      '<div class="char-card-text">' + (weapon ? ('<b>' + weapon.name + '</b> — ' + weapon.skillName + '<br>' + weapon.desc) : 'ยังไม่ได้ติดตั้งอาวุธ') + '</div>' +
      '<div class="char-card-sub">สล็อตกลาง ใช้ร่วมกันทุกวิศวกร</div></div>';
  }
  /* gear */
  const equipped = gacha.equippedGear || {};
  return '<div class="char-card-section"><div class="char-card-label">ของสวมใส่ (สล็อตกลาง)</div>' +
    GEAR_SLOTS.map(slot => {
      const gid = equipped[slot];
      const piece = gid ? (gacha.gearInventory || []).find(g => g.id === gid) : null;
      return '<div class="char-card-sub">' + GEAR_SLOT_ICONS[slot] + ' ' + GEAR_SLOT_LABELS[slot] + ': ' + (piece ? gearStatLine(piece.mainStat, piece.mainValue) : 'ว่าง') + '</div>';
    }).join('') +
    '</div>';
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
  if (charDetailTab === 'weapon') {
    const ownedWeapons = GACHA_ITEMS.weapon.filter(w => gacha.owned.weapon.indexOf(w.id) !== -1);
    if (ownedWeapons.length === 0) return '<span class="char-action-hint">ยังไม่มีอาวุธในคลัง</span>';
    return '<select class="char-action-select" onchange="if(this.value){gachaEquipWeapon(this.value); renderCharacterDetail();}">' +
      '<option value="">เปลี่ยน</option>' +
      ownedWeapons.map(w => '<option value="' + w.id + '">' + w.name + (gacha.equippedWeapon === w.id ? ' (ติดตั้งอยู่)' : '') + '</option>').join('') +
      '</select>';
  }
  /* gear */
  const slot = charDetailGearActiveSlot || GEAR_SLOTS[0];
  const candidates = (gacha.gearInventory || []).filter(g => g.slot === slot);
  let html = '<div class="char-gear-slot-picker">';
  html += GEAR_SLOTS.map(s => '<button class="char-slot-chip ' + (s === slot ? 'active' : '') + '" onclick="charDetailGearActiveSlot=\'' + s + '\'; renderCharacterDetail();">' + GEAR_SLOT_ICONS[s] + '</button>').join('');
  html += '</div>';
  if (candidates.length > 0) {
    html += '<select class="char-action-select" onchange="if(this.value){gachaEquipGear(this.value); renderCharacterDetail();}">' +
      '<option value="">เลือกของสวมใส่ช่องนี้</option>' +
      candidates.map(g => '<option value="' + g.id + '">' + GACHA_RARITY_LABELS[g.rarity] + ' • ' + gearStatLine(g.mainStat, g.mainValue) + '</option>').join('') +
      '</select>';
  } else {
    html += '<span class="char-action-hint">ไม่มีของช่องนี้ในคลัง</span>';
  }
  return html;
}
let charDetailGearActiveSlot = null;

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

  document.getElementById('charInfoCard').innerHTML =
    '<div class="char-info-name">' + it.name + '</div>' +
    '<div class="char-info-meta"><span style="color:' + color + '">' + ALL_RARITY_LABELS[it.rarity] + '</span> • Lv.' + level + '</div>' +
    charDetailTabContent(it, level);

  document.getElementById('charHeroArt').innerHTML = charDetailHeroArt(it, color);
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
  showEngineerScreen();
}

buildCharacterDetailUI();
