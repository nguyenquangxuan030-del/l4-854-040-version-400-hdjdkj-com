(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function text(value) {
    return String(value || '').toLowerCase();
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function initNav() {
    var toggle = $('[data-nav-toggle]');
    var links = $('[data-nav-links]');
    if (!toggle || !links) {
      return;
    }

    toggle.addEventListener('click', function () {
      links.classList.toggle('is-open');
    });
  }

  function initHero() {
    var hero = $('[data-hero]');
    if (!hero) {
      return;
    }

    var slides = $all('[data-hero-slide]', hero);
    var dots = $all('[data-hero-dot]', hero);
    var current = 0;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        show(current + 1);
      }, 5600);
    }
  }

  function initFilters() {
    $all('[data-filter-scope]').forEach(function (scope) {
      var input = $('[data-filter-input]', scope);
      var buttons = $all('[data-filter-value]', scope);
      var cards = $all('[data-movie-card]', scope);
      var activeValue = 'all';

      function matchesChip(card, value) {
        if (value === 'all') {
          return true;
        }
        if (value === '日韩') {
          return /日韩|日本|韩国/.test(card.dataset.region || '') || /日韩|日本|韩国/.test(card.dataset.search || '');
        }
        if (/^\d{4}$/.test(value)) {
          return card.dataset.year === value;
        }
        return (card.dataset.type || '').indexOf(value) !== -1 || (card.dataset.search || '').indexOf(value) !== -1;
      }

      function apply() {
        var query = text(input ? input.value : '');
        cards.forEach(function (card) {
          var haystack = text(card.dataset.search || card.textContent);
          var matched = haystack.indexOf(query) !== -1 && matchesChip(card, activeValue);
          card.classList.toggle('is-filtered-out', !matched);
        });
      }

      if (input) {
        input.addEventListener('input', apply);
      }

      buttons.forEach(function (button) {
        button.addEventListener('click', function () {
          activeValue = button.dataset.filterValue || 'all';
          buttons.forEach(function (item) {
            item.classList.toggle('is-active', item === button);
          });
          apply();
        });
      });
    });
  }

  function initGlobalSearch() {
    var input = $('[data-global-search]');
    var results = $('[data-global-results]');
    if (!input || !results || !window.SEARCH_MOVIES) {
      return;
    }

    function render() {
      var query = text(input.value).trim();
      if (!query) {
        results.hidden = true;
        results.innerHTML = '';
        return;
      }

      var matches = window.SEARCH_MOVIES.filter(function (movie) {
        return text(movie.title + ' ' + movie.region + ' ' + movie.genre + ' ' + movie.year + ' ' + movie.tags).indexOf(query) !== -1;
      }).slice(0, 12);

      if (!matches.length) {
        results.hidden = false;
        results.innerHTML = '<h3>搜索结果</h3><p>没有找到匹配影片。</p>';
        return;
      }

      results.hidden = false;
      results.innerHTML = '<h3>搜索结果</h3><div class="global-result-list">' + matches.map(function (movie) {
        return '<a class="global-result" href="' + escapeHtml(movie.url) + '">' +
          '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '">' +
          '<span><strong>' + escapeHtml(movie.title) + '</strong>' +
          '<span>' + escapeHtml(movie.year + ' · ' + movie.region + ' · ' + movie.genre) + '</span></span></a>';
      }).join('') + '</div>';
    }

    input.addEventListener('input', render);
  }

  function initPlayers() {
    $all('[data-player]').forEach(function (shell) {
      var video = $('video', shell);
      var cover = $('[data-play-button]', shell);
      var stream = shell.getAttribute('data-stream');
      var hls = null;
      var started = false;

      if (!video || !cover || !stream) {
        return;
      }

      function startPlayback() {
        cover.classList.add('is-hidden');

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          if (!video.src) {
            video.src = stream;
          }
          video.play().catch(function () {});
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          if (!hls) {
            hls = new window.Hls();
            hls.loadSource(stream);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
              video.play().catch(function () {});
            });
          } else {
            video.play().catch(function () {});
          }
          return;
        }

        if (!video.src) {
          video.src = stream;
        }
        video.play().catch(function () {});
      }

      function begin() {
        if (!started) {
          started = true;
          startPlayback();
        } else {
          cover.classList.add('is-hidden');
          video.play().catch(function () {});
        }
      }

      cover.addEventListener('click', begin);
      video.addEventListener('click', function () {
        if (!started) {
          begin();
        }
      });
      video.addEventListener('play', function () {
        cover.classList.add('is-hidden');
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initNav();
    initHero();
    initFilters();
    initGlobalSearch();
    initPlayers();
  });
})();
