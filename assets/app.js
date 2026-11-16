/* Portfolio — interaction + motion. Heavy motion runs only with no reduced-motion
   preference. No JS or reduced motion => the page is fully visible and static. */
(function () {
  "use strict";
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = matchMedia("(hover:hover) and (pointer:fine)").matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  if (reduce) return;
  var root = document.documentElement;
  root.setAttribute("data-anim", "");

  /* Scroll progress + sticky nav */
  var bar = document.createElement("div"); bar.id = "progress"; document.body.appendChild(bar);
  var nav = $("nav.bar");
  function onScroll() {
    var h = document.documentElement.scrollHeight - innerHeight;
    bar.style.width = (h > 0 ? (scrollY / h) * 100 : 0) + "%";
    if (nav) nav.classList.toggle("scrolled", scrollY > 20);
    parallax();
  }
  var tick = false;
  addEventListener("scroll", function () { if (tick) return; tick = true; requestAnimationFrame(function () { tick = false; onScroll(); }); }, { passive: true });

  /* Cursor spotlight */
  if (fine) {
    var glow = document.createElement("div"); glow.id = "glow"; document.body.appendChild(glow);
    addEventListener("pointermove", function (e) { glow.style.left = e.clientX + "px"; glow.style.top = e.clientY + "px"; }, { passive: true });
  }

  /* Hero canvas: particle orbit core */
  var cv = $("#orbit");
  if (cv && cv.getContext) {
    var ctx = cv.getContext("2d"), W, H, DPR = Math.min(devicePixelRatio || 1, 2), parts = [], orbs = [], cx, cy, raf, t = 0;
    function size() {
      var r = cv.getBoundingClientRect(); W = r.width; H = r.height;
      cv.width = W * DPR; cv.height = H * DPR; ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      cx = W * (W > 820 ? 0.72 : 0.5); cy = H * 0.46;
      var n = Math.min(80, Math.round(W * H / 15000));
      parts = []; for (var i = 0; i < n; i++) parts.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .22, vy: (Math.random() - .5) * .22, r: Math.random() * 1.5 + .4 });
      orbs = []; for (var k = 0; k < 4; k++) orbs.push({ a: Math.random() * 6.28, rad: 54 + k * 32, sp: (.0022 + k * .0009) * (k % 2 ? 1 : -1), r: 2.4 - k * .22, hue: k % 2 });
    }
    function draw() {
      t++; ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i]; p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1; if (p.y < 0 || p.y > H) p.vy *= -1;
        var dx = p.x - cx, dy = p.y - cy, d = Math.hypot(dx, dy);
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.2832);
        ctx.fillStyle = "rgba(120,200,255," + (d < 300 ? .5 : .16) + ")"; ctx.fill();
        if (d < 210) { ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(cx, cy); ctx.strokeStyle = "rgba(0,240,255," + (0.14 * (1 - d / 210)) + ")"; ctx.lineWidth = .6; ctx.stroke(); }
      }
      var pulse = 1 + Math.sin(t * .03) * .08;
      var g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 84 * pulse);
      g.addColorStop(0, "rgba(0,240,255,.45)"); g.addColorStop(.3, "rgba(0,240,255,.12)"); g.addColorStop(1, "rgba(0,240,255,0)");
      ctx.beginPath(); ctx.arc(cx, cy, 84 * pulse, 0, 6.2832); ctx.fillStyle = g; ctx.fill();
      ctx.beginPath(); ctx.arc(cx, cy, 5 * pulse, 0, 6.2832); ctx.fillStyle = "rgba(220,250,255,.95)"; ctx.fill();
      for (var o = 0; o < orbs.length; o++) {
        var b = orbs[o]; b.a += b.sp;
        ctx.beginPath(); ctx.arc(cx, cy, b.rad, 0, 6.2832); ctx.strokeStyle = "rgba(120,140,255,.06)"; ctx.lineWidth = 1; ctx.stroke();
        var ox = cx + Math.cos(b.a) * b.rad, oy = cy + Math.sin(b.a) * b.rad * .72;
        ctx.beginPath(); ctx.arc(ox, oy, b.r + 1.6, 0, 6.2832);
        ctx.fillStyle = b.hue ? "rgba(99,102,241,.9)" : "rgba(0,240,255,.9)"; ctx.shadowBlur = 12; ctx.shadowColor = b.hue ? "#6366f1" : "#00f0ff"; ctx.fill(); ctx.shadowBlur = 0;
      }
      raf = requestAnimationFrame(draw);
    }
    size(); draw();
    var rz; addEventListener("resize", function () { clearTimeout(rz); rz = setTimeout(size, 150); });
    document.addEventListener("visibilitychange", function () { if (document.hidden) cancelAnimationFrame(raf); else draw(); });
  }

  /* Parallax on metric tiles (subtle) */
  var pxEls = $$(".metric");
  function parallax() {
    var h = innerHeight;
    pxEls.forEach(function (el, i) {
      var r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > h) return;
      var d = (r.top + r.height / 2 - h / 2) / h;
      el.style.transform = "translateY(" + (d * -10 * ((i % 2) ? 1 : 1.4)).toFixed(1) + "px)";
    });
  }

  /* Card tilt + glow follow */
  if (fine) $$(".glass.glow").forEach(function (c) {
    c.addEventListener("pointermove", function (e) {
      var r = c.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      c.style.transform = "perspective(900px) rotateX(" + ((py - .5) * -4).toFixed(2) + "deg) rotateY(" + ((px - .5) * 5).toFixed(2) + "deg) translateY(-2px)";
      c.style.setProperty("--mx", (px * 100) + "%"); c.style.setProperty("--my", (py * 100) + "%");
    });
    c.addEventListener("pointerleave", function () { c.style.transform = ""; });
  });

  /* Reveals + count-up */
  var revs = $$(".reveal"); revs.forEach(function (el, i) { var d = i % 3; if (d) el.classList.add("d" + d); });
  var stats = $$(".metric b"), pending = revs.slice();
  function sweep() {
    var h = innerHeight;
    pending = pending.filter(function (el) { if (el.getBoundingClientRect().top < h * 0.92) { el.classList.add("in"); return false; } return true; });
    stats = stats.filter(function (el) { if (el.getBoundingClientRect().top < h * 0.95) { countUp(el); return false; } return true; });
    if (!pending.length && !stats.length) removeEventListener("scroll", onSweep);
  }
  var s2 = false;
  function onSweep() { if (s2) return; s2 = true; requestAnimationFrame(function () { s2 = false; sweep(); }); }
  addEventListener("scroll", onSweep, { passive: true });
  addEventListener("resize", sweep);
  function countUp(el) {
    var m = el.textContent.trim().match(/^([^0-9]*)([0-9]+(?:\.[0-9]+)?)(.*)$/); if (!m) return;
    var pre = m[1], target = parseFloat(m[2]), suf = m[3], dec = (m[2].split(".")[1] || "").length, t0 = null;
    requestAnimationFrame(function step(ts) {
      if (!t0) t0 = ts; var p = Math.min(1, (ts - t0) / 1100), v = target * (1 - Math.pow(1 - p, 3));
      el.textContent = pre + v.toFixed(dec) + suf; if (p < 1) requestAnimationFrame(step); else el.textContent = pre + target.toFixed(dec) + suf;
    });
  }
  onScroll(); sweep();
})();
