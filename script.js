var menu = document.querySelector('.nav__list');
var burger = document.querySelector('.burger');
var doc = $(document);
var l = $('.scrolly');
var panel = $('.panel');
var vh = $(window).height();

var openMenu = function() {
  burger.classList.toggle('burger--active');
  menu.classList.toggle('nav__list--active');
};

panel.eq(0).find('.panel__content').addClass('panel__content--active');

var scrollFx = function() {
  var ds = doc.scrollTop();
  var of = vh / 4;
  
  for (var i = 0; i < panel.length; i++) {
    if (panel.eq(i).offset().top < ds+of) {
     panel.eq(i).find('.panel__content').addClass('panel__content--active');
    } else {
      panel.eq(i).find('.panel__content').removeClass('panel__content--active')
    }
  }
};

var scrolly = function(e) {
  e.preventDefault();
  var target = this.hash;
  var $target = $(target);

  $('html, body').stop().animate({
      'scrollTop': $target.offset().top
  }, 300, 'swing', function () {
      window.location.hash = target;
  });
}

var init = function() {
  burger.addEventListener('click', openMenu, false);
  window.addEventListener('scroll', scrollFx, false);
  window.addEventListener('load', scrollFx, false);
  $('a[href^="#"]').on('click',scrolly);
};

document.addEventListener('DOMContentLoaded', init);

window.addEventListener("scroll", () => {
    let scrollHeight = document.documentElement.scrollHeight;
    let scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    let clientHeight = document.documentElement.clientHeight;
    let scrollPercent = scrollTop / (scrollHeight - clientHeight);
    let rotateAngle = scrollPercent * 360 * 5;
    
    if (document.querySelector('.scroll_indicator')) {
        document.querySelector('.scroll_indicator').style.top = (scrollPercent * (window.innerHeight - 50)) + "px";
        document.querySelector('.scroll_indicator').style.transform = 'rotate(' + rotateAngle + 'deg)';
    }
});

function parseNewsCSV(text) {
    const lines = text.trim().split(/\r?\n/);
    if (lines.length < 2) return [];
    const headers = lines[0].split(',').map(h => h.trim());
    const newsItems = [];
    for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim() === '') continue;
        const values = lines[i].split(',').map(v => v.trim());
        const item = {};
        headers.forEach((header, index) => {
            item[header] = values[index];
        });
        newsItems.push(item);
    }
    return newsItems;
}

async function fetchNews() {
  const csvPath = "/component/news.csv";
  try {
      const response = await fetch(csvPath);
      if (!response.ok) throw new Error('news.csvの読み込みに失敗');
      
      const csvText = await response.text();
      const newsData = parseNewsCSV(csvText);

      newsData.reverse();

      let html = `<table>`;
      newsData.forEach(news => {
          let contentHtml = news.content;
          if (news.attachment) {
              if (/\.(jpg|jpeg|png|gif)$/i.test(news.attachment)) {
                  contentHtml += ` <a href="${news.attachment}" class="news-attachment-link" onclick="showPopup(event, '${news.attachment}')"><i class="fa fa-image"></i>写真を見る</a>`;
              } else if (news.attachment.endsWith('.md')) {
                  contentHtml += ` <a href="${news.attachment}" class="news-attachment-link" onclick="showArticle(event, '${news.attachment}')"><i class="fa fa-file-alt"></i> 記事を読む</a>`;
              }
          }
          html += `<tr><th>${news.date}</th><td>${contentHtml}</td></tr>`;
      });
      html += `</table>`;

      document.getElementById("news-container").innerHTML = html;
  } catch (error) {
      console.error("データ取得エラー:", error);
      document.getElementById("news-container").innerHTML = "お知らせを取得できませんでした。";
  }
}

function showPopup(event, attachment) {
  event.preventDefault();
  const popup = document.getElementById("popup");
  const popupImage = document.getElementById("popup-image");
  if (popup && popupImage) {
      popupImage.src = attachment;
      popup.style.display = "flex"; // CSSのflexboxを有効にして表示
  }
}

async function showArticle(event, mdPath) {
    event.preventDefault();
    const articlePopup = document.getElementById("article-popup");
    const articleContent = document.getElementById("article-content");
    
    if (articlePopup && articleContent) {
        try {
            const response = await fetch(mdPath);
            if (!response.ok) throw new Error('記事の読み込みに失敗');
            const mdText = await response.text();
            
            // marked.jsが読み込まれていなければ読み込む
            if (typeof marked === 'undefined') {
                await new Promise((resolve) => {
                    const script = document.createElement('script');
                    script.src = "https://cdn.jsdelivr.net/npm/marked/marked.min.js";
                    script.onload = resolve;
                    document.body.appendChild(script);
                });
            }
            
            articleContent.innerHTML = marked.parse(mdText);
            articlePopup.style.display = "flex";
        } catch (error) {
            articleContent.innerHTML = `<p>${error.message}</p>`;
            articlePopup.style.display = "flex";
        }
    }
}

function hideArticlePopup() {
    const articlePopup = document.getElementById("article-popup");
    if (articlePopup) {
        articlePopup.style.display = "none";
    }
}

const articlePopup = document.getElementById("article-popup");
if (articlePopup) {
    document.getElementById("article-popup-close").addEventListener("click", hideArticlePopup);
    articlePopup.addEventListener("click", function (event) {
        if (event.target === articlePopup) {
            hideArticlePopup();
        }
    });
}

function hidePopup() {
    const popup = document.getElementById("popup");
    if (popup) {
        popup.style.display = "none";
    }
}

// ポップアップ関連のイベントリスナー設定
const popup = document.getElementById("popup");
if (popup) {
    document.getElementById("popup-close").addEventListener("click", hidePopup);
    // 背景（オーバーレイ）クリックで閉じる
    popup.addEventListener("click", function (event) {
        // クリックされたのが背景自身である場合のみ閉じる
        if (event.target === popup) {
            hidePopup();
        }
    });
}

if (document.getElementById("news-container")) {
    fetchNews();
}

function goBackOrRedirect() {
  if (document.referrer) {
      window.history.back();
  } else {
      window.location.href = "/index.html";
  }
}

document.addEventListener('DOMContentLoaded', () => {
    const backgroundAnimation = document.getElementById('background-animation');

    // ★ここにアニメーションさせたい画像のパスを2〜4種類指定してください★
    const iconImages = [
        '/img/logo_clear.png',
        '/img/pix2.png',
        '/img/calypso_b.png',
        '/img/robot_b.png'
    ];

    function createIcon() {
        if (!backgroundAnimation) return;

        const icon = document.createElement('img');
        icon.classList.add('floating-icon');
        
        // iconImages配列からランダムに画像を選ぶ
        icon.src = iconImages[Math.floor(Math.random() * iconImages.length)];

        // アイコンのプロパティをランダムに設定
        const size = Math.random() * 80 + 40; // 40px 〜 120px
        const duration = Math.random() * 15 + 10; // 10秒 〜 25秒
        const leftPosition = Math.random() * 100; // 0% 〜 100%

        icon.style.width = `${size}px`;
        icon.style.height = 'auto';
        icon.style.left = `${leftPosition}vw`;
        icon.style.animationDuration = `${duration}s`;
        icon.style.animationDelay = `${Math.random() * 5}s`; // 開始タイミングをずらす

        backgroundAnimation.appendChild(icon);

        // アニメーション終了後に要素を削除
        setTimeout(() => {
            icon.remove();
        }, (duration + 5) * 1000);
    }

    // 指定した間隔（ミリ秒）でアイコンを生成（例：2秒ごと）
    setInterval(createIcon, 2000);
});