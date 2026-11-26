(function () {
    var root = document.querySelector(".hero-visual");
    if (!root) return;
    var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
    if (slides.length < 2) return;

    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var index = 0;
    var timer = null;
    var fadeMs = 1500;
    var intervalMs = 5600;
    var scaleFrom = 1.035;

    function beginScale(slide) {
        slide.style.transition = "none";
        slide.style.opacity = "1";
        slide.style.transform = "scale(" + scaleFrom + ")";
        slide.removeAttribute("aria-hidden");
        void slide.offsetWidth;
        slide.style.transition = "transform " + intervalMs + "ms linear";
        slide.style.transform = "scale(1)";
    }

    function show(next) {
        var current = slides[index];
        var incoming = slides[next];
        slides.forEach(function (slide) { slide.style.zIndex = "0"; });
        incoming.style.zIndex = "1";
        current.style.zIndex = "2";
        beginScale(incoming);
        current.style.transition = "opacity " + fadeMs + "ms ease";
        current.style.opacity = "0";
        current.setAttribute("aria-hidden", "true");
        index = next;
    }

    if (!reduced) {
        beginScale(slides[0]);
        slides[0].style.zIndex = "1";
    }

    function start() {
        if (timer || reduced) return;
        timer = setInterval(function () {
            show((index + 1) % slides.length);
        }, intervalMs);
    }
    function stop() {
        if (!timer) return;
        clearInterval(timer);
        timer = null;
    }

    document.addEventListener("visibilitychange", function () {
        if (document.hidden) stop();
        else start();
    });

    start();
})();

(function () {
    var header = document.querySelector("header");
    var hero = document.querySelector(".hero-visual");
    if (!header || !hero) return;

    function update() {
        var headerHeight = header.offsetHeight;
        var heroBottom = hero.getBoundingClientRect().bottom;
        header.classList.toggle("is-over-hero", heroBottom > headerHeight);
    }

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
})();

(function () {
    var root = document.querySelector(".modelhouse-section");
    if (!root) return;
    var viewport = root.querySelector(".modelhouse-slider");
    var track = root.querySelector(".modelhouse-slider-track");
    var countEl = root.querySelector(".modelhouse-count .current");
    var prevBtn = root.querySelector(".slider-arrows .arrow-btn:first-child");
    var nextBtn = root.querySelector(".slider-arrows .arrow-btn:last-child");
    var originals = Array.prototype.slice.call(track.children);
    var total = originals.length;
    if (!total) return;

    var before = document.createDocumentFragment();
    var after = document.createDocumentFragment();
    originals.forEach(function (card, i) {
        var cloneBefore = card.cloneNode(true);
        var cloneAfter = card.cloneNode(true);
        cloneBefore.setAttribute("aria-hidden", "true");
        cloneAfter.setAttribute("aria-hidden", "true");
        before.appendChild(cloneBefore);
        after.appendChild(cloneAfter);
        card.dataset.slide = String(i + 1);
    });
    track.insertBefore(before, track.firstChild);
    track.appendChild(after);

    var index = total;
    var timer = null;
    var snapTimer = null;
    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var interval = 4000;

    function stepSize() {
        var card = track.children[0];
        var gap = parseFloat(getComputedStyle(track).gap) || 0;
        return card.getBoundingClientRect().width + gap;
    }

    function normalize(value) {
        var current = ((value % total) + total) % total;
        return total + current;
    }

    function setPosition(animate) {
        var card = track.children[0];
        var viewW = viewport.getBoundingClientRect().width;
        var cardW = card.getBoundingClientRect().width;
        var x = (viewW - cardW) / 2 - index * stepSize();
        track.style.transition = animate ? "transform 0.7s cubic-bezier(0.25, 1, 0.5, 1)" : "none";
        track.style.transform = "translate3d(" + x + "px, 0, 0)";
        countEl.textContent = String(((index % total) + total) % total + 1);
    }

    function snapBack() {
        var settled = normalize(index);
        if (settled === index) return;
        index = settled;
        track.style.transition = "none";
        setPosition(false);
        void track.offsetWidth;
    }

    function go(delta) {
        index += delta;
        if (reduced) {
            index = normalize(index);
            setPosition(false);
            return;
        }
        setPosition(true);
        clearTimeout(snapTimer);
        snapTimer = setTimeout(snapBack, 750);
    }

    track.addEventListener("transitionend", function (e) {
        if (e.target !== track || e.propertyName !== "transform") return;
        clearTimeout(snapTimer);
        snapBack();
    });

    function start() {
        stop();
        if (reduced) return;
        timer = setInterval(function () { go(1); }, interval);
    }
    function stop() {
        if (timer) clearInterval(timer);
        timer = null;
    }

    prevBtn.addEventListener("click", function () {
        go(-1);
        start();
    });
    nextBtn.addEventListener("click", function () {
        go(1);
        start();
    });
    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    window.addEventListener("resize", function () {
        setPosition(false);
    });
    document.addEventListener("visibilitychange", function () {
        if (document.hidden) stop();
        else start();
    });

    setPosition(false);
    start();
})();
