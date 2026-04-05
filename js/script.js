const introTitle = document.getElementById('introTitle');
const revealBtn = document.getElementById('revealBtn');
const intro = document.getElementById('intro');
const cursor = document.getElementById('cursor');
const body = document.body;
const introText = 'Eyy tu... ¿sabes qué día es hoy?, pues si juanjito es 18 de Abril, el dia de tus cumpleaños';

function typeWriter(element, text, speed = 42) {
  let index = 0;
  element.textContent = '';
  return new Promise((resolve) => {
    const tick = () => {
      element.innerHTML = text.slice(0, index).replace('cumpleaños', '<span class="accent">cumpleaños</span>');
      index += 1;
      if (index <= text.length) {
        window.setTimeout(tick, speed);
      } else {
        resolve();
      }
    };
    tick();
  });
}

async function runIntro() {
  await typeWriter(introTitle, introText, 42);
  window.setTimeout(() => {
    document.querySelector('.intro-actions').classList.add('is-visible');
  }, 420);
}

runIntro();

revealBtn.addEventListener('click', () => {
  intro.classList.add('is-hidden');
  body.classList.add('is-ready');
  window.setTimeout(() => {
    intro.remove();
  }, 1100);
});

const revealItems = document.querySelectorAll('.reveal, .timeline-item, .memory-card');
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.18 });

revealItems.forEach((item) => observer.observe(item));

const finePointer = window.matchMedia('(pointer: fine)').matches;
if (finePointer) {
  body.classList.add('has-custom-cursor');
  cursor.classList.add('is-active');
  let targetX = window.innerWidth / 2;
  let targetY = window.innerHeight / 2;
  let currentX = targetX;
  let currentY = targetY;

  const animateCursor = () => {
    currentX += (targetX - currentX) * 0.24;
    currentY += (targetY - currentY) * 0.24;
    cursor.style.left = `${currentX}px`;
    cursor.style.top = `${currentY}px`;
    window.requestAnimationFrame(animateCursor);
  };

  window.addEventListener('pointermove', (event) => {
    targetX = event.clientX;
    targetY = event.clientY;
  });

  window.addEventListener('pointerdown', () => cursor.classList.add('is-down'));
  window.addEventListener('pointerup', () => cursor.classList.remove('is-down'));
  window.addEventListener('blur', () => cursor.classList.remove('is-down'));

  window.requestAnimationFrame(animateCursor);

  document.querySelectorAll('a, button, [data-tilt], [data-audio-player]').forEach((item) => {
    item.addEventListener('pointerenter', () => cursor.classList.add('is-hover'));
    item.addEventListener('pointerleave', () => cursor.classList.remove('is-hover'));
  });
}

const journeyStage = document.getElementById('journeyStage');
const stars = document.getElementById('stars');
const parallaxLayers = journeyStage ? journeyStage.querySelectorAll('[data-depth]') : [];

function updateParallax() {
  const scrollY = window.scrollY || document.documentElement.scrollTop;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const progress = maxScroll > 0 ? scrollY / maxScroll : 0;
  document.documentElement.style.setProperty('--scroll-progress', progress.toFixed(4));

  if (stars) {
    stars.style.transform = `translate3d(0, ${progress * -60}px, 0)`;
  }

  parallaxLayers.forEach((layer) => {
    const depth = Number(layer.dataset.depth || 0.2);
    const shift = (progress - 0.35) * depth * 120;
    layer.style.transform = `translate3d(0, ${shift}px, 0) rotate(${(progress - 0.5) * depth * 4}deg)`;
  });
}

window.addEventListener('scroll', updateParallax, { passive: true });
updateParallax();

const players = document.querySelectorAll('[data-audio-player]');

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return '0:00';
  const minutes = Math.floor(seconds / 60);
  const remaining = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${minutes}:${remaining}`;
}

players.forEach((player) => {
  const audio = player.querySelector('audio');
  const button = player.querySelector('.play-btn');
  const progressFill = player.querySelector('.progress span');
  const current = player.querySelector('.current');
  const duration = player.querySelector('.duration');

  audio.addEventListener('loadedmetadata', () => {
    duration.textContent = formatTime(audio.duration);
  });

  audio.addEventListener('timeupdate', () => {
    const ratio = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
    progressFill.style.width = ratio + '%';
    current.textContent = formatTime(audio.currentTime);
  });

  audio.addEventListener('play', () => {
    player.classList.add('is-playing');
  });

  audio.addEventListener('pause', () => {
    player.classList.remove('is-playing');
  });

  audio.addEventListener('ended', () => {
    player.classList.remove('is-playing');
    progressFill.style.width = '0%';
    current.textContent = '0:00';
  });

  button.addEventListener('click', async () => {
    const isPlaying = !audio.paused;

    players.forEach((otherPlayer) => {
      if (otherPlayer !== player) {
        const otherAudio = otherPlayer.querySelector('audio');
        otherAudio.pause();
      }
    });

    if (isPlaying) {
      audio.pause();
      return;
    }

    try {
      await audio.play();
    } catch (error) {
      console.warn('No se pudo iniciar la reproducción automáticamente.', error);
    }
  });
});

document.querySelectorAll('[data-tilt]').forEach((card) => {
  card.addEventListener('pointermove', (event) => {
    const bounds = card.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    card.style.transform = `perspective(1200px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateY(-2px)`;
  });

  card.addEventListener('pointerleave', () => {
    card.style.transform = 'perspective(1200px) rotateY(0deg) rotateX(0deg) translateY(0)';
  });
});
