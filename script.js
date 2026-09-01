// ========================
// STATE
// ========================
let zIndexCounter = 100;
const openWindows = new Map();
let deletedWidgets = [];
let logoClickCount = 0;
let confirmCallback = null;

// ========================
// WITTY CLOSE MESSAGES
// ========================
const closeMessages = {
  profile: [
    { icon: '😢', title: 'Identity Crisis', msg: "You're deleting ME?! Your own creator?! That's cold.", yes: 'Goodbye', no: "I'm sorry!" },
    { icon: '🪦', title: 'RIP Me', msg: "So this is how it ends... deleted by my own portfolio.", yes: 'Rest in peace', no: 'You shall live' },
    { icon: '🥺', title: 'Please...', msg: "But who will the recruiters stare at now?", yes: 'Nobody', no: 'Fair point' }
  ],
  quote: [
    { icon: '📜', title: 'Wisdom Alert', msg: "You're deleting WISDOM? Steve Jobs is rolling in his grave.", yes: 'Sorry Steve', no: 'Okay okay' },
    { icon: '🤓', title: 'Are you sure?', msg: "These words have more depth than most conversations.", yes: 'Ouch, but yes', no: 'True...' },
    { icon: '💔', title: 'Heartbroken', msg: "This quote carried the entire intellectual weight of this website.", yes: 'Delete it', no: "You're right" }
  ],
  resume: [
    { icon: '🤡', title: 'Bold Move', msg: "Deleting your resume? That's a bold career move, Cotton.", yes: 'Unemployed!', no: 'I need a job' },
    { icon: '📄', title: 'Are you sure?', msg: "This PDF has more layers than your personality.", yes: 'Rude but yes', no: 'Save my PDF!' },
    { icon: '💼', title: 'Career Alert', msg: "HR called. They said don't do this.", yes: 'Fire me', no: 'Keep it!' }
  ],
  socials: [
    { icon: '🕶️', title: 'Going Dark', msg: "Going off the grid? Your Instagram misses you.", yes: "I'm a ghost", no: "Fine, I'll stay" },
    { icon: '📵', title: 'Antisocial Mode', msg: "Deleting all socials? What are you, a monk?", yes: 'Namaste', no: 'Lol no' },
    { icon: '👻', title: 'Vanishing Act', msg: "Nobody will ever find you. Is that the plan?", yes: 'Exactly', no: 'Maybe not' }
  ],
  contact: [
    { icon: '📵', title: 'Unreachable', msg: "So you DON'T want people to contact you? Bold introvert energy.", yes: 'Leave me alone', no: 'People can call' },
    { icon: '🏝️', title: 'Island Mode', msg: "Might as well move to a deserted island.", yes: 'Book my flight', no: 'I like WiFi' },
    { icon: '☎️', title: 'Last Call', msg: "Your mom called. She said keep this one.", yes: 'Sorry mom', no: 'Hi mom!' }
  ],
  turntable: [
    { icon: '📻', title: 'Kill the Vibe?', msg: "Silence November Rain? Are you sure you want to stop the music?", yes: 'Yes, shut it down', no: 'Keep rocking!' },
    { icon: '🎧', title: 'Party Pooper', msg: "Are you sure you want to stop the grooves? The vinyl will get lonely.", yes: 'Silent night', no: 'No, let it spin' },
    { icon: '⚡', title: 'Slash is crying', msg: "If you close this, Slash will stop his legendary guitar solo. You okay with that?", yes: 'Sorry Slash', no: 'Never!' }
  ]
};

const noResponses = [
  "Smart choice. I knew you loved me. 💕",
  "Phew! That was close. 😅",
  "Good. Don't scare me like that again.",
  "I'm not crying, you're crying. 🥲",
  "The widget lives another day!",
  "Plot armor activated. ✨",
  "Saved by the bell! 🔔",
  "You passed the vibe check. ✅"
];

const helpMessages = [
  "Help? In THIS economy? 😤",
  "Have you tried turning it off and on again?",
  "Error 404: Help not found.",
  "I'm a portfolio, not tech support. 🤷",
  "Help is just a fancy word for Stack Overflow.",
  "Try pressing Alt+F4. Trust me. 😈"
];

const funQuotes = [
  '"I didn\'t choose the pixel life, the pixel life chose me."',
  '"CSS is my love language. And also my enemy."',
  '"It works on my machine. Ship it."',
  '"Good design is like a fridge. When it works, nobody notices."',
  '"Figma crashed and took my dreams with it."'
];

// ========================
// TOAST NOTIFICATIONS
// ========================
function showToast(msg) {
  var container = document.getElementById('toast-container');
  if (!container) return;
  var toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(function() { toast.remove(); }, 3200);
}

// ========================
// CONFIRM DIALOG
// ========================
function showConfirm(icon, title, msg, yesText, noText, onYes) {
  var overlay = document.getElementById('confirm-overlay');
  if (!overlay) return;
  document.getElementById('confirm-icon').textContent = icon;
  document.getElementById('confirm-title').textContent = title;
  document.getElementById('confirm-msg').textContent = msg;
  document.getElementById('confirm-yes').textContent = yesText;
  document.getElementById('confirm-no').textContent = noText;
  confirmCallback = onYes;
  overlay.classList.add('show');
}

// ========================
// WIDGET CLOSE
// ========================
function tryCloseWidget(btn, widgetId) {
  var widget = btn.closest('.widget');
  var messages = closeMessages[widgetId];

  if (!messages) {
    showConfirm('🗑️', 'Delete Widget', 'Are you really sure about this?', 'Yep', 'Nah', function() {
      removeWidget(widget, widgetId);
    });
    return;
  }

  var msg = messages[Math.floor(Math.random() * messages.length)];
  showConfirm(msg.icon, msg.title, msg.msg, msg.yes, msg.no, function() {
    removeWidget(widget, widgetId);
  });
}

function removeWidget(widget, widgetId) {
  widget.classList.add('removing');
  deletedWidgets.push(widgetId);
  setTimeout(function() {
    widget.style.display = 'none';
    widget.classList.remove('removing');
    if (widgetId === 'turntable') {
      var audio = document.getElementById('audio-player');
      if (audio) {
        audio.pause();
        if (typeof setPlayState === 'function') setPlayState(false);
      }
      // closing it counts as "don't show me this again"
      if (typeof setTurntableDismissed === 'function') setTurntableDismissed(true);
    }
    showToast("💀 " + widgetId.charAt(0).toUpperCase() + widgetId.slice(1) + " sent to the shadow realm.");
  }, 350);
}

// ========================
// RESTORE WIDGET
// ========================
function restoreWidget(widgetId) {
  var widget = document.querySelector('[data-widget-id="' + widgetId + '"]');
  if (widget) {
    widget.style.display = (widgetId === 'turntable') ? 'block' : 'flex';
    deletedWidgets = deletedWidgets.filter(function(w) { return w !== widgetId; });
    showToast("🧟 " + widgetId.charAt(0).toUpperCase() + widgetId.slice(1) + " rose from the dead!");
    if (openWindows.has('bin')) {
      closeApp('bin');
      setTimeout(function() { openApp('bin'); }, 250);
    }
  }
}

// ========================
// CLOCK
// ========================
function updateClock() {
  var clockElement = document.getElementById('clock');
  if (!clockElement) return;
  var now = new Date();
  var hours = now.getHours();
  var ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  var minutes = now.getMinutes();
  minutes = minutes < 10 ? '0' + minutes : minutes;
  clockElement.textContent = hours + ':' + minutes + ' ' + ampm;
}
setInterval(updateClock, 1000);
updateClock();

// ========================
// APP DATA
// ========================
// Three of the app projects ship without a screenshot. Fading the broken image
// to zero left a black hole in the chassis; a dithered CRT screen at least
// reads as a switched-on machine.
function markScreenBlank(img) {
  var bezel = img.parentNode;
  if (bezel) bezel.classList.add('mac-screen-blank');
  img.remove();
}

var appData = {
  projects: {
    title: 'C:\\Projects',
    content: (function() {
      var projs = [
        { title: 'Ecowell.exe',     domain: 'ecowellonline.com',       url: 'https://www.ecowellonline.com/', meta: '2024-26 \u00b7 active', img: 'ecowell.webp' },
        { title: 'Naata.exe',       domain: 'naata.in',                url: 'https://naata.in/', meta: '2025 \u00b7 active', img: 'naata.webp' },
        { title: 'Goodwyn.exe',     domain: 'goodwyntea.com',          url: 'https://goodwyntea.com/', meta: '2025 \u00b7 active', img: 'goodwyn.webp' },
        { title: 'RailwayHSS.exe',  domain: 'railwayhsschoolapdj.com', url: 'https://railwayhsschoolapdj.com/', meta: '2022 \u00b7 active', img: 'railwayhss.webp' },
        { title: 'Haatak.exe',      domain: 'haatak.com',              url: 'https://www.haatak.com/', meta: '2025 \u00b7 active', img: 'haatak.webp' },
        { title: 'AiFalcon.exe',    domain: 'Figma Design',            url: 'https://www.figma.com/design/j3qyMf8jQIMELdLtRaaOD5/AiFalcon?node-id=1489-13761&t=oQY08AMw9mMwcnn2-1', meta: '2023-24 \u00b7 active', img: 'aifalcon.webp' },
        { title: 'Mechapixel.exe',  domain: 'mechapixel.in',           url: 'https://www.mechapixel.in/', meta: '2025 \u00b7 active', img: 'mechapixel.webp' },
        { title: 'Educircle.exe',   domain: 'educircle.co',            url: 'https://www.educircle.co/', meta: '2025 \u00b7 active', img: 'educircle.webp' },
        { title: 'HaatakApp.apk',   domain: 'Mobile app',              url: '', meta: '2025 \u00b7 active', img: 'haatakapp.webp' },
        { title: 'AutoQuote.apk',   domain: 'Mobile app',              url: '', meta: '2025 \u00b7 active', img: 'autoquote.webp' },
        { title: 'Ayla.exe',        domain: 'Mobile app',              url: '', meta: '2024-25 \u00b7 active', img: 'ayla.webp' }
      ];
      var html = '<div class="app-grid mac-grid">';
      projs.forEach(function(p) {
        var clickAttr = p.url ? ' onclick="window.open(\'' + p.url + '\', \'_blank\')"' : '';
        // Title, domain and status now live inside the chassis so each
        // card reads as one object instead of art with a caption below.
        html += '<div class="project-wrapper"' + clickAttr + '>' +
          '<div class="project-mac-chassis">' +
            '<div class="mac-screen-bezel">' +
              '<img class="mac-screen-content" src="assets/portfolio/' + p.img + '" alt="' + p.title + '" loading="lazy" decoding="async" onerror="markScreenBlank(this)" />' +
            '</div>' +
            '<div class="mac-body">' +
              '<h4 class="mac-title">' + p.title + '</h4>' +
              '<p class="mac-domain">' + p.domain + '</p>' +
            '</div>' +
            '<div class="mac-footer">' +
              '<span class="mac-rainbow"></span>' +
              '<span class="mac-footer-right">' +
                '<span class="mac-status">' + p.meta + '</span>' +
                '<span class="mac-bar"></span>' +
              '</span>' +
            '</div>' +
          '</div>' +
        '</div>';
      });
      html += '</div>';
      return html;
    })()
  },
  casestudies: {
    title: 'C:\\Case_Studies',
    content: '<div class="app-grid">' +
      '<div class="project-card" onclick="window.open(\'./ecowell-case-study-web/index.html\', \'_blank\')" style="cursor: pointer; border: 2px solid var(--accent); display: flex; flex-direction: column;">' +
        '<div style="width: 100%; height: 140px; background: #000; border: 2px inset #fff; margin-bottom: 12px; position: relative; overflow: hidden; padding: 2px;">' +
          '<div style="width: 100%; height: 100%; border: 2px solid #555; overflow: hidden;">' +
            '<img src="assets/portfolio/ecowell.webp" style="width: 100%; height: 100%; object-fit: cover; filter: contrast(1.2) grayscale(0.2);" alt="Ecowell Preview" onerror="this.style.opacity=0;">' +
          '</div>' +
        '</div>' +
        '<h4>Ecowell.exe</h4><p style="flex: 1;">Comprehensive multi-category branding, packaging & e-commerce case study.</p>' +
      '</div>' +
      '<div class="project-card" style="display: flex; flex-direction: column;">' +
        '<div style="width: 100%; height: 140px; background: #000; border: 2px inset #fff; margin-bottom: 12px; position: relative; overflow: hidden; padding: 2px;">' +
          '<div style="width: 100%; height: 100%; border: 2px solid #555; display: flex; align-items: center; justify-content: center; background: #c0c0c0;">' +
            '<i data-lucide="line-chart" style="width: 48px; height: 48px; color: #555;"></i>' +
          '</div>' +
        '</div>' +
        '<h4>CRO.doc</h4><p style="flex: 1;">Conversion Rate Optimization — 40% improvement in engagement.</p>' +
      '</div>' +
      '<div class="project-card" style="display: flex; flex-direction: column;">' +
        '<div style="width: 100%; height: 140px; background: #000; border: 2px inset #fff; margin-bottom: 12px; position: relative; overflow: hidden; padding: 2px;">' +
          '<div style="width: 100%; height: 100%; border: 2px solid #555; display: flex; align-items: center; justify-content: center; background: #c0c0c0;">' +
            '<i data-lucide="heart-pulse" style="width: 48px; height: 48px; color: #555;"></i>' +
          '</div>' +
        '</div>' +
        '<h4>MedData.doc</h4><p style="flex: 1;">Medical Data Visualization UX flows.</p>' +
      '</div>' +
      '</div>'
  },
  creatives: {
    title: 'Gallery — Selected Work',
    getContent: function() { return getGalleryContent(); }
  },
  mystory: {
    title: 'Notepad - mystory.txt',
    content: '<div style="font-family: Courier New, Courier, monospace; line-height: 1.6; font-size: 16px;">' +
      '<span style="color: #808080;">C:\\Users\\Subhranil> type mystory.txt</span><br><br>' +
      'Hello, I\'m Subhranil. 👋<br><br>' +
      'I am a Data-driven Product & Brand Designer with an engineering foundation, specializing in end-to-end user journey mapping and conversion rate optimization.<br><br>' +
      'Currently, I am the Design Lead at Ecowell Health & Beauty Pvt. Ltd., where I lead creative strategy and execution across 3 consumer brands.<br><br>' +
      '<span style="color: #808080;">C:\\Users\\Subhranil> _</span></div>'
  },
  skills: {
    title: 'Skills.exe',
    content: '<div style="font-family: Courier New, Courier, monospace; font-size: 14px; line-height: 2;">' +
      '<span style="color: #808080;">Loading skills from brain.dll...</span><br><br>' +
      '<span style="color: green;">██████████████████████</span> Interaction Design — 95%<br>' +
      '<span style="color: green;">████████████████████</span>&nbsp; Visual Design — 90%<br>' +
      '<span style="color: green;">██████████████████</span>&nbsp;&nbsp;&nbsp; Figma — 88%<br>' +
      '<span style="color: green;">████████████████████</span>&nbsp; Usability Testing — 90%<br>' +
      '<span style="color: green;">█████████████████</span>&nbsp;&nbsp;&nbsp;&nbsp; CRO & A/B Testing — 85%<br>' +
      '<span style="color: green;">██████████████████</span>&nbsp;&nbsp;&nbsp; HTML/CSS/JS — 87%<br><br>' +
      '<span style="color: #808080;">Skills loaded successfully. No bugs found. 🐛</span></div>'
  },
  contact: {
    title: 'Address Book v2.0',
    content: '<div style="text-align:center; padding: 40px;">' +
      '<div style="font-size: 48px; margin-bottom: 16px;">📬</div>' +
      '<h3 style="font-family: VT323, monospace; font-size: 28px; margin-bottom: 12px;">You\'ve got mail! (Kind of)</h3>' +
      '<p style="margin-bottom: 20px; color: #808080;">Click below to send a pigeon. Or an email.</p>' +
      '<a href="mailto:subhranilmaityofficial@gmail.com" class="flat-btn" style="margin-right: 12px;">📧 Email</a>' +
      '<a href="tel:+919547333361" class="flat-btn">📞 Call</a></div>'
  },
  socialcreatives: {
    title: 'Social Creatives',
    getContent: function() { return getSocialsContent(); }
  },
  resume: {
    title: 'Acrobat - Resume.pdf',
    content: '<div style="display:flex; flex-direction:column; height:100%; gap:10px;">' +
      '<iframe src="assets/resume.pdf#view=FitH" title="Subhranil Maity — Resume" ' +
      'style="flex:1; width:100%; border: 3px solid #000; background: white;"></iframe>' +
      '<div class="contact-actions" style="flex:0 0 auto; margin:0;">' +
      '<a href="assets/resume.pdf" download class="flat-btn">Download PDF</a>' +
      '<a href="assets/resume.pdf" target="_blank" rel="noopener" class="flat-btn">Open in new tab</a>' +
      '</div></div>'
  },
  bin: {
    title: 'Recycle Bin',
    getContent: function() {
      if (deletedWidgets.length === 0) {
        return '<div style="text-align:center; padding: 40px; font-family: VT323, monospace; font-size: 24px;">' +
          '<div style="font-size: 64px; margin-bottom: 16px;">🗑️</div>' +
          '<p>Bin is empty.</p>' +
          '<p style="font-size: 16px; margin-top: 8px; color: #808080;">Try deleting some widgets. I dare you.</p></div>';
      }
      var items = '';
      for (var i = 0; i < deletedWidgets.length; i++) {
        var w = deletedWidgets[i];
        items += '<div class="project-card" onclick="restoreWidget(\'' + w + '\')">' +
          '<h4>🔄 ' + w + '.exe</h4>' +
          '<p>Click to restore from the dead.</p></div>';
      }
      return '<p style="font-family: VT323, monospace; font-size: 20px; margin-bottom: 16px;">☠️ The Graveyard — Click to resurrect:</p>' +
        '<div class="app-grid">' + items + '</div>';
    }
  }
};

// ========================
// WINDOW MANAGEMENT
// ========================
// The dock floats at z-index 10000, so any window sized to the full viewport
// loses its last ~90px underneath it. Every window that opens large measures
// the dock instead of guessing a magic offset.
function desktopWindowBox(maxW, maxH) {
  var top = 44;
  var dock = document.getElementById('dock-container');
  var floor = dock ? dock.getBoundingClientRect().top - 12 : window.innerHeight - 130;
  var h = Math.max(320, Math.min(maxH, floor - top));
  var w = Math.min(maxW, window.innerWidth - 80);
  // Centre vertically, but never so low that the bottom slides under the dock.
  var y = Math.min(Math.round((window.innerHeight - h) / 2), floor - h);
  return {
    w: w,
    h: h,
    left: Math.max(20, Math.round((window.innerWidth - w) / 2)),
    top: Math.max(top, y)
  };
}

function openApp(appId) {
  if (openWindows.has(appId)) {
    bringToFront(openWindows.get(appId));
    return;
  }
  var app = appData[appId];
  if (!app) return;
  var content = app.getContent ? app.getContent() : app.content;
  createWindow(appId, app.title, content);

  // The gallery is the main event: browsing 400+ pieces in a 720px box meant
  // three tiles a row. Open it as wide as the desktop allows.
  if (appId === 'creatives') {
    var win = document.getElementById('window-creatives');
    if (win && window.innerWidth > 900) {
      var gb = desktopWindowBox(1180, 860);
      win.style.width = gb.w + 'px';
      win.style.height = gb.h + 'px';
      win.style.left = gb.left + 'px';
      win.style.top = gb.top + 'px';
    }
    initGallery();
  }

  // Projects is a horizontal shelf of cards, so the default 500px window
  // showed barely two. Open it wide and centred.
  if (appId === 'projects') {
    var pwin = document.getElementById('window-projects');
    if (pwin && window.innerWidth > 900) {
      // Height hugs a single row of cards (~361px of content) — a taller
      // window just left dead white space under the shelf.
      var pb = desktopWindowBox(1180, 392);
      pwin.style.width = pb.w + 'px';
      pwin.style.height = pb.h + 'px';
      pwin.style.left = pb.left + 'px';
      pwin.style.top = pb.top + 'px';
    }
  }

  if (appId === 'socialcreatives') {
    var swin = document.getElementById('window-socialcreatives');
    if (swin && window.innerWidth > 900) {
      var sb = desktopWindowBox(1060, 860);
      swin.style.width = sb.w + 'px';
      swin.style.height = sb.h + 'px';
      swin.style.left = sb.left + 'px';
      swin.style.top = sb.top + 'px';
    }
    // manifest may not have landed yet on a cold load
    if (socialAlbums.length) initSocialGallery();
    else loadSocialCreatives().then(initSocialGallery);
  }

  // The resume is meant to be READ by a recruiter, so open it large and
  // centred. Width matters most: the PDF is embedded with #view=FitH, so
  // a wider window renders the page bigger and more legible.
  if (appId === 'resume') {
    var rwin = document.getElementById('window-resume');
    if (rwin && window.innerWidth > 900) {
      var rb = desktopWindowBox(1120, 940);
      rwin.style.width = rb.w + 'px';
      rwin.style.height = rb.h + 'px';
      rwin.style.left = rb.left + 'px';
      rwin.style.top = rb.top + 'px';
      bringToFront(rwin);
    }
  }
  
  if (window.lucide) {
    lucide.createIcons();
  }
}

function closeApp(appId) {
  if (openWindows.has(appId)) {
    var win = openWindows.get(appId);
    win.remove();
    openWindows.delete(appId);
    var dockItem = document.querySelector('.dock-item[data-app="' + appId + '"]');
    if (dockItem) dockItem.classList.remove('active');
  }
}

function bringToFront(winElement) {
  zIndexCounter++;
  winElement.style.zIndex = zIndexCounter;
}

function toggleMaximize(id) {
  var win = document.getElementById('window-' + id);
  if (!win) return;
  
  var iconSpan = win.querySelector('.max-btn-icon');
  
  if (win.classList.contains('maximized')) {
    win.classList.remove('maximized');
    win.style.width = win.dataset.origWidth || '';
    win.style.height = win.dataset.origHeight || '';
    win.style.top = win.dataset.origTop || '';
    win.style.left = win.dataset.origLeft || '';
    if (iconSpan) iconSpan.innerText = '[ ]';
  } else {
    win.dataset.origWidth = win.style.width;
    win.dataset.origHeight = win.style.height;
    win.dataset.origTop = win.style.top;
    win.dataset.origLeft = win.style.left;
    win.classList.add('maximized');
    win.style.width = 'calc(100% - 10px)';
    win.style.height = 'calc(100% - 120px)';
    win.style.top = '30px';
    win.style.left = '5px';
    if (iconSpan) iconSpan.innerText = '[-]';
    bringToFront(win);
  }
}

function createWindow(id, title, contentHTML) {
  var container = document.getElementById('windows-container');
  if (!container) return;

  var win = document.createElement('div');
  win.className = 'app-window retro-box';
  win.id = 'window-' + id;

  var offset = (openWindows.size % 5) * 30;
  var isMobile = window.innerWidth <= 900;

  if (isMobile) {
    // Full-screen sheet: geometry comes from CSS so there are no inline
    // values to fight with on rotate or resize.
  } else {
    win.style.top = (60 + offset) + 'px';
    win.style.left = (280 + offset) + 'px';
  }

  win.innerHTML = '<div class="window-header">' +
    '<div class="window-title">' + title + '</div>' +
    '<div class="window-controls">' +
    '<button class="win-btn" style="font-size:14px;" onclick="toggleMaximize(\'' + id + '\')">' +
    '<span class="max-btn-icon" style="font-weight:900;">[ ]</span></button>' +
    '<button class="win-btn" style="font-size:14px;" onclick="closeApp(\'' + id + '\')">' +
    '<span style="font-weight:900;">X</span></button>' +
    '</div></div>' +
    '<div class="window-content">' + contentHTML + '</div>';

  container.appendChild(win);
  openWindows.set(id, win);

  var dockItem = document.querySelector('.dock-item[data-app="' + id + '"]');
  if (dockItem) dockItem.classList.add('active');

  bringToFront(win);

  win.addEventListener('mousedown', function() { bringToFront(win); });
  win.addEventListener('touchstart', function() { bringToFront(win); }, { passive: true });
  // Dragging a full-screen sheet does nothing except fight the scroll
  if (!isMobile) {
    makeDraggable(win, win.querySelector('.window-header'));
  }
}

function makeDraggable(element, handle) {
  var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

  handle.onmousedown = function(e) {
    e.preventDefault();
    bringToFront(element);
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDrag;
    document.onmousemove = function(ev) {
      ev.preventDefault();
      pos1 = pos3 - ev.clientX;
      pos2 = pos4 - ev.clientY;
      pos3 = ev.clientX;
      pos4 = ev.clientY;
      element.style.top = (element.offsetTop - pos2) + 'px';
      element.style.left = (element.offsetLeft - pos1) + 'px';
    };
  };

  handle.ontouchstart = function(e) {
    bringToFront(element);
    pos3 = e.touches[0].clientX;
    pos4 = e.touches[0].clientY;
    document.ontouchend = closeDrag;
    document.ontouchmove = function(ev) {
      pos1 = pos3 - ev.touches[0].clientX;
      pos2 = pos4 - ev.touches[0].clientY;
      pos3 = ev.touches[0].clientX;
      pos4 = ev.touches[0].clientY;
      element.style.top = (element.offsetTop - pos2) + 'px';
      element.style.left = (element.offsetLeft - pos1) + 'px';
    };
  };

  function closeDrag() {
    document.onmouseup = null;
    document.onmousemove = null;
    document.ontouchend = null;
    document.ontouchmove = null;
  }
}

// ========================
// INIT — runs after DOM is ready
// ========================
document.addEventListener('DOMContentLoaded', function() {
  // Premium Retro Boot Sequence
  const bootScreen = document.getElementById('boot-screen');
  const bootProgress = document.getElementById('boot-progress');
  const bootTime = document.getElementById('boot-time');
  
  if (bootScreen && bootProgress) {
    // Set Time and Date
    if (bootTime) {
      const now = new Date();
      bootTime.innerText = now.toLocaleTimeString('en-US', { hour12: true }) + " | " + now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const yearEl = document.getElementById('boot-year');
      if (yearEl) yearEl.innerText = "*" + now.getFullYear();
    }

    let progress = 0;
    let isPageLoaded = false;
    
    window.addEventListener('load', () => {
      isPageLoaded = true;
    });
    
    function updateProgress() {
      if (isPageLoaded) {
        progress = 100;
      } else {
        // Add random chunks to progress (10% to 25%)
        progress += Math.floor(Math.random() * 15) + 10;
        if (progress > 90) progress = 90; // Cap at 90% until fully loaded
      }
      
      if (progress >= 100) {
        bootProgress.style.width = '100%';
        
        setTimeout(() => {
          bootScreen.classList.add('hidden');
          setTimeout(() => {
            bootScreen.style.display = 'none';
            // greet desktop visitors with the turntable already open
            if (typeof autoOpenTurntable === 'function') autoOpenTurntable();
          }, 800); // Wait for CSS transition (0.8s)
        }, 300); // Small pause at 100%
      } else {
        bootProgress.style.width = progress + '%';
        // If capped at 90%, check again slightly slower
        let delay = (progress === 90) ? 200 : Math.floor(Math.random() * 70) + 30;
        setTimeout(updateProgress, delay);
      }
    }

    // Start boot sequence slightly after page load for effect
    setTimeout(updateProgress, 200);
  }

  // Confirm dialog buttons
  var yesBtn = document.getElementById('confirm-yes');
  var noBtn = document.getElementById('confirm-no');
  var overlay = document.getElementById('confirm-overlay');

  if (yesBtn) {
    yesBtn.addEventListener('click', function() {
      overlay.classList.remove('show');
      playSound('death');
      if (confirmCallback) confirmCallback();
      confirmCallback = null;
    });
  }

  if (noBtn) {
    noBtn.addEventListener('click', function() {
      overlay.classList.remove('show');
      showToast(noResponses[Math.floor(Math.random() * noResponses.length)]);
      confirmCallback = null;
    });
  }

  // Easter Egg 1: Logo clicks
  var logoBtn = document.getElementById('logo-btn');
  if (logoBtn) {
    logoBtn.addEventListener('click', function() {
      logoClickCount++;
      if (logoClickCount === 3) {
        showToast("🤔 You're clicking me a lot...");
      } else if (logoClickCount === 5) {
        showToast("👀 Okay you found nothing. Stop it.");
      } else if (logoClickCount === 7) {
        showToast("🎉 Secret: Built with pure HTML, CSS & JS. No frameworks harmed.");
      } else if (logoClickCount === 10) {
        showToast("🐐 You legend. 10 clicks. Go touch grass.");
        logoClickCount = 0;
      }
    });
  }

  // Easter Egg 2: Help button
  var helpBtn = document.getElementById('help-btn');
  if (helpBtn) {
    helpBtn.addEventListener('click', function() {
      showToast(helpMessages[Math.floor(Math.random() * helpMessages.length)]);
    });
  }

  // Easter Egg 3: Konami Code
  var konamiProgress = 0;
  var konamiCode = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];

  document.addEventListener('keydown', function(e) {
    if (e.keyCode === konamiCode[konamiProgress]) {
      konamiProgress++;
      if (konamiProgress === konamiCode.length) {
        konamiProgress = 0;
        showToast("🎮 KONAMI CODE ACTIVATED! +30 lives!");
        document.body.style.transition = 'filter 0.5s';
        document.body.style.filter = 'hue-rotate(180deg)';
        setTimeout(function() {
          document.body.style.filter = 'none';
          showToast("Colors restored. That was fun. 🌈");
        }, 3000);
      }
    } else {
      konamiProgress = 0;
    }
  });

  // Easter Egg 4: Triple-click quote
  var quoteEl = document.querySelector('.quote-text');
  if (quoteEl) {
    var quoteClicks = 0;
    var quoteTimer;
    quoteEl.addEventListener('click', function() {
      quoteClicks++;
      clearTimeout(quoteTimer);
      quoteTimer = setTimeout(function() { quoteClicks = 0; }, 500);
      if (quoteClicks === 3) {
        quoteEl.textContent = funQuotes[Math.floor(Math.random() * funQuotes.length)];
        showToast("✨ Secret quote unlocked! Triple-click for more.");
        quoteClicks = 0;
      }
    });
  }

  // Startup toast
  setTimeout(function() {
    showToast("💾 SubhranilOS v1.0 loaded successfully. Welcome!");
  }, 800);

  // Add sound effects to interactive elements
  var interactables = document.querySelectorAll('button, .dock-item, .project-card, .flat-btn, .win-btn');
  for (var i = 0; i < interactables.length; i++) {
    interactables[i].addEventListener('mouseenter', function() { playSound('hover'); });
    interactables[i].addEventListener('mousedown', function() { playSound('click'); });
    interactables[i].addEventListener('touchstart', function() { playSound('click'); }, {passive: true});
  }

});

// ========================
// RETRO SOUND EFFECTS (Web Audio API)
// ========================
var AudioContext = window.AudioContext || window.webkitAudioContext;
var audioCtx = null;

function playSound(type) {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  
  var osc = audioCtx.createOscillator();
  var gain = audioCtx.createGain();
  
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  
  if (type === 'click') {
    // Retro button click (short mechanical thud)
    osc.type = 'square';
    osc.frequency.setValueAtTime(150, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, audioCtx.currentTime + 0.05);
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.05);
    if (navigator.vibrate) navigator.vibrate(15);
  } else if (type === 'hover') {
    // Subtle retro tick
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.03);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.03);
    if (navigator.vibrate) navigator.vibrate(5);
  } else if (type === 'death') {
    // Classic 8-bit arcade death (descending notes)
    osc.type = 'square';
    var now = audioCtx.currentTime;
    
    // Quick descending arpeggio
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.setValueAtTime(300, now + 0.15);
    osc.frequency.setValueAtTime(200, now + 0.3);
    osc.frequency.setValueAtTime(150, now + 0.45);
    osc.frequency.setValueAtTime(100, now + 0.6);
    osc.frequency.setValueAtTime(50,  now + 0.75);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 1.0);
    
    osc.start();
    osc.stop(now + 1.0);
    if (navigator.vibrate) navigator.vibrate([50, 50, 50, 50, 100]);
  } else if (type === 'epic') {
    // Epic chord for perfect corner hit
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(440, audioCtx.currentTime); // A4
    
    var osc2 = audioCtx.createOscillator();
    osc2.type = 'square';
    osc2.frequency.setValueAtTime(554.37, audioCtx.currentTime); // C#5
    osc2.connect(gain);
    osc2.start();
    osc2.stop(audioCtx.currentTime + 1.5);
    
    var osc3 = audioCtx.createOscillator();
    osc3.type = 'triangle';
    osc3.frequency.setValueAtTime(659.25, audioCtx.currentTime); // E5
    osc3.connect(gain);
    osc3.start();
    osc3.stop(audioCtx.currentTime + 1.5);

    gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1.5);
    osc.start();
    osc.stop(audioCtx.currentTime + 1.5);
  }
}

// ========================
// BOUNCING SCREENSAVER
// ========================
var inactivityTimer;
var INACTIVITY_LIMIT = 20000; // 20 seconds
var isScreensaverActive = false;
var ssX = 0, ssY = 0;
var ssDx = 3, ssDy = 3;
var ssReq;
var ssColors = ['#ff00ff', '#00ffff', '#ffff00', '#ff0000', '#00ff00'];
var ssColorIndex = 0;

function resetInactivity() {
  clearTimeout(inactivityTimer);
  if (isScreensaverActive) {
    hideScreensaver();
  }
  // The screensaver is hidden on phones, so don't burn a timer (and the
  // bounce animation) on hardware that's already battery-constrained.
  if (window.innerWidth <= 900) return;
  inactivityTimer = setTimeout(showScreensaver, INACTIVITY_LIMIT);
}

function showScreensaver() {
  if (isScreensaverActive) return;
  // Reading a brochure page or a case study is not idling. Only take over the
  // screen when the desktop itself is what the visitor has walked away from.
  var lb = document.getElementById('lightbox');
  if (lb && lb.classList.contains('active')) return;
  if (openWindows.size) return;
  isScreensaverActive = true;
  document.getElementById('screensaver').classList.add('show');
  
  var logo = document.getElementById('dvd-logo');
  ssX = Math.random() * (window.innerWidth - 250);
  ssY = Math.random() * (window.innerHeight - 80);
  
  bounceLogo();
}

function hideScreensaver() {
  if (!isScreensaverActive) return;
  isScreensaverActive = false;
  document.getElementById('screensaver').classList.remove('show');
  cancelAnimationFrame(ssReq);
}

var lastCornerHit = 0;

function bounceLogo() {
  if (!isScreensaverActive) return;
  
  var logo = document.getElementById('dvd-logo');
  var w = logo.offsetWidth;
  var h = logo.offsetHeight;
  
  ssX += ssDx;
  ssY += ssDy;
  
  var hitEdge = false;
  
  if (ssX <= 0 && ssDx < 0) { ssDx *= -1; hitEdge = true; }
  if (ssX + w >= window.innerWidth && ssDx > 0) { ssDx *= -1; hitEdge = true; }
  if (ssY <= 0 && ssDy < 0) { ssDy *= -1; hitEdge = true; }
  if (ssY + h >= window.innerHeight && ssDy > 0) { ssDy *= -1; hitEdge = true; }
  
  if (hitEdge) {
    ssColorIndex = (ssColorIndex + 1) % ssColors.length;
    logo.style.color = ssColors[ssColorIndex];
    
    // Check for perfect corner hit
    var inCornerX = (ssX <= 2) || (ssX + w >= window.innerWidth - 2);
    var inCornerY = (ssY <= 2) || (ssY + h >= window.innerHeight - 2);
    if (inCornerX && inCornerY) {
      var now = Date.now();
      if (now - lastCornerHit > 2000) { // 2 second cooldown
        lastCornerHit = now;
        playSound('epic');
        setTimeout(function() { showToast("💿 PERFECT CORNER HIT! 💿"); }, 100);
      }
    }
  }
  
  logo.style.transform = 'translate(' + ssX + 'px, ' + ssY + 'px)';
  ssReq = requestAnimationFrame(bounceLogo);
}

// Listen to all activity to reset timer
var activityEvents = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
activityEvents.forEach(function(evt) {
  document.addEventListener(evt, resetInactivity, {passive: true});
});
resetInactivity();

// ========================
// DESKTOP PET (BYTE) AI
// ========================
var pet = document.getElementById('desktop-pet');
var petBubble = document.getElementById('pet-bubble');
var petFace = document.getElementById('pet-face');
var petX = window.innerWidth - 150;
var petY = 80; // from bottom
var petDx = -1;
var petQuotes = [
  "Need a designer?",
  "CSS is my passion.",
  "Beep boop.",
  "I love retro!",
  "Is it 1995?",
  "Hire Subhranil!"
];

var normalFaces = ['• _ •', '• u •', '• ~ •', '• - •', '> _ <', '^ _ ^', '• : •'];
var talkingFaces = ['• o •', '• O •', '• - •', '• ] •'];
var speakTimer, faceInterval;

function petSpeak(text, duration) {
  clearTimeout(speakTimer);
  clearInterval(faceInterval);
  
  petBubble.textContent = text;
  pet.classList.add('speaking');
  
  faceInterval = setInterval(function() {
    petFace.textContent = talkingFaces[Math.floor(Math.random() * talkingFaces.length)];
  }, 150);
  
  speakTimer = setTimeout(function() {
    pet.classList.remove('speaking');
    clearInterval(faceInterval);
    petFace.textContent = '• _ •';
  }, duration);
}

// Byte is hidden on phones (he'd float over the content), so skip his
// 20fps wander loop and chatter timer there rather than animating an
// invisible element.
if (pet && window.innerWidth > 900) {
  pet.style.transform = 'translateX(' + petX + 'px)';

  // Pet wandering loop
  setInterval(function() {
    if (Math.random() < 0.05) {
      // Randomly change direction or stop
      petDx = (Math.random() > 0.5 ? 1 : -1) * (Math.random() < 0.3 ? 0 : 1);
    }
    
    // Random facial expression while walking
    if (Math.random() < 0.05 && !pet.classList.contains('speaking')) {
      petFace.textContent = normalFaces[Math.floor(Math.random() * normalFaces.length)];
    }
    
    if (petDx !== 0) {
      petX += petDx;
      if (petX < 0) petDx = 1;
      if (petX > window.innerWidth - 100) petDx = -1;
      pet.style.transform = 'translateX(' + petX + 'px)';
    }
  }, 50);

  // Random talking
  setInterval(function() {
    if (Math.random() < 0.3) {
      playSound('hover');
      petSpeak(petQuotes[Math.floor(Math.random() * petQuotes.length)], 3000);
    }
  }, 10000);

  // Click interaction
  pet.addEventListener('click', function() {
    playSound('epic');
    pet.style.transition = 'transform 0.2s cubic-bezier(0.25, 1, 0.5, 1)';
    pet.style.transform = 'translate(' + petX + 'px, -50px) scale(1.2)';
    
    petSpeak("Ouch! Watch the pixels!", 2000);
    petFace.textContent = '> O <'; // initial shock face
    
    setTimeout(function() {
      pet.style.transition = 'none';
      pet.style.transform = 'translateX(' + petX + 'px)';
    }, 500);
  });
}

// ========================
// SOCIAL CREATIVES — album grid + per-album carousel
// ========================
var socialAlbums = [];     // every album from the manifest
var scLine = 'All';        // active product-line filter

function loadSocialCreatives() {
  return fetch('assets/social/manifest.json')
    .then(function(r) { return r.ok ? r.json() : []; })
    .then(function(list) { socialAlbums = list || []; return socialAlbums; })
    .catch(function() { socialAlbums = []; return socialAlbums; });
}

function scPostCount() {
  return socialAlbums.reduce(function(n, a) { return n + a.count; }, 0);
}

// desktop widget: five covers, red-tagged work first (the manifest is sorted)
function initSocialWidget() {
  var grid = document.getElementById('socialCreativeGrid');
  var count = document.getElementById('socialCount');
  if (!grid) return;
  if (count) count.textContent = '(' + scPostCount() + ')';

  grid.innerHTML = socialAlbums.slice(0, 6).map(function(a) {
    return '<button class="social-creative-tile" onclick="openSocialAlbum(\'' + a.id + '\')" ' +
      'aria-label="' + escapeAttr(a.title) + '">' +
      '<img src="' + a.cover + '" alt="" loading="lazy" decoding="async">' +
      (a.count > 1 ? '<span class="sc-count">' + a.count + '</span>' : '') +
      '</button>';
  }).join('');
}

function getSocialsContent() {
  return '<div class="gal">' +
    '<div class="gal-bar">' +
      '<div class="gal-crumb" id="scCrumb"></div>' +
      '<div class="gal-filters" id="scToolbar"></div>' +
    '</div>' +
    '<div class="gal-body"><div class="sc-grid" id="scGrid"></div></div>' +
  '</div>';
}

function initSocialGallery() {
  var grid = document.getElementById('scGrid');
  var bar = document.getElementById('scToolbar');
  if (!grid || !bar) return;

  var lines = ['All'];
  socialAlbums.forEach(function(a) {
    if (lines.indexOf(a.line) === -1) lines.push(a.line);
  });
  bar.innerHTML = lines.map(function(b) {
    return '<button class="gal-chip' + (b === scLine ? ' active' : '') +
      '" onclick="filterSocials(\'' + b + '\')">' + b + '</button>';
  }).join('');

  renderSocialGrid();
}

function filterSocials(line) {
  scLine = line;
  var chips = document.querySelectorAll('#scToolbar .gal-chip');
  for (var i = 0; i < chips.length; i++) {
    chips[i].classList.toggle('active', chips[i].textContent === line);
  }
  renderSocialGrid();
}

// one cover per album — a carousel is represented by its first post
function renderSocialGrid() {
  var grid = document.getElementById('scGrid');
  var crumb = document.getElementById('scCrumb');
  if (!grid) return;

  var list = scLine === 'All'
    ? socialAlbums
    : socialAlbums.filter(function(a) { return a.line === scLine; });

  if (crumb) {
    var posts = list.reduce(function(n, a) { return n + a.count; }, 0);
    crumb.innerHTML = '<span class="gal-crumb-here">Social Creatives</span>' +
      '<span class="gal-crumb-count">' + posts + ' posts · ' + list.length + ' sets</span>';
  }

  grid.innerHTML = list.map(function(a) {
    return '<button class="sc-tile' + (a.featured ? ' is-featured' : '') +
      '" onclick="openSocialAlbum(\'' + a.id + '\')" ' +
      'aria-label="' + escapeAttr(a.title) + ', ' + a.count + ' posts">' +
      '<img src="' + a.cover + '" alt="" loading="lazy" decoding="async">' +
      (a.featured ? '<span class="gal-badge">★</span>' : '') +
      (a.count > 1 ? '<span class="sc-count">' + a.count + '</span>' : '') +
      '<span class="sc-tile-label">' + a.line + '</span>' +
      '</button>';
  }).join('');
}

function openSocialAlbum(id) {
  for (var i = 0; i < socialAlbums.length; i++) {
    if (socialAlbums[i].id === id) {
      var a = socialAlbums[i];
      // the manifest carries thumbs separately from the full-size posts
      var items = a.items.map(function(it, n) {
        return {
          type: it.type, src: it.src, full: it.full,
          thumb: (a.thumbs && a.thumbs[n]) || it.full,
          label: a.title + ' — post ' + (n + 1)
        };
      });
      openLightbox(items, 0, a.brand + ' · ' + a.title);
      return;
    }
  }
}

loadSocialCreatives().then(initSocialWidget);

// ========================
// RETRO TURNTABLE — AUDIO PLAYER
// ========================
var neoPlayer = document.getElementById('winamp-player');
if (neoPlayer) {
  makeDraggable(neoPlayer, neoPlayer.querySelector('.widget-header'));

  // Participate in dynamic z-index window layering
  neoPlayer.addEventListener('mousedown', function() {
    bringToFront(neoPlayer);
  });
  neoPlayer.addEventListener('touchstart', function() {
    bringToFront(neoPlayer);
  }, { passive: true });
}

// Dynamic positioning of turntable player (inline on mobile, floating on desktop)
function adjustPlayerForMobile() {
  var player = document.getElementById('winamp-player');
  var widgetsContainer = document.getElementById('widgets-container');
  var desktop = document.getElementById('desktop');
  
  if (!player || !widgetsContainer || !desktop) return;
  
  var isMobile = window.innerWidth <= 900;
  var isCurrentlyMobilePlaced = player.parentElement === widgetsContainer;
  
  if (isMobile && !isCurrentlyMobilePlaced) {
    // Move inside widgets container (prepend as first child so it appears at top)
    widgetsContainer.insertBefore(player, widgetsContainer.firstChild);
  } else if (!isMobile && isCurrentlyMobilePlaced) {
    // Move back to desktop
    desktop.appendChild(player);
  }
}

// Run immediately and on resize/load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', adjustPlayerForMobile);
} else {
  adjustPlayerForMobile();
}
window.addEventListener('resize', adjustPlayerForMobile);

// ------------------------------------------------------------------
// The turntable greets desktop visitors already open. Once someone
// closes or hides it, that choice is remembered so it never forces
// itself back on them. Mobile is left alone — it sits inline there and
// an auto-open would push the actual content down.
// ------------------------------------------------------------------
var TURNTABLE_DISMISSED_KEY = 'sm_turntable_dismissed';

function turntableDismissed() {
  try {
    return localStorage.getItem(TURNTABLE_DISMISSED_KEY) === '1';
  } catch (e) {
    return false; // private mode / storage blocked
  }
}

function setTurntableDismissed(dismissed) {
  try {
    if (dismissed) localStorage.setItem(TURNTABLE_DISMISSED_KEY, '1');
    else localStorage.removeItem(TURNTABLE_DISMISSED_KEY);
  } catch (e) {}
}

function autoOpenTurntable() {
  if (!neoPlayer) return;
  if (window.innerWidth <= 900) return;
  if (turntableDismissed()) return;
  if (deletedWidgets.indexOf('turntable') !== -1) return;
  neoPlayer.style.display = 'block';
  bringToFront(neoPlayer);
}

// Menu bar toggle action
var menuTurntableBtn = document.getElementById('menu-turntable-btn');
if (menuTurntableBtn && neoPlayer) {
  menuTurntableBtn.addEventListener('click', function() {
    playSound('click');
    if (deletedWidgets.includes('turntable')) {
      restoreWidget('turntable');
      setTurntableDismissed(false);
    } else {
      if (neoPlayer.style.display === 'none') {
        neoPlayer.style.display = 'block';
        bringToFront(neoPlayer);
        setTurntableDismissed(false);
      } else {
        neoPlayer.style.display = 'none';
        setTurntableDismissed(true);
      }
    }
  });
}

var audioPlayer = document.getElementById('audio-player');
var vinyl = document.getElementById('vinyl-record');
var tonearm = document.getElementById('tonearm');
var playPauseBtn = document.getElementById('play-pause-btn');
var prevBtn = document.getElementById('prev-btn');
var nextBtn = document.getElementById('next-btn');
var progressFill = document.getElementById('progress-fill');
var progressHandle = document.getElementById('progress-handle');
var currentTimeEl = document.getElementById('current-time');
var totalTimeEl = document.getElementById('total-time');
var isPlaying = false;

function formatTime(sec) {
  if (isNaN(sec)) return "0:00";
  var m = Math.floor(sec / 60);
  var s = Math.floor(sec % 60);
  return m + ':' + (s < 10 ? '0' : '') + s;
}

function setPlayState(playing) {
  isPlaying = playing;
  if (playing) {
    if (vinyl) vinyl.classList.add('playing');
    if (tonearm) tonearm.classList.add('playing');
    if (playPauseBtn) {
      playPauseBtn.innerHTML = '<i data-lucide="pause"></i>';
      if (window.lucide) lucide.createIcons();
    }
  } else {
    if (vinyl) vinyl.classList.remove('playing');
    if (tonearm) tonearm.classList.remove('playing');
    if (playPauseBtn) {
      playPauseBtn.innerHTML = '<i data-lucide="play"></i>';
      if (window.lucide) lucide.createIcons();
    }
  }
}

if (audioPlayer) {
  // Sync total time once metadata is loaded
  audioPlayer.addEventListener('loadedmetadata', function() {
    var dur = audioPlayer.duration;
    if (totalTimeEl && dur) {
      totalTimeEl.innerText = formatTime(dur);
    }
  });

  // Track progress updates
  audioPlayer.addEventListener('timeupdate', function() {
    if (audioPlayer.seeking) return; // avoid jitter during scrubbing
    var cur = audioPlayer.currentTime;
    var dur = audioPlayer.duration || 1;
    var pct = (cur / dur) * 100;
    if (progressFill) progressFill.style.width = pct + '%';
    if (progressHandle) progressHandle.style.left = pct + '%';
    if (currentTimeEl) currentTimeEl.innerText = formatTime(cur);
  });

  // Handle song ending
  audioPlayer.addEventListener('ended', function() {
    setPlayState(false);
  });

  // Fallback: If metadata is already loaded before event listener is registered
  if (audioPlayer.readyState >= 1) {
    var dur = audioPlayer.duration;
    if (totalTimeEl && dur) {
      totalTimeEl.innerText = formatTime(dur);
    }
  }
}

// Click to play/pause
if (playPauseBtn && audioPlayer) {
  playPauseBtn.addEventListener('click', function() {
    playSound('click');
    if (isPlaying) {
      audioPlayer.pause();
      setPlayState(false);
    } else {
      audioPlayer.play().then(function() {
        showToast('🎵 Playing: Guns N\' Roses - November Rain');
        setPlayState(true);
      }).catch(function(err) {
        console.error("Audio playback block:", err);
        // Browsers block autoplay/code-initiated play without interaction
        showToast('⚠️ Click again to allow audio playback!');
      });
    }
  });
}

// Interactive Scrubbing / seeking
var progressBarContainer = document.getElementById('progress-bar-container');
if (progressBarContainer && audioPlayer) {
  progressBarContainer.style.cursor = 'pointer';

  var isScrubbing = false;

  function performSeek(e) {
    var rect = progressBarContainer.getBoundingClientRect();
    var clientX = e.clientX || (e.touches && e.touches[0].clientX);
    if (clientX === undefined) return;
    var clickX = clientX - rect.left;
    var width = rect.width;
    var pct = Math.max(0, Math.min(1, clickX / width));
    
    if (progressFill) progressFill.style.width = (pct * 100) + '%';
    if (progressHandle) progressHandle.style.left = (pct * 100) + '%';
    
    if (audioPlayer.duration) {
      audioPlayer.currentTime = pct * audioPlayer.duration;
      if (currentTimeEl) currentTimeEl.innerText = formatTime(audioPlayer.currentTime);
    }
  }

  // Mouse seek
  progressBarContainer.addEventListener('mousedown', function(e) {
    isScrubbing = true;
    performSeek(e);

    function onMouseMove(moveEvent) {
      if (isScrubbing) performSeek(moveEvent);
    }

    function onMouseUp() {
      isScrubbing = false;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  });

  // Touch seek
  progressBarContainer.addEventListener('touchstart', function(e) {
    isScrubbing = true;
    performSeek(e);

    function onTouchMove(moveEvent) {
      if (isScrubbing) performSeek(moveEvent);
    }

    function onTouchEnd() {
      isScrubbing = false;
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
    }

    document.addEventListener('touchmove', onTouchMove, { passive: true });
    document.addEventListener('touchend', onTouchEnd);
  }, { passive: true });
}

// Skip actions (funny retro toasts)
var funnySkipResponses = [
  "💿 Guns N' Roses 'November Rain' is the only masterpiece on this record!",
  "🚫 Cannot skip. Do you really want to skip this guitar solo?",
  "📼 Be kind, rewind! No other tracks loaded on this floppy disk.",
  "🎹 November Rain is playing on repeat. It's too good to skip!"
];

if (prevBtn) {
  prevBtn.addEventListener('click', function() {
    playSound('click');
    var randomMsg = funnySkipResponses[Math.floor(Math.random() * funnySkipResponses.length)];
    showToast(randomMsg);
  });
}

if (nextBtn) {
  nextBtn.addEventListener('click', function() {
    playSound('click');
    var randomMsg = funnySkipResponses[Math.floor(Math.random() * funnySkipResponses.length)];
    showToast(randomMsg);
  });
}

// ========================
// SHARED LIGHTBOX — used by the gallery and the social creatives window
// ========================
var lbItems = [];
var lbIndex = 0;
var lbTitle = '';

function openLightbox(items, index, title) {
  if (!items || !items.length) return;
  lbItems = items;
  lbIndex = Math.max(0, Math.min(index || 0, items.length - 1));
  lbTitle = title || '';
  renderLightboxStrip();
  var v = document.getElementById('lightbox');
  if (v) v.classList.add('active');
  document.body.classList.add('lb-open');
  updateLightbox();
}

function closeLightbox() {
  var v = document.getElementById('lightbox');
  if (v) v.classList.remove('active');
  document.body.classList.remove('lb-open');
  var stage = document.getElementById('lbStage');
  if (stage) {
    var vid = stage.querySelector('video');
    if (vid) vid.pause();
  }
  lbItems = [];
}

function moveLightbox(step) {
  if (lbItems.length < 2) return;
  lbIndex = (lbIndex + step + lbItems.length) % lbItems.length;
  updateLightbox();
}

function goLightbox(i) {
  lbIndex = i;
  updateLightbox();
}

// Every frame in the set as a thumbnail rail. Hidden for single-item sets so a
// lone thumbnail under the picture does not read as "there is more here".
function renderLightboxStrip() {
  var strip = document.getElementById('lbStrip');
  if (!strip) return;
  if (lbItems.length < 2) { strip.innerHTML = ''; return; }
  strip.innerHTML = lbItems.map(function(it, i) {
    return '<button class="lb-film" data-i="' + i + '" onclick="goLightbox(' + i + ')" ' +
      'aria-label="Item ' + (i + 1) + ' of ' + lbItems.length + '">' +
      '<img src="' + (it.thumb || it.full) + '" alt="" loading="lazy" decoding="async"></button>';
  }).join('');
}

function updateLightbox() {
  var item = lbItems[lbIndex];
  if (!item) return;
  var stage = document.getElementById('lbMedia');
  var cap = document.getElementById('lbCaption');
  var nav = document.getElementById('lbNav');
  var open = document.getElementById('lbOpen');

  if (stage) {
    if (item.type === 'video') {
      stage.innerHTML = '<video src="' + item.src + '" poster="' + item.full + '" ' +
        'controls playsinline preload="metadata" class="lb-media"></video>';
    } else {
      stage.innerHTML = '<img src="' + item.full + '" alt="' + escapeAttr(item.label || lbTitle) +
        '" class="lb-media" decoding="async">';
    }
  }
  if (cap) {
    cap.textContent = lbTitle + (lbItems.length > 1 ? '  ·  ' + (lbIndex + 1) + ' / ' + lbItems.length : '');
  }
  if (nav) nav.style.display = lbItems.length > 1 ? '' : 'none';
  if (open) {
    open.href = item.type === 'video' ? item.src : item.full;
    open.textContent = item.type === 'video' ? 'Open video' : 'Open full size';
  }

  var films = document.querySelectorAll('#lbStrip .lb-film');
  for (var i = 0; i < films.length; i++) {
    var on = i === lbIndex;
    films[i].classList.toggle('active', on);
    if (on && films[i].scrollIntoView) {
      films[i].scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
    }
  }
}

function escapeAttr(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

document.addEventListener('keydown', function(e) {
  var v = document.getElementById('lightbox');
  if (!v || !v.classList.contains('active')) return;
  if (e.key === 'Escape') closeLightbox();
  else if (e.key === 'ArrowLeft') moveLightbox(-1);
  else if (e.key === 'ArrowRight') moveLightbox(1);
});

// Swipe between frames on touch. Ignores mostly-vertical drags so the
// filmstrip and page can still be scrolled.
(function() {
  var x0 = null, y0 = null;
  document.addEventListener('touchstart', function(e) {
    var stage = document.getElementById('lbStage');
    if (!stage || !stage.contains(e.target)) { x0 = null; return; }
    x0 = e.touches[0].clientX;
    y0 = e.touches[0].clientY;
  }, { passive: true });
  document.addEventListener('touchend', function(e) {
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0;
    var dy = e.changedTouches[0].clientY - y0;
    x0 = null;
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.5) moveLightbox(dx < 0 ? 1 : -1);
  }, { passive: true });
})();

// ========================
// GALLERY — projects → albums → lightbox
// ========================
var galData = null;          // parsed gallery.json
var galFilter = 'all';       // 'all' | 'featured' | a discipline id
var galProject = null;       // project currently open, null on the index
var galExpanded = {};        // album id -> showing every tile
var GAL_PREVIEW = 12;        // tiles shown before "show all"

function loadGallery() {
  if (galData) return Promise.resolve(galData);
  return fetch('assets/gallery/gallery.json')
    .then(function(r) { return r.ok ? r.json() : null; })
    .then(function(d) { galData = d; return d; })
    .catch(function() { return null; });
}

function getGalleryContent() {
  return '<div class="gal">' +
    '<div class="gal-bar">' +
      '<div class="gal-crumb" id="galCrumb"></div>' +
      '<div class="gal-filters" id="galFilters"></div>' +
    '</div>' +
    '<div class="gal-body" id="galBody">' +
      '<p class="gal-loading">Reading the archive…</p>' +
    '</div>' +
  '</div>';
}

function initGallery() {
  loadGallery().then(function(d) {
    var body = document.getElementById('galBody');
    if (!body) return;
    if (!d) { body.innerHTML = '<p class="gal-loading">Could not load the gallery.</p>'; return; }
    galProject = null;
    galRender();
  });
}

function galRender() {
  galProject ? galRenderProject() : galRenderIndex();
  var body = document.getElementById('galBody');
  if (body) body.scrollTop = 0;
  if (window.lucide) lucide.createIcons({ attrs: { 'stroke-width': 2 } });
}

// --- index ---------------------------------------------------------------

function galRenderIndex() {
  var crumb = document.getElementById('galCrumb');
  var filters = document.getElementById('galFilters');
  var body = document.getElementById('galBody');
  if (!body || !galData) return;

  if (crumb) {
    crumb.innerHTML = '<span class="gal-crumb-here">Gallery</span>' +
      '<span class="gal-crumb-count">' + galData.total + ' pieces · ' + galData.projects.length + ' projects</span>';
  }

  if (filters) {
    var chips = [{ id: 'featured', label: '★ Latest & Best' }, { id: 'all', label: 'All Work' }]
      .concat(galData.disciplines);
    filters.innerHTML = chips.map(function(c) {
      return '<button class="gal-chip' + (c.id === galFilter ? ' active' : '') +
        '" onclick="galSetFilter(\'' + c.id + '\')">' + c.label + '</button>';
    }).join('');
  }

  var list = galData.projects.filter(function(p) {
    if (galFilter === 'all') return true;
    if (galFilter === 'featured') return p.featured;
    return p.disciplines.indexOf(galFilter) !== -1;
  });

  if (!list.length) {
    body.innerHTML = '<p class="gal-loading">Nothing filed under that yet.</p>';
    return;
  }

  body.innerHTML = '<div class="gal-grid">' + list.map(function(p) {
    return '<button class="gal-card' + (p.featured ? ' is-featured' : '') +
      '" onclick="galOpenProject(\'' + p.id + '\')">' +
      '<span class="gal-card-shot">' +
        '<img src="' + p.cover + '" alt="" loading="lazy" decoding="async">' +
        (p.featured ? '<span class="gal-badge">★ Latest</span>' : '') +
      '</span>' +
      '<span class="gal-card-body">' +
        '<span class="gal-card-title">' + p.name + '</span>' +
        '<span class="gal-card-tag">' + p.tagline + '</span>' +
        '<span class="gal-card-meta"><span>' + p.year + '</span><span>' + p.count + ' pieces</span></span>' +
      '</span>' +
    '</button>';
  }).join('') + '</div>';
}

function galSetFilter(id) {
  galFilter = id;
  galProject = null;
  galRender();
}

// --- one project ---------------------------------------------------------

function galOpenProject(id) {
  galProject = null;
  for (var i = 0; i < galData.projects.length; i++) {
    if (galData.projects[i].id === id) { galProject = galData.projects[i]; break; }
  }
  galExpanded = {};
  galRender();
}

function galBack() {
  galProject = null;
  galRender();
}

function galRenderProject() {
  var p = galProject;
  var crumb = document.getElementById('galCrumb');
  var filters = document.getElementById('galFilters');
  var body = document.getElementById('galBody');
  if (!body || !p) return;

  if (crumb) {
    crumb.innerHTML = '<button class="gal-back" onclick="galBack()">' +
      '<i data-lucide="chevron-left"></i>Gallery</button>' +
      '<span class="gal-crumb-here">' + p.name + '</span>';
  }
  // The chips filter the index; inside a project they would do nothing.
  if (filters) filters.innerHTML = '';

  var head = '<header class="gal-head">' +
    '<h2>' + p.name + (p.featured ? ' <span class="gal-star" title="Latest &amp; best">★</span>' : '') + '</h2>' +
    '<p class="gal-head-tag">' + p.tagline + '</p>' +
    '<div class="gal-head-meta">' +
      '<span>' + p.role + '</span><span>' + p.year + '</span><span>' + p.count + ' pieces</span>' +
    '</div>' +
    (p.link ? '<a class="flat-btn gal-head-link" href="' + p.link.href + '">' + p.link.label + '</a>' : '') +
  '</header>';

  var albums = p.albums.map(function(a) {
    var open = !!galExpanded[a.id];
    var shown = open ? a.items : a.items.slice(0, GAL_PREVIEW);
    var tiles = shown.map(function(it, i) {
      var idx = a.items.indexOf(it);
      return '<button class="gal-tile' + (it.featured ? ' is-featured' : '') +
        '" onclick="galOpenItem(\'' + a.id + '\', ' + idx + ')" ' +
        'aria-label="' + escapeAttr(it.label) + '">' +
        '<img src="' + it.thumb + '" alt="' + escapeAttr(it.label) + '" loading="lazy" decoding="async">' +
        (it.type === 'video' ? '<span class="gal-play"><i data-lucide="play"></i></span>' : '') +
      '</button>';
    }).join('');

    var more = (!open && a.items.length > GAL_PREVIEW)
      ? '<button class="gal-more" onclick="galExpand(\'' + a.id + '\')">' +
          'Show all ' + a.items.length + ' <i data-lucide="chevron-down"></i></button>'
      : '';

    return '<section class="gal-album">' +
      '<div class="gal-album-head">' +
        '<h3>' + (a.featured ? '<span class="gal-star">★</span> ' : '') + a.title + '</h3>' +
        '<span class="gal-album-count">' + a.count + '</span>' +
      '</div>' +
      '<div class="gal-shelf">' + tiles + '</div>' + more +
    '</section>';
  }).join('');

  body.innerHTML = head + albums;
}

function galExpand(albumId) {
  galExpanded[albumId] = true;
  galRenderProject();
  if (window.lucide) lucide.createIcons({ attrs: { 'stroke-width': 2 } });
}

function galOpenItem(albumId, index) {
  if (!galProject) return;
  for (var i = 0; i < galProject.albums.length; i++) {
    var a = galProject.albums[i];
    if (a.id === albumId) {
      openLightbox(a.items, index, galProject.name + ' · ' + a.title);
      return;
    }
  }
}
