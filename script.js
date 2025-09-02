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
          let contentHtml = (news.attachment)
              ? `${news.content} <a href="${news.attachment}" class="news-attachment-link" onclick="showPopup(event, '${news.attachment}')"><i class="fa fa-image"></i> 添付画像を見る</a>`
              : news.content;

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