/* AttriFlow demo — one AI song, from idea to paycheck.
   Plain script (no modules) so it also opens straight from disk. */
(function () {
  'use strict';

  // ---------- story data (all made up) ----------
  var SONG = {
    id: 'main',
    title: 'Midnight Lemonade',
    prompt: 'a happy folk song with fingerpicked guitar, a dancing beat, sparkly synths and a female voice',
    tags: ['Folk', 'Dance', 'Happy'],
    art: 'lemon',
    cover: 'linear-gradient(135deg,#ff3d7f,#ffb347)'
  };
  var PLAYS = 250000;
  var CENTS_PER_PLAY = 0.4;
  var CREATOR_PERCENT = 80;

  var INFLUENCES = [
    { id: 'mara', song: 'Sunny Days', artist: 'Mara Vale', hi: 'Mara', pct: 40,
      writer: 'Mara Vale', writerCo: 'Brightleaf Songs', owner: 'Lighthouse Lane Records',
      art: 'sun', cover: 'linear-gradient(135deg,#ffd166,#ff8a3c)' },
    { id: 'puddles', song: 'Blue Window', artist: 'The Velvet Puddles', hi: 'Velvet Puddles', pct: 30,
      writer: 'Nina Ortiz', writerCo: 'Northstar Songs', owner: 'Tidewater Tunes',
      art: 'window', cover: 'linear-gradient(135deg,#4f7cff,#7fd3ff)' },
    { id: 'rico', song: 'Paper Moon', artist: 'Rico Sands', hi: 'Rico', pct: 20,
      writer: 'Rico Sands', writerCo: 'Copper Kite Music', owner: 'Sundial Sound',
      art: 'moon', cover: 'linear-gradient(135deg,#3a2f6b,#9b7bff)' },
    { id: 'juno', song: 'Late Bus', artist: 'Juno Wilder', hi: 'Juno', pct: 10,
      writer: 'Juno Wilder', writerCo: 'Maple Lane Songs', owner: 'Juno Wilder',
      art: 'bus', cover: 'linear-gradient(135deg,#1fb58f,#c6f36b)' }
  ];

  var STEPS = [
    { id: 'make', label: 'Make', sub: 'SongSpark' },
    { id: 'release', label: 'Release', sub: 'DropTune' },
    { id: 'listen', label: 'Listen', sub: 'Streamy' },
    { id: 'earn', label: 'Earn', sub: 'DropTune' },
    { id: 'share', label: 'Share', sub: 'Sharing Pool' }
  ];

  // ---------- state ----------
  var KEY = 'song-journey-v1';
  var DEFAULTS = { made: false, released: false, listened: false, name: 'Sam Rivera' };
  var state = load();

  function load() {
    try {
      var s = JSON.parse(localStorage.getItem(KEY));
      if (s && typeof s === 'object') return Object.assign({}, DEFAULTS, s);
    } catch (e) { /* storage blocked: start fresh */ }
    return Object.assign({}, DEFAULTS);
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
  }

  // ---------- money (in cents, always computed) ----------
  function money() {
    var total = Math.round(PLAYS * CENTS_PER_PLAY);
    var you = Math.round(total * CREATOR_PERCENT / 100);
    var pool = total - you;
    var left = pool;
    var rows = INFLUENCES.map(function (x, i) {
      var amt = i === INFLUENCES.length - 1 ? left : Math.round(pool * x.pct / 100);
      left -= amt;
      var write = Math.round(amt / 2);
      return Object.assign({}, x, { amt: amt, write: write, rec: amt - write });
    });
    var counted = you + rows.reduce(function (s, r) { return s + r.write + r.rec; }, 0);
    return { total: total, you: you, pool: pool, rows: rows, counted: counted };
  }
  function usd(c) {
    var d = c / 100;
    return c % 100 === 0
      ? '$' + d.toLocaleString('en-US')
      : '$' + d.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
    });
  }
  function byId(id) { return INFLUENCES.filter(function (x) { return x.id === id; })[0]; }

  // ---------- timing ----------
  var reduceMotion = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var timers = [];
  function later(fn, ms) { timers.push(setTimeout(fn, reduceMotion ? Math.min(ms, 80) : ms)); }
  function clearTimers() { timers.forEach(clearTimeout); timers = []; }

  // ---------- little pictures ----------
  var uid = 0;
  function logo(kind) {
    var id = 'lg' + (++uid);
    var open = '<svg class="logo" viewBox="0 0 32 32" aria-hidden="true">';
    if (kind === 'spark') {
      return open + '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="1" y2="1">' +
        '<stop offset="0" stop-color="#ff3d7f"/><stop offset="1" stop-color="#ff9a3c"/></linearGradient></defs>' +
        '<rect width="32" height="32" rx="8" fill="url(#' + id + ')"/>' +
        '<path d="M16 6l2.6 7.4L26 16l-7.4 2.6L16 26l-2.6-7.4L6 16l7.4-2.6z" fill="#fff"/></svg>';
    }
    if (kind === 'drop') {
      return open + '<rect width="32" height="32" rx="8" fill="#2f5bea"/>' +
        '<g fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M16 7.5v11.5M10.8 12.7L16 7.5l5.2 5.2"/><path d="M8.5 19.5v3a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-3"/></g></svg>';
    }
    if (kind === 'streamy') {
      return open + '<rect width="32" height="32" rx="8" fill="#10b8a6"/>' +
        '<path d="M12.5 9.5v13l10.5-6.5z" fill="#fff"/></svg>';
    }
    return open + '<rect width="32" height="32" rx="8" fill="#7c4ddb"/>' +
      '<g fill="none" stroke="#fff" stroke-width="2.2" stroke-linejoin="round">' +
      '<rect x="7" y="10" width="18" height="13" rx="2.5"/><path d="M8 11.5l8 6 8-6"/></g></svg>';
  }
  var ICON_PLAY = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l10.5-6.5z" fill="currentColor"/></svg>';
  var ICON_PAUSE = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6.5" y="5.5" width="4" height="13" rx="1" fill="currentColor"/><rect x="13.5" y="5.5" width="4" height="13" rx="1" fill="currentColor"/></svg>';

  var ICONS = {
    sparkles: '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M19 3v4M17 5h4M5 17v4M3 19h4"/>',
    rocket: '<path d="M5 15c-1.5 1.3-2 5-2 5s3.7-.5 5-2c.7-.8.7-2.1-.1-2.9a2.2 2.2 0 0 0-2.9-.1z"/><path d="M12 15l-3-3a22 22 0 0 1 2-3.9A12.9 12.9 0 0 1 22 2c0 2.7-.8 7.5-6 11a22.4 22.4 0 0 1-4 2z"/><path d="M9 12H4s.6-3 2-4c1.6-1.1 5 0 5 0M12 15v5s3-.6 4-2c1.1-1.6 0-5 0-5"/>',
    forward: '<path d="M13 19l9-7-9-7z" fill="currentColor"/><path d="M2 19l9-7-9-7z" fill="currentColor"/>',
    check: '<path d="M20 6L9 17l-5-5"/>',
    radio: '<circle cx="12" cy="12" r="2"/><path d="M16.2 7.8a6 6 0 0 1 0 8.4M7.8 16.2a6 6 0 0 1 0-8.4M19 5a10 10 0 0 1 0 14M5 19A10 10 0 0 1 5 5"/>',
    headphones: '<path d="M3 15v-3a9 9 0 0 1 18 0v3"/><path d="M3 15h3v6H4a1 1 0 0 1-1-1zM21 15h-3v6h2a1 1 0 0 0 1-1z"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M5 12v9h14v-9M12 8v13M12 8S10.5 3 8 3a2.5 2.5 0 0 0 0 5M12 8s1.5-5 4-5a2.5 2.5 0 0 1 0 5"/>',
    pen: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
    mic: '<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M19 10v1a7 7 0 0 1-14 0v-1M12 18v4"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M3.5 7l8.5 6 8.5-6"/>',
    note: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
    cash: '<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 12h.01M18 12h.01"/>',
    volume: '<path d="M11 5L6 9H2v6h4l5 4z" fill="currentColor"/><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14"/>',
    trophy: '<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/>',
    alert: '<path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
    lemon: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5.5"/><path d="M12 6.5v11M7.2 9.2l9.6 5.6M7.2 14.8l9.6-5.6"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    window: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M12 3v18M4 12h16"/>',
    moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/><path d="M17 3v3M15.5 4.5h3"/>',
    bus: '<rect x="4" y="3" width="16" height="14" rx="3"/><path d="M4 10h16M8 13.5h.01M16 13.5h.01M7 17v3M17 17v3"/>'
  };
  function icon(name, cls) {
    return '<svg class="ico' + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICONS[name] + '</svg>';
  }
  function badge(name, tone) { return '<span class="badge-ico ' + tone + '" aria-hidden="true">' + icon(name) + '</span>'; }

  function cover(item, size) {
    return '<div class="cover' + (size ? ' cover-' + size : '') + '" style="background:' + item.cover + '" aria-hidden="true">' + icon(item.art) + '</div>';
  }
  function songName(id) { return id === 'main' ? SONG.title : byId(id).song; }
  function playBtn(id, extraClass) {
    return '<button type="button" class="play' + (extraClass ? ' ' + extraClass : '') + '" data-play="' + id +
      '" aria-pressed="false" aria-label="Play ' + esc(songName(id)) + '">' + ICON_PLAY + '</button>';
  }
  function playPill(id, text, extraClass) {
    return '<button type="button" class="play play-pill' + (extraClass ? ' ' + extraClass : '') + '" data-play="' + id +
      '" data-text="' + esc(text) + '" aria-pressed="false">' + ICON_PLAY + '<span>' + esc(text) + '</span></button>';
  }

  function appWindow(kind, name, tabs, on, body) {
    return '<section class="window w-' + kind + '" aria-label="' + name + ' app">' +
      '<div class="window-bar">' + logo(kind) + '<span>' + name + '</span>' +
      '<div class="tabs" aria-hidden="true">' + tabs.map(function (t) {
        return '<span' + (t === on ? ' class="on"' : '') + '>' + t + '</span>';
      }).join('') + '</div></div>' +
      '<div class="window-body">' + body + '</div></section>';
  }
  function stage(n, appName, title, paras, right) {
    return '<div class="stage"><aside class="explain">' +
      '<p class="kicker">Step ' + n + ' · ' + appName + '</p>' +
      '<h1 tabindex="-1">' + title + '</h1>' +
      paras.map(function (p) { return '<p>' + p + '</p>'; }).join('') +
      '</aside>' + right + '</div>';
  }

  // ---------- music (tiny made-up tunes, played live) ----------
  var Player = (function () {
    var MAJOR = [0, 2, 4, 5, 7, 9, 11], MINOR = [0, 2, 3, 5, 7, 8, 10];
    var DEFS = {
      main:    { root: 60, scale: MAJOR, bpm: 116, seed: 7,  prog: [0, 4, 5, 3], lead: 'square' },
      mara:    { root: 62, scale: MAJOR, bpm: 124, seed: 3,  prog: [0, 3, 4, 3], lead: 'triangle' },
      puddles: { root: 57, scale: MINOR, bpm: 86,  seed: 11, prog: [0, 5, 2, 6], lead: 'sine' },
      rico:    { root: 55, scale: MAJOR, bpm: 96,  seed: 5,  prog: [0, 5, 3, 4], lead: 'triangle' },
      juno:    { root: 64, scale: MINOR, bpm: 104, seed: 9,  prog: [0, 6, 5, 4], lead: 'sawtooth' }
    };
    var ctx = null, master = null, noise = null, timer = null;
    var current = null, def = null, mel = null, step = 0, nextTime = 0;
    var listeners = [];

    function melody(d) {
      var seed = d.seed * 9973;
      function r() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
      var out = [], prev = 4;
      for (var i = 0; i < 32; i++) {
        var ch = d.prog[Math.floor(i / 8)];
        if (i % 8 === 7 && r() < 0.6) { out.push(null); continue; }
        if (i % 2 === 0) {
          var c = [ch, ch + 2, ch + 4, ch + 7];
          c.sort(function (a, b) { return Math.abs(a - prev) - Math.abs(b - prev); });
          prev = c[r() < 0.7 ? 0 : 1];
        } else {
          if (r() < 0.35) { out.push(null); continue; }
          prev += r() < 0.5 ? 1 : -1;
        }
        prev = Math.max(0, Math.min(10, prev));
        out.push(prev);
      }
      return out;
    }
    function midi(d, deg) {
      var n = d.scale.length, o = Math.floor(deg / n), i = ((deg % n) + n) % n;
      return d.root + 12 * o + d.scale[i];
    }
    function hz(m) { return 440 * Math.pow(2, (m - 69) / 12); }
    function tone(t, freq, dur, type, vol) {
      var o = ctx.createOscillator(), g = ctx.createGain();
      o.type = type; o.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol, t + 0.015);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(master);
      o.start(t); o.stop(t + dur + 0.05);
    }
    function kick(t) {
      var o = ctx.createOscillator(), g = ctx.createGain();
      o.frequency.setValueAtTime(140, t);
      o.frequency.exponentialRampToValueAtTime(45, t + 0.12);
      g.gain.setValueAtTime(0.55, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
      o.connect(g); g.connect(master);
      o.start(t); o.stop(t + 0.25);
    }
    function hat(t, vol) {
      var s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
      s.buffer = noise; f.type = 'highpass'; f.frequency.value = 7000;
      g.gain.setValueAtTime(vol, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
      s.connect(f); f.connect(g); g.connect(master);
      s.start(t); s.stop(t + 0.06);
    }
    function playStep(i, t, eighth) {
      var ch = def.prog[Math.floor(i / 8)];
      if (i % 8 === 0) {
        [0, 2, 4].forEach(function (k) { tone(t, hz(midi(def, ch + k) - 12), eighth * 8, 'sine', 0.035); });
      }
      if (i % 2 === 0) tone(t, hz(midi(def, ch) - 24), eighth * 1.8, 'triangle', 0.22);
      if (i % 4 === 0) kick(t);
      if (i % 2 === 1) hat(t, 0.05);
      if (mel[i] !== null) tone(t, hz(midi(def, mel[i])), eighth * 0.9, def.lead, def.lead === 'sine' ? 0.16 : 0.07);
    }
    function tick() {
      var eighth = 60 / def.bpm / 2;
      while (nextTime < ctx.currentTime + 0.25) {
        if (step >= 32 * 4) { stop(); return; }
        playStep(step % 32, nextTime, eighth);
        step++; nextTime += eighth;
      }
    }
    function emit() { listeners.forEach(function (fn) { fn(current); }); }

    // The AI song is a real recording; the inspiring artists' songs are made-up tunes built live below.
    var recordings = { main: 'audio/midnight-lemonade.mp3?v=4' };
    var track = null;

    function play(id) {
      stop();
      current = id;
      if (recordings[id]) {
        track = track || new Audio();
        if (track.getAttribute('src') !== recordings[id]) track.src = recordings[id];
        track.currentTime = 0;
        track.onended = stop;
        track.onpause = function () { if (recordings[current] && track.paused) stop(); };
        var started = track.play();
        if (started && started.catch) started.catch(function () { /* blocked or missing: keep the button state */ });
        emit();
        return;
      }
      var AC = window.AudioContext || window.webkitAudioContext;
      if (AC) {
        try {
          if (!ctx) {
            ctx = new AC();
            noise = ctx.createBuffer(1, ctx.sampleRate * 0.2, ctx.sampleRate);
            var data = noise.getChannelData(0);
            for (var i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
          }
          if (ctx.state === 'suspended') ctx.resume();
          var comp = ctx.createDynamicsCompressor();
          master = ctx.createGain();
          master.gain.value = 0.5;
          master.connect(comp); comp.connect(ctx.destination);
          def = DEFS[id]; mel = melody(def); step = 0;
          nextTime = ctx.currentTime + 0.05;
          tick();
          timer = setInterval(tick, 80);
        } catch (e) { /* no sound available: keep the button state anyway */ }
      }
      emit();
    }
    function stop() {
      if (track && !track.paused) track.pause();
      if (timer) { clearInterval(timer); timer = null; }
      if (master && ctx) {
        master.gain.setTargetAtTime(0, ctx.currentTime, 0.03);
        master = null;
      }
      if (current !== null) { current = null; emit(); }
    }
    return {
      toggle: function (id) { if (current === id) stop(); else play(id); },
      stop: stop,
      onChange: function (fn) { listeners.push(fn); },
      playing: function () { return current; }
    };
  })();

  function syncPlayButtons() {
    var now = Player.playing();
    Array.prototype.forEach.call(document.querySelectorAll('[data-play]'), function (b) {
      var on = b.getAttribute('data-play') === now;
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      var text = b.getAttribute('data-text');
      if (text) {
        b.innerHTML = (on ? ICON_PAUSE : ICON_PLAY) + '<span>' + esc(on ? 'Pause' : text) + '</span>';
      } else {
        b.innerHTML = on ? ICON_PAUSE : ICON_PLAY;
        b.setAttribute('aria-label', (on ? 'Pause ' : 'Play ') + songName(b.getAttribute('data-play')));
      }
    });
  }
  Player.onChange(syncPlayButtons);

  // ---------- screens ----------
  function inspiredHtml() {
    return '<div class="inspired reveal"><h3>What inspired this song?</h3>' +
      '<p class="muted">The AI learned from real songs by real people. These four helped the most.</p>' +
      '<ul class="inf-list">' + INFLUENCES.map(function (x) {
        return '<li class="inf">' + cover(x, 'sm') +
          '<div class="inf-name"><b>' + x.song + '</b><span class="muted">' + x.artist + '</span>' +
          '<div class="bar" aria-hidden="true"><i data-w="' + x.pct + '"></i></div></div>' +
          '<div class="pct">' + x.pct + '%</div></li>';
      }).join('') + '</ul></div>';
  }
  function songResultHtml() {
    return '<div class="song-card reveal">' + cover(SONG) +
      '<div class="song-meta"><h2>' + SONG.title + '</h2><p class="muted">Made by you · 0:30 · Folk</p></div>' +
      playBtn('main') + '</div>' + inspiredHtml();
  }
  function bringIntoView(el) {
    if (el && el.scrollIntoView) el.scrollIntoView({ block: 'center', behavior: reduceMotion ? 'auto' : 'smooth' });
  }
  function growBars(root) {
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        Array.prototype.forEach.call(root.querySelectorAll('[data-w]'), function (i) {
          i.style.width = i.getAttribute('data-w') + '%';
        });
      });
    });
  }

  var VIEWS = {};

  VIEWS[''] = {
    html: function () {
      var started = state.made;
      var path = [
        ['spark', '1. Make', 'SongSpark'],
        ['drop', '2. Release', 'DropTune'],
        ['streamy', '3. Listen', 'Streamy'],
        ['drop', '4. Earn', 'DropTune'],
        ['inbox', '5. Share', 'Artist Inbox']
      ];
      return '<div class="hero">' +
        '<h1 tabindex="-1">One song’s journey, from idea to paycheck</h1>' +
        '<p class="lead">Make a song with AI. Put it on streaming apps. Then watch part of the money go back to the real artists who inspired it.</p>' +
        '<ol class="path">' + path.map(function (p) {
          return '<li>' + logo(p[0]) + '<b>' + p[1] + '</b><span>' + p[2] + '</span></li>';
        }).join('') + '</ol>' +
        '<a class="btn btn-primary btn-big" href="#/' + STEPS[maxStep()].id + '">' + (started ? 'Keep going →' : 'Let’s go →') + '</a>' +
        '<p class="small">Takes about 2 minutes. Turn your sound on ' + icon('volume') + '</p></div>';
    }
  };

  VIEWS.make = {
    step: 0,
    html: function () {
      var body =
        '<h2 class="spark-title">What song do you want to <span class="spark-grad">make</span> today?</h2>' +
        '<div class="prompt-box"><label for="prompt">Describe your song</label>' +
        '<textarea id="prompt" rows="2">' + esc(SONG.prompt) + '</textarea>' +
        '<div class="prompt-row">' + SONG.tags.map(function (t) { return '<span class="tag">' + t + '</span>'; }).join('') +
        '<button type="button" class="btn btn-spark btn-big" id="create">' + icon('sparkles') + 'Create</button></div></div>' +
        '<div id="spark-out" aria-live="polite">' + (state.made ? songResultHtml() : '') + '</div>';
      return stage(1, 'SongSpark', 'Make a song',
        ['You tell the AI what song you want. It makes it in seconds.',
         'It also shows <b>which real songs inspired it</b>. Keep an eye on that list: it decides who gets paid later.'],
        appWindow('spark', 'SongSpark', ['Create', 'Library', 'Explore'], 'Create', body));
    },
    mount: function () {
      var out = document.getElementById('spark-out');
      if (state.made) growBars(out);
      document.getElementById('create').addEventListener('click', function () {
        var btn = this;
        btn.disabled = true;
        Player.stop();
        var lines = ['Picking a beat…', 'Writing the tune…', 'Adding the voice…', 'Finding what inspired it…'];
        var show = function (i) {
          out.innerHTML = '<div class="making"><span class="wave" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span><span>' + lines[i] + '</span></div>';
        };
        show(0);
        lines.forEach(function (_, i) { if (i) later(function () { show(i); }, i * 550); });
        later(function () {
          out.innerHTML = songResultHtml();
          growBars(out);
          bringIntoView(out.firstChild);
          btn.disabled = false;
          state.made = true; save();
          refreshChrome();
        }, lines.length * 550);
      });
    }
  };

  var CHECKS = ['This song was made with AI', 'We found its inspiration list', 'Ready for streaming apps'];

  function liveHtml() {
    return '<div class="live reveal">' + badge('radio', 'good') + '<div><h3>Your song is live!</h3>' +
      '<p>“' + SONG.title + '” by ' + esc(state.name) + ' is now on Streamy. Its inspiration list went with it.</p></div></div>';
  }
  VIEWS.release = {
    step: 1,
    html: function () {
      var done = state.released;
      var body =
        '<h2 class="drop-h">New release</h2>' +
        '<div class="release-head" style="margin-top:14px">' + cover(SONG, 'sm') +
        '<div class="song-meta"><b>' + SONG.title + '</b><p class="muted">From SongSpark · made with AI</p></div>' + playBtn('main', 'play-sm') + '</div>' +
        '<div class="form"><div class="field"><label for="artist">Your artist name</label>' +
        '<input id="artist" value="' + esc(state.name) + '" autocomplete="off" maxlength="40"></div></div>' +
        '<ul class="checks" aria-label="DropTune checks">' + CHECKS.map(function (c, i) {
          return '<li class="check' + (done ? ' is-ok' : '') + '" data-i="' + i + '"><span class="dot" aria-hidden="true">' + (done ? icon('check') : '') + '</span><span>' + c + '</span></li>';
        }).join('') + '</ul>' +
        '<div class="actions"><button type="button" class="btn btn-primary btn-big" id="release"' + (done ? ' disabled' : '') + '>' +
        (done ? icon('check') + 'Released' : icon('rocket') + 'Release my song') + '</button></div>' +
        '<div id="live" aria-live="polite">' + (done ? liveHtml() : '') + '</div>';
      return stage(2, 'DropTune', 'Send it to streaming apps',
        ['To get your song on streaming apps, you send it to <b>DropTune</b>.',
         'DropTune checks the song and keeps its inspiration list attached, so nobody forgets who helped.'],
        appWindow('drop', 'DropTune', ['Releases', 'Earnings', 'Help'], 'Releases', body));
    },
    mount: function () {
      document.getElementById('artist').addEventListener('input', function () {
        state.name = this.value.trim() || DEFAULTS.name; save();
      });
      document.getElementById('release').addEventListener('click', function () {
        var btn = this;
        btn.disabled = true;
        btn.textContent = 'Checking…';
        var items = document.querySelectorAll('.check');
        CHECKS.forEach(function (_, i) {
          later(function () { items[i].classList.add('is-busy'); }, i * 700);
          later(function () {
            items[i].classList.remove('is-busy');
            items[i].classList.add('is-ok');
            items[i].querySelector('.dot').innerHTML = icon('check');
          }, i * 700 + 550);
        });
        later(function () {
          btn.innerHTML = icon('check') + 'Released';
          document.getElementById('live').innerHTML = liveHtml();
          bringIntoView(document.getElementById('live'));
          state.released = true; save();
          refreshChrome();
        }, CHECKS.length * 700 + 100);
      });
    }
  };

  var CHART = (function () {
    var out = [];
    for (var i = 0; i < 30; i++) out.push(Math.round(14 + 80 * (1 - Math.exp(-i / 7)) + 6 * Math.sin(i * 1.7)));
    return out;
  })();
  function listenDone() {
    return icon('headphones') + ' Your song got ' + PLAYS.toLocaleString('en-US') + ' plays this month!';
  }
  VIEWS.listen = {
    step: 2,
    html: function () {
      var done = state.listened;
      var body =
        '<div class="now">' + cover(SONG, 'lg') + '<div><p class="eyebrow">New song</p><h2>' + SONG.title + '</h2>' +
        '<p class="muted">' + esc(state.name) + '</p>' + playPill('main', 'Play', 'play-streamy') + '</div></div>' +
        '<div class="plays-box"><p class="muted">Plays this month</p>' +
        '<p class="plays-num" id="plays">' + (done ? PLAYS.toLocaleString('en-US') : '0') + '</p>' +
        '<div class="chart" id="chart" aria-hidden="true">' + CHART.map(function (h) {
          return '<i style="height:' + (done ? h : 2) + '%"></i>';
        }).join('') + '</div>' +
        '<button type="button" class="btn btn-streamy btn-big" id="jump"' + (done ? ' disabled' : '') + '>' +
        (done ? icon('check') + 'Month finished' : icon('forward') + 'Jump to end of month') + '</button>' +
        '<p id="listen-done" class="listen-done" aria-live="polite">' +
        (done ? listenDone() : '') + '</p></div>';
      return stage(3, 'Streamy', 'People press play',
        ['People find your song on Streamy and listen.',
         'Every single play earns a <b>tiny</b> bit of money. Let’s skip ahead to the end of the month.'],
        appWindow('streamy', 'Streamy', ['Home', 'Search', 'Library'], 'Home', body));
    },
    mount: function () {
      document.getElementById('jump').addEventListener('click', function () {
        var btn = this, num = document.getElementById('plays');
        btn.disabled = true;
        Array.prototype.forEach.call(document.querySelectorAll('#chart i'), function (bar, i) {
          later(function () { bar.style.height = CHART[i] + '%'; }, i * 40);
        });
        var finish = function () {
          num.textContent = PLAYS.toLocaleString('en-US');
          btn.innerHTML = icon('check') + 'Month finished';
          document.getElementById('listen-done').innerHTML = listenDone();
          state.listened = true; save();
          refreshChrome();
        };
        if (reduceMotion) { finish(); return; }
        var start = null, dur = 1600;
        var frame = function (t) {
          if (!document.body.contains(num)) return;
          if (start === null) start = t;
          var k = Math.min(1, (t - start) / dur), eased = 1 - Math.pow(1 - k, 3);
          num.textContent = Math.round(PLAYS * eased).toLocaleString('en-US');
          if (k < 1) requestAnimationFrame(frame); else finish();
        };
        requestAnimationFrame(frame);
      });
    }
  };

  VIEWS.earn = {
    step: 3,
    html: function () {
      var m = money();
      var body =
        '<p class="muted">' + SONG.title + ' · this month</p>' +
        '<div class="earn-total"><p class="label">Your song earned</p><p class="amount">' + usd(m.total) + '</p>' +
        '<p class="math">' + PLAYS.toLocaleString('en-US') + ' plays × ' + CENTS_PER_PLAY + '¢ each</p></div>' +
        '<div class="split-bar" role="img" aria-label="' + CREATOR_PERCENT + '% to you, ' + (100 - CREATOR_PERCENT) + '% to the Sharing Pool">' +
        '<span class="you" style="flex:' + m.you + '"></span><span class="pool" style="flex:' + m.pool + '"></span></div>' +
        '<div class="split-cards">' +
        '<div class="split-card you">' + badge('user', 'you') + '<p class="amt">' + usd(m.you) + '</p>' +
        '<h3>For you (' + CREATOR_PERCENT + '%)</h3><p>You made it! This goes to ' + esc(state.name) + '.</p></div>' +
        '<div class="split-card pool">' + badge('gift', 'pool') + '<p class="amt">' + usd(m.pool) + '</p>' +
        '<h3>Sharing Pool (' + (100 - CREATOR_PERCENT) + '%)</h3><p>For the real artists the AI learned from.</p></div></div>' +
        '<div class="why"><b>Why share?</b> The AI learned to make music by listening to songs made by real people. The Sharing Pool is how they get paid for that.</div>';
      return stage(4, 'DropTune', 'The money comes in',
        ['At the end of the month, all those tiny bits add up.',
         'Most of the money is yours. A smaller part goes into a <b>Sharing Pool</b>.'],
        appWindow('drop', 'DropTune', ['Releases', 'Earnings', 'Help'], 'Earnings', body));
    }
  };

  function possessive(name) { return /s$/.test(name) ? name + '’' : name + '’s'; }

  VIEWS.share = {
    step: 4,
    html: function () {
      var m = money();
      var body =
        '<div class="pool-head"><div><h2 class="drop-h">Sharing Pool: ' + usd(m.pool) + '</h2>' +
        '<p class="muted">Split using the “What inspired this song?” list from SongSpark.</p></div>' +
        '<span class="badge-fold"><span class="fold-mark" aria-hidden="true">F</span>Fair pay by Fold</span></div>' +
        '<ul class="pool-rows">' + m.rows.map(function (r) {
          return '<li class="pool-row"><div class="pool-top">' + cover(r, 'sm') +
            '<div class="pool-name"><b>' + r.artist + '</b><span>“' + r.song + '” · inspired ' + r.pct + '%</span>' +
            '<div class="bar" aria-hidden="true"><i style="width:' + r.pct + '%"></i></div></div>' +
            '<div class="amt">' + usd(r.amt) + '</div></div>' +
            '<div class="halves">' +
            '<div class="half"><span class="half-label">' + icon('pen') + 'Wrote it</span><b>' + usd(r.write) + '</b><span>' + r.writer + ' · ' + r.writerCo + '</span></div>' +
            '<div class="half"><span class="half-label">' + icon('mic') + 'Recorded it</span><b>' + usd(r.rec) + '</b><span>' + r.owner + '</span></div></div>' +
            '<a class="btn btn-secondary" href="#/inbox/' + r.id + '">' + icon('mail') + 'See ' + possessive(r.hi) + ' phone →</a></li>';
        }).join('') + '</ul>' +
        '<div class="sum"><p class="eq">' + usd(m.you) + ' for you + ' +
        m.rows.map(function (r) { return usd(r.amt); }).join(' + ') + ' = ' + usd(m.counted) +
        (m.counted === m.total ? ' ' + icon('check', 'ok') : ' ' + icon('alert', 'warn')) + '</p><p>Every cent is counted. Nothing gets lost.</p></div>';
      return stage(5, 'Sharing Pool', 'The money goes back',
        ['The Sharing Pool is split using the inspiration list. <b>Bigger bar, bigger share.</b>',
         'Each share is split again: half for the people who <b>wrote</b> the song, half for the people who <b>recorded</b> it.',
         'Fold is the helper that does the math. It never keeps any of the money.'],
        appWindow('drop', 'DropTune', ['Releases', 'Earnings', 'Sharing Pool'], 'Sharing Pool', body));
    }
  };

  VIEWS.inbox = {
    step: 4,
    html: function (arg) {
      var m = money();
      var r = m.rows.filter(function (x) { return x.id === arg; })[0] || m.rows[0];
      var same = r.writer === r.owner;
      var right =
        '<div class="inbox-wrap"><nav class="artist-tabs" aria-label="Choose an artist">' + INFLUENCES.map(function (x) {
          return '<a class="artist-tab" href="#/inbox/' + x.id + '"' + (x.id === r.id ? ' aria-current="page"' : '') + '>' +
            '<span class="tab-ico" style="background:' + x.cover + '" aria-hidden="true">' + icon(x.art) + '</span>' + x.artist + '</a>';
        }).join('') + '</nav>' +
        '<div class="phone"><div class="screen">' +
        '<div class="status" aria-hidden="true"><span>9:41</span><span class="island"></span><span>100%</span></div>' +
        '<div class="inbox-bar">' + logo('inbox') + 'Artist Inbox</div>' +
        '<div class="msg">' +
        '<div class="msg-hello reveal">' + badge('mail', 'inbox') + '<p>Hi ' + r.hi + '! You got</p>' +
        '<p class="got">' + usd(r.amt) + '</p><p>from a new song.</p></div>' +
        '<p class="body">Your song <b>“' + r.song + '”</b> helped inspire <b>“' + SONG.title + '”</b>, a new AI song by ' + esc(state.name) + '.</p>' +
        '<div><h3>How much it inspired</h3><div class="inf-bar" aria-hidden="true"><i style="width:' + r.pct + '%"></i></div>' +
        '<p class="muted" style="margin-top:6px">' + r.pct + '% of the inspiration → ' + r.pct + '% of the ' + usd(m.pool) + ' Sharing Pool</p></div>' +
        '<div><h3>Where your ' + usd(r.amt) + ' goes</h3><div class="goes">' +
        '<div class="go"><span class="go-ico">' + icon('pen') + '</span><span>For writing it<small>' + r.writer + ' · ' + r.writerCo + '</small></span><b>' + usd(r.write) + '</b></div>' +
        '<div class="go"><span class="go-ico">' + icon('mic') + '</span><span>For recording it<small>' + r.owner + '</small></span><b>' + usd(r.rec) + '</b></div>' +
        '</div>' + (same ? '<p class="both-note" style="margin-top:8px">' + r.hi + ' wrote it <i>and</i> recorded it, so ' + r.hi + ' gets both halves!</p>' : '') + '</div>' +
        '<div class="listen-row">' + playPill(r.id, 'Hear “' + r.song + '”') + playPill('main', 'Hear “' + SONG.title + '”') + '</div>' +
        '</div></div></div></div>';
      return stage(5, 'Artist Inbox', 'The money finds the artist',
        ['This is the phone of a real artist whose song inspired yours.',
         'They didn’t have to do anything. <b>The money found them.</b>',
         'Tap a name above the phone to see each artist’s message.'],
        right);
    }
  };

  VIEWS.done = {
    step: 5,
    html: function () {
      var m = money();
      var items = [
        ['note', 'You made “' + SONG.title + '” on SongSpark.'],
        ['rocket', 'DropTune sent it out with its inspiration list.'],
        ['headphones', 'People played it ' + PLAYS.toLocaleString('en-US') + ' times on Streamy.'],
        ['cash', 'It earned ' + usd(m.total) + '. You kept ' + usd(m.you) + '.'],
        ['mail', usd(m.pool) + ' went back to the ' + m.rows.length + ' artists who inspired it.']
      ];
      return '<div class="hero">' + badge('trophy', 'big') +
        '<h1 tabindex="-1">That’s the whole journey!</h1>' +
        '<p class="lead">One idea became a song, the song made money, and part of that money said thank you to the people it learned from.</p>' +
        '<ul class="recap">' + items.map(function (x) {
          return '<li><span class="recap-ico">' + icon(x[0]) + '</span><span>' + x[1] + '</span></li>';
        }).join('') + '</ul>' +
        '<div class="actions" style="justify-content:center">' +
        '<a class="btn btn-secondary btn-big" href="#/inbox/' + INFLUENCES[0].id + '">See the artists again</a>' +
        '<button type="button" class="btn btn-primary btn-big" data-reset>Start over</button></div></div>';
    }
  };

  // ---------- journey rules ----------
  function maxStep() {
    if (!state.made) return 0;
    if (!state.released) return 1;
    if (!state.listened) return 2;
    return 4;
  }

  var NAV = {
    make:    { back: '', next: 'release', ok: function () { return state.made; },
               wait: 'Tap “Create” to make your song.', ready: 'Your song is ready! Tap Next.' },
    release: { back: 'make', next: 'listen', ok: function () { return state.released; },
               wait: 'Tap “Release my song”.', ready: 'It’s live! Tap Next.' },
    listen:  { back: 'release', next: 'earn', ok: function () { return state.listened; },
               wait: 'Tap “Jump to end of month”.', ready: 'What a month! Tap Next.' },
    earn:    { back: 'listen', next: 'share', ok: function () { return true; },
               ready: 'Next: see where the ' + usd(money().pool) + ' goes.' },
    share:   { back: 'earn', next: 'inbox/' + INFLUENCES[0].id, ok: function () { return true; },
               ready: 'Next: see an artist’s phone.' },
    inbox:   { back: 'share', next: 'done', nextLabel: 'Finish', ok: function () { return true; },
               ready: 'Tap a name to see another artist.' }
  };

  var main = document.getElementById('view');
  var stepsEl = document.getElementById('steps');
  var navbar = document.getElementById('navbar');
  var backBtn = document.getElementById('back');
  var nextBtn = document.getElementById('next');
  var hint = document.getElementById('hint');
  var route = { name: '', arg: '' };

  function parse() {
    var parts = location.hash.replace(/^#\/?/, '').split('/');
    return { name: parts[0] || '', arg: parts[1] || '' };
  }
  function go(path) { location.hash = '#/' + path; }

  function renderSteps() {
    var view = VIEWS[route.name];
    if (!route.name) { stepsEl.hidden = true; return; }
    stepsEl.hidden = false;
    var cur = view.step, max = maxStep();
    var complete = [state.made, state.released, state.listened, false, false];
    stepsEl.innerHTML = STEPS.map(function (s, i) {
      var done = cur > i || (complete[i] && cur !== i);
      var locked = i > max;
      var cls = 'step' + (i === cur ? ' is-current' : '') + (done ? ' is-done' : '') + (locked ? ' is-locked' : '');
      return '<a class="' + cls + '" href="#/' + s.id + '"' +
        (i === cur ? ' aria-current="step"' : '') + (locked ? ' aria-disabled="true" tabindex="-1"' : '') + '>' +
        '<span class="step-num" aria-hidden="true">' + (done ? icon('check') : i + 1) + '</span>' +
        '<span class="step-text"><b>' + s.label + '</b><small>' + s.sub + '</small></span>' +
        '<span class="sr-only">' + (done ? ', done' : locked ? ', not yet' : '') + '</span></a>';
    }).join('');
  }

  function renderNav() {
    var n = NAV[route.name];
    if (!n) { navbar.hidden = true; return; }
    navbar.hidden = false;
    var ok = n.ok();
    nextBtn.disabled = !ok;
    nextBtn.innerHTML = n.nextLabel ? esc(n.nextLabel) + icon('check') : 'Next →';
    hint.textContent = ok ? n.ready : n.wait;
  }

  function refreshChrome() { renderSteps(); renderNav(); }

  var firstRender = true;
  function render() {
    Player.stop();
    clearTimers();
    route = parse();
    var view = VIEWS[route.name];
    if (!view) { go(''); return; }
    if (view.step !== undefined && Math.min(view.step, 4) > maxStep()) { go(STEPS[maxStep()].id); return; }
    main.innerHTML = view.html(route.arg);
    if (view.mount) view.mount(route.arg);
    refreshChrome();
    syncPlayButtons();
    if (!firstRender) {
      window.scrollTo(0, 0);
      var h = main.querySelector('h1');
      (h || main).focus({ preventScroll: true });
    }
    firstRender = false;
  }

  function reset() {
    Player.stop();
    state = Object.assign({}, DEFAULTS);
    try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ }
    if (location.hash === '#/' || location.hash === '') render(); else go('');
  }

  backBtn.addEventListener('click', function () {
    var n = NAV[route.name];
    if (n) go(n.back);
  });
  nextBtn.addEventListener('click', function () {
    var n = NAV[route.name];
    if (n && n.ok()) go(n.next);
  });
  document.getElementById('reset').addEventListener('click', reset);
  document.addEventListener('click', function (e) {
    var p = e.target.closest('[data-play]');
    if (p) { Player.toggle(p.getAttribute('data-play')); return; }
    if (e.target.closest('[data-reset]')) reset();
  });
  window.addEventListener('hashchange', render);
  render();
})();
