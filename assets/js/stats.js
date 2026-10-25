// Visitor statistics with GoatCounter (privacy-friendly, no cookies; set `goatcounter` in _config.yml).
// GoatCounter's own script counts page views; this adds a few anonymous events, each counted at
// most once per visit:
//   paper/<paper id>/<pdf|code|dataset|project-page|title>  clicks on a paper's links
//   profile/<linkedin|scholar|github|...>                    clicks on the sidebar profile icons
//   news/<link text>                                         clicks on links in News
//   reached-publications                                     Selected Publications came into view
//                                                            (on a laptop it usually is right away)
//   reached-last-paper                                       scrolled down to the last paper
//   sunset-step-2, -3, -4, sunset-found                      how far a visit got towards sunset mode
//   sunset-found-after-walker                                found it after spotting a collage figure
//   walker-found/<street|stairs>                             spotted a hidden figure in the magnifier
//   pixel-photo-flip                                         flipped the profile photo after unlocking
// It also counts page changes made by assets/js/nav.js, which GoatCounter can't see on its own.
(function () {
  var pending = [];

  function send(data) {
    var gc = window.goatcounter;
    if (gc && gc.count) gc.count(data);
    else pending.push(data); // GoatCounter's script is still loading
  }

  window.addEventListener('load', function () {
    var queued = pending;
    pending = [];
    queued.forEach(send);
  });

  function flag(key, set) {
    try {
      if (set) sessionStorage.setItem(key, '1');
      return sessionStorage.getItem(key) === '1';
    } catch (e) {
      return false;
    }
  }

  function event(name) {
    if (flag('gc:' + name)) return; // already counted in this visit
    flag('gc:' + name, true);
    send({ path: name, title: name, event: true });
  }

  function slug(text) {
    return text.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  // Clicks (delegated, so it also covers content swapped in by nav.js)
  document.addEventListener('click', function (e) {
    var link = e.target.closest && e.target.closest('a');
    if (!link) return;
    var paper = link.closest('.publications li[id]');
    if (paper) {
      var kind = link.classList.contains('btn') ? slug(link.textContent) : link.closest('.title') ? 'title' : '';
      if (kind) event('paper/' + paper.id + '/' + kind);
    } else if (link.closest('.social-icons')) {
      var host = link.hostname;
      event('profile/' + (/linkedin/.test(host) ? 'linkedin' : /scholar/.test(host) ? 'scholar' : /github/.test(host) ? 'github' : host));
    } else if (link.closest('.news-list')) {
      event('news/' + slug(link.textContent));
    }
  }, true);

  // How far down did the visitor get?
  function watch(element, names) {
    if (!element || !window.IntersectionObserver) return;
    var observer = new IntersectionObserver(function (entries) {
      if (entries.some(function (entry) { return entry.isIntersecting; })) {
        names.forEach(event);
        observer.disconnect();
      }
    });
    observer.observe(element);
  }

  function watchPublications() {
    watch(document.getElementById('publications'), ['reached-publications']);
    var papers = document.querySelectorAll('.publications li[id]');
    // reaching the last paper implies passing the heading, even after a jump straight to the bottom
    watch(papers[papers.length - 1], ['reached-publications', 'reached-last-paper']);
  }

  watchPublications();

  // Page changes by assets/js/nav.js
  document.addEventListener('page:load', function () {
    send({ path: location.pathname, title: document.title });
    watchPublications();
  });

  // Easter egg
  document.addEventListener('sunset:step', function (e) {
    event('sunset-step-' + e.detail);
  });

  document.addEventListener('sunset:on', function () {
    event('sunset-found');
    if (flag('gc:walker-seen')) event('sunset-found-after-walker');
  });

  document.addEventListener('walker:found', function (e) {
    flag('gc:walker-seen', true);
    event('walker-found/' + e.detail);
  });

  document.addEventListener('avatar:flip', function () {
    event('pixel-photo-flip');
  });
})();
