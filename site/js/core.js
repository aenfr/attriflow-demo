/* AttriFlow demo v2 — shared data, money math, icons, audio and helpers.
   Plain scripts (no modules) so the demo also opens straight from disk. Everything hangs off window.AF. */
(function () {
  'use strict';
  var AF = window.AF = {};

  // ---------- the story (all illustrative) ----------
  AF.TRACK = {
    title: 'Midnight Lemonade',
    creator: 'Sam Rivera',
    platform: 'SongSpark',
    tier: 'Plus',
    id: 'SSK-2026-7Q4M-1087',
    created: '1 Oct 2026, 14:32 UTC',
    createdShort: '1 Oct 2026',
    prompt: 'a happy folk song with fingerpicked guitar, a dancing beat, sparkly synths and a female voice',
    bpm: 122,
    key: 'C major',
    length: '0:30',
    upload: 'my-cajon-groove.wav',
    file: 'Midnight Lemonade.wav',
    fileSize: '5.3 MB',
    stems: 'Midnight Lemonade - stems.zip',
    stemsSize: '21.8 MB',
    cover: 'linear-gradient(135deg,#ff3d7f,#ffb347)',
    art: 'lemon',
    audio: 'audio/midnight-lemonade.mp3?v=4'
  };

  // What is AI and what is human inside the track. Weights add up to 1.
  AF.PARTS = [
    { name: 'Composition', kind: 'mix', ai: 75, weight: 0.4, label: 'AI 75% · Human 25%' },
    { name: 'Vocals', kind: 'ai', ai: 100, weight: 0.2, label: 'AI-generated' },
    { name: 'Lead guitar', kind: 'ai', ai: 100, weight: 0.15, label: 'AI-generated' },
    { name: 'Percussion', kind: 'human', ai: 0, weight: 0.15, label: 'Human-uploaded' },
    { name: 'Production', kind: 'assist', ai: 60, weight: 0.1, label: 'AI-assisted' }
  ];
  AF.aiShare = function (parts) {
    return Math.round((parts || AF.PARTS).reduce(function (s, p) { return s + p.ai * p.weight; }, 0));
  };

  // The AI influence royalty pool shrinks as the human share grows (the rule the Letter of Direction accepts).
  AF.POOLS = {
    30: { rh: 15, dist: 10, ai: 3, fold: 2 },
    20: { rh: 10, dist: 7, ai: 2, fold: 1 },
    10: { rh: 5, dist: 3, ai: 1, fold: 1 }
  };
  AF.poolFor = function (aiShare) { return aiShare >= 70 ? 30 : aiShare >= 40 ? 20 : 10; };

  // The licensed catalog that trained the model, with the influence LUMINA found in this track.
  AF.CATALOG = [
    { id: 'mara', song: 'Sunny Days', artist: 'Mara Vale', pct: 40, writer: 'Mara Vale', writerCo: 'Brightleaf Songs',
      owner: 'Lighthouse Lane Records', art: 'sun', cover: 'linear-gradient(135deg,#ffd166,#ff8a3c)' },
    { id: 'puddles', song: 'Blue Window', artist: 'The Velvet Puddles', pct: 30, writer: 'Nina Ortiz', writerCo: 'Northstar Songs',
      owner: 'Tidewater Tunes', art: 'window', cover: 'linear-gradient(135deg,#4f7cff,#7fd3ff)' },
    { id: 'rico', song: 'Paper Moon', artist: 'Rico Sands', pct: 20, writer: 'Rico Sands', writerCo: 'Copper Kite Music',
      owner: 'Sundial Sound', art: 'moon', cover: 'linear-gradient(135deg,#3a2f6b,#9b7bff)' },
    { id: 'juno', song: 'Late Bus', artist: 'Juno Wilder', pct: 10, writer: 'Juno Wilder', writerCo: 'Maple Lane Songs',
      owner: 'Juno Wilder', art: 'bus', cover: 'linear-gradient(135deg,#1fb58f,#c6f36b)' }
  ];
  AF.OPTED_OUT = { song: 'Harbor Lights', artist: 'Ellis Crane', art: 'note', cover: 'linear-gradient(135deg,#9aa0ad,#c9ccd4)' };

  // Stores: eligibility from the Green Lane decision, streams for one month, illustrative cents per stream.
  AF.DSPS = [
    { name: 'Spotify', ok: true, streams: 184211, cents: 0.4 },
    { name: 'Apple Music', ok: true, streams: 42105, cents: 0.7 },
    { name: 'YouTube Music', ok: true, streams: 91882, cents: 0.2 },
    { name: 'Amazon Music', ok: true, streams: 18406, cents: 0.4 },
    { name: 'TikTok', ok: true, streams: 9730, cents: 0.1 },
    { name: 'Deezer', ok: true, streams: 6215, cents: 0.3 },
    { name: 'Tidal', ok: true, streams: 2947, cents: 1.0 },
    { name: 'Store X', ok: false, streams: 0, cents: 0 }
  ];
  AF.GREEN_LANE_FEE = 499; // cents, illustrative

  // ---------- money (integer cents, always computed) ----------
  function add(a, b) { return a + b; }
  AF.allocate = function (total, weights) {
    var sum = weights.reduce(add, 0);
    if (!sum) return weights.map(function () { return 0; });
    var raw = weights.map(function (w) { return total * w / sum; });
    var base = raw.map(Math.floor);
    var left = total - base.reduce(add, 0);
    raw.map(function (r, i) { return { i: i, f: r - base[i] }; })
      .sort(function (a, b) { return b.f - a.f; })
      .slice(0, left)
      .forEach(function (x) { base[x.i]++; });
    return base;
  };
  AF.money = function () {
    var gross = AF.DSPS.reduce(function (s, d) { return s + Math.round(d.streams * d.cents); }, 0);
    var share = AF.aiShare();
    var pool = AF.poolFor(share), p = AF.POOLS[pool];
    var parts = AF.allocate(gross, [100 - pool, p.rh, p.dist, p.ai, p.fold]);
    var rh = AF.allocate(parts[1], AF.CATALOG.map(function (c) { return c.pct; })).map(function (amt, i) {
      var halves = AF.allocate(amt, [1, 1]);
      return Object.assign({}, AF.CATALOG[i], { amt: amt, write: halves[0], rec: halves[1] });
    });
    var streams = AF.DSPS.reduce(function (s, d) { return s + d.streams; }, 0);
    return {
      gross: gross, streams: streams, aiShare: share, pool: pool, p: p,
      user: parts[0], rhPool: parts[1], dist: parts[2], ai: parts[3], fold: parts[4], rh: rh,
      counted: parts.reduce(add, 0)
    };
  };
  AF.usd = function (c) {
    return '$' + (c / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };
  AF.usd0 = function (c) { return '$' + Math.round(c / 100).toLocaleString('en-US'); };
  AF.num = function (n) { return n.toLocaleString('en-US'); };
  AF.esc = function (s) {
    return String(s).replace(/[&<>"']/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
    });
  };

  // ---------- state ----------
  var KEY = 'attriflow-v2';
  AF.DEFAULTS = { generated: false, signed: false, prepared: false, downloaded: false, analyzed: false,
    approved: false, declined: false, streamed: false };
  AF.state = (function () {
    try {
      var s = JSON.parse(localStorage.getItem(KEY));
      if (s && typeof s === 'object') return Object.assign({}, AF.DEFAULTS, s);
    } catch (e) { /* storage blocked: start fresh */ }
    return Object.assign({}, AF.DEFAULTS);
  })();
  AF.save = function () { try { localStorage.setItem(KEY, JSON.stringify(AF.state)); } catch (e) { /* ignore */ } };
  AF.reset = function () {
    AF.state = Object.assign({}, AF.DEFAULTS);
    try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ }
  };

  // ---------- timing ----------
  AF.reduceMotion = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  var timers = [];
  AF.later = function (fn, ms) { timers.push(setTimeout(fn, AF.reduceMotion ? Math.min(ms, 80) : ms)); };
  AF.clearTimers = function () { timers.forEach(clearTimeout); timers = []; };
  AF.countUp = function (el, to, ms, fmt, done) {
    fmt = fmt || AF.num;
    if (AF.reduceMotion) { el.textContent = fmt(to); if (done) done(); return; }
    var start = null;
    function frame(t) {
      if (!document.body.contains(el)) return;
      if (start === null) start = t;
      var k = Math.min(1, (t - start) / ms), e = 1 - Math.pow(1 - k, 3);
      el.textContent = fmt(Math.round(to * e));
      if (k < 1) requestAnimationFrame(frame); else if (done) done();
    }
    requestAnimationFrame(frame);
  };

  // ---------- icons ----------
  var ICONS = {
    sparkles: '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M19 3v4M17 5h4M5 17v4M3 19h4"/>',
    check: '<path d="M20 6L9 17l-5-5"/>',
    x: '<path d="M18 6L6 18M6 6l12 12"/>',
    alert: '<path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
    shield: '<path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>',
    lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    upload: '<path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/>',
    download: '<path d="M12 4v12M7 11l5 5 5-5"/><path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/>',
    file: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/>',
    folder: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
    wave: '<path d="M3 12h2M7 8v8M11 5v14M15 9v6M19 7v10M21 12h0"/>',
    pen: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
    mic: '<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M19 10v1a7 7 0 0 1-14 0v-1M12 18v4"/>',
    guitar: '<path d="M14.5 9.5l5-5M18 3l3 3"/><path d="M11 11.5a3.5 3.5 0 0 0-4.6.4c-.9.9-.6 2-1.6 2.9-1.3 1.1-2.8.9-2.8 2.6 0 1.6 1.4 2.6 2.6 2.6 1.7 0 1.5-1.5 2.6-2.8.9-1 2-.7 2.9-1.6a3.5 3.5 0 0 0 .4-4.6z"/><path d="M9.5 14.5h.01"/>',
    drum: '<ellipse cx="12" cy="8" rx="8" ry="3"/><path d="M4 8v8c0 1.7 3.6 3 8 3s8-1.3 8-3V8"/><path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
    sliders: '<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>',
    note: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M21.5 20a6.5 6.5 0 0 0-4-6"/>',
    cpu: '<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/><rect x="9.5" y="9.5" width="5" height="5" rx="1"/>',
    store: '<path d="M4 9l1.5-5h13L20 9"/><path d="M4 9h16v2a3 3 0 0 1-5.3 2 3 3 0 0 1-5.4 0A3 3 0 0 1 4 11z"/><path d="M5 13v7h14v-7"/>',
    building: '<rect x="4" y="3" width="16" height="18" rx="1.5"/><path d="M9 7h.01M15 7h.01M9 11h.01M15 11h.01M9 15h.01M15 15h.01M10 21v-3h4v3"/>',
    chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    cash: '<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 12h.01M18 12h.01"/>',
    headphones: '<path d="M3 15v-3a9 9 0 0 1 18 0v3"/><path d="M3 15h3v6H4a1 1 0 0 1-1-1zM21 15h-3v6h2a1 1 0 0 0 1-1z"/>',
    fingerprint: '<path d="M12 11v3a8 8 0 0 1-1 4"/><path d="M8 11a4 4 0 0 1 8 0v2a12 12 0 0 1-.6 4"/><path d="M5 9.5A7.5 7.5 0 0 1 19 10v2.5a15 15 0 0 1-.4 3.5"/><path d="M5 13.5a14 14 0 0 0 1 5"/>',
    passport: '<rect x="5" y="3" width="14" height="18" rx="2"/><circle cx="12" cy="10" r="3"/><path d="M9 16h6"/>',
    flow: '<circle cx="5" cy="12" r="2.5"/><path d="M7.5 12c4.5 0 4.5-6.5 9-6.5M7.5 12h9M7.5 12c4.5 0 4.5 6.5 9 6.5"/><circle cx="19" cy="5.5" r="1.6" fill="currentColor"/><circle cx="19" cy="12" r="1.6" fill="currentColor"/><circle cx="19" cy="18.5" r="1.6" fill="currentColor"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    forward: '<path d="M13 19l9-7-9-7z" fill="currentColor"/><path d="M2 19l9-7-9-7z" fill="currentColor"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
    gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M5 12v9h14v-9M12 8v13M12 8S10.5 3 8 3a2.5 2.5 0 0 0 0 5M12 8s1.5-5 4-5a2.5 2.5 0 0 1 0 5"/>',
    lemon: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5.5"/><path d="M12 6.5v11M7.2 9.2l9.6 5.6M7.2 14.8l9.6-5.6"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    window: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M12 3v18M4 12h16"/>',
    moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/><path d="M17 3v3M15.5 4.5h3"/>',
    bus: '<rect x="4" y="3" width="16" height="14" rx="3"/><path d="M4 10h16M8 13.5h.01M16 13.5h.01M7 17v3M17 17v3"/>'
  };
  AF.icon = function (name, cls) {
    return '<svg class="ico' + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICONS[name] + '</svg>';
  };
  AF.badge = function (name, tone) { return '<span class="badge-ico ' + tone + '" aria-hidden="true">' + AF.icon(name) + '</span>'; };
  AF.cover = function (item, size) {
    return '<div class="cover' + (size ? ' cover-' + size : '') + '" style="background:' + item.cover + '" aria-hidden="true">' + AF.icon(item.art) + '</div>';
  };

  var uid = 0;
  AF.logo = function (kind) {
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
    if (kind === 'attri') {
      return open + '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="1" y2="1">' +
        '<stop offset="0" stop-color="#ff8a1f"/><stop offset="1" stop-color="#e8343a"/></linearGradient></defs>' +
        '<rect width="32" height="32" rx="8" fill="url(#' + id + ')"/>' +
        '<g transform="translate(4 4)" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round">' + ICONS.flow + '</g></svg>';
    }
    return open + '<rect width="32" height="32" rx="8" fill="#10b8a6"/><path d="M12.5 9.5v13l10.5-6.5z" fill="#fff"/></svg>';
  };

  // ---------- audio: the real AI song plus short made-up tunes for the catalog songs ----------
  var ICON_PLAY = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l10.5-6.5z" fill="currentColor"/></svg>';
  var ICON_PAUSE = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6.5" y="5.5" width="4" height="13" rx="1" fill="currentColor"/><rect x="13.5" y="5.5" width="4" height="13" rx="1" fill="currentColor"/></svg>';
  function songName(id) {
    if (id === 'main') return AF.TRACK.title;
    var c = AF.CATALOG.filter(function (x) { return x.id === id; })[0];
    return c ? c.song : id;
  }
  AF.playBtn = function (id, cls) {
    return '<button type="button" class="play' + (cls ? ' ' + cls : '') + '" data-play="' + id +
      '" aria-pressed="false" aria-label="Play ' + AF.esc(songName(id)) + '">' + ICON_PLAY + '</button>';
  };
  AF.playPill = function (id, text, cls) {
    return '<button type="button" class="play play-pill' + (cls ? ' ' + cls : '') + '" data-play="' + id +
      '" data-text="' + AF.esc(text) + '" aria-pressed="false">' + ICON_PLAY + '<span>' + AF.esc(text) + '</span></button>';
  };

  AF.Player = (function () {
    var MAJOR = [0, 2, 4, 5, 7, 9, 11], MINOR = [0, 2, 3, 5, 7, 8, 10];
    var DEFS = {
      mara: { root: 62, scale: MAJOR, bpm: 124, seed: 3, prog: [0, 3, 4, 3], lead: 'triangle' },
      puddles: { root: 57, scale: MINOR, bpm: 86, seed: 11, prog: [0, 5, 2, 6], lead: 'sine' },
      rico: { root: 55, scale: MAJOR, bpm: 96, seed: 5, prog: [0, 5, 3, 4], lead: 'triangle' },
      juno: { root: 64, scale: MINOR, bpm: 104, seed: 9, prog: [0, 6, 5, 4], lead: 'sawtooth' }
    };
    var ctx = null, master = null, noise = null, timer = null;
    var current = null, def = null, mel = null, step = 0, nextTime = 0;
    var listeners = [];
    var track = null;

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
      if (i % 8 === 0) [0, 2, 4].forEach(function (k) { tone(t, hz(midi(def, ch + k) - 12), eighth * 8, 'sine', 0.035); });
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

    function play(id) {
      stop();
      current = id;
      if (id === 'main') {
        track = track || new Audio();
        if (track.getAttribute('src') !== AF.TRACK.audio) track.src = AF.TRACK.audio;
        track.currentTime = 0;
        track.onended = stop;
        track.onpause = function () { if (current === 'main' && track.paused) stop(); };
        var started = track.play();
        if (started && started.catch) started.catch(function () { /* blocked or missing: keep the button state */ });
        emit();
        return;
      }
      var AC = window.AudioContext || window.webkitAudioContext;
      if (AC && DEFS[id]) {
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
      if (master && ctx) { master.gain.setTargetAtTime(0, ctx.currentTime, 0.03); master = null; }
      if (current !== null) { current = null; emit(); }
    }
    return {
      toggle: function (id) { if (current === id) stop(); else play(id); },
      stop: stop,
      onChange: function (fn) { listeners.push(fn); },
      playing: function () { return current; },
      progress: function () { return track && current === 'main' && track.duration ? track.currentTime / track.duration : 0; }
    };
  })();

  AF.syncPlayButtons = function () {
    var now = AF.Player.playing();
    Array.prototype.forEach.call(document.querySelectorAll('[data-play]'), function (b) {
      var on = b.getAttribute('data-play') === now;
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      var text = b.getAttribute('data-text');
      if (text) {
        b.innerHTML = (on ? ICON_PAUSE : ICON_PLAY) + '<span>' + AF.esc(on ? 'Pause' : text) + '</span>';
      } else {
        b.innerHTML = on ? ICON_PAUSE : ICON_PLAY;
        b.setAttribute('aria-label', (on ? 'Pause ' : 'Play ') + songName(b.getAttribute('data-play')));
      }
    });
    if (now === 'main') AF.Wave.follow();
  };
  AF.Player.onChange(AF.syncPlayButtons);

  // ---------- waveform drawn from the real song ----------
  AF.Wave = (function () {
    var BARS = 120, peaks = null, loading = null;
    function fallback() {
      var out = [], seed = 1087;
      for (var i = 0; i < BARS; i++) {
        seed = (seed * 16807) % 2147483647;
        var env = 0.55 + 0.35 * Math.sin(i / BARS * Math.PI);
        out.push(Math.max(0.12, Math.min(1, env * (0.6 + 0.4 * seed / 2147483647))));
      }
      return out;
    }
    function load() {
      if (peaks) return Promise.resolve(peaks);
      if (loading) return loading;
      var OAC = window.OfflineAudioContext || window.webkitOfflineAudioContext;
      if (!OAC || location.protocol === 'file:') { peaks = fallback(); return Promise.resolve(peaks); }
      loading = fetch(AF.TRACK.audio).then(function (r) { return r.arrayBuffer(); }).then(function (buf) {
        return new Promise(function (ok, fail) { new OAC(1, 44100, 44100).decodeAudioData(buf, ok, fail); });
      }).then(function (audio) {
        var data = audio.getChannelData(0), size = Math.floor(data.length / BARS), out = [], max = 0;
        for (var i = 0; i < BARS; i++) {
          var sum = 0;
          for (var j = i * size; j < (i + 1) * size; j += 16) sum += data[j] * data[j];
          var rms = Math.sqrt(sum / (size / 16));
          out.push(rms); if (rms > max) max = rms;
        }
        peaks = out.map(function (v) { return Math.max(0.08, v / (max || 1)); });
        return peaks;
      }).catch(function () { peaks = fallback(); return peaks; });
      return loading;
    }
    function svg(p) {
      var w = BARS * 4;
      return '<svg viewBox="0 0 ' + w + ' 100" preserveAspectRatio="none" aria-hidden="true">' + p.map(function (v, i) {
        var h = Math.round(v * 92);
        return '<rect x="' + (i * 4 + 0.6) + '" y="' + (50 - h / 2) + '" width="2.8" height="' + h + '" rx="1.4"/>';
      }).join('') + '</svg>';
    }
    function paint(el) {
      load().then(function (p) {
        el.innerHTML = '<div class="wave-base">' + svg(p) + '</div><div class="wave-fill">' + svg(p) + '</div>';
        follow();
      });
    }
    var raf = null;
    function follow() {
      if (raf) return;
      function step() {
        var k = AF.Player.progress();
        Array.prototype.forEach.call(document.querySelectorAll('.wave-fill'), function (f) {
          f.style.clipPath = 'inset(0 ' + (100 - k * 100).toFixed(2) + '% 0 0)';
        });
        if (AF.Player.playing() === 'main') raf = requestAnimationFrame(step); else raf = null;
      }
      raf = requestAnimationFrame(step);
    }
    return { paint: paint, follow: follow };
  })();

  // ---------- modal ----------
  AF.modal = function (html, opts) {
    opts = opts || {};
    var root = document.getElementById('modal');
    root.innerHTML = '<div class="modal-card' + (opts.wide ? ' wide' : '') + '" role="dialog" aria-modal="true" aria-labelledby="modal-title">' + html + '</div>';
    root.hidden = false;
    document.body.classList.add('modal-open');
    var first = root.querySelector('[data-autofocus]') || root.querySelector('button, [href], input');
    if (first) first.focus();
    return root;
  };
  AF.closeModal = function () {
    var root = document.getElementById('modal');
    root.hidden = true; root.innerHTML = '';
    document.body.classList.remove('modal-open');
  };

  // ---------- building blocks ----------
  AF.appWindow = function (kind, name, tabs, on, body, extra) {
    return '<section class="window w-' + kind + (extra ? ' ' + extra : '') + '" aria-label="' + name + '">' +
      '<div class="window-bar">' + AF.logo(kind) + '<span>' + name + '</span>' +
      '<div class="tabs" aria-hidden="true">' + tabs.map(function (t) {
        return '<span' + (t === on ? ' class="on"' : '') + '>' + t + '</span>';
      }).join('') + '</div></div>' +
      '<div class="window-body">' + body + '</div></section>';
  };
  AF.stage = function (n, where, title, paras, right, powered) {
    return '<div class="stage"><aside class="explain">' +
      '<p class="kicker">Step ' + n + ' · ' + where + '</p>' +
      '<h1 tabindex="-1">' + title + '</h1>' +
      paras.map(function (p) { return '<p>' + p + '</p>'; }).join('') +
      (powered ? '<p class="powered">Powered by ' + powered + '</p>' : '') +
      '</aside><div class="stage-main">' + right + '</div></div>';
  };
  AF.pill = function (tone, text, ic) {
    return '<span class="pill ' + tone + '">' + (ic ? AF.icon(ic) : '') + text + '</span>';
  };
  AF.statusRow = function (label, value, tone, ic) {
    return '<li class="status-row"><span class="status-ico ' + (tone || 'good') + '">' + AF.icon(ic || 'check') + '</span>' +
      '<span class="status-label">' + label + '</span><span class="status-value">' + value + '</span></li>';
  };
  AF.metric = function (label, value, sub, ic) {
    return '<div class="metric">' + (ic ? '<span class="metric-ico">' + AF.icon(ic) + '</span>' : '') +
      '<p class="metric-label">' + label + '</p><p class="metric-value">' + value + '</p>' +
      (sub ? '<p class="metric-sub">' + sub + '</p>' : '') + '</div>';
  };
  AF.partTone = function (kind) { return kind === 'human' ? 'human' : kind === 'ai' ? 'ai' : kind === 'assist' ? 'assist' : 'mix'; };
  AF.partIcon = function (name) {
    return { Composition: 'note', Vocals: 'mic', 'Lead guitar': 'guitar', Percussion: 'drum', Production: 'sliders' }[name] || 'note';
  };
  AF.splitBar = function (m, compact) {
    var rows = [
      ['you', 'Creator', 100 - m.pool, m.user],
      ['rh', 'Rightsholders (AI influence)', m.p.rh, m.rhPool],
      ['dist', 'Distributor Green Lane', m.p.dist, m.dist],
      ['aip', 'AI platform', m.p.ai, m.ai],
      ['fold', 'Fold (AttriFlow)', m.p.fold, m.fold]
    ];
    return '<div class="split"><div class="split-track" role="img" aria-label="' + rows.map(function (r) { return r[1] + ' ' + r[2] + '%'; }).join(', ') + '">' +
      rows.map(function (r) { return '<span class="seg ' + r[0] + '" style="flex:' + r[2] + '"></span>'; }).join('') + '</div>' +
      '<ul class="split-legend' + (compact ? ' compact' : '') + '">' + rows.map(function (r) {
        return '<li><span class="dot ' + r[0] + '"></span><span class="lg-name">' + r[1] + '</span><b>' + r[2] + '%</b>' +
          (compact ? '' : '<span class="lg-amt">' + AF.usd(r[3]) + '</span>') + '</li>';
      }).join('') + '</ul></div>';
  };
})();
