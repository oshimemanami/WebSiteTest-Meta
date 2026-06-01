/* =============================
   スライダー設定
============================= */

// スライダーAの画像リスト（jpgからpngへ）
const sliderAImages = [
  { src: 'images/slideA-01.png', alt: 'スライドA 1枚目' },
  { src: 'images/slideA-02.png', alt: 'スライドA 2枚目' },
  { src: 'images/slideA-03.png', alt: 'スライドA 3枚目' },
  { src: 'images/slideA-04.png', alt: 'スライドA 4枚目' },
  { src: 'images/slideA-05.png', alt: 'スライドA 5枚目' },
  { src: 'images/slideA-06.png', alt: 'スライドA 6枚目' },
  { src: 'images/slideA-07.png', alt: 'スライドA 7枚目' },
  { src: 'images/slideA-08.png', alt: 'スライドA 8枚目' },
];

// スライダーBの画像リスト（jpgからpngへ）
const sliderBImages = [
  { src: 'images/slideB-01.png', alt: 'スライドB 1枚目' },
  { src: 'images/slideB-02.png', alt: 'スライドB 2枚目' },
  { src: 'images/slideB-03.png', alt: 'スライドB 3枚目' },
  { src: 'images/slideB-04.png', alt: 'スライドB 4枚目' },
  { src: 'images/slideB-05.png', alt: 'スライドB 5枚目' },
  { src: 'images/slideB-06.png', alt: 'スライドB 6枚目' },
];

/* =============================
   スライダー初期化関数
============================= */
function initSlider(wrapId, trackId, dotsId, prevBtnId, nextBtnId, images) {
  const wrap    = document.getElementById(wrapId);
  const track   = document.getElementById(trackId);
  const dotsEl  = document.getElementById(dotsId);
  const prevBtn = document.getElementById(prevBtnId);
  const nextBtn = document.getElementById(nextBtnId);

  if (!wrap || !track || !dotsEl) return;

  const total = images.length;
  if (total === 0) return;

  // クローンループ構成: [last clone] [0..n-1] [first clone]
  const allImages = [images[total - 1], ...images, images[0]];

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

  // ドット生成
  for (let i = 0; i < total; i++) {
    const dot = document.createElement('div');
    dot.className = 'dot' + (i === 0 ? ' is-active' : '');
    dot.addEventListener('click', () => goTo(i));
    dotsEl.appendChild(dot);
  }

  let currentIndex = 0;
  const SWIPE_THRESHOLD = 0.2;

  function moveToReal(index, animate = true) {
    const trackIndex = index + 1;
    track.style.transition = animate ? 'transform var(--slider-transition)' : 'none';
    track.style.transform = `translateX(-${trackIndex * 100}%)`;
  }

  function updateDots(index) {
    dotsEl.querySelectorAll('.dot').forEach((d, i) => {
      d.classList.toggle('is-active', i === index);
    });
  }

  function goTo(index) {
    currentIndex = index;
    moveToReal(currentIndex, true);
    updateDots(currentIndex);
  }

  function next() {
    currentIndex++;
    moveToReal(currentIndex, true);
    updateDots(currentIndex < total ? currentIndex : 0);
  }

  function prev() {
    currentIndex--;
    moveToReal(currentIndex, true);
    updateDots(currentIndex >= 0 ? currentIndex : total - 1);
  }

  track.addEventListener('transitionend', () => {
    if (currentIndex >= total) {
      currentIndex = 0;
      moveToReal(currentIndex, false);
    } else if (currentIndex < 0) {
      currentIndex = total - 1;
      moveToReal(currentIndex, false);
    }
  });

  moveToReal(0, false);

  // 前後ボタン
  if (prevBtn) prevBtn.addEventListener('click', prev);
  if (nextBtn) nextBtn.addEventListener('click', next);

  // タッチイベント（wrapに付ける）
  let touchStartX = 0, touchCurrentX = 0, isDragging = false, baseTranslate = 0;

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
    const diffPercent = ((touchCurrentX - touchStartX) / wrap.offsetWidth) * 100;
    track.style.transform = `translateX(${baseTranslate + diffPercent}%)`;
  }, { passive: true });

  wrap.addEventListener('touchend', () => {
    if (!isDragging) return;
    isDragging = false;
    const diff = touchCurrentX - touchStartX;
    const threshold = wrap.offsetWidth * SWIPE_THRESHOLD;
    if (diff < -threshold) next();
    else if (diff > threshold) prev();
    else moveToReal(currentIndex, true);
  });

  // マウスドラッグ（PC確認用）
  let mouseStartX = 0, isMouseDragging = false;

  wrap.addEventListener('mousedown', (e) => {
    mouseStartX = e.clientX;
    isMouseDragging = true;
    baseTranslate = -((currentIndex + 1) * 100);
    track.style.transition = 'none';
  });

  wrap.addEventListener('mousemove', (e) => {
    if (!isMouseDragging) return;
    const diffPercent = ((e.clientX - mouseStartX) / wrap.offsetWidth) * 100;
    track.style.transform = `translateX(${baseTranslate + diffPercent}%)`;
  });

  wrap.addEventListener('mouseup', (e) => {
    if (!isMouseDragging) return;
    isMouseDragging = false;
    const diff = e.clientX - mouseStartX;
    const threshold = wrap.offsetWidth * SWIPE_THRESHOLD;
    if (diff < -threshold) next();
    else if (diff > threshold) prev();
    else moveToReal(currentIndex, true);
  });

  wrap.addEventListener('mouseleave', () => {
    if (isMouseDragging) {
      isMouseDragging = false;
      moveToReal(currentIndex, true);
    }
  });
}

/* =============================
   価格表モーダル開閉
============================= */
function openKakakuModal() {
  const overlay = document.getElementById('kakakuOverlay');
  const sheet   = document.getElementById('kakakuSheet');
  if (!overlay || !sheet) return;
  overlay.style.display = 'block';
  document.body.classList.add('kakaku-open');
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      overlay.classList.add('is-active');
      sheet.classList.add('is-active');
    });
  });
}

function closeKakakuModal() {
  const overlay = document.getElementById('kakakuOverlay');
  const sheet   = document.getElementById('kakakuSheet');
  if (!overlay || !sheet) return;
  overlay.classList.remove('is-active');
  sheet.classList.remove('is-active');
  document.body.classList.remove('kakaku-open');
  setTimeout(() => { overlay.style.display = 'none'; }, 400);
}

function initKakakuModal() {
  const overlay  = document.getElementById('kakakuOverlay');
  const closeBtn = document.getElementById('kakakuClose');

  // 価格表を開くボタン（複数箇所）
  ['btnKakaku04b', 'btnKakaku06b', 'btnKakaku14b'].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) btn.addEventListener('click', (e) => {
      e.preventDefault();
      openKakakuModal();
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', closeKakakuModal);
  if (overlay)  overlay.addEventListener('click', closeKakakuModal);
}

/* =============================
   FAQ アコーディオン（meta_13a/b）
============================= */
function initFaqAccordion() {
  const question = document.getElementById('faqQuestion');
  const answer   = document.getElementById('faqAnswer');
  const arrow    = document.getElementById('faqArrow');
  const qImg     = document.getElementById('meta13aImg');
  if (!question || !answer) return;

  question.addEventListener('click', () => {
    const isOpen = answer.classList.contains('is-open');

    if (!isOpen) {
      // 開く：実際の高さを測ってheightをセット
      answer.classList.add('is-open');
      answer.style.height = '0px';
      // 一瞬待ってからheightをscrollHeightに
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          answer.style.height = answer.scrollHeight + 'px';
          answer.style.opacity = '1';
        });
      });
      if (arrow) arrow.classList.add('is-open');
      if (qImg) { qImg.classList.remove('sp-150'); qImg.classList.add('sp-10'); }
    } else {
      // 閉じる：現在の高さから0へ逆再生
      answer.style.height = answer.scrollHeight + 'px';
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          answer.style.height = '0px';
          answer.style.opacity = '0';
        });
      });
      answer.classList.remove('is-open');
      if (arrow) arrow.classList.remove('is-open');
      if (qImg) { qImg.classList.remove('sp-10'); qImg.classList.add('sp-150'); }
    }
  });
}

/* =============================
   固定フッター スクロールリンク
============================= */
function initFooterNav() {
  const footerImg = document.getElementById('footerImg');
  if (!footerImg) return;

  // 画像読み込み後にエリア座標を計算
  function setupMap() {
    const w = footerImg.offsetWidth;
    const h = footerImg.offsetHeight;
    const q = Math.floor(w / 4); // 4分割

    document.getElementById('areaCorner').coords  = `${q * 0},0,${q * 1},${h}`;
    document.getElementById('areaFinish').coords  = `${q * 1},0,${q * 2},${h}`;
    document.getElementById('areaCase').coords    = `${q * 2},0,${q * 3},${h}`;
    document.getElementById('areaContact').coords = `${q * 3},0,${q * 4},${h}`;
  }

  if (footerImg.complete) setupMap();
  else footerImg.addEventListener('load', setupMap);
  window.addEventListener('resize', setupMap);

  // スムーススクロール（mapエリア）
  document.querySelectorAll('map area[href^="#"]').forEach(area => {
    area.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(area.getAttribute('href'));
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  });

  // iOS Safari対応：画像タップ位置からエリアを判定してスクロール
  footerImg.addEventListener('click', (e) => {
    const rect = footerImg.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const w = footerImg.offsetWidth;
    const q = w / 4;
    let targetId;
    if      (x < q)     targetId = '#section-meta06';
    else if (x < q * 2) targetId = '#section-meta08';
    else if (x < q * 3) targetId = '#section-meta09';
    else                targetId = null;
    if (targetId) {
      e.preventDefault();
      const target = document.querySelector(targetId);
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    }
  });
}

/* =============================
   DOM読み込み後に初期化
============================= */
document.addEventListener('DOMContentLoaded', () => {
  initSlider('sliderA', 'sliderA-track', 'sliderA-dots', 'sliderA-prev', 'sliderA-next', sliderAImages);
  initSlider('sliderB', 'sliderB-track', 'sliderB-dots', 'sliderB-prev', 'sliderB-next', sliderBImages);
  initKakakuModal();
  initFaqAccordion();
  initFooterNav();
});
