/* ============================================================
   VoltRush — สรุปของที่ได้รับหลังจบเกม (แทนที่ toast กระจายหลายอัน
   ด้วยกล่องสรุปเดียวในหน้าจบเกม) ไม่แตะฟังก์ชัน award เดิมเลย แค่
   snapshot ก่อน/หลัง แล้ว diff เอา — ปลอดภัย ไม่กระทบของเดิม
============================================================ */

const END_MAT_LABELS = {
  engExpS: 'ตำรา EXP วิศวกร (เล็ก)', engExpM: 'ตำรา EXP วิศวกร (กลาง)', engExpL: 'ตำรา EXP วิศวกร (ใหญ่)',
  wpnExpS: 'ตำรา EXP อาวุธ (เล็ก)', wpnExpM: 'ตำรา EXP อาวุธ (กลาง)', wpnExpL: 'ตำรา EXP อาวุธ (ใหญ่)',
  engCoreT1: 'แกนพลังวิศวกร T1', engCoreT2: 'แกนพลังวิศวกร T2', engCoreT3: 'แกนพลังวิศวกร T3', engCoreT4: 'แกนพลังวิศวกร T4',
  wpnCoreT1: 'แกนพลังอาวุธ T1', wpnCoreT2: 'แกนพลังอาวุธ T2', wpnCoreT3: 'แกนพลังอาวุธ T3', wpnCoreT4: 'แกนพลังอาวุธ T4',
  gearTunerT1: 'คริสตัลปรับแต่ง T1', gearTunerT2: 'คริสตัลปรับแต่ง T2', gearTunerT3: 'คริสตัลปรับแต่ง T3'
};

function captureGachaSnapshot() {
  if (typeof gacha === 'undefined') return null;
  return {
    crystals: gacha.crystals || 0,
    coins: gacha.coins || 0,
    gearCount: (gacha.gearInventory || []).length,
    materials: Object.assign({}, gacha.materials || {}),
    playerLevel: gacha.playerLevel || 1
  };
}

function renderEndRewards(before) {
  const box = document.getElementById('endRewardsBox');
  if (!box || !before || typeof gacha === 'undefined') return;
  const lines = [];

  const crystalGain = (gacha.crystals || 0) - before.crystals;
  if (crystalGain > 0) lines.push({ icon: '💎', text: '+' + crystalGain + ' Volt Crystal' });

  const coinGain = (gacha.coins || 0) - before.coins;
  if (coinGain > 0) lines.push({ icon: '🪙', text: '+' + coinGain + ' เหรียญโวลต์' });

  const gearGain = (gacha.gearInventory || []).length - before.gearCount;
  if (gearGain > 0) {
    const newest = gacha.gearInventory[gacha.gearInventory.length - 1];
    const slotLabel = (typeof GEAR_SLOT_LABELS !== 'undefined') ? GEAR_SLOT_LABELS[newest.slot] : 'ของสวมใส่';
    const rarityLabel = (typeof GACHA_RARITY_LABELS !== 'undefined') ? GACHA_RARITY_LABELS[newest.rarity] : newest.rarity;
    lines.push({ icon: '🎒', text: 'ของสวมใส่ใหม่: ' + slotLabel + ' (' + rarityLabel + ')' });
  }

  if (gacha.materials) {
    Object.keys(gacha.materials).forEach(key => {
      const gain = (gacha.materials[key] || 0) - (before.materials[key] || 0);
      if (gain > 0) lines.push({ icon: '📦', text: (END_MAT_LABELS[key] || key) + ' x' + gain });
    });
  }

  const levelGain = (gacha.playerLevel || 1) - before.playerLevel;
  if (levelGain > 0) lines.push({ icon: '🎉', text: 'เลเวลผู้เล่นเพิ่มขึ้น! ตอนนี้ Lv.' + gacha.playerLevel });

  const list = document.getElementById('endRewardsList');
  if (lines.length === 0) { box.classList.add('hidden'); return; }
  list.innerHTML = lines.map(l => '<div class="end-reward-line"><span class="end-reward-icon">' + l.icon + '</span><span>' + l.text + '</span></div>').join('');
  box.classList.remove('hidden');
}
