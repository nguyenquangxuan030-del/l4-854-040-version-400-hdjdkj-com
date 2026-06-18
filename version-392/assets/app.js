(function () {
  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setupNavigation() {
    var button = document.querySelector('[data-nav-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      menu.classList.toggle('open');
    });
  }

  function setupHero() {
    var root = document.querySelector('[data-hero]');
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
    var thumbs = Array.prototype.slice.call(root.querySelectorAll('[data-hero-thumb]'));
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      thumbs.forEach(function (thumb, i) {
        thumb.classList.toggle('active', i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    thumbs.forEach(function (thumb) {
      thumb.addEventListener('click', function () {
        var next = Number(thumb.getAttribute('data-hero-thumb')) || 0;
        show(next);
        start();
      });
    });

    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll('[data-search-panel]'));
    panels.forEach(function (panel) {
      var form = panel.querySelector('.filter-form');
      var scope = panel.parentElement || document;
      var list = scope.querySelector('[data-filter-list]') || document;
      var cards = Array.prototype.slice.call(list.querySelectorAll('[data-title]'));
      var empty = scope.querySelector('[data-empty-state]');
      if (!form || !cards.length) {
        return;
      }

      function apply() {
        var keyword = normalize(form.elements.keyword && form.elements.keyword.value);
        var region = normalize(form.elements.region && form.elements.region.value);
        var type = normalize(form.elements.type && form.elements.type.value);
        var visible = 0;
        cards.forEach(function (card) {
          var text = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-year'),
            card.getAttribute('data-tags')
          ].join(' '));
          var matched = true;
          if (keyword && text.indexOf(keyword) === -1) {
            matched = false;
          }
          if (region && normalize(card.getAttribute('data-region')) !== region) {
            matched = false;
          }
          if (type && normalize(card.getAttribute('data-type')) !== type) {
            matched = false;
          }
          card.classList.toggle('is-hidden', !matched);
          if (matched) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle('show', visible === 0);
        }
      }

      form.addEventListener('submit', function (event) {
        event.preventDefault();
        apply();
      });
      Array.prototype.slice.call(form.elements).forEach(function (el) {
        el.addEventListener('input', apply);
        el.addEventListener('change', apply);
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupNavigation();
    setupHero();
    setupFilters();
  });
})();
