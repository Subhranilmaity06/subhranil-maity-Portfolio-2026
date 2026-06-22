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
var appData = {
  projects: {
    title: 'C:\\Projects',
    content: '<div class="app-grid">' +
      '<div class="project-card" onclick="window.open(\'https://naata.in/\', \'_blank\')"><h4>Naata.exe</h4><p>2025 • Active<br><span style="color:var(--retro-blue);text-decoration:underline;">naata.in</span></p></div>' +
      '<div class="project-card" onclick="window.open(\'https://www.ecowellonline.com/\', \'_blank\')"><h4>Ecowell.exe</h4><p>2024-26 • Active<br><span style="color:var(--retro-blue);text-decoration:underline;">ecowellonline.com</span></p></div>' +
      '<div class="project-card" onclick="window.open(\'https://www.mechapixel.in/\', \'_blank\')"><h4>Mechapixel.exe</h4><p>2025 • Active<br><span style="color:var(--retro-blue);text-decoration:underline;">mechapixel.in</span></p></div>' +
      '<div class="project-card" onclick="window.open(\'https://www.educircle.co/\', \'_blank\')"><h4>Educircle.exe</h4><p>2025 • Active<br><span style="color:var(--retro-blue);text-decoration:underline;">educircle.co</span></p></div>' +
      '<div class="project-card" onclick="window.open(\'https://goodwyntea.com/\', \'_blank\')"><h4>Goodwyn.exe</h4><p>2025 • Active<br><span style="color:var(--retro-blue);text-decoration:underline;">goodwyntea.com</span></p></div>' +
      '<div class="project-card" onclick="window.open(\'https://www.sundrex.com/\', \'_blank\')"><h4>Sundrex.exe</h4><p>2025 • Active<br><span style="color:var(--retro-blue);text-decoration:underline;">sundrex.com</span></p></div>' +
      '<div class="project-card" onclick="window.open(\'https://www.haatak.com/\', \'_blank\')"><h4>Haatak.exe</h4><p>2025 • Active<br><span style="color:var(--retro-blue);text-decoration:underline;">haatak.com</span></p></div>' +
      '<div class="project-card" onclick="window.open(\'https://railwayhsschoolapdj.com/\', \'_blank\')"><h4>RailwayHSS.exe</h4><p>2022 • Active<br><span style="color:var(--retro-blue);text-decoration:underline;">railwayhsschoolapdj.com</span></p></div>' +
      '<div class="project-card" onclick="window.open(\'https://aifalcon.framer.app/\', \'_blank\')"><h4>AiFalcon.exe</h4><p>2023-24 • Deactive<br><span style="color:var(--retro-dark-grey);text-decoration:line-through;">aifalcon.framer.app</span></p></div>' +
      '<div class="project-card"><h4>HaatakApp.apk</h4><p>2025 • Active App</p></div>' +
      '<div class="project-card"><h4>AutoQuote.apk</h4><p>2025 • Active App</p></div>' +
      '<div class="project-card"><h4>Ayla.exe</h4><p>2024-25 • Active App</p></div>' +
      '</div>'
  },
  casestudies: {
    title: 'C:\\Case_Studies',
    content: '<div class="app-grid">' +
      '<div class="project-card"><h4>CRO.doc</h4><p>Conversion Rate Optimization — 40% improvement in engagement.</p></div>' +
      '<div class="project-card"><h4>MedData.doc</h4><p>Medical Data Visualization UX flows.</p></div>' +
      '</div>'
  },
  creatives: {
    title: 'File Explorer - C:\\My_Works',
    content: '<div class="explorer-container">' +
      '<div class="explorer-sidebar">' +
        '<div class="sidebar-folder active" data-category="ecommerce"><i data-lucide="folder" style="width:16px;height:16px;margin-right:6px;"></i> E-Commerce UX</div>' +
        '<div class="sidebar-folder" data-category="branding"><i data-lucide="folder" style="width:16px;height:16px;margin-right:6px;"></i> Branding & Logos</div>' +
        '<div class="sidebar-folder" data-category="challenges"><i data-lucide="folder" style="width:16px;height:16px;margin-right:6px;"></i> UI Challenges</div>' +
        '<div class="sidebar-folder" data-category="graphics"><i data-lucide="folder" style="width:16px;height:16px;margin-right:6px;"></i> Graphics & Print</div>' +
      '</div>' +
      '<div class="explorer-main">' +
        '<div class="explorer-toolbar">' +
          '<span class="path-label">Address:</span>' +
          '<input type="text" class="path-input" readonly value="C:\\My_Works\\E-commerce_UX">' +
        '</div>' +
        '<div class="explorer-grid" id="explorer-file-grid"></div>' +
      '</div>' +
    '</div>'
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
  resume: {
    title: 'Acrobat - Resume.pdf',
    content: '<iframe src="assets/resume.pdf" width="100%" height="100%" style="border: 3px solid #000; background: white;"></iframe>'
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
function openApp(appId) {
  if (openWindows.has(appId)) {
    bringToFront(openWindows.get(appId));
    return;
  }
  var app = appData[appId];
  if (!app) return;
  var content = app.getContent ? app.getContent() : app.content;
  createWindow(appId, app.title, content);

  if (appId === 'creatives') {
    var win = document.getElementById('window-creatives');
    if (win && window.innerWidth > 900) {
      win.style.width = '720px';
      win.style.height = '480px';
    }
    initGalleryExplorer();
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
    win.style.height = 'calc(100% - 40px)';
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
    win.style.width = 'calc(100% - 20px)';
    win.style.height = '70%';
    win.style.left = '10px';
    win.style.top = '40px';
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
  makeDraggable(win, win.querySelector('.window-header'));
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
  inactivityTimer = setTimeout(showScreensaver, INACTIVITY_LIMIT);
}

function showScreensaver() {
  if (isScreensaverActive) return;
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

if (pet) {
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

// Menu bar toggle action
var menuTurntableBtn = document.getElementById('menu-turntable-btn');
if (menuTurntableBtn && neoPlayer) {
  menuTurntableBtn.addEventListener('click', function() {
    playSound('click');
    if (deletedWidgets.includes('turntable')) {
      restoreWidget('turntable');
    } else {
      if (neoPlayer.style.display === 'none') {
        neoPlayer.style.display = 'block';
        bringToFront(neoPlayer);
      } else {
        neoPlayer.style.display = 'none';
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
// DESIGN PORTFOLIO GALLERY
// ========================
var galleryData = {
  "ecommerce": [
    {
      "id": "item_208",
      "name": "item_208.webp",
      "label": "Products 22.png",
      "title": "visiaro - Products 22",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "E-Commerce and UX design layouts, showcasing user flows and interfaces.",
      "hiresPath": "assets/portfolio/hires/item_208.jpg"
    },
    {
      "id": "item_209",
      "name": "item_209.webp",
      "label": "HOME 2.png",
      "title": "visiaro - HOME 2",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "E-Commerce and UX design layouts, showcasing user flows and interfaces.",
      "hiresPath": "assets/portfolio/hires/item_209.jpg"
    },
    {
      "id": "item_210",
      "name": "item_210.webp",
      "label": "heatmap_productdetails.jpg",
      "title": "visiaro - heatmap_productdetai",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "E-Commerce and UX design layouts, showcasing user flows and interfaces.",
      "hiresPath": "assets/portfolio/hires/item_210.jpg"
    },
    {
      "id": "item_211",
      "name": "item_211.webp",
      "label": "aoi_productdetails.jpg",
      "title": "visiaro - aoi_productdetails",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "E-Commerce and UX design layouts, showcasing user flows and interfaces.",
      "hiresPath": "assets/portfolio/hires/item_211.jpg"
    },
    {
      "id": "item_212",
      "name": "item_212.webp",
      "label": "aoi_heatmap_productdetails.jpg",
      "title": "visiaro - aoi_heatmap_productd",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "E-Commerce and UX design layouts, showcasing user flows and interfaces.",
      "hiresPath": "assets/portfolio/hires/item_212.jpg"
    },
    {
      "id": "item_213",
      "name": "item_213.webp",
      "label": "focus_productdetails.jpg",
      "title": "visiaro - focus_productdetails",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "E-Commerce and UX design layouts, showcasing user flows and interfaces.",
      "hiresPath": "assets/portfolio/hires/item_213.jpg"
    },
    {
      "id": "item_214",
      "name": "item_214.webp",
      "label": "productdetails.jpg",
      "title": "visiaro - productdetails",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "E-Commerce and UX design layouts, showcasing user flows and interfaces.",
      "hiresPath": "assets/portfolio/hires/item_214.jpg"
    },
    {
      "id": "item_215",
      "name": "item_215.webp",
      "label": "heatmap_productdetails.jpg",
      "title": "visiaro - heatmap_productdetai",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "E-Commerce and UX design layouts, showcasing user flows and interfaces.",
      "hiresPath": "assets/portfolio/hires/item_215.jpg"
    },
    {
      "id": "item_216",
      "name": "item_216.webp",
      "label": "aoi_productdetails.jpg",
      "title": "visiaro - aoi_productdetails",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "E-Commerce and UX design layouts, showcasing user flows and interfaces.",
      "hiresPath": "assets/portfolio/hires/item_216.jpg"
    },
    {
      "id": "item_217",
      "name": "item_217.webp",
      "label": "aoi_heatmap_productdetails.jpg",
      "title": "visiaro - aoi_heatmap_productd",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "E-Commerce and UX design layouts, showcasing user flows and interfaces.",
      "hiresPath": "assets/portfolio/hires/item_217.jpg"
    },
    {
      "id": "item_218",
      "name": "item_218.webp",
      "label": "focus_productdetails.jpg",
      "title": "visiaro - focus_productdetails",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "E-Commerce and UX design layouts, showcasing user flows and interfaces.",
      "hiresPath": "assets/portfolio/hires/item_218.jpg"
    },
    {
      "id": "item_219",
      "name": "item_219.webp",
      "label": "productdetails.jpg",
      "title": "visiaro - productdetails",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "E-Commerce and UX design layouts, showcasing user flows and interfaces.",
      "hiresPath": "assets/portfolio/hires/item_219.jpg"
    },
    {
      "id": "item_220",
      "name": "item_220.webp",
      "label": "heatmap_productdetails.jpg",
      "title": "visiaro - heatmap_productdetai",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "E-Commerce and UX design layouts, showcasing user flows and interfaces.",
      "hiresPath": "assets/portfolio/hires/item_220.jpg"
    },
    {
      "id": "item_221",
      "name": "item_221.webp",
      "label": "aoi_productdetails.jpg",
      "title": "visiaro - aoi_productdetails",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "E-Commerce and UX design layouts, showcasing user flows and interfaces.",
      "hiresPath": "assets/portfolio/hires/item_221.jpg"
    },
    {
      "id": "item_222",
      "name": "item_222.webp",
      "label": "aoi_heatmap_productdetails.jpg",
      "title": "visiaro - aoi_heatmap_productd",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "E-Commerce and UX design layouts, showcasing user flows and interfaces.",
      "hiresPath": "assets/portfolio/hires/item_222.jpg"
    },
    {
      "id": "item_223",
      "name": "item_223.webp",
      "label": "focus_productdetails.jpg",
      "title": "visiaro - focus_productdetails",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "E-Commerce and UX design layouts, showcasing user flows and interfaces.",
      "hiresPath": "assets/portfolio/hires/item_223.jpg"
    },
    {
      "id": "item_224",
      "name": "item_224.webp",
      "label": "productdetails.jpg",
      "title": "visiaro - productdetails",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "E-Commerce and UX design layouts, showcasing user flows and interfaces.",
      "hiresPath": "assets/portfolio/hires/item_224.jpg"
    },
    {
      "id": "item_225",
      "name": "item_225.webp",
      "label": "heatmap_productdetails.jpg",
      "title": "visiaro - heatmap_productdetai",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "E-Commerce and UX design layouts, showcasing user flows and interfaces.",
      "hiresPath": "assets/portfolio/hires/item_225.jpg"
    },
    {
      "id": "item_226",
      "name": "item_226.webp",
      "label": "aoi_productdetails.jpg",
      "title": "visiaro - aoi_productdetails",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "E-Commerce and UX design layouts, showcasing user flows and interfaces.",
      "hiresPath": "assets/portfolio/hires/item_226.jpg"
    },
    {
      "id": "item_227",
      "name": "item_227.webp",
      "label": "aoi_heatmap_productdetails.jpg",
      "title": "visiaro - aoi_heatmap_productd",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "E-Commerce and UX design layouts, showcasing user flows and interfaces.",
      "hiresPath": "assets/portfolio/hires/item_227.jpg"
    },
    {
      "id": "item_228",
      "name": "item_228.webp",
      "label": "focus_productdetails.jpg",
      "title": "visiaro - focus_productdetails",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "E-Commerce and UX design layouts, showcasing user flows and interfaces.",
      "hiresPath": "assets/portfolio/hires/item_228.jpg"
    },
    {
      "id": "item_229",
      "name": "item_229.webp",
      "label": "productdetails.jpg",
      "title": "visiaro - productdetails",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "E-Commerce and UX design layouts, showcasing user flows and interfaces.",
      "hiresPath": "assets/portfolio/hires/item_229.jpg"
    },
    {
      "id": "item_316",
      "name": "item_316.webp",
      "label": "Open Peeps - Bust (1).png",
      "title": "Ecowell profiles - Open Peeps - Bust (1",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "E-Commerce and UX design layouts, showcasing user flows and interfaces.",
      "hiresPath": "assets/portfolio/hires/item_316.jpg"
    },
    {
      "id": "item_328",
      "name": "item_328.webp",
      "label": "Product details Lkaija.jpg",
      "title": "L-kaija - Product details Lkai",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "E-Commerce and UX design layouts, showcasing user flows and interfaces.",
      "hiresPath": "assets/portfolio/hires/item_328.jpg"
    },
    {
      "id": "item_329",
      "name": "item_329.webp",
      "label": "Product details 22.png",
      "title": "L-kaija - Product details 22",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "E-Commerce and UX design layouts, showcasing user flows and interfaces.",
      "hiresPath": "assets/portfolio/hires/item_329.jpg"
    },
    {
      "id": "item_330",
      "name": "item_330.webp",
      "label": "Product details.png",
      "title": "L-kaija - Product details",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "E-Commerce and UX design layouts, showcasing user flows and interfaces.",
      "hiresPath": "assets/portfolio/hires/item_330.jpg"
    },
    {
      "id": "item_331",
      "name": "item_331.webp",
      "label": "Product details 2.png",
      "title": "L-kaija - Product details 2",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "E-Commerce and UX design layouts, showcasing user flows and interfaces.",
      "hiresPath": "assets/portfolio/hires/item_331.jpg"
    },
    {
      "id": "item_332",
      "name": "item_332.webp",
      "label": "Model tech logo.png",
      "title": "L-kaija - Model tech logo",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "E-Commerce and UX design layouts, showcasing user flows and interfaces.",
      "hiresPath": "assets/portfolio/hires/item_332.jpg"
    },
    {
      "id": "item_333",
      "name": "item_333.webp",
      "label": "Home Lkaija.png",
      "title": "L-kaija - Home Lkaija",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "E-Commerce and UX design layouts, showcasing user flows and interfaces.",
      "hiresPath": "assets/portfolio/hires/item_333.jpg"
    },
    {
      "id": "item_334",
      "name": "item_334.webp",
      "label": "Home Lkaija.jpg",
      "title": "L-kaija - Home Lkaija",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "E-Commerce and UX design layouts, showcasing user flows and interfaces.",
      "hiresPath": "assets/portfolio/hires/item_334.jpg"
    },
    {
      "id": "item_335",
      "name": "item_335.webp",
      "label": "Product Lkaija.jpg",
      "title": "L-kaija - Product Lkaija",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "E-Commerce and UX design layouts, showcasing user flows and interfaces.",
      "hiresPath": "assets/portfolio/hires/item_335.jpg"
    },
    {
      "id": "item_336",
      "name": "item_336.webp",
      "label": "Home 69.jpg",
      "title": "L-kaija - Home 69",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "E-Commerce and UX design layouts, showcasing user flows and interfaces.",
      "hiresPath": "assets/portfolio/hires/item_336.jpg"
    },
    {
      "id": "item_337",
      "name": "item_337.webp",
      "label": "Model tech logo 2.png",
      "title": "L-kaija - Model tech logo 2",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "E-Commerce and UX design layouts, showcasing user flows and interfaces.",
      "hiresPath": "assets/portfolio/hires/item_337.jpg"
    },
    {
      "id": "item_338",
      "name": "item_338.webp",
      "label": "Product deatails 22.png",
      "title": "L-kaija - Product deatails 22",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "E-Commerce and UX design layouts, showcasing user flows and interfaces.",
      "hiresPath": "assets/portfolio/hires/item_338.jpg"
    },
    {
      "id": "item_339",
      "name": "item_339.webp",
      "label": "heatmap_productdetails.jpg",
      "title": "L-kaija - heatmap_productdetai",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "E-Commerce and UX design layouts, showcasing user flows and interfaces.",
      "hiresPath": "assets/portfolio/hires/item_339.jpg"
    },
    {
      "id": "item_340",
      "name": "item_340.webp",
      "label": "aoi_productdetails.jpg",
      "title": "L-kaija - aoi_productdetails",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "E-Commerce and UX design layouts, showcasing user flows and interfaces.",
      "hiresPath": "assets/portfolio/hires/item_340.jpg"
    },
    {
      "id": "item_341",
      "name": "item_341.webp",
      "label": "aoi_heatmap_productdetails.jpg",
      "title": "L-kaija - aoi_heatmap_productd",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "E-Commerce and UX design layouts, showcasing user flows and interfaces.",
      "hiresPath": "assets/portfolio/hires/item_341.jpg"
    },
    {
      "id": "item_342",
      "name": "item_342.webp",
      "label": "focus_productdetails.jpg",
      "title": "L-kaija - focus_productdetails",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "E-Commerce and UX design layouts, showcasing user flows and interfaces.",
      "hiresPath": "assets/portfolio/hires/item_342.jpg"
    },
    {
      "id": "item_343",
      "name": "item_343.webp",
      "label": "productdetails.jpg",
      "title": "L-kaija - productdetails",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "E-Commerce and UX design layouts, showcasing user flows and interfaces.",
      "hiresPath": "assets/portfolio/hires/item_343.jpg"
    },
    {
      "id": "item_367",
      "name": "item_367.webp",
      "label": "Gemini_Generated_Image_dfntr7d",
      "title": "Ecowell - Gemini_Generated_Ima",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "E-Commerce and UX design layouts, showcasing user flows and interfaces.",
      "hiresPath": "assets/portfolio/hires/item_367.jpg"
    }
  ],
  "branding": [
    {
      "id": "item_110",
      "name": "item_110.webp",
      "label": "Home_alteredai.png",
      "title": "Alteredai - Home_alteredai",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_110.jpg"
    },
    {
      "id": "item_111",
      "name": "item_111.webp",
      "label": "Home_alteredai.jpg",
      "title": "Alteredai - Home_alteredai",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_111.jpg"
    },
    {
      "id": "item_125",
      "name": "item_125.webp",
      "label": "AI Designer-Brand Guidelines -",
      "title": "aifalcon - AI Designer-Brand Gu",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_125.jpg"
    },
    {
      "id": "item_126",
      "name": "item_126.webp",
      "label": "AI Designer-Minimalist bag log",
      "title": "aifalcon - AI Designer-Minimali",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_126.jpg"
    },
    {
      "id": "item_127",
      "name": "item_127.webp",
      "label": "AI Designer-Hand holding mobil",
      "title": "aifalcon - AI Designer-Hand hol",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_127.jpg"
    },
    {
      "id": "item_128",
      "name": "item_128.webp",
      "label": "AI Designer-Outdoor illuminate",
      "title": "aifalcon - AI Designer-Outdoor ",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_128.jpg"
    },
    {
      "id": "item_129",
      "name": "item_129.webp",
      "label": "AI Designer-Minimalist Brand M",
      "title": "aifalcon - AI Designer-Minimali",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_129.jpg"
    },
    {
      "id": "item_130",
      "name": "item_130.webp",
      "label": "AI Designer-Outdoor billboard ",
      "title": "aifalcon - AI Designer-Outdoor ",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_130.jpg"
    },
    {
      "id": "item_131",
      "name": "item_131.webp",
      "label": "AI Designer-Picture Frame on T",
      "title": "aifalcon - AI Designer-Picture ",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_131.jpg"
    },
    {
      "id": "item_132",
      "name": "item_132.webp",
      "label": "AI Designer-Industrial style o",
      "title": "aifalcon - AI Designer-Industri",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_132.jpg"
    },
    {
      "id": "item_133",
      "name": "item_133.webp",
      "label": "AI Designer-Tri-fold brochure ",
      "title": "aifalcon - AI Designer-Tri-fold",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_133.jpg"
    },
    {
      "id": "item_134",
      "name": "item_134.webp",
      "label": "AI Designer-Packaging effect o",
      "title": "aifalcon - AI Designer-Packagin",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_134.jpg"
    },
    {
      "id": "item_135",
      "name": "item_135.webp",
      "label": "AI Designer-Company badge card",
      "title": "aifalcon - AI Designer-Company ",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_135.jpg"
    },
    {
      "id": "item_136",
      "name": "item_136.webp",
      "label": "AI Designer-Outdoor glass wall",
      "title": "aifalcon - AI Designer-Outdoor ",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_136.jpg"
    },
    {
      "id": "item_137",
      "name": "item_137.webp",
      "label": "AI Designer-Minimalist Brand M",
      "title": "aifalcon - AI Designer-Minimali",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_137.jpg"
    },
    {
      "id": "item_138",
      "name": "item_138.webp",
      "label": "AI Designer-Outdoor neon light",
      "title": "aifalcon - AI Designer-Outdoor ",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_138.jpg"
    },
    {
      "id": "item_139",
      "name": "item_139.webp",
      "label": "AI Designer-Notepad on leather",
      "title": "aifalcon - AI Designer-Notepad ",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_139.jpg"
    },
    {
      "id": "item_140",
      "name": "item_140.webp",
      "label": "AI Designer-Industrial style o",
      "title": "aifalcon - AI Designer-Industri",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_140.jpg"
    },
    {
      "id": "item_141",
      "name": "item_141.webp",
      "label": "AI Designer-Minimalist outdoor",
      "title": "aifalcon - AI Designer-Minimali",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_141.jpg"
    },
    {
      "id": "item_142",
      "name": "item_142.webp",
      "label": "AI Designer-Conference room wa",
      "title": "aifalcon - AI Designer-Conferen",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_142.jpg"
    },
    {
      "id": "item_143",
      "name": "item_143.webp",
      "label": "AI Designer-Super large shoppi",
      "title": "aifalcon - AI Designer-Super la",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_143.jpg"
    },
    {
      "id": "item_144",
      "name": "item_144.webp",
      "label": "AI Designer-Two-color hangtag ",
      "title": "aifalcon - AI Designer-Two-colo",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_144.jpg"
    },
    {
      "id": "item_145",
      "name": "item_145.webp",
      "label": "AI Designer-Outdoor street bil",
      "title": "aifalcon - AI Designer-Outdoor ",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_145.jpg"
    },
    {
      "id": "item_146",
      "name": "item_146.webp",
      "label": "AI Designer-Large outdoor buil",
      "title": "aifalcon - AI Designer-Large ou",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_146.jpg"
    },
    {
      "id": "item_147",
      "name": "item_147.webp",
      "label": "AI Designer-Outdoor glass bill",
      "title": "aifalcon - AI Designer-Outdoor ",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_147.jpg"
    },
    {
      "id": "item_148",
      "name": "item_148.webp",
      "label": "AI Designer-Large outdoor bill",
      "title": "aifalcon - AI Designer-Large ou",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_148.jpg"
    },
    {
      "id": "item_149",
      "name": "item_149.webp",
      "label": "AI Designer-Large outdoor wall",
      "title": "aifalcon - AI Designer-Large ou",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_149.jpg"
    },
    {
      "id": "item_150",
      "name": "item_150.webp",
      "label": "AI Designer-Ins Mobile Post Mo",
      "title": "aifalcon - AI Designer-Ins Mobi",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_150.jpg"
    },
    {
      "id": "item_151",
      "name": "item_151.webp",
      "label": "AI Designer-Circular badge log",
      "title": "aifalcon - AI Designer-Circular",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_151.jpg"
    },
    {
      "id": "item_152",
      "name": "item_152.webp",
      "label": "AI Designer-Minimalist envelop",
      "title": "aifalcon - AI Designer-Minimali",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_152.jpg"
    },
    {
      "id": "item_153",
      "name": "item_153.webp",
      "label": "AI Designer-Real scene desk st",
      "title": "aifalcon - AI Designer-Real sce",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_153.jpg"
    },
    {
      "id": "item_154",
      "name": "item_154.webp",
      "label": "AI Designer-Brand letter paper",
      "title": "aifalcon - AI Designer-Brand le",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_154.jpg"
    },
    {
      "id": "item_155",
      "name": "item_155.webp",
      "label": "AI Designer-Brand Guidelines -",
      "title": "aifalcon - AI Designer-Brand Gu",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_155.jpg"
    },
    {
      "id": "item_156",
      "name": "item_156.webp",
      "label": "AI Designer-Real scene desk st",
      "title": "aifalcon - AI Designer-Real sce",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_156.jpg"
    },
    {
      "id": "item_157",
      "name": "item_157.webp",
      "label": "AI Designer-Canvas bag logo mo",
      "title": "aifalcon - AI Designer-Canvas b",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_157.jpg"
    },
    {
      "id": "item_158",
      "name": "item_158.webp",
      "label": "AI Designer-Wall 3-connected b",
      "title": "aifalcon - AI Designer-Wall 3-c",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_158.jpg"
    },
    {
      "id": "item_159",
      "name": "item_159.webp",
      "label": "AI Designer-Street cylindrical",
      "title": "aifalcon - AI Designer-Street c",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_159.jpg"
    },
    {
      "id": "item_160",
      "name": "item_160.webp",
      "label": "AI Designer-Brand Guidelines -",
      "title": "aifalcon - AI Designer-Brand Gu",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_160.jpg"
    },
    {
      "id": "item_161",
      "name": "item_161.webp",
      "label": "AI Designer-Venue event exhibi",
      "title": "aifalcon - AI Designer-Venue ev",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_161.jpg"
    },
    {
      "id": "item_162",
      "name": "item_162.webp",
      "label": "AI Designer-3D stereo effect o",
      "title": "aifalcon - AI Designer-3D stere",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_162.jpg"
    },
    {
      "id": "item_163",
      "name": "item_163.webp",
      "label": "AI Designer-Minimalist busines",
      "title": "aifalcon - AI Designer-Minimali",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_163.jpg"
    },
    {
      "id": "item_164",
      "name": "item_164.webp",
      "label": "AI Designer-Backpack mock-up d",
      "title": "aifalcon - AI Designer-Backpack",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_164.jpg"
    },
    {
      "id": "item_165",
      "name": "item_165.webp",
      "label": "AI Designer-App application ic",
      "title": "aifalcon - AI Designer-App appl",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_165.jpg"
    },
    {
      "id": "item_166",
      "name": "item_166.webp",
      "label": "AI Designer-Brand letter paper",
      "title": "aifalcon - AI Designer-Brand le",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_166.jpg"
    },
    {
      "id": "item_167",
      "name": "item_167.webp",
      "label": "AI Designer-Simple book page l",
      "title": "aifalcon - AI Designer-Simple b",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_167.jpg"
    },
    {
      "id": "item_168",
      "name": "item_168.webp",
      "label": "AI Designer-Office scene busin",
      "title": "aifalcon - AI Designer-Office s",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_168.jpg"
    },
    {
      "id": "item_169",
      "name": "item_169.webp",
      "label": "AI Designer-Mobile phone icon ",
      "title": "aifalcon - AI Designer-Mobile p",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_169.jpg"
    },
    {
      "id": "item_170",
      "name": "item_170.webp",
      "label": "AI Designer-Brand VI stationer",
      "title": "aifalcon - AI Designer-Brand VI",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_170.jpg"
    },
    {
      "id": "item_171",
      "name": "item_171.webp",
      "label": "AI Designer-Round billboard mo",
      "title": "aifalcon - AI Designer-Round bi",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_171.jpg"
    },
    {
      "id": "item_172",
      "name": "item_172.webp",
      "label": "AI Designer-Badge lanyard logo",
      "title": "aifalcon - AI Designer-Badge la",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_172.jpg"
    },
    {
      "id": "item_173",
      "name": "item_173.webp",
      "label": "AI Designer-Minimalist Brand M",
      "title": "aifalcon - AI Designer-Minimali",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_173.jpg"
    },
    {
      "id": "item_174",
      "name": "item_174.webp",
      "label": "AI Designer-Notepad on leather",
      "title": "aifalcon - AI Designer-Notepad ",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_174.jpg"
    },
    {
      "id": "item_175",
      "name": "item_175.webp",
      "label": "AI Designer-Sticky note paper ",
      "title": "aifalcon - AI Designer-Sticky n",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_175.jpg"
    },
    {
      "id": "item_176",
      "name": "item_176.webp",
      "label": "AI Designer-Brand Guidelines -",
      "title": "aifalcon - AI Designer-Brand Gu",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_176.jpg"
    },
    {
      "id": "item_177",
      "name": "item_177.webp",
      "label": "AI Designer-Simple brand vi lo",
      "title": "aifalcon - AI Designer-Simple b",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_177.jpg"
    },
    {
      "id": "item_178",
      "name": "item_178.webp",
      "label": "AI Designer-Simple book page l",
      "title": "aifalcon - AI Designer-Simple b",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_178.jpg"
    },
    {
      "id": "item_179",
      "name": "item_179.webp",
      "label": "AI Designer-Brand Guidelines -",
      "title": "aifalcon - AI Designer-Brand Gu",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_179.jpg"
    },
    {
      "id": "item_180",
      "name": "item_180.webp",
      "label": "AI Designer-Minimalist sweatsh",
      "title": "aifalcon - AI Designer-Minimali",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_180.jpg"
    },
    {
      "id": "item_181",
      "name": "item_181.webp",
      "label": "AI Designer-Minimalist bag log",
      "title": "aifalcon - AI Designer-Minimali",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_181.jpg"
    },
    {
      "id": "item_182",
      "name": "item_182.webp",
      "label": "AI Designer-Facebook Image Pos",
      "title": "aifalcon - AI Designer-Facebook",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_182.jpg"
    },
    {
      "id": "item_183",
      "name": "item_183.webp",
      "label": "AI Designer-Minimalist style b",
      "title": "aifalcon - AI Designer-Minimali",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_183.jpg"
    },
    {
      "id": "item_184",
      "name": "item_184.webp",
      "label": "AI Designer-Minimalist Brand M",
      "title": "aifalcon - AI Designer-Minimali",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_184.jpg"
    },
    {
      "id": "item_185",
      "name": "item_185.webp",
      "label": "AI Designer-High quality shopp",
      "title": "aifalcon - AI Designer-High qua",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_185.jpg"
    },
    {
      "id": "item_186",
      "name": "item_186.webp",
      "label": "AI Designer-Backpack mock-up d",
      "title": "aifalcon - AI Designer-Backpack",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_186.jpg"
    },
    {
      "id": "item_187",
      "name": "item_187.webp",
      "label": "AI Designer-Hand holding mobil",
      "title": "aifalcon - AI Designer-Hand hol",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_187.jpg"
    },
    {
      "id": "item_188",
      "name": "item_188.webp",
      "label": "Aifalcinlogo.png",
      "title": "aifalcon - Aifalcinlogo",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_188.jpg"
    },
    {
      "id": "item_189",
      "name": "item_189.webp",
      "label": "AI Designer-Stainless steel th",
      "title": "aifalcon - AI Designer-Stainles",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_189.jpg"
    },
    {
      "id": "item_190",
      "name": "item_190.webp",
      "label": "AI Designer-Brand VI stationer",
      "title": "aifalcon - AI Designer-Brand VI",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_190.jpg"
    },
    {
      "id": "item_260",
      "name": "item_260.webp",
      "label": "AI Designer-Company badge card",
      "title": "ecolixir - AI Designer-Company ",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_260.jpg"
    },
    {
      "id": "item_261",
      "name": "item_261.webp",
      "label": "AI Designer-Woman Wears Canvas",
      "title": "ecolixir - AI Designer-Woman We",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_261.jpg"
    },
    {
      "id": "item_262",
      "name": "item_262.webp",
      "label": "AI Designer-Individual paper t",
      "title": "ecolixir - AI Designer-Individu",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_262.jpg"
    },
    {
      "id": "item_263",
      "name": "item_263.webp",
      "label": "AI Designer-Logo renderings of",
      "title": "ecolixir - AI Designer-Logo ren",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_263.jpg"
    },
    {
      "id": "item_264",
      "name": "item_264.webp",
      "label": "AI Designer-Outdoor billboard ",
      "title": "ecolixir - AI Designer-Outdoor ",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_264.jpg"
    },
    {
      "id": "item_265",
      "name": "item_265.webp",
      "label": "AI Designer-Drawstring bag dis",
      "title": "ecolixir - AI Designer-Drawstri",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_265.jpg"
    },
    {
      "id": "item_266",
      "name": "item_266.webp",
      "label": "AI Designer-Brand VI stationer",
      "title": "ecolixir - AI Designer-Brand VI",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_266.jpg"
    },
    {
      "id": "item_267",
      "name": "item_267.webp",
      "label": "AI Designer-Notepad on leather",
      "title": "ecolixir - AI Designer-Notepad ",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_267.jpg"
    },
    {
      "id": "item_268",
      "name": "item_268.webp",
      "label": "AI Designer-Street Billboard S",
      "title": "ecolixir - AI Designer-Street B",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_268.jpg"
    },
    {
      "id": "item_269",
      "name": "item_269.webp",
      "label": "AI Designer-City center large ",
      "title": "ecolixir - AI Designer-City cen",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_269.jpg"
    },
    {
      "id": "item_270",
      "name": "item_270.webp",
      "label": "AI Designer-Lady wearing t-shi",
      "title": "ecolixir - AI Designer-Lady wea",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_270.jpg"
    },
    {
      "id": "item_271",
      "name": "item_271.webp",
      "label": "AI Designer-Business card lett",
      "title": "ecolixir - AI Designer-Business",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_271.jpg"
    },
    {
      "id": "item_272",
      "name": "item_272.webp",
      "label": "AI Designer-Apple iPhone App s",
      "title": "ecolixir - AI Designer-Apple iP",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_272.jpg"
    },
    {
      "id": "item_273",
      "name": "item_273.webp",
      "label": "AI Designer-Minimalist Brand M",
      "title": "ecolixir - AI Designer-Minimali",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_273.jpg"
    },
    {
      "id": "item_274",
      "name": "item_274.webp",
      "label": "AI Designer-Character holding ",
      "title": "ecolixir - AI Designer-Characte",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_274.jpg"
    },
    {
      "id": "item_275",
      "name": "item_275.webp",
      "label": "AI Designer-Simple literary en",
      "title": "ecolixir - AI Designer-Simple l",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_275.jpg"
    },
    {
      "id": "item_276",
      "name": "item_276.webp",
      "label": "AI Designer-Simple literary en",
      "title": "ecolixir - AI Designer-Simple l",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_276.jpg"
    },
    {
      "id": "item_277",
      "name": "item_277.webp",
      "label": "AI Designer-Outdoor billboard ",
      "title": "ecolixir - AI Designer-Outdoor ",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_277.jpg"
    },
    {
      "id": "item_278",
      "name": "item_278.webp",
      "label": "AI Designer-Street restaurant ",
      "title": "ecolixir - AI Designer-Street r",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_278.jpg"
    },
    {
      "id": "item_279",
      "name": "item_279.webp",
      "label": "AI Designer-Logo effect drawin",
      "title": "ecolixir - AI Designer-Logo eff",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_279.jpg"
    },
    {
      "id": "item_280",
      "name": "item_280.webp",
      "label": "AI Designer-Black and white T-",
      "title": "ecolixir - AI Designer-Black an",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_280.jpg"
    },
    {
      "id": "item_281",
      "name": "item_281.webp",
      "label": "AI Designer-Minimalist T-shirt",
      "title": "ecolixir - AI Designer-Minimali",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_281.jpg"
    },
    {
      "id": "item_282",
      "name": "item_282.webp",
      "label": "AI Designer-Effect drawing of ",
      "title": "ecolixir - AI Designer-Effect d",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_282.jpg"
    },
    {
      "id": "item_283",
      "name": "item_283.webp",
      "label": "AI Designer-White T-shirt hold",
      "title": "ecolixir - AI Designer-White T-",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_283.jpg"
    },
    {
      "id": "item_284",
      "name": "item_284.webp",
      "label": "AI Designer-Brand VI stationer",
      "title": "ecolixir - AI Designer-Brand VI",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_284.jpg"
    },
    {
      "id": "item_285",
      "name": "item_285.webp",
      "label": "AI Designer-Brand Guidelines -",
      "title": "ecolixir - AI Designer-Brand Gu",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_285.jpg"
    },
    {
      "id": "item_286",
      "name": "item_286.webp",
      "label": "AI Designer-Three-dimensional ",
      "title": "ecolixir - AI Designer-Three-di",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_286.jpg"
    },
    {
      "id": "item_287",
      "name": "item_287.webp",
      "label": "AI Designer-Real old man weari",
      "title": "ecolixir - AI Designer-Real old",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_287.jpg"
    },
    {
      "id": "item_288",
      "name": "item_288.webp",
      "label": "AI Designer-Effect drawing of ",
      "title": "ecolixir - AI Designer-Effect d",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_288.jpg"
    },
    {
      "id": "item_289",
      "name": "item_289.webp",
      "label": "AI Designer-Glass door logo di",
      "title": "ecolixir - AI Designer-Glass do",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_289.jpg"
    },
    {
      "id": "item_290",
      "name": "item_290.webp",
      "label": "AI Designer-Company badge card",
      "title": "ecolixir - AI Designer-Company ",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_290.jpg"
    },
    {
      "id": "item_291",
      "name": "item_291.webp",
      "label": "AI Designer-Street restaurant ",
      "title": "ecolixir - AI Designer-Street r",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_291.jpg"
    },
    {
      "id": "item_292",
      "name": "item_292.webp",
      "label": "AI Designer-Large outdoor bill",
      "title": "ecolixir - AI Designer-Large ou",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_292.jpg"
    },
    {
      "id": "item_293",
      "name": "item_293.webp",
      "label": "AI Designer-Outdoor billboard ",
      "title": "ecolixir - AI Designer-Outdoor ",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_293.jpg"
    },
    {
      "id": "item_294",
      "name": "item_294.webp",
      "label": "AI Designer-Leisure office sce",
      "title": "ecolixir - AI Designer-Leisure ",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_294.jpg"
    },
    {
      "id": "item_295",
      "name": "item_295.webp",
      "label": "AI Designer-Simple enterprise ",
      "title": "ecolixir - AI Designer-Simple e",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_295.jpg"
    },
    {
      "id": "item_296",
      "name": "item_296.webp",
      "label": "AI Designer-Outdoor canvas bag",
      "title": "ecolixir - AI Designer-Outdoor ",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_296.jpg"
    },
    {
      "id": "item_297",
      "name": "item_297.webp",
      "label": "AI Designer-Real scene desk st",
      "title": "ecolixir - AI Designer-Real sce",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_297.jpg"
    },
    {
      "id": "item_298",
      "name": "item_298.webp",
      "label": "AI Designer-Canvas bag clothin",
      "title": "ecolixir - AI Designer-Canvas b",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_298.jpg"
    },
    {
      "id": "item_299",
      "name": "item_299.webp",
      "label": "AI Designer-Desktop coaster lo",
      "title": "ecolixir - AI Designer-Desktop ",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_299.jpg"
    },
    {
      "id": "item_300",
      "name": "item_300.webp",
      "label": "AI Designer-T-shirt logo displ",
      "title": "ecolixir - AI Designer-T-shirt ",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_300.jpg"
    },
    {
      "id": "item_301",
      "name": "item_301.webp",
      "label": "Color_full logo.png",
      "title": "ecolixir - Color_full logo",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_301.jpg"
    },
    {
      "id": "item_302",
      "name": "item_302.webp",
      "label": "Mono color_full logo.png",
      "title": "ecolixir - Mono color_full logo",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_302.jpg"
    },
    {
      "id": "item_303",
      "name": "item_303.webp",
      "label": "White_full logo.png",
      "title": "ecolixir - White_full logo",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_303.jpg"
    },
    {
      "id": "item_304",
      "name": "item_304.webp",
      "label": "Black_full logo.png",
      "title": "ecolixir - Black_full logo",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_304.jpg"
    },
    {
      "id": "item_305",
      "name": "item_305.webp",
      "label": "White_wordmark.png",
      "title": "ecolixir - White_wordmark",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_305.jpg"
    },
    {
      "id": "item_306",
      "name": "item_306.webp",
      "label": "Black_wordmark.png",
      "title": "ecolixir - Black_wordmark",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_306.jpg"
    },
    {
      "id": "item_307",
      "name": "item_307.webp",
      "label": "Color_wordmark.png",
      "title": "ecolixir - Color_wordmark",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_307.jpg"
    },
    {
      "id": "item_308",
      "name": "item_308.webp",
      "label": "Ecolixir_inverse_color.png",
      "title": "ecolixir - Ecolixir_inverse_col",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_308.jpg"
    },
    {
      "id": "item_309",
      "name": "item_309.webp",
      "label": "Ecolixir_inverse.png",
      "title": "ecolixir - Ecolixir_inverse",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_309.jpg"
    },
    {
      "id": "item_310",
      "name": "item_310.webp",
      "label": "Ecolixir_color.png",
      "title": "ecolixir - Ecolixir_color",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_310.jpg"
    },
    {
      "id": "item_311",
      "name": "item_311.webp",
      "label": "Ecolixir_white.png",
      "title": "ecolixir - Ecolixir_white",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_311.jpg"
    },
    {
      "id": "item_312",
      "name": "item_312.webp",
      "label": "Ecolixir_Black_1.png",
      "title": "ecolixir - Ecolixir_Black_1",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_312.jpg"
    },
    {
      "id": "item_313",
      "name": "item_313.webp",
      "label": "Ecolixir_inverse.png",
      "title": "ecolixir - Ecolixir_inverse",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_313.jpg"
    },
    {
      "id": "item_314",
      "name": "item_314.webp",
      "label": "Ecolixir_color.png",
      "title": "ecolixir - Ecolixir_color",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_314.jpg"
    },
    {
      "id": "item_315",
      "name": "item_315.webp",
      "label": "Ecolixir_Black_1.png",
      "title": "ecolixir - Ecolixir_Black_1",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_315.jpg"
    },
    {
      "id": "item_358",
      "name": "item_358.webp",
      "label": "signup-1.jpg",
      "title": "Log in FOR ALTEREDAI - signup-1",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_358.jpg"
    },
    {
      "id": "item_359",
      "name": "item_359.webp",
      "label": "signup-2.jpg",
      "title": "Log in FOR ALTEREDAI - signup-2",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_359.jpg"
    },
    {
      "id": "item_360",
      "name": "item_360.webp",
      "label": "signup-3.jpg",
      "title": "Log in FOR ALTEREDAI - signup-3",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_360.jpg"
    },
    {
      "id": "item_361",
      "name": "item_361.webp",
      "label": "signup-4.jpg",
      "title": "Log in FOR ALTEREDAI - signup-4",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_361.jpg"
    },
    {
      "id": "item_362",
      "name": "item_362.webp",
      "label": "signup-5.jpg",
      "title": "Log in FOR ALTEREDAI - signup-5",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_362.jpg"
    },
    {
      "id": "item_363",
      "name": "item_363.webp",
      "label": "signup-1-4.jpg",
      "title": "Log in FOR ALTEREDAI - signup-1-4",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_363.jpg"
    },
    {
      "id": "item_364",
      "name": "item_364.webp",
      "label": "signup-1-1.jpg",
      "title": "Log in FOR ALTEREDAI - signup-1-1",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_364.jpg"
    },
    {
      "id": "item_365",
      "name": "item_365.webp",
      "label": "signup-1-2.jpg",
      "title": "Log in FOR ALTEREDAI - signup-1-2",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_365.jpg"
    },
    {
      "id": "item_366",
      "name": "item_366.webp",
      "label": "signup-1-3.jpg",
      "title": "Log in FOR ALTEREDAI - signup-1-3",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_366.jpg"
    },
    {
      "id": "item_368",
      "name": "item_368.webp",
      "label": "User.jpg",
      "title": "User-ALTEREDAI - User",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_368.jpg"
    },
    {
      "id": "item_369",
      "name": "item_369.webp",
      "label": "User3.jpg",
      "title": "User-ALTEREDAI - User3",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_369.jpg"
    },
    {
      "id": "item_370",
      "name": "item_370.webp",
      "label": "User3-1.jpg",
      "title": "User-ALTEREDAI - User3-1",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_370.jpg"
    },
    {
      "id": "item_371",
      "name": "item_371.webp",
      "label": "User2.jpg",
      "title": "User-ALTEREDAI - User2",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_371.jpg"
    },
    {
      "id": "item_372",
      "name": "item_372.webp",
      "label": "User4.jpg",
      "title": "User-ALTEREDAI - User4",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_372.jpg"
    },
    {
      "id": "item_373",
      "name": "item_373.webp",
      "label": "User 5.jpg",
      "title": "User-ALTEREDAI - User 5",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Brand identity, logos, and digital profile visuals.",
      "hiresPath": "assets/portfolio/hires/item_373.jpg"
    }
  ],
  "challenges": [
    {
      "id": "item_80",
      "name": "item_80.webp",
      "label": "90 2.png",
      "title": "BuiLD2.0 - 02 - 90 2",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "UI/UX design challenge screens and prototypes.",
      "hiresPath": "assets/portfolio/hires/item_80.jpg"
    },
    {
      "id": "item_81",
      "name": "item_81.webp",
      "label": "90 3.png",
      "title": "BuiLD2.0 - 02 - 90 3",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "UI/UX design challenge screens and prototypes.",
      "hiresPath": "assets/portfolio/hires/item_81.jpg"
    },
    {
      "id": "item_82",
      "name": "item_82.webp",
      "label": "Desktop - 1.png",
      "title": "BuiLD2.0 - 02 - Desktop - 1",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "UI/UX design challenge screens and prototypes.",
      "hiresPath": "assets/portfolio/hires/item_82.jpg"
    },
    {
      "id": "item_83",
      "name": "item_83.webp",
      "label": "90.png",
      "title": "BuiLD2.0 - 02 - 90",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "UI/UX design challenge screens and prototypes.",
      "hiresPath": "assets/portfolio/hires/item_83.jpg"
    },
    {
      "id": "item_84",
      "name": "item_84.webp",
      "label": "90 5.png",
      "title": "BuiLD2.0 - 05 - 90 5",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "UI/UX design challenge screens and prototypes.",
      "hiresPath": "assets/portfolio/hires/item_84.jpg"
    },
    {
      "id": "item_85",
      "name": "item_85.webp",
      "label": "90 3.png",
      "title": "BuiLD2.0 - 05 - 90 3",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "UI/UX design challenge screens and prototypes.",
      "hiresPath": "assets/portfolio/hires/item_85.jpg"
    },
    {
      "id": "item_86",
      "name": "item_86.webp",
      "label": "90 1.png",
      "title": "BuiLD2.0 - 05 - 90 1",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "UI/UX design challenge screens and prototypes.",
      "hiresPath": "assets/portfolio/hires/item_86.jpg"
    },
    {
      "id": "item_87",
      "name": "item_87.webp",
      "label": "Group 24.png",
      "title": "BuiLD2.0 - 05 - Group 24",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "UI/UX design challenge screens and prototypes.",
      "hiresPath": "assets/portfolio/hires/item_87.jpg"
    },
    {
      "id": "item_88",
      "name": "item_88.webp",
      "label": "Group 25.png",
      "title": "BuiLD2.0 - 05 - Group 25",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "UI/UX design challenge screens and prototypes.",
      "hiresPath": "assets/portfolio/hires/item_88.jpg"
    },
    {
      "id": "item_89",
      "name": "item_89.webp",
      "label": "Rectangle 21.png",
      "title": "BuiLD2.0 - 05 - Rectangle 21",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "UI/UX design challenge screens and prototypes.",
      "hiresPath": "assets/portfolio/hires/item_89.jpg"
    },
    {
      "id": "item_90",
      "name": "item_90.webp",
      "label": "Market 5.png",
      "title": "Lottle - Market 5",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "UI/UX design challenge screens and prototypes.",
      "hiresPath": "assets/portfolio/hires/item_90.jpg"
    },
    {
      "id": "item_91",
      "name": "item_91.webp",
      "label": "d95318575b18803892eecb21ebe090",
      "title": "Lottle - d95318575b18803892ee",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "UI/UX design challenge screens and prototypes.",
      "hiresPath": "assets/portfolio/hires/item_91.jpg"
    },
    {
      "id": "item_92",
      "name": "item_92.webp",
      "label": "Lottle logo .png",
      "title": "Lottle - Lottle logo ",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "UI/UX design challenge screens and prototypes.",
      "hiresPath": "assets/portfolio/hires/item_92.jpg"
    },
    {
      "id": "item_93",
      "name": "item_93.webp",
      "label": "iPhone 13 Pro 2.png",
      "title": "Lottle - iPhone 13 Pro 2",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "UI/UX design challenge screens and prototypes.",
      "hiresPath": "assets/portfolio/hires/item_93.jpg"
    },
    {
      "id": "item_94",
      "name": "item_94.webp",
      "label": "90 2.png",
      "title": "BuiLD2.0 - 03 - 90 2",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "UI/UX design challenge screens and prototypes.",
      "hiresPath": "assets/portfolio/hires/item_94.jpg"
    },
    {
      "id": "item_95",
      "name": "item_95.webp",
      "label": "90.png",
      "title": "BuiLD2.0 - 03 - 90",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "UI/UX design challenge screens and prototypes.",
      "hiresPath": "assets/portfolio/hires/item_95.jpg"
    },
    {
      "id": "item_112",
      "name": "item_112.webp",
      "label": "90.png",
      "title": "BuiLD2.0 - 10 - 90",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "UI/UX design challenge screens and prototypes.",
      "hiresPath": "assets/portfolio/hires/item_112.jpg"
    },
    {
      "id": "item_191",
      "name": "item_191.webp",
      "label": "WhatsApp Image 2023-01-02 at 8",
      "title": "UI:UX - WhatsApp Image 2023-",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "UI/UX design challenge screens and prototypes.",
      "hiresPath": "assets/portfolio/hires/item_191.jpg"
    },
    {
      "id": "item_192",
      "name": "item_192.webp",
      "label": "WhatsApp Image 2023-01-02 at 8",
      "title": "UI:UX - WhatsApp Image 2023-",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "UI/UX design challenge screens and prototypes.",
      "hiresPath": "assets/portfolio/hires/item_192.jpg"
    },
    {
      "id": "item_193",
      "name": "item_193.webp",
      "label": "WhatsApp Image 2023-01-02 at 8",
      "title": "UI:UX - WhatsApp Image 2023-",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "UI/UX design challenge screens and prototypes.",
      "hiresPath": "assets/portfolio/hires/item_193.jpg"
    },
    {
      "id": "item_194",
      "name": "item_194.webp",
      "label": "Letter - 1.png",
      "title": "UI:UX - Letter - 1",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "UI/UX design challenge screens and prototypes.",
      "hiresPath": "assets/portfolio/hires/item_194.jpg"
    },
    {
      "id": "item_195",
      "name": "item_195.webp",
      "label": "Color-Psychology_Table_Ignyte-",
      "title": "UI:UX - Color-Psychology_Tab",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "UI/UX design challenge screens and prototypes.",
      "hiresPath": "assets/portfolio/hires/item_195.jpg"
    },
    {
      "id": "item_196",
      "name": "item_196.webp",
      "label": "Folder Mockup.png",
      "title": "UI:UX - Folder Mockup",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "UI/UX design challenge screens and prototypes.",
      "hiresPath": "assets/portfolio/hires/item_196.jpg"
    },
    {
      "id": "item_197",
      "name": "item_197.webp",
      "label": "WhatsApp Image 2023-01-02 at 8",
      "title": "UI:UX - WhatsApp Image 2023-",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "UI/UX design challenge screens and prototypes.",
      "hiresPath": "assets/portfolio/hires/item_197.jpg"
    },
    {
      "id": "item_198",
      "name": "item_198.webp",
      "label": "90 3.png",
      "title": "UI:UX - 90 3",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "UI/UX design challenge screens and prototypes.",
      "hiresPath": "assets/portfolio/hires/item_198.jpg"
    },
    {
      "id": "item_199",
      "name": "item_199.webp",
      "label": "90 3.png",
      "title": "UI:UX - 90 3",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "UI/UX design challenge screens and prototypes.",
      "hiresPath": "assets/portfolio/hires/item_199.jpg"
    },
    {
      "id": "item_200",
      "name": "item_200.webp",
      "label": "90 2.png",
      "title": "UI:UX - 90 2",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "UI/UX design challenge screens and prototypes.",
      "hiresPath": "assets/portfolio/hires/item_200.jpg"
    },
    {
      "id": "item_201",
      "name": "item_201.webp",
      "label": "90.png",
      "title": "UI:UX - 90",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "UI/UX design challenge screens and prototypes.",
      "hiresPath": "assets/portfolio/hires/item_201.jpg"
    },
    {
      "id": "item_202",
      "name": "item_202.webp",
      "label": "90.png",
      "title": "UI:UX - 90",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "UI/UX design challenge screens and prototypes.",
      "hiresPath": "assets/portfolio/hires/item_202.jpg"
    },
    {
      "id": "item_203",
      "name": "item_203.webp",
      "label": "90 2.png",
      "title": "UI:UX - 90 2",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "UI/UX design challenge screens and prototypes.",
      "hiresPath": "assets/portfolio/hires/item_203.jpg"
    },
    {
      "id": "item_204",
      "name": "item_204.webp",
      "label": "90.png",
      "title": "UI:UX - 90",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "UI/UX design challenge screens and prototypes.",
      "hiresPath": "assets/portfolio/hires/item_204.jpg"
    },
    {
      "id": "item_205",
      "name": "item_205.webp",
      "label": "90 3.png",
      "title": "UI:UX - 90 3",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "UI/UX design challenge screens and prototypes.",
      "hiresPath": "assets/portfolio/hires/item_205.jpg"
    },
    {
      "id": "item_206",
      "name": "item_206.webp",
      "label": "Rectangle 18.png",
      "title": "UI:UX - Rectangle 18",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "UI/UX design challenge screens and prototypes.",
      "hiresPath": "assets/portfolio/hires/item_206.jpg"
    },
    {
      "id": "item_207",
      "name": "item_207.webp",
      "label": "90.png",
      "title": "UI:UX - 90",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "UI/UX design challenge screens and prototypes.",
      "hiresPath": "assets/portfolio/hires/item_207.jpg"
    },
    {
      "id": "item_344",
      "name": "item_344.webp",
      "label": "90 2.png",
      "title": "BuiLD2.0 - 06 - 90 2",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "UI/UX design challenge screens and prototypes.",
      "hiresPath": "assets/portfolio/hires/item_344.jpg"
    },
    {
      "id": "item_345",
      "name": "item_345.webp",
      "label": "90 1.png",
      "title": "BuiLD2.0 - 06 - 90 1",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "UI/UX design challenge screens and prototypes.",
      "hiresPath": "assets/portfolio/hires/item_345.jpg"
    },
    {
      "id": "item_346",
      "name": "item_346.webp",
      "label": "Card.jpg",
      "title": "BuiLD2.0 - 01 - Card",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "UI/UX design challenge screens and prototypes.",
      "hiresPath": "assets/portfolio/hires/item_346.jpg"
    },
    {
      "id": "item_347",
      "name": "item_347.webp",
      "label": "Card.png",
      "title": "BuiLD2.0 - 01 - Card",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "UI/UX design challenge screens and prototypes.",
      "hiresPath": "assets/portfolio/hires/item_347.jpg"
    },
    {
      "id": "item_348",
      "name": "item_348.webp",
      "label": "90.png",
      "title": "BuiLD2.0 - 01 - 90",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "UI/UX design challenge screens and prototypes.",
      "hiresPath": "assets/portfolio/hires/item_348.jpg"
    },
    {
      "id": "item_349",
      "name": "item_349.webp",
      "label": "90.png",
      "title": "BuiLD2.0 - 01 - 90",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "UI/UX design challenge screens and prototypes.",
      "hiresPath": "assets/portfolio/hires/item_349.jpg"
    },
    {
      "id": "item_350",
      "name": "item_350.webp",
      "label": "90 4.png",
      "title": "BuiLD2.0 - 08 - 90 4",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "UI/UX design challenge screens and prototypes.",
      "hiresPath": "assets/portfolio/hires/item_350.jpg"
    },
    {
      "id": "item_351",
      "name": "item_351.webp",
      "label": "90 3.png",
      "title": "BuiLD2.0 - 08 - 90 3",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "UI/UX design challenge screens and prototypes.",
      "hiresPath": "assets/portfolio/hires/item_351.jpg"
    },
    {
      "id": "item_352",
      "name": "item_352.webp",
      "label": "90.png",
      "title": "BuiLD2.0 - 08 - 90",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "UI/UX design challenge screens and prototypes.",
      "hiresPath": "assets/portfolio/hires/item_352.jpg"
    },
    {
      "id": "item_353",
      "name": "item_353.webp",
      "label": "90.png",
      "title": "BuiLD2.0 - 09 - 90",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "UI/UX design challenge screens and prototypes.",
      "hiresPath": "assets/portfolio/hires/item_353.jpg"
    },
    {
      "id": "item_354",
      "name": "item_354.webp",
      "label": "90.png",
      "title": "BuiLD2.0 - 07 - 90",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "UI/UX design challenge screens and prototypes.",
      "hiresPath": "assets/portfolio/hires/item_354.jpg"
    },
    {
      "id": "item_355",
      "name": "item_355.webp",
      "label": "90 2.png",
      "title": "BuiLD2.0 - 12 - 90 2",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "UI/UX design challenge screens and prototypes.",
      "hiresPath": "assets/portfolio/hires/item_355.jpg"
    },
    {
      "id": "item_356",
      "name": "item_356.webp",
      "label": "90 1.png",
      "title": "BuiLD2.0 - 12 - 90 1",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "UI/UX design challenge screens and prototypes.",
      "hiresPath": "assets/portfolio/hires/item_356.jpg"
    },
    {
      "id": "item_357",
      "name": "item_357.webp",
      "label": "90.png",
      "title": "BuiLD2.0 - 12 - 90",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "UI/UX design challenge screens and prototypes.",
      "hiresPath": "assets/portfolio/hires/item_357.jpg"
    }
  ],
  "graphics": [
    {
      "id": "item_0",
      "name": "item_0.webp",
      "label": "screenshot-www.ostello.co.in-2",
      "title": "Misc - screenshot-www.ostel",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_0.jpg"
    },
    {
      "id": "item_1",
      "name": "item_1.webp",
      "label": "front-65d6464fee1b0-A3_Black_F",
      "title": "Misc - front-65d6464fee1b0-",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_1.jpg"
    },
    {
      "id": "item_2",
      "name": "item_2.webp",
      "label": "two-standing-smartphones-mocku",
      "title": "Misc - two-standing-smartph",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_2.jpg"
    },
    {
      "id": "item_3",
      "name": "item_3.webp",
      "label": "smartmockups_lgx0fxuv.jpg",
      "title": "Misc - smartmockups_lgx0fxu",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_3.jpg"
    },
    {
      "id": "item_4",
      "name": "item_4.webp",
      "label": "Variation .png",
      "title": "Misc - Variation ",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_4.jpg"
    },
    {
      "id": "item_5",
      "name": "item_5.webp",
      "label": "IMG_0189.PNG",
      "title": "Misc - IMG_0189",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_5.jpg"
    },
    {
      "id": "item_6",
      "name": "item_6.webp",
      "label": "screenshot-www.ostello.co.in-2",
      "title": "Misc - screenshot-www.ostel",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_6.jpg"
    },
    {
      "id": "item_7",
      "name": "item_7.webp",
      "label": "Home_KHELOJETO.png",
      "title": "Misc - Home_KHELOJETO",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_7.jpg"
    },
    {
      "id": "item_8",
      "name": "item_8.webp",
      "label": "smartmockups_lgxgcw5f.jpg",
      "title": "Misc - smartmockups_lgxgcw5",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_8.jpg"
    },
    {
      "id": "item_9",
      "name": "item_9.webp",
      "label": "Desktop - 11.png",
      "title": "Misc - Desktop - 11",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_9.jpg"
    },
    {
      "id": "item_10",
      "name": "item_10.webp",
      "label": "smartmockups_ljw1hnj4.jpg",
      "title": "Misc - smartmockups_ljw1hnj",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_10.jpg"
    },
    {
      "id": "item_11",
      "name": "item_11.webp",
      "label": "Mockup.png",
      "title": "Misc - Mockup",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_11.jpg"
    },
    {
      "id": "item_12",
      "name": "item_12.webp",
      "label": "ADIGURU LOGO.png",
      "title": "Misc - ADIGURU LOGO",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_12.jpg"
    },
    {
      "id": "item_13",
      "name": "item_13.webp",
      "label": "smartmockups_lgx0ki6p.jpg",
      "title": "Misc - smartmockups_lgx0ki6",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_13.jpg"
    },
    {
      "id": "item_14",
      "name": "item_14.webp",
      "label": "smartmockups_lm291yic.jpg",
      "title": "Misc - smartmockups_lm291yi",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_14.jpg"
    },
    {
      "id": "item_15",
      "name": "item_15.webp",
      "label": "Wedding Invitation Card 2.png",
      "title": "Misc - Wedding Invitation C",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_15.jpg"
    },
    {
      "id": "item_16",
      "name": "item_16.webp",
      "label": "smartmockups_lm28yp65.jpg",
      "title": "Misc - smartmockups_lm28yp6",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_16.jpg"
    },
    {
      "id": "item_17",
      "name": "item_17.webp",
      "label": "pr. sonku.png",
      "title": "Misc - pr. sonku",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_17.jpg"
    },
    {
      "id": "item_18",
      "name": "item_18.webp",
      "label": "smartmockups_lm2bibie.jpg",
      "title": "Misc - smartmockups_lm2bibi",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_18.jpg"
    },
    {
      "id": "item_19",
      "name": "item_19.webp",
      "label": "WhatsApp Image 2022-06-21 at 1",
      "title": "Misc - WhatsApp Image 2022-",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_19.jpg"
    },
    {
      "id": "item_20",
      "name": "item_20.webp",
      "label": "screenshot-www.ostello.co.in-2",
      "title": "Misc - screenshot-www.ostel",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_20.jpg"
    },
    {
      "id": "item_21",
      "name": "item_21.webp",
      "label": "smartmockups_lm294v79.jpg",
      "title": "Misc - smartmockups_lm294v7",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_21.jpg"
    },
    {
      "id": "item_22",
      "name": "item_22.webp",
      "label": "A4 - 13.png",
      "title": "Misc - A4 - 13",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_22.jpg"
    },
    {
      "id": "item_23",
      "name": "item_23.webp",
      "label": "smartmockups_lm2bkj0s.jpg",
      "title": "Misc - smartmockups_lm2bkj0",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_23.jpg"
    },
    {
      "id": "item_24",
      "name": "item_24.webp",
      "label": "Colorograogy-1.png",
      "title": "Misc - Colorograogy-1",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_24.jpg"
    },
    {
      "id": "item_25",
      "name": "item_25.webp",
      "label": "WhatsApp Image 2022-06-21 at 1",
      "title": "Misc - WhatsApp Image 2022-",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_25.jpg"
    },
    {
      "id": "item_26",
      "name": "item_26.webp",
      "label": "Desktop - 3.png",
      "title": "Misc - Desktop - 3",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_26.jpg"
    },
    {
      "id": "item_27",
      "name": "item_27.webp",
      "label": "Frame 136.png",
      "title": "Misc - Frame 136",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_27.jpg"
    },
    {
      "id": "item_28",
      "name": "item_28.webp",
      "label": "iphone-multiple-screens-mockup",
      "title": "Misc - iphone-multiple-scre",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_28.jpg"
    },
    {
      "id": "item_29",
      "name": "item_29.webp",
      "label": "smartmockups_lgx0muuu.jpg",
      "title": "Misc - smartmockups_lgx0muu",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_29.jpg"
    },
    {
      "id": "item_30",
      "name": "item_30.webp",
      "label": "front-65d645d2ba2b2-A4_White_F",
      "title": "Misc - front-65d645d2ba2b2-",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_30.jpg"
    },
    {
      "id": "item_31",
      "name": "item_31.webp",
      "label": "LOGO 31.png",
      "title": "Misc - LOGO 31",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_31.jpg"
    },
    {
      "id": "item_32",
      "name": "item_32.webp",
      "label": "smartmockups_lgx1zmcr.jpg",
      "title": "Misc - smartmockups_lgx1zmc",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_32.jpg"
    },
    {
      "id": "item_33",
      "name": "item_33.webp",
      "label": "Wedding Invitation Card.png",
      "title": "Misc - Wedding Invitation C",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_33.jpg"
    },
    {
      "id": "item_34",
      "name": "item_34.webp",
      "label": "WATER REFLACTION PROJECT.png",
      "title": "Misc - WATER REFLACTION PRO",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_34.jpg"
    },
    {
      "id": "item_35",
      "name": "item_35.webp",
      "label": "Facebook cover - 1.png",
      "title": "Misc - Facebook cover - 1",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_35.jpg"
    },
    {
      "id": "item_36",
      "name": "item_36.webp",
      "label": "smartmockups_lm28y9ja.jpg",
      "title": "Misc - smartmockups_lm28y9j",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_36.jpg"
    },
    {
      "id": "item_37",
      "name": "item_37.webp",
      "label": "screenshot-www.ostello.co.in-2",
      "title": "Misc - screenshot-www.ostel",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_37.jpg"
    },
    {
      "id": "item_38",
      "name": "item_38.webp",
      "label": "Log in.png",
      "title": "Misc - Log in",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_38.jpg"
    },
    {
      "id": "item_39",
      "name": "item_39.webp",
      "label": "front-65d6462ce4277-A3_White_F",
      "title": "Misc - front-65d6462ce4277-",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_39.jpg"
    },
    {
      "id": "item_40",
      "name": "item_40.webp",
      "label": "Home ngo.png",
      "title": "Misc - Home ngo",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_40.jpg"
    },
    {
      "id": "item_41",
      "name": "item_41.webp",
      "label": "Glassmorphism.png",
      "title": "Misc - Glassmorphism",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_41.jpg"
    },
    {
      "id": "item_42",
      "name": "item_42.webp",
      "label": "HOME-ADS.png",
      "title": "Misc - HOME-ADS",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_42.jpg"
    },
    {
      "id": "item_43",
      "name": "item_43.webp",
      "label": "Destinations.png",
      "title": "Misc - Destinations",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_43.jpg"
    },
    {
      "id": "item_44",
      "name": "item_44.webp",
      "label": "LOGO 3.png",
      "title": "Misc - LOGO 3",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_44.jpg"
    },
    {
      "id": "item_45",
      "name": "item_45.webp",
      "label": "logo 2.png",
      "title": "Misc - logo 2",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_45.jpg"
    },
    {
      "id": "item_46",
      "name": "item_46.webp",
      "label": "IMG_0253.PNG",
      "title": "Misc - IMG_0253",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_46.jpg"
    },
    {
      "id": "item_47",
      "name": "item_47.webp",
      "label": "Home-tribhangi.png",
      "title": "Misc - Home-tribhangi",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_47.jpg"
    },
    {
      "id": "item_48",
      "name": "item_48.webp",
      "label": "A4 - 19.png",
      "title": "Misc - A4 - 19",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_48.jpg"
    },
    {
      "id": "item_49",
      "name": "item_49.webp",
      "label": "HOME-ADS 2.png",
      "title": "Misc - HOME-ADS 2",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_49.jpg"
    },
    {
      "id": "item_50",
      "name": "item_50.webp",
      "label": "WhatsApp Image 2023-09-18 at 7",
      "title": "Misc - WhatsApp Image 2023-",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_50.jpg"
    },
    {
      "id": "item_51",
      "name": "item_51.webp",
      "label": "Home 6.png",
      "title": "Misc - Home 6",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_51.jpg"
    },
    {
      "id": "item_52",
      "name": "item_52.webp",
      "label": "Untitled_Artwork 3.jpg",
      "title": "Misc - Untitled_Artwork 3",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_52.jpg"
    },
    {
      "id": "item_53",
      "name": "item_53.webp",
      "label": "Untitled_Artwork 3.png",
      "title": "Misc - Untitled_Artwork 3",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_53.jpg"
    },
    {
      "id": "item_54",
      "name": "item_54.webp",
      "label": "Untitled_Artwork 2.png",
      "title": "Misc - Untitled_Artwork 2",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_54.jpg"
    },
    {
      "id": "item_55",
      "name": "item_55.webp",
      "label": "208.png",
      "title": "Misc - 208",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_55.jpg"
    },
    {
      "id": "item_56",
      "name": "item_56.webp",
      "label": "Untitled_Artwork 2.jpg",
      "title": "Misc - Untitled_Artwork 2",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_56.jpg"
    },
    {
      "id": "item_57",
      "name": "item_57.webp",
      "label": "Magic foods.png",
      "title": "Misc - Magic foods",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_57.jpg"
    },
    {
      "id": "item_58",
      "name": "item_58.webp",
      "label": "smartmockups_lgx0zt2y.jpg",
      "title": "Misc - smartmockups_lgx0zt2",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_58.jpg"
    },
    {
      "id": "item_59",
      "name": "item_59.webp",
      "label": "WhatsApp Image 2022-06-21 at 1",
      "title": "Misc - WhatsApp Image 2022-",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_59.jpg"
    },
    {
      "id": "item_60",
      "name": "item_60.webp",
      "label": "Frame 600.png",
      "title": "Misc - Frame 600",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_60.jpg"
    },
    {
      "id": "item_61",
      "name": "item_61.webp",
      "label": "Untitled_Artwork.jpg",
      "title": "Misc - Untitled_Artwork",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_61.jpg"
    },
    {
      "id": "item_62",
      "name": "item_62.webp",
      "label": "smartmockups_lnhmeot0.jpg",
      "title": "Misc - smartmockups_lnhmeot",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_62.jpg"
    },
    {
      "id": "item_63",
      "name": "item_63.webp",
      "label": "smartmockups_lm2bqail.jpg",
      "title": "Misc - smartmockups_lm2bqai",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_63.jpg"
    },
    {
      "id": "item_64",
      "name": "item_64.webp",
      "label": "PyLab logo_DARK MODE.png",
      "title": "Misc - PyLab logo_DARK MODE",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_64.jpg"
    },
    {
      "id": "item_65",
      "name": "item_65.webp",
      "label": "Home 4.png",
      "title": "Misc - Home 4",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_65.jpg"
    },
    {
      "id": "item_66",
      "name": "item_66.webp",
      "label": "Colorograogy.png",
      "title": "Misc - Colorograogy",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_66.jpg"
    },
    {
      "id": "item_67",
      "name": "item_67.webp",
      "label": "Colorograogy.jpg",
      "title": "Misc - Colorograogy",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_67.jpg"
    },
    {
      "id": "item_68",
      "name": "item_68.webp",
      "label": "front-65d6462ce4277-A3_White_F",
      "title": "Misc - front-65d6462ce4277-",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_68.jpg"
    },
    {
      "id": "item_69",
      "name": "item_69.webp",
      "label": "Algolisted 2.png",
      "title": "Misc - Algolisted 2",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_69.jpg"
    },
    {
      "id": "item_70",
      "name": "item_70.webp",
      "label": "IMG_0147.PNG",
      "title": "Misc - IMG_0147",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_70.jpg"
    },
    {
      "id": "item_71",
      "name": "item_71.webp",
      "label": "screenshot-www.ostello.co.in-2",
      "title": "Misc - screenshot-www.ostel",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_71.jpg"
    },
    {
      "id": "item_72",
      "name": "item_72.webp",
      "label": "yoo.png",
      "title": "Misc - yoo",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_72.jpg"
    },
    {
      "id": "item_73",
      "name": "item_73.webp",
      "label": "IMG_0146.PNG",
      "title": "Misc - IMG_0146",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_73.jpg"
    },
    {
      "id": "item_74",
      "name": "item_74.webp",
      "label": "Home 1.png",
      "title": "Misc - Home 1",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_74.jpg"
    },
    {
      "id": "item_75",
      "name": "item_75.webp",
      "label": "Algolisted 3.png",
      "title": "Misc - Algolisted 3",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_75.jpg"
    },
    {
      "id": "item_76",
      "name": "item_76.webp",
      "label": "Frame 604.png",
      "title": "Misc - Frame 604",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_76.jpg"
    },
    {
      "id": "item_77",
      "name": "item_77.webp",
      "label": "HOME 3.png",
      "title": "Misc - HOME 3",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_77.jpg"
    },
    {
      "id": "item_78",
      "name": "item_78.webp",
      "label": "Untitled_Artwork 6.png",
      "title": "Misc - Untitled_Artwork 6",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_78.jpg"
    },
    {
      "id": "item_79",
      "name": "item_79.webp",
      "label": "IMG_0145.jpg",
      "title": "Misc - IMG_0145",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_79.jpg"
    },
    {
      "id": "item_96",
      "name": "item_96.webp",
      "label": "Zarevna Business Card-F.png",
      "title": "ZAREVNA - Zarevna Business Car",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_96.jpg"
    },
    {
      "id": "item_97",
      "name": "item_97.webp",
      "label": "Zarevna details.png",
      "title": "ZAREVNA - Zarevna details",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_97.jpg"
    },
    {
      "id": "item_98",
      "name": "item_98.webp",
      "label": "Zarevna mockup.png",
      "title": "ZAREVNA - Zarevna mockup",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_98.jpg"
    },
    {
      "id": "item_99",
      "name": "item_99.webp",
      "label": "Zarevna bootcamp 2.0.jpg",
      "title": "ZAREVNA - Zarevna bootcamp 2.0",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_99.jpg"
    },
    {
      "id": "item_100",
      "name": "item_100.webp",
      "label": "Zarevna bootcamp 2.0.png",
      "title": "ZAREVNA - Zarevna bootcamp 2.0",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_100.jpg"
    },
    {
      "id": "item_101",
      "name": "item_101.webp",
      "label": "Zarevna Business Card-B.png",
      "title": "ZAREVNA - Zarevna Business Car",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_101.jpg"
    },
    {
      "id": "item_102",
      "name": "item_102.webp",
      "label": "Zarevna 2.png",
      "title": "ZAREVNA - Zarevna 2",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_102.jpg"
    },
    {
      "id": "item_103",
      "name": "item_103.webp",
      "label": "Zarevna 3.png",
      "title": "ZAREVNA - Zarevna 3",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_103.jpg"
    },
    {
      "id": "item_104",
      "name": "item_104.webp",
      "label": "Zarevna Home 2.png",
      "title": "ZAREVNA - Zarevna Home 2",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_104.jpg"
    },
    {
      "id": "item_105",
      "name": "item_105.webp",
      "label": "Zarevna Home 3.png",
      "title": "ZAREVNA - Zarevna Home 3",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_105.jpg"
    },
    {
      "id": "item_106",
      "name": "item_106.webp",
      "label": "Zarevna Home 4.png",
      "title": "ZAREVNA - Zarevna Home 4",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_106.jpg"
    },
    {
      "id": "item_107",
      "name": "item_107.webp",
      "label": "Zarevna Home 1x.png",
      "title": "ZAREVNA - Zarevna Home 1x",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_107.jpg"
    },
    {
      "id": "item_108",
      "name": "item_108.webp",
      "label": "Zarevna.png",
      "title": "ZAREVNA - Zarevna",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_108.jpg"
    },
    {
      "id": "item_109",
      "name": "item_109.webp",
      "label": "ZAREVNA HOME.png",
      "title": "ZAREVNA - ZAREVNA HOME",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_109.jpg"
    },
    {
      "id": "item_113",
      "name": "item_113.webp",
      "label": "Profile picture (1).png",
      "title": "my image - Profile picture (1)",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_113.jpg"
    },
    {
      "id": "item_114",
      "name": "item_114.webp",
      "label": "Vector 2.png",
      "title": "my image - Vector 2",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_114.jpg"
    },
    {
      "id": "item_115",
      "name": "item_115.webp",
      "label": "Open Peeps - Bust (1).png",
      "title": "my image - Open Peeps - Bust (1",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_115.jpg"
    },
    {
      "id": "item_116",
      "name": "item_116.webp",
      "label": "profile-pic (18).png",
      "title": "my image - profile-pic (18)",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_116.jpg"
    },
    {
      "id": "item_117",
      "name": "item_117.webp",
      "label": "profile-pic (19).png",
      "title": "my image - profile-pic (19)",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_117.jpg"
    },
    {
      "id": "item_118",
      "name": "item_118.webp",
      "label": "Profile pic.png",
      "title": "my image - Profile pic",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_118.jpg"
    },
    {
      "id": "item_119",
      "name": "item_119.webp",
      "label": "profile-pic (19) (1).png",
      "title": "my image - profile-pic (19) (1)",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_119.jpg"
    },
    {
      "id": "item_120",
      "name": "item_120.webp",
      "label": "Profile picture.png",
      "title": "my image - Profile picture",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_120.jpg"
    },
    {
      "id": "item_121",
      "name": "item_121.webp",
      "label": "Open Peeps - Bust.png",
      "title": "my image - Open Peeps - Bust",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_121.jpg"
    },
    {
      "id": "item_122",
      "name": "item_122.webp",
      "label": "profile-pic (20).png",
      "title": "my image - profile-pic (20)",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_122.jpg"
    },
    {
      "id": "item_123",
      "name": "item_123.webp",
      "label": "Open Peeps - Avatar.png",
      "title": "my image - Open Peeps - Avatar",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_123.jpg"
    },
    {
      "id": "item_124",
      "name": "item_124.webp",
      "label": "Open Peeps - Avatar (1).png",
      "title": "my image - Open Peeps - Avatar ",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_124.jpg"
    },
    {
      "id": "item_230",
      "name": "item_230.webp",
      "label": "Frame 3.png",
      "title": "Design Sample - Frame 3",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_230.jpg"
    },
    {
      "id": "item_231",
      "name": "item_231.webp",
      "label": "Frame 71.png",
      "title": "Design Sample - Frame 71",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_231.jpg"
    },
    {
      "id": "item_232",
      "name": "item_232.webp",
      "label": "90 2.png",
      "title": "Design Sample - 90 2",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_232.jpg"
    },
    {
      "id": "item_233",
      "name": "item_233.webp",
      "label": "ecolixir logo-Canvas bag cloth",
      "title": "Design Sample - ecolixir logo-Canvas",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_233.jpg"
    },
    {
      "id": "item_234",
      "name": "item_234.webp",
      "label": "Frame 9.png",
      "title": "Design Sample - Frame 9",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_234.jpg"
    },
    {
      "id": "item_235",
      "name": "item_235.webp",
      "label": "90.png",
      "title": "Design Sample - 90",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_235.jpg"
    },
    {
      "id": "item_236",
      "name": "item_236.webp",
      "label": "Slide 16_9 - 2.png",
      "title": "Design Sample - Slide 16_9 - 2",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_236.jpg"
    },
    {
      "id": "item_237",
      "name": "item_237.webp",
      "label": "Poster 1.png",
      "title": "FARGO - Poster 1",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_237.jpg"
    },
    {
      "id": "item_238",
      "name": "item_238.webp",
      "label": "Poster 2.png",
      "title": "FARGO - Poster 2",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_238.jpg"
    },
    {
      "id": "item_239",
      "name": "item_239.webp",
      "label": "Poster 51.png",
      "title": "FARGO - Poster 51",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_239.jpg"
    },
    {
      "id": "item_240",
      "name": "item_240.webp",
      "label": "Poster 3.png",
      "title": "FARGO - Poster 3",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_240.jpg"
    },
    {
      "id": "item_241",
      "name": "item_241.webp",
      "label": "Poster 6.png",
      "title": "FARGO - Poster 6",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_241.jpg"
    },
    {
      "id": "item_242",
      "name": "item_242.webp",
      "label": "Poster 41.png",
      "title": "FARGO - Poster 41",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_242.jpg"
    },
    {
      "id": "item_243",
      "name": "item_243.webp",
      "label": "Poster 4.png",
      "title": "FARGO - Poster 4",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_243.jpg"
    },
    {
      "id": "item_244",
      "name": "item_244.webp",
      "label": "Poster 5.png",
      "title": "FARGO - Poster 5",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_244.jpg"
    },
    {
      "id": "item_245",
      "name": "item_245.webp",
      "label": "Poster 31.png",
      "title": "FARGO - Poster 31",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_245.jpg"
    },
    {
      "id": "item_246",
      "name": "item_246.webp",
      "label": "Poster.png",
      "title": "FARGO - Poster",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_246.jpg"
    },
    {
      "id": "item_247",
      "name": "item_247.webp",
      "label": "Instagram post - New collectio",
      "title": "FARGO - Instagram post - New",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_247.jpg"
    },
    {
      "id": "item_248",
      "name": "item_248.webp",
      "label": "Poster 21.png",
      "title": "FARGO - Poster 21",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_248.jpg"
    },
    {
      "id": "item_249",
      "name": "item_249.webp",
      "label": "Poster_banner11.png",
      "title": "FARGO - Poster_banner11",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_249.jpg"
    },
    {
      "id": "item_250",
      "name": "item_250.webp",
      "label": "Memes - 2.png",
      "title": "FARGO - Memes - 2",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_250.jpg"
    },
    {
      "id": "item_251",
      "name": "item_251.webp",
      "label": "Poster 11.png",
      "title": "FARGO - Poster 11",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_251.jpg"
    },
    {
      "id": "item_252",
      "name": "item_252.webp",
      "label": "Memes - 3.png",
      "title": "FARGO - Memes - 3",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_252.jpg"
    },
    {
      "id": "item_253",
      "name": "item_253.webp",
      "label": "Memes - 1.png",
      "title": "FARGO - Memes - 1",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_253.jpg"
    },
    {
      "id": "item_254",
      "name": "item_254.webp",
      "label": "Poster_banner.png",
      "title": "FARGO - Poster_banner",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_254.jpg"
    },
    {
      "id": "item_255",
      "name": "item_255.webp",
      "label": "Memes - 4.png",
      "title": "FARGO - Memes - 4",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_255.jpg"
    },
    {
      "id": "item_256",
      "name": "item_256.webp",
      "label": "Memes - 5.png",
      "title": "FARGO - Memes - 5",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_256.jpg"
    },
    {
      "id": "item_257",
      "name": "item_257.webp",
      "label": "Memes - 7.png",
      "title": "FARGO - Memes - 7",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_257.jpg"
    },
    {
      "id": "item_258",
      "name": "item_258.webp",
      "label": "Memes - 6.png",
      "title": "FARGO - Memes - 6",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_258.jpg"
    },
    {
      "id": "item_259",
      "name": "item_259.webp",
      "label": "Poster_banner-1.png",
      "title": "FARGO - Poster_banner-1",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_259.jpg"
    },
    {
      "id": "item_317",
      "name": "item_317.webp",
      "label": "Homenew.jpg",
      "title": "full lockup (Chanpreet) - Homenew",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_317.jpg"
    },
    {
      "id": "item_318",
      "name": "item_318.webp",
      "label": "lokeup black color.png",
      "title": "full lockup (Chanpreet) - lokeup black color",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_318.jpg"
    },
    {
      "id": "item_319",
      "name": "item_319.webp",
      "label": "lockup black background color.",
      "title": "full lockup (Chanpreet) - lockup black backgro",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_319.jpg"
    },
    {
      "id": "item_320",
      "name": "item_320.webp",
      "label": "lockup white color.png",
      "title": "full lockup (Chanpreet) - lockup white color",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_320.jpg"
    },
    {
      "id": "item_321",
      "name": "item_321.webp",
      "label": "lockup white backgroud color.p",
      "title": "full lockup (Chanpreet) - lockup white backgro",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_321.jpg"
    },
    {
      "id": "item_322",
      "name": "item_322.webp",
      "label": "prize pool.png",
      "title": "clg banners - prize pool",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_322.jpg"
    },
    {
      "id": "item_323",
      "name": "item_323.webp",
      "label": "CGEC PEP-Talks Club Presents.p",
      "title": "clg banners - CGEC PEP-Talks Club ",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_323.jpg"
    },
    {
      "id": "item_324",
      "name": "item_324.webp",
      "label": "Presents TECH-O-BER.png",
      "title": "clg banners - Presents TECH-O-BER",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_324.jpg"
    },
    {
      "id": "item_325",
      "name": "item_325.webp",
      "label": "SPEECH COMPITITION.png",
      "title": "clg banners - SPEECH COMPITITION",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_325.jpg"
    },
    {
      "id": "item_326",
      "name": "item_326.webp",
      "label": "CGEC'S.png",
      "title": "clg banners - CGEC'S",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_326.jpg"
    },
    {
      "id": "item_327",
      "name": "item_327.webp",
      "label": "TECH-O-NICKS CLUB.png",
      "title": "clg banners - TECH-O-NICKS CLUB",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_327.jpg"
    },
    {
      "id": "item_374",
      "name": "item_374.webp",
      "label": "PyLab logo with name_DARK MODE",
      "title": "Pylab - PyLab logo with name",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_374.jpg"
    },
    {
      "id": "item_375",
      "name": "item_375.webp",
      "label": "Home Page.png",
      "title": "Pylab - Home Page",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_375.jpg"
    },
    {
      "id": "item_376",
      "name": "item_376.webp",
      "label": "PyLab logo.png",
      "title": "Pylab - PyLab logo",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_376.jpg"
    },
    {
      "id": "item_377",
      "name": "item_377.webp",
      "label": "PyLab logo with name.png",
      "title": "Pylab - PyLab logo with name",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_377.jpg"
    },
    {
      "id": "item_378",
      "name": "item_378.webp",
      "label": "UI Challenge 2.png",
      "title": "IA challange - UI Challenge 2",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_378.jpg"
    },
    {
      "id": "item_379",
      "name": "item_379.webp",
      "label": "UI challenge 3.png",
      "title": "IA challange - UI challenge 3",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_379.jpg"
    },
    {
      "id": "item_380",
      "name": "item_380.webp",
      "label": "UI Challenge 7.png",
      "title": "IA challange - UI Challenge 7",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_380.jpg"
    },
    {
      "id": "item_381",
      "name": "item_381.webp",
      "label": "UI Challenge 6.png",
      "title": "IA challange - UI Challenge 6",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_381.jpg"
    },
    {
      "id": "item_382",
      "name": "item_382.webp",
      "label": "Uichallenge day1.png",
      "title": "IA challange - Uichallenge day1",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_382.jpg"
    },
    {
      "id": "item_383",
      "name": "item_383.webp",
      "label": "UI Challenge 4.png",
      "title": "IA challange - UI Challenge 4",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_383.jpg"
    },
    {
      "id": "item_384",
      "name": "item_384.webp",
      "label": "UI Challenge 5.png",
      "title": "IA challange - UI Challenge 5",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_384.jpg"
    },
    {
      "id": "item_385",
      "name": "item_385.webp",
      "label": "Typography.jpg",
      "title": "IA challange - Typography",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_385.jpg"
    },
    {
      "id": "item_386",
      "name": "item_386.webp",
      "label": "I:A Challenge 9.png",
      "title": "IA challange - I:A Challenge 9",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_386.jpg"
    },
    {
      "id": "item_387",
      "name": "item_387.webp",
      "label": "I:A Challenge 10.png",
      "title": "IA challange - I:A Challenge 10",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_387.jpg"
    },
    {
      "id": "item_388",
      "name": "item_388.webp",
      "label": "I:A Challenge 8.png",
      "title": "IA challange - I:A Challenge 8",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_388.jpg"
    },
    {
      "id": "item_389",
      "name": "item_389.webp",
      "label": "UI Challenge 10.png",
      "title": "IA challange - UI Challenge 10",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_389.jpg"
    },
    {
      "id": "item_390",
      "name": "item_390.webp",
      "label": "I:A Challenge 6.png",
      "title": "IA challange - I:A Challenge 6",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_390.jpg"
    },
    {
      "id": "item_391",
      "name": "item_391.webp",
      "label": "I:A Challenge 7.png",
      "title": "IA challange - I:A Challenge 7",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_391.jpg"
    },
    {
      "id": "item_392",
      "name": "item_392.webp",
      "label": "I:A Challenge 5.png",
      "title": "IA challange - I:A Challenge 5",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_392.jpg"
    },
    {
      "id": "item_393",
      "name": "item_393.webp",
      "label": "I:A Challenge 4.png",
      "title": "IA challange - I:A Challenge 4",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_393.jpg"
    },
    {
      "id": "item_394",
      "name": "item_394.webp",
      "label": "I:A Challenge 1.png",
      "title": "IA challange - I:A Challenge 1",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_394.jpg"
    },
    {
      "id": "item_395",
      "name": "item_395.webp",
      "label": "I:A Challenge 3.png",
      "title": "IA challange - I:A Challenge 3",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_395.jpg"
    },
    {
      "id": "item_396",
      "name": "item_396.webp",
      "label": "I:A Challenge 2.png",
      "title": "IA challange - I:A Challenge 2",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_396.jpg"
    },
    {
      "id": "item_397",
      "name": "item_397.webp",
      "label": "UI challenge 8.png",
      "title": "IA challange - UI challenge 8",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_397.jpg"
    },
    {
      "id": "item_398",
      "name": "item_398.webp",
      "label": "UI Challenge 9.png",
      "title": "IA challange - UI Challenge 9",
      "role": "Designer",
      "date": "2023-2025",
      "desc": "Graphic design, posters, banners, and print media.",
      "hiresPath": "assets/portfolio/hires/item_398.jpg"
    }
  ]
};

function initGalleryExplorer() {
  var explorer = document.getElementById('window-creatives');
  if (!explorer) return;

  var sidebarFolders = explorer.querySelectorAll('.sidebar-folder');
  var fileGrid = explorer.querySelector('#explorer-file-grid');
  var pathInput = explorer.querySelector('.path-input');

  var paths = {
    ecommerce: "C:\\My_Works\\E-commerce_UX",
    branding: "C:\\My_Works\\Branding_Identity",
    challenges: "C:\\My_Works\\UI_Challenges",
    graphics: "C:\\My_Works\\Graphic_Design"
  };

  sidebarFolders.forEach(function(folder) {
    folder.addEventListener('click', function() {
      sidebarFolders.forEach(f => f.classList.remove('active'));
      folder.classList.add('active');
      var category = folder.getAttribute('data-category');
      if (pathInput) pathInput.value = paths[category];
      renderFiles(category);
    });
  });

  function renderFiles(category) {
    if (!fileGrid) return;
    fileGrid.innerHTML = '';
    var items = galleryData[category] || [];
    
    if (items.length === 0) {
      fileGrid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:#808080;font-family:Arial;">Empty folder.</div>';
      return;
    }

    var groups = {};
    items.forEach(function(item) {
      var parts = item.title.split(' - ');
      var groupName = parts.length > 1 ? parts[0].trim() : 'Other Projects';
      if (!groups[groupName]) groups[groupName] = [];
      groups[groupName].push(item);
    });

    for (var groupName in groups) {
      var headerEl = document.createElement('div');
      headerEl.className = 'explorer-group-header';
      headerEl.innerText = groupName;
      fileGrid.appendChild(headerEl);

      groups[groupName].forEach(function(item) {
        var fileEl = document.createElement('div');
        fileEl.className = 'explorer-file-item';
        
        fileEl.innerHTML = '<div class="file-icon-wrapper">' +
          '<img src="assets/portfolio/' + item.name + '" alt="' + item.title + '" class="file-preview-img" loading="lazy" />' +
          '</div>' +
          '<span class="file-label-text">' + item.label + '</span>';
        
        // Double click for desktop
        fileEl.addEventListener('dblclick', function() {
          openProjectPreview(item);
        });
        // Single tap for mobile / touch
        fileEl.addEventListener('click', function(e) {
          var isMobile = window.innerWidth <= 900;
          if (isMobile) {
            openProjectPreview(item);
          } else {
            explorer.querySelectorAll('.explorer-file-item').forEach(i => i.classList.remove('selected'));
            fileEl.classList.add('selected');
          }
        });
        
        fileGrid.appendChild(fileEl);
      });
    }

    if (window.lucide) {
      lucide.createIcons({
        attrs: { 'stroke-width': 2 }
      });
    }
  }

  // Initial render
  renderFiles('ecommerce');
}

function openProjectPreview(item) {
  var windowId = 'preview-' + item.id;
  if (openWindows.has(windowId)) {
    bringToFront(openWindows.get(windowId));
    return;
  }

  var contentHTML = '<div class="project-preview-modal">' +
    '<div class="preview-left">' +
      '<img src="' + item.hiresPath + '" alt="' + item.title + '" class="preview-img" onclick="window.open(\'' + item.hiresPath + '\', \'_blank\')">' +
    '</div>' +
    '<div class="preview-right">' +
      '<h2 class="preview-title">' + item.title + '</h2>' +
      '<div class="preview-meta">' +
        '<div><strong>Role:</strong> ' + item.role + '</div>' +
        '<div><strong>Date:</strong> ' + item.date + '</div>' +
      '</div>' +
      '<p class="preview-desc">' + item.desc + '</p>' +
      '<div class="preview-actions">' +
        '<a href="' + item.hiresPath + '" target="_blank" class="flat-btn preview-action-btn"><i data-lucide="maximize" style="width:14px;height:14px;"></i> View Full Resolution</a>' +
      '</div>' +
    '</div>' +
  '</div>';

  createWindow(windowId, 'Photos - ' + item.label, contentHTML);
  
  // Custom dimensions for preview window
  var win = document.getElementById('window-' + windowId);
  if (win) {
    win.style.width = '720px';
    win.style.height = '460px';
    var isMobile = window.innerWidth <= 900;
    if (!isMobile) {
      var offset = (openWindows.size % 5) * 30;
      win.style.top = (100 + offset) + 'px';
      win.style.left = 'calc(50% - 360px + ' + offset + 'px)';
    }
  }
}
