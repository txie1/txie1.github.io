// Light/dark theme. Loaded in <head> so the theme is set before the page paints.
// Light by default until the visitor picks a theme with the toggle button.
// Easter egg (when the script tag has `data-sunset`): five clicks on the toggle switch, each within
// 2 minutes of the last, switch to a secret "sunset" theme (_sass/sunset.scss). A little pixel me
// (#buddy) pops out under the switch on each of those clicks: on the 2nd and 3rd she reacts to the
// mode ("Too bright.." / "Too dark..", like the figures hidden in the More page collages), on the
// 4th she asks for one more, on the 5th (unlock) she cheers, then she hides again. Sunset lasts only
// for the current visit (sessionStorage) and never replaces the saved light/dark choice; one more
// click leaves it.
(function () {
  var root = document.documentElement;
  var script = document.currentScript;
  var sunsetEnabled = !!(script && script.hasAttribute('data-sunset'));
  var SUNSET_CLICKS = 5;
  var CLICK_GAP_MS = 2 * 60 * 1000; // max pause between clicks that still counts towards sunset
  var MODE_LINES = { light: 'Too bright..', dark: 'Too dark..' }; // 2nd and 3rd click
  var LINES = { 4: 'one more?' };

  function saved() {
    try {
      var theme = localStorage.getItem('theme');
      return theme === 'light' || theme === 'dark' ? theme : null;
    } catch (e) {
      return null;
    }
  }

  function save(theme) {
    try {
      if (theme) localStorage.setItem('theme', theme);
      else localStorage.removeItem('theme');
    } catch (e) {}
  }

  function session(key, value) {
    try {
      if (value === undefined) return sessionStorage.getItem(key) === '1';
      if (value) sessionStorage.setItem(key, '1');
      else sessionStorage.removeItem(key);
    } catch (e) {
      return false;
    }
  }

  function sunsetOn() {
    return sunsetEnabled && session('sunset');
  }

  function regular() {
    return saved() || 'light';
  }

  function apply(theme) {
    root.setAttribute('data-theme', theme);
  }

  apply(sunsetOn() ? 'sunset' : regular());

  // The click streak is kept for the visit (sessionStorage), so it survives page reloads too:
  // someone can click, go look at the collage figures on the More page, and click again.
  var memoryStreak = { n: 0, last: 0, before: null };

  function loadStreak() {
    try {
      return JSON.parse(sessionStorage.getItem('sunset-streak')) || memoryStreak;
    } catch (e) {
      return memoryStreak;
    }
  }

  function storeStreak(streak) {
    memoryStreak = streak;
    try {
      sessionStorage.setItem('sunset-streak', JSON.stringify(streak));
    } catch (e) {}
  }

  var savedBeforeClicks = null;

  // Counts a click; returns how many clicks in a row so far (each within CLICK_GAP_MS of the last).
  function countClick(now) {
    var streak = loadStreak();
    if (now - streak.last > CLICK_GAP_MS) streak = { n: 0, last: 0, before: saved() };
    streak.n += 1;
    streak.last = now;
    storeStreak(streak);
    savedBeforeClicks = streak.before;
    return streak.n;
  }

  var buddy, bubble, sprite, hideTimer;

  // Shows her with a line in the given pose ('left' or 'jump'); she hides again after `ms`.
  function say(text, pose, ms) {
    if (!buddy) return;
    pose = pose || 'left';
    sprite.src = sprite.dataset[pose];
    buddy.classList.toggle('jump', pose === 'jump');
    bubble.textContent = text;
    sprite.classList.remove('hop');
    void sprite.offsetWidth; // reflow so the hop restarts
    sprite.classList.add('hop');
    buddy.classList.add('here');
    clearTimeout(hideTimer);
    hideTimer = setTimeout(hush, ms || 3500);
  }

  function hush() {
    clearTimeout(hideTimer);
    if (buddy) buddy.classList.remove('here');
  }

  document.addEventListener('DOMContentLoaded', function () {
    var button = document.getElementById('theme-toggle');
    if (!button) return;
    buddy = document.getElementById('buddy');
    if (buddy) {
      bubble = buddy.querySelector('.buddy-bubble');
      sprite = buddy.querySelector('.buddy-sprite');
    }
    button.addEventListener('click', function () {
      var current = root.getAttribute('data-theme');
      var n = sunsetEnabled ? countClick(Date.now()) : 0;
      if (n >= SUNSET_CLICKS) {
        storeStreak({ n: 0, last: 0, before: null });
        save(savedBeforeClicks); // the burst of clicks shouldn't change the saved light/dark choice
        session('sunset', true);
        apply('sunset');
        say("it's now sunset", 'jump');
        document.dispatchEvent(new Event('sunset:on')); // e.g. the profile photo turns pixel
      } else if (current === 'sunset') {
        session('sunset', false);
        apply(regular());
        hush();
      } else {
        var next = current === 'dark' ? 'light' : 'dark';
        apply(next);
        save(next);
        if (n === 2) document.dispatchEvent(new Event('sunset:near')); // e.g. fetch the pixel photo
        if (n >= 2) document.dispatchEvent(new CustomEvent('sunset:step', { detail: n })); // statistics
        if (n === 2 || n === 3) say(MODE_LINES[next]);
        else if (LINES[n]) say(LINES[n]);
      }
    });
  });
})();
