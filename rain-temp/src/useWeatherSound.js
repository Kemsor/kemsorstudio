import { useCallback, useEffect, useRef, useState } from 'react';

function createWeatherAudio() {
  const Context = window.AudioContext || window.webkitAudioContext;
  const context = new Context();
  const master = context.createGain();
  master.gain.value = 0;
  const limiter = context.createDynamicsCompressor();
  limiter.threshold.value = -18;
  limiter.ratio.value = 5;
  master.connect(limiter).connect(context.destination);
  const noise = (seconds, brown = false) => {
    const buffer = context.createBuffer(2, Math.ceil(context.sampleRate * seconds), context.sampleRate);
    for (let channel = 0; channel < 2; channel++) {
      const values = buffer.getChannelData(channel);
      let previous = 0;
      for (let i = 0; i < values.length; i++) {
        const white = Math.random() * 2 - 1;
        previous = (previous + .02 * white) / 1.02;
        values[i] = brown ? previous * 3.5 : white;
      }
    }
    return buffer;
  };
  const rain = context.createBufferSource();
  rain.buffer = noise(4);
  rain.loop = true;
  const high = context.createBiquadFilter();
  high.type = 'highpass'; high.frequency.value = 450;
  const low = context.createBiquadFilter();
  low.type = 'lowpass'; low.frequency.value = 6500;
  const level = context.createGain(); level.gain.value = .14;
  rain.connect(high).connect(low).connect(level).connect(master);
  rain.start();
  const thunderBuffer = noise(6, true);
  const storms = new Set();
  return {
    context,
    async resume() {
      await context.resume();
      master.gain.setTargetAtTime(.65, context.currentTime, .15);
    },
    suspend() {
      storms.forEach(source => { try { source.stop(); } catch {} });
      storms.clear();
      master.gain.cancelScheduledValues(context.currentTime);
      master.gain.setValueAtTime(0, context.currentTime);
      context.suspend().catch(() => {});
    },
    thunder() {
      if (context.state !== 'running') return;
      const source = context.createBufferSource(); source.buffer = thunderBuffer;
      const filter = context.createBiquadFilter(); filter.type = 'lowpass';
      const envelope = context.createGain();
      const at = context.currentTime + .3;
      filter.frequency.setValueAtTime(650, at);
      filter.frequency.exponentialRampToValueAtTime(100, at + 5.8);
      envelope.gain.setValueAtTime(0, at);
      envelope.gain.linearRampToValueAtTime(.8, at + .35);
      envelope.gain.exponentialRampToValueAtTime(.15, at + 2.2);
      envelope.gain.exponentialRampToValueAtTime(.001, at + 5.8);
      source.connect(filter).connect(envelope).connect(master);
      storms.add(source);
      source.onended = () => { storms.delete(source); source.disconnect(); filter.disconnect(); envelope.disconnect(); };
      source.start(at);
    },
    close() { rain.stop(); context.close().catch(() => {}); },
  };
}

export default function useWeatherSound(active) {
  const engine = useRef(null);
  const desired = useRef(false);
  const [enabled, setEnabled] = useState(false);
  const [error, setError] = useState('');
  const supported = Boolean(window.AudioContext || window.webkitAudioContext);
  const toggle = useCallback(async () => {
    setError('');
    if (desired.current) {
      desired.current = false;
      engine.current?.suspend();
      setEnabled(false);
      return;
    }
    desired.current = true;
    try {
      engine.current ||= createWeatherAudio();
      // Unlock audio directly from the visitor's click.
      await engine.current.resume();
      if (desired.current) setEnabled(true);
      else engine.current.suspend();
    } catch {
      desired.current = false;
      setEnabled(false);
      setError('Weather sound could not start. Try the sound button again.');
    }
  }, []);
  useEffect(() => {
    const sync = () => {
      if (!engine.current) return;
      if (enabled && active && !document.hidden) engine.current.resume().catch(() => {
        desired.current = false; setEnabled(false);
      });
      else engine.current.suspend();
    };
    const thunder = () => { if (enabled && active && !document.hidden) engine.current?.thunder(); };
    sync();
    document.addEventListener('visibilitychange', sync);
    window.addEventListener('weather-thunder', thunder);
    return () => {
      document.removeEventListener('visibilitychange', sync);
      window.removeEventListener('weather-thunder', thunder);
      engine.current?.suspend();
    };
  }, [active, enabled]);
  useEffect(() => () => { desired.current = false; engine.current?.close(); engine.current = null; }, []);
  return { enabled, toggle, supported, error };
}
