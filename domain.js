/* ============================================================
   VoltRush — ด่านท้าทายเฉพาะทาง (Domain) เล่นเกมปกติ 3 นาที
   แต่การันตีได้วัสดุอัพเกรดชนิดที่เลือก จำกัด 3 ครั้ง/วัน/ด่าน
============================================================ */

function buildDomainScreenUI() {
  if (document.getElementById('domainScreen')) return;
  const screen = document.createElement('div');
  screen.id = 'domainScreen';
  screen.className = 'screen hidden';
  screen.innerHTML =
    '<div class="start-card gacha-page-card">' +
    '<div class="gacha-page-topbar">' +
      '<button class="secondary-btn" onclick="closeDomainScreen()">⬅ กลับล็อบบี้</button>' +
      '<h1 style="margin:0;font-size:1.2rem;">🌀 ด่านท้าทายเฉพาะทาง</h1>' +
      '<span style="width:1px;"></span>' +
    '</div>' +
    '<p class="gacha-hint">เล่นเกมปกติ 3 นาที แต่การันตีวัสดุตามชนิดด่านที่เลือก จำกัด 3 ครั้ง/วัน/ด่าน (รีเซ็ตเที่ยงคืน)</p>' +
    '<div class="domain-grid" id="domainGrid"></div>' +
    '</div>';
  document.body.appendChild(screen);
}

function renderDomainScreen() {
  const grid = document.getElementById('domainGrid');
  grid.innerHTML = Object.keys(DOMAIN_TYPES).map(type => {
    const def = DOMAIN_TYPES[type];
    const remaining = gachaDomainRemaining(type);
    const soldOut = remaining <= 0;
    return '<div class="domain-card">' +
      '<div class="domain-card-icon">' + def.icon + '</div>' +
      '<div class="domain-card-name">' + def.name + '</div>' +
      '<div class="domain-card-desc">' + def.desc + '</div>' +
      '<div class="domain-card-remaining">เหลือวันนี้ ' + remaining + '/' + DAILY_CAP_DOMAIN + '</div>' +
      '<button class="gacha-equip-btn" ' + (soldOut ? 'disabled' : '') + ' onclick="gachaStartDomain(\'' + type + '\')">' + (soldOut ? 'ครบโควตาวันนี้' : 'เริ่มด่าน') + '</button>' +
      '</div>';
  }).join('');
}

function showDomainScreen() {
  buildDomainScreenUI();
  hideVoltrushHubScreens();
  renderDomainScreen();
  document.getElementById('domainScreen').classList.remove('hidden');
}
function closeDomainScreen() {
  document.getElementById('domainScreen').classList.add('hidden');
  showLobbyScreen();
}

buildDomainScreenUI();
