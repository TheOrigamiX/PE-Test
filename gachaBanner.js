/* ============================================================
   VoltRush — ตู้กาชา (เลย์เอาต์ใหม่ อิงหน้า Convene ของ Wuthering Waves):
   แถบเงินบนสุด, banner list การ์ดรูปภาพซ้าย, อาร์ตตัวเวทเต็มจอ,
   ปุ่มสุ่ม x1/x10 ล่างสุด
============================================================ */

const GACHA_BANNER_TABS = [
  { key: 'engineer', label: 'วิศวกร', icon: '👷' },
  { key: 'weapon', label: 'อาวุธ', icon: '🔧' },
  { key: 'style', label: 'สกิน', icon: '🎨' },
  { key: 'blueprint', label: 'พิมพ์เขียว', icon: '⚡' }
];
let currentGachaBanner = 'engineer';

function buildGachaBannerScreenUI() {
  if (document.getElementById('gachaBannerScreen')) return;
  const screen = document.createElement('div');
  screen.id = 'gachaBannerScreen';
  screen.className = 'screen hidden gacha-banner-screen';
  screen.innerHTML =
    '<button class="char-back-btn" onclick="closeGachaBannerScreen()">⬅</button>' +
    '<div class="gacha-currency-bar" id="gachaCurrencyBar"></div>' +
    '<div class="gacha-banner-layout">' +
      '<div class="gacha-banner-list" id="gachaBannerList"></div>' +
      '<div class="gacha-hero-zone" id="gachaHeroZone"></div>' +
    '</div>' +
    '<div class="gacha-bottom-bar">' +
      '<button class="gacha-redeem-chip" id="gachaRedeemChip" onclick="gachaRedeemShards(currentGachaBanner); renderGachaBannerScreen();"></button>' +
      '<div class="gacha-pull-btns" id="gachaBannerPullBtns"></div>' +
    '</div>';
  document.body.appendChild(screen);
}

function switchGachaBannerTab(banner) {
  currentGachaBanner = banner;
  renderGachaBannerScreen();
}

function renderGachaBannerScreen() {
  document.getElementById('gachaCurrencyBar').innerHTML =
    '<div class="gacha-currency-chip">💎 <b>' + gacha.crystals + '</b></div>' +
    '<div class="gacha-currency-chip">🪙 <b>' + gacha.coins + '</b></div>';

  document.getElementById('gachaBannerList').innerHTML = GACHA_BANNER_TABS.map(t => {
    const isStar = gachaIsStarBanner(t.key);
    const featured = isStar ? GACHA_ITEM_MAP[GACHA_FEATURED[t.key]] : null;
    const color = featured ? ALL_RARITY_COLORS[featured.rarity] : '#9fb3d1';
    return '<button class="gacha-banner-card ' + (t.key === currentGachaBanner ? 'active' : '') + '" style="--rarity-color:' + color + '" onclick="switchGachaBannerTab(\'' + t.key + '\')">' +
      '<div class="gacha-banner-card-icon">' + t.icon + '</div>' +
      '<div class="gacha-banner-card-label">' + t.label + '</div>' +
      (featured ? '<div class="gacha-banner-card-up">UP! ' + featured.name + '</div>' : '') +
      '</button>';
  }).join('');

  const isStar = gachaIsStarBanner(currentGachaBanner);
  const hardPity = isStar ? STAR_PITY_HARD : GACHA_PITY_HARD;
  const pityNow = gacha.pity[currentGachaBanner];
  const left = hardPity - pityNow;
  const pityLabel = isStar ? 'การันตี 5★' : 'การันตีตำนาน';
  const featured = isStar ? GACHA_ITEM_MAP[GACHA_FEATURED[currentGachaBanner]] : null;
  const heroColor = featured ? ALL_RARITY_COLORS[featured.rarity] : '#ffd166';
  const heroIcon = currentGachaBanner === 'engineer' ? '👷' : currentGachaBanner === 'weapon' ? '🔧' : currentGachaBanner === 'style' ? '🎨' : '⚡';

  document.getElementById('gachaHeroZone').innerHTML =
    '<div class="gacha-rules-float">' +
      (featured ? '<div class="gacha-rules-up">✨ ตัวขึ้นเวท: <b>' + featured.name + '</b></div>' : '') +
      '<div class="gacha-rules-line">' + pityLabel + 'ในอีก ' + left + ' ครั้ง (' + pityNow + '/' + hardPity + ')</div>' +
      '<div class="gacha-rules-line">เศษสะสม: ' + gacha.shards[currentGachaBanner] + ' ชิ้น</div>' +
      (currentGachaBanner === 'blueprint' ? '<div class="gacha-rules-line">พิมพ์เขียวที่ปลดล็อกใช้อัตโนมัติ</div>' : '') +
    '</div>' +
    '<div class="gacha-hero-glow-big" style="--rarity-color:' + heroColor + '"><div class="gacha-hero-icon-big">' + heroIcon + '</div></div>';

  document.getElementById('gachaRedeemChip').textContent = 'แลกเศษ → 💎';

  document.getElementById('gachaBannerPullBtns').innerHTML =
    '<button class="char-action-btn" onclick="gachaPullOne(currentGachaBanner)">สุ่ม x1<br><span class="gacha-pull-cost">💎' + GACHA_PULL_COST + '</span></button>' +
    '<button class="char-action-btn primary" onclick="gachaPullTen(currentGachaBanner)">สุ่ม x10<br><span class="gacha-pull-cost">💎' + GACHA_PULL10_COST + '</span></button>';
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
