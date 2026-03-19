// ── Register service worker for PWA / offline support ──
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js');
  });
}

// ── Trigger .active on enter, reset on exit so animations replay on scroll up ──
// Track pending kanji timeouts so we can cancel them if the user scrolls away fast
const kanjiTimers = [];

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    const el = entry.target;

    if (entry.isIntersecting) {
      el.classList.add('active');

      if (el.id === 's2') {
        el.querySelectorAll('.kanji-char').forEach((c, i) => {
          const t = setTimeout(() => c.classList.add('drop'), i * 290);
          kanjiTimers.push(t);
        });
      }

      if (el.id === 's7') startCursedCanvas('cursed-canvas');

    } else {
      // Reset: remove active so CSS transitions/animations can replay
      el.classList.remove('active');

      // Cancel any pending kanji timers and strip .drop so they re-animate
      if (el.id === 's2') {
        kanjiTimers.forEach(t => clearTimeout(t));
        kanjiTimers.length = 0;
        el.querySelectorAll('.kanji-char').forEach(c => c.classList.remove('drop'));
      }
    }
  });
}, { threshold: 0.45 });

document.querySelectorAll('.section').forEach(s => observer.observe(s));


// ── Cursed Energy Particle Canvas ──
function startCursedCanvas(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (canvas._started) return;
  canvas._started = true;

  const ctx = canvas.getContext('2d');

  const resize = () => {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  };
  resize();
  window.addEventListener('resize', resize);

  const SYMBOLS = ['力', '✦', '⚡', '呪', '面', '両', '꩜', '呪', '力'];
  const COLORS  = ['#cc0000', '#ff3333', '#880000', '#ff4400', '#cc4400', '#660000'];

  // Fewer particles on small screens for performance
  const isMobile = window.innerWidth < 600;
  const PARTICLE_COUNT = isMobile ? 45 : 80;
  const SCATTER_COUNT  = isMobile ? 30 : 55;

  class Particle {
    constructor(scatter) { this.reset(scatter); }

    reset(scatter) {
      this.x     = Math.random() * canvas.width;
      this.y     = scatter ? Math.random() * canvas.height : canvas.height + 24;
      this.vx    = (Math.random() - 0.5) * 1.5;
      this.vy    = -(Math.random() * 1.8 + 0.3);
      this.alpha = Math.random() * 0.8 + 0.15;
      this.size  = Math.floor(Math.random() * 22 + 10);
      this.sym   = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
      this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
      this.rot   = Math.random() * Math.PI * 2;
      this.rotV  = (Math.random() - 0.5) * 0.045;
    }

    tick() {
      this.x     += this.vx;
      this.y     += this.vy;
      this.rot   += this.rotV;
      this.alpha -= 0.0038;
      if (this.alpha <= 0 || this.y < -32) this.reset(false);
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rot);
      ctx.globalAlpha  = this.alpha;
      ctx.fillStyle    = this.color;
      ctx.shadowBlur   = 16;
      ctx.shadowColor  = this.color;
      ctx.font         = `${this.size}px serif`;
      ctx.fillText(this.sym, 0, 0);
      ctx.restore();
    }
  }

  const particles = Array.from(
    { length: PARTICLE_COUNT },
    (_, i) => new Particle(i < SCATTER_COUNT)
  );

  (function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.tick(); p.draw(); });
    requestAnimationFrame(animate);
  })();
}
