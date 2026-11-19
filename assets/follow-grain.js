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

  // Sample the same woodcut paths that are visible with JavaScript turned off.
  // All marks stay in the print's viewBox until they are mapped to the card.
  function illustration(print, seed) {
    const marks = [];
    const sample = print.createSVGPoint();
    function random() {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      return seed / 4294967296;
    }
    function fleck(x, y, light, size) {
      marks.push({ x, y, light, size, alpha: .22 + random() * .39 });
    }

    for (const path of print.querySelectorAll('path[data-grain]')) {
      const length = path.getTotalLength();
      for (let s = random() * 2; s < length; s += 1.5 + random() * 1.8) {
        const edge = path.getPointAtLength(s);
        fleck(edge.x + (random() - .5) * 4, edge.y + (random() - .5) * 4,
          random() < .64, .35 + random() * .80);
      }
      if (!path.isPointInFill || getComputedStyle(path).fill === 'none') continue;
      const box = path.getBBox();
      const attempts = Math.ceil(box.width * box.height / 12);
      for (let i = 0; i < attempts; i++) {
        sample.x = box.x + random() * box.width;
        sample.y = box.y + random() * box.height;
        if (path.isPointInFill(sample)) {
          fleck(sample.x, sample.y, random() < .22, .36 + random() * .78);
        }
      }
    }
    return marks;
  }

  document.querySelectorAll('.experience-card[data-grain]').forEach((link, index) => {
    const art = link.querySelector('.entry-art');
    const canvas = art.querySelector('canvas');
    const context = canvas.getContext('2d');
    if (!context) return;

    const print = art.querySelector('svg');
    const marks = illustration(print, 127 + index * 977);
    const color = getComputedStyle(link).getPropertyValue('--grain').trim();
    let width = 0;
    let height = 0;
    let printX = 0;
    let printY = 0;
    let scale = 1;
    let burst = null;

    const card = {
      x: 0, y: 0, targetX: 0, targetY: 0, heat: 0, targetHeat: 0, until: 0,
      draw(time) {
        if (!width || !height) return;
        context.clearRect(0, 0, width, height);
        const radius = width < 460 ? 66 : 90;
        const burstAge = burst ? (time - burst.time) / 480 : 1;

        for (const mark of marks) {
          let x = printX + mark.x * scale;
          let y = printY + mark.y * scale;
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
          context.fillStyle = mark.light ? color : '#241e20';
          context.globalAlpha = Math.min(1, mark.alpha + highlight);
          const size = Math.max(.65, mark.size * scale);
          context.fillRect(x, y, size * 1.28, size);
        }

        if (burstAge < 1) {
          const travel = 1 - (1 - Math.max(0, burstAge)) ** 3;
          context.fillStyle = color;
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
      // The print and the overlay share an offset parent (including on narrow cards).
      const bounds = print.getBoundingClientRect();
      const overlay = canvas.getBoundingClientRect();
      printX = bounds.left - overlay.left;
      printY = bounds.top - overlay.top;
      scale = bounds.width / print.viewBox.baseVal.width;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      card.draw(performance.now());
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
