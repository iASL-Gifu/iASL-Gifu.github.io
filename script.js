const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

let scrollIndicatorTicking = false;
let backgroundIntervalId = null;
let currentLanguage = 'ja';
let cachedNewsData = null;

const I18N = {
    ja: {
        pageTitle: 'iASL - アレックス研究室',
        navAria: 'セクションナビゲーション',
        burgerAria: 'ナビゲーションを開閉',
        news: 'News',
        about: 'About',
        message: 'Message',
        research: 'Research',
        members: 'Members',
        accessContact: 'Access・Contact',
        newsLoading: '読み込み中...',
        newsError: 'お知らせを取得できませんでした。',
        viewPhoto: '写真を見る',
        readArticle: '記事を読む',
        aboutP1: 'アレックス研究室は、2022年11月に岐阜大学工学部 電気電子・情報工学科（情報コース）に設立されました。',
        aboutP2: '自動運転ソフトウェア「Autoware」を活用した実験をはじめ、AIによる自動船舶や自律ロボットの研究を行っています。また、人間社会との関わり（ヒューマンインターフェース）の調査や、デジタルツインの検証環境構築、高度なセンシング技術の開発にも取り組んでいます。',
        aboutP3: '研究室の目標は、AIとロボティクスを活用して、より安全で効率的な自律システムを社会に実現することです。私たちは、最新の技術を学びながら、実践的なプロジェクトに取り組んでいます。',
        messageAlt: 'カルバヨ アレックサンダー 准教授',
        messageP1: 'みなさん，こんにちは．私は岐阜大学 准教授のカルバヨ アレックサンダーです。私は筑波大学知能ロボット研究所にて工学博士号を取得し, その後,北陽電機株式会社にてLiDARの研究開発に従事しました。',
        messageP2: 'そして現在,私は知能ロボットのセンシングや自律運転，それに関連する課題について取り組んでいます。こうした課題を取り組む中で、福祉課題などの地域問題解決にも貢献したいと考えています。',
        researchP1: 'センシングと認識技術を基盤に、車両自らが判断し行動する「E2E（End to End）自動運転」や、車と人が協調する運転支援システムなど、モビリティの知能化を追求しています。 さらに、大規模言語モデル（LLM）をはじめとする最先端AIの応用や、 車と社会をつなぐ「V2X（Vehicle to Everything）通信」、 現実世界を仮想空間に再現してシミュレーションを行う「デジタルツイン」まで、 モビリティの未来を形成する幅広い技術領域に挑戦しています。',
        researchBtn: 'COMING SOON',
        membersP1: '研究室には、博士課程2名(D1: 2名)、修士課程10名(M2: 4名, M1: 6名)、学部生5名(B4: 5名)、研究生1名の計18名が在籍しており、日々交流しながら研究に取り組んでいます。',
        membersP2: '研究室主催のイベントも多く学年の垣根を越えた交流が自然に生まれるのが魅力です。',
        membersBtn: 'More',
        addressP1: '〒501-1193 岐阜市柳戸1-1',
        addressP2: '岐阜大学 工学部 C棟 7階 C730',
        contactLink: 'お問い合わせ',
        mapTitle: '岐阜大学へのアクセスマップ',
        snsAria: 'SNSリンク',
        backToTopAria: 'ページ先頭へ戻る',
        closeImageAria: '画像を閉じる',
        closeArticleAria: '記事を閉じる',
        popupImageAlt: 'ポップアップ画像',
    },
    en: {
        pageTitle: 'iASL - Alexander Laboratory',
        navAria: 'Section Navigation',
        burgerAria: 'Toggle Navigation',
        news: 'News',
        about: 'About',
        message: 'Message',
        research: 'Research',
        members: 'Members',
        accessContact: 'Access & Contact',
        newsLoading: 'Loading...',
        newsError: 'Could not load announcements.',
        viewPhoto: 'View Photo',
        readArticle: 'Read Article',
        aboutP1: 'Alexander Laboratory was established in November 2022 in the Department of Electrical, Electronic and Computer Engineering (Information Course), Faculty of Engineering, Gifu University.',
        aboutP2: 'We conduct research on autonomous vessels and autonomous mobile robots, including experiments utilizing the open-source autonomous driving software "Autoware". We are also engaged in investigating human-machine interfaces, building digital twin simulation environments, and developing advanced sensing technologies.',
        aboutP3: 'Our mission is to realize safer and more efficient autonomous systems in society by harnessing AI and robotics. We actively work on hands-on practical projects while exploring state-of-the-art technologies.',
        messageAlt: 'Associate Professor Alexander Carballo',
        messageP1: 'Hello everyone. I am Alexander Carballo, an Associate Professor at Gifu University. I received my Ph.D. in Engineering from the Intelligent Robot Laboratory at the University of Tsukuba, and subsequently worked on LiDAR research and development at Hokuyo Automatic Co., Ltd.',
        messageP2: 'Currently, my research focuses on intelligent robot sensing, autonomous driving, and related challenges. Through these efforts, I also aim to contribute to solving local and societal challenges, including assistive and welfare applications.',
        researchP1: 'Based on sensing and perception technologies, we pursue intelligent mobility, including End-to-End (E2E) autonomous driving where vehicles make decisions autonomously, and cooperative driving support systems between vehicles and humans. Furthermore, we are tackling a wide range of technological domains shaping the future of mobility—from the application of cutting-edge AI such as Large Language Models (LLMs) to Vehicle-to-Everything (V2X) communication and Digital Twin simulations that replicate the physical world in virtual spaces.',
        researchBtn: 'COMING SOON',
        membersP1: 'Our laboratory currently has 18 members, including 2 Ph.D. students (D1: 2), 10 Master\'s students (M2: 4, M1: 6), 5 undergraduate students (B4: 5), and 1 research student, actively collaborating and conducting research every day.',
        membersP2: 'With many lab-hosted events, a welcoming culture fosters natural communication and collaboration across all academic years.',
        membersBtn: 'More',
        addressP1: '1-1 Yanagido, Gifu City, Gifu 501-1193, Japan',
        addressP2: 'Gifu University, Faculty of Engineering, Building C, 7th Floor, Room C730',
        contactLink: 'Contact Us',
        mapTitle: 'Access Map to Gifu University',
        snsAria: 'Social media links',
        backToTopAria: 'Back to top',
        closeImageAria: 'Close image',
        closeArticleAria: 'Close article',
        popupImageAlt: 'Popup image',
    }
};

function setLanguage(lang, updateUrl = true) {
    if (!I18N[lang]) {
        lang = 'ja';
    }

    currentLanguage = lang;
    document.documentElement.lang = lang;

    const dict = I18N[lang];

    if (dict.pageTitle) {
        document.title = dict.pageTitle;
    }

    document.querySelectorAll('[data-i18n]').forEach((el) => {
        const key = el.dataset.i18n;
        if (dict[key] !== undefined) {
            el.textContent = dict[key];
        }
    });

    document.querySelectorAll('[data-i18n-aria]').forEach((el) => {
        const key = el.dataset.i18nAria;
        if (dict[key] !== undefined) {
            el.setAttribute('aria-label', dict[key]);
        }
    });

    document.querySelectorAll('[data-i18n-alt]').forEach((el) => {
        const key = el.dataset.i18nAlt;
        if (dict[key] !== undefined) {
            el.setAttribute('alt', dict[key]);
        }
    });

    document.querySelectorAll('[data-i18n-title]').forEach((el) => {
        const key = el.dataset.i18nTitle;
        if (dict[key] !== undefined) {
            el.setAttribute('title', dict[key]);
        }
    });

    document.querySelectorAll('.lang-btn').forEach((btn) => {
        const isActive = btn.dataset.lang === lang;
        btn.classList.toggle('is-active', isActive);
        btn.setAttribute('aria-pressed', String(isActive));
    });

    try {
        localStorage.setItem('iASL_lang', lang);
    } catch (e) {
        // Ignore local storage error in private browsing mode
    }

    if (updateUrl) {
        const url = new URL(window.location.href);
        url.searchParams.set('lang', lang);
        window.history.replaceState(null, '', url.toString());
    }

    if (cachedNewsData) {
        renderNews(cachedNewsData);
    }
}

function initLanguageSwitcher() {
    const buttons = document.querySelectorAll('.lang-btn');
    if (!buttons.length) {
        return;
    }

    buttons.forEach((btn) => {
        btn.addEventListener('click', () => {
            const selectedLang = btn.dataset.lang;
            if (selectedLang && selectedLang !== currentLanguage) {
                setLanguage(selectedLang);
            }
        });
    });

    const params = new URLSearchParams(window.location.search);
    const urlLang = params.get('lang');
    let initialLang = 'ja';

    if (urlLang && I18N[urlLang]) {
        initialLang = urlLang;
    } else {
        try {
            const savedLang = localStorage.getItem('iASL_lang');
            if (savedLang && I18N[savedLang]) {
                initialLang = savedLang;
            } else if (navigator.language && !navigator.language.toLowerCase().startsWith('ja')) {
                initialLang = 'en';
            }
        } catch (e) {
            // Storage access fallback
        }
    }

    setLanguage(initialLang, Boolean(urlLang));
}

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
    cachedNewsData = newsData;
    const container = document.getElementById('news-container');
    if (!container) {
        return;
    }

    const dict = I18N[currentLanguage] || I18N.ja;

    const html = `
        <div class="news-list">
            ${newsData.map((news) => {
                const actions = [];

                if (news.attachment) {
                    if (/\.(jpg|jpeg|png|gif)$/i.test(news.attachment)) {
                        actions.push(`
                            <a href="${escapeHtml(news.attachment)}" class="news-attachment-link" data-popup-image="${escapeHtml(news.attachment)}">
                                <i class="fa fa-image" aria-hidden="true"></i>${escapeHtml(dict.viewPhoto)}
                            </a>
                        `);
                    } else if (/\.md$/i.test(news.attachment)) {
                        actions.push(`
                            <a href="${escapeHtml(news.attachment)}" class="news-attachment-link" data-article-path="${escapeHtml(news.attachment)}">
                                <i class="fa fa-file-alt" aria-hidden="true"></i>${escapeHtml(dict.readArticle)}
                            </a>
                        `);
                    }
                }

                const contentText = (currentLanguage === 'en' && news.content_en && news.content_en.trim())
                    ? news.content_en.trim()
                    : news.content;

                return `
                    <article class="news-item">
                        <div class="news-date">${escapeHtml(news.date)}</div>
                        <div class="news-body">
                            <p class="news-copy">${escapeHtml(contentText)}</p>
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
        const dict = I18N[currentLanguage] || I18N.ja;
        container.textContent = dict.newsError;
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
    initLanguageSwitcher();
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
