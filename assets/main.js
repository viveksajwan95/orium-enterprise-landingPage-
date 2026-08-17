(function () {
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia("(pointer: fine)").matches;

  /* ============ PRELOADER ============ */
  var loader = document.getElementById("loader");
  if (loader) {
    var pctEl = loader.querySelector(".l-pct");
    var pct = 0;
    var loaderTimer = setInterval(function () {
      pct = Math.min(pct + Math.ceil(Math.random() * 14), 100);
      if (pctEl) pctEl.textContent = pct;
      if (pct >= 100) {
        clearInterval(loaderTimer);
        finishLoad();
      }
    }, 90);
    var loadDone = false;
    function finishLoad() {
      if (loadDone) return;
      loadDone = true;
      loader.classList.add("done");
      setTimeout(function () {
        document.body.classList.remove("loading");
        if (loader) loader.remove();
      }, 700);
    }
    window.addEventListener("load", function () { setTimeout(finishLoad, 400); });
    setTimeout(finishLoad, 3200);
  }

  /* ============ SCROLL PROGRESS ============ */
  var scrollbar = document.getElementById("scrollbar");
  function onScrollProgress() {
    if (!scrollbar) return;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    scrollbar.style.transform = "scaleX(" + (max > 0 ? window.scrollY / max : 0) + ")";
  }

  /* ============ NAV HIDE / SHOW ============ */
  var nav = document.querySelector("nav.site-nav");
  var lastY = 0;
  function onNav() {
    if (!nav) return;
    nav.classList.toggle("scrolled", window.scrollY > 30);
    if (window.scrollY > 140 && window.scrollY > lastY) nav.classList.add("hidden");
    else nav.classList.remove("hidden");
    lastY = window.scrollY;
  }

  /* ============ CURSOR ============ */
  var dot = document.getElementById("cursorDot");
  var ring = document.getElementById("cursorRing");
  var mouseX = -100, mouseY = -100, ringX = -100, ringY = -100;
  if (dot && ring && fine) {
    document.addEventListener("mousemove", function (e) {
      mouseX = e.clientX; mouseY = e.clientY;
      dot.style.transform = "translate(" + (mouseX - 3.5) + "px," + (mouseY - 3.5) + "px)";
    });
    document.addEventListener("mousedown", function () { document.body.classList.add("cursor-down"); });
    document.addEventListener("mouseup", function () { document.body.classList.remove("cursor-down"); });
    var interactive = "a, button, summary, .cap, .value, .industry-chip, .lnk, .btn, .contact-line";
    document.addEventListener("mouseover", function (e) {
      if (e.target.closest(interactive)) document.body.classList.add("cursor-hover");
    });
    document.addEventListener("mouseout", function (e) {
      if (e.target.closest(interactive)) document.body.classList.remove("cursor-hover");
    });
    (function cursorLoop() {
      ringX += (mouseX - ringX) * 0.16;
      ringY += (mouseY - ringY) * 0.16;
      ring.style.transform = "translate(" + (ringX - 19) + "px," + (ringY - 19) + "px)";
      requestAnimationFrame(cursorLoop);
    })();
  }

  /* ============ MAGNETIC BUTTONS ============ */
  if (fine && !reduced) {
    document.querySelectorAll(".btn, .lnk").forEach(function (el) {
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        var x = e.clientX - (r.left + r.width / 2);
        var y = e.clientY - (r.top + r.height / 2);
        var lift = el.classList.contains("btn") ? -3 : 0;
        el.style.transform = "translate(" + x * 0.22 + "px," + (y * 0.3 + lift) + "px)";
      });
      el.addEventListener("mouseleave", function () { el.style.transform = ""; });
    });
  }

  /* ============ TILT CARDS ============ */
  if (fine && !reduced) {
    document.querySelectorAll("[data-tilt]").forEach(function (el) {
      var level = parseFloat(el.getAttribute("data-tilt")) || 7;
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        el.style.setProperty("--mx", (px + 0.5) * 100 + "%");
        el.style.setProperty("--my", (py + 0.5) * 100 + "%");
        el.style.transform = "rotateY(" + px * level + "deg) rotateX(" + -py * level + "deg) translateY(-6px)";
      });
      el.addEventListener("mouseleave", function () {
        el.style.transform = "";
        el.style.transition = "transform .6s cubic-bezier(.2,.65,.25,1)";
        setTimeout(function () { el.style.transition = ""; }, 650);
      });
    });
  }

  /* ============ PARALLAX ============ */
  var pars = [];
  if (!reduced) {
    document.querySelectorAll("[data-par]").forEach(function (el) {
      pars.push({ el: el, speed: parseFloat(el.getAttribute("data-par")) || 0.15 });
    });
  }
  function onParallax() {
    var vh = window.innerHeight;
    pars.forEach(function (p) {
      var r = p.el.getBoundingClientRect();
      var center = r.top + r.height / 2 - vh / 2;
      p.el.style.transform = "translateY(" + center * p.speed + "px)";
    });
  }

  /* ============ REVEAL ============ */
  var rvEls = document.querySelectorAll("[data-rv]");
  if ("IntersectionObserver" in window && !reduced) {
    var rvObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          rvObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    rvEls.forEach(function (el) {
      var delay = el.getAttribute("data-rv-delay");
      if (delay) el.style.setProperty("--rv-delay", delay + "ms");
      rvObs.observe(el);
    });
  } else {
    rvEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ============ COUNTERS ============ */
  var counters = document.querySelectorAll("[data-count]");
  if (counters.length && "IntersectionObserver" in window) {
    var countObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var target = parseInt(el.getAttribute("data-count"), 10);
        var duration = 1600;
        var start = null;
        function step(ts) {
          if (!start) start = ts;
          var progress = Math.min((ts - start) / duration, 1);
          var eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.round(target * eased);
          if (progress < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
        countObs.unobserve(el);
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { countObs.observe(el); });
  }

  /* ============ HORIZONTAL SHOWCASE ============ */
  var hscroll = document.querySelector(".hscroll");
  var hscrollInner = document.querySelector(".hscroll-inner");
  var hscrollBar = document.querySelector(".hscroll-progress span");
  var hScrollMode = "none";
  if (hscroll && hscrollInner && !reduced) {
    var mq = window.matchMedia("(min-width: 1101px)");
    function hScrollSetup() {
      hScrollMode = mq.matches ? "on" : "off";
      if (hScrollMode === "off") {
        hscroll.style.height = "";
        hscrollInner.style.transform = "";
        if (hscrollBar) hscrollBar.style.transform = "scaleX(0)";
        return;
      }
      var maxShift = hscrollInner.scrollWidth - window.innerWidth;
      hscroll.style.height = window.innerHeight + maxShift + "px";
      var travel = hscroll.offsetHeight - window.innerHeight;
      var scrolled = Math.min(Math.max(window.scrollY - hscroll.offsetTop, 0), travel);
      var progress = travel > 0 ? scrolled / travel : 0;
      hscrollInner.style.transform = "translate3d(" + (-progress * maxShift) + "px,0,0)";
      if (hscrollBar) hscrollBar.style.transform = "scaleX(" + progress + ")";
    }
    function hScrollOnScroll() {
      if (hScrollMode !== "on") return;
      var travel = hscroll.offsetHeight - window.innerHeight;
      var scrolled = Math.min(Math.max(window.scrollY - hscroll.offsetTop, 0), travel);
      var progress = travel > 0 ? scrolled / travel : 0;
      var maxShift = hscrollInner.scrollWidth - window.innerWidth;
      hscrollInner.style.transform = "translate3d(" + (-progress * maxShift) + "px,0,0)";
      if (hscrollBar) hscrollBar.style.transform = "scaleX(" + progress + ")";
    }
    mq.addEventListener("change", hScrollSetup);
    window.addEventListener("resize", hScrollSetup);
    hScrollSetup();
    window.__hscroll = hScrollOnScroll;
  }

  /* ============ FAQ ACCORDION ============ */
  var faqItems = document.querySelectorAll(".faq-item");
  faqItems.forEach(function (item) {
    item.addEventListener("toggle", function () {
      if (!item.open) return;
      faqItems.forEach(function (other) { if (other !== item) other.open = false; });
    });
  });

  /* ============ MOBILE MENU ============ */
  var hamburger = document.getElementById("hamburger");
  var mobileMenu = document.getElementById("mobileMenu");
  var mClose = document.getElementById("mClose");
  function toggleMenu(open) {
    if (!mobileMenu) return;
    mobileMenu.classList.toggle("open", open);
    document.body.style.overflow = open ? "hidden" : "";
    if (hamburger) {
      hamburger.setAttribute("aria-expanded", open ? "true" : "false");
      if (!open) hamburger.focus();
    }
  }
  if (hamburger) hamburger.addEventListener("click", function () { toggleMenu(true); });
  if (mClose) mClose.addEventListener("click", function () { toggleMenu(false); });
  if (mobileMenu) mobileMenu.addEventListener("click", function (e) {
    if (e.target.closest("a")) toggleMenu(false);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && mobileMenu && mobileMenu.classList.contains("open")) toggleMenu(false);
  });

  /* ============ GOLD DUST PARTICLES ============ */
  var canvas = document.getElementById("dust");
  if (canvas && fine && !reduced) {
    var ctx = canvas.getContext("2d");
    var W, H, particles = [];
    var golds = ["231,199,123", "246,227,174", "200,198,192", "168,126,53"];
    function resize() {
      var r = canvas.parentElement.getBoundingClientRect();
      W = canvas.width = r.width;
      H = canvas.height = r.height;
    }
    function seed() {
      particles = [];
      var count = Math.min(150, Math.floor((W * H) / 11000));
      for (var i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * W,
          y: Math.random() * H,
          r: 0.6 + Math.random() * 2,
          vx: (Math.random() - 0.5) * 0.18,
          vy: -0.08 - Math.random() * 0.3,
          c: golds[Math.floor(Math.random() * golds.length)],
          tw: Math.random() * Math.PI * 2,
          ts: 0.008 + Math.random() * 0.02,
          ember: Math.random() < 0.06
        });
      }
    }
    var running = true;
    function frame() {
      if (!running) return;
      ctx.clearRect(0, 0, W, H);
      particles.forEach(function (p) {
        p.x += p.vx; p.y += p.vy; p.tw += p.ts;
        if (p.y < -10) { p.y = H + 10; p.x = Math.random() * W; }
        if (p.x < -10) p.x = W + 10;
        if (p.x > W + 10) p.x = -10;
        var a = 0.2 + Math.abs(Math.sin(p.tw)) * 0.55;
        if (p.ember) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * 3.2, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(231,199,123," + a * 0.22 + ")";
          ctx.fill();
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(" + p.c + "," + a + ")";
        ctx.fill();
      });
      requestAnimationFrame(frame);
    }
    resize();
    seed();
    frame();
    window.addEventListener("resize", function () { resize(); seed(); });
    document.addEventListener("visibilitychange", function () {
      running = document.visibilityState === "visible";
      if (running) requestAnimationFrame(frame);
    });
  }

  /* ============ SCROLL DRIVER ============ */
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      onScrollProgress();
      onNav();
      onParallax();
      if (window.__hscroll) window.__hscroll();
      ticking = false;
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScrollProgress();
  onNav();
  onParallax();
  if (window.__hscroll) window.__hscroll();
})();