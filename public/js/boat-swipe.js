/* Touch-swipe for boat image carousels + swipe indicator */
(function() {
  var SWIPE_THRESHOLD = 40;

  function getSlides(carousel) {
    return carousel.querySelectorAll('.boat-slide');
  }

  function getCurrent(slides) {
    var idx = 0;
    slides.forEach(function(s, i) {
      if (s.style.opacity === '1' || s.classList.contains('opacity-100')) idx = i;
    });
    return idx;
  }

  function navigate(carousel, dir) {
    var slides = getSlides(carousel);
    if (slides.length < 2) return;
    var current = getCurrent(slides);
    slides[current].style.opacity = '0';
    slides[current].classList.remove('opacity-100');
    var next = (current + dir + slides.length) % slides.length;
    slides[next].style.opacity = '1';
  }

  function initSwipe() {
    var carousels = document.querySelectorAll('.boat-carousel');
    carousels.forEach(function(carousel) {
      var startX = 0;
      var startY = 0;
      var tracking = false;

      carousel.addEventListener('touchstart', function(e) {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        tracking = true;
      }, { passive: true });

      carousel.addEventListener('touchmove', function(e) {
        if (!tracking) return;
        var dx = e.touches[0].clientX - startX;
        var dy = e.touches[0].clientY - startY;
        // If horizontal swipe is dominant, prevent vertical scroll
        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10) {
          e.preventDefault();
        }
      }, { passive: false });

      carousel.addEventListener('touchend', function(e) {
        if (!tracking) return;
        tracking = false;
        var dx = e.changedTouches[0].clientX - startX;
        if (Math.abs(dx) < SWIPE_THRESHOLD) return;
        // Swipe left → next image (dir +1), swipe right → prev (dir -1)
        navigate(carousel, dx < 0 ? 1 : -1);
        // Hide swipe hint after first swipe
        var hint = carousel.parentElement.querySelector('.swipe-hint');
        if (hint) hint.style.opacity = '0';
      });
    });
  }

  // Swipe indicator — only on touch devices
  function addSwipeHints() {
    if (!('ontouchstart' in window)) return;
    var wraps = document.querySelectorAll('.boat-carousel');
    wraps.forEach(function(carousel) {
      var slides = getSlides(carousel);
      if (slides.length < 2) return;
      var parent = carousel.parentElement;
      if (parent.querySelector('.swipe-hint')) return;

      var hint = document.createElement('div');
      hint.className = 'swipe-hint';
      hint.setAttribute('aria-hidden', 'true');
      hint.innerHTML =
        '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' +
          '<polyline points="9 18 15 12 9 6"></polyline>' +
        '</svg>';
      Object.assign(hint.style, {
        position: 'absolute',
        right: '12px',
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: '15',
        background: 'rgba(0,0,0,0.30)',
        borderRadius: '50%',
        width: '42px',
        height: '42px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: '1',
        transition: 'opacity 0.5s',
        pointerEvents: 'none',
        animation: 'swipeHintPulse 2s ease-in-out infinite'
      });
      parent.style.position = 'relative';
      parent.appendChild(hint);
    });
  }

  // Add the pulse animation
  var style = document.createElement('style');
  style.textContent =
    '@keyframes swipeHintPulse {' +
      '0%, 100% { transform: translateY(-50%) translateX(0); opacity: 0.8; }' +
      '50% { transform: translateY(-50%) translateX(-6px); opacity: 1; }' +
    '}' +
    '@media (min-width: 1024px) { .swipe-hint { display: none !important; } }';
  document.head.appendChild(style);

  // Init on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { initSwipe(); addSwipeHints(); });
  } else {
    initSwipe();
    addSwipeHints();
  }
})();
