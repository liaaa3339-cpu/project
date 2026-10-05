/* =========================================================
   Gymmy – app
   Rendering, filters, favorites, language switching,
   exercise/workout details and the workout player.
   Depends on data.js, i18n.js and timer.js (loaded first).
   ========================================================= */
(function () {
  'use strict';

  const DATA = window.GYMMY_DATA;
  const STRINGS = window.GYMMY_I18N;
  const Timer = window.GymmyTimer;

  const VIEWS = ['explore', 'favorites', 'timer']; // extensions can add more (see GymmyApp.register)
  const PRESETS = [30, 60, 90, 120];
  const RING = 2 * Math.PI * 52; // circumference of the timer ring (r = 52 in a 120 viewBox)

  /* ---------- Storage (fails quietly in private mode) ---------- */
  const store = {
    get(key, fallback) {
      try {
        const raw = localStorage.getItem('gymmy.' + key);
        return raw === null ? fallback : JSON.parse(raw);
      } catch (e) {
        return fallback;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem('gymmy.' + key, JSON.stringify(value));
      } catch (e) { /* storage unavailable */ }
    },
  };

  /* ---------- State ---------- */
  function detectLang() {
    const lang = (navigator.languages && navigator.languages[0]) || navigator.language || 'en';
    return lang.toLowerCase().startsWith('ar') ? 'ar' : 'en';
  }

  const savedLang = store.get('lang', null);
  const savedGender = store.get('gender', null);

  const state = {
    lang: STRINGS[savedLang] ? savedLang : detectLang(),
    view: 'explore',
    query: '',
    muscles: new Set(),
    place: null,
    levels: new Set(),
    gender: DATA.GENDERS.includes(savedGender) ? savedGender : null,
    favs: {
      exercise: new Set(store.get('favExercises', [])),
      workout: new Set(store.get('favWorkouts', [])),
    },
    sheet: null, // { type: 'exercise' | 'workout', id, from }
  };

  const player = {
    active: false,
    workout: null,
    items: [],        // [{ ex, plan }]
    idx: 0,           // current exercise
    set: 1,           // current set (1-based)
    phase: 'work',    // work | timing | rest | done
    startedAt: 0,
    endedAt: 0,
    setsDone: 0,
    confirming: false,
    wasRunning: false,
    returnFocus: null,
  };

  const exerciseById = new Map(DATA.EXERCISES.map((ex) => [ex.id, ex]));
  const workoutById = new Map(DATA.WORKOUTS.map((w) => [w.id, w]));

  /* ---------- DOM ---------- */
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  const els = {
    langBtn: $('#langBtn'),
    langBtnText: $('#langBtnText'),
    search: $('#search'),
    filters: $('#filters'),
    resultCount: $('#resultCount'),
    clearBtn: $('#clearBtn'),
    notice: $('#genderNotice'),
    noticeText: $('#genderNoticeText'),
    workoutSection: $('#workoutSection'),
    workoutsTitle: $('#workouts-title'),
    workoutCount: $('#workoutCount'),
    workoutList: $('#workoutList'),
    exerciseSection: $('#exerciseSection'),
    exerciseCount: $('#exerciseCount'),
    exerciseGrid: $('#exerciseGrid'),
    exploreEmpty: $('#exploreEmpty'),
    favWorkoutSection: $('#favWorkoutSection'),
    favWorkoutCount: $('#favWorkoutCount'),
    favWorkoutList: $('#favWorkoutList'),
    favExerciseSection: $('#favExerciseSection'),
    favExerciseCount: $('#favExerciseCount'),
    favExerciseGrid: $('#favExerciseGrid'),
    favEmpty: $('#favEmpty'),
    favBadge: $('#favBadge'),
    presetList: $('#presetList'),
    miniTimer: $('#miniTimer'),
    miniTimerTime: $('#miniTimerTime'),
    sheet: $('#sheet'),
    sheetInner: $('#sheetInner'),
    player: $('#player'),
    playerInner: $('#playerInner'),
    toast: $('#toast'),
    announcer: $('#announcer'),
  };

  /* ---------- Text helpers ---------- */
  const dict = () => STRINGS[state.lang];
  let plural = new Intl.PluralRules(state.lang);

  function lookup(source, key) {
    return key.split('.').reduce((obj, part) => (obj == null ? undefined : obj[part]), source);
  }

  // Translate a key. {placeholders} are replaced with vars (which may contain HTML).
  function t(key, vars) {
    let str = lookup(dict(), key);
    if (str === undefined) str = lookup(STRINGS.en, key);
    if (str === undefined) return key;
    if (typeof str !== 'string' || !vars) return str;
    return str.replace(/\{(\w+)\}/g, (match, name) => (name in vars ? vars[name] : match));
  }

  // Plural-aware translation: tp('exercises', 3) → "3 exercises" / "3 تمارين"
  function tp(key, n, html) {
    const forms = t('plurals.' + key);
    const form = forms[plural.select(n)] || forms.other;
    return html ? `<span>${form.replace('{n}', num(n))}</span>` : form.replace('{n}', n);
  }

  const L = (obj) => obj[state.lang] || obj.en;

  const esc = (value) => String(value).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));

  // Numbers and ranges stay left-to-right inside Arabic text (e.g. "12–15").
  const num = (value) => `<bdi class="num" dir="ltr">${esc(value)}</bdi>`;

  const icon = (name, cls) => `<svg class="i${cls ? ' ' + cls : ''}" aria-hidden="true"><use href="#i-${name}"/></svg>`;

  function clock(secs) {
    const s = Math.max(0, Math.ceil(secs));
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  }

  // 45 → "45s", 120 → "2 min"
  function duration(secs, html) {
    const inMinutes = secs >= 60 && secs % 60 === 0;
    const n = inMinutes ? secs / 60 : secs;
    const text = t(inMinutes ? 'minShort' : 'secShort', { n: html ? num(n) : n });
    return html ? `<span>${text}</span>` : text; // one unit, so flex gaps don't split "45" from "s"
  }

  /* ---------- Training plans ---------- */
  function planFor(ex, level) {
    const who = state.gender || 'all';
    const base = DATA.PLANS[ex.type][who][level || ex.level];
    const plan = { type: ex.type, sets: base.sets, rest: base.rest, perSide: Boolean(ex.perSide) };
    if (ex.type === 'time') plan.secs = base.secs;
    else plan.reps = (ex.reps && (ex.reps[who] || ex.reps.all)) || base.reps;
    return plan;
  }

  const target = (plan, html) => (plan.type === 'time' ? duration(plan.secs, html) : (html ? num(plan.reps) : plan.reps));

  // "3 × 12–15 per side"
  function planLine(plan) {
    const side = plan.perSide ? ` <span class="per-side">${esc(t('perSide'))}</span>` : '';
    return `<span class="plan-line">${num(plan.sets)} × ${target(plan, true)}${side}</span>`;
  }

  const exercisesOf = (w) => w.exercises.map((id) => exerciseById.get(id)).filter(Boolean);

  // Rough session length: work time plus rest for every set.
  function minutesOf(w) {
    let secs = 0;
    exercisesOf(w).forEach((ex) => {
      const plan = planFor(ex, w.level);
      const work = (plan.type === 'time' ? plan.secs : 40) * (plan.perSide ? 2 : 1);
      secs += plan.sets * (work + plan.rest);
    });
    return Math.max(5, Math.round(secs / 60));
  }

  const musclesOf = (w) => Array.from(new Set(exercisesOf(w).map((ex) => ex.muscle)));

  /* ---------- Search ---------- */
  function normalize(text) {
    return String(text)
      .toLowerCase()
      .replace(/[ً-ٰٟـ]/g, '') // Arabic diacritics and tatweel
      .replace(/[أإآٱ]/g, 'ا')
      .replace(/ى/g, 'ي')
      .replace(/ة/g, 'ه')
      .replace(/[-_.,·&]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  const bilingual = (group, key) => `${STRINGS.en[group][key]} ${STRINGS.ar[group][key]}`;

  function buildIndex(parts) {
    const text = normalize(parts.join(' '));
    return `${text} ${text.replace(/ /g, '')}`; // lets "pushup" match "push-up"
  }

  const exerciseIndex = new Map(DATA.EXERCISES.map((ex) => [ex.id, buildIndex([
    ex.name.en, ex.name.ar,
    bilingual('muscles', ex.muscle),
    bilingual('levels', ex.level),
    ...ex.location.map((p) => bilingual('places', p)),
    ...ex.equipment.map((k) => bilingual('equipment', k)),
  ])]));

  const workoutIndex = new Map(DATA.WORKOUTS.map((w) => [w.id, buildIndex([
    w.name.en, w.name.ar, w.desc.en, w.desc.ar,
    bilingual('places', w.location),
    bilingual('levels', w.level),
    ...exercisesOf(w).flatMap((ex) => [ex.name.en, ex.name.ar, bilingual('muscles', ex.muscle)]),
  ])]));

  const matches = (index, query) => !query || query.split(' ').every((word) => index.includes(word));

  /* ---------- Filtering ---------- */
  function muscleOrder() {
    const focus = state.gender ? DATA.FOCUS[state.gender] : [];
    return focus.concat(DATA.MUSCLES.filter((m) => !focus.includes(m)));
  }

  function sortByFocus(list) {
    const order = muscleOrder();
    return list
      .map((ex, i) => ({ ex, i }))
      .sort((a, b) => order.indexOf(a.ex.muscle) - order.indexOf(b.ex.muscle) || a.i - b.i)
      .map((entry) => entry.ex);
  }

  function filteredExercises() {
    const query = normalize(state.query);
    return sortByFocus(DATA.EXERCISES.filter((ex) =>
      (!state.muscles.size || state.muscles.has(ex.muscle)) &&
      (!state.place || ex.location.includes(state.place)) &&
      (!state.levels.size || state.levels.has(ex.level)) &&
      matches(exerciseIndex.get(ex.id), query)));
  }

  function filteredWorkouts() {
    const query = normalize(state.query);
    const list = DATA.WORKOUTS.filter((w) =>
      (!state.gender || w.gender === 'all' || w.gender === state.gender) &&
      (!state.muscles.size || musclesOf(w).some((m) => state.muscles.has(m))) &&
      (!state.place || w.location === state.place) &&
      (!state.levels.size || state.levels.has(w.level)) &&
      matches(workoutIndex.get(w.id), query));
    // Gender-specific workouts first when a gender is selected.
    return state.gender ? list.sort((a, b) => (b.gender === state.gender) - (a.gender === state.gender)) : list;
  }

  function activeFilterCount() {
    return state.muscles.size + state.levels.size + (state.place ? 1 : 0) + (state.gender ? 1 : 0) + (state.query.trim() ? 1 : 0);
  }

  function isActive(kind, value) {
    if (kind === 'muscle') return state.muscles.has(value);
    if (kind === 'level') return state.levels.has(value);
    if (kind === 'place') return state.place === value;
    if (kind === 'gender') return state.gender === value;
    return false;
  }

  function toggleSet(set, value) {
    if (set.has(value)) set.delete(value);
    else set.add(value);
  }

  function setGender(value) {
    state.gender = value;
    store.set('gender', value);
  }

  function toggleFilter(kind, value) {
    if (kind === 'muscle') toggleSet(state.muscles, value);
    else if (kind === 'level') toggleSet(state.levels, value);
    else if (kind === 'place') state.place = state.place === value ? null : value;
    else if (kind === 'gender') setGender(state.gender === value ? null : value);
    syncChips();
    announce(summaryText(renderExplore()));
  }

  function clearFilters(trigger) {
    state.muscles.clear();
    state.levels.clear();
    state.place = null;
    state.query = '';
    els.search.value = '';
    setGender(null);
    syncChips();
    announce(summaryText(renderExplore()));
    if (trigger && trigger.closest('[hidden]')) els.search.focus();
  }

  const summaryText = (counts) => t('resultsSummary', {
    exercises: tp('exercises', counts.exercises),
    workouts: tp('workouts', counts.workouts),
  });

  /* ---------- Building blocks ---------- */
  const muscleTag = (m) => `<span class="tag" data-muscle="${m}">${esc(t('muscles.' + m))}</span>`;

  function levelBadge(level) {
    const n = DATA.LEVELS.indexOf(level) + 1;
    return `<span class="level" data-level="${n}"><span class="level__bars" aria-hidden="true"><i></i><i></i><i></i></span>${esc(t('levels.' + level))}</span>`;
  }

  function places(list) {
    const items = list.map((p) => `<span class="where__item">${icon(p === 'home' ? 'home' : 'dumbbell')}${esc(t('places.' + p))}</span>`);
    return `<span class="where">${items.join('')}</span>`;
  }

  // Image slot: shows the item's photo when `image` is set, otherwise a styled placeholder.
  function media(item, word, variant, dots) {
    const img = item.image ? `<img src="${esc(item.image)}" alt="" loading="lazy" decoding="async">` : '';
    const tint = item.muscle ? ` data-muscle="${item.muscle}"` : '';
    const dotRow = dots ? `<span class="media__dots">${dots.map((m) => `<i data-muscle="${m}"></i>`).join('')}</span>` : '';
    return `<div class="media media--${variant}"${tint} aria-hidden="true"><span class="media__word">${word}</span>${dotRow}${img}</div>`;
  }

  function favButton(kind, id, name, variant) {
    const on = state.favs[kind].has(id);
    const label = t(on ? 'removeFav' : 'addFav', { name });
    return `<button type="button" class="fav ${variant}" data-action="toggle-fav" data-kind="${kind}" data-id="${id}" data-on="${on}" aria-label="${esc(label)}">${icon('heart')}</button>`;
  }

  function exerciseCard(ex) {
    const name = L(ex.name);
    const plan = planFor(ex);
    return `
      <article class="card" data-muscle="${ex.muscle}">
        ${media(ex, esc(t('muscles.' + ex.muscle)), 'exercise')}
        <div class="card__body">
          <div class="card__tags">${muscleTag(ex.muscle)}${levelBadge(ex.level)}</div>
          <h3 class="card__title"><button type="button" class="card__open" data-action="open-exercise" data-id="${ex.id}">${esc(name)}</button></h3>
          <p class="card__plan">${planLine(plan)}<span class="card__rest">${icon('clock')}${duration(plan.rest, true)}</span></p>
          ${places(ex.location)}
        </div>
        ${favButton('exercise', ex.id, name, 'fav--card')}
      </article>`;
  }

  function workoutCard(w) {
    const name = L(w.name);
    const gender = w.gender !== 'all' ? `<span class="tag tag--gender">${esc(t('forGender.' + w.gender))}</span>` : '';
    return `
      <article class="card card--workout">
        ${media(w, tp('minutes', minutesOf(w), true), 'workout', musclesOf(w))}
        <div class="card__body">
          <div class="card__tags">${levelBadge(w.level)}${gender}</div>
          <h3 class="card__title"><button type="button" class="card__open" data-action="open-workout" data-id="${w.id}">${esc(name)}</button></h3>
          <p class="card__desc">${esc(L(w.desc))}</p>
          <p class="card__meta">${places([w.location])}<span class="where__item">${icon('layers')}${tp('exercises', w.exercises.length, true)}</span></p>
        </div>
        ${favButton('workout', w.id, name, 'fav--card')}
      </article>`;
  }

  function clockMarkup(size, label) {
    return `
      <div class="clock clock--${size}" data-clock>
        <svg class="clock__ring" viewBox="0 0 120 120" aria-hidden="true">
          <circle class="clock__track" cx="60" cy="60" r="52"/>
          <circle class="clock__bar" cx="60" cy="60" r="52"/>
        </svg>
        <div class="clock__face">
          <span class="clock__time num" data-clock-time role="timer">${clock(Timer.snapshot().remaining)}</span>
          <span class="clock__status">${esc(label)}</span>
        </div>
      </div>`;
  }

  /* ---------- Explore ---------- */
  function renderFilters() {
    const labels = { muscle: 'filterMuscle', place: 'filterPlace', level: 'filterLevel', gender: 'filterGender' };
    const chip = (kind, value, label, lead) =>
      `<button type="button" class="chip" data-action="filter" data-kind="${kind}" data-value="${value}" aria-pressed="false">${lead || ''}${esc(label)}</button>`;
    const row = (kind, chips) => `
      <div class="filter-row" role="group" aria-labelledby="filter-${kind}">
        <span class="filter-row__label" id="filter-${kind}">${esc(t(labels[kind]))}</span>
        <div class="chips">${chips.join('')}</div>
      </div>`;

    els.filters.innerHTML = [
      row('muscle', DATA.MUSCLES.map((m) => chip('muscle', m, t('muscles.' + m), `<span class="chip__dot" data-muscle="${m}"></span>`))),
      row('place', DATA.LOCATIONS.map((p) => chip('place', p, t('places.' + p), icon(p === 'home' ? 'home' : 'dumbbell')))),
      row('level', DATA.LEVELS.map((l) => chip('level', l, t('levels.' + l)))),
      row('gender', DATA.GENDERS.map((g) => chip('gender', g, t('genders.' + g)))),
    ].join('');
    syncChips();
  }

  function syncChips() {
    $$('.chip[data-action="filter"]', els.filters).forEach((chip) => {
      chip.setAttribute('aria-pressed', String(isActive(chip.dataset.kind, chip.dataset.value)));
    });
  }

  function renderExplore() {
    const workouts = filteredWorkouts();
    const exercises = filteredExercises();

    els.workoutsTitle.textContent = state.gender ? t('workoutsFor.' + state.gender) : t('workoutsTitle');
    els.workoutCount.innerHTML = tp('workouts', workouts.length, true);
    els.workoutList.innerHTML = workouts.map(workoutCard).join('');
    els.workoutSection.hidden = workouts.length === 0;

    els.exerciseCount.innerHTML = tp('exercises', exercises.length, true);
    els.exerciseGrid.innerHTML = exercises.map(exerciseCard).join('');
    els.exerciseSection.hidden = exercises.length === 0;

    els.exploreEmpty.hidden = workouts.length + exercises.length > 0;
    els.resultCount.innerHTML = t('resultsSummary', {
      exercises: tp('exercises', exercises.length, true),
      workouts: tp('workouts', workouts.length, true),
    });

    const active = activeFilterCount();
    els.clearBtn.hidden = active === 0;
    els.clearBtn.textContent = t('clearAllCount', { n: active });

    els.notice.hidden = !state.gender;
    els.noticeText.textContent = state.gender ? t('tailored.' + state.gender) : '';

    return { exercises: exercises.length, workouts: workouts.length };
  }

  /* ---------- Favorites ---------- */
  function renderFavorites() {
    const workouts = DATA.WORKOUTS.filter((w) => state.favs.workout.has(w.id));
    const exercises = sortByFocus(DATA.EXERCISES.filter((ex) => state.favs.exercise.has(ex.id)));

    els.favWorkoutList.innerHTML = workouts.map(workoutCard).join('');
    els.favWorkoutCount.innerHTML = tp('workouts', workouts.length, true);
    els.favWorkoutSection.hidden = workouts.length === 0;

    els.favExerciseGrid.innerHTML = exercises.map(exerciseCard).join('');
    els.favExerciseCount.innerHTML = tp('exercises', exercises.length, true);
    els.favExerciseSection.hidden = exercises.length === 0;

    els.favEmpty.hidden = workouts.length + exercises.length > 0;
  }

  function updateFavBadge() {
    const count = state.favs.exercise.size + state.favs.workout.size;
    els.favBadge.hidden = count === 0;
    els.favBadge.textContent = count > 99 ? '99+' : String(count);
  }

  function toggleFav(kind, id) {
    const set = state.favs[kind];
    const added = !set.has(id);
    if (added) set.add(id);
    else set.delete(id);
    store.set(kind === 'exercise' ? 'favExercises' : 'favWorkouts', Array.from(set));

    const item = kind === 'exercise' ? exerciseById.get(id) : workoutById.get(id);
    const label = t(added ? 'removeFav' : 'addFav', { name: L(item.name) });
    $$(`.fav[data-kind="${kind}"][data-id="${id}"]`).forEach((btn) => {
      btn.dataset.on = String(added);
      btn.setAttribute('aria-label', label);
      btn.classList.remove('is-popping');
      if (added) {
        void btn.offsetWidth; // restart the animation
        btn.classList.add('is-popping');
      }
    });

    updateFavBadge();
    toast(t(added ? 'favAdded' : 'favRemoved'));

    if (state.view === 'favorites') {
      const focused = document.activeElement;
      renderFavorites();
      if (!els.sheet.open) refocus(focused);
    }
  }

  /* ---------- Timer view ---------- */
  function renderPresets() {
    els.presetList.innerHTML = PRESETS.map((secs) =>
      `<button type="button" class="chip chip--preset" data-action="timer-preset" data-secs="${secs}" aria-pressed="false">${duration(secs, true)}</button>`).join('');
  }

  let flashing = false;
  let flashTimer = null;

  // Updates every element that shows the shared countdown.
  function syncTimerUI() {
    const s = Timer.snapshot();
    const running = s.status === 'running';
    const counting = running || s.status === 'paused';
    const time = clock(s.status === 'idle' ? s.duration : s.remaining);
    const progress = s.status === 'idle' ? 1 : (s.duration ? s.remaining / s.duration : 0);
    const offset = `${(RING * (1 - progress)).toFixed(2)}px`;

    $$('.clock__bar').forEach((bar) => { bar.style.strokeDashoffset = offset; });
    $$('[data-clock-time]').forEach((el) => { el.textContent = time; });
    $$('[data-clock-status]').forEach((el) => { el.textContent = t('timerStatus.' + s.status); });
    $$('[data-clock]').forEach((el) => { el.dataset.status = s.status; });

    $$('[data-action="timer-toggle"]').forEach((btn) => {
      if (btn.dataset.state === s.status) return;
      btn.dataset.state = s.status;
      const label = t(running ? 'pause' : s.status === 'paused' ? 'resume' : 'start');
      if ('compact' in btn.dataset) {
        btn.setAttribute('aria-label', label);
        btn.innerHTML = icon(running ? 'pause' : 'play');
      } else {
        btn.innerHTML = `${icon(running ? 'pause' : 'play')}<span>${esc(label)}</span>`;
      }
    });

    $$('[data-action="timer-preset"]').forEach((btn) => {
      btn.setAttribute('aria-pressed', String(Number(btn.dataset.secs) === s.duration));
    });

    $$('[data-action="sheet-timer"]').forEach((btn) => {
      const label = running ? t('restingBtn', { time })
        : s.status === 'paused' ? t('pausedBtn', { time })
          : t('startRest', { time: duration(Number(btn.dataset.secs)) });
      btn.querySelector('span').textContent = label;
      btn.dataset.status = s.status;
    });

    els.miniTimer.hidden = !(counting || flashing) || state.view === 'timer' || player.active;
    els.miniTimer.dataset.status = s.status;
    els.miniTimerTime.textContent = time;
    els.miniTimer.setAttribute('aria-label', t('miniTimerLabel', { time }));

    document.title = counting ? `${time} · Gymmy` : 'Gymmy';
  }

  function onTimerEnd() {
    flashing = true;
    document.body.classList.add('is-flashing');
    clearTimeout(flashTimer);
    flashTimer = setTimeout(() => {
      flashing = false;
      document.body.classList.remove('is-flashing');
      syncTimerUI();
    }, 3000);

    if (player.active) {
      playerTimerEnded();
    } else {
      toast(t('restOver'));
    }
  }

  /* ---------- Detail sheet (exercise / workout) ---------- */
  let sheetReturnFocus = null;

  function sheetBar(start, end) {
    return `
      <div class="sheet__bar">
        <div class="sheet__bar-group">${start}</div>
        <div class="sheet__bar-group">${end}<button type="button" class="float-btn" data-action="sheet-close" aria-label="${esc(t('close'))}">${icon('close')}</button></div>
      </div>`;
  }

  function whoNote() {
    return state.gender
      ? `<p class="who who--on">${icon('spark')}<span>${esc(t('tailoredFor.' + state.gender))}</span></p>`
      : `<p class="who">${icon('spark')}<span>${esc(t('tailorHint'))}</span></p>`;
  }

  function exerciseDetail(ex, fromId) {
    const from = fromId ? workoutById.get(fromId) : null;
    const plan = planFor(ex, from ? from.level : ex.level);
    const name = L(ex.name);
    const list = (items, kind, iconName) =>
      `<ul class="list list--${kind}">${items.map((text) => `<li>${icon(iconName)}<span>${esc(text)}</span></li>`).join('')}</ul>`;
    const back = from
      ? `<button type="button" class="float-btn" data-action="sheet-back" aria-label="${esc(t('back'))}">${icon('back', 'i--flip')}</button>`
      : '';

    return `
      ${sheetBar(back, favButton('exercise', ex.id, name, 'float-btn'))}
      ${media(ex, esc(t('muscles.' + ex.muscle)), 'exercise media--lg')}
      <div class="sheet__body">
        <div class="card__tags">${muscleTag(ex.muscle)}${levelBadge(ex.level)}${places(ex.location)}</div>
        <h2 class="sheet__title" id="sheetTitle" tabindex="-1">${esc(name)}</h2>
        <div class="plan">
          <div class="plan__item">
            <span class="plan__label">${esc(t('sets'))}</span>
            <span class="plan__value">${num(plan.sets)}</span>
          </div>
          <div class="plan__item">
            <span class="plan__label">${esc(t(plan.type === 'time' ? 'time' : 'reps'))}</span>
            <span class="plan__value">${target(plan, true)}</span>
            ${plan.perSide ? `<span class="plan__note">${esc(t('perSide'))}</span>` : ''}
          </div>
          <div class="plan__item">
            <span class="plan__label">${esc(t('rest'))}</span>
            <span class="plan__value">${duration(plan.rest, true)}</span>
          </div>
        </div>
        ${whoNote()}
        <button type="button" class="btn btn--primary btn--lg btn--block" data-action="sheet-timer" data-secs="${plan.rest}">${icon('timer')}<span></span></button>
        <section class="block">
          <h3 class="block__title">${esc(t('equipmentTitle'))}</h3>
          <ul class="pills">${ex.equipment.map((k) => `<li class="pill">${esc(t('equipment.' + k))}</li>`).join('')}</ul>
        </section>
        <section class="block">
          <h3 class="block__title">${esc(t('howTo'))}</h3>
          <ol class="steps">${L(ex.steps).map((step) => `<li>${esc(step)}</li>`).join('')}</ol>
        </section>
        <section class="block">
          <h3 class="block__title">${esc(t('tips'))}</h3>
          ${list(L(ex.tips), 'tips', 'check')}
        </section>
        <section class="block">
          <h3 class="block__title">${esc(t('mistakes'))}</h3>
          ${list(L(ex.mistakes), 'mistakes', 'alert')}
        </section>
      </div>`;
  }

  function workoutDetail(w) {
    const name = L(w.name);
    const items = exercisesOf(w);
    const gender = w.gender !== 'all' ? `<span class="tag tag--gender">${esc(t('forGender.' + w.gender))}</span>` : '';
    const rows = items.map((ex, i) => {
      const plan = planFor(ex, w.level);
      return `
        <li>
          <button type="button" class="wlist__item" data-action="open-exercise" data-id="${ex.id}" data-from="${w.id}">
            <span class="wlist__num">${num(i + 1)}</span>
            <span class="wlist__main">
              <span class="wlist__name">${esc(L(ex.name))}</span>
              <span class="wlist__plan">${planLine(plan)}<span class="card__rest">${icon('clock')}${duration(plan.rest, true)}</span></span>
            </span>
            ${muscleTag(ex.muscle)}
            ${icon('next', 'i--flip wlist__chev')}
          </button>
        </li>`;
    }).join('');

    return `
      ${sheetBar('', favButton('workout', w.id, name, 'float-btn'))}
      ${media(w, tp('minutes', minutesOf(w), true), 'workout media--lg', musclesOf(w))}
      <div class="sheet__body">
        <div class="card__tags">${levelBadge(w.level)}${places([w.location])}${gender}</div>
        <h2 class="sheet__title" id="sheetTitle" tabindex="-1">${esc(name)}</h2>
        <p class="sheet__lead">${esc(L(w.desc))}</p>
        ${whoNote()}
        <button type="button" class="btn btn--primary btn--lg btn--block" data-action="start-workout" data-id="${w.id}">${icon('play')}<span>${esc(t('startWorkout'))}</span></button>
        <section class="block">
          <h3 class="block__title">${esc(t('inThisWorkout'))}<span class="block__count">${tp('exercises', items.length, true)}</span></h3>
          <ol class="wlist">${rows}</ol>
        </section>
      </div>`;
  }

  function renderSheet() {
    const s = state.sheet;
    if (!s) return;
    els.sheetInner.innerHTML = s.type === 'exercise'
      ? exerciseDetail(exerciseById.get(s.id), s.from)
      : workoutDetail(workoutById.get(s.id));
    syncTimerUI();
  }

  function openSheet(next) {
    const wasOpen = els.sheet.open;
    state.sheet = next;
    renderSheet();
    if (!wasOpen) {
      sheetReturnFocus = document.activeElement;
      els.sheet.showModal();
    }
    els.sheet.scrollTop = 0;
    const title = $('#sheetTitle', els.sheet);
    if (title) title.focus({ preventScroll: true });
  }

  function closeSheet() {
    if (els.sheet.open) els.sheet.close();
  }

  /* ---------- Workout player ---------- */
  let wakeLock = null;

  async function requestWakeLock() {
    try {
      if ('wakeLock' in navigator) wakeLock = await navigator.wakeLock.request('screen');
    } catch (e) {
      wakeLock = null;
    }
  }

  function releaseWakeLock() {
    if (wakeLock) wakeLock.release().catch(() => {});
    wakeLock = null;
  }

  function startWorkout(id) {
    const w = workoutById.get(id);
    if (!w) return;
    Object.assign(player, {
      active: true,
      workout: w,
      items: exercisesOf(w).map((ex) => ({ ex, plan: planFor(ex, w.level) })),
      idx: 0,
      set: 1,
      phase: 'work',
      startedAt: Date.now(),
      endedAt: 0,
      setsDone: 0,
      confirming: false,
      returnFocus: sheetReturnFocus,
    });
    Timer.unlockAudio();
    Timer.reset();
    sheetReturnFocus = null;
    closeSheet();
    els.player.showModal();
    renderPlayer();
    requestWakeLock();
  }

  const currentItem = () => player.items[player.idx];
  const isLastExercise = () => player.idx >= player.items.length - 1;
  const isLastSet = () => player.set >= currentItem().plan.sets;

  function nextStep() {
    const item = currentItem();
    if (player.set < item.plan.sets) return { ex: item.ex, set: player.set + 1, sets: item.plan.sets };
    const next = player.items[player.idx + 1];
    return { ex: next.ex, set: 1, sets: next.plan.sets };
  }

  function completeSet() {
    player.setsDone += 1;
    if (isLastSet() && isLastExercise()) {
      finishWorkout();
      return;
    }
    const rest = currentItem().plan.rest;
    player.phase = 'rest';
    Timer.start(rest);
    renderPlayer();
    announce(`${t('restLabel')} ${duration(rest)}`);
  }

  function advance() {
    if (!isLastSet()) {
      player.set += 1;
    } else {
      player.idx += 1;
      player.set = 1;
    }
    player.phase = 'work';
    renderPlayer();
    const item = currentItem();
    announce(`${L(item.ex.name)}. ${t('setOf', { s: player.set, t: item.plan.sets })}`);
  }

  function jump(delta) {
    const idx = player.idx + delta;
    if (idx < 0 || idx >= player.items.length) return;
    Timer.reset();
    player.idx = idx;
    player.set = 1;
    player.phase = 'work';
    renderPlayer();
  }

  function finishWorkout() {
    Timer.reset();
    player.phase = 'done';
    player.endedAt = Date.now();
    renderPlayer();
    announce(t('complete'));
  }

  function playerTimerEnded() {
    if (player.phase === 'timing') completeSet();
    else if (player.phase === 'rest') advance();
  }

  function openConfirm() {
    if (player.phase === 'done') {
      closePlayer();
      return;
    }
    player.wasRunning = Timer.snapshot().status === 'running';
    if (player.wasRunning) Timer.pause();
    player.confirming = true;
    renderPlayer();
  }

  function cancelConfirm() {
    player.confirming = false;
    if (player.wasRunning) Timer.resume();
    renderPlayer();
  }

  function closePlayer() {
    if (els.player.open) els.player.close();
  }

  function playerStage() {
    const item = currentItem();
    const { ex, plan } = item;
    const setOf = t('setOf', { s: num(player.set), t: num(plan.sets) });
    const addBtn = (delta, key) =>
      `<button type="button" class="round-btn" data-action="timer-add" data-delta="${delta}" aria-label="${esc(t(key))}"><span class="num" dir="ltr">${delta > 0 ? '+' : '−'}15</span></button>`;

    if (player.phase === 'done') {
      const secs = Math.round((player.endedAt - player.startedAt) / 1000);
      return {
        stage: `
          <div class="done-badge">${icon('trophy')}</div>
          <h3 class="player__name">${esc(t('complete'))}</h3>
          <p class="player__lead">${esc(t('completeLead'))}</p>
          <dl class="stats">
            <div class="stat"><dt>${esc(t('statTime'))}</dt><dd>${num(clock(secs))}</dd></div>
            <div class="stat"><dt>${esc(t('statExercises'))}</dt><dd>${num(player.items.length)}</dd></div>
            <div class="stat"><dt>${esc(t('statSets'))}</dt><dd>${num(player.setsDone)}</dd></div>
          </dl>`,
        actions: `<button type="button" class="btn btn--primary btn--xl" data-action="player-close" data-autofocus>${icon('check')}<span>${esc(t('done'))}</span></button>`,
      };
    }

    if (player.phase === 'rest') {
      const next = nextStep();
      return {
        stage: `
          ${clockMarkup('lg', t('restLabel'))}
          <div class="upnext">
            <span class="upnext__label">${esc(t('upNext'))}</span>
            <span class="upnext__name">${esc(L(next.ex.name))}</span>
            <span class="upnext__set">${t('setOf', { s: num(next.set), t: num(next.sets) })}</span>
          </div>`,
        actions: `
          ${addBtn(-15, 'sub15Label')}
          <button type="button" class="btn btn--primary btn--xl" data-action="player-skip-rest" data-autofocus>${icon('skip', 'i--flip')}<span>${esc(t('skipRest'))}</span></button>
          ${addBtn(15, 'add15Label')}`,
      };
    }

    if (player.phase === 'timing') {
      return {
        stage: `
          <p class="eyebrow">${setOf}</p>
          <h3 class="player__name">${esc(L(ex.name))}</h3>
          ${clockMarkup('lg', t('holdIt'))}`,
        actions: `
          <button type="button" class="round-btn" data-action="timer-toggle" data-compact aria-label="${esc(t('pause'))}">${icon('pause')}</button>
          <button type="button" class="btn btn--primary btn--xl" data-action="player-skip-timed" data-autofocus>${icon('check')}<span>${esc(t('skipTimed'))}</span></button>`,
      };
    }

    const unit = [plan.type === 'reps' ? t('reps') : '', plan.perSide ? t('perSide') : ''].filter(Boolean).join(' · ');
    const primary = plan.type === 'time'
      ? `<button type="button" class="btn btn--primary btn--xl" data-action="player-start-timed" data-autofocus>${icon('play')}<span>${esc(t('startTimed', { time: duration(plan.secs) }))}</span></button>`
      : `<button type="button" class="btn btn--primary btn--xl" data-action="player-done-set" data-autofocus>${icon('check')}<span>${esc(t(isLastSet() && isLastExercise() ? 'finishWorkout' : 'doneSet'))}</span></button>`;

    return {
      stage: `
        ${media(ex, esc(t('muscles.' + ex.muscle)), 'exercise media--player')}
        <p class="eyebrow">${setOf}</p>
        <h3 class="player__name">${esc(L(ex.name))}</h3>
        <p class="target"><span class="target__value">${target(plan, true)}</span>${unit ? `<span class="target__unit">${esc(unit)}</span>` : ''}</p>
        <details class="howto">
          <summary>${esc(t('howTo'))}${icon('next', 'howto__chev')}</summary>
          <ol class="steps">${L(ex.steps).map((step) => `<li>${esc(step)}</li>`).join('')}</ol>
        </details>`,
      actions: `
        <button type="button" class="round-btn" data-action="player-prev" aria-label="${esc(t('prevExercise'))}"${player.idx === 0 ? ' disabled' : ''}>${icon('prev', 'i--flip')}</button>
        ${primary}
        <button type="button" class="round-btn" data-action="player-next" aria-label="${esc(t('nextExercise'))}"${isLastExercise() ? ' disabled' : ''}>${icon('next', 'i--flip')}</button>`,
    };
  }

  function renderPlayer() {
    if (!player.active) return;
    const item = currentItem();
    const total = player.items.length;
    const ratio = player.phase === 'done' ? 1 : (player.idx + (player.set - 1) / item.plan.sets) / total;
    const { stage, actions } = playerStage();
    const inert = player.confirming ? ' inert' : '';

    els.playerInner.innerHTML = `
      <div class="player__top"${inert}>
        <button type="button" class="float-btn" data-action="player-end" aria-label="${esc(t('endWorkout'))}">${icon('close')}</button>
        <div class="player__heading">
          <h2 class="player__title" id="playerTitle">${esc(L(player.workout.name))}</h2>
          <p class="player__sub">${player.phase === 'done' ? '' : t('exerciseOf', { i: num(player.idx + 1), n: num(total) })}</p>
        </div>
      </div>
      <div class="progress" aria-hidden="true"><span class="progress__bar" style="--p: ${(ratio * 100).toFixed(1)}%"></span></div>
      <div class="player__stage"${inert}>${stage}</div>
      <div class="player__actions"${inert}>${actions}</div>
      ${player.confirming ? `
        <div class="confirm" role="alertdialog" aria-modal="true" aria-labelledby="confirmTitle" aria-describedby="confirmText">
          <div class="confirm__box">
            <h3 class="confirm__title" id="confirmTitle">${esc(t('endConfirm'))}</h3>
            <p class="confirm__text" id="confirmText">${esc(t('endConfirmHint'))}</p>
            <div class="confirm__actions">
              <button type="button" class="btn btn--ghost" data-action="player-cancel-end" data-autofocus>${esc(t('keepGoing'))}</button>
              <button type="button" class="btn btn--dark" data-action="player-close">${esc(t('end'))}</button>
            </div>
          </div>
        </div>` : ''}`;

    syncTimerUI();
    const scope = player.confirming ? $('.confirm', els.playerInner) : els.playerInner;
    const focusTarget = $('[data-autofocus]', scope);
    if (focusTarget) focusTarget.focus({ preventScroll: true });
  }

  /* ---------- Feedback ---------- */
  // Toasts and announcements move into an open dialog so they stay visible and audible.
  function overlayHost() {
    const open = $$('dialog[open]');
    return open.length ? open[open.length - 1] : document.body;
  }

  let toastTimer = null;
  function toast(message) {
    const host = overlayHost();
    if (els.toast.parentNode !== host) host.appendChild(els.toast);
    els.toast.textContent = message;
    els.toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => els.toast.classList.remove('is-visible'), 2400);
  }

  function announce(message) {
    const host = overlayHost();
    if (els.announcer.parentNode !== host) host.appendChild(els.announcer);
    els.announcer.textContent = '';
    setTimeout(() => { els.announcer.textContent = message; }, 60);
  }

  // Put focus back on an element, or its re-rendered twin, or the view heading.
  function refocus(el) {
    if (el && el !== document.body && document.contains(el)) {
      el.focus({ preventScroll: true });
      return;
    }
    const view = document.getElementById('view-' + state.view);
    if (el && el.dataset && el.dataset.action && el.dataset.id) {
      const twin = view.querySelector(`[data-action="${el.dataset.action}"][data-id="${el.dataset.id}"]`);
      if (twin) {
        twin.focus({ preventScroll: true });
        return;
      }
    }
    const heading = document.getElementById(state.view + '-title');
    if (heading) heading.focus({ preventScroll: true });
  }

  /* ---------- Views & language ---------- */
  function renderView() {
    if (state.view === 'explore') renderExplore();
    else if (state.view === 'favorites') renderFavorites();
    else if (extensionViews[state.view]) extensionViews[state.view]();
  }

  function route(fromUser) {
    const name = location.hash.replace('#', '');
    if (name && !VIEWS.includes(name)) return; // e.g. the skip link's #main
    state.view = name || 'explore';
    VIEWS.forEach((v) => { document.getElementById('view-' + v).hidden = v !== state.view; });
    $$('.tab').forEach((tab) => {
      if (tab.dataset.view === state.view) tab.setAttribute('aria-current', 'page');
      else tab.removeAttribute('aria-current');
    });
    renderView();
    syncTimerUI();
    if (fromUser) {
      window.scrollTo(0, 0);
      const heading = document.getElementById(state.view + '-title');
      if (heading) heading.focus({ preventScroll: true });
    }
  }

  function applyLanguage() {
    const root = document.documentElement;
    root.lang = state.lang;
    root.dir = dict().dir;
    plural = new Intl.PluralRules(state.lang);

    $$('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
    $$('[data-i18n-placeholder]').forEach((el) => { el.placeholder = t(el.dataset.i18nPlaceholder); });
    $$('[data-i18n-label]').forEach((el) => { el.setAttribute('aria-label', t(el.dataset.i18nLabel)); });

    const other = state.lang === 'ar' ? 'en' : 'ar';
    els.langBtnText.textContent = STRINGS[other].langName;
    els.langBtnText.lang = other;
    els.langBtn.setAttribute('aria-label', t('switchLang'));
    $$('[data-action="timer-toggle"]').forEach((btn) => { delete btn.dataset.state; });
  }

  function setLanguage(lang) {
    state.lang = lang;
    store.set('lang', lang);
    applyLanguage();
    renderFilters();
    renderPresets();
    renderView();
    if (state.sheet) renderSheet();
    if (player.active) renderPlayer();
    languageHooks.forEach((hook) => hook());
    syncTimerUI();
  }

  /* ---------- Events ---------- */
  const actions = {
    lang: () => setLanguage(state.lang === 'ar' ? 'en' : 'ar'),
    filter: (el) => toggleFilter(el.dataset.kind, el.dataset.value),
    'clear-filters': (el) => clearFilters(el),
    'open-exercise': (el) => openSheet({ type: 'exercise', id: el.dataset.id, from: el.dataset.from || null }),
    'open-workout': (el) => openSheet({ type: 'workout', id: el.dataset.id }),
    'toggle-fav': (el) => toggleFav(el.dataset.kind, el.dataset.id),
    'sheet-close': closeSheet,
    'sheet-back': () => openSheet({ type: 'workout', id: state.sheet.from }),
    'sheet-timer': (el) => {
      const status = Timer.snapshot().status;
      if (status === 'running') Timer.pause();
      else if (status === 'paused') Timer.resume();
      else Timer.start(Number(el.dataset.secs));
    },
    'start-workout': (el) => startWorkout(el.dataset.id),
    'timer-toggle': () => Timer.toggle(),
    'timer-reset': () => Timer.reset(),
    'timer-preset': (el) => Timer.start(Number(el.dataset.secs)),
    'timer-add': (el) => Timer.add(Number(el.dataset.delta)),
    'mini-timer': () => { location.hash = 'timer'; },
    'player-done-set': completeSet,
    'player-start-timed': () => {
      player.phase = 'timing';
      Timer.start(currentItem().plan.secs);
      renderPlayer();
    },
    'player-skip-timed': () => {
      Timer.reset();
      completeSet();
    },
    'player-skip-rest': () => {
      Timer.reset();
      advance();
    },
    'player-prev': () => jump(-1),
    'player-next': () => jump(1),
    'player-end': openConfirm,
    'player-cancel-end': cancelConfirm,
    'player-close': closePlayer,
  };

  function bindEvents() {
    document.addEventListener('click', (e) => {
      const el = e.target.closest('[data-action]');
      if (!el || el.disabled) return;
      const handler = actions[el.dataset.action];
      if (handler) handler(el, e);
    });

    let searchTimer = null;
    els.search.addEventListener('input', () => {
      state.query = els.search.value;
      const counts = renderExplore();
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => announce(summaryText(counts)), 600);
    });

    window.addEventListener('hashchange', () => route(true));

    // Sheet: close on backdrop click; clean up however it closes (Esc, button, backdrop).
    els.sheet.addEventListener('click', (e) => {
      if (e.target === els.sheet) closeSheet();
    });
    els.sheet.addEventListener('close', () => {
      state.sheet = null;
      els.sheetInner.innerHTML = '';
      if (!player.active) refocus(sheetReturnFocus);
      sheetReturnFocus = null;
      syncTimerUI();
    });

    // Player: Esc asks before ending a workout in progress.
    els.player.addEventListener('cancel', (e) => {
      e.preventDefault();
      if (player.confirming) cancelConfirm();
      else openConfirm();
    });
    els.player.addEventListener('close', () => {
      const returnTo = player.returnFocus;
      player.active = false;
      player.confirming = false;
      player.returnFocus = null;
      Timer.reset();
      releaseWakeLock();
      els.playerInner.innerHTML = '';
      refocus(returnTo);
      syncTimerUI();
    });

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && player.active) requestWakeLock();
    });

    // A missing photo falls back to the placeholder behind it.
    document.addEventListener('error', (e) => {
      const el = e.target;
      if (el instanceof HTMLImageElement && el.closest('.media')) el.remove();
    }, true);

    Timer.subscribe((s) => {
      if (s.type === 'end') onTimerEnd();
      syncTimerUI();
    });
  }

  function registerServiceWorker() {
    try {
      if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
        navigator.serviceWorker.register('sw.js').catch(() => {});
      }
    } catch (e) { /* service workers unavailable here */ }
  }

  /* ---------- Extensions ---------- */
  // Other scripts (js/shop.js) add views, click actions and a language hook through this API.
  const extensionViews = {};
  const languageHooks = [];
  let started = false;

  window.GymmyApp = {
    t, tp, L, esc, num, icon, toast, announce, refocus,
    storage: store,
    get view() { return state.view; },
    register({ views = {}, actions: extraActions = {}, onLanguage } = {}) {
      Object.entries(views).forEach(([name, render]) => {
        if (!VIEWS.includes(name)) VIEWS.push(name);
        extensionViews[name] = render;
      });
      Object.assign(actions, extraActions);
      if (onLanguage) languageHooks.push(onLanguage);
      if (started) route(false); // the page may have opened on one of the new views
    },
  };

  /* ---------- Start ---------- */
  applyLanguage();
  renderFilters();
  renderPresets();
  updateFavBadge();
  bindEvents();
  route(false);
  started = true;
  window.addEventListener('load', registerServiceWorker);
})();
