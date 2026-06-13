// Still Becoming™ — Popup Logic

const PROMPTS = [
  "What are you most afraid of today — and what would courage look like?",
  "What do you hope future you remembers about this moment?",
  "What lesson changed you recently?",
  "What are you pretending not to know?",
  "Describe who you are becoming, one sentence at a time.",
  "What does the person you're growing into believe about themselves?",
  "If your future self could send you a message right now, what would it say?",
  "What are you finally ready to let go of?",
  "What does your life look like in one year if you commit fully?",
  "What are you grateful for today that you might forget tomorrow?",
  "Who were you a year ago, and who are you now?",
  "What would you do if you trusted yourself completely?",
  "What story have you been telling yourself that is holding you back?",
  "What does rest feel like for you right now?",
  "Name three things you know about yourself that the world doesn't see yet.",
];

// ── State ──
let letters = [];
let activeTab = 'vault';
let viewingLetterId = null;

// ── Init ──
async function init() {
  const data = await chrome.storage.local.get('letters');
  letters = data.letters || [];
  checkUnlocks();
  renderVault();
  renderPrompts();
  bindEvents();
}

function checkUnlocks() {
  let changed = false;
  letters = letters.map(l => {
    if (l.status === 'sealed' && new Date(l.unlockDate) <= new Date()) {
      changed = true;
      return { ...l, status: 'unlocked' };
    }
    return l;
  });
  if (changed) saveLetters();
}

// ── Save ──
async function saveLetters() {
  await chrome.storage.local.set({ letters });
}

// ── Vault ──
function renderVault() {
  const total = letters.length;
  const sealed = letters.filter(l => l.status === 'sealed').length;
  const open = letters.filter(l => l.status === 'unlocked').length;

  document.getElementById('stat-total').textContent = total;
  document.getElementById('stat-sealed').textContent = sealed;
  document.getElementById('stat-open').textContent = open;

  const list = document.getElementById('letter-list');

  if (letters.length === 0) {
    list.innerHTML = `
      <div class="empty-vault">
        <div class="icon">✉️</div>
        <p>Your vault is waiting.</p>
        <small>Write your first letter to your future self.</small>
      </div>`;
    return;
  }

  // Sort: unlocked first, then by soonest unlock
  const sorted = [...letters].sort((a, b) => {
    if (a.status === 'unlocked' && b.status !== 'unlocked') return -1;
    if (b.status === 'unlocked' && a.status !== 'unlocked') return 1;
    return new Date(a.unlockDate) - new Date(b.unlockDate);
  });

  list.innerHTML = sorted.map(letter => {
    const unlockDate = new Date(letter.unlockDate);
    const daysLeft = Math.ceil((unlockDate - new Date()) / (1000 * 60 * 60 * 24));
    const formattedDate = unlockDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

    const countdown = letter.status === 'sealed'
      ? `<span class="countdown">${daysLeft > 0 ? `${daysLeft} days away` : 'Arriving soon'}</span>`
      : '';

    return `
      <div class="letter-card ${letter.status}" data-id="${letter.id}">
        <div class="letter-card-top">
          <div class="letter-title">${escHtml(letter.title)}</div>
          <span class="letter-badge badge-${letter.status === 'sealed' ? 'sealed' : 'unlocked'}">
            ${letter.status === 'sealed' ? 'Sealed' : 'Open'}
          </span>
        </div>
        <div class="letter-meta">
          <span>To: ${escHtml(letter.recipient)}</span>
          <span>${formattedDate}</span>
          ${countdown}
        </div>
      </div>`;
  }).join('');

  list.querySelectorAll('.letter-card').forEach(card => {
    card.addEventListener('click', () => openLetter(card.dataset.id));
  });
}

// ── Reader ──
function openLetter(id) {
  viewingLetterId = id;
  const letter = letters.find(l => l.id === id);
  if (!letter) return;

  showView('reader');
  const content = document.getElementById('reader-content');

  if (letter.status === 'sealed') {
    const unlockDate = new Date(letter.unlockDate);
    const daysLeft = Math.ceil((unlockDate - new Date()) / (1000 * 60 * 60 * 24));
    content.innerHTML = `
      <div class="reader-locked">
        <div class="lock-icon">🔒</div>
        <h3>This letter is sealed.</h3>
        <p>You wrote this for your future self.<br>It will arrive when the time is right.</p>
        <div class="unlock-date">Opens ${unlockDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} · ${daysLeft} days</div>
      </div>`;
  } else {
    const writtenDate = new Date(letter.writtenAt);
    content.innerHTML = `
      <div class="reader-header">
        <div class="reader-title">${escHtml(letter.title)}</div>
        <div class="reader-meta">
          To: ${escHtml(letter.recipient)} &nbsp;·&nbsp;
          Written ${writtenDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </div>
      <div class="reader-body">${escHtml(letter.body)}</div>`;
  }
}

// ── Write ──
function sealLetter() {
  const title = document.getElementById('input-title').value.trim();
  const recipient = document.getElementById('input-recipient').value;
  const dateVal = document.getElementById('input-date').value;
  const body = document.getElementById('input-body').value.trim();

  if (!title) { showToast('Give your letter a title.'); return; }
  if (!dateVal) { showToast('Choose when to open this letter.'); return; }
  if (!body) { showToast('Your letter is empty.'); return; }

  const unlockDate = new Date(dateVal);
  if (unlockDate <= new Date()) { showToast('Choose a future date.'); return; }

  const letter = {
    id: Date.now().toString(),
    title,
    recipient,
    unlockDate: unlockDate.toISOString(),
    body,
    status: 'sealed',
    writtenAt: new Date().toISOString(),
  };

  letters.unshift(letter);
  saveLetters();

  // Schedule alarm
  chrome.alarms.create(`letter_${letter.id}`, { when: unlockDate.getTime() });

  // Reset form
  document.getElementById('input-title').value = '';
  document.getElementById('input-body').value = '';
  document.getElementById('input-date').value = '';
  document.getElementById('word-count').textContent = '0';

  renderVault();
  showTab('vault');
  showToast('✦ Your letter has been sealed.');
}

// ── Prompts ──
function renderPrompts() {
  const today = new Date().getDate();
  const dailyIndex = today % PROMPTS.length;
  document.getElementById('daily-prompt').textContent = PROMPTS[dailyIndex];

  // Show 5 other prompts
  const others = PROMPTS.filter((_, i) => i !== dailyIndex).slice(0, 5);
  const grid = document.getElementById('prompts-grid');
  grid.innerHTML = others.map(p => `
    <div class="mini-prompt" data-prompt="${escAttr(p)}">
      <div class="mini-prompt-text">${escHtml(p)}</div>
      <span class="mini-prompt-arrow">→</span>
    </div>`).join('');

  grid.querySelectorAll('.mini-prompt').forEach(el => {
    el.addEventListener('click', () => writeFromPrompt(el.dataset.prompt));
  });

  document.getElementById('btn-write-prompt').onclick = () => {
    writeFromPrompt(PROMPTS[dailyIndex]);
  };
}

function writeFromPrompt(prompt) {
  showTab('write');
  const body = document.getElementById('input-body');
  body.value = `Prompt: ${prompt}\n\n`;
  body.focus();
  body.setSelectionRange(body.value.length, body.value.length);
  updateWordCount();
}

// ── UI helpers ──
function showView(name) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById(`view-${name}`).classList.add('active');
}

function showTab(name) {
  activeTab = name;
  document.querySelectorAll('.tab-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.tab === name);
  });
  showView(name);
}

function updateWordCount() {
  const val = document.getElementById('input-body').value.trim();
  const words = val ? val.split(/\s+/).length : 0;
  document.getElementById('word-count').textContent = words;
}

function setPresetDate(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  document.getElementById('input-date').value = d.toISOString().split('T')[0];
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2800);
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escAttr(str) {
  return String(str).replace(/"/g, '&quot;');
}

// ── Events ──
function bindEvents() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => showTab(btn.dataset.tab));
  });

  document.getElementById('btn-seal').addEventListener('click', sealLetter);
  document.getElementById('btn-back').addEventListener('click', () => showTab('vault'));

  document.getElementById('input-body').addEventListener('input', updateWordCount);

  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => setPresetDate(parseInt(btn.dataset.days)));
  });
}

init();
