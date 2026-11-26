document.documentElement.classList.add("js");

(function () {
    function setupReveal() {
        var openingCount = parseInt(document.documentElement.getAttribute("data-reveal-opening") || "0", 10);
        if (isNaN(openingCount) || openingCount < 0) openingCount = 0;

        var targets = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
        if (!targets.length) return;

        var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (reduced || !("IntersectionObserver" in window)) {
            targets.forEach(function (el) { el.classList.add("is-visible"); });
            return;
        }

        if (openingCount > 0) {
            var opening = targets.splice(0, openingCount);
            requestAnimationFrame(function () {
                requestAnimationFrame(function () {
                    opening.forEach(function (el) { el.classList.add("is-visible"); });
                });
            });
        }

        var observer = null;

        function triggerOffset() {
            var offset = window.innerWidth > 1024 ? 500 : 150;
            var limit = Math.max(80, window.innerHeight - 80);
            return Math.min(offset, limit);
        }

        function observe() {
            if (observer) observer.disconnect();
            observer = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (!entry.isIntersecting) return;
                    entry.target.classList.add("is-visible");
                    observer.unobserve(entry.target);
                });
            }, {
                root: null,
                rootMargin: "0px 0px -" + triggerOffset() + "px 0px",
                threshold: 0
            });
            targets.forEach(function (el) {
                if (!el.classList.contains("is-visible")) observer.observe(el);
            });
        }

        observe();
        window.addEventListener("resize", observe);
    }

    function hashString(str) {
        var h = 2166136261;
        for (var i = 0; i < str.length; i++) {
            h ^= str.charCodeAt(i);
            h = Math.imul(h, 16777619);
        }
        return h >>> 0;
    }

    function mulberry32(seed) {
        var a = seed >>> 0;
        return function () {
            a = (a + 0x6D2B79F5) | 0;
            var t = Math.imul(a ^ (a >>> 15), 1 | a);
            t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }

    function setupRelatedWorks() {
        var grid = document.querySelector(".related-works-grid");
        if (!grid) return;

        var works = [
            { href: "work-detail-01.html", thumb: "images/works/works-top_img01.jpg", title: "光の抜けと中庭を愉しむ平屋の住まい", meta: "山形市 / 注文住宅" },
            { href: "work-detail-02.html", thumb: "images/works/works-top_img02.jpg", title: "素材の気配を感じる、無垢の木の家", meta: "天童市 / 提案型オーダー住宅" },
            { href: "work-detail-03.html", thumb: "images/works/works-top_img03.jpg", title: "街並みに溶け込むミニマルな佇まい", meta: "上山市 / 高水準規格住宅" },
            { href: "work-detail-04.html", thumb: "images/works/works-top_img04.jpg", title: "古き良きの構造を活かしたモダン邸宅", meta: "山形市 / リノベーション" },
            { href: "work-detail-05.html", thumb: "images/works/works-top_img05.jpg", title: "家族の気配がつながる、吹き抜けのある家", meta: "寒河江市 / 注文住宅" },
            { href: "work-detail-06.html", thumb: "images/works/works-top_img06.jpg", title: "庭と一体になる、軒の深い平屋", meta: "東根市 / 提案型オーダー住宅" }
        ];

        var current = (location.pathname.split("/").pop() || "").split("?")[0];
        var pool = works.filter(function (work) { return work.href !== current; });
        if (pool.length < 3) return;

        var rand = mulberry32(hashString(current || "works"));
        for (var i = pool.length - 1; i > 0; i--) {
            var j = Math.floor(rand() * (i + 1));
            var tmp = pool[i];
            pool[i] = pool[j];
            pool[j] = tmp;
        }
        var picked = pool.slice(0, 3);

        var existing = Array.prototype.map.call(grid.querySelectorAll("a.related-work-card"), function (card) {
            return card.getAttribute("href");
        });
        if (existing.join("|") === picked.map(function (work) { return work.href; }).join("|")) return;

        grid.textContent = "";
        picked.forEach(function (work) {
            var card = document.createElement("a");
            card.href = work.href;
            card.className = "related-work-card";

            var thumb = document.createElement("div");
            thumb.className = "related-work-thumb";
            var img = document.createElement("img");
            img.src = work.thumb;
            img.alt = "施工事例";
            thumb.appendChild(img);

            var info = document.createElement("div");
            info.className = "related-work-info";
            var title = document.createElement("h3");
            title.textContent = work.title;
            var meta = document.createElement("span");
            meta.textContent = work.meta;
            info.appendChild(title);
            info.appendChild(meta);

            card.appendChild(thumb);
            card.appendChild(info);
            grid.appendChild(card);
        });
    }

    function setupPage() {
        setupRelatedWorks();
        setupReveal();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", setupPage);
    } else {
        setupPage();
    }
})();
