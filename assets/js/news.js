// News box: show the first `data-visible` items and let the rest scroll.
// The height is measured (not fixed in CSS) so it stays right when items wrap on narrow screens.
// A sliver of the next item peeks in under a fade, so it is clear the box scrolls.
// Set up again on `page:load` (content swapped in by assets/js/nav.js).
(function () {
  var PEEK = 14; // px, keep in sync with the fade in _sass/custom.scss
  var list = null;
  var visible = 0;

  function updateFade() {
    var more = list.scrollTop + list.clientHeight < list.scrollHeight - 2;
    list.classList.toggle('has-more', more);
  }

  function fit() {
    if (!list || !list.isConnected) return;
    var items = list.children;
    if (items.length <= visible) {
      list.style.maxHeight = 'none';
    } else {
      var last = items[visible - 1];
      var paddingTop = parseFloat(getComputedStyle(list).paddingTop) || 0;
      list.style.maxHeight = (last.offsetTop + last.offsetHeight - paddingTop + PEEK) + 'px';
    }
    updateFade();
  }

  function init() {
    list = document.querySelector('.news-list[data-visible]');
    if (!list) return;
    visible = parseInt(list.getAttribute('data-visible'), 10);
    list.addEventListener('scroll', updateFade);
    fit();
  }

  init();
  window.addEventListener('resize', fit);
  window.addEventListener('load', fit);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
  document.addEventListener('page:load', init);
})();
