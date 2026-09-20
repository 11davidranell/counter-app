let saveEl = document.getElementById("save-el");
let countEl = document.getElementById("count-el");
let count = 0;
let audioContext;
let backgroundMusicStarted = false;
let backgroundBeatInterval = null;

const slides = document.querySelectorAll(".slide");
let currentSlide = 0;

function ensureAudioContext() {
  const AudioCtor = window.AudioContext || window.webkitAudioContext;

  if (!AudioCtor) {
    return null;
  }

  if (!audioContext) {
    audioContext = new AudioCtor();
  }

  return audioContext;
}

function playClickSound() {
  const ctx = ensureAudioContext();

  if (!ctx) {
    return;
  }

  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.type = "triangle";
  oscillator.frequency.setValueAtTime(660, ctx.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(
    1000,
    ctx.currentTime + 0.08,
  );

  gainNode.gain.setValueAtTime(0.0001, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.45, ctx.currentTime + 0.02);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12);

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.start();
  oscillator.stop(ctx.currentTime + 0.13);
}

function playKick(time, frequency = 44) {
  if (!audioContext) return;

  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(frequency, time);
  oscillator.frequency.exponentialRampToValueAtTime(22, time + 0.18);

  gainNode.gain.setValueAtTime(0.0001, time);
  gainNode.gain.exponentialRampToValueAtTime(0.9, time + 0.015);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, time + 0.2);

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.start(time);
  oscillator.stop(time + 0.22);
}

function playBass(time, frequency) {
  if (!audioContext) return;

  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.type = "triangle";
  oscillator.frequency.setValueAtTime(frequency, time);

  gainNode.gain.setValueAtTime(0.0001, time);
  gainNode.gain.exponentialRampToValueAtTime(0.22, time + 0.03);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, time + 0.25);

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.start(time);
  oscillator.stop(time + 0.3);
}

function playHat(time) {
  if (!audioContext) return;

  const buffer = audioContext.createBuffer(
    1,
    audioContext.sampleRate * 0.08,
    audioContext.sampleRate,
  );
  const channelData = buffer.getChannelData(0);

  for (let i = 0; i < channelData.length; i++) {
    channelData[i] =
      (Math.random() * 2 - 1) * Math.pow(1 - i / channelData.length, 2);
  }

  const noise = audioContext.createBufferSource();
  const filter = audioContext.createBiquadFilter();
  const gainNode = audioContext.createGain();

  noise.buffer = buffer;
  filter.type = "highpass";
  filter.frequency.setValueAtTime(5000, time);

  gainNode.gain.setValueAtTime(0.0001, time);
  gainNode.gain.exponentialRampToValueAtTime(0.11, time + 0.005);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, time + 0.06);

  noise.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(audioContext.destination);

  noise.start(time);
  noise.stop(time + 0.07);
}

function playLead(time, frequency) {
  if (!audioContext) return;

  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  const filter = audioContext.createBiquadFilter();

  oscillator.type = "sawtooth";
  oscillator.frequency.setValueAtTime(frequency, time);
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(1400, time);

  gainNode.gain.setValueAtTime(0.0001, time);
  gainNode.gain.exponentialRampToValueAtTime(0.12, time + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, time + 0.22);

  oscillator.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.start(time);
  oscillator.stop(time + 0.25);
}

function startBackgroundMusic() {
  if (backgroundMusicStarted) {
    return;
  }

  const ctx = ensureAudioContext();

  if (!ctx) {
    return;
  }

  backgroundMusicStarted = true;
  let step = 0;

  backgroundBeatInterval = setInterval(() => {
    const now = ctx.currentTime;

    if (step % 2 === 0) {
      playKick(now, 42);
      playBass(now, 55);
    }

    if (step % 2 === 1) {
      playKick(now + 0.02, 38);
      playBass(now + 0.02, 48);
    }

    if (step % 4 === 0) {
      playHat(now);
    }

    if (step % 4 === 2) {
      playHat(now + 0.04);
    }

    const leadTones = [220, 277, 330, 247];
    if (step % 8 === 0 || step % 8 === 5) {
      playLead(now, leadTones[step % leadTones.length]);
    }

    step += 1;
  }, 180);
}

function showNextSlide() {
  slides[currentSlide].classList.remove("active");
  currentSlide = (currentSlide + 1) % slides.length;
  slides[currentSlide].classList.add("active");
}

setInterval(showNextSlide, 3500);

document.addEventListener("pointerdown", startBackgroundMusic, { once: true });
document.addEventListener("keydown", startBackgroundMusic, { once: true });

function increment() {
  count += 1;
  countEl.textContent = count;
  startBackgroundMusic();
  playClickSound();
}

function save() {
  let countStr = count + " - ";
  saveEl.textContent += countStr;
  countEl.textContent = 0;
  count = 0;
  startBackgroundMusic();
  playClickSound();
}
