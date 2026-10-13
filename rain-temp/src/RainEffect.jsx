import React, { useEffect, useRef } from 'react';
import './rain.css';
import { createCloudTextures } from './cloudTextures';

export default function RainEffect({ enabled, reduced, paused, theme }) {
  const canvas = useRef(null);
  const active = enabled && !reduced && !paused;
  useEffect(() => {
    const node = canvas.current;
    if (!active || !node) return;
    const context = node.getContext('2d');
    if (!context) return;
    let width = 0, height = 0, drops = [], clouds = [], frame = 0, last = 0;
    let weatherTime = 0, nextFlash = 5, flashStarted = -1, bolt = [];
    const cloudTextures = createCloudTextures(theme === 'dark');
    const header = document.querySelector('.creative-header');
    const resize = () => {
      const top = header?.getBoundingClientRect().height || 82;
      node.style.top = `${top}px`;
      width = window.innerWidth;
      height = Math.max(1, window.innerHeight - top);
      node.style.height = `${height}px`;
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      node.width = Math.round(width * ratio);
      node.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      drops = Array.from({ length: width < 760 ? 110 : 280 }, () => ({
        x: Math.random() * (width + 100), y: Math.random() * height,
        length: 24 + Math.random() * 45, speed: 390 + Math.random() * 420,
        alpha: .28 + Math.random() * .38, thickness: .8 + Math.random() * .9,
      }));
      clouds = Array.from({length: width < 760 ? 4 : 6}, (_, index) => ({
        x: index / (width < 760 ? 4 : 6) * (width + 600) - 400,
        y: -100 + Math.random() * Math.min(height * .22, 150),
        size: (width < 760 ? 520 : 900) + Math.random() * 400,
        speed: 5 + Math.random() * 9, opacity: .35 + Math.random() * .18,
        texture: cloudTextures[index % cloudTextures.length],
        stretch: .22 + Math.random() * .13,
      }));
    };
    const paint = time => {
      if (document.hidden) { frame = 0; return; }
      frame = requestAnimationFrame(paint);
      if (last && time - last < 33) return;
      const delta = last ? Math.min((time - last) / 1000, .08) : 1 / 30;
      last = time;
      weatherTime += delta;
      context.clearRect(0, 0, width, height);
      for (const cloud of clouds) {
        cloud.x += cloud.speed * delta;
        if (cloud.x > width + 100) cloud.x = -cloud.size;
        context.globalAlpha = cloud.opacity;
        context.drawImage(cloud.texture, cloud.x, cloud.y, cloud.size, cloud.size * cloud.stretch);
      }
      context.globalAlpha = 1;
      if (weatherTime >= nextFlash) {
        window.dispatchEvent(new Event('weather-thunder'));
        flashStarted = weatherTime;
        nextFlash = weatherTime + 10 + Math.random() * 8;
        const origin = width * (.55 + Math.random() * .35);
        bolt = Array.from({length:7}, (_, index) => ({
          x: origin + (index ? Math.random() * 45 - 22 : 0),
          y: index * Math.min(height * .055, 34),
        }));
      }
      const flashAge = weatherTime - flashStarted;
      if (flashStarted >= 0 && flashAge < .65) {
        // One gradual pulse, widely spaced; no repeated flickering.
        const intensity = Math.sin(flashAge / .65 * Math.PI);
        const glow = context.createRadialGradient(bolt[0].x,0,0,bolt[0].x,0,width*.65);
        glow.addColorStop(0,`rgba(210,232,255,${intensity * .22})`);
        glow.addColorStop(1,'rgba(210,232,255,0)');
        context.fillStyle = glow;
        context.fillRect(0,0,width,height);
        context.save();
        context.strokeStyle = theme === 'dark' ? `rgba(229,243,255,${intensity*.55})` : `rgba(95,136,172,${intensity*.4})`;
        context.lineWidth = 1.6;
        context.shadowColor = '#c8e6ff';
        context.shadowBlur = 12;
        context.beginPath();
        bolt.forEach((point,index) => index ? context.lineTo(point.x,point.y) : context.moveTo(point.x,point.y));
        context.stroke();
        context.restore();
      }
      context.lineCap = 'round';
      for (const drop of drops) {
        drop.y += drop.speed * delta;
        drop.x -= drop.speed * delta * .16;
        if (drop.y > height + drop.length || drop.x < -50) {
          drop.y = -drop.length;
          drop.x = Math.random() * (width + 100);
        }
        context.lineWidth = drop.thickness;
        context.strokeStyle = theme === 'dark' ? `rgba(210,230,247,${drop.alpha})` : `rgba(57,89,116,${drop.alpha * .85})`;
        context.beginPath();
        context.moveTo(drop.x, drop.y);
        context.lineTo(drop.x - drop.length * .16, drop.y + drop.length);
        context.stroke();
      }
    };
    const visibility = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      last = 0;
      if (!document.hidden) frame = requestAnimationFrame(paint);
    };
    const observer = new ResizeObserver(resize);
    if (header) observer.observe(header);
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', visibility);
    resize();
    visibility();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', visibility);
      context.clearRect(0, 0, width, height);
    };
  }, [active, theme]);
  return active ? <canvas className="rain-atmosphere" ref={canvas} aria-hidden="true" /> : null;
}
