/* =============================
   スライダー設定
============================= */

// スライダーAの画像リスト
const sliderAImages = [
  { src: 'images/slideA-01.jpg', alt: 'スライドA 1枚目' },
  { src: 'images/slideA-02.jpg', alt: 'スライドA 2枚目' },
  { src: 'images/slideA-03.jpg', alt: 'スライドA 3枚目' },
  { src: 'images/slideA-04.jpg', alt: 'スライドA 4枚目' },
  { src: 'images/slideA-05.jpg', alt: 'スライドA 5枚目' },
  { src: 'images/slideA-06.jpg', alt: 'スライドA 6枚目' },
  { src: 'images/slideA-07.jpg', alt: 'スライドA 7枚目' },
  { src: 'images/slideA-08.jpg', alt: 'スライドA 8枚目' },
];

// スライダーBの画像リスト
const sliderBImages = [
  { src: 'images/slideB-01.jpg', alt: 'スライドB 1枚目' },
  { src: 'images/slideB-02.jpg', alt: 'スライドB 2枚目' },
  { src: 'images/slideB-03.jpg', alt: 'スライドB 3枚目' },
  { src: 'images/slideB-04.jpg', alt: 'スライドB 4枚目' },
  { src: 'images/slideB-05.jpg', alt: 'スライドB 5枚目' },
  { src: 'images/slideB-06.jpg', alt: 'スライドB 6枚目' },
];

/* =============================
   スライダー初期化関数
============================= */

/**
 * initSlider
 * @param {string} wrapId    - slider-wrap の id
 * @param {string} trackId   - slider-track の id
 * @param {string} dotsId    - slider-dots の id
 * @param {Array}  images    - { src, alt } の配列
 */
function initSlider(wrapId, trackId, dotsId, images) {
  const wrap  = document.getElementById(wrapId);
  const track = document.getElementById(trackId);
  const dotsEl = document.getElementById(dotsId);

  if (!wrap || !track || !dotsEl) return;

  const total = images.length;
  if (total === 0) return;

  // --- スライド生成（前後にクローン追加） ---
  // 構成: [clone of last] [0] [1] ... [total-1] [clone of first]
  const allImages = [
    images[total - 1],
    ...images,
    images[0],
  ];

  allImages.forEach((img) => {
    const item = document.createElement('div');
    item.className = 'slide-item';

    const picture = document.createElement('img');
    picture.src = img.src;
    picture.alt = img.alt;
    picture.className = 'slide-item-img';

    item.appendChild(picture);
    track.appendChild(item);
  });

  // --- ドット生成 ---
  for (let i = 0; i < total; i++) {
    const dot = document.createElement('div');
    dot.className = 'dot' + (i === 0 ? ' is-active' : '');
    dot.addEventListener('click', () => goTo(i));
    dotsEl.appendChild(dot);
  }

  // --- 状態管理 ---
  let currentIndex = 0; // 実データの index（0 〜 total-1）
  const SWIPE_THRESHOLD = 0.2; // スワイプ閾値 20%

  // --- トラック移動（アニメーションあり） ---
  function moveToReal(index, animate = true) {
    const trackIndex = index + 1; // クローン分オフセット
    if (animate) {
      track.style.transition = `transform var(--slider-transition)`;
    } else {
      track.style.transition = 'none';
    }
    track.style.transform = `translateX(-${trackIndex * 100}%)`;
  }

  // --- ドット更新 ---
  function updateDots(index) {
    const dots = dotsEl.querySelectorAll('.dot');
    dots.forEach((d, i) => {
      d.classList.toggle('is-active', i === index);
    });
  }

  // --- 指定インデックスへ移動 ---
  function goTo(index) {
    currentIndex = index;
    moveToReal(currentIndex, true);
    updateDots(currentIndex);
  }

  // --- 次へ ---
  function next() {
    currentIndex++;
    moveToReal(currentIndex, true);
    updateDots(currentIndex < total ? currentIndex : 0);
  }

  // --- 前へ ---
  function prev() {
    currentIndex--;
    moveToReal(currentIndex, true);
    updateDots(currentIndex >= 0 ? currentIndex : total - 1);
  }

  // --- トランジション終了後のループ瞬間移動 ---
  track.addEventListener('transitionend', () => {
    if (currentIndex >= total) {
      currentIndex = 0;
      moveToReal(currentIndex, false);
    } else if (currentIndex < 0) {
      currentIndex = total - 1;
      moveToReal(currentIndex, false);
    }
  });

  // --- 初期位置セット ---
  moveToReal(0, false);

  // --- タッチイベント（wrapに付ける） ---
  let touchStartX = 0;
  let touchCurrentX = 0;
  let isDragging = false;
  let baseTranslate = 0;

  wrap.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchCurrentX = touchStartX;
    isDragging = true;
    baseTranslate = -((currentIndex + 1) * 100);
    track.style.transition = 'none';
  }, { passive: true });

  wrap.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    touchCurrentX = e.touches[0].clientX;
    const diff = touchCurrentX - touchStartX;
    const wrapWidth = wrap.offsetWidth;
    const diffPercent = (diff / wrapWidth) * 100;
    track.style.transform = `translateX(${baseTranslate + diffPercent}%)`;
  }, { passive: true });

  wrap.addEventListener('touchend', () => {
    if (!isDragging) return;
    isDragging = false;

    const diff = touchCurrentX - touchStartX;
    const wrapWidth = wrap.offsetWidth;
    const threshold = wrapWidth * SWIPE_THRESHOLD;

    if (diff < -threshold) {
      next();
    } else if (diff > threshold) {
      prev();
    } else {
      // 閾値未満はリセット
      moveToReal(currentIndex, true);
    }
  });

  // マウスドラッグ対応（PC確認用）
  let mouseStartX = 0;
  let isMouseDragging = false;

  wrap.addEventListener('mousedown', (e) => {
    mouseStartX = e.clientX;
    isMouseDragging = true;
    baseTranslate = -((currentIndex + 1) * 100);
    track.style.transition = 'none';
  });

  wrap.addEventListener('mousemove', (e) => {
    if (!isMouseDragging) return;
    const diff = e.clientX - mouseStartX;
    const wrapWidth = wrap.offsetWidth;
    const diffPercent = (diff / wrapWidth) * 100;
    track.style.transform = `translateX(${baseTranslate + diffPercent}%)`;
  });

  wrap.addEventListener('mouseup', (e) => {
    if (!isMouseDragging) return;
    isMouseDragging = false;

    const diff = e.clientX - mouseStartX;
    const wrapWidth = wrap.offsetWidth;
    const threshold = wrapWidth * SWIPE_THRESHOLD;

    if (diff < -threshold) {
      next();
    } else if (diff > threshold) {
      prev();
    } else {
      moveToReal(currentIndex, true);
    }
  });

  wrap.addEventListener('mouseleave', () => {
    if (isMouseDragging) {
      isMouseDragging = false;
      moveToReal(currentIndex, true);
    }
  });
}

/* =============================
   DOM読み込み後に初期化
============================= */
document.addEventListener('DOMContentLoaded', () => {
  initSlider('sliderA', 'sliderA-track', 'sliderA-dots', sliderAImages);
  initSlider('sliderB', 'sliderB-track', 'sliderB-dots', sliderBImages);
});
