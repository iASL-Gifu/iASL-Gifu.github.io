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

// reveal content of first panel by default
panel.eq(0).find('.panel__content').addClass('panel__content--active');

var scrollFx = function() {
  var ds = doc.scrollTop();
  var of = vh / 4;
  
  // if the panel is in the viewport, reveal the content, if not, hide it.
  for (var i = 0; i < panel.length; i++) {
    if (panel.eq(i).offset().top < ds+of) {
     panel
       .eq(i)
       .find('.panel__content')
       .addClass('panel__content--active');
    } else {
      panel
        .eq(i)
        .find('.panel__content')
        .removeClass('panel__content--active')
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
    
    document.querySelector('.scroll_indicator').style.top = (scrollPercent * (window.innerHeight - 50)) + "px";
    document.querySelector('.scroll_indicator').style.transform = 'rotate(' + rotateAngle + 'deg)';
});


// NEWSコンテンツ取得

async function fetchNews() {
  const apiUrl = "https://script.google.com/a/macros/iasl.info.gifu-u.ac.jp/s/AKfycbxVbn-t9inHYapqg6GLKhloUZWDpniZkzITarH-ntj5PnXxn2dJ9YPRlMbAKvw_-N-rYQ/exec";
  try {
      const response = await fetch(apiUrl);
      const newsData = await response.json();

      newsData.reverse();

      let html = `<table>`;

      newsData.forEach(news => {
          let contentHtml = news.attachment
              ? `<a href="${news.attachment}" onclick="showPopup('${news.attachment}'); return false;">${news.content}</a>`
              : news.content;

          html += `<tr>
              <th>${news.date}</th>
              <td>${contentHtml}</td>
          </tr>`;
      });

      html += `</table>`;

      document.getElementById("news-container").innerHTML = html;
  } catch (error) {
      console.error("データ取得エラー:", error);
      document.getElementById("news-container").innerHTML = "データを取得できませんでした。";
  }
}

function showPopup(attachment) {
  document.getElementById("popup-image").src = attachment;
  document.getElementById("popup").style.display = "block";
}

document.getElementById("popup-close").addEventListener("click", function () {
  document.getElementById("popup").style.display = "none";
});

fetchNews();

function goBackOrRedirect() {
  if (document.referrer) {
      window.history.back();
  } else {
      window.location.href = "index.html";
  }
}
