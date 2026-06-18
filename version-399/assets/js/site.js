import { H as Hls } from "./hls-vendor-dru42stk.js";

const mobileButton = document.querySelector("[data-mobile-menu-button]");
const mobileMenu = document.querySelector("[data-mobile-menu]");

if (mobileButton && mobileMenu) {
    mobileButton.addEventListener("click", () => {
        mobileMenu.classList.toggle("is-open");
    });
}

const hero = document.querySelector("[data-hero]");

if (hero) {
    const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    let index = 0;

    const showSlide = (nextIndex) => {
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach((slide, slideIndex) => {
            slide.classList.toggle("is-active", slideIndex === index);
        });
        dots.forEach((dot, dotIndex) => {
            dot.classList.toggle("is-active", dotIndex === index);
        });
    };

    dots.forEach((dot, dotIndex) => {
        dot.addEventListener("click", () => showSlide(dotIndex));
    });

    if (slides.length > 1) {
        setInterval(() => showSlide(index + 1), 5600);
    }
}

const setupPlayer = (video) => {
    const source = video.dataset.src;
    const wrap = video.closest(".player-wrap");
    const overlay = wrap ? wrap.querySelector("[data-play-overlay]") : null;

    if (!source) {
        return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
    } else if (Hls && Hls.isSupported()) {
        const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
    } else {
        video.src = source;
    }

    const markPlaying = () => {
        if (wrap) {
            wrap.classList.add("is-playing");
        }
    };

    const markPaused = () => {
        if (wrap) {
            wrap.classList.remove("is-playing");
        }
    };

    video.addEventListener("play", markPlaying);
    video.addEventListener("pause", markPaused);
    video.addEventListener("ended", markPaused);

    if (overlay) {
        overlay.addEventListener("click", () => {
            video.play().catch(() => {});
        });
    }
};

document.querySelectorAll("video[data-src]").forEach(setupPlayer);
