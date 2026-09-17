/* ============================================================
   VoltRush — Character detail / profile screen
   เปิดจากการ์ดวิศวกรที่เป็นเจ้าของแล้ว รวมทุกอย่างไว้ที่เดียว:
   มอบหมายเป็นวิศวกรประจำ, เลเวลอัพ, เปลี่ยนอาวุธ, ใส่ของสวมใส่ 4 ช่อง
   (อาวุธ/ของสวมใส่เป็นสล็อตกลาง ใช้ร่วมกันไม่ว่าจะเปิดโปรไฟล์ใคร
   เพราะตอนนี้เกมรองรับวิศวกรประจำได้ทีละ 1 คน)
============================================================ */

function buildCharacterDetailUI() {
  if (document.getElementById('characterDetailScreen')) return;
  const screen = document.createElement('div');
  screen.id = 'characterDetailScreen';
  screen.className = 'screen hidden';
  screen.innerHTML =
    '<div class="start-card gacha-page-card char-detail-card">' +
    '<div class="gacha-page-topbar">' +
      '<button class="secondary-btn" onclick="closeCharacterDetail()">⬅ กลับ</button>' +
      '<h1 style="margin:0;font-size:1.1rem;" id="charDetailTitle">โปรไฟล์</h1>' +
      '<span style="width:1px;"></span>' +
    '</div>' +
    '<div id="charDetailBody"></div>' +
    '</div>';
  document.body.appendChild(screen);
}

let charDetailCurrentId = null;

function charDetailGearSlotHtml(slot) {
  const equippedId = (gacha.equippedGear || {})[slot];
  const piece = equippedId ? (gacha.gearInventory || []).find(g => g.id === equippedId) : null;
  const candidates = (gacha.gearInventory || []).filter(g => g.slot === slot);
  let html = '<div class="char-gear-slot" style="' + (piece ? '--rarity-color:' + GACHA_RARITY_COLORS[piece.rarity] : '') + '">';
  html += '<div class="char-gear-slot-head">' + GEAR_SLOT_ICONS[slot] + ' ' + GEAR_SLOT_LABELS[slot] + '</div>';
  if (piece) {
    html += '<div class="char-gear-current">' + gearStatLine(piece.mainStat, piece.mainValue) + ' <span style="color:' + GACHA_RARITY_COLORS[piece.rarity] + '">(' + GACHA_RARITY_LABELS[piece.rarity] + ')</span></div>';
  } else {
    html += '<div class="char-gear-current char-empty">ว่าง</div>';
  }
  if (candidates.length > 0) {
    html += '<select class="char-select" onchange="if(this.value){gachaEquipGear(this.value); renderCharacterDetail();}">';
    html += '<option value="">-- เลือกของสวมใส่ --</option>';
    candidates.forEach(g => {
      html += '<option value="' + g.id + '">' + GACHA_RARITY_LABELS[g.rarity] + ' • ' + gearStatLine(g.mainStat, g.mainValue) + (equippedId === g.id ? ' (สวมอยู่)' : '') + '</option>';
    });
    html += '</select>';
  } else {
    html += '<div class="char-gear-hint">ยังไม่มีของสวมใส่ช่องนี้ในคลัง</div>';
  }
  html += '</div>';
  return html;
}

function renderCharacterDetail() {
  const id = charDetailCurrentId;
  const it = GACHA_ITEM_MAP[id];
  if (!it) return;
  document.getElementById('charDetailTitle').textContent = it.name;
  const level = gachaGetLevel('engineer', id);
  const cost = gachaLevelUpCost(level);
  const maxed = level >= GACHA_MAX_LEVEL;
  const equipped = gacha.equippedEngineer === id;
  const color = ALL_RARITY_COLORS[it.rarity];

  const weapon = gachaEquippedWeaponItem();
  const ownedWeapons = GACHA_ITEMS.weapon.filter(w => gacha.owned.weapon.indexOf(w.id) !== -1);

  let html = '';
  html += '<div class="char-detail-header" style="--rarity-color:' + color + '">';
  html += '<div class="char-detail-icon">👷</div>';
  html += '<div><div class="char-detail-rarity" style="color:' + color + '">' + ALL_RARITY_LABELS[it.rarity] + '</div>';
  html += '<div class="char-detail-level">Lv.' + level + (maxed ? ' (สูงสุด)' : '') + '</div></div>';
  html += '</div>';

  html += '<button class="gacha-equip-btn ' + (equipped ? 'equipped' : '') + '" style="margin:10px 0;width:100%;" onclick="gachaEquipEngineer(\'' + id + '\'); renderCharacterDetail();">' + (equipped ? '✓ มอบหมายอยู่' : 'มอบหมายเป็นวิศวกรประจำ') + '</button>';

  html += '<div class="char-skill-box"><b>พาสซีฟ — ' + it.skillName + ':</b> ' + it.desc + '</div>';
  html += '<div class="char-skill-box"><b>⚡ สกิลกดใช้ — ' + it.activeSkill.name + ':</b> ' + it.activeSkill.desc + ' (คูลดาวน์ ' + it.activeSkill.cooldownSec + ' วิ)</div>';

  html += '<button class="gear-discard-btn char-levelup-btn" ' + (maxed ? 'disabled' : '') + ' onclick="gachaLevelUpUnit(\'engineer\',\'' + id + '\'); renderCharacterDetail();">' + (maxed ? 'เลเวลสูงสุดแล้ว' : 'เลเวลอัพ (🔩' + cost + ')') + '</button>';

  html += '<h3 class="gear-inv-title">อาวุธที่ติดตั้ง <span class="char-shared-note">(สล็อตกลาง ใช้ร่วมกันทุกวิศวกร)</span></h3>';
  html += '<div class="char-weapon-current">' + (weapon ? ('<b>' + weapon.name + '</b> — ' + weapon.skillName) : 'ยังไม่ได้ติดตั้งอาวุธ') + '</div>';
  if (ownedWeapons.length > 0) {
    html += '<select class="char-select" onchange="if(this.value){gachaEquipWeapon(this.value); renderCharacterDetail();}">';
    html += '<option value="">-- เปลี่ยนอาวุธ --</option>';
    ownedWeapons.forEach(w => { html += '<option value="' + w.id + '">' + w.name + (gacha.equippedWeapon === w.id ? ' (ติดตั้งอยู่)' : '') + '</option>'; });
    html += '</select>';
  } else {
    html += '<div class="char-gear-hint">ยังไม่มีอาวุธในคลัง ลองสุ่มที่หน้าอาวุธดู</div>';
  }

  html += '<h3 class="gear-inv-title" style="margin-top:16px;">ของสวมใส่ <span class="char-shared-note">(สล็อตกลาง ใช้ร่วมกันทุกวิศวกร)</span></h3>';
  html += '<div class="char-gear-grid">' + GEAR_SLOTS.map(s => charDetailGearSlotHtml(s)).join('') + '</div>';

  document.getElementById('charDetailBody').innerHTML = html;
}

function showCharacterDetail(id) {
  buildCharacterDetailUI();
  charDetailCurrentId = id;
  hideVoltrushHubScreens();
  renderCharacterDetail();
  document.getElementById('characterDetailScreen').classList.remove('hidden');
}
function closeCharacterDetail() {
  document.getElementById('characterDetailScreen').classList.add('hidden');
  showEngineerScreen();
}

buildCharacterDetailUI();
