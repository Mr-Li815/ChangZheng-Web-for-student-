/* Printed ink and a quiet change of viewpoint. Both layouts use the same plate. */
(function () {
  'use strict';

  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const clamp = (value, low, high) => Math.max(low, Math.min(high, value));

  function paperGrain(seed) {
    function random() {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      return seed / 4294967296;
    }
    return Array.from({ length: 3100 }, () => ({
      x: random(), y: random(), size: .45 + random() * .85,
      alpha: .28 + random() * .46, light: random() < .42
    }));
  }

  document.querySelectorAll('.experience-card[data-print], .game-cover[data-print]').forEach(host => {
    const plate = host.querySelector('.print-plate');
    const canvas = plate.querySelector('canvas');
    const image = plate.querySelector('img');
    const ctx = canvas.getContext('2d');
    const entry = host.matches('a');
    const grainColor = getComputedStyle(host).getPropertyValue('--grain').trim();
    const marks = paperGrain(Array.from(host.dataset.print).reduce((n, c) => n * 31 + c.charCodeAt(0), 127));
    const mask = new Image();
    let width = 0, height = 0, frame = 0, last = 0;
    let x = 0, y = 0, targetX = 0, targetY = 0, lift = 0, targetLift = 0;
    let inkX = 0, inkY = 0, heat = 0, targetHeat = 0, burst = null;
    let press = null, dragged = false;

    function draw(time) {
      if (!ctx || !width || !height || !mask.complete || !mask.naturalWidth) return;
      ctx.clearRect(0, 0, width, height);
      const scale = width / 240;
      const radius = Math.min(76, width * .31);
      for (const mark of marks) {
        let px = mark.x * width, py = mark.y * height;
        let influence = 0;
        const dx = px - inkX, dy = py - inkY;
        if (heat && Math.abs(dx) < radius && Math.abs(dy) < radius) {
          const distance = Math.hypot(dx, dy);
          influence = Math.max(0, 1 - distance / radius) ** 2 * heat;
          const push = influence * 15 / Math.max(5, distance);
          px += dx * push;
          py += dy * push;
        }
        const size = Math.max(.6, mark.size * scale);
        ctx.fillStyle = mark.light ? grainColor : '#241e20';
        ctx.globalAlpha = mark.alpha + influence * .18;
        ctx.fillRect(px, py, size * 1.25, size);
      }
      // The SVG fragment exposes just the ink-bearing paths. Compositing also
      // works when the exhibition is opened from disk, without reading pixels.
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'destination-in';
      ctx.drawImage(mask, 0, 0, width, height);
      ctx.globalCompositeOperation = 'source-over';
      if (burst) {
        const age = clamp((time - burst.time) / 340, 0, 1);
        ctx.fillStyle = grainColor;
        ctx.globalAlpha = .7 * (1 - age);
        for (let i = 0; i < 14; i++) {
          const reach = (1 - (1 - age) ** 2) * (7 + i * 11 % 26);
          const angle = i * 2.39996;
          ctx.fillRect(burst.x + Math.cos(angle) * reach, burst.y + Math.sin(angle) * reach, 1.4, 1.1);
        }
      }
      ctx.globalAlpha = 1;
    }

    function resize() {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      if (!ctx || !width || !height) return;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      ctx.setTransform(canvas.width / width, 0, 0, canvas.height / height, 0, 0);
      draw(performance.now());
    }

    function setView() {
      if (!entry) return;
      host.style.setProperty('--view-x', x.toFixed(4));
      host.style.setProperty('--view-y', y.toFixed(4));
      host.style.setProperty('--lift', lift.toFixed(4));
    }
    function frameAt(time) {
      frame = 0;
      const step = 1 - Math.exp(-Math.min(last ? time - last : 16, 48) / 72);
      last = time;
      function approach(value, target) {
        return Math.abs(value - target) < .002 ? target : value + (target - value) * step;
      }
      x = approach(x, targetX);
      y = approach(y, targetY);
      lift = approach(lift, targetLift);
      const wasHot = heat !== 0;
      heat = approach(heat, targetHeat);
      setView();
      if (wasHot || heat || burst) draw(time);
      if (burst && time - burst.time >= 340) burst = null;
      if (x !== targetX || y !== targetY || lift !== targetLift || heat !== targetHeat || burst) {
        frame = requestAnimationFrame(frameAt);
      } else last = 0;
    }
    function wake() {
      if (!frame && !reduce.matches && !document.hidden) frame = requestAnimationFrame(frameAt);
    }
    function aim(event) {
      const bounds = plate.getBoundingClientRect();
      inkX = (event.clientX - bounds.left) * width / (bounds.width || 1);
      inkY = (event.clientY - bounds.top) * height / (bounds.height || 1);
      targetHeat = inkX >= 0 && inkY >= 0 && inkX <= width && inkY <= height ? 1 : 0;
      if (entry && fine.matches && event.pointerType !== 'touch') {
        const box = host.getBoundingClientRect();
        targetX = clamp((event.clientX - box.left) / box.width * 2 - 1, -1, 1);
        targetY = clamp((event.clientY - box.top) / box.height * 2 - 1, -1, 1);
        targetLift = 1;
      }
      wake();
    }
    function rest() {
      targetX = targetY = targetLift = targetHeat = 0;
      wake();
    }
    function reset() {
      cancelAnimationFrame(frame);
      frame = last = x = y = targetX = targetY = lift = targetLift = heat = targetHeat = 0;
      press = burst = null;
      dragged = false;
      setView();
      draw(performance.now());
    }

    host.addEventListener('pointermove', event => {
      if (reduce.matches || event.pointerType === 'touch') return;
      if (press && Math.hypot(event.clientX - press.x, event.clientY - press.y) > 7) dragged = true;
      aim(event);
    }, { passive: true });
    host.addEventListener('pointerleave', rest, { passive: true });
    host.addEventListener('pointerdown', event => {
      if (event.button !== 0) return;
      dragged = false;
      if (reduce.matches) return;
      if (entry && event.pointerType !== 'touch') press = { x: event.clientX, y: event.clientY };
      aim(event);
      if (targetHeat) burst = { x: inkX, y: inkY, time: performance.now() };
      if (event.pointerType === 'touch') targetHeat = 0;
      wake();
    }, { passive: true });
    if (entry) {
      host.addEventListener('dragstart', event => event.preventDefault());
      window.addEventListener('pointerup', () => { press = null; }, { passive: true });
      host.addEventListener('click', event => {
        if (dragged && event.detail) event.preventDefault();
        dragged = false;
      });
    }
    host.addEventListener('pointercancel', reset);
    window.addEventListener('blur', reset);
    if (reduce.addEventListener) reduce.addEventListener('change', reset);
    else reduce.addListener(reset);

    mask.onload = resize;
    mask.src = image.src + '#ink';
    if ('ResizeObserver' in window) new ResizeObserver(resize).observe(plate);
    else window.addEventListener('resize', resize);
    resize();
  });
})();
