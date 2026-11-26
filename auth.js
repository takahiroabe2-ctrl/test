(function () {
  var PASSWORD = "livearc";
  var STORAGE_KEY = "livearc_wf_auth";

  if (sessionStorage.getItem(STORAGE_KEY) === "1") {
    return;
  }

  document.documentElement.style.visibility = "hidden";

  function unlock() {
    sessionStorage.setItem(STORAGE_KEY, "1");
    var gate = document.getElementById("site-auth-gate");
    if (gate) gate.remove();
    document.documentElement.style.visibility = "";
  }

  function showGate() {
    document.documentElement.style.visibility = "";

    var style = document.createElement("style");
    style.textContent = [
      "#site-auth-gate{position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;",
      "background:#f5f5f3;font-family:'Roboto',-apple-system,BlinkMacSystemFont,'Segoe UI','Helvetica Neue',Arial,'Noto Sans JP',sans-serif;}",
      "#site-auth-gate .box{width:min(92vw,360px);padding:2.5rem 2rem;background:#fff;border:1px solid #dcdcdc;}",
      "#site-auth-gate h1{font-size:1rem;letter-spacing:0.12em;margin:0 0 0.5rem;font-weight:600;}",
      "#site-auth-gate p{font-size:0.8rem;color:#777;margin:0 0 1.5rem;line-height:1.7;}",
      "#site-auth-gate input{width:100%;padding:0.75rem 0.9rem;border:1px solid #dcdcdc;font-size:1rem;margin-bottom:0.75rem;}",
      "#site-auth-gate button{width:100%;padding:0.8rem;border:1px solid #111;background:#111;color:#fff;font-size:0.85rem;letter-spacing:0.08em;cursor:pointer;}",
      "#site-auth-gate button:hover{opacity:0.85;}",
      "#site-auth-gate .error{color:#b00020;font-size:0.75rem;min-height:1.2em;margin:0 0 0.5rem;}"
    ].join("");
    document.head.appendChild(style);

    var gate = document.createElement("div");
    gate.id = "site-auth-gate";
    gate.innerHTML =
      '<div class="box">' +
      "<p>閲覧用パスワードを入力してください。</p>" +
      '<p class="error" id="site-auth-error"></p>' +
      '<input type="password" id="site-auth-input" autocomplete="current-password" placeholder="Password">' +
      '<button type="button" id="site-auth-submit">入 る</button>' +
      "</div>";
    document.body.appendChild(gate);

    var input = document.getElementById("site-auth-input");
    var error = document.getElementById("site-auth-error");
    var submit = document.getElementById("site-auth-submit");

    function tryUnlock() {
      if (input.value === PASSWORD) {
        unlock();
      } else {
        error.textContent = "パスワードが正しくありません。";
        input.value = "";
        input.focus();
      }
    }

    submit.addEventListener("click", tryUnlock);
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") tryUnlock();
    });
    input.focus();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", showGate);
  } else {
    showGate();
  }
})();

(function () {
  function setupNav() {
    var header = document.querySelector("header");
    var toggle = document.querySelector(".nav-toggle");
    if (!header || !toggle) return;

    function setOpen(open) {
      header.classList.toggle("nav-open", open);
      if (open) header.classList.remove("is-nav-hidden");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "メニューを閉じる" : "メニュー");
    }

    toggle.addEventListener("click", function () {
      setOpen(!header.classList.contains("nav-open"));
    });

    header.querySelectorAll("nav a, .nav-panel a").forEach(function (link) {
      link.addEventListener("click", function () {
        window.setTimeout(function () {
          setOpen(false);
        }, 0);
      });
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setOpen(false);
    });

    document.addEventListener("click", function (e) {
      if (!header.contains(e.target)) setOpen(false);
    });

    var desktopNav = window.matchMedia("(min-width: 1081px)");
    function closeOnDesktop() {
      if (desktopNav.matches) setOpen(false);
    }
    if (desktopNav.addEventListener) {
      desktopNav.addEventListener("change", closeOnDesktop);
    } else if (desktopNav.addListener) {
      desktopNav.addListener(closeOnDesktop);
    }

    var lastY = window.pageYOffset || 0;
    var downDistance = 0;
    var upDistance = 0;

    window.addEventListener("scroll", function () {
      var y = window.pageYOffset || 0;
      if (y < 0) y = 0;
      var delta = y - lastY;
      lastY = y;

      if (header.classList.contains("nav-open") || y <= 0) {
        downDistance = 0;
        upDistance = 0;
        header.classList.remove("is-nav-hidden");
        return;
      }

      if (delta > 0) {
        downDistance += delta;
        upDistance = 0;
        if (downDistance > 8) header.classList.add("is-nav-hidden");
      } else if (delta < 0) {
        upDistance += -delta;
        downDistance = 0;
        if (upDistance > 8) header.classList.remove("is-nav-hidden");
      }
    }, { passive: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupNav);
  } else {
    setupNav();
  }
})();
