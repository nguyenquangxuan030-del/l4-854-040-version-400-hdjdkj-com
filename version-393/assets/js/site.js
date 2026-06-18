(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function normalize(text) {
    return String(text || "").toLowerCase().replace(/\s+/g, " ").trim();
  }

  function initMobileMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function initFilters() {
    document.querySelectorAll("[data-filter-root]").forEach(function (root) {
      var input = root.querySelector(".js-search-input");
      var year = root.querySelector(".js-year-filter");
      var region = root.querySelector(".js-region-filter");
      var type = root.querySelector(".js-type-filter");
      var items = Array.prototype.slice.call(root.querySelectorAll(".movie-card, .ranking-row"));
      var empty = root.querySelector(".filter-empty");

      function apply() {
        var keyword = normalize(input ? input.value : "");
        var yearValue = year ? year.value : "";
        var regionValue = region ? region.value : "";
        var typeValue = type ? type.value : "";
        var visible = 0;

        items.forEach(function (item) {
          var haystack = normalize([
            item.getAttribute("data-title"),
            item.getAttribute("data-region"),
            item.getAttribute("data-type"),
            item.getAttribute("data-tags"),
            item.getAttribute("data-summary")
          ].join(" "));
          var ok = true;
          if (keyword && haystack.indexOf(keyword) === -1) {
            ok = false;
          }
          if (yearValue && item.getAttribute("data-year") !== yearValue) {
            ok = false;
          }
          if (regionValue && item.getAttribute("data-region") !== regionValue) {
            ok = false;
          }
          if (typeValue && item.getAttribute("data-type") !== typeValue) {
            ok = false;
          }
          item.classList.toggle("is-hidden", !ok);
          if (ok) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      [input, year, region, type].forEach(function (control) {
        if (!control) {
          return;
        }
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      });
    });
  }

  function initPlayers() {
    document.querySelectorAll(".player-shell").forEach(function (shell) {
      var video = shell.querySelector("video");
      var cover = shell.querySelector(".player-cover");
      var address = shell.getAttribute("data-video");
      var started = false;
      var hlsInstance = null;

      function begin() {
        if (!video || !address) {
          return;
        }
        if (cover) {
          cover.classList.add("is-hidden");
        }
        video.setAttribute("controls", "controls");

        if (started) {
          video.play().catch(function () {});
          return;
        }

        started = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = address;
          video.load();
          video.play().catch(function () {});
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls();
          hlsInstance.loadSource(address);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
          return;
        }

        video.src = address;
        video.load();
        video.play().catch(function () {});
      }

      if (cover) {
        cover.addEventListener("click", begin);
      }

      if (video) {
        video.addEventListener("click", function () {
          if (!started) {
            begin();
          }
        });
      }
    });
  }

  ready(function () {
    initMobileMenu();
    initFilters();
    initPlayers();
  });
})();
