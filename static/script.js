// ── Background canvas: stars + shooting stars ──
(function () {
  const canvas = document.getElementById('bg');
  const ctx = canvas.getContext('2d');
  let W, H, stars, shooters;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    initStars();
  }

  function initStars() {
    stars = Array.from({ length: 160 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 1.4 + 0.3, a: Math.random(),
      da: (Math.random() * 0.004 + 0.001) * (Math.random() < 0.5 ? 1 : -1)
    }));
    shooters = [];
  }

  function spawnShooter() {
    shooters.push({
      x: Math.random() * W * 0.7, y: Math.random() * H * 0.4,
      len: Math.random() * 120 + 60, speed: Math.random() * 6 + 5,
      angle: Math.PI / 5, life: 1
    });
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    stars.forEach(s => {
      s.a += s.da;
      if (s.a > 1 || s.a < 0.1) s.da *= -1;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200,220,255,${s.a})`;
      ctx.fill();
    });
    shooters.forEach((s, i) => {
      const grad = ctx.createLinearGradient(s.x, s.y, s.x - Math.cos(s.angle)*s.len, s.y - Math.sin(s.angle)*s.len);
      grad.addColorStop(0, `rgba(180,220,255,${s.life})`);
      grad.addColorStop(1, 'rgba(180,220,255,0)');
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(s.x - Math.cos(s.angle)*s.len, s.y - Math.sin(s.angle)*s.len);
      ctx.strokeStyle = grad; ctx.lineWidth = 1.5; ctx.stroke();
      s.x += Math.cos(s.angle)*s.speed;
      s.y += Math.sin(s.angle)*s.speed;
      s.life -= 0.018;
      if (s.life <= 0) shooters.splice(i, 1);
    });
    if (Math.random() < 0.008) spawnShooter();
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  resize(); draw();
})();

// ── Game state ──
const PARTS = ['p-head','p-body','p-larm','p-rarm','p-lleg','p-rleg'];
let guessedLetters = [];
let gameOver = false;

// ── On page load: show login ──
window.onload = () => {
  document.getElementById('name-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') doLogin();
  });
};

// ════════════════════════════════
// LOGIN
// ════════════════════════════════
function doLogin() {
  const name = document.getElementById('name-input').value.trim();
  const errEl = document.getElementById('login-error');
  if (!name) { errEl.textContent = 'Please enter your name.'; return; }

  const btn = document.getElementById('login-btn');
  btn.disabled = true;
  btn.textContent = 'Loading…';
  errEl.textContent = '';

  fetch('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  })
    .then(r => r.json())
    .then(data => {
      if (data.error) { errEl.textContent = data.error; btn.disabled = false; btn.textContent = 'Play →'; return; }
      showGame(data);
    })
    .catch(() => {
      errEl.textContent = 'Connection error. Try again.';
      btn.disabled = false;
      btn.textContent = 'Play →';
    });
}

function showLogin() {
  document.getElementById('app').classList.add('hidden');
  document.getElementById('login-screen').classList.remove('hidden');
  document.getElementById('name-input').value = '';
  document.getElementById('login-error').textContent = '';
  const btn = document.getElementById('login-btn');
  btn.disabled = false; btn.textContent = 'Play →';
}

function showGame(playerData) {
  document.getElementById('login-screen').classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');

  // set avatar initial + name
  const avatar = document.getElementById('player-avatar');
  avatar.textContent = playerData.name.charAt(0).toUpperCase();
  document.getElementById('player-name-display').textContent = playerData.name;

  updateStats(playerData, false);
  buildKeyboard();
  startGame();
}

// ════════════════════════════════
// STATS
// ════════════════════════════════
function updateStats(data, animate) {
  setStatVal('s-played', data.games_played,   animate);
  setStatVal('s-won',    data.games_won,       animate);
  setStatVal('s-streak', data.current_streak,  animate);
  setStatVal('s-max',    data.max_streak,       animate);
}

function setStatVal(id, val, animate) {
  const el = document.getElementById(id);
  el.textContent = val;
  if (animate) {
    el.classList.remove('bump');
    void el.offsetWidth;
    el.classList.add('bump');
  }
}

// ════════════════════════════════
// GAME
// ════════════════════════════════
function buildKeyboard() {
  const kb = document.getElementById('keyboard');
  kb.innerHTML = '';
  'abcdefghijklmnopqrstuvwxyz'.split('').forEach(l => {
    const btn = document.createElement('button');
    btn.className = 'key-btn'; btn.id = 'key-' + l;
    btn.textContent = l;
    btn.onclick = () => guess(l);
    kb.appendChild(btn);
  });
}

function startGame() {
  fetch('/start')
    .then(r => r.json())
    .then(data => {
      guessedLetters = []; gameOver = false;
      resetSVG(); buildKeyboard();
      document.getElementById('guessed-letters').textContent = '';
      document.getElementById('message').textContent = '';
      document.getElementById('message').className = '';
      document.getElementById('wc').textContent = '0';
      renderWord(data.blank_list);
    });
}

function guess(letter) {
  if (gameOver || guessedLetters.includes(letter)) return;

  fetch('/guess', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ letter })
  })
    .then(r => r.json())
    .then(data => {
      guessedLetters.push(letter);
      document.getElementById('key-' + letter).disabled = true;

      const prevCount = parseInt(document.getElementById('wc').textContent);
      renderWord(data.blank_list);
      document.getElementById('wc').textContent = data.call_count;

      if (data.call_count > prevCount) {
        revealPart(data.call_count - 1);
        shakeSVG();
        document.getElementById('guessed-letters').textContent =
          guessedLetters.filter(l => !data.blank_list.includes(l)).join('  ');
      }

      if (data.status === 'win') {
        gameOver = true;
        disableAll();
        showMessage('🎉 You Win!', 'win');
        saveResult(true);
      } else if (data.status === 'lose') {
        gameOver = true;
        disableAll();
        revealAllParts();
        showMessage('💀 Game Over! Word: ' + data.word.toUpperCase(), 'lose');
        saveResult(false);
      }
    });
}

function saveResult(won) {
  fetch('/save-result', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ won })
  })
    .then(r => r.json())
    .then(data => updateStats(data, true));
}

// ── Helpers ──
function renderWord(blank_list) {
  const wd = document.getElementById('word-display');
  if (wd.children.length !== blank_list.length) {
    wd.innerHTML = blank_list.map((l, i) =>
      `<div class="letter-box${l !== '_' ? ' revealed' : ''}" id="lb-${i}">${l !== '_' ? l : ''}</div>`
    ).join('');
  } else {
    blank_list.forEach((l, i) => {
      const box = document.getElementById('lb-' + i);
      if (l !== '_' && !box.classList.contains('revealed')) {
        box.textContent = l; box.classList.add('revealed');
      }
    });
  }
}

function revealPart(index) {
  if (index < 0 || index >= PARTS.length) return;
  const el = document.getElementById(PARTS[index]);
  if (!el) return;
  el.classList.remove('visible'); void el.offsetWidth; el.classList.add('visible');
}

function revealAllParts() { PARTS.forEach((_, i) => revealPart(i)); }

function resetSVG() {
  PARTS.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('visible');
  });
}

function shakeSVG() {
  const svg = document.getElementById('hangman-svg');
  svg.classList.remove('shake'); void svg.offsetWidth; svg.classList.add('shake');
  svg.addEventListener('animationend', () => svg.classList.remove('shake'), { once: true });
}

function showMessage(text, cls) {
  const m = document.getElementById('message');
  m.textContent = text; m.className = cls;
}

function disableAll() {
  document.querySelectorAll('.key-btn').forEach(b => b.disabled = true);
}
