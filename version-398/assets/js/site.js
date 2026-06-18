(function () {
    "use strict";

    function $(selector, root) {
        return (root || document).querySelector(selector);
    }

    function $all(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function initMobileMenu() {
        var button = $('[data-menu-toggle]');
        var menu = $('[data-mobile-menu]');

        if (!button || !menu) {
            return;
        }

        button.addEventListener('click', function () {
            var open = menu.classList.toggle('open');
            button.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    function initHeroCarousel() {
        var carousel = $('[data-hero-carousel]');

        if (!carousel) {
            return;
        }

        var slides = $all('[data-hero-slide]', carousel);
        var dots = $all('[data-hero-dot]', carousel);
        var prev = $('[data-hero-prev]', carousel);
        var next = $('[data-hero-next]', carousel);
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }

            index = (nextIndex + slides.length) % slides.length;

            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === index);
            });

            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === index);
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

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });

        carousel.addEventListener('mouseenter', stop);
        carousel.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function valueOf(selector) {
        var node = $(selector);
        return node ? String(node.value || '').trim().toLowerCase() : '';
    }

    function cardMatches(card, filters) {
        var haystack = [
            card.getAttribute('data-title') || '',
            card.getAttribute('data-region') || '',
            card.getAttribute('data-genre') || '',
            card.getAttribute('data-tags') || '',
            card.getAttribute('data-year') || '',
            card.getAttribute('data-category') || ''
        ].join(' ').toLowerCase();

        if (filters.query && haystack.indexOf(filters.query) === -1) {
            return false;
        }

        if (filters.region && (card.getAttribute('data-region') || '').indexOf(filters.region) === -1) {
            return false;
        }

        if (filters.genre) {
            var genreText = (card.getAttribute('data-genre') || '') + ' ' + (card.getAttribute('data-tags') || '');
            if (genreText.indexOf(filters.genre) === -1) {
                return false;
            }
        }

        if (filters.category && card.getAttribute('data-category') !== filters.category) {
            return false;
        }

        return true;
    }

    function initFilters() {
        var grids = $all('[data-filterable]');

        if (!grids.length) {
            return;
        }

        var controls = $all('[data-filter-query], [data-filter-region], [data-filter-genre], [data-filter-category]');
        var count = $('[data-filter-count]');

        function apply() {
            var filters = {
                query: valueOf('[data-filter-query]'),
                region: valueOf('[data-filter-region]'),
                genre: valueOf('[data-filter-genre]'),
                category: valueOf('[data-filter-category]')
            };
            var visible = 0;
            var total = 0;

            grids.forEach(function (grid) {
                $all('.movie-card', grid).forEach(function (card) {
                    total += 1;
                    var matched = cardMatches(card, filters);
                    card.hidden = !matched;
                    if (matched) {
                        visible += 1;
                    }
                });
            });

            if (count) {
                count.textContent = visible + ' / ' + total;
            }
        }

        controls.forEach(function (control) {
            control.addEventListener('input', apply);
            control.addEventListener('change', apply);
        });

        apply();
    }

    function initPlayers() {
        $all('.video-player').forEach(function (player) {
            var video = $('video', player);
            var button = $('.player-button', player);
            var status = $('[data-player-status]', player);
            var source = player.getAttribute('data-video-src');
            var hlsInstance = null;
            var initialized = false;

            function setStatus(message) {
                if (status) {
                    status.textContent = message;
                }
            }

            function attachSource() {
                if (initialized || !video || !source) {
                    return;
                }

                initialized = true;
                setStatus('正在加载');

                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        setStatus('可播放');
                        video.play().catch(function () {
                            setStatus('点击视频继续播放');
                        });
                    });
                    hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal) {
                            setStatus('播放源加载失败');
                        }
                    });
                } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                    video.addEventListener('loadedmetadata', function () {
                        setStatus('可播放');
                        video.play().catch(function () {
                            setStatus('点击视频继续播放');
                        });
                    }, { once: true });
                } else {
                    video.src = source;
                    setStatus('浏览器正在尝试播放');
                    video.play().catch(function () {
                        setStatus('请更换支持 HLS 的浏览器');
                    });
                }
            }

            if (button) {
                button.addEventListener('click', function () {
                    player.classList.add('playing');
                    attachSource();
                    if (video) {
                        video.play().catch(function () {
                            setStatus('点击视频继续播放');
                        });
                    }
                });
            }

            if (video) {
                video.addEventListener('play', function () {
                    player.classList.add('playing');
                    setStatus('播放中');
                });
                video.addEventListener('pause', function () {
                    setStatus('已暂停');
                });
                video.addEventListener('ended', function () {
                    setStatus('播放结束');
                });
            }

            window.addEventListener('beforeunload', function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        });
    }

    function initScrollToPlayer() {
        $all('[data-scroll-player]').forEach(function (link) {
            link.addEventListener('click', function (event) {
                event.preventDefault();
                var player = $('.video-player');
                if (player) {
                    player.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMobileMenu();
        initHeroCarousel();
        initFilters();
        initPlayers();
        initScrollToPlayer();
    });
})();
