/* =========================================================
   Gymmy – rest timer engine
   One shared countdown used by the Timer tab, exercise details
   and the workout player. Time is measured against Date.now(),
   so it stays accurate when the tab is in the background.
   ========================================================= */
window.GymmyTimer = (function () {
  'use strict';

  /* ---------- Sound + vibration ---------- */
  const Alarm = (function () {
    let ctx = null;

    // Browsers only allow audio after a user gesture, so this runs on Start.
    function unlock() {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        if (!ctx) ctx = new AudioCtx();
        if (ctx.state === 'suspended') ctx.resume();
      } catch (e) {
        ctx = null;
      }
    }

    function beep(at, freq, length, volume) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, at);
      gain.gain.exponentialRampToValueAtTime(volume, at + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, at + length);
      osc.connect(gain).connect(ctx.destination);
      osc.start(at);
      osc.stop(at + length + 0.05);
    }

    function tick() {
      try {
        if (ctx) beep(ctx.currentTime + 0.01, 660, 0.08, 0.15);
      } catch (e) { /* audio unavailable */ }
    }

    function ring() {
      try {
        if (ctx) {
          const t = ctx.currentTime + 0.05;
          beep(t, 880, 0.18, 0.35);
          beep(t + 0.25, 880, 0.18, 0.35);
          beep(t + 0.5, 1320, 0.4, 0.35);
        }
      } catch (e) { /* audio unavailable */ }
      try {
        if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 400]);
      } catch (e) { /* vibration unavailable */ }
    }

    return { unlock, tick, ring };
  })();

  /* ---------- Countdown ---------- */
  const listeners = new Set();
  let duration = 60;     // seconds the current countdown started from
  let remaining = 60;    // seconds left
  let endAt = 0;         // timestamp (ms) when a running countdown hits zero
  let status = 'idle';   // idle | running | paused | done
  let intervalId = null;
  let lastWhole = null;  // last whole second, for 3-2-1 ticks

  function snapshot() {
    return { status, duration, remaining };
  }

  function emit(type) {
    const state = Object.assign({ type }, snapshot());
    listeners.forEach((fn) => fn(state));
  }

  function stopLoop() {
    if (intervalId) clearInterval(intervalId);
    intervalId = null;
  }

  function loop() {
    remaining = Math.max(0, (endAt - Date.now()) / 1000);
    if (remaining <= 0) {
      finish();
      return;
    }
    const whole = Math.ceil(remaining);
    if (whole !== lastWhole && whole <= 3) Alarm.tick();
    lastWhole = whole;
    emit('tick');
  }

  function run() {
    stopLoop();
    endAt = Date.now() + remaining * 1000;
    lastWhole = Math.ceil(remaining);
    status = 'running';
    intervalId = setInterval(loop, 200);
  }

  function start(secs) {
    if (typeof secs === 'number') {
      duration = remaining = Math.max(1, secs);
    } else if (status === 'done' || remaining <= 0) {
      remaining = duration;
    }
    Alarm.unlock();
    run();
    emit('start');
  }

  function pause() {
    if (status !== 'running') return;
    remaining = Math.max(0, (endAt - Date.now()) / 1000);
    stopLoop();
    status = 'paused';
    emit('pause');
  }

  function resume() {
    if (status !== 'paused') return;
    Alarm.unlock();
    run();
    emit('resume');
  }

  function toggle() {
    if (status === 'running') pause();
    else if (status === 'paused') resume();
    else start();
  }

  function reset(secs) {
    stopLoop();
    if (typeof secs === 'number') duration = Math.max(1, secs);
    remaining = duration;
    status = 'idle';
    emit('reset');
  }

  // Adds or removes seconds. While counting, it changes the time left;
  // otherwise it changes the starting duration.
  function add(delta) {
    if (status === 'running') {
      remaining = Math.max(1, (endAt - Date.now()) / 1000 + delta);
      endAt = Date.now() + remaining * 1000;
    } else if (status === 'paused') {
      remaining = Math.max(1, remaining + delta);
    } else {
      duration = Math.min(3600, Math.max(5, duration + delta));
      remaining = duration;
      status = 'idle';
    }
    if (remaining > duration) duration = remaining;
    emit('adjust');
  }

  function finish() {
    stopLoop();
    remaining = 0;
    status = 'done';
    Alarm.ring();
    emit('end');
  }

  function subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  }

  return { start, pause, resume, toggle, reset, add, subscribe, snapshot, unlockAudio: Alarm.unlock };
})();
