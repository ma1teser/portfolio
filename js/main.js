/* Maleeha Abrar — portfolio landing page interactions */
(() => {
  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* 2. Rotating skills + shuffled "P" (in sync) ---------------------- */
  const skills = [
    "designs for user experience",
    "illustrates on a digital canvas",
    "designs for brands and people",
    "plans marketing campaigns",
    "edits and shoots videos",
    "animates interfaces",
    "creates content for social media",
    "builds visual identities",
    "prototypes ideas in Figma",
    "researches what users need",
    "designs graphics for events",
  ];

  // The P from your original site (assets/p/P00.svg), placed exactly as in your Canva file.
  // (P01–P18 are still in assets/p/ — add their lines back here to shuffle them again.)
  // All numbers are Canva units, copied from the SVGs:
  //   tx, ty = where the P was placed;  x, y, w, h = the P's own outline box
  const pImages = [
    { src: "assets/p/P00.svg", tx: 0,       ty: 943.334,  x: 115.78,  y: -370.52, w: 447.72,  h: 373.61 },
  ];

  // The text in your Canva files (same in every file):
  const CANVA = {
    em: 214.44,          // Canva units per "ortfolio" font-size (its "l" is 160.83 tall = 0.75em in Montserrat)
    ortfolioX: 574.43,   // where "ortfolio" starts (relative to where "maleeha's" starts)
    ortfolioBase: 805.47,// "ortfolio" baseline
    nameBase: 560.51,    // "maleeha's" baseline
  };
  const em = (units) => units / CANVA.em;

  const pImg = document.getElementById("pImg");
  const word = document.getElementById("ncWord");
  // a page can list its own rotating lines in data-words="line one|line two|…" (the About page does)
  if (word && word.dataset.words) skills.splice(0, skills.length, ...word.dataset.words.split("|"));

  // The line on the paper crossfades too: two copies sit in the same spot and swap.
  const wordLayers = [];
  if (word) {
    const a = document.createElement("span");
    a.className = "nc-layer";
    word.before(a);
    a.appendChild(word);
    const b = a.cloneNode(true);
    b.querySelector(".nc-word").removeAttribute("id");
    b.classList.add("is-hidden");
    b.setAttribute("aria-hidden", "true");
    a.after(b);
    wordLayers.push(a, b);
  }
  let wordFront = 0;
  const showWord = (text) => {
    const next = wordLayers[1 - wordFront], cur = wordLayers[wordFront];
    // first word ("designs", "illustrates", …) in italics, the rest as normal
    const box = next.querySelector(".nc-word");
    const [verb, ...rest] = text.split(" ");
    const em = document.createElement("em");
    em.textContent = verb;
    box.replaceChildren(em, document.createTextNode(rest.length ? " " + rest.join(" ") : ""));
    next.classList.remove("is-hidden");
    next.removeAttribute("aria-hidden");
    cur.classList.add("is-hidden");
    cur.setAttribute("aria-hidden", "true");
    wordFront = 1 - wordFront;
  };
  const hName = document.querySelector(".h-name");
  const hPort = document.querySelector(".h-port");
  let idx = 0;

  // shuffle: every P shows once per round, in a new random order, never the same twice in a row
  let deck = [];
  let last = null;
  const nextP = () => {
    if (!deck.length) {
      deck = pImages.slice();
      for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
      }
      if (deck[deck.length - 1] === last) deck.unshift(deck.pop());
    }
    return (last = deck.pop());
  };

  // Put the two lines the same distance apart as in Canva (measured, so it's exact in any browser).
  const baselineOf = (el) => {
    const m = document.createElement("span");
    m.style.cssText = "display:inline-block;width:0;height:0;vertical-align:baseline";
    el.appendChild(m);
    const y = m.getBoundingClientRect().top;
    m.remove();
    return y;
  };
  const fitLines = () => {
    if (!hName || !hPort || hName.closest(".hero-title--serif")) return; // the serif home title is spaced in CSS
    hPort.style.marginTop = "0px";
    const size = parseFloat(getComputedStyle(hPort).fontSize);
    const want = em(CANVA.ortfolioBase - CANVA.nameBase) * size;
    const have = baselineOf(hPort) - baselineOf(hName);
    hPort.style.marginTop = `${(want - have) / size}em`;
  };

  // The P sits in an empty box that ends exactly where "ortfolio" starts and rests on its baseline,
  // so each P lands where you placed it — and "ortfolio" never moves.
  // Two copies of the P take turns: the new one fades in while the old one fades out,
  // so the switch is a smooth crossfade instead of a hard swap.
  const pLayers = pImg ? [pImg, pImg.cloneNode()] : [];
  if (pImg) {
    pLayers[1].removeAttribute("id");
    pLayers[1].classList.add("is-hidden");
    pImg.after(pLayers[1]);
  }
  let front = 0;

  const showP = (p) => {
    const next = pLayers[1 - front];
    const place = () => {
      next.style.width = `${em(p.w)}em`;
      next.style.height = `${em(p.h)}em`;
      next.style.left = `${em(p.tx + p.x)}em`;
      next.style.bottom = `${em(CANVA.ortfolioBase - (p.ty + p.y + p.h))}em`;
      next.classList.remove("is-hidden");
      pLayers[front].classList.add("is-hidden");
      front = 1 - front;
    };
    next.src = p.src;
    next.decode().then(place, place); // wait until it's ready so it never pops in half-drawn
  };

  // instant swap — no animation
  const step = () => {
    idx = (idx + 1) % skills.length;
    if (pImages.length > 1) showP(nextP());
    showWord(skills[idx]);
  };

  // pages without the P (About) still space their two title lines exactly like home
  if (!pImg && hName && hPort) document.fonts.load("800 100px Montserrat").then(fitLines);
  if (word) {
    if (pImg) {
      pImages.forEach((p) => { new Image().src = p.src; }); // preload so swaps are instant
      document.fonts.load("800 100px Montserrat").then(() => { fitLines(); showP(nextP()); });
    }
    const SPEED = 2800; // ms between changes (smaller = faster)
    let timer = setInterval(step, SPEED);
    document.addEventListener("visibilitychange", () => {
      clearInterval(timer);
      if (!document.hidden) timer = setInterval(step, SPEED);
    });
  }

  /* 2b. Arrow on the paper: glide down so all three project folders are in view */
  const arrow = document.querySelector(".nc-arrow");
  const projects = arrow && document.querySelector(arrow.getAttribute("href")); // #projects on home, #intro on About
  if (arrow && projects) {
    arrow.addEventListener("click", (e) => {
      e.preventDefault();
      const header = document.getElementById("siteHeader");
      const offset = (header ? header.offsetHeight : 0) + 16;
      const top = projects.getBoundingClientRect().top + scrollY - offset;
      window.scrollTo({ top, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }

  /* 3. Folders — all open by default; tabs open/close each one -------- */
  // (.folder--static folders, like "About me", always stay open)
  document.querySelectorAll(".folder:not(.folder--static)").forEach((folder) => {
    const tab = folder.querySelector(".folder-tab");
    const reveal = folder.querySelector(".folder-reveal");

    const setOpen = (open) => {
      folder.classList.toggle("is-open", open);
      if (!open) folder.classList.remove("is-settled");
      tab.setAttribute("aria-expanded", String(open));
      reveal.inert = !open;
    };

    setOpen(folder.classList.contains("is-open"));
    if (folder.classList.contains("is-open")) folder.classList.add("is-settled");

    reveal.addEventListener("transitionend", (e) => {
      if (e.target === reveal && folder.classList.contains("is-open")) folder.classList.add("is-settled");
    });
    tab.addEventListener("click", () => setOpen(!folder.classList.contains("is-open")));
    // tabs work from the keyboard too
    tab.setAttribute("role", "button");
    tab.tabIndex = 0;
    tab.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpen(!folder.classList.contains("is-open")); }
    });
    // a closed folder also opens when you click anywhere on it
    folder.querySelector(".folder-body").addEventListener("click", () => {
      if (!folder.classList.contains("is-open")) setOpen(true);
    });
  });

  /* 3c. Subtle scroll animation: things gently fade up the first time they scroll into view */
  if (!reduceMotion && "IntersectionObserver" in window) {
    // (the first folder never fades: the paper's end is tucked under it and must stay hidden)
    const sel = ".cabinet > .folder:not(:first-child), .case-item, .wk, .phone-item, .ws-intro, .ws-more, .am-photo, .am-bio, .am-skill, .am-lists > div, .entry, .footer-inner";
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        en.target.classList.add("is-in");
        io.unobserve(en.target);
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    document.querySelectorAll(sel).forEach((el) => {
      // pieces side by side come in a moment apart
      const sibs = [...el.parentElement.children].filter((s) => s.matches(sel));
      el.style.setProperty("--sr-i", Math.min(sibs.indexOf(el), 4));
      // anything already on screen when the page opens stays put (the load-in animation covers that)
      if (el.getBoundingClientRect().top < innerHeight) return;
      el.classList.add("sr");
      io.observe(el);
    });
  }

  /* 4b. Click an image anywhere on the site to see it bigger; click off it (or press Esc / ×) to close */
  const zoomTargets = "[data-zoom], .gf-zoom, .gf-shot img, .gf-phone img, .gf-reveal img, .case-phone img, .sc-old img, .sc-new img, .sc-footer, .sc-frame-img img, .sc-tile img, .sc-page-img img, .sc-access-panel, .sc-shot--mood img, .wk-card img";
  if (document.querySelector(zoomTargets)) {
    let zoom = document.getElementById("zoom");
    if (!zoom) { // pages without the Workspace viewer get the same one
      zoom = document.createElement("dialog");
      zoom.className = "zoom"; zoom.id = "zoom"; zoom.setAttribute("aria-label", "Enlarged image");
      zoom.innerHTML = '<button class="zoom-close" id="zoomClose" aria-label="Close">&times;</button><img id="zoomImg" alt="" />';
      document.body.appendChild(zoom);
    }
    const zoomImg = document.getElementById("zoomImg");
    const closeZoom = () => { zoom.close(); root.classList.remove("modal-open"); };
    const openZoom = (src, alt) => { zoomImg.src = src; zoomImg.alt = alt || ""; zoom.showModal(); root.classList.add("modal-open"); };
    document.addEventListener("click", (e) => {
      const el = e.target.closest(zoomTargets);
      if (!el || zoom.contains(el) || el.closest(".no-zoom")) return; // .no-zoom images stay put
      e.preventDefault();
      const img = el.tagName === "IMG" ? el : el.querySelector("img");
      if (!img) return;
      openZoom(el.dataset.zoom || el.getAttribute("href") || img.currentSrc || img.src, img.alt);
    });
    document.getElementById("zoomClose").addEventListener("click", closeZoom);
    zoom.addEventListener("click", (e) => { if (e.target === zoom) closeZoom(); }); // clicked off the image
    zoom.addEventListener("close", () => root.classList.remove("modal-open"));
  }
  /* 4a. Videos marked data-lazy-video only download and play once they scroll near the screen
     (keeps the page fast to open), and pause again when they leave it. */
  const lazyVideos = document.querySelectorAll("video[data-lazy-video]");
  if (lazyVideos.length) {
    const startVideo = (v) => { if (!v.src) { v.src = v.dataset.src; } v.play().catch(() => {}); };
    if ("IntersectionObserver" in window) {
      const vio = new IntersectionObserver((entries) => {
        entries.forEach((e) => { if (e.isIntersecting) startVideo(e.target); else if (e.target.src) e.target.pause(); });
      }, { rootMargin: "300px 0px" });
      lazyVideos.forEach((v) => vio.observe(v));
    } else {
      lazyVideos.forEach(startVideo);
    }
  }

  /* 4b2a. About hero sticky notes: each tag's data-note becomes a note on the board beside the title.
     Hovering (or tabbing to) a tag sticks its note on; they stay, so the board fills up as you explore. */
  const notesBoard = document.getElementById("heroNotes");
  if (notesBoard) {
    const tags = [...document.querySelectorAll(".at-tags li[data-note]")];
    let top = 10; // the most recently hovered note sits on top
    tags.forEach((tag, i) => {
      const note = document.createElement("p");
      note.className = "hn-note hn-pop";
      note.style.setProperty("--i", i);
      note.textContent = tag.dataset.note;
      note.setAttribute("aria-hidden", "true");
      notesBoard.append(note);
      const on = () => {
        notesBoard.querySelectorAll(".hn-pop.is-latest").forEach((n) => n.classList.remove("is-latest"));
        note.classList.add("is-on", "is-latest");
        note.style.zIndex = ++top;
      };
      tag.addEventListener("pointerenter", on);
      tag.addEventListener("focus", on);
    });
  }

  /* 4b2. About hero polaroid: hovering (or tabbing to) a tag shows that tag's photo */
  const polaroid = document.getElementById("heroPolaroid");
  if (polaroid) {
    const show = (name) => {
      polaroid.querySelectorAll(".hp-shot").forEach((s) => s.classList.toggle("is-on", s.dataset.shot === name));
    };
    document.querySelectorAll(".at-tags li[data-photo]").forEach((tag) => {
      const on = () => show(tag.dataset.photo);
      const off = () => show("me");
      tag.addEventListener("pointerenter", on);
      tag.addEventListener("focus", on);
      tag.addEventListener("pointerleave", off);
      tag.addEventListener("blur", off);
    });
  }

  /* 4b2b. Film strip (Stratford process): red arrows step through the frames one at a time */
  document.querySelectorAll("[data-reel]").forEach((reel) => {
    const film = reel.querySelector(".sc-film");
    const frames = [...film.children];
    const prev = reel.querySelector(".sc-reel-btn--prev");
    const next = reel.querySelector(".sc-reel-btn--next");
    const count = reel.querySelector(".sc-reel-count span");
    const pad = (n) => String(n).padStart(2, "0");
    // which frame is at the left edge of the strip right now
    const current = () => {
      let best = 0, dist = Infinity;
      frames.forEach((f, i) => { const d = Math.abs(f.offsetLeft - 10 - film.scrollLeft); if (d < dist) { dist = d; best = i; } });
      return best;
    };
    const go = (i) => {
      const f = frames[Math.max(0, Math.min(frames.length - 1, i))];
      film.scrollTo({ left: f.offsetLeft - 10, behavior: reduceMotion ? "auto" : "smooth" });
    };
    const update = () => {
      const i = current();
      // show the frames in view, e.g. "01–03" (or just "02" when one frame fills the strip)
      const step = frames[1] ? frames[1].offsetLeft - frames[0].offsetLeft : film.clientWidth;
      const shown = Math.max(1, Math.floor((film.clientWidth + 10) / step));
      const last = Math.min(frames.length, i + shown);
      if (count) count.textContent = shown > 1 ? `${pad(i + 1)}–${pad(last)}` : pad(i + 1);
      prev.disabled = film.scrollLeft <= 2;
      next.disabled = film.scrollLeft + film.clientWidth >= film.scrollWidth - 2;
    };
    prev.addEventListener("click", () => go(current() - 1));
    next.addEventListener("click", () => go(current() + 1));
    film.addEventListener("scroll", () => requestAnimationFrame(update), { passive: true });
    window.addEventListener("resize", update);
    update();
  });

  /* 4b3. Before/after slider (Stratford page): drag to reveal the redesign */
  document.querySelectorAll("[data-compare]").forEach((box) => {
    const range = box.querySelector("input[type=range]");
    const set = () => box.style.setProperty("--pos", `${range.value}%`);
    range.addEventListener("input", set);
    set();
  });

  /* 4c. Workspace sticky notes: pick one up, drag it anywhere in the top area, and it lands at a new tilt */
  const noteBox = document.querySelector(".sketch-notes");
  if (noteBox) {
    let z = 10, drag = null;
    noteBox.querySelectorAll(".sn").forEach((note) => {
      note.dataset.x = note.dataset.y = "0"; // how far it has been moved from its starting spot
      note.addEventListener("pointerdown", (e) => {
        if (e.button !== 0) return;
        e.preventDefault();
        const area = noteBox.getBoundingClientRect(), r = note.getBoundingClientRect();
        drag = {
          note, sx: e.clientX, sy: e.clientY, ox: +note.dataset.x, oy: +note.dataset.y,
          // keep the whole note inside the top section
          minX: area.left - r.left, maxX: area.right - r.right, minY: area.top - r.top, maxY: area.bottom - r.bottom,
        };
        note.style.zIndex = ++z; // the one you pick up goes on top
        note.classList.add("is-dragging");
        note.setPointerCapture(e.pointerId);
      });
      note.addEventListener("pointermove", (e) => {
        if (!drag || drag.note !== note) return;
        const clamp = (v, a, b) => Math.min(Math.max(v, a), b);
        const dx = clamp(e.clientX - drag.sx, drag.minX, drag.maxX);
        const dy = clamp(e.clientY - drag.sy, drag.minY, drag.maxY);
        note.dataset.x = drag.ox + dx; note.dataset.y = drag.oy + dy;
        note.style.translate = `${note.dataset.x}px ${note.dataset.y}px`;
      });
      const drop = () => {
        if (!drag || drag.note !== note) return;
        note.classList.remove("is-dragging");
        note.style.setProperty("--r", `${(Math.random() * 16 - 8).toFixed(1)}deg`); // lands at a new angle
        drag = null;
      };
      note.addEventListener("pointerup", drop);
      note.addEventListener("pointercancel", drop);
    });
  }

  document.querySelectorAll(".phone").forEach((phone) => {
    const video = phone.querySelector("video");
    if (!video) return;
    video.muted = true;
    phone.addEventListener("mouseenter", () => { video.play().catch(() => {}); phone.classList.add("is-playing"); });
    phone.addEventListener("mouseleave", () => { video.pause(); phone.classList.remove("is-playing"); });
  });

  /* 5. Header: line on scroll, mobile menu, active link --------------- */
  const header = document.getElementById("siteHeader");
  // tell the CSS how tall the header is, so the opening screen ends exactly at the fold
  const setHeaderH = () => { if (header) root.style.setProperty("--header-h", header.offsetHeight + "px"); };
  setHeaderH();
  window.addEventListener("resize", setHeaderH);
  const ws = document.getElementById("workspace");
  const links = document.querySelectorAll(".nav-link");
  let pastHero = null;
  const onScroll = () => {
    header.classList.toggle("is-scrolled", scrollY > 8);
    // pause the hero's looping animations once it's out of view (saves the browser work while scrolling)
    const past = scrollY > innerHeight;
    if (past !== pastHero) { pastHero = past; root.classList.toggle("past-hero", past); }
    // pages set their active link in the HTML (Workspace is its own page now, so Home stays active on home)
    if (!ws || !document.querySelector('.nav-link[href="#workspace"]')) return;
    const inWs = ws.offsetTop <= scrollY + innerHeight * 0.4;
    links.forEach((l) => {
      const h = l.getAttribute("href");
      l.classList.toggle("is-active", inWs ? h === "#workspace" : h === "#top");
    });
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const menuBtn = document.getElementById("menuBtn");
  const nav = document.getElementById("siteNav");
  const setMenu = (open) => {
    nav.classList.toggle("is-open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
  };
  menuBtn.addEventListener("click", () => setMenu(!nav.classList.contains("is-open")));
  nav.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("click", (e) => { if (!e.target.closest(".header-inner")) setMenu(false); });
})();
