//서브메뉴 검색버튼
const $searchEl = $('.search');
const $searchInputEl = $searchEl.find('input');

$searchEl.on('click', function () {
  $searchInputEl.focus();
});

$searchInputEl.on('focus', function () {
  $searchEl.addClass('focused');
  $searchInputEl.attr('placeholder', '검색');
});

$searchInputEl.on('blur', function () {
  $searchEl.removeClass('focused');
  $searchInputEl.attr('placeholder', '');
});

//banner slider 구현

$(document).ready(function () {
  const $track = $('.slider-track');
  const $slides = $('.slide');
  const slideCount = 3;
  const $pagination = $('.pagination span');
  let slideWidth = $('.slider-container').width();
  let currentIndex = 1; // 복제 구조상 1이 실제 첫 슬라이드
  let interval;
  let isAnimating = false;

  // 슬라이드 전환 속도(ms)
  const transitionDuration = 3000; // ← 전환 애니메이션 속도
  const transitionCSS = `${transitionDuration / 1000}s ease-in-out`;

  // 슬라이드 초기 위치 설정
  $track.css('transition', 'none');
  $track.css('transform', `translateX(-${slideWidth * currentIndex}px)`);

  // 페이지네이션 업데이트
  function updatePagination(index) {
    $pagination.removeClass('active');
    $pagination.eq(index % slideCount).addClass('active');
  }

  // 슬라이드 이동 함수
  function goToSlide(index) {
    if (isAnimating) return;
    isAnimating = true;

    $track.css('transition', `transform ${transitionCSS}`);
    $track.css('transform', `translateX(-${slideWidth * index}px)`);
    currentIndex = index;

    setTimeout(() => {
      if (currentIndex === 0) {
        $track.css('transition', 'none');
        currentIndex = slideCount;
        $track.css('transform', `translateX(-${slideWidth * currentIndex}px)`);
      }
      if (currentIndex === slideCount + 1) {
        $track.css('transition', 'none');
        currentIndex = 1;
        $track.css('transform', `translateX(-${slideWidth * currentIndex}px)`);
      }
      updatePagination(currentIndex - 1);
      isAnimating = false;
    }, transitionDuration);
  }

  // 자동 슬라이드
  function autoSlide() {
    goToSlide(currentIndex + 1);
  }

  // 중복 실행 방지용 setInterval 초기화 함수
  function resetInterval(duration = 5000) {
    clearInterval(interval);
    interval = setInterval(autoSlide, duration);
  }

  // 최초 자동 슬라이드 시작
  resetInterval();

  // 페이지네이션 클릭
  $pagination.on('click', function () {
    const index = $(this).data('index');
    updatePagination(index); // 즉시 active 반영
    goToSlide(index + 1);
    resetInterval(); // ← 인터벌 재설정
  });

  // 터치 스와이프
  let startX = 0;

  $track.on('touchstart', function (e) {
    clearInterval(interval);
    startX = e.originalEvent.touches[0].clientX;
  });

  $track.on('touchend', function (e) {
    const endX = e.originalEvent.changedTouches[0].clientX;
    const diff = startX - endX;

    if (diff > 50) {
      goToSlide(currentIndex + 1);
    } else if (diff < -50) {
      goToSlide(currentIndex - 1);
    }
    resetInterval(); // ← 인터벌 재설정
  });

  // 리사이즈 시 슬라이드 위치 재조정
  $(window).on('resize', function () {
    slideWidth = $('.slider-container').width();
    $track.css('transition', 'none');
    $track.css('transform', `translateX(-${slideWidth * currentIndex}px)`);
  });

  // 마우스 호버 시 슬라이드 정지
  $('.slide').on('mouseenter', function () {
    clearInterval(interval);
  });

  $('.slide').on('mouseleave', function () {
    resetInterval(); // ← 인터벌 재설정
  });
});
 
//  ScrollMagic 
$('section.scroll-spy').each(function () {
  new ScrollMagic.Scene({
    triggerElement: this, // 보여짐 여부를 감시할 요소 지정
    triggerHook: 0.8 // 요소가 스크롤될 때 걸리는 지점 (0 ~ 1)
  })
  .setClassToggle(this, 'show')
  .addTo(new ScrollMagic.Controller());
});


//사이드바(모바일)
$(document).ready(function () {
  const $sidebar = $(".sidebar");
  const $overlay = $(".overlay");
  const $subScreen = $(".sub-menu-screen");
  const $subContent = $(".sub-content");

  // 📱 햄버거 버튼 열기/닫기
  $(".menu-toggle").on("click", function () {
    $sidebar.addClass("active");
    $overlay.addClass("active");
    $(".main-menu").show();
    $subScreen.removeClass("active").hide();
    $subContent.empty();
  });

  

  // 📱 오버레이 클릭 → 닫기
  $overlay.on("click", function () {
    $sidebar.removeClass("active");
    $overlay.removeClass("active");
  });

  // 📱 사이드바 닫기 버튼
  $(document).on("click", ".close-btn", function () {
    $sidebar.removeClass("active");
    $overlay.removeClass("active");
    $subScreen.removeClass("active").hide();
    $subContent.empty();
  });

  // 📱 모바일에서 item_name의 a 링크 막기 (서브 없는 경우만 통과)
  $(document).on("click", ".item_name > a", function (e) {
    if (window.innerWidth <= 900) {
      const $contentsMenu = $(this).closest(".item").find(".contents_menu");
      if ($contentsMenu.length > 0) {
        e.preventDefault(); // 서브 있으면 기본 링크 막음
      }
    }
  });

  // 📱 메인 메뉴 클릭 시 서브화면으로 전환
  $(".item_name").on("click", function (e) {
    if (window.innerWidth <= 900) {
      e.preventDefault();

      const $parentItem = $(this).closest(".item");
      const $contentsMenu = $parentItem.find(".contents_menu");

      // 서브메뉴 없는 경우 → 링크 이동
      if ($contentsMenu.length === 0) {
        const link = $(this).find("a").attr("href");
        if (link && link !== "#") {
          window.location.href = link;
        }
        return;
      }

      // 서브메뉴 있는 경우 → clone 해서 아코디언 변환
      let $clone = $contentsMenu.clone();

      $clone.find("li").each(function () {
        let $h4 = $(this).children("h4");
        let $rest = $(this).children("a.sub-box, ul, a.sub-box.sub-box2");
        if ($rest.length && $h4.length) {
          let $wrapper = $('<div class="accordion-content"></div>');
          $rest.appendTo($wrapper);
          $h4.after($wrapper);
        }
      });

      $clone.find(".accordion-content").hide(); // 초기 닫힘
      $subContent.html($clone.html());

      $(".main-menu").hide();
      $subScreen.addClass("active").show();
    }
  });

  // 📱 뒤로가기 버튼
  $(".back-btn").on("click", function () {
    $subScreen.removeClass("active").hide();
    $(".main-menu").show();
    $subContent.empty();
  });

  // 📱 아코디언 (h4 클릭 → sub-box + ul 같이 열림)
  $(document).on("click", ".sub-menu-screen h4", function () {
    let $content = $(this).next(".accordion-content");

    if ($content.is(":visible")) {
      $content.slideUp();
    } else {
      $(this).closest(".inner").find(".accordion-content").slideUp();
      $content.slideDown();
    }
  });

  

  // 💻↔📱 리사이즈 시 초기화
  $(window).on("resize", function () {
  if (window.innerWidth > 900) {
    // 📌 PC로 전환될 때 초기화
    $subScreen.removeClass("active").hide();
    $(".main-menu").show();
    $subContent.empty();

    // 📌 사이드바와 오버레이도 닫기
    $sidebar.removeClass("active");
    $overlay.removeClass("active");
  }
});
});





 