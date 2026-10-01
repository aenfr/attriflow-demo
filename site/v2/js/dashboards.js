/* AttriFlow demo v2 — stakeholder dashboards, one per role, behind the "View as" switcher. */
(function () {
  'use strict';
  var AF = window.AF, T = AF.TRACK, icon = AF.icon, usd = AF.usd, num = AF.num;
  var V = AF.VIEWS = AF.VIEWS || {};

  AF.ROLES = [
    { id: 'creator', label: 'Creator' },
    { id: 'platform', label: 'AI Platform' },
    { id: 'distributor', label: 'Distributor' },
    { id: 'rightsholder', label: 'Rightsholder' }
  ];

  // Shown on every dashboard: the release's streams and where its money went.
  function releaseStrip() {
    var m = AF.money();
    var top = AF.DSPS.slice(0, 3);
    var poolTotal = m.rhPool + m.dist + m.ai + m.fold;
    return '<section class="card strip"><div class="card-head"><div class="strip-title">' + AF.cover(T, 'sm') +
      '<div><p class="card-eyebrow">This month · illustrative</p><h3>' + T.title + ' · ' + T.creator + '</h3></div></div>' +
      AF.pill('good', 'Live on 7 stores', 'check') + '</div>' +
      '<div class="strip-grid">' +
      '<div><p class="metric-label">Streams</p><p class="metric-value">' + num(m.streams) + '</p><ul class="mini-list">' +
      top.map(function (d) { return '<li><span>' + d.name + '</span><b>' + num(d.streams) + '</b></li>'; }).join('') +
      '<li class="muted"><span>4 more stores</span><b>' + num(m.streams - top.reduce(function (s, d) { return s + d.streams; }, 0)) + '</b></li></ul></div>' +
      '<div><p class="metric-label">Gross distribution revenue</p><p class="metric-value">' + usd(m.gross) + '</p></div>' +
      '<div><p class="metric-label">Human creator share (' + (100 - m.pool) + '%)</p><p class="metric-value">' + usd(m.user) + '</p></div>' +
      '<div><p class="metric-label">AI influence royalty pool (' + m.pool + '%)</p><p class="metric-value">' + usd(poolTotal) + '</p><ul class="mini-list">' +
      '<li><span><i class="dot rh"></i>Rightsholders ' + m.p.rh + '%</span><b>' + usd(m.rhPool) + '</b></li>' +
      '<li><span><i class="dot dist"></i>Distributor Green Lane ' + m.p.dist + '%</span><b>' + usd(m.dist) + '</b></li>' +
      '<li><span><i class="dot aip"></i>AI platform ' + m.p.ai + '%</span><b>' + usd(m.ai) + '</b></li>' +
      '<li><span><i class="dot fold"></i>Fold ' + m.p.fold + '%</span><b>' + usd(m.fold) + '</b></li></ul></div>' +
      '</div><p class="muted small">AttriFlow sets the pool between 10% and 30% from its weighing of AI and human parts.</p></section>';
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
    { track: 'Midnight Lemonade', artist: 'Sam Rivera', ai: 'Human + AI (71% AI)', prov: 'Verified', rights: 'Clear', dsp: '7 of 8', d: 'green' },
    { track: 'Neon Harbor', artist: 'Kites at Noon', ai: 'Fully AI', prov: 'Verified', rights: 'Clear', dsp: '8 of 8', d: 'green' },
    { track: 'Dust & Static', artist: 'Marlow Fenn', ai: 'Human + AI (55% AI)', prov: 'Verified', rights: 'Clear', dsp: '8 of 8', d: 'green' },
    { track: 'Paper Lanterns', artist: 'Odessa Lune', ai: 'Mostly human (32% AI)', prov: 'Verified', rights: 'Clear', dsp: '8 of 8', d: 'green' },
    { track: 'Velvet Static', artist: 'Unknown uploader', ai: 'Fully AI', prov: 'No record found', rights: 'Unknown', dsp: '3 of 8', d: 'amber' },
    { track: 'Late Night Drive (sped up)', artist: 'drivecore', ai: 'AI, not disclosed', prov: 'Disclosure mismatch', rights: 'Check needed', dsp: '2 of 8', d: 'amber' },
    { track: 'Golden Hour Loop', artist: 'No artist name', ai: 'Fully AI', prov: 'No record found', rights: 'Voice match risk', dsp: '0 of 8', d: 'red' },
    { track: 'Untitled 4471', artist: 'batch-uploader-22', ai: 'Fully AI', prov: 'No record found', rights: 'Mass-upload pattern', dsp: '0 of 8', d: 'red' }
  ];
  var POOL_TRACKS = [
    { name: 'Midnight Lemonade', ai: 71 },
    { name: 'Dust & Static', ai: 55 },
    { name: 'Paper Lanterns', ai: 32 }
  ];
  function poolReadout(pool) {
    var p = AF.POOLS[pool];
    return '<ul class="mini-list">' +
      '<li><span><i class="dot you"></i>Human creator</span><b>' + (100 - pool) + '%</b></li>' +
      '<li><span><i class="dot rh"></i>Rightsholders</span><b>' + p.rh + '%</b></li>' +
      '<li><span><i class="dot dist"></i>Distributor Green Lane</span><b>' + p.dist + '%</b></li>' +
      '<li><span><i class="dot aip"></i>AI platform</span><b>' + p.ai + '%</b></li>' +
      '<li><span><i class="dot fold"></i>Fold</span><b>' + p.fold + '%</b></li></ul>';
  }
  V.distributor = {
    role: 'distributor',
    html: function () {
      var m = AF.money();
      var subRows = SUBS.map(function (s) {
        return '<tr' + (s.track === T.title ? ' class="hl"' : '') + '><th scope="row"><b>' + s.track + '</b><small>' + s.artist + '</small></th>' +
          '<td>' + s.ai + '</td><td>' + s.prov + '</td><td>' + s.rights + '</td><td class="num">' + s.dsp + '</td><td>' + decisionPill(s.d) + '</td></tr>';
      }).join('');
      var payees = [
        [T.creator, 'Human creator', (100 - m.pool) + '%', m.user, 'DropTune pays directly'],
        ['4 rightsholders', 'AI influence royalty', m.p.rh + '%', m.rhPool, 'Fold pays each rightsholder'],
        ['DropTune', 'Distributor Green Lane', m.p.dist + '%', m.dist, 'Kept at source'],
        ['SongSpark', 'AI platform', m.p.ai + '%', m.ai, 'Fold pays'],
        ['Fold', 'AttriFlow', m.p.fold + '%', m.fold, 'Kept by Fold']
      ];
      return dashHead('drop', 'DropTune · Distributor console', 'AI submissions',
          'AttriFlow tells the distributor what it can safely accept, where it can send it, and why.') +
        '<div class="aha">' + icon('shield') + '<p>Today you either reject AI broadly or accept it and inherit the risk. <b>AttriFlow creates a third option: accept verified AI.</b></p></div>' +
        metrics([
          AF.metric('AttriFlow revenue this month', '$18,240.55', 'Your Green Lane share, so far', 'cash'),
          AF.metric('AI submissions today', '1,284', null, 'upload'),
          AF.metric('Green Lane approved today', '1,041', '81% of submissions', 'check'),
          AF.metric('Manual review required', '163', null, 'clock'),
          AF.metric('Held or restricted', '80', null, 'lock'),
          AF.metric('Potential rights issues', '12', null, 'alert')
        ]) +
        '<section class="card"><div class="card-head"><h3>Today’s AI submissions</h3><span class="muted">GREEN distribute · AMBER review · RED hold</span></div>' +
        '<div class="table-wrap"><table class="table"><thead><tr><th>Track</th><th>AI status</th><th>Provenance</th><th>Rights status</th><th class="num">Store eligibility</th><th>Decision</th></tr></thead>' +
        '<tbody>' + subRows + '</tbody></table></div></section>' +
        '<div class="grid2">' +
        '<section class="card"><h3>' + icon('sliders') + ' AI influence pool, set per track</h3>' +
        '<p class="muted small">AttriFlow weighs the AI and human parts, then sets the pool: 30% when mostly AI, down to 10% when mostly human.</p>' +
        '<div class="field"><label for="pool-track">Track</label><select id="pool-track">' +
        POOL_TRACKS.map(function (t, i) { return '<option value="' + i + '">' + t.name + ' (AI ' + t.ai + '%)</option>'; }).join('') + '</select></div>' +
        '<div class="pool-meter big" role="meter" aria-valuemin="0" aria-valuemax="30" aria-valuenow="30" aria-label="AI influence pool" id="pool-meter"><i style="width:100%"></i></div>' +
        '<div class="pool-ticks" aria-hidden="true"><span>10%</span><span>20%</span><span>30%</span></div>' +
        '<p class="pool-readout" aria-live="polite">Pool <b id="pool-val">30%</b> · human creator keeps <b id="pool-user">70%</b></p>' +
        '<div id="pool-split">' + poolReadout(30) + '</div></section>' +
        '<section class="card"><h3>' + icon('shield') + ' Policy engine</h3><p class="muted small">Each store’s AI rules, checked on every release.</p>' +
        '<ul class="status-list">' +
        AF.statusRow('Spotify policy', 'Current') + AF.statusRow('Apple Music policy', 'Current') +
        AF.statusRow('YouTube policy', 'Current') + AF.statusRow('Amazon Music policy', 'Current') +
        AF.statusRow('TikTok policy', 'Current') + AF.statusRow('Store X policy', 'Update pending', 'warn', 'clock') +
        '</ul></section></div>' +
        '<section class="card"><div class="card-head"><h3>Royalty splits and payees · ' + T.title + '</h3><span class="muted">From the Letter of Direction, fingerprints and AttriFlow analysis</span></div>' +
        '<div class="table-wrap"><table class="table"><thead><tr><th>Payee</th><th>Role</th><th class="num">Share</th><th class="num">This month</th><th>Payment route</th></tr></thead><tbody>' +
        payees.map(function (p) { return '<tr><th scope="row">' + p[0] + '</th><td>' + p[1] + '</td><td class="num">' + p[2] + '</td><td class="num">' + usd(p[3]) + '</td><td>' + p[4] + '</td></tr>'; }).join('') +
        '</tbody></table></div><p class="muted small">Payment route is one illustrative option: DropTune pays the creator directly and sends the AI influence pool to Fold, which pays each rightsholder.</p></section>' +
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
          else document.getElementById('pool-split').innerHTML = poolReadout(target);
        }
        requestAnimationFrame(frame);
      });
    }
  };

  // ---------- Rightsholder ----------
  var WORKS = [
    { id: 'sunny', work: 'Sunny Days', artist: 'Mara Vale', platform: 'SongSpark', gens: 12481, avg: 22.4, rev: 214012 },
    { id: 'salt', work: 'Salt & Honey', artist: 'Mara Vale', platform: 'SongSpark', gens: 8930, avg: 17.1, rev: 148830 },
    { id: 'lantern', work: 'Lantern Road', artist: 'The Hollow Pines', platform: 'SongSpark, Melodia', gens: 7214, avg: 15.8, rev: 110275 },
    { id: 'copper', work: 'Copper Sky', artist: 'Ines Arroyo', platform: 'Melodia', gens: 5602, avg: 12.3, rev: 90418 },
    { id: 'north', work: 'Northbound', artist: 'The Hollow Pines', platform: 'SongSpark', gens: 4377, avg: 11.9, rev: 61102 },
    { id: 'ghost', work: 'Ghost Radio', artist: 'Ines Arroyo', platform: 'Melodia', gens: 3140, avg: 9.4, rev: 35077 }
  ];
  function workDetail(w) {
    var m = AF.money(), mara = m.rh[0];
    var releases = w.id === 'sunny'
      ? '<li><span><b>' + T.title + '</b> · ' + T.creator + ' · 40% influence</span><b>' + usd(mara.rec) + '</b></li>' +
        '<li><span><b>Coastline Static</b> · Remy Oduya · 18% influence</span><b>$212.40</b></li>' +
        '<li><span><b>Summer Arcade</b> · Lio Banks · 12% influence</span><b>$96.15</b></li>'
      : '<li><span>Top releases appear here once they earn</span><b></b></li>';
    return '<div class="work-detail reveal"><p class="big-p"><b>“' + w.work + '” influenced ' + num(w.gens) + ' generations this month.</b></p>' +
      '<p class="muted small">' + w.artist + ' · average influence ' + w.avg + '% · AI platforms: ' + w.platform + '</p>' +
      '<h4>Commercial releases using it</h4><ul class="mini-list">' + releases + '</ul>' +
      (w.id === 'sunny' ? '<p class="muted small">For “' + T.title + '”, Lighthouse Lane Records gets the recording half of Mara Vale’s 40% share; the songwriting half goes to Brightleaf Songs.</p>' : '') + '</div>';
  }
  V.rightsholder = {
    role: 'rightsholder',
    html: function () {
      return dashHead('store', 'Lighthouse Lane Records · Rightsholder', 'Your catalog in AI music',
          'Which of your works shape AI songs, and what they earn.') +
        metrics([
          AF.metric('Works detected as influential', '214', 'of 3,912 licensed works', 'note'),
          AF.metric('AI generations attributed', '48,902', 'this month', 'flow'),
          AF.metric('Commercial releases using them', '1,377', null, 'store'),
          AF.metric('AI influence royalties accrued', '$6,812.40', 'this month', 'cash')
        ]) +
        '<div class="grid2 wide-left">' +
        '<section class="card"><div class="card-head"><h3>Catalog works</h3><span class="muted">Tap a work</span></div>' +
        '<div class="table-wrap"><table class="table click"><thead><tr><th>Catalog work</th><th>AI platform</th><th class="num">Generated tracks</th><th class="num">Average influence</th><th class="num">Revenue attributed</th></tr></thead><tbody>' +
        WORKS.map(function (w, i) {
          return '<tr tabindex="0" data-work="' + i + '"' + (i === 0 ? ' class="hl"' : '') + '><th scope="row"><b>' + w.work + '</b><small>' + w.artist + '</small></th>' +
            '<td>' + w.platform + '</td><td class="num">' + num(w.gens) + '</td><td class="num">' + w.avg + '%</td><td class="num">' + usd(w.rev) + '</td></tr>';
        }).join('') + '</tbody></table></div></section>' +
        '<section class="card" id="work-detail" aria-live="polite">' + workDetail(WORKS[0]) + '</section></div>' +
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
        ['SongSpark v4.2', 'Live', 'Yes', '99.8%', 'On, every generation', '4 catalogs, current', 'good'],
        ['SongSpark v4.1', 'Retiring 15 Oct', 'Yes', '99.6%', 'On, every generation', '4 catalogs, current', 'good'],
        ['SongSpark v3.9', 'Retired', 'No', 'n/a', 'Off', 'Not used for new songs', 'neutral']
      ];
      return dashHead('spark', 'SongSpark · AI platform', 'Compliance and attribution',
          'Proof that every song the platform makes can be traced and paid for.') +
        metrics([
          AF.metric('Generations analyzed', '2,418,906', 'this month', 'sparkles'),
          AF.metric('Attribution records created', '2,413,120', '99.8% of generations', 'flow'),
          AF.metric('Catalog works attributed', '31,204', null, 'note'),
          AF.metric('Royalties generated', '$142,880.17', 'for rightsholders, this month', 'cash')
        ]) +
        '<section class="card"><div class="card-head"><h3>Models</h3><span class="muted">LUMINA attribution installed in each live model</span></div>' +
        '<div class="table-wrap"><table class="table"><thead><tr><th>Model version</th><th>LUMINA installed</th><th class="num">Attribution health</th><th>Fingerprint registration</th><th>Licensed catalog status</th></tr></thead><tbody>' +
        models.map(function (r) {
          return '<tr><th scope="row"><b>' + r[0] + '</b><small>' + r[1] + '</small></th><td>' + AF.pill(r[6], r[2], r[2] === 'Yes' ? 'check' : 'x') + '</td>' +
            '<td class="num">' + r[3] + '</td><td>' + r[4] + '</td><td>' + r[5] + '</td></tr>';
        }).join('') + '</tbody></table></div></section>' +
        '<div class="grid2"><section class="card"><h3>' + icon('note') + ' Licensed catalogs</h3><ul class="status-list">' +
        AF.statusRow('Lighthouse Lane Records', 'Current · renews Mar 2027') +
        AF.statusRow('Northstar Songs', 'Current') +
        AF.statusRow('Tidewater Tunes', 'Current') +
        AF.statusRow('Copper Kite Music', 'Current') +
        AF.statusRow('Opt-outs honoured', '1 work removed before training', 'neutral', 'x') +
        '</ul></section>' +
        '<section class="card"><h3>' + icon('flow') + ' ' + T.title + '</h3><p class="muted small">One of this month’s generations, from creation to payout.</p>' +
        AF.partsList(false) + '</section></div>' +
        releaseStrip();
    }
  };

  // ---------- Creator ----------
  V.creator = {
    role: 'creator',
    html: function () {
      var m = AF.money();
      var steps = [
        ['sparkles', 'Generated on SongSpark', T.created],
        ['shield', 'Verified by AttriFlow', 'Passport ' + T.id],
        ['upload', 'Distributed by DropTune', 'AI Green Lane · approved in 1 day'],
        ['headphones', 'Streamed ' + num(m.streams) + ' times', '7 stores'],
        ['cash', 'Money flowed', 'You ' + usd(m.user) + ' · rightsholders ' + usd(m.rhPool) + ' · DropTune ' + usd(m.dist) + ' · SongSpark ' + usd(m.ai) + ' · Fold ' + usd(m.fold)]
      ];
      return dashHead('drop', 'Sam Rivera · Creator', 'My music',
          'My track was generated here, distributed here, streamed here, and this is how the money flowed.') +
        metrics([
          AF.metric('Tracks created', '14', null, 'sparkles'),
          AF.metric('Tracks distributed', '3', null, 'upload'),
          AF.metric('Earnings this month', usd(m.user), 'Midnight Lemonade', 'cash'),
          AF.metric('AI influence royalties allocated', usd(m.rhPool + m.dist + m.ai + m.fold), m.pool + '% pool', 'flow'),
          AF.metric('Human contribution', (100 - m.aiShare) + '%', 'Percussion + 25% of composition', 'user')
        ]) +
        '<div class="grid2 wide-left"><section class="card"><h3>' + T.title + ': the whole story</h3><ol class="timeline">' +
        steps.map(function (s) { return '<li><span class="tl-ico">' + icon(s[0]) + '</span><div><b>' + s[1] + '</b><span class="muted">' + s[2] + '</span></div></li>'; }).join('') +
        '</ol></section>' +
        '<section class="card"><h3>Store status</h3>' + AF.dspGrid() + '</section></div>' +
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
        '<b>Stakeholder dashboards</b><span>Creator · AI platform · Distributor · Rightsholder</span></a></div>' +
        '<ol class="events">' + AF.SCENES.map(function (s, i) { return '<li><b>' + (i + 1) + '</b>' + s.event + '</li>'; }).join('') + '</ol>' +
        '</div>';
    }
  };
})();
