(function () {
  var S = window.SITE;
  var $ = function (id) { return document.getElementById(id); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var fill = function (id, html) { var el = $(id); if (el) el.innerHTML = html; };

  document.documentElement.classList.add("js");

  ["scholar", "scholar2", "scholar3"].forEach(function (id) { $(id).href = S.scholar; });
  $("profile").href = S.profile;
  $("mail").href = "mailto:" + S.email;
  $("mail").textContent = S.email;
  $("yr").textContent = new Date().getFullYear();

  fill("figures", S.figures.map(function (f) { return "<li><b>" + esc(f.n) + "</b><span>" + esc(f.l) + "</span></li>"; }).join(""));
  fill("education", S.education.map(function (e) { return "<dt>" + esc(e[0]) + "</dt><dd>" + esc(e[1]) + "</dd>"; }).join(""));
  fill("career", S.career.map(function (e) { return "<dt>" + esc(e[0]) + "</dt><dd>" + esc(e[1]) + "</dd>"; }).join(""));
  fill("areas", S.research.map(function (r) { return "<li class='rv'><div><h4>" + esc(r.t) + "</h4><p>" + esc(r.d) + "</p></div></li>"; }).join(""));
  fill("projects", S.projects.map(function (p) { return "<li><span class='a'>" + esc(p[0]) + "</span><span class='b'>" + esc(p[1]) + "</span><span class='c'>" + esc(p[2]) + "</span></li>"; }).join(""));

  var PAGE = 8;
  fill("pubs", S.publications.map(function (p, i) {
    return "<li" + (i >= PAGE ? " hidden" : "") + "><span class='y'>" + p.y + "</span><span><span class='t'>" + esc(p.t) + "</span><span class='m'>" + esc(p.c) + " &middot; <i>" + esc(p.j) + "</i></span></span></li>";
  }).join(""));
  var more = $("morePubs");
  if (S.publications.length > PAGE) {
    more.hidden = false;
    more.addEventListener("click", function () {
      document.querySelectorAll("#pubs li[hidden]").forEach(function (li) { li.hidden = false; });
      more.hidden = true;
    });
  }
  fill("patents", S.patents.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join(""));
  fill("books", S.books.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join(""));
  fill("courses", S.teaching.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join(""));
  fill("current", S.group.current.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join(""));
  fill("alumni", S.group.alumni.map(function (x) { return "<li>" + esc(x[0]) + " <small>" + x[1] + "</small></li>"; }).join(""));
  fill("collabs", S.collaborations.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join(""));
  fill("honoursList", S.honours.map(function (h) { return "<li><span class='a'>" + esc(h[1]) + "</span><span class='c'>" + esc(h[0]) + "</span></li>"; }).join(""));
  fill("service", S.service.map(function (h) { return "<li><span class='a'>" + esc(h[1]) + "</span><span class='c'>" + esc(h[0]) + "</span></li>"; }).join(""));

  // header: border on scroll, mobile menu, active link
  var bar = $("bar"), nav = $("nav"), menu = $("menu");
  var onScroll = function () { bar.classList.toggle("scrolled", window.scrollY > 10); };
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
  menu.addEventListener("click", function () {
    var open = nav.classList.toggle("open");
    menu.setAttribute("aria-expanded", open);
  });
  nav.addEventListener("click", function () { nav.classList.remove("open"); menu.setAttribute("aria-expanded", "false"); });

  // reveal on scroll
  document.querySelectorAll(".label, .body, .hero-text, .portrait, .figures li").forEach(function (el) { el.classList.add("rv"); });
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    document.querySelectorAll(".rv").forEach(function (el) { io.observe(el); });

    var links = {};
    nav.querySelectorAll("a").forEach(function (a) { links[a.getAttribute("href").slice(1)] = a; });
    var so = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting && links[e.target.id]) {
          Object.keys(links).forEach(function (k) { links[k].classList.remove("on"); });
          links[e.target.id].classList.add("on");
        }
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    document.querySelectorAll("main section[id]").forEach(function (s) { so.observe(s); });
  } else {
    document.querySelectorAll(".rv").forEach(function (el) { el.classList.add("in"); });
  }
})();
