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
    showToast("💀 " + widgetId.charAt(0).toUpperCase() + widgetId.slice(1) + " sent to the shadow realm.");
  }, 350);
}

// ========================
// RESTORE WIDGET
// ========================
function restoreWidget(widgetId) {
  var widget = document.querySelector('[data-widget-id="' + widgetId + '"]');
  if (widget) {
    widget.style.display = 'flex';
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
    title: 'Photos Viewer',
    content: '<div style="text-align:center; padding: 40px; font-family: VT323, monospace; font-size: 24px;">' +
      '<div style="font-size: 64px; margin-bottom: 16px;">🎨</div>' +
      '<p>Gallery loading from floppy disk...</p>' +
      '<p style="font-size: 16px; margin-top: 8px; color: #808080;">Please insert Disk 2 of 47.</p></div>'
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
    '<button class="win-btn" style="padding:0 4px;font-size:14px;" onclick="closeApp(\'' + id + '\')">' +
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
// RETRO TURNTABLE LOGIC
// ========================
var neoPlayer = document.getElementById('winamp-player');
if (neoPlayer) {
  makeDraggable(neoPlayer, neoPlayer.querySelector('.widget-header'));
  
  var playBtn = document.getElementById('play-btn');
  var pauseBtn = document.getElementById('pause-btn');
  var vinyl = document.getElementById('vinyl-record');
  var tonearm = document.getElementById('tonearm');
  var audioPlayer = document.getElementById('audio-player');
  var progressFill = document.getElementById('progress-fill');
  var progressHandle = document.getElementById('progress-handle');
  var currentTimeEl = document.getElementById('current-time');
  
  var duration = 537; // 8 minutes 57 seconds for November Rain
  var currentTime = 0;
  var interval;

  function updateProgress() {
    var percent = (currentTime / duration) * 100;
    if (progressFill) progressFill.style.width = percent + '%';
    if (progressHandle) progressHandle.style.left = percent + '%';
    var m = Math.floor(currentTime / 60);
    var s = Math.floor(currentTime % 60);
    if (currentTimeEl) currentTimeEl.innerText = m + ':' + (s < 10 ? '0' : '') + s;
  }
  
  playBtn.addEventListener('click', function() {
    playSound('click');
    if (vinyl) vinyl.classList.add('playing');
    if (tonearm) tonearm.classList.add('playing');
    
    // Play real audio if available, else simulate progress
    if (audioPlayer && audioPlayer.getAttribute('src')) {
       audioPlayer.play().catch(function(e){ console.log(e); });
    } else {
       clearInterval(interval);
       interval = setInterval(function() {
         currentTime++;
         if (currentTime >= duration) {
            currentTime = 0;
            pauseBtn.click();
         }
         updateProgress();
       }, 1000);
    }
    showToast("🎵 Playing: November Rain");
  });
  
  pauseBtn.addEventListener('click', function() {
    playSound('click');
    if (vinyl) vinyl.classList.remove('playing');
    if (tonearm) tonearm.classList.remove('playing');
    if (audioPlayer && audioPlayer.getAttribute('src')) {
       audioPlayer.pause();
    }
    clearInterval(interval);
  });
}

