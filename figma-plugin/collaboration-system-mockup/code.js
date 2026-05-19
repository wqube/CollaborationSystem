// ============================================================
// Collaboration System — Figma Plugin v5
// Current frontend UI, modal states + User Flow arrows
// Все шрифты загружаются один раз
// ============================================================

// ─── ТОКЕНЫ ИЗ styles.css ────────────────────────────────────
var C = {
  yellow:      { r: 1.000, g: 0.867, b: 0.176 }, // #FFDD2D
  black:       { r: 0.102, g: 0.102, b: 0.102 }, // #1A1A1A
  darkGray:    { r: 0.169, g: 0.169, b: 0.169 }, // #2B2B2B
  gray:        { r: 0.541, g: 0.541, b: 0.541 }, // #8A8A8A
  lightGray:   { r: 0.961, g: 0.961, b: 0.961 }, // #F5F5F5
  border:      { r: 0.878, g: 0.878, b: 0.878 }, // #E0E0E0
  green:       { r: 0.000, g: 0.659, b: 0.420 }, // #00A86B
  red:         { r: 0.890, g: 0.110, b: 0.239 }, // #E31C3D
  blue:        { r: 0.259, g: 0.522, b: 0.957 }, // #4285F4
  white:       { r: 1,     g: 1,     b: 1     },
  // Badges
  badgeNewBg:  { r: 0.890, g: 0.949, b: 0.992 }, // #E3F2FD
  badgeNewFg:  { r: 0.098, g: 0.463, b: 0.824 }, // #1976D2
  badgeProgBg: { r: 1.000, g: 0.953, b: 0.878 }, // #FFF3E0
  badgeProgFg: { r: 0.961, g: 0.486, b: 0.000 }, // #F57C00
  badgeAccBg:  { r: 0.910, g: 0.961, b: 0.914 }, // #E8F5E9
  badgeAccFg:  { r: 0.220, g: 0.557, b: 0.235 }, // #388E3C
  badgeRejBg:  { r: 1.000, g: 0.922, b: 0.925 }, // #FFEBEE
  badgeRejFg:  { r: 0.827, g: 0.184, b: 0.184 }, // #D32F2F
  badgeAdminBg:{ r: 1.000, g: 0.867, b: 0.176 }, // #FFDD2D
  badgeAdminFg:{ r: 0.102, g: 0.102, b: 0.102 }, // #1A1A1A
  badgeMemBg:  { r: 0.961, g: 0.961, b: 0.961 }, // #F5F5F5
  badgeMemFg:  { r: 0.541, g: 0.541, b: 0.541 }, // #8A8A8A
  draftInfoBg: { r: 1.000, g: 0.976, b: 0.898 }, // #FFF9E6
  settingsBg:  { r: 0.973, g: 0.984, b: 0.976 }, // #F8FBF9
  settingsBr:  { r: 0.847, g: 0.902, b: 0.875 }, // #D8E6DF
  dangerBg:    { r: 1.000, g: 0.922, b: 0.933 }, // #FFEBEE
  dangerBr:    { r: 1.000, g: 0.804, b: 0.824 }, // #FFCDD2
  dangerFg:    { r: 0.714, g: 0.110, b: 0.110 }, // #B71C1C
};

var FONTS = {
  regular:  { family: 'Inter', style: 'Regular'   },
  medium:   { family: 'Inter', style: 'Medium'    },
  semibold: { family: 'Inter', style: 'Semi Bold' },
  bold:     { family: 'Inter', style: 'Bold'      },
};

async function preloadFonts() {
  await Promise.all(Object.values(FONTS).map(function(f) {
    return figma.loadFontAsync(f);
  }));
}

// ─── ПРИМИТИВЫ ───────────────────────────────────────────────

function sf(color) { return [{ type: 'SOLID', color: color }]; }

function mkText(content, opts) {
  opts = opts || {};
  var t = figma.createText();
  t.characters = String(content);
  t.fontSize = opts.size || 14;
  t.fills = sf(opts.color || C.black);
  if      (opts.weight >= 700 || opts.bold) t.fontName = FONTS.bold;
  else if (opts.weight >= 600)              t.fontName = FONTS.semibold;
  else if (opts.weight >= 500)              t.fontName = FONTS.medium;
  else                                      t.fontName = FONTS.regular;
  if (opts.align) t.textAlignHorizontal = opts.align;
  if (opts.wrap)  { t.textAutoResize = 'HEIGHT'; t.resize(opts.wrap, 20); }
  else              t.textAutoResize = 'WIDTH_AND_HEIGHT';
  return t;
}

function mkFrame(w, h, opts) {
  opts = opts || {};
  var f = figma.createFrame();
  f.resize(w, h);
  f.fills = sf(opts.bg || C.white);
  if (opts.radius) f.cornerRadius = opts.radius;
  f.clipsContent = opts.clip !== false;
  if (opts.layout) {
    f.layoutMode             = opts.layout;
    f.primaryAxisSizingMode  = opts.hug ? 'AUTO' : 'FIXED';
    f.counterAxisSizingMode  = opts.hug ? 'AUTO' : 'FIXED';
    f.paddingLeft    = opts.padX !== undefined ? opts.padX : (opts.pad || 0);
    f.paddingRight   = opts.padX !== undefined ? opts.padX : (opts.pad || 0);
    f.paddingTop     = opts.padY !== undefined ? opts.padY : (opts.pad || 0);
    f.paddingBottom  = opts.padY !== undefined ? opts.padY : (opts.pad || 0);
    f.itemSpacing            = opts.gap     || 0;
    f.primaryAxisAlignItems  = opts.justify || 'MIN';
    f.counterAxisAlignItems  = opts.align   || 'MIN';
  }
  if (opts.strokeColor) {
    f.strokes = sf(opts.strokeColor); f.strokeWeight = opts.strokeW || 1; f.strokeAlign = 'INSIDE';
  }
  if (opts.name) f.name = opts.name;
  return f;
}

function shadowMd() {
  return [{ type:'DROP_SHADOW', color:{r:0,g:0,b:0,a:0.05}, offset:{x:0,y:4}, radius:12, spread:0, visible:true, blendMode:'NORMAL' }];
}
function shadowLg() {
  return [{ type:'DROP_SHADOW', color:{r:0,g:0,b:0,a:0.3}, offset:{x:0,y:20}, radius:40, spread:0, visible:true, blendMode:'NORMAL' }];
}

function sp(h) { var s=figma.createRectangle(); s.resize(1,h); s.fills=[]; s.name='sp'; return s; }
function dv(w) { var d=figma.createRectangle(); d.resize(w,1); d.fills=sf(C.border); return d; }

// ─── UI КОМПОНЕНТЫ ───────────────────────────────────────────

function mkBadge(label, bg, fg) {
  var f = mkFrame(1,1,{bg:bg,radius:20,layout:'HORIZONTAL',hug:true,padX:10,padY:4,align:'CENTER',justify:'CENTER'});
  f.appendChild(mkText(label,{size:12,color:fg,weight:500}));
  return f;
}

function mkBtn(label, type, w) {
  var bg = type==='primary' ? C.yellow : C.white;
  var fg = type==='secondary' ? C.white : ((type==='danger'||type==='btn-danger') ? C.red : C.black);
  var sc = type==='outline'||type==='btn-outline' ? C.border : (type==='danger'||type==='btn-danger' ? C.red : undefined);
  if (type==='secondary') bg = C.black;
  var f = mkFrame(w||1, 40, {bg:bg, radius:9999, layout:'HORIZONTAL', hug:!w, padX:20, padY:10, align:'CENTER', justify:'CENTER', strokeColor:sc});
  f.appendChild(mkText(label,{size:14,color:fg,weight:700}));
  return f;
}

function mkBtnSm(label, type, w) {
  var b = mkBtn(label, type, w || 1);
  b.resize(w || b.width, 31);
  b.paddingLeft = 14;
  b.paddingRight = 14;
  b.paddingTop = 6;
  b.paddingBottom = 6;
  b.children[0].fontSize = 12;
  return b;
}

function mkAvatar(ini, size) {
  size = size||40;
  var f = mkFrame(size,size,{bg:C.black,radius:size/2,layout:'HORIZONTAL',align:'CENTER',justify:'CENTER'});
  f.cornerRadius = size/2;
  f.appendChild(mkText(ini,{size:size>36?14:12,weight:600,color:C.white}));
  return f;
}

function mkLogoIcon(size) {
  size = size||36;
  var f = mkFrame(size,size,{bg:C.white,layout:'HORIZONTAL',align:'CENTER',justify:'CENTER',clip:false});
  var inner = Math.round(size * 0.8);
  var mark = mkFrame(inner,inner,{bg:C.yellow,layout:'HORIZONTAL',align:'CENTER',justify:'CENTER'});
  mark.appendChild(mkText('T',{size:size>40?32:21,weight:700,color:C.darkGray}));
  f.appendChild(mark);
  return f;
}

function mkLogoRow(title) {
  title = title || 'Система совместной работы';
  var row = mkFrame(1,40,{bg:C.white,layout:'HORIZONTAL',hug:true,gap:10,align:'CENTER'});
  row.appendChild(mkLogoIcon());
  row.appendChild(mkText(title,{size:20,weight:700}));
  return row;
}

function mkHeader(logoTitle, rightNode) {
  var h = mkFrame(1440,68,{bg:C.white,strokeColor:C.border,layout:'HORIZONTAL',padX:24,align:'CENTER',justify:'SPACE_BETWEEN',name:'Header'});
  h.primaryAxisSizingMode='FIXED'; h.counterAxisSizingMode='FIXED';
  h.effects = shadowMd();
  h.appendChild(mkLogoRow(logoTitle));
  h.appendChild(rightNode);
  return h;
}

function mkUserCorner() {
  var row = mkFrame(1,40,{bg:C.white,layout:'HORIZONTAL',hug:true,gap:16,align:'CENTER'});
  row.appendChild(mkText('Иван Петров',{size:13,color:C.gray}));
  row.appendChild(mkAvatar('ИП'));
  return row;
}

function mkProjectSelector() {
  var select = mkFrame(250,38,{bg:C.white,radius:10,strokeColor:C.border,layout:'HORIZONTAL',padX:14,padY:8,align:'CENTER',justify:'SPACE_BETWEEN'});
  select.appendChild(mkText('Выберите проект',{size:14,weight:600}));
  select.appendChild(mkText('▾',{size:12,color:C.black}));
  return select;
}

function mkHeaderCurrent(showProjectSelector) {
  var right = mkUserCorner();
  var left = mkFrame(1,40,{bg:C.white,layout:'HORIZONTAL',hug:true,gap:20,align:'CENTER'});
  left.appendChild(mkLogoRow('Система совместной работы'));
  if (showProjectSelector) left.appendChild(mkProjectSelector());

  var h = mkFrame(1440,68,{bg:C.white,strokeColor:C.border,layout:'HORIZONTAL',padX:24,align:'CENTER',justify:'SPACE_BETWEEN',name:'Header'});
  h.primaryAxisSizingMode='FIXED'; h.counterAxisSizingMode='FIXED';
  h.effects = shadowMd();
  h.appendChild(left);
  h.appendChild(right);
  return h;
}

function mkBreadcrumbs(labels, w) {
  var row = mkFrame(w || 1200,29,{bg:C.lightGray,layout:'HORIZONTAL',hug:false,gap:4,align:'CENTER'});
  row.primaryAxisSizingMode='FIXED'; row.counterAxisSizingMode='AUTO';
  for (var i=0;i<labels.length;i++) {
    if (i > 0) row.appendChild(mkText('/',{size:14,color:C.border}));
    row.appendChild(mkText(labels[i],{size:14,color:i===labels.length-1?C.black:C.gray,weight:i===labels.length-1?600:500}));
  }
  return row;
}

function mkField(label, placeholder, w, h) {
  var fg=mkFrame(w,h? h+25:67,{bg:C.white,layout:'VERTICAL',gap:6,justify:'MIN'});
  fg.primaryAxisSizingMode='FIXED'; fg.counterAxisSizingMode='AUTO';
  fg.appendChild(mkText(label,{size:13,weight:500,color:C.gray}));
  fg.appendChild(mkInput(placeholder,w,h || 42, false, 10));
  return fg;
}

function mkInput(ph, w, h, disabled, radius) {
  h = h||48;
  var bg = disabled ? C.lightGray : C.white;
  var f = mkFrame(w,h,{bg:bg,radius:radius || 12,strokeColor:C.border,layout:'HORIZONTAL',padX:16,padY:14,align:'CENTER'});
  f.appendChild(mkText(ph,{size:14,color:C.gray}));
  return f;
}

function mkVoteGroup(score, upActive, downActive) {
  var g = mkFrame(1,28,{bg:C.white,layout:'HORIZONTAL',hug:true,gap:4,align:'CENTER'});
  var up = mkFrame(28,28,{bg:upActive?C.green:C.white,radius:8,strokeColor:upActive?C.green:C.border,layout:'HORIZONTAL',align:'CENTER',justify:'CENTER'});
  up.appendChild(mkText('+',{size:16,weight:700,color:upActive?C.white:C.black}));
  var cnt = mkText(String(score),{size:14,weight:600}); cnt.textAutoResize='WIDTH_AND_HEIGHT';
  var dn = mkFrame(28,28,{bg:downActive?C.red:C.white,radius:8,strokeColor:downActive?C.red:C.border,layout:'HORIZONTAL',align:'CENTER',justify:'CENTER'});
  dn.appendChild(mkText('−',{size:16,weight:700,color:downActive?C.white:C.black}));
  g.appendChild(up); g.appendChild(cnt); g.appendChild(dn);
  return g;
}

// Табы (pill-style из CSS .tabs / .tab)
function mkTabs(labels, activeIdx) {
  var tabs = mkFrame(1,44,{bg:C.white,radius:40,strokeColor:C.border,layout:'HORIZONTAL',hug:true,pad:4,gap:4,align:'CENTER'});
  for (var i=0;i<labels.length;i++) {
    var tab = mkFrame(1,36,{bg:i===activeIdx?C.black:C.white,radius:30,layout:'HORIZONTAL',hug:true,padX:20,padY:10,align:'CENTER',justify:'CENTER'});
    tab.appendChild(mkText(labels[i],{size:14,color:i===activeIdx?C.white:C.black,weight:500}));
    tabs.appendChild(tab);
  }
  return tabs;
}

// Таблица с предложениями
function mkSuggestionsTable(w, rows) {
  var table = mkFrame(w,1,{bg:C.white,radius:12,strokeColor:C.border,layout:'VERTICAL',gap:0,name:'Table'});
  table.primaryAxisSizingMode='AUTO'; table.counterAxisSizingMode='FIXED';
  var colW=[w-540,180,120,170,150]; // Предложение, Автор, Голоса, Дата, Статус
  var colLabels=['Предложение','Автор','Голоса','Дата','Статус'];

  // Head
  var thead = mkFrame(w,48,{bg:C.lightGray,layout:'HORIZONTAL',padX:16,align:'CENTER'});
  thead.primaryAxisSizingMode='FIXED'; thead.counterAxisSizingMode='FIXED';
  thead.strokes=sf(C.border); thead.strokeWeight=1; thead.strokeAlign='INSIDE';
  for (var ci=0;ci<colLabels.length;ci++) {
    var hc = mkFrame(colW[ci],48,{bg:C.lightGray,layout:'HORIZONTAL',align:'CENTER'});
    hc.primaryAxisSizingMode='FIXED'; hc.counterAxisSizingMode='FIXED';
    hc.appendChild(mkText(colLabels[ci],{size:12,weight:600,color:C.gray}));
    thead.appendChild(hc);
  }
  table.appendChild(thead);

  var statusMap = {
    'Новые':       {bg:C.badgeNewBg,  fg:C.badgeNewFg},
    'В работе':    {bg:C.badgeProgBg, fg:C.badgeProgFg},
    'Принятые':    {bg:C.badgeAccBg,  fg:C.badgeAccFg},
    'Отклонённые': {bg:C.badgeRejBg,  fg:C.badgeRejFg},
  };

  for (var ri=0;ri<rows.length;ri++) {
    var row = rows[ri];
    var tr = mkFrame(w,72,{bg:C.white,layout:'HORIZONTAL',padX:16,align:'CENTER'});
    tr.primaryAxisSizingMode='FIXED'; tr.counterAxisSizingMode='FIXED';
    tr.strokes=sf(C.border); tr.strokeWeight=1; tr.strokeAlign='INSIDE';

    // Title cell
    var tc = mkFrame(colW[0],72,{bg:C.white,layout:'VERTICAL',padY:10,gap:4,justify:'CENTER'});
    tc.primaryAxisSizingMode='FIXED'; tc.counterAxisSizingMode='FIXED';
    tc.appendChild(mkText(row.title,{size:14,weight:600,wrap:colW[0]-8}));
    tc.appendChild(mkText('id: '+row.id,{size:12,color:C.gray}));
    tr.appendChild(tc);

    var ac = mkFrame(colW[1],72,{bg:C.white,layout:'HORIZONTAL',align:'CENTER'});
    ac.primaryAxisSizingMode='FIXED'; ac.counterAxisSizingMode='FIXED';
    ac.appendChild(mkText(row.author,{size:14}));
    tr.appendChild(ac);

    var sc = mkFrame(colW[2],72,{bg:C.white,layout:'HORIZONTAL',align:'CENTER'});
    sc.primaryAxisSizingMode='FIXED'; sc.counterAxisSizingMode='FIXED';
    sc.appendChild(mkVoteGroup(row.score,row.votedUp,row.votedDown));
    tr.appendChild(sc);

    var dc = mkFrame(colW[3],72,{bg:C.white,layout:'HORIZONTAL',align:'CENTER'});
    dc.primaryAxisSizingMode='FIXED'; dc.counterAxisSizingMode='FIXED';
    dc.appendChild(mkText(row.date,{size:14}));
    tr.appendChild(dc);

    var stc = mkFrame(colW[4],72,{bg:C.white,layout:'HORIZONTAL',align:'CENTER'});
    stc.primaryAxisSizingMode='FIXED'; stc.counterAxisSizingMode='FIXED';
    var ss = statusMap[row.status];
    stc.appendChild(mkBadge(row.status,ss.bg,ss.fg));
    tr.appendChild(stc);

    table.appendChild(tr);
  }
  return table;
}

var SUGGESTION_ROWS = [
  {title:'Добавить обязательный шаблон ретро перед встречей', id:'d68650b5...', author:'Иван Петров',    score:5, date:'09.04.2026, 12:10', status:'Новые',    votedUp:true},
  {title:'Автоматизировать деплой на тестовые стенды',        id:'e79761c6...', author:'Мария Сидорова', score:8, date:'08.04.2026, 18:25', status:'Новые',    votedDown:true},
  {title:'Внедрить практику парного программирования',         id:'f80872d7...', author:'Алексей Иванов', score:3, date:'07.04.2026, 10:40', status:'В работе'},
  {title:'Обновить документацию по API',                       id:'091983e8...', author:'Ольга Смирнова', score:2, date:'06.04.2026, 15:12', status:'Новые'},
  {title:'Настроить автоматическое форматирование кода',       id:'1a2b3c4d...', author:'Сергей Козлов',  score:6, date:'05.04.2026, 09:30', status:'Новые'},
];

// ────────────────────────────────────────────────────────────
// 1. LOGIN
// ────────────────────────────────────────────────────────────
function buildLogin() {
  var pg = mkFrame(1440,900,{name:'Login'});
  pg.fills=[{type:'GRADIENT_LINEAR',
    gradientStops:[
      {position:0,color:{r:C.black.r,   g:C.black.g,   b:C.black.b,   a:1}},
      {position:1,color:{r:C.darkGray.r,g:C.darkGray.g,b:C.darkGray.b,a:1}},
    ],
    gradientTransform:[[0.707,-0.707,0.5],[0.707,0.707,-0.207]],
    opacity:1,
  }];

  var card = mkFrame(440,100,{bg:C.white,radius:24,layout:'VERTICAL',hug:true,padX:40,padY:48,gap:0,align:'CENTER',justify:'MIN',name:'LoginCard'});
  card.primaryAxisSizingMode='AUTO'; card.counterAxisSizingMode='FIXED';
  card.effects = shadowLg();

  // Logo — из login.html: img внутри .login-logo (yellow bg, 64x64, radius 16)
  var logoWrap = mkFrame(64,64,{bg:C.yellow,radius:16,layout:'HORIZONTAL',align:'CENTER',justify:'CENTER'});
  logoWrap.appendChild(mkLogoIcon(48));
  card.appendChild(logoWrap);
  card.appendChild(sp(24));

  var t1 = mkText('Вход в систему',{size:24,weight:700}); t1.textAlignHorizontal='CENTER';
  var t2 = mkText('Управление идеями команды',{size:14,color:C.gray}); t2.textAlignHorizontal='CENTER';
  card.appendChild(t1); card.appendChild(sp(8)); card.appendChild(t2); card.appendChild(sp(32));

  // Email + Password
  card.appendChild(mkText('Email',{size:14,weight:500})); card.appendChild(sp(8));
  card.appendChild(mkInput('ivan.petrov@tbank.ru',360)); card.appendChild(sp(20));
  card.appendChild(mkText('Пароль',{size:14,weight:500})); card.appendChild(sp(8));
  card.appendChild(mkInput('••••••••',360)); card.appendChild(sp(24));

  var errorBox = mkFrame(360,40,{bg:{r:1,g:0.957,b:0.949},radius:8,strokeColor:{r:0.949,g:0.722,b:0.710},layout:'HORIZONTAL',padX:12,padY:10,align:'CENTER'});
  errorBox.appendChild(mkText('Неверный email или пароль',{size:14,weight:500,color:{r:0.702,g:0.149,b:0.118}}));
  card.appendChild(errorBox); card.appendChild(sp(16));

  var loginBtn = mkBtn('Войти','primary',360); loginBtn.resize(360,52);
  card.appendChild(loginBtn);

  pg.appendChild(card);
  card.x=(1440-440)/2; card.y=60;
  return pg;
}

// ────────────────────────────────────────────────────────────
// 2. PROJECTS
// ────────────────────────────────────────────────────────────
function buildProjects() {
  var pg = mkFrame(1440,780,{bg:C.lightGray,name:'Projects'});
  pg.appendChild(mkHeaderCurrent());

  var cx=(1440-1200)/2;
  var y=108;

  // ProjectListPage: h1 + button, без Breadcrumbs.
  var phRow = mkFrame(1200,44,{bg:C.lightGray,layout:'HORIZONTAL',align:'CENTER',justify:'SPACE_BETWEEN'});
  phRow.x=cx; phRow.y=y;
  phRow.appendChild(mkText('Мои проекты',{size:28,weight:700}));
  phRow.appendChild(mkBtn('Новый проект','primary'));
  pg.appendChild(phRow);
  y+=68;

  var divider = figma.createRectangle();
  divider.resize(1200,2);
  divider.fills = sf(C.border);
  divider.x = cx; divider.y = y;
  pg.appendChild(divider);
  y+=26;

  // Grid 3 карточки (auto-fill minmax 320px)
  var cardW=380; var gap=20;
  var projects=[
    {letter:'C', name:'Core Platform',  desc:'Проект команды Core Platform',    iconBg:C.badgeNewFg, iconFg:C.white, role:'Администратор', roleBg:C.badgeAdminBg, roleFg:C.badgeAdminFg, lastAccess:'09.04.2026'},
    {letter:'M', name:'Mobile App',     desc:'iOS / Android разработка',         iconBg:C.badgeNewFg, iconFg:C.white, role:'Участник',       roleBg:C.badgeMemBg, roleFg:C.badgeMemFg, lastAccess:'08.04.2026'},
    {letter:'S', name:'Support Tools',  desc:'Внутренние инструменты поддержки', iconBg:C.green,      iconFg:C.white, role:'Участник',       roleBg:C.badgeMemBg, roleFg:C.badgeMemFg, lastAccess:'07.04.2026'},
  ];

  for (var i=0;i<projects.length;i++) {
    var p=projects[i];
    var card=mkFrame(cardW,200,{bg:C.white,radius:12,strokeColor:C.border,layout:'VERTICAL',padX:24,padY:24,gap:0});
    card.effects=shadowMd();
    card.x=cx+i*(cardW+gap); card.y=y;

    // flex row: left (icon+text) | right (badge)
    var topRow=mkFrame(cardW-48,52,{bg:C.white,layout:'HORIZONTAL',justify:'SPACE_BETWEEN',align:'MIN'});
    var left=mkFrame(1,52,{bg:C.white,layout:'VERTICAL',hug:true,gap:0});
    left.primaryAxisSizingMode='AUTO'; left.counterAxisSizingMode='AUTO';
    var iconBox=mkFrame(48,48,{bg:p.iconBg,radius:12,layout:'HORIZONTAL',align:'CENTER',justify:'CENTER'});
    iconBox.appendChild(mkText(p.letter,{size:20,weight:900,color:p.iconFg}));
    left.appendChild(iconBox);
    topRow.appendChild(left);
    topRow.appendChild(mkBadge(p.role,p.roleBg,p.roleFg));
    card.appendChild(topRow);
    card.appendChild(sp(16));
    card.appendChild(mkText(p.name,{size:18,weight:600}));
    card.appendChild(sp(8));
    card.appendChild(mkText(p.desc,{size:14,color:C.gray}));
    card.appendChild(sp(20));
    card.appendChild(mkText('Последнее посещение: '+p.lastAccess,{size:12,color:C.gray}));
    pg.appendChild(card);
  }
  return pg;
}

// ────────────────────────────────────────────────────────────
// 3. BOARD
// ────────────────────────────────────────────────────────────
function buildBoard() {
  var pg = mkFrame(1440,900,{bg:C.lightGray,name:'ProjectPage'});
  pg.appendChild(mkHeaderCurrent(true));

  var cx=(1440-1200)/2;
  var y=98;

  var crumbs = mkBreadcrumbs(['Мои проекты','Core Platform'],1200);
  crumbs.x=cx; crumbs.y=y;
  pg.appendChild(crumbs);
  y+=32;

  // page-header: tabs | actions
  var phRow=mkFrame(1200,44,{bg:C.lightGray,layout:'HORIZONTAL',align:'CENTER',justify:'SPACE_BETWEEN'});
  phRow.x=cx; phRow.y=y;

  var tabs=mkTabs(['Все','Новые','В работе','Принятые','Отклонённые','Черновики'],1);

  var actions=mkFrame(1,40,{bg:C.lightGray,layout:'HORIZONTAL',hug:true,gap:16,align:'CENTER'});
  actions.appendChild(mkBtn('Участники','outline'));
  actions.appendChild(mkBtn('Настройки','outline'));
  actions.appendChild(mkBtn('Предложить идею','primary'));

  phRow.appendChild(tabs); phRow.appendChild(actions);
  pg.appendChild(phRow);
  y+=60;

  var quota=mkFrame(1200,48,{bg:{r:0.957,g:0.984,b:0.969},radius:10,strokeColor:{r:0.847,g:0.902,b:0.875},layout:'HORIZONTAL',padX:18,padY:14,align:'CENTER',justify:'SPACE_BETWEEN'});
  quota.x=cx; quota.y=y;
  quota.appendChild(mkText('Голоса: 2 из 3',{size:14,weight:600,color:{r:0.122,g:0.361,b:0.239}}));
  quota.appendChild(mkText('Сброс: 23.04.2026, 18:30',{size:14,weight:600,color:{r:0.122,g:0.361,b:0.239}}));
  pg.appendChild(quota);
  y+=72;

  var filters=mkFrame(1200,107,{bg:C.white,radius:12,strokeColor:C.border,layout:'HORIZONTAL',padX:20,padY:20,gap:16,align:'MIN'});
  filters.primaryAxisSizingMode='FIXED'; filters.counterAxisSizingMode='AUTO';
  filters.x=cx; filters.y=y;
  filters.appendChild(mkField('Поиск','Поиск по тексту...',445));
  filters.appendChild(mkField('Статус','Все статусы',222));
  filters.appendChild(mkField('Сортировка','По рейтингу',222));
  filters.appendChild(mkField('Порядок','По убыванию',222));
  pg.appendChild(filters);
  y+=131;

  var table=mkSuggestionsTable(1200,SUGGESTION_ROWS);
  table.x=cx; table.y=y;
  pg.appendChild(table);

  var pag=mkFrame(1200,36,{bg:C.lightGray,layout:'HORIZONTAL',gap:8,align:'CENTER',justify:'CENTER'});
  pag.x=cx; pag.y=y+table.height+24;
  var pagBtns=[{l:'←',dis:true},{l:'1',act:true},{l:'2'},{l:'→'}];
  for (var pi=0;pi<pagBtns.length;pi++) {
    var pb=pagBtns[pi];
    var btn=mkFrame(36,36,{bg:pb.act?C.black:C.white,radius:8,strokeColor:C.border,layout:'HORIZONTAL',align:'CENTER',justify:'CENTER'});
    btn.appendChild(mkText(pb.l,{size:14,weight:500,color:pb.act?C.white:(pb.dis?C.gray:C.black)}));
    pag.appendChild(btn);
  }
  pag.appendChild(mkText('  1-5 из 12',{size:14,color:C.gray}));
  pg.appendChild(pag);
  return pg;
}

// ────────────────────────────────────────────────────────────
// 5. SUGGESTION DETAIL
// ────────────────────────────────────────────────────────────
function buildSuggestionDetail() {
  var pg=mkFrame(1440,980,{bg:C.lightGray,name:'Suggestion Detail'});
  pg.appendChild(mkHeaderCurrent());

  var cx=(1440-1200)/2;
  var y=98;

  var crumbs=mkBreadcrumbs(['Мои проекты','Core Platform','Добавить обязательный шаблон ретро перед встречей'],1200);
  crumbs.x=cx; crumbs.y=y; pg.appendChild(crumbs);
  y+=49;

  var leftW=784; var rightW=392; var gap=24;

  // ── Левая колонка ──────────────────────────────────────────
  // card-header: h1 + select
  var mainCard=mkFrame(leftW,100,{bg:C.white,radius:12,strokeColor:C.border,layout:'VERTICAL',padX:24,padY:24,gap:0});
  mainCard.primaryAxisSizingMode='AUTO'; mainCard.counterAxisSizingMode='FIXED';
  mainCard.x=cx; mainCard.y=y; mainCard.effects=shadowMd();

  var cardHead=mkFrame(leftW-48,56,{bg:C.white,layout:'HORIZONTAL',justify:'SPACE_BETWEEN',align:'MIN'});
  cardHead.primaryAxisSizingMode='FIXED'; cardHead.counterAxisSizingMode='AUTO';
  var headLeft=mkFrame(1,56,{bg:C.white,layout:'VERTICAL',hug:true,gap:8,justify:'CENTER'});
  headLeft.primaryAxisSizingMode='AUTO'; headLeft.counterAxisSizingMode='AUTO';
  headLeft.appendChild(mkText('Добавить обязательный шаблон ретро перед встречей',{size:24,weight:700,wrap:470}));
  // meta row
  var metaRow=mkFrame(1,20,{bg:C.white,layout:'HORIZONTAL',hug:true,gap:16,align:'CENTER'});
  metaRow.appendChild(mkBadge('Новые',C.badgeNewBg,C.badgeNewFg));
  metaRow.appendChild(mkText('Автор: Иван Петров',{size:14,color:C.gray}));
  metaRow.appendChild(mkText('Создано: 09.04.2026',{size:14,color:C.gray}));
  headLeft.appendChild(metaRow);
  var headerActions = mkFrame(1,36,{bg:C.white,layout:'HORIZONTAL',hug:true,gap:10,align:'CENTER'});
  headerActions.appendChild(mkBtnSm('Редактировать','outline'));
  // status select
  var stSel=mkFrame(150,38,{bg:C.white,radius:12,strokeColor:C.border,layout:'HORIZONTAL',padX:16,align:'CENTER'});
  stSel.appendChild(mkText('Новые  ▾',{size:14}));
  headerActions.appendChild(stSel);
  cardHead.appendChild(headLeft); cardHead.appendChild(headerActions);
  mainCard.appendChild(cardHead); mainCard.appendChild(sp(24));

  // description-text
  var desc=mkFrame(leftW-48,90,{bg:C.lightGray,radius:12,layout:'VERTICAL',padX:16,padY:16,gap:0});
  desc.primaryAxisSizingMode='AUTO'; desc.counterAxisSizingMode='FIXED';
  desc.appendChild(mkText('Добавить обязательный шаблон ретро перед встречей. Это сократит время встречи и повысит предсказуемость. Предлагаю включить в шаблон: список достижений, проблем и action items.',{size:14,wrap:leftW-80}));
  mainCard.appendChild(desc); mainCard.appendChild(sp(24));

  mainCard.appendChild(mkText('id: d68650b5-dfc5-45be-b525-8b0c64c4e54a | updated: 09.04.2026',{size:12,color:C.gray}));
  pg.appendChild(mainCard);

  // Обсуждение card
  var commY=y+mainCard.height+20;
  var commCard=mkFrame(leftW,100,{bg:C.white,radius:12,strokeColor:C.border,layout:'VERTICAL',padX:24,padY:24,gap:0});
  commCard.primaryAxisSizingMode='AUTO'; commCard.counterAxisSizingMode='FIXED';
  commCard.x=cx; commCard.y=commY; commCard.effects=shadowMd();
  commCard.appendChild(mkText('Обсуждение (4)',{size:18,weight:700})); commCard.appendChild(sp(20));

  // textarea
  var ta=mkFrame(leftW-48,80,{bg:C.white,radius:12,strokeColor:C.border,layout:'VERTICAL',padX:16,padY:12});
  ta.appendChild(mkText('Оставьте комментарий...',{size:14,color:C.gray}));
  commCard.appendChild(ta); commCard.appendChild(sp(10));

  // comment-actions-row
  var car=mkFrame(leftW-48,36,{bg:C.white,layout:'HORIZONTAL',justify:'SPACE_BETWEEN',align:'CENTER'});
  car.primaryAxisSizingMode='FIXED'; car.counterAxisSizingMode='AUTO';
  car.appendChild(mkText('Черновик сохранён',{size:13,color:C.gray}));
  car.appendChild(mkBtn('Отправить','primary'));
  commCard.appendChild(car); commCard.appendChild(sp(24));

  // Comments с вложенностью
  var comments=[
    {ini:'ИП',name:'Иван Петров',   time:'09.04.2026',text:'Поддерживаю, это сократит время встречи.',  indent:0},
    {ini:'АС',name:'Анна Соколова', time:'09.04.2026',text:'Согласен, нужен еще шаблон action items.',  indent:1},
    {ini:'ИП',name:'Иван Петров',   time:'09.04.2026',text:'Хорошая идея, добавлю в предложение.',      indent:2},
    {ini:'ПО',name:'Пётр Орлов',    time:'09.04.2026',text:'А кто будет ответственным за внедрение?',   indent:0},
  ];
  for (var ci=0;ci<comments.length;ci++) {
    var c=comments[ci];
    var indentPx=c.indent*62; // comment-children: margin-left 42px + border 20px
    var cw=leftW-48-indentPx;
    var comm=mkFrame(cw,100,{bg:C.lightGray,radius:12,layout:'VERTICAL',padX:16,padY:16,gap:8});
    comm.primaryAxisSizingMode='AUTO'; comm.counterAxisSizingMode='FIXED';
    if (c.indent>0) comm.x=indentPx;

    var cHead=mkFrame(cw-32,32,{bg:C.lightGray,layout:'HORIZONTAL',gap:10,align:'CENTER'});
    cHead.primaryAxisSizingMode='AUTO'; cHead.counterAxisSizingMode='AUTO';
    cHead.appendChild(mkAvatar(c.ini,32));
    var cmeta=mkFrame(1,32,{bg:C.lightGray,layout:'VERTICAL',hug:true,gap:2,justify:'CENTER'});
    cmeta.appendChild(mkText(c.name,{size:14,weight:600}));
    cmeta.appendChild(mkText(c.time,{size:12,color:C.gray}));
    cHead.appendChild(cmeta);
    comm.appendChild(cHead);
    // comment-text: margin-left:42px — in Figma just place text with offset
    comm.appendChild(mkText(c.text,{size:14,wrap:cw-32}));
    var cacts=mkFrame(1,16,{bg:C.lightGray,layout:'HORIZONTAL',hug:true,gap:16,align:'CENTER'});
    var actLabels=['Ответить','Редактировать','Удалить'];
    for (var ai=0;ai<actLabels.length;ai++) { cacts.appendChild(mkText(actLabels[ai],{size:13,color:C.gray})); }
    comm.appendChild(cacts);
    commCard.appendChild(comm); commCard.appendChild(sp(12));
  }
  pg.appendChild(commCard);

  // ── Правая колонка ─────────────────────────────────────────
  var rx=cx+leftW+gap;

  // Vote card
  var voteCard=mkFrame(rightW,100,{bg:C.white,radius:12,strokeColor:C.border,layout:'VERTICAL',padX:24,padY:24,gap:0,align:'CENTER'});
  voteCard.primaryAxisSizingMode='AUTO'; voteCard.counterAxisSizingMode='FIXED';
  voteCard.x=rx; voteCard.y=y; voteCard.effects=shadowMd();
  voteCard.appendChild(mkText('Голосование',{size:18,weight:700})); voteCard.appendChild(sp(16));

  var quotaBox=mkFrame(rightW-48,70,{bg:{r:0.957,g:0.984,b:0.969},radius:10,strokeColor:C.settingsBr,layout:'VERTICAL',padX:14,padY:12,gap:6});
  quotaBox.appendChild(mkText('Доступно голосов: 2 из 3',{size:14,weight:600,color:{r:0.122,g:0.361,b:0.239}}));
  quotaBox.appendChild(mkText('Сброс: 23.04.2026, 18:30',{size:14,weight:600,color:{r:0.122,g:0.361,b:0.239}}));
  voteCard.appendChild(quotaBox); voteCard.appendChild(sp(20));

  // vote-panel: vote-btn 48x48, big-score, vote-btn
  var vPanel=mkFrame(rightW-48,48,{bg:C.white,layout:'HORIZONTAL',gap:20,justify:'CENTER',align:'CENTER'});
  vPanel.primaryAxisSizingMode='AUTO'; vPanel.counterAxisSizingMode='AUTO';
  var bigUp=mkFrame(48,48,{bg:C.green,radius:8,layout:'HORIZONTAL',align:'CENTER',justify:'CENTER'});
  bigUp.appendChild(mkText('+',{size:28,weight:700,color:C.white}));
  var scoreBox=mkFrame(1,48,{bg:C.white,layout:'VERTICAL',hug:true,gap:0,justify:'CENTER',align:'CENTER'});
  scoreBox.appendChild(mkText('5',{size:32,weight:700}));
  var bigDn=mkFrame(48,48,{bg:C.white,radius:8,strokeColor:C.border,layout:'HORIZONTAL',align:'CENTER',justify:'CENTER'});
  bigDn.appendChild(mkText('−',{size:28,weight:700}));
  vPanel.appendChild(bigUp); vPanel.appendChild(scoreBox); vPanel.appendChild(bigDn);
  voteCard.appendChild(vPanel); voteCard.appendChild(sp(16));

  var cancelBtn=mkBtn('Отменить голос','outline',rightW-48);
  cancelBtn.resize(rightW-48,44); voteCard.appendChild(cancelBtn); voteCard.appendChild(sp(16));

  // voters block
  var votersWrap=mkFrame(rightW-48,100,{bg:C.lightGray,radius:12,layout:'VERTICAL',padX:16,padY:16,gap:12});
  votersWrap.primaryAxisSizingMode='AUTO'; votersWrap.counterAxisSizingMode='FIXED';
  votersWrap.appendChild(mkText('Up (4)',{size:14,weight:700}));
  var upTags=mkFrame(rightW-80,28,{bg:C.lightGray,layout:'HORIZONTAL',hug:false,gap:8,align:'CENTER'});
  upTags.primaryAxisSizingMode='AUTO'; upTags.counterAxisSizingMode='AUTO';
  var upNames=['Иван Петров','Мария С.','Алексей И.','Ольга С.'];
  for (var ui=0;ui<upNames.length;ui++) {
    var tag=mkFrame(1,28,{bg:C.white,radius:20,layout:'HORIZONTAL',hug:true,padX:10,padY:4});
    tag.appendChild(mkText(upNames[ui],{size:13})); upTags.appendChild(tag);
  }
  votersWrap.appendChild(upTags);
  votersWrap.appendChild(mkText('Down (1)',{size:14,weight:700}));
  var dnTag=mkFrame(1,28,{bg:C.white,radius:20,layout:'HORIZONTAL',hug:true,padX:10,padY:4});
  dnTag.appendChild(mkText('Пётр Орлов',{size:13})); votersWrap.appendChild(dnTag);
  voteCard.appendChild(votersWrap);
  pg.appendChild(voteCard);

  // Actions card
  var actCard=mkFrame(rightW,100,{bg:C.white,radius:12,strokeColor:C.border,layout:'VERTICAL',padX:24,padY:24,gap:12});
  actCard.primaryAxisSizingMode='AUTO'; actCard.counterAxisSizingMode='FIXED';
  actCard.x=rx; actCard.y=y+voteCard.height+20; actCard.effects=shadowMd();
  actCard.appendChild(mkText('Действия',{size:14,weight:700}));
  var copyBtn=mkBtn('Копировать ссылку','outline',rightW-48); copyBtn.resize(rightW-48,44);
  actCard.appendChild(copyBtn);
  pg.appendChild(actCard);

  return pg;
}

function mkModalShell(title, width) {
  var modal=mkFrame(width,100,{bg:C.white,radius:16,layout:'VERTICAL',hug:true,clip:false,name:title});
  modal.primaryAxisSizingMode='AUTO'; modal.counterAxisSizingMode='FIXED';
  modal.effects=[{ type:'DROP_SHADOW', color:{r:0,g:0,b:0,a:0.2}, offset:{x:0,y:20}, radius:40, spread:0, visible:true, blendMode:'NORMAL' }];

  var header=mkFrame(width,65,{bg:C.white,layout:'HORIZONTAL',padX:24,padY:20,align:'CENTER',justify:'SPACE_BETWEEN'});
  header.appendChild(mkText(title,{size:18,weight:600}));
  var close=mkFrame(32,32,{bg:C.white,radius:8,layout:'HORIZONTAL',align:'CENTER',justify:'CENTER'});
  close.appendChild(mkText('×',{size:24,color:C.gray}));
  header.appendChild(close);
  modal.appendChild(header);
  modal.appendChild(dv(width));

  var content=mkFrame(width,1,{bg:C.white,layout:'VERTICAL',hug:true,padX:24,padY:24,gap:20});
  content.primaryAxisSizingMode='AUTO'; content.counterAxisSizingMode='FIXED';
  modal.appendChild(content);
  return {modal:modal, content:content};
}

function mkTextarea(text, w, h, muted) {
  var ta=mkFrame(w,h,{bg:C.white,radius:12,strokeColor:C.border,layout:'VERTICAL',padX:16,padY:14});
  ta.primaryAxisSizingMode='FIXED'; ta.counterAxisSizingMode='FIXED';
  ta.appendChild(mkText(text,{size:14,color:muted?C.gray:C.black,wrap:w-32}));
  return ta;
}

function withModalState(name, baseFn, modal, frameH) {
  var pg=baseFn();
  pg.name=name;
  if (frameH && pg.height !== frameH) pg.resize(1440, frameH);
  var overlay=mkFrame(1440,pg.height,{bg:C.black,name:'Modal overlay'});
  overlay.fills=[{type:'SOLID',color:C.black,opacity:0.5}];
  overlay.x=0; overlay.y=0;
  pg.appendChild(overlay);
  modal.x=(1440-modal.width)/2;
  modal.y=Math.max(40,(pg.height-modal.height)/2);
  pg.appendChild(modal);
  return pg;
}

// ────────────────────────────────────────────────────────────
// 6. NEW SUGGESTION — текущий Modal поверх ProjectPage
// ────────────────────────────────────────────────────────────
function buildNewSuggestion() {
  var m=mkModalShell('Новое предложение',700);
  var content=m.content;
  content.appendChild(mkText('Текст предложения',{size:14,weight:500}));
  content.appendChild(mkTextarea('Опишите ваше предложение по улучшению процесса...',652,120,true));

  var draftBox=mkFrame(652,44,{bg:C.draftInfoBg,radius:12,layout:'HORIZONTAL',padX:16,padY:12,align:'CENTER'});
  draftBox.appendChild(mkText('[*] Черновик сохраняется автоматически',{size:14,color:C.gray}));
  content.appendChild(draftBox);

  var formActs=mkFrame(652,40,{bg:C.white,layout:'HORIZONTAL',gap:12,justify:'MAX',align:'CENTER'});
  formActs.primaryAxisSizingMode='FIXED'; formActs.counterAxisSizingMode='AUTO';
  formActs.appendChild(mkBtn('Отмена','outline'));
  formActs.appendChild(mkBtn('Сохранить черновик','secondary'));
  formActs.appendChild(mkBtn('Опубликовать','primary'));
  content.appendChild(formActs);

  return withModalState('Modal - New Suggestion', buildBoard, m.modal, 900);
}

// ────────────────────────────────────────────────────────────
// 7. DRAFTS TAB
// ────────────────────────────────────────────────────────────
function buildDrafts() {
  var pg=mkFrame(1440,780,{bg:C.lightGray,name:'ProjectPage - Drafts Tab'});
  pg.appendChild(mkHeaderCurrent(true));

  var cx=(1440-1200)/2;
  var y=98;

  var crumbs=mkBreadcrumbs(['Мои проекты','Core Platform'],1200);
  crumbs.x=cx; crumbs.y=y; pg.appendChild(crumbs);
  y+=32;

  var phRow=mkFrame(1200,44,{bg:C.lightGray,layout:'HORIZONTAL',align:'CENTER',justify:'SPACE_BETWEEN'});
  phRow.x=cx; phRow.y=y;
  phRow.appendChild(mkTabs(['Все','Новые','В работе','Принятые','Отклонённые','Черновики'],5));
  pg.appendChild(phRow);
  y+=64;

  var table=mkFrame(1200,1,{bg:C.white,radius:12,strokeColor:C.border,layout:'VERTICAL',gap:0,name:'Drafts Table'});
  table.primaryAxisSizingMode='AUTO'; table.counterAxisSizingMode='FIXED';
  table.x=cx; table.y=y;
  var head=mkFrame(1200,48,{bg:C.lightGray,layout:'HORIZONTAL',padX:16,align:'CENTER'});
  head.primaryAxisSizingMode='FIXED'; head.counterAxisSizingMode='FIXED';
  [['Текст черновика',720],['Дата изменения',220],['Действия',220]].forEach(function(col){
    var hc=mkFrame(col[1],48,{bg:C.lightGray,layout:'HORIZONTAL',align:'CENTER'});
    hc.appendChild(mkText(col[0],{size:12,weight:600,color:C.gray}));
    head.appendChild(hc);
  });
  table.appendChild(head);

  var drafts=[
    {date:'18.05.2026', text:'Добавить чеклист подготовки к ретро-встрече'},
    {date:'17.05.2026', text:'Сделать единый формат описания инцидентов'},
  ];

  for (var di=0;di<drafts.length;di++) {
    var d=drafts[di];
    var tr=mkFrame(1200,72,{bg:C.white,layout:'HORIZONTAL',padX:16,align:'CENTER'});
    tr.primaryAxisSizingMode='FIXED'; tr.counterAxisSizingMode='FIXED';
    var c1=mkFrame(720,72,{bg:C.white,layout:'HORIZONTAL',align:'CENTER'}); c1.appendChild(mkText(d.text,{size:15,weight:600,wrap:680}));
    var c2=mkFrame(220,72,{bg:C.white,layout:'HORIZONTAL',align:'CENTER'}); c2.appendChild(mkText(d.date,{size:14}));
    var c3=mkFrame(220,72,{bg:C.white,layout:'HORIZONTAL',align:'CENTER',gap:8});
    c3.appendChild(mkBtnSm('Продолжить','primary')); c3.appendChild(mkBtnSm('Удалить','danger'));
    tr.appendChild(c1); tr.appendChild(c2); tr.appendChild(c3);
    table.appendChild(tr);
  }
  pg.appendChild(table);
  return pg;
}

// ────────────────────────────────────────────────────────────
// 8. PROJECT MEMBERS — текущий Modal поверх ProjectPage
// ────────────────────────────────────────────────────────────
function buildMembers() {
  var modalState=mkModalShell('Участники проекта',700);
  var content=modalState.content;

  var addSection=mkFrame(652,1,{bg:C.white,layout:'VERTICAL',hug:true,gap:16});
  addSection.appendChild(mkText('Добавить участника',{size:14,weight:700}));
  var addRow=mkFrame(652,98,{bg:C.white,layout:'HORIZONTAL',gap:12,align:'MIN'});
  addRow.primaryAxisSizingMode='FIXED'; addRow.counterAxisSizingMode='AUTO';
  var picker=mkFrame(388,98,{bg:C.white,layout:'VERTICAL',gap:8});
  picker.appendChild(mkInput('Поиск по имени или email...',388,42,false,12));
  picker.appendChild(mkInput('Выберите пользователя',388,42,false,12));
  picker.appendChild(mkText('Все найденные пользователи уже в проекте',{size:12,color:C.gray}));
  addRow.appendChild(picker);
  addRow.appendChild(mkInput('Участник',120,42,false,12));
  addRow.appendChild(mkBtn('Добавить','primary'));
  addSection.appendChild(addRow);
  content.appendChild(addSection);
  content.appendChild(dv(652));
  content.appendChild(mkText('Текущие участники (3)',{size:14,weight:700}));

  var members=[
    {ini:'ИП',name:'Иван Петров',    email:'ivan.petrov@example.local',   joined:'01.04.2026', role:'Администратор', roleBg:C.badgeAdminBg, roleFg:C.badgeAdminFg},
    {ini:'МС',name:'Мария Сидорова', email:'maria.sidorova@example.local', joined:'15.03.2026', role:'Участник',       roleBg:C.badgeMemBg, roleFg:C.badgeMemFg},
    {ini:'АС',name:'Анна Соколова',  email:'anna.sokolova@example.local',  joined:'09.04.2026', role:'Участник',       roleBg:C.badgeMemBg, roleFg:C.badgeMemFg},
  ];

  for (var mi=0;mi<members.length;mi++) {
    var member=members[mi];
    var mItem=mkFrame(652,80,{bg:C.lightGray,radius:12,layout:'HORIZONTAL',padX:16,padY:16,align:'CENTER',justify:'SPACE_BETWEEN'});
    mItem.primaryAxisSizingMode='FIXED'; mItem.counterAxisSizingMode='AUTO';

    var mInfo=mkFrame(1,48,{bg:C.lightGray,layout:'HORIZONTAL',hug:true,gap:12,align:'CENTER'});
    mInfo.primaryAxisSizingMode='AUTO'; mInfo.counterAxisSizingMode='AUTO';
    mInfo.appendChild(mkAvatar(member.ini,40));
    var mDets=mkFrame(1,48,{bg:C.lightGray,layout:'VERTICAL',hug:true,gap:3,justify:'CENTER'});
    mDets.primaryAxisSizingMode='AUTO'; mDets.counterAxisSizingMode='AUTO';
    mDets.appendChild(mkText(member.name,{size:14,weight:600}));
    mDets.appendChild(mkText(member.email,{size:13,color:C.gray}));
    mDets.appendChild(mkText('Присоединился: '+member.joined,{size:11,color:C.gray}));
    mInfo.appendChild(mDets);

    var mActs=mkFrame(1,40,{bg:C.lightGray,layout:'HORIZONTAL',hug:true,gap:12,align:'CENTER'});
    mActs.primaryAxisSizingMode='AUTO'; mActs.counterAxisSizingMode='AUTO';
    mActs.appendChild(mkBadge(member.role,member.roleBg,member.roleFg));
    mActs.appendChild(mkInput(member.role,100,36,false,8));
    var delBtn=mkFrame(32,32,{bg:C.white,radius:8,strokeColor:C.red,layout:'HORIZONTAL',align:'CENTER',justify:'CENTER'});
    delBtn.appendChild(mkText('X',{size:12,weight:700,color:C.red}));
    mActs.appendChild(delBtn);

    mItem.appendChild(mInfo); mItem.appendChild(mActs);
    content.appendChild(mItem);
  }

  return withModalState('Modal - Project Members', buildBoard, modalState.modal, 900);
}

// ────────────────────────────────────────────────────────────
// 9. SETTINGS — текущий Modal поверх ProjectPage
// ────────────────────────────────────────────────────────────
function buildSettings() {
  var modalState=mkModalShell('Настройки проекта',700);
  var content=modalState.content;

  content.appendChild(mkText('ID проекта',{size:14,weight:500}));
  content.appendChild(mkInput('7ca7d640-d843-45b2-9701-0b0efb8c4af1',652,48,true));
  content.appendChild(mkText('Название проекта',{size:14,weight:500}));
  content.appendChild(mkInput('Core Platform',652,48,false));
  content.appendChild(mkText('Описание',{size:14,weight:500}));
  content.appendChild(mkTextarea('Проект команды Core Platform',652,84));

  var settingsBlock=mkFrame(652,112,{bg:C.settingsBg,radius:12,strokeColor:C.settingsBr,layout:'HORIZONTAL',padX:16,padY:16,gap:20,align:'CENTER'});
  settingsBlock.primaryAxisSizingMode='FIXED'; settingsBlock.counterAxisSizingMode='AUTO';
  var votesField=mkFrame(300,80,{bg:C.settingsBg,layout:'VERTICAL',gap:8});
  votesField.appendChild(mkText('Лимит голосов',{size:14,weight:500}));
  votesField.appendChild(mkInput('3',300,48,false));
  var resetField=mkFrame(300,80,{bg:C.settingsBg,layout:'VERTICAL',gap:8});
  resetField.appendChild(mkText('Период сброса (дней)',{size:14,weight:500}));
  resetField.appendChild(mkInput('14',300,48,false));
  settingsBlock.appendChild(votesField); settingsBlock.appendChild(resetField);
  content.appendChild(settingsBlock);

  var formActs=mkFrame(652,40,{bg:C.white,layout:'HORIZONTAL',gap:12,justify:'MAX',align:'CENTER'});
  formActs.primaryAxisSizingMode='FIXED'; formActs.counterAxisSizingMode='AUTO';
  formActs.appendChild(mkBtn('Отмена','outline'));
  formActs.appendChild(mkBtn('Сохранить','primary'));
  content.appendChild(formActs);

  var danger=mkFrame(652,92,{bg:C.dangerBg,radius:12,strokeColor:C.dangerBr,layout:'HORIZONTAL',padX:16,padY:16,align:'CENTER',justify:'SPACE_BETWEEN'});
  danger.primaryAxisSizingMode='FIXED'; danger.counterAxisSizingMode='AUTO';
  var dangerCopy=mkFrame(420,60,{bg:C.dangerBg,layout:'VERTICAL',gap:6,justify:'CENTER'});
  dangerCopy.appendChild(mkText('Удаление проекта',{size:14,weight:700,color:C.dangerFg}));
  dangerCopy.appendChild(mkText('Проект будет удален для всех участников после подтверждения на сервере.',{size:13,color:{r:0.420,g:0.420,b:0.420},wrap:420}));
  danger.appendChild(dangerCopy);
  danger.appendChild(mkBtn('Удалить','danger'));
  content.appendChild(danger);

  return withModalState('Modal - Project Settings', buildBoard, modalState.modal, 900);
}

// ────────────────────────────────────────────────────────────
// 10. CREATE PROJECT — текущий Modal поверх Projects
// ────────────────────────────────────────────────────────────
function buildCreateProject() {
  var modalState=mkModalShell('Новый проект',500);
  var content=modalState.content;

  content.appendChild(mkText('Название',{size:14,weight:500}));
  content.appendChild(mkInput('Введите название проекта',452,48,false));
  content.appendChild(mkText('Описание',{size:14,weight:500}));
  content.appendChild(mkTextarea('Введите описание',452,112,true));

  var formActs=mkFrame(452,40,{bg:C.white,layout:'HORIZONTAL',gap:12,justify:'MAX',align:'CENTER'});
  formActs.primaryAxisSizingMode='FIXED'; formActs.counterAxisSizingMode='AUTO';
  formActs.appendChild(mkBtn('Отмена','outline'));
  formActs.appendChild(mkBtn('Создать','primary'));
  content.appendChild(formActs);

  return withModalState('Modal - Create Project', buildProjects, modalState.modal, 780);
}

// ────────────────────────────────────────────────────────────
// 11. PROFILE (profile.html)
// ────────────────────────────────────────────────────────────
function buildProfile() {
  var pg=mkFrame(1440,760,{bg:C.lightGray,name:'Profile'});
  pg.appendChild(mkHeaderCurrent());

  var cx=(1440-700)/2;
  var y=98;

  var crumbs=mkBreadcrumbs(['Мои проекты','Профиль'],700);
  crumbs.x=cx; crumbs.y=y; pg.appendChild(crumbs);
  y+=40;

  // Profile card
  var card=mkFrame(700,100,{bg:C.white,radius:12,strokeColor:C.border,layout:'VERTICAL',padX:24,padY:24,gap:0});
  card.primaryAxisSizingMode='AUTO'; card.counterAxisSizingMode='FIXED';
  card.x=cx; card.y=y; card.effects=shadowMd();

  // profile-header: avatar(80) + info
  var profHead=mkFrame(652,80,{bg:C.white,layout:'HORIZONTAL',gap:20,align:'CENTER'});
  profHead.primaryAxisSizingMode='AUTO'; profHead.counterAxisSizingMode='AUTO';
  var bigAv=mkFrame(80,80,{bg:C.black,radius:40,layout:'HORIZONTAL',align:'CENTER',justify:'CENTER'});
  bigAv.cornerRadius=40;
  bigAv.appendChild(mkText('ИП',{size:32,weight:600,color:C.white}));
  var pInfo=mkFrame(1,80,{bg:C.white,layout:'VERTICAL',hug:true,gap:4,justify:'CENTER'});
  pInfo.primaryAxisSizingMode='AUTO'; pInfo.counterAxisSizingMode='AUTO';
  pInfo.appendChild(mkText('Иван Петров',{size:24,weight:700}));
  pInfo.appendChild(mkText('ivan.petrov@example.local',{size:14,color:C.gray}));
  pInfo.appendChild(mkBadge('DevLogin',C.badgeNewBg,C.badgeNewFg));
  profHead.appendChild(bigAv); profHead.appendChild(pInfo);
  card.appendChild(profHead); card.appendChild(sp(24)); card.appendChild(dv(652)); card.appendChild(sp(16));

  // profile-details
  var details=[['User ID','3f11a6dc-79a6-43f7-ac88-bb78dd70d712'],['Auth Mode','DevLogin']];
  for (var di=0;di<details.length;di++) {
    var dr=mkFrame(652,20,{bg:C.white,layout:'HORIZONTAL',justify:'SPACE_BETWEEN',align:'CENTER'});
    dr.primaryAxisSizingMode='FIXED'; dr.counterAxisSizingMode='AUTO';
    dr.appendChild(mkText(details[di][0],{size:14,color:C.gray}));
    dr.appendChild(mkText(details[di][1],{size:14}));
    card.appendChild(dr); card.appendChild(sp(12));
  }
  pg.appendChild(card);
  y+=card.height+24;

  // Projects card
  var pCard=mkFrame(700,100,{bg:C.white,radius:12,strokeColor:C.border,layout:'VERTICAL',padX:24,padY:24,gap:0});
  pCard.primaryAxisSizingMode='AUTO'; pCard.counterAxisSizingMode='FIXED';
  pCard.x=cx; pCard.y=y; pCard.effects=shadowMd();
  pCard.appendChild(mkText('Мои проекты',{size:18,weight:700})); pCard.appendChild(sp(16));

  var myProjects=[
    {name:'Core Platform',  desc:'Проект команды Core Platform',    role:'Администратор', roleBg:C.badgeAdminBg, roleFg:C.badgeAdminFg},
    {name:'Mobile App',     desc:'iOS / Android разработка',         role:'Участник',       roleBg:C.badgeMemBg, roleFg:C.badgeMemFg},
    {name:'Support Tools',  desc:'Внутренние инструменты поддержки', role:'Участник',       roleBg:C.badgeMemBg, roleFg:C.badgeMemFg},
  ];
  for (var pi=0;pi<myProjects.length;pi++) {
    var p=myProjects[pi];
    var pRow=mkFrame(652,60,{bg:C.lightGray,radius:12,layout:'HORIZONTAL',padX:16,padY:12,align:'CENTER',justify:'SPACE_BETWEEN'});
    pRow.primaryAxisSizingMode='FIXED'; pRow.counterAxisSizingMode='AUTO';
    var pInf=mkFrame(1,36,{bg:C.lightGray,layout:'VERTICAL',hug:true,gap:4});
    pInf.primaryAxisSizingMode='AUTO'; pInf.counterAxisSizingMode='AUTO';
    pInf.appendChild(mkText(p.name,{size:14,weight:700}));
    pInf.appendChild(mkText(p.desc,{size:13,color:C.gray}));
    pRow.appendChild(pInf); pRow.appendChild(mkBadge(p.role,p.roleBg,p.roleFg));
    pCard.appendChild(pRow); pCard.appendChild(sp(12));
  }
  pg.appendChild(pCard);
  y+=pCard.height+24;

  var logoutBtn=mkBtn('Выйти','danger');
  logoutBtn.x=cx; logoutBtn.y=y;
  pg.appendChild(logoutBtn);
  return pg;
}

// ────────────────────────────────────────────────────────────
// USER FLOW — стрелки между экранами
// ────────────────────────────────────────────────────────────
function drawArrow(x1,y1,x2,y2,label) {
  var vec = figma.createVector();
  var dx=x2-x1, dy=y2-y1;
  var len=Math.sqrt(dx*dx+dy*dy);
  var ux=dx/len, uy=dy/len;
  // Стрелка чуть короче с обеих сторон
  var sx=x1+ux*10, sy=y1+uy*10;
  var ex=x2-ux*10, ey=y2-uy*10;
  // Перпендикуляр для наконечника
  var ax=-uy*10, ay=ux*10;

  vec.vectorPaths = [{
    windingRule:'NONE',
    data:'M '+sx+' '+sy+' L '+ex+' '+ey+
         ' M '+(ex-ux*14+ax)+' '+(ey-uy*14+ay)+' L '+ex+' '+ey+
         ' L '+(ex-ux*14-ax)+' '+(ey-uy*14-ay),
  }];
  vec.strokes=[{type:'SOLID',color:{r:0.098,g:0.463,b:0.824}}];
  vec.strokeWeight=2;
  vec.fills=[];
  vec.name='flow:'+label;

  // Label
  var lx=(sx+ex)/2; var ly=(sy+ey)/2;
  var lbl=mkText(label,{size:11,weight:500,color:{r:0.098,g:0.463,b:0.824}});
  var lb=mkFrame(1,20,{bg:{r:0.890,g:0.949,b:0.992},radius:4,layout:'HORIZONTAL',hug:true,padX:6,padY:2,align:'CENTER',justify:'CENTER'});
  lb.appendChild(lbl);
  lb.x=lx-40; lb.y=ly-10;

  return [vec, lb];
}

function buildUserFlow(layout) {
  // layout = array of {name, frame} with x,y positions
  // Returns array of nodes (vectors + labels)
  var nodes=[];
  // Map name → center {cx,cy}
  var map={};
  for (var i=0;i<layout.length;i++) {
    var f=layout[i].frame;
    map[layout[i].name]={cx:f.x+f.width/2, cy:f.y+f.height/2, f:f};
  }

  // Define flows: [from, to, label, fromEdge, toEdge]
  // Edges: 'right','left','bottom','top'
  var flows=[
    ['Login','Projects','Войти', 'right','left'],
    ['Projects','ProjectPage','Открыть проект','right','left'],
    ['Projects','Modal - Create Project','Новый проект','bottom','top'],
    ['ProjectPage','Suggestion Detail','Открыть идею','right','left'],
    ['ProjectPage','Modal - New Suggestion','Предложить идею','bottom','top'],
    ['ProjectPage','ProjectPage - Drafts Tab','Черновики','bottom','top'],
    ['ProjectPage','Modal - Project Members','Участники','bottom','top'],
    ['ProjectPage','Modal - Project Settings','Настройки','bottom','top'],
    ['Projects','Profile','Аватар → профиль','top','bottom'],
  ];

  function edgePoint(name, edge) {
    var f=map[name];
    if (!f) return null;
    if (edge==='right')  return {x:f.f.x+f.f.width, y:f.f.y+f.f.height/2};
    if (edge==='left')   return {x:f.f.x,             y:f.f.y+f.f.height/2};
    if (edge==='bottom') return {x:f.f.x+f.f.width/2, y:f.f.y+f.f.height};
    if (edge==='top')    return {x:f.f.x+f.f.width/2, y:f.f.y};
    return {x:f.cx,y:f.cy};
  }

  for (var fi=0;fi<flows.length;fi++) {
    var flow=flows[fi];
    var p1=edgePoint(flow[0],flow[3]);
    var p2=edgePoint(flow[1],flow[4]);
    if (!p1||!p2) continue;
    var arrowNodes=drawArrow(p1.x,p1.y,p2.x,p2.y,flow[2]);
    for (var n=0;n<arrowNodes.length;n++) nodes.push(arrowNodes[n]);
  }
  return nodes;
}

// ────────────────────────────────────────────────────────────
// MAIN
// ────────────────────────────────────────────────────────────
async function main() {
  await preloadFonts();

  // Row 1: главный flow (слева направо)
  var row1=[
    {name:'Login',              fn:buildLogin,            w:1440},
    {name:'Projects',           fn:buildProjects,         w:1440},
    {name:'ProjectPage',        fn:buildBoard,            w:1440},
    {name:'Suggestion Detail',  fn:buildSuggestionDetail, w:1440},
  ];

  // Row 2: состояния и модалки текущего приложения
  var row2=[
    {name:'ProjectPage - Drafts Tab', fn:buildDrafts,      w:1440},
    {name:'Modal - New Suggestion',   fn:buildNewSuggestion,w:1440},
    {name:'Modal - Project Members',  fn:buildMembers,     w:1440},
    {name:'Modal - Project Settings', fn:buildSettings,    w:1440},
    {name:'Modal - Create Project',   fn:buildCreateProject,w:1440},
    {name:'Profile',            fn:buildProfile,          w:1440},
  ];

  var gapX=200; var gapY=300;
  var allFrames=[];
  var layoutMap=[];

  // Build row 1
  var offsetX=0;
  for (var i=0;i<row1.length;i++) {
    var item=row1[i];
    var f=item.fn();
    f.name=item.name; f.x=offsetX; f.y=0;
    figma.currentPage.appendChild(f);
    allFrames.push(f);
    layoutMap.push({name:item.name, frame:f});
    offsetX+=f.width+gapX;
  }

  // Build row 2
  offsetX=0;
  var row1Height=900+gapY; // max height of row1
  for (var j=0;j<row2.length;j++) {
    var item2=row2[j];
    var f2=item2.fn();
    f2.name=item2.name; f2.x=offsetX; f2.y=row1Height;
    figma.currentPage.appendChild(f2);
    allFrames.push(f2);
    layoutMap.push({name:item2.name, frame:f2});
    offsetX+=f2.width+gapX;
  }

  // Draw user flow arrows
  var arrowNodes=buildUserFlow(layoutMap);
  for (var a=0;a<arrowNodes.length;a++) {
    figma.currentPage.appendChild(arrowNodes[a]);
    allFrames.push(arrowNodes[a]);
  }

  figma.currentPage.selection=allFrames;
  figma.viewport.scrollAndZoomIntoView(allFrames);
  figma.closePlugin('Collaboration System: актуальный макет + User Flow готовы!');
}

main();
