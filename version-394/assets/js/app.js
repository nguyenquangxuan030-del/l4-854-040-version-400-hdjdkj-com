(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  function initMobileMenu() {
    const toggle = $('[data-menu-toggle]');
    const menu = $('[data-mobile-menu]');

    if (!toggle || !menu) {
      return;
    }

    toggle.addEventListener('click', () => {
      menu.classList.toggle('is-open');
    });
  }

  function initHeroSlider() {
    const hero = $('[data-hero-slider]');

    if (!hero) {
      return;
    }

    const slides = $$('.hero-slide', hero);
    const dots = $$('.hero-dot', hero);
    const next = $('[data-hero-next]', hero);
    const prev = $('[data-hero-prev]', hero);
    let index = 0;
    let timer = null;

    const activate = (nextIndex) => {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    };

    const start = () => {
      stop();
      timer = window.setInterval(() => activate(index + 1), 5200);
    };

    const stop = () => {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    };

    dots.forEach((dot, dotIndex) => {
      dot.addEventListener('click', () => {
        activate(dotIndex);
        start();
      });
    });

    if (next) {
      next.addEventListener('click', () => {
        activate(index + 1);
        start();
      });
    }

    if (prev) {
      prev.addEventListener('click', () => {
        activate(index - 1);
        start();
      });
    }

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    activate(0);
    start();
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function initLocalFilters() {
    $$('[data-filter-scope]').forEach((scope) => {
      const input = $('.js-filter-input', scope);
      const type = $('.js-filter-type', scope);
      const year = $('.js-filter-year', scope);
      const region = $('.js-filter-region', scope);
      const cards = $$('.js-filter-card', scope);
      const count = $('.js-filter-count', scope);
      const empty = $('.js-filter-empty', scope);

      const apply = () => {
        const keyword = normalize(input ? input.value : '');
        const typeValue = normalize(type ? type.value : '');
        const yearValue = normalize(year ? year.value : '');
        const regionValue = normalize(region ? region.value : '');
        let visible = 0;

        cards.forEach((card) => {
          const haystack = normalize([
            card.dataset.title,
            card.dataset.tags,
            card.dataset.region,
            card.dataset.type,
            card.dataset.year,
          ].join(' '));
          const matchesKeyword = !keyword || haystack.includes(keyword);
          const matchesType = !typeValue || normalize(card.dataset.type).includes(typeValue);
          const matchesYear = !yearValue || normalize(card.dataset.year) === yearValue;
          const matchesRegion = !regionValue || normalize(card.dataset.region).includes(regionValue);
          const shouldShow = matchesKeyword && matchesType && matchesYear && matchesRegion;

          card.style.display = shouldShow ? '' : 'none';
          if (shouldShow) {
            visible += 1;
          }
        });

        if (count) {
          count.textContent = String(visible);
        }

        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      };

      [input, type, year, region].filter(Boolean).forEach((control) => {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      });

      apply();
    });
  }

  function createSearchCard(movie) {
    const tags = (movie.tags || []).slice(0, 3).map((tag) => `<span>${escapeHtml(tag)}</span>`).join('');

    return `
      <a class="movie-card" href="movie/${movie.id}.html">
        <span class="poster-wrap">
          <img src="${movie.cover}" alt="${escapeHtml(movie.title)}" loading="lazy">
          <span class="poster-gradient"></span>
          <span class="play-chip">立即观看</span>
        </span>
        <span class="movie-info">
          <strong>${escapeHtml(movie.title)}</strong>
          <em>${escapeHtml(movie.region)} · ${escapeHtml(movie.year)} · ${escapeHtml(movie.type)}</em>
          <span class="card-line">${escapeHtml(movie.oneLine)}</span>
          <span class="tag-row">${tags}</span>
        </span>
      </a>`;
  }

  function escapeHtml(value) {
    return String(value || '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function initGlobalSearch() {
    const results = $('#globalSearchResults');

    if (!results || !window.MOVIE_SEARCH_DATA) {
      return;
    }

    const input = $('#globalSearchInput');
    const type = $('#globalSearchType');
    const year = $('#globalSearchYear');
    const region = $('#globalSearchRegion');
    const count = $('#globalSearchCount');
    const empty = $('#globalSearchEmpty');

    const render = () => {
      const keyword = normalize(input ? input.value : '');
      const typeValue = normalize(type ? type.value : '');
      const yearValue = normalize(year ? year.value : '');
      const regionValue = normalize(region ? region.value : '');
      const matched = window.MOVIE_SEARCH_DATA.filter((movie) => {
        const haystack = normalize([
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.oneLine,
          (movie.tags || []).join(' '),
        ].join(' '));

        return (!keyword || haystack.includes(keyword))
          && (!typeValue || normalize(movie.type).includes(typeValue))
          && (!yearValue || normalize(movie.year) === yearValue)
          && (!regionValue || normalize(movie.region).includes(regionValue));
      });
      const limited = matched.slice(0, 96);

      results.innerHTML = limited.map(createSearchCard).join('');

      if (count) {
        count.textContent = String(matched.length);
      }

      if (empty) {
        empty.classList.toggle('is-visible', matched.length === 0);
      }
    };

    [input, type, year, region].filter(Boolean).forEach((control) => {
      control.addEventListener('input', render);
      control.addEventListener('change', render);
    });

    render();
  }

  function initPlayers() {
    $$('video[data-video-url]').forEach((video) => {
      const source = video.dataset.videoUrl;
      const message = video.closest('.video-box')?.querySelector('.player-message');

      if (!source) {
        showPlayerMessage(message, '当前影片暂未配置播放源。');
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        const hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
        });

        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
          showPlayerMessage(message, '播放源已就绪，点击播放器即可观看。');
        });
        hls.on(window.Hls.Events.ERROR, (_event, data) => {
          if (data && data.fatal) {
            showPlayerMessage(message, '播放源加载异常，请刷新页面或稍后重试。');
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        showPlayerMessage(message, '播放源已就绪，点击播放器即可观看。');
      } else {
        video.src = source;
        showPlayerMessage(message, '浏览器可能不支持 HLS 播放，可更换浏览器后再试。');
      }
    });
  }

  function showPlayerMessage(message, text) {
    if (!message) {
      return;
    }

    message.textContent = text;
    message.classList.add('is-visible');

    window.setTimeout(() => {
      message.classList.remove('is-visible');
    }, 5200);
  }

  document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    initHeroSlider();
    initLocalFilters();
    initGlobalSearch();
    initPlayers();
  });
})();
