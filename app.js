/* ==========================================================================
   CATRIN BARBERSHOP · app.js
   Dependencias locales (carpeta /vendor): GSAP + ScrollTrigger + SplitText, Lenis.
   Estructura:
   01 Config y utilidades · 02 WhatsApp · 03 Smooth scroll · 04 Loader · 05 Calavera de partículas
   06 Intro del hero · 07 Header, menú y progreso · 08 Marquee · 09 Manifiesto · 10 Fachada
   11 Titulares y reveals · 12 Servicios · 13 Galería · 14 Antes/Después · 15 Estudio y ritual
   16 Formulario · 16b Sonido de fondo · 17 Videos · 18 Arranque
   ========================================================================== */
(() => {
    'use strict';

    /* 01 CONFIG Y UTILIDADES ------------------------------------------------ */
    const CONFIG = {
        phone: '526677753403',          // WhatsApp del negocio (código de país + número)
        gold: '#e7b83a'
    };

    const $  = (sel, ctx = document) => ctx.querySelector(sel);
    const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
    const root = document.documentElement;
    const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const headerH = () => parseFloat(getComputedStyle(root).getPropertyValue('--hdr')) || 64;

    let lenis = null;
    let skull = null;
    let navLock = false; // tras pulsar un ancla, el header permanece visible mientras dura el desplazamiento

    /* 02 WHATSAPP ------------------------------------------------------------ */
    const waURL = (msg) => `https://wa.me/${CONFIG.phone}` + (msg ? `?text=${encodeURIComponent(msg)}` : '');

    function setupLinks() {
        $$('[data-wa]').forEach((a) => { a.href = waURL(a.dataset.wa); });
        // Gancho simple para analítica (GTM / GA4): window.dataLayer
        document.addEventListener('click', (e) => {
            const el = e.target.closest('[data-cta]');
            if (el && window.dataLayer) window.dataLayer.push({ event: 'cta_click', cta: el.dataset.cta });
        });
    }

    /* 03 SMOOTH SCROLL ------------------------------------------------------- */
    function setupLenis() {
        if (reduce || !window.Lenis) return;
        lenis = new window.Lenis({ lerp: 0.085, wheelMultiplier: 0.95, smoothWheel: true });
        lenis.on('scroll', window.ScrollTrigger.update);
        window.gsap.ticker.add((t) => lenis.raf(t * 1000));
        window.gsap.ticker.lagSmoothing(0);
        lenis.stop();
    }

    function scrollToTarget(target) {
        const offset = -(headerH() - 2);
        if (lenis) lenis.scrollTo(target, { offset, duration: 1.7, easing: (t) => 1 - Math.pow(1 - t, 4) });
        else {
            const y = target.getBoundingClientRect().top + window.scrollY + offset;
            window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
        }
    }

    function setupAnchors() {
        $$('a[href^="#"]').forEach((a) => {
            a.addEventListener('click', (e) => {
                const id = a.getAttribute('href');
                if (!id || id.length < 2) return;
                const target = $(id);
                if (!target) return;
                e.preventDefault();
                const wasOpen = menuState.open;
                if (wasOpen) closeMenu();
                navLock = true;
                window.setTimeout(() => scrollToTarget(target), wasOpen ? 450 : 0);
                window.setTimeout(() => { navLock = false; }, (wasOpen ? 450 : 0) + 2200);
                history.replaceState(null, '', id);
            });
        });
    }

    /* 04 LOADER -------------------------------------------------------------- */
    function buildTicks() {
        const g = $('.loader__ticks');
        if (!g) return;
        const NS = 'http://www.w3.org/2000/svg';
        for (let i = 0; i < 72; i++) {
            const a = (i / 72) * Math.PI * 2;
            const major = i % 6 === 0;
            const r1 = 99, r2 = major ? 106 : 103;
            const l = document.createElementNS(NS, 'line');
            l.setAttribute('x1', (100 + Math.cos(a) * r1).toFixed(2));
            l.setAttribute('y1', (100 + Math.sin(a) * r1).toFixed(2));
            l.setAttribute('x2', (100 + Math.cos(a) * r2).toFixed(2));
            l.setAttribute('y2', (100 + Math.sin(a) * r2).toFixed(2));
            if (major) l.setAttribute('class', 'is-major');
            g.appendChild(l);
        }
    }

    /** Progreso simulado + espera real de carga y fuentes. Resuelve cuando el loader empieza a abrirse. */
    function runLoader(onBuild) {
        const { gsap } = window;
        const loader = $('#loader');
        return new Promise((resolve) => {
            if (!loader) { onBuild(); resolve(); return; }
            buildTicks();
            const num = $('#loader-num');
            const st = { p: 0 };
            const draw = () => {
                if (num) num.textContent = String(Math.round(st.p));
                loader.style.setProperty('--lp', (st.p / 100).toFixed(3));
            };
            const finish = () => {
                onBuild(); // construye ScrollTriggers y partículas con todo ya cargado, tapado por el loader
                const a = $('.loader__panel--a'), b = $('.loader__panel--b'), seam = $('.loader__seam'), core = $('.loader__core');
                if (reduce) {
                    gsap.to(loader, { autoAlpha: 0, duration: 0.3, onComplete: () => loader.remove() });
                    resolve();
                    return;
                }
                const tl = gsap.timeline({ onComplete: () => loader.remove() });
                tl.to(core, { scale: 0.9, autoAlpha: 0, duration: 0.5, ease: 'power3.in' })
                  .fromTo(seam, { autoAlpha: 1, scaleX: 0 }, { scaleX: 1, duration: 0.55, ease: 'power4.inOut' }, '-=0.2')
                  .add(() => resolve(), '>-0.05')
                  .to(a, { yPercent: -101, duration: 1.1, ease: 'expo.inOut' }, '>-0.05')
                  .to(b, { yPercent: 101, duration: 1.1, ease: 'expo.inOut' }, '<')
                  .to(seam, { autoAlpha: 0, duration: 0.35 }, '<0.15');
            };

            const minTime = new Promise((r) => {
                gsap.to(st, { p: 92, duration: reduce ? 0.1 : 1.9, ease: 'power1.inOut', onUpdate: draw, onComplete: r });
            });
            const loaded = document.readyState === 'complete'
                ? Promise.resolve()
                : new Promise((r) => window.addEventListener('load', r, { once: true }));
            const fonts = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
            const safety = new Promise((r) => window.setTimeout(r, 7000));

            Promise.race([Promise.all([minTime, loaded, fonts]), safety]).then(() => {
                gsap.to(st, { p: 100, duration: reduce ? 0.05 : 0.55, ease: 'power2.out', onUpdate: draw, onComplete: finish });
            });
        });
    }

    /* 05 CALAVERA DE PARTÍCULAS ---------------------------------------------- */
    /**
     * Estampa el logotipo (máscara embebida al final del archivo) como ~15 000 puntos con físicas:
     * respiran, se repelen del cursor, laten con una onda cada 7 s, brillan con un destello de navaja
     * y se dispersan al salir del hero.
     */
    function createSkull() {
        const { gsap, ScrollTrigger } = window;
        const hero = $('#inicio'), canvas = $('#skull-canvas'), anchor = $('#hero-skull');
        const api = { assemble() {}, ready: false };
        if (!hero || !canvas || !anchor) return api;
        const ctx = canvas.getContext('2d');
        if (!ctx) { root.classList.add('no-canvas'); return api; }

        const mobile = window.innerWidth < 760;
        let COUNT = mobile ? 6500 : 15000;
        if ((navigator.hardwareConcurrency || 8) <= 4) COUNT = Math.round(COUNT * 0.65);

        const S = { asm: reduce ? 1 : 0, scroll: 0 };
        let W = 1, H = 1, dpr = 1, box = { x: 0, y: 0, w: 1, h: 1 };
        let visible = true, ready = false, spread = 600;
        let hx, hy, x, y, vx, vy, sx, sy, dx, dy, sz, ph;
        let c0 = 0, c1 = 0;
        let glintIdx;
        const ptr = { x: -9999, y: -9999 };
        let pulseAt = -1;

        // RNG determinista: la calavera siempre se dibuja igual
        let seed = 20241028;
        const rand = () => {
            seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
            let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
            t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };

        function layout() {
            W = hero.clientWidth; H = hero.clientHeight;
            dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 2);
            canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            const r = hero.getBoundingClientRect(), a = anchor.getBoundingClientRect();
            box = { x: a.left - r.left, y: a.top - r.top, w: a.width, h: a.height };
            spread = Math.max(W, H) * 0.7;
            if (reduce && ready) drawStatic();
        }

        function build(img) {
            const mw = img.naturalWidth, mh = img.naturalHeight;
            const off = document.createElement('canvas');
            off.width = mw; off.height = mh;
            const c = off.getContext('2d', { willReadFrequently: true });
            c.drawImage(img, 0, 0);
            const data = c.getImageData(0, 0, mw, mh).data;

            const cell = [], cum = [];
            let total = 0;
            for (let j = 0; j < mh; j++) {
                for (let i = 0; i < mw; i++) {
                    const v = data[(j * mw + i) * 4];
                    if (v > 0) {
                        const l = Math.max(0, (v - 20) / 235);
                        total += 0.03 + Math.pow(l, 2.3);
                        cum.push(total); cell.push(j * mw + i);
                    }
                }
            }
            if (!cell.length) { root.classList.add('no-canvas'); return; }

            const mk = () => new Float32Array(COUNT);
            hx = mk(); hy = mk(); x = mk(); y = mk(); vx = mk(); vy = mk(); sx = mk(); sy = mk(); dx = mk(); dy = mk(); sz = mk(); ph = mk();
            glintIdx = new Uint32Array(COUNT);
            c0 = Math.round(COUNT * 0.34); c1 = Math.round(COUNT * 0.95); // tier 0: tenue · tier 1: hueso · tier 2: dorado

            for (let k = 0; k < COUNT; k++) {
                const r = rand() * total;
                let lo = 0, hi = cum.length - 1;
                while (lo < hi) { const mid = (lo + hi) >> 1; if (cum[mid] < r) lo = mid + 1; else hi = mid; }
                const id = cell[lo];
                hx[k] = ((id % mw) + rand()) / mw;
                hy[k] = (((id / mw) | 0) + rand()) / mh;
                sz[k] = (0.85 + rand() * 0.95) * (mobile ? 1.05 : 1);
                ph[k] = rand() * Math.PI * 2;
                const a = rand() * Math.PI * 2, m = 0.5 + rand();
                sx[k] = Math.cos(a) * m; sy[k] = Math.sin(a) * m;      // posición de partida (dispersa)
                const b = rand() * Math.PI * 2, n = 0.4 + rand() * 0.9;
                dx[k] = Math.cos(b) * n; dy[k] = Math.sin(b) * n;      // dirección al dispersarse con el scroll
            }
            layout();
            for (let k = 0; k < COUNT; k++) {
                x[k] = box.x + hx[k] * box.w + sx[k] * spread * (1 - S.asm);
                y[k] = box.y + hy[k] * box.h + sy[k] * spread * (1 - S.asm);
            }
            ready = true; api.ready = true;
            if (reduce) drawStatic();
        }

        function drawStatic() {
            ctx.clearRect(0, 0, W, H);
            for (let k = 0; k < COUNT; k++) {
                x[k] = box.x + hx[k] * box.w; y[k] = box.y + hy[k] * box.h;
                ctx.fillStyle = k < c0 ? 'rgba(236,236,238,.5)' : (k < c1 ? 'rgba(236,236,238,.9)' : 'rgba(231,184,58,.95)');
                ctx.fillRect(x[k] - sz[k] / 2, y[k] - sz[k] / 2, sz[k], sz[k]);
            }
        }

        function tick(time, deltaMs) {
            if (!ready || !visible || reduce) return;
            const s = clamp(deltaMs / 16.667, 0.4, 2.5);
            const asm = S.asm, inv = 1 - asm, sc = S.scroll;
            const kSpring = 0.05 * s, damp = Math.pow(0.84, s);
            const R = mobile ? 70 : 115, R2 = R * R, F = 2.6 * s;
            const px = ptr.x, py = ptr.y;
            const cxs = box.x + box.w * 0.5, cys = box.y + box.h * 0.46;
            const breathe = (1 - sc) * 1.7;
            const tm = time;

            // onda de latido cada ~7 s
            if (pulseAt < 0 || tm - pulseAt > 7.2) pulseAt = tm;
            const pr = (tm - pulseAt) * 520;
            const pulsing = asm > 0.95 && pr < box.w * 0.9;

            // destello de navaja que cruza la calavera en diagonal
            const g = ((tm % 6.2) / 6.2) * 2.1 - 0.4;
            let gc = 0;

            ctx.clearRect(0, 0, W, H);
            let fill = '';
            for (let k = 0; k < COUNT; k++) {
                if (k === 0) fill = 'rgba(236,236,238,.5)';
                else if (k === c0) fill = 'rgba(236,236,238,.9)';
                else if (k === c1) fill = 'rgba(231,184,58,.95)';
                else fill = '';
                if (fill) ctx.fillStyle = fill;

                const hX = hx[k], hY = hy[k];
                let tx = box.x + hX * box.w + Math.sin(tm * 0.9 + ph[k]) * breathe;
                let ty = box.y + hY * box.h + Math.cos(tm * 1.1 + ph[k] * 1.3) * breathe;
                if (inv > 0.001) { tx += sx[k] * spread * inv; ty += sy[k] * spread * inv; }
                if (sc > 0.001) { tx += dx[k] * sc * 460; ty += dy[k] * sc * 300 - sc * 260; }

                let X = x[k], Y = y[k], VX = vx[k], VY = vy[k];

                const ddx = X - px, ddy = Y - py, d2 = ddx * ddx + ddy * ddy;
                if (d2 < R2) {
                    const d = Math.sqrt(d2) || 1, f = (1 - d / R);
                    const ff = f * f * F;
                    VX += (ddx / d) * ff * 2.2; VY += (ddy / d) * ff * 2.2;
                }
                if (pulsing) {
                    const ex = X - cxs, ey = Y - cys, ed = Math.sqrt(ex * ex + ey * ey) || 1, dr = Math.abs(ed - pr);
                    if (dr < 34) { const f = (1 - dr / 34) * 1.9 * s; VX += (ex / ed) * f; VY += (ey / ed) * f; }
                }

                VX += (tx - X) * kSpring; VY += (ty - Y) * kSpring;
                VX *= damp; VY *= damp;
                X += VX * s; Y += VY * s;
                x[k] = X; y[k] = Y; vx[k] = VX; vy[k] = VY;

                const w = sz[k];
                ctx.fillRect(X - w * 0.5, Y - w * 0.5, w, w);

                const pp = hX * 0.75 + hY * 0.65;
                if (asm > 0.9 && pp > g - 0.045 && pp < g + 0.045) glintIdx[gc++] = k;
            }
            if (gc) {
                ctx.fillStyle = 'rgba(255,224,138,.95)';
                for (let q = 0; q < gc; q++) {
                    const i = glintIdx[q];
                    ctx.fillRect(x[i] - 1.1, y[i] - 1.1, 2.2, 2.2);
                }
            }
        }

        // Entrada de puntero (también táctil mientras se arrastra)
        const onMove = (e) => {
            const r = canvas.getBoundingClientRect();
            ptr.x = e.clientX - r.left; ptr.y = e.clientY - r.top;
        };
        const onLeave = () => { ptr.x = -9999; ptr.y = -9999; };
        if (!reduce) {
            hero.addEventListener('pointermove', onMove, { passive: true });
            hero.addEventListener('pointerleave', onLeave);
            hero.addEventListener('pointerup', onLeave);
        }

        new IntersectionObserver((en) => { visible = en[0].isIntersecting; }).observe(hero);
        new ResizeObserver(() => { if (ready) layout(); }).observe(hero);
        gsap.ticker.add(tick);

        ScrollTrigger.create({
            trigger: hero, start: 'top top', end: 'bottom top',
            onUpdate: (self) => {
                S.scroll = self.progress;
                canvas.style.opacity = String(clamp(1 - self.progress * 1.15, 0, 1));
            }
        });

        const img = new Image();
        img.onload = () => build(img);
        img.onerror = () => root.classList.add('no-canvas');
        img.src = SKULL_MASK;

        api.assemble = () => { if (!reduce) gsap.to(S, { asm: 1, duration: 3.4, ease: 'power3.out' }); };
        return api;
    }

    /* 06 INTRO DEL HERO ------------------------------------------------------ */
    let heroSplit = null;
    function prepareHero() {
        const { gsap } = window;
        if (reduce) return;
        heroSplit = window.SplitText.create('.hero__chars', { type: 'words,chars', wordsClass: 'hw', charsClass: 'ch' });
        gsap.set(heroSplit.chars, { yPercent: 118, rotate: 7 });
        gsap.set(['.hero__sub', '.hero__cta .btn'], { autoAlpha: 0, y: 32 });
        gsap.set('.hero__ring', { autoAlpha: 0, scale: 0.6, rotate: -70 });
        gsap.set('.site-header__inner > *', { autoAlpha: 0, y: -22 });
    }

    function introHero() {
        const { gsap } = window;
        if (skull) skull.assemble();
        if (reduce) return;
        const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
        tl.to(heroSplit.chars, { yPercent: 0, rotate: 0, duration: 1.5, stagger: 0.04 }, 0.05)
          .to('.hero__sub', { autoAlpha: 1, y: 0, duration: 1.2 }, 0.5)
          .to('.hero__cta .btn', { autoAlpha: 1, y: 0, duration: 1.2, stagger: 0.12, clearProps: 'transform' }, 0.65)
          .to('.site-header__inner > *', { autoAlpha: 1, y: 0, duration: 1.1, stagger: 0.08, clearProps: 'transform' }, 0.3)
          .to('.hero__ring', { autoAlpha: 1, scale: 1, rotate: 0, duration: 1.8 }, 1);
    }

    /* 07 HEADER, MENÚ Y PROGRESO -------------------------------------------- */
    const menuState = { open: false };
    let openMenu = () => {}, closeMenu = () => {};

    function setupHeader() {
        const { gsap, ScrollTrigger } = window;
        const header = $('#site-header');
        const progressEls = $$('.pole, .topbar');

        ScrollTrigger.create({
            start: 0, end: 'max',
            onUpdate: (self) => {
                const y = self.scroll();
                header.classList.toggle('is-solid', y > 40);
                header.classList.toggle('is-hidden', self.direction === 1 && y > 640 && !menuState.open && !navLock);
                const p = self.progress.toFixed(4);
                progressEls.forEach((el) => el.style.setProperty('--p', p));
            }
        });

        // Enlace activo según la sección en pantalla
        ['servicios', 'trabajos', 'estudio', 'visitanos'].forEach((id) => {
            const sec = document.getElementById(id), link = $(`.nav__link[href="#${id}"]`);
            if (!sec || !link) return;
            ScrollTrigger.create({
                trigger: sec, start: 'top 55%', end: 'bottom 55%',
                onToggle: (self) => link.classList.toggle('is-active', self.isActive)
            });
        });

        // Menú móvil
        const burger = $('#burger'), menu = $('#menu'), closeBtn = $('#menu-close');
        const focusables = () => $$('a[href], button', menu).filter((el) => !el.hidden);
        openMenu = () => {
            if (menuState.open) return;
            menuState.open = true;
            menu.hidden = false;
            burger.setAttribute('aria-expanded', 'true');
            if (lenis) lenis.stop();
            root.style.overflow = 'hidden';
            requestAnimationFrame(() => menu.classList.add('is-open'));
            gsap.fromTo('.menu__link span', { yPercent: 115 }, { yPercent: 0, duration: 1.1, stagger: 0.07, ease: 'expo.out', delay: 0.25 });
            gsap.fromTo('.menu__foot', { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.9, ease: 'expo.out', delay: 0.5 });
            closeBtn.focus({ preventScroll: true });
        };
        closeMenu = () => {
            if (!menuState.open) return;
            menuState.open = false;
            menu.classList.remove('is-open');
            burger.setAttribute('aria-expanded', 'false');
            root.style.overflow = '';
            if (lenis) lenis.start();
            window.setTimeout(() => { if (!menuState.open) menu.hidden = true; }, 800);
            burger.focus({ preventScroll: true });
        };
        burger.addEventListener('click', openMenu);
        closeBtn.addEventListener('click', closeMenu);
        document.addEventListener('keydown', (e) => {
            if (!menuState.open) return;
            if (e.key === 'Escape') closeMenu();
            if (e.key === 'Tab') {
                const f = focusables();
                if (!f.length) return;
                const first = f[0], last = f[f.length - 1];
                if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
                else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
            }
        });
        window.matchMedia('(min-width: 900px)').addEventListener('change', (m) => { if (m.matches) closeMenu(); });
    }

    function setupMagnetic() {
        const { gsap } = window;
        if (reduce || !finePointer) return;
        $$('.btn--magnetic').forEach((btn) => {
            const xTo = gsap.quickTo(btn, 'x', { duration: 0.6, ease: 'power3' });
            const yTo = gsap.quickTo(btn, 'y', { duration: 0.6, ease: 'power3' });
            btn.addEventListener('pointermove', (e) => {
                const r = btn.getBoundingClientRect();
                xTo((e.clientX - r.left - r.width / 2) * 0.28);
                yTo((e.clientY - r.top - r.height / 2) * 0.4);
            });
            btn.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
        });
    }

    /* 08 MARQUEE ------------------------------------------------------------- */
    /** La cinta corre sola y reacciona al scroll: más rápida con la velocidad, invertida al subir. */
    function setupMarquee() {
        const { gsap, ScrollTrigger } = window;
        const track = $('.marquee__track');
        if (!track || reduce) return;
        track.style.animation = 'none';
        const tween = gsap.to(track, { xPercent: -50, ease: 'none', duration: 46, repeat: -1 });
        let target = 1, cur = 1, dir = 1;
        const setSkew = gsap.quickSetter(track, 'skewX', 'deg');
        ScrollTrigger.create({
            start: 0, end: 'max',
            onUpdate: (self) => {
                dir = self.direction || dir;
                target = dir * (1 + Math.min(Math.abs(self.getVelocity()) / 240, 9));
            }
        });
        gsap.ticker.add(() => {
            target += (dir - target) * 0.04;
            cur += (target - cur) * 0.1;
            tween.timeScale(cur);
            setSkew(clamp(-(Math.abs(cur) - 1) * dir * 1.2, -9, 9));
        });
    }

    /* 09 MANIFIESTO ---------------------------------------------------------- */
    function setupManifesto() {
        const { gsap } = window;
        const text = $('.manifesto__text');
        if (!text) return;
        const photos = $$('.manifesto__photo');
        if (reduce) return;

        const split = window.SplitText.create(text, { type: 'words', wordsClass: 'w' });
        const words = split.words;
        gsap.set(words, { opacity: 0.12 });
        const key = words.filter((w) => /responsabilidad/i.test(w.textContent));
        const mm = gsap.matchMedia();

        mm.add('(min-width: 900px)', () => {
            gsap.set('.manifesto__note', { opacity: 0, y: 24 });
            const tl = gsap.timeline({
                scrollTrigger: { trigger: '.manifesto', start: 'top top', end: '+=170%', pin: true, scrub: 0.7, anticipatePin: 1 }
            });
            tl.to(words, { opacity: 1, stagger: 0.12, ease: 'none', duration: 1 }, 0)
              .to(key, { color: CONFIG.gold, duration: 0.6 }, '>-0.8')
              .to('.manifesto__note', { opacity: 1, y: 0, duration: 0.8 }, '>-0.3');
            const total = tl.duration();
            photos.forEach((p) => tl.to(p, { y: parseFloat(p.dataset.parallax) || -80, ease: 'none', duration: total }, 0));
            tl.to({}, { duration: total * 0.22 });
        });

        mm.add('(max-width: 899.98px)', () => {
            gsap.to(words, {
                opacity: 1, stagger: 0.12, ease: 'none',
                scrollTrigger: { trigger: text, start: 'top 82%', end: 'bottom 48%', scrub: 0.6 }
            });
            gsap.to(key, { color: CONFIG.gold, scrollTrigger: { trigger: text, start: 'bottom 62%', end: 'bottom 46%', scrub: true } });
            photos.forEach((p) => gsap.to(p, { y: (parseFloat(p.dataset.parallax) || -80) * 0.35, ease: 'none', scrollTrigger: { trigger: p, start: 'top bottom', end: 'bottom top', scrub: true } }));
        });
    }

    /* 10 FACHADA (imagen que se abre en grande) ------------------------------ */
    function setupFachada() {
        const { gsap } = window;
        const sec = $('.reveal-media');
        if (!sec || reduce) return;
        const frame = $('.rm__frame'), img = $('.rm__img'), veil = $('.rm__veil'), copy = $('.rm__copy');
        const mm = gsap.matchMedia();
        mm.add({ wide: '(min-width: 900px)', narrow: '(max-width: 899.98px)' }, (ctx) => {
            const { wide } = ctx.conditions;
            gsap.set(frame, { clipPath: wide ? 'inset(22% 30% 22% 30%)' : 'inset(26% 14% 26% 14%)' });
            gsap.set(img, { scale: 1.4 });
            gsap.set(veil, { opacity: 0 });
            gsap.set(copy, { autoAlpha: 0, y: 56 });
            const tl = gsap.timeline({
                scrollTrigger: { trigger: sec, start: 'top top', end: '+=140%', pin: true, scrub: 0.8, anticipatePin: 1 }
            });
            tl.to(frame, { clipPath: 'inset(0% 0% 0% 0%)', ease: 'power2.inOut', duration: 1 }, 0)
              .to(img, { scale: 1, ease: 'none', duration: 1.7 }, 0)
              .to(veil, { opacity: 1, duration: 0.5 }, 0.55)
              .to(copy, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power3.out' }, 0.9)
              .to({}, { duration: 0.35 });
        });
    }

    /* 11 TITULARES Y REVEALS ------------------------------------------------- */
    function setupReveals() {
        const { gsap, ScrollTrigger } = window;
        if (reduce) return;

        // Titulares: líneas con máscara que suben
        $$('.h2').forEach((el) => {
            window.SplitText.create(el, {
                type: 'lines', mask: 'lines', autoSplit: true, linesClass: 'ln',
                onSplit: (self) => gsap.from(self.lines, {
                    yPercent: 112, duration: 1.3, ease: 'expo.out', stagger: 0.09,
                    scrollTrigger: { trigger: el, start: 'top 88%', once: true }
                })
            });
        });

        const batch = (sel, opts = {}) => {
            const els = $$(sel);
            if (!els.length) return;
            const { y = 38, stagger = 0.1, start = 'top 90%' } = opts;
            gsap.set(els, { autoAlpha: 0, y });
            ScrollTrigger.batch(els, {
                start, once: true,
                onEnter: (b) => gsap.to(b, { autoAlpha: 1, y: 0, duration: 1.2, ease: 'expo.out', stagger, clearProps: 'transform,opacity,visibility' })
            });
        };
        batch('.eyebrow, .lede, .change__copy .btn, .visit__copy .btn, .visit__addr, .visit__hours, .facts li, .crew__reqs, .crew__copy .btn, .products__cta');
        batch('.svc', { y: 26, stagger: 0.07, start: 'top 94%' });
        batch('.tile', { y: 60, stagger: 0.12, start: 'top 92%' });
        batch('.form, .ba, .visit__media, .crew__offer', { y: 50, stagger: 0.14 });
        batch('.pcard', { y: 60, stagger: 0.12, start: 'top 92%' });
        batch('.footer__cols > div, .footer__talk', { y: 30, stagger: 0.1, start: 'top 96%' });

        // Wordmark del footer
        gsap.fromTo('.footer__mark img', { yPercent: 38 }, {
            yPercent: 0, ease: 'none',
            scrollTrigger: { trigger: '.footer', start: 'top bottom', end: 'bottom bottom', scrub: true }
        });
    }

    /* 12 SERVICIOS ----------------------------------------------------------- */
    function setupServices() {
        const { gsap } = window;
        const list = $('#svc-list');
        if (!list) return;
        const rows = $$('.svc', list);
        const mm = gsap.matchMedia();

        // Escritorio: vista previa que sigue al cursor
        mm.add('(min-width: 900px) and (hover: hover)', () => {
            const prev = $('#svc-preview'), pimg = $('img', prev);
            gsap.set(prev, { autoAlpha: 0, scale: 0.88, xPercent: 0 });
            const xTo = gsap.quickTo(prev, 'x', { duration: 0.7, ease: 'power3' });
            const yTo = gsap.quickTo(prev, 'y', { duration: 0.7, ease: 'power3' });
            const rTo = gsap.quickTo(prev, 'rotation', { duration: 0.9, ease: 'power3' });
            const onMove = (e) => {
                const w = prev.offsetWidth, h = prev.offsetHeight;
                xTo(Math.min(e.clientX + 28, window.innerWidth - w - 16));
                yTo(clamp(e.clientY - h / 2, 12, window.innerHeight - h - 12));
                rTo(clamp((e.movementX || 0) * 0.3, -7, 7));
            };
            const show = (row) => {
                if (pimg.getAttribute('src') !== row.dataset.img) pimg.setAttribute('src', row.dataset.img);
                gsap.to(prev, { autoAlpha: 1, scale: 1, duration: 0.6, ease: 'expo.out', overwrite: 'auto' });
            };
            const hide = () => gsap.to(prev, { autoAlpha: 0, scale: 0.88, rotation: 0, duration: 0.45, ease: 'power3.out', overwrite: 'auto' });
            const handlers = rows.map((row) => {
                const enter = () => show(row);
                row.addEventListener('pointerenter', enter);
                return [row, enter];
            });
            list.addEventListener('pointermove', onMove);
            list.addEventListener('pointerleave', hide);
            // precarga de las vistas previas
            window.requestIdleCallback ? window.requestIdleCallback(() => rows.forEach((r) => { new Image().src = r.dataset.img; })) : null;
            return () => {
                handlers.forEach(([row, fn]) => row.removeEventListener('pointerenter', fn));
                list.removeEventListener('pointermove', onMove);
                list.removeEventListener('pointerleave', hide);
                gsap.set(prev, { clearProps: 'all' });
            };
        });

        // Móvil y tablet: acordeón accesible
        mm.add('(max-width: 899.98px)', () => {
            const cleanups = [];
            rows.forEach((row, i) => {
                const head = $('.svc__name', row), body = $('.svc__body', row);
                const id = `svc-body-${i}`;
                body.id = id;
                head.setAttribute('role', 'button');
                head.setAttribute('tabindex', '0');
                head.setAttribute('aria-expanded', 'false');
                head.setAttribute('aria-controls', id);
                const toggle = () => {
                    const open = !row.classList.contains('is-open');
                    rows.forEach((r) => {
                        if (r !== row && r.classList.contains('is-open')) {
                            r.classList.remove('is-open');
                            $('.svc__name', r).setAttribute('aria-expanded', 'false');
                            gsap.to($('.svc__body', r), { height: 0, duration: 0.6, ease: 'expo.out' });
                        }
                    });
                    row.classList.toggle('is-open', open);
                    head.setAttribute('aria-expanded', String(open));
                    gsap.to(body, { height: open ? 'auto' : 0, duration: 0.7, ease: 'expo.out', onComplete: () => window.ScrollTrigger.refresh() });
                };
                const key = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } };
                head.addEventListener('click', toggle);
                head.addEventListener('keydown', key);
                cleanups.push(() => {
                    head.removeEventListener('click', toggle);
                    head.removeEventListener('keydown', key);
                    ['role', 'tabindex', 'aria-expanded', 'aria-controls'].forEach((a) => head.removeAttribute(a));
                    row.classList.remove('is-open');
                    gsap.set(body, { clearProps: 'height' });
                });
            });
            return () => cleanups.forEach((fn) => fn());
        });
    }

    /* 13 GALERÍA (pan horizontal anclado) ------------------------------------ */
    function setupGallery() {
        const { gsap } = window;
        const pin = $('.gallery__pin'), track = $('#gallery-track');
        if (!pin || !track) return;
        const mm = gsap.matchMedia();
        mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
            const dist = () => Math.max(0, track.scrollWidth - window.innerWidth);
            const pan = gsap.to(track, {
                x: () => -dist(), ease: 'none',
                scrollTrigger: { trigger: pin, start: 'top top', end: () => `+=${dist()}`, pin: true, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1 }
            });
            // Parallax interno de cada medio mientras la cinta se desplaza
            $$('.gcard video, .gcard img', track).forEach((m) => {
                gsap.fromTo(m, { x: -26, scale: 1.14 }, {
                    x: 26, scale: 1.14, ease: 'none',
                    scrollTrigger: { trigger: m.parentElement, containerAnimation: pan, start: 'left right', end: 'right left', scrub: true }
                });
            });
            return () => gsap.set($$('.gcard video, .gcard img', track), { clearProps: 'all' });
        });
    }

    /* 14 ANTES / DESPUÉS ----------------------------------------------------- */
    function setupCompare() {
        const { gsap, ScrollTrigger } = window;
        const ba = $('#ba');
        if (!ba) return;
        const range = $('.ba__range', ba);
        const apply = (v) => { ba.style.setProperty('--pos', `${v}%`); range.value = v; };
        let touched = false, hint = null;
        range.addEventListener('input', () => { touched = true; if (hint) hint.kill(); ba.style.setProperty('--pos', `${range.value}%`); });
        range.addEventListener('pointerdown', () => { touched = true; if (hint) hint.kill(); });
        if (reduce) return;
        ScrollTrigger.create({
            trigger: ba, start: 'top 72%', once: true,
            onEnter: () => {
                if (touched) return;
                const o = { v: 50 };
                const step = { onUpdate: () => apply(o.v.toFixed(1)) };
                hint = gsap.timeline()
                    .to(o, { v: 16, duration: 1, ease: 'power2.inOut', ...step })
                    .to(o, { v: 84, duration: 1.4, ease: 'power2.inOut', ...step })
                    .to(o, { v: 50, duration: 0.9, ease: 'power3.out', ...step });
            }
        });
    }

    /* 15 ESTUDIO Y RITUAL ---------------------------------------------------- */
    function setupTiles() {
        $$('.tile').forEach((t) => {
            t.addEventListener('pointermove', (e) => {
                const r = t.getBoundingClientRect();
                t.style.setProperty('--mx', `${e.clientX - r.left}px`);
                t.style.setProperty('--my', `${e.clientY - r.top}px`);
            });
        });
    }

    function setupStack() {
        const { gsap } = window;
        if (reduce) return;
        const cards = $$('.scard');
        const hdr = headerH();
        cards.forEach((card, i) => {
            if (i === cards.length - 1) return;
            const next = cards[i + 1];
            const stickyTop = hdr + 10 + (i + 1) * 16;
            gsap.to(card, {
                scale: 0.94, '--dim': 0.6, ease: 'none',
                scrollTrigger: { trigger: next, start: 'top bottom', end: `top ${stickyTop}px`, scrub: true }
            });
        });
    }

    /* 16 FORMULARIO → WHATSAPP ---------------------------------------------- */
    function setupForm() {
        const form = $('#booking-form');
        if (!form) return;
        const status = $('#form-status');
        const nameEl = $('#f-name'), serviceEl = $('#f-service');

        const setError = (input, errId, msg) => {
            const err = $(`#${errId}`);
            err.textContent = msg;
            input.closest('.field').classList.toggle('is-invalid', Boolean(msg));
            input.setAttribute('aria-invalid', msg ? 'true' : 'false');
            if (msg) input.setAttribute('aria-describedby', errId); else input.removeAttribute('aria-describedby');
        };
        nameEl.addEventListener('input', () => setError(nameEl, 'e-name', ''));
        serviceEl.addEventListener('change', () => setError(serviceEl, 'e-service', ''));

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const nombre = nameEl.value.trim();
            const servicio = serviceEl.value;
            let bad = null;
            if (nombre.length < 2) { setError(nameEl, 'e-name', 'Escribe tu nombre para saber a quién atender.'); bad = bad || nameEl; }
            if (!servicio) { setError(serviceEl, 'e-service', 'Elige el servicio que te interesa.'); bad = bad || serviceEl; }
            if (bad) {
                status.classList.remove('is-ok');
                status.textContent = 'Revisa los campos marcados para continuar.';
                bad.focus();
                return;
            }
            const dia = (form.querySelector('input[name="dia"]:checked') || {}).value;
            const turno = (form.querySelector('input[name="turno"]:checked') || {}).value;
            const nota = $('#f-note').value.trim();
            const parts = [`Hola Catrin Barbershop, soy ${nombre}.`, `Quiero agendar: ${servicio}.`];
            if (dia) parts.push(`Día: ${dia}.`);
            if (turno) parts.push(`Horario: ${turno}.`);
            if (nota) parts.push(`Nota: ${nota}`);
            const link = document.createElement('a');
            link.href = waURL(parts.join(' '));
            link.target = '_blank';
            link.rel = 'noopener';
            document.body.appendChild(link);
            link.click();
            link.remove();
            status.classList.add('is-ok');
            status.textContent = 'Listo. Abrimos WhatsApp con tu mensaje, solo falta enviarlo.';
            if (window.dataLayer) window.dataLayer.push({ event: 'booking_submit', service: servicio });
        });
    }

    /** En móvil los botones flotantes tapan el envío del formulario: se esconden mientras el formulario está a la vista. */
    function setupFloatAway() {
        const form = $('#booking-form'), fabs = $$('.wa-float, .sound');
        if (!form || !fabs.length) return;
        const narrow = window.matchMedia('(max-width: 899.98px)');
        new IntersectionObserver((en) => {
            fabs.forEach((fab) => fab.classList.toggle('is-away', en[0].isIntersecting && narrow.matches));
        }, { threshold: 0.12 }).observe(form);
    }

    /* 16b SONIDO DE FONDO ---------------------------------------------------- */
    /** Los navegadores no permiten audio sin un gesto del usuario: la música arranca con el botón "Sonido" y acompaña a todos los videos. */
    function setupSound() {
        const btn = $('#sound-toggle'), audio = $('#bg-audio');
        if (!btn || !audio) return;
        const VOL = 0.4;
        let on = false, timer = 0;
        const ramp = (to, ms, done) => {
            clearInterval(timer);
            const from = audio.volume, t0 = performance.now();
            timer = setInterval(() => {
                const k = Math.min(1, (performance.now() - t0) / ms);
                audio.volume = from + (to - from) * k;
                if (k >= 1) { clearInterval(timer); if (done) done(); }
            }, 30);
        };
        const paint = () => {
            btn.setAttribute('aria-pressed', String(on));
            btn.setAttribute('aria-label', on ? 'Silenciar música de fondo' : 'Activar música de fondo');
        };
        btn.addEventListener('click', () => {
            if (!on) {
                on = true; paint(); audio.volume = 0;
                const p = audio.play();
                if (p && p.then) p.then(() => ramp(VOL, 900)).catch(() => { on = false; paint(); });
                else ramp(VOL, 900);
            } else {
                on = false; paint();
                ramp(0, 500, () => audio.pause());
            }
        });
        // Con la pestaña en segundo plano la música se pausa, y vuelve si seguía activada
        document.addEventListener('visibilitychange', () => {
            if (!on) return;
            if (document.hidden) audio.pause();
            else { const p = audio.play(); if (p && p.catch) p.catch(() => {}); }
        });
    }

    /* 17 VIDEOS (carga y reproducción por visibilidad) ----------------------- */
    function setupVideos() {
        const vids = $$('video[data-src]');
        if (!vids.length) return;
        if (reduce) return; // se queda el póster
        const io = new IntersectionObserver((entries) => {
            entries.forEach((en) => {
                const v = en.target;
                if (en.isIntersecting) {
                    if (!v.dataset.loaded) { v.src = v.dataset.src; v.dataset.loaded = '1'; }
                    const p = v.play();
                    if (p && p.catch) p.catch(() => {});
                } else {
                    v.pause();
                }
            });
        }, { threshold: 0.25, rootMargin: '0px 12% 0px 12%' });
        vids.forEach((v) => io.observe(v));
    }

    /* 18 ARRANQUE ------------------------------------------------------------ */
    function build() {
        const { ScrollTrigger } = window;
        prepareHero();
        skull = createSkull();
        setupHeader();
        setupMarquee();
        setupManifesto();
        setupFachada();
        setupReveals();
        setupServices();
        setupGallery();
        setupCompare();
        setupTiles();
        setupStack();
        setupMagnetic();
        setupVideos();
        setupForm();
        setupFloatAway();
        root.classList.remove('is-loading');
        ScrollTrigger.refresh();
    }

    function boot() {
        setupLinks();
        setupSound();
        const hasLibs = window.gsap && window.ScrollTrigger && window.SplitText;
        if (!hasLibs) {
            // Degradación: sitio completo y legible, sin animaciones
            const l = $('#loader'); if (l) l.remove();
            root.classList.remove('is-loading');
            root.classList.add('no-motion');
            setupForm();
            return;
        }
        window.gsap.registerPlugin(window.ScrollTrigger, window.SplitText);
        window.ScrollTrigger.config({ ignoreMobileResize: true });
        setupLenis();
        setupAnchors();

        runLoader(build).then(() => {
            if (lenis) lenis.start();
            introHero();
        });
    }

    /* DATOS: máscara de la calavera del logotipo (PNG 8 bits embebido; evita bloqueo de canvas en file://) */
    const SKULL_MASK = 'data:image/png;base64,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';

    boot();
})();
