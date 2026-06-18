(function() {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function() {
    var toggle = document.querySelector("[data-nav-toggle]");
    if (toggle) {
      toggle.addEventListener("click", function() {
        document.body.classList.toggle("nav-open");
      });
    }

    var carousel = document.querySelector("[data-hero-carousel]");
    if (carousel) {
      var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
      var previous = carousel.querySelector("[data-hero-prev]");
      var next = carousel.querySelector("[data-hero-next]");
      var current = 0;
      var timer = null;

      function show(index) {
        if (!slides.length) {
          return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function(slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === current);
        });
        dots.forEach(function(dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === current);
        });
      }

      function start() {
        stop();
        timer = window.setInterval(function() {
          show(current + 1);
        }, 5600);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      }

      if (previous) {
        previous.addEventListener("click", function() {
          show(current - 1);
          start();
        });
      }

      if (next) {
        next.addEventListener("click", function() {
          show(current + 1);
          start();
        });
      }

      dots.forEach(function(dot, dotIndex) {
        dot.addEventListener("click", function() {
          show(dotIndex);
          start();
        });
      });

      carousel.addEventListener("mouseenter", stop);
      carousel.addEventListener("mouseleave", start);
      show(0);
      start();
    }

    var filterPanel = document.querySelector("[data-filter-panel]");
    if (filterPanel) {
      var searchInput = filterPanel.querySelector("[data-filter-search]");
      var yearSelect = filterPanel.querySelector("[data-filter-year]");
      var typeSelect = filterPanel.querySelector("[data-filter-type]");
      var grid = document.querySelector("[data-filter-grid]");
      var cards = grid ? Array.prototype.slice.call(grid.querySelectorAll(".movie-card")) : [];
      var params = new URLSearchParams(window.location.search);
      var query = params.get("q");

      if (query && searchInput) {
        searchInput.value = query;
      }

      function normalize(value) {
        return String(value || "").trim().toLowerCase();
      }

      function runFilter() {
        var q = normalize(searchInput ? searchInput.value : "");
        var year = yearSelect ? yearSelect.value : "";
        var type = typeSelect ? typeSelect.value : "";
        var visible = 0;

        cards.forEach(function(card) {
          var haystack = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-year"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-tags"),
            card.getAttribute("data-category")
          ].join(" "));
          var ok = true;

          if (q && haystack.indexOf(q) === -1) {
            ok = false;
          }

          if (year && card.getAttribute("data-year") !== year) {
            ok = false;
          }

          if (type && card.getAttribute("data-type") !== type) {
            ok = false;
          }

          card.style.display = ok ? "" : "none";
          if (ok) {
            visible += 1;
          }
        });

        if (grid) {
          grid.classList.toggle("has-no-results", visible === 0);
        }
      }

      [searchInput, yearSelect, typeSelect].forEach(function(control) {
        if (control) {
          control.addEventListener("input", runFilter);
          control.addEventListener("change", runFilter);
        }
      });

      runFilter();
    }
  });
})();
