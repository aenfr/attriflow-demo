/* AttriFlow demo v2 — the Track Journey: seven steps, each named after what happens to the song. */
(function () {
  'use strict';
  var AF = window.AF, T = AF.TRACK, icon = AF.icon, esc = AF.esc, usd = AF.usd;

  function st() { return AF.state; }
  function done(key) { AF.state[key] = true; AF.save(); AF.refreshChrome(); }

  AF.SCENES = [
    { id: 'train', label: 'Train', event: 'Songs licensed' },
    { id: 'create', label: 'Create', event: 'Song generated' },
    { id: 'verify', label: 'Verify', event: 'Verified & downloaded' },
    { id: 'submit', label: 'Submit', event: 'Song re-scored' },
    { id: 'greenlane', label: 'Green Lane', event: 'Approved' },
    { id: 'stream', label: 'Stream', event: 'Song streamed' },
    { id: 'pay', label: 'Pay', event: 'Revenue allocated' }
  ];
  AF.GATES = {
    train: function () { return true; },
    create: function () { return st().generated; },
    verify: function () { return st().downloaded; },
    submit: function () { return st().analyzed; },
    greenlane: function () { return st().approved; },
    stream: function () { return st().streamed; },
    pay: function () { return true; }
  };
  AF.HINTS = {
    train: ['', 'Next: Sam makes a song with AI.'],
    create: ['Upload your vocal, then tap “Generate”.', 'Song generated. Next: check if it’s authorized for download.'],
    verify: ['Sign the Letter of Direction, then download the song.', 'Downloaded. Next: upload it to a distributor.'],
    submit: ['Upload the song, then submit the release.', 'Release confirmed. Next: the distribution decision.'],
    greenlane: ['Choose whether to use the AI Green Lane.', 'Approved. Next: the release goes live.'],
    stream: ['Tap “Jump to end of month”.', 'Next: where the money goes.'],
    pay: ['', 'Next: your dashboard.']
  };
  AF.maxStep = function () {
    for (var i = 0; i < AF.SCENES.length; i++) if (!AF.GATES[AF.SCENES[i].id]()) return i;
    return AF.SCENES.length - 1;
  };

  var V = AF.VIEWS = AF.VIEWS || {};
  var top = function () { return AF.CATALOG.slice(0, AF.TOP); };
  var rest = function () { return AF.CATALOG.slice(AF.TOP); };

  // ---------- 1. Train (behind the scenes) ----------
  V.train = {
    step: 0,
    html: function () {
      var o = AF.OPTED_OUT;
      var cards = top().map(function (c) {
        return '<li class="cat-card">' + AF.cover(c, 'sm') +
          '<div class="cat-name"><b>' + c.song + '</b><span>' + c.artist + '</span>' +
          '<span class="chips">' + AF.pill('good', 'Licensed', 'check') + AF.pill('neutral', 'Gradient signature extracted', 'wave') + '</span></div>' +
          AF.playBtn(c.id, 'play-sm') + '</li>';
      }).join('') +
        '<li class="cat-more">' + icon('note') + '<span>+ ' + rest().length + ' more licensed songs from the same ' + AF.RIGHTSHOLDERS + ' rightsholders</span></li>' +
        '<li class="cat-card off">' + AF.cover(o, 'sm') +
        '<div class="cat-name"><b>' + o.song + '</b><span>' + o.artist + '</span>' +
        '<span class="chips">' + AF.pill('neutral', 'Opted out · never used', 'x') + '</span></div></li>';
      var right =
        '<section class="card train-card illustrative"><p class="ribbon">' + icon('search') + 'Behind the scenes · users never see this step</p>' +
        '<div class="train-grid">' +
        '<div><p class="card-eyebrow">Licensed catalog</p><ul class="cat-list">' + cards + '</ul></div>' +
        '<div class="train-arrow" aria-hidden="true">' + icon('arrow') + '</div>' +
        '<div class="model-card">' + AF.logo('spark') + '<h3>SongSpark model v4.2</h3>' +
        '<p class="muted">An AI music app. It learns only from songs whose owners said yes.</p>' +
        '<ul class="status-list">' +
        AF.statusRow('Training set', AF.CATALOG.length + ' licensed songs') +
        AF.statusRow('Rightsholders', String(AF.RIGHTSHOLDERS), 'good', 'users') +
        AF.statusRow('Gradient signatures', 'Extracted for every song', 'good', 'wave') +
        AF.statusRow('LUMINA attribution', 'Installed', 'good', 'flow') +
        AF.statusRow('Opted-out song', 'Never used', 'neutral', 'x') +
        '</ul></div></div></section>';
      return AF.stage(1, 'Behind the scenes', 'Real songs go into training, with permission',
        ['This happens long before Sam arrives, so users never see it. It shows where the AI’s musical knowledge comes from.',
         'Only songs whose owners said yes are used. Each one has its <b>gradient signature extracted</b>, so its influence can be traced later in any AI song.'],
        right, 'licensed catalogs · gradient signature extraction');
    }
  };

  // ---------- 2. Create ----------
  function cocreate(when, dark) {
    var w = when === 'now' ? 'now' : 'created';
    var ai = AF.recordingShare(w), all = AF.aiShare(w);
    return '<div class="cocreate' + (dark ? ' dark' : '') + '">' +
      '<div class="cocreate-head"><span class="cocreate-title">Recording</span><b>AI ' + ai + '% · Human ' + (100 - ai) + '%</b>' +
      '<button type="button" class="info-btn" data-info aria-expanded="false" aria-label="How AttriFlow weighs the parts">i</button></div>' +
      '<span class="part-mix big" role="img" aria-label="Recording: AI ' + ai + '%, human ' + (100 - ai) + '%"><i class="ai" style="width:' + ai + '%"></i><i class="human" style="width:' + (100 - ai) + '%"></i></span>' +
      '<p class="cocreate-note">The recording (vocals, lead guitar, percussion and production) is ' + ai + '% AI and ' + (100 - ai) + '% human.</p>' +
      '<div class="info-pop" hidden><p>Each part counts by how much it shapes the song: ' +
      AF.PARTS.map(function (p) { return p.name.toLowerCase() + ' ' + Math.round(p.weight * 100) + '%'; }).join(', ') + '. ' +
      'AttriFlow multiplies each part’s AI share by its weight and adds them up. With the composition included, the whole song is ' + all + '% AI. ' +
      'That sets the AI influence royalty pool, and it is checked again when the song reaches a distributor.</p><a href="#" data-method>More information</a></div></div>';
  }
  function partsList(when, dark, withTotal) {
    return '<ul class="parts' + (dark ? ' dark' : '') + '">' + AF.PARTS.map(function (p) {
      var now = when === 'now';
      var kind = now && p.kindNow ? p.kindNow : p.kind, label = now && p.labelNow ? p.labelNow : p.label;
      var tone = AF.partTone(kind);
      return '<li class="part"><span class="part-ico ' + tone + '">' + icon(AF.partIcon(p.name)) + '</span>' +
        '<span class="part-name">' + p.name + '</span>' +
        (kind === 'mix'
          ? '<span class="part-mix" role="img" aria-label="AI ' + p.ai + '%, human ' + (100 - p.ai) + '%"><i class="ai" style="width:' + p.ai + '%"></i><i class="human" style="width:' + (100 - p.ai) + '%"></i></span>'
          : '') +
        '<span class="pill ' + tone + '">' + label + '</span></li>';
    }).join('') + '</ul>' + (withTotal ? cocreate(when, dark) : '');
  }
  AF.partsList = partsList;
  function infRow(c) {
    return '<li class="inf">' + AF.cover(c, 'sm') +
      '<div class="inf-name"><b>' + c.song + '</b><span class="muted">' + c.artist + '</span>' +
      '<div class="bar" aria-hidden="true"><i data-w="' + (c.pct / AF.CATALOG[0].pct * 100).toFixed(1) + '"></i></div></div>' +
      '<div class="pct">' + c.pct + '%</div></li>';
  }
  function influenceList() {
    return '<ul class="inf-list">' + top().map(infRow).join('') + '</ul>' +
      '<details class="show-all"><summary>Show all ' + AF.CATALOG.length + ' songs</summary>' +
      '<ul class="inf-mini">' + rest().map(function (c) {
        return '<li><span><b>' + c.song + '</b> · ' + c.artist + '</span><span>' + c.pct + '%</span></li>';
      }).join('') + '</ul></details>';
  }
  function growBars(root) {
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        Array.prototype.forEach.call(root.querySelectorAll('[data-w]'), function (i) { i.style.width = i.getAttribute('data-w') + '%'; });
      });
    });
  }
  function createResult() {
    return '<div class="song-card reveal">' + AF.cover(T) +
      '<div class="song-meta"><h2>' + T.title + '</h2><p class="muted">Made by ' + T.user + ' with SongSpark · ' + T.length + ' · ' + T.bpm + ' BPM · ' + T.key + '</p>' +
      '<div class="wave" data-wave aria-hidden="true"></div></div>' + AF.playBtn('main') + '</div>' +
      '<div class="gen-panels reveal">' +
      '<div class="inspired"><h3>AI Profile</h3><p class="muted">You uploaded the vocal. The AI made the rest.</p>' + partsList('created', true, true) + '</div>' +
      '<div class="inspired"><h3>LUMINA attribution record</h3><p class="muted">' + AF.CATALOG.length + ' licensed songs shaped the AI parts. The top ' + AF.TOP + ':</p>' + influenceList() + '</div>' +
      '</div>';
  }
  // The human part starts empty: Sam uploads it (mocked) before the AI can build the song around it.
  function refRow(state) {
    if (state === 'empty') {
      return '<div class="upload-row empty"><span class="part-ico human">' + icon('mic') + '</span>' +
        '<div class="upload-text"><b>Add your own part</b><span>Upload a vocal or instrument you recorded. The AI builds the song around it.</span></div>' +
        '<button type="button" class="btn btn-secondary" id="upload-ref">' + icon('upload') + 'Upload audio reference</button></div>';
    }
    if (state === 'loading') {
      return '<div class="upload-row loading"><span class="spinner" aria-hidden="true"></span>' +
        '<div class="upload-text"><b>Uploading ' + T.upload + '…</b><span class="up-prog" aria-hidden="true"><i></i></span></div></div>';
    }
    return '<div class="upload-row reveal"><span class="part-ico human">' + icon('mic') + '</span>' +
      '<div class="upload-text"><b>Your part: ' + T.upload + '</b><span>Your lead vocal · ' + T.uploadSize + ' · the AI builds the song around it</span></div>' +
      AF.pill('human', 'Human', 'user') + '</div>';
  }
  V.create = {
    step: 1,
    html: function () {
      var body =
        '<h2 class="spark-title">What song do you want to <span class="spark-grad">make</span> today?</h2>' +
        '<div class="prompt-box"><label for="prompt">Describe your song</label>' +
        '<textarea id="prompt" rows="2">' + esc(T.prompt) + '</textarea>' +
        '<div class="param-row">' +
        '<span class="param">BPM <b>' + T.bpm + '</b></span><span class="param">Key <b>' + T.key + '</b></span>' +
        '<span class="param">Vocals <b>Your upload</b></span><span class="param">Length <b>' + T.length + '</b></span></div>' +
        '<div id="ref-slot" aria-live="polite">' + refRow(st().refUploaded ? 'done' : 'empty') + '</div>' +
        '<div class="prompt-row"><span class="muted small">SongSpark Plus</span>' +
        '<button type="button" class="btn btn-spark btn-big" id="generate"' + (st().refUploaded ? '' : ' disabled') + '>' + icon('sparkles') + 'Generate</button></div></div>' +
        '<div id="gen-out" aria-live="polite">' + (st().generated ? createResult() : '') + '</div>';
      return AF.stage(2, 'SongSpark', 'Make a song together with AI',
        ['Sam uploads a vocal they recorded and types an idea. The AI writes and plays the rest around it.',
         'When the song is ready, two things show up: its <b>AI Profile</b> (which parts are AI and which are human) and its <b>LUMINA attribution record</b> (which real songs influenced the AI parts).'],
        AF.appWindow('spark', 'SongSpark', ['Create', 'Library', 'Release'], 'Create', body), 'LUMINA attribution');
    },
    mount: function () {
      var out = document.getElementById('gen-out');
      if (st().generated) { growBars(out); AF.Wave.paint(out.querySelector('[data-wave]')); }
      var gen = document.getElementById('generate'), up = document.getElementById('upload-ref');
      if (up) up.addEventListener('click', function () {
        var slot = document.getElementById('ref-slot');
        slot.innerHTML = refRow('loading');
        AF.later(function () {
          slot.innerHTML = refRow('done');
          AF.state.refUploaded = true; AF.save(); AF.refreshChrome();
          gen.disabled = false;
          gen.focus();
        }, 1500);
      });
      gen.addEventListener('click', function () {
        var btn = this;
        btn.disabled = true;
        AF.Player.stop();
        var lines = ['Reading your idea…', 'Listening to your vocal…', 'Writing the guitar, drums and synths around it…', 'Scoring influence with LUMINA…'];
        function show(i) {
          out.innerHTML = '<div class="making"><span class="wave-anim" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span><span>' + lines[i] + '</span></div>';
        }
        show(0);
        lines.forEach(function (_, i) { if (i) AF.later(function () { show(i); }, i * 600); });
        AF.later(function () {
          out.innerHTML = createResult();
          growBars(out);
          AF.Wave.paint(out.querySelector('[data-wave]'));
          btn.disabled = false;
          done('generated');
          AF.bringIntoView(out.firstChild);
        }, lines.length * 600);
      });
    }
  };

  // ---------- 3. Verify (and download) ----------
  var LOD_LABELS = ['Rightsholders who influenced the AI parts of my song', T.distributor + ', for Green Lane distribution', 'SongSpark, the AI platform', 'Fold, for AttriFlow'];
  function finderHtml(state) {
    var files = [[T.file, T.fileSize], [T.stems, T.stemsSize]];
    return '<div class="finder reveal" aria-label="Your computer’s Downloads folder">' +
      '<div class="finder-bar"><span class="lights" aria-hidden="true"><i></i><i></i><i></i></span><span class="finder-title">' + icon('folder') + 'Downloads</span></div>' +
      '<div class="finder-body"><div class="finder-side" aria-hidden="true"><p>Favorites</p><span>Desktop</span><span class="on">Downloads</span><span>Music</span><span>Documents</span></div>' +
      '<ul class="finder-files">' + files.map(function (f) {
        return '<li class="file-row new' + (state === 'done' ? ' done' : '') + '">' + icon('file') +
          '<span class="file-name">' + f[0] + '</span><span class="file-size">' + f[1] + '</span>' +
          '<span class="file-prog"><i></i></span></li>';
      }).join('') +
      '<li class="file-row">' + icon('file') + '<span class="file-name">band-photo.jpg</span><span class="file-size">2.1 MB</span></li>' +
      '<li class="file-row">' + icon('file') + '<span class="file-name">lyrics-draft.txt</span><span class="file-size">4 KB</span></li>' +
      '</ul></div></div>';
  }
  function downloadHtml() {
    if (st().downloaded) {
      return '<div class="dl-ready">' + AF.badge('check', 'good') + '<div><b>Downloaded</b><p class="muted">Your song and stems are on your computer.</p></div></div>' + finderHtml('done');
    }
    return '<div class="dl-ready" id="dl-msg"><span class="spinner" aria-hidden="true"></span><div><b>Preparing your download…</b><p class="muted">Attaching the AttriFlow record to the song file.</p></div></div>' +
      '<button type="button" class="btn btn-spark btn-big" id="download" disabled>' + icon('download') + 'Download</button><div id="finder"></div>';
  }
  V.verify = {
    step: 2,
    html: function () {
      var s = st();
      var rows =
        AF.statusRow('AI Profile', 'Complete: AI and human parts recorded') +
        AF.statusRow('LUMINA attribution record', 'Complete', 'good', 'flow') +
        AF.statusRow('Gradient signature', 'Extracted', 'good', 'wave') +
        AF.statusRow('Rightsholders identified', AF.RIGHTSHOLDERS + ' rightsholders behind ' + AF.CATALOG.length + ' songs', 'good', 'users') +
        (s.signed ? AF.statusRow('Letter of Direction', 'E-signed by you') : AF.statusRow('Letter of Direction', 'Waiting for your signature', 'warn', 'pen'));
      var lod = s.signed
        ? '<div class="signed reveal">' + AF.badge('pen', 'good') + '<div><b>Letter of Direction signed</b><p class="muted">Signed by ' + T.user + ' · ' + T.createdShort +
          ', 14:34 UTC. This directs the distributor to retain up to 30% of your net streaming revenues as an AI Influence Royalty for the artists who trained SongSpark.</p></div></div>' +
          '<div class="ready reveal"><ul class="ready-list">' +
          '<li>' + icon('download') + '<span>Download status: <b>Eligible for verified download</b></span></li>' +
          '<li>' + icon('upload') + '<span>Distribution status: <b>Eligible for verified distribution</b></span></li></ul>' +
          '<div class="dl-card" aria-live="polite">' + downloadHtml() + '</div></div>'
        : '<div class="lod"><h3>' + icon('pen') + ' Letter of Direction</h3>' +
          '<p>If “' + T.title + '” earns money from streaming, I direct the digital music distributor to retain up to 30% of the net streaming revenues as an “AI Influence Royalty” to compensate human artists that trained SongSpark.</p>' +
          '<details class="lod-more"><summary>Click here to expand</summary>' +
          '<p>As a condition of downloading “' + T.title + '”, I irrevocably agree that I will direct and authorize any digital music distributor to retain a portion of my net streaming revenues, ' +
          'for the creation of an “AI Influence Royalty” pool, to be paid to the original human artists, writers, and the rightsholders whose works influenced the creation of the AI components of “' + T.title + '”. ' +
          'I acknowledge and agree that such portion will be determined upon analysis of the human vs AI components of “' + T.title + '”, and shall be set between 10-30% of the net streaming revenues.</p></details>' +
          '<button type="button" class="btn btn-spark btn-big" id="sign">' + icon('pen') + 'Sign as ' + T.user + '</button></div>';
      var body = '<h2 class="spark-title">Verification &amp; download readiness</h2>' +
        '<ul class="status-list dark">' + rows + '</ul>' + lod;
      return AF.stage(3, 'SongSpark', 'Check if the song is verified and ready to download',
        ['Before the song leaves SongSpark, AttriFlow records its AI Profile, its influences and the rightsholders behind them.',
         'Sam signs a <b>Letter of Direction</b>: an instruction to the distributor to retain part of the streaming revenue for the artists who influenced the AI parts. Then the song can be downloaded.'],
        AF.appWindow('spark', 'SongSpark', ['Create', 'Library', 'Release'], 'Release', body),
        'LUMINA attribution · AI detection · gradient signature extraction');
    },
    mount: function () {
      var sign = document.getElementById('sign');
      if (sign) {
        sign.addEventListener('click', function () {
          AF.state.signed = true; AF.save();
          AF.rerender();
        });
        return;
      }
      var btn = document.getElementById('download');
      if (!btn) return;
      AF.later(function () {
        document.getElementById('dl-msg').innerHTML = AF.badge('check', 'good') +
          '<div><b>Download has been prepared</b><p class="muted">Your song and stems are now available for download.</p></div>';
        AF.state.prepared = true; AF.save();
        btn.disabled = false;
      }, 1300);
      btn.addEventListener('click', function () {
        btn.disabled = true;
        var f = document.getElementById('finder');
        f.innerHTML = finderHtml('loading');
        AF.bringIntoView(f);
        AF.later(function () {
          Array.prototype.forEach.call(f.querySelectorAll('.file-row.new'), function (r) { r.classList.add('done'); });
          btn.innerHTML = icon('check') + 'Downloaded';
          done('downloaded');
        }, 1800);
      });
    }
  };

  // ---------- 4. Submit: AI flag, re-score, release confirmed ----------
  function weighRow(label, share, pool, now) {
    return '<div class="weigh-row' + (now ? ' is-now' : '') + '"><span class="weigh-label">' + label + '</span>' +
      '<div class="weigh"><span class="w-ai" style="flex:' + share + '">AI ' + share + '%</span><span class="w-human" style="flex:' + (100 - share) + '">Human ' + (100 - share) + '%</span></div>' +
      '<span class="weigh-pool">Pool <b>' + pool + '%</b></span></div>';
  }
  function cmpBar(ai) {
    return '<span class="cmp" role="img" aria-label="AI ' + ai + '%, human ' + (100 - ai) + '%"><i class="ai" style="width:' + ai + '%"></i><i class="human" style="width:' + (100 - ai) + '%"></i></span>';
  }
  function partNum(kind, ai) { return kind === 'human' ? '100% human' : ai + '% AI'; }
  function analysisHtml() {
    var m = AF.money();
    var anyChanged = AF.PARTS.some(function (p) { return p.ai !== p.aiNow; });
    var rows = AF.PARTS.map(function (p) {
      var changed = p.ai !== p.aiNow;
      return '<tr' + (changed ? ' class="hl"' : '') + '><th scope="row"><span class="part-ico ' + AF.partTone(changed && p.kindNow ? p.kindNow : p.kind) + '">' + icon(AF.partIcon(p.name)) + '</span>' + p.name + '</th>' +
        '<td>' + cmpBar(p.ai) + '<span class="cmp-num">' + partNum(p.kind, p.ai) + '</span></td>' +
        '<td>' + cmpBar(p.aiNow) + '<span class="cmp-num">' + partNum(p.kindNow || p.kind, p.aiNow) + '</span></td>' +
        '<td>' + (changed ? AF.pill('warn', 'Re-scored', 'sliders') : AF.pill('good', 'Match', 'check')) + '</td></tr>';
    }).join('');
    var same = m.poolThen === m.pool;
    return '<div class="modal-head good">' + icon('search') + '<h2 id="modal-title">AttriFlow re-scored</h2></div>' +
      '<div class="analysis">' +
      '<section><h3>What we hear now, compared with SongSpark</h3>' +
      '<div class="table-wrap"><table class="table cmp-table"><thead><tr><th>Part</th><th>At SongSpark</th><th>Re-scored now</th><th></th></tr></thead><tbody>' + rows + '</tbody></table></div>' +
      (anyChanged
        ? '<p class="note warn">' + icon('guitar') + '<span>Since you created the song on ' + T.createdShort + ', you replaced the AI <b>lead guitar</b> with your own playing. We re-weighted it from 100% AI to 100% human and re-scored the song.</span></p>'
        : '<p class="note good">' + icon('check') + '<span>Everything matches what SongSpark recorded on ' + T.createdShort + ': your uploaded vocal is human, and the AI parts are unchanged.</span></p>') +
      '</section>' +
      '<section><h3>AI influence royalty pool</h3>' +
      weighRow('At SongSpark', m.shareThen, m.poolThen) + weighRow('AttriFlow re-scored', m.aiShare, m.pool, true) +
      '<div class="tiers">' + [10, 20, 30].map(function (t) {
        return '<div class="tier' + (t === m.pool ? ' on' : '') + '"><b>' + t + '%</b><span>' + (t === 10 ? 'mostly human' : t === 20 ? 'half and half' : 'mostly AI') + '</span></div>';
      }).join('') + '</div>' +
      '<p class="note good">' + icon('cash') + '<span>' + (same
        ? 'You keep <b>' + (100 - m.pool) + '%</b> of your streaming revenue. The AI influence royalty pool stays at <b>' + m.pool + '%</b>, re-confirmed with distributor.'
        : 'Your share of streaming revenue goes up from <b>' + (100 - m.poolThen) + '% to ' + (100 - m.pool) + '%</b>, because more of your song is now human. The AI influence royalty pool is lowered to <b>' + m.pool + '%</b>, re-confirmed with distributor.') +
      '</span></p></section>' +
      '<section><h3>Letter of Direction detected</h3>' +
      '<p class="muted small">You agree to these streaming revenue shares:</p>' +
      '<ul class="split-legend compact">' +
      '<li><span class="dot you"></span><span class="lg-name">You, ' + T.user + '</span><b>' + (100 - m.pool) + '%</b></li>' +
      '<li><span class="dot pool"></span><span class="lg-name">AI influence royalty pool</span><b>' + m.pool + '%</b></li></ul>' +
      '<p class="muted small" style="margin-top:12px">The pool is paid out as follows:</p>' + AF.poolSplit(null, LOD_LABELS) +
      '</section></div>' +
      '<div class="modal-confirm"><p>I agree to this direction: my streaming revenue is reduced by ' + m.pool + '% to fill my AI influence royalty pool.</p>' +
      '<button type="button" class="btn btn-primary btn-big" id="m-done" data-autofocus>' + icon('check') + 'Yes, I agree to this direction</button></div>';
  }
  function submitSummary() {
    var m = AF.money();
    return '<div class="card summary reveal">' + AF.badge('shield', 'good') +
      '<div><b>Congratulations, you are an ethical AI user.</b><p class="muted">Your own lead guitar detected. AttriFlow re-scored “' + T.title + '”: AI ' + m.shareThen + '% → ' + m.aiShare +
      '% · AI influence royalty pool ' + m.poolThen + '% → ' + m.pool + '%, re-confirmed with distributor. Letter of Direction agreed.</p></div></div>';
  }
  function runChecks() {
    AF.modal('<div class="modal-head warn">' + icon('alert') + '<h2 id="modal-title">Your track appears to contain AI</h2></div>' +
      '<p>' + T.distributor + '’s detector found AI-generated sound in “' + T.title + '”. Let’s look at the AI detection results.</p>' +
      '<div class="modal-actions"><button type="button" class="btn btn-primary btn-big" id="m-next" data-autofocus>See AI detection results</button></div>');
    document.getElementById('m-next').addEventListener('click', function () {
      var steps = ['Matching the song’s gradient signature', 'Reading its AttriFlow record from SongSpark', 'Comparing what we hear now with SongSpark’s AI Profile', 'Re-scoring the human and AI parts'];
      AF.modal('<div class="modal-head"><span class="spinner" aria-hidden="true"></span><h2 id="modal-title">Please wait while we check whether your AI song was made ethically…</h2></div>' +
        '<ul class="wait-list" aria-live="polite">' + steps.map(function (s, i) { return '<li data-i="' + i + '">' + icon('check') + '<span>' + s + '</span></li>'; }).join('') + '</ul>');
      steps.forEach(function (_, i) {
        AF.later(function () {
          var li = document.querySelector('.wait-list [data-i="' + i + '"]');
          if (li) li.classList.add('ok');
        }, 650 * (i + 1));
      });
      AF.later(function () {
        AF.modal('<div class="modal-head good">' + icon('shield') + '<h2 id="modal-title">Analysis complete</h2></div>' +
          '<p class="big-p">Your song is partly human and partly AI.</p>' +
          '<p>The AI parts (most of the composition, the percussion and AI-assisted production) were created on <b>' + T.createdShort + '</b> on <b>SongSpark</b>, ' +
          'around the <b>lead vocal you recorded and uploaded</b>. Since then, you replaced the AI lead guitar with <b>your own playing</b>.</p>' +
          '<div class="modal-actions"><button type="button" class="btn btn-primary btn-big" id="m-details" data-autofocus>See the analysis</button></div>');
        document.getElementById('m-details').addEventListener('click', function () {
          AF.modal(analysisHtml(), { wide: true });
          document.getElementById('m-done').addEventListener('click', function () {
            AF.closeModal();
            AF.state.analyzed = true; AF.save();
            AF.rerender();
          });
        });
      }, 650 * (steps.length + 1));
    });
  }
  function songFile(state) {
    if (state === 'empty') {
      return '<div class="file-drop empty">' + icon('upload') + '<div><b>Upload your song</b><span class="muted">WAV or FLAC, up to 200 MB</span></div>' +
        '<button type="button" class="btn btn-secondary" id="upload-song">Choose file</button></div>';
    }
    if (state === 'loading') {
      return '<div class="file-drop loading"><span class="spinner" aria-hidden="true"></span><div><b>Uploading ' + T.finalFile + '…</b><span class="up-prog" aria-hidden="true"><i></i></span></div></div>';
    }
    return '<div class="file-drop reveal">' + icon('file') + '<div><b>' + T.finalFile + '</b><span class="muted">' + T.finalSize + ' · your final mix, with your own lead guitar</span></div>' +
      AF.pill('good', 'Uploaded', 'check') + '</div>';
  }
  V.submit = {
    step: 3,
    html: function () {
      var s = st();
      var body =
        '<h2 class="drop-h">' + (s.analyzed ? 'Confirmation of release' : 'New release') + '</h2>' +
        '<div id="song-slot" aria-live="polite">' + songFile(s.songUploaded ? 'done' : 'empty') + '</div>' +
        '<div class="form grid2">' +
        '<div class="field"><label for="f-title">Song title</label><input id="f-title" value="' + esc(T.title) + '"></div>' +
        '<div class="field"><label for="f-artist">Artist name</label><input id="f-artist" value="' + esc(T.user) + '"></div>' +
        '<div class="field"><label for="f-label">Label</label><input id="f-label" value="Rivera Records (self-released)"></div>' +
        '<div class="field"><label for="f-genre">Genre</label><select id="f-genre"><option>Folk</option><option>Pop</option><option>Dance</option></select></div>' +
        '<div class="field"><label for="f-date">Release date</label><input id="f-date" type="date" value="2026-10-08"></div></div>' +
        '<div class="actions"><button type="button" class="btn btn-primary btn-big" id="submit"' + (s.analyzed || !s.songUploaded ? ' disabled' : '') + '>' +
        (s.analyzed ? icon('check') + 'Submitted' : icon('upload') + 'Submit release') + '</button></div>' +
        '<div id="submit-out" aria-live="polite">' + (s.analyzed ? submitSummary() : '') + '</div>';
      return AF.stage(4, T.distributor, 'Upload to a distributor',
        ['After downloading, Sam replaced the AI lead guitar with their own playing. Now Sam uploads the final mix to <b>' + T.distributor + '</b>.',
         'The detector flags AI. <b>AttriFlow re-scores the song</b> against what SongSpark recorded, finds the new human guitar, and lowers the AI influence royalty pool, re-confirmed with the distributor.'],
        AF.appWindow('drop', T.distributor, ['Releases', 'Earnings', 'Help'], 'Releases', body),
        'AI detection · gradient signature extraction · LUMINA attribution');
    },
    mount: function () {
      var b = document.getElementById('submit'), up = document.getElementById('upload-song');
      if (up) up.addEventListener('click', function () {
        var slot = document.getElementById('song-slot');
        slot.innerHTML = songFile('loading');
        AF.later(function () {
          slot.innerHTML = songFile('done');
          AF.state.songUploaded = true; AF.save();
          b.disabled = false;
          b.focus();
        }, 1500);
      });
      if (b && !st().analyzed) b.addEventListener('click', runChecks);
    }
  };

  // ---------- 5. Green Lane ----------
  var BENEFITS = [
    ['Release faster', 'approved in 1 day, not 7'],
    ['Release with confidence', 'fewer rejections and takedowns'],
    ['Release with pride', 'the artists who influenced you get paid'],
    ['Show it was made ethically', 'to listeners, partners and stores'],
    ['Stand apart', 'from anonymous, mass-made AI uploads'],
    ['Skip royalty disputes', 'payouts happen automatically'],
    ['Skip delays', 'from missing disclosures'],
    ['Keep a tamper-proof record', 'of how your song was made']
  ];
  function dspGrid() {
    return '<ul class="dsp-grid">' + AF.DSPS.map(function (d) {
      return '<li class="' + (d.ok ? 'ok' : 'review') + '">' + icon(d.ok ? 'check' : 'clock') + '<b>' + d.name + '</b><span>' + (d.ok ? 'Eligible' : 'Manual review required') + '</span></li>';
    }).join('') + '</ul>';
  }
  AF.dspGrid = dspGrid;
  function proceedHtml() {
    var s = st();
    if (s.approved) {
      return '<div class="proceed ok reveal">' + AF.badge('check', 'good') + '<div><b>You’re in the AI Green Lane.</b>' +
        '<p class="muted">Release approved in 1 day instead of 7. It goes live on 7 stores; Store X reviews it by hand.</p></div></div>';
    }
    if (s.declined) {
      return '<div class="proceed no reveal">' + AF.badge('x', 'bad') + '<div><b>We’re sorry, as an ethical distributor we can’t distribute your song at this time.</b>' +
        '<p class="muted">Verified AI music goes through the Green Lane only.</p>' +
        '<button type="button" class="btn btn-secondary" id="gl-again">Change my mind</button></div></div>';
    }
    return '<div class="proceed ask"><div><b>Distribute through the AI Green Lane?</b>' +
      '<p class="muted">Green Lane fee: <b>' + usd(AF.GREEN_LANE_FEE) + ', paid once, now</b> (illustrative). This is a release fee. ' +
      'It is separate from the AI influence royalty pool, which comes out of streaming revenue later.</p></div>' +
      '<div class="ask-btns"><button type="button" class="btn btn-secondary" id="gl-no">No</button>' +
      '<button type="button" class="btn btn-green btn-big" id="gl-yes">' + icon('check') + 'Yes, proceed</button></div></div>';
  }
  V.greenlane = {
    step: 4,
    html: function () {
      var body =
        '<div class="decision"><div class="light" aria-hidden="true"><i class="r"></i><i class="a"></i><i class="g on"></i></div>' +
        '<div><p class="card-eyebrow">AttriFlow distribution decision</p><h2>GREEN · Verified for distribution</h2>' +
        '<p class="muted">“' + T.title + '” can go through the AI Green Lane.</p></div></div>' +
        '<div class="lanes"><div class="lane g on"><b>GREEN</b><span>Distribute</span></div><div class="lane a"><b>AMBER</b><span>Review</span></div><div class="lane r"><b>RED</b><span>Hold</span></div></div>' +
        '<h3 class="sub-h">Where it can go</h3>' + dspGrid() +
        '<section class="pitch"><div class="pitch-head">' + AF.badge('shield', 'good') +
        '<h3>' + T.user.split(' ')[0] + ', you’re an artist who uses AI ethically.</h3></div>' +
        '<p>Your song is verified, traceable and fair to the artists who shaped it. You’re one of the artists releasing AI music the right way, and that opens the <b>AttriFlow AI Green Lane</b>.</p>' +
        '<p class="pitch-sub">You can now:</p>' +
        '<ul class="benefits">' + BENEFITS.map(function (b) { return '<li>' + icon('check') + '<span><b>' + b[0] + '</b>: ' + b[1] + '</span></li>'; }).join('') + '</ul></section>' +
        '<div id="proceed" aria-live="polite">' + proceedHtml() + '</div>';
      return AF.stage(5, T.distributor, 'Accept verified AI',
        ['Today a distributor either rejects AI music broadly, or accepts it and inherits the risk.',
         'AttriFlow adds a third option: <b>accept verified AI</b>. GREEN goes out, AMBER gets a human review, RED is held.'],
        AF.appWindow('drop', T.distributor, ['Releases', 'Earnings', 'Help'], 'Releases', body),
        'store policy engine · AttriFlow record');
    },
    mount: function () {
      var box = document.getElementById('proceed');
      function wire() {
        var yes = document.getElementById('gl-yes'), no = document.getElementById('gl-no'), again = document.getElementById('gl-again');
        if (yes) yes.addEventListener('click', checkout);
        if (no) no.addEventListener('click', function () { AF.state.declined = true; AF.save(); box.innerHTML = proceedHtml(); wire(); });
        if (again) again.addEventListener('click', function () { AF.state.declined = false; AF.save(); box.innerHTML = proceedHtml(); wire(); });
      }
      function checkout() {
        AF.modal('<div class="modal-head">' + icon('store') + '<h2 id="modal-title">Checkout</h2></div>' +
          '<dl class="fields one"><div><dt>Item</dt><dd>AI Green Lane release fee</dd></div><div><dt>Song</dt><dd>' + T.title + '</dd></div>' +
          '<div><dt>Fee</dt><dd>' + usd(AF.GREEN_LANE_FEE) + ', paid once, now</dd></div><div><dt>Pay with</dt><dd>Your DropTune balance</dd></div></dl>' +
          '<p class="muted small">Separate from the AI influence royalty pool. This is a demo: nothing is charged.</p>' +
          '<div class="modal-actions"><button type="button" class="btn btn-secondary" id="m-cancel">Cancel</button>' +
          '<button type="button" class="btn btn-green btn-big" id="m-pay" data-autofocus>' + icon('lock') + 'Pay ' + usd(AF.GREEN_LANE_FEE) + '</button></div>');
        document.getElementById('m-cancel').addEventListener('click', AF.closeModal);
        document.getElementById('m-pay').addEventListener('click', function () {
          AF.closeModal();
          AF.state.approved = true; AF.state.declined = false; AF.save();
          box.innerHTML = proceedHtml();
          AF.refreshChrome();
        });
      }
      wire();
    }
  };

  // ---------- 6. Stream ----------
  function flowHtml() {
    var nodes = [['spark', 'SongSpark', 'made it'], ['attri', 'AttriFlow', 'verified it'], ['drop', T.distributor, 'distributed it'], ['store', '7 stores', 'stream it']];
    return '<ol class="flow">' + nodes.map(function (n, i) {
      return '<li>' + (n[0] === 'store' ? '<span class="flow-store">' + icon('store') + '</span>' : AF.logo(n[0])) +
        '<b>' + n[1] + '</b><span>' + n[2] + '</span></li>' + (i < nodes.length - 1 ? '<li class="flow-arrow" aria-hidden="true">' + icon('arrow') + '</li>' : '');
    }).join('') + '</ol>';
  }
  AF.flowHtml = flowHtml;
  V.stream = {
    step: 5,
    html: function () {
      var s = st(), m = AF.money(), max = AF.DSPS[0].streams;
      var rows = AF.DSPS.filter(function (d) { return d.ok; }).map(function (d) {
        return '<li class="dsp-row"><b>' + d.name + '</b><span class="dsp-bar"><i data-w="' + (d.streams / max * 100).toFixed(1) + '"' +
          (s.streamed ? ' style="width:' + (d.streams / max * 100).toFixed(1) + '%"' : '') + '></i></span>' +
          '<span class="dsp-num" data-to="' + d.streams + '">' + (s.streamed ? AF.num(d.streams) : '0') + '</span></li>';
      }).join('');
      var right =
        '<section class="card"><div class="live-head">' + AF.pill('good', 'Release is live', 'check') + '<span class="muted">' + T.title + ' · ' + T.user + '</span></div>' + flowHtml() + '</section>' +
        '<section class="card"><div class="card-head"><h3>Streams this month</h3><span class="muted">Total <b id="total-streams">' + (s.streamed ? AF.num(m.streams) : '0') + '</b></span></div>' +
        '<ul class="dsp-rows">' + rows + '</ul>' +
        '<div class="actions"><button type="button" class="btn btn-primary btn-big" id="jump"' + (s.streamed ? ' disabled' : '') + '>' +
        (s.streamed ? icon('check') + 'Month finished' : icon('forward') + 'Jump to end of month') + '</button></div></section>';
      return AF.stage(6, 'Streaming stores', 'The release goes live',
        ['The song moves from the AI app, through AttriFlow and the distributor, to the stores.',
         'Streams start to add up. AttriFlow keeps the link between every stream and the song’s attribution.'],
        right, 'AttriFlow record · gradient signatures');
    },
    mount: function () {
      var b = document.getElementById('jump');
      if (!b || st().streamed) return;
      b.addEventListener('click', function () {
        b.disabled = true;
        Array.prototype.forEach.call(document.querySelectorAll('.dsp-bar i'), function (i) { i.style.width = i.getAttribute('data-w') + '%'; });
        Array.prototype.forEach.call(document.querySelectorAll('.dsp-num'), function (el) { AF.countUp(el, +el.getAttribute('data-to'), 1600); });
        AF.countUp(document.getElementById('total-streams'), AF.money().streams, 1600, AF.num, function () {
          b.innerHTML = icon('check') + 'Month finished';
          done('streamed');
        });
      });
    }
  };

  // ---------- 7. Pay ----------
  AF.payeeTable = function (m) {
    return '<div class="table-wrap"><table class="table"><thead><tr><th>Rightsholder</th><th>Side</th><th class="num">Songs</th><th class="num">Paid</th></tr></thead><tbody>' +
      m.payees.map(function (p) {
        return '<tr><th scope="row"><b>' + p.name + '</b></th><td>' + p.side + '</td><td class="num">' + p.songs + '</td><td class="num">' + usd(p.amt) + '</td></tr>';
      }).join('') + '</tbody></table></div>';
  };
  AF.songTable = function (m, open) {
    return (open ? '' : '<details class="show-all"><summary>Show all ' + AF.CATALOG.length + ' songs</summary>') + '<div class="table-wrap"><table class="table">' +
      '<thead><tr><th>Song</th><th class="num">Influence</th><th class="num">Publishing (50%)</th><th class="num">Recording (50%)</th><th class="num">Total</th></tr></thead><tbody>' +
      m.rh.map(function (r) {
        return '<tr><th scope="row"><b>' + r.song + '</b><small>' + r.artist + '</small></th><td class="num">' + r.pct + '%</td>' +
          '<td class="num">' + usd(r.write) + '<small>' + r.publisher + '</small></td><td class="num">' + usd(r.rec) + '<small>' + r.label + '</small></td>' +
          '<td class="num"><b>' + usd(r.amt) + '</b></td></tr>';
      }).join('') + '</tbody></table></div>' + (open ? '' : '</details>');
  };
  V.pay = {
    step: 6,
    html: function () {
      var m = AF.money();
      var right =
        '<section class="card"><div class="gross"><div><p class="card-eyebrow">Net distribution revenue · this month · illustrative</p>' +
        '<p class="gross-num">' + usd(m.net) + '</p><p class="muted">' + AF.num(m.streams) + ' streams</p></div>' +
        '<div class="pool-box"><p class="card-eyebrow">AI influence royalty pool</p>' +
        '<div class="pool-meter" role="img" aria-label="Pool set to ' + m.pool + '% of a 30% maximum"><i style="width:' + (m.pool / 30 * 100) + '%"></i></div>' +
        '<div class="pool-ticks" aria-hidden="true"><span>10%</span><span>20%</span><span>30%</span></div>' +
        '<p class="muted small">Set by AttriFlow after re-scoring: AI share ' + m.aiShare + '% → pool ' + m.pool + '% (' + m.shareThen + '% AI and ' + m.poolThen + '% at SongSpark), re-confirmed with distributor.</p></div></div>' +
        AF.netSplit(m) + '</section>' +
        '<section class="card"><div class="card-head"><h3>AI influence royalty pool</h3><span class="muted">' + usd(m.poolAmt) + '</span></div>' +
        AF.poolSplit(m) +
        '<p class="muted small" style="margin-top:12px">' + T.distributor + ' keeps its 5% and sends the other 95% (' + usd(m.toFold) + ') to Fold. Fold pays the rightsholders and SongSpark, and keeps its 5%.</p>' +
        '<div class="actions"><a class="btn btn-primary btn-big" href="#/dash/user">' + icon('user') + 'Open ' + T.title + ' dashboard</a></div></section>';
      return AF.stage(7, 'AttriFlow', 'The money flows back',
        [T.distributor + ' pays Sam ' + (100 - m.pool) + '% of the distribution revenue directly. The other ' + m.pool + '% is the AI influence royalty pool, and the rightsholder share of it is split by the LUMINA influence scores: <b>bigger influence, bigger share</b>.',
         'Generation → attribution → distribution → streaming → revenue → rightsholders.'],
        right, 'LUMINA attribution · AttriFlow ledger');
    }
  };
})();
