const params = new URLSearchParams(window.location.search);
const query = (params.get("q") || "").trim();
const input = document.querySelector(".large-search input[name='q']");
const title = document.querySelector("[data-search-title]");
const desc = document.querySelector("[data-search-desc]");
const results = document.querySelector("[data-search-results]");

if (input) {
    input.value = query;
}

const createCard = (movie) => {
    const tags = [movie.type, movie.year, ...movie.tags].filter(Boolean).slice(0, 4);
    return `
        <article class="movie-card">
            <a class="poster-frame" href="${movie.url}" aria-label="${movie.title}">
                <img src="${movie.cover}" alt="${movie.title}" loading="lazy" onerror="this.style.opacity=0">
                <span class="poster-play">▶</span>
                <span class="poster-label">${movie.type || "剧集"}</span>
            </a>
            <div class="movie-card-body">
                <a class="movie-card-title" href="${movie.url}">${movie.title}</a>
                <p class="movie-meta">${[movie.year, movie.region, movie.genre].filter(Boolean).join(" / ")}</p>
                <p class="movie-desc">${movie.desc}</p>
                <div class="movie-tags">
                    ${tags.map((tag) => `<span>${tag}</span>`).join("")}
                </div>
            </div>
        </article>
    `;
};

if (results && Array.isArray(window.MOVIE_SEARCH_DATA)) {
    const normalized = query.toLowerCase();
    const matched = normalized
        ? window.MOVIE_SEARCH_DATA.filter((movie) => {
            const haystack = [movie.title, movie.year, movie.region, movie.type, movie.genre, movie.desc, ...(movie.tags || [])].join(" ").toLowerCase();
            return haystack.includes(normalized);
        })
        : window.MOVIE_SEARCH_DATA.slice(0, 24);

    if (title) {
        title.textContent = query ? `“${query}”的搜索结果` : "热门内容推荐";
    }

    if (desc) {
        desc.textContent = query ? "点击影片卡片进入详情播放页。" : "可输入剧名、地区、年份、题材或标签继续筛选。";
    }

    if (matched.length) {
        results.innerHTML = matched.slice(0, 120).map(createCard).join("");
    } else {
        results.innerHTML = '<div class="empty-state">没有找到匹配内容，可以尝试更换关键词或浏览分类片库。</div>';
    }
}
