/* AttriFlow demo v2 — stakeholder dashboards, one per role, behind the "View as" switcher. */
(function () {
  'use strict';
  var AF = window.AF, T = AF.TRACK, icon = AF.icon, usd = AF.usd, num = AF.num;
  var V = AF.VIEWS = AF.VIEWS || {};

  AF.ROLES = [
    { id: 'user', label: 'User' },
    { id: 'platform', label: 'AI Platform' },
    { id: 'distributor', label: 'Distributor' },
    { id: 'rightsholder', label: 'Rightsholder' },
    { id: 'fold', label: 'Fold' }
  ];

  // Shown on every dashboard: the release's streams and where its money went.
  function releaseStrip() {
    var m = AF.money(), s = AF.POOL_SPLIT;
    var top = AF.DSPS.slice(0, 3);
    return '<section class="card strip"><div class="card-head"><div class="strip-title">' + AF.cover(T, 'sm') +
      '<div><p class="card-eyebrow">This month · illustrative</p><h3>' + T.title + ' · ' + T.user + '</h3></div></div>' +
      AF.pill('good', 'Live on 7 stores', 'check') + '</div>' +
      '<div class="strip-grid">' +
      '<div><p class="metric-label">Streams</p><p class="metric-value">' + num(m.streams) + '</p><ul class="mini-list">' +
      top.map(function (d) { return '<li><span>' + d.name + '</span><b>' + num(d.streams) + '</b></li>'; }).join('') +
      '<li class="muted"><span>4 more stores</span><b>' + num(m.streams - top.reduce(function (a, d) { return a + d.streams; }, 0)) + '</b></li></ul></div>' +
      '<div><p class="metric-label">Net distribution revenue</p><p class="metric-value">' + usd(m.net) + '</p><p class="metric-sub">¼¢ per stream</p></div>' +
      '<div><p class="metric-label">User share (' + (100 - m.pool) + '%)</p><p class="metric-value">' + usd(m.user) + '</p><p class="metric-sub">Paid directly to ' + T.user + '</p></div>' +
      '<div><p class="metric-label">AI influence royalty pool (' + m.pool + '%)</p><p class="metric-value">' + usd(m.poolAmt) + '</p><ul class="mini-list">' +
      '<li><span><i class="dot rh"></i>Rightsholders ' + s.rh + '%</span><b>' + usd(m.rhPool) + '</b></li>' +
      '<li><span><i class="dot dist"></i>Distributor Green Lane ' + s.dist + '%</span><b>' + usd(m.dist) + '</b></li>' +
      '<li><span><i class="dot aip"></i>AI platform ' + s.ai + '%</span><b>' + usd(m.ai) + '</b></li>' +
      '<li><span><i class="dot fold"></i>Fold ' + s.fold + '%</span><b>' + usd(m.fold) + '</b></li></ul></div>' +
      '</div><p class="muted small">AttriFlow sets the pool between 10% and 30% of net streaming revenue from its weighing of AI and human parts. ' +
      'This song was re-scored at distribution: ' + m.poolThen + '% → ' + m.pool + '%.</p></section>';
  }

  function dashHead(kind, org, title, line) {
    return '<header class="dash-head">' + (kind === 'store' ? '<span class="flow-store">' + icon('building') + '</span>' : AF.logo(kind)) +
      '<div><p class="card-eyebrow">' + org + '</p><h1 tabindex="-1">' + title + '</h1>' + (line ? '<p class="muted">' + line + '</p>' : '') + '</div></header>';
  }
  function metrics(list) { return '<div class="metrics">' + list.join('') + '</div>'; }
  function decisionPill(d) {
    return d === 'green' ? AF.pill('good', 'GREEN · Distribute') : d === 'amber' ? AF.pill('warn', 'AMBER · Review') : AF.pill('bad', 'RED · Hold');
  }

  // ---------- Distributor (the most developed: immediate go-to-market) ----------
  var SUBS = [
    { track: 'Midnight Lemonade', artist: 'Sam Rivera', ai: 'Human + AI (51% AI)', prov: 'Verified', bad: 'Clear', dsp: '7 of 8', d: 'green' },
    { track: 'Neon Harbor', artist: 'Kites at Noon', ai: 'Fully AI', prov: 'Verified', bad: 'Clear', dsp: '8 of 8', d: 'green' },
    { track: 'Dust & Static', artist: 'Marlow Fenn', ai: 'Human + AI (55% AI)', prov: 'Verified', bad: 'Clear', dsp: '8 of 8', d: 'green' },
    { track: 'Paper Lanterns', artist: 'Odessa Lune', ai: 'Mostly human (32% AI)', prov: 'Verified', bad: 'Clear', dsp: '8 of 8', d: 'green' },
    { track: 'Velvet Static', artist: 'Unknown uploader', ai: 'Fully AI', prov: 'No record found', bad: 'New account, no history', dsp: '3 of 8', d: 'amber' },
    { track: 'Late Night Drive (sped up)', artist: 'drivecore', ai: 'AI, not disclosed', prov: 'Disclosure mismatch', bad: 'Possible re-upload', dsp: '2 of 8', d: 'amber' },
    { track: 'Golden Hour Loop', artist: 'No artist name', ai: 'Fully AI', prov: 'No record found', bad: 'Voice clone risk', dsp: '0 of 8', d: 'red' },
    { track: 'Untitled 4471', artist: 'batch-uploader-22', ai: 'Fully AI', prov: 'No record found', bad: 'Mass-upload pattern', dsp: '0 of 8', d: 'red' }
  ];
  var POOL_TRACKS = [
    { name: 'Neon Harbor', ai: 100 },
    { name: 'Midnight Lemonade', ai: AF.aiShare('now') },
    { name: 'Paper Lanterns', ai: 32 }
  ];
  V.distributor = {
    role: 'distributor',
    html: function () {
      var m = AF.money(), s = AF.POOL_SPLIT;
      var subRows = SUBS.map(function (r) {
        return '<tr' + (r.track === T.title ? ' class="hl"' : '') + '><th scope="row"><b>' + r.track + '</b><small>' + r.artist + '</small></th>' +
          '<td>' + r.ai + '</td><td>' + r.prov + '</td><td>' + r.bad + '</td><td class="num">' + r.dsp + '</td><td>' + decisionPill(r.d) + '</td></tr>';
      }).join('');
      var payees = [
        [AF.RIGHTSHOLDERS + ' rightsholders', 'Influenced the AI parts', s.rh + '%', m.rhPool, 'Paid by Fold'],
        [T.distributor, 'Green Lane distribution', s.dist + '%', m.dist, 'Kept by ' + T.distributor],
        ['SongSpark', 'AI platform', s.ai + '%', m.ai, 'Paid by Fold'],
        ['Fold', 'AttriFlow', s.fold + '%', m.fold, 'Kept by Fold']
      ];
      return dashHead('drop', T.distributor + ' · Distributor console', 'AI submissions',
          'AttriFlow tells the distributor what it can safely accept, where it can send it, and why.') +
        '<div class="aha">' + icon('shield') + '<p>Today you either reject AI broadly or accept it and inherit the risk. <b>AttriFlow creates a third option: accept verified AI.</b></p></div>' +
        metrics([
          AF.metric('Green Lane revenue this month', '$18,240.55', 'Pool shares and release fees, so far', 'cash'),
          AF.metric('AI submissions today', '1,284', null, 'upload'),
          AF.metric('Green Lane approved today', '1,041', '81% of submissions', 'check'),
          AF.metric('Manual review required', '163', null, 'clock'),
          AF.metric('Held or restricted', '80', null, 'lock'),
          AF.metric('Bad actors flagged', '12', null, 'alert')
        ]) +
        '<section class="card"><div class="card-head"><h3>Today’s AI submissions</h3><span class="muted">GREEN distribute · AMBER review · RED hold</span></div>' +
        '<div class="table-wrap"><table class="table"><thead><tr><th>Track</th><th>AI status</th><th>Provenance</th><th>Bad actor check</th><th class="num">Store eligibility</th><th>Decision</th></tr></thead>' +
        '<tbody>' + subRows + '</tbody></table></div></section>' +
        '<div class="grid2">' +
        '<section class="card"><h3>' + icon('sliders') + ' AI influence pool, set per track</h3>' +
        '<p class="muted small">AttriFlow weighs the AI and human parts, then sets the pool as a share of net streaming revenue: 30% when mostly AI, down to 10% when mostly human.</p>' +
        '<div class="field"><label for="pool-track">Track</label><select id="pool-track">' +
        POOL_TRACKS.map(function (t, i) { return '<option value="' + i + '">' + t.name + ' (AI ' + t.ai + '%)</option>'; }).join('') + '</select></div>' +
        '<div class="pool-meter big" role="meter" aria-valuemin="0" aria-valuemax="30" aria-valuenow="30" aria-label="AI influence pool" id="pool-meter"><i style="width:100%"></i></div>' +
        '<div class="pool-ticks" aria-hidden="true"><span>10%</span><span>20%</span><span>30%</span></div>' +
        '<p class="pool-readout" aria-live="polite">Pool <b id="pool-val">30%</b> of net streaming revenue · user keeps <b id="pool-user">70%</b></p>' +
        '<p class="muted small" style="margin-top:12px">The pool is always paid out the same way:</p>' + AF.poolSplit(null, ['Rightsholders', 'Distributor Green Lane', 'AI platform', 'Fold']) + '</section>' +
        '<section class="card"><h3>' + icon('shield') + ' Policy engine</h3><p class="muted small">Each store’s AI rules, checked on every release.</p>' +
        '<ul class="status-list">' +
        AF.statusRow('Spotify policy', 'Current') + AF.statusRow('Apple Music policy', 'Current') +
        AF.statusRow('YouTube policy', 'Current') + AF.statusRow('Amazon Music policy', 'Current') +
        AF.statusRow('TikTok policy', 'Current') + AF.statusRow('Store X policy', 'Update pending', 'warn', 'clock') +
        '</ul></section></div>' +
        '<section class="card"><div class="card-head"><h3>AI influence royalty pool · ' + T.title + '</h3><span class="muted">' + usd(m.poolAmt) + ' · ' + m.pool + '% of net streaming revenue</span></div>' +
        '<div class="table-wrap"><table class="table"><thead><tr><th>Payee</th><th>Role</th><th class="num">Share of pool</th><th class="num">This month</th><th>Payment route</th></tr></thead><tbody>' +
        payees.map(function (p) { return '<tr><th scope="row">' + p[0] + '</th><td>' + p[1] + '</td><td class="num">' + p[2] + '</td><td class="num">' + usd(p[3]) + '</td><td>' + p[4] + '</td></tr>'; }).join('') +
        '</tbody></table></div><p class="muted small">From the Letter of Direction, the fingerprints and the AttriFlow re-score. The user’s ' + (100 - m.pool) + '% (' + usd(m.user) +
        ') is paid directly and is not part of the pool. ' + T.distributor + ' keeps its 5% and sends the other 95% (' + usd(m.toFold) + ') to Fold.</p></section>' +
        releaseStrip();
    },
    mount: function () {
      var sel = document.getElementById('pool-track'), meter = document.getElementById('pool-meter');
      var current = 30;
      sel.addEventListener('change', function () {
        var target = AF.poolFor(POOL_TRACKS[+sel.value].ai);
        meter.querySelector('i').style.width = (target / 30 * 100) + '%';
        meter.setAttribute('aria-valuenow', target);
        var from = current; current = target;
        var t0 = null, dur = AF.reduceMotion ? 1 : 700;
        function frame(t) {
          if (t0 === null) t0 = t;
          var k = Math.min(1, (t - t0) / dur), v = Math.round(from + (target - from) * k);
          document.getElementById('pool-val').textContent = v + '%';
          document.getElementById('pool-user').textContent = (100 - v) + '%';
          if (k < 1) requestAnimationFrame(frame);
        }
        requestAnimationFrame(frame);
      });
    }
  };

  // ---------- Rightsholder ----------
  var HOLDER = 'Lighthouse Lane Records';
  var WORKS = [
    { id: 'sunny', work: 'Sunny Days', artist: 'Mara Vale', platform: 'SongSpark', gens: 12481, avg: 17.6, rev: 214012 },
    { id: 'salt', work: 'Salt & Honey', artist: 'Mara Vale', platform: 'SongSpark', gens: 8930, avg: 9.1, rev: 148830 },
    { id: 'radio', work: 'Saltwater Radio', artist: 'Mara Vale', platform: 'SongSpark, Melodia', gens: 7214, avg: 8.2, rev: 110275 },
    { id: 'coast', work: 'Coastline Static', artist: 'Remy Oduya', platform: 'Melodia', gens: 5602, avg: 7.4, rev: 90418 },
    { id: 'thunder', work: 'Little Thunder', artist: 'Nina Ortiz', platform: 'SongSpark', gens: 4377, avg: 3.9, rev: 61102 },
    { id: 'harbor', work: 'Harbor Room', artist: 'Ines Arroyo', platform: 'Melodia', gens: 3140, avg: 3.1, rev: 35077 }
  ];
  function workDetail(w) {
    var m = AF.money();
    var match = { sunny: 'Sunny Days', salt: 'Salt & Honey', radio: 'Saltwater Radio', thunder: 'Little Thunder' }[w.id];
    var r = match && m.rh.filter(function (x) { return x.song === match; })[0];
    var releases = r
      ? '<li><span><b>' + T.title + '</b> · ' + T.user + ' · ' + r.pct + '% influence</span><b>' + usd(r.rec) + '</b></li>' +
        '<li><span><b>Coastline Static</b> · Remy Oduya · 14% influence</span><b>$212.40</b></li>' +
        '<li><span><b>Summer Arcade</b> · Lio Banks · 9% influence</span><b>$96.15</b></li>'
      : '<li><span><b>Summer Arcade</b> · Lio Banks · 6% influence</span><b>$64.10</b></li>';
    return '<div class="work-detail reveal"><p class="big-p"><b>“' + w.work + '” influenced ' + num(w.gens) + ' generations this month.</b></p>' +
      '<p class="muted small">' + w.artist + ' · average influence ' + w.avg + '% · AI platforms: ' + w.platform + '</p>' +
      '<h4>Released AI songs it influenced, and your recording share from their streams</h4><ul class="mini-list">' + releases + '</ul>' +
      (r ? '<p class="muted small">For “' + T.title + '”, ' + HOLDER + ' gets the recording half of this song’s share; the songwriting half goes to ' + r.publisher + '.</p>' : '') + '</div>';
  }
  V.rightsholder = {
    role: 'rightsholder',
    html: function () {
      var m = AF.money();
      var mine = m.payees.filter(function (p) { return p.name === HOLDER; })[0];
      return dashHead('store', HOLDER + ' · Rightsholder', 'Influence royalties from streaming',
          'Which of your works shape released AI songs, and what their streams pay you.') +
        '<div class="aha light">' + icon('headphones') + '<p><b>Downstream money only.</b> This view covers influence royalties: money from streams of AI songs that were released, paid from each song’s AI influence royalty pool. ' +
        'Training royalties, paid when your catalog is licensed to train an AI model, are a separate stream and aren’t shown here.</p></div>' +
        metrics([
          AF.metric('Works detected as influential', '214', 'in released AI songs', 'note'),
          AF.metric('AI generations attributed', '48,902', 'this month', 'flow'),
          AF.metric('Released AI songs using your works', '1,377', null, 'store'),
          AF.metric('Influence royalties from streaming', '$6,812.40', 'accrued this month', 'cash')
        ]) +
        '<div class="grid2 wide-left">' +
        '<section class="card"><div class="card-head"><h3>Catalog works</h3><span class="muted">Tap a work</span></div>' +
        '<div class="table-wrap"><table class="table click"><thead><tr><th>Catalog work</th><th>AI platform</th><th class="num">Generated tracks</th><th class="num">Average influence</th><th class="num">Influence royalties</th></tr></thead><tbody>' +
        WORKS.map(function (w, i) {
          return '<tr tabindex="0" data-work="' + i + '"' + (i === 0 ? ' class="hl"' : '') + '><th scope="row"><b>' + w.work + '</b><small>' + w.artist + '</small></th>' +
            '<td>' + w.platform + '</td><td class="num">' + num(w.gens) + '</td><td class="num">' + w.avg + '%</td><td class="num">' + usd(w.rev) + '</td></tr>';
        }).join('') + '</tbody></table></div></section>' +
        '<section class="card" id="work-detail" aria-live="polite">' + workDetail(WORKS[0]) + '</section></div>' +
        '<section class="card"><div class="card-head"><h3>From “' + T.title + '” this month</h3><span class="muted">' + usd(mine.amt) + ' · ' + mine.songs + ' of your songs influenced it</span></div>' +
        '<p class="muted small">Paid by Fold from the song’s AI influence royalty pool, which rightsholders share 85%. You are one of the song’s ' + AF.RIGHTSHOLDERS + ' rightsholders.</p></section>' +
        releaseStrip();
    },
    mount: function () {
      var rows = document.querySelectorAll('[data-work]');
      function pick(row) {
        Array.prototype.forEach.call(rows, function (r) { r.classList.remove('hl'); });
        row.classList.add('hl');
        document.getElementById('work-detail').innerHTML = workDetail(WORKS[+row.getAttribute('data-work')]);
      }
      Array.prototype.forEach.call(rows, function (r) {
        r.addEventListener('click', function () { pick(r); });
        r.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(r); } });
      });
    }
  };

  // ---------- AI platform ----------
  V.platform = {
    role: 'platform',
    html: function () {
      var models = [
        ['SongSpark v4.2', 'Live', 'Yes', '99.8%', 'On, every generation', '10 rightsholders, current', 'good'],
        ['SongSpark v4.1', 'Retiring 15 Oct', 'Yes', '99.6%', 'On, every generation', '10 rightsholders, current', 'good'],
        ['SongSpark v3.9', 'Retired', 'No', 'n/a', 'Off', 'Not used for new songs', 'neutral']
      ];
      return dashHead('spark', 'SongSpark · AI platform', 'Compliance and attribution',
          'Proof that every song the platform makes can be traced and paid for.') +
        metrics([
          AF.metric('Generations analyzed', '2,418,906', 'this month', 'sparkles'),
          AF.metric('Attribution records created', '2,413,120', '99.8% of generations', 'flow'),
          AF.metric('Catalog works attributed', '31,204', null, 'note'),
          AF.metric('Royalties generated for AI platform', '$8,405.30', 'SongSpark’s 5% of AI influence pools, this month', 'cash')
        ]) +
        '<section class="card"><div class="card-head"><h3>Models</h3><span class="muted">LUMINA attribution installed in each live model</span></div>' +
        '<div class="table-wrap"><table class="table"><thead><tr><th>Model version</th><th>LUMINA installed</th><th class="num">Attribution health</th><th>Fingerprint registration</th><th>Licensed catalog status</th></tr></thead><tbody>' +
        models.map(function (r) {
          return '<tr><th scope="row"><b>' + r[0] + '</b><small>' + r[1] + '</small></th><td>' + AF.pill(r[6], r[2], r[2] === 'Yes' ? 'check' : 'x') + '</td>' +
            '<td class="num">' + r[3] + '</td><td>' + r[4] + '</td><td>' + r[5] + '</td></tr>';
        }).join('') + '</tbody></table></div></section>' +
        '<div class="grid2"><section class="card"><h3>' + icon('note') + ' Licensed catalogs</h3><ul class="status-list">' +
        AF.statusRow('Publishers licensed', '5, current') +
        AF.statusRow('Labels licensed', '5, current') +
        AF.statusRow('Songs available for training', 'All fingerprinted', 'good', 'fingerprint') +
        AF.statusRow('Opt-outs honoured', '1 song removed before training', 'neutral', 'x') +
        '</ul></section>' +
        '<section class="card"><h3>' + icon('flow') + ' ' + T.title + '</h3><p class="muted small">One of this month’s generations, as SongSpark made it.</p>' +
        AF.partsList('created', false) + '</section></div>' +
        releaseStrip();
    }
  };

  // ---------- User ----------
  V.user = {
    role: 'user',
    html: function () {
      var m = AF.money();
      var steps = [
        ['sparkles', 'Generated on SongSpark', T.created],
        ['shield', 'Verified by AttriFlow', 'Passport ' + T.id],
        ['mic', 'Your vocal added, song re-scored', 'AI share ' + m.shareThen + '% → ' + m.aiShare + '% · pool ' + m.poolThen + '% → ' + m.pool + '%'],
        ['upload', 'Distributed by ' + T.distributor, 'AI Green Lane · approved in 1 day'],
        ['headphones', 'Streamed ' + num(m.streams) + ' times', '7 stores · ¼¢ per stream']
      ];
      var flows = [
        ['you', 'You, ' + (100 - m.pool) + '%', m.user],
        ['rh', AF.RIGHTSHOLDERS + ' rightsholders · 85% of the pool', m.rhPool],
        ['dist', T.distributor + ' · 5% of the pool', m.dist],
        ['aip', 'SongSpark · 5% of the pool', m.ai],
        ['fold', 'Fold · 5% of the pool', m.fold]
      ];
      return dashHead('attri', T.user + ' · User', 'My music',
          'My track was generated here, distributed here, streamed here, and this is how the money flowed.') +
        metrics([
          AF.metric('Tracks created', '14', null, 'sparkles'),
          AF.metric('Tracks distributed', '3', null, 'upload'),
          AF.metric('Earnings this month', usd(m.user), (100 - m.pool) + '% of net streaming revenue', 'cash'),
          AF.metric('AI influence royalty pool', usd(m.poolAmt), m.pool + '%, shared with those who influenced the AI parts', 'flow'),
          AF.metric('Human contribution', (100 - m.aiShare) + '%', 'Re-scored at distribution · ' + (100 - m.shareThen) + '% at creation', 'user')
        ]) +
        '<div class="grid2 wide-left"><section class="card"><h3>' + T.title + ': the whole story</h3><ol class="timeline">' +
        steps.map(function (s) { return '<li><span class="tl-ico">' + icon(s[0]) + '</span><div><b>' + s[1] + '</b><span class="muted">' + s[2] + '</span></div></li>'; }).join('') +
        '</ol></section>' +
        '<section class="card"><h3>' + icon('cash') + ' How the money flowed</h3><p class="muted small">Net streaming revenue this month: <b>' + usd(m.net) + '</b></p>' +
        '<ul class="split-legend">' + flows.map(function (f) {
          return '<li><span class="dot ' + f[0] + '"></span><span class="lg-name">' + f[1] + '</span><span></span><span class="lg-amt">' + usd(f[2]) + '</span></li>';
        }).join('') + '</ul>' +
        '<div class="sum small">' + flows.map(function (f) { return usd(f[2]); }).join(' + ') + ' = ' + usd(m.counted) + ' ' +
        (m.counted === m.net ? icon('check', 'ok') : icon('alert', 'warn')) + '</div></section></div>' +
        '<section class="card"><h3>Store status</h3>' + AF.dspGrid() + '</section>' +
        releaseStrip();
    }
  };

  // ---------- Fold ----------
  var DISTRIBUTORS = [
    { name: T.distributor, releases: 412, pools: 2255503 },
    { name: 'Northwind Music Distribution', releases: 263, pools: 1344628 },
    { name: 'Pressline Digital', releases: 147, pools: 737374 }
  ];
  V.fold = {
    role: 'fold',
    html: function () {
      var m = AF.money(), s = AF.POOL_SPLIT;
      var rows = DISTRIBUTORS.map(function (d) {
        var p = AF.allocate(d.pools, [s.rh, s.dist, s.ai, s.fold]);
        return { name: d.name, releases: d.releases, pools: d.pools, kept: p[1], received: d.pools - p[1], rh: p[0], ai: p[2], fold: p[3] };
      });
      function total(k) { return rows.reduce(function (a, r) { return a + r[k]; }, 0); }
      var steps = [
        ['flow', 'AI influence royalty pool', m.pool + '% of ' + usd(m.net) + ' net streaming revenue', m.poolAmt],
        ['store', T.distributor + ' keeps its Green Lane share', '5% of the pool', m.dist],
        ['download', 'Received by Fold', '95% of the pool', m.toFold],
        ['users', 'Fold pays ' + AF.RIGHTSHOLDERS + ' rightsholders', '85% of the pool', m.rhPool],
        ['sparkles', 'Fold pays SongSpark', '5% of the pool', m.ai],
        ['shield', 'Fold keeps its AttriFlow share', '5% of the pool', m.fold]
      ];
      var check = m.rhPool + m.ai + m.fold;
      return dashHead('attri', 'Fold · AttriFlow', 'AI influence royalty pools',
          'Distributors send each song’s pool to Fold, less their own 5%. Fold keeps 5% and pays the rightsholders and the AI platforms.') +
        metrics([
          AF.metric('Pools reported this month', usd(total('pools')), rows.length + ' distributors · ' + num(total('releases')) + ' releases', 'flow'),
          AF.metric('Received from distributors', usd(total('received')), '95% of the pools', 'download'),
          AF.metric('Paid to rightsholders', usd(total('rh')), '85% of the pools', 'users'),
          AF.metric('Paid to AI platforms', usd(total('ai')), '5% of the pools', 'sparkles'),
          AF.metric('Kept by Fold', usd(total('fold')), '5% of the pools', 'shield')
        ]) +
        '<section class="card"><div class="card-head"><h3>Received from distributors</h3><span class="muted">This month · illustrative</span></div>' +
        '<div class="table-wrap"><table class="table"><thead><tr><th>Distributor</th><th class="num">Releases</th><th class="num">Pools</th><th class="num">Kept by distributor (5%)</th><th class="num">Received by Fold (95%)</th></tr></thead><tbody>' +
        rows.map(function (r) {
          return '<tr><th scope="row"><b>' + r.name + '</b></th><td class="num">' + num(r.releases) + '</td><td class="num">' + usd(r.pools) + '</td><td class="num">' + usd(r.kept) + '</td><td class="num"><b>' + usd(r.received) + '</b></td></tr>';
        }).join('') + '</tbody></table></div></section>' +
        '<div class="grid2">' +
        '<section class="card"><h3>' + icon('flow') + ' ' + T.title + ': one pool, end to end</h3><ol class="timeline">' +
        steps.map(function (x) {
          return '<li><span class="tl-ico">' + icon(x[0]) + '</span><div><b>' + x[1] + ' · ' + usd(x[3]) + '</b><span class="muted">' + x[2] + '</span></div></li>';
        }).join('') + '</ol>' +
        '<div class="sum small">Received ' + usd(m.toFold) + ' = ' + usd(m.rhPool) + ' + ' + usd(m.ai) + ' + ' + usd(m.fold) + ' ' +
        (check === m.toFold ? icon('check', 'ok') : icon('alert', 'warn')) + '</div></section>' +
        '<section class="card"><div class="card-head"><h3>Payouts for ' + T.title + '</h3><span class="muted">Scheduled 1 Nov 2026</span></div>' +
        AF.payeeTable(m) +
        '<ul class="mini-list" style="margin-top:10px"><li><span>SongSpark · AI platform</span><b>' + usd(m.ai) + '</b></li><li><span>Fold · kept</span><b>' + usd(m.fold) + '</b></li></ul></section></div>' +
        releaseStrip();
    }
  };

  // ---------- Welcome ----------
  V[''] = {
    html: function () {
      return '<div class="hero">' +
        '<p class="card-eyebrow">AttriFlow by Fold Artists</p>' +
        '<h1 tabindex="-1">Accept verified AI music</h1>' +
        '<p class="lead">Follow one AI-assisted song from the songs that trained the model to the royalties that reach their owners. Then see what each stakeholder sees.</p>' +
        '<div class="entry">' +
        '<a class="entry-card" href="#/' + AF.SCENES[AF.maxStep()].id + '">' + AF.badge('flow', 'big') +
        '<b>Track journey</b><span>8 steps · about 5 minutes · start here</span></a>' +
        '<a class="entry-card" href="#/dash/distributor">' + AF.badge('chart', 'dist') +
        '<b>Stakeholder dashboards</b><span>User · AI platform · Distributor · Rightsholder · Fold</span></a></div>' +
        '<ol class="events">' + AF.SCENES.map(function (s, i) { return '<li><b>' + (i + 1) + '</b>' + s.event + '</li>'; }).join('') + '</ol>' +
        '</div>';
    }
  };
})();
