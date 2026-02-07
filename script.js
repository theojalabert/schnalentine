// ---------- CAPTCHA ----------
const checkbox = document.getElementById('checkbox-btn');
const captchaBox = document.getElementById('step-checkbox');
const captchaModal = document.getElementById('captcha-modal');
const grid = document.getElementById('grid');
const verifyBtn = document.getElementById('verify-btn');

const captchaFlow = document.getElementById('captcha-flow');
const schnalentinePage = document.getElementById('schnalentine-page');
const captchaError = document.getElementById('captcha-error');

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
  captchaError.classList.add('hidden');
  captchaError.textContent = '';

  for (let i = 0; i < 9; i++) {
    const tile = document.createElement('div');
    tile.className = 'tile';
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

  // IMPORTANT: on masque seulement l'erreur pendant modification
  // (on ne la réaffiche PAS ici)
  captchaError.classList.add('hidden');
  captchaError.textContent = '';
}

verifyBtn.addEventListener('click', (e) => {
  e.preventDefault();
  if (currentRound !== 2) return;

  // L'erreur n'apparaît QUE quand on clique Vérifier avec < 9
  if (selectedTiles.size < 9) {
    captchaError.textContent = "Je sais que je suis pas toujours à mon prime, mais il s'agirait de me reconnaître au moins";
    captchaError.classList.remove('hidden');
    return;
  }

  // (Sécurité) si >9 impossible ici, mais au cas où
  if (selectedTiles.size !== 9) {
    captchaError.textContent = "Sélection invalide.";
    captchaError.classList.remove('hidden');
    return;
  }

  // Succès
  captchaError.classList.add('hidden');
  captchaError.textContent = '';
  captchaFlow.classList.add('hidden');
  schnalentinePage.classList.remove('hidden');
  initSchnalentine();
  window.scrollTo(0, 0);
});

// ---------- SCHNALENTINE ----------
let schnalentineInitialized = false;

function initSchnalentine() {
  if (schnalentineInitialized) return;
  schnalentineInitialized = true;

  const zone = document.getElementById("zone");
  const yesBtn = document.getElementById("yesBtn");
  const noBtn = document.getElementById("noBtn");
  const result = document.getElementById("result");
  const hint = document.getElementById("hint");
  const confettiCanvas = document.getElementById("confettiCanvas");
  const photos = document.querySelectorAll('.photo');

  // Canvas confetti
  function resizeConfettiCanvas() {
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    confettiCanvas.width = Math.floor(window.innerWidth * dpr);
    confettiCanvas.height = Math.floor(window.innerHeight * dpr);
    confettiCanvas.style.width = "100vw";
    confettiCanvas.style.height = "100vh";
  }

  resizeConfettiCanvas();
  window.addEventListener("resize", resizeConfettiCanvas);

  const confettiInstance = confetti.create(confettiCanvas, {
    resize: false,
    useWorker: true
  });

  function fullScreenConfetti() {
    const end = Date.now() + 1600;
    (function frame() {
      confettiInstance({
        particleCount: 12,
        spread: 90,
        startVelocity: 45,
        ticks: 180,
        origin: { x: Math.random(), y: Math.random() * 0.3 }
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();

    setTimeout(() => {
      confettiInstance({
        particleCount: 300,
        spread: 140,
        startVelocity: 60,
        ticks: 220,
        origin: { x: 0.5, y: 0.55 }
      });
    }, 300);
  }

  // Photos floating
  const photoData = [];
  photos.forEach((photo, index) => {
    const rotations = [-15, -12, -8, -5, 5, 8, 10, 12, 15];
    const rotation = rotations[index % rotations.length];

    const data = {
      element: photo,
      x: Math.random() * Math.max(1, (window.innerWidth - 180)),
      y: Math.random() * Math.max(1, (window.innerHeight - 180)),
      vx: (Math.random() - 0.5) * 2.5,
      vy: (Math.random() - 0.5) * 2.5,
      rotation
    };

    photoData.push(data);
    photo.style.transform = `rotate(${rotation}deg)`;
  });

  function animatePhotos() {
    photoData.forEach(data => {
      data.x += data.vx;
      data.y += data.vy;

      if (data.x <= 0 || data.x >= window.innerWidth - 180) {
        data.vx *= -1;
        data.x = Math.max(0, Math.min(data.x, window.innerWidth - 180));
      }
      if (data.y <= 0 || data.y >= window.innerHeight - 180) {
        data.vy *= -1;
        data.y = Math.max(0, Math.min(data.y, window.innerHeight - 180));
      }

      data.element.style.left = data.x + 'px';
      data.element.style.top = data.y + 'px';
    });

    requestAnimationFrame(animatePhotos);
  }
  animatePhotos();

  // No button evasif + poof smoke
  function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }

  let zRect = zone.getBoundingClientRect();
  let bw = noBtn.offsetWidth;
  let bh = noBtn.offsetHeight;

  let x0 = zRect.width * 0.62 - bw / 2;
  let y0 = zRect.height * 0.5 - bh / 2;
  let x = x0, y = y0, vx = 0, vy = 0;

  let mx = x + bw / 2;
  let my = y + bh / 2;
  let mouseInside = false;

  const TRIGGER_R = 150;
  const STRENGTH = 3200;
  const MAX_SPEED = 1400;
  const RESTIT = 0.72;
  const DAMP_60 = 0.86;

  let yesScale = 1, yesTarget = 1, fleeMeter = 0;
  let poofing = false;

  function smoothTo(current, target, dt, smoothness) {
    const k = 1 - Math.exp(-smoothness * dt);
    return current + (target - current) * k;
  }

  function spawnPuffs(px, py) {
    const count = 7;
    for (let i = 0; i < count; i++) {
      const puff = document.createElement("div");
      puff.className = "puff";
      puff.style.left = px + "px";
      puff.style.top = py + "px";

      const ang = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
      const dist = 16 + Math.random() * 16;
      puff.style.setProperty("--dx", `${Math.cos(ang) * dist}px`);
      puff.style.setProperty("--dy", `${Math.sin(ang) * dist - 6}px`);

      zone.appendChild(puff);
      puff.addEventListener("animationend", () => puff.remove(), { once: true });
    }
  }

  function refreshZone() {
    zRect = zone.getBoundingClientRect();
    bw = noBtn.offsetWidth;
    bh = noBtn.offsetHeight;
    x0 = clamp(x0, 0, zRect.width - bw);
    y0 = clamp(y0, 0, zRect.height - bh);
    x = clamp(x, 0, zRect.width - bw);
    y = clamp(y, 0, zRect.height - bh);
    noBtn.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  }
  window.addEventListener("resize", refreshZone);

  zone.addEventListener("pointermove", (e) => {
    const r = zone.getBoundingClientRect();
    mx = e.clientX - r.left;
    my = e.clientY - r.top;
    mouseInside = true;
  });
  zone.addEventListener("pointerleave", () => { mouseInside = false; });

  noBtn.style.transform = `translate3d(${x}px, ${y}px, 0)`;

  // Clic sur NON => fumée + disparition temporaire + reset position
  noBtn.addEventListener("click", (e) => {
    e.preventDefault();
    if (poofing) return;

    poofing = true;

    const cx = x + bw / 2;
    const cy = y + bh / 2;
    spawnPuffs(cx, cy);

    noBtn.style.pointerEvents = "none";
    noBtn.style.opacity = "0";

    setTimeout(() => {
      x = x0;
      y = y0;
      vx = 0;
      vy = 0;
      noBtn.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    }, 220);

    setTimeout(() => {
      noBtn.style.opacity = "1";
      noBtn.style.pointerEvents = "auto";
      poofing = false;
    }, 700);
  });

  let lastT = performance.now();
  function animateNo(t) {
    const dt = Math.min(0.033, (t - lastT) / 1000);
    lastT = t;

    // Pendant le poof on fige le bouton Non
    if (poofing) {
      x = x0; y = y0; vx = 0; vy = 0;
      noBtn.style.transform = `translate3d(${x}px, ${y}px, 0)`;

      fleeMeter = smoothTo(fleeMeter, 0, dt, 10);
      yesTarget = 1;
      yesScale = smoothTo(yesScale, yesTarget, dt, 12);
      yesBtn.style.transform = `translateY(-50%) scale(${yesScale})`;

      requestAnimationFrame(animateNo);
      return;
    }

    const minX = 0, maxX = zRect.width - bw;
    const minY = 0, maxY = zRect.height - bh;
    const cx = x + bw / 2, cy = y + bh / 2;

    let fleeInstant = 0;
    if (mouseInside) {
      const dx = cx - mx, dy = cy - my;
      const d = Math.hypot(dx, dy) || 0.0001;
      if (d < TRIGGER_R) {
        const k = 1 - d / TRIGGER_R;
        vx += (dx / d) * STRENGTH * k * dt;
        vy += (dy / d) * STRENGTH * k * dt;
        fleeInstant = k;
      }
    } else {
      vx += (x0 - x) * 18 * dt;
      vy += (y0 - y) * 18 * dt;
    }

    const damp = Math.pow(DAMP_60, dt * 60);
    vx *= damp; vy *= damp;

    const speed = Math.hypot(vx, vy);
    if (speed > MAX_SPEED) {
      vx = (vx / speed) * MAX_SPEED;
      vy = (vy / speed) * MAX_SPEED;
    }

    x += vx * dt; y += vy * dt;
    if (x < minX) { x = minX; vx = Math.abs(vx) * RESTIT; }
    if (x > maxX) { x = maxX; vx = -Math.abs(vx) * RESTIT; }
    if (y < minY) { y = minY; vy = Math.abs(vy) * RESTIT; }
    if (y > maxY) { y = maxY; vy = -Math.abs(vy) * RESTIT; }

    noBtn.style.transform = `translate3d(${x}px, ${y}px, 0)`;

    fleeMeter = smoothTo(fleeMeter, fleeInstant, dt, 10);
    yesTarget = clamp(1 + fleeMeter * 1.2, 1, 2.2);
    yesScale = smoothTo(yesScale, yesTarget, dt, 12);
    yesBtn.style.transform = `translateY(-50%) scale(${yesScale})`;

    requestAnimationFrame(animateNo);
  }
  requestAnimationFrame(animateNo);

  yesBtn.addEventListener("click", () => {
    zone.style.display = "none";
    hint.style.display = "none";
    result.style.display = "block";
    resizeConfettiCanvas();
    fullScreenConfetti();
  });
}