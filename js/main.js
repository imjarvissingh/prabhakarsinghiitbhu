(function () {
  var S = window.SITE;
  var $ = function (id) { return document.getElementById(id); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var set = function (id, html) { var el = $(id); if (el) el.innerHTML = html; };
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- static content ---------- */
  ["scholar", "scholar2", "scholar3"].forEach(function (id) { $(id).href = S.scholar; });
  $("profile").href = S.profile;
  $("mail").href = "mailto:" + S.email;
  $("mail").textContent = S.email;
  $("yr").textContent = new Date().getFullYear();

  set("stats", S.stats.map(function (s) {
    return "<div><dt data-n='" + s.n + "' data-plus='" + (s.plus ? 1 : 0) + "'>" + s.n + (s.plus ? "+" : "") + "</dt><dd>" + esc(s.l) + "</dd></div>";
  }).join(""));
  set("recog", S.recog.map(function (r) { return "<li><b>" + esc(r[1]) + "</b><span>" + esc(r[2]) + (r[0] ? " &middot; " + r[0] : "") + "</span></li>"; }).join(""));
  set("agencies", S.agencies.map(function (a) { return "<li>" + esc(a) + "</li>"; }).join(""));
  set("education", S.education.map(function (e) { return "<li><span class='y'>" + e[0] + "</span><span><b>" + esc(e[1]) + "</b><span class='d'>" + esc(e[2]) + "</span></span></li>"; }).join(""));
  set("career", S.career.map(function (e) { return "<li><span class='y'>" + esc(e[0]) + "</span><span>" + esc(e[1]) + "</span></li>"; }).join(""));
  set("courses", S.teaching.map(function (c) { return "<li><span class='l'>" + esc(c.l) + "</span>" + esc(c.t) + "</li>"; }).join(""));
  set("current", S.current.map(function (n) { return "<li>" + esc(n) + "</li>"; }).join(""));
  set("alumCount", S.alumni.length + " completed");
  set("alumni", S.alumni.map(function (a) {
    return "<li><details><summary><span class='y'>" + a[0] + "</span><span class='n'>" + esc(a[1]) + "</span></summary><p>" + esc(a[2]) + "</p></details></li>";
  }).join(""));
  set("patents", S.patents.map(function (p) { return "<li><span><span class='pill'>" + p[0] + "</span>" + esc(p[1]) + "</span></li>"; }).join(""));
  set("books", S.books.map(function (b) { return "<li><span>" + esc(b) + "</span></li>"; }).join(""));
  set("honoursList", S.honours.map(function (h) { return "<li><span class='y'>" + esc(h[0]) + "</span><span>" + esc(h[1]) + "</span></li>"; }).join(""));
  set("service", S.service.map(function (h) { return "<li><span class='y'>" + esc(h[0]) + "</span><span>" + esc(h[1]) + "</span></li>"; }).join(""));
  set("visits", S.visits.map(function (v) { return "<li><b>" + esc(v[0]) + "</b><span>" + esc(v[1]) + "</span></li>"; }).join(""));

  /* ---------- count-up for headline figures ---------- */
  var nums = document.querySelectorAll("#stats dt");
  if (!reduce) {
    nums.forEach(function (el) {
      var n = +el.dataset.n, plus = el.dataset.plus === "1", t0 = null;
      var step = function (t) {
        if (t0 === null) t0 = t;
        var p = Math.min(1, (t - t0) / 1100), e = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(n * e) + (plus ? "+" : "");
        if (p < 1) requestAnimationFrame(step);
      };
      el.textContent = "0" + (plus ? "+" : "");
      requestAnimationFrame(step);
    });
  }

  /* ---------- projects ---------- */
  var projFilter = "all";
  function renderProjects() {
    set("projects", S.projects.filter(function (p) { return projFilter === "all" || p.s === projFilter; }).map(function (p) {
      return "<li><span><span class='pill " + (p.s === "Running" ? "run" : "") + "'>" + p.s + "</span>" + esc(p.t) + "</span><span class='m'>" + esc(p.f) + "</span><span class='r'>" + esc(p.p) + "</span></li>";
    }).join(""));
  }
  $("projFilter").addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;
    projFilter = b.dataset.v;
    this.querySelectorAll("button").forEach(function (x) { x.classList.toggle("on", x === b); });
    renderProjects();
  });
  renderProjects();

  /* ---------- publications: search + theme filter ---------- */
  var topic = "all", query = "", PAGE = 8, shown = PAGE;
  var chips = [["all", "All themes"]].concat(Object.keys(S.topics).map(function (k) { return [k, S.topics[k]]; }));
  function renderChips() {
    set("topicChips", chips.map(function (c) { return "<button type='button' data-k='" + c[0] + "' class='" + (topic === c[0] ? "on" : "") + "' aria-pressed='" + (topic === c[0]) + "'>" + esc(c[1]) + "</button>"; }).join(""));
  }
  function hl(text, q) {
    var s = esc(text); if (!q) return s;
    var re = new RegExp("(" + q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "ig");
    return s.replace(re, "<mark>$1</mark>");
  }
  function renderPubs() {
    var q = query.trim();
    var list = S.publications.filter(function (p) {
      if (topic !== "all" && p.k.indexOf(topic) < 0) return false;
      if (!q) return true;
      return (p.t + " " + p.a + " " + p.j + " " + p.y).toLowerCase().indexOf(q.toLowerCase()) >= 0;
    });
    var vis = list.slice(0, shown);
    set("pubs", vis.length ? vis.map(function (p) {
      return "<li><span class='y'>" + p.y + "</span><span><span class='t'>" + hl(p.t, q) + "</span><span class='m'>" + hl(p.a, q) + " &middot; <i>" + hl(p.j, q) + "</i></span></span></li>";
    }).join("") : "<li class='empty'>No papers match. Try a shorter search or another theme.</li>");
    $("count").textContent = list.length + (list.length === 1 ? " paper" : " papers") + (topic !== "all" ? " in " + S.topics[topic] : "") + (q ? " matching “" + q + "”" : "");
    $("morePubs").hidden = list.length <= shown;
  }
  renderChips(); renderPubs();
  $("topicChips").addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;
    topic = b.dataset.k; shown = PAGE; renderChips(); renderPubs();
  });
  $("q").addEventListener("input", function () { query = this.value; shown = PAGE; renderPubs(); });
  $("morePubs").addEventListener("click", function () { shown += 10; renderPubs(); });

  /* research themes jump to filtered publications */
  set("themes", S.research.map(function (r) {
    var n = S.publications.filter(function (p) { return p.k.indexOf(r.k) >= 0; }).length;
    return "<li><button type='button' data-k='" + r.k + "'><h4>" + esc(r.t) + "</h4><p>" + esc(r.d) + "</p><span class='go'>" + n + " papers &rarr;</span></button></li>";
  }).join(""));
  $("themes").addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;
    topic = b.dataset.k; query = ""; $("q").value = ""; shown = PAGE; renderChips(); renderPubs();
    $("publications").scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
  });


  /* ---------- header: theme, menu, active section ---------- */
  var root = document.documentElement;
  /* appearance panel */
  var pref = { theme: "auto", palette: "night", read: "serif", size: "md" };
  try { Object.assign(pref, JSON.parse(localStorage.getItem("look") || "{}")); } catch (e) {}
  function applyLook() {
    if (pref.theme === "auto") root.removeAttribute("data-theme"); else root.dataset.theme = pref.theme;
    root.dataset.palette = pref.palette;
    root.dataset.read = pref.read; root.dataset.size = pref.size;
    $("panel").querySelectorAll(".opts").forEach(function (g) {
      g.querySelectorAll("button").forEach(function (b) { b.setAttribute("aria-pressed", pref[g.dataset.g] === b.dataset.v); });
    });
    colors = null;
  }
  $("panel").addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;
    pref[b.parentNode.dataset.g] = b.dataset.v; applyLook();
    try { localStorage.setItem("look", JSON.stringify(pref)); } catch (er) {}
  });
  $("look").addEventListener("click", function (e) {
    e.stopPropagation(); var open = $("panel").hidden; $("panel").hidden = !open; this.setAttribute("aria-expanded", open);
  });
  document.addEventListener("click", function (e) { if (!$("panel").hidden && !e.target.closest(".look")) { $("panel").hidden = true; $("look").setAttribute("aria-expanded", "false"); } });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !$("panel").hidden) { $("panel").hidden = true; $("look").setAttribute("aria-expanded", "false"); $("look").focus(); } });
  var totop = $("totop");
  window.addEventListener("scroll", function () { totop.hidden = window.scrollY < 900; }, { passive: true });
  var nav = $("nav"), menu = $("menu");
  menu.addEventListener("click", function () { menu.setAttribute("aria-expanded", nav.classList.toggle("open")); });
  nav.addEventListener("click", function () { nav.classList.remove("open"); menu.setAttribute("aria-expanded", "false"); });
  if ("IntersectionObserver" in window) {
    var links = {};
    nav.querySelectorAll("a").forEach(function (a) { links[a.getAttribute("href").slice(1)] = a; });
    var so = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting && links[e.target.id]) {
          Object.keys(links).forEach(function (k) { links[k].classList.remove("on"); });
          links[e.target.id].classList.add("on");
        }
      });
    }, { rootMargin: "-35% 0px -60% 0px" });
    document.querySelectorAll("main section[id]").forEach(function (s) { so.observe(s); });
  }

  /* ---------- ion conduction simulation ---------- */
  var cv = $("sim"), ctx = cv.getContext("2d");
  var tSl = $("temp"), eSl = $("ea"), fld = $("field");
  var KB = 8.617e-5, COLS = 14, ROWS = 8, HOP = 22;
  var W = 0, H = 0, cell = 0, dpr = 1, colors = null;
  var occ = [], ions = [], hopsWindow = [], lastRateT = 0;

  function readColors() {
    var cs = getComputedStyle(document.documentElement);
    colors = { ion: cs.getPropertyValue("--ion").trim(), host: cs.getPropertyValue("--host").trim(), line: cs.getPropertyValue("--line").trim(), ink: cs.getPropertyValue("--ink").trim(), accent: cs.getPropertyValue("--accent").trim(), muted: cs.getPropertyValue("--muted").trim() };
  }
  function build() {
    occ = []; ions = [];
    for (var i = 0; i < COLS * ROWS; i++) occ.push(false);
    var target = Math.round(COLS * ROWS * 0.3), tries = 0;
    while (ions.length < target && tries++ < 2000) {
      var c = Math.floor(Math.random() * COLS), r = Math.floor(Math.random() * ROWS), id = r * COLS + c;
      if (occ[id]) continue;
      occ[id] = true;
      ions.push({ c: c, r: r, fc: c, fr: r, tc: c, tr: r, t: 1, ph: Math.random() * 6.28, ph2: Math.random() * 6.28 });
    }
  }
  function resize() {
    var rect = cv.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = rect.width; H = rect.height;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cell = Math.min(W / COLS, H / ROWS);
  }
  function pos(c, r) { return [(c + 0.5) * (W / COLS), (r + 0.5) * (H / ROWS)]; }

  function hopProb() {
    var T = +tSl.value, Ea = +eSl.value;
    return 0.05 * Math.exp(-(Ea / KB) * (1 / T - 1 / 1100));
  }
  function relSigma() {
    var T = +tSl.value, Ea = +eSl.value;
    return Math.exp(-(Ea / KB) * (1 / T - 1 / 1100));
  }
  function fmtSigma(s) {
    if (s >= 0.1) return s.toFixed(2);
    var e = Math.floor(Math.log10(s)); var m = s / Math.pow(10, e);
    return m.toFixed(1) + "e" + e;
  }

  function step(time) {
    var p = hopProb(), T = +tSl.value, now = performance.now();
    var field = fld.checked;
    ions.forEach(function (io) {
      if (io.t < 1) {
        io.t += 1 / HOP;
        if (io.t >= 1) { io.t = 1; io.c = ((io.tc % COLS) + COLS) % COLS; io.r = io.tr; io.fc = io.c; io.fr = io.r; }
        return;
      }
      if (Math.random() < p) {
        var d;
        if (field) {
          var u = Math.random();
          d = u < 0.6 ? [1, 0] : u < 0.72 ? [-1, 0] : u < 0.86 ? [0, 1] : [0, -1];
        } else {
          d = [[1, 0], [-1, 0], [0, 1], [0, -1]][Math.floor(Math.random() * 4)];
        }
        var nc = io.c + d[0], nr = io.r + d[1];
        if (nr < 0 || nr >= ROWS) return;
        var wc = ((nc % COLS) + COLS) % COLS;
        if (occ[nr * COLS + wc]) return;
        occ[nr * COLS + wc] = true; occ[io.r * COLS + io.c] = false;
        io.fc = io.c; io.fr = io.r; io.tc = nc; io.tr = nr; io.t = 0;
        hopsWindow.push(now);
      }
    });
    while (hopsWindow.length && now - hopsWindow[0] > 1000) hopsWindow.shift();
  }

  function draw(time) {
    if (!colors) readColors();
    ctx.clearRect(0, 0, W, H);
    var sx = W / COLS, sy = H / ROWS, T = +tSl.value;
    // host framework
    ctx.fillStyle = colors.host;
    for (var r = 0; r < ROWS; r++) for (var c = 0; c < COLS; c++) {
      var x = c * sx + sx / 2, y = r * sy + sy / 2;
      ctx.fillRect(x - 1.5, y - 1.5, 3, 3);
    }
    // faint site grid
    ctx.strokeStyle = colors.line; ctx.lineWidth = 1; ctx.beginPath();
    for (var c2 = 0; c2 < COLS; c2++) { ctx.moveTo(c2 * sx + sx / 2, sy / 2); ctx.lineTo(c2 * sx + sx / 2, H - sy / 2); }
    for (var r2 = 0; r2 < ROWS; r2++) { ctx.moveTo(sx / 2, r2 * sy + sy / 2); ctx.lineTo(W - sx / 2, r2 * sy + sy / 2); }
    ctx.globalAlpha = 0.5; ctx.stroke(); ctx.globalAlpha = 1;
    var amp = 0.05 * Math.min(sx, sy) * Math.sqrt(T / 300);
    var rad = Math.min(sx, sy) * 0.27;
    ions.forEach(function (io) {
      var a = pos(io.fc, io.fr), b = pos(io.tc, io.tr);
      var e = io.t < 1 ? (io.t < .5 ? 2 * io.t * io.t : 1 - Math.pow(-2 * io.t + 2, 2) / 2) : 1;
      var x = a[0] + (b[0] - a[0]) * e, y = a[1] + (b[1] - a[1]) * e;
      x = ((x % W) + W) % W;
      var j = amp * (reduce ? 0 : 1);
      x += Math.sin(time / 90 + io.ph) * j; y += Math.cos(time / 110 + io.ph2) * j;
      ctx.beginPath(); ctx.arc(x, y, rad, 0, 6.283);
      ctx.fillStyle = colors.ion; ctx.globalAlpha = io.t < 1 ? 1 : 0.9; ctx.fill(); ctx.globalAlpha = 1;
    });
    if (fld.checked) {
      ctx.strokeStyle = colors.accent; ctx.fillStyle = colors.accent; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(10, H - 10); ctx.lineTo(60, H - 10); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(60, H - 10); ctx.lineTo(53, H - 14); ctx.lineTo(53, H - 6); ctx.fill();
    }
  }

  function readouts(now) {
    if (now - lastRateT > 250) {
      lastRateT = now;
      $("rate").textContent = hopsWindow.length;
      $("sigma").textContent = fmtSigma(relSigma());
    }
  }

  /* Arrhenius plot: log10(sigma*T) against 1000/T, anchored at 1100 K */
  function drawArr() {
    var svg = $("arr"), Ea = +eSl.value, T = +tSl.value;
    var L = 34, R = 10, Tp = 8, B = 28, w = 320, h = 150, pw = w - L - R, ph = h - Tp - B;
    var xmin = 1000 / 1100, xmax = 1000 / 300, ymin = -14, ymax = 0;
    var X = function (x) { return L + (x - xmin) / (xmax - xmin) * pw; };
    var Y = function (y) { return Tp + (ymax - y) / (ymax - ymin) * ph; };
    var f = function (x) { return -Ea * 5039.8 * (x / 1000 - 1 / 1100); };
    var s = "";
    for (var gy = -12; gy <= 0; gy += 4) s += "<line x1='" + L + "' x2='" + (w - R) + "' y1='" + Y(gy) + "' y2='" + Y(gy) + "' stroke='var(--line)'/><text x='" + (L - 4) + "' y='" + (Y(gy) + 3) + "' text-anchor='end'>" + gy + "</text>";
    [1, 1.5, 2, 2.5, 3].forEach(function (gx) { s += "<text x='" + X(gx) + "' y='" + (h - 14) + "' text-anchor='middle'>" + gx + "</text>"; });
    s += "<text x='" + (L + pw / 2) + "' y='" + (h - 2) + "' text-anchor='middle'>1000 / T  (1/K)</text>";
    s += "<text transform='translate(8," + (Tp + ph / 2) + ") rotate(-90)' text-anchor='middle'>log σT (rel.)</text>";
    s += "<line x1='" + X(xmin) + "' y1='" + Y(f(xmin)) + "' x2='" + X(xmax) + "' y2='" + Y(f(xmax)) + "' stroke='var(--accent)' stroke-width='2'/>";
    var cx = X(1000 / T), cy = Y(f(1000 / T));
    s += "<line x1='" + cx + "' x2='" + cx + "' y1='" + Tp + "' y2='" + (Tp + ph) + "' stroke='var(--ion)' stroke-dasharray='3 3'/><circle cx='" + cx + "' cy='" + cy + "' r='5' fill='var(--ion)'/>";
    svg.innerHTML = s;
  }

  function sync() {
    $("tempOut").textContent = tSl.value + " K";
    $("eaOut").textContent = (+eSl.value).toFixed(2) + " eV";
    drawArr();
  }
  tSl.addEventListener("input", sync); eSl.addEventListener("input", sync); fld.addEventListener("change", sync);
  window.addEventListener("resize", function () { resize(); });
  if (window.matchMedia) matchMedia("(prefers-color-scheme: dark)").addEventListener && matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function () { colors = null; });

  var visible = true, raf = 0;
  if ("IntersectionObserver" in window) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }, { threshold: 0 }).observe(cv);
  function loop(t) {
    if (visible) { step(t); draw(t); readouts(performance.now()); }
    raf = requestAnimationFrame(loop);
  }
  resize(); build(); sync(); draw(0);
  readouts(performance.now() + 1000);
  if (reduce) { $("rate").textContent = "paused"; $("sigma").textContent = fmtSigma(relSigma()); tSl.addEventListener("input", function () { $("sigma").textContent = fmtSigma(relSigma()); }); eSl.addEventListener("input", function () { $("sigma").textContent = fmtSigma(relSigma()); }); }
  else raf = requestAnimationFrame(loop);

  /* ---------- where to start ---------- */
  var REC = {
    student: ["Welcome. Start with the research themes to see if they match your interests, then read what the current group works on and write with a short note about your background.", [["Research themes", "#research"], ["Research group", "#group"], ["Write to him", "#contact"]]],
    researcher: ["The publications are searchable by theme, and Google Scholar has the full record with citation counts.", [["Browse publications", "#publications"], ["Google Scholar", S.scholar]]],
    collab: ["His funded projects span fuel cells, perovskite solar cells and storage, with agencies including DST, SERB, DRDO and CSIR. International collaborations are listed under Honours.", [["Sponsored projects", "#research"], ["Collaborations", "#honours"], ["Get in touch", "#contact"]]],
    visitor: ["A short biography, his career and the awards he has received are the best places to begin.", [["About", "#about"], ["Honours", "#honours"], ["Contact", "#contact"]]]
  };
  $("who").addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;
    this.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", x === b); });
    var r = REC[b.dataset.v];
    set("rec", "<p>" + esc(r[0]) + "</p><div class='go-row'>" + r[1].map(function (l) {
      return "<a class='btn alt' href='" + esc(l[1]) + "'" + (l[1].charAt(0) === "#" ? "" : " target='_blank' rel='noopener'") + ">" + esc(l[0]) + "</a>";
    }).join("") + "</div>");
  });

  /* ---------- FAQ ---------- */
  set("faq-list", S.faq.map(function (f) {
    return "<li><details><summary>" + esc(f[0]) + "</summary><div class='a'>" + esc(f[1]) + "<br><a href='#" + f[2] + "'>Go to section &rarr;</a></div></details></li>";
  }).join(""));

  /* ---------- contact form (opens the visitor's email app) ---------- */
  var cform = $("cform");
  cform.addEventListener("submit", function (e) {
    e.preventDefault();
    var n = $("cn").value.trim(), em = $("ce").value.trim(), msg = $("cm").value.trim(), err = $("cerr");
    if (!n || !/^\S+@\S+\.\S+$/.test(em) || !msg) { err.textContent = "Please add your name, a valid email and a message."; err.hidden = false; return; }
    err.hidden = true;
    var body = msg + "\n\n" + n + "\n" + em + "\n(" + $("cw").value + ")";
    var href = "mailto:" + S.email + "?subject=" + encodeURIComponent("Enquiry from " + n + " (" + $("cw").value + ")") + "&body=" + encodeURIComponent(body);
    window.location.href = href;
    $("cnote").textContent = "If your email app did not open, copy the address below the form and send your message directly to " + S.email + ".";
  });
  $("copyMail").addEventListener("click", function () {
    var b = this, done = function () { b.textContent = "Copied"; setTimeout(function () { b.textContent = "Copy address"; }, 1800); };
    try { navigator.clipboard.writeText(S.email).then(done, function () { b.textContent = S.email; }); } catch (e) { b.textContent = S.email; }
  });

})();
