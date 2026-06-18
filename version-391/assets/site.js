(function () {
  function selectAll(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function setupMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var root = document.querySelector('[data-hero]');
    if (!root) {
      return;
    }
    var slides = selectAll('[data-hero-slide]', root);
    var dots = selectAll('[data-hero-dot]', root);
    var prev = root.querySelector('[data-hero-prev]');
    var next = root.querySelector('[data-hero-next]');
    var index = 0;
    var timer;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });
    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }
    restart();
  }

  function setupFilters() {
    var panels = selectAll('.filter-panel');
    panels.forEach(function (panel) {
      var input = panel.querySelector('[data-search-input]');
      var region = panel.querySelector('[data-region-filter]');
      var type = panel.querySelector('[data-type-filter]');
      var grid = panel.nextElementSibling ? panel.nextElementSibling.querySelector('.searchable-grid') : null;
      if (!grid) {
        grid = document.querySelector('.searchable-grid');
      }
      if (!grid) {
        return;
      }
      var cards = selectAll('[data-card]', grid);

      function apply() {
        var query = input ? input.value.trim().toLowerCase() : '';
        var regionValue = region ? region.value : '';
        var typeValue = type ? type.value : '';
        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute('data-title') || '',
            card.getAttribute('data-region') || '',
            card.getAttribute('data-type') || '',
            card.getAttribute('data-year') || '',
            card.getAttribute('data-genre') || '',
            card.getAttribute('data-tags') || ''
          ].join(' ').toLowerCase();
          var regionOk = !regionValue || card.getAttribute('data-region') === regionValue;
          var typeOk = !typeValue || card.getAttribute('data-type') === typeValue;
          var queryOk = !query || haystack.indexOf(query) !== -1;
          card.classList.toggle('is-filtered-out', !(regionOk && typeOk && queryOk));
        });
      }

      if (input) {
        input.addEventListener('input', apply);
      }
      if (region) {
        region.addEventListener('change', apply);
      }
      if (type) {
        type.addEventListener('change', apply);
      }

      var params = new URLSearchParams(window.location.search);
      var q = params.get('q');
      if (q && input) {
        input.value = q;
        apply();
      }
    });
  }

  window.initMoviePlayer = function (videoId, coverId, streamUrl) {
    var video = document.getElementById(videoId);
    var cover = document.getElementById(coverId);
    if (!video || !cover || !streamUrl) {
      return;
    }
    var hls;
    var started = false;

    function start() {
      if (started) {
        video.play().catch(function () {});
        return;
      }
      started = true;
      cover.classList.add('is-hidden');
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
        video.play().catch(function () {});
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal && hls) {
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
            } else {
              hls.destroy();
            }
          }
        });
        return;
      }
      video.src = streamUrl;
      video.play().catch(function () {});
    }

    cover.addEventListener('click', start);
    video.addEventListener('click', function () {
      if (!started) {
        start();
      }
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupFilters();
  });
})();
