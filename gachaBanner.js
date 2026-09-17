/* ============================================================
   VoltRush — ตู้กาชา (หน้าสุ่มรวม แยกจากหน้าคอลเลกชัน/ตัวละคร)
   เลือก banner ก่อน แล้วค่อยสุ่ม — สกิน/พิมพ์เขียว/วิศวกร/อาวุธ ใช้
   หน้านี้ร่วมกันหมด ปุ่มดูของ/จัดการอยู่คนละหน้า (skin.js/blueprint.js/
   engineer.js/weapon.js ที่เหลือแค่กริดคอลเลกชัน ไม่มีปุ่มสุ่มแล้ว)
============================================================ */

const GACHA_BANNER_TABS = [
  { key: 'engineer', label: '👷 วิศวกร' },
  { key: 'weapon', label: '🔧 อาวุธ' },
  { key: 'style', label: '🎨 สกิน' },
  { key: 'blueprint', label: '⚡ พิมพ์เขียว' }
];
let currentGachaBanner = 'engineer';

function buildGachaBannerScreenUI() {
  if (document.getElementById('gachaBannerScreen')) return;
  const screen = document.createElement('div');
  screen.id = 'gachaBannerScreen';
  screen.className = 'screen hidden';
  screen.innerHTML =
    '<div class="start-card gacha-page-card">' +
    '<div class="gacha-page-topbar">' +
      '<button class="secondary-btn" onclick="closeGachaBannerScreen()">⬅ กลับล็อบบี้</button>' +
      '<h1 style="margin:0;font-size:1.2rem;">🎰 ตู้กาชา</h1>' +
      '<span style="width:1px;"></span>' +
    '</div>' +
    '<div class="gacha-tab-row" id="gachaTabRow">' +
      GACHA_BANNER_TABS.map(t => '<button class="gacha-tab-btn" data-banner="' + t.key + '" onclick="switchGachaBannerTab(\'' + t.key + '\')">' + t.label + '</button>').join('') +
    '</div>' +
    '<div class="gacha-crystal-bar" id="gachaBannerCrystalBar"></div>' +
    '<div class="gacha-pity-row" id="gachaBannerPityRow"></div>' +
    '<p class="gacha-hint" id="gachaBannerFeaturedHint"></p>' +
    '<div class="start-actions" style="margin:12px 0;" id="gachaBannerPullBtns"></div>' +
    '</div>';
  document.body.appendChild(screen);
}

function switchGachaBannerTab(banner) {
  currentGachaBanner = banner;
  renderGachaBannerScreen();
}

function renderGachaBannerScreen() {
  document.querySelectorAll('#gachaTabRow .gacha-tab-btn').forEach(b => b.classList.toggle('selected', b.dataset.banner === currentGachaBanner));

  document.getElementById('gachaBannerCrystalBar').textContent = '💎 ' + gacha.crystals + ' Volt Crystal' + (gachaIsStarBanner(currentGachaBanner) ? ' • 🔩 ' + gacha.parts + ' ชิ้นส่วน' : '');

  const isStar = gachaIsStarBanner(currentGachaBanner);
  const hardPity = isStar ? STAR_PITY_HARD : GACHA_PITY_HARD;
  const pityNow = gacha.pity[currentGachaBanner];
  const left = hardPity - pityNow;
  const pityLabel = isStar ? 'การันตี 5★' : 'การันตีตำนาน';
  document.getElementById('gachaBannerPityRow').innerHTML =
    pityLabel + 'ในอีก ' + left + ' ครั้ง (สะสม ' + pityNow + '/' + hardPity + ') • เศษสะสม: ' + gacha.shards[currentGachaBanner] +
    '<button class="gacha-redeem-btn" onclick="gachaRedeemShards(currentGachaBanner); renderGachaBannerScreen();">แลกเศษ → 💎</button>';

  const hintEl = document.getElementById('gachaBannerFeaturedHint');
  if (isStar) {
    const featured = GACHA_ITEM_MAP[GACHA_FEATURED[currentGachaBanner]];
    hintEl.innerHTML = 'ตัวที่ขึ้นเวท (5★): <b>' + (featured ? featured.name : '-') + '</b> — สุ่มได้ 5★ ครั้งไหนได้ตัวนี้แน่นอน';
  } else {
    hintEl.innerHTML = currentGachaBanner === 'blueprint' ? 'พิมพ์เขียวที่ปลดล็อกแล้วใช้อัตโนมัติ ไม่ต้องสวมใส่เอง' : '';
  }

  document.getElementById('gachaBannerPullBtns').innerHTML =
    '<button class="primary-btn" style="padding:10px 22px;font-size:0.9rem;" onclick="gachaPullOne(currentGachaBanner)">สุ่ม 1 ครั้ง (💎' + GACHA_PULL_COST + ')</button>' +
    '<button class="primary-btn" style="padding:10px 22px;font-size:0.9rem;" onclick="gachaPullTen(currentGachaBanner)">สุ่ม 10 ครั้ง (💎' + GACHA_PULL10_COST + ')</button>';
}

function showGachaBannerScreen() {
  buildGachaBannerScreenUI();
  hideVoltrushHubScreens();
  renderGachaBannerScreen();
  document.getElementById('gachaBannerScreen').classList.remove('hidden');
}
function closeGachaBannerScreen() {
  document.getElementById('gachaBannerScreen').classList.add('hidden');
  showLobbyScreen();
}

buildGachaBannerScreenUI();
