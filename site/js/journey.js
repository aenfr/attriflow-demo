/* AttriFlow demo v2 — the Track Journey: eight scenes, each named after what happens to the song. */
(function () {
  'use strict';
  var AF = window.AF, T = AF.TRACK, icon = AF.icon, esc = AF.esc, usd = AF.usd;

  function st() { return AF.state; }
  function done(key) { AF.state[key] = true; AF.save(); AF.refreshChrome(); }

  AF.SCENES = [
    { id: 'train', label: 'Train', event: 'Songs licensed' },
    { id: 'create', label: 'Create', event: 'Song generated' },
    { id: 'verify', label: 'Verify', event: 'Rights verified' },
    { id: 'passport', label: 'Passport', event: 'Passport issued' },
    { id: 'submit', label: 'Submit', event: 'Song submitted' },
    { id: 'greenlane', label: 'Green Lane', event: 'Approved' },
    { id: 'stream', label: 'Stream', event: 'Song streamed' },
    { id: 'pay', label: 'Pay', event: 'Revenue allocated' }
  ];
  AF.GATES = {
    train: function () { return true; },
    create: function () { return st().generated; },
    verify: function () { return st().signed; },
    passport: function () { return st().downloaded; },
    submit: function () { return st().analyzed; },
    greenlane: function () { return st().approved; },
    stream: function () { return st().streamed; },
    pay: function () { return true; }
  };
  AF.HINTS = {
    train: ['', 'Next: make a song with AI.'],
    create: ['Tap “Generate” to make the song.', 'Song ready. Next: check it is ready for release.'],
    verify: ['Sign the Letter of Direction.', 'Signed. Next: the song’s passport.'],
    passport: ['Download the song when it is ready.', 'Downloaded. Next: upload it to a distributor.'],
    submit: ['Submit the release to DropTune.', 'Checks done. Next: the decision.'],
    greenlane: ['Choose whether to use the AI Green Lane.', 'Approved. Next: the release goes live.'],
    stream: ['Tap “Jump to end of month”.', 'Next: where the money goes.'],
    pay: ['', 'Next: see what each stakeholder sees.']
  };
  AF.maxStep = function () {
    for (var i = 0; i < AF.SCENES.length; i++) if (!AF.GATES[AF.SCENES[i].id]()) return i;
    return AF.SCENES.length - 1;
  };

  var V = AF.VIEWS = AF.VIEWS || {};

  // ---------- 1. Train ----------
  V.train = {
    step: 0,
    html: function () {
      var o = AF.OPTED_OUT;
      var cards = AF.CATALOG.map(function (c) {
        return '<li class="cat-card">' + AF.cover(c, 'sm') +
          '<div class="cat-name"><b>' + c.song + '</b><span>' + c.artist + '</span>' +
          '<span class="chips">' + AF.pill('good', 'Licensed', 'check') + AF.pill('neutral', 'Fingerprinted', 'fingerprint') + '</span></div>' +
          AF.playBtn(c.id, 'play-sm') + '</li>';
      }).join('') +
        '<li class="cat-card off">' + AF.cover(o, 'sm') +
        '<div class="cat-name"><b>' + o.song + '</b><span>' + o.artist + '</span>' +
        '<span class="chips">' + AF.pill('neutral', 'Opted out · never used', 'x') + '</span></div></li>';
      var right =
        '<section class="card train-card"><div class="train-grid">' +
        '<div><p class="card-eyebrow">Licensed catalog</p><ul class="cat-list">' + cards + '</ul></div>' +
        '<div class="train-arrow" aria-hidden="true">' + icon('arrow') + '</div>' +
        '<div class="model-card">' + AF.logo('spark') + '<h3>SongSpark model v4.2</h3>' +
        '<p class="muted">An AI music app. It learns only from songs whose owners said yes.</p>' +
        '<ul class="status-list">' +
        AF.statusRow('Songs licensed for training', '4 of 5') +
        AF.statusRow('Fingerprints', 'Every song', 'good', 'fingerprint') +
        AF.statusRow('LUMINA attribution', 'Installed', 'good', 'flow') +
        AF.statusRow('Opted-out song', 'Never used', 'neutral', 'x') +
        '</ul></div></div></section>';
      return AF.stage(1, 'Before any AI song exists', 'Real songs go into training, with permission',
        ['An AI music app learns by listening to songs made by real people.',
         'Only songs whose owners said yes are used. Each one gets a <b>fingerprint</b>, so its influence can be recognised later in any AI song.'],
        right, 'licensed catalogs · fingerprinting');
    }
  };

  // ---------- 2. Create ----------
  function partsList(dark) {
    return '<ul class="parts' + (dark ? ' dark' : '') + '">' + AF.PARTS.map(function (p) {
      var tone = AF.partTone(p.kind);
      return '<li class="part"><span class="part-ico ' + tone + '">' + icon(AF.partIcon(p.name)) + '</span>' +
        '<span class="part-name">' + p.name + '</span>' +
        (p.kind === 'mix'
          ? '<span class="part-mix" role="img" aria-label="AI 75%, human 25%"><i class="ai" style="width:' + p.ai + '%"></i><i class="human" style="width:' + (100 - p.ai) + '%"></i></span>'
          : '') +
        '<span class="pill ' + tone + '">' + p.label + '</span></li>';
    }).join('') + '</ul>';
  }
  AF.partsList = partsList;
  function influenceList(cls) {
    return '<ul class="inf-list' + (cls ? ' ' + cls : '') + '">' + AF.CATALOG.map(function (c) {
      return '<li class="inf">' + AF.cover(c, 'sm') +
        '<div class="inf-name"><b>' + c.song + '</b><span class="muted">' + c.artist + '</span>' +
        '<div class="bar" aria-hidden="true"><i data-w="' + c.pct + '"></i></div></div>' +
        '<div class="pct">' + c.pct + '%</div></li>';
    }).join('') + '</ul>';
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
      '<div class="song-meta"><h2>' + T.title + '</h2><p class="muted">Made by ' + T.creator + ' with SongSpark · ' + T.length + ' · ' + T.bpm + ' BPM · ' + T.key + '</p>' +
      '<div class="wave" data-wave aria-hidden="true"></div></div>' + AF.playBtn('main') + '</div>' +
      '<div class="gen-panels reveal">' +
      '<div class="inspired"><h3>What is AI, what is human</h3><p class="muted">You added the percussion. The AI made the rest.</p>' + partsList(true) + '</div>' +
      '<div class="inspired"><h3>Who influenced it</h3><p class="muted">LUMINA attribution: the real songs that shaped this one.</p>' + influenceList() + '</div>' +
      '</div>';
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
        '<span class="param">Vocals <b>Female</b></span><span class="param">Length <b>' + T.length + '</b></span></div>' +
        '<div class="upload-row"><span class="part-ico human">' + icon('drum') + '</span>' +
        '<div class="upload-text"><b>Your part: ' + T.upload + '</b><span>Percussion you recorded, added to the song</span></div>' +
        AF.pill('human', 'Human', 'user') + '</div>' +
        '<div class="prompt-row"><span class="muted small">SongSpark Plus</span>' +
        '<button type="button" class="btn btn-spark btn-big" id="generate">' + icon('sparkles') + 'Generate</button></div></div>' +
        '<div id="gen-out" aria-live="polite">' + (st().generated ? createResult() : '') + '</div>';
      return AF.stage(2, 'SongSpark', 'Make a song together with AI',
        ['Sam types an idea and adds a drum groove they recorded. The AI does the rest.',
         'When the song is ready, two things show up: <b>which parts are AI and which are human</b>, and <b>which real songs influenced it</b>.'],
        AF.appWindow('spark', 'SongSpark', ['Create', 'Library', 'Release'], 'Create', body), 'LUMINA attribution');
    },
    mount: function () {
      var out = document.getElementById('gen-out');
      if (st().generated) { growBars(out); AF.Wave.paint(out.querySelector('[data-wave]')); }
      document.getElementById('generate').addEventListener('click', function () {
        var btn = this;
        btn.disabled = true;
        AF.Player.stop();
        var lines = ['Reading your idea…', 'Layering your drum groove…', 'Writing the vocals and guitar…', 'Scoring influence with LUMINA…'];
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

  // ---------- 3. Verify ----------
  function lodSplit() {
    var p = AF.POOLS[30];
    var rows = [['you', 'You, the creator', 70], ['rh', 'Rightsholders who influenced the song', p.rh],
      ['dist', 'DropTune, Green Lane distribution', p.dist], ['aip', 'SongSpark, the AI platform', p.ai], ['fold', 'Fold, for AttriFlow', p.fold]];
    return '<ul class="split-legend">' + rows.map(function (r) {
      return '<li><span class="dot ' + r[0] + '"></span><span class="lg-name">' + r[1] + '</span><b>' + r[2] + '%</b></li>';
    }).join('') + '</ul>';
  }
  V.verify = {
    step: 2,
    html: function () {
      var s = st();
      var rows =
        AF.statusRow('Generation provenance', 'Verified') +
        AF.statusRow('LUMINA attribution record', 'Complete', 'good', 'flow') +
        AF.statusRow('Fingerprint created', 'Complete', 'good', 'fingerprint') +
        AF.statusRow('Rights profile', 'Complete') +
        (s.signed ? AF.statusRow('Letter of Direction', 'E-signed by you') : AF.statusRow('Letter of Direction', 'Waiting for your signature', 'warn', 'pen'));
      var lod = s.signed
        ? '<div class="signed reveal">' + AF.badge('pen', 'good') + '<div><b>Letter of Direction signed</b><p class="muted">Signed by ' + T.creator + ' · ' + T.createdShort + ', 14:34 UTC. It routes royalties for training and influence.</p></div></div>' +
          '<div class="ready reveal"><ul class="ready-list">' +
          '<li>' + icon('download') + '<span>Download status: <b>Eligible for verified download</b></span></li>' +
          '<li>' + icon('upload') + '<span>Distribution status: <b>Eligible for verified distribution</b></span></li></ul>' +
          '<a class="btn btn-spark btn-big" href="#/passport">' + icon('download') + 'Prepare for download</a></div>'
        : '<div class="lod"><h3>' + icon('pen') + ' Letter of Direction</h3>' +
          '<p>When “' + T.title + '” earns money, I direct that up to 30% goes to the <b>AI influence royalty pool</b>, paid like this:</p>' +
          lodSplit() +
          '<p class="muted small">AttriFlow lowers the pool when more of the song is human: 30%, 20% or 10%.</p>' +
          '<label class="agree"><input type="checkbox" id="agree"> I agree to these royalty routings for training and influence royalties.</label>' +
          '<button type="button" class="btn btn-spark" id="sign" disabled>' + icon('pen') + 'Sign as ' + T.creator + '</button></div>';
      var body = '<h2 class="spark-title">Rights &amp; distribution readiness</h2>' +
        '<ul class="status-list dark">' + rows + '</ul>' + lod;
      return AF.stage(3, 'SongSpark', 'Check the song is ready to leave the app',
        ['Before the song can be downloaded or distributed, AttriFlow checks where it came from and who should be paid.',
         'Sam signs a <b>Letter of Direction</b>: a promise to share royalties with the artists who influenced the song.'],
        AF.appWindow('spark', 'SongSpark', ['Create', 'Library', 'Release'], 'Release', body),
        'LUMINA attribution · AI detection · fingerprinting · rights correspondence');
    },
    mount: function () {
      var agree = document.getElementById('agree'), sign = document.getElementById('sign');
      if (!agree) return;
      agree.addEventListener('change', function () { sign.disabled = !agree.checked; });
      sign.addEventListener('click', function () {
        AF.state.signed = true; AF.state.prepared = true; AF.save();
        AF.rerender();
      });
    }
  };

  // ---------- 4. Passport ----------
  function passportHtml() {
    var fields = [
      ['Track ID', T.id], ['ISRC', 'Assigned at release'], ['Creator', T.creator],
      ['AI platform', 'SongSpark · ' + T.tier + ' tier'], ['Generated', T.created], ['Length · BPM · Key', T.length + ' · ' + T.bpm + ' · ' + T.key]
    ];
    return '<section class="passport">' +
      '<div class="passport-head">' + AF.logo('attri') + '<div><p class="card-eyebrow">AttriFlow</p><h2>Track Passport</h2></div>' +
      AF.pill('good', 'Verified', 'shield') + '</div>' +
      '<div class="passport-id">' + AF.cover(T, 'sm') + '<div><b>' + T.title + '</b><span class="muted">' + T.creator + '</span></div></div>' +
      '<dl class="fields">' + fields.map(function (f) { return '<div><dt>' + f[0] + '</dt><dd>' + f[1] + '</dd></div>'; }).join('') + '</dl>' +
      '<h3 class="passport-sub">What happened inside the song</h3>' + partsList(false) +
      '<h3 class="passport-sub">Checks</h3><ul class="status-list">' +
      AF.statusRow('LUMINA attribution', 'Scored and available', 'good', 'flow') +
      AF.statusRow('Fingerprint', 'Registered', 'good', 'fingerprint') +
      AF.statusRow('Rights checks', 'Completed') +
      AF.statusRow('Royalty tracking', '4 rightsholders identified', 'good', 'users') +
      AF.statusRow('Royalty obligations', 'Letter of Direction e-signed by you', 'good', 'pen') +
      AF.statusRow('Distribution', 'Eligible for verified distribution', 'good', 'upload') +
      '</ul></section>';
  }
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
  V.passport = {
    step: 3,
    html: function () {
      var dl = st().downloaded
        ? '<div class="dl-ready">' + AF.badge('check', 'good') + '<div><b>Downloaded</b><p class="muted">Your song and stems are on your computer.</p></div></div>' + finderHtml('done')
        : '<div class="dl-ready" id="dl-msg"><span class="spinner" aria-hidden="true"></span><div><b>Preparing your download…</b><p class="muted">Adding the passport to the song file.</p></div></div>' +
          '<button type="button" class="btn btn-primary btn-big" id="download" disabled>' + icon('download') + 'Download</button><div id="finder"></div>';
      var right = passportHtml() + '<section class="card dl-card" aria-live="polite">' + dl + '</section>';
      return AF.stage(4, 'AttriFlow', 'The song gets a passport',
        ['Every verified song gets an <b>AttriFlow Track Passport</b>: one record of who made it, with which AI, what is human, and who gets paid.',
         'The passport travels with the song wherever it goes next.'],
        right, 'LUMINA attribution · fingerprinting');
    },
    mount: function () {
      if (st().downloaded) return;
      var btn = document.getElementById('download');
      AF.later(function () {
        document.getElementById('dl-msg').innerHTML = AF.badge('check', 'good') +
          '<div><b>Download has been prepared</b><p class="muted">Your song and stems are now available for download.</p></div>';
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

  // ---------- 5. Submit ----------
  function analysisHtml() {
    var m = AF.money();
    var rows = AF.PARTS.map(function (p) {
      return '<tr><th scope="row"><span class="part-ico ' + AF.partTone(p.kind) + '">' + icon(AF.partIcon(p.name)) + '</span>' + p.name + '</th>' +
        '<td><span class="cmp"><i style="width:' + p.ai + '%"></i></span><span class="cmp-num">' + p.ai + '% AI</span></td>' +
        '<td><span class="cmp now"><i style="width:' + p.ai + '%"></i></span><span class="cmp-num">' + p.ai + '% AI</span></td>' +
        '<td>' + AF.pill('good', 'Match', 'check') + '</td></tr>';
    }).join('');
    return '<div class="modal-head good">' + icon('search') + '<h2 id="modal-title">AttriFlow analysis</h2></div>' +
      '<div class="analysis">' +
      '<section><h3>Fingerprint record vs. what we hear now</h3>' +
      '<div class="table-wrap"><table class="table cmp-table"><thead><tr><th>Part</th><th>At creation</th><th>Detected now</th><th></th></tr></thead><tbody>' + rows + '</tbody></table></div>' +
      '<p class="muted small">No edits after creation were found, for example in a music app. If there were, the new detection would be weighed instead.</p></section>' +
      '<section><h3>How the AI share is weighed</h3>' +
      '<div class="weigh"><span class="w-ai" style="flex:' + m.aiShare + '">AI ' + m.aiShare + '%</span><span class="w-human" style="flex:' + (100 - m.aiShare) + '">Human ' + (100 - m.aiShare) + '%</span></div>' +
      '<div class="tiers">' + [10, 20, 30].map(function (t) {
        return '<div class="tier' + (t === m.pool ? ' on' : '') + '"><b>' + t + '%</b><span>' + (t === 10 ? 'mostly human' : t === 20 ? 'half and half' : 'mostly AI') + '</span></div>';
      }).join('') + '</div>' +
      '<p class="muted small">AI influence royalty pool for this song: <b>' + m.pool + '%</b>. Rule order agreed in the Letter of Direction: 1. fingerprint record, 2. latest detection, 3. your disclosure.</p></section>' +
      '<section><h3>Result</h3><ul class="status-list">' +
      AF.statusRow('AI involvement', 'Verified') +
      AF.statusRow('Creator disclosure', 'Matches technical analysis') +
      AF.statusRow('Generation provenance', 'Verified') +
      AF.statusRow('Rights correspondence', 'No blocking issue detected') +
      AF.statusRow('Voice impersonation risk', 'None detected') +
      AF.statusRow('Store eligibility', '7 of 8 destinations', 'warn', 'store') +
      AF.statusRow('AI influence royalty data', 'Available', 'good', 'flow') +
      '</ul></section>' +
      '<section><h3>Letter of Direction received</h3><p class="muted small">Revenue routing acknowledged and agreed, as a share of gross distribution revenue:</p>' + AF.splitBar(m, true) + '</section>' +
      '</div><div class="modal-actions"><button type="button" class="btn btn-primary btn-big" id="m-done" data-autofocus>Continue</button></div>';
  }
  function submitSummary() {
    return '<div class="card summary reveal">' + AF.badge('shield', 'good') +
      '<div><b>AttriFlow checks complete</b><p class="muted">AI involvement verified · provenance verified · 7 of 8 stores · royalty data ready.</p></div></div>';
  }
  function runChecks() {
    AF.modal('<div class="modal-head warn">' + icon('alert') + '<h2 id="modal-title">Your track appears to contain AI</h2></div>' +
      '<p>DropTune’s AI detector found AI-generated sound in “' + T.title + '”. You told us AI helped make it, so let’s check how it was made.</p>' +
      '<div class="modal-actions"><button type="button" class="btn btn-primary btn-big" id="m-next" data-autofocus>Check how it was made</button></div>');
    document.getElementById('m-next').addEventListener('click', function () {
      var steps = ['Matching the song’s fingerprint', 'Reading its AttriFlow passport', 'Comparing what we hear with what you told us', 'Checking each store’s AI policy'];
      AF.modal('<div class="modal-head">' + '<span class="spinner" aria-hidden="true"></span><h2 id="modal-title">Please wait while we check whether your AI song was made ethically…</h2></div>' +
        '<ul class="wait-list" aria-live="polite">' + steps.map(function (s, i) { return '<li data-i="' + i + '">' + icon('check') + '<span>' + s + '</span></li>'; }).join('') + '</ul>');
      steps.forEach(function (_, i) {
        AF.later(function () {
          var li = document.querySelector('.wait-list [data-i="' + i + '"]');
          if (li) li.classList.add('ok');
        }, 650 * (i + 1));
      });
      AF.later(function () {
        AF.modal('<div class="modal-head good">' + icon('shield') + '<h2 id="modal-title">Analysis complete</h2></div>' +
          '<p class="big-p"><b>Congratulations, you are an ethical AI user.</b> Your song is partly human and partly AI.</p>' +
          '<p>The AI parts (vocals, lead guitar and most of the composition) were created on <b>' + T.createdShort + '</b> on <b>SongSpark</b>. The percussion is yours.</p>' +
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
  V.submit = {
    step: 4,
    html: function () {
      var s = st();
      var body =
        '<h2 class="drop-h">New release</h2>' +
        '<div class="file-drop">' + icon('file') + '<div><b>' + T.file + '</b><span class="muted">' + T.fileSize + ' · from Downloads · passport attached</span></div>' +
        AF.pill('good', 'Attached', 'check') + '</div>' +
        '<div class="form grid2">' +
        '<div class="field"><label for="f-title">Song title</label><input id="f-title" value="' + esc(T.title) + '"></div>' +
        '<div class="field"><label for="f-artist">Artist name</label><input id="f-artist" value="' + esc(T.creator) + '"></div>' +
        '<div class="field"><label for="f-genre">Genre</label><select id="f-genre"><option>Folk</option><option>Pop</option><option>Dance</option></select></div>' +
        '<div class="field"><label for="f-date">Release date</label><input id="f-date" type="date" value="2026-10-08"></div></div>' +
        '<fieldset class="disclosure"><legend>Did you use AI to make this song?</legend>' +
        '<label><input type="radio" name="ai" value="none"> No AI</label>' +
        '<label><input type="radio" name="ai" value="assisted" checked> Yes, AI helped (human + AI)</label>' +
        '<label><input type="radio" name="ai" value="full"> Yes, fully AI-generated</label></fieldset>' +
        '<div class="actions"><button type="button" class="btn btn-primary btn-big" id="submit"' + (s.analyzed ? ' disabled' : '') + '>' +
        (s.analyzed ? icon('check') + 'Submitted' : icon('upload') + 'Submit release') + '</button></div>' +
        '<div id="submit-out" aria-live="polite">' + (s.analyzed ? submitSummary() : '') + '</div>';
      return AF.stage(5, 'DropTune', 'Upload to a distributor',
        ['Sam uploads the song to <b>DropTune</b>, a distributor that sends music to streaming stores, and says AI helped.',
         'DropTune’s detector flags AI. Instead of a yes/no, <b>AttriFlow checks how the song was made</b>.'],
        AF.appWindow('drop', 'DropTune', ['Releases', 'Earnings', 'Help'], 'Releases', body),
        'AI detection · fingerprinting · LUMINA attribution');
    },
    mount: function () {
      var b = document.getElementById('submit');
      if (b && !st().analyzed) b.addEventListener('click', runChecks);
    }
  };

  // ---------- 6. Green Lane ----------
  var BENEFITS = [
    ['Release with speed', 'a verified lane made for AI works, approved in 1 day instead of 7'],
    ['Release with confidence', 'fewer store rejections and takedowns'],
    ['Release with pride', 'the artists who influenced your song are paid'],
    ['Release with transparency', 'show listeners, partners and stores your AI music was made ethically'],
    ['Stand apart', 'from anonymous, untraceable, mass-generated uploads'],
    ['Future-proof your catalog', 'for new store disclosure and training-data rules'],
    ['Avoid royalty disputes', 'automated payouts to everyone who influenced the AI parts'],
    ['Avoid delays', 'no missing AI disclosures or unclear provenance'],
    ['Tamper-evident record', 'of when and how your work was made'],
    ['Clear audit trail', 'for stores, collaborators and rightsholders'],
    ['Works for both', 'fully AI-generated and human + AI songs']
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
    return '<div class="proceed ask"><div><b>Do you want to distribute through the AI Green Lane?</b>' +
      '<p class="muted">Green Lane fee: ' + usd(AF.GREEN_LANE_FEE) + ' per release (illustrative).</p></div>' +
      '<div class="ask-btns"><button type="button" class="btn btn-secondary" id="gl-no">No</button>' +
      '<button type="button" class="btn btn-green btn-big" id="gl-yes">' + icon('check') + 'Yes, proceed</button></div></div>';
  }
  V.greenlane = {
    step: 5,
    html: function () {
      var body =
        '<div class="decision"><div class="light" aria-hidden="true"><i class="r"></i><i class="a"></i><i class="g on"></i></div>' +
        '<div><p class="card-eyebrow">AttriFlow distribution decision</p><h2>GREEN · Verified for distribution</h2>' +
        '<p class="muted">“' + T.title + '” can go through the AI Green Lane.</p></div></div>' +
        '<div class="lanes"><div class="lane g on"><b>GREEN</b><span>Distribute</span></div><div class="lane a"><b>AMBER</b><span>Review</span></div><div class="lane r"><b>RED</b><span>Hold</span></div></div>' +
        '<h3 class="sub-h">Where it can go</h3>' + dspGrid() +
        '<section class="pitch"><div class="pitch-head">' + AF.logo('attri') + '<div><p class="card-eyebrow">Premium distribution</p>' +
        '<h3>You’ve earned the AttriFlow AI Green Lane</h3></div></div>' +
        '<p class="muted">A lane for AI-generated and AI-assisted music. Verified songs move through using provenance, rights checks and store policy routing.</p>' +
        '<ul class="benefits">' + BENEFITS.map(function (b) { return '<li>' + icon('check') + '<span><b>' + b[0] + ':</b> ' + b[1] + '</span></li>'; }).join('') + '</ul></section>' +
        '<div id="proceed" aria-live="polite">' + proceedHtml() + '</div>';
      return AF.stage(6, 'DropTune', 'Accept verified AI',
        ['Today a distributor either rejects AI music broadly, or accepts it and inherits the risk.',
         'AttriFlow adds a third option: <b>accept verified AI</b>. GREEN goes out, AMBER gets a human review, RED is held.'],
        AF.appWindow('drop', 'DropTune', ['Releases', 'Earnings', 'Help'], 'Releases', body),
        'store policy engine · AttriFlow passport');
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
          '<dl class="fields one"><div><dt>Item</dt><dd>AI Green Lane release</dd></div><div><dt>Song</dt><dd>' + T.title + '</dd></div>' +
          '<div><dt>Fee</dt><dd>' + usd(AF.GREEN_LANE_FEE) + ' (illustrative)</dd></div><div><dt>Pay with</dt><dd>Your DropTune balance</dd></div></dl>' +
          '<p class="muted small">This is a demo. Nothing is charged.</p>' +
          '<div class="modal-actions"><button type="button" class="btn btn-secondary" id="m-cancel">Cancel</button>' +
          '<button type="button" class="btn btn-green btn-big" id="m-pay" data-autofocus>' + icon('lock') + 'Confirm ' + usd(AF.GREEN_LANE_FEE) + '</button></div>');
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

  // ---------- 7. Stream ----------
  function flowHtml() {
    var nodes = [['spark', 'SongSpark', 'made it'], ['attri', 'AttriFlow', 'verified it'], ['drop', 'DropTune', 'distributed it'], ['store', '7 stores', 'stream it']];
    return '<ol class="flow">' + nodes.map(function (n, i) {
      return '<li>' + (n[0] === 'store' ? '<span class="flow-store">' + icon('store') + '</span>' : AF.logo(n[0])) +
        '<b>' + n[1] + '</b><span>' + n[2] + '</span></li>' + (i < nodes.length - 1 ? '<li class="flow-arrow" aria-hidden="true">' + icon('arrow') + '</li>' : '');
    }).join('') + '</ol>';
  }
  AF.flowHtml = flowHtml;
  V.stream = {
    step: 6,
    html: function () {
      var s = st(), m = AF.money(), max = AF.DSPS[0].streams;
      var rows = AF.DSPS.filter(function (d) { return d.ok; }).map(function (d) {
        return '<li class="dsp-row"><b>' + d.name + '</b><span class="dsp-bar"><i data-w="' + (d.streams / max * 100).toFixed(1) + '"' +
          (s.streamed ? ' style="width:' + (d.streams / max * 100).toFixed(1) + '%"' : '') + '></i></span>' +
          '<span class="dsp-num" data-to="' + d.streams + '">' + (s.streamed ? AF.num(d.streams) : '0') + '</span></li>';
      }).join('');
      var right =
        '<section class="card">' + '<div class="live-head">' + AF.pill('good', 'Release is live', 'check') + '<span class="muted">' + T.title + ' · ' + T.creator + '</span></div>' + flowHtml() + '</section>' +
        '<section class="card"><div class="card-head"><h3>Streams this month</h3><span class="muted">Total <b id="total-streams">' + (s.streamed ? AF.num(m.streams) : '0') + '</b></span></div>' +
        '<ul class="dsp-rows">' + rows + '</ul>' +
        '<div class="actions"><button type="button" class="btn btn-primary btn-big" id="jump"' + (s.streamed ? ' disabled' : '') + '>' +
        (s.streamed ? icon('check') + 'Month finished' : icon('forward') + 'Jump to end of month') + '</button></div></section>';
      return AF.stage(7, 'Streaming stores', 'The release goes live',
        ['The song moves from the AI app, through AttriFlow and the distributor, to the stores.',
         'Streams start to add up. AttriFlow keeps the link between every stream and the song’s attribution.'],
        right, 'AttriFlow passport · fingerprinting');
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

  // ---------- 8. Pay ----------
  V.pay = {
    step: 7,
    html: function () {
      var m = AF.money();
      var rhRows = m.rh.map(function (r) {
        return '<tr><th scope="row"><span class="cell-song">' + AF.cover(r, 'xs') + '<span><b>' + r.artist + '</b><small>“' + r.song + '”</small></span></span></th>' +
          '<td class="num">' + r.pct + '%</td>' +
          '<td class="num">' + usd(r.write) + '<small>' + r.writer + ' · ' + r.writerCo + '</small></td>' +
          '<td class="num">' + usd(r.rec) + '<small>' + r.owner + '</small></td>' +
          '<td class="num"><b>' + usd(r.amt) + '</b></td></tr>';
      }).join('');
      var parts = [m.user, m.rhPool, m.dist, m.ai, m.fold];
      var right =
        '<section class="card"><div class="gross"><div><p class="card-eyebrow">Gross distribution revenue · this month · illustrative</p>' +
        '<p class="gross-num">' + usd(m.gross) + '</p><p class="muted">' + AF.num(m.streams) + ' streams × each store’s rate</p></div>' +
        '<div class="pool-box"><p class="card-eyebrow">AI influence royalty pool</p>' +
        '<div class="pool-meter" role="img" aria-label="Pool set to ' + m.pool + '% of a 30% maximum"><i style="width:' + (m.pool / 30 * 100) + '%"></i></div>' +
        '<div class="pool-ticks" aria-hidden="true"><span>10%</span><span>20%</span><span>30%</span></div>' +
        '<p class="muted small">Set by AttriFlow: AI share ' + m.aiShare + '% → pool ' + m.pool + '%.</p></div></div>' +
        AF.splitBar(m) + '</section>' +
        '<section class="card"><div class="card-head"><h3>Rightsholders paid from the AI influence pool</h3><span class="muted">' + usd(m.rhPool) + '</span></div>' +
        '<div class="table-wrap"><table class="table"><thead><tr><th>Influence</th><th class="num">Score</th><th class="num">Wrote it</th><th class="num">Recorded it</th><th class="num">Total</th></tr></thead>' +
        '<tbody>' + rhRows + '</tbody></table></div>' +
        '<div class="sum">' + parts.map(usd).join(' + ') + ' = ' + usd(m.counted) + ' ' +
        (m.counted === m.gross ? icon('check', 'ok') : icon('alert', 'warn')) + '<p>Every cent is counted.</p></div>' +
        '<div class="actions"><a class="btn btn-primary btn-big" href="#/dash/distributor">' + icon('chart') + 'Open the stakeholder dashboards</a></div></section>';
      return AF.stage(8, 'AttriFlow', 'The money flows back',
        ['The stores pay the distributor. AttriFlow splits the money as the Letter of Direction says.',
         'The rightsholders’ share is split by the LUMINA influence scores: <b>bigger influence, bigger share</b>.',
         'Generation → attribution → distribution → streaming → revenue → rightsholders.'],
        right, 'LUMINA attribution · AttriFlow ledger');
    }
  };
})();
