/* ============================================================
   VoltRush — ร้านค้า (เฟส 2: ทางเสริมนอกเหนือจากเล่นเกม/โดเมน)
============================================================ */

function buildShopScreenUI() {
  if (document.getElementById('shopScreen')) return;
  const screen = document.createElement('div');
  screen.id = 'shopScreen';
  screen.className = 'screen hidden';
  screen.innerHTML =
    '<div class="start-card gacha-page-card">' +
    '<div class="gacha-page-topbar">' +
      '<button class="secondary-btn" onclick="closeShopScreen()">⬅ กลับล็อบบี้</button>' +
      '<h1 style="margin:0;font-size:1.2rem;">🛒 ร้านค้า</h1>' +
      '<span style="width:1px;"></span>' +
    '</div>' +
    '<div class="gacha-crystal-bar">🪙 <span id="shopCoinVal">0</span> เหรียญ • 💎 <span id="shopCrystalVal">0</span> เพชร</div>' +
    '<p class="gacha-hint">ซื้อวัสดุอัพเกรดตรงๆ ได้ที่นี่ (มีโควตาต่อวัน) เสริมจากที่ได้จากการเล่นเกม/ด่านฝึก</p>' +
    '<div class="shop-grid" id="shopGrid"></div>' +
    '</div>';
  document.body.appendChild(screen);
}

function renderShopScreen() {
  document.getElementById('shopCoinVal').textContent = gacha.coins;
  document.getElementById('shopCrystalVal').textContent = gacha.crystals;

  document.getElementById('shopGrid').innerHTML = SHOP_ITEMS.map(item => {
    const bought = gachaShopBought(item.key);
    const soldOut = bought >= item.dailyLimit;
    const icon = item.currency === 'coins' ? '🪙' : '💎';
    return '<div class="shop-item-card">' +
      '<div class="shop-item-name">' + item.name + '</div>' +
      '<div class="shop-item-price">' + icon + ' ' + item.price + '</div>' +
      '<div class="shop-item-limit">ซื้อแล้ววันนี้ ' + bought + '/' + item.dailyLimit + '</div>' +
      '<button class="gacha-equip-btn" ' + (soldOut ? 'disabled' : '') + ' onclick="gachaBuyMaterial(\'' + item.key + '\'); renderShopScreen();">' + (soldOut ? 'ครบโควตาวันนี้' : 'ซื้อ') + '</button>' +
      '</div>';
  }).join('');
}

function showShopScreen() {
  buildShopScreenUI();
  hideVoltrushHubScreens();
  renderShopScreen();
  document.getElementById('shopScreen').classList.remove('hidden');
}
function closeShopScreen() {
  document.getElementById('shopScreen').classList.add('hidden');
  showLobbyScreen();
}

buildShopScreenUI();
