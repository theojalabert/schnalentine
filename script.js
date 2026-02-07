const checkbox = document.getElementById('checkbox-btn');
const captchaBox = document.getElementById('step-checkbox');
const captchaModal = document.getElementById('captcha-modal');
const grid = document.getElementById('grid');
const verifyBtn = document.getElementById('verify-btn');

let currentRound = 0; // 0 = idle, 2 = valentine
const selectedTiles = new Set();


const VALENTINE_IMAGES = [
  'images/valentine-1.png',
  'images/valentine-2.png',
  'images/valentine-3.png',
  'images/valentine-4.png',
  'images/valentine-5.png',
  'images/valentine-6.png',
  'images/valentine-7.png',
  'images/valentine-8.png',
  'images/valentine-9.png'
];

// Click checkbox -> open valentine grid directly
checkbox.addEventListener('click', () => {
  if (currentRound !== 0) return;

  checkbox.classList.add('loading');

  setTimeout(() => {
    captchaBox.classList.add('hidden');
    captchaModal.classList.remove('hidden');
    startValentineRound();
  }, 900);
});

function startValentineRound() {
  currentRound = 2;
  grid.innerHTML = '';
  selectedTiles.clear();
  verifyBtn.disabled = true;

  for (let i = 0; i < 9; i++) {
    const tile = document.createElement('div');
    tile.classList.add('tile');
    tile.style.backgroundImage = `url('${VALENTINE_IMAGES[i]}')`;
    tile.dataset.index = String(i);

    tile.addEventListener('click', () => toggleTile(tile));
    grid.appendChild(tile);
  }
}

function toggleTile(tile) {
  const index = tile.dataset.index;

  if (selectedTiles.has(index)) {
    selectedTiles.delete(index);
    tile.classList.remove('selected');
  } else {
    selectedTiles.add(index);
    tile.classList.add('selected');
  }

  verifyBtn.disabled = selectedTiles.size === 0;
}

// Redirection vers la page finale fusionnée
verifyBtn.addEventListener('click', () => {
  if (currentRound !== 2) return;
  window.location.href = './schnalentine.html';
});