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
    showResults();
  }, 850);
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
    die.textContent = value;
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
