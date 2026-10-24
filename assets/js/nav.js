// Smooth page changes: the Home / More menu links fetch the other page and swap in only its main
// content (<section>), so the sidebar (photo, name, links) stays put instead of reloading.
// Back/forward work through the browser history; any error falls back to a normal page load.
// Page scripts that set up content (news box, magnifier) listen for the `page:load` event.
(function () {
  if (!window.fetch || !window.DOMParser || !history.pushState) return;
  var section = document.querySelector('section');
  if (!section) return;
  var currentPath = location.pathname;
  history.scrollRestoration = 'manual';

  function markActive(path) {
    document.querySelectorAll('.site-nav a').forEach(function (link) {
      var on = new URL(link.href).pathname === path;
      link.classList.toggle('active', on);
      if (on) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
  }

  function load(url, push) {
    var path = new URL(url).pathname;
    section.classList.add('swapping');
    fetch(url, { credentials: 'same-origin' })
      .then(function (response) {
        if (!response.ok) throw new Error(response.status);
        return response.text();
      })
      .then(function (html) {
        var page = new DOMParser().parseFromString(html, 'text/html');
        var next = page.querySelector('section');
        if (!next) throw new Error('no content');
        section.innerHTML = next.innerHTML;
        document.title = page.title;
        var canonical = document.querySelector('link[rel="canonical"]');
        var nextCanonical = page.querySelector('link[rel="canonical"]');
        if (canonical && nextCanonical) canonical.href = nextCanonical.href;
        if (push) history.pushState(null, '', url);
        currentPath = path;
        markActive(path);
        window.scrollTo(0, 0);
        section.classList.remove('swapping');
        document.dispatchEvent(new Event('page:load'));
      })
      .catch(function () {
        location.href = url;
      });
  }

  document.addEventListener('click', function (e) {
    var link = e.target.closest('.site-nav a');
    if (!link || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var url = new URL(link.href, location.href);
    if (url.origin !== location.origin) return;
    e.preventDefault();
    if (url.pathname !== currentPath) load(url.href, true);
  });

  window.addEventListener('popstate', function () {
    if (location.pathname !== currentPath) load(location.href, false); // same page = just a #section jump
  });
})();
