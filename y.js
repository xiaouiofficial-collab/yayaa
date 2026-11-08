/* iRiLLL MODZ */
(function () {
  'use strict';
  if (window.__pb) return;

  var PF_KEY_LS    = 'iril_pf_key';
  var PF_TOKEN_LS  = 'iril_pf_token';
  var PF_EXP_LS    = 'iril_pf_exp';
  var PF_CACHE_MS  = 1 * 3600 * 1000;

  var PF_LOCAL_KEYS = [
    'IRILMODZPREMIUM','I','AKBAR','IRIL-EFGH-5678','IRIL-IJKL-9012',
    'my key 123','IRILAY','EXPI7','IRILDAY'
  ];

  function pfGet(k, d) { try { var v = localStorage.getItem(k); return v == null ? d : v; } catch (e) { return d; } }
  function pfSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  function pfValidate(key, cb) {
    var target = String(key).trim();
    if (!target) { cb(false, 'invalid'); return; }
    var ok = PF_LOCAL_KEYS.some(function (k) { return k === target; });
    if (ok) { pfSet(PF_TOKEN_LS, 'ok_' + Date.now()); pfSet(PF_EXP_LS, String(Date.now() + PF_CACHE_MS)); cb(true); }
    else cb(false, 'invalid');
  }
  function pfCacheValid() {
    var tok = pfGet(PF_TOKEN_LS, '');
    var exp = parseInt(pfGet(PF_EXP_LS, '0'), 10) || 0;
    return !!(tok && exp > Date.now());
  }

  function pfPrompt(title, msg, cb) {
    function mk() {
      try {
        var wrap = document.createElement('div');
        wrap.setAttribute('data-pf-prompt', '1');
        wrap.style.cssText = 'position:fixed;inset:0;background:rgba(15,23,42,.55);z-index:2147483647;display:flex;align-items:center;justify-content:center;font:13px/1.4 system-ui,Tahoma,sans-serif';
        var box = document.createElement('div');
        box.style.cssText = 'background:#fff;border-radius:12px;padding:18px 18px 14px;width:min(340px,90vw);box-shadow:0 20px 50px rgba(0,0,0,.35);color:#0f172a';
        var t = document.createElement('div');
        t.textContent = title;
        t.style.cssText = 'font-weight:800;font-size:14px;margin-bottom:6px;color:#7c3aed';
        var m = document.createElement('div');
        m.textContent = msg;
        m.style.cssText = 'color:#475569;margin-bottom:10px;font-size:12px;line-height:1.5';
        var inp = document.createElement('input');
        inp.type = 'text'; inp.placeholder = 'Masukkan License Key';
        inp.style.cssText = 'width:100%;box-sizing:border-box;padding:9px 10px;border:1px solid #cbd5e1;border-radius:8px;font:13px monospace;outline:none';
        var row = document.createElement('div');
        row.style.cssText = 'display:flex;gap:8px;margin-top:12px';
        var btnOk = document.createElement('button');
        btnOk.textContent = 'Aktifkan';
        btnOk.style.cssText = 'flex:1;padding:9px 0;border:0;border-radius:8px;background:#7c3aed;color:#fff;font-weight:800;cursor:pointer;font-size:12px';
        var btnNo = document.createElement('button');
        btnNo.textContent = 'Batal';
        btnNo.style.cssText = 'flex:0 0 84px;padding:9px 0;border:1px solid #cbd5e1;border-radius:8px;background:#f1f5f9;color:#334155;font-weight:700;cursor:pointer;font-size:12px';
        var st = document.createElement('div');
        st.style.cssText = 'margin-top:8px;font-size:11px;color:#b91c1c;min-height:14px';
        row.appendChild(btnOk); row.appendChild(btnNo);
        box.appendChild(t); box.appendChild(m); box.appendChild(inp);
        box.appendChild(row); box.appendChild(st);
        wrap.appendChild(box);
        (document.body || document.documentElement).appendChild(wrap);
        setTimeout(function () { try { inp.focus(); } catch (e) {} }, 60);
        function close() { try { wrap.remove(); } catch (e) {} }
        btnNo.addEventListener('click', function () { close(); cb(null); });
        function submit() {
          var k = (inp.value || '').trim();
          if (!k) { st.style.color = '#b91c1c'; st.textContent = 'Key tidak boleh kosong'; return; }
          st.style.color = '#7c3aed'; st.textContent = 'Memverifikasi…';
          btnOk.disabled = true; btnOk.style.opacity = '.7';
          pfValidate(k, function (ok) {
            btnOk.disabled = false; btnOk.style.opacity = '1';
            if (ok) { pfSet(PF_KEY_LS, k); close(); cb(k); }
            else { st.style.color = '#b91c1c'; st.textContent = 'Key tidak valid'; }
          });
        }
        btnOk.addEventListener('click', submit);
        inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') submit(); });
      } catch (e) { cb(null); }
    }
    if (document.body) mk();
    else document.addEventListener('DOMContentLoaded', mk, { once: true });
  }

  function pfGate() {
    if (pfCacheValid()) { bootCore(); startLicenseWatcher(); return; }
    var saved = pfGet(PF_KEY_LS, '');
    if (saved) {
      pfValidate(saved, function (ok) {
        if (ok) { bootCore(); startLicenseWatcher(); }
        else pfPrompt('License Required', 'Key tersimpan tidak valid. Masukkan key baru.', function (k) { if (k) { bootCore(); startLicenseWatcher(); } });
      });
    } else {
      pfPrompt('License Required', 'Masukkan License Key iRiLLL MODZ untuk melanjutkan.', function (k) { if (k) { bootCore(); startLicenseWatcher(); } });
    }
  }

  var __pfWatcherStarted = false;
  function startLicenseWatcher() {
    if (__pfWatcherStarted) return;
    __pfWatcherStarted = true;
    setInterval(function () {
      try {
        if (pfCacheValid()) return;
        var existing = document.querySelector('div[data-pf-prompt="1"]');
        if (existing) return;
        try { if (window.__pb && window.__pb.off) window.__pb.off(); } catch (e) {}
        pfPrompt('License Expired', 'Sesi 1 jam kamu sudah habis. Masukkan License Key lagi untuk melanjutkan.',
          function (k) {
            if (k) {
              try { if (window.__pb && window.__pb.on) window.__pb.on(); } catch (e) {}
              __pfWatcherStarted = false;
              startLicenseWatcher();
            } else {
              setTimeout(function () { if (!pfCacheValid()) { try { startLicenseWatcher(); } catch (e) {} } }, 5000);
            }
          });
      } catch (e) {}
    }, 30000);
  }

  function bootCore() {
    var V = '3.5.0';
    var BRAND = 'iRiLLL MODZ';
    function log() { try { console.log.apply(console, ['[iR]'].concat([].slice.call(arguments))); } catch (e) {} }

    (function preboot() {
      try {
        if (!/\/jogo|game\.html/.test(location.pathname)) return;
        if (window.G || window.HUDO || window.GAME_READY) return;
        if (window.__pbBoot) return;
        window.__pbBoot = 1;
        try { var nb = +sessionStorage.getItem('pb_noboot') || 0; if (nb && Date.now() - nb < 120000) return; } catch (e0) {}
        if (document.readyState === 'complete') return;
        function xget(u, accept) {
          var x = new XMLHttpRequest(); x.open('GET', u, false);
          try { x.setRequestHeader('Accept', accept); } catch (e) {}
          x.send(null);
          if (x.status !== 200 || !x.responseText) throw new Error('xhr ' + x.status);
          return x.responseText;
        }
        var html = xget(location.href, 'text/html,*/*');
        if (html.indexOf('/static/game/bundle.js') < 0) return;
        var bm = /src="([^"]*\/static\/game\/bundle\.js[^"]*)"/.exec(html);
        if (!bm) return;
        var bsrc = xget(new URL(bm[1], location.href).href, '*/*');

        var integrityRe = /if\(!\(\(\)=>\{try\{const e=document\.currentScript,t=e&&e\.src&&new URL\(e\.src\);return!!t&&t\.origin===location\.origin&&"\/static\/game\/bundle\.js"===t\.pathname\}catch\(e\)\{return!1\}\}\)\(\)\)\{try\{location\.replace\("\/"\)\}catch\(t\)\{\}throw new Error\("pb"\)\}/;
        if (integrityRe.test(bsrc)) {
          bsrc = bsrc.replace(integrityRe, 'if(0){}');
          log('integrity check disabled');
        } else {
          bsrc = bsrc.replace(/throw new Error\("pb"\)/g, 'void 0');
          log('integrity check fallback applied');
        }

        var gateFlex = /([A-Za-z_$][\w$]*)="localhost"===location\.hostname\|\|"127\.0\.0\.1"===location\.hostname\|\|"\[::1\]"===location\.hostname/g;
        var patched = false, foundIds = [];
        bsrc = bsrc.replace(gateFlex, function (full, ident) {
          foundIds.push(ident); patched = true; return ident + '=!0';
        });
        if (!patched) {
          var gateUi = /const\s+([A-Za-z_$][\w$]*)="localhost"===location\.hostname\|\|"127\.0\.0\.1"===location\.hostname\|\|"\[::1\]"===location\.hostname,/;
          var mUi = gateUi.exec(bsrc);
          if (mUi) {
            bsrc = bsrc.replace(mUi[0], 'const ' + mUi[1] + '=!0,');
            foundIds.push(mUi[1] + '(legacy-comma)'); patched = true;
          }
        }
        if (!patched) { log('gate tidak cocok, abort'); return; }
        log('gate patched:', foundIds.join(', '));

        var parsed = new DOMParser().parseFromString(html, 'text/html');
        var scripts = [].slice.call(parsed.querySelectorAll('script')).map(function (s) {
          return { src: s.getAttribute('src'), text: s.textContent, type: s.getAttribute('type') || '' };
        });
        if (!scripts.length) return;
        [].slice.call(parsed.querySelectorAll('script')).forEach(function (s) { if (s.parentNode) s.parentNode.removeChild(s); });
        var dt = parsed.doctype ? '<!doctype ' + parsed.doctype.name + '>' : '<!doctype html>';
        var clean = dt + parsed.documentElement.outerHTML;
        var burl = '';
        try { burl = URL.createObjectURL(new Blob([bsrc], { type: 'text/javascript' })); } catch (e1) {}
        try {
          if (document.referrer.indexOf('android-app://') === 0 ||
              matchMedia('(display-mode: standalone), (display-mode: fullscreen)').matches)
            document.cookie = 'pbapp=1; max-age=31536000; path=/; secure; samesite=lax';
        } catch (e4) {}
        try { document.open(); document.write(clean); document.close(); }
        catch (e2) { try { sessionStorage.setItem('pb_noboot', String(Date.now())); } catch (e3) {} location.reload(); return; }
        var i = 0;
        function next() {
          while (i < scripts.length) {
            var s = scripts[i++];
            try {
              var t = (s.type || '').toLowerCase();
              if (t && t.indexOf('javascript') < 0 && t.indexOf('ecmascript') < 0) continue;
              var el = document.createElement('script');
              var head = document.head || document.documentElement;
              if (s.src) {
                var abs;
                try { abs = new URL(s.src, location.href).href; } catch (eU) { abs = s.src; }
                if (/\/static\/game\/bundle\.js(\?|$)/.test(abs)) abs = burl || '';
                if (abs) {
                  el.src = abs; el.async = false;
                  var done = false;
                  var fin = function () { if (done) return; done = true; clearTimeout(to); next(); };
                  var to = setTimeout(fin, 20000);
                  el.onload = el.onerror = fin;
                  head.appendChild(el); return;
                }
                el.textContent = bsrc; head.appendChild(el); continue;
              }
              el.textContent = s.text; head.appendChild(el);
            } catch (eL) {}
          }
        }
        next();
        setTimeout(function () {
          try {
            if (window.HUDO || window.GAME_READY) return;
            if (document.querySelector('canvas')) return;
            try { sessionStorage.setItem('pb_noboot', String(Date.now())); } catch (e) {}
            location.reload();
          } catch (e) {}
        }, 20000);
      } catch (e) {}
    })();

    var HIDDEN = { pb: null, pbvis: null, pbnade: null, pbqc: null, pbx: null, autoqq: null };

    var P = {
      cone: 0.65, reach: 200, autoFire: 0, gain: 0.9, mode: 'near', bias: 0.35,
      aimMode: 'pov', povCircleR: 220,
      hitbox: 'head',
      aimbotOn: 0,
      aimbotGain: 1.1,
      aimbotHoldMs: 250,
      bulletSpeed: 350,
      leadFactor: 1.0,
      lockMode: 'pov'
    };
    var O = { sens: 0.5, fov: 70, invert: false };
    function readOpts() {
      try {
        var s = localStorage.getItem('pbweb_opts'); if (!s) return;
        var o = JSON.parse(s);
        if (typeof o.sens === 'number' && o.sens > 0) O.sens = o.sens;
        if (typeof o.fov === 'number' && o.fov > 0) O.fov = o.fov;
        O.invert = !!o.invert;
      } catch (e) {}
    }
    readOpts();
    try { addEventListener('pbopts', function () { readOpts(); }); } catch (e) {}

    try {
      var _pr = parseFloat(localStorage.getItem('ir_povcirc'));
      if (isFinite(_pr) && _pr >= 1) P.povCircleR = _pr;
      var _hb = localStorage.getItem('ir_hitbox');
      if (_hb === 'head' || _hb === 'body' || _hb === 'nearest' || _hb === 'neck') P.hitbox = _hb;
      var _ab = localStorage.getItem('ir_aimbot');
      if (_ab === '1' || _ab === '0') P.aimbotOn = +_ab;
      var _abg = parseFloat(localStorage.getItem('ir_aimbot_gain'));
      if (isFinite(_abg) && _abg > 0) P.aimbotGain = _abg;
      var _abh = parseFloat(localStorage.getItem('ir_aimbot_hold'));
      if (isFinite(_abh) && _abh >= 50) P.aimbotHoldMs = _abh;
      var _bs = parseFloat(localStorage.getItem('ir_bullet_speed'));
      if (isFinite(_bs) && _bs > 0) P.bulletSpeed = _bs;
      var _lf = parseFloat(localStorage.getItem('ir_lead'));
      if (isFinite(_lf) && _lf >= 0) P.leadFactor = _lf;
      var _lm = localStorage.getItem('ir_lockmode');
      if (_lm === 'legacy' || _lm === 'pov') P.lockMode = _lm;
    } catch (e) {}

    var G = null, aimOn = false, fireHeld = 0, nextTap = 0, holding = false;
    var lastPick = null, st = { v: V, aim: false, G: false, bots: 0, enemies: 0, lock: 0, err: 0, fire: 0, dist: 0, hitbox: P.hitbox, aimbot: 0, lead: 0, lockMode: P.lockMode };

    var AB = { lockUntil: 0, target: null, lastShot: 0, freshFire: 0 };
    var SF = { on: 0 };

    /* ============================================================
       MODULE: AUTO QQ (DETERMINISTIK QUICK SWITCH MACRO)
       ============================================================ */
    var QQ = {
      on: 0,
      busy: false,
      lastAmmo: -1,
      fireUntil: 0,
      delayKnife: 30,
      delayBack: 130,
      delayUnlock: 420,
      frozenTarget: null,
      frozenTargetPt: null,
      count: 0
    };

    function triggerAutoQQ(curSlot) {
      if (!QQ.on || QQ.busy) return;
      QQ.busy = true;
      QQ.count++;

      setTimeout(function () {
        try {
          if (typeof window.KMAT === 'function') window.KMAT(3);
        } catch (e) {}

        setTimeout(function () {
          try {
            if (typeof window.KMAT === 'function') window.KMAT(curSlot);
          } catch (e) {}

          setTimeout(function () {
            QQ.busy = false;
          }, QQ.delayUnlock);
        }, QQ.delayBack);
      }, QQ.delayKnife);
    }

    function watchFireTick() {
      requestAnimationFrame(watchFireTick);
      if (!QQ.on) return;
      try {
        var g = G || game();
        if (!g || !g.P || !g.P.s || g.P.s.dead) {
          QQ.lastAmmo = -1; QQ.busy = false; QQ.frozenTarget = null;
          return;
        }

        var p = g.P;
        var wp = p.W || p.wp;
        var ammo = (wp && typeof wp.magLeft === 'number') ? wp.magLeft : (typeof p.ammo === 'number' ? p.ammo : -1);
        var curSlot = (typeof p.slot === 'number') ? p.slot : 1;

        if (ammo < 0) return;

        if (QQ.lastAmmo < 0) {
          QQ.lastAmmo = ammo;
          return;
        }

        var now = performance.now();

        if (ammo > QQ.lastAmmo + 5) {
          QQ.lastAmmo = ammo;
          return;
        }

        if (ammo < QQ.lastAmmo) {
          QQ.fireUntil = now + 700;

          var isKnifeOrNade = false;
          if (wp) {
            if (wp.isThrow || wp.melee || wp.grenade || wp.c4) isKnifeOrNade = true;
          }

          if ((curSlot === 1 || curSlot === 2) && !isKnifeOrNade) {
            triggerAutoQQ(curSlot);
          }
        }

        QQ.lastAmmo = ammo;
      } catch (e) {}
    }
    try { requestAnimationFrame(watchFireTick); } catch (e) {}

    var AIM = { dx: 0, dy: 0, queued: false };
    var AIMLOCK = { on: false, targetYaw: 0, targetPitch: 0, locked: false };

    function aimWrite(dx, dy) { AIM.dx += dx; AIM.dy += dy; AIM.queued = true; }

    function aimFlush(g) {
      if (!AIM.queued) return;
      AIM.queued = false;
      var s = g && g.P && g.P.s;
      if (!s || s.dead) { AIM.dx = AIM.dy = 0; return; }
      if (AIMLOCK.locked && P.lockMode !== 'pov') { AIM.dx = AIM.dy = 0; return; }
      var sens = O.sens * ((g.camera && g.camera.fov || 70) / O.fov) * 0.005;
      var dyaw   = -AIM.dx * sens;
      var dpitch = (O.invert ? 1 : -1) * AIM.dy * sens;
      var curY = (s.__pbYawRaw   != null) ? s.__pbYawRaw   : (+s.yaw   || 0);
      var curP = (s.__pbPitchRaw != null) ? s.__pbPitchRaw : (+s.pitch || 0);
      var ny = curY + dyaw;
      var np = curP + dpitch;
      while (ny >  Math.PI) ny -= 2 * Math.PI;
      while (ny < -Math.PI) ny += 2 * Math.PI;
      np = Math.max(-1.4, Math.min(1.4, np));
      if (s.__pbYawLocked) { s.__pbYawRaw = ny; s.__pbPitchRaw = np; }
      else { s.yaw = ny; s.pitch = np; }
      AIM.dx = AIM.dy = 0;
    }

    function lockYawPitch(s) {
      if (!s || s.__pbYawLocked) return;
      s.__pbYawRaw   = +s.yaw   || 0;
      s.__pbPitchRaw = +s.pitch || 0;
      try {
        Object.defineProperty(s, 'yaw', {
          configurable: true,
          get: function () { return AIMLOCK.locked ? AIMLOCK.targetYaw : this.__pbYawRaw; },
          set: function (v) { this.__pbYawRaw = +v || 0; }
        });
        Object.defineProperty(s, 'pitch', {
          configurable: true,
          get: function () { return AIMLOCK.locked ? AIMLOCK.targetPitch : this.__pbPitchRaw; },
          set: function (v) { this.__pbPitchRaw = +v || 0; }
        });
        s.__pbYawLocked = true;
      } catch (e) {}
    }

    var DBG = { el: null, n: 0 };
    function dbg(t) {
      try {
        if (!DBG.el) {
          var d = document.createElement('div');
          d.setAttribute('data-pb', '1');
          d.style.cssText = 'position:fixed;left:6px;bottom:6px;padding:2px 6px;background:#000a;color:#fff;font:11px monospace;z-index:2147483000;pointer-events:none;border-radius:2px';
          (document.body || document.documentElement).appendChild(d);
          DBG.el = d;
        }
        DBG.el.textContent = t;
      } catch (e) {}
    }
    setInterval(function () {
      if (DBG.n > 3) return;
      if (game()) { dbg('iRiLLL MODZ v' + V); if (++DBG.n > 3) { try { DBG.el.remove(); } catch (e) {} DBG.el = null; } }
      else if (!DBG.n) { dbg('iRiLLL MODZ v' + V); }
    }, 1000);

    function game() {
      try {
        var g = window.G;
        if (g && g.P && g.P.s && g.camera && g.bots) return g;
      } catch (e) {}
      return null;
    }
    function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
    function wrap(a) { while (a > Math.PI) a -= 2 * Math.PI; while (a < -Math.PI) a += 2 * Math.PI; return a; }
    function wpos(b, out) {
      if (!b || !b.matrixWorld || !b.matrixWorld.elements) return false;
      var e = b.matrixWorld.elements;
      out.x = e[12]; out.y = e[13]; out.z = e[14];
      return true;
    }
    function ms(t) {
      try {
        var c = document.getElementById('center');
        if (c) { c.textContent = t; c.style.display = ''; setTimeout(function () { if (c.textContent === t) c.textContent = ''; }, 1500); }
        else log(t);
      } catch (e) { log(t); }
    }
    function buzz(p) { try { navigator.vibrate && navigator.vibrate(p); } catch (e) {} }

    var A = { x: 0, y: 0, z: 0 };
    var _hpOut = { x: 0, y: 0, z: 0 };
    var _pv = null, _pDir = { x: 0, y: 0, z: 0 };
    var F = { x: 0, y: 0, z: 0 }, C = { x: 0, y: 0, z: 0 };

    function headPoint(p) {
      if (!p || p.dead || !(p.hp > 0)) return null;
      var by = p.c && p.c.byName; 
      if (by) {
        var h = by.Head || by.head;
        var g = by.Bone_HeadGearAttach;
        if (g && wpos(g, _hpOut)) { _hpOut.y -= 0.05; return _hpOut; }
        if (h && wpos(h, _hpOut)) { _hpOut.y += 0.11; return _hpOut; }
      }
      var base = (p.obj && p.obj.position) ? p.obj.position : (p.mover && p.mover.pos);
      if (!base) return null;
      _hpOut.x = base.x;
      _hpOut.y = base.y + (p.mover && p.mover.crouch ? 1.18 : 1.68);
      _hpOut.z = base.z;
      return _hpOut;
    }
    function bodyPoint(p) {
      if (!p || p.dead || !(p.hp > 0)) return null;
      var by = p.c && p.c.byName; 
      if (by) {
        var h = by.Spine2 || by.Spine1 || by.Spine3 || by.Neck || by.Pelvis;
        if (h && wpos(h, _hpOut)) return _hpOut;
      }
      var base = (p.obj && p.obj.position) ? p.obj.position : (p.mover && p.mover.pos);
      if (!base) return null;
      _hpOut.x = base.x;
      _hpOut.y = base.y + (p.mover && p.mover.crouch ? 0.82 : 1.15);
      _hpOut.z = base.z;
      return _hpOut;
    }
    function neckPoint(p) {
      if (!p || p.dead || !(p.hp > 0)) return null;
      var by = p.c && p.c.byName; 
      if (by) {
        var h = by.Neck || by.head || by.Head;
        if (h && wpos(h, _hpOut)) return _hpOut;
      }
      var base = (p.obj && p.obj.position) ? p.obj.position : (p.mover && p.mover.pos);
      if (!base) return null;
      _hpOut.x = base.x;
      _hpOut.y = base.y + (p.mover && p.mover.crouch ? 0.9 : 1.4);
      _hpOut.z = base.z;
      return _hpOut;
    }
    function nearestPoint(p) {
      var hp = headPoint(p);
      if (!hp) return bodyPoint(p);
      var hx = hp.x, hy = hp.y, hz = hp.z;
      var bp = bodyPoint(p);
      if (!bp) return hp;
      var bx = bp.x, by = bp.y, bz = bp.z;
      var dh = (hx-C.x)*(hx-C.x) + (hy-C.y)*(hy-C.y) + (hz-C.z)*(hz-C.z);
      var db = (bx-C.x)*(bx-C.x) + (by-C.y)*(by-C.y) + (bz-C.z)*(bz-C.z);
      if (dh <= db) { _hpOut.x = hx; _hpOut.y = hy; _hpOut.z = hz; }
      else { _hpOut.x = bx; _hpOut.y = by; _hpOut.z = bz; }
      return _hpOut;
    }
    function getTargetPointLogical(p) {
      if (P.hitbox === 'head') return headPoint(p);
      if (P.hitbox === 'body') return bodyPoint(p);
      if (P.hitbox === 'neck') return neckPoint(p);
      return nearestPoint(p);
    }

    var _leadOut = { x: 0, y: 0, z: 0 };
    function predictPoint(p, basePt, fromPt) {
      var dx = basePt.x - fromPt.x;
      var dy = basePt.y - fromPt.y;
      var dz = basePt.z - fromPt.z;
      var dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
      if (dist < 1 || P.bulletSpeed <= 0) {
        _leadOut.x = basePt.x; _leadOut.y = basePt.y; _leadOut.z = basePt.z;
        return _leadOut;
      }
      var t = (dist / P.bulletSpeed) * P.leadFactor;
      var vx = 0, vy = 0, vz = 0;
      try {
        if (p.mover && p.mover.vel) {
          vx = +p.mover.vel.x || 0;
          vy = +p.mover.vel.y || 0;
          vz = +p.mover.vel.z || 0;
        }
      } catch (e) {}
      _leadOut.x = basePt.x + vx * t;
      _leadOut.y = basePt.y + vy * t * 0.5;
      _leadOut.z = basePt.z + vz * t;
      return _leadOut;
    }
    function getTargetPointLead(p, fromPt) {
      var base = getTargetPointLogical(p);
      if (!base) return null;
      var bp = { x: base.x, y: base.y, z: base.z };
      var lead = predictPoint(p, bp, fromPt || C);
      return lead;
    }

    var _povCache = new WeakMap();
    function isInsidePOVCircle(cam, hp, p) {
      try {
        var now = performance.now();
        if (p) {
          var c = _povCache.get(p);
          if (c && now - c.t < 200) return c.v;
        }
        if (!_pv) _pv = cam.position.clone();
        var ndc = _pv.set(hp.x, hp.y, hp.z).project(cam);
        if (!(ndc.z > -1 && ndc.z < 1)) { if (p) _povCache.set(p, { t: now, v: false }); return false; }
        var px = ndc.x * (innerWidth / 2);
        var py = -ndc.y * (innerHeight / 2);
        var v = Math.sqrt(px*px + py*py) <= P.povCircleR;
        if (p) _povCache.set(p, { t: now, v: v });
        return v;
      } catch (e) { return false; }
    }
    function hasLineOfSight(g, cam, hp) {
      try {
        if (typeof g.cast !== 'function') return true;
        var eye = cam.position;
        var dx = hp.x - eye.x, dy = hp.y - eye.y, dz = hp.z - eye.z;
        var dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
        if (!(dist > 0.5)) return false;
        _pDir.x = dx/dist; _pDir.y = dy/dist; _pDir.z = dz/dist;
        return !g.cast(eye, _pDir, dist - 0.35);
      } catch (e) { return true; }
    }

    var _losCache = new WeakMap();
    function hasLineOfSightThrottled(g, cam, p, point) {
      if (!p) return hasLineOfSight(g, cam, point);
      var now = performance.now();
      var c = _losCache.get(p);
      if (c && now - c.t < 300) return c.v;
      var v = hasLineOfSight(g, cam, point);
      _losCache.set(p, { t: now, v: v });
      return v;
    }
    function canLockTarget(g, cam, p, point) {
      if (P.lockMode !== 'pov') return true;
      if (!point) return false;
      if (!isInsidePOVCircle(cam, point, p)) return false;
      if (!hasLineOfSightThrottled(g, cam, p, point)) return false;
      return true;
    }

    var _aimbotLosCache = new WeakMap();
    function canAimbotTarget(g, cam, p, point) {
      if (!point) return false;
      if (!isInsidePOVCircle(cam, point, p)) return false;
      var now = performance.now();
      var c = _aimbotLosCache.get(p);
      if (c && now - c.t < 80) return c.v;
      var v = hasLineOfSight(g, cam, point);
      _aimbotLosCache.set(p, { t: now, v: v });
      return v;
    }

    function isBotReal(p) {
      if (!p || !p.obj || !p.c) return false;
      if (p.dead || !(p.hp > 0)) return false;
      if (!p.obj.parent) return false;
      if (p.obj.visible === false) return false;
      return true;
    }
    function hitTestSafe(p, o, d, m) {
      if (!p || p.dead) return null;
      if (p.remote && !p.net && p.isBot) {
        var old = p.remote; p.remote = false;
        try { return p.hitTest(o, d, m); } finally { p.remote = old; }
      }
      return p.hitTest(o, d, m);
    }

    function down() {
      try {
        var g = G || game();
        if (g && g.P && g.P.s && !g.P.s.dead && typeof g.fire === 'function') {
          try { g.fire(); } catch (e) {}
        }
      } catch (e) {}
      AB.freshFire = 1;
    }
    function up() {
      try {
        var g = G || game();
        if (g && typeof g.release === 'function') { try { g.release(); } catch (e) {} }
      } catch (e) {}
      holding = false;
    }

    addEventListener('mousemove', function (e) {
      if (e.movementX || e.movementY) aimWrite(e.movementX, e.movementY);
    }, true);
    
    addEventListener('mousedown', function (e) {
      if (e.button === 0) { fireHeld = 1; AB.freshFire = 1; st.fire = 1; }
    }, true);
    addEventListener('mouseup', function (e) {
      if (e.button === 0) { fireHeld = 0; st.fire = 0; }
    }, true);
    
    addEventListener('blur', function () { fireHeld = 0; st.fire = 0; AB.freshFire = 0; FLY.jumpHeld = 0; });
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) { fireHeld = 0; st.fire = 0; }
    });

    var fireElementBound = false;
    function bindRealFireButton() {
      if (fireElementBound) return;
      var fireBtnSelectors = [
        '#fire', '#btn-fire', '.btn-fire', '[data-action="fire"]', '[class*="fire"]', '[id*="fire"]',
        '#shoot', '#btn-shoot', '.btn-shoot', '[data-action="shoot"]', '[class*="shoot"]', '[id*="shoot"]'
      ];
      
      for (var i = 0; i < fireBtnSelectors.length; i++) {
        var el = document.querySelector(fireBtnSelectors[i]);
        if (el && !el.__pbFireBound) {
          el.__pbFireBound = true;
          el.addEventListener('touchstart', function(e) {
            fireHeld = 1; AB.freshFire = 1; st.fire = 1;
          }, { passive: true });
          el.addEventListener('touchend', function(e) {
            fireHeld = 0; st.fire = 0;
          }, { passive: true });
          el.addEventListener('touchcancel', function(e) {
            fireHeld = 0; st.fire = 0;
          }, { passive: true });
          fireElementBound = true;
          break;
        }
      }
    }
    setInterval(bindRealFireButton, 2000);

    var FL = {
      wallbang: 0, infAmmo: 0, noRecoil: 0, godmode: 0, noclip: 0,
      antiKick: 0, noFall: 0,
      infNade: 0,
      infNadeMax: 99
    };

    var FLY = {
      on: 0, mode: 'jump', jumpHeld: 0,
      riseSpeed: 6, maxHeight: 25, groundY: null
    };

    var FLYB = { on: 0, last: 0, interval: 33, smooth: 0.85 };

    function flyTick(dt) {
      if (!FLY.on) return false;
      var g = G || game();
      if (!g || !g.P || !g.P.s || g.P.s.dead) return false;
      var s = g.P.s, m = s.mover;
      if (!m || !m.pos) return false;

      if (FLYB.on) {
        var now = performance.now();
        if (now - FLYB.last < FLYB.interval) return false;
        dt = Math.min(0.05, (now - FLYB.last) / 1000);
        FLYB.last = now;
      }

      if (FLY.groundY == null) FLY.groundY = m.pos.y;

      if (FLY.jumpHeld) {
        m.noGrav = true; m.vy = 0; m.jt = -1; m.ft = 0; m.airT = 0; m.onGround = false;
        try { m.fallDmg = 0; m.fallT = 0; m.landT = 0; } catch (e) {}
        var target = m.pos.y + FLY.riseSpeed * dt;
        if (FLYB.on) target = m.pos.y + (target - m.pos.y) * FLYB.smooth;
        m.pos.y = target;
        if (m.pos.y > FLY.groundY + FLY.maxHeight) m.pos.y = FLY.groundY + FLY.maxHeight;
      } else {
        m.noGrav = false;
        if (m.pos.y > FLY.groundY + FLY.maxHeight) {
          m.pos.y = FLY.groundY + FLY.maxHeight;
          if (m.vy > 0) m.vy = 0;
        }
        if (m.onGround && m.pos.y <= FLY.groundY + 0.1) {
          FLY.groundY = m.pos.y;
        }
      }
      if (FL.noFall) { try { m.fallDmg = 0; m.fallT = 0; } catch (e) {} }
      if (!isFinite(m.pos.y)) { m.pos.y = FLY.groundY; m.vy = 0; }
      return true;
    }

    function flyToggle(on) {
      var g = G || game();
      if (!g || !g.P || !g.P.s) { FLY.on = 0; return 0; }
      var val = (on === undefined) ? (FLY.on ? 0 : 1) : (on ? 1 : 0);
      FLY.on = val;
      if (val) {
        FLY.groundY = g.P.s.mover.pos.y;
        FLY.jumpHeld = 0;
        FLYB.last = 0;
        try { g.P.s.mover.jt = -1; g.P.s.mover.ft = 0; g.P.s.mover.vy = 0; } catch (e) {}
        try { ms('Fly ON'); } catch (er) {}
      } else {
        var m = g.P.s.mover;
        if (m) { m.noGrav = false; m.vy = 0; m.jt = -1; m.ft = 0; m.onGround = false; }
        FLY.groundY = null;
      }
      try { buzz(30); } catch (e) {}
      return FLY.on;
    }

    (function flyJumpBind() {
      function isInputFocused() {
        var el = document.activeElement;
        return el && (/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName) || el.isContentEditable);
      }
      addEventListener('keydown', function (e) {
        if (e.code === 'Space' && FLY.on && !isInputFocused()) {
          FLY.jumpHeld = 1;
          e.preventDefault(); e.stopPropagation();
        }
        if (e.code === 'F9') { e.preventDefault(); flyToggle(); }
      }, true);
      addEventListener('keyup', function (e) {
        if (e.code === 'Space') FLY.jumpHeld = 0;
      }, true);
      function bindMobileJump() {
        var candidates = document.querySelectorAll(
          '[data-action="jump"], .btn-jump, #btn-jump, #jump, [class*="jump"], [id*="jump"]'
        );
        for (var i = 0; i < candidates.length; i++) {
          var el = candidates[i];
          if (el.__pbJumpBound) continue;
          el.__pbJumpBound = 1;
          el.addEventListener('touchstart', function (e) {
            if (!FLY.on) return;
            FLY.jumpHeld = 1;
            e.preventDefault(); e.stopPropagation();
          }, { passive: false });
          el.addEventListener('touchend', function (e) {
            if (!FLY.on) return;
            FLY.jumpHeld = 0;
            e.preventDefault(); e.stopPropagation();
          }, { passive: false });
          el.addEventListener('touchcancel', function () {
            if (!FLY.on) return;
            FLY.jumpHeld = 0;
          }, { passive: false });
        }
      }
      setInterval(function () { if (FLY.on) bindMobileJump(); }, 2000);
    })();

    var NC = {
      active: 0, mover: null,
      origBlocked: null, origCrosses: null, origDepen: null, origMove: null
    };
    function ncInstall() {
      var g = G || game(); if (!g || !g.P || !g.P.s) return false;
      var m = g.P.s.mover; if (!m) return false;
      if (NC.active && NC.mover === m) return true;
      ncUninstall();
      NC.mover = m;
      NC.origBlocked = m.blocked;
      NC.origCrosses = m.crosses;
      NC.origDepen = m.depenetrate;
      NC.origMove = m.move;
      try { m.blocked = function () { return false; }; } catch (e) {}
      try { m.crosses = function () { return false; }; } catch (e) {}
      try { m.depenetrate = function () { return false; }; } catch (e) {}
      NC.active = 1;
      return true;
    }
    function ncUninstall() {
      if (!NC.active || !NC.mover) { NC.active = 0; return; }
      var m = NC.mover;
      try { m.blocked = NC.origBlocked; } catch (e) {}
      try { m.crosses = NC.origCrosses; } catch (e) {}
      try { m.depenetrate = NC.origDepen; } catch (e) {}
      NC.active = 0;
      NC.mover = null;
    }
    function ncTick() {
      requestAnimationFrame(ncTick);
      if (FL.noclip) {
        try { ncInstall(); } catch (e) {}
        try {
          var g = G || game();
          if (g && g.P && g.P.s && g.P.s.mover && g.P.s.mover.pos && g.P.s.mover.pos.y < -50) {
            g.P.s.mover.pos.y = 5; g.P.s.mover.vy = 0;
          }
        } catch (e) {}
      } else if (NC.active) {
        ncUninstall();
      }
    }
    try { requestAnimationFrame(ncTick); } catch (e) {}

    var SN = {
      on: 0, requireLOS: 0, homing: 0,
      lockedTarget: null, nadeCount: 0, lastNadeAt: 0
    };

    var SNB = { on: 0, last: 0, interval: 33 };

    function snLock(g, from) {
      var list = g.bots || [];
      var self = g.P && g.P.s;
      if (!self) return null;
      for (var i = 0; i < list.length; i++) {
        var p = list[i];
        if (!p || p === self) continue;
        if (p.dead || !(p.hp > 0)) continue;
        if (p.team === self.team) continue;
        if (!p.obj || !p.c) continue;
        if (p.obj.visible === false) continue;
        var pt = getTargetPointLogical(p);
        if (!pt) continue;
        return { bot: p, pt: { x: pt.x, y: pt.y, z: pt.z } };
      }
      return null;
    }

    function snChaseNade(n) {
      if (!n || !n.__sn) return;
      if (!n.pos) { n.__sn = 0; n.__snTarget = null; return; }
      var tgt = n.__snTarget;
      var g = G || game();

      if (!tgt || !tgt.bot || tgt.bot.dead || !(tgt.bot.hp > 0) || tgt.bot.obj.visible === false) {
        if (!g) { n.__snTarget = null; return; }
        var nt = snLock(g, n.pos);
        if (!nt) { n.__snTarget = null; return; }
        n.__snTarget = nt;
        tgt = nt;
        SN.lockedTarget = nt;
      }

      var pt = getTargetPointLogical(tgt.bot);
      if (!pt) return;
      tgt.pt.x = pt.x; tgt.pt.y = pt.y; tgt.pt.z = pt.z;

      try { n.pos.x = pt.x; n.pos.y = pt.y; n.pos.z = pt.z; } catch (e) { return; }
      try { if (n.mesh && n.mesh.position) n.mesh.position.set(pt.x, pt.y, pt.z); } catch (e) {}
      try { if (n.obj && n.obj.position) n.obj.position.set(pt.x, pt.y, pt.z); } catch (e) {}

      try { if (n.start && n.start.copy) n.start.copy(n.pos); } catch (e) {}
      var speed = n.speed || 18.5;
      var ax = pt.x - n.pos.x, ay = pt.y - n.pos.y, az = pt.z - n.pos.z;
      var alen = Math.sqrt(ax*ax + ay*ay + az*az) || 1;
      try {
        if (n.vel && n.vel.set) n.vel.set((ax/alen) * speed, (ay/alen) * speed, (az/alen) * speed);
        if (n.dir && n.dir.set) n.dir.set(ax/alen, ay/alen, az/alen);
      } catch (e) {}
    }

    function snScanNades(g) {
      if (!SN.on) return;
      var arr = g.nades;
      if (!arr || !arr.length) return;
      var self = g.P && g.P.s;
      if (!self) return;
      for (var i = 0; i < arr.length; i++) {
        var n = arr[i];
        if (!n) continue;
        if (n.__sn) { snChaseNade(n); continue; }
        var isMine = false;
        if (n.owner === self) isMine = true;
        else if (n.owner == null && n.pos && self.mover && self.mover.pos) {
          try {
            var dx0 = n.pos.x - self.mover.pos.x;
            var dy0 = n.pos.y - self.mover.pos.y;
            var dz0 = n.pos.z - self.mover.pos.z;
            if (dx0*dx0 + dy0*dy0 + dz0*dz0 < 16) isMine = true;
          } catch (e) {}
        }
        if (!isMine) continue;
        if (!n.pos && self.mover && self.mover.pos) {
          try {
            n.pos = self.mover.pos.clone();
            if (n.pos.y != null) n.pos.y += 1.4;
          } catch (e) { continue; }
        }
        if (!n.pos) continue;
        var target = snLock(g, n.pos);
        if (!target) continue;
        n.__snTarget = target;
        n.__sn = 1;
        SN.nadeCount++;
        SN.lastNadeAt = performance.now();
        SN.lockedTarget = target;
      }
    }
    function snPatchNade(n) {
      if (!n || n.__snPatched) return;
      n.__snPatched = 1;
      var methods = ['update', 'step', 'tick', 'integrate', 'move'];
      for (var i = 0; i < methods.length; i++) {
        var key = methods[i];
        if (typeof n[key] !== 'function') continue;
        (function (orig, mkey) {
          n[mkey] = function () {
            var r = orig.apply(this, arguments);
            try { snChaseNade(this); } catch (e) {}
            return r;
          };
        })(n[key], key);
      }
    }
    function snHomingTick(g) {
      if (!SN.on) return;
      var arr = g.nades || [];
      for (var i = 0; i < arr.length; i++) {
        var n = arr[i];
        if (!n || !n.__sn) continue;
        if (!n.__snPatched) snPatchNade(n);
        try { snChaseNade(n); } catch (e) {}
      }
    }

    function snBypassTick() {
      if (!SNB.on) return;
      if (SN.on) {
        var now = performance.now();
        if (now - SNB.last >= SNB.interval) {
          SNB.last = now;
          try {
            var g = G || game();
            if (g && g.nades && g.nades.length) {
              for (var i = 0; i < g.nades.length; i++) {
                var n = g.nades[i];
                if (n && n.__sn) {
                  try { snChaseNade(n); } catch (e) {}
                }
              }
            }
          } catch (e) {}
        }
      }
      requestAnimationFrame(snBypassTick);
    }
    try { requestAnimationFrame(snBypassTick); } catch (e) {}

    var NG = { on: 0, max: 99, lastLog: 0, count: 0 };
    function nadeTick() {
      if (!FL.infNade) return;
      var g = G || game();
      if (!g || !g.P || !g.P.s || g.P.s.dead) return;
      var p = g.P;
      var inv = null;
      try { inv = p.inv; } catch (e) { return; }
      if (!inv) return;

      var changed = false;
      for (var k in inv) {
        var slot = inv[k];
        if (!slot || typeof slot !== 'object') continue;
        var w = slot.w;
        if (!w || !w.grenade) continue;
        var maxAmmo = FL.infNadeMax;
        try { if (slot.ammo !== maxAmmo) { slot.ammo = maxAmmo; changed = true; } } catch (e) {}
        try { if (typeof slot.reserve === 'number' && slot.reserve < maxAmmo) { slot.reserve = maxAmmo; changed = true; } } catch (e) {}
      }
      if (changed) { NG.count++; }
    }
    setInterval(function () { try { nadeTick(); } catch (e) {} }, 150);

    function tick() {
      requestAnimationFrame(tick);
      if (!G) { G = game(); if (!G) return; st.G = true; try { buzz(30); } catch (e) {} }
      var g = G, self = g.P.s, cam = g.camera;
      if (!self || self.dead) {
        if (holding) up();
        lastPick = null; st.lock = 0; AB.target = null; AB.freshFire = 0; AIMLOCK.locked = false;
        QQ.frozenTarget = null;
        return;
      }

      if (!self.__pbYawLocked) lockYawPitch(self);

      var now = performance.now(), m = cam.matrixWorld.elements;
      C.x = m[12]; C.y = m[13]; C.z = m[14];

      try { snScanNades(g); } catch (e) {}
      try { snHomingTick(g); } catch (e) {}
      try { flyTick(0.016); } catch (e) {}
      try { nadeTick(); } catch (e) {}

      var yaw = +self.yaw || 0, pitch = +self.pitch || 0;
      var cp = Math.cos(pitch);
      F.x = -Math.sin(yaw) * cp; F.y = Math.sin(pitch); F.z = -Math.cos(yaw) * cp;

      var list = g.bots;
      var best = null, bestPt = null, bestA = 1e9, bestD = 1e9, myTeam = self.team, n = 0, en = 0;

      // INTEGRASI ANTI-RACE & AIM LOCK UNTUK AUTO-QQ
      var isQQActive = QQ.on && (QQ.busy || now <= QQ.fireUntil);

      if (isQQActive && QQ.frozenTarget) {
        if (QQ.frozenTarget.dead || !(QQ.frozenTarget.hp > 0) || !QQ.frozenTarget.obj || QQ.frozenTarget.obj.visible === false) {
          QQ.frozenTarget = null;
          QQ.frozenTargetPt = null;
        } else {
          best = QQ.frozenTarget;
          var ptCurr = getTargetPointLead(best, C);
          if (ptCurr) QQ.frozenTargetPt = { x: ptCurr.x, y: ptCurr.y, z: ptCurr.z };
          bestPt = QQ.frozenTargetPt;
          if (bestPt) {
            var fdx = bestPt.x - C.x, fdy = bestPt.y - C.y, fdz = bestPt.z - C.z;
            bestD = Math.sqrt(fdx*fdx + fdy*fdy + fdz*fdz);
            var fey = wrap(Math.atan2(-fdx, -fdz) - yaw);
            var fep = Math.asin(clamp(fdy/Math.max(0.001, bestD), -1, 1)) - pitch;
            bestA = Math.sqrt(fey*fey + fep*fep);
          }
        }
      }

      if (!best) {
        for (var i = 0; i < list.length; i++) {
          var p = list[i];
          if (!isBotReal(p)) continue;
          n++;
          if (p.team === myTeam || p === self) continue;
          var hp = getTargetPointLead(p, C); if (!hp) continue;
          var dx = hp.x - C.x, dy = hp.y - C.y, dz = hp.z - C.z;
          var d = Math.sqrt(dx*dx + dy*dy + dz*dz);
          if (d < 2 || d > P.reach) continue;
          en++;
          var ey = wrap(Math.atan2(-dx, -dz) - yaw);
          var ep = Math.asin(clamp(dy/d, -1, 1)) - pitch;
          var a = Math.sqrt(ey*ey + ep*ep);
          if (a > P.cone) continue;
          if (!canLockTarget(g, cam, p, hp)) continue;
          var better = (P.mode === 'angle') ? (a < bestA) : (d < bestD - P.bias || (d <= bestD + P.bias && a < bestA));
          if (better) { bestA = a; bestD = d; best = p; bestPt = { x: hp.x, y: hp.y, z: hp.z }; }
        }
        if (best && isQQActive) {
          QQ.frozenTarget = best;
          QQ.frozenTargetPt = bestPt;
        }
      }
      st.bots = n; st.enemies = en;

      var doAimbot = false;
      var wantAcquire = P.aimbotOn && (AB.freshFire || (fireHeld > 0 && now >= AB.lockUntil));
      if (wantAcquire) {
        AB.freshFire = 0;
        var bestAb = null, bestAbD = 1e9;
        for (var j = 0; j < list.length; j++) {
          var q = list[j];
          if (!isBotReal(q) || q === self || q.team === myTeam) continue;
          var qp = getTargetPointLead(q, C); if (!qp) continue;
          var qdx = qp.x - C.x, qdy = qp.y - C.y, qdz = qp.z - C.z;
          var qd = Math.sqrt(qdx*qdx + qdy*qdy + qdz*qdz);
          if (qd < 2 || qd > P.reach) continue;
          if (!canAimbotTarget(g, cam, q, qp)) continue;
          if (qd < bestAbD) { bestAbD = qd; bestAb = { bot: q, p: { x: qp.x, y: qp.y, z: qp.z } }; }
        }
        if (bestAb) { AB.target = bestAb; AB.lockUntil = now + P.aimbotHoldMs; AB.lastShot = now; }
      }
      if (AB.target && now < AB.lockUntil) doAimbot = true; else AB.target = null;

      if (doAimbot && AB.target) {
        var curAp = getTargetPointLead(AB.target.bot, C) || AB.target.p;

        if (!canAimbotTarget(g, cam, AB.target.bot, curAp)) {
          AB.target = null; AB.lockUntil = 0;
          AIMLOCK.locked = false;
          st.aimbot = 0;
          aimFlush(g);
          return;
        }

        AB.target.p = { x: curAp.x, y: curAp.y, z: curAp.z };
        var ap = AB.target.p;
        var tYawAb   = Math.atan2(-(ap.x - C.x), -(ap.z - C.z));
        var tPitchAb = Math.asin(clamp((ap.y - C.y) / Math.max(0.001, Math.hypot(ap.x - C.x, ap.y - C.y, ap.z - C.z)), -1, 1));
        while (tYawAb >  Math.PI) tYawAb -= 2 * Math.PI;
        while (tYawAb < -Math.PI) tYawAb += 2 * Math.PI;
        var rawY = self.__pbYawRaw   != null ? self.__pbYawRaw   : (+self.yaw   || 0);
        var rawP = self.__pbPitchRaw != null ? self.__pbPitchRaw : (+self.pitch || 0);
        var k = Math.min(1, Math.max(0.35, P.aimbotGain * 0.7));
        AIMLOCK.on = true; AIMLOCK.locked = true;
        AIMLOCK.targetYaw   = rawY + wrap(tYawAb - rawY) * k;
        AIMLOCK.targetPitch = rawP + (tPitchAb - rawP) * k;
        st.aimbot = 1;
      } else {
        st.aimbot = 0;
        if (!best || !aimOn) {
          AIMLOCK.locked = false; lastPick = null; st.lock = 0;
          if (holding) up();
          aimFlush(g);
          return;
        }
        var tYaw   = Math.atan2(-(bestPt.x - C.x), -(bestPt.z - C.z));
        var tPitch = Math.asin(clamp((bestPt.y - C.y) / Math.max(0.001, bestD), -1, 1));
        while (tYaw >  Math.PI) tYaw -= 2 * Math.PI;
        while (tYaw < -Math.PI) tYaw += 2 * Math.PI;
        var rawY2 = self.__pbYawRaw   != null ? self.__pbYawRaw   : (+self.yaw   || 0);
        var rawP2 = self.__pbPitchRaw != null ? self.__pbPitchRaw : (+self.pitch || 0);
        var gainBase = (P.lockMode === 'pov') ? Math.max(0.85, Math.min(1, P.gain)) : Math.min(1, Math.max(0.5, P.gain));
        AIMLOCK.on = true; AIMLOCK.locked = true;
        AIMLOCK.targetYaw   = rawY2 + wrap(tYaw   - rawY2) * gainBase;
        AIMLOCK.targetPitch = rawP2 + (tPitch - rawP2) * gainBase;
        st.err = bestA; st.dist = bestD; st.lock = 1; lastPick = best;
      }

      var canShootTrigger = (P.autoFire || fireHeld > 0);
      if (!canShootTrigger || now < nextTap || holding) {
        if (P.aimbotOn && fireHeld > 0) AB.lastShot = now;
        aimFlush(g);
        return;
      }
      var fireTarget = doAimbot && AB.target ? AB.target.bot : best;
      var firePoint = doAimbot && AB.target ? AB.target.p : bestPt;
      if (!fireTarget || !firePoint) { aimFlush(g); return; }

      if (!doAimbot && !FL.wallbang) {
        if (!hasLineOfSightThrottled(g, cam, fireTarget, firePoint)) { aimFlush(g); return; }
      }
      var hit = null;
      try { hit = hitTestSafe(fireTarget, C, F, P.reach); } catch (e) { hit = null; }
      if (!hit) { aimFlush(g); return; }
      if (P.hitbox === 'head') { if (!hit.head) { aimFlush(g); return; } }

      down(); holding = true;
      var holdMs, gapMs;
      if (SF.on) { holdMs = 20 + Math.random() * 15; gapMs = 25 + Math.random() * 20; }
      else { holdMs = 45 + Math.random() * 30; gapMs = 90 + Math.random() * 70; }
      setTimeout(function () { if (holding) up(); }, holdMs);
      nextTap = now + holdMs + gapMs;
      if (P.aimbotOn) AB.lastShot = now;
      aimFlush(g);
    }

    setInterval(function () { try { var g = G || game(); if (g) aimFlush(g); } catch (e) {} }, 16);

    setInterval(function () {
      try {
        var Bx = window.PBAndroid, v;
        if (Bx && Bx.poll) v = Bx.poll();
        if (v === 1) { aimOn = true; st.aim = true; buzz([20, 40, 20]); }
        else if (v === -1) { aimOn = false; st.aim = false; up(); buzz(60); }
      } catch (e) {}
    }, 250);
    setInterval(function () { if (!G) { G = game(); if (G) { st.G = true; } } }, 1000);

    var PB_API = {
      state: function () {
        return {
          v: V, aim: aimOn, G: !!G,
          bots: st.bots, enemies: st.enemies, lock: st.lock,
          dist: +st.dist.toFixed(2), mode: P.mode, aimMode: P.aimMode,
          povCircleR: P.povCircleR, hitbox: P.hitbox,
          err: +(st.err * 57.2958).toFixed(2), fire: fireHeld, autoFire: P.autoFire,
          sens: O.sens, fov: O.fov, aimbot: P.aimbotOn, aimbotActive: st.aimbot,
          bulletSpeed: P.bulletSpeed, leadFactor: P.leadFactor,
          lockMode: P.lockMode
        };
      },
      cfg: function (o) { if (o) for (var k in o) if (k in P) P[k] = o[k]; return P; },
      on: function () { aimOn = true; st.aim = true; return 'on'; },
      off: function () { aimOn = false; st.aim = false; AIMLOCK.locked = false; up(); return 'off'; },
      aimMode: function (mode) { P.aimMode = 'pov'; try { localStorage.setItem('ir_aimmode', 'pov'); } catch (e) {} return P.aimMode; },
      povCircle: function (v) { if (typeof v === 'number' && v >= 1) { P.povCircleR = v; try { localStorage.setItem('ir_povcirc', String(v)); } catch (e) {} } return P.povCircleR; },
      hitbox: function (v) { if (v === 'head' || v === 'body' || v === 'nearest' || v === 'neck') { P.hitbox = v; st.hitbox = v; try { localStorage.setItem('ir_hitbox', v); } catch (e) {} } return P.hitbox; },
      lockMode: function (m) {
        if (m === 'legacy' || m === 'pov') {
          P.lockMode = m; st.lockMode = m;
          try { localStorage.setItem('ir_lockmode', m); } catch (e) {}
          AIMLOCK.locked = false;
          _losCache = new WeakMap();
          _povCache = new WeakMap();
          _aimbotLosCache = new WeakMap();
        }
        return P.lockMode;
      },
      aimbot: function (on) {
        P.aimbotOn = on ? 1 : 0;
        if (!P.aimbotOn) { AB.target = null; AIMLOCK.locked = false; }
        _aimbotLosCache = new WeakMap();
        try { localStorage.setItem('ir_aimbot', P.aimbotOn ? '1' : '0'); } catch (e) {}
        return P.aimbotOn;
      },
      aimbotGain: function (v) { if (typeof v === 'number' && v > 0) { P.aimbotGain = v; try { localStorage.setItem('ir_aimbot_gain', String(v)); } catch (e) {} } return P.aimbotGain; },
      aimbotHold: function (v) { if (typeof v === 'number' && v >= 50) { P.aimbotHoldMs = v; try { localStorage.setItem('ir_aimbot_hold', String(v)); } catch (e) {} } return P.aimbotHoldMs; },
      bulletSpeed: function (v) { if (typeof v === 'number' && v > 0) { P.bulletSpeed = v; try { localStorage.setItem('ir_bullet_speed', String(v)); } catch (e) {} } return P.bulletSpeed; },
      leadFactor: function (v) { if (typeof v === 'number' && v >= 0) { P.leadFactor = v; try { localStorage.setItem('ir_lead', String(v)); } catch (e) {} } return P.leadFactor; },
      list: function () {
        var g = game(); if (!g) return 'no G';
        return (g.bots || []).map(function (p) {
          return { id: p.id, team: p.team, my: p.team === g.P.s.team, dead: !!p.dead, hp: p.hp, vis: p.obj && p.obj.visible, bot: !!p.isBot, remote: !!p.remote, hasNet: !!p.net };
        });
      },
      head: function () {
        var hp = lastPick && getTargetPointLogical(lastPick);
        return hp ? { x: +hp.x.toFixed(2), y: +hp.y.toFixed(2), z: +hp.z.toFixed(2), team: lastPick.team, hp: lastPick.hp } : null;
      },
      aimAt: function (x, y, z) {
        var g = G || game(); if (!g || !g.P || !g.P.s) return 'no G';
        var cam = g.camera.matrixWorld.elements;
        var cx = cam[12], cy = cam[13], cz = cam[14];
        var tYaw   = Math.atan2(-(x - cx), -(z - cz));
        var tPitch = Math.asin(clamp((y - cy) / Math.max(0.001, Math.hypot(x - cx, y - cy, z - cz)), -1, 1));
        AIMLOCK.locked = true; AIMLOCK.targetYaw = tYaw; AIMLOCK.targetPitch = tPitch;
        return { yaw: tYaw, pitch: tPitch };
      },
      unlock: function () { AIMLOCK.locked = false; return 'unlocked'; }
    };
    window.__pb = PB_API; HIDDEN.pb = PB_API;

    var AUTO_QQ_API = {
      on: function (val) { QQ.on = val ? 1 : 0; return QQ.on; },
      is: function () { return QQ.on; },
      st: function () { return { on: QQ.on, busy: QQ.busy, count: QQ.count, delayKnife: QQ.delayKnife, delayBack: QQ.delayBack, delayUnlock: QQ.delayUnlock }; },
      cfg: function (c) {
        if (!c) return QQ;
        if (typeof c.delayKnife === 'number') QQ.delayKnife = c.delayKnife;
        if (typeof c.delayBack === 'number') QQ.delayBack = c.delayBack;
        if (typeof c.delayUnlock === 'number') QQ.delayUnlock = c.delayUnlock;
        return QQ;
      }
    };
    window.__autoqq = AUTO_QQ_API; HIDDEN.autoqq = AUTO_QQ_API;

    /* ===== ULTRA FAST & LIGHT ESP ===== */
    var E = { on: 0, wrap: null, host: null, hostRect: null, hostAt: 0, slots: [], last: 0, n: 0 };
    function eInit() {
      if (E.wrap && E.wrap.parentNode) return true;
      var host = document.body || document.documentElement; if (!host) return false;
      var w = document.createElement('div');
      w.setAttribute('data-pb', '1');
      w.style.cssText = 'position:fixed;left:0;top:0;width:100%;height:100%;overflow:hidden;pointer-events:none;z-index:2147483000';
      host.appendChild(w); E.wrap = w; E.slots = []; return true;
    }
    function eSlot(i) {
      var s = E.slots[i]; if (s) return s;
      var box = document.createElement('div');
      box.style.cssText = 'position:absolute;left:0;top:0;box-sizing:border-box;border:1px solid rgba(255,255,255,0.45);border-radius:2px;display:none;will-change:transform,width,height;background:rgba(255,255,255,0.02)';
      
      var hb = document.createElement('div');
      hb.style.cssText = 'position:absolute;left:-1px;top:-4px;width:calc(100% + 2px);height:2px;background:rgba(0,0,0,0.4);border-radius:1px;overflow:hidden';
      
      var hf = document.createElement('div');
      hf.style.cssText = 'position:absolute;left:0;top:0;height:100%;width:100%;background:#38bdf8';
      hb.appendChild(hf);
      
      var tx = document.createElement('div');
      tx.style.cssText = 'position:absolute;right:2px;top:-13px;font:9px/10px system-ui,sans-serif;color:#f8fafc;text-shadow:0 1px 1px rgba(0,0,0,0.9);white-space:nowrap;font-weight:600';
      
      var nameEl = document.createElement('div');
      nameEl.style.cssText = 'position:absolute;left:50%;top:-22px;transform:translateX(-50%);font:9px/10px system-ui,sans-serif;color:#e2e8f0;text-shadow:0 1px 1px rgba(0,0,0,0.9);white-space:nowrap;font-weight:700;display:none';
      
      box.appendChild(hb); box.appendChild(tx); box.appendChild(nameEl);
      E.wrap.appendChild(box); 
      s = { box: box, hp: hf, tx: tx, name: nameEl, lastX: 0, lastY: 0, lastW: 0, lastH: 0 }; 
      E.slots[i] = s; 
      return s;
    }
    function eClear() { 
      for (var i = 0; i < E.slots.length; i++) {
        if (E.slots[i].box.style.display !== 'none') E.slots[i].box.style.display = 'none';
      } 
      E.n = 0; 
    }
    function eHost() {
      var now = performance.now();
      if (E.host && E.host.parentNode && now - E.hostAt < 1000) return E.host;
      E.hostAt = now;
      var best = null, ba = 0, cs = document.getElementsByTagName('canvas');
      for (var i = 0; i < cs.length; i++) {
        var c = cs[i]; if (c.getAttribute('data-pb') || c.id === 'crossCv') continue;
        var a = c.offsetWidth * c.offsetHeight;
        if (a > ba) { ba = a; best = c; }
      }
      E.host = best || null;
      if (E.host) E.hostRect = E.host.getBoundingClientRect();
      return E.host;
    }
    function eProj(cam, r, x, y, z) {
      if (!E.v) { try { E.v = cam.position.clone(); } catch (e) { return null; } }
      var d = E.v.set(x, y, z).project(cam);
      if (!(d.z > -1 && d.z < 1)) return null;
      return { x: r.left + (d.x * 0.5 + 0.5) * r.width, y: r.top + (-d.y * 0.5 + 0.5) * r.height };
    }
    function eDraw(g) {
      var cam = g.camera, list = g.bots, self = g.P && g.P.s;
      if (!list || !cam || !self || self.dead) { eClear(); return; }
      var host = eHost(); if (!host) { eClear(); return; }
      var r = E.hostRect || host.getBoundingClientRect(); 
      if (!(r.width > 0)) { eClear(); return; }
      
      var me = cam.matrixWorld && cam.matrixWorld.elements;
      var cx = me ? me[12] : 0, cy = me ? me[13] : 0, cz = me ? me[14] : 0;
      var my = self.team, idx = 0;
      
      for (var i = 0; i < list.length; i++) {
        var p = list[i];
        if (!p || p === self || p.dead || !(p.hp > 0) || p.team === my) continue;
        if (!p.obj || p.obj.visible === false || !p.obj.parent) continue;
        
        var hp = headPoint(p); if (!hp) continue;
        var mm = p.obj.matrixWorld && p.obj.matrixWorld.elements; if (!mm) continue;
        
        var a = eProj(cam, r, hp.x, hp.y, hp.z);
        var b = eProj(cam, r, mm[12], mm[13], mm[14]);
        if (!a || !b) continue;
        
        var bh = b.y - a.y; if (!(bh > 6)) continue;
        if (a.x < r.left - 40 || a.x > r.left + r.width + 40 || b.y < r.top - 40 || a.y > r.top + r.height + 40) continue;
        
        var bw = bh * 0.40; if (bw > 300) bw = 300;
        
        var s = eSlot(idx++);
        var posX = +(a.x - bw / 2).toFixed(1);
        var posY = +a.y.toFixed(1);
        var intW = +bw.toFixed(1);
        var intH = +bh.toFixed(1);

        if (s.lastX !== posX || s.lastY !== posY || s.lastW !== intW || s.lastH !== intH) {
          s.box.style.transform = 'translate3d(' + posX + 'px,' + posY + 'px,0)';
          s.box.style.width = intW + 'px';
          s.box.style.height = intH + 'px';
          s.lastX = posX; s.lastY = posY; s.lastW = intW; s.lastH = intH;
        }

        if (s.box.style.display !== 'block') s.box.style.display = 'block';

        var mxh = p.maxHp > 0 ? p.maxHp : 100;
        var f = Math.max(0, Math.min(1, (p.hp || 0) / mxh));
        s.hp.style.width = (f * 100).toFixed(0) + '%';
        s.hp.style.background = f > 0.5 ? '#38bdf8' : (f > 0.25 ? '#fbbf24' : '#f87171');
        
        var dx = hp.x - cx, dy = hp.y - cy, dz = hp.z - cz;
        s.tx.textContent = Math.round(Math.sqrt(dx*dx + dy*dy + dz*dz)) + 'm';
        
        if (E.nameOn) {
          var nm = p.name || p.nick || ('bot' + (p.id != null ? p.id : ''));
          s.name.textContent = String(nm).slice(0, 15);
          if (s.name.style.display !== 'block') s.name.style.display = 'block';
        } else {
          if (s.name.style.display !== 'none') s.name.style.display = 'none';
        }
      }
      
      for (; idx < E.slots.length; idx++) {
        if (E.slots[idx].box.style.display !== 'none') {
          E.slots[idx].box.style.display = 'none';
          if (E.slots[idx].name) E.slots[idx].name.style.display = 'none';
        }
      }
      E.n = idx;
    }
    E.nameOn = 0;

    var BE = { on: 0, wrap: null, host: null, hostRect: null, hostAt: 0, last: 0, range: 60 };
    var BONE_PAIRS = [
      ['Head','Neck'],['Neck','Spine3'],['Spine3','Spine2'],['Spine2','Spine1'],['Spine1','Pelvis'],
      ['Spine3','L_Clavicle'],['L_Clavicle','L_UpperArm'],['L_UpperArm','L_Forearm'],['L_Forearm','L_Hand'],
      ['Spine3','R_Clavicle'],['R_Clavicle','R_UpperArm'],['R_UpperArm','R_Forearm'],['R_Forearm','R_Hand'],
      ['Pelvis','L_Thigh'],['L_Thigh','L_Calf'],['L_Calf','L_Foot'],
      ['Pelvis','R_Thigh'],['R_Thigh','R_Calf'],['R_Calf','R_Foot']
    ];
    function beInit() {
      if (BE.wrap && BE.wrap.parentNode) return true;
      var host = document.body || document.documentElement; if (!host) return false;
      var w = document.createElement('canvas');
      w.setAttribute('data-pb', '1');
      w.style.cssText = 'position:fixed;left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:2147482999';
      host.appendChild(w); BE.wrap = w; BE.ctx = w.getContext('2d'); return true;
    }
    function beClear() { if (BE.ctx && BE.wrap) { BE.ctx.clearRect(0, 0, BE.wrap.width, BE.wrap.height); } }
    function beHost() {
      var now = performance.now();
      if (BE.host && BE.host.parentNode && now - BE.hostAt < 1000) return BE.host;
      BE.hostAt = now;
      var best = null, ba = 0, cs = document.getElementsByTagName('canvas');
      for (var i = 0; i < cs.length; i++) {
        var c = cs[i]; if (c.getAttribute('data-pb') || c.id === 'crossCv') continue;
        var a = c.offsetWidth * c.offsetHeight;
        if (a > ba) { ba = a; best = c; }
      }
      BE.host = best || null;
      if (BE.host) BE.hostRect = BE.host.getBoundingClientRect();
      return BE.host;
    }
    function beProject(cam, r, b, out) {
      if (!BE._v) { try { BE._v = cam.position.clone(); } catch (e) { return false; } }
      var e = b.matrixWorld.elements;
      var d = BE._v.set(e[12], e[13], e[14]).project(cam);
      if (!(d.z > -1 && d.z < 1)) return false;
      out.x = r.left + (d.x * 0.5 + 0.5) * r.width;
      out.y = r.top + (-d.y * 0.5 + 0.5) * r.height;
      return true;
    }
    function beDraw(g) {
      if (!BE.on) { beClear(); return; }
      var cam = g.camera, list = g.bots, self = g.P && g.P.s;
      if (!list || !cam || !self || self.dead) { beClear(); return; }
      if (!beInit()) return;
      var host = beHost(); if (!host) { beClear(); return; }
      var r = BE.hostRect || host.getBoundingClientRect(); if (!(r.width > 0)) { beClear(); return; }
      var dpr = Math.min(2, devicePixelRatio || 1);
      var w = Math.round(innerWidth * dpr), h = Math.round(innerHeight * dpr);
      if (BE.wrap.width !== w || BE.wrap.height !== h) { BE.wrap.width = w; BE.wrap.height = h; }
      var ctx = BE.ctx;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(255,255,255,0.5)';
      var my = self.team, me = cam.matrixWorld.elements;
      var cx = me[12], cy = me[13], cz = me[14];
      var pa = { x: 0, y: 0 }, pb = { x: 0, y: 0 };
      for (var i = 0; i < list.length; i++) {
        var p = list[i];
        if (!p || !p.obj || !p.c || p === self) continue;
        if (p.team === my || p.dead || !(p.hp > 0)) continue;
        var mm = p.obj.matrixWorld && p.obj.matrixWorld.elements; if (!mm) continue;
        var dx = mm[12] - cx, dy = mm[13] - cy, dz = mm[14] - cz;
        var dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
        if (dist > BE.range) continue;
        var by = p.c.byName; if (!by) continue;
        for (var j = 0; j < BONE_PAIRS.length; j++) {
          var ba = by[BONE_PAIRS[j][0]], bb = by[BONE_PAIRS[j][1]];
          if (!ba || !bb) continue;
          if (!beProject(cam, r, ba, pa)) continue;
          if (!beProject(cam, r, bb, pb)) continue;
          if (pa.x < r.left - 200 || pa.x > r.left + r.width + 200) continue;
          if (pa.y < r.top - 200 || pa.y > r.top + r.height + 200) continue;
          ctx.beginPath(); ctx.moveTo(pa.x, pa.y); ctx.lineTo(pb.x, pb.y); ctx.stroke();
        }
      }
    }

    var _wbLast = 0;
    var _beLast = 0;
    function eFrame() {
      requestAnimationFrame(eFrame);
      var g = G || game();
      var now = performance.now();
      if (g) {
        if (now - _wbLast > 1000) { _wbLast = now; try { wbPatch(); } catch (e) {} }
        try { ammoTick(); } catch (e) {}
        try { dmgTick(); } catch (e) {}
      }
      if (!E.on) { eClear(); } else {
        var t = performance.now();
        if (t - E.last < 16) {} else { 
          E.last = t;
          if (!eInit()) {} else if (!g) { eClear(); } else { try { eDraw(g); } catch (err) { eClear(); } }
        }
      }
      if (g && now - _beLast > 50) { _beLast = now; try { beDraw(g); } catch (e) { beClear(); } }
    }
    try { requestAnimationFrame(eFrame); } catch (e) {}

    var DM = { at: 0, mult: 1.3 };
    function dmgTick() {
      var g = G || game(); if (!g || !g.P) return;
      var now = performance.now(); if (now < DM.at) return;
      DM.at = now + 500;
      var w = null; try { w = g.P.W; } catch (e) { w = null; }
      if (!w || w.melee || w.c4 || w.grenade || w.dmg) return;
      if (!(w.damage > 0) || w.__pbD) return;
      try { w.damage = Math.round(w.damage * DM.mult); w.__pbD = 1; } catch (e) {}
    }

    var VIS_API = {
      on: function () { E.on = 1; return 'on'; },
      off: function () { E.on = 0; eClear(); return 'off'; },
      is: function () { return E.on; },
      name: function (on) { E.nameOn = on ? 1 : 0; if (!on) { for (var i = 0; i < E.slots.length; i++) if (E.slots[i].name) E.slots[i].name.style.display = 'none'; } return E.nameOn; },
      nameOn: function () { return E.nameOn; },
      dmg: function (m) { if (typeof m === 'number' && m >= 1 && m <= 3) DM.mult = m; return DM.mult; },
      bone: function (on, range) { BE.on = on ? 1 : 0; if (typeof range === 'number') BE.range = range; if (!on) beClear(); return { on: BE.on, range: BE.range }; },
      ammo: function () {
        var g = G || game(); if (!g || !g.P) return null;
        var p = g.P, w = null; try { w = p.W; } catch (e) {}
        return { a: p.ammo, r: p.reserve, rl: +(p.reloading || 0), mag: w && w.mag, slot: p.slot, w: w && w.name };
      }
    };
    window.__pbvis = VIS_API; HIDDEN.pbvis = VIS_API;

    var WB = 200;
    function wbGun() {
      try { var g = G || game(); var w = g && g.P && g.P.W; return !!(w && !w.melee && !w.grenade && !w.c4); } catch (e) { return false; }
    }
    function wbPatch() {
      if (!FL.wallbang) return;
      var g = G || game(); var L = g && g.bots; if (!L || !L.length) return;
      for (var i = 0; i < L.length; i++) {
        var b = L[i];
        if (!b || b.__wb || typeof b.hitTest !== 'function') continue;
        b.__wb = 1;
        (function (b, f) {
          b.hitTest = function (o, d, m) {
            var r = (FL.wallbang && wbGun() && typeof m === 'number') ? WB : m;
            try { return f.call(this, o, d, r); } catch (e) { return null; }
          };
        })(b, b.hitTest);
      }
    }

    var AM = { at: 0 };
    function ammoTick() {
      if (!FL.infAmmo) return;
      var g = G || game(); if (!g || !g.P) return;
      var now = performance.now(); if (now < AM.at) return;
      AM.at = now + 200;
      var p = g.P, inv = null, w = null;
      try { inv = p.inv; } catch (e) {}
      if (inv) {
        for (var k in inv) {
          var s = inv[k]; if (!s || typeof s !== 'object') continue;
          if (s.w && s.w.grenade) continue;
          try { if (typeof s.reserve === 'number') s.reserve = 999; } catch (e) {}
        }
      }
      try { if (typeof p.extReserve === 'number') p.extReserve = 99; } catch (e) {}
      try { w = p.W; } catch (e) { w = null; }
      if (!w || w.melee || w.c4 || w.grenade) return;
      try { if (typeof p.ammo === 'number' && p.ammo !== 999) p.ammo = 999; } catch (e) {}
      try { if (typeof p.reserve === 'number' && p.reserve !== 999) p.reserve = 999; } catch (e) {}
    }

    function nrecTick() {
      requestAnimationFrame(nrecTick);
      if (!FL.noRecoil) return;
      try {
        var g = G || game(); if (!g || !g.P) return;
        var p = g.P, r = p.rec;
        if (r) { r.v = 0; r.A = 0; r.t = 0; r.T = 0; r.hPend = 0; r.hRate = 0; r.hState = 0; }
        if (p.kick) p.kick = 0;
      } catch (e) {}
    }
    try { requestAnimationFrame(nrecTick); } catch (e) {}

    var GB = { s: null, field: null, patched: 0, origHT: null, lastApply: 0 };
    function gbBind(s) {
      if (!s || GB.s === s) return;
      GB.s = s; GB.field = null;
      try {
        if (typeof s.flicker === 'number') GB.field = 'flicker';
        else if (typeof s.spawnProtect === 'number') GB.field = 'spawnProtect';
        else if (typeof s.protect === 'number') GB.field = 'protect';
        else if (typeof s.invuln === 'number') GB.field = 'invuln';
        else if (typeof s.invulnT === 'number') GB.field = 'invulnT';
        else if (typeof s.spawnT === 'number') GB.field = 'spawnT';
      } catch (e) { GB.field = null; }
    }
    function gbTick() {
      requestAnimationFrame(gbTick);
      try {
        if (!FL.godmode) {
          if (GB.patched && GB.s && GB.origHT) { try { GB.s.hitTest = GB.origHT; } catch (e) {} GB.patched = 0; }
          return;
        }
        var g = G || game(); if (!g || !g.P || !g.P.s) return;
        var s = g.P.s;
        if (s !== GB.s) gbBind(s);
        if (!GB.s || s.dead) return;
        var now = performance.now(); if (now - GB.lastApply < 150) return;
        GB.lastApply = now;
        if (GB.field) { try { s[GB.field] = 9e9; } catch (e) {} }
        else {
          try { if (typeof s.flicker === 'number') s.flicker = 9e9; } catch (e) {}
          try { if (typeof s.spawnProtect === 'number') s.spawnProtect = 9e9; } catch (e) {}
          try { if (typeof s.protect === 'number') s.protect = 9e9; } catch (e) {}
          try { if (typeof s.invuln === 'number') s.invuln = 9e9; } catch (e) {}
          try { if (typeof s.invulnT === 'number') s.invulnT = 9e9; } catch (e) {}
          try { if (typeof s.spawnT === 'number') s.spawnT = 9e9; } catch (e) {}
        }
        if (!GB.patched && typeof s.hitTest === 'function') {
          GB.origHT = s.hitTest;
          s.hitTest = function () { if (FL.godmode) return null; return GB.origHT.apply(this, arguments); };
          GB.patched = 1;
        }
      } catch (e) {}
    }
    try { requestAnimationFrame(gbTick); } catch (e) {}

    var PBD = (function () {
      var r = { dev: '', fp: '' };
      function rnd(n) { var s = ''; while (s.length < n) s += Math.random().toString(16).slice(2); return s.slice(0, n); }
      try {
        var d = localStorage.getItem('pb_kdev');
        var f = localStorage.getItem('pb_kfp');
        var rot = +(localStorage.getItem('pb_krot') || 0);
        if (Date.now() - rot > 7 * 24 * 3600 * 1000) { d = ''; f = ''; localStorage.setItem('pb_krot', String(Date.now())); }
        if (!d || d.length < 16) { d = (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : rnd(32); localStorage.setItem('pb_kdev', d); }
        if (!f || f.indexOf('.') < 0) { f = rnd(8) + '.' + (70 + Math.floor(Math.random() * 50)); localStorage.setItem('pb_kfp', f); }
        r.dev = d; r.fp = f;
      } catch (e) { r.dev = rnd(32); r.fp = rnd(8) + '.90'; }
      return r;
    })();
    function pbOut(d) {
      if (typeof d !== 'string' || d.length < 20 || d.length > 4096) return d;
      if (d.indexOf('"hello"') < 0 && d.indexOf('"resume"') < 0) return d;
      try { var j = JSON.parse(d); if (j && (j.t === 'hello' || j.t === 'resume')) { j.dev = PBD.dev; j.fp = PBD.fp; return JSON.stringify(j); } } catch (e) {}
      return d;
    }

    var KG = { on: 0, drop: 0 };
    function kgDrop(d) {
      if (!FL.antiKick) return false;
      if (typeof d !== 'string' || d.length < 8 || d.length > 900) return false;
      if (d.indexOf('"t"') < 0) return false;
      var low = d.toLowerCase();
      var m = low.match(/"t"\s*:\s*"([a-z_]+)"/);
      if (!m) return false;
      var t = m[1];
      if (t === 'kick' || t === 'kicked' || t === 'kickout' || t === 'ban' || t === 'banned' ||
          t === 'expel' || t === 'expulso' || t === 'removed' || t === 'removido') { KG.drop++; return true; }
      if ((t === 'error' || t === 'err') && /(kick|expuls|banid|banned|removid|removido)/.test(low)) { KG.drop++; return true; }
      return false;
    }
    (function kgInstall() {
      try {
        var OW = window.WebSocket; if (!OW || OW.__pbKG) return;
        var Pp = OW.prototype;
        var sendN = Pp.send, closeN = Pp.close;
        var rsGet = Object.getOwnPropertyDescriptor(Pp, 'readyState').get;
        function revive(rec, wait) {
          if (!FL.antiKick || rec.dead) return;
          clearTimeout(rec.timer);
          rec.timer = setTimeout(function () {
            if (!FL.antiKick || rec.dead) return;
            try { if (rec.live && rsGet.call(rec.live) === 1) return; } catch (e) {}
            var ns;
            try { ns = new OW(rec.url); } catch (e) { revive(rec, 1500); return; }
            rec.live = ns;
            try { ns.binaryType = rec.sock.binaryType || 'arraybuffer'; } catch (e) {}
            ns.onopen = function (ev) { rec.tries = 0; try { if (rec.onopen) rec.onopen.call(rec.sock, ev); } catch (e) {} };
            ns.onmessage = function (ev) { try { if (rec.onmessage) rec.onmessage.call(rec.sock, ev); } catch (e) {} };
            ns.onerror = function (ev) { try { if (rec.onerror) rec.onerror.call(rec.sock, ev); } catch (e) {} };
            ns.onclose = function (ev) {
              var code = ev ? ev.code : 0; rec.tries++;
              if (rec.tries > 40 || code === 1008) { rec.dead = 1; return; }
              revive(rec, Math.min(8000, 200 * Math.pow(1.3, Math.min(rec.tries, 12))));
            };
          }, wait == null ? 200 : wait);
        }
        function wrap(sock) {
          if (!sock || sock.__pbKG) return sock;
          var rec = { sock: sock, url: sock.url, bin: 'arraybuffer', live: null, tries: 0, dead: 0, timer: 0, onopen: null, onmessage: null, onerror: null, onclose: null };
          sock.__pbKG = rec;
          ['onopen', 'onmessage', 'onerror', 'onclose'].forEach(function (p) {
            try {
              Object.defineProperty(sock, p, {
                configurable: true,
                get: function () { return rec[p]; },
                set: function (fn) {
                  if (p === 'onmessage' && typeof fn === 'function') {
                    rec.onmessage = function (ev) { if (kgDrop(ev.data)) return; return fn.call(rec.sock, ev); };
                  } else rec[p] = fn;
                  try {
                    var d = Object.getOwnPropertyDescriptor(Pp, p);
                    if (rec.live && rsGet.call(rec.live) === 1) d.set.call(rec.live, rec[p]);
                    else d.set.call(sock, rec[p]);
                  } catch (e) {}
                }
              });
            } catch (e) {}
          });
          try { sock.send = function (d) { d = pbOut(d); try { if (rec.live && rsGet.call(rec.live) === 1) return sendN.call(rec.live, d); } catch (e) {} return sendN.call(sock, d); }; } catch (e) {}
          try { sock.close = function (c, r) { try { if (rec.live) closeN.call(rec.live, c, r); } catch (e) {} try { return closeN.call(sock, c, r); } catch (e) {} }; } catch (e) {}
          try { Object.defineProperty(sock, 'readyState', { configurable: true, get: function () { try { if (rec.live) return rsGet.call(rec.live); } catch (e) {} try { return rsGet.call(sock); } catch (e) { return 3; } } }); } catch (e) {}
          return sock;
        }
        function WSW(url, prot) {
          var s = arguments.length > 1 ? new OW(url, prot) : new OW(url);
          try { if (/[?&]k=|\/ws(\?|$)/.test(String(url))) return wrap(s); } catch (e) {}
          return s;
        }
        WSW.prototype = Pp;
        try { WSW.CONNECTING = 0; WSW.OPEN = 1; WSW.CLOSING = 2; WSW.CLOSED = 3; } catch (e) {}
        WSW.__pbKG = 1; window.WebSocket = WSW; KG.on = 1;
      } catch (e) {}
    })();

    var QC = { on: 0, fast: 0, slot: 0, ammo: -1, gate: {}, invRef: null, n: 0, sw: 0, dead: 0 };
    function qcW(p, slot) { try { var s = p.inv[slot]; return s && s.w ? s.w : null; } catch (e) { return null; } }
    function qcTap(code) {
      try {
        var o = { code: code, key: code, bubbles: true, cancelable: true };
        window.dispatchEvent(new KeyboardEvent('keydown', o));
        window.dispatchEvent(new KeyboardEvent('keyup', o));
      } catch (e) {}
    }
    function qcTick() {
      requestAnimationFrame(qcTick);
      try {
        var g = G || game(); if (!g || !g.P || !g.P.s) return;
        var p = g.P, s = p.s;
        if (!p.inv) return;
        if (QC.invRef !== p.inv) { QC.invRef = p.inv; QC.gate = {}; QC.slot = p.slot; QC.ammo = p.ammo; }
        if (s.dead) { if (!QC.dead) { QC.dead = 1; QC.gate = {}; } QC.slot = p.slot; QC.ammo = p.ammo; return; }
        if (QC.dead) { QC.dead = 0; QC.gate = {}; QC.slot = p.slot; QC.ammo = p.ammo; }
        if (p.slot === QC.slot && typeof p.ammo === 'number' && QC.ammo >= 0 && p.ammo < QC.ammo) { QC.gate[p.slot] = +p.nextShot || 0; QC.n++; }
        if (p.slot !== QC.slot) {
          if (QC.on) { p.swapEnd = 0; p.nextShot = QC.fast ? 0 : (QC.gate[p.slot] || 0); try { if (p.fpActs && p.fpActs.change) p.fpActs.change.timeScale = 8; } catch (e) {} QC.sw++; }
          QC.slot = p.slot;
        }
        QC.ammo = p.ammo;
      } catch (e) {}
    }
    try { requestAnimationFrame(qcTick); } catch (e) {}

    var PR = { on: 0, ms: 120 };
    var RF = { on: 0, last: 0 };
    
    function rfTick() {
      requestAnimationFrame(rfTick);
      if (!RF.on) return;
      try {
        var g = G || game(); if (!g || !g.P) return;
        var p = g.P, w = null; try { w = p.W; } catch (e) {}
        if (!w) return;

        if (w.auto === false) w.auto = true;
        if (w.auto === 0) w.auto = 1;
        if (w.semi === true) w.semi = false;
        if (w.semi === 1) w.semi = 0;
        
        if (typeof w.rate === 'number' && w.rate > 0.01) w.rate = 0.01;
        if (typeof w.delay === 'number' && w.delay > 0) w.delay = 0;
        if (typeof w.fireDelay === 'number' && w.fireDelay > 0) w.fireDelay = 0;
        if (typeof w.boltTime === 'number' && w.boltTime > 0) w.boltTime = 0;
        if (typeof w.boltDelay === 'number' && w.boltDelay > 0) w.boltDelay = 0;

        if (typeof p.nextShot === 'number' && p.nextShot > 0) p.nextShot = 0;
        if (typeof p.swapEnd === 'number' && p.swapEnd > 0) p.swapEnd = 0;
        if (typeof p.shotT === 'number') p.shotT = 0;
      } catch (e) {}
    }
    try { requestAnimationFrame(rfTick); } catch (e) {}

    var IS = { on: 0 };
    function isTick() {
      requestAnimationFrame(isTick);
      if (!IS.on) return;
      try {
        var g = G || game(); if (!g || !g.P) return;
        var p = g.P;
        if (p.fpActs && p.fpActs.zoom) p.fpActs.zoom.timeScale = 20;
        if (p.fpActs && p.fpActs.scope) p.fpActs.scope.timeScale = 20;
        if (typeof p.scopeT === 'number' && p.scopeT > 0 && p.scopeT < 0.2) p.scopeT = 0.05;
      } catch (e) {}
    }
    try { requestAnimationFrame(isTick); } catch (e) {}

    var TB = { on: 0, at: 0 };
    function tbTick() {
      requestAnimationFrame(tbTick);
      if (!TB.on) return;
      var now = performance.now(); if (now < TB.at) return;
      TB.at = now + 40;
      try {
        var g = G || game(); if (!g || !g.P || !g.P.s) return;
        var p = g.P, s = p.s, w = null; try { w = p.W; } catch (e) {}
        if (!w || w.melee || w.grenade || w.c4 || s.dead) return;
        var cam = g.camera, m = cam.matrixWorld.elements;
        var Cx = m[12], Cy = m[13], Cz = m[14];
        var yaw = +s.yaw || 0, pitch = +s.pitch || 0;
        var cp = Math.cos(pitch);
        var Fx = -Math.sin(yaw)*cp, Fy = Math.sin(pitch), Fz = -Math.cos(yaw)*cp;
        var orig = { x: Cx, y: Cy, z: Cz }, dir = { x: Fx, y: Fy, z: Fz };
        var list = g.bots || [];
        for (var i = 0; i < list.length; i++) {
          var b = list[i];
          if (!b || b === s || b.dead || !(b.hp > 0) || b.team === s.team) continue;
          if (typeof b.hitTest !== 'function') continue;
          var h = null; try { h = hitTestSafe(b, orig, dir, 200); } catch (e) { h = null; }
          if (!h || !h.head) continue;
          if (now < nextTap || holding) return;
          down(); holding = true;
          var holdMs = 40 + Math.random()*25;
          setTimeout(function () { if (holding) up(); }, holdMs);
          nextTap = now + holdMs + 80 + Math.random()*60;
          return;
        }
      } catch (e) {}
    }
    try { requestAnimationFrame(tbTick); } catch (e) {}

    var SA = { on: 0, fovRad: Math.PI / 3 };
    var SA_HEAD = { x: 0, y: 0, z: 0, bot: null, validUntil: 0 };

    function getTHREE() {
      if (window.THREE && window.THREE.Vector3) return window.THREE;
      try {
        var g = G || game();
        if (g && g.camera && g.camera.position && g.camera.position.constructor) {
          var V3 = g.camera.position.constructor;
          if (V3 && V3.prototype && V3.prototype.project) return { Vector3: V3 };
        }
      } catch (e) {}
      return null;
    }

    function saUpdateHead(g) {
      if (!SA.on) return;
      if (!g || !g.P || !g.P.s) return;
      var s = g.P.s;
      if (s.dead) { SA_HEAD.bot = null; return; }
      var cam = g.camera, list = g.bots || [];
      var me = cam.matrixWorld.elements;
      var cx = me[12], cy = me[13], cz = me[14];
      var yaw = +s.yaw || 0, pitch = +s.pitch || 0;
      var cp = Math.cos(pitch);
      var fx = -Math.sin(yaw) * cp, fy = Math.sin(pitch), fz = -Math.cos(yaw) * cp;

      var best = null, bestScore = 1e9;
      var prev = SA_HEAD.bot;
      if (prev && !prev.dead && prev.hp > 0 && prev.team !== s.team) {
        var prevHp = getTargetPointLead(prev, C);
        if (prevHp) {
          var pdx = prevHp.x - cx, pdy = prevHp.y - cy, pdz = prevHp.z - cz;
          var pd = Math.sqrt(pdx*pdx + pdy*pdy + pdz*pdz);
          if (pd < P.reach + 50) {
            var pdot = (pdx*fx + pdy*fy + pdz*fz) / pd;
            if (Math.acos(clamp(pdot, -1, 1)) < SA.fovRad) {
              best = prev;
              bestScore = pd * 0.5;
            }
          }
        }
      }

      for (var i = 0; i < list.length; i++) {
        var p = list[i];
        if (!isBotReal(p) || p === s || p.team === s.team) continue;
        var hp = getTargetPointLead(p, C); if (!hp) continue;
        var dx = hp.x - cx, dy = hp.y - cy, dz = hp.z - cz;
        var d = Math.sqrt(dx*dx + dy*dy + dz*dz);
        if (d < 1.5 || d > P.reach + 50) continue;
        var dot = (dx*fx + dy*fy + dz*fz) / d;
        var ang = Math.acos(clamp(dot, -1, 1));
        if (ang > SA.fovRad) continue;
        var score = ang * 100 + d * 0.3;
        if (score < bestScore) {
          bestScore = score;
          best = p;
        }
      }

      if (!best) { SA_HEAD.bot = null; return; }
      var targetPt = getTargetPointLead(best, C);
      if (!targetPt) { SA_HEAD.bot = null; return; }
      SA_HEAD.x = targetPt.x;
      SA_HEAD.y = targetPt.y;
      SA_HEAD.z = targetPt.z;
      SA_HEAD.bot = best;
      SA_HEAD.validUntil = performance.now() + 500;
    }

    function saPatch() {
      var g = G || game();
      var L = g && g.bots;
      if (!L || !L.length) return;
      for (var i = 0; i < L.length; i++) {
        var b = L[i];
        if (!b || b.__sa || typeof b.hitTest !== 'function') continue;
        b.__sa = 1;
        (function (bot, originalHitTest) {
          bot.hitTest = function (o, d, m) {
            if (!SA.on) return originalHitTest.call(this, o, d, m);
            try {
              var g2 = G || game();
              if (!g2 || !g2.P || !g2.P.s) return originalHitTest.call(this, o, d, m);
              if (this.dead || !(this.hp > 0)) return originalHitTest.call(this, o, d, m);
              if (this.team === g2.P.s.team) return originalHitTest.call(this, o, d, m);
              if (SA_HEAD.bot !== this) return originalHitTest.call(this, o, d, m);

              var curHp = getTargetPointLead(this, C);
              if (!curHp) return originalHitTest.call(this, o, d, m);
              SA_HEAD.x = curHp.x;
              SA_HEAD.y = curHp.y;
              SA_HEAD.z = curHp.z;

              var cam = g2.camera;
              var me = cam.matrixWorld.elements;
              var ox = me[12], oy = me[13], oz = me[14];
              var tdx = SA_HEAD.x - ox;
              var tdy = SA_HEAD.y - oy;
              var tdz = SA_HEAD.z - oz;
              var tlen = Math.sqrt(tdx*tdx + tdy*tdy + tdz*tdz);
              if (tlen < 1) return originalHitTest.call(this, o, d, m);

              var THREE = getTHREE();
              var no, nd;
              if (THREE && THREE.Vector3) {
                no = new THREE.Vector3(ox, oy, oz);
                nd = new THREE.Vector3(tdx/tlen, tdy/tlen, tdz/tlen);
              } else {
                try {
                  no = cam.position.clone(); no.set(ox, oy, oz);
                  nd = cam.position.clone(); nd.set(tdx/tlen, tdy/tlen, tdz/tlen);
                } catch (e) { return originalHitTest.call(this, o, d, m); }
              }
              return originalHitTest.call(this, no, nd, tlen + 2);
            } catch (e) { return originalHitTest.call(this, o, d, m); }
          };
        })(b, b.hitTest);
      }
    }

    var IR = { on: 0, at: 0 };
    function irTick() {
      requestAnimationFrame(irTick);
      if (!IR.on) return;
      var now = performance.now(); if (now < IR.at) return;
      IR.at = now + 200;
      try {
        var g = G || game(); if (!g || !g.P || !g.P.s) return;
        var s = g.P.s;
        if (s.dead) s.dead = false;
      } catch (e) {}
    }
    try { requestAnimationFrame(irTick); } catch (e) {}

    var RD = { on: 0, el: null, dots: [], last: 0 };
    function rdInit() {
      if (RD.el && RD.el.parentNode) return true;
      var host = document.body || document.documentElement; if (!host) return false;
      var w = document.createElement('div');
      w.setAttribute('data-pb', '1');
      w.style.cssText = 'position:fixed;right:8px;bottom:8px;width:120px;height:120px;border-radius:50%;background:rgba(255,255,255,.7);border:1px solid rgba(0,180,80,.6);z-index:2147483000;pointer-events:none;display:none';
      host.appendChild(w); RD.el = w; RD.dots = []; return true;
    }
    function rdDraw(g) {
      if (!RD.on) { if (RD.el) RD.el.style.display = 'none'; return; }
      if (!rdInit()) return;
      RD.el.style.display = 'block';
      var now = performance.now(); if (now - RD.last < 100) return;
      RD.last = now;
      var s = g.P && g.P.s; if (!s || !s.mover || !s.mover.pos) return;
      var sx = s.mover.pos.x, sz = s.mover.pos.z;
      var yaw = +s.yaw || 0, range = 60;
      var list = g.bots || [], idx = 0;
      for (var i = 0; i < list.length; i++) {
        var p = list[i];
        if (!p || p === s || p.dead || !(p.hp > 0) || p.team === s.team) continue;
        var e = p.obj && p.obj.matrixWorld && p.obj.matrixWorld.elements; if (!e) continue;
        var dx = e[12] - sx, dz = e[14] - sz;
        var d = Math.sqrt(dx*dx + dz*dz); if (d > range) continue;
        var ca = Math.cos(-yaw), sa = Math.sin(-yaw);
        var rx = dx*ca - dz*sa, rz = dx*sa + dz*ca;
        var cx = 60 + (rx/range)*55, cz = 60 + (rz/range)*55;
        var dot = RD.dots[idx];
        if (!dot) {
          dot = document.createElement('div');
          dot.style.cssText = 'position:absolute;width:5px;height:5px;margin:-2.5px 0 0 -2.5px;border-radius:50%;background:#ef4444';
          RD.el.appendChild(dot); RD.dots[idx] = dot;
        }
        dot.style.display = 'block';
        dot.style.left = cx.toFixed(1) + 'px';
        dot.style.top = cz.toFixed(1) + 'px';
        idx++;
      }
      for (; idx < RD.dots.length; idx++) RD.dots[idx].style.display = 'none';
    }

    var HPO = { on: 0 };
    (function hpoHook() {
      var _eSlot = eSlot;
      eSlot = function (i) {
        var s = _eSlot(i);
        if (!s.tx2) {
          s.tx2 = document.createElement('div');
          s.tx2.style.cssText = 'position:absolute;left:0;top:-13px;font:9px/10px system-ui,sans-serif;color:#f87171;text-shadow:0 1px 1px rgba(0,0,0,0.9);white-space:nowrap;font-weight:600';
          s.box.appendChild(s.tx2);
        }
        return s;
      };
      var _eDraw = eDraw;
      eDraw = function (g) {
        _eDraw(g);
        if (!HPO.on) return;
        try {
          var list = g.bots || [], self = g.P && g.P.s, idx = 0;
          for (var i = 0; i < list.length; i++) {
            var p = list[i];
            if (!p || p === self || p.dead || !(p.hp > 0) || p.team === self.team) continue;
            var s = E.slots[idx++]; if (!s || !s.tx2) continue;
            s.tx2.textContent = Math.round(p.hp) + ' HP';
            if (s.tx2.style.display !== 'block') s.tx2.style.display = 'block';
          }
          for (; idx < E.slots.length; idx++) {
            var s2 = E.slots[idx]; if (s2 && s2.tx2 && s2.tx2.style.display !== 'none') s2.tx2.style.display = 'none';
          }
        } catch (e) {}
      };
    })();

    var FC = { on: 0, el: null, last: 0 };
    function fcInit() {
      if (FC.el && FC.el.parentNode) return true;
      var host = document.body || document.documentElement; if (!host) return false;
      var w = document.createElement('div');
      w.setAttribute('data-pb', '1');
      w.style.cssText = 'position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);border:1px dashed rgba(255,255,255,0.4);border-radius:50%;z-index:2147482999;pointer-events:none;display:none';
      host.appendChild(w); FC.el = w; return true;
    }
    function fcTick() {
      requestAnimationFrame(fcTick);
      if (!FC.on) { if (FC.el) FC.el.style.display = 'none'; return; }
      if (!fcInit()) return;
      FC.el.style.display = 'block';
      var r = P.povCircleR;
      FC.el.style.width = (r*2).toFixed(0) + 'px';
      FC.el.style.height = (r*2).toFixed(0) + 'px';
    }
    try { requestAnimationFrame(fcTick); } catch (e) {}

    var SL = { on: 0 };

    var TR = { on: 0, wrap: null, host: null, hostRect: null, hostAt: 0, slots: [], last: 0 };
    function trInit() {
      if (TR.wrap && TR.wrap.parentNode) return true;
      var host = document.body || document.documentElement; if (!host) return false;
      var w = document.createElement('div');
      w.setAttribute('data-pb', '1');
      w.style.cssText = 'position:fixed;left:0;top:0;width:100%;height:100%;overflow:hidden;pointer-events:none;z-index:2147482999';
      host.appendChild(w); TR.wrap = w; TR.slots = []; return true;
    }
    function trSlot(i) {
      var s = TR.slots[i]; if (s) return s;
      var line = document.createElement('div');
      line.style.cssText = 'position:absolute;left:0;top:0;height:1px;background:linear-gradient(90deg,rgba(56,189,248,0.8),rgba(56,189,248,0.1));transform-origin:0 50%;display:none;border-radius:1px';
      TR.wrap.appendChild(line); s = { line: line }; TR.slots[i] = s; return s;
    }
    function trClear() { for (var i = 0; i < TR.slots.length; i++) TR.slots[i].line.style.display = 'none'; }
    function trHost() {
      var now = performance.now();
      if (TR.host && TR.host.parentNode && now - TR.hostAt < 1000) return TR.host;
      TR.hostAt = now;
      var best = null, ba = 0, cs = document.getElementsByTagName('canvas');
      for (var i = 0; i < cs.length; i++) {
        var c = cs[i]; if (c.getAttribute('data-pb') || c.id === 'crossCv') continue;
        var a = c.offsetWidth * c.offsetHeight;
        if (a > ba) { ba = a; best = c; }
      }
      TR.host = best || null;
      if (TR.host) TR.hostRect = TR.host.getBoundingClientRect();
      return TR.host;
    }
    var _trV = null;
    function trProj(cam, r, x, y, z) {
      if (!_trV) { try { _trV = cam.position.clone(); } catch (e) { return null; } }
      var d = _trV.set(x, y, z).project(cam);
      if (!(d.z > -1 && d.z < 1)) return null;
      return { x: r.left + (d.x*0.5 + 0.5)*r.width, y: r.top + (-d.y*0.5 + 0.5)*r.height };
    }
    function trDraw(g) {
      if (!TR.on) { if (TR.wrap) trClear(); return; }
      var cam = g.camera, list = g.bots, self = g.P && g.P.s;
      if (!list || !cam || !self || self.dead) { trClear(); return; }
      if (!trInit()) return;
      var host = trHost(); if (!host) { trClear(); return; }
      var r = TR.hostRect || host.getBoundingClientRect(); if (!(r.width > 0)) { trClear(); return; }
      var ox = r.left + r.width/2, oy = r.top;
      var my = self.team, idx = 0;
      for (var i = 0; i < list.length; i++) {
        var p = list[i];
        if (!p || !p.obj || !p.c || p === self) continue;
        if (p.team === my || p.dead || !(p.hp > 0)) continue;
        var hp = headPoint(p); if (!hp) continue;
        var t = trProj(cam, r, hp.x, hp.y, hp.z); if (!t) continue;
        if (t.x < r.left - 40 || t.x > r.left + r.width + 40) continue;
        if (t.y < r.top - 40 || t.y > r.top + r.height + 40) continue;
        var dx = t.x - ox, dy = t.y - oy, len = Math.sqrt(dx*dx + dy*dy);
        if (len < 20) continue;
        var ang = Math.atan2(dy, dx)*180/Math.PI;
        var s = trSlot(idx++);
        s.line.style.display = 'block';
        s.line.style.left = ox.toFixed(1) + 'px';
        s.line.style.top = oy.toFixed(1) + 'px';
        s.line.style.width = len.toFixed(1) + 'px';
        s.line.style.transform = 'rotate(' + ang.toFixed(2) + 'deg)';
      }
      for (; idx < TR.slots.length; idx++) TR.slots[idx].line.style.display = 'none';
    }

    var PBX_API = {
      pred: function (on, ms) { PR.on = on ? 1 : 0; if (typeof ms === 'number') PR.ms = ms; return { on: PR.on, ms: PR.ms }; },
      rapid: function (on) { RF.on = on ? 1 : 0; return RF.on; },
      instScope: function (on) { IS.on = on ? 1 : 0; return IS.on; },
      trig: function (on) { TB.on = on ? 1 : 0; return TB.on; },
      silent: function (on) { SA.on = on ? 1 : 0; saPatch(); return SA.on; },
      silentFov: function (deg) { if (typeof deg === 'number' && deg > 0 && deg < 180) SA.fovRad = deg * Math.PI / 180; return SA.fovRad * 180 / Math.PI; },
      lob: function (on) { SL.on = on ? 1 : 0; return SL.on; },
      respawn: function (on) { IR.on = on ? 1 : 0; return IR.on; },
      radar: function (on) { RD.on = on ? 1 : 0; if (!on && RD.el) RD.el.style.display = 'none'; return RD.on; },
      hpo: function (on) { HPO.on = on ? 1 : 0; return HPO.on; },
      fovc: function (on) { FC.on = on ? 1 : 0; return FC.on; },
      tracer: function (on) { TR.on = on ? 1 : 0; if (!on) trClear(); return TR.on; },
      wallbang: function (on) { FL.wallbang = on ? 1 : 0; return FL.wallbang; },
      infAmmo: function (on) { FL.infAmmo = on ? 1 : 0; return FL.infAmmo; },
      noRecoil: function (on) { FL.noRecoil = on ? 1 : 0; return FL.noRecoil; },
      godmode: function (on) { FL.godmode = on ? 1 : 0; return FL.godmode; },
      noclip: function (on) {
        FL.noclip = on ? 1 : 0;
        if (!FL.noclip) ncUninstall(); else ncInstall();
        return FL.noclip;
      },
      antiKick: function (on) { FL.antiKick = on ? 1 : 0; return FL.antiKick; },
      smoothFire: function (on) { SF.on = on ? 1 : 0; return SF.on; },

      fly: function (on) { return flyToggle(on); },
      flyMode: function (m) { if (m === 'jump' || m === 'hover') FLY.mode = m; return FLY.mode; },
      flySt: function () { return { on: FLY.on, mode: FLY.mode, jump: FLY.jumpHeld }; },
      flyBypass: function (on) { FLYB.on = on ? 1 : 0; return FLYB.on; },

      noFall: function (on) { FL.noFall = on ? 1 : 0; return FL.noFall; },

      infNade: function (on) { FL.infNade = on ? 1 : 0; return FL.infNade; },
      infNadeMax: function (n) { if (typeof n === 'number' && n >= 1 && n <= 999) FL.infNadeMax = n | 0; return FL.infNadeMax; },
      infNadeSt: function () {
        var g = G || game();
        var out = { on: FL.infNade, max: FL.infNadeMax, count: NG.count, grenades: [] };
        try {
          var p = g && g.P, inv = p && p.inv;
          if (inv) for (var k in inv) {
            var s = inv[k];
            if (s && s.w && s.w.grenade) {
              out.grenades.push({ slot: +k, name: s.w.name || s.w.id, kind: s.w.kind, ammo: s.ammo, reserve: s.reserve });
            }
          }
        } catch (e) {}
        return out;
      },

      silentNade: function (on) { SN.on = on ? 1 : 0; return SN.on; },
      silentNadeHoming: function (on) { SN.homing = on ? 1 : 0; return SN.homing; },
      silentNadeLOS: function (on) { SN.requireLOS = on ? 1 : 0; return SN.requireLOS; },
      silentNadeBypass: function (on) { SNB.on = on ? 1 : 0; return SNB.on; },
      silentNadeSt: function () {
        return {
          on: SN.on,
          homing: SN.homing,
          nadeCount: SN.nadeCount,
          hasTarget: !!SN.lockedTarget,
          bypass: SNB.on
        };
      },

      st: function () {
        return {
          pred: PR.on, rapid: RF.on, instScope: IS.on,
          trig: TB.on, silent: SA.on, silentFov: SA.fovRad * 180 / Math.PI, lob: SL.on, respawn: IR.on,
          radar: RD.on, hpo: HPO.on, fovc: FC.on, tracer: TR.on,
          wallbang: FL.wallbang, infAmmo: FL.infAmmo, noRecoil: FL.noRecoil,
          godmode: FL.godmode, noclip: FL.noclip, antiKick: FL.antiKick,
          aimbot: P.aimbotOn, smoothFire: SF.on, bulletSpeed: P.bulletSpeed, leadFactor: P.leadFactor,
          lockMode: P.lockMode,
          flyOn: FLY.on, flyMode: FLY.mode, flyBypass: FLYB.on,
          noFall: FL.noFall,
          infNade: FL.infNade, infNadeMax: FL.infNadeMax,
          silentNade: SN.on, silentNadeBypass: SNB.on,
          espName: E.nameOn,
          saHead: SA_HEAD.bot ? {
            x: +SA_HEAD.x.toFixed(2),
            y: +SA_HEAD.y.toFixed(2),
            z: +SA_HEAD.z.toFixed(2),
            name: SA_HEAD.bot.name,
            hp: SA_HEAD.bot.hp
          } : null
        };
      }
    };
    window.__pbx = PBX_API; HIDDEN.pbx = PBX_API;

    var _saLast = 0;
    var _trLast = 0;
    (function pbxFrame() {
      requestAnimationFrame(pbxFrame);
      try {
        var g = G || game(); if (!g) return;
        var now = performance.now();
        if (SA.on && now - _saLast > 50) {
          _saLast = now;
          saUpdateHead(g);
          saPatch();
        }
        if (RD.on) rdDraw(g);
        if (TR.on && now - _trLast > 50) { _trLast = now; trDraw(g); }
      } catch (e) {}
    })();

    (function hideAPIs() {
      try {
        ['__pb', '__pbvis', '__pbnade', '__pbqc', '__pbx', '__autoqq'].forEach(function (k) {
          try {
            var v = window[k];
            if (!v) return;
            Object.defineProperty(window, k, { configurable: false, enumerable: false, get: function () { return v; } });
          } catch (e) {}
        });
      } catch (e) {}
    })();

    log(BRAND, V, 'up');
    requestAnimationFrame(tick);

    var __gCheck = setInterval(function () {
      if (window.G) { clearInterval(__gCheck); }
    }, 1000);

    /* ============================================================
       UI & FPS REALTIME MONITOR + HIDE UI
       ============================================================ */
    (function pbUI() {
      if (window.__pbUI) return;
      window.__pbUI = 1;

      (function ensureFA() {
        try {
          if (document.querySelector('link[data-fa]')) return;
          var l = document.createElement('link');
          l.rel = 'stylesheet';
          l.setAttribute('data-fa', '1');
          l.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css';
          (document.head || document.documentElement).appendChild(l);
        } catch (e) {}
      })();

      var css = [
        '.fk{position:fixed;top:8px;right:8px;z-index:2147483600;font:12px/1.3 system-ui,Tahoma,sans-serif;color:#1f2937;',
        '  background:#fff;border:1px solid #e8ecf0;border-radius:10px;',
        '  box-shadow:0 3px 14px rgba(0,0,0,.08);pointer-events:auto;user-select:none;overflow:hidden;transition:width .15s,height .15s;max-height:96vh;display:flex;flex-direction:column}',
        '.fk.hide{display:none}',
        '.fk.expanded{display:flex;flex-direction:row}',
        '.fk.expanded .fk-rail{display:flex;flex-direction:column;background:#fafbfc;border-right:1px solid #eef1f4;',
        '  width:46px;padding:4px 0;gap:1px;flex:0 0 46px;order:0;overflow-y:auto;max-height:92vh}',
        '.fk-rail::-webkit-scrollbar{width:2px}',
        '.fk-rail::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:2px}',
        '.fk-rail::-webkit-scrollbar-track{background:transparent}',
        '.fk.expanded .fk-body-col{order:1;width:290px;display:flex;flex-direction:column;min-width:0}',
        '.fk.expanded .fk-tabbar{display:none}',
        '.fk.collapsed{width:auto}',
        '.fk.collapsed .fk-rail{display:none}',
        '.fk.collapsed .fk-body-col{display:none}',
        '.fk.collapsed .fk-tabbar{display:flex;align-items:center;gap:6px;padding:5px 9px;background:#fafbfc;border-radius:10px;cursor:move}',
        '.fk.collapsed .fk-tb-title{font:800 11px/1 system-ui,Tahoma,sans-serif;color:#0f172a;letter-spacing:.5px;white-space:nowrap}',
        '.fk.collapsed .fk-tb-title .dot{display:inline-block;width:7px;height:7px;border-radius:50%;background:#7c3aed;margin-right:5px;vertical-align:middle}',
        '.fk-tabbar .fk-tb-open{width:22px;height:22px;border-radius:5px;display:flex;align-items:center;',
        '  justify-content:center;font-size:12px;color:#fff;cursor:pointer;background:#7c3aed;font-weight:900;flex:0 0 22px;line-height:1}',
        '.fk-tabbar .fk-tb-open:hover{background:#6d28d9}',
        '.fk-rail .fk-rail-btn{width:42px;height:38px;margin:0 auto;border-radius:6px;display:flex;flex-direction:column;',
        '  align-items:center;justify-content:center;gap:1px;color:#8892a0;cursor:pointer;transition:all .12s;flex:0 0 38px}',
        '.fk-rail .fk-rail-btn i{font-size:11px;line-height:1}',
        '.fk-rail .fk-rail-btn span{font-size:6.5px;font-weight:800;letter-spacing:.2px;line-height:1}',
        '.fk-rail .fk-rail-btn:hover{background:#f0f2f5;color:#7c3aed}',
        '.fk-rail .fk-rail-btn.on{background:#7c3aed;color:#fff}',
        '.fk-h{display:flex;align-items:center;gap:6px;padding:7px 10px;border-bottom:1px solid #eef1f4;',
        '  background:#fafbfc;font-weight:700;cursor:move}',
        '.fk-h .dot{width:7px;height:7px;border-radius:50%;background:#7c3aed;flex:0 0 7px}',
        '.fk-h .title{font-size:12px;color:#0f172a;letter-spacing:.4px}',
        '.fk-h .v{opacity:.7;font-weight:400;font-size:9px;margin-left:auto;color:#8892a0}',
        '.fk-toggle-group{display:flex;gap:4px;margin-left:4px}',
        '.fk-toggle{cursor:pointer;color:#fff;border-radius:4px;',
        '  width:20px;height:20px;display:flex;align-items:center;justify-content:center;flex:0 0 20px;font-size:10px;background:#7c3aed}',
        '.fk-toggle:hover{background:#6d28d9}',
        '.fk-body{padding:6px 9px 9px;max-height:60vh;overflow:auto;background:#fff}',
        '.fk-body::-webkit-scrollbar{width:3px}',
        '.fk-body::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:2px}',
        '.fk-page{display:none}',
        '.fk-page.on{display:block}',
        '.fk-sec{margin:8px 0 4px;font-size:9px;letter-spacing:1px;color:#7c3aed;text-transform:uppercase;opacity:.9;font-weight:800;display:flex;align-items:center;gap:4px}',
        '.fk-sec:first-child{margin-top:0}',
        '.fk-sec i{font-size:10px}',
        '.fk-row{display:flex;align-items:center;justify-content:space-between;gap:6px;padding:3px 0}',
        '.fk-row label{flex:1;color:#334155;font-size:11px;line-height:1.25}',
        '.fk-row small{display:block;color:#a0aab5;font-size:9px;line-height:1.15;margin-top:1px}',
        '.fk-row .risk-badge{display:inline-block;padding:0 3px;margin-left:3px;border-radius:2px;font-size:7px;',
        '  background:#f59e0b;color:#fff;font-weight:900;vertical-align:middle;letter-spacing:.2px;line-height:9px}',
        '.fk-row .new-badge{display:inline-block;padding:0 3px;margin-left:3px;border-radius:2px;font-size:7px;',
        '  background:#10b981;color:#fff;font-weight:900;vertical-align:middle;letter-spacing:.2px;line-height:9px}',
        '.fk-sw{position:relative;width:32px;height:17px;flex:0 0 32px;border-radius:9px;background:#d4dae1;transition:background .15s;cursor:pointer}',
        '.fk-sw::after{content:"";position:absolute;top:2px;left:2px;width:13px;height:13px;border-radius:50%;background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.15);transition:transform .15s}',
        '.fk-sw.on{background:#7c3aed}',
        '.fk-sw.on::after{transform:translateX(15px)}',
        '.fk-slider{display:flex;align-items:center;gap:6px;padding:2px 0}',
        '.fk-slider label{flex:0 0 80px;font-size:10px;color:#334155}',
        '.fk-slider input[type=range]{flex:1;height:2px;-webkit-appearance:none;background:#d4dae1;border-radius:2px;outline:none}',
        '.fk-slider input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:12px;height:12px;border-radius:50%;background:#7c3aed;cursor:pointer}',
        '.fk-slider .n{flex:0 0 42px;text-align:right;font-size:9px;color:#7c3aed;font-variant-numeric:tabular-nums;font-weight:700}',
        '.fk-select{width:100%;box-sizing:border-box;padding:4px 7px;border:1px solid #cbd5e1;border-radius:5px;font:11px system-ui,sans-serif;outline:none;background:#fff;color:#334155;cursor:pointer;margin-top:2px}',
        '.fk-select:focus{border-color:#7c3aed}',
        '.fk-btns{display:flex;gap:5px;margin-top:5px}',
        '.fk-btn{flex:1;padding:5px 0;text-align:center;border-radius:5px;background:#f1f5f9;border:1px solid #d4dae1;',
        '  color:#334155;cursor:pointer;font-size:10px;transition:background .15s;display:flex;align-items:center;justify-content:center;gap:4px}',
        '.fk-btn:hover{background:#e2e8f0}',
        '.fk-btn:active{background:#7c3aed;color:#fff}',
        '.fk-btn.on{background:#7c3aed;border-color:#7c3aed;color:#fff}',
        '.fk-btn.danger{border-color:#fca5a5;background:#fef2f2;color:#b91c1c}',
        '.fk-btn.danger:hover{background:#fee2e2}',
        '.fk-foot{margin-top:6px;padding-top:5px;border-top:1px solid #eef1f4;font-size:9px;color:#8892a0;font-variant-numeric:tabular-nums}',
        '.fk-warn{margin-top:5px;padding:4px 6px;border-radius:5px;background:#fffbeb;border:1px solid #fcd34d;',
        '  color:#92400e;font-size:9px;line-height:1.25}',
        '.fk-sa-tgt{font-size:9px;color:#10b981;padding:2px 6px;margin-top:3px;background:#ecfdf5;border-radius:4px;border:1px solid #6ee7b7}',
        '.fk-nade-st{font-size:9px;color:#7c3aed;padding:2px 6px;margin-top:3px;background:#f5f3ff;border-radius:4px;border:1px solid #c4b5fd;line-height:1.35}',
        '#ir-fps-ms{position:fixed;top:8px;left:50%;transform:translateX(-50%);z-index:2147483605;background:rgba(0,0,0,0.6);color:#00ffcc;padding:3px 8px;border-radius:6px;font:700 11px monospace;pointer-events:none;box-shadow:0 2px 6px rgba(0,0,0,0.3)}',
        '#ir-float-eye{position:fixed;top:8px;right:8px;z-index:2147483606;background:rgba(124,58,237,0.20);color:rgba(255,255,255,0.75);width:28px;height:28px;border-radius:50%;display:none;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 2px 6px rgba(0,0,0,0.2);border:1px solid rgba(255,255,255,0.25);font-size:11px;transition:all .15s}',
        '#ir-float-eye:hover{background:rgba(124,58,237,0.7);color:#fff}'
      ].join('');

      var style = document.createElement('style');
      style.setAttribute('data-pb', '1');
      style.textContent = css;
      (document.head || document.documentElement).appendChild(style);

      var fpsMsEl = document.createElement('div');
      fpsMsEl.id = 'ir-fps-ms';
      fpsMsEl.textContent = 'FPS: 60';
      (document.body || document.documentElement).appendChild(fpsMsEl);

      var floatEye = document.createElement('div');
      floatEye.id = 'ir-float-eye';
      floatEye.innerHTML = '<i class="fa-solid fa-eye"></i>';
      floatEye.title = 'Tampilkan Menu';
      (document.body || document.documentElement).appendChild(floatEye);

      var frameCount = 0, lastFpsUpdate = performance.now(), currentFps = 60;
      function fpsLoop(now) {
        frameCount++;
        if (now - lastFpsUpdate >= 500) {
          currentFps = Math.round((frameCount * 1000) / (now - lastFpsUpdate));
          frameCount = 0;
          lastFpsUpdate = now;
          fpsMsEl.textContent = 'FPS: ' + currentFps;
        }
        requestAnimationFrame(fpsLoop);
      }
      requestAnimationFrame(fpsLoop);

      function el(tag, cls, txt) {
        var e = document.createElement(tag);
        if (cls) e.className = cls;
        if (txt != null) e.textContent = txt;
        return e;
      }

      function toggle(lsKey, initialDefault, onChange) {
        var savedVal = null;
        try { savedVal = localStorage.getItem('iril_tg_' + lsKey); } catch (e) {}
        
        var state = savedVal !== null ? (savedVal === 'true') : !!initialDefault;
        var sw = el('div', 'fk-sw' + (state ? ' on' : ''));
        
        if (state) {
          try { onChange(true); } catch (e) {}
        }

        sw.addEventListener('click', function () {
          state = !state; 
          sw.classList.toggle('on', state);
          try { localStorage.setItem('iril_tg_' + lsKey, state); } catch (e) {}
          try { onChange(state); } catch (e) {}
          refreshFoot();
        });
        return { node: sw, get: function () { return state; }, set: function (v) { state = !!v; sw.classList.toggle('on', state); } };
      }

      function slider(min, max, step, val, fmt, onChange) {
        var wrap = el('div', 'fk-slider');
        var lb = el('label', null, '');
        var inp = document.createElement('input');
        inp.type = 'range'; inp.min = min; inp.max = max; inp.step = step; inp.value = val;
        var num = el('div', 'n', fmt(val));
        wrap.appendChild(lb); wrap.appendChild(inp); wrap.appendChild(num);
        inp.addEventListener('input', function () {
          var v = parseFloat(inp.value);
          num.textContent = fmt(v);
          try { onChange(v); } catch (e) {}
        });
        return { node: wrap, label: lb, input: inp, set: function (v) { inp.value = v; num.textContent = fmt(v); } };
      }
      function row(label, node, smallTxt) {
        var r = el('div', 'fk-row');
        var lb = el('label', null, label);
        if (smallTxt) lb.appendChild(el('small', null, smallTxt));
        r.appendChild(lb); r.appendChild(node);
        return r;
      }
      function rowRisk(label, node, smallTxt) {
        var r = el('div', 'fk-row');
        var lb = el('label', null, label);
        lb.appendChild(el('span', 'risk-badge', 'RISK'));
        if (smallTxt) lb.appendChild(el('small', null, smallTxt));
        r.appendChild(lb); r.appendChild(node);
        return r;
      }
      function rowNew(label, node, smallTxt) {
        var r = el('div', 'fk-row');
        var lb = el('label', null, label);
        lb.appendChild(el('span', 'new-badge', 'NEW'));
        if (smallTxt) lb.appendChild(el('small', null, smallTxt));
        r.appendChild(lb); r.appendChild(node);
        return r;
      }
      function sec(icon, text) {
        var s = el('div', 'fk-sec');
        s.innerHTML = '<i class="fa-solid ' + icon + '"></i> ' + text;
        return s;
      }

      var panel = el('div', 'fk collapsed');
      panel.setAttribute('data-pb', '1');

      var rail = el('div', 'fk-rail');
      var bodyCol = el('div', 'fk-body-col');
      var head = el('div', 'fk-h');
      head.appendChild(el('div', 'dot'));
      head.appendChild(el('div', 'title', 'iRiLLL MODZ'));
      head.appendChild(el('div', 'v', 'V' + V));
      
      var toggleGroup = el('div', 'fk-toggle-group');
      
      var hideUiBtn = el('div', 'fk-toggle');
      hideUiBtn.innerHTML = '<i class="fa-solid fa-eye-slash"></i>';
      hideUiBtn.title = 'Hide UI';
      toggleGroup.appendChild(hideUiBtn);

      var toggleBtn = el('div', 'fk-toggle');
      toggleBtn.innerHTML = '<i class="fa-solid fa-minus"></i>';
      toggleBtn.title = 'Minimize';
      toggleGroup.appendChild(toggleBtn);
      
      head.appendChild(toggleGroup);
      var body = el('div', 'fk-body');
      bodyCol.appendChild(head);
      bodyCol.appendChild(body);

      var tabbar = el('div', 'fk-tabbar');
      var tbTitle = el('div', 'fk-tb-title');
      tbTitle.innerHTML = '<span class="dot"></span>iRiLLL MODZ';
      tabbar.appendChild(tbTitle);
      var tbOpen = el('div', 'fk-tb-open', '+');
      tbOpen.title = 'Buka menu';
      tbOpen.addEventListener('click', function (e) { e.stopPropagation(); setCollapsed(false); });
      tbOpen.addEventListener('mousedown', function (e) { e.stopPropagation(); });
      tbOpen.addEventListener('touchstart', function (e) { e.stopPropagation(); }, { passive: true });
      tabbar.appendChild(tbOpen);

      panel.appendChild(rail);
      panel.appendChild(bodyCol);
      panel.appendChild(tabbar);

      function setUiHidden(hidden) {
        if (hidden) {
          panel.style.display = 'none';
          floatEye.style.display = 'flex';
        } else {
          panel.style.display = 'flex';
          floatEye.style.display = 'none';
        }
      }

      hideUiBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        setUiHidden(true);
      });
      floatEye.addEventListener('click', function () {
        setUiHidden(false);
      });

      var TAB_META = {
        aim:    { icon: 'fa-crosshairs',    label: 'AIM',    title: 'Aim Lock' },
        aimbot: { icon: 'fa-bullseye',      label: 'AIMBOT', title: 'Aimbot' },
        esp:    { icon: 'fa-eye',           label: 'ESP',    title: 'ESP' },
        silent: { icon: 'fa-crosshairs',    label: 'SILENT', title: 'Silent Aim' },
        shoot:  { icon: 'fa-gun',           label: 'SHOOT',  title: 'Shooting' },
        autoqq: { icon: 'fa-bolt',          label: 'QQ',     title: 'Auto QQ / Quick Switch' },
        combat: { icon: 'fa-shield-halved', label: 'COMBAT', title: 'Combat' },
        fly:    { icon: 'fa-plane',         label: 'FLY',    title: 'Fly' },
        noclip: { icon: 'fa-ghost',         label: 'NOCLIP', title: 'Noclip' },
        nade:   { icon: 'fa-bomb',          label: 'NADE',   title: 'Grenade' },
        move:   { icon: 'fa-feather',       label: 'MOVE',   title: 'Movement' },
        misc:   { icon: 'fa-sliders',       label: 'MISC',   title: 'Misc' },
        info:   { icon: 'fa-circle-info',   label: 'INFO',   title: 'Info' }
      };

      function setCollapsed(collapsed) {
        panel.classList.toggle('collapsed', collapsed);
        panel.classList.toggle('expanded', !collapsed);
        try { localStorage.setItem('ir_collapsed', collapsed ? '1' : '0'); } catch (e) {}
      }
      toggleBtn.addEventListener('click', function (e) { e.stopPropagation(); setCollapsed(true); });
      toggleBtn.addEventListener('mousedown', function (e) { e.stopPropagation(); });
      toggleBtn.addEventListener('touchstart', function (e) { e.stopPropagation(); }, { passive: true });

      var TAB_KEY = 'ir_ui_tab';
      var tabsRail = {}, pages = {}, order = [];

      function addTab(key, label) {
        var meta = TAB_META[key] || { icon: 'fa-circle', label: label, title: label };
        var tR = el('div', 'fk-rail-btn');
        tR.innerHTML = '<i class="fa-solid ' + meta.icon + '"></i><span>' + meta.label + '</span>';
        tR.title = meta.title;
        tR.addEventListener('click', function () { selectTab(key); });
        rail.appendChild(tR);
        tabsRail[key] = tR;

        var p = el('div', 'fk-page');
        body.appendChild(p);
        pages[key] = p;
        order.push(key);
        return p;
      }
      function selectTab(key) {
        order.forEach(function (k) {
          tabsRail[k].classList.toggle('on', k === key);
          pages[k].classList.toggle('on', k === key);
        });
        try { localStorage.setItem(TAB_KEY, key); } catch (e) {}
      }

      var pAim = addTab('aim', 'AIM');
      pAim.appendChild(sec('fa-crosshairs', 'Mode Aim Lock'));

      var lockModeSel = el('select', 'fk-select');
      lockModeSel.innerHTML =
        '<option value="pov">POV Circle</option>' +
        '<option value="legacy">Legacy Cone</option>';
      lockModeSel.value = P.lockMode;
      lockModeSel.addEventListener('change', function () { window.__pb.lockMode(this.value); });
      pAim.appendChild(lockModeSel);

      pAim.appendChild(sec('fa-bullseye', 'Titik Tembak'));
      var hitboxSelect = el('select', 'fk-select');
      hitboxSelect.innerHTML = '<option value="head">Head</option><option value="neck">Neck</option><option value="body">Body</option><option value="nearest">Nearest</option>';
      hitboxSelect.value = P.hitbox;
      hitboxSelect.addEventListener('change', function () { window.__pb.hitbox(this.value); });
      pAim.appendChild(hitboxSelect);

      pAim.appendChild(sec('fa-rocket', 'Lead Prediction'));
      var bsS = slider(100, 800, 10, P.bulletSpeed, function (v) { return v.toFixed(0) + 'm/s'; }, function (v) { window.__pb.bulletSpeed(v); });
      bsS.label.textContent = 'Bullet speed'; pAim.appendChild(bsS.node);
      var lfS = slider(0, 2, 0.05, P.leadFactor, function (v) { return 'x' + v.toFixed(2); }, function (v) { window.__pb.leadFactor(v); });
      lfS.label.textContent = 'Lead factor'; pAim.appendChild(lfS.node);

      pAim.appendChild(sec('fa-lock', 'Aim Lock'));
      var aimT = toggle('aim_lock', false, function (on) { if (on) window.__pb.on(); else window.__pb.off(); });
      pAim.appendChild(row('Aim lock', aimT.node, 'Auto aim ke target'));
      var autoFireT = toggle('aim_autofire', false, function (on) { P.autoFire = on ? 1 : 0; });
      pAim.appendChild(row('Auto fire', autoFireT.node, 'Tembak otomatis saat lock'));
      var invertT = toggle('aim_invert', false, function (on) { O.invert = on; });
      pAim.appendChild(row('Invert Y', invertT.node, 'Balik arah vertikal'));

      var pAb = addTab('aimbot', 'AIMBOT');
      pAb.appendChild(sec('fa-bullseye', 'Aimbot'));
      var aimbotT = toggle('aimbot_en', false, function (on) { window.__pb.aimbot(on); });
      pAb.appendChild(rowRisk('Enable aimbot', aimbotT.node, 'Snap saat fire + wajib POV'));
      var abGainS = slider(0.5, 3.0, 0.05, P.aimbotGain,
        function (v) { return 'x' + v.toFixed(2); },
        function (v) { window.__pb.aimbotGain(v); });
      abGainS.label.textContent = 'Snap speed'; pAb.appendChild(abGainS.node);
      var abHoldS = slider(50, 800, 10, P.aimbotHoldMs,
        function (v) { return v.toFixed(0) + 'ms'; },
        function (v) { window.__pb.aimbotHold(v); });
      abHoldS.label.textContent = 'Lock duration'; pAb.appendChild(abHoldS.node);

      pAb.appendChild(sec('fa-circle-notch', 'POV Circle'));
      var fcT = toggle('pov_circle_show', false, function (on) { window.__pbx.fovc(on); });
      pAb.appendChild(row('Show circle', fcT.node, 'Ring POV'));
      var povCircleS = slider(1, 1500, 1, P.povCircleR,
        function (v) { return v.toFixed(0) + 'px'; },
        function (v) { window.__pb.povCircle(v); });
      povCircleS.label.textContent = 'Circle size';
      pAb.appendChild(povCircleS.node);

      var pEsp = addTab('esp', 'ESP');
      pEsp.appendChild(sec('fa-layer-group', 'Overlay'));
      var espT = toggle('esp_enemy', false, function (on) { if (on) window.__pbvis.on(); else window.__pbvis.off(); });
      pEsp.appendChild(row('Enemy ESP', espT.node, 'Box + HP bar (Light & Synced)'));
      var espNameT = toggle('esp_name', false, function (on) { window.__pbvis.name(on); });
      pEsp.appendChild(rowNew('ESP name', espNameT.node, 'Nama di atas box'));
      var boneT = toggle('esp_bone', false, function (on) { window.__pbvis.bone(on, BE.range); });
      pEsp.appendChild(rowRisk('Bone ESP', boneT.node, 'Skeleton musuh'));
      var boneRangeS = slider(20, 120, 5, BE.range, function (v) { return v + 'm'; }, function (v) { BE.range = v; if (BE.on) window.__pbvis.bone(1, v); });
      boneRangeS.label.textContent = 'Bone range'; pEsp.appendChild(boneRangeS.node);
      var hpoT = toggle('esp_hp', false, function (on) { window.__pbx.hpo(on); });
      pEsp.appendChild(row('HP overlay', hpoT.node, 'Angka HP'));
      var rdT = toggle('esp_radar', false, function (on) { window.__pbx.radar(on); });
      pEsp.appendChild(row('Radar mini', rdT.node, 'Minimap musuh'));
      var trT = toggle('esp_tracer', false, function (on) { window.__pbx.tracer(on); });
      pEsp.appendChild(row('ESP tracer', trT.node, 'Garis ke musuh'));

      pEsp.appendChild(sec('fa-heart-pulse', 'Damage'));
      var dmgS = slider(1.0, 3.0, 0.05, 1.3, function (v) { return 'x' + v.toFixed(2); }, function (v) { if (window.__pbvis) window.__pbvis.dmg(v); });
      dmgS.label.textContent = 'Damage'; pEsp.appendChild(dmgS.node);

      var pSil = addTab('silent', 'SILENT');
      pSil.appendChild(sec('fa-crosshairs', 'Silent Aim'));
      var saT = toggle('silent_aim', false, function (on) { window.__pbx.silent(on); });
      pSil.appendChild(rowRisk('Silent aim', saT.node, 'Peluru auto ke kepala'));
      var saFovS = slider(30, 170, 5, SA.fovRad * 180 / Math.PI, function (v) { return v.toFixed(0) + '°'; }, function (v) { window.__pbx.silentFov(v); });
      saFovS.label.textContent = 'Silent FOV'; pSil.appendChild(saFovS.node);
      var saTgt = el('div', 'fk-sa-tgt', 'target: —');
      pSil.appendChild(saTgt);
      var tbT = toggle('auto_trig', false, function (on) { window.__pbx.trig(on); });
      pSil.appendChild(rowRisk('Auto trigger', tbT.node, 'Tembak saat target masuk'));

      pSil.appendChild(sec('fa-bullseye', 'Prediction'));
      var predT = toggle('pred_lead', false, function (on) { window.__pbx.pred(on, PR.ms); });
      pSil.appendChild(rowRisk('Prediction (lead)', predT.node, 'Aim ke depan target'));
      var predS = slider(0, 400, 10, PR.ms, function (v) { return v.toFixed(0) + 'ms'; }, function (v) { PR.ms = v; if (PR.on) window.__pbx.pred(1, v); });
      predS.label.textContent = 'Lead time'; pSil.appendChild(predS.node);

      var pShoot = addTab('shoot', 'SHOOT');
      pShoot.appendChild(sec('fa-gun', 'Fire Rate'));
      var sfT = toggle('smooth_fire', false, function (on) { window.__pbx.smoothFire(on); });
      pShoot.appendChild(row('Smooth fire', sfT.node, 'Anti macet'));
      
      var rapidT = toggle('rapid_fire', false, function (on) { window.__pbx.rapid(on); });
      pShoot.appendChild(rowRisk('Force Auto (Rifling)', rapidT.node, 'Sniper/Pistol/Shotgun otomatis'));
      
      var isT2 = toggle('inst_scope', false, function (on) { window.__pbx.instScope(on); });
      pShoot.appendChild(rowRisk('Instant scope', isT2.node, 'Scope cepat'));

      /* TAB BARU: AUTO QQ */
      var pQq = addTab('autoqq', 'QQ');
      pQq.appendChild(sec('fa-bolt', 'Auto Quick Switch'));
      var qqT = toggle('auto_qq_en', false, function (on) { window.__autoqq.on(on); });
      pQq.appendChild(rowNew('Auto QQ Sniper', qqT.node, 'Auto pisau & balik senjata pas nembak'));

      pQq.appendChild(sec('fa-stopwatch', 'Timing Macro (ms)'));
      var qqKnifeS = slider(5, 100, 5, QQ.delayKnife, function (v) { return v.toFixed(0) + 'ms'; }, function (v) { window.__autoqq.cfg({ delayKnife: v }); });
      qqKnifeS.label.textContent = 'Knife delay'; pQq.appendChild(qqKnifeS.node);

      var qqBackS = slider(50, 300, 10, QQ.delayBack, function (v) { return v.toFixed(0) + 'ms'; }, function (v) { window.__autoqq.cfg({ delayBack: v }); });
      qqBackS.label.textContent = 'Back delay'; pQq.appendChild(qqBackS.node);

      var qqUnlockS = slider(100, 800, 20, QQ.delayUnlock, function (v) { return v.toFixed(0) + 'ms'; }, function (v) { window.__autoqq.cfg({ delayUnlock: v }); });
      qqUnlockS.label.textContent = 'Unlock delay'; pQq.appendChild(qqUnlockS.node);

      var qqStat = el('div', 'fk-sa-tgt', 'status: idle');
      pQq.appendChild(qqStat);

      var pCombat = addTab('combat', 'COMBAT');
      pCombat.appendChild(sec('fa-shield-halved', 'Weapon'));
      var wallT = toggle('combat_wallbang', false, function (on) { window.__pbx.wallbang(on); });
      pCombat.appendChild(rowRisk('Wallbang', wallT.node, 'Tembus dinding'));
      var ammoT = toggle('combat_infammo', false, function (on) { window.__pbx.infAmmo(on); });
      pCombat.appendChild(rowRisk('Infinite ammo', ammoT.node, 'Ammo tak habis'));
      var nrecT = toggle('combat_norecoil', false, function (on) { window.__pbx.noRecoil(on); });
      pCombat.appendChild(rowRisk('No recoil', nrecT.node, 'Recoil nol'));

      var pFly = addTab('fly', 'FLY');
      pFly.appendChild(sec('fa-plane', 'Fly'));
      var flyT = toggle('fly_on', false, function (on) { window.__pbx.fly(on); });
      pFly.appendChild(rowRisk('Fly', flyT.node, 'Hold jump = naik'));
      var flyBypassT = toggle('fly_bypass', false, function (on) { window.__pbx.flyBypass(on); });
      pFly.appendChild(rowRisk('Fly bypass', flyT.node, 'Anti deteksi fly'));
      var flyModeSel = el('select', 'fk-select');
      flyModeSel.innerHTML =
        '<option value="jump">Jump</option>' +
        '<option value="hover">Hover</option>';
      flyModeSel.value = FLY.mode;
      flyModeSel.addEventListener('change', function () { window.__pbx.flyMode(this.value); });
      pFly.appendChild(flyModeSel);

      var pNc = addTab('noclip', 'NOCLIP');
      pNc.appendChild(sec('fa-ghost', 'Noclip'));
      var ncT = toggle('noclip_real', false, function (on) { window.__pbx.noclip(on); });
      pNc.appendChild(rowRisk('Noclip (real)', ncT.node, 'Tembus dinding'));

      var pNade = addTab('nade', 'NADE');
      pNade.appendChild(sec('fa-bomb', 'Silent Nade'));
      var snadeT = toggle('silent_nade', false, function (on) { window.__pbx.silentNade(on); });
      pNade.appendChild(rowRisk('Silent nade', snadeT.node, 'Granat ngejar target'));
      var snadeBypassT = toggle('silent_nade_bp', false, function (on) { window.__pbx.silentNadeBypass(on); });
      pNade.appendChild(rowRisk('Nade bypass', snadeBypassT.node, 'Anti deteksi nade'));
      var snadeHomeT = toggle('silent_nade_home', false, function (on) { window.__pbx.silentNadeHoming(on); });
      pNade.appendChild(rowRisk('Homing', snadeHomeT.node, 'Teleport tiap frame'));
      var snadeLosT = toggle('silent_nade_los', false, function (on) { window.__pbx.silentNadeLOS(on); });
      pNade.appendChild(rowRisk('Require LOS', snadeLosT.node, 'Hanya target kelihatan'));
      var snadeStat = el('div', 'fk-sa-tgt', 'snade: off');
      pNade.appendChild(snadeStat);

      pNade.appendChild(sec('fa-bomb', 'Unlimited Grenade'));
      var infNadeT = toggle('inf_nade', false, function (on) { window.__pbx.infNade(on); });
      pNade.appendChild(rowNew('Unlimited Grenade', infNadeT.node, 'Semua granat unlimited'));
      var infNadeMaxS = slider(1, 999, 1, FL.infNadeMax,
        function (v) { return v.toFixed(0) + 'x'; },
        function (v) { window.__pbx.infNadeMax(v); });
      infNadeMaxS.label.textContent = 'Max ammo';
      pNade.appendChild(infNadeMaxS.node);
      var infNadeSt = el('div', 'fk-nade-st', 'memuat…');
      pNade.appendChild(infNadeSt);

      var pMove = addTab('move', 'MOVE');
      pMove.appendChild(sec('fa-feather', 'Survival'));
      var noFallT = toggle('no_fall', false, function (on) { window.__pbx.noFall(on); });
      pMove.appendChild(row('No fall damage', noFallT.node, 'Tidak mati jatuh'));

      var pMisc = addTab('misc', 'MISC');
      pMisc.appendChild(sec('fa-right-left', 'Quick Swap'));
      var qcT = toggle('quick_swap', false, function (on) { if (on) window.__pbqc.on(); else window.__pbqc.off(); });
      pMisc.appendChild(row('Quick swap', qcT.node, 'Ganti senjata instan'));
      var qcFastT = toggle('inst_swap', false, function (on) { window.__pbqc.cfg({ fast: on ? 1 : 0 }); });
      pMisc.appendChild(row('Instant swap', qcFastT.node, 'Skip animasi'));
      var swapBtn = el('div', 'fk-btn');
      swapBtn.innerHTML = '<i class="fa-solid fa-arrows-rotate"></i> Swap (Q)';
      swapBtn.addEventListener('click', function () { try { window.__pbqc.swap(); } catch (e) {} });
      var swapWrap = el('div', 'fk-btns');
      swapWrap.appendChild(swapBtn); pMisc.appendChild(swapWrap);

      pMisc.appendChild(sec('fa-heart', 'Survival'));
      var irT = toggle('inst_respawn', false, function (on) { window.__pbx.respawn(on); });
      pMisc.appendChild(row('Instant respawn', irT.node, 'Hidup langsung'));
      var godT = toggle('godmode', false, function (on) { window.__pbx.godmode(on); });
      pMisc.appendChild(rowRisk('Godmode', godT.node, 'Unlimited spawn flicker'));

      pMisc.appendChild(sec('fa-toolbox', 'Utility'));
      var akT = toggle('anti_kick', false, function (on) { window.__pbx.antiKick(on); });
      pMisc.appendChild(rowRisk('Anti-kick', akT.node, 'Blokir kick/ban'));

      var pInfo = addTab('info', 'INFO');
      pInfo.appendChild(sec('fa-signal', 'Status'));
      var foot = el('div', 'fk-foot', '');
      pInfo.appendChild(foot);
      var statBox = el('div', 'fk-foot', '');
      statBox.style.marginTop = '3px'; pInfo.appendChild(statBox);

      pInfo.appendChild(sec('fa-key', 'Bypass'));
      var bypassInfo = el('div', null, '');
      bypassInfo.style.cssText = 'font-size:9px;line-height:1.4;color:#a0aab5';
      bypassInfo.innerHTML =
        '<div>L1 preboot · flex gate</div>' +
        '<div>L1b integrity check bypass</div>' +
        '<div>L2 hide · L3 self-heal · L4 fp-rotate</div>' +
        '<div>L5 direct-state-write · L6 bone-accurate</div>' +
        '<div>Fly bypass: throttle + stealth write</div>' +
        '<div>Silent nade bypass: rAF chase</div>' +
        '<div>Aimbot: POV + LOS realtime (80ms)</div>' +
        '<div>ESP: 0ms Delay & GPU Accel</div>';
      pInfo.appendChild(bypassInfo);

      pInfo.appendChild(sec('fa-triangle-exclamation', 'Danger'));
      var resetBtn = el('div', 'fk-btn danger');
      resetBtn.innerHTML = '<i class="fa-solid fa-trash-can"></i> Reset semua';
      resetBtn.addEventListener('click', function () {
        try {
          var keys = Object.keys(localStorage);
          for(var i=0; i<keys.length; i++) {
            if(keys[i].indexOf('iril_tg_') === 0) localStorage.removeItem(keys[i]);
          }
          window.__pb.off(); window.__pbvis.off();
          window.__pbqc.off(); window.__pbqc.cfg({ fast: 0 });
          window.__pbx.pred(0); window.__pbx.rapid(0);
          window.__pbx.instScope(0); window.__pbx.trig(0); window.__pbx.silent(0);
          window.__pbx.lob(0); window.__pbx.respawn(0); window.__pbx.radar(0);
          window.__pbx.hpo(0); window.__pbx.fovc(0); window.__pbx.tracer(0);
          window.__pbx.wallbang(0); window.__pbx.infAmmo(0); window.__pbx.noRecoil(0);
          window.__pbx.godmode(0); window.__pb.noclip(0);
          window.__pbx.antiKick(0); window.__pbx.smoothFire(0);
          window.__pb.aimbot(0);
          window.__pbvis.bone(0); window.__pbvis.name(0);
          window.__pb.hitbox('head');
          window.__pb.bulletSpeed(350);
          window.__pb.leadFactor(1.0);
          window.__pbx.silentFov(120);
          window.__pb.lockMode('pov');
          window.__pbx.fly(false); window.__pbx.flyMode('jump');
          window.__pbx.flyBypass(0);
          window.__pbx.silentNade(0);
          window.__pbx.silentNadeBypass(0);
          window.__pbx.infNade(0); window.__pbx.infNadeMax(99);
          window.__pbx.noFall(0);
          window.__autoqq.on(false);
          syncAll();
        } catch (e) {}
      });
      var resetWrap = el('div', 'fk-btns');
      resetWrap.appendChild(resetBtn); pInfo.appendChild(resetWrap);
      pInfo.appendChild(el('div', 'fk-warn', 'Fitur RISK bisa terdeteksi server.'));

      function refreshFoot() {
        try {
          var s2 = window.__pb && window.__pb.state();
          if (!s2) { foot.textContent = 'engine not ready…'; return; }
          var parts = [];
          parts.push(s2.aim ? 'AIM ✓' : 'AIM ✕');
          parts.push(s2.aimbot ? 'AB ✓' : 'AB ✕');
          parts.push('QQ:' + (QQ.on ? (QQ.busy ? 'BUSY' : 'READY') : 'OFF'));
          parts.push('G' + (s2.G ? '1' : '0'));
          parts.push('en ' + s2.enemies);
          parts.push('lk ' + s2.lock);
          parts.push('lm:' + (s2.lockMode === 'pov' ? 'POV' : 'LEG'));
          if (s2.lock) parts.push(s2.dist.toFixed(1) + 'm');
          if (s2.aimbotActive) parts.push('AB LOCK');
          foot.textContent = parts.join(' · ');
          statBox.textContent = 'bots ' + s2.bots + ' · fire ' + s2.fire + ' · fly ' + (FLY.on ? '✓' : '✕') +
            ' · noclip ' + (FL.noclip ? '✓' : '✕') + ' · snade ' + (SN.on ? SN.nadeCount : '✕') +
            ' · infNade ' + (FL.infNade ? '✓' : '✕');

          if (qqStat) {
            qqStat.textContent = 'QQ: ' + (QQ.on ? (QQ.busy ? 'SWITCHING...' : 'READY (' + QQ.count + 'x)') : 'OFF');
          }

          if (window.__pbx) {
            var x2 = window.__pbx.st();
            if (x2.saHead) {
              saTgt.textContent = 'target: ' + x2.saHead.name + ' (' + Math.round(x2.saHead.hp) + 'hp)';
            } else {
              saTgt.textContent = SA.on ? 'target: —' : 'target: off';
            }
            if (snadeStat) {
              if (x2.silentNade) {
                var sns = window.__pbx.silentNadeSt();
                snadeStat.textContent = 'snade: ON · ' + sns.nadeCount + ' chase · ' +
                  (sns.hasTarget ? 'lock ✓' : 'lock —') +
                  ' · bypass ' + (sns.bypass ? '✓' : '✕');
              } else {
                snadeStat.textContent = 'snade: off';
              }
            }
            if (infNadeSt) {
              var ngs = window.__pbx.infNadeSt();
              if (ngs.grenades.length) {
                infNadeSt.innerHTML = 'unlimited: <b>' + (ngs.on ? 'ON' : 'OFF') + '</b> · max ' + ngs.max + 'x · refilled ' + ngs.count + 'x<br>' +
                  ngs.grenades.map(function (g) {
                    return 'slot ' + g.slot + ': ' + g.name + ' (' + (g.kind || '?') + ') = ' + g.ammo;
                  }).join('<br>');
              } else {
                infNadeSt.textContent = 'unlimited: ' + (ngs.on ? 'ON' : 'OFF') + ' · belum ada granat';
              }
            }
          }
        } catch (e) { foot.textContent = '…'; }
      }
      setInterval(refreshFoot, 500);

      function syncAll() {
        try {
          if (window.__pb) {
            var s3 = window.__pb.state();
            aimT.set(!!s3.aim);
            povCircleS.set(s3.povCircleR);
            hitboxSelect.value = s3.hitbox;
            aimbotT.set(!!s3.aimbot);
            abGainS.set(P.aimbotGain);
            abHoldS.set(P.aimbotHoldMs);
            bsS.set(P.bulletSpeed);
            lfS.set(P.leadFactor);
            if (lockModeSel && lockModeSel.value !== s3.lockMode) {
              lockModeSel.value = s3.lockMode;
            }
          }
          if (window.__autoqq) {
            qqT.set(!!QQ.on);
            qqKnifeS.set(QQ.delayKnife);
            qqBackS.set(QQ.delayBack);
            qqUnlockS.set(QQ.delayUnlock);
          }
          if (window.__pbvis) {
            espT.set(!!window.__pbvis.is());
            if (typeof window.__pbvis.nameOn === 'function') espNameT.set(!!window.__pbvis.nameOn());
          }
          if (window.__pbqc) { var q = window.__pbqc.st(); qcT.set(!!q.on); qcFastT.set(!!q.fast); }
          autoFireT.set(!!P.autoFire); invertT.set(!!O.invert);
          if (window.__pbx) {
            var x = window.__pbx.st();
            predT.set(!!x.pred); rapidT.set(!!x.rapid);
            isT2.set(!!x.instScope); tbT.set(!!x.trig); saT.set(!!x.silent);
            irT.set(!!x.respawn); rdT.set(!!x.radar); hpoT.set(!!x.hpo); fcT.set(!!x.fovc);
            trT.set(!!x.tracer);
            wallT.set(!!x.wallbang); ammoT.set(!!x.infAmmo); nrecT.set(!!x.noRecoil);
            godT.set(!!x.godmode); akT.set(!!x.antiKick);
            sfT.set(!!x.smoothFire);
            saFovS.set(x.silentFov);
            try { flyT.set(!!x.flyOn); if (flyModeSel) flyModeSel.value = x.flyMode || 'jump'; } catch (e) {}
            try { flyBypassT.set(!!x.flyBypass); } catch (e) {}
            try { ncT.set(!!x.noclip); } catch (e) {}
            try { noFallT.set(!!x.noFall); } catch (e) {}
            try { snadeT.set(!!x.silentNade); } catch (e) {}
            try { snadeBypassT.set(!!x.silentNadeBypass); } catch (e) {}
            try { infNadeT.set(!!x.infNade); infNadeMaxS.set(x.infNadeMax); } catch (e) {}
            try { espNameT.set(!!x.espName); } catch (e) {}
          }
        } catch (e) {}
      }
      setInterval(syncAll, 1500);

      (function () {
        var dragging = false, ox = 0, oy = 0;
        function dragStart(e) {
          if (e.target === toggleBtn || e.target === hideUiBtn || e.target === tbOpen) return;
          if (e.target.tagName === 'SELECT' || e.target.tagName === 'OPTION' || e.target.tagName === 'INPUT') return;
          
          dragging = true;
          var clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
          var clientY = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : 0);
          var r = panel.getBoundingClientRect();
          ox = clientX - r.left; oy = clientY - r.top;
        }
        function dragMove(e) {
          if (!dragging) return;
          var clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
          var clientY = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : 0);
          var x = clientX - ox, y = clientY - oy;
          x = Math.max(4, Math.min(innerWidth - 60, x));
          y = Math.max(4, Math.min(innerHeight - 40, y));
          panel.style.left = x + 'px'; panel.style.top = y + 'px';
          panel.style.right = 'auto';
        }
        function dragEnd() { dragging = false; }

        head.addEventListener('mousedown', dragStart);
        tabbar.addEventListener('mousedown', dragStart);
        head.addEventListener('touchstart', dragStart, { passive: true });
        tabbar.addEventListener('touchstart', dragStart, { passive: true });
        addEventListener('mousemove', dragMove);
        addEventListener('touchmove', dragMove, { passive: true });
        addEventListener('mouseup', dragEnd);
        addEventListener('touchend', dragEnd);
      })();

      function mount() {
        var host = document.body || document.documentElement;
        if (!host) return setTimeout(mount, 100);
        host.appendChild(panel);
        var lastTab = 'aim';
        try { lastTab = localStorage.getItem(TAB_KEY) || 'aim'; } catch (e) {}
        if (!pages[lastTab]) lastTab = 'aim';
        selectTab(lastTab);
        setCollapsed(true);
        refreshFoot();
      }
      mount();
    })();
  }

  pfGate();
})();
