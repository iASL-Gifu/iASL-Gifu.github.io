const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

let scrollIndicatorTicking = false;
let backgroundIntervalId = null;

function splitCsvLine(line) {
    const values = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i += 1) {
        const char = line[i];
        const nextChar = line[i + 1];

        if (char === '"' && inQuotes && nextChar === '"') {
            current += '"';
            i += 1;
            continue;
        }

        if (char === '"') {
            inQuotes = !inQuotes;
            continue;
        }

        if (char === ',' && !inQuotes) {
            values.push(current.trim());
            current = '';
            continue;
        }

        current += char;
    }

    values.push(current.trim());
    return values;
}

function parseNewsCSV(text) {
    const lines = text.trim().split(/\r?\n/);
    if (lines.length < 2) {
        return [];
    }

    const headers = splitCsvLine(lines[0]);

    return lines.slice(1).filter(Boolean).map((line) => {
        const values = splitCsvLine(line);
        const item = {};

        headers.forEach((header, index) => {
            item[header] = values[index] || '';
        });

        return item;
    });
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function setMenuOpen(isOpen) {
    const burger = document.querySelector('.burger');
    const menu = document.querySelector('.nav__list');

    if (!burger || !menu) {
        return;
    }

    burger.classList.toggle('burger--active', isOpen);
    burger.setAttribute('aria-expanded', String(isOpen));
    menu.classList.toggle('nav__list--active', isOpen);
}

function initNavigation() {
    const nav = document.querySelector('.nav');
    const burger = document.querySelector('.burger');
    const menu = document.querySelector('.nav__list');

    if (!nav || !burger || !menu) {
        return;
    }

    burger.addEventListener('click', () => {
        const isOpen = !menu.classList.contains('nav__list--active');
        setMenuOpen(isOpen);
    });

    menu.querySelectorAll('a[href^="#"]').forEach((link) => {
        link.addEventListener('click', () => {
            setMenuOpen(false);
        });
    });

    document.addEventListener('click', (event) => {
        if (!menu.classList.contains('nav__list--active')) {
            return;
        }

        if (!nav.contains(event.target)) {
            setMenuOpen(false);
        }
    });
}

function initPanelReveal() {
    const panelContents = Array.from(document.querySelectorAll('.panel .panel__content'));

    if (!panelContents.length) {
        return;
    }

    if (prefersReducedMotion.matches || !('IntersectionObserver' in window)) {
        panelContents.forEach((content) => content.classList.add('panel__content--active'));
        return;
    }

    const observer = new IntersectionObserver((entries, entryObserver) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) {
                return;
            }

            entry.target.classList.add('panel__content--active');
            entryObserver.unobserve(entry.target);
        });
    }, {
        threshold: 0.18,
        rootMargin: '0px 0px -10% 0px',
    });

    panelContents.forEach((content) => observer.observe(content));
}

function initAnchorScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
        link.addEventListener('click', (event) => {
            const hash = link.getAttribute('href');
            if (!hash || hash === '#') {
                return;
            }

            const target = document.querySelector(hash);
            if (!target) {
                return;
            }

            event.preventDefault();
            target.scrollIntoView({
                behavior: prefersReducedMotion.matches ? 'auto' : 'smooth',
                block: 'start',
            });

            history.replaceState(null, '', hash);
        });
    });
}

function updateScrollIndicator() {
    const scrollIndicator = document.querySelector('.scroll_indicator');
    const scrollTrack = scrollIndicator ? scrollIndicator.closest('.tire') : null;
    if (!scrollIndicator) {
        scrollIndicatorTicking = false;
        return;
    }

    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = document.documentElement.clientHeight;
    const maxScroll = Math.max(scrollHeight - clientHeight, 0);

    if (maxScroll === 0 || prefersReducedMotion.matches) {
        scrollIndicator.style.opacity = '0';
        scrollIndicator.style.transform = 'translateY(0) rotate(0deg)';
        scrollIndicatorTicking = false;
        return;
    }

    const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
    const scrollPercent = Math.min(Math.max(scrollTop / maxScroll, 0), 1);
    const edgeGap = Math.min(Math.max(window.innerHeight * 0.04, 24), 40);
    const trackTop = scrollTrack ? Number.parseFloat(window.getComputedStyle(scrollTrack).top) || 0 : edgeGap;
    const trackHeight = scrollTrack ? scrollTrack.getBoundingClientRect().height : scrollIndicator.getBoundingClientRect().height;
    const travel = Math.max(window.innerHeight - trackTop - trackHeight - edgeGap, 0);
    const translateY = travel * scrollPercent;
    const rotateAngle = scrollPercent * 1440;

    scrollIndicator.style.opacity = '0.9';
    scrollIndicator.style.transform = `translateY(${translateY}px) rotate(${rotateAngle}deg)`;
    scrollIndicatorTicking = false;
}

function requestScrollIndicatorUpdate() {
    if (scrollIndicatorTicking) {
        return;
    }

    scrollIndicatorTicking = true;
    window.requestAnimationFrame(updateScrollIndicator);
}

function initScrollIndicator() {
    if (!document.querySelector('.scroll_indicator')) {
        return;
    }

    updateScrollIndicator();
    window.addEventListener('scroll', requestScrollIndicatorUpdate, { passive: true });
    window.addEventListener('resize', requestScrollIndicatorUpdate);
}

function bindNewsActions(container) {
    container.querySelectorAll('[data-popup-image]').forEach((link) => {
        link.addEventListener('click', (event) => {
            showPopup(event, link.dataset.popupImage);
        });
    });

    container.querySelectorAll('[data-article-path]').forEach((link) => {
        link.addEventListener('click', (event) => {
            showArticle(event, link.dataset.articlePath);
        });
    });
}

function renderNews(newsData) {
    const container = document.getElementById('news-container');
    if (!container) {
        return;
    }

    const html = `
        <div class="news-list">
            ${newsData.map((news) => {
                const actions = [];

                if (news.attachment) {
                    if (/\.(jpg|jpeg|png|gif)$/i.test(news.attachment)) {
                        actions.push(`
                            <a href="${escapeHtml(news.attachment)}" class="news-attachment-link" data-popup-image="${escapeHtml(news.attachment)}">
                                <i class="fa fa-image" aria-hidden="true"></i>写真を見る
                            </a>
                        `);
                    } else if (/\.md$/i.test(news.attachment)) {
                        actions.push(`
                            <a href="${escapeHtml(news.attachment)}" class="news-attachment-link" data-article-path="${escapeHtml(news.attachment)}">
                                <i class="fa fa-file-alt" aria-hidden="true"></i>記事を読む
                            </a>
                        `);
                    }
                }

                return `
                    <article class="news-item">
                        <div class="news-date">${escapeHtml(news.date)}</div>
                        <div class="news-body">
                            <p class="news-copy">${escapeHtml(news.content)}</p>
                            ${actions.length ? `<div class="news-actions">${actions.join('')}</div>` : ''}
                        </div>
                    </article>
                `;
            }).join('')}
        </div>
    `;

    container.innerHTML = html;
    bindNewsActions(container);
}

async function fetchNews() {
    const container = document.getElementById('news-container');
    if (!container) {
        return;
    }

    try {
        const response = await fetch('/component/news.csv');
        if (!response.ok) {
            throw new Error('news.csvの読み込みに失敗');
        }

        const csvText = await response.text();
        const newsData = parseNewsCSV(csvText).reverse();
        renderNews(newsData);
    } catch (error) {
        console.error('データ取得エラー:', error);
        container.textContent = 'お知らせを取得できませんでした。';
    }
}

function showPopup(eventOrAttachment, attachmentArg) {
    const popup = document.getElementById('popup');
    const popupImage = document.getElementById('popup-image');
    const event = typeof eventOrAttachment === 'object' ? eventOrAttachment : null;
    const attachment = typeof eventOrAttachment === 'string' ? eventOrAttachment : attachmentArg;

    if (event) {
        event.preventDefault();
    }

    if (!popup || !popupImage || !attachment) {
        return;
    }

    popupImage.src = attachment;
    popup.style.display = 'flex';
}

function hidePopup() {
    const popup = document.getElementById('popup');
    const popupImage = document.getElementById('popup-image');

    if (!popup || !popupImage) {
        return;
    }

    popup.style.display = 'none';
    popupImage.removeAttribute('src');
}

async function ensureMarked() {
    if (typeof marked !== 'undefined') {
        return;
    }

    await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/marked/marked.min.js';
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
    });
}

async function showArticle(eventOrPath, pathArg) {
    const articlePopup = document.getElementById('article-popup');
    const articleContent = document.getElementById('article-content');
    const event = typeof eventOrPath === 'object' ? eventOrPath : null;
    const mdPath = typeof eventOrPath === 'string' ? eventOrPath : pathArg;

    if (event) {
        event.preventDefault();
    }

    if (!articlePopup || !articleContent || !mdPath) {
        return;
    }

    try {
        const response = await fetch(mdPath);
        if (!response.ok) {
            throw new Error('記事の読み込みに失敗');
        }

        const mdText = await response.text();
        await ensureMarked();
        articleContent.innerHTML = marked.parse(mdText);
    } catch (error) {
        articleContent.innerHTML = `<p>${escapeHtml(error.message)}</p>`;
    }

    articlePopup.style.display = 'flex';
}

function hideArticlePopup() {
    const articlePopup = document.getElementById('article-popup');
    if (!articlePopup) {
        return;
    }

    articlePopup.style.display = 'none';
}

function initPopups() {
    const popup = document.getElementById('popup');
    const popupClose = document.getElementById('popup-close');
    const articlePopup = document.getElementById('article-popup');
    const articlePopupClose = document.getElementById('article-popup-close');

    if (popup && popupClose) {
        popupClose.addEventListener('click', hidePopup);
        popup.addEventListener('click', (event) => {
            if (event.target === popup) {
                hidePopup();
            }
        });
    }

    if (articlePopup && articlePopupClose) {
        articlePopupClose.addEventListener('click', hideArticlePopup);
        articlePopup.addEventListener('click', (event) => {
            if (event.target === articlePopup) {
                hideArticlePopup();
            }
        });
    }

    document.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape') {
            return;
        }

        hidePopup();
        hideArticlePopup();
        setMenuOpen(false);
    });
}

function goBackOrRedirect() {
    if (document.referrer) {
        window.history.back();
        return;
    }

    window.location.href = '/index.html';
}

function initBackgroundAnimation() {
    const backgroundAnimation = document.getElementById('background-animation');
    if (!backgroundAnimation || prefersReducedMotion.matches) {
        return;
    }

    const iconImages = [
        '/img/logo_clear.png',
        '/img/pix2.png',
        '/img/calypso_b.png',
        '/img/robot_b.png',
    ];

    const createIcon = () => {
        if (document.hidden || backgroundAnimation.childElementCount > 6) {
            return;
        }

        const icon = document.createElement('img');
        const size = Math.random() * 56 + 42;
        const duration = Math.random() * 12 + 16;

        icon.classList.add('floating-icon');
        icon.src = iconImages[Math.floor(Math.random() * iconImages.length)];
        icon.alt = '';
        icon.style.width = `${size}px`;
        icon.style.left = `${Math.random() * 100}vw`;
        icon.style.animationDuration = `${duration}s`;
        icon.style.animationDelay = `${Math.random() * 1.5}s`;

        backgroundAnimation.appendChild(icon);

        window.setTimeout(() => {
            icon.remove();
        }, duration * 1000 + 1800);
    };

    createIcon();
    createIcon();
    backgroundIntervalId = window.setInterval(createIcon, 4200);
}

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initPanelReveal();
    initAnchorScrolling();
    initScrollIndicator();
    initPopups();
    initBackgroundAnimation();

    if (document.getElementById('news-container')) {
        fetchNews();
    }
});

window.addEventListener('beforeunload', () => {
    if (backgroundIntervalId) {
        window.clearInterval(backgroundIntervalId);
    }
});
