// Collage magnifier: a round loupe follows the mouse over `figure.magnify` images and shows
// the part under the pointer enlarged ZOOM times. Mouse only; touch screens keep tap-to-open.
// Hidden walkers (Easter egg hint): a figure's `data-eggs` lists little pixel figures that exist
// only inside the loupe. Each walks from `from` to `to` (feet position, in the photo's own pixels,
// `h` tall) and, while it's under the loupe, says its line for the current mode (`say.light`,
// `say.dark`, `say.sunset`) in a pixel bubble. The mode is the time of day inside the loupe:
// daylight, night (blue tint) or sunset (golden tint, and the walkers stop to hop for joy).
// Set up again on `page:load` (content swapped in by assets/js/nav.js).
(function () {
  var ZOOM = 1.4; // gentle: enough to see each small photo in a collage
  var WALK_MS = 7000; // one trip along the path
  var REST_MS = 1200; // pause before the walk starts over
  var STEP_MS = 260; // pixel-style bob: up/down every step
  var HOP_MS = 520; // sunset: one hop
  var TINTS = { // laid over the photo, under the walkers
    dark: 'linear-gradient(rgba(10, 20, 60, 0.5), rgba(10, 20, 60, 0.5))',
    sunset: 'linear-gradient(rgba(255, 170, 90, 0.3), rgba(255, 110, 80, 0.22))'
  };
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  function loadEggs(figure) {
    var eggs = [];
    try {
      eggs = JSON.parse(figure.dataset.eggs || '[]');
    } catch (e) {}
    eggs.forEach(function (egg) {
      egg.sprite = new Image();
      egg.sprite.src = egg.src;
    });
    return eggs;
  }

  function mode() {
    var theme = document.documentElement.getAttribute('data-theme');
    return theme === 'dark' || theme === 'sunset' ? theme : 'light';
  }

  // Where an egg's feet are at time t (photo pixels), or null while it rests between walks.
  // At sunset it stands halfway along its path and hops.
  function eggAt(egg, t, now) {
    if (now === 'sunset') {
      var p2 = (t % HOP_MS) / HOP_MS;
      return {
        x: (egg.from[0] + egg.to[0]) / 2,
        y: (egg.from[1] + egg.to[1]) / 2 - Math.sin(Math.PI * p2) * egg.h * 0.18
      };
    }
    var phase = t % (WALK_MS + REST_MS);
    if (phase > WALK_MS) return null;
    var p = phase / WALK_MS;
    var bob = Math.floor(t / STEP_MS) % 2 ? egg.h * 0.03 : 0;
    return {
      x: egg.from[0] + (egg.to[0] - egg.from[0]) * p,
      y: egg.from[1] + (egg.to[1] - egg.from[1]) * p - bob
    };
  }

  function attach(figure) {
    var img = figure.querySelector('img');
    if (!img || figure.querySelector('.loupe')) return;
    var loupe = document.createElement('div');
    loupe.className = 'loupe';
    loupe.setAttribute('aria-hidden', 'true');
    figure.appendChild(loupe);

    var eggs = loadEggs(figure);
    var bubble = null;
    if (eggs.length) {
      bubble = document.createElement('p');
      bubble.className = 'pixel-bubble tail-down egg-bubble';
      bubble.setAttribute('aria-hidden', 'true');
      figure.appendChild(bubble);
    }

    var pointer = null; // last mouse position inside the image, in display pixels
    var frame = 0;

    function render() {
      frame = 0;
      if (!pointer) return;
      var box = img.getBoundingClientRect();
      var origin = figure.getBoundingClientRect();
      var x = pointer.x, y = pointer.y;
      var inner = loupe.clientWidth / 2; // centre of the area inside the border
      var scale = box.width / img.naturalWidth; // photo pixels -> display pixels
      var now = performance.now();
      var current = mode();
      var layers = [], sizes = [], positions = [];
      var found = null;

      eggs.forEach(function (egg) {
        var at = eggAt(egg, now, current);
        if (!at || !egg.sprite.naturalWidth) return;
        var h = egg.h * scale, w = h * egg.sprite.naturalWidth / egg.sprite.naturalHeight;
        var left = at.x * scale - w / 2, top = at.y * scale - h;
        layers.push('url("' + egg.src + '")');
        sizes.push(w * ZOOM + 'px ' + h * ZOOM + 'px');
        positions.push(inner + (left - x) * ZOOM + 'px ' + (inner + (top - y) * ZOOM) + 'px');
        // spotted: its middle is well inside the loupe's view
        var dx = (at.x * scale - x) * ZOOM, dy = (at.y * scale - h / 2 - y) * ZOOM;
        if (Math.sqrt(dx * dx + dy * dy) < inner * 0.7) found = egg;
      });

      if (eggs.length && TINTS[current]) {
        layers.push(TINTS[current]);
        sizes.push('auto');
        positions.push('0 0');
      }
      layers.push('url("' + (img.currentSrc || img.src) + '")');
      sizes.push(box.width * ZOOM + 'px ' + box.height * ZOOM + 'px');
      positions.push(inner - x * ZOOM + 'px ' + (inner - y * ZOOM) + 'px');
      loupe.style.backgroundImage = layers.join(', ');
      loupe.style.backgroundSize = sizes.join(', ');
      loupe.style.backgroundPosition = positions.join(', ');
      loupe.style.left = box.left - origin.left + x - loupe.offsetWidth / 2 + 'px';
      loupe.style.top = box.top - origin.top + y - loupe.offsetHeight / 2 + 'px';
      loupe.classList.add('on');

      if (bubble) {
        if (found) {
          bubble.textContent = typeof found.say === 'string' ? found.say : found.say[current];
          bubble.style.left = box.left - origin.left + x + 'px';
          bubble.style.top = box.top - origin.top + y - loupe.offsetHeight / 2 + 'px';
        }
        bubble.classList.toggle('on', !!found);
      }
      if (eggs.length) frame = requestAnimationFrame(render); // keep the walkers walking
    }

    figure.addEventListener('mousemove', function (e) {
      var box = img.getBoundingClientRect();
      var x = e.clientX - box.left;
      var y = e.clientY - box.top;
      if (x < 0 || y < 0 || x > box.width || y > box.height) {
        hide();
        return;
      }
      pointer = { x: x, y: y };
      if (!frame) frame = requestAnimationFrame(render);
    });

    function hide() {
      pointer = null;
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      loupe.classList.remove('on');
      if (bubble) bubble.classList.remove('on');
    }

    figure.addEventListener('mouseleave', hide);
  }

  function init() {
    document.querySelectorAll('figure.magnify').forEach(attach);
  }

  init();
  document.addEventListener('page:load', init);
})();
