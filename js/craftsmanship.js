(function () {
    var nav = document.querySelector(".anchor-nav");
    if (!nav) return;

    var links = Array.prototype.slice.call(nav.querySelectorAll(".anchor-list a[href^='#']"));
    var sections = links.map(function (link) {
        return document.getElementById(link.getAttribute("href").slice(1));
    });

    function update() {
        var line = nav.getBoundingClientRect().bottom + 1;
        var current = -1;
        for (var i = 0; i < sections.length; i++) {
            var section = sections[i];
            if (!section) continue;
            var rect = section.getBoundingClientRect();
            if (rect.top <= line && rect.bottom > line) current = i;
        }
        for (var j = 0; j < links.length; j++) {
            var on = j === current;
            links[j].classList.toggle("is-active", on);
            if (on) links[j].setAttribute("aria-current", "true");
            else links[j].removeAttribute("aria-current");
        }
    }

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    window.addEventListener("hashchange", update);
    nav.addEventListener("transitionend", update);
    update();

    var frame = 0;
    var interrupted = false;

    function interruptScroll() {
        interrupted = true;
    }
    window.addEventListener("wheel", interruptScroll, { passive: true });
    window.addEventListener("touchmove", interruptScroll, { passive: true });
    window.addEventListener("keydown", function (e) {
        if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "PageDown" || e.key === "PageUp" || e.key === "Home" || e.key === "End" || e.key === " ") {
            interruptScroll();
        }
    });

    function scrollToSection(target) {
        var header = document.querySelector("header");
        var start = window.pageYOffset || document.documentElement.scrollTop || 0;
        var targetTop = target.getBoundingClientRect().top + start;
        var goingDown = targetTop > start + 1;
        var headerH = header ? header.offsetHeight : 0;
        var offset = nav.offsetHeight + (goingDown ? 0 : headerH);
        var maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
        var destination = Math.max(0, Math.min(targetTop - offset, maxScroll));
        var distance = destination - start;
        if (Math.abs(distance) < 2) return;

        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            window.scrollTo(0, destination);
            return;
        }

        var duration = Math.min(1400, Math.max(700, Math.abs(distance) * 0.65));
        var startTime = null;
        interrupted = false;
        cancelAnimationFrame(frame);

        function ease(t) {
            return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        }

        function step(now) {
            if (interrupted) return;
            if (!startTime) startTime = now;
            var t = Math.min(1, (now - startTime) / duration);
            window.scrollTo(0, start + distance * ease(t));
            if (t < 1) frame = requestAnimationFrame(step);
        }
        frame = requestAnimationFrame(step);
    }

    nav.addEventListener("click", function (e) {
        var link = e.target.closest("a[href^='#']");
        if (!link || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        var target = document.getElementById(link.getAttribute("href").slice(1));
        if (!target) return;
        e.preventDefault();
        scrollToSection(target);
        if (history.pushState) history.pushState(null, "", link.getAttribute("href"));
    });
})();
