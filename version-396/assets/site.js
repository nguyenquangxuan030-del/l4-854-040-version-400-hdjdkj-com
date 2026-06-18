(function () {
  function ready(callback) {
    if (document.readyState !== 'loading') {
      callback();
      return;
    }
    document.addEventListener('DOMContentLoaded', callback);
  }

  ready(function () {
    var toggle = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (toggle && mobileNav) {
      toggle.addEventListener('click', function () {
        mobileNav.classList.toggle('is-open');
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-feature-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-feature-dot]'));
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function startSlides() {
      if (slides.length < 2) {
        return;
      }
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        startSlides();
      });
    });

    startSlides();

    var searchInput = document.querySelector('[data-search-input]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
    var buttons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-value]'));
    var emptyState = document.querySelector('[data-empty-state]');
    var activeFilter = 'all';

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function applyFilters() {
      var keyword = searchInput ? normalize(searchInput.value) : '';
      var visibleCount = 0;

      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute('data-search'));
        var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchesFilter = activeFilter === 'all' || haystack.indexOf(normalize(activeFilter)) !== -1;
        var isVisible = matchesKeyword && matchesFilter;

        card.classList.toggle('is-hidden', !isVisible);
        if (isVisible) {
          visibleCount += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle('is-visible', visibleCount === 0 && cards.length > 0);
      }
    }

    if (searchInput && cards.length) {
      searchInput.addEventListener('input', applyFilters);
    }

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        buttons.forEach(function (item) {
          item.classList.remove('is-active');
        });
        button.classList.add('is-active');
        activeFilter = button.getAttribute('data-filter-value') || 'all';
        applyFilters();
      });
    });
  });
})();
