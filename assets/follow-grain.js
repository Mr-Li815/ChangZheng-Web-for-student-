/* Four particle illustrations for 同行. Draw once at rest and animate only on input. */
(function () {
  'use strict';

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const activeCards = new Set();
  let frameId = 0;

  function schedule(card, time) {
    card.until = time + 700;
    activeCards.add(card);
    if (!frameId) frameId = requestAnimationFrame(tick);
  }

  function tick(time) {
    frameId = 0;
    activeCards.forEach(card => {
      if (time >= card.until || reducedMotion.matches) {
        card.heat = reducedMotion.matches ? 0 : card.targetHeat;
        card.draw(time);
        activeCards.delete(card);
        return;
      }
      card.heat += (card.targetHeat - card.heat) * .15;
      card.x += (card.targetX - card.x) * .28;
      card.y += (card.targetY - card.y) * .28;
      card.draw(time);
    });
    if (activeCards.size) frameId = requestAnimationFrame(tick);
  }

  function illustration(kind, seed) {
    const marks = [];
    function random() {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      return seed / 4294967296;
    }
    function grain(x, y, alpha, size = 1.32) {
      marks.push({ x, y, alpha: alpha * (.43 + random() * .57), size: size * (.6 + random() * .85) });
    }
    function ribbon(path, width, density, alpha) {
      for (let i = 1; i < path.length; i++) {
        const [x, y] = path[i - 1];
        const [endX, endY] = path[i];
        const steps = Math.ceil(Math.hypot(endX - x, endY - y) * density);
        for (let step = 0; step < steps; step++) {
          const t = (step + random()) / steps;
          grain(x + (endX - x) * t + (random() - .5) * width,
            y + (endY - y) * t + (random() - .5) * width, alpha);
        }
      }
    }
    for (let i = 0; i < 210; i++) grain(random(), random(), .26, .8);

    if (kind === 'route') {
      const trail = [[.03,.78],[.23,.6],[.36,.67],[.57,.46]];
      ribbon(trail, .11, 250, .94);
      ribbon([[.57,.46],[.68,.29],[.8,.25],[.97,.07]], .10, 190, .93);
      ribbon([[.57,.46],[.73,.52],[.81,.45],[1,.42]], .10, 190, .82);
      ribbon([[.57,.46],[.66,.67],[.81,.71],[.95,.59]], .09, 170, .70);
      ribbon([[.04,.87],[.23,.7],[.36,.76],[.49,.67]], .047, 120, .64);
    } else if (kind === 'quiz') {
      for (let i = 0; i < 8; i++) {
        const x = .15 + (i % 4) * .23;
        const y = .30 + Math.floor(i / 4) * .37;
        const radius = .064 + i * .003;
        for (let p = 0; p < 58; p++) {
          const angle = random() * Math.PI * 2;
          const range = Math.sqrt(random()) * radius;
          grain(x + Math.cos(angle) * range, y + Math.sin(angle) * range * 1.38, .96, 1.58);
        }
      }
    } else if (kind === 'letter') {
      const corners = [[.12,.31],[.83,.13],[.98,.65],[.27,.82]];
      ribbon([...corners,corners[0]], .057, 166, .89);
      ribbon([corners[0],[.58,.53],corners[1]], .055, 184, .97);
      ribbon([corners[3],[.44,.47]], .046, 142, .65);
      ribbon([corners[2],[.71,.42]], .046, 142, .65);
      ribbon([[.34,.77],[.84,.64]], .15, 140, .4);
    } else {
      const ridge = [[0,.73],[.19,.60],[.34,.37],[.46,.5],[.66,.17],[.89,.45],[1,.54]];
      for (let layer = 0; layer < 5; layer++) {
        ribbon(ridge.map(([x,y]) => [x, y * (1 - layer * .09) + layer * .095]),
          .06 + layer * .012, 172 - layer * 14, .97 - layer * .12);
      }
      ribbon([[.43,.51],[.57,.41],[.64,.48],[.77,.36]], .07, 140, .73);
    }
    return marks;
  }

  document.querySelectorAll('.experience-card[data-grain]').forEach((link, index) => {
    const art = link.querySelector('.entry-art');
    const canvas = art.querySelector('canvas');
    const context = canvas.getContext('2d');
    if (!context) return;

    const marks = illustration(link.dataset.grain, 127 + index * 977);
    const color = getComputedStyle(link).getPropertyValue('--grain').trim();
    let width = 0;
    let height = 0;
    let burst = null;

    const card = {
      x: 0, y: 0, targetX: 0, targetY: 0, heat: 0, targetHeat: 0, until: 0,
      draw(time) {
        if (!width || !height) return;
        context.clearRect(0, 0, width, height);
        context.fillStyle = color;
        const compact = width < 460;
        const artWidth = width * (compact ? .60 : .54);
        const artHeight = height * (compact ? .62 : .80);
        const startX = width - artWidth - width * .025;
        const startY = height * (compact ? .115 : .085);
        const radius = compact ? 66 : 90;
        const burstAge = burst ? (time - burst.time) / 480 : 1;

        for (const mark of marks) {
          let x = startX + mark.x * artWidth;
          let y = startY + mark.y * artHeight;
          let highlight = 0;
          if (card.heat > .005) {
            const dx = x - card.x;
            const dy = y - card.y;
            const distance = Math.hypot(dx, dy);
            const strength = Math.max(0, 1 - distance / radius) ** 2 * card.heat;
            const spread = strength * 27 / Math.max(8, distance);
            x += dx * spread;
            y += dy * spread;
            highlight = strength * .34;
          }
          context.globalAlpha = Math.min(1, mark.alpha + highlight);
          context.fillRect(x, y, mark.size, mark.size);
        }

        if (burstAge < 1) {
          const travel = 1 - (1 - Math.max(0, burstAge)) ** 3;
          context.globalAlpha = .88 * (1 - burstAge);
          for (let i = 0; i < 26; i++) {
            const angle = i * 2.39996;
            const distance = (12 + (i * 19 % 60)) * travel;
            const size = (1 - travel) * 1.4 + (i % 3) * .55;
            context.fillRect(burst.x + Math.cos(angle) * distance, burst.y + Math.sin(angle) * distance, size, size);
          }
        }
        context.globalAlpha = 1;
      }
    };

    function resize() {
      const ratio = Math.min(devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      if (!width || !height) return;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      card.draw(performance.now());
      art.classList.add('is-drawn');
    }

    function followPointer(event) {
      const rect = canvas.getBoundingClientRect();
      card.targetX = event.clientX - rect.left;
      card.targetY = event.clientY - rect.top;
    }

    link.addEventListener('pointermove', event => {
      if (reducedMotion.matches || event.pointerType === 'touch') return;
      followPointer(event);
      if (!card.targetHeat) {
        card.x = card.targetX;
        card.y = card.targetY;
      }
      card.targetHeat = 1;
      schedule(card, performance.now());
    }, { passive: true });

    link.addEventListener('pointerleave', () => {
      if (!card.targetHeat) return;
      card.targetHeat = 0;
      schedule(card, performance.now());
    });

    link.addEventListener('pointerdown', event => {
      if (reducedMotion.matches || event.button !== 0) return;
      followPointer(event);
      burst = { x: card.targetX, y: card.targetY, time: performance.now() };
      schedule(card, burst.time);
    }, { passive: true });

    function resetMotion() {
      card.targetHeat = card.heat = 0;
      burst = null;
      card.draw(performance.now());
    }
    if (reducedMotion.addEventListener) reducedMotion.addEventListener('change', resetMotion);
    else reducedMotion.addListener(resetMotion);

    if ('ResizeObserver' in window) new ResizeObserver(resize).observe(art);
    else window.addEventListener('resize', resize);
    resize();
  });
})();
