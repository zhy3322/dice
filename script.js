const canvas = document.getElementById('sky-canvas');
const context = canvas.getContext('2d');
const stage = document.getElementById('stage');
const form = document.getElementById('dice-form');
const countInput = document.getElementById('dice-count');
const slider = document.getElementById('dice-slider');
const rollButton = document.getElementById('roll-button');
const rollVideo = document.getElementById('roll-video');
const resultsPanel = document.getElementById('results-panel');
const resultsGrid = document.getElementById('dice-results');
const sumValue = document.getElementById('sum-value');
const resultsCount = document.getElementById('results-count');
const stageLabel = document.getElementById('stage-label');
const impactRing = document.getElementById('impact-ring');

let width = 0;
let height = 0;
let resizeTimer;
let explosionFrame = 0;

function resizeCanvas() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  width = stage.clientWidth;
  height = stage.clientHeight;
  canvas.width = width * ratio;
  canvas.height = height * ratio;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function animateMeteor() {
  context.clearRect(0, 0, width, height);
  rollVideo.classList.remove('fading');
  rollVideo.classList.add('playing');
  rollVideo.currentTime = 0;
  const playRequest = rollVideo.play();
  if (playRequest) {
    playRequest.catch(() => finishRoll());
  }
}

function finishRoll() {
  rollVideo.classList.remove('playing');
  rollVideo.classList.add('fading');
  window.setTimeout(() => {
    rollVideo.pause();
    playExplosion(showResults);
  }, 850);
}

function playExplosion(onComplete) {
  const centerX = width / 2;
  const centerY = height / 2;
  const particles = Array.from({ length: 110 }, (_, index) => {
    const angle = index * 2.399963;
    const speed = 1.5 + Math.random() * 4.5;
    return {
      x: centerX,
      y: centerY,
      velocityX: Math.cos(angle) * speed,
      velocityY: Math.sin(angle) * speed,
      size: 1 + Math.random() * 3,
      color: index % 4 === 0 ? '#fff2bd' : index % 2 === 0 ? '#e8b84f' : '#f6d77f'
    };
  });
  const start = performance.now();
  const duration = 720;

  function drawExplosion(time) {
    const progress = Math.min((time - start) / duration, 1);
    context.clearRect(0, 0, width, height);
    particles.forEach((particle) => {
      const fade = 1 - progress;
      const x = particle.x + particle.velocityX * progress * 95;
      const y = particle.y + particle.velocityY * progress * 95 + progress * progress * 50;
      context.globalAlpha = fade;
      context.fillStyle = particle.color;
      context.beginPath();
      context.arc(x, y, particle.size * (1 + progress), 0, Math.PI * 2);
      context.fill();
    });
    context.globalAlpha = 1;
    if (progress < 1) {
      explosionFrame = requestAnimationFrame(drawExplosion);
    } else {
      context.clearRect(0, 0, width, height);
      impactRing.classList.remove('burst');
      void impactRing.offsetWidth;
      impactRing.classList.add('burst');
      onComplete();
    }
  }

  explosionFrame = requestAnimationFrame(drawExplosion);
}

function showResults() {
  const count = clampCount(countInput.value);
  const values = Array.from({ length: count }, () => Math.floor(Math.random() * 6) + 1);
  sumValue.textContent = values.reduce((total, value) => total + value, 0);
  resultsCount.textContent = `${count} 顆骰子`;
  resultsGrid.replaceChildren();
  const fragment = document.createDocumentFragment();
  values.forEach((value, index) => {
    const die = document.createElement('span');
    die.className = `die${value === 6 ? ' high' : ''}`;
    die.setAttribute('role', 'img');
    die.setAttribute('aria-label', `${value} 點`);
    const pipPositions = {
      1: ['center'],
      2: ['top-left', 'bottom-right'],
      3: ['top-left', 'center', 'bottom-right'],
      4: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
      5: ['top-left', 'top-right', 'center', 'bottom-left', 'bottom-right'],
      6: ['top-left', 'top-right', 'middle-left', 'middle-right', 'bottom-left', 'bottom-right']
    };
    pipPositions[value].forEach((position) => {
      const pip = document.createElement('i');
      pip.className = `pip ${position}`;
      pip.setAttribute('aria-hidden', 'true');
      die.appendChild(pip);
    });
    die.style.animationDelay = `${Math.min(index * .012, .45)}s`;
    fragment.appendChild(die);
  });
  resultsGrid.appendChild(fragment);
  resultsPanel.hidden = false;
  stageLabel.textContent = '星痕已落定';
  rollButton.disabled = false;
}

function clampCount(value) {
  return Math.min(1000, Math.max(1, Number.parseInt(value, 10) || 1));
}

function syncCount(value) {
  const count = clampCount(value);
  countInput.value = count;
  slider.value = count;
}

countInput.addEventListener('input', () => syncCount(countInput.value));
slider.addEventListener('input', () => syncCount(slider.value));
form.addEventListener('submit', (event) => {
  event.preventDefault();
  syncCount(countInput.value);
  resultsPanel.hidden = true;
  rollButton.disabled = true;
  stageLabel.textContent = '星火墜落中...';
  animateMeteor();
});

rollVideo.addEventListener('ended', finishRoll);
rollVideo.addEventListener('error', finishRoll);

window.addEventListener('resize', () => {
  window.clearTimeout(resizeTimer);
  resizeTimer = window.setTimeout(resizeCanvas, 120);
});

resizeCanvas();
